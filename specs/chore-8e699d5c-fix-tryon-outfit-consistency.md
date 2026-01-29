# Chore: Fix Try-On Outfit Consistency with Dual Image Reference

## Metadata
adw_id: `8e699d5c`
prompt: `Fix try-on outfit consistency by passing flat-lay image as visual reference. Current issue: try-on generates random outfits instead of matching the actual recommended outfit shown in the flat-lay image.`

## Chore Description
The current try-on feature generates random outfits instead of matching the exact outfit shown in the flat-lay image. This is because the try-on generation only receives the fitting model image as a reference, but not the flat-lay image showing the recommended outfit.

To fix this, we need to implement dual-image reference support where:
1. **IMAGE 1** (fitting model): Used to match the person's face and body exactly
2. **IMAGE 2** (flat-lay): Used to show the exact outfit items the model must wear

The multimodal API request must send both images in the content array, and the prompt must explicitly reference both images so the AI knows which image serves which purpose.

## Relevant Files
Use these files to complete the chore:

- **`apps/web/lib/services/fitting-model-service.ts`** - Contains `TryOnLooksRequest` interface and `generateTryOnLooks()` function that needs to accept and pass flat-lay image
- **`apps/web/lib/services/image-generation-service.ts`** - Contains `OpenRouterImageClient` class; needs new method `generateTryOnWithDualReference()` for dual-image multimodal requests
- **`apps/web/components/chat/OutfitRecommendationCard.tsx`** - Contains `handleTryOn()` and `handleRegenerate()` that need to pass flat-lay image to `generateTryOnLooks()`
- **`apps/web/app/api/generate-image/route.ts`** - API route that handles image generation; needs to support secondary reference image
- **`apps/web/lib/types/image-types.ts`** - Contains `ImageGenerationRequest` interface; needs `secondaryReferenceImage` field

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TryOnLooksRequest Interface
- Open `apps/web/lib/services/fitting-model-service.ts`
- Add two new optional fields to `TryOnLooksRequest` interface:
  - `flatLayImageUrl?: string` - URL to the flat-lay image
  - `flatLayImageBase64?: string` - Base64-encoded flat-lay image as fallback

### 2. Update ImageGenerationRequest Type
- Open `apps/web/lib/types/image-types.ts`
- Add new optional field `secondaryReferenceImage?: string` to `ImageGenerationRequest` interface
- Add JSDoc comment explaining this is the flat-lay image for try-on generation

### 3. Update buildTryOnPrompt() Function
- Open `apps/web/lib/services/fitting-model-service.ts`
- Modify `buildTryOnPrompt()` to explicitly reference TWO images:
  - Update prompt to say: "Reference IMAGE 1 shows the person - match face and body EXACTLY. Reference IMAGE 2 shows the flat-lay of outfit items - the model must wear the EXACT same items with matching colors, patterns, styles, and design details. Do NOT modify, reinterpret, or change any aspect of the outfit."
- The prompt should be clear that IMAGE 1 is the fitting model and IMAGE 2 is the outfit reference

### 4. Create generateTryOnWithDualReference() Method
- Open `apps/web/lib/services/image-generation-service.ts`
- Add new method `generateTryOnWithDualReference()` to `OpenRouterImageClient` class
- Method signature: `async generateTryOnWithDualReference(prompt: string, fittingModelBase64: string, flatLayBase64: string): Promise<ImageGenerationResponse>`
- Build multimodal request with content array containing:
  1. `{ type: 'text', text: prompt }`
  2. `{ type: 'image_url', image_url: { url: fittingModelBase64 } }`
  3. `{ type: 'image_url', image_url: { url: flatLayBase64 } }`
- Use same timeout and retry logic as `makeFittingModelRequest()`

### 5. Update generateTryOnLooks() Function
- Open `apps/web/lib/services/fitting-model-service.ts`
- Modify `generateTryOnLooks()` to:
  - Accept flat-lay image from `TryOnLooksRequest` (use `flatLayImageUrl` or `flatLayImageBase64`)
  - Fetch flat-lay image and convert to base64 if URL provided
  - Pass `secondaryReferenceImage` in the API request body when flat-lay image is available
  - Update `generationType` to `'try-on-dual'` when using dual reference

### 6. Update API Route for Dual Reference
- Open `apps/web/app/api/generate-image/route.ts`
- Extract `secondaryReferenceImage` from request body
- Add validation for `secondaryReferenceImage` format (must be base64 data URL)
- Handle new generation type `'try-on-dual'`
- Call new `generateTryOnWithDualReference()` method when both reference images are provided

### 7. Update OutfitRecommendationCard Component
- Open `apps/web/components/chat/OutfitRecommendationCard.tsx`
- Update `handleTryOn()` to pass flat-lay image:
  - Use `outfit.flatLayImageUrl` or `outfit.flatLayImageBase64` from the outfit prop
  - Add these to the `generateTryOnLooks()` call
- Update `handleRegenerate()` with the same changes
- The flat-lay image should already be available in the `outfit` prop from the parent component

### 8. Validate Implementation
- Ensure TypeScript compiles without errors
- Test the try-on flow with an outfit that has a flat-lay image
- Verify the generated try-on image matches the flat-lay outfit

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm tsc --noEmit` - Verify TypeScript compiles without errors
- `cd apps/web && pnpm lint` - Ensure code passes linting
- `cd apps/web && pnpm build` - Verify production build succeeds

## Notes
- The OpenRouter Gemini model supports multiple images in the content array for multimodal generation
- The order of images matters: text first, then images in order (IMAGE 1, IMAGE 2)
- If flat-lay image is not available, the try-on should fall back to single-image behavior (current implementation)
- The API currently uses `generationType: 'try-on'` which routes to `generateFittingModelImage()` - we're adding a new type `'try-on-dual'` for dual reference
- Background removal is already applied to try-on images in the API route, so no changes needed there
