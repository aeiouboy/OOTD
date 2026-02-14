# Chore: Expand Knowledge Base for Optimal AI Look & Product Matching

## Metadata
adw_id: `to`
prompt: `add more knowledge base all these suggest but exclude User Wardrobe Context`

## Chore Description

Expand the OOTDay knowledge base to enable optimal AI-powered look recommendations and product matching. This chore addresses critical gaps identified in the gap analysis while elegantly organizing new content into the existing knowledge base structure.

**Scope:** Add 6 new knowledge sections covering:
1. **Visual Matching Intelligence** - Silhouette, visual weight, outfit composition
2. **Outfit Composition Rules** - Complete look formulas, anchor piece theory, Thai climate layering
3. **Thai Micro-Season Fashion Calendar** - Bangkok-specific seasonal styling
4. **Price Intelligence** - Value metrics, investment guidance, sale patterns
5. **Social Proof Signals** - Popularity, influencer associations, trend indicators
6. **Cross-Product Compatibility Matrix** - Product-to-product pairing rules

**Exclusion:** User Wardrobe Context (already handled by Category 43: User Profiling)

## Relevant Files

### Existing Knowledge Base Structure
- `data/personas/knowledge_base/00_INDEX.md` - Master index to update with new sections
- `data/personas/knowledge_base/special/gap_analysis_missing_knowledge.md` - Gap analysis reference
- `data/personas/knowledge_base/special/missing_categories_41-48.md` - Placeholder structure reference
- `data/personas/knowledge_base/implementation/14_outfit_generator_algorithm.md` - Outfit generator to align with
- `data/personas/knowledge_base/implementation/12_product_matching.md` - Product matching rules to extend

### Reference Files for Content
- `data/personas/knowledge_base/advanced/07_festivals_holidays.md` - Thai seasonal events reference
- `data/personas/knowledge_base/foundation/01_fashion_fundamentals.md` - Style categories reference
- `data/personas/knowledge_base/foundation/05_brands_shopping.md` - Brand intelligence reference
- `data/personas/knowledge_base/advanced/10_advanced_styling.md` - Outfit formulas reference
- `apps/web/lib/mock-data03.ts` - Current product attribute schema reference

### New Files

#### Implementation Tier (AI-Specific)
- `data/personas/knowledge_base/implementation/15_visual_matching_intelligence.md` - Visual vocabulary for image-to-product matching
- `data/personas/knowledge_base/implementation/16_outfit_composition_rules.md` - Complete outfit building logic
- `data/personas/knowledge_base/implementation/17_cross_product_compatibility.md` - Product pairing matrix

#### Advanced Tier (Enhanced Knowledge)
- `data/personas/knowledge_base/advanced/12_thai_micro_seasons.md` - Bangkok fashion calendar
- `data/personas/knowledge_base/advanced/13_price_intelligence.md` - Value assessment and timing

#### Special Topics
- `data/personas/knowledge_base/special/social_proof_signals.md` - Popularity and trend indicators

#### Summaries
- `data/personas/knowledge_base/summaries/summary_15_visual_matching.md`
- `data/personas/knowledge_base/summaries/summary_16_outfit_composition.md`
- `data/personas/knowledge_base/summaries/summary_17_cross_product.md`
- `data/personas/knowledge_base/summaries/summary_12_thai_micro_seasons.md`
- `data/personas/knowledge_base/summaries/summary_13_price_intelligence.md`
- `data/personas/knowledge_base/summaries/summary_social_proof.md`

## Step by Step Tasks

### 1. Create Visual Matching Intelligence (implementation/15_visual_matching_intelligence.md)
- Define silhouette vocabulary: A-line, H-line, X-line, I-line, fitted, oversized, boxy, relaxed, structured
- Document visual weight system: light (airy fabrics, pastels), medium (cotton, mid-tones), heavy (wool, dark colors, structured)
- Create proportion ratio classification: top-heavy, balanced, bottom-heavy
- Define color block patterns: solid, two-tone, gradient, color-block, multi-pattern
- Establish texture visual vocabulary: matte, sheen, glossy, textured, mixed
- Document outfit role classification: anchor piece, supporting piece, accent, statement
- Add visual balance principles specific to Thai body proportions (155-160cm average)
- Include image embedding guidance for vector search implementation
- Cross-reference with existing color theory (08_color_theory.md) and body types (03_body_types_styling.md)

