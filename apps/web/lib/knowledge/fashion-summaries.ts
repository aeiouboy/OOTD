/**
 * Fashion Knowledge Base Summaries Module
 *
 * Consolidated fashion expertise from the OOTDay knowledge base:
 * - Fashion fundamentals (color theory, fabrics, fit)
 * - Thai cultural fashion context (auspicious colors, etiquette)
 * - Body type styling solutions
 * - Occasion dress codes
 * - Central Group brand sizing intelligence
 *
 * Based on: ootday_persona/knowledge_base/summaries/
 *
 * @version 1.0.0
 * @lastUpdated 2025-12-16
 */

/**
 * Knowledge Topics for retrieval
 */
export type KnowledgeTopic =
  | 'color'
  | 'fabric'
  | 'fit'
  | 'weather'
  | 'thai_culture'
  | 'auspicious_colors'
  | 'body_type'
  | 'occasion'
  | 'brand_sizing'
  | 'general';

/**
 * Fashion Fundamentals Knowledge
 */
export const FASHION_FUNDAMENTALS = {
  /** Color Theory */
  colorTheory: {
    basicCombinations: 'Monochromatic, analogous, complementary all work',
    outfitBalance: '70% base neutral + 20% complementary + 10% accent',
    safeRule: 'Neutrals (black, white, beige, gray) + any color always works',
    avoid: 'Dull + harsh colors together',
  },

  /** Fabrics for Thai Climate */
  fabrics: {
    bestForHeat: ['Cotton', 'Linen', 'Modal', 'Technical moisture-wicking'],
    avoid: ['Heavy polyester', 'Thick non-breathable synthetics'],
    thaiReality: 'AC everywhere (18-20°C indoors) = need layers year-round',
    rainySeason: 'Quick-dry fabrics, dark colors, water-resistant shoes',
  },

  /** Fit & Proportions */
  fit: {
    perfectFitChecklist: [
      'Shoulders at seams',
      'No pulling/gaping',
      'Sleeves proper length',
      'Covers sitting position',
    ],
    thaiPetiteTips: 'High-waist = magic! Tailoring affordable (฿200-500)',
    proportionTips: 'Monochromatic for height, V-necks elongate, high-waist lengthens legs',
    goldenRule: 'Proportion > size - where clothes HIT matters more than size number',
  },

  /** Weather Strategies */
  weather: {
    hotSeason: 'Light colors, breathable fabrics, cardigan for AC (Mar-May)',
    rainySeason: 'Dark colors, above-ankle lengths, waterproof shoes (May-Oct)',
    coolSeason: 'Layers work! Light jackets, denim perfectly normal (Nov-Feb)',
    acSurvival: 'Always carry cardigan/scarf (malls freezing!)',
  },
} as const;

/**
 * Thai Culture & Fashion Context
 */
