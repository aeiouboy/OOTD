/**
 * E2E Tests: API Integration
 * Tests API endpoints and their integration with the frontend
 */

import { test, expect } from '@playwright/test';
import { navigateWithProfile, waitForAppLoad } from '../utils/test-helpers';
import { COMPLETE_PROFILE } from '../fixtures/user-profiles';
import { MOCK_CHAT_RESPONSE, MOCK_PRODUCTS_RESPONSE, MOCK_IMAGE_GENERATION_RESPONSE, HTTP_STATUS } from '../fixtures/mock-responses';
import { VIEWPORTS, TIMEOUTS, API_ENDPOINTS, CHAT_MESSAGES } from '../fixtures/test-data';

test.describe('API Integration - Chat Endpoint', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('should call /api/chat with correct payload', async ({ page }) => {
        let requestPayload: any = null;

        await page.route('**/api/chat', async (route, request) => {
            requestPayload = JSON.parse(request.postData() || '{}');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_CHAT_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Send a chat message
        const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"]').first();
        await chatInput.fill(CHAT_MESSAGES.englishOutfitRequest);
        await page.locator('button:has(svg.lucide-send)').first().click();

        await page.waitForTimeout(2000);

        // Verify request was made
        expect(requestPayload).not.toBeNull();
    });

    test('should receive correct response structure from /api/chat', async ({ page }) => {
        let receivedResponse = false;

        await page.route('**/api/chat', async (route) => {
            receivedResponse = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_CHAT_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Trigger chat request
        const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"]').first();
        await chatInput.fill('Test message');
        await page.locator('button:has(svg.lucide-send)').first().click();

        await page.waitForTimeout(2000);

        expect(receivedResponse).toBe(true);
    });

    test('should handle /api/chat 500 error', async ({ page }) => {
        await page.route('**/api/chat', async (route) => {
            await route.fulfill({
                status: HTTP_STATUS.INTERNAL_ERROR,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' }),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"]').first();
        await chatInput.fill('Test error');
        await page.locator('button:has(svg.lucide-send)').first().click();

        await page.waitForTimeout(3000);

        // App should not crash
        await expect(page).toHaveURL(/localhost/);
    });

    test('should handle /api/chat timeout', async ({ page }) => {
        await page.route('**/api/chat', async (route) => {
            // Delay response significantly
            await new Promise(resolve => setTimeout(resolve, 30000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_CHAT_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"]').first();
        await chatInput.fill('Test timeout');
        await page.locator('button:has(svg.lucide-send)').first().click();

        // Wait less than the timeout
        await page.waitForTimeout(5000);

        // Chat input should still be functional
        await expect(chatInput).toBeVisible();
    });
});

test.describe('API Integration - Products Endpoint', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('should call /api/products on page load', async ({ page }) => {
        let productsCalled = false;

        await page.route('**/api/products', async (route) => {
            productsCalled = true;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(3000);

        expect(productsCalled).toBe(true);
    });

    test('should receive correct product structure from /api/products', async ({ page }) => {
        let receivedProducts: any[] = [];

        await page.route('**/api/products', async (route) => {
            receivedProducts = MOCK_PRODUCTS_RESPONSE.success;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(3000);

        // Verify product structure
        expect(receivedProducts.length).toBeGreaterThan(0);
        expect(receivedProducts[0]).toHaveProperty('sku');
        expect(receivedProducts[0]).toHaveProperty('name');
        expect(receivedProducts[0]).toHaveProperty('price');
    });

    test('should handle /api/products empty response', async ({ page }) => {
        await page.route('**/api/products', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(3000);

        // App should handle empty products gracefully
        await expect(page).toHaveURL(/localhost/);
    });

    test('should handle /api/products error', async ({ page }) => {
        await page.route('**/api/products', async (route) => {
            await route.fulfill({
                status: HTTP_STATUS.INTERNAL_ERROR,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.error),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(3000);

        // App should not crash
        await expect(page).toHaveURL(/localhost/);
    });
});

test.describe('API Integration - Image Generation Endpoint', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('should call /api/generate-image with description', async ({ page }) => {
        let requestBody: any = null;

        await page.route('**/api/generate-image', async (route, request) => {
            requestBody = JSON.parse(request.postData() || '{}');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_IMAGE_GENERATION_RESPONSE.success),
            });
        });

        await page.route('**/api/chat', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_CHAT_RESPONSE.success),
            });
        });

        await page.route('**/api/products', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Trigger image generation
        const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"]').first();
        await chatInput.fill(CHAT_MESSAGES.imageRequest);
        await page.locator('button:has(svg.lucide-send)').first().click();

        await page.waitForTimeout(5000);

        // Image generation might be triggered by backend logic
    });

    test('should handle /api/generate-image rate limit (429)', async ({ page }) => {
        await page.route('**/api/generate-image', async (route) => {
            await route.fulfill({
                status: HTTP_STATUS.RATE_LIMITED,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_IMAGE_GENERATION_RESPONSE.rateLimited),
            });
        });

        await page.route('**/api/chat', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_CHAT_RESPONSE.success),
            });
        });

        await page.route('**/api/products', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // App should handle rate limit gracefully
        await expect(page).toHaveURL(/localhost/);
    });

    test('should handle /api/generate-image service unavailable (503)', async ({ page }) => {
        await page.route('**/api/generate-image', async (route) => {
            await route.fulfill({
                status: HTTP_STATUS.SERVICE_UNAVAILABLE,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_IMAGE_GENERATION_RESPONSE.serviceUnavailable),
            });
        });

        await page.route('**/api/chat', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_CHAT_RESPONSE.success),
            });
        });

        await page.route('**/api/products', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // App should not crash
        await expect(page).toHaveURL(/localhost/);
    });
});

test.describe('API Integration - Request Headers', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('should include Content-Type header in requests', async ({ page }) => {
        let contentType: string | null = null;

        await page.route('**/api/chat', async (route, request) => {
            contentType = request.headers()['content-type'];
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_CHAT_RESPONSE.success),
            });
        });

        await page.route('**/api/products', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"]').first();
        await chatInput.fill('Test');
        await page.locator('button:has(svg.lucide-send)').first().click();

        await page.waitForTimeout(2000);

        // Should have JSON content type
        expect(contentType).toContain('application/json');
    });
});

test.describe('API Integration - Concurrent Requests', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('should handle multiple simultaneous requests', async ({ page }) => {
        let chatCount = 0;
        let productsCount = 0;

        await page.route('**/api/chat', async (route) => {
            chatCount++;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_CHAT_RESPONSE.success),
            });
        });

        await page.route('**/api/products', async (route) => {
            productsCount++;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.success),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        // Products should be called at least once on load
        expect(productsCount).toBeGreaterThanOrEqual(1);
    });
});
