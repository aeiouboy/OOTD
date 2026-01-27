# Chore: Remove Separate LOOKs Generation Message After Flat-Lay Display

## Metadata
adw_id: `1deedc0d`
prompt: `Remove separate LOOKs generation message after flat-lay image is displayed in outfit card`

## Chore Description
After a flat-lay image is successfully generated and displayed in the outfit recommendation card, a separate acknowledgment message `'กำลังสร้างภาพ LOOKs จากสินค้าที่แนะนำสักครู่นะคะ... 🎨'` still appears below the card. This message should be removed once the flat-lay is shown in the card to avoid redundant/duplicate messaging.

**Current Buggy Flow:**
1. User requests outfit → Card shows loading skeleton
2. Separate message appears: `'กำลังสร้างภาพ LOOKs จากสินค้าที่แนะนำสักครู่นะคะ... 🎨'`
3. Flat-lay generates → Card shows flat-lay image
4. **BUG:** Separate message STILL shows (should be removed)

**Expected Flow:**
1. User requests outfit → Card shows loading skeleton
2. Optionally show separate acknowledgment message while loading
3. Flat-lay generates → Card shows flat-lay image
4. **Remove the separate acknowledgment message** since the card now displays the image

## Relevant Files
Use these files to complete the chore:

- **`apps/web/components/chat/ChatAssistant.tsx`** - Main file containing the bug. The acknowledgment message is added at lines 247-253 and 294-300, but never removed after flat-lay generation completes. The `generateFlatLayForOutfit` callback (lines 80-171) updates outfit data but doesn't remove the acknowledgment message.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Track the Acknowledgment Message ID
- At lines 247-253 (for successful API response) and 294-300 (for mock/fallback response), store the acknowledgment message ID in a variable
- Create a reference that can be used to identify and remove this specific message later

### 2. Remove Acknowledgment Message After Flat-Lay Generation Completes
- After the for-loop that calls `generateFlatLayForOutfit` for each outfit completes (around lines 259-266 for API response, lines 305-312 for mock response)
- Filter out the acknowledgment message from the messages array using `setMessages`
- This should happen BEFORE `setGeneratingImage(false)` is called

### 3. Implement the Message Removal Logic
- Add a `setMessages` call that filters out messages with the acknowledgment message ID
- Example pattern:
  ```typescript
  setMessages((prev) => prev.filter((msg) => msg.id !== acknowledgmentMessageId))
  ```
- Apply this pattern in both locations:
  - After line 263 (successful API response path)
  - After line 309 (mock/fallback response path)

### 4. Alternative Simpler Approach (Recommended)
- Instead of tracking message IDs, filter out messages containing the specific acknowledgment text
- This is simpler and more robust since the acknowledgment text is unique
- Pattern:
  ```typescript
  setMessages((prev) => prev.filter((msg) =>
    msg.content !== 'กำลังสร้างภาพ LOOKs จากสินค้าที่แนะนำสักครู่นะคะ... 🎨'
  ))
  ```

### 5. Validate the Fix
- Test the chat flow by requesting an outfit recommendation
- Verify the acknowledgment message appears during flat-lay generation
- Verify the acknowledgment message is removed once the flat-lay image appears in the card
- Verify no console errors or unexpected behavior

## Validation Commands
Execute these commands to validate the chore is complete:

- `cd apps/web && pnpm build` - Ensure TypeScript compiles without errors
- `cd apps/web && pnpm lint` - Ensure no linting errors introduced
- Manual test: Open the app, request an outfit, verify the acknowledgment message disappears after flat-lay image loads in the card

## Notes

- The fix should be applied in TWO locations in `handleSendMessage`:
  1. Lines ~263-265: After successful API response flat-lay generation loop
  2. Lines ~309-311: After mock/fallback response flat-lay generation loop
- The recommended approach is to filter by message content (simpler) rather than tracking IDs (more complex)
- The acknowledgment message ID pattern is `ai-ack-${Date.now()}` but using content matching is more reliable
- The `generatingImage` state is already being set to `false` after the loop - add the filter right before that
