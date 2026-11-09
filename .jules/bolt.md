# Bolt's Journal - Critical Learnings

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.

## 2026-10-18 - Intl.NumberFormat Instantiation Overhead in Real-Time Ticker Apps
**Learning:** Calling `new Intl.NumberFormat(...)` on high-frequency UI update paths (such as ticker intervals every 350ms, chat messages, and chip updates) is surprisingly costly in V8 because locale resolution and formatter constructor setup take ~0.067ms per call (vs ~0.0009ms when reusing an instance). Over thousands of calls across game rounds and bots, repeated creation causes significant CPU overhead and garbage collection pauses.
**Action:** Always cache `Intl.NumberFormat` instances in class properties or module constants instead of recreating them inside formatting helper methods.
