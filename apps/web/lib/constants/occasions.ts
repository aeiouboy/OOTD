/**
 * Occasion Definitions
 * Aligned with occasion_expertise.py from Python backend
 *
 * OCCASIONS constant is the hardcoded fallback.
 * Use getOccasionsFromDB() for data-driven occasion config from Supabase.
 */

import type { OccasionType, FormalityLevel } from '../types/enums'
import type { LocalizedText } from '../types/localization-types'
import { loadOccasionConfig, type OccasionConfig } from '@/lib/supabase/occasions'

export interface OccasionDefinition {
  type: OccasionType
  name: LocalizedText
  description: LocalizedText
  formalityRange: {
    min: FormalityLevel
    max: FormalityLevel
  }
  keywords: string[]
  styleGuidelines: {
    keyPieces: string[]
    avoidItems: string[]
    colorSuggestions: string[]
  }
}

/**
 * The 9 core occasions from occasion_expertise.py
 */
export const OCCASIONS: Record<OccasionType, OccasionDefinition> = {
  work: {
    type: 'work',
    name: {
      th: 'ทำงาน/ออฟฟิศ',
      en: 'Work/Office',
    },
    description: {
      th: 'เหมาะสำหรับการทำงานในออฟฟิศ ดูมืออาชีพและเรียบร้อย',
      en: 'Professional, polished, appropriate for Thai workplace culture',
    },
    formalityRange: {
      min: 6,
      max: 9,
    },
    keywords: [
      'ทำงาน',
      'ออฟฟิศ',
      'ประชุม',
      'work',
      'office',
      'meeting',
      'professional',
      'business',
    ],
    styleGuidelines: {
      keyPieces: ['เสื้อเชิ้ต', 'เบลเซอร์', 'กางเกงสแล็ค', 'กระโปรงทรงเอ', 'เดรสแขนยาว'],
      avoidItems: ['เสื้อแขนกุด', 'กางเกงขาสั้น', 'รองเท้าแตะ', 'เสื้อยืด'],
      colorSuggestions: ['สีกรมท่า', 'สีขาว', 'สีเทา', 'สีดำ', 'สีเบจ'],
    },
  },

  chill: {
    type: 'chill',
    name: {
      th: 'วันชิลล์/วันหยุด',
      en: 'Chill Day/Relaxed',
    },
    description: {
      th: 'สบายๆ ชิลๆ เหมาะกับวันหยุดพักผ่อน',
      en: 'Comfortable, casual, effortlessly stylish',
    },
    formalityRange: {
      min: 1,
      max: 4,
    },
    keywords: ['chill', 'สบายๆ', 'วันหยุด', 'relax', 'casual', 'weekend', 'leisure'],
    styleGuidelines: {
      keyPieces: ['เสื้อยืด', 'กางเกงยีนส์', 'กางเกงขาสั้น', 'เดรสแขนสั้น', 'รองเท้าผ้าใบ'],
      avoidItems: ['ชุดเป็นทางการเกินไป', 'รองเท้าส้นสูง', 'ชุดที่ต้องรีด'],
      colorSuggestions: ['สีพาสเทล', 'สีขาว', 'สีเดนิม', 'สีเอิร์ธโทน'],
    },
  },

  wedding: {
    type: 'wedding',
    name: {
      th: 'งานแต่งงาน',
      en: 'Wedding',
    },
    description: {
      th: 'เหมาะสำหรับงานแต่งงาน หรูหราและเป็นทางการ',
      en: 'Elegant, appropriate formality level, Thai cultural considerations',
    },
    formalityRange: {
      min: 7,
      max: 10,
    },
    keywords: ['งานแต่ง', 'แต่งงาน', 'เจ้าสาว', 'เจ้าบ่าว', 'wedding', 'ceremony'],
    styleGuidelines: {
      keyPieces: ['ชุดราตรี', 'ชุดไทย', 'เดรสยาว', 'ชุดสูท', 'รองเท้าส้นสูง'],
      avoidItems: ['สีขาวล้วน', 'สีดำล้วน', 'ชุดสั้นเกินไป', 'กางเกงยีนส์'],
      colorSuggestions: ['สีชมพู', 'สีฟ้า', 'สีเขียวมิ้นท์', 'สีทอง', 'สีม่วง'],
    },
  },

  sport: {
    type: 'sport',
    name: {
      th: 'ออกกำลังกาย',
      en: 'Sport/Exercise',
    },
    description: {
      th: 'เหมาะสำหรับการออกกำลังกาย ฟิตเนส หรือกีฬา',
      en: 'Functional, performance-oriented, trendy activewear',
    },
    formalityRange: {
      min: 1,
      max: 2,
    },
    keywords: ['ออกกำลัง', 'วิ่ง', 'โยคะ', 'ฟิตเนส', 'gym', 'sport', 'exercise', 'workout'],
    styleGuidelines: {
      keyPieces: ['Sports bra', 'เลกกิ้ง', 'กางเกงขาสั้นวิ่ง', 'เสื้อ dri-fit', 'รองเท้ากีฬา'],
      avoidItems: ['เสื้อผ้าฝ้าย 100%', 'กางเกงยีนส์', 'รองเท้าแฟชั่น'],
      colorSuggestions: ['สีดำ', 'สีเทา', 'สีน้ำเงิน', 'สีชมพูนีออน', 'สีเขียวมิ้นท์'],
    },
  },

  travel: {
    type: 'travel',
    name: {
      th: 'ท่องเที่ยว',
      en: 'Travel',
    },
    description: {
      th: 'เหมาะสำหรับการเดินทางท่องเที่ยว สบายและใส่ง่าย',
      en: 'Versatile, comfortable, packable, climate-appropriate',
    },
    formalityRange: {
      min: 2,
      max: 5,
    },
    keywords: ['เที่ยว', 'ทริป', 'travel', 'vacation', 'holiday', 'trip', 'tour'],
    styleGuidelines: {
      keyPieces: ['กางเกงขายาวผ้าบาง', 'เสื้อยืดคอตตอน', 'เดรสแมกซี่', 'รองเท้าเดินสบาย'],
      avoidItems: ['ชุดที่ต้องรีด', 'รองเท้าใหม่', 'เครื่องประดับราคาแพง'],
      colorSuggestions: ['สีกลาง', 'สีที่ซ่อนรอยเปื้อน', 'ลายที่ไม่เห็นรอยยับ'],
    },
  },

  date: {
    type: 'date',
    name: {
      th: 'เดท',
      en: 'Date',
    },
    description: {
      th: 'เหมาะสำหรับการออกเดท ดูดีและมั่นใจ',
      en: 'Attractive, confidence-boosting, occasion-appropriate',
    },
    formalityRange: {
      min: 4,
      max: 7,
    },
    keywords: ['เดท', 'date', 'นัด', 'romantic', 'dating'],
    styleGuidelines: {
      keyPieces: ['เดรสสั้น', 'เสื้อสวย', 'กางเกงขายาวทรงสวย', 'รองเท้าส้น'],
      avoidItems: ['ชุดที่ดูไม่ใส่ใจ', 'รองเท้าที่เดินไม่สะดวก', 'ชุดที่เปิดเผยเกินไป'],
      colorSuggestions: ['สีแดง', 'สีชมพู', 'สีดำ', 'สีน้ำเงิน', 'ลายดอกไม้'],
    },
  },

  dinner: {
    type: 'dinner',
    name: {
      th: 'ดินเนอร์',
      en: 'Dinner',
    },
    description: {
      th: 'เหมาะสำหรับการทานอาหารค่ำ ดูหรูหราและมีคลาส',
      en: 'Sophisticated, restaurant-appropriate',
    },
    formalityRange: {
      min: 5,
      max: 8,
    },
    keywords: ['ดินเนอร์', 'อาหารค่ำ', 'dinner', 'restaurant', 'dining'],
    styleGuidelines: {
      keyPieces: ['เดรสค็อกเทล', 'เสื้อผ้าไหม', 'กางเกงผ้า', 'เบลเซอร์', 'รองเท้าหุ้มส้น'],
      avoidItems: ['กางเกงยีนส์ขาด', 'รองเท้าแตะ', 'เสื้อยืด', 'ชุดกีฬา'],
      colorSuggestions: ['สีดำ', 'สีกรมท่า', 'สีเบอร์กันดี', 'สีเขียวเข้ม'],
    },
  },

  cafe: {
    type: 'cafe',
    name: {
      th: 'คาเฟ่',
      en: 'Cafe',
    },
    description: {
      th: 'เหมาะสำหรับไปนั่งคาเฟ่ สบายแต่ดูดี Instagram-worthy',
      en: 'Trendy, Instagram-worthy, relaxed',
    },
    formalityRange: {
      min: 2,
      max: 5,
    },
    keywords: ['คาเฟ่', 'กาแฟ', 'cafe', 'coffee', 'brunch', 'tea'],
    styleGuidelines: {
      keyPieces: ['เดรสลูกไม้', 'เสื้อครอป', 'กางเกงยีนส์', 'กระโปรงพลีท', 'รองเท้าผ้าใบ'],
      avoidItems: ['ชุดเป็นทางการเกิน', 'ชุดกีฬา', 'ชุดที่ดูไม่ได้ใส่ใจ'],
      colorSuggestions: ['สีพาสเทล', 'สีขาวครีม', 'สีเบจ', 'ลายตาราง', 'ลายดอกไม้'],
    },
  },

  party: {
    type: 'party',
    name: {
      th: 'ปาร์ตี้',
      en: 'Party',
    },
    description: {
      th: 'เหมาะสำหรับงานปาร์ตี้ โดดเด่นและสนุกสนาน',
      en: 'Fun, statement-making, event-appropriate',
    },
    formalityRange: {
      min: 5,
      max: 9,
    },
    keywords: ['ปาร์ตี้', 'party', 'celebrate', 'เลี้ยง', 'celebration', 'event'],
    styleGuidelines: {
      keyPieces: ['ชุดเดรสสั้น', 'จั๊มสูท', 'ชุดเซ็ต', 'รองเท้าส้นสูง', 'คลัทช์'],
      avoidItems: ['ชุดจืดเกินไป', 'รองเท้าที่เต้นไม่ได้', 'กระเป๋าใหญ่เทอะทะ'],
      colorSuggestions: ['สีเมทัลลิค', 'สีดำ', 'สีแดง', 'sequin', 'ผ้ามันวาว'],
    },
  },
}

