# Cross-Product Compatibility Matrix
## Product-to-Product Pairing Rules for Complete Outfits

**Status:** Complete
**Version:** 1.0
**Last Updated:** February 2026
**Priority:** CRITICAL for Outfit Recommendations
**Language:** Thai & English

---

## Overview

This document defines the rules for pairing products together to create complete, harmonious outfits. Beyond general styling guidelines, this provides specific product-to-product compatibility scoring and pairing logic.

**Key Insight:** Knowing that "blazers go with pants" is not enough. The AI must know that "this specific tailored blazer pairs well with these specific tailored pants but not with those casual joggers."

---

## 1. Pairing Categories

### 1.1 Top + Bottom Compatibility

**Formality Matching:**

| Top Formality | Compatible Bottom Formality | Compatibility |
|---------------|----------------------------|---------------|
| Formal (blazer, dress shirt) | Formal (tailored pants, pencil skirt) | ✅ Perfect |
| Formal | Smart Casual (chinos, dark jeans) | ✅ Good (dress down) |
| Formal | Casual (shorts, joggers) | ❌ Mismatch |
| Smart Casual | Formal | ✅ Good (dress up) |
| Smart Casual | Smart Casual | ✅ Perfect |
| Smart Casual | Casual | ✅ Good |
| Casual | Casual | ✅ Perfect |
| Casual | Formal | ⚠️ Risky (intentional contrast only) |

**Silhouette Pairing:**

| Top Silhouette | Best Bottom Silhouette | Reason |
|----------------|------------------------|--------|
| Fitted/Slim | Straight/Wide | Balance |
| Fitted | Slim/Skinny | Sleek look |
| Oversized | Slim/Fitted | Balance volume |
| Boxy | High-waist straight | Define waist |
| Cropped | High-waist | Elongate legs |
| Long/Tunic | Slim | Avoid bulk |

### 1.2 Dress + Outerwear Compatibility

| Dress Style | Compatible Outerwear | Avoid |
|-------------|---------------------|-------|
| Formal sheath | Structured blazer, tailored coat | Denim jacket, casual cardigans |
| A-line feminine | Cropped jacket, fitted cardigan | Heavy coats |
| Casual midi | Denim jacket, light blazer | Formal overcoats |
| Maxi bohemian | Long cardigan, kimono | Structured blazers |
| Bodycon | Fitted jacket, cropped | Oversized coats |
| Shift minimal | Any clean-lined jacket | Fussy details |

### 1.3 Footwear Appropriateness Matrix

| Outfit Formality | Best Footwear | Acceptable | Avoid |
|------------------|---------------|------------|-------|
| Formal Business | Pumps, Oxfords, Loafers | Low heels | Sneakers, sandals |
| Business Casual | Low heels, Loafers, Clean sneakers | Ankle boots | Flip flops, athletic |
| Smart Casual | Loafers, Mules, White sneakers | Low sandals | Athletic, too formal |
| Casual | Sneakers, Sandals, Flats | Loafers | Stilettos |
| Evening/Formal | Stilettos, Dressy heels | Strappy sandals | Sneakers, casual |
| Beach/Resort | Sandals, Espadrilles | Clean sneakers | Heels, closed-toe |

### 1.4 Bag + Outfit Harmony

| Outfit Style | Best Bag Style | Size Guidance |
|--------------|----------------|---------------|
| Formal Business | Structured tote, Satchel | Medium-Large |
| Business Casual | Tote, Crossbody | Medium |
| Smart Casual | Crossbody, Shoulder | Small-Medium |
| Casual Out | Crossbody, Belt bag | Small-Medium |
| Evening | Clutch, Mini bag | Small |
| Weekend/Shopping | Tote, Backpack | Large |
| Date Night | Clutch, Small crossbody | Small |

### 1.5 Jewelry + Neckline Matrix

