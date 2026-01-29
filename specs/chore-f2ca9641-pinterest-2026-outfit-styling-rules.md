# Chore: Enhance OOTD Outfit Recommendation Styling and Combination Logic Based on Pinterest 2026 Fashion Trends Analysis

## Metadata
adw_id: `f2ca9641`
prompt: `Enhance OOTD outfit recommendation styling and combination logic based on Pinterest 2026 fashion trends analysis: General Outfit Trends (Casual/Everyday): Layering Techniques, Color Palettes, Bottom Styling, Footwear Combinations, Key Accessories, Aesthetic Categories. Work/Office Outfit Trends: Business Casual Staples, Color Combinations, Layering for Office, Professional Accessories, Key Silhouettes, Office Aesthetics.`

## Chore Description

This chore enhances the outfit generation system to incorporate Pinterest 2026 fashion trends analysis insights, modernizing outfit combination rules with current trending styles, color palettes, layering techniques, and occasion-specific styling patterns.

The Pinterest analysis reveals:
- **General/Casual Trends**: Oversized layering (sweaters over tees, cardigans over fitted tops), neutral earth tone palettes (grey, beige, brown, olive), baggy/wide-leg denim, platform sneakers and boots, black structured bags, clean girl/Scandinavian minimal/street style aesthetics
- **Work/Office Trends**: Fitted black tops with high-waisted wide-leg trousers, cashmere sweaters, business casual blazers, olive/brown/cream color combinations, structured leather totes, wide-leg high-waisted bottoms, corporate chic/quiet luxury/minimalist office aesthetics

The implementation will:
1. Add 2026 trending color palettes and silhouette rules to the outfit generator
2. Implement occasion-based styling rules (casual vs work vs special occasion)
3. Add intelligent layering logic for outfit compositions
4. Enhance accessory pairing recommendations based on outfit type
5. Update style descriptions with current trending aesthetics
6. Integrate with existing RAG knowledge base for fashion styling guidance

## Relevant Files

Use these files to complete the chore:

- **apps/web/lib/outfit-generator.ts** - Main outfit generation logic. Currently has basic categorization and random selection. Needs enhanced combination rules, color palette filtering, layering logic, and 2026 trend-aware outfit composition.

- **apps/web/lib/enhanced-outfit-generator.ts** - Enhanced outfit generator using EnhancedProduct model. Contains occasion-based filtering and formality scoring. Needs Pinterest-inspired styling rules integration.

- **apps/web/lib/categorization/style-tagger.ts** - Style tag assignment for products. Needs expansion to detect 2026 trending aesthetics (clean girl, quiet luxury, street style, corporate chic).

- **apps/web/lib/rag/capabilities/style-analyzer.ts** - RAG-based style analysis capability. Can be enhanced to leverage knowledge base for outfit combination rules.

- **apps/web/lib/data/fashion-styles.json** - User style preference definitions. May need updates to align with 2026 aesthetics terminology.

- **apps/web/lib/types.ts** - Type definitions including Outfit and Product interfaces. May need new fields for tracking style aesthetics and layering components.

- **apps/web/lib/types/product-types.ts** - Enhanced product type definitions with classification, style attributes, and occasion mapping.

- **apps/web/lib/types/enums.ts** - Enum definitions for StyleTag, OccasionType, etc. Needs new aesthetic categories for 2026 trends.

- **data/personas/knowledge_base/advanced/08_color_theory.md** - Existing color theory knowledge base. Contains seasonal color systems and palettes that can inform color combination rules.

- **data/personas/knowledge_base/advanced/10_advanced_styling.md** - Existing advanced styling techniques knowledge. Contains outfit formulas, monochrome magic, layering principles that align with Pinterest trends.

- **data/personas/knowledge_base/foundation/04_occasions_dress_codes.md** - Occasion-specific dress code knowledge that can be enhanced with Pinterest work/casual trend insights.

### New Files

- **apps/web/lib/styling/pinterest-2026-trends.ts** - New module defining Pinterest 2026 trend rules, color palettes, layering patterns, and aesthetic categories.

