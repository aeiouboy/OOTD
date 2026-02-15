# Total Look Flat-Lay + Cross-Look Contamination Fix

**Date**: 2026-02-14
**Status**: Approved for implementation
**Approach**: Prompt-Centric (Approach A)

---

## Problems

### Problem 1: Cross-Look Contamination
Items from different looks are mixed into a single flat-lay image. Root cause: `generateFlatLayForOutfit` in `ChatAssistant.tsx` uses a shared `replacementCatalog` (all products from all looks + chat history) to swap products for "visual consistency". A product originally in Look 2 can replace a product in Look 1.

### Problem 2: Looks Are Not "Total Looks"
Each look only has 1-2 items (e.g., dress + blazer) instead of a complete outfit with accessories. User expects a flat-lay showing a "total look" — shirt + pants + shoes + bag + hat, etc.

**Root cause**: The product catalog has 4,488 products but is heavily imbalanced:
- Shoes: 3,012 (67%)
- Clothing: 1,456 (32%)
- Bags: 20 (0.4%)
- Hats/Jewelry/Belts/Scarves: **0**

The AI cannot create complete looks with only catalog products. Solution: Use RAG fashion knowledge to provide accessory descriptions for flat-lay visualization.

---

## Expected Result (ASCII)

### Before (Current) — Cross-Look Contamination + Incomplete Looks

```
  Chat Response                    Flat-Lay Image (BROKEN)
 ┌────────────────────┐           ┌─────────────────────────┐
 │ Look 1: Office Chic│           │                         │
 │  • Navy Dress       │ ──gen──▶ │   ┌───────┐ ┌───────┐  │
 │  • Black Heels      │          │   │ Dress │ │ Heels │  │
 │                     │          │   │ from  │ │ from  │  │
 │ Look 2: Weekend     │          │   │Look 2!│ │Look 1 │  │ ← Items mixed!
 │  • Floral Top       │          │   └───────┘ └───────┘  │
 │  • White Sneakers   │          │                         │
 └────────────────────┘           │   Only 2 items shown    │ ← Incomplete!
                                  │   No bag, no jewelry    │
                                  └─────────────────────────┘

 "Shop this look" panel
 ┌────────────────────┐
 │ Look 1:            │
 │  🛒 Navy Dress     │  ← only 2 items, not a "total look"
 │  🛒 Black Heels    │
 └────────────────────┘
```

**Problems visible:**
1. Flat-lay image shows items from wrong look (replacement catalog mixes looks)
2. Only 1-2 items per look — no accessories (bag, hat, jewelry)
3. User sees incomplete outfit, not a styled "total look"

### After (Fixed) — Isolated Looks + Total Look with Styling

```
  Chat Response                    Flat-Lay Image (FIXED)
 ┌────────────────────┐           ┌─────────────────────────────┐
 │ Look 1: Office Chic│           │                             │
 │  ITEM: Navy Dress   │          │  ┌───────┐  ┌───────┐      │
 │  ITEM: Black Heels  │ ──gen──▶ │  │ Navy  │  │ Black │      │
 │  ITEM: White Blazer │          │  │ Dress │  │ Heels │      │
 │  STYLING: Tote Bag  │          │  └───────┘  └───────┘      │
 │  STYLING: Earrings  │          │  ┌───────┐  ┌─────┐ ┌───┐ │
 │                     │          │  │ White │  │Tote │ │ ● │ │
 └────────────────────┘           │  │Blazer │  │ Bag │ │ear│ │
                                  │  └───────┘  └─────┘ └───┘ │
                                  │                             │
                                  │  5 items = complete look!   │
                                  └─────────────────────────────┘

 "Shop this look" panel            (STYLING items NOT shown here)
 ┌────────────────────┐
 │ Look 1:            │
 │  🛒 Navy Dress      │ ← catalog product (purchasable)
 │  🛒 Black Heels     │ ← catalog product (purchasable)
 │  🛒 White Blazer    │ ← catalog product (purchasable)
 │                     │
 │  (Tote Bag and      │ ← styling items are in flat-lay
 │   Earrings are in   │    image only, NOT listed here
 │   the image only)   │
 └────────────────────┘
```

### Data Flow — ITEM vs STYLING Separation

```
 AI Response (system-prompt-v5)
 ┌──────────────────────────────────────────────────────┐
 │ ---LOOKS_DATA---                                     │
 │ LOOK:1|Office Chic                                   │
 │ ITEM:Navy Dress|Dress|Navy|Elegant midi|SKU01|4990|… │ ─┐
 │ ITEM:Black Heels|Footwear|Black|Classic|SKU02|3990|… │  ├─ catalog items
 │ ITEM:White Blazer|Outerwear|White|Linen|SKU03|5490|… │ ─┘
 │ STYLING:Structured black leather tote bag|Bag        │ ─┐
 │ STYLING:Gold minimalist stud earrings|Jewelry        │ ─┘─ styling items
 │ TIP:Layer the blazer for meetings                    │
 │ TOTAL:14470                                          │ ← sum of ITEMs only
 │ ---END_LOOKS_DATA---                                 │
 └──────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
    looks-parser.ts               looks-parser.ts
    parses ITEM lines             parses STYLING lines
           │                              │
           ▼                              ▼
   ChatLook.items[]              ChatLook.stylingItems[]
   (ChatLookItem[])              (ChatLookStyling[])
           │                              │
           ▼                              ▼
  chat-look-transformers.ts      passed through to
  → Outfit.items (Product[])     Outfit.stylingItems[]
           │                              │
     ┌─────┴──────┐                       │
     ▼            ▼                       ▼
 "Shop this    Flat-lay               Flat-lay
  look" panel  generation             generation
 (catalog      (catalog items         (styling items
  products     as FlatLayItem         as FlatLayItem
  only)        with thumbnailUrl)     with description only)
               ──────────┬────────────────┘
                         ▼
               Combined flat-lay image
               (complete "total look")
```

### Per-Look Isolation (No Cross-Contamination)

```
 BEFORE (shared replacementCatalog):

  Look 1 items ──┐
                  ├──▶ replacementCatalog ──▶ flat-lay for Look 1
  Look 2 items ──┘     (mixed pool!)              (may contain Look 2 items!)


 AFTER (isolated per-look):

  Look 1 items ──────────────────────────▶ flat-lay for Look 1 ✓
  Look 1 stylingItems ──────────────────/  (only Look 1 items)

  Look 2 items ──────────────────────────▶ flat-lay for Look 2 ✓
  Look 2 stylingItems ──────────────────/  (only Look 2 items)
```

---

## End-to-End RAG Retrieval Flow — Use Case: "ชุดปาร์ตี้ สีแดง"

### Full Pipeline Overview

