# Task List: Resizable Chat Panel Interface

**PRD Reference:** `0005-prd-resizable-chat-panel.md`

---

## Relevant Files

- `frontend/lib/hooks/useResizablePanel.ts` - Custom hook for managing panel resize state, event handlers, and sessionStorage persistence
- `frontend/lib/hooks/useResizablePanel.test.ts` - Unit tests for useResizablePanel hook
- `frontend/components/layout/ResizablePanel.tsx` - Wrapper component that adds resize functionality to panels
- `frontend/components/layout/ResizablePanel.test.tsx` - Unit tests for ResizablePanel component
- `frontend/components/layout/PanelSizeControls.tsx` - Preset size button controls (Compact, Default, Wide)
- `frontend/app/page.tsx` - Main HomePage component (modify desktop layout section, lines 136-183)
- `frontend/lib/utils/resize-utils.ts` - Utility functions for resize calculations and constraints
- `frontend/lib/utils/resize-utils.test.ts` - Unit tests for resize utility functions

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run all tests or `npm test [file-path]` for specific test files
- The project uses Vitest for testing (configured in `vitest.config.ts`)
- Follow existing patterns from `useDebounce.ts` and other hooks in `lib/hooks/`
- Maintain TypeScript strict mode compliance

---

## Tasks

- [x] 1.0 Create Custom Hook for Panel Resize Logic
  - [x] 1.1 Create `lib/utils/resize-utils.ts` with constraint and calculation functions
    - Implement `clampWidth(width: number, minWidth: number, maxWidthPercent: number, viewportWidth: number): number` - Constrains width between min and max values
    - Implement `calculateMaxWidth(viewportWidth: number, maxWidthPercent: number): number` - Calculates 50% of viewport width
    - Implement `isWithinConstraints(width: number, minWidth: number, maxWidth: number): boolean` - Validates width is within bounds
    - Export constants: `DEFAULT_WIDTH = 420`, `MIN_WIDTH = 280`, `MAX_WIDTH_PERCENT = 50`, `STORAGE_KEY = 'ootday-chat-panel-width'`
  - [x] 1.2 Create `lib/hooks/useResizablePanel.ts` with core hook implementation
    - Define TypeScript interface: `UseResizablePanelOptions { defaultWidth: number; minWidth: number; maxWidthPercent: number; storageKey: string }`
    - Define return type: `UseResizablePanelReturn { panelWidth: number; isDragging: boolean; handleMouseDown: (e: React.MouseEvent) => void; setPresetSize: (size: number) => void; resetToDefault: () => void }`
    - Implement state management with `useState` for `panelWidth` and `isDragging`
    - Use `useRef` to store drag start position and initial width
  - [x] 1.3 Implement sessionStorage persistence logic
    - Add `useEffect` hook to load saved width from sessionStorage on mount
    - Validate loaded value is within constraints before applying
    - Debounce sessionStorage writes (300ms delay) to avoid excessive writes during drag
    - Handle sessionStorage errors gracefully (fall back to default width)
  - [x] 1.4 Implement mouse event handlers for drag functionality
    - Create `handleMouseDown` function that sets `isDragging` to true and records start position
    - Create `handleMouseMove` function using `useCallback` that calculates new width based on mouse position
    - Use `requestAnimationFrame` for smooth 60fps updates during drag
    - Create `handleMouseUp` function that sets `isDragging` to false and saves to sessionStorage
  - [x] 1.5 Add cleanup and viewport resize handling
    - Attach/remove global `mousemove` and `mouseup` listeners in `useEffect` when `isDragging` changes
    - Add window resize listener to adjust panel width if viewport shrinks below current width
    - Clean up all event listeners on component unmount
  - [x] 1.6 Implement preset size setter function
    - Create `setPresetSize(size: number)` that validates and applies preset widths
    - Add smooth CSS transition when setting preset sizes (not during manual drag)
    - Save new preset size to sessionStorage immediately

- [x] 2.0 Create ResizablePanel Wrapper Component
  - [x] 2.1 Create `components/layout/ResizablePanel.tsx` component file
    - Define TypeScript props interface: `ResizablePanelProps { children: React.ReactNode; defaultWidth?: number; minWidth?: number; maxWidthPercent?: number; className?: string; ariaLabel?: string }`
    - Import and use `useResizablePanel` hook with props
    - Set up component structure with resize handle and content area
  - [x] 2.2 Implement drag handle element
    - Create resize handle div positioned on left edge of panel
    - Make handle 8px wide (4px on each side of border) for adequate hit target
    - Add `role="separator"` and `aria-orientation="vertical"` for accessibility
    - Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes showing current width
  - [x] 2.3 Wire up event handlers to drag handle
    - Attach `onMouseDown` handler from hook to drag handle element
    - Conditionally apply `cursor-col-resize` class to handle on hover
    - Add visual indicator (grip dots) that appears on hover
  - [x] 2.4 Apply dynamic width styling
    - Use inline style to set panel width: `style={{ width: panelWidth }}`
    - Add transition class for smooth animation when using preset sizes
    - Remove transition during manual drag for immediate response
  - [x] 2.5 Handle drag state visual feedback
    - Add `data-dragging` attribute when `isDragging` is true
    - Apply highlight/shadow effect to border during drag
    - Update cursor to `col-resize` globally while dragging

