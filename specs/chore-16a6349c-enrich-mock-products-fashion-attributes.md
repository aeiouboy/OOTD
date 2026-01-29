# Chore: Enrich Mock Products with Fashion Attributes

## Metadata
adw_id: `16a6349c`
prompt: `Analyze apps/web/lib/mock-data.ts and create a new file apps/web/lib/mock-data02.ts that enriches all mockProducts with comprehensive fashion attributes for outfit recommendation.`

## Chore Description
Create an enhanced mock product data file that extends the existing `mockProducts` array from `mock-data.ts` with comprehensive fashion domain attributes. The goal is to enable better outfit matching and recommendation logic by adding 14 fashion-specific attributes to each product. These attributes will leverage existing TypeScript enum types from `lib/types/enums.ts` to ensure type safety and consistency with the platform's fashion domain model.

The new file will:
1. Define an `EnhancedMockProduct` interface extending the legacy `Product` interface
2. Export an `enhancedMockProducts` array containing all 14 original products with enriched attributes
3. Use fashion domain knowledge to accurately infer attributes from product names, categories, visual descriptions, and occasions

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/mock-data.ts** - Source file containing 14 `mockProducts` to be enriched. Products include blazers, pants, shirts, dresses, heels, and accessories from Central, SFERA, and LOLITA brands.

- **apps/web/lib/types/enums.ts** - Contains all TypeScript enum types needed for the 14 attributes:
  - `StyleTag` - 18 style values including 'minimalist', 'corporate-chic', 'quiet-luxury', 'clean-girl', etc.
  - `SeasonType` - 'all-season', 'hot-season', 'cool-season', 'rainy-season'
  - `FormalityLevel` - 1-10 numeric scale
  - `FitType` - 'slim', 'regular', 'loose', 'oversized', 'tailored'
  - `PatternType` - 'solid', 'striped', 'floral', 'print', 'plaid', 'checkered', etc.
  - `MaterialType` - 'cotton', 'polyester', 'linen', 'silk', 'wool', 'denim', 'leather', etc.
  - `AestheticCategory` - Pinterest 2026 aesthetics like 'clean-girl', 'corporate-chic', 'quiet-luxury'
  - `ColorPalette` - Trending palettes like 'neutral-earth-tones', 'monochromatic-black', etc.
  - `OutfitRole` - 'top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory', 'bag'
  - `BrandTier` - 'budget', 'mid-range', 'premium', 'luxury'
  - `LayeringStyle` - 'oversized', 'fitted', 'structured', 'relaxed'
  - `SilhouetteType` - 'wide-leg', 'baggy', 'fitted', 'high-waisted', 'oversized'

- **apps/web/lib/types.ts** - Re-exports enum types and defines the legacy `Product` interface that `EnhancedMockProduct` will extend

- **apps/web/lib/types/product-types.ts** - Reference for `EnhancedProduct` interface structure (more complex than needed, but shows best practices for product typing)

### New Files

- **apps/web/lib/mock-data02.ts** - New file to be created containing:
  - `EnhancedMockProduct` interface
  - `ColorTone` type ('warm' | 'cool' | 'neutral')
  - `enhancedMockProducts` array with all enriched products

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create EnhancedMockProduct Interface
- Create new file `apps/web/lib/mock-data02.ts`
- Import `Product` type from `./types`
- Import all required enum types from `./types/enums`:
  - `StyleTag`, `SeasonType`, `FormalityLevel`, `FitType`
  - `PatternType`, `MaterialType`, `AestheticCategory`, `ColorPalette`
  - `OutfitRole`, `BrandTier`, `LayeringStyle`, `SilhouetteType`
- Define `ColorTone` type as `'warm' | 'cool' | 'neutral'`
- Define `EnhancedMockProduct` interface extending `Product` with all 14 attributes:
  ```typescript
  export interface EnhancedMockProduct extends Product {
    styleTags: StyleTag[]
    seasonType: SeasonType
    formalityLevel: FormalityLevel
    fitType: FitType
    patternType: PatternType
    materialType: MaterialType
    colorTone: ColorTone
    aesthetic: AestheticCategory
    colorPalette: ColorPalette
    outfitRole: OutfitRole
    brandTier: BrandTier
    pairingCategories: string[]
    layeringStyle: LayeringStyle
    silhouetteType: SilhouetteType
  }
  ```

