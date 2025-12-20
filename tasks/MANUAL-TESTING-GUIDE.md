# Manual Testing Guide - PRD-0009 Context Awareness
**Version:** 1.0
**Date:** 2025-10-16
**Status:** Ready for Testing

---

## Pre-Testing Checklist

Before starting manual tests, ensure:

- [x] Dev server running at http://localhost:3002
- [x] All unit tests passing (37/37) ✅
- [x] No TypeScript compilation errors ✅
- [x] Browser console open (F12 → Console tab) for debug logs

---

## Test Scenarios

### 🧪 Scenario 1: Complete Info Upfront (Zero Clarifications)
**Goal:** Verify AI provides immediate recommendations when all info is provided

**Input:**
```
"หาชุดผู้ชายไปงานบวช งบ 5000 บาท"
```

**Expected Behavior:**
- ✅ **Zero clarifying questions** asked
- ✅ AI provides **immediate recommendations**
- ✅ Shows **3-5 men's products** for monk ordination
- ✅ All products **under 5000 บาท**
- ✅ Products are **formal/smart casual** style
- ✅ Response mentions both **"ผู้ชาย"** and **"งานบวช"**

**How to Verify:**
1. Open http://localhost:3002
2. Select model (e.g., Claude Sonnet 4.5)
3. Type the input above
4. Press Enter
5. Check response immediately shows products (no questions)

**Debug Logs to Check:**
```javascript
[DEBUG] Combined user query: หาชุดผู้ชายไปงานบวช งบ 5000 บาท
[DEBUG] Extracted Context: { gender: 'men', occasion: 'wedding', budget: {...} }
[DEBUG] Filtering Results: {
  extractedGender: "men",
  filteredCount: ~1344,
  firstFiveProducts: [all should have gender: "men"]
}
```

**Pass Criteria:**
- [ ] Zero clarifications
- [ ] Immediate product recommendations
- [ ] All products are men's clothing
- [ ] All products under budget
- [ ] Response acknowledges งานบวช context

**If Failed:** Check console for filtering errors, verify gender extraction

---

### 🧪 Scenario 2: Single Clarification with Memory
**Goal:** Verify AI asks ONE question and remembers previous context

**Turn 1 Input:**
```
"หาชุดไปงานบวช"
```

**Turn 1 Expected:**
- ✅ AI asks **"อยากหาชุดผู้หญิงหรือผู้ชายคะ?"** (or similar gender question)
- ✅ **Does NOT** ask about occasion (already knows งานบวช)
- ✅ **Only ONE** clarifying question

**Turn 2 Input:**
```
"ผู้ชาย"
```

**Turn 2 Expected:**
- ✅ AI provides **immediate recommendations**
- ✅ Shows **men's products** only
- ✅ Products suitable for **งานบวช** (formal)
- ✅ Response mentions **both** "ผู้ชาย" AND "งานบวช"
- ✅ **No redundant questions** about occasion

**How to Verify:**
1. Start fresh conversation (reload page or clear panel)
2. Send Turn 1 message
3. Wait for AI response (should be ONE question only)
4. Send Turn 2 message
5. Verify products shown are men's formal wear

**Debug Logs to Check (Turn 2):**
```javascript
[DEBUG] Combined user query: หาชุดไปงานบวช ผู้ชาย
[DEBUG] Extracted Context: {
  gender: 'men',        // ← FROM TURN 2
  occasion: 'wedding'   // ← FROM TURN 1 (remembered!)
}
```

**Pass Criteria:**
- [ ] Turn 1: Only ONE clarifying question (gender)
- [ ] Turn 1: No question about occasion
- [ ] Turn 2: Immediate recommendations
- [ ] Turn 2: All products are men's clothing
- [ ] Turn 2: Products match formal occasion
- [ ] Turn 2: Response acknowledges BOTH parameters

**If Failed:**
- Check if gender extracted correctly (console logs)
- Check if occasion remembered from Turn 1
- Verify conversation history passed to API

---

### 🧪 Scenario 3: Two Clarifications with Full Context
**Goal:** Verify AI asks MAX 2 questions and remembers everything

**Turn 1 Input:**
```
"หาชุดไปงาน"
```

**Turn 1 Expected:**
- ✅ AI asks about **occasion** (work? party? wedding?)
- ✅ **Only ONE** question

**Turn 2 Input:**
```
"งานบวช"
```

**Turn 2 Expected:**
- ✅ AI asks about **gender** (ผู้หญิงหรือผู้ชาย?)
- ✅ **Remembers** งานบวช from Turn 2
- ✅ **Only ONE** question

**Turn 3 Input:**
```
"ผู้ชาย"
```

**Turn 3 Expected:**
- ✅ AI provides **immediate recommendations**
- ✅ Shows **men's formal products** for งานบวช
- ✅ **Zero more questions** (MAX 2 rule enforced)
- ✅ Response mentions **occasion + gender**

