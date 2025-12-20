/**
 * Category Detector
 *
 * Detects whether a user query is about CLOTHS or OTHER category
 * to determine which template (A or B) should be used.
 *
 * Related: tasks-0006-prd-system-prompt-enhancement-guardrails-LOOP-FIX.md (Sub-task 10.3)
 *
 * @version 1.0.0
 * @created 2025-10-15
 */

/**
 * Product category types
 */
export type ProductCategory = 'CLOTHS' | 'OTHER'

/**
 * Category detection result
 */
export interface CategoryDetection {
  /** Detected category */
  category: ProductCategory
  /** Confidence level (0-1) */
  confidence: number
  /** Matched keywords */
  matchedKeywords: string[]
  /** Recommended template */
  recommendedTemplate: 'A' | 'B'
}

/**
 * CLOTHS category keywords (Thai and English)
 * Items that require full outfit recommendations with prices and links
 */
const CLOTHS_KEYWORDS = {
  thai: [
    'เสื้อผ้า',
    'ชุด',
    'เสื้อ',
    'กางเกง',
    'กระโปรง',
    'เดรส',
    'สูท',
    'เสื้อโปโล',
    'เสื้อเชิ้ต',
    'เสื้อยืด',
    'เสื้อกันหนาว',
    'แจ็คเก็ต',
    'เสื้อคลุม',
    'กางเกงยีนส์',
    'กางเกงสแล็ค',
    'กางเกงขาสั้น',
    'แฟชั่น',
    'สไตล์',
    'ลุค',
    'outfit',
    'แต่งตัว',
    'ใส่',
    'สวมใส่',
  ],
  english: [
    'cloth',
    'outfit',
    'dress',
    'shirt',
    'pant',
    'pants',
    'skirt',
    'suit',
    'jacket',
    'coat',
    'sweater',
    'jeans',
    't-shirt',
    'tee',
    'polo',
    'blazer',
    'shorts',
    'fashion',
    'style',
    'look',
    'wear',
    'wearing',
  ],
}

/**
 * OTHER category keywords (Thai and English)
 * Items that get tips/tricks recommendations without prices/links
 */
const OTHER_KEYWORDS = {
  thai: [
    'รองเท้า',
    'กระเป๋า',
    'เครื่องสำอาง',
    'เครื่องประดับ',
    'นาฬิกา',
    'แว่นตา',
    'เข็มขัด',
    'ผ้าพันคอ',
    'หมวก',
    'ถุงเท้า',
    'ต่างหู',
    'สร้อยคอ',
    'กำไล',
    'แหวน',
    'เครื่องหนัง',
    'อุปกรณ์เสริม',
    'ดูแล',
    'ทำความสะอาด',
    'เก็บรักษา',
    'ซ่อม',
  ],
  english: [
    'shoe',
    'shoes',
    'bag',
    'bags',
    'handbag',
    'cosmetic',
    'makeup',
    'accessory',
    'accessories',
    'jewelry',
    'jewellery',
    'watch',
    'glasses',
    'sunglasses',
    'belt',
    'scarf',
    'hat',
    'cap',
    'sock',
    'socks',
    'earring',
    'necklace',
    'bracelet',
    'ring',
    'care',
    'clean',
    'maintain',
    'repair',
  ],
}

/**
 * Detects product category from user query
 *
 * @param query - User's query/message
 * @returns Category detection result
 */
export function detectCategory(query: string): CategoryDetection {
  const lowerQuery = query.toLowerCase()

  // Check CLOTHS keywords
  const clothsMatches: string[] = []
  for (const [lang, keywords] of Object.entries(CLOTHS_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        clothsMatches.push(keyword)
      }
    }
  }

  // Check OTHER keywords
  const otherMatches: string[] = []
  for (const [lang, keywords] of Object.entries(OTHER_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        otherMatches.push(keyword)
      }
    }
  }

  // Determine category based on matches
  if (clothsMatches.length > otherMatches.length) {
    const confidence = Math.min(clothsMatches.length / 3, 1.0) // Max confidence at 3+ matches
    return {
      category: 'CLOTHS',
      confidence,
      matchedKeywords: clothsMatches,
      recommendedTemplate: 'A',
    }
  }

  if (otherMatches.length > clothsMatches.length) {
    const confidence = Math.min(otherMatches.length / 2, 1.0) // Max confidence at 2+ matches
    return {
      category: 'OTHER',
      confidence,
      matchedKeywords: otherMatches,
      recommendedTemplate: 'B',
    }
  }

  // Tie or no matches - use contextual analysis
  const contextualCategory = detectFromContext(query)
  if (contextualCategory) {
    return contextualCategory
  }

  // Default to CLOTHS if unclear (safer to recommend full outfits)
  return {
    category: 'CLOTHS',
    confidence: 0.3, // Low confidence
    matchedKeywords: [],
    recommendedTemplate: 'A',
  }
}

