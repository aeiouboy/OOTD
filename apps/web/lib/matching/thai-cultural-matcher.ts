/**
 * Thai Cultural Matcher
 * Validates outfits for Thai cultural occasions and contexts
 *
 * chore-kb003: KB integration with AI matching
 *
 * Reference: KB Sections 01, 02, 07, 12
 */

import type { EnhancedProduct } from '../types/product-types'
import type { ThaiClimateContext } from '../types/thai-context-types'

// ============================================================================
// TYPES
// ============================================================================

export type ThaiOccasion =
  | 'temple'
  | 'wedding-morning'
  | 'wedding-evening'
  | 'funeral'
  | 'songkran-temple'
  | 'songkran-water'
  | 'loy-krathong'
  | 'chinese-new-year'
  | 'royal-event'
  | 'casual'

export interface ThaiValidationResult {
  valid: boolean
  score: number // 0-100
  issues: string[]
  suggestions: string[]
}

export interface ThaiDayOfWeek {
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
  luckyColors: string[]
  unluckyColors: string[]
}

// ============================================================================
// DAY COLOR MAPPING
// ============================================================================

const THAI_DAY_COLORS: Record<number, ThaiDayOfWeek> = {
  0: { day: 'sunday', luckyColors: ['red', 'maroon', 'burgundy'], unluckyColors: ['blue', 'navy'] },
  1: { day: 'monday', luckyColors: ['yellow', 'cream', 'ivory', 'white'], unluckyColors: ['red'] },
  2: { day: 'tuesday', luckyColors: ['pink', 'rose'], unluckyColors: ['yellow'] },
  3: { day: 'wednesday', luckyColors: ['green', 'emerald', 'sage'], unluckyColors: ['pink'] },
  4: { day: 'thursday', luckyColors: ['orange', 'brown', 'tan'], unluckyColors: ['purple'] },
  5: { day: 'friday', luckyColors: ['blue', 'light-blue', 'sky-blue'], unluckyColors: ['black'] },
  6: { day: 'saturday', luckyColors: ['purple', 'violet', 'lavender'], unluckyColors: ['green'] },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Thai context from product (with fallback)
 */
function getThaiContext(product: EnhancedProduct): ThaiClimateContext | null {
  return (product as any).thaiContext || null
}

/**
 * Check if product has adequate coverage for temple
 */
function hasTempleCoverage(ctx: ThaiClimateContext): boolean {
  return (
    ctx.coverage?.shoulders === 'covered' &&
    (ctx.coverage?.knees === 'covered' || ctx.coverage?.knees === 'partially-covered')
  )
}

// ============================================================================
// OCCASION VALIDATORS
// ============================================================================

/**
 * Validate outfit for temple visit
 */
function validateTempleOccasion(outfit: EnhancedProduct[]): ThaiValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  for (const product of outfit) {
    const ctx = getThaiContext(product)
    if (!ctx) {
      score -= 10
      continue
    }

    if (!ctx.templeAppropriate) {
      issues.push(`${product.name?.en || 'Item'} may not be temple appropriate`)
      score -= 25
    }

    if (!hasTempleCoverage(ctx)) {
      issues.push(`${product.name?.en || 'Item'} does not provide adequate coverage`)
      score -= 30
      suggestions.push('Consider adding a cardigan or shawl for shoulder coverage')
    }
  }

  return {
    valid: score >= 60,
    score: Math.max(0, score),
    issues,
    suggestions,
  }
}

/**
 * Validate outfit for wedding
 */
function validateWeddingOccasion(outfit: EnhancedProduct[], timeOfDay: 'morning' | 'evening'): ThaiValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  for (const product of outfit) {
    const ctx = getThaiContext(product)
    if (!ctx) {
      score -= 5
      continue
    }

    if (ctx.weddingAppropriate === 'none') {
      issues.push(`${product.name?.en || 'Item'} may not be suitable for weddings`)
      score -= 30
    } else if (ctx.weddingAppropriate !== 'any' && ctx.weddingAppropriate !== timeOfDay) {
      score -= 15
      suggestions.push(`This item is better suited for ${ctx.weddingAppropriate} weddings`)
    }
  }

  return {
    valid: score >= 50,
    score: Math.max(0, score),
    issues,
    suggestions,
  }
}

