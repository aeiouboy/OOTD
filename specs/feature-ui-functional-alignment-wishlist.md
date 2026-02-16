# Implementation Plan: UI Functional Alignment + Wishlist Feature

## Problem Statement

The current UI has multiple non-functional or misaligned elements:
1. **Sidebar filters** (Occasion, Category, Price Range, Quick Presets) don't align with the AI chat pipeline
2. **Outfit Discovery** shows empty state — the carousel-based outfit generator doesn't produce results because it relies on a legacy `generateOutfits()` pipeline disconnected from the AI chat
3. **Occasion Filter Chips** (top bar) only have 3 options (`weekend_social`, `date_night`, `everyday_casual`) — mismatched with the 9 real occasions
4. **Dual occasion systems** — sidebar checkboxes use `['today', 'work', 'party', 'travel']` while chips use different IDs
5. **Heart button** in OutfitRecommendationCard is non-functional (local state only, no persistence)
6. **No wishlist feature** — user has no way to view saved/liked outfits

## Design Vision

### Desktop — Wishlist as Top-Level Header Button (Highly Visible)

The wishlist lives as a **persistent header button** at the top of the middle panel,
right-aligned next to the heading. Always visible, shows badge count, toggles
the wishlist view inline. This is the most discoverable placement — users see it
on every screen state.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ DESKTOP LAYOUT (3-panel)                                                │
├────────────┬──────────────────────────────────┬─────────────────────────┤
│            │                                  │                         │
│  OOTDay    │  ┌─ TOP BAR ──────────────────┐  │   Chat Assistant       │
│  AI Stylist│  │ Discover Products    ♡ (3) │  │   ┌───────────────────┐ │
│            │  └────────────────────────────┘  │   │ AI chat messages  │ │
│ ─────────  │                                  │   │                   │ │
│ Category   │  Occasion Chips (scrollable)     │   │ [OutfitRec Cards] │ │
│ ○ All      │  ┌────┐┌────┐┌────┐┌────┐┌───┐  │   │  ┌─────┐ ┌─────┐ │ │
│ ● Women   │  │Work││Chill││Date││Cafe│...│  │   │  │Look1│ │Look2│ │ │
│ ○ Men     │  └────┘└────┘└────┘└────┘└───┘  │   │  │ ♡ 👁 │ │ ♡ 👁 │ │ │
│            │                                  │   │  └─────┘ └─────┘ │ │
│ ─────────  │  ┌──────┐ ┌──────┐ ┌──────┐     │   │                   │ │
│ Occasion   │  │Product│ │Product│ │Product│     │   │ [Quick prompts]   │ │
│ ☐ Work    │  │ Card │ │ Card │ │ Card │     │   └───────────────────┘ │
│ ☐ Chill   │  │ ฿999 │ │฿1290 │ │฿1590 │     │                         │
│ ☐ Wedding │  └──────┘ └──────┘ └──────┘     │ ─────────────────────── │
│ ☐ Travel  │  ┌──────┐ ┌──────┐ ┌──────┐     │  OutfitDetail (when    │
│ ☐ Date    │  │Product│ │Product│ │Product│     │  user clicks "ดูลุค")  │
│ ☐ Dinner  │  │ Card │ │ Card │ │ Card │     │  ┌───────────────────┐ │
│ ☐ Cafe    │  │ ฿790 │ │฿2490 │ │ ฿850 │     │  │ Flat-lay image    │ │
│ ☐ Party   │  └──────┘ └──────┘ └──────┘     │  │ Product list      │ │
│ ☐ Sport   │                                  │  │ [Buy] [♡ Save]    │ │
│            │  Pagination: < 1 2 3 ... >       │  └───────────────────┘ │
│ ─────────  │                                  │                         │
│ Price Range│                                  │                         │
│ ฿0 ━━━━ ฿20k                                │                         │
│            │                                  │                         │
│ ─────────  │                                  │                         │
│ Quick Chat │                                  │                         │
│ [☀ Weekend]│                                  │                         │
│ [🌙 Date] │                                  │                         │
│ [👟 Casual]│                                  │                         │
│            │                                  │                         │
│ Clear all  │                                  │                         │
├────────────┴──────────────────────────────────┴─────────────────────────┤
│ Web Design Guidelines: focus-visible, semantic HTML, URL state, a11y   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Top Bar Detail — Wishlist Toggle Button

The top bar of the middle panel has a sticky heading with the wishlist button.
Clicking it toggles between product grid and wishlist view inline.

