## 2025-02-14 - Accessible Form Labels & ARIA Attributes in Casino Interfaces
**Learning:** Icon-only buttons (like modal close buttons and chat send buttons) and input form controls lacking explicit label linkages degrade accessibility for screen readers in complex gaming web apps.
**Action:** Always ensure `<label>` elements have explicit `for` attributes pointing to input `id`s and icon-only buttons have clear `aria-label` descriptors.

## 2026-11-03 - Interactive Game Board Cards as Accessible Keyboard Buttons
**Learning:** Complex interactive betting cards implemented with `<div>` elements and click handlers exclude keyboard-only and assistive technology users unless they have explicit `role="button"`, `tabindex="0"`, descriptive `aria-label` descriptors, and dynamic `aria-disabled` and `tabindex` state synchronization matching game phases.
**Action:** When building interactive game board elements using custom container markup, always provide `role="button"`, keydown handlers for `Enter` and `Space`, and toggle `aria-disabled` and `tabindex` (0 vs -1) during active/disabled rounds.
