# Feature: Knowledge Graph Visualization

## Reference
- https://meteo-tau-eight.vercel.app/
- Interactive knowledge base visualization for RAG system
- Dark theme, Supabase-backed nodes & edges

## Overview
Create an interactive knowledge graph page at `/knowledge-graph` that visualizes the OOTD fashion RAG knowledge base. Shows relationships between categories, products, occasions, brands, styles, and knowledge chunks.

## Architecture

### Data Model (Supabase)

**Table: `knowledge_graph_nodes`**
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
label text NOT NULL,
node_type text NOT NULL, -- 'category', 'occasion', 'brand', 'style', 'product', 'knowledge'
metadata jsonb DEFAULT '{}',
color text, -- hex color for rendering
size numeric DEFAULT 1.0, -- relative size
x numeric, -- optional position
y numeric,
created_at timestamptz DEFAULT now()
```

**Table: `knowledge_graph_edges`**
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
source_id uuid REFERENCES knowledge_graph_nodes(id) ON DELETE CASCADE,
target_id uuid REFERENCES knowledge_graph_nodes(id) ON DELETE CASCADE,
relationship text NOT NULL, -- 'belongs_to', 'matches', 'similar_to', 'recommended_for'
weight numeric DEFAULT 1.0,
metadata jsonb DEFAULT '{}',
created_at timestamptz DEFAULT now()
```

### Node Types & Colors
| Type | Color | Description |
|------|-------|-------------|
| category | #6366f1 (indigo) | Knowledge categories (styling_rules, color_theory, etc.) |
| occasion | #f59e0b (amber) | Occasions (wedding, work, casual, etc.) |
| brand | #10b981 (emerald) | Brands (Zara, Uniqlo, Jaspal, etc.) |
| style | #ec4899 (pink) | Style attributes (minimalist, streetwear, etc.) |
| product | #3b82f6 (blue) | Sample products |
| knowledge | #8b5cf6 (violet) | Knowledge chunks |

### Edge Relationship Types
- `belongs_to` - Product belongs to category/brand
- `matches` - Style matches occasion
- `similar_to` - Similar products/styles
- `recommended_for` - Knowledge recommends for occasion
- `contains` - Category contains knowledge

## Implementation Tasks

### Task 1: Supabase Migration (DDL)
- Create `knowledge_graph_nodes` table
- Create `knowledge_graph_edges` table
- Add indexes on node_type and relationship columns
- Create RPC function `get_knowledge_graph()` returning all nodes + edges

### Task 2: Seed Data Script
- Generate nodes from existing data:
  - 7 knowledge categories → category nodes
  - Occasions from products → occasion nodes
  - Brands from products → brand nodes
  - Top products → product nodes
  - Knowledge chunks → knowledge nodes
- Generate edges from relationships:
  - Products → brand edges
  - Products → occasion edges
  - Knowledge → category edges
  - Occasion → style recommendations

### Task 3: Install Dependencies
- `react-force-graph-2d` - 2D force-directed graph (lightweight, performant)
- No other deps needed (already have Supabase, Tailwind, shadcn)

### Task 4: API Route
- `apps/web/app/api/knowledge-graph/route.ts`
- GET endpoint returning `{ nodes, edges }` from Supabase
- Optional query params: `?type=category&depth=2`

### Task 5: Knowledge Graph Page & Components
- `apps/web/app/knowledge-graph/page.tsx` - Main page
- `apps/web/components/knowledge-graph/KnowledgeGraph.tsx` - Graph canvas
- `apps/web/components/knowledge-graph/GraphControls.tsx` - Zoom, filter, search
- `apps/web/components/knowledge-graph/NodeDetail.tsx` - Node detail panel

### UI Spec
- **Background**: Dark (#0a0a1a)
- **Graph**: Force-directed 2D with colored nodes by type
- **Controls**:
  - Filter chips by node type (toggle visibility)
  - Search bar to find/highlight nodes
  - Zoom in/out buttons
  - Reset view button
- **Interaction**:
  - Click node → show detail panel (sidebar or tooltip)
  - Hover → highlight connected edges
  - Drag to pan, scroll to zoom
- **Header**: "Knowledge Graph" title + back link to home
- **Stats bar**: Node count, edge count, category breakdown
- **Legend**: Color-coded node type legend

## Tech Stack
- Next.js 14 (App Router)
- react-force-graph-2d
- Supabase (data storage)
- Tailwind CSS v4 + shadcn/ui components
- TypeScript
