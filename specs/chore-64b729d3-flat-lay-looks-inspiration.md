# Chore: Implement Flat-Lay Looks Inspiration

## Metadata
adw_id: `64b729d3`
prompt: `Implement flat-lay Looks Inspiration that displays recommended fashion items from OOTDay Stylist chat session. When OOTDay Stylist recommends an outfit (e.g., 'Dress และ Leather Oxford Shoes'), the Looks Inspiration should generate a flat-lay image showing those EXACT recommended items individually placed and separated on a white background.`

## Chore Description
This chore implements a flat-lay image generation feature for the OOTDay Stylist chat interface. When the AI recommends an outfit (e.g., "Dress + Leather Oxford Shoes"), the system will generate a flat-lay style image showing all recommended items individually placed and separated on a white background, allowing users to visualize the complete look before clicking 'ดูลุค' for item details.

**Key Changes:**
1. Add `generateFlatLayImage()` method to `image-generation-service.ts` that builds prompts specifically for flat-lay composition
2. Update `LooksInspiration.tsx` to support 1:1 square aspect ratio with "LOOKs" header styling
3. Add new `FlatLayRequest` type with recommended items structure
4. Integrate flat-lay generation in `ChatAssistant.tsx` after outfit recommendations

**Example Flow:**
1. User: "อยากได้ชุดไปทำงาน"
2. OOTDay Stylist recommends: Dress + Leather Oxford Shoes (3 ชิ้น, ฿6,670)
3. System generates flat-lay image with those exact items laid out elegantly
4. User sees complete look visualization in chat

## Relevant Files
Use these files to complete the chore:

- **apps/web/lib/services/image-generation-service.ts** - Add `generateFlatLayImage()` method that creates flat-lay specific prompts using the pattern from `data/personas/prompt_gen/looks.md`
- **apps/web/lib/types/image-types.ts** - Add `FlatLayRequest` interface and `FlatLayItem` type for recommended product items
- **apps/web/components/chat/LooksInspiration.tsx** - Update to support 1:1 aspect ratio, add "LOOKs" header with subtitle, accept `recommendedItems` prop
- **apps/web/components/chat/ChatAssistant.tsx** - Integrate flat-lay generation after outfit recommendations, extract recommended items from response
- **apps/web/app/api/generate-image/route.ts** - Add support for `flat-lay` generation type
- **data/personas/prompt_gen/looks.md** - Reference for flat-lay prompt format (read-only)
- **apps/web/lib/types.ts** - Reference for `ChatMessage` and `Product` types (may need extension)

### New Files
- None required (all modifications to existing files)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add FlatLayRequest Type to image-types.ts
- Add `FlatLayItem` interface with properties:
  - `name: string` - Product name
  - `category: string` - Product category (e.g., 'Dress', 'Shoes')
  - `color?: string` - Product color for prompt accuracy
  - `visualDescription?: string` - Optional detailed visual description
- Add `FlatLayRequest` interface with properties:
  - `items: FlatLayItem[]` - Array of recommended products
  - `totalItems?: number` - Total item count for display
  - `occasionContext?: string` - Optional occasion context (e.g., 'work outfit')
- Extend `LooksInspirationProps` with:
  - `displayMode?: 'portrait' | 'flat-lay'` - Layout mode (default: 'portrait')
  - `recommendedItems?: FlatLayItem[]` - Items to display in flat-lay mode
  - `headerTitle?: string` - Optional custom header title

### 2. Add generateFlatLayImage Method to image-generation-service.ts
- Add new method `generateFlatLayImage(request: FlatLayRequest): Promise<ImageGenerationResponse>` to `OpenRouterImageClient` class
- Build prompt using the looks.md format:
  ```
  Generate an accurate flat-lay fashion image with the following items individually placed and separated, styled in an elegant composition on a white background:
  - [Item 1: e.g., Navy blue button-front dress]
  - [Item 2: e.g., Black leather oxford shoes]
  - [Item 3: e.g., Brown leather handbag]
  Each item should be clearly visible and properly sized relative to each other.
  ```
- Include each recommended item explicitly in the prompt list
- Set image composition style to 'flat-lay' automatically
- Add method `buildFlatLayPrompt(items: FlatLayItem[], occasionContext?: string): string` as private helper

### 3. Update LooksInspiration.tsx Component
- Add conditional aspect ratio: use `aspect-square` (1:1) when `displayMode === 'flat-lay'`, keep `aspect-[3/4]` for portrait mode
- Add "LOOKs" header section with:
  - Title: "LOOKs" in bold
  - Subtitle: "Outfit Inspiration by OOTDay"
  - Item count badge: "{n} ชิ้น" showing number of items
- Update props to accept `recommendedItems`, `displayMode`, and `headerTitle`
- Update zoom dialog to use same aspect ratio based on displayMode
- Maintain existing portrait mode as default for backward compatibility

### 4. Update API Route for Flat-Lay Generation
- Add `'flat-lay'` to the `generationType` union type in image-types.ts
- Update route.ts POST handler to check for `generationType === 'flat-lay'`
- When flat-lay type detected, extract `items` array from request body
- Call `imageClient.generateFlatLayImage()` with the items array
- Keep existing outfit and fitting-model generation paths unchanged

### 5. Integrate Flat-Lay in ChatAssistant.tsx
- After receiving outfit recommendation from API (`data.outfits`), extract product items
- Create `FlatLayItem[]` from outfit items: map product name, category, color, visualDescription
- When `data.imageRequest` is true AND `data.outfits` contains items:
  - Build flat-lay request with extracted items
  - Call `/api/generate-image` with `generationType: 'flat-lay'` and `items` array
  - Pass `displayMode: 'flat-lay'` and `recommendedItems` to the image message
- Update the image message creation to include `displayMode` and `recommendedItems`
- Update fallback/mock response handling similarly

### 6. Extend ChatMessage Type
- Add optional properties to `ChatMessage` interface in `apps/web/lib/types.ts`:
  - `displayMode?: 'portrait' | 'flat-lay'` - Image display mode
  - `recommendedItems?: FlatLayItem[]` - For flat-lay item display
- Import `FlatLayItem` type from image-types.ts

### 7. Update ChatMessage Component to Pass Display Mode
- In `ChatMessage.tsx` (if exists) or in `ChatAssistant.tsx` message rendering:
  - Pass `displayMode` and `recommendedItems` to `LooksInspiration` component
  - When message has `imageUrl` or `imageBase64` with `displayMode === 'flat-lay'`:
    - Render `LooksInspiration` with flat-lay props

### 8. Validate and Test
- Run TypeScript compilation to check for type errors
- Run linting to check for code style issues
- Manually test the flow:
  1. Start dev server
  2. Ask for outfit recommendation
  3. Verify flat-lay image is generated with correct items
  4. Check 1:1 aspect ratio and "LOOKs" header display

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm tsc --noEmit` - Verify TypeScript compilation passes
- `cd apps/web && pnpm lint` - Verify linting passes
- `cd apps/web && pnpm build` - Verify production build works
- Manual test: Start dev server with `cd apps/web && pnpm dev`, then test chat flow

## Notes
- The flat-lay prompt format is based on `data/personas/prompt_gen/looks.md` which specifies: "Put it as an accurate flat-lay image with each item individually placed and separated, styled in an elegant composition on a white background."
- Existing portrait mode (3:4 aspect ratio) should remain the default for backward compatibility
- The "LOOKs" header design should match the expected result showing a clean, modern header with item count
- Consider adding error handling if flat-lay generation fails - fall back to portrait mode
- The implementation should handle cases where outfits have 1-5 items gracefully
