# Chat First Reply — Friendly Format & Readable Chat Bubble

**Date**: 2026-02-15
**Status**: Draft — awaiting approval

---

## Problems (จากที่เห็นใน Screenshot)

### Problem 1: ข้อความเป็น Wall of Text — อ่านยาก
ข้อความใน chat bubble ยาวมาก ไม่มี line break แม้ system prompt จะบอก "max 2-3 sentences, ~280 chars" แต่ AI ยังส่งข้อความยาว ๆ มา แล้ว sanitizer ก็ไม่ได้ตัดให้สั้นพอ

### Problem 2: Markdown ไม่ถูก Render — เห็น `**` ดิบ ๆ
`ChatMessage.tsx:65` แค่ใส่ `{message.content}` เป็น plain text ไม่มี markdown renderer ทำให้ `**Red Glamour Queen**` แสดงดิบ ๆ แทนที่จะเป็นตัวหนา

### ~~Problem 3: ชื่อ "Ken" โผล่มา~~ — KEEP (เรียกชื่อดูเป็นเพื่อน สนิทดี)
`ai-chat-service.ts:1113` inject `userName` จาก user profile — **ไม่ต้องแก้** เรียกชื่อทำให้ดูสนิทเหมือนเพื่อนรู้จักกัน

### Problem 4: ข้อความผสมคำอธิบายสินค้ากับ Styling Tip
AI ยัดทั้งชื่อสินค้า + คำอธิบาย + tip ลงใน conversational text เดียวกัน ทั้งที่ข้อมูลสินค้าอยู่ใน LOOKS_DATA cards อยู่แล้ว

### Problem 5: Tone ยาว/เป็นทางการเกินไป
ควรสั้น ๆ เหมือนเพื่อนส่ง LINE ไม่ใช่บทความ

---

## Current Flow vs. Expected Flow (ASCII)

### Before (ปัจจุบัน — มีปัญหา)

```
 User: "หาชุดไปปาร์ตี้ สีแดง"
          │
          ▼
 ┌─────────────────────────────────────────────────────┐
 │  AI generates full response:                        │
 │                                                     │
 │  "จัดชุดไปปาร์ตี้สีแดงให้แล้วจ้า รับรองว่า          │
 │   สวยเด่นสะดุดตาแน่นอน! สำหรับ Ken ที่              │ ← ชื่อ "Ken" โผล่!
 │   อยากได้ลุคปังๆ OOT คัดเดรสที่มีดีเทล              │
 │   เก๋ๆ มาให้เลือก 2 สไตล์ ทั้งแบบหรูหราและ          │ ← ยาวมาก!
 │   แบบแฟชั่นจัดเต็ม รับรองว่าใส่แล้วมั่นใจ            │
 │   สุดๆ ค่ะ ✨ • **Red Glamour Queen**              │ ← markdown ดิบ
 │   เพิ่มความหรูด้วยเดรสยาวสีแดงที่มีดีเทล            │ ← ผสมสินค้า+tip
 │   ระบายช่วงคอวี ดูแพงและเซ็กซี่เบาๆ เหมาะ          │
 │   กับงานปาร์ตี้กลางคืนมากค่ะ -                      │
 │   **Expressionsevening Maxi Dress**: สีแดง          │ ← ชื่อสินค้าใน bubble
 │   แรงฤทธิ์พร้อมดีเทล Drape สุดหรู..."              │
 │                                                     │
 │  ---LOOKS_DATA---                                   │
 │  LOOK:1|Red Glamour Queen                           │
 │  ITEM:...                                           │
 │  ---END_LOOKS_DATA---                               │
 └─────────────────────────────────────────────────────┘
          │
          ▼
 shortenAssistantMessage() → ตัดเหลือ 420 chars, 4 lines
          │
          ▼
 ChatMessage.tsx: <p>{message.content}</p>  ← plain text, ไม่ render markdown
          │
          ▼
 ┌──────────────────────────────────┐
 │ 💬 Chat Bubble (ที่ user เห็น):    │
 │                                  │
 │ จัดชุดไปปาร์ตี้สีแดงให้แล้วจ้า      │
 │ รับรองว่าสวยเด่นสะดุดตาแน่นอน!   │
 │ สำหรับ Ken ที่อยากได้ลุคปังๆ      │ ← wall of text
 │ OOT คัดเดรสที่มีดีเทลเก๋ๆ        │    ไม่มี formatting
 │ มาให้เลือก 2 สไตล์ ทั้งแบบ       │    ชื่อ Ken โผล่
 │ หรูหราและแบบแฟชั่นจัดเต็ม...      │    ยาว+อ่านยาก
 └──────────────────────────────────┘
```