export const THAI_CULTURE_FASHION = {
  /** Core Values */
  values: {
    presentation: 'Appearance judged; effort appreciated',
    modesty: 'Shoulders/knees covered in formal/temple settings',
    socialHierarchy: 'Dress appropriately for status; brand awareness = status symbol',
  },

  /** Birth Day Colors (Primary Auspicious System) */
  birthDayColors: {
    monday: { color: 'Yellow', meaning: 'Wealth, abundance' },
    tuesday: { color: 'Pink/Red', meaning: 'Love, power, courage' },
    wednesdayDay: { color: 'Green', meaning: 'Growth, wisdom' },
    wednesdayNight: { color: 'Gray/Dark', meaning: 'Mystery, protection' },
    thursday: { color: 'Orange', meaning: 'Wisdom, prosperity, luck ⭐ BEST!' },
    friday: { color: 'Blue', meaning: 'Love, happiness, beauty' },
    saturday: { color: 'Purple/Black', meaning: 'Stability, slow but steady' },
    sunday: { color: 'Red', meaning: 'Power, leadership, victory' },
  },

  /** Fortune-Specific Colors */
  fortuneColors: {
    financial: 'Gold, yellow, emerald, orange-gold',
    love: 'Pink (Tuesday), blue (Friday) ⭐ BEST',
    career: 'Orange (Thursday), green (Wed), red (Sunday) ⭐ Leaders',
    health: 'Green, blue pastels, orange',
    windfall: 'Orange-gold (Thursday) ⭐⭐⭐ LOTTERY!',
  },

  /** Color Sensitivity by Occasion */
  colorSensitivity: {
    royal: 'Yellow = Royal respect',
    funeral: 'Black or white ONLY (conservative)',
    wedding: 'NEVER white (bride), avoid red/all black',
    happy: 'NEVER all black (death association)',
    temple: 'White preferred, modest colors, avoid harsh',
  },

  /** Regional Differences */
  regional: {
    bangkok: 'Most fashion-forward, international influence OK, Western trends accepted',
    chiangMai: 'Bohemian appreciated, more casual, cooler climate',
    phuket: 'Beach casual standard, more revealing OK in resort areas',
    isaan: 'Traditional dress values, conservative, functional over fashion',
    deepSouth: 'Muslim influence strong, must cover shoulders/knees',
  },

  /** Etiquette */
  etiquette: {
    do: ['Remove shoes (homes/temples)', 'Dress up for shopping (better service!)', 'Cover temples', 'Respect occasions'],
    doNot: ['Wear all black to happy occasions', 'White to weddings', 'Reveal at temples', 'Be too casual in formal settings'],
  },
} as const;

/**
 * Body Type Styling Solutions
 */
export const BODY_TYPE_STYLING = {
  /** Five Body Types */
  types: {
    hourglass: {
      thaiName: 'นาฬิกาทราย',
      feature: 'Wide shoulders ≈ wide hips, defined waist',
      bestStyles: ['Fitted clothes', 'Wrap dresses', 'Belted styles', 'Peplum tops'],
      avoid: ['Boxy', 'Oversized', 'Tent dresses'],
    },
    pear: {
      thaiName: 'สามเหลี่ยม',
      feature: 'Hips wider than shoulders, smaller bust',
      bestStyles: ['A-line skirts', 'Boat necklines', 'Bright tops', 'Dark bottoms'],
      avoid: ['Skinny jeans', 'Hip-hugging', 'Cropped tops'],
    },
    apple: {
      thaiName: 'กลม',
      feature: 'Weight at midsection, smaller legs, less defined waist',
      bestStyles: ['Empire waist', 'V-necks', 'Flowy fabrics', 'Vertical details'],
      avoid: ['Tight waistbands', 'Crop tops', 'Clingy fabrics', 'Belts at waist'],
    },
    rectangle: {
      thaiName: 'สี่เหลี่ยม',
      feature: 'Shoulders ≈ waist ≈ hips, straight silhouette',
      bestStyles: ['Belts', 'Ruffles', 'Peplum', 'Gathered waists', 'Color blocking'],
      avoid: ['Straight unbelted dresses', 'Shapeless cuts'],
    },
    invertedTriangle: {
      thaiName: 'สามเหลี่ยมคว่ำ',
      feature: 'Broad shoulders, narrow hips, small bottom',
      bestStyles: ['A-line skirts', 'Wide-leg pants', 'Bright bottoms', 'Horizontal stripes on bottom'],
      avoid: ['Shoulder pads', 'Boat necks', 'Sleeveless', 'Dark bottoms only'],
    },
  },

  /** Thai-Specific Considerations */
  thaiProportions: {
    averageHeight: '155-160cm (petite by international standards)',
    commonTypes: 'Pear or rectangle most common',
    commonIssue: 'Long torso + short legs OR short torso + long legs',
    solution: 'Petite sizing + tailoring (affordable in Thailand!)',
  },

  /** Petite Golden Rules (155-160cm) */
  petiteRules: {
    do: [
      'High-waist EVERYTHING (lengthens leg = magic!)',
      'Cropped jackets (proportional, not overwhelming)',
      'V-necks + vertical lines (elongates body)',
      'Monochromatic outfits (one continuous line)',
      'Nude shoes (extends leg line)',
      'Proportional jewelry (delicate, not chunky)',
    ],
    avoid: ['Too much volume', 'Maxi lengths', 'Oversized everything', 'Ankle straps'],
  },

  /** Problem Area Solutions */
  problemAreas: {
    wideShoulders: {
      do: ['V-neck', 'Scoop', 'U-neck', 'Raglan sleeves', 'Dark colors', 'Vertical details'],
      avoid: ['Boat neck', 'Shoulder pads', 'Horizontal stripes', 'Cap sleeves'],
    },
    largeBust: {
      do: ['V-neck', 'Wrap tops', 'Structured bras', 'Simple designs', 'Darker tops'],
      avoid: ['High necklines', 'Busy patterns', 'Clingy fabrics', 'Tight fits'],
    },
    thickWaist: {
      do: ['Empire waist', 'Flowy/draped', 'Longer tops', 'Vertical details', 'A-line silhouettes'],
      avoid: ['Tight waistbands', 'Horizontal stripes at waist', 'Crop tops', 'Clingy fits'],
    },
    wideHips: {
      do: ['A-line skirts', 'Dark bottoms', 'Structured fabrics', 'Longer tops'],
      avoid: ['Skinny jeans', 'Hip-hugging', 'Pocket details', 'Light tight pants'],
    },
    shortLegs: {
      do: ['High-waist', 'Nude shoes', 'Monochromatic', 'Pointed-toe shoes', 'Longer tops'],
      avoid: ['Ankle straps (WORST!)', 'Capri length', 'Contrasting shoes/pants', 'Heavy boots'],
    },
  },
} as const;

