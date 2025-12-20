# Implementation Category: Product Matching & Fashion Rules
## 12_product_matching.md

**Category:** Implementation Strategy
**Coverage:** Outfit matching rules, product schema, budget handling
**Priority:** ⭐⭐⭐ CRITICAL
**Source:** MASTER Knowledge Base - Styling rules, product matching, practical considerations

---

## 📚 TABLE OF CONTENTS

1. [Outfit Matching Rules](#rules)
2. [Color Harmony Matching](#colors)
3. [Silhouette & Body Type Matching](#silhouettes)
4. [Occasion Appropriateness](#occasions)
5. [Budget Optimization](#budget)
6. [Stock & Availability Handling](#inventory)
7. [Implementation Database Schema](#schema)

---

## <a name="rules"></a>✅ Core Outfit Matching Rules

### THE 70-20-10 RULE

```
OUTFIT COLOR DISTRIBUTION:

70% = Base Color (dominant neutral)
Examples: Black, navy, beige, white, gray

20% = Secondary Color (supporting)
Examples: Complementary tone, accent color

10% = Accent Color (pop/statement)
Examples: Jewelry, bag, one bright piece

MATCHING ALGORITHM:
1. Identify user's undertone (warm/cool/neutral)
2. Find 70% piece in matching undertone
3. Add 20% complementary piece
4. Suggest 10% accent (statement piece)
```

### THE THIRD PIECE RULE

```
FORMULA: Basic + Basic + Statement
= Instantly polished outfit

EXAMPLES:
✅ White tee + dark jeans + oversized blazer
✅ Simple blouse + dark pants + colored scarf
✅ Tank + skirt + structured jacket

ALGORITHM:
1. Identify 2 basic pieces user has/needs
2. Suggest complementary statement piece
3. = Elevated outfit instantly
```

### THE OCCASION LADDER

```
FORMALITY LEVELS:

0. SLEEP WEAR (PJs, loungewear)
1. HOME (very casual)
2. CASUAL OUTING (coffee, casual hangout)
3. SMART CASUAL (nice restaurant, casual office)
4. BUSINESS CASUAL (office, professional)
5. BUSINESS FORMAL (important meeting, formal event)
6. EVENING (dinner, party)
7. FORMAL (gala, wedding, black tie)

MATCHING RULE:
- Match all pieces to same formality level
- Everything should "talk" together
- Not: formal top + casual bottom
- YES: all smart casual OR all formal
```

### THE BODY TYPE HARMONY

```
BODY TYPE CONSIDERATIONS:

PEAR (wider hips):
✅ A-line skirts, wide-leg pants
✅ Darker bottoms
✅ Bright tops
❌ Skinny jeans, tight bottoms

APPLE (wider middle):
✅ Wrap dresses, empire waist
✅ Vertical lines
✅ Structured fabrics
❌ Clingy fabrics, belts at waist

HOURGLASS (balanced curves):
✅ Fitted everything
✅ Belts to show waist
✅ Wrap dresses
❌ Oversized, shapeless

RECTANGLE (straight):
✅ Peplum tops, ruffles
✅ Belts, layers for dimension
✅ Bright colors
❌ Straight silhouettes, plain

TRIANGLE (wider shoulders):
✅ A-line skirts, wide-leg
✅ Statement bottoms
✅ Dark tops
❌ Shoulder padding, puffed sleeves

INVERTED TRIANGLE (narrow hips):
✅ Flared skirts, wide-leg pants
✅ Bright bottoms
✅ A-lines
❌ Skinny jeans, narrow cuts
```

---

## <a name="colors"></a>🎨 Color Harmony Matching

### SEASONAL COLOR MATCHING

```
SPRING (Warm & Bright):
User undertone: Warm
Best colors: Bright, warm, vivid
✅ Apricot, sunflower, coral, peach
✅ Bright pastels
✅ Warm neutrals (warm beige, warm gray)
❌ Dusty, muted, cool tones

SUMMER (Cool & Soft):
User undertone: Cool + light-skinned
Best colors: Cool, muted, soft
✅ Soft pink, lavender, powder blue
✅ Cool pastels with gray undertones
✅ Cool neutrals (silver, cool gray)
❌ Warm tones, bold colors

AUTUMN (Warm & Muted):
User undertone: Warm + deep-skinned
Best colors: Warm, dark, muted
✅ Mustard, rust, olive green
✅ Warm earth tones
✅ Deep warm colors
❌ Cool, bright, cool neutrals

WINTER (Cool & Bold):
User undertone: Cool + deep-skinned
Best colors: Cool, bold, high-contrast
✅ Jewel tones, true colors, black
✅ Pure primary colors
✅ Cool metallics
❌ Warm, muted, pastel
```

### MATCHING ALGORITHM

```
1. DETERMINE SEASONAL TYPE:
   Input: User photo in natural light
   Analysis: Undertone + lightness
   Output: Spring/Summer/Autumn/Winter

2. FILTER INVENTORY:
   Query: Products in seasonal colors
   Example: "AUTUMN colors + 70% base"
   Result: Pre-filtered products

3. RANK BY HARMONY:
   Score 1: Exact seasonal match
   Score 2: Complementary color
   Score 3: Acceptable neutral
   Rank: 1, 2, 3 in recommendations

4. PRESENT TOP 3:
   - Show best match first
   - Explain WHY each works
   - Let user choose
```

### COLOR BLOCKING RULES

```
MONOCHROME (same color family):
Rule: Different shades of same color
Example: Light gray + medium gray + charcoal
Effect: Looks expensive, elongates
When: Any occasion (very safe)

COMPLEMENTARY (opposite color wheel):
Rule: Colors opposite each other
Example: Blue + orange, red + green
Effect: High contrast, vibrant
When: Bold statements, casual

ANALOGOUS (adjacent color wheel):
Rule: Colors next to each other
Example: Blue + purple, yellow + orange
Effect: Harmonious, coordinated
When: Most everyday outfits (safest)

TRIADIC (3 colors evenly spaced):
Rule: 3 colors equally spaced
Example: Red + yellow + blue
Effect: Balanced, interesting
When: Creative, fashion-forward only

MATCHING RULE:
Pick ONE color strategy
Don't mix strategies
Stick to 2-3 colors maximum
```

---

## <a name="silhouettes"></a>👗 Silhouette & Fit Matching

### PROPER FIT INDICATORS

```
TOPS SHOULD:
✅ Sit at natural shoulder seams
✅ Button fronts align with center
✅ Sleeves end at wrist bone
✅ Length covers sitting position
✅ No pulling or bunching
✅ Allows arm movement

BOTTOMS SHOULD:
✅ Sit at natural waist (or intended rise)
✅ No puckering at crotch
✅ No twisting or torquing
✅ Inseam hits at ankle bone
✅ No overhang at waistband
✅ Allows sitting without constriction

DRESSES SHOULD:
✅ Fit through shoulders
✅ Proper bust positioning
✅ Defined waist (if designed for it)
✅ Length appropriate to occasion
✅ No gaping or pulling
✅ Allows comfortable movement
```

### SILHOUETTE HARMONY

```
STRAIGHT ON STRAIGHT:
Straight blazer + straight dress
Result: Sleek, modern, elongating

FITTED ON FITTED:
Fitted top + fitted pants
Result: Curvy, professional, sharp

OVERSIZED ON FITTED:
Oversized top + fitted pants
Result: Balanced, comfortable, trendy

FITTED ON OVERSIZED:
Fitted top + wide-leg pants
Result: Balanced, elegant, modern

AVOID:
Oversized + Oversized = blob
Fitted + Oversized combo (wrong balance)
```

---

## <a name="occasions"></a>🎯 Occasion Appropriateness Matching

### OCCASION DATABASE

```
OCCASIONS & REQUIREMENTS:

CASUAL DAILY:
- Comfort = priority
- Any color works
- Casual silhouettes
- Affordable pieces OK
- Example: Jeans + tee + cardigan

CASUAL WEEKEND:
- Fun + comfortable
- Can try trends
- Bright colors OK
- Social-appropriate
- Example: Sundress + sandals

OFFICE/WORK:
- Professional required
- Conservative colors
- Structured pieces
- Quality visible
- Example: Blazer + dark pants + nice top

SMART CASUAL:
- Polished + comfortable
- Nice restaurant appropriate
- Dressy-casual mix
- Good-quality basics
- Example: Nice blouse + dark jeans + heels

BUSINESS FORMAL:
- Very professional
- Matching sets/coordinated
- Conservative colors
- High-quality essentials
- Example: Suit + white shirt + closed-toe heels

SOCIAL EVENT:
- Personality expression
- Fashionable acceptable
- Trendy OK
- Color/pattern more freedom
- Example: Dress + nice jewelry

FORMAL/GALA:
- Elegant required
- Statement pieces expected
- Makeup/hair important
- Quality paramount
- Example: Evening gown + heels + jewelry

SPECIAL OCCASION (wedding):
- Occasion-specific rules
- Often specific dress code
- Cultural considerations
- Nice details important
- Example: Dress matching code + appropriate jewelry
```

### OCCASION MATCHING ALGORITHM

```
1. IDENTIFY OCCASION:
   User input: "Formal dinner"
   Category: FORMAL

2. GET REQUIREMENTS:
   Formality: Business formal
   Color palette: Elegant colors
   Silhouette: Polished, structured
   Accessories: Statement appropriate

3. FILTER BY CATEGORY:
   Query: Products tagged "FORMAL"
   Filter by:
   - Formality level = formal
   - Quality = high
   - Colors = elegant palette

4. MATCH COMPLETE OUTFIT:
   Top + Bottom + Shoes + Bag
   All matching formality level

5. SUGGEST ALTERNATIVES:
   1st choice: Best match
   2nd choice: Good alternative
   3rd choice: Budget option
```

---

## <a name="budget"></a>💰 Budget Optimization Strategy

### BUDGET-AWARE RECOMMENDATIONS

```
BUDGET TIERS:

ULTRA-BUDGET (< ฿500):
- Fast fashion basics
- Trendy pieces (short-lived)
- Single-outfit items
- Risk: Quality, durability issues
- Use for: Trends, experimental

BUDGET-FRIENDLY (฿500-1,500):
- Quality basics
- Wearable staples
- Good value
- Best: Neutral colors
- Use for: Everyday, build foundation

MID-RANGE (฿1,500-3,000):
- Investment pieces
- Better quality
- Can be statement items
- Best: Versatile pieces
- Use for: Workwear, classic pieces

PREMIUM (฿3,000+):
- Designer/luxury
- Long-lasting
- Statement pieces
- Best: Special occasions
- Use for: Investment pieces

INVESTMENT EQUATION:
Cost-per-wear = Price / Times Worn
Best purchases: Items you'll wear 50+ times
Avoid: Expensive trendy pieces
```

### BUDGET ALLOCATION FORMULA

```
TOTAL OUTFIT BUDGET = ฿3,000

ALLOCATION:
- 40% = One versatile bottom (neutral)
  = ฿1,200 dark jeans or pants (wear often!)

- 30% = Tops (multiple pieces)
  = ฿900 for 3-4 basic tops
  = Can mix with items from closet

- 20% = Shoes
  = ฿600 comfortable everyday shoes
  = Most worn item!

- 10% = Accessories
  = ฿300 bag, jewelry, etc.
  = Can supplement with existing

RESULT: Wearable outfit immediately
Flexibility: Can wear with existing items
Smart: Prioritizes durability
```

### BUDGET MATCHING IN OOT

```
GATHERING BUDGET:
OOT: "งบประมาณเท่าไหร่พอดี?"

OPTIONS:
< ฿1,000: Show fast-fashion, trendy
฿1,000-2,000: Show good-quality mix
฿2,000-3,000: More premium options
฿3,000+: Premium, investment pieces

RECOMMENDATION:
"ในงบนี้ ฉันแนะนำ:
 ✅ ซื้อ [pants/skirt] ดีๆ
 ✅ เสื้อ [trendy] ถูกๆ
 ✅ รองเท้า [practical] กลาง
 = Complete outfit!"
```

---

## <a name="inventory"></a>📦 Stock & Availability Handling

### INVENTORY STATUS MATCHING

```
AVAILABILITY LEVELS:

✅ IN STOCK = Show first
Available to ship/pickup today

⏳ LIMITED STOCK = Show with warning
"Only 2 left! Order soon"
Good if user loves it

🔄 RESTOCK = Show alternative first
"Currently out, restock next week"
Option if user willing to wait

❌ OUT OF STOCK = Show similar
"Similar style in [color] available"
Don't show impossible options

RULE: Always have alternative
Never show unavailable as top choice
```

### SIMILARITY MATCHING

```
WHEN OUT OF STOCK, SUGGEST:

SIMILAR BY:
1. Style = Same silhouette
2. Color = Same undertone
3. Price = Similar price point
4. Occasion = Same occasion use
5. Quality = Same quality level

ALGORITHM:
Find product (Target)
Search: Same style + color + occasion
If none: Same style + similar color
If none: Similar style + same color
Return: Top 3 alternatives ranked
```

### CROSS-SELLING OPPORTUNITIES

```
WHEN USER LIKES ITEM:

SUGGEST COMPLEMENTARY:
- Different color (same style)
- Matching bottom/top
- Complementary accessory
- Shoes that work
- Bag that coordinates

RULE:
- Suggest items that enhance selection
- Don't push for "more expensive"
- Focus on "better outfit"
- Respect budget
- Provide value options

EXAMPLE:
User: "Love this blue dress!"
OOT: "Great choice! ดูดีมาก!

     นี่ recommended pairings:

     👗 DRESS + SHOES:
     - This dress works with:
     - Nude heels (elegant)
     - White sneakers (casual)
     - Black boots (fun)

     👜 ADD BAG:
     - Would you prefer:
     - Gold clutch (formal)
     - Casual tote (practical)
     - Statement bag (fashion)

     Which matters more?"
```

---

## <a name="schema"></a>🗄️ Implementation Database Schema

### PRODUCT SCHEMA

```
PRODUCT FIELDS:

product_id: unique identifier
name: product name (Thai + English)
category: clothing type
occasion: what it's for
formality_level: 0-7 scale
color: hex code + undertone (W/C/N)
color_season: Spring/Summer/Autumn/Winter
size_range: XS-XL + notes
price: Thai baht
quality_tier: budget/mid/premium
fit_notes: "oversized" "fitted" "straight"
body_type_match: pear/apple/etc (array)
occasion_tags: array of occasions
season: year-round/seasonal
stock_status: in-stock/limited/restock/oos
availability_date: when available
similar_products: array of product_ids
complements: array of product_ids
care_instructions: washing/materials
reviews: average rating
sustainable: true/false
```

### OUTFIT MATCHING SCHEMA

```
OUTFIT_RECOMMENDATION FIELDS:

recommendation_id: unique
user_id: user reference
occasion: gathered occasion
formality_level: determined level
budget: user's budget
body_type: identified type
color_season: determined season
products:
  - top: product_id
  - bottom: product_id
  - shoes: product_id
  - bag: product_id (optional)
  - jewelry: product_id (optional)
  - accessories: array
color_breakdown: 70-20-10 distribution
styling_notes: specific guidance
alternatives: array of outfit options
timestamp: when recommended
user_feedback: positive/negative
```

---

## 🎯 Implementation Checklist

**Product Matching Should:**
- ✅ Match color undertones accurately
- ✅ Respect body type guidelines
- ✅ Maintain formality consistency
- ✅ Optimize for budget constraints
- ✅ Handle stock limitations gracefully
- ✅ Suggest complete outfits
- ✅ Provide reasoning for choices
- ✅ Offer alternatives always

**Product Matching Should NOT:**
- ❌ Overload with options (limit to 3)
- ❌ Ignore body type considerations
- ❌ Mix formality levels
- ❌ Exceed budget limits
- ❌ Show unavailable as primary
- ❌ Pair incompatible items
- ❌ Recommend without explaining
- ❌ Ignore stock status

---

**Implementation Priority:** ⭐⭐⭐ CRITICAL
**System Impact:** HIGHEST (core conversion driver)
**Accuracy Required:** CRITICAL

**Version:** 1.0 Complete
**Ready For:** Product database integration
**Success Factor:** ACCURATE MATCHING ALGORITHM! 🎯