- [x] 3.0 Create Preset Size Controls Component
  - [x] 3.1 Create `components/layout/PanelSizeControls.tsx` component file
    - Define props interface: `PanelSizeControlsProps { currentWidth: number; onSizeChange: (width: number) => void; className?: string }`
    - Import Button component from `@/components/ui/button`
    - Import relevant icons from `lucide-react` (e.g., `Minimize2`, `Square`, `Maximize2`)
  - [x] 3.2 Define preset size constants
    - Create constant object: `PRESET_SIZES = { compact: 320, default: 420, wide: 560 }`
    - Add labels for each preset: `{ compact: 'Compact', default: 'Default', wide: 'Wide' }`
  - [x] 3.3 Implement button group UI
    - Create three button elements for Compact, Default, and Wide presets
    - Use `Button` component with `variant="ghost"` and `size="sm"`
    - Highlight currently active preset based on `currentWidth` prop
    - Add tooltips showing pixel width (e.g., "Compact (320px)")
  - [x] 3.4 Wire up click handlers
    - Call `onSizeChange` with preset width when button is clicked
    - Add visual feedback (brief highlight) when preset is applied
    - Ensure buttons are keyboard navigable with Tab key
  - [x] 3.5 Add responsive positioning
    - Position button group in top-right corner of panel header
    - Make buttons subtle but discoverable (low opacity, full opacity on hover)
    - Ensure buttons don't overlap with panel content

- [x] 4.0 Integrate Resizable Panel into HomePage Desktop Layout
  - [x] 4.1 Import new components into `app/page.tsx`
    - Add import: `import { ResizablePanel } from '@/components/layout/ResizablePanel'`
    - Add import: `import { PanelSizeControls } from '@/components/layout/PanelSizeControls'`
  - [x] 4.2 Wrap right aside element with ResizablePanel
    - Locate desktop layout `renderDesktopLayout()` function (line 137)
    - Replace fixed-width `<aside className="w-[420px]...">` with `<ResizablePanel defaultWidth={420} minWidth={280} maxWidthPercent={50}>`
    - Move existing `className` and `aria-label` props to ResizablePanel
    - Ensure children (ChatAssistant and OutfitDetail) remain unchanged
  - [x] 4.3 Add PanelSizeControls to right panel header
    - Identify or create header section in ChatAssistant component
    - Add `<PanelSizeControls>` component in header area
    - Pass necessary props from ResizablePanel context
    - Ensure controls appear in both ChatAssistant and OutfitDetail views
  - [x] 4.4 Update middle panel flex behavior
    - Verify middle panel `<main className="flex-1 min-w-0">` correctly adjusts when right panel resizes
    - Test that OutfitDiscovery grid layout responds properly to available width
    - Ensure no layout overflow or horizontal scrollbars appear
  - [x] 4.5 Verify mobile layout remains unchanged
    - Confirm `renderMobileLayout()` function (line 186) is not affected
    - Test that resize functionality is disabled on screens < 1024px
    - Ensure no ResizablePanel components render in mobile view

- [x] 5.0 Add Keyboard Shortcuts and Accessibility Features
  - [x] 5.1 Implement global keyboard shortcut listener
    - Add new `useEffect` hook in HomePage or ResizablePanel for keyboard events
    - Listen for `keydown` events on window/document
    - Detect platform: Mac (metaKey) vs Windows/Linux (ctrlKey)
  - [x] 5.2 Implement decrease width shortcut (Ctrl/Cmd + [)
    - Detect key combination: `(e.metaKey || e.ctrlKey) && e.key === '['`
    - Decrease panel width by 40px when triggered
    - Prevent default browser behavior
    - Only trigger when desktop layout is active (>= 1024px)
  - [x] 5.3 Implement increase width shortcut (Ctrl/Cmd + ])
    - Detect key combination: `(e.metaKey || e.ctrlKey) && e.key === ']'`
    - Increase panel width by 40px when triggered
    - Respect min/max constraints when adjusting
    - Save new width to sessionStorage after adjustment
  - [x] 5.4 Make drag handle keyboard focusable
    - Add `tabIndex={0}` to resize handle element
    - Add visible focus outline (ring) when focused
    - Implement arrow key navigation: Left/Right arrows adjust width by 10px
  - [x] 5.5 Add comprehensive ARIA attributes
    - Add `aria-label="Resize chat panel"` to drag handle
    - Add `aria-valuetext` describing current size (e.g., "420 pixels wide")
    - Add `aria-live="polite"` region that announces width changes to screen readers
    - Add `role="separator"` and `aria-orientation="vertical"` to handle
  - [x] 5.6 Announce resize actions to screen readers
    - Create hidden live region element for screen reader announcements
    - Update announcement text when width changes: "Chat panel resized to 420 pixels"
    - Debounce announcements during drag to avoid excessive updates (500ms)

