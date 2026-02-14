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
│   ├── web/                    # Next.js frontend application
│   └── sentiment_classification/ # ML sentiment classifier
├── docs/
│   ├── prd/                    # Product requirements
│   ├── architecture/           # System architecture
│   └── guides/                 # Development guides
├── scripts/
│   ├── classification/         # Product scraping & occasion classification
│   ├── image_processing/       # Image processing utilities
│   └── migration/              # Database migration scripts
├── data/
│   ├── products/               # Product data (JSON)
│   ├── personas/               # AI persona definitions
│   ├── catalogs/               # Product catalogs (CSV)
│   └── assets/                 # Images and media
├── specs/                      # Feature specifications
├── tasks/                      # Task definitions
├── archive/                    # Archived content
├── .claude/                    # Claude Code configuration
└── tasks.md                    # Central task tracking
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

## Documentation

- [Architecture](docs/architecture/architecture.md)
- [Product Requirements](docs/prd/)
- [Development Guides](docs/guides/)

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
