# Clarification Loop Fix - Implementation Summary

## Problem Identified

The AI was stuck in an **infinite loop asking the same clarification questions** repeatedly, even after users had already provided the information.

### Root Cause

The clarification logic in `/lib/services/ai-chat-service.ts` was:
1. **Always analyzing** the current message only, without checking conversation history
2. **Never tracking** which clarifications had already been asked
3. **Not extracting** information from previous user responses

### Example of the Loop:
```
User: "งานนวดเป็นฟิสิโอบำรุกร่างกายทุกอย่าง!"
AI: "อยากทราบหมวดผู้หญิงหรือผู้ชายคะ?"
User: "ผู้หญิง"
AI: "อยากหาชุดผู้หญิงหรือผู้ชายคะ? 👔👗" ← LOOP! Re-asking
```

---

## Solution Implemented

### 1. Enhanced SessionContext Type
**File**: `/lib/types/chat-types.ts`

Added two new fields to track state:
```typescript
export interface SessionContext {
  recommendedProductIds: string[];
  sessionId?: string;
  createdAt?: Date;

  // NEW: Track which clarifications have been asked
  askedClarifications?: Set<'gender' | 'occasion' | 'destination' | 'budget'>;

  // NEW: Store extracted information from conversation
  conversationContext?: {
    gender?: 'men' | 'women';
    occasion?: string;
    destination?: string;
    budget?: number;
  };
}
```

### 2. Updated Session Context Utilities
**File**: `/lib/utils/session-context.ts`

#### Modified `createSessionContext()`:
```typescript
export function createSessionContext(sessionId?: string): SessionContext {
  return {
    recommendedProductIds: [],
    sessionId: sessionId || generateSessionId(),
    createdAt: new Date(),
    askedClarifications: new Set(),  // Track asked questions
    conversationContext: {},         // Store extracted info
  };
}
```

#### Enhanced `updateSessionContext()`:
```typescript
export function updateSessionContext(
  context: SessionContext,
  newProductIds: string[],
  askedClarification?: 'gender' | 'occasion' | 'destination' | 'budget',  // NEW
  conversationContext?: Partial<SessionContext['conversationContext']>     // NEW
): SessionContext {
  // Tracks which clarifications were asked
  const updatedAskedClarifications = new Set(context.askedClarifications || new Set());
  if (askedClarification) {
    updatedAskedClarifications.add(askedClarification);
  }

  // Merges conversation context
  const updatedConversationContext = {
    ...context.conversationContext,
    ...conversationContext,
  };

  return {
    ...context,
    recommendedProductIds: Array.from(uniqueIds),
    askedClarifications: updatedAskedClarifications,
    conversationContext: updatedConversationContext,
  };
}
```

### 3. Enhanced Clarification Detector
**File**: `/lib/utils/clarification-detector.ts`

#### Updated `getClarificationsNeeded()`:
```typescript
export function getClarificationsNeeded(
  query: UserQuery,
  conversationHistory?: Array<{ role: string; content: string }>,  // NEW
  askedClarifications?: Set<'gender' | 'occasion' | 'destination' | 'budget'>  // NEW
): ClarificationNeeded[] {
  const clarifications: ClarificationNeeded[] = [];
  const asked = askedClarifications || new Set();

  // NEW: Check conversation history for already provided information
  const historyContext = extractInfoFromHistory(conversationHistory || []);

  // Priority 1: Gender
  if (!query.hasGender && !historyContext.hasGender && !asked.has('gender')) {
    clarifications.push({
      type: 'gender',
      question: 'อยากหาชุดผู้หญิงหรือผู้ชายคะ? 👔👗',
      priority: 1,
    });
  }

  // Similar logic for occasion, destination, budget...
  // ...

  return clarifications.sort((a, b) => a.priority - b.priority);
}
```

#### New Helper Function `extractInfoFromHistory()`:
```typescript
function extractInfoFromHistory(history: Array<{ role: string; content: string }>): {
  hasGender: boolean;
  hasOccasion: boolean;
  hasDestination: boolean;
  hasBudget: boolean;
} {
  // Analyze ALL messages to find information
  const allMessages = history.map(m => m.content).join(' ');

  return {
    hasGender: detectGender(allMessages) !== undefined,
    hasOccasion: detectOccasion(allMessages) !== undefined,
    hasDestination: detectDestination(allMessages) !== undefined,
    hasBudget: detectBudget(allMessages) !== undefined,
  };
}
```

### 4. Updated AI Chat Service
**File**: `/lib/services/ai-chat-service.ts`

