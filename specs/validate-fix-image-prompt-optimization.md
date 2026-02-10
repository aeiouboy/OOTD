# Plan: Validate & Fix Image Prompt Optimization

## Task Description
Comprehensive validation of the image generation prompt optimization work, identifying issues and defining fixes. The optimization extracted all prompts to a centralized module (`lib/prompts/image-prompts.ts`), rewrote them in narrative-descriptive style per Gemini 2.5 Flash Image best practices, added `image_config` (aspect ratio) to all API requests, and added 97 unit tests.

## Objective
Verify the prompt optimization is production-ready: no orphaned code, no dead exports, `imageConfig` properly wired end-to-end, and all tests pass. Fix any issues found.

## Problem Statement
During validation audit, several issues were identified:

### Issue 1: `imageConfig` Destructured But Never Forwarded (LOW)
- **File**: `app/api/generate-image/route.ts:304,424`
- **What**: `imageConfig` is destructured from the request body (line 304) and logged (line 424), but it is **never passed** to any service method (`generateFlatLayImage`, `generateOutfitImage`, `generateFittingModelImage`, `generateTryOnWithDualReference`).
- **Impact**: LOW — The 4 `make*Request` methods inside `image-generation-service.ts` already hardcode `image_config: { aspect_ratio: '1:1' }` or `{ aspect_ratio: '3:4' }` directly in their request bodies. So the correct ratios are always sent to OpenRouter. The `imageConfig` field on the request types (`FlatLayRequest`, `ImageGenerationRequest`, `HybridFlatLayRequest`) exists but is effectively unused dead code.
- **Fix options**:
  - **Option A (recommended)**: Remove `imageConfig` from all 3 request types and the API route destructuring — it's dead code. The service already uses `getDefaultImageConfig` internally via hardcoded values.
  - **Option B**: Wire `imageConfig` through to override the hardcoded values. This would allow callers to customize aspect ratio, but no caller currently uses it.

### Issue 2: `buildBackgroundPrompt` Re-export Is Dead Code (TRIVIAL)
- **File**: `lib/services/hybrid-flat-lay-service.ts:66-67`
- **What**: `export { buildBackgroundPrompt }` re-exports from the prompt module "so existing consumers are unaffected." But grep shows **no consumer** imports `buildBackgroundPrompt` from `hybrid-flat-lay-service`. The only import path is from `@/lib/prompts/image-prompts` (the canonical source).
- **Impact**: TRIVIAL — Dead export, no functional impact.
- **Fix**: Remove lines 66-67 (the re-export and comment).

### Issue 3: `getDefaultImageConfig` Is Exported But Never Called (TRIVIAL)
- **File**: `lib/prompts/image-prompts.ts:267-279`
- **What**: `getDefaultImageConfig()` is tested (7 unit tests pass) but **never called** from any production code. The service methods hardcode their aspect ratios directly.
- **Impact**: TRIVIAL — Well-tested utility function ready for future use. Not harmful.
- **Fix options**:
  - **Option A (recommended)**: Keep as-is. It's tested and will be useful when `imageConfig` override is eventually wired.
  - **Option B**: Remove to reduce dead code (would also remove 7 passing tests).

### Issue 4: Negative Framing in `ai-chat-service.ts` (OUT OF SCOPE)
- **File**: `lib/services/ai-chat-service.ts:450`
- **What**: The "FORCE RECOMMENDATION MODE" injection uses `DO NOT` / `DO:` framing, but this is for **text-based LLM instructions** (Claude chat), NOT for Gemini image prompts. The NEGATIVE_FRAMING invariant only applies to image generation prompts.
- **Impact**: NONE — correctly scoped. This is unrelated to image prompt optimization.

## Validation Results Summary

| Check | Result | Notes |
|-------|--------|-------|
| All 10 prompt functions centralized in `image-prompts.ts` | PASS | Clean single-file module |
| Zero negative framing in image prompts | PASS | Tested by regex invariant across all builders |
| Commercial safety context in all prompts | PASS | "e-commerce" / "fashion catalog" / "product photography" present in all 14 prompt strings |
| `image_config` sent to OpenRouter in all 4 `make*Request` methods | PASS | Hardcoded correctly: 1:1 for flat-lay, 3:4 for portraits |
| All old prompt constants removed from service files | PASS | No `FITTING_MODEL_PROMPT`, `MYSTERY_MODEL_PROMPT`, or `BACKGROUND_PROMPTS` remain |
| All service files import from `lib/prompts/image-prompts` | PASS | 3 services correctly import their needed functions |
| No orphaned private prompt-building methods in service classes | PASS | All moved to prompt module |
| 97 prompt unit tests pass | PASS | Verified via `pnpm test --run` |
| 661 total tests pass (29 files) | PASS | No regressions |
| E2E flat-lay generation succeeds | PASS | Verified via Playwright on localhost:3000 |
| E2E try-on generation succeeds | PASS | Zero content policy rejections |
| Reference docs updated | PASS | `looks.md`, `fitting_model.md`, `complete_looks.md` updated |
| `imageConfig` forwarded to services | FAIL | Destructured/logged but never passed through |
| `buildBackgroundPrompt` re-export has consumers | FAIL | Dead re-export, no consumers |

