# Chore: Fix outfit try-on alignment issue

## Metadata
adw_id: `715c7f14`
prompt: `Fix outfit try-on alignment issue where the model fitting image does not match the flat-lay outfit recommendation`

## Chore Description
When a user clicks the "ลองใส่" (try-on) button on a flat-lay outfit recommendation in the SimilarOutfits grid, the generated model try-on image shows a DIFFERENT outfit than the one displayed in the flat-lay.

**Example from user report:**
- Flat-lay 1: Navy blue top + black wide-leg pants + heels (฿7,700)
- Flat-lay 2: Black suit/blazer + black pants (฿5,796)
- But try-on images are SWAPPED or show wrong outfit combinations

**Root Cause Analysis:**

After reviewing the code flow, the issue is in how flat-lay images are passed to the try-on generation. The `SimilarOutfitCard` component in `SimilarOutfits.tsx` has two sources of flat-lay images:

1. **Pre-existing flat-lay** (from `outfit.flatLayImageUrl` or `outfit.flatLayImageBase64`) - This is passed correctly to `generateTryOnLooks()`
2. **Dynamically generated flat-lay** (from `useFlatLayGeneration` hook storing in `flatLayImageBase64`) - This is **NOT** passed to `generateTryOnLooks()`

The bug occurs because when the intersection observer triggers flat-lay generation, the generated image is stored in the hook's `flatLayImageBase64` state, but this is **never synchronized** with the outfit object's `flatLayImageBase64` property. When `handleTryOn()` is called, it reads `outfit.flatLayImageUrl` and `outfit.flatLayImageBase64` from the **original outfit prop**, which are undefined if the flat-lay was just generated dynamically.

**Critical Data Flow Issue:**
```
SimilarOutfitCard:
├── useFlatLayGeneration hook → stores generated image in hook state
├── displayImage = existingFlatLay || flatLayImageBase64 (from hook)  ← DISPLAYS correctly
├── handleTryOn() → calls generateTryOnLooks({
│     flatLayImageUrl: outfit.flatLayImageUrl,      ← NULL (not from hook!)
│     flatLayImageBase64: outfit.flatLayImageBase64 ← NULL (not from hook!)
│   })
└── Result: try-on generates WITHOUT the flat-lay reference, causing wrong outfit
```

**Expected Data Flow (after fix):**
```
SimilarOutfitCard:
├── useFlatLayGeneration hook → stores generated image in hook state
├── displayImage = existingFlatLay || flatLayImageBase64 (from hook)  ← DISPLAYS correctly
├── handleTryOn() → calls generateTryOnLooks({
│     flatLayImageUrl: outfit.flatLayImageUrl,
│     flatLayImageBase64: outfit.flatLayImageBase64 || flatLayImageBase64 (from hook!)
│   })
└── Result: try-on generates WITH the correct flat-lay reference
```

## Relevant Files
Use these files to complete the chore:

### Primary Fix Location
- **apps/web/components/outfit/SimilarOutfits.tsx** (lines 91-140, 145-187)
  - Contains `SimilarOutfitCard` component with the `handleTryOn()` and `handleRegenerate()` functions
  - The flat-lay image from `useFlatLayGeneration` hook is stored in `flatLayImageBase64` but not passed to try-on generation
  - Fix needed: Pass `flatLayImageBase64` from hook state to `generateTryOnLooks()` when `outfit.flatLayImageBase64` is undefined

### Supporting Files (No changes expected)
- **apps/web/lib/services/fitting-model-service.ts** (lines 332-450)
  - Contains `generateTryOnLooks()` function that receives the flat-lay image
  - Already correctly handles `flatLayImageUrl` and `flatLayImageBase64` parameters
  - No changes needed - the function is correct, it just receives wrong data

- **apps/web/lib/types.ts** (lines 30-55)
  - Contains `Outfit` interface with `flatLayImageUrl`, `flatLayImageBase64`, `tryOnImageUrl`, `tryOnImageBase64` properties
  - No changes needed - type definitions are correct

- **apps/web/lib/hooks/useFlatLayGeneration.ts**
  - Contains `useFlatLayGeneration` hook that generates and stores flat-lay images
  - Returns `flatLayImageBase64` which needs to be used in try-on

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Understand the Current Bug
- Read `SimilarOutfits.tsx` lines 91-140 to understand `handleTryOn()` function
- Confirm that `outfit.flatLayImageUrl` and `outfit.flatLayImageBase64` are passed to `generateTryOnLooks()`
- Verify that `flatLayImageBase64` from the `useFlatLayGeneration` hook is NOT being passed

