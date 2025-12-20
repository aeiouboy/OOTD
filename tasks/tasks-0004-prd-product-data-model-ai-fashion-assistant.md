# Tasks for PRD-0004: Product Data Model for AI Fashion Assistant

## Relevant Files

### Type Definitions
- `frontend/lib/types.ts` - Main type definitions file, needs expansion with new Product interface
- `frontend/lib/types/product-types.ts` - New file for comprehensive product type definitions
- `frontend/lib/types/enums.ts` - New file for all enum types (occasions, categories, styles, etc.)
- `frontend/lib/types/localization-types.ts` - New file for bilingual content structure

### Validation & Schema
- `frontend/lib/validation/product-validator.ts` - New file for product validation logic
- `frontend/lib/validation/product-validator.test.ts` - Unit tests for validation
- `frontend/lib/validation/schemas.ts` - New file for validation schemas and rules

### Data Transformation
- `frontend/lib/transformers/central-to-product.ts` - New file to transform Central scraped data to product model
- `frontend/lib/transformers/central-to-product.test.ts` - Unit tests for transformer
- `frontend/lib/transformers/product-enrichment.ts` - New file for enriching product data with inferred attributes

### Categorization & Tagging
- `frontend/lib/categorization/category-hierarchy.ts` - New file defining category structure
- `frontend/lib/categorization/occasion-mapper.ts` - New file mapping products to occasions
- `frontend/lib/categorization/occasion-mapper.test.ts` - Unit tests for occasion mapping
- `frontend/lib/categorization/style-tagger.ts` - New file for style attribute tagging

### Utilities
- `frontend/lib/utils/product-utils.ts` - Existing file, needs enhancement for new model
- `frontend/lib/utils/product-filters.ts` - New file for advanced filtering logic
- `frontend/lib/utils/product-filters.test.ts` - Unit tests for filters
- `frontend/lib/utils/ai-serializer.ts` - New file for AI-friendly product format
- `frontend/lib/utils/thai-formatter.ts` - New file for Thai currency and text formatting

### Data & Integration
- `frontend/lib/product-data.ts` - Existing file, needs updates for new model
- `frontend/lib/product-loader.ts` - Existing file, update to handle enhanced data
- `frontend/lib/constants/occasions.ts` - New file with 9 occasion definitions from Python code
- `frontend/lib/constants/categories.ts` - New file with category hierarchies

