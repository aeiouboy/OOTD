# Chore: Update server-product-loader.ts to Support KB Expansion Attributes

## Metadata
adw_id: `f86ca2a9`
prompt: `chore-kb002: Update server-product-loader.ts to load product_master_v1.json with KB expansion attributes. Add version detection (v0 vs v1), create kb-attribute-parser.ts for parsing 5 KB groups (thaiContext, visualMatching, crossProductCompatibility, priceIntelligence, socialProof), maintain backward compatibility with legacy product_master.json fallback. Reference spec: specs/chore-kb002-update-server-loader-kb-support.md`

## Chore Description

This chore updates the server-side product loading pipeline to parse and validate the new `product_master_v1.json` format with 63 KB expansion attributes (54 sub-attributes across 5 groups + 9 original attributes). The loader must transform the JSON structure into the TypeScript `EnhancedProduct` interface while maintaining backward compatibility with the legacy `product_master.json` format.

### Current State
- **server-product-loader.ts** (117 lines) loads `product_master.json` and transforms to `EnhancedProduct[]`
- Current transformation pipeline:
  1. Load JSON → `ProductMasterItem[]` (9 basic attributes)
  2. Transform → scraped product structure → `transformCentralProduct()`
  3. Enrich → `enrichProductData()` (infers attributes from name/description)
  4. Validate → `validateProduct()`
  5. Output → `EnhancedProduct[]`

### Target State
- Support both `product_master.json` (legacy v0) and `product_master_v1.json` (KB-enriched v1)
- Parse 5 KB expansion groups from JSON into TypeScript interfaces
- Validate KB attribute types and enums
- Fallback to enrichment pipeline if KB attributes missing
- Maintain 100% backward compatibility with existing code

### Dependencies
- **Prerequisite**: chore-kb001 completed (`product_master_v1.json` created with 2,594 products)
- **Blocks**: chore-kb003 (AI matching integration requires loaded KB attributes)

## Relevant Files

Use these files to complete the chore:

### Files to Modify

- **apps/web/lib/server-product-loader.ts** (117 lines)
  - Current: Loads `product_master.json` with 9 basic attributes
  - Required: Update `ProductMasterItem` interface, add version detection, integrate KB attribute parsing
  - Key function: `loadProductsServerSide()` needs KB parsing integration

- **apps/web/lib/transformers/product-enrichment.ts** (427 lines)
  - Current: Enriches all products with inferred attributes
  - Required: Add `hasKBAttributes()` helper, skip enrichment when KB attributes present
  - Key function: `enrichProductData()` needs conditional logic

- **apps/web/lib/validation/product-validator.ts** (553 lines)
  - Current: Validates core product fields
  - Required: Add `validateKBAttributes()` function for KB-specific validation
  - New validation: Range checks, enum validation for KB fields

### Files to Create (New Files)

- **apps/web/lib/transformers/kb-attribute-parser.ts**
  - Parse KB expansion groups from JSON to TypeScript interfaces
  - Functions: `parseKBAttributes()`, `parseThaiContext()`, `parseVisualMatching()`, etc.
  - Enum validation: `validateAllKBEnums()` for 5 KB groups

- **apps/web/lib/types/kb-expansion-types.ts**
  - Consolidated KB attribute interfaces
  - Types: `KBExpansionAttributes`, `ProductVersion`, `ProductMasterV0Item`, `ProductMasterV1Item`
  - Type guard: `isProductV1()` to detect v1 format

### Reference Files (No Changes)

- **apps/web/lib/types/thai-context-types.ts** - ThaiClimateContext interface (11 attributes)
- **apps/web/lib/types/ai-matching-types.ts** - VisualMatching, CrossProduct, Price, SocialProof interfaces
- **apps/web/lib/types/enums.ts** - All enum definitions for validation (344 lines)
- **data/products/product_master_v1.json** - Source data (7.2MB, 2,594 products with KB attributes)
- **data/products/product_master.json** - Legacy data (1.4MB, 2,594 products without KB)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create KB Expansion Type Definitions
- Create `apps/web/lib/types/kb-expansion-types.ts`
- Define `ProductVersion` type: `'v0' | 'v1'`
- Define `ProductMasterV0Item` interface (9 original attributes from current `ProductMasterItem`)
- Define `ProductMasterV1Item` extending V0 with optional KB groups:
  ```typescript
  interface ProductMasterV1Item extends ProductMasterV0Item {
    thaiContext?: ThaiClimateContext
    visualMatching?: VisualMatchingAttributes
    crossProductCompatibility?: CrossProductCompatibility
    priceIntelligence?: PriceIntelligence
    socialProof?: SocialProofSignals
  }
  ```
- Define `KBExpansionAttributes` interface aggregating all 5 KB groups
- Export type guard: `isProductV1(item: any): item is ProductMasterV1Item`