## Relevant Files

### Files to Modify
- `app/api/generate-image/route.ts` — Remove unused `imageConfig` destructuring and log reference
- `lib/services/hybrid-flat-lay-service.ts` — Remove dead `buildBackgroundPrompt` re-export (lines 66-67)
- `lib/types/image-types.ts` — Remove `imageConfig` field from `FlatLayRequest` (line 75), `ImageGenerationRequest` (line 136), `HybridFlatLayRequest` (line 270)

### Files That Are Clean (No Changes Needed)
- `lib/prompts/image-prompts.ts` — All 10 functions correct, zero negative framing
- `lib/__tests__/image-prompts.test.ts` — 97 tests all passing
- `lib/services/image-generation-service.ts` — Imports correct, hardcoded `image_config` correct
- `lib/services/fitting-model-service.ts` — All 4 prompt functions correctly imported and used
- `data/personas/prompt_gen/*.md` — Reference docs updated

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to do the building, validating, testing, deploying, and other tasks.

### Team Members

- Builder
  - Name: cleaner
  - Role: Remove dead code (imageConfig fields, re-export, unused destructuring)
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: validator
  - Role: Run full test suite and verify no regressions after cleanup
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: e2e-tester
  - Role: End-to-end test image generation flows (flat-lay + try-on) via Playwright MCP on localhost:3000
  - Agent Type: general-purpose
  - Resume: false

## Step by Step Tasks

