# Summary: Product Matching & Fashion Rules
**Quick Reference Guide (1-page)**

## Overview
Core outfit matching rules, color harmony, body type matching, occasion appropriateness, budget optimization, and database schema for product recommendations.

## Core Outfit Matching Rules

### THE 70-20-10 RULE (CRITICAL!)
```
70% = Base Color (dominant neutral)
     Examples: Black, navy, beige, white, gray

20% = Secondary Color (supporting complementary)
     Examples: Complementary tone, accent color

10% = Accent Color (pop/statement!)
     Examples: Jewelry, bag, one bright piece
```

**Algorithm**:
1. Identify user's undertone (warm/cool/neutral)
2. Find 70% piece in matching undertone
3. Add 20% complementary piece
4. Suggest 10% accent (statement piece)

### THE THIRD PIECE RULE
```
Formula: Basic + Basic + Statement = Instantly polished

Examples:
✅ White tee + dark jeans + oversized blazer
✅ Simple blouse + dark pants + colored scarf
✅ Tank + skirt + structured jacket
```

### THE OCCASION LADDER (Formality Levels)
```
0. SLEEP WEAR (PJs)
1. HOME (very casual)
2. CASUAL OUTING (coffee)
3. SMART CASUAL (nice restaurant)
4. BUSINESS CASUAL (office)
5. BUSINESS FORMAL (important meeting)
6. EVENING (party)
7. FORMAL (gala, black tie)

RULE: Match ALL pieces to same formality level!
```

## Color Harmony Matching Algorithm

### SEASONAL COLOR MATCHING
```
SPRING (Warm & Bright):
✅ Apricot, sunflower, coral, peach
✅ Bright pastels, warm neutrals
❌ Dusty, muted, cool tones

SUMMER (Cool & Soft):
✅ Soft pink, lavender, powder blue
✅ Cool pastels with gray undertones
❌ Warm tones, bold colors

AUTUMN (Warm & Muted):
✅ Mustard, rust, olive green
✅ Deep warm colors, earth tones
❌ Cool, bright, cool neutrals

WINTER (Cool & Bold):
✅ Jewel tones, true colors, black
✅ Pure primary colors, black & white
❌ Warm, muted, pastel
```

### MATCHING ALGORITHM
1. **Determine seasonal type**: Photo analysis in natural light
2. **Filter inventory**: Products in seasonal colors (70% base)
3. **Rank by harmony**: Score 1 (exact match) > Score 2 (complementary) > Score 3 (acceptable)
4. **Present top 3**: Explain WHY each works, let user choose

### COLOR BLOCKING RULES
- **Monochromatic**: Same color family = looks expensive, elongates
- **Complementary**: Opposite colors = high contrast, vibrant
- **Analogous**: Adjacent colors = harmonious, safe
- **Triadic**: 3 colors spaced = balanced, creative

## Body Type Harmony Matching

### PEAR (Wide hips)
✅ A-line skirts, wide-leg pants, dark bottoms, bright tops
❌ Skinny jeans, tight bottoms

### APPLE (Wide middle)
✅ Wrap dresses, empire waist, vertical lines, structured
❌ Clingy, belts at waist, crop tops

### HOURGLASS (Balanced curves)
✅ Fitted everything, belts to show waist, wrap dresses
❌ Oversized, shapeless

### RECTANGLE (Straight)
✅ Peplum tops, ruffles, belts, dimension, bright colors
❌ Straight silhouettes, plain

### INVERTED TRIANGLE (Broad shoulders)
✅ A-line skirts, wide-leg pants, bright bottoms
❌ Shoulder padding, puffed sleeves

## Occasion Appropriateness Matching

### MATCHING ALGORITHM
1. **Identify occasion**: User input → category mapping
2. **Get requirements**: Formality level, colors, silhouette, accessories
3. **Filter inventory**: Products tagged for that occasion
4. **Match complete outfit**: Top + Bottom + Shoes + Bag (all same formality!)
5. **Suggest alternatives**: 1st choice best, 2nd good, 3rd budget option

