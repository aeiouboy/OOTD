# Chore: Ensure Women-Only Product Filtering for OOTD Women's Fashion Department

## Metadata
adw_id: `53cac67a`
prompt: `Fix outfit recommendations to ensure women-only products for OOTD women's fashion department`

## Chore Description

The outfit recommendation system is currently showing masculine-looking items (oxford dress shoes, men's style blazers) when OOTD is focused on the women's fashion department only. The issue stems from:

1. **Gender Filtering Inconsistency**: The current `filterProductsByGender` function in `outfit-generator.ts` (lines 526-535) only checks if the `category` field includes "women", but this may not be strict enough
2. **Product Data Validation**: Products may not be properly tagged with gender metadata in the product data files
3. **Women's Work Outfit Rules**: The outfit combination rules don't specifically enforce women-appropriate footwear (heels, loafers, mules, ballet flats) vs. masculine styles (oxford shoes, brogues)

**Visual Analysis from Issue**:
- Navy blazer appears to be men's cut (not fitted/feminine)
- Black oxford shoes are clearly men's dress shoe style
- Overall aesthetic is masculine business rather than women's corporate chic

**Root Cause**: The system needs stricter gender validation at multiple points:
1. Product filtering before outfit generation
2. Product categorization during outfit composition
3. Style-specific rules for women's work outfits (Pinterest 2026 corporate chic aesthetic)

## Relevant Files

Use these files to complete the chore:

- `apps/web/lib/outfit-generator.ts` - Main outfit generation logic with gender filtering (lines 526-535 for `filterProductsByGender`, lines 541-674 for `generateOutfits` and `generateOutfitsFromQuery`)
- `apps/web/lib/enhanced-outfit-generator.ts` - Enhanced outfit generator using EnhancedProduct model (lines 346-487 for generation functions)
- `apps/web/lib/styling/outfit-combination-rules.ts` - Pinterest 2026 trend-based combination rules (lines 635-749 for work outfit rules)
- `apps/web/lib/utils/product-filters.ts` - May contain gender filtering utilities (needs to be checked/created if doesn't exist)
- `data/products/women_clothing.json` - Women's product data file to validate gender tagging
- `data/products/men_clothing.json` - Men's product data file to validate gender separation

### New Files
None - all modifications will be made to existing files

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Audit Product Data Gender Tags
- Read `data/products/women_clothing.json` to verify all products have `category: "women_clothing"`
- Read `data/products/men_clothing.json` to verify products have appropriate men's category tags
- Document any products with ambiguous gender tags or missing gender metadata
- Identify if oxford shoes, derby shoes, or men's blazers exist in women's product file

### 2. Strengthen Gender Filtering in outfit-generator.ts
- Locate `filterProductsByGender` function (lines 526-535)
- Add strict validation: for women's products, ensure category includes "women" AND does NOT include "men"
- Add validation: exclude products with men's style keywords (oxford, derby, brogue, men's cut)
- Add logging to track filtered products for debugging
- Update function docstring to document strict filtering behavior

### 3. Add Women-Specific Footwear Validation
- In `outfit-generator.ts`, create helper function `isWomenFootwear(product: Product): boolean`
- Check for women's footwear keywords: heels, pumps, loafers, mules, ballet flats, pointed-toe, women's sneakers, sandals
- Exclude masculine footwear: oxford, derby, brogue, wingtip, men's dress shoes
- Use this validation in outfit composition before adding shoes

### 4. Update Enhanced Outfit Generator Gender Filtering
- In `enhanced-outfit-generator.ts`, locate `generateEnhancedOutfit` function (lines 105-239)
- Ensure gender filtering uses the same strict logic as standard generator
- Add validation before adding footwear to outfit (around lines 129, 167)
- Verify `filterByGender` utility function (imported from product-filters) uses strict filtering

### 5. Enhance Work Outfit Rules for Women's Corporate Chic
- In `outfit-combination-rules.ts`, locate `applyWorkTrendRules` function (lines 635-749)
- Add gender-aware footwear selection (around line 732 where shoes are added)
- For women's work outfits, prioritize: heels, loafers, mules, pointed-toe flats
- Add validation to log warnings if masculine items are selected
- Update Pinterest 2026 work outfit formula comments to specify women's footwear

### 6. Add Validation Logging and Warnings
- In `deduplicateOutfitCategories` function (lines 297-346), add gender validation logging
- In `validateOutfitComposition` function (lines 352-420), add check for gender-inappropriate items
- Add console warnings when masculine items are detected in women's outfits
- Log product names and categories for debugging

### 7. Test Gender Filtering End-to-End
- Use `generateOutfits` function with gender='women' option
- Verify no men's oxford shoes appear in results
- Verify all blazers are women's cut (fitted, feminine styling)
- Verify work outfits follow Pinterest 2026 corporate chic for women (wide-leg trousers, fitted tops, women's footwear)

### 8. Update Type Definitions and Documentation
- Add TypeScript type for women's footwear categories
- Update function docstrings to document gender filtering behavior
- Add code comments explaining women's vs men's footwear distinction

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Verify TypeScript compilation
cd apps/web && pnpm run build

# Run type checking
cd apps/web && npx tsc --noEmit

# Run linting
cd apps/web && pnpm run lint

# Validate product data structure
cd /Users/naruechon/OOTD && node -e "
const women = require('./data/products/women_clothing.json');
const hasInvalidGender = women.some(p =>
  p.category?.toLowerCase().includes('men') &&
  !p.category?.toLowerCase().includes('women')
);
console.log('Women products with men category:', hasInvalidGender ? 'FOUND - NEEDS FIX' : 'NONE - GOOD');
const oxfords = women.filter(p =>
  p.product_name?.toLowerCase().includes('oxford') ||
  p.product_name?.toLowerCase().includes('derby')
);
console.log('Oxford/Derby shoes in women data:', oxfords.length > 0 ? oxfords.map(p => p.product_name) : 'NONE - GOOD');
"

# Test outfit generation with women filter
cd apps/web && node -e "
const { generateOutfits } = require('./lib/outfit-generator.ts');
const products = require('../../data/products/women_clothing.json').slice(0, 50);
const outfits = generateOutfits(products, { count: 3, style: 'business', gender: 'women' });
console.log('Generated', outfits.length, 'women business outfits');
outfits.forEach(o => {
  const shoes = o.items.filter(i => i.name?.toLowerCase().includes('shoe'));
  console.log('Outfit:', o.title, '| Shoes:', shoes.map(s => s.name));
});
"
```

## Notes

### Women's Work Footwear (Pinterest 2026 Corporate Chic)
**Women's Appropriate:**
- Heels (pumps, stilettos, block heels)
- Women's loafers (pointed-toe, tassel, gold hardware)
- Mules (heeled or flat, backless)
- Ballet flats (pointed-toe, rounded)
- Slingback heels
- Women's sneakers (white leather, minimal)

**Masculine/Inappropriate:**
- Oxford shoes (lace-up dress shoes, masculine)
- Derby shoes (men's dress style)
- Brogues (wingtip, perforated, men's style)
- Men's dress shoes

### Gender Validation Strategy
1. **Primary Check**: Product category field must include "women"
2. **Exclusion Check**: Product category must NOT include "men" (unless explicitly "women" is also present)
3. **Keyword Check**: Product name/description should not include masculine style keywords
4. **Visual Style Check**: For work outfits, ensure fitted/feminine blazers (not boxy/masculine)

### Testing Scenarios
1. Generate 10 women's work outfits → verify NO oxford shoes appear
2. Generate 10 women's casual outfits → verify NO men's items appear
3. Generate women's corporate chic outfit → verify fitted blazer + wide-leg trousers + women's heels/loafers
4. Filter products by gender='women' → verify count matches expected women's inventory

### Performance Considerations
- Gender filtering happens early in pipeline (before categorization)
- Validation checks are O(n) where n = number of products
- Logging should be debug-level to avoid spam in production
