/**
 * Unit Tests for Customer Journey Steps 3 & 4
 *
 * Tests the POST-RECOMMENDATION LOCKOUT enforcement and follow-up handling.
 *
 * Related: chore-fd2f91e8-implement-journey-steps-3-4.md
 *
 * @version 1.0.0
 * @created 2025-10-26
 */

import {
  createSessionContext,
  updateSessionContext,
  resetSessionContext,
} from '../session-context';

import {
  getClarificationsNeeded,
  analyzeUserQuery,
} from '../clarification-detector';

import {
  trackConversationTurns,
  shouldForceRecommendations,
  getTurnFlowRecommendation,
  isInFollowUpPhase,
} from '../conversation-flow-tracker';

import {
  detectFollowUpRequest,
  generateFollowUpInstruction,
} from '../follow-up-handler';

import {
  validateFollowUpResponse,
  validateResponseWithPhase,
} from '../response-validator';

describe('Customer Journey Steps 3 & 4', () => {
  describe('Step 3: Recommendation Phase', () => {
    it('should force recommendations after 2 clarifications', () => {
      // Simulate session after 2 clarifications
      let session = createSessionContext('test-session');
      session = updateSessionContext(session, [], 'gender');
      session = updateSessionContext(session, [], 'occasion');

      // Check that we've asked 2 clarifications
      expect(session.askedClarifications.length).toBe(2);
      expect(session.clarificationTurnCount).toBe(2);

      // Should force recommendations now
      expect(shouldForceRecommendations(session)).toBe(true);

      // getClarificationsNeeded should return empty array
      const query = analyzeUserQuery('ขอชุดสวยๆ');
      const clarifications = getClarificationsNeeded(
        query,
        [],
        session.askedClarifications,
        session.conversationContext,
        session.clarificationTurnCount
      );

      expect(clarifications).toHaveLength(0);
    });

    it('should transition to recommendation phase when products are recommended', () => {
      let session = createSessionContext('test-session');

      // Ask a clarification first
      session = updateSessionContext(session, [], 'gender');
      expect(session.dialoguePhase).toBe('clarification');

      // Recommend products - should transition to recommendation phase
      session = updateSessionContext(session, ['SKU-001', 'SKU-002', 'SKU-003']);
      expect(session.dialoguePhase).toBe('recommendation');
      expect(session.hasProvidedRecommendations).toBe(true);
      expect(session.recommendationCount).toBe(1);
    });

    it('should return correct turn flow recommendation at each stage', () => {
      let session = createSessionContext('test-session');

      // Initially can clarify
      expect(getTurnFlowRecommendation(session)).toBe('can-clarify');

      // After 1 clarification, should clarify last
      session = updateSessionContext(session, [], 'gender');
      expect(getTurnFlowRecommendation(session)).toBe('should-clarify-last');

      // After 2 clarifications, must recommend
      session = updateSessionContext(session, [], 'occasion');
      expect(getTurnFlowRecommendation(session)).toBe('must-recommend');
    });
  });

  describe('Step 4: Follow-up Phase (POST-RECOMMENDATION LOCKOUT)', () => {
    it('should activate POST-RECOMMENDATION LOCKOUT after first recommendation', () => {
      let session = createSessionContext('test-session');

      // Provide recommendations
      session = updateSessionContext(session, ['SKU-001', 'SKU-002']);

      // POST-RECOMMENDATION LOCKOUT should be active
      expect(session.hasProvidedRecommendations).toBe(true);

      const stats = trackConversationTurns(session);
      expect(stats.isPostRecommendationLockout).toBe(true);
    });

    it('should return empty clarifications array when POST-RECOMMENDATION LOCKOUT is active', () => {
      let session = createSessionContext('test-session');

      // Provide recommendations first
      session = updateSessionContext(session, ['SKU-001', 'SKU-002']);

      // Try to get clarifications - should be empty due to lockout
      const query = analyzeUserQuery('มีสีอื่นมั้ย'); // Follow-up request
      const clarifications = getClarificationsNeeded(
        query,
        [],
        session.askedClarifications,
        session.conversationContext,
        session.clarificationTurnCount,
        session.hasProvidedRecommendations // Pass lockout flag
      );

      expect(clarifications).toHaveLength(0);
    });

    it('should transition to follow-up phase on second recommendation round', () => {
      let session = createSessionContext('test-session');

      // First recommendation (Step 3)
      session = updateSessionContext(session, ['SKU-001', 'SKU-002']);
      expect(session.dialoguePhase).toBe('recommendation');
      expect(session.recommendationCount).toBe(1);

      // Second recommendation (Step 4 - follow-up)
      session = updateSessionContext(session, ['SKU-003', 'SKU-004']);
      expect(session.dialoguePhase).toBe('follow-up');
      expect(session.recommendationCount).toBe(2);
    });

    it('should return must-recommend-followup in follow-up phase', () => {
      let session = createSessionContext('test-session');

      // Provide recommendations
      session = updateSessionContext(session, ['SKU-001']);

      // Should recommend follow-up
      expect(getTurnFlowRecommendation(session)).toBe('must-recommend-followup');
    });

    it('should correctly identify follow-up phase', () => {
      let session = createSessionContext('test-session');

      // Initially not in follow-up
      expect(isInFollowUpPhase(session)).toBe(false);

      // After recommendations, in follow-up
      session = updateSessionContext(session, ['SKU-001']);
      session = updateSessionContext(session, ['SKU-002']); // Second round

      expect(isInFollowUpPhase(session)).toBe(true);
    });
  });

  describe('Follow-up Request Detection', () => {
    it('should detect "more options" follow-up request', () => {
      const detection = detectFollowUpRequest('มีอื่นมั้ย', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('more_options');
    });

    it('should detect "color change" follow-up request', () => {
      const detection = detectFollowUpRequest('มีสีอื่นไหมคะ', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('color_change');
    });

    it('should detect "budget change" follow-up request', () => {
      const detection = detectFollowUpRequest('มีถูกกว่านี้ไหม', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('budget_change');
      expect(detection.parameters.budgetDirection).toBe('lower');
    });

    it('should detect "style change" follow-up request', () => {
      const detection = detectFollowUpRequest('มีแบบ formal กว่านี้ไหม', true);

      expect(detection.isFollowUp).toBe(true);
      expect(detection.type).toBe('style_change');
      expect(detection.parameters.styleDirection).toBe('more_formal');
    });

    it('should NOT detect follow-up if no recommendations have been provided', () => {
      const detection = detectFollowUpRequest('มีอื่นมั้ย', false);

      expect(detection.isFollowUp).toBe(false);
      expect(detection.type).toBe('none');
    });

    it('should generate follow-up instruction for more options', () => {
      const detection = detectFollowUpRequest('มีอื่นมั้ย', true);
      const instruction = generateFollowUpInstruction(detection);

      expect(instruction).toContain('FOLLOW-UP MODE ACTIVE');
      expect(instruction).toContain('MORE OPTIONS');
      expect(instruction).toContain('DO NOT ask any clarifying questions');
    });
  });

  describe('Follow-up Response Validation', () => {
    it('should pass validation for proper follow-up response', () => {
      const response = `
สำหรับตัวเลือกเพิ่มเติมค่ะ:

1. 👔 **เสื้อเชิ้ตลินิน** - COS
   💰 2,990 บาท
   🔗 https://central.co.th/product/123

2. 👔 **กางเกงขากระบอก** - Theory
   💰 4,500 บาท
   🔗 https://central.co.th/product/456

✨ ทั้งสองชิ้นนี้จะให้ลุคที่สบายแต่ดูเป็นทางการค่ะ
      `;

      const validation = validateFollowUpResponse(response);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation if follow-up response contains clarification questions', () => {
      const response = `
คุณอยากหาชุดผู้หญิงหรือผู้ชายคะ?
      `;

      const validation = validateFollowUpResponse(response);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('clarifying question'))).toBe(true);
    });

    it('should use phase-aware validation in follow-up mode', () => {
      const goodResponse = `
นี่คือตัวเลือกเพิ่มเติมค่ะ

1. 👔 **เสื้อยืดสีขาว** - Uniqlo
   💰 590 บาท
   🔗 https://central.co.th/product/789

2. 👔 **กางเกงขายาว** - H&M
   💰 990 บาท
   🔗 https://central.co.th/product/456

3. 👔 **รองเท้าผ้าใบ** - Adidas
   💰 2,500 บาท
   🔗 https://central.co.th/product/123

✨ ทั้งสามชิ้นนี้เหมาะกับลุคสบายๆ ค่ะ
      `;

      const badResponse = `
งบประมาณเท่าไหร่คะ? จะได้แนะนำให้เหมาะสม
      `;

      // Good response should pass in follow-up mode
      const goodValidation = validateResponseWithPhase(goodResponse, true);
      expect(goodValidation.isValid).toBe(true);

      // Bad response should fail in follow-up mode
      const badValidation = validateResponseWithPhase(badResponse, true);
      expect(badValidation.isValid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user providing all info upfront (skip Step 1 & 2, go to Step 3)', () => {
      const session = createSessionContext('test-session');

      // User provides complete info in first message
      const query = analyzeUserQuery('ขอชุดผู้หญิงไปทำงาน งบ 5000 บาท');

      // Should detect all info
      expect(query.hasGender).toBe(true);
      expect(query.hasOccasion).toBe(true);
      expect(query.hasBudget).toBe(true);

      // No clarifications needed - go straight to recommendations
      const clarifications = getClarificationsNeeded(
        query,
        [],
        session.askedClarifications,
        session.conversationContext,
        session.clarificationTurnCount,
        session.hasProvidedRecommendations
      );

      expect(clarifications).toHaveLength(0);
    });

    it('should maintain POST-RECOMMENDATION LOCKOUT across multiple follow-up rounds', () => {
      let session = createSessionContext('test-session');

      // First recommendation
      session = updateSessionContext(session, ['SKU-001']);
      expect(session.hasProvidedRecommendations).toBe(true);

      // Multiple follow-up rounds
      session = updateSessionContext(session, ['SKU-002']);
      expect(session.hasProvidedRecommendations).toBe(true);
      expect(session.recommendationCount).toBe(2);

      session = updateSessionContext(session, ['SKU-003']);
      expect(session.hasProvidedRecommendations).toBe(true);
      expect(session.recommendationCount).toBe(3);

      // Lockout should still be active
      const stats = trackConversationTurns(session);
      expect(stats.isPostRecommendationLockout).toBe(true);
    });

    it('should reset POST-RECOMMENDATION LOCKOUT on session reset', () => {
      let session = createSessionContext('test-session');

      // Provide recommendations
      session = updateSessionContext(session, ['SKU-001']);
      expect(session.hasProvidedRecommendations).toBe(true);

      // Reset session (user says "เริ่มใหม่")
      session = resetSessionContext(session);

      expect(session.hasProvidedRecommendations).toBe(false);
      expect(session.recommendationCount).toBe(0);
      expect(session.dialoguePhase).toBe('clarification');
    });
  });
});
