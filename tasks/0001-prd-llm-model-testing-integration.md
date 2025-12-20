# PRD: LLM Model Testing Integration for Fashion Chat Assistant

## 1. Introduction/Overview

This PRD outlines the development of an LLM model testing system integrated into the existing OOTDay fashion chat assistant. The feature will enable systematic testing and comparison of multiple LLM models (via OpenRouter API) to identify the best-performing model for the fashion assistant use case. The system will test models against the established dialog templates, evaluate responses across multiple criteria, and provide actionable insights for model selection and prompt optimization.

**Problem it solves:** Currently, there is no systematic way to test and compare how different LLM models handle the fashion chat assistant's specific requirements (Thai language tone, category-specific responses, product recommendations, styling tips). Manual testing is time-consuming and lacks objective comparison metrics.

**Goal:** Build an integrated testing interface within the existing chat application that allows interactive, one-at-a-time testing of different LLM models against structured scenarios and custom queries, with comprehensive automated evaluation and manual review capabilities.

## 2. Goals

1. **Model Comparison:** Enable systematic comparison of 6+ LLM models (Gemini, OpenAI GPT-4, GLM 4.6, Claude Sonnet 4.5, Qwen3, DeepSeek) via OpenRouter API
2. **Quality Evaluation:** Provide automated scoring across 8 evaluation criteria plus manual review interface
3. **Time Efficiency:** Reduce model testing time by 80% through structured test scenarios and automated evaluation
4. **Cost Management:** Track API usage and costs with $5 budget limit to prevent overspending
5. **Actionable Insights:** Identify the best-performing model for production deployment and provide insights for prompt/template optimization
6. **Template Compliance:** Validate that models follow the DialogTemplate14-2 requirements consistently

## 3. User Stories

### Primary Users: Product Manager, Developer, QA Engineer

**Story 1: Model Performance Comparison**
As a product manager, I want to test multiple LLM models against the same fashion query so that I can objectively compare which model produces the best fashion recommendations following our template guidelines.

**Story 2: Template Compliance Validation**
As a developer, I want to verify that a specific LLM model correctly identifies category types (CLOTHS vs OTHER) and applies the appropriate response template so that I can ensure production consistency.

**Story 3: Cost-Aware Testing**
As a developer, I want to see real-time API cost tracking during testing so that I can stay within the $5 testing budget and make cost-informed model selection decisions.

**Story 4: Scenario Library Testing**
As a QA engineer, I want to run pre-defined test scenarios covering all 9 occasions (Work, Chill, Wedding, Sport, Travel, Date, Dinner, Café, Party) so that I can comprehensively test model performance across different use cases.

**Story 5: Custom Query Testing**
As a product manager, I want to input custom fashion queries in test mode so that I can test edge cases and specific customer scenarios not covered in the standard test library.

**Story 6: Results Analysis**
As a developer, I want to export test results as markdown and CSV files so that I can share findings with the team and maintain a testing history.

**Story 7: Side-by-Side Comparison**
As a QA engineer, I want to view the expected output from `output_t14-2.md` alongside the LLM's actual output so that I can manually assess quality and identify gaps.

**Story 8: Budget Alert**
As a developer, I want to receive a warning when testing costs approach the $5 budget limit so that I can pause testing before exceeding the budget.

## 4. Functional Requirements

### 4.1 Test Mode Integration
1. The chat interface must include a "Test Mode" toggle that switches between normal chat and testing mode
2. Test mode must be visually distinct (e.g., different header color, "TEST MODE" badge)
3. Test mode must not affect normal chat functionality when disabled
4. Only authorized users should access test mode (consider environment-based toggle for MVP)

### 4.2 Model Selection & Configuration
5. The system must support testing the following models via OpenRouter API:
   - Google Gemini Pro/Flash
   - OpenAI GPT-4/GPT-4 Turbo
   - GLM 4.6
   - Claude Sonnet 4.5
   - Qwen3
   - DeepSeek
6. Users must be able to select one model at a time for testing
7. The system must display current model selection clearly in the UI
8. Model configuration must be stored in a config file for easy updates

