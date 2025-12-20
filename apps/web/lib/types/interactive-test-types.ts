/**
 * TypeScript interfaces for Interactive Multi-Panel Test Mode
 */

import type { TokenUsage } from './test-types';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokenUsage?: TokenUsage;
  cost?: number;
  responseTime?: number;
}

export interface PanelConversation {
  panelId: string;
  modelId: string;
  messages: ConversationMessage[];
  isTyping: boolean;
  totalCost: number;
  totalTokens: number;
}

export interface InteractiveTestState {
  panels: PanelConversation[];
  sharedBudget: {
    currentCost: number;
    remainingBudget: number;
    totalBudget: number;
    percentageUsed: number;
    warningThreshold: boolean;
  };
}

export interface PanelConfig {
  id: string;
  modelId: string;
  color: string; // For visual distinction
}
