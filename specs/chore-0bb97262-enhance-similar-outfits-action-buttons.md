# Chore: Enhance Similar Outfits Cards with Action Buttons

## Metadata
adw_id: `0bb97262`
prompt: `Enhance Similar Outfits cards in SimilarOutfits.tsx to match the chat OutfitRecommendationCard.tsx design with action buttons. Changes needed:

  1. **Add item count display**: Show 'X ชิ้น' (X items) below the title, similar to OutfitRecommendationCard line 207-209.

  2. **Add action buttons row** at bottom of each card with 4 buttons:
     - 'ดูลุค' button with Eye icon - calls existing onSelect(outfit) to view outfit detail
     - 'ลองใส่' button with Shirt icon - opens try-on modal (integrate with fitting-model-service)
     - Heart icon button - toggle like state (local state for now)
     - Share icon button - placeholder for share functionality

  3. **Integrate Try-On Modal**: Import and use the Dialog components and implement handleTryOn similar to OutfitRecommendationCard.tsx lines 67-116. Use generateTryOnLooks from fitting-model-service.ts with user's fittingModelUrl from useUserProfile hook.

  4. **Update card layout**:
     - Keep existing image section with AI flat-lay generation
     - Add item count: '{outfit.items.length} ชิ้น'
     - Add action buttons row using flex layout with gap-1.5
     - Use Button component with size='sm' variant='ghost'
     - Import icons: Eye, Shirt, Heart, Share2, Loader2, RefreshCw, AlertCircle from lucide-react

  5. **Reference files**:
     - OutfitRecommendationCard.tsx for action buttons design (lines 216-260) and try-on modal (lines 264-350)
     - fitting-model-service.ts for generateTryOnLooks function
     - useUserProfile hook for getting user's fittingModelUrl

  6. **Styling**: Match the compact card style - use smaller buttons (h-8, text-xs) appropriate for the 2-column grid layout.`

## Chore Description
Enhance the SimilarOutfitCard component in `SimilarOutfits.tsx` to match the design and functionality of `OutfitRecommendationCard.tsx`. Currently, the SimilarOutfitCard only displays an image, title, and price. This chore adds:

1. **Item count display** - Show the number of items in the outfit (e.g., "3 ชิ้น")
2. **Action buttons row** - Four interactive buttons matching OutfitRecommendationCard:
   - "ดูลุค" (View Look) - Opens outfit detail view
   - "ลองใส่" (Try On) - Generates AI try-on image on user's fitting model
   - Heart button - Toggle like/favorite state
   - Share button - Placeholder for future share functionality
3. **Try-On Modal** - Full integration with fitting-model-service for AI-powered virtual try-on

## Relevant Files
Use these files to complete the chore:

- **apps/web/components/outfit/SimilarOutfits.tsx** - Main file to modify. Contains `SimilarOutfitCard` component (lines 24-136) and `SimilarOutfits` wrapper component (lines 142-165).

- **apps/web/components/chat/OutfitRecommendationCard.tsx** - Reference for action buttons design (lines 216-260) and try-on modal implementation (lines 264-350). Copy the pattern for handleTryOn (lines 67-116) and handleRegenerate (lines 121-163).

- **apps/web/lib/services/fitting-model-service.ts** - Provides `generateTryOnLooks` function for try-on image generation. The function accepts `TryOnLooksRequest` interface with fittingModelImageUrl, outfitItems, outfitTitle, and optional flatLayImageUrl/flatLayImageBase64.

- **apps/web/lib/hooks/useUserProfile.ts** - Hook to access user profile including `fittingModelUrl` needed for try-on generation.

- **apps/web/lib/types.ts** - Contains `Outfit` and `Product` interfaces. Outfit has `items`, `title`, `totalPrice`, `flatLayImageUrl`, `flatLayImageBase64`, `tryOnImageUrl`, `tryOnImageBase64` properties.

- **apps/web/components/ui/button.tsx** - Button component with `size='sm'` and `variant='ghost'` variants.

- **apps/web/components/ui/dialog.tsx** - Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription components for the try-on modal.

### New Files
No new files needed - all changes are within existing SimilarOutfits.tsx.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Required Imports
- Add `{ useState, useCallback }` to the React import (line 3)
- Import `Button` from `@/components/ui/button`
- Import `Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription` from `@/components/ui/dialog`
- Import `useUserProfile` from `@/lib/hooks/useUserProfile`
- Import `generateTryOnLooks` from `@/lib/services/fitting-model-service`
- Import icons from lucide-react: `Eye, Shirt, Heart, Share2, Loader2, RefreshCw, AlertCircle`

