# Task List: System Prompt v3.0 - Clarification Flow Fix

**PRD:** 0007-prd-system-prompt-v3-clarification-fix.md
**Status:** Not Started
**Timeline:** 4 Weeks (20 working days)
**Last Updated:** 2025-10-15

---

## Overview

This task list implements System Prompt v3.0 to fix the critical conversation flow issue where the AI asks clarifying questions AFTER providing product recommendations. The solution enforces a strict state machine: CLARIFY FIRST → RECOMMEND SECOND (never mix).

**Critical Success Criteria:**
- ✅ Zero post-recommendation clarifications (100% elimination)
- ✅ Zero repeated questions (100% elimination)
- ✅ 30% reduction in turns-to-recommendation
- ✅ 99%+ state transition accuracy

---

## PHASE 1: Week 1 - Core Development (Days 1-5)

### ✅ Parent Task 1: State Machine Implementation [COMPLETED]
**Owner:** Dev Team
**Priority:** P0 (Critical)
**Dependencies:** None
**Estimated Time:** 2 days
**Actual Time:** Completed
**Commit:** a9ae815 (frontend submodule)

**Sub-tasks:**
- [x] 1.1 Create file: `frontend/lib/conversation/state-machine.ts`
  - Set up TypeScript interfaces: `ResponseMode`, `ConversationState`
  - Define state types: CLARIFICATION, RECOMMENDATION, REDIRECT

- [x] 1.2 Implement `ConversationStateMachine` class
  - Create class structure and constructor
  - Add state: `mode`, `clarificationsAsked`, `hasProvidedRecommendations`, `userInfo`, `clarificationHistory`

- [x] 1.3 Implement `decideMode()` method (FR-1.2)
  - Priority 1: Check `isOffTopic()` → return REDIRECT
  - Priority 2: Check `hasProvidedRecommendations` → return RECOMMENDATION (post-recommendation lockout)
  - Priority 3: Check `clarificationsAsked >= 2` → return RECOMMENDATION (force recommendation)
  - Priority 4: Check `hasSufficientInfo()` → return RECOMMENDATION
  - Priority 5: Check missing critical info → return CLARIFICATION
  - Default: return RECOMMENDATION

- [x] 1.4 Implement helper detection methods
  - `detectGender(message: string): boolean` - keywords: ผู้หญิง, ผู้ชาย, men, women
  - `detectOccasion(message: string): boolean` - keywords: ทำงาน, งานแต่ง, เดท, etc.
  - `detectDestination(message: string): boolean` - travel-related keywords
  - `isTravelQuery(message: string): boolean`
  - `isOtherCategory(message: string): boolean` - shoes, bags, cosmetics
  - `isOffTopic(message: string): boolean` - reuse v2.1 logic

- [x] 1.5 Implement `hasSufficientInfo()` method
  - Check: gender + occasion present (for CLOTHS)
  - Special case: OTHER category doesn't need gender
  - Return boolean indicating if ready to recommend

- [x] 1.6 Implement `detectMissingInfo()` method
  - Return array of missing fields: ['gender', 'occasion', 'destination']
  - Check each field against userInfo and message detection
  - Prioritize in order: gender → occasion → destination → budget

- [x] 1.7 Implement `getNextClarification()` method
  - Filter out already-asked questions from clarificationHistory
  - Select next question by priority order
  - Return `{ type, question }` or null

- [x] 1.8 Implement `getClarificationQuestion()` method
  - Map question types to Thai question strings
  - gender: "อยากหาชุดผู้หญิงหรือผู้ชายคะ? 👔👗"
  - occasion: "ชุดนี้เอาไว้ใส่โอกาสไหนคะ? ไปทำงาน เดท หรือไปเที่ยวงานสังสรรค์? 🎉"
  - destination: "ไปเที่ยวที่ไหนคะ? อากาศร้อนหรือหนาวเหรอคะ? 🌴❄️"
  - budget: "มีงบประมาณช่วงไหนมั้ยคะ? จะได้แนะนำให้เหมาะสม 💰"

**Acceptance Criteria:**
- ✅ State machine correctly identifies when to clarify vs recommend
- ✅ Post-recommendation lockout enforced (hasProvidedRecommendations flag works)
- ✅ Force recommendation after 2 clarifications
- ✅ Helper methods accurately detect gender, occasion from Thai text
- ✅ All methods have TypeScript type safety

**Testing Checklist:**
- [ ] Test with empty state → should ask for missing info
- [ ] Test with complete info → should recommend
- [ ] Test after 2 clarifications → must force recommendation
- [ ] Test after recommendations provided → must recommend only (lockout)
- [ ] Test off-topic detection → should redirect

---

### ✅ Parent Task 2: Response Validator Creation [COMPLETED]
**Owner:** Dev Team
**Priority:** P0 (Critical)
**Dependencies:** None
**Estimated Time:** 1 day
**Actual Time:** Completed
**Commit:** a3ee5da (frontend submodule)

**Sub-tasks:**
- [x] 2.1 Create file: `frontend/lib/conversation/validation.ts`
  - Define `ValidationResult` interface: `{ isValid, errors }`
  - Set up `ResponseValidator` class

- [x] 2.2 Implement `validate()` method
  - Accept parameters: `response: string`, `expectedMode: ResponseMode`
  - Call `containsQuestion()` and `containsProductLinks()` helpers
  - Return validation result based on mode

- [x] 2.3 Implement validation logic for CLARIFICATION mode (FR-3.1)
  - Must have: question mark or question keywords (มั้ย, ไหม, หรือ)
  - Must NOT have: product links, prices (💰), URLs (http, 🔗)
  - Return error if contains products: "CLARIFICATION mode must NOT contain products"

- [x] 2.4 Implement validation logic for RECOMMENDATION mode (FR-3.2)
  - Must have: product links/prices (💰 ราคา, 🔗, http)
  - Must NOT have: question marks, question keywords
  - Return error if contains questions: "RECOMMENDATION mode must NOT contain questions"

- [x] 2.5 Implement validation logic for REDIRECT mode
  - Must NOT have: questions or product links
  - Should only contain redirect message

- [x] 2.6 Implement `containsQuestion()` helper
  - Check for: '?', 'มั้ย', 'ไหม', 'หรือ', 'คะ?', 'ค่ะ?'
  - Return boolean

- [x] 2.7 Implement `containsProductLinks()` helper
  - Check for: 'http', '💰 ราคา', '🔗', 'บาท'
  - Return boolean

**Acceptance Criteria:**
- ✅ Correctly validates CLARIFICATION responses (question only, no products)
- ✅ Correctly validates RECOMMENDATION responses (products only, no questions)
- ✅ Returns clear error messages for debugging
- ✅ All edge cases covered (question at end of product list, etc.)

