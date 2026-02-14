# Summary: Outfit Generator Algorithm
## Quick Reference for AI Implementation

**Source:** [14_outfit_generator_algorithm.md](/implementation/14_outfit_generator_algorithm.md)
**Read Time:** 5 minutes
**Priority:** ⭐⭐⭐ CRITICAL

---

## 🎯 Core Purpose

The outfit generator creates fashion recommendations using:
1. Pinterest 2026 trends (9 aesthetics)
2. 5-dimension scoring algorithm
3. Formality matching (±2 tolerance)
4. Thai-English bilingual support

---

## 📊 Key Numbers

| Metric | Value |
|--------|-------|
| Source File Size | 1,643 lines |
| Aesthetic Categories | 9 |
| Scoring Dimensions | 5 |
| Color Palettes | 8 |
| Formality Tolerance | ±2 levels |

---

## 🎨 Pinterest 2026 Aesthetics (Thai Names)

1. `clean-girl` → ลุคสาวคลีนมินิมอล
2. `scandinavian-minimal` → สไตล์สแกนดิเนเวียน
3. `street-style` → ลุคสตรีทสไตล์
4. `casual-chic` → ลุคแคชชวลชิค
5. `y2k-revival` → ลุค Y2K รีไววัล
6. `corporate-chic` → ลุคออฟฟิศชิค
7. `quiet-luxury` → ลุค Quiet Luxury
8. `minimalist-office` → ออฟฟิศมินิมอล
9. `dark-academia` → ลุค Dark Academia

---

## 🎯 Scoring Weights

```
Aesthetic Match:     25%
Formality Match:     25%
Color Tone Match:    20%
Style Tag Overlap:   15%
Pairing Compatibility: 15%
─────────────────────────
TOTAL:              100%
```

---

## 👗 Generation Strategies

1. **Trend-Based** (Priority): Uses Pinterest 2026 rules
2. **Dress-Based** (Women): dress + shoes + accessory
3. **Top+Bottom** (Traditional): top + bottom + shoes + (accessory)

---

## 👠 Women's Footwear Rules

**ALLOWED:**
- Heels, pumps, stilettos
- Women's loafers (pointed-toe)
- Mules, ballet flats
- Slingbacks, sandals

**EXCLUDED:**
- Oxford shoes, Derby shoes
- Brogues, Wingtips
- Men's dress shoes

---

## 🔍 Thai-English Query Keywords

| Style | English | Thai |
|-------|---------|------|
| Business | work, office | ทำงาน, ประชุม |
| Casual | relax | สบาย, ชิล, เที่ยว |
| Formal | party, event | งานแต่ง, ราตรี |
| Date | dinner, romantic | เดท, แฟน, ดินเนอร์ |
| Workout | gym, sport | ออกกำลังกาย |

---

## ✅ Validation Checklist

- [ ] Color tones compatible
- [ ] Formality within ±2
- [ ] Style tags overlap
- [ ] Pairing rules followed
- [ ] No duplicate roles (except accessories)
- [ ] No placeholder images
- [ ] No out-of-stock items

---

## 🔑 Key Functions

```javascript
// Main generators
generateOutfits(products, options)
generateEnhancedOutfits(products, options)
generateOutfitsFromQuery(products, query, userProfile)

// Validation
filterProductsByGender(products, gender)
isWomenFootwear(product)
validateEnhancedOutfit(items)
```

---

## 💡 Quick Tips for AI

1. Always try trend-based first, fall back to traditional
2. Women's outfits default to gender='women'
3. Formality 5-7 = smart casual/business casual
4. Formality 8-10 = formal/black tie
5. Personalize titles with user's name when available

---

**Last Updated:** February 2026
**Source:** apps/web/lib/outfit-generator.ts
