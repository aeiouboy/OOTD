# Chore: Fix undefined product name in OutfitValidator console warnings

## Metadata
adw_id: `c591289d`
prompt: `Fix undefined product name in OutfitValidator console warnings: Console warnings show 'product: undefined' instead of actual product name. Ensure product.name or product.sku is passed to the warning message instead of undefined. Check the validateOutfitComposition function and related logging calls.`

## Chore Description
Console warnings in the OutfitValidator are showing `product: undefined` instead of the actual product name. This occurs because the code references `product.product_name` which does not exist on the `Product` interface. The `Product` type (defined in `apps/web/lib/types.ts`) only has a `name` property, not `product_name`.

The issue appears in multiple logging statements throughout `outfit-combination-rules.ts` where:
1. Some lines use only `product.product_name` (which returns `undefined`)
2. Other lines use `product.product_name || product.name` fallback pattern (works but is inconsistent)

All references should consistently use `product.name` since that's the correct property on the `Product` interface.

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/styling/outfit-combination-rules.ts** - Contains the OutfitValidator logging statements with incorrect `product_name` references. This is the main file to modify.
- **apps/web/lib/types.ts** - Defines the `Product` interface with `name` property (reference only, no changes needed)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix deduplicateOutfitCategories logging (line 333)
- Change `product: product.product_name` to `product: product.name`
- This is in the gender warning for single-item categories

### 2. Fix validateOutfitComposition footwear logging (lines 424, 428, 430)
- Line 424: Change `(shoe.product_name || shoe.name || '')` to `(shoe.name || '')`
- Line 428: Change `${shoe.product_name || shoe.name}` to `${shoe.name}`
- Line 430: Change `product: shoe.product_name || shoe.name` to `product: shoe.name`

### 3. Fix validateOutfitComposition visual mismatch logging (lines 439, 441)
- Line 439: Change `${shoe.product_name || shoe.name}` to `${shoe.name}`
- Line 441: Change `product: shoe.product_name || shoe.name` to `product: shoe.name`

### 4. Fix validateOutfitComposition visual inconsistency logging (line 453)
- Change `${item.product_name || item.name}` to `${item.name}`

### 5. Fix validateOutfitComposition gender mismatch logging (lines 461, 463)
- Line 461: Change `${item.product_name}` to `${item.name}`
- Line 463: Change `product: item.product_name` to `product: item.name`

### 6. Fix applyWorkTrendRules footwear logging (lines 803, 812, 829)
- Line 803: Change `(shoe.product_name || '')` to `(shoe.name || '')`
- Line 812: Change `shoe.product_name` to `shoe.name`
- Line 829: Change `.product_name` to `.name`

### 7. Validate the changes
- Run TypeScript compilation to ensure no type errors
- Run linting to ensure code quality
- Optionally run the application and check console output shows actual product names

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm tsc --noEmit` - Verify TypeScript compilation succeeds
- `cd apps/web && pnpm lint` - Verify no linting errors in the modified file
- `grep -n "product_name" apps/web/lib/styling/outfit-combination-rules.ts` - Should return no results (all references removed)

## Notes
- The `Product` interface in `apps/web/lib/types.ts` defines `name: string` as the product name property
- There is no `product_name` property on the `Product` type, so these references always returned `undefined`
- Some existing code already used the fallback pattern `product_name || name` which masked the issue but was inconsistent
- After this fix, all logging will consistently use `product.name` which matches the type definition
