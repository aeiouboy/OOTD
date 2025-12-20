# Implementation Tasks: System Prompt Enhancement with Guardrails

**Based on PRD:** `0006-prd-system-prompt-enhancement-guardrails.md`
**Project:** OOTDay AI Fashion Assistant
**Feature:** Enhanced System Prompt v2.0 with Friendly Tone, Duplicate Prevention, Smart Clarification, and Topic Guardrails

---

## Task Overview

This task list breaks down the implementation of the enhanced system prompt into actionable development tasks. The implementation follows a 4-week timeline with clear phases: Prompt Development → Code Integration → Testing → Deployment.

**Total Estimated Tasks:** 8 parent tasks, 42 sub-tasks
**Estimated Timeline:** 4-5 weeks

---

## Parent Task 1: Setup and Project Structure ⚙️

**Goal:** Create the foundational structure for the enhanced system prompt implementation.

**Estimated Time:** 2-3 hours

### Sub-tasks:

- [ ] **1.1** Create new directory structure
  - Create `/frontend/lib/prompts/` directory
  - Create placeholder files for prompt modules
  - Update `.gitignore` if needed for any config files
  - **Files:** New directory structure

- [ ] **1.2** Define TypeScript interfaces for session management
  - Create `/frontend/lib/types/chat-types.ts` (if doesn't exist, or update existing)
  - Add `SessionContext` interface with `recommendedProductIds` array
  - Add `ConversationMemory` interface with user context
  - Add `ClarificationNeeded` interface for clarification logic
  - Add `UserQuery` interface for query parsing
  - **Files:** `frontend/lib/types/chat-types.ts`

- [ ] **1.3** Update package.json dependencies (if needed)
  - Check if any new dependencies required
  - Verify TypeScript version compatibility
  - **Files:** `frontend/package.json`

**Acceptance Criteria:**
- Directory structure created
- All TypeScript interfaces defined and exported
- No TypeScript compilation errors

---

## Parent Task 2: System Prompt Development 📝

**Goal:** Create the enhanced system prompt v2.0 with all requirements from DialogTemplate14-2.md plus new enhancements.

**Estimated Time:** 1-2 days

### Sub-tasks:

- [ ] **2.1** Read and analyze DialogTemplate14-2.md
  - Review all requirements from existing dialog template
  - Document Template A structure (CLOTHS category)
  - Document Template B structure (OTHER category)
  - Identify all sections that must be preserved
  - **Files:** Read `/Users/naruechon/Documents/Project/OOTDay/response model/dialog/dialog prd(t14.2)/DialogTemplate14-2.md`

- [ ] **2.2** Create main system prompt file
  - Create `/frontend/lib/prompts/system-prompt-v2.ts`
  - Add system prompt as exportable constant string
  - Include role and personality section
  - Add version metadata (v2.0)
  - Add last updated timestamp
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts`

- [ ] **2.3** Add friendly tone guidelines to system prompt
  - Include conversational Thai language instructions
  - Add particle usage guidelines (ค่ะ, นะคะ, เลย, จ้า)
  - Add encouraging language examples
  - Include DO's and DON'Ts with specific examples
  - Add emoji usage guidelines
  - Reference FR-1.1 through FR-1.6 from PRD
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts`

- [ ] **2.4** Add duplicate prevention instructions to system prompt
  - Add session management section
  - Include `recommendedProductIds` tracking instructions
  - Add filtering logic instructions for AI
  - Include fallback message when products run low
  - Add session reset conditions
  - Reference FR-2.1 through FR-2.6 from PRD
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts`

- [ ] **2.5** Add smart clarification rules to system prompt
  - Create clarification decision tree section
  - Add gender clarification rule (PRIORITY: HIGH)
  - Add occasion clarification rule (PRIORITY: HIGH)
  - Add climate/destination clarification rule (PRIORITY: MEDIUM)
  - Add budget clarification rule (PRIORITY: LOW/OPTIONAL)
  - Include one-question-at-a-time rule
  - Add skip conditions for each clarification type
  - Include example conversation flows
  - Reference FR-3.1 through FR-3.5 from PRD
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts`

- [ ] **2.6** Add topic guardrails to system prompt
  - Define fashion-related topics (whitelist)
  - Define off-topic categories (blacklist)
  - Add redirect message templates for each off-topic category:
    - General knowledge/facts
    - Health/medical
    - Technology
    - Food/restaurants
    - Travel/tourism (non-fashion)
    - Inappropriate/offensive
  - Add fashion-adjacent allowance rules
  - Include instruction to NEVER answer off-topic questions
  - Reference FR-4.1 through FR-4.5 from PRD
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts`

- [ ] **2.7** Migrate DialogTemplate14-2 content to system prompt
  - Copy Template A (CLOTHS category) format and requirements
  - Copy Template B (OTHER category) format and requirements
  - Include all 9 occasions coverage
  - Add product integration instructions
  - Add styling tips guidelines
  - Add seasonal & climate context instructions
  - Preserve all existing response format requirements
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts`

- [ ] **2.8** Create tone examples helper file
  - Create `/frontend/lib/prompts/tone-examples.ts`
  - Export array of good vs bad tone examples
  - Include Thai language examples
  - Add comments explaining why each example is good/bad
  - Make examples reusable for testing and documentation
  - **Files:** `frontend/lib/prompts/tone-examples.ts`

- [ ] **2.9** Create guardrail responses helper file
  - Create `/frontend/lib/prompts/guardrail-responses.ts`
  - Export object with redirect messages by category
  - Include all off-topic categories from FR-4.2
  - Add default redirect message
  - Make responses configurable and maintainable
  - **Files:** `frontend/lib/prompts/guardrail-responses.ts`

- [ ] **2.10** Add comprehensive comments and documentation to prompt
  - Add section headers for each major part
  - Include references to PRD requirements
  - Add inline comments explaining critical instructions
  - Document any assumptions or edge cases
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts`

**Acceptance Criteria:**
- System prompt v2.0 complete with all sections
- All DialogTemplate14-2 requirements preserved
- Friendly tone guidelines clear and actionable
- Duplicate prevention instructions explicit
- Clarification rules with decision tree included
- Topic guardrails with all redirect messages defined
- Prompt is well-commented and maintainable
- Helper files created and exported properly

---

## Parent Task 3: Session Memory & Duplicate Prevention Logic 🔄

**Goal:** Implement session-based product tracking to prevent duplicate recommendations.

**Estimated Time:** 1-2 days

### Sub-tasks:

- [ ] **3.1** Create session context utilities
  - Create `/frontend/lib/utils/session-context.ts`
  - Implement `createSessionContext()` function
  - Implement `updateSessionContext()` function to add recommended products
  - Implement `resetSessionContext()` function
  - Add TypeScript types for all functions
  - **Files:** `frontend/lib/utils/session-context.ts`

- [ ] **3.2** Implement duplicate product filtering
  - Create `/frontend/lib/utils/duplicate-filter.ts`
  - Implement `filterDuplicateProducts()` function
  - Accept `EnhancedProduct[]` and `SessionContext` as parameters
  - Return filtered products excluding already recommended SKUs
  - Add performance optimization (use Set for O(1) lookup)
  - Handle edge cases (empty list, no session context)
  - **Files:** `frontend/lib/utils/duplicate-filter.ts`

- [ ] **3.3** Update ChatRequest interface
  - Update `/frontend/lib/services/ai-chat-service.ts`
  - Add `sessionContext?: SessionContext` to ChatRequest interface
  - Add `conversationId?: string` for session identification
  - Ensure backward compatibility (make fields optional)
  - **Files:** `frontend/lib/services/ai-chat-service.ts`

- [ ] **3.4** Integrate session context in chat service
  - Update `processAIChatRequest()` function
  - Initialize session context if not provided
  - Pass session context to product filtering logic
  - Update session context with newly recommended products
  - Include `recommendedProductIds` in conversation history
  - **Files:** `frontend/lib/services/ai-chat-service.ts`

- [ ] **3.5** Update conversation context for API calls
  - Modify `callOpenRouter()` function
  - Add session context to system prompt dynamically
  - Format `recommendedProductIds` array for AI consumption
  - Ensure AI receives clear instructions about duplicates
  - **Files:** `frontend/lib/services/ai-chat-service.ts`

- [ ] **3.6** Handle insufficient products scenario
  - Detect when filtered products count is below minimum (< 3 for outfits)
  - Return appropriate user message (as per FR-2.4)
  - Suggest alternatives (view previous recommendations, change category)
  - Log warning for monitoring
  - **Files:** `frontend/lib/services/ai-chat-service.ts`

**Acceptance Criteria:**
- Session context utilities created and tested
- Duplicate filtering function works correctly
- Chat service integrated with session management
- Session context passed to AI in system prompt
- Insufficient products handled gracefully
- No breaking changes to existing API contracts

---

## Parent Task 4: Smart Clarification Logic 🤔

**Goal:** Implement logic to detect missing information and ask appropriate clarifying questions.

**Estimated Time:** 1-2 days

### Sub-tasks:

- [ ] **4.1** Create clarification detection utilities
  - Create `/frontend/lib/utils/clarification-detector.ts`
  - Implement `detectMissingInfo()` function
  - Implement helper functions:
    - `requiresGenderClarification()`
    - `isOccasionVague()`
    - `isTravelQuery()`
    - `shouldAskBudget()`
  - Return `ClarificationNeeded` object or null
  - **Files:** `frontend/lib/utils/clarification-detector.ts`

- [ ] **4.2** Implement gender detection logic
  - Detect if message contains gender keywords (ผู้หญิง, ผู้ชาย, men, women)
  - Check conversation history for previous gender context
  - Implement pattern matching for gender inference
  - Return boolean: hasGender
  - **Files:** `frontend/lib/utils/clarification-detector.ts`

- [ ] **4.3** Implement occasion detection logic
  - Check for explicit occasion keywords (work, wedding, date, etc.)
  - Detect vague requests ("ชุดสวยๆ", "something nice")
  - Use existing `detectOccasion()` from ai-chat-service.ts
  - Return boolean: hasOccasion
  - **Files:** `frontend/lib/utils/clarification-detector.ts`, `frontend/lib/services/ai-chat-service.ts`

- [ ] **4.4** Implement travel/destination detection logic
  - Detect travel-related keywords (ท่องเที่ยว, เที่ยว, travel, trip)
  - Check for destination mentions
  - Check for climate/season mentions
  - Return boolean: hasDestination
  - **Files:** `frontend/lib/utils/clarification-detector.ts`

- [ ] **4.5** Implement budget detection logic
  - Use existing `extractBudget()` from ai-chat-service.ts
  - Detect budget-related keywords (งบ, budget, ราคา)
  - Parse numeric values
  - Return boolean: hasBudget
  - **Files:** `frontend/lib/utils/clarification-detector.ts`, `frontend/lib/services/ai-chat-service.ts`

- [ ] **4.6** Integrate clarification logic in chat service
  - Update `processAIChatRequest()` to check for missing info
  - Call `detectMissingInfo()` before generating recommendations
  - If clarification needed, return clarification question instead of recommendations
  - Store clarification state in conversation context
  - After receiving answer, proceed with recommendation
  - **Files:** `frontend/lib/services/ai-chat-service.ts`

- [ ] **4.7** Implement priority-based clarification
  - Enforce priority order: Gender > Occasion > Destination > Budget
  - Only ask ONE question per turn
  - Skip lower priority if user seems to want browsing (for budget)
  - Update decision tree logic
  - **Files:** `frontend/lib/utils/clarification-detector.ts`

- [ ] **4.8** Add clarification acknowledgment responses
  - After user answers clarification, acknowledge naturally
  - Use friendly tone (e.g., "เข้าใจแล้วค่ะ!")
  - Proceed smoothly to recommendation
  - Include acknowledgment in system prompt examples
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts`, `frontend/lib/services/ai-chat-service.ts`

**Acceptance Criteria:**
- Clarification detection utilities implemented
- Gender, occasion, destination, and budget detection working
- Priority-based clarification logic implemented
- One-question-at-a-time rule enforced
- Chat service integrated with clarification logic
- Acknowledgment responses implemented
- Clarification flow feels natural in conversation

---

## Parent Task 5: Topic Guardrails Implementation 🛡️

**Goal:** Implement off-topic detection and polite redirect responses to keep conversations fashion-focused.

**Estimated Time:** 1 day

### Sub-tasks:

- [ ] **5.1** Create guardrail detection utilities
  - Create `/frontend/lib/utils/guardrail-detector.ts`
  - Implement `isOffTopic()` function
  - Implement `getRedirectMessage()` function
  - Define off-topic patterns (health, tech, food, general, etc.)
  - Define fashion keywords whitelist
  - **Files:** `frontend/lib/utils/guardrail-detector.ts`

- [ ] **5.2** Implement pattern matching for off-topic categories
  - Health/medical patterns: /(?:ยา|โรค|แพทย์|หมอ|รักษา|ป่วย)/
  - Technology patterns: /(?:คอม|โทรศัพท์|แอป|software|hardware)/
  - Food patterns: /(?:ร้านอาหาร|เมนู|กิน|อร่อย|ราคาอาหาร)(?!.*ใส่)/
  - General knowledge patterns: /(?:อะไรคือ|ทำไม|อธิบาย|วิธีทำ)(?!.*ใส่|สไตล์|แต่งตัว)/
  - Add more patterns as needed
  - **Files:** `frontend/lib/utils/guardrail-detector.ts`

- [ ] **5.3** Implement fashion keyword detection
  - Define fashion keywords: ชุด, เสื้อ, กางเกง, สไตล์, แต่งตัว, outfit, รองเท้า, กระเป๋า, etc.
  - Check if message contains any fashion keywords
  - Allow fashion-adjacent topics (e.g., "what to wear to...")
  - Return boolean indicating fashion-related
  - **Files:** `frontend/lib/utils/guardrail-detector.ts`

- [ ] **5.4** Create redirect message selector
  - Map off-topic categories to appropriate redirect messages
  - Import redirect messages from `guardrail-responses.ts`
  - Select message based on detected category
  - Include default message for unmatched cases
  - Ensure messages are friendly and helpful (as per FR-4.3)
  - **Files:** `frontend/lib/utils/guardrail-detector.ts`, `frontend/lib/prompts/guardrail-responses.ts`

- [ ] **5.5** Integrate guardrails in chat service
  - Update `processAIChatRequest()` to check for off-topic queries
  - Call `isOffTopic()` at the start of request processing
  - If off-topic, return redirect message immediately
  - Do NOT call AI for off-topic queries
  - Log off-topic queries for analysis (as per Q9 in PRD)
  - **Files:** `frontend/lib/services/ai-chat-service.ts`

- [ ] **5.6** Add guardrail instructions to system prompt
  - Include explicit instruction to ONLY respond to fashion topics
  - Add all redirect message templates
  - Include fashion-adjacent allowance rules
  - Provide clear examples of allowed vs not-allowed topics
  - **Files:** `frontend/lib/prompts/system-prompt-v2.ts`

**Acceptance Criteria:**
- Guardrail detection utilities implemented
- Off-topic pattern matching working for all categories
- Fashion keyword detection working
- Redirect message selection appropriate
- Chat service integrated with guardrails
- Off-topic queries logged for analysis
- System prompt includes guardrail instructions
- Redirects are polite and offer fashion alternatives

---

## Parent Task 6: Integration & Configuration 🔌

**Goal:** Integrate the enhanced system prompt into production and test mode interfaces.

**Estimated Time:** 1 day

### Sub-tasks:

- [ ] **6.1** Update ai-chat-service.ts to use new system prompt
  - Import system prompt v2 from `prompts/system-prompt-v2.ts`
  - Update `callOpenRouter()` to use new prompt
  - Add system message to conversation history
  - Ensure product context integration works
  - Verify session context passed correctly
  - **Files:** `frontend/lib/services/ai-chat-service.ts`

- [ ] **6.2** Update openrouter-client.ts to use new system prompt
  - Import system prompt v2 from `prompts/system-prompt-v2.ts`
  - Update `getSystemPrompt()` method to return v2
  - Remove cached v1 prompt if present
  - Ensure test mode uses enhanced prompt
  - Add version parameter for future A/B testing
  - **Files:** `frontend/lib/openrouter-client.ts`

- [ ] **6.3** Add environment flag for prompt version switching
  - Add `NEXT_PUBLIC_SYSTEM_PROMPT_VERSION` to .env.local
  - Support values: "v1", "v2" (default: "v2")
  - Implement version selector in system prompt loader
  - Allow runtime switching for A/B testing
  - Document flag in README or .env.example
  - **Files:** `frontend/.env.local`, `frontend/lib/prompts/system-prompt-v2.ts`

- [ ] **6.4** Create system prompt loader utility
  - Create `/frontend/lib/prompts/system-prompt-loader.ts`
  - Implement `getSystemPrompt(version?: string)` function
  - Load v1 or v2 based on parameter or environment variable
  - Cache loaded prompt for performance
  - Include error handling for invalid versions
  - **Files:** `frontend/lib/prompts/system-prompt-loader.ts`

- [ ] **6.5** Update API route to support session context
  - Update `/frontend/app/api/chat/route.ts`
  - Accept `sessionContext` in request body
  - Pass session context to `processAIChatRequest()`
  - Return updated session context in response
  - Ensure backward compatibility (optional field)
  - **Files:** `frontend/app/api/chat/route.ts`

- [ ] **6.6** Update ChatInterface component for session management (optional)
  - Update chat component to maintain session context state
  - Initialize session context on mount
  - Pass session context with each chat request
  - Update state with returned session context
  - Add reset button to clear session (optional)
  - **Files:** Component files (TBD based on current chat interface structure)

**Acceptance Criteria:**
- ai-chat-service.ts using system prompt v2
- openrouter-client.ts using system prompt v2
- Environment flag for version switching implemented
- System prompt loader utility created
- API route supports session context
- All integrations maintain backward compatibility
- No breaking changes to existing functionality

---

## Parent Task 7: Testing & Quality Assurance ✅

**Goal:** Thoroughly test all new features and ensure quality standards are met.

**Estimated Time:** 2-3 days

### Sub-tasks:

- [ ] **7.1** Write unit tests for duplicate prevention
  - Create test file: `/frontend/lib/utils/__tests__/duplicate-filter.test.ts`
  - Test: filters out previously recommended products
  - Test: handles empty session context
  - Test: handles empty product list
  - Test: preserves product order
  - Test: performance with large datasets
  - Achieve 100% code coverage for duplicate-filter.ts
  - **Files:** `frontend/lib/utils/__tests__/duplicate-filter.test.ts`

- [ ] **7.2** Write unit tests for clarification logic
  - Create test file: `/frontend/lib/utils/__tests__/clarification-detector.test.ts`
  - Test: asks for gender when not specified
  - Test: skips gender when already specified
  - Test: detects vague occasions
  - Test: detects travel queries
  - Test: detects budget mentions
  - Test: respects priority order
  - Test: one-question-at-a-time enforcement
  - Achieve 100% code coverage for clarification-detector.ts
  - **Files:** `frontend/lib/utils/__tests__/clarification-detector.test.ts`

- [ ] **7.3** Write unit tests for guardrails
  - Create test file: `/frontend/lib/utils/__tests__/guardrail-detector.test.ts`
  - Test: identifies health/medical queries as off-topic
  - Test: identifies technology queries as off-topic
  - Test: identifies food queries as off-topic (without fashion context)
  - Test: allows fashion-related queries
  - Test: allows fashion-adjacent queries ("what to wear to...")
  - Test: selects appropriate redirect message by category
  - Test: handles inappropriate/offensive queries
  - Achieve 100% code coverage for guardrail-detector.ts
  - **Files:** `frontend/lib/utils/__tests__/guardrail-detector.test.ts`

- [ ] **7.4** Write integration tests for multi-turn conversations
  - Create test file: `/frontend/lib/services/__tests__/ai-chat-service.integration.test.ts`
  - Test Scenario 1: Multi-turn conversation with duplicate prevention
    - Turn 1: Request → Products A, B, C recommended
    - Turn 2: Request → Products D, E, F recommended (NOT A, B, C)
    - Turn 3: Request → Products G, H, I recommended (NOT A-F)
  - Test Scenario 2: Clarification flow
    - Turn 1: Ambiguous request → Clarification question
    - Turn 2: Answer → Recommendations based on answer
    - Turn 3: Follow-up → No duplicate products
  - Test Scenario 3: Off-topic redirect
    - Turn 1: Off-topic query → Redirect message
    - Turn 2: Fashion query → Normal recommendations
  - **Files:** `frontend/lib/services/__tests__/ai-chat-service.integration.test.ts`

- [ ] **7.5** Manual testing with team (dogfooding)
  - Deploy to test environment
  - Test friendly tone: Does it feel natural and friendly?
  - Test duplicate prevention: No duplicates in multi-turn conversations?
  - Test clarifications: Asked only when necessary? One at a time?
  - Test guardrails: Off-topic queries redirected politely?
  - Test edge cases: Empty queries, very long conversations, session resets
  - Collect qualitative feedback from team
  - Document issues in GitHub issues or bug tracker
  - **Files:** Test environment deployment

- [ ] **7.6** Run existing test scenarios with new prompt
  - Identify existing test scenarios (if any)
  - Run all scenarios with system prompt v2
  - Verify Template A compliance (CLOTHS category)
  - Verify Template B compliance (OTHER category)
  - Compare scores: should remain same or improve
  - Fix any regressions
  - **Files:** Existing test scenario files

- [ ] **7.7** Performance testing
  - Test duplicate checking latency (target: <50ms per request)
  - Test session memory with 50+ recommended products
  - Test clarification detection speed (target: <100ms)
  - Monitor API response times with enhanced prompt
  - Verify no significant performance degradation
  - **Files:** Performance test results documentation

- [ ] **7.8** Manual testing checklist completion
  - [ ] Tone feels friendly and conversational (not robotic)
  - [ ] Emoji usage is appropriate (not excessive)
  - [ ] Thai language particles (ค่ะ, นะคะ, เลย) used naturally
  - [ ] Clarification questions asked only when necessary
  - [ ] Clarification questions asked one at a time
  - [ ] Duplicate products never appear in same conversation
  - [ ] Off-topic queries consistently redirected
  - [ ] Redirect messages are polite and helpful
  - [ ] Fashion-adjacent topics still allowed
  - [ ] Template A structure maintained for CLOTHS
  - [ ] Template B structure maintained for OTHER
  - [ ] All existing test scenarios still pass
  - **Files:** Testing checklist documentation

**Acceptance Criteria:**
- All unit tests written and passing
- Integration tests cover key scenarios
- Manual testing completed with team feedback
- Existing test scenarios pass with new prompt
- Performance targets met
- Manual testing checklist 100% complete
- No critical bugs or regressions
- Code coverage >80% for new utilities

---

## Parent Task 8: Deployment & Monitoring 🚀

**Goal:** Deploy the enhanced system prompt to production with proper monitoring and rollback plan.

**Estimated Time:** 1 week (includes monitoring period)

### Sub-tasks:

- [ ] **8.1** Prepare deployment documentation
  - Document system prompt v2 changes
  - Create deployment runbook
  - Document rollback procedure (switch to v1 via env flag)
  - List monitoring metrics to track
  - Create FAQ for team
  - **Files:** Deployment documentation

- [ ] **8.2** Deploy to test environment
  - Deploy code to test/staging environment
  - Verify environment variables configured correctly
  - Test all features in test environment
  - Conduct smoke tests
  - Get team approval
  - **Files:** Test environment deployment

- [ ] **8.3** Internal dogfooding (Week 1)
  - Internal team uses enhanced prompt for 1 week
  - Collect qualitative feedback daily
  - Monitor for errors or unexpected behavior
  - Fix critical issues if found
  - Iterate on tone/messages based on feedback
  - **Files:** Feedback collection and iteration

- [ ] **8.4** Implement monitoring and logging
  - Add logging for duplicate prevention events
  - Log clarification questions asked and user responses
  - Log off-topic queries with categories
  - Track session context size
  - Monitor API response times
  - Set up alerts for errors or anomalies
  - **Files:** Logging and monitoring configuration

- [ ] **8.5** Soft launch to 10% of users (Week 2-3)
  - Deploy to production with 10% traffic split
  - Use environment flag or feature flag for A/B split
  - Monitor success metrics (as per PRD Section 9):
    - M1: User engagement (conversation length)
    - M2: Duplicate prevention effectiveness
    - M3: Clarification accuracy
    - M4: Off-topic filtering accuracy
  - Compare metrics between v1 (90%) and v2 (10%) groups
  - Collect user feedback if available
  - **Files:** Production deployment with feature flag

- [ ] **8.6** Analyze soft launch results
  - Review metrics after 1-2 weeks
  - Compare v2 vs v1 performance
  - Check for any negative impact on key metrics
  - Review user feedback (if collected)
  - Make go/no-go decision for full rollout
  - Document findings in rollout report
  - **Files:** Soft launch analysis report

- [ ] **8.7** Full rollout to 100% (Week 4)
  - If soft launch successful, proceed with full rollout
  - Update environment flag to use v2 for 100% of users
  - Monitor closely for first 24-48 hours
  - Keep v1 available for quick rollback if needed
  - Announce to team and stakeholders
  - **Files:** Production deployment

- [ ] **8.8** Post-deployment monitoring (Week 5+)
  - Monitor success metrics continuously
  - Track duplicate prevention effectiveness (target: 95%)
  - Track clarification accuracy (target: 80%)
  - Track off-topic filtering (target: 95%)
  - Monitor user engagement (target: 20% increase)
  - Collect ongoing user feedback
  - Schedule weekly review meetings
  - **Files:** Ongoing monitoring and reports

- [ ] **8.9** Optimization based on data
  - Review collected data and feedback
  - Identify areas for improvement
  - Adjust tone if too casual or not casual enough
  - Refine clarification triggers if too frequent/infrequent
  - Update guardrail patterns if misclassifications occur
  - Iterate on system prompt based on learnings
  - **Files:** System prompt refinements

- [ ] **8.10** Final documentation and handoff
  - Update README with system prompt v2 information
  - Document lessons learned
  - Create maintenance guide for future updates
  - Update team on best practices
  - Archive v1 prompt for reference
  - Close PRD as "Implemented"
  - **Files:** Final documentation

**Acceptance Criteria:**
- Deployment documentation complete
- Successfully deployed to test environment
- Internal dogfooding completed with feedback
- Monitoring and logging implemented
- Soft launch completed with 10% users
- Metrics analyzed and documented
- Full rollout completed (if soft launch successful)
- Post-deployment monitoring active
- Optimization iterations completed
- Final documentation and handoff complete
- All success metrics from PRD tracked and met

---

## Summary of Files to Create/Modify

### New Files to Create:
1. `/frontend/lib/prompts/system-prompt-v2.ts` - Main enhanced system prompt
2. `/frontend/lib/prompts/tone-examples.ts` - Tone examples helper
3. `/frontend/lib/prompts/guardrail-responses.ts` - Redirect messages
4. `/frontend/lib/prompts/system-prompt-loader.ts` - Prompt version loader
5. `/frontend/lib/utils/session-context.ts` - Session management utilities
6. `/frontend/lib/utils/duplicate-filter.ts` - Duplicate filtering logic
7. `/frontend/lib/utils/clarification-detector.ts` - Clarification detection
8. `/frontend/lib/utils/guardrail-detector.ts` - Off-topic detection
9. `/frontend/lib/types/chat-types.ts` - TypeScript interfaces (or update existing)
10. Test files for all utilities (`__tests__/` directories)

### Files to Modify:
1. `/frontend/lib/services/ai-chat-service.ts` - Integrate all new features
2. `/frontend/lib/openrouter-client.ts` - Use system prompt v2
3. `/frontend/app/api/chat/route.ts` - Support session context
4. `/frontend/.env.local` - Add version flag
5. Chat interface components - Session management (optional)

### Documentation Files:
1. Deployment runbook
2. Rollback procedure
3. Maintenance guide
4. Testing reports
5. Soft launch analysis
6. README updates

---

## Success Criteria for Completion

✅ All 8 parent tasks completed
✅ All 42 sub-tasks checked off
✅ System prompt v2.0 deployed to production
✅ All success metrics from PRD Section 9 met:
  - M1: 20% increase in conversation length
  - M2: 95% conversations with zero duplicate products
  - M3: 80% of ambiguous queries receive clarifications
  - M4: 95% of off-topic queries correctly redirected
✅ All tests passing (unit, integration, manual)
✅ No critical bugs or regressions
✅ Team trained and documentation complete
✅ Monitoring and alerting in place
✅ PRD marked as "Implemented"

---

## Notes and Considerations

**Dependencies:**
- Requires DialogTemplate14-2.md to be available and up-to-date
- Requires access to OpenRouter API
- Requires existing product catalog loaded in system

**Risks:**
- AI may not always follow instructions perfectly (monitor closely)
- Tone may need iteration based on user feedback
- Clarification logic may be too aggressive or too passive (tune based on data)
- Performance impact with session tracking (monitor and optimize)

**Open Questions to Resolve During Implementation:**
- Q1: Server-side session storage vs stateless (client-side)?
  - Recommendation: Stateless for MVP (simpler)
- Q2: Session reset mechanism - explicit command vs UI button?
  - Recommendation: Both (explicit command + UI button)
- Q7: Collect user feedback on tone?
  - Recommendation: Optional 👍/👎 after each response

**Communication:**
- Weekly status updates to stakeholders
- Daily standups during implementation
- Post-deployment report after full rollout
- Quarterly review of off-topic query patterns

---

**Task List Version:** 1.0
**Created:** 2025-10-14
**Last Updated:** 2025-10-14
**Estimated Completion:** 4-5 weeks from start
**Status:** Ready for Implementation
