# Conversational Loop Analysis - Sub-task 9.1

**Date:** 2025-10-14
**Related Task:** tasks-0006-prd-system-prompt-enhancement-guardrails-LOOP-FIX.md
**Issue:** AI creates conversational loops instead of following structured dialogue flow

---

## Problem Statement

The AI agent engages in extended chitchat and asks multiple questions in sequence, creating a loop before providing outfit recommendations, contrary to DialogTemplate14-2 specifications.

## Expected Behavior (per DialogTemplate14-2.md)

1. Ask **1-2 clarifying questions MAXIMUM** (only if truly needed)
2. **IMMEDIATELY** move to outfit recommendations (CLOTHS) or tips (OTHER)
3. **NO extended back-and-forth** dialogue before recommendations
4. Follow **Template A or Template B structure strictly**

## Current Behavior (Evidence from Screenshot)

- Multiple turns of casual Thai conversation
- Extended question-asking without moving to recommendations
- Conversational loop pattern instead of structured response
- More than 2 clarification questions before providing recommendations

---

## Root Cause Analysis

### 1. No Turn Counter Enforcement

**Location:** `frontend/lib/services/ai-chat-service.ts` (lines 295-321)

**Issue:**
- Session context tracks `askedClarifications` but doesn't count total turns
- No hard limit prevents asking >2 clarifications
- `getClarificationsNeeded()` checks if specific types were asked but not total count

**Code Evidence:**
```typescript
// Current code - NO turn limit
const clarificationsNeeded = getClarificationsNeeded(
  userQuery,
  request.conversationHistory,
  sessionContext.askedClarifications,
  sessionContext.conversationContext
)

// Missing: Check if clarificationTurnCount >= 2, force recommendations
```

**Result:** AI can ask gender, then occasion, then budget, then climate, then style → Loop!

---

### 2. No "Force Recommendation Mode"

**Location:** `frontend/lib/prompts/system-prompt-v2.ts`

**Issue:**
- System prompt describes clarification priority (lines 86-138) but lacks imperative enforcement
- Missing instruction: "After 2 clarifications, MUST provide recommendations"
- No escalation rule for incomplete information

**Code Evidence:**
```typescript
// Current prompt section - TOO PERMISSIVE
### Clarification Rules
1. **ONE QUESTION AT A TIME** - Never ask multiple questions in one message
2. **DON'T ASK IF ALREADY PROVIDED** - Check conversation history first
3. **ACKNOWLEDGE ANSWERS** - After user answers, acknowledge naturally
4. **BE CONVERSATIONAL** - Don't feel like a form/survey

// Missing:
// 5. **MAX 2 CLARIFICATIONS** - After 2 questions, PROVIDE RECOMMENDATIONS
// 6. **FORCE MODE** - If unclear after 2 questions, make best-effort recommendations
```

**Result:** AI interprets "be conversational" as permission to keep asking questions

---

### 3. Lack of Template Structure Validation

**Location:** No validation in `ai-chat-service.ts`

**Issue:**
- Templates defined in system prompt (lines 260-307) but not enforced
- No check that response includes products (Template A) or tips (Template B)
- No detection of "response is just another question"

**Missing Implementation:**
```typescript
// Should exist but doesn't:
function validateTemplateCompliance(response: string, category: 'CLOTHS' | 'OTHER'): boolean {
  if (category === 'CLOTHS') {
    // Check for products, prices, links
    return hasProducts && hasPrices && hasLinks
  } else {
    // Check for tips, no prices, no links
    return hasTips && !hasPrices && !hasLinks
  }
}
```

**Result:** AI can deviate from template structure without correction

---

### 4. No Loop Detection Mechanism

**Location:** Missing from entire codebase

**Issue:**
- No interceptor to catch responses that are only questions
- No detection of exceeding turn limit without recommendations
- No retry logic when loop detected

**Missing Implementation:**
```typescript
// Should exist but doesn't:
function detectLoop(response: string, turnCount: number): boolean {
  const isOnlyQuestion = response.includes('?') && !response.includes('แนะนำ')
  const exceedsTurnLimit = turnCount > 2
  return isOnlyQuestion && exceedsTurnLimit
}
```

**Result:** Loops go undetected and uncorrected

---

### 5. Missing Dialogue Phase Tracking

**Location:** `frontend/lib/types/chat-types.ts`

**Issue:**
- SessionContext doesn't track conversation phase
- Can't prevent returning to 'clarification' after starting 'recommendation'
- No state machine for conversation flow

