# Chore: Update server-product-loader.ts to Support KB Expansion Attributes

## Metadata
adw_id: `kb002`
prompt: `Update server-product-loader.ts ให้รองรับ KB expansion attributes from product_master_v1.json`

## Chore Description

This chore updates the server-side product loading pipeline to parse and validate the new `product_master_v1.json` format with 120 KB expansion attributes. The loader must transform the JSON structure into the TypeScript `EnhancedProduct` interface while maintaining backward compatibility with the legacy `product_master.json` format.

### Current State
- **server-product-loader.ts** (117 lines) loads `product_master.json` and transforms to `EnhancedProduct[]`
- Current transformation pipeline:
  1. Load JSON → `ProductMasterItem[]` (9 basic attributes)
  2. Transform → scraped product structure → `transformCentralProduct()`
  3. Enrich → `enrichProductData()` (infers attributes from name/description)
  4. Validate → `validateProduct()`
  5. Output → `EnhancedProduct[]`

### Target State
- Support both `product_master.json` (legacy) and `product_master_v1.json` (KB-enriched)
- Parse 5 KB expansion groups from JSON into TypeScript interfaces
- Validate KB attribute types and enums
- Fallback to enrichment pipeline if KB attributes missing
- Maintain 100% backward compatibility with existing code

### Dependencies
- **Prerequisite**: chore-kb001 must be completed (`product_master_v1.json` created)
- **Blocks**: chore-kb003 (AI matching integration requires loaded KB attributes)

## Relevant Files

### Files to Modify

#### apps/web/lib/server-product-loader.ts (117 lines)
Current responsibilities:
- Load `product_master.json` from filesystem
- Parse JSON and transform to `EnhancedProduct[]`
- Handle gender detection (men_clothing vs women_clothing)
- Apply enrichment for missing attributes
- Validate products before returning

Required changes:
- Update `ProductMasterItem` interface to include optional KB expansion groups
- Add KB attribute parsing logic
- Implement fallback chain: KB attributes → enrichment → defaults
- Add version detection (v1 vs v0 format)

#### apps/web/lib/transformers/product-enrichment.ts (427 lines)
Current responsibilities:
- Infer category, outfit role, style attributes from product name
- Calculate formality level (1-10)
- Infer occasions based on formality
- Detect seasonality from product description

Required changes:
- Skip enrichment if KB attributes already present
- Add helper function `hasKBAttributes(product)` to detect v1 format
- Preserve existing enrichment for v0 format (backward compatibility)

#### apps/web/lib/validation/product-validator.ts
Current responsibilities:
- Validate required fields (id, sku, name, price)
- Check data types and formats
- Return validation result with errors

Required changes:
- Add KB attribute validation rules
- Validate enum values against TypeScript definitions
- Check nested object structure (thaiContext.coverage, visualMatching.proportionEffect)
- Optional validation (KB attributes can be missing for v0 format)

### Files to Create

#### apps/web/lib/transformers/kb-attribute-parser.ts
New transformer to parse KB expansion groups from JSON:
```typescript
/**
 * Parse KB expansion attributes from product_master_v1.json
 */
export function parseKBAttributes(productJson: any): KBExpansionAttributes | null {
  // Parse thaiContext
  // Parse visualMatching
  // Parse crossProductCompatibility
  // Parse priceIntelligence
  // Parse socialProof
  // Return null if not v1 format
}

export function validateKBEnums(kbAttrs: KBExpansionAttributes): ValidationResult {
  // Validate all enum values match TypeScript definitions
}
```

#### apps/web/lib/types/kb-expansion-types.ts
Consolidated KB attribute interfaces:
```typescript
/**
 * Complete KB Expansion Attributes (54 sub-attributes across 5 groups)
 */
export interface KBExpansionAttributes {
  thaiContext: ThaiClimateContext
  visualMatching: VisualMatchingAttributes
  crossProductCompatibility: CrossProductCompatibility
  priceIntelligence: PriceIntelligence
  socialProof: SocialProofSignals
}

export type ProductVersion = 'v0' | 'v1'

export interface ProductMasterV1Item extends ProductMasterV0Item {
  thaiContext?: ThaiClimateContext
  visualMatching?: VisualMatchingAttributes
  crossProductCompatibility?: CrossProductCompatibility
  priceIntelligence?: PriceIntelligence
  socialProof?: SocialProofSignals
}
```

