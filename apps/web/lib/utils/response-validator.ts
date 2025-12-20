/**
 * Response Validator
 *
 * Validates AI responses for template compliance and loop detection.
 * Ensures responses follow Template A (CLOTHS) or Template B (OTHER) structure.
 *
 * Related: tasks-0006-prd-system-prompt-enhancement-guardrails-LOOP-FIX.md (Sub-task 9.7)
 *
 * @version 1.0.0
 * @created 2025-10-15
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether the response is valid */
  isValid: boolean
  /** Validation errors (if any) */
  errors: string[]
  /** Validation warnings (if any) */
  warnings: string[]
  /** Detected template type (if determinable) */
  detectedTemplate?: 'A' | 'B' | 'unknown'
}

/**
 * Template A validation result (CLOTHS category)
 */
export interface TemplateAValidation extends ValidationResult {
  /** Number of products detected */
  productCount: number
  /** Whether prices are included */
  hasPrices: boolean
  /** Whether links are included */
  hasLinks: boolean
  /** Whether styling tips are included */
  hasStylingTips: boolean
}

/**
 * Template B validation result (OTHER category)
 */
export interface TemplateBValidation extends ValidationResult {
  /** Number of tips detected */
  tipCount: number
  /** Whether prices are mentioned (should be false) */
  hasPrices: boolean
  /** Whether links are mentioned (should be false) */
  hasLinks: boolean
  /** Whether has separate product section (should be false) */
  hasSeparateProductSection: boolean
}

/**
 * Validates response structure to detect loop patterns
 * Returns true if response appears to be a loop (only questions, no content)
 *
 * @param response - AI response text
 * @returns True if loop detected
 */
export function detectLoop(response: string): boolean {
  if (!response || response.trim().length === 0) {
    return true // Empty response is a loop
  }

  const lowerResponse = response.toLowerCase()

  // Indicators of loop patterns
  const loopIndicators = {
    // Multiple question marks in short response
    multipleQuestions: (response.match(/\?/g) || []).length >= 2 && response.length < 300,

    // Only contains question(s) with no substantial content
    onlyQuestions:
      response.includes('?') &&
      !response.includes('💰') &&
      !response.includes('🔗') &&
      !response.includes('👔') &&
      !response.includes('👗') &&
      !response.includes('💡') &&
      !response.includes('✨'),

    // Asking for more information patterns
    askingMoreInfo:
      lowerResponse.includes('ข้อมูลเพิ่มเติม') ||
      lowerResponse.includes('more information') ||
      lowerResponse.includes('ช่วยบอก') ||
      lowerResponse.includes('could you tell') ||
      lowerResponse.includes('can you provide'),

    // Confirmation questions
    confirmationQuestion:
      lowerResponse.includes('ใช่มั้ย') ||
      lowerResponse.includes('ถูกต้องไหม') ||
      lowerResponse.includes('is that correct') ||
      lowerResponse.includes('right?'),

    // Follow-up questions after clarification
    followUpQuestion:
      (lowerResponse.includes('แล้ว') && response.includes('?')) ||
      (lowerResponse.includes('and what about') && response.includes('?')),
  }

  // Count how many loop indicators are present
  const loopIndicatorCount = Object.values(loopIndicators).filter(Boolean).length

  // If 2 or more indicators, likely a loop
  return loopIndicatorCount >= 2
}

/**
 * Validates response against Template A structure (CLOTHS category)
 *
 * Template A Requirements:
 * - 3-5 product recommendations
 * - Each product has: brand, price, link
 * - Styling tips section (1-3 tips)
 * - Overall summary
 *
 * @param response - AI response text
 * @returns TemplateAValidation result
 */
export function validateTemplateA(response: string): TemplateAValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Detect products using various patterns
  const productPatterns = [
    /👔/g,
    /👗/g,
    /\d+\.\s*\*\*[^*]+\*\*/g, // Numbered product list with bold
    /[•\-]\s*\*\*[^*]+\*\*/g, // Bullet product list with bold
    /Brand:/gi,
    /ยี่ห้อ:/g,
  ]

  let productCount = 0
  for (const pattern of productPatterns) {
    const matches = response.match(pattern)
    if (matches) {
      productCount = Math.max(productCount, matches.length)
    }
  }

  // Check for prices
  const pricePatterns = [/💰/g, /ราคา/g, /price/gi, /\d+[,\d]*\s*(?:บาท|baht|thb)/gi]
  const hasPrices = pricePatterns.some((pattern) => pattern.test(response))

  // Check for links
  const linkPatterns = [
    /🔗/g,
    /https?:\/\/[^\s]+/g,
    /\[.*?\]\(http/g, // Markdown links
    /central\.co\.th/gi,
  ]
  const hasLinks = linkPatterns.some((pattern) => pattern.test(response))

  // Check for styling tips
  const tipPatterns = [
    /✨/g,
    /styling tips/gi,
    /เคล็ดลับ/g,
    /tips:/gi,
    /วิธี/g,
    /💡/g,
  ]
  const hasStylingTips = tipPatterns.some((pattern) => pattern.test(response))

  // Validation: Product count
  if (productCount < 3) {
    errors.push(`Template A requires 3-5 products, found ${productCount}`)
  } else if (productCount > 5) {
    warnings.push(`Template A recommends max 5 products, found ${productCount}`)
  }

  // Validation: Prices
  if (!hasPrices) {
    errors.push('Template A requires prices for products')
  }

  // Validation: Links
  if (!hasLinks) {
    errors.push('Template A requires links to products')
  }

  // Validation: Styling tips
  if (!hasStylingTips) {
    warnings.push('Template A should include styling tips section')
  }

  // Overall validation
  const isValid = errors.length === 0

  return {
    isValid,
    errors,
    warnings,
    detectedTemplate: 'A',
    productCount,
    hasPrices,
    hasLinks,
    hasStylingTips,
  }
}

