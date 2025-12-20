'use client';

import { useState } from 'react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { AgeRange, StylePreference } from '@/lib/types/user-profile-types';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingName } from './OnboardingName';
import { OnboardingDepartment } from './OnboardingDepartment';
import { OnboardingAge } from './OnboardingAge';
import { OnboardingStyle } from './OnboardingStyle';
import { OnboardingPhoto } from './OnboardingPhoto';
import { OnboardingComplete } from './OnboardingComplete';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { profile, updateProfile, completeOnboarding } = useUserProfile();

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

  const handlePhotoSubmit = (photoData?: string) => {
    updateProfile({ userPhoto: photoData });
    handleNext();
  };

  const handleComplete = () => {
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
        <OnboardingComplete profile={profile} onComplete={handleComplete} />
      )}
    </div>
  );
}
