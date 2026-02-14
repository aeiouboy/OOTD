# Plan: Improve RAG Pipeline Accuracy for Thai Users

## Task Description
Improve the RAG (Retrieval-Augmented Generation) pipeline in the OOTDay chat system to deliver accurate, relevant fashion knowledge when Thai users ask questions. Currently, the 3-tier RAG cascade (Supabase pgvector → Vectra in-memory → keyword fallback) almost always falls through to the keyword fallback because cross-language Thai→English embedding similarity scores (~0.25) are too low for vector search, and the keyword regex patterns miss common Thai lifestyle queries.

This plan addresses 5 concrete improvements:
1. Enable Supabase RAG tier (env config)
2. Expand keyword fallback regex coverage for Thai queries
3. Add query translation (Thai → English) before embedding
4. Implement hybrid search (vector + keyword combined, not cascading)
5. Add Thai/bilingual knowledge documents to improve vector search

## Objective
When complete, the RAG pipeline will:
- Return relevant fashion knowledge for >90% of common Thai queries (currently ~40%)
- Use semantic vector search as the primary retrieval method (currently falls through to keyword)
- Combine both vector and keyword results for richer context
- Support Thai→English query translation to bridge the cross-language embedding gap

## Problem Statement
The RAG pipeline has three critical failures:

1. **Supabase tier is disabled** — 225 knowledge chunks + 1,000 products with embeddings sit unused because `SUPABASE_RAG_ENABLED` is not set in `.env.local`
2. **Cross-language embedding gap** — Thai text embedded by `text-embedding-3-small` produces vectors ~0.25 cosine similarity to English docs (vs ~0.70+ same-language). Even at the lowered 0.25 threshold, most Thai queries return 0 vector results
3. **Keyword fallback has blind spots** — `detectKnowledgeTopics()` in `fashion-summaries.ts:480-531` uses regex that misses common Thai terms: "คาสชวล" (casual), "คาเฟ่" (cafe), "เดท" (date), "สบายๆ" (comfortable), "ไปเที่ยว" (go out)

## Solution Approach
A 3-phase approach that progressively improves retrieval quality:

**Phase 1 (Foundation)**: Enable Supabase + expand keyword regex — immediate improvements with minimal code changes

**Phase 2 (Core)**: Add query translation + hybrid search — the two architectural changes that solve the cross-language gap and the cascade problem

**Phase 3 (Polish)**: Add Thai/bilingual knowledge documents + tests + E2E validation

## Relevant Files
Use these files to complete the task:

- `apps/web/lib/services/ai-chat-service.ts` — Main chat service; contains `retrieveKnowledgeWithRAG()` (lines 225-331), the 3-tier cascade logic, and `useKeywordFallback()` (lines 337-350). **Primary file for hybrid search integration.**
- `apps/web/lib/knowledge/fashion-summaries.ts` — Keyword fallback implementation; `detectKnowledgeTopics()` (lines 480-531) with regex patterns, `formatKnowledgeForPrompt()`, and all hardcoded knowledge constants. **Primary file for keyword expansion.**
- `apps/web/lib/rag/embeddings.ts` — Embedding generation via OpenRouter API (`text-embedding-3-small`); includes caching, retry logic. **Used by query translation for embedding the translated query.**
- `apps/web/lib/rag/supabase-retrieval.ts` — Supabase vector search adapter; `retrieveFromSupabase()` and `searchProductsFromSupabase()`. **Already implemented, just needs to be enabled.**
- `apps/web/lib/rag/config.ts` — RAG configuration; similarity threshold (0.25), topK (5), vector store path. **Reference for threshold values.**
- `apps/web/lib/rag/vector-store.ts` — Vectra local index wrapper; similarity search with filtering. **Used for local vector search.**
- `apps/web/lib/rag/types.ts` — TypeScript types for RAG: `RetrievalResult`, `RetrievalOptions`, `KnowledgeDocument`. **May need new types for hybrid results.**
- `apps/web/lib/supabase/knowledge.ts` — Supabase RPC wrapper for `search_knowledge`. **Already works, needs env var.**
- `apps/web/lib/supabase/products.ts` — Supabase RPC wrapper for `search_products`. **Already works, needs env var.**
- `apps/web/data/vector-store/fashion-knowledge/index.json` — Vectra index file (644KB, 33 English docs). **Target for bilingual doc additions.**

