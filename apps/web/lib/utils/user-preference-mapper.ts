/**
 * User Preference Mapping Utility
 *
 * Maps user onboarding preferences (styles, age, gender) to outfit generation parameters
 * including Pinterest 2026 aesthetics, formality levels, and personalization.
 */

import type { UserProfile, AgeRange, StylePreference } from '../types/user-profile-types'
import type { AestheticCategory } from '../styling/pinterest-2026-trends'

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Aggregated user preference context for outfit generation
 */
export interface UserPreferenceContext {
  /** Mapped aesthetic categories from user's style preferences */
  preferredAesthetics: AestheticCategory[]
  /** Age-filtered aesthetics (most appropriate first) */
  ageAppropriateAesthetics: AestheticCategory[]
  /** Formality bias based on age (-2 to +2) */
  formalityBias: number
  /** User's name for personalization */
  userName?: string
  /** User's gender/department */
  gender: 'women'
  /** User's age range */
  ageRange: AgeRange
  /** Original style preferences */
  stylePreferences: StylePreference[]
}

// ============================================================================
// Style to Aesthetic Mapping
// ============================================================================

/**
 * Maps user style preferences to Pinterest 2026 aesthetic categories
 *
 * Strategy:
 * - Each style maps to 1-3 aesthetics based on keyword analysis
 * - "Mystery" style returns all aesthetics for maximum variety
 * - Multiple styles can map to the same aesthetic (many-to-many)
 */
const STYLE_TO_AESTHETIC_MAP: Record<string, AestheticCategory[]> = {
  minimal: ['clean-girl', 'scandinavian-minimal', 'minimalist-office'],
  luxury: ['quiet-luxury', 'corporate-chic'],
  eccentric: ['y2k-revival', 'street-style'],
  business: ['corporate-chic', 'minimalist-office', 'quiet-luxury'],
  vanilla: ['clean-girl', 'casual-chic'],
  sporty: ['street-style', 'casual-chic'],
  edgy: ['street-style', 'y2k-revival'],
  bohemian: ['casual-chic', 'clean-girl'],
  classic: ['quiet-luxury', 'minimalist-office', 'scandinavian-minimal'],
  mystery: [
    'clean-girl',
    'scandinavian-minimal',
    'street-style',
    'casual-chic',
    'y2k-revival',
    'corporate-chic',
    'quiet-luxury',
    'minimalist-office',
    'dark-academia',
  ],
}

/**
 * Maps user style preferences to aesthetic categories
 *
 * @param stylePreferences - Array of user's selected style preferences
 * @returns Array of mapped aesthetic categories (deduplicated)
 *
 * @example
 * mapStylesToAesthetics([{ id: 'minimal', ... }, { id: 'luxury', ... }])
 * // Returns: ['clean-girl', 'scandinavian-minimal', 'minimalist-office', 'quiet-luxury', 'corporate-chic']
 */
export function mapStylesToAesthetics(stylePreferences: StylePreference[]): AestheticCategory[] {
  if (!stylePreferences || stylePreferences.length === 0) {
    // Default to versatile aesthetics if no preferences
    return ['casual-chic', 'clean-girl', 'scandinavian-minimal']
  }

  const aesthetics = new Set<AestheticCategory>()

  for (const style of stylePreferences) {
    const mappedAesthetics = STYLE_TO_AESTHETIC_MAP[style.id] || []
    mappedAesthetics.forEach(a => aesthetics.add(a))
  }

  return Array.from(aesthetics)
}

// ============================================================================
// Age-Based Filtering
// ============================================================================

/**
 * Age-based aesthetic priority weights
 * Higher weight = more appropriate for age group
 */
const AGE_AESTHETIC_WEIGHTS: Record<AgeRange, Partial<Record<AestheticCategory, number>>> = {
  '<20': {
    'y2k-revival': 3,
    'street-style': 3,
    'casual-chic': 2,
    'clean-girl': 2,
    'scandinavian-minimal': 1,
    'corporate-chic': 0,
    'quiet-luxury': 0,
    'minimalist-office': 0,
    'dark-academia': 2,
  },
  '20-29': {
    'y2k-revival': 2,
    'street-style': 2,
    'casual-chic': 3,
    'clean-girl': 3,
    'scandinavian-minimal': 2,
    'corporate-chic': 2,
    'quiet-luxury': 2,
    'minimalist-office': 2,
    'dark-academia': 2,
  },
  '30-39': {
    'y2k-revival': 1,
    'street-style': 1,
    'casual-chic': 2,
    'clean-girl': 2,
    'scandinavian-minimal': 3,
    'corporate-chic': 3,
    'quiet-luxury': 3,
    'minimalist-office': 3,
    'dark-academia': 2,
  },
  '40+': {
    'y2k-revival': 0,
    'street-style': 0,
    'casual-chic': 2,
    'clean-girl': 1,
    'scandinavian-minimal': 3,
    'corporate-chic': 2,
    'quiet-luxury': 3,
    'minimalist-office': 3,
    'dark-academia': 2,
  },
}