### Reference Files (No Changes)
- **apps/web/lib/types/thai-context-types.ts** - ThaiClimateContext interface definition
- **apps/web/lib/types/ai-matching-types.ts** - Visual matching, compatibility, price, social proof interfaces
- **apps/web/lib/types/enums.ts** - All enum definitions for validation
- **apps/web/lib/types/product-types.ts** - EnhancedProduct interface (should already support KB attributes if properly structured)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create KB Attribute Type Definitions
- Create `apps/web/lib/types/kb-expansion-types.ts`:
  - Define `KBExpansionAttributes` interface aggregating 5 KB groups
  - Define `ProductVersion` type ('v0' | 'v1')
  - Define `ProductMasterV0Item` interface (current 9 attributes)
  - Define `ProductMasterV1Item` extending V0 with optional KB groups
  - Export helper type guards: `isProductV1(item: any): item is ProductMasterV1Item`

### 2. Create KB Attribute Parser
- Create `apps/web/lib/transformers/kb-attribute-parser.ts`:
  - Implement `parseKBAttributes(productJson: any): KBExpansionAttributes | null`:
    - Check if product has KB groups (thaiContext, visualMatching, etc.)
    - Parse each group with type safety
    - Return null if missing or invalid
  - Implement `parseThaiContext(json: any): ThaiClimateContext`:
    - Parse all 11 thaiContext fields
    - Handle nested objects (coverage, thaiDayColors)
    - Validate data types
  - Implement `parseVisualMatching(json: any): VisualMatchingAttributes`:
    - Parse all 11 visualMatching fields
    - Handle proportionEffect nested object
  - Implement `parseCrossProductCompatibility(json: any): CrossProductCompatibility`:
    - Parse all 10 compatibility fields
    - Handle arrays (essentialPairings, commonPairings)
  - Implement `parsePriceIntelligence(json: any): PriceIntelligence`:
    - Parse all 11 price intelligence fields
  - Implement `parseSocialProof(json: any): SocialProofSignals`:
    - Parse all 10 social proof fields
    - Handle arrays (celebrityAssociations, hashtagTrending)

### 3. Add KB Enum Validation
- In `kb-attribute-parser.ts`, add enum validation functions:
  - `validateThaiContextEnums(ctx: ThaiClimateContext): string[]`:
    - Validate weddingAppropriate, songkranSuitable, coverage types
    - Return array of validation error messages
  - `validateVisualMatchingEnums(vm: VisualMatchingAttributes): string[]`:
    - Validate silhouetteShape, silhouetteFit, silhouetteVolume, visualWeightLevel, proportionRatio, textureType, outfitRoleType
  - `validateCrossProductEnums(cp: CrossProductCompatibility): string[]`:
    - Validate layerCompatibility, outfitCompleteness
  - `validatePriceIntelligenceEnums(pi: PriceIntelligence): string[]`:
    - Validate costPerWearTier, qualityTier, saleLikelihood, valueTier
  - `validateSocialProofEnums(sp: SocialProofSignals): string[]`:
    - Validate popularityTier, trendStatus
  - `validateAllKBEnums(kb: KBExpansionAttributes): string[]`:
    - Aggregate all enum validations
    - Return combined error array

### 4. Update ProductMasterItem Interface in server-product-loader.ts
- Modify `ProductMasterItem` interface to support v1 format:
  ```typescript
  interface ProductMasterItem {
    // V0 attributes (required)
    category: string
    price: string
    original_price: string
    brand: string
    product_name: string
    link: string
    image_url: string
    availability: string
    product_description: string

    // V1 KB expansion attributes (optional)
    thaiContext?: any
    visualMatching?: any
    crossProductCompatibility?: any
    priceIntelligence?: any
    socialProof?: any
  }
  ```

### 5. Add Version Detection Logic
- In `loadProductsServerSide()`, add version detection:
  ```typescript
  function detectProductVersion(item: ProductMasterItem): ProductVersion {
    return item.thaiContext || item.visualMatching ||
           item.crossProductCompatibility || item.priceIntelligence ||
           item.socialProof ? 'v1' : 'v0'
  }
  ```

