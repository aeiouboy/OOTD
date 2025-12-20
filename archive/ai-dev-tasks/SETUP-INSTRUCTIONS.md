# AI Dev Tasks Setup Instructions

## Overview

The AI Dev Tasks system has been set up in your OOTDay project. This system provides a structured workflow for feature development with AI assistance.

## What Has Been Set Up

1. **ai-dev-tasks directory**: Contains the core workflow files
   - `create-prd.md` - Generate Product Requirements Documents
   - `generate-tasks.md` - Break PRDs into implementation tasks
   - `process-task-list.md` - Manage task progression and completion

2. **tasks directory**: Where PRDs and task lists will be stored
   - PRDs are saved as: `[n]-prd-[feature-name].md`
   - Task lists are saved as: `tasks-[prd-file-name].md`

3. **CLAUDE.md updated**: Added documentation about the AI Dev Tasks workflow

## Manual Step Required: Custom Slash Commands

The `.claude/commands/` directory is owned by root, so you need to manually create these files:

### 1. Create `/Users/naruechon/Documents/Project/OOTDay/.claude/commands/create-prd.md`

```markdown
Please use the structured workflow in /ai-dev-tasks/create-prd.md to help me create a PRD for a new feature.
```

### 2. Create `/Users/naruechon/Documents/Project/OOTDay/.claude/commands/generate-tasks.md`

```markdown
Please generate tasks from the PRD using /ai-dev-tasks/generate-tasks.md

If not explicitly told which PRD to use, generate a list of PRDs and ask the user to select one under `/tasks` or create a new one using `create-prd.md`:
- assume it's stored under `/tasks` and has a filename starting with `[n]-prd-` (e.g., `0001-prd-[name].md`)
- it should not already have a corresponding task list in `/tasks` (e.g., `tasks-0001-prd-[name].md`)
- **always** ask the user to confirm the PRD file name before proceeding

Make sure to provide options in number lists so I can respond easily (if multiple options).
```

### 3. Create `/Users/naruechon/Documents/Project/OOTDay/.claude/commands/process-task-list.md`

```markdown
Please process the task list using /ai-dev-tasks/process-task-list.md

If not explicitly told which task list to use, generate a list of task lists in the `/tasks` directory and ask the user to select one:
- assume it's stored under `/tasks` and has a filename starting with `tasks-` (e.g., `tasks-0001-prd-[name].md`)
- **always** ask the user to confirm the task list file name before proceeding

Make sure to provide options in number lists so I can respond easily (if multiple options).
```

### Alternative: Fix Ownership

You can also fix the ownership of the commands directory:

```bash
sudo chown -R naruechon:staff /Users/naruechon/Documents/Project/OOTDay/.claude/commands/
```

Then copy the files from `/tmp/`:

```bash
cp /tmp/create-prd.md /Users/naruechon/Documents/Project/OOTDay/.claude/commands/
cp /tmp/generate-tasks.md /Users/naruechon/Documents/Project/OOTDay/.claude/commands/
cp /tmp/process-task-list.md /Users/naruechon/Documents/Project/OOTDay/.claude/commands/
```

## How to Use

After setting up the slash commands and restarting Claude Code (`/exit`):

### Option 1: Using Slash Commands (Easiest)

1. Type `/create-prd` to start creating a new feature PRD
2. Type `/generate-tasks` to generate a task list from a PRD
3. Type `/process-task-list` to start implementing tasks

### Option 2: Direct File Reference

You can also reference the files directly:

```
Use /ai-dev-tasks/create-prd.md
Here's the feature I want to build: [Your feature description]
```

```
Take /tasks/0001-prd-my-feature.md and create tasks using /ai-dev-tasks/generate-tasks.md
```

```
Start on task 1.1 and use /ai-dev-tasks/process-task-list.md
```

## Workflow Example

1. **Create a PRD**:
   ```
   /create-prd
   Feature: Add user profile editing functionality
   ```

2. **Generate Tasks**:
   ```
   /generate-tasks
   (Select the PRD you just created)
   ```

3. **Process Tasks**:
   ```
   /process-task-list
   (Select the task list to work on)
   ```

4. **Implement Step-by-Step**:
   - AI will work on one sub-task at a time
   - Review the changes
   - Reply "yes" or "y" to approve and move to next task
   - Provide feedback if changes are needed

## Benefits

- **Structured Development**: Clear process from idea to code
- **Step-by-Step Verification**: Review and approve each change
- **Manages Complexity**: Breaks large features into manageable tasks
- **Improved Reliability**: More dependable AI-generated code
- **Clear Progress Tracking**: Visual representation of completed tasks

## Reference

For more details about the AI Dev Tasks methodology, see:
- Repository: https://github.com/snarktank/ai-dev-tasks
- README: `/ai-dev-tasks/README.md` (copied from the repository)