### After (ที่ต้องการ — สั้น เป็นเพื่อน อ่านง่าย)

```
 User: "หาชุดไปปาร์ตี้ สีแดง"
          │
          ▼
 ┌─────────────────────────────────────────────────────┐
 │  AI generates SHORTER response:                     │
 │                                                     │
 │  "มาแล้วจ้า ชุดปาร์ตี้สีแดง 2 ลุค 🔥               │ ← สั้น 2-3 บรรทัด
 │   ลุคแรกแบบหรู ลุคสองแบบ chic                       │ ← ไม่มีชื่อสินค้า
 │   ลองดูแล้วบอกนะว่าชอบแบบไหน"                      │ ← เหมือนเพื่อนส่ง LINE
 │                                                     │
 │  ---LOOKS_DATA---                                   │
 │  LOOK:1|Red Glamour Queen                           │
 │  ITEM:Red Sequin Dress|Dress|Red|...|SKU01|5990|url │ ← สินค้าอยู่ใน card
 │  ITEM:Black Heels|Footwear|Black|...|SKU02|3990|url │
 │  STYLING:Red crystal clutch bag|Bag                 │
 │  TIP:ใส่คลัตช์แดงคู่เพิ่มความปังอีกระดับ               │
 │  TOTAL:9980                                         │
 │  ---END_LOOKS_DATA---                               │
 └─────────────────────────────────────────────────────┘
          │
          ▼
 shortenAssistantMessage() → sanitize + enforce short
          │
          ▼
 ChatMessage.tsx: <ChatBubble>{renderFriendly(content)}</ChatBubble>
          │                    ↑ render **bold**, newlines, emoji
          ▼
 ┌──────────────────────────────────┐
 │ 💬 Chat Bubble (ที่ user เห็น):    │
 │                                  │
 │ มาแล้วจ้า ชุดปาร์ตี้สีแดง 2 ลุค 🔥 │ ← สั้น กระชับ
 │ ลุคแรกแบบหรู ลุคสองแบบ chic      │ ← เป็นมิตร
 │ ลองดูแล้วบอกนะว่าชอบแบบไหน 😊    │ ← เหมือนเพื่อน
 └──────────────────────────────────┘
 ┌──────────────────────────────────┐
 │ 🎴 Outfit Card 1:                │ ← สินค้าอยู่ในการ์ด
 │   Red Glamour Queen              │
 │   [flat-lay image]               │
 │   🛒 Red Sequin Dress  ฿5,990   │
 │   🛒 Black Heels       ฿3,990   │
 │   Tip: ใส่คลัตช์แดงคู่...         │
 └──────────────────────────────────┘
```

---

## Root Cause Analysis (แผนผังปัญหา)