- **apps/web/lib/styling/outfit-combination-rules.ts** - New module with intelligent outfit combination logic based on occasion, aesthetic, color theory, and layering principles.

- **apps/web/lib/styling/color-palette-matcher.ts** - New utility for matching products based on 2026 trending color palettes (neutral earth tones, monochromatic schemes, etc.).

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Pinterest 2026 Trends Definition Module

- Create `apps/web/lib/styling/pinterest-2026-trends.ts` with:
  - Type definitions for aesthetic categories: 'clean-girl' | 'scandinavian-minimal' | 'street-style' | 'casual-chic' | 'y2k-revival' | 'corporate-chic' | 'quiet-luxury' | 'minimalist-office' | 'dark-academia'
  - Color palette definitions for trending combinations:
    - Neutral earth tones: grey, beige, brown, olive, taupe
    - Monochromatic palettes: all-beige, all-brown, all-blue
    - Work combinations: olive + black, brown + cream, all-black with texture
  - Layering pattern definitions:
    - Casual layering: oversized sweaters over tees, cardigans over fitted tops, knit vests over button-ups
    - Office layering: sweaters over collared shirts, blazers over knits, cardigans over dresses
  - Bottom styling trends: baggy/wide-leg jeans, high-waisted fits, cuffed denim, wide-leg trousers
  - Footwear trends: platform sneakers (Adidas Gazelle style), Timberland boots, UGG-style boots, chunky sneakers
  - Accessory trends: black structured bags, gold layered jewelry, wide belts for waist definition
  - Export trend data structures and helper functions

### 2. Create Color Palette Matching Utility

- Create `apps/web/lib/styling/color-palette-matcher.ts` with:
  - Function `detectProductColor(product: Product): string[]` to extract color keywords from product name/description
  - Function `getPaletteCompatibility(colors: string[]): string` to determine which 2026 trend palette the colors belong to
  - Function `areColorsCompatible(color1: string[], color2: string[]): boolean` to check if two products' colors work in same outfit based on trend palettes
  - Function `getMonochromaticMatches(baseColor: string, products: Product[]): Product[]` to find products in same color family for monochrome outfits
  - Function `getNeutralEarthTones(products: Product[]): Product[]` to filter products with trending neutral palette
  - Integration with color theory from knowledge base (reference 08_color_theory.md)

### 3. Create Outfit Combination Rules Engine

- Create `apps/web/lib/styling/outfit-combination-rules.ts` with:
  - Type definitions for layering configurations: `LayeringRule`, `OutfitCompositionRule`
  - Function `applyLayeringRules(occasion: OccasionType, categorized: CategorizedProducts): Product[]` to select layered outfit components
  - Function `applyCasualTrendRules(products: CategorizedProducts, colorPalette?: string): Product[]` implementing casual/everyday Pinterest trends:
    - Oversized layering logic
    - Neutral earth tone color filtering
    - Baggy/wide-leg bottom preference
    - Platform sneaker/boot footwear selection
    - Structured bag + layered jewelry accessories
  - Function `applyWorkTrendRules(products: CategorizedProducts): Product[]` implementing work/office Pinterest trends:
    - Fitted top + wide-leg trouser combinations
    - Blazer/cardigan layering for office
    - Olive/brown/black/cream color coordination
    - Structured tote bag selection
    - High-waisted bottom preference
  - Function `getAestheticCompatibleProducts(aesthetic: string, products: Product[]): Product[]` to filter products matching specific aesthetic
  - Export combination rule functions for use in outfit generators

### 4. Extend Style Tagger with 2026 Aesthetic Detection