### 4.3 Test Scenario Management
9. The system must load test scenarios from the dialog template file (`DialogTemplate14-2.md`)
10. Test scenarios must cover all 9 occasions: Work, Chill Day, Wedding, Sport, Travel, Date, Dinner, Café, Party
11. Each test scenario must include:
    - Customer query
    - Expected category (CLOTHS or OTHER)
    - Expected template type (Template A or Template B)
    - Reference output (from `output_t14-2.md`)
12. Users must be able to select a test scenario from a dropdown/list
13. Users must be able to input custom queries not in the scenario library
14. The system must display the selected scenario's expected output for reference

### 4.4 Test Execution
15. Users must be able to send a test query to the selected LLM model
16. The system must display a loading indicator during API calls
17. The system must handle API errors gracefully with clear error messages
18. The system must display the LLM's response in the chat interface
19. Each test execution must be logged with timestamp, model, query, and response

### 4.5 Automated Evaluation Criteria
20. The system must automatically evaluate each response across the following criteria:

    **A. Thai Language Tone & Style (0-10 score)**
    - Conversational tone (พูดคุยแบบเพื่อนสนิท)
    - Natural Thai language usage
    - Appropriate formality level

    **B. Category Identification (Pass/Fail)**
    - Correctly identifies CLOTHS vs OTHER category
    - Binary check: Pass or Fail

    **C. Product Recommendation Count (Pass/Fail)**
    - For CLOTHS: 3-5 product recommendations present
    - For OTHER: No separate product section
    - Binary check: Pass or Fail

    **D. Central Online Product Links (0-10 score)**
    - For CLOTHS: All products include valid Central Online URLs
    - For OTHER: No product links included
    - Score based on link presence and format

    **E. Styling Tips Count (Pass/Fail)**
    - Response includes 1-3 styling tips as specified
    - Binary check: Pass or Fail

    **F. Response Structure (0-10 score)**
    - Follows Template A format (for CLOTHS) or Template B format (for OTHER)
    - Includes required sections (greeting, products/tips, conclusion)
    - Score based on structural compliance

    **G. Response Time (milliseconds)**
    - Time from API request to response received
    - Display in milliseconds

    **H. Cost per Request (USD)**
    - Calculate based on tokens used and model pricing
    - Display in USD with 4 decimal places

21. The system must display evaluation scores immediately after receiving the response
22. The system must calculate an overall quality score (weighted average of criteria A, D, F)

### 4.6 Manual Review Interface
23. The system must display the LLM response and reference output side-by-side for manual comparison
24. Users must be able to add manual notes/comments to each test result
25. Users must be able to mark a test result as "Approved" or "Needs Improvement"
26. The manual review interface must highlight differences between expected and actual output

### 4.7 Cost & Usage Tracking
27. The system must track cumulative API costs for the current testing session
28. The system must display current cost and remaining budget ($5 limit)
29. The system must show a warning when 80% of budget is reached ($4.00)
30. The system must prevent further testing when budget limit is exceeded
31. The system must allow budget reset for new testing sessions
32. The system must track token usage per request (input tokens + output tokens)

### 4.8 Results Storage & Export
33. The system must save test results to markdown files with format: `test-results-[timestamp].md`
34. The system must export test results to CSV format with all evaluation metrics
35. Markdown output must include:
    - Test metadata (date, model, query)
    - Full LLM response
    - Evaluation scores
    - Manual review notes
36. CSV output must include columns for: timestamp, model, query, category, all 8 criteria scores, cost, tokens, manual rating, notes
37. Files must be saved to `/dialog/test-results/` directory

### 4.9 OpenRouter API Integration
38. The system must use OpenRouter API to access multiple LLM models
39. API credentials must be stored securely (environment variables)
40. The system must handle rate limits and retry failed requests
41. The system must pass the dialog template as system prompt to ensure consistency

## 5. Non-Goals (Out of Scope)

