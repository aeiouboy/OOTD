/**
 * Localization Types
 * Defines bilingual (Thai/English) content structures
 */

// Supported languages
export type Language = 'th' | 'en'

// Bilingual text structure
export interface LocalizedText {
  th?: string
  en?: string
}

// Bilingual content with required Thai (primary market)
export interface LocalizedTextRequired {
  th: string
  en?: string
}

// Rich bilingual content with HTML support
export interface LocalizedRichText {
  th?: {
    plain: string
    html?: string
  }
  en?: {
    plain: string
    html?: string
  }
}

// Array of localized items
export interface LocalizedArray<T> {
  th?: T[]
  en?: T[]
}

// Helper function type for getting localized value
export type LocalizedGetter = (content: LocalizedText, preferredLang?: Language) => string

// Localization metadata
export interface LocalizationMeta {
  defaultLanguage: Language
  availableLanguages: Language[]
  fallbackLanguage: Language
}
