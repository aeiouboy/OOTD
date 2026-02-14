/**
 * Unit Tests for Color Detection in Follow-up Handler & Clarification Detector
 *
 * Tests:
 * 1. analyzeUserQuery() — basic field detection (no color support in current impl)
 * 2. detectFollowUpRequest() — color_change follow-up with Thai/English phrases
 *
 * Note: The current implementation does NOT have a standalone `detectColors()` function.
 * Color detection for follow-ups is handled by keyword matching in `detectFollowUpRequest`
 * and parameter extraction in `extractFollowUpParameters`.
 */

import { analyzeUserQuery, getClarificationsNeeded } from '../clarification-detector';
import { detectFollowUpRequest } from '../follow-up-handler';

describe('analyzeUserQuery() field detection', () => {
  it('should detect gender and occasion from Thai text', () => {
    const result = analyzeUserQuery('ชุดทำงาน ผู้หญิง');
    expect(result.hasGender).toBe(true);
    expect(result.detectedGender).toBe('women');
    expect(result.hasOccasion).toBe(true);
    expect(result.detectedOccasion).toBe('work');
  });

  it('should detect budget from Thai text', () => {
    const result = analyzeUserQuery('ชุดทำงาน ผู้หญิง งบ 5,000');
    expect(result.hasBudget).toBe(true);
    expect(result.detectedBudget).toBe(5000);
  });

  it('should detect multiple fields simultaneously', () => {
    const result = analyzeUserQuery('ชุดทำงาน ผู้หญิง งบ 5,000');
    expect(result.hasGender).toBe(true);
    expect(result.hasOccasion).toBe(true);
    expect(result.hasBudget).toBe(true);
  });

  it('should not detect gender when absent', () => {
    const result = analyzeUserQuery('ชุดทำงาน');
    expect(result.hasGender).toBe(false);
    expect(result.detectedGender).toBeUndefined();
  });

  it('should not detect budget when absent', () => {
    const result = analyzeUserQuery('ชุดทำงาน ผู้หญิง');
    expect(result.hasBudget).toBe(false);
    expect(result.detectedBudget).toBeUndefined();
  });

  it('should detect interview request as work occasion', () => {
    const result = analyzeUserQuery('อยากได้ชุดไปสัมภาษณ์งานวันศุกร์นี้');
    expect(result.hasOccasion).toBe(true);
    expect(result.detectedOccasion).toBe('work');
  });

  it('should not ask occasion clarification for interview request', () => {
    const query = analyzeUserQuery('อยากได้ชุดไปสัมภาษณ์งานวันศุกร์นี้');
    const clarifications = getClarificationsNeeded(
      query,
      [],
      [],
      { gender: 'women' },
      0,
      false
    );

    expect(clarifications.some((c) => c.type === 'occasion')).toBe(false);
  });
});

describe('detectFollowUpRequest() with Thai color phrases', () => {
  it('should detect "อยากได้สีเบจ" as color_change via "อยากได้สี" keyword', () => {
    const result = detectFollowUpRequest('อยากได้สีเบจ', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
    // "เบจ" is not in extractFollowUpParameters color list, so newColor is undefined
    expect(result.parameters.newColor).toBeUndefined();
  });

  it('should detect "เอาสีดำแทน" as color_change and extract Thai color', () => {
    const result = detectFollowUpRequest('เอาสีดำแทน', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
    // extractFollowUpParameters returns the Thai color word "ดำ"
    expect(result.parameters.newColor).toBe('ดำ');
  });

  it('should detect "อยากได้สีขาว" as color_change and extract Thai color', () => {
    const result = detectFollowUpRequest('อยากได้สีขาว', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
    expect(result.parameters.newColor).toBe('ขาว');
  });

  it('should detect "สีดำ" keyword match as color_change', () => {
    const result = detectFollowUpRequest('ขอสีดำหน่อย', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
    expect(result.parameters.newColor).toBe('ดำ');
  });

  it('should NOT detect as follow-up when hasProvidedRecommendations is false', () => {
    const result = detectFollowUpRequest('ขอสีครีมๆ', false);
    expect(result.isFollowUp).toBe(false);
    expect(result.type).toBe('none');
  });

  it('should detect "เปลี่ยนสี" keyword as color_change', () => {
    const result = detectFollowUpRequest('เปลี่ยนสีได้ไหม', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
  });

  it('should detect "สีอื่น" keyword as color_change', () => {
    const result = detectFollowUpRequest('มีสีอื่นไหม', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
  });

  it('should detect English "different color" as color_change', () => {
    const result = detectFollowUpRequest('I want a different color', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
  });

  it('should detect English "change color" as color_change', () => {
    const result = detectFollowUpRequest('can you change color to navy', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
    expect(result.parameters.newColor).toBe('navy');
  });

  it('should detect English "black" keyword as color_change', () => {
    const result = detectFollowUpRequest('I want black instead', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
    expect(result.parameters.newColor).toBe('black');
  });

  it('should not detect color_change for messages without color keywords', () => {
    const result = detectFollowUpRequest('ชุดทำงาน ผู้หญิง งบ 5000', true);
    expect(result.isFollowUp).toBe(false);
    expect(result.type).toBe('none');
  });

  it('should detect "สีพาสเทล" keyword as color_change', () => {
    const result = detectFollowUpRequest('อยากได้สีพาสเทล', true);
    expect(result.isFollowUp).toBe(true);
    expect(result.type).toBe('color_change');
  });
});
