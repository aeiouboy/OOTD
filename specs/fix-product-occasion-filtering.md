# Plan: Fix Product-Occasion Filtering in AI Chat

## Task Description
AI chat recommends products that don't match the requested occasion. For example, when a user asks for "work outfits", casual items (t-shirts, shorts, sneakers) appear in recommendations. This plan fixes product-occasion filtering in `ai-chat-service.ts` and strengthens the system prompt v5 occasion constraints.

## Objective
Ensure that when a user requests outfits for a specific occasion (work, wedding, party, etc.), the recommended products are appropriate for that occasion — both in the service-layer filtering pipeline and in the AI's own selection from the catalog.

## Problem Statement

### 7 Root Cause Gaps Identified

**Gap 1: Supabase DB only has 3 occasion columns — missing 6 of 9 occasion types**
- DB columns: `occasion_weekend_social`, `occasion_date_night`, `occasion_everyday_casual`
- Missing: `work`, `wedding`, `party`, `sport`, `travel`, `cafe`, `dinner`
- `db-product-to-enhanced.ts` OCCASION_MAP only maps 3 types → Supabase products are NEVER tagged for work/wedding/party/sport/travel/cafe/dinner
- Location: `apps/web/lib/transformers/db-product-to-enhanced.ts:22-26`

**Gap 2: Semantic search products bypass occasion filtering entirely**
- In `ai-chat-service.ts:657-677`, semantic products from `searchProductsFromSupabase()` are merged AFTER `filterProductsForRequest()` runs
- These products enter the catalog without any occasion or formality validation
- Location: `apps/web/lib/services/ai-chat-service.ts:657-677`

**Gap 3: `searchProductsBySimilarity` still has `match_threshold: 0.7`**
- The threshold fix from 0.7→0.25 missed this specific function
- Location: `apps/web/lib/supabase/products.ts:43`

**Gap 4: `filterProductsForRequest` falls back too eagerly**
- When occasion filter yields 0 results (lines 436-449), it removes the occasion filter entirely
- Should try formality-based filtering as intermediate fallback before giving up
- Location: `apps/web/lib/services/ai-chat-service.ts:436-449`

**Gap 5: System prompt v5 has NO occasion-product matching constraints**
- Tells AI to use catalog products but has zero rules about matching product type/formality to occasion
- AI freely picks casual items for work because they're in the catalog
- Location: `apps/web/lib/prompts/system-prompt-v5.ts`

**Gap 6: `rankProductsByRelevance` is imported but doesn't exist**
- Imported from `../utils/product-filters` but no such function is exported there
- Products are NOT relevance-ranked before AI sees them → occasion-inappropriate items reach the catalog
- Location: `apps/web/lib/services/ai-chat-service.ts:21` (import) + `product-filters.ts` (missing)

**Gap 7: No formality enforcement for detected occasions**
- `filterByOccasion` only checks `product.classification.tags.occasion` (tag-based)
- No formality range enforcement: work (6-9), wedding (7-10), party (5-9), etc.
- Location: `apps/web/lib/utils/product-filters.ts:15-22`

## Solution Approach

Three parallel workstreams after research:
1. **Service-layer fixes** — Fix the filtering pipeline so occasion-inappropriate products never reach the AI catalog
2. **System prompt improvements** — Add explicit occasion-product matching rules so the AI selects appropriately from the catalog
3. **E2E validation** — Verify the fix works end-to-end with real chat interactions

## Relevant Files

### Core Service Layer
- `apps/web/lib/services/ai-chat-service.ts` — Main chat processing pipeline; contains `filterProductsForRequest()`, semantic search merge logic
- `apps/web/lib/utils/product-filters.ts` — All filter functions: `filterByOccasion`, `filterByFormality`, `applyFilters`, missing `rankProductsByRelevance`
- `apps/web/lib/transformers/db-product-to-enhanced.ts` — Transforms DB products to EnhancedProduct; has incomplete OCCASION_MAP
- `apps/web/lib/supabase/products.ts` — Supabase product queries; `searchProductsBySimilarity` with wrong threshold

### System Prompt
- `apps/web/lib/prompts/system-prompt-v5.ts` — V5 system prompt; needs occasion constraints section

### Occasion/Formality Reference
- `apps/web/lib/constants/occasions.ts` — Occasion definitions with formality ranges and avoidItems
- `apps/web/lib/categorization/occasion-mapper.ts` — Maps products to occasions using name/description inference
- `apps/web/lib/types/enums.ts` — OccasionType, FormalityLevel types
- `apps/web/lib/types/product-types.ts` — EnhancedProduct interface with classification.tags.occasion

### Tests
- `apps/web/lib/services/__tests__/ai-chat-service.test.ts` — Existing test suite

## Implementation Phases

