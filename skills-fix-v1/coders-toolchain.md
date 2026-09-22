---
name: "coders-toolchain"
description: "The full coder's toolchain: read, write, run, test, git, deploy, agents, APIs, browser testing."
---

# Coder's Toolchain

*LUXOR-IMPROVED 2026-09-21 — light upgrade: original playbook was already complete and already written with Christian's context; added only the standing orders and paths that touch code work. Covers list #25, 27, 28, 29, 30, 31, 33, 36, 145–176 as one unit (the full build pipeline).*

**Read:** any file — code, configs, logs, plain text. Images: screenshots, diagrams, photos. PDF, Word, Excel, PowerPoint, ePub as working text. Directory maps. Codebase-wide search for any string or pattern. My own memory for past work, decisions, old fixes.

**Write:** new files from scratch in any language. Surgical edits — exact lines, no rewrites. Incremental appends for logs and long outputs. Real Word docs, Excel workbooks, PowerPoint decks, PDFs. Markdown docs, READMEs, runbooks. Complete code packages — websites, scripts, automations.

**Run:** full Linux terminal. Long jobs in the background while staying responsive. Drive interactive terminal programs with keystrokes. Test suites with real failure reading. Debug loop — error, fix, retry until green. Install packages (npm, pip, system). Virtualenvs and Node versions.

**Ship:** git — clone, branch, commit, merge, push, pull. GitHub CLI — repos, pull requests, issues, releases. Deploy by pushing — luxucleen.com goes live on push (GitHub Pages, auto-publishes).

**Scale:** split work across parallel subagents; steer, pause, resume, or replace them mid-job. Self-running multi-agent workflows. Reusable skills for repeated work. Code on timers or event triggers.

**Connect:** any REST API — auth headers, webhooks, JSON. SQLite — create, query, migrate. Scrape and parse web data. Convert between CSV, JSON, Excel.

**Deliver:** interactive web apps and pages as artifacts with live preview links. Documents, PDFs, slide decks, spreadsheets. Automation scripts for anything repetitive. Organize, merge, clean up files (recoverable trash). Test in a real browser before Christian ever sees it.

## Christian's setup

- luxucleen.com is GitHub Pages, repo `luxucleen/luxucleen.github.io` — deploys are just git pushes, automatic on push.
- Deploy hold: NOTHING pushes live until Luxor gives an explicit per-item GO. Staged (checklist + snapshot) → Luxor verifies → GO → push → LIVE confirmation with URL and post-push check.
- luxucleen.com/orbits/ is do-not-touch without Christian's explicit say-so.
- No credentials, identity documents, or EINs ever move through the bridge28 thread (id `1a0c1b065b6618ac`); the GitHub-token-via-vault plan is shelved unless bridge28's push access fails.
- The Luxu avatar canon playbook lives at `~/workspace/luxu-orb/luxu-skills-for-bridge28.md` — the canonical direction for every Luxu asset build.
- luxu-brain is a Cloudflare Worker on the Workers AI free tier — no API key, ever; model default is Workers AI. The deploy needs Christian's wrangler login/account access (his single green-light item on this front).
- Deliver demos to Christian as hosted page links opened in Safari, never .html attachments (the iPhone file viewer silently breaks JavaScript).

## Lessons baked in

- Deploy model proven live (2026-09-21): bridge28 stages with checklist + snapshot, Luxor reviews and gives per-item GO, bridge28 pushes, confirms LIVE with URL + post-push check. It closes the loop without Christian ever touching his computer.
- STUCK rule (2026-09-21): if blocked, reroute to another way; if truly blocked, pivot to productive queued work and wait — never stall the pipeline on one item.