### New Files
- `apps/web/lib/rag/query-translator.ts` — New module: translates Thai queries to English keywords before embedding
- `apps/web/lib/rag/__tests__/query-translator.test.ts` — Tests for query translation
- `apps/web/lib/rag/__tests__/hybrid-search.test.ts` — Tests for hybrid search logic
- `apps/web/lib/knowledge/__tests__/fashion-summaries-keywords.test.ts` — Tests for expanded keyword detection
- `apps/web/scripts/add-thai-knowledge-docs.ts` — Script to add Thai/bilingual knowledge documents to Vectra

## Implementation Phases
### Phase 1: Foundation
- Enable Supabase RAG by adding `SUPABASE_RAG_ENABLED=true` to `.env.local`
- Expand `detectKnowledgeTopics()` regex patterns to cover 20+ missing Thai lifestyle keywords
- Add tests for the expanded keyword detection

### Phase 2: Core Implementation
- Create `query-translator.ts` module that translates Thai queries to English keywords using the existing OpenRouter LLM
- Refactor `retrieveKnowledgeWithRAG()` from cascade (try A, fail → try B, fail → try C) to hybrid (run vector + keyword in parallel, merge results)
- Add tests for query translation and hybrid search merging

### Phase 3: Integration & Polish
- Create a script to add Thai/bilingual versions of the 33 existing English knowledge docs to the Vectra index
- Run the script to populate the bilingual Vectra index
- E2E validation with Playwright: send Thai queries and verify RAG logs show vector matches
- Final test run to ensure all 915+ existing tests still pass

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to to the building, validating, testing, deploying, and other tasks.
  - This is critical. You're job is to act as a high level director of the team, not a builder.
  - You're role is to validate all work is going well and make sure the team is on track to complete the plan.
  - You'll orchestrate this by using the Task* Tools to manage coordination between the team members.
  - Communication is paramount. You'll use the Task* Tools to communicate with the team members and ensure they're on track to complete the plan.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Builder
  - Name: builder-keywords
  - Role: Expand keyword fallback regex and add Thai lifestyle terms to `detectKnowledgeTopics()`
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-translator
  - Role: Create the query translation module (`query-translator.ts`) and integrate it into the RAG pipeline
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-hybrid
  - Role: Refactor `retrieveKnowledgeWithRAG()` from cascade to hybrid search architecture
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-thai-docs
  - Role: Create Thai/bilingual knowledge documents and add them to the Vectra index
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-env
  - Role: Enable Supabase RAG environment variable and verify connectivity
  - Agent Type: builder
  - Resume: false

- Validator
  - Name: validator-final
  - Role: Run all tests, verify RAG pipeline works end-to-end, check no regressions
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Enable Supabase RAG Environment Variable
- **Task ID**: enable-supabase-rag
- **Depends On**: none
- **Assigned To**: builder-env
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 2)
- Add `SUPABASE_RAG_ENABLED=true` to `apps/web/.env.local`
- Verify the env var is read correctly by checking `ai-chat-service.ts:232`
- No code changes needed — just environment configuration

### 2. Expand Keyword Fallback Regex Coverage
- **Task ID**: expand-keyword-regex
- **Depends On**: none
- **Assigned To**: builder-keywords
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 1)
- Edit `apps/web/lib/knowledge/fashion-summaries.ts` function `detectKnowledgeTopics()` (lines 480-531)
- Add these Thai keywords to the occasion regex (line 509):
  - `คาสชวล|casual|คาเฟ่|cafe|เดท|date|เที่ยว|สบาย|ปาร์ตี้|party|สังสรรค์|ดินเนอร์|dinner|brunch|ช้อปปิ้ง|shopping|ออฟฟิศ|office|สัมภาษณ์|interview|ออกเดท|กินข้าว|คอนเสิร์ต|concert|เรียน|มหาลัย|จบการศึกษา|graduation|ปีใหม่|สงกรานต์`
