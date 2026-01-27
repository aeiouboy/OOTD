# Chore: Enhance Outfit Recommendation to Use User Preferences from Onboarding Session

## Metadata
adw_id: `7cd250ac`
prompt: `Enhance outfit recommendation to use user preferences from onboarding session for personalized styling`

## Chore Description
Integrate user preferences captured during the onboarding flow (name, department, age, styles, photo) into the outfit recommendation system to provide personalized styling recommendations. Currently, the outfit generator does not use user profile data, resulting in generic recommendations. This enhancement will map user style preferences to Pinterest 2026 aesthetics, apply age-appropriate recommendations, filter by department (gender), and personalize outfit titles and descriptions.

The onboarding flow captures 6 key data points:
1. **Name** - For personalized greetings and outfit titles
2. **Fashion Department** - Men/Women/Unisex (currently fixed to 'women')
3. **Age Range** - '<20', '20-29', '30-39', '40+' for age-appropriate styling
4. **Style Preferences** - Array of selected styles (minimal, luxury, eccentric, business, vanilla, sporty, edgy, bohemian, classic, mystery)
5. **User Photo** - For fitting model generation
6. **Onboarding Complete** - Status flag

This chore will create a seamless connection between user onboarding preferences and outfit generation, resulting in highly personalized recommendations that match user style, age, and gender preferences.

## Relevant Files

### Files to Read and Understand
- `apps/web/lib/hooks/useUserProfile.ts` - Hook for accessing user profile data from localStorage
- `apps/web/lib/types/user-profile-types.ts` - User profile type definitions including StylePreference and AgeRange
- `apps/web/lib/outfit-generator.ts` - Main outfit generation logic (needs enhancement)
- `apps/web/lib/enhanced-outfit-generator.ts` - Enhanced product model outfit generation (needs enhancement)
- `apps/web/lib/styling/outfit-combination-rules.ts` - Outfit combination rules and validation
- `apps/web/lib/styling/pinterest-2026-trends.ts` - Pinterest 2026 aesthetic definitions and trend data
- `apps/web/components/chat/ChatAssistant.tsx` - Chat interface that calls outfit generation API
- `apps/web/lib/data/fashion-styles.json` - Style preference definitions with keywords
- `data/personas/knowledge_base/foundation/04_occasions_dress_codes.md` - Occasion-based styling guidelines
- `data/personas/knowledge_base/advanced/08_color_theory.md` - Color theory and matching rules
- `data/personas/knowledge_base/advanced/10_advanced_styling.md` - Advanced styling techniques

### Files to Modify

#### 1. `apps/web/lib/styling/pinterest-2026-trends.ts`
- Add style preference to aesthetic mapping functions
- Add age-based recommendation filtering
- Create helper functions for user preference interpretation

#### 2. `apps/web/lib/outfit-generator.ts`
- Add `userPreferences` parameter to `generateOutfit()` function
- Add `userPreferences` parameter to `generateOutfits()` function
- Filter products by user's department (gender)
- Map user style preferences to aesthetics
- Apply age-appropriate trend selection
- Personalize outfit titles with user's name
- Enhance outfit descriptions with user context

#### 3. `apps/web/lib/enhanced-outfit-generator.ts`
- Add `userPreferences` parameter to `generateEnhancedOutfit()` function
- Add `userPreferences` parameter to `generateEnhancedOutfits()` function
- Apply same user preference filtering as standard generator
- Ensure consistency between both generators

#### 4. `apps/web/lib/styling/outfit-combination-rules.ts`
- Add age-based filtering for trend recommendations
- Add style preference matching in outfit composition
- Enhance scoring functions to consider user preferences

#### 5. `apps/web/components/chat/ChatAssistant.tsx`
- Already passes user preferences to API (line 202-207)
- No changes needed - verification only

### New Files

#### 1. `apps/web/lib/utils/user-preference-mapper.ts`
Create utility functions for mapping user preferences to outfit parameters:
- `mapStylesToAesthetics(stylePreferences: StylePreference[]): AestheticCategory[]`
- `getAgeAppropriateAesthetics(ageRange: AgeRange, aesthetics: AestheticCategory[]): AestheticCategory[]`
- `getAgeFormalityBias(ageRange: AgeRange): number`
- `personalizeOutfitTitle(title: string, userName?: string): string`
- `getUserPreferenceContext(profile: UserProfile | null): UserPreferenceContext`

