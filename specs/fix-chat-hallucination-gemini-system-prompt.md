# Plan: Fix Chat Hallucination — Gemini System Prompt Anti-Fabrication

## Task Description
The OOTDay chat system uses `google/gemini-3-flash-preview` via OpenRouter for AI fashion recommendations. The AI hallucinates product details — it fabricates Central Online URLs by converting product names into search query URLs (e.g., `central.co.th/en/search/Cotton%20Blend%20Metallic%20Tweed%20Jacket`) instead of using the exact URLs from the provided product catalog. Additionally, the system prompt version selector is broken: `callOpenRouter()` hardcodes `SYSTEM_PROMPT_V2` (line 434 of `ai-chat-service.ts`) even though the version manager defaults to `v4.0` and `getActiveSystemPrompt()` is already imported but never called.

This plan applies the relevant recommendations from `research/improve-system-prompt-for-chat-system.md` — specifically those that apply to **Gemini** (not Claude), plus fixes the version wiring bug.

## Objective
When this plan is complete:
1. The chat AI will use the **active system prompt version** (v4.0 or env-configured) instead of hardcoded v2
2. A new **v5.0 system prompt** will exist with Gemini-optimized anti-hallucination rules
3. The AI will **never fabricate product URLs, prices, or brand names** — only use data from the provided catalog
4. The AI can **say "I don't know"** or acknowledge when no matching product exists instead of inventing one
5. Product catalog data will be injected in a **structured, unambiguous format** that Gemini can reliably reference
6. Few-shot examples will demonstrate correct product referencing with **real catalog data patterns**

## Problem Statement
Three root causes combine to create hallucination:

**1. Wrong prompt version (bug):** `callOpenRouter()` at line 434 of `ai-chat-service.ts` uses `SYSTEM_PROMPT_V2` directly. The imported `getActiveSystemPrompt()` function (which returns v4.0 by default) is never called. This means v3 and v4 improvements are completely unused.

**2. No explicit anti-fabrication rules:** Neither v2 nor v4 system prompts contain explicit instructions like "If you cannot find a product in the catalog, say so. Never construct URLs from product names." The existing v4 line 493 says "MUST recommend actual Central Online products" but doesn't define what happens when no match exists.

**3. Gemini-unoptimized formatting:** The research document notes Gemini prefers **hierarchical nesting** format, not XML tags (Claude) or flat markdown. The current prompts use flat markdown with aggressive language (`CRITICAL`, `MUST`, `MANDATORY`, `FORBIDDEN`) which can cause Gemini to overcompensate — when told "MUST include links" with no escape hatch, it fabricates them.

## Solution Approach

### Strategy: Fix the bug, then create v5.0 with anti-hallucination

1. **Fix the version wiring bug** — Change `callOpenRouter()` to use `getActiveSystemPrompt()` instead of hardcoded `SYSTEM_PROMPT_V2`
2. **Create system-prompt-v5.ts** — New version with:
   - Gemini-optimized hierarchical nesting (not XML, not flat markdown)
   - Explicit anti-hallucination rules with positive framing
   - "I don't know" permission to reduce fabrication pressure
   - Structured product catalog injection format
   - Few-shot examples showing correct product referencing
   - Reduced aggressive language (replace CRITICAL/MUST/FORBIDDEN with clear, calm instructions)
3. **Update prompt-version.ts** — Register v5.0 and set as default
4. **Improve product context serialization** — Ensure `serializeForAI()` outputs product data in a format that makes URL extraction unambiguous

### Key Design Decisions
- **Preserve all v4 behavioral logic** — v5 inherits v4's state machine, OOT persona, 1-clarification max, 2-looks minimum
- **Additive changes only** — v5 adds anti-hallucination sections; does not remove existing working features
- **Gemini-specific formatting** — Use hierarchical nesting with indentation, not XML tags
- **Feature flag compatible** — `SYSTEM_PROMPT_VERSION=v4.0` in env rolls back to previous behavior
- **No model change** — Still `google/gemini-3-flash-preview` via OpenRouter

## Relevant Files

### Core files to modify:

- **`apps/web/lib/services/ai-chat-service.ts`** (~982 lines) — Line 434 hardcodes `SYSTEM_PROMPT_V2`. Must change to `getActiveSystemPrompt()`. Also line 50 imports `SYSTEM_PROMPT_V2` directly — this import can be removed.
- **`apps/web/lib/prompts/prompt-version.ts`** (161 lines) — Register v5.0 type and import. Update `PROMPT_VERSION` default to `'v5.0'`.
- **`apps/web/lib/utils/ai-serializer.ts`** — `serializeForAI()` and `createOutfitPrompt()` — ensure product URLs are clearly labeled in the serialized output so Gemini can reference them without fabrication.

### New files to create:

- **`apps/web/lib/prompts/system-prompt-v5.ts`** — New system prompt with anti-hallucination rules
- **`apps/web/lib/prompts/__tests__/system-prompt-v5.test.ts`** — Tests verifying v5 contains required anti-hallucination sections

### Reference files (read-only):

- **`apps/web/lib/prompts/system-prompt-v4.ts`** (664 lines) — Base for v5. Copy and extend.
- **`apps/web/lib/prompts/system-prompt-v2.ts`** (1135 lines) — Currently used (incorrectly). Reference for understanding what the AI actually sees today.
- **`research/improve-system-prompt-for-chat-system.md`** — Research document with best practices. Key sections: "Positive vs Negative Framing", "Explicitly allow I don't know", "Structured Formatting Approaches" (Gemini = hierarchical nesting).
- **`apps/web/lib/utils/ai-serializer.ts`** — Current product serialization format.
- **`apps/web/lib/types/product-types.ts`** — `EnhancedProduct` type definition.

## Implementation Phases

### Phase 1: Foundation (Fix version wiring bug)
Fix the critical bug where `callOpenRouter()` ignores the version system. This alone might improve behavior since v4 is better structured than v2.

### Phase 2: Core Implementation (Create v5.0 system prompt)
Build the new system prompt with Gemini-optimized anti-hallucination rules. Key additions:
- Product grounding rules section
- "I don't know" permission
- Structured catalog reference format
- Few-shot examples with correct product usage
- Reduced aggressive language

### Phase 3: Integration & Polish (Wire v5, improve serializer, test)
Register v5 in version manager, improve product serialization, add tests, validate end-to-end.

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to do the building, validating, testing, deploying, and other tasks.

### Team Members

- Builder
  - Name: builder-prompt
  - Role: Create system-prompt-v5.ts with anti-hallucination rules, fix version wiring in ai-chat-service.ts, update prompt-version.ts
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-serializer
  - Role: Improve product context serialization in ai-serializer.ts to make URLs unambiguous for Gemini
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-tester
  - Role: Write tests for v5 prompt content and version wiring correctness
  - Agent Type: general-purpose
  - Resume: true

- Validator
  - Name: validator
  - Role: Run all tests, verify version wiring, check anti-hallucination rules exist, validate no regressions
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Fix Version Wiring Bug in ai-chat-service.ts
- **Task ID**: fix-version-wiring
- **Depends On**: none
- **Assigned To**: builder-prompt
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside task 2)
- In `apps/web/lib/services/ai-chat-service.ts`:
  - Line 434: Change `content: SYSTEM_PROMPT_V2,` to `content: getActiveSystemPrompt(),`
  - Line 50: Remove the direct import `import { SYSTEM_PROMPT_V2 } from '../prompts/system-prompt-v2'` (it's no longer needed here)
  - Keep the import of `getActiveSystemPrompt` from line 49 (already exists)
  - Verify no other references to `SYSTEM_PROMPT_V2` remain in this file
- This is a 2-line fix. Verify the file compiles after changes.

### 2. Create system-prompt-v5.ts with Anti-Hallucination Rules
- **Task ID**: create-v5-prompt
- **Depends On**: none
- **Assigned To**: builder-prompt
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside task 1)
- Create `apps/web/lib/prompts/system-prompt-v5.ts`
- **Start from v4 as base** — copy the full v4 content and ADD these new sections:

#### A. Add "PRODUCT GROUNDING RULES" section (insert after DECISION LOGIC FLOWCHART, before STATE 1):
```
## PRODUCT GROUNDING RULES — Zero Fabrication Policy 🔒

You have access to a product catalog provided in each request. Follow these rules strictly:

1. Recommend ONLY products that appear in the provided catalog
   - Use the EXACT product name, brand, price, and URL from the catalog
   - Copy URLs character-for-character — never modify, shorten, or construct URLs
   - If a product has no URL in the catalog, omit the link entirely (don't create one)

2. When no matching product exists in the catalog:
   - Say so honestly: "ตอนนี้ยังไม่มีสินค้าที่ตรงกับความต้องการเป๊ะๆ นะจ้า แต่มีตัวนี้ที่ใกล้เคียง..."
   - Suggest the closest available alternatives from the catalog
   - Acknowledge the gap rather than inventing a product

3. Price accuracy:
   - Use only prices from the catalog data
   - Calculate Look totals by summing the exact catalog prices
   - If price is missing from catalog, write "ราคาตามหน้าเว็บ" instead of guessing

4. Brand accuracy:
   - Use the exact brand name from the catalog (e.g., "SFERA" not "Zara", "CPS CHAPS" not "CPS")
   - If brand is missing, write the product name without a brand

5. It is perfectly acceptable to say:
   - "ตอนนี้ไม่มีสินค้าที่ตรงกับที่เธอต้องการพอดีเลยจ้า ลองดูตัวใกล้เคียงนี้ก่อนนะ"
   - "ขอเช็คก่อนนะจ้า ยังไม่เจอ [item type] ในคลังตอนนี้ แต่มีอันอื่นที่น่าสนใจ"
   - Admitting you don't have something builds MORE trust than fabricating
```

#### B. Add "PRODUCT CATALOG REFERENCE FORMAT" section (insert before RESPONSE FORMAT TEMPLATES):
```
## PRODUCT CATALOG REFERENCE FORMAT 📦

When you receive product data, it will be structured like this:

  Product: [Name]
  Brand: [Brand]
  Price: [Number] THB
  URL: [Full URL — use this EXACTLY]
  SKU: [Product code]
  Category: [Category]
  Gender: [men/women/unisex]

When creating your LOOKs response:
- Match products from the catalog by category and occasion fit
- Copy the URL field exactly into your 🔗 link
- Copy the Price field exactly into your "ราคา X บาท"
- Copy the Brand field exactly
- If you reference a product, it MUST exist in the catalog provided to you
```

#### C. Add few-shot example showing correct catalog usage (add to RECOMMENDATION MODE section):
```
### GOOD EXAMPLE - Using Catalog Products Correctly:

Given catalog contains:
  Product: Stand Collar Blouse
  Brand: SFERA
  Price: 990 THB
  URL: https://www.central.co.th/en/sfera-stand-collar-blouse-12345
  SKU: SF-BL-001

  Product: Elastic Waist Twill Audrey Pants
  Brand: GIORDANO
  Price: 600 THB
  URL: https://www.central.co.th/en/giordano-elastic-waist-twill-audrey-pants-67890
  SKU: GD-PT-001

AI response:
  - เสื้อ Stand Collar Blouse - SFERA ราคา 990 บาท 🔗 [https://www.central.co.th/en/sfera-stand-collar-blouse-12345]
  - กางเกง Elastic Waist Twill Audrey Pants - GIORDANO ราคา 600 บาท 🔗 [https://www.central.co.th/en/giordano-elastic-waist-twill-audrey-pants-67890]
  **Total: ฿1,590**

### BAD EXAMPLE - Fabricating URLs (NEVER do this):

❌ WRONG: 🔗 [https://www.central.co.th/en/search/Stand%20Collar%20Blouse]
❌ WRONG: 🔗 [Link]
❌ WRONG: 🔗 [https://www.central.co.th/en/sfera-blouse] (shortened/modified URL)
✅ CORRECT: 🔗 [https://www.central.co.th/en/sfera-stand-collar-blouse-12345] (exact catalog URL)
```

#### D. Tone down aggressive language throughout:
- Replace "CRITICAL:" with descriptive headers
- Replace "YOU MUST" with "Always" or direct imperatives
- Replace "FORBIDDEN" with "Avoid" or "Instead of X, do Y"
- Replace "MANDATORY" with clear statements
- Keep the rules clear and firm but without ALL CAPS shouting
- Example: `**CRITICAL: ALWAYS 2 LOOKS MINIMUM**` → `Always provide at least 2 distinct looks per recommendation.`

#### E. Update metadata:
- Export `SYSTEM_PROMPT_V5` and `SYSTEM_PROMPT_V5_METADATA`
- Version: `v5.0.0`
- Previous version: `v4.0.0`
- Major changes list: anti-hallucination, product grounding, Gemini optimization, tone adjustment