- Add fabric/weather triggers (line 493): `แดด|ฝน|rain|hot|cold|อากาศ|climate`
- Add body type triggers (line 504): `ท้อง|pregnant|plus.?size|ไซส์ใหญ่|curvy`
- Create test file `apps/web/lib/knowledge/__tests__/fashion-summaries-keywords.test.ts`:
  - Test that "ชุดคาสชวล" returns `['occasion', 'thai_culture']`
  - Test that "ไปคาเฟ่" returns `['occasion', 'thai_culture']`
  - Test that "ชุดออกเดท" returns `['occasion', 'thai_culture']`
  - Test that "ชุดสบายๆ ไปเที่ยว" returns `['occasion', 'thai_culture']`
  - Test that "ชุดไปสัมภาษณ์งาน" returns `['occasion', 'thai_culture']`
  - Test that unrelated input returns `['general']`
- Run `pnpm vitest run apps/web/lib/knowledge/__tests__/fashion-summaries-keywords.test.ts`

### 3. Create Query Translation Module
- **Task ID**: create-query-translator
- **Depends On**: none
- **Assigned To**: builder-translator
- **Agent Type**: builder
- **Parallel**: true (can run alongside tasks 1 and 2)
- Create new file `apps/web/lib/rag/query-translator.ts` with:
  - `translateQueryForRAG(thaiMessage: string): Promise<string>` function
  - Uses OpenRouter API (same as `ai-chat-service.ts`) with a fast model (e.g., `google/gemini-2.0-flash-001`)
  - System prompt: `"You are a translation assistant. Translate the following Thai fashion query into English keywords suitable for semantic search. Output ONLY the English keywords, no explanation. Keep brand names, colors, and fashion terms. If the input is already English, return it unchanged."`
  - Timeout: 5 seconds (fail fast — translation is optional enhancement)
  - On any error, return the original message unchanged (graceful degradation)
  - Cache translations in a Map with 1-hour TTL (same pattern as `embeddings.ts`)
  - Export `clearTranslationCache()` for testing
- Create test file `apps/web/lib/rag/__tests__/query-translator.test.ts`:
  - Mock the OpenRouter fetch call
  - Test that Thai input gets translated
  - Test that English input passes through unchanged
  - Test that errors return original message
  - Test caching behavior (second call uses cache)
- Run `pnpm vitest run apps/web/lib/rag/__tests__/query-translator.test.ts`

### 4. Implement Hybrid Search Architecture
- **Task ID**: implement-hybrid-search
- **Depends On**: expand-keyword-regex, create-query-translator
- **Assigned To**: builder-hybrid
- **Agent Type**: builder
- **Parallel**: false (depends on tasks 2 and 3)
- Refactor `retrieveKnowledgeWithRAG()` in `apps/web/lib/services/ai-chat-service.ts` (lines 225-331):
  - **Before** (cascade): Supabase → (fail) → Vectra → (fail) → keyword
  - **After** (hybrid): Run vector search + keyword search in parallel, merge results
- New architecture:
  ```typescript
  async function retrieveKnowledgeWithRAG(message, gender?, occasion?): Promise<RAGRetrievalResult> {
    // Step 1: Translate Thai → English (for vector search only)
    const translatedQuery = await translateQueryForRAG(message);

    // Step 2: Run vector search and keyword search in parallel
    const [vectorResult, keywordResult] = await Promise.allSettled([
      retrieveVectorKnowledge(translatedQuery, gender, occasion),  // Supabase or Vectra
      Promise.resolve(useKeywordFallback(message)),  // Use ORIGINAL Thai message for keyword matching
    ]);

    // Step 3: Merge results — vector docs first, then keyword context appended
    return mergeRAGResults(vectorResult, keywordResult);
  }
  ```