/**
 * Validate outfit for funeral
 */
function validateFuneralOccasion(outfit: EnhancedProduct[]): ThaiValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  for (const product of outfit) {
    const ctx = getThaiContext(product)
    if (!ctx) {
      score -= 10
      continue
    }

    if (!ctx.funeralAppropriate) {
      issues.push(`${product.name?.en || 'Item'} is not appropriate for funerals`)
      score -= 40
      suggestions.push('Funeral attire should be black or very dark colors')
    }
  }

  return {
    valid: score >= 60,
    score: Math.max(0, score),
    issues,
    suggestions,
  }
}

/**
 * Validate outfit for Songkran
 */
function validateSongkranOccasion(outfit: EnhancedProduct[], activity: 'temple' | 'water'): ThaiValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  for (const product of outfit) {
    const ctx = getThaiContext(product)
    if (!ctx) {
      score -= 5
      continue
    }

    const suitable = ctx.songkranSuitable
    if (suitable === 'neither') {
      issues.push(`${product.name?.en || 'Item'} is not suitable for Songkran`)
      score -= 25
    } else if (activity === 'water' && suitable === 'temple-morning') {
      score -= 15
      suggestions.push('Consider quick-dry materials for water play')
    } else if (activity === 'temple' && suitable === 'water-play') {
      score -= 20
      suggestions.push('Temple morning requires modest, traditional attire')
    }
  }

  return {
    valid: score >= 50,
    score: Math.max(0, score),
    issues,
    suggestions,
  }
}

/**
 * Validate outfit for Loy Krathong
 */
function validateLoyKrathongOccasion(outfit: EnhancedProduct[]): ThaiValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  for (const product of outfit) {
    const ctx = getThaiContext(product)
    if (!ctx) {
      score -= 5
      continue
    }

    if (!ctx.loyKrathongSuitable) {
      issues.push(`${product.name?.en || 'Item'} may not match Loy Krathong aesthetic`)
      score -= 15
    }
  }

  suggestions.push('Traditional Thai colors and elegant styles work best for Loy Krathong')

  return {
    valid: score >= 60,
    score: Math.max(0, score),
    issues,
    suggestions,
  }
}

/**
 * Validate outfit for Chinese New Year
 */
function validateChineseNewYearOccasion(outfit: EnhancedProduct[]): ThaiValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  for (const product of outfit) {
    const ctx = getThaiContext(product)
    if (!ctx) {
      score -= 5
      continue
    }

    if (ctx.cnySuitable === 'unsuitable') {
      issues.push(`${product.name?.en || 'Item'} has unsuitable colors for Chinese New Year`)
      score -= 35
      suggestions.push('Avoid black, white, and blue. Red and gold are auspicious.')
    } else if (ctx.cnySuitable === 'neutral') {
      score -= 10
    }
  }

  return {
    valid: score >= 50,
    score: Math.max(0, score),
    issues,
    suggestions,
  }
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Validate outfit for Thai cultural occasion
 */
export function validateThaiOccasion(
  outfit: EnhancedProduct[],
  occasion: ThaiOccasion
): ThaiValidationResult {
  switch (occasion) {
    case 'temple':
      return validateTempleOccasion(outfit)
    case 'wedding-morning':
      return validateWeddingOccasion(outfit, 'morning')
    case 'wedding-evening':
      return validateWeddingOccasion(outfit, 'evening')
    case 'funeral':
      return validateFuneralOccasion(outfit)
    case 'songkran-temple':
      return validateSongkranOccasion(outfit, 'temple')
    case 'songkran-water':
      return validateSongkranOccasion(outfit, 'water')
    case 'loy-krathong':
      return validateLoyKrathongOccasion(outfit)
    case 'chinese-new-year':
      return validateChineseNewYearOccasion(outfit)
    case 'royal-event':
      // Royal events often require yellow
      return validateTempleOccasion(outfit) // Similar modesty requirements
    case 'casual':
    default:
      return { valid: true, score: 100, issues: [], suggestions: [] }
  }
}

