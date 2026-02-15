import type { Product } from '@/lib/types'
import type { ChatLookStyling } from '@/lib/types/chat-types'
import {
  DEFAULT_FOOTWEAR_STYLING,
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

const FOOTWEAR_PATTERN = /\b(shoe|shoes|sneaker|sneakers|heel|heels|sandal|sandals|loafer|loafers|boot|boots|รองเท้า|คัชชู)\b/i

function hasFootwearText(value?: string): boolean {
  if (!value) return false
  return FOOTWEAR_PATTERN.test(value)
}

function hasCatalogFootwear(items: Product[]): boolean {
  return items.some((item) =>
    hasFootwearText(item.subCategory) ||
    hasFootwearText(item.category) ||
    hasFootwearText(item.name)
  )
}

function hasStylingFootwear(items: ChatLookStyling[]): boolean {
  return items.some((item) =>
    hasFootwearText(item.category) || hasFootwearText(item.description)
  )
}

function getFootwearFallback(outfitTitle: string, outfitDescription?: string): ChatLookStyling {
  const context = `${outfitTitle} ${outfitDescription || ''}`.toLowerCase()
  const matched = STYLING_COMPLETION_PROFILES.find((profile) =>
    profile.keywords.some((keyword) => context.includes(keyword.toLowerCase()))
  )
  return matched?.footwear ?? DEFAULT_FOOTWEAR_STYLING
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
