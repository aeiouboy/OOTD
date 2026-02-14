/**
 * E2E Test: Chat Journey Verification
 * Tests the full conversational flow from initial greeting to outfit recommendations
 */

import { test, expect } from '@playwright/test';

const TEST_CHAT_PROMPT = process.env.E2E_CHAT_PROMPT ?? 'อยากได้ชุดที่ใส่ไปทำงานและไปหาเพื่อนต่อตอนเย็นได้';
const TEST_CHAT_FOLLOWUP_BUDGET = process.env.E2E_CHAT_FOLLOWUP_BUDGET ?? '50000';
const MAX_ASSISTANT_CHAT_CHARS = 500;
const GENERIC_CATEGORY_URLS = new Set([
    'https://www.central.co.th/th/women',
    'https://www.central.co.th/th/men',
    'https://www.central.co.th',
]);

type CapturedChatLookItem = {
    name?: string;
    url?: string;
};

type CapturedChatResponse = {
    looks?: Array<{
        items?: CapturedChatLookItem[];
    }>;
};

type CapturedGenerateImageRequest = {
    generationType?: string;
    flatLayItems?: Array<{
        name?: string;
    }>;
};

type CapturedGenerateImageResponse = {
    url: string;
    status: number;
    contentType: string;
    isJson: boolean;
    success?: boolean;
    error?: string;
    message?: string;
    rawSnippet?: string;
};