### Phase 1: Foundation (Research)
Analyze the current product matching logic to map the complete data flow from user message → occasion detection → product filtering → catalog injection → AI selection. Confirm all 7 gaps and identify any additional issues.

### Phase 2: Core Implementation (Parallel Builders)

#### Stream A: Service-Layer Fixes
1. **Fix transformer OCCASION_MAP** — Add inference for all 9 occasion types using product name/category/formality
2. **Fix semantic search merge** — Apply occasion+formality filter to semantic products AFTER merge
3. **Add formality fallback** — Try formality-range filter before dropping occasion filter entirely
4. **Implement `rankProductsByRelevance`** — Score products by occasion fit + formality match
5. **Fix threshold** — Change `match_threshold` from 0.7 to 0.25 in `supabase/products.ts`

#### Stream B: System Prompt Improvements
1. **Add OCCASION-PRODUCT MATCHING RULES section** to system-prompt-v5.ts
2. **Per-occasion constraints table** with formality ranges and avoid-items
3. **Explicit negative constraints** (e.g., "For work: NEVER recommend shorts, sneakers, casual t-shirts")

### Phase 3: Integration & Validation
Run E2E chat tests: "work outfit", "wedding guest outfit", etc. Verify no casual items appear for formal occasions. Run existing unit test suite.

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to do the building, validating, testing, deploying, and other tasks.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Builder
  - Name: builder-service
  - Role: Fix service-layer product-occasion filtering pipeline (Gaps 1-4, 6-7)
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-prompt
  - Role: Strengthen system prompt v5 with occasion-product matching constraints (Gap 5)
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: validator-e2e
  - Role: Run unit tests and validate the fixes work correctly
  - Agent Type: validator
  - Resume: true

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Research Current Product Matching Logic
- **Task ID**: research-matching-logic
- **Depends On**: none
- **Assigned To**: (team lead — you do this inline before spawning agents)
- **Agent Type**: N/A (already completed in plan phase — findings documented above)
- **Parallel**: false
- Trace data flow: user message → `detectOccasion()` → `filterProductsForRequest()` → semantic merge → `serializeCatalogForV5()` → AI
- Confirm all 7 gaps are valid (confirmed above)
- Document which products in Supabase DB actually have occasion tags vs which don't

### 2. Fix Transformer Occasion Mapping + Add `rankProductsByRelevance`
- **Task ID**: fix-transformer-and-ranking
- **Depends On**: none
- **Assigned To**: builder-service
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 3)
- **File**: `apps/web/lib/transformers/db-product-to-enhanced.ts`
  - Expand `OCCASION_MAP` to infer all 9 occasion types from product name/category/description
  - Use logic from `occasion-mapper.ts:applyInferenceRules()` — detect work (blazer, suit, business, shirt), sport (gym, athletic), wedding (evening, gown, formal dress), etc.
  - Set proper `formalityLevel` instead of hardcoded `5` — use `calculateFormalityLevel()` from `occasion-mapper.ts`
  - Add the `primary_occasion` field from DB to occasion tags when available
- **File**: `apps/web/lib/utils/product-filters.ts`
  - Implement `rankProductsByRelevance(products, occasion, budget)` function
  - Score each product by: (1) occasion tag match, (2) formality range fit, (3) budget proximity
  - Sort descending by score so best-matching products are first in the catalog
  - Add `filterByOccasionWithFormality(products, occasion)` that combines tag match + formality range from `OCCASIONS` constant
- **File**: `apps/web/lib/supabase/products.ts`
  - Change `match_threshold: 0.7` → `match_threshold: 0.25` on line 43

### 3. Fix Semantic Search Merge + Formality Fallback in ai-chat-service
- **Task ID**: fix-merge-and-fallback
- **Depends On**: none
- **Assigned To**: builder-service
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 2, same agent resumes)
- **File**: `apps/web/lib/services/ai-chat-service.ts`
  - **Fix semantic merge (lines 657-677)**: After merging semantic products, re-apply occasion+formality filter to the merged pool. Use the new `filterByOccasionWithFormality()` if occasion is detected. Only keep unfiltered merge if no occasion was detected.
  - **Fix eager fallback (lines 436-449)**: Before removing occasion filter entirely, try formality-based fallback:
    1. First try: filter by occasion tags (current behavior)
    2. If 0 results: try formality range filter using `OCCASIONS[occasion].formalityRange`
    3. If still 0: try filtering out explicitly inappropriate items (e.g., exclude formality ≤ 2 for work)
    4. Last resort: remove occasion filter (current fallback)
  - Add logging: `[AI Chat v5] Occasion filter: {occasion} → {count} products (method: tag|formality|loose|none)`