### 6. Integrate KB Attribute Parsing into Load Pipeline
- In `loadProductsServerSide()`, update transformation pipeline:
  ```typescript
  for (const item of masterData) {
    try {
      const version = detectProductVersion(item)

      // Step 1: Transform basic attributes (existing logic)
      let transformed = transformCentralProduct(scrapedProduct, { gender })

      // Step 2: Parse KB attributes if v1
      if (version === 'v1') {
        const kbAttrs = parseKBAttributes(item)
        if (kbAttrs) {
          // Merge KB attributes into transformed product
          transformed = {
            ...transformed,
            thaiContext: kbAttrs.thaiContext,
            visualMatching: kbAttrs.visualMatching,
            crossProductCompatibility: kbAttrs.crossProductCompatibility,
            priceIntelligence: kbAttrs.priceIntelligence,
            socialProof: kbAttrs.socialProof,
          }

          // Validate KB enums
          const enumErrors = validateAllKBEnums(kbAttrs)
          if (enumErrors.length > 0) {
            console.warn(`[KB Validation] ${item.product_name}:`, enumErrors)
          }
        }
      }

      // Step 3: Enrich missing attributes (existing logic, skip if KB present)
      if (version === 'v0') {
        transformed = enrichProductData(transformed)
      }

      // Step 4: Validate (existing logic)
      const validation = validateProduct(transformed)
      if (validation.valid) {
        enhancedProducts.push(transformed as EnhancedProduct)
      }
    } catch (error) {
      console.error(`[ServerProductLoader] Error transforming ${item.product_name}:`, error)
    }
  }
  ```