**Testing Checklist:**
- [ ] CLARIFICATION with question, no products → valid
- [ ] CLARIFICATION with products → invalid
- [ ] RECOMMENDATION with products, no questions → valid
- [ ] RECOMMENDATION with question after products → invalid
- [ ] REDIRECT with plain message → valid

---

### ✅ Parent Task 3: System Prompt v3.0 Development [COMPLETED]
**Owner:** Dev Team + PM
**Priority:** P0 (Critical)
**Dependencies:** None
**Estimated Time:** 2 days
**Actual Time:** Completed
**Commit:** 20e4055 (frontend submodule)

**Sub-tasks:**
- [x] 3.1 Create file: `frontend/lib/prompts/system-prompt-v3.ts`
  - Set up file structure with metadata export
  - Import v2.1 content as baseline

- [x] 3.2 Add "CRITICAL: CONVERSATION FLOW STATE MACHINE" section
  - Explain the 3 exclusive modes: CLARIFICATION, RECOMMENDATION, REDIRECT
  - Emphasize: "You MUST operate in ONE mode per response"

- [x] 3.3 Define STATE 1: CLARIFICATION MODE section
  - **WHEN TO USE**: Missing critical info, <2 clarifications asked, no recommendations yet
  - **WHAT TO DO**: Ask ONE question, be friendly, use emoji
  - **STRICT RULES**: ❌ NO products, ❌ NO recommendations, ❌ NO styling tips
  - **EXAMPLE**: Show good example from PRD (งานบวช → ask gender only)
  - **STOP INSTRUCTION**: [STOP HERE - NO PRODUCTS]

- [x] 3.4 Define STATE 2: RECOMMENDATION MODE section
  - **WHEN TO USE**: Have critical info, OR 2 clarifications asked, OR already recommended
  - **WHAT TO DO**: Provide 3-5 products, styling tips, encouraging close
  - **STRICT RULES**: ❌ NO questions, ❌ NO confirmation, ❌ NO "อยากดู..."
  - **EXAMPLE**: Show good example (ผู้ชาย answer → full recommendations)
  - **STOP INSTRUCTION**: [STOP HERE - NO QUESTIONS]

- [x] 3.5 Define STATE 3: REDIRECT MODE section
  - **WHEN TO USE**: Off-topic query detected
  - **WHAT TO DO**: Use redirect templates from v2.1

- [x] 3.6 Add "CONVERSATION FLOW TRACKER" section
  - Show ConversationState TypeScript interface
  - Explain: clarificationsAsked (max 2), hasProvidedRecommendations, userInfo

- [x] 3.7 Add "DECISION LOGIC FLOWCHART" section
  - Step-by-step decision tree for every user message
  - 1. Off-topic? → REDIRECT
  - 2. hasProvidedRecommendations? → RECOMMENDATION (lockout)
  - 3. clarificationsAsked >= 2? → RECOMMENDATION (force)
  - 4. Have gender + occasion? → RECOMMENDATION
  - 5. Missing critical info? → CLARIFICATION
  - 6. Default → RECOMMENDATION

- [x] 3.8 Add "CLARIFICATION PRIORITY ORDER" section
  - List: Gender (HIGH) → Occasion (HIGH) → Destination (MEDIUM) → Budget (LOW)
  - Include skip conditions for each

- [x] 3.9 Add "POST-RECOMMENDATION LOCKOUT" section
  - **CRITICAL RULE**: Once products shown, CANNOT ask questions
  - Show FORBIDDEN pattern (ask after products) ❌
  - Show CORRECT pattern (no questions after products) ✅

- [x] 3.10 Add "VALIDATION CHECKPOINT" section
  - Checklist for CLARIFICATION mode
  - Checklist for RECOMMENDATION mode
  - Instruction: "If validation fails: Regenerate response in correct mode"

- [x] 3.11 Migrate all v2.1 content
  - Copy "Friendly Tone" section (unchanged)
  - Copy "Duplicate Prevention" section (unchanged)
  - Copy "Topic Guardrails" section (unchanged)
  - Copy "Category-Specific Responses" (DialogTemplate14-2)
  - Copy "Template A" and "Template B" formats

- [x] 3.12 Add anti-pattern examples
  - v2.1 BROKEN example: Shows products then asks questions
  - v3.0 FIXED example: Asks questions first, then shows products
  - Highlight differences with ❌ WRONG and ✅ CORRECT labels

- [x] 3.13 Update metadata
  - Version: "3.0 - Conversation Flow Fix"
  - Previous Version: "2.1 - Loop Prevention"
  - Major Change: "Strict state machine enforcement, post-recommendation lockout"
  - Last Updated: current date

**Acceptance Criteria:**
- ✅ Prompt clearly explains 3 exclusive states
- ✅ Examples show correct vs incorrect patterns
- ✅ Post-recommendation lockout emphasized multiple times
- ✅ All v2.1 features maintained (tone, duplicates, guardrails)
- ✅ Validation checkpoint included
- ✅ Prompt is actionable and unambiguous

**Review Checklist:**
- [ ] PM review: Tone and examples are clear
- [ ] Dev review: Technical accuracy
- [ ] QA review: Testability
- [ ] Stakeholder review: Business requirements met

---

### ✅ Parent Task 4: Prompt Support Files [COMPLETED]
**Owner:** Dev Team
**Priority:** P1 (High)
**Dependencies:** Task 3
**Estimated Time:** 0.5 day
**Actual Time:** Completed
**Commit:** 239b44d (frontend submodule)

**Sub-tasks:**
- [x] 4.1 Create file: `frontend/lib/prompts/state-machine-examples.ts`
  - Export object with good/bad conversation examples
  - Include examples from PRD Section 7.2
  - BROKEN example: งานบวช conversation (v2.1)
  - FIXED example: งานบวช conversation (v3.0)
  - Direct recommendation example (sufficient info upfront)
  - Force recommendation example (after 2 clarifications)

- [x] 4.2 Create file: `frontend/lib/prompts/prompt-version.ts`
  - Export `PROMPT_VERSION` constant: 'v3.0'
  - Export `PREVIOUS_VERSION` constant: 'v2.1'
  - Export function `getSystemPrompt(version: string): string`
  - Support switching between v2.1 and v3.0 for A/B testing

- [x] 4.3 Update TypeScript types
  - Add to `frontend/lib/types/chat-types.ts`:
    - `type PromptVersion = 'v2.1' | 'v3.0'`
    - Update exports

**Acceptance Criteria:**
- ✅ Examples are comprehensive and illustrative
- ✅ Version management supports A/B testing
- ✅ Types are properly defined

---

