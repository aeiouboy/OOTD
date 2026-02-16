# Informational Query Detection — Implementation Plan

**Date**: 2026-02-15
**Status**: Ready for review
**Revision**: v3 — INFO mode only activates on follow-up (post-recommendation)

---

## Problem

When a user asks an informational question like:
- "สีไหนที่ไม่ควรใส่วันอังคาร" (which colors shouldn't I wear on Tuesday?)
- "กาลกิณีคืออะไร" (what are inauspicious colors?)

The system:
1. Detects category as `CLOTHS` (because the message contains "ใส่" / "สี")
2. Forces RECOMMENDATION MODE → generates outfit looks + flat-lay images
3. User only wanted the **text answer**, NOT outfit recommendations

**Goal**: Detect informational follow-up queries → respond text-only + CTA button.
First message always recommends looks (even for info-type questions).

---

## Core Rule: First vs Follow-Up

```
┌─────────────────────────────────────────────────────────────────┐
│                      SESSION TIMELINE                           │
│                                                                 │
│  First message (no prior recs)     Follow-up (has prior recs)   │
│  ──────────────────────────────    ────────────────────────────  │
│                                                                 │
│  "กาลกิณีคืออะไร"                  "สีไหนที่ไม่ควรใส่"            │
│       │                                 │                       │
│       ▼                                 ▼                       │
│  ┌──────────────┐                ┌──────────────┐               │
│  │ Recommend    │                │ Text-only    │               │
│  │ looks (ปกติ) │                │ answer +     │               │
│  │              │                │ CTA button   │               │
│  └──────────────┘                └──────────────┘               │
│                                                                 │
│  Reason: First interaction       Reason: User already has       │
│  = show what we can do           looks, just needs info now     │
└─────────────────────────────────────────────────────────────────┘
```

**Why first message always recommends:**
- First-time user sees the platform's value (outfit curation)
- Even "กาลกิณีคืออะไร" benefits from showing looks with correct colors
- Avoids dead-end text-only responses on first contact

**Why follow-up goes text-only:**
- User already has looks on screen
- Asking "สีไหนไม่ควรใส่" after seeing outfits = knowledge question, not "give me more outfits"
- CTA button lets them opt-in if they want new looks based on the info

---

## Scenario A: First Message — INFO Query (Recommend Looks)

```
┌──────────────────────────────────────────────────────────────┐
│  User (first msg): "กาลกิณีวันอังคารคืออะไร"                  │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  detectCategory(message)                   │
│  → category: 'INFO'                        │
│                                            │
│  processAIChatRequestV5():                 │
│  hasProvidedRecommendations = false        │
│                                            │
│  INFO + first message = TREAT AS CLOTHS    │
│  → Full pipeline (occasion filter, 50 cat) │
│  → AI gets RECOMMENDATION MODE template    │
└──────────────┬─────────────────────────────┘
               │
               ▼
        OK  Outfit looks generated (with correct colors from RAG)
        OK  User sees value immediately
        OK  No CTA button needed
```

## Scenario B: Follow-Up — INFO Query (Text-Only + CTA)

```
┌─────────────────────────────────────────────────────────────┐
│ Turn 1: User: "หาชุดไปทำงาน"                                │
│         → CLOTHS → 2 outfit looks shown                     │
├─────────────────────────────────────────────────────────────┤
│ Turn 2: User: "สีไหนที่ไม่ควรใส่วันอังคาร"                    │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  detectFollowUpRequest()                   │
│  hasProvidedRecommendations = true         │
│                                            │
│  Check info_question FIRST:                │
│  V  Matches "สีไหน.*ไม่ควร"               │
│  → type: 'info_question'                   │
└──────────────┬─────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  processAIChatRequestV5()                  │
│                                            │
│  INFO + hasProvidedRecommendations = true   │
│  → ACTIVATE INFO MODE                      │
│  → Minimal catalog (20), RAG knowledge     │
│  → Template: text-only, no LOOKS_DATA      │
│  → responseType: 'info'                    │
└──────────────┬─────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  Frontend:                                 │
│  ┌──────────────────────────────────────┐  │
│  │ OOT: วันอังคารสีกาลกิณีคือสีม่วงจ้า  │  │
│  │ ตามหลักโหราศาสตร์ไทย...             │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌───────────────────────────┐             │
│  │  Shirt  แนะนำลุคให้หน่อย  │  <-- CTA   │
│  └───────────────────────────┘             │
└────────────────────────────────────────────┘
               │
               ▼
        OK  Text answer from knowledge base
        OK  CTA button to opt-in to looks
        OK  No flat-lay, no wasted tokens
```

## Scenario C: Follow-Up — Explicit Outfit Request (Normal Looks)

```
┌─────────────────────────────────────────────────────────────┐
│ Turn 1: User: "หาชุดไปทำงาน" → looks shown                  │
├─────────────────────────────────────────────────────────────┤
│ Turn 2: User: "จัดลุคอีกแบบนึงให้หน่อย"                      │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  detectFollowUpRequest()                   │
│  → type: 'more_options' (not info_question)│
│  → Normal follow-up → RECOMMENDATION MODE  │
└──────────────┬─────────────────────────────┘
               │
               ▼
        OK  New outfit looks generated (existing behavior)
```

## Scenario D: CTA Button Click → Looks Generated

```
┌─────────────────────────────────────────────────────────────┐
│ Turn 2: [OOT text about กาลกิณี]                            │
│         [CTA button: แนะนำลุคให้หน่อย]                       │
├─────────────────────────────────────────────────────────────┤
│ Turn 3: User clicks CTA → sends "แนะนำลุคให้หน่อย"          │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  detectCategory("แนะนำลุคให้หน่อย")        │
│                                            │
│  EXPLICIT_OUTFIT_PATTERNS: V  /แนะนำลุค/  │
│  → category: 'CLOTHS'                      │
│  → Normal RECOMMENDATION MODE              │
└──────────────┬─────────────────────────────┘
               │
               ▼
        OK  Outfit looks generated
        OK  CTA button disappears from previous message
```

---

## The Gate: Where INFO Mode Activates

```
processAIChatRequestV5():

     ┌──────────────────────────────┐
     │ categoryDetection.category   │
     │ === 'INFO' ?                 │
     └──────┬─────────────┬────────┘
            │ yes         │ no
            ▼             │
   ┌─────────────────┐   │
   │ hasProv ided     │   │
   │ Recommendations? │   │
   └──┬──────────┬───┘   │
      │ yes      │ no    │
      ▼          ▼       ▼
┌──────────┐ ┌──────────────────────┐
│ INFO     │ │ Normal pipeline      │
│ MODE     │ │ (CLOTHS / OTHER)     │
│          │ │                      │
│ text-only│ │ INFO on first msg    │
│ + CTA    │ │ = treated as CLOTHS  │
│ button   │ │ = recommend looks    │
└──────────┘ └──────────────────────┘
```

---

## CTA Button UX

```
┌─────────────────────────────────────────────────────────────┐
│  Chat Window                                                │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ User: หาชุดไปทำงาน                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ OOT: จัดมาให้แล้วนะ 2 ลุคทำงาน chic สุด ✨             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌──────────────────┐ ┌──────────────────┐                  │
│  │  Look 1 card     │ │  Look 2 card     │                  │
│  └──────────────────┘ └──────────────────┘                  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ User: สีไหนที่ไม่ควรใส่วันอังคาร                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ OOT: วันอังคารสีกาลกิณี (สีที่ไม่ควรใส่) คือสีม่วงจ้า  │ │
│  │ เพราะตามหลักโหราศาสตร์ไทย สีม่วงเป็นสีอัปมงคล        │ │
│  │ ของวันอังคาร ส่วนสีมงคลคือ สีชมพู (เดช)...           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────┐                              │
│  │  Shirt  แนะนำลุคให้หน่อย  │  <-- Pill button            │
│  └───────────────────────────┘      Same style as           │
│                                     QuickPrompts chips      │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [Type a message...]                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

When clicked:
→ Sends "แนะนำลุคให้หน่อย" as user message
→ Normal chat flow → CLOTHS detection → outfit looks generated
→ Button disappears (only shown once per INFO response)
```

**Why button > text CTA:**
- Actionable — one tap, no typing
- Reliable — doesn't depend on AI remembering to add CTA
- Familiar UX — same chip style as QuickPrompts
- Discoverable — users see the option visually

---

## Decision Matrix

```
┌────────────────────────────────┬─────────┬────────────┬────────────────────┐
│ Query                          │ Turn    │ INFO match │ Result             │
├────────────────────────────────┼─────────┼────────────┼────────────────────┤
│ "กาลกิณีคืออะไร"               │ 1st     │ V          │ CLOTHS (looks)     │
│ "สีไหนไม่ควรใส่วันอังคาร"       │ 1st     │ V          │ CLOTHS (looks)     │
│ "หาชุดไปทำงาน"                 │ 1st     │ X          │ CLOTHS (looks)     │
│ "รองเท้าดูแลยังไง"              │ 1st     │ X          │ OTHER (tips)       │
│                                │         │            │                    │
│ "สีไหนไม่ควรใส่" (after looks)  │ follow  │ V          │ INFO (text + CTA)  │
│ "กาลกิณีคืออะไร" (after looks)  │ follow  │ V          │ INFO (text + CTA)  │
│ "ใส่สูทกับยีนส์ได้ไหม" (after)  │ follow  │ V          │ INFO (text + CTA)  │
│ "กฎแต่งตัวไปวัดคืออะไร"(after) │ follow  │ V          │ INFO (text + CTA)  │
│ "จัดลุคอีกแบบ" (after looks)    │ follow  │ X          │ CLOTHS (new looks) │
│ "ถูกกว่านี้" (after looks)       │ follow  │ X          │ CLOTHS (cheaper)   │
│ "หาชุดใส่ได้ไหม" (after looks)  │ follow  │ V override │ CLOTHS (looks)     │
└────────────────────────────────┴─────────┴────────────┴────────────────────┘

Key: INFO mode ONLY activates when hasProvidedRecommendations = true
     First message always goes through normal CLOTHS/OTHER pipeline
```

---

## File Changes

### File 1: `apps/web/lib/utils/category-detector.ts`

**What changes:**
- Extend `ProductCategory` type: add `'INFO'`
- Extend `CategoryDetection.recommendedTemplate`: add `'C'`
- Add `INFO_PATTERNS` constant — Thai/English regex for informational intent
- Add `EXPLICIT_OUTFIT_PATTERNS` constant — patterns that override INFO → CLOTHS
- In `detectCategory()`, check INFO patterns **before** CLOTHS/OTHER keyword counting:
  - If INFO matches AND no explicit outfit pattern → return `{ category: 'INFO', template: 'C' }`
  - Otherwise → existing CLOTHS/OTHER logic

Note: `detectCategory()` always returns the pure detection result.
The "first msg vs follow-up" gate lives in `ai-chat-service.ts`, not here.

```
detectCategory() flow:

     ┌─────────────┐
     │ Input query  │
     └──────┬──────┘
            │
            ▼
   ┌────────────────────┐
   │ Match INFO_PATTERNS?│
   └──┬─────────────┬───┘
      │ yes         │ no
      ▼             │
┌─────────────────┐ │
│ Match EXPLICIT_ │ │
│ OUTFIT_PATTERNS?│ │
└──┬──────────┬───┘ │
   │ yes      │ no  │
   │          ▼     │
   │   ┌──────────┐ │
   │   │ Return   │ │
   │   │ INFO 'C' │ │
   │   └──────────┘ │
   ▼                ▼
┌──────────────────────┐
│ Count CLOTHS vs      │
│ OTHER keywords       │
│ (existing logic)     │
└──────────────────────┘
```

### File 2: `apps/web/lib/utils/follow-up-handler.ts`

**What changes:**
- Add `'info_question'` to `FollowUpType` union
- Add `info_question` keywords to `FOLLOW_UP_KEYWORDS`
- In `detectFollowUpRequest()`, check `info_question` **before** iterating other types
- Add `case 'info_question'` in `generateFollowUpInstruction()` — instructs AI text-only

```
detectFollowUpRequest() flow (modified):

┌──────────────────────┐
│ hasProvidedRecs=true  │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────────┐
│ Check info_question keywords│  <-- NEW: checked FIRST
│ (คืออะไร, ทำไม, สีไหนไม่ควร │
│  ข้อห้าม, ธรรมเนียม, กฎ)    │
└──────────┬──────────────────┘
      match│         no match
           ▼              │
  ┌────────────────┐      ▼
  │ info_question  │  ┌────────────────────┐
  │ (bypass lockout│  │ Existing follow-up │
  │  for text-only)│  │ type detection     │
  └────────────────┘  │ (more_options,     │
                      │  color_change, etc)│
                      └────────────────────┘
```

### File 3: `apps/web/lib/services/ai-chat-service.ts`

**What changes:**

1. Update `getV5TemplateInstruction()` — accept `'INFO'`, add INFO template:
   - "Respond TEXT ONLY, no LOOKS_DATA"
   - No CTA text needed (frontend handles it)

2. In `processAIChatRequestV5()`, THE KEY GATE:
   ```
   // After follow-up detection and category detection:

   if (categoryDetection.category === 'INFO' && hasProvidedRecommendations) {
     // ACTIVATE INFO MODE — text-only + CTA
     // Use INFO template, minimal catalog, responseType: 'info'
   }
   else if (categoryDetection.category === 'INFO' && !hasProvidedRecommendations) {
     // FIRST MESSAGE — treat as CLOTHS
     // Override to CLOTHS, normal pipeline
   }
   ```

3. Also override when follow-up explicitly detected:
   ```
   if (followUpDetection.type === 'info_question') {
     // Always INFO mode (follow-up handler already gates on hasProvidedRecs)
     categoryDetection = { category: 'INFO', ... }
   }
   ```

4. When INFO mode active:
   - Still retrieve RAG knowledge (essential for accuracy)
   - Inject minimal catalog (20 products instead of 50)
   - After AI response: if no `---LOOKS_DATA---` → return `looks: []`, `imageRequest: false`
   - Add `responseType: 'info'` to signal frontend for CTA button

```
processAIChatRequestV5() — the key gate:

┌─────────────────────────────────────────────────────────────┐
│  category = detectCategory(message)                         │
│  followUp = detectFollowUpRequest(message, hasProvidedRecs) │
│                                                             │
│  // The gate: INFO only activates on follow-up              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ if followUp.type === 'info_question':                 │  │
│  │   → INFO MODE (always, follow-up handler gates this)  │  │
│  │                                                       │  │
│  │ elif category === 'INFO' && hasProvidedRecs:          │  │
│  │   → INFO MODE                                        │  │
│  │                                                       │  │
│  │ elif category === 'INFO' && !hasProvidedRecs:         │  │
│  │   → Override to CLOTHS (first msg = recommend looks)  │  │
│  │                                                       │  │
│  │ else:                                                 │  │
│  │   → Normal CLOTHS / OTHER pipeline                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  INFO MODE path:                                            │
│  - RAG knowledge retrieval (full)                           │
│  - Catalog: 20 products (minimal)                           │
│  - Template: text-only, no LOOKS_DATA                       │
│  - Response: looks: [], imageRequest: false                 │
│  - responseType: 'info'  → frontend shows CTA button        │
│                                                             │
│  CLOTHS path (including overridden first-msg INFO):         │
│  - Full pipeline (existing behavior, no changes)            │
└─────────────────────────────────────────────────────────────┘
```

### File 4: `apps/web/lib/prompts/system-prompt-v5.ts`

**What changes:**

Add MODE 4 (INFO) to the CONVERSATION FLOW STATE MACHINE section:

```
Before:                              After:
┌──────────────────────────┐         ┌──────────────────────────────────┐
│ MODE 1: CLARIFICATION    │         │ MODE 1: CLARIFICATION            │
│ MODE 2: RECOMMENDATION   │         │ MODE 2: RECOMMENDATION           │
│ MODE 3: REDIRECT         │         │ MODE 3: REDIRECT                 │
└──────────────────────────┘         │ MODE 4: INFO  <-- NEW           │
                                     │   Post-recommendation only       │
                                     │   Answer knowledge questions     │
                                     │   Text-only, no LOOKS_DATA      │
                                     └──────────────────────────────────┘
```

Update decision flowchart:

```
Step 1:   Off-topic? → REDIRECT
Step 1.5: Factual Q + already shown recs? → INFO  <-- NEW (post-rec only)
Step 2:   Has recs? → RECOMMEND (normal follow-ups)
Step 3:   Asked 1 Q? → RECOMMEND
Step 4:   Sufficient? → RECOMMEND
Step 5:   Insufficient? → CLARIFY
Step 6:   Default → RECOMMEND
```

Update POST-RECOMMENDATION section:
```
POST-RECOMMENDATION FOLLOW-UPS:
- "ขอดูอีก" → Show 2 more different looks immediately
- "สีอื่น" → Show same style with different colors
- "ถูกกว่า" → Show lower-priced alternatives
- INFO questions (คืออะไร, ทำไม, สีไหน) → INFO MODE (text-only)  <-- NEW
```

### File 5: `apps/web/app/api/chat/route.ts`

**What changes:**
- Pass `responseType` from service response to API JSON response

```
// In the v5 response block:
return NextResponse.json({
  message: response.message,
  looks: [...],
  responseType: response.responseType,  // <-- NEW: 'info' | undefined
  ...existing fields...
})
```

### File 6: `apps/web/components/chat/ChatAssistant.tsx`

**What changes:**
- After receiving API response with `responseType === 'info'`:
  - Set `showInfoCTA: true` on the AI message
- Render a CTA pill button below the INFO message:
  - Style: same as `QuickPrompts` chips (rounded-full, outline variant)
  - Label: "แนะนำลุคให้หน่อย" with Shirt icon
  - On click: call `handleSendMessage("แนะนำลุคให้หน่อย")`
  - Button disappears after click or when next message is sent

```
Message rendering flow:

┌──────────────────────────────────────┐
│ messages.map(msg => {                │
│   <ChatMessage ... />                │
│                                      │
│   if (msg.outfits?.length)           │
│     <OutfitRecommendationCard ... /> │
│                                      │
│   if (msg.showInfoCTA)          NEW  │
│     <Button                          │
│       variant="outline"              │
│       className="rounded-full"       │
│       onClick={() =>                 │
│         handleSendMessage(           │
│           "แนะนำลุคให้หน่อย"         │
│         )                            │
│       }                              │
│     >                                │
│       <Shirt /> แนะนำลุคให้หน่อย     │
│     </Button>                        │
│ })                                   │
└──────────────────────────────────────┘
```

### File 7: `apps/web/lib/types.ts`

**What changes:**
- Add `showInfoCTA?: boolean` to `ChatMessage` interface

---

## Data Flow: API → Frontend

```
Backend (ai-chat-service.ts)
        │
        │  { message, looks: [], responseType: 'info', imageRequest: false }
        │
        ▼
API Route (route.ts)
        │
        │  { message, looks: [], responseType: 'info', imageRequest: false }
        │
        ▼
Frontend (ChatAssistant.tsx)
        │
        │  if (data.responseType === 'info')
        │    → aiMessage.showInfoCTA = true
        │    → no flat-lay generation
        │    → no OutfitRecommendationCard
        │
        ▼
Render:
  ┌──────────────────────────────────────────┐
  │  [AI text bubble]                        │
  │                                          │
  │  ┌────────────────────────────┐          │
  │  │  Shirt  แนะนำลุคให้หน่อย   │          │
  │  └────────────────────────────┘          │
  └──────────────────────────────────────────┘
```

---

## Key Design Decisions

```
┌─────────────────────┬──────────────┬───────────────────────────────────────┐
│ Decision            │ Choice       │ Reason                                │
├─────────────────────┼──────────────┼───────────────────────────────────────┤
│ First msg INFO?     │ Recommend    │ Show platform value on first contact  │
│ Follow-up INFO?     │ Text + CTA   │ User already has looks, needs info    │
│ CTA delivery?       │ UI button    │ More actionable, reliable, visual     │
│ Hard gate vs hint?  │ Hint (AI)    │ Thai too nuanced for hard gate        │
│ Skip products?      │ Minimal (20) │ AI may decide user wants looks        │
│ Follow-up lockout?  │ Relaxed      │ Info Q after looks != more looks      │
│ Button placement?   │ Below msg    │ Same pattern as QuickPrompts          │
│ Button style?       │ Pill chip    │ Consistent with existing chips        │
│ Button lifetime?    │ Until click  │ Disappears on click/next message      │
└─────────────────────┴──────────────┴───────────────────────────────────────┘
```

---

## Verification

1. **Unit tests**: INFO patterns classified correctly, explicit outfit patterns override
2. **Unit tests**: `info_question` detected for post-recommendation info queries
3. **Unit tests**: First message with INFO category still returns CLOTHS behavior
4. **E2E**: First msg "กาลกิณีคืออะไร" → outfit looks generated (not text-only)
5. **E2E**: "หาชุดไปทำงาน" → looks → "สีไหนที่ไม่ควรใส่" → text-only + CTA button
6. **E2E**: Click CTA button → sends "แนะนำลุคให้หน่อย" → outfit looks generated
7. **E2E**: "อยากได้เสื้อสีเสริมดวง" → looks generated (explicit outfit overrides)
8. Run `pnpm vitest run` → all existing tests pass
9. Server logs: `[Category Detector] Detected: INFO` for informational queries

---

## Files Summary

| # | File | Action |
|---|------|--------|
| 1 | `apps/web/lib/utils/category-detector.ts` | EDIT — Add INFO category, INFO_PATTERNS, EXPLICIT_OUTFIT_PATTERNS |
| 2 | `apps/web/lib/utils/follow-up-handler.ts` | EDIT — Add `info_question` type + keywords + instruction |
| 3 | `apps/web/lib/services/ai-chat-service.ts` | EDIT — Add INFO template, THE KEY GATE (follow-up only), `responseType` |
| 4 | `apps/web/lib/prompts/system-prompt-v5.ts` | EDIT — Add MODE 4 (INFO) to state machine (post-rec only) |
| 5 | `apps/web/app/api/chat/route.ts` | EDIT — Pass `responseType` to frontend |
| 6 | `apps/web/components/chat/ChatAssistant.tsx` | EDIT — Render CTA button for INFO responses |
| 7 | `apps/web/lib/types.ts` | EDIT — Add `showInfoCTA` to ChatMessage |
