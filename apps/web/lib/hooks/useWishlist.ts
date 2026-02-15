'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Outfit } from '@/lib/types'

const STORAGE_KEY = 'ootday-wishlist'

export interface WishlistItem {
  id: string
  outfit: Outfit
  savedAt: number
}

function loadWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as WishlistItem[]
  } catch {
    return []
  }
}

function saveWishlist(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Quota exceeded - silently fail
  }
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    setItems(loadWishlist())
  }, [])

  const isInWishlist = useCallback(
    (outfitId: string) => items.some((item) => item.id === outfitId),
    [items]
  )

  const addToWishlist = useCallback((outfit: Outfit) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === outfit.id)) return prev
      const next = [...prev, { id: outfit.id, outfit, savedAt: Date.now() }]
      saveWishlist(next)
      return next
    })
  }, [])

  const removeFromWishlist = useCallback((outfitId: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== outfitId)
      saveWishlist(next)
      return next
    })
  }, [])

  const toggleWishlist = useCallback((outfit: Outfit) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === outfit.id)
      const next = exists
        ? prev.filter((item) => item.id !== outfit.id)
        : [...prev, { id: outfit.id, outfit, savedAt: Date.now() }]
      saveWishlist(next)
      return next
    })
  }, [])

  const clearWishlist = useCallback(() => {
    setItems([])
    saveWishlist([])
  }, [])

  return {
    items,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    count: items.length,
  }
}
