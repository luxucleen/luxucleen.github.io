---
name: "withings"
description: "Use when linking Withings or reading Withings body measurements, activity, sleep, workout, heart, and intraday data."
icon: "withings"
metadata: { "includeInPrompt": false }
---

# Withings

> **LUXOR-IMPROVED — 2026-09-21.** Batch-04 (health/wearables) upgrade; this file is one unit (one skill, one file). Added: a "Christian's setup" section (his timezone, plain-words replies, never-diagnose rule), two additions to the Operating Rules, and a "Lessons baked in" placeholder for real lessons only. Zero original lines removed or changed.

Query Withings body measurements, activity, sleep, and workout data via the bundled `withings` CLI.

## When to Use

Activate when the user asks about their Withings data:
- Body metrics (weight, BMI, body fat, blood pressure, heart rate)
- Daily activity (steps, calories, distance, active duration)
- Sleep sessions (score, stages, duration, breathing rate)
- Workout sessions (run/walk/cycle/etc.)

## Tooling

Three subcommands cover most needs:

| Subcommand | Purpose |
|---|---|
| `withings status` | Connection state (`{ok, status, connect_url?, disconnect_url?, reason?}`). |
| `withings list-fields --category <CAT>` | Field list for a category (snake_case, units in the name). |
| `withings query --category <CAT> --start-date <YYYY-MM-DD> [--end-date --interval --fields]` | Typed snake_case records. Returns a JSON array. |

### Categories

- `daily-metrics` — Daily rollup of Activity (steps/calories/distance/HR) + Measures (weight/BP/body composition). Supports `--interval hourly|daily|weekly` (defaults to `daily`). Aggregation rules: **sum** for counters (`step_count`, `active_energy_burned_kcal`, `distance_walking_running_meters`), **avg** for `hr_average_bpm`, **max** for `hr_max_bpm`, **last-of-bucket** for body measurements (weight/BP/body fat etc.).
- `sleep` — One row per sleep session (score, stages, duration, HR, breathing).
- `workout` — One row per workout session (translated `workout_type` name, duration, distance, calories, HR).

Use `list-fields` to discover available fields per category.

### Output

JSON to stdout. Datetimes are local `YYYY-MM-DD HH:MM:SS` per record's timezone. Session rows include `id` (prefixed `withings_<id>`), `start_datetime`, `end_datetime`, `timezone`. `daily-metrics` buckets include `date` / `hour` / `week_start` + `record_count` instead of `id`.

### Examples

```bash
# Recent workouts
withings query --category workout --start-date 2026-05-01

# Weight trend (last reading per day)
withings query --category daily-metrics --start-date 2026-04-01 --fields body_mass_kg

# Weekly step totals
withings query --category daily-metrics --start-date 2026-04-01 --interval weekly --fields step_count
```

## Auth

Before any Withings API call:
1. Run `withings status`.
2. If `status` is `not_connected`, share `[Connect Withings](<connect_url>)` exactly — never paste the raw URL.
3. After the user completes the callback, re-run `withings status` and proceed only when `connected`.

For disconnect: run `withings disconnect` and share `[Disconnect Withings](<disconnect_url>)` if present.

Never print tokens or credentials.

## Operating Rules

1. Treat linking as one-time onboarding — don't re-prompt for auth unless calls keep failing.
2. Prefer `query --category <CAT>` over the legacy commands. Field names are snake_case with units in the name (`body_mass_kg`, `step_count`, `hr_average_bpm`, `sleep_total_duration_sec`) — never expose Withings's numeric meas-type IDs to the user.
3. **If unsure of a field name, run `withings list-fields --category <CAT>` BEFORE composing `query --fields`.** Withings-native names (`calories`, `distance`, `hr_average`, `weight`) are NOT valid — they're translated to snake_case with units (`energy_burned_kcal`, `distance_meters`, `hr_average_bpm`, `body_mass_kg`). An empty filter result usually means the field name was wrong, not that the data is missing.
4. Default to the last 7 days when the user asks for recent trends without specifying dates.
5. For broad trends, use `--category daily-metrics --interval weekly` instead of pulling every reading. The `--interval` flag already aggregates per the rules above — do NOT apply additional aggregation (sum/avg) to the bucketed output client-side.
6. If `query` returns `[]`, say so clearly — never invent values. If the user is asking for a metric not surfaced by `list-fields`, drop to the legacy escape hatch (`measures --meas-types <ID>` or a more specific subcommand like `heart-list`; see [references/commands.md](references/commands.md) for the meas-type ID table).

## Legacy / Advanced Commands

Pre-`query` per-endpoint passthroughs that return raw `{ok, status, body: <Withings native>}` envelopes. Use only as an **escape hatch** for data not exposed by `query` — e.g. a meas-type missing from the translation table (`withings measures --meas-types 130` for AFib ECG result), high-frequency sleep sensor data (`withings sleep`), or ECG signals (`withings heart-list` / `heart-get`).

Quick reference for the other passthroughs:
- `withings activity` — raw daily Activity rows.
- `withings sleep-summary` — raw nightly sleep summaries with Withings-native field names.
- `withings intraday` — minute-resolution activity sensor data.
- `withings devices` — list paired Withings devices.

Full command matrix, meas-type IDs, and Withings → Muse field mapping: [references/commands.md](references/commands.md).

## Christian's setup

- Timezone: America/New_York. Datetimes the CLI returns are already local per
  the record's timezone — when a reply needs a time, say it in his timezone
  plainly ("this morning", "Tuesday 7:40am"), never as a raw timestamp.
- Health reads are descriptive and analytical only: trend callouts ("your
  weight is down ~3 lb this month") are fine; clinical interpretation is not —
  that belongs to his healthcare provider.
- Never claim a specific device is paired; `withings devices` lists what is
  actually paired when he asks.
- Replies in plain words with no CLI jargon — say "you burned 2,410 calories
  today", never `query --category daily-metrics`.

## Lessons baked in

- No hard-won lessons from actual use yet for this skill — the section stays
  honest and short until one is earned.