### 2. Create Outfit Composition Rules (implementation/16_outfit_composition_rules.md)
- Document Complete Look Formulas:
  - Business Casual: blazer + [blouse/top options] + [trouser/skirt options] + [heel/flat options]
  - Weekend Brunch: [casual anchor] + [layer options] + [accessory rules]
  - Date Night: [dress code] + [statement piece] + [finishing touches]
  - Temple Visit: [modest requirements] + [color guidance] + [footwear rules]
  - Wedding Guest: [formality tier] + [color restrictions] + [accessory balance]
- Define Anchor Piece Theory:
  - Each look has 1 anchor piece as starting point
  - Supporting pieces complement, never compete
  - Statement piece rules (max 1 per outfit)
- Create Thai Climate Layering System:
  - Indoor AC (22°C) vs Outdoor (35°C) transition rules
  - Layer-friendly pieces (cardigans, light jackets, scarves)
  - Quick-change strategies for Thai weather
- Document outfit completeness checklist by occasion
- Include budget allocation formulas per outfit type
- Cross-reference with occasions (04_occasions_dress_codes.md) and styling (10_advanced_styling.md)

### 3. Create Thai Micro-Season Fashion Calendar (advanced/12_thai_micro_seasons.md)
- Map Bangkok Fashion Calendar:
  - ม.ค.-ก.พ. (Jan-Feb): Cool season peak - layer-friendly, cozy styles, deeper colors
  - มี.ค.-เม.ย. (Mar-Apr): Pre-Songkran - white, pastels, breathable fabrics
  - พ.ค.-ก.ค. (May-Jul): Rainy starts - waterproof considerations, dark colors, practical footwear
  - ส.ค.-ต.ค. (Aug-Oct): Peak rain - practical > fashion, quick-dry materials
  - พ.ย.-ธ.ค. (Nov-Dec): Cool returns - Loy Krathong elegance, NYE glam, holiday sparkle
- Document Event-Based Trending:
  - Songkran week: white spike, water-resistant, practical
  - Mother's Day (Aug 12): light blue trending
  - Father's Day (Dec 5): yellow trending
  - CNY period: red everything
  - Valentine's: red, pink, romantic
- Create Shopping Calendar alignment:
  - When to buy what (pre-season vs sale timing)
  - Central Group sale alignment
- Cross-reference with festivals (07_festivals_holidays.md) and Thai culture (02_thai_culture_fashion.md)

### 4. Create Price Intelligence (advanced/13_price_intelligence.md)
- Define Cost-Per-Wear Calculation:
  - Formula: price ÷ expected wears = cost per wear
  - Target thresholds: <฿100/wear excellent, <฿200/wear good, >฿500/wear reconsider
  - Examples by category (basics vs statement pieces)
- Create Investment Piece Criteria:
  - Quality indicators (construction, materials, brand reputation)
  - Longevity markers (classic vs trendy)
  - Versatility score (occasions, pairings)
- Document Sale Frequency by Brand:
  - Central Group brands: typical sale calendar
  - Zara/H&M/Uniqlo: seasonal patterns
  - Thai brands: Jaspal, Kloset patterns
- Define Quality-to-Price Ratio Tiers:
  - Tier 1: Exceptional value (quality > price suggests)
  - Tier 2: Fair value (quality = price)
  - Tier 3: Premium (paying for brand/trend)
  - Tier 4: Overpriced (quality < price)
- Include budget strategy recommendations by user segment
- Cross-reference with brands (05_brands_shopping.md)

### 5. Create Social Proof Signals (special/social_proof_signals.md)
- Define Popularity Metrics:
  - Sales velocity indicators
  - Trending score (rising interest)
  - Stock scarcity signals
- Document Influencer Associations:
  - Thai celebrity style categories
  - K-pop idol influence mapping
  - Instagram/TikTok trend indicators
