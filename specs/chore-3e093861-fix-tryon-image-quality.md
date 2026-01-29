# Chore: Fix Try-On Image Quality

## Metadata
adw_id: `3e093861`
prompt: `Fix try-on image quality: 1) Model appears too small - update the prompt to specify 'full-body shot that fills 80-90% of the frame vertically, model centered' 2) Outfit still inconsistent across regenerations - the current dual-reference prompt is not strong enough. Update buildDualReferenceTryOnPrompt() in fitting-model-service.ts to use much stronger language: 'CRITICAL: You MUST copy the EXACT outfit from IMAGE 2 pixel-by-pixel. Match the EXACT sleeve style, EXACT neckline cut, EXACT pattern placement, EXACT hem length. DO NOT interpret or reimagine - REPLICATE EXACTLY. If IMAGE 2 shows puffy sleeves, generate puffy sleeves. If IMAGE 2 shows V-neck, generate V-neck. The outfit must be IDENTICAL to IMAGE 2.' Also add 'COMPOSITION: Full-body centered shot, model fills 85% of vertical frame height, minimal margins above head and below feet.'`

## Chore Description
The try-on image generation feature has two quality issues that need to be fixed:

1. **Model appears too small in the frame**: The generated images don't fill the frame properly, with excessive whitespace above and below the model. The composition needs to be updated to specify that the model should fill 80-90% of the vertical frame height.

2. **Outfit inconsistency across regenerations**: When regenerating try-on images with the same flat-lay reference, the outfit details vary significantly between generations. The dual-reference prompt needs much stronger, more directive language to force exact pixel-by-pixel replication of the outfit from the flat-lay image (IMAGE 2).

The fix involves updating the `buildDualReferenceTryOnPrompt()` function in `apps/web/lib/services/fitting-model-service.ts` to include:
- Stronger outfit matching language with CRITICAL emphasis
- Explicit pixel-by-pixel copying instructions
- Specific examples of what must match exactly (sleeve style, neckline, pattern placement, hem length)
- Clear composition requirements for frame filling

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/services/fitting-model-service.ts** (lines 240-272)
  - Contains the `buildDualReferenceTryOnPrompt()` function that needs to be updated
  - This function builds the prompt for dual-reference try-on generation (fitting model + flat-lay)
  - Currently has weak language like "Copy every detail" which needs to be strengthened
  - Line 261: Current outfit instruction that needs stronger emphasis
  - Line 264: Current pose instruction where composition needs to be added

- **apps/web/lib/services/image-generation-service.ts** (lines 410-589)
  - Contains the `generateTryOnWithDualReference()` method that uses the prompt
  - This validates our prompt is being passed correctly to the API
  - Line 468: Calls `makeDualReferenceRequest()` which sends the prompt to OpenRouter
  - No changes needed here, but useful for understanding the flow

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update buildDualReferenceTryOnPrompt() with stronger outfit matching language
- Open `apps/web/lib/services/fitting-model-service.ts`
- Locate the `buildDualReferenceTryOnPrompt()` function (lines 240-272)
- Replace the OUTFIT section (currently at line 261) with the new CRITICAL language:
  ```
  OUTFIT: CRITICAL - You MUST copy the EXACT outfit from IMAGE 2 pixel-by-pixel. Match the EXACT sleeve style, EXACT neckline cut, EXACT pattern placement, EXACT hem length, EXACT fabric texture, EXACT garment silhouette.
  DO NOT interpret, reimagine, or modify ANY aspect of the outfit. REPLICATE EXACTLY.
  - If IMAGE 2 shows puffy sleeves, generate puffy sleeves
  - If IMAGE 2 shows V-neck, generate V-neck
  - If IMAGE 2 shows a specific pattern placement, replicate that exact placement
  - If IMAGE 2 shows a specific hem length, match that exact length
  The outfit must be IDENTICAL to IMAGE 2 in every detail.
  Items to match: ${itemDescriptions}${outfitTitle ? ` (${outfitTitle})` : ''}
  ```
- Remove the old "Do NOT modify, reinterpret, or change any aspect of the outfit" line since it's now integrated above

### 2. Add composition requirements for proper frame filling
- In the same `buildDualReferenceTryOnPrompt()` function
- After the OUTFIT section and before the POSE section, add a new COMPOSITION section:
  ```
  COMPOSITION: Full-body centered shot, model fills 85% of vertical frame height, minimal margins above head and below feet. The model should occupy most of the frame vertically while maintaining proper proportions.
  ```
- Keep the existing POSE, BACKGROUND, LIGHTING, and OUTPUT sections unchanged

### 3. Verify the updated prompt structure
- Review the complete updated prompt to ensure:
  - The CRITICAL outfit matching language is clear and directive
  - The composition requirements specify 85% vertical frame fill
  - All existing sections (FACE, BODY, POSE, BACKGROUND, LIGHTING, OUTPUT) remain intact
  - The prompt flows logically: REFERENCE IMAGES → FACE → BODY → OUTFIT → COMPOSITION → POSE → BACKGROUND → LIGHTING → OUTPUT
- Ensure the function still returns a properly formatted string with `.trim()`

### 4. Test the prompt length
- Verify the updated prompt doesn't exceed the 3000 character limit enforced in the API route
- The prompt should be under 3000 chars since it's for try-on-dual generation type (as validated in apps/web/app/api/generate-image/route.ts line 293)
- If needed, condense language while maintaining directive strength

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm run lint` - Verify TypeScript compilation and linting passes
- `cd apps/web && pnpm run build` - Ensure the build succeeds with no errors
- Manual verification: Check the `buildDualReferenceTryOnPrompt()` function includes:
  - "CRITICAL" emphasis in the OUTFIT section
  - "pixel-by-pixel" exact copying language
  - Specific examples (puffy sleeves, V-neck, pattern placement, hem length)
  - "COMPOSITION" section with "85% of vertical frame height"
  - All original sections preserved (FACE, BODY, POSE, BACKGROUND, LIGHTING, OUTPUT)

## Notes
- The dual-reference try-on generation uses IMAGE 1 (fitting model) for face/body matching and IMAGE 2 (flat-lay) for outfit matching
- This fix only affects the `buildDualReferenceTryOnPrompt()` function, not the single-reference `buildTryOnPrompt()` function
- The stronger language is necessary because AI image generation models tend to "interpret" rather than "replicate" without explicit pixel-by-pixel instructions
- The composition change addresses user feedback that models appear too small in the generated images
- The 85% vertical frame fill is a sweet spot that provides proper model sizing while maintaining some margin for visual balance
