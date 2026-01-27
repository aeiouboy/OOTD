# Chore: Fix Similar Outfits Flat-Lay Image Fallback

## Metadata
adw_id: `263f7396`
prompt: `Fix Similar Outfits section to display flat-lay format images showing all outfit items instead of single product images. Currently in the OutfitDetail component's Similar Outfits section (components/outfit/SimilarOutfits.tsx), each similar outfit card shows only a single product image (e.g., just a dress). It should display a flat-lay style image showing ALL items in the outfit together, consistent with how the main outfit image appears at the top of the detail view. The discovery grid outfits don't have AI-generated flat-lay images, so implement a product thumbnail grid/collage fallback: 1) In SimilarOutfits.tsx, when an outfit doesn't have a flatLayImageUrl or flatLayImageBase64, create a visual grid showing thumbnails of all outfit.items (typically 3 items: dress, shoes, accessory) arranged in a collage layout instead of showing just outfit.imageUrl (which is a single product image). 2) The collage should show 2-4 product thumbnails in a clean grid layout (e.g., 2x2 or main item larger with smaller accessories). 3) Keep the existing flat-lay image display for outfits that DO have flatLayImageUrl. Check components/outfit/SimilarOutfits.tsx for the current implementation and components/outfit/OutfitCard.tsx for reference on how the main grid displays product thumbnail grids.`

## Chore Description
The Similar Outfits section in `SimilarOutfits.tsx` currently displays a single product image (e.g., just a dress) when an outfit doesn't have an AI-generated flat-lay image. This is inconsistent with the user experience since the main outfit at the top of the detail view shows all items together.

The root cause: The `getOutfitDisplayImage()` helper returns `outfit.imageUrl` as a fallback, which is a single product image. The `ProductThumbnailGrid` component already exists but is only used when ALL image sources (including `imageUrl`) are null.

**Current behavior:**
- If `flatLayImageUrl` exists → Shows flat-lay (correct)
- If `flatLayImageBase64` exists → Shows flat-lay (correct)
- If `imageUrl` exists → Shows single product image (incorrect - should show collage)
- If nothing exists → Shows `ProductThumbnailGrid` collage (correct, but rarely reached)

**Desired behavior:**
- If `flatLayImageUrl` OR `flatLayImageBase64` exists → Shows flat-lay image
- Otherwise → Shows `ProductThumbnailGrid` collage of all outfit items (2-4 thumbnails)

## Relevant Files
Use these files to complete the chore:

- **`apps/web/components/outfit/SimilarOutfits.tsx`** - Main file to modify. Contains the `SimilarOutfits` component, `getOutfitDisplayImage()` helper, and `ProductThumbnailGrid` component. The logic for determining when to show flat-lay vs thumbnail grid needs adjustment.

- **`apps/web/components/outfit/OutfitCard.tsx`** - Reference file. Shows how product items are displayed in a horizontal scroll within outfit cards. Can be used as reference for thumbnail styling and layout patterns.

- **`apps/web/lib/types.ts`** - Reference file. Contains the `Outfit` and `Product` type definitions. Confirms the available fields: `flatLayImageUrl`, `flatLayImageBase64`, `imageUrl`, and `items: Product[]`.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Display Logic in SimilarOutfits.tsx
- Modify the render logic in the `SimilarOutfits` component (around line 60-78)
- Change the condition from checking if `displayImage` exists to checking if the outfit has a flat-lay image specifically
- Use `ProductThumbnailGrid` as the fallback when no flat-lay image exists, regardless of whether `imageUrl` is available
- The `useFlatLay` variable (line 61) already correctly identifies flat-lay images - use this to determine display mode

**Specific changes:**
- Line 70-78: Change the condition from `{displayImage ? ... : <ProductThumbnailGrid />}` to `{useFlatLay ? ... : <ProductThumbnailGrid />}`
- When `useFlatLay` is true, display the flat-lay image (`flatLayImageUrl || flatLayImageBase64`)
- When `useFlatLay` is false, always display `ProductThumbnailGrid` regardless of `imageUrl`

### 2. Simplify the getOutfitDisplayImage Helper (Optional Cleanup)
- The `getOutfitDisplayImage()` helper function (lines 15-17) may no longer be needed if we switch to the `useFlatLay` approach
- Consider removing or renaming it to `getFlatLayImage()` to better reflect its purpose
- Alternative: Keep it but have it only return flat-lay images (`flatLayImageUrl || flatLayImageBase64 || null`)

### 3. Verify ProductThumbnailGrid Component Works Correctly
- Review the existing `ProductThumbnailGrid` component (lines 22-49)
- Ensure it handles edge cases:
  - Outfits with 1, 2, 3, or 4+ items
  - Items with missing `imageUrl`
  - Empty items array
- The current implementation already handles these cases but verify visually

### 4. Test the Changes
- Run the development server and navigate to the OutfitDetail view
- Verify that:
  - Similar outfits WITH flat-lay images display the flat-lay image correctly
  - Similar outfits WITHOUT flat-lay images display a 2x2 (or appropriate) grid of product thumbnails
  - The grid shows all items in the outfit (up to 4)
  - Clicking on a similar outfit still opens the detail view correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure TypeScript compiles without errors
- `cd apps/web && pnpm lint` - Ensure code passes linting rules
- `cd apps/web && pnpm dev` - Start dev server to visually verify:
  1. Navigate to an outfit detail view
  2. Scroll down to "Similar outfits" section
  3. Verify similar outfit cards show thumbnail grids (not single product images)
  4. If any similar outfit has a flat-lay image, verify it displays correctly

## Notes
- The `ProductThumbnailGrid` component already exists and handles the collage layout well with a responsive grid (1 column for 1 item, 2 columns for 2+ items)
- The change is minimal - essentially switching from `displayImage` to `useFlatLay` as the primary condition
- This change improves visual consistency across the app where outfit cards should represent complete outfits, not individual products
- The `imageUrl` field on an `Outfit` typically contains a single product image (often the first/main item) which was being used as a fallback but creates an inconsistent user experience
