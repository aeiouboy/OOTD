/**
 * Selection Carousel Type Definitions
 * Reusable types for carousel-based selection components
 */

/**
 * Generic item interface for SelectionCarousel component
 * Compatible with StylePreference, Outfit, and other selectable items
 */
export interface SelectionCarouselItem {
  id: string;
  name: string;
  description: string;
  cardDescription?: string;
  imageUrl?: string;
}

/**
 * Props for the SelectionCarousel component
 */
export interface SelectionCarouselProps<T extends SelectionCarouselItem> {
  /** Title displayed at the top of the carousel (crimson text) */
  title: string;
  /** Subtitle displayed below the title (gray text) */
  subtitle: string;
  /** Array of items to display in the carousel */
  items: T[];
  /** Array of currently selected items */
  selectedItems: T[];
  /** Callback when an item is selected/deselected */
  onSelect: (item: T) => void;
  /** Callback when an item is removed from selection */
  onRemove: (itemId: string) => void;
  /** Callback when the next/action button is clicked */
  onAction?: () => void;
  /** Whether the action button should be disabled */
  actionDisabled?: boolean;
  /** Whether to allow multiple selections (default: true) */
  multiSelect?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Custom render function for carousel cards */
  renderCard?: (item: T, isSelected: boolean, onToggle: () => void) => React.ReactNode;
}
