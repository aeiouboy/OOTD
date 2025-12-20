# PRD-0009: System Prompt v2.2 - Conversation Context Awareness Enhancement

**Status:** In Progress
**Priority:** P0 (Critical)
**Version:** 1.2
**Created:** 2025-10-16
**Last Updated:** 2025-10-16 (Comprehensive all-gender support)
**Owner:** Dev Team
**Target Completion:** 24-48 hours

---

## Introduction/Overview

The current System Prompt v2.2 successfully enforces MAX 2 clarifications and loop prevention rules (PRD-0008), but lacks **conversation context awareness**. When users provide information in earlier messages, the AI forgets this context and asks redundant questions, creating a poor user experience.

**Problem Example:**
```
Turn 1: User: "งานบวช" (mentions occasion)
AI: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?" (asks about gender)

Turn 2: User: "ผู้ชาย" (provides gender)
AI: "ชุดนี้เอาไว้ใส่โอกาสไหนคะ?" ❌ ASKS ABOUT OCCASION AGAIN - ALREADY MENTIONED!
```

**Expected Behavior:**
```
Turn 1: User: "งานบวช" (mentions occasion)
AI: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?" (asks about gender)

Turn 2: User: "ผู้ชาย" (provides gender)
AI: "ได้เลย งานบวชต้องลุคนี้เลย" ✅ REMEMBERS "งานบวช" → PROVIDES RECOMMENDATIONS
```

This PRD documents a **temporary but critical fix** to System Prompt v2.2 that enables context tracking across conversation turns, bridging the gap until System Prompt v3.0 (PRD-0007) is fully deployed.

---

## Goals

### Primary Goals

1. **Enable Context Memory** - AI must remember and reference information from previous conversation turns
2. **Eliminate Redundant Questions** - Never ask about information already provided by the user
3. **Reduce Clarification Count** - Comprehensive context awareness reduces need for multiple clarifications
4. **Maintain v2.2 Guardrails** - Preserve existing loop prevention, template enforcement, and tone guidelines
5. **Deploy Within 24-48 Hours** - Critical P0 fix with immediate rollout

### Success Metrics

- **Zero redundant questions** in 3 test scenarios (clear info, 1 clarification, 2 clarifications)
- **Automated test suite** with 10+ conversation flow tests passing
- **A/B test results** show improved user satisfaction vs baseline v2.2
- **No regression** in existing v2.2 behavior (loop prevention, template compliance)

---

## User Stories

### User Story 1: Single Clarification with Context Memory
**As a** user providing partial information
**I want** the AI to remember what I've already said
**So that** I don't have to repeat myself

**Scenario:**
```
User: "หาชุดไปงานบวช" (occasion = งานบวช, gender = missing)
AI: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?" (asks ONLY about gender)
User: "ผู้ชาย"
AI: [PROVIDES RECOMMENDATIONS for งานบวช + ผู้ชาย] ✅
```

### User Story 2: Two Clarifications with Full Context Tracking
**As a** user providing vague requests
**I want** the AI to track all my answers across multiple turns
**So that** the final recommendations consider everything I've said

**Scenario:**
```
User: "หาชุดไปงาน" (very vague - no occasion, no gender)
AI: "กำลังหาชุดไปงานไหนน้า งานแต่ง งานบวช งานประชุม..." (asks about occasion)
User: "งานบวช" (occasion = งานบวช, gender still missing)
AI: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?" (asks about gender, REMEMBERS occasion)
User: "ผู้ชาย" (gender = ผู้ชาย)
AI: [PROVIDES RECOMMENDATIONS for งานบวช + ผู้ชาย] ✅
```

### User Story 3: Direct Recommendations with Complete Information
**As a** user providing complete information upfront
**I want** immediate recommendations without any clarifying questions
**So that** I get results quickly

**Scenario:**
```
User: "หาชุดไปงานบวช สำหรับผู้ชาย งบ 5000 บาท"
AI: [PROVIDES RECOMMENDATIONS IMMEDIATELY] ✅ (no clarifications needed)
```

### User Story 4: All-Gender/Inclusive Recommendations
**As a** user of any gender identity or shopping for others
**I want** the system to understand inclusive gender language and provide appropriate recommendations
**So that** I get relevant suggestions regardless of gender identity