| Neckline Type | Best Necklace | Alternative |
|---------------|---------------|-------------|
| **V-neck** | Pendant, Y-necklace | Layered delicate |
| **Crew neck** | Long pendant, Opera length | Choker |
| **Scoop neck** | Statement collar | Multiple layers |
| **Boat neck** | Long chain, No necklace | Statement earrings |
| **Off-shoulder** | Choker, Collar | Statement earrings |
| **Turtleneck** | Long pendant, No necklace | Statement earrings |
| **Strapless** | Statement necklace | Choker |
| **High neck** | None (earring focus) | Long drop earrings |
| **Halter** | None or short pendant | Statement earrings |
| **Square neck** | Short pendant | Collar necklace |

---

## 2. Style Consistency Scoring

### 2.1 Aesthetic Match Score

```
Aesthetic Match Score (0-100) =
  (Style Category Match × 0.40) +
  (Color Harmony × 0.30) +
  (Formality Level Match × 0.30)
```

**Style Category Compatibility Matrix:**

| Style A | Style B | Compatibility |
|---------|---------|---------------|
| Minimalist | Clean Girl | 95 |
| Minimalist | Bohemian | 30 |
| Classic | Preppy | 85 |
| Classic | Streetwear | 40 |
| Romantic | Bohemian | 75 |
| Romantic | Minimalist | 50 |
| Edgy | Streetwear | 80 |
| Edgy | Classic | 35 |
| Bohemian | Vintage | 70 |
| Trendy | Any current trend | 80 |

### 2.2 Formality Level Compatibility

**The ±2 Rule:**
```
Products within ±2 formality levels are compatible
Products with >2 level difference create mismatch

Formality Scale (1-10):
1-2: Very Casual (athletic, loungewear)
3-4: Casual (jeans, t-shirts)
5-6: Smart Casual (chinos, nice tops)
7-8: Business/Professional
9-10: Formal/Black Tie
```

**Example:**
```
Blazer (Level 7) + Dress Pants (Level 7) = ✅ Perfect
Blazer (Level 7) + Dark Jeans (Level 5) = ✅ Acceptable (-2)
Blazer (Level 7) + Joggers (Level 2) = ❌ Mismatch (-5)
```

### 2.3 Color Harmony Scoring

```
Color Harmony Score (0-100):

Matching colors: 100
Complementary colors: 90
Analogous colors: 85
Triadic colors: 75
Neutral + Any color: 80
Clashing colors: 20-40
```

---

## 3. Pattern Mixing Rules

### 3.1 Safe Combinations

| Combination | Example | Confidence |
|-------------|---------|------------|
| Solid + Any Pattern | White blouse + Plaid pants | ✅ Very Safe |
| Small Pattern + Large Pattern | Pinstripe blazer + Bold floral | ✅ Safe |
| Geometric + Organic | Striped top + Floral skirt | ✅ Safe (if colors match) |
| Same Pattern Family, Different Scale | Small dots + Large dots | ✅ Safe |

### 3.2 Advanced Combinations

| Combination | Requirement | Risk Level |
|-------------|-------------|------------|
| Pattern + Pattern (same scale) | Must share colors | ⚠️ Medium |
| Bold + Bold | Expert styling only | ⚠️ High |
| Print + Print | Shared color palette | ⚠️ Medium |
| Three+ Patterns | Not recommended | ❌ Avoid |

### 3.3 Pattern Mixing Score

```python
def pattern_mixing_score(pattern1, pattern2):
    """
    Calculate safety score for mixing patterns

    Returns: 0-100 score
    """

    if pattern1 == 'solid' or pattern2 == 'solid':
        return 100  # Always safe

    # Check scale difference
    scale_diff = abs(pattern1.scale - pattern2.scale)
    if scale_diff >= 2:
        score = 80  # Good scale contrast
    else:
        score = 50  # Similar scale = risky

    # Check color harmony
    color_overlap = count_shared_colors(pattern1, pattern2)
    if color_overlap >= 1:
        score += 20

    # Check pattern type compatibility
    if are_compatible_types(pattern1, pattern2):
        score += 10

    return min(score, 100)
```

