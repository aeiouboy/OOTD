# Plan: Unify Desktop & Mobile Chat UI

## Task Description
The Chat with Agent UI currently renders two completely different components for desktop and mobile:
- **Desktop** uses `ChatAssistant` (in `ResizablePanel`) — has v5 looks-to-outfits conversion, `OutfitRecommendationCard`, flat-lay image generation, visual consistency validation, `ChatHeader` with status/clear, `QuickPrompts` with scrollable Thai occasion pills, and rich user preferences.
- **Mobile** uses `ChatInterface` (in bottom tab) — has raw inline look Cards, legacy outfit cards, basic `<Input>`, conversation starters from mock data, and only passes gender for user preferences.

These are **two completely separate components** with **independent message state**. A user chatting on desktop sees entirely different history and UI than on mobile. A `ChatProvider` context file already exists (`ChatProvider.tsx`) but is not wired into either component.

This plan unifies both views to use a single shared chat state and a single rendering component so desktop and mobile show identical chat history and features.

## Objective
When this plan is complete:
1. Desktop and mobile share the **same chat state** (messages, session context, conversation ID)
2. Both views render the **same components** (ChatHeader, ChatMessage, QuickPrompts, OutfitRecommendationCard)
3. The deprecated `ChatInterface` component is removed
4. The UI is responsive — works in a 280px+ side panel AND full-screen mobile
5. All existing features (flat-lay generation, try-on, clear chat, quick prompts) work on both views

## Problem Statement
The root cause is architectural: `page.tsx` renders two separate layouts (`renderDesktopLayout` / `renderMobileLayout`) that embed different chat components. Each chat component owns its own `useState` for messages, leading to split state. The `ChatProvider` context was created to solve this but never integrated.

### Specific issues:
| Issue | Desktop (`ChatAssistant`) | Mobile (`ChatInterface`) |
|---|---|---|
| Chat state | Own `useState<ChatMessageType[]>` | Own `useState<ChatMessage[]>` |
| API response | Converts `looks` → `Outfit[]` via mapping | Stores raw `looks` on message |
| Outfit rendering | `OutfitRecommendationCard` with flat-lay | Inline `Card` inside chat bubble (white on purple) |
| Input | `ChatInput` (textarea, attachment, pill shape) | Basic `<Input>` (rounded, no attachment) |
| Header | `ChatHeader` (avatar, status, clear, dropdown) | None (only test mode bar) |
| Quick actions | `QuickPrompts` (7 Thai occasion pills + expandable) | `quickActions` from mock-data (English labels) |
| User prefs sent | gender, userName, ageRange, stylePreferences | gender only |
| Auto-scroll | No `scrollToBottom` ref | Has `messagesEndRef` with smooth scroll |
| Welcome message | Thai greeting via useEffect | English welcome screen with icon + starters |

## Solution Approach

### Strategy: "ChatProvider as Single Source of Truth"

1. **Wire `ChatProvider` into `page.tsx`** at the top level so both desktop and mobile layouts share the same chat context.
2. **Refactor `ChatAssistant`** to consume chat state from `useChatContext()` instead of owning it locally.
3. **Replace `ChatInterface` usage in mobile** with the refactored `ChatAssistant` (which is now just a "chat view" component).
4. **Make `ChatAssistant` responsive** — it already works in a 280px panel; ensure it also works full-screen on mobile with scroll-to-bottom.
5. **Delete `ChatInterface.tsx`** — it's superseded.
6. **Add auto-scroll** to ChatAssistant (missing feature from ChatInterface).