### 2. Create KB Attribute Parser
- Create `apps/web/lib/transformers/kb-attribute-parser.ts`
- Implement `parseKBAttributes(productJson: any): KBExpansionAttributes | null`:
  - Return null if no KB groups present
  - Parse each group with type safety
- Implement individual group parsers:
  - `parseThaiContext(json: any): ThaiClimateContext` - 11 fields including nested `coverage`, `thaiDayColors`
  - `parseVisualMatching(json: any): VisualMatchingAttributes` - 13 fields including nested `proportionEffect`
  - `parseCrossProductCompatibility(json: any): CrossProductCompatibility` - 10 fields including arrays
  - `parsePriceIntelligence(json: any): PriceIntelligence` - 11 fields
  - `parseSocialProof(json: any): SocialProofSignals` - 11+ fields including arrays

### 3. Add KB Enum Validation to Parser
- In `kb-attribute-parser.ts`, add enum validation functions:
- `validateThaiContextEnums(ctx: ThaiClimateContext): string[]` - Validate weddingAppropriate, songkranSuitable, cnySuitable, coverage types
- `validateVisualMatchingEnums(vm: VisualMatchingAttributes): string[]` - Validate silhouetteShape, silhouetteFit, silhouetteVolume, visualWeightLevel, proportionRatio, textureType, outfitRoleType
- `validateCrossProductEnums(cp: CrossProductCompatibility): string[]` - Validate layerCompatibility[], outfitCompleteness
- `validatePriceIntelligenceEnums(pi: PriceIntelligence): string[]` - Validate costPerWearTier, qualityTier, saleLikelihood, valueTier
- `validateSocialProofEnums(sp: SocialProofSignals): string[]` - Validate popularityTier, trendStatus
- `validateAllKBEnums(kb: KBExpansionAttributes): string[]` - Aggregate all validations, return error array

### 4. Update ProductMasterItem Interface in server-product-loader.ts
- Import new types from `kb-expansion-types.ts`
- Replace current `ProductMasterItem` interface with union: `ProductMasterV0Item | ProductMasterV1Item`
- Add import for `parseKBAttributes`, `validateAllKBEnums` from `kb-attribute-parser.ts`

### 5. Add Version Detection Logic
- In `loadProductsServerSide()`, add version detection helper:
  ```typescript
  function detectProductVersion(item: ProductMasterV0Item | ProductMasterV1Item): ProductVersion {
    return 'thaiContext' in item || 'visualMatching' in item ||
           'crossProductCompatibility' in item || 'priceIntelligence' in item ||
           'socialProof' in item ? 'v1' : 'v0'
  }
  ```
- Version detection happens per-product (mixed v0/v1 in same file supported)

### 6. Update File Path Logic for v1 Priority
- In `loadProductsServerSide()`, update file discovery:
  ```typescript
  const possibleFiles = [
    'product_master_v1.json',  // Try v1 first
    'product_master.json',      // Fallback to v0
  ]
  ```
- Iterate `possibleFiles` array, use first existing file
- Log which file is loaded: `[ServerProductLoader] Using ${fileName}`

### 7. Integrate KB Attribute Parsing into Transformation Loop
- In the product transformation loop, after `transformCentralProduct()`:
  - Detect product version
  - If v1: call `parseKBAttributes(item)` and merge into transformed product
  - If v1: call `validateAllKBEnums(kbAttrs)` and log warnings for invalid values
  - If v0: continue to enrichment (existing behavior)
- Merge KB attributes:
  ```typescript
  transformed = {
    ...transformed,
    thaiContext: kbAttrs.thaiContext,
    visualMatching: kbAttrs.visualMatching,
    crossProductCompatibility: kbAttrs.crossProductCompatibility,
    priceIntelligence: kbAttrs.priceIntelligence,
    socialProof: kbAttrs.socialProof,
  }
  ```

### 8. Update product-enrichment.ts for Conditional Enrichment
- Add `hasKBAttributes(product: Partial<EnhancedProduct>): boolean` helper:
  ```typescript
  function hasKBAttributes(product: Partial<EnhancedProduct>): boolean {
    return !!(
      product.thaiContext ||
      product.visualMatching ||
      product.crossProductCompatibility ||
      product.priceIntelligence ||
      product.socialProof
    )
  }
  ```
- Modify `enrichProductData()` to skip enrichment when KB attributes present:
  - Add early return at function start if `hasKBAttributes(product)` is true
  - Log: `[Enrichment] Skipping - KB attributes present`
- Export `hasKBAttributes` for use in server-product-loader.ts

### 9. Add KB Attribute Validation to product-validator.ts
- Add `validateKBAttributes(product: Partial<EnhancedProduct>): ValidationResult`:
  - ThaiContext: `thaiClimateRating` 1-10, `monthSuitability` length 12
  - VisualMatching: `visualWeightScore` 1-10, `thaiProportionScore` 1-10
  - CrossProduct: `pairingScore` 0-100, `versatilityScore` 1-10
  - PriceIntelligence: `qualityTier` 1-5, `timelessScore` 1-10
  - SocialProof: `popularityScore` 0-100, `recommendRate` 0-100
