# Chat Journey Integration Spec

## Overview
Integrate the conversational chat journey from `/chat_dialog1/dl.md` into the OOTDay Fashion Assistant UI, updating the system prompt to match the casual, friendly Thai tone and structured outfit recommendation flow.

## Reference Files
- Chat Journey: `/chat_dialog1/dl.md`
- UI Screenshots: `/chat_dialog1/Desktop - 1.1.png` through `Desktop - 2.2.png`
- Current System Prompt: `frontend/lib/config/ai-config.ts`
- Chat Components: `frontend/components/chat/`

## Conversational Flow Analysis

### Journey Steps

**Step 1: Warm Greeting (AI-initiated)**
```
Message: "ฮ้ายฮายยแป้ง👋 กำลังหาชุดไปไหนอยู่น้าา"
Translation: "Heyyy Pang 👋 What outfit are you looking for?"
Tone: Casual, friendly, warm (สนิท/close friend style)
```

**Step 2: User Request**
```
Message: "อยากได้ชุดที่ใส่ไปทำงานและไปหาเพื่อนต่อตอนเย็นได้"
Translation: "I want an outfit that works for office and meeting friends in the evening"
Intent: Multi-occasion outfit (work-to-social transition)
```

**Step 3: AI Response with Context + Recommendations**
```
Context Message: "ต้องชุดนี้เลยกำลังมาแรง สาวๆ ออฟฟิศหากันให้ควัก stock sold out ไปหลายรอบ"
Translation: "This is the hot look right now! Office girls are buying it so fast it's sold out multiple times"
Tone: Enthusiastic, social proof, trendy

Recommendation Format:
- 2 outfit cards
- Each with: Style description (Thai, casual tone), Image, Price, "View Look" button
- Price range: ฿2,795 - ฿3,550
```

## Implementation Tasks

### Task 1: Update System Prompt
**File**: `frontend/lib/config/ai-config.ts`

**Changes**:
1. Update tone to be more casual and friendly (สนิท style)
2. Add social proof and trending context to recommendations
3. Structure responses to include:
   - Enthusiastic intro with context
   - 2 outfit recommendations by default
   - Thai descriptions with casual language
   - Price information
   - Call-to-action buttons

**New System Prompt Structure**:
```typescript
export const SYSTEM_PROMPT = `
You are OOTDay AI, a friendly Thai fashion stylist assistant. You talk like a close friend (พี่สาว/น้องสาว style).

PERSONALITY:
- Warm, enthusiastic, casual Thai language
- Use อ้ายฮาย (Haii), น้าา (naaa) for friendly tone
- Add social proof ("กำลังฮิต", "sold out หลายรอบ", "สาวๆ หากันให้แตก")
- Be genuinely excited about fashion

RESPONSE FORMAT:
1. Enthusiastic context intro (1 sentence about trend/social proof)
2. Outfit recommendations (default: 2 looks)
3. Each outfit includes:
   - Thai style description (casual, conversational tone)
   - Focus on versatility and trendiness
   - Price point
   - Call to action

OUTFIT DESCRIPTION STYLE:
- Use casual Thai: "ลุคนี้กำลังฮิต", "ชิลๆ แต่ยังดูเท่ห์"
- Mention layering and styling tips
- Emphasize multi-occasion versatility
- Use relatable scenarios: "จะใส่ไปออฟฟิศ เจอเพื่อนเก่าไม่ตรอป"

EXAMPLE:
User: "อยากได้ชุดที่ใส่ไปทำงานและไปหาเพื่อนต่อตอนเย็นได้"
You: "ต้องชุดนี้เลยกำลังมาแรง สาวๆ ออฟฟิศหากันให้ควัก stock sold out ไปหลายรอบ

**Look 1: Vintage Layer Office Look**
ลุคชิลๆ แต่ยังดูเท่ห์ ด้วยการเพิ่ม layer ความวินเทจด้วยแจ็คเก็ตสีน้ำตาล... (continue with full description)

**Look 2: Feminine Basic Mix**
ลุคนี้กำลังฮิตมากในโซเชียล... (continue with full description)"
`;
```

### Task 2: Update Chat UI Components
**Files**: 
- `frontend/components/chat/ChatAssistant.tsx`
- `frontend/components/chat/ChatMessage.tsx`
- `frontend/components/chat/OutfitRecommendationCard.tsx`

