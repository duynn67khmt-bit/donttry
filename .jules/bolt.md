# Bolt's Journal - Critical Learnings

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.

## 2025-10-24 - Intl.NumberFormat Instantiation Overhead in High-Frequency Game Loops
**Learning:** `new Intl.NumberFormat()` constructor performs locale resolution, option normalization, and internal pattern compilation, making it 15x–90x slower than reusing an existing formatter instance. When called repeatedly in fast timers (e.g. 350ms bot betting updates, live online counters, and betting chips display), uncached instantiations cause significant CPU spikes and garbage collection pauses.
**Action:** Always cache `Intl.NumberFormat` instances as static class fields or module-level singletons instead of instantiating inside helper methods.