/**
 * Get month suitability score for a product (1-10)
 */
export function getMonthSuitability(product: EnhancedProduct, month: number): number {
  const ctx = getThaiContext(product)
  if (!ctx || !ctx.monthSuitability || ctx.monthSuitability.length !== 12) {
    return 6 // Default neutral score
  }
  // month is 0-indexed (0 = January)
  const index = Math.max(0, Math.min(11, month))
  return ctx.monthSuitability[index]
}

/**
 * Filter products by month suitability
 */
export function filterByMonth(
  products: EnhancedProduct[],
  month: number,
  minScore: number = 6
): EnhancedProduct[] {
  return products
    .filter(p => getMonthSuitability(p, month) >= minScore)
    .sort((a, b) => getMonthSuitability(b, month) - getMonthSuitability(a, month))
}

/**
 * Check if product color matches auspicious Thai day color
 */
export function checkThaiDayColor(product: EnhancedProduct, date: Date): boolean {
  const ctx = getThaiContext(product)
  if (!ctx || !ctx.thaiDayColors || ctx.thaiDayColors.length === 0) {
    return true // No restriction
  }

  const dayOfWeek = date.getDay()
  const thaiDay = THAI_DAY_COLORS[dayOfWeek]

  return ctx.thaiDayColors.includes(thaiDay.day)
}

/**
 * Get Thai climate score for outfit
 */
export function getThaiClimateScore(outfit: EnhancedProduct[]): number {
  let totalScore = 0
  let count = 0

  for (const product of outfit) {
    const ctx = getThaiContext(product)
    if (ctx && typeof ctx.thaiClimateRating === 'number') {
      totalScore += ctx.thaiClimateRating
      count++
    }
  }

  return count > 0 ? totalScore / count : 5 // Default neutral
}

/**
 * Check if outfit is AC-friendly (for indoor occasions)
 */
export function isACFriendly(outfit: EnhancedProduct[]): boolean {
  return outfit.every(product => {
    const ctx = getThaiContext(product)
    return !ctx || ctx.acFriendly !== false
  })
}

/**
 * Detect Thai occasion from user query
 */
export function detectThaiOccasion(query: string): ThaiOccasion | null {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('temple') || lowerQuery.includes('วัด')) {
    return 'temple'
  }
  if (lowerQuery.includes('wedding') || lowerQuery.includes('งานแต่ง')) {
    if (lowerQuery.includes('evening') || lowerQuery.includes('เย็น')) {
      return 'wedding-evening'
    }
    return 'wedding-morning'
  }
  if (lowerQuery.includes('funeral') || lowerQuery.includes('งานศพ')) {
    return 'funeral'
  }
  if (lowerQuery.includes('songkran') || lowerQuery.includes('สงกรานต์')) {
    if (lowerQuery.includes('water') || lowerQuery.includes('เล่นน้ำ')) {
      return 'songkran-water'
    }
    return 'songkran-temple'
  }
  if (lowerQuery.includes('loy krathong') || lowerQuery.includes('ลอยกระทง')) {
    return 'loy-krathong'
  }
  if (lowerQuery.includes('chinese new year') || lowerQuery.includes('ตรุษจีน') || lowerQuery.includes('cny')) {
    return 'chinese-new-year'
  }
  if (lowerQuery.includes('royal') || lowerQuery.includes('พระราชา')) {
    return 'royal-event'
  }

  return null
}
