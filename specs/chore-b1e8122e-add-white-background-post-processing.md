# Chore: Add White Background Post-Processing to Fitting Model Generation

## Metadata
adw_id: `b1e8122e`
prompt: `Add post-processing to fitting model generation that automatically replaces the background with pure white (#FFFFFF). After the AI generates the fitting model image in fitting-model-service.ts, add a post-processing step using the sharp library (server-side) or canvas API (client-side) to: 1) Load the base64 image, 2) Detect background pixels (typically light gray tones in corners/edges), 3) Replace background with pure white RGB(255,255,255) using flood fill or color threshold replacement, 4) Return the processed image with clean white background. Install sharp as a dependency if needed. The goal is to ensure 100% consistent pure white backgrounds regardless of what the AI model generates. Current issue: AI generates inconsistent gray/off-white backgrounds instead of pure white as specified in prompts.`

## Chore Description

The current fitting model generation service produces AI-generated images with inconsistent backgrounds - the AI often generates light gray or off-white backgrounds instead of pure white (#FFFFFF/RGB(255,255,255)) despite explicit prompts requesting pure white infinity cove backgrounds.

This chore implements a server-side post-processing solution using the `sharp` library to automatically detect and replace background pixels with pure white, ensuring 100% consistent white backgrounds regardless of what the AI model generates.

## Relevant Files

### Existing Files

- **apps/web/app/api/generate-image/route.ts** - API route handler that receives image generation requests and saves base64 images to disk. This is where we'll add the post-processing step after the image is generated but before it's saved.

- **apps/web/lib/services/fitting-model-service.ts** - Client-side service that calls the image generation API. This file already has the proper flow and doesn't need changes, but we need to understand the data flow.

- **apps/web/package.json** - Package dependencies file where we need to add the `sharp` library as a dependency.

### New Files

- **apps/web/lib/utils/image-processing.ts** - New utility module containing the background replacement logic. This will provide a clean, reusable function that can be called from the API route.

## Step by Step Tasks

### 1. Install sharp Library Dependency
- Add `sharp` package to dependencies in `apps/web/package.json`
- Run `pnpm install` to install the new dependency
- Verify sharp supports server-side Node.js execution (it does - it's a native Node.js image processing library)

### 2. Create Image Processing Utility Module
- Create new file `apps/web/lib/utils/image-processing.ts`
- Implement `replaceBackgroundWithWhite()` function that:
  - Accepts a base64 image string (with or without data URL prefix)
  - Decodes base64 to buffer
  - Uses sharp to load the image
  - Implements background detection and replacement algorithm:
    - Sample pixels from corners and edges (top-left, top-right, bottom-left, bottom-right, top/bottom/left/right edges)
    - Calculate average color of these edge pixels (assumed to be background)
    - Use color threshold to find similar pixels throughout the image
    - Replace all background pixels with pure white RGB(255, 255, 255)
  - Returns the processed image as a base64 string
  - Includes proper error handling and logging
- Add TypeScript type definitions for function parameters and return values
- Include JSDoc documentation explaining the algorithm

### 3. Integrate Post-Processing into API Route
- Modify `apps/web/app/api/generate-image/route.ts`
- Import the `replaceBackgroundWithWhite` utility function
- Add post-processing step in the POST handler after successful image generation:
  - After `result.success` is confirmed (around line 303)
  - Before `saveBase64Image()` is called
  - Only apply to fitting-model generation type (check `generationType === 'fitting-model'`)
  - Wrap in try-catch to gracefully handle post-processing failures
- Log processing steps for debugging
- Update comments to document the post-processing step

### 4. Add Error Handling and Logging
- Add try-catch wrapper around post-processing step
- Log when post-processing starts, succeeds, or fails
- If post-processing fails, fall back to original image (don't fail the entire request)
- Include performance logging to track processing time
- Add specific error messages for different failure modes

### 5. Test the Implementation
- Generate test fitting model images using both user photos and mystery mode
- Verify backgrounds are pure white (#FFFFFF) using image analysis tools
- Test edge cases:
  - Images with complex backgrounds
  - Images where background is already white
  - Images with white clothing (ensure model isn't affected)
  - Very light or very dark backgrounds
- Verify performance impact is acceptable (sharp is fast, should be <500ms)
- Test error handling by simulating failures

### 6. Validate Code Quality
- Run TypeScript compiler to check for type errors: `cd apps/web && pnpm build`
- Run linter to ensure code style compliance: `cd apps/web && pnpm lint`
- Verify no console errors or warnings during generation
- Review logs to ensure proper execution flow

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm install` - Verify sharp installs correctly
- `cd apps/web && pnpm build` - Ensure TypeScript compiles without errors
- `cd apps/web && pnpm lint` - Verify code passes linting
- `cd apps/web && pnpm dev` - Start development server
- Manual test: Generate a fitting model image and verify background is pure white #FFFFFF using browser DevTools or image editor

## Notes

### Algorithm Strategy

The background replacement algorithm will use a sampling approach:

1. **Sample edge pixels**: Take pixels from corners and edges (assume background is at edges)
2. **Calculate threshold**: Determine the average color and create a tolerance range
3. **Detect similar pixels**: Find all pixels within the color threshold
4. **Replace with white**: Convert matching pixels to RGB(255, 255, 255)

### Sharp Library Advantages

- Native performance (C++ bindings)
- Server-side execution (works in Next.js API routes)
- Rich API for pixel manipulation
- Well-maintained and production-ready
- Already used in many Next.js applications

### Alternative Considered

We could use canvas API client-side, but server-side processing with sharp is preferred because:
- More reliable (no browser compatibility issues)
- Better performance (native code)
- Processes once on server instead of every client
- Can save processed image to disk directly

### Performance Considerations

- Sharp is very fast (typically <100ms for background replacement)
- Only applies to fitting-model generation (not regular outfit generation)
- Falls back gracefully if post-processing fails
- Processing happens before saving to disk, so no duplicate I/O

### Future Enhancements

If this chore is successful, we could:
- Add configurable color thresholds
- Support different background colors (not just white)
- Add alpha channel transparency instead of white
- Create a standalone image processing API endpoint
