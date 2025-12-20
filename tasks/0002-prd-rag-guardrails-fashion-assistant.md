# PRD: RAG Capabilities & Guardrails for Fashion Chat Assistant

## 1. Introduction/Overview

This PRD outlines the development of Retrieval-Augmented Generation (RAG) capabilities and intelligent guardrails for the OOTDay fashion chat assistant. The feature will enhance the AI assistant's knowledge base by retrieving relevant fashion expertise from existing codebase documentation and implementing multi-layer validation to prevent inappropriate or off-brand responses.

**Problem it solves:** Currently, the fashion chat assistant relies solely on the LLM's pre-trained knowledge, which may lack specific fashion styling guidelines, brand voice consistency, and context-aware recommendations. Without guardrails, the assistant may provide inappropriate outfit suggestions for specific occasions or respond to off-topic queries, degrading user experience and brand trust.

**Goal:** Build a hybrid RAG system that augments LLM responses with curated fashion knowledge from the codebase, combined with pre- and post-validation guardrails to ensure all responses are appropriate, on-brand, and relevant to fashion queries.

## 2. Goals

1. **Knowledge Enrichment:** Enhance response quality by retrieving relevant fashion domain knowledge and style guidelines from existing markdown documentation
2. **Occasion Appropriateness:** Prevent inappropriate outfit suggestions for specific contexts (e.g., casual wear for weddings)
3. **Brand Consistency:** Ensure all responses align with OOTDay's brand voice and Central Group guidelines
4. **Topic Relevance:** Filter out off-topic queries and guide users back to fashion-related conversations
5. **Response Quality:** Improve fashion recommendation accuracy by 30% through context-aware knowledge retrieval
6. **Seamless Integration:** Integrate with existing test mode evaluation system without disrupting current workflows
7. **Performance:** Maintain response times without significant degradation (target: <500ms additional latency)

## 3. User Stories

### Primary Users: End Users, Product Manager, Developer

**Story 1: Style Knowledge Enhancement**
As an end user, I want the AI assistant to provide accurate fashion advice based on established style guidelines so that I receive professional-quality outfit recommendations.

**Story 2: Occasion-Appropriate Recommendations**
As an end user, I want the assistant to suggest outfits appropriate for my specific occasion (wedding, work, date) so that I don't receive irrelevant recommendations like sportswear for formal events.

**Story 3: Brand Voice Consistency**
As a product manager, I want all AI responses to maintain the friendly, conversational Thai tone defined in our brand guidelines so that user experience is consistent across all interactions.

**Story 4: Off-Topic Query Handling**
As an end user, I want the assistant to politely redirect me when I ask non-fashion questions so that I understand the assistant's purpose and stay focused on outfit planning.

**Story 5: Regeneration on Guardrail Violation**
As a developer, I want the system to automatically regenerate responses when guardrails detect violations (inappropriate suggestions, off-brand tone) so that users never see low-quality outputs.

**Story 6: RAG Effectiveness Testing**
As a QA engineer, I want to see RAG retrieval quality metrics in the existing test mode so that I can validate which knowledge sources improve response accuracy.

**Story 7: Knowledge Source Traceability**
As a product manager, I want to understand which knowledge documents influenced each response so that I can refine our fashion guidelines based on real usage patterns.

**Story 8: Guardrail Performance Monitoring**
As a developer, I want to track how often guardrails trigger and which violations are most common so that I can improve the system and update guidelines accordingly.

## 4. Functional Requirements

### 4.1 RAG System - Knowledge Base

1. The system must index and retrieve content from the following markdown sources in the codebase:
   - `/dialog/DialogTemplate14-2.md` - Response format templates
   - Fashion style guides (to be created in `/knowledge/fashion/`)
   - Occasion-specific styling rules (to be created in `/knowledge/occasions/`)
   - Brand voice guidelines (to be created in `/knowledge/brand/`)

2. The system must parse markdown files and extract structured knowledge including:
   - Style principles and rules
   - Color matching guidelines
   - Seasonal recommendations
   - Occasion-appropriate dress codes
   - Body type considerations
   - Thai fashion terminology

3. The system must create searchable embeddings for all knowledge documents to enable semantic retrieval

