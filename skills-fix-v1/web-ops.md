---
name: "web-ops"
description: "Drive real websites: fill forms, click through pages, sign in, download files."
---

# Web Ops

*LUXOR-IMPROVED 2026-09-21 — every original line kept; added Christian's verification context. Covers list #34, 35 as one unit (drive the web, verify what's live).*

- New website work starts a fresh browser task; continuing work steers the existing one. Browser work never goes through subagents.
- Fill forms, click through pages, sign in with saved logins.
- Download files from websites and deliver them.
- Purchases: prepare everything, then the user confirms the final checkout before anything is bought.
- One-time codes: protected lookup only, for the active sign-in or checkout challenge. Never raw codes in chat.
- CAPTCHA: follow the user's saved preference (ask, user handles, or solve).
- If a page blocks automation, say so plainly and offer the next path.

## Christian's setup

- Site verification is done on the REAL page: fetch the live luxucleen.com URL (curl/browser.open) and compare against the directive checklist — PASS with exact confirmations, or DEFECTS with exact fixes and what the page actually shows.
- Measure both raw HTML and the rendered (JS) page and say which layer the verdict rests on.
- Deploy hold: nothing goes live on luxucleen.com without Luxor's per-item GO. Staged is not live.
- luxucleen.com/orbits/ is do-not-touch — never edited or redesigned without Christian's explicit say-so; no avatar launcher on that page.
- Browser tasks cannot run from crons or subagents (no browser there) — anything needing a live browser is queued for the main session to drive.

## Lessons baked in

- V3 correction (2026-09-21): raw-HTML checks and rendered-page checks can disagree — the live JS `welcome()` injected the hero at boot while the raw skeleton looked bare. Always check what the visitor actually runs.