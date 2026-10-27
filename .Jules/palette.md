## 2025-02-14 - Accessible Form Labels & ARIA Attributes in Casino Interfaces
**Learning:** Icon-only buttons (like modal close buttons and chat send buttons) and input form controls lacking explicit label linkages degrade accessibility for screen readers in complex gaming web apps.
**Action:** Always ensure `<label>` elements have explicit `for` attributes pointing to input `id`s and icon-only buttons have clear `aria-label` descriptors.

## 2025-02-14 - Keyboard Accessibility for Custom Interactive Cards
**Learning:** Custom interactive elements (like betting area cards and demo login panels) implemented with `div` tags are completely inaccessible to keyboard and screen reader users unless converted to semantic `<button>` elements or given `role="button"`, `tabindex="0"`, `aria-label`, and `keydown` (`Enter`/`Space`) event handlers.
**Action:** Always provide explicit keyboard accessibility (`tabindex="0"`, `keydown` listener for Enter/Space, and descriptive ARIA labels) when making custom card containers or demo buttons clickable in vanilla web apps.
