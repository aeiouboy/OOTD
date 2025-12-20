# Chore: Fix Outfit Description Extraction for Image Generation

## Metadata
adw_id: `5d7ac321`
prompt: `Fix outfit description extraction for image generation. Currently the extracted description includes conversation history like 'ไปทำงานค่ะ งานค่ะ ชุดผู้หญิงหรือผู้ชายคะ?' instead of a clean description. Update the image generation flow in frontend/lib/chat-utils.ts or frontend/app/api/chat/route.ts to extract only the current user request context (occasion, style, gender) and format it as a proper outfit description for image generation, not raw conversation text.`

## Chore Description

The current implementation of the outfit description extraction for image generation is including raw conversation history text instead of creating a clean, structured outfit description. When users request to see an outfit visualization, the system is capturing clarifying questions and conversational snippets like "ไปทำงานค่ะ งานค่ะ ชุดผู้หญิงหรือผู้ชายคะ?" instead of extracting meaningful outfit context.

**Problem:**
- `extractOutfitDescription()` in `frontend/lib/utils/image-trigger-detector.ts` is using regex pattern matching to extract fragments from conversation history
- This approach captures raw conversational text including questions and incomplete phrases
- The resulting description is not suitable for generating accurate outfit visualizations

**Solution:**
- Refactor outfit description extraction to use structured data from the session context
- Extract actual outfit metadata: occasion, gender, style preferences, budget
- Build a clean, descriptive prompt for image generation based on recommended products
- Ensure the description focuses on the outfit characteristics, not conversation snippets

**Impact:**
- Better image generation quality with accurate outfit descriptions
- More relevant visualizations that match user expectations
- Cleaner prompt engineering for the image generation model

## Relevant Files

### Existing Files (Read and Modify)

- **frontend/lib/utils/image-trigger-detector.ts** (lines 101-186)
  - Contains `extractOutfitDescription()` function that needs refactoring
  - Currently uses regex pattern matching on conversation history
  - Needs to be rewritten to use structured data instead

- **frontend/lib/services/ai-chat-service.ts** (lines 311-334)
  - Calls `extractOutfitDescription()` when image request is detected
  - Passes conversation history to the extraction function
  - May need to pass additional context (session data, occasion, products)

- **frontend/app/api/chat/route.ts** (lines 84-129)
  - Chat API route that returns `outfitDescription` to the client
  - Has access to recommended products, occasion, and user preferences
  - Should be involved in building the outfit description

- **frontend/lib/types/chat-types.ts** (if exists)
  - May need to check if session context includes sufficient metadata
  - Verify what data is available for building outfit descriptions

### Files to Investigate

- **frontend/lib/utils/session-context.ts**
  - Check what conversation metadata is stored in session context
  - Verify if occasion, gender, style preferences are tracked

- **frontend/lib/types/product-types.ts**
  - Understand product data structure
  - Check what outfit metadata is available from recommended products

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Investigate Current Data Structures
- Read `frontend/lib/types/chat-types.ts` to understand SessionContext structure
- Read `frontend/lib/utils/session-context.ts` to see what metadata is tracked
- Read `frontend/lib/types/product-types.ts` to understand product data
- Document what structured data is available for outfit description generation
- Identify gaps in available metadata

### 2. Refactor `extractOutfitDescription()` Function
- Open `frontend/lib/utils/image-trigger-detector.ts`
- Update the `extractOutfitDescription()` function signature to accept structured data:
  - Add parameters for: occasion, gender, recommendedProducts, userPreferences
  - Keep conversationHistory as optional fallback
- Rewrite the extraction logic:
  - Build description from structured metadata first (occasion, gender, style)
  - Use product data to describe outfit characteristics (colors, styles, formality)
  - Only use conversation history for missing context, not as primary source
  - Format output as a clean, descriptive sentence suitable for image generation
- Add JSDoc comments explaining the new approach
- Update the return type validation

### 3. Update AI Chat Service Integration
- Open `frontend/lib/services/ai-chat-service.ts`
- Locate the image request handling block (lines 311-334)
- Update the call to `extractOutfitDescription()` to pass structured data:
  - Pass detected occasion from `detectOccasion(request.message)`
  - Pass user preferences from `request.userPreferences`
  - Pass session context metadata (gender, occasion from stored context)
  - Pass conversation history as fallback
