import { NextRequest, NextResponse } from 'next/server'
import { generateBatchEmbeddings, generateEmbedding } from '@/lib/rag/embeddings'
import { insertKnowledgeChunks } from '@/lib/supabase/knowledge'
import type { DbKnowledgeChunkInsert } from '@/lib/supabase/types'
import {
  getKnowledgeCategoryTier,
  isKnowledgeCategory,
  type KnowledgeCategoryKey,
} from '@/lib/constants/knowledge-categories'

/**
 * Check if text contains Thai characters
 */
function containsThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text)
}

/**
 * Translate Thai knowledge content to English for embedding alignment.
 * The RAG query pipeline translates Thai queries → English before embedding,
 * so knowledge must also be embedded as English for high similarity scores.
 */
async function translateForEmbedding(text: string): Promise<string> {
  if (!containsThai(text)) return text

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
  if (!apiKey) return text

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content:
              'Translate the following Thai fashion/styling knowledge text to English. Preserve all specific details: colors, day names, rules, cultural references. Output ONLY the English translation, no explanation.',
          },
          { role: 'user', content: text },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) return text

    const data = await response.json()
    const translation = data.choices?.[0]?.message?.content?.trim()
    if (!translation) return text

    console.log(`[Upload] Translated Thai content for embedding: "${text.slice(0, 50)}..." → "${translation.slice(0, 50)}..."`)
    return translation
  } catch {
    return text
  }
}

interface UploadChunkInput {
  title?: string
  content?: string
}

const MAX_CHUNKS_PER_UPLOAD = 500

function normalizeUploadChunks(chunks: UploadChunkInput[]): Array<{ title: string | null; content: string }> {
  return chunks
    .map((chunk) => {
      const title = typeof chunk.title === 'string' ? chunk.title.trim() : ''
      const content = typeof chunk.content === 'string' ? chunk.content.trim() : ''
      return {
        title: title.length > 0 ? title.slice(0, 180) : null,
        content,
      }
    })
    .filter((chunk) => chunk.content.length > 0)
    .slice(0, MAX_CHUNKS_PER_UPLOAD)
}

async function generateEmbeddingsForUpload(texts: string[]): Promise<{
  embeddingsByIndex: Array<number[] | null>
  errors: string[]
}> {
  const embeddingsByIndex: Array<number[] | null> = new Array(texts.length).fill(null)
  const errors: string[] = []

  try {
    const batch = await generateBatchEmbeddings(texts, false)
    if (batch.embeddings.length === texts.length) {
      batch.embeddings.forEach((embedding, index) => {
        embeddingsByIndex[index] = embedding
      })
      return { embeddingsByIndex, errors }
    }

    errors.push(`Batch embedding partial success (${batch.embeddings.length}/${texts.length})`) 
  } catch (error) {
    errors.push(`Batch embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  for (let index = 0; index < texts.length; index += 1) {
    if (embeddingsByIndex[index]) continue
    try {
      const single = await generateEmbedding(texts[index], false)
      embeddingsByIndex[index] = single.embedding
    } catch (error) {
      errors.push(`Chunk ${index + 1}: ${error instanceof Error ? error.message : 'Embedding failed'}`)
    }
  }

  return { embeddingsByIndex, errors }
}

function buildInsertRows(params: {
  chunks: Array<{ title: string | null; content: string }>
  embeddingsByIndex: Array<number[] | null>
  category: KnowledgeCategoryKey
  sourceFile: string
}): DbKnowledgeChunkInsert[] {
  const now = new Date().toISOString()
  const tier = getKnowledgeCategoryTier(params.category)

  return params.chunks
    .map((chunk, index) => {
      const embedding = params.embeddingsByIndex[index]
      if (!embedding) return null

      return {
        source_file: params.sourceFile,
        category: params.category,
        tier,
        title: chunk.title,
        content: chunk.content,
        embedding: JSON.stringify(embedding),
        is_active: true,
        updated_at: now,
        metadata: {
          uploaded_via: 'admin_ui',
          uploaded_at: now,
          chunk_index: index,
          total_chunks: params.chunks.length,
          source_file: params.sourceFile,
        },
      } satisfies DbKnowledgeChunkInsert
    })
    .filter((row): row is DbKnowledgeChunkInsert => row !== null)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const category = body?.category
    const sourceFile = typeof body?.sourceFile === 'string' && body.sourceFile.trim().length > 0
      ? body.sourceFile.trim()
      : 'admin-upload'

    if (typeof category !== 'string' || !isKnowledgeCategory(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (!Array.isArray(body?.chunks)) {
      return NextResponse.json({ error: 'chunks is required' }, { status: 400 })
    }

    const normalizedChunks = normalizeUploadChunks(body.chunks as UploadChunkInput[])
    if (normalizedChunks.length === 0) {
      return NextResponse.json({ error: 'No valid content chunks found' }, { status: 400 })
    }

    const texts = normalizedChunks.map((chunk) => {
      if (chunk.title) {
        return `${chunk.title}\n${chunk.content}`
      }
      return chunk.content
    })

    // Translate Thai content to English before embedding.
    // The query pipeline translates Thai queries to English, so knowledge must also
    // be embedded as English to avoid cross-language similarity score penalty (~0.25 vs ~0.70).
    const textsForEmbedding = await Promise.all(
      texts.map((text) => translateForEmbedding(text))
    )

    const { embeddingsByIndex, errors } = await generateEmbeddingsForUpload(textsForEmbedding)
    const rows = buildInsertRows({
      chunks: normalizedChunks,
      embeddingsByIndex,
      category,
      sourceFile,
    })

    let inserted = 0
    const insertErrors = [...errors]

    if (rows.length > 0) {
      try {
        inserted = await insertKnowledgeChunks(rows)
      } catch (error) {
        insertErrors.push(`Bulk insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`)

        // Fallback to row-by-row insert to salvage partial successes.
        for (const row of rows) {
          try {
            const count = await insertKnowledgeChunks([row])
            inserted += count
          } catch (innerError) {
            insertErrors.push(`Insert failed for chunk "${row.title ?? 'Untitled'}": ${innerError instanceof Error ? innerError.message : 'Unknown error'}`)
          }
        }
      }
    }

    const failed = normalizedChunks.length - inserted

    return NextResponse.json({
      inserted,
      failed: Math.max(0, failed),
      errors: insertErrors.slice(0, 50),
    })
  } catch (error) {
    console.error('[admin/knowledge/upload] POST failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload knowledge chunks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
