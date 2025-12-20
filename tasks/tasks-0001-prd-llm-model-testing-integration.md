# Tasks: LLM Model Testing Integration

Generated from: `0001-prd-llm-model-testing-integration.md`

## Relevant Files

### New Files to Create
- `frontend/lib/openrouter-client.ts` - OpenRouter API client for making requests to multiple LLM models
- `frontend/lib/test-evaluator.ts` - Automated evaluation logic for scoring LLM responses against 8 criteria
- `frontend/lib/test-scenarios.ts` - Load and manage test scenarios from DialogTemplate14-2.md
- `frontend/lib/cost-calculator.ts` - Token counting and cost calculation utilities
- `frontend/lib/test-result-exporter.ts` - Export test results to markdown and CSV formats
- `frontend/components/chat/TestModePanel.tsx` - Main test controls panel UI
- `frontend/components/chat/ModelSelector.tsx` - Dropdown component for model selection
- `frontend/components/chat/ScenarioSelector.tsx` - Test scenario selection component
- `frontend/components/chat/EvaluationResults.tsx` - Display automated evaluation scores
- `frontend/components/chat/ComparisonView.tsx` - Side-by-side comparison of expected vs actual output
- `frontend/components/chat/BudgetTracker.tsx` - Budget tracking display component
- `frontend/lib/types/test-types.ts` - TypeScript interfaces for test-related types
- `frontend/config/models.json` - Model configuration with pricing and identifiers
- `.env.local` - Environment variables for API keys (not committed to git)

### Existing Files to Modify
- `frontend/components/chat/ChatInterface.tsx` - Add test mode toggle and integrate test panel
- `frontend/lib/types.ts` - Extend with test-related type definitions
- `frontend/package.json` - Add dependencies for CSV export and token counting

### Test Files (Optional for MVP)
- `frontend/lib/__tests__/openrouter-client.test.ts` - Unit tests for OpenRouter API client
- `frontend/lib/__tests__/test-evaluator.test.ts` - Unit tests for evaluation logic
- `frontend/lib/__tests__/cost-calculator.test.ts` - Unit tests for cost calculations

### Notes
- Test mode will be environment-gated using `process.env.NEXT_PUBLIC_ENABLE_TEST_MODE`
- Test results will be saved to `/dialog/test-results/` directory
- Reference output from `/dialog/t14.2-CC/output_t14-2.md` will be loaded for comparison
- Use existing shadcn/ui components (Switch, Select, Progress, Card, etc.) for UI consistency

## Tasks

- [x] 1.0 Setup Project Configuration & Dependencies
  - [x] 1.1 Create `.env.local` file with `OPENROUTER_API_KEY` and `NEXT_PUBLIC_ENABLE_TEST_MODE=true`
  - [x] 1.2 Update `.gitignore` to ensure `.env.local` is not committed
  - [x] 1.3 Install required npm packages: `papaparse` for CSV, `@dqbd/tiktoken` for token counting (optional)
  - [x] 1.4 Create `frontend/config/models.json` with model configurations (IDs, names, pricing for Gemini, GPT-4, GLM 4.6, Claude Sonnet 4.5, Qwen3, DeepSeek)
  - [x] 1.5 Create `dialog/test-results/` directory for storing test outputs
  - [x] 1.6 Add TypeScript interfaces in `frontend/lib/types/test-types.ts` for Model, TestScenario, TestResult, EvaluationScore

- [x] 2.0 Build OpenRouter API Integration Layer
  - [x] 2.1 Create `frontend/lib/openrouter-client.ts` with OpenRouterClient class
  - [x] 2.2 Implement `sendChatCompletion()` method that accepts model ID, system prompt, and user message
  - [x] 2.3 Add error handling for network errors, rate limits (429), and invalid API key (401)
  - [x] 2.4 Implement exponential backoff retry logic for rate limit errors
  - [x] 2.5 Parse response to extract message content, tokens used (prompt_tokens, completion_tokens), and calculate response time
  - [x] 2.6 Load DialogTemplate14-2 content and use it as system prompt in all API calls
  - [x] 2.7 Add timeout configuration (30 seconds) for API requests

- [x] 3.0 Implement Test Scenario Management System
  - [x] 3.1 Create `frontend/lib/test-scenarios.ts` with functions to load test scenarios
  - [x] 3.2 Read and parse `dialog/t14.2-CC/DialogTemplate14-2.md` to extract requirements
  - [x] 3.3 Read and parse `dialog/t14.2-CC/output_t14-2.md` to extract reference outputs for each occasion
  - [x] 3.4 Create structured test scenario objects with: id, occasion, query, expectedCategory, expectedTemplate, referenceOutput
  - [x] 3.5 Implement function to generate test scenarios for all 9 occasions (Work, Chill, Wedding, Sport, Travel, Date, Dinner, Café, Party)
  - [x] 3.6 Add function to validate and load custom user queries as test scenarios
  - [x] 3.7 Export `getTestScenarios()` function that returns array of TestScenario objects

- [x] 4.0 Create Automated Evaluation Engine
  - [x] 4.1 Create `frontend/lib/test-evaluator.ts` with main `evaluateResponse()` function
  - [x] 4.2 Implement Thai Language Tone & Style scorer (0-10): check for ค่ะ, นะคะ, เลย, conversational patterns
  - [x] 4.3 Implement Category Identification checker (Pass/Fail): detect CLOTHS vs OTHER based on structure
  - [x] 4.4 Implement Product Recommendation Count checker (Pass/Fail): count 💰 and 🔗 emoji patterns, validate 3-5 for CLOTHS, 0 for OTHER
  - [x] 4.5 Implement Central Online Links scorer (0-10): regex match `central.co.th` URLs, score based on presence and format
  - [x] 4.6 Implement Styling Tips Count checker (Pass/Fail): count bullet points in tips section, validate 1-3 tips
  - [x] 4.7 Implement Response Structure scorer (0-10): template matching for required sections (greeting, products/tips, conclusion)
  - [x] 4.8 Calculate overall quality score as weighted average: (Thai_Score * 0.3) + (Links_Score * 0.35) + (Structure_Score * 0.35)
  - [x] 4.9 Return EvaluationResult object with all scores, timing data, and pass/fail flags

