import type { Outfit, Product } from '@/lib/types'
import type { ChatLook, ChatLookItem } from '@/lib/types/chat-types'

function mapLookItemToProduct(item: ChatLookItem): Product {
  return {
    sku: item.sku || '',
    name: item.name || '',
    brand: item.brand || '',
    price: item.price || 0,
    imageUrl: item.imageUrl || '',
    availability: 'in_stock',
    onlineUrl: item.url || '',
    category: item.category || '',
    subCategory: item.category || '',
    visualDescription: item.description || '',
    colors: Array.isArray(item.colors) && item.colors.length > 0
      ? item.colors
      : (item.color ? [item.color] : []),
  }
}

/**
 * Converts v5 look payload into legacy Outfit[] used by the chat UI.
 */
export function convertLooksToOutfits(looks: ChatLook[], responseId = Date.now()): Outfit[] {
  return looks.map((look, index) => {
    const items = (look.items || []).map(mapLookItemToProduct)
    const computedTotalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0)

    return {
      id: `look-${responseId}-${look.lookNumber || index + 1}`,
      title: look.styleName || `Look ${look.lookNumber || index + 1}`,
      description: look.tip || '',
      totalPrice: typeof look.totalPrice === 'number' ? look.totalPrice : computedTotalPrice,
      items,
      imageUrl: look.imageUrl,
      stylingItems: look.stylingItems || [],
    }
  })
}

/**
 * Merges two product arrays by SKU while preserving first-seen order.
 * Products without SKU are appended (not deduplicated) to avoid accidental drops.
 */
export function mergeProductsBySku(existing: Product[], incoming: Product[]): Product[] {
  if (incoming.length === 0) return existing

  const merged = [...existing]
  const seen = new Set(existing.filter((product) => Boolean(product.sku)).map((product) => product.sku))

  for (const product of incoming) {
    if (!product.sku) {
      merged.push(product)
      continue
    }
    if (!seen.has(product.sku)) {
      seen.add(product.sku)
      merged.push(product)
    }
  }

  return merged
}
