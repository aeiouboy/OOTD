'use client';

/**
 * Interactive Test Mode Component
 * Main container for multi-panel LLM model testing with interactive chat
 */

import React, { useState, useEffect } from 'react';
import { InteractiveChatPanel } from './InteractiveChatPanel';
import type { Model } from '@/lib/types/test-types';
import type { PanelConversation } from '@/lib/types/interactive-test-types';
import type { EnhancedProduct } from '@/lib/types/product-types';
import { loadProductsForTestMode, getProductStats } from '@/lib/test-mode-product-loader';
import modelsConfig from '@/config/models.json';
import { Plus, Download, RotateCcw, Package } from 'lucide-react';

const PANEL_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444'  // red
];

const MAX_PANELS = 4;
const DEFAULT_BUDGET = Infinity;

interface InteractiveTestModeProps {
  onExport?: (data: Record<string, unknown>) => void;
}

export function InteractiveTestMode({ onExport }: InteractiveTestModeProps) {
  const [models] = useState<Model[]>(modelsConfig.models);
  const [panels, setPanels] = useState<PanelConversation[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalBudget] = useState(DEFAULT_BUDGET);
  const [productCatalog, setProductCatalog] = useState<EnhancedProduct[]>([]);
  const [useProductData, setUseProductData] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Load product catalog on mount
  useEffect(() => {
    loadProductsForTestMode()
      .then(products => {
        setProductCatalog(products);
        setIsLoadingProducts(false);

        // Log stats for debugging
        if (products.length > 0) {
          const stats = getProductStats(products);
          console.log('Product catalog loaded:', stats);
        }
      })
      .catch(error => {
        console.error('Failed to load product catalog:', error);
        setIsLoadingProducts(false);
      });
  }, []);

  // Load saved data on mount
  useEffect(() => {
    const savedPanels = sessionStorage.getItem('interactive-test-panels');
    const savedCost = sessionStorage.getItem('interactive-test-cost');

    if (savedPanels) {
      try {
        const parsedPanels = JSON.parse(savedPanels);
        // Convert timestamp strings back to Date objects
        parsedPanels.forEach((panel: PanelConversation) => {
          panel.messages.forEach(msg => {
            msg.timestamp = new Date(msg.timestamp);
          });
        });
        setPanels(parsedPanels);
      } catch (e) {
        console.error('Failed to load saved panels:', e);
      }
    }

    if (savedCost) {
      setTotalCost(parseFloat(savedCost));
    }
  }, []);

  // Save panels and cost whenever they change
  useEffect(() => {
    if (panels.length > 0) {
      sessionStorage.setItem('interactive-test-panels', JSON.stringify(panels));
    }
  }, [panels]);

  useEffect(() => {
    sessionStorage.setItem('interactive-test-cost', totalCost.toString());
  }, [totalCost]);

  const handleAddPanel = () => {
    if (panels.length >= MAX_PANELS) return;

    const newPanel: PanelConversation = {
      panelId: `panel-${Date.now()}`,
      modelId: '',
      messages: [],
      isTyping: false,
      totalCost: 0,
      totalTokens: 0
    };

    setPanels([...panels, newPanel]);
  };

  const handleRemovePanel = (panelId: string) => {
    const panel = panels.find(p => p.panelId === panelId);
    if (panel) {
      // Subtract panel cost from total
      setTotalCost(prev => Math.max(0, prev - panel.totalCost));
    }
    setPanels(panels.filter(p => p.panelId !== panelId));
  };

  const handleUpdateConversation = (panelId: string, updatedConversation: PanelConversation) => {
    setPanels(prevPanels => {
      const oldPanel = prevPanels.find(p => p.panelId === panelId);
      const costDiff = updatedConversation.totalCost - (oldPanel?.totalCost || 0);

      // Update total cost
      setTotalCost(prev => prev + costDiff);

      return prevPanels.map(p =>
        p.panelId === panelId ? updatedConversation : p
      );
    });
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all panels and budget? This cannot be undone.')) {
      setPanels([]);
      setTotalCost(0);
      sessionStorage.removeItem('interactive-test-panels');
      sessionStorage.removeItem('interactive-test-cost');
    }
  };

  const handleExportAll = () => {
    const exportData: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      totalCost,
      totalBudget,
      panels: panels.map(panel => ({
        panelId: panel.panelId,
        model: models.find(m => m.id === panel.modelId),
        messages: panel.messages,
        totalCost: panel.totalCost,
        totalTokens: panel.totalTokens
      }))
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interactive-test-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onExport) {
      onExport(exportData);
    }
  };

  const isUnlimited = totalBudget === Infinity || !isFinite(totalBudget);
  const remainingBudget = isUnlimited ? Infinity : totalBudget - totalCost;
  const percentageUsed = isUnlimited ? 0 : (totalCost / totalBudget) * 100;
  const isBudgetExceeded = !isUnlimited && percentageUsed >= 100;
  const isWarningThreshold = !isUnlimited && percentageUsed >= 80;

  // Calculate grid layout based on panel count and screen size
  const getGridLayout = () => {
    switch (panels.length) {
      case 1:
        return {
          gridClass: 'grid-cols-1',
          minHeight: 'min-h-[900px]'
        };
      case 2:
        return {
          gridClass: 'grid-cols-1 xl:grid-cols-2',
          minHeight: 'min-h-[800px]'
        };
      case 3:
        return {
          gridClass: 'grid-cols-1 xl:grid-cols-3',
          minHeight: 'min-h-[750px]'
        };
      case 4:
        return {
          gridClass: 'grid-cols-1 xl:grid-cols-2',
          minHeight: 'min-h-[700px]'
        };
      default:
        return {
          gridClass: 'grid-cols-1',
          minHeight: 'min-h-[900px]'
        };
    }
  };

  const gridLayout = getGridLayout();

  return (
    <div className="flex flex-col h-full bg-orange-50">
      {/* Header */}
      <div className="border-b bg-white px-2 md:px-4 py-2 md:py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="px-2 md:px-3 py-0.5 md:py-1 bg-orange-500 text-white font-bold rounded-md text-xs md:text-sm">
              INTERACTIVE TEST
            </span>
            <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
              Multi-Panel Comparison
            </span>
            {/* Product Data Indicator */}
            {productCatalog.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                <Package className="w-3 h-3" />
                <span>{productCatalog.length} products</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 w-full md:w-auto">
            <button
              onClick={handleAddPanel}
              disabled={panels.length >= MAX_PANELS}
              className="flex-1 md:flex-none px-2 md:px-3 py-1 md:py-1.5 bg-blue-600 text-white text-xs md:text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 md:gap-1.5"
            >
              <Plus className="w-3 md:w-4 h-3 md:h-4" />
              <span className="hidden sm:inline">Add Panel</span> ({panels.length}/{MAX_PANELS})
            </button>
            {panels.length > 0 && (
              <>
                <button
                  onClick={handleExportAll}
                  className="flex-1 md:flex-none px-2 md:px-3 py-1 md:py-1.5 border border-green-600 text-green-600 text-xs md:text-sm rounded-md hover:bg-green-50 flex items-center justify-center gap-1 md:gap-1.5"
                >
                  <Download className="w-3 md:w-4 h-3 md:h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleResetAll}
                  className="flex-1 md:flex-none px-2 md:px-3 py-1 md:py-1.5 border border-red-600 text-red-600 text-xs md:text-sm rounded-md hover:bg-red-50 flex items-center justify-center gap-1 md:gap-1.5"
                >
                  <RotateCcw className="w-3 md:w-4 h-3 md:h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Budget Tracker */}
        <div className="bg-gray-50 rounded-lg p-2 md:p-3 border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs md:text-sm font-medium text-gray-700">Budget</span>
            <div className="text-right">
              <div className="text-xs md:text-sm">
                <span className={`font-bold ${isBudgetExceeded ? 'text-red-600' : isWarningThreshold ? 'text-yellow-600' : 'text-gray-900'}`}>
                  ${totalCost.toFixed(6)}
                </span>
                <span className="text-gray-500">
                  {isUnlimited ? ' / ∞ Unlimited' : ` / $${totalBudget.toFixed(2)}`}
                </span>
              </div>
              <div className="text-[10px] md:text-xs text-gray-500">
                {isUnlimited ? '∞ Unlimited' : `$${remainingBudget.toFixed(6)}`} left
              </div>
            </div>
          </div>
          {!isUnlimited && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isBudgetExceeded
                    ? 'bg-red-600'
                    : isWarningThreshold
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          )}
          {isUnlimited && (
            <div className="mt-1.5 text-[10px] md:text-xs text-green-600 font-medium">
              ✓ Unlimited budget enabled
            </div>
          )}
          {isBudgetExceeded && !isUnlimited && (
            <div className="mt-1.5 text-[10px] md:text-xs text-red-600 font-medium">
              Budget exceeded! Reset to continue.
            </div>
          )}
          {isWarningThreshold && !isBudgetExceeded && !isUnlimited && (
            <div className="mt-1.5 text-[10px] md:text-xs text-yellow-600 font-medium">
              Warning: 80% budget used
            </div>
          )}
        </div>
      </div>

      {/* Panels Grid */}
      <div className="flex-1 overflow-auto p-2 md:p-4">
        {panels.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-gray-400 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Test Panels Yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Add up to 4 panels to test and compare different models side-by-side with interactive conversations.
              </p>
              <button
                onClick={handleAddPanel}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Your First Panel
              </button>
            </div>
          </div>
        ) : (
          <div className={`grid ${gridLayout.gridClass} gap-2 md:gap-4 auto-rows-fr`}>
            {panels.map((panel, index) => (
              <div key={panel.panelId} className={`${gridLayout.minHeight} flex flex-col`}>
                <InteractiveChatPanel
                  panelId={panel.panelId}
                  conversation={panel}
                  models={models}
                  color={PANEL_COLORS[index % PANEL_COLORS.length]}
                  productCatalog={productCatalog}
                  useProductData={useProductData}
                  onUpdateConversation={handleUpdateConversation}
                  onRemovePanel={handleRemovePanel}
                  disabled={isBudgetExceeded}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