```
┌──────────────────────────────────────────┐
│                                          │
│  Discover Products              ♡ 3     │  ◄── "♡ 3" = heart icon + badge
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │      red badge when count > 0
│                                          │      click → toggles wishlist view
│  When toggled ON:                        │
│                                          │
│  ♡ รายการที่ถูกใจ              ← กลับ   │  ◄── Wishlist header + back
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                          │
└──────────────────────────────────────────┘
```

### Outfit Detail Panel — Footer with Wishlist Heart

```
┌─────────────────────────────┐
│  ← Explore more outfits     │
│ ─────────────────────────── │
│  Casual Weekend Look        │
│  Relaxed weekend styling    │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   Flat-lay Image      │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  Shop this look:            │
│  ┌─────┐ T-Shirt   ฿990   │
│  │ img │ Brand X   [Buy]  │
│  └─────┘                   │
│  ┌─────┐ Pants    ฿1,490  │
│  │ img │ Brand Y   [Buy]  │
│  └─────┘                   │
│                             │
│  Similar Outfits:           │
│  ┌────┐ ┌────┐ ┌────┐     │
│  │    │ │    │ │    │     │
│  └────┘ └────┘ └────┘     │
│                             │
├─────────────────────────────┤
│  ♡ Save    ฿2,480   [ซื้อ] │  ◄── Footer: heart + total + buy
└─────────────────────────────┘
```

### Wishlist View (inline in middle panel, toggled from top bar)

```
┌──────────────────────────────────┐
│  ♡ รายการที่ถูกใจ       ← กลับ  │  ◄── Sticky header with back
│  3 looks saved                   │
│ ─────────────────────────────── │
│                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │Flat  │ │Flat  │ │Flat  │    │
│  │Lay   │ │Lay   │ │Lay   │    │
│  │Image │ │Image │ │Image │    │
│  ├──────┤ ├──────┤ ├──────┤    │
│  │Title │ │Title │ │Title │    │
│  │฿2480 │ │฿3200 │ │฿1890 │    │
│  │[ดูลุค]│ │[ดูลุค]│ │[ดูลุค]│    │
│  │  ♡🗑 │ │  ♡🗑 │ │  ♡🗑 │    │
│  └──────┘ └──────┘ └──────┘    │
│                                  │
│  Empty state:                    │
│  ┌──────────────────────────┐   │
│  │         ♡                 │   │
│  │  ยังไม่มีลุคที่บันทึก       │   │
│  │  กดหัวใจที่ลุคในแชท        │   │
│  │  เพื่อบันทึกไว้ที่นี่         │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

### Mobile Layout — Wishlist in Header (Not Bottom Tab)

On mobile, the wishlist button sits in the **header bar** next to the bell icon,
always visible. This avoids crowding the bottom nav with a 4th tab.

```
┌──────────────────────┐
│ ✨ OOTDay    ♡3  🔔  │  ◄── Wishlist heart+badge in header
├──────────────────────┤
│ Occasion Chips       │
│ [Work][Chill][Date]… │
│                      │
│ Product Grid         │
│ ┌─────┐ ┌─────┐    │
│ │     │ │     │    │
│ └─────┘ └─────┘    │
│ ┌─────┐ ┌─────┐    │
│ │     │ │     │    │
│ └─────┘ └─────┘    │
│                      │
├──────────────────────┤
│  กรอง    ชุด    แชท  │  ◄── 3 tabs (clean), wishlist is in header
└──────────────────────┘

Tap ♡ in header → replaces content with wishlist grid:

