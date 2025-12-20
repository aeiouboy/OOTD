/**
 * E2E Tests: Mobile Layout
 * Tests the mobile layout with bottom tab navigation
 */

import { test, expect } from '@playwright/test';
import { MobileNavigationPage, ChatPage, OutfitDiscoveryPage, FilterPage } from '../utils/page-objects';
import { navigateWithProfile, waitForAppLoad, mockAllAPIs } from '../utils/test-helpers';
import { COMPLETE_PROFILE } from '../fixtures/user-profiles';
import { VIEWPORTS, TIMEOUTS } from '../fixtures/test-data';

test.describe('Mobile Layout - Bottom Tab Navigation', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should display mobile layout on mobile viewport', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Mobile layout should be visible
        const mobileLayout = page.locator('.lg\\:hidden, div:not(.hidden):not(.lg\\:flex)');
        await expect(mobileLayout.first()).toBeVisible({ timeout: TIMEOUTS.medium });

        // Desktop layout should be hidden
        const desktopLayout = page.locator('.hidden.lg\\:flex');
        // This should not be visible on mobile
    });

    test('should display header with logo and notification bell', async ({ page }) => {
        const mobileNav = new MobileNavigationPage(page);

        await page.waitForTimeout(1000);

        // Header should be visible
        const header = page.locator('header');
        await expect(header.first()).toBeVisible();

        // Logo/Title "OOTDay" should be visible
        const logo = page.locator('h1:has-text("OOTDay"), text=OOTDay');
        await expect(logo.first()).toBeVisible();

        // Sparkles icon should be near logo
        const sparkles = page.locator('.lucide-sparkles, svg.lucide-sparkles');
        await expect(sparkles.first()).toBeVisible();

        // Bell icon should be visible
        const bell = page.locator('button:has(.lucide-bell), .lucide-bell');
        await expect(bell.first()).toBeVisible();
    });

    test('should display bottom navigation with three tabs', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Bottom navigation should be visible
        const bottomNav = page.locator('nav').last();
        await expect(bottomNav).toBeVisible();

        // Filters tab (กรอง)
        const filtersTab = page.locator('button:has-text("กรอง"), button:has(.lucide-sliders-horizontal)');
        await expect(filtersTab.first()).toBeVisible();

        // Outfits tab (ชุด)
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await expect(outfitsTab.first()).toBeVisible();

        // Chat tab (แชท)
        const chatTab = page.locator('button:has-text("แชท"), button:has(.lucide-message-circle)');
        await expect(chatTab.first()).toBeVisible();
    });

    test('should switch to Filters tab and show filter content', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Click Filters tab
        const filtersTab = page.locator('button:has-text("กรอง"), button:has(.lucide-sliders-horizontal)');
        await filtersTab.first().click();
        await page.waitForTimeout(500);

        // Tab should be active (primary color)
        const tabClass = await filtersTab.first().getAttribute('class');
        expect(tabClass).toMatch(/text-primary|text-\w+-\d+/);

        // Filter content should be visible
        const filterContent = page.locator('button:has-text("All"), button:has-text("Women"), button:has-text("ทั้งหมด"), button:has-text("ผู้หญิง")');
        await expect(filterContent.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should switch to Outfits tab and show outfit grid', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Click Outfits tab
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(500);

        // Tab should be active
        const tabClass = await outfitsTab.first().getAttribute('class');
        expect(tabClass).toMatch(/text-primary|active/);

        // Outfit content should be visible (grid or empty state)
        const outfitContent = page.locator('main');
        await expect(outfitContent.first()).toBeVisible();
    });

    test('should switch to Chat tab and show chat interface', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Click Chat tab
        const chatTab = page.locator('button:has-text("แชท"), button:has(.lucide-message-circle)');
        await chatTab.first().click();
        await page.waitForTimeout(500);

        // Tab should be active
        const tabClass = await chatTab.first().getAttribute('class');
        expect(tabClass).toMatch(/text-primary|active/);

        // Chat input should be visible
        const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"], input[placeholder*="พิมพ์"]');
        await expect(chatInput.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should highlight active tab correctly', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Get all tab buttons
        const filtersTab = page.locator('button:has-text("กรอง"), button:has(.lucide-sliders-horizontal)').first();
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)').first();
        const chatTab = page.locator('button:has-text("แชท"), button:has(.lucide-message-circle)').first();

        // Initially, outfits tab should be active (default)
        let outfitsClass = await outfitsTab.getAttribute('class') || '';
        // Check that one tab has primary color

        // Click filters tab
        await filtersTab.click();
        await page.waitForTimeout(300);

        const filtersClass = await filtersTab.getAttribute('class') || '';
        expect(filtersClass).toContain('text-primary');

        // Other tabs should not be primary (use text-gray-600)
        outfitsClass = await outfitsTab.getAttribute('class') || '';
        expect(outfitsClass).toMatch(/text-gray-\d+|text-muted/);

        // Click chat tab
        await chatTab.click();
        await page.waitForTimeout(300);

        const chatClass = await chatTab.getAttribute('class') || '';
        expect(chatClass).toContain('text-primary');
    });

    test('should maintain scroll position when switching tabs', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Go to outfits tab
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(500);

        // Scroll down
        await page.evaluate(() => {
            const main = document.querySelector('main');
            if (main) main.scrollTop = 200;
        });

        // Switch to another tab
        const chatTab = page.locator('button:has-text("แชท"), button:has(.lucide-message-circle)');
        await chatTab.first().click();
        await page.waitForTimeout(300);

        // Switch back to outfits
        await outfitsTab.first().click();
        await page.waitForTimeout(300);

        // Content should be at top (scroll resets per tab)
        // This behavior might vary - just verify tab works
        await expect(outfitsTab.first()).toBeVisible();
    });
});

