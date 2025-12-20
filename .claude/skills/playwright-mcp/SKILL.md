---
name: playwright-mcp
description: Browser automation using Playwright MCP tools. Use when testing web applications, taking screenshots, filling forms, clicking elements, navigating pages, or automating browser interactions. Ideal for E2E testing, visual regression, and web scraping.
allowed-tools: mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_wait_for, mcp__playwright__browser_fill_form, mcp__playwright__browser_press_key, mcp__playwright__browser_close, mcp__playwright__browser_resize, mcp__playwright__browser_tabs, mcp__playwright__browser_hover, mcp__playwright__browser_drag, mcp__playwright__browser_select_option, mcp__playwright__browser_file_upload, mcp__playwright__browser_navigate_back, mcp__playwright__browser_console_messages, mcp__playwright__browser_network_requests, mcp__playwright__browser_handle_dialog, mcp__playwright__browser_evaluate, mcp__playwright__browser_install, mcp__playwright__browser_run_code
---

# Playwright MCP Browser Automation

## Overview

This skill provides browser automation capabilities through Playwright MCP tools. Use it for:
- E2E testing of web applications
- Visual regression testing with screenshots
- Form automation and data entry
- Web scraping and content extraction
- Interactive browser testing sessions

## Core Workflow

### 1. Navigate to Page
```
browser_navigate -> url: "https://example.com"
```

### 2. Take Accessibility Snapshot (Preferred)
```
browser_snapshot -> (no params needed)
```
Returns element refs like `[ref=s1e5]` for interaction.

### 3. Interact with Elements
Use refs from snapshot to click, type, or hover:
```
browser_click -> element: "Submit button", ref: "s1e5"
browser_type -> element: "Email input", ref: "s1e3", text: "user@example.com"
```

### 4. Wait for Changes
```
browser_wait_for -> text: "Success message"
browser_wait_for -> time: 2  (seconds)
browser_wait_for -> textGone: "Loading..."
```

### 5. Capture Evidence
```
browser_take_screenshot -> filename: "result.png"
browser_take_screenshot -> fullPage: true
```

## Available Tools

### Navigation
| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to URL |
| `browser_navigate_back` | Go back in history |
| `browser_tabs` | List, create, close, select tabs |

### Element Interaction
| Tool | Purpose |
|------|---------|
| `browser_click` | Click element (left/right/middle, double-click) |
| `browser_type` | Type text into input |
| `browser_hover` | Hover over element |
| `browser_drag` | Drag and drop between elements |
| `browser_select_option` | Select dropdown option |
| `browser_press_key` | Press keyboard key |
| `browser_fill_form` | Fill multiple form fields at once |
| `browser_file_upload` | Upload files to file input |

### Inspection
| Tool | Purpose |
|------|---------|
| `browser_snapshot` | Get accessibility tree with refs (PREFERRED) |
| `browser_take_screenshot` | Capture visual screenshot |
| `browser_console_messages` | View console logs |
| `browser_network_requests` | View network activity |
| `browser_evaluate` | Run JavaScript in page |

### Control
| Tool | Purpose |
|------|---------|
| `browser_wait_for` | Wait for text/time/text removal |
| `browser_handle_dialog` | Accept/dismiss alerts/confirms |
| `browser_resize` | Change viewport size |
| `browser_close` | Close browser |
| `browser_install` | Install browser if missing |
| `browser_run_code` | Execute Playwright code snippet |

## Best Practices

### Always Use Snapshots First
```
1. browser_navigate to page
2. browser_snapshot to get element refs
3. Use refs for interactions (never guess selectors)
```

### Snapshot vs Screenshot
- **browser_snapshot**: Returns accessibility tree with refs for interaction. USE THIS for automation.
- **browser_take_screenshot**: Returns visual image. Use for documentation/evidence only.

### Element References
Snapshot returns refs like `[ref=s1e5]`. Always use exact ref values:
```
browser_click:
  element: "Login button"  # Human description for permission
  ref: "s1e5"              # Exact ref from snapshot
```

### Form Filling Efficiency
Use `browser_fill_form` for multiple fields:
```
browser_fill_form:
  fields:
    - name: "Email", type: "textbox", ref: "s1e3", value: "user@example.com"
    - name: "Password", type: "textbox", ref: "s1e4", value: "secret"
    - name: "Remember me", type: "checkbox", ref: "s1e5", value: "true"
```

### Waiting Strategy
```
# Wait for specific text to appear
browser_wait_for -> text: "Welcome"

# Wait for loading to complete
browser_wait_for -> textGone: "Loading..."

# Fixed delay (use sparingly)
browser_wait_for -> time: 1
```

### Tab Management
```
browser_tabs -> action: "list"    # Show all tabs
browser_tabs -> action: "new"     # Open new tab
browser_tabs -> action: "select", index: 1  # Switch to tab
browser_tabs -> action: "close"   # Close current tab
```

## Common Patterns

### Login Flow
```
1. browser_navigate -> url: "https://app.example.com/login"
2. browser_snapshot
3. browser_fill_form -> fields: [email, password]
4. browser_click -> element: "Login button", ref: "..."
5. browser_wait_for -> text: "Dashboard"
6. browser_take_screenshot -> filename: "logged-in.png"
```

### Form Submission Test
```
1. browser_navigate -> url: "https://example.com/form"
2. browser_snapshot
3. browser_fill_form -> fields: [...]
4. browser_click -> element: "Submit", ref: "..."
5. browser_wait_for -> text: "Success"
6. browser_snapshot  # Verify result
```

### Visual Regression
```
1. browser_navigate -> url: "https://example.com"
2. browser_resize -> width: 1920, height: 1080
3. browser_wait_for -> time: 1
4. browser_take_screenshot -> filename: "desktop.png", fullPage: true
5. browser_resize -> width: 375, height: 667
6. browser_take_screenshot -> filename: "mobile.png", fullPage: true
```

### Debug Console Errors
```
1. browser_navigate -> url: "https://example.com"
2. browser_console_messages -> level: "error"
3. browser_network_requests -> includeStatic: false
```

## Troubleshooting

### Browser Not Installed
```
browser_install  # Installs configured browser
```

### Element Not Found
1. Take new snapshot - page may have changed
2. Check if element is in viewport
3. Wait for element to appear: `browser_wait_for -> text: "..."`

### Dialog Blocking
```
browser_handle_dialog -> accept: true
browser_handle_dialog -> accept: false, promptText: "input"
```

### Keyboard Shortcuts
```
browser_press_key -> key: "Enter"
browser_press_key -> key: "Escape"
browser_press_key -> key: "ArrowDown"
```

## Version History
- v1.0.0 (2025-12-20): Initial release with full Playwright MCP tool coverage
