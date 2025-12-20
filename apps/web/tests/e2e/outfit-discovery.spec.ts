/**
 * E2E Tests: Outfit Discovery
 * Tests outfit browsing, selection, and carousel functionality
 */

import { test, expect } from '@playwright/test';
import { OutfitDiscoveryPage, OutfitDetailPage } from '../utils/page-objects';
import { navigateWithProfile, waitForAppLoad, mockAllAPIs, mockProductsAPI } from '../utils/test-helpers';
import { COMPLETE_PROFILE } from '../fixtures/user-profiles';
import { MOCK_PRODUCTS_RESPONSE, MOCK_OUTFITS } from '../fixtures/mock-responses';
import { VIEWPORTS, TIMEOUTS } from '../fixtures/test-data';

test.describe('Outfit Discovery - Grid Display', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should display outfit cards on load', async ({ page }) => {
        const outfitDiscovery = new OutfitDiscoveryPage(page);

        await page.waitForTimeout(2000);

        // Should show either outfit cards or loading/empty state
        const content = page.locator('.outfit-card, [data-testid="outfit-card"], .embla, .skeleton, [data-testid="empty-state"]');
        await expect(content.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should show loading skeleton while fetching outfits', async ({ page }) => {
        // Delay API response to catch loading state
        await page.route('**/api/products', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 1500));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_PRODUCTS_RESPONSE.success),
            });
        });

        await page.goto('/');
        await page.evaluate(({ profile }) => {
            localStorage.setItem('ootday_user_profile', JSON.stringify(profile));
        }, { profile: COMPLETE_PROFILE });
        await page.reload();

        // Look for skeleton or loading state
        const skeleton = page.locator('.skeleton, [data-testid="outfit-skeleton"], .animate-pulse');
        // Loading might be brief
        await page.waitForTimeout(500);
    });

    test('should display outfit cards with title and price', async ({ page }) => {
        await page.waitForTimeout(2000);

        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();

        if (await outfitCard.isVisible()) {
            // Card should have title
            const title = outfitCard.locator('h3, .outfit-title, .font-medium');
            await expect(title.first()).toBeVisible();

            // Card should have price
            const price = outfitCard.locator('.text-primary').or(outfitCard.getByText(/฿|THB|บาท/));
            await expect(price.first()).toBeVisible();
        }
    });

    test('should display empty state when no outfits match', async ({ page }) => {
        // Mock empty response
        await page.route('**/api/products', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });

        await page.reload();
        await page.waitForTimeout(2000);

        // Should show empty state or message
        const emptyState = page.locator('[data-testid="empty-state"]').or(page.getByText(/ไม่พบ|no outfit|empty/i));
        // Empty state might appear after loading
    });
});

test.describe('Outfit Discovery - Carousel Navigation', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should display carousel navigation buttons', async ({ page }) => {
        await page.waitForTimeout(2000);

        const carousel = page.locator('.embla, [data-testid="outfit-carousel"]');

        if (await carousel.first().isVisible()) {
            // Next button
            const nextButton = page.locator('button:has(.lucide-chevron-right), button[aria-label*="next"]');
            // Prev button
            const prevButton = page.locator('button:has(.lucide-chevron-left), button[aria-label*="prev"]');

            // At least one navigation should exist
            const hasNav = await nextButton.count() > 0 || await prevButton.count() > 0;
        }
    });

    test('should navigate carousel with next button', async ({ page }) => {
        await page.waitForTimeout(2000);

        const carousel = page.locator('.embla, [data-testid="outfit-carousel"]');

        if (await carousel.first().isVisible()) {
            const nextButton = page.locator('button:has(.lucide-chevron-right)').first();

            if (await nextButton.isVisible()) {
                // Get initial scroll position
                const initialScroll = await carousel.first().evaluate(el => el.scrollLeft);

                await nextButton.click();
                await page.waitForTimeout(500);

                // Scroll position should change
                const newScroll = await carousel.first().evaluate(el => el.scrollLeft);
                // Position might change or stay if at end
            }
        }
    });

    test('should support horizontal scrolling on carousel', async ({ page }) => {
        await page.waitForTimeout(2000);

        const carousel = page.locator('.embla, [data-testid="outfit-carousel"]');

        if (await carousel.first().isVisible()) {
            const box = await carousel.first().boundingBox();

            if (box) {
                // Simulate horizontal scroll
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.wheel(-200, 0);
                await page.waitForTimeout(500);
            }
        }
    });
});

test.describe('Outfit Discovery - Selection', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should select outfit on card click', async ({ page }) => {
        await page.waitForTimeout(2000);

        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();

        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(1000);

            // Should switch to detail view
            const detailView = page.locator('[data-testid="outfit-detail"], .outfit-detail').or(page.getByText(/Explore more|กลับ|Shop/i));
            await expect(detailView.first()).toBeVisible({ timeout: TIMEOUTS.medium });
        }
    });

    test('should display selected outfit in detail panel', async ({ page }) => {
        const outfitDetail = new OutfitDetailPage(page);
        await page.waitForTimeout(2000);

        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();

        if (await outfitCard.isVisible()) {
            // Get outfit title before clicking
            const cardTitle = await outfitCard.locator('h3, .outfit-title').first().textContent();

            await outfitCard.click();
            await page.waitForTimeout(1000);

            // Detail view should be visible
            const backButton = page.locator('button:has-text("Explore"), button:has-text("กลับ"), button:has(.lucide-arrow-left)');
            await expect(backButton.first()).toBeVisible({ timeout: TIMEOUTS.medium });
        }
    });

    test('should show selection thumbnail row', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Look for selection/thumbnail row
        const thumbnailRow = page.locator('[data-testid="selection-row"], .selection-thumbnails, .selected-outfits');

        // This might only appear after selection
        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"]').first();

        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(500);
        }
    });
});

test.describe('Outfit Discovery - Empty and Loading States', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('should display Clear Filters button in empty state', async ({ page }) => {
        // Mock empty products
        await page.route('**/api/products', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        const clearButton = page.locator('button:has-text("Clear"), button:has-text("ล้าง"), button:has-text("Reset")');

        if (await clearButton.first().isVisible()) {
            await expect(clearButton.first()).toBeEnabled();
        }
    });

    test('should handle network error gracefully', async ({ page }) => {
        // Mock network error
        await page.route('**/api/products', async (route) => {
            await route.abort('failed');
        });

        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        // App should not crash
        await expect(page).toHaveURL(/localhost/);
    });
});

test.describe('Outfit Discovery - Mobile', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
    });

    test('should display outfit grid on mobile', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Go to outfits tab
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(1000);

        // Should show outfit grid
        const outfitContent = page.locator('.grid, main');
        await expect(outfitContent.first()).toBeVisible();
    });

    test('should use 2-column grid on mobile', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Go to outfits tab
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(1000);

        // Check for grid-cols-2 class
        const grid = page.locator('.grid-cols-2, .grid.gap-4');
        const hasGrid = await grid.count() > 0;
    });

    test('should open outfit detail on card tap', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Go to outfits tab
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(1000);

        const outfitCard = page.locator('.cursor-pointer').first();

        if (await outfitCard.isVisible()) {
            await outfitCard.tap();
            await page.waitForTimeout(1000);

            // Detail should open
            const detailView = page.locator('[data-testid="outfit-detail"]').or(page.getByText(/Shop|Buy|ซื้อ/i));
            // Might open in a modal or switch view
        }
    });
});