### ✅ Parent Task 5: Unit Test Suite - State Machine
**Owner:** Dev Team
**Priority:** P0 (Critical)
**Dependencies:** Tasks 1, 2
**Estimated Time:** 1 day

**Sub-tasks:**
- [ ] 5.1 Create test file: `frontend/lib/conversation/__tests__/state-machine.test.ts`
  - Set up test framework (Jest/Vitest)
  - Create helper functions: `createEmptyState()`, `createStateWithInfo()`

- [ ] 5.2 Write test: "should decide CLARIFICATION mode when missing gender"
  - Given: Empty state, message "หาชุดไปทำงาน"
  - When: Call decideMode()
  - Then: Returns 'CLARIFICATION'

- [ ] 5.3 Write test: "should decide RECOMMENDATION mode when has all info"
  - Given: State with gender='women', occasion='work'
  - When: Call decideMode()
  - Then: Returns 'RECOMMENDATION'

- [ ] 5.4 Write test: "should force RECOMMENDATION mode after 2 clarifications"
  - Given: State with clarificationsAsked=2
  - When: Call decideMode()
  - Then: Returns 'RECOMMENDATION' (even with missing info)

- [ ] 5.5 Write test: "should always use RECOMMENDATION mode after providing products" (POST-RECOMMENDATION LOCKOUT)
  - Given: State with hasProvidedRecommendations=true, missing occasion
  - When: User asks "มีอื่นมั้ย"
  - Then: Returns 'RECOMMENDATION' (lockout active, no questions)

- [ ] 5.6 Write test: "should detect REDIRECT mode for off-topic query"
  - Given: Empty state, message "แนะนำร้านอาหารหน่อย"
  - When: Call decideMode()
  - Then: Returns 'REDIRECT'

- [ ] 5.7 Write test: "detectGender should find gender keywords"
  - Test: "หาชุดผู้หญิง" → true
  - Test: "ชุดผู้ชาย" → true
  - Test: "หาชุด" → false

- [ ] 5.8 Write test: "detectOccasion should find occasion keywords"
  - Test: "ไปทำงาน" → true
  - Test: "งานแต่ง" → true
  - Test: "หาชุด" → false

- [ ] 5.9 Write test: "detectMissingInfo returns correct missing fields"
  - Given: Empty state
  - Then: Returns ['gender', 'occasion']

- [ ] 5.10 Write test: "getNextClarification respects priority order"
  - Given: Missing both gender and occasion
  - When: Call getNextClarification()
  - Then: Returns gender question (higher priority)

- [ ] 5.11 Write test: "getNextClarification never returns already-asked question"
  - Given: Gender question already in clarificationHistory
  - When: Call getNextClarification(['gender', 'occasion'])
  - Then: Returns occasion question (skips gender)

- [ ] 5.12 Create test file: `frontend/lib/conversation/__tests__/validation.test.ts`

- [ ] 5.13 Write test: "CLARIFICATION mode validation passes with question, no products"
  - Given: "อยากหาชุดผู้หญิงหรือผู้ชายคะ? 👔👗"
  - When: validate(response, 'CLARIFICATION')
  - Then: isValid=true, errors=[]

- [ ] 5.14 Write test: "CLARIFICATION mode validation fails if contains products"
  - Given: Response with question AND products (💰 ราคา, 🔗)
  - When: validate(response, 'CLARIFICATION')
  - Then: isValid=false, error includes "must NOT contain products"

- [ ] 5.15 Write test: "RECOMMENDATION mode validation passes with products, no questions"
  - Given: Response with products, no question marks
  - When: validate(response, 'RECOMMENDATION')
  - Then: isValid=true

- [ ] 5.16 Write test: "RECOMMENDATION mode validation fails if contains questions"
  - Given: Response with products AND question at end
  - When: validate(response, 'RECOMMENDATION')
  - Then: isValid=false, error includes "must NOT contain questions"

- [ ] 5.17 Achieve 90%+ code coverage
  - Run coverage report
  - Identify uncovered branches
  - Add tests for edge cases

**Acceptance Criteria:**
- ✅ All tests passing
- ✅ 90%+ code coverage for state-machine.ts and validation.ts
- ✅ Tests cover all critical flows from PRD
- ✅ Tests are deterministic and fast (<100ms per test)

**Coverage Target:**
- `state-machine.ts`: 90%+
- `validation.ts`: 95%+

---

## PHASE 2: Week 2 - Integration & Context Management (Days 6-10)

### ✅ Parent Task 6: Context Manager Enhancement
**Owner:** Dev Team
**Priority:** P0 (Critical)
**Dependencies:** Task 1
**Estimated Time:** 2 days

**Sub-tasks:**
- [ ] 6.1 Create file: `frontend/lib/conversation/context-manager.ts`
  - Import ConversationState, ResponseMode types
  - Set up ConversationContextManager class

- [ ] 6.2 Implement `updateContext()` method (FR-4.2)
  - Accept: currentState, userMessage
  - Call extractUserInfo() to parse message
  - Merge extracted info into state.userInfo
  - Check if user answered pending clarification
  - Return updated ConversationState

- [ ] 6.3 Implement `extractUserInfo()` method
  - Parse gender: ผู้หญิง, ผู้ชาย, women, men → set userInfo.gender
  - Parse occasion: ทำงาน, งานแต่ง, เดท → set userInfo.occasion
  - Parse budget: regex for numbers + บาท → set userInfo.budget
  - Parse destination: location names → set userInfo.destination
  - Return Partial<UserInfo>

- [ ] 6.4 Implement `detectAnswerToQuestion()` method (FR-4.3)
  - Check if userMessage answers the last unanswered clarification
  - For gender question: Check for gender keywords
  - For occasion question: Check for occasion keywords or short response
  - For destination question: Check for location names
  - Return parsed answer or null

- [ ] 6.5 Implement `getLastUnansweredClarification()` helper
  - Filter clarificationHistory for entries without answer
  - Sort by timestamp descending
  - Return most recent unanswered clarification

- [ ] 6.6 Implement `updateContextAfterResponse()` method
  - Accept: currentState, mode, response
  - If mode=CLARIFICATION: increment clarificationsAsked
  - If mode=CLARIFICATION: detect question type, add to clarificationHistory
  - If mode=RECOMMENDATION: set hasProvidedRecommendations=true
  - If mode=RECOMMENDATION: extract product IDs, add to recommendedProductIds
  - Return updated ConversationState

- [ ] 6.7 Implement `detectQuestionType()` helper
  - Parse response to identify question type
  - "ผู้หญิงหรือผู้ชาย" → 'gender'
  - "โอกาสไหน" → 'occasion'
  - "ไปเที่ยวที่ไหน" → 'destination'
  - "งบประมาณ" → 'budget'
  - Return question type or null