```
 ┌───────────────────────────────────────────────────────────────┐
 │                    5 ปัญหาที่พบ                                 │
 ├───────────┬───────────┬──────────┬───────────┬────────────────┤
 │ Wall of   │ Raw **md**│ "Ken"    │ สินค้าใน    │ Tone ยาว/       │
 │ Text      │ ไม่ render │ โผล่มา    │ bubble     │ เป็นทางการ       │
 └─────┬─────┴─────┬─────┴────┬─────┴─────┬─────┴──────┬─────────┘
       │           │          │           │            │
       ▼           ▼          ▼           ▼            ▼
 ┌───────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
 │ system    │ │ Chat   │ │ ai-chat│ │ system   │ │ system   │
 │ prompt    │ │Message │ │service │ │ prompt   │ │ prompt   │
 │ v5 ไม่    │ │.tsx    │ │injects │ │ บอก AI   │ │ formal   │
 │ enforce   │ │ line 65│ │userName│ │ ให้อธิบาย  │ │ blocks   │
 │ สั้นพอ     │ │ plain  │ │to      │ │ สินค้าใน   │ │ overpower│
 │           │ │ text   │ │prompt  │ │ chat text│ │ bestie   │
 │           │ │ only   │ │        │ │          │ │ persona  │
 └─────┬─────┘ └───┬────┘ └───┬────┘ └─────┬────┘ └─────┬────┘
       │           │          │            │            │
       ▼           ▼          ▼            ▼            ▼
   File 1       File 2    File 3      File 1        File 1
   prompt-v5    ChatMsg   ai-chat     prompt-v5     prompt-v5
                .tsx      service
```

### Files ที่ต้องแก้

| # | File | ปัญหา | แก้อะไร |
|---|------|--------|---------|
| 1 | `lib/prompts/system-prompt-v5.ts` | AI ตอบยาว, ผสมสินค้า, formal | เพิ่ม strict short format + ตัวอย่างที่ชัด |
| 2 | `components/chat/ChatMessage.tsx` | `**` ไม่ render, ไม่มี line break | เพิ่ม lightweight markdown renderer |
| 3 | `lib/services/ai-chat-service.ts` | inject ชื่อ user, sanitizer ไม่สั้นพอ | guard userName, เพิ่ม aggressive sanitize |

---

## Implementation Plan

### Step 1: Lightweight Markdown Renderer ใน ChatMessage

**File**: `apps/web/components/chat/ChatMessage.tsx`

**ปัญหา**: Line 65 `<p className="text-sm">{message.content}</p>` — plain text เท่านั้น

**แก้**: สร้าง helper function `renderFormattedText(text)` ที่:
- แปลง `**text**` → `<strong>text</strong>`
- แปลง `\n` → `<br />`
- ไม่ต้องใช้ library ใหญ่อย่าง `react-markdown` — แค่ regex ง่าย ๆ

```
 BEFORE:                          AFTER:
 ┌──────────────────────┐        ┌──────────────────────┐
 │ <p>{message.content} │        │ <div>                │
 │ </p>                 │        │  {renderFormatted(   │
 │                      │        │    message.content)} │
 │ "**Bold** text"      │        │ </div>               │
 │  → shows as **Bold** │        │                      │
 │                      │        │ "**Bold** text"      │
 │                      │        │  → shows as Bold     │
 └──────────────────────┘        └──────────────────────┘
```

```typescript
function renderFormattedText(text: string) {
  // Split by newlines first → each line is a paragraph
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {renderInlineFormatting(line)}
    </span>
  ))
}

function renderInlineFormatting(line: string) {
  // Handle **bold** patterns
  const parts = line.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}
```

แล้วเปลี่ยน line 65 จาก:
```tsx
<p className="text-sm">{message.content}</p>
```
เป็น:
```tsx
<div className="text-sm whitespace-pre-wrap">{renderFormattedText(message.content)}</div>
```

---

### Step 2: System Prompt — บังคับ AI ตอบสั้น แบบเพื่อน

**File**: `apps/web/lib/prompts/system-prompt-v5.ts`

**ปัญหา**: Rules อยู่ที่ line 142-147 แต่ไม่ strict พอ + contradicts กับ look presentation format

**แก้**: เขียน rules ใหม่ที่เข้มขึ้น

#### 2a. เปลี่ยน Conversational Text Rules (line 142-148)