**Scenario 1 - Explicit "All Genders":**
```
User: "หาชุดไปงานบวช เพศไหนก็ได้" (occasion = งานบวช, gender = all)
AI: "เข้าใจค่ะ! เรามีชุดไปงานบวชที่เหมาะกับทุกเพศมาแนะนำนะคะ 👔👗
     [PROVIDES RECOMMENDATIONS for ALL genders - women's, men's, and unisex items]" ✅
```

**Scenario 2 - Gender Not Specified:**
```
User: "หาชุดไปงานบวช" (occasion = งานบวช, gender = not specified)
AI: "อยากหาชุดแบบไหนคะ? ผู้หญิง ผู้ชาย หรือเพศไหนก็ได้? 👔👗"
[Asks in inclusive way with "all genders" as an option]
```

**Scenario 3 - Non-Binary/Gender-Neutral:**
```
User: "หาชุด gender-neutral ไปงานบวช" (occasion = งานบวช, gender = non-binary)
AI: "เข้าใจค่ะ! เรามีชุดสไตล์ gender-neutral ที่เหมาะกับงานบวชมาแนะนำนะคะ ✨
     [PROVIDES RECOMMENDATIONS for androgynous/gender-neutral styling]" ✅
```

**Benefits:**
- **Inclusive Language**: Supports "ทุกเพศ", "เพศไหนก็ได้", "all genders", "gender-neutral", "non-binary"
- **Diverse Recommendations**: Can provide women's, men's, unisex, or androgynous items as appropriate
- **Flexible Clarification**: When asking about gender, includes "all genders" as an option
- **Shopping for Others**: Useful when buying gifts or shopping for family/friends
- **Accessibility**: Particularly useful for accessories, outerwear, and styling advice

---

## Functional Requirements

### FR1: Context Extraction from User Messages
**Priority:** P0
**Description:** The system must extract and track clarification parameters from user messages across all conversation turns.

**Tracked Parameters:**
1. **Gender** (เพศ):
   - **Specific genders**: ผู้หญิง, ผู้ชาย, women, men, male, female
   - **Non-binary/Inclusive**: เพศไหนก็ได้, ทุกเพศ, unisex, all genders, gender-neutral, non-binary
   - **Context-based**: When gender is not specified, provide inclusive recommendations
2. **Occasion** (โอกาส): งานบวช, งานแต่ง, ทำงาน, เดท, ปาร์ตี้, work, wedding, date, party, etc.
3. **Climate/Destination** (สภาพอากาศ/สถานที่): ร้อน, หนาว, เที่ยวญี่ปุ่น, cold, hot, tropical, etc.
4. **Budget** (งบประมาณ): 3000-5000, ไม่เกิน 2000, under 5000, etc.
5. **Style** (สไตล์): casual, formal, smart casual, สบายๆ, เป็นทางการ, etc.

**Acceptance Criteria:**
- System correctly identifies parameters from Thai and English text
- Parameters persist across conversation turns
- Once extracted, parameters are not asked about again

### FR2: Smart Clarification Skip Logic
**Priority:** P0
**Description:** Before asking a clarifying question, the system must check if the information was already provided in previous messages.

**Logic:**
```typescript
BEFORE asking: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?"
CHECK: Does context contain gender?
IF yes → SKIP this question
IF no → ASK this question

BEFORE asking: "ชุดนี้เอาไว้ใส่โอกาสไหนคะ?"
CHECK: Does context contain occasion?
IF yes → SKIP this question
IF no → ASK this question
```

**Acceptance Criteria:**
- Zero redundant questions in manual test scenarios
- Automated tests verify skip logic for all 5 parameter types
- System still asks when information is genuinely missing

### FR3: Context-Aware Prompt Instructions
**Priority:** P0
**Description:** Enhance System Prompt v2.2 with explicit instructions and examples for context awareness.

**Required Additions:**
1. **Context Tracking Section** - Explain how to extract parameters from conversation history
2. **Anti-Pattern Examples** - Show BAD examples (asking redundant questions) vs GOOD examples (remembering context)
3. **Clarification Decision Tree** - Step-by-step logic for deciding what to ask
4. **Conversation Memory Examples** - Demonstrate multi-turn context tracking

