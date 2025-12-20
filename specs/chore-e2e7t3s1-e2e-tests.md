# Chore: Comprehensive E2E Tests for OOTDay Frontend

## Metadata
adw_id: `e2e7t3s1`
prompt: `Implement comprehensive E2E tests for the OOTDay fashion assistant frontend application using Playwright. Create organized test files in frontend/tests/e2e/ directory covering: 1) Onboarding flow tests (complete flow, skip photo, form validation, localStorage persistence) in onboarding.spec.ts 2) Desktop layout tests (3-panel architecture with NavigationFilters, OutfitDiscovery, ResizablePanel) in desktop-layout.spec.ts 3) Mobile layout tests (bottom tab navigation with filters/outfits/chat tabs, header) in mobile-layout.spec.ts 4) Chat interface tests (send messages, AI responses, outfit recommendations, quick prompts, loading states) in chat.spec.ts 5) Outfit discovery tests (load/display outfits, selection, carousel, empty/loading states) in outfit-discovery.spec.ts 6) Product details tests (outfit details, product cards, buy button, similar outfits) in product-details.spec.ts 7) Filtering tests (category, occasion, price range, presets, reset, filter pills) in filtering.spec.ts 8) Image generation tests (trigger via chat, loading state, display image, error handling) in image-generation.spec.ts 9) API integration tests (mock /api/chat, /api/products, /api/generate-image) in api-integration.spec.ts 10) Responsive design tests across desktop, tablet, mobile viewports. Create shared fixtures in frontend/tests/fixtures/ and utilities in frontend/tests/utils/. Update playwright.config.ts to use tests/e2e directory and add pnpm scripts for e2e:test, e2e:ui, e2e:debug. Components are in frontend/components/ with onboarding/, chat/, outfit/, navigation/, layout/ subdirectories. Main page is frontend/app/page.tsx with HomePage component.`

## Chore Description
Implement comprehensive End-to-End (E2E) tests for the OOTDay fashion assistant frontend application. This involves creating a well-organized test suite using Playwright that covers all major user flows and features:

1. **Onboarding Flow** - Testing the 7-step onboarding process including welcome, name entry, department selection, age range, style preferences, photo upload (with skip option), and completion
2. **Desktop Layout** - Testing the 3-panel architecture with NavigationFilters (left), OutfitDiscovery (middle), and ResizablePanel with Chat/Details (right)
3. **Mobile Layout** - Testing bottom tab navigation (filters, outfits, chat), header with logo and notification bell
4. **Chat Interface** - Testing message sending, AI responses, outfit recommendations display, quick prompts, and loading states
5. **Outfit Discovery** - Testing outfit grid/carousel, selection, empty states, and loading skeletons
6. **Product Details** - Testing outfit details view, product cards, buy buttons, and similar outfits section
7. **Filtering** - Testing category, occasion, price range filters, quick presets, and reset functionality
8. **Image Generation** - Testing chat-triggered image generation, loading states, and error handling
9. **API Integration** - Mock testing for /api/chat, /api/products, and /api/generate-image endpoints
10. **Responsive Design** - Testing across desktop (1920x1080), tablet (iPad), and mobile (iPhone) viewports

## Relevant Files
Use these files to complete the chore:

### Existing Configuration Files
- `frontend/playwright.config.ts` - Existing Playwright configuration to update with tests/e2e directory
- `frontend/package.json` - Add pnpm scripts for e2e:test, e2e:ui, e2e:debug
- `frontend/tests/e2e-image-generation.spec.ts` - Existing test file to move to new structure

