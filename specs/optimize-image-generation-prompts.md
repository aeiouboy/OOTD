# Plan: Optimize Image Generation System Prompts (Flat-Lay & Try-On)

## Task Description
Overhaul the system prompts for OOTDay's image generation pipeline (flat-lay outfit photos, fitting model generation, and virtual try-on) based on Google's latest Gemini 2.5 Flash Image best practices (GA Feb 2026). The current prompts use keyword lists and negative framing, which are suboptimal for Gemini's architecture.

## Objective
Rewrite all image generation prompts to follow Google's recommended narrative-descriptive style, add `image_config` API support for aspect ratio and resolution control, add safety context framing for content policy compliance, and test the improvements end-to-end. The result should reduce content policy rejections, improve visual quality, and provide consistent aspect ratios.

## Problem Statement
The current prompts have 5 core problems:
1. **Keyword-list style** - Google says "describe the scene, don't just list keywords"
2. **Heavy negative framing** - "DO NOT", "AVOID" sections don't work with Gemini (no negative prompt support). Should use semantic positive reframing.
3. **No `image_config`** - OpenRouter supports `aspect_ratio` and `image_size` but we pass neither, getting inconsistent aspect ratios
4. **No safety context** - Missing "e-commerce product photography" / "fashion editorial" framing causes content policy rejections
5. **No few-shot capability** - Google says prompts without examples are "likely to be less effective"

## Solution Approach
Rewrite prompts using Google's recommended narrative style, add positive framing instead of negative constraints, wire `image_config` into all API calls, add commercial context for safety, and optionally support reference image examples. Extract prompts into a dedicated module for cleaner testing.

## Relevant Files

### Core files to modify
- **`lib/services/image-generation-service.ts`** — Main prompt builder (`buildFlatLayPrompt`, `buildFashionPrompt`) and API request methods (`makeFlatLayRequest`, `makeFittingModelRequest`, `makeDualReferenceRequest`). All need `image_config` support and prompt rewrites.
- **`lib/services/fitting-model-service.ts`** — Contains `FITTING_MODEL_PROMPT_TEMPLATE`, `MYSTERY_MODEL_PROMPT`, `buildTryOnPrompt`, `buildDualReferenceTryOnPrompt`. All need narrative rewrite with safety framing.
- **`lib/services/hybrid-flat-lay-service.ts`** — Contains `BACKGROUND_PROMPTS` map with 7 background style prompts. Need narrative rewrite.
- **`app/api/generate-image/route.ts`** — API route that dispatches to generation methods. May need to pass through `image_config` from request body.
- **`lib/types/image-types.ts`** — Type definitions. Needs `ImageConfig` type and updates to `ImageGenerationRequest`.
- **`data/personas/prompt_gen/looks.md`** — Reference prompt template (1 line). Update.
- **`data/personas/prompt_gen/fitting_model.md`** — Reference prompt template. Update.
- **`data/personas/prompt_gen/complete_looks.md`** — Reference prompt template for try-on. Update.

### New Files
- **`lib/prompts/image-prompts.ts`** — Extract all prompt templates into a single testable module with pure functions. This enables unit testing prompts independently from API clients.
- **`lib/__tests__/image-prompts.test.ts`** — Unit tests for prompt builder functions.

## Implementation Phases

### Phase 1: Foundation — Extract & Type
1. Create `ImageConfig` type in `image-types.ts`
2. Extract all prompt templates from service files into `lib/prompts/image-prompts.ts`
3. Update API route to accept and pass through `image_config`

### Phase 2: Core — Rewrite Prompts
1. Rewrite flat-lay prompt to narrative style with positive framing
2. Rewrite fitting model prompt to narrative style with safety context
3. Rewrite try-on prompts (single and dual reference) to narrative style
4. Rewrite hybrid background prompts to narrative style
5. Rewrite mystery model prompt
6. Update reference files in `data/personas/prompt_gen/`

### Phase 3: Integration — Wire `image_config` & Test
1. Add `image_config` to all `makeFlatLayRequest`, `makeFittingModelRequest`, `makeDualReferenceRequest` calls
2. Write unit tests for prompt builders
3. Run full test suite to verify no regressions
4. E2E test with live Gemini API

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to the building, validating, testing, deploying, and other tasks.

### Team Members

- Builder
  - Name: prompt-engineer
  - Role: Extract prompts into dedicated module, rewrite all image generation prompts using Gemini best practices
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: api-wirer
  - Role: Wire `image_config` support into API types, route, and client methods
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: test-writer
  - Role: Write unit tests for prompt builder functions and integration tests
  - Agent Type: general-purpose
  - Resume: true

- Validator
  - Name: validator
  - Role: Run full test suite, verify all tests pass, check for regressions
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

