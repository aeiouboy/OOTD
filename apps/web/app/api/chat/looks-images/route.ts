/**
 * Looks Images API Route (v5.0)
 * Generates flat-lay images for per-Look items asynchronously.
 *
 * POST /api/chat/looks-images
 * Body: { looks: ChatLook[] }
 * Returns: { looks: ChatLook[] } with imageBase64, imageUrl, imageStatus
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import type { ChatLook } from '@/lib/types/chat-types'
import type { FlatLayItem } from '@/lib/types/image-types'
import { buildImagePromptFromItems } from '@/lib/services/occasion-flat-lay-service'
import { OpenRouterImageClient } from '@/lib/services/image-generation-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple rate limiting: track last request timestamps per IP
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 5 // 5 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []

  // Remove timestamps outside the window
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent)
    return false // Rate limited
  }

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return true
}

/**
 * Convert ChatLookItem[] to FlatLayItem[] for buildImagePromptFromItems
 */
function lookItemsToFlatLayItems(items: ChatLook['items']): FlatLayItem[] {
  return items.map(item => ({
    name: item.name,
    category: item.category,
    color: item.color || undefined,
    sku: item.sku || undefined,
  }))
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limited. Please wait before generating more images.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { looks } = body as { looks: ChatLook[] }

    if (!looks || !Array.isArray(looks) || looks.length === 0) {
      return NextResponse.json({ error: 'looks[] is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Image generation not configured' }, { status: 500 })
    }

    const imageClient = new OpenRouterImageClient(apiKey)

    console.log(`[Looks Images] Generating flat-lay images for ${looks.length} looks`)

    // Generate flat-lay images for each look in parallel
    const results = await Promise.allSettled(
      looks.map(async (look): Promise<ChatLook> => {
        if (!look.items || look.items.length === 0) {
          return { ...look, imageStatus: 'error' }
        }

        try {
          // Convert ChatLookItems to FlatLayItems
          const flatLayItems = lookItemsToFlatLayItems(look.items)

          // Build the image prompt using existing pipeline
          const prompt = buildImagePromptFromItems(flatLayItems, look.styleName || 'Fashion Look')

          // Generate flat-lay image
          const imageResult = await imageClient.generateRawFlatLay(prompt)

          if (!imageResult.success || !imageResult.imageBase64) {
            console.warn(`[Looks Images] Failed for look ${look.lookNumber}: ${imageResult.error}`)
            return { ...look, imageStatus: 'error' }
          }

          // Save image to public directory
          const timestamp = Date.now()
          const filename = `look-${look.lookNumber}-${timestamp}.png`
          const publicDir = join(process.cwd(), 'public', 'generated-images')
          const filePath = join(publicDir, filename)

          const imageBuffer = Buffer.from(imageResult.imageBase64, 'base64')
          await writeFile(filePath, imageBuffer)

          const imageUrl = `/generated-images/${filename}`

          console.log(`[Looks Images] Generated image for look ${look.lookNumber}: ${imageUrl}`)

          return {
            ...look,
            imageBase64: imageResult.imageBase64,
            imageUrl,
            imageStatus: 'done',
          }
        } catch (error) {
          console.error(`[Looks Images] Error generating look ${look.lookNumber}:`, error)
          return { ...look, imageStatus: 'error' }
        }
      })
    )

    // Collect results
    const processedLooks = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }
      console.error(`[Looks Images] Promise rejected for look ${index + 1}:`, result.reason)
      return { ...looks[index], imageStatus: 'error' as const }
    })

    return NextResponse.json({ looks: processedLooks })
  } catch (error) {
    console.error('[Looks Images] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate look images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