### Target Component Files (to understand test targets)
- `frontend/app/page.tsx` - Main HomePage component with desktop/mobile layouts
- `frontend/components/onboarding/OnboardingFlow.tsx` - 7-step onboarding orchestration
- `frontend/components/onboarding/OnboardingWelcome.tsx` - Welcome step with "Let's Go" button
- `frontend/components/onboarding/OnboardingName.tsx` - Name input step
- `frontend/components/onboarding/OnboardingDepartment.tsx` - Department/gender selection
- `frontend/components/onboarding/OnboardingAge.tsx` - Age range selection
- `frontend/components/onboarding/OnboardingStyle.tsx` - Style preference selection
- `frontend/components/onboarding/OnboardingPhoto.tsx` - Photo upload with "Mystery" skip option
- `frontend/components/onboarding/OnboardingComplete.tsx` - Completion confirmation
- `frontend/components/chat/ChatInterface.tsx` - Main chat interface with messages and input
- `frontend/components/chat/ChatAssistant.tsx` - Chat assistant wrapper component
- `frontend/components/chat/QuickPrompts.tsx` - Quick prompt suggestions
- `frontend/components/outfit/OutfitDiscovery.tsx` - Carousel-based outfit selection
- `frontend/components/outfit/OutfitDetail.tsx` - Outfit details view
- `frontend/components/outfit/OutfitProductList.tsx` - Product list in outfit details
- `frontend/components/outfit/SimilarOutfits.tsx` - Similar outfits section
- `frontend/components/outfit/EmptyOutfitState.tsx` - Empty state component
- `frontend/components/outfit/OutfitCardSkeleton.tsx` - Loading skeleton
- `frontend/components/navigation/NavigationFilters.tsx` - Filter panel with all filters
- `frontend/components/navigation/CategoryFilter.tsx` - Gender category filter
- `frontend/components/navigation/OccasionFilter.tsx` - Occasion filter
- `frontend/components/navigation/PriceRangeSlider.tsx` - Price range slider
- `frontend/components/navigation/QuickPresets.tsx` - Quick filter presets
- `frontend/components/layout/ResizablePanel.tsx` - Resizable right panel
- `frontend/components/layout/Header.tsx` - Mobile header
- `frontend/components/layout/BottomNavigation.tsx` - Mobile bottom navigation

### API Routes (for mocking)
- `frontend/app/api/chat/route.ts` - Chat API endpoint
- `frontend/app/api/products/route.ts` - Products API endpoint
- `frontend/app/api/generate-image/route.ts` - Image generation API endpoint

### Type Definitions
- `frontend/lib/types.ts` - Main type exports (Outfit, Product, ChatMessage, FilterState)
- `frontend/lib/types/user-profile-types.ts` - UserProfile, AgeRange, StylePreference types
- `frontend/lib/hooks/useUserProfile.ts` - Profile hook with localStorage key 'ootday_user_profile'

### New Files
- `frontend/tests/e2e/onboarding.spec.ts` - Onboarding flow tests
- `frontend/tests/e2e/desktop-layout.spec.ts` - Desktop 3-panel layout tests
- `frontend/tests/e2e/mobile-layout.spec.ts` - Mobile layout tests
- `frontend/tests/e2e/chat.spec.ts` - Chat interface tests
- `frontend/tests/e2e/outfit-discovery.spec.ts` - Outfit discovery tests
- `frontend/tests/e2e/product-details.spec.ts` - Product details tests
- `frontend/tests/e2e/filtering.spec.ts` - Filtering tests
- `frontend/tests/e2e/image-generation.spec.ts` - Image generation tests
- `frontend/tests/e2e/api-integration.spec.ts` - API integration tests
- `frontend/tests/e2e/responsive.spec.ts` - Responsive design tests
- `frontend/tests/fixtures/test-data.ts` - Test data fixtures
- `frontend/tests/fixtures/user-profiles.ts` - User profile test fixtures
- `frontend/tests/fixtures/mock-responses.ts` - Mock API responses
- `frontend/tests/utils/test-helpers.ts` - Shared test helper functions
- `frontend/tests/utils/page-objects.ts` - Page object models

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Playwright Configuration
- Modify `frontend/playwright.config.ts` to set `testDir: './tests/e2e'`
- Add global setup file reference for localStorage mocking
- Keep existing browser projects (chromium, firefox, webkit, mobile-chrome, mobile-safari, tablet)
- Update reporter configuration to include HTML reporter that opens on failure
- Add screenshot configuration for capturing on test failure

### 2. Add pnpm Scripts to package.json
- Add `"e2e:test": "playwright test"` - Run all E2E tests
- Add `"e2e:ui": "playwright test --ui"` - Open Playwright UI mode
- Add `"e2e:debug": "playwright test --debug"` - Run with debug mode
- Add `"e2e:report": "playwright show-report"` - Show HTML test report
- Add `"e2e:headed": "playwright test --headed"` - Run tests in headed mode

