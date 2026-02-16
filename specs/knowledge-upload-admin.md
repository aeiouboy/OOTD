# Knowledge Upload Admin — Plan

**Date**: 2026-02-15
**Status**: Draft

---

## Context

ปัจจุบัน knowledge ใน Supabase (`knowledge_chunks`, 252 rows) ถูก seed ผ่าน script เท่านั้น (`apps/web/scripts/seed-knowledge.ts`) ไม่มี UI สำหรับจัดการ ต้องการ:
1. **Upload** ไฟล์ CSV, DOCX, PDF, XLSX → parse → chunk → embed → insert `knowledge_chunks`
2. **แสดง** knowledge ที่มีอยู่ พร้อม category, title, preview
3. **ลบ** / **active-inactive** toggle ได้
4. **Category** ให้เลือก 7 หมวด RAG: `styling_rules`, `color_theory`, `body_types`, `occasions`, `thai_culture`, `brand_intelligence`, `seasonal_trends`

---

## Current State

### `knowledge_chunks` table (Supabase)
```
id          uuid        PK, gen_random_uuid()
source_file text        NOT NULL
category    text        NOT NULL (foundation|advanced|implementation|special)
tier        integer     NOT NULL
title       text        nullable
content     text        NOT NULL
embedding   vector      nullable (1536 dims)
metadata    jsonb       default '{}'
created_at  timestamptz default now()
```

**Missing columns**: `is_active`, `updated_at`

### Embedding Pipeline
- Model: `openai/text-embedding-3-small` via OpenRouter (1536 dims)
- Service: `lib/rag/embeddings.ts` → `generateEmbedding()`, `generateBatchEmbeddings()`
- Supabase client: `lib/supabase/client.ts` → `createServerClient()` (service role key)

### RAG Categories (use these for upload UI)
| Key | Label | Description |
|-----|-------|-------------|
| `styling_rules` | Styling Rules | แนวทางแต่งตัว, color matching, fit |
| `color_theory` | Color Theory | ทฤษฎีสี, Thai auspicious colors |
| `body_types` | Body Types | แต่งตัวตามรูปร่าง |
| `occasions` | Occasions | dress code งานต่างๆ |
| `thai_culture` | Thai Culture | บริบทวัฒนธรรมไทย |
| `brand_intelligence` | Brand Intelligence | แบรนด์ Central Group, sizing |
| `seasonal_trends` | Seasonal Trends | เทรนด์ตามฤดู, Thai climate |

---

## Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │  /admin/knowledge (Hidden Route — No Auth)                  │
 │                                                             │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │  UPLOAD SECTION                                       │  │
 │  │  ┌─────────┐ ┌──────────────┐ ┌───────────────────┐  │  │
 │  │  │ Drop    │ │ Category     │ │ [Upload Button]   │  │  │
 │  │  │ Zone    │ │ Dropdown     │ │                   │  │  │
 │  │  │ CSV/PDF │ │ 7 categories │ │ Shows progress    │  │  │
 │  │  │ DOCX    │ │              │ │ bar while         │  │  │
 │  │  │ XLSX    │ │              │ │ embedding         │  │  │
 │  │  └─────────┘ └──────────────┘ └───────────────────┘  │  │
 │  └───────────────────────────────────────────────────────┘  │
 │                                                             │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │  KNOWLEDGE TABLE                                      │  │
 │  │                                                       │  │
 │  │  Filter: [All Categories ▼] [Active/All ▼] [Search]   │  │
 │  │                                                       │  │
 │  │  ┌─────┬──────────┬───────────┬──────┬──────┬──────┐  │  │
 │  │  │ ✓   │ Title    │ Category  │ File │ Date │ Act  │  │  │
 │  │  ├─────┼──────────┼───────────┼──────┼──────┼──────┤  │  │
 │  │  │ [✓] │ Color..  │ 🎨 Color  │ co.. │ 2/15 │ 🟢   │  │  │
 │  │  │ [✓] │ Thai..   │ 🇹🇭 Thai   │ th.. │ 2/14 │ 🟢   │  │  │
 │  │  │ [ ] │ Old..    │ 📐 Body   │ ol.. │ 1/20 │ 🔴   │  │  │
 │  │  └─────┴──────────┴───────────┴──────┴──────┴──────┘  │  │
 │  │                                                       │  │
 │  │  [Delete Selected]  Showing 252 / 252 chunks          │  │
 │  └───────────────────────────────────────────────────────┘  │
 │                                                             │
 │  Click row → expand preview (content, metadata, embedding)  │
 └─────────────────────────────────────────────────────────────┘
