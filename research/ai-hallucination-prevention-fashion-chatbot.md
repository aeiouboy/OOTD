# AI Hallucination Prevention in Fashion Recommendation Chatbots

> Researched on: 2026-02-11
> Research method: Parallel agent team (4 researchers)

## Overview

AI hallucination in fashion recommendation chatbots occurs when the LLM generates plausible-sounding but fabricated product information — fake product names, wrong prices, invented brands, or nonexistent availability. This is a critical issue for the OOTD fashion assistant, where users make purchasing decisions based on AI recommendations linked to real Central Group inventory.

RAG (Retrieval-Augmented Generation) reduces hallucinations by ~71%, but is not a silver bullet. Even with OOTD's 3-tier RAG pipeline (Supabase pgvector → Vectra → keyword fallback), hallucinations persist due to cross-language embedding gaps (Thai→English scores ~0.25 vs English→English ~0.70), incomplete retrieval, and the LLM's tendency to fill knowledge gaps with fabricated content. The business impact is severe: AI search visitors convert 4.4x higher than organic traffic, making hallucinated misinformation in this channel especially costly.

The most effective mitigation strategy is a **multi-layer approach**: product ID anchoring (LLM selects product IDs, never generates product details), structured output enforcement (JSON schema), post-generation verification (cross-reference against catalog), and observability (track hallucination rates over time).

## Key Concepts

### Types of AI Hallucination
- **Intrinsic hallucination**: Output contradicts the retrieved context (e.g., RAG retrieves a product at ฿1,200 but LLM outputs ฿900)
- **Extrinsic hallucination**: Output contains information not verifiable from any source — pure fabrication (e.g., inventing "ChicThai Premium" brand)
- **Factual hallucination**: Incorrect facts about real entities (wrong price, wrong material, wrong sizing)
- **Fabrication**: Entirely invented entities (nonexistent products, fake brand names)

### 5 E-Commerce Hallucination Patterns

| Pattern | Fashion Example |
|---|---|
| **Pricing hallucination** | AI quotes ฿1,500 for a dress that costs ฿2,990; cites expired sale prices |
| **Availability hallucination** | Recommends sold-out item as "available now"; claims active product is "discontinued" |
| **Feature conflation** | Combines fabric details from two products — says a cotton dress is "silk blend" |
| **Quality mischaracterization** | Aggregates reviews incorrectly — interprets mixed feedback as "poor quality" |
| **Competitor substitution** | User asks about Central Group brand; AI recommends a competitor's product |

### Why RAG Systems Still Hallucinate
1. **Cross-language embedding gap** — Thai queries produce embeddings distant from English documents (0.23-0.30 similarity)
2. **Retrieval quality issues** — wrong threshold filters out relevant docs; too-low threshold includes noise
3. **Context integration failures** — model misattributes details from Product A to Product B
4. **Knowledge base gaps** — when no knowledge chunks cover a topic, model falls back on parametric knowledge
5. **Data inconsistency** — multiple sources with conflicting prices/availability create ambiguity

## Architecture / How It Works

### Multi-Layer Verification Architecture

```
Layer 1: INPUT CONTROL
  ├── Schema validation of user query
  ├── Intent classification (fashion advice vs. off-topic)
  └── Query rewriting for retrieval optimization

Layer 2: RETRIEVAL CONTROL
  ├── Hybrid retrieval: pgvector semantic + BM25 keyword
  ├── Confidence scoring on retrieved results
  ├── Minimum relevance threshold (0.25 for cross-language)
  └── Fallback cascade: Supabase → Vectra → keyword

Layer 3: GENERATION CONTROL
  ├── Constrained system prompt with product catalog injection
  ├── Structured output format (JSON schema enforcement)
  ├── Temperature 0.0-0.2 for factual tasks
  └── Explicit negative constraints: "Do NOT invent products"

Layer 4: OUTPUT VALIDATION
  ├── Parse JSON output, validate against schema
  ├── Cross-reference every product ID against retrieved catalog
  ├── Strip any product details that don't match database
  └── Verify prices match catalog (never trust LLM prices)

Layer 5: OBSERVABILITY
  ├── Log retrieval scores, generation confidence
  ├── Track hallucination rate over time
  └── Alert on products referenced but not in catalog
```

### Product ID Anchoring (Most Effective Pattern)

The single most impactful anti-hallucination pattern: the LLM never generates product details — it only selects product IDs from the retrieved set, then details are hydrated from the database.

