// TypeScript interfaces for OOTDay Fashion Assistant

// Export all new type definitions
export * from './types/enums'
export * from './types/localization-types'
export * from './types/product-types'

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