1. **Automated batch testing** - MVP focuses on interactive, one-at-a-time testing (not parallel/batch execution)
2. **Database storage** - MVP uses file-based storage only (markdown + CSV)
3. **Advanced analytics dashboard** - Beyond basic scoring and comparison
4. **Model fine-tuning** - Only testing existing models via API, no training/fine-tuning
5. **Multi-user collaboration** - Single user testing only in MVP
6. **Historical trend analysis** - No time-series comparison of model performance over weeks/months
7. **A/B testing with real users** - Testing is internal only, not exposed to end users
8. **Custom model integration** - Only OpenRouter-supported models in MVP
9. **Automated prompt optimization** - Manual prompt refinement based on insights, not automated

## 6. Design Considerations

### 6.1 UI/UX Requirements
- Test mode must be toggled via a switch/button in the ChatInterface header
- Test controls panel must include:
  - Model selector dropdown
  - Scenario selector dropdown
  - Custom query input field
  - "Run Test" button
  - Budget tracker display
  - Export results button
- Evaluation results must be displayed in a collapsible panel below the chat response
- Side-by-side comparison view must be accessible via a "Compare with Reference" button
- Visual indicators for Pass/Fail criteria (green checkmark / red X)
- Color-coded scoring (0-3: red, 4-6: yellow, 7-10: green)

### 6.2 Component Structure
```
components/chat/
  ├── ChatInterface.tsx (existing - add test mode toggle)
  ├── TestModePanel.tsx (new - test controls)
  ├── ModelSelector.tsx (new - dropdown for model selection)
  ├── ScenarioSelector.tsx (new - test scenario selection)
  ├── EvaluationResults.tsx (new - display automated scores)
  ├── ComparisonView.tsx (new - side-by-side comparison)
  └── BudgetTracker.tsx (new - cost tracking display)

lib/
  ├── openrouter-client.ts (new - API integration)
  ├── test-evaluator.ts (new - automated evaluation logic)
  ├── test-scenarios.ts (new - load and manage test scenarios)
  └── cost-calculator.ts (new - token and cost calculation)
```

### 6.3 Styling
- Use existing Tailwind CSS and shadcn/ui components for consistency
- Test mode header: Orange/amber background to distinguish from normal mode
- Evaluation panel: Card component with section dividers for each criterion
- Budget tracker: Progress bar component with warning states

## 7. Technical Considerations

### 7.1 OpenRouter API Integration
- API Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Authentication: Bearer token from environment variable `OPENROUTER_API_KEY`
- Model identifiers format: `google/gemini-pro`, `openai/gpt-4`, `anthropic/claude-3.5-sonnet`, etc.
- System prompt must include full DialogTemplate14-2 requirements
- Response format: JSON with `choices[0].message.content`

### 7.2 Cost Calculation
- OpenRouter provides usage data in response: `usage.prompt_tokens` and `usage.completion_tokens`
- Model pricing must be fetched from OpenRouter pricing API or stored in config
- Cost calculation: `(prompt_tokens * input_price_per_1k / 1000) + (completion_tokens * output_price_per_1k / 1000)`
- Budget tracking: Maintain cumulative cost in session storage

### 7.3 Evaluation Logic
- **Thai language evaluation:** Use keyword/pattern matching for conversational markers (ค่ะ, นะคะ, เลย, etc.) and scoring rubric
- **Category identification:** Parse response structure to detect Template A vs B patterns
- **Product count:** Count occurrences of product sections (💰, 🔗 patterns)
- **Link validation:** Regex match for `central.co.th` URLs
- **Styling tips count:** Count bullet points or numbered tips sections
- **Response structure:** Template matching with required sections
- **Similarity scoring (manual review aid):** Optional - use string similarity algorithms (Levenshtein distance) to compare with reference output

### 7.4 Error Handling
- Network errors: Display user-friendly message, allow retry
- API rate limits: Implement exponential backoff
- Budget exceeded: Disable "Run Test" button with clear message
- Invalid API key: Show configuration error with setup instructions
- Timeout errors: Set 30-second timeout for API calls

### 7.5 Performance Considerations
- Lazy load test scenarios to reduce initial bundle size
- Cache model pricing data to reduce API calls
- Implement request debouncing for custom queries
- Use React.memo for expensive evaluation result renderings

## 8. Success Metrics

