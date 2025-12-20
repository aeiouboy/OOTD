/**
 * Follow-up Request Handler (v2.2 - Step 4)
 *
 * Detects and classifies follow-up requests after initial recommendations.
 * Used to adjust product filtering and AI prompts for refinement requests.
 *
 * Related: chore-fd2f91e8-implement-journey-steps-3-4.md
 *
 * @version 1.0.0
 * @created 2025-10-26
 */

/**
 * Follow-up request types
 */
export type FollowUpType =
  | 'more_options'    // User wants to see more products
  | 'color_change'    // User wants different colors
  | 'budget_change'   // User wants different price range (lower/higher)
  | 'style_change'    // User wants different style (more formal/casual)
  | 'brand_change'    // User wants different brands
  | 'size_issue'      // User has sizing concerns
  | 'general_refine'  // General refinement without specific category
  | 'none';           // Not a follow-up request

/**
 * Follow-up detection result
 */
export interface FollowUpDetection {
  /** Whether this is a follow-up request */
  isFollowUp: boolean;
  /** Type of follow-up request */
  type: FollowUpType;
  /** Confidence level (0-1) */
  confidence: number;
  /** Matched keywords */
  matchedKeywords: string[];
  /** Extracted parameters (e.g., new budget, new color) */
  parameters: {
    newBudget?: number;
    budgetDirection?: 'lower' | 'higher';
    newColor?: string;
    styleDirection?: 'more_formal' | 'more_casual';
  };
}

/**
 * Follow-up keywords by type (Thai and English)
 */
const FOLLOW_UP_KEYWORDS: Record<FollowUpType, { thai: string[]; english: string[] }> = {
  more_options: {
    thai: [
      'มีอื่นมั้ย',
      'มีอื่นไหม',
      'อื่นๆ',
      'เพิ่มเติม',
      'ตัวเลือกอื่น',
      'แบบอื่น',
      'ลุคอื่น',
      'ชุดอื่น',
      'ดูเพิ่ม',
      'อีกหน่อย',
      'มีอีกไหม',
    ],
    english: [
      'more options',
      'other options',
      'alternatives',
      'more choices',
      'anything else',
      'show me more',
      'other looks',
      'other outfits',
      'have more',
      'see more',
    ],
  },
  color_change: {
    thai: [
      'สีอื่น',
      'เปลี่ยนสี',
      'สีอื่นมั้ย',
      'ไม่เอาสี',
      'อยากได้สี',
      'สีสว่างกว่า',
      'สีเข้มกว่า',
      'สีสดใส',
      'สีพาสเทล',
      'สีดำ',
      'สีขาว',
    ],
    english: [
      'different color',
      'change color',
      'other colors',
      'lighter color',
      'darker color',
      'brighter',
      'pastel',
      'black',
      'white',
      'navy',
      'not this color',
    ],
  },
  budget_change: {
    thai: [
      'งบน้อยกว่า',
      'ถูกกว่านี้',
      'ราคาต่ำกว่า',
      'ถูกหน่อย',
      'ประหยัดกว่า',
      'แพงกว่านี้',
      'premium กว่า',
      'หรูกว่า',
      'คุณภาพสูงกว่า',
      'งบเพิ่ม',
      'ไม่เกิน',
    ],
    english: [
      'lower budget',
      'cheaper',
      'less expensive',
      'more affordable',
      'under budget',
      'higher budget',
      'more expensive',
      'premium',
      'luxury',
      'higher quality',
      'price below',
    ],
  },
  style_change: {
    thai: [
      'สไตล์อื่น',
      'formal กว่า',
      'casual กว่า',
      'ทางการกว่า',
      'สบายๆ กว่า',
      'เท่กว่า',
      'น่ารักกว่า',
      'เซ็กซี่กว่า',
      'คลาสสิกกว่า',
      'โมเดิร์นกว่า',
      'เรียบกว่า',
    ],
    english: [
      'different style',
      'more formal',
      'more casual',
      'more trendy',
      'more classic',
      'more modern',
      'more conservative',
      'sexier',
      'cute style',
      'minimalist',
      'bold style',
    ],
  },
  brand_change: {
    thai: [
      'แบรนด์อื่น',
      'ยี่ห้ออื่น',
      'ไม่เอายี่ห้อนี้',
      'แบรนด์ไทย',
      'แบรนด์นอก',
    ],
    english: [
      'different brand',
      'other brands',
      'not this brand',
      'local brand',
      'international brand',
    ],
  },
  size_issue: {
    thai: [
      'ไซส์ใหญ่กว่า',
      'ไซส์เล็กกว่า',
      'พอดีตัว',
      'หลวมๆ',
      'รัดรูป',
      'oversize',
    ],
    english: [
      'bigger size',
      'smaller size',
      'fitted',
      'loose fit',
      'oversized',
      'regular fit',
    ],
  },
  general_refine: {
    thai: [
      'ไม่ชอบ',
      'ไม่ถูกใจ',
      'หาใหม่',
      'แนะนำใหม่',
      'ขอดูแบบอื่น',
    ],
    english: [
      'dont like',
      "don't like",
      'not what I want',
      'try again',
      'something else',
      'different',
    ],
  },
  none: {
    thai: [],
    english: [],
  },
};

