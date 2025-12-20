/**
 * Unit Tests for Session Context Utilities
 *
 * Related PRD: 0006-prd-system-prompt-enhancement-guardrails.md
 * Task: 7.1 - Unit tests for session context utilities
 *
 * @version 1.0.0
 * @created 2025-10-14
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSessionContext,
  updateSessionContext,
  resetSessionContext,
  isProductRecommended,
  getRecommendedProductCount,
  shouldResetSession,
  formatSessionContextForAI,
  createSessionContextFromHistory,
  isValidSessionContext,
} from '../session-context';
import type { SessionContext } from '../../types/chat-types';

describe('Session Context Utilities', () => {
  describe('createSessionContext', () => {
    it('should create a new session context with default values', () => {
      const context = createSessionContext();

      expect(context.recommendedProductIds).toEqual([]);
      expect(context.sessionId).toBeDefined();
      expect(context.sessionId).toMatch(/^session-/);
      expect(context.createdAt).toBeInstanceOf(Date);
    });

    it('should create session with custom session ID', () => {
      const customId = 'custom-session-123';
      const context = createSessionContext(customId);

      expect(context.sessionId).toBe(customId);
    });
  });

  describe('updateSessionContext', () => {
    let context: SessionContext;

    beforeEach(() => {
      context = createSessionContext();
    });

    it('should add new product IDs to session context', () => {
      const newProducts = ['SKU-001', 'SKU-002', 'SKU-003'];
      const updated = updateSessionContext(context, newProducts);

      expect(updated.recommendedProductIds).toEqual(newProducts);
      expect(updated.sessionId).toBe(context.sessionId);
    });

    it('should append new products to existing ones', () => {
      const first = updateSessionContext(context, ['SKU-001', 'SKU-002']);
      const second = updateSessionContext(first, ['SKU-003', 'SKU-004']);

      expect(second.recommendedProductIds).toEqual(['SKU-001', 'SKU-002', 'SKU-003', 'SKU-004']);
    });

    it('should not add duplicate product IDs', () => {
      const first = updateSessionContext(context, ['SKU-001', 'SKU-002']);
      const second = updateSessionContext(first, ['SKU-002', 'SKU-003']);

      expect(second.recommendedProductIds).toEqual(['SKU-001', 'SKU-002', 'SKU-003']);
      expect(second.recommendedProductIds.length).toBe(3);
    });

    it('should handle empty array of new products', () => {
      const updated = updateSessionContext(context, []);

      expect(updated.recommendedProductIds).toEqual([]);
    });
  });

  describe('resetSessionContext', () => {
    it('should clear recommended products', () => {
      const context = createSessionContext();
      const updated = updateSessionContext(context, ['SKU-001', 'SKU-002']);
      const reset = resetSessionContext(updated);

      expect(reset.recommendedProductIds).toEqual([]);
    });

    it('should generate new session ID', () => {
      const context = createSessionContext();
      const reset = resetSessionContext(context);

      expect(reset.sessionId).not.toBe(context.sessionId);
    });

    it('should use custom session ID if provided', () => {
      const context = createSessionContext();
      const customId = 'new-session-456';
      const reset = resetSessionContext(context, customId);

      expect(reset.sessionId).toBe(customId);
    });

    it('should update createdAt timestamp', () => {
      const context = createSessionContext();
      const originalCreatedAt = context.createdAt;

      // Wait a bit to ensure timestamp differs
      const reset = resetSessionContext(context);

      expect(reset.createdAt).toBeInstanceOf(Date);
      expect(reset.createdAt?.getTime()).toBeGreaterThanOrEqual(originalCreatedAt!.getTime());
    });
  });

  describe('isProductRecommended', () => {
    it('should return true for recommended products', () => {
      const context = updateSessionContext(createSessionContext(), ['SKU-001', 'SKU-002']);

      expect(isProductRecommended(context, 'SKU-001')).toBe(true);
      expect(isProductRecommended(context, 'SKU-002')).toBe(true);
    });

    it('should return false for non-recommended products', () => {
      const context = updateSessionContext(createSessionContext(), ['SKU-001', 'SKU-002']);

      expect(isProductRecommended(context, 'SKU-003')).toBe(false);
    });

    it('should handle empty session context', () => {
      const context = createSessionContext();

      expect(isProductRecommended(context, 'SKU-001')).toBe(false);
    });
  });

  describe('getRecommendedProductCount', () => {
    it('should return 0 for new session', () => {
      const context = createSessionContext();

      expect(getRecommendedProductCount(context)).toBe(0);
    });

    it('should return correct count after adding products', () => {
      const context = createSessionContext();
      const updated = updateSessionContext(context, ['SKU-001', 'SKU-002', 'SKU-003']);

      expect(getRecommendedProductCount(updated)).toBe(3);
    });
  });

  describe('shouldResetSession', () => {
    it('should detect Thai reset triggers', () => {
      expect(shouldResetSession('เริ่มใหม่')).toBe(true);
      expect(shouldResetSession('ลืมการสนทนาก่อนหน้า')).toBe(true);
      expect(shouldResetSession('ลืมที่แนะนำไป')).toBe(true);
      expect(shouldResetSession('แนะนำใหม่')).toBe(true);
    });

    it('should detect English reset triggers', () => {
      expect(shouldResetSession('reset')).toBe(true);
      expect(shouldResetSession('start over')).toBe(true);
      expect(shouldResetSession('new conversation')).toBe(true);
      expect(shouldResetSession('clear history')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(shouldResetSession('RESET')).toBe(true);
      expect(shouldResetSession('Start Over')).toBe(true);
      expect(shouldResetSession('NEW CONVERSATION')).toBe(true);
    });

    it('should return false for non-reset messages', () => {
      expect(shouldResetSession('hello')).toBe(false);
      expect(shouldResetSession('recommend outfit')).toBe(false);
      expect(shouldResetSession('what to wear')).toBe(false);
    });

    it('should detect reset triggers within sentences', () => {
      expect(shouldResetSession('I want to reset and start over')).toBe(true);
      expect(shouldResetSession('ขอเริ่มใหม่นะคะ')).toBe(true);
    });
  });

  describe('formatSessionContextForAI', () => {
    it('should return message for empty session', () => {
      const context = createSessionContext();
      const formatted = formatSessionContextForAI(context);

      expect(formatted).toBe('No products recommended yet in this session.');
    });

    it('should format session with products', () => {
      const context = updateSessionContext(createSessionContext(), ['SKU-001', 'SKU-002', 'SKU-003']);
      const formatted = formatSessionContextForAI(context);

      expect(formatted).toContain('Previously recommended products');
      expect(formatted).toContain('1. SKU-001');
      expect(formatted).toContain('2. SKU-002');
      expect(formatted).toContain('3. SKU-003');
      expect(formatted).toContain('Total: 3 products');
      expect(formatted).toContain('IMPORTANT: Do NOT recommend any of these products again');
    });
  });

  describe('createSessionContextFromHistory', () => {
    it('should extract product IDs from conversation history', () => {
      const history = [
        { role: 'user', content: 'I need an outfit' },
        { role: 'assistant', content: 'I recommend SKU-001 and SKU-002' },
        { role: 'user', content: 'Any more options?' },
        { role: 'assistant', content: 'Also check out CEN-123456' },
      ];

      const context = createSessionContextFromHistory(history);

      expect(context.recommendedProductIds).toContain('SKU-001');
      expect(context.recommendedProductIds).toContain('SKU-002');
      expect(context.recommendedProductIds).toContain('CEN-123456');
    });

    it('should ignore product IDs in user messages', () => {
      const history = [
        { role: 'user', content: 'I saw SKU-999 but don\'t like it' },
        { role: 'assistant', content: 'I recommend SKU-001' },
      ];

      const context = createSessionContextFromHistory(history);

      expect(context.recommendedProductIds).toContain('SKU-001');
      expect(context.recommendedProductIds).not.toContain('SKU-999');
    });

    it('should handle empty conversation history', () => {
      const context = createSessionContextFromHistory([]);

      expect(context.recommendedProductIds).toEqual([]);
    });
  });

  describe('isValidSessionContext', () => {
    it('should validate correct session context', () => {
      const context = createSessionContext();

      expect(isValidSessionContext(context)).toBe(true);
    });

    it('should validate context with products', () => {
      const context = updateSessionContext(createSessionContext(), ['SKU-001', 'SKU-002']);

      expect(isValidSessionContext(context)).toBe(true);
    });

    it('should reject null', () => {
      expect(isValidSessionContext(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isValidSessionContext(undefined)).toBe(false);
    });

    it('should reject object without recommendedProductIds', () => {
      const invalid = { sessionId: 'test' };

      expect(isValidSessionContext(invalid)).toBe(false);
    });

    it('should reject object with non-array recommendedProductIds', () => {
      const invalid = { recommendedProductIds: 'not-array' };

      expect(isValidSessionContext(invalid)).toBe(false);
    });

    it('should reject object with non-string product IDs', () => {
      const invalid = { recommendedProductIds: [1, 2, 3] };

      expect(isValidSessionContext(invalid)).toBe(false);
    });
  });
});
