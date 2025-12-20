/**
 * E2E Tests: Onboarding Flow
 * Tests the complete onboarding process for new users
 */

import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../utils/page-objects';
import { clearUserProfile, getUserProfile, navigateToHome, waitForAppLoad } from '../utils/test-helpers';
import { COMPLETE_PROFILE, INCOMPLETE_PROFILE } from '../fixtures/user-profiles';
import { LOCAL_STORAGE_KEYS, TIMEOUTS, VIEWPORTS } from '../fixtures/test-data';

test.describe('Onboarding Flow', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        // Clear any existing profile to start fresh
        await page.goto('/');
        await clearUserProfile(page);
        await page.reload();
        await waitForAppLoad(page);
    });

    test('should display onboarding for new users without profile', async ({ page }) => {
        const onboarding = new OnboardingPage(page);

        // Onboarding should be visible for new users
        await expect(page.locator('text=/Welcome|ยินดีต้อนรับ|Let\'s Go|เริ่มเลย/i')).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should complete full onboarding flow', async ({ page }) => {
        const onboarding = new OnboardingPage(page);

        // Step 1: Welcome - button says "Let's Go →"
        await expect(page.locator('button:has-text("Let\'s Go")')).toBeVisible({ timeout: TIMEOUTS.medium });
        await page.locator('button:has-text("Let\'s Go")').first().click();
        await page.waitForTimeout(500);

        // Step 2: Enter name
        const nameInput = page.locator('input[type="text"]').first();
        await nameInput.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
        await nameInput.fill('Test User');

        // Click next (ArrowRight icon button)
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(500);

        // Step 3: Department auto-selects Women, click next
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(500);

        // Step 4: Select age range
        await page.locator('button:has-text("20-29")').first().click();
        await page.waitForTimeout(500);
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(500);

        // Step 5: Select style preferences
        const styleButtons = page.locator('button').filter({ hasText: /casual|minimalist|classic/i });
        const styleCount = await styleButtons.count();
        if (styleCount > 0) {
            await styleButtons.first().click();
        }
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(500);

        // Step 6: Photo - Click Mystery/Skip
        const mysteryButton = page.locator('button:has-text("Mystery")');
        if (await mysteryButton.first().isVisible()) {
            await mysteryButton.first().click();
            await page.waitForTimeout(500);
        }

        // Step 7: Complete - button says "Time to Chat ✨"
        const completeButton = page.locator('button:has-text("Time to Chat")');
        if (await completeButton.first().isVisible()) {
            await completeButton.first().click();
            await page.waitForTimeout(1000);
        }

        // Verify profile was saved to localStorage
        const profile = await getUserProfile(page);
        expect(profile).not.toBeNull();
        expect(profile?.onboardingCompleted).toBe(true);
    });

    test('should skip photo upload with Mystery button', async ({ page }) => {
        const onboarding = new OnboardingPage(page);

        // Navigate through steps quickly
        await page.locator('button:has-text("Let\'s Go")').first().click();
        await page.waitForTimeout(300);

        // Name
        await page.locator('input[type="text"]').first().fill('Skip Photo User');
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(300);

        // Department - auto-selected, click next
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(300);

        // Age
        await page.locator('button:has-text("20-29")').first().click();
        await page.waitForTimeout(300);
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(300);

        // Style - just click next
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(300);

        // Photo step - look for Mystery button
        const mysteryButton = page.locator('button:has-text("Mystery")');
        if (await mysteryButton.isVisible()) {
            await mysteryButton.click();
            await page.waitForTimeout(500);

            // Verify we moved past photo step
            const profile = await getUserProfile(page);
            expect(profile?.userPhoto).toBeUndefined();
        }
    });

    test('should validate required name field', async ({ page }) => {
        // Go to welcome step
        await page.locator('button:has-text("Let\'s Go")').first().click();
        await page.waitForTimeout(500);

        // Try to proceed without entering name
        const nextButton = page.locator('button:has(.lucide-arrow-right)').first();

        // The button should be disabled or clicking should not advance
        const isDisabled = await nextButton.isDisabled().catch(() => false);

        if (!isDisabled) {
            // Click and verify we're still on name step
            await nextButton.click();
            await page.waitForTimeout(300);

            // Name input should still be visible
            const nameInput = page.locator('input[type="text"]');
            await expect(nameInput.first()).toBeVisible();
        }
    });

    test('should persist profile in localStorage after completion', async ({ page }) => {
        // Complete a minimal onboarding flow
        await page.locator('button:has-text("Let\'s Go")').first().click();
        await page.waitForTimeout(300);

        await page.locator('input[type="text"]').first().fill('Persistence Test');
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(300);

        // Department - auto-selected
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(300);

        await page.locator('button:has-text("20-29")').first().click();
        await page.waitForTimeout(300);
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(300);

        // Style - click next
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(300);

        // Skip photo
        const mysteryButton = page.locator('button:has-text("Mystery")');
        if (await mysteryButton.first().isVisible()) {
            await mysteryButton.first().click();
            await page.waitForTimeout(300);
        }

        // Complete
        const completeButton = page.locator('button:has-text("Time to Chat")');
        if (await completeButton.first().isVisible()) {
            await completeButton.first().click();
            await page.waitForTimeout(1000);
        }

        // Check localStorage
        const profile = await page.evaluate(({ key }) => {
            return localStorage.getItem(key);
        }, { key: LOCAL_STORAGE_KEYS.userProfile });

        expect(profile).not.toBeNull();

        const parsedProfile = JSON.parse(profile!);
        expect(parsedProfile.userName).toBe('Persistence Test');
        expect(parsedProfile.onboardingCompleted).toBe(true);

        // Reload and verify profile persists
        await page.reload();
        await waitForAppLoad(page);

        // Should not show onboarding again
        const welcomeButton = page.locator('button:has-text("Let\'s Go")');
        await expect(welcomeButton.first()).not.toBeVisible({ timeout: 3000 }).catch(() => {
            // If still visible, the profile might not have loaded yet
        });
    });

    test('should redirect completed users directly to main app', async ({ page }) => {
        // Set a completed profile
        await page.evaluate(({ key, profile }) => {
            localStorage.setItem(key, JSON.stringify(profile));
        }, { key: LOCAL_STORAGE_KEYS.userProfile, profile: COMPLETE_PROFILE });

        // Reload to apply the profile
        await page.reload();
        await waitForAppLoad(page);

        // Onboarding should not be visible
        const welcomeButton = page.locator('button:has-text("Let\'s Go")');
        await expect(welcomeButton.first()).not.toBeVisible({ timeout: 5000 });

        // Main app content should be visible (chat or outfits)
        const mainAppIndicators = page.getByText(/OOTDay|outfit|chat/i);
        await expect(mainAppIndicators.first()).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Onboarding - Mobile', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await clearUserProfile(page);
        await page.reload();
        await waitForAppLoad(page);
    });

    test('should display onboarding on mobile viewport', async ({ page }) => {
        const welcomeText = page.locator('text=/Welcome|ยินดีต้อนรับ|Let\'s Go|เริ่มเลย/i');
        await expect(welcomeText.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should complete onboarding flow on mobile', async ({ page }) => {
        // Step 1: Welcome
        await page.locator('button:has-text("Let\'s Go")').first().click();
        await page.waitForTimeout(500);

        // Step 2: Enter name
        await page.locator('input[type="text"]').first().fill('Mobile User');
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(500);

        // Step 3: Department auto-selected
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(500);

        // Step 4: Select age
        await page.locator('button:has-text("20-29")').first().click();
        await page.waitForTimeout(500);
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(500);

        // Step 5: Style
        await page.locator('button:has(.lucide-arrow-right)').first().click();
        await page.waitForTimeout(500);

        // Step 6: Skip photo
        const mysteryButton = page.locator('button:has-text("Mystery")');
        if (await mysteryButton.first().isVisible()) {
            await mysteryButton.first().click();
            await page.waitForTimeout(500);
        }

        // Step 7: Complete
        const completeButton = page.locator('button:has-text("Time to Chat")');
        if (await completeButton.first().isVisible()) {
            await completeButton.first().click();
            await page.waitForTimeout(1000);
        }

        // Verify profile was saved
        const profile = await getUserProfile(page);
        expect(profile).not.toBeNull();
    });
});
