import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Fetch all nodes
    const { data: nodes, error: nodesError } = await supabase
      .from('knowledge_graph_nodes')
      .select('*')

    if (nodesError) {
      console.error('Error fetching nodes:', nodesError)
      return NextResponse.json(
        { error: 'Failed to fetch nodes', details: nodesError.message },
        { status: 500 }
      )
    }

    const nodeList = nodes ?? []
    const nodeIdSet = new Set(nodeList.map((n: { id: string }) => n.id))

    // Fetch all edges, then filter in JS for ones where both source and target exist
    const { data: allEdges, error: edgesError } = await supabase
      .from('knowledge_graph_edges')
      .select('*')

    if (edgesError) {
      console.error('Error fetching edges:', edgesError)
      return NextResponse.json(
        { error: 'Failed to fetch edges', details: edgesError.message },
        { status: 500 }
      )
    }

    const edges = (allEdges ?? []).filter(
      (e: { source_id: string; target_id: string }) =>
        nodeIdSet.has(e.source_id) && nodeIdSet.has(e.target_id)
    )

    // Collect source_ids from knowledge nodes to fetch chunk content
    const sourceIds = nodeList
      .filter((n: { node_type: string; metadata: Record<string, unknown> }) =>
        n.node_type === 'knowledge' && n.metadata?.source_id
      )
      .map((n: { metadata: Record<string, unknown> }) => n.metadata.source_id as string)

    // Fetch chunk content from knowledge_chunks
    let chunksMap: Record<string, { title: string; content: string; category: string; tier: string; source_file: string }> = {}
    if (sourceIds.length > 0) {
      const { data: chunks, error: chunksError } = await supabase
        .from('knowledge_chunks')
        .select('id, title, content, category, tier, source_file')
        .in('id', sourceIds)

      if (!chunksError && chunks) {
        for (const chunk of chunks) {
          chunksMap[chunk.id] = {
            title: chunk.title,
            content: chunk.content,
            category: chunk.category,
            tier: chunk.tier,
            source_file: chunk.source_file,
          }
        }
      }
    }

    // Enrich knowledge nodes with chunk data
    const enrichedNodes = nodeList.map((node: { node_type: string; metadata: Record<string, unknown> }) => {
      if (node.node_type === 'knowledge' && node.metadata?.source_id) {
        const chunk = chunksMap[node.metadata.source_id as string]
        if (chunk) {
          return {
            ...node,
            chunk: {
              title: chunk.title,
              content: chunk.content,
              category: chunk.category,
              tier: chunk.tier,
              source_file: chunk.source_file,
            },
          }
        }
      }
      return { ...node, chunk: null }
    })

    const edgeList = edges ?? []
    const types: Record<string, number> = {}
    for (const node of nodeList) {
      const t = (node as { node_type: string }).node_type
      types[t] = (types[t] || 0) + 1
    }

    return NextResponse.json(
      {
        nodes: enrichedNodes,
        edges: edgeList,
        stats: {
          nodeCount: nodeList.length,
          edgeCount: edgeList.length,
          types,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('Knowledge graph API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
