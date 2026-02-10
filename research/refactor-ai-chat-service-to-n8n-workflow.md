# Should We Refactor the AI Chat Service to N8N Workflow?

> Researched on: 2026-02-10
> Research method: Parallel agent team (4 researchers)

## Overview

N8N is a fair-code licensed workflow automation platform (150k+ GitHub stars) that combines a visual drag-and-drop builder with the ability to inject custom JavaScript/Python code. Originally a general-purpose integration tool, N8N has added AI capabilities built on LangChain internally, providing visual wrappers around LLM calls, vector stores, and agent patterns. It has native Supabase + pgvector integration, which aligns with the OOTD stack.

However, after thorough research across four angles — fundamentals, implementation architecture, best practices, and tool comparisons — **the unanimous finding is that refactoring the OOTD AI chat service to N8N is NOT recommended.** The fundamental architectural mismatch is that N8N is stateless by design (all context is wiped between workflow executions), while OOTD's chat service is deeply stateful (session tracking, clarification turns, loop detection, conversation flow). The complex domain logic (Thai cultural matching, occasion scoring, fashion expertise), 708+ vitest tests, and TypeScript type safety would all be degraded or lost.

A **hybrid approach** is the recommended path: keep the custom TypeScript chat service for real-time AI conversations while potentially adopting N8N for peripheral automations like batch data processing, content moderation, or notification workflows.

## Key Concepts

### N8N Core Architecture
- **Node-based DAG system**: Workflows are directed acyclic graphs of connected nodes — Trigger Nodes (webhooks, cron), Action Nodes (execute tasks), AI Agent Nodes (LLM orchestrators), Utility Nodes (transform/filter), and Memory/Vector Store Nodes.
- **Execution model**: Event-driven, stateless. Each execution is independent with no shared state between runs.
- **Code nodes**: JavaScript or Python can be injected anywhere for custom logic.
- **500+ integrations** including databases, APIs, cloud services, and AI models.
- **Two deployment models**: Self-hosted (Docker/K8s, free Community Edition) or N8N Cloud (managed SaaS, from EUR 24/month).

### N8N AI Capabilities
- **AI Agent Nodes**: "Tools Agent" (lets LLM call predefined tools) and "Conversational Agent" (multi-turn chat within a single execution).
- **LLM Support**: Native nodes for OpenAI, Anthropic (Claude), Ollama, Gemini, Mistral. **OpenRouter is NOT natively supported** — requires HTTP Request node.
- **RAG Pipeline**: End-to-end visual builder: Import -> Chunk -> Embed -> Store in Vector DB -> Retrieve -> Generate response.
- **Native Vector Store integrations**: Supabase, Pinecone, Qdrant, PGVector, and others.
- **Built on LangChain JS internally**.

### Key Terminology
| Term | Meaning |
|------|---------|
| Workflow | A DAG of connected nodes that executes as a unit |
| Execution | A single run of a workflow (N8N Cloud charges per execution) |
| Node | A single step in a workflow (trigger, action, AI agent, etc.) |
| Sub-workflow | A reusable workflow invoked by another workflow |
| Queue mode | Production scaling mode with Redis + worker processes |
| Pin | Debug feature that caches node output to avoid re-calling APIs |

## Architecture / How It Works

### N8N AI Agent Workflow Pattern
```
Chat/Webhook Trigger
      │
      ▼
  AI Agent Node ──────── LLM Sub-node (Claude/OpenAI)
      │                       │
      ├── Tool: Vector Store Retriever (Supabase pgvector)
      ├── Tool: HTTP Request (external APIs)
      ├── Tool: Code Node (custom logic)
      │
      ▼
  Respond to Webhook / Chat Output
```

### OOTD Current Architecture (for comparison)
```
Next.js API Route (/api/chat)
      │
      ▼
  ai-chat-service.ts (~1000 lines)
      ├── Session management (clarification tracking, turn counts)
      ├── Guardrail detection (topic boundaries)
      ├── Loop detection (prevent repetitive responses)
      ├── Clarification flow (ask up to 2 questions, then force recommendation)
      ├── RAG retrieval (Supabase pgvector → Vectra fallback → JSON fallback)
      ├── Product filtering (occasion scoring, Thai cultural matching)
      ├── Deduplication (by SKU)
      ├── AI prompt construction (system prompt v2.3 + knowledge context)
      └── OpenRouter API call (Claude)
```

### Why the Architectures Don't Align

