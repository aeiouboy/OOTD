# Plan: Integrate Supabase Products & Knowledge Base into Chat System

## Task Description
Replace the chat system's in-memory Vectra vector store and JSON-file product loading with Supabase-backed pgvector semantic search. The chat AI currently loads products from `data/products/product_master_v1.json` via `loadProductsServerSide()` and uses a local `Vectra` index for RAG knowledge retrieval. Both must switch to the Supabase `search_products` and `search_knowledge` RPC functions that already have 1,247 products and 225 knowledge chunks with HNSW vector indexes.

## Objective
When this plan is complete:
1. The chat API (`/api/chat`) will load products from Supabase instead of JSON files
2. RAG knowledge retrieval will use Supabase `search_knowledge` pgvector RPC instead of Vectra in-memory store
3. Product recommendations in chat will use `search_products` pgvector RPC for semantic matching
4. The `SUPABASE_RAG_ENABLED` feature flag will gate the new behavior with graceful fallback to the existing in-memory pipeline
5. The chat will recommend real products with real prices, URLs, and purchase links from the Supabase DB

## Problem Statement
The chat system has a complete RAG pipeline (`lib/rag/`) that uses **Vectra** — a local file-based vector store — for knowledge retrieval. This approach has several limitations:
- **Cold start**: The Vectra index must be initialized on every server restart, embedding all documents on the fly
- **No persistence**: Embeddings are recomputed each time instead of leveraging pre-computed pgvector embeddings in Supabase
- **Product disconnect**: Products come from JSON files (`loadProductsServerSide()`) while the occasion system already uses Supabase. This creates inconsistency — the occasion chips show Supabase products but chat recommends JSON-loaded ones
- **No semantic product search**: Chat filters products via heuristic attribute matching, not vector similarity. A query like "elegant dinner dress" gets keyword-filtered rather than semantically matched

Meanwhile, Supabase already has:
- 1,247 products with `embedding` column (vector(1536)) and HNSW index
- 225 knowledge chunks with `embedding` column (vector(1536)) and HNSW index
- `search_products(query_embedding, occasion_filter, match_threshold, match_count)` RPC
- `search_knowledge(query_embedding, category_filter, match_threshold, match_count)` RPC

## Solution Approach

### Strategy: Adapter Pattern with Feature Flag
Rather than rewriting the RAG pipeline, we create a **Supabase RAG adapter** that implements the same interface as the existing `retrieve()` function but delegates to Supabase RPCs. The `SUPABASE_RAG_ENABLED` feature flag switches between the two backends.

### Architecture Flow (After Integration)

```
User message → /api/chat
  │
  ├── STEP A: Load products
  │   ├── SUPABASE_PRODUCTS_ENABLED=true  → loadProductsFromSupabase()  [existing]
  │   └── SUPABASE_PRODUCTS_ENABLED=false → loadProductsServerSide()    [existing fallback]
  │
  ├── STEP B: Semantic product search (NEW)
  │   ├── SUPABASE_RAG_ENABLED=true → generateEmbedding(query) → searchProductsBySimilarity()
  │   └── SUPABASE_RAG_ENABLED=false → heuristic filterProductsForRequest()  [existing]
  │
  ├── STEP C: Knowledge retrieval
  │   ├── SUPABASE_RAG_ENABLED=true → generateEmbedding(query) → searchKnowledge() → formatForPrompt
  │   └── SUPABASE_RAG_ENABLED=false → Vectra retrieve() → buildFashionContext  [existing]
  │
  └── STEP D: Build prompt → callOpenRouter() → return response
```

### Key Design Decisions
1. **Feature-flagged**: `SUPABASE_RAG_ENABLED=true` activates Supabase RAG; `false` keeps the existing Vectra pipeline intact
2. **Same interface**: The new Supabase retrieval returns `RetrievalResult` (same type as Vectra) so `buildFashionContext()` works unchanged
3. **Product type bridge**: Supabase returns `DbProduct` (flat schema), while chat expects `EnhancedProduct` (nested). A transformer bridges the gap.
4. **Dual product path**: Products for filtering come from Supabase (flat), but the prompt serializer already handles both formats via `serializeForAI()`.
5. **Graceful fallback**: Each step catches errors and falls back to the existing implementation.

