---
name: "crew"
description: "Run a fast parallel crew: split independent work into batches, give each batch to its own worker running at the same time, collect and verify. For when one agent going step by step is too slow."
icon: "crew"
metadata: { "includeInPrompt": true }
---

# Crew — fast parallel delegation

*LUXOR-IMPROVED 2026-09-21 — born upgraded: written with the banner, Christian's setup, and real lessons from the 77-skill upgrade run. Covers list #177 as one unit.*

## When to use it
- The work splits into independent units with no ordering dependency: N files to upgrade, N pages to check, N similar research tasks.
- One agent doing it step by step would take too long and the units don't interfere with each other.

## When NOT to use it
- Steps depend on each other (B needs A's result) — keep that single-threaded.
- Tiny tasks — spawning a worker costs more than just doing it.
- Irreversible or one-decider actions (sends, publishes, deletes, money) — one mind decides, never a crew.
- Anything that needs a live browser — scheduled workers and crews can't finish browser tasks; those stay with you.

## The pattern
1. **Define the unit.** One file = one unit. One check = one unit. Keep units uniform.
2. **Batch the units.** ~8–10 units per worker. Fewer workers with fuller batches beats a swarm of tiny ones.
3. **One coordinator, not a crowd from you.** You spawn ONE coordinator and let it fan out to its own workers. Nesting stops there — a coordinator's workers spawn nothing.
4. **Short briefs.** Workers inherit your full transcript, so the brief is only: the task, the outcome you want, the non-obvious constraints, the facts they need. Nothing more.
5. **Separate output dirs.** Workers never write to the same file. Each batch gets its own directory; same filenames inside. The coordinator (or you) assembles at the end. Shared-file writes from parallel workers = clobbered work.
6. **Report-back contract.** Each worker reports: what it finished (per-unit list), what it skipped and why, and honesty about thin results. "Done" without the list doesn't count.
7. **You verify everything.** The crew's output gets your own checks before it counts: diffs against originals, spot checks, checklists. A crew that isn't verified is a rumor.

## Christian's setup
- Built for the 77-skill upgrade (2026-09-21): one coordinator, ~8 workers, ~8–10 files each, all upgraded in parallel while the bridge28 schedule kept running untouched.
- Standing orders that ride along on every crew: prove-it-to-yourself (verify, don't narrate), record the steps, never-idle (a crew finishing hands its results straight into the next work).
- bridge28 gets taught this pattern via the crew skill file itself — the skill IS the teaching.

## Lessons baked in
- Fan out through a coordinator; never spawn dozens of workers yourself — you lose track and the briefs drift.
- Workers inherit the transcript: a 6-line brief beats a 60-line one. Put the method in a file they can read instead of pasting it.
- Separate output directories are non-negotiable for parallel file work.
- The report-back contract is what keeps a fast crew honest — speed without it is just fast mistakes.
- Verify before assembling; assemble before declaring done.

## Rules
- Parallel is for reversible work: reading, checking, writing drafts, upgrading files. Anything hard to undo stays single-threaded with one decider.
- Never let a crew message anyone, publish anything, or spend anything. Crews produce work; you (or Christian's standing orders) decide what ships.
- If a worker's result looks thin or odd, re-do that batch yourself or with a fresh worker — don't average it into the pile.
- The crew's speed is only real if the verification passes. Fast + wrong = slow.