จาก:
```
Conversational text rules (for chat bubble readability):
- Keep the conversational section short: max 2-3 sentences
- Keep it under ~280 characters when possible
- Never include price numbers or product URLs in conversational text
- Do not list product-by-product lines in conversational text
- Put detailed item data only inside the ---LOOKS_DATA--- block
```

เป็น:
```
## CRITICAL — CONVERSATIONAL TEXT FORMAT (chat bubble)

Your conversational text MUST be like a friend texting on LINE — short, fun, casual.

STRICT RULES:
1. MAX 2 lines, MAX 120 characters total (shorter is better!)
2. NEVER mention product names, brands, SKUs, prices, or URLs
3. NEVER describe individual items — that's in the LOOKS_DATA cards
4. NEVER use "Look 1:" or "Look 2:" prefixes — cards handle that
5. NEVER use bullet points (•, -, *) in conversational text
6. Use 1-2 emoji max, Thai particles (จ้า, นะ, ค่ะ)

GOOD examples:
- "มาแล้วจ้า 2 ลุคปาร์ตี้สีแดง 🔥 ลองดูเลย"
- "จัดมาให้แล้วนะ ลุคทำงาน chic สุด ✨"
- "เลือกมา 2 แบบ casual สบายๆ ดูเลยค่ะ 😊"

BAD examples (NEVER do this):
- "มาดู Red Glamour Queen กันค่ะ เดรสสีแดง..." ← ชื่อสินค้าใน bubble
- "ลุคแรกใช้ Expressions Maxi Dress คู่กับ..." ← อธิบายสินค้า
- "Look 1: Office Chic..." ← look prefix ใน bubble
- Any text longer than 2 lines ← ยาวเกินไป
```

#### 2b. เพิ่มตัวอย่าง Complete Response (หลัง line 96)

```
EXAMPLE CORRECT RESPONSE FORMAT:
---
มาแล้วจ้า ชุดปาร์ตี้แดง 2 ลุค 🔥 ลองดูเลย

---LOOKS_DATA---
LOOK:1|Red Glamour Queen
ITEM:Red Sequin Dress|Dress|Red|...|SKU01|5990|url
ITEM:Black Strappy Heels|Footwear|Black|...|SKU02|3990|url
ITEM:Gold Clutch|Bag|Gold|...|SKU03|2490|url
STYLING:Gold statement earrings|Jewelry
TIP:ใส่ต่างหูทองเพิ่มความปังอีกระดับ
TOTAL:12470
LOOK:2|Chic Red Evening
ITEM:...
---END_LOOKS_DATA---
---

Notice: Conversational text is ONLY 1 short line. All details are in LOOKS_DATA.
```

---

### Step 3: Sanitizer + User Name Guard

**File**: `apps/web/lib/services/ai-chat-service.ts`

#### ~~3a. Guard User Name Injection~~ — SKIP (เรียกชื่อดูเป็นเพื่อน เก็บไว้)

#### 3b. Aggressive Sanitizer — Strip Product Descriptions

**ปัญหา**: `sanitizeConversationalText()` ตัดได้แค่ bullet + price/link แต่ไม่ตัดคำอธิบายสินค้าที่ไม่มี bullet

**แก้**: เพิ่ม pattern ตัด:
- ข้อความที่มีชื่อ brand (เช่น "Expressions", "Lacoste", "CPS")
- ข้อความที่มี category keyword (เช่น "Maxi Dress", "Midi Skirt")
- ข้อความที่อธิบาย look details ("เดรสยาวสีแดงที่มีดีเทลระบาย...")

```typescript
// เพิ่มใน sanitizeConversationalText():

// Strip lines that describe individual products (contain brand/category terms)
const productDescriptionPattern = /\b(dress|top|skirt|blazer|heels?|sneakers?|pants?|shorts?|blouse|เดรส|กระโปรง|เสื้อ|กางเกง|รองเท้า)\b/i

const cleanedLines = withoutLinks
  .split('\n')
  .filter(line => {
    // Drop lines that are product descriptions (not general advice)
    if (productDescriptionPattern.test(line) && line.length > 60) {
      return false  // Likely a product description, not a greeting
    }
    return true
  })
```

