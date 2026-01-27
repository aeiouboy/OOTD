# Chore: Implement Fitting Model Generation for Onboarding Steps 5-6

## Metadata
adw_id: `f3686e59`
prompt: `Implement fitting model generation for onboarding steps 5-6. Step 5 (OnboardingPhoto): User uploads their photo via 'Upload' button or clicks 'Mystery' for default model. Step 6 (OnboardingComplete): Display AI-generated fitting model showing user in standard outfit.`

## Chore Description
Implement AI-powered fitting model generation for the onboarding flow steps 5-6. When users upload their photo in step 5 (OnboardingPhoto), the system should generate a personalized fitting model image showing them in a standard outfit (white crop top + black shorts + barefoot + white backdrop). Step 6 (OnboardingComplete) should display this AI-generated fitting model image instead of just the uploaded photo.

Key functionality:
1. **Photo Upload (Step 5)**: Already functional - accepts user photo or "Mystery" option for default model
2. **Fitting Model Generation**: New service to generate AI model image using the fitting_model.md prompt template
3. **Display Generated Model (Step 6)**: Show the AI-generated fitting model with loading state and fallback
4. **Profile Integration**: Store the generated fitting model URL in user profile for later use

## Relevant Files
Use these files to complete the chore:

- `apps/web/components/onboarding/OnboardingPhoto.tsx` - Step 5 component, already has photo upload functionality implemented. Will need to trigger fitting model generation after photo submission.
- `apps/web/components/onboarding/OnboardingComplete.tsx` - Step 6 component, needs to display the generated fitting model image with loading state.
- `apps/web/components/onboarding/OnboardingFlow.tsx` - Orchestrates the onboarding flow, handles state passing between steps. Will need to manage fitting model generation state.
- `apps/web/lib/hooks/useUserProfile.ts` - User profile hook with localStorage persistence. Needs new field for fitting model URL.
- `apps/web/lib/types/user-profile-types.ts` - Type definitions for user profile. Needs new `fittingModelUrl` field.
- `apps/web/app/api/generate-image/route.ts` - Existing image generation API route, can be reused or extended for fitting model generation.
- `apps/web/lib/services/image-generation-service.ts` - OpenRouter image client, understand how to integrate with new service.
- `data/personas/prompt_gen/fitting_model.md` - Prompt template for generating fitting model images with face matching requirements.
- `apps/web/lib/types/image-types.ts` - Type definitions for image generation.

### New Files
- `apps/web/lib/services/fitting-model-service.ts` - New service to handle fitting model generation with the specialized prompt template.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update User Profile Types
- Add `fittingModelUrl?: string` field to `UserProfile` interface in `apps/web/lib/types/user-profile-types.ts`
- This field will store the URL to the generated fitting model image for later use in chat/recommendations

### 2. Update useUserProfile Hook
- Update the `updateProfile` function in `apps/web/lib/hooks/useUserProfile.ts` to handle the new `fittingModelUrl` field
- Ensure the field is properly merged and persisted to localStorage

### 3. Create Fitting Model Service
- Create new file `apps/web/lib/services/fitting-model-service.ts`
- Read and incorporate the prompt template from `data/personas/prompt_gen/fitting_model.md`
- Create `generateFittingModel(userPhotoBase64: string)` function that:
  - Builds the specialized fitting model prompt with the user's photo as reference
  - Calls the image generation API endpoint `/api/generate-image`
  - Returns the generated fitting model image URL or base64
- Create `generateDefaultFittingModel()` function for "Mystery" option that generates a generic fitting model without a specific face reference
- Handle errors gracefully and return appropriate error messages

### 4. Create Fitting Model API Endpoint (Optional Enhancement)
- Consider creating a dedicated endpoint `apps/web/app/api/generate-fitting-model/route.ts` if the existing image generation endpoint needs different handling
- Alternatively, extend the existing endpoint to accept a `type: 'fitting-model'` parameter
- Decision: Use the existing `/api/generate-image` endpoint with the fitting model prompt - no new endpoint needed

### 5. Update OnboardingFlow Component
- Add state for fitting model generation: `fittingModelUrl`, `isFittingModelLoading`, `fittingModelError`
- Update `handlePhotoSubmit` to:
  - Store the user photo as before
  - Trigger fitting model generation asynchronously
  - Update `fittingModelUrl` state when generation completes
- Pass fitting model props to `OnboardingComplete` component
- Consider starting generation when moving to step 6 to reduce wait time visible to user

### 6. Update OnboardingComplete Component
- Add new props: `fittingModelUrl?: string`, `isFittingModelLoading?: boolean`, `fittingModelError?: string`
- Replace the circular user photo display with a larger fitting model display area
- Show loading skeleton/spinner while `isFittingModelLoading` is true
- Display the generated fitting model image when available
- Show fallback to user photo or mystery avatar if generation fails
- Add "Retry" button if generation fails
- Update the profile summary section to maintain the personalized greeting

### 7. Add Loading and Error States
- Create loading skeleton for fitting model image in OnboardingComplete
- Add error message display with retry option
- Ensure smooth UX during the generation process (can take several seconds)

### 8. Persist Fitting Model to Profile
- After successful generation, call `updateProfile({ fittingModelUrl })` to persist the URL
- This allows the fitting model to be used later in chat/recommendations
- Handle the case where user navigates away before generation completes

### 9. Handle Mystery Option
- When user clicks "Mystery" in OnboardingPhoto (no photo uploaded):
  - Generate a default fitting model with a generic/anonymous face
  - Or use a pre-generated placeholder image
  - Store this as the fitting model for the user
- Decision: Generate a fitting model with randomized face characteristics for mystery option

### 10. Validate Implementation
- Test the complete flow from photo upload to fitting model display
- Test the "Mystery" option flow
- Verify fitting model is persisted to profile
- Test error handling and retry functionality
- Verify loading states display correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm lint` - Verify no linting errors in modified files
- `cd apps/web && pnpm build` - Verify the build succeeds with no TypeScript errors
- `cd apps/web && pnpm dev` - Run development server and manually test onboarding flow:
  1. Navigate to onboarding
  2. Complete steps 1-4
  3. In step 5, upload a photo and click Continue
  4. Verify step 6 shows loading state then fitting model
  5. Repeat with "Mystery" option
  6. Check localStorage for persisted fittingModelUrl
- `cd apps/web && pnpm test` - Run any existing tests to ensure no regressions

## Notes

### Image Generation Considerations
- The OpenRouter API with Gemini 2.5 Flash Image model is used for generation
- Generation can take 10-30 seconds depending on load
- The fitting_model.md prompt requires exact face matching which may be challenging for AI models
- Consider caching generated fitting models to avoid regeneration on page refresh

### UX Considerations
- The loading state in step 6 should be engaging to keep users interested
- Consider adding progress messages during generation
- The generated image should be high quality (8K as per prompt template) but may need compression for web display
- Mobile responsiveness should be maintained

### API Rate Limiting
- The existing rate limiting (10 requests/minute) applies
- Users won't typically regenerate fitting models frequently
- Consider increasing timeout for fitting model generation (current: 30s)

### Fallback Strategy
1. Primary: Show AI-generated fitting model
2. Fallback 1: Show original uploaded photo
3. Fallback 2: Show mystery avatar placeholder