#### Enhanced Clarification Logic:
```typescript
// STEP 2: Analyze user query for missing information
// Pass conversation history and already asked clarifications to prevent loops
const userQuery = analyzeUserQuery(request.message)
const clarificationsNeeded = getClarificationsNeeded(
  userQuery,
  request.conversationHistory,      // NEW: Pass history
  sessionContext.askedClarifications // NEW: Pass asked clarifications
)

// If clarification is needed, ask clarifying question
if (clarificationsNeeded.length > 0) {
  const clarificationQuestion = formatClarificationQuestions(clarificationsNeeded)
  const clarificationType = clarificationsNeeded[0].type

  console.log(`[AI Chat] Clarification needed: ${clarificationType}`)

  // NEW: Update session to track this clarification was asked
  const updatedSession = updateSessionContext(
    sessionContext,
    [],                  // No new products
    clarificationType    // Track which clarification was asked
  )

  return {
    message: clarificationQuestion,
    recommendedProducts: [],
    sessionContext: updatedSession,  // Return updated session
  }
}
```

---

## How It Prevents the Loop

### Before (Broken):
1. User: "ผู้หญิง" (answers gender)
2. AI analyzes **current message only** → No gender detected in this specific message
3. AI asks: "อยากหาชุดผู้หญิงหรือผู้ชายคะ?" **AGAIN**
4. **LOOP CONTINUES**

### After (Fixed):
1. User: "ผู้หญิง" (answers gender)
2. AI checks:
   - ✅ Current message: No gender
   - ✅ **Conversation history**: Gender = "women" (detected)
   - ✅ **Already asked**: 'gender' is in `askedClarifications`
3. AI **SKIPS** gender clarification
4. AI proceeds to next priority or recommendations
5. **NO LOOP!**

---

## Testing Checklist

### Test Scenario 1: Basic Clarification Flow
```
User: "แนะนำชุดหน่อย"
Expected: AI asks "อยากหาชุดผู้หญิงหรือผู้ชายคะ?"

User: "ผู้หญิง"
Expected: AI should NOT re-ask gender, proceeds with recommendations
```

### Test Scenario 2: Multiple Clarifications
```
User: "แนะนำชุดสวยๆ"
Expected: AI asks for gender first

User: "ผู้หญิงค่ะ"
Expected: AI asks for occasion (if still unclear)

User: "ไปงานแต่งงาน"
Expected: AI provides outfit recommendations, does NOT re-ask gender or occasion
```

### Test Scenario 3: Information in Conversation History
```
User: "หาชุดผู้หญิงไปทำงาน"
Expected: AI should NOT ask gender or occasion (both are clear)

User: "มีอะไรแนะนำมั้ย"
Expected: AI provides recommendations without re-asking (info still in history)
```

### Test Scenario 4: Session Reset
```
User: "เริ่มใหม่"
Expected: Session resets, askedClarifications cleared

User: "แนะนำชุดหน่อย"
Expected: AI can ask clarifications again (new session)
```

---

## Files Modified

1. `/lib/types/chat-types.ts` - Added `askedClarifications` and `conversationContext` to SessionContext
2. `/lib/utils/session-context.ts` - Enhanced session creation and update functions
3. `/lib/utils/clarification-detector.ts` - Added history checking and `extractInfoFromHistory()`
4. `/lib/services/ai-chat-service.ts` - Pass history and asked clarifications to prevent loops

---

## Deployment

### Before Deploying:
```bash
# 1. Run TypeScript check
cd frontend
npm run type-check

# 2. Run tests (if available)
npm test

# 3. Build to verify no errors
npm run build
```

### After Deploying:
1. Test basic chat flow
2. Verify clarifications work correctly
3. Confirm NO repetitive questions
4. Monitor console logs for `[AI Chat] Clarification needed:` messages

---

## Monitoring

Watch for these console logs:
```
[AI Chat] Clarification needed: gender
[AI Chat] Clarification needed: occasion
```

If you see the **same clarification type logged twice in a row** for the same session, the fix may not be working properly.

---

## Future Enhancements

1. **Persist session to localStorage** - Maintain clarification state across page refreshes
2. **Add conversationContext extraction** - Automatically extract and store detected info
3. **Smart acknowledgments** - When user answers, acknowledge what was detected
4. **Session analytics** - Track how often clarifications are asked

---

## Credits

**Issue**: Clarification loop causing poor UX
**Fix Date**: 2025-10-14
**Related**: System Prompt v2.0 Enhancement
**Status**: ✅ FIXED
