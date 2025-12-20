# OOTDay - Natural Friendly Onboarding 💕
## เป็นธรรมชาติ เป็นเพื่อน พูดง่ายๆ

---

## 🎯 Overview

```
TONE: เป็นกันเอง พูดแบบเพื่อน Gen Z
FEEL: สนุก ไม่เป็นทางการ อบอุ่น
TIME: 1-2 minutes
STEPS: 5 (4 questions + 1 complete)

KEY CHANGES:
✅ Name = REQUIRED (must have!)
✅ Department = 3 options (Women/Men/Unisex)
✅ Style = Must select at least 2
✅ Tone = More casual, friendly "แก/เธอ"
✅ Voice = Like talking to Gen Z friend
```

---

## 📱 Complete Natural Flow

---

### **SCREEN 1: 👋 Name (REQUIRED)**

```markdown
┌─────────────────────────────────────┐
│  [Progress: ●○○○ 1/4]               │
│                                     │
│   [OOTDay Logo/Avatar - Welcoming]  │
│                                     │
│    ฮายย👋 ฉันชื่อ OOTDay น้าา         │
│       ยินดีที่ได้รู้จัก ✨          │
│                                     │
│  ฉันจะเป็นเพื่อนแนะนําแฟชั่นให้      │
│          เธอเอง 🥰                   │
│                                     │
│  พร้อมมาสนุกกับการแต่งตัวแล้ว        │
│         หรือยัง?                    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │ ก่อนอื่นเลย มาทําความรู้จัก       │ │
│ │ กันหน่อยย 😊                    │ │
│ │                                 │ │
│ │ แกชื่ออะไรร?                     │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ ชื่อ / ชื่อเล่น             │ │ │
│ │ │                             │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ ชื่ออะไรก็ได้ที่อยากให้รู้จัก 💕 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│       [เริ่มกันเลย! →]             │
│                                     │
└─────────────────────────────────────┘

SPECS:
- Input: Text field
- Placeholder: "เช่น: มิ้นท์, ปุ๊ก, NW"
- Required: YES ⚠️ (Cannot proceed without name)
- Min: 2 characters
- Max: 30 characters
- Auto-capitalize
- Auto-focus

VALIDATION:
If empty and click next:
"'งืออ'! เธอยังไม่บอกชื่อเลย 🥲
บอกชื่อหน่อยได้มั้ยย อยากรู้จักอะะ🥺"

If too short (1 char):
"ชื่อเธอเท่มากก แต่ฉันยังเรียกไม่ค่อยถูกแฮะ 🤔 
ช่วยสะกดชื่อเธอเพิ่มอีกรอบได้มั้ยอ่าา"

If inappropriate:
"นี่่! อย่ามาหลอกกันให้ยาก ฉันว่าชื่อเธอไม่น่าใช่ชื่อนี้นะ! "
```

---

### **AFTER INPUT "NW":**

```markdown
┌─────────────────────────────────────┐
│                                     │
│  [OOTDay Avatar - Happy! Sparkles]  │
│                                     │
│      ยินดีที่ได้รู้จักน้าา! 🎉       │
│                                     │
│              NW! 💕                 │
│                                     │
│     เรียกฉันว่า OOTDay ได้เลย       │
│      มาเริ่มทำความรู้จักกันดีกว่า! 😊        │
│                                     │
│        [ไปต่อเลย! →]                │
│                                     │
└─────────────────────────────────────┘

TRANSITION:
- Sparkle animation ✨
- Name saves
- Auto-advance after 1.5 seconds
- Or tap button
- Smooth slide to next screen
```

---

### **SCREEN 2: 👤 Gender/Department (3 Options)**