## Relevant Files

### Core files to modify:

- **`apps/web/app/api/chat/route.ts`** (159 lines) — Chat API entry point. Line 38 calls `loadProductsServerSide()` which must switch to Supabase. Must also pass semantic search results into `processAIChatRequest`.
- **`apps/web/lib/services/ai-chat-service.ts`** (~800 lines) — The orchestrator. `retrieveKnowledgeWithRAG()` (line 215) calls `getRAGService().retrieve()` (Vectra). Must add Supabase path. `filterProductsForRequest()` (line 310) uses heuristic filters. Must add semantic search alternative.
- **`apps/web/lib/server-product-loader.ts`** (207 lines) — Already has `loadProductsFromSupabase()` (line 181). Needs enhancement to return `EnhancedProduct[]` format for chat compatibility.
- **`apps/web/lib/rag/index.ts`** (403 lines) — RAG module public API. `getRAGService()` returns singleton. Must support Supabase backend selection.

### Reference files (read-only):

- **`apps/web/lib/supabase/products.ts`** (61 lines) — `searchProductsBySimilarity()` RPC wrapper already exists
- **`apps/web/lib/supabase/knowledge.ts`** (28 lines) — `searchKnowledge()` RPC wrapper already exists
- **`apps/web/lib/rag/retrieval.ts`** (465 lines) — Current Vectra-based retrieval pipeline
- **`apps/web/lib/rag/prompt-builder.ts`** — `buildFashionContext()` — consumes `RetrievalResult`, works with both backends
- **`apps/web/lib/rag/config.ts`** — RAG_CONFIG with embedding model, thresholds, topK
- **`apps/web/lib/rag/embeddings.ts`** — `generateEmbedding()` — shared by both backends
- **`apps/web/lib/rag/vector-store.ts`** (540 lines) — Vectra implementation (keep as fallback)
- **`apps/web/lib/rag/types.ts`** — Type definitions for `RetrievalResult`, `KnowledgeDocument`, etc.
- **`apps/web/lib/supabase/types.ts`** — `DbProduct` type (flat Supabase row)
- **`apps/web/lib/types/product-types.ts`** — `EnhancedProduct` type (nested structure)

### New Files

- **`apps/web/lib/rag/supabase-retrieval.ts`** — New Supabase-backed retrieval adapter implementing the same `retrieve()` interface
- **`apps/web/lib/transformers/db-product-to-enhanced.ts`** — Transformer: `DbProduct` → `EnhancedProduct` for chat compatibility
- **`apps/web/lib/rag/__tests__/supabase-retrieval.test.ts`** — Unit tests for the new adapter
- **`apps/web/lib/transformers/__tests__/db-product-to-enhanced.test.ts`** — Transformer tests
- **`apps/web/lib/__tests__/chat-supabase-integration.test.ts`** — Integration tests for the chat + Supabase flow

## Implementation Phases

### Phase 1: Foundation (DbProduct → EnhancedProduct transformer)
The chat system expects `EnhancedProduct` (nested: `classification.gender`, `style.colors`, `centralIntegration.productUrl`, etc.) while Supabase returns `DbProduct` (flat: `brand`, `price`, `primary_occasion`, `image_url`, `link`). A transformer bridges this gap so the rest of the chat pipeline (filtering, serialization, prompt building) works unchanged.

### Phase 2: Core Implementation (Supabase RAG adapter + chat wiring)
Create `supabase-retrieval.ts` that calls `searchKnowledge()` and maps results to `RetrievalResult`. Modify `ai-chat-service.ts` to use this adapter when `SUPABASE_RAG_ENABLED=true`. Wire semantic product search into the chat flow.

### Phase 3: Integration & Polish (API route, tests, feature flag)
Update `/api/chat` to load products from Supabase. Add comprehensive tests. Enable `SUPABASE_RAG_ENABLED=true` in `.env.local`. Validate end-to-end.

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to do the building, validating, testing, deploying, and other tasks.

