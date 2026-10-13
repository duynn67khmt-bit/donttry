## 2025-02-14 - Accessible Form Labels & ARIA Attributes in Casino Interfaces
**Learning:** Icon-only buttons (like modal close buttons and chat send buttons) and input form controls lacking explicit label linkages degrade accessibility for screen readers in complex gaming web apps.
**Action:** Always ensure `<label>` elements have explicit `for` attributes pointing to input `id`s and icon-only buttons have clear `aria-label` descriptors.
