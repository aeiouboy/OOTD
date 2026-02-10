# Occasion Suggestion System — Remaining Work & Team Plan

## Context

The Women's Fashion Occasion Suggestion System is ~85% complete. It has a working Supabase DB (1,247 products + 225 knowledge chunks), API routes with JSON fallback, frontend components (chips, cards, grid, ProductModal), and 451 passing unit tests. **But** the app currently runs in JSON fallback mode (`SUPABASE_PRODUCTS_ENABLED=false`), zero embeddings exist for semantic search, clicking products shows no error handling, and component-level tests are missing. This plan covers all remaining work to reach production-ready state.

## Current State

| Layer | Status |
|-------|--------|
| Supabase DB (products 1,247 + knowledge 225) | Seeded, 0 embeddings |
| RLS policies (anon read + service_role write) | Done |
| RPC functions (search_products, search_knowledge) | Done, but search_path security warning |
| Occasion scoring heuristics | Done, 14 tests passing |
| API routes (/api/suggestions, /api/products/search) | Done with JSON fallback |
| Frontend (chips, card, grid, ProductModal) | Wired & E2E tested |
| Feature flag SUPABASE_PRODUCTS_ENABLED | **false** (JSON mode) |
| Error state in UI | **Missing** |
| Component unit tests | **Missing** |
| Semantic search (embeddings → pgvector) | **Not wired** |

---

## Team Structure (4 agents)

| Agent | Role | Scope |
|-------|------|-------|
| **backend** | DB migrations, embeddings, Supabase config | `lib/supabase/`, SQL, seed scripts |
| **frontend** | Error handling, accessibility, UI polish | `components/occasion/`, `lib/hooks/`, `page.tsx` |
| **tester** | Component tests, hook tests, API tests | `__tests__/`, new test files |
| **integrator** | Wire semantic search in API, env docs | `app/api/`, `.env.sample` |

---

## Phase 1 — P0 Critical (No external deps, do first)

### Task 1.1: Fix RPC search_path security [backend, S]
- **Why**: Supabase security advisor flags mutable search_path on both RPC functions
- **Do**: Apply migration via Supabase MCP:
  ```sql
  ALTER FUNCTION search_products SET search_path = 'public';
  ALTER FUNCTION search_knowledge SET search_path = 'public';
  ```
- **Verify**: `get_advisors(security)` no longer warns about search_path

### Task 1.2: Enable Supabase mode [backend, S]
- **Depends on**: 1.1
- **Why**: App currently ignores Supabase and reads JSON files at runtime
- **Do**: Set `SUPABASE_PRODUCTS_ENABLED=true` in `.env.local`
- **Verify**: `curl localhost:3000/api/suggestions?occasion=weekend_social` returns `"source": "supabase"`

### Task 1.3: Add error state to OccasionSuggestionGrid [frontend, S]
- **Why**: Hook returns `error` but grid never displays it — API failures silently show empty state
- **Files**:
  - `components/occasion/OccasionSuggestionGrid.tsx` — Add `error?: string | null` and `onRetry?: () => void` props. Render error UI with `role="alert"` and retry button between loading and empty states
  - `app/page.tsx` line 37 — Destructure `error` and `refetch` from hook, pass to both desktop (line ~187) and mobile (line ~250) grid instances
- **Verify**: Throttle network in DevTools → error state shows with "Try again" button

---

## Phase 2 — P1 Semantic Search (Requires OpenRouter API key)

### Task 2.1: Generate product embeddings [backend, L]
- **Depends on**: 1.2
- **Why**: `products.embedding` column is all NULL — search_products RPC returns nothing
- **Do**: Create `lib/supabase/migrations/004_generate_product_embeddings.ts`
  - Read 1,247 products from Supabase
  - Compose text: `"{product_name} by {brand}. {product_description}. Category: {category}"`
  - Use existing `generateBatchEmbeddings()` from `lib/rag/embeddings.ts` (OpenRouter, text-embedding-3-small, 1536d)
  - Update each row's `embedding` column in batches of 50
- **Verify**: `SELECT count(*) FROM products WHERE embedding IS NOT NULL` = 1247

### Task 2.2: Generate knowledge embeddings [backend, M]
- **Depends on**: 1.2
- **Do**: Create `lib/supabase/migrations/005_generate_knowledge_embeddings.ts` — same approach for 225 chunks using `title + content`
- **Verify**: `SELECT count(*) FROM knowledge_chunks WHERE embedding IS NOT NULL` = 225

### Task 2.3: Create HNSW vector indexes [backend, S]
- **Depends on**: 2.1, 2.2
- **Do**: Apply migration:
  ```sql
  CREATE INDEX idx_products_embedding ON products USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
  CREATE INDEX idx_knowledge_embedding ON knowledge_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
  ```
- **Verify**: `SELECT indexname FROM pg_indexes WHERE indexname LIKE '%embedding%'` returns both