### 3.4 Thai Context Pattern Rules

| Setting | Pattern Guidance |
|---------|-----------------|
| Thai Office (Conservative) | Max 1 pattern, subtle |
| Thai Office (Creative) | 1-2 patterns okay |
| Temple | Solid preferred, subtle pattern okay |
| Wedding (Thai) | Patterns welcome, avoid competition with bride |
| Funeral | Solid black only |
| Casual | Freedom to mix |

---

## 4. Essential Pairings Lists

### 4.1 What Items NEED What Companions

| Item | Essential Companions | Why |
|------|---------------------|-----|
| **Formal Blazer** | Formal pants/skirt, dress shirt | Maintain formality |
| **Suit Jacket** | Matching suit pants | Set pieces |
| **Sheer Blouse** | Appropriate undergarment | Modesty |
| **Crop Top** | High-waisted bottom | Coverage |
| **Low-rise Pants** | Longer top | Coverage |
| **Statement Necklace** | Simple neckline | Balance |
| **Bold Printed Pants** | Solid top | Balance |
| **Formal Gown** | Heels, clutch | Complete look |

### 4.2 Missing Piece Detection

```python
def detect_missing_pieces(outfit):
    """
    Check if outfit is complete, identify missing pieces

    Returns: list of missing/recommended pieces
    """
    missing = []

    # Check coverage
    if not has_top(outfit) and not has_dress(outfit):
        missing.append({'category': 'top', 'priority': 'essential'})

    if not has_bottom(outfit) and not has_dress(outfit):
        missing.append({'category': 'bottom', 'priority': 'essential'})

    if not has_footwear(outfit):
        missing.append({'category': 'shoes', 'priority': 'essential'})

    # Check formality consistency
    if has_formal_item(outfit) and has_casual_item(outfit):
        missing.append({'issue': 'formality_mismatch', 'priority': 'warning'})

    # Check occasion requirements
    occasion = outfit.get('occasion')
    if occasion == 'work' and not has_appropriate_coverage(outfit):
        missing.append({'issue': 'coverage', 'priority': 'warning'})

    return missing
```

### 4.3 Outfit Gaps by Occasion

| Occasion | Minimum Required | Recommended Additions |
|----------|------------------|----------------------|
| Work Interview | Top + Bottom + Blazer + Closed shoes | Bag, minimal jewelry |
| Work Daily | Top + Bottom + Nice shoes | Layer for AC |
| Date Night | Complete outfit + Nice shoes | Small bag, jewelry |
| Wedding Guest | Dress or formal set + Heels + Clutch | Statement jewelry |
| Temple Visit | Modest top + Long bottom + Easy shoes | Shawl (if sleeveless) |
| Casual Out | Top + Bottom + Any shoes | Optional bag |

---

## 5. Versatility Scoring

### 5.1 Outfit Count Potential

```
Versatility Score (1-10) =
  Based on: How many outfits can this piece create?

10: Pairs with 20+ items (basics, neutrals)
8-9: Pairs with 15-20 items (versatile colors)
6-7: Pairs with 10-15 items (good versatility)
4-5: Pairs with 5-10 items (limited)
1-3: Pairs with <5 items (statement/specific)
```

### 5.2 High Versatility Categories

| Category | Typical Versatility | Best for Pairing |
|----------|---------------------|------------------|
| White t-shirt | 10 | Everything |
| Dark jeans | 9 | Most tops, shoes |
| Black blazer | 9 | Work to casual |
| Nude heels | 9 | Any outfit |
| Black bag | 9 | All occasions |
| Navy pants | 8 | Most tops |
| Statement dress | 3 | Limited (is the outfit) |
| Bold print pants | 4 | Solid tops only |

### 5.3 Cross-Occasion Flexibility

```
Flexibility Score by Item:

White button-down: Work ✅ Casual ✅ Date ✅ = High
Black dress: Work ✅ Casual ⚠️ Date ✅ Evening ✅ = High
Graphic tee: Work ❌ Casual ✅ Date ⚠️ = Low
Sequin top: Work ❌ Casual ❌ Date ✅ Evening ✅ = Medium
```

