# Chore: Update OnboardingWelcome Page with Actual Logo Image

## Metadata
adw_id: `65a692d8`
prompt: `Update OnboardingWelcome page to use the actual logo image. Copy data/assets/onboarding/logo.png to apps/web/public/images/onboarding/logo.png. In apps/web/components/onboarding/OnboardingWelcome.tsx: 1) Import next/image, 2) Replace the illustration placeholder div (lines 17-20) with an Image component using src='/images/onboarding/logo.png' with appropriate width/height maintaining aspect ratio, 3) Remove the sparkle icon div (lines 12-15) since the logo already has OOTDay branding, 4) Optionally simplify the welcome text since the logo shows 'OOTDay' already.`

## Chore Description
This chore updates the OnboardingWelcome component to use the actual OOTDay logo image instead of placeholder elements. The current implementation has a sparkle icon placeholder and a gradient placeholder for illustration. We will:
1. Copy the logo image from data assets to the public directory
2. Replace the placeholder illustration with the actual logo using Next.js Image component
3. Remove the redundant sparkle icon since the logo already contains OOTDay branding
4. Simplify the welcome text to avoid redundancy with the logo

## Relevant Files
Use these files to complete the chore:

- `data/assets/onboarding/logo.png` - Source logo file to be copied (39KB PNG file)
- `apps/web/components/onboarding/OnboardingWelcome.tsx` - Component to be updated with logo image and text changes
- `apps/web/public/images/` - Target directory structure (currently has `styles/` subdirectory)

### New Files
- `apps/web/public/images/onboarding/logo.png` - Destination for the copied logo file

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Public Images Directory Structure
- Create the `onboarding` subdirectory in `apps/web/public/images/`
- Ensure proper directory permissions

### 2. Copy Logo Asset to Public Directory
- Copy `data/assets/onboarding/logo.png` to `apps/web/public/images/onboarding/logo.png`
- Verify the file was copied successfully

### 3. Update OnboardingWelcome Component Imports
- Add `import Image from 'next/image';` at the top of the file
- Keep existing imports (Button, Sparkles - though Sparkles will be removed later)

### 4. Remove Sparkle Icon Placeholder
- Remove the sparkle icon div (lines 12-15)
- This includes the entire `<div className="flex items-center justify-center w-16 h-16 bg-[var(--onboarding-primary)] rounded-full">` block and its Sparkles icon child

### 5. Replace Illustration Placeholder with Logo Image
- Replace the gradient placeholder div (lines 17-20) with Next.js Image component
- Use `src="/images/onboarding/logo.png"`
- Set appropriate width and height properties (estimate based on 39KB file size, likely around 400-600px width)
- Add `alt="OOTDay Logo"` for accessibility
- Use `priority` prop since this is above the fold on onboarding
- Maintain rounded styling with `className="rounded-2xl"`

### 6. Simplify Welcome Text
- Update the heading to remove redundant "Welcome to OOTDay" since logo shows branding
- Consider simplifying to just "Hi FRIEND!" or similar friendly greeting
- Keep the tagline "Think outfit. Think OOTDay" as it reinforces the brand message

### 7. Remove Unused Sparkles Import
- Remove the `Sparkles` import from lucide-react since it's no longer used

### 8. Validate the Changes
- Verify the component compiles without TypeScript errors
- Ensure the Image component has all required props
- Confirm the file structure is correct

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -la apps/web/public/images/onboarding/logo.png` - Verify logo file exists in public directory
- `cd apps/web && pnpm exec tsc --noEmit components/onboarding/OnboardingWelcome.tsx` - Check TypeScript compilation
- `cd apps/web && pnpm lint` - Run linting to catch any issues
- `cd apps/web && pnpm dev` - Start dev server and visually verify the onboarding page loads correctly with the logo

## Notes
- The Next.js Image component requires explicit width and height props or fill mode. We'll need to inspect the actual logo.png dimensions to set appropriate values.
- Since this is above-the-fold content on the onboarding flow, using the `priority` prop is recommended to avoid lazy loading delays.
- The logo file is 39KB which is reasonable for web use, but we should verify it displays well at the target size.
- Consider using `width={512}` and `height={512}` as a starting point and adjust based on actual logo dimensions and design requirements.
