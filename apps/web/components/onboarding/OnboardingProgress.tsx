interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex justify-center items-center gap-2 py-4">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div
            key={step}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${isCurrent ? 'bg-[var(--onboarding-primary)] w-3 h-3' : ''}
              ${isCompleted ? 'bg-[var(--onboarding-primary)]' : ''}
              ${!isCurrent && !isCompleted ? 'bg-gray-300' : ''}
            `}
          />
        );
      })}
    </div>
  );
}