```
 User: "ชุดปาร์ตี้ สีแดง"
 ════════════════════
          │
          ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │  STEP 1: User Query Analysis (analyzeUserQuery)                 │
 │                                                                  │
 │  "ชุดปาร์ตี้ สีแดง"                                                │
 │       │          │                                               │
 │       ▼          ▼                                               │
 │  detectedOccasion: "party"    detectedColors: ["red"]           │
 │  detectedGender: undefined    budget: undefined                 │
 └──────────────────────────────────────────────────────────────────┘
          │
          ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │  STEP 2: Occasion Detection (detectOccasion)                    │
 │                                                                  │
 │  keyword match: "ปาร์ตี้" → occasion = "party"                    │
 │  OCCASIONS["party"].formalityRange = { min: 4, max: 8 }         │
 └──────────────────────────────────────────────────────────────────┘
          │
          ├──────────────────── 3 parallel data fetches ──────────────┐
          │                          │                                │
          ▼                          ▼                                ▼
 ┌─────────────────┐   ┌─────────────────────┐   ┌──────────────────────┐
 │ STEP 3a:        │   │ STEP 3b:            │   │ STEP 3c:             │
 │ Heuristic       │   │ Semantic Product    │   │ RAG Knowledge        │
 │ Product Filter  │   │ Search (pgvector)   │   │ Retrieval (hybrid)   │
 │                 │   │                     │   │                      │
 │ filterProducts  │   │ searchProductsFrom  │   │ retrieveKnowledge    │
 │ ForRequest()    │   │ Supabase()          │   │ WithRAG()            │
 └────────┬────────┘   └──────────┬──────────┘   └───────────┬──────────┘
          │                       │                           │
          ▼                       ▼                           ▼
    (details below)         (details below)           (details below)
```

### STEP 3a: Heuristic Product Filtering

```
 filterProductsForRequest("ชุดปาร์ตี้ สีแดง", occasion="party")
 ┌──────────────────────────────────────────────────────────────────┐
 │                                                                  │
 │  Supabase `products` table (1,000 products)                     │
 │  ┌──────────────────────────────────────────────────────┐       │
 │  │ id │ product_name    │ price │ occasion_party │ ... │       │
 │  │────│─────────────────│───────│────────────────│─────│       │
 │  │ p1 │ Red Sequin Dress│ 5,990 │ 0.95           │     │       │
 │  │ p2 │ Navy Blazer     │ 4,490 │ 0.30           │     │       │
 │  │ p3 │ Red Midi Skirt  │ 2,990 │ 0.75           │     │       │
 │  │ p4 │ Black Heels     │ 3,990 │ 0.85           │     │       │
 │  │ .. │ ...             │ ...   │ ...            │     │       │
 │  └──────────────────────────────────────────────────────┘       │
 │                         │                                       │
 │                         ▼                                       │
 │  applyFilters:                                                  │
 │    ✓ gender: "women" (default MVP)                              │
 │    ✓ occasions: ["party"]                                       │
 │    ✓ availability: ["in_stock", "low_stock"]                    │
 │    ✗ budget: none specified                                     │
 │                         │                                       │
 │                         ▼                                       │
 │  filterByFormality(formalityRange: 4-8):                        │
 │    ✓ Red Sequin Dress  (formality: 7) → PASS                   │
 │    ✗ Navy Blazer       (formality: 8, but party score 0.30)     │
 │    ✓ Red Midi Skirt    (formality: 5) → PASS                   │
 │    ✓ Black Heels       (formality: 6) → PASS                   │
 │                         │                                       │
 │                         ▼                                       │
 │  Color filter (resolvedColors: ["red"]):                        │
 │    Products with red/แดง in name/color get priority             │
 │                                                                  │
 │  Result: ~20-40 party-appropriate products                      │
 └──────────────────────────────────────────────────────────────────┘
```

### STEP 3b: Semantic Product Search (pgvector)

```
 searchProductsFromSupabase("ชุดปาร์ตี้ สีแดง", "party", 30, "women")
 ┌──────────────────────────────────────────────────────────────────┐
 │                                                                  │
 │  ① Generate embedding (OpenAI text-embedding-3-small)           │
 │     "ชุดปาร์ตี้ สีแดง" → [0.12, -0.05, 0.31, ...] (1536 dims)   │
 │                         │                                       │
 │                         ▼                                       │
 │  ② Supabase RPC: search_products                                │
 │     ┌──────────────────────────────────────────────────┐        │
 │     │ query_embedding: [0.12, -0.05, 0.31, ...]       │        │
 │     │ occasion_filter: "party"                         │        │
 │     │ match_threshold: 0.25  (Thai→EN cross-lang)      │        │
 │     │ match_count: 30                                  │        │
 │     │ gender_filter: "women"                           │        │
 │     └──────────────────────────────────────────────────┘        │
 │                         │                                       │
 │                         ▼                                       │
 │  pgvector cosine similarity search:                             │
 │     Products ranked by semantic similarity to "party red outfit"│
 │                                                                  │
 │     ┌─────────────────────────────────────────────┐             │
 │     │ product_name         │ similarity │ price   │             │
 │     │──────────────────────│────────────│─────────│             │
 │     │ Red Sequin Dress     │ 0.82       │ 5,990   │             │
 │     │ Crimson Party Top    │ 0.78       │ 2,490   │             │
 │     │ Red Midi Skirt       │ 0.71       │ 2,990   │             │
 │     │ Strappy Red Heels    │ 0.65       │ 3,990   │             │
 │     │ ...                  │ ...        │ ...     │             │
 │     └─────────────────────────────────────────────┘             │
 │                                                                  │
 │  Result: ~15-30 semantically similar products                   │
 └──────────────────────────────────────────────────────────────────┘
```

### STEP 3c: RAG Knowledge Retrieval (Hybrid)

