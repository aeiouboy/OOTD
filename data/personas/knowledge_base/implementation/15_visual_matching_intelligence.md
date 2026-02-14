# Visual Matching Intelligence
## AI-Powered Visual Vocabulary for Image-to-Product Matching

**Status:** Complete
**Version:** 1.0
**Last Updated:** February 2026
**Priority:** CRITICAL for Look Recommendation & Product Matching
**Language:** Thai & English

---

## Overview

This document establishes the visual vocabulary and classification system that enables AI to match inspiration images (looks) with products from the catalog. Unlike text-based matching, visual matching requires understanding silhouettes, proportions, visual weight, and outfit composition at a glance.

**Key Insight:** When a user sees a Pinterest look and wants "something like this," the AI must decompose the visual into matchable attributes.

---

## 1. Silhouette Vocabulary

### 1.1 Primary Silhouette Classifications

| Silhouette | Thai Name | Description | Visual Character | Best For Body Types |
|------------|-----------|-------------|------------------|---------------------|
| **A-Line** | ทรงเอ | Narrow top, flares at bottom | ▲ Triangle shape | Pear, Rectangle |
| **H-Line** | ทรงเอช | Straight, minimal waist definition | ▮ Column shape | Hourglass, Rectangle |
| **X-Line** | ทรงเอ็กซ์ | Fitted at waist, balanced top/bottom | ⌛ Hourglass shape | Hourglass, Pear |
| **I-Line** | ทรงไอ | Slim, elongated, minimal volume | │ Vertical line | Rectangle, Inverted Triangle |
| **V-Line** | ทรงวี | Broader top, narrower bottom | ▽ Inverted triangle | Rectangle, Pear |
| **O-Line** | ทรงโอ | Rounded, cocoon-like | ⬭ Oval shape | All (drapes body) |

### 1.2 Fit Classifications

| Fit Type | Thai | Description | Volume Level |
|----------|------|-------------|--------------|
| **Fitted** | พอดีตัว | Follows body contours closely | Minimal |
| **Semi-Fitted** | กึ่งพอดี | Light ease, not skin-tight | Low |
| **Relaxed** | สบาย | Comfortable ease, not oversized | Medium |
| **Oversized** | โอเวอร์ไซส์ | Intentionally large, volume-driven | High |
| **Boxy** | ทรงกล่อง | Square, structured, minimal taper | Medium-High |
| **Structured** | มีทรง | Maintains shape with construction | Variable |
| **Fluid** | พลิ้ว | Drapes and moves with body | Low-Medium |

### 1.3 Silhouette Attributes for Products

```json
{
  "silhouette": {
    "primary": "A-line",
    "fit": "semi-fitted",
    "volume": "medium",
    "structure": "soft",
    "drape": "flowing"
  }
}
```

---

## 2. Visual Weight System

Visual weight determines how "heavy" or "light" an item appears, crucial for balancing outfits.

### 2.1 Visual Weight Scale (1-10)

| Weight Level | Score | Characteristics | Examples |
|--------------|-------|-----------------|----------|
| **Ultra Light** | 1-2 | Sheer, airy, minimal presence | Chiffon blouse, sheer overlay |
| **Light** | 3-4 | Soft, breathable, subtle | Cotton tee, linen shirt |
| **Medium** | 5-6 | Balanced, versatile | Denim, cotton blazer |
| **Heavy** | 7-8 | Substantial, commanding | Wool coat, leather jacket |
| **Ultra Heavy** | 9-10 | Dominant, statement | Heavy brocade, structured outerwear |

### 2.2 Visual Weight Factors

**Increases Visual Weight:**
- Dark colors (black, navy, burgundy)
- Saturated/rich colors
- Heavy fabrics (wool, leather, velvet)
- Structured construction
- Bold patterns
- Embellishments (sequins, beading)
- Layered looks

**Decreases Visual Weight:**
- Light colors (white, pastels, cream)
- Sheer/lightweight fabrics
- Flowing/draped construction
- Minimal patterns
- Simple, clean designs
- Single-layer pieces

### 2.3 Visual Weight Balance Rules

```
Rule 1: Total outfit visual weight should be balanced
        Heavy top → Light bottom OR Light top → Heavy bottom

Rule 2: Thai climate consideration
        Hot weather: Favor lighter visual weight (3-6)
        Cool season: Can use heavier weight (5-8)
        AC environments: Medium weight works best

Rule 3: Occasion alignment
        Casual: Light-Medium (3-6)
        Business: Medium (5-7)
        Formal: Medium-Heavy (6-8)
        Statement: Heavy (7-10)
```