/**
 * Detects category from contextual patterns
 *
 * @param query - User query
 * @returns Category detection or undefined
 */
function detectFromContext(query: string): CategoryDetection | undefined {
  const lowerQuery = query.toLowerCase()

  // Pattern 1: Questions about care/maintenance → OTHER
  const carePatterns = [
    /ดูแล.*ยังไง/,
    /ทำความสะอาด.*อย่างไร/,
    /เก็บรักษา.*อย่างไร/,
    /how to clean/i,
    /how to care/i,
    /how to maintain/i,
  ]

  for (const pattern of carePatterns) {
    if (pattern.test(query)) {
      return {
        category: 'OTHER',
        confidence: 0.8,
        matchedKeywords: ['care/maintenance pattern'],
        recommendedTemplate: 'B',
      }
    }
  }

  // Pattern 2: "What to wear" questions → CLOTHS
  const wearPatterns = [
    /ใส่อะไร/,
    /แต่งตัว.*ยังไง/,
    /ชุดอะไร/,
    /what to wear/i,
    /what should I wear/i,
    /outfit for/i,
  ]

  for (const pattern of wearPatterns) {
    if (pattern.test(query)) {
      return {
        category: 'CLOTHS',
        confidence: 0.9,
        matchedKeywords: ['what to wear pattern'],
        recommendedTemplate: 'A',
      }
    }
  }

  // Pattern 3: Occasion-based queries → CLOTHS
  const occasionKeywords = [
    'ทำงาน',
    'งานแต่ง',
    'เดท',
    'ปาร์ตี้',
    'เที่ยว',
    'work',
    'wedding',
    'date',
    'party',
    'travel',
  ]

  for (const keyword of occasionKeywords) {
    if (lowerQuery.includes(keyword)) {
      return {
        category: 'CLOTHS',
        confidence: 0.85,
        matchedKeywords: [keyword],
        recommendedTemplate: 'A',
      }
    }
  }

  return undefined
}

/**
 * Gets template instruction for AI based on category
 *
 * @param category - Detected category
 * @returns Template instruction string
 */
export function getTemplateInstruction(category: ProductCategory): string {
  if (category === 'CLOTHS') {
    return `[CATEGORY: CLOTHS - Use Template A]
You MUST provide outfit recommendations using Template A:
- Include 3-5 product recommendations
- Each product must have: Brand, Price (💰), Link (🔗)
- Include styling tips section (✨ Styling Tricks & Tips)
- Provide complete outfit summary

Template A Structure:
1. Friendly acknowledgment
2. Product 1 → Brand, Price, Link, Reason
3. Product 2 → Brand, Price, Link, Reason
4. Product 3 → Brand, Price, Link, Reason
5. (Optional) Products 4-5
6. ✨ Styling Tips (1-3 tips)
7. Overall outfit summary

MANDATORY: Include prices and links for all products.`
  }

  return `[CATEGORY: OTHER - Use Template B]
You MUST provide tips and tricks using Template B:
- Share 1-3 practical tips/tricks
- Mention products naturally WITHIN tips (NO separate product section)
- DO NOT include prices (no 💰)
- DO NOT include links (no 🔗)
- Focus on how-to guidance and practical advice

Template B Structure:
1. Friendly acknowledgment
2. 💡 Tip 1 (with optional product mention - no price/link)
3. 💡 Tip 2 (with optional product mention - no price/link)
4. 💡 Tip 3 (with optional product mention - no price/link)
5. ✨ Additional insight (optional)
6. Closing message

FORBIDDEN: Do NOT create separate product recommendation section, prices, or links.`
}

/**
 * Formats category detection for logging
 *
 * @param detection - Category detection result
 * @returns Formatted string
 */
export function formatCategoryDetection(detection: CategoryDetection): string {
  const confidencePercent = Math.round(detection.confidence * 100)

  return [
    `[Category Detector] Detected: ${detection.category}`,
    `  Confidence: ${confidencePercent}%`,
    `  Template: ${detection.recommendedTemplate}`,
    `  Matched: ${detection.matchedKeywords.slice(0, 3).join(', ')}${detection.matchedKeywords.length > 3 ? '...' : ''}`,
  ].join('\n')
}

/**
 * Export all utilities
 */
export default {
  detectCategory,
  getTemplateInstruction,
  formatCategoryDetection,
}