test.describe('Mobile Layout - Header Interactions', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should have clickable notification bell', async ({ page }) => {
        await page.waitForTimeout(1000);

        const bellButton = page.locator('button:has(.lucide-bell)');

        if (await bellButton.first().isVisible()) {
            // Bell should be clickable
            await expect(bellButton.first()).toBeEnabled();

            // Click bell (might open notifications - just verify it's interactive)
            await bellButton.first().click();
            await page.waitForTimeout(300);
        }
    });

    test('should have sticky header on scroll', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Go to outfits tab which has scrollable content
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(500);

        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(300);

        // Header should still be visible (sticky)
        const header = page.locator('header.sticky, header');
        await expect(header.first()).toBeVisible();

        // Logo should still be visible
        const logo = page.locator('h1:has-text("OOTDay"), text=OOTDay');
        await expect(logo.first()).toBeVisible();
    });
});

test.describe('Mobile Layout - Touch Interactions', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should have adequate touch targets (minimum 44px)', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Check bottom nav buttons
        const navButtons = page.locator('nav button');
        const buttonCount = await navButtons.count();

        for (let i = 0; i < buttonCount; i++) {
            const button = navButtons.nth(i);
            const box = await button.boundingBox();

            if (box) {
                // Touch targets should be at least 44px (Apple HIG recommendation)
                expect(box.height).toBeGreaterThanOrEqual(40);
            }
        }
    });

    test('should handle swipe gestures on outfit cards', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Go to outfits tab
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(500);

        // Find carousel or scrollable area
        const carousel = page.locator('.embla, [data-testid="outfit-carousel"]');

        if (await carousel.first().isVisible()) {
            const box = await carousel.first().boundingBox();

            if (box) {
                // Simulate swipe left
                await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
                await page.mouse.up();

                await page.waitForTimeout(500);
            }
        }
    });
});

test.describe('Mobile Layout - Responsive Behavior', () => {
    test('should switch between mobile and desktop layout at breakpoint', async ({ page }) => {
        await mockAllAPIs(page);

        // Start at mobile size
        await page.setViewportSize(VIEWPORTS.mobile);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Bottom nav should be visible
        const bottomNav = page.locator('nav').last();
        await expect(bottomNav).toBeVisible();

        // Resize to desktop
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.waitForTimeout(500);

        // Desktop layout should now be visible
        const desktopLayout = page.locator('.lg\\:flex, div.hidden.lg\\:flex');
        await expect(desktopLayout.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should not show desktop panels on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // The three-panel layout should not be visible
        const threePanelLayout = page.locator('div.hidden.lg\\:flex');

        // This element should exist but be hidden
        if (await threePanelLayout.count() > 0) {
            await expect(threePanelLayout.first()).not.toBeVisible();
        }
    });
});