- Extract the current Supabase/Vectra logic into a helper `retrieveVectorKnowledge(query, gender?, occasion?)`:
  - If `SUPABASE_RAG_ENABLED=true`, try Supabase first
  - Falls back to Vectra if Supabase fails or returns 0 results
  - Returns `{ documents, scores, ... }` or empty result
- Create `mergeRAGResults(vectorResult, keywordResult)`:
  - If vector returned docs: combine vector context + keyword context (deduplicate overlapping topics)
  - If vector returned nothing: use keyword context only (same as current behavior)
  - Always set `usedFallback: vectorResult.documents.length === 0`
  - Log: `[AI Chat] RAG Hybrid: ${vectorDocs} vector docs + ${keywordTopics} keyword topics`
- Add `import { translateQueryForRAG } from '../rag/query-translator'` to ai-chat-service.ts
- Create test file `apps/web/lib/rag/__tests__/hybrid-search.test.ts`:
  - Test that hybrid returns both vector + keyword results when vector succeeds
  - Test that hybrid falls back to keyword-only when vector fails
  - Test that translated query is used for vector search, original for keyword
  - Test that `usedFallback` is set correctly
- Update existing tests in `apps/web/lib/services/__tests__/ai-chat-service.test.ts`:
  - Mock `translateQueryForRAG` to return passthrough
  - Ensure existing test assertions still hold with hybrid architecture
- Run `pnpm vitest run` to verify all 915+ tests pass

### 5. Add Thai/Bilingual Knowledge Documents to Vectra
- **Task ID**: add-thai-knowledge-docs
- **Depends On**: implement-hybrid-search
- **Assigned To**: builder-thai-docs
- **Agent Type**: builder
- **Parallel**: false (depends on task 4 being complete so we can test the full pipeline)
- Create a script `apps/web/scripts/add-thai-knowledge-docs.ts` that:
  - Reads the existing knowledge from `fashion-summaries.ts` constants (FASHION_FUNDAMENTALS, THAI_CULTURE_FASHION, BODY_TYPE_STYLING, OCCASION_DRESS_CODES, BRAND_SIZING)
  - For each knowledge category, creates a bilingual document with Thai keywords + English content:
    ```
    Title: "สีมงคล วันเกิด Thai Auspicious Birth Day Colors"
    Content: "สีมงคลประจำวันเกิด วันจันทร์สีเหลือง วันอังคารสีชมพู...
    Monday: Yellow (wealth, abundance). Tuesday: Pink/Red (love, power)..."
    ```
  - Generates embeddings for each document via `generateEmbedding()`
  - Adds them to the Vectra index at `data/vector-store/fashion-knowledge/`
  - Target: 10 bilingual documents covering the main categories:
    1. Color theory + Thai auspicious colors (สีมงคล, ทฤษฎีสี)
    2. Thai occasion dress codes (ชุดไปงาน, ชุดทำงาน, ชุดไปวัด)
    3. Casual/lifestyle outfits (ชุดคาสชวล, ชุดไปคาเฟ่, ชุดเที่ยว)
    4. Body type styling (รูปร่าง, สัดส่วน, เตี้ย, สูง)
    5. Fabric + Thai climate (ผ้า, อากาศร้อน, ฤดูฝน)
    6. Brand sizing guide (ไซส์, แบรนด์, Zara, Uniqlo)
    7. Wedding/funeral dress codes (ชุดไปงานแต่ง, ชุดไปงานศพ)
    8. Work outfits by formality (ชุดทำงาน, ออฟฟิศ, สัมภาษณ์)
    9. Date/party outfits (ชุดออกเดท, ชุดปาร์ตี้, ชุดสังสรรค์)
    10. Petite styling for Thai women (ตัวเล็ก, เตี้ย, ขาสั้น)
- Run the script to populate the index
- Verify by checking `data/vector-store/fashion-knowledge/index.json` has increased document count