### Existing Files to Update
- `frontend/lib/api-mock.ts` - Update mock API to return enhanced product data
- `frontend/lib/mock-data.ts` - Update mock data to match new product structure
- `frontend/lib/outfit-generator.ts` - Update to work with enhanced product attributes

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` or `pnpm test` to run all tests
- Focus on Phase 1 (MVP) requirements first - core fields and essential attributes
- Maintain backward compatibility where possible by making new fields optional initially

---

## Tasks

### Phase 1: Core Model (MVP)

- [ ] 1.0 Define comprehensive TypeScript interfaces and types for the enhanced product data model
  - [ ] 1.1 Create `frontend/lib/types/enums.ts` with all enum types (Availability, Gender, OccasionType, SeasonType, FormalityLevel, FitType, StyleTag, PatternType, BrandTier, OutfitRole)
  - [ ] 1.2 Create `frontend/lib/types/localization-types.ts` with `LocalizedText` interface for Thai/English bilingual content
  - [ ] 1.3 Create `frontend/lib/types/product-types.ts` with comprehensive `EnhancedProduct` interface including all FR-001 through FR-060 requirements
  - [ ] 1.4 Define nested interfaces for grouped attributes (`PricingInfo`, `ClassificationInfo`, `StyleAttributes`, `AvailabilityInfo`, `ThaiMarketInfo`, `CentralIntegration`)
  - [ ] 1.5 Create `frontend/lib/constants/occasions.ts` with the 9 occasion definitions matching `occasion_expertise.py`
  - [ ] 1.6 Create `frontend/lib/constants/categories.ts` with hierarchical category structure (4 levels: Department > Category > Subcategory > Type)
  - [ ] 1.7 Update `frontend/lib/types.ts` to export all new types and maintain backward compatibility with existing `Product` interface

- [ ] 2.0 Create validation utilities and schema validators for product data integrity
  - [ ] 2.1 Create `frontend/lib/validation/schemas.ts` defining validation rules for all required vs optional fields
  - [ ] 2.2 Implement `validateProduct()` function in `frontend/lib/validation/product-validator.ts` that checks all FR-049 through FR-054 requirements
  - [ ] 2.3 Create type guard functions (`isValidProduct()`, `isEnhancedProduct()`) for runtime type checking
  - [ ] 2.4 Implement field-specific validators (`validatePrice()`, `validateImageUrl()`, `validateCategory()`, `validateEnum()`)
  - [ ] 2.5 Create `ProductValidationError` class with detailed error messages for debugging
  - [ ] 2.6 Write comprehensive unit tests in `frontend/lib/validation/product-validator.test.ts` covering valid/invalid cases for each field type
  - [ ] 2.7 Add validation summary function that returns all validation errors (not just first failure)

- [ ] 3.0 Implement data transformation layer to map scraped Central data to enhanced model
  - [ ] 3.1 Create `transformCentralProduct()` function in `frontend/lib/transformers/central-to-product.ts` that maps raw scraped JSON to `EnhancedProduct`
  - [ ] 3.2 Implement field mapping logic: `product_name` → `name.th`, `product_link` → `centralIntegration.productUrl`, `product_price` → `pricing.currentPrice`
  - [ ] 3.3 Add price parsing logic to handle Thai Baht format ("฿2,295" → 2295)
  - [ ] 3.4 Implement SKU extraction from Central product URLs (extract unique identifier from URL structure)
  - [ ] 3.5 Create `enrichProductData()` function in `frontend/lib/transformers/product-enrichment.ts` for inferring missing attributes
  - [ ] 3.6 Implement gender detection logic based on product source file (men's vs women's JSON)
  - [ ] 3.7 Add default values for required fields when scraped data is incomplete (e.g., availability = "in_stock" if not specified)
  - [ ] 3.8 Write unit tests in `frontend/lib/transformers/central-to-product.test.ts` using actual samples from `products/central-men-clothing.json`

- [ ] 4.0 Build product categorization and tagging system with occasion mapping
  - [ ] 4.1 Define hierarchical category structure in `frontend/lib/categorization/category-hierarchy.ts` based on Central's categories
  - [ ] 4.2 Create `parseCategory()` function that extracts category hierarchy from product names/descriptions
  - [ ] 4.3 Implement `mapProductToOccasions()` in `frontend/lib/categorization/occasion-mapper.ts` that assigns occasion tags based on product attributes
  - [ ] 4.4 Create occasion inference rules: formal wear → wedding/dinner, polo shirts → work/chill, sportswear → sport, etc.
  - [ ] 4.5 Implement `calculateFormalityLevel()` function (1-10 scale) based on product type, style, and occasion
  - [ ] 4.6 Create `assignStyleTags()` in `frontend/lib/categorization/style-tagger.ts` for style attributes (modern, classic, trendy, etc.)
  - [ ] 4.7 Implement `determineOutfitRole()` function to classify products as top/bottom/dress/outerwear/footwear/accessory
  - [ ] 4.8 Write unit tests in `frontend/lib/categorization/occasion-mapper.test.ts` verifying correct occasion assignments

- [ ] 5.0 Create product utilities for filtering, querying, and AI-ready serialization
  - [ ] 5.1 Enhance `frontend/lib/utils/product-utils.ts` with new utility functions for enhanced product model
  - [ ] 5.2 Create `filterByOccasion()` function in `frontend/lib/utils/product-filters.ts` that filters products by occasion tags
  - [ ] 5.3 Implement `filterByStyle()`, `filterByPriceRange()`, `filterByFormality()`, `filterBySeason()` functions
  - [ ] 5.4 Create `searchProductsEnhanced()` that searches across Thai and English names, descriptions, brands, and tags
  - [ ] 5.5 Implement `sortProducts()` with multiple sort options (price, formality, popularity, relevance)
  - [ ] 5.6 Create `serializeForAI()` in `frontend/lib/utils/ai-serializer.ts` that creates token-efficient product summaries for AI prompts
  - [ ] 5.7 Implement `formatThaiPrice()` in `frontend/lib/utils/thai-formatter.ts` for proper Thai Baht formatting with commas
  - [ ] 5.8 Create `getProductSummary()` function that returns human-readable product description for AI context
  - [ ] 5.9 Write unit tests in `frontend/lib/utils/product-filters.test.ts` covering all filter combinations

- [ ] 6.0 Update existing components and services to use the new product model
  - [ ] 6.1 Update `frontend/lib/product-data.ts` to use `EnhancedProduct` type instead of basic `Product`
  - [ ] 6.2 Modify `getAllProducts()`, `getProductsByGender()`, `getProductBySKU()` to work with enhanced model
  - [ ] 6.3 Update `frontend/lib/product-loader.ts` to load and validate products using new validation layer
  - [ ] 6.4 Add transformation step in loader: scraped data → validation → enhanced product model
  - [ ] 6.5 Update `frontend/lib/mock-data.ts` to include sample products with all new required fields
  - [ ] 6.6 Modify `frontend/lib/api-mock.ts` `MockFashionAPI.searchProducts()` to use new filtering utilities
  - [ ] 6.7 Update `frontend/lib/outfit-generator.ts` to leverage new attributes (formality, occasion, style) for better outfit matching
  - [ ] 6.8 Ensure backward compatibility: existing components using basic `Product` interface should still work
  - [ ] 6.9 Run full test suite to verify no breaking changes: `npm test`
  - [ ] 6.10 Update mock data with at least 5 fully populated example products covering different occasions and styles