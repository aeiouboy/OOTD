'use client';

import { cn } from '@/lib/utils';

interface CarouselDotsProps {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotClick?: (index: number) => void;
  className?: string;
}

/**
 * CarouselDots - Reusable dot indicator component for carousels
 * Shows current position within a scrollable carousel
 */
export function CarouselDots({
  selectedIndex,
  scrollSnaps,
  onDotClick,
  className,
}: CarouselDotsProps) {
  return (
    <div className={cn('flex justify-center gap-2 py-3', className)}>
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onDotClick?.(index)}
          className={cn(
            'w-2 h-2 rounded-full transition-all duration-300',
            index === selectedIndex
              ? 'bg-[var(--onboarding-primary)] w-4'
              : 'bg-gray-300 hover:bg-gray-400'
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}
