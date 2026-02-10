import type { OccasionPreset, OccasionFlatLayRequest, OccasionPresetConfig } from '@/lib/types/image-types';
import type { OccasionType } from '@/lib/types/enums';

/**
 * Configuration map for all occasion presets.
 * Each preset defines styling parameters used to build the system prompt
 * for AI-curated outfit generation and flat-lay image creation.
 */
export const OCCASION_PRESET_CONFIGS: Record<OccasionPreset, OccasionPresetConfig> = {
  'weekend-social': {
    preset: 'weekend-social',
    label: 'Weekend & Social',
    emoji: '☀️',
    occasionTypes: ['chill', 'cafe'] as OccasionType[],
    formalityRange: { min: 1, max: 5 },
    defaultColorPalette: ['pastel', 'white', 'denim', 'earth-tones'],
    keyPieces: ['T-shirt', 'Jeans', 'Sneakers', 'Casual dress', 'Crossbody bag'],
  },
  'date-night': {
    preset: 'date-night',
    label: 'Date Night',
    emoji: '🌙',
    occasionTypes: ['date', 'dinner'] as OccasionType[],
    formalityRange: { min: 4, max: 8 },
    defaultColorPalette: ['red', 'black', 'navy', 'burgundy', 'gold'],
    keyPieces: ['Cocktail dress', 'Heels', 'Clutch', 'Statement jewelry', 'Silk top'],
  },
  'everyday-casual': {
    preset: 'everyday-casual',
    label: 'Everyday Casual',
    emoji: '👟',
    occasionTypes: ['chill', 'travel'] as OccasionType[],
    formalityRange: { min: 1, max: 4 },
    defaultColorPalette: ['neutral', 'beige', 'white', 'grey', 'soft-tones'],
    keyPieces: ['Cotton T-shirt', 'Comfortable pants', 'Sneakers', 'Tote bag', 'Light cardigan'],
  },
};

/**
 * Get the configuration for a specific occasion preset.
 */
export function getOccasionPresetConfig(preset: OccasionPreset): OccasionPresetConfig {
  return OCCASION_PRESET_CONFIGS[preset];
}

/**
 * Get all occasion preset configurations as an array.
 */
export function getAllOccasionPresets(): OccasionPresetConfig[] {
  return Object.values(OCCASION_PRESET_CONFIGS);
}

/**
 * Build a comprehensive system prompt for occasion-based flat-lay generation.
 *
 * Takes a user request with an occasion preset and interpolates all configuration
 * values into a structured prompt that guides the AI to:
 * 1. Analyze user context
 * 2. Curate outfit items appropriate for the occasion
 * 3. Generate a flat-lay image prompt
 */
export function buildOccasionFlatLaySystemPrompt(request: OccasionFlatLayRequest): string {
  const config = OCCASION_PRESET_CONFIGS[request.occasion];

  const userName = request.userName || 'Fashionista';
  const userAge = request.userAge || 'not specified';
  const stylePreferences =
    request.stylePreferences && request.stylePreferences.length > 0
      ? request.stylePreferences.join(', ')
      : 'versatile and trendy';
  const hasReferenceImage = request.hasReferenceImage || false;

  return `You are OOTDay, an AI fashion styling assistant. Your task is to curate a complete outfit and generate a flat-lay image prompt.

## User Profile
- Name: ${userName}
- Age: ${userAge}
- Style Preferences: ${stylePreferences}
- Has Reference Image: ${hasReferenceImage}

## Selected Occasion: ${config.label} ${config.emoji}
- Occasion Types: ${config.occasionTypes.join(', ')}
- Formality Range: ${config.formalityRange.min}-${config.formalityRange.max} out of 10
- Recommended Color Palette: ${config.defaultColorPalette.join(', ')}
- Key Pieces to Consider: ${config.keyPieces.join(', ')}

## Your Task

### Step 1: Analyze User Context
Consider the user's age, style preferences, and the selected occasion to determine the most appropriate outfit direction.

### Step 2: Curate Outfit Items
Select a minimum of 3 items (no maximum) from women's clothing that form a cohesive outfit. Each item must be:
- Appropriate for the occasion's formality range
- Compatible with the user's style preferences
- Color-coordinated using the recommended palette
- IMPORTANT: No duplicate item categories (e.g., don't pick two tops)

For each item, provide:
- Item name (generic, no brand names)
- Category (e.g., Top, Bottom, Dress, Shoes, Bag, Accessory)
- Color
- Brief visual description

### Step 3: Generate Flat-Lay Image Prompt
After curating the outfit, write a detailed image generation prompt that follows these MANDATORY specifications:

**Required Elements:**
- Studio white/light background
- Overhead (bird's-eye view) camera angle
- 1:1 square aspect ratio
- Professional flat-lay photography style
- Each item clearly visible and well-spaced
- Soft, diffused lighting with no harsh shadows

**Forbidden Elements:**
- NO text, labels, or watermarks of any kind
- NO colored or patterned backgrounds
- NO human body parts (hands, feet, etc.)
- NO unrelated props or decorations
- NO brand logos or tags

### Step 4: Output Format
Respond in this exact format:

CURATED_ITEMS:
1. [Item Name] | [Category] | [Color] | [Visual Description]
2. [Item Name] | [Category] | [Color] | [Visual Description]
3. [Item Name] | [Category] | [Color] | [Visual Description]
(continue for all items)

IMAGE_PROMPT:
A high-resolution, studio-lit flat-lay photograph showing [number] fashion items arranged as a coordinated ${config.label.toLowerCase()} outfit on a pristine white surface. The items are: [describe each item with color and style]. The composition uses balanced spacing with each piece clearly visible and proportionally sized. Photographed from directly overhead with soft, diffused three-point lighting that eliminates harsh shadows and preserves accurate colors. Professional e-commerce product photography quality with sharp focus across all items. Clean, minimal styling. Square 1:1 format.`;
}