**Acceptance Criteria:**
- New prompt instructions are clear and unambiguous
- Examples cover all 3 test scenarios (Scenario 1, 2, 3)
- Junior developer can understand the logic from reading the prompt

### FR4: Conversation Context Injection (Code Implementation)
**Priority:** P0
**Description:** Implement lightweight context tracking in the OpenRouter client to pass extracted parameters to the LLM.

**Implementation:**
```typescript
// Enhanced system prompt with context injection
interface ConversationContext {
  gender?: string;        // "ผู้หญิง" | "ผู้ชาย" | "all" | "women" | "men" | "unisex" | "non-binary" | null (not specified)
  occasion?: string;      // "งานบวช" | "work" | "wedding" | etc.
  climate?: string;       // "hot" | "cold" | "tropical" | etc.
  budget?: string;        // "3000-5000" | "under 5000" | etc.
  style?: string;         // "casual" | "formal" | etc.
}

// Extract context from conversation history
function extractContext(messages: Message[]): ConversationContext {
  // Parse all user messages for keywords
  // Return accumulated context
}

// Inject context into system prompt
const contextPrompt = `
CONVERSATION CONTEXT (Already Provided by User):
${context.gender ? `- Gender: ${context.gender}` : ''}
${context.occasion ? `- Occasion: ${context.occasion}` : ''}
${context.climate ? `- Climate: ${context.climate}` : ''}
${context.budget ? `- Budget: ${context.budget}` : ''}
${context.style ? `- Style: ${context.style}` : ''}

CRITICAL: DO NOT ask about parameters listed above - they were already mentioned!
Only ask clarifying questions about MISSING information.
`;
```

**Acceptance Criteria:**
- Context extraction function correctly identifies all 5 parameter types
- Context is injected into every LLM request
- Integration with InteractiveChatPanel.tsx and production chat

### FR5: Conversation History Tracking
**Priority:** P0
**Description:** Maintain full conversation history and pass it to context extraction function.

**Implementation Location:**
- `InteractiveChatPanel.tsx` - Already tracks `conversation.messages`
- `OpenRouterClient.sendChatCompletion()` - Receive messages array, extract context, enhance system prompt

**Acceptance Criteria:**
- All user messages (not just current message) are analyzed for context
- Context accumulates across conversation turns
- Works in both test mode and production chat

### FR6: Backward Compatibility
**Priority:** P0
**Description:** Changes must not break existing System Prompt v2.2 behavior.

**Preserved Features:**
- MAX 2 clarifications rule (PRD-0008 fix)
- Loop prevention guardrails
- Template A/B enforcement
- Friendly Thai conversational tone
- Duplicate product prevention

**Acceptance Criteria:**
- All existing v2.2 test cases still pass
- No regression in loop prevention
- Template compliance maintained

---

## Non-Goals (Out of Scope)

### Not Included in This PRD

1. **Full State Machine** - This is a lightweight context tracking solution, not the comprehensive state machine in PRD-0007 (System Prompt v3.0)
2. **Conversation State Persistence** - Context resets on page refresh (sessionStorage caching is handled separately)
3. **Multi-Language Context Extraction** - Focus on Thai and English only (not Chinese, Japanese, etc.)
4. **Advanced NLP** - Use keyword matching, not ML-based entity extraction
5. **Context Confidence Scoring** - Assume extracted context is correct, no confidence thresholds
6. **User Intent Classification** - Don't classify user intent beyond parameter extraction
7. **Conversation Summarization** - Don't summarize long conversations, extract parameters only

---

## Design Considerations

### Prompt Engineering Approach

**System Prompt v2.2 Enhancements:**

