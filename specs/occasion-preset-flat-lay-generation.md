# Plan: Occasion Preset Flat-Lay Generation

## Task Description
Implement an AI-powered flat-lay image generation pipeline triggered when users select an occasion preset. The system uses a multi-step system prompt template that analyzes user context (profile + occasion), retrieves styling knowledge from the Supabase knowledge base (pgvector), curates minimum 3 without maximum outfit items from the women's clothing catalog, and generates a professional flat-lay image prompt with strict specifications (white background, overhead angle, no text, 1:1 square).

Three occasion presets are supported: **"Weekend & Social"**, **"Date Night"**, and **"Everyday Casual"**.

## Objective
When a user taps an occasion preset button, the system will:
1. Read the user's profile (name, age, style preferences, reference image status)
2. Send a structured system prompt to an LLM that orchestrates knowledge retrieval + product curation
3. Receive back a curated outfit minimum 3 without maximum with a flat-lay image generation prompt IMPORTANT No Duplicate outfit items 
4. Pipe that prompt into the existing `OpenRouterImageClient.generateFlatLayImage` pipeline
5. Display the generated flat-lay image in the UI

## Problem Statement
Currently, occasion presets (`QuickPresets.tsx`) only filter products by occasion tag. There is no pipeline that takes a user's profile + selected occasion and automatically curates an outfit then generates a visual flat-lay image. The existing `buildFlatLayPrompt()` in `image-prompts.ts` builds prompts from already-selected items — it cannot select or curate items. This gap means users must rely on the chat interface to receive visual outfit inspiration, which is slower and requires conversational interaction.

## Solution Approach
Introduce an **occasion-based flat-lay orchestration service** that:
- Encodes the user's system prompt template (provided in the requirements) as a structured prompt builder
- Sends the assembled prompt to OpenRouter (Gemini) to get AI-curated outfit items + a flat-lay image prompt
- Parses the AI response to extract the image prompt
- Passes the image prompt to the existing `OpenRouterImageClient` for image generation
- Exposes the full pipeline through a new React hook (`useOccasionFlatLay`) and a new API route (`/api/occasion-flat-lay`)

This follows the existing architectural pattern: **prompt builder → API route → OpenRouterImageClient → image response**.

## Relevant Files
Use these files to complete the task:

**Existing files to modify:**
- `apps/web/lib/prompts/image-prompts.ts` — Add new `buildOccasionFlatLaySystemPrompt()` function
- `apps/web/lib/types/image-types.ts` — Add `OccasionPreset` type, `OccasionFlatLayRequest`, `OccasionFlatLayResponse` interfaces
- `apps/web/lib/types/enums.ts` — Reference for `OccasionType` enum
- `apps/web/components/navigation/QuickPresets.tsx` — Update presets to the 3 new occasions, add flat-lay trigger callback
- `apps/web/lib/types/user-profile-types.ts` — Reference for `UserProfile`, `AgeRange`, `StylePreference`
- `apps/web/lib/constants/occasions.ts` — Reference for `OccasionDefinition` and style guidelines per occasion

**Existing files to reference (read-only):**
- `apps/web/lib/services/image-generation-service.ts` — `OpenRouterImageClient` (reuse for image generation)
- `apps/web/lib/services/hybrid-flat-lay-service.ts` — Architecture pattern for fallback chains
- `apps/web/lib/hooks/useFlatLayGeneration.ts` — Pattern for flat-lay hook (cache, queue, generation)
- `apps/web/lib/hooks/useUserProfile.ts` — Pattern for accessing user profile
- `apps/web/lib/rag/embeddings.ts` — `generateEmbedding()` for knowledge retrieval
- `apps/web/app/api/generate-image/route.ts` — Existing API route pattern for image generation
- `apps/web/lib/openrouter-client.ts` — OpenRouter chat completion client

