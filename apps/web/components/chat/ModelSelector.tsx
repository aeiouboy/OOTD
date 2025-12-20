'use client';

/**
 * Model Selector Component
 * Dropdown for selecting LLM models for testing
 */

import React from 'react';
import { Model } from '@/lib/types/test-types';

interface ModelSelectorProps {
  models: Model[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  models,
  selectedModelId,
  onModelChange,
  disabled = false
}: ModelSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="model-select" className="text-sm font-medium">
        Select Model
      </label>
      <select
        id="model-select"
        value={selectedModelId}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled}
        className="px-3 py-2 border rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Choose a model...</option>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} ({model.provider})
          </option>
        ))}
      </select>
    </div>
  );
}