- [ ] 6.8 Implement `extractProductIds()` helper
  - Parse response for product IDs/SKUs
  - Regex: /\[ID:\s*([A-Z0-9-]+)\]/g
  - Return array of product IDs

- [ ] 6.9 Add context update rules (FR-4.2)
  - After user message: parse info, check answers, update userInfo
  - After AI response: increment counters, track questions, extract products

**Acceptance Criteria:**
- ✅ Correctly extracts gender, occasion, budget from Thai messages
- ✅ Detects when user has answered a clarification question
- ✅ Never asks same question twice (checks clarificationHistory)
- ✅ Properly updates clarificationHistory and recommendedProductIds
- ✅ hasProvidedRecommendations flag set correctly

**Testing Checklist:**
- [ ] Extract "ผู้หญิง" from message → gender='women'
- [ ] Detect answer to gender question → marks as answered
- [ ] After AI asks question → clarificationsAsked increments
- [ ] After AI shows products → hasProvidedRecommendations=true

---

### ✅ Parent Task 7: Answer Recognition System
**Owner:** Dev Team
**Priority:** P1 (High)
**Dependencies:** Task 6
**Estimated Time:** 1 day

**Sub-tasks:**
- [ ] 7.1 Create file: `frontend/lib/conversation/answer-recognition.ts`
  - Set up keyword arrays for each question type
  - Export recognition functions

- [ ] 7.2 Implement gender answer recognition
  - Keywords: ['ผู้หญิง', 'ผู้ชาย', 'women', 'men', 'ชาย', 'หญิง']
  - Return: { gender: 'women' | 'men' } or null

- [ ] 7.3 Implement occasion answer recognition
  - Keywords: ['ทำงาน', 'งานแต่ง', 'เดท', 'เที่ยว', 'party', 'work', 'wedding', 'date']
  - Short message heuristic: if message.length < 30, likely answering occasion
  - Return: { occasion: string } or null

- [ ] 7.4 Implement destination answer recognition
  - Keywords: location names, country names
  - Thai locations: กรุงเทพ, เชียงใหม่, ภูเก็ต, etc.
  - International: Japan, Korea, Europe, etc.
  - Return: { destination: string } or null

- [ ] 7.5 Implement budget answer recognition
  - Regex: /(\d{3,5})\s*(?:บาท|\$|baht)/i
  - Parse number value
  - Return: { budget: number } or null

- [ ] 7.6 Handle edge cases
  - Conflicting information: use most recent
  - Ambiguous answers: log for monitoring
  - English vs Thai: support both

**Acceptance Criteria:**
- ✅ Recognizes Thai and English answers
- ✅ Handles short responses appropriately
- ✅ Returns structured data for easy merging

---

### ✅ Parent Task 8: AI Chat Service Integration
**Owner:** Dev Team
**Priority:** P0 (Critical)
**Dependencies:** Tasks 1, 2, 3, 6
**Estimated Time:** 2 days

**Sub-tasks:**
- [ ] 8.1 Update `frontend/lib/services/ai-chat-service.ts`
  - Import: ConversationStateMachine, ResponseValidator, ConversationContextManager
  - Import: SYSTEM_PROMPT_V3

- [ ] 8.2 Add class properties
  - `private stateMachine = new ConversationStateMachine()`
  - `private contextManager = new ConversationContextManager()`
  - `private validator = new ResponseValidator()`

- [ ] 8.3 Update `sendMessage()` method signature
  - Add parameter: `conversationState: ConversationState`
  - Return: `{ message, mode, conversationState }`

- [ ] 8.4 Implement conversation flow in `sendMessage()` (FR-3.3)
  - Step 1: Update context with user message
  - Step 2: Decide response mode (stateMachine.decideMode())
  - Step 3: Prepare system prompt with state context
  - Step 4: Call AI API (OpenRouter)
  - Step 5: Validate response matches expected mode
  - Step 6: If validation fails, regenerate response
  - Step 7: Update context after AI response
  - Step 8: Return response + updated state

- [ ] 8.5 Implement `prepareSystemPrompt()` method
  - Start with SYSTEM_PROMPT_V3 base
  - Append "CURRENT CONVERSATION STATE" section
  - Show: clarificationsAsked, hasProvidedRecommendations
  - Show: userInfo collected (gender, occasion, budget)
  - Append "REQUIRED MODE FOR THIS RESPONSE" section
  - If CLARIFICATION: Add strict "You MUST ask question, NO products" instruction
  - If RECOMMENDATION: Add strict "You MUST show products, NO questions" instruction
  - If duplicate prevention: Append recommendedProductIds list
  - Return complete prompt

- [ ] 8.6 Implement validation and regeneration logic
  - Call validator.validate(response, expectedMode)
  - If isValid=false: log validation errors
  - Regenerate response with stricter instructions
  - Add to prompt: "PREVIOUS ATTEMPT FAILED. [error messages]. TRY AGAIN."
  - Limit: 1 regeneration attempt
  - If still fails: return graceful error

- [ ] 8.7 Implement `regenerateResponse()` method
  - Accept: systemPrompt, messages, userMessage, mode, validationErrors
  - Append validation errors to prompt
  - Make 2nd API call with stronger emphasis
  - Return regenerated response

- [ ] 8.8 Update conversation state tracking
  - Call contextManager.updateContext() before deciding mode
  - Call contextManager.updateContextAfterResponse() after AI responds
  - Ensure state is passed through entire flow

- [ ] 8.9 Add logging for debugging
  - Log: decided mode for each turn
  - Log: validation results
  - Log: regeneration triggers
  - Log: state transitions

**Acceptance Criteria:**
- ✅ State machine integrated and working
- ✅ Validation catches mixed-mode responses
- ✅ Regeneration improves response quality
- ✅ Context tracking maintains conversation state
- ✅ No breaking changes to existing API

**Integration Points:**
- `callOpenRouter()` method (existing)
- Conversation history management (existing)
- Error handling (existing)

---

### ✅ Parent Task 9: OpenRouter Client Update
**Owner:** Dev Team
**Priority:** P1 (High)
**Dependencies:** Task 3
**Estimated Time:** 0.5 day

**Sub-tasks:**
- [ ] 9.1 Update `frontend/lib/openrouter-client.ts`
  - Import SYSTEM_PROMPT_V3
  - Import prompt-version utilities

- [ ] 9.2 Add version parameter to `getSystemPrompt()` method
  - Accept: version: 'v2.1' | 'v3.0' = 'v3.0'
  - Switch statement returns appropriate prompt
  - Default: v3.0

- [ ] 9.3 Add environment variable for A/B testing
  - Check: `process.env.SYSTEM_PROMPT_VERSION`
  - If set to 'v2.1': use old prompt
  - If set to 'v3.0' or unset: use new prompt
  - Allows easy rollback

