/**
 * Image Trigger Detection Utility
 * Detects when users request outfit visualization and extracts context for image generation
 *
 * Supports both Thai and English trigger phrases for Customer Journey Step 4 (Looks Inspiration)
 */

/**
 * Thai trigger phrases that indicate user wants to see outfit visualization
 */
const THAI_TRIGGERS = [
  'แสดงให้ดูหน่อย',
  'แสดงให้ดู',
  'อยากเห็นว่าหน้าตาเป็นยังไง',
  'อยากเห็น',
  'ดูรูป',
  'แสดงรูป',
  'เห็นภาพ',
  'ให้ดูรูป',
  'มีรูป',
  'ดูภาพ',
  'visualize',
];

/**
 * English trigger phrases that indicate user wants to see outfit visualization
 */
const ENGLISH_TRIGGERS = [
  'show me',
  'looks inspiration',
  'visualize',
  'visualise',
  'what does it look like',
  'what would it look like',
  'picture',
  'image',
  'photo',
  'see it',
  'show the outfit',
  'show outfit',
  'generate image',
  'can i see',
];

/**
 * Interface for conversation message history
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Detects if user message contains a request for outfit visualization
 *
 * @param message - User's message text
 * @returns true if image request detected, false otherwise
 *
 * @example
 * detectImageRequest("แสดงให้ดูหน่อย") // returns true
 * detectImageRequest("Show me the outfit") // returns true
 * detectImageRequest("ชอบมากเลย") // returns false
 */
export function detectImageRequest(message: string): boolean {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const lowerMessage = message.toLowerCase().trim();

  // Check Thai triggers
  const hasThaiTrigger = THAI_TRIGGERS.some((trigger) =>
    lowerMessage.includes(trigger.toLowerCase())
  );

  // Check English triggers
  const hasEnglishTrigger = ENGLISH_TRIGGERS.some((trigger) =>
    lowerMessage.includes(trigger)
  );

  return hasThaiTrigger || hasEnglishTrigger;
}

/**
 * Extracts outfit description from conversation history for image generation
 * Looks at recent messages to build context about the outfit being discussed
 *
 * @param currentMessage - Current user message
 * @param conversationHistory - Array of previous conversation messages
 * @param maxHistoryMessages - Maximum number of previous messages to consider (default: 5)
 * @returns Extracted outfit description string
 *
 * @example
 * const history = [
 *   { role: 'user', content: 'อยากหาชุดไปทำงาน' },
 *   { role: 'assistant', content: 'เราแนะนำเสื้อเชิ้ตสีขาวกับกางเกงขายาวสีดำค่ะ' }
 * ];
 * extractOutfitDescription("แสดงให้ดูหน่อย", history)
 * // returns: "Business outfit with white shirt and black pants"
 */
export function extractOutfitDescription(
  currentMessage: string,
  conversationHistory: ConversationMessage[] = [],
  maxHistoryMessages: number = 5
): string {
  // Get recent conversation context (last N messages)
  const recentHistory = conversationHistory.slice(-maxHistoryMessages);

  // Collect all relevant outfit descriptions from assistant responses
  const outfitMentions: string[] = [];

  // Check current message for outfit details
  if (currentMessage && !detectImageRequest(currentMessage)) {
    outfitMentions.push(currentMessage);
  }

  // Scan conversation history for outfit descriptions
  recentHistory.forEach((msg) => {
    if (msg.role === 'assistant') {
      // Look for product mentions and outfit suggestions in assistant responses
      const content = msg.content;

      // Extract outfit-related keywords from Thai text
      const thaiOutfitPatterns = [
        /เสื้อ[^\s,.]*/g,
        /กางเกง[^\s,.]*/g,
        /กระโปรง[^\s,.]*/g,
        /รองเท้า[^\s,.]*/g,
        /สี[^\s,.]*/g,
        /ชุด[^\s,.]*/g,
      ];

      thaiOutfitPatterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          outfitMentions.push(...matches);
        }
      });

      // Add full assistant response if it's short and descriptive
      if (content.length < 200) {
        outfitMentions.push(content);
      }
    } else if (msg.role === 'user') {
      // Capture user's outfit preferences and context
      const content = msg.content;

      // Look for occasion/context keywords
      const contextPatterns = [
        /ไป[^\s,.]*/g,
        /งาน[^\s,.]*/g,
        /ปาร์ตี้[^\s,.]*/g,
        /casual/gi,
        /formal/gi,
        /business/gi,
        /weekend/gi,
        /work/gi,
        /party/gi,
      ];

      contextPatterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          outfitMentions.push(...matches);
        }
      });
    }
  });

  // Combine outfit mentions into a coherent description
  if (outfitMentions.length === 0) {
    return 'A stylish outfit recommendation'; // Fallback
  }

  // Join unique mentions and clean up
  const uniqueMentions = [...new Set(outfitMentions)];
  const description = uniqueMentions.join(' ').trim();

  // Limit description length to avoid overly long prompts
  const maxLength = 300;
  if (description.length > maxLength) {
    return description.substring(0, maxLength) + '...';
  }

  return description || 'A stylish outfit recommendation';
}

/**
 * Validates if extracted outfit description is suitable for image generation
 *
 * @param description - Extracted outfit description
 * @returns true if description is valid, false if too vague or empty
 *
 * @example
 * isValidOutfitDescription("White shirt with black pants") // true
 * isValidOutfitDescription("") // false
 * isValidOutfitDescription("...") // false
 */
export function isValidOutfitDescription(description: string): boolean {
  if (!description || typeof description !== 'string') {
    return false;
  }

  const trimmed = description.trim();

  // Too short
  if (trimmed.length < 10) {
    return false;
  }

  // Only contains generic fallback text
  if (trimmed === 'A stylish outfit recommendation') {
    return false;
  }

  // Only ellipsis or punctuation
  if (/^[.\s,!?]+$/.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Gets list of all supported trigger phrases (for documentation/testing)
 *
 * @returns Object containing Thai and English trigger phrases
 */
export function getTriggerPhrases(): { thai: string[]; english: string[] } {
  return {
    thai: [...THAI_TRIGGERS],
    english: [...ENGLISH_TRIGGERS],
  };
}
