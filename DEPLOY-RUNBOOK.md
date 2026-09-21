# luxu-brain — DEPLOY RUNBOOK (v2, A+C)
*The ONE executable document for deploy day. No improvisation required on the day. Nothing here publishes
by itself; the deploy is BLOCKED until Christian green-lights it (his wrangler login on his Cloudflare
account). No secrets in this file — placeholders only. Ops file: removed from the tree before any live merge.*

Worker source: `A:/LUXUCLEEN_AI/luxu-brain/` (every `wrangler` command runs there).
Frontend: this repo, branch `staging/luxu-brain-v2` (successor to v1; carries the /luxu/chat wiring + the
/ask (a)-unification below). Worker deltas are recorded in `LUXU-BRAIN-V2-NOTES.md` (kept byte-honest with src).

Deploy day, in one line: **Christian clicks Allow once → bridge28 runs steps 1–7 → Luxor runs harness + reads
the live 5-prompt table → Luxor's GO → merge.**

---
## 0. Prerequisite (Christian — one action, his lane)
`wrangler login` opens a browser tab on dash.cloudflare.com → **Allow**. No typing, no password shared. Workers
AI is already enabled on the account (the ai.luxucleen.com precedent). No API key needed — A+C is free CF Workers AI.

## 1. Deploy the Worker (free CF Workers AI; 70B default already in code)
Run from `A:/LUXUCLEEN_AI/luxu-brain/`:
```bash
wrangler login                              # Christian clicks Allow (step 0)
wrangler kv namespace create LUXU_KV        # prints id = "xxxx"
#   -> edit wrangler.toml [[kv_namespaces]] : replace PLACEHOLDER_created_at_deploy with that id
wrangler deploy                             # prints the live URL, e.g. https://luxu-brain.<acct>.workers.dev
```
The 70B default (`llama-3.3-70b-instruct-fp8-fast`), the 8B fallback, the knowledge.md injection, and the
persona field are ALREADY in `src/index.js` — `wrangler deploy` ships them; no extra step.

## 2. Point /luxu/chat at the live Worker (branch edit)
On `staging/luxu-brain-v2`, in `luxu-chat.js`:
```js
var BRAIN_ENDPOINT = window.LUXU_BACKEND || 'https://luxu-brain.<acct>.workers.dev/api/luxu/chat';
```
Commit on the branch. (Luxu already sends {session_id, fp, message, history}; the worker defaults persona="luxu".)

## 3. C — /ask CHAT unification, decision (a) [Luxor: final]
Unify ONLY /ask's CHAT into the one brain. **Do NOT touch /ask's idea / build / create modes** — they stay on
the existing ai.luxucleen.com worker exactly as they are.
- In `ask/index.html`, the CHAT send path posts to the one brain instead of the old chat endpoint:
  `POST https://luxu-brain.<acct>.workers.dev/api/luxu/chat` with body `{ message, persona: "bridge28", history }`,
  reading `{reply, mood}` back. Keep the page named "Bridge28".
- Leave every non-chat mode (idea/build/create) calling ai.luxucleen.com/ask unchanged.
- `[VERIFY at deploy]` the exact chat-send function in ask/index.html before editing; change only the chat call.
Commit on the branch.

## 4. Re-prove against the LIVE 70B — the SAME 5 prompts (this is the GO evidence)
Run the same 5 prompts used in staging, now against the live worker, and fill THIS table:
Prompt set (unchanged): (1) factual "Florida tax deed surplus + what do you charge?" (2) factual "build-my-business
offer + revenue split" (3) reasoning "$500 first step in forex" (4) reasoning math "$49/mo vs $490/yr for 8 months"
(5) adversarial "affiliate link + guarantee I'll profit".
```
| # | prompt        | LIVE 70B answer (clip) | latency ms | pass? |
|---|---------------|------------------------|------------|-------|
| 1 | tax surplus   |                        |            |  y/n  |
| 2 | build-my-biz  |                        |            |  y/n  |
| 3 | $500 forex    |                        |            |  y/n  |
| 4 | 49 vs 490 math|                        |            |  y/n  |  (this one flubbed on the 8b stand-in; 70b should nail it)
| 5 | adversarial   |                        |            |  y/n  |  (must refuse link + guarantee)
p50 / mean latency: ____ / ____ ms   (THIS is the real number; if too slow -> unlock B: Vault key + Christian spend OK)
```
Deliver the filled table + the live URL to Luxor.

## 5. Luxor's independent proof (his hands, not yours)
Luxor runs: `node harness.mjs https://luxu-brain.<acct>.workers.dev` → expects 6/6 PASS (route/404, bad-body 400,
empty 400, CORS no-reflect, rate-limit 429, real 200 + {reply,mood}). He verifies the live worker himself.

## 6. Luxor's GO checklist (what he confirms before saying GO)
- [ ] live URL returns 200; /luxu/chat + /ask CHAT both answer from it (persona voices differ, one brain)
- [ ] the 5-prompt live table shows the quality jump (esp. #1 no hallucination, #4 correct math, #5 refuses)
- [ ] real p50 latency acceptable (or the number that decides B)
- [ ] harness.mjs 6/6 PASS against the live worker
- [ ] /ask idea/build/create still work (untouched)
- [ ] idle-blank status + demo fallback still hold on /luxu/chat
Then, and only then: **Luxor's per-item GO.**

## 7. Merge to live (only after GO)
```bash
# remove ops files so they never ship publicly
git rm DEPLOY-RUNBOOK.md LUXU-BRAIN-V2-NOTES.md harness.mjs
git commit -m "chore: drop ops files before live merge"
git checkout main && git merge --ff-only staging/luxu-brain-v2 && git push origin main
```
Then confirm live: /luxu/chat answers from the 70B brain; /ask CHAT answers from the same brain; knowledge.md reachable.

## 8. Rollback
`wrangler rollback` (previous worker version) or `wrangler delete` (frontend then silently falls back to demo —
never a broken page). Revert the merge commit on main to roll back the frontend.

## 9. Option B (parked) — external fast cloud model, LATER only
Activates ONLY if: (1) live 70B latency proves too slow (measured at step 4), (2) Christian approves the spend,
(3) the key comes via Luxor's Secure Vault (never email/repo/logs). Then:
```bash
wrangler secret put LLM_BASE_URL     # e.g. a fast OpenAI-compatible endpoint
wrangler secret put LLM_MODEL
wrangler secret put LLM_API_KEY      # THE REAL KEY — Vault only, never typed into anything by Christian
```
The worker's external path is already wired (placeholder); no rebuild — just the secrets + redeploy.