- [ ] 9.4 Update method calls
  - Pass version parameter where needed
  - Ensure backward compatibility

**Acceptance Criteria:**
- ✅ Can switch between v2.1 and v3.0 via env variable
- ✅ Default is v3.0
- ✅ No breaking changes

---

## PHASE 3: Week 3 - Testing & Beta Deployment (Days 11-15)

### ✅ Parent Task 10: Integration Test Suite
**Owner:** QA + Dev Team
**Priority:** P0 (Critical)
**Dependencies:** Tasks 8, 9
**Estimated Time:** 2 days

**Sub-tasks:**
- [ ] 10.1 Create test file: `frontend/__tests__/integration/conversation-flow-v3.test.ts`
  - Set up test environment
  - Mock OpenRouter API responses
  - Create helper: `createMockChatService()`

- [ ] 10.2 Write test: "CRITICAL: Should NOT ask questions after showing products" (Screenshot Issue)
  - Turn 1: User "งานบวช" → AI asks gender (CLARIFICATION)
  - Verify: mode='CLARIFICATION', no products in response
  - Turn 2: User "ผู้ชาย" → AI shows products (RECOMMENDATION)
  - Verify: mode='RECOMMENDATION', has products, NO questions
  - Turn 3: User "มีอื่นมั้ย" → AI shows different products (RECOMMENDATION)
  - Verify: mode='RECOMMENDATION', no questions, different products
  - Verify: Gender question asked only once (check clarificationHistory)

- [ ] 10.3 Write test: "Should force recommendation after 2 clarifications even with vague info"
  - Turn 1: User "หาชุด" → AI asks gender (Clarification 1)
  - Verify: clarificationsAsked=1
  - Turn 2: User "ผู้หญิง" → AI asks occasion (Clarification 2)
  - Verify: clarificationsAsked=2
  - Turn 3: User "ก็ธรรมดา" → AI MUST show products (Force Recommendation)
  - Verify: mode='RECOMMENDATION', has products, NO 3rd question
  - Verify: Products are varied (covers multiple styles)

- [ ] 10.4 Write test: "Should recommend immediately when user provides all info upfront"
  - Turn 1: User "หาชุดผู้หญิงไปงานแต่งงาน งบ 5000"
  - Verify: mode='RECOMMENDATION' (no clarification needed)
  - Verify: clarificationsAsked=0
  - Verify: Has products within budget
  - Verify: No questions asked

- [ ] 10.5 Write test: "Post-recommendation lockout enforcement"
  - Turn 1-2: Complete clarification + recommendation flow
  - Turn 3: User asks for more options
  - Verify: AI continues to ONLY recommend (no questions)
  - Verify: hasProvidedRecommendations=true throughout
  - Turn 4: User asks for different style
  - Verify: Still ONLY recommends (lockout remains active)

- [ ] 10.6 Write test: "Context memory across turns"
  - Turn 1: User says "ผู้หญิง"
  - Verify: userInfo.gender='women' stored
  - Turn 2: Request outfit
  - Verify: AI doesn't ask gender again
  - Verify: Recommendations are for women's clothing

- [ ] 10.7 Write test: "Duplicate product prevention"
  - Turn 1: Get recommendations (products A, B, C)
  - Verify: recommendedProductIds = [A, B, C]
  - Turn 2: Ask for more options
  - Verify: New recommendations (products D, E, F)
  - Verify: recommendedProductIds = [A, B, C, D, E, F]
  - Verify: No duplicates (A, B, C not shown again)

- [ ] 10.8 Write test: "Off-topic queries properly redirected"
  - Turn 1: User "แนะนำร้านอาหารหน่อย"
  - Verify: mode='REDIRECT'
  - Verify: Response contains redirect message
  - Verify: No products shown, no fashion questions asked

- [ ] 10.9 Write test: "Validation catches and fixes mixed-mode responses"
  - Mock AI returns: products + question (invalid)
  - Verify: Validation detects error
  - Verify: Regeneration triggered
  - Verify: 2nd attempt returns valid response

- [ ] 10.10 Run all integration tests
  - Verify: All tests pass
  - Verify: Total test time <5 seconds
  - Verify: Tests are deterministic (no flakiness)

**Acceptance Criteria:**
- ✅ Screenshot issue test passes (critical)
- ✅ All 9 integration tests passing
- ✅ Tests cover all critical user journeys from PRD
- ✅ Tests catch regression issues

---

### ✅ Parent Task 11: Manual QA Checklist Execution
**Owner:** QA Team
**Priority:** P0 (Critical)
**Dependencies:** Task 10
**Estimated Time:** 1 day

**Sub-tasks:**
- [ ] 11.1 Execute Critical Test Cases (from PRD Section 10.3)
  - [ ] TC-1: AI never shows products then asks clarification questions ✅
  - [ ] TC-2: AI never asks same question twice in one conversation ✅
  - [ ] TC-3: After showing recommendations, AI only provides more recommendations (no questions) ✅
  - [ ] TC-4: Clarifications always come before recommendations ✅
  - [ ] TC-5: Maximum 2 clarifications asked before forcing recommendation ✅
  - [ ] TC-6: AI remembers user answers (gender, occasion) across turns ✅
  - [ ] TC-7: Duplicate products never appear in same conversation ✅
  - [ ] TC-8: Off-topic queries properly redirected ✅

- [ ] 11.2 Execute Edge Case Test Cases
  - [ ] TC-9: User provides conflicting information (AI uses most recent) ✅
  - [ ] TC-10: User changes mind mid-conversation (e.g., "actually, men's outfit") ✅
  - [ ] TC-11: User types very short responses ("ok", "ใช่", "yes") ✅
  - [ ] TC-12: User types in English instead of Thai ✅
  - [ ] TC-13: User provides partial information in follow-up ✅
  - [ ] TC-14: Rapid-fire questions from user (multiple messages quickly) ✅
  - [ ] TC-15: User asks for OTHER category (tips/tricks) - should not ask gender ✅

- [ ] 11.3 Execute Regression Test Cases
  - [ ] TC-16: Friendly tone maintained across all responses ✅
  - [ ] TC-17: Template A structure correct for CLOTHS ✅
  - [ ] TC-18: Template B structure correct for OTHER categories ✅
  - [ ] TC-19: Styling tips included and relevant ✅
  - [ ] TC-20: Product links valid and correct ✅
  - [ ] TC-21: Emoji usage appropriate and not excessive ✅
  - [ ] TC-22: Thai language natural and conversational ✅