- Update `apps/web/lib/categorization/style-tagger.ts`:
  - Add new StyleTag values in `apps/web/lib/types/enums.ts`: 'clean-girl', 'scandinavian-minimal', 'street-style', 'corporate-chic', 'quiet-luxury', 'y2k-revival'
  - Enhance `assignStyleTags()` function with 2026 aesthetic keyword detection:
    - Clean girl: 'minimal', 'neutral', 'soft', 'fresh', 'light tones'
    - Scandinavian minimal: 'simple', 'clean lines', 'neutral palette', 'quality basics'
    - Street style: 'oversized', 'baggy', 'urban', 'layered', 'chunky'
    - Corporate chic: 'structured', 'tailored', 'wide-leg', 'blazer', 'professional'
    - Quiet luxury: 'understated', 'premium', 'timeless', 'refined', 'cashmere'
    - Y2k revival: 'low-rise', 'colorful', 'playful', 'platform', 'retro'
  - Add pattern detection for trending silhouettes: 'oversized', 'wide-leg', 'high-waisted', 'fitted-top'
  - Update `analyzeProductStyle()` to return aesthetic category based on detected tags

### 5. Enhance Main Outfit Generator with Pinterest Trends

- Update `apps/web/lib/outfit-generator.ts`:
  - Import and integrate pinterest-2026-trends module
  - Import color-palette-matcher and outfit-combination-rules
  - Enhance `generateOutfit()` function:
    - Add optional `aesthetic?: string` parameter for trend-based filtering
    - Add optional `colorPalette?: string` parameter for color coordination
    - Apply color palette compatibility filtering before combination
    - Use layering rules from outfit-combination-rules module
    - Apply aesthetic-based product filtering when specified
  - Update `generateOutfitTitle()` with 2026 trend aesthetic titles:
    - Clean girl aesthetics: 'ลุคสาวคลีนมินิมอล', 'สไตล์สแกนดิเนเวียน'
    - Street style: 'ลุคสตรีทสไตล์', 'สไตล์เออร์เบิร์น'
    - Corporate chic: 'ลุคออฟฟิศชิค', 'สไตล์ Quiet Luxury'
  - Update `generateOutfitDescription()` with trend-aware descriptions referencing layering, color palettes, and silhouettes
  - Add helper function `applyTrendBasedCombination()` that uses combination rules based on detected aesthetic

### 6. Enhance Enhanced Outfit Generator with Pinterest Styling

- Update `apps/web/lib/enhanced-outfit-generator.ts`:
  - Import pinterest-2026-trends and combination rules modules
  - Enhance `generateEnhancedOutfit()` function:
    - Add aesthetic category detection based on occasion and product styles
    - Apply Pinterest trend rules for work occasions (fitted top + wide-leg bottom, blazer layering)
    - Apply casual trend rules for chill/weekend occasions (oversized layering, neutral palettes)
    - Add intelligent layering selection based on formality level and occasion
    - Implement color palette matching for monochromatic and neutral earth tone outfits
  - Update outfit composition strategy:
    - For work: Prioritize fitted top + wide-leg bottom + blazer/cardigan + structured bag
    - For casual: Prioritize oversized top + baggy bottom + layering piece + chunky footwear
    - For all: Apply color palette compatibility checking
  - Enhance `generateOutfitTitle()` and `generateOutfitDescription()` with aesthetic-aware Thai labels

### 7. Update Type Definitions with New Style Attributes

- Update `apps/web/lib/types/enums.ts`:
  - Add new `AestheticCategory` enum with 2026 trend values
  - Expand `StyleTag` type to include new aesthetic tags
  - Add `ColorPalette` type for trending palette categories
  - Add `LayeringStyle` enum: 'oversized', 'fitted', 'structured', 'relaxed'
  - Add `SilhouetteType` enum: 'wide-leg', 'baggy', 'fitted', 'high-waisted', 'oversized'
- Update `apps/web/lib/types.ts`:
  - Add optional `aesthetic?: AestheticCategory` to Outfit interface
  - Add optional `colorPalette?: ColorPalette` to Outfit interface
  - Add optional `layeringStyle?: LayeringStyle` to Outfit interface

### 8. Integrate with RAG Knowledge Base for Styling Rules

- Update `apps/web/lib/rag/capabilities/style-analyzer.ts`:
  - Add function `getPinterestTrendRecommendations(occasion: OccasionType): Promise<string[]>` that retrieves relevant styling rules from knowledge base
  - Enhance `matchStylingRules()` to query knowledge base for:
    - Layering techniques from 10_advanced_styling.md
    - Color combinations from 08_color_theory.md
    - Occasion-specific rules from 04_occasions_dress_codes.md
  - Add function `getColorPaletteRecommendations(aesthetic: string): Promise<string[]>` for aesthetic-based color guidance
  - Export Pinterest trend analysis functions for use in outfit generators

