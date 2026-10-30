# Bolt's Journal - Critical Learnings

## 2025-10-13 - Batching DOM Style Writes and Reads to Prevent Layout Thrashing
**Learning:** Interweaving CSS transform assignments (`style.transform`) and layout reads (`offsetHeight`) inside element loops forces multiple synchronous layout recalculations (layout thrashing) per frame. Writing all element transform styles first before triggering a single layout flush (`offsetHeight`) batches layout computations into a single browser reflow.
**Action:** Always separate DOM style write loops from read loops when triggering css transitions on multiple elements.

## 2025-10-13 - DOM Batching via DocumentFragment in Plain JS App
**Learning:** Frequent DOM re-renders in vanilla JavaScript apps (like updating game history, bead plate grids, and deposit/withdrawal lists on every round or transaction) cause unnecessary DOM reflows/recomputations if elements are appended directly inside loops. Using `DocumentFragment` batches all child node insertions into a single DOM update operation, significantly reducing layout thrashing and rendering overhead.
**Action:** Always batch element creation in loops using `DocumentFragment` before appending to parent DOM elements.