/**
 * Occasion Dress Codes
 */
export const OCCASION_DRESS_CODES = {
  /** Thai Work Environments */
  work: {
    corporateFormal: {
      description: 'Banking, Law, Government',
      style: 'Navy/gray/black suit, dress shirt, dress tie, closed-toe shoes, conservative',
      avoid: 'Bright colors, patterns, casual anything',
      key: 'Over-dressed > under-dressed; cleanliness paramount',
    },
    businessCasual: {
      description: 'Tech, Creative, Startups',
      style: 'Collared shirt, chinos/dress pants, no tie, professional shoes, polished',
      avoid: 'T-shirts, denim, sneakers, casual tees',
    },
    smartCasual: {
      description: 'Agencies, Media, Retail',
      style: 'Nice top + jeans/casual pants, casual dress, flats/sneakers, clean appearance',
      avoid: 'Graphic tees, worn clothing, beachwear',
    },
  },

  /** Social Events */
  social: {
    wedding: {
      forbidden: 'White (bride), all black (funeral), red',
      encouraged: 'Jewel tones, pastels, Thai silk, gold/silver jewelry',
      bestColors: 'Emerald, sapphire, lavender, blush, coral',
      style: 'Modest but celebratory; day = conservative, evening = more glamorous',
    },
    funeral: {
      required: 'Black (preferred) or white, long sleeves/pants, closed shoes, minimal jewelry',
      colors: 'ONLY black, white, dark gray, dark blue',
      key: 'Respectful, conservative, humble appearance',
    },
    temple: {
      required: 'Shoulders covered, knees covered, no tight/revealing, respectful',
      practical: 'Slip-on shoes, bring socks (cold floors!), comfortable sitting',
      best: 'White or cream, modest colors, removed shoes inside',
      avoid: 'Black (funeral), tank tops, short skirts, beachwear',
    },
  },

  /** Shopping Scenarios */
  shopping: {
    mall: {
      insight: 'Thais DRESS UP to shop! Better service = better presentation',
      style: 'Nice jeans + cute top, casual dress, clean sneakers/loafers',
      tip: 'BRING CARDIGAN (malls freezing!)',
    },
    chatuchak: {
      style: 'Light cotton, comfortable sneakers, hat, loose-fitting (sweat!)',
      avoid: 'Flip-flops (too much walking), tight (will be sweaty)',
    },
    luxury: {
      description: 'Emporia, Paragon',
      style: 'Smart casual MINIMUM, good shoes, neat appearance',
      key: 'Presentation = service quality; dress well = better attention/discounts!',
    },
  },
} as const;

