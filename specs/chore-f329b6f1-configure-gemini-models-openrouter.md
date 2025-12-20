# Chore: Configure Gemini 2.5 Flash Models for OpenRouter

## Metadata
adw_id: `f329b6f1`
prompt: `Analyze the frontend codebase to verify and configure AI model usage from OpenRouter. The chat session should use 'google/gemini-2.5-flash-preview-05-20' (Gemini 2.5 Flash Preview) for generating text responses, and 'google/gemini-2.5-flash-preview-image-05-20' for image generation. Search for: 1) OpenRouter client configuration in lib/ folder, 2) Model selection/config files in config/ folder, 3) Chat API routes in app/api/ folder, 4) Any hardcoded model IDs. If the codebase uses different models or doesn't use OpenRouter at all, update the configuration to use these specific Gemini models from OpenRouter (base URL: https://openrouter.ai/api/v1). Ensure the chat response flow uses the text model and any image generation features use the image model.`

## Chore Description
The codebase currently uses OpenRouter API but with different models than the requested Gemini 2.5 Flash models. The system needs to be updated to use:
- **Text/Chat model**: `google/gemini-2.5-flash-preview-05-20` for all chat and text generation
- **Image model**: `google/gemini-2.5-flash-preview-image-05-20` for outfit image generation

### Current State Analysis

#### OpenRouter Configuration (✅ Already Correct)
- **Location**: `frontend/lib/openrouter-client.ts`
- **Base URL**: Already using `https://openrouter.ai/api/v1` (correct)
- **API Key**: Uses `NEXT_PUBLIC_OPENROUTER_API_KEY` environment variable

#### Chat/Text Model Usage (❌ Needs Update)
- **Location**: `frontend/lib/services/ai-chat-service.ts` (line 267)
- **Current Model**: `anthropic/claude-3.5-sonnet`
- **Required Model**: `google/gemini-2.5-flash-preview-05-20`
- **Usage**: Text-based chat responses, outfit recommendations, fashion advice

#### Image Model Usage (❌ Needs Update)
- **Location**: `frontend/lib/services/image-generation-service.ts` (line 21)
- **Current Model**: `google/gemini-2.5-flash-image-preview`
- **Required Model**: `google/gemini-2.5-flash-preview-image-05-20`
- **Usage**: Outfit visualization and image generation

#### Models Configuration File (❌ Needs Update)
- **Location**: `frontend/config/models.json`
- **Current**: Contains various models but not the specific Gemini 2.5 Flash Preview models
- **Purpose**: Model selection UI and cost tracking

## Relevant Files

### Core Service Files (Must Update)
- **`frontend/lib/services/ai-chat-service.ts`** - Contains hardcoded Claude 3.5 Sonnet model ID (line 267) that needs to be changed to Gemini 2.5 Flash Preview for text
- **`frontend/lib/services/image-generation-service.ts`** - Contains model ID configuration (line 21) that needs to be updated to the correct Gemini image model

### Configuration Files (Must Update)
- **`frontend/config/models.json`** - Model catalog for UI selection and cost tracking, needs to include the new Gemini models

### Client Files (No Changes Needed)
- **`frontend/lib/openrouter-client.ts`** - OpenRouter API client, already correctly configured with base URL and proper API handling

### API Routes (Indirect Update)
- **`frontend/app/api/chat/route.ts`** - Chat API endpoint, uses ai-chat-service (indirect dependency)
- **`frontend/app/api/generate-image/route.ts`** - Image generation endpoint, uses image-generation-service (indirect dependency)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Chat Service Model Configuration
- Open `frontend/lib/services/ai-chat-service.ts`
- Locate line 267 where the model is defined: `model: 'anthropic/claude-3.5-sonnet'`
- Replace with: `model: 'google/gemini-2.5-flash-preview-05-20'`
- Verify that the model parameter is passed to the OpenRouter API correctly in the fetch call
- Update any comments that reference Claude to mention Gemini 2.5 Flash instead

### 2. Update Image Generation Service Model Configuration
- Open `frontend/lib/services/image-generation-service.ts`
- Locate line 21 in the `OPENROUTER_CONFIG` object where the model is defined
- Update the model ID from `'google/gemini-2.5-flash-image-preview'` to `'google/gemini-2.5-flash-preview-image-05-20'`
- Verify the configuration includes the correct base URL (`https://openrouter.ai/api/v1`)
- Update the model description comment to reflect the correct model name