- [ ] 11.4 Document test results
  - Create test report: `qa-report-v3.0-manual-testing.md`
  - For each test: PASS/FAIL, notes, screenshots
  - Categorize failures by severity: P0 (blocking), P1 (high), P2 (medium)

- [ ] 11.5 Fix identified issues
  - Create bug tickets for all failures
  - Prioritize P0 and P1 issues
  - Fix critical issues before beta

- [ ] 11.6 Re-test after fixes
  - Verify all P0 issues resolved
  - Re-run failed test cases
  - Update test report

**Acceptance Criteria:**
- ✅ All 8 critical test cases pass (must be 100%)
- ✅ >90% of edge case tests pass
- ✅ >95% of regression tests pass (maintain v2.1 quality)
- ✅ All P0 bugs fixed
- ✅ Test report completed and reviewed

**Deliverable:**
- Test report with pass/fail status for all 22 test cases
- Bug list with severity and status

---

### ✅ Parent Task 12: Internal Alpha Testing
**Owner:** Product Team + Dev Team
**Priority:** P0 (Critical)
**Dependencies:** Task 11
**Estimated Time:** 2-3 days

**Sub-tasks:**
- [ ] 12.1 Deploy v3.0 to test environment
  - Update test environment with latest code
  - Set SYSTEM_PROMPT_VERSION=v3.0
  - Verify deployment successful
  - Smoke test: basic conversation flow works

- [ ] 12.2 Create alpha testing guide
  - Document: How to access test environment
  - List: Key scenarios to test (10-15 scenarios)
  - Provide: Feedback form/template
  - Examples: Expected behavior for each scenario

- [ ] 12.3 Conduct team testing session (2-3 days)
  - All team members test for 30-60 minutes
  - Test various user personas:
    - Fashion-Curious (15-28)
    - Fashion-Struggling (18-35)
    - Special Occasions (25-45)
  - Try to break the system (adversarial testing)
  - Document any unexpected behaviors

- [ ] 12.4 Collect qualitative feedback
  - Survey questions:
    - Does conversation flow feel natural? (1-5 scale)
    - Were clarification questions helpful or annoying? (1-5)
    - Did you notice any repeated questions? (Y/N)
    - Did you see questions after product recommendations? (Y/N)
    - Overall satisfaction vs. old version? (better/same/worse)
    - Open comments
  - Compile responses in feedback report

- [ ] 12.5 Identify critical bugs
  - Bug priority: Any issue that violates core requirements
    - P0: Post-recommendation clarifications
    - P0: Repeated questions
    - P0: Mixed-mode responses
  - Create bug tickets
  - Assign to dev team

- [ ] 12.6 Fix critical issues
  - Fix all P0 bugs
  - Retest after fixes
  - Update code and redeploy to test

- [ ] 12.7 Go/No-Go decision
  - Review: All critical bugs fixed?
  - Review: Feedback positive overall?
  - Review: Team confident in beta deployment?
  - Decision: Proceed to beta OR iterate more

**Acceptance Criteria:**
- ✅ All team members completed alpha testing
- ✅ Feedback report compiled
- ✅ Zero P0 bugs remaining
- ✅ Team approves beta deployment

**Deliverable:**
- Alpha testing feedback report
- List of identified issues (with resolution status)
- Go/No-Go recommendation

---

### ✅ Parent Task 13: Beta Deployment (10% users)
**Owner:** Dev Team + DevOps
**Priority:** P0 (Critical)
**Dependencies:** Task 12
**Estimated Time:** 1 day setup + 2-3 days monitoring

**Sub-tasks:**
- [ ] 13.1 Set up A/B testing infrastructure
  - Implement user segmentation (10% beta, 90% control)
  - Use user ID hashing or feature flag service
  - Ensure consistent assignment (same user always gets same version)
  - Log which version each user sees

- [ ] 13.2 Configure traffic split
  - Environment variable: `SYSTEM_PROMPT_VERSION`
  - 10% of requests: v3.0 (beta group)
  - 90% of requests: v2.1 (control group)
  - Verify split is working correctly

- [ ] 13.3 Deploy to production (beta mode)
  - Deploy code with A/B testing logic
  - Verify deployment health
  - Check: Both v2.1 and v3.0 paths working
  - Smoke test: Sample conversations from both groups

- [ ] 13.4 Set up real-time monitoring
  - Monitor: Error rates (beta vs control)
  - Monitor: Response latency (beta vs control)
  - Monitor: User engagement (messages per session)
  - Alert: If error rate >5% in beta group
  - Alert: If latency >3s in beta group

- [ ] 13.5 Monitor for 2-3 days
  - Day 1: Hourly checks, watch for immediate issues
  - Day 2-3: Daily checks, collect metrics
  - Watch: No spike in errors or user complaints

**Acceptance Criteria:**
- ✅ A/B test deployed successfully
- ✅ 10% of users seeing v3.0
- ✅ No errors or crashes in beta group
- ✅ Metrics showing healthy performance

**Rollback Plan:**
- If critical issues: Set SYSTEM_PROMPT_VERSION=v2.1 for all users
- Rollback time: <5 minutes

---

### ✅ Parent Task 14: Metrics & Monitoring Setup
**Owner:** Dev Team + Data Team
**Priority:** P0 (Critical)
**Dependencies:** Task 13
**Estimated Time:** 1 day

**Sub-tasks:**
- [ ] 14.1 Implement M1: Post-recommendation clarification tracking
  - Log: conversation_id, turn_number, ai_message, mode
  - Detect pattern: [turn N has products] → [turn N+1 has question]
  - Metric: % of conversations with post-recommendation clarifications
  - Target: 0%

- [ ] 14.2 Implement M2: Turns-to-recommendation metric
  - Log: conversation_id, first_recommendation_turn
  - Calculate: Average turns before first product recommendation
  - Baseline (v2.1): ~3-4 turns
  - Target (v3.0): 2-3 turns (30% reduction)

- [ ] 14.3 Implement M3: Question repetition detection
  - Log: conversation_id, clarification_history
  - Detect: Same question type asked twice
  - Metric: % of conversations with repeated questions
  - Target: 0%

- [ ] 14.4 Implement M4: State transition accuracy logging
  - Log: conversation_id, turn_number, decided_mode, actual_mode
  - Actual mode: Parse AI response to determine if CLARIFICATION or RECOMMENDATION
  - Metric: % of correct state transitions (decided matches actual)
  - Target: 99%+

- [ ] 14.5 Implement V1: Validation failure tracking
  - Log: conversation_id, validation_errors, regeneration_triggered
  - Metric: % of responses failing validation
  - Target: <5%
  - Action: If >10%, review prompt clarity

- [ ] 14.6 Implement V2: Context tracking accuracy
  - Test scenarios: Automated checks for context memory
  - Check: Gender remembered after being asked
  - Check: Occasion remembered across turns
  - Metric: % of context tracking test cases passing
  - Target: 100%

