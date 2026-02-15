import { createClient } from '@supabase/supabase-js'

export interface OccasionConfig {
  occasion_type: string
  name_th: string
  name_en: string
  description_th: string | null
  description_en: string | null
  formality_min: number
  formality_max: number
  keywords: string[]
  key_pieces: string[]
  avoid_items: string[]
  color_suggestions: string[]
}

// In-memory cache (loaded once per server lifecycle)
let occasionCache: OccasionConfig[] | null = null

export async function loadOccasionConfig(): Promise<OccasionConfig[]> {
  if (occasionCache) return occasionCache

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Occasions] No Supabase config, using empty config')
    return []
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('occasion_config')
    .select('*')
    .order('occasion_type')

  if (error) {
    console.error('[Occasions] Failed to load config:', error.message)
    return []
  }

  occasionCache = data || []
  console.log(`[Occasions] Loaded ${occasionCache.length} occasion configs from Supabase`)
  return occasionCache
}

export function getOccasionByType(configs: OccasionConfig[], type: string): OccasionConfig | undefined {
  return configs.find(c => c.occasion_type === type)
}

export function findOccasionByKeyword(configs: OccasionConfig[], keyword: string): OccasionConfig | undefined {
  const lower = keyword.toLowerCase()
  return configs.find(c => c.keywords.some(k => lower.includes(k.toLowerCase())))
}

// Reset cache (for testing)
export function resetOccasionCache(): void {
  occasionCache = null
}