---

## 6. Product Relationship Types

### 6.1 Relationship Classifications

| Relationship | Score | Meaning | Action |
|--------------|-------|---------|--------|
| **Perfect Match** | 95-100 | Designed together or ideal | "แมทช์กันมาก!" |
| **Great Pair** | 80-94 | Aesthetic + formality aligned | "เข้ากันดี" |
| **Works Well** | 65-79 | Compatible basics | "ใส่ด้วยกันได้" |
| **Acceptable** | 50-64 | Functional match | No mention |
| **Borderline** | 35-49 | Use with caution | Warn if needed |
| **Avoid** | 0-34 | Clash warning | "ไม่แนะนำใส่คู่กัน" |

### 6.2 Relationship Score Calculation

```python
def calculate_relationship_score(product_a, product_b):
    """
    Calculate compatibility score between two products

    Components:
    - Style match (30%)
    - Formality match (25%)
    - Color harmony (20%)
    - Pattern compatibility (15%)
    - Occasion overlap (10%)
    """

    style_score = calculate_style_match(product_a, product_b)
    formality_score = calculate_formality_match(product_a, product_b)
    color_score = calculate_color_harmony(product_a, product_b)
    pattern_score = calculate_pattern_compatibility(product_a, product_b)
    occasion_score = calculate_occasion_overlap(product_a, product_b)

    total = (style_score * 0.30 +
             formality_score * 0.25 +
             color_score * 0.20 +
             pattern_score * 0.15 +
             occasion_score * 0.10)

    return total
```

### 6.3 Pre-Computed Pairing Database

For frequently recommended items, pre-compute compatibility:

```json
{
  "product_id": "SF001",  // SFERA Black Blazer
  "pre_computed_pairs": {
    "perfect_match": ["CG002", "LO001", "SH001"],  // Same brand/collection
    "great_pair": ["CG003", "CG004", "AC005"],
    "avoid": ["CG006_casual_shorts", "sporty_items"]
  }
}
```

---

## 7. Category-Specific Pairing Rules

### 7.1 Blazers/Jackets

| Blazer Type | Best Pairs | Avoid |
|-------------|------------|-------|
| Tailored blazer | Dress pants, pencil skirt, sheath dress | Joggers, athletic wear |
| Casual blazer | Chinos, dark jeans, casual dress | Suits (mismatched) |
| Cropped blazer | High-waist pants, A-line skirt | Low-rise items |
| Oversized blazer | Slim pants, skinny jeans | Wide-leg pants |
| Tweed jacket | Tailored separates, feminine pieces | Streetwear |
| Denim jacket | Casual everything, dresses | Formal suits |

### 7.2 Pants/Bottoms

| Bottom Type | Best Pairs | Avoid |
|-------------|------------|-------|
| Tailored pants | Blazers, blouses, structured tops | Oversized hoodies |
| Wide-leg pants | Fitted tops, crop tops | Oversized tops |
| Skinny pants | Tunics, oversized tops, any jackets | Slim-fit jackets |
| Pencil skirt | Fitted blouses, tucked tops | Bulky sweaters |
| A-line skirt | Fitted tops, tucked blouses | Volume on top |
| Maxi skirt | Fitted tops, crop tops | Long cardigans |

### 7.3 Dresses

| Dress Type | Best Additions | Avoid |
|------------|----------------|-------|
| Sheath dress | Structured blazer, pumps | Casual sneakers |
| Wrap dress | Low heels, crossbody | Heavy outerwear |
| Shirt dress | Belt, loafers or heels | Nothing (complete as is) |
| Maxi dress | Flat sandals, denim jacket | Heels (unless specific) |
| Bodycon dress | Heels, minimal jewelry | Heavy accessories |
| Flowy midi | Ankle boots, light cardigan | Structured blazers |

---

## 8. Implementation for AI

### 8.1 Compatibility Check Function

