'use client';

/**
 * Comparison View Component
 * Side-by-side comparison of expected vs actual output
 */

import React, { useState } from 'react';

interface ComparisonViewProps {
  referenceOutput: string;
  actualOutput: string;
  onClose: () => void;
  onManualReview?: (rating: 'approved' | 'needs_improvement', notes: string) => void;
}

export function ComparisonView({
  referenceOutput,
  actualOutput,
  onClose,
  onManualReview
}: ComparisonViewProps) {
  const [manualNotes, setManualNotes] = useState('');
  const [rating, setRating] = useState<'approved' | 'needs_improvement' | null>(null);

  const handleSubmitReview = () => {
    if (rating && onManualReview) {
      onManualReview(rating, manualNotes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Output Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="grid md:grid-cols-2 gap-4 p-4">
            {/* Reference Output */}
            <div className="flex flex-col">
              <h3 className="font-semibold mb-2 text-green-700">Reference Output</h3>
              <div className="flex-1 p-4 border rounded-md bg-green-50 whitespace-pre-wrap text-sm overflow-auto">
                {referenceOutput || 'No reference output available'}
              </div>
            </div>

            {/* Actual Output */}
            <div className="flex flex-col">
              <h3 className="font-semibold mb-2 text-blue-700">Actual LLM Output</h3>
              <div className="flex-1 p-4 border rounded-md bg-blue-50 whitespace-pre-wrap text-sm overflow-auto">
                {actualOutput}
              </div>
            </div>
          </div>

          {/* Manual Review Section */}
          {onManualReview && (
            <div className="p-4 border-t bg-gray-50">
              <h3 className="font-semibold mb-3">Manual Review</h3>

              {/* Rating Buttons */}
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => setRating('approved')}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    rating === 'approved'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  ✓ Approved
                </button>
                <button
                  onClick={() => setRating('needs_improvement')}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    rating === 'needs_improvement'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  ⚠ Needs Improvement
                </button>
              </div>

              {/* Notes Textarea */}
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Add notes about this output..."
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
              />

              {/* Submit Button */}
              <button
                onClick={handleSubmitReview}
                disabled={!rating}
                className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
