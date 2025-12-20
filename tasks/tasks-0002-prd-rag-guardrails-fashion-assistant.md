# Task List: RAG Capabilities & Guardrails for Fashion Chat Assistant

**Generated from:** `0002-prd-rag-guardrails-fashion-assistant.md`
**Created:** 2025-10-11
**Status:** In Progress

## Relevant Files

### Core RAG System
- `v0-ootd-ay-ai-fashion-assistant/lib/rag/knowledge-base.ts` - Core knowledge base management: load, index, and cache markdown files
- `v0-ootd-ay-ai-fashion-assistant/lib/rag/embeddings.ts` - Embedding generation and vector search using OpenAI or Sentence Transformers
- `v0-ootd-ay-ai-fashion-assistant/lib/rag/retrieval.ts` - RAG retrieval logic: query processing, semantic search, and ranking
- `v0-ootd-ay-ai-fashion-assistant/lib/rag/knowledge-parser.ts` - Markdown parsing into structured chunks with metadata
- `v0-ootd-ay-ai-fashion-assistant/lib/rag/cache.ts` - LRU cache implementation for knowledge chunks and embeddings

### Guardrails System
- `v0-ootd-ay-ai-fashion-assistant/lib/guardrails/pre-validation.ts` - Pre-validation: off-topic detection and query validation
- `v0-ootd-ay-ai-fashion-assistant/lib/guardrails/post-validation.ts` - Post-validation: occasion appropriateness, brand voice, topic relevance
- `v0-ootd-ay-ai-fashion-assistant/lib/guardrails/regeneration.ts` - Regeneration mechanism with constraint injection
- `v0-ootd-ay-ai-fashion-assistant/lib/guardrails/validation-rules.ts` - Validation rules, keywords, and patterns (occasions, brand voice, topics)

### Orchestration & Integration
- `v0-ootd-ay-ai-fashion-assistant/lib/chat-orchestrator.ts` - Main orchestrator: coordinates RAG, Guardrails, and LLM calls
- `v0-ootd-ay-ai-fashion-assistant/lib/rag-guardrail-logger.ts` - Logging and metrics tracking for RAG and Guardrails
- `v0-ootd-ay-ai-fashion-assistant/lib/openrouter-client.ts` - Existing OpenRouter client (modify to support RAG-augmented prompts)

### Test Mode Integration
- `v0-ootd-ay-ai-fashion-assistant/lib/test-evaluator.ts` - Existing evaluator (extend with RAG/Guardrail criteria)
- `v0-ootd-ay-ai-fashion-assistant/lib/test-result-exporter.ts` - Existing exporter (add new CSV columns)
- `v0-ootd-ay-ai-fashion-assistant/lib/types/test-types.ts` - Existing types (add RAG/Guardrail interfaces)
- `v0-ootd-ay-ai-fashion-assistant/components/chat/RagDebugPanel.tsx` - New component: display RAG debugging info in test mode
- `v0-ootd-ay-ai-fashion-assistant/components/chat/GuardrailStatus.tsx` - New component: display guardrail validation results
- `v0-ootd-ay-ai-fashion-assistant/components/chat/TestModePanel.tsx` - Existing component (add RAG/Guardrail controls)
- `v0-ootd-ay-ai-fashion-assistant/components/chat/EvaluationResults.tsx` - Existing component (add new evaluation criteria)

### Knowledge Base Content
- `knowledge/fashion/style-principles.md` - Core fashion style principles and rules
- `knowledge/fashion/color-matching.md` - Color coordination and matching guidelines
- `knowledge/fashion/seasonal-trends.md` - Seasonal fashion recommendations
- `knowledge/occasions/work-office.md` - Work and office styling guide with do's and don'ts
- `knowledge/occasions/wedding-formal.md` - Wedding and formal event styling guide
- `knowledge/occasions/casual-weekend.md` - Casual and weekend styling guide
- `knowledge/occasions/date-night.md` - Date night styling guide
- `knowledge/occasions/party-club.md` - Party and club styling guide
- `knowledge/brand/voice-guidelines.md` - Brand voice and tone guidelines for Thai language
- `knowledge/brand/response-templates.md` - Response template patterns and examples

