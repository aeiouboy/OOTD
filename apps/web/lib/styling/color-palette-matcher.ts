/**
 * Color Palette Matching Utility
 *
 * Provides color detection and matching functionality based on
 * Pinterest 2026 trending color palettes
 */

import type { Product } from '../types'
import {
  COLOR_PALETTES,
  ColorPalette,
  getNeutralEarthTones,
  getColorPaletteKeywords,
} from './pinterest-2026-trends'

// ============================================================================
// Color Detection
// ============================================================================

/**
 * Extract color keywords from product name and description
 */
export function detectProductColor(product: Product): string[] {
  const text = `${product.name} ${product.visualDescription || ''}`.toLowerCase()
  const colors: string[] = []

  // Check against all known color palette keywords
  const allColorKeywords = new Set<string>()
  Object.values(COLOR_PALETTES).forEach(palette => {
    palette.forEach(color => allColorKeywords.add(color.toLowerCase()))
  })

  // Add common color names
  const commonColors = [
    'white', 'black', 'gray', 'grey', 'beige', 'brown', 'red', 'pink',
    'orange', 'yellow', 'green', 'blue', 'navy', 'purple', 'gold', 'silver',
    'olive', 'taupe', 'cream', 'tan', 'khaki', 'sand', 'camel', 'chocolate',
    'mocha', 'ivory', 'charcoal', 'denim', 'forest'
  ]

  commonColors.forEach(color => allColorKeywords.add(color))

  // Also check product colors array if available
  if (product.colors && Array.isArray(product.colors)) {
    product.colors.forEach(color => {
      const lowerColor = color.toLowerCase()
      colors.push(lowerColor)
      allColorKeywords.add(lowerColor)
    })
  }

  // Detect colors from text
  allColorKeywords.forEach(colorKeyword => {
    // Use word boundary matching to avoid false positives
    const regex = new RegExp(`\\b${colorKeyword}\\b`, 'i')
    if (regex.test(text) && !colors.includes(colorKeyword)) {
      colors.push(colorKeyword)
    }
  })

  return colors
}

/**
 * Determine which trending palette the colors belong to
 */
export function getPaletteCompatibility(colors: string[]): ColorPalette | null {
  if (colors.length === 0) return null

  const lowerColors = colors.map(c => c.toLowerCase())

  // Check each palette for matches
  const paletteMatches: { palette: ColorPalette; score: number }[] = []

  for (const [paletteName, paletteColors] of Object.entries(COLOR_PALETTES)) {
    const matchCount = lowerColors.filter(color =>
      paletteColors.some(pc => pc.toLowerCase() === color || color.includes(pc.toLowerCase()))
    ).length

    if (matchCount > 0) {
      // Calculate match percentage
      const score = matchCount / lowerColors.length
      paletteMatches.push({
        palette: paletteName as ColorPalette,
        score,
      })
    }
  }

  // Return palette with highest match score
  if (paletteMatches.length === 0) return null

  paletteMatches.sort((a, b) => b.score - a.score)
  return paletteMatches[0].palette
}

/**
 * Get all palettes that a product matches
 */
export function getMatchingPalettes(product: Product): ColorPalette[] {
  const colors = detectProductColor(product)
  if (colors.length === 0) return []

  const lowerColors = colors.map(c => c.toLowerCase())
  const matchingPalettes: ColorPalette[] = []

  for (const [paletteName, paletteColors] of Object.entries(COLOR_PALETTES)) {
    const hasMatch = lowerColors.some(color =>
      paletteColors.some(pc => pc.toLowerCase() === color || color.includes(pc.toLowerCase()))
    )

    if (hasMatch) {
      matchingPalettes.push(paletteName as ColorPalette)
    }
  }

  return matchingPalettes
}

// ============================================================================
// Color Compatibility
// ============================================================================

/**
 * Check if two products' colors are compatible based on trending palettes
 */