**Debug Logs to Check (Turn 3):**
```javascript
[DEBUG] Combined user query: หาชุดไปงาน งานบวช ผู้ชาย
[DEBUG] Extracted Context: {
  gender: 'men',        // ← FROM TURN 3
  occasion: 'wedding'   // ← FROM TURN 2 (remembered!)
}
```

**Pass Criteria:**
- [ ] Turn 1: Ask about occasion
- [ ] Turn 2: Ask about gender, remember occasion
- [ ] Turn 3: Provide recommendations, no more questions
- [ ] MAX 2 clarifications enforced
- [ ] All context accumulated correctly

**If Failed:**
- Verify MAX 2 clarifications rule in system prompt
- Check conversation history accumulation
- Verify context extraction from all previous turns

---

## Regression Tests

### 🔄 Test 4: Gender Filtering (Critical Regression)
**Goal:** Ensure women's products DON'T appear for men's queries

**Test Cases:**

#### Test 4A: Men Query
**Input:** `"หาชุดผู้ชาย"`

**Expected:**
- ✅ **ONLY men's products** shown
- ✅ **Zero women's products** (critical!)
- ✅ Product names include: "Men", "Blazer Men", "Shirt Men"
- ✅ Product names **DO NOT** include: "Women", "Dress Women", "Shirt Women"

**Debug Check:**
```javascript
[DEBUG] Extracted Context: { gender: 'men' }
[DEBUG] firstFiveProducts: [
  { name: "...", gender: "men" },  // ← ALL should be "men"
  { name: "...", gender: "men" },
  { name: "...", gender: "men" }
]
```

**Pass Criteria:**
- [ ] Zero women's products in results
- [ ] All product names appropriate for men
- [ ] Console shows gender: "men" for all filtered products

#### Test 4B: Women Query
**Input:** `"หาชุดผู้หญิง"`

**Expected:**
- ✅ **ONLY women's products** shown
- ✅ **Zero men's products**
- ✅ Product names include: "Women", "Dress Women", "Skirt"
- ✅ Product names **DO NOT** include: "Men", "Blazer Men", "Shirt Men"

**Pass Criteria:**
- [ ] Zero men's products in results
- [ ] All product names appropriate for women
- [ ] Console shows gender: "women" for all filtered products

**If Failed:** This is a **CRITICAL BUG** - stop testing and investigate gender extraction

---

### 🔄 Test 5: Loop Prevention (MAX 2 Clarifications)
**Goal:** Verify AI stops asking after 2 questions

**Input:** Intentionally vague query
```
"หาชุดสวยๆ"
```

**Expected Flow:**
- ✅ **Turn 1:** AI asks clarifying question (e.g., occasion)
- ✅ **Turn 2:** User answers → AI asks second question (e.g., gender)
- ✅ **Turn 3:** User answers → AI provides recommendations **WITHOUT** asking more
- ✅ **Total clarifications:** MAX 2