/**
 * Detects follow-up request type from user message
 *
 * @param message - User's message
 * @param hasProvidedRecommendations - Whether recommendations have been provided
 * @returns Follow-up detection result
 */
export function detectFollowUpRequest(
  message: string,
  hasProvidedRecommendations: boolean
): FollowUpDetection {
  // If no recommendations provided yet, this cannot be a follow-up
  if (!hasProvidedRecommendations) {
    return {
      isFollowUp: false,
      type: 'none',
      confidence: 1.0,
      matchedKeywords: [],
      parameters: {},
    };
  }

  const lowerMessage = message.toLowerCase();
  const matchedTypes: Array<{ type: FollowUpType; keywords: string[]; score: number }> = [];

  // Check each follow-up type
  for (const [type, keywords] of Object.entries(FOLLOW_UP_KEYWORDS)) {
    if (type === 'none') continue;

    const matched: string[] = [];
    const allKeywords = [...keywords.thai, ...keywords.english];

    for (const keyword of allKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matched.push(keyword);
      }
    }

    if (matched.length > 0) {
      matchedTypes.push({
        type: type as FollowUpType,
        keywords: matched,
        score: matched.length,
      });
    }
  }

  // If no matches, check for general follow-up indicators
  if (matchedTypes.length === 0) {
    // Check for question about previous recommendations
    const generalFollowUpIndicators = [
      /มี.*ไหม/,
      /อยาก.*อื่น/,
      /ขอ.*อื่น/,
      /เปลี่ยน/,
      /any.*other/i,
      /can.*show/i,
      /what.*about/i,
    ];

    for (const pattern of generalFollowUpIndicators) {
      if (pattern.test(message)) {
        return {
          isFollowUp: true,
          type: 'general_refine',
          confidence: 0.6,
          matchedKeywords: ['general follow-up pattern'],
          parameters: {},
        };
      }
    }

    return {
      isFollowUp: false,
      type: 'none',
      confidence: 0.8,
      matchedKeywords: [],
      parameters: {},
    };
  }

  // Sort by score and get the best match
  matchedTypes.sort((a, b) => b.score - a.score);
  const bestMatch = matchedTypes[0];

  // Extract parameters based on type
  const parameters = extractFollowUpParameters(message, bestMatch.type);

  const confidence = Math.min(bestMatch.score / 2, 1.0);

  return {
    isFollowUp: true,
    type: bestMatch.type,
    confidence,
    matchedKeywords: bestMatch.keywords,
    parameters,
  };
}

/**
 * Extracts parameters from follow-up request
 */
