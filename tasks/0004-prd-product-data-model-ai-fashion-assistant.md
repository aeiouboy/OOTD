# PRD-0004: Product Data Model for AI Fashion Assistant

## 1. Introduction/Overview

The OOTDay AI Fashion Assistant requires a comprehensive, structured product data model to enable accurate outfit recommendations based on system dialog. Currently, the product data scraped from Central Group and the frontend data structures are inconsistent and lack the necessary attributes for intelligent AI-driven fashion recommendations.

This PRD defines a unified product data model that will serve as the foundation for the AI fashion assistant to:
- Accurately match products to user occasions and preferences
- Generate contextually appropriate outfit combinations
- Provide rich product information for user decision-making
- Support the Thai market with localized data and cultural considerations

**Problem Statement:** The AI fashion assistant needs to recommend correct products in complete outfits based on user dialog about occasions, preferences, and context. The current data model is too simple and doesn't contain the semantic attributes required for intelligent matching.

**Goal:** Create a comprehensive product data model that enables the AI to understand product attributes deeply enough to make intelligent outfit recommendations aligned with Thai fashion sensibilities and user needs.

---

## 2. Goals

1. **Unified Data Structure:** Create a single, consistent product data model that works seamlessly in the TypeScript frontend
2. **AI-Ready Attributes:** Include all necessary attributes (color, style, season, formality, etc.) that enable intelligent product matching
3. **Occasion Mapping:** Support both explicit occasion tags and AI-inferable style attributes for dynamic occasion matching
4. **Multi-Classification:** Implement hierarchical categorization plus flexible tagging system for versatile product organization
5. **Thai Market Support:** Include Thai language support, sizing standards, and cultural appropriateness indicators
6. **Central Integration:** Preserve all Central Group product identifiers, URLs, and availability data
7. **Future-Ready:** Design for extensibility to support upcoming features (reviews, favorites, virtual try-on, sustainability)
8. **Performance Optimized:** Structure data for efficient querying, filtering, and bulk AI processing

---

## 3. User Stories

### For AI System
- As an AI fashion assistant, I need to understand product formality levels so that I can recommend appropriate items for different occasions
- As an AI system, I need to know product color attributes so that I can create harmonious outfit combinations
- As an AI, I need product season/weather data so that I can recommend climate-appropriate clothing
- As an AI, I need to understand product style attributes so that I can match user aesthetic preferences

### For End Users (via AI recommendations)
- As a user asking for "work outfit," I want to receive products appropriate for Thai workplace culture
- As a user specifying "wedding guest," I want recommendations that respect Thai wedding etiquette (no white/black)
- As a user on a budget, I want to see pricing clearly with any discounts or promotions
- As a Thai user, I want to see product names and descriptions in Thai language

### For Developers
- As a frontend developer, I need a TypeScript interface that's type-safe and autocomplete-friendly
- As a developer, I need clear validation rules so that I can ensure data quality
- As a developer integrating with Central, I need to preserve all Central-specific identifiers and URLs

---

## 4. Functional Requirements

### 4.1 Core Product Information
1. **FR-001:** Each product MUST have a unique identifier (`id` or `sku`)
2. **FR-002:** Each product MUST have a product name in at least one language (Thai or English)
3. **FR-003:** Each product SHOULD have product names in both Thai and English
4. **FR-004:** Each product MUST have at least one product image URL
5. **FR-005:** Each product SHOULD support multiple image URLs (front, back, detail shots)
6. **FR-006:** Each product MUST have a current price as a positive number
7. **FR-007:** Each product MAY have an original price (for showing discounts)
8. **FR-008:** Each product MUST specify a currency (default: THB)

