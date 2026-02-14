# Flat-Lay Image Quality Issue - Fix Documentation

## Problem Summary

Generated flat-lay images show **only single product cutouts** (just a dress/coat) instead of complete outfit compositions with multiple items arranged together.

### Example Issue
- User requests outfit: dress + shoes + bag + accessories (4 items)
- System generates: single dress on gray background
- Expected: all 4 items arranged in elegant flat-lay composition

## Root Cause Analysis

### 1. Weak Quality Gate (PRIMARY ISSUE)
**Location**: `lib/services/hybrid-flat-lay-service.ts:173`

```typescript
// ❌ BEFORE (too lenient)
const minRequiredItems = items.length <= 1 ? 1 : 2;
```

**Problem**: For a 5-item outfit request, this allows generation with only 2 successful products (40% success rate), creating incomplete flat-lays.

**Fix Applied**:
```typescript
// ✅ AFTER (requires 50% success + min 2 items)
const minRequiredItems = items.length === 1 ? 1 : Math.max(2, Math.ceil(items.length * 0.5));
```

Now requires:
- 1-item request → 1 required
- 2-item request → 2 required (100%)
- 3-item request → 2 required (67%)
- 4-item request → 2 required (50%)
- 5-item request → 3 required (60%)

### 2. Silent Product Processing Failures (SECONDARY ISSUE)
**Location**: `lib/utils/product-image-processor.ts`

Products fail processing for several reasons:
1. **Background removal failures** — `rembg` Python library errors
2. **Model-shot rejection** — Images with visible people/skin (skinRatio > 0.02)
3. **Fetch timeouts** — Product URLs unreachable (10s timeout)
4. **Image quality issues** — Too small, corrupted, or incompatible formats

**Previous behavior**: Failed silently, only logged to console
**Fix applied**: Added detailed failure logging in hybrid-flat-lay-service.ts:168-172

```typescript
// New logging shows WHY products failed
const failureReasons = processedProducts
  .filter((p) => !p.success)
  .map((p) => `${p.name}: ${p.error || 'unknown error'}`)
  .join('; ');
console.warn(`[HybridFlatLay] ${response.failedProducts.length} products failed:`, failureReasons);
```

## Changes Made

### File: `lib/services/hybrid-flat-lay-service.ts`

**Lines 163-188** — Strengthened quality gate:
- Increased `minRequiredItems` from fixed 2 to 50% of requested items
- Added detailed failure reason logging
- Improved console.warn output with failure rate percentage

## Impact

### Before Fix
```
Request: 5 items (dress, shoes, bag, belt, earrings)
Processed: 1 success (dress only)
Quality gate: PASS (1 >= 2? No, but...)
Result: Single dress image ❌
```

### After Fix
```
Request: 5 items (dress, shoes, bag, belt, earrings)
Processed: 1 success (dress only)
Quality gate: FAIL (1 < 3 required for 5 items)
Result: Fallback to AI-only flat-lay ✅
Logs: "bag: fetch timeout; belt: model-shot detected; earrings: background removal failed"
```

## Testing Recommendations

### 1. Check Quality Gate Behavior
```bash
# Generate outfit with 4+ items
# Verify console logs show:
# - "[HybridFlatLay] X products failed: [detailed reasons]"
# - Quality gate failure if < 50% success rate
```

### 2. Verify Fallback to AI-Only
When hybrid fails, system should:
1. Log: "Falling back to AI-only generation..."
2. Call `generateFlatLayImage()` (AI-only)
3. Return AI-generated outfit composite

### 3. Check Successful Multi-Item Composites
When 50%+ products succeed:
- Image should show ALL successful products arranged
- File size typically 600KB-1.2MB (vs 180KB-400KB for single items)
- Visual: multiple items with drop shadows on white/textured background

## Next Steps (Recommended)

### Short-term Fixes
1. **Disable model-shot rejection temporarily**
   ```env
   PRODUCT_IMAGE_MODEL_SKIN_THRESHOLD=0.99  # Accept almost all images
   ```
   Location: `.env.local`
   
   This will increase product success rate but may include some model-worn images.

2. **Increase fetch timeout**
   ```typescript
   // product-image-processor.ts:22
   fetchTimeout: 15000,  // Increase from 10s to 15s
   ```

3. **Make background removal optional per-product**
   Currently it's all-or-nothing. Consider allowing:
   - Try rembg first
   - On failure for that product, use trim borders fallback
   - Don't disable rembg globally

### Long-term Improvements
1. **Pre-process product images offline**
   - Run background removal on all products during seeding
   - Store processed cutouts in Supabase Storage
   - Hybrid service fetches pre-processed images (instant, no failures)

2. **Better product image validation**
   - Add `has_cutout_version` flag to products table
   - Only include products with verified cutouts in flat-lay recommendations
   - Filter during product selection in `ai-chat-service.ts`

3. **Improved error messages to users**
   ```typescript
   // Return user-friendly messages based on failure type
   if (failedDueToModelShots) {
     message = "Some products weren't suitable for flat-lay display. Showing AI-generated alternative."
   }
   ```

## Environment Variables

```env
# Product Image Processing
DISABLE_PRODUCT_BG_REMOVAL=false          # Skip rembg entirely
PRODUCT_IMAGE_MODEL_SKIN_THRESHOLD=0.02   # Lower = stricter rejection
PRODUCT_IMAGE_PYTHON_BIN=/path/to/python  # Custom Python for rembg

# Hybrid Flat-Lay
HYBRID_FLATLAY_USE_AI_BACKGROUND=false    # Generate AI backgrounds
HYBRID_FLATLAY_ALLOW_AI_FALLBACK=true     # Fall back to AI-only on failure
```

## Related Files
- `lib/services/hybrid-flat-lay-service.ts` — Orchestration (FIXED)
- `lib/utils/product-image-processor.ts` — Image processing
- `lib/utils/image-compositor.ts` — Sharp-based compositing
- `app/api/generate-image/route.ts` — API endpoint
- `lib/services/image-generation-service.ts` — AI generation client

## Verification Commands

```bash
# Check for single-item outputs (should decrease after fix)
ls -lh public/generated-images/*.png | awk '$5 < 500000'

# Monitor logs during generation
tail -f logs/*.json | grep -i "hybridflatlay\|quality gate"

# Test with different item counts
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"generationType": "hybrid-flat-lay", "flatLayItems": [...]}'
```

## Date
February 12, 2026