- [ ] 14.7 Implement V3: Duplicate prevention effectiveness
  - Log: conversation_id, recommended_products_per_turn
  - Detect: Same product ID appearing multiple times
  - Metric: % of conversations with duplicate products
  - Target: <1%

- [ ] 14.8 Create monitoring dashboard
  - Tool: Grafana, Datadog, or internal analytics platform
  - Panels for M1-M4 metrics (primary)
  - Panels for V1-V3 metrics (validation)
  - Comparison: Beta (v3.0) vs Control (v2.1)
  - Real-time updates (5-minute refresh)

- [ ] 14.9 Set up alerts
  - Alert: M1 (post-recommendation clarifications) >0% → P0 alert
  - Alert: M3 (repeated questions) >0% → P0 alert
  - Alert: M4 (state accuracy) <95% → P1 alert
  - Alert: V1 (validation failures) >10% → P1 alert
  - Notification: Slack channel + Email

**Acceptance Criteria:**
- ✅ All 7 metrics implemented and logging
- ✅ Dashboard live and accessible to team
- ✅ Alerts configured and tested
- ✅ Baseline metrics captured for v2.1 (control group)

**Deliverable:**
- Metrics dashboard URL
- Alert configuration document

---

## PHASE 4: Week 4 - Gradual Rollout & Monitoring (Days 16-20)

### ✅ Parent Task 15: Gradual Rollout Execution
**Owner:** Dev Team + Product Manager
**Priority:** P0 (Critical)
**Dependencies:** Tasks 13, 14
**Estimated Time:** 5 days

**Sub-tasks:**
- [ ] 15.1 Review beta metrics (before expanding rollout)
  - Check M1: Post-recommendation clarifications = 0% ✅
  - Check M2: Turns-to-recommendation reduced ✅
  - Check M3: Question repetition = 0% ✅
  - Check M4: State transition accuracy >99% ✅
  - Check V1: Validation failure rate <5% ✅
  - Check: No increase in errors or crashes ✅
  - Check: User feedback neutral or positive ✅

- [ ] 15.2 Go/No-Go decision for 25% rollout
  - If all metrics pass: Proceed
  - If any critical metric fails: Hold, investigate, fix
  - Document decision and rationale

- [ ] 15.3 Day 1: Rollout to 25% of users
  - Update traffic split: 25% v3.0, 75% v2.1
  - Deploy configuration change
  - Verify: 25% of users seeing v3.0
  - Monitor for 6-8 hours
  - Check metrics: Any degradation?

- [ ] 15.4 Day 2: Monitor 25% rollout
  - Hourly metric checks
  - Watch for user complaints
  - Check error logs
  - If stable: Proceed to 50%

- [ ] 15.5 Day 3: Rollout to 50% of users
  - Update traffic split: 50% v3.0, 50% v2.1
  - Deploy configuration change
  - Monitor for 6-8 hours
  - Compare metrics: v3.0 vs v2.1

- [ ] 15.6 Day 4: Monitor 50% rollout
  - Continue monitoring
  - If metrics remain positive: Proceed to 75%

- [ ] 15.7 Day 5: Rollout to 75% of users
  - Update traffic split: 75% v3.0, 25% v2.1
  - Deploy configuration change
  - Monitor for 6-8 hours

- [ ] 15.8 Day 6-7: Monitor 75% rollout
  - Continue monitoring
  - If all metrics positive: Proceed to 100%

- [ ] 15.9 Day 7: Rollout to 100% of users
  - Update traffic split: 100% v3.0
  - Remove v2.1 path (keep code for emergency rollback)
  - Announce to team: v3.0 fully deployed
  - Continue monitoring

**Acceptance Criteria:**
- ✅ Successful rollout to 100% users
- ✅ No rollbacks required during gradual rollout
- ✅ All success metrics maintained throughout
- ✅ User feedback positive or neutral

**Rollback Triggers:**
- M1 (post-recommendation clarifications) >0%
- M3 (repeated questions) >0%
- Error rate increase >50%
- User complaints spike >2x baseline

**Rollback Procedure:**
- Immediate: Set traffic to 100% v2.1
- Investigate root cause
- Fix issue
- Restart gradual rollout

---

### ✅ Parent Task 16: Post-Deployment Monitoring
**Owner:** Dev Team + QA + Product Manager
**Priority:** P1 (High)
**Dependencies:** Task 15
**Estimated Time:** 2 weeks (ongoing)

**Sub-tasks:**
- [ ] 16.1 Daily metrics review (first week)
  - Review M1-M4 daily
  - Check for anomalies or trends
  - Compare to baseline (v2.1 historical data)
  - Document findings

- [ ] 16.2 Manual conversation review (first week)
  - Select 20 random conversations daily
  - Review for:
    - Conversation flow naturalness
    - Clarification question appropriateness
    - Product recommendation quality
    - Any mixed-mode responses
    - User satisfaction signals
  - Score each conversation: 1-5 scale
  - Calculate daily average quality score

- [ ] 16.3 Check validation failure rate
  - Review V1 metric: % of validation failures
  - Target: <5%
  - If >10%: Investigate prompt clarity issues
  - Review failed validation logs for patterns

- [ ] 16.4 Check context tracking accuracy
  - Run automated V2 tests daily
  - Check: Gender/occasion remembered across turns
  - Target: 100% accuracy
  - If <100%: Investigate context manager bugs

- [ ] 16.5 Collect user feedback
  - Monitor: Support tickets mentioning conversation issues
  - Monitor: User feedback form submissions
  - Monitor: Social media mentions (if applicable)
  - Categorize feedback: Positive, Neutral, Negative
  - Track: Feedback sentiment trend

- [ ] 16.6 Document issues and learnings
  - Create issue log: `v3.0-post-deployment-issues.md`
  - For each issue: Description, severity, status, resolution
  - Document learnings: What worked well, what didn't

- [ ] 16.7 Weekly metrics summary report
  - Week 1: Comprehensive report on all metrics
  - Week 2: Follow-up report, trend analysis
  - Share with stakeholders
  - Recommendations for further improvements

**Acceptance Criteria:**
- ✅ Metrics monitored daily for 2 weeks
- ✅ Manual reviews completed (20 convos/day for 7 days = 140 total)
- ✅ All metrics within target ranges
- ✅ Issues documented and addressed
- ✅ Weekly reports delivered to stakeholders

**Success Declaration Criteria:**
- All metrics stable for 2 weeks
- No critical issues reported
- User feedback positive or neutral
- Team confident in v3.0 stability

---

