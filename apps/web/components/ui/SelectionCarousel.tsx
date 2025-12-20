'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { SelectionThumbnail } from './SelectionThumbnail';
import { CarouselDots } from './CarouselDots';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import type {
  SelectionCarouselItem,
  SelectionCarouselProps,
} from '@/lib/types/selection-types';

/**
 * SelectionCarousel - Reusable carousel selection component
 * Follows the brand design system from OnboardingStyle
 *
 * Features:
 * - Header with crimson title and gray subtitle
 * - Selected items row with 60x80px thumbnails
 * - Horizontal embla-carousel with 160px cards
 * - Left-border accent when selected
 * - Circular crimson arrow button at bottom
 * - Warm beige background
 */
export function SelectionCarousel<T extends SelectionCarouselItem>({
  title,
  subtitle,
  items,
  selectedItems,
  onSelect,
  onRemove,
  onAction,
  actionDisabled,
  multiSelect = true,
  className,
  renderCard,
}: SelectionCarouselProps<T>) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: false,
    dragFree: true,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleImageError = (itemId: string) => {
    setFailedImages((prev) => new Set(prev).add(itemId));
  };

  const isSelected = (itemId: string) => {
    return selectedItems.some((item) => item.id === itemId);
  };

  const handleToggle = (item: T) => {
    if (!multiSelect && !isSelected(item.id)) {
      // In single-select mode, deselect all others first
      selectedItems.forEach((selected) => onRemove(selected.id));
    }
    onSelect(item);
  };

  return (
    <div className={cn('flex flex-col min-h-screen bg-[var(--onboarding-bg)]', className)}>
      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          {/* Heading - Left Aligned */}
          <div className="text-left space-y-1">
            <h1 className="text-3xl font-bold text-[var(--onboarding-primary)]">
              {title}
            </h1>
            <p className="text-base text-gray-900">
              {subtitle}
            </p>
          </div>

          {/* Selected Items Thumbnails - Below Header, Left Aligned */}
          {selectedItems.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {selectedItems.map((item) => (
                <SelectionThumbnail
                  key={item.id}
                  imageUrl={item.imageUrl}
                  alt={`${item.name} selected`}
                  onRemove={() => onRemove(item.id)}
                />
              ))}
            </div>
          )}

          {/* Carousel */}
          <div className="overflow-hidden -mx-6" ref={emblaRef}>
            <div className="flex gap-4 px-6"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {items.map((item) => {
                const selected = isSelected(item.id);

                // Use custom render function if provided
                if (renderCard) {
                  return (
                    <div
                      key={item.id}
                      className="flex-[0_0_160px] min-w-0"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {renderCard(item, selected, () => handleToggle(item))}
                    </div>
                  );
                }

                // Default card render
                return (
                  <div
                    key={item.id}
                    className="flex-[0_0_160px] min-w-0"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <button
                      onClick={() => handleToggle(item)}
                      className={cn(
                        'w-full rounded-2xl overflow-hidden bg-white shadow-sm border-l-4 selection-carousel-card carousel-card-border',
                        selected
                          ? 'border-l-[var(--onboarding-primary)] carousel-card-selected'
                          : 'border-l-transparent'
                      )}
                    >
                      {/* Item Image */}
                      <div className="w-full h-[220px] overflow-hidden rounded-t-2xl">
                        {item.imageUrl && !failedImages.has(item.id) ? (
                          <img
                            src={item.imageUrl}
                            alt={`${item.name}`}
                            loading="lazy"
                            onError={() => handleImageError(item.id)}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-4xl">👗</span>
                          </div>
                        )}
                      </div>

                      {/* Card Content - Inside white card, centered */}
                      <div className="p-3">
                        {/* Title - Red Text: "Name · Description", centered */}
                        <h3 className="text-sm font-bold text-[var(--onboarding-primary)] text-center">
                          {item.name} · {item.description}
                        </h3>

                        {/* Card Description - Gray Text, centered */}
                        {item.cardDescription && (
                          <p className="mt-2 text-xs text-gray-500 text-center line-clamp-3">
                            {item.cardDescription}
                          </p>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll Position Indicators */}
          {scrollSnaps.length > 1 && (
            <CarouselDots
              selectedIndex={selectedIndex}
              scrollSnaps={scrollSnaps}
              onDotClick={scrollTo}
            />
          )}

          {/* Next Button - Circular Crimson, Bottom Center */}
          {onAction && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={onAction}
                disabled={actionDisabled ?? selectedItems.length === 0}
                className="w-14 h-14 rounded-full bg-[var(--onboarding-primary)] hover:bg-[var(--onboarding-primary-hover)] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
