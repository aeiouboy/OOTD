# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OOTDay is an AI-powered fashion assistant platform that helps Thai users with daily outfit decisions and connects fashion inspiration directly to Central Group purchase opportunities.

## Project Structure

```
/
├── apps/
│   ├── web/                        # Main Next.js 14 frontend (TypeScript)
│   │   ├── components/             # React components (chat, outfit, occasion, ui)
│   │   ├── lib/                    # Core logic (services, hooks, utils, types)
│   │   ├── tests/                  # Test suites
│   │   │   ├── e2e/                # Playwright E2E specs
│   │   │   ├── fixtures/           # Mock data & test fixtures
│   │   │   └── utils/              # Test utilities (evaluator, scenarios, exporter)
│   │   └── scripts/                # Standalone scripts (seeding, testing)
│   └── sentiment_classification/   # ML sentiment classifier
├── docs/                           # Documentation
│   ├── architecture/               # System design & analysis docs
│   ├── prd/                        # Product requirements
│   ├── guides/                     # Development & testing guides
│   └── bugs/                       # Bug reports
├── scripts/                        # Automation scripts
│   ├── classification/             # Product scraping & occasion classification
│   ├── image_processing/           # Image processing (Python)
│   └── migration/                  # DB migration scripts
├── data/                           # Data files
│   ├── products/                   # Product JSON (fallback)
│   ├── personas/                   # AI persona definitions + knowledge base
│   ├── catalogs/                   # Product catalog CSVs
│   └── assets/                     # Static images
├── specs/                          # Feature specs & implementation plans
├── tasks/                          # Task definitions
├── research/                       # Research documents
└── .claude/                        # Claude Code config (agents, skills, commands)
```

**Not tracked in git** (via `.gitignore`):
- `apps/web/public/generated-images/` — runtime flat-lay output (1400+ images)
- `logs/`, `apps/web/logs/` — Claude Code hook logs
- `test-result/` — Playwright E2E screenshots (committed selectively)
- `.claude/data/sessions/` — Claude session data

## Key Architecture

### Frontend Application (apps/web/)
- **Framework**: Next.js 14.2 with TypeScript, App Router
- **UI Components**: Radix UI with shadcn/ui theming
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks and custom hooks in `lib/hooks/`
- **Package Manager**: pnpm
- **Test Runner**: Vitest (1032+ tests across 45 files)
- **Component Structure**:
  - `components/chat/`: Chat interface (`ChatAssistant.tsx`) + outfit cards (`OutfitRecommendationCard.tsx`)
  - `components/outfit/`: Outfit detail panel (`OutfitDetail.tsx`)
  - `components/product/`: Product modal and details
  - `components/occasion/`: Occasion suggestion grid
  - `components/layout/`: Header and bottom navigation
  - `components/ui/`: Base UI components (Pagination, etc.)

### Chat Pipeline (v5.0 — Current)
The core AI fashion recommendation flow:

1. **Entry**: `POST /api/chat` → `app/api/chat/route.ts`
2. **Product Loading**: Supabase (primary) → JSON fallback → transform via `db-product-to-enhanced.ts`
3. **Processing**: `lib/services/ai-chat-service.ts::processAIChatRequestV5()`
   - Guardrails check → Image request detection → User query analysis
   - Occasion detection (hard keywords + Thai cultural matcher)
   - Product filtering (semantic search + formality filter + budget + gender + color)
   - RAG knowledge retrieval (Supabase pgvector + keyword fallback)
   - AI prompt building (catalog + occasion instruction + knowledge context)
   - AI call → Loop detection → Structured looks parsing → Anti-hallucination validation
4. **Response**: `{ message, looks: ChatLook[], outfits: [], imageRequest }`
5. **Frontend**: `ChatAssistant.tsx` converts `looks` → `Outfit[]` → renders `OutfitRecommendationCard`
6. **Flat-lay**: Auto-generates outfit images via `google/gemini-2.5-flash-image`

### Product Data
- **Primary**: Supabase PostgreSQL — `products` table (1000+ items with pgvector embeddings)
  - Occasion scores: `occasion_weekend_social`, `occasion_date_night`, `occasion_everyday_casual` (0-10)
  - Thai market: `temple_appropriate`, `ac_friendly`, `thai_climate_rating`
- **Fallback**: JSON files in `data/products/` (when `SUPABASE_PRODUCTS_ENABLED=false`)
- **Type**: `EnhancedProduct` (full model) in `lib/types/product-types.ts`
- **Transformer**: `lib/transformers/db-product-to-enhanced.ts` (DbProduct → EnhancedProduct)

### RAG Pipeline (Supabase + keyword fallback)
1. **Supabase pgvector** — `knowledge_chunks` table (225 docs, 1536d embeddings)
   - RPC: `search_knowledge()` + `search_products()`, threshold 0.25
   - Categories: foundation (54), advanced (75), implementation (60), special (36)
2. **Keyword fallback** — hardcoded topic detection (occasion, thai_culture, color, body_type, etc.)
- Embedding model: `openai/text-embedding-3-small` via OpenRouter
- Thai→English translation before embedding (Gemini 2.0 Flash)
- Cross-language similarity scores ~0.23-0.30 (hence threshold 0.25, not 0.7)

### Occasion Detection & Filtering
- **9 occasions**: work, chill, wedding, sport, travel, date, dinner, cafe, party
- **Defined in**: `lib/constants/occasions.ts` with formality ranges (1-10 scale)
- **Beach sub-occasion**: Keywords "ทะเล/ชายหาด/เกาะ" override travel formality to 1-3
- **Hard formality filter**: Always applied, widens by ±2 as fallback (never completely skips)
- **Occasion prompt injection**: `buildOccasionInstruction()` injects explicit AI rules (MUST/NEVER recommend)

