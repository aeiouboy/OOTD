# Multi-Panel Test Mode Integration Guide

## Overview

The Multi-Panel Test Mode enables simultaneous testing of up to 4 LLM models with integrated RAG (Retrieval-Augmented Generation) and Guardrails system for accurate fashion product recommendations.

## Features

### 🤖 11 LLM Models Supported

1. **Gemini 2.0 Flash** (Google) - Free tier
2. **GPT-4 Turbo** (OpenAI) - Premium
3. **GLM-4.6** (Zhipu AI) - Mid-range
4. **Claude 3.5 Sonnet** (Anthropic) - Premium
5. **Claude Sonnet 4.5** (Anthropic) - Premium
6. **Qwen 2.5 72B** (Alibaba) - Budget-friendly
7. **DeepSeek Chat** (DeepSeek) - Budget-friendly
8. **GPT-OSS-20B** (OpenChat) - Budget-friendly
9. **GPT-4.1 Mini** (OpenAI) - Mid-range
10. **GPT-5** (OpenAI) - Premium
11. **Grok Code Fast 1** (xAI) - Premium

### ✨ Key Capabilities

- **Parallel Testing**: Run up to 4 models simultaneously
- **Shared Budget**: $5 budget tracked across all panels in real-time
- **RAG Integration**: Automatic knowledge base retrieval for accurate recommendations
- **Guardrails**: Pre and post-validation with automatic regeneration
- **Live Evaluation**: Automatic scoring on 8 quality criteria
- **Export Functionality**: Export all results to Markdown and CSV

## Installation & Setup

### 1. Environment Configuration

Create or update `.env.local`:

```bash
# Required: OpenRouter API Key
OPENROUTER_API_KEY=your-api-key-here

# Optional: Enable test mode UI toggle
NEXT_PUBLIC_ENABLE_TEST_MODE=true
```

Get your API key from: https://openrouter.ai/keys

### 2. Dependencies

All required dependencies are already installed:

```json
{
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.14"
}
```

### 3. File Structure

```
v0-ootd-ay-ai-fashion-assistant/
├── components/
│   └── chat/
│       ├── MultiPanelTestMode.tsx       ← Main component
│       ├── TestModePanel.tsx            ← Single panel mode
│       ├── ModelSelector.tsx
│       ├── ScenarioSelector.tsx
│       ├── BudgetTracker.tsx
│       ├── EvaluationResults.tsx
│       └── ComparisonView.tsx
├── lib/
│   ├── chat-orchestrator.ts            ← RAG + Guardrails integration
│   ├── openrouter-client.ts            ← API client
│   ├── test-scenarios.ts
│   ├── test-evaluator.ts
│   ├── test-result-exporter.ts
│   ├── rag/                             ← RAG system
│   │   ├── retrieval.ts
│   │   ├── knowledge-base.ts
│   │   └── embeddings.ts
│   └── guardrails/                      ← Guardrails system
│       ├── pre-validation.ts
│       ├── post-validation.ts
│       └── regeneration.ts
├── config/
│   └── models.json                      ← 11 model configurations
└── knowledge/                            ← Knowledge base content
    ├── fashion/
    ├── occasions/
    └── brand/
```

## Usage

### Basic Integration

```tsx
import { MultiPanelTestMode } from '@/components/chat/MultiPanelTestMode';
import { exportResultsBoth } from '@/lib/test-result-exporter';

export default function TestPage() {
  const handleExportAll = (results) => {
    // Export to both Markdown and CSV
    exportResultsBoth(results);
  };

  return (
    <div className="container mx-auto p-4">
      <MultiPanelTestMode
        onExportAll={handleExportAll}
        maxPanels={4}
      />
    </div>
  );
}
```

### Advanced Integration with Chat Interface

