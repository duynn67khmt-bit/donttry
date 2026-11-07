# Bolt's Journal - Critical Learnings

## 2026-10-18 - Intl.NumberFormat Instantiation Overhead in High-Frequency Loops
**Learning:** Instantiating `new Intl.NumberFormat(locale)` inside utility helper methods called during high-frequency cycles (such as 350ms bot betting updates, UI count refreshes, and list rendering) creates substantial CPU and memory overhead (~50x-70x slowdown compared to cached formatters) and causes garbage collection pauses due to repeated allocation of Intl objects. Reusing static or cached `Intl.NumberFormat` instances eliminates this allocation cost while keeping output completely identical.
**Action:** Always reuse cached or static `Intl.NumberFormat` instances for currency and number formatting helpers instead of instantiating new formatters per invocation.

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.
