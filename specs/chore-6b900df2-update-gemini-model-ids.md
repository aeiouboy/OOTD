# Chore: Update AI Model IDs to 09-2025 Version

## Metadata
adw_id: `6b900df2`
prompt: `Update AI model IDs to use the 09-2025 version. In frontend/lib/services/ai-chat-service.ts, change model from 'google/gemini-2.5-flash-preview-05-20' to 'google/gemini-2.5-flash-preview-09-2025'. In frontend/lib/services/image-generation-service.ts, update to use corresponding image model if available. Keep both model versions in config/models.json for flexibility.`

## Chore Description
Update the Gemini AI model IDs across the application to use the newer 09-2025 version. This involves:
1. Updating the chat service model from `google/gemini-2.5-flash-preview-05-20` to `google/gemini-2.5-flash-preview-09-2025`
2. Investigating and updating the image generation service model to a corresponding 09-2025 version if available
3. Maintaining both model versions in the configuration file for backward compatibility and flexibility

The newer 09-2025 model offers improved capabilities with a larger context window (1,050,000 tokens) and is already defined in the models.json configuration.

## Relevant Files
Use these files to complete the chore:

- **frontend/lib/services/ai-chat-service.ts** (line 267) - Contains the OpenRouter API call with the current model ID `google/gemini-2.5-flash-preview-05-20` that needs to be updated to the 09-2025 version
- **frontend/lib/services/image-generation-service.ts** (line 21) - Contains the image generation model configuration using `google/gemini-2.5-flash-preview-image-05-20` that may need updating to a corresponding 09-2025 version
- **frontend/config/models.json** - Already contains both model definitions (05-20 and 09-2025 versions) for reference and flexibility

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Chat Service Model ID
- Open `frontend/lib/services/ai-chat-service.ts`
- Locate line 267 where the model is specified in the OpenRouter API request body
- Change `model: 'google/gemini-2.5-flash-preview-05-20'` to `model: 'google/gemini-2.5-flash-preview-09-2025'`
- Verify the change is within the `callOpenRouter` function's fetch request body

### 2. Investigate Image Model 09-2025 Availability
- Check OpenRouter documentation or the models.json file for a corresponding `google/gemini-2.5-flash-preview-image-09-2025` model
- If the 09-2025 image model exists, note its exact model ID
- If it doesn't exist yet, document that the image service will continue using the 05-20 version until the newer version is available

### 3. Update Image Generation Service Model ID (If Available)
- Open `frontend/lib/services/image-generation-service.ts`
- Locate line 21 in the `OPENROUTER_CONFIG` object where the image model is defined
- If a 09-2025 image model exists:
  - Update `model: 'google/gemini-2.5-flash-preview-image-05-20'` to the new 09-2025 version
  - Update the comment on line 20 to reflect the new model version
- If no 09-2025 image model exists:
  - Keep the current 05-20 version
  - Add a comment noting that the service will be updated when the 09-2025 image model becomes available

### 4. Verify Configuration File Maintains Flexibility
- Open `frontend/config/models.json`
- Confirm that both model versions are present:
  - `google/gemini-2.5-flash-preview-05-20` (lines 121-128)
  - `google/gemini-2.5-flash-preview-09-2025` (lines 112-119)
  - `google/gemini-2.5-flash-preview-image-05-20` (lines 130-137)
- Ensure no changes are needed to this file as it already maintains both versions for flexibility
- If a 09-2025 image model exists and was used, add its configuration to models.json following the same format

### 5. Validate the Changes
- Review all modified files to ensure model IDs are correct
- Verify that the changes are minimal and focused on model ID updates only
- Check that no other logic or functionality was inadvertently modified
- Confirm that both old and new model versions remain documented in config/models.json

## Validation Commands
Execute these commands to validate the chore is complete:

- `grep -n "google/gemini-2.5-flash-preview" frontend/lib/services/ai-chat-service.ts` - Verify the chat service now uses the 09-2025 model
- `grep -n "google/gemini-2.5-flash-preview-image" frontend/lib/services/image-generation-service.ts` - Verify the image service model ID (either updated or documented)
- `cat frontend/config/models.json | grep -A 8 "gemini-2.5-flash-preview"` - Confirm both versions are present in config
- `npm run build --prefix frontend` - Ensure the TypeScript code compiles without errors (optional, if build setup is available)

## Notes
- The 09-2025 model offers improved performance with a larger context window (1,050,000 tokens vs 1,000,000) according to models.json
- The pricing is slightly higher for the 09-2025 version ($300/$2500 per million tokens vs $150/$600), but the improved capabilities justify the update
- Keeping both versions in models.json allows for easy rollback if issues arise with the newer model
- The image model may not have a 09-2025 version yet, as image generation models often have separate release schedules from text models
- No changes to API keys, endpoints, or other configuration are required - only the model ID strings need updating
