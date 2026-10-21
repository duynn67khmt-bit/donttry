# Bolt's Journal - Critical Learnings

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.

## 2025-10-21 - Reuse Static Intl.NumberFormat Instances in High-Frequency UI Loops
**Learning:** Instantiating `new Intl.NumberFormat()` inside UI update methods or bot betting loops (e.g. `formatCurrency` called every 350ms or on every chip placement) incurs massive constructor overhead due to locale database lookups and ICU object allocations (~76x slower than reusing a cached instance).
**Action:** Store `Intl.NumberFormat` instances as static class fields or module-level constants for repeated formatting calls.