┌──────────────────────┐
│ ✨ OOTDay    ♡3  🔔  │
├──────────────────────┤
│ ♡ รายการที่ถูกใจ  ←  │
│ 3 looks saved        │
│                      │
│ ┌─────┐ ┌─────┐    │
│ │Saved│ │Saved│    │
│ │Look │ │Look │    │
│ └─────┘ └─────┘    │
│                      │
├──────────────────────┤
│  กรอง    ชุด    แชท  │
└──────────────────────┘
```

---

## Implementation Steps

### Step 1: Align Occasion Filter with All 9 Occasions

**Files**: `components/navigation/OccasionFilter.tsx`

**Current**: Only 4 occasions (`today`, `work`, `party`, `travel`) — `today` isn't even a real occasion type.

**Change**: Replace with all 9 occasions from `lib/constants/occasions.ts`:
```
work, chill, wedding, sport, travel, date, dinner, cafe, party
```

Display Thai labels from OCCASIONS constant. Fix "Occation" typo → "Occasion".

### Step 2: Align Occasion Chips with All 9 Occasions

**Files**: `components/occasion/OccasionFilterChips.tsx`

**Current**: Only 3 chips (`weekend_social`, `date_night`, `everyday_casual`) — these IDs don't match the `OccasionType` enum used by the AI pipeline.

**Change**: Use the 9 real `OccasionType` values from `lib/constants/occasions.ts`. Show Thai + English labels. Support horizontal scroll when all 9 don't fit. Allow multi-select (tag multiple occasions).

### Step 3: Connect Occasion Chips → Supabase Product Grid

**Files**: `app/page.tsx`, `lib/hooks/useOccasionSuggestions.ts`

**Current**: Occasion chips set `selectedOccasion` which calls `/api/suggestions` — but uses `OccasionType` from Supabase types (`weekend_social` etc.) which don't match the product DB `primary_occasion` field.

**Change**: Update `useOccasionSuggestions` to accept the real `OccasionType` (`work`, `chill`, etc.) and query products by occasion scores (`occasion_work > 5`) instead of `primary_occasion` equality. This aligns with how the AI chat pipeline already filters products.

### Step 4: Connect Sidebar Filters → Product Grid (Replace Legacy Outfit Generator)

**Files**: `app/page.tsx`, `components/outfit/OutfitDiscovery.tsx`

**Current**: The middle panel uses `OutfitDiscovery` which renders a carousel from `generateOutfits()` — a legacy pipeline that creates fake outfit combinations client-side. This produces the empty state seen in the screenshot.

**Change**: Replace `OutfitDiscovery` with the `OccasionSuggestionGrid` (product cards) as the DEFAULT view. Filters (gender, price range, occasion checkboxes) filter products from Supabase directly. The "Choose your look" heading becomes "Discover products" with real product cards.

```
Flow: Sidebar filters → API /api/suggestions (with filters) → Product grid
```

### Step 5: Connect Quick Presets → Chat Assistant

**Files**: `components/navigation/QuickPresets.tsx`, `app/page.tsx`

**Current**: Quick presets set filter state for the legacy outfit generator.

**Change**: Rename to "Quick Chat" — clicking a preset sends a pre-built Thai message to the ChatAssistant:
- "Weekend & Social" → sends "แนะนำชุดสำหรับเที่ยววันหยุดหน่อย"
- "Date Night" → sends "อยากได้ชุดไปเดทค่ะ"
- "Everyday Casual" → sends "ชุดใส่สบายๆ ชิลล์ๆ วันหยุด"

This triggers the real AI pipeline and shows outfit recommendations in chat.

### Step 6: Implement Wishlist with localStorage Persistence

**New Files**:
- `lib/hooks/useWishlist.ts` — Wishlist hook with localStorage
- `components/wishlist/WishlistGrid.tsx` — Grid display of saved outfits
- `components/wishlist/WishlistEmptyState.tsx` — Empty state
- `components/wishlist/WishlistButton.tsx` — Reusable heart button

**Data Model**:
```typescript
interface WishlistItem {
  id: string           // outfit.id
  outfit: Outfit       // Full outfit data for rendering
  savedAt: number      // Date.now() timestamp
}
```

**Storage**: `localStorage` key `ootday-wishlist` — JSON array of `WishlistItem[]`.

**Hook API**:
```typescript
function useWishlist() {
  return {
    items: WishlistItem[],
    isInWishlist: (outfitId: string) => boolean,
    addToWishlist: (outfit: Outfit) => void,
    removeFromWishlist: (outfitId: string) => void,
    toggleWishlist: (outfit: Outfit) => void,
    clearWishlist: () => void,
    count: number,
  }
}
```

### Step 7: Wire Heart Button in OutfitRecommendationCard → Wishlist

**Files**: `components/chat/OutfitRecommendationCard.tsx`

**Current**: Heart button uses local `isLiked` state — resets on page refresh, doesn't save anything.

**Change**: Replace with `useWishlist` hook:
```tsx
const { isInWishlist, toggleWishlist } = useWishlist()
const isLiked = isInWishlist(outfit.id)

<Button onClick={() => toggleWishlist(outfit)}>
  <Heart className={isLiked ? "fill-red-500 text-red-500" : ""} />