### 1. Add ImageConfig type and update ImageGenerationRequest
- **Task ID**: add-image-config-type
- **Depends On**: none
- **Assigned To**: api-wirer
- **Agent Type**: general-purpose
- **Parallel**: true
- Add `ImageConfig` interface to `lib/types/image-types.ts`:
  ```typescript
  export interface ImageConfig {
    aspect_ratio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
    image_size?: '1K' | '2K' | '4K';
  }
  ```
- Add `imageConfig?: ImageConfig` to `ImageGenerationRequest`
- Add `imageConfig?: ImageConfig` to `FlatLayRequest` and `HybridFlatLayRequest`

### 2. Extract prompt templates into dedicated module
- **Task ID**: extract-prompts
- **Depends On**: none
- **Assigned To**: prompt-engineer
- **Agent Type**: general-purpose
- **Parallel**: true (parallel with task 1)
- Create `lib/prompts/image-prompts.ts` with pure functions:
  - `buildFlatLayPrompt(items: FlatLayItem[], occasionContext?: string): string`
  - `buildFashionPrompt(description: string, options?: StyleOptions): string`
  - `buildFittingModelPrompt(): string`
  - `buildMysteryModelPrompt(): string`
  - `buildTryOnPrompt(items: OutfitItem[], outfitTitle?: string): string`
  - `buildDualReferenceTryOnPrompt(items: OutfitItem[], outfitTitle?: string): string`
  - `buildBackgroundPrompt(style: BackgroundStyle): string`
  - `cleanCategoryForPrompt(category: string): string`
  - `containsProductNameOrSku(text: string): boolean`
  - `getDefaultImageConfig(generationType: string): ImageConfig`
- Move prompt logic from `image-generation-service.ts`, `fitting-model-service.ts`, and `hybrid-flat-lay-service.ts`
- Keep the old methods as thin wrappers calling the new module (for backward compat during transition)
- Import `ImageConfig` from types

### 3. Rewrite flat-lay prompt
- **Task ID**: rewrite-flat-lay-prompt
- **Depends On**: extract-prompts
- **Assigned To**: prompt-engineer
- **Agent Type**: general-purpose
- **Parallel**: false
- Replace the current bullet-list-style flat-lay prompt with a narrative-descriptive prompt following Google's template:
  ```
  A high-resolution, studio-lit flat-lay photograph showing {itemCount} fashion items arranged as a single coordinated outfit on a pristine white surface. [narrative item descriptions]. The composition uses balanced spacing with each piece clearly visible and proportionally sized. Photographed from directly overhead with soft, diffused three-point lighting that eliminates harsh shadows and preserves accurate colors. Professional e-commerce product photography quality with sharp focus across all items. Clean, minimal styling typical of luxury fashion editorial flat-lay. Square 1:1 format.
  ```
