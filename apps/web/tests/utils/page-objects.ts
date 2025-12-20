/**
 * Page Object Models for OOTDay E2E Tests
 */

import { Page, Locator, expect } from '@playwright/test';
import { SELECTORS, TIMEOUTS } from '../fixtures/test-data';
import { TestUserProfile } from '../fixtures/user-profiles';

/**
 * Onboarding Page Object
 */
export class OnboardingPage {
    readonly page: Page;
    readonly container: Locator;
    readonly nameInput: Locator;
    readonly nextButton: Locator;
    readonly skipButton: Locator;
    readonly completeButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.container = page.locator(SELECTORS.onboarding.container);
        this.nameInput = page.locator(SELECTORS.onboarding.nameInput);
        this.nextButton = page.locator(SELECTORS.onboarding.nextButton);
        this.skipButton = page.locator(SELECTORS.onboarding.skipButton);
        this.completeButton = page.locator(SELECTORS.onboarding.completeButton);
    }

    async isVisible(): Promise<boolean> {
        return await this.container.isVisible().catch(() => false);
    }

    async clickNext(): Promise<void> {
        await this.nextButton.first().click();
        await this.page.waitForTimeout(500);
    }

    async clickSkip(): Promise<void> {
        await this.skipButton.first().click();
        await this.page.waitForTimeout(500);
    }

    async enterName(name: string): Promise<void> {
        await this.nameInput.first().fill(name);
    }

    async selectAgeRange(ageRange: string): Promise<void> {
        const ageButton = this.page.locator(`button:has-text("${ageRange}")`);
        await ageButton.click();
    }

    async selectDepartment(department: 'Women' | 'Men'): Promise<void> {
        const departmentButton = this.page.locator(`button:has-text("${department}")`);
        await departmentButton.click();
    }

    async selectStyles(styles: string[]): Promise<void> {
        for (const style of styles) {
            const styleButton = this.page.locator(`button:has-text("${style}")`);
            if (await styleButton.isVisible()) {
                await styleButton.click();
            }
        }
    }

    async skipPhoto(): Promise<void> {
        const mysteryButton = this.page.locator('button:has-text("Mystery")');
        if (await mysteryButton.isVisible()) {
            await mysteryButton.click();
        } else {
            await this.clickSkip();
        }
    }

    async completeOnboarding(): Promise<void> {
        await this.completeButton.first().click();
        await this.page.waitForTimeout(1000);
    }

    async runFullOnboarding(profile: Partial<TestUserProfile> = {}): Promise<void> {
        // Step 1: Welcome - Click "Let's Go" or equivalent
        await this.clickNext();

        // Step 2: Name
        if (profile.userName) {
            await this.enterName(profile.userName);
        } else {
            await this.enterName('Test User');
        }
        await this.clickNext();

        // Step 3: Department/Gender
        await this.selectDepartment('Women');
        await this.clickNext();

        // Step 4: Age
        const age = profile.ageRange || '20-29';
        await this.selectAgeRange(age);
        await this.clickNext();

        // Step 5: Style preferences
        if (profile.stylePreferences && profile.stylePreferences.length > 0) {
            await this.selectStyles(profile.stylePreferences);
        }
        await this.clickNext();

        // Step 6: Photo - Skip
        await this.skipPhoto();

        // Step 7: Complete
        await this.completeOnboarding();
    }
}

/**
 * Chat Page Object
 */
export class ChatPage {
    readonly page: Page;
    readonly container: Locator;
    readonly input: Locator;
    readonly sendButton: Locator;
    readonly messageList: Locator;
    readonly quickPrompts: Locator;

    constructor(page: Page) {
        this.page = page;
        this.container = page.locator(SELECTORS.chat.container);
        this.input = page.locator(SELECTORS.chat.input).or(page.locator(SELECTORS.chat.inputFallback));
        this.sendButton = page.locator(SELECTORS.chat.sendButton);
        this.messageList = page.locator(SELECTORS.chat.messageList);
        this.quickPrompts = page.locator(SELECTORS.chat.quickPrompt);
    }

    async isVisible(): Promise<boolean> {
        return await this.container.first().isVisible().catch(() => false);
    }

    async sendMessage(message: string): Promise<void> {
        const inputElement = this.input.first();
        await inputElement.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
        await inputElement.fill(message);
        await this.sendButton.first().click();
    }

    async sendMessageWithEnter(message: string): Promise<void> {
        const inputElement = this.input.first();
        await inputElement.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
        await inputElement.fill(message);
        await inputElement.press('Enter');
    }

    async waitForResponse(timeout = TIMEOUTS.medium): Promise<void> {
        // Wait for any loading indicator to disappear
        await this.page.waitForTimeout(1000);
        await this.page.waitForLoadState('networkidle', { timeout });
    }

    async getMessages(): Promise<Locator> {
        return this.page.locator('[data-testid="user-message"], [data-testid="assistant-message"], .message');
    }

