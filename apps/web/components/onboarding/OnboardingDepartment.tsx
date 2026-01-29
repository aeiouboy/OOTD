import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';
import Image from 'next/image';

interface OnboardingDepartmentProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingDepartment({ onNext, onBack }: OnboardingDepartmentProps) {
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
      <OnboardingProgress currentStep={3} totalSteps={7} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              What&apos;s your vibe?
            </h1>
            <p className="text-lg text-gray-600">
              Choose your fashion department
            </p>
          </div>

          {/* Department Card */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border-4 border-[var(--onboarding-primary)] cursor-pointer inline-block">
                {/* Women's Fashion Flat Lay Image */}
                <Image
                  src="/images/onboarding/womens-fashion.jpg"
                  alt="Women's Fashion"
                  width={260}
                  height={348}
                  quality={100}
                  className="block"
                />
                {/* Selected Badge */}
                <div className="absolute top-4 right-4 bg-[var(--onboarding-primary)] text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Selected
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-center">
            <Button
              onClick={onNext}
              className="w-14 h-14 rounded-full bg-[var(--onboarding-primary)] hover:bg-[var(--onboarding-primary-hover)] text-white"
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