### 3. Improve Product Serialization in ai-serializer.ts
- **Task ID**: improve-serializer
- **Depends On**: none
- **Assigned To**: builder-serializer
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside tasks 1 and 2)
- Read `apps/web/lib/utils/ai-serializer.ts` to understand current `createOutfitPrompt()` and `serializeForAI()` output format
- Ensure each product in the serialized output clearly includes:
  - Product name on its own labeled line
  - Brand on its own labeled line
  - Price with clear "THB" or "บาท" suffix
  - Full URL on its own labeled line, clearly labeled "URL:" (not embedded in text)
  - SKU on its own labeled line
- The goal is to make it trivially easy for Gemini to extract exact values from the catalog
- If the current format already does this well, make minimal changes
- Ensure `centralIntegration.productUrl` is always included in the serialized product data when available
- Add a label comment at the top of the product section like: `PRODUCT CATALOG — Use ONLY these products in your recommendations. Copy URLs exactly.`

### 4. Register v5.0 in Prompt Version Manager
- **Task ID**: register-v5
- **Depends On**: create-v5-prompt
- **Assigned To**: builder-prompt
- **Agent Type**: general-purpose
- **Parallel**: false
- Modify `apps/web/lib/prompts/prompt-version.ts`:
  - Add import: `import { SYSTEM_PROMPT_V5, SYSTEM_PROMPT_V5_METADATA } from './system-prompt-v5'`
  - Add `'v5.0'` to the `PromptVersion` type union
  - Update `PROMPT_VERSION` constant to `'v5.0'`
  - Update `PREVIOUS_VERSION` to `'v4.0'`
  - Add `case 'v5.0': return SYSTEM_PROMPT_V5` in `getSystemPrompt()`
  - Add `case 'v5.0': return SYSTEM_PROMPT_V5_METADATA` in `getSystemPromptMetadata()`
  - Update `isVersionAvailable()` to include `'v5.0'`
  - Add `isV5Active()` to `VersionUtils`
- Update `.env.sample` to document: `SYSTEM_PROMPT_VERSION=v5.0  # Options: v2.1, v3.0, v4.0, v5.0`

### 5. Write System Prompt v5 Tests
- **Task ID**: test-v5-prompt
- **Depends On**: create-v5-prompt
- **Assigned To**: builder-tester
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside task 4)
- Create `apps/web/lib/prompts/__tests__/system-prompt-v5.test.ts`
- Test cases:
  - v5 prompt string is non-empty and exported correctly
  - v5 prompt contains "PRODUCT GROUNDING RULES" section
  - v5 prompt contains "Zero Fabrication" or equivalent anti-hallucination phrase
  - v5 prompt contains "I don't know" permission phrase (ตอนนี้ไม่มีสินค้า or equivalent)
  - v5 prompt contains "Copy URLs" or "EXACT" URL instruction
  - v5 prompt contains "LOOKs" template format
  - v5 prompt contains "OOT" persona section
  - v5 prompt does NOT contain excessive "CRITICAL:" occurrences (max 3 allowed, was 10+ in v2)
  - v5 prompt contains "at least 2" looks instruction
  - v5 metadata has correct version `v5.0.0`
  - v5 metadata `majorChanges` array includes anti-hallucination entry

### 6. Write Version Wiring Tests
- **Task ID**: test-version-wiring
- **Depends On**: fix-version-wiring, register-v5
- **Assigned To**: builder-tester
- **Agent Type**: general-purpose
- **Parallel**: false
- Create `apps/web/lib/prompts/__tests__/prompt-version-v5.test.ts`
- Test cases:
  - `getActiveSystemPrompt()` returns v5 content by default
  - `getSystemPrompt('v5.0')` returns SYSTEM_PROMPT_V5
  - `getSystemPrompt('v4.0')` still returns SYSTEM_PROMPT_V4 (rollback works)
  - `getSystemPrompt('v2.1')` still returns SYSTEM_PROMPT_V2 (rollback works)
  - `isVersionAvailable('v5.0')` returns true
  - `VersionUtils.isV5Active()` returns true when no env override
  - `PROMPT_VERSION` equals `'v5.0'`
  - `PREVIOUS_VERSION` equals `'v4.0'`
  - Verify `ai-chat-service.ts` does NOT contain direct import of `SYSTEM_PROMPT_V2` (grep test)
  - Verify `ai-chat-service.ts` uses `getActiveSystemPrompt()` in the system message

