# Chore: Fix All Frontend Test Failures

## Metadata
adw_id: `fd2f91e9`
prompt: `Fix all test failures in frontend. Replace @jest/globals with vitest, exclude e2e tests, fix test expectations.`

## Chore Description
Fix all failing tests in the frontend application. The test suite is currently failing with multiple issues including:
- Some test files may still import from `@jest/globals` instead of `vitest`
- E2E tests (Playwright) being picked up by vitest (though config appears correct)
- Test expectations may be stale or incorrect for actual implementation
- Missing vitest globals in some test files

After investigation, many files already have correct imports. The main issues appear to be:
1. Test expectations don't match current implementation behavior
2. Potential caching issues with test runs
3. Need to validate current test state

## Relevant Files
Use these files to complete the chore:

**Configuration:**
- `frontend/vitest.config.ts` - Vitest configuration (already has `globals: true` and excludes `tests/e2e/**`)
- `frontend/vitest.setup.ts` - Vitest setup file

**Test Files to Verify/Fix:**
- `frontend/lib/utils/__tests__/product-utils.test.ts` - Missing vitest import, test expectations may not match implementation
- `frontend/lib/utils/product-utils.ts` - Source for getGenderSpecificUrl (verify logic)
- `frontend/components/ui/__tests__/input.test.tsx` - Already uses vitest, verify focus styles test
- `frontend/lib/utils/__tests__/session-context.test.ts` - Already uses vitest, verify all imports exist
- `frontend/lib/utils/product-filters.test.ts` - Already uses vitest, verify filterByPriceRange export

**Already Verified (have correct vitest imports):**
- `frontend/lib/categorization/occasion-mapper.test.ts` ✅
- `frontend/lib/validation/product-validator.test.ts` ✅
- `frontend/lib/transformers/central-to-product.test.ts` ✅
- `frontend/lib/__tests__/test-mode-integration.test.ts` ✅
- `frontend/lib/__tests__/outfit-generator.test.ts` ✅

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Clear Test Cache and Verify Configuration
- Delete any vitest cache: `rm -rf frontend/node_modules/.vitest`
- Verify `frontend/vitest.config.ts` has correct settings:
  - `globals: true` for describe/it/expect without imports
  - `exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**']` for E2E

### 2. Fix product-utils.test.ts
- Add explicit vitest import for safety: `import { describe, it, expect } from 'vitest'`
- Review `getGenderSpecificUrl` test expectations:
  - Test: "should return fallback URL for products without category" expects `'https://www.central.co.th'`
  - Test: "should correctly identify women category" expects women URL
- If tests fail, update either tests OR implementation based on desired behavior

### 3. Verify product-utils.ts Implementation
- Check `getGenderSpecificUrl` function logic:
  - Line 18-20: Women check should come BEFORE men check (since "women" contains "men")
  - Line 23-25: Men check
  - Line 28-30: onlineUrl fallback
  - Line 33: Base URL fallback
- Ensure the order of checks is correct to prevent "women" matching "men" pattern

### 4. Fix Any Remaining Test Import Issues
- Scan all test files for `@jest/globals` imports and replace with `vitest`
- Scan for `jest.spyOn` and replace with `vi.spyOn` (import `vi` from vitest)
- Add explicit imports where globals might not work

### 5. Verify Input Component Test
- Check `components/ui/__tests__/input.test.tsx` line 36
- Ensure test expects `focus-visible:ring-primary` (not `focus-visible:ring-primary-500`)
- The test already appears correct, verify it passes

### 6. Verify Session Context Test
- Check that all functions imported in `session-context.test.ts` are exported from `session-context.ts`
- Current imports match exports (verified)
- Ensure no reference to non-existent `getTestModeMessages`

### 7. Run Tests and Fix Any Remaining Issues
- Run `pnpm test` in frontend directory
- Address any remaining failures one by one
- For each failure, determine if test expectation or implementation needs updating

### 8. Validate All Tests Pass
- Run full test suite: `pnpm test`
- Ensure all 27 test files pass
- Run with verbose output if needed: `pnpm test -- --reporter=verbose`

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm test` - Run all tests (should pass with 0 failures)
- `cd frontend && pnpm test -- --reporter=verbose` - Run tests with detailed output
- `cd frontend && pnpm test -- --run` - Run tests once without watch mode

## Notes
- The vitest config already has `globals: true` which means `describe`, `it`, `expect` should work without imports
- However, adding explicit imports provides better IDE support and prevents confusion
- E2E tests are already excluded in vitest.config.ts with `exclude: ['tests/e2e/**']`
- Some failures may be from stale test cache - clearing cache is important first step
