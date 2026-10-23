# Bolt's Journal - Critical Learnings

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.

## 2026-10-23 - Reusing Intl.NumberFormat Instances
**Learning:** Instantiating `new Intl.NumberFormat()` on every call in high-frequency functions (such as UI updates, ticker increments, and chip placement formatting) causes high garbage collection pressure and CPU overhead due to locale initialization. Pre-instantiating and reusing `Intl.NumberFormat` instances in class properties speeds up formatting calls by ~70x.
**Action:** Always instantiate `Intl.NumberFormat` once as class properties or module-level constants when formatting numbers or currencies frequently.