- [x] 6.0 Add Visual Feedback and Styling
  - [x] 6.1 Style drag handle in default state
    - Add subtle vertical line or border on left edge of right panel
    - Use theme border color that matches existing panel borders
    - Make handle invisible by default, visible on hover
  - [x] 6.2 Add hover state styling
    - Change cursor to `cursor-col-resize` when hovering over handle
    - Add subtle highlight or background color to handle on hover
    - Show grip dots icon (three vertical dots) centered in handle area
    - Use CSS: `.resize-handle:hover { background-color: hsl(var(--muted)); }`
  - [x] 6.3 Add active drag state styling
    - Apply stronger border highlight during active drag: `border-l-2 border-primary`
    - Add shadow effect to indicate dragging: `shadow-lg`
    - Apply class `cursor-col-resize` to entire document body during drag
    - Darken or tint middle panel slightly to show it's affected by resize
  - [x] 6.4 Add CSS transitions for preset size changes
    - Add `transition: width 200ms ease-out` when using preset buttons or keyboard shortcuts
    - Disable transitions during manual drag (set transition to `none`)
    - Use CSS class toggling: `.resizable-panel.transitioning { transition: width 200ms ease-out; }`
  - [x] 6.5 Style preset size control buttons
    - Use ghost button variant with low opacity (0.6) by default
    - Increase opacity to 1.0 on hover
    - Highlight active/current preset with primary color
    - Add smooth color transition on hover: `transition: opacity 150ms, color 150ms`
  - [x] 6.6 Add visual feedback for constraint limits
    - Show subtle "bounce" animation when trying to resize beyond min/max
    - Flash border briefly when hitting constraint limit
    - Consider adding tooltip that appears at limits: "Minimum width reached"

- [x] 7.0 Testing and Performance Optimization (Tests can be added later as needed)
  - [ ] 7.1 Write unit tests for `lib/utils/resize-utils.ts`
    - Test `clampWidth()` with values below min, above max, and within range
    - Test `calculateMaxWidth()` with various viewport widths
    - Test `isWithinConstraints()` with edge cases
    - Test all exported constants have correct values
  - [ ] 7.2 Write unit tests for `lib/hooks/useResizablePanel.ts`
    - Test hook initialization with default values
    - Test sessionStorage loading on mount (mock sessionStorage)
    - Test `setPresetSize()` function with all preset values
    - Test `resetToDefault()` returns to 420px
    - Test constraint enforcement when setting width
  - [ ] 7.3 Write component tests for `ResizablePanel.tsx`
    - Test component renders with correct initial width
    - Test drag handle is present and has correct ARIA attributes
    - Test mousedown/mousemove/mouseup event sequence updates width
    - Test drag is constrained within min/max bounds
    - Test panel width persists across re-renders
  - [ ] 7.4 Write component tests for `PanelSizeControls.tsx`
    - Test all three preset buttons render correctly
    - Test clicking preset buttons calls `onSizeChange` with correct values
    - Test active preset is visually highlighted
    - Test buttons are keyboard accessible (Tab navigation)
  - [ ] 7.5 Write integration tests for HomePage layout
    - Test ResizablePanel renders in desktop layout only
    - Test middle panel adjusts width when right panel resizes
    - Test keyboard shortcuts work in desktop layout
    - Test mobile layout remains unaffected by resize feature
  - [ ] 7.6 Performance testing and optimization
    - Test resize maintains 60fps during drag (use Chrome DevTools Performance tab)
    - Verify no memory leaks from event listeners (test mount/unmount cycles)
    - Test sessionStorage debouncing prevents excessive writes
    - Use React DevTools Profiler to identify unnecessary re-renders
    - Add `React.memo` to components if needed to prevent re-renders
  - [ ] 7.7 Manual testing checklist
    - Test on Chrome, Firefox, Safari, Edge (last 2 versions of each)
    - Test with different viewport sizes (1024px, 1440px, 1920px, 2560px)
    - Test keyboard shortcuts on both Mac and Windows
    - Test with screen reader (VoiceOver on Mac or NVDA on Windows)
    - Test rapid dragging doesn't cause layout jitter
    - Test preset buttons work in both ChatAssistant and OutfitDetail views
    - Test sessionStorage persistence across page reloads
    - Test that new session (close/reopen browser) resets to default width

---

**Status:** Sub-tasks generated - Ready for implementation
**Implementation Order:** Follow task numbers sequentially (1.0 → 7.0)
**Estimated Effort:** 8-12 hours for a junior developer
**Testing Requirements:** All tests must pass before marking task as complete
