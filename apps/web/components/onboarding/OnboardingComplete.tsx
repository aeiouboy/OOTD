import { Button } from '@/components/ui/button';
import { UserProfile } from '@/lib/types/user-profile-types';
import { User, RefreshCw, Loader2 } from 'lucide-react';

interface OnboardingCompleteProps {
  profile: UserProfile;
  onComplete: () => void;
  fittingModelUrl?: string;
  isFittingModelLoading?: boolean;
  fittingModelError?: string;
  onRetryFittingModel?: () => void;
}

/**
 * Loading skeleton for fitting model image
 */
function FittingModelSkeleton() {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center py-12">
      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Loader2 className="w-12 h-12 text-[var(--onboarding-primary)] animate-spin" />
      </div>
      <p className="text-gray-600 text-center px-4">
        Creating your personalized fitting model...
      </p>
      <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
    </div>
  );
}

/**
 * Error state for fitting model with retry option
 */
function FittingModelError({
  error,
  onRetry,
  fallbackImage,
}: {
  error: string;
  onRetry?: () => void;
  fallbackImage?: string;
}) {
  return (
    <div className="w-full space-y-4">
      {/* Show fallback image if available */}
      {fallbackImage ? (
        <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-[var(--onboarding-primary)] bg-white">
          <img
            src={fallbackImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-gray-300 bg-gray-50 flex items-center justify-center">
          <User className="w-24 h-24 text-gray-400" />
        </div>
      )}

      {/* Error message */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">{error}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-[var(--onboarding-primary)] text-[var(--onboarding-primary)]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Display the generated fitting model image
 */
function FittingModelDisplay({ imageUrl, userName }: { imageUrl: string; userName: string }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative flex justify-center">
        <img
          src={imageUrl}
          alt={`${userName}'s fitting model`}
          className="h-[350px] w-auto object-contain"
        />
      </div>
      <p className="text-center text-sm text-gray-500 mt-3">
        Your personalized fitting model
      </p>
    </div>
  );
}

export function OnboardingComplete({
  profile,
  onComplete,
  fittingModelUrl,
  isFittingModelLoading,
  fittingModelError,
  onRetryFittingModel,
}: OnboardingCompleteProps) {
  // Determine what to display in the image area
  const renderImageArea = () => {
    // Loading state
    if (isFittingModelLoading) {
      return <FittingModelSkeleton />;
    }

    // Error state with fallback
    if (fittingModelError) {
      return (
        <FittingModelError
          error={fittingModelError}
          onRetry={onRetryFittingModel}
          fallbackImage={profile.userPhoto}
        />
      );
    }

    // Success state - show fitting model
    if (fittingModelUrl) {
      return <FittingModelDisplay imageUrl={fittingModelUrl} userName={profile.userName} />;
    }

    // Fallback - show user photo or mystery avatar
    return (
      <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-[var(--onboarding-primary)] bg-white flex items-center justify-center">
        {profile.userPhoto ? (
          <img
            src={profile.userPhoto}
            alt={profile.userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <User className="w-24 h-24 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Mystery Avatar</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--onboarding-bg)] p-6">
      <div className="flex flex-col items-center max-w-md w-full space-y-6">
        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Nice to meet you{' '}
            <span className="text-[var(--onboarding-primary)]">
              {profile.userName}
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Successfully Registered
          </p>
        </div>

        {/* Fitting Model / User Photo Area */}
        {renderImageArea()}

        {/* Profile Summary */}
        <div className="w-full bg-white rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Department:</span>
            <span className="font-semibold text-gray-900">Women&apos;s Fashion</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Age Range:</span>
            <span className="font-semibold text-gray-900">{profile.ageRange}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Style:</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
              {profile.stylePreferences.map((style) => (
                <span
                  key={style.id}
                  className="text-xs bg-[var(--onboarding-primary)] text-white px-2 py-1 rounded-full"
                >
                  {style.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-center text-gray-700">
          Your BFF&apos;s here — ready to find your perfect look
        </p>

        {/* Complete Button */}
        <Button
          onClick={onComplete}
          className="w-full bg-[var(--onboarding-primary)] hover:bg-[var(--onboarding-primary-hover)] text-white text-lg py-6 rounded-full"
        >
          Time to Chat
        </Button>
      </div>
    </div>
  );
}
