# Testing Guide: Chat Integration with Enhanced Product Data

## Prerequisites

1. Make sure you have the products JSON files in place:
   - `/Users/naruechon/Documents/Project/OOTDay/products/central-men-clothing.json`
   - `/Users/naruechon/Documents/Project/OOTDay/products/central-women-dresses.json`

2. (Optional) Set up OpenRouter API key for AI-powered responses:
   ```bash
   cd frontend
   echo "OPENROUTER_API_KEY=your_key_here" >> .env.local
   ```

## Running the Application

```bash
cd frontend
npm run dev
# or
pnpm dev
```

Open http://localhost:3000

## Test Scenarios

### ✅ Test 1: Basic Work Outfit Request

**Input (English):**
```
What should I wear to work?
```

**Expected Behavior:**
- Occasion detected: "work"
- Filters products with formality 6-9
- Returns 3-5 professional outfits
- Each outfit has actual product SKUs and URLs
- Products include shirts, trousers, blazers
- Thai response message

**Check:**
- [ ] Response is in Thai
- [ ] Products have real Central URLs (not search URLs)
- [ ] Products look professional/formal
- [ ] Price shown in Thai Baht (฿)
- [ ] Images load correctly

### ✅ Test 2: Thai Language Weekend Request

**Input (Thai):**
```
ชุดชิลล์วันหยุด
```

**Expected Behavior:**
- Occasion detected: "chill"
- Filters casual products
- Returns relaxed weekend outfits
- Response in Thai

**Check:**
- [ ] Detects "chill" occasion
- [ ] Products are casual (t-shirts, jeans, etc.)
- [ ] Formality level 1-4
- [ ] Thai product names displayed

### ✅ Test 3: Budget-Constrained Wedding

**Input:**
```
งานแต่งงาน งบไม่เกิน 5000 บาท
```

**Expected Behavior:**
- Occasion detected: "wedding"
- Budget extracted: 5000
- Filters formal products under ฿5,000
- Returns elegant outfits within budget

**Check:**
- [ ] Total outfit price ≤ ฿5,000
- [ ] Products are formal (dresses, suits, etc.)
- [ ] Formality level 7-10
- [ ] Response mentions budget

### ✅ Test 4: Gender-Specific Request

**Input:**
```
men's casual outfit
```

**Expected Behavior:**
- Gender detected: "men"
- Filters men's products only
- Returns casual men's outfits
- No women's products in results

**Check:**
- [ ] All products from men's category
- [ ] No dresses or women's items
- [ ] Casual style (t-shirts, jeans, sneakers)

### ✅ Test 5: Dinner Date

**Input:**
```
เดทไปทานข้าว
```

**Expected Behavior:**
- Occasion detected: "dinner" or "date"
- Filters products with formality 5-8
- Returns semi-formal romantic outfits

**Check:**
- [ ] Stylish but not too formal
- [ ] Suitable for restaurant setting
- [ ] Mix of smart casual items

### ✅ Test 6: Sport/Gym

**Input:**
```
gym outfit
```

**Expected Behavior:**
- Occasion detected: "sport"
- Filters athletic products
- Returns workout-appropriate outfits

**Check:**
- [ ] Athletic wear only
- [ ] Comfortable, stretchy materials mentioned
- [ ] Sports shoes included

## Console Output Verification

Open browser console (F12) and check for:

```
[DataLoader] Loaded X products from API
[DataLoader] Successfully transformed Y products to EnhancedProduct format
[DataLoader] Catalog initialized: X legacy products, Y enhanced products
[HomePage] Loaded X legacy products, Y enhanced products
[Chat API] Processing message: ...
[Chat API] Using Y enhanced products
[Chat API] Using rule-based recommendations (no AI key)
[Chat API] Generated Z outfits
```

## API Response Verification

### Check Network Tab

1. Open DevTools → Network tab
2. Send a chat message
3. Find the `chat` request
4. Check the response:

```json
{
  "message": "สวัสดีค่ะ! นี่คือคำแนะนำสำหรับคุณ",
  "outfits": [
    {
      "id": "outfit-...",
      "title": "ชุดออฟฟิศมั่นใจ",
      "description": "เหมาะสำหรับการทำงาน...",
      "totalPrice": 4500,
      "items": [
        {
          "sku": "grmkppr...",
          "name": "...",
          "brand": "Central",
          "price": 1500,
          "imageUrl": "https://...",
          "onlineUrl": "https://www.central.co.th/...",
          "category": "men",
          "gender": "men",
          "occasion": ["work"],
          "formality": 7
        }
      ],
      "occasion": "work",
      "formality": 7
    }
  ],
  "occasion": "work"
}
```

### Verify Product URLs

Each product should have:
- `onlineUrl`: Real Central product URL (NOT a search URL)
- Format: `https://www.central.co.th/.../p/grmkppr...`

❌ **Bad (old behavior):**
```
"onlineUrl": "https://www.central.co.th/th/search?text=เสื้อเชิ้ต"
```

✅ **Good (new behavior):**
```
"onlineUrl": "https://www.central.co.th/th/men/clothing/p/grmkppr000148277"
```

## Common Issues & Solutions

### Issue 1: No Enhanced Products

**Symptom:** Chat returns "ระบบกำลังโหลดข้อมูลสินค้า"

**Solution:**
1. Check console for errors
2. Verify JSON files exist in `/products/` directory
3. Check API route: http://localhost:3000/api/products
4. Should return `{ products: [...], count: X }`

### Issue 2: Generic Search URLs

**Symptom:** Products have search URLs instead of product URLs

**Solution:**
- This means enhanced products aren't loading
- Check browser console for "[DataLoader]" messages
- Verify transformation pipeline is running

### Issue 3: No Outfits Generated

**Symptom:** Chat returns message but no outfits

**Solution:**
1. Check if products have required outfit roles
2. Verify categorization is working
3. Try relaxing filters (remove budget/gender constraints)
4. Check console for "[Chat API] Generated X outfits"

### Issue 4: Wrong Occasion Detection

**Symptom:** Request for "work" returns casual items

**Solution:**
- Check occasion keywords in `ai-chat-service.ts`
- Verify `detectOccasion()` function
- Add more keywords for that occasion

## Performance Checks

### Load Time
- [ ] Products load within 2 seconds
- [ ] Chat response within 3 seconds (without AI)
- [ ] Chat response within 10 seconds (with AI)

### Memory Usage
- [ ] No memory leaks after multiple searches
- [ ] Page remains responsive

### Data Volume
- [ ] Enhanced products count matches input JSON
- [ ] No duplicate products in results

## Success Criteria

✅ **Integration is successful if:**

1. Chat returns actual products (not search URLs)
2. Products have real SKUs and Central links
3. Occasion detection works for Thai and English
4. Budget filtering works
5. Gender filtering works
6. Outfits are relevant to the request
7. No TypeScript compilation errors
8. No runtime errors in console

## Next Steps After Testing

If all tests pass:
1. Deploy to staging environment
2. Test with real users
3. Monitor API costs (if using OpenRouter)
4. Gather feedback on recommendations
5. Iterate on product data quality

If tests fail:
1. Check console for errors
2. Verify product JSON files
3. Test API endpoints independently
4. Review transformation pipeline
5. Check filter logic
