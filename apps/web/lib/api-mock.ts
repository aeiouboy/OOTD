// Mock API functions to simulate backend integration

import type { OutfitRequest, OutfitResponse, Product, Outfit } from "./types"
import { getMockOutfitResponse, mockProducts, mockOutfits, mockStores } from "./mock-data"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockFashionAPI {
  // Simulate outfit recommendation API
  static async getOutfitRecommendations(request: OutfitRequest): Promise<OutfitResponse> {
    await delay(1500) // Simulate network delay

    const mockResponse = getMockOutfitResponse(request.query)

    return {
      outfits: mockResponse.outfits || [],
      conversationId: `conv-${Date.now()}`,
      suggestions: [
        "Try asking about specific occasions",
        "Mention your preferred colors",
        "Ask about seasonal trends",
      ],
    }
  }

  // Simulate product search API
  static async searchProducts(
    query: string,
    filters?: {
      category?: string
      priceRange?: { min: number; max: number }
      brand?: string
      availability?: string
    },
  ): Promise<Product[]> {
    await delay(800)

    let results = mockProducts

    if (query) {
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (filters?.priceRange) {
      results = results.filter(
        (product) => product.price >= filters.priceRange!.min && product.price <= filters.priceRange!.max,
      )
    }

    if (filters?.brand) {
      results = results.filter((product) => product.brand.toLowerCase() === filters.brand!.toLowerCase())
    }

    if (filters?.availability) {
      results = results.filter((product) => product.availability === filters.availability)
    }

    return results
  }

  // Simulate product details API
  static async getProductDetails(sku: string): Promise<Product | null> {
    await delay(500)

    return mockProducts.find((product) => product.sku === sku) || null
  }

  // Simulate outfit details API
  static async getOutfitDetails(outfitId: string): Promise<Outfit | null> {
    await delay(600)

    return mockOutfits.find((outfit) => outfit.id === outfitId) || null
  }

  // Simulate store locator API
  static async findNearbyStores(location?: { lat: number; lng: number }, radius?: number) {
    await delay(700)

    // In a real app, this would filter by distance
    return mockStores
  }

  // Simulate user preferences API
  static async getUserPreferences(userId: string) {
    await delay(400)

    return {
      favoriteColors: ["Black", "White", "Navy"],
      preferredBrands: ["Central"],
      sizePreferences: { tops: "M", bottoms: "M", shoes: "40" },
      stylePreferences: ["Professional", "Casual"],
      budgetRange: { min: 500, max: 3000 },
    }
  }

  // Simulate save outfit API
  static async saveOutfit(userId: string, outfitId: string): Promise<boolean> {
    await delay(300)

    // Simulate success/failure
    return Math.random() > 0.1 // 90% success rate
  }

  // Simulate analytics API
  static async getUserAnalytics(userId: string) {
    await delay(500)

    return {
      totalConversations: Math.floor(Math.random() * 200) + 50,
      outfitsRecommended: Math.floor(Math.random() * 500) + 100,
      favoriteCategory: ["Professional", "Casual", "Formal"][Math.floor(Math.random() * 3)],
      averageSessionTime: `${Math.floor(Math.random() * 15) + 5}m ${Math.floor(Math.random() * 60)}s`,
    }
  }
}

// Error simulation for testing error states
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
  ) {
    super(message)
    this.name = "APIError"
  }
}

// Simulate network errors occasionally
export const simulateNetworkError = () => {
  if (Math.random() < 0.05) {
    // 5% chance of network error
    throw new APIError("Network connection failed", 503)
  }
}