    async clickQuickPrompt(index = 0): Promise<void> {
        await this.quickPrompts.nth(index).click();
    }

    async hasQuickPrompts(): Promise<boolean> {
        return await this.quickPrompts.first().isVisible().catch(() => false);
    }

    async isLoading(): Promise<boolean> {
        return await this.page.locator(SELECTORS.chat.loading).isVisible().catch(() => false);
    }
}

/**
 * Outfit Discovery Page Object
 */
export class OutfitDiscoveryPage {
    readonly page: Page;
    readonly grid: Locator;
    readonly cards: Locator;
    readonly carousel: Locator;
    readonly skeleton: Locator;
    readonly emptyState: Locator;

    constructor(page: Page) {
        this.page = page;
        this.grid = page.locator(SELECTORS.outfit.grid);
        this.cards = page.locator(SELECTORS.outfit.card);
        this.carousel = page.locator(SELECTORS.outfit.carousel);
        this.skeleton = page.locator(SELECTORS.outfit.skeleton);
        this.emptyState = page.locator(SELECTORS.outfit.emptyState);
    }

    async isVisible(): Promise<boolean> {
        return await this.grid.isVisible().catch(() => false) ||
               await this.carousel.isVisible().catch(() => false);
    }

    async isLoading(): Promise<boolean> {
        return await this.skeleton.first().isVisible().catch(() => false);
    }

    async isEmpty(): Promise<boolean> {
        return await this.emptyState.isVisible().catch(() => false);
    }

    async getOutfitCount(): Promise<number> {
        return await this.cards.count();
    }

    async selectOutfit(index = 0): Promise<void> {
        await this.cards.nth(index).click();
        await this.page.waitForTimeout(500);
    }

    async waitForOutfitsToLoad(timeout = TIMEOUTS.medium): Promise<void> {
        await this.page.waitForLoadState('networkidle', { timeout });
        // Wait for skeleton to disappear or outfits to appear
        try {
            await this.skeleton.first().waitFor({ state: 'hidden', timeout: 5000 });
        } catch {
            // Skeleton might not be present
        }
    }

    async scrollCarousel(direction: 'next' | 'prev'): Promise<void> {
        const button = direction === 'next'
            ? this.page.locator('button:has(.lucide-chevron-right)')
            : this.page.locator('button:has(.lucide-chevron-left)');

        if (await button.isVisible()) {
            await button.click();
        }
    }
}

/**
 * Outfit Detail Page Object
 */
export class OutfitDetailPage {
    readonly page: Page;
    readonly container: Locator;
    readonly backButton: Locator;
    readonly buyButton: Locator;
    readonly buyAllButton: Locator;
    readonly productList: Locator;
    readonly similarOutfits: Locator;
    readonly title: Locator;
    readonly price: Locator;

    constructor(page: Page) {
        this.page = page;
        this.container = page.locator(SELECTORS.outfit.detail);
        this.backButton = page.locator(SELECTORS.outfit.backButton);
        this.buyButton = page.locator(SELECTORS.outfit.buyButton);
        this.buyAllButton = page.locator(SELECTORS.outfit.buyAllButton);
        this.productList = page.locator(SELECTORS.product.card);
        this.similarOutfits = page.locator(SELECTORS.outfit.similarOutfits);
        this.title = page.locator(SELECTORS.outfit.title);
        this.price = page.locator(SELECTORS.outfit.price);
    }

    async isVisible(): Promise<boolean> {
        return await this.container.isVisible().catch(() => false);
    }

    async goBack(): Promise<void> {
        await this.backButton.first().click();
        await this.page.waitForTimeout(500);
    }

    async getProductCount(): Promise<number> {
        return await this.productList.count();
    }

    async clickProduct(index = 0): Promise<void> {
        await this.productList.nth(index).click();
    }

    async clickBuyAll(): Promise<void> {
        await this.buyAllButton.first().click();
    }

    async getTitle(): Promise<string> {
        return await this.title.first().textContent() || '';
    }

    async getPrice(): Promise<string> {
        return await this.price.first().textContent() || '';
    }

    async hasSimilarOutfits(): Promise<boolean> {
        return await this.similarOutfits.isVisible().catch(() => false);
    }
}

/**
 * Filter Page Object
 */
export class FilterPage {
    readonly page: Page;
    readonly container: Locator;
    readonly categoryAll: Locator;
    readonly categoryWomen: Locator;
    readonly categoryMen: Locator;
    readonly priceSlider: Locator;
    readonly resetButton: Locator;
    readonly filterPills: Locator;

    constructor(page: Page) {
        this.page = page;
        this.container = page.locator(SELECTORS.filter.container);
        this.categoryAll = page.locator(SELECTORS.filter.categoryAll);
        this.categoryWomen = page.locator(SELECTORS.filter.categoryWomen);
        this.categoryMen = page.locator(SELECTORS.filter.categoryMen);
        this.priceSlider = page.locator(SELECTORS.filter.priceSlider);
        this.resetButton = page.locator(SELECTORS.filter.resetButton);
        this.filterPills = page.locator(SELECTORS.filter.filterPill);
    }