```markdown
┌─────────────────────────────────────┐
│  [Progress: ●●○○ 2/4]               │
│                                     │
│    [OOTDay Avatar - Curious]        │
│                                     │
│   NW แกอยากเน้นช้อปเสื้อผ้า          │
│        แบบไหนดี? 🤔                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ฉันจะได้ป้ายยาแกถูก👗👔👚👕🧥👖       │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  👗 เสื้อผ้าผู้หญิง             │ │
│  │  Women's Fashion               │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  👔 เสื้อผ้าผู้ชาย              │ │
│  │  Men's Fashion                 │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  ⚧️ เสื้อผ้าทุกเพศ / Unisex   │ │
│  │  All Genders / Unisex          │ │
│  └────────────────────────────────┘ │
│                                     │
│      ┌──────────────┐               │
│      │  ถัดไป →    │               │
│      └──────────────┘               │
│                                     │
└─────────────────────────────────────┘

DESIGN NOTES:
- 3 options only (simplified!)
- Large tap areas (70px height)
- Clear icons + bilingual labels
- Selected = highlight border + background color
- Required selection

WHY 3 OPTIONS:
✅ Covers all needs
✅ Inclusive (Unisex option!)
✅ Simple decision
✅ Not overwhelming
✅ Modern approach

VALIDATION:
If click next without selection:
"แกล้งๆ เลือกสักหน่อยจิ 😊
ฉันจะป้ายยาถูกก"
```

---

### **AFTER SELECTION (Women's Fashion):**

```markdown
┌─────────────────────────────────────┐
│                                     │
│   [OOTDay Avatar - Excited!]        │
│                                     │
│        ได้เลย NW! ✨                │
│                                     │
│  ฉันจะหาของมาป้ายยาเยอะๆ เลย! 👗    │
│                                     │
└─────────────────────────────────────┘

THEN auto-advance after 1 second to next screen
```

---

### **SCREEN 3: 📅 Age Range**

```markdown
┌─────────────────────────────────────┐
│  [Progress: ●●●○ 3/4]               │
│                                     │
│   [OOTDay Avatar - Friendly]        │
│                                     │
│      ขอใส่ใจเพิ่มอีกนิด 😊          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ แกอายุเท่าไหร่อ่าา?              │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  🎓 ต่ํากว่า 20 ปี              │ │
│  │     Gen Z, Student style       │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  💼 20-29 ปี                    │ │
│  │     Young Professional         │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  👔 30-39 ปี                    │ │
│  │     Established Career         │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  🌟 40-49 ปี                    │ │
│  │     Sophisticated Style        │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  👑 50 ปีขึ้นไป                 │ │
│  │     Timeless Elegance          │ │
│  └────────────────────────────────┘ │
│                                     │
│      ┌──────────────┐               │
│      │  ถัดไป →    │               │
│      └──────────────┘               │
│                                     │
└─────────────────────────────────────┘

DESIGN NOTES:
- Each option: emoji + age range + descriptor
- Positive framing (no stigma!)
- English subtitle (aspirational)
- Clean, spacious layout
- Required selection

CASUAL TONE NOTES:
✅ "แกอายุเท่าไหร่อ่าา?" = Very casual, Gen Z
✅ "ขอใส่ใจเพิ่มอีกนิด" = Gentle, not intrusive
✅ Using "อ่าา" = Extended vowel, very casual/cute

VALIDATION:
If click next without selection:
"งืออ! บอกกันหน่อยน้าา🥺"
```

---

### **AFTER SELECTION (20-29):**

```markdown
┌─────────────────────────────────────┐
│                                     │
│  [OOTDay Avatar - Understanding]    │
│                                     │
│        เริ่ดมากก 😁                  │
│                                     │
│     ฉันจะป้ายยาสไตล์ที่เหมาะกับ      │
│        วัยทํางานให้เองง ✨     │
│                                     │
└─────────────────────────────────────┘

RESPONSE VARIATIONS:

< 20:
"ฮ้ายฮายย ว่าไงวัยรุ่น Gen Z 👋🏻 
ฉันตื่นเต้นอยากป้ายยาเธอแล้ววว"

20-29:
"เฮลโหลวว👋🏻 นี่มันวัยกำลังคนหาตัวเองนี่นา
ฉันตื่นเต้นอยากป้ายยาเธอแล้ววว ✨"

30-39:
"ว้ายยย 30 ยังแจ๋ว 🤩
ฉันตื่นเต้นอยากป้ายยาเธอแล้ววว"

40-49:
"ฮ้ายฮายคุณพรี่่ 👋🏻
ตื่นเต้นอยากป้ายยาแล้ววว"

50+:
"ฮ้ายฮายคุณพรี่่ 👋🏻
ตื่นเต้นอยากป้ายยาแล้ววว"

THEN auto-advance after 1 second
```

