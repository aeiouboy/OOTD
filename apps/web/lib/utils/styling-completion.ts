import type { Product } from '@/lib/types'
import type { ChatLookStyling } from '@/lib/types/chat-types'
import {
  DEFAULT_BAG_STYLING,
  DEFAULT_FOOTWEAR_STYLING,
  DEFAULT_JEWELRY_STYLING,
  FLAT_LAY_SUPPLEMENT_CONFIG,
  STYLING_COMPLETION_PROFILES,
} from '@/lib/config/styling-completion'

export interface TryOnPromptItem {
  name: string
  category: string
  color?: string
}

interface StylingCompletionParams {
  outfitTitle: string
  outfitDescription?: string
  catalogItems: Product[]
  stylingItems?: ChatLookStyling[]
}

const FOOTWEAR_PATTERN = /\b(footwear|shoe|shoes|sneaker|sneakers|heel|heels|sandal|sandals|loafer|loafers|boot|boots|pump|pumps|รองเท้า|คัชชู)\b/i
const GARMENT_PATTERN = /\b(dress|shirt|blouse|top|pants|trouser|skirt|jacket|blazer|coat|outerwear|jumpsuit|romper|playsuit|เสื้อ|เดรส|กางเกง|กระโปรง|แจ็กเก็ต|จั๊มสูท|จัมป์สูท|วันพีซ)\b/i
const ACCESSORY_PATTERN = /\b(accessory|bag|jewelry|earring|necklace|bracelet|ring|watch|hat|cap|belt|scarf|sunglasses|กระเป๋า|เครื่องประดับ|หมวก|เข็มขัด|ผ้าพันคอ|นาฬิกา)\b/i
const BAG_PATTERN = /\b(bag|handbag|clutch|tote|crossbody|กระเป๋า)\b/i
const JEWELRY_PATTERN = /\b(jewelry|earring|necklace|bracelet|ring|เครื่องประดับ)\b/i
const ONE_PIECE_PATTERN = /\b(dress|gown|one[\s-]?piece|เดรส|ชุดเดรส|ชุดแซก|แซก|jumpsuit|romper|playsuit|จั๊มสูท|จัมป์สูท|วันพีซ)\b/i
const OUTERWEAR_PATTERN = /\b(outerwear|jacket|blazer|coat|cardigan|แจ็กเก็ต|เสื้อคลุม)\b/i
const TOP_PATTERN = /\b(top|shirt|blouse|tee|t-shirt|เสื้อ)\b/i
const BOTTOM_PATTERN = /\b(bottom|pants|trouser|trousers|skirt|jeans|shorts|leggings|กางเกง|กระโปรง)\b/i
const ALTERNATIVE_CONNECTOR_PATTERN = /\s(?:or|หรือ|and\/or)\s|[\/|]/i

function hasFootwearText(value?: string): boolean {
  if (!value) return false
  return FOOTWEAR_PATTERN.test(value)
}

function hasGarmentText(value?: string): boolean {
  if (!value) return false
  return GARMENT_PATTERN.test(value)
}

function hasAccessoryText(value?: string): boolean {
  if (!value) return false
  return ACCESSORY_PATTERN.test(value)
}

function getProductText(item: Product): string {
  return `${item.subCategory || ''} ${item.category || ''} ${item.name || ''}`
}

function isOnePieceProduct(item: Product): boolean {
  return ONE_PIECE_PATTERN.test(getProductText(item))
}

function isOuterwearProduct(item: Product): boolean {
  return OUTERWEAR_PATTERN.test(getProductText(item))
}

function isTopProduct(item: Product): boolean {
  return TOP_PATTERN.test(getProductText(item))
}

function isBottomProduct(item: Product): boolean {
  return BOTTOM_PATTERN.test(getProductText(item))
}

function isFootwearStyling(item: ChatLookStyling): boolean {
  return hasFootwearText(item.category) || hasFootwearText(item.description)
}

function isAccessoryStyling(item: ChatLookStyling): boolean {
  return hasAccessoryText(item.category) || hasAccessoryText(item.description)
}

function isBagStyling(item: ChatLookStyling): boolean {
  return BAG_PATTERN.test(
    `${item.category || ''} ${item.description || ''}`
  )
}

function isJewelryStyling(item: ChatLookStyling): boolean {
  return JEWELRY_PATTERN.test(
    `${item.category || ''} ${item.description || ''}`
  )
}

function normalizeStylingDescription(description: string): string {
  const compact = description.replace(/\s+/g, ' ').trim()
  if (!compact) return compact

  // Keep only the first option when styling text suggests alternatives
  // (e.g., "heels or sandals", "รองเท้า A/รองเท้า B").
  const parts = compact.split(ALTERNATIVE_CONNECTOR_PATTERN).map((part) => part.trim()).filter(Boolean)
  return parts[0] || compact
}

function hasCatalogFootwear(items: Product[]): boolean {
  return items.some((item) =>
    hasFootwearText(item.subCategory) ||
    hasFootwearText(item.category) ||
    hasFootwearText(item.name)
  )
}