### 9. Update Fashion Styles Configuration with 2026 Aesthetics

- Update `apps/web/lib/data/fashion-styles.json`:
  - Review and update style descriptions to align with Pinterest 2026 terminology
  - Ensure 'minimal' style description emphasizes neutral earth tones and clean lines
  - Ensure 'business' style description mentions wide-leg trousers and structured pieces
  - Ensure 'casual' style description includes oversized layering and street style elements
  - Add keywords for each style that match Pinterest aesthetic categories

### 10. Add Unit Tests for New Styling Modules

- Create `apps/web/lib/styling/__tests__/pinterest-2026-trends.test.ts`:
  - Test trend data structures are properly exported
  - Test aesthetic category detection logic
  - Test color palette definitions
- Create `apps/web/lib/styling/__tests__/color-palette-matcher.test.ts`:
  - Test color detection from product names
  - Test color compatibility checking
  - Test monochromatic matching
  - Test neutral earth tone filtering
- Create `apps/web/lib/styling/__tests__/outfit-combination-rules.test.ts`:
  - Test layering rule application for different occasions
  - Test casual trend rules produce oversized layering
  - Test work trend rules produce fitted + wide-leg combinations
  - Test aesthetic filtering

### 11. Update Existing Outfit Generator Tests

- Update `apps/web/lib/__tests__/outfit-generator.test.ts`:
  - Add test cases for aesthetic parameter
  - Add test cases for color palette parameter
  - Verify Pinterest trend rules are applied correctly
  - Test that generated outfits follow 2026 trending patterns
  - Test fallback behavior when trend data not available

### 12. Validate Implementation

- Run all unit tests to ensure new modules work correctly
- Test outfit generation with different occasions (work, casual, weekend)
- Verify color palette compatibility in generated outfits
- Verify layering logic produces appropriate combinations
- Check that outfit titles and descriptions reflect 2026 aesthetics
- Ensure backward compatibility with existing outfit generation flows
- Test integration with RAG knowledge base for styling recommendations

## Validation Commands

Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm lint` - Ensure no linting errors in new and modified files
- `cd apps/web && pnpm test outfit-generator` - Run outfit generator unit tests
- `cd apps/web && pnpm test styling` - Run new styling module tests
- `cd apps/web && pnpm type-check` - Verify TypeScript types are correct
- `cd apps/web && pnpm test style-analyzer` - Test RAG integration for styling rules

## Notes

### Pinterest 2026 Trend Priorities

**High Priority (Casual/Everyday)**:
1. Neutral earth tone color palettes (grey, beige, brown, olive, taupe)
2. Oversized layering techniques (sweaters over tees, cardigans over fitted tops)
3. Wide-leg/baggy bottom silhouettes
4. Platform sneakers and chunky footwear
5. Clean girl, Scandinavian minimal, street style aesthetics

**High Priority (Work/Office)**:
1. Fitted top + wide-leg high-waisted bottom combinations
2. Olive/brown/black/cream color coordination
3. Blazer and cardigan layering over tops/dresses
4. Structured leather bags (black/brown)
5. Corporate chic, quiet luxury, minimalist office aesthetics

### Integration Strategy

- New styling modules should be standalone and reusable
- Existing outfit generators should progressively adopt new rules
- RAG knowledge base provides authoritative styling guidance
- Color palette matching should be performant (pre-computed palettes)
- Aesthetic detection can be fuzzy (products may match multiple aesthetics)
- Maintain backward compatibility with existing outfit generation API

### Future Enhancements

- Machine learning model to detect aesthetic from product images
- User preference learning for favorite aesthetic categories
- Seasonal trend updates (quarterly Pinterest trend analysis)
- Regional trend variations (Bangkok vs. international)
- Social media trend monitoring integration