### New Files
- `apps/web/lib/services/occasion-flat-lay-service.ts` — Core orchestration service (AI curation → image prompt → generation)
- `apps/web/lib/hooks/useOccasionFlatLay.ts` — React hook exposing the full pipeline to UI
- `apps/web/app/api/occasion-flat-lay/route.ts` — Server-side API route for orchestration
- `apps/web/lib/prompts/occasion-flat-lay-prompt.ts` — System prompt template builder (separate file for clarity)
- `apps/web/lib/services/__tests__/occasion-flat-lay-service.test.ts` — Unit tests for orchestration service
- `apps/web/lib/prompts/__tests__/occasion-flat-lay-prompt.test.ts` — Unit tests for prompt builder
- `apps/web/lib/hooks/__tests__/useOccasionFlatLay.test.ts` — Hook integration tests

## Implementation Phases

### Phase 1: Foundation
- Define `OccasionPreset` type (`'weekend-social' | 'date-night' | 'everyday-casual'`) in `image-types.ts`
- Define `OccasionFlatLayRequest` and `OccasionFlatLayResponse` interfaces
- Create the occasion preset mapping config (preset → occasion types, formality ranges, style cues)
- Build the system prompt template function `buildOccasionFlatLaySystemPrompt()` in a new `occasion-flat-lay-prompt.ts`

### Phase 2: Core Implementation
- Create `occasion-flat-lay-service.ts` with:
  - `generateOccasionFlatLay(request)` — main orchestration function
  - Step 1: Build system prompt from user profile + occasion
  - Step 2: Call OpenRouter chat completion to get AI-curated items + image prompt
  - Step 3: Parse AI response to extract the flat-lay image generation prompt
  - Step 4: Pass extracted prompt to `OpenRouterImageClient.generateOutfitImage()` (or the flat-lay path)
  - Fallback: if AI curation fails, use heuristic product selection from Supabase
- Create API route `POST /api/occasion-flat-lay` with:
  - Request validation (occasion preset, optional user profile fields)
  - Rate limiting (reuse existing pattern)
  - Call `generateOccasionFlatLay()`
  - Return image response

### Phase 3: Integration & Polish
- Create `useOccasionFlatLay` React hook with:
  - Loading/error/success states
  - localStorage caching (reuse pattern from `useFlatLayGeneration`)
  - Integration with `useUserProfile` for automatic profile context
- Update `QuickPresets.tsx` to use the 3 new occasion presets and trigger flat-lay generation
- Write unit tests for prompt builder, service, and hook
- Write integration tests for the API route

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
  - Name: builder-types-prompts
  - Role: Implement Phase 1 foundation — type definitions in `image-types.ts` and the system prompt template builder in `occasion-flat-lay-prompt.ts`
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-service-api
  - Role: Implement Phase 2 core — the orchestration service (`occasion-flat-lay-service.ts`) and the API route (`/api/occasion-flat-lay/route.ts`)
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-hook-ui
  - Role: Implement Phase 3 integration — the React hook (`useOccasionFlatLay.ts`) and update `QuickPresets.tsx` UI
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-tests
  - Role: Write comprehensive tests — unit tests for prompt builder, service, and hook; integration tests for API route
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: validator-final
  - Role: Final read-only validation — verify all files exist, types compile, tests pass, and acceptance criteria met
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Define Types and Interfaces
- **Task ID**: define-types
- **Depends On**: none
- **Assigned To**: builder-types-prompts
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside task 2)
- Add `OccasionPreset` type to `apps/web/lib/types/image-types.ts`:
  ```typescript
  export type OccasionPreset = 'weekend-social' | 'date-night' | 'everyday-casual';
  ```
- Add `OccasionFlatLayRequest` interface:
  ```typescript
  export interface OccasionFlatLayRequest {
    occasion: OccasionPreset;
    userName?: string;
    userAge?: string;         // AgeRange from user-profile-types
    stylePreferences?: string[];
    hasReferenceImage?: boolean;
  }
  ```
