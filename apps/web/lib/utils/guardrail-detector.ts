/**
 * Guardrail Detection Utilities
 *
 * Detects off-topic queries and determines appropriate redirect responses.
 * Ensures the assistant stays focused on fashion-related topics.
 *
 * Related PRD: 0006-prd-system-prompt-enhancement-guardrails.md
 * Task: 5.1-5.4 - Guardrail detection and pattern matching
 *
 * @version 1.0.0
 * @created 2025-10-14
 */

import type { GuardrailCategory } from '../types/chat-types';
import { getRedirectMessage, isFashionAdjacent } from '../prompts/guardrail-responses';

/**
 * Topic patterns for each off-topic category
 */
const TOPIC_PATTERNS: Record<GuardrailCategory, string[]> = {
  health: [
    // Thai keywords
    'สุขภาพ',
    'โรค',
    'ยา',
    'หมอ',
    'โรงพยาบาล',
    'คลินิก',
    'รักษา',
    'อาการ',
    'ป่วย',
    'เจ็บ',
    'วิตามิน',
    'โภชนาการ',
    // English keywords
    'health',
    'disease',
    'medicine',
    'doctor',
    'hospital',
    'clinic',
    'treatment',
    'symptom',
    'sick',
    'pain',
    'vitamin',
    'nutrition',
    'medical',
    'prescription',
  ],

  technology: [
    // Thai keywords
    'คอมพิวเตอร์',
    'มือถือ',
    'แท็บเล็ต',
    'แล็ปท็อป',
    'ซอฟต์แวร์',
    'โปรแกรม',
    'แอพ',
    'เกม',
    'อินเทอร์เน็ต',
    'ไวไฟ',
    // English keywords
    'computer',
    'laptop',
    'phone',
    'smartphone',
    'tablet',
    'software',
    'program',
    'app',
    'application',
    'game',
    'internet',
    'wifi',
    'tech',
    'gadget',
    'device',
    'iphone',
    'android',
  ],

  food: [
    // Thai keywords
    'อาหาร',
    'ร้านอาหาร',
    'กิน',
    'อร่อย',
    'เมนู',
    'สูตร',
    'ทำอาหาร',
    'ปรุง',
    'วัตถุดิบ',
    // English keywords
    'food',
    'restaurant',
    'eat',
    'delicious',
    'menu',
    'recipe',
    'cook',
    'cooking',
    'ingredient',
    'cuisine',
    'dish',
    'meal',
  ],

  travel: [
    // Thai keywords
    'ที่พัก',
    'โรงแรม',
    'รีสอร์ท',
    'เครื่องบิน',
    'ตั๋ว',
    'จอง',
    'สถานที่ท่องเที่ยว',
    'แหล่งท่องเที่ยว',
    // English keywords
    'hotel',
    'resort',
    'accommodation',
    'flight',
    'ticket',
    'booking',
    'reservation',
    'tourist spot',
    'attraction',
    'sightseeing',
  ],

  inappropriate: [
    // Sensitive topics
    'politics',
    'religion',
    'การเมือง',
    'ศาสนา',
    'เพศ',
    'sexual',
    'adult',
  ],

  general: [
    // General non-fashion topics
    'weather',
    'อากาศ',
    'news',
    'ข่าว',
    'movie',
    'หนัง',
    'music',
    'เพลง',
    'book',
    'หนังสือ',
  ],

  default: [],
};

/**
 * Fashion-related keywords to identify on-topic queries
 */
const FASHION_KEYWORDS = [
  // Thai keywords
  'เสื้อ',
  'กางเกง',
  'ชุด',
  'แต่งตัว',
  'แฟชั่น',
  'สไตล์',
  'ใส่',
  'รองเท้า',
  'กระโปรง',
  'เดรส',
  'เสื้อผ้า',
  'เครื่องแต่งกาย',
  'ลุค',
  'คอลเลคชั่น',
  'แบรนด์',
  'ออฟฟิศ',
  'ทำงาน',
  'เดท',
  'งานแต่ง',
  'ปาร์ตี้',
  // English keywords
  'clothes',
  'clothing',
  'outfit',
  'fashion',
  'style',
  'wear',
  'dress',
  'shirt',
  'pants',
  'shoes',
  'skirt',
  'suit',
  'jacket',
  'coat',
  'sweater',
  'jeans',
  'shorts',
  'accessories',
  'bag',
  'accessory',
  'look',
  'collection',
  'brand',
];

/**
 * Detects if a query is off-topic (not fashion-related)
 *
 * @param message - User's message
 * @returns Object with isOffTopic flag and detected category
 */
