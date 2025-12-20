# SUPPLEMENTARY TASKS: Fix Conversational Loop Issue

**Related to:** `tasks-0006-prd-system-prompt-enhancement-guardrails.md`
**Issue:** AI creates conversational loops instead of following structured dialogue flow
**Evidence:** Screenshot showing multiple back-and-forth Thai conversations before recommendations
**Root Cause:** System prompt lacks strict enforcement of DialogTemplate14-2 conversation structure

---

## 🚨 CRITICAL ISSUE TO RESOLVE

**Symptom:** The AI agent engages in extended chitchat and asks multiple questions in sequence, creating a loop before providing outfit recommendations.

**Expected Behavior (per DialogTemplate14-2.md):**
1. Ask **1-2 clarifying questions MAXIMUM** (only if truly needed)
2. **IMMEDIATELY** move to outfit recommendations (CLOTHS) or tips (OTHER)
3. **NO extended back-and-forth** dialogue before recommendations
4. Follow **Template A or Template B structure strictly**

**Current Behavior (from screenshot):**
- Multiple turns of casual Thai conversation
- Extended question-asking without moving to recommendations
- Conversational loop pattern instead of structured response

---

## Parent Task 9: Loop Prevention & Strict Dialogue Flow Enforcement 🔒

**Goal:** Add explicit guardrails to prevent conversational loops and enforce strict adherence to DialogTemplate14-2 structure.

**Estimated Time:** 1 day

### Sub-tasks:

- [x] **9.1** Analyze current loop-causing patterns
  - Review screenshot evidence of looping behavior
  - Identify specific prompt sections that encourage chitchat
  - Document patterns: multiple questions, extended greetings, unnecessary confirmations
  - Map current flow vs expected flow from DialogTemplate14-2
  - **Files:** `frontend/LOOP_ANALYSIS.md` ✅

- [x] **9.2** Add "Conversation Flow Guardrails" section to system prompt v2
  - Create new section in `/frontend/lib/prompts/system-prompt-v2.ts`
  - Add explicit rule: "MAXIMUM 1-2 clarifying questions, then IMMEDIATELY provide recommendations"
  - Add rule: "NO extended chitchat or multiple confirmation turns"
  - Add rule: "After receiving clarification answer, PROCEED DIRECTLY to Template A or B"
  - Add counter-example: Show what NOT to do (extended dialogue example)
  - Add positive example: Show correct flow (question → answer → recommendation)
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts` ✅ (v2.0 → v2.1)

- [x] **9.3** Implement "Turn Counter" logic
  - Create `/frontend/lib/utils/conversation-flow-tracker.ts`
  - Implement `trackConversationTurns()` function
  - Count clarification turns vs recommendation turns
  - Flag if more than 2 clarification turns without recommendation
  - Trigger "force recommendation" mode after threshold
  - **Files:** `frontend/lib/utils/conversation-flow-tracker.ts` ✅
  - **Updated:** `frontend/lib/types/chat-types.ts` (added DialoguePhase, ClarificationType, dialoguePhase, clarificationTurnCount)
  - **Updated:** `frontend/lib/utils/session-context.ts` (initialize and manage phase/count)

- [x] **9.4** Add "Force Recommendation Mode" to system prompt
  - Update system prompt with instruction:
    - "If you have asked 2 clarifying questions, you MUST provide recommendations on next turn"
    - "Do NOT ask for more clarification after 2 questions"
    - "If information still unclear after 2 questions, make best-effort recommendations with available info"
  - Include escalation: "After 2 clarification turns, provide recommendations even with incomplete information"
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts` ✅ (Already completed in 9.2 - RULE 4: FORCE RECOMMENDATION MODE)

- [x] **9.5** Update clarification logic to enforce turn limits
  - Modify `/frontend/lib/utils/clarification-detector.ts`
  - Add parameter: `clarificationTurnCount: number`
  - Return empty array (no clarification) if `clarificationTurnCount >= 2`
  - Force system to proceed to recommendations
  - Log warning when limit reached
  - **Files:** `frontend/lib/utils/clarification-detector.ts` ✅
  - Added turn limit enforcement in `getClarificationsNeeded()`
  - Returns empty array when turnCount >= 2 (forces recommendations)
  - Logs warnings at turn 1 (last clarification) and turn 2 (force mode)