**Pass Criteria:**
- [ ] AI stops after 2 clarifications
- [ ] Turn 3 provides recommendations (doesn't ask 3rd question)
- [ ] MAX 2 rule enforced

**If Failed:** Check system prompt MAX 2 clarifications rule

---

### 🔄 Test 6: Template A Enforcement (Products with Links)
**Goal:** Verify clothing category shows Template A (products + prices + links)

**Input:**
```
"หาเสื้อเชิ้ตผู้ชาย"
```

**Expected Template A Format:**
```
🎯 Item 1: **[Product Name]** by [Brand]
💰 ราคา: [X,XXX] บาท
🔗 [Product URL]

🎯 Item 2: **[Product Name]** by [Brand]
...
```

**Pass Criteria:**
- [ ] Shows 3-5 product items
- [ ] Each item has: name, brand, price, URL
- [ ] URLs are clickable links
- [ ] Prices in Thai Baht format

**If Failed:** Check product context serialization and LLM instructions

---

### 🔄 Test 7: Friendly Thai Tone
**Goal:** Verify responses maintain friendly conversational style

**Check for:**
- ✅ Thai particles: **ค่ะ, นะคะ, คะ**
- ✅ Emojis used appropriately: **💼, 👔, ✨, 🎉**
- ✅ Conversational phrases: **"เข้าใจแล้วค่ะ", "งานนี้เรามี...", "แนะนำเลยค่ะ"**
- ✅ Not robotic or overly formal

**Pass Criteria:**
- [ ] Response feels natural and friendly
- [ ] Uses Thai particles consistently
- [ ] Emojis enhance readability

---

## Edge Cases

### 🔺 Test 8: Empty/Invalid Input

**Test 8A: Empty Message**
**Input:** `""` (empty string)

**Expected:**
- ✅ AI responds politely: "มีอะไรให้ช่วยคะ?" or similar
- ✅ No crash or error

**Test 8B: Only Emojis**
**Input:** `"😊👔💼"`

**Expected:**
- ✅ AI asks clarifying question
- ✅ No crash or error

**Test 8C: Special Characters**
**Input:** `"หาชุด!!!@#$%ผู้ชาย"`

**Expected:**
- ✅ AI extracts "ผู้ชาย" correctly
- ✅ Shows men's products

**Pass Criteria:**
- [ ] No crashes on edge cases
- [ ] Graceful error handling
- [ ] Context extraction still works

---

### 🔺 Test 9: Mixed Thai-English

**Input:**
```
"หา men clothing ไป party งบ 5000"
```

**Expected:**
- ✅ Extracts gender: "men" (English)
- ✅ Extracts occasion: "party" (English)
- ✅ Extracts budget: 5000 (numeric)
- ✅ Shows men's party clothing

**Debug Check:**
```javascript
[DEBUG] Extracted Context: {
  gender: 'men',      // ← English keyword
  occasion: 'party',  // ← English keyword
  budget: {...}
}
```

**Pass Criteria:**
- [ ] English keywords detected correctly
- [ ] Mixed language doesn't break context extraction
- [ ] Products match all criteria

---

### 🔺 Test 10: Long Conversation (5+ Turns)

**Goal:** Verify context persists across many turns

**Flow:**
1. Turn 1: "หาชุด" → AI asks occasion
2. Turn 2: "ไปงานบวช" → AI asks gender
3. Turn 3: "ผู้ชาย" → AI shows products
4. Turn 4: "มีอะไรราคาถูกกว่าไหม" → AI shows cheaper products (remembers ผู้ชาย + งานบวช!)
5. Turn 5: "งบ 3000" → AI filters to 3000 budget (still remembers ผู้ชาย + งานบวช!)

**Pass Criteria:**
- [ ] Context persists through 5+ turns
- [ ] No memory loss or reset
- [ ] Turn 4-5 don't ask redundant questions

---

## Product Data Quality Tests

### 📦 Test 11: Product URLs

**Goal:** Check if product links are valid

**How to Test:**
1. Get recommendations with products
2. Click on product URL
3. Check if page loads correctly

**Expected Outcomes:**

**Scenario A: Valid Product**
- ✅ Page loads successfully
- ✅ Shows product details
- ✅ Price matches

**Scenario B: 404 Product** (Known Issue)
- ⚠️ Page shows "Product not found" or 404
- ✅ AI should acknowledge gracefully if user reports
- ℹ️ This is a **data quality issue**, not code bug

**Pass Criteria:**
- [ ] URLs are clickable (not plain text)
- [ ] URLs lead to Central Online domain
- [ ] If 404, user can report and get alternatives

**Note:** We expect some 404s due to data staleness. This is acceptable for now.

---

## Performance Tests

### ⚡ Test 12: Response Time

**Goal:** Verify response time is acceptable

**How to Measure:**
1. Send message
2. Check timestamp when message sent
3. Check timestamp when response received
4. Calculate difference

**Expected:**
- ✅ **< 5 seconds** for simple queries
- ✅ **< 10 seconds** for complex recommendations
- ✅ No freezing or hanging

**Pass Criteria:**
- [ ] Responses feel reasonably fast
- [ ] No timeout errors
- [ ] User experience is smooth

---

## Test Results Template

### Test Summary

**Date:** _____________
**Tester:** _____________
**Browser:** _____________
**Environment:** http://localhost:3002

| Test | Status | Notes |
|------|--------|-------|
| Scenario 1: Zero Clarifications | ⬜ Pass / ⬜ Fail | |
| Scenario 2: Single Clarification | ⬜ Pass / ⬜ Fail | |
| Scenario 3: Two Clarifications | ⬜ Pass / ⬜ Fail | |
| Test 4A: Men Gender Filtering | ⬜ Pass / ⬜ Fail | |
| Test 4B: Women Gender Filtering | ⬜ Pass / ⬜ Fail | |
| Test 5: Loop Prevention | ⬜ Pass / ⬜ Fail | |
| Test 6: Template A Format | ⬜ Pass / ⬜ Fail | |
| Test 7: Friendly Thai Tone | ⬜ Pass / ⬜ Fail | |
| Test 8: Edge Cases | ⬜ Pass / ⬜ Fail | |
| Test 9: Mixed Thai-English | ⬜ Pass / ⬜ Fail | |
| Test 10: Long Conversation | ⬜ Pass / ⬜ Fail | |
| Test 11: Product URLs | ⬜ Pass / ⬜ Fail | |
| Test 12: Response Time | ⬜ Pass / ⬜ Fail | |

**Overall Status:** ⬜ Ready for Staging / ⬜ Needs Fixes

### Critical Issues Found

_(List any critical bugs that block staging deployment)_

1.
2.
3.

### Minor Issues Found

_(List non-blocking issues that can be fixed post-deployment)_

1.
2.
3.

### Recommendations

_(Suggestions for improvement)_

1.
2.
3.

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Mark Task 8.0 complete in task list
2. Create staging deployment plan
3. Schedule user acceptance testing (UAT)

### If Critical Issues Found ❌
1. Document issues with screenshots
2. Create bug tickets
3. Fix issues before proceeding

### If Minor Issues Found ⚠️
1. Document as known issues
2. Proceed to staging
3. Monitor in production

---

**Good luck with testing! 🧪**

If you find any issues, check the console logs first - they'll show exactly where the problem is.
