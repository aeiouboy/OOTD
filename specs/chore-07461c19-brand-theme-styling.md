# Chore: Implement OOTDay Brand Theme and Styling

## Metadata
adw_id: `07461c19`
prompt: `Implement OOTDay frontend UI theme and styling based on the brand style guide with crimson/magenta color scheme, cream/beige backgrounds, and consistent styling across all components.`

## Chore Description
Transform the OOTDay frontend UI to align with the brand style guide by implementing a cohesive color palette centered around deep crimson/magenta (#C41E3A) accents on cream/beige (#F5F0EB) backgrounds. This chore updates the Tailwind CSS configuration, global styles, and all UI components to reflect the brand identity while maintaining accessibility and usability standards.

The brand identity emphasizes:
- Friendly, approachable tone ("Your BFFs here")
- Luxurious yet accessible fashion aesthetic
- Clear visual hierarchy with bold accent colors
- Consistent rounded corners and shadows for depth

## Relevant Files

**Configuration Files:**
- `frontend/app/globals.css` - Main global styles file with CSS custom properties and theme configuration. Currently uses purple (#A855F7) theme, needs update to crimson theme.

**UI Component Files:**
- `frontend/components/ui/button.tsx` - Button component using primary/secondary variants, needs color updates
- `frontend/components/ui/card.tsx` - Card component with variant system, needs crimson accent updates
- `frontend/components/ui/input.tsx` - Input component with focus states, needs border color updates
- `frontend/components/ui/badge.tsx` - Badge component for labels and tags
- `frontend/components/ui/dialog.tsx` - Modal dialog component
- `frontend/components/ui/checkbox.tsx` - Checkbox component for selections
- `frontend/components/ui/radio-group.tsx` - Radio group component for style selections
- `frontend/components/ui/slider.tsx` - Slider component for filters

**Chat Interface Files:**
- `frontend/components/chat/ChatMessage.tsx` - Chat message bubbles, needs user/AI message styling updates
- `frontend/components/chat/ChatInput.tsx` - Chat input field
- `frontend/components/chat/ChatInterface.tsx` - Main chat interface
- `frontend/components/chat/OutfitRecommendationCard.tsx` - Product recommendation cards
- `frontend/components/chat/LooksInspiration.tsx` - Outfit inspiration cards

**Product Display Files:**
- `frontend/components/product/ProductModal.tsx` - Product detail modal
- `frontend/components/product/ProductDetail.tsx` - Product detail component

**Layout Files:**
- `frontend/components/layout/Header.tsx` - Main header component
- `frontend/components/layout/BottomNavigation.tsx` - Bottom navigation bar

### New Files
- None required - all updates are modifications to existing files

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Global CSS Theme Variables
- Open `frontend/app/globals.css`
- Replace primary color variables from purple (#A855F7) to crimson (#C41E3A)
- Update background color from white to cream (#F5F0EB)
- Add new OOTDay brand color variables: `--ootday-crimson: #C41E3A`, `--ootday-cream: #F5F0EB`, `--ootday-brown: #4A3728`, `--ootday-gold: #B8860B`
- Update `--primary` from `oklch(0.7 0.2 280)` to crimson equivalent in OKLCH color space
- Update `--background` from `oklch(1 0 0)` to cream equivalent
- Update `--card` background to white (#FFFFFF)
- Update `--accent` to use crimson color
- Update `--muted-foreground` to dark brown (#4A3728)
- Update `--chat-user` bubble color to cream (#F5F0EB)
- Update `--chat-assistant` bubble color to white with crimson accent
- Preserve existing animation keyframes and custom styles
- Update dark mode variables to maintain contrast with new color scheme

### 2. Update Button Component Styling
- Open `frontend/components/ui/button.tsx`
- Update `primary` variant to use solid #C41E3A background with white text
- Update hover state to use darker crimson shade
- Ensure `rounded-lg` corners are applied (already present in base class)
- Update `outline` variant to use #C41E3A border
- Update secondary variant styling if needed
- Add circle button variant for navigation arrows with #C41E3A background
- Ensure minimum touch target size (44x44px) is maintained
- Update focus ring colors to match crimson theme

### 3. Update Card Component Styling
- Open `frontend/components/ui/card.tsx`
- Update card variants to support product cards with crimson background
- Add new variant: `product` with #C41E3A background, white text, rounded-xl corners
- Update selection state styling to use #C41E3A border
- Update hover states to use lighter crimson tint
- Ensure default cards use white background with subtle shadow
- Update CardTitle to support bold styling with accent color option
- Maintain responsive padding and gap spacing

### 4. Update Input Component Styling
- Open `frontend/components/ui/input.tsx`
- Update border color to use #C41E3A for default variant
- Update focus ring to use crimson color
- Ensure rounded-lg shape is applied
- Update placeholder text color to light gray (#9CA3AF)
- Update error state colors if using crimson (verify contrast)
- Maintain minimum height for touch targets (44px)

### 5. Update Chat Message Styling
- Open `frontend/components/chat/ChatMessage.tsx`
- Update AI message bubbles to left-aligned with crimson avatar icon background
- Update AI message bubble background to white
- Update user message bubbles to right-aligned with cream/beige (#F5F0EB) background
- Update avatar icon container to use #C41E3A background with white icon
- Ensure rounded corners with subtle shadow for message bubbles
- Update timestamp text colors for readability

### 6. Update Chat Input Styling
- Open `frontend/components/chat/ChatInput.tsx`
- Update input border to use #C41E3A
- Update send button to use solid crimson background with white icon
- Ensure rounded corners match design system
- Update placeholder text color
- Update focus states to use crimson

### 7. Update Product Cards and Modal
- Open `frontend/components/chat/OutfitRecommendationCard.tsx`
- Update card backgrounds to use #C41E3A with white text
- Ensure rounded-xl corners are applied
- Update price and button styling to maintain contrast
- Open `frontend/components/product/ProductModal.tsx`
- Update size and color selectors to use crimson border on selection
- Update action buttons to use crimson primary style
- Update hover states for product images and interactions

### 8. Update Selection Components
- Open `frontend/components/ui/checkbox.tsx`
- Update checked state to use #C41E3A background
- Update border colors to use crimson
- Open `frontend/components/ui/radio-group.tsx`
- Update selected state to use crimson border/fill
- Open `frontend/components/ui/slider.tsx`
- Update track and thumb colors to use crimson

### 9. Update Badge Component
- Open `frontend/components/ui/badge.tsx`
- Update primary badge variant to use crimson background
- Add outline variant with crimson border
- Ensure text contrast meets WCAG standards

### 10. Update Layout Components
- Open `frontend/components/layout/Header.tsx`
- Update header styling to use brand colors if applicable
- Update accent elements to use crimson
- Open `frontend/components/layout/BottomNavigation.tsx`
- Update active state indicators to use crimson
- Update icon colors for consistency

### 11. Test Visual Consistency
- Start development server with `cd frontend && pnpm dev`
- Navigate through all major pages and components
- Verify color consistency across:
  - Buttons (primary, secondary, outline, circle navigation)
  - Cards (product cards, style selection cards, chat cards)
  - Input fields and form elements
  - Chat interface (AI messages, user messages, avatars)
  - Product modal and selection states
  - Navigation elements
- Check responsive behavior on mobile and desktop
- Verify hover and active states work correctly
- Test dark mode if applicable

### 12. Verify Accessibility Standards
- Check color contrast ratios using browser dev tools
- Ensure #C41E3A on white meets WCAG AA standards (4.5:1 for normal text)
- Verify white text on #C41E3A background meets contrast requirements
- Test keyboard navigation with new focus states
- Verify touch targets meet 44x44px minimum on mobile
- Test screen reader compatibility with updated components

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm build` - Verify the build completes without errors
- `cd frontend && pnpm lint` - Check for linting issues in updated files
- `cd frontend && pnpm test` - Run component tests to ensure no regressions
- Manual visual inspection:
  - Run `cd frontend && pnpm dev`
  - Navigate to http://localhost:3000
  - Check homepage, chat interface, product modal for brand consistency
  - Verify colors match: Primary #C41E3A, Background #F5F0EB, Text #4A3728, Card #FFFFFF
  - Test button variants, input fields, card styles, chat messages
  - Verify mobile responsive behavior
- Accessibility check:
  - Use Chrome DevTools Lighthouse to verify accessibility score
  - Check contrast ratios for all color combinations
  - Verify keyboard navigation and focus indicators

## Notes
- The current theme uses purple (#A855F7) extensively - this needs to be systematically replaced with crimson (#C41E3A)
- CSS custom properties are defined in OKLCH color space - conversions may be needed for accurate color matching
- Some components may reference color classes that don't exist yet - ensure all necessary Tailwind color utilities are available
- The onboarding flow already uses red (#DC2626) - verify if this should be updated to match brand crimson (#C41E3A)
- Dark mode variables should maintain similar contrast ratios with the new color scheme
- The system supports Thai language (Noto Thai font) - ensure text readability with new colors
- Components use class-variance-authority for variant management - maintain this pattern
- Touch target sizes (min 44x44px) are critical for mobile usability
- Consider adding CSS custom properties to the @theme inline section for easier Tailwind class usage