4. The knowledge base must support hierarchical organization:
   - Core fashion principles (static, loaded at startup)
   - Occasion-specific rules (static, loaded at startup)
   - Brand guidelines (static, loaded at startup)
   - Dialog templates (dynamic, reloadable)

### 4.2 RAG System - Retrieval Logic

5. For each user query, the system must:
   - Extract key intent and entities (occasion type, style preferences, body type, etc.)
   - Retrieve top 3-5 most relevant knowledge chunks from the knowledge base
   - Rank retrieved chunks by relevance score (cosine similarity threshold: >0.7)

6. The system must implement a hybrid RAG approach:
   - Always inject core fashion principles into system prompt
   - Dynamically retrieve occasion-specific and style guidelines based on query context
   - Augment LLM prompt with retrieved knowledge before generation

7. The system must track which knowledge sources were retrieved for each response for debugging and evaluation

8. The system must handle cases where no relevant knowledge is found (fallback to base LLM knowledge)

### 4.3 Guardrails - Pre-Validation

9. Before sending queries to the LLM, the system must perform pre-validation checks:

   **A. Off-Topic Detection:**
   - Classify query intent (fashion-related vs. non-fashion)
   - If non-fashion query detected: Block LLM call and return polite redirect message
   - Redirect message template: "ขอโทษนะคะ เราเป็นผู้ช่วยแนะนำแฟชั่นค่ะ ช่วยได้เฉพาะเรื่องเสื้อผ้าและการแต่งตัวเท่านั้น มีอะไรเกี่ยวกับชุดที่อยากปรึกษาไหมคะ? 😊"

   **B. Query Validation:**
   - Check for inappropriate language or requests
   - Validate that occasion type (if specified) is supported
   - Ensure query is in Thai or English (supported languages)

10. The system must log all pre-validation blocks with query content and block reason

### 4.4 Guardrails - Post-Validation

11. After receiving LLM response, the system must perform post-validation checks:

   **A. Occasion Appropriateness Check:**
   - If query specifies occasion (e.g., งานแต่งงาน, ออฟฟิศ), validate that recommended products match formality level
   - Validation rules:
     - Wedding/Formal: No casual wear (jeans, t-shirts, sneakers)
     - Work/Office: No revealing or overly casual items
     - Sport/Gym: No formal wear
     - Party/Club: No office wear
   - If violation detected: Trigger regeneration with stricter occasion constraints

   **B. Brand Voice Compliance:**
   - Validate Thai language tone matches brand guidelines:
     - Uses conversational particles (ค่ะ, นะคะ, เลย)
     - Friendly and supportive tone (not overly formal)
     - Appropriate emoji usage (1-3 per response)
   - If violation detected: Trigger regeneration with enhanced tone instructions

   **C. Topic Relevance Check:**
   - Validate that response stays focused on fashion/styling
   - Check for off-topic content (e.g., health advice, financial recommendations)
   - If violation detected: Trigger regeneration with strict fashion focus instruction

12. The system must implement a regeneration mechanism:
   - Maximum 2 regeneration attempts per query
   - Each regeneration must inject specific guardrail violation feedback into prompt
   - If violations persist after 2 attempts: Return fallback response

13. The system must log all post-validation violations with:
   - Original response content
   - Violation type and reason
   - Regeneration attempt count
   - Final response content

### 4.5 Hybrid System Integration

14. The system must combine RAG and guardrails in this flow:
   ```
   User Query
   → Pre-Validation (Guardrails)
   → RAG Retrieval (if validation passed)
   → Augmented Prompt Generation (RAG + System Prompt)
   → LLM Call
   → Post-Validation (Guardrails)
   → Regenerate if needed (with RAG context)
   → Return Response to User
   ```

15. The system must optimize for performance:
   - Run RAG retrieval and pre-validation in parallel where possible
   - Cache frequently retrieved knowledge chunks (LRU cache, max 100 items)
   - Use lightweight validation models for quick checks

16. The system must gracefully degrade if RAG system fails:
   - Fallback to base LLM without RAG context
   - Log RAG failure but continue serving users
   - Alert developers if RAG failure rate exceeds 5%

### 4.6 Knowledge Management