/**
 * Helper to get occasion by type
 */
export function getOccasion(type: OccasionType): OccasionDefinition {
  return OCCASIONS[type]
}

/**
 * Get all occasion types
 */
export function getAllOccasionTypes(): OccasionType[] {
  return Object.keys(OCCASIONS) as OccasionType[]
}

/**
 * Get occasions by formality range
 */
export function getOccasionsByFormality(formality: FormalityLevel): OccasionType[] {
  return getAllOccasionTypes().filter((type) => {
    const occasion = OCCASIONS[type]
    return formality >= occasion.formalityRange.min && formality <= occasion.formalityRange.max
  })
}

/**
 * Match occasion from text keywords
 */
export function matchOccasionFromText(text: string): OccasionType | null {
  const lowerText = text.toLowerCase()

  for (const [type, definition] of Object.entries(OCCASIONS)) {
    if (definition.keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))) {
      return type as OccasionType
    }
  }

  return null
}

/**
 * Convert Supabase OccasionConfig to OccasionDefinition format
 */
function configToDefinition(config: OccasionConfig): OccasionDefinition {
  return {
    type: config.occasion_type as OccasionType,
    name: { th: config.name_th, en: config.name_en },
    description: { th: config.description_th || '', en: config.description_en || '' },
    formalityRange: {
      min: config.formality_min as FormalityLevel,
      max: config.formality_max as FormalityLevel,
    },
    keywords: config.keywords,
    styleGuidelines: {
      keyPieces: config.key_pieces,
      avoidItems: config.avoid_items,
      colorSuggestions: config.color_suggestions,
    },
  }
}

/**
 * Async loader - prefers Supabase occasion_config table, falls back to hardcoded OCCASIONS
 */
export async function getOccasionsFromDB(): Promise<Record<OccasionType, OccasionDefinition>> {
  try {
    const configs = await loadOccasionConfig()
    if (configs.length > 0) {
      const result: Partial<Record<OccasionType, OccasionDefinition>> = {}
      for (const config of configs) {
        result[config.occasion_type as OccasionType] = configToDefinition(config)
      }
      console.log(`[Occasions] Using ${configs.length} occasions from Supabase`)
      return result as Record<OccasionType, OccasionDefinition>
    }
  } catch (err) {
    console.warn('[Occasions] Failed to load from Supabase, using fallback:', err)
  }
  return OCCASIONS
}