### 1. Remove Dead `imageConfig` Code
- **Task ID**: remove-dead-imageconfig
- **Depends On**: none
- **Assigned To**: cleaner
- **Agent Type**: general-purpose
- **Parallel**: false
- Remove `imageConfig?: ImageConfig` from `FlatLayRequest` interface in `lib/types/image-types.ts` (line 75, and its JSDoc comment on line 74)
- Remove `imageConfig?: ImageConfig` from `ImageGenerationRequest` interface in `lib/types/image-types.ts` (lines 134-136, and its JSDoc comment on lines 133-134)
- Remove `imageConfig?: ImageConfig` from `HybridFlatLayRequest` interface in `lib/types/image-types.ts` (lines 269-270, and its JSDoc comment on lines 268-269)
- In `app/api/generate-image/route.ts` line 304: Remove `imageConfig` from the destructuring
- In `app/api/generate-image/route.ts` line 424: Remove `imageConfig: imageConfig || 'default',` from the log object
- Remove `ImageConfig` from the import statement on line 17 of `route.ts` if no longer used
- Verify that `ImageConfig` type is still exported from `image-types.ts` (it's used by `image-prompts.ts`)

### 2. Remove Dead `buildBackgroundPrompt` Re-export
- **Task ID**: remove-dead-reexport
- **Depends On**: none
- **Assigned To**: cleaner
- **Agent Type**: general-purpose
- **Parallel**: true (can be done alongside task 1, same agent)
- In `lib/services/hybrid-flat-lay-service.ts`: Remove lines 66-67:
  ```typescript
  // Re-export buildBackgroundPrompt so existing consumers are unaffected
  export { buildBackgroundPrompt };
  ```

### 3. Run Full Test Suite
- **Task ID**: validate-tests
- **Depends On**: remove-dead-imageconfig, remove-dead-reexport
- **Assigned To**: validator
- **Agent Type**: general-purpose
- **Parallel**: false
- Run `pnpm test --run` from `apps/web/` and verify all tests pass
- Run `npx tsc --noEmit` to verify no TypeScript compilation errors
- Confirm test count is still 661 (or 661 minus any removed tests)

### 4. Final Validation
- **Task ID**: validate-all
- **Depends On**: validate-tests
- **Assigned To**: validator
- **Agent Type**: general-purpose
- **Parallel**: false
- Verify `ImageConfig` interface still exists in `image-types.ts` (used by prompt module)
- Verify no file imports `imageConfig` from the removed locations
- Verify `buildBackgroundPrompt` is only imported from `lib/prompts/image-prompts`
- Run `grep -r "imageConfig" apps/web/lib/types/ apps/web/app/api/` to confirm cleanup is complete

### 5. E2E Test Image Generation via Playwright MCP
- **Task ID**: e2e-playwright
- **Depends On**: validate-all
- **Assigned To**: e2e-tester
- **Agent Type**: general-purpose
- **Parallel**: false
- **Prerequisite**: Dev server must be running on `localhost:3000` (start with `pnpm dev` if not already running)
- Use Playwright MCP browser tools (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_take_screenshot`, `browser_wait_for`) to test the full image generation pipeline:

#### Flow A: Flat-lay Image Generation
1. Navigate to `http://localhost:3000`
2. Take a snapshot to identify the chat interface
3. Click a quick-reply button (e.g., "ทำงาน" / Work occasion) to trigger outfit recommendations
4. Wait for the AI response with outfit cards (look for outfit card elements, ~15-30s)
5. Take a screenshot to verify outfit cards rendered with flat-lay images
6. Save screenshot to `test-result/e2e-post-fix-flat-lay.png`
7. Verify: At least 1 outfit card visible with a generated image (not a placeholder/skeleton)

#### Flow B: Try-on Image Generation
1. From the outfit cards, click "ดูลุค" (View Look) on one of the outfit cards
2. Wait for the outfit detail panel to appear
3. Take a screenshot of the detail view showing flat-lay + product list
4. Save screenshot to `test-result/e2e-post-fix-outfit-detail.png`
5. Click "ลองใส่" (Try On) button to trigger try-on generation
6. Wait for the try-on image to generate (~20-30s, use `browser_wait_for` with appropriate timeout)
7. Take a screenshot of the try-on result
8. Save screenshot to `test-result/e2e-post-fix-try-on.png`
9. Verify: Try-on image rendered (not an error state)

#### Flow C: Verify No Content Policy Rejections
1. Check browser console messages for any "content policy" or "safety" errors using `browser_console_messages`
2. Verify zero content policy rejections in console output
3. Check network requests using `browser_network_requests` for any 4xx/5xx responses from `/api/generate-image`

#### Reporting
- Report PASS/FAIL for each flow (A, B, C)
- If any flow fails, capture the error screenshot and console logs
- All screenshots saved to `test-result/` directory

## Acceptance Criteria
- All `imageConfig` fields removed from the 3 request interfaces
- API route no longer destructures or logs `imageConfig`
- Dead `buildBackgroundPrompt` re-export removed from `hybrid-flat-lay-service.ts`
- `ImageConfig` interface itself preserved (used by prompt module)
- All existing tests pass (661 tests, 29 files)
- No TypeScript compilation errors
- `getDefaultImageConfig` function preserved (tested, ready for future use)
- E2E Flow A: Flat-lay images generate successfully on localhost:3000
- E2E Flow B: Try-on images generate successfully (no content policy rejections)
- E2E Flow C: Zero 4xx/5xx errors from `/api/generate-image` in network log
- Screenshots saved to `test-result/e2e-post-fix-*.png`

## Validation Commands
Execute these commands to validate the task is complete:

- `cd /Users/naruechon/OOTD/apps/web && pnpm test --run` — All tests pass
- `cd /Users/naruechon/OOTD/apps/web && npx tsc --noEmit` — No type errors
- `grep -rn "imageConfig" apps/web/lib/types/image-types.ts` — Only `ImageConfig` interface definition remains, no fields on request types
- `grep -rn "imageConfig" apps/web/app/api/generate-image/route.ts` — No matches
- `grep -n "Re-export\|export { buildBackgroundPrompt" apps/web/lib/services/hybrid-flat-lay-service.ts` — No matches
- E2E via Playwright MCP: Navigate localhost:3000 → trigger outfit → verify flat-lay → trigger try-on → verify image → check console for zero content policy errors

## Notes
- The `getDefaultImageConfig` function and its 7 tests are intentionally preserved. When a future feature needs caller-customizable aspect ratios, this function provides the sensible defaults to build upon.
- The `ImageConfig` type itself is still referenced by `image-prompts.ts` as the return type of `getDefaultImageConfig`, so it must not be removed from `image-types.ts`.
- Total scope is very small: ~10 lines removed across 3 files. Risk is minimal.
