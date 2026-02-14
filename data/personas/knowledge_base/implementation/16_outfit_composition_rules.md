# Outfit Composition Rules
## Complete Look Building Logic for AI Fashion Recommendations

**Status:** Complete
**Version:** 1.0
**Last Updated:** February 2026
**Priority:** CRITICAL for Complete Outfit Recommendations
**Language:** Thai & English

---

## Overview

This document defines the rules and formulas for building complete outfits. The AI must recommend complete looks, not just individual items. This requires understanding what pieces are needed together, how they interact, and how to balance the entire composition.

**Key Insight:** A recommendation of "nice blazer" is incomplete. Users need "blazer + top + bottom + shoes + bag" = complete look.

---

## 1. Complete Look Formulas by Occasion

### 1.1 Business Professional (สำหรับทำงาน - Formal Office)

**Required Components:**
| Component | Options | Required | Priority |
|-----------|---------|----------|----------|
| **Top/Dress** | Blouse, dress shirt, sheath dress | ✅ Yes | 1 |
| **Bottom** | Tailored pants, pencil skirt | ✅ If not dress | 1 |
| **Jacket/Blazer** | Structured blazer, suit jacket | ✅ Yes | 1 |
| **Footwear** | Closed-toe heels, loafers, oxfords | ✅ Yes | 1 |
| **Bag** | Structured tote, briefcase | ✅ Yes | 2 |
| **Accessories** | Watch, simple earrings | Optional | 3 |

**Color Rules:**
- Neutral base (navy, black, gray, beige)
- Max 3 colors total
- White/cream blouse = universal safe choice
- Pattern max 1 piece

**Budget Allocation (฿5,000 total example):**
```
Blazer: 40% (฿2,000)
Bottom: 25% (฿1,250)
Top: 20% (฿1,000)
Shoes: 15% (฿750) - or invest more in quality shoes
```

---

### 1.2 Business Casual (สำหรับทำงาน - Casual Office)

**Required Components:**
| Component | Options | Required | Priority |
|-----------|---------|----------|----------|
| **Top** | Blouse, nice top, lightweight sweater | ✅ Yes | 1 |
| **Bottom** | Chinos, dark jeans, midi skirt | ✅ Yes | 1 |
| **Layer** | Cardigan, unstructured blazer | Optional | 2 |
| **Footwear** | Loafers, low heels, nice flats | ✅ Yes | 1 |
| **Bag** | Tote, structured crossbody | ✅ Yes | 2 |
| **Accessories** | Watch, simple jewelry | Optional | 3 |

**Color Rules:**
- More flexibility than formal
- Earth tones, soft colors acceptable
- Pattern allowed (1-2 pieces if coordinated)
- Denim acceptable in many offices

**Thai Office Context:**
- AC is COLD (22-24°C) - always have layer option
- Conservative is safer if unsure
- Fridays may be more casual

---

### 1.3 Weekend Brunch (สำหรับเจอเพื่อน - Casual Social)

**Required Components:**
| Component | Options | Required | Priority |
|-----------|---------|----------|----------|
| **Anchor** | Casual dress, nice top, trendy piece | ✅ Yes | 1 |
| **Bottom** | Jeans, casual pants, skirt | ✅ If not dress | 1 |
| **Layer** | Light cardigan, denim jacket | Optional | 3 |
| **Footwear** | Sneakers, sandals, casual flats | ✅ Yes | 1 |
| **Bag** | Crossbody, small tote | ✅ Yes | 2 |
| **Accessories** | Fun jewelry, sunglasses | Optional | 3 |

**Color Rules:**
- Freedom! Bright colors welcome
- Patterns and prints encouraged
- Mix and match acceptable
- Express personality

**Budget Allocation (฿2,000 total example):**
```
Anchor piece: 50% (฿1,000)
Bottom/Layer: 30% (฿600)
Shoes: 20% (฿400)
```