### 2.4 Visual Weight Product Attribute

```json
{
  "visualWeight": {
    "score": 5,
    "level": "medium",
    "factors": ["cotton-fabric", "mid-tone-color", "minimal-structure"]
  }
}
```

---

## 3. Proportion Ratio Classification

Understanding how garments affect perceived body proportions.

### 3.1 Proportion Categories

| Category | Description | Visual Effect | Best Strategy |
|----------|-------------|---------------|---------------|
| **Top-Heavy** | Volume/attention above waist | ▲ Draws eye upward | Balance with A-line bottoms |
| **Balanced** | Equal visual weight top/bottom | ⬜ Harmonious | Maintain or adjust as desired |
| **Bottom-Heavy** | Volume/attention below waist | ▼ Draws eye downward | Balance with structured tops |

### 3.2 Thai Body Proportion Considerations

**Average Thai Female Proportions:**
- Height: 155-160cm
- Shorter torso relative to legs (compared to Western)
- Petite frame

**Proportion Optimization for Thai Bodies:**

| Goal | Strategy | Garment Choices |
|------|----------|-----------------|
| **Elongate Legs** | High-waist everything | High-rise pants, tucked tops |
| **Balance Short Torso** | Avoid crop tops with low-rise | Mid-rise with proportional tops |
| **Create Height** | Vertical lines, monochrome | Same-color top/bottom, V-necks |
| **Avoid Overwhelming** | Scale patterns to body | Smaller prints for petite frames |

### 3.3 Proportion Effect Scores

```json
{
  "proportionEffect": {
    "torsoLengthening": 0,  // -2 to +2
    "legLengthening": +1,   // High-waist effect
    "widthEffect": 0,       // -2 (slimming) to +2 (widening)
    "heightEffect": +1      // -2 to +2
  }
}
```

---

## 4. Color Block Patterns

How colors are distributed across a garment affects visual matching.

### 4.1 Color Distribution Types

| Pattern Type | Description | Complexity | Matching Difficulty |
|--------------|-------------|------------|---------------------|
| **Solid** | Single color throughout | Low | Easy |
| **Two-Tone** | Two distinct color areas | Low-Medium | Moderate |
| **Color-Block** | Bold geometric color sections | Medium | Moderate |
| **Gradient/Ombré** | Gradual color transition | Medium | Moderate |
| **Multi-Color** | 3+ colors in pattern | High | Complex |
| **Print/Pattern** | Repeated design elements | Variable | Complex |

### 4.2 Pattern Complexity Scale

```
1 = Solid (single color)
2 = Subtle texture (tone-on-tone)
3 = Two-tone/simple stripe
4 = Color-block
5 = Simple pattern (polka dots, basic stripes)
6 = Medium pattern (florals, geometric)
7 = Complex pattern (paisley, abstract)
8 = Multi-pattern (mixed prints)
9 = Statement print (bold, artistic)
10 = Maximalist (multiple complex elements)
```

### 4.3 Pattern Matching Rules for Outfits

```
Rule 1: Pattern + Solid = Safe
        One patterned piece + solid pieces

Rule 2: Pattern + Pattern = Advanced
        Different scales (large + small)
        Shared color palette
        One dominant, one supporting

Rule 3: Thai Context
        Conservative settings: Complexity ≤ 5
        Creative/casual: Any complexity
        Formal: Complexity ≤ 4
```

### 4.4 Color Block Product Attribute

```json
{
  "colorPattern": {
    "type": "color-block",
    "complexity": 4,
    "colors": ["navy", "white"],
    "distribution": "horizontal",
    "dominant": "navy"
  }
}
```

---

## 5. Texture Visual Vocabulary

Surface texture affects how light interacts with garments.

### 5.1 Texture Classifications

| Texture | Thai | Light Behavior | Formality | Best For |
|---------|------|----------------|-----------|----------|
| **Matte** | ด้าน | Absorbs light | Casual-Business | Day wear, office |
| **Sheen** | มีประกาย | Subtle reflection | Business-Formal | Evening, special |
| **Glossy** | เงา | High reflection | Formal-Statement | Events, night out |
| **Textured** | มีลวดลาย | Creates shadows | Casual-Business | Interest, dimension |
| **Fuzzy** | นุ่มฟู | Diffuses light | Casual | Cozy, relaxed |
| **Ribbed** | ลูกฟูก | Linear shadows | Casual-Business | Knitwear, details |

### 5.2 Texture Mixing Guidelines

**Safe Combinations:**
- Matte + Matte (classic, understated)
- Matte + Subtle sheen (elegant contrast)
- Textured + Smooth (visual interest)