```
 retrieveKnowledgeWithRAG("ชุดปาร์ตี้ สีแดง", gender=undefined, occasion="party")
 ┌──────────────────────────────────────────────────────────────────┐
 │                                                                  │
 │  ① Translate Thai → English (Gemini 2.0 Flash)                  │
 │     "ชุดปาร์ตี้ สีแดง" → "party outfit red color"                 │
 │                                                                  │
 │  ②  Two searches run in PARALLEL (Promise.allSettled):           │
 │                                                                  │
 │  ┌─────────────────────────────┐  ┌───────────────────────────┐ │
 │  │ Vector Search (Supabase)    │  │ Keyword Fallback          │ │
 │  │                             │  │                           │ │
 │  │ embedding("party outfit     │  │ detectKnowledgeTopics(    │ │
 │  │   red color")               │  │   "ชุดปาร์ตี้ สีแดง")       │ │
 │  │          │                  │  │          │                │ │
 │  │          ▼                  │  │          ▼                │ │
 │  │ RPC: search_knowledge      │  │ keyword match:            │ │
 │  │   match_threshold: 0.25    │  │   "ปาร์ตี้" → occasion     │ │
 │  │   topK: 5                  │  │   "สี"    → color         │ │
 │  │   category: undefined      │  │          │                │ │
 │  │          │                  │  │          ▼                │ │
 │  │          ▼                  │  │ formatKnowledgeForPrompt: │ │
 │  │ Supabase `knowledge_chunks`│  │  • Party dress code rules │ │
 │  │ ┌────────────────────────┐ │  │  • Color theory basics    │ │
 │  │ │ title       │sim │tier│ │  │                           │ │
 │  │ │─────────────│────│────│ │  └───────────┬───────────────┘ │
 │  │ │ Party Dress │0.72│ 1  │ │              │                 │
 │  │ │  Code       │    │    │ │              │                 │
 │  │ │ Color Match │0.58│ 1  │ │              │                 │
 │  │ │  for Events │    │    │ │              │                 │
 │  │ │ Thai Night  │0.45│ 2  │ │              │                 │
 │  │ │  Life Style │    │    │ │              │                 │
 │  │ │ Cocktail    │0.38│ 2  │ │              │                 │
 │  │ │  Attire     │    │    │ │              │                 │
 │  │ └────────────────────────┘ │              │                 │
 │  └─────────────┬───────────────┘              │                 │
 │                │                              │                 │
 │                ▼                              ▼                 │
 │  ③ mergeRAGResults:                                             │
 │     vector context (priority) + keyword context (supplement)    │
 │                                                                  │
 │  Result: knowledgeContext string injected into AI prompt         │
 │  ┌──────────────────────────────────────────────────────┐       │
 │  │ "Party dressing: sequins, bold colors, statement     │       │
 │  │  pieces are encouraged. Red is a power color for     │       │
 │  │  evening events. Pair with metallic accessories.     │       │
 │  │  Thai nightlife: slightly more conservative than     │       │
 │  │  Western parties. Avoid overly revealing cuts..."    │       │
 │  └──────────────────────────────────────────────────────┘       │
 └──────────────────────────────────────────────────────────────────┘
```

### STEP 3c+: Occasion Rules Retrieval (RAG-driven, NEW)

```
 buildOccasionInstruction("party", "ชุดปาร์ตี้ สีแดง")
 ┌──────────────────────────────────────────────────────────────────┐
 │                                                                  │
 │  ① retrieveOccasionRules("party")                               │
 │          │                                                       │
 │          ▼                                                       │
 │  Supabase RPC: search_knowledge_by_occasion  ← NEW RPC         │
 │  ┌──────────────────────────────────────────────────────┐       │
 │  │ occasion_type: "party"                               │       │
 │  │ max_results: 6                                       │       │
 │  └──────────────────────────────────────────────────────┘       │
 │          │                                                       │
 │          ▼                                                       │
 │  Filter: knowledge_chunks WHERE metadata->'occasions' ? 'party' │
 │  (NO embedding needed — pure metadata filter, very fast)        │
 │                                                                  │
 │  ┌────────────────────────────────────────────────────────┐     │
 │  │ title                    │ category │ tier │ content   │     │
 │  │──────────────────────────│──────────│──────│───────────│     │
 │  │ Party Dress Code         │ occasion │  1   │ "Sequins, │     │
 │  │                          │          │      │  bold..." │     │
 │  │ Evening Accessory Guide  │ styling  │  1   │ "Clutch   │     │
 │  │                          │          │      │  bag..."  │     │
 │  │ Thai Nightlife Etiquette │ culture  │  2   │ "Not too  │     │
 │  │                          │          │      │  reveal.."│     │
 │  │ Statement Jewelry Rules  │ styling  │  2   │ "Bold     │     │
 │  │                          │          │      │  earring.."│    │
 │  └────────────────────────────────────────────────────────┘     │
 │          │                                                       │
 │          ▼                                                       │
 │  ② Format as occasion instruction:                              │
 │  ┌──────────────────────────────────────────────────────┐       │
 │  │ [MANDATORY OCCASION CONTEXT — READ BEFORE RESPONDING]│       │
 │  │ User's occasion: ปาร์ตี้ / Party                      │       │
 │  │ Formality range: 4-8                                 │       │
 │  │                                                      │       │
 │  │ [OCCASION KNOWLEDGE — party]                         │       │
 │  │ Sequins, bold colors, statement pieces are           │       │
 │  │ encouraged. Clutch bag or small crossbody...         │       │
 │  │ Thai nightlife: slightly more conservative...        │       │
 │  │ Bold earrings, layered necklaces for evening...      │       │
 │  │ [END OCCASION KNOWLEDGE]                             │       │
 │  │                                                      │       │
 │  │ YOUR RESPONSE TEXT MUST reference ปาร์ตี้.            │       │
 │  └──────────────────────────────────────────────────────┘       │
 │                                                                  │
 │  ③ Fallback (if RAG returns empty):                             │
 │     Uses hardcoded styleGuidelines from occasions.ts            │
 │     keyPieces: ["sequin dress", "heels", "clutch bag"]          │
 │     avoidItems: ["sneakers", "polo", "flip-flops"]              │
 └──────────────────────────────────────────────────────────────────┘
```

### STEP 4-5: Merge Products + Rank + Build AI Prompt

```
 ┌──────────────────────────────────────────────────────────────────┐
 │  STEP 4: Merge Semantic + Heuristic Products                    │
 │                                                                  │
 │  Semantic (pgvector)          Heuristic (filter)                │
 │  ┌────────────────────┐      ┌────────────────────┐            │
 │  │ Red Sequin Dress   │      │ Red Sequin Dress   │ ← deduped  │
 │  │ Crimson Party Top  │      │ Red Midi Skirt     │            │
 │  │ Red Midi Skirt     │      │ Black Heels        │            │
 │  │ Strappy Red Heels  │      │ Pink Satin Blouse  │            │
 │  └────────────────────┘      └────────────────────┘            │
 │           │                           │                         │
 │           └──────────┬────────────────┘                         │
 │                      ▼                                          │
 │  Deduplicate by SKU (semantic first for priority):              │
 │  ┌──────────────────────────────────────────────┐              │
 │  │ 1. Red Sequin Dress    (semantic)            │              │
 │  │ 2. Crimson Party Top   (semantic)            │              │
 │  │ 3. Red Midi Skirt      (semantic+heuristic)  │              │
 │  │ 4. Strappy Red Heels   (semantic)            │              │
 │  │ 5. Black Heels         (heuristic only)      │              │
 │  │ 6. Pink Satin Blouse   (heuristic only)      │              │
 │  │ ...                                          │              │
 │  └──────────────────────────────────────────────┘              │
 │                      │                                          │
 │                      ▼                                          │
 │  rankProductsByRelevance(occasion="party", budget=none)         │
 │  → Top 50 serialized as pipe-delimited catalog                 │
 └──────────────────────────────────────────────────────────────────┘
          │
          ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │  STEP 5: Build Final AI Prompt                                  │
 │                                                                  │
 │  ┌────────────────────────────────────────────────────────────┐ │
 │  │ [USER PROFILE]                                             │ │
 │  │ Gender: women                                              │ │
 │  │                                                            │ │
 │  │ [TEMPLATE INSTRUCTION]  ← v5 template (clothing category) │ │
 │  │                                                            │ │
 │  │ [FASHION KNOWLEDGE]     ← from STEP 3c (RAG hybrid)      │ │
 │  │ Party dressing: sequins, bold colors...                    │ │
 │  │ Red is a power color for evening...                        │ │
 │  │ Thai nightlife: slightly more conservative...              │ │
 │  │                                                            │ │
 │  │ [PRODUCT CATALOG]       ← from STEP 4 (merged products)  │ │
 │  │ SKU|Name|Brand|Price|Category|Colors|Occasion|...         │ │
 │  │ SKU01|Red Sequin Dress|ZARA|5990|Dress|Red|party|...      │ │
 │  │ SKU02|Crimson Party Top|COS|2490|Top|Red|party|...        │ │
 │  │ ... (50 products max)                                      │ │
 │  │                                                            │ │
 │  │ [MANDATORY OCCASION CONTEXT]  ← from STEP 3c+ (RAG rules)│ │
 │  │ User's occasion: ปาร์ตี้ / Party                            │ │
 │  │ Formality range: 4-8                                       │ │
 │  │ [OCCASION KNOWLEDGE — party]                               │ │
 │  │ Sequins, bold colors, clutch bag, bold earrings...         │ │
 │  │ [END OCCASION KNOWLEDGE]                                   │ │
 │  │                                                            │ │
 │  │ User message: ชุดปาร์ตี้ สีแดง                               │ │
 │  └────────────────────────────────────────────────────────────┘ │
 │                      │                                          │
 │                      ▼                                          │
 │  callOpenRouter (Gemini 3 Flash, temp 0.7)                      │
 │  + system-prompt-v5 (STYLING format instructions)               │
 └──────────────────────────────────────────────────────────────────┘
```

