# Chore: Add Fitting Model Try-On Looks Feature

## Metadata
adw_id: `28306648`
prompt: `Add fitting model try-on looks feature to outfit recommendation card. After showing flat-lay image, add a 'ลองใส่' (Try On) button that generates and shows the outfit WORN on the user's fitting model.`

## Chore Description
Add a "Try On" feature to the OutfitRecommendationCard that allows users to see recommended outfits worn on their personalized fitting model. Currently, the card displays a flat-lay image of outfit items laid out on a white background. This feature adds a 'ลองใส่' (Try On) button that:

1. Takes the user's fitting model image (generated during onboarding and stored in user profile)
2. Takes the recommended outfit items from the card
3. Generates a new AI image showing the user's model WEARING those specific outfit items
4. Displays the try-on image in a modal or expanded view

The implementation leverages the existing `fitting-model-service.ts` infrastructure and the `/api/generate-image` API endpoint with multimodal capabilities (reference image + text prompt).

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/services/fitting-model-service.ts** - Core service for fitting model generation. Currently has `generateFittingModel()` and `generateDefaultFittingModel()` functions. Needs new `generateTryOnLooks()` function.

- **apps/web/components/chat/OutfitRecommendationCard.tsx** - Main component displaying outfit recommendations. Needs 'ลองใส่' button, loading state, and try-on image display logic.

- **apps/web/lib/hooks/useUserProfile.ts** - Hook providing access to user profile including `fittingModelUrl` field. Used to get the user's fitting model for try-on generation.

- **apps/web/lib/types/user-profile-types.ts** - Type definitions for `UserProfile` including `fittingModelUrl?: string` field.

- **apps/web/lib/types.ts** - Contains `Outfit` interface that needs new fields for try-on image caching.

- **apps/web/lib/types/image-types.ts** - Type definitions for image generation. May need extension for try-on generation type.

- **apps/web/lib/services/image-generation-service.ts** - OpenRouter image client with `generateFittingModelImage()` method that accepts reference image. Used by the try-on service.

- **apps/web/app/api/generate-image/route.ts** - API route handling image generation. Already supports `fitting-model` generationType with reference images.

- **data/personas/prompt_gen/fitting_model.md** - Reference prompt template for face-matching and outfit generation.

### New Files
- None required - all functionality will be added to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Extend Type Definitions for Try-On
- Add `tryOnImageUrl?: string` and `tryOnImageBase64?: string` fields to the `Outfit` interface in `apps/web/lib/types.ts`
- Add `isGeneratingTryOn?: boolean` field to `Outfit` interface for loading state
- Add `'try-on'` to the `generationType` union in `apps/web/lib/types/image-types.ts`

### 2. Create generateTryOnLooks Function in fitting-model-service.ts
- Add new interface `TryOnLooksRequest` with fields:
  - `fittingModelImageUrl: string` - User's fitting model image URL from profile
  - `outfitItems: Array<{ name: string; category: string; color?: string }>` - Recommended items
  - `outfitTitle?: string` - Optional outfit name/title
- Create `TRY_ON_PROMPT_TEMPLATE` constant that:
  - References the user's fitting model image for face/body matching
  - Describes the specific outfit items to wear
  - Specifies pose, lighting, and background requirements (similar to fitting_model.md)
- Implement `generateTryOnLooks(request: TryOnLooksRequest): Promise<FittingModelResponse>` function that:
  - Validates input (fitting model URL and at least one outfit item)
  - Fetches the fitting model image if URL provided (convert to base64)
  - Builds the try-on prompt with outfit items
  - Calls `/api/generate-image` with `generationType: 'try-on'` and reference image
  - Returns success response with generated image URL/base64

### 3. Update API Route to Handle Try-On Generation
- Add `'try-on'` case handling in `apps/web/app/api/generate-image/route.ts`
- Use existing `generateFittingModelImage()` method from image-generation-service.ts
- Apply same background removal post-processing as fitting-model generation
- Validate that reference image (fitting model) is provided for try-on

### 4. Update OutfitRecommendationCard Component
- Import `useUserProfile` hook to access user's fitting model
- Add state for try-on: `isGeneratingTryOn`, `tryOnImageUrl`, `tryOnError`
- Add state for modal visibility: `showTryOnModal`
- Create `handleTryOn` async function that:
  - Checks if user has a fitting model (show error toast if not)
  - Sets loading state
  - Calls `generateTryOnLooks()` with fitting model and outfit items
  - Updates try-on image state on success
  - Opens modal to display result
- Add 'ลองใส่' button in the action icons row:
  - Position between 'ดูลุค' button and heart button
  - Use `Shirt` icon from lucide-react (or similar clothing icon)
  - Disable when no fitting model available
  - Show loading spinner when generating
- Create try-on result modal/dialog:
  - Display generated try-on image full-width
  - Show outfit title as header
  - Include close button and optional "ลองใส่ใหม่" (Regenerate) button
  - Handle loading state with skeleton
  - Handle error state with retry option

### 5. Add UI Components for Try-On Modal
- Create a simple modal/dialog for displaying try-on image
- Use existing shadcn/ui Dialog component if available
- Include responsive image display with proper sizing
- Add loading skeleton during generation
- Add error state with user-friendly message and retry button

### 6. Handle Edge Cases and Error States
- No fitting model available: Show tooltip explaining user needs to upload photo in onboarding
- Generation failure: Show error toast and retry button
- Rate limiting: Show appropriate message to wait
- Network errors: Show offline message with retry
- Cache previously generated try-on images in outfit state to avoid regeneration

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure TypeScript compiles without errors
- `cd apps/web && pnpm lint` - Check for linting issues
- `cd apps/web && pnpm dev` - Start dev server and manually test:
  1. Complete onboarding with photo upload to generate fitting model
  2. Navigate to chat and get outfit recommendations
  3. Click 'ลองใส่' button on an outfit card
  4. Verify loading skeleton appears
  5. Verify try-on image displays in modal
  6. Test without fitting model - verify appropriate error message
  7. Test retry functionality on error

## Notes
- The try-on feature depends on the user having completed onboarding with a photo upload. Users who selected "Mystery" mode will not have a fitting model and should see a helpful message.
- Image generation takes 10-30 seconds. The loading skeleton should clearly communicate that generation is in progress.
- Consider caching try-on images on the outfit object to avoid regeneration when reopening the modal.
- The prompt should emphasize maintaining the exact face/body from the fitting model while changing only the outfit.
- Background removal post-processing should be applied to maintain consistency with the original fitting model style.
