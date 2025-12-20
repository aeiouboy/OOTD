# Chore: Fix Style Carousel Layout for Mobile-First Design

## Metadata
adw_id: `62fd477c`
prompt: `Fix the style carousel layout in OnboardingStyle.tsx to match the mobile-first design in onboarding/5.1Onboarding-Style.png`

## Chore Description
The OnboardingStyle.tsx carousel currently uses card dimensions that don't match the mobile-first design shown in the reference image (5.1Onboarding-Style.png). The design shows tall, portrait-oriented cards that emphasize full character/outfit images with a "peek" effect showing the next card partially visible on the right edge.

Key issues to fix:
1. Cards are too wide and short (280px × h-80) - need taller, narrower cards (~240px × ~420px)
2. Image container (h-48) crops the outfit images - need taller images (h-64 or h-72)
3. No carousel padding causing cards to touch edges - need px-4 or px-6 padding
4. Text section has too much spacing (mb-4) - needs to be more compact (mb-2)
5. Carousel should feel immersive on mobile with proper max-width constraints

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Main file to modify, contains the carousel component with embla-carousel-react
- `onboarding/5.1Onboarding-Style.png` - Reference design image showing the target layout (already reviewed)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Card Sizing
- Change card width from `flex-[0_0_280px]` to `flex-[0_0_240px]` (line 182)
- Remove fixed height `h-80` from the button element (line 187) and let content determine height
- The card should be taller and narrower to match mobile portrait orientation

### 2. Increase Image Container Height
- Change image container from `h-48` to `h-72` (line 197) to show full character/outfit
- The image should be the dominant element of each card as shown in the reference design
- Keep `object-cover` to maintain proper image scaling

### 3. Add Carousel Padding for Peek Effect
- Add padding `px-4` or `px-6` to the carousel container div (line 175)
- This creates the "peek" effect where the next card is partially visible at the edge
- The rightmost visible card should be cut off to hint at more content

### 4. Reduce Text Spacing
- Change margin between image and title from `mb-4` to `mb-2` (line 197)
- Keep title and description close together
- Ensure the overall card emphasizes the image over text

### 5. Add Mobile Responsive Constraints
- Consider adding `max-w-md mx-auto` to the carousel wrapper for mobile optimization
- Alternatively, apply responsive classes like `md:max-w-none` to allow larger screens to expand
- Cards should feel large and immersive on mobile screens

### 6. Visual Validation
- Run the development server and navigate to the onboarding style step
- Compare the carousel layout with the reference image
- Verify: taller cards, full outfit images visible, peek effect on right edge, compact text

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm dev` - Start development server to visually verify changes
- `cd frontend && pnpm lint` - Run linting to ensure no code style issues
- `cd frontend && pnpm build` - Build the project to ensure no TypeScript/compilation errors

## Notes
- The reference image shows a beige/cream background with cards having a subtle border
- Selected cards have a red/pink border (--onboarding-primary)
- The carousel uses embla-carousel-react which handles the snap scrolling behavior
- The "peek" effect is achieved through padding on the container rather than carousel configuration
- Height should be `auto` or removed entirely to let the taller image container determine card height
