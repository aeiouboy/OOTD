# Chore: Fashion Style Definitions for Onboarding

## Metadata
adw_id: `b35b29e4`
prompt: `Analyze and define 10 fashion styles for a style selection onboarding screen. Each style should have: 1) A style name (e.g., 'Minimal · Timeless'), 2) A short tagline description (max 10 words), 3) Key characteristics. The styles should cover a diverse range appealing to fashion-conscious users aged 18-35. Consider styles like: Minimal/Timeless, Classic/Elegant, Streetwear/Urban, Bohemian/Free-spirit, Sporty/Athleisure, Edgy/Bold, Romantic/Feminine, Preppy/Smart-casual, Vintage/Retro, and Modern/Trendy. Output as a JSON array with fields: styleName, tagline, description, keywords. This will be used in a horizontal scrollable card UI similar to the reference design.`

## Chore Description

Define 10 comprehensive fashion style profiles for the OOTDay onboarding flow. Each style needs to be carefully researched and described to appeal to fashion-conscious women aged 18-35. The styles will be displayed in a horizontal carousel on the "What's your style?" onboarding screen.

Currently, the `OnboardingStyle.tsx` component has 10 style options with placeholder descriptions. This chore will:
1. Research each fashion style category
2. Create compelling, accurate descriptions
3. Define keywords for AI matching
4. Output structured JSON data
5. Ensure diversity across the 10 styles to appeal to different fashion personas

The output will be used to:
- Update the `styleOptions` array in `OnboardingStyle.tsx`
- Provide data for AI fashion recommendation matching
- Enable user style preference storage in `UserProfile`

## Relevant Files

- `frontend/components/onboarding/OnboardingStyle.tsx` - Contains current style options array that needs refined descriptions
- `frontend/lib/types/user-profile-types.ts` - Defines `StylePreference` interface
- `onboarding/5.1-5.10Onboarding-Style.png` - Design references showing the visual style card layout

### New Files
- `frontend/lib/data/fashion-styles.json` - New JSON file containing the 10 fashion style definitions (optional, can be kept in component)
- `specs/fashion-styles-output.json` - Output file with the final JSON array for reference

## Step by Step Tasks

### 1. Research Fashion Styles for Target Audience
- Research each of the 10 style categories for women aged 18-35
- Identify key visual characteristics, color palettes, and silhouettes
- Gather keywords associated with each style
- Ensure styles cover diverse range: minimalist, maximalist, casual, formal, etc.

### 2. Define Style Profiles
For each of the 10 styles, create:
- **styleName**: Two-part name (e.g., "Minimal · Timeless")
- **tagline**: Short description (max 10 words)
- **description**: Longer description (2-3 sentences, ~50-80 chars visible)
- **keywords**: Array of 5-8 keywords for AI matching

Styles to define:
1. Minimal · Timeless
2. Classic · Elegant (Old Money)
3. Streetwear · Urban
4. Bohemian · Free-spirit (Natural)
5. Sporty · Athleisure (Active)
6. Edgy · Bold (Trendy)
7. Romantic · Feminine
8. Business · Refined (Smart-casual)
9. Eccentric · Creative (Artistic)
10. Vanilla · Clean (Soft neutrals)

### 3. Create JSON Structure
- Format the output as a JSON array
- Follow this schema for each style:
```json
{
  "id": "minimal",
  "name": "Minimal",
  "description": "Timeless",
  "longDescription": "Less is more, clean, simple, neutral palette, pieces that last forever",
  "keywords": ["minimalist", "neutral", "timeless", "clean", "simple"],
  "imageUrl": "/images/styles/Group 31.png"
}
```

### 4. Save Output Files
- Create `specs/fashion-styles-output.json` with the complete JSON array
- Ensure JSON is properly formatted and valid
- Include all 10 styles in the array

### 5. Validate Style Definitions
- Verify each style has unique characteristics
- Ensure taglines are concise (max 10 words)
- Check that keywords are relevant and distinct per style
- Confirm coverage of diverse fashion personas
- Validate JSON syntax

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Validate JSON syntax
cat specs/fashion-styles-output.json | python3 -m json.tool

# Count number of styles (should be 10)
cat specs/fashion-styles-output.json | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Total styles: {len(data)}')"

# Verify all required fields exist
cat specs/fashion-styles-output.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
required = ['id', 'name', 'description', 'longDescription', 'keywords']
for i, style in enumerate(data):
    missing = [f for f in required if f not in style]
    if missing:
        print(f'Style {i+1} missing: {missing}')
    else:
        print(f'Style {i+1} ({style[\"name\"]}): ✓ All fields present')
"
```

## Notes

- The current `OnboardingStyle.tsx` has placeholder descriptions like "Less is more, clean, simple, neutral palette, pieces that last forever" which need to be enhanced
- Each style should have a distinct personality that resonates with different user segments
- Keywords will be used for AI-powered outfit matching, so they should be specific and relevant
- The "Mystery Style" option should remain fun and randomized
- Consider fashion trends for 2025-2026 when defining styles
- Ensure descriptions are gender-neutral in tone but tailored for women's fashion
- Style names follow the "Primary · Secondary" format (e.g., "Minimal · Timeless")
