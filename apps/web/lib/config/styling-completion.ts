import type { ChatLookStyling } from '../types/chat-types'

export interface StylingCompletionProfile {
  id: string
  keywords: string[]
  footwear: ChatLookStyling
  bag: ChatLookStyling
  jewelry: ChatLookStyling
}

export interface FlatLaySupplementConfig {
  maxTotal: number
  maxFootwear: number
  maxAccessory: number
}

export const STYLING_COMPLETION_PROFILES: StylingCompletionProfile[] = [
  {
    id: 'party',
    keywords: ['party', 'ปาร์ตี้', 'night', 'night out', 'date', 'เดท', 'dinner', 'ดินเนอร์'],
    footwear: {
      description: 'Strappy heeled sandals in black',
      category: 'Shoes',
    },
    bag: {
      description: 'Elegant clutch bag in metallic gold',
      category: 'Bag',
    },
    jewelry: {
      description: 'Statement drop earrings in gold tone',
      category: 'Jewelry',
    },
  },
  {
    id: 'work',
    keywords: ['work', 'office', 'ทำงาน', 'ออฟฟิศ'],
    footwear: {
      description: 'Polished closed-toe heels in black',
      category: 'Shoes',
    },
    bag: {
      description: 'Structured top-handle handbag in black',
      category: 'Bag',
    },
    jewelry: {
      description: 'Minimal stud earrings in silver tone',
      category: 'Jewelry',
    },
  },
  {
    id: 'travel',
    keywords: ['travel', 'trip', 'เที่ยว', 'day out', 'casual', 'แคชชวล', 'chill', 'วันหยุด'],
    footwear: {
      description: 'Clean minimalist sneakers in white',
      category: 'Shoes',
    },
    bag: {
      description: 'Compact crossbody bag in neutral beige',
      category: 'Bag',
    },
    jewelry: {
      description: 'Simple hoop earrings in silver tone',
      category: 'Jewelry',
    },
  },
]

export const DEFAULT_FOOTWEAR_STYLING: ChatLookStyling = {
  description: 'Minimal heeled sandals in a neutral tone',
  category: 'Shoes',
}

export const DEFAULT_BAG_STYLING: ChatLookStyling = {
  description: 'Minimal structured handbag in a neutral tone',
  category: 'Bag',
}

export const DEFAULT_JEWELRY_STYLING: ChatLookStyling = {
  description: 'Clean metallic earrings in a subtle finish',
  category: 'Jewelry',
}

export const FLAT_LAY_SUPPLEMENT_CONFIG: FlatLaySupplementConfig = {
  maxTotal: 3,
  maxFootwear: 1,
  maxAccessory: 2,
}