### 2. Add State Variables to SimilarOutfitCard
- Add `isLiked` state with `useState(false)` for like button toggle
- Add `showTryOnModal` state with `useState(false)` for modal visibility
- Add `isGeneratingTryOn` state with `useState(false)` for loading state
- Add `tryOnImageUrl` state with `useState<string | undefined>(undefined)`
- Add `tryOnImageBase64` state with `useState<string | undefined>(undefined)`
- Add `tryOnError` state with `useState<string | undefined>(undefined)`
- Call `useUserProfile()` hook to get `profile`
- Derive `hasFittingModel` from `!!profile?.fittingModelUrl`

### 3. Implement handleTryOn Function
- Use `useCallback` to memoize the function
- If `tryOnImage` exists, just open modal and return
- Check if user has fitting model, show error message if not
- Set loading state and clear error
- Open modal immediately
- Build `outfitItems` array from `outfit.items` with name, category, color
- Call `generateTryOnLooks` with fittingModelImageUrl, outfitItems, outfitTitle, and flat-lay images
- Handle success: set tryOnImageUrl and tryOnImageBase64
- Handle error: set tryOnError with message
- Clear loading state in finally block

### 4. Implement handleRegenerate Function
- Clear existing try-on image states
- Set loading state
- Check for fitting model URL
- Call `generateTryOnLooks` with same parameters
- Handle success/error same as handleTryOn

### 5. Update Card Content Layout
- After the price paragraph (line 130-132), add item count: `<p className="text-xs text-muted-foreground">{outfit.items.length} ชิ้น</p>`
- Wrap title, item count, and price in a container div with `space-y-0.5` or similar
- Add action buttons row after price using flex layout with `gap-1`

### 6. Add Action Buttons Row
- Create container div with `className="flex items-center gap-1 mt-1.5"`
- Add "ดูลุค" button:
  - `size="sm" variant="ghost"`
  - `className="flex-1 h-7 text-xs gap-0.5 px-1"`
  - `onClick={(e) => { e.stopPropagation(); onSelect(outfit); }}`
  - Eye icon with `className="w-3 h-3"`
- Add "ลองใส่" button:
  - `size="sm" variant="ghost"`
  - `className="h-7 px-1.5 text-xs gap-0.5"`
  - `onClick={(e) => { e.stopPropagation(); handleTryOn(); }}`
  - `disabled={isGeneratingTryOn}`
  - Show Loader2 with spin animation when generating, Shirt icon otherwise
- Add Heart button:
  - `size="sm" variant="ghost"`
  - `className="h-7 w-7 p-0"`
  - `onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}`
  - Heart icon with conditional fill/color classes for liked state
- Add Share button:
  - `size="sm" variant="ghost"`
  - `className="h-7 w-7 p-0"`
  - `onClick={(e) => e.stopPropagation()}`
  - Share2 icon

### 7. Add Try-On Modal
- Add Dialog component after the Card component closing tag
- Set `open={showTryOnModal}` and `onOpenChange={setShowTryOnModal}`
- Add DialogContent with `className="max-w-md mx-auto"`
- Add DialogHeader with DialogTitle showing outfit title with Shirt icon
- Add DialogDescription with "ดูชุดนี้บนโมเดลของคุณ"
- Add image area div with `className="relative w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden"`
- Show loading state with Skeleton and Loader2 when `isGeneratingTryOn`
- Show error state with AlertCircle and error message when `tryOnError`
- Show try-on image with Image component when available
- Add action buttons: regenerate button (when image exists), close button

### 8. Update Card Click Behavior
- Remove onClick from Card component (since we now have specific action buttons)
- Or keep onClick for backward compatibility but ensure action buttons use `e.stopPropagation()`

### 9. Wrap Return Statement with Fragment
- Since we're returning both Card and Dialog, wrap the return in a React Fragment `<>...</>`

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm lint` - Ensure no linting errors
- `cd apps/web && pnpm build` - Ensure TypeScript compilation succeeds
- `cd apps/web && pnpm dev` - Run dev server and manually test:
  1. Navigate to outfit detail page with similar outfits
  2. Verify each card shows item count "X ชิ้น" below title
  3. Verify action buttons row appears at bottom of each card
  4. Test "ดูลุค" button opens outfit detail
  5. Test "ลองใส่" button opens try-on modal and generates image (requires fitting model)
  6. Test heart button toggles liked state
  7. Test share button is clickable (no action yet)
  8. Verify modal can be closed and regenerate button works

## Notes
- The SimilarOutfitCard is displayed in a 2-column grid, so button sizes should be compact (h-7 instead of h-8, smaller text)
- Use `e.stopPropagation()` on all button clicks to prevent triggering card click
- The try-on generation requires user to have completed onboarding with a fitting model photo
- Error handling should match OutfitRecommendationCard behavior for consistency
- Consider adding useEffect to sync tryOnImageUrl/tryOnImageBase64 if outfit prop changes (similar to OutfitRecommendationCard lines 55-62)