/**
 * Central Group Brand Sizing Intelligence
 */
export const BRAND_SIZING = {
  /** Thai Fashion Brands (TRUE TO SIZE) */
  thaiBrands: {
    jaspal: {
      rating: '⭐⭐⭐',
      sizing: 'TRUE TO SIZE',
      description: 'Premium Thai, made for Thai bodies, office-perfect',
      note: 'Very consistent sizing',
    },
    kloset: {
      sizing: 'TRUE TO SIZE',
      description: 'Thai contemporary, feminine, elegant',
      note: 'Consistent quality control',
    },
    cpsOtter: {
      sizing: 'True to size',
      description: 'Budget basics, affordable',
    },
    poetry: {
      sizing: 'True to size',
      description: 'Romantic, feminine, popular with young Thais',
    },
  },

  /** International Brands - SIZE UP */
  internationalSizeUp: {
    zara: {
      warning: '⚠️ RUNS SMALL',
      advice: 'Size up 1 size (M → L for Thais)',
      note: 'European sizing, fitted cut',
    },
    mango: {
      warning: '⚠️ RUNS SMALL',
      advice: 'Size up 1 size',
      note: 'Similar to Zara sizing',
    },
  },

  /** International Brands - TRUE TO SIZE */
  internationalTrueSize: {
    hAndM: {
      sizing: '✅ TRUE TO SIZE',
      note: 'Check line type for variations',
    },
    uniqlo: {
      sizing: '✅ PERFECT FOR THAI',
      note: 'Asian sizing! Length proportioned correctly, consistent quality',
      recommendation: '⭐ Best for Thai proportions',
    },
    cos: {
      sizing: 'Slightly oversized aesthetic',
      note: 'Part of H&M group',
    },
  },

  /** Luxury Brands - EXTREME CAUTION */
  luxury: {
    gucci: {
      warning: '⚠️⚠️ RUNS VERY SMALL',
      advice: 'Size up 2 sizes! Italian sizing!',
      note: 'Expensive mistakes hurt badly - TRY IN-STORE FIRST!',
    },
    general: 'Most luxury runs smaller = extra caution needed',
  },

  /** Quick Reference */
  quickReference: {
    zaraMangoSizeUp: 'ZARA/MANGO: Size up 1 size (runs small!)',
    uniqloNormal: 'UNIQLO: Order your normal size (Asian sizing perfect!)',
    jaspalNormal: 'JASPAL: Order your normal size (Thai brand, consistent!)',
    gucciSizeUp: 'GUCCI: Size up 2 sizes! (Italian tiny!)',
  },
} as const;

/**
 * Get relevant knowledge for a specific topic
 */
