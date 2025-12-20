/**
 * Occasion Mapper
 * Maps products to appropriate occasions based on attributes
 */

import type { OccasionType, FormalityLevel, OutfitRole } from '../types/enums'
import { OCCASIONS, getOccasionsByFormality } from '../constants/occasions'

/**
 * Product attributes for occasion mapping
 */
export interface OccasionMappingInput {
  name?: string
  description?: string
  formalityLevel: FormalityLevel
  role?: OutfitRole
  category?: string
  styleAttributes?: string[]
}

/**
 * Map product to occasions (Task 4.3)
 */
export function mapProductToOccasions(input: OccasionMappingInput): OccasionType[] {
  const occasions = new Set<OccasionType>()

  // Start with formality-based occasions
  const formalityOccasions = getOccasionsByFormality(input.formalityLevel)
  formalityOccasions.forEach((occ) => occasions.add(occ))

  // Apply inference rules (Task 4.4)
  const inferredOccasions = applyInferenceRules(input)
  inferredOccasions.forEach((occ) => occasions.add(occ))

  // Remove incompatible occasions
  filterIncompatibleOccasions(occasions, input)

  // Ensure at least one occasion
  if (occasions.size === 0) {
    occasions.add('chill')
  }

  // Limit to most relevant (max 4)
  return Array.from(occasions).slice(0, 4)
}

/**
 * Apply occasion inference rules (Task 4.4)
 */
function applyInferenceRules(input: OccasionMappingInput): OccasionType[] {
  const occasions: OccasionType[] = []
  const nameDesc = `${input.name || ''} ${input.description || ''}`.toLowerCase()

  // Sport detection
  if (
    nameDesc.includes('sport') ||
    nameDesc.includes('gym') ||
    nameDesc.includes('athletic') ||
    nameDesc.includes('running') ||
    nameDesc.includes('yoga') ||
    nameDesc.includes('ออกกำลัง') ||
    nameDesc.includes('วิ่ง') ||
    nameDesc.includes('โยคะ')
  ) {
    occasions.push('sport')
  }

  // Wedding detection
  if (
    nameDesc.includes('evening') ||
    nameDesc.includes('gown') ||
    nameDesc.includes('formal dress') ||
    nameDesc.includes('ราตรี') ||
    nameDesc.includes('งานแต่ง') ||
    input.formalityLevel >= 8
  ) {
    occasions.push('wedding', 'party', 'dinner')
  }

  // Work detection
  if (
    nameDesc.includes('business') ||
    nameDesc.includes('office') ||
    nameDesc.includes('professional') ||
    nameDesc.includes('blazer') ||
    nameDesc.includes('suit') ||
    (nameDesc.includes('shirt') && !nameDesc.includes('t-shirt')) ||
    nameDesc.includes('เบลเซอร์') ||
    nameDesc.includes('ออฟฟิศ')
  ) {
    occasions.push('work')
  }

  // Chill/casual detection
  if (
    nameDesc.includes('casual') ||
    nameDesc.includes('t-shirt') ||
    nameDesc.includes('jeans') ||
    nameDesc.includes('shorts') ||
    nameDesc.includes('relaxed') ||
    nameDesc.includes('เสื้อยืด') ||
    nameDesc.includes('สบาย') ||
    input.formalityLevel <= 4
  ) {
    occasions.push('chill', 'cafe')
  }

  // Date/dinner detection
  if (
    nameDesc.includes('date') ||
    nameDesc.includes('romantic') ||
    nameDesc.includes('elegant') ||
    (nameDesc.includes('dress') && !nameDesc.includes('casual')) ||
    (input.formalityLevel >= 5 && input.formalityLevel <= 8)
  ) {
    occasions.push('date', 'dinner')
  }

  // Travel detection
  if (
    nameDesc.includes('comfort') ||
    nameDesc.includes('stretch') ||
    nameDesc.includes('packable') ||
    nameDesc.includes('travel') ||
    nameDesc.includes('เที่ยว')
  ) {
    occasions.push('travel')
  }

  // Cafe detection
  if (
    nameDesc.includes('cafe') ||
    nameDesc.includes('brunch') ||
    nameDesc.includes('casual dress') ||
    nameDesc.includes('คาเฟ่') ||
    (input.formalityLevel >= 2 && input.formalityLevel <= 5)
  ) {
    occasions.push('cafe')
  }

  return occasions
}

/**
 * Filter out incompatible occasions
 */
function filterIncompatibleOccasions(occasions: Set<OccasionType>, input: OccasionMappingInput): void {
  // Sport is exclusive
  if (occasions.has('sport')) {
    const nonSportOccasions: OccasionType[] = ['work', 'wedding', 'dinner', 'party']
    nonSportOccasions.forEach((occ) => occasions.delete(occ))
  }

  // Very formal events exclude casual occasions
  if (input.formalityLevel >= 8) {
    occasions.delete('chill')
    occasions.delete('sport')
    occasions.delete('travel')
  }

  // Very casual exclude formal events
  if (input.formalityLevel <= 2) {
    occasions.delete('wedding')
    occasions.delete('dinner')
    occasions.delete('work')
  }
}