function normalizeText(value: string | null | undefined): string {
    return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

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
        test.setTimeout(180000);
        let capturedChatResponse: CapturedChatResponse | null = null;
        let capturedFlatLayRequest: CapturedGenerateImageRequest | null = null;
        const capturedGenerateImageResponses: CapturedGenerateImageResponse[] = [];
        const capturedConsoleErrors: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() !== 'error') return;
            const text = msg.text();
            if (
                text.includes('/api/generate-image') ||
                text.includes('Flat-lay generation error') ||
                text.includes("Unexpected token '<'")
            ) {
                capturedConsoleErrors.push(text);
            }
        });

        page.on('response', async (response) => {
            if (!response.url().includes('/api/chat') || response.request().method() !== 'POST') return;
            if (capturedChatResponse) return;
            try {
                const body = (await response.json()) as CapturedChatResponse;
                if (body?.looks && Array.isArray(body.looks)) {
                    capturedChatResponse = body;
                }
            } catch {
                // Ignore non-JSON/failed parses in listener
            }
        });

        page.on('request', (request) => {
            if (!request.url().includes('/api/generate-image') || request.method() !== 'POST') return;
            if (capturedFlatLayRequest) return;
            try {
                const data = request.postDataJSON() as CapturedGenerateImageRequest;
                if (
                    data &&
                    (data.generationType === 'flat-lay' || data.generationType === 'hybrid-flat-lay') &&
                    Array.isArray(data.flatLayItems) &&
                    data.flatLayItems.length > 0
                ) {
                    capturedFlatLayRequest = data;
                }
            } catch {
                // Ignore non-JSON payloads in listener
            }
        });

        page.on('response', async (response) => {
            if (!response.url().includes('/api/generate-image') || response.request().method() !== 'POST') return;

            const contentType = response.headers()['content-type'] || '';
            const isJson = contentType.includes('application/json');
            const entry: CapturedGenerateImageResponse = {
                url: response.url(),
                status: response.status(),
                contentType,
                isJson,
            };

            try {
                if (isJson) {
                    const body = await response.json() as { success?: boolean; error?: string; message?: string };
                    entry.success = body?.success;
                    entry.error = body?.error;
                    entry.message = body?.message;
                } else {
                    const raw = await response.text();
                    entry.rawSnippet = raw.slice(0, 180);
                }
            } catch {
                // Keep raw status + content type only.
            }

            capturedGenerateImageResponses.push(entry);
        });

        // 1. Verify Initial Greeting
        // Look for the specific Thai greeting text
        const greeting = page.locator('text=ฮ้ายฮายย👋 กำลังหาชุดไปไหนอยู่น้าา').first();
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
        await expect(page.getByText(TEST_CHAT_PROMPT).first()).toBeVisible({ timeout: 10000 });

        // 4. Wait for AI Response
        console.log('Waiting for AI response...');

        // Wait for typing indicator to stop (can take longer with real AI calls)
        await expect(page.locator('text=กำลังพิมพ์...')).toHaveCount(0, { timeout: 120000 });

        // ChatMessage uses bg-[var(--chat-assistant)] for AI messages.
        // Expect at least greeting + one generated response.
        const assistantBubbles = page.locator('.bg-\\[var\\(--chat-assistant\\)\\]:visible');
        await expect
            .poll(async () => assistantBubbles.count(), { timeout: 120000 })
            .toBeGreaterThan(1);
        const responseBubble = assistantBubbles.last();
        await expect(responseBubble).toBeVisible({ timeout: 120000 });

        // Regression guard: assistant chat bubble should stay concise
        const responseText = (await responseBubble.textContent()) ?? '';
        expect(responseText.length).toBeLessThanOrEqual(MAX_ASSISTANT_CHAT_CHARS);

        // Wait for at least one flat-lay generation request so we can verify item consistency.
        if ((capturedFlatLayRequest?.flatLayItems?.length ?? 0) === 0) {
            // Some flows ask a clarification (e.g., budget) before returning looks.
            const followupInput = page.locator(
                'textarea[placeholder*="พิมพ์"]:visible, textarea[placeholder*="Ask"]:visible, input[placeholder*="OOTDay"]:visible, input[placeholder*="Ask me"]:visible, input[placeholder*="พิมพ์"]:visible, input[type="text"]:visible'
            ).first();
            await expect(followupInput).toBeVisible({ timeout: 10000 });
            await followupInput.fill(TEST_CHAT_FOLLOWUP_BUDGET);
            await followupInput.press('Enter');
            await expect(page.locator('text=กำลังพิมพ์...')).toHaveCount(0, { timeout: 120000 });
        }

        await expect
            .poll(() => capturedFlatLayRequest?.flatLayItems?.length ?? 0, { timeout: 120000 })
            .toBeGreaterThan(0);

        // Regression guard: flat-lay API responses must be JSON and non-500.
        await expect
            .poll(() => capturedGenerateImageResponses.length, { timeout: 120000 })
            .toBeGreaterThan(0);
        const nonJsonResponses = capturedGenerateImageResponses.filter((r) => !r.isJson);
        expect(nonJsonResponses, `Non-JSON /api/generate-image responses: ${JSON.stringify(nonJsonResponses, null, 2)}`).toEqual([]);
        const successfulPayloads = capturedGenerateImageResponses.filter((r) => r.isJson && r.success === true);
        if (successfulPayloads.length === 0) {
            console.warn(
                `[E2E] No successful /api/generate-image response in this run. Responses: ${JSON.stringify(capturedGenerateImageResponses, null, 2)}`
            );
        }
        const aiFallbackResponses = capturedGenerateImageResponses.filter((r) =>
            typeof r.message === 'string' && r.message.toLowerCase().includes('ai-only fallback')
        );
        if (aiFallbackResponses.length > 0) {
            console.warn(
                `[E2E] Hybrid pipeline used AI-only fallback: ${JSON.stringify(aiFallbackResponses, null, 2)}`
            );
        }
        const criticalConsoleErrors = capturedConsoleErrors.filter((text) =>
            text.includes("Unexpected token '<'") ||
            text.toLowerCase().includes('404') ||
            text.toLowerCase().includes('not found')
        );
        expect(criticalConsoleErrors, `Critical console errors during flat-lay generation: ${criticalConsoleErrors.join('\n')}`).toEqual([]);

        // 5. Verify "View Look" flow shows matching shop items
        const viewLookButton = page.getByRole('button', { name: 'ดูลุค' }).first();
        await expect(viewLookButton).toBeVisible({ timeout: 180000 });
        await expect(viewLookButton).toBeEnabled({ timeout: 180000 });
        await viewLookButton.click();

        await expect(page.getByText(/Shop this look/i)).toBeVisible({ timeout: 10000 });
        const productCards = page.locator('div.flex.gap-3.p-3.border.rounded-lg').filter({
            has: page.getByRole('button', { name: 'Buy Now' }),
        });
        await expect(productCards.first()).toBeVisible({ timeout: 10000 });

        const renderedProductCount = await productCards.count();
        expect(renderedProductCount).toBeGreaterThan(0);

        const renderedNames: string[] = [];
        for (let i = 0; i < renderedProductCount; i++) {
            const nameText = await productCards.nth(i).locator('p.font-medium').first().textContent();
            renderedNames.push(normalizeText(nameText));
        }

        // Flat-lay request may be generated for a different look card than the one
        // user opens first, so avoid strict item-name coupling here.
        // URL-level checks below validate that opened products come from chat looks.

        // 6. Verify product links open real product pages.
        await page.evaluate(() => {
            // @ts-expect-error test-only field
            window.__openedUrls = [];
            window.open = ((url?: string | URL | undefined) => {
                const value = typeof url === 'string' ? url : (url?.toString() ?? '');
                // @ts-expect-error test-only field
                window.__openedUrls.push(value);
                return null;
            }) as typeof window.open;
        });

        const clickCount = Math.min(3, renderedProductCount);
        for (let i = 0; i < clickCount; i++) {
            await productCards.nth(i).getByRole('button', { name: 'Buy Now' }).click();
        }

        const openedUrls = await page.evaluate(() => {
            // @ts-expect-error test-only field
            return window.__openedUrls as string[];
        });
        expect(openedUrls.length).toBe(clickCount);

        const chatLookUrls = (capturedChatResponse?.looks ?? [])
            .flatMap((look) => look.items ?? [])
            .map((item) => item.url ?? '')
            .filter(Boolean);

        for (const openedUrl of openedUrls) {
            expect(openedUrl).toBeTruthy();
            expect(GENERIC_CATEGORY_URLS.has(openedUrl)).toBeFalsy();
            expect(openedUrl.startsWith('https://')).toBeTruthy();
            if (chatLookUrls.length > 0) {
                expect(chatLookUrls).toContain(openedUrl);
            }
        }

        // Take a screenshot of the result
        await page.screenshot({ path: 'test-results/chat-journey-result.png', fullPage: true });
    });
});
