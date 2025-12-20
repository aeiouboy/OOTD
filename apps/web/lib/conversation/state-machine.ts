/**
 * Conversation State Machine for System Prompt v3.0
 *
 * This module enforces strict conversation flow: CLARIFY FIRST → RECOMMEND SECOND
 * Prevents the critical issue where AI asks questions AFTER showing products.
 *
 * @version 3.0
 * @related-prd 0007-prd-system-prompt-v3-clarification-fix.md
 */

/**
 * Response modes - AI must operate in ONE mode per response
 * These are mutually exclusive states
 */
export type ResponseMode = 'CLARIFICATION' | 'RECOMMENDATION' | 'REDIRECT';

/**
 * User information collected during conversation
 */
export interface UserInfo {
  gender?: 'men' | 'women';
  occasion?: string;
  destination?: string;
  climate?: string;
  budget?: number;
}

/**
 * Clarification history entry
 * Tracks what questions have been asked to prevent repetition
 */
export interface ClarificationEntry {
  type: 'gender' | 'occasion' | 'destination' | 'budget';
  question: string;
  answer?: string;
  askedAt: Date;
}

/**
 * Complete conversation state
 * Tracks all context needed to make state machine decisions
 */
export interface ConversationState {
  /** Current mode for this turn */
  mode: ResponseMode;

  /** Number of clarification questions asked (max 2) */
  clarificationsAsked: number;

  /** Whether AI has provided product recommendations yet */
  hasProvidedRecommendations: boolean;

  /** User information collected from messages */
  userInfo: UserInfo;

  /** History of clarification questions asked */
  clarificationHistory: ClarificationEntry[];

  /** Product IDs already recommended (for duplicate prevention) */
  recommendedProductIds: string[];
}

/**
 * Creates an empty initial conversation state
 */
export function createEmptyState(): ConversationState {
  return {
    mode: 'CLARIFICATION',
    clarificationsAsked: 0,
    hasProvidedRecommendations: false,
    userInfo: {},
    clarificationHistory: [],
    recommendedProductIds: [],
  };
}

/**
 * Conversation State Machine
 *
 * Enforces the strict state machine logic:
 * - CLARIFICATION MODE: Ask questions ONLY, NO products
 * - RECOMMENDATION MODE: Show products ONLY, NO questions
 * - REDIRECT MODE: Off-topic handling
 *
 * Critical Rule: Once hasProvidedRecommendations=true, CANNOT enter CLARIFICATION mode again
 */
export class ConversationStateMachine {
  private state: ConversationState;

  /**
   * Initialize state machine with a conversation state
   * @param initialState - Starting state (defaults to empty state)
   */
  constructor(initialState?: ConversationState) {
    this.state = initialState || createEmptyState();
  }

  /**
   * Get current conversation state
   */
  getState(): ConversationState {
    return { ...this.state };
  }

  /**
   * Update conversation state
   * @param updates - Partial state updates to apply
   */
  updateState(updates: Partial<ConversationState>): void {
    this.state = {
      ...this.state,
      ...updates,
      userInfo: {
        ...this.state.userInfo,
        ...(updates.userInfo || {}),
      },
    };
  }

  /**
   * Reset state to empty (for new conversation)
   */
  reset(): void {
    this.state = createEmptyState();
  }

  /**
   * Decide which response mode to use for the current turn
   *
   * This is the CORE state machine logic that prevents asking questions after recommendations.
   *
   * Priority order (enforced strictly):
   * 1. Off-topic query → REDIRECT
   * 2. Already provided recommendations → RECOMMENDATION (post-recommendation lockout)
   * 3. Asked 2+ clarifications → RECOMMENDATION (force recommendation)
   * 4. Have sufficient info → RECOMMENDATION
   * 5. Missing critical info → CLARIFICATION
   * 6. Default → RECOMMENDATION
   *
   * @param userMessage - The user's latest message
   * @returns ResponseMode to use for AI response
   */
  decideMode(userMessage: string): ResponseMode {
    // Priority 1: Check if off-topic
    if (this.isOffTopic(userMessage)) {
      return 'REDIRECT';
    }

    // Priority 2: POST-RECOMMENDATION LOCKOUT
    // Once we've shown products, we CANNOT ask questions anymore
    if (this.state.hasProvidedRecommendations) {
      return 'RECOMMENDATION';
    }

    // Priority 3: Force recommendation after 2 clarifications
    if (this.state.clarificationsAsked >= 2) {
      return 'RECOMMENDATION';
    }

    // Priority 4: Check if we have sufficient info to recommend
    if (this.hasSufficientInfo(userMessage)) {
      return 'RECOMMENDATION';
    }

    // Priority 5: Missing critical info → need clarification
    const missingInfo = this.detectMissingInfo(userMessage);
    if (missingInfo.length > 0) {
      return 'CLARIFICATION';
    }

    // Priority 6: Default to recommendation (safety fallback)
    return 'RECOMMENDATION';
  }

