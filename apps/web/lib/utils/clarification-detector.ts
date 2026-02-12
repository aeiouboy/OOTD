/**
 * Clarification Detection Utilities
 *
 * Detects when user queries are missing critical information
 * and determines which clarifying questions to ask.
 *
 * Related PRD: 0006-prd-system-prompt-enhancement-guardrails.md
 * Task: 4.1 - Create clarification detection utilities
 *
 * @version 1.0.0
 * @created 2025-10-14
 */

import type { UserQuery, ClarificationNeeded } from '../types/chat-types';

/**
 * Analyzes user message to detect missing information
 *
 * @param message - User's message
 * @returns UserQuery object with detection results
 */
export function analyzeUserQuery(message: string): UserQuery {
  const lowerMessage = message.toLowerCase();

  return {
    message,
    hasGender: detectGender(message) !== undefined,
    hasOccasion: detectOccasion(message) !== undefined,
    hasBudget: detectBudget(message) !== undefined,
    hasDestination: detectDestination(message) !== undefined,
    isTravelQuery: isTravelQuery(message),
    detectedGender: detectGender(message),
    detectedOccasion: detectOccasion(message),
    detectedBudget: detectBudget(message),
    detectedDestination: detectDestination(message),
  };
}

/**
 * Detects gender preference from user message
 *
 * @param message - User's message
 * @returns 'men' | 'women' | undefined
 */
export function detectGender(message: string): 'men' | 'women' | undefined {
  const lowerMessage = message.toLowerCase();

  // Check for explicit gender mentions
  const menKeywords = ['ผู้ชาย', 'ชาย', 'men', 'man', 'male', 'gentleman', 'guy'];
  const womenKeywords = ['ผู้หญิง', 'หญิง', 'women', 'woman', 'female', 'lady', 'girl'];

  const hasMen = menKeywords.some((keyword) => lowerMessage.includes(keyword));
  const hasWomen = womenKeywords.some((keyword) => lowerMessage.includes(keyword));

  // If both mentioned, unclear - return undefined
  if (hasMen && hasWomen) {
    return undefined;
  }

  if (hasMen) {
    return 'men';
  }

  if (hasWomen) {
    return 'women';
  }

  return undefined;
}

/**
 * Detects occasion from user message
 *
 * @param message - User's message
 * @returns Occasion string or undefined
 */
export function detectOccasion(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();

  const occasionPatterns: Record<string, string[]> = {
    work: ['work', 'office', 'meeting', 'presentation', 'ทำงาน', 'ออฟฟิศ', 'ประชุม', 'นำเสนอ'],
    chill: ['chill', 'relax', 'weekend', 'casual', 'วันหยุด', 'ชิลล์', 'สบายๆ', 'ผ่อนคลาย'],
    wedding: ['wedding', 'งานแต่ง', 'แต่งงาน', 'งานบวช'],
    sport: ['sport', 'gym', 'workout', 'exercise', 'ออกกำลัง', 'วิ่ง', 'ฟิตเนส', 'โยคะ'],
    travel: ['travel', 'trip', 'vacation', 'ท่องเที่ยว', 'เที่ยว', 'ทริป', 'ทะเล', 'ชายหาด', 'เกาะ', 'ริมทะเล', 'beach', 'island', 'seaside', 'ภูเขา', 'mountain'],
    date: ['date', 'romantic', 'เดท', 'โรแมนติก'],
    dinner: ['dinner', 'restaurant', 'dining', 'ดินเนอร์', 'ร้านอาหาร', 'กินข้าว'],
    cafe: ['cafe', 'coffee', 'brunch', 'คาเฟ่', 'กาแฟ', 'บรันช์'],
    party: ['party', 'celebration', 'event', 'ปาร์ตี้', 'งานเลี้ยง', 'งานสังสรรค์', 'คอนเสิร์ต'],
  };

  for (const [occasion, keywords] of Object.entries(occasionPatterns)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return occasion;
    }
  }

  return undefined;
}