function hasCatalogBag(items: Product[]): boolean {
  return items.some((item) =>
    BAG_PATTERN.test(`${item.subCategory || ''} ${item.category || ''} ${item.name || ''}`)
  )
}

function hasCatalogJewelry(items: Product[]): boolean {
  return items.some((item) =>
    JEWELRY_PATTERN.test(`${item.subCategory || ''} ${item.category || ''} ${item.name || ''}`)
  )
}

/**
 * Select a coherent catalog subset for flat-lay generation.
 * Rules:
 * - Keep one silhouette per look (one-piece OR top+bottom)
 * - Never add outerwear on top of one-piece/partial silhouettes
 * - Keep at most one footwear, one bag, one jewelry, and one extra accessory
 */
export function selectCatalogFlatLayItems(catalogItems: Product[], maxItems = 5): Product[] {
  const selected: Product[] = []
  const onePieces: Product[] = []
  const outerwear: Product[] = []
  const tops: Product[] = []
  const bottoms: Product[] = []
  const otherGarments: Product[] = []
  const footwear: Product[] = []
  const bags: Product[] = []
  const jewelry: Product[] = []
  const otherAccessories: Product[] = []
  const uncategorized: Product[] = []

  for (const item of catalogItems) {
    const text = getProductText(item)
    const isGarment = hasGarmentText(text)
    const isFootwear = hasFootwearText(text)
    const isBag = BAG_PATTERN.test(text)
    const isJewelry = JEWELRY_PATTERN.test(text)
    const isAccessory = hasAccessoryText(text)

    if (isGarment) {
      if (isOnePieceProduct(item)) {
        onePieces.push(item)
      } else if (isOuterwearProduct(item)) {
        outerwear.push(item)
      } else if (isTopProduct(item)) {
        tops.push(item)
      } else if (isBottomProduct(item)) {
        bottoms.push(item)
      } else {
        otherGarments.push(item)
      }
      continue
    }

    if (isFootwear) {
      footwear.push(item)
      continue
    }

    if (isBag) {
      bags.push(item)
      continue
    }

    if (isJewelry) {
      jewelry.push(item)
      continue
    }

    if (isAccessory) {
      otherAccessories.push(item)
      continue
    }

    uncategorized.push(item)
  }

  const pushIfPossible = (item?: Product) => {
    if (!item || selected.length >= maxItems) return
    selected.push(item)
  }

  // Prefer one-piece silhouette whenever available, regardless of incoming order.
  // Guardrails:
  // - one-piece look: keep single garment, no outerwear
  // - top+bottom look: optional one outerwear layer
  // - partial/ambiguous garment look: no outerwear auto-injection
  if (onePieces.length > 0) {
    pushIfPossible(onePieces[0])
  } else {
    const hasTop = tops.length > 0
    const hasBottom = bottoms.length > 0
    pushIfPossible(tops[0])
    pushIfPossible(bottoms[0])

    if (!hasTop && !hasBottom) {
      pushIfPossible(otherGarments[0])
      if (otherGarments.length === 0) {
        pushIfPossible(outerwear[0])
      }
    } else if (hasTop && hasBottom) {
      pushIfPossible(outerwear[0])
    }
  }

  // Keep one item per supporting family to reduce model hallucination.
  pushIfPossible(footwear[0])
  pushIfPossible(bags[0])
  pushIfPossible(jewelry[0])
  pushIfPossible(otherAccessories[0])

  for (const item of uncategorized) {
    if (selected.length >= maxItems) break
    selected.push(item)
  }

  return selected
}

function hasStylingFootwear(items: ChatLookStyling[]): boolean {
  return items.some((item) => isFootwearStyling(item))
}

function hasStylingBag(items: ChatLookStyling[]): boolean {
  return items.some((item) => isBagStyling(item))
}

function hasStylingJewelry(items: ChatLookStyling[]): boolean {
  return items.some((item) => isJewelryStyling(item))
}

function getFootwearFallback(outfitTitle: string, outfitDescription?: string): ChatLookStyling {
  const context = `${outfitTitle} ${outfitDescription || ''}`.toLowerCase()
  const matched = STYLING_COMPLETION_PROFILES.find((profile) =>
    profile.keywords.some((keyword) => context.includes(keyword.toLowerCase()))
  )
  return matched?.footwear ?? DEFAULT_FOOTWEAR_STYLING
}

function getAccessoryFallbacks(outfitTitle: string, outfitDescription?: string): {
  bag: ChatLookStyling
  jewelry: ChatLookStyling
} {
  const context = `${outfitTitle} ${outfitDescription || ''}`.toLowerCase()
  const matched = STYLING_COMPLETION_PROFILES.find((profile) =>
    profile.keywords.some((keyword) => context.includes(keyword.toLowerCase()))
  )

  return {
    bag: matched?.bag ?? DEFAULT_BAG_STYLING,
    jewelry: matched?.jewelry ?? DEFAULT_JEWELRY_STYLING,
  }
}