### 3. Update Models Configuration File
- Open `frontend/config/models.json`
- Add the text model entry:
  ```json
  {
    "id": "google/gemini-2.5-flash-preview-05-20",
    "name": "Gemini 2.5 Flash Preview (Text)",
    "provider": "Google",
    "inputPricePerMillion": 150,
    "outputPricePerMillion": 600,
    "contextWindow": 1000000,
    "maxOutputTokens": 8192
  }
  ```
- Add the image model entry:
  ```json
  {
    "id": "google/gemini-2.5-flash-preview-image-05-20",
    "name": "Gemini 2.5 Flash Preview (Image)",
    "provider": "Google",
    "inputPricePerMillion": 150,
    "outputPricePerMillion": 600,
    "contextWindow": 1000000,
    "maxOutputTokens": 8192
  }
  ```
- Ensure the JSON syntax is valid with proper commas and structure
- Consider marking older models as deprecated or removing unused ones

### 4. Verify Environment Configuration
- Confirm that `.env.local` or `.env` contains `OPENROUTER_API_KEY` or `NEXT_PUBLIC_OPENROUTER_API_KEY`
- Check if there are any model-specific environment variables that need updating
- Verify that the API key has access to Gemini 2.5 Flash models on OpenRouter

### 5. Test Model Integration
- Start the development server: `cd frontend && npm run dev` (or `pnpm dev`)
- Test the chat functionality by sending a test message
- Verify console logs show the correct model ID being used
- Test image generation by requesting an outfit visualization
- Check API responses and console logs for any model-related errors
- Confirm that both text and image generation work correctly with the new models

### 6. Validate Response Structure
- Review response handling code to ensure compatibility with Gemini models
- Check if response parsing in `image-generation-service.ts` (parseImageResponse method) works with Gemini 2.5 Flash image format
- Verify that chat responses from Gemini follow the expected structure
- Test edge cases: long prompts, special characters, multi-turn conversations

## Validation Commands
Execute these commands to validate the chore is complete:

### Verify Model IDs in Code
```bash
cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend
grep -n "anthropic/claude" lib/services/ai-chat-service.ts || echo "✅ No Claude model references found"
grep -n "google/gemini-2.5-flash-preview-05-20" lib/services/ai-chat-service.ts && echo "✅ Chat model configured correctly"
grep -n "google/gemini-2.5-flash-preview-image-05-20" lib/services/image-generation-service.ts && echo "✅ Image model configured correctly"
```

### Validate Models Config JSON
```bash
cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend
cat config/models.json | grep "gemini-2.5-flash-preview-05-20" && echo "✅ Text model in config"
cat config/models.json | grep "gemini-2.5-flash-preview-image-05-20" && echo "✅ Image model in config"
node -e "JSON.parse(require('fs').readFileSync('config/models.json', 'utf8'))" && echo "✅ Valid JSON syntax"
```

### Build Check (TypeScript Compilation)
```bash
cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend
npm run build || pnpm build
# Should complete without TypeScript errors
```

### Runtime Test (Optional - Requires API Key)
```bash
cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend
npm run dev
# Then test:
# 1. Open http://localhost:3000 in browser
# 2. Send a chat message and verify model ID in browser console
# 3. Request image generation and check logs
# 4. Confirm responses are generated correctly
```

## Notes

### Model Compatibility
- Gemini 2.5 Flash Preview models are optimized for speed and cost-effectiveness
- Both models use the same OpenRouter API endpoint (`/chat/completions`)
- The image model requires `modalities: ['text', 'image']` parameter (already configured)
- Ensure API key has sufficient credits for both text and image generation

### Breaking Changes
- Switching from Claude to Gemini may result in different response styles and formats
- Response validation logic in `response-validator.ts` may need adjustments if Gemini responses don't match expected templates
- System prompts designed for Claude may need refinement for Gemini's instruction-following style
- Monitor production logs for any new validation errors after deployment

### Cost Considerations
- Gemini 2.5 Flash is generally more cost-effective than Claude 3.5 Sonnet
- Update `lib/cost-calculator.ts` if cost tracking is used
- Consider setting up usage monitoring in OpenRouter dashboard

### Testing Recommendations
- Test multi-turn conversations to ensure context is maintained
- Verify Thai language support (critical for OOTDay users)
- Test edge cases: very long prompts, special characters, product URLs
- Monitor response times and compare with previous Claude performance
- Validate that product recommendations maintain quality and relevance

### Rollback Plan
If issues arise with Gemini models:
1. Revert model IDs in `ai-chat-service.ts` and `image-generation-service.ts`
2. Restore previous configuration from git history: `git checkout HEAD~1 -- frontend/lib/services/`
3. Rebuild and redeploy