### 7. Final Validation
- **Task ID**: validate-all
- **Depends On**: fix-version-wiring, create-v5-prompt, improve-serializer, register-v5, test-v5-prompt, test-version-wiring
- **Assigned To**: validator
- **Agent Type**: validator
- **Parallel**: false
- Run `cd /Users/tachongrak/Projects/OOTD/apps/web && pnpm test --run` — all tests must pass
- Verify `ai-chat-service.ts` line 434 uses `getActiveSystemPrompt()` not `SYSTEM_PROMPT_V2`
- Verify `ai-chat-service.ts` does NOT import `SYSTEM_PROMPT_V2` directly
- Verify `system-prompt-v5.ts` exists and exports `SYSTEM_PROMPT_V5`
- Verify v5 prompt contains "PRODUCT GROUNDING RULES" section
- Verify v5 prompt contains anti-URL-fabrication instruction
- Verify v5 prompt contains "I don't know" permission
- Verify `prompt-version.ts` defaults to v5.0
- Verify `.env.sample` documents the `SYSTEM_PROMPT_VERSION` variable
- Verify `ai-serializer.ts` includes URL in product serialization
- Count "CRITICAL" occurrences in v5 — should be ≤3 (vs 10+ in v2)
- Verify all existing tests still pass (no regressions)

## Acceptance Criteria

1. **Version wiring fixed**: `callOpenRouter()` uses `getActiveSystemPrompt()`, not hardcoded `SYSTEM_PROMPT_V2`
2. **v5.0 prompt exists**: `system-prompt-v5.ts` with exported `SYSTEM_PROMPT_V5` and metadata
3. **Anti-hallucination rules**: v5 contains "PRODUCT GROUNDING RULES" section with zero-fabrication policy
4. **"I don't know" permission**: v5 explicitly tells the AI it can acknowledge missing products
5. **URL fabrication prevention**: v5 contains instruction to copy URLs exactly and a BAD example showing fabricated URLs
6. **Few-shot with catalog**: v5 includes example showing how to correctly reference catalog products
7. **Reduced aggressive language**: v5 has ≤3 "CRITICAL" occurrences (v2 had 10+)
8. **Version rollback works**: Setting `SYSTEM_PROMPT_VERSION=v4.0` in env falls back to v4
9. **Product serialization improved**: URLs are clearly labeled in the product catalog injected into the prompt
10. **All tests pass**: `pnpm test --run` passes including new v5 tests
11. **No regressions**: Existing 484+ tests continue to pass

## Validation Commands

Execute these commands to validate the task is complete:

- `cd /Users/tachongrak/Projects/OOTD/apps/web && pnpm test --run` — All unit tests pass
- `grep -n 'SYSTEM_PROMPT_V2' apps/web/lib/services/ai-chat-service.ts` — Should return NO matches (removed)
- `grep -n 'getActiveSystemPrompt' apps/web/lib/services/ai-chat-service.ts` — Should find usage in callOpenRouter
- `grep -n 'PRODUCT GROUNDING RULES' apps/web/lib/prompts/system-prompt-v5.ts` — Section exists
- `grep -c 'CRITICAL' apps/web/lib/prompts/system-prompt-v5.ts` — Should be ≤3
- `grep -n 'v5.0' apps/web/lib/prompts/prompt-version.ts` — v5 registered
- `ls apps/web/lib/prompts/system-prompt-v5.ts` — File exists
- `ls apps/web/lib/prompts/__tests__/system-prompt-v5.test.ts` — Tests exist
- `ls apps/web/lib/prompts/__tests__/prompt-version-v5.test.ts` — Tests exist

## Notes

- The chat uses `google/gemini-3-flash-preview` via OpenRouter — NOT Claude. All prompt optimization must target Gemini, not Claude.
- Gemini prefers **hierarchical nesting** format (indented sections) over XML tags (Claude-specific) or flat markdown.
- The existing `SYSTEM_PROMPT_V2` at 1,076 lines is extremely long. v5 should be more concise by inheriting v4 (618 lines) and adding ~80-100 lines of anti-hallucination content.
- The `OPENROUTER_API_KEY` env var (without `NEXT_PUBLIC_` prefix) is required for AI mode.
- Product embeddings and knowledge embeddings in Supabase are separate from this prompt work — the RAG integration from `specs/chat-supabase-rag-integration.md` is already complete.
- When dialing back aggressive language, keep the rules clear and firm — just remove the ALL CAPS shouting and "CRITICAL/FORBIDDEN/MANDATORY" framing. The behavioral rules themselves should remain.