### Team Members

- Builder
  - Name: builder-transformer
  - Role: Create the DbProduct → EnhancedProduct transformer and Supabase retrieval adapter
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-chat-wiring
  - Role: Wire Supabase products and RAG into ai-chat-service.ts and /api/chat route
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-tester
  - Role: Write unit tests for transformer, Supabase retrieval adapter, and chat integration
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: validator
  - Role: Run all tests, verify E2E, check feature flag behavior
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Create DbProduct → EnhancedProduct Transformer
- **Task ID**: create-db-product-transformer
- **Depends On**: none
- **Assigned To**: builder-transformer
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside task 2)
- Create `apps/web/lib/transformers/db-product-to-enhanced.ts`
- Map flat `DbProduct` fields to nested `EnhancedProduct` structure:
  - `brand` → `brand` (direct)
  - `product_name` → `name.th` and `name.en`
  - `price` → `pricing.current`, `original_price` → `pricing.original`
  - `primary_occasion` + occasion score columns → `classification.tags.occasion[]`
  - `category` → `classification.category.category` + `classification.gender`
  - `image_url` → `images.primary`
  - `link` → `centralIntegration.productUrl`
  - `product_description` → `description`
  - `availability` → `availability.status`
  - `sku` → `sku`, generate `id` from SKU
- Export `transformDbProductToEnhanced(dbProduct: DbProduct): EnhancedProduct`
- Export `transformDbProductsToEnhanced(dbProducts: DbProduct[]): EnhancedProduct[]`
- Handle missing/null fields gracefully with sensible defaults
- Keep the transformer pure (no API calls, no side effects)

### 2. Create Supabase RAG Retrieval Adapter
- **Task ID**: create-supabase-retrieval
- **Depends On**: none
- **Assigned To**: builder-transformer
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside task 1)
- Create `apps/web/lib/rag/supabase-retrieval.ts`
- Implement `retrieveFromSupabase(query, options?): Promise<RetrievalResult>` that:
  1. Calls `generateEmbedding(query)` from `lib/rag/embeddings.ts` (shared with Vectra path)
  2. Calls `searchKnowledge(embeddingResult.embedding, categoryFilter, limit)` from `lib/supabase/knowledge.ts`
  3. Maps Supabase knowledge chunk rows to `KnowledgeDocument[]` (same type Vectra returns):
     - `id` → `id`
     - `title` → `title`
     - `content` → `content`
     - `category` → `category`
     - `tier` → `metadata.priority`
     - `similarity` → score
  4. Returns `RetrievalResult` with `documents`, `scores`, `totalFound`, `metadata`
- Implement `searchProductsFromSupabase(query, occasionFilter?, limit?): Promise<DbProduct[]>` that:
  1. Calls `generateEmbedding(query)`
  2. Calls `searchProductsBySimilarity(embedding, occasionFilter, limit)`
  3. Returns the matched products
- Both functions must handle errors and return empty results (not throw)

### 3. Wire Supabase RAG into ai-chat-service.ts
- **Task ID**: wire-rag-into-chat-service
- **Depends On**: create-supabase-retrieval
- **Assigned To**: builder-chat-wiring
- **Agent Type**: general-purpose
- **Parallel**: false
- Modify `retrieveKnowledgeWithRAG()` (line 215 of `ai-chat-service.ts`):
  - At the top, check `process.env.SUPABASE_RAG_ENABLED === 'true'`
  - If true: call `retrieveFromSupabase(message, { filters: { gender, occasion }, topK: 5, threshold: 0.7 })`
  - Pass the result to existing `buildFashionContext()` (it accepts `RetrievalResult`)
  - If false or on error: fall through to existing `getRAGService().retrieve()` Vectra path
  - Log which backend was used: `[AI Chat] RAG: Using Supabase pgvector` vs `[AI Chat] RAG: Using Vectra in-memory`
