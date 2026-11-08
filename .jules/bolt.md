# Bolt's Journal - Critical Learnings

## 2026-11-08 - Cache Intl.NumberFormat Formatters in High-Frequency Loops
**Learning:** `new Intl.NumberFormat()` is an expensive operation that parses locale options and loads internationalization data on every instantiation. In a real-time game interface with frequent intervals (e.g., bot betting every 350ms, balance updates, transaction lists), repeatedly creating formatter instances causes significant main thread slowdown (~60x slower) and garbage collection pressure.
**Action:** Always instantiate `Intl.NumberFormat` instances once (e.g., as static class properties or module constants) and reuse them across all formatting calls.

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.