17. The system must support knowledge base updates:
   - Reload knowledge files on demand via admin command (test mode)
   - Re-generate embeddings when source documents change
   - Maintain version tracking for knowledge documents

18. The system must provide knowledge base statistics:
   - Total document count
   - Total chunk count
   - Average retrieval time
   - Cache hit rate

### 4.7 Testing & Evaluation Integration

19. The system must extend the existing test mode (from PRD 0001) with RAG/Guardrail metrics:

   **New Automated Evaluation Criteria:**

   **I. RAG Retrieval Quality (0-10 score)**
   - Relevance of retrieved knowledge chunks to query
   - Score based on cosine similarity and manual review

   **J. Occasion Appropriateness (Pass/Fail)**
   - For occasion-specific queries: Products match formality level
   - Binary check: Pass or Fail

   **K. Brand Voice Compliance (0-10 score)**
   - Thai language tone matches brand guidelines
   - Conversational markers present
   - Appropriate emoji usage

   **L. Topic Relevance (Pass/Fail)**
   - Response stays focused on fashion/styling
   - No off-topic content
   - Binary check: Pass or Fail

   **M. Guardrail Trigger Rate (metric)**
   - Number of pre-validation blocks
   - Number of post-validation regenerations
   - Display as percentage of total queries

20. The system must display RAG debugging information in test mode:
   - Retrieved knowledge chunks with relevance scores
   - Source document names and sections
   - Guardrail validation results (pass/fail for each check)
   - Regeneration history (if applicable)

21. The system must export RAG/Guardrail metrics in test results CSV:
   - New columns: `rag_chunks_retrieved`, `rag_avg_relevance_score`, `pre_validation_result`, `post_validation_result`, `regeneration_count`, `occasion_appropriate`, `brand_voice_score`, `topic_relevance`

### 4.8 Configuration & Administration

22. The system must expose configuration options via environment variables or config file:
   ```
   RAG_ENABLED=true/false
   RAG_RETRIEVAL_TOP_K=5
   RAG_SIMILARITY_THRESHOLD=0.7
   GUARDRAIL_PRE_VALIDATION_ENABLED=true/false
   GUARDRAIL_POST_VALIDATION_ENABLED=true/false
   GUARDRAIL_MAX_REGENERATIONS=2
   ```

23. The system must provide admin controls in test mode:
   - Toggle RAG on/off for A/B comparison
   - Toggle individual guardrails on/off
   - View guardrail violation logs
   - Trigger knowledge base reload

### 4.9 Logging & Monitoring

24. The system must log the following events:
   - RAG retrieval: Query, retrieved chunks, relevance scores, retrieval time
   - Pre-validation blocks: Query, block reason, timestamp
   - Post-validation violations: Original response, violation type, regeneration attempts
   - System errors: RAG failures, guardrail failures, embedding generation errors

25. The system must provide operational metrics dashboard (test mode):
   - RAG retrieval success rate (% of queries with relevant chunks found)
   - Average retrieval time per query
   - Guardrail block rate (pre-validation)
   - Guardrail regeneration rate (post-validation)
   - Knowledge base health (last update time, document count)

## 5. Non-Goals (Out of Scope)

1. **External knowledge sources** - MVP uses only codebase markdown files, no external APIs or databases
2. **Real-time product inventory integration** - Product-specific guardrails (out-of-stock checks) are out of scope
3. **Multi-language knowledge bases** - English language knowledge sources not supported in MVP (Thai only)
4. **Advanced NLP models** - Using lightweight validation approaches, not fine-tuned guardrail models
5. **User feedback loop** - No mechanism to collect user ratings on RAG/Guardrail quality in MVP
6. **Automated knowledge curation** - Knowledge documents must be manually created and maintained
7. **Cross-lingual RAG** - No translation of English fashion knowledge to Thai
8. **Personalized knowledge retrieval** - No user-specific knowledge bases or preferences
9. **Distributed knowledge base** - Single-server deployment only, no distributed vector database

## 6. Design Considerations

### 6.1 UI/UX Requirements

**No Major UI Changes Required** - RAG and guardrails operate transparently behind the scenes

