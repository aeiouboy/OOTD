# Chore: Fix Try-On Model Size

## Metadata
adw_id: `1be1bc96`
prompt: `Fix try-on model size - model appears too small in the generated image (only ~50-60% of frame). Update buildDualReferenceTryOnPrompt() in apps/web/lib/services/fitting-model-service.ts to make composition instructions more emphatic. Changes needed: 1) Move COMPOSITION section to be immediately after the opening line (before MANDATORY TRANSFER CHECKLIST) so it's more prominent 2) Strengthen the language: change 'Model fills 85% of vertical frame height' to 'CRITICAL FRAMING: Model MUST fill 90-95% of the vertical frame. Head nearly touches top edge, feet nearly touch bottom edge. ZERO excessive whitespace above or below the model.' 3) Add to REJECT IF MISSING section: '❌ Model appears small with excessive whitespace (must fill 90%+ of frame)' 4) Add explicit instruction: 'CROP TIGHT: Frame the shot as a tight full-body crop with minimal margins (max 5% padding above head and below feet).' Keep all other sections unchanged including image order and transfer checklist.`

## Chore Description
The try-on model generation is producing images where the model appears too small, filling only 50-60% of the frame instead of the intended 85%+. This chore updates the `buildDualReferenceTryOnPrompt()` function to make the composition/framing instructions more emphatic and prominent in the prompt. The goal is to ensure the AI generates images where the model fills 90-95% of the vertical frame with minimal whitespace padding.

Key changes:
1. Move COMPOSITION section to immediately after the opening line (higher priority positioning)
2. Strengthen framing language from 85% to 90-95% with emphatic wording
3. Add explicit CROP TIGHT instruction with max 5% padding rule
4. Add rejection criteria for models that appear too small

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/services/fitting-model-service.ts** - Contains the `buildDualReferenceTryOnPrompt()` function (lines 246-297) that generates the dual-reference try-on prompt. This is the only file that needs modification.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Restructure Prompt with COMPOSITION at Top
- In the `buildDualReferenceTryOnPrompt()` function (line 246-297), reorder the prompt sections
- Move the COMPOSITION section to be the second section (immediately after the opening line, before MANDATORY TRANSFER CHECKLIST)
- This increases the prominence of composition instructions in the prompt

### 2. Strengthen COMPOSITION Section Language
- Replace the existing COMPOSITION section content with emphatic language:
  - Change `Model fills 85% of vertical frame height` to `CRITICAL FRAMING: Model MUST fill 90-95% of the vertical frame. Head nearly touches top edge, feet nearly touch bottom edge. ZERO excessive whitespace above or below the model.`
  - Add new instruction: `CROP TIGHT: Frame the shot as a tight full-body crop with minimal margins (max 5% padding above head and below feet).`
  - Keep existing pose instruction: `Standing pose, facing camera, feet together`
  - Update bullet point format to match new emphatic style

### 3. Update REJECT IF MISSING Section
- Add new rejection criterion after the existing items: `❌ Model appears small with excessive whitespace (must fill 90%+ of frame)`
- Keep existing rejection items unchanged:
  - `❌ Any clothing item from IMAGE 2`
  - `❌ Any accessories (bag, sunglasses, watch, earrings, jewelry) visible in IMAGE 2`
  - `❌ Person still wearing IMAGE 1's original outfit pieces`

### 4. Validate Changes
- Verify the prompt structure is correct with COMPOSITION as the second section
- Ensure all other sections (MANDATORY TRANSFER CHECKLIST, REALISM REQUIREMENTS, MANDATORY BACKGROUND, LIGHTING, OUTPUT SPECIFICATIONS) remain unchanged
- Confirm the items being transferred line at the end is preserved

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/OOTD/apps/web && pnpm build` - Ensure TypeScript compiles without errors
- `cd /Users/naruechon/OOTD/apps/web && pnpm lint` - Run linting to check code quality
- Manual review: Verify the `buildDualReferenceTryOnPrompt()` function has:
  1. COMPOSITION section immediately after opening line
  2. 90-95% frame fill language
  3. CROP TIGHT instruction with 5% padding rule
  4. New rejection criterion for small model with whitespace

## Notes
- The prompt changes are designed to make the composition instructions more emphatic by both repositioning and strengthening the language
- The 90-95% frame fill requirement is more strict than the previous 85% to ensure tighter framing
- The max 5% padding rule (above head and below feet) is explicit to prevent excessive whitespace
- All other sections (image order, transfer checklist, realism requirements, background, lighting, output specs) remain unchanged as requested