### OCCASION DATABASE
- **Casual daily**: Comfort = priority, any color, casual silhouettes
- **Office/work**: Professional, conservative colors, structured, quality
- **Smart casual**: Polished + comfortable, good-quality basics
- **Business formal**: Very professional, matching sets, conservative
- **Social event**: Personality expression, fashionable, color freedom
- **Formal/gala**: Elegant, statement pieces, quality, makeup/hair
- **Special occasion**: Occasion-specific rules, cultural considerations

## Budget Optimization Strategy

### BUDGET TIERS
- **Ultra-budget** (< ฿500): Fast fashion basics, trendy, experimental
- **Budget-friendly** (฿500-1,500): Quality basics, wearable staples, good value
- **Mid-range** (฿1,500-3,000): Investment pieces, professional wear, better quality
- **Premium** (฿3,000-7,000): Quality designer, investment basics
- **Luxury** (> ฿7,000): Designer pieces, luxury investment

### VALUE ASSESSMENT
```
WORTH MONEY: Classic pieces, quality basics, good shoes, investment pieces
NOT WORTH: Trendy, uncomfortable, wrong size, duplicates, "someday" pieces

COST PER WEAR = Price ÷ Times Worn
GOAL: Under ฿100/wear = good value

Example: ฿3,000 jeans ÷ 100 wears = ฿30/wear ✅ (excellent!)
Example: ฿5,000 dress ÷ 2 wears = ฿2,500/wear ❌ (terrible!)
```

## Silhouette & Fit Matching

### PROPER FIT CHECKLIST
**Tops**: Shoulders at seams, no pulling, sleeves end at wrist, covers sitting, allows movement
**Bottoms**: Natural waist, no puckering, proper inseam, no overhang, allows sitting
**Dresses**: Proper shoulders, bust positioning, defined waist, appropriate length, comfortable

### SILHOUETTE HARMONY
- **Straight on straight**: Sleek, modern, elongating
- **Fitted on fitted**: Curvy, professional, sharp
- **Oversized on fitted**: Balanced, comfortable, trendy
- **Fitted on oversized**: Balanced, elegant, modern
- **AVOID**: Oversized + oversized = blob!

## Critical Implementation Notes

### TRUST-BUILDING ACCURACY
- **Wrong sizing** = returns = bad experience = lost trust
- **Right sizing advice** = happy customers = loyalty
- **Always verify brand** before suggesting size
- **Warn about significant variations** (Zara runs small!)
- **Extra caution on expensive items** (luxury sizing risky)

### ALGORITHM PRIORITIES
1. Identify user's seasonal color type FIRST
2. Verify body type for flattery
3. Match to specific occasion (formality critical!)
4. Filter by budget constraints
5. Ensure proper fit (measure if possible)
6. Present top 3 with explanations
7. Always explain WHY choices work together

## Quick Reference Formulas
```
OUTFIT FORMULA: 70% neutral + 20% complementary + 10% accent
BODY TYPE: Match cuts to flatter proportions
OCCASION: All pieces same formality level
BUDGET: Balance quantity vs quality vs trends
COLOR: Undertone + lightness = seasonal palette
SIZING: VERIFY BRAND (critical for trust!)
```

## Database Schema Elements (For Product Tagging)
```
PRODUCT MUST INCLUDE:
- Seasonal color (spring/summer/autumn/winter)
- Formality level (1-7 scale)
- Body type suitability (which shapes it flatters)
- Occasion tags (casual/office/formal/special)
- Budget tier
- Brand sizing notes (true/small/large)
- Quality indicators (fabric, construction)
- Thai proportion fit notes (length, proportions)
- Styling tips (what goes with this)
```

## Cross-References
- 01_fashion_fundamentals.md (fabric + color foundation)
- 03_body_types_styling.md (detailed body type guidance)
- 05_brands_shopping.md (brand sizing intelligence)
- 08_color_theory.md (color science deep dive)

---
**Usage**: Product recommendation algorithm, outfit matching guidance, occasion-appropriate selections, budget-conscious recommendations, sizing accuracy.