```typescript
// ANTI-HALLUCINATION: Product ID Anchoring Pipeline
async function groundedRecommendation(userQuery: string) {
  // 1. Retrieve from Supabase pgvector
  const products = await searchProductsBySimilarity(queryEmbedding, {
    threshold: 0.25,
    limit: 20
  });

  // 2. Build constrained prompt — product IDs + names ONLY
  const productCatalog = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category
  }));

  const systemPrompt = `
    You MUST ONLY recommend products from the PRODUCT_CATALOG below.
    Output using ONLY the exact "id" field from the catalog.
    Do NOT invent product names, prices, or descriptions.

    PRODUCT_CATALOG:
    ${JSON.stringify(productCatalog)}

    OUTPUT FORMAT (strict JSON):
    {
      "looks": [{
        "name": "Look Name",
        "items": [{ "productId": "<id from catalog>", "role": "top|bottom|shoes|accessory" }],
        "tip": "Styling tip (your own words, no product details)"
      }]
    }
  `;

  // 3. Generate with low temperature
  const response = await llm.generate({
    systemPrompt,
    userMessage: userQuery,
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  // 4. Post-generation verification
  const parsed = JSON.parse(response);
  const validProductIds = new Set(products.map(p => p.id));

  for (const look of parsed.looks) {
    look.items = look.items.filter(item => validProductIds.has(item.productId));
  }
  parsed.looks = parsed.looks.filter(look => look.items.length > 0);

  // 5. Hydrate from database (NEVER from LLM output)
  for (const look of parsed.looks) {
    look.items = look.items.map(item => ({
      ...item,
      product: products.find(p => p.id === item.productId)
    }));
  }

  return parsed;
}
```

### Post-Generation Verification Pipeline

```typescript
function verifyRecommendation(
  llmOutput: LLMRecommendation,
  catalog: CatalogProduct[]
): VerifiedRecommendation {
  const catalogMap = new Map(catalog.map(p => [p.id, p]));
  const issues: VerificationIssue[] = [];

  const verifiedLooks = llmOutput.looks.map(look => {
    const verifiedItems = look.items
      .map(item => {
        const catalogProduct = catalogMap.get(item.productId);
        if (!catalogProduct) {
          issues.push({
            type: 'HALLUCINATED_PRODUCT',
            productId: item.productId,
            lookName: look.styleName
          });
          return null;
        }
        // ALWAYS use catalog data, never LLM-generated details
        return {
          productId: item.productId,
          role: item.role,
          name: catalogProduct.name,
          price: catalogProduct.price,
          imageUrl: catalogProduct.imageUrl,
          brand: catalogProduct.brand
        };
      })
      .filter(Boolean);
    return { ...look, items: verifiedItems };
  }).filter(look => look.items.length > 0);

  return {
    looks: verifiedLooks,
    hallucinations: issues,
    verificationScore: 1 - (issues.length / llmOutput.looks.flatMap(l => l.items).length)
  };
}
```

### Graceful Degradation When No Products Match

