/**
 * Type definitions for image generation feature (Customer Journey Step 4)
 * Supports text-to-image generation for outfit visualization using OpenRouter's Gemini 2.5 Flash Image model
 */

/**
 * Background styles for hybrid flat-lay generation
 * Maps to different textured backgrounds that complement various fashion aesthetics
 */
export type BackgroundStyle =
  | 'white-clean'      // Pure white, minimal
  | 'marble-white'     // White marble texture, quiet-luxury
  | 'marble-grey'      // Grey marble texture, corporate-chic
  | 'wood-light'       // Light wood grain, natural
  | 'wood-dark'        // Dark wood grain, dark-academia
  | 'linen-natural'    // Natural linen texture, clean-girl
  | 'linen-grey';      // Grey linen texture, casual-chic

/**
 * User aesthetic preferences that map to background styles
 */
export type UserAesthetic =
  | 'clean-girl'
  | 'quiet-luxury'
  | 'corporate-chic'
  | 'dark-academia'
  | 'scandinavian-minimal'
  | 'casual-chic'
  | 'bohemian'
  | 'streetwear'
  | 'romantic';

/**
 * Individual item in a flat-lay composition
 */
export interface FlatLayItem {
  /** Product name */
  name: string;
  /** Product category (e.g., 'Dress', 'Shoes') */
  category: string;
  /** Product color for prompt accuracy */
  color?: string;
  /** Optional detailed visual description */
  visualDescription?: string;
  /** Product SKU for tracking which actual product this item represents */
  sku?: string;
  /** Product thumbnail URL for composite image generation or validation */
  thumbnailUrl?: string;
  /** Whether this item passed visual consistency validation */
  isVisuallyConsistent?: boolean;
}

/**
 * Request payload for flat-lay image generation
 */
export interface FlatLayRequest {
  /** Array of recommended products */
  items: FlatLayItem[];
  /** Total item count for display */
  totalItems?: number;
  /** Optional occasion context (e.g., 'work outfit') */
  occasionContext?: string;
}

/**
 * Request payload for image generation API
 */
export interface ImageGenerationRequest {
  /** Description of the outfit to generate (fashion context extracted from conversation) */
  description: string;
  /** Optional style parameters for image generation */
  style?: {
    /** Photography style: 'professional', 'casual', 'studio', 'lifestyle' */
    photographyStyle?: string;
    /** Composition: 'full-body', 'flat-lay', 'mannequin', '3/4-view' */
    composition?: string;
    /** Lighting mood: 'natural', 'studio', 'soft', 'bright' */
    lighting?: string;
    /** Cultural context: 'thai-contemporary', 'minimalist', 'classic', 'modern' */
    aestheticContext?: string;
  };
  /**
   * Base64-encoded reference image for multimodal generation.
   * Must include data URL prefix (e.g., 'data:image/jpeg;base64,...').
   * Used for fitting model generation to enable accurate face-matching.
   */
  referenceImage?: string;
  /**
   * Type of image generation to perform.
   * - 'outfit': Standard outfit image generation (default)
   * - 'fitting-model': Fitting model generation with reference image for face-matching
   * - 'flat-lay': Flat-lay composition of recommended items (AI-only)
   * - 'hybrid-flat-lay': Hybrid flat-lay combining AI backgrounds with real product images
   * - 'try-on': Try-on generation showing outfit worn on user's fitting model
   * - 'try-on-dual': Try-on with dual image reference (fitting model + flat-lay outfit)
   */
  generationType?: 'outfit' | 'fitting-model' | 'flat-lay' | 'hybrid-flat-lay' | 'try-on' | 'try-on-dual';
  /**
   * Secondary reference image for dual-image generation (e.g., flat-lay image for try-on).
   * Must include data URL prefix (e.g., 'data:image/jpeg;base64,...').
   * Used in 'try-on-dual' mode to show the exact outfit items the model must wear.
   */
  secondaryReferenceImage?: string;
  /**
   * Items for flat-lay generation (required when generationType is 'flat-lay')
   */
  flatLayItems?: FlatLayItem[];
  /**
   * Occasion context for flat-lay generation
   */
  occasionContext?: string;
  /**
   * Background style for hybrid flat-lay generation
   */
  backgroundStyle?: BackgroundStyle;
  /**
   * User aesthetic preference for automatic background style mapping
   */
  userAesthetic?: UserAesthetic;
}

