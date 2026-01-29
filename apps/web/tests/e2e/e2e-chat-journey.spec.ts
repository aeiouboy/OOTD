/**
 * E2E Test: Chat Journey Verification
 * Tests the full conversational flow from initial greeting to outfit recommendations
 */

import { test, expect } from '@playwright/test';

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

        // 2. Verify Thai Quick Prompts
        const quickPrompt = page.locator('button:has-text("ชุดไปทำงาน")');
        await expect(quickPrompt).toBeVisible();
        console.log('✅ Thai quick prompts verified');

        // 3. Send User Request
        const chatInput = page.locator('input[placeholder*="OOTDay"]').or(page.locator('input[type="text"]')).first();
        await chatInput.fill('อยากได้ชุดที่ใส่ไปทำงานและไปหาเพื่อนต่อตอนเย็นได้');
        await chatInput.press('Enter');

        // 4. Wait for AI Response (Text + Outfit Cards)
        console.log('Waiting for AI response...');

        // Wait for connection/processing (Removed hard wait to rely on auto-retry)
        // await page.waitForTimeout(15000);

        // Verify AI response exists (check for 2nd assistant message bubble)
        // ChatMessage uses bg-[var(--chat-assistant)] for AI messages
        const responseBubble = page.locator('.bg-\\[var\\(--chat-assistant\\)\\]').nth(1);
        await expect(responseBubble).toBeVisible({ timeout: 60000 }); // Increase timeout for AI generation

        // 5. Verify Outfit Cards
        const outfitCard = page.locator('text=฿').first(); // Price indicator
        await expect(outfitCard).toBeVisible({ timeout: 40000 });

        // Verify "View Look" button uses Thai text "ดูลุค"
        const viewButton = page.locator('button:has-text("ดูลุค")').first();
        await expect(viewButton).toBeVisible();
        console.log('✅ Outfit cards with Thai button "ดูลุค" verified');

        // Take a screenshot of the result
        await page.screenshot({ path: 'test-results/chat-journey-result.png', fullPage: true });
    });
});
