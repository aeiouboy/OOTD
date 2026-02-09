/**
 * Thai Cultural Context Types
 * KB Expansion Feb 2026
 *
 * Implements types from Knowledge Base sections:
 * - Section 01: Fashion Fundamentals
 * - Section 02: Thai Culture & Fashion
 * - Section 07: Festivals & Holidays
 * - Section 12: Thai Micro-Seasons
 */

import type {
  ThaiDayOfWeek,
  CoverageType,
  WeddingAppropriateType,
  SongkranSuitability,
  CnySuitability,
  ThaiMonth,
} from './enums'

// ============================================================================
// THAI DAY COLOR SYSTEM
// ============================================================================

/**
 * Thai Day Color Mapping
 * Each day of the week has associated lucky and unlucky colors
 * Reference: KB Section 02 - Thai Culture & Fashion
 */
export interface ThaiDayColor {
  day: ThaiDayOfWeek
  luckyColors: string[]
  unluckyColors: string[]
  neutralColors: string[]
}

/**
 * Complete Thai Fortune Color System
 * Maps birth day to auspicious colors for the wearer
 */
export interface ThaiFortuneColors {
  birthDay: ThaiDayOfWeek
  primaryLucky: string      // Main lucky color
  secondaryLucky: string[]  // Additional lucky colors
  avoid: string[]           // Colors to avoid
  neutral: string[]         // Safe neutral colors
}

/**
 * Thai Day Color Database
 * Traditional Thai color associations by day of birth
 */
export const THAI_DAY_COLORS: Record<ThaiDayOfWeek, ThaiDayColor> = {
  sunday: {
    day: 'sunday',
    luckyColors: ['red', 'maroon', 'burgundy'],
    unluckyColors: ['blue', 'navy'],
    neutralColors: ['white', 'cream', 'beige'],
  },
  monday: {
    day: 'monday',
    luckyColors: ['yellow', 'cream', 'ivory'],
    unluckyColors: ['red', 'maroon'],
    neutralColors: ['white', 'gold', 'beige'],
  },
  tuesday: {
    day: 'tuesday',
    luckyColors: ['pink', 'rose', 'light-pink'],
    unluckyColors: ['yellow', 'gold'],
    neutralColors: ['white', 'cream', 'gray'],
  },
  wednesday: {
    day: 'wednesday',
    luckyColors: ['green', 'emerald', 'sage'],
    unluckyColors: ['pink', 'rose'],
    neutralColors: ['white', 'cream', 'brown'],
  },
  thursday: {
    day: 'thursday',
    luckyColors: ['orange', 'brown', 'tan'],
    unluckyColors: ['purple', 'violet'],
    neutralColors: ['white', 'cream', 'beige'],
  },
  friday: {
    day: 'friday',
    luckyColors: ['blue', 'light-blue', 'sky-blue'],
    unluckyColors: ['black', 'dark-gray'],
    neutralColors: ['white', 'cream', 'silver'],
  },
  saturday: {
    day: 'saturday',
    luckyColors: ['purple', 'violet', 'lavender'],
    unluckyColors: ['green', 'emerald'],
    neutralColors: ['white', 'black', 'gray'],
  },
}

// ============================================================================
// THAI CLIMATE CONTEXT
// ============================================================================

/**
 * Coverage Requirements for Cultural Appropriateness
 * Used for temple visits, formal occasions
 */
export interface CoverageRequirements {
  shoulders: CoverageType
  knees: CoverageType
  midriff?: CoverageType
  chest?: CoverageType
}

/**
 * Thai Climate Context Interface
 * Comprehensive Thai cultural and climate appropriateness
 * Reference: KB Sections 02, 07, 12
 */
export interface ThaiClimateContext {
  // --- Climate Suitability ---
  /** Overall suitability for Thai tropical climate (1-10) */
  thaiClimateRating: number
  /** Suitable for air-conditioned environments */
  acFriendly: boolean
  /** Month-by-month suitability scores (1-10), index 0 = January */
  monthSuitability: number[]

  // --- Cultural Appropriateness ---
  /** Appropriate for temple visits */
  templeAppropriate: boolean
  /** Wedding guest appropriateness */
  weddingAppropriate: WeddingAppropriateType
  /** Funeral appropriateness (black required) */
  funeralAppropriate: boolean

  // --- Festival Suitability ---
  /** Songkran (Thai New Year) suitability */
  songkranSuitable: SongkranSuitability
  /** Loy Krathong suitability */
  loyKrathongSuitable: boolean
  /** Chinese New Year suitability (red/gold = suitable, black/white/blue = unsuitable) */
  cnySuitable?: CnySuitability

  // --- Coverage for Cultural Settings ---
  /** Body coverage for temple/formal compliance */
  coverage: CoverageRequirements