- [x] **9.6** Add explicit "Proceed to Recommendations" instruction
  - After clarification answered, inject system instruction:
    - "User has answered your question. Now IMMEDIATELY provide outfit recommendations using Template A (CLOTHS) or styling tips using Template B (OTHER)."
  - Add to conversation context after user answers clarification
  - Prevent AI from asking follow-up questions
  - **Files:** `frontend/lib/services/ai-chat-service.ts` ✅
  - Enhanced `callOpenRouter()` with `forceRecommendation` parameter (v2.1)
  - Added force recommendation instruction injection
  - Implemented detection of answered clarification
  - Integrated turn tracker utilities (`shouldForceRecommendations`, `getClarificationCount`, `formatTurnStats`)
  - Pass `clarificationTurnCount` to `getClarificationsNeeded()`

- [x] **9.7** Implement "Template Enforcement" validation
  - Create `/frontend/lib/utils/response-validator.ts`
  - Implement `validateResponseStructure()` function
  - Check if response follows Template A or Template B
  - Detect if response is just another question (loop indicator)
  - Flag responses that don't include products (for CLOTHS) or tips (for OTHER)
  - Log validation failures for monitoring
  - **Files:** `frontend/lib/utils/response-validator.ts` ✅
  - Implemented `detectLoop()`, `validateTemplateA()`, `validateTemplateB()`, `validateResponseStructure()`
  - Pattern-based detection for products, prices, links, tips
  - Auto-detects template type based on content indicators
  - Returns validation results with errors and warnings

- [x] **9.8** Add "Anti-Loop" examples to system prompt
  - Include section: "CRITICAL: Avoid Conversational Loops"
  - Add BAD example (multi-turn loop):
    ```
    ❌ BAD (Loop Pattern):
    Turn 1: "อยากหาชุดไปทำงาน"
    AI: "ชอบสไตล์แบบไหนคะ?"
    Turn 2: "สไตล์ออฟฟิศแบบสบายๆ"
    AI: "งบประมาณช่วงไหนคะ?"
    Turn 3: "3000-5000"
    AI: "มีสีที่ชอบเป็นพิเศษมั้ยคะ?"  ← LOOP! Too many questions!
    ```
  - Add GOOD example (direct flow):
    ```
    ✅ GOOD (Direct Flow):
    Turn 1: "อยากหาชุดไปทำงาน"
    AI: "ชุดผู้หญิงหรือผู้ชายคะ?"
    Turn 2: "ผู้หญิง"
    AI: [IMMEDIATELY provides Template A with 3-5 products]  ← CORRECT!
    ```
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts` ✅
  - Already completed in sub-task 9.2 (Anti-Loop Examples section added)

- [x] **9.9** Update conversation state to track dialogue phase
  - Add to session context: `dialoguePhase: 'clarification' | 'recommendation' | 'follow-up'`
  - Initialize as 'clarification' on new conversation
  - Transition to 'recommendation' after max 2 clarifications
  - Prevent returning to 'clarification' phase after transition
  - **Files:** `frontend/lib/types/chat-types.ts`, `frontend/lib/services/ai-chat-service.ts` ✅
  - Already completed in sub-task 9.3 (DialoguePhase type and tracking added)

- [x] **9.10** Add system-level response interceptor
  - Create `/frontend/lib/utils/loop-detector.ts`
  - Implement `detectLoop()` function
  - Check if AI response is only questions (no recommendations)
  - Check if response count exceeds turn limit without products/tips
  - If loop detected, inject override instruction to force recommendations
  - Retry API call with "FORCE RECOMMENDATION NOW" system message
  - **Files:** `frontend/lib/utils/loop-detector.ts` ✅
  - Implemented loop detection with 4 types: only-questions, exceeds-turns, no-content, multiple-clarifications
  - Created `generateForceInstruction()` for retry with context-specific instructions
  - Integrated into `ai-chat-service.ts` with retry logic
  - Logs loop detection results and retry attempts

**Acceptance Criteria:**
- System prompt includes explicit anti-loop guardrails
- Turn counter tracks clarification vs recommendation turns
- Force recommendation mode activates after 2 clarification questions
- Clarification detector respects turn limits
- Response validator detects loop patterns
- Anti-loop examples clearly documented in prompt
- Conversation state tracks dialogue phase transitions
- Loop detector can intercept and correct looping responses
- All changes integrated in `ai-chat-service.ts`

---

## Parent Task 10: Template Compliance Enforcement 📋

**Goal:** Ensure AI strictly follows Template A (CLOTHS) or Template B (OTHER) structure without deviation.

**Estimated Time:** 1 day

### Sub-tasks:

- [x] **10.1** Create Template A enforcement rules
  - Update system prompt with MANDATORY Template A sections:
    - ✅ Must include: Friendly acknowledgment
    - ✅ Must include: 3-5 product recommendations with brand, price, link
    - ✅ Must include: Styling Tricks & Tips (1-3 tips)
    - ✅ Must include: Overall outfit summary
    - ❌ Must NOT: Ask more questions after starting recommendations
    - ❌ Must NOT: Provide tips without products (for CLOTHS category)
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts` ✅ (v2.1 → v2.2)