/**
 * Response from image generation API
 */
export interface ImageGenerationResponse {
  /** URL to the generated image (if hosted) */
  imageUrl?: string;
  /** Base64-encoded image data (if returned inline) */
  imageBase64?: string;
  /** Metadata about the generated image */
  metadata?: {
    /** Model used for generation */
    model: string;
    /** Generation timestamp */
    generatedAt: string;
    /** Prompt used for generation */
    prompt?: string;
    /** Image dimensions */
    dimensions?: {
      width: number;
      height: number;
    };
  };
  /** Error message if generation failed */
  error?: string;
  /** User-friendly message for display */
  message?: string;
  /** Success flag */
  success: boolean;
}

/**
 * Props for LooksInspiration UI component
 */
export interface LooksInspirationProps {
  /** Outfit description used for generation */
  outfitDescription: string;
  /** URL to generated image */
  imageUrl?: string;
  /** Base64-encoded image data */
  imageBase64?: string;
  /** Loading state for image generation */
  isLoading?: boolean;
  /** Error message if generation failed */
  error?: string;
  /** Callback for retry button */
  onRetry?: () => void;
  /** Optional callback for "generate another" functionality */
  onGenerateAnother?: () => void;
  /** Optional callback for download functionality */
  onDownload?: () => void;
  /** Layout mode: 'portrait' (3:4) or 'flat-lay' (1:1 square) */
  displayMode?: 'portrait' | 'flat-lay';
  /** Items to display in flat-lay mode */
  recommendedItems?: FlatLayItem[];
  /** Optional custom header title */
  headerTitle?: string;
}

/**
 * Internal state for image generation in chat
 */
export interface ImageGenerationState {
  /** Whether image is currently being generated */
  isGenerating: boolean;
  /** Generated image URL */
  imageUrl?: string;
  /** Generated image base64 data */
  imageBase64?: string;
  /** Outfit description used for generation */
  outfitDescription?: string;
  /** Error message */
  error?: string;
}

/**
 * Processed product image with background removed
 */
export interface ProcessedProductImage {
  /** Original product SKU */
  sku: string;
  /** Product name for reference */
  name: string;
  /** Product category for layout positioning */
  category: string;
  /** Base64-encoded image with transparent background */
  imageBase64: string;
  /** Original image dimensions */
  originalDimensions: {
    width: number;
    height: number;
  };
  /** Whether processing was successful */
  success: boolean;
  /** Error message if processing failed */
  error?: string;
}

/**
 * Configuration for product image layout in composite
 */
export interface ProductLayoutConfig {
  /** X position (0-1 relative to canvas width) */
  x: number;
  /** Y position (0-1 relative to canvas height) */
  y: number;
  /** Rotation angle in degrees */
  rotation: number;
  /** Scale factor (1 = 100%) */
  scale: number;
  /** Z-index for layering */
  zIndex: number;
}

/**
 * Request for hybrid flat-lay generation
 */
export interface HybridFlatLayRequest {
  /** Products to include in the flat-lay */
  items: FlatLayItem[];
  /** Background style (or auto-detected from aesthetic) */
  backgroundStyle?: BackgroundStyle;
  /** User aesthetic preference for automatic background mapping */
  userAesthetic?: UserAesthetic;
  /** Occasion context for styling */
  occasionContext?: string;
  /** Canvas dimensions (default 1024x1024) */
  canvasDimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Response from hybrid flat-lay generation
 */
export interface HybridFlatLayResponse {
  /** Whether generation was successful */
  success: boolean;
  /** Final composite image as base64 */
  imageBase64?: string;
  /** URL if saved to disk */
  imageUrl?: string;
  /** Background style used */
  backgroundStyle?: BackgroundStyle;
  /** Products that were successfully processed */
  processedProducts: string[];
  /** Products that failed processing (excluded from composite) */
  failedProducts: string[];
  /** Error message if generation failed */
  error?: string;
  /** Human-readable message */
  message?: string;
}