export function getRelevantKnowledge(topic: KnowledgeTopic): string {
  switch (topic) {
    case 'color':
      return `COLOR KNOWLEDGE:
- Basic combinations: ${FASHION_FUNDAMENTALS.colorTheory.basicCombinations}
- Outfit balance: ${FASHION_FUNDAMENTALS.colorTheory.outfitBalance}
- Safe rule: ${FASHION_FUNDAMENTALS.colorTheory.safeRule}`;

    case 'fabric':
      return `FABRIC KNOWLEDGE (Thai Climate):
- Best for heat: ${FASHION_FUNDAMENTALS.fabrics.bestForHeat.join(', ')}
- Avoid: ${FASHION_FUNDAMENTALS.fabrics.avoid.join(', ')}
- Thai reality: ${FASHION_FUNDAMENTALS.fabrics.thaiReality}`;

    case 'fit':
      return `FIT & PROPORTIONS:
- Perfect fit: ${FASHION_FUNDAMENTALS.fit.perfectFitChecklist.join(', ')}
- Thai petite: ${FASHION_FUNDAMENTALS.fit.thaiPetiteTips}
- Golden rule: ${FASHION_FUNDAMENTALS.fit.goldenRule}`;

    case 'weather':
      return `WEATHER STRATEGIES:
- Hot season: ${FASHION_FUNDAMENTALS.weather.hotSeason}
- Rainy season: ${FASHION_FUNDAMENTALS.weather.rainySeason}
- Cool season: ${FASHION_FUNDAMENTALS.weather.coolSeason}
- AC survival: ${FASHION_FUNDAMENTALS.weather.acSurvival}`;

    case 'thai_culture':
      return `THAI FASHION CULTURE:
- Presentation matters: ${THAI_CULTURE_FASHION.values.presentation}
- Modesty: ${THAI_CULTURE_FASHION.values.modesty}
- Regional: Bangkok=${THAI_CULTURE_FASHION.regional.bangkok}`;

    case 'auspicious_colors':
      return `THAI AUSPICIOUS COLORS:
- Monday: ${THAI_CULTURE_FASHION.birthDayColors.monday.color} (${THAI_CULTURE_FASHION.birthDayColors.monday.meaning})
- Thursday: ${THAI_CULTURE_FASHION.birthDayColors.thursday.color} (${THAI_CULTURE_FASHION.birthDayColors.thursday.meaning})
- Friday: ${THAI_CULTURE_FASHION.birthDayColors.friday.color} (${THAI_CULTURE_FASHION.birthDayColors.friday.meaning})
- Financial luck: ${THAI_CULTURE_FASHION.fortuneColors.financial}
- Love luck: ${THAI_CULTURE_FASHION.fortuneColors.love}`;

    case 'body_type':
      return `BODY TYPE STYLING:
- Thai average: ${BODY_TYPE_STYLING.thaiProportions.averageHeight}
- Common types: ${BODY_TYPE_STYLING.thaiProportions.commonTypes}
- Solution: ${BODY_TYPE_STYLING.thaiProportions.solution}
- Petite magic: High-waist EVERYTHING lengthens legs!`;

    case 'occasion':
      return `OCCASION DRESS CODES:
- Wedding: ${OCCASION_DRESS_CODES.social.wedding.bestColors} (Never: ${OCCASION_DRESS_CODES.social.wedding.forbidden})
- Funeral: ${OCCASION_DRESS_CODES.social.funeral.colors}
- Temple: ${OCCASION_DRESS_CODES.social.temple.best}
- Work: Corporate=${OCCASION_DRESS_CODES.work.corporateFormal.key}`;

    case 'brand_sizing':
      return `BRAND SIZING INTELLIGENCE:
- ${BRAND_SIZING.quickReference.zaraMangoSizeUp}
- ${BRAND_SIZING.quickReference.uniqloNormal}
- ${BRAND_SIZING.quickReference.jaspalNormal}
- ${BRAND_SIZING.quickReference.gucciSizeUp}`;

    case 'general':
    default:
      return getKnowledgeSummary();
  }
}

/**
 * Get general knowledge summary for AI context
 */
