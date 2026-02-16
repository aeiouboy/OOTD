# OOTDay - AI Fashion Assistant

OOTDay is an AI-powered fashion assistant for Thai users that turns chat-based styling advice into shoppable outfit recommendations.

## Latest Updates (February 2026)

- **Cross-look deduplication v8.0+**: Fixed cross-look contamination issues by removing global product replacement and per-look isolated flat-lay generation.
- Dynamic response mode is now first-turn vs follow-up aware.
- First message + informational-looking query still returns `CLOTHS` recommendations (looks).
- Follow-up informational query (after recommendations) returns text-first knowledge with CTA before generating more looks.
- CTA behavior is explicit.
  - `Yes` generates looks.
  - `No` keeps conversation in info mode (no auto-look generation loop).
- Flat-lay fallback UI no longer uses product photos.
  - When image generation fails, UI shows abstract fallback cards (no model leakage from source product images).
- Flat-lay generation is stricter against human outputs.
  - Default flat-lay mode now avoids reference images (`FLAT_LAY_REFERENCE_IMAGE_MODE=none` unless overridden).
  - Prompt now includes stronger "flat-lay purity lock" to reject human/model/mannequin outputs.

## Core Capabilities

- AI chat stylist (Thai + English) with session-aware context.
- Occasion-aware outfit recommendations with structured `looks`.
- RAG knowledge retrieval from Supabase pgvector + keyword fallback.
- Product retrieval from Supabase catalog with JSON fallback.
- Flat-lay image generation for each look (isolated per-look, no cross-contamination).
- Direct shopping links to Central Group product pages.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript 5.3+, Tailwind CSS v4 |
| **UI Components** | Radix UI + shadcn/ui |
| **State Management** | Zustand |
| **Backend** | Azure Functions, Node.js/TypeScript |
| **AI/ML** | Claude AI, n8n, Langflow |
| **Database** | Azure Cosmos DB, Redis Cache |
| **Storage** | Azure Blob Storage |
| **Testing** | Playwright (E2E), Vitest |
| **Auth** | Azure AD B2C |
| **Product Data** | Central Group API |

## Architecture At A Glance

- Chat entrypoint: `/api/chat` -> `/Users/tachongrak/Projects/OOTD/apps/web/app/api/chat/route.ts`
- Core chat pipeline: `/Users/tachongrak/Projects/OOTD/apps/web/lib/services/ai-chat-service.ts`
- v5 flow: guardrails -> query analysis -> product filtering -> RAG retrieval -> prompt build -> AI -> looks parse/validate -> response
- Image endpoint: `/api/generate-image` -> `/Users/tachongrak/Projects/OOTD/apps/web/app/api/generate-image/route.ts`
- Image client and flat-lay logic: `/Users/tachongrak/Projects/OOTD/apps/web/lib/services/image-generation-service.ts`
- Flat-lay prompt builder: `/Users/tachongrak/Projects/OOTD/apps/web/lib/prompts/image-prompts.ts`

## Quick Start

```bash
cd /Users/tachongrak/Projects/OOTD/apps/web
pnpm install
cp .env.sample .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

If you need a custom port:

```bash
pnpm dev -p 3100
```

## Environment Variables

Minimum required for end-to-end AI flow:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | Server-side chat + image generation |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server ops) | Server-side Supabase access |

Common feature flags:

| Variable | Default | Purpose |
| --- | --- | --- |
| `SUPABASE_PRODUCTS_ENABLED` | `true` | Use Supabase products (`false` = JSON fallback) |
| `SUPABASE_RAG_ENABLED` | `true` | Enable semantic product search path |
| `SYSTEM_PROMPT_VERSION` | `v5.0` | Chat prompt version selector |
| `FLAT_LAY_USE_VISION` | `true` | Vision description enrichment mode |
| `FLAT_LAY_STRICT_PRODUCT_ONLY` | `true` | Enforce strict product-only image behavior |

Advanced flat-lay controls:

| Variable | Default | Purpose |
| --- | --- | --- |
| `FLAT_LAY_REFERENCE_IMAGE_MODE` | `none` | `none`, `non-garment`, `all` reference image usage |
| `FLAT_LAY_INCLUDE_PRIMARY_GARMENT_REFERENCE` | `false` | Opt-in to include hero garment reference in `non-garment` mode |

## Development Commands

```bash
cd /Users/tachongrak/Projects/OOTD/apps/web
pnpm dev
pnpm build
pnpm lint
pnpm test
```

## Testing

Vitest:

```bash
cd /Users/tachongrak/Projects/OOTD/apps/web
pnpm vitest run
```

Playwright (example):

```bash
cd /Users/tachongrak/Projects/OOTD/apps/web
pnpm exec playwright test tests/e2e/e2e-chat-journey.spec.ts --project=chromium
```

E2E screenshots and debugging artifacts are typically saved under:

- `/Users/tachongrak/Projects/OOTD/test-result`

## Repository Structure

```text
/Users/tachongrak/Projects/OOTD
├── apps/
│   ├── web/                      # Next.js app
│   └── sentiment_classification/ # ML service
├── data/                         # Products, personas, assets
├── docs/                         # Architecture, guides, PRDs
├── research/                     # Research documents
├── scripts/                      # Automation and tooling
├── specs/                        # Feature specs and implementation plans
├── tasks/                        # Task definitions
└── test-result/                  # Playwright outputs/screenshots
```

## Target Users

1. **Fashion-Curious & Social Users** (15-28)
2. **Fashion-Struggling Shoppers** (18-35)
3. **Mobile-First Inspiration Seekers** (20-35)
4. **Special Occasions & Professionals** (25-45)

## Integration Points

| System | Purpose |
|--------|---------|
| **Central Group API** | Product catalog and inventory |
| **Claude AI API** | Fashion recommendations and chat |
| **Kling AI** | Virtual try-on image generation |
| **Azure Functions** | Serverless backend APIs |
| **Azure Cosmos DB** | Product and user data |
| **Azure Blob Storage** | Images and media |
| **Azure AD B2C** | User authentication |
| **Playwright MCP** | Browser automation testing |

## Key References

- Architecture: `/Users/tachongrak/Projects/OOTD/docs/architecture/architecture.md`
- Loop analysis: `/Users/tachongrak/Projects/OOTD/docs/architecture/loop-analysis.md`
- Test mode guide: `/Users/tachongrak/Projects/OOTD/docs/guides/test-mode.md`
- Informational query detection spec: `/Users/tachongrak/Projects/OOTD/specs/informational-query-detection.md`
- Vision flat-lay implementation spec: `/Users/tachongrak/Projects/OOTD/apps/web/specs/VISION_FLAT_LAY_IMPLEMENTATION.md`
