/**
 * User Profile Test Fixtures for OOTDay E2E Tests
 * Matches the UserProfile interface from lib/types/user-profile-types.ts
 */

export interface StylePreference {
    id: string;
    name: string;
    description: string;
    cardDescription?: string;
    imageUrl?: string;
    longDescription?: string;
}

export type AgeRange = '<20' | '20-29' | '30-39' | '40+';

export interface TestUserProfile {
    userName: string;
    gender: 'women';  // Currently fixed to women-only
    ageRange: AgeRange;
    stylePreferences: StylePreference[];
    userPhoto?: string;
    onboardingCompleted: boolean;
    createdAt: string;
}

export const STYLE_PREFERENCES: StylePreference[] = [
    { id: 'casual', name: 'Casual', description: 'Relaxed everyday style' },
    { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple looks' },
    { id: 'classic', name: 'Classic', description: 'Timeless elegance' },
];

export const COMPLETE_PROFILE: TestUserProfile = {
    userName: 'Test User',
    gender: 'women',
    ageRange: '20-29',
    stylePreferences: STYLE_PREFERENCES.slice(0, 2),
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
};

export const COMPLETE_PROFILE_WITH_PHOTO: TestUserProfile = {
    userName: 'Photo User',
    gender: 'women',
    ageRange: '30-39',
    stylePreferences: STYLE_PREFERENCES,
    userPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
};

export const INCOMPLETE_PROFILE: TestUserProfile = {
    userName: '',
    gender: 'women',
    ageRange: '<20',
    stylePreferences: [],
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
};

export const PARTIAL_PROFILE: TestUserProfile = {
    userName: 'Partial User',
    gender: 'women',
    ageRange: '20-29',
    stylePreferences: [],
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
};

export const EMPTY_PROFILE = null;

export const AGE_RANGES: AgeRange[] = ['<20', '20-29', '30-39', '40+'];

export const DEPARTMENTS = ['women'] as const;  // Currently women-only
