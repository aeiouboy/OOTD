/**
 * Type definitions for image generation feature (Customer Journey Step 4)
 * Supports text-to-image generation for outfit visualization using OpenRouter's Gemini 2.5 Flash Image model
 */

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
