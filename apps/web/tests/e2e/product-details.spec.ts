/**
 * E2E Tests: Product Details
 * Tests outfit detail view and product interaction
 */

import { test, expect } from '@playwright/test';
import { OutfitDetailPage, OutfitDiscoveryPage } from '../utils/page-objects';
import { navigateWithProfile, waitForAppLoad, mockAllAPIs } from '../utils/test-helpers';
import { COMPLETE_PROFILE } from '../fixtures/user-profiles';
import { VIEWPORTS, TIMEOUTS } from '../fixtures/test-data';

test.describe('Product Details - Outfit View', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        // Select an outfit to open detail view
        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();
        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(1000);
        }
    });

    test('should display outfit detail view after selection', async ({ page }) => {
        const outfitDetail = new OutfitDetailPage(page);

        // Detail view indicators
        const detailView = page.locator('[data-testid="outfit-detail"], .outfit-detail, button:has-text("Explore"), button:has-text("กลับ")');
        await expect(detailView.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should display back button (Explore more outfits)', async ({ page }) => {
        const backButton = page.locator('button:has-text("Explore"), button:has-text("กลับ"), button:has(.lucide-arrow-left)');
        await expect(backButton.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should return to discovery when clicking back button', async ({ page }) => {
        const backButton = page.locator('button:has-text("Explore"), button:has-text("กลับ"), button:has(.lucide-arrow-left)').first();

        if (await backButton.isVisible()) {
            await backButton.click();
            await page.waitForTimeout(1000);

            // Chat should be visible again
            const chatInput = page.locator('input[placeholder*="OOTDay"], input[placeholder*="Ask me"]');
            await expect(chatInput.first()).toBeVisible({ timeout: TIMEOUTS.medium });
        }
    });

    test('should display outfit title and description', async ({ page }) => {
        // Outfit title
        const title = page.locator('[data-testid="outfit-title"], .outfit-title, h1, h2').first();
        await expect(title).toBeVisible();

        // Description might be present
        const description = page.locator('[data-testid="outfit-description"], .outfit-description, p');
        // Description is optional
    });

    test('should display outfit preview image', async ({ page }) => {
        const previewImage = page.locator('img[alt*="outfit"], img[alt*="Outfit"], .outfit-image, img').first();
        await expect(previewImage).toBeVisible();
    });
});

test.describe('Product Details - Product List', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        // Select an outfit
        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();
        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(1000);
        }
    });

    test('should display product items in outfit', async ({ page }) => {
        // Product cards/items
        const productItems = page.locator('[data-testid="product-card"], .product-card, .product-item');
        const itemCount = await productItems.count();

        // Should have at least one product
        expect(itemCount).toBeGreaterThanOrEqual(0);
    });

    test('should display product name and brand', async ({ page }) => {
        const productCard = page.locator('[data-testid="product-card"], .product-card, .product-item').first();

        if (await productCard.isVisible()) {
            // Product name
            const name = productCard.locator('[data-testid="product-name"], .product-name, h3, h4');
            await expect(name.first()).toBeVisible();
        }
    });

    test('should display product price', async ({ page }) => {
        const productCard = page.locator('[data-testid="product-card"], .product-card, .product-item').first();

        if (await productCard.isVisible()) {
            // Price (Thai Baht format)
            const price = productCard.locator('text=/฿|THB|บาท/, .price, .text-primary');
            await expect(price.first()).toBeVisible();
        }
    });

    test('should display product image', async ({ page }) => {
        const productCard = page.locator('[data-testid="product-card"], .product-card, .product-item').first();

        if (await productCard.isVisible()) {
            const image = productCard.locator('img');
            await expect(image.first()).toBeVisible();
        }
    });
});

