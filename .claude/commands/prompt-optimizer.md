# Prompt Optimizer

Analyze and optimize a given prompt using prompt engineering best practices. Returns an improved version with clear reasoning for each enhancement.

## Variables
prompt: $1

## Instructions

- If `prompt` is not provided, stop and ask the user to provide a prompt to optimize.
- IMPORTANT: Use your reasoning model to deeply analyze the prompt before optimizing.
- Follow the optimization pipeline below **in order**.

---

### Step 1: Analyze the Original Prompt

Evaluate the input prompt against these dimensions (score each 1-5):

| Dimension | What to Check |
|-----------|--------------|
| **Clarity** | Is the intent unambiguous? Are terms well-defined? |
| **Specificity** | Does it include enough context and constraints? |
| **Structure** | Is it well-organized with clear sections? |
| **Role/Persona** | Does it establish who the AI should be? |
| **Output Format** | Does it specify the desired response format? |
| **Examples** | Does it include few-shot examples if beneficial? |
| **Constraints** | Are boundaries and limitations clearly stated? |
| **Task Decomposition** | Are complex tasks broken into steps? |

Output a brief diagnostic table showing each score and what's missing.

---

### Step 2: Apply Optimization Techniques

Apply these prompt engineering techniques as appropriate:

1. **Role Priming** - Add a clear system role if missing (e.g., "You are an expert...")
2. **Task Framing** - Rewrite the core ask with explicit action verbs and scope
3. **Context Injection** - Add relevant background context the model needs
4. **Output Specification** - Define format, length, structure of expected output
5. **Constraint Boundaries** - Add what to include AND what to avoid
6. **Chain-of-Thought** - Add reasoning instructions for complex tasks ("Think step by step...")
7. **Few-Shot Examples** - Add 1-2 input/output examples if the task pattern is ambiguous
8. **Guardrails** - Add quality checks, edge case handling, or validation steps

Only apply techniques that meaningfully improve the prompt. Do not over-engineer simple prompts.

---

### Step 3: Output the Results

Present the results using the format below. Output directly to the conversation (do NOT save to a file).

---

## Output Format

```
## Prompt Analysis

### Original Prompt
> {original prompt}

### Diagnostic Scores
| Dimension | Score (1-5) | Issue |
|-----------|-------------|-------|
| ... | ... | ... |

**Overall Score**: {average}/5
**Key Weaknesses**: {1-2 sentence summary of main issues}

---

## Optimized Prompt

{the rewritten, optimized prompt - ready to copy/paste}

---

## Changes Made

{Bullet list explaining each specific change and WHY it improves the prompt}

- **[Technique Applied]**: What was changed and why
- ...

---

## Usage Tips

{1-3 optional tips for getting even better results with this prompt, such as variable substitution, temperature settings, or iteration suggestions}
```

---

## Guidelines

- Keep the optimized prompt concise - longer is not always better
- Preserve the user's original intent exactly; optimize the delivery, not the goal
- For simple prompts (1-2 sentences), a light touch is best - don't bloat them
- For complex prompts, restructure into clear sections with headers or numbered steps
- If the original prompt is already well-crafted, say so and suggest only minor tweaks
- Write the optimized prompt so it works with Claude, GPT, or any modern LLM
- IMPORTANT: The optimized prompt should be in the **same language** as the original prompt
