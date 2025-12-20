# PRD: Resizable Chat Panel Interface

## Introduction/Overview

The OOTDay application currently uses a fixed three-panel desktop layout with a 420px wide right panel for chat and outfit details. This PRD defines the implementation of a resizable right panel that allows users to dynamically adjust the chat panel width by dragging the left border, providing a more flexible and personalized user experience.

**Problem Statement:** Users have different preferences for how much screen space they want to dedicate to the chat interface versus outfit browsing. Some users may want a larger chat area for detailed conversations, while others prefer more space for viewing outfit recommendations.

**Goal:** Enable users to customize their workspace by making the right panel (chat/details) resizable through intuitive drag interactions, with appropriate constraints and visual feedback.

## Goals

1. **Improve User Experience:** Allow users to customize the chat panel width based on their preferences and screen size
2. **Maintain Usability:** Ensure the resize feature works smoothly without breaking the layout or causing performance issues
3. **Provide Visual Feedback:** Give clear visual indicators during the resize interaction
4. **Preserve Accessibility:** Ensure the feature is accessible via keyboard and assistive technologies
5. **Session Persistence:** Remember user's preferred panel size during their browsing session

## User Stories

1. **As a user browsing outfits**, I want to make the chat panel narrower so that I can see more outfit cards in the middle panel at once.

2. **As a user having a detailed conversation with the AI**, I want to expand the chat panel wider so that I can read longer messages more comfortably without excessive line breaks.

3. **As a keyboard user**, I want to resize the panel using keyboard shortcuts so that I can customize my layout without using a mouse.

4. **As a user on a laptop with limited screen space**, I want to adjust panel sizes to optimize my available screen real estate based on my current task.

5. **As a user viewing outfit details**, I want the resize functionality to work the same way whether I'm in chat mode or detail view mode so that I have consistent control over the interface.

## Functional Requirements

### Core Resize Functionality

1. **FR-1:** The right panel (chat/outfit detail) must be resizable by clicking and holding the left border and dragging horizontally.

2. **FR-2:** The minimum width for the right panel must be 280px.

3. **FR-3:** The maximum width for the right panel must be 50% of the viewport width.

4. **FR-4:** The middle panel (outfit discovery) must automatically adjust its width when the right panel is resized, maintaining the left panel at a fixed 280px width.

5. **FR-5:** The resize functionality must only be available on desktop layout (>= 1024px viewport width).

6. **FR-6:** The default right panel width must remain 420px on initial page load.

### Visual Feedback

7. **FR-7:** A highlight or shadow effect must appear on the panel border during active dragging to indicate the resize is in progress.

8. **FR-8:** The cursor must change to a horizontal resize cursor (col-resize) when hovering over the draggable border area.

9. **FR-9:** The border area that triggers the resize interaction must be at least 8px wide (extending 4px into each adjacent panel) to provide an adequate hit target.

### State Management

10. **FR-10:** The user's selected panel width must be saved to browser sessionStorage and restored when the page is reloaded within the same browser session.

11. **FR-11:** The panel width must reset to the default (420px) when the browser is closed or a new session begins.

12. **FR-12:** The resize functionality must work in both view modes:
    - When ChatAssistant component is displayed
    - When OutfitDetail component is displayed

### Accessibility

13. **FR-13:** Users must be able to resize the panel using keyboard shortcuts:
    - `Ctrl+[` or `Cmd+[` to decrease width by 40px
    - `Ctrl+]` or `Cmd+]` to increase width by 40px

14. **FR-14:** Preset size buttons must be provided with the following options:
    - "Compact" (320px)
    - "Default" (420px)
    - "Wide" (560px)

15. **FR-15:** The resize handle must be keyboard navigable (focusable with Tab key).

16. **FR-16:** Screen readers must announce the current panel width and resize state (e.g., "Chat panel, 420 pixels wide, resizable").

### Constraints and Validation

17. **FR-17:** The system must prevent the right panel from being resized smaller than 280px or larger than 50% of viewport width.

18. **FR-18:** If the viewport is resized and causes the panel width to exceed constraints, the panel width must automatically adjust to the maximum allowed size.

19. **FR-19:** The resize interaction must not cause layout jitter or performance degradation (must maintain 60fps during drag).

20. **FR-20:** The left panel (NavigationFilters) must remain fixed at 280px width and not be affected by right panel resizing.

## Non-Goals (Out of Scope)

1. **Resizing the left filter panel** - The left navigation panel will remain fixed at 280px.

2. **Mobile/tablet resize functionality** - This feature is desktop-only (>= 1024px viewport).

3. **Vertical resizing** - Only horizontal resizing is supported; panel heights remain fixed.

4. **Cloud sync of preferences** - Panel size preferences will not sync across devices or user accounts.