- Ensure the outfitDescription uses structured data, not raw conversation

### 4. Enhance Outfit Description in Chat API Route
- Open `frontend/app/api/chat/route.ts`
- Review how `outfitDescription` is set in the response (line 128)
- Consider building the description at the API level where we have access to:
  - Recommended products with full metadata
  - Detected occasion
  - User preferences
  - Session context
- If beneficial, create outfit description here and pass it to chat service
- Ensure consistency between API route and service layer

### 5. Create Utility Function for Structured Outfit Description
- Create a new utility function `buildOutfitDescription()` in `frontend/lib/utils/image-trigger-detector.ts`
- Function signature: `buildOutfitDescription(occasion, gender, products, userPreferences): string`
- Implementation:
  - Build description from occasion (e.g., "work outfit", "casual weekend look")
  - Add gender context (e.g., "for women", "for men")
  - Extract style characteristics from products (colors, formality level)
  - Include key pieces from recommended products (e.g., "white shirt, black pants")
  - Format as natural language suitable for image generation
  - Return clean, 1-2 sentence description
- Add unit tests or examples in comments

### 6. Update Type Definitions
- Open `frontend/lib/types/image-types.ts` (if exists) or create if needed
- Add interface for `OutfitDescriptionContext`:
  - occasion?: string
  - gender?: 'men' | 'women' | 'unisex'
  - products?: EnhancedProduct[]
  - userPreferences?: object
  - conversationHistory?: ConversationMessage[]
- Export the interface
- Update function signatures to use this interface

### 7. Validate and Test the Changes
- Test the updated extraction logic with sample data:
  - Occasion: "work", Gender: "women", Products: typical work outfit items
  - Expected: "Professional work outfit for women with white blouse and black trousers"
- Check that conversation snippets are no longer included
- Verify that structured metadata takes priority over conversation text
- Test edge cases: missing occasion, missing gender, no products
- Ensure fallback behavior is graceful

### 8. Update Documentation and Comments
- Add comments explaining the new structured approach in `extractOutfitDescription()`
- Document the expected input format in JSDoc
- Add usage examples in comments
- Update any related documentation about image generation flow

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && npm run type-check` - Verify TypeScript types are correct
- `cd frontend && npm run lint` - Check for linting errors
- `cd frontend && npm run build` - Ensure the build succeeds
- Manual test: Trigger image generation in the chat UI and check console logs for the generated outfit description
- Manual test: Verify the outfit description does NOT include conversation snippets like "ไปทำงานค่ะ งานค่ะ"
- Manual test: Verify the outfit description DOES include structured data like occasion, gender, and product characteristics

## Notes

### Current Implementation Issues
The current regex-based approach in `extractOutfitDescription()` (lines 118-168) captures Thai conversation fragments:
- Pattern `/ไป[^\s,.]*/g` captures "ไปทำงาน" but also captures questions like "ไปทำงานค่ะ"
- Pattern `/งาน[^\s,.]*/g` captures "งาน" but also "งานค่ะ" from clarifying questions
- These patterns cannot distinguish between user intent and assistant questions

### Proposed Structured Approach
Instead of regex on conversation text, use structured data:
1. Session context already tracks occasion, gender, budget (see `session-context.ts`)
2. Recommended products have full metadata: category, style, colors, formality
3. User preferences object contains style and color preferences

### Example Transformation
**Current (broken):**
- Input: Conversation history with "ไปทำงานค่ะ งานค่ะ ชุดผู้หญิงหรือผู้ชายคะ?"
- Output: "ไปทำงาน งานค่ะ ชุดผู้หญิง" (nonsensical fragments)

**Proposed (fixed):**
- Input: { occasion: 'work', gender: 'women', products: [white blouse, black pants] }
- Output: "Professional work outfit for women featuring a white blouse and black trousers"

### Integration Points
- The fix should integrate seamlessly with existing Customer Journey Step 4 (Looks Inspiration)
- Image generation API at `frontend/app/api/generate-image/route.ts` expects clean descriptions
- LooksInspiration component displays the description alongside the generated image
- Session context management (v2.0) already tracks necessary metadata