### Configuration
- `v0-ootd-ay-ai-fashion-assistant/.env.local` - Add RAG and Guardrail configuration variables
- `v0-ootd-ay-ai-fashion-assistant/config/rag-config.ts` - RAG configuration (embedding model, thresholds, cache settings)
- `v0-ootd-ay-ai-fashion-assistant/config/guardrail-config.ts` - Guardrail configuration (validation rules, regeneration settings)

### Notes
- Use existing OpenRouter client pattern for API integration
- Follow existing test-evaluator pattern for new evaluation criteria
- Leverage existing test mode UI components for consistency
- Use TypeScript strict mode for all new files
- Follow existing file structure conventions in `lib/` and `components/`

---

## Tasks

- [x] 1.0 Setup Knowledge Base Infrastructure
  - [x] 1.1 Create `/knowledge` directory structure with subdirectories: `fashion/`, `occasions/`, `brand/`
  - [x] 1.2 Create TypeScript interfaces for knowledge chunks, embeddings, and metadata in `lib/types/rag-types.ts`
  - [x] 1.3 Create base configuration files: `config/rag-config.ts` and `config/guardrail-config.ts`
  - [x] 1.4 Install required dependencies: `vectra` or `chromadb` for vector search, `gray-matter` for markdown frontmatter parsing
  - [x] 1.5 Create utility functions for file system operations (reading markdown files recursively) in `lib/rag/file-utils.ts`

