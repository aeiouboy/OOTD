'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectionThumbnailProps {
  imageUrl?: string;
  alt: string;
  onRemove: () => void;
  className?: string;
}

/**
 * SelectionThumbnail - 60x80px thumbnail with X close button
 * Used in the selected items row of carousel selection components
 */
export function SelectionThumbnail({
  imageUrl,
  alt,
  onRemove,
  className,
}: SelectionThumbnailProps) {
  return (
    <div
      className={cn(
        'relative flex-shrink-0 w-[60px] h-[80px] rounded-lg overflow-hidden border-2 border-[var(--onboarding-primary)] selection-thumbnail-enter',
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-2xl">👗</span>
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 w-5 h-5 bg-[var(--onboarding-primary)] rounded-full flex items-center justify-center shadow-sm hover:bg-[var(--onboarding-primary-hover)] transition-colors"
        aria-label={`Remove ${alt}`}
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}
