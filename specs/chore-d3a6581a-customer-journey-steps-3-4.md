# Chore: Implement Customer Journey Steps 3 & 4 - Friend Mode & Looks Inspiration

## Metadata
adw_id: `d3a6581a`
prompt: `Implement Customer Journey Steps 3 (Talk with friend) and Step 4 (Looks inspiration) based on specs/customer-journey-steps-3-4.md. Create image generation service using OpenRouter with model google/gemini-2.5-flash-preview-05-20 for outfit visualization. Enhance system prompt for friend-like conversation. Add LooksInspiration component and integrate into chat flow.`

## Chore Description

This chore implements the next phase of the customer journey by enhancing the conversational experience (Step 3: "Talk with friend") and adding visual outfit inspiration capabilities (Step 4: "Looks inspiration").

**Step 3 Goals:**
- Enhance system prompt to create a more natural, friend-like conversational experience
- Use more casual, friendly Thai language patterns
- Remember user preferences across conversations
- Provide proactive style suggestions based on context

**Step 4 Goals:**
- Implement text-to-image generation using OpenRouter's Gemini 2.5 Flash Image model
- Create service layer for outfit visualization
- Add API endpoint for image generation
- Build UI component to display generated outfit images
- Integrate image generation into the chat flow with trigger detection

**Technical Stack:**
- OpenRouter API with `google/gemini-2.5-flash-preview-05-20` model
- Next.js 14 API routes
- React components with TypeScript
- Existing chat infrastructure and session management

## Relevant Files

### Existing Files (Read and Modify)
- **frontend/lib/prompts/system-prompt-v3.ts** - Current system prompt that needs friend-mode enhancement
- **frontend/lib/services/ai-chat-service.ts** - Chat service that needs image generation integration
- **frontend/components/chat/ChatInterface.tsx** - Main chat component that needs LooksInspiration integration
- **frontend/app/api/chat/route.ts** - Chat API route that may need modifications for image requests
- **frontend/.env.local** - Environment variables (needs OPENROUTER_API_KEY if not present)
- **frontend/package.json** - Dependencies (check if any new packages needed)

### New Files (To be Created)

#### 1. Image Generation Service
- **frontend/lib/services/image-generation-service.ts** - OpenRouter client for Gemini 2.5 Flash Image model with prompt engineering for fashion/outfit generation

#### 2. API Route
- **frontend/app/api/generate-image/route.ts** - POST endpoint for image generation requests

#### 3. UI Component
- **frontend/components/chat/LooksInspiration.tsx** - Component to display generated outfit images with loading/error states

#### 4. Type Definitions
- **frontend/lib/types/image-types.ts** - TypeScript types for image generation requests/responses

#### 5. Utility Functions
- **frontend/lib/utils/image-trigger-detector.ts** - Detect when user wants outfit visualization (e.g., "show me", "แสดงให้ดูหน่อย")

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Type Definitions for Image Generation
- Create `frontend/lib/types/image-types.ts`
- Define `ImageGenerationRequest` interface with outfit description and style parameters
- Define `ImageGenerationResponse` interface with image URL/base64 and metadata
- Define `LooksInspirationProps` interface for the UI component
- Export all types

### 2. Create Image Trigger Detection Utility
- Create `frontend/lib/utils/image-trigger-detector.ts`
- Implement `detectImageRequest(message: string): boolean` function
- Add Thai and English trigger phrases: "show me", "แสดงให้ดูหน่อย", "อยากเห็นว่าหน้าตาเป็นยังไง", "looks inspiration", "visualize", "ดูรูป"
- Implement `extractOutfitDescription(message: string, conversationHistory: array): string` function
- Add unit tests for common patterns

### 3. Create Image Generation Service Layer
- Create `frontend/lib/services/image-generation-service.ts`
- Implement `OpenRouterImageClient` class with:
  - `generateOutfitImage(description: string, options?: object): Promise<ImageGenerationResponse>`
  - Error handling with fallback messages
  - Retry logic (max 2 retries)
  - Timeout handling (30s timeout)