## Step by Step Tasks

### 1. Create User Preference Mapping Utility
- Create `apps/web/lib/utils/user-preference-mapper.ts`
- Define `UserPreferenceContext` interface with mapped preferences
- Implement `mapStylesToAesthetics()` function:
  - Map 'minimal' → ['clean-girl', 'scandinavian-minimal']
  - Map 'luxury' → ['quiet-luxury', 'corporate-chic']
  - Map 'eccentric' → ['y2k-revival', 'street-style']
  - Map 'business' → ['corporate-chic', 'minimalist-office']
  - Map 'vanilla' → ['clean-girl', 'casual-chic']
  - Map 'sporty' → ['street-style', 'casual-chic']
  - Map 'edgy' → ['street-style', 'y2k-revival']
  - Map 'bohemian' → ['casual-chic']
  - Map 'classic' → ['quiet-luxury', 'minimalist-office']
  - Map 'mystery' → return all aesthetics for variety
- Implement `getAgeAppropriateAesthetics()` function:
  - '<20': Prioritize y2k-revival, street-style, casual-chic
  - '20-29': Balanced mix of all aesthetics
  - '30-39': Prioritize quiet-luxury, corporate-chic, minimalist-office
  - '40+': Prioritize quiet-luxury, scandinavian-minimal, minimalist-office
- Implement `getAgeFormalityBias()` function:
  - '<20': return -1 (prefer casual)
  - '20-29': return 0 (neutral)
  - '30-39': return +1 (prefer sophisticated)
  - '40+': return +2 (prefer elegant)
- Implement `personalizeOutfitTitle()` function to add user's name
- Implement `getUserPreferenceContext()` function to aggregate all preferences

### 2. Enhance Pinterest 2026 Trends Module
- Open `apps/web/lib/styling/pinterest-2026-trends.ts`
- Add `filterAestheticsByAge()` function:
  - Takes aesthetics array and age range
  - Returns sorted aesthetics (most appropriate first)
  - Uses age grouping logic from mapper utility
- Add `getRecommendedFormality()` function:
  - Takes age range and occasion
  - Returns recommended formality level (1-10 scale)
- Add exports for new functions

### 3. Update Outfit Generator with User Preferences
- Open `apps/web/lib/outfit-generator.ts`
- Import user preference mapper utilities
- Import UserProfile type
- Modify `generateOutfit()` function signature:
  - Add optional `userProfile?: UserProfile | null` parameter
  - Add optional `userName?: string` parameter for backward compatibility
- Inside `generateOutfit()`:
  - Get user preference context at start of function
  - If userProfile exists, map style preferences to aesthetics
  - Filter aesthetics by age appropriateness
  - Apply department filter to categorized products
  - Pass user's preferred aesthetics to trend-based outfit generation
  - Personalize outfit title with user's name if provided
  - Enhance outfit description with age-appropriate language
- Modify `generateOutfits()` function signature:
  - Add optional `userProfile?: UserProfile | null` parameter
  - Remove hardcoded gender logic, use profile.gender instead
- Inside `generateOutfits()`:
  - Get gender from userProfile.gender instead of options.gender
  - Pass userProfile to each `generateOutfit()` call
  - Apply user's style preferences as aesthetic filter

### 4. Update Enhanced Outfit Generator
- Open `apps/web/lib/enhanced-outfit-generator.ts`
- Import user preference mapper utilities
- Import UserProfile type
- Modify `generateEnhancedOutfit()` function signature:
  - Add optional `userProfile?: UserProfile | null` parameter
- Inside `generateEnhancedOutfit()`:
  - Get user preference context at start
  - Map style preferences to aesthetics if profile exists
  - Filter products by department (gender) from profile
  - Apply age-appropriate formality adjustments
  - Personalize outfit title and description
- Modify `generateEnhancedOutfits()` function signature:
  - Add optional `userProfile?: UserProfile | null` parameter
  - Use profile.gender instead of options.gender
- Pass userProfile to all `generateEnhancedOutfit()` calls