    async isVisible(): Promise<boolean> {
        return await this.container.first().isVisible().catch(() => false);
    }

    async selectCategory(category: 'All' | 'Women' | 'Men'): Promise<void> {
        const buttons = {
            All: this.categoryAll,
            Women: this.categoryWomen,
            Men: this.categoryMen,
        };
        await buttons[category].first().click();
        await this.page.waitForTimeout(500);
    }

    async selectOccasion(occasion: string): Promise<void> {
        const checkbox = this.page.locator(`input[type="checkbox"][value="${occasion}"]`);
        if (await checkbox.isVisible()) {
            await checkbox.check();
        } else {
            // Try clicking a button/label
            const label = this.page.locator(`label:has-text("${occasion}"), button:has-text("${occasion}")`);
            await label.click();
        }
        await this.page.waitForTimeout(300);
    }

    async resetFilters(): Promise<void> {
        await this.resetButton.first().click();
        await this.page.waitForTimeout(500);
    }

    async getActiveFilterCount(): Promise<number> {
        return await this.filterPills.count();
    }

    async removeFilterPill(index = 0): Promise<void> {
        const pill = this.filterPills.nth(index);
        const closeButton = pill.locator('button, svg');
        await closeButton.click();
    }
}

/**
 * Mobile Navigation Page Object
 */
export class MobileNavigationPage {
    readonly page: Page;
    readonly bottomNav: Locator;
    readonly tabFilters: Locator;
    readonly tabOutfits: Locator;
    readonly tabChat: Locator;
    readonly header: Locator;
    readonly logo: Locator;
    readonly bellIcon: Locator;

    constructor(page: Page) {
        this.page = page;
        this.bottomNav = page.locator(SELECTORS.layout.bottomNav);
        this.tabFilters = page.locator(SELECTORS.mobile.tabFilters);
        this.tabOutfits = page.locator(SELECTORS.mobile.tabOutfits);
        this.tabChat = page.locator(SELECTORS.mobile.tabChat);
        this.header = page.locator(SELECTORS.layout.header);
        this.logo = page.locator(SELECTORS.mobile.logo);
        this.bellIcon = page.locator(SELECTORS.mobile.bellIcon);
    }

    async isVisible(): Promise<boolean> {
        return await this.bottomNav.isVisible().catch(() => false);
    }

    async switchToFilters(): Promise<void> {
        await this.tabFilters.first().click();
        await this.page.waitForTimeout(500);
    }

    async switchToOutfits(): Promise<void> {
        await this.tabOutfits.first().click();
        await this.page.waitForTimeout(500);
    }

    async switchToChat(): Promise<void> {
        await this.tabChat.first().click();
        await this.page.waitForTimeout(500);
    }

    async isTabActive(tab: 'filters' | 'outfits' | 'chat'): Promise<boolean> {
        const tabs = {
            filters: this.tabFilters,
            outfits: this.tabOutfits,
            chat: this.tabChat,
        };
        const tabElement = tabs[tab].first();
        const classList = await tabElement.getAttribute('class') || '';
        return classList.includes('text-primary') || classList.includes('active');
    }
}

/**
 * Desktop Layout Page Object
 */
export class DesktopLayoutPage {
    readonly page: Page;
    readonly leftPanel: Locator;
    readonly middlePanel: Locator;
    readonly rightPanel: Locator;
    readonly resizeHandle: Locator;

    constructor(page: Page) {
        this.page = page;
        this.leftPanel = page.locator(SELECTORS.layout.leftPanel);
        this.middlePanel = page.locator(SELECTORS.layout.middlePanel);
        this.rightPanel = page.locator(SELECTORS.layout.rightPanel);
        this.resizeHandle = page.locator(SELECTORS.layout.resizeHandle);
    }

    async isVisible(): Promise<boolean> {
        return await this.leftPanel.first().isVisible().catch(() => false) &&
               await this.rightPanel.first().isVisible().catch(() => false);
    }

    async getRightPanelWidth(): Promise<number> {
        const box = await this.rightPanel.first().boundingBox();
        return box?.width || 0;
    }

    async resizeRightPanel(deltaX: number): Promise<void> {
        const handle = this.resizeHandle.first();
        const box = await handle.boundingBox();
        if (box) {
            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.page.mouse.down();
            await this.page.mouse.move(box.x + deltaX, box.y + box.height / 2);
            await this.page.mouse.up();
        }
    }

    async isThreePanelLayout(): Promise<boolean> {
        const leftVisible = await this.leftPanel.first().isVisible().catch(() => false);
        const middleVisible = await this.middlePanel.first().isVisible().catch(() => false);
        const rightVisible = await this.rightPanel.first().isVisible().catch(() => false);
        return leftVisible && middleVisible && rightVisible;
    }
}
