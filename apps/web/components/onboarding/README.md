# Onboarding Flow - OOTDay Fashion Assistant

This directory contains the complete 7-screen onboarding flow for the OOTDay fashion assistant application.

## Overview

The onboarding flow implements Step 2 ('Know you') of the customer journey, capturing user profile information before allowing access to the main chat interface. The flow is designed for women's fashion only and stores all data locally in the browser.

## Flow Structure

The onboarding consists of 7 sequential screens:

### 1. Welcome Screen (`OnboardingWelcome.tsx`)
- **Purpose**: Introduce the user to OOTDay
- **Content**:
  - OOTDay logo (Sparkles icon placeholder)
  - Two women illustration (placeholder)
  - Welcome message: "Hi FRIEND! Welcome to OOTDay"
  - Tagline: "Think outfit. Think OOTDay"
- **Action**: "Let's Go →" button
- **Navigation**: No back button

### 2. Name Input (`OnboardingName.tsx`)
- **Purpose**: Capture user's name
- **Content**:
  - Heading: "Hey there, What should I call you?"
  - Text input field
  - Progress indicator (2/7)
- **Validation**: Name must not be empty
- **Navigation**: Back button, circular arrow button (disabled until valid)

### 3. Department Selection (`OnboardingDepartment.tsx`)
- **Purpose**: Confirm fashion department (women-only)
- **Content**:
  - Heading: "What's your vibe?"
  - Subtitle: "Choose your fashion department"
  - Women's fashion card (pre-selected)
  - Progress indicator (3/7)
- **Note**: Currently women-only, pre-selected by default
- **Navigation**: Back button, circular arrow button (always enabled)

### 4. Age Selection (`OnboardingAge.tsx`)
- **Purpose**: Capture age range for personalization
- **Content**:
  - Heading: "Age is just a number 🎂"
  - Subtitle: "Help me curate the perfect styles for you"
  - Four age range buttons: <20, 20-29, 30-39, 40+
  - Progress indicator (4/7)
- **Layout**: 2x2 grid on mobile, 1x4 row on desktop
- **Navigation**: Back button, circular arrow button (disabled until selected)

### 5. Style Selection (`OnboardingStyle.tsx`)
- **Purpose**: Capture style preferences (multi-select)
- **Content**:
  - Heading: "What's your style?"
  - Subtitle: "Choose style that sparks you"
  - Responsive grid layout with 10 style options (2 cols mobile, 3 cols tablet, 4 cols desktop)
  - Selection counter showing selected style names at top
  - Progress indicator (5/7)
- **Style Options**:
  - Minimal · Timeless
  - Luxury · Elegant
  - Business · Refined
  - Sporty · Active
  - Bohemian · Natural
  - Classic · Old Money
  - Streetwear · Urban
  - Romantic · Feminine
  - Edgy · Bold
  - Mystery Style 🎲
- **Features**: Multi-select grid with visual feedback (checkmarks, borders, scale effects)
- **Navigation**: Back button, circular arrow button (disabled until at least 1 selected)

### 6. Photo Upload (`OnboardingPhoto.tsx`)
- **Purpose**: Capture user photo or allow mystery avatar
- **Content**:
  - Heading: "Show your face — your style starts here"
  - Subtitle: "Upload your photo — or let the magic happen"
  - Upload area with file picker
  - Preview of uploaded photo
  - Progress indicator (6/7)
- **Actions**:
  - "Upload" button (red filled)
  - "Mystery" button (red outlined with dice icon)
- **File Constraints**: Max 5MB, image files only
- **Navigation**: Back button

### 7. Completion Screen (`OnboardingComplete.tsx`)
- **Purpose**: Confirm registration and show profile summary
- **Content**:
  - Heading: "Nice to meet you [name]" (name in red)
  - Subtitle: "Successfully Registered 🎉"
  - User photo or mystery avatar
  - Profile summary (department, age, styles)
  - Message: "Your BFF's here — ready to find your perfect look"
- **Action**: "Time to Chat ✨" button
- **Navigation**: No back button, no progress indicator

## User Profile Data Structure