### 5. Enhance Outfit Combination Rules
- Open `apps/web/lib/styling/outfit-combination-rules.ts`
- Modify `applyTrendBasedCombination()` function:
  - Add optional `userPreferredAesthetics?: AestheticCategory[]` parameter
  - When selecting aesthetics, prioritize user's preferences
  - Filter out aesthetics that don't match user's style
- Modify `scoreProductForOutfit()` internal function:
  - Add bonus points for products matching user's preferred aesthetics
  - Adjust scoring based on age-appropriate trends
- Add `filterTrendsByAge()` helper function:
  - Takes trend items and age range
  - Returns filtered trends appropriate for age group

### 6. Update Chat API Integration (Verification)
- Open `apps/web/components/chat/ChatAssistant.tsx`
- Verify that userPreferences are being sent to API (lines 202-207)
- Ensure profile hook is imported and used correctly (line 36)
- No code changes needed - just verification step

### 7. Update Backend API to Pass User Preferences
- Open `apps/web/app/api/chat/route.ts`
- Verify userPreferences are received from request body
- Pass userPreferences to outfit generation functions
- Ensure userProfile is constructed from userPreferences
- Pass full UserProfile object to `generateOutfits()` and `generateOutfitsFromQuery()`

### 8. Test User Preference Integration
- Create test scenarios for each age range and style combination
- Verify outfit recommendations change based on user preferences
- Test with different style preference combinations
- Verify personalized titles include user's name
- Test department (gender) filtering works correctly
- Verify age-appropriate aesthetic filtering

### 9. Add Knowledge Base Integration Comments
- Add code comments referencing relevant knowledge base sections:
  - Reference `08_color_theory.md` in color matching logic
  - Reference `04_occasions_dress_codes.md` in occasion-based filtering
  - Reference `10_advanced_styling.md` in advanced combination rules
- Document which knowledge base rules are being applied
- Add TODO comments for future knowledge base integrations

### 10. Validate Implementation
- Test complete onboarding flow followed by outfit request
- Verify outfit recommendations reflect user's style preferences
- Test with user profile vs without (fallback behavior)
- Verify age-appropriate recommendations for all age ranges
- Check that outfit titles are personalized with user names
- Validate department filtering works correctly
- Run TypeScript compilation check
- Test in browser with real user flow

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Navigate to web app directory
cd apps/web

# TypeScript compilation check
pnpm exec tsc --noEmit

# Run linting
pnpm lint

# Build the application
pnpm build

# Run development server for manual testing
pnpm dev

# Manual testing checklist:
# 1. Complete onboarding with different style preferences
# 2. Request outfit recommendations in chat
# 3. Verify recommendations match selected styles
# 4. Test with different age ranges
# 5. Check outfit titles include user's name
# 6. Verify department (gender) filtering
```

## Notes

### Style to Aesthetic Mapping Strategy
The mapping strategy uses fashion-styles.json keywords to determine the most appropriate Pinterest 2026 aesthetics:
- Multiple styles can map to the same aesthetic (many-to-many relationship)
- "Mystery" style returns all aesthetics for maximum variety
- Age filtering further refines aesthetic selection for appropriateness

### Age-Based Recommendation Strategy
- **<20**: Trend-forward, experimental, casual-first approach
- **20-29**: Balanced recommendations across all styles and formalities
- **30-39**: More sophisticated, professional-leaning recommendations
- **40+**: Emphasis on timeless, elegant, quality-focused pieces

### Backward Compatibility
- All user preference parameters are optional to maintain backward compatibility
- If no user profile exists, system falls back to current behavior
- Existing API calls without user preferences will continue to work

### Future Enhancements
- Add user's fitting model image to outfit visualization
- Use color preferences from photo analysis
- Learn from user's outfit selections to refine recommendations
- Add seasonal preference adjustments
- Integrate body type recommendations from user photo analysis

### Knowledge Base Integration Opportunities
The following knowledge base documents provide additional styling rules that could be integrated:
- `02_thai_culture_fashion.md` - Thai cultural considerations
- `03_body_types_styling.md` - Body type specific recommendations (requires photo analysis)
- `06_international_travel.md` - Travel-specific outfit recommendations
- `07_festivals_holidays.md` - Holiday and event-specific styling
- `09_social_media_trends.md` - Latest social media fashion trends
- `11_summer2026_trends.md` - Seasonal trend integration
- `13_user_psychology.md` - Psychological aspects of fashion recommendations