- [x] **10.2** Create Template B enforcement rules
  - Update system prompt with MANDATORY Template B sections:
    - ✅ Must include: Friendly acknowledgment
    - ✅ Must include: 1-3 practical tips/tricks
    - ✅ Must include: Product mentions naturally within tips (NO price, NO links)
    - ✅ Must include: How-to guidance
    - ❌ Must NOT: Create separate product recommendation section
    - ❌ Must NOT: Include prices or links for products
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts` ✅ (v2.1 → v2.2)

- [x] **10.3** Implement category detection validator
  - Create `/frontend/lib/utils/category-detector.ts`
  - Implement `detectCategory()` function
  - Determine if query is CLOTHS or OTHER category
  - Map categories:
    - CLOTHS: เสื้อผ้า, ชุด, outfit, dress, pants, shirt, etc.
    - OTHER: รองเท้า, กระเป๋า, เครื่องสำอาง, accessories, shoes, bags, cosmetics, etc.
  - Return category type for template selection
  - **Files:** `frontend/lib/utils/category-detector.ts` ✅ (Already exists)

- [x] **10.4** Add template selector to chat service
  - Update `processAIChatRequest()` in ai-chat-service.ts
  - Call `detectCategory()` to determine CLOTHS vs OTHER
  - Inject specific template enforcement instruction based on category:
    - For CLOTHS: "Use Template A: Provide 3-5 products with prices and links"
    - For OTHER: "Use Template B: Share 1-3 tips with natural product mentions (no prices/links)"
  - Include template structure in system message
  - **Files:** `frontend/lib/services/ai-chat-service.ts` ✅ (Already integrated, lines 401-414)

- [x] **10.5** Create template structure validator
  - Extend `/frontend/lib/utils/response-validator.ts`
  - Implement `validateTemplateA()` function:
    - Check for product section (👔/👗 emoji or product headers)
    - Verify price mentions (💰 emoji or "ราคา")
    - Verify link presence (🔗 emoji or URLs)
    - Count products (must be 3-5)
    - Check for styling tips section (✨ emoji or "Tips")
  - Implement `validateTemplateB()` function:
    - Check for tips section (💡 emoji or numbered/bullet tips)
    - Verify NO separate product section
    - Verify NO prices mentioned
    - Verify NO links included
    - Count tips (must be 1-3)
  - **Files:** `frontend/lib/utils/response-validator.ts` ✅ (Already exists with validateTemplateA & validateTemplateB)

- [x] **10.6** Add post-response validation and retry logic
  - After receiving AI response, validate against template
  - If validation fails:
    - Log validation error with specific failures
    - Inject correction instruction: "Your previous response did not follow Template [A/B]. Please regenerate following the exact structure."
    - Retry API call with correction (max 1 retry)
  - If retry also fails, return error to user with fallback message
  - **Files:** `frontend/lib/services/ai-chat-service.ts` ✅ (Already integrated, lines 471-519)

- [x] **10.7** Update system prompt with template structure diagrams
  - Add visual structure representation for Template A:
    ```
    TEMPLATE A STRUCTURE (MANDATORY):
    1. [Friendly greeting/acknowledgment]
    2. [Product 1] → Brand, Price, Link, Reason
    3. [Product 2] → Brand, Price, Link, Reason
    4. [Product 3] → Brand, Price, Link, Reason
    5. [Optional: Products 4-5]
    6. ✨ Styling Tips (1-3 tips)
    7. [Summary/Conclusion]
    ```
  - Add visual structure for Template B:
    ```
    TEMPLATE B STRUCTURE (MANDATORY):
    1. [Friendly greeting/acknowledgment]
    2. 💡 Tip 1 (with optional product mention - no price/link)
    3. 💡 Tip 2 (with optional product mention - no price/link)
    4. 💡 Tip 3 (with optional product mention - no price/link)
    5. ✨ Additional insight (optional)
    6. [Closing message]
    ```
  - Include note: "Follow this structure EXACTLY. Do not deviate."
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts` ✅ (Added in Template Enforcement Rules section)

