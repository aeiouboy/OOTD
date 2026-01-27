/**
 * Style Tagger
 * Assigns style attributes to products
 */

import type { StyleTag, PatternType, MaterialType, AestheticCategory, SilhouetteType } from '../types/enums'

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

  // Pinterest 2026 Aesthetics

  // Clean girl aesthetic
  if (
    text.includes('minimal') ||
    text.includes('neutral') ||
    text.includes('soft') ||
    text.includes('fresh') ||
    (text.includes('light') && text.includes('tone'))
  ) {
    tags.add('clean-girl')
  }

  // Scandinavian minimal aesthetic
  if (
    text.includes('scandinavian') ||
    (text.includes('simple') && text.includes('clean')) ||
    (text.includes('neutral') && text.includes('palette')) ||
    text.includes('quality basics')
  ) {
    tags.add('scandinavian-minimal')
  }

  // Street style aesthetic
  if (
    text.includes('oversized') ||
    text.includes('baggy') ||
    text.includes('urban') ||
    text.includes('layered') ||
    text.includes('chunky') ||
    text.includes('street')
  ) {
    tags.add('street-style')
  }

  // Corporate chic aesthetic
  if (
    text.includes('structured') ||
    text.includes('tailored') ||
    (text.includes('wide-leg') || text.includes('wide leg')) ||
    text.includes('blazer') ||
    (text.includes('professional') && text.includes('chic'))
  ) {
    tags.add('corporate-chic')
  }

  // Quiet luxury aesthetic
  if (
    text.includes('understated') ||
    text.includes('premium') ||
    text.includes('timeless') ||
    (text.includes('refined') && !text.includes('edgy')) ||
    text.includes('cashmere') ||
    text.includes('quiet luxury')
  ) {
    tags.add('quiet-luxury')
  }

  // Y2K revival aesthetic
  if (
    text.includes('low-rise') ||
    text.includes('colorful') ||
    text.includes('playful') ||
    text.includes('platform') ||
    text.includes('retro') ||
    text.includes('y2k')
  ) {
    tags.add('y2k-revival')
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
 * Detect silhouette type from product (Pinterest 2026 trends)
 */
export function detectSilhouette(name: string, description?: string): SilhouetteType | undefined {
  const text = `${name} ${description || ''}`.toLowerCase()

  if (text.includes('wide-leg') || text.includes('wide leg') || text.includes('palazzo')) return 'wide-leg'
  if (text.includes('baggy') || text.includes('loose') || text.includes('relaxed') || text.includes('boyfriend')) return 'baggy'
  if (text.includes('fitted') || text.includes('slim') || text.includes('tailored') || text.includes('skinny')) return 'fitted'
  if (text.includes('high-waisted') || text.includes('high waist') || text.includes('high rise')) return 'high-waisted'
  if (text.includes('oversized') || text.includes('slouchy')) return 'oversized'

  return undefined
}

/**
 * Detect aesthetic category from product (Pinterest 2026 trends)
 */
export function detectAesthetic(name: string, description?: string): AestheticCategory | null {
  const text = `${name} ${description || ''}`.toLowerCase()

  // Clean girl aesthetic
  if (
    (text.includes('minimal') && (text.includes('neutral') || text.includes('soft'))) ||
    (text.includes('fresh') && text.includes('light'))
  ) {
    return 'clean-girl'
  }

  // Scandinavian minimal aesthetic
  if (
    text.includes('scandinavian') ||
    (text.includes('simple') && text.includes('clean lines')) ||
    text.includes('quality basics')
  ) {
    return 'scandinavian-minimal'
  }

  // Street style aesthetic
  if (
    (text.includes('oversized') && (text.includes('urban') || text.includes('layered'))) ||
    (text.includes('baggy') && text.includes('street')) ||
    text.includes('chunky sneakers')
  ) {
    return 'street-style'
  }

  // Corporate chic aesthetic
  if (
    (text.includes('structured') && text.includes('professional')) ||
    (text.includes('tailored') && text.includes('blazer')) ||
    (text.includes('wide-leg') && text.includes('trousers'))
  ) {
    return 'corporate-chic'
  }

  // Quiet luxury aesthetic
  if (
    text.includes('quiet luxury') ||
    (text.includes('understated') && text.includes('premium')) ||
    (text.includes('cashmere') && text.includes('timeless'))
  ) {
    return 'quiet-luxury'
  }

  // Minimalist office aesthetic
  if (
    (text.includes('minimalist') && text.includes('office')) ||
    (text.includes('clean') && text.includes('professional'))
  ) {
    return 'minimalist-office'
  }

  // Dark academia aesthetic
  if (
    text.includes('dark academia') ||
    (text.includes('vintage') && text.includes('scholarly')) ||
    (text.includes('tweed') && text.includes('brown'))
  ) {
    return 'dark-academia'
  }

  // Casual chic aesthetic
  if (
    text.includes('casual chic') ||
    (text.includes('effortless') && text.includes('polished'))
  ) {
    return 'casual-chic'
  }

  // Y2K revival aesthetic
  if (
    text.includes('y2k') ||
    (text.includes('low-rise') && text.includes('platform')) ||
    text.includes('retro revival')
  ) {
    return 'y2k-revival'
  }

  return null
}

/**
 * Comprehensive style analysis
 */
export interface StyleAnalysis {
  tags: StyleTag[]
  pattern?: PatternType
  material?: MaterialType
  vibe: string
  aesthetic?: AestheticCategory
  silhouette?: SilhouetteType
}

/**
 * Analyze overall style of a product
 */
export function analyzeProductStyle(name: string, description?: string): StyleAnalysis {
  const tags = assignStyleTags(name, description)
  const pattern = detectPattern(name)
  const material = detectMaterial(`${name} ${description || ''}`)
  const aesthetic = detectAesthetic(name, description) || undefined
  const silhouette = detectSilhouette(name, description)

  // Determine overall vibe
  let vibe = 'neutral'
  if (tags.includes('elegant') || tags.includes('formal')) vibe = 'sophisticated'
  else if (tags.includes('casual') || tags.includes('minimalist')) vibe = 'relaxed'
  else if (tags.includes('trendy') || tags.includes('edgy')) vibe = 'bold'
  else if (tags.includes('classic')) vibe = 'timeless'

  // Enhance vibe with 2026 aesthetics
  if (aesthetic) {
    if (aesthetic === 'corporate-chic' || aesthetic === 'quiet-luxury') vibe = 'sophisticated'
    else if (aesthetic === 'street-style' || aesthetic === 'y2k-revival') vibe = 'bold'
    else if (aesthetic === 'clean-girl' || aesthetic === 'scandinavian-minimal') vibe = 'relaxed'
  }

  return {
    tags,
    pattern,
    material,
    vibe,
    aesthetic,
    silhouette,
  }
}
