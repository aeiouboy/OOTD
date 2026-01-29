# Chore: Thai Conversational Chat Journey Integration

## Metadata
adw_id: `76c3b7fd`
prompt: `Integrate Thai conversational chat journey into OOTDay Fashion Assistant UI following specs/chat-journey-integration.md. Update system prompt to use casual friendly Thai tone with social proof. Update ChatAssistant to show initial greeting. Enhance outfit cards to display Look title, full Thai descriptions, price in ฿ format, and 'ดูลุค' button. Update quick prompts with Thai fashion queries. Files to modify: frontend/lib/config/ai-config.ts, frontend/components/chat/ChatAssistant.tsx, frontend/components/chat/OutfitRecommendationCard.tsx, frontend/components/chat/QuickPrompts.tsx, frontend/lib/services/ai-chat-service.ts`

## Chore Description
Integrate the Thai conversational chat journey from the chat dialog reference (`chat_dialog1/dl.md`) into the OOTDay Fashion Assistant UI. This involves:

1. **System Prompt Enhancement**: The system prompt (`frontend/lib/prompts/system-prompt-v2.ts`) already has comprehensive Thai conversational tone with social proof phrases like "กำลังมาแรง", "stock sold out", "สาวๆ หากันให้ควัก". The current implementation is already aligned with the spec. Minor validation may be needed.

2. **Initial Greeting in ChatAssistant**: Add an automatic initial greeting message when the chat loads: "ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา" to create a warm, friendly opening.

3. **Enhanced Outfit Recommendation Cards**: Update the `OutfitRecommendationCard` component to display:
   - Look title/style name (e.g., "Vintage Layer Office Look")
   - Full Thai description (not truncated)
   - Price in ฿X,XXX format (already implemented)
   - "ดูลุค" button instead of English "View"

4. **Thai Quick Prompts**: Update quick prompts from English to Thai fashion queries matching common user intents.

5. **AI Config File**: Note that `frontend/lib/config/ai-config.ts` does not exist. The system prompt is already in `frontend/lib/prompts/system-prompt-v2.ts` which is already comprehensive and aligned with the spec requirements.

## Relevant Files
Use these files to complete the chore:

### Files to Modify

- **`frontend/components/chat/ChatAssistant.tsx`** (lines 26-306)
  - Add initial greeting message when chat loads (useEffect with empty messages check)
  - The greeting should be: "ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา"
  - Currently shows English placeholder text on line 260-263

- **`frontend/components/chat/OutfitRecommendationCard.tsx`** (lines 1-78)
  - Add Look title/style name display (outfit may need a `styleName` or `lookTitle` field)
  - Ensure full Thai description display (no line clamping on descriptions)
  - Change "View" button text to "ดูลุค" (line 52-53)
  - Price format is already correct with ฿ symbol (line 40-42)

- **`frontend/components/chat/QuickPrompts.tsx`** (lines 1-40)
  - Update `quickPrompts` array to use Thai labels and prompts
  - New prompts per spec: "ชุดไปทำงาน", "ชุดไปงานแต่ง", "ชุดใส่เที่ยว", "ชุดออฟฟิศ + เจอเพื่อน", "ชุดเดท", "ชุดคาสชวล weekend"

- **`frontend/lib/prompts/system-prompt-v2.ts`** (lines 1-1135)
  - Validate that the current prompt already includes the casual Thai tone and social proof phrases
  - The current implementation at v2.5.0 already includes all required elements from chat_dialog1/dl.md
  - No changes needed unless validation reveals gaps

- **`frontend/lib/services/ai-chat-service.ts`** (lines 1-818)
  - Already imports and uses SYSTEM_PROMPT_V2
  - May need to ensure outfit response parsing supports Look titles
  - Validate that the service correctly passes through style names and descriptions

### Reference Files (Read Only)

- **`specs/chat-journey-integration.md`** - Complete integration specification with examples
- **`chat_dialog1/dl.md`** - Original chat dialog reference showing the Thai conversational flow
- **`frontend/lib/types.ts`** - Outfit interface definition (may need `styleName` or `lookTitle` field)
- **`frontend/lib/types/chat-types.ts`** - Chat type definitions for context

