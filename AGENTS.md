# OOTDay Project Agents

This file provides guidance for Claude Code CLI when working on the OOTDay AI Fashion Assistant project.

---

## Project Overview

**OOTDay** is an AI-powered fashion assistant platform that helps users with daily outfit decisions and connects fashion inspiration directly to purchase opportunities through Central Group's e-commerce platform.

### Quick Reference

```bash
# Frontend Development
cd apps/web && pnpm dev          # Start dev server on localhost:3000

# Testing
pnpm test                        # Run Playwright E2E tests
pnpm lint                        # Run linting
```

### Project Structure

```
/
├── apps/web/                    # Next.js 14 frontend (main application)
│   ├── app/                     # Next.js app router
│   │   ├── [locale]/            # i18n routes
│   │   ├── api/                 # API routes (chat, outfits, products)
│   │   ├── onboarding/          # Onboarding flow
│   │   └── page.tsx             # Main entry
│   ├── components/              # React components
│   │   ├── chat/                # Chat interface
│   │   ├── outfit/              # Outfit display cards
│   │   ├── product/             # Product modals
│   │   ├── onboarding/          # Onboarding screens
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/                     # Business logic
│   │   ├── prompts/             # AI system prompts
│   │   ├── rag/                 # RAG pipeline
│   │   ├── services/            # API services
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript types
│   │   └── transformers/        # Data transformers
│   ├── specs/                   # Feature specifications
│   └── tests/                   # Playwright E2E tests
├── data/products/               # 3,265+ Central Group products (JSON)
├── specs/                       # 150+ feature/chore specs
├── docs/                        # Documentation
│   ├── architecture/            # System architecture
│   ├── prd/                     # Product requirements
│   └── guides/                  # Implementation guides
├── scripts/                     # Automation scripts
│   ├── image_processing/        # Image generation/processing
│   └── classification/          # ML classification
├── .claude/                     # Claude Code configuration
│   ├── skills/                  # Custom skills (orchestrator, playwright-mcp)
│   └── commands/                # Slash command templates
└── tasks/                       # Task definitions
```

### Tech Stack

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

---

## Available Agents

Use these agents by mentioning them naturally, e.g., "As dev, implement ..." or "As architect, design ...".

| Agent | Role | When To Use |
|-------|------|-------------|
| **pm** | Product Manager | Creating PRDs, product strategy, feature prioritization, roadmap planning |
| **po** | Product Owner | Backlog management, story refinement, acceptance criteria, sprint planning |
| **sm** | Scrum Master | Story creation, epic management, agile process guidance |
| **architect** | Architect | System design, architecture documents, API design, infrastructure planning |
| **ux-expert** | UX Expert | UI/UX design, wireframes, prototypes, front-end specifications |
| **dev** | Full Stack Developer | Code implementation, debugging, refactoring, best practices |
| **qa** | Test Architect | Test architecture review, quality gates, comprehensive quality assessment |
| **analyst** | Business Analyst | Market research, competitive analysis, project briefs, discovery |
| **orchestrator** | Master Orchestrator | Workflow coordination, multi-agent tasks, role switching guidance |
| **master** | Master Task Executor | One-off tasks, comprehensive expertise across domains |

---

## Agent Details

### Product Manager (pm)
- **Purpose**: Product strategy, PRD creation, roadmap planning
- **Commands**: `*help`, `*create-prd`, `*create-epic`, `*shard-prd`, `*exit`
- **Key Tasks**:
  - `create-doc` - Create PRD from template
  - `create-brownfield-prd` - Document existing projects
  - `shard-doc` - Split large PRDs into sections

### Product Owner (po)
- **Purpose**: Backlog management, story refinement, acceptance criteria
- **Commands**: `*help`, `*create-story`, `*validate-story-draft`, `*shard-doc`, `*exit`
- **Key Tasks**:
  - `validate-next-story` - Validate story before implementation
  - `shard-doc` - Split documentation into manageable sections
  - `execute-checklist` - Run validation checklists

### Scrum Master (sm)
- **Purpose**: Story creation, epic management, agile process
- **Commands**: `*help`, `*draft`, `*story-checklist`, `*correct-course`, `*exit`
- **Key Tasks**:
  - `create-next-story` - Create next story from epic
  - `brownfield-create-epic` - Create epics for brownfield projects
  - `brownfield-create-story` - Create stories for brownfield projects
  - `execute-checklist` - Run story draft checklists

