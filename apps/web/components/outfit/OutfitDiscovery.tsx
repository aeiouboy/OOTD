'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { SelectionThumbnail } from '@/components/ui/SelectionThumbnail';
import { OutfitCarouselCard } from './OutfitCarouselCard';
import { OutfitSearchBar } from './OutfitSearchBar';
import { FilterPills } from './FilterPills';
import { EmptyOutfitState } from './EmptyOutfitState';
import { OutfitCardSkeleton } from './OutfitCardSkeleton';
import { useDebounce } from '@/lib/hooks/useDebounce';
import useEmblaCarousel from 'embla-carousel-react';
import type { Outfit } from '@/lib/types';

interface OutfitDiscoveryProps {
  outfits: Outfit[];
  onSelectOutfit: (outfit: Outfit) => void;
  onSelectedOutfitsChange?: (outfits: Outfit[]) => void;
  onAction?: () => void;
  isLoading?: boolean;
  onClearFilters?: () => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  multiSelect?: boolean;
  showSearchFilter?: boolean;
}

/**
 * OutfitDiscovery - Carousel-based outfit selection component
 * Redesigned to match the brand's style preference carousel design system
 *
 * Features:
 * - Header with crimson title and gray subtitle
 * - Selected items row with 60x80px thumbnails
 * - Horizontal embla-carousel with 160px outfit cards
 * - Left-border accent when selected
 * - Circular crimson arrow button at bottom
 * - Warm beige background
 * - Optional search and filter functionality
 */
export function OutfitDiscovery({
  outfits,
  onSelectOutfit,
  onSelectedOutfitsChange,
  onAction,
  isLoading = false,
  onClearFilters,
  onBack,
  title = 'Choose your look',
  subtitle = 'Select outfits that inspire you',
  multiSelect = true,
  showSearchFilter = false,
}: OutfitDiscoveryProps) {
  const [selectedOutfits, setSelectedOutfits] = useState<Outfit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter outfits based on search and selected occasions
  const filteredOutfits = outfits.filter((outfit) => {
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      const matchesTitle = outfit.title.toLowerCase().includes(query);
      const matchesDesc = outfit.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDesc) return false;
    }
    return true;
  });

  const isSelected = (outfitId: string) => {
    return selectedOutfits.some((o) => o.id === outfitId);
  };

  const toggleOutfit = (outfit: Outfit) => {
    setSelectedOutfits((prev) => {
      const alreadySelected = prev.some((o) => o.id === outfit.id);
      let newSelection: Outfit[];

      if (alreadySelected) {
        newSelection = prev.filter((o) => o.id !== outfit.id);
      } else {
        if (multiSelect) {
          newSelection = [...prev, outfit];
        } else {
          newSelection = [outfit];
        }
      }

      // Notify parent of selection change
      onSelectedOutfitsChange?.(newSelection);
      return newSelection;
    });

    // Also call the single outfit selection callback
    onSelectOutfit(outfit);
  };

  const removeOutfit = (outfitId: string) => {
    setSelectedOutfits((prev) => {
      const newSelection = prev.filter((o) => o.id !== outfitId);
      onSelectedOutfitsChange?.(newSelection);
      return newSelection;
    });
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  // Loading state with carousel-style skeletons
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--onboarding-bg)]">
        <div className="flex-1 flex flex-col p-6">
          <div className="max-w-4xl w-full mx-auto space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Carousel skeleton */}
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-[0_0_160px]">
                  <OutfitCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--onboarding-bg)]">
      {/* Back Button */}
      {onBack && (
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          {/* Heading - Left Aligned */}
          <div className="text-left space-y-1">
            <h1 className="text-3xl font-bold text-[var(--onboarding-primary)]">
              {title}
            </h1>
            <p className="text-base text-gray-900">{subtitle}</p>
          </div>

          {/* Optional Search and Filter */}
          {showSearchFilter && (
            <div className="space-y-3">
              <OutfitSearchBar value={searchQuery} onChange={setSearchQuery} />
              <FilterPills
                selected={selectedOccasions}
                onChange={setSelectedOccasions}
              />
            </div>
          )}

          {/* Selected Outfits Thumbnails - Below Header, Left Aligned */}
          {selectedOutfits.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {selectedOutfits.map((outfit) => (
                <SelectionThumbnail
                  key={outfit.id}
                  imageUrl={outfit.imageUrl}
                  alt={`${outfit.title} selected`}
                  onRemove={() => removeOutfit(outfit.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredOutfits.length === 0 ? (
            <EmptyOutfitState onClearFilters={onClearFilters} />
          ) : (
            /* Carousel */
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 pl-4 pr-8">
                {filteredOutfits.map((outfit) => (
                  <div key={outfit.id} className="flex-[0_0_160px] min-w-0">
                    <OutfitCarouselCard
                      outfit={outfit}
                      isSelected={isSelected(outfit.id)}
                      onToggle={() => toggleOutfit(outfit)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Button - Circular Crimson, Bottom Center */}
          {onAction && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleAction}
                disabled={selectedOutfits.length === 0}
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