  /**
   * Check if the user's message is off-topic (not fashion-related)
   * Reuses logic from system-prompt-v2.1
   *
   * @param message - User message to check
   * @returns true if off-topic
   */
  private isOffTopic(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Off-topic keywords (non-fashion queries)
    const offTopicKeywords = [
      'ร้านอาหาร', 'อาหาร', 'กิน', 'ของกิน',
      'restaurant', 'food', 'eat',
      'โรงแรม', 'ที่พัก', 'hotel',
      'ที่เที่ยว', 'สถานที่ท่องเที่ยว', 'tourist',
      'แพทย์', 'หมอ', 'ยา', 'doctor', 'medicine',
      'กีฬา', 'sport', 'เกม', 'game',
      'ภาพยนตร์', 'หนัง', 'movie', 'film',
      'เพลง', 'ดนตรี', 'music', 'song',
    ];

    return offTopicKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Check if we have sufficient information to provide recommendations
   *
   * For CLOTHS category:
   * - Need: gender + occasion (minimum)
   * - Optional: destination, climate, budget
   *
   * For OTHER categories (shoes, bags, cosmetics):
   * - Don't need gender
   * - Just need to understand the query
   *
   * @param message - User message (to detect info in current message)
   * @returns true if ready to recommend
   */
  private hasSufficientInfo(message: string): boolean {
    // Detect if this is OTHER category (shoes, bags, cosmetics, accessories)
    if (this.isOtherCategory(message)) {
      // For OTHER categories, we don't need gender/occasion
      // Just need a clear question/need
      return true;
    }

    // For CLOTHS category, check if we have critical info
    const hasGender =
      this.state.userInfo.gender !== undefined ||
      this.detectGender(message);

    const hasOccasion =
      this.state.userInfo.occasion !== undefined ||
      this.detectOccasion(message);

    // Need both gender and occasion for CLOTHS
    return hasGender && hasOccasion;
  }

  /**
   * Detect what critical information is missing
   * Returns array of missing fields in priority order
   *
   * @param message - User message (to check current message for info)
   * @returns Array of missing field types
   */
  private detectMissingInfo(message: string): Array<'gender' | 'occasion' | 'destination' | 'budget'> {
    const missing: Array<'gender' | 'occasion' | 'destination' | 'budget'> = [];

    // Skip gender/occasion check for OTHER categories
    if (this.isOtherCategory(message)) {
      return missing; // Nothing is "missing" for OTHER categories
    }

    // Check for gender (HIGH priority)
    if (!this.state.userInfo.gender && !this.detectGender(message)) {
      missing.push('gender');
    }

    // Check for occasion (HIGH priority)
    if (!this.state.userInfo.occasion && !this.detectOccasion(message)) {
      missing.push('occasion');
    }

    // Check for destination (MEDIUM priority, only if travel-related)
    if (this.isTravelQuery(message)) {
      if (!this.state.userInfo.destination && !this.detectDestination(message)) {
        missing.push('destination');
      }
    }

    // Budget is LOW priority, usually not asked
    // Only add if everything else is present
    if (missing.length === 0 && !this.state.userInfo.budget) {
      // Don't add budget to missing - it's truly optional
      // missing.push('budget');
    }

    return missing;
  }

  /**
   * Detect if user message contains gender information
   * @param message - User message to check
   * @returns true if gender is detected
   */
  private detectGender(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    const genderKeywords = [
      'ผู้หญิง', 'หญิง', 'ผญ', 'สาว',
      'ผู้ชาย', 'ชาย', 'ผช', 'หนุ่ม',
      'women', 'woman', 'female', 'girl', 'lady',
      'men', 'man', 'male', 'boy', 'guy',
    ];

    return genderKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Detect if user message contains occasion information
   * @param message - User message to check
   * @returns true if occasion is detected
   */
  private detectOccasion(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    const occasionKeywords = [
      // Work/Professional
      'ทำงาน', 'ออฟฟิศ', 'ประชุม', 'work', 'office', 'meeting', 'professional',

      // Wedding/Formal
      'งานแต่ง', 'แต่งงาน', 'งานบวช', 'งานเลี้ยง', 'wedding', 'formal', 'ceremony',

      // Date/Romantic
      'เดท', 'date', 'romantic', 'ดินเนอร์', 'dinner',

      // Party/Social
      'ปาร์ตี้', 'งานเลี้ยง', 'party', 'club', 'nightout',

      // Casual/Chill
      'เที่ยว', 'ชิล', 'chill', 'casual', 'hangout', 'café', 'คาเฟ่',

      // Sport/Active
      'ออกกำลัง', 'ฟิตเนส', 'วิ่ง', 'sport', 'gym', 'workout', 'fitness',

      // Travel
      'ท่องเที่ยว', 'เที่ยว', 'travel', 'trip', 'vacation', 'holiday',
    ];

    return occasionKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Detect if user message contains destination information
   * @param message - User message to check
   * @returns true if destination is detected
   */
  private detectDestination(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    const destinationKeywords = [
      // Thailand locations
      'กรุงเทพ', 'bangkok', 'เชียงใหม่', 'chiangmai', 'ภูเก็ต', 'phuket',
      'พัทยา', 'pattaya', 'หัวหิน', 'huahin', 'เกาะ', 'island',

      // Popular Asian destinations
      'ญี่ปุ่น', 'japan', 'tokyo', 'โตเกียว', 'osaka', 'โอซาก้า',
      'เกาหลี', 'korea', 'seoul', 'โซล',
      'สิงคโปร์', 'singapore',
      'ฮ่องกง', 'hongkong',
      'บาหลี', 'bali',

      // Western destinations
      'ยุโรป', 'europe', 'paris', 'ปารีส', 'london', 'ลอนดอน',
      'อเมริกา', 'america', 'usa', 'นิวยอร์ก', 'newyork',

      // Climate indicators
      'ทะเล', 'beach', 'sea', 'หิมะ', 'snow', 'เขา', 'mountain',
    ];

    return destinationKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Check if the query is travel-related
   * @param message - User message to check
   * @returns true if travel query
   */
  private isTravelQuery(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    const travelKeywords = [
      'เที่ยว', 'ท่องเที่ยว', 'ไปเที่ยว',
      'travel', 'trip', 'vacation', 'holiday',
      'เดินทาง', 'ไป', 'go to',
    ];

    return travelKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Check if the query is about OTHER categories (not CLOTHS)
   * OTHER categories: shoes, bags, cosmetics, accessories
   * These don't require gender/occasion clarification
   *
   * @param message - User message to check
   * @returns true if OTHER category
   */
  private isOtherCategory(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    const otherCategoryKeywords = [
      // Shoes
      'รองเท้า', 'shoes', 'sneakers', 'heels', 'boots', 'sandals',

      // Bags
      'กระเป๋า', 'bag', 'backpack', 'handbag', 'purse', 'wallet',

      // Cosmetics & Beauty
      'เครื่องสำอาง', 'cosmetics', 'makeup', 'beauty',
      'ลิปสติก', 'lipstick', 'รองพื้น', 'foundation',
      'ครีม', 'cream', 'skincare', 'ดูแลผิว',

      // Accessories
      'เครื่องประดับ', 'accessories', 'jewelry',
      'สร้อย', 'necklace', 'ต่างหู', 'earrings',
      'แหวน', 'ring', 'สร้อยข้อมือ', 'bracelet',
      'นาฬิกา', 'watch',
      'แว่น', 'sunglasses', 'glasses',
      'ผ้าพัน', 'scarf', 'เข็มขัด', 'belt',
    ];

    return otherCategoryKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Get the next clarification question to ask
   * Filters out questions already asked and selects by priority
   *
   * Priority order: gender → occasion → destination → budget
   *
   * @param missingFields - Array of missing field types from detectMissingInfo()
   * @returns Clarification entry with type and question, or null if nothing to ask
   */
  getNextClarification(
    missingFields: Array<'gender' | 'occasion' | 'destination' | 'budget'>
  ): { type: 'gender' | 'occasion' | 'destination' | 'budget'; question: string } | null {
    // Filter out already-asked questions
    const alreadyAsked = this.state.clarificationHistory.map((entry) => entry.type);

    // Find the first missing field that hasn't been asked yet
    for (const field of missingFields) {
      if (!alreadyAsked.includes(field)) {
        // Get the question text for this field
        const question = this.getClarificationQuestion(field);
        return { type: field, question };
      }
    }

    // No more clarifications needed
    return null;
  }

  /**
   * Get the Thai question text for a clarification type
   *
   * @param type - The type of clarification needed
   * @returns Thai question string with emojis
   */
  getClarificationQuestion(type: 'gender' | 'occasion' | 'destination' | 'budget'): string {
    const questions: Record<string, string> = {
      gender: 'อยากหาชุดผู้หญิงหรือผู้ชายคะ? 👔👗',
      occasion: 'ชุดนี้เอาไว้ใส่โอกาสไหนคะ? ไปทำงาน เดท หรือไปงานสังสรรค์? 🎉',
      destination: 'ไปเที่ยวที่ไหนคะ? อากาศร้อนหรือหนาวเหรอคะ? 🌴❄️',
      budget: 'มีงบประมาณช่วงไหนมั้ยคะ? จะได้แนะนำให้เหมาะสม 💰',
    };

    return questions[type] || '';
  }
}