### 2. Enrich CG001 - Classic White Button Shirt
- Copy all original product data
- Add fashion attributes:
  - `styleTags`: ['classic', 'minimalist', 'corporate-chic']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 6
  - `fitType`: 'regular'
  - `patternType`: 'solid'
  - `materialType`: 'cotton'
  - `colorTone`: 'cool'
  - `aesthetic`: 'corporate-chic'
  - `colorPalette`: 'monochromatic-white' (or closest match)
  - `outfitRole`: 'top'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Pants', 'Skirt', 'Blazer', 'Jeans']
  - `layeringStyle`: 'fitted'
  - `silhouetteType`: 'fitted'

### 3. Enrich CG002 - Tailored Black Trousers
- Copy all original product data (including occasion: ["work", "formal"])
- Add fashion attributes:
  - `styleTags`: ['classic', 'corporate-chic', 'minimalist']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 7
  - `fitType`: 'tailored'
  - `patternType`: 'solid'
  - `materialType`: 'polyester' (blend typical for tailored trousers)
  - `colorTone`: 'neutral'
  - `aesthetic`: 'corporate-chic'
  - `colorPalette`: 'monochromatic-black'
  - `outfitRole`: 'bottom'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Blouse', 'Blazer', 'Shirt', 'Heels', 'Pumps']
  - `layeringStyle`: 'structured'
  - `silhouetteType`: 'fitted'

### 4. Enrich CG004 - Casual Denim Jeans
- Copy all original product data (occasion: ["casual", "weekend"])
- Add fashion attributes:
  - `styleTags`: ['casual', 'modern', 'street-style']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 3
  - `fitType`: 'regular'
  - `patternType`: 'solid'
  - `materialType`: 'denim'
  - `colorTone`: 'cool'
  - `aesthetic`: 'casual-chic'
  - `colorPalette`: 'monochromatic-blue'
  - `outfitRole`: 'bottom'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['T-Shirt', 'Blouse', 'Shirt', 'Sneakers', 'Flats']
  - `layeringStyle`: 'relaxed'
  - `silhouetteType`: 'fitted'

### 5. Enrich CG005 - Floral Summer Dress
- Copy all original product data (occasion: ["casual", "weekend"])
- Add fashion attributes:
  - `styleTags`: ['bohemian', 'trendy', 'casual']
  - `seasonType`: 'hot-season'
  - `formalityLevel`: 4
  - `fitType`: 'regular'
  - `patternType`: 'floral'
  - `materialType`: 'cotton'
  - `colorTone`: 'warm'
  - `aesthetic`: 'clean-girl'
  - `colorPalette`: 'neutral-earth-tones'
  - `outfitRole`: 'dress'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Sandals', 'Flats', 'Bag', 'Belt']
  - `layeringStyle`: 'relaxed'
  - `silhouetteType`: 'fitted'

### 6. Enrich CG006 - Blazer Jacket
- Copy all original product data (occasion: ["work", "formal"])
- Add fashion attributes:
  - `styleTags`: ['corporate-chic', 'classic', 'minimalist']
  - `seasonType`: 'cool-season'
  - `formalityLevel`: 7
  - `fitType`: 'tailored'
  - `patternType`: 'solid'
  - `materialType`: 'polyester'
  - `colorTone`: 'neutral'
  - `aesthetic`: 'corporate-chic'
  - `colorPalette`: 'neutral-earth-tones'
  - `outfitRole`: 'outerwear'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Pants', 'Skirt', 'Blouse', 'Dress', 'Shirt']
  - `layeringStyle`: 'structured'
  - `silhouetteType`: 'fitted'

### 7. Enrich CG007 - Cotton T-Shirt
- Copy all original product data (occasion: ["casual", "weekend"])
- Add fashion attributes:
  - `styleTags`: ['casual', 'minimalist', 'modern']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 2
  - `fitType`: 'regular'
  - `patternType`: 'solid'
  - `materialType`: 'cotton'
  - `colorTone`: 'neutral'
  - `aesthetic`: 'clean-girl'
  - `colorPalette`: 'monochromatic-black' (has multiple colors available)
  - `outfitRole`: 'top'
  - `brandTier`: 'budget'
  - `pairingCategories`: ['Jeans', 'Pants', 'Skirt', 'Sneakers']
  - `layeringStyle`: 'relaxed'
  - `silhouetteType`: 'fitted'