- [x] 5.0 Build Test Mode UI Components
  - [x] 5.1 Create `frontend/components/chat/ModelSelector.tsx` - dropdown using shadcn Select component to choose model
  - [x] 5.2 Create `frontend/components/chat/ScenarioSelector.tsx` - dropdown with pre-defined scenarios + "Custom Query" option
  - [x] 5.3 Create `frontend/components/chat/BudgetTracker.tsx` - display current cost, remaining budget, progress bar with warning state at 80%
  - [x] 5.4 Create `frontend/components/chat/TestModePanel.tsx` - container with ModelSelector, ScenarioSelector, custom query input, "Run Test" button
  - [x] 5.5 Create `frontend/components/chat/EvaluationResults.tsx` - collapsible Card displaying all 8 evaluation criteria with color-coded scores and pass/fail indicators
  - [x] 5.6 Create `frontend/components/chat/ComparisonView.tsx` - Dialog/Sheet with side-by-side comparison of reference output and actual LLM response
  - [x] 5.7 Add manual review section in ComparisonView: text area for notes, "Approved"/"Needs Improvement" buttons
  - [x] 5.8 Modify `frontend/components/chat/ChatInterface.tsx` to add test mode toggle (Switch component) in header
  - [x] 5.9 Integrate TestModePanel into ChatInterface, conditionally render based on test mode state
  - [x] 5.10 Style test mode with orange/amber header background to distinguish from normal mode
  - [x] 5.11 Add "TEST MODE" badge in ChatInterface header when test mode is active
  - [x] 5.12 Add "Compare with Reference" button in chat messages when in test mode
  - [x] 5.13 Add "Export Results" button in TestModePanel to trigger markdown/CSV export

- [x] 6.0 Implement Cost Tracking & Budget Management
  - [x] 6.1 Create `frontend/lib/cost-calculator.ts` with token counting and pricing functions
  - [x] 6.2 Implement `calculateCost()` function: (promptTokens * inputPricePerMillion / 1000000) + (completionTokens * outputPricePerMillion / 1000000)
  - [x] 6.3 Load model pricing from `config/models.json` and cache in memory
  - [x] 6.4 Create session storage utilities to track cumulative cost across multiple test runs
  - [x] 6.5 Implement `getBudgetStatus()` function that returns current cost, remaining budget, and warning flag
  - [x] 6.6 Add budget check before API calls - disable "Run Test" button if budget exceeded
  - [x] 6.7 Display warning toast/alert when 80% budget threshold ($4.00) is reached
  - [x] 6.8 Implement "Reset Budget" function to clear session storage and start new testing session
  - [x] 6.9 Update BudgetTracker component to show real-time cost updates after each test

- [x] 7.0 Create Results Export & Storage System
  - [x] 7.1 Create `frontend/lib/test-result-exporter.ts` with export functions
  - [x] 7.2 Implement `exportToMarkdown()` function: format test metadata, LLM response, evaluation scores, manual notes into markdown
  - [x] 7.3 Implement `exportToCSV()` function using papaparse: columns for timestamp, model, query, category, 8 criteria scores, cost, tokens, manual rating, notes
  - [x] 7.4 Add file download utilities using browser File API and Blob
  - [x] 7.5 Generate filenames with timestamp: `test-results-YYYY-MM-DD-HHmmss.md` and `.csv`
  - [x] 7.6 Create in-memory test results array to accumulate multiple test runs before export
  - [x] 7.7 Implement "Export Current Test" (single result) and "Export All Tests" (batch) options
  - [x] 7.8 Add function to save files to `/dialog/test-results/` directory (Note: Browser can only download, manual move to directory)
  - [x] 7.9 Include reference output snippet in markdown export for comparison

- [x] 8.0 Integration & Testing
  - [x] 8.1 Wire up TestModePanel to OpenRouterClient: connect "Run Test" button to API call
  - [x] 8.2 Connect API response to test-evaluator: automatically evaluate response and display results
  - [x] 8.3 Integrate cost-calculator with API responses: update budget tracker after each test
  - [x] 8.4 Connect ComparisonView to test scenarios: load reference output for selected scenario
  - [x] 8.5 Test full workflow: select model → select scenario → run test → view evaluation → compare with reference → add notes → export
  - [x] 8.6 Test error handling: invalid API key, network failure, rate limits, budget exceeded
  - [x] 8.7 Test all 6 models with at least 2 different scenarios each
  - [x] 8.8 Validate evaluation accuracy: manually review automated scores for correctness
  - [x] 8.9 Test markdown and CSV export: verify file formats and data completeness
  - [x] 8.10 Test budget tracking: verify cost calculations and warning triggers
  - [x] 8.11 Test custom query input: ensure non-scenario queries work properly
  - [x] 8.12 Fix any bugs discovered during testing
  - [x] 8.13 Update documentation: add README section explaining how to use test mode

---

**Status:** All sub-tasks generated. Ready for implementation.
**Next Step:** Use `/process-task-list` to start implementing tasks one by one.
