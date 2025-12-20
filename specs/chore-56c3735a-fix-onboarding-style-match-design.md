# Chore: Fix OnboardingStyle to Match Reference Design

## Metadata
adw_id: `56c3735a`
prompt: `Analyze reference designs at /Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/Style/preference/ (5.1-5.10Onboarding-Style.png) and fix OnboardingStyle.tsx to match EXACTLY. Key issues to fix: 1) CARD DESIGN - Image should fill ~75% of card height, title and description at bottom INSIDE the white card. Card has thin LEFT border accent in red/pink (not full border around card). 2) IMAGE - Must crop to hide any baked-in text. Use object-fit: cover, object-position: top, and set fixed height to show only the model figure. 3) TITLE - Red 'Minimal · Timeless' style title centered below image, inside card. 4) DESCRIPTION - Gray text centered below title, inside card. Each style should show its UNIQUE description (not same text for all). Reference shows Eccentric has 'Highly artistic and individual; uses unique shapes, bold colors, and clashing patterns and playful'. 5) CARD DIMENSIONS - Cards should be narrower and taller, mobile-friendly proportions like in reference. 6) SELECTED STATE - When selected, card shows left red border accent. 7) THUMBNAILS - Selected styles appear as small thumbnails at top with X button. Ensure all 10 styles scrollable in carousel.`

## Chore Description
Update the OnboardingStyle.tsx component to match the reference designs exactly. The reference designs (5.1-5.10) show a specific card layout with:
- Cards that are narrower and taller (mobile-friendly portrait orientation)
- Image filling approximately 75% of card height
- Title formatted as "Name · Description" (e.g., "Minimal · Timeless") in red/pink color, centered
- A unique description text in gray below the title, centered
- Left border accent in red/pink when selected (not a full border around the card)
- Selected styles appearing as small thumbnails at the top with X buttons for removal
- All 10 styles should be scrollable in a horizontal carousel

### Key Observations from Reference Designs:
1. **5.1 (Minimal)**: "Minimal · Timeless" with description "Less is more, clean, simple, neutral palette, pieces that last forever"
2. **5.2 (Luxury)**: "Luxury · Elegant" with description "Less is more, clean, simple, neutral palette, pieces that last forever" (appears same - may need unique)
3. **5.3 (Eccentric)**: "Eccentric · Creative" with description "Highly artistic and individual; uses unique shapes, bold colors, and clashing patterns and playful"
4. **5.4 (Business)**: "Business · Refined" with description "Smart, structured, and professional"
5. **5.5 (Vanilla)**: "Vanilla · Clean" with description "Soft neutrals, fresh, and cozy in light tones"
6. **5.6 (Sporty)**: "Sporty · Active" with description "Athletic wear, functional, ready for movement and confident"
7. **5.7 (Edgy)**: "Edgy · Trendy" with description "Bold, modern, and daring; follows the very latest fashion trends"
8. **5.8 (Bohemian)**: "Bohemian · Natural" with description "Relaxed, earthy, featuring flowly silhouettes and natural fabrics"
9. **5.9 (Classic)**: "Classic · Old Money" with description "Understated 'quiet luxury' built on timeless, tailored, and preppy pieces"
10. **5.10 (Mystery)**: "Mystery Style 🔮" with description "Random style"

## Relevant Files
Use these files to complete the chore:

- `frontend/components/onboarding/OnboardingStyle.tsx` - Main component to modify with card layout, styling, and carousel behavior
- `frontend/lib/data/fashion-styles.json` - Data source containing style definitions; needs unique short descriptions for card display
- `onboarding/Style/preference/5.1-5.10Onboarding-Style.png` - Reference design images showing exact expected layout

### New Files
- None required - all changes are modifications to existing files

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update fashion-styles.json with Card Descriptions
- Add a new `cardDescription` field to each style object with the exact short descriptions from the reference designs:
  - minimal: "Less is more, clean, simple, neutral palette, pieces that last forever"
  - luxury: "Sophisticated and polished with premium fabrics and impeccable tailoring"
  - eccentric: "Highly artistic and individual; uses unique shapes, bold colors, and clashing patterns and playful"
  - business: "Smart, structured, and professional"
  - vanilla: "Soft neutrals, fresh, and cozy in light tones"
  - sporty: "Athletic wear, functional, ready for movement and confident"
  - edgy: "Bold, modern, and daring; follows the very latest fashion trends"
  - bohemian: "Relaxed, earthy, featuring flowly silhouettes and natural fabrics"
  - classic: "Understated 'quiet luxury' built on timeless, tailored, and preppy pieces"
  - mystery: "Random style"

### 2. Update Card Dimensions and Layout
- Change card width from `flex-[0_0_200px]` to narrower width around `flex-[0_0_160px]` or similar
- Update image container height from `h-[200px]` to taller proportion (approximately 280px to achieve ~75% image ratio)
- Ensure card has rounded corners with `rounded-2xl` or `rounded-xl`

### 3. Fix Card Border Styling
- Remove full border styling: `border border-gray-100`
- Add only LEFT border accent: `border-l-4` with conditional color
- When NOT selected: `border-l-transparent` or very subtle `border-l-gray-200`
- When selected: `border-l-[var(--onboarding-primary)]` (red/pink accent)
- Keep card background white with subtle shadow

### 4. Fix Image Cropping and Positioning
- Keep `object-fit: cover` and `object-position: top` to crop bottom text
- Ensure image fills the container properly
- Add rounded top corners to image container: `rounded-t-2xl` or `rounded-t-xl`

### 5. Update Title and Description Styling
- Title: Change from left-aligned to CENTER aligned
- Title: Keep format as "Name · Description" (e.g., "Minimal · Timeless")
- Title: Red/pink color using `text-[var(--onboarding-primary)]`
- Title: Font weight bold, appropriate size
- Description: CENTER aligned gray text
- Description: Use new `cardDescription` field instead of `longDescription`
- Description: Smaller text size, gray color `text-gray-500` or `text-gray-600`
- Both should be inside the white card area with proper padding

### 6. Update Thumbnail Section
- Keep existing thumbnail section at top (appears correct in current implementation)
- Ensure thumbnails show with red border when selected
- Ensure X button is positioned correctly (top-right corner, red background, white X icon)
- Thumbnail dimensions approximately 60x80px as currently set

### 7. Verify Carousel Functionality
- Ensure all 10 styles are scrollable in horizontal carousel
- Maintain touch/swipe support via embla-carousel
- Verify proper gap between cards
- Ensure smooth scrolling experience

### 8. Final Styling Adjustments
- Verify card shadow is subtle: `shadow-md` or `shadow-sm`
- Ensure proper padding inside card content area
- Test responsive behavior on different screen sizes
- Verify the circular red "Next" button remains at bottom center

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npm run build` - Ensure the code compiles without errors
- `cd frontend && npm run lint` - Check for linting issues
- Visual inspection: Run `npm run dev` and navigate to the onboarding style step to compare with reference designs

## Notes
- The reference designs show that the card border accent is ONLY on the left side, not around the entire card
- Each style must display its unique `cardDescription`, not the same text for all cards
- The image should crop/hide any baked-in text that appears at the bottom of the source images
- The title format is consistently "Name · Description" with a centered bullet/dot separator
- The Mystery Style includes an emoji 🔮 in the title
- Card proportions should be portrait-oriented (taller than wide) for mobile-friendly display
