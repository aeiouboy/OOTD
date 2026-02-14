/**
 * Query Translation Module for RAG Pipeline
 *
 * Translates Thai fashion queries to English keywords before embedding,
 * bridging the cross-language gap in text-embedding-3-small.
 */

interface TranslationCacheEntry {
  translation: string
  timestamp: number
}

const translationCache = new Map<string, TranslationCacheEntry>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

/**
 * Clear the translation cache (for testing)
 */
export function clearTranslationCache(): void {
  translationCache.clear()
}

/**
 * Check if text contains Thai characters
 */
function containsThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text)
}

/**
 * Translate a Thai fashion query to English keywords for semantic search.
 *
 * - If the input is already English, returns it unchanged
 * - On any error, returns the original message (graceful degradation)
 * - Results are cached for 1 hour
 * - Timeout: 5 seconds
 */
export async function translateQueryForRAG(message: string): Promise<string> {
  // Skip translation if no Thai characters
  if (!containsThai(message)) {
    return message
  }

  // Check cache
  const cached = translationCache.get(message)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Query Translator] Cache hit')
    return cached.translation
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    if (!apiKey) {
      console.warn('[Query Translator] No API key found, skipping translation')
      return message
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: 'You are a translation assistant. Translate the following Thai fashion query into English keywords suitable for semantic search. Output ONLY the English keywords, no explanation. Keep brand names, colors, and fashion terms. If the input is already English, return it unchanged.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 100,
        temperature: 0.1,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`[Query Translator] API error: ${response.status}`)
      return message
    }

    const data = await response.json()
    const translation = data.choices?.[0]?.message?.content?.trim()

    if (!translation) {
      console.warn('[Query Translator] Empty translation response')
      return message
    }

    // Cache the result
    translationCache.set(message, {
      translation,
      timestamp: Date.now(),
    })

    console.log(`[Query Translator] "${message}" → "${translation}"`)
    return translation
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[Query Translator] Translation timed out (5s)')
    } else {
      console.warn('[Query Translator] Translation failed:', error instanceof Error ? error.message : error)
    }
    return message
  }
}
