import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--onboarding-bg)] p-6">
      <div className="flex flex-col items-center max-w-md w-full space-y-8">
        {/* Logo */}
        <Image
          src="/images/onboarding/welcome-hero.png"
          alt="OOTDay Logo"
          width={320}
          height={423}
          priority
          className="rounded-2xl"
        />

        {/* Welcome Text */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Hi FRIEND!
          </h1>
          <p className="text-xl text-gray-600">
            Think outfit. Think OOTDay
          </p>
        </div>

        {/* Let's Go Button */}
        <Button
          onClick={onNext}
          className="w-full bg-[var(--onboarding-primary)] hover:bg-[var(--onboarding-primary-hover)] text-white text-lg py-6 rounded-full"
        >
          Let&apos;s Go →
        </Button>
      </div>
    </div>
  );
}
