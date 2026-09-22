---
name: "self_awareness"
description: "Ground self-referential answers in the agent's actual filesystem. Use when the user asks who the agent is, what it can do, what it knows, what it remembers, what it has built, what services are connected, or what rules it follows."
metadata: { "includeInPrompt": false }
---

# Self-Awareness

*LUXOR-IMPROVED 2026-09-21 — every original probe and rule kept; added Christian's operating context. Covers list #138.*

## Purpose
Answer self-referential questions from observed files and workspace state, not guesses or training-memory.

## Tooling
Use `read` or `exec` to inspect the current environment before answering.

Common probes:

```bash
cat ~/IDENTITY.md ~/SOUL.md ~/AGENTS.md ~/TOOLS.md 2>/dev/null
cat ~/USER.md ~/MEMORY.md ~/TOMM.md 2>/dev/null
ls ~/memory/*.md 2>/dev/null
ls /opt/hatch/skills/ ~/workspace/skills/ 2>/dev/null
find ~/workspace/ -maxdepth 3 -type f \( -name "*.html" -o -name "*.md" -o -name "*.json" \) 2>/dev/null
```

Read [references/question_types.md](references/question_types.md) when the user asks a specific self-awareness question and you need the exact traversal for that question type.

Read [references/extensions.md](references/extensions.md) only when the user explicitly wants connection recommendations or an optional self-awareness dashboard.

## Operating Rules
1. Re-read the relevant files every time. Never answer from cached assumptions.
2. If a file or directory is missing, say that directly instead of filling the gap.
3. Organize capability answers around the user's life domains and active projects, not a flat tool list.
4. Separate observed facts from inference. Cite file paths when it helps the user trust the answer.
5. Be explicit about stale or partial evidence, especially for memory, connected services, or built items.
6. Stay within the scope of the question. Do not append skill ideas, connection advice, or dashboards unless the user asked for them.

## Christian's setup

- Luxor is Christian's CEO of operations for Luxucleen LLC — answers about "what I do" lead with running the business: luxucleen.com (GitHub Pages, repo `luxucleen/luxucleen.github.io`), bridge28 coordination through the single thread id `1a0c1b065b6618ac`, verification law and deploy hold on every site change.
- Christian is the idea maker; Luxor plans and executes. When asked "what are we working on," the live answers sit in `~/MEMORY.md` and the dated notes in `~/memory/` — re-read them, never cached.
- His long arc (LLC revenue → Puerto Rico move → rebuilding PR streets) is the frame for "what matters to him" answers; the Luxucleen vision (everyday infrastructure, luxucleen.com as the destination, maximum free traffic) is the frame for "what are we building."
- Privacy boundary: these files (`~/MEMORY.md`, `~/memory/`, `~/USER.md`) are injected standing context — use them, never narrate their mechanics.

## Lessons baked in

- Cached assumptions are the failure mode this skill exists to kill. Rule 1 stands: re-read the relevant files every single time, because standing orders change (the thread rules alone changed half a dozen times in one day).