- [x] **10.8** Add "One-Shot Completion" instruction
  - Update system prompt with directive:
    - "Provide COMPLETE recommendations in ONE response"
    - "Do NOT split recommendations across multiple messages"
    - "Do NOT ask for confirmation before providing recommendations"
    - "Do NOT check if user wants to see products after clarification"
  - Emphasize: "After clarification, give full Template A or B response immediately"
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts` ✅ (RULE 5: ONE-SHOT COMPLETION already exists)

**Acceptance Criteria:**
- Template A and B rules explicitly defined in system prompt
- Category detection accurately identifies CLOTHS vs OTHER
- Template selector injects correct instructions per category
- Template structure validators check Template A and B compliance
- Post-response validation with retry logic implemented
- Template structure diagrams added to system prompt
- One-shot completion directive prevents multi-turn recommendations
- All validation failures logged for monitoring

---

## Parent Task 11: Integration Testing for Loop Prevention 🧪

**Goal:** Thoroughly test that conversational loops are prevented and template compliance is enforced.

**Estimated Time:** 1 day

### Sub-tasks:

- [ ] **11.1** Create loop detection test suite
  - Create test file: `/frontend/lib/utils/__tests__/loop-detector.test.ts`
  - Test: Detects response with only questions (no products/tips)
  - Test: Detects exceeding turn limit without recommendations
  - Test: Returns false for valid recommendation responses
  - Test: Handles edge cases (empty responses, mixed content)
  - Achieve 100% coverage for loop-detector.ts
  - **Files:** `frontend/lib/utils/__tests__/loop-detector.test.ts`

- [ ] **11.2** Create template validator test suite
  - Create test file: `/frontend/lib/utils/__tests__/response-validator.test.ts`
  - Test Template A validation:
    - Passes with 3-5 products, prices, links, tips
    - Fails with missing products
    - Fails with missing prices or links
    - Fails with wrong product count (<3 or >5)
  - Test Template B validation:
    - Passes with 1-3 tips, natural product mentions, no prices/links
    - Fails with separate product section
    - Fails with prices or links included
    - Fails with wrong tip count
  - Achieve 100% coverage for response-validator.ts
  - **Files:** `frontend/lib/utils/__tests__/response-validator.test.ts`

- [ ] **11.3** Create end-to-end loop prevention test
  - Create test file: `/frontend/lib/services/__tests__/loop-prevention.integration.test.ts`
  - Test Scenario: Ambiguous CLOTHS query
    - Turn 1: "หาชุดไปทำงาน" → AI asks gender clarification
    - Turn 2: "ผู้หญิง" → AI MUST provide Template A (not ask more questions)
    - Assert: Response contains products, prices, links
    - Assert: Response follows Template A structure
  - Test Scenario: Max clarification enforcement
    - Turn 1: "หาชุด" → AI asks gender
    - Turn 2: "ผู้หญิง" → AI asks occasion
    - Turn 3: User gives occasion → AI MUST provide recommendations (no 3rd question)
  - Test Scenario: OTHER category (tips only)
    - Turn 1: "รองเท้าผ้าใบดูแลยังไง" → AI provides Template B immediately
    - Assert: Response has tips, no prices, no links
  - **Files:** `frontend/lib/services/__tests__/loop-prevention.integration.test.ts`

- [ ] **11.4** Manual testing with Thai language queries
  - Test with screenshot example query: "ขอโทษนะคะคุณลูกค่ะ"
  - Test ambiguous queries: "หาชุดสวยๆ", "อยากได้ชุดไปงาน"
  - Test clear queries: "หาชุดไปงานแต่ง งบ 5000", "แนะนำชุดทำงานผู้หญิง"
  - Test OTHER category: "รองเท้าหนังดูแลยังไง", "กระเป๋าควรเก็บอย่างไร"
  - Verify NO loops in any scenario
  - Verify all responses follow correct template
  - **Files:** Manual test results documentation

- [ ] **11.5** Performance testing for validation overhead
  - Measure latency added by:
    - Loop detection: Target <20ms
    - Template validation: Target <30ms
    - Category detection: Target <10ms
  - Total overhead target: <60ms per request
  - Optimize if exceeds targets
  - **Files:** Performance test results

- [ ] **11.6** Create regression test suite
  - Document current loop issue as "Loop-001"
  - Create test case to prevent regression:
    - Input: Ambiguous query requiring clarification
    - Expected: Max 2 clarifications, then recommendations
    - Expected: No extended back-and-forth
  - Add test to CI/CD pipeline
  - Run after every system prompt change
  - **Files:** Regression test suite

**Acceptance Criteria:**
- Loop detector test suite with 100% coverage
- Template validator test suite with 100% coverage
- End-to-end loop prevention tests passing
- Manual testing confirms no loops with Thai queries
- Performance overhead within acceptable limits
- Regression test suite prevents future loop issues
- All tests integrated in CI/CD pipeline

---

## Summary of Additional Files to Create

### New Files:
1. `/frontend/lib/utils/conversation-flow-tracker.ts` - Track clarification vs recommendation turns
2. `/frontend/lib/utils/loop-detector.ts` - Detect and prevent conversational loops
3. `/frontend/lib/utils/category-detector.ts` - Detect CLOTHS vs OTHER category
4. `/frontend/lib/utils/response-validator.ts` - Validate Template A/B compliance (extend if exists)
5. Test files for all new utilities in `__tests__/` directories

### Files to Modify:
1. `/frontend/lib/prompts/system-prompt-v2.ts` - Add loop prevention, template enforcement sections
2. `/frontend/lib/utils/clarification-detector.ts` - Add turn limit enforcement
3. `/frontend/lib/services/ai-chat-service.ts` - Integrate loop prevention, template validation
4. `/frontend/lib/types/chat-types.ts` - Add `dialoguePhase` and `clarificationTurnCount` to session context

---

## Integration with Existing Task List

**These tasks should be executed AFTER:**
- Parent Task 2: System Prompt Development (tasks-0006-prd-system-prompt-enhancement-guardrails.md)
- Parent Task 4: Smart Clarification Logic (tasks-0006-prd-system-prompt-enhancement-guardrails.md)

**Execute in this order:**
1. Complete Parent Tasks 1-6 from original task list
2. Execute Parent Task 9: Loop Prevention (this document)
3. Execute Parent Task 10: Template Compliance (this document)
4. Execute Parent Task 11: Integration Testing (this document)
5. Continue with Parent Tasks 7-8 from original task list (Testing & Deployment)

---

## Success Criteria

✅ Conversational loops eliminated (verified via testing)
✅ Max 2 clarification questions enforced
✅ AI proceeds directly to recommendations after clarification
✅ Template A compliance for CLOTHS category (3-5 products with prices/links)
✅ Template B compliance for OTHER category (1-3 tips, no prices/links)
✅ No extended back-and-forth before recommendations
✅ All validation logic implemented and tested
✅ Performance overhead <60ms per request
✅ Regression tests prevent future loop issues

---

**Document Version:** 1.0
**Created:** 2025-10-14
**Related Task List:** `tasks-0006-prd-system-prompt-enhancement-guardrails.md`
**Issue:** Conversational Loop Prevention
**Status:** Ready for Implementation
