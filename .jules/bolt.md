# Bolt's Journal - Critical Learnings

## 2025-10-22 - Reusable Intl.NumberFormat Instances in High-Frequency Formatting
**Learning:** Re-instantiating `Intl.NumberFormat` on every function call in hot loops or frequent intervals (such as bot betting tickers, currency UI updates, and transaction list renders) creates significant CPU overhead and GC pressure (~55x slower than reusing a cached instance in V8). Caching static formatters globally or at the module level yields massive runtime performance gains.
**Action:** Always reuse module-level or static `Intl.NumberFormat` instances for currency and number formatting instead of constructing new ones inside functions.

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.
