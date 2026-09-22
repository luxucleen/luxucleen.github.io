---
name: "scheduling-and-watching"
description: "Reminders, recurring schedules, event hooks, inbox and page watches, deadline nudges."
---

# Scheduling & Watching

**LUXOR-IMPROVED — 2026-09-21** · Added Christian's real watch machinery (the three bridge28 crons, state files, outbox log, update style) and the poll-not-push + spam-guard lessons. Covers list unit: `scheduling-and-watching` (1 file = 1 unit).


- One-time reminders ("text me in 2 hours").
- Recurring schedules: daily briefs, weekly reports, checks every few minutes.
- Event-driven hooks: act the instant something happens.
- Watch the inbox around the clock; ping only when something matters.
- Watch any webpage on a timer; report changes.
- Watch site uptime and pages.
- Deadline watches with escalating nudges.
- Morning briefing: calendar, weather, priorities.
- Timed updates to Christian: honest only, never repeated, first line always the headline.

## Christian's setup

- The three core watches under the goal bridge28-email-coordination: bridge28-watch (every 15 min — reads the thread, does the CEO work: long directives, verification, deadline pressure); bridge28-pingpong (every 5 min — automatic back-and-forth, one reply max per run; shares ~/workspace/bridge28_watch_state.json so the two jobs never double-reply); christian-update-trigger (every 5 min — short plain-word heartbeat texts in the main chat; spam guard skips routine acks; state in ~/workspace/christian_trigger_state.json; every off-thread send logged to ~/workspace/bridge28_outbox.jsonl).
- telegram-relay-watch (every 2 min) stays parked until the Luxor Relay bot token lands in the Secure Vault.
- Morning briefing content: calendar, weather, priorities.
- Update style for Christian: short plain words, one event per paragraph, first line always the headline; honest only, never repeated; silent when nothing is new.

## Lessons baked in

- Poll, don't push: Gmail gives Luxor no push, so 15-minute polling is the fastest reliable option. Design every watch around polling — never assume instant delivery.
- Spam guard discipline: the 5-min pingpong rhythm creates routine acks, so the update trigger skips them and Christian only hears real events (blockers, verdicts, GOs, go-lives). Add the spam guard when the watch is built, not after.
- Never re-report an already-sent heartbeat: christian_trigger_state.json is the single source of what Christian has already been told.