**Current SessionContext:**
```typescript
export interface SessionContext {
  conversationId: string
  recommendedProductIds: string[]
  askedClarifications: ClarificationType[]
  conversationContext: {
    gender?: 'men' | 'women'
    occasion?: string
    budget?: number
    destination?: string
  }
  createdAt: Date
  lastInteraction: Date
}

// Missing:
// dialoguePhase: 'clarification' | 'recommendation' | 'follow-up'
// clarificationTurnCount: number
```

**Result:** No state enforcement → can loop back to clarifications indefinitely

---

## Identified Loop Patterns

### Pattern 1: Multiple Clarification Turns (Most Common)

**Trigger:** Vague initial request

**Example Flow:**
```
Turn 1: User: "หาชุด"
        AI: "ผู้หญิงหรือผู้ชาย?" ← Clarification 1

Turn 2: User: "ผู้หญิง"
        AI: "โอกาสไหนคะ?" ← Clarification 2

Turn 3: User: "ไปทำงาน"
        AI: "งบประมาณเท่าไหร่?" ← Clarification 3 (LOOP!)

Turn 4: User: "5000"
        AI: "ชอบสไตล์ไหน?" ← Clarification 4 (STILL LOOPING!)
```

**Root Cause:** No max turn limit, each clarification leads to another

---

### Pattern 2: Unnecessary Confirmations

**Trigger:** All information already provided

**Example Flow:**
```
Turn 1: User: "ชุดไปงานแต่ง งบ 5000" (gender, occasion, budget all stated)
        AI: "งานแต่งงานเหรอคะ? งบ 5000 ใช่มั้ย?" ← Unnecessary confirmation

Turn 2: User: "ใช่"
        AI: [Finally provides recommendations]
```

**Root Cause:** AI not detecting all information was already provided

---

### Pattern 3: Extended Chitchat

**Trigger:** "Be conversational" interpreted as chatty

**Example Flow:**
```
Turn 1: User: "อยากหาชุด"
        AI: "ยินดีค่ะ! วันนี้มีโอกาสพิเศษหรอคะ?"

Turn 2: User: "ไม่ได้มีอะไร แค่อยากหาชุดใหม่"
        AI: "เข้าใจค่ะ ชอบสไตล์แบบไหน?" ← Still chatting

Turn 3: User: "ก็ธรรมดาๆ"
        AI: "สไตล์ธรรมดาดีนะคะ งบประมาณช่วงไหน?" ← More chatting
```

**Root Cause:** System prompt encourages conversation, lacks hard stop

---

### Pattern 4: Follow-up Questions After Clarification

**Trigger:** User gives short/vague answer

**Example Flow:**
```
Turn 1: User: "หาชุดไปทำงาน"
        AI: "ผู้หญิงหรือผู้ชาย?"

Turn 2: User: "ผู้หญิง"
        AI: "เข้าใจค่ะ แล้วชอบสไตล์แบบไหนเหรอคะ? สมาร์ท casual หรือแบบ formal?" ← Follow-up question instead of recommendation
```

**Root Cause:** No instruction to "proceed directly to recommendations" after answer

---

## Current Flow vs Expected Flow

### Current Flow (PROBLEMATIC)
```
User Query → Clarification 1 → Answer 1 → Clarification 2 → Answer 2
→ Clarification 3 → Answer 3 → Clarification 4 → ... → LOOP
```

### Expected Flow (CORRECT)
```
User Query → Clarification 1 (if needed) → Answer 1
→ Clarification 2 (if needed) → Answer 2
→ FORCE RECOMMENDATIONS (even if incomplete info)
```

---

## Files Requiring Modification

### Priority 1: Immediate Fixes

1. **`frontend/lib/prompts/system-prompt-v2.ts`**
   - Add explicit turn limit: "MAXIMUM 2 clarifications"
   - Add force recommendation rule
   - Add anti-loop examples (BAD vs GOOD patterns)

2. **`frontend/lib/types/chat-types.ts`**
   - Add `dialoguePhase: 'clarification' | 'recommendation' | 'follow-up'`
   - Add `clarificationTurnCount: number`

3. **`frontend/lib/utils/clarification-detector.ts`**
   - Add `clarificationTurnCount` parameter
   - Return `null` (no clarification) if count >= 2

4. **`frontend/lib/services/ai-chat-service.ts`**
   - Track clarification turns
   - Inject "proceed to recommendations" after clarification answered
   - Implement turn limit enforcement