/**
 * Detects budget from user message
 *
 * @param message - User's message
 * @returns Budget amount or undefined
 */
export function detectBudget(message: string): number | undefined {
  const budgetPatterns = [
    /(?:budget|ราคา|งบ).*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(\d{1,3}(?:,\d{3})*)[\s]*(?:baht|บาท|thb)/i,
    /(?:under|below|ไม่เกิน|แค่|ประมาณ).*?(\d{1,3}(?:,\d{3})*)/i,
  ];

  for (const pattern of budgetPatterns) {
    const match = message.match(pattern);
    if (match) {
      const budgetStr = match[1].replace(/,/g, '');
      const budget = parseFloat(budgetStr);
      if (!isNaN(budget) && budget > 0) {
        return budget;
      }
    }
  }

  return undefined;
}

/**
 * Detects destination from user message
 *
 * @param message - User's message
 * @returns Destination string or undefined
 */
export function detectDestination(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();

  // Common Thai destinations
  const destinations = [
    'เชียงใหม่',
    'ภูเก็ต',
    'พัทยา',
    'กระบี่',
    'เกาะสมุย',
    'หัวหิน',
    'อยุธยา',
    'สุโขทัย',
    'เชียงราย',
    'อุดรธานี',
  ];

  for (const destination of destinations) {
    if (lowerMessage.includes(destination)) {
      return destination;
    }
  }

  // International destinations
  const intlDestinations = [
    'japan',
    'korea',
    'singapore',
    'tokyo',
    'seoul',
    'paris',
    'london',
    'new york',
    'bali',
    'maldives',
  ];

  for (const destination of intlDestinations) {
    if (lowerMessage.includes(destination)) {
      return destination;
    }
  }

  // Check for generic travel patterns
  const travelPatterns = [
    /(?:ไป|เที่ยว|ท่องเที่ยว)[\s]*([ก-๙a-z\s]+?)(?:\s|$|ค่ะ|คะ)/i,
    /(?:travel to|trip to|visit)[\s]+([a-z\s]+?)(?:\s|$|,)/i,
  ];

  for (const pattern of travelPatterns) {
    const match = lowerMessage.match(pattern);
    if (match && match[1]) {
      const destination = match[1].trim();
      if (destination.length > 2 && destination.length < 30) {
        return destination;
      }
    }
  }

  return undefined;
}

/**
 * Checks if the query is a travel-related query
 *
 * @param message - User's message
 * @returns True if travel query
 */
export function isTravelQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  const travelKeywords = [
    'ท่องเที่ยว',
    'เที่ยว',
    'ทริป',
    'ทะเล',
    'ชายหาด',
    'เกาะ',
    'ริมทะเล',
    'ภูเขา',
    'travel',
    'trip',
    'vacation',
    'holiday',
    'beach',
    'island',
    'seaside',
    'mountain',
    'pack',
    'packing',
    'เก็บกระเป๋า',
    'เตรียมเสื้อผ้า',
  ];

  return travelKeywords.some((keyword) => lowerMessage.includes(keyword));
}

/**
 * Checks if the query is vague and needs occasion clarification
 *
 * @param message - User's message
 * @returns True if occasion clarification needed
 */
export function isOccasionVague(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Vague requests without specific occasion
  const vaguePatterns = [
    'ชุดสวย',
    'ชุดเท่',
    'ชุดดี',
    'ชุดน่ารัก',
    'something nice',
    'nice outfit',
    'good clothes',
    'แนะนำชุด',
    'ช่วยหาชุด',
    'suggest outfit',
    'recommend clothes',
  ];

  // If message contains vague pattern AND doesn't have clear occasion
  const hasVaguePattern = vaguePatterns.some((pattern) => lowerMessage.includes(pattern));
  const hasOccasion = detectOccasion(message) !== undefined;

  return hasVaguePattern && !hasOccasion;
}

