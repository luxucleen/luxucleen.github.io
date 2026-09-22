---
name: "tracking-and-goals"
description: "Track orders, deliveries, commitments, checklists — open to close."
---

# Tracking & Goals

**LUXOR-IMPROVED — 2026-09-21** · Added Christian's tracked-items setup (Goals tab, bridge28 queue statuses, goal progress logs) and the hidden_files/ bookkeeping convention. Covers list unit: `tracking-and-goals` (1 file = 1 unit).


- Open a tracked item when a commitment goes concrete: order, delivery, reservation, project.
- Log progress as it happens. Close only when the outcome is resolved.
- Checklists tracked to done.
- Goal workspaces: durable outcomes with progress logs and briefings.

## Christian's setup

- Tracked items live in the Goals tab (tracking namespace): open an item when a commitment goes concrete (order, delivery, reservation, project), log progress as it happens, close only when the outcome is resolved.
- The bridge28 queue is tracked by its statuses: STAGED / LIVE / DONE / BLOCKED, reported in-thread the moment anything finishes — no silent finishes.
- Goal progress logs live in ~/workspace/goals/<goal-slug>/; durable outcomes and decisions also land in MEMORY.md (the business brain).

## Lessons baked in

- Run logs and per-run bookkeeping go in the goal's hidden_files/, never in the user-facing files/ directory.
- Never-idle rule in action: the moment bridge28 reports DONE, the next queue item feeds immediately — close the old item, open the next, without waiting on Christian.