#### Section 1: Context Awareness Instructions (New)
```markdown
## CONVERSATION CONTEXT AWARENESS 🧠
**CRITICAL: You must remember what users have already told you!**

### Context Tracking Rules

**BEFORE ASKING ANY CLARIFYING QUESTION:**
1. Review ALL previous user messages in this conversation
2. Check if user already mentioned the information you're about to ask about
3. If YES → SKIP the question and use the information already provided
4. If NO → Ask the question

### Parameters to Track

Track these parameters across the conversation:
- **Gender** (เพศ):
  - Specific: ผู้หญิง, ผู้ชาย, women, men, male, female
  - Inclusive: เพศไหนก็ได้, ทุกเพศ, unisex, all genders, gender-neutral, non-binary
  - **Important**: When gender is not specified, ask inclusively with "all genders" as an option
- **Occasion** (โอกาส): งานบวช, งานแต่ง, ทำงาน, เดท, work, wedding, date, party
- **Climate/Destination**: ร้อน, หนาว, เที่ยวญี่ปุ่น, hot, cold, tropical
- **Budget**: 3000-5000, ไม่เกิน 2000, under 5000
- **Style**: casual, formal, smart casual, สบายๆ, เป็นทางการ

### Anti-Pattern: Asking Redundant Questions ❌

**BAD EXAMPLE (DO NOT DO THIS):**
```
Turn 1: User: "หาชุดไปงานบวช"  ← User mentioned OCCASION = งานบวช
        AI: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?"

Turn 2: User: "ผู้ชาย"
        AI: "ชุดนี้เอาไว้ใส่โอกาสไหนคะ?"  ← ❌ REDUNDANT! Occasion already mentioned in Turn 1
```
**Why this is BAD:** User already said "งานบวช" in Turn 1. Asking again wastes time.

---

**GOOD EXAMPLE 1 (DO THIS):**
```
Turn 1: User: "หาชุดไปงานบวช"  ← OCCASION = งานบวช (detected)
        AI: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?"  ← Only asks about MISSING gender

Turn 2: User: "ผู้ชาย"  ← GENDER = ผู้ชาย (detected)
        AI: "ได้เลย งานบวชต้องลุคนี้เลย 💼✨

        [PROVIDES RECOMMENDATIONS using BOTH: occasion=งานบวช + gender=ผู้ชาย]"
        ← ✅ REMEMBERS both pieces of information!
```
**Why this is GOOD:** AI remembered "งานบวช" from Turn 1 and combined it with "ผู้ชาย" from Turn 2.

---

**GOOD EXAMPLE 2 (Complete Info Upfront):**
```
Turn 1: User: "หาชุดไปงานบวช สำหรับผู้ชาย งบ 5000"
        ← OCCASION = งานบวช, GENDER = ผู้ชาย, BUDGET = 5000 (all detected)

        AI: "ได้เลย งานบวชต้องลุคนี้เลย 💼✨

        [PROVIDES RECOMMENDATIONS IMMEDIATELY - no clarifications needed]"
        ← ✅ All information provided, zero questions asked
```
**Why this is GOOD:** User gave complete information, AI recognized it and skipped all clarifications.

---

**GOOD EXAMPLE 3 (Two Clarifications with Context):**
```
Turn 1: User: "หาชุดไปงาน"  ← Very vague, no parameters detected
        AI: "กำลังหาชุดไปงานไหนน้า งานแต่ง งานบวช งานประชุม?"  ← Clarification #1

Turn 2: User: "งานบวช"  ← OCCASION = งานบวช (detected), GENDER still missing
        AI: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?"  ← Clarification #2, REMEMBERS occasion

Turn 3: User: "ผู้ชาย"  ← GENDER = ผู้ชาย (detected)
        AI: "ได้เลย งานบวชต้องลุคนี้เลย 💼✨

        [PROVIDES RECOMMENDATIONS using: occasion=งานบวช + gender=ผู้ชาย]"
        ← ✅ Used information from Turn 2 AND Turn 3
```
**Why this is GOOD:** AI tracked context across 3 turns, never asked redundant questions.

### Context Memory Decision Tree

Use this decision tree BEFORE asking each clarification:

```
START
  ↓
Check conversation history for GENDER keywords
  ↓
Found? → YES → SKIP gender question, store: context.gender = [detected value]
       → NO → Ask: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?"
  ↓
Check conversation history for OCCASION keywords
  ↓
Found? → YES → SKIP occasion question, store: context.occasion = [detected value]
       → NO → Ask: "ชุดนี้เอาไว้ใส่โอกาสไหนคะ?"
  ↓