export function detectOffTopic(message: string): {
  isOffTopic: boolean;
  category: GuardrailCategory;
  confidence: number;
} {
  const lowerMessage = message.toLowerCase();

  // First check if it's fashion-adjacent (allowed even if mentions other topics)
  if (isFashionAdjacent(message)) {
    return {
      isOffTopic: false,
      category: 'default',
      confidence: 0,
    };
  }

  // Check if message contains fashion keywords
  const hasFashionKeywords = FASHION_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));

  if (hasFashionKeywords) {
    return {
      isOffTopic: false,
      category: 'default',
      confidence: 0,
    };
  }

  // Check each off-topic category
  let detectedCategory: GuardrailCategory = 'default';
  let maxMatches = 0;

  for (const [category, patterns] of Object.entries(TOPIC_PATTERNS)) {
    if (category === 'default') continue;

    const matches = patterns.filter((pattern) => lowerMessage.includes(pattern));

    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      detectedCategory = category as GuardrailCategory;
    }
  }

  // Calculate confidence (0-1 scale)
  const confidence = Math.min(maxMatches * 0.3, 1);

  // Consider off-topic if we have at least 1 match and no fashion keywords
  const isOffTopic = maxMatches > 0 && !hasFashionKeywords;

  return {
    isOffTopic,
    category: detectedCategory,
    confidence,
  };
}

/**
 * Checks if message is purely fashion-related
 *
 * @param message - User's message
 * @returns True if fashion-related
 */
export function isFashionRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check for fashion keywords
  const hasFashionKeywords = FASHION_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));

  if (hasFashionKeywords) {
    return true;
  }

  // Check if fashion-adjacent
  if (isFashionAdjacent(message)) {
    return true;
  }

  return false;
}

/**
 * Determines appropriate redirect message for off-topic query
 *
 * @param category - Detected off-topic category
 * @returns Redirect message
 */
export function getGuardrailRedirect(category: GuardrailCategory): string {
  return getRedirectMessage(category);
}

/**
 * Main guardrail check - returns redirect message if off-topic
 *
 * @param message - User's message
 * @returns Redirect message if off-topic, null if on-topic
 */
export function checkGuardrails(message: string): string | null {
  const { isOffTopic, category, confidence } = detectOffTopic(message);

  if (isOffTopic && confidence > 0.5) {
    return getGuardrailRedirect(category);
  }

  return null;
}

/**
 * Validates message against guardrails
 *
 * @param message - User's message
 * @returns Validation result
 */
export function validateMessage(message: string): {
  isValid: boolean;
  category: GuardrailCategory;
  redirectMessage?: string;
} {
  const { isOffTopic, category, confidence } = detectOffTopic(message);

  if (isOffTopic && confidence > 0.5) {
    return {
      isValid: false,
      category,
      redirectMessage: getGuardrailRedirect(category),
    };
  }

  return {
    isValid: true,
    category: 'default',
  };
}

/**
 * Gets detailed analysis of message topic
 *
 * @param message - User's message
 * @returns Detailed topic analysis
 */
export function analyzeMessageTopic(message: string): {
  isFashionRelated: boolean;
  isFashionAdjacent: boolean;
  isOffTopic: boolean;
  detectedCategory: GuardrailCategory;
  confidence: number;
  fashionKeywordsFound: string[];
  offTopicKeywordsFound: string[];
} {
  const lowerMessage = message.toLowerCase();

  // Find fashion keywords
  const fashionKeywordsFound = FASHION_KEYWORDS.filter((keyword) =>
    lowerMessage.includes(keyword)
  );

  // Find off-topic keywords
  const offTopicKeywordsFound: string[] = [];
  let detectedCategory: GuardrailCategory = 'default';
  let maxMatches = 0;

  for (const [category, patterns] of Object.entries(TOPIC_PATTERNS)) {
    if (category === 'default') continue;

    const matches = patterns.filter((pattern) => lowerMessage.includes(pattern));

    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      detectedCategory = category as GuardrailCategory;
      offTopicKeywordsFound.push(...matches);
    }
  }

  const confidence = Math.min(maxMatches * 0.3, 1);
  const isOffTopic = maxMatches > 0 && fashionKeywordsFound.length === 0;

  return {
    isFashionRelated: fashionKeywordsFound.length > 0,
    isFashionAdjacent: isFashionAdjacent(message),
    isOffTopic,
    detectedCategory,
    confidence,
    fashionKeywordsFound,
    offTopicKeywordsFound,
  };
}

/**
 * Export all utilities
 */
export default {
  detectOffTopic,
  isFashionRelated,
  getGuardrailRedirect,
  checkGuardrails,
  validateMessage,
  analyzeMessageTopic,
};