### Task 2.4: Wire semantic search in POST /api/suggestions [integrator, M]
- **Depends on**: 2.3
- **Why**: POST handler (line 169) has comment "When embeddings are ready, use searchProductsBySimilarity" — now they're ready
- **File**: `app/api/suggestions/route.ts` lines 141-188
- **Do**: When `body.query` exists, call `generateEmbedding(query)` then `searchProductsBySimilarity(embedding, occasion, limit)`. Fall through to `getProductsByOccasion` when no query.
- **Verify**: `POST /api/suggestions {"query": "elegant dinner dress", "occasion": "date_night"}` returns semantically relevant results

### Task 2.5: Update .env.sample [integrator, S]
- **Do**: Add `NEXT_PUBLIC_OPENROUTER_API_KEY=your-key` with comment explaining it powers embeddings
- **Verify**: File documents all required env vars

---

## Phase 3 — P2 Quality & Testing (Parallel with Phase 2)

### Task 3.1: OccasionFilterChips unit tests [tester, M]
- **File**: Create `components/occasion/__tests__/OccasionFilterChips.test.tsx`
- **Cases**: Renders 3 chips, aria-pressed toggling, onSelect callback, deselect on re-click, Thai labels

### Task 3.2: OccasionSuggestionCard unit tests [tester, M]
- **File**: Create `components/occasion/__tests__/OccasionSuggestionCard.test.tsx`
- **Cases**: Renders name/brand/price, occasion badge colors, initials fallback, onClick handler, price formatting (฿)

### Task 3.3: OccasionSuggestionGrid unit tests [tester, M]
- **Depends on**: 1.3 (error state)
- **File**: Create `components/occasion/__tests__/OccasionSuggestionGrid.test.tsx`
- **Cases**: Skeleton loading, empty state, card rendering count, error state with retry, responsive grid classes

### Task 3.4: useOccasionSuggestions hook tests [tester, M]
- **File**: Create `lib/hooks/__tests__/useOccasionSuggestions.test.ts`
- **Cases**: Null occasion → empty, loading transitions, error on fetch failure, refetch clears error, URL params correct

### Task 3.5: POST /api/suggestions tests [tester, M]
- **Depends on**: 2.4 (for semantic search tests)
- **File**: Extend `lib/__tests__/suggestions-api.test.ts` with `describe('POST ...')`
- **Cases**: Occasion filter, invalid occasion 400, query triggers semantic search, fallback when Supabase disabled

### Task 3.6: Accessibility improvements [frontend, S]
- **Depends on**: 1.3
- **Files**:
  - `OccasionFilterChips.tsx` — Wrap chips in `role="group" aria-label="Filter by occasion"`
  - `OccasionSuggestionGrid.tsx` — `aria-busy="true"` on loading, `role="status"` on empty state

---

## Dependency Graph

```
Phase 1 (parallel start):
  1.1 RPC security fix ──> 1.2 Enable Supabase ──> 2.1 Product embeddings ──┐
  1.3 Error state UI (parallel)                     2.2 Knowledge embeddings ┼──> 2.3 Indexes ──> 2.4 Semantic search
                                                    2.5 .env.sample (parallel)│

Phase 3 (parallel with Phase 2):
  3.1 Chips tests (independent)
  3.2 Card tests (independent)
  3.3 Grid tests ──> needs 1.3
  3.4 Hook tests (independent)
  3.5 POST tests ──> needs 2.4
  3.6 Accessibility ──> needs 1.3
```

## Parallel Timeline

```
T+0   backend: 1.1 RPC fix       frontend: 1.3 Error UI     tester: 3.1 Chips tests     integrator: 2.5 .env
T+10  backend: 1.2 Enable Supa                               tester: 3.2 Card tests
T+25  backend: 2.1 Product emb.  frontend: 3.6 A11y          tester: 3.4 Hook tests
T+45  backend: 2.2 Knowledge emb.                            tester: 3.3 Grid tests
T+65  backend: 2.3 Vector indexes                            tester: (waiting for 2.4)
T+75  backend: done                                          tester: 3.5 POST tests      integrator: 2.4 Semantic
T+105 ── ALL DONE ──
```

---

## Final Verification Checklist

- [ ] `pnpm build` passes (only pre-existing /api/chat encoder.json failure)
- [ ] `pnpm test --run` — all existing + new tests pass
- [ ] `curl /api/suggestions?occasion=date_night` returns `"source": "supabase"`
- [ ] `POST /api/suggestions {"query": "casual weekend brunch"}` returns semantic results
- [ ] Click occasion chip → products load → click card → ProductModal opens with Buy Online link
- [ ] Error state visible when API fails (throttle network to test)
- [ ] `get_advisors(security)` returns no warnings for search_path
- [ ] `SELECT count(*) FROM products WHERE embedding IS NOT NULL` = 1247
- [ ] `SELECT count(*) FROM knowledge_chunks WHERE embedding IS NOT NULL` = 225

---

## Out of Scope (Future)

- Chat ↔ Occasion bridge (auto-select chip from chat keywords)
- Pagination / infinite scroll (>20 products)
- Move pgvector extension to `extensions` schema
