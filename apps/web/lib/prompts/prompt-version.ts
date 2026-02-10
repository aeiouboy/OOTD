/**
 * System Prompt Version Management
 *
 * Supports switching between v2.1, v3.0, v4.0, and v5.0 for A/B testing
 *
 * @version 5.0
 */

import { SYSTEM_PROMPT_V2, SYSTEM_PROMPT_V2_METADATA } from './system-prompt-v2';
import { SYSTEM_PROMPT_V3, SYSTEM_PROMPT_V3_METADATA } from './system-prompt-v3';
import { SYSTEM_PROMPT_V4, SYSTEM_PROMPT_V4_METADATA } from './system-prompt-v4';
import { SYSTEM_PROMPT_V5, SYSTEM_PROMPT_V5_METADATA } from './system-prompt-v5';

/**
 * Available prompt versions
 */
export type PromptVersion = 'v2.1' | 'v3.0' | 'v4.0' | 'v5.0';

/**
 * Current prompt version (default)
 */
export const PROMPT_VERSION: PromptVersion = 'v5.0';

/**
 * Previous prompt version (for rollback)
 */
export const PREVIOUS_VERSION: PromptVersion = 'v4.0';

/**
 * Get system prompt by version
 *
 * @param version - The prompt version to use ('v2.1', 'v3.0', 'v4.0', or 'v5.0')
 * @returns The system prompt string
 */
export function getSystemPrompt(version: PromptVersion = PROMPT_VERSION): string {
  switch (version) {
    case 'v2.1':
      return SYSTEM_PROMPT_V2;
    case 'v3.0':
      return SYSTEM_PROMPT_V3;
    case 'v4.0':
      return SYSTEM_PROMPT_V4;
    case 'v5.0':
      return SYSTEM_PROMPT_V5;
    default:
      // Default to v5.0
      return SYSTEM_PROMPT_V5;
  }
}

/**
 * Get system prompt metadata by version
 *
 * @param version - The prompt version
 * @returns The prompt metadata
 */
export function getSystemPromptMetadata(version: PromptVersion = PROMPT_VERSION) {
  switch (version) {
    case 'v2.1':
      return SYSTEM_PROMPT_V2_METADATA;
    case 'v3.0':
      return SYSTEM_PROMPT_V3_METADATA;
    case 'v4.0':
      return SYSTEM_PROMPT_V4_METADATA;
    case 'v5.0':
      return SYSTEM_PROMPT_V5_METADATA;
    default:
      return SYSTEM_PROMPT_V5_METADATA;
  }
}

/**
 * Get system prompt version from environment variable (for A/B testing)
 *
 * @returns The prompt version to use
 */
export function getPromptVersionFromEnv(): PromptVersion {
  const envVersion = process.env.SYSTEM_PROMPT_VERSION as PromptVersion | undefined;

  // Validate environment variable
  if (envVersion === 'v2.1' || envVersion === 'v3.0' || envVersion === 'v4.0' || envVersion === 'v5.0') {
    return envVersion;
  }

  // Default to v5.0
  return PROMPT_VERSION;
}

/**
 * Get the active system prompt (respects environment variable)
 *
 * This is the main function to use in production code.
 * It automatically checks the SYSTEM_PROMPT_VERSION environment variable
 * and falls back to the default version.
 *
 * @returns The active system prompt string
 */
export function getActiveSystemPrompt(): string {
  const version = getPromptVersionFromEnv();
  return getSystemPrompt(version);
}

/**
 * Check if a version is available
 *
 * @param version - The version to check
 * @returns true if the version exists
 */
export function isVersionAvailable(version: string): version is PromptVersion {
  return version === 'v2.1' || version === 'v3.0' || version === 'v4.0' || version === 'v5.0';
}

/**
 * Version comparison utilities
 */
export const VersionUtils = {
  /**
   * Check if v5.0 is active
   */
  isV5Active: (): boolean => {
    return getPromptVersionFromEnv() === 'v5.0';
  },

  /**
   * Check if v4.0 is active
   */
  isV4Active: (): boolean => {
    return getPromptVersionFromEnv() === 'v4.0';
  },

  /**
   * Check if v3.0 is active
   */
  isV3Active: (): boolean => {
    return getPromptVersionFromEnv() === 'v3.0';
  },

  /**
   * Check if v2.1 is active
   */
  isV21Active: (): boolean => {
    return getPromptVersionFromEnv() === 'v2.1';
  },

  /**
   * Get current version info
   */
  getCurrentVersionInfo: () => {
    const version = getPromptVersionFromEnv();
    const metadata = getSystemPromptMetadata(version);
    return {
      version,
      metadata,
      isDefault: version === PROMPT_VERSION,
      source: process.env.SYSTEM_PROMPT_VERSION ? 'environment' : 'default',
    };
  },
};

/**
 * Export all functions and constants
 */
export default {
  PROMPT_VERSION,
  PREVIOUS_VERSION,
  getSystemPrompt,
  getSystemPromptMetadata,
  getPromptVersionFromEnv,
  getActiveSystemPrompt,
  isVersionAvailable,
  VersionUtils,
};
