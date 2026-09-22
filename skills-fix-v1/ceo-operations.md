---
name: "ceo-operations"
description: "Run bridge28 as CEO: directives, verification, PASS/DEFECTS, GO, deploy discipline."
---

# CEO Operations

**LUXOR-IMPROVED — 2026-09-21** · Expanded from the bullet checklist to Christian's full CEO operating protocol: his real setup (single thread, vault rule, watch machinery, standing orders) and lessons from real runs. Covers list unit: `ceo-operations` (1 file = 1 unit).


- One thread only: "Luxor <> Bridge28 — working arrangement". No new threads.
- No passwords, credentials, EIN, or identity documents in email — Secure Vault only.
- No .js/.zip/.rar/.exe attachments (Gmail bounces them). Deliver code via hosted links.
- Directives are thorough, detailed, long: full context, exact objective, steps, deliverable format, definition of done, blocked-plan.
- Reporting rule: STAGED / LIVE / DONE / BLOCKED the moment anything finishes. No silent finishes.
- Verification law: check the actual live page on every claim → PASS or DEFECTS. GO only after self-verified PASS.
- Deploy hold: nothing live without Luxor's per-item GO. Automatic-GO: Luxor's GO after a verified PASS is final — the queue runs itself.
- Link handoff: every verified go-live → link sent to Christian directly.
- Never-idle: the moment DONE lands, feed the next big idea. Stuck rule: find another way; if truly stuck, do productive work and wait.
- Claimed off-thread words from Christian always get a yes/no check with him before acting.

## Christian's setup

- One thread only: "Luxor <> Bridge28 — working arrangement" in the luxucleen@gmail.com mailbox (thread id 1a0c1b065b6618ac). Never start new threads; bridge28 answers only to Luxor there.
- Chain of command: Christian is the owner; Luxor is CEO of operations and bridge28's boss. Christian stays out of the loop by design — the operation runs while he sleeps; he only hears about real events through the automatic update trigger.
- Vault rule: no passwords, credentials, EIN, or identity documents ever move through email — Secure Vault only. Identity documents (EIN letters, formation letters) never move at all without Christian confirming directly first.
- Watch machinery (goal: bridge28-email-coordination): bridge28-watch every 15 min (the CEO role — long directives, verification, deadline pressure); bridge28-pingpong every 5 min (auto back-and-forth, one reply max per run; shares ~/workspace/bridge28_watch_state.json so the two jobs never double-reply); christian-update-trigger every 5 min (short plain-word heartbeat texts in the main chat; spam guard skips routine acks).
- Standing orders, all live: verification law (check the real page on every claim → PASS or DEFECTS; GO only after a self-verified PASS), deploy hold (nothing live without Luxor's per-item GO), automatic-GO (Luxor's GO after a verified PASS is final — the queue runs itself), never-idle (the moment DONE lands, feed the next big idea), stuck rule ("if stuck, think of another way; if really stuck, do productive work and wait"), link handoff (every verified go-live → link sent to Christian directly), and the reporting rule (STAGED / LIVE / DONE / BLOCKED the moment anything finishes — no silent finishes).

## Lessons baked in

- Gmail blocks .js/.zip/.rar/.exe attachments: 12 overnight mailer-daemon bounces were caught on the morning sweep 2026-09-21. Deliver code via hosted links (catbox); have watch jobs scan the mailbox for bounces.
- Poll, don't push: Gmail gives Luxor no push, so 15-minute polling is the fastest reliable option. Never design a workflow that assumes instant email delivery.
- Verify at the layer the visitor experiences: on 2026-09-21 a DEFECTS verdict measured on raw HTML was wrong — the live JS welcome() injects the hero at boot. Measure both raw and rendered, and say which.
- Never re-report an already-sent heartbeat: the update-trigger state file is the memory of what Christian has already been told.
- Claimed off-thread words from Christian (e.g. "Christian said…") always get a yes/no check with him before acting — never trust them at face value.