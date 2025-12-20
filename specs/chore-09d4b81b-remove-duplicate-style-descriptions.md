# Chore: Remove Duplicate Style Descriptions in OnboardingStyle Component

## Metadata
adw_id: `09d4b81b`
prompt: `Fix the OnboardingStyle.tsx component to remove duplicate description display. Currently the style cards show old placeholder descriptions inside the card image area while the correct new descriptions from fashion-styles.json appear below. Either: 1) Remove the inline card description and keep only the bottom description, OR 2) Update both to use the same data source from frontend/lib/data/fashion-styles.json. Ensure consistent display matching the design reference.`

## Chore Description
The OnboardingStyle component currently displays duplicate and inconsistent style descriptions. The component has hardcoded `styleOptions` array with old placeholder descriptions (e.g., "Timeless", "Elegant", "Creative") that appear in the card display area, while the `fashion-styles.json` file contains the correct, more detailed descriptions that should be used throughout.

The chore will update the component to import and use style data from `frontend/lib/data/fashion-styles.json` as the single source of truth, removing the hardcoded array and ensuring consistent, accurate style descriptions across the component.

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Main component containing hardcoded styleOptions array (lines 15-86) that needs to be replaced with imported data from fashion-styles.json
- `frontend/lib/data/fashion-styles.json` - Single source of truth containing correct style data with proper descriptions, longDescriptions, and keywords
- `frontend/lib/types/user-profile-types.ts` - StylePreference type definition (already supports longDescription field)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Import Fashion Styles Data
- Add import statement at the top of `OnboardingStyle.tsx` to import the fashion-styles.json data
- Use `import fashionStyles from '@/lib/data/fashion-styles.json'` or similar syntax
- Type the imported data as `StylePreference[]` to ensure type safety

### 2. Remove Hardcoded styleOptions Array
- Delete the hardcoded `styleOptions` constant array (lines 15-86 in OnboardingStyle.tsx)
- Replace references to `styleOptions` with the imported `fashionStyles` data
- Ensure all array operations (map, filter, etc.) continue to work with the imported data

### 3. Update Component to Use Imported Data
- Replace `styleOptions.map()` with `fashionStyles.map()` in the carousel rendering (around line 177)
- Verify the imported data structure matches the StylePreference interface
- Ensure all properties (id, name, description, longDescription, imageUrl) are correctly accessed

### 4. Verify Type Compatibility
- Confirm that the fashion-styles.json structure matches the StylePreference interface
- The JSON includes: id, name, description, longDescription, keywords, imageUrl
- Note: keywords field exists in JSON but not in interface - this is acceptable as TypeScript will ignore extra fields

### 5. Test Data Consistency
- Verify all 10 styles are present in fashion-styles.json:
  - minimal, luxury, eccentric, business, vanilla
  - sporty, edgy, bohemian, classic, mystery
- Confirm image paths match the existing paths in the hardcoded array
- Ensure descriptions are more detailed and accurate than placeholders

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npm run build` - Ensure TypeScript compiles without errors and JSON import works correctly
- `cd frontend && npm run lint` - Check for linting errors or unused variables
- Visual verification in browser at `http://localhost:3000`:
  - Navigate to onboarding step 5 (style selection)
  - Verify all 10 style cards render correctly with images
  - Confirm "Name · Description" format shows correct data (e.g., "Minimal · Timeless")
  - Verify longDescription text below matches fashion-styles.json content
  - Check that no duplicate or inconsistent descriptions appear
  - Test selecting/deselecting styles works correctly
  - Verify selected style thumbnails display properly

## Notes
- The fashion-styles.json file is already correctly structured with all necessary fields
- The component's data structure expectations align with the JSON format
- This change consolidates data management and makes future style updates easier
- After this change, style data can be updated in a single location (fashion-styles.json)
- The `keywords` field in JSON is for future use and won't affect current component functionality