/**
 * Validates response against Template B structure (OTHER category)
 *
 * Template B Requirements:
 * - 1-3 practical tips/tricks
 * - Natural product mentions within tips (NO separate product section)
 * - NO prices
 * - NO links
 *
 * @param response - AI response text
 * @returns TemplateBValidation result
 */
export function validateTemplateB(response: string): TemplateBValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Detect tips using various patterns
  const tipPatterns = [
    /💡/g,
    /\d+\.\s*[^\n]+/g, // Numbered list
    /[•\-]\s*[^\n]+/g, // Bullet list
    /tip\s*\d+/gi,
    /ข้อ\s*\d+/g,
  ]

  let tipCount = 0
  for (const pattern of tipPatterns) {
    const matches = response.match(pattern)
    if (matches) {
      tipCount = Math.max(tipCount, matches.length)
    }
  }

  // Check for prices (should NOT be present in Template B)
  const pricePatterns = [/💰/g, /ราคา/g, /price/gi, /\d+[,\d]*\s*(?:บาท|baht|thb)/gi]
  const hasPrices = pricePatterns.some((pattern) => pattern.test(response))

  // Check for links (should NOT be present in Template B)
  const linkPatterns = [
    /🔗/g,
    /https?:\/\/[^\s]+/g,
    /\[.*?\]\(http/g,
    /central\.co\.th/gi,
  ]
  const hasLinks = linkPatterns.some((pattern) => pattern.test(response))

  // Check for separate product section (should NOT be present)
  const productSectionPatterns = [
    /product recommendations?:/gi,
    /แนะนำสินค้า:/g,
    /สินค้าแนะนำ:/g,
    /👔[\s\S]*👔[\s\S]*👔/, // Multiple product emojis suggest separate section
    /👗[\s\S]*👗[\s\S]*👗/,
  ]
  const hasSeparateProductSection = productSectionPatterns.some((pattern) =>
    pattern.test(response)
  )

  // Validation: Tip count
  if (tipCount < 1) {
    errors.push(`Template B requires 1-3 tips, found ${tipCount}`)
  } else if (tipCount > 3) {
    warnings.push(`Template B recommends max 3 tips, found ${tipCount}`)
  }

  // Validation: Prices (should NOT have)
  if (hasPrices) {
    errors.push('Template B should NOT include prices')
  }

  // Validation: Links (should NOT have)
  if (hasLinks) {
    errors.push('Template B should NOT include links')
  }

  // Validation: Separate product section (should NOT have)
  if (hasSeparateProductSection) {
    errors.push('Template B should NOT have separate product recommendation section')
  }

  // Overall validation
  const isValid = errors.length === 0

  return {
    isValid,
    errors,
    warnings,
    detectedTemplate: 'B',
    tipCount,
    hasPrices,
    hasLinks,
    hasSeparateProductSection,
  }
}

/**
 * Auto-detects template type and validates accordingly
 *
 * @param response - AI response text
 * @returns Validation result
 */
export function validateResponseStructure(response: string): ValidationResult {
  // First check if it's a loop
  if (detectLoop(response)) {
    return {
      isValid: false,
      errors: ['Response appears to be a conversational loop (only questions, no content)'],
      warnings: [],
      detectedTemplate: 'unknown',
    }
  }

  // Try to auto-detect template type
  const lowerResponse = response.toLowerCase()

  // Indicators of Template A (CLOTHS)
  const hasProductIndicators =
    response.includes('💰') ||
    response.includes('🔗') ||
    response.includes('👔') ||
    response.includes('👗') ||
    /price|ราคา/.test(lowerResponse) ||
    /link|ลิงก์/.test(lowerResponse)

  // Indicators of Template B (OTHER)
  const hasTipIndicators =
    response.includes('💡') ||
    /tip|เคล็ดลับ|วิธี/.test(lowerResponse) ||
    /how to|อย่างไร/.test(lowerResponse)

  // Decide which template to validate against
  if (hasProductIndicators && !hasTipIndicators) {
    // Likely Template A
    return validateTemplateA(response)
  } else if (hasTipIndicators && !hasProductIndicators) {
    // Likely Template B
    return validateTemplateB(response)
  } else if (hasProductIndicators && hasTipIndicators) {
    // Could be either - try Template A first (more common)
    const resultA = validateTemplateA(response)
    if (resultA.isValid) {
      return resultA
    }
    // If Template A fails, try Template B
    return validateTemplateB(response)
  } else {
    // Cannot determine template
    return {
      isValid: false,
      errors: ['Cannot determine template type - response lacks clear structure'],
      warnings: ['Consider adding product recommendations (Template A) or tips (Template B)'],
      detectedTemplate: 'unknown',
    }
  }
}

