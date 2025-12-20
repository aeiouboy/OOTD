import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for OOTDay Fashion Assistant
 * Comprehensive testing across desktop, tablet, and mobile viewports
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : 2,
    reporter: [
        ['html', { open: 'on-failure' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }]
    ],
    timeout: 60000,
    expect: {
        timeout: 10000,
    },

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 15000,
        navigationTimeout: 30000,
    },

    projects: [
        // Desktop Chrome
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
            },
        },
        // Desktop Firefox
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1920, height: 1080 },
            },
        },
        // Desktop Safari
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1920, height: 1080 },
            },
        },
        // Mobile Chrome (Android)
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5'],
            },
        },
        // Mobile Safari (iPhone)
        {
            name: 'mobile-safari',
            use: {
                ...devices['iPhone 13'],
            },
        },
        // Tablet
        {
            name: 'tablet',
            use: {
                ...devices['iPad Pro 11'],
            },
        },
    ],

    // webServer disabled - assumes dev server is already running
    // webServer: {
    //     command: 'pnpm dev',
    //     url: 'http://localhost:3000',
    //     reuseExistingServer: true,
    //     timeout: 120000,
    // },
});
