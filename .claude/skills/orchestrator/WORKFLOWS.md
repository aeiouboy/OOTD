# Orchestrator Workflow Reference

This document provides detailed reference for all workflows available to the orchestrator.

## Available Slash Commands

### `/chore` - Simple Task Planning
**Location**: `.claude/commands/chore.md`

Creates simple, focused plans for maintenance tasks.

**Arguments**:
- `$1` - ADW ID (e.g., `abc12345`)
- `$2` - Chore description

**Output**: Plan file at `specs/chore-{adw_id}-{name}.md`

**Best for**:
- Configuration updates
- Documentation changes
- Minor refactors
- Bug fixes with known solutions

---

### `/feature` - Feature Planning
**Location**: `.claude/commands/feature.md`

Creates comprehensive feature plans with user stories and testing strategy.

**Arguments**:
- `$1` - ADW ID
- `$2` - Feature description

**Output**: Plan file at `specs/feature-{adw_id}-{name}.md`

**Best for**:
- New user-facing functionality
- Features requiring acceptance criteria
- Work needing design consideration

---

### `/plan` - General Planning
**Location**: `.claude/commands/plan.md`

Creates adaptive plans that scale based on task complexity.

**Arguments**:
- `$1` - ADW ID
- `$2` - Task description

**Output**: Plan file at `specs/plan-{adw_id}-{name}.md`

**Best for**:
- Tasks with unclear complexity
- Mixed feature/chore work
- Investigation-first tasks

---

### `/implement` - Plan Implementation
**Location**: `.claude/commands/implement.md`

Executes an existing plan from the specs directory.

**Arguments**:
- `$1` - Path to plan file (e.g., `specs/feature-abc123-auth.md`)

**Best for**:
- Executing pre-approved plans
- Step-by-step implementation following specs

---

### `/build` - Quick Implementation
**Location**: `.claude/commands/build.md`

Direct implementation without formal planning.

**Arguments**:
- `$1` - ADW ID
- `$2` - Task description

**Best for**:
- Very simple tasks
- Tasks with obvious implementation
- Quick prototyping

---

## Agent Delegation

### `adw-chore-implement` Agent

**Invoke via**: Task tool with `subagent_type: "adw-chore-implement"`

**Capabilities**:
- Shell scripting (bash/zsh)
- Automation development
- CI/CD pipeline integration
- Build artifact management
- Database migrations
- File operations
- Scheduled task creation

**Agent Characteristics**:
- Uses opus model for complex reasoning
- Follows strict bash mode (`set -euo pipefail`)
- Includes comprehensive error handling
- Creates idempotent scripts
- Supports dry-run modes

**Prompt Template**:
```
Implement [task description].

Context:
- [Relevant codebase context]
- [Existing patterns to follow]

Requirements:
- [Specific requirement 1]
- [Specific requirement 2]

Output:
- [Expected deliverables]
```

---

## Task Routing Matrix

| User Request Pattern | Route To | Complexity |
|---------------------|----------|------------|
| "Add X to Y" (simple) | /chore | Low |
| "Create a new feature for..." | /feature | Medium-High |
| "Implement X" (with plan) | /implement | Varies |
| "Automate X" | adw-chore-implement | Medium |
| "Create a script for..." | adw-chore-implement | Medium |
| "Refactor X to use Y" | /plan → /implement | High |
| "Fix bug in X" | /chore or direct | Low-Medium |
| "Update documentation for..." | /chore | Low |
| "Set up CI/CD for..." | adw-chore-implement | High |

---

## Workflow Pipelines

### Simple Task Pipeline
```
Request → /chore → specs/chore-*.md → /implement → Done
```

### Feature Pipeline
```
Request → /feature → specs/feature-*.md → /implement → Done
```

### Automation Pipeline
```
Request → Task(adw-chore-implement) → Script in adws/ → Done
```

### Complex Refactoring Pipeline
```
Request → /plan → Review → /implement → Validate → Done
```

### Multi-Experiment Pipeline (Data Science)
```
Request → Update tasks.md → adw_trigger_cron_todone.py →
  ├→ Worktree A: Experiment 1
  ├→ Worktree B: Experiment 2
  └→ Worktree C: Experiment 3
```

---

## ADW Python Scripts Reference

### Direct Execution Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `adw_prompt.py` | Execute direct prompts | `./adws/adw_prompt.py "prompt"` |
| `adw_slash_command.py` | Execute slash commands | `./adws/adw_slash_command.py /command args` |
| `adw_chore_implement.py` | Two-phase chore+implement | `./adws/adw_chore_implement.py "task"` |

### Workflow Scripts

| Script | Purpose | Phases |
|--------|---------|--------|
| `adw_build_update_task.py` | Simple task workflow | build → update |
| `adw_plan_implement_update_task.py` | Complex task workflow | plan → implement → update |

### Orchestration Scripts

| Script | Purpose |
|--------|---------|
| `adw_triggers/adw_trigger_cron_todone.py` | Multi-agent orchestrator |

---

## Task Tags for tasks.md

When adding tasks to `tasks.md`, use these tags:

| Tag | Effect |
|-----|--------|
| `{opus}` | Use opus model for complex reasoning |
| `{adw_plan_implement}` | Use plan→implement workflow |
| `[⏰]` | Task is blocked/waiting |

Example:
```markdown
## Git Worktree feature-auth
[] Add basic JWT authentication                    # Simple, uses build workflow
[] Implement refresh token logic {opus}            # Complex, uses opus model
[⏰] Add rate limiting {adw_plan_implement}        # Blocked, uses plan workflow
```

---

## Error Handling

When delegation fails:

1. **Command not found**: Check `.claude/commands/` for available commands
2. **Agent timeout**: Increase timeout or break task into smaller pieces
3. **Plan validation failed**: Review plan format in specs/
4. **Implementation blocked**: Check for dependencies or missing context

---

## Monitoring and Debugging

### ADW Output Structure
```
agents/
  {adw_id}/
    {agent_name}/
      cc_raw_output.jsonl    # Raw streaming output
      cc_raw_output.json     # Parsed JSON array
      cc_final_object.json   # Final result
      custom_summary_output.json  # Summary
```

### Status Panels
All workflows use timestamped panels:
```
┌─[14:23:45] | abc123 | feature-auth | build─────────────────┐
│ Status message here                                         │
└─────────────────────────────────────────────────────────────┘
```