Check conversation history for CLIMATE/DESTINATION keywords
  ↓
Found? → YES → SKIP climate question, store: context.climate = [detected value]
       → NO → (Only ask if relevant, e.g., travel)
  ↓
Check clarification count
  ↓
Asked 2 questions already? → YES → FORCE RECOMMENDATIONS with available context
                          → NO → Continue to next clarification if needed
  ↓
PROVIDE RECOMMENDATIONS using ALL accumulated context
```
```

**Acceptance Criteria:**
- New section added to System Prompt v2.2
- All examples are clear and demonstrate correct behavior
- Decision tree logic is easy to follow

### Code Changes

**Files to Modify:**

1. **`frontend/lib/prompts/system-prompt-v2.ts`**
   - Add Context Awareness section
   - Add anti-pattern examples
   - Add decision tree

2. **`frontend/lib/openrouter-client.ts`**
   - Add `extractContext()` function
   - Add `ConversationContext` interface
   - Modify `sendChatCompletion()` to accept messages array
   - Inject context into system prompt

3. **`frontend/components/chat/InteractiveChatPanel.tsx`**
   - Pass full `conversation.messages` array to OpenRouter client
   - No other changes needed (already tracks messages)

4. **`frontend/components/chat/ChatInterface.tsx`** (if production chat exists)
   - Pass conversation history to OpenRouter client
   - Ensure context tracking works in production

**Minimal Code Footprint:**
- ~100 lines for context extraction logic
- ~50 lines for prompt enhancement
- ~20 lines for integration changes
- Total: ~170 lines of new code

---

## Technical Considerations

### Context Extraction Logic

**Keyword Matching Strategy:**

```typescript
// Example implementation
function extractContext(messages: Message[]): ConversationContext {
  const context: ConversationContext = {};

  // Combine all user messages
  const userText = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Gender detection - check inclusive terms first
  if (/เพศไหนก็ได้|ทุกเพศ|all genders?|unisex|gender-?neutral|non-?binary/.test(userText)) {
    context.gender = 'all'; // Represents all genders / gender-neutral
  } else if (/ผู้หญิง|women|female|ผญ|หญิง/.test(userText)) {
    context.gender = 'ผู้หญิง';
  } else if (/ผู้ชาย|men|male|ผช|ชาย/.test(userText)) {
    context.gender = 'ผู้ชาย';
  }
  // If no gender keywords found, context.gender remains undefined
  // System will ask with inclusive options: "ผู้หญิง ผู้ชาย หรือเพศไหนก็ได้?"

  // Occasion detection
  const occasions = {
    'งานบวช': /งานบวช|บวช/,
    'งานแต่ง': /งานแต่ง|แต่งงาน|wedding/,
    'ทำงาน': /ทำงาน|work|office|ออฟฟิศ/,
    'เดท': /เดท|date|นัดพบ/,
    'ปาร์ตี้': /ปาร์ตี้|party|งานเลี้ยง/,
    // ... more occasions
  };

  for (const [occasion, pattern] of Object.entries(occasions)) {
    if (pattern.test(userText)) {
      context.occasion = occasion;
      break;
    }
  }

  // Budget detection (simple regex for numbers)
  const budgetMatch = userText.match(/(\d{3,5})(?:-(\d{3,5}))?/);
  if (budgetMatch) {
    context.budget = budgetMatch[0];
  }

  // Climate/destination detection
  if (/ร้อน|hot|tropical|เมืองร้อน/.test(userText)) {
    context.climate = 'hot';
  } else if (/หนาว|cold|winter|เมืองหนาว/.test(userText)) {
    context.climate = 'cold';
  }

  // Style detection
  const styles = {
    'casual': /casual|สบาย|ลำลอง/,
    'formal': /formal|เป็นทางการ|สุภาพ/,
    'smart casual': /smart casual/,
  };

  for (const [style, pattern] of Object.entries(styles)) {
    if (pattern.test(userText)) {
      context.style = style;
      break;
    }
  }

  return context;
}
```

**Performance Considerations:**
- Regex patterns are lightweight and fast
- Context extraction runs once per message (acceptable overhead)
- No external API calls or ML models needed

### Integration with Existing Code