#### 3c. Reduce `MAX_CHAT_MESSAGE_CHARS` and `MAX_CHAT_MESSAGE_LINES`

```typescript
// จาก:
const MAX_CHAT_MESSAGE_CHARS = 420
const MAX_CHAT_MESSAGE_LINES = 4

// เป็น:
const MAX_CHAT_MESSAGE_CHARS = 160  // เหมือน tweet/LINE message
const MAX_CHAT_MESSAGE_LINES = 3    // max 3 บรรทัด
```

---

## Data Flow After Fix (ทั้งหมด)

```
 User: "หาชุดไปปาร์ตี้ สีแดง"
          │
          ▼
 ┌──────────────────────────────────────────────────────────┐
 │ ai-chat-service.ts: processAIChatRequestV5()            │
 │                                                          │
 │ 1. analyzeUserQuery → occasion:"party", color:["red"]   │
 │ 2. Build user preferences context:                       │
 │    ├── Gender: women                                     │
 │    ├── Name: (SKIP — first message, step 1) ← FIX #3a  │
 │    └── Style: (if any)                                   │
 │ 3. Build system prompt with STRICT short format ← FIX #2│
 │ 4. Call AI model (Gemini)                                │
 │ 5. AI returns:                                           │
 │    "มาแล้วจ้า 2 ลุคปาร์ตี้แดง 🔥 ลองดูเลย              │ ← SHORT!
 │     ---LOOKS_DATA---                                     │
 │     LOOK:1|Red Glamour Queen                             │
 │     ITEM:...|ITEM:...|STYLING:...|TIP:...|TOTAL:...     │
 │     ---END_LOOKS_DATA---"                                │
 │                                                          │
 │ 6. shortenAssistantMessage():                            │
 │    ├── Remove ---LOOKS_DATA--- block                     │
 │    ├── sanitizeConversationalText() ← FIX #3b           │
 │    │   ├── Strip URLs ✓                                  │
 │    │   ├── Strip prices ✓                                │
 │    │   ├── Strip "Look N:" ✓                             │
 │    │   └── Strip product descriptions ← NEW             │
 │    ├── Limit: 160 chars, 3 lines ← FIX #3c              │
 │    └── Result: "มาแล้วจ้า 2 ลุคปาร์ตี้แดง 🔥 ลองดูเลย"  │
 │                                                          │
 │ 7. Parse LOOKS_DATA → ChatLook[] (เหมือนเดิม)            │
 └──────────────────────────────────────────────────────────┘
          │
          ├── message: "มาแล้วจ้า 2 ลุคปาร์ตี้แดง 🔥 ลองดูเลย"
          ├── looks: [Look1, Look2]
          ▼
 ┌──────────────────────────────────────────────────────────┐
 │ ChatAssistant.tsx → ChatMessage.tsx:                     │
 │                                                          │
 │ renderFormattedText(message.content) ← FIX #1           │
 │  ├── **bold** → <strong>bold</strong>                    │
 │  ├── \n → <br />                                        │
 │  └── emoji preserved                                    │
 │                                                          │
 │ ┌──────────────────────────────┐                        │
 │ │ 💬 มาแล้วจ้า 2 ลุคปาร์ตี้แดง 🔥 │ ← สั้น สวย อ่านง่าย   │
 │ │    ลองดูเลย                   │                        │
 │ └──────────────────────────────┘                        │
 │                                                          │
 │ ┌──────────────────────────────┐                        │
 │ │ 🎴 Red Glamour Queen         │ ← สินค้าอยู่ใน card     │
 │ │    [flat-lay image]          │                        │
 │ │    🛒 Red Sequin Dress ฿5990 │                        │
 │ │    🛒 Black Heels      ฿3990 │                        │
 │ └──────────────────────────────┘                        │
 └──────────────────────────────────────────────────────────┘
```