**Test Mode Additions:**
- New "RAG & Guardrails" tab in the existing test evaluation panel
- Display retrieved knowledge chunks in collapsible section
- Show guardrail validation results with pass/fail indicators
- Display regeneration history if applicable
- Add RAG on/off toggle switch in test controls

**User-Facing Changes:**
- Off-topic redirect message when pre-validation blocks non-fashion queries
- Slightly improved response quality (should be transparent to users)

### 6.2 Component Structure

```
lib/
  ├── rag/
  │   ├── knowledge-base.ts          (new - load and index markdown files)
  │   ├── embeddings.ts              (new - generate and search embeddings)
  │   ├── retrieval.ts               (new - RAG retrieval logic)
  │   └── knowledge-parser.ts        (new - parse markdown into chunks)
  │
  ├── guardrails/
  │   ├── pre-validation.ts          (new - off-topic detection, query validation)
  │   ├── post-validation.ts         (new - occasion check, brand voice, topic relevance)
  │   ├── regeneration.ts            (new - handle regeneration logic)
  │   └── validation-rules.ts        (new - define validation rules and thresholds)
  │
  ├── chat-orchestrator.ts           (new - coordinate RAG + Guardrails + LLM)
  └── rag-guardrail-logger.ts        (new - logging and metrics)

knowledge/                            (new directory)
  ├── fashion/
  │   ├── style-principles.md
  │   ├── color-matching.md
  │   └── seasonal-trends.md
  │
  ├── occasions/
  │   ├── work-office.md
  │   ├── wedding-formal.md
  │   ├── casual-weekend.md
  │   ├── date-night.md
  │   └── party-club.md
  │
  └── brand/
      ├── voice-guidelines.md
      └── response-templates.md

components/chat/
  ├── RagDebugPanel.tsx              (new - test mode RAG debugging)
  └── GuardrailStatus.tsx            (new - test mode guardrail results)
```

### 6.3 Styling

- Use existing Tailwind CSS and shadcn/ui components
- RAG debug panel: Accordion component for knowledge chunks
- Guardrail status: Badge components (green for pass, red for fail, yellow for regenerated)
- Relevance scores: Progress bar component (0-100%)

## 7. Technical Considerations

### 7.1 RAG Implementation

**Embedding Model:**
- Use lightweight embedding model: `text-embedding-3-small` (OpenAI) or similar
- Alternative: Local embeddings using `all-MiniLM-L6-v2` (Sentence Transformers)
- Embedding dimension: 384 or 1536 depending on model choice

**Vector Search:**
- For MVP: In-memory vector search using cosine similarity
- Libraries: `vectra` or `chromadb` (TypeScript-compatible)
- No external vector database required for MVP

