# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OOTDay is an AI-powered fashion assistant platform that helps users with daily outfit decisions and connects fashion inspiration directly to purchase opportunities. The project includes a Next.js frontend application and uses the BMAD-METHOD agent framework for development workflows.

## Key Architecture

### Frontend Application (v0-ootd-ay-ai-fashion-assistant/)
- **Framework**: Next.js 14 with TypeScript
- **UI Components**: Radix UI components with shadcn/ui theming
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks and custom hooks in `lib/hooks/`
- **Component Structure**:
  - `components/chat/`: Chat interface for AI fashion recommendations
  - `components/outfit/`: Outfit cards and grid displays
  - `components/product/`: Product modal and details
  - `components/layout/`: Header and bottom navigation
  - `components/ui/`: Base UI components (button, card, dialog, etc.)

### BMAD-METHOD Agent System
The project uses BMAD agents for specialized development tasks. Activate agents with "As [agent-id], ..." pattern:
- **dev**: Full stack development tasks
- **architect**: System design and architecture
- **ux-expert**: UI/UX design and prototypes
- **pm**: Product management and PRDs
- **po**: Product ownership and backlog
- **qa**: Testing and quality assurance
- **sm**: Scrum and agile processes
- **analyst**: Business analysis and research

## Development Commands

### Next.js Application (in v0-ootd-ay-ai-fashion-assistant/)
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build production
pnpm build

# Run linting
pnpm lint

# Start production server
pnpm start
```

### BMAD Agent Management (project root)
```bash
# List all available agents
npm run bmad:list

# Refresh BMAD agents and regenerate AGENTS.md
npm run bmad:refresh

# Validate BMAD configuration
npm run bmad:validate
```

## Core Business Context

The platform targets four main user segments:
1. Fashion-Curious & Social Users (15-28)
2. Fashion-Struggling Shoppers (18-35)
3. Mobile-First Inspiration Seekers (20-35)
4. Special Occasions & Professionals (25-45)

MVP features include:
- Chat & Search with natural language processing
- AI-powered product matching with Central Group inventory
- Direct purchase links and conversion tracking

## Project Structure Notes

- Main application code is in `v0-ootd-ay-ai-fashion-assistant/`
- BMAD agent configurations are in `.bmad-core/`
- Product requirements and specifications are in `OOTDay PRD.MD`
- Generated outputs and prompts are in `Output/`

## Integration Points

The platform is designed to integrate with:
- Central Group inventory systems for product data
- Azure cloud infrastructure for hosting
- Claude AI for fashion recommendations
- Various AI tools (n8n, langflow, Kling AI) for enhanced features

## AI Dev Tasks - Structured Feature Development

This project uses the AI Dev Tasks workflow for systematic feature development with AI assistance. Use these files when I request structured feature development using PRDs:

- `/ai-dev-tasks/create-prd.md` - Generate a Product Requirements Document
- `/ai-dev-tasks/generate-tasks.md` - Break PRDs into detailed implementation tasks
- `/ai-dev-tasks/process-task-list.md` - Manage task progression and completion

### Workflow Overview

1. **Create PRD**: Use `create-prd.md` to generate a detailed Product Requirement Document
   - PRDs are saved in `/tasks/` as `[n]-prd-[feature-name].md`
   - Includes clarifying questions to ensure requirements are well understood

2. **Generate Tasks**: Use `generate-tasks.md` to break the PRD into actionable tasks
   - Task lists are saved in `/tasks/` as `tasks-[prd-file-name].md`
   - Includes parent tasks and detailed sub-tasks for implementation

3. **Process Tasks**: Use `process-task-list.md` for step-by-step implementation
   - Work on one sub-task at a time
   - Mark tasks complete as you progress
   - Commit after completing all sub-tasks for a parent task
   - Use conventional commit format with descriptive messages

For more details, see the README in the `/ai-dev-tasks/` directory or use the custom slash commands: `/create-prd`, `/generate-tasks`, `/process-task-list`