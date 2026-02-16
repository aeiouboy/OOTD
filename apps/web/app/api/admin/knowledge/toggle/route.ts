import { NextRequest, NextResponse } from 'next/server'
import { toggleKnowledgeChunkActive } from '@/lib/supabase/knowledge'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    const isActive = body?.is_active

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'is_active must be boolean' }, { status: 400 })
    }

    await toggleKnowledgeChunkActive(id, isActive)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/knowledge/toggle] PATCH failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to toggle chunk status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
