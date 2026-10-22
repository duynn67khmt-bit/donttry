## 2025-02-14 - Accessible Form Labels & ARIA Attributes in Casino Interfaces
**Learning:** Icon-only buttons (like modal close buttons and chat send buttons) and input form controls lacking explicit label linkages degrade accessibility for screen readers in complex gaming web apps.
**Action:** Always ensure `<label>` elements have explicit `for` attributes pointing to input `id`s and icon-only buttons have clear `aria-label` descriptors.

## 2025-05-20 - Keyboard Accessibility for Custom Interactive Betting Cards
**Learning:** Custom interactive elements (like betting area cards and quick-login credential boxes) created with `<div>` elements are invisible to keyboard tab order and screen readers unless explicitly marked with `role="button"`, `tabindex="0"`, `aria-label`, and `keydown` event listeners for `Enter` and `Space`.
**Action:** Always complement click event listeners on custom interactive `<div>`s with `role="button"`, `tabindex="0"`, descriptive `aria-label`s, and `keydown` handlers for `Enter` and `Space`.