export function getKnowledgeSummary(): string {
  return `FASHION EXPERTISE SUMMARY:

🎨 COLOR THEORY:
- Outfit balance: 70% neutral + 20% complementary + 10% accent
- Safe rule: Neutrals + any color always works
- Thai auspicious: Thursday orange=luck, Friday blue=love

👗 FIT & PROPORTIONS:
- Golden rule: Proportion > size (where clothes HIT matters)
- Thai petite (155-160cm): High-waist = magic!
- Tailoring affordable in Thailand (฿200-500)

🌡️ THAI CLIMATE:
- AC everywhere: Always carry cardigan/scarf
- Hot season: Light colors, breathable fabrics
- Best fabrics: Cotton, linen, modal, moisture-wicking

🏬 BRAND SIZING:
- ZARA/MANGO: Size up 1 (runs small!)
- UNIQLO: Perfect for Thai (Asian sizing!)
- JASPAL: True to size (made for Thai bodies)

🎭 CULTURAL CONTEXT:
- Wedding: Never white/black/red, wear jewel tones
- Funeral: Black/white only
- Temple: Shoulders & knees covered, modest colors
- Shopping: Dress up = better service!

💪 BODY POSITIVE:
- Every body has styling solutions
- Flattery through fit, not hiding
- Right cut beats expensive brand`;
}

/**
 * Format knowledge for prompt injection
 */
export function formatKnowledgeForPrompt(topics: KnowledgeTopic[]): string {
  if (topics.length === 0) {
    return '';
  }

  const knowledgeSections = topics.map((topic) => getRelevantKnowledge(topic));
  return `\n[FASHION KNOWLEDGE CONTEXT]\n${knowledgeSections.join('\n\n')}`;
}

/**
 * Detect relevant knowledge topics from user message
 */
export function detectKnowledgeTopics(message: string): KnowledgeTopic[] {
  const lowerMessage = message.toLowerCase();
  const topics: KnowledgeTopic[] = [];

  // Color-related keywords
  if (/สี|color|มงคล|lucky|โชค|fortune|เสริมดวง/.test(lowerMessage)) {
    topics.push('color');
    if (/มงคล|lucky|โชค|fortune|เสริมดวง|วันเกิด/.test(lowerMessage)) {
      topics.push('auspicious_colors');
    }
  }

  // Fabric-related keywords
  if (/ผ้า|fabric|material|วัสดุ|cotton|linen|ร้อน|เย็น|หนาว/.test(lowerMessage)) {
    topics.push('fabric');
    topics.push('weather');
  }

  // Fit-related keywords
  if (/ไซส์|size|fit|พอดี|หลวม|คับ|เล็ก|ใหญ่|tailoring|แก้|ตัด/.test(lowerMessage)) {
    topics.push('fit');
  }

  // Body type keywords
  if (/รูปร่าง|body|type|เตี้ย|สูง|อ้วน|ผอม|petite|สะโพก|เอว|ไหล่/.test(lowerMessage)) {
    topics.push('body_type');
  }

  // Occasion keywords
  if (/งาน|occasion|wedding|แต่งงาน|บวช|funeral|ศพ|temple|วัด|ทำงาน|work|office/.test(lowerMessage)) {
    topics.push('occasion');
    topics.push('thai_culture');
  }

  // Brand/sizing keywords
  if (/brand|แบรนด์|zara|uniqlo|jaspal|h&m|mango|gucci|central/.test(lowerMessage)) {
    topics.push('brand_sizing');
  }

  // Thai culture keywords
  if (/ไทย|thai|วัฒนธรรม|culture|ประเพณี|tradition|temple|วัด/.test(lowerMessage)) {
    topics.push('thai_culture');
  }

  // If no specific topics detected, return general
  if (topics.length === 0) {
    return ['general'];
  }

  // Remove duplicates and return
  return Array.from(new Set(topics));
}

/**
 * Export metadata for tracking
 */
export const FASHION_KNOWLEDGE_METADATA = {
  version: 'v1.0.0' as const,
  createdAt: '2025-12-16',
  lastUpdated: '2025-12-16',
  basedOn: 'ootday_persona/knowledge_base/summaries/',
  categories: [
    'Fashion Fundamentals (color, fabric, fit, weather)',
    'Thai Culture & Fashion (auspicious colors, etiquette, regional)',
    'Body Type Styling (5 types, petite rules, problem areas)',
    'Occasion Dress Codes (work, social, shopping)',
    'Brand Sizing Intelligence (Central Group brands)',
  ],
  description: 'Consolidated fashion expertise for AI context injection',
};