### ✅ Parent Task 17: Documentation & Wrap-up
**Owner:** Dev Team + PM
**Priority:** P2 (Medium)
**Dependencies:** Task 16
**Estimated Time:** 1 day

**Sub-tasks:**
- [ ] 17.1 Update system-prompt-v3.ts documentation
  - Add inline comments explaining each section
  - Document state machine logic
  - Document validation checkpoint
  - Include version history

- [ ] 17.2 Create migration guide: `v2.1-to-v3.0-migration.md`
  - Explain key changes from v2.1 to v3.0
  - How to initialize v3.0 state from v2.1 conversations
  - Handling existing in-progress conversations
  - Rollback procedure if needed

- [ ] 17.3 Document known issues and workarounds
  - Create `v3.0-known-issues.md`
  - List any minor issues discovered during rollout
  - Provide workarounds for each
  - Indicate: Fix planned, fix completed, won't fix (with reason)

- [ ] 17.4 Update API documentation
  - Update conversation flow diagrams
  - Document new ConversationState schema
  - Add examples of state transitions
  - Update error response documentation

- [ ] 17.5 Create operations runbook: `v3.0-operations-runbook.md`
  - How to monitor v3.0 health
  - Common issues and resolutions
  - How to rollback to v2.1 (emergency)
  - Escalation procedures
  - On-call playbook

- [ ] 17.6 Archive v2.1 code
  - Create branch: `backup/system-prompt-v2.1`
  - Tag release: `v2.1-final`
  - Document: Location of v2.1 code for reference
  - DO NOT delete v2.1 code yet (keep for 4 weeks)

- [ ] 17.7 Create final project summary
  - Document: `v3.0-project-summary.md`
  - Sections:
    - Problem statement (screenshot issue)
    - Solution implemented (state machine)
    - Results achieved (metrics comparison)
    - Lessons learned
    - Future improvements
  - Share with stakeholders

- [ ] 17.8 Team retrospective
  - Schedule: 1-hour retro meeting
  - Discuss: What went well, what could improve
  - Document action items for future projects
  - Celebrate success 🎉

**Acceptance Criteria:**
- ✅ All documentation created and reviewed
- ✅ v2.1 code safely archived
- ✅ Operations team trained on v3.0
- ✅ Project summary delivered to stakeholders
- ✅ Retrospective completed

**Deliverables:**
- Migration guide
- Operations runbook
- Project summary
- Retrospective notes

---

## Risk Management & Contingency Plans

### Risk 1: AI Doesn't Follow State Machine (High Impact)
**Mitigation:**
- Strong validation layer catches violations (Task 2)
- Regeneration with stricter instructions (Task 8)
- Manual review during alpha/beta (Tasks 12, 13)
- If issues persist: Add few-shot examples to prompt

### Risk 2: Context Tracking Failures (Medium Impact)
**Mitigation:**
- Comprehensive unit tests (Task 5, 6)
- Integration tests verify memory (Task 10)
- Automated context accuracy checks (Task 14.6)
- Logging for debugging (Task 8.9)

### Risk 3: Performance Degradation (Low Impact)
**Mitigation:**
- Performance requirements: <100ms for state machine (NFR-1.1)
- Monitor latency in beta (Task 13.4)
- Optimize if needed (Week 5+)

### Risk 4: Development Timeline Slip (Medium Impact)
**Mitigation:**
- Prioritize P0 tasks (state machine, prompt, integration)
- Have MVP vs nice-to-have list
- Buffer time in Week 3 for issues
- Clear non-goals to avoid scope creep

### Risk 5: No Measurable Improvement (Low Impact)
**Mitigation:**
- Clear baseline from v2.1 (capture before rollout)
- Screenshot shows obvious problem to fix
- Early beta testing validates approach (Week 3)
- Realistic success criteria (0% post-rec clarifications achievable)

---

## Success Metrics Summary

| Metric | Baseline (v2.1) | Target (v3.0) | Measurement | Timeline |
|--------|-----------------|---------------|-------------|----------|
| **M1: Post-Recommendation Clarifications** | ~15-20% | **0%** (100% elimination) | Automated scan of conversation logs | Immediate, continuous |
| **M2: Turns-to-Recommendation** | 3-4 turns | **2-3 turns** (30% reduction) | Calculate average turns | 2 weeks post-deployment |
| **M3: Question Repetition** | ~5-10% | **0%** (100% elimination) | Check clarificationHistory | Immediate, continuous |
| **M4: State Transition Accuracy** | N/A | **>99%** | Log state transitions | 1 week post-deployment |
| **M5: User Satisfaction** | Baseline | **80%+** positive | Feedback survey | 1 month |
| **V1: Validation Failure Rate** | N/A | **<5%** | Log validation errors | Continuous |
| **V2: Context Tracking Accuracy** | ~85% | **100%** | Automated test scenarios | Pre-launch + ongoing |
| **V3: Duplicate Prevention** | ~2% | **<1%** | Scan for repeated SKUs | Continuous |

---

## Task Completion Tracking

**Phase 1 (Week 1): Core Development**
- [ ] Task 1: State Machine Implementation (P0)
- [ ] Task 2: Response Validator Creation (P0)
- [ ] Task 3: System Prompt v3.0 Development (P0)
- [ ] Task 4: Prompt Support Files (P1)
- [ ] Task 5: Unit Test Suite - State Machine (P0)

**Phase 2 (Week 2): Integration**
- [ ] Task 6: Context Manager Enhancement (P0)
- [ ] Task 7: Answer Recognition System (P1)
- [ ] Task 8: AI Chat Service Integration (P0)
- [ ] Task 9: OpenRouter Client Update (P1)

**Phase 3 (Week 3): Testing & Beta**
- [ ] Task 10: Integration Test Suite (P0)
- [ ] Task 11: Manual QA Checklist Execution (P0)
- [ ] Task 12: Internal Alpha Testing (P0)
- [ ] Task 13: Beta Deployment (10% users) (P0)
- [ ] Task 14: Metrics & Monitoring Setup (P0)

**Phase 4 (Week 4): Rollout**
- [ ] Task 15: Gradual Rollout Execution (P0)
- [ ] Task 16: Post-Deployment Monitoring (P1)
- [ ] Task 17: Documentation & Wrap-up (P2)

**Overall Progress: 0/17 parent tasks completed**

---

## Next Steps

1. ✅ Review this task list with team
2. ✅ Assign owners to each parent task
3. ✅ Set up project tracking (Jira, Asana, etc.)
4. ✅ Begin Phase 1, Day 1: State Machine Implementation
5. ✅ Daily standups to track progress
6. ✅ Weekly stakeholder updates

---

**Task List Status:** Ready for Kickoff
**Created:** 2025-10-15
**Ready to Start:** Yes (all dependencies and resources identified)