### 8. Enrich CG008 - Leather Belt
- Copy all original product data
- Add fashion attributes:
  - `styleTags`: ['classic', 'minimalist']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 5
  - `fitType`: 'regular'
  - `patternType`: 'solid'
  - `materialType`: 'leather'
  - `colorTone`: 'neutral'
  - `aesthetic`: 'quiet-luxury'
  - `colorPalette`: 'monochromatic-brown'
  - `outfitRole`: 'accessory'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Pants', 'Jeans', 'Skirt', 'Dress']
  - `layeringStyle`: 'fitted'
  - `silhouetteType`: 'fitted'

### 9. Enrich SF001 - SFERA Women Blazer Suit
- Copy all original product data (subCategory: "Blazer", occasion: ["work", "formal"])
- Add fashion attributes:
  - `styleTags`: ['corporate-chic', 'classic', 'formal']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 8
  - `fitType`: 'tailored'
  - `patternType`: 'solid'
  - `materialType`: 'polyester'
  - `colorTone`: 'neutral'
  - `aesthetic`: 'corporate-chic'
  - `colorPalette`: 'monochromatic-black'
  - `outfitRole`: 'outerwear'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Pants', 'Skirt', 'Blouse', 'Dress', 'Heels']
  - `layeringStyle`: 'structured'
  - `silhouetteType`: 'fitted'

### 10. Enrich SF002 - SFERA Women Suit Pants
- Copy all original product data (subCategory: "Pants", occasion: ["work", "formal"])
- Add fashion attributes:
  - `styleTags`: ['corporate-chic', 'classic', 'formal']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 8
  - `fitType`: 'tailored'
  - `patternType`: 'solid'
  - `materialType`: 'polyester'
  - `colorTone`: 'neutral'
  - `aesthetic`: 'corporate-chic'
  - `colorPalette`: 'monochromatic-black'
  - `outfitRole`: 'bottom'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Blazer', 'Blouse', 'Shirt', 'Heels', 'Pumps']
  - `layeringStyle`: 'structured'
  - `silhouetteType`: 'fitted'

### 11. Enrich LO001 - SFERA White Blouse
- Copy all original product data (subCategory: "Blouse", occasion: ["work", "casual"])
- Add fashion attributes:
  - `styleTags`: ['elegant', 'classic', 'minimalist']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 6
  - `fitType`: 'regular'
  - `patternType`: 'solid' (textured but solid color)
  - `materialType`: 'blend' (viscose mentioned in visual description)
  - `colorTone`: 'cool'
  - `aesthetic`: 'clean-girl'
  - `colorPalette`: 'monochromatic-beige' (white-cream family)
  - `outfitRole`: 'top'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Pants', 'Skirt', 'Blazer', 'Jeans']
  - `layeringStyle`: 'fitted'
  - `silhouetteType`: 'fitted'

### 12. Enrich SF003 - SFERA Printed Midi Skirt
- Copy all original product data (subCategory: "Skirt", occasion: ["work", "casual"])
- Add fashion attributes:
  - `styleTags`: ['elegant', 'classic', 'bohemian']
  - `seasonType`: 'cool-season'
  - `formalityLevel`: 5
  - `fitType`: 'regular'
  - `patternType`: 'print'
  - `materialType`: 'polyester'
  - `colorTone`: 'warm'
  - `aesthetic`: 'quiet-luxury'
  - `colorPalette`: 'monochromatic-brown'
  - `outfitRole`: 'bottom'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Blouse', 'Shirt', 'Blazer', 'Flats', 'Heels']
  - `layeringStyle`: 'relaxed'
  - `silhouetteType`: 'wide-leg' (pleated flowy)

