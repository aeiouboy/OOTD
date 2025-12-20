# Chore: Enhance Chat Dialog Style Based on Dialog Template

## Metadata
adw_id: `32927976`
prompt: `Based on the dialog template at /Users/naruechon/Documents/Project/OOTDay_Anti/chat_dialog1/dl.md, enhance the AI chat system to better match this conversation style. Focus on frontend/lib/prompts/ and frontend/lib/services/ai-chat-service.ts`

## Chore Description
Enhance the OOTDay AI chat system to match the conversation style shown in the reference dialog template (`chat_dialog1/dl.md`). The dialog demonstrates:

1. **Personalized Thai Greeting**: AI uses friendly greeting with user's name and emoji "อ้ายฮายยแป้ง👋 กำลังหาชุดไปไหนอยู่น้าา"
2. **Work-to-Evening Outfit Request**: User asks for versatile outfit for work and evening social
3. **Engaging Intro Response**: AI responds with stock excitement phrases like "ต้องชุดนี้เลยกำลังมาแรง สาวๆ ออฟฟิศหากันให้ควัก stock sold out ไปหลายรอบ"
4. **LOOKs Format**: Outfit recommendations organized as Look 1, Look 2, etc. with style names (e.g., "Vintage Layer Office Look", "Feminine Basic Mix")
5. **Style Descriptions**: Each look has engaging Thai description of the style vibe
6. **Total Price Display**: Each look shows total price for the complete outfit combination

The current system already has most of these capabilities but needs enhancement to:
- Add stock excitement phrases and trendy language
- Ensure Look naming includes style names consistently
- Add total price calculation for outfit combinations
- Match the casual, trendy tone from the dialog template

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify

- `frontend/lib/prompts/system-prompt-v2.ts` - Main system prompt used by ai-chat-service.ts. Already has Look 1/Look 2 format and OOT persona. **Needs**: Add stock excitement phrases, update Look format to include style names, add total price display instruction.

- `frontend/lib/prompts/system-prompt-v3.ts` - Alternative system prompt with state machine. **Needs**: Same updates as v2 for consistency.

- `frontend/lib/prompts/oot-persona.ts` - OOT persona definitions. **Needs**: Add new personality phrases for stock excitement and trendy language.

- `frontend/lib/prompts/tone-examples.ts` - Tone examples for good vs bad responses. **Needs**: Add example showing the Look format with style names and total price.

- `frontend/lib/services/ai-chat-service.ts` - AI chat service that calls OpenRouter. **Needs**: Review to ensure the system is passing the right context for total price calculation.

### Reference Files (Read Only)

- `chat_dialog1/dl.md` - Reference dialog template showing the target conversation style

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update OOT Persona with Stock Excitement Phrases
- Add new category in `PERSONALITY_PHRASES` for stock excitement phrases like: "กำลังมาแรง", "stock sold out ไปหลายรอบ", "สาวๆ หากันให้ควัก", "ขายดีมาก", "หมดไวมาก"
- Add new `STOCK_EXCITEMENT_PHRASES` export array in `oot-persona.ts`
- Update `TONE_EXAMPLES.suggesting` to include stock-related excitement phrases

### 2. Update System Prompt v2 with Dialog Style
- Update Template A section to include style name in Look header format:
  - Change from `**Look 1:** [Style description]`
  - To `**Look 1: [Style Name]**` with style description on next line
- Add instruction to calculate and display total price (฿X,XXX THB) for each Look
- Add stock excitement phrase examples in the greeting/intro section
- Update the example format to match: `Look 1: Vintage Layer Office Look`

### 3. Update System Prompt v3 with Same Changes
- Apply same Template A updates as v2 for consistency
- Add total price display instruction in recommendation format
- Add stock excitement language examples

### 4. Update Tone Examples with New Format
- Add new `ToneExample` for "Look Recommendation" category showing:
  - Good example with Look format including style name, description, total price
  - Bad example showing generic product listing without Look structure
- Add new `ToneExample` for "Stock Excitement" category with good vs bad examples

### 5. Validate Changes
- Review all modified files for consistency
- Ensure Look format matches dialog template: "Look 1: [Style Name]" with total price
- Verify stock excitement phrases are naturally integrated
- Check that Thai language tone remains friendly and engaging

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm run lint` - Run linting to ensure no TypeScript errors
- `cd frontend && pnpm run build` - Build to ensure no compilation errors
- Manual review: Check that system prompts contain the new Look format with style names and total price instructions
- Manual review: Verify `oot-persona.ts` exports `STOCK_EXCITEMENT_PHRASES`

## Notes

### Key Dialog Template Elements to Match
From `chat_dialog1/dl.md`:
```
AI Greeting: "อ้ายฮายยแป้ง👋 กำลังหาชุดไปไหนอยู่น้าา"
Intro: "ต้องชุดนี้เลยกำลังมาแรง สาวๆ ออฟฟิศหากันให้ควัก stock sold out ไปหลายรอบ"
Look Format: "Look 1: Vintage Layer Office Look" with style description and total price
```

### Current State
The system already has:
- OOT persona with Thai-English code-switching
- Look 1/Look 2 format in Template A
- Friendly greeting style

The system needs:
- Stock excitement phrases ("กำลังมาแรง", "หมดไวมาก")
- Style name in Look header (e.g., "Vintage Layer Office Look")
- Total price display for each outfit combination (e.g., "Total: ฿3,550")
- More trendy, engaging intro text before showing looks

### Price Calculation Note
The AI should calculate total price by summing individual product prices in each Look. This is an instruction in the system prompt - the actual calculation happens in the AI response, not in code logic.
