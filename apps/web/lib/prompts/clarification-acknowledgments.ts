/**
 * Clarification Acknowledgment Responses
 *
 * Friendly acknowledgments when users provide clarifying information.
 * Makes the conversation feel natural and appreciated.
 *
 * Related PRD: 0006-prd-system-prompt-enhancement-guardrails.md
 * Task: 4.8 - Add clarification acknowledgment responses
 *
 * @version 1.0.0
 * @created 2025-10-14
 */

export interface AcknowledgmentResponse {
  type: 'gender' | 'occasion' | 'destination' | 'budget';
  responses: string[];
}

/**
 * Acknowledgment responses by clarification type
 */
export const ACKNOWLEDGMENTS: Record<string, string[]> = {
  gender: [
    'โอเคค่ะ! เข้าใจแล้ว 👍',
    'เข้าใจแล้วนะคะ! 😊',
    'ได้เลยค่ะ! เดี๋ยวหาให้ 💕',
    'รับทราบค่ะ! ✨',
  ],

  occasion: [
    'เข้าใจแล้วค่ะ! งานนี้เราช่วยได้เลย 🎉',
    'โอเคเลย! เดี๋ยวหาชุดให้นะคะ ✨',
    'ได้เลยค่ะ! ชุดโอกาสนี้เรามีเยอะเลย 😊',
    'เข้าใจแล้ว! มาดูกันเลยว่าชุดไหนเหมาะที่สุด 💫',
  ],

  destination: [
    'เท่ห์เลย! ไปที่นั่นต้องสนุกแน่นอน ✈️',
    'ว้าว! ที่นั่นสวยมาก เดี๋ยวหาชุดให้เหมาะกับสภาพอากาศนะคะ 🌴',
    'โอเคค่ะ! เราจะหาชุดที่เหมาะกับที่นั่นให้เลย 🗺️',
    'เข้าใจแล้ว! งานนี้ต้องเตรียมชุดให้พร้อมเลย 🧳',
  ],

  budget: [
    'เข้าใจค่ะ! เดี๋ยวหาให้ในงบนี้เลย 💰',
    'โอเคเลย! เราจะหาชุดสวยๆ ให้เหมาะกับกระเป๋านะคะ ✨',
    'ได้เลยค่ะ! ในงบนี้เรามีชุดเจ๋งๆ เยอะเลย 😊',
    'รับทราบค่ะ! งบนี้พอดีเลย 💕',
  ],
};

/**
 * Gets a random acknowledgment for a specific clarification type
 *
 * @param type - Type of clarification answered
 * @returns Random acknowledgment message
 */
export function getAcknowledgment(type: 'gender' | 'occasion' | 'destination' | 'budget'): string {
  const responses = ACKNOWLEDGMENTS[type] || ACKNOWLEDGMENTS.gender;
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

/**
 * Contextual acknowledgments based on specific values
 */
export const CONTEXTUAL_ACKNOWLEDGMENTS: Record<string, Record<string, string>> = {
  gender: {
    men: 'เข้าใจแล้วค่ะ! ชุดผู้ชายเรามีเท่ๆ เยอะเลย 👔',
    women: 'เข้าใจแล้วค่ะ! ชุดผู้หญิงเรามีสวยๆ เยอะเลย 👗',
  },

  occasion: {
    work: 'เข้าใจแล้วค่ะ! ชุดออฟฟิศเรามีสไตล์เป็นมืออาชีพเยอะเลย 💼',
    wedding: 'ว้าว! งานแต่งงานเลยเหรอคะ ชุดโอกาสนี้ต้องสวยพิเศษเลย 💐',
    date: 'หวานมากเลยค่ะ! ชุดเดทเราจัดให้แน่นอน 💕',
    party: 'สนุกมากเลย! งานปาร์ตี้ต้องลุคเจิดจ้าเลย 🎉',
    travel: 'เที่ยวที่ไหนมาคะ? เดี๋ยวเราหาชุดให้เหมาะกับการเดินทาง ✈️',
  },

  destination: {
    'เชียงใหม่': 'เชียงใหม่สวยมาก! อากาศเย็นนะคะ เดี๋ยวหาชุดที่เหมาะให้ 🌄',
    'ภูเก็ต': 'ภูเก็ตเลย! ทะเลสวยมาก ชุดนี้ต้องสดใสและเย็นสบาย 🏖️',
    'japan': 'ญี่ปุ่นเลย! ต้องเตรียมชุดกันหนาวด้วยนะคะ 🗾',
    'korea': 'เกาหลีสวยมาก! อากาศเย็น ชุดต้องอุ่นและมีสไตล์ 🇰🇷',
  },

  budget: {
    low: 'งบนี้ดีเลยค่ะ! เราจะหาชุดคุณภาพดีในราคาที่คุ้มค่าให้ 💰',
    medium: 'งบนี้เหมาะมากค่ะ! มีชุดสวยๆ ให้เลือกเยอะเลย ✨',
    high: 'ว้าว! งบนี้เราจะหาชุดพรีเมียมสวยๆ ให้เลยนะคะ 💎',
  },
};

/**
 * Gets contextual acknowledgment based on detected value
 *
 * @param type - Type of clarification
 * @param value - Detected value
 * @returns Contextual acknowledgment or generic one
 */
export function getContextualAcknowledgment(
  type: 'gender' | 'occasion' | 'destination' | 'budget',
  value?: string | number
): string {
  if (!value) {
    return getAcknowledgment(type);
  }

  // Convert value to string for lookup
  const valueStr = String(value).toLowerCase();

  // Check for exact match in contextual acknowledgments
  const contextual = CONTEXTUAL_ACKNOWLEDGMENTS[type];
  if (contextual && contextual[valueStr]) {
    return contextual[valueStr];
  }

  // For budget, categorize into low/medium/high
  if (type === 'budget' && typeof value === 'number') {
    if (value < 3000) {
      return CONTEXTUAL_ACKNOWLEDGMENTS.budget.low;
    } else if (value < 8000) {
      return CONTEXTUAL_ACKNOWLEDGMENTS.budget.medium;
    } else {
      return CONTEXTUAL_ACKNOWLEDGMENTS.budget.high;
    }
  }

  // Fallback to generic acknowledgment
  return getAcknowledgment(type);
}

/**
 * Combines acknowledgment with follow-up message
 *
 * @param type - Type of clarification
 * @param value - Detected value
 * @returns Full acknowledgment with follow-up
 */
export function getFullAcknowledgment(
  type: 'gender' | 'occasion' | 'destination' | 'budget',
  value?: string | number
): string {
  const acknowledgment = getContextualAcknowledgment(type, value);

  const followUps = [
    'ขอเวลาแปปนะคะ กำลังหาให้... 🔍',
    'เดี๋ยวนะคะ กำลังเลือกมาให้... ✨',
    'รอแปปนะคะ กำลังจัดชุดมาให้... 💕',
  ];

  const randomFollowUp = followUps[Math.floor(Math.random() * followUps.length)];

  return `${acknowledgment}\n\n${randomFollowUp}`;
}

/**
 * Export all utilities
 */
export default {
  ACKNOWLEDGMENTS,
  CONTEXTUAL_ACKNOWLEDGMENTS,
  getAcknowledgment,
  getContextualAcknowledgment,
  getFullAcknowledgment,
};
