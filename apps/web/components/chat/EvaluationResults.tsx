'use client';

/**
 * Evaluation Results Component
 * Displays evaluation scores with color-coded indicators
 */

import React, { useState } from 'react';
import { EvaluationScore } from '@/lib/types/test-types';

interface EvaluationResultsProps {
  scores: EvaluationScore;
  details?: {
    thaiToneDetails: string;
    categoryDetails: string;
    productCountDetails: string;
    linksDetails: string;
    tipsDetails: string;
    structureDetails: string;
  };
}

export function EvaluationResults({ scores, details }: EvaluationResultsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getPassFailColor = (passed: boolean) => {
    return passed ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 transition flex items-center justify-between"
      >
        <h3 className="font-semibold">Evaluation Results</h3>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Overall Quality */}
          <div className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Overall Quality</span>
              <span className={`px-3 py-1 rounded-full font-bold ${getScoreColor(scores.overallQuality)}`}>
                {scores.overallQuality.toFixed(1)} / 10
              </span>
            </div>
          </div>

          {/* Individual Scores */}
          <div className="space-y-3">
            {/* Thai Language Tone */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm">Thai Language Tone & Style</div>
                {details && <div className="text-xs text-gray-600 mt-1">{details.thaiToneDetails}</div>}
              </div>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(scores.thaiLanguageTone)}`}>
                {scores.thaiLanguageTone} / 10
              </span>
            </div>

            {/* Category Identification */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm">Category Identification</div>
                {details && <div className="text-xs text-gray-600 mt-1">{details.categoryDetails}</div>}
              </div>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${getPassFailColor(scores.categoryIdentification)}`}>
                {scores.categoryIdentification ? '✓ PASS' : '✗ FAIL'}
              </span>
            </div>

            {/* Product Recommendation Count */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm">Product Recommendation Count</div>
                {details && <div className="text-xs text-gray-600 mt-1">{details.productCountDetails}</div>}
              </div>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${getPassFailColor(scores.productRecommendationCount)}`}>
                {scores.productRecommendationCount ? '✓ PASS' : '✗ FAIL'}
              </span>
            </div>

            {/* Central Online Links */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm">Central Online Links</div>
                {details && <div className="text-xs text-gray-600 mt-1">{details.linksDetails}</div>}
              </div>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(scores.centralOnlineLinks)}`}>
                {scores.centralOnlineLinks} / 10
              </span>
            </div>

            {/* Styling Tips Count */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm">Styling Tips Count</div>
                {details && <div className="text-xs text-gray-600 mt-1">{details.tipsDetails}</div>}
              </div>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${getPassFailColor(scores.stylingTipsCount)}`}>
                {scores.stylingTipsCount ? '✓ PASS' : '✗ FAIL'}
              </span>
            </div>

            {/* Response Structure */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm">Response Structure</div>
                {details && <div className="text-xs text-gray-600 mt-1">{details.structureDetails}</div>}
              </div>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(scores.responseStructure)}`}>
                {scores.responseStructure} / 10
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
