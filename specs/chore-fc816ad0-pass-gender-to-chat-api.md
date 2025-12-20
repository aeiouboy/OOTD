# Chore: Pass User Gender to Chat API and Update Response Style

## Metadata
adw_id: `fc816ad0`
prompt: `Analyze and fix the OOTDay chat to: 1) Pass user's gender from profile to chat API - ChatAssistant.tsx and ChatInterface.tsx (lines 59-88) must import useUserProfile hook from lib/hooks/useUserProfile.ts and send userPreferences: { gender: profile?.gender } to /api/chat endpoint. Currently userPreferences is accepted by API (app/api/chat/route.ts line 23) but never sent from frontend. 2) Update system prompt (lib/prompts/system-prompt-v2.ts) to skip gender question when userPreferences.gender is provided in the request - add 'USER PREFERENCES CONTEXT' section that says 'If userPreferences.gender is women/men, do NOT ask about gender - use it directly'. 3) Make AI responses match the natural friendly style from chat_dialog examples: Use 'ได้เลยจ้า!' greeting style, 'Look 1:', 'Look 2:' format for outfit suggestions, casual Thai expressions like 'เว่ามา', 'เนอะ', 'จ้า' instead of formal 'ค่ะ'.`

## Chore Description
This chore addresses three key issues with the OOTDay chat functionality:

1. **Gender from Profile Not Passed to API**: The frontend components (`ChatAssistant.tsx` and `ChatInterface.tsx`) do not pass the user's gender preference from their profile to the `/api/chat` endpoint, even though the API already accepts `userPreferences` with a `gender` field. This causes the AI to unnecessarily ask about gender when it's already available from user onboarding.

2. **System Prompt Doesn't Use Pre-filled Gender**: The system prompt (`system-prompt-v2.ts`) has smart clarification logic but doesn't check for pre-filled `userPreferences.gender` from the API request, causing redundant questions.

3. **Response Style Doesn't Match Expected Dialog Format**: The reference chat_dialog examples (Desktop - 1.1.png, 1.2.png) show a specific response style:
   - Natural Thai greeting like "ได้เลยจ้า!"
   - "Look 1:", "Look 2:" format for outfit suggestions
   - Casual Thai expressions (เว่ามา, เนอะ, จ้า) instead of formal endings (ค่ะ)
   - LOOKs section with product images

## Relevant Files
Use these files to complete the chore:

### Frontend Chat Components
- `frontend/components/chat/ChatAssistant.tsx` - Main chat assistant component. Lines 59-88 contain the `handleSendMessage` function that calls `/api/chat`. Must import `useUserProfile` hook and send `userPreferences.gender`.

- `frontend/components/chat/ChatInterface.tsx` - Alternative chat interface component. Lines 57-88 contain similar `handleSendMessage` function that also needs the same modifications.

### User Profile Hook
- `frontend/lib/hooks/useUserProfile.ts` - Custom hook that manages user profile state with localStorage persistence. Provides `profile.gender` that needs to be passed to the chat API. The `UserProfile` type includes `gender: 'women'` (hardcoded in updateProfile but should be dynamic).

### API and Services
- `frontend/app/api/chat/route.ts` - Chat API route. Line 23 already destructures `userPreferences` from request body. Currently receives undefined from frontend.

- `frontend/lib/services/ai-chat-service.ts` - AI chat service. Lines 80-96 define `ChatRequest` interface which already includes `userPreferences.gender?: 'men' | 'women'`. The `processAIChatRequest` function needs to forward gender to AI context.

### System Prompt
- `frontend/lib/prompts/system-prompt-v2.ts` - Main system prompt (v2.3). Contains:
  - Smart clarification logic (lines 339-436) with gender as Priority 1
  - Must add "USER PREFERENCES CONTEXT" section to skip gender question when pre-filled
  - Template A/B enforcement rules need "Look 1:", "Look 2:" format addition

### Reference Examples
- `chat_dialog/Desktop - 1.1.png` - Shows expected dialog format with:
  - "ได้เลยจ้า!" style greeting
  - "Look 1:", "Look 2:" bullet format
  - Casual Thai expressions
  - LOOKs section with product grid

### New Files
None required - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add useUserProfile Hook to ChatAssistant.tsx
- Import `useUserProfile` hook at the top of the file: `import { useUserProfile } from '@/lib/hooks/useUserProfile'`
- Add the hook inside the component function to get profile data: `const { profile } = useUserProfile()`
- In the `handleSendMessage` function (line 59), update the request body to include `userPreferences`:
  ```typescript
  body: JSON.stringify({
    message: content.trim(),
    conversationHistory: messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
    sessionContext,
    conversationId,
    userPreferences: {
      gender: profile?.gender as 'men' | 'women' | undefined,
    },
  }),
  ```

### 2. Add useUserProfile Hook to ChatInterface.tsx
- Import `useUserProfile` hook at the top of the file: `import { useUserProfile } from '@/lib/hooks/useUserProfile'`
- Add the hook inside the component function: `const { profile } = useUserProfile()`
- In the `handleSendMessage` function (line 57), update the request body similarly:
  ```typescript
  body: JSON.stringify({
    message: content.trim(),
    conversationHistory: messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
    sessionContext,
    conversationId,
    userPreferences: {
      gender: profile?.gender as 'men' | 'women' | undefined,
    },
  }),
  ```