**OpenRouter Client Enhancement:**

```typescript
// Before (PRD-0008):
async sendChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const { modelId, userMessage, productContext } = options;
  const systemPrompt = this.getSystemPrompt();
  // ... send to API
}

// After (PRD-0009):
async sendChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const { modelId, userMessage, productContext, conversationHistory } = options;

  // Extract context from conversation
  const context = extractContext(conversationHistory || []);

  // Inject context into system prompt
  let systemPrompt = this.getSystemPrompt();
  if (Object.keys(context).length > 0) {
    systemPrompt += `\n\n${formatContextForPrompt(context)}`;
  }

  // ... send to API
}
```

### Temporary Solution vs PRD-0007

**Differences from System Prompt v3.0:**

| Feature | PRD-0009 (v2.2 + Context) | PRD-0007 (v3.0) |
|---------|---------------------------|-----------------|
| Context Tracking | Keyword matching | State machine |
| Confidence Scoring | No | Yes |
| Intent Classification | No | Yes |
| Conversation Phases | Implicit | Explicit states |
| Rollback Safety | In-place update | Separate version |
| Implementation Time | 24-48 hours | Multiple weeks |

**Why This Approach:**
- Fast to implement and deploy
- Low risk (minimal code changes)
- Addresses immediate user pain point
- Bridges gap until v3.0 is ready
- Can be easily reverted if issues arise

---

## Success Metrics

### Immediate Validation (Manual Testing)

**Test Scenario 1: Clear Information Upfront**
```
Input: "หาชุดไปงานบวช สำหรับผู้ชาย งบ 5000 บาท"
Expected: Immediate recommendations, ZERO clarifications
Result: [ ] Pass [ ] Fail
```

**Test Scenario 2: Single Clarification with Context Memory**
```
Turn 1: "หาชุดไปงานบวช"
Expected: Ask about gender only
Turn 2: "ผู้ชาย"
Expected: Provide recommendations (remember งานบวช from Turn 1)
Result: [ ] Pass [ ] Fail
```

**Test Scenario 3: Two Clarifications with Full Context Tracking**
```
Turn 1: "หาชุดไปงาน"
Expected: Ask about occasion
Turn 2: "งานบวช"
Expected: Ask about gender (remember งานบวช)
Turn 3: "ผู้ชาย"
Expected: Provide recommendations (use both งานบวช and ผู้ชาย)
Result: [ ] Pass [ ] Fail
```

### Automated Testing (Required)

**Unit Tests:**
- [ ] Context extraction correctly identifies gender (10 test cases)
- [ ] Context extraction correctly identifies occasion (15 test cases)
- [ ] Context extraction correctly identifies climate (8 test cases)
- [ ] Context extraction correctly identifies budget (5 test cases)
- [ ] Context extraction correctly identifies style (8 test cases)

**Integration Tests:**
- [ ] Context is injected into system prompt correctly
- [ ] OpenRouter client receives and processes conversation history
- [ ] InteractiveChatPanel passes messages array correctly
- [ ] Production chat passes messages array correctly

**End-to-End Tests:**
- [ ] Test Scenario 1 automation (clear info → zero questions)
- [ ] Test Scenario 2 automation (1 clarification with memory)
- [ ] Test Scenario 3 automation (2 clarifications with full context)
- [ ] Regression: Loop prevention still works (MAX 2 clarifications)
- [ ] Regression: Template A/B enforcement still works
- [ ] Regression: Friendly tone still present

**Target:** 100% pass rate on all automated tests

### A/B Testing with Real Users

**Metrics to Track:**

1. **Average Clarification Count**
   - Baseline (v2.2 without context): ~1.8 clarifications per conversation
   - Target (v2.2 with context): <1.2 clarifications per conversation
   - Goal: **33% reduction in clarification count**

2. **Redundant Question Rate**
   - Baseline: ~35% of conversations have redundant questions
   - Target: <5% of conversations have redundant questions
   - Goal: **86% reduction in redundant questions**

3. **User Satisfaction (Post-Chat Survey)**
   - Question: "Did the AI understand your needs quickly?"
   - Baseline: 6.2/10 average rating
   - Target: 8.0/10 average rating
   - Goal: **29% improvement in satisfaction**