### 4.2 Classification & Categorization
9. **FR-009:** Each product MUST have a hierarchical category structure with at least 2 levels (e.g., "Clothing > Tops")
10. **FR-010:** Category hierarchy SHOULD support up to 4 levels (Department > Category > Subcategory > Type)
11. **FR-011:** Each product MUST have a gender/target demographic field (`men`, `women`, `unisex`, `kids`)
12. **FR-012:** Each product MUST have flexible tags for multiple classification dimensions
13. **FR-013:** Tag types MUST include: `occasion`, `style`, `season`, `formality`
14. **FR-014:** Each product SHOULD have an outfit role tag (`top`, `bottom`, `dress`, `outerwear`, `footwear`, `accessory`, `bag`)

### 4.3 Style & Aesthetic Attributes
15. **FR-015:** Each product MUST have a primary color attribute
16. **FR-016:** Each product MAY have secondary color attributes (for multi-color items)
17. **FR-017:** Each product SHOULD have pattern information (`solid`, `striped`, `floral`, `print`, etc.)
18. **FR-018:** Each product MUST have a formality level (scale 1-10: casual to formal)
19. **FR-019:** Each product MUST have style tags (e.g., `modern`, `classic`, `trendy`, `minimalist`, `bohemian`)
20. **FR-020:** Each product SHOULD have material/fabric composition information
21. **FR-021:** Each product MUST have season/weather tags (`all-season`, `hot-season`, `cool-season`, `rainy-season`)

### 4.4 Occasion & Context Mapping
22. **FR-022:** Each product MUST support explicit occasion tags (e.g., `work`, `wedding`, `chill`, `sport`, `date`)
23. **FR-023:** Each product MUST have attributes that allow AI to infer occasion suitability dynamically
24. **FR-024:** Occasion tags MUST align with the 9 occasions defined in `occasion_expertise.py`:
    - Work, Chill Day, Wedding, Sport, Travel, Date, Dinner, Cafe, Party

### 4.5 Size & Fit Information
25. **FR-025:** Each product MUST have available sizes as an array
26. **FR-026:** Size information SHOULD include both international and Thai sizing standards
27. **FR-027:** Each product SHOULD have fit description (`slim`, `regular`, `loose`, `oversized`)
28. **FR-028:** Each product MAY have detailed measurements for key sizes

### 4.6 Pricing & Availability
29. **FR-029:** Each product MUST have availability status (`in_stock`, `low_stock`, `out_of_stock`, `pre_order`)
30. **FR-030:** Each product MAY have stock quantity (if available from Central)
31. **FR-031:** Each product MUST have a product URL linking to Central's product page
32. **FR-032:** Each product MAY have promotional information (e.g., "15% off", "Buy 2 Get 1")

### 4.7 Brand & Quality Indicators
33. **FR-033:** Each product MUST have a brand name
34. **FR-034:** Each product SHOULD have a brand positioning indicator (`budget`, `mid-range`, `premium`, `luxury`)
35. **FR-035:** Each product MAY have quality/care instructions

### 4.8 Thai Market Specific
36. **FR-036:** Each product MUST indicate cultural appropriateness for Thai contexts
37. **FR-037:** Each product MAY have special flags (e.g., `temple_appropriate`, `conservative_workplace_suitable`)
38. **FR-038:** Product descriptions SHOULD consider Thai fashion sensibilities and terminology
39. **FR-039:** Each product MUST support Thai Baht currency with proper formatting

### 4.9 Central Group Integration
40. **FR-040:** Each product MUST preserve Central's product SKU/identifier
41. **FR-041:** Each product MUST have Central's product URL
42. **FR-042:** Each product MUST use Central's CDN image URLs
43. **FR-043:** Each product MAY have Central store location availability data
44. **FR-044:** Each product identifier MUST be compatible with Central's URL structure

### 4.10 Outfit Composition Support
45. **FR-045:** Products MUST be identifiable as "complete outfits" vs "individual items"
46. **FR-046:** Products MAY have "recommended pairings" or "goes well with" suggestions (array of product IDs)
47. **FR-047:** Products MUST have clear role classification for outfit building (top, bottom, complete outfit, etc.)
48. **FR-048:** System MUST support creating outfits from multiple individual products