### STEP 6-7: AI Response → Parser → Flat-Lay

```
 AI generates structured response:
 ┌──────────────────────────────────────────────────────────────────┐
 │ สวยมากเลยค่ะ! มาดูชุดปาร์ตี้สีแดงสุดปังกันค่ะ 🎉              │
 │                                                                  │
 │ ---LOOKS_DATA---                                                │
 │ LOOK:1|Red Glamour Night                                        │
 │ ITEM:Red Sequin Dress|Dress|Red|สวยปังปาร์ตี้|SKU01|5990|url1  │  ← catalog
 │ ITEM:Strappy Red Heels|Heels|Red|ส้นสูงเปรี้ยว|SKU04|3990|url2 │  ← catalog
 │ ITEM:Crimson Party Top|Top|Red|ท็อปแดงเลือดหมู|SKU02|2490|url3 │  ← catalog
 │ STYLING:Red crystal clutch bag|Bag                              │  ← knowledge
 │ STYLING:Gold statement drop earrings|Jewelry                    │  ← knowledge
 │ TIP:เลือกกระเป๋าคลัตช์และต่างหูทองเพื่อเพิ่มความปังให้ลุคปาร์ตี้│
 │ TOTAL:12470                                                     │
 │ LOOK:2|Chic Red Evening                                         │
 │ ITEM:Red Midi Skirt|Skirt|Red|กระโปรงมิดี้|SKU03|2990|url4     │  ← catalog
 │ ITEM:Pink Satin Blouse|Top|Pink|เสื้อซาตินชมพู|SKU06|1990|url5 │  ← catalog
 │ ITEM:Black Heels|Heels|Black|ส้นสูงดำคลาสสิก|SKU05|3990|url6   │  ← catalog
 │ STYLING:Black envelope clutch|Bag                               │  ← knowledge
 │ TIP:มิกซ์แดง-ชมพู-ดำ ลุค chic ใส่ไปปาร์ตี้ได้เลยค่ะ            │
 │ TOTAL:8970                                                      │
 │ ---END_LOOKS_DATA---                                            │
 └──────────────────────────────────────────────────────────────────┘
          │
          ▼
 looks-parser.ts (parseLooksData)
 ┌──────────────────────────────────────────────────────────────────┐
 │  Parse ITEM lines → ChatLookItem[]                              │
 │  Parse STYLING lines → ChatLookStyling[]    ← NEW              │
 │  Parse TIP → string                                             │
 │  Parse TOTAL → number (ITEMs only, STYLING has no price)        │
 └──────────────────────────────────────────────────────────────────┘
          │
          ▼
 chat-look-transformers.ts (convertLooksToOutfits)
 ┌──────────────────────────────────────────────────────────────────┐
 │                                                                  │
 │  Outfit {                                                       │
 │    id: "look-1708...-1"                                         │
 │    title: "Red Glamour Night"                                   │
 │    items: [                     ← catalog products (purchasable)│
 │      Product(Red Sequin Dress),                                 │
 │      Product(Strappy Red Heels),                                │
 │      Product(Crimson Party Top),                                │
 │    ]                                                            │
 │    stylingItems: [              ← knowledge accessories (NEW)   │
 │      { description: "Red crystal clutch bag", category: "Bag" } │
 │      { description: "Gold statement drop earrings", cat: "..." }│
 │    ]                                                            │
 │  }                                                              │
 └──────────────────────────────────────────────────────────────────┘
          │
          ├────────────────────────────────┐
          ▼                                ▼
 "Shop this look" panel           Flat-lay image generation
 (OutfitDetail.tsx)               (generateFlatLayForOutfit)
 ┌──────────────────────┐         ┌──────────────────────────────┐
 │ 🛒 Red Sequin Dress  │         │  flatLayItems = [            │
 │    ฿5,990  [ซื้อ]    │         │    { name: "Red Sequin Dress"│
 │ 🛒 Strappy Red Heels │         │      thumbnailUrl: "..." },  │ ← catalog
 │    ฿3,990  [ซื้อ]    │         │    { name: "Strappy Red.."   │
 │ 🛒 Crimson Party Top │         │      thumbnailUrl: "..." },  │ ← catalog
 │    ฿2,490  [ซื้อ]    │         │    { name: "Crimson Party.." │
 │                       │         │      thumbnailUrl: "..." },  │ ← catalog
 │ (NO clutch bag here)  │         │    { name: "Red crystal.."   │
 │ (NO earrings here)    │         │      description only },     │ ← knowledge
 │                       │         │    { name: "Gold statement.."│
 │ Total: ฿12,470       │         │      description only },     │ ← knowledge
 └──────────────────────┘         │  ]                           │
   Only purchasable items          │         │                    │
                                   │         ▼                    │
                                   │  POST /api/generate-image    │
                                   │  Gemini generates flat-lay   │
                                   │  with ALL 5 items            │
                                   │                              │
                                   │  ┌────────────────────────┐ │
                                   │  │ ┌──────┐  ┌──────────┐│ │
                                   │  │ │Sequin│  │ Red Heels ││ │
                                   │  │ │Dress │  │           ││ │
                                   │  │ └──────┘  └──────────┘│ │
                                   │  │ ┌──────┐ ┌─────┐ ┌──┐│ │
                                   │  │ │Party │ │Clutch│ │💎││ │
                                   │  │ │ Top  │ │ Bag │ │  ││ │
                                   │  │ └──────┘ └─────┘ └──┘│ │
                                   │  │   Complete total look! │ │
                                   │  └────────────────────────┘ │
                                   └──────────────────────────────┘
```