### 2. Fix handleTryOn Function
- In `SimilarOutfits.tsx`, modify the `handleTryOn` function (around line 119-125)
- Change from:
  ```typescript
  const result = await generateTryOnLooks({
    fittingModelImageUrl: profile.fittingModelUrl,
    outfitItems,
    outfitTitle: outfit.title,
    flatLayImageUrl: outfit.flatLayImageUrl,
    flatLayImageBase64: outfit.flatLayImageBase64,
  })
  ```
- Change to:
  ```typescript
  const result = await generateTryOnLooks({
    fittingModelImageUrl: profile.fittingModelUrl,
    outfitItems,
    outfitTitle: outfit.title,
    flatLayImageUrl: outfit.flatLayImageUrl,
    flatLayImageBase64: outfit.flatLayImageBase64 || flatLayImageBase64,
  })
  ```
- The change adds `|| flatLayImageBase64` to use the hook-generated image when the outfit prop doesn't have one

### 3. Fix handleRegenerate Function
- In `SimilarOutfits.tsx`, apply the same fix to `handleRegenerate` function (around line 165-172)
- Change from:
  ```typescript
  const result = await generateTryOnLooks({
    fittingModelImageUrl: profile.fittingModelUrl,
    outfitItems,
    outfitTitle: outfit.title,
    flatLayImageUrl: outfit.flatLayImageUrl,
    flatLayImageBase64: outfit.flatLayImageBase64,
  })
  ```
- Change to:
  ```typescript
  const result = await generateTryOnLooks({
    fittingModelImageUrl: profile.fittingModelUrl,
    outfitItems,
    outfitTitle: outfit.title,
    flatLayImageUrl: outfit.flatLayImageUrl,
    flatLayImageBase64: outfit.flatLayImageBase64 || flatLayImageBase64,
  })
  ```

### 4. Add Debug Logging (Optional)
- Add console.log statements to verify the correct flat-lay image is being passed:
  ```typescript
  console.log('[TryOn] Using flat-lay image:', {
    fromOutfitUrl: !!outfit.flatLayImageUrl,
    fromOutfitBase64: !!outfit.flatLayImageBase64,
    fromHook: !!flatLayImageBase64,
    finalSource: outfit.flatLayImageUrl ? 'outfit.url' : outfit.flatLayImageBase64 ? 'outfit.base64' : flatLayImageBase64 ? 'hook' : 'none'
  })
  ```

### 5. Validate the Fix
- Run development server: `cd apps/web && pnpm dev`
- Run TypeScript check: `cd apps/web && pnpm tsc --noEmit`
- Test manually:
  1. Navigate to outfit detail page with similar outfits
  2. Wait for flat-lay images to generate for similar outfits
  3. Click "ลองใส่" on a similar outfit
  4. Verify the try-on image shows the SAME outfit as the flat-lay

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm tsc --noEmit` - Verify TypeScript compiles without errors
- `cd apps/web && pnpm lint` - Verify code passes linting
- `cd apps/web && pnpm dev` - Start development server for manual testing

## Notes

### Why This Bug Occurs
The `useFlatLayGeneration` hook is designed for lazy-loading flat-lay images when cards scroll into view. It stores the generated image in its internal state (`flatLayImageBase64`), which is used for display purposes. However, this state is not automatically merged back into the `outfit` object prop, so when `handleTryOn()` reads from `outfit.flatLayImageBase64`, it gets `undefined` for dynamically-generated flat-lays.

### Impact
- Similar outfits that had their flat-lay images generated dynamically will have incorrect try-on results
- Outfits that came with pre-existing `flatLayImageUrl` or `flatLayImageBase64` (e.g., from main outfit recommendations) work correctly
- This explains why some try-on images match and others don't

### Alternative Approaches Considered
1. **Merge hook state into outfit object** - More invasive, requires lifting state up
2. **Use a ref to track the latest flat-lay image** - Adds complexity
3. **Pass hook state directly to try-on function** - **Chosen approach** - Minimal change, directly fixes the issue

### Testing Checklist
- [ ] Try-on for outfit with pre-existing `flatLayImageUrl` still works
- [ ] Try-on for outfit with dynamically-generated flat-lay shows correct outfit
- [ ] Regenerate try-on uses the same flat-lay reference
- [ ] No TypeScript errors
- [ ] No lint warnings introduced