4. **Conversation Completion Rate**
   - Baseline: 78% of users complete the conversation
   - Target: 90% of users complete the conversation
   - Goal: **15% increase in completion rate**

**A/B Test Setup:**
- 50% users on v2.2 without context (control)
- 50% users on v2.2 with context (treatment)
- Run for 7 days or 1000 conversations (whichever comes first)
- Statistical significance threshold: p < 0.05

---

## Open Questions

### Question 1: Ambiguous Context Scenarios

**Issue:** What if context extraction is incorrect?

**Example:**
```
User: "หาชุดเจ้าสาว" (bride outfit - implies ผู้หญิง)
Context extraction: Detects "เจ้าสาว" → Sets gender = ผู้หญิง
But what if user wants to see options before deciding?
```

**Options:**
- A) Trust extraction, assume it's correct (simpler, faster)
- B) Add confidence thresholds (more complex, safer)
- C) Always confirm extracted context before recommending

**Decision Needed:** [ ] A [ ] B [ ] C

### Question 2: Multi-Value Parameters

**Issue:** User mentions multiple occasions in one message

**Example:**
```
User: "หาชุดที่ใส่ได้ทั้งทำงาน และไปเดท" (work AND date)
Context extraction: Should store "ทำงาน" or "เดท" or both?
```

**Options:**
- A) Use first mention only
- B) Use last mention only
- C) Store multiple values, recommend versatile outfits

**Decision Needed:** [ ] A [ ] B [ ] C

### Question 3: Context Lifespan

**Issue:** How long should context persist?

**Example:**
```
Turn 1-3: User asks about work outfits (context: occasion=work)
Turn 4: User says "แล้วก็อยากหาชุดไปงานแต่งด้วย" (switches topic)
Should we reset context.occasion or accumulate?
```

**Options:**
- A) Context resets on explicit topic change ("แล้วก็...", "เปลี่ยนใจ...")
- B) Context accumulates forever (until session ends)
- C) Context resets after providing recommendations

**Decision Needed:** [ ] A [ ] B [ ] C

### Question 4: Error Handling

**Issue:** What if context extraction throws an error?

**Options:**
- A) Fail silently, proceed without context (safe fallback)
- B) Log error, show warning to user
- C) Retry with simpler extraction logic

**Decision Needed:** [ ] A [ ] B [ ] C

---

## Implementation Plan

### Phase 1: Prompt Engineering (Hours 1-8)
- [ ] Draft Context Awareness section for System Prompt v2.2
- [ ] Write anti-pattern examples (BAD vs GOOD)
- [ ] Create decision tree flowchart
- [ ] Add keyword lists for all 5 parameters
- [ ] Internal review and testing

### Phase 2: Code Implementation (Hours 9-20)
- [ ] Implement `extractContext()` function with regex patterns
- [ ] Implement `formatContextForPrompt()` helper
- [ ] Update `ChatCompletionOptions` interface
- [ ] Modify `OpenRouterClient.sendChatCompletion()`
- [ ] Update InteractiveChatPanel integration
- [ ] Update production chat integration (if exists)

### Phase 3: Testing (Hours 21-36)
- [ ] Write unit tests for context extraction
- [ ] Write integration tests for prompt injection
- [ ] Write E2E tests for 3 scenarios
- [ ] Manual testing with Thai conversation examples
- [ ] Regression testing for v2.2 features

### Phase 4: Deployment (Hours 37-48)
- [ ] Deploy to test environment
- [ ] Smoke test with real test mode
- [ ] Deploy to production (in-place update to v2.2)
- [ ] Set up A/B test tracking
- [ ] Monitor error logs and user feedback

---

## Rollback Plan

### If Critical Issues Occur

**Symptoms:**
- Context extraction fails frequently (>5% error rate)
- Redundant questions increase instead of decrease
- User complaints about incorrect assumptions
- LLM API costs spike unexpectedly

**Rollback Steps:**

1. **Immediate Revert (5 minutes)**
   ```typescript
   // In OpenRouterClient.sendChatCompletion()
   // Comment out context extraction and injection
   // const context = extractContext(conversationHistory || []); // DISABLED
   // systemPrompt += formatContextForPrompt(context); // DISABLED
   ```