| Concern | OOTD Current | N8N Equivalent | Gap |
|---------|-------------|----------------|-----|
| Session state | In-memory SessionContext object | External DB read/write per execution | Major complexity overhead |
| Clarification tracking | `clarificationTurnCount` + `askedClarifications` | Multiple Code nodes + DB writes | Loses cohesion |
| Loop detection | Inline pure function | Separate Code node + DB | Scattered logic |
| Fallback chains | try/catch cascade (Supabase → Vectra → JSON) | Multiple IF branches with error paths | Verbose, fragile |
| Type safety | TypeScript interfaces (DbProduct, EnhancedProduct) | Untyped JSON between nodes | Lost entirely |
| Testing | 708+ vitest tests | Visual "Pin" output inspection | No programmatic testing |
| OpenRouter | Direct API client | HTTP Request node (custom) | No native support |
| Latency | In-process function calls | Inter-node data passing + HTTP overhead | 3-20s execution sweet spot vs sub-second |

## Implementation Guide

### If You Decide to Use N8N (Hybrid Approach)

The recommended hybrid approach keeps the AI chat service in TypeScript while delegating specific sub-tasks to N8N:

#### Step 1: Identify Extractable Workflows
Good candidates for N8N:
- **Product data enrichment** (scheduled batch jobs)
- **Knowledge base ingestion** (document → chunk → embed → store pipeline)
- **Content moderation** workflows
- **Notification/alerting** systems
- **A/B testing orchestration** for different AI prompts
- **Analytics data processing** pipelines

#### Step 2: Set Up N8N Infrastructure
```bash
# Self-hosted with Docker (recommended for production)
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e EXECUTIONS_MODE=queue \
  -e QUEUE_BULL_REDIS_HOST=redis \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

#### Step 3: Create RAG Ingestion Workflow (Example)
```
Schedule Trigger (daily)
    │
    ▼
Supabase Node (fetch new knowledge docs)
    │
    ▼
Text Splitter Node (chunk documents)
    │
    ▼
Embeddings Node (generate vectors)
    │
    ▼
Supabase Vector Store Node (upsert)
    │
    ▼
