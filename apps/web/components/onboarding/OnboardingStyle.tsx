'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, Check } from 'lucide-react';
import { StylePreference } from '@/lib/types/user-profile-types';
import fashionStylesData from '@/lib/data/fashion-styles.json';

interface OnboardingStyleProps {
  onNext: (styles: StylePreference[]) => void;
  onBack: () => void;
}

// Import fashion styles from single source of truth
const styleOptions = fashionStylesData as StylePreference[];

export function OnboardingStyle({ onNext, onBack }: OnboardingStyleProps) {
  const [selectedStyles, setSelectedStyles] = useState<StylePreference[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (styleId: string) => {
    setFailedImages((prev) => new Set(prev).add(styleId));
  };

  const toggleStyle = (style: StylePreference) => {
    setSelectedStyles((prev) => {
      const isSelected = prev.some((s) => s.id === style.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== style.id);
      } else {
        return [...prev, style];
      }
    });
  };

  const handleNext = () => {
    if (selectedStyles.length > 0) {
      onNext(selectedStyles);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--onboarding-bg)]">
      {/* Back Button */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pb-6">
        <div className="max-w-4xl w-full mx-auto space-y-5">
          {/* Heading - Left Aligned */}
          <div className="text-left space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--onboarding-primary)]">
              What&apos;s your style?
            </h1>
            <p className="text-sm sm:text-base text-gray-900">
              Choose styles that spark you (select one or more)
            </p>
          </div>

          {/* Selection Counter */}
          {selectedStyles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--onboarding-primary)]">
                {selectedStyles.length} selected
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {selectedStyles.map((style) => (
                  <span
                    key={style.id}
                    className="px-2 py-0.5 text-xs bg-[var(--onboarding-primary)] text-white rounded-full"
                  >
                    {style.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grid Layout - Equal sized cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {styleOptions.map((style) => {
              const isSelected = selectedStyles.some((s) => s.id === style.id);
              return (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style)}
                  className={`
                    relative w-full rounded-xl overflow-hidden flex flex-col
                    bg-white transition-all duration-200 ease-out
                    border-2
                    ${isSelected
                      ? 'border-[var(--onboarding-primary)] shadow-lg ring-2 ring-[var(--onboarding-primary)]/20 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md active:scale-[0.98]'
                    }
                    focus:outline-none focus:ring-2 focus:ring-[var(--onboarding-primary)]/50
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  {/* Selection Checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-[var(--onboarding-primary)] rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Style Image - 60% of card height */}
                  <div className="relative w-full aspect-[175/306] overflow-hidden">
                    {style.imageUrl && !failedImages.has(style.id) ? (
                      <img
                        src={style.imageUrl}
                        alt={`${style.name} style`}
                        loading="lazy"
                        onError={() => handleImageError(style.id)}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-3xl">👗</span>
                      </div>
                    )}
                    {/* Gradient overlay for better text contrast */}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/80 to-transparent" />
                  </div>

                  {/* Style Text Content - 40% of card */}
                  <div className="flex-1 p-2 sm:p-3 text-left flex flex-col justify-center">
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--onboarding-primary)] leading-tight">
                      {style.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {style.description}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1 leading-snug line-clamp-2">
                      {style.cardDescription}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button - Fixed at bottom */}
          <div className="flex justify-center pt-4 pb-2">
            <Button
              onClick={handleNext}
              disabled={selectedStyles.length === 0}
              className="w-14 h-14 rounded-full bg-[var(--onboarding-primary)] hover:bg-[var(--onboarding-primary-hover)] text-white disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