### Flat-Lay Image Generation
- **Orchestrator**: `lib/services/occasion-flat-lay-service.ts`
- **Image model**: `google/gemini-2.5-flash-image` via OpenRouter (30s timeout, 2 retries)
- **Flow**: AI curation → layout computation → image prompt building → generation
- **Output**: Saved to `public/generated-images/outfit-{timestamp}.png`
- **Intermittent**: Sometimes returns text instead of image (retry logic handles this)

### AI Models Used (all via OpenRouter)
| Purpose | Model |
|---------|-------|
| Chat/Recommendations | `google/gemini-3-flash-preview` (temp 0.7) |
| Image Generation | `google/gemini-2.5-flash-image` |
| Embeddings | `openai/text-embedding-3-small` (1536d) |
| Query Translation | `google/gemini-2.0-flash-001` |

### Environment Variables
```env
OPENROUTER_API_KEY=              # Server-side (preferred for chat, image gen, embeddings)
NEXT_PUBLIC_OPENROUTER_API_KEY=  # Client-side fallback
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase server-side key
SUPABASE_PRODUCTS_ENABLED=true   # Use Supabase products vs JSON fallback
SUPABASE_RAG_ENABLED=true        # Use Supabase pgvector vs Vectra fallback
SYSTEM_PROMPT_VERSION=v5.0       # Chat prompt version (v2.1, v3.0, v4.0, v5.0)
```

### Supabase Tables & RPCs
| Table | Purpose |
|-------|---------|
| `products` | 1000+ Central Group products with pgvector embeddings, occasion scores, Thai market flags |
| `knowledge_chunks` | 225 fashion knowledge docs (styling rules, color theory, Thai culture, occasions) |

| RPC | Purpose |
|-----|---------|
| `search_products` | Semantic product search (pgvector, threshold 0.25) |
| `search_knowledge` | Semantic knowledge search (pgvector, threshold 0.25) |

### Utility Scripts (scripts/)
- **classification/** - Product scraping and occasion classification for Central Group inventory
- **image_processing/** - Python utilities for processing product images
- **migration/** - Database migration scripts (e.g., `migrate_kb_attributes.py`)

## Development Commands

### Frontend (apps/web/)
```bash
cd apps/web

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build production
pnpm build

# Run linting
pnpm lint

# Run tests (Vitest)
pnpm test
# or: pnpm vitest run
```

## Key File Locations

| File | Purpose |
|------|---------|
| `apps/web/app/api/chat/route.ts` | Chat API endpoint |
| `apps/web/lib/services/ai-chat-service.ts` | Core v5 chat pipeline (processAIChatRequestV5) |
| `apps/web/lib/prompts/system-prompt-v5.ts` | v5 system prompt |
| `apps/web/lib/rag/supabase-retrieval.ts` | RAG retrieval from Supabase |
| `apps/web/lib/supabase/products.ts` | Product queries (Supabase) |
| `apps/web/lib/supabase/knowledge.ts` | Knowledge queries (Supabase) |
| `apps/web/lib/utils/clarification-detector.ts` | Occasion/budget/gender extraction |
| `apps/web/lib/utils/product-filters.ts` | Product filtering utilities |
| `apps/web/lib/constants/occasions.ts` | Occasion definitions + formality ranges |
| `apps/web/lib/transformers/db-product-to-enhanced.ts` | DB → EnhancedProduct transformer |
| `apps/web/lib/services/occasion-flat-lay-service.ts` | Flat-lay image orchestration |
| `apps/web/lib/services/image-generation-service.ts` | Gemini image generation client |
| `apps/web/lib/matching/thai-cultural-matcher.ts` | Thai cultural occasion matching |
| `apps/web/components/chat/ChatAssistant.tsx` | Main chat UI + looks→Outfit conversion |
| `apps/web/components/chat/OutfitRecommendationCard.tsx` | Outfit card component |
| `apps/web/next.config.mjs` | Next.js config (serverComponentsExternalPackages for vectra/gpt-3-encoder) |

## Core Business Context

The platform targets four main user segments:
1. Fashion-Curious & Social Users (15-28)
2. Fashion-Struggling Shoppers (18-35)
3. Mobile-First Inspiration Seekers (20-35)
4. Special Occasions & Professionals (25-45)

MVP features:
- Natural language chat (Thai + English) for fashion recommendations
- AI-powered product matching with Central Group inventory (1000+ products)
- Direct purchase links to central.co.th
- Flat-lay outfit image generation
- Occasion-based filtering with Thai cultural context

## Integration Points

- **Central Group**: Product inventory (Supabase), purchase links (central.co.th)
- **OpenRouter**: AI chat (Gemini), image generation (Gemini), embeddings (OpenAI)
- **Supabase**: PostgreSQL + pgvector for products & knowledge
- **Playwright MCP**: Browser automation E2E testing

## Guidelines

- Research documents go in `research/`, implementation plans in `specs/`
- **Plan mode**: After a plan is approved, always save it to `specs/<descriptive-name>.md` before starting implementation
- Save test results from Playwright screen capture to `test-result/`
- **Testing**: Use Vitest with mocks/stubs — never use real API calls in tests
- **E2E best practice**: Always click "ดูลุค" to inspect product items, not just chat text
- **Thai cross-language**: Similarity threshold is 0.25 (not 0.7) due to Thai→English embedding scores

## Claude Code Configuration

- `.claude/commands/` - Slash command templates
- `.claude/skills/` - Skill definitions (orchestrator, playwright-mcp)
- `.claude/agents/` - Agent configurations