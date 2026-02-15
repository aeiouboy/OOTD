# LLM Model Testing Integration - User Guide

This guide explains how to use the LLM Model Testing system integrated into the OOTDay Fashion Assistant application.

## Overview

The LLM Model Testing feature allows you to:
- Test multiple LLM models (Gemini, GPT-4, GLM-4, Claude, Qwen, DeepSeek) with fashion queries
- Automatically evaluate responses against 8 quality criteria
- Compare outputs with reference responses
- Track costs and manage budget
- Export results to Markdown and CSV formats

## Setup

### 1. Environment Configuration

Create or update `.env.local` in the frontend directory:

```bash
# OpenRouter API Key (required)
OPENROUTER_API_KEY=your-api-key-here

# Enable test mode (required)
NEXT_PUBLIC_ENABLE_TEST_MODE=true
```

Get your OpenRouter API key from: https://openrouter.ai/keys

### 2. Install Dependencies

Dependencies are already installed:
- `papaparse` - CSV export functionality
- `@dqbd/tiktoken` - Token counting (optional)

## Using Test Mode

### Accessing Test Mode

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the chat interface
3. Look for the orange "TEST MODE" panel

### Running a Test

1. **Select a Model**
   - Choose from 6 available LLM models
   - Each model has different pricing and capabilities

2. **Select a Test Scenario**
   - Choose from 27 pre-defined scenarios across 9 occasions:
     - Work, Chill Day, Wedding, Sport, Travel, Date, Dinner, Café, Party
   - Or select "Custom Query" to enter your own

3. **Enter Custom Query** (optional)
   - If "Custom Query" is selected, enter your fashion question
   - The system will auto-detect if it's CLOTHS or OTHER category

4. **Run Test**
   - Click "Run Test" button
   - Wait for the API response (typically 5-30 seconds)
   - Results will display automatically

### Understanding Results

#### Evaluation Scores

The system evaluates responses on 8 criteria:

1. **Overall Quality** (0-10)
   - Weighted average: Thai Tone (30%) + Links (35%) + Structure (35%)

2. **Thai Language Tone & Style** (0-10)
   - Checks for conversational Thai particles (ค่ะ, นะคะ, เลย)
   - Natural phrases and emoji usage
   - Score 8-10: Excellent, 6-7: Good, 4-5: Adequate, 0-3: Needs improvement

3. **Category Identification** (Pass/Fail)
   - Verifies correct category handling (CLOTHS vs OTHER)
   - CLOTHS: Should have product recommendations with prices/links
   - OTHER: Should have tips without prices/links

4. **Product Recommendation Count** (Pass/Fail)
   - CLOTHS: 3-5 products required
   - OTHER: 0 products expected

5. **Central Online Links** (0-10)
   - Checks for valid central.co.th URLs
   - Proper formatting and matching product count

6. **Styling Tips Count** (Pass/Fail)
   - Should have 1-3 styling tips
   - Checks bullet points in tips section

7. **Response Structure** (0-10)
   - Template A (CLOTHS): Greeting + Products + Tips + Conclusion
   - Template B (OTHER): Greeting + Tips + Natural mentions + Closing

### Comparing with Reference

1. Click "Compare with Reference" button after a test completes
2. View side-by-side comparison:
   - Left: Reference output from output_t14-2.md
   - Right: Actual LLM response
3. Add manual review:
   - Select "✓ Approved" or "⚠ Needs Improvement"
   - Add notes about the output
   - Submit review

### Budget Management

- **Total Budget**: $5.00 (default)
- **Warning Threshold**: 80% ($4.00)
- **Real-time Tracking**: Updates after each test
- **Progress Bar**: Visual indicator with color coding
  - Green: Under 80%
  - Orange: 80-100% (warning)
  - Red: Over 100% (testing disabled)

#### Resetting Budget

Click the "Reset" button in Budget Tracker to:
- Clear accumulated costs
- Reset to $0.00
- Clear all test results from session

### Exporting Results

#### Export Options

1. **Export Current Test**
   - Single markdown file with detailed results
   - Includes all evaluation scores and metadata

2. **Export All Tests**
   - Combined markdown with summary table
   - Individual CSV with all tests
   - Click "Export Results (N)" button

#### Export Formats

**Markdown (.md)**
- Test metadata (timestamp, model, occasion)
- Full query and response
- Evaluation scores table
- Performance metrics (tokens, cost, time)
- Manual review notes
- Reference output snippet

**CSV (.csv)**
- Spreadsheet-compatible format
- All evaluation scores as columns
- Suitable for data analysis
- Includes truncated responses

#### Downloaded Files

Files download to your browser's default download folder:
- Format: `test-result-YYYY-MM-DD-HHmmss.md`
- Format: `test-results-YYYY-MM-DD-HHmmss.csv`

**Note**: Browser can only download files. Manually move them to `/dialog/test-results/` for project organization.

## Model Information

### Available Models

1. **Gemini 2.0 Flash** (Google)
   - Free tier available
   - Fast responses
   - Good for testing

