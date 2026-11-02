# Bolt's Journal - Critical Learnings

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.

## 2025-10-14 - Expensive Intl.NumberFormat Instantiation in High-Frequency Game Loops
**Learning:** Instantiating `new Intl.NumberFormat(locale)` on every numeric formatting call is a hidden CPU bottleneck in vanilla JS apps with high-frequency timers (e.g. bots placing chips every 350ms, balance updates, and history rendering). V8 must resolve locale options and load ICU formatting data on every `new Intl` call. Reusing static/cached `Intl.NumberFormat` instances provides a ~70x speedup and eliminates garbage collection thrashing.
**Action:** Always cache and reuse `Intl.NumberFormat` / `Intl.DateTimeFormat` instances at module or class static level rather than creating new instances inside helper functions.
