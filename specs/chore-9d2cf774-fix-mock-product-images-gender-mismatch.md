# Chore: Fix Mock Product Images to Match Product Descriptions

## Metadata
adw_id: `9d2cf774`
prompt: `Fix mock product images to match product descriptions. Root cause: visual mismatch between AI-generated flat-lay (based on text) and product thumbnails (from imageUrl).`

## Chore Description
The mock product data in `apps/web/lib/mock-data.ts` contains critical image mismatches where product thumbnails (imageUrl) do not match the product names and gender. The primary issue is that SF001 "SFERA Women Blazer Suit" uses `/professional-business-outfit.jpg` which displays TWO MEN'S SUITS WITH TIES - completely inappropriate for a women's product.

This causes a jarring visual mismatch in the UI where:
- The AI-generated flat-lay images (based on text visualDescription) correctly show women's clothing
- The product thumbnails in "Items in this outfit" section show the wrong gender/style images

### Root Cause Analysis
Verified by viewing the images:
- `/professional-business-outfit.jpg` - Shows two men's business suits with red and blue ties - **WRONG**
- `/central-blazer.png` - Shows a women's navy blazer on a dress form - **CORRECT STYLE**
- `/black-tailored-trousers.jpg` - Shows women's black tailored trousers - **CORRECT**

### Products Affected
1. **SF001 "SFERA Women Blazer Suit"** (line 110-123) - Uses men's suit image
2. **outfit-1 "Professional Business Look"** (line 263-270) - Uses same wrong image
3. **outfit-sfera "SFERA Executive Suit"** (line 303-310) - Uses same wrong image

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/mock-data.ts** - Main mock data file containing product definitions and outfit configurations that need image URL corrections
- **apps/web/public/** - Directory containing image assets; need to verify available women's business attire images

### Available Correct Images
Based on file listing:
- `/central-blazer.png` - Women's navy blazer (suitable for SF001)
- `/black-tailored-trousers.jpg` - Women's black trousers (already used correctly by SF002)
- `/white-button-shirt.png` - Women's blouse (available for outfit images)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix SF001 Product Image
- Change SF001 imageUrl from `/professional-business-outfit.jpg` to `/central-blazer.png`
- Verify the visualDescription already exists and is appropriate: "Women's black tailored blazer suit jacket, professional business attire"
- Note: SF001 colors say "Black" but central-blazer.png shows navy - the visualDescription takes precedence for AI generation, and navy is acceptable for women's business attire

### 2. Verify SF002 Product Image
- Confirm SF002 "SFERA Women Suit Pants" uses `/black-tailored-trousers.jpg` which shows women's pants - **ALREADY CORRECT**
- No changes needed for SF002

### 3. Update outfit-1 Image
- Line 269: Change imageUrl from `/professional-business-outfit.jpg` to `/central-blazer.png`
- This outfit contains women's products (white button shirt, black trousers, formal heels) so it should show women's attire

### 4. Update outfit-sfera Image
- Line 309: Change imageUrl from `/professional-business-outfit.jpg` to `/central-blazer.png`
- This outfit specifically references SF001 (women's blazer) and SF002 (women's pants) so it must show women's clothing

### 5. Review All Mock Products for Gender Consistency
Audit each product to ensure imageUrl matches the product gender and description:
- CG001 "Classic White Button Shirt" (Women) - uses `/white-button-shirt.png` - OK
- CG002 "Tailored Black Trousers" (Women) - uses `/black-tailored-trousers.jpg` - OK
- CG004 "Casual Denim Jeans" (Women) - uses `/central-jeans.png` - VERIFY
- CG005 "Floral Summer Dress" (Women) - uses `/floral-summer-dress.png` - VERIFY
- CG006 "Blazer Jacket" (Women) - uses `/central-blazer.png` - OK
- CG007 "Cotton T-Shirt" (Women) - uses `/central-tshirt.png` - VERIFY
- CG008 "Leather Belt" (Women) - uses `/placeholder.svg` - ACCEPTABLE (placeholder)
- LO001 "SFERA White Blouse" (Women) - uses `/white-button-shirt.png` - OK
- SF003 "SFERA Printed Midi Skirt" (Women) - uses `/sfera-midi-skirt.png` - VERIFY
- SF004 "SFERA Navy Button Dress" (Women) - uses `/sfera-navy-dress.png` - VERIFY
- SH001 "Formal Heels" (Women) - uses placeholder.svg - ACCEPTABLE
- SH002 "Classic Pumps" (Women) - uses placeholder.svg - ACCEPTABLE

### 6. Validate Changes
- Run TypeScript compilation to ensure no type errors
- Run ESLint on the mock-data.ts file
- Verify no references to the men's suit image remain

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm exec tsc --noEmit` - Verify TypeScript compilation passes
- `cd apps/web && pnpm exec eslint lib/mock-data.ts` - Verify ESLint passes
- `grep -n "professional-business-outfit" apps/web/lib/mock-data.ts` - Should return NO results after fix
- `grep -n "central-blazer.png" apps/web/lib/mock-data.ts` - Should show SF001, CG006, outfit-1, and outfit-sfera

## Notes

### Image Selection Rationale
The `/central-blazer.png` image shows a women's navy blazer on a dress form, which is appropriate for:
- SF001 "SFERA Women Blazer Suit" - directly matches the product type
- outfit-1 and outfit-sfera - represents professional women's business attire

### Visual Description Priority
The `visualDescription` field is used by the AI for generating flat-lay images, so the text description takes precedence over the thumbnail for AI generation. The thumbnail (imageUrl) is only used for product cards in the UI.

### Future Consideration
Consider creating a dedicated women's business suit composite image if more accurate product photography becomes available. The current fix uses the best available existing asset.