### 13. Enrich SF004 - SFERA Navy Button Dress
- Copy all original product data (subCategory: "Dress", occasion: ["work", "formal"])
- Add fashion attributes:
  - `styleTags`: ['corporate-chic', 'elegant', 'classic']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 7
  - `fitType`: 'tailored'
  - `patternType`: 'solid'
  - `materialType`: 'polyester'
  - `colorTone`: 'cool'
  - `aesthetic`: 'corporate-chic'
  - `colorPalette`: 'monochromatic-blue'
  - `outfitRole`: 'dress'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Heels', 'Pumps', 'Blazer', 'Belt', 'Bag']
  - `layeringStyle`: 'structured'
  - `silhouetteType`: 'fitted'

### 14. Enrich SH001 - Formal Heels
- Copy all original product data (subCategory: "Heels", occasion: ["work", "formal"])
- Add fashion attributes:
  - `styleTags`: ['elegant', 'formal', 'classic']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 8
  - `fitType`: 'slim'
  - `patternType`: 'solid'
  - `materialType`: 'leather'
  - `colorTone`: 'neutral'
  - `aesthetic`: 'corporate-chic'
  - `colorPalette`: 'monochromatic-black'
  - `outfitRole`: 'footwear'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Dress', 'Pants', 'Skirt', 'Blazer']
  - `layeringStyle`: 'fitted'
  - `silhouetteType`: 'fitted'

### 15. Enrich SH002 - Classic Pumps
- Copy all original product data (subCategory: "Pumps", occasion: ["work", "formal", "casual"])
- Add fashion attributes:
  - `styleTags`: ['classic', 'elegant', 'minimalist']
  - `seasonType`: 'all-season'
  - `formalityLevel`: 6
  - `fitType`: 'regular'
  - `patternType`: 'solid'
  - `materialType`: 'leather'
  - `colorTone`: 'warm'
  - `aesthetic`: 'quiet-luxury'
  - `colorPalette`: 'neutral-earth-tones'
  - `outfitRole`: 'footwear'
  - `brandTier`: 'mid-range'
  - `pairingCategories`: ['Dress', 'Pants', 'Skirt', 'Jeans', 'Blazer']
  - `layeringStyle`: 'fitted'
  - `silhouetteType`: 'fitted'

### 16. Export Enhanced Products Array
- Create `enhancedMockProducts` array containing all 14 enriched products
- Export the array with proper TypeScript typing: `export const enhancedMockProducts: EnhancedMockProduct[] = [...]`
- Add JSDoc comment explaining the purpose of the enriched data

### 17. Validate TypeScript Compilation
- Run TypeScript compilation to verify no type errors
- Ensure all enum values used are valid according to `enums.ts`
- Verify `EnhancedMockProduct` interface is properly typed

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm exec tsc --noEmit lib/mock-data02.ts` - Verify TypeScript compiles without errors
- `cd apps/web && pnpm lint lib/mock-data02.ts` - Run ESLint on the new file
- Manually verify: Import `enhancedMockProducts` in a test file and confirm all 14 products have all 14 new attributes
- Verify each product's original data (sku, name, brand, price, etc.) is preserved unchanged

## Notes

### Color Palette Mapping
The `ColorPalette` enum in `enums.ts` has these options:
- 'neutral-earth-tones'
- 'monochromatic-beige'
- 'monochromatic-brown'
- 'monochromatic-blue'
- 'monochromatic-black'
- 'work-olive-black'
- 'work-brown-cream'
- 'all-black-texture'

For white items, use 'neutral-earth-tones' or 'monochromatic-beige' as closest match since there's no explicit white palette.

### Brand Tier Assessment
- Central brand products: 'mid-range' (Thai department store mainstream pricing)
- SFERA products: 'mid-range' (affordable fashion brand)
- LOLITA products: 'mid-range' (accessible footwear)

### Formality Scale Reference
- 1-2: Very casual (loungewear, athleisure)
- 3-4: Casual (weekend wear, casual dining)
- 5-6: Smart casual (casual office, brunch)
- 7-8: Business/Professional (office, meetings)
- 9-10: Formal/Black tie (gala, formal events)

### Material Inference
When `materialType` is not explicitly stated in original data:
- Button shirts → cotton
- Tailored trousers/blazers → polyester blend
- Jeans → denim
- T-shirts → cotton
- Dresses → polyester or blend
- Shoes → leather (for formal), synthetic (for casual)