**Knowledge Chunking Strategy:**
- Split markdown files by sections (## headings)
- Chunk size: 200-500 tokens
- Overlap: 50 tokens between chunks
- Preserve markdown formatting and context

**Retrieval Optimization:**
- Cache embeddings in memory (regenerate only when files change)
- Use semantic search with cosine similarity
- Apply relevance threshold filtering (>0.7)
- Re-rank results by recency and importance if needed

### 7.2 Guardrail Implementation

**Pre-Validation - Off-Topic Detection:**
- Use keyword-based classification as primary method:
  - Fashion keywords: เสื้อผ้า, แฟชั่น, สไตล์, outfit, แต่งตัว, ชุด, etc.
  - Off-topic indicators: สุขภาพ, การเงิน, อาหาร, ที่พัก, etc.
- Classify as off-topic if: No fashion keywords AND has off-topic indicators
- Fallback: Use simple zero-shot classification model if needed (e.g., `bart-large-mnli`)

**Post-Validation - Occasion Appropriateness:**
- Rule-based validation using product type keywords:
  - Extract mentioned product types from response (กางเกงยีนส์, เดรส, สูท, etc.)
  - Check against occasion-appropriate item lists
  - Flag violations if formal occasion suggests casual items or vice versa

**Post-Validation - Brand Voice:**
- Pattern matching for required elements:
  - Check for conversational particles: ค่ะ, นะคะ, เลย, นะ
  - Validate emoji count (1-3 expected)
  - Check for overly formal language patterns (ท่าน, กระผม, etc.)
- Score based on presence/absence of markers

**Post-Validation - Topic Relevance:**
- Keyword-based relevance check:
  - Response must contain fashion-related terms
  - Flag if response contains off-topic domain language (medical, financial, etc.)

**Regeneration Logic:**
- On violation, inject specific constraint into system prompt:
  - Example: "IMPORTANT: This is a WEDDING event. Only suggest FORMAL wear (dresses, suits). Do NOT suggest casual items like jeans or t-shirts."
- Limit to 2 regeneration attempts to prevent infinite loops
- If still failing: Return generic fallback response

### 7.3 Performance Optimization

**RAG Performance:**
- Pre-compute all embeddings at startup (cache in memory)
- Use batched embedding generation for efficiency
- Implement LRU cache for frequently retrieved chunks
- Target retrieval time: <200ms

**Guardrail Performance:**
- Use lightweight rule-based validation (avoid heavy models)
- Run pre-validation checks in parallel
- Cache validation results for identical queries (deduplication)
- Target validation time: <100ms (pre) + <150ms (post)

**Overall Performance Target:**
- Total added latency: <500ms (RAG + Guardrails combined)
- LLM call time remains unchanged
- End-to-end response time: <3 seconds (including LLM)

### 7.4 Error Handling

**RAG Failures:**
- Embedding generation failure: Log error, continue without RAG context
- Knowledge file not found: Log warning, skip that source
- Vector search failure: Log error, fallback to base LLM
- Low relevance scores (all < threshold): Proceed without retrieved context

**Guardrail Failures:**
- Pre-validation model error: Log error, allow query through (fail open)
- Post-validation failure: Log error, allow original response through
- Regeneration API error: Return original response after logging
- Max regenerations exceeded: Return fallback response

**Graceful Degradation:**
- RAG disabled via config: System functions normally without knowledge augmentation
- Guardrails disabled: System functions as base LLM chat
- Both disabled: System reverts to simple LLM chat

### 7.5 Knowledge Base Management

**File Structure:**
- Markdown files with clear section headings (##)
- Metadata in frontmatter (optional):
  ```yaml
  ---
  title: Work & Office Style Guide
  category: occasions
  importance: high
  last_updated: 2025-10-11
  ---
  ```

**Update Process:**
1. Developer updates markdown file in `/knowledge/`
2. Trigger knowledge base reload via admin command or file watcher
3. System re-parses files, generates new embeddings, replaces cache
4. Log reload event with timestamp and affected files

**Version Tracking:**
- Include file hash or last modified timestamp in retrieval logs
- Enable reproducing test results with specific knowledge base version

## 8. Success Metrics

### Primary Metrics

1. **Response Quality Improvement:** Achieve 30% improvement in fashion recommendation accuracy (measured via test mode evaluation)
2. **Occasion Appropriateness:** 95% pass rate on occasion appropriateness checks for occasion-specific queries
3. **Off-Topic Filtering:** Successfully block 90% of non-fashion queries before LLM call
4. **Brand Voice Consistency:** Achieve >8/10 average score on brand voice compliance across all responses

### Secondary Metrics

5. **RAG Retrieval Success Rate:** Retrieve relevant knowledge chunks (relevance >0.7) for 80% of queries
6. **Guardrail Regeneration Rate:** Keep regeneration rate below 15% (indicates good base performance)
7. **Performance Impact:** Maintain added latency below 500ms target (RAG + Guardrails combined)
8. **System Reliability:** RAG/Guardrail system uptime >99% (graceful degradation on failures)

### Quality Indicators

9. **Manual Review Accuracy:** Manual review of 100 responses confirms automated guardrail validation is 90% accurate
10. **Knowledge Source Utilization:** Average 2-3 relevant knowledge chunks retrieved per query
11. **Violation Distribution:** Identify most common violation types to guide knowledge base improvements
12. **Developer Satisfaction:** Development team finds RAG debugging interface useful for improving guidelines

### Testing Metrics

13. **Test Coverage:** Run existing 54+ test scenarios with RAG/Guardrails enabled and measure improvement
14. **Comparative Analysis:** A/B test RAG-enabled vs. baseline responses show measurable quality difference
15. **Edge Case Handling:** Successfully handle edge cases (ambiguous queries, multi-occasion queries, etc.)

## 9. Open Questions

### Technical Questions

1. **Embedding model selection:** Should we use OpenAI's `text-embedding-3-small` (requires API call) or local Sentence Transformers (no API cost but larger bundle)?
2. **Knowledge base size limits:** What's the maximum number of knowledge documents/chunks we expect? Do we need pagination or limits?
3. **Real-time monitoring:** Should we implement real-time alerting for high guardrail trigger rates, or is batch log review sufficient?
4. **Cache invalidation:** How should we handle cache invalidation when knowledge files change? File watcher, manual trigger, or time-based expiry?

### Product Questions

5. **Fallback response quality:** What should the generic fallback response be when regenerations fail? Should it apologize and ask user to rephrase?
6. **Off-topic redirect tone:** Is the proposed redirect message appropriate? Should we be more or less friendly?
7. **Knowledge content creation:** Who is responsible for writing the initial fashion knowledge documents in `/knowledge/`? Product team, fashion experts, or developers?
8. **Guardrail tuning:** How should we tune the validation thresholds (e.g., similarity scores, keyword lists)? Based on test results or user feedback?

### Business Questions

9. **ROI measurement:** How will we measure the business impact of better fashion recommendations? Track conversion rates, user engagement time, or satisfaction scores?
10. **Knowledge base maintenance:** What's the process for keeping fashion knowledge up-to-date with trends? Who owns this ongoing maintenance?
11. **Guardrail strictness:** Should guardrails be stricter in production vs. test mode, or same rules everywhere?
12. **Performance vs. quality trade-off:** If RAG retrieval adds 300-400ms latency, is that acceptable for better response quality, or should we optimize further?

---

## Appendix A: Example Knowledge Document Structure

### File: `/knowledge/occasions/wedding-formal.md`

```markdown
---
title: Wedding & Formal Events Style Guide
category: occasions
importance: high
last_updated: 2025-10-11
---

## Dress Code Overview

งานแต่งงานและงานทางการต้องใส่ชุดที่เป็นทางการ สุภาพ และเหมาะสมกับบรรยากาศของงาน

## Appropriate Attire for Women

- **เดรสยาว** (Long dress): เหมาะสำหรับงานเลี้ยงค่ำหรืองานแต่งงานในโรงแรม
- **ชุดไทย** (Thai traditional dress): สวยงามและเหมาะสำหรับงานแต่งงานแบบไทย
- **สูทชุด** (Suit set): ดูเป็นทางการและทันสมัย
- **เดรสสั้น** (Cocktail dress): เหมาะสำหรับงานเลี้ยงค่ำแบบไม่เป็นทางการมาก

## Items to AVOID

- ❌ กางเกงยีนส์ (Jeans)
- ❌ เสื้อยืด (T-shirts)
- ❌ รองเท้าผ้าใบ (Sneakers)
- ❌ ชุดกีฬา (Sportswear)
- ❌ กางเกงขาสั้น (Shorts)

## Color Guidelines

- เลือกสีที่เหมาะสมกับธีมงาน
- หลีกเลี่ยงสีขาวล้วน (เว้นแต่เจ้าบ่าวเจ้าสาวอนุญาต)
- สีพาสเทล น้ำเงินเข้ม หรือสีเบจเป็นตัวเลือกที่ปลอดภัย

## Accessories

- เครื่องประดับควรมีความหรูหราแต่ไม่ฉูดฉาดเกินไป
- กระเป๋าคลัตช์ขนาดเล็ก
- รองเท้าส้นสูงหรือรองเท้าหนังที่สุภาพ
```

---

## Appendix B: Guardrail Validation Rules

### Occasion Appropriateness Rules

```typescript
const occasionRules = {
  wedding: {
    formality: "formal",
    allowedCategories: ["dress", "suit", "thai-traditional", "formal-wear"],
    blockedCategories: ["jeans", "t-shirt", "sneakers", "sportswear", "shorts"],
    keywords: {
      allowed: ["เดรส", "ชุดไทย", "สูท", "เสื้อเชิ้ต", "กระโปรง"],
      blocked: ["ยีนส์", "เสื้อยืด", "ผ้าใบ", "กีฬา", "ขาสั้น"]
    }
  },
  work: {
    formality: "business-casual",
    allowedCategories: ["shirt", "blouse", "slacks", "dress", "suit"],
    blockedCategories: ["crop-top", "mini-skirt", "ripped-jeans", "sportswear"],
    keywords: {
      allowed: ["เสื้อเชิ้ต", "เบลาส์", "กางเกงสแล็ก", "สูท"],
      blocked: ["เสื้อครอป", "กระโปรงสั้น", "ยีนส์ขาด", "กีฬา"]
    }
  },
  // ... other occasions
};
```

### Brand Voice Patterns

```typescript
const brandVoicePatterns = {
  requiredParticles: ["ค่ะ", "นะคะ", "เลย", "นะ"],
  minParticleCount: 2,
  maxParticleCount: 5,
  requiredEmojiCount: { min: 1, max: 3 },
  forbiddenFormalTerms: ["ท่าน", "กระผม", "ข้าพเจ้า", "ท่านผู้มีเกียรติ"],
  conversationalMarkers: ["แนะนำ", "ช่วย", "ลอง", "ดูดี", "เข้ากัน"]
};
```

### Off-Topic Keywords

```typescript
const topicKeywords = {
  fashion: [
    "เสื้อผ้า", "แฟชั่น", "สไตล์", "outfit", "แต่งตัว", "ชุด",
    "กางเกง", "เสื้อ", "กระโปรง", "รองเท้า", "เดรส", "แมทช์",
    "สี", "ลาย", "ทรง", "ผ้า", "แบรนด์"
  ],
  offTopic: {
    health: ["สุขภาพ", "โรค", "ยา", "คลินิก", "โรงพยาบาล"],
    finance: ["เงิน", "ลงทุน", "หุ้น", "กู้", "เงินฝาก"],
    food: ["อาหาร", "ร้านอาหาร", "กิน", "เมนู", "สูตร"],
    travel: ["ที่พัก", "โรงแรม", "ท่องเที่ยว", "เที่ยวบิน", "รีสอร์ท"]
  }
};
```

---

## Appendix C: RAG + Guardrails Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           User Query                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Pre-Validation      │
                 │   (Guardrails)        │
                 └───────────┬───────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            [Off-Topic]         [Fashion Query]
                    │                 │
                    ▼                 ▼
        ┌─────────────────┐   ┌─────────────────┐
        │ Return Redirect │   │  RAG Retrieval  │
        │    Message      │   │  (Top 3-5       │
        └─────────────────┘   │   Chunks)       │
                              └────────┬─────────┘
                                       │
                                       ▼
                          ┌──────────────────────┐
                          │  Augmented Prompt    │
                          │  (System + RAG +     │
                          │   User Query)        │
                          └──────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │    LLM Call          │
                          │  (OpenRouter API)    │
                          └──────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  Post-Validation     │
                          │  (Guardrails)        │
                          └──────────┬───────────┘
                                     │
                          ┌──────────┴───────────┐
                          │                      │
                          ▼                      ▼
                   [Violations]             [All Pass]
                          │                      │
                          ▼                      ▼
              ┌────────────────────┐    ┌───────────────┐
              │  Regenerate        │    │ Return        │
              │  (Max 2 attempts)  │    │ Response      │
              │  + Inject          │    │ to User       │
              │    Constraints     │    └───────────────┘
              └─────────┬──────────┘
                        │
                        ▼
              ┌────────────────────┐
              │ Post-Validation    │
              │ (Retry)            │
              └─────────┬──────────┘
                        │
           ┌────────────┴───────────┐
           │                        │
           ▼                        ▼
    [Still Failing]           [Pass]
           │                        │
           ▼                        ▼
  ┌───────────────┐       ┌────────────────┐
  │  Fallback     │       │  Return        │
  │  Response     │       │  Response      │
  └───────────────┘       └────────────────┘
```

---

**Document Version:** 1.0
**Created:** 2025-10-11
**Author:** OOTDay Development Team
**Status:** Draft for Review
**Related PRDs:** 0001-prd-llm-model-testing-integration.md