### 4.11 Data Validation
49. **FR-049:** All required fields MUST be validated before product is accepted into the system
50. **FR-050:** Price values MUST be positive numbers
51. **FR-051:** Image URLs MUST be valid HTTP/HTTPS URLs
52. **FR-052:** Product names MUST not be empty strings
53. **FR-053:** Category paths MUST follow defined hierarchy structure
54. **FR-054:** Enum fields (availability, gender, etc.) MUST only accept predefined values

### 4.12 Extensibility & Future Features
55. **FR-055:** Data model MUST support adding user interaction fields (favorites, views, clicks)
56. **FR-056:** Data model SHOULD reserve space for review/rating aggregation
57. **FR-057:** Data model SHOULD support styling tips and wear recommendations
58. **FR-058:** Data model SHOULD accommodate sustainability/ethical fashion attributes
59. **FR-059:** Data model SHOULD support virtual try-on metadata (in future)
60. **FR-060:** All new fields SHOULD be optional to maintain backward compatibility

---

## 5. Non-Goals (Out of Scope)

1. **Backend API Implementation:** This PRD covers the data model only, not the API endpoints or backend services
2. **Database Schema:** This PRD defines TypeScript interfaces; database implementation is separate
3. **Data Migration:** Migrating existing product data to new model is out of scope
4. **Inventory Management:** Real-time inventory sync with Central's systems is not covered
5. **Product Content Management:** UI for editing/managing product data is out of scope
6. **Search Engine Implementation:** How products are indexed/searched is separate
7. **Recommendation Algorithm:** The AI logic for matching products is not defined here
8. **Price Calculation Logic:** Dynamic pricing, tax calculation, or currency conversion is not included

---

## 6. Design Considerations

### 6.1 TypeScript Interface Structure

The data model will be implemented as TypeScript interfaces in the frontend. Key design principles:

- **Type Safety:** Use TypeScript's type system for compile-time validation
- **Enums for Constants:** Use string literal unions for fixed value sets
- **Optional vs Required:** Clearly distinguish with `?` operator
- **Nested Objects:** Group related attributes into nested objects for clarity
- **Array Types:** Use arrays for multi-value fields (sizes, colors, tags)

### 6.2 Naming Conventions

- Use `camelCase` for field names (TypeScript convention)
- Use descriptive names that indicate data type and purpose
- Prefix boolean fields with `is`, `has`, or `can` where appropriate
- Use full words over abbreviations for clarity

### 6.3 Data Organization

Consider organizing attributes into logical groups:
- **Basic Info:** id, names, description, brand
- **Pricing:** price, originalPrice, currency, promotional
- **Classification:** category, gender, tags, role
- **Style:** colors, pattern, formality, styleAttributes
- **Context:** occasions, season, culturalFlags
- **Practical:** sizes, fit, material, care
- **Availability:** stock, availability, storeLocations
- **Integration:** centralSKU, productUrl, imageUrls

### 6.4 Localization Structure

For Thai/English bilingual support, consider:
```typescript
{
  name: {
    th: "เสื้อเชิ้ตแขนยาว",
    en: "Long Sleeve Shirt"
  },
  description: {
    th: "เสื้อเชิ้ตผ้าคอตตอน 100%",
    en: "100% Cotton Shirt"
  }
}
```

---

## 7. Technical Considerations

### 7.1 Frontend Integration
- Model must be compatible with existing `frontend/lib/types.ts`
- Should extend current `Product` interface without breaking changes
- Must work with React components expecting product data

### 7.2 Data Sources
- Primary source: Web scraper from Central Group website
- Secondary source: Manual curation for attributes not available from scraping
- Validation layer needed between scraper output and data model

### 7.3 Performance
- Consider data size: Each product may be 2-5KB with all attributes
- Expect 1,000-10,000 products initially, growing to 50,000+
- Frontend should support lazy loading and pagination
- Consider separating "core" vs "extended" product data

