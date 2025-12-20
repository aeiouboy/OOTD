# Chore: Fix OnboardingStyle carousel center-focus effect to match design mockups

## Metadata
adw_id: `9b66d10c`
prompt: `Fix OnboardingStyle carousel center-focus effect to match design mockups at /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/preference/. Current implementation has scale effect but it's too subtle to be noticeable.`

## Chore Description
The OnboardingStyle carousel currently has a center-focus effect with scale values (1.0 center, 0.85 side) that are too subtle compared to the design mockups. The design at `onboarding/preference/5.1Onboarding-Style.png` shows the center 'Minimal' card taking approximately 70% of viewport width with adjacent cards clearly smaller and faded at edges.

This chore requires:
1. Increasing scale contrast (1.0 center, 0.7 side, 0.55 for distant cards)
2. Adding CSS perspective wrapper with translateZ transforms for true 3D depth
3. Adjusting card widths dynamically based on selectedIndex for center prominence
4. Adding shadow depth differentiation (shadow-xl center, shadow-none sides)
5. Implementing smooth interpolation with GPU-accelerated transforms

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Main component containing the carousel implementation with `getSlideStyles()` function that needs updated scale/opacity calculations and added translateZ transforms. The carousel container needs perspective wrapper and dynamic width calculations.

- `frontend/app/globals.css` - Contains `.carousel-perspective` and `.carousel-slide-3d` CSS classes (lines 444-457) that need enhanced 3D transforms, shadow depth classes, and smooth transition properties.

- `onboarding/preference/5.1Onboarding-Style.png` - Reference design mockup showing expected center-focus effect with ~70% width center card.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update CSS classes in globals.css for enhanced 3D carousel
- Modify `.carousel-perspective` to ensure `perspective: 1000px` and add `perspective-origin: center center`
- Update `.carousel-slide-3d` to include:
  - `transform-style: preserve-3d` for child 3D transforms
  - `backface-visibility: hidden` for smoother rendering
- Add new CSS classes for shadow depth:
  - `.carousel-slide-center` with `box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.15)`
  - `.carousel-slide-side` with `box-shadow: none` or minimal shadow
- Add transition properties for smooth scale/opacity/translate interpolation

### 2. Update getSlideStyles function in OnboardingStyle.tsx
- Change scale calculation from `Math.max(0.85, 1 - distance * 0.1)` to more dramatic values:
  - Center (distance 0): scale 1.0
  - Adjacent (distance 1): scale 0.7
  - Further (distance 2+): scale 0.55 (clamped with `Math.max(0.55, 1 - distance * 0.3)`)
- Add `translateZ` to transform string:
  - Center: `translateZ(50px)`
  - Side cards: `translateZ(-50px)` or interpolated based on distance
- Update opacity values for more contrast:
  - Center: 1.0
  - Adjacent: 0.6
  - Further: 0.4

### 3. Implement dynamic card width based on selectedIndex
- Change static flex-basis `flex-[0_0_220px]` to dynamic calculation
- Center card should be wider (~70% of viewport on mobile, ~280px on larger screens)
- Side cards should be narrower (~50% of center width visible)
- Use inline style or conditional className based on `isCentered` boolean
- Consider using calc() with CSS custom properties for responsive width

### 4. Apply shadow depth classes based on card position
- Add conditional className for shadow:
  - Center card: `shadow-xl` or custom `.carousel-slide-center` class
  - Side cards: `shadow-none` or custom `.carousel-slide-side` class
- Ensure shadow transitions smoothly with card position

### 5. Ensure GPU acceleration and smooth interpolation
- Verify `will-change: transform, opacity` is applied
- Add `transform-style: preserve-3d` to container
- Test that transitions use `cubic-bezier` easing for smooth animation
- Ensure scroll-based position updates interpolate smoothly (not discrete jumps)

### 6. Validate the implementation
- Run development server and test on mobile viewport (375px width)
- Verify center card takes ~70% of viewport width
- Confirm adjacent cards are visibly smaller (scale 0.7) and faded
- Check 3D depth effect with translateZ is noticeable
- Validate smooth transition animations when swiping carousel
- Compare against design mockup `5.1Onboarding-Style.png`

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm dev` - Start development server
- Open browser to `http://localhost:3000` and navigate to onboarding style step
- Use browser DevTools to simulate mobile viewport (375px x 667px)
- Inspect carousel cards to verify:
  - Center card has `transform: scale(1) translateZ(50px)`
  - Adjacent cards have `transform: scale(0.7) translateZ(-50px)`
  - Shadow classes applied correctly
- Test carousel swipe behavior for smooth transitions
- Compare visual appearance against `onboarding/preference/5.1Onboarding-Style.png`

## Notes
- The design mockup shows a significant visual difference between center and side cards - the center card dominates the viewport while sides are much smaller and partially visible
- Current implementation uses Embla Carousel with `align: 'center'` which should work well with the enhanced center-focus effect
- Be careful not to break the existing selection/deselection functionality when updating styles
- Consider adding scroll snap points for crisp centering if not already handled by Embla
- The `will-change` property is already in CSS but ensure transforms are truly GPU-accelerated