---

### **SCREEN 4: 👗 Style Preferences (Min 2 Required!)**

**Style Options:**
- Minimal · Timeless
- Business · Refined
- Luxury · Elegant
- Vanilla · Clean
- Sporty · Active
- Edgy · Trendy
- Excentric · Creative
- Bohemian · Natural
- Classic · Old Money

```markdown
┌─────────────────────────────────────┐
│  [Progress: ●●●● 4/4]               │
│                                     │
│   [OOTDay Avatar - Excited!]        │
│                                     │
│   NW เธอชอบสไตล์แบบไหน? 😍            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ เลือกกี่แบบก็ได้นะ              │ │
│ │ (แต่ขออย่างน้อย 2 แบบละกันน 😊) │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌───────────┬───────────┐         │
│  │           │           │         │
│  │ [IMAGE 1] │ [IMAGE 2] │         │
│  │           │           │         │
│  │  Minimal  │ Business  │         │
│  │ Timeless  │  Refined  │         │
│  │           │           │         │
│  ├───────────┼───────────┤         │
│  │           │           │         │
│  │ [IMAGE 3] │ [IMAGE 4] │         │
│  │           │           │         │
│  │  Luxury   │  Vanilla  │         │
│  │  Elegant  │   Clean   │         │
│  │           │           │         │
│  ├───────────┼───────────┤         │
│  │           │           │         │
│  │ [IMAGE 5] │ [IMAGE 6] │         │
│  │           │           │         │
│  │  Sporty   │   Edgy    │         │
│  │  Active   │  Trendy   │         │
│  │           │           │         │
│  ├───────────┼───────────┤         │
│  │           │           │         │
│  │ [IMAGE 7] │ [IMAGE 8] │         │
│  │           │           │         │
│  │ Excentric │ Bohemian  │         │
│  │ Creative  │  Natural  │         │
│  │           │           │         │
│  ├───────────┼───────────┤         │
│  │           │           │         │
│  │ [IMAGE 9] │           │         │
│  │           │           │         │
│  │  Classic  │           │         │
│  │ Old Money │           │         │
│  │           │           │         │
│  └───────────┴───────────┘         │
│                                     │
│  เลือกแล้ว: 0 (อย่างน้อย 2) ⚠️     │
│                                     │
│         [ถัดไป →]                   │
│                                     │
└─────────────────────────────────────┘

DESIGN SPECS:

Layout:
- 2 columns (mobile-friendly)
- Square images (1:1 ratio)
- Bilingual labels (English + Thai)
- Large tap areas
- Visual feedback on selection

Images:
- High-quality lifestyle photos
- Thai models (relatable!)
- Complete outfit visible
- Clear style representation
- Proper lighting & styling

Selection State:
- Unselected: Gray border, normal
- Selected: Pink border + checkmark overlay + slight scale
- Counter updates dynamically
- "อย่างน้อย 2" changes color when valid

INTERACTION:

State 1: 0 selected
"เลือกแล้ว: 0 (อย่างน้อย 2) ⚠️"
Button: Disabled (gray)

State 2: 1 selected
"เลือกแล้ว: 1 (อีก 1 อันนะ!) 😊"
Button: Disabled (gray)

State 3: 2+ selected
"เลือกแล้ว: 2 ✓"
Button: Enabled (pink, active)

VALIDATION:

If click next with < 2:
┌─────────────────────────────────────┐
│   [OOTDay Avatar - Gentle reminder] │
│                                     │
│      ยังไม่ครบเลย เลือกอีกหน่อยสิ 👉🏻👈🏻      │
│                                     │
│   เลือกอย่างน้อย 2 แบบน้าา            │
│   จะได้ป้ายยาได้ตรงใจเธอ 💕      │
│                                     │
│         [โอเคเลย! →]                │
└─────────────────────────────────────┘

If select all 9:
"ว้าวว🤩 ชอบทุกสไตล์เลยเหรอ
เริ่ดมากก เดี๋ยวฉันป้ายยาเธอทุกสไตล์เองง😍"

STYLE OPTIONS (with descriptions):

1. Minimal · Timeless
   "เรียบง่าย ไร้กาลเวลา หรูหราแบบมินิมอล"

2. Business · Refined
   "มืออาชีพ หรูหรา เป็นทางการ"

3. Luxury · Elegant
   "หรูหรา ดูแพง สง่างาม"

4. Vanilla · Clean
   "สะอาดตา เรียบง่าย คลาสสิค"

5. Sporty · Active
   "กีฬา คล่องแคล่ว พร้อมเคลื่อนไหว"

6. Edgy · Trendy
   "ทันสมัย แนวสตรีท ติดเทรนด์"

7. Excentric · Creative
   "แปลกใหม่ สร้างสรรค์ โดดเด่น"

8. Bohemian · Natural
   "อิสระ เป็นธรรมชาติ ศิลปะ"

9. Classic · Old Money
   "คลาสสิค หรูหราแบบเก่า สืบทอด"
```

