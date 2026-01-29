/**
 * User Profile Type Definitions for OOTDay Onboarding Flow
 */

/**
 * Style preference option with details
 */
export interface StylePreference {
  id: string;
  name: string;
  description: string;
  cardDescription?: string;
  imageUrl?: string;
  longDescription?: string;
}

/**
 * Age range options for user profile
 */
export type AgeRange = '<20' | '20-29' | '30-39' | '40+';

/**
 * Complete user profile captured during onboarding
 */
export interface UserProfile {
  userName: string;
  gender: 'women'; // Currently fixed to women-only
  ageRange: AgeRange;
  stylePreferences: StylePreference[];
  userPhoto?: string; // Base64 encoded image or undefined for mystery avatar
  fittingModelUrl?: string; // URL to AI-generated fitting model image
  onboardingCompleted: boolean;
  createdAt: string; // ISO date string
}

/**
 * Partial profile for incremental updates during onboarding
 */
export type PartialUserProfile = Partial<UserProfile>;
