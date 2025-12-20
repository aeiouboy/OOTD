# Customer Journey Implementation: Steps 3 & 4

## Overview

Implement support for Customer Journey Steps 3 ("Talk with friend") and Step 4 ("Looks inspiration") with text-to-image generation using the Gemini 2.5 Flash Image model from OpenRouter.

## Customer Journey Context

From the customer journey diagram:
1. **Step 1**: User asks "Hay friend! What should I wear to office?"
2. **Step 2**: "Know you" - OOTDay learns about user preferences
3. **Step 3**: "Talk with friend" - Conversational fashion advice (TARGET)
4. **Step 4**: "Looks inspiration" - Visual outfit inspiration (TARGET)
5. **Step 5**: "Let's try-on" - Virtual try-on
6. **Step 6**: "Close the sale" - Purchase on Central

## Requirements

### Step 3: "Talk with friend" Enhancement

Enhance the system prompt to create a more friend-like conversational experience:
- More casual, friendly Thai language patterns
- Remember user preferences across conversation
- Proactive style suggestions based on context
- Natural flow like chatting with a fashion-savvy friend

### Step 4: "Looks inspiration" - Image Generation

Implement text-to-image generation for outfit visualization:
- Use OpenRouter API with model: `google/gemini-2.5-flash-preview-05-20`
- Generate outfit inspiration images based on user queries
- Display generated images in the chat interface
- Allow users to request "show me what this looks like"

## Technical Implementation

### 1. Image Generation Service

Create `/frontend/lib/services/image-generation-service.ts`:
- OpenRouter client for Gemini 2.5 Flash Image model
- Prompt engineering for fashion/outfit image generation
- Error handling and fallback

### 2. Image Generation API Route

Create `/frontend/app/api/generate-image/route.ts`:
- POST endpoint accepting outfit description
- Returns generated image URL or base64
- Rate limiting consideration

### 3. System Prompt Enhancement

Update `/frontend/lib/prompts/system-prompt-v2.ts`:
- Add "friend mode" persona enhancement
- Include triggers for image generation (e.g., "show me", "visualize")
- Natural conversation flow for inspiration requests

### 4. UI Component

Create `/frontend/components/chat/LooksInspiration.tsx`:
- Display generated outfit images
- Loading state with skeleton
- Error state handling
- Image zoom/expand capability

### 5. Chat Integration

Update `/frontend/components/chat/ChatInterface.tsx`:
- Detect when user wants outfit visualization
- Trigger image generation
- Display results in chat flow

## Model Configuration

```json
{
  "id": "google/gemini-2.5-flash-preview-05-20",
  "name": "Gemini 2.5 Flash (Image)",
  "provider": "Google",
  "capabilities": ["text-to-image", "vision"],
  "contextWindow": 1000000
}
```

## API Request Format

```typescript
// OpenRouter request for image generation
{
  model: "google/gemini-2.5-flash-preview-05-20",
  messages: [
    {
      role: "user",
      content: "Generate a fashion outfit image: [outfit description]"
    }
  ]
}
```

## Success Criteria

1. Users can have natural, friend-like conversations about fashion
2. Users can request outfit visualizations with phrases like:
   - "แสดงให้ดูหน่อย" (show me)
   - "อยากเห็นว่าหน้าตาเป็นยังไง" (want to see how it looks)
   - "Looks inspiration"
3. Generated images appear in the chat flow
4. Smooth integration with existing chat functionality
