import { describe, it, expect, afterEach } from 'vitest';
import {
  getActiveSystemPrompt,
  getSystemPrompt,
  isVersionAvailable,
  VersionUtils,
  PROMPT_VERSION,
  PREVIOUS_VERSION,
  getPromptVersionFromEnv,
} from '../prompt-version';

describe('prompt-version v5 wiring', () => {
  afterEach(() => {
    delete process.env.SYSTEM_PROMPT_VERSION;
  });

  it('should default to v5.0', () => {
    expect(PROMPT_VERSION).toBe('v5.0');
  });

  it('should have v4.0 as previous version', () => {
    expect(PREVIOUS_VERSION).toBe('v4.0');
  });

  it('should return v5 content from getActiveSystemPrompt()', () => {
    const prompt = getActiveSystemPrompt();
    expect(prompt).toContain('LOOKS_DATA');
    expect(prompt).toContain('PRODUCT GROUNDING');
  });

  it('should return v5 content from getSystemPrompt("v5.0")', () => {
    const prompt = getSystemPrompt('v5.0');
    expect(prompt).toContain('LOOKS_DATA');
  });

  it('should recognize v5.0 as available', () => {
    expect(isVersionAvailable('v5.0')).toBe(true);
  });

  it('should detect v5 as active via VersionUtils', () => {
    expect(VersionUtils.isV5Active()).toBe(true);
  });

  it('should support rollback to v4.0 via env', () => {
    process.env.SYSTEM_PROMPT_VERSION = 'v4.0';
    expect(getPromptVersionFromEnv()).toBe('v4.0');
    expect(VersionUtils.isV5Active()).toBe(false);
    const prompt = getActiveSystemPrompt();
    expect(prompt).not.toContain('LOOKS_DATA');
  });

  it('should still support v2.1 and v3.0', () => {
    expect(isVersionAvailable('v2.1')).toBe(true);
    expect(isVersionAvailable('v3.0')).toBe(true);
    expect(isVersionAvailable('v4.0')).toBe(true);
  });
});