### 7. Update product-enrichment.ts for Conditional Enrichment
- In `enrichProductData()`, add KB attribute detection:
  ```typescript
  export function enrichProductData(product: Partial<EnhancedProduct>): Partial<EnhancedProduct> {
    const enriched = { ...product }

    // Skip enrichment if product already has KB attributes
    if (hasKBAttributes(product)) {
      console.log('[Enrichment] Skipping - KB attributes present')
      return enriched
    }

    // Existing enrichment logic...
  }

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

### 8. Update product-validator.ts for KB Validation
- Add KB attribute validation rules:
  ```typescript
  export function validateKBAttributes(product: Partial<EnhancedProduct>): ValidationResult {
    const errors: string[] = []

    // ThaiContext validation
    if (product.thaiContext) {
      if (product.thaiContext.thaiClimateRating < 1 || product.thaiContext.thaiClimateRating > 10) {
        errors.push('thaiClimateRating must be 1-10')
      }
      if (product.thaiContext.monthSuitability?.length !== 12) {
        errors.push('monthSuitability must have 12 values')
      }
    }

    // VisualMatching validation
    if (product.visualMatching) {
      if (product.visualMatching.visualWeightScore < 1 || product.visualMatching.visualWeightScore > 10) {
        errors.push('visualWeightScore must be 1-10')
      }
    }

    // CrossProductCompatibility validation
    if (product.crossProductCompatibility) {
      if (product.crossProductCompatibility.pairingScore < 0 || product.crossProductCompatibility.pairingScore > 100) {
        errors.push('pairingScore must be 0-100')
      }
    }

    // PriceIntelligence validation
    if (product.priceIntelligence) {
      if (product.priceIntelligence.qualityTier < 1 || product.priceIntelligence.qualityTier > 5) {
        errors.push('qualityTier must be 1-5')
      }
    }

    // SocialProof validation
    if (product.socialProof) {
      if (product.socialProof.popularityScore < 0 || product.socialProof.popularityScore > 100) {
        errors.push('popularityScore must be 0-100')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
  ```

### 9. Add Logging and Metrics
- In `loadProductsServerSide()`, add detailed logging:
  ```typescript
  const v0Count = enhancedProducts.filter(p => !hasKBAttributes(p)).length
  const v1Count = enhancedProducts.filter(p => hasKBAttributes(p)).length

  console.log(`[ServerProductLoader] Version distribution:`)
  console.log(`  - V0 products (enriched): ${v0Count}`)
  console.log(`  - V1 products (KB-enriched): ${v1Count}`)
  console.log(`  - Total enhanced products: ${enhancedProducts.length}`)
  ```

### 10. Update Configuration to Use product_master_v1.json
- In `loadProductsServerSide()`, update file path logic:
  ```typescript
  // Try v1 first, fallback to v0
  const possibleFiles = [
    'product_master_v1.json',  // NEW: Try v1 first
    'product_master.json',      // Fallback to v0
  ]

  let productMasterPath = ''
  for (const fileName of possibleFiles) {
    const testPath = path.join(productsDir, fileName)
    if (fs.existsSync(testPath)) {
      productMasterPath = testPath
      console.log(`[ServerProductLoader] Using ${fileName}`)
      break
    }
  }
  ```

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# 1. TypeScript compilation (ensure no type errors)
cd /Users/naruechon/OOTD/apps/web
pnpm exec tsc --noEmit

# 2. Test product loading with v1 format
node -e "
const { loadProductsServerSide } = require('./lib/server-product-loader');
loadProductsServerSide().then(products => {
  console.log('Total products:', products.length);
  const withKB = products.filter(p => p.thaiContext).length;
  console.log('Products with KB attributes:', withKB);
  console.log('Sample product:', JSON.stringify(products[0], null, 2));
});
"

# 3. Verify backward compatibility (should work with product_master.json)
cd /Users/naruechon/OOTD/data/products
mv product_master_v1.json product_master_v1.json.bak
# Run app - should still work with v0
cd /Users/naruechon/OOTD/apps/web
pnpm dev
# Visit http://localhost:3000 and test chat functionality
# Ctrl+C to stop
cd /Users/naruechon/OOTD/data/products
mv product_master_v1.json.bak product_master_v1.json

# 4. Test enum validation
node -e "
const { parseKBAttributes, validateAllKBEnums } = require('./lib/transformers/kb-attribute-parser');
const testProduct = {
  thaiContext: { songkranSuitable: 'invalid-value' }
};
const kb = parseKBAttributes(testProduct);
const errors = validateAllKBEnums(kb);
console.log('Validation errors:', errors);
// Should output errors for invalid enum value
"

# 5. Check console logs for version distribution
# After running the app, check logs for:
# "[ServerProductLoader] Version distribution:"
# "V0 products (enriched): X"
# "V1 products (KB-enriched): Y"

# 6. Verify no data loss
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

## Notes

### Backward Compatibility Strategy
- **Dual file support**: Try v1 first, fallback to v0
- **Optional KB attributes**: All KB groups are optional in TypeScript interfaces
- **Enrichment fallback**: V0 products still use existing enrichment pipeline
- **No breaking changes**: Existing code continues to work unchanged

### Performance Considerations
- **Parsing overhead**: KB attribute parsing adds ~10-20ms per product
  - Total load time increase: ~25-50 seconds for 2,594 products
  - Consider caching strategy in future optimization
- **Memory footprint**: V1 products are ~10x larger in memory
  - Current: 2,594 products × ~1 KB = 2.5 MB
  - V1: 2,594 products × ~10 KB = 25 MB
  - Still acceptable for server-side operations

### Error Handling
- **Invalid enum values**: Log warnings but don't reject products
- **Missing KB groups**: Gracefully fallback to enrichment
- **Malformed JSON**: Skip individual products, don't crash entire load
- **Type mismatches**: Coerce when safe, warn when not

### Logging Strategy
- **Version detection**: Log v0 vs v1 count on every load
- **Enum validation**: Warn for each invalid enum value
- **Parse errors**: Log product SKU and error details
- **Performance metrics**: Log total load time and KB parsing time

### Testing Checklist
- [ ] TypeScript compiles without errors
- [ ] Products load successfully from v1 format
- [ ] Backward compatibility with v0 format
- [ ] Enum validation catches invalid values
- [ ] KB attributes properly merged into EnhancedProduct
- [ ] Enrichment skipped when KB present
- [ ] No data loss (same product count)
- [ ] Chat API still works with loaded products
- [ ] Console logs show version distribution
