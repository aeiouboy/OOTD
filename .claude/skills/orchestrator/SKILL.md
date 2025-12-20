---
name: orchestrator
description: Primary agent orchestrator that delegates requirement planning and development tasks to specialized agents and workflows. Use when receiving new feature requests, development tasks, bug fixes, chores, or any work that requires planning or implementation. Automatically routes tasks to the appropriate workflow based on complexity and task type.
---

# Orchestrator Skill

The orchestrator is the primary decision-making layer for delegating work in the ADW (AI Developer Workflow) system. It analyzes incoming requests and routes them to the appropriate specialized agents and workflows.

## Core Delegation Logic

### Task Classification

Before delegating, classify the incoming task:

| Task Type | Complexity | Delegation Target |
|-----------|------------|-------------------|
| Simple chore (config, docs, minor changes) | Low | `/chore` command |
| Feature implementation | Medium-High | `/feature` command or `adw-chore-implement` agent |
| General development task | Medium | `/plan` command or `adw-chore-implement` agent |
| Complex refactoring | High | `adw-chore-implement` agent with `{opus}` tag |
| Automation/scripting | Medium | `adw-chore-implement` agent |
| Bug fixes | Low-Medium | `/chore` command or direct implementation |

### Delegation Decision Tree

```
Incoming Request
    │
    ├─→ Is it a requirement/planning task?
    │       │
    │       ├─→ Simple chore/task? → Use /chore command
    │       ├─→ New feature? → Use /feature command
    │       └─→ General planning? → Use /plan command
    │
    └─→ Is it a development/implementation task?
            │
            ├─→ Requires automation scripting? → Delegate to adw-chore-implement agent
            ├─→ Complex multi-file changes? → Delegate to adw-chore-implement agent
            ├─→ Simple code changes? → Implement directly or use /build command
            └─→ Plan already exists in specs/? → Use /implement command
```

## How to Delegate

### 1. For Simple Tasks (Planning Only)

Use slash commands for quick planning without full implementation:

```
# For simple chores
/chore {adw_id} "Task description"

# For new features
/feature {adw_id} "Feature description"

# For general planning
/plan {adw_id} "Task description"
```

### 2. For Development Tasks (Full Workflow via Task Tool)

Delegate complex development work to the `adw-chore-implement` agent using the Task tool. The sub-agent will:
1. Analyze the requirement
2. Formulate a precise prompt
3. Execute `./adws/adw_chore_implement.py` which runs `/chore` → `/implement`

```
Task tool call:
  subagent_type: "adw-chore-implement"
  prompt: "Implement [specific task description].
           Context: [relevant context about the codebase].
           Requirements: [specific requirements].
           Target files: [list of files/directories]."
  description: "Implement [short description]"
```

**The sub-agent will automatically execute via Skill tool:**
```
1. /chore {adw_id} "formulated prompt"  → Creates plan in specs/
2. /implement specs/chore-{adw_id}-*.md → Implements the plan
```

### 3. For Implementation of Existing Plans

When a plan already exists in `specs/`:

```
/implement specs/{plan-file}.md
```

## Delegation Examples

### Example 1: User requests a new feature

**Request**: "Add user authentication with JWT tokens"

**Orchestrator Action**:
1. Classify: Feature implementation (Medium-High complexity)
2. Delegate to `adw-chore-implement` agent via Task tool
3. Sub-agent will run `./adws/adw_chore_implement.py` automatically

```
Task tool call:
  subagent_type: "adw-chore-implement"
  prompt: "Implement user authentication with JWT tokens.
           Add login/logout endpoints, JWT token generation and validation,
           middleware for protected routes, and user session management.
           Target: frontend/app/api/auth/ and frontend/lib/services/auth-service.ts"
  description: "Implement JWT authentication"
```

**Sub-agent execution via Skill tool:**
```
1. /chore {adw_id} "Implement user authentication with JWT tokens..."
2. /implement specs/chore-{adw_id}-*.md
```

### Example 2: User requests automation script

**Request**: "Create a script to clean up old build artifacts"

**Orchestrator Action**:
1. Classify: Automation task (Medium complexity)
2. Delegate to `adw-chore-implement` agent

```
Task tool call:
  subagent_type: "adw-chore-implement"
  prompt: "Create an automation script to clean up old build artifacts.
           The script should be idempotent, include error handling,
           support dry-run mode, and follow bash strict mode patterns.
           Target: adws/scripts/cleanup-artifacts.sh"
  description: "Create cleanup script"
```

### Example 3: User requests a simple chore (Planning Only)

**Request**: "Update the README with installation instructions"

**Orchestrator Action**:
1. Classify: Simple chore (Low complexity)
2. Use `/chore` command for planning only (no full implementation needed)

```
/chore {adw_id} "Update the README with installation instructions"
```

### Example 4: Complex refactoring request

**Request**: "Refactor the database layer to use repository pattern"

**Orchestrator Action**:
1. Classify: Complex refactoring (High complexity)
2. Delegate to `adw-chore-implement` agent (opus model for complex reasoning)

```
Task tool call:
  subagent_type: "adw-chore-implement"
  prompt: "Refactor the database layer to use repository pattern.
           Create repository interfaces, implement concrete repositories
           for each entity, update services to use repositories,
           add dependency injection support.
           Target: frontend/lib/repositories/ (new), frontend/lib/services/"
  description: "Refactor to repository pattern"
  model: "opus"
```

## ADW ID Generation

For tasks requiring tracking, generate an ADW ID using this pattern:
- Format: 8-character alphanumeric string
- Example: `abc12345`

## Workflow Selection Criteria

### Use `/chore` when:
- Task is straightforward maintenance
- Single file or few files affected
- No architectural decisions needed
- Documentation updates
- Configuration changes

### Use `/feature` when:
- Implementing new user-facing functionality
- Requires user story format
- Has acceptance criteria
- Needs testing strategy

### Use `/plan` when:
- Task type is ambiguous
- Moderate complexity
- Multiple approaches possible
- Needs investigation first

### Delegate to `adw-chore-implement` when:
- Task requires shell scripting or automation
- Complex multi-phase implementation
- Needs robust error handling
- Involves CI/CD or deployment scripts
- Requires parallel experimentation

## Integration Points

- **Plans are stored in**: `specs/` directory
- **Commands are defined in**: `.claude/commands/`
- **ADW scripts are in**: `adws/`
- **Application code is in**: `apps/`

## Best Practices

1. **Always classify first**: Understand the task type and complexity before delegating
2. **Provide context**: When delegating, include relevant codebase context
3. **Track progress**: Use ADW IDs for all delegated tasks
4. **Review plans**: Before implementation, ensure plans are appropriate for complexity
5. **Iterate if needed**: Break large tasks into smaller delegatable chunks

## See Also

- [WORKFLOWS.md](WORKFLOWS.md) - Detailed workflow reference
- `.claude/agents/adw-chore-implement.md` - Agent definition
- `adws/README.md` - ADW system documentation
