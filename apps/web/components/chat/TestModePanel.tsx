'use client';

/**
 * Test Mode Panel Component
 * Main control panel for LLM model testing
 */

import React, { useState, useEffect } from 'react';
import { ModelSelector } from './ModelSelector';
import { ScenarioSelector } from './ScenarioSelector';
import { BudgetTracker } from './BudgetTracker';
import { EvaluationResults } from './EvaluationResults';
import { ComparisonView } from './ComparisonView';
import { Model, TestScenario, TestResult, BudgetStatus } from '@/lib/types/test-types';
import { getTestScenarios, createCustomScenario } from '@/lib/test-scenarios';
import { OpenRouterClient } from '@/lib/openrouter-client';
import { evaluateResponse } from '@/lib/test-evaluator';
import modelsConfig from '@/config/models.json';

interface TestModePanelProps {
  onTestComplete?: (result: TestResult) => void;
  onExport?: (results: TestResult[]) => void;
}

export function TestModePanel({ onTestComplete, onExport }: TestModePanelProps) {
  const [models] = useState<Model[]>(modelsConfig.models);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus>({
    currentCost: 0,
    remainingBudget: Infinity,
    totalBudget: Infinity,
    percentageUsed: 0,
    warningThreshold: false
  });
  const [showComparison, setShowComparison] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load scenarios on mount
  useEffect(() => {
    setScenarios(getTestScenarios());
  }, []);

  // Load budget from session storage
  useEffect(() => {
    const savedCost = sessionStorage.getItem('test-mode-cost');
    if (savedCost) {
      const cost = parseFloat(savedCost);
      updateBudgetStatus(cost);
    }
  }, []);

  const updateBudgetStatus = (currentCost: number) => {
    const totalBudget = Infinity;
    const remaining = Infinity;
    const percentage = 0;

    setBudgetStatus({
      currentCost,
      remainingBudget: remaining,
      totalBudget,
      percentageUsed: percentage,
      warningThreshold: false
    });
  };

  const handleRunTest = async () => {
    // Validation
    if (!selectedModelId) {
      setError('Please select a model');
      return;
    }

    if (!selectedScenarioId && !customQuery) {
      setError('Please select a scenario or enter a custom query');
      return;
    }

    if (budgetStatus.percentageUsed >= 100) {
      setError('Budget exceeded. Please reset budget to continue testing.');
      return;
    }

    setError(null);
    setIsRunning(true);

    try {
      // Get scenario or create custom one
      let scenario: TestScenario;
      if (selectedScenarioId === 'custom' || customQuery) {
        scenario = createCustomScenario(customQuery);
      } else {
        const foundScenario = scenarios.find(s => s.id === selectedScenarioId);
        if (!foundScenario) {
          throw new Error('Scenario not found');
        }
        scenario = foundScenario;
      }

      // Get selected model
      const model = models.find(m => m.id === selectedModelId);
      if (!model) {
        throw new Error('Model not found');
      }

      // Initialize OpenRouter client
      const client = new OpenRouterClient();

      // Send request
      const result = await client.sendChatCompletion({
        modelId: model.id,
        systemPrompt: '',
        userMessage: scenario.query
      });

      // Calculate cost
      const cost =
        (result.tokenUsage.promptTokens * model.inputPricePerMillion) / 1000000 +
        (result.tokenUsage.completionTokens * model.outputPricePerMillion) / 1000000;

      // Update budget
      const newCost = budgetStatus.currentCost + cost;
      sessionStorage.setItem('test-mode-cost', newCost.toString());
      updateBudgetStatus(newCost);

      // Evaluate response
      const evaluation = evaluateResponse(result.content, scenario);

      // Create test result
      const testResult: TestResult = {
        id: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        model,
        scenario,
        query: scenario.query,
        response: result.content,
        tokenUsage: result.tokenUsage,
        cost,
        responseTime: result.responseTime,
        evaluationScore: evaluation.scores
      };

      setCurrentResult(testResult);
      setAllResults(prev => [...prev, testResult]);

      if (onTestComplete) {
        onTestComplete(testResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetBudget = () => {
    sessionStorage.removeItem('test-mode-cost');
    updateBudgetStatus(0);
    setAllResults([]);
    setCurrentResult(null);
  };

  const handleExportResults = () => {
    if (onExport && allResults.length > 0) {
      onExport(allResults);
    }
  };

  const handleManualReview = (
    rating: 'approved' | 'needs_improvement',
    notes: string
  ) => {
    if (currentResult) {
      const updatedResult = {
        ...currentResult,
        manualRating: rating,
        manualNotes: notes
      };
      setCurrentResult(updatedResult);
      setShowComparison(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
      {/* Test Mode Header */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-orange-500 text-white font-bold rounded-md text-sm">
          TEST MODE
        </span>
        <span className="text-sm text-gray-600">
          LLM Model Testing Interface
        </span>
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <ModelSelector
          models={models}
          selectedModelId={selectedModelId}
          onModelChange={setSelectedModelId}
          disabled={isRunning}
        />

        <ScenarioSelector
          scenarios={scenarios}
          selectedScenarioId={selectedScenarioId}
          onScenarioChange={setSelectedScenarioId}
          disabled={isRunning}
        />
      </div>

      {/* Custom Query Input */}
      {(selectedScenarioId === 'custom' || customQuery) && (
        <div className="flex flex-col gap-2">
          <label htmlFor="custom-query" className="text-sm font-medium">
            Custom Query
          </label>
          <textarea
            id="custom-query"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Enter your custom query here..."
            className="p-3 border rounded-md resize-none"
            rows={3}
            disabled={isRunning}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleRunTest}
          disabled={isRunning || budgetStatus.percentageUsed >= 100}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isRunning ? 'Running Test...' : 'Run Test'}
        </button>

        {currentResult && (
          <button
            onClick={() => setShowComparison(true)}
            className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
          >
            Compare with Reference
          </button>
        )}

        {allResults.length > 0 && (
          <button
            onClick={handleExportResults}
            className="px-6 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
          >
            Export Results ({allResults.length})
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Budget Tracker */}
      <BudgetTracker budgetStatus={budgetStatus} onReset={handleResetBudget} />

      {/* Evaluation Results */}
      {currentResult && (
        <div className="space-y-4">
          <EvaluationResults
            scores={currentResult.evaluationScore}
            details={{
              thaiToneDetails: `Score: ${currentResult.evaluationScore.thaiLanguageTone}/10`,
              categoryDetails: currentResult.evaluationScore.categoryIdentification ? '✓ PASS' : '✗ FAIL',
              productCountDetails: currentResult.evaluationScore.productRecommendationCount ? '✓ PASS' : '✗ FAIL',
              linksDetails: `Score: ${currentResult.evaluationScore.centralOnlineLinks}/10`,
              tipsDetails: currentResult.evaluationScore.stylingTipsCount ? '✓ PASS' : '✗ FAIL',
              structureDetails: `Score: ${currentResult.evaluationScore.responseStructure}/10`
            }}
          />

          {/* Response Preview */}
          <div className="border rounded-md">
            <div className="px-4 py-3 bg-gray-100 font-semibold">
              LLM Response
            </div>
            <div className="p-4 bg-white whitespace-pre-wrap text-sm max-h-96 overflow-auto">
              {currentResult.response}
            </div>
          </div>

          {/* Test Metadata */}
          <div className="text-xs text-gray-600 space-y-1">
            <div>Model: {currentResult.model.name}</div>
            <div>Tokens: {currentResult.tokenUsage.totalTokens} (Prompt: {currentResult.tokenUsage.promptTokens}, Completion: {currentResult.tokenUsage.completionTokens})</div>
            <div>Cost: ${currentResult.cost.toFixed(6)}</div>
            <div>Response Time: {currentResult.responseTime}ms</div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && currentResult && (
        <ComparisonView
          referenceOutput={currentResult.scenario.referenceOutput}
          actualOutput={currentResult.response}
          onClose={() => setShowComparison(false)}
          onManualReview={handleManualReview}
        />
      )}
    </div>
  );
}