function extractFollowUpParameters(
  message: string,
  type: FollowUpType
): FollowUpDetection['parameters'] {
  const params: FollowUpDetection['parameters'] = {};
  const lowerMessage = message.toLowerCase();

  if (type === 'budget_change') {
    // Detect budget direction
    const lowerIndicators = ['ถูก', 'น้อย', 'ต่ำ', 'ประหยัด', 'cheap', 'lower', 'less', 'affordable'];
    const higherIndicators = ['แพง', 'premium', 'หรู', 'คุณภาพ', 'expensive', 'higher', 'luxury'];

    if (lowerIndicators.some(i => lowerMessage.includes(i))) {
      params.budgetDirection = 'lower';
    } else if (higherIndicators.some(i => lowerMessage.includes(i))) {
      params.budgetDirection = 'higher';
    }

    // Extract specific budget amount if mentioned
    const budgetMatch = message.match(/(\d{1,3}(?:,\d{3})*)/);
    if (budgetMatch) {
      params.newBudget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    }
  }

  if (type === 'color_change') {
    // Extract color if mentioned
    const colors = [
      'ดำ', 'ขาว', 'แดง', 'น้ำเงิน', 'เขียว', 'เหลือง', 'ชมพู', 'ม่วง', 'ส้ม', 'เทา', 'น้ำตาล',
      'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'grey', 'gray', 'brown', 'navy', 'beige',
    ];

    for (const color of colors) {
      if (lowerMessage.includes(color.toLowerCase())) {
        params.newColor = color;
        break;
      }
    }
  }

  if (type === 'style_change') {
    // Detect style direction
    const formalIndicators = ['formal', 'ทางการ', 'เรียบ', 'professional', 'สุภาพ'];
    const casualIndicators = ['casual', 'สบาย', 'ชิล', 'relax', 'laid-back'];

    if (formalIndicators.some(i => lowerMessage.includes(i))) {
      params.styleDirection = 'more_formal';
    } else if (casualIndicators.some(i => lowerMessage.includes(i))) {
      params.styleDirection = 'more_casual';
    }
  }

  return params;
}

/**
 * Generates follow-up instruction for AI based on detection
 *
 * @param detection - Follow-up detection result
 * @returns Instruction string to inject into AI prompt
 */
export function generateFollowUpInstruction(detection: FollowUpDetection): string {
  if (!detection.isFollowUp) {
    return '';
  }

  const baseInstruction = `[FOLLOW-UP MODE ACTIVE - Step 4]
User is requesting refinements to previous recommendations.
DO NOT ask any clarifying questions. Provide NEW recommendations immediately.

`;

  switch (detection.type) {
    case 'more_options':
      return `${baseInstruction}User wants MORE OPTIONS.
- Show DIFFERENT products from previous recommendations
- Maintain same style/occasion context
- Provide 3-5 new alternatives`;

    case 'color_change':
      return `${baseInstruction}User wants DIFFERENT COLORS.
${detection.parameters.newColor ? `- Focus on: ${detection.parameters.newColor}` : '- Show variety of colors different from previous'}
- Keep same style and price range
- Highlight color options in descriptions`;

    case 'budget_change':
      return `${baseInstruction}User wants DIFFERENT PRICE RANGE.
${detection.parameters.budgetDirection === 'lower' ? '- Show MORE AFFORDABLE options' : '- Show PREMIUM/HIGHER QUALITY options'}
${detection.parameters.newBudget ? `- Target budget: ${detection.parameters.newBudget} THB` : ''}
- Adjust recommendations to new price expectations`;

    case 'style_change':
      return `${baseInstruction}User wants DIFFERENT STYLE.
${detection.parameters.styleDirection === 'more_formal' ? '- Show MORE FORMAL options' : '- Show MORE CASUAL options'}
- Keep same occasion context
- Explain why new style fits their needs`;

    case 'brand_change':
      return `${baseInstruction}User wants DIFFERENT BRANDS.
- Show products from DIFFERENT brands than previously recommended
- Maintain same style and price range
- Highlight brand variety`;

    case 'size_issue':
      return `${baseInstruction}User has SIZE CONCERNS.
- Focus on fit and sizing options
- Mention available sizes
- Suggest similar styles in better fits`;

    case 'general_refine':
    default:
      return `${baseInstruction}User wants DIFFERENT recommendations.
- Show completely DIFFERENT options from previous
- Maintain same occasion context
- Provide fresh alternatives`;
  }
}

/**
 * Formats follow-up detection for logging
 *
 * @param detection - Follow-up detection result
 * @returns Formatted string for logging
 */
export function formatFollowUpDetection(detection: FollowUpDetection): string {
  if (!detection.isFollowUp) {
    return '[Follow-up Handler] Not a follow-up request';
  }

  const confidencePercent = Math.round(detection.confidence * 100);

  return [
    `[Follow-up Handler] 🔄 FOLLOW-UP DETECTED`,
    `  Type: ${detection.type}`,
    `  Confidence: ${confidencePercent}%`,
    `  Keywords: ${detection.matchedKeywords.slice(0, 3).join(', ')}`,
    `  Parameters: ${JSON.stringify(detection.parameters)}`,
  ].join('\n');
}

/**
 * Export all utilities
 */
export default {
  detectFollowUpRequest,
  generateFollowUpInstruction,
  formatFollowUpDetection,
};
