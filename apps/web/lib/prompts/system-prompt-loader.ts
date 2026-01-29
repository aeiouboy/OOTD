/**
 * System Prompt Loader Utility
 *
 * Loads the appropriate system prompt based on environment configuration.
 * Supports version switching via environment variable.
 *
 * Related PRD: 0006-prd-system-prompt-enhancement-guardrails.md
 * Task: 6.3-6.4 - Environment flag and loader utility
 *
 * @version 2.0.0
 * @created 2025-10-14
 * @updated 2025-01-27 - Added v4 support
 */

import { SYSTEM_PROMPT_V2 } from './system-prompt-v2';
import { SYSTEM_PROMPT_V4 } from './system-prompt-v4';

/**
 * System prompt versions available
 */
export enum SystemPromptVersion {
  V1 = 'v1',
  V2 = 'v2',
  V4 = 'v4',
}

/**
 * Legacy system prompt (v1.0)
 * Basic prompt without advanced features
 */
const SYSTEM_PROMPT_V1 = `You are a friendly Thai fashion specialist providing outfit recommendations and styling advice.

For CLOTHS category (เสื้อผ้า):
- Recommend 3-5 actual Central Online products with prices and links
- Use format: 👔/👗 Item, 💰 Price, 🔗 Link, 💡 Reason
- Add 1-3 styling tips with ✨ emoji
- Write in conversational Thai with particles like ค่ะ, นะคะ, เลย

For OTHER categories (รองเท้า, กระเป๋า, etc.):
- Share 1-3 practical tips and tricks
- Mention products naturally within tips (NO prices or links)
- Focus on maintenance, usage tips, and best practices`;

/**
 * Gets the system prompt version from environment
 *
 * Environment variable: NEXT_PUBLIC_SYSTEM_PROMPT_VERSION
 * Defaults to 'v4'
 *
 * @returns System prompt version to use
 */
export function getSystemPromptVersion(): SystemPromptVersion {
  const envVersion = process.env.NEXT_PUBLIC_SYSTEM_PROMPT_VERSION?.toLowerCase();

  switch (envVersion) {
    case 'v1':
      return SystemPromptVersion.V1;
    case 'v2':
      return SystemPromptVersion.V2;
    case 'v4':
      return SystemPromptVersion.V4;
    default:
      // Default to v4 (latest)
      return SystemPromptVersion.V4;
  }
}

/**
 * Loads the system prompt based on configured version
 *
 * @param version - Optional version override (defaults to env config)
 * @returns System prompt string
 */
export function loadSystemPrompt(version?: SystemPromptVersion): string {
  const promptVersion = version || getSystemPromptVersion();

  switch (promptVersion) {
    case SystemPromptVersion.V1:
      console.log('[System Prompt] Using v1.0 (legacy)');
      return SYSTEM_PROMPT_V1;

    case SystemPromptVersion.V2:
      console.log('[System Prompt] Using v2.0 (enhanced)');
      return SYSTEM_PROMPT_V2;

    case SystemPromptVersion.V4:
      console.log('[System Prompt] Using v4.0 (conversation-aligned)');
      return SYSTEM_PROMPT_V4;

    default:
      console.warn(`[System Prompt] Unknown version: ${promptVersion}, defaulting to v4.0`);
      return SYSTEM_PROMPT_V4;
  }
}

/**
 * Gets system prompt metadata
 *
 * @param version - System prompt version
 * @returns Metadata about the prompt version
 */
export function getSystemPromptMetadata(version?: SystemPromptVersion): {
  version: SystemPromptVersion;
  features: string[];
  description: string;
} {
  const promptVersion = version || getSystemPromptVersion();

  switch (promptVersion) {
    case SystemPromptVersion.V1:
      return {
        version: SystemPromptVersion.V1,
        features: ['Basic fashion recommendations', 'DialogTemplate14-2 compliance'],
        description: 'Legacy system prompt without advanced features',
      };

    case SystemPromptVersion.V2:
      return {
        version: SystemPromptVersion.V2,
        features: [
          'Friendly conversational tone',
          'Session-based duplicate prevention',
          'Smart clarification logic',
          'Topic guardrails',
          'DialogTemplate14-2 compliance',
          'Enhanced personality',
        ],
        description: 'Enhanced system prompt with v2.0 features',
      };

    case SystemPromptVersion.V4:
      return {
        version: SystemPromptVersion.V4,
        features: [
          'Context sufficiency check',
          'Maximum 1 clarification (reduced from 2)',
          'Always 2 looks minimum',
          'Mandatory style names in headers',
          'Find Similar feature support',
          'Post-recommendation follow-ups',
          'Keep current outfit card design',
          'OOT Persona with Thai-English code-switching',
          'Session-based duplicate prevention',
          'Topic guardrails',
        ],
        description: 'Conversation-aligned system prompt with context sufficiency and 2 looks minimum',
      };

    default:
      return {
        version: SystemPromptVersion.V4,
        features: [],
        description: 'Unknown version',
      };
  }
}

/**
 * Validates that required environment variables are set
 *
 * @returns Validation result
 */
export function validatePromptConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check OpenRouter API key (required)
  if (!process.env.OPENROUTER_API_KEY && !process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
    errors.push('OpenRouter API key not configured (OPENROUTER_API_KEY or NEXT_PUBLIC_OPENROUTER_API_KEY)');
  }

  // Check prompt version (optional, defaults to v4)
  const version = process.env.NEXT_PUBLIC_SYSTEM_PROMPT_VERSION;
  if (version && version !== 'v1' && version !== 'v2' && version !== 'v4') {
    warnings.push(`Invalid NEXT_PUBLIC_SYSTEM_PROMPT_VERSION: "${version}". Defaulting to v4.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Checks if a feature is available in the current prompt version
 *
 * @param feature - Feature to check
 * @returns True if feature is available
 */
export function isFeatureAvailable(feature: string): boolean {
  const version = getSystemPromptVersion();
  const metadata = getSystemPromptMetadata(version);

  return metadata.features.some((f) => f.toLowerCase().includes(feature.toLowerCase()));
}

/**
 * Export all utilities and constants
 */
export default {
  SystemPromptVersion,
  getSystemPromptVersion,
  loadSystemPrompt,
  getSystemPromptMetadata,
  validatePromptConfig,
  isFeatureAvailable,
};