---

### **AFTER SELECTION (Minimalist + Casual Chic):**

```markdown
┌─────────────────────────────────────┐
│                                     │
│   [OOTDay Avatar - Love it!]        │
│                                     │
│      เธอตาถึงมากก! 😍                │
│                                     │
│     Minimalist + Casual Chic        │
│      สไตล์ของ NW เรียบง่าย          │
│       แต่มีสไตล์มาก! 💕             │
│                                     │
│   เดี๋ยวฉันหาของมาป้ายยาให้เลย!      │
│                                     │
└─────────────────────────────────────┘

RESPONSE VARIATIONS (personalized!):

2 selections:
"เธอตาถึงมากก! 😍
[Style 1] + [Style 2]
[personalized compliment]
เดี๋ยวฉันหาของมาป้ายยาให้เลย!"

3-4 selections:
"ว้าวว! ชอบหลายสไตล์มาก 🌟
เลือก [count] แบบเลย!
ได้สนุกกับการแต่งตัวแน่!
เดี๋ยวฉันจะหาของมาป้ายยาเยอะๆ เลย!"

5+ selections:
"โอ้โห! ชอบหลายสไตล์มาก 😍
NW ชอบลองหลายสไตล์สินะ!
เริ่ดมากกก จะหามาป้ายยาให้ครบทุกแบบเลย"

THEN auto-advance after 1.5 seconds
```

---

### **SCREEN 5: 🎉 Complete & Ready!**

