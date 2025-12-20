# Chore: Persist ChatAssistant Visibility State

## Metadata
adw_id: `e0de3305`
prompt: `Fix chat history loss by persisting ChatAssistant visibility in page.tsx for both Desktop and Mobile layouts`

## Chore Description
Currently, when users interact with the ChatAssistant component and then switch to viewing outfit details, the chat history is lost because the ChatAssistant component gets unmounted. This happens in both Desktop and Mobile layouts:

**Desktop Layout (page.tsx:188-190):**
- The ChatAssistant is conditionally hidden using `className` when `viewMode === "detail"`
- The component is completely removed from the DOM when hidden
- When users return to chat mode, the ChatAssistant remounts with fresh state, losing all conversation history

**Mobile Layout (page.tsx:243-251):**
- The ChatInterface (used inside ChatAssistant) is rendered inside a conditional div based on `activeTab === "chat"`
- When users switch tabs, the component unmounts
- Chat history is lost on tab switching

The fix requires:
1. Keep the ChatAssistant component mounted at all times in the Desktop layout
2. Use CSS visibility/positioning instead of conditional rendering to hide/show
3. Apply the same approach to Mobile layout's ChatInterface/ChatAssistant
4. Ensure chat state (messages, session context, conversation ID) persists across view mode changes

## Relevant Files
Use these files to complete the chore:

- **frontend/app/page.tsx:188-202** - Desktop layout with ChatAssistant conditional rendering that needs to be changed to always mount but conditionally hide with CSS
- **frontend/app/page.tsx:243-251** - Mobile layout with ChatInterface conditional rendering that needs the same fix
- **frontend/components/chat/ChatAssistant.tsx** - The component that maintains chat state (messages, sessionContext, conversationId). No changes needed here, but important to understand its state management
- **frontend/lib/hooks/useOutfitDiscovery.ts:22** - Hook that manages viewMode state ('chat' | 'detail'), used to determine visibility
- **frontend/app/page.tsx:25** - activeTab state for mobile navigation ('outfits' | 'chat' | 'filters')

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Desktop Layout ChatAssistant Rendering
- Locate the Desktop layout section in `frontend/app/page.tsx` (lines 153-203)
- Remove the conditional hiding of ChatAssistant (line 188: `className={...}`)
- Change the ChatAssistant wrapper div to always render but use CSS to control visibility
- Apply `className="h-full"` when `viewMode === 'chat'`
- Apply `className="h-full hidden"` when `viewMode === 'detail'`
- Ensure the ChatAssistant component stays mounted regardless of viewMode

### 2. Update Mobile Layout ChatInterface Rendering
- Locate the Mobile layout section in `frontend/app/page.tsx` (lines 206-300)
- Find the chat tab rendering (lines 243-251)
- Remove the conditional `className={activeTab === "chat" ? "block h-full" : "hidden"}`
- Change to always render the ChatInterface with visibility controlled by CSS
- Apply `className="block h-full"` when `activeTab === 'chat'`
- Apply `className="hidden"` when `activeTab !== 'chat'`
- Note: ChatInterface is a wrapper that uses ChatAssistant internally, so this will preserve its state

### 3. Verify Component State Persistence
- Review the ChatAssistant component to confirm it uses useState for messages, sessionContext, and conversationId
- Ensure no useEffect dependencies will cause state resets when parent re-renders
- Confirm the component doesn't have any unmount cleanup that would lose state

### 4. Test Both Layouts
- Test Desktop layout: Start a chat conversation, view an outfit detail, return to chat - verify history persists
- Test Mobile layout: Start a chat conversation, switch to outfits tab, switch back - verify history persists
- Test that switching between chat and detail views doesn't cause unnecessary re-renders
- Verify no visual glitches or layout shifts when toggling visibility

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd frontend && pnpm build` - Ensure TypeScript compiles without errors
- `cd frontend && pnpm lint` - Check for linting issues
- Manual testing in browser:
  - Desktop: Open app, send chat messages, click outfit to view details, click back - chat should still have messages
  - Mobile: Open app, send chat messages, switch to "ชุด" tab, switch back to "แชท" tab - chat should still have messages
  - Verify React DevTools shows ChatAssistant component stays mounted

## Notes
- This is a pure UI/state management fix - no API changes needed
- The root cause is React's behavior of unmounting components when removed from the render tree
- Using CSS visibility instead of conditional rendering is a common pattern to preserve component state
- The ChatAssistant already has proper state management with useState hooks, we just need to keep it mounted
- Session context and conversation ID are particularly important to preserve for the chat API to work correctly
