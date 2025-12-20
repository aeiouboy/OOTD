/**
 * Conversation Examples for System Prompt v3.0
 *
 * Good vs Bad examples showing the difference between v2.1 (BROKEN) and v3.0 (FIXED)
 *
 * @version 3.0
 * @related-prd 0007-prd-system-prompt-v3-clarification-fix.md
 */

export const CONVERSATION_EXAMPLES = {
  /**
   * BROKEN EXAMPLE (v2.1 Bug) - DO NOT DO THIS
   * Shows the screenshot issue: AI asks questions AFTER showing products
   */
  v21_BROKEN_PostRecommendationClarification: {
    title: '❌ v2.1 BROKEN: Questions After Products (Screenshot Issue)',
    turns: [
      {
        turn: 1,
        user: 'งานบวช',
        ai: `เข้าใจค่ะ! สำหรับงานบวช เรามีชุดไทยสวยๆ มาแนะนำนะคะ:

👔 Item 1: เสื้อไทยพระราชทาน - Central
💰 ราคา: 3,500 บาท
🔗 [Link]

[... 2-3 more products ...]

อยากหาชุดผู้หญิงหรือผู้ชายคะ? 👔👗`,
        issue: '❌ SHOWS PRODUCTS THEN ASKS QUESTION - This is the bug!',
      },
      {
        turn: 2,
        user: 'ผู้ชาย',
        ai: 'อยากหาชุดผู้หญิงหรือผู้ชายคะ?',
        issue: '❌ ASKS AGAIN (repeated question)',
      },
      {
        turn: 3,
        user: 'งานบวชอ่า',
        ai: 'อยากหาชุดผู้หญิงหรือผู้ชายคะ?',
        issue: '❌ ASKS 3RD TIME - Infinite loop!',
      },
    ],
    problemStatement: 'AI mixes clarification with recommendations, causing confusion',
  },

  /**
   * FIXED EXAMPLE (v3.0) - CORRECT PATTERN
   * Shows strict state machine: CLARIFY FIRST → RECOMMEND SECOND
   */
  v30_FIXED_ClarifyThenRecommend: {
    title: '✅ v3.0 FIXED: Clarify First, Then Recommend',
    turns: [
      {
        turn: 1,
        user: 'งานบวช',
        ai: 'อยากหาชุดผู้หญิงหรือผู้ชายคะ? 👔👗',
        mode: 'CLARIFICATION',
        correct: '✅ ONLY question, NO products',
      },
      {
        turn: 2,
        user: 'ผู้ชาย',
        ai: `เข้าใจแล้วค่ะ! สำหรับงานบวชผู้ชาย เรามีชุดไทยประยุกต์มาแนะนำนะคะ:

👔 Item 1: เสื้อไทยพระราชทาน - Central
💰 ราคา: 3,500 บาท
🔗 [Link]

[... 3-5 products ...]

รวมชุดนี้จะดูเหมาะสมกับงานบวชสุดๆ เลย!`,
        mode: 'RECOMMENDATION',
        correct: '✅ ONLY products, NO questions',
      },
      {
        turn: 3,
        user: 'มีอื่นมั้ย',
        ai: `มีเลยค่ะ! เรามีอีกหลายแบบให้เลือก:

👔 Item 4: [Different product]
[... more new products ...]`,
        mode: 'RECOMMENDATION',
        correct: '✅ Still ONLY products, NO questions (lockout active)',
      },
    ],
    whyCorrect: 'Strict separation: Question in turn 1, Products in turn 2+',
  },

  /**
   * EXAMPLE: Direct Recommendation (Sufficient Info Upfront)
   */
  directRecommendation: {
    title: '✅ Direct Recommendation (No Clarification Needed)',
    turns: [
      {
        turn: 1,
        user: 'หาชุดผู้หญิงไปงานแต่งงาน งบ 5000',
        ai: `เข้าใจค่ะ! สำหรับงานแต่งงาน งบ 5000 บาท เรามีชุดสวยๆ มาแนะนำนะคะ:

👗 Item 1: [Product with dress]
💰 ราคา: 4,800 บาท
🔗 [Link]

[... 3-5 products within budget ...]

รวมชุดนี้จะสวยและเหมาะกับงานแต่งสุดๆ เลย!`,
        mode: 'RECOMMENDATION',
        clarificationsAsked: 0,
        correct: '✅ Has all info (gender + occasion + budget) → direct recommendation',
      },
    ],
    whyCorrect: 'User provided complete info, so no clarification needed',
  },

  /**
   * EXAMPLE: Force Recommendation After 2 Clarifications
   */
  forceRecommendation: {
    title: '✅ Force Recommendation After 2 Clarifications',
    turns: [
      {
        turn: 1,
        user: 'หาชุด',
        ai: 'อยากหาชุดผู้หญิงหรือผู้ชายคะ? 👔👗',
        mode: 'CLARIFICATION',
        clarificationsAsked: 1,
        correct: '✅ Clarification #1',
      },
      {
        turn: 2,
        user: 'ผู้หญิง',
        ai: 'ชุดนี้เอาไว้ใส่โอกาสไหนคะ? ไปทำงาน เดท หรือไปงานสังสรรค์? 🎉',
        mode: 'CLARIFICATION',
        clarificationsAsked: 2,
        correct: '✅ Clarification #2 (max reached)',
      },
      {
        turn: 3,
        user: 'ก็ธรรมดาๆ',
        ai: `เข้าใจค่ะ! เราแนะนำชุดสไตล์ casual versatile ที่ใส่ได้หลายโอกาสนะคะ:

👗 Item 1: เสื้อยืดสีพื้น - Brand A (casual)
👗 Item 2: เสื้อเชิ้ต - Brand B (smart casual)
👗 Item 3: เดรสแขนสั้น - Brand C (feminine casual)

[... variety to cover different scenarios ...]`,
        mode: 'RECOMMENDATION',
        clarificationsAsked: 2,
        correct: '✅ MUST recommend after 2 clarifications (even with vague info)',
      },
    ],
    whyCorrect: 'MAX 2 clarifications rule enforced. Provides variety to cover uncertainty.',
  },

  /**
   * EXAMPLE: Off-Topic Redirect
   */
  offTopicRedirect: {
    title: '✅ Off-Topic Redirect',
    turns: [
      {
        turn: 1,
        user: 'แนะนำร้านอาหารหน่อย',
        ai: 'ฉันแนะนำเรื่องแฟชั่นนะคะ ร้านอาหารไม่ค่อยรู้เรื่อง 😊 แต่ถ้าอยากรู้ว่าใส่ชุดอะไรไปร้านหรูๆ บอกได้เลย!',
        mode: 'REDIRECT',
        correct: '✅ Polite redirect to fashion',
      },
    ],
    whyCorrect: 'Not fashion-related, so redirect politely',
  },
};

/**
 * Export individual examples for easier access
 */
export const V21_BROKEN_EXAMPLE = CONVERSATION_EXAMPLES.v21_BROKEN_PostRecommendationClarification;
export const V30_FIXED_EXAMPLE = CONVERSATION_EXAMPLES.v30_FIXED_ClarifyThenRecommend;
export const DIRECT_RECOMMENDATION_EXAMPLE = CONVERSATION_EXAMPLES.directRecommendation;
export const FORCE_RECOMMENDATION_EXAMPLE = CONVERSATION_EXAMPLES.forceRecommendation;
export const OFF_TOPIC_EXAMPLE = CONVERSATION_EXAMPLES.offTopicRedirect;

/**
 * Export all examples
 */
export default CONVERSATION_EXAMPLES;
