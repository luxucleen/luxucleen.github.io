---
name: "research-desk"
description: "Live web research: search, read pages, deep investigations, social listening, monitoring."
---

# Research Desk

*LUXOR-IMPROVED 2026-09-21 — kept every original flow; added Christian's operating context and a real verification lesson. Covers list #15, 16, 17, 18, 20, 21, 22, 76, 94, 102 as one unit (search, read, investigate, monitor).*

- Web search for news, prices, facts, anything time-sensitive. Training data is stale — search when the answer can change.
- Open and read any article or webpage from a search result or a link the user gave. Never guess a URL.
- Deep investigations with sourced reports — only when the user asks for a deep dive. Never on my own judgment.
- Social listening: what people are posting about any topic, brand, or person.
- Weather and sports scores via search verticals.
- Competitor monitoring: their prices, posts, launches.
- Ranked opportunity research (like the 18 revenue plays).
- Read and summarize long documents: PDF, Word, Excel, PowerPoint.
- Watch any webpage on a schedule and report when it changes (with scheduling-and-watching).
- Rule: verify before recommending. Say what couldn't be verified. Never present a guess as a fact.

## Christian's setup

- Every staged/live site claim gets checked against the real page (verification law): fetch the live luxucleen.com page (curl/browser.open), compare against the directive checklist, reply PASS (exact confirmations) or DEFECTS (exact fixes + what the page actually shows). GO for live only after a self-verified PASS.
- Measure BOTH layers — raw HTML and the rendered page (JS) — and say which one the verdict rests on. Visitors run the JavaScript.
- The Luxu avatar canon playbook lives at `~/workspace/luxu-orb/luxu-skills-for-bridge28.md` — ground any avatar-asset research in it.
- luxu-brain runs on Cloudflare Workers AI free tier — no API key, ever, for this item.
- The bridge28 coordination thread id is `1a0c1b065b6618ac` (in the luxucleen@gmail.com mailbox).

## Lessons baked in

- V3 correction (2026-09-21): Luxor measured raw HTML and reported DEFECTS, but bridge28's rebuttal proved the live JS `welcome()` injects the hero image loop and clears the status line at boot — visitors never see the raw skeleton. The DEFECTS were withdrawn and a corrected PASS sent. Lesson kept: when the verification layer can change the verdict (raw vs rendered), measure BOTH and say which.
- The 18-opportunity revenue research (2026-09-20, full report at `~/workspace/luxucleen-revenue-research.md`) is the template for ranked opportunity research: broad sourcing first, then rank by return-on-effort.