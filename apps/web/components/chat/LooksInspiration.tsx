/**
 * LooksInspiration Component
 * Displays generated outfit images in chat interface (Customer Journey Step 4)
 *
 * Features:
 * - Loading state with skeleton animation
 * - Error state with retry functionality
 * - Success state with image display
 * - Click to expand/zoom with dialog
 * - Download functionality
 * - Mobile-responsive design
 * - WCAG 2.1 AA accessibility
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, RefreshCw, ZoomIn, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LooksInspirationProps } from '@/lib/types/image-types';

export function LooksInspiration({
  outfitDescription,
  imageUrl,
  imageBase64,
  isLoading = false,
  error,
  onRetry,
  onGenerateAnother,
  onDownload,
}: LooksInspirationProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine image source (prefer URL over base64)
  const imageSrc = imageUrl || imageBase64;

  /**
   * Handles image download
   */
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Default download implementation
    if (!imageSrc) return;

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = `ootday-outfit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('[LooksInspiration] Download failed:', err);
    }
  };

  /**
   * Renders loading state
   */
  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto my-4" role="status" aria-live="polite">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>กำลังสร้างภาพชุดของคุณ...</span>
            </div>
            <Skeleton className="w-full h-64 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Renders error state
   */
  if (error || !imageSrc) {
    return (
      <Card className="max-w-md mx-auto my-4 border-red-200 bg-red-50" role="alert" aria-live="assertive">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-sm">ไม่สามารถสร้างภาพได้</p>
                <p className="text-xs text-red-500 mt-1">
                  {error || 'เกิดข้อผิดพลาดในการสร้างภาพ กรุณาลองใหม่อีกครั้ง'}
                </p>
              </div>
            </div>

            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="w-full border-red-300 hover:bg-red-100"
                aria-label="Retry image generation"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                ลองใหม่อีกครั้ง
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Renders success state with image
   */
  return (
    <>
      <Card className="max-w-md mx-auto my-4 overflow-hidden">
        <CardContent className="p-0">
          {/* Image Display */}
          <div className="relative group">
            <div className="relative w-full aspect-[3/4] bg-gray-100">
              {!imageError ? (
                <Image
                  src={imageSrc}
                  alt={`Outfit visualization: ${outfitDescription}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                  onError={() => setImageError(true)}
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <AlertCircle className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Zoom Button Overlay */}
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
              aria-label="Zoom image"
            >
              <div className="bg-white/90 rounded-full p-2">
                <ZoomIn className="w-6 h-6 text-gray-700" aria-hidden="true" />
              </div>
            </button>
          </div>

          {/* Image Caption and Actions */}
          <div className="p-4 space-y-3">
            {/* Caption */}
            <div>
              <p className="text-sm font-medium text-gray-900">Looks Inspiration 💫</p>
              <p className="text-xs text-gray-600 mt-1">{outfitDescription}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Download Button */}
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="flex-1"
                aria-label="Download outfit image"
              >
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                ดาวน์โหลด
              </Button>

              {/* Generate Another Button (Optional) */}
              {onGenerateAnother && (
                <Button
                  onClick={onGenerateAnother}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  aria-label="Generate another outfit variation"
                >
                  <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                  สร้างอีกครั้ง
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zoom Dialog */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">
              Outfit image - {outfitDescription}
            </DialogTitle>
          </DialogHeader>

          <div className="relative w-full">
            <div className="relative w-full aspect-[3/4] max-h-[80vh] bg-gray-100 rounded-lg overflow-hidden">
              {!imageError ? (
                <Image
                  src={imageSrc}
                  alt={`Full size outfit visualization: ${outfitDescription}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <AlertCircle className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Caption in Dialog */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">{outfitDescription}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
