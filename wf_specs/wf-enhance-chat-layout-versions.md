# Wireframe: Enhanced Chat Layout & Chat Bar

**Document ID:** wf-enhance-chat-layout
**Created:** 2026-01-26
**Status:** Draft
**Target:** OOTDay Chat Interface Enhancement

---

## Current State Analysis

### Existing Structure
```
┌─────────────────────────────────────┐
│ ChatHeader                          │
│ "OOTDay Stylist" + Subtitle         │
├─────────────────────────────────────┤
│                                     │
│ Messages Area (scrollable)          │
│ - Welcome message                   │
│ - Chat bubbles (user/assistant)     │
│ - Outfit recommendation cards       │
│ - Typing indicator                  │
│                                     │
├─────────────────────────────────────┤
│ QuickPrompts (2x2 grid)             │
│ [ชุดไปทำงาน] [ชุดไปงานแต่ง]         │
│ [ชุดใส่เที่ยว] [ชุดวันหยุด]          │
├─────────────────────────────────────┤
│ ChatInput                           │
│ [    พิมพ์ข้อความ...    ] [Send]    │
└─────────────────────────────────────┘
```

### Current Pain Points
1. Input bar is basic - single line, no attachments
2. Quick prompts take up fixed space even when not needed
3. Header is static with no dynamic status
4. Limited visual hierarchy in chat messages
5. No voice input or rich media options

---

## Version 1: Minimalist Enhancement

**Theme:** Clean, focused, distraction-free
**Best For:** Users who prefer simplicity

### Layout
```
┌─────────────────────────────────────┐
│ [←]  OOTDay Stylist        [•••]   │
│       ○ Online                      │
├─────────────────────────────────────┤
│                                     │
│         Welcome, Sarah! 👋          │
│    What would you like to wear?     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🤖 สวัสดีค่ะ! ยินดีช่วยเลือก     │ │
│ │    ชุดให้นะคะ                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│              ┌─────────────────────┐│
│              │ ขอชุดไปทำงานค่ะ   👤││
│              └─────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│ ╭───────────────────────────────╮   │
│ │ พิมพ์ข้อความ...              │   │
│ │                         [📎][➤]│   │
│ ╰───────────────────────────────╯   │
│                                     │
│   Quick: [งานแต่ง] [ทำงาน] [เที่ยว]  │
└─────────────────────────────────────┘
```

### Key Features

#### 1. Enhanced Header
- **Back button** - Navigation context
- **Online status indicator** - Green dot with status text
- **Options menu** - Settings, clear chat, help

#### 2. Streamlined Messages
- **Personalized welcome** - Uses user's name from profile
- **Minimal bubble styling** - Clean rounded corners
- **Avatar indicators** - Small emoji/icon for bot vs user

#### 3. Improved Chat Bar
```
┌────────────────────────────────────────────┐
│ ╭────────────────────────────────────────╮ │
│ │ พิมพ์ข้อความ...                        │ │
│ │                                  [📎][➤]│ │
│ ╰────────────────────────────────────────╯ │
│                                            │
│  [งานแต่ง] [ทำงาน] [เที่ยว] [+]           │
└────────────────────────────────────────────┘
```
- **Single-line input** with expand capability
- **Attachment button** - Image upload for "style this"
- **Floating send button** - Inside input field
- **Horizontal quick chips** - Scrollable, compact
- **"+" button** - Shows more quick prompts

#### 4. Component Specifications

| Element | Height | Padding | Border Radius |
|---------|--------|---------|---------------|
| Header | 56px | px-4 py-3 | - |
| Input Container | 48px | px-4 py-2 | 24px |
| Quick Chips | 32px | px-3 py-1 | 16px |
| Send Button | 36px | - | 18px |

---

## Version 2: Rich Interactive Experience

**Theme:** Feature-rich, engaging, modern messenger
**Best For:** Power users who want more control

### Layout
```
┌─────────────────────────────────────┐
│ ┌───┐ OOTDay Stylist        [📞][⚙]│
│ │ 🎀│ Online • Typing...            │
│ └───┘                               │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎀  สวัสดีค่ะ! มีอะไรให้ช่วย     │ │
│ │     ไหมคะ?                       │ │
│ │     ─────────────────            │ │
│ │     📍 Based on: Minimal Style   │ │
│ │     ⏰ 10:30                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [💡 Suggestions ▼]                  │
│ ┌──────────┐ ┌──────────┐          │
│ │ 👔       │ │ 👗       │          │
│ │ ชุดทำงาน  │ │ ชุดออกงาน │          │
│ │ Formal   │ │ Semi     │          │
│ └──────────┘ └──────────┘          │
│                                     │
├═════════════════════════════════════┤
│                                     │
│ [🖼] [📷] [🎤]                       │
│ ╭───────────────────────────────╮   │
│ │ พิมพ์ข้อความ...                │   │
│ │                               │   │
│ │ ────────────────────────────  │   │
│ │ [😊]                     [➤] │   │
│ ╰───────────────────────────────╯   │
│                                     │
│ [Undo] [Clear] [Save Chat]          │
└─────────────────────────────────────┘
```