---

### 1.4 Date Night (เดทกับแฟน - Romantic Evening)

**Required Components:**
| Component | Options | Required | Priority |
|-----------|---------|----------|----------|
| **Anchor** | Dress, nice top + skirt combo | ✅ Yes | 1 |
| **Bottom** | If not dress: nice pants/skirt | ✅ If needed | 1 |
| **Layer** | Light jacket (for AC/evening) | Optional | 3 |
| **Footwear** | Heels, nice sandals, dressy flats | ✅ Yes | 1 |
| **Bag** | Clutch, small crossbody | ✅ Yes | 2 |
| **Accessories** | Statement jewelry OR subtle | ✅ Yes | 2 |

**Style Guidance:**
- Show effort without trying too hard
- Choose what makes you feel confident
- Consider venue (restaurant vs bar vs movie)
- Comfortable enough to enjoy yourself

**Color Suggestions:**
- Red (bold, passionate)
- Black (classic, sophisticated)
- Soft pink/blush (romantic)
- Navy (elegant)
- White/cream (fresh, clean)

---

### 1.5 Temple Visit (ไปวัด - Religious Setting)

**Required Components:**
| Component | Options | Required | Priority |
|-----------|---------|----------|----------|
| **Top** | Modest blouse, covered shoulders | ✅ Yes | 1 |
| **Bottom** | Long pants, long skirt (below knee) | ✅ Yes | 1 |
| **Footwear** | Easy to remove, comfortable | ✅ Yes | 1 |
| **Cover-up** | Shawl/cardigan (if sleeveless) | As needed | 2 |

**Strict Rules:**
- ❌ NO shorts
- ❌ NO sleeveless (or must cover with shawl)
- ❌ NO tight/revealing clothing
- ❌ NO black (inauspicious for temple)
- ✅ White, cream, pastel preferred
- ✅ Modest, respectful appearance

**Color Hierarchy:**
1. White (pure, merit-making)
2. Cream/off-white
3. Light pastel (yellow, light blue, light pink)
4. Neutral earth tones

**Footwear:**
- Sandals or slip-ons (remove at temple entrance)
- Comfortable for walking
- Clean, presentable

---

### 1.6 Wedding Guest (งานแต่งงาน - Celebration)

**Required Components:**
| Component | Options | Required | Priority |
|-----------|---------|----------|----------|
| **Outfit** | Dress, or formal separates | ✅ Yes | 1 |
| **Footwear** | Heels, dressy sandals | ✅ Yes | 1 |
| **Bag** | Clutch, evening bag | ✅ Yes | 2 |
| **Accessories** | Jewelry, hair accessories | ✅ Yes | 2 |

**Thai Wedding Color Rules:**
| Color | Status | Reason |
|-------|--------|--------|
| **White** | ❌ NEVER | Reserved for bride |
| **Black** | ⚠️ Avoid | Funeral association (unless theme) |
| **Red** | ⚠️ Careful | OK for Chinese weddings, check |
| **Bright colors** | ✅ Good | Festive, celebratory |
| **Pastels** | ✅ Great | Elegant, appropriate |
| **Gold/Silver** | ✅ Great | Celebratory, formal |

**Formality Levels:**
- **Grand wedding (hotel ballroom):** Long dress, formal
- **Garden wedding:** Dressy but practical (no stilettos)
- **Casual wedding:** Follow invitation guidance
- **Thai ceremony:** Traditional or Thai-inspired OK

---

### 1.7 Funeral/Merit-Making (งานศพ/ทำบุญ - Mourning)

**Required Components:**
| Component | Options | Required | Priority |
|-----------|---------|----------|----------|
| **Top** | Black blouse, modest | ✅ Yes | 1 |
| **Bottom** | Black pants, black skirt (long) | ✅ Yes | 1 |
| **Footwear** | Black closed-toe shoes | ✅ Yes | 1 |
| **Accessories** | Minimal, no flashy jewelry | Optional | 3 |

