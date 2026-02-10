# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OOTDay is an AI-powered fashion assistant platform that helps users with daily outfit decisions and connects fashion inspiration directly to purchase opportunities. The project combines a Next.js frontend application with a multi-agent task automation system.

## Project Structure

```
/
├── apps/                       # Application code
│   ├── web/                    # Main Next.js frontend
│   └── sentiment_classification/ # ML sentiment classifier
├── docs/                       # Documentation
│   ├── prd/                    # Product requirements
│   ├── architecture/           # Architecture docs
│   ├── guides/                 # Implementation guides
│   └── bugs/                   # Bug reports
├── scripts/                    # Automation scripts
│   └── adws/                   # AI Dev Workflows (multi-agent system)
├── data/                       # Data files
│   ├── products/               # Product JSON data
│   ├── personas/               # AI persona definitions
│   ├── catalogs/               # Product catalog CSVs
│   └── assets/                 # Images (onboarding, CJ)
├── specs/                      # Feature specifications
├── tasks/                      # Task definitions
├── archive/                    # Archived content
├── .claude/                    # Claude Code configuration
├── tasks.md                    # Central task tracking
└── README.md
```

## Key Architecture

### Frontend Application (apps/web/)
- **Framework**: Next.js 14 with TypeScript
- **UI Components**: Radix UI with shadcn/ui theming
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks and custom hooks in `lib/hooks/`
- **Component Structure**:
  - `components/chat/`: Chat interface for AI fashion recommendations
  - `components/outfit/`: Outfit cards and grid displays
  - `components/product/`: Product modal and details
  - `components/layout/`: Header and bottom navigation
  - `components/ui/`: Base UI components

### Multi-Agent Task System (scripts/adws/)
Orchestrates multiple Claude Code agents for parallel development:
- `adw_triggers/adw_trigger_cron_todone.py` - Scans tasks.md for pending work
- `adw_build_update_task.py` - Simple build and update workflow
- `adw_plan_implement_update_task.py` - Complex plan-build-update workflow

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

# Run tests
pnpm test
```

### Multi-Agent System
```bash
# Run the task automation
./scripts/adws/adw_triggers/adw_trigger_cron_todone.py

# Direct workflow execution
./scripts/adws/adw_build_update_task.py
./scripts/adws/adw_plan_implement_update_task.py
```

## Task Management

The system uses `tasks.md` to track development tasks:

```markdown
## Git Worktree feature-auth
[] Task description                           # Pending
[🟡, adw_12345] Task in progress              # In progress
[✅ abc123, adw_12345] Completed task         # Done
[❌, adw_12345] Failed task // Failed: Error  # Failed
[⏰] Blocked task                              # Blocked
```

## Core Business Context

The platform targets four main user segments:
1. Fashion-Curious & Social Users (15-28)
2. Fashion-Struggling Shoppers (18-35)
3. Mobile-First Inspiration Seekers (20-35)
4. Special Occasions & Professionals (25-45)

MVP features:
- Natural language chat for fashion recommendations
- AI-powered product matching with Central Group inventory
- Direct purchase links and conversion tracking

## Integration Points

- Central Group inventory systems for product data
- Azure cloud infrastructure for hosting
- Claude AI for fashion recommendations
- Playwright MCP for browser automation testing

## Feature Specifications

Feature specs are stored in `specs/` with the naming convention:
- `chore-{id}-{description}.md` - Technical chores
- `feature-{id}-{description}.md` - New features

## Claude Code Configuration

- `.claude/commands/` - Slash command templates
- `.claude/skills/` - Skill definitions (orchestrator, playwright-mcp)
- `.claude/agents/` - Agent configurations

## Guidelines

- Research documents go in `research/`, implementation plans in `specs/`
- **Plan mode**: After a plan is approved, always save it to `specs/<descriptive-name>.md` before starting implementation
- Save test results from Playwright screen capture to `test-result/`