export function areColorsCompatible(colors1: string[], colors2: string[]): boolean {
  if (colors1.length === 0 || colors2.length === 0) return true // No colors = compatible

  const palette1 = getPaletteCompatibility(colors1)
  const palette2 = getPaletteCompatibility(colors2)

  // If either doesn't match a palette, assume compatible
  if (!palette1 || !palette2) return true

  // Same palette = compatible
  if (palette1 === palette2) return true

  // Check if both are neutral palettes (compatible)
  const neutralPalettes: ColorPalette[] = [
    'neutral-earth-tones',
    'monochromatic-beige',
    'monochromatic-brown',
    'monochromatic-black',
  ]

  const bothNeutral = neutralPalettes.includes(palette1) && neutralPalettes.includes(palette2)
  if (bothNeutral) return true

  // Check if both are work palettes (compatible)
  const workPalettes: ColorPalette[] = [
    'work-olive-black',
    'work-brown-cream',
    'all-black-texture',
  ]

  const bothWork = workPalettes.includes(palette1) && workPalettes.includes(palette2)
  if (bothWork) return true

  // Black goes with everything
  const hasBlack1 = colors1.some(c => c.toLowerCase().includes('black'))
  const hasBlack2 = colors2.some(c => c.toLowerCase().includes('black'))
  if (hasBlack1 || hasBlack2) return true

  // Neutral earth tones go with most things
  const neutralEarthTones = getNeutralEarthTones()
  const isNeutral1 = colors1.some(c =>
    neutralEarthTones.some(n => c.toLowerCase().includes(n.toLowerCase()))
  )
  const isNeutral2 = colors2.some(c =>
    neutralEarthTones.some(n => c.toLowerCase().includes(n.toLowerCase()))
  )
  if (isNeutral1 || isNeutral2) return true

  return false
}

/**
 * Check if a product matches a specific color palette
 */
export function isProductInPalette(product: Product, palette: ColorPalette): boolean {
  const productColors = detectProductColor(product)
  if (productColors.length === 0) return false

  const paletteColors = getColorPaletteKeywords(palette)
  return productColors.some(color =>
    paletteColors.some(pc => color.toLowerCase().includes(pc.toLowerCase()))
  )
}

// ============================================================================
// Monochromatic Matching
// ============================================================================

/**
 * Get the base color from a color string
 */
function getBaseColor(color: string): string {
  const lowerColor = color.toLowerCase()

  // Color family mapping
  const colorFamilies: Record<string, string[]> = {
    beige: ['beige', 'cream', 'tan', 'taupe', 'sand', 'ivory', 'ecru'],
    brown: ['brown', 'chocolate', 'camel', 'coffee', 'mocha', 'cocoa', 'chestnut'],
    blue: ['blue', 'navy', 'indigo', 'denim', 'cobalt', 'azure', 'steel'],
    black: ['black', 'charcoal', 'ebony', 'jet', 'onyx'],
    grey: ['grey', 'gray', 'silver', 'ash'],
    white: ['white', 'ivory', 'cream', 'ecru'],
    green: ['green', 'olive', 'forest', 'hunter', 'emerald'],
    red: ['red', 'burgundy', 'wine', 'crimson'],
    pink: ['pink', 'rose', 'blush'],
  }

  for (const [family, variants] of Object.entries(colorFamilies)) {
    if (variants.some(v => lowerColor.includes(v))) {
      return family
    }
  }

  return lowerColor
}

/**
 * Find products in the same color family for monochrome outfits
 */
export function getMonochromaticMatches(baseColor: string, products: Product[]): Product[] {
  const targetFamily = getBaseColor(baseColor)

  return products.filter(product => {
    const productColors = detectProductColor(product)
    return productColors.some(color => getBaseColor(color) === targetFamily)
  })
}

/**
 * Get products with neutral earth tone colors
 */
export function getNeutralEarthToneProducts(products: Product[]): Product[] {
  const neutralTones = getNeutralEarthTones()

  return products.filter(product => {
    const productColors = detectProductColor(product)
    return productColors.some(color =>
      neutralTones.some(n => color.toLowerCase().includes(n.toLowerCase()))
    )
  })
}

/**
 * Get products matching a specific trending palette
 */
export function getProductsByPalette(products: Product[], palette: ColorPalette): Product[] {
  return products.filter(product => isProductInPalette(product, palette))
}

// ============================================================================
// Outfit Color Coordination
// ============================================================================

/**
 * Score how well products coordinate by color
 */
export function calculateColorCoordination(products: Product[]): number {
  if (products.length < 2) return 1.0

  const productColors = products.map(p => detectProductColor(p))

  // Check if all products have compatible colors
  let compatiblePairs = 0
  let totalPairs = 0

  for (let i = 0; i < productColors.length; i++) {
    for (let j = i + 1; j < productColors.length; j++) {
      totalPairs++
      if (areColorsCompatible(productColors[i], productColors[j])) {
        compatiblePairs++
      }
    }
  }

  return totalPairs > 0 ? compatiblePairs / totalPairs : 1.0
}