**Strict Rules:**
- ✅ ALL BLACK (or very dark navy)
- ❌ NO bright colors
- ❌ NO flashy jewelry
- ❌ NO revealing clothing
- ✅ Modest, respectful
- ✅ Simple, understated

---

### 1.8 Songkran Festival (สงกรานต์ - Water Festival)

**Morning Temple Visit:**
Same as Temple Visit (1.5) - white/pastels, modest

**Afternoon Water Play:**
| Component | Options | Required | Notes |
|-----------|---------|----------|-------|
| **Top** | Quick-dry, dark colors | ✅ Yes | White becomes see-through! |
| **Bottom** | Shorts, quick-dry pants | ✅ Yes | Will get soaked |
| **Footwear** | Water shoes, sandals | ✅ Yes | No leather/suede |
| **Swimwear** | Under clothes | Recommended | Modesty when wet |

**Pro Tips:**
- Dark colors (won't show when wet)
- Secure top (tie, not loose)
- Waterproof bag/pouch for phone
- Hair tied back
- Minimal/no makeup

---

## 2. Anchor Piece Theory

### 2.1 What is an Anchor Piece?

The **Anchor Piece** is the foundation of every outfit. It:
- Sets the tone/mood of the outfit
- Has the most visual impact
- Other pieces coordinate around it
- Usually (but not always) the most coverage

### 2.2 Anchor Identification by Category

| Category | Anchor Potential | When It's Anchor |
|----------|------------------|------------------|
| **Dress** | Very High | Almost always anchor |
| **Suit** | Very High | When worn as set |
| **Statement Piece** | High | Bold colors, patterns |
| **Blazer** | Medium-High | Structured, dominant |
| **Pants** | Medium | If statement pants |
| **Basic Top** | Low | Rarely anchor |
| **Accessories** | Low | Only if statement |

### 2.3 One Anchor Rule

```
✅ CORRECT: Outfit has 1 clear anchor
   - Floral dress (ANCHOR) + nude heels + simple bag

❌ WRONG: Two competing anchors
   - Floral dress + leopard print coat (BOTH fighting for attention)

❌ WRONG: No anchor
   - White tee + beige pants + nude flats (everything neutral, no focus)
```

### 2.4 Anchor + Supporting Harmony

```json
{
  "outfitComposition": {
    "anchor": {
      "role": "anchor",
      "visualWeight": 7,
      "attention": "primary"
    },
    "supporting": [
      {
        "role": "supporting",
        "visualWeight": 4,
        "attention": "secondary"
      },
      {
        "role": "accent",
        "visualWeight": 2,
        "attention": "tertiary"
      }
    ]
  }
}
```

---

## 3. Statement Piece Rules

### 3.1 Statement Piece Definition

A **Statement Piece** demands attention through:
- Bold color
- Unusual pattern
- Unique silhouette
- Eye-catching details
- Designer/luxury item

### 3.2 Statement Piece Limits

```
Rule: Maximum 1 Statement Piece per outfit

WHY: Multiple statements compete, creating chaos
     No clear focal point = visual confusion
```

### 3.3 When Statement Piece is Anchor

If statement piece IS the anchor:
- All other pieces MUST be neutral
- Supporting pieces should be simple
- Let statement piece shine

**Example:**
```
Statement Anchor: Bold red blazer
Supporting: White silk blouse
Supporting: Black tailored pants
Accent: Simple gold jewelry
```

### 3.4 Statement Piece as Accent

Statement as accent (not anchor):
- Works when anchor is strong but neutral
- Statement adds pop without dominating
- Common for accessories

**Example:**
```
Anchor: Navy midi dress (strong but neutral)
Supporting: Nude heels
Statement Accent: Bold statement necklace
```

---

## 4. Thai Climate Layering System

### 4.1 The Thai Climate Challenge

**The Reality:**
- Outdoor: 30-35°C (hot, humid)
- Indoor AC: 20-24°C (COLD for Thais)
- Transition: Constant throughout day

**The Solution:**
- Always have removable layer
- Dress for indoor + carry outdoor solution
- Quick-change capability

### 4.2 Layer Categories for Thai Climate

| Layer Type | When to Use | Examples |
|------------|-------------|----------|
| **Light Cardigan** | AC offices, malls | Cotton, light knit |
| **Light Blazer** | Business casual | Unlined, breathable |
| **Shawl/Scarf** | Versatile, compact | Large scarf doubles as wrap |
| **Denim Jacket** | Casual settings | Classic, goes with everything |
| **Light Jacket** | Cool season | Bomber, utility jacket |

### 4.3 Layering Formulas

**Formula 1: Office Worker**
```
Indoor: Blouse + light cardigan + pants
Outdoor: Remove cardigan (carry in bag)
```

**Formula 2: Mall Hopper**
```
Indoor Mall: T-shirt + light jacket
Outdoor: Tie jacket around waist
```

**Formula 3: Business Meeting**
```
Indoor: Full suit/blazer look
Outdoor: Remove blazer, carry
```

### 4.4 Quick-Change Strategies

| Challenge | Solution |
|-----------|----------|
| Very hot outside → cold inside | Light layer in bag, add when entering |
| Full day out and about | Choose breathable layers that pack small |
| Rain uncertainty | Bring water-resistant outer |
| Evening event after work | Keep evening layer at desk |

---

## 5. Outfit Completeness Checklist

### 5.1 The Complete Outfit Test

**For every outfit recommendation, verify:**

☐ **Anchor Piece Identified**
   - One clear focus piece
   - Appropriate for occasion

☐ **Coverage Complete**
   - Top covered (blouse/top/dress)
   - Bottom covered (if not dress)
   - Appropriate skin coverage for occasion

☐ **Footwear Included**
   - Matches formality level
   - Appropriate for venue/weather

☐ **Bag Suggested**
   - Size appropriate for occasion
   - Style matches outfit

☐ **Accessories Considered**
   - Jewelry if appropriate
   - Hair/hat if relevant

☐ **Layer Option** (Thai climate)
   - Cardigan/jacket for AC
   - Or noted as unnecessary

☐ **Color Harmony**
   - Colors work together
   - No more than 3 main colors

☐ **Formality Consistency**
   - All pieces at same formality level
   - No mismatched casualness

☐ **Occasion Appropriate**
   - Meets dress code requirements
   - Cultural rules respected

### 5.2 Completeness Score

```
Completeness Score = (Components Present / Components Required) × 100

90-100% = Complete outfit ✅
70-89% = Nearly complete (specify what's missing)
Below 70% = Incomplete (add required pieces)
```

---

## 6. Budget Allocation Formulas

### 6.1 Investment Priority by Category

| Category | Investment Priority | Why |
|----------|---------------------|-----|
| **Shoes** | High | Comfort, quality visible, worn often |
| **Bags** | High | Used daily, defines style |
| **Blazers** | High | Transforms outfits, long-lasting |
| **Pants** | Medium-High | Foundation piece, fit crucial |
| **Dresses** | Medium | Occasion-dependent frequency |
| **Tops** | Medium | Need variety, wear frequently |
| **Accessories** | Low-Medium | Can find affordable options |

### 6.2 Budget Allocation by Total Budget

**Budget: ฿2,000 (Essential)**
```
Must have 1-2 key pieces only
- Invest in ONE quality anchor (฿1,200-1,500)
- Basic supporting pieces (฿500-800)
- Skip non-essentials
```

**Budget: ฿5,000 (Comfortable)**
```
Can build complete outfit
- Anchor piece: 40% (฿2,000)
- Supporting top: 20% (฿1,000)
- Bottom: 20% (฿1,000)
- Shoes or bag: 20% (฿1,000)
```

**Budget: ฿10,000 (Investment)**
```
Quality complete look
- Anchor piece: 35% (฿3,500)
- Quality bottom: 20% (฿2,000)
- Nice top: 15% (฿1,500)
- Good shoes: 20% (฿2,000)
- Bag: 10% (฿1,000)
```

**Budget: ฿20,000+ (Luxury)**
```
All quality pieces
- Invest heavily in shoes + bag (lasting)
- Quality basics that last
- Statement piece if desired
- Consider Central Group luxury brands
```

### 6.3 Thai Brand Budget Mapping

| Budget Range | Recommended Brands |
|--------------|-------------------|
| ฿500-1,500 | CPS, H&M, Cotton On |
| ฿1,500-3,000 | Jaspal, Zara, Mango |
| ฿3,000-5,000 | Kloset, Soda, COS |
| ฿5,000-10,000 | Greyhound, selected Jaspal |
| ฿10,000+ | VATANIKA, designer items |

---

## 7. Occasion-Based Completeness Requirements

### 7.1 Minimum Required Components by Occasion

| Occasion | Components Required | Optional But Nice |
|----------|--------------------|--------------------|
| **Work Formal** | Top + Bottom + Blazer + Closed shoes + Bag | Watch, earrings |
| **Work Casual** | Top + Bottom + Nice shoes + Bag | Layer, jewelry |
| **Casual Out** | Top + Bottom + Shoes | Bag, accessories |
| **Date Night** | Complete outfit + Shoes + Small bag | Jewelry, perfume |
| **Wedding** | Dress/Formal + Heels + Clutch + Jewelry | Hair accessory |
| **Temple** | Modest top + Long bottom + Easy shoes | Shawl |
| **Beach/Pool** | Swimwear + Cover-up + Sandals | Hat, bag |

### 7.2 Completeness Error Messages

When outfit is incomplete:

```
Missing Footwear:
"ชุดสวยมากค่ะ! ขาดรองเท้านิดนึง ลองดูรองเท้าส้นสูงสีนู้ดจะเข้ากันดีเลย"

Missing Bag:
"ลุคนี้เก๋มาก! เพิ่มกระเป๋าคลัทช์ทองจะปังเลยค่ะ"

Missing Layer (for Thai climate):
"อ๋อ เพิ่มคาร์ดิแกนบางๆ เผื่อแอร์เย็นด้วยนะคะ"

Incomplete for Occasion:
"ไปงานแต่งงานต้องมีเครื่องประดับด้วยค่ะ ลองดูต่างหูเพชรเล็กๆ"
```

---

## 8. Color Coordination Rules

### 8.1 Maximum Color Rule

```
Rule: Max 3 main colors per outfit

Why: More than 3 = visual chaos
     Less focused = less polished
```

### 8.2 Color Ratio Formulas

**60-30-10 Rule:**
```
60% = Dominant color (anchor piece)
30% = Secondary color (supporting pieces)
10% = Accent color (accessories, pop of color)
```

**Example:**
```
60% Navy (dress)
30% White (shoes, bag)
10% Gold (jewelry)
```

### 8.3 Neutral + Color Approach

**Safe Formula:**
```
1-2 Neutral pieces + 1 Color piece

Neutrals: Black, white, navy, gray, beige, camel
Color: Any color that flatters

Example:
Black pants + White blouse + Red blazer
```

### 8.4 Color + Color (Advanced)

**Complementary:**
```
Colors opposite on color wheel
Blue + Orange
Purple + Yellow
```

**Analogous:**
```
Colors next to each other
Blue + Teal + Green
Orange + Red + Pink
```

**Monochromatic:**
```
Same color, different shades
Light pink + Dusty rose + Deep pink
```

---

## 9. Thai Context Specific Rules

### 9.1 Formality Hierarchy (Thai Setting)

| Context | Formality Level | Safe Choice |
|---------|-----------------|-------------|
| Thai Government Office | Very High | Conservative suit |
| Bank/Corporate | High | Business formal |
| Private Company | Medium-High | Business casual |
| Startup/Creative | Medium | Smart casual |
| University | Medium | Neat casual |
| Mall/Shopping | Low | Casual |

### 9.2 Thai Modesty Expectations

| Setting | Shoulder | Knee | Neckline |
|---------|----------|------|----------|
| Temple | Covered | Covered | High |
| Office | Covered | At knee | Modest |
| School/Uni | Covered | At knee | High |
| Mall | OK exposed | OK above | OK lower |
| Club/Bar | OK exposed | OK short | OK low |

### 9.3 Auspicious Color Integration

When user mentions:
- Birth day colors (วันเกิด)
- Lucky colors (สีมงคล)
- Fortune colors (สีนำโชค)

→ Incorporate into outfit while maintaining style

```
Example:
User: "เกิดวันอาทิตย์ค่ะ อยากใส่สีมงคลไปสัมภาษณ์"
Recommendation: Red accent (lucky color) with professional base
"ใส่บลาซเซอร์สีกรมกับกางเกงดำ แล้วเพิ่มผ้าพันคอสีแดง (สีมงคลวันอาทิตย์) เป็น accent ค่ะ"
```

---

## 10. Implementation for AI

### 10.1 Outfit Building Algorithm

```python
def build_complete_outfit(occasion, budget, preferences):
    """
    Build complete outfit for given occasion

    Steps:
    1. Determine required components
    2. Select anchor piece
    3. Add supporting pieces
    4. Verify completeness
    5. Check color harmony
    6. Verify formality
    7. Calculate budget allocation
    8. Return complete outfit
    """

    # Get requirements
    required = get_occasion_requirements(occasion)

    # Build outfit
    outfit = {
        'anchor': select_anchor(occasion, budget, preferences),
        'supporting': [],
        'accents': []
    }

    # Add supporting pieces
    for component in required['supporting']:
        piece = select_supporting(component, outfit['anchor'])
        outfit['supporting'].append(piece)

    # Verify completeness
    if not is_complete(outfit, required):
        add_missing_pieces(outfit, required)

    # Verify color harmony
    if not check_color_harmony(outfit):
        adjust_colors(outfit)

    return outfit
```

### 10.2 Response Format

```json
{
  "outfit": {
    "occasion": "business-casual",
    "anchor": {
      "item": "Navy blazer",
      "sku": "SF001",
      "price": 2490,
      "role": "anchor"
    },
    "components": [
      {
        "item": "White silk blouse",
        "sku": "LO001",
        "price": 1290,
        "role": "supporting"
      },
      {
        "item": "Black tailored pants",
        "sku": "CG002",
        "price": 1590,
        "role": "supporting"
      },
      {
        "item": "Nude heels",
        "sku": "SH001",
        "price": 1990,
        "role": "supporting"
      }
    ],
    "accessories": [
      {
        "item": "Gold hoop earrings",
        "role": "accent"
      }
    ],
    "total_price": 7360,
    "color_palette": ["navy", "white", "black", "gold"],
    "completeness_score": 100
  }
}
```

---

## 11. Cross-References

### Related Knowledge Base Files
- `/foundation/04_occasions_dress_codes.md` - Occasion details
- `/advanced/10_advanced_styling.md` - Styling techniques
- `/implementation/15_visual_matching_intelligence.md` - Visual vocabulary
- `/implementation/17_cross_product_compatibility.md` - Product pairing
- `/implementation/14_outfit_generator_algorithm.md` - Algorithm integration
- `/advanced/07_festivals_holidays.md` - Festival-specific rules

---

**Source:** OOTDay Knowledge Base Expansion
**Created:** February 2026
**Version:** 1.0
**Status:** Complete - Ready for Implementation