**Advanced Combinations:**
- Glossy + Matte (high contrast)
- Multiple textures (requires skill)

**Avoid:**
- All glossy (too costume-like)
- Conflicting textures without purpose

### 5.3 Texture in Thai Climate Context

| Season | Recommended Textures | Avoid |
|--------|---------------------|-------|
| Hot (Mar-Jun) | Matte, light textures | Heavy textures, fuzzy |
| Rainy (Jul-Oct) | Quick-dry, smooth | Velvet, suede |
| Cool (Nov-Feb) | Any, including textured | None |
| AC Indoor | Medium textures | Very light (cold) |

### 5.4 Texture Product Attribute

```json
{
  "texture": {
    "primary": "matte",
    "secondary": "subtle-texture",
    "lightReflection": "low",
    "touchFeel": "smooth"
  }
}
```

---

## 6. Outfit Role Classification

Every piece in an outfit plays a specific role in the overall composition.

### 6.1 Role Definitions

| Role | Thai | Definition | Characteristics | Quantity Rule |
|------|------|------------|-----------------|---------------|
| **Anchor** | ชิ้นหลัก | Foundation piece, starting point | Sets tone, most coverage | 1 per outfit |
| **Supporting** | ชิ้นเสริม | Complements anchor | Harmonious, doesn't compete | 1-3 per outfit |
| **Accent** | ชิ้นเติมแต่ง | Adds interest without dominating | Color pop, texture contrast | 1-2 per outfit |
| **Statement** | ชิ้นเด่น | Demands attention, focal point | Bold, unique, eye-catching | 0-1 per outfit |

### 6.2 Role Assignment by Category

| Category | Typical Roles |
|----------|---------------|
| **Dresses** | Anchor (complete look) or Statement |
| **Blazers/Jackets** | Anchor (structured) or Supporting |
| **Tops** | Supporting (basic) or Statement (bold) |
| **Bottoms** | Supporting (neutral) or Anchor (statement pants) |
| **Shoes** | Supporting (neutral) or Accent (color pop) |
| **Bags** | Accent or Supporting |
| **Jewelry** | Accent (small) or Statement (bold) |
| **Scarves** | Accent |

### 6.3 Outfit Composition Rules

```
Rule 1: Every outfit needs exactly 1 Anchor piece

Rule 2: Statement pieces are optional (max 1)
        If present, all others must be Supporting/Accent

Rule 3: Balance through roles
        Anchor (visual weight 60%)
        Supporting (visual weight 25%)
        Accent (visual weight 15%)

Rule 4: Role conflicts
        Two Statement pieces = Chaos
        Zero Anchor = Incomplete look
```

### 6.4 Role Product Attribute

```json
{
  "outfitRole": {
    "primary": "anchor",
    "alternate": ["supporting"],
    "statementPotential": false,
    "versatility": "high"
  }
}
```

---

## 7. Visual Balance Principles

### 7.1 Balance Types

| Balance Type | Description | Example |
|--------------|-------------|---------|
| **Symmetrical** | Equal visual weight both sides | Centered necklace, balanced shoulders |
| **Asymmetrical** | Intentional imbalance for interest | One-shoulder top, asymmetric hem |
| **Radial** | Focus point with radiating elements | Statement necklace as center |
| **Overall** | Distributed interest throughout | All-over pattern |

### 7.2 Thai Body Balance Optimization

For Thai petite frames (155-160cm):

| Challenge | Visual Solution | Product Attributes to Favor |
|-----------|-----------------|----------------------------|
| Short stature | Vertical lines, elongation | High-waist, V-neck, monochrome |
| Proportion balance | Strategic color placement | Darker bottom, lighter top |
| Avoid overwhelming | Scale-appropriate details | Small-medium patterns |
| Create presence | Strategic statement pieces | One bold accessory |

### 7.3 Balance Score Calculation

```
Balance Score = (Silhouette Harmony × 0.3) +
                (Visual Weight Distribution × 0.3) +
                (Color Harmony × 0.2) +
                (Role Clarity × 0.2)

Score Range: 0-100
90-100: Perfectly balanced
70-89: Well balanced
50-69: Acceptable balance
Below 50: Imbalanced
```

---

## 8. Image Embedding Guidance

For vector search and image-to-product matching.

### 8.1 Visual Feature Extraction

**Primary Visual Features:**
1. Silhouette contour
2. Color palette (dominant, secondary, accent)
3. Pattern type and scale
4. Texture indicators
5. Garment category