### 3. Update System Prompt with USER PREFERENCES CONTEXT Section
- Add a new section "USER PREFERENCES CONTEXT" after the "YOUR ROLE - OOT PERSONA" section in `system-prompt-v2.ts`:
  ```
  ## USER PREFERENCES CONTEXT 📋
  **CRITICAL: Check userPreferences BEFORE asking clarifying questions!**

  The API may provide pre-filled user preferences from their profile:
  - \`userPreferences.gender\`: 'men' | 'women' | undefined

  ### How to Use Pre-filled Preferences
  **IF \`userPreferences.gender\` is 'women' or 'men':**
  - DO NOT ask about gender - use it directly
  - Skip the gender clarification question entirely
  - Apply the gender filter immediately in recommendations

  **IF \`userPreferences.gender\` is undefined or not provided:**
  - Follow normal clarification flow (ask about gender if needed)

  ### Priority Order Update
  When userPreferences.gender IS provided:
  1. ~~Gender~~ (SKIP - already known from profile)
  2. Occasion (PRIORITY: HIGH)
  3. Climate/Destination (PRIORITY: MEDIUM)
  4. Budget (PRIORITY: LOW)
  ```

### 4. Update Smart Clarification Logic for Pre-filled Gender
- In the "SMART CLARIFICATION" section (around line 339), update the Gender clarification rules:
  ```
  #### 1. Gender (PRIORITY: HIGH - SKIP IF PRE-FILLED) 👔👗
  **⚠️ CHECK userPreferences.gender FIRST:**
  - If userPreferences.gender is 'women' or 'men' → SKIP this question entirely
  - If userPreferences.gender is undefined → proceed to check conversation history

  **⚠️ THEN CHECK CONVERSATION HISTORY:**
  - Scan ALL previous messages for gender keywords BEFORE asking
  ```

### 5. Update Response Format to Use "Look 1:", "Look 2:" Style
- In the "TEMPLATE A: FOR CLOTHS CATEGORY" section (around line 675), update the format to match chat_dialog examples:
  ```
  ### TEMPLATE A: FOR CLOTHS CATEGORY (Outfit Recommendations)

  [Friendly acknowledgment - use "ได้เลยจ้า!" style greeting]

  มีลุคน่าสนใจมาแนะนำเลยนะ! ✨

  **LOOKs**

  • **Look 1:** [Style description]
    - [Product 1] - [Brand] ราคา [Price] บาท
    - [Product 2] - [Brand] ราคา [Price] บาท
    💡 [Styling tip for this look]

  • **Look 2:** [Style description]
    - [Product 1] - [Brand] ราคา [Price] บาท
    - [Product 2] - [Brand] ราคา [Price] บาท
    💡 [Styling tip for this look]

  ลองดูนะจ้า! ถ้าอยากเห็นแบบอื่นบอกได้เลย 😊
  ```

### 6. Update Personality Phrases for Natural Thai Style
- In the "PERSONALITY & TONE" section, add/emphasize these expressions:
  - Add "ได้เลยจ้า!" to Excited/Supportive phrases
  - Add "เว่ามา" to Friend-speak phrases
  - Emphasize using "จ้า" and "เนอะ" more than "ค่ะ"
  - Update examples to show the "Look 1:", "Look 2:" format

### 7. Update AI Chat Service to Pass Gender in Prompt Context
- In `ai-chat-service.ts`, update the `processAIChatRequest` function to include gender in the AI prompt context:
  - Add gender from `request.userPreferences?.gender` to the prompt context
  - Format it clearly for the AI: `[USER PROFILE] Gender: ${gender || 'not specified'}`

### 8. Validate the Implementation
- Check that the frontend correctly passes `userPreferences.gender` to the API
- Verify that the system prompt handles pre-filled gender correctly
- Test that AI responses use the "Look 1:", "Look 2:" format
- Confirm natural Thai expressions are used instead of formal endings

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npx tsc --noEmit` - TypeScript compilation check to ensure no type errors
- `cd frontend && npm run lint` - Run ESLint to check for code style issues
- `cd frontend && npm run build` - Build the frontend to ensure no build errors
- Manual test: Open the app, complete onboarding with gender selection, then start a chat. The AI should NOT ask about gender and should use "Look 1:", "Look 2:" format in responses.

## Notes

1. **User Profile Type**: The `UserProfile` type in `frontend/lib/types/user-profile-types.ts` should support `gender: 'men' | 'women'` but currently the `updateProfile` function in `useUserProfile.ts` has `gender: 'women'` hardcoded. This may need to be fixed separately if gender is not being saved correctly from onboarding.

2. **System Prompt Version**: This change updates system-prompt-v2.ts to v2.4.0 with the new USER PREFERENCES CONTEXT feature and "Look" format.

3. **Chat Dialog Reference**: The reference images in `chat_dialog/` folder show the expected UX:
   - Desktop - 1.1.png: Shows "Look 1:", "Look 2:" format with product thumbnails
   - Desktop - 1.2.png: Shows follow-up conversation with LOOKs section
   - The AI should match this natural, friendly Thai style

4. **Backward Compatibility**: The changes are backward compatible - if `userPreferences.gender` is not provided, the system falls back to asking the clarification question as before.
