'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, User, Dice1 } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';

interface OnboardingPhotoProps {
  onNext: (photoData?: string) => void;
  onBack: () => void;
}

export function OnboardingPhoto({ onNext, onBack }: OnboardingPhotoProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (photoPreview) {
      onNext(photoPreview);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleMysteryClick = () => {
    onNext(undefined);
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

      {/* Progress */}
      <OnboardingProgress currentStep={6} totalSteps={7} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Show your face — your style starts here
            </h1>
            <p className="text-lg text-gray-600">
              Upload your photo — or let the magic happen
            </p>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => !photoPreview && fileInputRef.current?.click()}
            className={`
              w-full h-80 rounded-2xl border-4 border-dashed
              flex items-center justify-center cursor-pointer
              transition-all duration-300
              ${
                photoPreview
                  ? 'border-[var(--onboarding-primary)] bg-white'
                  : 'border-gray-300 bg-gray-50 hover:border-[var(--onboarding-primary)]'
              }
            `}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-center">
                <User className="w-24 h-24 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Click to upload your photo</p>
                <p className="text-sm text-gray-400 mt-2">Max 5MB</p>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleUploadClick}
              className="w-full bg-[var(--onboarding-primary)] hover:bg-[var(--onboarding-primary-hover)] text-white py-6 rounded-full text-lg"
            >
              {photoPreview ? 'Continue' : 'Upload'}
            </Button>
            <Button
              onClick={handleMysteryClick}
              variant="outline"
              className="w-full border-2 border-[var(--onboarding-primary)] text-[var(--onboarding-primary)] hover:bg-[var(--onboarding-primary)] hover:text-white py-6 rounded-full text-lg"
            >
              <Dice1 className="w-5 h-5 mr-2" />
              Mystery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