- Add fashion-specific prompt engineering template:
  - Professional photography style
  - Clear outfit composition
  - Thai fashion aesthetic considerations
  - Central Group product representation
- Add rate limiting check (client-side)
- Add logging for debugging

### 4. Create Image Generation API Route
- Create `frontend/app/api/generate-image/route.ts`
- Implement POST handler accepting `{ description: string, style?: object }`
- Validate OPENROUTER_API_KEY environment variable
- Call OpenRouter API with model `google/gemini-2.5-flash-preview-05-20`
- Handle errors gracefully with appropriate status codes
- Return `{ imageUrl?: string, imageBase64?: string, error?: string }`
- Add request logging
- Set appropriate CORS headers
- Add rate limiting (server-side) - max 10 requests per minute per IP

### 5. Create LooksInspiration UI Component
- Create `frontend/components/chat/LooksInspiration.tsx`
- Implement component with props: `{ outfitDescription: string, imageUrl?: string, isLoading?: boolean, error?: string }`
- Add loading state with skeleton loader animation
- Add error state with retry button and friendly error message
- Add success state with:
  - Image display with zoom capability (click to expand)
  - Image caption with outfit description
  - Download button (optional)
  - "Generate another" button
- Use shadcn/ui components (Dialog, Card, Button, Skeleton)
- Add responsive design (mobile-first)
- Add accessibility attributes (alt text, ARIA labels)

### 6. Enhance System Prompt for Friend Mode
- Update `frontend/lib/prompts/system-prompt-v3.ts`
- Add new section: "## FRIEND MODE - CONVERSATIONAL PERSONALITY 💬"
- Enhance Thai language guidelines:
  - Use more casual particles: "นะ", "จ้า", "เนอะ", "ล่ะ"
  - Add friendly exclamations: "เท่มาก!", "สวยสุดๆ!", "เข้ากันมากเลย!"
  - Use first-person naturally: "เราว่า...", "เรามีไอเดีย..."
- Add conversation memory instructions:
  - Reference previous preferences naturally
  - Build on earlier conversation context
  - Show genuine interest in user's style journey
- Add proactive suggestion triggers:
  - When detecting special occasions, suggest complete looks
  - When colors mentioned, suggest complementary pieces
  - When budget mentioned, suggest value alternatives
- Add examples of good vs. bad friend-like responses
- Maintain all existing v3.0 features (state machine, validation, etc.)
- Update version to v3.1 with metadata

### 7. Integrate Image Generation into AI Chat Service
- Update `frontend/lib/services/ai-chat-service.ts`
- Import image trigger detector utility
- In `processAIChatRequest` function:
  - After guardrail check, add image request detection
  - If image request detected:
    - Extract outfit description from conversation context
    - Return special response type: `{ message: string, imageRequest: true, outfitDescription: string }`
    - Skip normal product recommendation flow
- Add new response type in `ChatResponse` interface: `imageRequest?: boolean, outfitDescription?: string`
- Add logging for image request detection

### 8. Update ChatInterface to Handle Image Requests
- Update `frontend/components/chat/ChatInterface.tsx`
- Import `LooksInspiration` component
- In `handleSendMessage` function:
  - Check API response for `imageRequest` flag
  - If true, call `/api/generate-image` endpoint
  - Display `LooksInspiration` component in message thread
  - Handle loading state during image generation
  - Handle errors from image generation
- Add new message type for image responses in chat history
- Update message rendering to support LooksInspiration blocks
- Add retry mechanism for failed image generations