Notification Node (Slack/email summary)
```

#### Step 4: Keep Chat Service in TypeScript
The `/api/chat` route and `ai-chat-service.ts` remain unchanged. They can optionally call N8N webhooks for specific sub-tasks if needed.

### What NOT to Migrate
- Session management and conversation flow
- Clarification detection and guardrails
- Loop detection logic
- Product filtering and occasion scoring heuristics
- Thai cultural matching
- Real-time chat orchestration

## Best Practices

### N8N Production Best Practices (If Using Hybrid)
1. **Use queue mode** with Redis + worker processes for production scale
2. **Separate webhook workers** from the editor instance
3. **Use PgBouncer** for Postgres connection pooling (prevents "Database is not ready" errors)
4. **Export workflows as JSON to Git** for version control
5. **Never edit production workflows directly** — use dev/staging/prod environments
6. **Implement exponential backoff** for retries (1s, 2s, 4s)
7. **Set execution timeouts** to prevent hanging workflows
8. **Use N8N's credential system** — never hardcode secrets
9. **Monitor via Prometheus-compatible `/metrics` endpoint** (self-hosted)
10. **Use the Pin feature** during development to cache LLM outputs (saves API costs)

### When to Choose Custom Code Over N8N
- Complex domain logic requiring nuanced decision trees
- Type-safe data pipelines with nested structures
- Extensive test coverage is critical (700+ tests)
- RAG with custom retrieval logic
- Performance-sensitive real-time interactions
- Tight framework integration (Next.js API routes)

### When N8N Adds Value
- Simple, linear integrations (webhook → process → notify)
- Non-developer team members need to modify workflows
- Scheduled batch processing
- Cross-service orchestration
- Rapid prototyping before committing to code

### Anti-Patterns to Avoid
- Migrating complex stateful services to N8N's stateless model
- Using N8N Cloud for high-throughput AI workloads (lacks queue mode)
- Building deeply nested conditional logic in visual workflows
- Losing test coverage for the sake of visual appeal
- Using N8N as the primary runtime for user-facing real-time APIs

## Tools & Technologies

### Platform Landscape

| Platform | Type | Best For | GitHub Stars | License |
|----------|------|----------|-------------|---------|
| **N8N** | General workflow automation | Service integrations, batch processing | 150k+ | Fair-code (custom) |
| **Dify** | LLM app platform | Non-developer teams, knowledge bases | 106k+ | Apache 2.0 |
| **Flowise** | Visual LangChain builder | LangChain prototyping | ~35k | Apache 2.0 |
| **LangChain/LangGraph** | Code-first AI SDK | Complex stateful agents | ~100k | MIT |
| **CrewAI** | Multi-agent framework | Agent team collaboration | ~25k | MIT |
| **Make.com** | Commercial no-code | Business process automation | N/A | Proprietary |
| **Zapier** | Commercial no-code | Simple app-to-app integrations | N/A | Proprietary |

### N8N Pricing

| Plan | Cost | Executions | Key Features |
|------|------|-----------|--------------|
| Community (self-hosted) | Free | Unlimited | All core features, no queue mode in basic setup |
| Starter (cloud) | EUR 24/mo | 2,500 | Managed hosting, basic support |
| Pro (cloud) | EUR 60/mo | 10,000 | Advanced features, log streaming |
| Enterprise | Custom | Custom | SSO, SAML, isolated environments, queue mode |

### N8N Performance Benchmarks
- Single instance: up to 220 executions/second
- Queue mode with workers: 72 req/sec, latency under 3 seconds, zero failures
- Real-world scaling: 10K+ daily runs achievable with proper infrastructure (PgBouncer, queue mode, separate webhook workers)
- Sweet spot execution time: 3-20 seconds (not ideal for real-time chat)

## Comparison & Trade-offs

### N8N vs Current Custom TypeScript Service

| Dimension | Custom TypeScript (Current) | N8N Migration |
|-----------|---------------------------|---------------|
| **Development speed** | Moderate (code-first) | Fast for simple workflows, slow for complex logic |
| **Type safety** | Full TypeScript | None (untyped JSON between nodes) |
| **Testing** | 708+ vitest tests | Visual trace inspection only |
| **Debugging** | Breakpoints, stack traces, logging | Visual node inspection, Pin outputs |
| **Performance** | In-process, sub-second | 3-20s execution overhead |
| **State management** | Native (SessionContext) | External DB workaround required |
| **Maintainability** | Standard code review, Git diffs | JSON blob diffs, harder to review |
| **Onboarding** | TypeScript knowledge required | Visual builder, lower initial barrier |
| **Scaling** | Next.js serverless/edge | Queue mode + Redis + workers |
| **Cost** | $0 additional (shared Azure) | $0 self-hosted or EUR 24-60/mo cloud |
| **OpenRouter** | Native support | HTTP Request node (custom) |
| **Vendor lock-in** | Low (standard TS/Node) | Medium (N8N-specific workflow format) |

### Decision Matrix

| Factor | Weight | Custom Code Score | N8N Score |
|--------|--------|------------------|-----------|
| Complex domain logic | High | 9/10 | 4/10 |
| Type safety | High | 10/10 | 2/10 |
| Test coverage | High | 10/10 | 3/10 |
| Session management | High | 9/10 | 3/10 |
| Real-time performance | High | 9/10 | 5/10 |
| Visual workflow overview | Low | 4/10 | 9/10 |
| Non-dev accessibility | Low | 3/10 | 8/10 |
| Integration breadth | Medium | 6/10 | 9/10 |
| LLM provider swapping | Medium | 6/10 | 8/10 |
| **Weighted Total** | | **8.3/10** | **4.5/10** |

## Relevance to OOTD Project

### Recommendation: Do NOT Refactor the AI Chat Service to N8N

The OOTD AI chat service (`ai-chat-service.ts`) is a poor candidate for N8N migration because:

1. **Stateful conversation management**: Session tracking with `clarificationTurnCount`, `askedClarifications`, `mentionedProducts`, and loop detection requires persistent state — N8N is stateless between executions.

2. **Complex domain logic**: Thai cultural matching (`thai-cultural-matcher.ts`), occasion scoring (`occasion-scoring.ts`), and fashion expertise heuristics are pure functions with well-defined TypeScript interfaces. Moving these to N8N Code nodes would scatter the logic and lose type safety.

3. **Test coverage at risk**: 708+ vitest tests across 32 test files verify the chat pipeline end-to-end. N8N has no equivalent programmatic testing framework.

4. **OpenRouter dependency**: OOTD uses OpenRouter for Claude access — N8N doesn't natively support OpenRouter, requiring custom HTTP Request nodes.

5. **Performance requirements**: Real-time chat needs sub-second orchestration latency. N8N's sweet spot is 3-20 second execution times.

6. **Fallback architecture**: The graceful degradation chain (Supabase RAG → Vectra → JSON files, with deduplication by SKU) is elegant in code but would become verbose and fragile in visual workflows.

7. **DbProduct → EnhancedProduct transformer**: Complex type transformations between flat Supabase rows and nested chat pipeline types rely on TypeScript's type system.

### Where N8N Could Add Value to OOTD

Consider N8N for **peripheral workflows** that don't touch the real-time chat path:

| Use Case | Benefit |
|----------|---------|
| Knowledge base ingestion pipeline | Visual builder for document → chunk → embed → Supabase flow |
| Product data enrichment | Scheduled batch jobs to update product metadata |
| Content moderation | Async pipeline to review AI-generated content |
| Notification workflows | Alert team on errors, user feedback, or usage milestones |
| A/B testing orchestration | Route different prompts to different user segments |
| Analytics pipelines | Process conversation logs for insights |
| Prompt iteration/debugging | Use Pin feature to cache LLM outputs during development |

### Recommended Next Steps

1. **Keep the current TypeScript architecture** for `ai-chat-service.ts` and the `/api/chat` route
2. **Evaluate N8N for knowledge ingestion** if the team needs a visual pipeline for batch embedding/chunking
3. **Consider LangGraph** (not N8N) if you eventually need more sophisticated agent orchestration with persistent state
4. **Use N8N's Pin feature** as a development tool for prompt debugging (without migrating production)
5. **Revisit this decision** if N8N adds persistent memory and native OpenRouter support in future versions

## Sources

### N8N Official Resources
- [N8N AI Page](https://n8n.io/ai/) - Official AI capabilities overview
- [N8N RAG Page](https://n8n.io/rag/) - RAG pipeline capabilities and supported vector stores
- [N8N Pricing](https://n8n.io/pricing/) - Official pricing page
- [N8N Supabase Vector Store Documentation](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoresupabase/) - Supabase Vector Store node operations
- [N8N PGVector Node Docs](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstorepgvector/) - PGVector integration docs
- [N8N Webhook Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) - API endpoint creation
- [Performance and Benchmarking - n8n Docs](https://docs.n8n.io/hosting/scaling/performance-benchmarking/) - Official scaling benchmarks
- [Concurrency Control - n8n Docs](https://docs.n8n.io/hosting/scaling/concurrency-control/) - Concurrency limits

### N8N Blog & Guides
- [15 Best Practices for Deploying AI Agents in Production](https://blog.n8n.io/best-practices-for-deploying-ai-agents-in-production/) - Production deployment guide (Jan 2026)
- [AI Workflow Builder Best Practices](https://blog.n8n.io/ai-workflow-builder-best-practices/) - Workflow building tips (Jan 2026)
- [LLM Agents Practical Guide](https://blog.n8n.io/llm-agents/) - Core architecture and step-by-step guide
- [AI Agent Orchestration Frameworks](https://blog.n8n.io/ai-agent-orchestration-frameworks/) - 11-framework comparison
- [The N8N Scalability Benchmark](https://blog.n8n.io/the-n8n-scalability-benchmark/) - Official benchmark results

### Community & Independent Reviews
- [N8N AI Agents 2025: Complete Capabilities Review](https://latenode.com/blog/low-code-no-code-platforms/n8n-setup-workflows-self-hosting-templates/n8n-ai-agents-2025-complete-capabilities-review-implementation-reality-check) - Independent review with limitations analysis
- [From Frustration to 10K+ Daily Runs: Scaling N8N](https://medium.com/@lucasm676/from-frustration-to-10k-daily-runs-scaling-n8n-for-ai-powered-saas-workflows-9ef784f9cdc2) - Real-world scaling case study
- [Scaling N8N Workflows](https://n8ncraft.com/blog/scaling-n8n-workflows-is-tough-here-s-what-s-really-getting-in-your-way) - Common scaling obstacles
- [N8N Self-Hosting Guide](https://northflank.com/blog/how-to-self-host-n8n-setup-architecture-and-pricing-guide) - Architecture and deployment details

### RAG + Supabase Guides
- [The Missing Manual: RAG in N8N with Supabase](https://michalpele.medium.com/rag-in-n8n-with-supabase-b827a0e7f1b1) - Comprehensive hybrid RAG guide
- [Build an Agentic RAG Chatbot with N8N, Supabase, and pgvector](https://medium.com/@ahsenelmas1/build-an-agentic-rag-chatbot-with-n8n-google-drive-supabase-and-pgvector-step-by-step-e05b1c5d5a18) - Step-by-step tutorial
- [Enterprise-grade Agentic RAG N8N Pipeline (GitHub)](https://github.com/anshwysmcbel2710/agentic-rag-n8n-ingestion-pipeline) - Production-ready pipeline architecture
- [N8N RAG with Supabase (Medium)](https://medium.com/@abhishekarya1/building-a-rag-ai-agent-with-n8n-ollama-and-supabase-9f886fb5c661) - Practical RAG + Supabase implementation

### Tool Comparisons
- [Dify vs. N8N vs. Flowise: LLM Application Low-Code Platform Comparison](https://www.api2o.com/en/blog/lowcode-platform-compare-dify-n8n-flowise) - Detailed developer comparison
- [Best N8N Alternatives for AI Workflow Automation](https://www.getdynamiq.ai/post/best-n8n-alternatives-for-ai-workflow-automation) - Alternative tool overview
- [Top 7 Open-Source AI Low/No-Code Tools in 2025](https://htdocs.dev/posts/top-7-open-source-ai-lowno-code-tools-in-2025-a-comprehensive-analysis-of-leading-platforms/) - Broader landscape analysis