- Add semantic product search as an enhancement to `filterProductsForRequest()`:
  - When `SUPABASE_RAG_ENABLED=true` AND the message contains a meaningful query:
    1. Call `searchProductsFromSupabase(message, occasion, 30)` for semantic results
    2. Transform results via `transformDbProductsToEnhanced()`
    3. Merge with heuristic-filtered products (semantic results first, deduped by SKU)
  - When false: use existing heuristic filtering unchanged
- Import the new functions at the top of the file

### 4. Update /api/chat Route to Use Supabase Products
- **Task ID**: update-chat-api-route
- **Depends On**: create-db-product-transformer
- **Assigned To**: builder-chat-wiring
- **Agent Type**: general-purpose
- **Parallel**: false
- Modify `apps/web/app/api/chat/route.ts` line 38:
  - When `SUPABASE_PRODUCTS_ENABLED=true`:
    1. Call `loadProductsFromSupabase(undefined, 200)` to get `DbProduct[]`
    2. If result is not null, transform via `transformDbProductsToEnhanced()`
    3. Pass to `processAIChatRequest(request, enhancedProducts)`
  - When false or null result: fallback to existing `loadProductsServerSide()`
  - Import `transformDbProductsToEnhanced` from the new transformer
  - Import `loadProductsFromSupabase` from `server-product-loader`
- Log which product source was used: `[Chat API] Using Supabase products (N items)` vs `[Chat API] Using JSON products (N items)`

### 5. Enable SUPABASE_RAG_ENABLED Feature Flag
- **Task ID**: enable-rag-flag
- **Depends On**: wire-rag-into-chat-service, update-chat-api-route
- **Assigned To**: builder-chat-wiring
- **Agent Type**: general-purpose
- **Parallel**: false
- Set `SUPABASE_RAG_ENABLED=true` in `.env.local`
- Update `.env.sample` to document the flag: `SUPABASE_RAG_ENABLED=true  # true = Supabase pgvector RAG; false = Vectra in-memory`
- Verify the flag is read correctly in both `ai-chat-service.ts` and the chat route

### 6. Write Transformer Unit Tests
- **Task ID**: test-transformer
- **Depends On**: create-db-product-transformer
- **Assigned To**: builder-tester
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside tasks 3-5)
- Create `apps/web/lib/transformers/__tests__/db-product-to-enhanced.test.ts`
- Test cases:
  - Transforms complete DbProduct with all fields populated
  - Handles null/missing optional fields (original_price, product_description)
  - Maps occasion scores correctly to classification tags
  - Price formatting (number → number, no currency conversion)
  - Gender inference from category ('women_clothing' → 'women')
  - Batch transform returns correct count
  - SKU-based ID generation is deterministic
  - Image URL passthrough
  - Product link → centralIntegration.productUrl mapping

### 7. Write Supabase Retrieval Adapter Tests
- **Task ID**: test-supabase-retrieval
- **Depends On**: create-supabase-retrieval
- **Assigned To**: builder-tester
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside tasks 3-5)
- Create `apps/web/lib/rag/__tests__/supabase-retrieval.test.ts`
- Mock `searchKnowledge` and `searchProductsBySimilarity` from `lib/supabase/knowledge.ts` and `lib/supabase/products.ts`
- Mock `generateEmbedding` from `lib/rag/embeddings.ts`
- Test cases:
  - Returns correctly shaped RetrievalResult from knowledge search
  - Maps Supabase knowledge rows to KnowledgeDocument
  - Passes category filter from options
  - Passes occasion filter for product search
  - Returns empty result (not throw) when Supabase RPC errors
  - Returns empty result when no matches found
  - Scores array matches documents array length
  - Metadata includes retrievalTimeMs and query

### 8. Write Chat Integration Tests
- **Task ID**: test-chat-integration
- **Depends On**: wire-rag-into-chat-service, update-chat-api-route
- **Assigned To**: builder-tester
- **Agent Type**: general-purpose
- **Parallel**: false
- Create `apps/web/lib/__tests__/chat-supabase-integration.test.ts`
- Test cases:
  - `retrieveKnowledgeWithRAG` uses Supabase when SUPABASE_RAG_ENABLED=true
  - `retrieveKnowledgeWithRAG` falls back to Vectra when SUPABASE_RAG_ENABLED=false
  - `retrieveKnowledgeWithRAG` falls back to Vectra on Supabase error
  - Chat API route loads products from Supabase when SUPABASE_PRODUCTS_ENABLED=true
  - Chat API route falls back to JSON when Supabase returns null
  - Semantic product search merges with heuristic results
  - Duplicate products are deduplicated by SKU in merged results