```

---

## Data Flow (Upload)

```
 User drops file.pdf
       │
       ▼
 ┌──────────────────────┐
 │ Browser: Parse file   │
 │ - PDF  → pdf-parse    │
 │ - DOCX → mammoth      │
 │ - XLSX → xlsx (SheetJS)│
 │ - CSV  → papaparse    │
 │                        │
 │ → Extract plain text   │
 └──────────┬─────────────┘
            │
            ▼
 ┌──────────────────────┐
 │ Chunk text            │
 │ Split by paragraphs   │
 │ Target: ~300 tokens   │
 │ Max: 400 tokens       │
 │ Overlap: 50 tokens    │
 └──────────┬─────────────┘
            │
            ▼
 POST /api/admin/knowledge/upload
   { chunks[], category, sourceFile }
            │
            ▼
 ┌──────────────────────────────────┐
 │ API Route (server-side)          │
 │                                  │
 │ 1. generateBatchEmbeddings()     │
 │    (openai/text-embedding-3-small│
 │     via OpenRouter, 1536d)       │
 │                                  │
 │ 2. Supabase insert               │
 │    knowledge_chunks.insert([     │
 │      { source_file, category,    │
 │        tier, title, content,     │
 │        embedding, metadata,      │
 │        is_active: true }         │
 │    ])                            │
 │                                  │
 │ 3. Return { inserted, failed }   │
 └──────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: DB Migration — Add `is_active` + `updated_at`

**Supabase migration** (via MCP):
```sql
ALTER TABLE knowledge_chunks
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update search_knowledge RPC to filter by is_active
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding text,
  category_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.25,
  match_count int DEFAULT 10
) RETURNS TABLE (
  id uuid,
  source_file text,
  category text,
  title text,
  content text,
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.source_file,
    kc.category,
    kc.title,
    kc.content,
    1 - (kc.embedding <=> query_embedding::vector) AS similarity
  FROM knowledge_chunks kc
  WHERE kc.is_active = true
    AND (category_filter IS NULL OR kc.category = category_filter)
    AND 1 - (kc.embedding <=> query_embedding::vector) > match_threshold
  ORDER BY kc.embedding <=> query_embedding::vector
  LIMIT match_count;
END;
$$;
```

**Files to update**:
- `apps/web/lib/supabase/types.ts` — Add `is_active` + `updated_at` to `knowledge_chunks` Row/Insert/Update types

### Step 2: API Routes