```markdown
┌─────────────────────────────────────┐
│  [Progress: ●●●● Complete! ✨]      │
│                                     │
│  [OOTDay Avatar - CELEBRATING! 🎊]  │
│                                     │
│         เย่! เสร็จแล้ว! 🎉           │
│                                     │
│    เราเป็นเพื่อนกันแล้วนะ NW 💕      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      📋 Your Style Profile      │ │
│ │                                 │ │
│ │  👤 Name: NW                    │ │
│ │  👗 Department: เสื้อผ้าผู้หญิง       │ │
│ │  📅 Age: 20-29 ปี              │ │
│ │  ✨ Stlye: Minimalist,          │ │
│ │     Casual Chic                 │ │
│ │                                 │ │
│ │  [แก้ไขข้อมูล ✏️]               │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│   ฉันรอป้ายยาเธอไม่ไหวแล้วว ✨       │
│                                     │
│  ┌─────────────────────────────────┐│
│  │    🎉 เริ่มคุยกับ OOTDay 🎉     ││
│  └─────────────────────────────────┘│
│                                     │
│      [ดูวิธีใช้งานก่อน 🎥]         │
│                                     │
└─────────────────────────────────────┘

ANIMATION:
- Confetti explosion 🎊
- Profile card slides up
- Sparkles around avatar
- Celebratory bounce
- Smooth, joyful feel

PROFILE CARD:
- Clean white card
- Rounded corners (16px)
- Subtle shadow
- Icon + data for each field
- Edit button (always accessible)

TWO CTAs:

PRIMARY: "เริ่มคุยกับ OOTDay"
- Large, prominent
- Pink gradient button
- Icon: 🎉
- Takes to main chat/search

SECONDARY: "ดูวิธีใช้งานก่อน"
- Ghost/outline button
- Icon: 🎥
- Optional tutorial
- Can skip

EDIT FUNCTIONALITY:
Tap "แก้ไขข้อมูล ✏️" →
┌─────────────────────────────────────┐
│      แก้ไขข้อมูลของเธอ              │
│                                     │
│  👤 Name: [NW] ✏️                   │
│  👗 Department: [ผู้หญิง ▼]              │
│  📅 Age: [20-29 ▼]                 │
│  ✨ Style: [แก้ไข →]                │
│                                     │
│  [บันทึก] [ยกเลิก]                 │
└─────────────────────────────────────┘
```

---

### **AFTER CLICKING "เริ่มคุยกับ OOTDay":**

```markdown
┌─────────────────────────────────────┐
│                                     │
│   [OOTDay Avatar - Ready to help!]  │
│                                     │
│      ฮายย NW! 😊                    │
│                                     │
│   วันนี้อยากหาชุดไปไหนดี?           │
│                                     │
│  🏢 [ทำงาน]       ☕ [เที่ยว]       │
│                                     │
│  🎉 [ปาร์ตี้]     💼 [ประชุม]       │
│                                     │
│  🏠 [อยู่บ้าน]     👗 [ดูทั้งหมด]  │
│                                     │
│  หรือพิมพ์บอกฉันเลยก็ได้!            │
│  ┌─────────────────────────────┐   │
│  │ เช่น "หาชุดไปงานแต่ง"       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘

= START USING IMMEDIATELY!
= NATURAL CONVERSATION BEGINS!
```

---

## 📊 Complete Data Structure

```json
{
  "user_profile": {
    "display_name": "NW",
    "name_required": true,
    "department": "women",
    "age_range": "20-29",
    "style_preferences": [
      "minimalist",
      "casual_chic"
    ],
    "min_styles_required": 2,
    "onboarding_completed": true,
    "completion_timestamp": "2025-11-02T16:30:00Z",
    "completion_time_seconds": 95,
    "language_tone": "casual_gen_z"
  }
}
```

---

## 🎨 Tone & Voice Guidelines

### **Key Characteristics:**

```
✅ CASUAL & FRIENDLY
- ใช้ "แก/เธอ" (not คุณ)
- ใช้ "ฉัน" (not ดิฉัน/ผม)
- Extended vowels "น้าา", "อ่าา" (cute, Gen Z)
- Informal particles "สิ", "นะ", "เลย"

✅ EXCITED & WARM
- Lots of exclamation marks!
- Emoji in every message 😊💕✨
- Celebratory language
- Encouraging tone

✅ NATURAL THAI
- How friends really talk
- Not textbook Thai
- Gen Z slang acceptable
- Authentic feel

❌ AVOID:
- Formal language (เรียน, ท่าน)
- Stiff phrasing
- Over-polite (ขอโทษค่ะ repeatedly)
- Corporate speak
```

### **Examples:**

```
FORMAL (❌ Don't):
"ขอโทษค่ะ รบกวนท่านกรอกชื่อด้วยค่ะ"

NATURAL (✅ Do):
"แกชื่ออะไรร? บอกมาสิ!"

---

FORMAL (❌):
"เพื่อให้บริการที่ดียิ่งขึ้น กรุณาระบุช่วงอายุ"

NATURAL (✅):
"ขอใส่ใจเพิ่มอีกนิด 😊
แกอายุเท่าไหร่อ่าา?"

---

FORMAL (❌):
"ขอบพระคุณที่ให้ข้อมูล"

NATURAL (✅):
"เริ่ดมากก! 💡"
"ว้าว! เก่งมาก! 😍"
```

