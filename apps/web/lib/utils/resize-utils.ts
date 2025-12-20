/**
 * Utility functions for panel resize calculations and constraints
 * Used by the resizable chat panel feature
 */

// Constants for panel sizing
export const DEFAULT_WIDTH = 420
export const MIN_WIDTH = 280
export const MAX_WIDTH_PERCENT = 50
export const STORAGE_KEY = 'ootday-chat-panel-width'

/**
 * Calculates the maximum allowed width based on viewport width
 * @param viewportWidth - Current viewport width in pixels
 * @param maxWidthPercent - Maximum width as percentage of viewport (default 50)
 * @returns Maximum width in pixels
 */
export function calculateMaxWidth(
  viewportWidth: number,
  maxWidthPercent: number = MAX_WIDTH_PERCENT
): number {
  return Math.floor((viewportWidth * maxWidthPercent) / 100)
}

/**
 * Constrains a width value between minimum and maximum bounds
 * @param width - Width to constrain
 * @param minWidth - Minimum allowed width
 * @param maxWidthPercent - Maximum width as percentage of viewport
 * @param viewportWidth - Current viewport width
 * @returns Constrained width value
 */
export function clampWidth(
  width: number,
  minWidth: number,
  maxWidthPercent: number,
  viewportWidth: number
): number {
  const maxWidth = calculateMaxWidth(viewportWidth, maxWidthPercent)
  return Math.max(minWidth, Math.min(width, maxWidth))
}

/**
 * Checks if a width value is within allowed constraints
 * @param width - Width to validate
 * @param minWidth - Minimum allowed width
 * @param maxWidth - Maximum allowed width
 * @returns True if width is within bounds, false otherwise
 */
export function isWithinConstraints(
  width: number,
  minWidth: number,
  maxWidth: number
): boolean {
  return width >= minWidth && width <= maxWidth
}