The user profile is defined in `lib/types/user-profile-types.ts`:

```typescript
interface UserProfile {
  userName: string;
  gender: 'women'; // Currently fixed to women-only
  ageRange: '<20' | '20-29' | '30-39' | '40+';
  stylePreferences: StylePreference[];
  userPhoto?: string; // Base64 encoded or undefined
  onboardingCompleted: boolean;
  createdAt: string; // ISO date string
}
```

## Data Persistence

### localStorage Key
- **Key**: `ootday_user_profile`
- **Format**: JSON string of `UserProfile` object

### Hook: `useUserProfile`
Located in `lib/hooks/useUserProfile.ts`, provides:
- `profile`: Current user profile state
- `isLoading`: Loading state
- `loadProfile()`: Load from localStorage
- `saveProfile()`: Save to localStorage
- `updateProfile()`: Partial update
- `completeOnboarding()`: Mark onboarding complete
- `clearProfile()`: Reset (for testing)

## Integration with Main App

In `app/page.tsx`, the onboarding flow is conditionally rendered:

1. On app load, check `onboardingCompleted` status
2. If `false` or profile doesn't exist → show `OnboardingFlow`
3. If `true` → show main application interface

```typescript
// Check onboarding status
useEffect(() => {
  if (!isLoadingProfile) {
    const shouldShowOnboarding = !profile?.onboardingCompleted
    setShowOnboarding(shouldShowOnboarding)
  }
}, [profile, isLoadingProfile])

// Conditional render
if (showOnboarding) {
  return <OnboardingFlow onComplete={handleOnboardingComplete} />
}
```

## Resetting Onboarding

For testing or user reset purposes:

### Via Browser Console:
```javascript
localStorage.removeItem('ootday_user_profile')
location.reload()
```

### Via useUserProfile Hook:
```javascript
const { clearProfile } = useUserProfile()
clearProfile()
```

## Design System

### Colors
- **Background**: `#F5F5F0` (cream/beige)
- **Primary**: `#DC2626` (crimson/red)
- **Primary Hover**: `#B91C1C`

### Transitions
- Screen transitions: 300ms ease-out
- Button hover effects: scale(1.05)
- Smooth progress indicator animations

### Responsive Design
- Mobile-first approach
- Touch-friendly button sizes (min 44x44px)
- Adaptive layouts for mobile and desktop
- Grid layout optimized for both touch and mouse

## Component Dependencies

### External Libraries
- `lucide-react`: Icons (Sparkles, User, ChevronLeft, ArrowRight, Check, etc.)

### Internal Components
- `components/ui/button`: Button component
- `components/ui/card`: Card layouts
- `components/ui/input`: Text input

## Design Reference Files

All design mockups are located in `/onboarding/`:
- `1Onboarding-Welcome.png`
- `2Onboarding-Name.png`
- `3Onboarding-Department.png`
- `4Onboarding-Age.png`
- `5.1-5.7Onboarding-Style.png`
- `6Onboarding-Photo.png`
- `7Onboarding-Complete.png`

## Future Enhancements (Not in Current Scope)

- Add actual style images from design files
- Implement photo cropping for uploads
- Add animations with framer-motion
- Support for men's department
- Multi-language support
- Profile editing after onboarding completion
- Social login integration
- Cloud sync for user profiles
- Analytics tracking for onboarding completion rates

## Accessibility Considerations

- Keyboard navigation support
- Focus states on all interactive elements
- Semantic HTML structure
- ARIA labels where needed
- Screen reader friendly
- Sufficient color contrast
- Touch-friendly tap targets

## Testing Checklist

- [ ] Complete full flow with valid inputs
- [ ] Test name validation (empty input)
- [ ] Test age selection (no selection)
- [ ] Test style selection (no selection, multiple selections)
- [ ] Test photo upload (valid image, large file, mystery avatar)
- [ ] Test back navigation on all screens
- [ ] Test progress indicator updates
- [ ] Verify data persists to localStorage
- [ ] Verify main app loads after completion
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test keyboard navigation
- [ ] Test with very long names
- [ ] Test browser refresh during onboarding