- Add `OccasionFlatLayResponse` interface:
  ```typescript
  export interface OccasionFlatLayResponse {
    success: boolean;
    imageBase64?: string;
    imageUrl?: string;
    curatedItems?: FlatLayItem[];
    imagePrompt?: string;
    error?: string;
    message?: string;
  }
  ```
- Add `OccasionPresetConfig` interface for preset-to-occasion mapping:
  ```typescript
  export interface OccasionPresetConfig {
    preset: OccasionPreset;
    label: string;
    emoji: string;
    occasionTypes: OccasionType[];   // maps to enums.ts OccasionType
    formalityRange: { min: number; max: number };
    defaultColorPalette: string[];
    keyPieces: string[];
  }
  ```

### 2. Build System Prompt Template
- **Task ID**: build-prompt-template
- **Depends On**: define-types
- **Assigned To**: builder-types-prompts
- **Agent Type**: general-purpose
- **Parallel**: false (needs types from task 1)
- Create `apps/web/lib/prompts/occasion-flat-lay-prompt.ts` with:
  - `OCCASION_PRESET_CONFIGS` — mapping from `OccasionPreset` to `OccasionPresetConfig`
  - `buildOccasionFlatLaySystemPrompt(request: OccasionFlatLayRequest): string` — builds the full system prompt from the template provided in the requirements
  - Template must include all sections from the user's spec: User Profile, Selected Occasion, Step 1-4 instructions, mandatory image specifications, forbidden elements, and output format
  - The function interpolates `{{userName}}`, `{{userAge}}`, `{{stylePreferences}}`, `{{hasReferenceImage}}`, and `{{occasion}}` into the template
  - Export `getOccasionPresetConfig(preset: OccasionPreset): OccasionPresetConfig` helper
  - Export `getAllOccasionPresets(): OccasionPresetConfig[]` helper

### 3. Implement Orchestration Service
- **Task ID**: implement-service
- **Depends On**: build-prompt-template
- **Assigned To**: builder-service-api
- **Agent Type**: general-purpose
- **Parallel**: true (can start once types + prompt are done)
- Create `apps/web/lib/services/occasion-flat-lay-service.ts` with:
  - `generateOccasionFlatLay(request: OccasionFlatLayRequest, apiKey: string): Promise<OccasionFlatLayResponse>`
  - Step 1: Call `buildOccasionFlatLaySystemPrompt(request)` to assemble the system prompt
  - Step 2: Send to OpenRouter chat completion (using the same model as `openrouter-client.ts`) with the system prompt to get AI-curated outfit + image prompt
  - Step 3: Parse the AI response text — extract the image generation prompt paragraph (starts with "A high-resolution, studio-lit flat-lay photograph...")
  - Step 4: Pass extracted prompt to `OpenRouterImageClient.generateOutfitImage()` with flat-lay style options
  - Error handling: if AI curation fails, return error with appropriate message
  - Logging: use `[OccasionFlatLay]` prefix for all console logs
  - Keep the service server-side only (uses `process.env.OPENROUTER_API_KEY`)

### 4. Create API Route
- **Task ID**: create-api-route
- **Depends On**: implement-service
- **Assigned To**: builder-service-api
- **Agent Type**: general-purpose
- **Parallel**: false (needs service)
- Create `apps/web/app/api/occasion-flat-lay/route.ts` with:
  - `POST` handler that accepts `OccasionFlatLayRequest` body
  - Validate required fields (`occasion` must be a valid `OccasionPreset`)
  - Rate limiting (reuse `isRateLimited` / `getClientIP` pattern from generate-image route)
  - Check `OPENROUTER_API_KEY` env var
  - Call `generateOccasionFlatLay(request, apiKey)`
  - Save generated image to disk (reuse `saveBase64Image` pattern) and include `imageUrl` in response
  - Return `OccasionFlatLayResponse` JSON
  - `GET` handler returns 405
  - `OPTIONS` handler for CORS

