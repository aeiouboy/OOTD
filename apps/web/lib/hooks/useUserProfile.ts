'use client';

import { useState, useEffect } from 'react';
import { UserProfile, PartialUserProfile } from '@/lib/types/user-profile-types';

const STORAGE_KEY = 'ootday_user_profile';

/**
 * Custom hook for managing user profile state with localStorage persistence
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * Load user profile from localStorage
   */
  const loadProfile = () => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEY);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile) as UserProfile;
        setProfile(parsedProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save user profile to localStorage
   */
  const saveProfile = (profileData: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      setProfile(profileData);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  /**
   * Update partial profile data (merge with existing)
   */
  const updateProfile = (updates: PartialUserProfile) => {
    const updatedProfile: UserProfile = {
      userName: updates.userName ?? profile?.userName ?? '',
      gender: updates.gender ?? profile?.gender ?? 'women', // v2.4: Fix - use updates.gender instead of hardcoded value
      ageRange: updates.ageRange ?? profile?.ageRange ?? '<20',
      stylePreferences: updates.stylePreferences ?? profile?.stylePreferences ?? [],
      userPhoto: updates.userPhoto ?? profile?.userPhoto,
      fittingModelUrl: updates.fittingModelUrl ?? profile?.fittingModelUrl,
      onboardingCompleted: updates.onboardingCompleted ?? profile?.onboardingCompleted ?? false,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    };
    saveProfile(updatedProfile);
  };

  /**
   * Mark onboarding as complete
   */
  const completeOnboarding = () => {
    if (profile) {
      const completedProfile: UserProfile = {
        ...profile,
        onboardingCompleted: true,
      };
      saveProfile(completedProfile);
    }
  };

  /**
   * Clear profile and reset onboarding (for testing)
   */
  const clearProfile = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setProfile(null);
    } catch (error) {
      console.error('Error clearing user profile:', error);
    }
  };

  return {
    profile,
    isLoading,
    loadProfile,
    saveProfile,
    updateProfile,
    completeOnboarding,
    clearProfile,
  };
}