### Architect (architect)
- **Purpose**: System design, architecture, API design, infrastructure
- **Commands**: `*help`, `*create-full-stack-architecture`, `*create-front-end-architecture`, `*document-project`, `*exit`
- **Key Tasks**:
  - `create-doc` - Create architecture documents
  - `document-project` - Document existing codebase
  - `shard-doc` - Split architecture docs

### UX Expert (ux-expert)
- **Purpose**: UI/UX design, wireframes, prototypes
- **Commands**: `*help`, `*create-front-end-spec`, `*generate-ui-prompt`, `*exit`
- **Key Tasks**:
  - `create-doc` - Create front-end specifications
  - `generate-ai-frontend-prompt` - Generate prompts for AI UI tools

### Full Stack Developer (dev)
- **Purpose**: Code implementation, debugging, refactoring
- **Commands**: `*help`, `*develop-story`, `*run-tests`, `*review-qa`, `*exit`
- **Key Tasks**:
  - `develop-story` - Implement a story from spec
  - `apply-qa-fixes` - Apply fixes from QA review
  - `execute-checklist` - Run DoD checklists

### Test Architect & Quality Advisor (qa)
- **Purpose**: Test architecture, quality gates, risk assessment
- **Commands**: `*help`, `*review`, `*gate`, `*test-design`, `*risk-profile`, `*exit`
- **Key Tasks**:
  - `review-story` - Comprehensive test architecture review
  - `qa-gate` - Create/update quality gate decisions
  - `test-design` - Create test scenarios
  - `trace-requirements` - Map requirements to tests
  - `risk-profile` - Generate risk assessment
  - `nfr-assess` - Validate non-functional requirements

### Business Analyst (analyst)
- **Purpose**: Market research, analysis, project briefs
- **Commands**: `*help`, `*brainstorm`, `*create-project-brief`, `*perform-market-research`, `*exit`
- **Key Tasks**:
  - `create-doc` - Create project briefs, competitor analysis, market research
  - `facilitate-brainstorming-session` - Run brainstorming sessions
  - `advanced-elicitation` - Deep requirements exploration

### Master Orchestrator (orchestrator)
- **Purpose**: Workflow coordination, multi-agent tasks
- **Commands**: `*help`, `*agent`, `*workflow`, `*status`, `*exit`

### Master Task Executor (master)
- **Purpose**: One-off tasks, comprehensive expertise
- **Commands**: `*help`, `*task`, `*create-doc`, `*execute-checklist`, `*exit`

---

## Common Workflows

### Starting a New Feature

1. **As pm**: Create PRD → `*create-prd`
2. **As architect**: Create architecture → `*create-full-stack-architecture`
3. **As sm**: Create stories → `*draft`
4. **As dev**: Implement stories → `*develop-story`
5. **As qa**: Review and gate → `*review`

### Quick Bug Fix

1. **As master**: Execute the fix directly
2. **As qa**: Quick review → `*gate {story}`

### Brownfield Documentation

1. **As architect**: Document existing project → `*document-project`
2. **As pm**: Create brownfield PRD → `*create-brownfield-prd`
3. **As sm**: Create brownfield stories → `*create-story`

---

## Project-Specific Guidelines

### Feature Specifications

- Store feature specs in `specs/` with naming convention:
  - `chore-{id}-{description}.md` - Technical chores
  - `feature-{id}-{description}.md` - New features

### Testing

- Save test results from Playwright to `test-result/`
- Use Playwright MCP skill for browser automation

### Research vs Implementation

- Research documents go in `research/`
- Implementation plans go in `specs/`

### Plan Mode

After a plan is approved, always save it to `specs/<descriptive-name>.md` before starting implementation.

### Validation

Always spin up validator to validate changes instead of using main agent to validate.

---

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

---

## Target Users

1. **Fashion-Curious & Social Users** (15-28)
2. **Fashion-Struggling Shoppers** (18-35)
3. **Mobile-First Inspiration Seekers** (20-35)
4. **Special Occasions & Professionals** (25-45)

---

*Last updated: 2026-02-12*
