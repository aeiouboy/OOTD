import { generateOutfits } from '@/lib/outfit-generator'
import type { Outfit, Product, FilterState } from '@/lib/types'

export async function fetchOutfits(
  products: Product[],
  filters?: FilterState,
  count: number = 50
): Promise<Outfit[]> {
  try {
    // Filter products by gender
    let filteredProducts = products
    if (filters?.gender && filters.gender !== 'all') {
      filteredProducts = products.filter(
        p => p.category?.toLowerCase() === filters.gender
      )
    }

    console.log('[OutfitService] Filtered products:', filteredProducts.length)
    console.log('[OutfitService] Filters:', filters)

    // Determine style from occasion filter
    const style = filters?.occasion?.[0] as any || 'any'

    // Generate outfits using Story 1.5 logic
    const outfits = generateOutfits(filteredProducts, {
      count,
      style,
      gender: filters?.gender !== 'all' ? filters?.gender : undefined,
      priceRange: filters?.priceRange
    })

    console.log('[OutfitService] Outfits generated:', outfits.length)
    console.log('[OutfitService] Sample outfit:', outfits[0])
    console.log('[OutfitService] All outfits have imageUrl:', outfits.every(o => o.imageUrl))

    return outfits
  } catch (error) {
    console.error('Failed to generate outfits:', error)
    throw new Error('Outfit generation failed')
  }
}

export async function loadProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products')
    if (!response.ok) {
      throw new Error('Failed to load products')
    }
    const data = await response.json()
    const products = data.products || []

    // Debug: Log product data flow
    console.log('[ProductService] Products loaded:', products.length)
    console.log('[ProductService] Sample product:', products[0])
    console.log('[ProductService] All products have imageUrl:', products.every((p: Product) => p.imageUrl))

    return products
  } catch (error) {
    console.error('Failed to load products:', error)
    throw new Error('Product loading failed')
  }
}