### Summary: Where Each Data Source Feeds Into

```
 ┌───────────────────────────────────────────────────────────────────┐
 │                    Data Sources for "ชุดปาร์ตี้ สีแดง"             │
 ├─────────────────────┬─────────────────┬───────────────────────────┤
 │ Data Source         │ What It Provides│ Where It Goes             │
 ├─────────────────────┼─────────────────┼───────────────────────────┤
 │ Supabase `products` │ Catalog items   │ • Heuristic filter        │
 │ (1,000 products     │ with price, SKU,│ • Semantic search         │
 │  + pgvector)        │ images, links   │ → AI catalog context      │
 │                     │                 │ → ITEM lines in response  │
 │                     │                 │ → "Shop this look" panel  │
 │                     │                 │ → Flat-lay (with images)  │
 ├─────────────────────┼─────────────────┼───────────────────────────┤
 │ Supabase            │ Fashion styling │ • Vector search (hybrid)  │
 │ `knowledge_chunks`  │ rules, color    │ → [FASHION KNOWLEDGE]     │
 │ (225 docs           │ theory, dress   │   section in AI prompt    │
 │  + pgvector)        │ codes, Thai     │                           │
 │                     │ culture tips    │ • Occasion filter (NEW)   │
 │                     │                 │ → [OCCASION KNOWLEDGE]    │
 │                     │                 │   section in AI prompt    │
 ├─────────────────────┼─────────────────┼───────────────────────────┤
 │ Keyword fallback    │ Topic-based     │ • Merged with vector      │
 │ (hardcoded topics)  │ knowledge for   │   results as supplement   │
 │                     │ occasion, color │ → [FASHION KNOWLEDGE]     │
 ├─────────────────────┼─────────────────┼───────────────────────────┤
 │ occasions.ts        │ Formality range │ • filterByFormality()     │
 │ (hardcoded)         │ keywords for    │ • detectOccasion()        │
 │                     │ detection       │ • Fallback styleGuidelines│
 │                     │                 │   (if RAG returns empty)  │
 ├─────────────────────┼─────────────────┼───────────────────────────┤
 │ AI model (Gemini)   │ STYLING lines   │ • Flat-lay image only     │
 │ (generates response)│ for accessories │   (NOT "Shop this look")  │
 │                     │ not in catalog  │ → clutch bag, earrings    │
 └─────────────────────┴─────────────────┴───────────────────────────┘
```

---

## Design Decisions (User-Approved)

1. **Disable replacement entirely** — no product swapping, use AI's original selections
2. **Flat-lay shows total look** — including accessories from RAG knowledge
3. **"Shop this look" shows catalog products only** — only purchasable items
4. **Accessories from knowledge appear in flat-lay image only** — not in Shop this look

---

## Implementation Plan

### Step 1: Add `ChatLookStyling` Type

**File**: `apps/web/lib/types/chat-types.ts`

Add a new interface after `ChatLookItem` (after line 230):

```typescript
/**
 * A styling suggestion from fashion knowledge (not a catalog product).
 * Used only for flat-lay image generation — NOT shown in "Shop this look".
 */
export interface ChatLookStyling {
  /** Descriptive text, e.g. "Structured black leather tote bag" */
  description: string;
  /** Category, e.g. "Bag", "Hat", "Jewelry", "Belt", "Scarf" */
  category: string;
}
```

Add `stylingItems` to `ChatLook` interface (after line 239 `items` field):

```typescript
export interface ChatLook {
  lookNumber: number;
  styleName: string;
  items: ChatLookItem[];
  /** Styling accessories from fashion knowledge — for flat-lay image only, not purchasable */
  stylingItems?: ChatLookStyling[];
  tip?: string;
  totalPrice: number;
  imageBase64?: string;
  imageUrl?: string;
  imageStatus?: 'pending' | 'generating' | 'done' | 'error';
}
```

---

### Step 2: Update System Prompt v5

**File**: `apps/web/lib/prompts/system-prompt-v5.ts`

#### 2a. Add STYLING line format to the structured output section (around line 112-131)

Add `STYLING:` format after the `ITEM:` documentation:

```
ITEM:Product Name|Category|Color|Brief Description|SKU|Price|URL
STYLING:Accessory description for flat-lay visualization|Category
```

Add this rule after line 131 (URL must be copied EXACTLY...):

```
- STYLING lines: Accessories NOT in the catalog but recommended by fashion knowledge
  - Format: STYLING:Description|Category (e.g., STYLING:Structured black leather tote bag|Bag)
  - Categories: Bag, Hat, Jewelry, Belt, Scarf, Sunglasses, Watch
  - These appear ONLY in the flat-lay image, NOT as purchasable products
  - Use STYLING for accessories that complete the look but aren't in the catalog
```

#### 2b. Strengthen the "complete look" rule (line 133)

Change from:
```
- Build a complete look for the asked occasion when possible (e.g., top + bottom + footwear, or dress + footwear + accessory)
```

To:
```
- Each LOOK MUST be a complete outfit with at least 3 ITEM lines from the catalog (e.g., top + bottom + footwear, or dress + footwear + bag)
- Additionally, add 1-2 STYLING lines for accessories not in the catalog to complete the total look (bag, hat, jewelry, etc.) based on the occasion's MUST Include column
- Example complete look: 2-3 ITEM lines (catalog products) + 1-2 STYLING lines (knowledge accessories)
```

#### 2c. Add example with STYLING in the structured output format (around line 106-121)

Update the example to show STYLING:

```
---LOOKS_DATA---
LOOK:1|Style Name Here
ITEM:Product Name|Category|Color|Brief Description|SKU|Price|URL
ITEM:Product Name|Category|Color|Brief Description|SKU|Price|URL
ITEM:Product Name|Category|Color|Brief Description|SKU|Price|URL
STYLING:Structured black leather tote bag|Bag
STYLING:Gold minimalist stud earrings|Jewelry
TIP:Styling tip for this look
TOTAL:Sum of all ITEM prices (STYLING items have no price)
LOOK:2|Another Style Name
ITEM:Product Name|Category|Color|Brief Description|SKU|Price|URL
ITEM:Product Name|Category|Color|Brief Description|SKU|Price|URL
STYLING:Canvas crossbody bag in beige|Bag
TIP:Styling tip for this look
TOTAL:Sum of all ITEM prices
---END_LOOKS_DATA---
```

---

### Step 3: Update Looks Parser