/**
 * Determines which clarification questions to ask based on priority
 * Enhanced with conversation history checking to prevent loops
 * v2.1: Enforces MAX 2 clarifications rule
 * v2.2: Enforces POST-RECOMMENDATION LOCKOUT (Step 4)
 *
 * @param query - Analyzed user query
 * @param conversationHistory - Previous messages in the conversation
 * @param askedClarifications - Array of clarification types already asked
 * @param storedContext - Information already stored in session context
 * @param clarificationTurnCount - Number of clarifications already asked (v2.1 - Loop Prevention)
 * @param hasProvidedRecommendations - Whether recommendations have been provided (v2.2 - Step 4 Lockout)
 * @returns Array of clarification questions in priority order (empty if limit exceeded or in follow-up)
 */
export function getClarificationsNeeded(
  query: UserQuery,
  conversationHistory?: Array<{ role: string; content: string }>,
  askedClarifications?: Array<'gender' | 'occasion' | 'destination' | 'budget'>,
  storedContext?: { gender?: 'men' | 'women'; occasion?: string; destination?: string; budget?: number },
  clarificationTurnCount?: number,
  hasProvidedRecommendations?: boolean
): ClarificationNeeded[] {
  const clarifications: ClarificationNeeded[] = [];
  const asked = askedClarifications || [];
  const turnCount = clarificationTurnCount !== undefined ? clarificationTurnCount : asked.length;

  // CRITICAL v2.2: POST-RECOMMENDATION LOCKOUT (Step 4)
  // If recommendations have been provided, NEVER ask clarifications again
  if (hasProvidedRecommendations) {
    console.log('[Clarification Detector] 🔒 POST-RECOMMENDATION LOCKOUT ACTIVE (Step 4)');
    console.log('[Clarification Detector] Returning EMPTY array - system is in FOLLOW-UP mode.');
    return [];
  }

  // CRITICAL: LOOP PREVENTION - MAX 2 CLARIFICATIONS (v2.1)
  // If already asked 2 clarifications, return empty array (force recommendations)
  if (turnCount >= 2) {
    console.log('[Clarification Detector] 🔴 MAX 2 clarifications reached. Force recommendations mode.');
    console.log('[Clarification Detector] Returning EMPTY array - system will provide recommendations.');
    return [];
  }

  // Warning when approaching limit (turn 1, can ask 1 more)
  if (turnCount === 1) {
    console.log('[Clarification Detector] ⚠️ Turn count: 1/2 - This is the LAST clarification allowed.');
  }

  // Check conversation history for already provided information
  const historyContext = extractInfoFromHistory(conversationHistory || []);

  // CRITICAL: Also check stored context from previous turns
  const hasStoredGender = storedContext?.gender !== undefined;
  const hasStoredOccasion = storedContext?.occasion !== undefined;
  const hasStoredDestination = storedContext?.destination !== undefined;
  const hasStoredBudget = storedContext?.budget !== undefined;

  // Priority 1: Gender (if not detected, not in history, not stored, and not already asked)
  if (!query.hasGender && !historyContext.hasGender && !hasStoredGender && !asked.includes('gender')) {
    clarifications.push({
      type: 'gender',
      question: 'อยากหาชุดผู้หญิงหรือผู้ชายคะ? 👔👗',
      priority: 1,
    });
  }

  // Priority 2: Occasion (if vague or travel without clear occasion, not in history, not stored, and not already asked)
  if ((!query.hasOccasion || isOccasionVague(query.message)) && !historyContext.hasOccasion && !hasStoredOccasion && !asked.includes('occasion')) {
    if (query.isTravelQuery) {
      clarifications.push({
        type: 'occasion',
        question: 'ชุดนี้เอาไว้ใส่ทำอะไรตอนเที่ยวคะ? เดินเที่ยว กินข้าว หรือไปงานพิเศษ? 🌴',
        priority: 2,
      });
    } else {
      clarifications.push({
        type: 'occasion',
        question: 'ชุดนี้เอาไว้ใส่โอกาสไหนคะ? ไปทำงาน เดท หรือไปเที่ยวงานสังสรรค์? 🎉',
        priority: 2,
      });
    }
  }

  // Priority 3: Destination (if travel query without destination, not in history, not stored, and not already asked)
  if (query.isTravelQuery && !query.hasDestination && !historyContext.hasDestination && !hasStoredDestination && !asked.includes('destination')) {
    clarifications.push({
      type: 'destination',
      question: 'จะไปเที่ยวที่ไหนคะ? จะได้แนะนำชุดที่เหมาะกับสภาพอากาศให้ 🗺️✈️',
      priority: 3,
    });
  }

  // Priority 4: Budget (optional, only ask if really needed, not in history, not stored, and not already asked)
  if (!query.hasBudget && !historyContext.hasBudget && !hasStoredBudget && !asked.includes('budget') && shouldAskBudget(query)) {
    clarifications.push({
      type: 'budget',
      question: 'มีงบประมาณช้อปปิ้งไหมคะ? จะได้แนะนำให้เหมาะกับกระเป๋า 💰',
      priority: 4,
    });
  }

  // Sort by priority (lower number = higher priority)
  return clarifications.sort((a, b) => a.priority - b.priority);
}