/**
 * Filters and sorts aesthetics by age appropriateness
 *
 * @param ageRange - User's age range
 * @param aesthetics - Aesthetics to filter
 * @returns Sorted aesthetics (most appropriate first)
 *
 * Strategy:
 * - <20: Prioritize y2k-revival, street-style, casual-chic (trend-forward, experimental)
 * - 20-29: Balanced mix across all aesthetics (exploration phase)
 * - 30-39: Prioritize quiet-luxury, corporate-chic, minimalist-office (sophisticated, professional)
 * - 40+: Prioritize quiet-luxury, scandinavian-minimal, minimalist-office (timeless, elegant)
 *
 * @example
 * getAgeAppropriateAesthetics('<20', ['quiet-luxury', 'street-style', 'y2k-revival'])
 * // Returns: ['y2k-revival', 'street-style', 'quiet-luxury'] (sorted by age appropriateness)
 */
export function getAgeAppropriateAesthetics(
  ageRange: AgeRange,
  aesthetics: AestheticCategory[]
): AestheticCategory[] {
  const weights = AGE_AESTHETIC_WEIGHTS[ageRange] || {}

  // Sort by weight (higher = more appropriate)
  const sorted = [...aesthetics].sort((a, b) => {
    const weightA = weights[a] ?? 1 // Default weight = 1 (neutral)
    const weightB = weights[b] ?? 1
    return weightB - weightA
  })

  // Filter out aesthetics with weight 0 (not age-appropriate)
  return sorted.filter(aesthetic => (weights[aesthetic] ?? 1) > 0)
}

// ============================================================================
// Age-Based Formality Bias
// ============================================================================

/**
 * Returns formality bias based on age range
 *
 * Bias is added to formality scoring during outfit generation:
 * - Negative bias: Prefer more casual outfits
 * - Zero bias: Neutral (balanced)
 * - Positive bias: Prefer more sophisticated/formal outfits
 *
 * @param ageRange - User's age range
 * @returns Formality bias (-2 to +2)
 *
 * @example
 * getAgeFormalityBias('<20')  // Returns: -1 (prefer casual)
 * getAgeFormalityBias('20-29') // Returns: 0 (neutral)
 * getAgeFormalityBias('30-39') // Returns: +1 (prefer sophisticated)
 * getAgeFormalityBias('40+')   // Returns: +2 (prefer elegant)
 */
export function getAgeFormalityBias(ageRange: AgeRange): number {
  const biasMap: Record<AgeRange, number> = {
    '<20': -1,   // Prefer casual
    '20-29': 0,  // Neutral
    '30-39': 1,  // Prefer sophisticated
    '40+': 2,    // Prefer elegant
  }

  return biasMap[ageRange] ?? 0
}

// ============================================================================
// Outfit Title Personalization
// ============================================================================

/**
 * Personalizes outfit title with user's name
 *
 * @param title - Base outfit title
 * @param userName - User's name (optional)
 * @returns Personalized title
 *
 * @example
 * personalizeOutfitTitle('ลุคสาวคลีนมินิมอล', 'Anna')
 * // Returns: 'ลุคสาวคลีนมินิมอลสำหรับ Anna'
 *
 * personalizeOutfitTitle('ลุคสาวคลีนมินิมอล')
 * // Returns: 'ลุคสาวคลีนมินิมอล' (unchanged)
 */
export function personalizeOutfitTitle(title: string, userName?: string): string {
  if (!userName) {
    return title
  }

  // Thai personalization: add "สำหรับ [name]" (for [name])
  return `${title}สำหรับ ${userName}`
}

// ============================================================================
// Aggregate User Preference Context
// ============================================================================

/**
 * Aggregates all user preferences into a context object for outfit generation
 *
 * @param profile - User profile from onboarding (can be null)
 * @returns User preference context with defaults if profile is null
 *
 * @example
 * const profile = { userName: 'Anna', ageRange: '20-29', stylePreferences: [...], ... }
 * const context = getUserPreferenceContext(profile)
 * // Returns: { preferredAesthetics: [...], ageAppropriateAesthetics: [...], ... }
 */
export function getUserPreferenceContext(profile: UserProfile | null): UserPreferenceContext {
  if (!profile) {
    // Default context when no profile exists
    return {
      preferredAesthetics: ['casual-chic', 'clean-girl', 'scandinavian-minimal'],
      ageAppropriateAesthetics: ['casual-chic', 'clean-girl', 'scandinavian-minimal'],
      formalityBias: 0,
      gender: 'women',
      ageRange: '20-29',
      stylePreferences: [],
    }
  }

  // Map style preferences to aesthetics
  const preferredAesthetics = mapStylesToAesthetics(profile.stylePreferences)

  // Filter by age appropriateness
  const ageAppropriateAesthetics = getAgeAppropriateAesthetics(
    profile.ageRange,
    preferredAesthetics
  )

  // Calculate formality bias
  const formalityBias = getAgeFormalityBias(profile.ageRange)

  return {
    preferredAesthetics,
    ageAppropriateAesthetics,
    formalityBias,
    userName: profile.userName,
    gender: profile.gender,
    ageRange: profile.ageRange,
    stylePreferences: profile.stylePreferences,
  }
}

// ============================================================================
// Exports
// ============================================================================

export type { AgeRange } from '../types/user-profile-types'
