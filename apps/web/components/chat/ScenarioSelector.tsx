'use client';

/**
 * Scenario Selector Component
 * Dropdown for selecting test scenarios or custom query
 */

import React from 'react';
import { TestScenario } from '@/lib/types/test-types';

interface ScenarioSelectorProps {
  scenarios: TestScenario[];
  selectedScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  disabled?: boolean;
}

export function ScenarioSelector({
  scenarios,
  selectedScenarioId,
  onScenarioChange,
  disabled = false
}: ScenarioSelectorProps) {
  // Group scenarios by occasion
  const groupedScenarios = scenarios.reduce((acc, scenario) => {
    if (!acc[scenario.occasion]) {
      acc[scenario.occasion] = [];
    }
    acc[scenario.occasion].push(scenario);
    return acc;
  }, {} as Record<string, TestScenario[]>);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="scenario-select" className="text-sm font-medium">
        Select Test Scenario
      </label>
      <select
        id="scenario-select"
        value={selectedScenarioId}
        onChange={(e) => onScenarioChange(e.target.value)}
        disabled={disabled}
        className="px-3 py-2 border rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Choose a scenario...</option>
        <option value="custom">Custom Query</option>
        <optgroup label="────────────────"></optgroup>
        {Object.entries(groupedScenarios).map(([occasion, scenarioList]) => (
          <optgroup key={occasion} label={occasion}>
            {scenarioList.map((scenario, idx) => (
              <option key={scenario.id} value={scenario.id}>
                {occasion} {idx + 1}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