### 7.4 AI Processing
- All attributes should be easily serializable to JSON for AI prompts
- Consider creating a "product summary" format for token efficiency
- Style attributes should be human-readable for inclusion in AI prompts

---

## 8. Success Metrics

### 8.1 Data Quality Metrics
- **Completeness:** 95%+ of products have all required fields
- **Accuracy:** <5% error rate in categorization and attributes
- **Coverage:** 100% of Thai names for Thai market products
- **Image Quality:** 100% of primary images load successfully

### 8.2 AI Performance Metrics
- **Recommendation Relevance:** 80%+ of recommended products match occasion appropriately
- **Style Coherence:** 85%+ of outfit combinations are stylistically harmonious
- **User Satisfaction:** 4+ star rating on outfit recommendations
- **Cultural Appropriateness:** 100% compliance with Thai cultural guidelines

### 8.3 Technical Metrics
- **Type Safety:** Zero TypeScript compilation errors related to product model
- **Validation Pass Rate:** 98%+ of products pass validation on first attempt
- **Query Performance:** Product filtering/search completes in <500ms for 10,000 products

### 8.4 Business Metrics
- **Conversion Support:** Data model enables tracking clicks to Central product pages
- **Scalability:** Support for 50,000+ products without performance degradation
- **Extensibility:** New attributes can be added without breaking existing code

---

## 9. Open Questions

1. **Q1:** Should product descriptions be scraped automatically or require manual curation for quality?
2. **Q2:** How should we handle products that appear in multiple categories (e.g., a blazer suitable for work AND weddings)?
3. **Q3:** Should we support product variants (same product in different colors) as separate entries or linked records?
4. **Q4:** What's the priority for implementing sustainability attributes - Phase 1 or Phase 2?
5. **Q5:** Should "recommended pairings" be generated by AI or manually curated initially?
6. **Q6:** How do we handle seasonal availability (products only available certain times of year)?
7. **Q7:** Should we include product care instructions (washing, storage) in Phase 1?
8. **Q8:** How detailed should the cultural appropriateness flags be? (simple yes/no vs. detailed context)
9. **Q9:** Should we support product bundles (pre-made outfit sets sold together)?
10. **Q10:** What's the source of truth for product availability - Central's website or a separate inventory API?

---

## 10. Implementation Phases

### Phase 1: Core Model (MVP)
- Basic product information (ID, name, price, images)
- Essential categorization (category, gender, role)
- Critical style attributes (color, formality, style)
- Occasion mapping (explicit tags)
- Central integration fields
- Thai language support

### Phase 2: Enhanced Attributes
- Secondary colors and patterns
- Detailed size and fit information
- Material and care instructions
- Store location availability
- Promotional information
- Cultural appropriateness flags

### Phase 3: Advanced Features
- Recommended pairings and outfit suggestions
- Product variants and bundles
- Sustainability attributes
- Review and rating support
- User interaction tracking
- Virtual try-on metadata

---

## Appendix A: Related Documents
- `products/central-men-clothing.json` - Sample scraped product data
- `products/central-women-dresses.json` - Sample scraped product data
- `Category group/occasion_expertise.py` - Occasion definitions and guidelines
- `Category group/ootday_assistant.py` - AI assistant implementation
- `frontend/lib/types.ts` - Current frontend type definitions

## Appendix B: Occasion Reference
The 9 occasions from `occasion_expertise.py`:
1. Work (ทำงาน/ออฟฟิศ)
2. Chill Day (วันชิลล์/วันหยุด)
3. Wedding (งานแต่งงาน)
4. Sport (ออกกำลังกาย)
5. Travel (ท่องเที่ยว)
6. Date (เดท)
7. Dinner (ดินเนอร์)
8. Cafe (คาเฟ่)
9. Party (ปาร์ตี้)