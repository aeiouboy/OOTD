# Chore: Fix OnboardingStyle.tsx Description Display

## Metadata
adw_id: `d7b3450a`
prompt: `Fix OnboardingStyle.tsx - the WRONG description was removed. Current state shows gray placeholder text INSIDE the card (like 'Less is more, clean, simple, neutral palette...') but the longDescription from fashion-styles.json that should appear BELOW the red title was removed. REVERSE this: 1) REMOVE the gray description text that appears INSIDE the card between the image and card border (this is the old styleOptions description field), 2) ADD BACK the longDescription paragraph that should appear BELOW the red style title heading. The card structure should be: [Image] -> [Style Title in red like 'Minimal · Timeless'] -> [longDescription paragraph from fashion-styles.json like 'Clean lines, neutral palettes, and quality basics...']. Check the fashion-styles.json file for the correct longDescription values.`

## Chore Description
The OnboardingStyle.tsx component currently displays the wrong text structure in the style cards. The issue is:

**Current State (Incorrect):**
- Style title shows: `{style.name} · {style.description}` (e.g., "Minimal · Timeless")
- The `description` field from fashion-styles.json is the short descriptor (like "Timeless", "Elegant", "Creative")
- The `longDescription` field is NOT being displayed anywhere

**Required State (Correct):**
- Style title should show: `{style.name} · {style.description}` (keep this - e.g., "Minimal · Timeless")
- ADD a new paragraph BELOW the red title showing the `longDescription` (e.g., "Clean lines, neutral palettes, and quality basics...")

The card structure should be:
1. Image (existing)
2. Style Title in red (existing - "Minimal · Timeless")
3. **NEW: longDescription paragraph** (to be added - "Clean lines, neutral palettes, and quality basics...")
4. Selected badge (existing, when selected)

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Main component to modify. Lines 145-147 show the current style title. Need to add longDescription paragraph after this.
- `frontend/lib/data/fashion-styles.json` - Reference file containing the `longDescription` values for each style
- `frontend/lib/types/user-profile-types.ts` - Type definition confirming `longDescription?: string` exists in `StylePreference` interface (line 13)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add longDescription Paragraph Below Style Title
- In `frontend/components/onboarding/OnboardingStyle.tsx`
- Locate the Style Name section (lines 144-147):
  ```tsx
  {/* Style Name */}
  <h3 className="text-xl font-bold text-[var(--onboarding-primary)]">
    {style.name} · {style.description}
  </h3>
  ```
- Add a new paragraph element AFTER the `</h3>` tag to display the `longDescription`
- The new paragraph should:
  - Display `style.longDescription` text
  - Use gray text color (e.g., `text-gray-600` or `text-gray-500`)
  - Use smaller font size (e.g., `text-sm`)
  - Have appropriate top margin (e.g., `mt-2`)
  - Be centered text (e.g., `text-center`)
  - Handle undefined gracefully (conditional render or empty string fallback)

### 2. Verify Card Structure
- Confirm the final card structure is:
  1. Image container (lines 128-142)
  2. Style title h3 (lines 144-147)
  3. **NEW: longDescription paragraph**
  4. Selected badge (lines 149-154)

### 3. Validate the Implementation
- Run the development server
- Navigate to the onboarding style selection step
- Verify each style card shows:
  - The image at top
  - The red title (e.g., "Minimal · Timeless")
  - The longDescription text below the title (e.g., "Clean lines, neutral palettes...")
  - The "Selected" badge when clicked

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm lint` - Ensure no linting errors
- `cd frontend && pnpm build` - Ensure the build succeeds without TypeScript errors
- `cd frontend && pnpm dev` - Start dev server and manually verify the UI shows longDescription below each style title

## Notes
- The `longDescription` field already exists in `fashion-styles.json` and is typed as optional in `StylePreference` interface
- All 10 styles in `fashion-styles.json` have `longDescription` values populated
- The styling should maintain visual hierarchy: bold red title, then smaller gray description text
- Consider line clamping if descriptions are too long (optional enhancement)
