# Chore: Style Preferences Carousel Images

## Metadata
adw_id: `554fa91c`
prompt: `Fix the style preferences carousel in OnboardingStyle.tsx to display unique style-specific images for all 10 styles instead of the generic dress emoji. Each style should have a distinctive visual representation: 1) Add imageUrl values to all styleOptions in the array - use placeholder images from a service like picsum.photos or unsplash with fashion/style-related keywords, OR create styled gradient backgrounds with icons that represent each style. 2) Update the style card rendering to display the imageUrl when available, falling back to the emoji only if no image exists. 3) Ensure the carousel properly displays all 10 styles (Minimal, Luxury, Business, Sporty, Bohemian, Classic, Streetwear, Romantic, Edgy, Mystery Style) with smooth horizontal scrolling. The Mystery Style should remain last with its dice emoji as the visual.`

## Chore Description
The OnboardingStyle.tsx component currently displays a carousel of 10 fashion style options. All styles (except Mystery Style) show a generic dress emoji (`👗`) as their visual representation. This chore updates the carousel to display unique, style-specific images using Unsplash Source URLs with fashion-related keywords. Each style will have a distinctive visual that represents its aesthetic. The Mystery Style will retain its dice emoji (`🎲`) as the special random option visual.

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Main file to modify. Contains the `styleOptions` array and carousel rendering logic. Currently has all `imageUrl` set to `undefined` and renders a placeholder gradient div with emoji.
- `frontend/lib/types/user-profile-types.ts` - Defines `StylePreference` interface with optional `imageUrl?: string` property. Already supports images, no changes needed.

### New Files
- None required - all changes are to existing file

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Unsplash Image URLs to styleOptions Array
- Update each style option's `imageUrl` property with a unique Unsplash Source URL
- Use fashion/style-appropriate search keywords for each style:
  - `minimal`: `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop` (clean minimal fashion)
  - `luxury`: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop` (luxury fashion)
  - `business`: `https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=300&fit=crop` (business professional)
  - `sporty`: `https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=400&h=300&fit=crop` (athletic sporty)
  - `bohemian`: `https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=300&fit=crop` (bohemian style)
  - `classic`: `https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=300&fit=crop` (classic elegant)
  - `streetwear`: `https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=300&fit=crop` (streetwear urban)
  - `romantic`: `https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop` (romantic feminine)
  - `edgy`: `https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=300&fit=crop` (edgy bold fashion)
  - `mystery`: Keep `imageUrl: undefined` - will use dice emoji as fallback

### 2. Update Style Card Rendering Logic
- Modify the card's image section (currently line 178-180 in the component)
- Replace the current placeholder div with conditional rendering:
  - If `style.imageUrl` exists: Render an `<img>` tag with the URL, object-fit cover, and rounded corners
  - If no `imageUrl` (Mystery Style): Keep the gradient background with emoji fallback
- Add proper `alt` text using the style name
- Ensure the image container maintains the same dimensions (`h-48 w-full`) and styling (`rounded-xl mb-4`)

### 3. Add Next.js Image Configuration for External Images
- Since using external Unsplash URLs, ensure proper `<img>` tag usage with appropriate loading attributes
- Add `loading="lazy"` for performance
- Add error handling with `onError` to fallback to emoji if image fails to load

### 4. Validate Carousel Functionality
- Verify all 10 styles are rendered in the correct order: Minimal, Luxury, Business, Sporty, Bohemian, Classic, Streetwear, Romantic, Edgy, Mystery Style
- Confirm horizontal scrolling works smoothly via Embla Carousel
- Verify Mystery Style displays the dice emoji (not an image)
- Confirm style selection toggling still works correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm build` - Ensure the TypeScript compiles without errors
- `cd frontend && pnpm lint` - Verify no linting issues
- `cd frontend && pnpm dev` - Start dev server and manually verify:
  1. Navigate to onboarding flow step 5 (style selection)
  2. Confirm each of the 10 styles displays a unique image
  3. Confirm Mystery Style shows dice emoji
  4. Confirm carousel scrolls horizontally
  5. Confirm style selection/deselection works

## Notes
- Using direct Unsplash URLs instead of downloading images to avoid adding binary files to the repository
- The `w=400&h=300&fit=crop` parameters ensure consistent image dimensions and faster loading
- Images may need to be curated/replaced with more representative fashion images if the default Unsplash selections don't match the style aesthetics well
- Consider adding a subtle loading state or skeleton while images load for better UX
- The Mystery Style intentionally has no image to maintain its "unknown/random" mystique
