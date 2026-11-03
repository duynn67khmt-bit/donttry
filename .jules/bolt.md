# Bolt's Journal - Critical Learnings

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.

## 2026-10-18 - Caching Intl.NumberFormat Formatters
**Learning:** Instantiating `new Intl.NumberFormat()` on every format call inside high-frequency game loops (bot bets every 350ms, timer ticks, user bets, UI rerenders) incurs heavy initialization overhead (~50-65x slower than reusing an instance) and creates unnecessary garbage collection pressure.
**Action:** Always cache `Intl.NumberFormat` instances statically or at module scope when formatting numbers or currencies repeatedly.
