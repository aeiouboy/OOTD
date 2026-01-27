'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';

interface OnboardingNameProps {
  onNext: (name: string) => void;
  onBack: () => void;
}

export function OnboardingName({ onNext, onBack }: OnboardingNameProps) {
  const [name, setName] = useState('');

  const handleNext = () => {
    if (name.trim()) {
      onNext(name.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleNext();
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
      <OnboardingProgress currentStep={2} totalSteps={7} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Hey there,{' '}
              <span className="text-[var(--onboarding-primary)]">
                What should I call you?
              </span>
            </h1>
          </div>

          {/* Input */}
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full text-lg py-6 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--onboarding-primary)]"
              autoFocus
            />
          </div>

          {/* Next Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleNext}
              disabled={!name.trim()}
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