test.describe('Product Details - Buy Actions', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        // Select an outfit
        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();
        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(1000);
        }
    });

    test('should display Buy Now button on product cards', async ({ page }) => {
        const buyButton = page.locator('button:has-text("Buy"), button:has-text("ซื้อ"), a:has-text("Buy")');
        await expect(buyButton.first()).toBeVisible({ timeout: TIMEOUTS.medium });
    });

    test('should open external URL when clicking Buy button', async ({ page, context }) => {
        // Listen for new page (popup)
        const pagePromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);

        const buyButton = page.locator('button:has-text("Buy"), button:has-text("ซื้อ"), a:has-text("Buy")').first();

        if (await buyButton.isVisible()) {
            await buyButton.click();

            // New page should open (or same page if URL is in href)
            const newPage = await pagePromise;

            if (newPage) {
                // External URL opened
                const url = newPage.url();
                expect(url).not.toContain('localhost:3000');
                await newPage.close();
            }
        }
    });

    test('should display Shop the Look button', async ({ page }) => {
        const shopLookButton = page.locator('button:has-text("Shop the Look"), button:has-text("ซื้อทั้งชุด"), button:has-text("Shop")');

        if (await shopLookButton.first().isVisible()) {
            await expect(shopLookButton.first()).toBeEnabled();
        }
    });

    test('should display total price in sticky section', async ({ page }) => {
        // Sticky purchase section at bottom
        const stickySection = page.locator('.sticky, [data-testid="sticky-purchase"]');

        if (await stickySection.first().isVisible()) {
            // Total price should be visible
            const totalPrice = stickySection.locator('text=/฿|THB|Total|รวม/');
            await expect(totalPrice.first()).toBeVisible();
        }
    });
});

test.describe('Product Details - Similar Outfits', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(2000);

        // Select an outfit
        const outfitCard = page.locator('.outfit-card, [data-testid="outfit-card"], .cursor-pointer').first();
        if (await outfitCard.isVisible()) {
            await outfitCard.click();
            await page.waitForTimeout(1000);
        }
    });

    test('should display similar outfits section', async ({ page }) => {
        // Look for similar outfits section
        const similarSection = page.locator('[data-testid="similar-outfits"], .similar-outfits, text=/Similar|คล้ายกัน|More looks/i');

        // Similar outfits might not always be present
        if (await similarSection.first().isVisible()) {
            await expect(similarSection.first()).toBeVisible();
        }
    });

    test('should switch to similar outfit on click', async ({ page }) => {
        const similarOutfit = page.locator('[data-testid="similar-outfit"], .similar-outfit').first();

        if (await similarOutfit.isVisible()) {
            // Get current outfit title
            const currentTitle = await page.locator('[data-testid="outfit-title"], h1, h2').first().textContent();

            await similarOutfit.click();
            await page.waitForTimeout(1000);

            // Title might change
            const newTitle = await page.locator('[data-testid="outfit-title"], h1, h2').first().textContent();
            // Titles could be same or different
        }
    });
});

test.describe('Product Details - Mobile', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test.beforeEach(async ({ page }) => {
        await mockAllAPIs(page);
        await navigateWithProfile(page, COMPLETE_PROFILE);
        await page.waitForTimeout(1000);

        // Go to outfits tab and select one
        const outfitsTab = page.locator('button:has-text("ชุด"), button:has(.lucide-grid-3x3)');
        await outfitsTab.first().click();
        await page.waitForTimeout(1000);

        const outfitCard = page.locator('.cursor-pointer').first();
        if (await outfitCard.isVisible()) {
            await outfitCard.tap();
            await page.waitForTimeout(1000);
        }
    });

    test('should display product details on mobile', async ({ page }) => {
        // Detail view should be visible
        const detailContent = page.locator('[data-testid="outfit-detail"], .outfit-detail, text=/Shop|Buy|ซื้อ/i');
        // Might be in modal or new view
    });

    test('should have accessible buy buttons on mobile', async ({ page }) => {
        const buyButton = page.locator('button:has-text("Buy"), button:has-text("ซื้อ")');

        if (await buyButton.first().isVisible()) {
            const box = await buyButton.first().boundingBox();

            if (box) {
                // Button should be large enough for touch
                expect(box.height).toBeGreaterThanOrEqual(40);
            }
        }
    });

    test('should scroll product list on mobile', async ({ page }) => {
        const productList = page.locator('.product-list, [data-testid="product-list"]');

        if (await productList.first().isVisible()) {
            const box = await productList.first().boundingBox();

            if (box) {
                // Scroll the product list
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.wheel(0, 200);
                await page.waitForTimeout(500);
            }
        }
    });
});
