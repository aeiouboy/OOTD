/**
 * TypeScript interfaces for LLM Model Testing Integration
 */

export interface Model {
  id: string;
  name: string;
  provider: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  contextWindow: number;
  maxOutputTokens: number;
}

export interface TestScenario {
  id: string;
  occasion: string;
  query: string;
  expectedCategory: 'CLOTHS' | 'OTHER';
  expectedTemplate: string;
  referenceOutput: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface EvaluationScore {
  thaiLanguageTone: number; // 0-10
  categoryIdentification: boolean; // Pass/Fail
  productRecommendationCount: boolean; // Pass/Fail
  centralOnlineLinks: number; // 0-10
  stylingTipsCount: boolean; // Pass/Fail
  responseStructure: number; // 0-10
  overallQuality: number; // Weighted average
}

export interface TestResult {
  id: string;
  timestamp: string;
  model: Model;
  scenario: TestScenario;
  query: string;
  response: string;
  tokenUsage: TokenUsage;
  cost: number;
  responseTime: number; // milliseconds
  evaluationScore: EvaluationScore;
  manualRating?: 'approved' | 'needs_improvement';
  manualNotes?: string;
}

export interface BudgetStatus {
  currentCost: number;
  remainingBudget: number;
  totalBudget: number;
  percentageUsed: number;
  warningThreshold: boolean; // true if >= 80%
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: number;
  };
}