**File**: `apps/web/lib/parsers/looks-parser.ts`

#### 3a. Add STYLING parsing in the main `parseLooksData` function (around line 100-141)

Add a new `else if` branch after the `TOTAL:` handler (after line 141):

```typescript
} else if (line.startsWith('STYLING:') && currentLook) {
  const stylingData = line.substring(8); // Remove 'STYLING:'
  const pipeIdx = stylingData.indexOf('|');

  if (pipeIdx !== -1) {
    const description = stylingData.substring(0, pipeIdx).trim();
    const category = stylingData.substring(pipeIdx + 1).trim();

    if (description) {
      if (!currentLook.stylingItems) {
        currentLook.stylingItems = [];
      }
      currentLook.stylingItems.push({ description, category: category || 'Accessory' });
    }
  } else if (stylingData.trim()) {
    // No pipe — treat the whole string as description
    if (!currentLook.stylingItems) {
      currentLook.stylingItems = [];
    }
    currentLook.stylingItems.push({ description: stylingData.trim(), category: 'Accessory' });
  }
}
```

#### 3b. Import the new type

Add `ChatLookStyling` to the import on line 9:

```typescript
import type { ChatLook, ChatLookItem, ChatLookStyling, ParsedLooksResponse } from '../types/chat-types';
```

---

### Step 4: Disable Cross-Look Replacement

**File**: `apps/web/components/chat/ChatAssistant.tsx`

#### 4a. Simplify `generateFlatLayForOutfit` (lines 176-363)

Replace the entire function body with a simplified version that:
1. Does NOT call `findReplacementsForInconsistentProducts`
2. Does NOT use `replacementCatalog`
3. Uses `outfit.items` directly (no swapping)
4. Includes `outfit.stylingItems` in `flatLayItems` for the flat-lay image

New function body (replace lines 176-363):

```typescript
const generateFlatLayForOutfit = useCallback(async (
  outfit: Outfit,
  messageId: string,
) => {
  console.log(`[Chat] Generating flat-lay for outfit ${outfit.id}...`)

  // Build flat-lay items from catalog products (max 5)
  const catalogFlatLayItems: FlatLayItem[] = outfit.items.slice(0, 5).map((item: Product) => ({
    name: item.name,
    category: item.subCategory || item.category || 'Item',
    color: item.colors?.[0],
    visualDescription: item.visualDescription,
    sku: item.sku,
    thumbnailUrl: item.imageUrl,
  }))

  // Add styling items (accessories from fashion knowledge) for flat-lay visualization only
  const stylingFlatLayItems: FlatLayItem[] = (outfit.stylingItems || []).map((s) => ({
    name: s.description,
    category: s.category || 'Accessory',
    visualDescription: s.description,
    // No sku, no thumbnailUrl — these are knowledge-based, not catalog products
  }))

  // Combine: catalog items first, then styling items (max 6 total for layout)
  const flatLayItems = [...catalogFlatLayItems, ...stylingFlatLayItems].slice(0, 6)
  const occasionContext = outfit.description
  const generationType = 'flat-lay'

  if (flatLayItems.length === 0) {
    console.log('[Chat] No items to generate flat-lay for')
    return
  }

  try {
    const imageResponse = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: outfit.description || 'LOOKs Inspiration',
        generationType,
        flatLayItems,
        occasionContext,
      }),
    })

    const imageData = await imageResponse.json()

    if (imageData.success && (imageData.imageUrl || imageData.imageBase64)) {
      console.log(`[Chat] Flat-lay generated successfully for outfit ${outfit.id}`)
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.outfits) {
            return {
              ...msg,
              outfits: msg.outfits.map((o) =>
                o.id === outfit.id
                  ? { ...o, flatLayImageUrl: imageData.imageUrl, flatLayImageBase64: imageData.imageBase64, isGeneratingFlatLay: false }
                  : o
              ),
            }
          }
          return msg
        })
      )
    } else {
      console.error('[Chat] Flat-lay generation failed:', imageData.message)
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.outfits) {
            return {
              ...msg,
              outfits: msg.outfits.map((o) =>
                o.id === outfit.id ? { ...o, isGeneratingFlatLay: false } : o
              ),
            }
          }
          return msg
        })
      )
    }
  } catch (error) {
    console.error('[Chat] Flat-lay generation error:', error)
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.outfits) {
          return {
            ...msg,
            outfits: msg.outfits.map((o) =>
              o.id === outfit.id ? { ...o, isGeneratingFlatLay: false } : o
            ),
          }
        }
        return msg
      })
    )
  }
}, [])
```

#### 4b. Update `handleSendMessage` — remove replacement catalog (lines 422-427, 464-469)

Remove lines 422-427 (replacement catalog construction):
```typescript
// DELETE these lines:
const outfitProducts: Product[] = resolvedOutfits.flatMap((o: Outfit) => o.items || [])
const replacementCatalog = mergeProductsBySku(allProducts, outfitProducts)
if (outfitProducts.length > 0) {
  setAllProducts((prev) => mergeProductsBySku(prev, outfitProducts))
}
```

Update the flat-lay generation loop (around line 465-468) to NOT pass `replacementCatalog`:

```typescript
// Change from:
await generateFlatLayForOutfit(outfit, messageId, replacementCatalog)

// Change to:
await generateFlatLayForOutfit(outfit, messageId)
```

#### 4c. Clean up unused imports and functions

Remove or comment out:
- `applyProductReplacements` callback (lines 95-114)
- `loadFallbackCatalog` callback (lines 116-135) — only if no longer used elsewhere
- `findReplacementsForInconsistentProducts` import
- `allProducts` state and `mergeProductsBySku` import — only if no longer used elsewhere
- `hasProblematicFlatLayImageUrl` import — only if no longer used elsewhere

---

### Step 5: Pass `stylingItems` Through to Outfits

**File**: `apps/web/lib/utils/chat-look-transformers.ts`

Update `convertLooksToOutfits` to pass through `stylingItems`:

```typescript
export function convertLooksToOutfits(looks: ChatLook[], responseId = Date.now()): Outfit[] {
  return looks.map((look, index) => {
    const items = (look.items || []).map(mapLookItemToProduct)
    const computedTotalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0)

    return {
      id: `look-${responseId}-${look.lookNumber || index + 1}`,
      title: look.styleName || `Look ${look.lookNumber || index + 1}`,
      description: look.tip || '',
      totalPrice: typeof look.totalPrice === 'number' ? look.totalPrice : computedTotalPrice,
      items,
      imageUrl: look.imageUrl,
      stylingItems: look.stylingItems || [],  // NEW: pass through for flat-lay
    }
  })
}
```

**File**: `apps/web/lib/types/index.ts` (or wherever `Outfit` is defined)

Add `stylingItems` to the `Outfit` type:

```typescript
import type { ChatLookStyling } from './chat-types';

export interface Outfit {
  // ... existing fields
  /** Styling accessories for flat-lay only (not purchasable) */
  stylingItems?: ChatLookStyling[];
}
```

