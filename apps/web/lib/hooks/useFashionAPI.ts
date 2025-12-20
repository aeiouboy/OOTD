"use client"

import { useState, useCallback } from "react"
import { MockFashionAPI, APIError } from "../api-mock"
import type { OutfitRequest, OutfitResponse, Product } from "../types"

export function useFashionAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOutfitRecommendations = useCallback(async (request: OutfitRequest): Promise<OutfitResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await MockFashionAPI.getOutfitRecommendations(request)
      return response
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : "Failed to get outfit recommendations"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const searchProducts = useCallback(async (query: string, filters?: any): Promise<Product[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const products = await MockFashionAPI.searchProducts(query, filters)
      return products
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : "Failed to search products"
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getProductDetails = useCallback(async (sku: string): Promise<Product | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const product = await MockFashionAPI.getProductDetails(sku)
      return product
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : "Failed to get product details"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveOutfit = useCallback(async (userId: string, outfitId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await MockFashionAPI.saveOutfit(userId, outfitId)
      if (!success) {
        setError("Failed to save outfit")
      }
      return success
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : "Failed to save outfit"
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    clearError,
    getOutfitRecommendations,
    searchProducts,
    getProductDetails,
    saveOutfit,
  }
}
