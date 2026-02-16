'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Outfit } from '@/lib/types';
import { FlatLayComposite } from '@/components/outfit/FlatLayComposite';

interface OutfitCarouselCardProps {
  outfit: Outfit;
  isSelected: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * OutfitCarouselCard - Specialized card for outfit display in carousel context
 * Follows the brand design system from OnboardingStyle
 *
 * Features:
 * - 160px card width with 220px image height
 * - White background with rounded corners
 * - Left-border accent (crimson) when selected
 * - Centered pink "Title · Description" header
 * - Gray description text with line-clamp
 * - Price display
 */
export function OutfitCarouselCard({
  outfit,
  isSelected,
  onToggle,
  className,
}: OutfitCarouselCardProps) {
  const [imageError, setImageError] = useState(false);

  // Determine image source: prefer AI flat-lay, then use FlatLayComposite
  // Never fall back to mannequin-style product thumbnail for the main card image
  const hasFlatLayImage = !!(outfit.flatLayImageUrl || outfit.flatLayImageBase64);
  const flatLayImage = outfit.flatLayImageUrl || outfit.flatLayImageBase64;
  const isGenerating = outfit.isGeneratingFlatLay;

  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full rounded-2xl overflow-hidden transition-all duration-300 bg-white shadow-sm border-l-4',
        isSelected
          ? 'border-l-[var(--onboarding-primary)]'
          : 'border-l-transparent',
        className
      )}
    >
      {/* Outfit Image - Three-tier fallback: AI flat-lay > FlatLayComposite > placeholder */}
      <div className="w-full h-[220px] overflow-hidden rounded-t-2xl bg-gray-100">
        {isGenerating ? (
          // Loading skeleton while flat-lay is generating
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="flex space-x-1 mb-2">
              <div className="w-2 h-2 bg-[var(--onboarding-primary)] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[var(--onboarding-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-[var(--onboarding-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <p className="text-xs text-gray-500">กำลังสร้างภาพ...</p>
          </div>
        ) : hasFlatLayImage && flatLayImage && !imageError ? (
          // Show AI-generated flat-lay image (preferred)
          <img
            src={flatLayImage}
            alt={outfit.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain"
          />
        ) : outfit.items && outfit.items.length > 0 ? (
          // Fallback: Use FlatLayComposite (CSS-based flat-lay) instead of mannequin thumbnail
          <FlatLayComposite items={outfit.items} renderMode="abstract" />
        ) : (
          // Placeholder when no image and no items available
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-4xl">👗</span>
          </div>
        )}
      </div>

      {/* Card Content - Inside white card, centered */}
      <div className="p-3">
        {/* Title - Red Text, centered */}
        <h3 className="text-sm font-bold text-[var(--onboarding-primary)] text-center line-clamp-2">
          {outfit.title}
        </h3>

        {/* Description - Gray Text, centered */}
        {outfit.description && (
          <p className="mt-2 text-xs text-gray-500 text-center line-clamp-3">
            {outfit.description}
          </p>
        )}

        {/* Price and Items Count */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-sm font-bold text-[var(--onboarding-primary)]">
            ฿{outfit.totalPrice.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">
            · {outfit.items.length} items
          </span>
        </div>
      </div>
    </button>
  );
}