export function ensureFootwearStyling({
  outfitTitle,
  outfitDescription,
  catalogItems,
  stylingItems = [],
}: StylingCompletionParams): ChatLookStyling[] {
  if (hasCatalogFootwear(catalogItems) || hasStylingFootwear(stylingItems)) {
    return stylingItems
  }

  return [...stylingItems, getFootwearFallback(outfitTitle, outfitDescription)]
}

function ensureAccessoryStyling({
  outfitTitle,
  outfitDescription,
  catalogItems,
  stylingItems = [],
}: StylingCompletionParams): ChatLookStyling[] {
  const result = [...stylingItems]
  const fallback = getAccessoryFallbacks(outfitTitle, outfitDescription)

  if (!hasCatalogBag(catalogItems) && !hasStylingBag(result)) {
    result.push(fallback.bag)
  }

  if (!hasCatalogJewelry(catalogItems) && !hasStylingJewelry(result)) {
    result.push(fallback.jewelry)
  }

  return result
}

export function buildTryOnPromptItems({
  outfitTitle,
  outfitDescription,
  catalogItems,
  stylingItems = [],
}: StylingCompletionParams): TryOnPromptItem[] {
  const baseItems: TryOnPromptItem[] = catalogItems.map((item) => ({
    name: item.name,
    category: item.category || item.subCategory || 'clothing',
    color: item.colors?.[0],
  }))

  if (hasCatalogFootwear(catalogItems)) {
    return baseItems
  }

  const completedStyling = ensureFootwearStyling({
    outfitTitle,
    outfitDescription,
    catalogItems,
    stylingItems,
  })

  const footwearStyling = completedStyling.find((item) =>
    hasFootwearText(item.category) || hasFootwearText(item.description)
  )

  if (!footwearStyling) {
    return baseItems
  }

  return [
    ...baseItems,
    {
      name: footwearStyling.description,
      category: 'footwear',
    },
  ]
}

/**
 * Keep only accessory-style styling items for flat-lay composition.
 * This prevents non-look garments from leaking into the flat-lay prompt.
 */
export function sanitizeFlatLayStylingItems(
  stylingItems: ChatLookStyling[] = []
): ChatLookStyling[] {
  return stylingItems
    .filter((item) => {
      const categoryText = item.category || ''
      const descriptionText = item.description || ''

      // Reject if it clearly looks like a garment item.
      if (hasGarmentText(categoryText) || hasGarmentText(descriptionText)) return false

      // Accept accessories and footwear by category or description.
      return (
        hasAccessoryText(categoryText) ||
        hasAccessoryText(descriptionText) ||
        hasFootwearText(categoryText) ||
        hasFootwearText(descriptionText)
      )
    })
    .map((item) => ({
      ...item,
      description: normalizeStylingDescription(item.description || ''),
    }))
    .filter((item) => Boolean(item.description))
}

/**
 * Select flat-lay supplements with strict scope:
 * - Keep only footwear + accessory additions
 * - Never add extra garments from styling text
 * - Prioritize bag-like accessories for total-look completeness
 */
export function selectFlatLaySupplements({
  outfitTitle,
  outfitDescription,
  catalogItems,
  stylingItems = [],
}: StylingCompletionParams): ChatLookStyling[] {
  const catalogHasFootwear = hasCatalogFootwear(catalogItems)
  const catalogHasBag = hasCatalogBag(catalogItems)
  const catalogHasJewelry = hasCatalogJewelry(catalogItems)

  const sanitizedStylingItems = sanitizeFlatLayStylingItems(stylingItems)
  const completedStylingItems = ensureFootwearStyling({
    outfitTitle,
    outfitDescription,
    catalogItems,
    stylingItems: sanitizedStylingItems,
  })
  const completedTotalLookItems = ensureAccessoryStyling({
    outfitTitle,
    outfitDescription,
    catalogItems,
    stylingItems: completedStylingItems,
  })

  const footwear = catalogHasFootwear
    ? []
    : completedTotalLookItems
      .filter((item) => isFootwearStyling(item))
      .slice(0, FLAT_LAY_SUPPLEMENT_CONFIG.maxFootwear)

  const accessoryCandidates = completedTotalLookItems.filter(
    (item) => !isFootwearStyling(item) && isAccessoryStyling(item)
  )
  const bags = catalogHasBag ? [] : accessoryCandidates.filter((item) => isBagStyling(item))
  const otherAccessories = accessoryCandidates.filter((item) => !isBagStyling(item))

  const jewelries = catalogHasJewelry ? [] : accessoryCandidates.filter((item) => isJewelryStyling(item))
  const otherAccessoryNonJewelry = otherAccessories.filter((item) => !isJewelryStyling(item))

  const accessories = [
    ...bags.slice(0, 1),
    ...jewelries.slice(0, 1),
    ...otherAccessoryNonJewelry,
  ]
    .slice(0, FLAT_LAY_SUPPLEMENT_CONFIG.maxAccessory)

  return [...footwear, ...accessories].slice(0, FLAT_LAY_SUPPLEMENT_CONFIG.maxTotal)
}