### Key Features

#### 1. Enhanced Header with Avatar
- **Animated avatar** - Brand mascot with status
- **Real-time status** - "Typing...", "Online", "Generating..."
- **Quick actions** - Voice call concept, Settings

#### 2. Rich Message Cards
```
┌─────────────────────────────────────┐
│ 🎀  AI Message Content              │
│     ─────────────────               │
│     📍 Context Tag: Minimal Style   │
│     ⏰ Timestamp      [👍][👎][🔄]  │
└─────────────────────────────────────┘
```
- **Context indicators** - Shows what style/mood was detected
- **Reaction buttons** - Feedback mechanism
- **Refresh option** - Regenerate response

#### 3. Suggestion Carousel
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ 👔       │ │ 👗       │ │ 🎽       │
│ Work     │ │ Party    │ │ Casual   │
│ 5 looks  │ │ 8 looks  │ │ 12 looks │
└──────────┘ └──────────┘ └──────────┘
     ← Swipeable Carousel →
```
- **Visual category cards** - Outfit type previews
- **Look count** - Shows available options
- **Swipeable** - Horizontal scroll

#### 4. Advanced Input Bar
```
┌────────────────────────────────────────────┐
│ [🖼] [📷] [🎤]          ← Media options    │
├────────────────────────────────────────────┤
│ ╭────────────────────────────────────────╮ │
│ │ พิมพ์ข้อความ...                        │ │
│ │ (Multi-line expandable)                │ │
│ │ ────────────────────────────────────   │ │
│ │ [😊]                              [➤] │ │
│ ╰────────────────────────────────────────╯ │
├────────────────────────────────────────────┤
│ [↩️ Undo] [🗑 Clear] [💾 Save] [📤 Share]  │
└────────────────────────────────────────────┘
```
- **Media buttons row** - Gallery, Camera, Voice
- **Multi-line input** - Auto-expand up to 4 lines
- **Emoji picker** - Quick emoji access
- **Action toolbar** - Undo, Clear, Save, Share

#### 5. Component Specifications

| Element | Height | Special |
|---------|--------|---------|
| Header | 72px | Avatar 40x40 |
| Message Card | Auto | Min 80px, context bar 24px |
| Suggestion Card | 100px | 80px width each |
| Input Container | 56-120px | Expandable |
| Media Row | 44px | 36px buttons |
| Action Toolbar | 40px | 32px buttons |

---

## Version 3: Contextual AI-First Design

**Theme:** AI-centric, proactive, fashion-forward
**Best For:** Users who want AI to take the lead

### Layout
```
┌─────────────────────────────────────┐
│  ✨ OOTDay AI                       │
│  ─────────────────────────────────  │
│  📅 Today: Sunny, 28°C              │
│  🎯 Mood: Business Casual           │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  ☀️ Good Morning, Sarah!         │ │
│ │                                 │ │
│ │  Based on today's weather and   │ │
│ │  your schedule, I suggest:      │ │
│ │                                 │ │
│ │  ┌─────────────────────────┐   │ │
│ │  │   [Outfit Preview]      │   │ │
│ │  │   Light Blazer + Linen  │   │ │
│ │  │   ★★★★☆ Match Score: 92%│   │ │
│ │  └─────────────────────────┘   │ │
│ │                                 │ │
│ │  [👍 Love it] [🔄 Try another]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ═══════════ Or ask me ═══════════  │
│                                     │
├─────────────────────────────────────┤
│ ╭───────────────────────────────╮   │
│ │ 🎤 "Show me wedding outfits"  │   │
│ │    ───────────────────────    │   │
│ │    [Hold to speak]            │   │
│ ╰───────────────────────────────╯   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔥 Trending    🎨 By Color      │ │
│ │ 📸 Upload Look  🗓 Calendar     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Key Features

#### 1. Contextual Header
```
┌─────────────────────────────────────┐
│  ✨ OOTDay AI                 [👤]  │
│  ─────────────────────────────────  │
│  📅 Monday, Jan 26 • Sunny 28°C    │
│  🎯 Suggested: Business Casual      │
│  📍 Office Day                      │
└─────────────────────────────────────┘
```
- **Dynamic context** - Weather, calendar integration concept
- **AI mood suggestion** - Proactive style recommendation
- **Location context** - Office/Home/Event awareness

