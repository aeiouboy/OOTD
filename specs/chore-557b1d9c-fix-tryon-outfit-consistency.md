# Chore: Fix Try-On Outfit Consistency with Transfer-Focused Prompt

## Metadata
adw_id: `557b1d9c`
prompt: `Fix try-on outfit consistency using the complete_looks.md prompt template while keeping existing image order. Current setup: IMAGE 1 = fitting model (person), IMAGE 2 = flat-lay (outfit). Problem: outfit keeps changing on regeneration. Solution: Replace buildDualReferenceTryOnPrompt() in apps/web/lib/services/fitting-model-service.ts with adapted prompt from data/personas/prompt_gen/complete_looks.md. The new prompt must: 1) Say 'Apply ALL fashion items from IMAGE 2 onto the person in IMAGE 1' 2) Include MANDATORY TRANSFER CHECKLIST for every item (top, bottom/dress, footwear, accessories) 3) Include REALISM REQUIREMENTS (preserve face/skin/hair/body from IMAGE 1, match lighting, natural shadows) 4) Include REJECT IF MISSING criteria (any clothing item from IMAGE 2, any accessories, person still wearing original outfit) 5) Specify 100% of items from IMAGE 2 must be present 6) Remove old CRITICAL/pixel-by-pixel language and use the transfer-focused approach instead. Keep COMPOSITION section for model size (85% frame fill). Do NOT change image order in API calls.`

## Chore Description
The current `buildDualReferenceTryOnPrompt()` function in the fitting-model-service generates inconsistent outfit try-on images. The outfit keeps changing on regeneration because the prompt uses language like "pixel-by-pixel" and "CRITICAL" which may not provide clear enough instructions to the AI model.

This chore replaces the existing prompt with an adapted version of the `complete_looks.md` template that uses a transfer-focused approach with mandatory checklists. The key changes:

1. **Adapt image order**: The `complete_looks.md` template uses IMAGE 1 = outfit, IMAGE 2 = person, but the service uses IMAGE 1 = person (fitting model), IMAGE 2 = outfit (flat-lay). The adapted prompt must flip the image references to match the existing API call order.

2. **Use transfer checklist approach**: Replace vague "CRITICAL" language with explicit MANDATORY TRANSFER CHECKLIST that enumerates every clothing category.

3. **Add REJECT IF MISSING criteria**: Clearly state conditions that should cause rejection (missing items, wrong outfit visible).

4. **Preserve realism requirements**: Keep face/skin/hair/body preservation from IMAGE 1 (person), match lighting, natural shadows.

5. **Keep composition section**: Maintain the 85% vertical frame fill requirement for full-body shots.

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/services/fitting-model-service.ts** (lines 245-280) - Contains the `buildDualReferenceTryOnPrompt()` function that needs to be replaced. This is the main file to modify.
- **data/personas/prompt_gen/complete_looks.md** - Reference template with the transfer-focused prompt structure to adapt.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Understand the Image Order Mapping
- Current service uses: IMAGE 1 = fitting model (person), IMAGE 2 = flat-lay (outfit)
- complete_looks.md uses: IMAGE 1 = outfit, IMAGE 2 = person (reversed)
- When adapting the template, swap all IMAGE 1/IMAGE 2 references:
  - "Apply ALL fashion items from Image 1 onto the person in Image 2" → "Apply ALL fashion items from IMAGE 2 onto the person in IMAGE 1"
  - "Preserve person's face... from Image 2" → "Preserve person's face... from IMAGE 1"
  - "clothing item from Image 1" → "clothing item from IMAGE 2"

### 2. Replace buildDualReferenceTryOnPrompt Function
- Open `apps/web/lib/services/fitting-model-service.ts`
- Locate the `buildDualReferenceTryOnPrompt` function (lines 245-280)
- Replace the entire function body with the new prompt template:

The new prompt structure should be:
```
Apply ALL fashion items from IMAGE 2 onto the person in IMAGE 1, creating a photorealistic image where the person wears the complete styled outfit.

MANDATORY TRANSFER CHECKLIST - EVERY ITEM MUST APPEAR:
✓ Top/Upper garment
✓ Bottom/Lower garment or Dress
✓ Outerwear (if present in IMAGE 2)
✓ Footwear/Shoes (MANDATORY if in IMAGE 2)
✓ Accessories (bags, belts, jewelry, glasses if visible in IMAGE 2)

REALISM REQUIREMENTS:
- Preserve person's face, skin tone, hair, body proportions from IMAGE 1
- Generate natural shadows and highlights on ALL outfit pieces
- Ensure fabric draping responds to body position and gravity
- Match color accuracy from IMAGE 2 exactly
- Proper layering and depth

COMPOSITION:
- Full-body centered shot
- Model fills 85% of vertical frame height
- Minimal margins above head and below feet
- Standing pose, facing camera, feet together

MANDATORY BACKGROUND:
- Pure white infinity cove studio backdrop (RGB 255,255,255)
- Model floats in infinite white void - NO floor, NO ground, NO shadows on backdrop

LIGHTING:
- Bright front-facing softbox, high-key lighting
- Match IMAGE 1's studio lighting style
- Eliminate all shadows on backdrop

REJECT IF MISSING:
❌ Any clothing item from IMAGE 2
❌ Any accessories (bag, sunglasses, watch, earrings, jewelry) visible in IMAGE 2
❌ Person still wearing IMAGE 1's original outfit pieces

OUTPUT SPECIFICATIONS:
- Photo quality: High-resolution, professional photography standard
- Realism: Photorealistic
- Face preservation: 100% similarity to IMAGE 1
- Complete outfit: 100% of items from IMAGE 2 must be present

Items being transferred: {itemDescriptions}{outfitTitle}
```

### 3. Ensure Function Signature Remains Unchanged
- Keep the same function parameters: `items: Array<{ name: string; category: string; color?: string }>, outfitTitle?: string`
- Keep the same return type: `string`
- Maintain the item description generation logic for the "Items being transferred" line

### 4. Remove Old Language Patterns
- Remove all instances of:
  - "CRITICAL"
  - "pixel-by-pixel"
  - "EXACT" (excessive usage)
  - "REPLICATE EXACTLY"
- Replace with transfer-focused language from the checklist approach

### 5. Verify API Call Order is Unchanged
- Confirm in `generateTryOnLooks` function (lines 378-396) that:
  - `referenceImage: fittingModelBase64` (IMAGE 1 = person) is unchanged
  - `secondaryReferenceImage: flatLayBase64` (IMAGE 2 = outfit) is unchanged
- Do NOT modify the API call structure

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure TypeScript compiles without errors
- `cd apps/web && pnpm lint` - Ensure no linting errors
- Manually review the updated `buildDualReferenceTryOnPrompt` function to verify:
  - All IMAGE 1 references point to the person/fitting model
  - All IMAGE 2 references point to the outfit/flat-lay
  - MANDATORY TRANSFER CHECKLIST is present
  - REALISM REQUIREMENTS section is present
  - REJECT IF MISSING section is present
  - "100% of items from IMAGE 2" language is included
  - COMPOSITION section with 85% frame fill is preserved
  - No "CRITICAL", "pixel-by-pixel", or excessive "EXACT" language remains

## Notes
- The prompt length should remain under the API's character limits for image generation
- The function is used exclusively by `generateTryOnLooks()` when a flat-lay image is provided
- When no flat-lay is available, the fallback `buildTryOnPrompt()` function is used instead (not modified in this chore)
- The image order in API calls (person first, outfit second) is intentional and must not change