- Key changes from current prompt:
  - Narrative style instead of keyword lists
  - Remove ALL "DO NOT" / "AVOID" sections
  - Replace "NO TEXT OR LABELS" with positive framing: "image without any lettering, labels, or typography"
  - Add "e-commerce product photography" context for safety
  - Add "fashion editorial" framing
  - Keep the product-name-stripping logic (it's good)
  - Default `image_config`: `{ aspect_ratio: "1:1", image_size: "1K" }`

### 4. Rewrite fitting model prompt
- **Task ID**: rewrite-fitting-model-prompt
- **Depends On**: extract-prompts
- **Assigned To**: prompt-engineer
- **Agent Type**: general-purpose
- **Parallel**: true (parallel with task 3)
- Replace `FITTING_MODEL_PROMPT_TEMPLATE` with narrative style:
  ```
  A professional e-commerce fashion catalog photograph of a person matching the reference image exactly. The model stands in a symmetrical forward-facing pose with arms relaxed at sides and feet together, wearing a white spaghetti strap crop top paired with black high-waisted legging shorts, barefoot. The face, skin tone, hair, and body proportions are a precise match to the reference photo with no idealization or modification. The setting is a pure white infinity cove studio backdrop with bright, high-key front-facing softbox lighting that creates a clean, cutout-ready image with no visible floor, ground, or shadows on the backdrop. Professional product photography standard with sharp detail and accurate skin tone reproduction. Portrait 3:4 format.
  ```
- Replace `MYSTERY_MODEL_PROMPT` similarly with narrative framing
- Default `image_config`: `{ aspect_ratio: "3:4", image_size: "1K" }`

### 5. Rewrite try-on prompts
- **Task ID**: rewrite-tryon-prompts
- **Depends On**: extract-prompts
- **Assigned To**: prompt-engineer
- **Agent Type**: general-purpose
- **Parallel**: true (parallel with tasks 3, 4)
- Rewrite `buildTryOnPrompt` (single reference) to narrative style:
  ```
  A professional e-commerce fashion catalog photograph of the person from the reference image wearing {outfit items}. The model's face, skin tone, hair, and body proportions are preserved exactly from the reference. The model stands in a confident forward-facing pose with feet together, filling 90-95% of the vertical frame. The outfit drapes naturally on the body with realistic fabric behavior, accurate colors, and proper layering. Set against a pure white infinity cove studio backdrop with high-key softbox lighting and no visible floor, ground, or backdrop shadows. Clean, cutout-ready product photo quality. Portrait 3:4 format.
  ```
- Rewrite `buildDualReferenceTryOnPrompt` (dual reference) to narrative style:
  ```
  Transfer all fashion items from IMAGE 2 onto the person shown in IMAGE 1, creating a professional e-commerce fashion catalog photograph. The person's face, skin tone, hair, and body proportions from IMAGE 1 are preserved exactly. The model fills 90-95% of the vertical frame in a centered full-body standing pose. Every garment, accessory, and footwear piece visible in IMAGE 2 appears on the model with accurate colors, natural fabric draping, realistic shadows, and proper layering depth. Set against a pure white infinity cove studio backdrop with matching high-key softbox lighting and no visible floor or backdrop shadows. Items being shown: {outfit items}. Portrait 3:4 format.
  ```
- Key changes: Remove emoji checklists, remove "REJECT IF MISSING" sections (negative framing), add safety context, add narrative flow
- Default `image_config`: `{ aspect_ratio: "3:4", image_size: "1K" }`

### 6. Rewrite hybrid background prompts
- **Task ID**: rewrite-background-prompts
- **Depends On**: extract-prompts
- **Assigned To**: prompt-engineer
- **Agent Type**: general-purpose
- **Parallel**: true (parallel with tasks 3-5)
- Rewrite all 7 `BACKGROUND_PROMPTS` entries to narrative style. Example for marble-white:
  ```
  A luxurious white Carrara marble surface photographed from directly overhead for flat-lay fashion product photography. The surface features subtle natural grey veining patterns that evoke quiet-luxury aesthetic. The marble is clean, smooth, and completely empty with no objects, styled as a premium backdrop for high-end fashion items. Soft diffused studio lighting creates even illumination with no harsh shadows. Square 1:1 format.
  ```
- Default `image_config`: `{ aspect_ratio: "1:1", image_size: "1K" }`

### 7. Wire image_config into API request methods
- **Task ID**: wire-image-config
- **Depends On**: add-image-config-type
- **Assigned To**: api-wirer
- **Agent Type**: general-purpose
- **Parallel**: false
- Update `makeFlatLayRequest` in `image-generation-service.ts` to include `image_config` in request body:
  ```typescript
  const requestBody = {
    model: OPENROUTER_CONFIG.model,
    messages: [...],
    modalities: ['text', 'image'],
    max_tokens: 4096,
    image_config: imageConfig || { aspect_ratio: '1:1' },
  };
  ```
- Update `makeFittingModelRequest` with `image_config: { aspect_ratio: '3:4' }`
- Update `makeDualReferenceRequest` with `image_config: { aspect_ratio: '3:4' }`
- Update `makeRequest` (general outfit) with `image_config: { aspect_ratio: '3:4' }`
- Update `app/api/generate-image/route.ts` to destructure and pass through `imageConfig` from request body
- Update `generateHybridFlatLay` in `hybrid-flat-lay-service.ts` to pass `image_config` when calling AI background generation

### 8. Update service files to use extracted prompts
- **Task ID**: update-service-imports
- **Depends On**: rewrite-flat-lay-prompt, rewrite-fitting-model-prompt, rewrite-tryon-prompts, rewrite-background-prompts, wire-image-config
- **Assigned To**: prompt-engineer
- **Agent Type**: general-purpose
- **Parallel**: false
- Update `image-generation-service.ts`:
  - Import `buildFlatLayPrompt`, `buildFashionPrompt`, `cleanCategoryForPrompt`, `containsProductNameOrSku`, `getDefaultImageConfig` from `lib/prompts/image-prompts`
  - Remove the old private methods `buildFlatLayPrompt`, `buildFashionPrompt`, `cleanCategoryForPrompt`, `containsProductNameOrSku` from the class
  - Call the imported module functions instead
- Update `fitting-model-service.ts`:
  - Import `buildFittingModelPrompt`, `buildMysteryModelPrompt`, `buildTryOnPrompt`, `buildDualReferenceTryOnPrompt` from `lib/prompts/image-prompts`
  - Remove the old `FITTING_MODEL_PROMPT_TEMPLATE`, `MYSTERY_MODEL_PROMPT`, `buildTryOnPrompt`, `buildDualReferenceTryOnPrompt`
  - Use imported functions
- Update `hybrid-flat-lay-service.ts`:
  - Import `buildBackgroundPrompt` from `lib/prompts/image-prompts`
  - Remove `BACKGROUND_PROMPTS` constant and local `buildBackgroundPrompt` function
  - Use imported function

### 9. Update reference prompt files
- **Task ID**: update-reference-docs
- **Depends On**: rewrite-flat-lay-prompt, rewrite-fitting-model-prompt, rewrite-tryon-prompts
- **Assigned To**: prompt-engineer
- **Agent Type**: general-purpose
- **Parallel**: true
- Update `data/personas/prompt_gen/looks.md` with new flat-lay narrative template
- Update `data/personas/prompt_gen/fitting_model.md` with new fitting model narrative template
- Update `data/personas/prompt_gen/complete_looks.md` with new dual-reference try-on narrative template

### 10. Write prompt builder unit tests
- **Task ID**: write-prompt-tests
- **Depends On**: update-service-imports
- **Assigned To**: test-writer
- **Agent Type**: general-purpose
- **Parallel**: false
- Create `lib/__tests__/image-prompts.test.ts` with:
  - `buildFlatLayPrompt`: renders item count, uses category+color (not product names), includes "e-commerce" context, no negative framing words ("DO NOT", "AVOID", "NEVER"), includes occasion context when provided
  - `buildFittingModelPrompt`: includes "e-commerce fashion catalog", includes white crop top + black shorts, includes white infinity cove, no negative framing
  - `buildMysteryModelPrompt`: includes Thai woman description, includes standard outfit
  - `buildTryOnPrompt`: includes outfit items, includes face preservation, no emoji checklists
  - `buildDualReferenceTryOnPrompt`: references IMAGE 1 and IMAGE 2, includes outfit transfer instructions
  - `buildBackgroundPrompt`: each of 7 styles produces non-empty prompt, includes "overhead" for flat-lay
  - `cleanCategoryForPrompt`: maps plurals to singular, preserves unknown categories
  - `containsProductNameOrSku`: detects SKU patterns, detects CamelCase brand names
  - `getDefaultImageConfig`: returns 1:1 for flat-lay, 3:4 for fitting-model, 3:4 for try-on

### 11. Run full test suite and validate
- **Task ID**: validate-all
- **Depends On**: write-prompt-tests
- **Assigned To**: validator
- **Agent Type**: validator
- **Parallel**: false
- Run `pnpm test --run` from apps/web/ — all existing + new tests must pass
- Verify no TypeScript compilation errors with `pnpm build` (expect only pre-existing /api/chat encoder.json failure)
- Spot-check that prompt outputs contain no negative framing
- Verify `image_config` is included in request bodies

## Acceptance Criteria
- All prompt templates use narrative-descriptive style (no keyword lists)
- Zero "DO NOT", "AVOID", "NEVER", "REJECT IF" in any prompt template
- All prompts include commercial context ("e-commerce product photography" or "fashion editorial")
- `image_config` with `aspect_ratio` is passed in every API request to OpenRouter
- Flat-lay uses `1:1` aspect ratio, fitting-model and try-on use `3:4`
- All prompts extracted to `lib/prompts/image-prompts.ts` as pure functions
- Unit tests cover every prompt builder function
- All existing tests continue to pass (564+ tests)
- Reference docs in `data/personas/prompt_gen/` updated

## Validation Commands
- `cd /Users/naruechon/OOTD/apps/web && pnpm test --run` - All tests pass
- `cd /Users/naruechon/OOTD/apps/web && pnpm build 2>&1 | grep -v "encoder.json"` - No new build errors
- `grep -r "DO NOT\|AVOID\|NEVER\|REJECT IF" lib/prompts/image-prompts.ts` - Should return empty (no negative framing)
- `grep -r "image_config" lib/services/image-generation-service.ts` - Should find image_config usage
- `grep -r "e-commerce\|fashion editorial\|product photography" lib/prompts/image-prompts.ts` - Should find commercial context

## Notes
- **Research basis**: Google's official Gemini 2.5 Flash Image prompting guide (Feb 2026), OpenRouter multimodal docs, Gemini image generation cookbook, community best practices
- **Key insight**: Gemini uses "semantic positive reframing" instead of negative prompts. This means "DO NOT include text" should become "a clean image without any lettering or typography"
- **`image_config` is OpenRouter-specific**: The Google native API uses `generationConfig.responseModalities` and aspect ratio via prompt text. OpenRouter wraps this in `image_config` parameter.
- **Backward compatibility**: We keep `max_tokens: 4096` alongside `image_config` since older OpenRouter SDK versions may not support it
- **Future enhancement**: Few-shot examples could further improve quality but require storing reference images, which is out of scope for this task
