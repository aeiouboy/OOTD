/**
 * Test Helper Functions for OOTDay E2E Tests
 */

import { Page, expect } from '@playwright/test';
import { COMPLETE_PROFILE, TestUserProfile } from '../fixtures/user-profiles';
import { LOCAL_STORAGE_KEYS, TIMEOUTS, API_ENDPOINTS } from '../fixtures/test-data';
import { MOCK_CHAT_RESPONSE, MOCK_PRODUCTS_RESPONSE, MOCK_IMAGE_GENERATION_RESPONSE } from '../fixtures/mock-responses';

/**
 * Skip onboarding by setting a complete user profile in localStorage
 */
export async function skipOnboarding(page: Page, profile: TestUserProfile = COMPLETE_PROFILE): Promise<void> {
    await page.evaluate(({ key, profileData }) => {
        localStorage.setItem(key, JSON.stringify(profileData));
    }, { key: LOCAL_STORAGE_KEYS.userProfile, profileData: profile });
}

/**
 * Clear user profile from localStorage
 */
export async function clearUserProfile(page: Page): Promise<void> {
    await page.evaluate(({ key, legacyKey }) => {
        localStorage.removeItem(key);
        localStorage.removeItem(legacyKey);
    }, { key: LOCAL_STORAGE_KEYS.userProfile, legacyKey: LOCAL_STORAGE_KEYS.legacyUserProfile });
}

/**
 * Set a specific user profile in localStorage
 */
export async function setUserProfile(page: Page, profile: TestUserProfile): Promise<void> {
    await page.evaluate(({ key, profileData }) => {
        localStorage.setItem(key, JSON.stringify(profileData));
    }, { key: LOCAL_STORAGE_KEYS.userProfile, profileData: profile });
}

/**
 * Get user profile from localStorage
 */
export async function getUserProfile(page: Page): Promise<TestUserProfile | null> {
    return await page.evaluate(({ key }) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }, { key: LOCAL_STORAGE_KEYS.userProfile });
}

/**
 * Wait for the application to fully load
 */
export async function waitForAppLoad(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(TIMEOUTS.short);
}

/**
 * Navigate to home and wait for load
 */
export async function navigateToHome(page: Page): Promise<void> {
    await page.goto('/');
    await waitForAppLoad(page);
}

/**
 * Navigate to home with onboarding skipped
 * Sets localStorage BEFORE page load to ensure profile is available when React hydrates
 */
export async function navigateWithProfile(page: Page, profile: TestUserProfile = COMPLETE_PROFILE): Promise<void> {
    // First navigate to set up the context
    await page.goto('/');

    // Set the profile in localStorage with correct structure
    await page.evaluate(({ key, profileData }) => {
        localStorage.setItem(key, JSON.stringify(profileData));
    }, { key: LOCAL_STORAGE_KEYS.userProfile, profileData: profile });

    // Reload to apply the profile
    await page.reload();

    // Wait for app to fully load and process the profile
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
}

/**
 * Mock the chat API endpoint
 */
export async function mockChatAPI(page: Page, response = MOCK_CHAT_RESPONSE.success): Promise<void> {
    await page.route(`**${API_ENDPOINTS.chat}`, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
        });
    });
}

/**
 * Mock the chat API with error response
 */
export async function mockChatAPIError(page: Page, status = 500): Promise<void> {
    await page.route(`**${API_ENDPOINTS.chat}`, async (route) => {
        await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_CHAT_RESPONSE.error),
        });
    });
}

/**
 * Mock the products API endpoint
 */
export async function mockProductsAPI(page: Page, response = MOCK_PRODUCTS_RESPONSE.success): Promise<void> {
    await page.route(`**${API_ENDPOINTS.products}`, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
        });
    });
}

/**
 * Mock the products API with error response
 */
export async function mockProductsAPIError(page: Page, status = 500): Promise<void> {
    await page.route(`**${API_ENDPOINTS.products}`, async (route) => {
        await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.error),
        });
    });
}

/**
 * Mock the image generation API endpoint
 */
export async function mockImageGenerationAPI(page: Page, response = MOCK_IMAGE_GENERATION_RESPONSE.success): Promise<void> {
    await page.route(`**${API_ENDPOINTS.generateImage}`, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
        });
    });
}

/**
 * Mock the image generation API with rate limit error
 */
export async function mockImageGenerationRateLimited(page: Page): Promise<void> {
    await page.route(`**${API_ENDPOINTS.generateImage}`, async (route) => {
        await route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_IMAGE_GENERATION_RESPONSE.rateLimited),
        });
    });
}

/**
 * Mock all APIs with success responses
 */
