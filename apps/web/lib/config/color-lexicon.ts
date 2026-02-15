import type { ColorName } from '../types/enums'

/**
 * Color lexicon is config-driven so matching rules can be updated without
 * changing service logic.
 */
export interface ColorLexiconEntry {
  aliases: string[]
  /**
   * Tokens used when filtering products by color text fields.
   */
  matchTokens: string[]
}

export const COLOR_LEXICON: Record<ColorName, ColorLexiconEntry> = {
  white: {
    aliases: ['white', 'สีขาว', 'ขาว', 'ครีม', 'สีครีม', 'off white', 'ivory'],
    matchTokens: ['white', 'off white', 'ivory', 'cream'],
  },
  black: {
    aliases: ['black', 'สีดำ', 'ดำ'],
    matchTokens: ['black'],
  },
  gray: {
    aliases: ['gray', 'grey', 'สีเทา', 'เทา', 'charcoal'],
    matchTokens: ['gray', 'grey', 'charcoal'],
  },
  grey: {
    aliases: ['gray', 'grey', 'สีเทา', 'เทา', 'charcoal'],
    matchTokens: ['gray', 'grey', 'charcoal'],
  },
  beige: {
    aliases: ['beige', 'สีเบจ', 'เบจ', 'nude', 'นู้ด', 'เนื้อ'],
    matchTokens: ['beige', 'nude', 'tan', 'sand'],
  },
  brown: {
    aliases: ['brown', 'สีน้ำตาล', 'น้ำตาล', 'mocha', 'chocolate'],
    matchTokens: ['brown', 'mocha', 'chocolate', 'camel'],
  },
  red: {
    aliases: ['red', 'สีแดง', 'แดง', 'maroon', 'burgundy', 'crimson', 'scarlet', 'wine', 'เลือดหมู'],
    matchTokens: ['red', 'maroon', 'burgundy', 'crimson', 'scarlet', 'wine', 'ruby'],
  },
  pink: {
    aliases: ['pink', 'สีชมพู', 'ชมพู', 'rose', 'fuchsia', 'hot pink'],
    matchTokens: ['pink', 'rose', 'fuchsia', 'magenta', 'hot pink'],
  },
  orange: {
    aliases: ['orange', 'สีส้ม', 'ส้ม', 'coral'],
    matchTokens: ['orange', 'coral', 'tangerine'],
  },
  yellow: {
    aliases: ['yellow', 'สีเหลือง', 'เหลือง', 'mustard'],
    matchTokens: ['yellow', 'mustard', 'golden'],
  },
  green: {
    aliases: ['green', 'สีเขียว', 'เขียว', 'olive', 'sage', 'mint'],
    matchTokens: ['green', 'olive', 'sage', 'mint', 'emerald'],
  },
  blue: {
    aliases: ['blue', 'สีน้ำเงิน', 'น้ำเงิน', 'สีฟ้า', 'ฟ้า', 'azure', 'cobalt'],
    matchTokens: ['blue', 'azure', 'cobalt', 'sky blue'],
  },
  navy: {
    aliases: ['navy', 'navy blue', 'สีกรมท่า', 'กรมท่า', 'midnight blue'],
    matchTokens: ['navy', 'midnight blue', 'dark blue'],
  },
  purple: {
    aliases: ['purple', 'สีม่วง', 'ม่วง', 'violet', 'lavender'],
    matchTokens: ['purple', 'violet', 'lavender', 'lilac'],
  },
  gold: {
    aliases: ['gold', 'สีทอง', 'ทอง'],
    matchTokens: ['gold', 'golden'],
  },
  silver: {
    aliases: ['silver', 'สีเงิน', 'เงิน'],
    matchTokens: ['silver', 'metallic silver'],
  },
  multi: {
    aliases: ['multi', 'multicolor', 'หลากสี', 'หลายสี', 'multi color'],
    matchTokens: ['multi', 'multicolor', 'rainbow', 'color block'],
  },
  neutral: {
    aliases: ['neutral', 'โทนกลาง', 'สีสุภาพ', 'earth tone', 'เอิร์ธโทน'],
    matchTokens: ['neutral', 'earth tone', 'beige', 'cream', 'tan', 'brown'],
  },
}
