# Improve System Prompt for Chat System

> Researched on: 2026-02-10
> Research method: Parallel agent team (4 researchers)

## Overview

System prompts are the foundational instructions provided to an LLM before any user interaction begins. They define the AI's identity, behavior, constraints, and output expectations, acting as the "job description" for a chat system. Every production AI chat application relies on carefully engineered system prompts to bridge the gap between a model's general training and a specific application domain.

The field has evolved significantly from simple role definitions ("You are a helpful assistant") in 2022 to modular orchestration documents in 2025-2026 that define tool usage, workflow policies, instruction hierarchies, safety rules, and output contracts. The current best practice treats system prompts as code artifacts: versioned, tested, A/B tested, and maintained with structured formatting that helps models parse instructions reliably.

For a chat system like OOTDay's fashion assistant, improving the system prompt means adopting a structured, section-based architecture with explicit behavioral rules, leveraging model-specific optimization techniques (e.g., XML tags for Claude), and using evaluation tools to systematically measure and iterate on prompt quality.

## Key Concepts

### System Prompt vs User Prompt Hierarchy
System prompts (via the API's `system`/`developer` role) have higher authority and persistence than user prompts. User-typed "pseudo-system prompts" are lower priority, can be dropped during context trimming, and are more vulnerable to prompt injection. For production applications, true system prompts via the API are essential.

### Instruction Hierarchy
The priority order for conflicting instructions: **System/Developer > Tool specifications > User input > Retrieved content**. This hierarchy is critical for preventing prompt injection and maintaining consistent behavior.

### Prompt Caching
Both Anthropic and OpenAI support automatic prompt caching for repeated prefixes. Static content should be placed at the beginning of the prompt; dynamic content at the end. This architectural decision can yield significant cost and latency savings.

### Positive vs Negative Framing
Telling the model what TO DO consistently outperforms telling it what NOT to do. "Include technical details" works better than "Don't be vague." When constraints are necessary, explain WHY they exist to help the model generalize.

### Sample Efficiency
A well-crafted system prompt can be worth approximately 100 conventional data points in guiding model behavior. This makes prompt engineering one of the highest-leverage activities in building chat applications.

## Architecture / How It Works

### Recommended Section Structure

Based on both OpenAI and Anthropic documentation, the optimal system prompt architecture follows this order:

```
┌─────────────────────────────────────────┐
│ 1. INSTRUCTION HIERARCHY & SECURITY     │  ← Static (cacheable)
│    Priority order, untrusted content     │
├─────────────────────────────────────────┤
│ 2. IDENTITY & ROLE                      │  ← Static
│    Who the AI is, domain, capabilities   │
├─────────────────────────────────────────┤
│ 3. TONE & STYLE                         │  ← Static
│    Communication approach, formatting    │
├─────────────────────────────────────────┤
│ 4. INSTRUCTIONS & CONSTRAINTS           │  ← Mostly static
│    Behavioral rules, do/don't           │
├─────────────────────────────────────────┤
│ 5. TOOLS & ACTIONS (if agentic)         │  ← Static
│    Available tools, when/how to use     │
├─────────────────────────────────────────┤
│ 6. OUTPUT FORMAT                        │  ← Static
│    Response structure, sections          │
├─────────────────────────────────────────┤
│ 7. EXAMPLES (few-shot)                  │  ← Static
│    1-3 ideal input/output pairs          │
├─────────────────────────────────────────┤
│ 8. SAFETY & REFUSALS                    │  ← Static
│    What to refuse, how, escalation       │
├─────────────────────────────────────────┤
│ 9. DOMAIN-SPECIFIC RULES               │  ← Semi-dynamic
│    Business logic, brand guidelines      │
├─────────────────────────────────────────┤
│ 10. CONTEXT (dynamic)                   │  ← Dynamic (bottom)
│    User profile, preferences, RAG data   │
└─────────────────────────────────────────┘
```

**Key principle**: Identity and Instructions at the top (static, cacheable), Context at the bottom (dynamic, changes per request).

### Message Role Architecture

```typescript
const messages = [
  {
    role: "developer",  // or "system" — highest authority
    content: systemPrompt
  },
  // Conversation history
  ...conversationHistory.map(msg => ({
    role: msg.role,  // "user" or "assistant"
    content: msg.content
  })),
  // Current user input
  {
    role: "user",
    content: currentUserMessage
  }
];
```

### Dynamic System Prompt Template Pattern

```typescript
function buildSystemPrompt(context: {
  userName?: string;
  userPreferences?: object;
  currentDate: string;
  retrievedContext?: string;
  availableInventory?: string;
}) {
  return `
<role>
You are a fashion-savvy AI stylist for OOTDay, specializing in daily outfit recommendations...
</role>

<instructions>
- Recommend outfits based on the user's style preferences and occasion
- Only suggest items from the available inventory
- If uncertain, ask clarifying questions about style, occasion, or budget
- Respond conversationally with structured outfit cards for recommendations
</instructions>

<output_format>
Use structured outfit cards when presenting recommendations.
Keep responses concise unless the user asks for detailed explanations.
</output_format>

<context>
${context.userName ? `User: ${context.userName}` : ''}
${context.userPreferences ? `Preferences: ${JSON.stringify(context.userPreferences)}` : ''}
Current Date: ${context.currentDate}
</context>

<available_inventory>
${context.retrievedContext || 'No additional context available.'}
</available_inventory>
`;
}
```

### Prompt Component Architecture

| Component | Purpose | Static/Dynamic | Position |
|-----------|---------|----------------|----------|
| Identity | Sets persona, tone, goals | Static | Top (cacheable) |
| Instructions | Behavioral rules, constraints | Mostly static | Near top |
| Output constraints | Format, length, structure rules | Static | Mid-prompt |
| Examples | Few-shot demonstrations | Static | After instructions |
| User Context | User profile, preferences | Dynamic | Near bottom |
| Retrieved Context | RAG data, documents | Dynamic | Bottom |
| Conversation History | Prior messages | Dynamic | Managed separately |

## Implementation Guide

### Step 1: Define the Core Identity

Start with a clear, specific role definition. More specific roles yield better results:

```xml
<role>
You are OOTDay's AI fashion stylist — a warm, knowledgeable fashion advisor
specializing in Thai fashion trends and Central Group inventory. You help users
make confident daily outfit decisions by understanding their style preferences,
body type, occasion needs, and budget constraints.
</role>
```

### Step 2: Set Behavioral Instructions

Use positive framing and explain motivation:

```xml
<instructions>
- Recommend outfits that match the user's stated occasion, style, and budget
- Present recommendations as structured outfit cards with item details
- Ask clarifying questions when the occasion, style preference, or budget is unclear
- Include purchase links from Central Group inventory when available
- Explain styling choices briefly so users learn fashion principles
  (This helps build user confidence and increases engagement)
- When multiple outfits fit the criteria, present 2-3 options ranked by relevance
</instructions>
```

### Step 3: Define Output Format

```xml
<output_format>
Respond conversationally. When presenting outfit recommendations, use this structure:

**Outfit Name** — Brief description
- Top: [Item name] — [Price] — [Link]
- Bottom: [Item name] — [Price] — [Link]
- Shoes: [Item name] — [Price] — [Link]
- Accessories (optional): [Item name] — [Price]
Styling tip: [One sentence on how to wear it]
</output_format>
```

### Step 4: Add Few-Shot Examples (with variation)

```xml
<examples>
<example>
<user>I need something for a casual Friday at the office</user>
<assistant>Here's a smart-casual look that works for office Fridays:

**Relaxed Professional** — Polished but comfortable
- Top: Linen blend button-down shirt (Light blue) — ฿1,290
- Bottom: Tapered chinos (Navy) — ฿1,590
- Shoes: White leather sneakers — ฿2,490
Styling tip: Roll the sleeves to mid-forearm for a relaxed vibe.

Want me to suggest alternatives, or adjust for a different budget?</assistant>
</example>
</examples>
```

### Step 5: Set Safety and Refusal Rules

```xml
<safety>
- If asked about topics outside fashion and style, briefly redirect to fashion
- If a product isn't available, say so honestly and suggest alternatives
- Never fabricate product details, prices, or availability
- If unsure about a recommendation, acknowledge uncertainty
- Keep refusals to 1-2 sentences with a helpful redirect
</safety>
```

### Step 6: Inject Dynamic Context

```xml
<context>
User: {{userName}}
Style Profile: {{userStyleProfile}}
Current Date: {{currentDate}}
Weather: {{localWeather}}
</context>

<available_inventory>
{{retrievedProducts}}
</available_inventory>
```

### Step 7: Optimize Token Usage

Apply prompt compression techniques (40-65% token savings possible):

| Before | After | Savings |
|--------|-------|---------|
| "Could you please provide the user with..." | "Provide..." | ~60% |
| "Make sure to always include..." | "Include..." | ~50% |
| "It is very important that you never..." | "Never..." | ~65% |
| 5 full examples | 2 examples + pattern description | ~40% |

## Best Practices

### Do's

1. **Be explicit and specific** — Define format, scope, tone, length, and audience
2. **Use positive framing** — "Include technical details" over "Don't be vague"
3. **Provide context/motivation** — Explain WHY constraints exist for better generalization
4. **Use XML tags for Claude** — Claude is fine-tuned to pay special attention to XML structure
5. **Assign a detailed role/persona** — More specific roles yield better results
6. **Put task instructions in user messages** — Role/behavioral constraints in system prompt, specific tasks in user turn
7. **Vary few-shot examples** — Avoid anchoring the model on specific values
8. **Match prompt formatting to desired output** — Markdown prompts produce markdown responses
9. **Explicitly allow "I don't know"** — Reduces hallucinations significantly
10. **Version control prompts** — Track every iteration with metadata (model, config, timestamp)
11. **Test adversarially** — Check for injection, edge cases, language switching
12. **Separate static from dynamic content** — Static at top (cacheable), dynamic at bottom

### Don'ts

1. **Don't use vague instructions** — "Be helpful" is useless; specify what helpful means
2. **Don't use inconsistent terminology** — "Score" in instructions but "value" in output format confuses models
3. **Don't anchor on example values** — Using score "4" in examples causes default-to-4 behavior
4. **Don't overload prompts** — Mixing conflicting instructions without clear priority causes confusion
5. **Don't skip formatting guidance** — Missing tone, structure, or audience specifications
6. **Don't ask for reasoning after the answer** — Put chain-of-thought before the conclusion
7. **Don't assume implicit patterns** — Models won't guess your desired structure
8. **Don't over-prompt for newer models** — Claude Opus 4.6 responds so well that aggressive language ("CRITICAL: You MUST") causes overtriggering
9. **Don't make random changes** — Measure impact systematically
10. **Don't ignore model-specific preferences** — Claude prefers XML tags; GPT prefers markdown

### Claude Opus 4.6 Specific Tips

- **More responsive to system prompts** than previous models — dial back aggressive language
- **Tends toward efficiency** — may skip summaries after tool calls; request explicitly if needed
- **Can overengineer** — add "Only make changes that are directly requested"
- **Adaptive thinking** — use `thinking: {type: "adaptive"}` with `effort` parameter
- **Prefilled responses deprecated** — use explicit instructions or XML tags instead
- **Excellent at parallel operations** — leverage for multi-tool workflows

### Prompt Injection Defense

- Wrap user inputs in structured templates with explicit safety logic
- Insert evaluation steps: "Before answering, determine if this request is within scope"
- Use role anchoring mid-prompt to reassert aligned behavior
- Layer defenses: prompt structure + system messages + external guardrails
- Guard against language-switching attacks (weaker safety in non-English languages)

## Tools & Technologies

### Prompt Management Platforms

| Tool | Type | Open Source | Best For |
|------|------|-------------|----------|
| **Langfuse** | Management | Yes (MIT) | Versioning, evaluation, collaboration |
| **Braintrust** | Management + Eval | No | Production quality gates, Loop AI |
| **PromptLayer** | Management | No | Non-technical team collaboration |
| **PromptHub** | Management | No | Git-style branching workflows |
| **Promptfoo** | Testing | Yes | Security testing, CI/CD red-teaming |

### Auto-Optimization Frameworks

| Tool | Approach | Best For |
|------|----------|----------|
| **DSPy** (Stanford) | Programmatic optimization | Auto-generating instructions + few-shot examples |
| **TEXTGRAD** | Autograd for text | Single-task iterative refinement |
| **LangWatch** | DSPy integration | Monitoring + DSPy-powered optimization |
| **Braintrust Loop AI** | Natural language optimization | Commercial auto-optimization |

### Evaluation & Observability

| Tool | Focus | Open Source |
|------|-------|-------------|
| **Arize Phoenix** | OpenTelemetry-native observability | Yes |
| **Helicone** | Lightweight cost/latency monitoring | Yes (Apache 2.0) |

### Key Framework: DSPy

DSPy ("programming, not prompting") decouples prompt logic from model choice. Key optimizers:

- **MIPROv2**: Generates instructions AND few-shot examples using Bayesian Optimization — best for pipeline-level optimization
- **SIMBA**: Finds hard examples, then LLM introspects on failures to generate improvement rules
- **BootstrapFewShot**: Auto-generates few-shot examples from ~10 labeled examples

```python
from dspy.teleprompt import BootstrapFewShotWithRandomSearch

config = dict(max_bootstrapped_demos=4, max_labeled_demos=4,
              num_candidate_programs=10, num_threads=4)
teleprompter = BootstrapFewShotWithRandomSearch(metric=YOUR_METRIC, **config)
optimized_program = teleprompter.compile(YOUR_PROGRAM, trainset=YOUR_TRAINSET)
```

## Comparison & Trade-offs

### Manual vs Automated Prompt Optimization

| Aspect | Manual Engineering | Auto-Optimization (DSPy) |
|--------|-------------------|--------------------------|
| **Speed** | Hours to days | Minutes to hours |
| **Quality ceiling** | Limited by engineer skill | Can exceed human performance |
| **Interpretability** | High — you wrote it | Medium — generated prompts can be opaque |
| **Cost** | Engineer time | API costs (cents to dollars per run) |
| **Iteration** | Slow, subjective | Fast, metric-driven |
| **Best for** | Initial design, safety rules | Few-shot selection, instruction tuning |

### Structured Formatting Approaches

| Approach | Best For | Model Preference |
|----------|----------|------------------|
| **XML tags** | Claude models | Claude excels with "contract-style" tags |
| **Markdown headers** | GPT models | GPT does best with explicit markdown |
| **JSON schemas** | Structured outputs | Both models handle well |
| **Hierarchical nesting** | Gemini models | Gemini prefers hierarchical formatting |

### Prompt Length Trade-offs

| Short Prompts | Long Prompts |
|---------------|--------------|
| Fewer tokens, lower cost | More tokens, higher cost |
| Faster inference | Slower inference |
| More ambiguous behavior | More predictable behavior |
| Harder to debug | Easier to debug |
| Risk of undertriggering | Risk of overtriggering |

### Versioning Approach

| Approach | Pros | Cons |
|----------|------|------|
| **In-code** | Simple, version controlled with app | Non-engineers can't edit, requires deploy |
| **Langfuse/PromptHub** | Decoupled, team collaboration, A/B testing | Additional dependency, latency |
| **Config files** | Decoupled from code, engineer-friendly | No UI, no evaluation built-in |

## Relevance to OOTD Project

### Direct Recommendations for OOTDay's Fashion Chat System

**1. Restructure the System Prompt Architecture**
The OOTDay chat system (in `apps/web/components/chat/`) should adopt the structured section architecture described above. Use XML tags for Claude, with:
- Role: Fashion-savvy AI stylist specializing in Central Group inventory
- Instructions: Recommendation logic, product matching rules, conversation style
- Output format: Structured outfit cards with purchase links
- Safety: Product accuracy constraints, scope boundaries
- Dynamic context: User preferences, weather, occasion, retrieved inventory

**2. Leverage Claude Opus 4.6 Features**
Since the project uses Claude AI for recommendations:
- Use XML-tagged sections in the system prompt
- Dial back aggressive instruction language (CRITICAL, MUST) to natural phrasing
- Enable adaptive thinking for complex style reasoning
- Leverage parallel tool calling for simultaneous product searches

**3. Implement Dynamic Prompt Assembly**
In `apps/web/lib/services/`, build a prompt builder function that:
- Maintains a static core prompt (identity, instructions, format) for cache efficiency
- Dynamically injects user context (style profile, occasion, budget)
- Appends retrieved Central Group inventory data at the bottom
- Includes weather/season context for weather-appropriate recommendations

**4. Add Prompt Versioning**
Consider integrating **Langfuse** (open-source, MIT) for:
- Versioning system prompt iterations
- A/B testing different prompt strategies
- Evaluating recommendation quality with LLM-as-a-Judge
- This integrates well with the existing Next.js + TypeScript stack

**5. Optimize for Conversion**
The system prompt should explicitly guide the AI toward:
- Including purchase links from Central Group inventory
- Presenting price-value justifications
- Creating urgency when inventory is limited
- Tracking which recommendations lead to purchases (for prompt evaluation)

**6. Test with Playwright MCP**
Use the existing Playwright MCP integration to:
- Automate testing of chat interactions with various prompts
- Capture screenshots of outfit recommendations for visual quality checks
- Test edge cases (empty inventory, out-of-budget requests, off-topic queries)
- Save results to `test-result/` as per project guidelines

**7. Consider DSPy for Future Optimization**
Once you have a labeled dataset of good/bad outfit conversations:
- Use DSPy's MIPROv2 to auto-optimize the system prompt
- Generate optimal few-shot examples from successful interactions
- This can systematically improve recommendation quality beyond manual tuning

### Implementation Priority
1. **Immediate**: Restructure existing system prompt with XML-tagged sections
2. **Short-term**: Build dynamic prompt assembly in `lib/services/`
3. **Medium-term**: Add Langfuse for prompt versioning and evaluation
4. **Long-term**: Implement DSPy auto-optimization with conversation quality metrics

## Sources

### Overview & Fundamentals
- [System Prompts in Large Language Models - Prompt Engineering Institute](https://promptengineering.org/system-prompts-in-large-language-models/) - Comprehensive guide on system prompts
- [Guide to Writing System Prompts - Sahara AI](https://saharaai.com/blog/writing-ai-system-prompts) - 2025 guide analyzing Claude's system prompt
- [Prompt Engineering for Chatbot - Voiceflow](https://www.voiceflow.com/blog/prompt-engineering) - Chatbot-specific prompt engineering
- [Claude Prompt Engineering Best Practices 2026 - Prompt Builder](https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026) - Claude-specific techniques
- [The Ultimate Guide to Prompt Engineering 2026 - Lakera](https://www.lakera.ai/blog/prompt-engineering-guide) - Broad guide with safety focus
- [Prompt Engineering - OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) - Official OpenAI documentation
- [System Prompt vs User Prompt - PromptLayer](https://blog.promptlayer.com/system-prompt-vs-user-prompt-a-comprehensive-guide-for-ai-prompts/) - System vs user prompt comparison
- [System Messages vs User Messages - PromptHub](https://www.prompthub.us/blog/the-difference-between-system-messages-and-user-messages-in-prompt-engineering) - Hierarchy and persistence differences

### Implementation & Architecture
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering) - Official docs on message roles, formatting, caching
- [Lakera Ultimate Guide to Prompt Engineering 2026](https://www.lakera.ai/blog/prompt-engineering-guide) - Techniques including CoT, compression, scaffolding
- [Anthropic Claude 4 Best Practices](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices) - Claude-specific prompting
- [10-Step System Prompt Structure Guide - AI Maker](https://aimaker.substack.com/p/the-10-step-system-prompt-structure-guide-anthropic-claude) - Structured prompt approach
- [LLM Prompt Best Practices 2025 - FutureAGI](https://futureagi.com/blogs/llm-prompts-best-practices-2025) - CO-STAR framework
- [Mastering LLM Prompts - Codesmith](https://www.codesmith.io/blog/mastering-llm-prompts) - Template architecture
- [Anthropic System Prompts Release Notes](https://docs.anthropic.com/en/release-notes/system-prompts) - Anthropic's own patterns

### Best Practices & Patterns
- [Prompting Best Practices - Anthropic/Claude Official Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) - Official Claude Opus 4.6 guidance
- [System Prompts with Claude - Anthropic Official Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts) - Role prompting guidance
- [Prompt Engineering Best Practices - DigitalOcean](https://www.digitalocean.com/resources/articles/prompt-engineering-best-practices) - Practical techniques
- [Prompt Engineering Best Practices with Evaluation - Supercharge](https://supercharge.io/us/blog/ai-prompt-engineering-best-practices) - Evaluation frameworks
- [System Prompts vs User Prompts - Medium](https://medium.com/@frenzur007/system-prompts-vs-user-prompts-the-missing-manual-for-controlling-llms-53034f0c75ac) - Design patterns
- [Use XML Tags to Structure Prompts - Anthropic Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags) - XML structuring guidance

### Tools, Frameworks & Comparisons
- [7 Best Prompt Management Tools in 2026 - Braintrust](https://www.braintrust.dev/articles/best-prompt-management-tools-2026) - Tool comparison
- [8 Top Prompt Testing and Optimization Tools - Arize AI](https://arize.com/blog/8-top-prompt-testing-and-optimization-tools-for-llms-and-multiagent-systems-2025/) - Testing tools
- [4 Best Prompt Management Systems - Mirascope](https://mirascope.com/blog/prompt-management-system) - Management platforms
- [Prompt Management Systems Compared - Nearform](https://nearform.com/digital-community/prompt-management-systems-compared/) - Nearform analysis
- [DSPy Optimizers Documentation](https://dspy.ai/learn/optimization/optimizers/) - DSPy optimization
- [Systematic LLM Prompt Engineering Using DSPy - Towards Data Science](https://towardsdatascience.com/systematic-llm-prompt-engineering-using-dspy-optimization/) - DSPy guide
- [Beyond Prompt Engineering: TEXTGRAD and DSPy - Medium](https://medium.com/@adnanmasood/beyond-prompt-engineering-how-llm-optimization-frameworks-like-textgrad-and-dspy-are-building-the-6790d3bf0b34) - Framework comparison
- [Top 5 Prompt Management Platforms 2025 - Maxim](https://www.getmaxim.ai/articles/top-5-prompt-management-platforms-in-2025-a-comprehensive-guide-for-ai-teams/) - Platform guide
- [Top 5 AI Prompt Management Tools 2025 - Arize](https://arize.com/blog/top-5-ai-prompt-management-tools-of-2025/) - Tool comparison
- [LangWatch: Open-Source LLM Monitoring - Bright Coding](https://www.blog.brightcoding.dev/2025/08/23/langwatch-the-open-source-llm-monitoring-evaluation-optimization-toolkit/) - LangWatch overview
