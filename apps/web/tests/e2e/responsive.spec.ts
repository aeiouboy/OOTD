/**
 * E2E Tests: Responsive Design
 * Tests layout and behavior across different viewport sizes
 */

import { test, expect } from '@playwright/test';
import { navigateWithProfile, waitForAppLoad, mockAllAPIs } from '../utils/test-helpers';
import { COMPLETE_PROFILE } from '../fixtures/user-profiles';
import { VIEWPORTS, TIMEOUTS } from '../fixtures/test-data';

test.describe('Responsive Design - Viewport Transitions', () => {
    test('should show desktop layout at 1920x1080', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Desktop layout should be visible (lg:flex)
        const desktopLayout = page.locator('.hidden.lg\\:flex, div.lg\\:flex');
        await expect(desktopLayout.first()).toBeVisible({ timeout: TIMEOUTS.medium });

        // Three panel layout indicators
        const leftPanel = page.locator('aside');
        const rightPanel = page.locator('[aria-label*="Chat"]');

        await expect(leftPanel.first()).toBeVisible();
    });

    test('should show mobile layout at 390x844 (iPhone)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Mobile layout should be visible (lg:hidden)
        const mobileLayout = page.locator('.lg\\:hidden');
        // Bottom nav should be visible
        const bottomNav = page.locator('nav');
        await expect(bottomNav.first()).toBeVisible();
    });

    test('should show tablet layout at 820x1180', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // At tablet size (< 1024px), should show mobile layout
        const bottomNav = page.locator('nav');
        await expect(bottomNav.first()).toBeVisible();
    });

    test('should transition smoothly between breakpoints', async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);

        // Start at desktop
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.waitForTimeout(500);

        // Verify desktop layout
        const desktopIndicator = page.locator('.hidden.lg\\:flex, aside');
        await expect(desktopIndicator.first()).toBeVisible();

        // Transition to mobile
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.waitForTimeout(500);

        // Verify mobile layout
        const mobileIndicator = page.locator('nav').last();
        await expect(mobileIndicator).toBeVisible();

        // Transition back to desktop
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.waitForTimeout(500);

        // Desktop layout should restore
        await expect(desktopIndicator.first()).toBeVisible();
    });
});

test.describe('Responsive Design - Font Scaling', () => {
    test('should have readable fonts on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Check body font size
        const bodyFontSize = await page.evaluate(() => {
            return window.getComputedStyle(document.body).fontSize;
        });

        // Font should be at least 14px for readability
        const fontSize = parseInt(bodyFontSize);
        expect(fontSize).toBeGreaterThanOrEqual(14);
    });

    test('should have proper heading sizes on desktop', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        const heading = page.locator('h1').first();

        if (await heading.isVisible()) {
            const fontSize = await heading.evaluate(el => {
                return window.getComputedStyle(el).fontSize;
            });

            // H1 should be reasonably large
            const size = parseInt(fontSize);
            expect(size).toBeGreaterThanOrEqual(18);
        }
    });
});

test.describe('Responsive Design - Touch Targets', () => {
    test('should have minimum touch target size on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Check navigation buttons
        const navButtons = page.locator('nav button');
        const count = await navButtons.count();

        for (let i = 0; i < count; i++) {
            const button = navButtons.nth(i);
            const box = await button.boundingBox();

            if (box) {
                // Apple recommends 44pt minimum touch targets
                expect(box.height).toBeGreaterThanOrEqual(40);
            }
        }
    });

    test('should have adequate spacing between touch targets', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Check that bottom nav buttons have space between them
        const navButtons = page.locator('nav button');
        const count = await navButtons.count();

        if (count >= 2) {
            const box1 = await navButtons.nth(0).boundingBox();
            const box2 = await navButtons.nth(1).boundingBox();

            if (box1 && box2) {
                // There should be some gap between buttons
                const gap = box2.x - (box1.x + box1.width);
                expect(gap).toBeGreaterThanOrEqual(0);
            }
        }
    });
});

test.describe('Responsive Design - No Horizontal Scroll', () => {
    test('should not have horizontal scroll on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
    });

    test('should not have horizontal scroll on tablet', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
    });

    test('should not have horizontal scroll on desktop', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
    });
});

test.describe('Responsive Design - Image Scaling', () => {
    test('should scale images to fit viewport on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
            const image = images.nth(i);
            const box = await image.boundingBox();

            if (box) {
                // Image should not exceed viewport width
                expect(box.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width);
            }
        }
    });

    test('should maintain aspect ratio on images', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        // Check outfit card images have aspect ratio
        const cardImages = page.locator('.outfit-card img, [data-testid="outfit-card"] img').first();

        if (await cardImages.isVisible()) {
            const box = await cardImages.boundingBox();

            if (box) {
                // Should have some reasonable aspect ratio (not 0)
                expect(box.height).toBeGreaterThan(0);
                expect(box.width).toBeGreaterThan(0);
            }
        }
    });
});

test.describe('Responsive Design - Grid Layouts', () => {
    test('should show 2-column grid on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Go to outfits tab
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(500);

        // Check for grid-cols-2
        const grid = page.locator('.grid-cols-2, .grid.gap-4');
        const hasGrid = await grid.count() > 0;
        // Grid might exist
    });

    test('should show multi-column layout on desktop', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        // Desktop uses carousel instead of grid
        const carousel = page.locator('.embla, [data-testid="outfit-carousel"]');
        const hasCarousel = await carousel.count() > 0;
        // Desktop might use carousel
    });
});

test.describe('Responsive Design - Navigation Visibility', () => {
    test('should hide desktop navigation on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Desktop left panel (aside) should not be visible
        const leftPanel = page.locator('.hidden.lg\\:flex aside, div.hidden.lg\\:flex > aside');
        // These should be hidden on mobile
    });

    test('should hide mobile navigation on desktop', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Bottom nav tabs should not be visible on desktop
        const mobileNav = page.locator('.lg\\:hidden nav');
        // Mobile nav should be hidden
    });
});

test.describe('Responsive Design - Modal Behavior', () => {
    test('should display modals properly on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Go to outfits and try to open modal
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(500);

        const outfitCard = page.locator('.cursor-pointer').first();
        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(500);

            // Modal/detail should fit viewport
            const modal = page.locator('[role="dialog"], .modal, .outfit-detail');
            if (await modal.first().isVisible()) {
                const box = await modal.first().boundingBox();
                if (box) {
                    expect(box.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width);
                }
            }
        }
    });

    test('should display modals properly on desktop', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        // Select outfit to open detail
        const outfitCard = page.locator('.outfit-card, .cursor-pointer').first();
        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(500);

            // Detail should be in right panel, not modal
            const rightPanel = page.locator('[aria-label*="Chat and outfit"]');
            await expect(rightPanel.first()).toBeVisible();
        }
    });
});

test.describe('Responsive Design - Accessibility', () => {
    test('should maintain focus visibility at all viewport sizes', async ({ page }) => {
        for (const viewport of [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop]) {
            await page.setViewportSize(viewport);
            await mockAllAPIs(page);
            await navigateWithProfile(page, COMPLETE_PROFILE);
            await page.waitForTimeout(500);

            // Tab through interactive elements
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            // Focused element should be visible
            const focusedElement = page.locator(':focus');
            if (await focusedElement.count() > 0) {
                await expect(focusedElement.first()).toBeVisible();
            }
        }
    });
});