2. **GPT-4 Turbo** (OpenAI)
   - $10/$30 per million tokens
   - High quality responses
   - More expensive

3. **GLM-4** (Zhipu AI)
   - $1/$1 per million tokens
   - Balanced cost/performance

4. **Claude 3.5 Sonnet** (Anthropic)
   - $3/$15 per million tokens
   - Excellent reasoning
   - Good Thai language support

5. **Qwen 2.5 72B** (Alibaba)
   - $0.4/$0.4 per million tokens
   - Very cost-effective
   - Good multilingual support

6. **DeepSeek Chat** (DeepSeek)
   - $0.14/$0.28 per million tokens
   - Most affordable option

### Model Selection Tips

- Start with **Gemini** (free) for initial testing
- Use **DeepSeek** or **Qwen** for budget-conscious testing
- Choose **Claude** or **GPT-4** for highest quality
- Test same scenario across multiple models to compare

## Test Scenarios

### Pre-defined Scenarios

27 scenarios covering 9 occasions with 3 queries each:

**Work Occasions**
1. Smart casual office
2. Business formal meeting
3. Creative office look

**Casual Occasions**
1. Weekend chill
2. Shopping with friends
3. Park walk

**Special Occasions**
1. Semi-formal wedding
2. Daytime hotel wedding
3. Beach wedding evening

*(And 6 more occasion categories...)*

### Custom Queries

Examples of custom queries:
- "หาชุดไปสัมภาษณ์งานค่ะ งบ 5000 บาท"
- "รองเท้าหนังจะดูแลยังไงให้อยู่นาน"
- "จะไปเที่ยวญี่ปุ่นหน้าหนาว อยากได้ชุดอุ่นๆ"

## Troubleshooting

### "Invalid OpenRouter API key"
- Check `.env.local` has correct `OPENROUTER_API_KEY`
- Verify key is valid at https://openrouter.ai/keys
- Restart development server after updating `.env.local`

### "Budget exceeded"
- Click "Reset" in Budget Tracker
- Or wait until next session
- Budget resets when browser session ends

### "Request timeout"
- Some models may be slow
- Default timeout is 30 seconds
- Try a different model or simpler query

### "Rate limit exceeded"
- OpenRouter has rate limits
- System automatically retries with exponential backoff
- Wait a few seconds before next test

### No reference output in comparison
- Some custom queries don't have reference outputs
- Only pre-defined scenarios have reference outputs
- Comparison still works, just shows "No reference available"

## Best Practices

### Testing Strategy

1. **Start Small**
   - Test with free models first (Gemini)
   - Use 1-2 scenarios to understand the system

2. **Compare Models**
   - Test same scenario across 3-4 models
   - Export results for comparison
   - Analyze cost vs. quality trade-offs

3. **Track Budget**
   - Monitor budget tracker
   - Export results before resetting
   - Plan tests to stay within budget

4. **Document Findings**
   - Use manual review notes
   - Export regularly
   - Keep CSV files for analysis

### Cost Optimization

- Free models: Gemini (when available)
- Budget-friendly: DeepSeek ($0.14-0.28/M tokens)
- Mid-range: GLM-4, Qwen ($0.4-1/M tokens)
- Premium: Claude, GPT-4 ($3-30/M tokens)

**Typical Costs Per Test**:
- Gemini: $0.00
- DeepSeek: $0.001-0.003
- Qwen: $0.002-0.005
- GLM-4: $0.005-0.010
- Claude: $0.015-0.030
- GPT-4: $0.050-0.100

## Technical Details

### File Locations

```
v0-ootd-ay-ai-fashion-assistant/
├── lib/
│   ├── openrouter-client.ts      # API client
│   ├── test-scenarios.ts          # Scenario management
│   ├── test-evaluator.ts          # Evaluation engine
│   ├── cost-calculator.ts         # Budget tracking
│   ├── test-result-exporter.ts    # Export functionality
│   └── types/
│       └── test-types.ts          # TypeScript interfaces
├── components/
│   └── chat/
│       ├── TestModePanel.tsx      # Main test interface
│       ├── ModelSelector.tsx      # Model dropdown
│       ├── ScenarioSelector.tsx   # Scenario dropdown
│       ├── BudgetTracker.tsx      # Budget display
│       ├── EvaluationResults.tsx  # Score display
│       └── ComparisonView.tsx     # Side-by-side comparison
├── config/
│   └── models.json                # Model configurations
└── .env.local                     # Environment variables
```

### Dialog Templates

```
dialog/
├── t14.2-CC/
│   ├── DialogTemplate14-2.md      # System prompt
│   └── output_t14-2.md            # Reference outputs
└── test-results/                   # Export destination (manual)
```

## Support

For issues or questions:
- Check troubleshooting section above
- Review console for error messages
- Verify environment configuration
- Test with free models first

## Version

- Version: 1.0.0
- Last Updated: 2025-10-11
- PRD Reference: 0001-prd-llm-model-testing-integration.md