```python
def check_product_compatibility(product_list):
    """
    Check if all products in list are compatible

    Returns:
    - overall_score: 0-100
    - issues: list of compatibility problems
    - suggestions: improvements
    """

    scores = []
    issues = []

    for i, product_a in enumerate(product_list):
        for product_b in product_list[i+1:]:
            score = calculate_relationship_score(product_a, product_b)
            scores.append(score)

            if score < 50:
                issues.append({
                    'products': [product_a.id, product_b.id],
                    'issue': 'low_compatibility',
                    'score': score
                })

    overall = sum(scores) / len(scores) if scores else 100

    return {
        'overall_score': overall,
        'issues': issues,
        'is_compatible': overall >= 65
    }
```

### 8.2 Outfit Recommendation with Compatibility

```python
def recommend_outfit(anchor_product, inventory, user_preferences):
    """
    Build complete outfit starting from anchor

    Steps:
    1. Identify required categories
    2. Filter compatible products
    3. Score each combination
    4. Return best outfit
    """

    required_categories = get_required_categories(anchor_product)
    outfit = {'anchor': anchor_product, 'pieces': []}

    for category in required_categories:
        candidates = inventory.filter(category=category)

        # Score compatibility with current outfit
        scored_candidates = []
        for candidate in candidates:
            score = calculate_relationship_score(anchor_product, candidate)
            for existing in outfit['pieces']:
                score = min(score, calculate_relationship_score(existing, candidate))
            scored_candidates.append((candidate, score))

        # Select best compatible piece
        best = max(scored_candidates, key=lambda x: x[1])
        if best[1] >= 65:  # Minimum compatibility threshold
            outfit['pieces'].append(best[0])

    return outfit
```

### 8.3 Pairing Response Format

```json
{
  "outfit_recommendation": {
    "anchor": {
      "sku": "SF001",
      "name": "SFERA Black Blazer",
      "role": "anchor"
    },
    "paired_items": [
      {
        "sku": "LO001",
        "name": "SFERA White Blouse",
        "role": "supporting",
        "compatibility_score": 95,
        "pairing_reason": "same_collection"
      },
      {
        "sku": "CG002",
        "name": "Tailored Black Trousers",
        "role": "supporting",
        "compatibility_score": 92,
        "pairing_reason": "style_formality_match"
      },
      {
        "sku": "SH001",
        "name": "Classic Pumps",
        "role": "supporting",
        "compatibility_score": 88,
        "pairing_reason": "formality_match"
      }
    ],
    "overall_compatibility": 91,
    "outfit_completeness": 100
  }
}
```

---

## 9. Thai Context Pairing Rules

### 9.1 Office Pairing (Thai)

```
Thai Corporate Office:
- Conservative pairing preferred
- Avoid too much skin showing
- Classic combinations safe
- AC cold = layer essential

Thai Startup/Creative:
- More flexibility
- Trendy pairings OK
- Can be more expressive
- Still professional
```

### 9.2 Cultural Event Pairing

| Event | Pairing Guidance |
|-------|-----------------|
| Temple | Modest combinations, cover-up ready |
| Wedding (Thai) | Festive but not competing |
| Funeral | All black, simple pairings |
| Songkran | Practical, water-ready |
| Loy Krathong | Romantic, traditional optional |
| Royal occasions | Respectful, appropriate colors |

---

## 10. Cross-References

### Related Knowledge Base Files
- `/implementation/15_visual_matching_intelligence.md` - Visual harmony
- `/implementation/16_outfit_composition_rules.md` - Complete outfits
- `/implementation/14_outfit_generator_algorithm.md` - Algorithm integration
- `/implementation/12_product_matching.md` - Product selection
- `/special/advanced_jewelry_styling.md` - Jewelry pairing details
- `/advanced/10_advanced_styling.md` - Styling techniques

---

**Source:** OOTDay Knowledge Base Expansion
**Created:** February 2026
**Version:** 1.0
**Status:** Complete - Ready for Implementation
