# luxu-brain v2 — A+C staging notes
*Preview branch staging/luxu-brain-v2 (successor to v1). Ops file — removed from the tree before any live
merge. Worker source lives at A:/LUXUCLEEN_AI/luxu-brain/ (not in this public repo). Nothing here is live;
the deploy is Christian's wrangler lane.*

## What changed in the worker (src/index.js) for A+C
- **Option A — model:** default model bumped `llama-3.1-8b` → **`llama-3.3-70b-instruct-fp8-fast`** (both FREE
  on the account, no key). If the 70B errors/times out, it **falls back to the 8B** automatically (`askCloudflare`
  tries primary → `CF_FALLBACK`). Proven with a forced-70B-failure test (served by 8B, 200).
- **Option A — knowledge:** injects the SAME `knowledge.md` Bridge28 uses (`https://luxucleen.com/knowledge.md`),
  fetched once per isolate, cached 10 min, trimmed to 6000 chars. Fail-open: if the fetch fails, the persona
  still answers. Character precedes, knowledge fills the head. Proven: the system prompt contains the KNOWLEDGE
  block with real content.
- **Option C — one brain, two faces:** the worker now selects a persona from the request `persona` field —
  `"luxu"` (default, /luxu/chat) or `"bridge28"` (/ask). Same model, same knowledge, only the voice differs.
  Both faces POST the SAME route `/api/luxu/chat`. Proven: persona switch + both return 200 on one endpoint.
- **Option B stays intact + parked:** the external-provider path (`LLM_BASE_URL`/`LLM_MODEL`/`LLM_API_KEY`
  placeholder) is untouched, so a fast paid cloud model can activate later via the Vault + deploy without a rebuild.

## Deploy
The full, executable deploy sequence lives in **DEPLOY-RUNBOOK.md** (v2) — one document, no improvisation.
**C — /ask unification: Luxor picked (a)** — unify ONLY /ask's CHAT into the one brain (persona="bridge28"),
keep /ask's idea/build/create modes on the existing ai.luxucleen.com worker untouched. (Runbook step 3.)

## Verified locally (zero cost, zero deploy) — see the STAGED report for the table
Logic proof (mock env.AI): knowledge injected, persona switch, 70B→8B fallback, one-brain routing — all pass.
Smart-vs-smart (5 prompts, arm ii = the real v2 worker on an 8B local stand-in + knowledge): knowledge kills
the hallucination the old 8B/no-knowledge produced; the stand-in understates the production 70B.

## BLOCKED on the deploy (Christian's lane, honestly flagged)
- A **live preview URL** — needs the Worker deployed to Cloudflare.
- The **exact CF-70B outputs + real latency** — the local 8B stand-in ran ~14s on a 6GB GPU, which is NOT
  Cloudflare-GPU latency; the true 70B numbers (and the evidence to unlock B if 70B is slow) come at deploy.