### New Files
No new files needed. All changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Initial Greeting to ChatAssistant
- Read `frontend/components/chat/ChatAssistant.tsx`
- Add a `useEffect` hook to set initial greeting message when `messages.length === 0`
- The greeting message should be:
  ```typescript
  const greeting: ChatMessageType = {
    id: 'greeting-initial',
    content: 'ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา',
    sender: 'assistant',
    timestamp: new Date(),
  }
  ```
- Update the empty state message (lines 258-264) to show the greeting instead of English placeholder
- Import `useEffect` from React if not already imported

### 2. Update OutfitRecommendationCard for Thai Display
- Read `frontend/components/chat/OutfitRecommendationCard.tsx`
- Change the "View" button text from "View" to "ดูลุค" (line 52-53)
- Add display for Look title/style name if the Outfit type supports it
- Ensure description is displayed in full (check if `line-clamp-2` exists and consider removing or expanding)
- Verify price format shows ฿ symbol correctly (already implemented)

### 3. Update QuickPrompts to Thai
- Read `frontend/components/chat/QuickPrompts.tsx`
- Replace the `quickPrompts` array with Thai prompts:
  ```typescript
  const quickPrompts = [
    { id: 'work', label: 'ชุดไปทำงาน', prompt: 'อยากได้ชุดไปทำงาน', icon: Briefcase },
    { id: 'wedding', label: 'ชุดไปงานแต่ง', prompt: 'หาชุดไปงานแต่งงาน', icon: Heart },
    { id: 'travel', label: 'ชุดใส่เที่ยว', prompt: 'อยากได้ชุดใส่ไปเที่ยว', icon: Sparkles },
    { id: 'chill', label: 'ชุดวันหยุด', prompt: 'ชุดคาสชวล วันหยุด สบายๆ', icon: Coffee },
  ]
  ```
- Optionally update icons to be more appropriate for Thai context

### 4. Validate System Prompt Alignment
- Read `frontend/lib/prompts/system-prompt-v2.ts`
- Verify the following are present:
  - Casual Thai tone phrases: "จ้า", "นะ", "เนอะ"
  - Social proof phrases: "กำลังมาแรง", "stock sold out", "สาวๆ หากันให้ควัก"
  - Look format with style names (e.g., "Look 1: Vintage Layer Office Look")
  - Total price calculation for each Look
- Current version v2.5.0 appears to already include all required elements
- Document any gaps found (expected: none)

### 5. Verify Outfit Type Supports Look Title
- Read `frontend/lib/types.ts` to check Outfit interface
- Current Outfit interface has: `id`, `title`, `description`, `totalPrice`, `items`, `imageUrl`
- The `title` field can be used for Look title/style name
- Verify OutfitRecommendationCard uses `outfit.title` appropriately

### 6. Test and Validate the Integration
- Run the development server: `cd frontend && pnpm dev`
- Open the chat interface
- Verify:
  - Initial greeting appears: "ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา"
  - Quick prompts show Thai labels
  - Outfit cards display Look title, full description, ฿ price, and "ดูลุค" button
  - Chat responses use casual Thai tone with social proof

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && pnpm lint` - Ensure no linting errors
- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && pnpm build` - Verify the build passes
- `grep -n "ฮ้ายฮายย" frontend/components/chat/ChatAssistant.tsx` - Confirm Thai greeting is added
- `grep -n "ดูลุค" frontend/components/chat/OutfitRecommendationCard.tsx` - Confirm Thai button text
- `grep -n "ชุดไปทำงาน" frontend/components/chat/QuickPrompts.tsx` - Confirm Thai quick prompts
- Manual test: Run `pnpm dev` and verify the chat UI displays Thai greeting on load

## Notes

1. **System Prompt Already Complete**: The current `system-prompt-v2.ts` at version 2.5.0 already includes all the Thai conversational elements from `chat_dialog1/dl.md`. The chore primarily focuses on UI component updates.

2. **ai-config.ts Does Not Exist**: The spec mentions `frontend/lib/config/ai-config.ts` but this file doesn't exist. The system prompt is correctly located in `frontend/lib/prompts/system-prompt-v2.ts` and is already being used by the chat service.

3. **Outfit.title Usage**: The existing `Outfit` interface uses `title` which can serve as the Look title/style name. No type changes are needed.

4. **Backward Compatibility**: Ensure the changes maintain backward compatibility with any existing English-language content or mixed Thai-English responses.

5. **Emoji Support**: The greeting uses emoji (👋) - ensure the font stack supports emoji rendering properly.
