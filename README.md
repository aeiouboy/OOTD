# OOTDay - AI Fashion Assistant

An AI-powered fashion assistant platform that helps users with daily outfit decisions and connects fashion inspiration directly to purchase opportunities.

## Overview

OOTDay combines:
- **AI Chat Interface**: Natural language fashion recommendations powered by Claude AI
- **Product Matching**: Integration with Central Group inventory for direct purchases
- **Multi-Agent Development**: Automated task processing with parallel Claude Code agents

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
cp .env.sample .env
# Add your API keys:
# - ANTHROPIC_API_KEY for Claude AI
# - Other integrations as needed
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
│   └── adws/                   # AI Dev Workflows (automation)
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

## Multi-Agent Task System

The repository includes an automated multi-agent system for development tasks:

### Task Format (tasks.md)

```markdown
## Git Worktree feature-name
[] Pending task
[🟡, adw_12345] In progress
[✅ abc123, adw_12345] Completed
[❌, adw_12345] Failed // reason
[⏰] Blocked (waiting for dependencies)
```

### Running the Automation

```bash
# Trigger task processing
./scripts/adws/adw_triggers/adw_trigger_cron_todone.py

# Individual workflows
./scripts/adws/adw_build_update_task.py
./scripts/adws/adw_plan_implement_update_task.py
```

## Tech Stack

### Frontend (apps/web/)
- **Framework**: Next.js 14 with TypeScript
- **UI**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Testing**: Playwright for E2E tests

### Development Tools
- **AI Assistant**: Claude Code with custom skills
- **Browser Automation**: Playwright MCP
- **Task Orchestration**: Python-based ADW system

## Development Commands

```bash
# Frontend
cd apps/web
pnpm dev          # Development server
pnpm build        # Production build
pnpm lint         # Run linting
pnpm test         # Run tests

# Multi-agent automation
./scripts/adws/adw_triggers/adw_trigger_cron_todone.py
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