/**
 * Extract information from conversation history to avoid re-asking
 *
 * @param history - Array of conversation messages
 * @returns Object with flags for detected information
 */
function extractInfoFromHistory(history: Array<{ role: string; content: string }>): {
  hasGender: boolean;
  hasOccasion: boolean;
  hasDestination: boolean;
  hasBudget: boolean;
} {
  const allMessages = history.map(m => m.content).join(' ');

  return {
    hasGender: detectGender(allMessages) !== undefined,
    hasOccasion: detectOccasion(allMessages) !== undefined,
    hasDestination: detectDestination(allMessages) !== undefined,
    hasBudget: detectBudget(allMessages) !== undefined,
  };
}

/**
 * Determines if budget clarification should be asked
 *
 * @param query - Analyzed user query
 * @returns True if should ask budget
 */
function shouldAskBudget(query: UserQuery): boolean {
  // Only ask budget for high-value occasions or if user seems budget-conscious
  const lowerMessage = query.message.toLowerCase();

  const budgetSensitiveKeywords = [
    'ถูก',
    'ประหยัด',
    'ราคาดี',
    'cheap',
    'affordable',
    'budget',
    'save',
    'ไม่แพง',
  ];

  const highValueOccasions = ['wedding', 'งานแต่ง', 'work', 'ทำงาน', 'dinner', 'ดินเนอร์'];

  const isBudgetSensitive = budgetSensitiveKeywords.some((keyword) => lowerMessage.includes(keyword));
  const isHighValueOccasion = highValueOccasions.some((occasion) => lowerMessage.includes(occasion));

  return isBudgetSensitive || isHighValueOccasion;
}

/**
 * Formats clarification questions for AI response
 *
 * @param clarifications - Array of clarifications needed
 * @returns Formatted string for AI to use
 */
export function formatClarificationQuestions(clarifications: ClarificationNeeded[]): string {
  if (clarifications.length === 0) {
    return '';
  }

  // Ask only the highest priority question (first one)
  const topClarification = clarifications[0];

  return topClarification.question;
}

/**
 * Checks if user message is answering a clarification question
 *
 * @param message - User's message
 * @param previousClarificationType - Type of clarification asked previously
 * @returns True if answering clarification
 */
export function isAnsweringClarification(
  message: string,
  previousClarificationType?: string
): boolean {
  if (!previousClarificationType) {
    return false;
  }

  switch (previousClarificationType) {
    case 'gender':
      return detectGender(message) !== undefined;

    case 'occasion':
      return detectOccasion(message) !== undefined;

    case 'destination':
      return detectDestination(message) !== undefined;

    case 'budget':
      return detectBudget(message) !== undefined;

    default:
      return false;
  }
}

/**
 * Export all utilities
 */
export default {
  analyzeUserQuery,
  detectGender,
  detectOccasion,
  detectBudget,
  detectDestination,
  isTravelQuery,
  isOccasionVague,
  getClarificationsNeeded,
  formatClarificationQuestions,
  isAnsweringClarification,
};
