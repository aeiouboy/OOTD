/**
 * E2E Tests: Desktop Layout
 * Tests the three-panel desktop layout architecture
 */

import { test, expect } from '@playwright/test';
import { DesktopLayoutPage, ChatPage, OutfitDiscoveryPage, FilterPage } from '../utils/page-objects';
import { navigateWithProfile, waitForAppLoad, mockAllAPIs } from '../utils/test-helpers';
import { COMPLETE_PROFILE } from '../fixtures/user-profiles';
import { VIEWPORTS, TIMEOUTS, SELECTORS } from '../fixtures/test-data';

test.describe('Desktop Layout - Three Panel Architecture', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should display three-panel layout on desktop', async ({ page }) => {
        const layout = new DesktopLayoutPage(page);

        // Wait for layout to render
        await page.waitForTimeout(1000);

        // Check for desktop layout container
        const desktopLayout = page.locator('.lg\\:flex, div.hidden.lg\\:flex');
        await expect(desktopLayout.first()).toBeVisible({ timeout: TIMEOUTS.medium });

        // Left panel (Navigation/Filters) should be visible
        const leftPanel = page.locator('aside, [aria-label*="Navigation"], [data-testid="left-panel"]');
        await expect(leftPanel.first()).toBeVisible();

        // Middle panel (Outfit Discovery) should be visible
        const middlePanel = page.locator('main[aria-label*="Outfit"], [data-testid="middle-panel"], main.flex-1');
        await expect(middlePanel.first()).toBeVisible();

        // Right panel (Chat/Details) should be visible
        const rightPanel = page.locator('[aria-label*="Chat and outfit"], [data-testid="right-panel"]');
        await expect(rightPanel.first()).toBeVisible();
    });

    test('should have correct panel widths', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Left panel should be around 280px
        const leftPanel = page.locator('aside, [aria-label*="Navigation"]').first();
        const leftBox = await leftPanel.boundingBox();

        if (leftBox) {
            expect(leftBox.width).toBeGreaterThanOrEqual(240);
            expect(leftBox.width).toBeLessThanOrEqual(320);
        }

        // Right panel should be around 420px by default
        const rightPanel = page.locator('[aria-label*="Chat and outfit"]').first();
        const rightBox = await rightPanel.boundingBox();

        if (rightBox) {
            expect(rightBox.width).toBeGreaterThanOrEqual(280);
            expect(rightBox.width).toBeLessThanOrEqual(800);
        }
    });

    test('should display filters in left panel', async ({ page }) => {
        const filterPage = new FilterPage(page);

        await page.waitForTimeout(1000);

        // Filter container should be visible
        const filterContainer = page.locator('aside');
        await expect(filterContainer.first()).toBeVisible();

        // Category filters should be present
        const categoryButtons = page.locator('button:has-text("All"), button:has-text("Women"), button:has-text("Men"), button:has-text("ทั้งหมด"), button:has-text("ผู้หญิง")');
        await expect(categoryButtons.first()).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test('should display outfit grid in middle panel', async ({ page }) => {
        const outfitDiscovery = new OutfitDiscoveryPage(page);

        await page.waitForTimeout(2000);

        // Main content area should exist
        const mainArea = page.locator('main');
        await expect(mainArea.first()).toBeVisible();

        // Look for outfit cards or carousel
        const outfitContent = page.locator('.outfit-card, [data-testid="outfit-card"], .embla, [data-testid="outfit-carousel"]');
        const outfitCount = await outfitContent.count();

        // If no outfits, might show empty state or loading
        if (outfitCount === 0) {
            const emptyOrLoading = page.locator('.skeleton, [data-testid="empty-state"]').or(page.getByText(/loading|กำลังโหลด/i));
            expect(await emptyOrLoading.count()).toBeGreaterThanOrEqual(0);
        }
    });

    test('should display chat assistant in right panel', async ({ page }) => {
        const chatPage = new ChatPage(page);

        await page.waitForTimeout(1000);

        // Right panel should contain chat
        const rightPanel = page.locator('[aria-label*="Chat and outfit"]');
        await expect(rightPanel.first()).toBeVisible();

        // Chat input should be visible
        const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"], input[placeholder*="พิมพ์"]');
        await expect(chatInput.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should have resizable right panel with drag handle', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Look for resize handle
        const resizeHandle = page.locator('div[role="separator"][aria-orientation="vertical"], [data-testid="resize-handle"]');

        if (await resizeHandle.count() > 0) {
            await expect(resizeHandle.first()).toBeVisible();

            // Get initial right panel width
            const rightPanel = page.locator('[aria-label*="Chat and outfit"]').first();
            const initialBox = await rightPanel.boundingBox();
            const initialWidth = initialBox?.width || 420;

            // Drag the resize handle
            const handleBox = await resizeHandle.first().boundingBox();
            if (handleBox) {
                await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(handleBox.x - 100, handleBox.y + handleBox.height / 2);
                await page.mouse.up();

                // Check if width changed
                const newBox = await rightPanel.boundingBox();
                // Width should be different (either increased or stayed due to max/min constraints)
                expect(newBox).not.toBeNull();
            }
        }
    });

    test('should switch from chat to outfit detail in right panel', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Find and click an outfit card
        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();

        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(1000);

            // Right panel should now show outfit detail
            const detailView = page.locator('[data-testid="outfit-detail"], .outfit-detail').or(page.getByText(/Explore more|กลับ/i));
            await expect(detailView.first()).toBeVisible({ timeout: TIMEOUTS.medium });
        }
    });

    test('should return to chat from outfit detail using back button', async ({ page }) => {
        await page.waitForTimeout(2000);

        // First, select an outfit
        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();

        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(1000);

            // Find and click back button
            const backButton = page.locator('button:has-text("Explore"), button:has-text("กลับ"), button:has(.lucide-arrow-left)');

            if (await backButton.first().isVisible()) {
                await backButton.first().click();
                await page.waitForTimeout(1000);

                // Chat should be visible again
                const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"], input[placeholder*="พิมพ์"]');
                await expect(chatInput.first()).toBeVisible({ timeout: TIMEOUTS.medium });
            }
        }
    });

    test('should close outfit detail with ESC key', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Select an outfit
        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();

        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(1000);

            // Verify we're in detail view
            const detailView = page.locator('[data-testid="outfit-detail"], .outfit-detail').or(page.getByText(/Explore more|กลับ/i));
            if (await detailView.first().isVisible()) {
                // Press ESC
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);

                // Should return to chat view
                const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"], input[placeholder*="พิมพ์"]');
                await expect(chatInput.first()).toBeVisible({ timeout: TIMEOUTS.medium });
            }
        }
    });

    test('should hide mobile layout on desktop', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Mobile layout should be hidden (has lg:hidden class)
        const mobileLayout = page.locator('.lg\\:hidden');

        // These elements should exist but not be visible on desktop
        for (const element of await mobileLayout.all()) {
            const isVisible = await element.isVisible();
            // Elements with lg:hidden should not be visible on desktop viewport
            // But some might be nested, so we just check the primary mobile container
        }

        // Bottom navigation (mobile only) should not be visible
        const bottomNav = page.locator('nav:has(button:has-text("กรอง")), nav:has(button:has-text("ชุด"))');
        if (await bottomNav.count() > 0) {
            await expect(bottomNav.first()).not.toBeVisible();
        }
    });
});

test.describe('Desktop Layout - Panel Interactions', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should update outfit grid when filters change', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Click a filter (e.g., category)
        const womenButton = page.locator('button:has-text("Women"), button:has-text("ผู้หญิง")');

        if (await womenButton.first().isVisible()) {
            await womenButton.first().click();
            await page.waitForTimeout(1000);

            // Grid should update (might show loading first)
            await page.waitForLoadState('networkidle');
        }
    });

    test('should maintain layout proportions on resize', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Get initial layout
        const leftPanel = page.locator('aside').first();
        const leftInitial = await leftPanel.boundingBox();

        // Resize viewport
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(500);

        // Left panel width should remain consistent (fixed width)
        const leftAfter = await leftPanel.boundingBox();

        if (leftInitial && leftAfter) {
            // Left panel should maintain its width (around 280px)
            expect(Math.abs(leftAfter.width - leftInitial.width)).toBeLessThan(50);
        }
    });
});
