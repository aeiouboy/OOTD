import type { OccasionType } from './types'

interface ProductInput {
  product_name: string
  brand: string | null
  price: number | string | null
}

interface OccasionScores {
  weekend_social: number
  date_night: number
  everyday_casual: number
  primary_occasion: OccasionType
}

const WEEKEND_SOCIAL_KEYWORDS = [
  'dress', 'blouse', 'crop top', 'skirt', 'knit top',
]

const DATE_NIGHT_KEYWORDS = [
  'midi dress', 'blazer', 'statement',
]

const EVERYDAY_CASUAL_KEYWORDS = [
  'tee', 'polo', 'jeans', 'shorts', 'jogger', 'sneaker', 't-shirt',
]

const WEEKEND_SOCIAL_BRANDS = [
  'journal', 'mardi mercredi', 'cos', '& other stories',
]

const DATE_NIGHT_BRANDS = [
  'simkhai', 'maje', 'sandro', 'asava', 'ted baker', 'massimo dutti',
  'polo ralph lauren',
]

const EVERYDAY_CASUAL_BRANDS = [
  'giordano', 'pacific union', 'lee', "levi's", 'uniqlo',
]

function matchesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((kw) => lower.includes(kw))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function computeOccasionScores(product: ProductInput): OccasionScores {
  const name = product.product_name ?? ''
  const brand = product.brand ?? ''
  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price ?? 0)

  let weekend_social = 0.3
  let date_night = 0.3
  let everyday_casual = 0.3

  // Name-based scoring
  if (matchesAny(name, WEEKEND_SOCIAL_KEYWORDS)) {
    weekend_social += 0.4
  }
  if (matchesAny(name, DATE_NIGHT_KEYWORDS)) {
    date_night += 0.4
  }
  if (matchesAny(name, EVERYDAY_CASUAL_KEYWORDS)) {
    everyday_casual += 0.4
  }

  // Brand-based scoring
  if (matchesAny(brand, WEEKEND_SOCIAL_BRANDS)) {
    weekend_social += 0.2
  }
  if (matchesAny(brand, DATE_NIGHT_BRANDS)) {
    date_night += 0.2
  }
  if (matchesAny(brand, EVERYDAY_CASUAL_BRANDS)) {
    everyday_casual += 0.2
  }

  // Price-based scoring
  if (price >= 1500 && price <= 5000) {
    weekend_social += 0.1
  }
  if (price > 5000) {
    date_night += 0.2
  }
  if (price < 1000) {
    everyday_casual += 0.2
  }
  if (price < 1500) {
    everyday_casual += 0.1
  }

  // Clamp all scores
  weekend_social = clamp(weekend_social, 0, 1)
  date_night = clamp(date_night, 0, 1)
  everyday_casual = clamp(everyday_casual, 0, 1)

  // Determine primary occasion
  const scores = { weekend_social, date_night, everyday_casual } as const
  let primary_occasion: OccasionType = 'everyday_casual'
  let maxScore = -1
  for (const [key, val] of Object.entries(scores)) {
    if (val > maxScore) {
      maxScore = val
      primary_occasion = key as OccasionType
    }
  }

  return { weekend_social, date_night, everyday_casual, primary_occasion }
}
