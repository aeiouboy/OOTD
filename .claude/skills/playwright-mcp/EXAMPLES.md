# Playwright MCP Examples

## E2E Test: User Registration

```
# Step 1: Navigate to registration page
browser_navigate -> url: "https://app.example.com/register"

# Step 2: Get element references
browser_snapshot
# Returns elements like:
# - [ref=s1e3] Email input
# - [ref=s1e4] Password input
# - [ref=s1e5] Confirm password input
# - [ref=s1e6] Terms checkbox
# - [ref=s1e7] Register button

# Step 3: Fill the form
browser_fill_form -> fields:
  - name: "Email", type: "textbox", ref: "s1e3", value: "newuser@test.com"
  - name: "Password", type: "textbox", ref: "s1e4", value: "SecurePass123!"
  - name: "Confirm Password", type: "textbox", ref: "s1e5", value: "SecurePass123!"
  - name: "Accept Terms", type: "checkbox", ref: "s1e6", value: "true"

# Step 4: Submit
browser_click -> element: "Register button", ref: "s1e7"

# Step 5: Wait for success
browser_wait_for -> text: "Welcome! Please check your email"

# Step 6: Capture result
browser_take_screenshot -> filename: "registration-success.png"
```

## E2E Test: Shopping Cart Flow

```
# Navigate to product page
browser_navigate -> url: "https://shop.example.com/product/123"

# Get snapshot for interaction
browser_snapshot

# Select size from dropdown
browser_select_option -> element: "Size selector", ref: "s1e5", values: ["Large"]

# Add to cart
browser_click -> element: "Add to Cart button", ref: "s1e8"

# Wait for cart update
browser_wait_for -> text: "Added to cart"

# Navigate to cart
browser_click -> element: "Cart icon", ref: "s1e2"
browser_wait_for -> text: "Your Cart"

# Take screenshot of cart
browser_take_screenshot -> filename: "cart-with-item.png"

# Proceed to checkout
browser_snapshot
browser_click -> element: "Checkout button", ref: "s2e15"
```

## Responsive Testing

```
# Desktop viewport
browser_navigate -> url: "https://example.com"
browser_resize -> width: 1920, height: 1080
browser_wait_for -> time: 1
browser_take_screenshot -> filename: "desktop-1920.png", fullPage: true

# Tablet viewport
browser_resize -> width: 768, height: 1024
browser_wait_for -> time: 0.5
browser_take_screenshot -> filename: "tablet-768.png", fullPage: true

# Mobile viewport
browser_resize -> width: 375, height: 667
browser_wait_for -> time: 0.5
browser_take_screenshot -> filename: "mobile-375.png", fullPage: true
```

## Multi-Tab Workflow

```
# Open first page
browser_navigate -> url: "https://example.com/page1"
browser_snapshot

# Open new tab
browser_tabs -> action: "new"
browser_navigate -> url: "https://example.com/page2"
browser_snapshot

# List all tabs
browser_tabs -> action: "list"

# Switch back to first tab
browser_tabs -> action: "select", index: 0
browser_snapshot

# Close current tab
browser_tabs -> action: "close"
```

## File Upload

```
browser_navigate -> url: "https://example.com/upload"
browser_snapshot

# Click file input to trigger upload
browser_click -> element: "Choose file button", ref: "s1e5"

# Upload file(s)
browser_file_upload -> paths: ["/path/to/document.pdf"]

# For multiple files
browser_file_upload -> paths: ["/path/to/file1.jpg", "/path/to/file2.jpg"]

# Cancel file chooser (no upload)
browser_file_upload
```

## Drag and Drop

```
browser_navigate -> url: "https://example.com/kanban"
browser_snapshot

# Drag task from "To Do" to "In Progress"
browser_drag:
  startElement: "Task card 'Fix bug'"
  startRef: "s1e10"
  endElement: "In Progress column"
  endRef: "s1e25"

browser_snapshot  # Verify move
```

## Handling Dialogs

```
browser_navigate -> url: "https://example.com/settings"
browser_snapshot

# Click delete button (triggers confirm dialog)
browser_click -> element: "Delete account button", ref: "s1e20"

# Accept the confirmation
browser_handle_dialog -> accept: true

# Or dismiss it
browser_handle_dialog -> accept: false

# For prompt dialogs, provide text
browser_handle_dialog -> accept: true, promptText: "DELETE"
```

## Debugging Network Issues

```
browser_navigate -> url: "https://example.com"

# Wait for page load
browser_wait_for -> time: 3

# Check for failed requests
browser_network_requests -> includeStatic: false

# Check console for errors
browser_console_messages -> level: "error"

# Check warnings too
browser_console_messages -> level: "warning"
```

## Custom JavaScript Execution

```
browser_navigate -> url: "https://example.com"

# Get page title
browser_evaluate -> function: "() => document.title"

# Get element text
browser_evaluate:
  element: "Header element"
  ref: "s1e5"
  function: "(element) => element.textContent"

# Scroll to bottom
browser_evaluate -> function: "() => window.scrollTo(0, document.body.scrollHeight)"

# Get localStorage value
browser_evaluate -> function: "() => localStorage.getItem('authToken')"
```

## Complex Playwright Code

```
browser_run_code:
  code: |
    async (page) => {
      // Wait for network idle
      await page.waitForLoadState('networkidle');

      // Get all links
      const links = await page.$$eval('a', anchors =>
        anchors.map(a => ({ href: a.href, text: a.textContent }))
      );

      return links;
    }
```

## Keyboard Navigation

```
browser_navigate -> url: "https://example.com/form"
browser_snapshot

# Tab through form fields
browser_press_key -> key: "Tab"
browser_press_key -> key: "Tab"

# Type in focused field
browser_type -> element: "Focused input", ref: "s1e4", text: "Hello"

# Submit with Enter
browser_press_key -> key: "Enter"

# Use arrow keys for navigation
browser_press_key -> key: "ArrowDown"
browser_press_key -> key: "ArrowUp"

# Escape to close modal
browser_press_key -> key: "Escape"
```

## Screenshot of Specific Element

```
browser_navigate -> url: "https://example.com"
browser_snapshot

# Screenshot specific element
browser_take_screenshot:
  element: "Product card"
  ref: "s1e15"
  filename: "product-card.png"

# Full page screenshot
browser_take_screenshot:
  fullPage: true
  filename: "full-page.png"
  type: "jpeg"
```
