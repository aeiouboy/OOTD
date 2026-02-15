# OOTDay - AI Fashion Assistant

An AI-powered fashion assistant platform that helps users with daily outfit decisions and connects fashion inspiration directly to purchase opportunities.

## Overview

OOTDay combines:
- **AI Chat Interface**: Natural language fashion recommendations powered by Gemini AI
- **Product Matching**: Integration with Central Group inventory for direct purchases
- **RAG Pipeline**: Supabase pgvector semantic search for fashion knowledge and products

## Quick Start

### Frontend Development

```bash
cd apps/web
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Setup

```bash
cd apps/web
cp .env.sample .env
# Add your API keys:
# - OPENROUTER_API_KEY for AI models (Gemini, OpenAI embeddings)
# - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase
# - SUPABASE_SERVICE_ROLE_KEY for server-side operations
```

## Project Structure

```
/
├── apps/
│   ├── web/                        # Next.js 14 frontend (TypeScript)
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
│   ├── bugs/                       # Bug reports
│   └── migration/                  # Migration guides
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

## Tech Stack

### Frontend (apps/web/)
- **Framework**: Next.js 14.2 with TypeScript, App Router
- **UI**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest (1032+ tests), Playwright E2E
- **Package Manager**: pnpm

### Backend & AI
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI Models**: OpenRouter (Gemini 3 Flash, Gemini 2.5 Flash Image, OpenAI embeddings)
- **RAG**: Supabase pgvector (225 knowledge chunks, 1000+ products with embeddings)
- **Image Generation**: Gemini vision-based flat-lay generation

### Development Tools
- **AI Assistant**: Claude Code with custom skills
- **Browser Automation**: Playwright MCP

## Development Commands

```bash
# Frontend
cd apps/web
pnpm install      # Install dependencies
pnpm dev          # Development server
pnpm build        # Production build
pnpm lint         # Run linting
pnpm test         # Run tests (Vitest)
```

## Testing

```bash
cd apps/web
pnpm test              # Run unit tests (Vitest, 1032+ tests)
pnpm vitest run        # Run tests once (CI mode)
```

Test utilities live in `apps/web/tests/utils/` (evaluator, scenarios, result exporter).

## Documentation

- [Architecture](docs/architecture/architecture.md)
- [Loop Analysis](docs/architecture/loop-analysis.md)
- [Vision Flat-Lay](docs/architecture/vision-flat-lay-implementation.md)
- [Product Requirements](docs/prd/)
- [Development Guides](docs/guides/)
- [Test Mode](docs/guides/test-mode.md)

## 12 Leverage Points of Agentic Coding

### In Agent (Core Four)
1. Context
2. Model
3. Prompt
4. Tools

### Through Agent
5. Standard Output
6. Types
7. Docs
8. Tests
9. Architecture
10. Plans
11. Templates
12. AI Developer Workflows