### 3. Create Test Fixtures Directory and Files
- Create `frontend/tests/fixtures/` directory
- Create `test-data.ts` with mock outfit data, product data, and chat messages
- Create `user-profiles.ts` with test user profiles (complete, partial, empty)
- Create `mock-responses.ts` with mock API responses for chat, products, and image generation

### 4. Create Test Utilities Directory and Files
- Create `frontend/tests/utils/` directory
- Create `test-helpers.ts` with:
  - `skipOnboarding(page)` - Set localStorage to skip onboarding
  - `clearUserProfile(page)` - Clear localStorage user profile
  - `setUserProfile(page, profile)` - Set specific user profile
  - `waitForAppLoad(page)` - Wait for app to fully load
  - `mockChatAPI(page, response)` - Mock chat API responses
  - `mockProductsAPI(page, response)` - Mock products API responses
  - `mockImageGenerationAPI(page, response)` - Mock image generation API
- Create `page-objects.ts` with page object classes for:
  - `OnboardingPage` - Methods for navigating onboarding steps
  - `ChatPage` - Methods for interacting with chat
  - `OutfitDiscoveryPage` - Methods for outfit grid/carousel
  - `FilterPage` - Methods for filter interactions

### 5. Create Onboarding Tests (onboarding.spec.ts)
- Test complete onboarding flow from welcome to completion
- Test name input validation (required field)
- Test skipping photo upload using "Mystery" button
- Test photo upload with file selection
- Test back navigation between steps
- Test localStorage persistence after completion
- Test redirecting completed users directly to main app
- Verify `ootday_user_profile` localStorage key is set correctly

### 6. Create Desktop Layout Tests (desktop-layout.spec.ts)
- Test 3-panel layout visibility at desktop viewport (1920x1080)
- Test left panel (NavigationFilters) displays correctly
- Test middle panel (OutfitDiscovery) displays outfit cards
- Test right panel (ResizablePanel) with ChatAssistant
- Test panel resizing functionality via drag handle
- Test keyboard shortcuts for panel resizing (Cmd/Ctrl + [ and ])
- Test ESC key closes outfit details
- Test switching between chat view and outfit detail view in right panel

### 7. Create Mobile Layout Tests (mobile-layout.spec.ts)
- Test mobile layout visibility at mobile viewport (iPhone)
- Test header displays logo (OOTDay with Sparkles icon) and notification bell
- Test bottom navigation displays three tabs (filters, outfits, chat)
- Test tab switching changes active content
- Test tab active state styling (text-primary vs text-gray-600)
- Test desktop layout is hidden on mobile (lg:hidden class)
- Test mobile layout is hidden on desktop (lg:flex class)

### 8. Create Chat Interface Tests (chat.spec.ts)
- Test welcome message displays on empty chat
- Test quick action pills display when no messages
- Test conversation starters display
- Test typing in chat input
- Test sending message via Enter key
- Test sending message via Send button
- Test typing indicator displays while waiting for response
- Test AI response message displays
- Test outfit recommendation cards display in response
- Test "View Details" button on outfit cards
- Test quick actions display after first message
- Test message timestamps format correctly

### 9. Create Outfit Discovery Tests (outfit-discovery.spec.ts)
- Test outfit grid displays outfits
- Test loading skeleton displays during load
- Test empty state displays when no outfits match filters
- Test "Clear all filters" button in empty state
- Test outfit card click triggers selection
- Test selected outfit thumbnail displays in selection row
- Test carousel horizontal scrolling
- Test outfit card shows title, price, and image
- Test multi-select mode allows multiple selections

### 10. Create Product Details Tests (product-details.spec.ts)
- Test outfit detail view displays after selecting outfit
- Test "Explore more outfits" back button returns to chat/discovery
- Test outfit title and description display
- Test outfit preview image displays
- Test product list shows all items with name, brand, price
- Test "Buy Now" button on product cards
- Test buy button opens external URL in new tab
- Test similar outfits section displays
- Test selecting similar outfit updates detail view
- Test sticky purchase section shows total price
- Test "Shop the Look" button in sticky section