- [x] 2.0 Implement RAG System (Retrieval & Embeddings)
  - [x] 2.1 Create `lib/rag/knowledge-parser.ts`: implement markdown parsing with section splitting (## headings), chunk creation (200-500 tokens), and 50-token overlap
  - [x] 2.2 Create `lib/rag/embeddings.ts`: implement embedding generation using OpenAI `text-embedding-3-small` API with batching support
  - [x] 2.3 Create `lib/rag/cache.ts`: implement LRU cache for embeddings and knowledge chunks (max 100 items)
  - [x] 2.4 Create `lib/rag/vector-search.ts`: implement cosine similarity calculation and semantic search with threshold filtering (>0.7)
  - [x] 2.5 Create `lib/rag/knowledge-base.ts`: implement knowledge base loader that reads all markdown files, generates embeddings, and maintains in-memory index
  - [x] 2.6 Create `lib/rag/retrieval.ts`: implement retrieval logic that extracts query intent, searches knowledge base, ranks results, and returns top 3-5 chunks
  - [x] 2.7 Add reload/refresh functionality to knowledge base for dynamic updates

- [x] 3.0 Implement Guardrails System (Pre & Post Validation)
  - [x] 3.1 Create `lib/guardrails/validation-rules.ts`: define keyword lists (fashion, off-topic, occasions), brand voice patterns, and occasion appropriateness rules (use TypeScript objects from PRD Appendix B)
  - [x] 3.2 Create `lib/guardrails/pre-validation.ts`: implement off-topic detection using keyword matching and query validation (language check, inappropriate content filter)
  - [x] 3.3 Create `lib/guardrails/post-validation.ts` (Part 1): implement occasion appropriateness validator that extracts mentioned products and checks against occasion rules
  - [x] 3.4 Create `lib/guardrails/post-validation.ts` (Part 2): implement brand voice compliance checker (Thai particles, emoji count, formal term detection)
  - [x] 3.5 Create `lib/guardrails/post-validation.ts` (Part 3): implement topic relevance checker using fashion keyword presence and off-topic domain detection
  - [x] 3.6 Create `lib/guardrails/regeneration.ts`: implement regeneration mechanism with constraint injection, max 2 attempts, and fallback response logic
  - [x] 3.7 Add logging for all validation events (blocks, violations, regenerations) with structured data

- [x] 4.0 Build Chat Orchestrator & Integration Layer
  - [x] 4.1 Create `lib/chat-orchestrator.ts`: implement main orchestration flow (User Query → Pre-Validation → RAG Retrieval → Augmented Prompt → LLM → Post-Validation → Response)
  - [x] 4.2 Integrate RAG retrieval: modify prompt generation to inject retrieved knowledge chunks into system prompt
  - [x] 4.3 Integrate pre-validation: add off-topic check before LLM call, return redirect message if blocked
  - [x] 4.4 Integrate post-validation: add all 3 validators (occasion, brand voice, topic) after LLM response
  - [x] 4.5 Implement graceful degradation: handle RAG failures (continue without RAG context), guardrail failures (fail open), and log errors
  - [x] 4.6 Add performance optimization: run RAG retrieval and pre-validation in parallel using Promise.all()
  - [x] 4.7 Create `lib/rag-guardrail-logger.ts`: implement structured logging for RAG retrievals, guardrail events, and system errors with timestamps and metadata
  - [x] 4.8 Modify existing `lib/openrouter-client.ts`: add support for RAG-augmented prompts (accept additional context parameter)

- [ ] 5.0 Create Knowledge Base Content
  - [ ] 5.1 Write `knowledge/fashion/style-principles.md`: document core fashion principles, silhouette guidelines, and styling fundamentals (in Thai)
  - [ ] 5.2 Write `knowledge/fashion/color-matching.md`: document color theory, complementary colors, seasonal palettes, and Thai skin tone considerations
  - [ ] 5.3 Write `knowledge/fashion/seasonal-trends.md`: document Thai seasonal considerations (hot season, rainy season, cool season) and appropriate fabrics
  - [ ] 5.4 Write `knowledge/occasions/work-office.md`: document business casual guidelines with allowed/blocked items list (reference PRD Appendix A format)
  - [ ] 5.5 Write `knowledge/occasions/wedding-formal.md`: document formal event styling with dress codes, color guidelines, and items to avoid
  - [ ] 5.6 Write `knowledge/occasions/casual-weekend.md`: document casual styling with comfort and versatility focus
  - [ ] 5.7 Write `knowledge/occasions/date-night.md`: document romantic styling with confidence and appropriateness balance
  - [ ] 5.8 Write `knowledge/occasions/party-club.md`: document party styling with trendiness and boldness guidelines
  - [ ] 5.9 Write `knowledge/brand/voice-guidelines.md`: document OOTDay brand voice (friendly Thai particles, conversational tone, emoji usage rules)
  - [ ] 5.10 Write `knowledge/brand/response-templates.md`: document response structure examples and format patterns

- [ ] 6.0 Extend Test Mode with RAG/Guardrail Evaluation
  - [ ] 6.1 Update `lib/types/test-types.ts`: add interfaces for RAG debug data (retrieved chunks, relevance scores), guardrail results (validation status, regeneration history)
  - [ ] 6.2 Extend `lib/test-evaluator.ts`: add 5 new evaluation functions (RAG retrieval quality 0-10, occasion appropriateness pass/fail, brand voice compliance 0-10, topic relevance pass/fail, guardrail trigger rate metric)
  - [ ] 6.3 Create `components/chat/RagDebugPanel.tsx`: display retrieved knowledge chunks with relevance scores, source document names, and collapsible chunk content using Accordion component
  - [ ] 6.4 Create `components/chat/GuardrailStatus.tsx`: display validation results for each check (pre-validation, occasion, brand voice, topic relevance) using Badge components (green/red/yellow)
  - [ ] 6.5 Update `components/chat/EvaluationResults.tsx`: add new evaluation criteria section displaying RAG/Guardrail scores alongside existing metrics
  - [ ] 6.6 Update `components/chat/TestModePanel.tsx`: add RAG on/off toggle switch and "RAG & Guardrails" tab for debugging controls
  - [ ] 6.7 Extend `lib/test-result-exporter.ts`: add new CSV columns (rag_chunks_retrieved, rag_avg_relevance_score, pre_validation_result, post_validation_result, regeneration_count, occasion_appropriate, brand_voice_score, topic_relevance)
  - [ ] 6.8 Update markdown export template to include RAG debugging information and guardrail validation history

- [ ] 7.0 Add Configuration & Admin Controls
  - [ ] 7.1 Add environment variables to `.env.local`: RAG_ENABLED, RAG_RETRIEVAL_TOP_K, RAG_SIMILARITY_THRESHOLD, GUARDRAIL_PRE_VALIDATION_ENABLED, GUARDRAIL_POST_VALIDATION_ENABLED, GUARDRAIL_MAX_REGENERATIONS, OPENAI_API_KEY (for embeddings)
  - [ ] 7.2 Create `config/rag-config.ts`: export configuration object with embedding model settings, retrieval parameters, cache settings, and file paths
  - [ ] 7.3 Create `config/guardrail-config.ts`: export configuration object with validation thresholds, keyword lists, regeneration settings, and redirect message template
  - [ ] 7.4 Add admin controls to `components/chat/TestModePanel.tsx`: toggle individual guardrails on/off, trigger knowledge base reload button, view guardrail logs button
  - [ ] 7.5 Implement knowledge base reload API route (if using API routes) or direct function call in test mode
  - [ ] 7.6 Add operational metrics display in test mode: RAG retrieval success rate, average retrieval time, guardrail block/regeneration rates, knowledge base health stats

- [ ] 8.0 Testing, Optimization & Documentation
  - [ ] 8.1 Write unit tests for `knowledge-parser.ts`: test chunk splitting, overlap handling, metadata extraction
  - [ ] 8.2 Write unit tests for `embeddings.ts` and `vector-search.ts`: test cosine similarity calculation, relevance filtering, ranking
  - [ ] 8.3 Write unit tests for all guardrail validators: test keyword matching, occasion rules, brand voice patterns with various inputs
  - [ ] 8.4 Write unit tests for `regeneration.ts`: test constraint injection, max attempts, fallback response logic
  - [ ] 8.5 Write integration tests for `chat-orchestrator.ts`: test full flow with mocked LLM responses, verify pre/post validation execution
  - [ ] 8.6 Run existing 54+ test scenarios with RAG/Guardrails enabled, compare results against baseline (target: 30% improvement)
  - [ ] 8.7 Performance testing: measure RAG retrieval time (<200ms), guardrail validation time (<250ms), total added latency (<500ms), optimize if needed
  - [ ] 8.8 Load testing: test with 100+ sequential queries to verify cache performance and memory usage
  - [ ] 8.9 Edge case testing: test with ambiguous queries, multi-occasion queries, mixed language queries, very long/short queries
  - [ ] 8.10 Create README documentation: usage instructions, configuration guide, knowledge base content guidelines, troubleshooting
  - [ ] 8.11 Create inline code documentation: add JSDoc comments to all public functions and interfaces
  - [ ] 8.12 Create example usage guide: demonstrate RAG/Guardrail system with sample queries and expected outputs

---

## Progress Tracking

**Total Tasks:** 8 parent tasks, 63 sub-tasks
**Completed:** 4 parent tasks (50%), 29 sub-tasks (46%)
**In Progress:** Task 5.0 - Create Knowledge Base Content
**Remaining:** 4 parent tasks, 34 sub-tasks

---

## Implementation Order Recommendation

1. Start with **Task 1.0** (Infrastructure) - establishes foundation
2. Move to **Task 5.0** (Knowledge Content) - provides data for testing RAG
3. Then **Task 2.0** (RAG System) - can test retrieval with real content
4. Then **Task 3.0** (Guardrails) - independent validation system
5. Then **Task 4.0** (Orchestrator) - ties everything together
6. Then **Task 6.0** (Test Mode) - enables evaluation and debugging
7. Then **Task 7.0** (Configuration) - finalize settings and controls
8. Finally **Task 8.0** (Testing) - comprehensive validation

---

**Next Steps:**
Begin implementation with Task 1.1: Create knowledge directory structure
