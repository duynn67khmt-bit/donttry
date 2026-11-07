## 2025-02-14 - Accessible Form Labels & ARIA Attributes in Casino Interfaces
**Learning:** Icon-only buttons (like modal close buttons and chat send buttons) and input form controls lacking explicit label linkages degrade accessibility for screen readers in complex gaming web apps.
**Action:** Always ensure `<label>` elements have explicit `for` attributes pointing to input `id`s and icon-only buttons have clear `aria-label` descriptors.

## 2026-11-07 - Keyboard Dismissal & ARIA Dialog Semantics for Custom Modals
**Learning:** Custom overlay modals without `Escape` key handling and `role="dialog"` / `aria-modal="true"` attributes disorient keyboard-only and assistive technology users during fast-paced gameplay.
**Action:** Whenever introducing or refining modals, bind a global `Escape` key listener with audio/visual feedback and annotate containers with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