### Priority 2: Advanced Prevention

5. **`frontend/lib/utils/conversation-flow-tracker.ts`** (NEW)
   - Track clarification vs recommendation turns
   - Flag excessive clarifications

6. **`frontend/lib/utils/loop-detector.ts`** (NEW)
   - Detect response is only questions
   - Detect exceeding turn limit
   - Trigger force recommendation mode

7. **`frontend/lib/utils/response-validator.ts`** (NEW)
   - Validate Template A/B compliance
   - Detect loop patterns
   - Log validation failures

---

## Specific Prompt Sections Causing Loops

### Section 1: "Be Conversational" (Line 244)
```typescript
**Note: Be conversational & smart, not like a form questionnaire**
```

**Issue:** Too vague, can be interpreted as "keep chatting"
**Fix:** Add constraint: "Be conversational but LIMIT to max 2 clarifications"

---

### Section 2: Clarification Priority (Lines 86-138)
```typescript
### Priority Order
Ask ONE clarifying question at a time in this order:
1. Gender (PRIORITY: HIGH)
2. Occasion (PRIORITY: HIGH)
3. Climate/Destination (PRIORITY: MEDIUM)
4. Budget (PRIORITY: LOW/OPTIONAL)
```

**Issue:** Lists 4 priorities but no max limit stated
**Fix:** Add: "MAXIMUM 2 clarifications total. After 2, provide recommendations."

---

### Section 3: Clarification Rules (Lines 137-154)
```typescript
### Clarification Rules
1. ONE QUESTION AT A TIME
2. DON'T ASK IF ALREADY PROVIDED
3. ACKNOWLEDGE ANSWERS
4. BE CONVERSATIONAL
```

**Issue:** No rule about max turns or forcing recommendations
**Fix:** Add rules 5-6:
```
5. MAXIMUM 2 CLARIFICATIONS - After 2 questions, MUST provide recommendations
6. FORCE RECOMMENDATIONS - If unclear after 2 questions, make best-effort recommendations
```

---

## Recommendations for Implementation

### Immediate Actions (Sub-tasks 9.2-9.4)

1. **Update System Prompt** with:
   - Explicit "MAX 2 CLARIFICATIONS" rule
   - "Force Recommendation Mode" after 2 turns
   - Anti-loop examples (BAD vs GOOD patterns)

2. **Add Turn Counter** to session context:
   - Track `clarificationTurnCount`
   - Track `dialoguePhase`

3. **Enforce Turn Limit** in clarification detector:
   - Return `null` if `clarificationTurnCount >= 2`
   - Force proceed to recommendations

### Progressive Enhancements (Sub-tasks 9.5-9.10)

4. **Add "Proceed to Recommendations" Injection**:
   - After user answers clarification
   - Inject system instruction to force recommendations

5. **Implement Loop Detection**:
   - Detect responses with only questions
   - Detect exceeding turn limit
   - Retry with force instruction

6. **Add Template Validation**:
   - Validate Template A/B compliance
   - Retry if validation fails
   - Log failures for monitoring

---

## Success Metrics

✅ **Metric 1:** No conversation exceeds 2 clarification turns
✅ **Metric 2:** AI provides recommendations by Turn 3 at latest
✅ **Metric 3:** 0% loop pattern detection in testing
✅ **Metric 4:** Template A/B compliance rate >95%
✅ **Metric 5:** Clarification-to-recommendation ratio <0.5

---

## Testing Strategy

### Test Scenario 1: Vague Request
- Input: "หาชุด"
- Expected: Max 2 clarifications → Recommendations

### Test Scenario 2: Complete Request
- Input: "หาชุดไปงานแต่ง งบ 5000 ผู้หญิง"
- Expected: 0 clarifications → Immediate recommendations

### Test Scenario 3: Partial Request
- Input: "หาชุดไปทำงาน"
- Expected: 1 clarification (gender) → Recommendations

### Test Scenario 4: Short Answers
- Input: "หาชุด" → "ผู้หญิง" → "ก็ธรรมดาๆ"
- Expected: Max 2 clarifications even with vague answers → Recommendations

---

## Document Completion

**Sub-task 9.1:** ✅ COMPLETE
**Files Created:** `frontend/LOOP_ANALYSIS.md`
**Next Sub-task:** 9.2 - Add "Conversation Flow Guardrails" section to system prompt

---

**Analysis Date:** 2025-10-14
**Analyst:** AI Development Team
**Status:** Analysis Complete - Ready for Implementation