---

## 💡 Why This Natural Approach Works

```
✅ AUTHENTIC CONNECTION
- Feels like talking to real friend
- Not corporate bot
- Gen Z will love it
- Creates loyalty

✅ LOWER BARRIER
- Casual = less intimidating
- Easy to engage
- Fun, not formal
- Encourages completion

✅ BRAND PERSONALITY
- OOTDay = Fun, Friendly, Fresh
- Differentiated from competitors
- Memorable experience
- Shareable (word-of-mouth)

✅ THAI CULTURAL FIT
- How young Thais actually talk
- Social media style
- LINE chat feel
- Very relatable

= PERFECT FOR TARGET AUDIENCE! 🎯
```

---

## 🎯 Key Requirements Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ NAME = REQUIRED
   - Cannot proceed without name
   - Clear validation message
   - Friendly reminder if skip

2. ✅ DEPARTMENT = 3 OPTIONS
   - Women's / Men's / Unisex
   - Inclusive approach
   - Simple decision

3. ✅ STYLE = MIN 2 SELECTIONS
   - Must select at least 2
   - Counter shows progress
   - Button disabled until valid
   - Gentle reminder if insufficient

4. ✅ CASUAL TONE
   - Use "แก/เธอ/ฉัน"
   - Gen Z language
   - Emoji-heavy
   - Excited energy

5. ✅ NATURAL FLOW
   - Quick responses
   - Smooth transitions
   - Celebratory completion
   - Immediate value

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIME: 1-2 minutes
COMPLETION: 80%+ expected
FEEL: Like chatting with friend!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✅ Validation Logic

```javascript
// Step 1: Name
const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      message: "อ้าว! ยังไม่ได้บอกชื่อเลย 😅\nบอกชื่อมาหน่อยสิ จะได้รู้จักกัน!"
    }
  }
  
  if (name.trim().length < 2) {
    return {
      valid: false,
      message: "สั้นไปป่าวว? 😊\nเติมอีกนิดนึงสิ!"
    }
  }
  
  if (name.length > 30) {
    return {
      valid: false,
      message: "ยาวไปหน่อย! 😅\nย่อๆ หน่อยนะ"
    }
  }
  
  if (isInappropriate(name)) {
    return {
      valid: false,
      message: "เอ้ย! เลือกชื่อที่เหมาะสมๆ หน่อยนะ 🙏"
    }
  }
  
  return { valid: true }
}

// Step 2: Department
const validateDepartment = (dept) => {
  if (!dept) {
    return {
      valid: false,
      message: "เลือกสักอันนะ! 😊\nจะได้รู้ว่าจะหาของไหนให้!"
    }
  }
  return { valid: true }
}

// Step 3: Age
const validateAge = (age) => {
  if (!age) {
    return {
      valid: false,
      message: "เอ้ย! ยังไม่ได้เลือกเลย 😅\nเลือกสักอันนะ!"
    }
  }
  return { valid: true }
}

// Step 4: Style (MINIMUM 2!)
const validateStyle = (selections) => {
  if (selections.length < 2) {
    return {
      valid: false,
      message: "อ้าว! เลือกอีกหน่อยสิ! 😊\n\nเลือกอย่างน้อย 2 แบบนะ\nจะได้หาของให้ตรงใจกว่านี้! 💕"
    }
  }
  return { valid: true }
}

// Button state management
const getButtonState = (step, data) => {
  switch(step) {
    case 1: 
      return validateName(data.name).valid
    case 2: 
      return validateDepartment(data.department).valid
    case 3: 
      return validateAge(data.age).valid
    case 4: 
      return data.styles.length >= 2
    default: 
      return true
  }
}
```

---

## 🎨 Design Tokens

