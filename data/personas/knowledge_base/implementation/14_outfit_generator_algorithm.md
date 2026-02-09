# Implementation Category: Outfit Generator Algorithm
## 14_outfit_generator_algorithm.md

**Category:** Implementation Strategy
**Coverage:** Outfit generation algorithms, Pinterest 2026 trends, scoring system, validation logic
**Priority:** ⭐⭐⭐ CRITICAL
**Source:** apps/web/lib/outfit-generator.ts (1,643 lines)

---

## 📚 TABLE OF CONTENTS

1. [Overview & Architecture](#overview)
2. [Pinterest 2026 Aesthetic Categories](#aesthetics)
3. [Gender Filtering Strategy](#gender)
4. [Product Categorization System](#categorization)
5. [Enhanced Product Scoring Algorithm](#scoring)
6. [Formality Level Matching](#formality)
7. [Color Palette System](#colors)
8. [Outfit Generation Strategies](#strategies)
9. [Validation & Deduplication](#validation)
10. [Query Parsing (Thai & English)](#query)
11. [User Personalization](#personalization)
12. [Technical Implementation](#implementation)

---

## <a name="overview"></a>🏗️ Overview & Architecture

### CORE FUNCTIONALITY

The outfit generator creates fashion outfit recommendations from the product catalog using:

1. **Pinterest 2026 Trend Integration** - 9 aesthetic categories with Thai titles
2. **Enhanced Product Scoring** - 5-dimension weighting algorithm
3. **Formality Level Matching** - ±2 tolerance compatibility
4. **Gender-Aware Filtering** - Women's department strict validation
5. **User Preference Personalization** - Age-appropriate aesthetics

### DUAL GENERATION STRATEGIES

```
STRATEGY SELECTION:

1. TREND-BASED COMBINATION (Priority)
   - Uses Pinterest 2026 aesthetics
   - Color palette matching
   - Occasion-aware selection

2. TRADITIONAL ASSEMBLY (Fallback)
   - Dress-based: dress + shoes + accessory
   - Top+Bottom: top + bottom + shoes + (accessory)
```

### MODULE DEPENDENCIES

```
outfit-generator.ts
├── styling/outfit-combination-rules.ts
├── styling/color-palette-matcher.ts
├── styling/pinterest-2026-trends.ts
├── utils/user-preference-mapper.ts
└── utils/product-visual-validator.ts
```

---

## <a name="aesthetics"></a>🎨 Pinterest 2026 Aesthetic Categories

### 9 SUPPORTED AESTHETICS

| Aesthetic | Thai Title | Description |
|-----------|------------|-------------|
| `clean-girl` | ลุคสาวคลีนมินิมอล | Minimal with nude tones, soft fabrics |
| `scandinavian-minimal` | สไตล์สแกนดิเนเวียน | Nordic quality, clean lines |
| `street-style` | ลุคสตรีทสไตล์ | Oversized, urban, layered |
| `casual-chic` | ลุคแคชชวลชิค | Comfortable yet stylish |
| `y2k-revival` | ลุค Y2K รีไววัล | 2000s retro, platforms, bright colors |
| `corporate-chic` | ลุคออฟฟิศชิค | Modern executive, structured |
| `quiet-luxury` | ลุค Quiet Luxury | Premium fabrics, understated elegance |
| `minimalist-office` | ออฟฟิศมินิมอล | Professional minimalism |
| `dark-academia` | ลุค Dark Academia | Vintage browns, scholarly style |

### AESTHETIC RELATIONSHIPS (FOR PARTIAL SCORING)

```
RELATED AESTHETICS:

clean-girl ←→ scandinavian-minimal ←→ minimalist-office
                     ↓
               quiet-luxury ←→ corporate-chic
                                    ↓
                               dark-academia

street-style ←→ casual-chic
     ↓
y2k-revival
```

### THAI-LOCALIZED TITLES

```javascript
const aestheticTitles = {
  'clean-girl': ['ลุคสาวคลีนมินิมอล', 'สไตล์เฟรชเกิร์ล', 'ลุคเรียบง่ายแบบนอร์ดิก'],
  'corporate-chic': ['ลุคออฟฟิศชิค', 'สไตล์ผู้บริหารสมัยใหม่', 'ทำงานแบบมืออาชีพ'],
  'quiet-luxury': ['ลุค Quiet Luxury', 'สไตล์หรูเรียบหรู', 'ความหรูแบบเนื้อๆ'],
  // ... etc
}
```

---

## <a name="gender"></a>👗 Gender Filtering Strategy

### WOMEN'S DEPARTMENT VALIDATION

For OOTDay women's fashion department, strict validation ensures only women-appropriate products:

```
VALIDATION CHECKLIST:

✅ Category must include "women"
❌ Category must NOT include "men" (unless "women" also present)
❌ Product name must NOT include masculine keywords
❌ Product image URL must NOT suggest masculine product
```

### MASCULINE FOOTWEAR EXCLUSIONS

```javascript
const masculineFootwearKeywords = [
  'oxford shoe',
  'derby shoe',
  'brogue shoe',
  'wingtip',
  "men's dress shoe",
  "men's oxford",
  "men's derby"
]
```

### WOMEN'S FOOTWEAR (ALLOWED)

```
Pinterest 2026 Corporate Chic Footwear:

✅ Heels (pumps, stilettos, block heels)
✅ Women's loafers (pointed-toe, gold hardware)
✅ Mules (heeled or flat, backless)
✅ Ballet flats (pointed-toe, rounded)
✅ Slingback heels
✅ Women's sneakers (minimal, white leather)
✅ Sandals, ankle boots, knee boots
```

### VISUAL CONSISTENCY VALIDATION

```
IMAGE URL PATTERN DETECTION:

- Check if footwear image URL suggests wrong gender
- Full visual consistency check for any product type
- Prevents flat-lay/thumbnail mismatch issue
```

---

## <a name="categorization"></a>📦 Product Categorization System

### TEXT-BASED CATEGORIZATION

```javascript
function categorizeProduct(product): ProductCategory {
  // Keyword matching for Thai + English

  DRESSES: 'dress', 'กระโปรง'

  TOPS: 'shirt', 'blouse', 't-shirt', 'tee', 'top',
        'blazer', 'jacket', 'coat', 'sweater', 'hoodie', 'เสื้อ'

  BOTTOMS: 'pants', 'trousers', 'jeans', 'shorts',
           'skirt', 'กางเกง'

  SHOES: 'shoe', 'boot', 'sneaker', 'sandal',
         'loafer', 'heel', 'รองเท้า'

  ACCESSORIES: 'bag', 'belt', 'watch', 'sunglass', 'jewelry',
               'necklace', 'bracelet', 'ring', 'earring',
               'scarf', 'hat', 'กระเป๋า', 'เข็มขัด'
}
```

### ENHANCED CATEGORIZATION (BY OUTFIT ROLE)

```javascript
function categorizeEnhancedProducts(products) {
  // Uses outfitRole attribute from EnhancedMockProduct

  outfitRole === 'top'       → tops[]
  outfitRole === 'bottom'    → bottoms[]
  outfitRole === 'dress'     → dresses[]
  outfitRole === 'outerwear' → outerwear[]
  outfitRole === 'footwear'  → footwear[]
  outfitRole === 'accessory' → accessories[]
  outfitRole === 'bag'       → accessories[]
}
```

---

## <a name="scoring"></a>🎯 Enhanced Product Scoring Algorithm

### SCORING WEIGHTS (5 DIMENSIONS)

```
TOTAL SCORE: 100 points

┌─────────────────────────┬────────┐
│ Dimension               │ Weight │
├─────────────────────────┼────────┤
│ Aesthetic Match         │   25%  │
│ Formality Match         │   25%  │
│ Color Tone Match        │   20%  │
│ Style Tag Overlap       │   15%  │
│ Pairing Compatibility   │   15%  │
└─────────────────────────┴────────┘
```

### SCORING IMPLEMENTATION

```javascript
function scoreEnhancedProductForOutfit(product, context, existingItems) {
  let score = 0

  // AESTHETIC MATCH (25%)
  if (product.aesthetic === context.targetAesthetic) {
    score += 25  // Exact match
  } else if (relatedAesthetics.includes(product.aesthetic)) {
    score += 15  // Partial credit for related aesthetic
  }

  // FORMALITY MATCH (25%)
  const diff = Math.abs(product.formalityLevel - context.targetFormality)
  if (diff === 0) score += 25
  else if (diff <= 2) score += 25 - (diff * 5)  // Graduated scoring

  // COLOR TONE MATCH (20%)
  if (areColorTonesCompatible(product.colorTone, context.colorTone)) {
    score += 20
  }

  // STYLE TAG OVERLAP (15%)
  const overlap = calculateStyleOverlap(product.styleTags, context.existingStyleTags)
  score += overlap * 15

  // PAIRING COMPATIBILITY (15%)
  // Check against existing items using pairingCategories
  const compatibleCount = existingItems.filter(item =>
    validatePairingCompatibility(product, item)
  ).length
  score += (compatibleCount / existingItems.length) * 15

  return score  // 0-100 scale
}
```

---

## <a name="formality"></a>👔 Formality Level Matching

### FORMALITY SCALE (1-10)

```
FORMALITY_TOLERANCE = ±2 levels

1-2: Ultra Casual (loungewear, home)
3-4: Casual (jeans, t-shirts)
5-6: Smart Casual (nice restaurant, casual office)
7-8: Business Formal (office, meetings)
9-10: Formal/Black Tie (gala, wedding)
```

### COMPATIBILITY CHECKING

```javascript
function isFormalityCompatible(level1, level2) {
  return Math.abs(level1 - level2) <= FORMALITY_TOLERANCE
}

// Example:
// Blazer (formality: 7) + Jeans (formality: 5) = ✅ Compatible (diff = 2)
// Evening gown (formality: 10) + Sneakers (formality: 3) = ❌ Incompatible (diff = 7)
```

### AVERAGE FORMALITY CALCULATION

```javascript
function calculateAverageFormalityLevel(items) {
  if (items.length === 0) return 5  // Default to middle value
  const sum = items.reduce((acc, item) => acc + item.formalityLevel, 0)
  return sum / items.length
}
```

---

## <a name="colors"></a>🎨 Color Palette System

### 8 PREDEFINED PALETTES

| Palette | Description | Use Case |
|---------|-------------|----------|
| `neutral-earth-tones` | Warm earth colors | Versatile, everyday |
| `monochromatic-beige` | All beige tones | Elegant, luxurious |
| `monochromatic-brown` | Brown spectrum | Classic, warm |
| `monochromatic-blue` | Blue variations | Fresh, modern |
| `monochromatic-black` | All black | Edgy, stylish |
| `work-olive-black` | Olive + black | Professional |
| `work-brown-cream` | Brown + cream | Warm professional |
| `all-black-texture` | Black with texture variety | Statement |

### COLOR TONE COMPATIBILITY

```javascript
// From color-palette-matcher.ts
function areColorTonesCompatible(tone1, tone2) {
  // Returns true if tones work well together
  // Uses color theory rules
}

function areAllColorTonesCompatible(items) {
  // Validates entire outfit's color harmony
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (!areColorTonesCompatible(items[i].colorTone, items[j].colorTone)) {
        return false
      }
    }
  }
  return true
}
```

### PALETTE DESCRIPTIONS (THAI)

```javascript
const paletteDescriptions = {
  'neutral-earth-tones': 'การจับคู่สีเอิร์ธโทนที่ดูอบอุ่นและมีสไตล์',
  'monochromatic-beige': 'ชุดโทนสีเบจที่ดูหรูและเรียบหรู',
  'monochromatic-brown': 'โทนสีน้ำตาลที่ให้ความรู้สึกอบอุ่นและคลาสสิก',
  'monochromatic-blue': 'ชุดโทนสีน้ำเงินที่ดูสดชื่นและทันสมัย',
  'monochromatic-black': 'ลุคออลแบล็คที่ดูเท่และมีสไตล์',
  'all-black-texture': 'ลุคออลแบล็คด้วยเนื้อผ้าที่หลากหลาย',
}
```

---

## <a name="strategies"></a>👗 Outfit Generation Strategies

### STRATEGY 1: TREND-BASED COMBINATION (Priority)

```javascript
function applyTrendBasedOutfit(categorized, style, aesthetic, colorPalette) {
  // Uses Pinterest 2026 trend rules
  // Maps style to occasion: business → 'work', casual → 'casual'

  const trendItems = applyTrendBasedCombination(categorized, {
    occasion,
    aesthetic,
    colorPalette,
  })

  return trendItems
}
```

### STRATEGY 2: DRESS-BASED (Women)

```
IF gender === 'women' AND dresses available:

1. Select dress (random pick)
2. Add shoes (random pick)
3. Add accessory (50% chance)

RESULT: dress + shoes + (accessory)
```

### STRATEGY 3: TOP + BOTTOM (Traditional)

```
TRADITIONAL ASSEMBLY:

1. Select top (random pick)
2. Select bottom (random pick)
3. Add shoes (random pick)
4. Add accessory (50% chance)

RESULT: top + bottom + shoes + (accessory)
```

### ENHANCED OUTFIT GENERATION (Using Scoring)

```javascript
function generateEnhancedOutfits(products, options) {
  // For dress-based:
  1. Score all dresses using scoreEnhancedProductForOutfit()
  2. Select from top 3 scored dresses
  3. Find compatible footwear (formality + color validation)
  4. Add accessory if color compatible

  // For top+bottom:
  1. Score all tops
  2. Select from top 3 scored tops
  3. Find compatible bottoms using pairingCategories
  4. Validate formality tolerance (±2)
  5. Validate color tone compatibility
  6. Add footwear (match avg formality)
  7. Add outerwear if formality >= 6
  8. Add accessory if < 5 items
}
```

---

## <a name="validation"></a>✅ Validation & Deduplication

### OUTFIT VALIDATION CHECKS

```javascript
function validateEnhancedOutfit(items) {
  return {
    colorToneCompatibility,      // All colors work together
    formalityCompatibility,      // Within ±2 tolerance
    styleTagOverlap,             // Percentage (0-1)
    pairingCompatibility,        // Pairing rules followed
    hasDuplicateRoles,           // No duplicate roles (except accessories)
  }
}
```

### VALIDATION RESULT STRUCTURE

```javascript
interface EnhancedValidationResult {
  isValid: boolean           // No issues found
  score: number              // 0-100 quality score
  issues: string[]           // Array of problems
  colorToneCompatibility: boolean
  formalityCompatibility: boolean
  styleTagOverlap: number    // 0-1 percentage
  pairingCompatibility: boolean
}
```

### DEDUPLICATION RULES

```
PREVENT DUPLICATE COMBINATIONS:

1. Track used product combinations by SKU signature
2. Track used primary items (top/dress) separately
3. Only accept outfit if both checks pass

const signature = items.map(p => p.sku).sort().join('-')
const primarySku = items[0].sku

if (!usedCombinations.has(signature) && !usedPrimarySkus.has(primarySku)) {
  // Accept outfit
}
```

---

## <a name="query"></a>🔍 Query Parsing (Thai & English)

### OCCASION DETECTION

```javascript
const occasionKeywords = {
  business: ['business', 'work', 'office', 'ทำงาน', 'ประชุม'],
  casual: ['casual', 'everyday', 'relax', 'เที่ยว', 'สบาย', 'ชิล'],
  formal: ['party', 'formal', 'event', 'งานแต่ง', 'ราตรี'],
  weekend: ['weekend', 'saturday', 'sunday', 'brunch'],
  date: ['date', 'dinner', 'romantic', 'เดท', 'แฟน',
         'กินข้าว', 'ทานข้าว', 'ดินเนอร์', 'ร้านอาหาร'],
  workout: ['workout', 'gym', 'sport', 'active', 'ออกกำลังกาย'],
}
```

### GENDER DETECTION

```javascript
function generateOutfitsFromQuery(products, query, userProfile) {
  // Default to women for OOTDay or use user profile
  let gender = userProfile?.gender || 'women'

  if (query.includes('men') && !query.includes('women')) {
    gender = 'men'
  } else if (query.includes('women') || query.includes('woman')) {
    gender = 'women'
  }
}
```

---

## <a name="personalization"></a>👤 User Personalization

### USER PREFERENCE CONTEXT

```javascript
interface UserPreferenceContext {
  userName: string
  ageAppropriateAesthetics: AestheticCategory[]
  preferredColorTones: ColorTone[]
  // ... etc
}

// Usage:
const userContext = getUserPreferenceContext(userProfile)
const targetAesthetic = userContext.ageAppropriateAesthetics[0]
```

### PERSONALIZED TITLES

```javascript
// Base title: "ลุคออฟฟิศมั่นใจ"
// With name: "ลุคออฟฟิศมั่นใจสำหรับคุณน้อง"

const personalizedTitle = personalizeOutfitTitle(baseTitle, userContext.userName)
```

### AGE-APPROPRIATE AESTHETIC SELECTION

```
USER AGE → AESTHETIC MAPPING:

15-24: y2k-revival, street-style, clean-girl
25-34: corporate-chic, quiet-luxury, minimalist-office
35-44: quiet-luxury, scandinavian-minimal, corporate-chic
45+: scandinavian-minimal, quiet-luxury
```

---

## <a name="implementation"></a>💻 Technical Implementation

### MAIN EXPORT FUNCTIONS

```javascript
// Generate multiple outfits from catalog
generateOutfits(products, options): Outfit[]

// Generate single outfit from categorized products
generateOutfit(categorized, style, gender, options): Outfit | null

// Gender-specific shortcuts
generateMensOutfits(products, count, style): Outfit[]
generateWomensOutfits(products, count, style): Outfit[]

// Query-based generation
generateOutfitsFromQuery(products, query, userProfile): Outfit[]

// Enhanced generation (using scoring)
generateEnhancedOutfits(products, options): Outfit[]
```

### PRODUCT FILTERING

```javascript
// Filter by gender with visual validation
filterProductsByGender(products, gender, options): Product[]

// Women's footwear validation
isWomenFootwear(product, options): boolean

// Categorize products
categorizeProduct(product): ProductCategory
categorizeProducts(products): CategorizedProducts
```

### OUTFIT INTERFACE

```typescript
interface Outfit {
  id: string                    // unique identifier
  title: string                 // Thai-localized title
  description: string           // Thai-localized description
  totalPrice: number            // Sum of all item prices
  items: Product[]              // Array of products in outfit
  imageUrl?: string             // First item's image
  aesthetic?: AestheticCategory // Detected or assigned aesthetic
  colorPalette?: ColorPalette   // Detected or assigned palette
}
```

---

## 🎯 Implementation Checklist

**Outfit Generator Should:**
- ✅ Apply Pinterest 2026 trend-based combinations first
- ✅ Fall back to traditional assembly if trends fail
- ✅ Validate gender strictly for women's department
- ✅ Score products using 5-dimension algorithm
- ✅ Maintain formality tolerance (±2)
- ✅ Check color tone compatibility
- ✅ Deduplicate outfit combinations
- ✅ Support Thai-English bilingual queries
- ✅ Personalize titles with user names
- ✅ Filter out-of-stock and placeholder images

**Outfit Generator Should NOT:**
- ❌ Include masculine footwear in women's outfits
- ❌ Mix extreme formality levels (e.g., gown + sneakers)
- ❌ Create outfits with incompatible color tones
- ❌ Generate duplicate outfits (same SKU combination)
- ❌ Include duplicate outfit roles (except accessories)
- ❌ Show products with placeholder images

---

**Implementation Priority:** ⭐⭐⭐ CRITICAL
**System Impact:** HIGHEST (core recommendation engine)
**Algorithm Complexity:** HIGH (multi-dimensional scoring)

**Version:** 1.0 Complete
**Source File:** apps/web/lib/outfit-generator.ts (1,643 lines)
**Ready For:** AI chat integration, recommendation API
**Success Factor:** ACCURATE OUTFIT MATCHING + THAI LOCALIZATION! 🎯