```tsx
'use client';

import { useState } from 'react';
import { MultiPanelTestMode } from '@/components/chat/MultiPanelTestMode';
import { exportResultsBoth } from '@/lib/test-result-exporter';

export default function ChatPage() {
  const [isTestMode, setIsTestMode] = useState(false);

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={() => setIsTestMode(!isTestMode)}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg"
      >
        {isTestMode ? 'Exit Test Mode' : 'Enter Test Mode'}
      </button>

      {/* Conditional Rendering */}
      {isTestMode ? (
        <MultiPanelTestMode
          onExportAll={(results) => {
            exportResultsBoth(results);
            console.log('Exported', results.length, 'results');
          }}
          maxPanels={4}
        />
      ) : (
        <YourNormalChatInterface />
      )}
    </div>
  );
}
```

## How It Works

### 1. Chat Orchestrator Flow

```
User Query
    ↓
Pre-Validation (Guardrails)
    ↓ (if passed)
RAG Retrieval (Knowledge Base)
    ↓
Augmented Prompt Generation
    ↓
LLM Call (OpenRouter)
    ↓
Post-Validation (Guardrails)
    ↓ (if failed, retry up to 2x)
Response Evaluation
    ↓
Display Results
```

### 2. Multi-Panel Execution

When you click "Run All Tests":

1. **Validation**: Checks if models are selected and query is provided
2. **Parallel Execution**: All panels run simultaneously using `Promise.all()`
3. **RAG Integration**: Each call goes through `processChatRequest()` which:
   - Validates the query (pre-validation)
   - Retrieves relevant knowledge chunks
   - Augments the system prompt
   - Calls the LLM
   - Validates the response (post-validation)
   - Regenerates if needed (max 2 attempts)
4. **Evaluation**: Each response is scored on 8 criteria
5. **Budget Update**: Costs are calculated and shared budget is updated
6. **Results Display**: All panels show results simultaneously

### 3. Budget Management

- **Shared Budget**: $5.00 total across all panels
- **Real-time Tracking**: Updates after each test
- **Warning Threshold**: Alert at 80% usage
- **Session Persistence**: Budget persists across page refreshes
- **Reset Function**: Clear budget and all results

## Evaluation Criteria

Each response is automatically scored on:

1. **Overall Quality** (0-10) - Weighted average
2. **Thai Language Tone** (0-10) - Natural Thai particles and style
3. **Category Identification** (Pass/Fail) - CLOTHS vs OTHER
4. **Product Count** (Pass/Fail) - 3-5 products for CLOTHS
5. **Central Online Links** (0-10) - Valid product URLs
6. **Styling Tips** (Pass/Fail) - 1-3 helpful tips
7. **Response Structure** (0-10) - Follows template format

## Export Formats

### Markdown Export

Contains for each test:
- Test metadata (timestamp, model, scenario)
- User query and LLM response
- Evaluation scores table
- Performance metrics (tokens, cost, time)
- Manual review notes (if added)
- Reference output snippet

### CSV Export

Spreadsheet format with columns:
- All evaluation scores
- Token usage and costs
- Response time
- Model information
- Truncated response text

## Testing Scenarios

### Pre-defined Scenarios

27 scenarios across 9 occasions:
- Work (3 scenarios)
- Casual/Chill (3 scenarios)
- Wedding (3 scenarios)
- Sport (3 scenarios)
- Travel (3 scenarios)
- Date (3 scenarios)
- Dinner (3 scenarios)
- Café (3 scenarios)
- Party (3 scenarios)

### Custom Queries

Examples:
```
"หาชุดไปสัมภาษณ์งานค่ะ งบ 5000 บาท"
"อยากได้ชุดไปงานแต่งงานกลางวันที่โรงแรม"
"รองเท้าหนังจะดูแลยังไงให้อยู่นาน"
```

## API Integration

### Chat Orchestrator

```typescript
import { processChatRequest } from '@/lib/chat-orchestrator';

const response = await processChatRequest({
  query: "หาชุดไปทำงานค่ะ",
  modelId: "anthropic/claude-3.5-sonnet"
});

console.log(response.response); // LLM response
console.log(response.metadata.ragUsed); // true/false
console.log(response.metadata.ragChunksRetrieved); // number
console.log(response.metadata.postValidationPassed); // true/false
```

### Direct OpenRouter Call