```css
/* Casual/Friendly Theme */

:root {
  /* Colors */
  --primary: #FF6B9D;
  --primary-light: #FFB3D1;
  --primary-gradient: linear-gradient(135deg, #FF6B9D, #FF8FB3);
  
  --secondary: #FFD93D;
  --accent: #4A90E2;
  
  --text-primary: #2C3E50;
  --text-secondary: #7F8C8D;
  
  --background: #FFFFFF;
  --surface: #F8F9FA;
  --border: #E0E0E0;
  
  --success: #4CAF50;
  --error: #FF5252;
  
  /* Typography - Casual Feel */
  --font-primary: 'Prompt', 'Sarabun', sans-serif;
  --font-size-xl: 24px;
  --font-size-lg: 20px;
  --font-size-md: 16px;
  --font-size-sm: 14px;
  
  /* Spacing - Comfortable */
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Borders - Friendly Rounds */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* Shadows - Soft */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  
  /* Animation - Snappy */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}

/* Button Styles - Fun & Friendly */
.button-primary {
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  padding: 14px 32px;
  font-size: var(--font-size-md);
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.button-primary:active {
  transform: scale(0.98);
}

.button-primary:disabled {
  background: #E0E0E0;
  color: #BDBDBD;
  cursor: not-allowed;
  box-shadow: none;
}

/* Selection Cards - Interactive */
.selection-card {
  background: white;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.selection-card:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.selection-card.selected {
  border-color: var(--primary);
  background: #FFF5F8;
  transform: scale(1.02);
}

/* Style Image Grid */
.style-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
  padding: var(--space-md);
}

.style-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all var(--transition-normal);
}

.style-item.selected {
  border-color: var(--primary);
  transform: scale(1.05);
}

.style-item.selected::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}
```

---

## 🚀 Implementation Checklist

```
DESIGN:
☐ Create 5 screens with natural tone
☐ Design OOTDay avatar (friendly expressions)
☐ Select 8 style photos (Thai models)
☐ Design validation messages (casual tone)
☐ Create celebration animation
☐ Design profile summary card
☐ Mobile-first responsive

DEVELOPMENT:
☐ Build onboarding flow
☐ Implement name validation (required!)
☐ Add department selection (3 options)
☐ Add age selection
☐ Build style grid (min 2 required)
☐ Add selection counter
☐ Disable button until valid
☐ Add smooth transitions
☐ Implement edit functionality

CONTENT:
☐ Review all Thai copy (casual tone!)
☐ Test tone with Gen Z users
☐ Ensure emoji usage appropriate
☐ Validate "แก/เธอ/ฉัน" usage
☐ Check validation messages friendly
☐ Confirm style descriptions accurate

TESTING:
☐ Test required fields work
☐ Test min 2 styles validation
☐ Test all validation messages
☐ Test smooth transitions
☐ Test edit functionality
☐ User test with target audience
☐ A/B test tone (casual vs formal)
☐ Monitor completion rates

LAUNCH:
☐ Soft launch with beta users
☐ Collect feedback on tone
☐ Monitor metrics
☐ Iterate based on data
☐ Full launch
```

---

## ✅ FINAL SUMMARY

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OOTDAY NATURAL ONBOARDING - FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5 STEPS:
1. 👋 Name (REQUIRED!)
2. 👤 Department (3 options: Women/Men/Unisex)
3. 📅 Age Range
4. 👗 Style (MIN 2 selections!)
5. 🎉 Complete & Ready!

TONE:
- Casual "แก/เธอ/ฉัน"
- Gen Z language
- Extended vowels "น้าา", "อ่าา"
- Emoji-heavy 😊💕✨
- Excited & warm!

KEY FEATURES:
✅ Name required (can't proceed without)
✅ Department = 3 choices (inclusive!)
✅ Style = minimum 2 selections
✅ Natural Thai conversation
✅ Validation with friendly messages
✅ Smooth transitions
✅ Celebration at end
✅ Editable anytime

TIME: 1-2 minutes
COMPLETION: 80%+ expected
FEEL: Chatting with BFF! 💕

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
READY TO BUILD! LET'S GO! 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

