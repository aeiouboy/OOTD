/**
 * Response Validation for System Prompt v3.0
 *
 * This module validates AI responses to ensure they match the expected mode.
 * Prevents mixed-mode responses (e.g., showing products AND asking questions).
 *
 * @version 3.0
 * @related-prd 0007-prd-system-prompt-v3-clarification-fix.md
 */

import { ResponseMode } from './state-machine';

/**
 * Validation result with errors if validation fails
 */
export interface ValidationResult {
  /** Whether the response is valid for the expected mode */
  isValid: boolean;

  /** Array of validation error messages */
  errors: string[];
}

/**
 * Response Validator
 *
 * Validates that AI responses conform to the expected mode:
 * - CLARIFICATION: Must have question, must NOT have products
 * - RECOMMENDATION: Must have products, must NOT have questions
 * - REDIRECT: Plain message only, no questions or products
 */
export class ResponseValidator {
  /**
   * Validate an AI response against the expected mode
   *
   * @param response - The AI-generated response text
   * @param expectedMode - The mode that was decided by state machine
   * @returns ValidationResult with isValid flag and any errors
   */
  validate(response: string, expectedMode: ResponseMode): ValidationResult {
    const errors: string[] = [];

    switch (expectedMode) {
      case 'CLARIFICATION':
        return this.validateClarificationMode(response);

      case 'RECOMMENDATION':
        return this.validateRecommendationMode(response);

      case 'REDIRECT':
        return this.validateRedirectMode(response);

      default:
        errors.push(`Unknown mode: ${expectedMode}`);
        return { isValid: false, errors };
    }
  }

  /**
   * Validate CLARIFICATION mode response
   * Must have: question
   * Must NOT have: product links, prices
   */
  private validateClarificationMode(response: string): ValidationResult {
    const errors: string[] = [];

    // Check: Must have question
    if (!this.containsQuestion(response)) {
      errors.push('CLARIFICATION mode must contain a question');
    }

    // Check: Must NOT have products
    if (this.containsProductLinks(response)) {
      errors.push('CLARIFICATION mode must NOT contain products, prices, or links');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate RECOMMENDATION mode response
   * Must have: product links/prices
   * Must NOT have: questions
   */
  private validateRecommendationMode(response: string): ValidationResult {
    const errors: string[] = [];

    // Check: Must have products
    if (!this.containsProductLinks(response)) {
      errors.push('RECOMMENDATION mode must contain products with prices or links');
    }

    // Check: Must NOT have questions
    if (this.containsQuestion(response)) {
      errors.push('RECOMMENDATION mode must NOT contain questions');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate REDIRECT mode response
   * Should only have plain redirect message
   */
  private validateRedirectMode(response: string): ValidationResult {
    const errors: string[] = [];

    // Check: Should NOT have questions
    if (this.containsQuestion(response)) {
      errors.push('REDIRECT mode should NOT contain questions');
    }

    // Check: Should NOT have products
    if (this.containsProductLinks(response)) {
      errors.push('REDIRECT mode should NOT contain product recommendations');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if response contains a question
   * Looks for question marks and Thai question keywords
   */
  private containsQuestion(response: string): boolean {
    // Question mark
    if (response.includes('?')) {
      return true;
    }

    // Thai question keywords (often used even without '?')
    const questionKeywords = [
      'มั้ย', 'ไหม', 'หรือ', 'คะ?', 'ค่ะ?',
      'อยากหา', 'อยากได้', 'อยากดู',
      'มี', // Context: "มีงบประมาณมั้ย", "มีสไตล์ที่ชอบมั้ย"
    ];

    const lowerResponse = response.toLowerCase();

    // Check for question patterns
    // "หรือ" (or) often indicates a choice question
    if (lowerResponse.includes('หรือ') && lowerResponse.includes('คะ')) {
      return true;
    }

    // Check other question keywords
    return questionKeywords.some((keyword) => lowerResponse.includes(keyword));
  }

  /**
   * Check if response contains product links or prices
   * Looks for URLs, price indicators, and product formatting
   */
  private containsProductLinks(response: string): boolean {
    // URL patterns
    if (response.includes('http://') || response.includes('https://')) {
      return true;
    }

    // Link emoji
    if (response.includes('🔗')) {
      return true;
    }

    // Price indicators
    const priceIndicators = [
      '💰 ราคา',
      'ราคา:',
      'บาท',
      'THB',
      '฿',
    ];

    return priceIndicators.some((indicator) => response.includes(indicator));
  }
}
