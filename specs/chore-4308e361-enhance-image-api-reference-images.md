# Chore: Enhance Image Generation API for Reference Image Support

## Metadata
adw_id: `4308e361`
prompt: `Enhance image generation API to support reference images for fitting model face-matching.`

## Chore Description
The fitting-model-service.ts currently passes the user's photo as base64 embedded in the text prompt, but the generate-image API doesn't actually send it as an image reference to the model. This prevents accurate face-matching because the AI model cannot "see" the reference image - it only receives text describing that an image exists.

This chore enhances the image generation pipeline to properly support multimodal input, allowing the fitting model generation to pass the user's face photo as an actual image input that the AI can analyze for accurate face matching.

Key changes:
1. Update type definitions to support reference images and generation types
2. Add multimodal request capability to OpenRouterImageClient
3. Update API route to handle reference images and route to appropriate generation method
4. Update fitting-model-service to use the new reference image field

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/types/image-types.ts** - Type definitions for image generation. Needs new fields for `referenceImage` and `generationType`.

- **apps/web/lib/services/image-generation-service.ts** - OpenRouterImageClient class that handles API communication. Needs new method `generateFittingModelImage()` that uses OpenRouter's multimodal content format to pass images.

- **apps/web/app/api/generate-image/route.ts** - Next.js API route handler. Needs to accept `referenceImage` in request body, route to appropriate generation method based on `generationType`, and handle longer timeouts for fitting model generation.

- **apps/web/lib/services/fitting-model-service.ts** - Client-side service that calls the API. Currently embeds base64 in text prompt; needs to pass it as `referenceImage` field instead.

- **data/personas/prompt_gen/fitting_model.md** - Reference prompt template for fitting model generation (for context only, no changes needed).

### Reference Documentation
- [OpenRouter Multimodal Images Documentation](https://openrouter.ai/docs/guides/overview/multimodal/images) - Shows proper format for sending images via the API using content array with `type: 'image_url'` and `imageUrl: { url: base64Data }`.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update ImageGenerationRequest Type
- Open `apps/web/lib/types/image-types.ts`
- Add optional `referenceImage?: string` field to `ImageGenerationRequest` interface with JSDoc comment explaining it accepts base64 image data (with data URL prefix)
- Add optional `generationType?: 'outfit' | 'fitting-model'` field to distinguish between regular outfit generation and fitting model generation

### 2. Add generateFittingModelImage Method to OpenRouterImageClient
- Open `apps/web/lib/services/image-generation-service.ts`
- Add a new public method `generateFittingModelImage(prompt: string, referenceImageBase64: string): Promise<ImageGenerationResponse>`
- This method should:
  - Validate both prompt and referenceImageBase64 are provided
  - Build a multimodal request body using OpenRouter's content array format:
    ```typescript
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: referenceImageBase64, // Base64 data URL
            },
          },
        ],
      },
    ]
    ```
  - Use longer timeout (60000ms) since fitting model generation may take longer
  - Include `modalities: ['text', 'image']` for image generation output
  - Reuse existing `parseImageResponse()` method for response handling
  - Include proper error handling and retry logic (can leverage existing patterns)

### 3. Update API Route to Support Reference Images
- Open `apps/web/app/api/generate-image/route.ts`
- Update the POST handler to extract `referenceImage` and `generationType` from request body
- Add validation for `referenceImage` when `generationType` is 'fitting-model':
  - Must be a non-empty string
  - Should start with 'data:image/' (base64 data URL format)
- Route to appropriate generation method based on `generationType`:
  - If `generationType === 'fitting-model'` and `referenceImage` is provided: call `imageClient.generateFittingModelImage(description, referenceImage)`
  - Otherwise: call existing `imageClient.generateOutfitImage(description, style)`
- Update description length limit for fitting-model type (prompt can be longer due to detailed requirements, suggest 3000 characters)

### 4. Update fitting-model-service.ts to Use New API Fields
- Open `apps/web/lib/services/fitting-model-service.ts`
- In `generateFittingModel()` function:
  - Remove the reference image text embedding from the prompt (lines 135-141 that add `REFERENCE IMAGE:` section)
  - Keep the prompt template clean without base64 text references
  - Update the API request body to include:
    ```typescript
    {
      description: FITTING_MODEL_PROMPT_TEMPLATE,
      referenceImage: userPhotoBase64,
      generationType: 'fitting-model',
      style: { ... }
    }
    ```
- The mystery mode (`generateDefaultFittingModel()`) should remain unchanged as it doesn't use a reference image

### 5. Validate the Implementation
- Ensure TypeScript compiles without errors
- Verify the API route correctly routes based on `generationType`
- Confirm the OpenRouter request format matches their multimodal documentation
- Check that base64 images are properly passed in the content array format

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Verify TypeScript compilation and Next.js build succeeds
- `cd apps/web && pnpm lint` - Check for linting errors
- `cd apps/web && pnpm tsc --noEmit` - Type-check without emitting files

## Notes

### OpenRouter Multimodal Format
According to OpenRouter documentation, images should be sent in the content array format:
```typescript
{
  role: 'user',
  content: [
    { type: 'text', text: 'prompt here' },
    { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } }
  ]
}
```

OpenRouter recommends sending the text prompt first, then the images.

### Timeout Considerations
Fitting model generation with reference image analysis may take longer than standard outfit generation. The current 30-second timeout should be increased to 60 seconds for fitting model requests.

### Backward Compatibility
The changes are backward compatible:
- `referenceImage` and `generationType` are optional fields
- Existing callers that don't provide these fields will continue to work with the default outfit generation flow
- The `generateOutfitImage()` method remains unchanged
