/**
 * Locale-prefixed compatibility route for image generation API.
 *
 * Some client/runtime paths may resolve to /{locale}/api/generate-image
 * (e.g., from relative navigation contexts). Delegate to the canonical
 * /api/generate-image handlers to avoid HTML 404 responses.
 */

export { POST, GET, OPTIONS } from '@/app/api/generate-image/route'