export async function mockAllAPIs(page: Page): Promise<void> {
    await mockChatAPI(page);
    await mockProductsAPI(page);
    await mockImageGenerationAPI(page);
}

/**
 * Find visible chat input element
 */
export async function findChatInput(page: Page) {
    // Try primary selector first
    let chatInput = page.locator('input[placeholder*="OOTDay"]');
    if (await chatInput.count() > 0 && await chatInput.first().isVisible()) {
        return chatInput.first();
    }

    // Try Thai placeholder
    chatInput = page.locator('input[placeholder*="พิมพ์"]');
    if (await chatInput.count() > 0 && await chatInput.first().isVisible()) {
        return chatInput.first();
    }

    // Try "Ask me" placeholder
    chatInput = page.locator('input[placeholder*="Ask me"]');
    if (await chatInput.count() > 0 && await chatInput.first().isVisible()) {
        return chatInput.first();
    }

    // Fallback to any visible text input
    chatInput = page.locator('input[type="text"]').first();
    return chatInput;
}

/**
 * Find and click the send button
 */
export async function findSendButton(page: Page) {
    // Try button with send icon
    let sendButton = page.locator('button:has(svg.lucide-send)');
    if (await sendButton.count() > 0 && await sendButton.first().isVisible()) {
        return sendButton.first();
    }

    // Try aria-label
    sendButton = page.locator('button[aria-label*="send"]');
    if (await sendButton.count() > 0 && await sendButton.first().isVisible()) {
        return sendButton.first();
    }

    // Fallback to last button in input area
    sendButton = page.locator('button').last();
    return sendButton;
}

/**
 * Send a chat message
 */
export async function sendChatMessage(page: Page, message: string): Promise<void> {
    const chatInput = await findChatInput(page);
    await chatInput.fill(message);

    const sendButton = await findSendButton(page);
    await sendButton.click();
}

/**
 * Wait for chat response
 */
export async function waitForChatResponse(page: Page, timeout = TIMEOUTS.medium): Promise<void> {
    // Wait for loading indicator to appear and then disappear
    try {
        await page.waitForSelector('[data-testid="chat-loading"], .chat-loading, .typing-indicator', {
            state: 'visible',
            timeout: 2000,
        });
    } catch {
        // Loading indicator might be too fast to catch
    }

    await page.waitForSelector('[data-testid="chat-loading"], .chat-loading, .typing-indicator', {
        state: 'hidden',
        timeout,
    }).catch(() => {
        // Loading might have already finished
    });

    // Give time for response to render
    await page.waitForTimeout(500);
}

/**
 * Check if desktop layout is visible
 */
export async function isDesktopLayout(page: Page): Promise<boolean> {
    const viewport = page.viewportSize();
    return viewport !== null && viewport.width >= 1024;
}

/**
 * Check if mobile layout is visible
 */
export async function isMobileLayout(page: Page): Promise<boolean> {
    const viewport = page.viewportSize();
    return viewport !== null && viewport.width < 1024;
}

/**
 * Switch to a mobile tab
 */
export async function switchMobileTab(page: Page, tab: 'filters' | 'outfits' | 'chat'): Promise<void> {
    const tabSelectors = {
        filters: 'button:has-text("กรอง"), button:has(.lucide-sliders-horizontal)',
        outfits: 'button:has-text("ชุด"), button:has(.lucide-grid-3x3)',
        chat: 'button:has-text("แชท"), button:has(.lucide-message-circle)',
    };

    await page.locator(tabSelectors[tab]).click();
    await page.waitForTimeout(500);
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
}

/**
 * Log console errors for debugging
 */
export function setupConsoleErrorLogging(page: Page): string[] {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    return consoleErrors;
}

/**
 * Assert no console errors occurred
 */
export function assertNoConsoleErrors(consoleErrors: string[], allowedPatterns: RegExp[] = []): void {
    const filteredErrors = consoleErrors.filter(error =>
        !allowedPatterns.some(pattern => pattern.test(error))
    );

    if (filteredErrors.length > 0) {
        console.warn('Console errors detected:', filteredErrors);
    }
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = TIMEOUTS.medium): Promise<void> {
    try {
        await page.waitForLoadState('networkidle', { timeout });
    } catch {
        // Network might not be idle due to long-running requests, continue anyway
        await page.waitForTimeout(1000);
    }
}

/**
 * Get computed style property
 */
export async function getComputedStyle(page: Page, selector: string, property: string): Promise<string> {
    return await page.evaluate(({ sel, prop }) => {
        const element = document.querySelector(sel);
        if (!element) return '';
        return window.getComputedStyle(element).getPropertyValue(prop);
    }, { sel: selector, prop: property });
}

/**
 * Check element visibility in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
    return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }, selector);
}
