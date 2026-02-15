import type { ChatLookStyling } from '../types/chat-types'

export interface StylingCompletionProfile {
  id: string
  keywords: string[]
  footwear: ChatLookStyling
}

export const STYLING_COMPLETION_PROFILES: StylingCompletionProfile[] = [
  {
    id: 'party',
    keywords: ['party', 'ปาร์ตี้', 'night', 'night out', 'date', 'เดท', 'dinner', 'ดินเนอร์'],
    footwear: {
      description: 'Strappy heeled sandals in black',
      category: 'Shoes',
    },
  },
  {
    id: 'work',
    keywords: ['work', 'office', 'ทำงาน', 'ออฟฟิศ'],
    footwear: {
      description: 'Polished closed-toe heels in black',
      category: 'Shoes',
    },
  },
  {
    id: 'travel',
    keywords: ['travel', 'trip', 'เที่ยว', 'day out', 'casual', 'แคชชวล', 'chill', 'วันหยุด'],
    footwear: {
      description: 'Clean minimalist sneakers in white',
      category: 'Shoes',
    },
  },
]

export const DEFAULT_FOOTWEAR_STYLING: ChatLookStyling = {
  description: 'Minimal heeled sandals in a neutral tone',
  category: 'Shoes',
}
