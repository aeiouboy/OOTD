import type { KnowledgeCategory } from '@/lib/rag/types'

export interface KnowledgeCategoryOption {
  key: KnowledgeCategory
  label: string
  description: string
  icon: string
  tier: number
}

export const KNOWLEDGE_CATEGORIES: KnowledgeCategoryOption[] = [
  {
    key: 'styling_rules',
    label: 'Styling Rules',
    description: 'Guidelines for fit, silhouettes, and outfit composition',
    icon: '👗',
    tier: 1,
  },
  {
    key: 'color_theory',
    label: 'Color Theory',
    description: 'Color pairing, harmony, and Thai auspicious color context',
    icon: '🎨',
    tier: 1,
  },
  {
    key: 'body_types',
    label: 'Body Types',
    description: 'Recommendations by body shape and proportions',
    icon: '📐',
    tier: 1,
  },
  {
    key: 'occasions',
    label: 'Occasions',
    description: 'Dress code guidance for events and social settings',
    icon: '🎭',
    tier: 2,
  },
  {
    key: 'thai_culture',
    label: 'Thai Culture',
    description: 'Local etiquette and Thai cultural styling context',
    icon: '🇹🇭',
    tier: 2,
  },
  {
    key: 'brand_intelligence',
    label: 'Brand Intelligence',
    description: 'Brand-specific fit, sizing, and Central Group insights',
    icon: '🏬',
    tier: 3,
  },
  {
    key: 'seasonal_trends',
    label: 'Seasonal Trends',
    description: 'Thai climate-aware and seasonal trend knowledge',
    icon: '🌦️',
    tier: 3,
  },
]

/** Legacy categories from seeded data (foundation, advanced, etc.) */
export const LEGACY_KNOWLEDGE_CATEGORIES: KnowledgeCategoryOption[] = [
  {
    key: 'foundation',
    label: 'Foundation',
    description: 'Core styling fundamentals and basics',
    icon: '📚',
    tier: 1,
  },
  {
    key: 'advanced',
    label: 'Advanced',
    description: 'Advanced styling techniques and rules',
    icon: '🎓',
    tier: 2,
  },
  {
    key: 'implementation',
    label: 'Implementation',
    description: 'Implementation-specific knowledge and guides',
    icon: '⚙️',
    tier: 2,
  },
  {
    key: 'special',
    label: 'Special',
    description: 'Special occasion and niche knowledge',
    icon: '✨',
    tier: 3,
  },
]

/** All categories (new + legacy) for filter dropdowns */
export const ALL_KNOWLEDGE_CATEGORIES: KnowledgeCategoryOption[] = [
  ...KNOWLEDGE_CATEGORIES,
  ...LEGACY_KNOWLEDGE_CATEGORIES,
]

export type KnowledgeCategoryKey = (typeof ALL_KNOWLEDGE_CATEGORIES)[number]['key']

export const KNOWLEDGE_CATEGORY_KEYS = ALL_KNOWLEDGE_CATEGORIES.map((category) => category.key)

export function isKnowledgeCategory(value: string): value is KnowledgeCategoryKey {
  return KNOWLEDGE_CATEGORY_KEYS.includes(value as KnowledgeCategoryKey)
}

export function getKnowledgeCategoryTier(category: KnowledgeCategoryKey): number {
  return ALL_KNOWLEDGE_CATEGORIES.find((item) => item.key === category)?.tier ?? 1
}
