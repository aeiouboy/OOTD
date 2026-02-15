'use client';

import { useState, useCallback } from 'react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { AgeRange, StylePreference } from '@/lib/types/user-profile-types';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingName } from './OnboardingName';
import { OnboardingDepartment } from './OnboardingDepartment';
import { OnboardingAge } from './OnboardingAge';
import { OnboardingStyle } from './OnboardingStyle';
import { OnboardingPhoto } from './OnboardingPhoto';
import { OnboardingComplete } from './OnboardingComplete';
import {
  generateFittingModel,
  generateDefaultFittingModel,
} from '@/lib/services/fitting-model-service';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { profile, updateProfile, completeOnboarding } = useUserProfile();

  // Fitting model generation state
  const [fittingModelUrl, setFittingModelUrl] = useState<string | undefined>();
  const [isFittingModelLoading, setIsFittingModelLoading] = useState(false);
  const [fittingModelError, setFittingModelError] = useState<string | undefined>();

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleNameSubmit = (name: string) => {
    updateProfile({ userName: name });
    handleNext();
  };

  const handleDepartmentSubmit = () => {
    updateProfile({ gender: 'women' });
    handleNext();
  };

  const handleAgeSubmit = (ageRange: AgeRange) => {
    updateProfile({ ageRange });
    handleNext();
  };

  const handleStyleSubmit = (styles: StylePreference[]) => {
    updateProfile({ stylePreferences: styles });
    handleNext();
  };

  /**
   * Generates fitting model from user photo or uses mystery mode
   */
  const triggerFittingModelGeneration = useCallback(
    async (photoData?: string) => {
      setIsFittingModelLoading(true);
      setFittingModelError(undefined);
      setFittingModelUrl(undefined);

      try {
        const result = photoData
          ? await generateFittingModel(photoData)
          : await generateDefaultFittingModel();

        if (result.success && (result.imageUrl || result.imageBase64)) {
          const url = result.imageUrl || result.imageBase64;
          setFittingModelUrl(url);
          // Persist to profile
          updateProfile({ fittingModelUrl: url });
        } else {
          setFittingModelError(result.message || 'Failed to generate fitting model');
        }
      } catch (error) {
        console.error('[OnboardingFlow] Fitting model generation error:', error);
        setFittingModelError('Unable to generate fitting model');
      } finally {
        setIsFittingModelLoading(false);
      }
    },
    [updateProfile]
  );

  const handlePhotoSubmit = (photoData?: string) => {
    updateProfile({ userPhoto: photoData });
    // Start fitting model generation asynchronously
    triggerFittingModelGeneration(photoData);
    handleNext();
  };

  /**
   * Retry fitting model generation
   */
  const handleRetryFittingModel = useCallback(() => {
    triggerFittingModelGeneration(profile?.userPhoto);
  }, [profile?.userPhoto, triggerFittingModelGeneration]);

  const handleComplete = () => {
    if (isFittingModelLoading || !fittingModelUrl || fittingModelError) {
      return;
    }
    completeOnboarding();
    onComplete();
  };

  return (
    <div className="onboarding-container">
      {currentStep === 1 && <OnboardingWelcome onNext={handleNext} />}

      {currentStep === 2 && (
        <OnboardingName onNext={handleNameSubmit} onBack={handleBack} />
      )}

      {currentStep === 3 && (
        <OnboardingDepartment onNext={handleDepartmentSubmit} onBack={handleBack} />
      )}

      {currentStep === 4 && (
        <OnboardingAge onNext={handleAgeSubmit} onBack={handleBack} />
      )}

      {currentStep === 5 && (
        <OnboardingStyle onNext={handleStyleSubmit} onBack={handleBack} />
      )}

      {currentStep === 6 && (
        <OnboardingPhoto onNext={handlePhotoSubmit} onBack={handleBack} />
      )}

      {currentStep === 7 && profile && (
        <OnboardingComplete
          profile={profile}
          onComplete={handleComplete}
          fittingModelUrl={fittingModelUrl}
          isFittingModelLoading={isFittingModelLoading}
          fittingModelError={fittingModelError}
          onRetryFittingModel={handleRetryFittingModel}
        />
      )}
    </div>
  );
}
