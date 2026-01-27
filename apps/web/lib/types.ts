// TypeScript interfaces for OOTDay Fashion Assistant

// Export all new type definitions
export * from './types/enums'
export * from './types/localization-types'
export * from './types/product-types'

// Re-export FlatLayItem from image-types for use in ChatMessage
import type { FlatLayItem } from './types/image-types'
export type { FlatLayItem }

// Re-export EnhancedMockProduct and ColorTone from mock-data02.ts for enhanced outfit generation
export type { EnhancedMockProduct, ColorTone } from './mock-data02'

// Legacy interfaces maintained for backward compatibility
// These will gradually be replaced by EnhancedProduct
export interface OutfitRequest {
  query: string
  userId?: string
  context?: {
    occasion?: string
    weather?: string
    preferences?: string[]
  }
}

export interface OutfitResponse {
  outfits: Outfit[]
  conversationId: string
  suggestions: string[]
}

export interface Outfit {
  id: string
  title: string
  description: string
  totalPrice: number
  items: Product[]
  imageUrl?: string
  /** Flat-lay image URL for outfit visualization (v5.0) */
  flatLayImageUrl?: string
  /** Flat-lay image as base64 fallback (v5.0) */
  flatLayImageBase64?: string
  /** Flag indicating flat-lay image is being generated (v5.0) */
  isGeneratingFlatLay?: boolean
  /** Try-on image URL for fitting model visualization (v6.0) */
  tryOnImageUrl?: string
  /** Try-on image as base64 fallback (v6.0) */
  tryOnImageBase64?: string
  /** Flag indicating try-on image is being generated (v6.0) */
  isGeneratingTryOn?: boolean
  /** Pinterest 2026 aesthetic category (v7.0) */
  aesthetic?: import('./types/enums').AestheticCategory
  /** Trending color palette (v7.0) */
  colorPalette?: import('./types/enums').ColorPalette
  /** Layering style (v7.0) */
  layeringStyle?: import('./types/enums').LayeringStyle
}

/**
 * @deprecated Use EnhancedProduct from './types/product-types' instead
 * This interface is kept for backward compatibility
 */
export interface Product {
  sku: string
  name: string
  brand: string
  price: number
  imageUrl: string
  availability: "in_stock" | "low_stock" | "out_of_stock"
  storeLocations?: string[]
  onlineUrl?: string
  sizes?: string[]
  colors?: string[]
  category?: string // "Men", "Women", or other categories
  subCategory?: string // "Blazer", "Skirt", "Pants", etc.
  visualDescription?: string // For AI Image Generation prompt
  occasion?: string[] // For filtering
}

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  outfits?: Outfit[]
  /** Image URL for generated outfit visualization (v3.1) */
  imageUrl?: string
  /** Base64-encoded image data (v3.1) */
  imageBase64?: string
  /** Outfit description used for image generation (v3.1) */
  outfitDescription?: string
  /** Image display mode: 'portrait' (3:4) or 'flat-lay' (1:1 square) (v4.0) */
  displayMode?: 'portrait' | 'flat-lay'
  /** Recommended items for flat-lay display (v4.0) */
  recommendedItems?: FlatLayItem[]
}

export interface ConversationStarter {
  id: string
  text: string
  category: string
}

export interface FilterState {
  gender?: 'all' | 'men' | 'women'
  occasion?: string[]  // ['work', 'casual', 'date', 'formal']
  priceRange?: { min: number; max: number }
  searchQuery?: string
}