### 9. Update ChatMessage Component for Image Display
- Update `frontend/components/chat/ChatMessage.tsx` (or create if doesn't exist)
- Add support for rendering `LooksInspiration` component within messages
- Handle image message type differently from text/outfit recommendations
- Add proper spacing and styling for image blocks
- Ensure mobile responsiveness

### 10. Add Environment Variable Configuration
- Update `frontend/.env.example` with:
  - `OPENROUTER_API_KEY=your_openrouter_api_key_here`
  - `NEXT_PUBLIC_ENABLE_IMAGE_GENERATION=true` (feature flag)
- Document the environment variable in README or inline comments

### 11. Test Image Generation Flow End-to-End
- Test trigger detection with various Thai and English phrases
- Test image generation with different outfit descriptions:
  - "แสดงให้ดูชุดไปทำงานหน่อย"
  - "Show me a casual weekend outfit"
  - "อยากเห็นชุดไปงานแต่งงาน"
- Test error handling:
  - Invalid API key
  - Network timeout
  - Rate limit exceeded
- Test loading states and UI transitions
- Test on mobile and desktop viewports
- Verify accessibility (keyboard navigation, screen readers)

### 12. Update Documentation and Add Usage Examples
- Add inline code comments for image generation service
- Document OpenRouter model usage and pricing implications
- Add example requests/responses in comments
- Document trigger phrases for future reference
- Update any relevant technical documentation

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm install` - Ensure all dependencies are installed
- `cd frontend && pnpm lint` - Verify no linting errors
- `cd frontend && pnpm build` - Ensure production build succeeds without errors
- `cd frontend && pnpm test` - Run unit tests for new utilities (if tests created)
- **Manual Testing:**
  - Start dev server: `cd frontend && pnpm dev`
  - Navigate to chat interface at `http://localhost:3000`
  - Test friend-mode conversation by asking: "สวัสดีค่ะ อยากหาชุดไปทำงาน"
  - Verify friendly, casual Thai responses
  - Test image generation by saying: "แสดงให้ดูหน่อย" or "show me what this looks like"
  - Verify image loads, or error handling works if API key not configured
  - Test mobile responsiveness in browser DevTools
  - Test error states by temporarily using invalid API key

## Notes

### OpenRouter API Considerations
- Model: `google/gemini-2.5-flash-preview-05-20`
- Pricing: Check OpenRouter pricing page for current rates (likely ~$0.0001/image)
- Context window: 1M tokens (very large)
- Capabilities: text-to-image, vision
- May require special API permissions or model access approval

### Fashion Image Prompt Engineering Tips
- Use clear descriptive language: "A professional photograph of a [outfit type]"
- Include style keywords: "Thai contemporary fashion", "elegant", "casual chic"
- Specify composition: "full body shot", "outfit flat lay", "styled mannequin"
- Add lighting/mood: "natural lighting", "studio photography", "soft shadows"
- Avoid ambiguity: Be specific about colors, patterns, silhouettes

### Performance Considerations
- Image generation can take 5-30 seconds
- Show clear loading indicators to set user expectations
- Consider caching generated images (future enhancement)
- Rate limiting is essential to control costs
- Consider implementing request queue for high traffic

### Future Enhancements (Out of Scope for This Chore)
- Image history/gallery feature
- Save favorite generated looks
- Share generated images on social media
- Generate multiple variations at once
- Fine-tune prompts based on user feedback
- Integration with virtual try-on (Step 5)

### Accessibility Requirements
- All images must have descriptive alt text
- Loading states must be announced to screen readers
- Keyboard navigation must work for all interactive elements
- Color contrast must meet WCAG AA standards
- Error messages must be clear and actionable

### Testing Scenarios
1. **Happy Path**: User asks for outfit, then asks "show me" → Image generates successfully
2. **No API Key**: Feature gracefully disabled with helpful message
3. **API Error**: Timeout or error → Clear error message with retry option
4. **Rate Limited**: Too many requests → "Please wait" message with countdown
5. **Unclear Request**: Vague outfit description → AI asks clarifying question first
6. **Mobile Usage**: All features work on small screens
7. **Slow Network**: Loading indicators show, no UI freezing