#### 2. Proactive AI Card
```
┌─────────────────────────────────────┐
│  ☀️ AI-Generated Greeting           │
│                                     │
│  Personalized recommendation text   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     [Outfit Preview Image]   │   │
│  │                              │   │
│  │  Light Blazer + Linen Pants │   │
│  │  ★★★★☆ Match Score: 92%     │   │
│  │  💰 ฿4,590 total            │   │
│  └─────────────────────────────┘   │
│                                     │
│  [👍 Love it] [🔄 Another] [📝 Edit] │
└─────────────────────────────────────┘
```
- **Pre-generated outfit** - AI anticipates needs
- **Match score** - Confidence indicator
- **Price total** - Budget awareness
- **Quick actions** - Accept, regenerate, customize

#### 3. Voice-First Input
```
┌─────────────────────────────────────┐
│ ╭───────────────────────────────╮   │
│ │ 🎤 "Show me wedding outfits"  │   │
│ │    ───────────────────────    │   │
│ │    [Hold to speak] or type    │   │
│ ╰───────────────────────────────╯   │
│                                     │
│ Recent: "ชุดทำงาน" "ชุดไปเที่ยว"      │
└─────────────────────────────────────┘
```
- **Voice-centric** - Microphone as primary
- **Transcription preview** - Shows what AI heard
- **Recent queries** - Quick repeat access

#### 4. Smart Action Grid
```
┌─────────────────────────────────────┐
│ ┌───────────┐ ┌───────────┐        │
│ │ 🔥        │ │ 🎨        │        │
│ │ Trending  │ │ By Color  │        │
│ │ 12 new    │ │ Palettes  │        │
│ └───────────┘ └───────────┘        │
│ ┌───────────┐ ┌───────────┐        │
│ │ 📸        │ │ 🗓        │        │
│ │ Upload    │ │ Calendar  │        │
│ │ Style Me  │ │ Plan Week │        │
│ └───────────┘ └───────────┘        │
└─────────────────────────────────────┘
```
- **Trending** - Today's popular looks
- **By Color** - Color-based outfit search
- **Upload** - Style a photo of clothing
- **Calendar** - Plan outfits for the week

#### 5. Component Specifications

| Element | Height | Special |
|---------|--------|---------|
| Context Header | 88px | 3-line info stack |
| AI Card | Auto | Min 200px with preview |
| Voice Input | 72px | Pulse animation |
| Action Grid | 168px | 2x2, 76px each |

---

## Comparison Matrix

| Feature | V1 Minimalist | V2 Rich | V3 AI-First |
|---------|---------------|---------|-------------|
| **Complexity** | Low | High | Medium |
| **Learning Curve** | Easy | Moderate | Easy |
| **Input Style** | Text | Multi-modal | Voice + Text |
| **AI Proactivity** | Reactive | Reactive | Proactive |
| **Screen Space** | Compact | Expanded | Balanced |
| **Quick Actions** | Chips | Cards | Grid |
| **Personalization** | Basic | Moderate | High |
| **Best Viewport** | Mobile | Desktop | Both |

---

## Implementation Priority

### Phase 1 (MVP Enhancement)
1. Enhanced input bar with attachment
2. Horizontal quick prompts
3. Online status indicator
4. Improved message styling

### Phase 2 (Rich Features)
1. Suggestion carousel
2. Message reactions
3. Multi-line expandable input
4. Media upload buttons

### Phase 3 (AI-First)
1. Contextual header
2. Proactive AI recommendations
3. Voice input integration
4. Smart action grid

---

## Technical Considerations

### Shared Components Needed
- `EnhancedChatInput` - Expandable, multi-modal input
- `QuickChips` - Horizontal scrollable chips
- `SuggestionCarousel` - Swipeable category cards
- `StatusIndicator` - Online/typing/generating states
- `MessageReactions` - Feedback buttons
- `VoiceInput` - Speech-to-text component
- `ContextHeader` - Dynamic weather/calendar header

### Dependencies
- Voice input: Web Speech API or third-party
- Weather: OpenWeather API or similar
- Calendar: Google Calendar integration concept
- Image upload: Existing attachment flow

---

## Next Steps

1. **Review** - Team feedback on 3 versions
2. **Select** - Choose primary direction
3. **Prototype** - Interactive mockup
4. **User Test** - Validate with users
5. **Implement** - Phased development

---

*Document authored for OOTDay Chat Enhancement Initiative*