---

## ก่อน vs หลัง (User Experience)

```
 ┌────────────────────────────┐    ┌────────────────────────────┐
 │      BEFORE (ปัจจุบัน)       │    │       AFTER (แก้แล้ว)        │
 ├────────────────────────────┤    ├────────────────────────────┤
 │                            │    │                            │
 │ จัดชุดไปปาร์ตี้สีแดงให้แล้ว   │    │ มาแล้วจ้า 2 ลุค            │
 │ จ้า รับรองว่าสวยเด่นสะดุด   │    │ ปาร์ตี้แดง 🔥              │
 │ ตาแน่นอน! สำหรับ Ken ที่    │    │ ลองดูเลย                  │
 │ อยากได้ลุคปังๆ OOT คัดเดรส  │    │                            │
 │ ที่มีดีเทลเก๋ๆ มาให้เลือก 2  │    │ ┌────────────────────────┐│
 │ สไตล์ ทั้งแบบหรูหราและแบบ   │    │ │ Red Glamour Queen      ││
 │ แฟชั่นจัดเต็ม รับรองว่าใส่   │    │ │ [flat-lay image]       ││
 │ แล้วมั่นใจสุดๆ ค่ะ ✨       │    │ │ 🛒 Red Sequin Dress    ││
 │ • **Red Glamour Queen**    │    │ │ 🛒 Black Heels         ││
 │ เพิ่มความหรูด้วยเดรสยาว    │    │ └────────────────────────┘│
 │ สีแดงที่มีดีเทลระบายช่วง   │    │ ┌────────────────────────┐│
 │ คอวี ดูแพงและเซ็กซี่เบาๆ   │    │ │ Chic Red Evening       ││
 │ เหมาะกับงานปาร์ตี้กลางคืน   │    │ │ [flat-lay image]       ││
 │ มากค่ะ                     │    │ │ 🛒 Red Midi Skirt      ││
 │                            │    │ │ 🛒 Pink Satin Blouse   ││
 │ ❌ ยาว, ชื่อ Ken, **ดิบ,   │    │ └────────────────────────┘│
 │    สินค้าใน bubble          │    │ ✅ สั้น, เป็นเพื่อน,       │
 │                            │    │    format สวย, สินค้าใน card│
 └────────────────────────────┘    └────────────────────────────┘
```

---

## Summary: 3 Files, 3 Steps

| Step | File | ทำอะไร | Impact |
|------|------|--------|--------|
| 1 | `ChatMessage.tsx` | เพิ่ม `renderFormattedText()` — render **bold** + `\n` | `**` ไม่โผล่ดิบ + line break ทำงาน |
| 2 | `system-prompt-v5.ts` | เขียน strict rules + ตัวอย่าง short response | AI ตอบสั้น ไม่ยัดสินค้าใน bubble |
| 3 | `ai-chat-service.ts` | Guard userName, strip สินค้า, ลด limit 160 chars | ไม่มี "Ken", ไม่มีคำอธิบายสินค้า |

---

## Testing Checklist

1. ส่ง "หาชุดไปปาร์ตี้ สีแดง" → chat bubble ต้องสั้น ≤3 บรรทัด ≤160 chars
2. ไม่มีชื่อ user ใน bubble (ถ้าเป็น first message)
3. ไม่มี `**` ดิบ ๆ → ถ้ามี bold ต้อง render เป็นตัวหนา
4. ไม่มีชื่อสินค้า/brand ใน bubble — อยู่ใน outfit cards เท่านั้น
5. มี emoji 1-2 ตัว, มี Thai particles (จ้า, นะ, ค่ะ)
6. Outfit cards ยังแสดงสินค้าถูกต้อง (ไม่กระทบ LOOKS_DATA)
7. Run `pnpm vitest run` — all tests pass