### 9. Final Validation
- **Task ID**: validate-all
- **Depends On**: test-transformer, test-supabase-retrieval, test-chat-integration, enable-rag-flag
- **Assigned To**: validator
- **Agent Type**: validator
- **Parallel**: false
- Run `pnpm test --run` from `apps/web/` — all tests must pass
- Verify SUPABASE_RAG_ENABLED and SUPABASE_PRODUCTS_ENABLED are both true in .env.local
- Check that `ai-chat-service.ts` has Supabase RAG path with fallback
- Check that `route.ts` (chat) has Supabase product loading with fallback
- Verify transformer correctly maps at least these fields: brand, price, image_url, link, primary_occasion
- Verify new files exist: `supabase-retrieval.ts`, `db-product-to-enhanced.ts`, and all test files
- Count total test files and ensure no regressions

## Acceptance Criteria

1. **Feature flag gating**: Setting `SUPABASE_RAG_ENABLED=false` preserves 100% existing behavior (Vectra + JSON)
2. **Supabase RAG**: When enabled, chat knowledge retrieval calls `searchKnowledge` RPC and returns `RetrievalResult`
3. **Supabase products**: When `SUPABASE_PRODUCTS_ENABLED=true`, chat loads products from Supabase, not JSON files
4. **Semantic product search**: Chat queries trigger `searchProductsBySimilarity` when RAG is enabled
5. **Type compatibility**: `DbProduct` from Supabase is correctly transformed to `EnhancedProduct` for the chat pipeline
6. **Graceful fallback**: Any Supabase failure falls back to existing Vectra/JSON path with logged warning
7. **All tests pass**: `pnpm test --run` passes with all existing + new tests
8. **No regressions**: Existing 484+ tests continue to pass

## Validation Commands

Execute these commands to validate the task is complete:

- `cd /Users/naruechon/OOTD/apps/web && pnpm test --run` — All unit tests pass
- `grep -r 'SUPABASE_RAG_ENABLED' apps/web/lib/` — Flag is checked in ai-chat-service.ts
- `grep -r 'retrieveFromSupabase' apps/web/lib/` — New adapter is imported and used
- `grep -r 'transformDbProductToEnhanced' apps/web/lib/` — Transformer is imported and used
- `ls apps/web/lib/rag/supabase-retrieval.ts` — New adapter file exists
- `ls apps/web/lib/transformers/db-product-to-enhanced.ts` — New transformer file exists
- `ls apps/web/lib/rag/__tests__/supabase-retrieval.test.ts` — Adapter tests exist
- `ls apps/web/lib/transformers/__tests__/db-product-to-enhanced.test.ts` — Transformer tests exist

## Notes

- The `generateEmbedding()` function from `lib/rag/embeddings.ts` is shared between Vectra and Supabase paths. It uses OpenRouter API with `text-embedding-3-small` (1536 dimensions) and has built-in caching. No changes needed.
- The `buildFashionContext()` prompt builder accepts `RetrievalResult` and works with any backend that produces this type. No changes needed.
- Product embeddings (1,247) and knowledge embeddings (225) should already be populated in Supabase via seed scripts 004 and 005. If not, run: `npx tsx apps/web/lib/supabase/seeds/004_generate_product_embeddings.ts` and `005_generate_knowledge_embeddings.ts` before testing semantic search.
- The chat uses `google/gemini-3-flash-preview` via OpenRouter (not Claude). The `OPENROUTER_API_KEY` env var (without `NEXT_PUBLIC_` prefix) is required for the chat to use AI mode.
- The existing `loadProductsFromSupabase()` in `server-product-loader.ts` returns `DbProduct[] | null`. The `null` return signals "Supabase unavailable, use JSON fallback". This pattern is preserved.