---

### Step 6: Update Tests

**File**: `apps/web/lib/parsers/__tests__/looks-parser.test.ts`

Add test cases for STYLING parsing:

```typescript
it('should parse STYLING lines as stylingItems', () => {
  const input = `Some text

---LOOKS_DATA---
LOOK:1|Office Chic
ITEM:Navy Dress|Dress|Navy|Elegant dress|SKU001|4990|https://central.co.th/dress
ITEM:Black Heels|Footwear|Black|Classic heels|SKU002|3990|https://central.co.th/heels
STYLING:Structured black leather tote bag|Bag
STYLING:Gold minimalist stud earrings|Jewelry
TIP:Perfect for important meetings
TOTAL:8980
---END_LOOKS_DATA---`;

  const result = parseLooksData(input);
  expect(result.looks).toHaveLength(1);
  expect(result.looks[0].items).toHaveLength(2);
  expect(result.looks[0].stylingItems).toHaveLength(2);
  expect(result.looks[0].stylingItems![0]).toEqual({
    description: 'Structured black leather tote bag',
    category: 'Bag',
  });
  expect(result.looks[0].stylingItems![1]).toEqual({
    description: 'Gold minimalist stud earrings',
    category: 'Jewelry',
  });
  // Total should NOT include styling items
  expect(result.looks[0].totalPrice).toBe(8980);
});
```

---

## Files to Change (Summary)

| File | Change |
|------|--------|
| `apps/web/lib/types/chat-types.ts` | Add `ChatLookStyling` interface, add `stylingItems` to `ChatLook` |
| `apps/web/lib/types/index.ts` (or Outfit type location) | Add `stylingItems` to `Outfit` |
| `apps/web/lib/prompts/system-prompt-v5.ts` | Add STYLING format, strengthen complete-look rules |
| `apps/web/lib/parsers/looks-parser.ts` | Parse STYLING lines into `stylingItems[]` |
| `apps/web/lib/utils/chat-look-transformers.ts` | Pass `stylingItems` through to `Outfit` |
| `apps/web/components/chat/ChatAssistant.tsx` | Disable replacement, include stylingItems in flat-lay |
| `apps/web/lib/parsers/__tests__/looks-parser.test.ts` | Add STYLING parsing tests |

## Files NOT Changed

| File | Reason |
|------|--------|
| `apps/web/components/outfit/OutfitDetail.tsx` | "Shop this look" uses `outfit.items` only — no change needed |
| `apps/web/components/chat/OutfitRecommendationCard.tsx` | Uses `outfit.items` for product list — no change needed |
| `apps/web/app/api/generate-image/route.ts` | Already handles `FlatLayItem` with `visualDescription` — no change needed |
| `apps/web/lib/prompts/image-prompts.ts` | Layout system already handles items by size category — no change needed |

---

## Testing Checklist

1. Send "หาชุดไปทำงาน" — verify each look has 3+ catalog items + styling accessories
2. Verify flat-lay image shows complete outfit (clothing + shoes + bag/hat)
3. Verify "Shop this look" shows ONLY catalog products (no styling items)
4. Verify flat-lay for Look 1 does NOT contain products from Look 2
5. Verify styling accessories match the occasion (e.g., work → structured bag, not beach bag)
6. Run `pnpm vitest run` — all existing tests pass + new STYLING tests pass

---

## Post-Implementation Analysis (2026-02-15)

### Implementation Status

Steps 1-6 from the original plan have been **partially implemented**. The core STYLING type, parser, system prompt, transformer, and ChatAssistant changes are complete. However, cross-look item contamination in flat-lay images **still persists**.

### What Was Done

| Step | Status | Notes |
|------|--------|-------|
| Step 1: ChatLookStyling type | DONE | `ChatLookStyling` interface + `stylingItems` on `ChatLook` and `Outfit` |
| Step 2: System prompt v5 | DONE | STYLING format documented, complete-look rules added |
| Step 3: Looks parser | DONE | STYLING lines parsed into `stylingItems[]` |
| Step 4: ChatAssistant.tsx | DONE | `generateFlatLayForOutfit` simplified, no replacement catalog |
| Step 5: chat-look-transformers | DONE | `stylingItems` passed through to `Outfit` |
| Step 6: Tests | DONE | STYLING parsing tests added |

### Root Cause: Dual Flat-Lay Generation Race Condition

The remaining contamination comes from **two competing flat-lay generation paths** that race each other:

```
 ChatAssistant.tsx (Path A)              OutfitRecommendationCard.tsx (Path B)
 ─────────────────────────               ──────────────────────────────────────
 handleSendMessage()                     Component renders → IntersectionObserver
   │                                       │
   ▼                                       ▼
 Creates outfits with                    useFlatLayGeneration hook initializes
 isGeneratingFlatLay: true                 │
   │                                       ▼
   ▼                                     Observer fires → checks:
 for each outfit:                          !existingFlatLay?  → true (not yet)
   await generateFlatLayForOutfit()        !hookGeneratedImage? → true
   → POST /api/generate-image              !outfit.isGeneratingFlatLay? → ??? RACE
   → Updates message with result           │
                                           ▼
                                         generateFlatLay() → performGeneration()
                                         → transformToFlatLayItems(items, false)
                                         → POST /api/generate-image
                                         → SECOND image generated (may differ!)
```

#### Why Items Still Appear Wrong

1. **Race condition**: `isGeneratingFlatLay` flag set by ChatAssistant may not propagate to OutfitRecommendationCard before the IntersectionObserver fires (React state update is async)

2. **`useFlatLayGeneration` hook still contains dangerous code** (disabled but present):
   - `loadFallbackCatalog()` — module-scoped, fetches entire product catalog from `/api/products`
   - `findReplacementsForInconsistentProducts()` — can swap items from a shared catalog
   - `transformToFlatLayItems(items, false)` — currently `false` disables replacement, but if changed to `true` or if `allProducts` is provided, contamination resumes

3. **Module-scoped global state in `useFlatLayGeneration.ts`**:
   ```typescript
   let fallbackCatalogPromise: Promise<Product[]> | null = null  // line 42 — shared across ALL cards
   let currentGenerations = 0                                     // line 27 — shared counter
   const generationQueue: QueuedRequest[] = []                   // line 37 — shared queue
   ```

4. **Double API calls**: Both paths call `/api/generate-image` independently, wasting API credits and potentially showing different images (Gemini generates non-deterministic images)

---

## Updated Fix Plan (Phase 2)

### Problem Statement

Items from different looks still contaminate flat-lay images because:
- Two separate generation paths race each other
- `useFlatLayGeneration` hook retains dangerous replacement/catalog code
- Module-scoped global state is shared across all outfit cards

### Solution: Single Generation Path + Dead Code Removal

#### Approach: ChatAssistant-Only Generation

