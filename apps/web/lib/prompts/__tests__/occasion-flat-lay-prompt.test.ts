import { describe, it, expect } from 'vitest';
import {
  buildOccasionFlatLaySystemPrompt,
  getOccasionPresetConfig,
  getAllOccasionPresets,
  OCCASION_PRESET_CONFIGS,
} from '../occasion-flat-lay-prompt';
import type { OccasionFlatLayRequest } from '@/lib/types/image-types';
import type { OccasionPreset } from '@/lib/types/image-types';

// ---------------------------------------------------------------------------
// buildOccasionFlatLaySystemPrompt
// ---------------------------------------------------------------------------

describe('occasion-flat-lay-prompt', () => {
  describe('buildOccasionFlatLaySystemPrompt', () => {
    const baseRequest: OccasionFlatLayRequest = {
      occasion: 'weekend-social',
      userName: 'Ploy',
      userAge: '20-29',
      stylePreferences: ['clean-girl', 'minimalist'],
    };

    it('includes user name in the prompt', () => {
      const prompt = buildOccasionFlatLaySystemPrompt(baseRequest);
      expect(prompt).toContain('Ploy');
    });

    it('includes age in the prompt', () => {
      const prompt = buildOccasionFlatLaySystemPrompt(baseRequest);
      expect(prompt).toContain('20-29');
    });

    it('includes all style preferences', () => {
      const prompt = buildOccasionFlatLaySystemPrompt(baseRequest);
      expect(prompt).toContain('clean-girl');
      expect(prompt).toContain('minimalist');
    });

    it('generates distinct prompts for each occasion preset', () => {
      const presets: OccasionPreset[] = ['weekend-social', 'date-night', 'everyday-casual'];
      const prompts = presets.map((occasion) =>
        buildOccasionFlatLaySystemPrompt({ ...baseRequest, occasion })
      );

      // All three prompts should be different
      expect(prompts[0]).not.toBe(prompts[1]);
      expect(prompts[1]).not.toBe(prompts[2]);
      expect(prompts[0]).not.toBe(prompts[2]);

      // Each prompt should contain its occasion label
      expect(prompts[0]).toContain('Weekend & Social');
      expect(prompts[1]).toContain('Date Night');
      expect(prompts[2]).toContain('Everyday Casual');
    });

    it('uses sensible defaults when optional fields are omitted', () => {
      const minimalRequest: OccasionFlatLayRequest = {
        occasion: 'weekend-social',
      };
      const prompt = buildOccasionFlatLaySystemPrompt(minimalRequest);

      // Default userName
      expect(prompt).toContain('Fashionista');
      // Default age
      expect(prompt).toContain('not specified');
      // Default style preferences
      expect(prompt).toContain('versatile and trendy');
      // Default hasReferenceImage
      expect(prompt).toContain('Has Reference Image: false');
    });

    it('includes mandatory image specifications', () => {
      const prompt = buildOccasionFlatLaySystemPrompt(baseRequest);

      // White/light background
      expect(prompt).toMatch(/white/i);
      // Overhead camera angle
      expect(prompt).toMatch(/overhead/i);
      // 1:1 aspect ratio
      expect(prompt).toContain('1:1');
      // No text constraint
      expect(prompt).toMatch(/NO text/i);
      // No brand logos constraint
      expect(prompt).toMatch(/NO brand/i);
    });

    it('includes occasion-specific configuration values', () => {
      const dateNightPrompt = buildOccasionFlatLaySystemPrompt({
        ...baseRequest,
        occasion: 'date-night',
      });

      // Date night formality range
      expect(dateNightPrompt).toContain('4-8');
      // Date night color palette entries
      expect(dateNightPrompt).toContain('red');
      expect(dateNightPrompt).toContain('black');
      expect(dateNightPrompt).toContain('burgundy');
      // Date night key pieces
      expect(dateNightPrompt).toContain('Cocktail dress');
      expect(dateNightPrompt).toContain('Heels');
    });

    it('includes the preset emoji', () => {
      const prompt = buildOccasionFlatLaySystemPrompt({
        ...baseRequest,
        occasion: 'date-night',
      });
      expect(prompt).toContain(OCCASION_PRESET_CONFIGS['date-night'].emoji);
    });

    it('handles hasReferenceImage flag', () => {
      const withRef = buildOccasionFlatLaySystemPrompt({
        ...baseRequest,
        hasReferenceImage: true,
      });
      expect(withRef).toContain('Has Reference Image: true');

      const withoutRef = buildOccasionFlatLaySystemPrompt({
        ...baseRequest,
        hasReferenceImage: false,
      });
      expect(withoutRef).toContain('Has Reference Image: false');
    });

    it('includes structured output format instructions', () => {
      const prompt = buildOccasionFlatLaySystemPrompt(baseRequest);
      expect(prompt).toContain('CURATED_ITEMS:');
      expect(prompt).toContain('IMAGE_PROMPT:');
    });

    it('includes the 4-step task structure', () => {
      const prompt = buildOccasionFlatLaySystemPrompt(baseRequest);
      expect(prompt).toContain('Step 1: Analyze User Context');
      expect(prompt).toContain('Step 2: Curate Outfit Items');
      expect(prompt).toContain('Step 3: Generate Flat-Lay Image Prompt');
      expect(prompt).toContain('Step 4: Output Format');
    });

    it('uses empty stylePreferences array as fallback to default', () => {
      const prompt = buildOccasionFlatLaySystemPrompt({
        occasion: 'weekend-social',
        stylePreferences: [],
      });
      expect(prompt).toContain('versatile and trendy');
    });
  });

  // ---------------------------------------------------------------------------
  // getOccasionPresetConfig
  // ---------------------------------------------------------------------------

  describe('getOccasionPresetConfig', () => {
    it('returns correct config for weekend-social', () => {
      const config = getOccasionPresetConfig('weekend-social');
      expect(config.preset).toBe('weekend-social');
      expect(config.label).toBe('Weekend & Social');
      expect(config.emoji).toBe('\u2600\uFE0F'); // sun emoji
    });

    it('returns correct config for date-night', () => {
      const config = getOccasionPresetConfig('date-night');
      expect(config.preset).toBe('date-night');
      expect(config.label).toBe('Date Night');
      expect(config.emoji).toBe('\uD83C\uDF19'); // moon emoji
    });

    it('returns correct config for everyday-casual', () => {
      const config = getOccasionPresetConfig('everyday-casual');
      expect(config.preset).toBe('everyday-casual');
      expect(config.label).toBe('Everyday Casual');
      expect(config.emoji).toBe('\uD83D\uDC5F'); // sneaker emoji
    });

    it('includes valid formality ranges for all presets', () => {
      const presets: OccasionPreset[] = ['weekend-social', 'date-night', 'everyday-casual'];
      for (const preset of presets) {
        const config = getOccasionPresetConfig(preset);
        expect(config.formalityRange.min).toBeLessThan(config.formalityRange.max);
        expect(config.formalityRange.min).toBeGreaterThanOrEqual(1);
        expect(config.formalityRange.max).toBeLessThanOrEqual(10);
      }
    });

    it('includes non-empty arrays for color palette and key pieces', () => {
      const presets: OccasionPreset[] = ['weekend-social', 'date-night', 'everyday-casual'];
      for (const preset of presets) {
        const config = getOccasionPresetConfig(preset);
        expect(config.defaultColorPalette.length).toBeGreaterThan(0);
        expect(config.keyPieces.length).toBeGreaterThan(0);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // getAllOccasionPresets
  // ---------------------------------------------------------------------------

  describe('getAllOccasionPresets', () => {
    it('returns exactly 3 presets', () => {
      const presets = getAllOccasionPresets();
      expect(presets).toHaveLength(3);
    });

    it('contains all three preset identifiers', () => {
      const presets = getAllOccasionPresets();
      const presetIds = presets.map((p) => p.preset);
      expect(presetIds).toContain('weekend-social');
      expect(presetIds).toContain('date-night');
      expect(presetIds).toContain('everyday-casual');
    });

    it('returns configs that match individual getOccasionPresetConfig calls', () => {
      const allPresets = getAllOccasionPresets();
      for (const config of allPresets) {
        const individual = getOccasionPresetConfig(config.preset);
        expect(config).toEqual(individual);
      }
    });
  });
});