### 11. Create Filtering Tests (filtering.spec.ts)
- Test category filter (All/Women/Men) changes selection
- Test occasion filter checkbox selection
- Test price range slider min/max values
- Test price range slider drag functionality
- Test quick preset buttons apply filters
- Test "Clear all filters" resets all filters
- Test filter pills display selected filters
- Test removing filter pill updates filter state
- Test filters persist when switching tabs (mobile)
- Test filtered results update outfit discovery

### 12. Create Image Generation Tests (image-generation.spec.ts)
- Move content from existing `e2e-image-generation.spec.ts`
- Test image generation trigger via chat request
- Test loading state during image generation
- Test generated image displays in chat
- Test image error handling displays error message
- Test rate limiting error handling (429 response)
- Test retry functionality after error
- Mock image generation API for consistent testing

### 13. Create API Integration Tests (api-integration.spec.ts)
- Test /api/chat endpoint with message payload
- Test /api/chat response contains message and outfits
- Test /api/products endpoint returns product list
- Test /api/products response structure validation
- Test /api/generate-image endpoint with description
- Test API error handling (500 responses)
- Test API timeout handling
- Test request/response headers

### 14. Create Responsive Design Tests (responsive.spec.ts)
- Test desktop viewport (1920x1080) shows 3-panel layout
- Test tablet viewport (iPad Pro 11) responsive behavior
- Test mobile viewport (iPhone 13) shows mobile layout
- Test layout transitions between breakpoints
- Test font sizes scale appropriately
- Test touch targets are appropriately sized on mobile
- Test no horizontal scroll at any viewport

### 15. Migrate Existing Test File
- Move `frontend/tests/e2e-image-generation.spec.ts` content to `frontend/tests/e2e/image-generation.spec.ts`
- Update imports to use new fixture and utility paths
- Remove old test file after migration

### 16. Validate All Tests Pass
- Run `pnpm e2e:test` to execute all tests
- Run tests on chromium project first
- Fix any failing tests
- Run full test suite across all browsers
- Generate and review HTML report

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && ls -la tests/e2e/` - Verify all spec files created
- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && ls -la tests/fixtures/` - Verify fixtures directory created
- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && ls -la tests/utils/` - Verify utils directory created
- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && cat package.json | grep -A5 '"scripts"'` - Verify e2e scripts added
- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && cat playwright.config.ts | head -20` - Verify config updated
- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && pnpm e2e:test --project=chromium --reporter=list` - Run tests on Chrome only
- `cd /Users/tachongrak/Projects/OOTDay_Anti/frontend && pnpm e2e:test` - Run full test suite

## Notes

### LocalStorage Key
The user profile is stored in localStorage with key `ootday_user_profile`. Tests should use this key when mocking/checking profile state.

### UserProfile Structure
```typescript
interface UserProfile {
  userName: string;
  gender: 'women';  // Currently fixed to women-only
  ageRange: '<20' | '20-29' | '30-39' | '40+';
  stylePreferences: StylePreference[];
  userPhoto?: string;  // Base64 or undefined for mystery
  onboardingCompleted: boolean;
  createdAt: string;
}
```

### Viewport Breakpoints
- Desktop: >= 1024px (lg breakpoint) - Shows 3-panel layout
- Mobile: < 1024px - Shows mobile layout with bottom tabs

### Test Mode Environment Variable
The app has a test mode feature controlled by `NEXT_PUBLIC_ENABLE_TEST_MODE=true`. This is separate from E2E tests but may affect UI if enabled.

### API Mocking Strategy
Use Playwright's `page.route()` to intercept and mock API calls. This allows testing without actual backend dependencies and ensures consistent test results.

### Important Selectors
- Onboarding container: `.onboarding-container`
- Chat input: `input[placeholder="Ask me what to wear..."]`
- Send button: `button` with Send icon (last button in input area)
- Bottom nav tabs: Button elements with tab ids ("filters", "outfits", "chat")
- Filter panel: `aside[aria-label="Navigation and Filters"]`
- Resizable panel: `div[aria-label="Chat and outfit details"]`
- Resize handle: `div[role="separator"][aria-orientation="vertical"]`
