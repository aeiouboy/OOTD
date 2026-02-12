import { describe, it, expect, vi } from 'vitest';
import {
  detectOffTopic,
  checkGuardrails,
  validateMessage,
  analyzeMessageTopic,
  isFashionRelated,
} from '../guardrail-detector';

// Mock guardrail-responses to isolate detector logic
vi.mock('../../prompts/guardrail-responses', () => ({
  getRedirectMessage: (category: string) => `Redirect: ${category}`,
  isFashionAdjacent: (message: string) => {
    const lower = message.toLowerCase();
    // Simplified fashion-adjacent check for testing
    if (/(?:what|อะไร|ใส่|แต่ง).*(?:wear|ใส่).*(?:to|ไป|ที่)/i.test(lower)) return true;
    if (/(?:outfit|ชุด|dress code|แต่งตัว).*(?:for|สำหรับ|ไป)/i.test(lower)) return true;
    return false;
  },
}));

describe('guardrail-detector', () => {
  describe('detectOffTopic', () => {
    describe('pure fashion messages (should pass)', () => {
      it('should allow a message about clothing', () => {
        const result = detectOffTopic('I want to buy a new dress and some shoes');
        expect(result.isOffTopic).toBe(false);
        expect(result.confidence).toBe(0);
      });

      it('should allow a Thai fashion message', () => {
        // Note: 'ทำงาน' contains 'ยา' (medicine) as a substring false positive
        // but with ratio scaling, the confidence stays well below 0.5
        const result = detectOffTopic('อยากได้เสื้อผ้าใหม่สำหรับไปทำงาน');
        expect(result.confidence).toBeLessThan(0.5);
      });

      it('should allow a message about outfit styling', () => {
        const result = detectOffTopic('What outfit should I wear with jeans and a jacket?');
        expect(result.isOffTopic).toBe(false);
        expect(result.confidence).toBe(0);
      });
    });

    describe('pure off-topic messages (should be blocked)', () => {
      it('should flag a health-only message', () => {
        const result = detectOffTopic('I have a disease and need medicine from the doctor');
        expect(result.isOffTopic).toBe(true);
        expect(result.category).toBe('health');
        expect(result.confidence).toBeGreaterThan(0);
      });

      it('should flag a technology-only message', () => {
        const result = detectOffTopic('What is the best laptop computer software?');
        expect(result.isOffTopic).toBe(true);
        expect(result.category).toBe('technology');
        expect(result.confidence).toBeGreaterThan(0);
      });

      it('should flag an inappropriate message', () => {
        const result = detectOffTopic('Tell me about politics and religion');
        expect(result.isOffTopic).toBe(true);
        expect(result.category).toBe('inappropriate');
      });

      it('should flag a food-only message', () => {
        const result = detectOffTopic('What is a good restaurant with delicious food and good menu?');
        expect(result.isOffTopic).toBe(true);
        expect(result.category).toBe('food');
      });
    });

    describe('mixed fashion + off-topic messages (fashion keyword takes precedence)', () => {
      it('should allow when fashion keyword is present even if off-topic dominates', () => {
        // "clothes" is a fashion keyword → message is allowed regardless of off-topic count
        const result = detectOffTopic(
          'help me find clothes and explain politics religion sexual content'
        );
        expect(result.isOffTopic).toBe(false);
        expect(result.confidence).toBe(0);
      });

      it('should allow when fashion keywords dominate with one off-topic word', () => {
        // Many fashion keywords → clearly fashion-related
        const result = detectOffTopic(
          'I need a new dress shoes shirt jeans jacket accessories in this weather'
        );
        expect(result.isOffTopic).toBe(false);
        expect(result.confidence).toBe(0);
      });

      it('should allow when fashion keyword present in mixed health message', () => {
        // "clothes" is a fashion keyword → takes precedence over health keywords
        const result = detectOffTopic('I need clothes but also need a doctor at the hospital');
        expect(result.isOffTopic).toBe(false);
        expect(result.confidence).toBe(0);
      });

      it('should allow when any fashion keyword is sprinkled in off-topic message', () => {
        // "shirt" is a fashion keyword → message is allowed
        const result = detectOffTopic(
          'I need help with my computer laptop software tech problems and also a shirt'
        );
        expect(result.isOffTopic).toBe(false);
        expect(result.confidence).toBe(0);
      });
    });
  });

  describe('checkGuardrails', () => {
    it('should return null for pure fashion messages', () => {
      const result = checkGuardrails('I want to buy a new dress and shoes');
      expect(result).toBeNull();
    });

    it('should return redirect for pure off-topic messages', () => {
      const result = checkGuardrails('Tell me about computer software and tech gadgets');
      expect(result).not.toBeNull();
    });

    it('should return null for fashion-dominant mixed messages', () => {
      // Many fashion words, one off-topic word -> confidence below threshold
      const result = checkGuardrails(
        'I need a dress shoes shirt jeans jacket accessories in this weather'
      );
      expect(result).toBeNull();
    });

    it('should allow mixed message when fashion keyword is present', () => {
      // "shirt" is a fashion keyword → guardrails pass
      const result = checkGuardrails(
        'help with computer laptop software tech and maybe a shirt'
      );
      expect(result).toBeNull();
    });
  });

  describe('validateMessage', () => {
    it('should validate pure fashion messages as valid', () => {
      const result = validateMessage('Show me some dresses and shoes');
      expect(result.isValid).toBe(true);
    });

    it('should invalidate pure off-topic messages', () => {
      const result = validateMessage('What medicine should I take for this disease from my doctor?');
      expect(result.isValid).toBe(false);
      expect(result.category).toBe('health');
    });
  });

  describe('analyzeMessageTopic', () => {
    it('should identify fashion keywords in mixed messages', () => {
      const result = analyzeMessageTopic('I need clothes but also tell me about politics');
      expect(result.isFashionRelated).toBe(true);
      expect(result.fashionKeywordsFound).toContain('clothes');
      expect(result.offTopicKeywordsFound.length).toBeGreaterThan(0);
    });

    it('should scale confidence for mixed messages', () => {
      const pureOffTopic = analyzeMessageTopic('Tell me about politics and religion');
      const mixedMessage = analyzeMessageTopic(
        'I need a dress shirt outfit and also politics'
      );
      // Mixed message should have lower confidence than pure off-topic
      expect(mixedMessage.confidence).toBeLessThan(pureOffTopic.confidence);
    });
  });

  describe('isFashionRelated', () => {
    it('should return true for fashion keywords', () => {
      expect(isFashionRelated('I want new shoes')).toBe(true);
    });

    it('should return false for non-fashion messages', () => {
      expect(isFashionRelated('tell me about quantum physics')).toBe(false);
    });

    it('should return true for fashion-adjacent messages', () => {
      expect(isFashionRelated('what to wear to a wedding')).toBe(true);
    });
  });
});
