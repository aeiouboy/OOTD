import { Button } from '@/components/ui/button';
import { UserProfile } from '@/lib/types/user-profile-types';
import { User } from 'lucide-react';

interface OnboardingCompleteProps {
  profile: UserProfile;
  onComplete: () => void;
}

export function OnboardingComplete({ profile, onComplete }: OnboardingCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--onboarding-bg)] p-6">
      <div className="flex flex-col items-center max-w-md w-full space-y-8">
        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Nice to meet you{' '}
            <span className="text-[var(--onboarding-primary)]">
              {profile.userName}
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Successfully Registered 🎉
          </p>
        </div>

        {/* User Photo or Mystery Avatar */}
        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[var(--onboarding-primary)] bg-white flex items-center justify-center">
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
          Time to Chat ✨
        </Button>
      </div>
    </div>
  );
}
