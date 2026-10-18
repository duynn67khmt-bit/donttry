# Bolt's Journal - Critical Learnings

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.

## 2026-10-18 - High-Frequency Event State Guarding & DOM Container Clearing
**Learning:** In interactive vanilla JS canvas/plate components, reassigning `innerHTML` during high-frequency events (`pointermove` drag handlers) triggers heavy HTML parsing and layout thrashing up to 120+ times per second. Guarding state changes with a boolean flag ensures `innerHTML` updates only when crossing thresholds. Additionally, using `textContent = ''` on cached DOM references is measurably faster than `querySelector` + `innerHTML = ''` when repeatedly resetting chip containers during game rounds.
**Action:** Guard DOM mutation calls in high-frequency event listeners with state checks and use cached element references with `textContent` for fast container resets.