### 5. Create React Hook
- **Task ID**: create-hook
- **Depends On**: create-api-route
- **Assigned To**: builder-hook-ui
- **Agent Type**: general-purpose
- **Parallel**: true (can start once API is ready)
- Create `apps/web/lib/hooks/useOccasionFlatLay.ts` with:
  - `useOccasionFlatLay()` hook that:
    - Imports `useUserProfile` to get current user context automatically
    - Exposes `generateForOccasion(preset: OccasionPreset): Promise<void>`
    - Manages state: `isGenerating`, `imageBase64`, `imageUrl`, `curatedItems`, `error`
    - Implements localStorage caching with key pattern `occasion-flat-lay-{preset}-{profileHash}`
    - Returns `{ isGenerating, imageBase64, imageUrl, curatedItems, error, generateForOccasion, resetState }`
  - Follow patterns from `useFlatLayGeneration.ts` for caching and queue management

### 6. Update QuickPresets UI
- **Task ID**: update-presets-ui
- **Depends On**: create-hook
- **Assigned To**: builder-hook-ui
- **Agent Type**: general-purpose
- **Parallel**: false (needs hook)
- Update `apps/web/components/navigation/QuickPresets.tsx`:
  - Replace the 5 existing presets with 3 new ones:
    - `{ id: 'weekend-social', label: 'Weekend & Social', emoji: '☀️' }`
    - `{ id: 'date-night', label: 'Date Night', emoji: '🌙' }`
    - `{ id: 'everyday-casual', label: 'Everyday Casual', emoji: '👟' }`
  - Add `onOccasionFlatLay?: (preset: OccasionPreset) => void` prop
  - When a preset button is clicked, call both `onPresetSelect` (existing filter behavior) and `onOccasionFlatLay` (trigger flat-lay generation)
  - Add loading indicator per-button when generation is in progress
  - Show the generated flat-lay image in a results area below the presets (or via callback to parent)

### 7. Write Unit Tests for Prompt Builder
- **Task ID**: test-prompt-builder
- **Depends On**: build-prompt-template
- **Assigned To**: builder-tests
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside service implementation)
- Create `apps/web/lib/prompts/__tests__/occasion-flat-lay-prompt.test.ts` with vitest:
  - Test `buildOccasionFlatLaySystemPrompt()` includes user name, age, style preferences
  - Test all 3 occasion presets generate distinct prompts
  - Test missing optional fields use sensible defaults
  - Test the prompt includes all mandatory image specifications (white background, no text, overhead angle, 1:1)
  - Test `getOccasionPresetConfig()` returns correct config for each preset
  - Test `getAllOccasionPresets()` returns all 3 configs

### 8. Write Unit Tests for Service
- **Task ID**: test-service
- **Depends On**: implement-service
- **Assigned To**: builder-tests
- **Agent Type**: general-purpose
- **Parallel**: true
- Create `apps/web/lib/services/__tests__/occasion-flat-lay-service.test.ts` with vitest:
  - Mock `fetch` (OpenRouter API calls)
  - Test successful generation flow: prompt → AI response → image prompt extraction → image generation
  - Test AI response parsing correctly extracts the flat-lay prompt paragraph
  - Test error handling: invalid API key, rate limited, network error, malformed AI response
  - Test each occasion preset triggers the correct formality range and style cues

### 9. Write Hook and Integration Tests
- **Task ID**: test-hook-integration
- **Depends On**: create-hook, update-presets-ui
- **Assigned To**: builder-tests
- **Agent Type**: general-purpose
- **Parallel**: false (needs hook + UI)
- Create `apps/web/lib/hooks/__tests__/useOccasionFlatLay.test.ts` with vitest:
  - Mock fetch for API calls
  - Test hook returns correct initial state
  - Test `generateForOccasion` triggers API call with correct payload
  - Test caching: second call for same occasion returns cached result
  - Test error state is set correctly on API failure
  - Test loading state transitions

