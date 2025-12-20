import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--onboarding-bg)] p-6">
      <div className="flex flex-col items-center max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center w-16 h-16 bg-[var(--onboarding-primary)] rounded-full">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        {/* Illustration Placeholder */}
        <div className="w-full h-64 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl flex items-center justify-center">
          <p className="text-sm text-gray-600">Two Women Illustration</p>
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Hi FRIEND!<br />Welcome to OOTDay
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