### 6. Final Validation
- **Task ID**: validate-all
- **Depends On**: enable-supabase-rag, expand-keyword-regex, create-query-translator, implement-hybrid-search, add-thai-knowledge-docs
- **Assigned To**: validator-final
- **Agent Type**: validator
- **Parallel**: false
- Run `pnpm vitest run` in `apps/web/` — all tests must pass (915+ existing + new tests)
- Read `apps/web/lib/services/ai-chat-service.ts` and verify:
  - `retrieveKnowledgeWithRAG()` uses hybrid architecture (parallel vector + keyword)
  - `translateQueryForRAG()` is called before vector search
  - Both Supabase and Vectra paths still work
- Read `apps/web/lib/knowledge/fashion-summaries.ts` and verify:
  - `detectKnowledgeTopics()` has expanded Thai keyword regex
  - All new keywords are covered: คาสชวล, คาเฟ่, เดท, สบาย, etc.
- Read `apps/web/lib/rag/query-translator.ts` and verify:
  - Graceful degradation on error (returns original message)
  - Cache implementation present
  - Timeout is 5 seconds or less
- Check `apps/web/data/vector-store/fashion-knowledge/index.json` has more than 33 documents (should be ~43 with bilingual additions)
- Verify no hardcoded API keys or secrets in any new files

## Acceptance Criteria
- All 915+ existing tests pass without modification (except where mocks need updating for new function signatures)
- New test files pass:
  - `fashion-summaries-keywords.test.ts` — keyword detection for 10+ Thai queries
  - `query-translator.test.ts` — translation with mocking, caching, error handling
  - `hybrid-search.test.ts` — merge logic, fallback behavior
- `detectKnowledgeTopics("ชุดคาสชวล")` returns `['occasion', 'thai_culture']` (not `['general']`)
- `detectKnowledgeTopics("ไปคาเฟ่")` returns `['occasion', 'thai_culture']` (not `['general']`)
- `retrieveKnowledgeWithRAG()` always returns keyword context (even when vector succeeds)
- `translateQueryForRAG()` returns English keywords for Thai input
- `translateQueryForRAG()` returns original message on error (no throw)
- Vectra index has 40+ documents (up from 33)
- `SUPABASE_RAG_ENABLED=true` is set in `.env.local`

## Validation Commands
Execute these commands to validate the task is complete:

- `cd apps/web && pnpm vitest run` — Run all tests, expect 920+ tests passing across 42+ test files
- `cd apps/web && pnpm vitest run lib/knowledge/__tests__/fashion-summaries-keywords.test.ts` — Keyword expansion tests
- `cd apps/web && pnpm vitest run lib/rag/__tests__/query-translator.test.ts` — Query translator tests
- `cd apps/web && pnpm vitest run lib/rag/__tests__/hybrid-search.test.ts` — Hybrid search tests
- `cd apps/web && pnpm vitest run lib/services/__tests__/ai-chat-service.test.ts` — Existing chat service tests (no regressions)
- `grep SUPABASE_RAG_ENABLED apps/web/.env.local` — Verify env var is set
- `node -e "const idx = require('./apps/web/data/vector-store/fashion-knowledge/index.json'); console.log('Docs:', idx.items?.length || Object.keys(idx).length)"` — Verify Vectra doc count > 33

## Notes
- **No new dependencies needed** — all changes use existing packages (OpenRouter API, Vectra, Supabase client)
- **Cost consideration**: Query translation adds ~1 LLM call per user message (~200ms, ~100 tokens). This is acceptable since the chat already makes a much larger LLM call for response generation
- **Embedding model**: We keep `text-embedding-3-small` for now. Switching to a multilingual model (e.g., `multilingual-e5-large`) is a future improvement that requires re-indexing all 225 Supabase chunks + 1,000 products — out of scope for this plan
- **Graceful degradation**: Every new component (translation, hybrid merge) is designed to fail silently and fall back to existing behavior. No change should make the system worse than it currently is
- **The `builder` hooks run ruff/ty validators** — these are Python validators and won't apply to TypeScript files, so they won't interfere with the work