```typescript
import { OpenRouterClient } from '@/lib/openrouter-client';

const client = new OpenRouterClient();
const result = await client.sendChatCompletion({
  modelId: "google/gemini-2.0-flash-exp:free",
  systemPrompt: "You are a fashion assistant",
  userMessage: "Recommend an outfit"
});

console.log(result.content);
console.log(result.tokenUsage);
console.log(result.responseTime);
```

## Customization

### Adjusting Panel Count

```tsx
<MultiPanelTestMode maxPanels={3} /> // 3 panels instead of 4
```

### Custom Export Handler

```tsx
<MultiPanelTestMode
  onExportAll={(results) => {
    // Custom export logic
    results.forEach(result => {
      console.log(`${result.model.name}: ${result.evaluationScore.overallQuality}`);
    });

    // Still export to files
    exportResultsBoth(results);
  }}
/>
```

### Styling

The component uses Tailwind CSS classes. Customize by:

1. **Modify Border Colors**: Edit `getPanelBorderColor()` in `MultiPanelTestMode.tsx`
2. **Change Theme**: Update gradient colors in the header
3. **Adjust Layout**: Modify grid classes for different panel arrangements

## Troubleshooting

### "Invalid OpenRouter API key"

- Check `.env.local` has `OPENROUTER_API_KEY=your-key`
- Verify key is valid at https://openrouter.ai/keys
- Restart dev server after updating `.env.local`

### Budget Exceeded

- Click "Reset Budget" button
- Budget is stored in session storage
- Clear browser storage to reset manually

### Models Not Loading

- Check `config/models.json` is valid JSON
- Ensure all model IDs are correct OpenRouter model names
- Verify models are available at https://openrouter.ai/models

### RAG Not Working

- Check knowledge base files exist in `knowledge/` directory
- Verify `OPENAI_API_KEY` is set for embeddings (if using OpenAI)
- Check console for RAG-related errors

### Export Not Working

- Ensure browser allows file downloads
- Check browser's download folder
- Verify `papaparse` is installed for CSV export

## Performance Optimization

### Parallel Execution

The system runs all panels in parallel for optimal performance:

```typescript
const testPromises = activePanels.map(panel => runTest(panel));
await Promise.all(testPromises);
```

### Budget Calculation

Token counting is estimated for speed:
- 1 token ≈ 4 characters
- Actual token usage may vary
- More accurate with `@dqbd/tiktoken` (optional)

### Caching

- System prompt is cached in OpenRouter client
- Knowledge base embeddings can be cached
- Session storage for budget persistence

## Best Practices

### 1. Start with Free Models

Test with Gemini first to understand the system without cost.

### 2. Compare Similar Models

Group models by tier:
- Budget: Gemini, DeepSeek, Qwen
- Mid-range: GLM-4, GPT-4.1 Mini
- Premium: Claude, GPT-4/5, Grok

### 3. Use Scenarios

Pre-defined scenarios have reference outputs for better comparison.

### 4. Export Regularly

Export results before resetting budget to avoid data loss.

### 5. Monitor Budget

Keep track of costs especially when using premium models.

## Integration Checklist

- [ ] Add `OPENROUTER_API_KEY` to `.env.local`
- [ ] Import `MultiPanelTestMode` component
- [ ] Add export handler with `exportResultsBoth`
- [ ] Test with free model (Gemini)
- [ ] Verify RAG integration is working
- [ ] Check guardrails validation
- [ ] Test budget tracking
- [ ] Verify export functionality
- [ ] Test with multiple scenarios
- [ ] Review exported files

## Support & Documentation

- **OpenRouter Docs**: https://openrouter.ai/docs
- **Component Source**: `components/chat/MultiPanelTestMode.tsx`
- **RAG System**: See `lib/rag/` directory
- **Guardrails**: See `lib/guardrails/` directory
- **Test Scenarios**: `lib/test-scenarios.ts`

## Version History

- **v1.0.0** - Initial release with 11 models and multi-panel support
- Integration with RAG and Guardrails system
- Shared budget tracking across panels
- Parallel execution with Promise.all()
- Export to Markdown and CSV

---

**Generated for OOTDay Fashion Assistant** | Last Updated: 2025-10-12