/**
 * Calculate formality level from product attributes (Task 4.5)
 */
export function calculateFormalityLevel(input: OccasionMappingInput): FormalityLevel {
  const nameDesc = `${input.name || ''} ${input.description || ''}`.toLowerCase()
  let formality = 5 // Default middle

  // Very formal indicators (9-10)
  if (
    nameDesc.includes('tuxedo') ||
    nameDesc.includes('gown') ||
    nameDesc.includes('evening wear') ||
    nameDesc.includes('black tie') ||
    nameDesc.includes('ราตรี')
  ) {
    formality = 9
  }
  // Formal indicators (7-8)
  else if (
    nameDesc.includes('suit') ||
    nameDesc.includes('blazer') ||
    nameDesc.includes('formal') ||
    nameDesc.includes('เบลเซอร์') ||
    nameDesc.includes('สูท')
  ) {
    formality = 7
  }
  // Business casual (5-6)
  else if (
    nameDesc.includes('polo') ||
    nameDesc.includes('dress shirt') ||
    nameDesc.includes('เสื้อเชิ้ต') ||
    nameDesc.includes('โปโล') ||
    nameDesc.includes('business')
  ) {
    formality = 6
  }
  // Casual (3-4)
  else if (
    nameDesc.includes('t-shirt') ||
    nameDesc.includes('jeans') ||
    nameDesc.includes('casual') ||
    nameDesc.includes('เสื้อยืด') ||
    nameDesc.includes('ยีนส์')
  ) {
    formality = 3
  }
  // Very casual (1-2)
  else if (
    nameDesc.includes('sport') ||
    nameDesc.includes('athletic') ||
    nameDesc.includes('gym') ||
    nameDesc.includes('shorts') ||
    nameDesc.includes('ออกกำลัง')
  ) {
    formality = 1
  }

  // Adjust based on category
  if (input.category) {
    const lowerCat = input.category.toLowerCase()
    if (lowerCat.includes('dress') && !lowerCat.includes('casual')) formality = Math.max(formality, 6)
    if (lowerCat.includes('outerwear')) formality = Math.max(formality, 5)
  }

  // Adjust based on role
  if (input.role === 'dress') formality = Math.max(formality, 6)
  if (input.role === 'outerwear' && formality < 5) formality = 5

  return Math.max(1, Math.min(10, formality)) as FormalityLevel
}

/**
 * Get occasion recommendations with confidence scores
 */
export interface OccasionRecommendation {
  occasion: OccasionType
  confidence: number // 0-1
  reasons: string[]
}

/**
 * Get detailed occasion recommendations
 */
export function getOccasionRecommendations(input: OccasionMappingInput): OccasionRecommendation[] {
  const occasions = mapProductToOccasions(input)

  return occasions.map((occasion) => {
    const def = OCCASIONS[occasion]
    const confidence = calculateConfidence(occasion, input)
    const reasons = getReasons(occasion, input)

    return {
      occasion,
      confidence,
      reasons,
    }
  })
}

/**
 * Calculate confidence score for an occasion match
 */
function calculateConfidence(occasion: OccasionType, input: OccasionMappingInput): number {
  const def = OCCASIONS[occasion]
  let score = 0.5 // Base score

  // Formality match
  if (
    input.formalityLevel >= def.formalityRange.min &&
    input.formalityLevel <= def.formalityRange.max
  ) {
    score += 0.3
  }

  // Keyword match
  const nameDesc = `${input.name || ''} ${input.description || ''}`.toLowerCase()
  const matchingKeywords = def.keywords.filter((kw) => nameDesc.includes(kw.toLowerCase()))
  score += Math.min(0.2, matchingKeywords.length * 0.05)

  return Math.min(1, score)
}

/**
 * Get reasons for occasion match
 */
function getReasons(occasion: OccasionType, input: OccasionMappingInput): string[] {
  const def = OCCASIONS[occasion]
  const reasons: string[] = []
  const nameDesc = `${input.name || ''} ${input.description || ''}`.toLowerCase()

  // Formality reason
  if (
    input.formalityLevel >= def.formalityRange.min &&
    input.formalityLevel <= def.formalityRange.max
  ) {
    reasons.push(`Formality level ${input.formalityLevel} matches ${occasion}`)
  }

  // Keyword matches
  const matchingKeywords = def.keywords.filter((kw) => nameDesc.includes(kw.toLowerCase()))
  if (matchingKeywords.length > 0) {
    reasons.push(`Keywords: ${matchingKeywords.join(', ')}`)
  }

  return reasons
}
