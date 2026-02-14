/**
 * Image URL utilities for detecting and filtering product images.
 *
 * Central Group product images come in two types:
 * 1. REAL product photos: assets.central.co.th/file-assets/CDSPIM/web/Image/...
 * 2. Overlay banners: assets.central.co.th/.../CDS/Product-Overlay/... (promotional images)
 *
 * Overlay banners are generic marketing images shared across products — they do NOT
 * show the actual product. ~50% of products in the catalog have overlay URLs.
 */

/**
 * Detect if an image URL is a Central overlay banner (promotional image, not a product photo).
 */
export function isOverlayBannerUrl(url: string | undefined | null): boolean {
  if (!url) return false
  return url.includes('Product-Overlay')
}

/**
 * Check if a product image URL points to a real product photo (CDSPIM images).
 */
export function isRealProductImageUrl(url: string | undefined | null): boolean {
  if (!url) return false
  return url.includes('CDSPIM')
}

/**
 * Check if a product has a valid, displayable image URL.
 * Returns false for placeholders, empty strings, and overlay banners.
 */
export function hasValidProductImage(imageUrl: string | undefined | null): boolean {
  if (!imageUrl || imageUrl === '') return false

  // Reject placeholder URLs
  if (
    imageUrl.includes('placeholder.svg') ||
    imageUrl.includes('?text=') ||
    imageUrl.includes('?height=')
  ) {
    return false
  }

  // Reject overlay banner URLs (promotional images, not real product photos)
  if (isOverlayBannerUrl(imageUrl)) return false

  return true
}
