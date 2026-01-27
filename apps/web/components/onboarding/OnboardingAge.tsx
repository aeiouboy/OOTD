'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';
import { AgeRange } from '@/lib/types/user-profile-types';

interface OnboardingAgeProps {
  onNext: (ageRange: AgeRange) => void;
  onBack: () => void;
}

const ageOptions: { value: AgeRange; label: string }[] = [
  { value: '<20', label: 'Less than 20' },
  { value: '20-29', label: '20-29' },
  { value: '30-39', label: '30-39' },
  { value: '40+', label: '40+' },
];

export function OnboardingAge({ onNext, onBack }: OnboardingAgeProps) {
  const [selectedAge, setSelectedAge] = useState<AgeRange | null>(null);

  const handleNext = () => {
    if (selectedAge) {
      onNext(selectedAge);
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

      {/* Progress */}
      <OnboardingProgress currentStep={4} totalSteps={7} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Age is just a number 🎂
            </h1>
            <p className="text-lg text-gray-600">
              Help me curate the perfect styles for you
            </p>
          </div>

          {/* Age Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedAge(option.value)}
                className={`
                  aspect-square rounded-full flex items-center justify-center
                  text-lg font-semibold transition-all duration-300
                  border-2
                  ${
                    selectedAge === option.value
                      ? 'bg-[var(--onboarding-primary)] text-white border-[var(--onboarding-primary)]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--onboarding-primary)]'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleNext}
              disabled={!selectedAge}
              className="w-14 h-14 rounded-full bg-[var(--onboarding-primary)] hover:bg-[var(--onboarding-primary-hover)] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
