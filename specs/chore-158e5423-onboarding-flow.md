# Chore: Implement 7-Screen Onboarding Flow for Women's Fashion

## Metadata
adw_id: `158e5423`
prompt: `Implement a 7-screen onboarding flow for OOTDay fashion assistant (women only) in the existing Next.js frontend`

## Chore Description
Implement a comprehensive 7-screen onboarding wizard that captures user profile information before allowing access to the main chat interface. This implements Step 2 ('Know you') of the customer journey where OOTDay learns about the user. The flow includes: Welcome, Name input, Department selection (women-only pre-selected), Age selection, Style preference carousel, Photo upload, and Completion screen. User data will be persisted to localStorage and checked on app load to determine whether to show onboarding or main interface.

## Relevant Files

### Existing Files to Modify
- **frontend/app/page.tsx** - Main entry point that needs conditional rendering logic to show OnboardingFlow vs main content based on completion status
- **frontend/package.json** - Verify embla-carousel-react is installed (already present at v8.5.1)
- **frontend/app/globals.css** - May need cream/beige background color variable (#F5F5F0) and crimson/red accent colors for onboarding screens
- **frontend/components/ui/button.tsx** - Existing button component to be used throughout onboarding
- **frontend/components/ui/card.tsx** - For style selection cards and department cards
- **frontend/components/ui/input.tsx** - For name input field

### New Files to Create

#### Type Definitions
- **frontend/lib/types/user-profile-types.ts** - UserProfile interface, StylePreference interface, AgeRange type

#### React Hooks
- **frontend/lib/hooks/useUserProfile.ts** - Custom hook for managing user profile state and localStorage persistence

#### Onboarding Components
- **frontend/components/onboarding/OnboardingFlow.tsx** - Main wizard controller with step navigation logic
- **frontend/components/onboarding/OnboardingWelcome.tsx** - Screen 1: Welcome screen with logo and tagline
- **frontend/components/onboarding/OnboardingName.tsx** - Screen 2: Name input with validation
- **frontend/components/onboarding/OnboardingDepartment.tsx** - Screen 3: Department selection (women-only, pre-selected)
- **frontend/components/onboarding/OnboardingAge.tsx** - Screen 4: Age range selection with circle buttons
- **frontend/components/onboarding/OnboardingStyle.tsx** - Screen 5: Multi-select style carousel with embla-carousel
- **frontend/components/onboarding/OnboardingPhoto.tsx** - Screen 6: Photo upload or mystery avatar selection
- **frontend/components/onboarding/OnboardingComplete.tsx** - Screen 7: Completion screen with user summary
- **frontend/components/onboarding/OnboardingProgress.tsx** - Progress dots indicator component

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Type Definitions and Interfaces
- Create `frontend/lib/types/user-profile-types.ts` with:
  - `StylePreference` interface with id, name, description, imageUrl
  - `AgeRange` type as union: '<20' | '20-29' | '30-39' | '40+'
  - `UserProfile` interface with userName, gender (fixed 'women'), ageRange, stylePreferences array, userPhoto, onboardingCompleted boolean, createdAt string
- Export all types from this file

### 2. Create User Profile Hook
- Create `frontend/lib/hooks/useUserProfile.ts` with:
  - `useUserProfile()` hook that manages UserProfile state
  - `loadProfile()` function to read from localStorage key 'ootday_user_profile'
  - `saveProfile()` function to write to localStorage
  - `updateProfile()` function to update partial profile data
  - `completeOnboarding()` function to mark onboarding as complete
  - Return profile state and all mutation functions

### 3. Create Progress Indicator Component
- Create `frontend/components/onboarding/OnboardingProgress.tsx`:
  - Accept currentStep (1-7) and totalSteps (7) as props
  - Render 7 dots in a horizontal flex container
  - Highlight current step with crimson/red color
  - Completed steps should be filled, future steps outlined

### 4. Create Welcome Screen Component
- Create `frontend/components/onboarding/OnboardingWelcome.tsx`:
  - Display OOTDay logo (use Sparkles icon from lucide-react as placeholder)
  - Two women illustration placeholder (colored div for now)
  - 'Hi FRIEND! Welcome to OOTDay' heading
  - 'Think outfit. Think OOTDay' tagline
  - 'Let's Go →' button with crimson background
  - Accept onNext callback prop
  - Cream/beige background (#F5F5F0)

### 5. Create Name Input Screen Component
- Create `frontend/components/onboarding/OnboardingName.tsx`:
  - 'Hey there, What should I call you?' heading (with red text for question)
  - Input field with 'Your name' placeholder
  - Red circular arrow button to proceed (disabled until name entered)
  - Accept onNext(name: string) and onBack callbacks
  - Validate name is not empty
  - Show progress indicator (step 2/7)

### 6. Create Department Selection Screen Component
- Create `frontend/components/onboarding/OnboardingDepartment.tsx`:
  - 'What's your vibe?' title
  - 'Choose your fashion department' subtitle
  - Display women's flat lay image card (placeholder for now)
  - Pre-selected by default since women-only
  - Red circular arrow button to proceed (always enabled)
  - Accept onNext and onBack callbacks
  - Show progress indicator (step 3/7)

### 7. Create Age Selection Screen Component
- Create `frontend/components/onboarding/OnboardingAge.tsx`:
  - 'Age is just a number 🎂' heading
  - 'Help me curate the perfect styles for you' subtitle
  - Four circle buttons: 'Less than 20', '20-29', '30-39', '40+'
  - Buttons arranged in 2x2 grid on mobile, 1x4 row on desktop
  - Selected button has crimson background
  - Red circular arrow button to proceed (disabled until age selected)
  - Accept onNext(ageRange: AgeRange) and onBack callbacks
  - Show progress indicator (step 4/7)

### 8. Create Style Selection Screen Component
- Create `frontend/components/onboarding/OnboardingStyle.tsx`:
  - 'What's your style?' heading
  - 'Choose style that sparks you' subtitle
  - Horizontal carousel using embla-carousel-react
  - Style options as cards with image placeholders:
    * Minimal · Timeless
    * Luxury · Elegant
    * Business · Refined
    * Sporty · Active
    * Bohemian · Natural
    * Classic · Old Money
    * Mystery Style 🎲
  - Multi-select functionality (show selected as thumbnails at top)
  - Each card shows style name and description
  - Red circular arrow button to proceed (disabled until at least 1 style selected)
  - Accept onNext(styles: StylePreference[]) and onBack callbacks
  - Show progress indicator (step 5/7)

### 9. Create Photo Upload Screen Component
- Create `frontend/components/onboarding/OnboardingPhoto.tsx`:
  - 'Show your face — your style starts here' heading
  - 'Upload your photo — or let the magic happen' subtitle
  - Large upload area with person icon
  - File input for photo upload (convert to base64)
  - Two buttons: 'Upload' (red filled) and 'Mystery' (red outlined with dice icon)
  - Handle file upload and convert to base64
  - Accept onNext(photoData?: string) and onBack callbacks
  - Show progress indicator (step 6/7)

### 10. Create Completion Screen Component
- Create `frontend/components/onboarding/OnboardingComplete.tsx`:
  - 'Nice to meet you [name]' heading (name in red)
  - 'Successfully Registered 🎉' subtitle
  - Display user's uploaded photo or mystery avatar placeholder
  - 'Your BFF's here — ready to find your perfect look' message
  - 'Time to Chat ✨' button (crimson)
  - Accept profile data and onComplete callback
  - No progress indicator (completion screen)
  - No back button

### 11. Create Main Onboarding Flow Controller
- Create `frontend/components/onboarding/OnboardingFlow.tsx`:
  - Manage current step state (1-7)
  - Use useUserProfile hook for state management
  - Implement step navigation (next, back)
  - Collect data from each screen and update profile
  - Render appropriate screen component based on currentStep
  - Handle completion and call completeOnboarding()
  - Pass onComplete callback to parent
  - Full-screen container with cream/beige background
  - Smooth transitions between screens (use CSS transitions or framer-motion)

### 12. Update Main App Page with Conditional Rendering
- Modify `frontend/app/page.tsx`:
  - Add useEffect to check onboarding completion status on mount
  - Read from localStorage 'ootday_user_profile'
  - If onboardingCompleted is false or profile doesn't exist, show OnboardingFlow
  - If onboardingCompleted is true, show existing main content
  - Pass handleOnboardingComplete callback to OnboardingFlow
  - After onboarding completion, refresh to show main content

### 13. Add Onboarding Styles to Global CSS
- Update `frontend/app/globals.css`:
  - Add CSS variables for onboarding colors:
    * --onboarding-bg: #F5F5F0 (cream/beige)
    * --onboarding-primary: #DC2626 (crimson/red)
    * --onboarding-primary-hover: #B91C1C
  - Add transition classes for screen changes
  - Add styles for circular arrow button
  - Add styles for style carousel cards

### 14. Create README Documentation for Onboarding
- Create `frontend/components/onboarding/README.md`:
  - Document the 7-screen flow
  - Explain UserProfile data structure
  - Document localStorage persistence
  - Explain how to reset onboarding (clear localStorage)
  - Document style preference options
  - Include screenshots reference from /onboarding/ directory

### 15. Test Onboarding Flow
- Clear localStorage and refresh app
- Complete full onboarding flow with various inputs
- Test validation (empty name, no age selected, no style selected)
- Test back navigation
- Test photo upload and mystery avatar
- Verify data persists to localStorage correctly
- Verify main app loads after completion
- Test responsive design on mobile and desktop
- Test keyboard navigation where applicable

### 16. Test Edge Cases
- Test with very long names
- Test photo upload with large files
- Test mystery avatar selection
- Test multiple style selections
- Test browser refresh during onboarding (should resume from step 1)
- Test localStorage full/disabled scenarios

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && npm run lint` - Verify no TypeScript or linting errors
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && npm run build` - Ensure production build succeeds
- `cd /Users/naruechon/Documents/Project/OOTDay_Anti/frontend && npm run dev` - Start dev server and manually test onboarding flow
- Check that `ootday_user_profile` key exists in localStorage after completing onboarding
- Clear localStorage and verify onboarding shows again on refresh
- Test all 7 screens render correctly with reference to design files in `/onboarding/`

## Notes

### Design Reference Files
All design mockups are located in `/Users/naruechon/Documents/Project/OOTDay_Anti/onboarding/`:
- 1Onboarding-Welcome.png
- 2Onboarding-Name.png
- 3Onboarding-Department.png
- 4Onboarding-Age.png
- 5.1-5.7Onboarding-Style.png (7 style options)
- 6Onboarding-Photo.png
- 7Onboarding-Complete.png

### Key UX Considerations
- Mobile-first design approach
- Smooth transitions between screens
- Progress indication at all times (except welcome and complete)
- Form validation with helpful error states
- Back navigation capability (except on welcome and complete)
- Accessible keyboard navigation
- Touch-friendly button sizes (minimum 44x44px)

### Future Enhancements (Not in Scope)
- Add actual style images from design files
- Implement photo cropping for uploads
- Add animations with framer-motion
- Support for men's department (currently women-only)
- Multi-language support
- Profile editing after onboarding completion
- Social login integration
