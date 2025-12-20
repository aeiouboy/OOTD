/**
 * Cost Calculator and Budget Management
 * Handles token counting, pricing, and budget tracking
 */

import { Model, BudgetStatus, TokenUsage } from './types/test-types';
import modelsConfig from '@/config/models.json';

const DEFAULT_TOTAL_BUDGET = 5.0; // $5 total budget
const WARNING_THRESHOLD = 0.8; // 80% budget usage triggers warning

// Cache for model pricing
let modelPricingCache: Map<string, Model> | null = null;

/**
 * Load and cache model pricing from config
 */
function loadModelPricing(): Map<string, Model> {
  if (modelPricingCache) {
    return modelPricingCache;
  }

  modelPricingCache = new Map();
  modelsConfig.models.forEach(model => {
    modelPricingCache!.set(model.id, model as Model);
  });

  return modelPricingCache;
}

/**
 * Calculate cost for a request
 * Formula: (promptTokens * inputPricePerMillion / 1000000) + (completionTokens * outputPricePerMillion / 1000000)
 */
export function calculateCost(
  modelId: string,
  tokenUsage: TokenUsage
): number {
  const models = loadModelPricing();
  const model = models.get(modelId);

  if (!model) {
    console.warn(`Model ${modelId} not found in pricing config`);
    return 0;
  }

  const inputCost = (tokenUsage.promptTokens * model.inputPricePerMillion) / 1000000;
  const outputCost = (tokenUsage.completionTokens * model.outputPricePerMillion) / 1000000;

  return inputCost + outputCost;
}

/**
 * Get current budget status from session storage
 */
export function getBudgetStatus(totalBudget: number = DEFAULT_TOTAL_BUDGET): BudgetStatus {
  const currentCost = getCurrentCost();
  const remainingBudget = totalBudget - currentCost;
  const percentageUsed = (currentCost / totalBudget) * 100;
  const warningThreshold = percentageUsed >= (WARNING_THRESHOLD * 100);

  return {
    currentCost,
    remainingBudget: Math.max(0, remainingBudget),
    totalBudget,
    percentageUsed: Math.min(100, percentageUsed),
    warningThreshold
  };
}

/**
 * Get current accumulated cost from session storage
 */
export function getCurrentCost(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const saved = sessionStorage.getItem('test-mode-cost');
  return saved ? parseFloat(saved) : 0;
}

/**
 * Add cost to the current session
 */
export function addCost(cost: number): number {
  const currentCost = getCurrentCost();
  const newCost = currentCost + cost;

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('test-mode-cost', newCost.toString());
  }

  return newCost;
}

/**
 * Check if budget has been exceeded
 */
export function isBudgetExceeded(totalBudget: number = DEFAULT_TOTAL_BUDGET): boolean {
  const currentCost = getCurrentCost();
  return currentCost >= totalBudget;
}

/**
 * Check if warning threshold has been reached (80%)
 */
export function isWarningThreshold(totalBudget: number = DEFAULT_TOTAL_BUDGET): boolean {
  const currentCost = getCurrentCost();
  return currentCost >= (totalBudget * WARNING_THRESHOLD);
}

/**
 * Reset budget (clear session storage)
 */
export function resetBudget(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('test-mode-cost');
    sessionStorage.removeItem('test-results');
  }
}

/**
 * Get formatted cost string
 */
export function formatCost(cost: number): string {
  if (cost < 0.001) {
    return `$${(cost * 1000).toFixed(6)}k`; // Display in fractions of cents
  }
  return `$${cost.toFixed(6)}`;
}

/**
 * Estimate cost before making request
 */
export function estimateCost(
  modelId: string,
  estimatedPromptTokens: number,
  estimatedCompletionTokens: number
): number {
  return calculateCost(modelId, {
    promptTokens: estimatedPromptTokens,
    completionTokens: estimatedCompletionTokens,
    totalTokens: estimatedPromptTokens + estimatedCompletionTokens
  });
}

/**
 * Get model by ID
 */
export function getModel(modelId: string): Model | null {
  const models = loadModelPricing();
  return models.get(modelId) || null;
}

/**
 * Get all available models
 */
export function getAllModels(): Model[] {
  return modelsConfig.models as Model[];
}

/**
 * Calculate remaining tests based on average cost
 */
export function estimateRemainingTests(
  averageCostPerTest: number,
  totalBudget: number = DEFAULT_TOTAL_BUDGET
): number {
  const currentCost = getCurrentCost();
  const remainingBudget = totalBudget - currentCost;

  if (remainingBudget <= 0 || averageCostPerTest <= 0) {
    return 0;
  }

  return Math.floor(remainingBudget / averageCostPerTest);
}

/**
 * Save budget configuration
 */
export function saveBudgetConfig(totalBudget: number): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('test-mode-budget', totalBudget.toString());
  }
}

/**
 * Load budget configuration
 */
export function loadBudgetConfig(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_TOTAL_BUDGET;
  }

  const saved = sessionStorage.getItem('test-mode-budget');
  return saved ? parseFloat(saved) : DEFAULT_TOTAL_BUDGET;
}
