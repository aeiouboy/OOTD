import { describe, it, expect } from 'vitest';
import { detectCategory, getTemplateInstruction } from '../category-detector';

describe('category-detector INFO patterns', () => {
  it('detects informational query as INFO', () => {
    const result = detectCategory('กาลกิณีวันอังคารคืออะไร');

    expect(result.category).toBe('INFO');
    expect(result.recommendedTemplate).toBe('C');
  });

  it('detects informational color question as INFO', () => {
    const result = detectCategory('สีไหนที่ไม่ควรใส่วันอังคาร');

    expect(result.category).toBe('INFO');
    expect(result.recommendedTemplate).toBe('C');
  });

  it('explicit outfit request overrides INFO and stays CLOTHS', () => {
    const result = detectCategory('หาชุดใส่ได้ไหม');

    expect(result.category).toBe('CLOTHS');
    expect(result.recommendedTemplate).toBe('A');
  });

  it('keeps existing OTHER detection behavior', () => {
    const result = detectCategory('รองเท้าดูแลยังไง');

    expect(result.category).toBe('OTHER');
    expect(result.recommendedTemplate).toBe('B');
  });

  it('provides template C instruction for INFO category', () => {
    const instruction = getTemplateInstruction('INFO');

    expect(instruction).toContain('Template C');
    expect(instruction).toContain('text-only');
  });
});