Remove the duplicate generation path in `OutfitRecommendationCard`/`useFlatLayGeneration` hook. Use ChatAssistant as the single source of flat-lay generation (Path A only). The hook becomes a display-only consumer.

```
 BEFORE (dual path, race condition):

 ChatAssistant ─────gen──▶ /api/generate-image ──▶ flatLayImageBase64
                                                         │
 OutfitRecommendationCard ─gen──▶ /api/generate-image ──▶ hookGeneratedImage
   (via useFlatLayGeneration)                               (RACE! may differ)


 AFTER (single path, no race):

 ChatAssistant ─────gen──▶ /api/generate-image ──▶ flatLayImageBase64
                                                         │
                                                         ▼
 OutfitRecommendationCard ◀──── reads from outfit prop ────
   (display only, no generation)
```

### Step 7: Remove `useFlatLayGeneration` hook from OutfitRecommendationCard

**File**: `apps/web/components/chat/OutfitRecommendationCard.tsx`

Remove the `useFlatLayGeneration` hook call (lines 51-64) and IntersectionObserver generation trigger (lines 66-78). The card should only display `outfit.flatLayImageBase64` or `outfit.flatLayImageUrl` set by ChatAssistant.

```typescript
// REMOVE: useFlatLayGeneration hook (lines 51-64)
// REMOVE: IntersectionObserver generation trigger (lines 66-78)

// KEEP: Display logic using outfit props
const existingFlatLay = outfit.flatLayImageBase64 || outfit.flatLayImageUrl
const isGenerating = outfit.isGeneratingFlatLay
```

**Rationale**: ChatAssistant already generates flat-lays for each outfit in `handleSendMessage`. The hook is redundant and creates a race condition.

### Step 8: Gut `useFlatLayGeneration.ts` — Remove Replacement Logic

**File**: `apps/web/lib/hooks/useFlatLayGeneration.ts`

Remove all cross-catalog replacement code:

1. **Delete** `loadFallbackCatalog()` function and `fallbackCatalogPromise` variable (lines 42-58)
2. **Delete** `transformToFlatLayItems()` function entirely (lines 377-497) — replace with simple direct mapping
3. **Remove** `allProducts` from `UseFlatLayGenerationOptions` interface (line 105)
4. **Remove** `onProductsReplaced` callback from interface (line 107)
5. **Remove** imports: `findReplacementsForInconsistentProducts`, `validateProductVisualConsistency`, `validateFlatLayThumbnailMatch`, `findVisuallyConsistentReplacement` (lines 7-12)
6. **Simplify** `performGeneration()` (line 598-693) to directly map items → FlatLayItem[] without replacement logic

Simplified `performGeneration`:
```typescript
const performGeneration = useCallback(async () => {
  if (!isMountedRef.current) return
  setIsQueued(false)
  setIsGenerating(true)
  setError(undefined)
  hasAttemptedRef.current = true
  currentGenerations++

  // Direct mapping — no replacement, no validation, no cross-catalog
  const flatLayItems: FlatLayItem[] = items.map((item) => ({
    name: item.name,
    category: item.subCategory || item.category || 'clothing',
    color: item.colors?.[0],
    visualDescription: item.visualDescription,
    sku: item.sku,
    thumbnailUrl: item.imageUrl,
  }))

  // ... rest of API call unchanged
}, [outfitId, items, occasionContext])
```

### Step 9: Pass `stylingItems` from OutfitRecommendationCard to display

**File**: `apps/web/components/chat/OutfitRecommendationCard.tsx`

If the card needs to display styling items in the flat-lay composite (CSS fallback), ensure it reads from `outfit.stylingItems` — not from a separate hook. The `FlatLayComposite` component should render styling items as text-only entries (no thumbnail).

### Step 10: Add Integration Test for Look Isolation

**File**: `apps/web/lib/__tests__/flat-lay-isolation.test.ts` (NEW)

```typescript
describe('Flat-lay look isolation', () => {
  it('should NOT include items from Look 2 in Look 1 flat-lay', () => {
    // Create 2 outfits with distinct items
    const outfit1 = { id: 'look-1', items: [redDress, blackHeels], stylingItems: [clutchBag] }
    const outfit2 = { id: 'look-2', items: [blueShirt, whiteSneakers], stylingItems: [] }

    // Build flat-lay items for Look 1
    const flatLayItems = buildFlatLayItemsForOutfit(outfit1)

    // Verify NO items from Look 2
    const itemNames = flatLayItems.map(i => i.name)
    expect(itemNames).not.toContain('Blue Shirt')
    expect(itemNames).not.toContain('White Sneakers')
    expect(itemNames).toContain('Red Dress')  // Look 1 item
    expect(itemNames).toContain('Structured clutch bag')  // Look 1 styling
  })
})
```

### Step 11: Clean Up Module-Scoped State

**File**: `apps/web/lib/hooks/useFlatLayGeneration.ts`

The global queue system (lines 32-82) is acceptable for concurrency control, but ensure:
- `currentGenerations` counter is properly decremented on errors
- Queue items are isolated (each closure captures its own items)
- No shared product state leaks between queued items

---

## Updated Files to Change (Phase 2)

| File | Change |
|------|--------|
| `apps/web/components/chat/OutfitRecommendationCard.tsx` | Remove `useFlatLayGeneration` hook, use outfit props for display only |
| `apps/web/lib/hooks/useFlatLayGeneration.ts` | Remove replacement logic, `loadFallbackCatalog`, `transformToFlatLayItems`, `allProducts` param |
| `apps/web/lib/__tests__/flat-lay-isolation.test.ts` | NEW: Integration test for look isolation |

## Files NOT Changed (Phase 2)

| File | Reason |
|------|--------|
| `apps/web/components/chat/ChatAssistant.tsx` | Already correct — single generation path, isolated per-outfit |
| `apps/web/lib/parsers/looks-parser.ts` | Already parsing STYLING correctly |
| `apps/web/lib/prompts/system-prompt-v5.ts` | Already includes STYLING format |
| `apps/web/app/api/generate-image/route.ts` | Receives items per-request, no mixing |

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Removing hook breaks cached flat-lays | Hook's cache (localStorage) still works if hook is kept as display-only |
| ChatAssistant generation fails → no flat-lay | Keep hook as fallback but WITHOUT replacement catalog |
| Loss of visual consistency validation | Acceptable — validation caused contamination, flat-lay AI handles visual quality |

## Recommended Approach

**Option A (Aggressive)**: Remove `useFlatLayGeneration` entirely from OutfitRecommendationCard. ChatAssistant is the sole generator. Simplest, zero race condition risk.

**Option B (Conservative, Recommended)**: Keep `useFlatLayGeneration` as a **fallback-only** generator but strip all replacement/catalog code. The hook only fires if ChatAssistant's generation failed (no `flatLayImageBase64` after timeout). This preserves the caching layer.

Both options require gutting the replacement logic from `useFlatLayGeneration.ts`.
