# Summary: Visual Matching Intelligence

**Source:** `/implementation/15_visual_matching_intelligence.md`
**Quick Reference for AI Implementation**

---

## Key Concepts

### Silhouette Types
- **A-Line**: Narrow top, flares bottom (▲)
- **H-Line**: Straight, column shape (▮)
- **X-Line**: Fitted waist, balanced (⌛)
- **I-Line**: Slim, elongated (│)
- **O-Line**: Rounded, cocoon-like (⬭)

### Fit Scale
`Fitted → Semi-Fitted → Relaxed → Oversized → Boxy`

### Visual Weight (1-10)
- Light (1-4): Sheer, pastels, airy
- Medium (5-6): Cotton, mid-tones
- Heavy (7-10): Wool, dark, structured

### Outfit Roles
| Role | Rule |
|------|------|
| Anchor | 1 per outfit, foundation piece |
| Supporting | 1-3 per outfit, complements anchor |
| Accent | 1-2 per outfit, adds interest |
| Statement | 0-1 per outfit, if present = focal point |

---

## Quick Rules

1. **Balance visual weight**: Heavy top → Light bottom (or vice versa)
2. **One anchor rule**: Every outfit needs exactly 1 anchor
3. **Pattern complexity**: Thai conservative ≤ 5, formal ≤ 4
4. **Thai proportions**: High-waist for 155-160cm average height

---

## Product Attributes (MVP)
```json
{
  "silhouette": "A-line",
  "fit": "semi-fitted",
  "visualWeight": 5,
  "outfitRole": "anchor",
  "colorPattern": "solid"
}
```

---

**See full document for**: Image embedding guidance, texture vocabulary, proportion effects