</Button>
```

### Step 8: Add Wishlist Heart to OutfitDetail Footer

**Files**: `components/outfit/OutfitDetail.tsx`, `components/outfit/StickyPurchaseSection.tsx`

**Current**: Footer only has total price + "ซื้อทั้งหมด" button.

**Change**: Add heart/save button to the sticky footer:
```
┌─────────────────────────────────────┐
│  ♡ Save     ฿2,480    [ซื้อทั้งหมด] │
└─────────────────────────────────────┘
```

The heart toggles wishlist for the current outfit being viewed.

### Step 9: Add Wishlist Toggle to Top Bar (Desktop) + Header (Mobile)

**Files**: `app/page.tsx`

**Desktop**: Add a sticky top bar to the middle panel with the heading "Discover Products" and a `♡ (N)` button on the right. Clicking it toggles the middle panel between product grid and `WishlistGrid`. The button shows a red badge with saved count when > 0.

```
┌────────────────────────────────────┐
│  Discover Products          ♡ 3   │  ◄── sticky top bar
│  ──────────────────────────────── │
│  [occasion chips] ...             │
│  [product grid / wishlist grid]   │
└────────────────────────────────────┘
```

**Mobile**: Add `♡ (N)` button in the header bar next to the bell icon. Same toggle behavior — replaces main content with wishlist, shows back arrow to return.

```
┌──────────────────────┐
│ ✨ OOTDay    ♡3  🔔  │  ◄── heart+badge always visible in header
└──────────────────────┘
```

This keeps the bottom nav clean at 3 tabs while making the wishlist highly visible.

### Step 10: URL State for Filters (Web Design Guidelines Compliance)

**Files**: `app/page.tsx`, `lib/hooks/useOutfitDiscovery.ts`

Per web design guidelines: "URLs reflect application state — filters, tabs, pagination, and panels belong in query parameters."

**Change**: Sync filter state to URL query params:
```
?gender=women&occasion=work,date&price_min=500&price_max=5000&view=wishlist
```

Use `useSearchParams` from Next.js. Back button navigates filter history.

### Step 11: Accessibility & Web Guidelines Fixes

**Files**: Multiple components

Based on web design guidelines audit:
- Fix `OccasionFilter.tsx` typo: "Occation" → "Occasion"
- Add `aria-label` to all icon buttons (heart, share, filter chips)
- Ensure `:focus-visible` ring on all interactive elements (check Tailwind config)
- Add `role="tablist"` to mobile bottom nav, `role="tab"` to each tab button
- Use `Intl.NumberFormat('th-TH')` for price formatting instead of `toLocaleString()`
- Add `prefers-reduced-motion` respect for flat-lay loading animations
- Ensure images have `width`/`height` to prevent layout shift
- Add `text-wrap: balance` to headings

---

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `components/navigation/OccasionFilter.tsx` | Modify | All 9 occasions with Thai labels |
| `components/occasion/OccasionFilterChips.tsx` | Modify | All 9 occasions, horizontal scroll |
| `components/navigation/QuickPresets.tsx` | Modify | Rename "Quick Chat", send to ChatAssistant |
| `lib/hooks/useWishlist.ts` | **New** | Wishlist hook with localStorage |
| `components/wishlist/WishlistGrid.tsx` | **New** | Saved outfits grid |
| `components/wishlist/WishlistEmptyState.tsx` | **New** | Empty wishlist state |
| `components/chat/OutfitRecommendationCard.tsx` | Modify | Wire heart → wishlist |
| `components/outfit/OutfitDetail.tsx` | Modify | Add heart to footer |
| `components/outfit/StickyPurchaseSection.tsx` | Modify | Add save button |
| `app/page.tsx` | Modify | Wire filters→products, add wishlist view, mobile tab |
| `lib/hooks/useOccasionSuggestions.ts` | Modify | Accept real OccasionType, filter by scores |
| `app/api/suggestions/route.ts` | Modify | Support gender, price, multi-occasion filtering |

---

## Testing Plan

1. **Unit tests**: `useWishlist` hook — add/remove/toggle/persist/clear
2. **Unit tests**: OccasionFilter renders all 9 occasions
3. **Unit tests**: OccasionFilterChips renders all 9 with correct labels
4. **Integration**: Sidebar occasion checkbox → product grid updates
5. **Integration**: Price range slider → products filtered by price
6. **Integration**: Gender radio → products filtered by gender
7. **Integration**: Quick Chat preset → message sent to ChatAssistant
8. **Integration**: Heart in OutfitRecommendationCard → persists in wishlist
9. **Integration**: Heart in OutfitDetail footer → persists in wishlist
10. **E2E**: Click occasion → see products → click product → view detail → save to wishlist → check wishlist tab
11. **A11y**: Keyboard navigation through all filters, chips, and cards
12. **URL state**: Back/forward browser buttons reflect filter changes
