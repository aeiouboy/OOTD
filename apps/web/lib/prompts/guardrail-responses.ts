/**
 * Guardrail Redirect Responses for System Prompt v2.3
 *
 * OOT Persona-aligned polite redirect messages for off-topic queries.
 * These messages maintain the OOT bestie personality with Thai-English
 * code-switching while redirecting users back to fashion topics.
 *
 * @version 1.1.0
 * @created 2025-10-14
 * @updated 2025-12-16 - OOT Persona integration
 */

import type { RedirectMessageMap, GuardrailCategory } from '../types/chat-types';

/**
 * Redirect Messages by Category - OOT Persona Style
 *
 * Each message:
 * 1. Uses OOT bestie personality (casual, friendly)
 * 2. Thai-English code-switching where natural
 * 3. Clearly states the assistant's fashion focus
 * 4. Suggests a fashion-related alternative with enthusiasm
 */
export const REDIRECT_MESSAGES: RedirectMessageMap = {
  health:
    'เรื่อง health ฉันไม่ถนัดเลยอ่ะ 😅 แต่ถ้าเป็นเรื่อง fashion สไตล์การแต่งตัว เรียกฉันได้เลยนะจ้า! 👗✨',

  technology:
    'อันนี้ไม่ใช่ expertise ของฉันเลยน้า 555 แต่ถ้าอยากรู้ว่าจะใส่อะไร look ดีๆ ไปซื้อ gadget ใหม่ บอกได้เลยจ้า! 😄',

  food: 'แนะนำร้านอาหารฉันไม่แม่นเลยอ่ะ 😊 แต่ถ้าอยากรู้ว่า dress code ไปร้าน fine dining ควรใส่อะไร มาคุยกัน! 🍽️✨',

  general:
    'อ๊ะ เรื่องนี้ฉันไม่ค่อยเชี่ยวชาญอ่ะ 😅 ฉันเป็น fashion bestie ถนัดเรื่องเสื้อผ้า style แต่งตัว! มีอะไรให้ช่วย look ดีๆ มั้ยจ๊ะ?',

  travel:
    'สถานที่ท่องเที่ยวฉันไม่แม่นเลยอ่ะ แต่ถ้าอยากรู้ outfit ไปเที่ยว[destination] แบบ chic ๆ เรียกฉันได้เลยจ้า! ✈️🧳',

  inappropriate: 'อืม... เรื่องนี้ฉันช่วยไม่ได้จริงๆ อ่ะ 😅 แต่เรื่อง fashion มีอะไรให้ช่วยมั้ยจ้า?',

  default:
    'อ๊ะ เรื่องนี้ฉันไม่ค่อย expert อ่ะ 😅 ฉันเป็น OOT - fashion bestie ของเธอ! มีอะไรเรื่องเสื้อผ้า style แต่งตัวให้ช่วยมั้ยจ๊ะ? 💕',
};

/**
 * Alternative redirect messages for variety - OOT Persona Style
 * Use these when user repeatedly asks off-topic questions
 */
