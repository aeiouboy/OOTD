# Quick Start: Multi-Panel Test Mode

## 🚀 Get Started in 3 Minutes

### Step 1: Add API Key (30 seconds)

```bash
cd v0-ootd-ay-ai-fashion-assistant
echo "OPENROUTER_API_KEY=your-key-here" >> .env.local
```

Get your key: https://openrouter.ai/keys

### Step 2: Create Test Page (60 seconds)

Create `app/test/page.tsx`:

```tsx
'use client';

import { MultiPanelTestMode } from '@/components/chat/MultiPanelTestMode';
import { exportResultsBoth } from '@/lib/test-result-exporter';

export default function TestPage() {
  return (
    <div className="p-6">
      <MultiPanelTestMode
        onExportAll={exportResultsBoth}
        maxPanels={4}
      />
    </div>
  );
}
```

### Step 3: Run and Test (90 seconds)

```bash
pnpm dev
```

Visit: http://localhost:3000/test

1. Select a scenario or enter custom query
2. Click "+ Add Panel" and select models
3. Click "Run All Tests"
4. Review results
5. Click "Export All"

Done! 🎉

## 💡 Quick Tips

### Free Testing
Start with **Gemini 2.0 Flash** - it's free!

### Compare Models
Try these combinations:

**Budget Comparison**
- Gemini (free)
- DeepSeek
- Qwen 2.5 72B

**Quality Comparison**
- Claude 3.5 Sonnet
- GPT-4 Turbo
- Claude Sonnet 4.5

**Speed vs Quality**
- Gemini (fast, free)
- GPT-4.1 Mini (balanced)
- GPT-5 (slow, premium)

### Save Budget
- Use free models for initial testing
- Test with 2 panels instead of 4
- Export results before resetting budget

## 📊 Sample Queries

```
"หาชุดไปสัมภาษณ์งานค่ะ งบ 5000 บาท"
"อยากได้ชุดไปงานแต่งกลางวันที่โรงแรม"
"ชุดลำลองไปเดินห้างกับเพื่อน"
"รองเท้าหนังจะดูแลยังไงให้อยู่นาน"
```

## 🎯 What You Get

Each test shows:
- ✅ Overall Quality Score (0-10)
- ✅ Thai Language Tone (0-10)
- ✅ Response Structure (0-10)
- ✅ Product Links Score (0-10)
- ✅ Token Usage
- ✅ Cost per Test
- ✅ Response Time

## 📤 Export Formats

**Markdown** (.md)
- Full test details
- Evaluation scores
- Performance metrics
- Perfect for reports

**CSV** (.csv)
- All data in columns
- Import to Excel/Sheets
- Great for analysis

## ⚙️ Configuration

### Change Panel Count

```tsx
<MultiPanelTestMode maxPanels={2} />  // Just 2 panels
```

### Custom Export

```tsx
<MultiPanelTestMode
  onExportAll={(results) => {
    console.log('Got', results.length, 'results');
    // Your custom logic here
    exportResultsBoth(results);
  }}
/>
```

## 🔥 Advanced: With Toggle

```tsx
'use client';

import { useState } from 'react';
import { MultiPanelTestMode } from '@/components/chat/MultiPanelTestMode';
import { exportResultsBoth } from '@/lib/test-result-exporter';

export default function Page() {
  const [testMode, setTestMode] = useState(false);

  return (
    <div>
      <button onClick={() => setTestMode(!testMode)}>
        {testMode ? 'Exit' : 'Enter'} Test Mode
      </button>

      {testMode ? (
        <MultiPanelTestMode onExportAll={exportResultsBoth} />
      ) : (
        <YourNormalChat />
      )}
    </div>
  );
}
```

## 🐛 Troubleshooting

### "Invalid API key"
- Check `.env.local` has `OPENROUTER_API_KEY=...`
- Restart dev server: `pnpm dev`

### "Budget exceeded"
- Click "Reset Budget" button
- Or clear session storage

### Models not loading
- Verify `config/models.json` exists
- Check OpenRouter status: https://openrouter.ai/status

## 📚 More Resources

- **Full Guide**: `MULTI_PANEL_TEST_MODE_INTEGRATION.md`
- **Examples**: `EXAMPLE_USAGE.tsx`
- **Demo**: Open `test-mode-demo.html` in browser

## 🎨 Available Models

| Model | Provider | Cost | Best For |
|-------|----------|------|----------|
| Gemini 2.0 Flash | Google | Free | Testing |
| DeepSeek Chat | DeepSeek | $ | Budget |
| Qwen 2.5 72B | Alibaba | $ | Budget |
| GPT-4.1 Mini | OpenAI | $$ | Balance |
| GLM-4.6 | Zhipu AI | $$ | Balance |
| Claude 3.5 Sonnet | Anthropic | $$$ | Quality |
| Claude Sonnet 4.5 | Anthropic | $$$ | Quality |
| GPT-4 Turbo | OpenAI | $$$ | Quality |
| GPT-5 | OpenAI | $$$$ | Premium |
| Grok Code Fast 1 | xAI | $$$ | Quality |
| GPT-OSS-20B | OpenChat | $ | Budget |

## 💰 Budget Guide

$5.00 budget gets you approximately:

- **Gemini**: 500+ tests (free)
- **DeepSeek/Qwen**: 200-400 tests
- **GPT-4.1 Mini/GLM**: 50-150 tests
- **Claude/GPT-4**: 10-50 tests
- **GPT-5**: 5-25 tests

## ✅ Success Checklist

- [ ] API key added to `.env.local`
- [ ] Dev server running (`pnpm dev`)
- [ ] Test page created
- [ ] First test completed
- [ ] Results reviewed
- [ ] Files exported
- [ ] Budget tracked

## 🎉 You're Ready!

Start testing and comparing models to find the best fit for your fashion recommendations!

---

**Questions?** Check the full integration guide or example usage files.
