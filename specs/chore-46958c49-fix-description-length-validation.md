# Chore: Fix try-on-dual description length validation in API route

## Metadata
adw_id: `46958c49`
prompt: `Fix try-on-dual description length validation in API route. Current bug: try-on-dual fails with DESCRIPTION_TOO_LONG error because the validation on line 293 in apps/web/app/api/generate-image/route.ts only allows 3000 characters for 'fitting-model' but not for 'try-on' or 'try-on-dual'.

  Fix: Update line 293 to allow 3000 character limit for try-on and try-on-dual as well:
  Change from:
  const maxDescriptionLength = generationType === 'fitting-model' ? 3000 : 1000;

  To:
  const maxDescriptionLength = (generationType === 'fitting-model' || generationType === 'try-on' || generationType === 'try-on-dual') ? 3000 : 1000;

  This is a one-line fix in apps/web/app/api/generate-image/route.ts line 293.`

## Chore Description
The image generation API currently has a validation bug where the `try-on` and `try-on-dual` generation types fail with a `DESCRIPTION_TOO_LONG` error when descriptions exceed 1000 characters. This is inconsistent with the `fitting-model` generation type, which allows 3000 characters.

The issue is in the description length validation logic at line 293 of `apps/web/app/api/generate-image/route.ts`. The validation only checks if `generationType === 'fitting-model'` to allow 3000 characters, but `try-on` and `try-on-dual` generation types also require longer descriptions since they involve complex outfit descriptions with reference images.

This is a simple one-line fix to extend the 3000 character limit to all three generation types: `fitting-model`, `try-on`, and `try-on-dual`.

## Relevant Files
Use these files to complete the chore:

- **apps/web/app/api/generate-image/route.ts:293** - Contains the description length validation logic that needs to be updated. This is the only file requiring changes.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update description length validation logic
- Open `apps/web/app/api/generate-image/route.ts`
- Locate line 293 which contains: `const maxDescriptionLength = generationType === 'fitting-model' ? 3000 : 1000;`
- Replace the line with: `const maxDescriptionLength = (generationType === 'fitting-model' || generationType === 'try-on' || generationType === 'try-on-dual') ? 3000 : 1000;`
- Save the file

### 2. Validate the fix
- Run TypeScript compilation to ensure no syntax errors
- Run the linter to ensure code quality standards are met
- Optionally, run the application in development mode to verify the API endpoint works correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm run build` - Build the Next.js application to verify TypeScript compilation
- `cd apps/web && pnpm run lint` - Ensure code quality standards are met

## Notes
- This fix ensures consistency across all three generation types that use reference images and require detailed outfit descriptions
- The 3000 character limit is appropriate for `try-on` and `try-on-dual` because these generation types combine outfit descriptions with reference image processing
- No tests need to be updated as this is a simple validation logic change