### 4. Strengthen System Prompt v5 Occasion Constraints
- **Task ID**: fix-system-prompt-occasions
- **Depends On**: none
- **Assigned To**: builder-prompt
- **Agent Type**: builder
- **Parallel**: true (runs alongside tasks 2-3)
- **File**: `apps/web/lib/prompts/system-prompt-v5.ts`
  - Add new section `## OCCASION-PRODUCT MATCHING RULES 🎯` after the PRODUCT GROUNDING RULES section
  - Include a constraints table:
    ```
    | Occasion | Formality | MUST Include | NEVER Include |
    |----------|-----------|-------------|---------------|
    | Work     | 6-9       | blazer, dress shirt, slacks, pencil skirt, loafers/heels | shorts, sneakers, t-shirts, flip-flops, crop tops |
    | Wedding  | 7-10      | formal dress, suit, evening wear | jeans, t-shirts, sneakers, casual wear |
    | Party    | 5-9       | cocktail dress, statement top, heels | activewear, office blazer (too stiff) |
    | Date     | 4-7       | nice dress, blouse, smart casual | gym wear, very formal suits |
    | Dinner   | 5-8       | cocktail dress, silk blouse, dressy pants | shorts, flip-flops, activewear |
    | Cafe     | 2-5       | trendy casual, nice top + jeans | very formal suits, evening gowns |
    | Chill    | 1-4       | t-shirt, jeans, casual dress | formal suits, evening wear |
    | Sport    | 1-2       | activewear, sports bra, running shoes | formal wear, heels, blazers |
    | Travel   | 2-5       | comfortable pants, cotton tops, walking shoes | delicate fabrics, heavy suits |
    ```
  - Add explicit instruction: "When recommending for a specific occasion, ONLY select products from the catalog that match the occasion's formality range and NEVER include items from the NEVER column."
  - Add Thai equivalents for the occasion names in the constraint table
  - Keep the section concise (aim for ~30 lines) — the table format is token-efficient

### 5. Run Tests and Validate Fixes
- **Task ID**: validate-all
- **Depends On**: fix-transformer-and-ranking, fix-merge-and-fallback, fix-system-prompt-occasions
- **Assigned To**: validator-e2e
- **Agent Type**: validator
- **Parallel**: false
- Run `cd apps/web && pnpm vitest run` to ensure no regressions in existing test suite
- Run TypeScript compile check: `cd apps/web && pnpm tsc --noEmit`
- Read the changed files and verify:
  - `db-product-to-enhanced.ts` correctly infers occasion tags for work/wedding/party products
  - `product-filters.ts` exports `rankProductsByRelevance` and `filterByOccasionWithFormality`
  - `ai-chat-service.ts` applies occasion filter to semantic search results
  - `system-prompt-v5.ts` has the occasion constraints table
  - `supabase/products.ts` threshold is 0.25
- Verify occasion-mapper inference logic is reused (not duplicated) where possible

## Acceptance Criteria

1. **Occasion tag coverage**: Products from Supabase DB get proper occasion tags for ALL 9 occasion types (not just 3)
2. **Formality inference**: DB products get formalityLevel based on name/category, not hardcoded 5
3. **Semantic search filtered**: Products from semantic search are filtered by occasion+formality after merge
4. **Graceful fallback**: `filterProductsForRequest` tries formality-based fallback before removing occasion filter
5. **`rankProductsByRelevance` exists**: Exported from product-filters.ts, scores products by occasion+formality fit
6. **Threshold fixed**: `supabase/products.ts` uses `match_threshold: 0.25`
7. **System prompt v5**: Contains occasion-product matching rules with formality ranges and avoid-items
8. **No regressions**: All existing Vitest tests pass
9. **TypeScript clean**: `pnpm tsc --noEmit` passes with no errors

## Validation Commands
Execute these commands to validate the task is complete:

- `cd /Users/tachongrak/Projects/OOTD/apps/web && pnpm vitest run` — Run all unit tests
- `cd /Users/tachongrak/Projects/OOTD/apps/web && pnpm tsc --noEmit` — TypeScript type check

## Notes

- The `OCCASION_MAP` in `db-product-to-enhanced.ts` should reuse inference logic from `occasion-mapper.ts:applyInferenceRules()` to avoid duplication. Import and call it rather than copying the keyword lists.
- The Supabase `search_products` RPC doesn't need modification — the fix is on the client side (threshold + post-filter).
- `rankProductsByRelevance` is currently imported in `ai-chat-service.ts` but doesn't exist in `product-filters.ts`. The import path is already correct — just need to implement and export the function.
- Thai users type Thai keywords (ทำงาน, ออฟฟิศ) which are already handled by `detectOccasion()`. The issue is downstream: products aren't tagged/filtered correctly, and the AI prompt doesn't enforce occasion constraints.
- For task 2+3 assigned to builder-service: these can be done sequentially by the same agent (resume pattern). Task 2 changes the imports that task 3 depends on.