**Secondary Visual Features:**
1. Neckline shape
2. Sleeve length/type
3. Hem length
4. Detail elements (buttons, zippers)
5. Overall style mood

### 8.2 Embedding Dimensions

```
Recommended Embedding Structure:
{
  "visual_embedding": [512-dimensional vector],
  "silhouette_code": "A-LINE-FITTED",
  "color_signature": ["#2C3E50", "#ECF0F1"],
  "pattern_code": "SOLID",
  "style_mood": "professional-feminine"
}
```

### 8.3 Similarity Matching Algorithm

```python
def visual_similarity_score(look_image, product):
    """
    Calculate visual similarity between inspiration look and product

    Components:
    1. Silhouette match (25%)
    2. Color palette match (25%)
    3. Pattern compatibility (20%)
    4. Texture alignment (15%)
    5. Style mood match (15%)

    Returns: 0-100 similarity score
    """
    silhouette_score = compare_silhouettes(look_image, product)
    color_score = compare_color_palettes(look_image, product)
    pattern_score = compare_patterns(look_image, product)
    texture_score = compare_textures(look_image, product)
    mood_score = compare_style_moods(look_image, product)

    total = (silhouette_score * 0.25 +
             color_score * 0.25 +
             pattern_score * 0.20 +
             texture_score * 0.15 +
             mood_score * 0.15)

    return total
```

### 8.4 Minimum Match Thresholds

| Match Quality | Score Range | Action |
|---------------|-------------|--------|
| **Excellent** | 85-100 | "Perfect match!" |
| **Very Good** | 70-84 | "Very similar" |
| **Good** | 55-69 | "Similar style" |
| **Partial** | 40-54 | "Inspired by" |
| **Different** | Below 40 | Don't suggest |

---

## 9. Product Attribute Schema for Visual Matching

### 9.1 Complete Visual Matching Attributes

```json
{
  "visualMatching": {
    "silhouette": {
      "primary": "A-line",
      "fit": "semi-fitted",
      "volume": "medium",
      "structure": "soft"
    },
    "visualWeight": {
      "score": 5,
      "level": "medium"
    },
    "proportionEffect": {
      "torsoLengthening": 0,
      "legLengthening": +1,
      "heightEffect": +1
    },
    "colorPattern": {
      "type": "solid",
      "complexity": 1,
      "dominant": "navy"
    },
    "texture": {
      "primary": "matte",
      "lightReflection": "low"
    },
    "outfitRole": {
      "primary": "anchor",
      "statementPotential": false
    },
    "imageEmbedding": "[512-dim vector]",
    "styleMood": ["professional", "feminine", "classic"]
  }
}
```

### 9.2 Implementation Priority

**Phase 1 (MVP):**
- Silhouette (primary, fit)
- Visual weight (score)
- Color pattern (type, dominant)
- Outfit role (primary)

**Phase 2 (Enhanced):**
- Full silhouette attributes
- Proportion effects
- Texture classification
- Pattern complexity

**Phase 3 (Advanced):**
- Image embeddings
- Style mood vectors
- Balance scoring algorithm

---

## 10. Cross-References

### Related Knowledge Base Files
- `/foundation/03_body_types_styling.md` - Body type compatibility
- `/advanced/08_color_theory.md` - Color harmony rules
- `/implementation/14_outfit_generator_algorithm.md` - Scoring integration
- `/implementation/12_product_matching.md` - Product matching rules
- `/implementation/16_outfit_composition_rules.md` - Complete outfit building
- `/implementation/17_cross_product_compatibility.md` - Product pairing

### Product Schema Reference
- `apps/web/lib/mock-data03.ts` - Current product attributes

---

## 11. Thai Language Reference

### Visual Vocabulary in Thai

| English | Thai | Pronunciation |
|---------|------|---------------|
| Silhouette | ทรงชุด | song-chut |
| Fitted | พอดีตัว | phor-dee-tua |
| Oversized | โอเวอร์ไซส์ | over-size |
| Visual weight | น้ำหนักสายตา | nam-nak-sai-ta |
| Light (weight) | เบา | bao |
| Heavy (weight) | หนัก | nak |
| Pattern | ลวดลาย | lua-lai |
| Texture | เนื้อผ้า | neua-pha |
| Anchor piece | ชิ้นหลัก | chin-lak |
| Statement piece | ชิ้นเด่น | chin-den |
| Balance | สมดุล | som-dun |
| Proportion | สัดส่วน | sat-suan |

---

**Source:** OOTDay Knowledge Base Expansion
**Created:** February 2026
**Version:** 1.0
**Status:** Complete - Ready for Implementation
