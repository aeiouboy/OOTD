'use client';

/**
 * Interactive Chat Panel Component
 * Individual panel for multi-model testing with real-time chat interface
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Model } from '@/lib/types/test-types';
import type { ConversationMessage, PanelConversation } from '@/lib/types/interactive-test-types';
import type { EnhancedProduct } from '@/lib/types/product-types';
import { OpenRouterClient } from '@/lib/openrouter-client';
import { filterProductsByQuery } from '@/lib/test-mode-product-loader';
import { serializeProductsForAI } from '@/lib/utils/product-context-serializer';
import { Send, Trash2, X } from 'lucide-react';

/**
 * Helper function to render text with clickable URLs
 */
function renderTextWithLinks(text: string) {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

interface InteractiveChatPanelProps {
  panelId: string;
  conversation: PanelConversation;
  models: Model[];
  color: string;
  productCatalog?: EnhancedProduct[]; // Product data for recommendations
  useProductData?: boolean; // Toggle product context
  onUpdateConversation: (panelId: string, conversation: PanelConversation) => void;
  onRemovePanel: (panelId: string) => void;
  disabled?: boolean; // When budget exceeded
}

export function InteractiveChatPanel({
  panelId,
  conversation,
  models,
  color,
  productCatalog = [],
  useProductData = true,
  onUpdateConversation,
  onRemovePanel,
  disabled = false
}: InteractiveChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedModel = models.find(m => m.id === conversation.modelId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleModelChange = (modelId: string) => {
    onUpdateConversation(panelId, {
      ...conversation,
      modelId
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || conversation.isTyping || disabled) return;

    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    // Update conversation with user message and typing state
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      isTyping: true
    };
    onUpdateConversation(panelId, updatedConversation);
    setInputValue('');

    try {
      // Filter products based on user query if product data enabled
      let productContext = undefined;
      if (useProductData && productCatalog.length > 0) {
        // Combine ALL user messages for complete context extraction
        const allUserMessages = [...conversation.messages, userMessage]
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content)
          .join(' ');

        console.log('[DEBUG] Combined user query:', allUserMessages);

        // Import extractQueryContext for debugging
        const { extractQueryContext } = await import('@/lib/test-mode-product-loader');
        const queryContext = extractQueryContext(allUserMessages);
        console.log('[DEBUG] ========================================');
        console.log('[DEBUG] EXTRACTED CONTEXT:');
        console.log('[DEBUG]   Gender:', queryContext.gender);
        console.log('[DEBUG]   Occasion:', queryContext.occasion);
        console.log('[DEBUG]   Budget:', queryContext.budget);
        console.log('[DEBUG] ========================================');

        const filteredProducts = filterProductsByQuery(
          productCatalog,
          allUserMessages, // Use accumulated context, not just current message
          20 // Limit to 20 products for token efficiency
        );

        console.log('[DEBUG] ========================================');
        console.log('[DEBUG] FILTERING RESULTS:');
        console.log('[DEBUG]   Total catalog:', productCatalog.length);
        console.log('[DEBUG]   Filtered count:', filteredProducts.length);
        console.log('[DEBUG]   Extracted gender:', queryContext.gender);
        console.log('[DEBUG] ========================================');
        console.log('[DEBUG] FIRST 5 FILTERED PRODUCTS:');
        filteredProducts.slice(0, 5).forEach((p, idx) => {
          console.log(`[DEBUG]   ${idx + 1}. ${p.name?.en || 'N/A'}`);
          console.log(`[DEBUG]      Brand: ${p.brand || 'N/A'}`);
          console.log(`[DEBUG]      Gender: ${p.classification?.gender || 'N/A'}`);
          console.log(`[DEBUG]      Price: ${p.pricing?.currentPrice || 0} THB`);
          console.log(`[DEBUG]      URL: ${p.centralIntegration?.productUrl || 'N/A'}`);
        });
        console.log('[DEBUG] ========================================');

        if (filteredProducts.length > 0) {
          productContext = serializeProductsForAI(filteredProducts, 20);
          productContext.metadata = {
            occasion: allUserMessages.toLowerCase().includes('work') ? 'work' :
                     allUserMessages.toLowerCase().includes('party') ? 'party' : undefined,
          };

          // DEBUG: Log serialized product context sent to LLM
          console.log('[DEBUG] ========================================');
          console.log('[DEBUG] PRODUCT CONTEXT SENT TO LLM:');
          console.log('[DEBUG]   Total products:', productContext.totalCount);
          console.log('[DEBUG]   Products in context:', productContext.products.length);
          console.log('[DEBUG] ========================================');
          console.log('[DEBUG] FIRST 3 PRODUCTS IN SERIALIZED CONTEXT:');
          productContext.products.slice(0, 3).forEach((p, idx) => {
            console.log(`[DEBUG]   ${idx + 1}. ${p.name}`);
            console.log(`[DEBUG]      Brand: ${p.brand}`);
            console.log(`[DEBUG]      Price: ${p.price} THB`);
            console.log(`[DEBUG]      Gender: ${p.gender}`);
            console.log(`[DEBUG]      URL: ${p.url}`);
          });
          console.log('[DEBUG] ========================================');
          console.log('[DEBUG] FULL SERIALIZED CONTEXT (first 500 chars):');
          console.log('[DEBUG]', JSON.stringify(productContext, null, 2).substring(0, 500) + '...');
          console.log('[DEBUG] ========================================');
        } else {
          console.log('[DEBUG] ⚠️ WARNING: No products filtered! ProductContext will be undefined.');
        }
      }

      // Call LLM with default System Prompt v2.2.1 (with Context Awareness)
      // Don't pass systemPrompt parameter - let OpenRouterClient use default
      const client = new OpenRouterClient();

      // Convert conversation messages to format expected by OpenRouter client
      const conversationHistory = conversation.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const result = await client.sendChatCompletion({
        modelId: conversation.modelId,
        // systemPrompt not specified - uses default System Prompt v2.2.1 with:
        // - MAX 2 clarifications rule
        // - Loop prevention guardrails
        // - Template A/B enforcement
        // - Context awareness (NEW!)
        userMessage: inputValue.trim(),
        conversationHistory, // Pass full conversation history for context awareness
        productContext // Pass product data if available
      });

      // Calculate cost
      const model = models.find(m => m.id === conversation.modelId);
      const cost = model
        ? (result.tokenUsage.promptTokens * model.inputPricePerMillion) / 1000000 +
          (result.tokenUsage.completionTokens * model.outputPricePerMillion) / 1000000
        : 0;

      // Create assistant message
      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
        tokenUsage: result.tokenUsage,
        cost,
        responseTime: result.responseTime
      };

      // Update conversation with assistant message
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        isTyping: false,
        totalCost: conversation.totalCost + cost,
        totalTokens: conversation.totalTokens + result.tokenUsage.totalTokens
      };

      onUpdateConversation(panelId, finalConversation);
    } catch (error) {
      // Add error message
      const errorMessage: ConversationMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: new Date()
      };

      const errorConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage],
        isTyping: false
      };

      onUpdateConversation(panelId, errorConversation);
    }
  };

  const handleClearConversation = () => {
    onUpdateConversation(panelId, {
      ...conversation,
      messages: [],
      totalCost: 0,
      totalTokens: 0
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="flex flex-col h-full border-2 rounded-lg overflow-hidden bg-white"
      style={{ borderColor: color }}
    >
      {/* Panel Header */}
      <div className="px-2 py-1.5 border-b flex items-center justify-between gap-2" style={{ backgroundColor: `${color}15` }}>
        <div className="flex-1 min-w-0">
          <select
            value={conversation.modelId}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={conversation.isTyping}
            className="w-full text-[10px] md:text-xs font-medium border rounded px-1.5 py-0.5 bg-white"
          >
            <option value="">Select Model</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearConversation}
            disabled={conversation.messages.length === 0}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRemovePanel(panelId)}
            className="p-1 hover:bg-red-100 hover:text-red-600 rounded"
            title="Remove panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-2 py-1 border-b bg-gray-50 flex items-center justify-between text-[10px] md:text-xs text-gray-600">
        <div>
          <span className="font-medium">{conversation.messages.length}</span> messages
        </div>
        <div className="flex items-center gap-3">
          <div>
            <span className="font-medium">{conversation.totalTokens.toLocaleString()}</span> tokens
          </div>
          <div>
            <span className="font-medium">${conversation.totalCost.toFixed(6)}</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {conversation.messages.length === 0 && (
          <div className="text-center py-4 text-xs md:text-sm text-gray-400">
            {selectedModel
              ? `Start chatting with ${selectedModel.name}`
              : 'Select a model to begin'}
          </div>
        )}

        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg px-2 py-1.5 ${
                message.role === 'user'
                  ? 'bg-gray-100 text-gray-900'
                  : message.content.startsWith('Error:')
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'text-gray-900'
              }`}
              style={
                message.role === 'assistant' && !message.content.startsWith('Error:')
                  ? { backgroundColor: `${color}10`, border: `1px solid ${color}40` }
                  : undefined
              }
            >
              <div className="text-xs md:text-sm whitespace-pre-wrap break-words leading-snug">
                {renderTextWithLinks(message.content)}
              </div>
              {message.tokenUsage && (
                <div className="text-[9px] md:text-[10px] text-gray-500 mt-1 pt-1 border-t border-gray-200">
                  {message.tokenUsage.totalTokens} tok • ${message.cost?.toFixed(6)} • {message.responseTime}ms
                </div>
              )}
              <div className="text-[9px] md:text-[10px] text-gray-400 mt-0.5">
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {conversation.isTyping && (
          <div className="flex justify-start">
            <div
              className="rounded-lg px-2 py-1.5 border"
              style={{ backgroundColor: `${color}10`, borderColor: `${color}40` }}
            >
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-bounce" style={{ backgroundColor: color }}></div>
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: color, animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: color, animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-1.5">
        <div className="flex items-end gap-1.5">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Budget exceeded' : 'Type message...'}
            disabled={conversation.isTyping || disabled || !selectedModel}
            className="flex-1 resize-none rounded-md border px-2 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || conversation.isTyping || disabled || !selectedModel}
            className="p-1.5 md:p-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{ backgroundColor: color }}
          >
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