### 10. Final Validation
- **Task ID**: validate-all
- **Depends On**: define-types, build-prompt-template, implement-service, create-api-route, create-hook, update-presets-ui, test-prompt-builder, test-service, test-hook-integration
- **Assigned To**: validator-final
- **Agent Type**: validator
- **Parallel**: false
- Verify all new files exist at their expected paths
- Run `cd apps/web && pnpm tsc --noEmit` to verify TypeScript compilation
- Run `cd apps/web && pnpm test --run` to verify all tests pass (existing + new)
- Verify `OccasionPreset` type is properly exported and importable
- Verify API route is accessible (check file structure matches Next.js convention)
- Verify the system prompt template includes ALL required elements from the spec

## Acceptance Criteria
- [ ] `OccasionPreset` type and related interfaces are defined in `image-types.ts`
- [ ] System prompt template function correctly interpolates user profile and occasion data
- [ ] Template includes all mandatory image specifications: studio background, no text/labels, overhead angle, 1:1 aspect ratio
- [ ] Template includes all forbidden elements: no text, no colored backgrounds, no body parts, no unrelated props, no brand logos
- [ ] Orchestration service calls OpenRouter to get AI-curated items + generates flat-lay image
- [ ] API route `POST /api/occasion-flat-lay` handles all 3 presets with rate limiting
- [ ] React hook `useOccasionFlatLay` provides full state management with caching
- [ ] QuickPresets UI shows 3 occasion presets and triggers flat-lay generation
- [ ] All existing tests continue to pass (`pnpm test --run`)
- [ ] New tests cover: prompt builder (6+ test cases), service (5+ test cases), hook (5+ test cases)
- [ ] TypeScript compiles with no errors (`pnpm tsc --noEmit`)

## Validation Commands
Execute these commands to validate the task is complete:

- `cd /Users/naruechon/OOTD/apps/web && pnpm tsc --noEmit` — Verify TypeScript compilation passes
- `cd /Users/naruechon/OOTD/apps/web && pnpm test --run` — Run all tests (existing + new must pass)
- `ls -la /Users/naruechon/OOTD/apps/web/lib/prompts/occasion-flat-lay-prompt.ts` — Verify prompt template file exists
- `ls -la /Users/naruechon/OOTD/apps/web/lib/services/occasion-flat-lay-service.ts` — Verify service file exists
- `ls -la /Users/naruechon/OOTD/apps/web/app/api/occasion-flat-lay/route.ts` — Verify API route exists
- `ls -la /Users/naruechon/OOTD/apps/web/lib/hooks/useOccasionFlatLay.ts` — Verify hook file exists
- `grep -r "OccasionPreset" /Users/naruechon/OOTD/apps/web/lib/types/image-types.ts` — Verify type is exported

## Notes
- The AI curation step (Step 2 in service) calls OpenRouter's chat completion endpoint (not the image generation endpoint). The response is text containing the curated outfit description + image prompt. The image generation happens in a separate call (Step 4).
- The system prompt template from the user spec includes "Retrieve Knowledge" as Step 2, referencing Supabase pgvector. For MVP, the knowledge retrieval can be embedded within the LLM prompt context (the occasion definitions from `occasions.ts` provide sufficient styling guidelines). A future enhancement can add explicit RAG retrieval before prompt assembly.
- No new npm packages needed — the implementation uses existing OpenRouter API calls, existing types, and existing React patterns.
- The 3 occasion presets map to existing `OccasionType` enums as follows:
  - `weekend-social` → `chill`, `cafe`
  - `date-night` → `date`, `dinner`
  - `everyday-casual` → `chill`, `travel`
- The image generation model (`google/gemini-2.5-flash-image`) is already configured in `OPENROUTER_CONFIG` within `image-generation-service.ts`. The orchestration LLM for curation should use a text-only model (e.g., `anthropic/claude-sonnet-4-5-20250929` or the project's configured model).