  // --- Thai Day Colors ---
  /** Days this color is auspicious for */
  thaiDayColors?: ThaiDayOfWeek[]
}

// ============================================================================
// THAI CALENDAR EVENTS
// ============================================================================

/**
 * Thai Calendar Event
 * Important dates that affect fashion choices
 */
export interface ThaiCalendarEvent {
  name: string
  nameThai: string
  month: ThaiMonth
  day?: number
  colorRequired?: string
  colorRecommended?: string[]
  dressCode?: string
}

/**
 * Major Thai Events with Fashion Implications
 * Reference: KB Section 07, 12
 */
export const THAI_CALENDAR_EVENTS: ThaiCalendarEvent[] = [
  {
    name: "New Year's Day",
    nameThai: 'วันขึ้นปีใหม่',
    month: 1,
    day: 1,
    colorRecommended: ['white', 'gold', 'red'],
  },
  {
    name: 'Makha Bucha Day',
    nameThai: 'วันมาฆบูชา',
    month: 2,
    colorRecommended: ['white', 'cream'],
    dressCode: 'temple-appropriate',
  },
  {
    name: 'Songkran',
    nameThai: 'วันสงกรานต์',
    month: 4,
    day: 13,
    colorRecommended: ['white', 'floral', 'bright-colors'],
  },
  {
    name: 'Coronation Day',
    nameThai: 'วันฉัตรมงคล',
    month: 5,
    day: 4,
    colorRequired: 'yellow',
  },
  {
    name: "Queen's Birthday / Mother's Day",
    nameThai: 'วันแม่แห่งชาติ',
    month: 8,
    day: 12,
    colorRequired: 'light-blue',
  },
  {
    name: 'King Rama IX Memorial Day',
    nameThai: 'วันคล้ายวันสวรรคต ร.9',
    month: 10,
    day: 13,
    colorRequired: 'black',
  },
  {
    name: "King's Birthday / Father's Day",
    nameThai: 'วันพ่อแห่งชาติ',
    month: 12,
    day: 5,
    colorRequired: 'yellow',
  },
  {
    name: 'Loy Krathong',
    nameThai: 'วันลอยกระทง',
    month: 11,
    colorRecommended: ['traditional-thai', 'pastel', 'elegant'],
    dressCode: 'smart-casual-to-elegant',
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get lucky colors for a specific day of the week
 * @param day - Day of week
 * @returns Array of lucky colors
 */
export function getLuckyColorsForDay(day: ThaiDayOfWeek): string[] {
  return THAI_DAY_COLORS[day].luckyColors
}

/**
 * Check if a color is lucky for a specific day
 * @param color - Color to check
 * @param day - Day of week
 * @returns true if color is lucky
 */
export function isLuckyColorForDay(color: string, day: ThaiDayOfWeek): boolean {
  const normalizedColor = color.toLowerCase().replace(/\s+/g, '-')
  return THAI_DAY_COLORS[day].luckyColors.some(
    (c) => c.toLowerCase() === normalizedColor
  )
}

/**
 * Check if a color should be avoided for a specific day
 * @param color - Color to check
 * @param day - Day of week
 * @returns true if color should be avoided
 */
export function shouldAvoidColorForDay(color: string, day: ThaiDayOfWeek): boolean {
  const normalizedColor = color.toLowerCase().replace(/\s+/g, '-')
  return THAI_DAY_COLORS[day].unluckyColors.some(
    (c) => c.toLowerCase() === normalizedColor
  )
}

/**
 * Get the required color for a specific month (if any)
 * @param month - Month number (1-12)
 * @returns Required color or undefined
 */
export function getRequiredColorForMonth(month: ThaiMonth): string | undefined {
  const event = THAI_CALENDAR_EVENTS.find(
    (e) => e.month === month && e.colorRequired
  )
  return event?.colorRequired
}

/**
 * Check if an outfit is temple-appropriate based on coverage
 * @param coverage - Coverage requirements of the outfit
 * @returns true if temple-appropriate
 */
export function isTempleAppropriate(coverage: CoverageRequirements): boolean {
  return coverage.shoulders === 'covered' && coverage.knees === 'covered'
}

/**
 * Get Thai fortune colors for a birth day
 * @param birthDay - Day of week born on
 * @returns Fortune color recommendations
 */
export function getThaiFortuneColors(birthDay: ThaiDayOfWeek): ThaiFortuneColors {
  const dayColors = THAI_DAY_COLORS[birthDay]
  return {
    birthDay,
    primaryLucky: dayColors.luckyColors[0],
    secondaryLucky: dayColors.luckyColors.slice(1),
    avoid: dayColors.unluckyColors,
    neutral: dayColors.neutralColors,
  }
}