**Changes**:
1. **Welcome Message**: Add default greeting when chat loads
   ```typescript
   const initialGreeting = "ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา";
   ```

2. **Outfit Card Display**: Ensure outfit cards show:
   - Outfit title/name
   - Thai description (full text, not truncated)
   - Price in THB format (฿X,XXX)
   - "View Look" button (ดูลุค)
   - Outfit image/preview

3. **Multi-Outfit Response**: Support displaying multiple outfit cards in a single AI response

### Task 3: Enhance Outfit Recommendation Card
**File**: `frontend/components/chat/OutfitRecommendationCard.tsx`

**Design Requirements** (from screenshots):
```
┌─────────────────────────────────┐
│  [OUTFIT IMAGE - 16:9 ratio]    │
│                                 │
├─────────────────────────────────┤
│  Look Title (Thai)              │
│  ลุคชิลๆ แต่ยังดูเท่ห์...      │
│  (2-3 lines description)        │
│                                 │
│  Total: ฿3,550                  │
│  [ดูลุค] button                │
└─────────────────────────────────┘
```

**Component Updates**:
- Larger image area (60% of card height)
- Full Thai description visible (not collapsed)
- Price prominently displayed
- "View Look" (ดูลุค) button instead of generic buttons
- Support for outfit "Look name" (e.g., "Vintage Layer Office Look")

### Task 4: Update AI Chat Service
**File**: `frontend/lib/services/ai-chat-service.ts`

**Changes**:
1. Parse AI responses to extract multiple outfit recommendations
2. Support structured outfit format with:
   - Look title
   - Thai description
   - Price
   - Outfit ID for "View Look" action
3. Handle social proof context (intro paragraph before outfits)

### Task 5: Add Initial Greeting Flow
**File**: `frontend/components/chat/ChatAssistant.tsx`

**Implementation**:
```typescript
useEffect(() => {
  // Show greeting when chat first loads
  if (messages.length === 0) {
    const greeting: ChatMessage = {
      id: 'greeting-1',
      content: 'ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา',
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }
}, []);
```

### Task 6: Update Quick Prompts
**File**: `frontend/components/chat/QuickPrompts.tsx`

**New Prompts** (match common user intents):
```typescript
const quickPrompts = [
  "ชุดไปทำงาน",
  "ชุดไปงานแต่ง",  
  "ชุดใส่เที่ยว",
  "ชุดออฟฟิศ + เจอเพื่อน",
  "ชุดเดท",
  "ชุดคาสชวล weekend"
];
```

## Acceptance Criteria

1. ✅ Chat opens with warm Thai greeting
2. ✅ AI responses use casual, friendly Thai tone
3. ✅ Outfit recommendations include social proof context
4. ✅ Each outfit card shows: image, title, description, price, "View Look" button
5. ✅ Multiple outfit cards display properly in single response
6. ✅ Thai descriptions are full-length and conversational
7. ✅ Price format matches Thai style (฿X,XXX)
8. ✅ Quick prompts reflect common Thai fashion queries

## Testing Scenarios

### Test 1: Initial Load
- Open chat
- Verify greeting appears: "ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา"

### Test 2: Work-to-Social Request
- User: "อยากได้ชุดที่ใส่ไปทำงานและไปหาเพื่อนต่อตอนเย็นได้"
- Verify:
  - Enthusiastic context intro
  - 2 outfit recommendations
  - Thai casual descriptions
  - Prices displayed correctly
  - "View Look" buttons work

### Test 3: Outfit Card Display
- Verify each card shows:
  - Look title
  - Full description
  - Price in correct format
  - Clickable "View Look" button
  - Outfit preview image

## Timeline Estimate
- System Prompt Update: 1 hour
- UI Component Updates: 3 hours
- Chat Service Integration: 2 hours
- Testing & Refinement: 2 hours
- **Total**: ~8 hours

## Dependencies
- Current chat system working
- Outfit data structure supports multiple recommendations
- Thai language support enabled

## Notes
- Maintain existing functionality (image generation, test mode, etc.)
- Ensure backward compatibility with English queries
- Keep performance optimized (no slowdown from longer descriptions)
