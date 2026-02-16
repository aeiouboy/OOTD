import { NextRequest, NextResponse } from 'next/server'
import {
  deleteKnowledgeChunks,
  getKnowledgeStats,
  listKnowledge,
} from '@/lib/supabase/knowledge'
import { isKnowledgeCategory } from '@/lib/constants/knowledge-categories'

function parseBooleanParam(value: string | null): boolean | undefined {
  if (!value || value === 'all') return undefined
  if (value === 'true' || value === 'active') return true
  if (value === 'false' || value === 'inactive') return false
  return undefined
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const status = searchParams.get('is_active')
    const search = searchParams.get('search')?.trim() || undefined
    const page = parsePositiveInt(searchParams.get('page'), 1)
    const limit = Math.min(100, parsePositiveInt(searchParams.get('limit'), 25))

    if (category && !isKnowledgeCategory(category)) {
      return NextResponse.json({ error: 'Invalid category filter' }, { status: 400 })
    }

    const [result, stats] = await Promise.all([
      listKnowledge({
        category: category ?? undefined,
        isActive: parseBooleanParam(status),
        search,
        page,
        limit,
      }),
      getKnowledgeStats(),
    ])

    return NextResponse.json({
      chunks: result.chunks,
      total: result.total,
      page: result.page,
      limit: result.limit,
      stats,
    })
  } catch (error) {
    console.error('[admin/knowledge] GET failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to list knowledge chunks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)
      : []

    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids is required' }, { status: 400 })
    }

    const deleted = await deleteKnowledgeChunks(ids)

    return NextResponse.json({
      success: true,
      deleted,
    })
  } catch (error) {
    console.error('[admin/knowledge] DELETE failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete knowledge chunks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