export const ALTERNATIVE_REDIRECTS: Record<GuardrailCategory, string[]> = {
  health: [
    'เรื่อง health ฉันไม่ถนัดเลยอ่ะ 😅 แต่ถ้าเป็นเรื่อง fashion สไตล์การแต่งตัว เรียกฉันได้เลยนะจ้า! 👗✨',
    'สุขภาพฉันไม่แม่นน้า แต่ถ้าอยาก look ดีและ feel good ฉันช่วยเรื่อง outfit ได้เลย! 💪✨',
    'คือเรื่อง health ฉันไม่ expert อ่ะ แต่ถ้าอยาก dress to impress มาคุยกันได้เลยจ้า! 🌟',
  ],
  technology: [
    'อันนี้ไม่ใช่ expertise ของฉันเลยน้า 555 แต่ถ้าอยากรู้ว่าจะใส่อะไร look ดีๆ ไปซื้อ gadget ใหม่ บอกได้เลยจ้า! 😄',
    'Tech stuff ฉันงงเหมือนกัน 555 แต่ fashion tech ฉันถนัด! มา mix-match กันเถอะ! 👔💻',
    'เทคโนโลยีฉันไม่ค่อย get อ่ะ แต่ถ้าเป็น style ไป tech event บอกมาได้เลย! 🚀✨',
  ],
  food: [
    'แนะนำร้านอาหารฉันไม่แม่นเลยอ่ะ 😊 แต่ถ้าอยากรู้ว่า dress code ไปร้าน fine dining ควรใส่อะไร มาคุยกัน! 🍽️✨',
    'อาหารฉันกินเก่งแต่แนะนำไม่เก่ง 555 แต่ถ้าเป็นชุดไป dinner date ฉันช่วยได้สิ! 🥂',
    'Food recommendation ไม่ใช่ทางฉันอ่ะ แต่ outfit ไปร้าน Michelin star มาหาฉันได้เลยจ้า! ⭐',
  ],
  general: [
    'อ๊ะ เรื่องนี้ฉันไม่ค่อยเชี่ยวชาญอ่ะ 😅 ฉันเป็น fashion bestie ถนัดเรื่องเสื้อผ้า style แต่งตัว! มีอะไรให้ช่วย look ดีๆ มั้ยจ๊ะ?',
    'เรื่องนั้นฉันไม่แน่ใจน้า แต่ถ้าเป็นเรื่อง fashion สไตล์ หรือการแต่งตัว ฉันช่วยได้เต็มที่เลย! 👗✨',
    'อืม ฉัน focus เรื่อง fashion อ่ะ 😊 มีอะไรให้ช่วยเรื่อง outfit หรือ styling มั้ยจ้า?',
  ],
  travel: [
    'สถานที่ท่องเที่ยวฉันไม่แม่นเลยอ่ะ แต่ถ้าอยากรู้ outfit ไปเที่ยว[destination] แบบ chic ๆ เรียกฉันได้เลยจ้า! ✈️🧳',
    'ที่เที่ยวฉันไม่รู้จักมากน้า แต่ชุดเที่ยวไปที่ไหนก็ช่วยได้เลยจ้า! Travel outfit มาหาฉันได้! 🌴✨',
    'Travel tips ฉันไม่ expert แต่ packing list และ vacation outfit แบบปังๆ บอกได้เลย! 🎒🌟',
  ],
  inappropriate: [
    'อืม... เรื่องนี้ฉันช่วยไม่ได้จริงๆ อ่ะ 😅 แต่เรื่อง fashion มีอะไรให้ช่วยมั้ยจ้า?',
    'เรื่องนี้ฉัน pass นะจ้า 😅 แต่ถ้าเป็นเรื่อง style แต่งตัว มาคุยกันได้เลย! 💕',
  ],
  default: [
    'อ๊ะ เรื่องนี้ฉันไม่ค่อย expert อ่ะ 😅 ฉันเป็น OOT - fashion bestie ของเธอ! มีอะไรเรื่องเสื้อผ้า style แต่งตัวให้ช่วยมั้ยจ๊ะ? 💕',
    'เรื่องนี้ฉันไม่ถนัดอ่ะ แต่ถ้าเป็นเรื่อง fashion หรือ styling ฉันช่วยได้เลยนะจ้า! มาหาฉันได้ตลอด 🥰',
    'ฉันเป็น fashion friend อ่ะ 555 เรื่องอื่นไม่ค่อย expert แต่เรื่องแต่งตัวเรียกฉันได้เลย! ✨',
  ],
};

/**
 * Fashion-Adjacent Topic Examples (ALLOWED)
 *
 * These topics mention other contexts but are fashion-related
 */
export const FASHION_ADJACENT_EXAMPLES = [
  'What shoes to wear to a marathon?',
  'How to pack clothes for travel?',
  'What to wear to a restaurant?',
  'Outfit for job interview?',
  'What to wear to a wedding?',
  'Gym outfit recommendations?',
  'Beach vacation outfits?',
  'Concert outfit ideas?',
];

/**
 * Helper function to get redirect message
 */
export function getRedirectMessage(category: GuardrailCategory): string {
  return REDIRECT_MESSAGES[category] || REDIRECT_MESSAGES.default;
}

/**
 * Helper function to get alternative redirect message
 * Use when user asks off-topic questions multiple times
 */
export function getAlternativeRedirect(
  category: GuardrailCategory,
  attemptNumber: number = 0
): string {
  const alternatives = ALTERNATIVE_REDIRECTS[category] || ALTERNATIVE_REDIRECTS.default;
  const index = attemptNumber % alternatives.length;
  return alternatives[index];
}

/**
 * Check if a topic is fashion-adjacent (allowed)
 */
export function isFashionAdjacent(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check for "what to wear to..." pattern
  if (/(?:what|อะไร|ใส่|แต่ง).*(?:wear|ใส่).*(?:to|ไป|ที่)/i.test(lowerMessage)) {
    return true;
  }

  // Check for packing/travel with clothes context
  if (
    /(?:pack|เก็บ|เตรียม).*(?:clothes|เสื้อผ้า|ชุด)/i.test(lowerMessage) ||
    /(?:clothes|เสื้อผ้า|ชุด).*(?:pack|เก็บ|เตรียม)/i.test(lowerMessage)
  ) {
    return true;
  }

  // Check for outfit/dress code context
  if (/(?:outfit|ชุด|dress code|แต่งตัว).*(?:for|สำหรับ|ไป)/i.test(lowerMessage)) {
    return true;
  }

  return false;
}

/**
 * Export all for convenience
 */
export default {
  REDIRECT_MESSAGES,
  ALTERNATIVE_REDIRECTS,
  FASHION_ADJACENT_EXAMPLES,
  getRedirectMessage,
  getAlternativeRedirect,
  isFashionAdjacent,
};