5. **Three-panel independent resizing** - Only the right panel is resizable; the left panel stays fixed and middle panel adjusts automatically.

6. **Collapse/expand functionality** - No button to completely hide/show panels (outside scope of this feature).

7. **Snap-to-grid behavior** - Free-form resizing only; no predefined layout presets beyond keyboard shortcuts.

## Design Considerations

### UI/UX Requirements

1. **Drag Handle Design:**
   - The left border of the right panel should serve as the drag handle
   - Visual treatment: subtle highlight/shadow during hover and active drag states
   - Hit area: 8px wide (4px on each side of the border)

2. **Visual States:**
   - Default: Standard border appearance
   - Hover: Cursor changes to col-resize, subtle border highlight
   - Active Drag: More prominent border highlight/shadow, visual feedback showing resize is occurring
   - Disabled (mobile): No hover effects or resize cursor

3. **Preset Size Controls:**
   - Location: Add small button group in the right panel header/top area
   - Style: Icon buttons or text buttons with sizes labeled
   - Visibility: Always visible but subtle, not distracting from main content

4. **Animation:**
   - Smooth transitions when using keyboard shortcuts or preset buttons (150-200ms)
   - No animation during manual drag (immediate response for performance)

### Component Architecture

1. **New Component:** `ResizablePanel` wrapper component or custom hook `useResizablePanel`
2. **Integration Point:** Wrap the right `<aside>` element in HomePage component
3. **State Management:** Local state with sessionStorage persistence
4. **Event Handling:** Mouse events (mousedown, mousemove, mouseup) and keyboard events

### Existing Components to Modify

- `app/page.tsx` - Update desktop layout section (lines 136-183)
- Create new component: `components/layout/ResizablePanel.tsx`
- Create new hook: `lib/hooks/useResizablePanel.ts`

## Technical Considerations

### Dependencies

1. **React Hooks:** useState, useEffect, useCallback, useRef
2. **Browser APIs:** sessionStorage, addEventListener/removeEventListener
3. **Optional Library:** Consider `react-resizable-panels` or implement custom solution

### Implementation Approach

1. **Custom Hook Pattern:**
   ```typescript
   const {
     panelWidth,
     isDragging,
     handleMouseDown,
     presetSizes,
     setPresetSize,
   } = useResizablePanel({
     defaultWidth: 420,
     minWidth: 280,
     maxWidthPercent: 50,
     storageKey: 'ootday-chat-panel-width'
   })
   ```

2. **Event Handling:**
   - Attach mousedown listener to border element
   - Attach global mousemove and mouseup listeners during drag
   - Clean up global listeners when drag ends or component unmounts

3. **Performance Optimization:**
   - Use requestAnimationFrame for smooth dragging
   - Debounce sessionStorage writes
   - Prevent unnecessary re-renders with React.memo and useCallback

4. **Keyboard Shortcuts:**
   - Global keyboard event listener with platform detection (Cmd vs Ctrl)
   - Prevent conflicts with existing shortcuts
   - Ensure shortcuts only work when desktop layout is active

### Browser Compatibility

- Target modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Ensure col-resize cursor is supported
- Fallback: If resize fails, maintain current fixed-width behavior

## Success Metrics

1. **Adoption Rate:** 30% of desktop users interact with the resize feature within first session
2. **User Satisfaction:** Positive feedback in user testing regarding workspace customization
3. **Performance:** Maintain 60fps during resize interactions (no frame drops)
4. **Accessibility Compliance:** 100% keyboard navigability and screen reader compatibility
5. **Session Persistence:** 90% of users' panel width preferences are correctly restored on page reload

## Open Questions

1. **Should there be a "reset" button** to restore panel to default 420px width easily?
   - **Recommendation:** Yes, include in preset size buttons

2. **Should we add analytics tracking** to understand how users prefer to size their panels?
   - **Decision needed:** Depends on analytics infrastructure and privacy policy

3. **Should the feature be announced** to users with a tooltip or tutorial on first use?
   - **Recommendation:** Yes, subtle tooltip on first desktop visit: "Drag to resize"

4. **Should we limit the feature** to certain user segments initially (e.g., logged-in users)?
   - **Decision needed:** Recommend enabling for all users for broader feedback

5. **Should there be a visual indicator** (like grab dots) on the border when not dragging?
   - **Recommendation:** Yes, subtle grip icon that appears on hover

6. **How should this interact** with the test mode panel if both are active?
   - **Decision needed:** Test mode may need similar resize capability or should be evaluated separately

---

**Document Version:** 1.0
**Created:** 2025-10-14
**Author:** Claude (Product Manager Agent)
**Status:** Draft - Awaiting Review
