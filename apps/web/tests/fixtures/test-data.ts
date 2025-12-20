/**
 * Test Data Fixtures for OOTDay E2E Tests
 */

export const VIEWPORTS = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 820, height: 1180 },
    mobile: { width: 390, height: 844 },
};

export const TIMEOUTS = {
    short: 3000,
    medium: 10000,
    long: 30000,
    imageGeneration: 70000,
    appLoad: 5000,
};

export const SELECTORS = {
    // Onboarding
    onboarding: {
        container: '[data-testid="onboarding-flow"], .onboarding-container',
        welcomeStep: '[data-testid="onboarding-welcome"]',
        nameInput: 'input[placeholder*="ชื่อ"], input[name="name"], input[type="text"]',
        nextButton: 'button:has-text("ต่อไป"), button:has-text("Next"), button:has-text("เริ่มเลย"), button:has-text("Let\'s Go")',
        skipButton: 'button:has-text("ข้าม"), button:has-text("Skip"), button:has-text("Mystery")',
        completeButton: 'button:has-text("เริ่มใช้งาน"), button:has-text("Start"), button:has-text("Complete")',
        ageOption: '[data-testid="age-option"], button[data-age]',
        departmentOption: '[data-testid="department-option"], button[data-department]',
        styleOption: '[data-testid="style-option"], button[data-style]',
    },
    // Chat
    chat: {
        container: '[data-testid="chat-container"], [data-testid="chat-assistant"]',
        input: 'input[placeholder*="OOTDay"], input[placeholder*="พิมพ์"], input[placeholder*="Ask me"]',
        inputFallback: 'input[type="text"]:visible',
        sendButton: 'button:has(svg.lucide-send), button[aria-label*="send"], button[aria-label*="ส่ง"]',
        messageList: '[data-testid="message-list"], .message-list',
        userMessage: '[data-testid="user-message"], .user-message',
        assistantMessage: '[data-testid="assistant-message"], .assistant-message',
        quickPrompt: '[data-testid="quick-prompt"], .quick-prompt',
        loading: '[data-testid="chat-loading"], .chat-loading',
        typingIndicator: '[data-testid="typing-indicator"], .typing-indicator',
    },
    // Layout
    layout: {
        header: 'header',
        navigation: 'nav',
        mainContent: 'main',
        leftPanel: 'aside[aria-label*="Navigation"], [data-testid="left-panel"]',
        middlePanel: '[data-testid="middle-panel"], main[aria-label*="Outfit"]',
        rightPanel: '[data-testid="right-panel"], div[aria-label*="Chat and outfit"]',
        resizeHandle: 'div[role="separator"][aria-orientation="vertical"], [data-testid="resize-handle"]',
        bottomNav: 'nav:has(button)',
    },
    // Outfits
    outfit: {
        grid: '[data-testid="outfit-grid"], .outfit-grid',
        card: '[data-testid="outfit-card"], .outfit-card',
        carousel: '[data-testid="outfit-carousel"], .embla',
        detail: '[data-testid="outfit-detail"], .outfit-detail',
        title: '[data-testid="outfit-title"], .outfit-title',
        price: '[data-testid="outfit-price"], .outfit-price',
        buyButton: 'button:has-text("Buy"), button:has-text("ซื้อ")',
        buyAllButton: 'button:has-text("Shop the Look"), button:has-text("ซื้อทั้งชุด")',
        backButton: 'button:has-text("Explore"), button:has-text("กลับ"), button:has(svg.lucide-arrow-left)',
        skeleton: '[data-testid="outfit-skeleton"], .skeleton',
        emptyState: '[data-testid="empty-state"], .empty-state',
        similarOutfits: '[data-testid="similar-outfits"], .similar-outfits',
    },
    // Products
    product: {
        card: '[data-testid="product-card"], .product-card',
        modal: '[data-testid="product-modal"], [role="dialog"]',
        image: '[data-testid="product-image"], .product-image',
        name: '[data-testid="product-name"], .product-name',
        price: '[data-testid="product-price"], .product-price',
        brand: '[data-testid="product-brand"], .product-brand',
        sizeSelector: '[data-testid="size-selector"], select[name="size"]',
        quantitySelector: '[data-testid="quantity-selector"]',
        addToCart: 'button:has-text("Add"), button:has-text("เพิ่ม")',
        likeButton: 'button:has(svg.lucide-heart)',
    },
    // Filters
    filter: {
        container: '[data-testid="filter-container"], aside',
        categoryAll: 'button:has-text("All"), button:has-text("ทั้งหมด")',
        categoryWomen: 'button:has-text("Women"), button:has-text("ผู้หญิง")',
        categoryMen: 'button:has-text("Men"), button:has-text("ผู้ชาย")',
        occasionCheckbox: 'input[type="checkbox"][name*="occasion"], [data-testid="occasion-filter"] input',
        priceSlider: '[data-testid="price-slider"], input[type="range"]',
        quickPreset: '[data-testid="quick-preset"], .quick-preset',
        resetButton: 'button:has-text("Clear"), button:has-text("ล้าง"), button:has-text("Reset")',
        filterPill: '[data-testid="filter-pill"], .filter-pill',
    },
    // Image Generation
    imageGeneration: {
        generatedImage: 'img[src^="data:image"], img[alt*="outfit"], img[alt*="Outfit"], img[alt*="generated"]',
        loadingIndicator: '[data-testid="image-loading"], .image-loading',
        errorMessage: 'text=/error|failed|unable|ไม่สามารถ/i',
    },
    // Mobile specific
    mobile: {
        tabFilters: 'button:has-text("กรอง"), button:has(svg.lucide-sliders-horizontal)',
        tabOutfits: 'button:has-text("ชุด"), button:has(svg.lucide-grid-3x3)',
        tabChat: 'button:has-text("แชท"), button:has(svg.lucide-message-circle)',
        bellIcon: 'button:has(svg.lucide-bell)',
        logo: 'h1:has-text("OOTDay"), .logo',
    },
};

export const CHAT_MESSAGES = {
    greeting: 'สวัสดีค่ะ',
    outfitRequest: 'แนะนำชุดสำหรับไปทำงานหน่อยค่ะ',
    casualRequest: 'อยากได้ชุดลำลองสบายๆ',
    imageRequest: 'Show me a white t-shirt with blue jeans in a flat lay style',
    priceFilter: 'ชุดราคาไม่เกิน 2000 บาท',
    occasionRequest: 'ชุดไปปาร์ตี้',
    englishGreeting: 'Hello',
    englishOutfitRequest: 'Recommend an outfit for work',
};

export const FILTER_OPTIONS = {
    categories: ['All', 'Women', 'Men'],
    occasions: ['Work', 'Casual', 'Party', 'Date', 'Travel'],
    priceRanges: {
        low: { min: 0, max: 1000 },
        medium: { min: 1000, max: 3000 },
        high: { min: 3000, max: 10000 },
    },
};

export const LOCAL_STORAGE_KEYS = {
    userProfile: 'ootday_user_profile',
    legacyUserProfile: 'userProfile',
};

export const API_ENDPOINTS = {
    chat: '/api/chat',
    products: '/api/products',
    generateImage: '/api/generate-image',
};
