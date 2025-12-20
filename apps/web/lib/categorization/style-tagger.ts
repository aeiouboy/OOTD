/**
 * Style Tagger
 * Assigns style attributes to products
 */

import type { StyleTag, PatternType, MaterialType } from '../types/enums'

/**
 * Assign style tags based on product attributes (Task 4.6)
 */
export function assignStyleTags(name: string, description?: string): StyleTag[] {
  const text = `${name} ${description || ''}`.toLowerCase()
  const tags = new Set<StyleTag>()

  // Classic style
  if (
    text.includes('classic') ||
    text.includes('traditional') ||
    text.includes('timeless') ||
    text.includes('iconic')
  ) {
    tags.add('classic')
  }

  // Modern style
  if (
    text.includes('modern') ||
    text.includes('contemporary') ||
    text.includes('new') ||
    text.includes('latest')
  ) {
    tags.add('modern')
  }

  // Trendy style
  if (text.includes('trendy') || text.includes('fashion') || text.includes('stylish')) {
    tags.add('trendy')
  }

  // Minimalist style
  if (
    text.includes('minimal') ||
    text.includes('simple') ||
    text.includes('basic') ||
    text.includes('clean')
  ) {
    tags.add('minimalist')
  }

  // Bohemian style
  if (text.includes('boho') || text.includes('bohemian') || text.includes('folk')) {
    tags.add('bohemian')
  }

  // Vintage style
  if (text.includes('vintage') || text.includes('retro') || text.includes('classic')) {
    tags.add('vintage')
  }

  // Casual style
  if (
    text.includes('casual') ||
    text.includes('relaxed') ||
    text.includes('comfort') ||
    text.includes('everyday')
  ) {
    tags.add('casual')
  }

  // Formal style
  if (
    text.includes('formal') ||
    text.includes('elegant') ||
    text.includes('sophisticated') ||
    text.includes('dress')
  ) {
    tags.add('formal')
  }

  // Sporty style
  if (
    text.includes('sport') ||
    text.includes('athletic') ||
    text.includes('active') ||
    text.includes('gym')
  ) {
    tags.add('sporty')
  }

  // Elegant style
  if (
    text.includes('elegant') ||
    text.includes('refined') ||
    text.includes('polished') ||
    text.includes('chic')
  ) {
    tags.add('elegant')
  }

  // Edgy style
  if (
    text.includes('edgy') ||
    text.includes('bold') ||
    text.includes('daring') ||
    text.includes('statement')
  ) {
    tags.add('edgy')
  }

  // Preppy style
  if (
    text.includes('preppy') ||
    text.includes('collegiate') ||
    text.includes('ivy') ||
    text.includes('polo')
  ) {
    tags.add('preppy')
  }

  // Default to classic if no tags found
  if (tags.size === 0) {
    tags.add('classic')
  }

  return Array.from(tags).slice(0, 3) // Limit to 3 most relevant
}

/**
 * Detect pattern from product name
 */
export function detectPattern(name: string): PatternType | undefined {
  const lower = name.toLowerCase()

  if (lower.includes('stripe') || lower.includes('ลายริ้ว')) return 'striped'
  if (lower.includes('floral') || lower.includes('ดอกไม้')) return 'floral'
  if (lower.includes('plaid') || lower.includes('ตาราง')) return 'plaid'
  if (lower.includes('checkered') || lower.includes('checker')) return 'checkered'
  if (lower.includes('polka') || lower.includes('dot')) return 'polka-dot'
  if (lower.includes('geometric')) return 'geometric'
  if (lower.includes('abstract')) return 'abstract'
  if (lower.includes('animal') || lower.includes('leopard') || lower.includes('zebra')) return 'animal-print'
  if (lower.includes('print')) return 'print'

  return 'solid' // Default
}

/**
 * Detect material from product name or description
 */
export function detectMaterial(text: string): MaterialType | undefined {
  const lower = text.toLowerCase()

  if (lower.includes('cotton') || lower.includes('คอตตอน')) return 'cotton'
  if (lower.includes('polyester')) return 'polyester'
  if (lower.includes('linen') || lower.includes('ลินิน')) return 'linen'
  if (lower.includes('silk') || lower.includes('ไหม')) return 'silk'
  if (lower.includes('wool') || lower.includes('woolen')) return 'wool'
  if (lower.includes('denim') || lower.includes('เดนิม') || lower.includes('jean')) return 'denim'
  if (lower.includes('leather') || lower.includes('หนัง')) return 'leather'
  if (lower.includes('synthetic')) return 'synthetic'

  return 'blend' // Default
}

/**
 * Comprehensive style analysis
 */
export interface StyleAnalysis {
  tags: StyleTag[]
  pattern?: PatternType
  material?: MaterialType
  vibe: string
}

/**
 * Analyze overall style of a product
 */
export function analyzeProductStyle(name: string, description?: string): StyleAnalysis {
  const tags = assignStyleTags(name, description)
  const pattern = detectPattern(name)
  const material = detectMaterial(`${name} ${description || ''}`)

  // Determine overall vibe
  let vibe = 'neutral'
  if (tags.includes('elegant') || tags.includes('formal')) vibe = 'sophisticated'
  else if (tags.includes('casual') || tags.includes('minimalist')) vibe = 'relaxed'
  else if (tags.includes('trendy') || tags.includes('edgy')) vibe = 'bold'
  else if (tags.includes('classic')) vibe = 'timeless'

  return {
    tags,
    pattern,
    material,
    vibe,
  }
}
