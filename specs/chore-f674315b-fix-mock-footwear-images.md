# Chore: Fix Mock Product Data Women Footwear Images

## Metadata
adw_id: `f674315b`
prompt: `Fix mock product data to use correct women footwear images. The mock data in apps/web/lib/mock-data.ts has three footwear products all using the same masculine oxford shoe image (/black-leather-oxford-shoes.jpg): CG003 "Leather Oxford Shoes", SH001 "Formal Heels", and SH002 "Classic Pumps". Remove masculine CG003, update SH001 and SH002 with proper women's footwear images and visual descriptions.`

## Chore Description
The mock product catalog in `apps/web/lib/mock-data.ts` contains three footwear products that incorrectly use the same masculine oxford shoe image (`/black-leather-oxford-shoes.jpg`):

1. **CG003** (lines 41-52): "Leather Oxford Shoes" - A masculine-style product that should be removed from the women's catalog entirely
2. **SH001** (lines 203-214): "Formal Heels" - Product name describes heels but displays masculine oxford image
3. **SH002** (lines 216-227): "Classic Pumps" - Product name describes pumps but displays masculine oxford image

This causes visual inconsistency where feminine product names display with masculine footwear images. The product catalog is intended for women's fashion recommendations (per onboarding department selection), so masculine products should not appear.

Additionally, `mockOutfits[0]` ("Professional Business Look") references `mockProducts[2]` which is the masculine CG003 product. This outfit must be updated to use appropriate women's footwear instead.

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/mock-data.ts** - Main file containing mock product data and outfit definitions. Contains the problematic footwear products and outfit references that need updating.
- **apps/web/lib/types.ts** - Defines the Product interface including `visualDescription` field for AI image generation prompts.

### New Files
- **apps/web/public/formal-heels.png** - Placeholder image for women's formal heels (will use placeholder.svg reference until real asset is provided)
- **apps/web/public/classic-pumps.png** - Placeholder image for women's classic pumps (will use placeholder.svg reference until real asset is provided)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove CG003 Masculine Oxford Shoes Product
- Delete the entire CG003 product object from `mockProducts` array (lines 40-52)
- This removes the masculine "Leather Oxford Shoes" from the women's catalog
- Note: This shifts array indices for all subsequent products

### 2. Update SH001 Formal Heels Product
- Change `imageUrl` from `/black-leather-oxford-shoes.jpg` to `/placeholder.svg?height=400&width=400&text=Formal+Heels`
- Add `visualDescription` field: `"Elegant black stiletto heels with pointed toe, formal women's footwear, 3-inch heel"`
- Add `subCategory` field: `"Heels"`
- Add `occasion` field: `["work", "formal"]`

### 3. Update SH002 Classic Pumps Product
- Change `imageUrl` from `/black-leather-oxford-shoes.jpg` to `/placeholder.svg?height=400&width=400&text=Classic+Pumps`
- Add `visualDescription` field: `"Classic nude pumps with rounded toe, versatile women's footwear, 2.5-inch heel"`
- Add `subCategory` field: `"Pumps"`
- Add `occasion` field: `["work", "formal", "casual"]`

### 4. Update mockOutfits Array References
- After removing CG003, the array indices shift:
  - Old `mockProducts[0]` (CG001) remains `mockProducts[0]`
  - Old `mockProducts[1]` (CG002) remains `mockProducts[1]`
  - Old `mockProducts[2]` (CG003 - REMOVED)
  - Old `mockProducts[3]` (CG004) becomes `mockProducts[2]`
  - And so on...
- Update `mockOutfits[0]` ("Professional Business Look"):
  - Current: `items: [mockProducts[0], mockProducts[1], mockProducts[2]]`
  - Change footwear reference from `mockProducts[2]` (old CG003) to appropriate women's footwear
  - Find SH001 index after removal and use it: `mockProducts.find(p => p.sku === "SH001")`
- Review all other outfit references that use numeric indices to ensure they still point to correct products
- Update `mockOutfits[1]` ("Casual Weekend Style"): `items: [mockProducts[3], mockProducts[6]]` becomes `items: [mockProducts[2], mockProducts[5]]`
- Update `mockOutfits[3]` ("Smart Casual Office"): `items: [mockProducts[5], mockProducts[6]]` becomes `items: [mockProducts[4], mockProducts[5]]`
- Update `mockOutfits[4]` ("Evening Elegance"): `items: [mockProducts[5], mockProducts[1], mockProducts[7]]` becomes `items: [mockProducts[4], mockProducts[1], mockProducts[6]]`

### 5. Validate Product and Outfit Consistency
- Verify no remaining references to `/black-leather-oxford-shoes.jpg` in footwear context
- Verify all mockOutfits have valid items arrays
- Run TypeScript compilation to check for type errors
- Run ESLint to check for code quality issues

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && npx tsc --noEmit` - Verify TypeScript compilation passes without errors
- `cd apps/web && pnpm lint` - Verify ESLint passes without errors
- `grep -n "black-leather-oxford-shoes" apps/web/lib/mock-data.ts` - Should return empty (no oxford shoe references in footwear)
- `grep -n "CG003" apps/web/lib/mock-data.ts` - Should return empty (masculine product removed)
- `grep -n "SH001" apps/web/lib/mock-data.ts` - Should show updated formal heels with proper imageUrl
- `grep -n "SH002" apps/web/lib/mock-data.ts` - Should show updated classic pumps with proper imageUrl

## Notes
- The placeholder.svg approach ensures images display correctly even without actual asset files
- Using `mockProducts.find(p => p.sku === "...")` pattern is more robust than numeric indices for outfit references
- The visual descriptions added to SH001 and SH002 will help AI image generation create appropriate feminine footwear visualizations
- Consider replacing placeholder images with actual women's footwear photos in a future task
- The oxford shoe image (`/black-leather-oxford-shoes.jpg`) may still be referenced elsewhere in the codebase for different purposes; this chore only addresses the mock footwear products