### Primary Metrics
1. **Model Identification Success:** Successfully identify the best-performing model for production within 2 weeks of implementation
2. **Testing Efficiency:** Reduce time spent on model evaluation from ~8 hours (manual) to ~2 hours (with tool) - 75% reduction
3. **Budget Compliance:** Complete comprehensive testing across 6 models and 9+ scenarios within $5 budget

### Secondary Metrics
4. **Template Compliance Rate:** Achieve >80% pass rate on category identification and template structure for selected model
5. **Cost Insights:** Identify model with best quality-to-cost ratio
6. **Prompt Optimization:** Generate at least 3 actionable insights for improving dialog template based on test results
7. **Test Coverage:** Execute minimum 54 tests (6 models × 9 scenarios) during evaluation period

### Quality Indicators
8. **Evaluation Accuracy:** Manual review confirms automated scoring accuracy >90%
9. **User Satisfaction:** Developer/PM feedback rates tool as "useful" or "very useful"
10. **Adoption:** Tool is used for all future model evaluation decisions

## 9. Open Questions

### Technical Questions
1. **Token counting accuracy:** Should we implement client-side token counting (using tiktoken) or rely solely on OpenRouter's usage reporting?
2. **Prompt versioning:** How should we handle different versions of the dialog template during testing? Should test results include template version?
3. **Caching strategy:** Should we cache test responses to avoid duplicate API calls for the same model+query combination?

### Product Questions
4. **Access control:** Should test mode be password-protected or just hidden in production builds?
5. **Reference output updates:** When `output_t14-2.md` is updated, should we maintain historical versions for comparison?
6. **Test scenario expansion:** Should we support creating/editing test scenarios via UI, or keep them file-based only?

### Business Questions
7. **Budget allocation:** Is $5 sufficient for comprehensive testing, or should we plan for additional budget if more extensive testing is needed?
8. **Model selection criteria:** If two models score similarly, what's the priority order: cost < response time < quality, or quality > cost > response time?
9. **Ongoing testing:** After initial model selection, how frequently should we re-run tests to monitor model performance over time?

---

## Appendix A: Evaluation Criteria Rubric

### A. Thai Language Tone & Style (0-10)
- **10:** Perfect conversational Thai, natural friend-like tone, appropriate ค่ะ/ครับ usage
- **7-9:** Good conversational tone with minor formality issues
- **4-6:** Understandable but somewhat formal or awkward phrasing
- **1-3:** Poor Thai language quality, overly formal or unnatural
- **0:** Not in Thai or completely inappropriate tone

### D. Central Online Product Links (0-10)
- **10 (CLOTHS):** All 3-5 products have valid central.co.th links in correct format
- **10 (OTHER):** No product links present (correct for OTHER category)
- **7-9:** Most links present but 1-2 missing or incorrect format
- **4-6:** Only half of expected links present
- **1-3:** Few or malformed links
- **0:** No links or links to wrong domain

### F. Response Structure (0-10)
- **10:** Perfect template compliance with all required sections in correct order
- **7-9:** All sections present but minor ordering/formatting issues
- **4-6:** Missing 1-2 required sections
- **1-3:** Significant structural deviations from template
- **0:** Does not follow template at all

---

## Appendix B: Model Configuration Example

```json
{
  "models": [
    {
      "id": "google/gemini-pro-1.5",
      "name": "Gemini Pro 1.5",
      "provider": "Google",
      "inputPricePerMillion": 1.25,
      "outputPricePerMillion": 5.00
    },
    {
      "id": "openai/gpt-4-turbo",
      "name": "GPT-4 Turbo",
      "provider": "OpenAI",
      "inputPricePerMillion": 10.00,
      "outputPricePerMillion": 30.00
    },
    {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Claude Sonnet 4.5",
      "provider": "Anthropic",
      "inputPricePerMillion": 3.00,
      "outputPricePerMillion": 15.00
    }
  ],
  "budget": {
    "limit": 5.00,
    "warningThreshold": 0.8
  }
}
```

---

**Document Version:** 1.0
**Created:** 2025-10-11
**Author:** OOTDay Development Team
**Status:** Draft for Review