```typescript
function handleEmptyRetrieval(
  retrievedProducts: CatalogProduct[],
  minRequired: number = 3
): FallbackStrategy {
  if (retrievedProducts.length >= minRequired) {
    return { strategy: 'normal', products: retrievedProducts };
  }
  if (retrievedProducts.length > 0) {
    return {
      strategy: 'partial',
      products: retrievedProducts,
      promptAddition: `Only ${retrievedProducts.length} products matched.
        Recommend from what's available. Do NOT invent additional products.`
    };
  }
  return {
    strategy: 'advice_only',
    products: [],
    promptAddition: `No products match this request.
      Provide general fashion advice WITHOUT recommending specific products.
      Do NOT fabricate product names or brands.`
  };
}
```

## Implementation Guide

### Step-by-Step for OOTD

**Phase 1: Immediate (no new dependencies)**

1. **Add product ID anchoring** in `ai-chat-service.ts`:
   - Inject retrieved product IDs into system prompt as structured catalog
   - Instruct LLM to output only product IDs, not free-text names/prices
   - Hydrate product details from database after LLM response

2. **Add post-generation verification** after `looks-parser.ts`:
   - Cross-reference every product mentioned against retrieved catalog
   - Strip any products not in the catalog
   - Log hallucination count per response

3. **Add graceful degradation** for empty retrieval results:
   - When RAG returns 0 products, switch to advice-only mode
   - When RAG returns < 3 products, acknowledge limited selection

**Phase 2: Short-term (lightweight tooling)**

4. **Add Langfuse JS SDK** for observability:
   - Trace all LLM calls through the chat API
   - Monitor hallucination rates and retrieval quality
   - Dashboard for identifying patterns

5. **Implement LLM-as-Judge** validation:
   - After generating a response, send a second (cheaper) LLM call to verify grounding
   - ~$0.005-0.02 per check, +1-3s latency

**Phase 3: Medium-term (framework integration)**

6. **Evaluate Guardrails AI JavaScript SDK** for structured output validation
7. **Consider Cleanlab TLM API** if budget allows (best accuracy, ~100-500ms)

## Best Practices

### Prompt Engineering
1. **Never let the LLM generate product names, prices, or URLs** — always hydrate from database using product IDs
2. **Use structured output (JSON schema) enforcement** — `response_format: { type: "json_schema" }` for compatible models
3. **Set temperature to 0.0-0.2** for product recommendation tasks; reserve creativity for styling tips only
4. **Inject product catalog directly** into system prompt as structured data with id, name, price, category
5. **Use explicit negative constraints**: "Do NOT invent products", "Do NOT mention prices not in the catalog"
6. **Structured prompting with context-embedded tags** achieved 98.88% success rate in eliminating fabricated info

### Architecture
7. **Implement post-generation verification as mandatory** — never pass raw LLM output to frontend
8. **Separate retrieval from generation** architecturally — generation component receives ONLY retrieved products
9. **Use hybrid retrieval** (semantic + keyword) for better recall, especially cross-language (Thai→English)
10. **Implement graceful degradation** — honest "we don't have that" is infinitely better than hallucinated products

### Common Pitfalls to Avoid
- **Over-reliance on "don't hallucinate" instructions** — prompt instructions alone reduce hallucination by ~30%, not enough for production
- **Trusting LLM-generated prices** — always hydrate from database; LLMs frequently confuse prices across products
- **Ignoring cross-language amplification** — Thai→English queries have 2-3x higher hallucination risk
- **No monitoring** — without tracking hallucination rates, you can't measure improvement
- **Context window overflow** — stuffing too many products into context makes the model more likely to confuse details

## Tools & Technologies

### Evaluation Frameworks

| Tool | Type | TS Support | Accuracy | Cost | Latency |
|---|---|---|---|---|---|
| **Cleanlab TLM** | Hallucination detection API | API call | Best (~85%+) | ~$0.001/req | 100-500ms |
| **RAGAS** | RAG evaluation | Python only | ~76% | Free + LLM calls | 2-5s |
| **DeepEval** | LLM testing framework | Python only | ~76% | Free tier + $49/mo | 2-5s |
| **TruLens** | LLM observability | Python only | Good | Free core | 3-8s |

### Guardrail Libraries

| Tool | Type | TS Support | Key Feature |
|---|---|---|---|
| **Guardrails AI** | Output validation | **JS SDK available** | 100+ validators on Hub |
| **NeMo Guardrails** | Dialog control + guardrails | Python only | Self-consistency checking, Colang DSL |

### Observability

| Tool | Type | TS Support | Best For |
|---|---|---|---|
| **Langfuse** | LLM tracing + evals | **JS SDK available** | Monitoring hallucination patterns over time |
| **Arize Phoenix** | LLM observability | Python primarily | Built-in RAGAS integration |

### Lightweight Approaches (Best for OOTD's TypeScript Stack)

| Approach | Latency | Cost/Request | Accuracy | Setup |
|---|---|---|---|---|
| **LLM-as-Judge** | +1-3s | $0.005-0.02 | ~70% | Minimal |
| **Claim Extraction + Verify** | +2-5s | $0.01-0.03 | ~76% | Low |
| **Self-Consistency** | +3-8s | 2-3x gen cost | ~75% | Low |
| **Cleanlab TLM API** | +0.1-0.5s | ~$0.001/req | ~85%+ | Minimal |
| **Guardrails AI (JS)** | +0.1-0.3s | Free | Varies | Medium |
| **Langfuse tracing** | ~0ms (async) | Free-$59/mo | Observability | Low |

## Comparison & Trade-offs

### Prevention vs Detection

| Approach | When | Pros | Cons |
|---|---|---|---|
| **Prevention (constrained generation)** | Before LLM output | No hallucinations reach user; no extra latency | Limits LLM creativity; complex prompt engineering |
| **Detection (post-generation verification)** | After LLM output | Catches edge cases; measures hallucination rate | Adds latency; some hallucinations may slip through |
| **Both (recommended)** | Multi-layer | Best coverage; defense in depth | Most complex to implement |

### Retrieve-then-Generate vs Generate-then-Verify

| Pattern | Pros | Cons | Best For |
|---|---|---|---|
| **Retrieve-then-Generate** | Cheaper, faster, architecturally prevents fabrication | LLM constrained to retrieved set | Product recommendations (OOTD) |
| **Generate-then-Verify** | More creative output, catches a wider range | Extra cost/latency for verification pass | Open-ended fashion advice |

### Key Decision: Product ID Anchoring vs Free-Text Generation

**Product ID anchoring** (recommended for OOTD):
- LLM outputs only product IDs → details hydrated from DB
- Eliminates pricing/naming hallucinations entirely
- Trade-off: LLM can only recommend retrieved products

**Free-text generation** (current OOTD approach):
- LLM generates product names/descriptions freely
- More natural-sounding but high hallucination risk
- Requires heavy post-generation verification

## Relevance to OOTD Project

### Current State Analysis

OOTD already has solid foundations:
- **3-tier RAG pipeline** (Supabase pgvector → Vectra → keyword) for retrieval grounding
- **System prompt v5** with some anti-hallucination instructions
- **Structured LOOKS_DATA output format** — partial structured output
- **Guardrail detector** (`guardrail-detector.ts`) and **response validator** (`response-validator.ts`)
- **Lowered similarity threshold** (0.7 → 0.25) to handle Thai→English cross-language gap

### Key Gaps to Address

1. **Product ID anchoring is NOT enforced** — the LLM can still generate free-text product names/prices that may not match the Central Group catalog (visible in the screenshot: "Classic White Button Shirt" and "Tailored Black Trousers" may be fabricated names)
2. **No post-generation verification layer** — LLM output goes to frontend after parsing without cross-referencing against the actual product catalog
3. **No JSON schema enforcement** at the OpenRouter API level (`response_format`)
4. **Graceful degradation** when RAG returns no results could be more explicit
5. **No hallucination metrics tracking** — no way to measure improvement over time

### Recommended Action Plan

| Priority | Action | File to Modify | Impact |
|---|---|---|---|
| **P0** | Add product ID anchoring — inject catalog IDs into prompt, output only IDs | `ai-chat-service.ts`, `system-prompt-v5.ts` | Eliminates product name/price fabrication |
| **P0** | Add post-generation verification — cross-ref products against catalog | `ai-chat-service.ts` (new verification step) | Catches any remaining hallucinations |
| **P1** | Add `response_format: { type: "json_schema" }` to OpenRouter calls | `openrouter-client.ts` | Forces structured output |
| **P1** | Improve graceful degradation for empty/low retrieval | `ai-chat-service.ts` | Prevents fabrication when no products match |
| **P2** | Add Langfuse JS SDK for hallucination tracking | `app/api/chat/route.ts` | Enables monitoring and measurement |
| **P2** | Implement LLM-as-Judge validation | New utility in `lib/utils/` | Secondary verification layer |
| **P3** | Evaluate Guardrails AI JS SDK | New integration | Modular validation framework |

### Cost-Benefit for OOTD

- **Product ID anchoring**: Zero additional cost, zero latency — just prompt restructuring
- **Post-generation verification**: Zero cost (local code), ~10ms latency (map lookup)
- **JSON schema enforcement**: Zero cost, may slightly increase token usage
- **Langfuse**: Free self-hosted or $59/mo cloud, near-zero latency (async)
- **LLM-as-Judge**: ~$0.01/request, +1-3s latency — consider for high-stakes recommendations only

## Sources

### Overview & Fundamentals
- [The 2026 E-commerce Guide to Prevent AI Hallucinations — Wildmagic](https://thewildmagic.com/resources/guides/ecommerce-preventing-ai-hallucinations) — E-commerce hallucination types, prevention layers, business impact
- [RAG Hallucination: What It Is and How to Avoid It — K2view](https://www.k2view.com/blog/rag-hallucination/) — Why RAG systems still hallucinate, GenAI Data Fusion approach
- [How to Prevent LLM Hallucinations: 5 Proven Strategies — Voiceflow](https://www.voiceflow.com/blog/prevent-llm-hallucinations) — RAG + RLHF + guardrails = 96% reduction (Stanford study)
- [AI Hallucination Report 2026 — AllAboutAI](https://www.allaboutai.com/resources/ai-statistics/ai-hallucinations/) — Hallucination rate statistics
- [Retail-GPT: Leveraging RAG — arXiv](https://arxiv.org/pdf/2408.09025) — Academic paper on RAG for retail
- [Detect Hallucinations for RAG-based Systems — AWS](https://aws.amazon.com/blogs/machine-learning/detect-hallucinations-for-rag-based-systems/) — AWS hallucination detection approach
- [Consistently Hallucination-Proof Your LLMs — Kong](https://konghq.com/blog/enterprise/automated-rag-hallucination-proof-llms) — Automated guardrails approach

### Implementation & Architecture
- [Mitigating Hallucination in LLMs: Survey — arXiv 2025](https://arxiv.org/html/2510.24476v1) — Comprehensive survey on RAG patterns, verification, grounded generation
- [7 Proven Methods to Eliminate AI Hallucinations — Morphik](https://www.morphik.ai/blog/eliminate-hallucinations-guide) — Structured output, knowledge grounding, 98.88% success rate
- [Stop LLM Hallucinations: Reduce Errors by 60-80% — MasterOfCode](https://masterofcode.com/blog/hallucinations-in-llms-what-you-need-to-know-before-integration) — LOFT framework, multi-agent verification
- [Reducing Hallucinations with Custom Intervention — AWS](https://aws.amazon.com/blogs/machine-learning/reducing-hallucinations-in-large-language-models-with-custom-intervention-using-amazon-bedrock-agents/) — Pre/post-processing guardrails
- [Grounding AI Reduces Hallucinations — K2View](https://www.k2view.com/blog/grounding-ai/) — Entity-based RAG for product recommendations
- [LLM Evaluation Techniques for JSON Outputs — Promptfoo](https://www.promptfoo.dev/docs/guides/evaluate-json/) — JSON schema validation for LLM outputs
- [De-hallucinate AI Agents — Appsmith](https://www.appsmith.com/blog/de-hallucinate-ai-agents) — Practical de-hallucination patterns
- [Reducing LLM Hallucinations: Developer's Guide — Zep](https://www.getzep.com/ai-agents/reducing-llm-hallucinations/) — Structured output and retrieval separation
- [Hallucination Mitigation for RAG LLMs Review — MDPI](https://www.mdpi.com/2227-7390/13/5/856) — Academic review of hallucination mitigation for RAG

### Tools & Frameworks
- [Benchmarking Hallucination Detection Methods in RAG — Cleanlab](https://cleanlab.ai/blog/rag-tlm-hallucination-benchmarking/) — RAGAS, DeepEval, TLM, G-Eval benchmark comparison
- [The 5 Best RAG Evaluation Tools in 2026 — Maxim AI](https://www.getmaxim.ai/articles/the-5-best-rag-evaluation-tools-you-should-know-in-2026/) — Current RAG evaluation landscape
- [Best LLM Evaluation Tools: Top 9 Frameworks — ZenML](https://www.zenml.io/blog/best-llm-evaluation-tools) — Framework comparison
- [DeepEval Hallucination Metric Documentation](https://deepeval.com/docs/metrics-hallucination) — DeepEval hallucination metric details
- [NVIDIA NeMo Guardrails — GitHub](https://github.com/NVIDIA-NeMo/Guardrails) — NeMo Guardrails source and docs
- [Guardrails AI + NeMo Integration](https://www.guardrailsai.com/blog/nemoguardrails-integration) — Guardrail framework integration
- [Top 5 AI Guardrails — AIMultiple](https://research.aimultiple.com/ai-guardrails/) — Guardrails comparison
- [Langfuse LLM Observability](https://langfuse.com/docs/observability/overview) — Langfuse tracing and evaluation
- [HaluGate: Token-Level Hallucination Detection — vLLM](https://blog.vllm.ai/2025/12/14/halugate.html) — Production token-level detection (76-162ms overhead)
- [Prevent LLM Hallucinations with Cleanlab TLM in NeMo — NVIDIA](https://developer.nvidia.com/blog/prevent-llm-hallucinations-with-the-cleanlab-trustworthy-language-model-in-nvidia-nemo-guardrails/) — TLM + NeMo integration
- [Real-Time Evaluation Models for RAG — Cleanlab](https://cleanlab.ai/blog/rag-evaluation-models/) — Updated evaluation model benchmarks
- [Best AI Guardrails 2025 — FutureAGI](https://futureagi.com/blogs/top-5-ai-guardrailing-tools-2025) — 2025 guardrails landscape
- [How to Create Hallucination Detection — OneUptime (Jan 2026)](https://oneuptime.com/blog/post/2026-01-30-hallucination-detection/view) — Practical implementation guide
- [Self-Consistency Hallucination Detection — EmergentMind](https://www.emergentmind.com/topics/self-consistency-based-hallucination-detection) — Self-consistency methods overview