- Create Hashtag Intelligence:
  - Thai fashion hashtags (#OOTD, #แฟชั่น, #ลุคประจำวัน)
  - Trend hashtags by season
  - Platform-specific trends (IG vs TikTok)
- Map Review Sentiment Categories:
  - Fit feedback patterns
  - Quality feedback patterns
  - Style/aesthetic feedback
- Include "as seen on" data structure for celebrity/influencer tracking
- Cross-reference with social media (09_social_media_trends.md)

### 6. Create Cross-Product Compatibility Matrix (implementation/17_cross_product_compatibility.md)
- Define Pairing Categories:
  - Top + Bottom compatibility rules
  - Dress + Outerwear combinations
  - Footwear appropriateness matrix
  - Bag + Outfit harmony
  - Jewelry + Neckline matrix (extend from jewelry_styling.md)
- Create Style Consistency Scoring:
  - Aesthetic match score (0-100)
  - Formality level compatibility (±2 rule)
  - Color harmony score
- Document Pattern Mixing Rules:
  - Safe combinations (solid + pattern)
  - Advanced combinations (pattern + pattern)
  - Thai-appropriate pattern mixing
- Build Essential Pairings Lists:
  - What items NEED what companions (e.g., formal blazer needs formal pants)
  - Missing piece detection logic
- Create Versatility Scoring:
  - How many outfits can this piece create (1-10)
  - Cross-occasion flexibility
- Define Product Relationship Types:
  - Perfect match (designed together)
  - Great pair (aesthetic + formality aligned)
  - Works well (compatible basics)
  - Acceptable (functional match)
  - Avoid (clash warning)
- Cross-reference with outfit generator (14_outfit_generator_algorithm.md) and product matching (12_product_matching.md)

### 7. Create Summary Files for All New Sections
- Create `summary_15_visual_matching.md` - Quick reference for visual vocabulary
- Create `summary_16_outfit_composition.md` - Outfit formula cheat sheet
- Create `summary_17_cross_product.md` - Pairing rules quick guide
- Create `summary_12_thai_micro_seasons.md` - Monthly styling calendar
- Create `summary_13_price_intelligence.md` - Value assessment guide
- Create `summary_social_proof.md` - Trend indicator reference
- Follow existing summary format from `summaries/` folder

### 8. Update Master Index (00_INDEX.md)
- Add new implementation sections (15, 16, 17) under TIER 3
- Add new advanced sections (12, 13) under TIER 2
- Add new special topic (social_proof_signals) under SPECIAL TOPICS
- Update statistics: Total Sections from 63 → 69
- Add cross-references in Quick Search Guide
- Update Implementation Priority Matrix with new sections

### 9. Validate Knowledge Base Consistency
- Verify all cross-references between new and existing files are valid
- Ensure terminology consistency across all documents
- Check Thai language accuracy and natural phrasing
- Validate alignment with outfit generator algorithm scoring dimensions
- Confirm product attribute recommendations align with mock-data03.ts schema

## Validation Commands

Execute these commands to validate the chore is complete:

- `ls -la data/personas/knowledge_base/implementation/` - Verify files 15, 16, 17 exist
- `ls -la data/personas/knowledge_base/advanced/` - Verify files 12, 13 exist
- `ls -la data/personas/knowledge_base/special/` - Verify social_proof_signals.md exists
- `ls -la data/personas/knowledge_base/summaries/` - Verify all 6 new summary files exist
- `grep -c "visual_matching\|outfit_composition\|cross_product\|micro_season\|price_intelligence\|social_proof" data/personas/knowledge_base/00_INDEX.md` - Verify index updated (should return 6+)
- `wc -l data/personas/knowledge_base/implementation/15_visual_matching_intelligence.md` - Verify substantial content (>200 lines expected)
- `wc -l data/personas/knowledge_base/implementation/16_outfit_composition_rules.md` - Verify substantial content (>300 lines expected)
- `wc -l data/personas/knowledge_base/implementation/17_cross_product_compatibility.md` - Verify substantial content (>250 lines expected)

## Notes

### Design Philosophy
This expansion follows "elegant thinking" principles:
- **Modular**: Each section is self-contained yet cross-referenced
- **Hierarchical**: Implementation tier for AI-specific logic, Advanced tier for enhanced knowledge, Special for deep dives
- **Practical**: Every concept includes Thai-specific examples and real-world application
- **Aligned**: New attributes map to existing mock-data03.ts schema structure

### Knowledge Base Statistics After Completion
- Total Sections: 69 (from 63)
- New Implementation Sections: 3
- New Advanced Sections: 2
- New Special Topics: 1
- Estimated New Content: ~25,000-30,000 words

### Integration Points
- **Outfit Generator Algorithm (14)**: Visual matching and composition rules enhance the 5-dimension scoring
- **Product Matching (12)**: Cross-product compatibility extends existing pairing logic
- **Summer 2026 Trends (11)**: Thai micro-seasons provide implementation context

### Exclusions (per user request)
- User Wardrobe Context: Handled by existing Category 43 (User Profiling & Personalization)
- This keeps focus on PRODUCT intelligence rather than USER inventory tracking

### Future Considerations
- These sections prepare groundwork for image-based matching (future Category 48)
- Cross-product compatibility matrix can evolve into ML-based recommendation engine
- Social proof signals enable real-time trend integration