2. **Revert Prompt Changes (10 minutes)**
   - Restore System Prompt v2.2 from git history
   - Remove Context Awareness section
   - Redeploy

3. **Verify Rollback Success (15 minutes)**
   - Test 3 scenarios to ensure v2.2 baseline behavior restored
   - Monitor error logs for 1 hour
   - Notify users of temporary rollback

**Prevention:**
- Feature flag: `ENABLE_CONTEXT_TRACKING` environment variable
- Gradual rollout: Enable for 10% → 50% → 100% of users
- Real-time monitoring dashboard

---

## Dependencies

### Internal Dependencies
- **PRD-0008** (System Prompt Integration Fix) - Must be completed first
- System Prompt v2.2 must be stable and deployed
- Interactive Test Mode must be functional
- OpenRouter client must be working

### External Dependencies
- OpenRouter API must accept enhanced system prompts (no length limits)
- LLMs (Claude, Gemini) must handle context injection properly
- No changes to product catalog or recommendation logic

### Team Dependencies
- Frontend developer for code implementation
- QA engineer for automated test suite
- Product manager for A/B test setup and monitoring

---

## Risk Assessment

### High Risk
- **Context extraction accuracy** - Regex may miss edge cases
  - Mitigation: Extensive test coverage, gradual rollout

- **LLM behavior unpredictability** - Model may ignore context instructions
  - Mitigation: Multiple prompt variations, A/B testing

### Medium Risk
- **Performance overhead** - Context extraction on every message
  - Mitigation: Lightweight regex, no external API calls

- **Backward compatibility** - May break existing v2.2 behavior
  - Mitigation: Comprehensive regression testing, feature flag

### Low Risk
- **User confusion** - Users may not notice the improvement
  - Mitigation: Track metrics, user surveys

---

## Appendix

### Related Documentation

- **PRD-0007:** System Prompt v3.0 - Clarification Flow Fix (full state machine approach)
- **PRD-0008:** Interactive Test Mode - System Prompt Integration Fix (MAX 2 clarifications)
- **DialogTemplate14-2.md:** Original conversation flow requirements
- **System Prompt v2.2:** `frontend/lib/prompts/system-prompt-v2.ts`

### Test Data Examples

**Gender Keywords:**
- **Thai - Specific Genders**: ผู้หญิง, ผญ, หญิง (female), ผู้ชาย, ผช, ชาย (male)
- **English - Specific Genders**: women, men, male, female, woman, man, girl, boy
- **Thai - Inclusive/All Genders**: เพศไหนก็ได้ (any gender), ทุกเพศ (all genders)
- **English - Inclusive/All Genders**: all genders, unisex, gender-neutral, non-binary, gender neutral, androgynous
- **Clarification Question Format**: "อยากหาชุดแบบไหนคะ? ผู้หญิง ผู้ชาย หรือเพศไหนก็ได้? 👔👗" (includes all-gender option)

**Occasion Keywords:**
- งานบวช (ordination), งานแต่ง (wedding), ทำงาน (work), ออฟฟิศ (office)
- เดท (date), ปาร์ตี้ (party), เที่ยว (travel), ท่องเที่ยว (tourism)
- งานเลี้ยง (dinner/party), คาเฟ่ (cafe), ออกกำลังกาย (exercise/sport)

**Climate Keywords:**
- ร้อน (hot), หนาว (cold), อบอุ่น (warm), เย็น (cool)
- tropical, winter, summer, เมืองร้อน, เมืองหนาว

---

**Document Version:** 1.2
**Status:** Ready for Implementation
**Last Updated:** 2025-10-16 (Comprehensive all-gender support)
**Changelog:**
- v1.2 (2025-10-16): Expanded to comprehensive all-gender support (ทุกเพศ, all genders, gender-neutral, non-binary)
- v1.1 (2025-10-16): Added unisex/gender-neutral support (เพศไหนก็ได้, unisex)
- v1.0 (2025-10-16): Initial PRD creation

**Next Steps:** Begin Phase 1 (Prompt Engineering) - ETA 8 hours
**Target Completion:** 48 hours from approval
