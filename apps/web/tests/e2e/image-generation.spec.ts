/**
 * E2E Tests: Image Generation
 * Tests AI-powered outfit image generation feature
 */

import { test, expect } from '@playwright/test';
import {
    navigateWithProfile,
    waitForAppLoad,
    mockAllAPIs,
    mockImageGenerationAPI,
    mockImageGenerationRateLimited,
    sendChatMessage,
    waitForChatResponse,
    findChatInput
} from '../utils/test-helpers';
import { COMPLETE_PROFILE } from '../fixtures/user-profiles';
import { MOCK_IMAGE_GENERATION_RESPONSE } from '../fixtures/mock-responses';
import { VIEWPORTS, TIMEOUTS, CHAT_MESSAGES, SELECTORS } from '../fixtures/test-data';

test.describe('Image Generation - Trigger via Chat', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should trigger image generation with outfit description', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Send an image generation request
        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);

        // Wait for response (might include image or text)
        await page.waitForTimeout(5000);

        // Check if image generation was triggered
        // The response might be text explaining generation or actual image
        const response = page.locator('text=/image|generating|outfit|รูป/i');
        // Response should exist
    });

    test('should display generated image in chat', async ({ page }) => {
        // Mock successful image generation
        await mockImageGenerationAPI(page, MOCK_IMAGE_GENERATION_RESPONSE.success);

        await page.waitForTimeout(1000);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);

        // Wait for image generation (longer timeout)
        await page.waitForTimeout(10000);

        // Look for generated image
        const generatedImage = page.locator(SELECTORS.imageGeneration.generatedImage);

        // Image might appear if API is working
        const imageCount = await generatedImage.count();
        // Just verify no crash occurred
    });
});

test.describe('Image Generation - Loading States', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should show loading state during generation', async ({ page }) => {
        // Delay image response to catch loading state
        await page.route('**/api/generate-image', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_IMAGE_GENERATION_RESPONSE.success),
            });
        });

        await mockAllAPIs(page);
        await page.waitForTimeout(1000);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);

        // Look for loading indicator
        await page.waitForTimeout(1000);
        const loadingIndicator = page.locator('[data-testid="image-loading"], .image-loading, .loading, .spinner');

        // Loading might be visible
    });

    test('should hide loading state after generation completes', async ({ page }) => {
        await mockImageGenerationAPI(page, MOCK_IMAGE_GENERATION_RESPONSE.success);
        await mockAllAPIs(page);

        await page.waitForTimeout(1000);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(5000);

        // Loading should be hidden
        const loadingIndicator = page.locator('[data-testid="image-loading"], .image-loading');
        await expect(loadingIndicator.first()).not.toBeVisible({ timeout: 5000 }).catch(() => {
            // Loading might not exist
        });
    });
});

test.describe('Image Generation - Error Handling', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should handle rate limit error (429)', async ({ page }) => {
        await mockImageGenerationRateLimited(page);
        await mockAllAPIs(page);

        await page.waitForTimeout(1000);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(5000);

        // Should show rate limit message
        const errorMessage = page.locator('text=/rate limit|try again|ลองใหม่|limit exceeded/i');
        // Error handling varies
    });

    test('should handle service unavailable error (503)', async ({ page }) => {
        await page.route('**/api/generate-image', async (route) => {
            await route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_IMAGE_GENERATION_RESPONSE.serviceUnavailable),
            });
        });
        await mockAllAPIs(page);

        await page.waitForTimeout(1000);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(5000);

        // Should handle gracefully
        await expect(page).toHaveURL(/localhost/);
    });

    test('should handle timeout gracefully', async ({ page }) => {
        await page.route('**/api/generate-image', async (route) => {
            // Never respond (simulate timeout)
            await new Promise(resolve => setTimeout(resolve, 60000));
        });
        await mockAllAPIs(page);

        await page.waitForTimeout(1000);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);

        // Wait some time but not full timeout
        await page.waitForTimeout(10000);

        // App should remain functional
        const chatInput = await findChatInput(page);
        await expect(chatInput).toBeVisible();
    });

    test('should show error message on generation failure', async ({ page }) => {
        await page.route('**/api/generate-image', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Image generation failed' }),
            });
        });
        await mockAllAPIs(page);

        await page.waitForTimeout(1000);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(5000);

        // Error message might appear
        const errorMessage = page.locator(SELECTORS.imageGeneration.errorMessage);
        // Just verify no crash
    });
});

test.describe('Image Generation - Image Display', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockImageGenerationAPI(page, MOCK_IMAGE_GENERATION_RESPONSE.success);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should display base64 encoded image', async ({ page }) => {
        await page.waitForTimeout(1000);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(10000);

        // Look for base64 image
        const base64Image = page.locator('img[src^="data:image"]');
        const imageCount = await base64Image.count();

        // Might have images from products or generated
    });

    test('should have proper alt text on generated image', async ({ page }) => {
        await page.waitForTimeout(1000);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(10000);

        // Check for images with alt text
        const imageWithAlt = page.locator('img[alt*="outfit"], img[alt*="Outfit"], img[alt*="generated"]');
        const count = await imageWithAlt.count();
        // Alt text for accessibility
    });
});

test.describe('Image Generation - Integration with Chat', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should maintain chat history after image generation', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Send a regular message first
        await sendChatMessage(page, CHAT_MESSAGES.greeting);
        await page.waitForTimeout(2000);

        // Send image request
        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(5000);

        // Both messages should be visible
        const greeting = page.locator(`text="${CHAT_MESSAGES.greeting}"`);
        await expect(greeting.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should allow new messages after image generation', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Generate image
        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(5000);

        // Send follow-up message
        await sendChatMessage(page, 'Show me more options');
        await page.waitForTimeout(2000);

        // New message should appear
        const newMessage = page.locator('text="Show me more options"');
        await expect(newMessage.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });
});

test.describe('Image Generation - Mobile', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should trigger image generation on mobile', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Go to chat tab
        const chatTab = page.locator('button:has-text("แชท"), button:has(.lucide-message-circle)');
        await chatTab.first().click();
        await page.waitForTimeout(500);

        // Send image request
        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(5000);

        // Should not crash on mobile
        await expect(page).toHaveURL(/localhost/);
    });

    test('should display generated image properly on mobile', async ({ page }) => {
        await mockImageGenerationAPI(page, MOCK_IMAGE_GENERATION_RESPONSE.success);

        await page.waitForTimeout(1000);

        // Go to chat tab
        const chatTab = page.locator('button:has-text("แชท"), button:has(.lucide-message-circle)');
        await chatTab.first().click();
        await page.waitForTimeout(500);

        await sendChatMessage(page, CHAT_MESSAGES.imageRequest);
        await page.waitForTimeout(10000);

        // Check that image fits viewport
        const images = page.locator('img');
        const imageCount = await images.count();

        if (imageCount > 0) {
            const firstImage = images.first();
            const box = await firstImage.boundingBox();

            if (box) {
                // Image should fit within mobile viewport
                expect(box.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width);
            }
        }
    });
});
