/**
 * Unit Tests for Follow-up Handler
 *
 * Tests that the follow-up handler correctly classifies:
 * - Same-topic refinements (follow-ups by type)
 * - Non-follow-up messages
 * - Backwards compatibility (no previous recommendations)
 *
 * @version 2.0.0
 * @created 2026-02-11
 * @updated 2026-02-12 - aligned tests with actual implementation (no topic change support)
 */

import { detectFollowUpRequest } from '../follow-up-handler';

describe('Follow-up Detection', () => {
  describe('detectFollowUpRequest() with hasProvidedRecommendations=true', () => {
    it('should classify "show me more options" as more_options follow-up', () => {
      const detection = detectFollowUpRequest('show me more options', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('more_options');
    });

    it('should classify "something else" as general_refine follow-up', () => {
      const detection = detectFollowUpRequest('show me something else', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('general_refine');
    });

    it('should classify "different color" as color_change follow-up', () => {
      const detection = detectFollowUpRequest(
        'I want a different color please',
        true
      );

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('color_change');
    });

    it('should classify informational Thai follow-up as info_question', () => {
      const detection = detectFollowUpRequest(
        'สีไหนที่ไม่ควรใส่วันอังคาร',
        true
      );

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('info_question');
    });

    it('should classify auspicious day-color question as info_question', () => {
      const detection = detectFollowUpRequest(
        'ถ้าไปทำงานวันอังคารสีมงคลใส่ไรดี',
        true
      );

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('info_question');
    });

    it('should classify rule question as info_question', () => {
      const detection = detectFollowUpRequest(
        'กฎแต่งตัวไปวัดคืออะไร',
        true
      );

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('info_question');
    });

    it('should classify "cheaper options" as budget_change follow-up', () => {
      const detection = detectFollowUpRequest('show me cheaper options', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('budget_change');
      expect(detection.parameters.budgetDirection).toBe('lower');
    });

    it('should classify "more formal" as style_change follow-up', () => {
      const detection = detectFollowUpRequest(
        'I need something more formal',
        true
      );

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('style_change');
      expect(detection.parameters.styleDirection).toBe('more_formal');
    });

    it('should classify "different brand" as brand_change follow-up', () => {
      const detection = detectFollowUpRequest(
        'show me different brand options',
        true
      );

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('brand_change');
    });

    it('should not classify explicit look request as info_question even with lucky-color keywords', () => {
      const detection = detectFollowUpRequest(
        'ช่วยจัดลุคสีมงคลวันอังคารให้หน่อย',
        true
      );

      expect(detection.type).not.toBe('info_question');
    });

    it('should classify unrelated message as not a follow-up', () => {
      const detection = detectFollowUpRequest(
        'hello how are you today',
        true
      );

      expect(detection.isFollowUp).toBe(false);
      expect(detection.type).toBe('none');
    });
  });

  describe('detectFollowUpRequest() with hasProvidedRecommendations=false', () => {
    it('should NOT detect follow-up when no recommendations have been provided', () => {
      const detection = detectFollowUpRequest('show me more options', false);

      expect(detection.isFollowUp).toBe(false);
      expect(detection.type).toBe('none');
    });

    it('should return none for any message when no recommendations provided', () => {
      const detection = detectFollowUpRequest(
        'show me party outfits',
        false
      );

      expect(detection.isFollowUp).toBe(false);
      expect(detection.type).toBe('none');
    });

    it('should NOT mark info question as follow-up before first recommendation', () => {
      const detection = detectFollowUpRequest(
        'กาลกิณีคืออะไร',
        false
      );

      expect(detection.isFollowUp).toBe(false);
      expect(detection.type).toBe('none');
    });
  });

  describe('detectFollowUpRequest() backwards compatibility', () => {
    it('should work with just message and hasProvidedRecommendations', () => {
      const detection = detectFollowUpRequest('show me more options', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('more_options');
      expect(detection.matchedKeywords).toBeDefined();
      expect(detection.parameters).toBeDefined();
    });
  });

  describe('detectFollowUpRequest() Thai keywords', () => {
    it('should detect Thai follow-up for more options (แบบอื่น)', () => {
      const detection = detectFollowUpRequest('อยากดูแบบอื่น', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('more_options');
    });

    it('should detect Thai follow-up for color change (สีอื่น)', () => {
      const detection = detectFollowUpRequest('อยากได้สีอื่น', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('color_change');
    });

    it('should detect Thai follow-up for cheaper options (ถูกกว่านี้)', () => {
      const detection = detectFollowUpRequest('มีถูกกว่านี้ไหม', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('budget_change');
      expect(detection.parameters.budgetDirection).toBe('lower');
    });
  });
});