### What we keep from each component:
- **From ChatAssistant**: Everything (it's the more feature-complete version)
- **From ChatInterface**: `scrollToBottom` via `messagesEndRef` (missing from ChatAssistant)
- **From ChatProvider**: Chat logic centralization (already written, needs integration)

## Relevant Files
Use these files to complete the task:

- `apps/web/app/page.tsx` — Main page that renders desktop/mobile layouts. **This is where ChatProvider will be wired in** and where ChatInterface is replaced.
- `apps/web/components/chat/ChatProvider.tsx` — **Already-written** context provider. Needs minor updates (add onViewOutfit callback, expose auto-scroll).
- `apps/web/components/chat/ChatAssistant.tsx` — Desktop chat component. Will be refactored to consume `useChatContext()` instead of local state.
- `apps/web/components/chat/ChatInterface.tsx` — Mobile chat component. **Will be deleted** after migration.
- `apps/web/components/chat/ChatHeader.tsx` — Chat header with status. Already used by ChatAssistant, will now also appear on mobile.
- `apps/web/components/chat/ChatInput.tsx` — Rich input with attachment. Already used by ChatAssistant.
- `apps/web/components/chat/ChatMessage.tsx` — Message bubble renderer. Already used by ChatAssistant.
- `apps/web/components/chat/QuickPrompts.tsx` — Thai occasion quick-action pills. Already used by ChatAssistant.
- `apps/web/components/chat/OutfitRecommendationCard.tsx` — Rich outfit card with flat-lay + try-on. Used by ChatAssistant.
- `apps/web/lib/types.ts` — Type definitions for `ChatMessage`, `Outfit`, etc.
- `apps/web/lib/types/chat-types.ts` — `SessionContext` type.
- `apps/web/lib/mock-data.ts` — `conversationStarters`, `quickActions`, `getMockOutfitResponse`. Review if still needed after unification.

### New Files
None — we are consolidating, not creating.

## Implementation Phases

### Phase 1: Foundation — Wire ChatProvider & Update Context
1. Update `ChatProvider.tsx` to accept and expose `onViewOutfit` callback
2. Add `messagesEndRef` and auto-scroll behavior to the context
3. Wrap the main app content in `page.tsx` with `<ChatProvider>`
4. Verify context is accessible from both desktop and mobile sections

### Phase 2: Core Implementation — Refactor ChatAssistant
1. Strip local state from `ChatAssistant` (messages, isTyping, sessionContext, etc.)
2. Replace with `useChatContext()` hook consumption
3. Add `messagesEndRef` with auto-scroll on new messages
4. Accept `onViewOutfit` via context or props
5. Ensure the component works at any width (280px panel to full-screen)

### Phase 3: Integration — Replace Mobile ChatInterface
1. In `page.tsx` `renderMobileLayout()`, replace `<ChatInterface>` with `<ChatAssistant>`
2. Pass through the same `onViewOutfit` handler
3. Remove all `ChatInterface` imports and references
4. Delete `apps/web/components/chat/ChatInterface.tsx`

### Phase 4: Polish & Responsive Fixes
1. Test mobile layout: ensure ChatHeader, QuickPrompts, ChatInput render correctly on small screens
2. Add responsive tweaks if needed (padding, font sizes)
3. Verify auto-scroll works on both views
4. Test clear chat works from both views (same state)

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to do the building, validating, testing, deploying, and other tasks.

### Team Members

- Builder
  - Name: builder-chat-provider
  - Role: Update ChatProvider context and wire it into page.tsx
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-chat-unify
  - Role: Refactor ChatAssistant to consume context and replace ChatInterface on mobile
  - Agent Type: builder
  - Resume: true

- Validator
  - Name: validator-chat-ui
  - Role: Validate the unified chat UI works correctly on both desktop and mobile
  - Agent Type: validator
  - Resume: false

- Builder
  - Name: builder-docs
  - Role: Update README.md with accurate chat architecture documentation
  - Agent Type: builder
  - Resume: false

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Update ChatProvider Context
- **Task ID**: update-chat-provider
- **Depends On**: none
- **Assigned To**: builder-chat-provider
- **Agent Type**: builder
- **Parallel**: false
- Update `apps/web/components/chat/ChatProvider.tsx`:
  - Add `onViewOutfit: (outfit: Outfit) => void` to the context value (passed via props)
  - Add a `messagesEndRef: React.RefObject<HTMLDivElement>` to the context
  - Add `useEffect` to auto-scroll when messages change
  - Ensure `handleSendMessage` properly captures latest messages (fix stale closure with useRef pattern)
- Wire `<ChatProvider>` into `apps/web/app/page.tsx`:
  - Wrap the return JSX (after onboarding check) with `<ChatProvider>`
  - Pass `onViewOutfit={selectOutfit}` to the provider
- Verify no TypeScript errors: `cd apps/web && npx tsc --noEmit`

### 2. Refactor ChatAssistant to Use Context
- **Task ID**: refactor-chat-assistant
- **Depends On**: update-chat-provider
- **Assigned To**: builder-chat-unify
- **Agent Type**: builder
- **Parallel**: false
- Refactor `apps/web/components/chat/ChatAssistant.tsx`:
  - Remove all local state: `messages`, `isTyping`, `testMode`, `sessionContext`, `conversationId`, `generatingImage`, `imageGenerationError`, `allProducts`
  - Remove `handleSendMessage`, `handleClearChat`, `getChatStatus`, `generateFlatLayForOutfit`, `applyProductReplacements` functions
  - Import `useChatContext` from `./ChatProvider`
  - Destructure: `const { messages, isTyping, generatingImage, handleSendMessage, handleClearChat, getChatStatus } = useChatContext()`
  - Keep testMode as local state (it's UI-only)
  - Keep `onViewOutfit` prop (or get from context)
  - Add `messagesEndRef` + auto-scroll useEffect
  - Remove the ResizablePanel context dependency (make it optional — the component may or may not be inside one)
- Ensure OutfitRecommendationCard still receives correct outfit data
- Ensure the component renders correctly at mobile widths (full screen) AND desktop panel widths

### 3. Replace ChatInterface with ChatAssistant on Mobile
- **Task ID**: replace-mobile-chat
- **Depends On**: refactor-chat-assistant
- **Assigned To**: builder-chat-unify
- **Agent Type**: builder
- **Parallel**: false
- In `apps/web/app/page.tsx` `renderMobileLayout()`:
  - Replace `<ChatInterface onOutfitSelect={...} onViewDetails={selectOutfit} />` with `<ChatAssistant onViewOutfit={selectOutfit} />`
  - Remove `ChatInterface` import
- Delete `apps/web/components/chat/ChatInterface.tsx`
- Run TypeScript check: `cd apps/web && npx tsc --noEmit`
- Run tests: `cd apps/web && pnpm test --run`

### 4. Validate Unified Chat UI
- **Task ID**: validate-chat-ui
- **Depends On**: replace-mobile-chat
- **Assigned To**: validator-chat-ui
- **Agent Type**: validator
- **Parallel**: false
- **Verification checklist**:
  - [ ] `ChatInterface.tsx` is deleted
  - [ ] `ChatAssistant.tsx` uses `useChatContext()` — no local `useState` for messages
  - [ ] `page.tsx` wraps content with `<ChatProvider>`
  - [ ] `page.tsx` uses `<ChatAssistant>` in BOTH desktop and mobile layouts
  - [ ] `ChatProvider.tsx` provides: messages, isTyping, handleSendMessage, handleClearChat, getChatStatus
  - [ ] No references to `ChatInterface` remain in any file
  - [ ] TypeScript compiles: `cd apps/web && npx tsc --noEmit`
  - [ ] Tests pass: `cd apps/web && pnpm test --run`
  - [ ] Desktop layout still shows chat in ResizablePanel
  - [ ] Mobile layout shows chat in full-screen tab
  - [ ] Both views render: ChatHeader, ChatMessage, QuickPrompts, OutfitRecommendationCard, ChatInput
  - [ ] Auto-scroll works when new messages arrive
  - [ ] Clear chat resets messages in both views
  - [ ] Quick prompts send messages correctly

### 5. Update README Documentation
- **Task ID**: update-readme
- **Depends On**: validate-chat-ui
- **Assigned To**: builder-docs
- **Agent Type**: builder
- **Parallel**: false
- Update `README.md` to reflect the unified chat architecture:
  - Update the "Tech Stack" or relevant section to mention ChatProvider pattern
  - Add a brief note about the unified desktop/mobile chat
  - Remove any references to `ChatInterface` if present
- Keep changes minimal — only document what changed

## Acceptance Criteria
1. **Shared state**: Sending a message in desktop chat shows the same message if you switch to mobile (and vice versa)
2. **Same components**: Both views use ChatHeader, ChatMessage, QuickPrompts, OutfitRecommendationCard, ChatInput
3. **No ChatInterface**: `ChatInterface.tsx` is deleted, no imports remain
4. **ChatProvider**: `ChatProvider` wraps the main page and provides shared chat state
5. **TypeScript clean**: `npx tsc --noEmit` passes with no errors
6. **Tests pass**: `pnpm test --run` passes
7. **Responsive**: Chat UI works at mobile widths (320px+) and desktop panel widths (280px-800px)
8. **Auto-scroll**: Messages area auto-scrolls to bottom on new messages
9. **Clear chat**: Works from both views, resets to Thai greeting
10. **README updated**: Documents the unified chat architecture

## Validation Commands
Execute these commands to validate the task is complete:

- `cd apps/web && npx tsc --noEmit` — TypeScript compilation check
- `cd apps/web && pnpm test --run` — Run Vitest test suite
- `cd apps/web && pnpm lint` — Lint check
- `grep -r "ChatInterface" apps/web/ --include="*.tsx" --include="*.ts" -l` — Should return ZERO files (ChatInterface fully removed)
- `grep -r "useChatContext" apps/web/components/chat/ChatAssistant.tsx` — Should find the hook usage
- `grep -r "ChatProvider" apps/web/app/page.tsx` — Should find the provider wrapper

## Notes
- The `ChatProvider.tsx` file is currently untracked (new file). It contains the full chat logic including v5 looks transformation, flat-lay generation, and session management.
- The `ChatAssistant` component's `try { useResizablePanelContext() }` pattern should be preserved — it allows the component to optionally access resize controls when inside a `ResizablePanel`.
- `testMode` state should remain local to `ChatAssistant` since it's a UI toggle, not shared chat state.
- The `conversationStarters` and `quickActions` from `mock-data.ts` are only used by `ChatInterface` and can be orphaned after deletion. They should NOT be deleted as they may be used by test scenarios.
- Image generation (flat-lay) is already handled by `ChatProvider` — `OutfitRecommendationCard` also has its own `useFlatLayGeneration` hook as a fallback, so the system is robust.
