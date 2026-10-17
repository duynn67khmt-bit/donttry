# Bolt's Journal - Critical Learnings

## 2025-10-17 - DOM Node Capping and Container Caching in High-Frequency Animation Loops
**Learning:** High-frequency event loops or intervals (such as bot/user betting animations creating chip DOM elements every 350ms) cause DOM tree bloat and re-layout overhead if elements accumulate indefinitely without limits. Caching DOM grid containers at init and capping the maximum active DOM child elements per container prevents layout thrashing while preserving visual polish.
**Action:** Cache container references during initialization and cap max child nodes in high-frequency element creation loops.

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.