/**
 * Formats validation errors for logging
 *
 * @param validation - Validation result
 * @returns Formatted string
 */
export function formatValidationErrors(validation: ValidationResult): string {
  const lines: string[] = []

  lines.push(`[Response Validation] Template: ${validation.detectedTemplate || 'unknown'}`)
  lines.push(`[Response Validation] Valid: ${validation.isValid ? 'YES ✅' : 'NO ❌'}`)

  if (validation.errors.length > 0) {
    lines.push(`[Response Validation] Errors:`)
    validation.errors.forEach((error) => lines.push(`  - ${error}`))
  }

  if (validation.warnings.length > 0) {
    lines.push(`[Response Validation] Warnings:`)
    validation.warnings.forEach((warning) => lines.push(`  - ${warning}`))
  }

  return lines.join('\n')
}

/**
 * Validates that a follow-up response (Step 4) does not contain clarifying questions
 * In follow-up mode, the system must NEVER ask questions
 *
 * @param response - AI response text
 * @returns Validation result
 */
export function validateFollowUpResponse(response: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for question patterns that indicate clarification requests
  const questionPatterns = [
    // Thai clarification patterns
    /อยากหา.*ผู้หญิง.*หรือ.*ผู้ชาย.*\?/i,
    /โอกาส.*ไหน.*\?/i,
    /งบประมาณ.*เท่าไหร่.*\?/i,
    /ช่วยบอก.*ได้.*มั้ย.*\?/i,
    /ขอข้อมูลเพิ่มเติม/i,
    /ต้องการ.*แบบไหน.*\?/i,

    // English clarification patterns
    /what.*budget.*\?/i,
    /what.*occasion.*\?/i,
    /could you.*tell.*\?/i,
    /can you.*provide.*\?/i,
    /what.*style.*prefer.*\?/i,
    /need more information/i,
  ]

  let hasClarificationQuestion = false
  const detectedPatterns: string[] = []

  for (const pattern of questionPatterns) {
    if (pattern.test(response)) {
      hasClarificationQuestion = true
      detectedPatterns.push(pattern.toString())
    }
  }

  // Count question marks - too many in short response is suspicious
  const questionMarkCount = (response.match(/\?/g) || []).length
  const isShortResponse = response.length < 500

  if (hasClarificationQuestion) {
    errors.push('Follow-up response contains clarifying question(s) - this violates POST-RECOMMENDATION LOCKOUT')
    errors.push(`Detected patterns: ${detectedPatterns.join(', ')}`)
  }

  if (questionMarkCount >= 2 && isShortResponse) {
    warnings.push(`Response contains ${questionMarkCount} question marks in short response - may be asking for clarification`)
  }

  // Validate that response has actual content (recommendations)
  const hasRecommendationContent =
    response.includes('👔') ||
    response.includes('👗') ||
    response.includes('💡') ||
    /\d+\./g.test(response) || // Numbered list
    /[•\-]\s*.+/g.test(response) // Bullet points

  if (!hasRecommendationContent) {
    errors.push('Follow-up response lacks recommendation content')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    detectedTemplate: 'unknown',
  }
}

/**
 * Validates response structure with follow-up mode awareness
 *
 * @param response - AI response text
 * @param isFollowUpPhase - Whether we're in follow-up phase (Step 4)
 * @returns Validation result
 */
export function validateResponseWithPhase(
  response: string,
  isFollowUpPhase: boolean
): ValidationResult {
  // Always run base validation first
  const baseValidation = validateResponseStructure(response)

  // If in follow-up phase, also check for POST-RECOMMENDATION LOCKOUT violations
  if (isFollowUpPhase) {
    const followUpValidation = validateFollowUpResponse(response)

    // Combine errors and warnings
    return {
      isValid: baseValidation.isValid && followUpValidation.isValid,
      errors: [...baseValidation.errors, ...followUpValidation.errors],
      warnings: [...baseValidation.warnings, ...followUpValidation.warnings],
      detectedTemplate: baseValidation.detectedTemplate,
    }
  }

  return baseValidation
}

/**
 * Export all utilities
 */
export default {
  detectLoop,
  validateTemplateA,
  validateTemplateB,
  validateResponseStructure,
  validateFollowUpResponse,
  validateResponseWithPhase,
  formatValidationErrors,
}