- Call `validateKBAttributes()` from `validateProduct()` if KB attributes present
- Make KB validation optional (don't require KB for v0 products)

### 10. Add Logging and Version Distribution Metrics
- In `loadProductsServerSide()`, after processing all products:
  ```typescript
  const v0Count = enhancedProducts.filter(p => !hasKBAttributes(p)).length
  const v1Count = enhancedProducts.filter(p => hasKBAttributes(p)).length
  console.log(`[ServerProductLoader] Version distribution:`)
  console.log(`  - V0 products (enriched): ${v0Count}`)
  console.log(`  - V1 products (KB-enriched): ${v1Count}`)
  console.log(`  - Total enhanced products: ${enhancedProducts.length}`)
  ```
- Log KB enum validation warnings (non-blocking)
- Log parse errors with product SKU for debugging

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/OOTD/apps/web && pnpm exec tsc --noEmit` - TypeScript compilation (ensure no type errors)

- `cd /Users/naruechon/OOTD/apps/web && pnpm build` - Full production build to verify no build errors

- Verify v1 file loading (Node.js):
  ```bash
  cd /Users/naruechon/OOTD/apps/web
  node -e "
  const fs = require('fs');
  const v1 = JSON.parse(fs.readFileSync('../../data/products/product_master_v1.json'));
  console.log('V1 products:', v1.length);
  console.log('Has KB attrs:', v1[0].thaiContext ? 'Yes' : 'No');
  console.log('Sample thaiClimateRating:', v1[0].thaiContext?.thaiClimateRating);
  "
  ```

- Verify backward compatibility (rename v1, test with v0):
  ```bash
  cd /Users/naruechon/OOTD/data/products
  mv product_master_v1.json product_master_v1.json.bak
  cd /Users/naruechon/OOTD/apps/web && pnpm dev
  # Visit http://localhost:3000, verify app loads
  # Ctrl+C to stop
  cd /Users/naruechon/OOTD/data/products
  mv product_master_v1.json.bak product_master_v1.json
  ```

- Verify product count parity:
  ```bash
  cd /Users/naruechon/OOTD
  node -e "
  const fs = require('fs');
  const v0 = JSON.parse(fs.readFileSync('data/products/product_master.json'));
  const v1 = JSON.parse(fs.readFileSync('data/products/product_master_v1.json'));
  console.log('V0 products:', v0.length);
  console.log('V1 products:', v1.length);
  console.log('Match:', v0.length === v1.length ? '✅' : '❌');
  "
  ```

- Run linting:
  ```bash
  cd /Users/naruechon/OOTD/apps/web && pnpm lint
  ```

## Notes

### Backward Compatibility Strategy
- **Dual file support**: Try v1 first, fallback to v0 if v1 missing
- **Optional KB attributes**: All KB groups are optional in TypeScript interfaces
- **Enrichment fallback**: V0 products still use existing enrichment pipeline
- **No breaking changes**: Existing code continues to work unchanged
- **Mixed format support**: Can load products with mixed v0/v1 records

### Performance Considerations
- **Parsing overhead**: KB attribute parsing adds ~10-20ms per product
- **Memory footprint**: V1 products are ~10x larger in memory (~25MB total vs ~2.5MB for v0)
- **Future optimization**: Consider caching parsed products if load time becomes issue

### Error Handling Strategy
- **Invalid enum values**: Log warnings but don't reject products (graceful degradation)
- **Missing KB groups**: Gracefully fallback to enrichment pipeline
- **Malformed JSON**: Skip individual products, don't crash entire load
- **Type mismatches**: Coerce when safe (e.g., string to number), warn when not

### KB Expansion Groups Reference
| Group | Attributes | Key Fields |
|-------|-----------|------------|
| thaiContext | 11 | thaiClimateRating, templeAppropriate, coverage |
| visualMatching | 13 | silhouetteShape, visualWeightScore, outfitRoleType |
| crossProductCompatibility | 10 | pairingScore, outfitCompleteness, layerCompatibility[] |
| priceIntelligence | 11 | costPerWear, qualityTier, isInvestmentPiece |
| socialProof | 11+ | popularityScore, trendStatus, celebrityAssociations[] |

### Testing Checklist
- [ ] TypeScript compiles without errors
- [ ] Production build succeeds
- [ ] Products load successfully from v1 format
- [ ] Backward compatibility with v0 format
- [ ] Enum validation catches invalid values (logged, not blocking)
- [ ] KB attributes properly merged into EnhancedProduct
- [ ] Enrichment skipped when KB present (logged)
- [ ] No data loss (same product count: 2,594)
- [ ] Console logs show version distribution
- [ ] Linting passes