Create 4 API routes under `apps/web/app/api/admin/knowledge/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `route.ts` | GET | List all knowledge chunks (with filters) |
| `route.ts` | DELETE | Bulk delete by IDs |
| `upload/route.ts` | POST | Upload + parse + embed + insert |
| `toggle/route.ts` | PATCH | Toggle is_active by ID |

**`GET /api/admin/knowledge`**
- Query params: `category`, `is_active`, `search`, `page`, `limit`
- Returns: `{ chunks: [...], total: number }`

**`POST /api/admin/knowledge/upload`**
- Body: `{ chunks: { title, content }[], category, sourceFile }`
- Server-side: batch embed → Supabase insert
- Returns: `{ inserted: number, failed: number, errors: string[] }`

**`PATCH /api/admin/knowledge/toggle`**
- Body: `{ id: string, is_active: boolean }`
- Returns: `{ success: boolean }`

**`DELETE /api/admin/knowledge`**
- Body: `{ ids: string[] }`
- Returns: `{ deleted: number }`

### Step 3: File Parsing Utilities

**New file**: `apps/web/lib/utils/file-parsers.ts`

Client-side parsing (no server deps):
- **CSV**: `papaparse` — each row becomes a chunk (column `content` or first column)
- **XLSX**: `xlsx` (SheetJS) — each row → chunk, or each sheet → chunk
- **PDF**: `pdfjs-dist` (Mozilla) — extract text per page, split into chunks
- **DOCX**: `mammoth` — convert to plain text, split into chunks

**New file**: `apps/web/lib/utils/text-chunker.ts`

Reuse chunking config from `lib/rag/config.ts`:
- Target: 300 tokens, max: 400, overlap: 50
- Split by paragraph → merge small paragraphs → split large ones
- Return `{ title: string, content: string }[]`

### Step 4: Admin UI Page

**New file**: `apps/web/app/admin/knowledge/page.tsx`

Components:
1. **FileUploadZone** — Drag & drop area, accepts `.csv, .pdf, .docx, .xlsx`
2. **CategorySelector** — Dropdown with 7 RAG categories
3. **UploadProgress** — Progress bar showing embedding/insert status
4. **KnowledgeTable** — Paginated table with:
   - Category filter dropdown
   - Active/All toggle
   - Search by title/content
   - Checkbox selection for bulk delete
   - Toggle switch per row for active/inactive
   - Click to expand → show content preview + metadata
5. **Stats bar** — Total chunks, chunks per category

### Step 5: Update TypeScript types + retrieval

**Files to modify**:
- `lib/supabase/types.ts` — Add `is_active`, `updated_at` columns
- `lib/supabase/knowledge.ts` — Add `listKnowledge()`, `toggleActive()`, `deleteChunks()`, `insertChunks()` functions
- `lib/rag/supabase-retrieval.ts` — No change needed (RPC handles is_active filter)

---

## New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `papaparse` | CSV parsing | ~47KB (already installed) |
| `xlsx` | Excel parsing | ~350KB (or use `read-excel-file` ~25KB for read-only) |
| `pdfjs-dist` | PDF text extraction | ~800KB |
| `mammoth` | DOCX → text | ~120KB |

All are client-side for file parsing (no server dependency). Embedding happens server-side via existing `generateBatchEmbeddings()`.

**Alternative**: Use lightweight `read-excel-file` (~25KB) instead of full `xlsx` (~350KB) since we only need read, not write.

---

## File Summary

| # | File | Action | Purpose |
|---|------|--------|---------|
| 1 | Supabase migration | CREATE | Add `is_active`, `updated_at`, update RPC |
| 2 | `lib/supabase/types.ts` | EDIT | Add new columns to types |
| 3 | `lib/supabase/knowledge.ts` | EDIT | Add CRUD functions |
| 4 | `lib/utils/file-parsers.ts` | CREATE | CSV/PDF/DOCX/XLSX parsing |
| 5 | `lib/utils/text-chunker.ts` | CREATE | Text → chunks splitter |
| 6 | `app/api/admin/knowledge/route.ts` | CREATE | GET (list) + DELETE |
| 7 | `app/api/admin/knowledge/upload/route.ts` | CREATE | POST (upload+embed) |
| 8 | `app/api/admin/knowledge/toggle/route.ts` | CREATE | PATCH (active toggle) |
| 9 | `app/admin/knowledge/page.tsx` | CREATE | Admin UI page |
| 10 | `package.json` | EDIT | Add parsing deps |

---

## Verification

1. Navigate to `/admin/knowledge` → page loads with current 252 chunks
2. Filter by category → shows correct subset
3. Upload a test CSV with 3 rows → see 3 new chunks appear with embeddings
4. Upload a test PDF → see chunks extracted and embedded
5. Toggle a chunk inactive → disappears from RAG search results
6. Toggle back active → appears again in RAG search
7. Select multiple → bulk delete → removed from DB
8. Run `pnpm vitest run` → all existing tests still pass
9. Test chat to confirm inactive chunks don't appear in recommendations
