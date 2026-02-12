/**
 * E2E Test: Chat Journey Verification
 * Tests the full conversational flow from initial greeting to outfit recommendations
 */

import { test, expect } from '@playwright/test';

const TEST_CHAT_PROMPT = process.env.E2E_CHAT_PROMPT ?? 'อยากได้ชุดที่ใส่ไปทำงานและไปหาเพื่อนต่อตอนเย็นได้';
const MAX_ASSISTANT_CHAT_CHARS = 500;

test.describe('Chat Journey E2E', () => {
    // Force desktop layout
    test.use({ viewport: { width: 1920, height: 1080 } });

    test.beforeEach(async ({ page }) => {
        // Set localStorage to skip onboarding
        await page.goto('http://localhost:3000');

        await page.evaluate(() => {
            localStorage.setItem('ootday_user_profile', JSON.stringify({
                userName: 'Test User',
                gender: 'women',
                ageRange: '20-29',
                stylePreferences: [],
                onboardingCompleted: true,
                createdAt: new Date().toISOString()
            }));
        });

        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Wait for React to hydrate
    });

    test('should display correct initial greeting and handle chat flow', async ({ page }) => {
        // 1. Verify Initial Greeting
        // Look for the specific Thai greeting text
        const greeting = page.locator('text=ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา');
        await expect(greeting).toBeVisible({ timeout: 10000 });
        console.log('✅ Initial greeting verified');

        // 2. Quick prompts are optional depending on runtime flags/content
        const quickPrompts = page.locator('button').filter({ hasText: /ชุด|ลุค|ไปทำงาน|ไปเที่ยว|วันหยุด/i });
        if (await quickPrompts.count()) {
            await expect(quickPrompts.first()).toBeVisible();
            console.log('✅ Quick prompts visible');
        }

        // 3. Send User Request
        const chatInput = page.locator(
            'textarea[placeholder*="พิมพ์"]:visible, textarea[placeholder*="Ask"]:visible, input[placeholder*="OOTDay"]:visible, input[placeholder*="Ask me"]:visible, input[placeholder*="พิมพ์"]:visible, input[type="text"]:visible'
        ).first();
        await expect(chatInput).toBeVisible({ timeout: 10000 });
        await chatInput.fill(TEST_CHAT_PROMPT);
        await chatInput.press('Enter');

        // 4. Wait for AI Response
        console.log('Waiting for AI response...');

        // Wait for typing indicator to stop (can take longer with real AI calls)
        await expect(page.locator('text=กำลังพิมพ์...')).toHaveCount(0, { timeout: 120000 });

        // ChatMessage uses bg-[var(--chat-assistant)] for AI messages.
        // Expect at least greeting + one generated response.
        const assistantBubbles = page.locator('.bg-\\[var\\(--chat-assistant\\)\\]');
        await expect
            .poll(async () => assistantBubbles.count(), { timeout: 120000 })
            .toBeGreaterThan(1);
        const responseBubble = assistantBubbles.nth(1);
        await expect(responseBubble).toBeVisible({ timeout: 120000 });

        // Regression guard: assistant chat bubble should stay concise
        const responseText = (await responseBubble.textContent()) ?? '';
        expect(responseText.length).toBeLessThanOrEqual(MAX_ASSISTANT_CHAT_CHARS);

        // 5. Verify "View Look" flow shows matching shop items
        const viewLookButton = page.getByRole('button', { name: 'ดูลุค' }).first();
        await expect(viewLookButton).toBeVisible({ timeout: 120000 });
        await expect(viewLookButton).toBeEnabled({ timeout: 120000 });
        await viewLookButton.click();

        await expect(page.getByText(/Shop this look/i)).toBeVisible({ timeout: 10000 });
        const productCards = page.locator('div').filter({ hasText: /Buy Now/i });
        await expect(productCards.first()).toBeVisible({ timeout: 10000 });

        // 6. Verify product link is a product page URL, not a generic gender landing page
        await page.evaluate(() => {
            // @ts-expect-error test-only field
            window.__lastOpenedUrl = null;
            window.open = ((url?: string | URL | undefined) => {
                // @ts-expect-error test-only field
                window.__lastOpenedUrl = typeof url === 'string' ? url : (url?.toString() ?? '');
                return null;
            }) as typeof window.open;
        });

        const buyNowButton = page.getByRole('button', { name: 'Buy Now' }).first();
        await expect(buyNowButton).toBeVisible({ timeout: 10000 });
        await buyNowButton.click();

        const openedUrl = await page.evaluate(() => {
            // @ts-expect-error test-only field
            return window.__lastOpenedUrl as string | null;
        });
        expect(openedUrl).toBeTruthy();
        expect(openedUrl).not.toBe('https://www.central.co.th/th/women');
        expect(openedUrl).not.toBe('https://www.central.co.th/th/men');

        // Take a screenshot of the result
        await page.screenshot({ path: 'test-results/chat-journey-result.png', fullPage: true });
    });
});