/**
 * Get the dominant color palette for an outfit
 */
export function getDominantPalette(products: Product[]): ColorPalette | null {
  const paletteCounts: Partial<Record<ColorPalette, number>> = {}

  products.forEach(product => {
    const palettes = getMatchingPalettes(product)
    palettes.forEach(palette => {
      paletteCounts[palette] = (paletteCounts[palette] || 0) + 1
    })
  })

  const entries = Object.entries(paletteCounts)
  if (entries.length === 0) return null

  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0] as ColorPalette
}

/**
 * Check if outfit follows monochromatic color scheme
 */
export function isMonochromaticOutfit(products: Product[]): boolean {
  if (products.length < 2) return false

  const allColors = products.flatMap(p => detectProductColor(p))
  const colorFamilies = new Set(allColors.map(c => getBaseColor(c)))

  // Monochromatic = 1-2 color families (allowing for slight variation)
  return colorFamilies.size <= 2
}

/**
 * Suggest complementary colors for a given product
 */
export function suggestComplementaryColors(product: Product): string[] {
  const productColors = detectProductColor(product)
  if (productColors.length === 0) return getNeutralEarthTones()

  const palette = getPaletteCompatibility(productColors)
  if (!palette) return getNeutralEarthTones()

  // Return colors from the same palette or compatible palettes
  const compatiblePalettes: ColorPalette[] = [palette]

  // Add compatible palette groups
  const neutralPalettes: ColorPalette[] = [
    'neutral-earth-tones',
    'monochromatic-beige',
    'monochromatic-brown',
  ]

  if (neutralPalettes.includes(palette)) {
    compatiblePalettes.push(...neutralPalettes)
  }

  // Collect all compatible colors
  const suggestions = new Set<string>()
  compatiblePalettes.forEach(p => {
    getColorPaletteKeywords(p).forEach(color => suggestions.add(color))
  })

  return Array.from(suggestions)
}

// ============================================================================
// Color Tone Matching (Enhanced Mock Product Support)
// ============================================================================

import type { ColorTone, EnhancedMockProduct } from '../types'

/**
 * Check if two color tones are compatible
 * Color tone compatibility rules:
 * - 'neutral' is compatible with both 'warm' and 'cool'
 * - 'warm' is compatible with 'warm' and 'neutral'
 * - 'cool' is compatible with 'cool' and 'neutral'
 * - 'warm' and 'cool' are less compatible (return false)
 *
 * @param tone1 - First color tone
 * @param tone2 - Second color tone
 * @returns true if the color tones are compatible
 */
export function areColorTonesCompatible(tone1: ColorTone, tone2: ColorTone): boolean {
  // Same tone = always compatible
  if (tone1 === tone2) return true

  // Neutral is compatible with everything
  if (tone1 === 'neutral' || tone2 === 'neutral') return true

  // Warm and cool are not compatible
  return false
}

/**
 * Get the color tone from an EnhancedMockProduct
 *
 * @param product - The enhanced mock product
 * @returns The color tone of the product
 */
export function getProductColorTone(product: EnhancedMockProduct): ColorTone {
  return product.colorTone
}

/**
 * Check if all products in an array have compatible color tones
 *
 * @param products - Array of enhanced mock products
 * @returns true if all products have compatible color tones
 */
export function areAllColorTonesCompatible(products: EnhancedMockProduct[]): boolean {
  if (products.length < 2) return true

  // Get all color tones
  const tones = products.map(p => p.colorTone)

  // Check if any pair is incompatible
  for (let i = 0; i < tones.length; i++) {
    for (let j = i + 1; j < tones.length; j++) {
      if (!areColorTonesCompatible(tones[i], tones[j])) {
        return false
      }
    }
  }

  return true
}

/**
 * Calculate color tone harmony score for a set of products
 * Returns a score from 0 to 1 where 1 is perfect harmony
 *
 * @param products - Array of enhanced mock products
 * @returns Harmony score (0-1)
 */
export function calculateColorToneHarmony(products: EnhancedMockProduct[]): number {
  if (products.length < 2) return 1.0

  const tones = products.map(p => p.colorTone)
  let compatiblePairs = 0
  let totalPairs = 0

  for (let i = 0; i < tones.length; i++) {
    for (let j = i + 1; j < tones.length; j++) {
      totalPairs++
      if (areColorTonesCompatible(tones[i], tones[j])) {
        compatiblePairs++
      }
    }
  }

  return totalPairs > 0 ? compatiblePairs / totalPairs : 1.0
}
