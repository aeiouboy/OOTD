# Chore: Fix OutfitCarouselCard to Display Flat-Lay Images

## Metadata
adw_id: `12858b29`
prompt: `Fix OutfitCarouselCard.tsx to display flat-lay images instead of mannequin-style product thumbnails`

## Chore Description
The OutfitCarouselCard component in the outfit discovery grid currently displays mannequin-style product images directly from `outfit.imageUrl` (lines 47-54). This is inconsistent with the application's design specification that requires flat-lay format images for all outfit displays per `data/personas/prompt_gen/looks.md`.

This chore implements the same three-tier image fallback pattern successfully used in OutfitRecommendationCard.tsx:
1. **Priority 1**: AI-generated flat-lay image (`flatLayImageUrl` or `flatLayImageBase64`)
2. **Priority 2**: CSS-based FlatLayComposite component using outfit items
3. **Priority 3**: Fallback placeholder (never show raw mannequin imageUrl)

The fix ensures visual consistency across the entire application - both the chat panel (OutfitRecommendationCard) and the discovery grid (OutfitCarouselCard) will display the same flat-lay aesthetic.

## Relevant Files
Use these files to complete the chore:

- **apps/web/components/outfit/OutfitCarouselCard.tsx** - The component to be modified. Currently uses `outfit.imageUrl` directly which shows mannequin images.

- **apps/web/components/outfit/FlatLayComposite.tsx** - The CSS-based fallback component to import. Creates artistic flat-lay compositions from outfit items using absolute positioning and transforms.

- **apps/web/components/chat/OutfitRecommendationCard.tsx** - Reference implementation showing the correct three-tier image display pattern (lines 56-60 for logic, lines 180-214 for JSX).

- **apps/web/lib/types.ts** - Outfit type definition showing available image properties: `flatLayImageUrl`, `flatLayImageBase64`, `isGeneratingFlatLay`, `imageUrl`.

- **data/personas/prompt_gen/looks.md** - Design specification requiring "accurate flat-lay image with each item individually placed and separated, styled in an elegant composition on a white background."

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Import FlatLayComposite Component
- Open `apps/web/components/outfit/OutfitCarouselCard.tsx`
- Add import statement at line 4 (after the existing imports): `import { FlatLayComposite } from '@/components/outfit/FlatLayComposite'`

### 2. Add Image Source Logic Variables
- After the existing `imageError` state declaration (line 32), add the flat-lay detection logic:
  ```typescript
  // Determine image source: prefer AI flat-lay, then use FlatLayComposite
  // Never fall back to mannequin-style product thumbnail for the main card image
  const hasFlatLayImage = !!(outfit.flatLayImageUrl || outfit.flatLayImageBase64)
  const flatLayImage = outfit.flatLayImageUrl || outfit.flatLayImageBase64
  const isGenerating = outfit.isGeneratingFlatLay
  ```

### 3. Replace Image Display JSX
- Replace the entire image display block (lines 46-59) with the three-tier fallback pattern:
  - Show loading skeleton when `isGenerating` is true
  - Show AI flat-lay image when `hasFlatLayImage && flatLayImage && !imageError`
  - Show FlatLayComposite when `outfit.items && outfit.items.length > 0`
  - Show emoji placeholder as final fallback
- Match the structure used in OutfitRecommendationCard.tsx (lines 181-214)
- Adjust container sizing: keep `h-[220px]` height but use `w-full` for the flat-lay display

### 4. Update Image Container Styling
- Ensure the image container uses appropriate classes for flat-lay display:
  - Add `bg-gray-100` or `bg-white` background for consistent appearance
  - Keep `rounded-t-2xl` for card styling consistency
  - Use `object-contain` instead of `object-cover` for AI-generated flat-lay images

### 5. Validate TypeScript Compilation
- Run TypeScript type checking to ensure no errors
- Verify the FlatLayComposite import resolves correctly
- Confirm the Outfit type includes all referenced properties

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm exec tsc --noEmit` - Verify TypeScript compilation succeeds with no errors
- `cd apps/web && pnpm lint` - Run ESLint to check for code quality issues
- `cd apps/web && pnpm build` - Full production build to catch any bundling issues

## Notes
- The OutfitCarouselCard is used in OutfitDiscovery.tsx for the carousel grid display
- The card dimensions (160px width, 220px image height) should be maintained
- The loading skeleton animation should match the existing brand design system
- This change complements the earlier OutfitRecommendationCard fix (spec chore-74e07357)
- Both components will now share the same FlatLayComposite fallback ensuring visual consistency
