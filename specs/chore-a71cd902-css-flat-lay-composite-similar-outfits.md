# Chore: CSS-Based Flat-Lay Composite for Similar Outfits

## Metadata
adw_id: `a71cd902`
prompt: `Fix Similar Outfits section to display flat-lay style composite images instead of 2x2 product thumbnail grids. Currently in SimilarOutfits.tsx (components/outfit/SimilarOutfits.tsx), when an outfit doesn't have a flatLayImageUrl or flatLayImageBase64, the ProductThumbnailGrid component displays a 2x2 grid of separate individual product thumbnails. The user wants similar outfits to display a FLAT-LAY COMPOSITE image showing ALL items artfully arranged together on a white background - like how the main outfit image appears (e.g., dress in center with shoes and belt positioned around it aesthetically). Two solution options to consider: OPTION A (Recommended - CSS-based): Replace ProductThumbnailGrid with a new FlatLayComposite component that uses CSS to position product images in an aesthetically pleasing flat-lay arrangement WITHOUT API calls. Position main item (dress/top) large in center-left, shoes positioned at top-left or bottom-left with slight rotation, accessory (belt/bag) positioned at bottom-right. Use transforms for rotation (-10deg to 15deg), absolute positioning, and overlapping to create an artistic composition on white background. This is instant and costs nothing. OPTION B (API-based): Call the existing generateFlatLayImage() API method from image-generation-service.ts when rendering similar outfits that lack flat-lay images. This generates real AI flat-lay images but has API cost and latency. Implement OPTION A as the primary solution.`

## Chore Description
Replace the existing `ProductThumbnailGrid` component in SimilarOutfits.tsx with a new `FlatLayComposite` component that creates a CSS-based flat-lay aesthetic composition of outfit items. Instead of showing a 2x2 grid of product thumbnails, this component will arrange product images in an artistic flat-lay style layout using CSS transforms (rotation), absolute positioning, and overlapping - similar to professional flat-lay photography. The main garment will be displayed prominently in the center, with shoes and accessories positioned elegantly around it at various angles.

## Relevant Files
Use these files to complete the chore:

- **`apps/web/components/outfit/SimilarOutfits.tsx`** (lines 14-41, 69): Contains the current `ProductThumbnailGrid` component to be replaced and the line where the new component will be used
- **`apps/web/lib/types.ts`** (lines 30-49, 55-70): Defines `Outfit` interface with `items: Product[]` and `Product` interface with `category`, `subCategory`, `imageUrl` properties needed to determine item types
- **`apps/web/lib/services/image-generation-service.ts`** (reference only): Shows existing flat-lay generation API approach (Option B - not implementing this)

### New Files
- **`apps/web/components/outfit/FlatLayComposite.tsx`**: New component to create CSS-based flat-lay composition

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create FlatLayComposite Component File
- Create new file `apps/web/components/outfit/FlatLayComposite.tsx`
- Add 'use client' directive at top
- Import `Product` type from `@/lib/types`
- Define `FlatLayCompositeProps` interface accepting `items: Product[]` array

### 2. Implement Item Categorization Logic
- Create helper function `categorizeItems(items: Product[])` that returns:
  - `mainItem`: The primary garment (dress, top, blouse, pants, skirt) - determined by `category` or `subCategory`
  - `shoes`: Footwear items (shoes, heels, sneakers, sandals)
  - `accessories`: Other items (belt, bag, jewelry, scarf, etc.)
- Use case-insensitive string matching on `category` and `subCategory` fields
- Handle edge cases where items may not have clear categories

### 3. Implement CSS Positioning Strategy
- Create container with `relative` positioning and white background
- Position main item (largest, ~65-75% width) in center-left area
- Position shoes (smaller, ~30-40% width) at top-left or bottom-left with -10deg to 15deg rotation
- Position accessories (smallest, ~25-35% width) at bottom-right with slight rotation
- Use `absolute` positioning with percentage-based `top`, `left`, `right`, `bottom` values
- Apply `transform: rotate(Xdeg)` for artistic angles
- Use `z-index` to create layered overlapping effect
- Apply `object-fit: contain` on images to preserve aspect ratios

### 4. Add Fallback Handling
- Handle case where no items exist (show "No items" placeholder)
- Handle case where main item is not found (use first item as main)
- Handle case where item has no `imageUrl` (show placeholder or skip)

### 5. Style the Component
- Use Tailwind CSS classes for styling
- Apply subtle shadow to images (`drop-shadow-md`) for depth
- Ensure white background (`bg-white`)
- Make component fill 100% width and height of parent
- Apply smooth hover states if desired

### 6. Update SimilarOutfits.tsx to Use New Component
- Import `FlatLayComposite` from `./FlatLayComposite`
- Replace `<ProductThumbnailGrid outfit={outfit} />` on line 69 with `<FlatLayComposite items={outfit.items} />`
- Keep the `ProductThumbnailGrid` component in the file for now (may be useful elsewhere) or remove it if no longer needed

### 7. Validate Visual Output
- Test with various outfit compositions:
  - 3-item outfit (dress + shoes + belt)
  - 2-item outfit (top + pants)
  - 4+ item outfit (multiple accessories)
  - Single item outfit
- Verify items are positioned aesthetically
- Verify rotation transforms look natural
- Verify no items overlap awkwardly or are cut off

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure the TypeScript compiles without errors
- `cd apps/web && pnpm lint` - Run linting to check for code quality issues
- `cd apps/web && pnpm dev` - Start dev server and manually verify SimilarOutfits displays flat-lay style composites

## Notes

- The CSS-based approach (Option A) is chosen for:
  - Zero API cost
  - Instant rendering (no loading states needed)
  - No network latency
  - Works offline
  - Consistent results

- The composition should mimic professional flat-lay photography aesthetics where items are artfully arranged on a clean surface rather than shown in a rigid grid

- Item type detection relies on `category` and `subCategory` fields from the `Product` interface. The categorization function should be flexible enough to handle various naming conventions (e.g., "Shoes", "shoes", "SHOES", "Footwear", "Heels")

- The z-index layering should place the main garment at a lower z-index than accessories so smaller items appear "on top" of the composition

- Consider using CSS `filter: drop-shadow()` instead of `box-shadow` since product images often have transparent or irregular backgrounds
