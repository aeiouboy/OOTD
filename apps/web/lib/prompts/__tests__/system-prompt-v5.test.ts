import { describe, it, expect } from 'vitest';
import { SYSTEM_PROMPT_V5, SYSTEM_PROMPT_V5_METADATA } from '../system-prompt-v5';

describe('system-prompt-v5', () => {
  it('should contain LOOKS_DATA format spec', () => {
    expect(SYSTEM_PROMPT_V5).toContain('---LOOKS_DATA---');
    expect(SYSTEM_PROMPT_V5).toContain('---END_LOOKS_DATA---');
  });

  it('should contain Product Grounding Rules', () => {
    expect(SYSTEM_PROMPT_V5).toContain('PRODUCT GROUNDING RULES');
    expect(SYSTEM_PROMPT_V5).toContain('Copy the product URL exactly');
  });

  it('should have 3 or fewer CRITICAL markers', () => {
    const criticalCount = (SYSTEM_PROMPT_V5.match(/CRITICAL/g) || []).length;
    expect(criticalCount).toBeLessThanOrEqual(3);
  });

  it('should contain OOT persona section', () => {
    expect(SYSTEM_PROMPT_V5).toContain('OOT');
    expect(SYSTEM_PROMPT_V5).toContain('Outfit Of Today');
  });

  it('should contain state machine section', () => {
    expect(SYSTEM_PROMPT_V5).toContain('CLARIFICATION');
    expect(SYSTEM_PROMPT_V5).toContain('RECOMMENDATION');
    expect(SYSTEM_PROMPT_V5).toContain('REDIRECT');
  });

  it('should contain anti-fabrication examples', () => {
    expect(SYSTEM_PROMPT_V5).toContain('Good Example');
    expect(SYSTEM_PROMPT_V5).toContain('Bad Example');
  });

  it('should have valid metadata', () => {
    expect(SYSTEM_PROMPT_V5_METADATA.version).toBe('v5.0.0');
    expect(SYSTEM_PROMPT_V5_METADATA.previousVersion).toBe('v4.0.0');
    expect(SYSTEM_PROMPT_V5_METADATA.majorChanges.length).toBeGreaterThan(0);
  });

  it('should contain ITEM format specification', () => {
    expect(SYSTEM_PROMPT_V5).toContain('ITEM:');
    expect(SYSTEM_PROMPT_V5).toContain('LOOK:');
    expect(SYSTEM_PROMPT_V5).toContain('TIP:');
    expect(SYSTEM_PROMPT_V5).toContain('TOTAL:');
  });
});
