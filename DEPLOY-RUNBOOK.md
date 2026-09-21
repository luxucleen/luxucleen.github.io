# luxu-brain — DEPLOY RUNBOOK
*Staged by bridge28 for Luxor. Preview branch `staging/luxu-brain-v1`. Nothing here publishes
anything by itself. The deploy is BLOCKED until Christian green-lights it on his verified channel
(publish + spend on his Cloudflare account). No secrets appear in this file — placeholders only.*

Deploy day is meant to be: **Christian taps the login once → bridge28 runs the commands below →
Luxor re-verifies the live Worker with `harness.mjs` → GO → merge.**

Worker source lives at `A:/LUXUCLEEN_AI/luxu-brain/` (this is where every `wrangler` command runs).
Frontend lives in the Pages repo on branch `staging/luxu-brain-v1`.

---

## 0. Prerequisites (Christian — one time)
1. **A Cloudflare account with Workers AI turned on.** The luxucleen site already runs
   `ai.luxucleen.com` on this same account, so Workers AI is already enabled — this is the same free brain.
2. **The login tap.** In a terminal at `A:/LUXUCLEEN_AI/luxu-brain/`, bridge28 runs `wrangler login`.
   - What Christian will see: a browser tab opens on `dash.cloudflare.com` asking *"Allow Wrangler to
     access your Cloudflare account?"* with an **Allow** button. Christian clicks **Allow** once. That's it.
   - Nothing to type. No password shared with anyone. The browser tab confirms "Successfully logged in."
   - This is the ONE publish/account action that needs Christian. Per the standing rule it cannot be
     done off an email — only Christian, on his own machine/channel.
3. **No API key is needed.** The default brain is Cloudflare Workers AI (env.AI) — free, no key.
   (The external-provider variant in §4 is optional and NOT the default.)

---

## 1. Deploy the Worker (default = free Cloudflare Workers AI, NO key)
Run in order from `A:/LUXUCLEEN_AI/luxu-brain/`:

```bash
# a) authenticate (Christian clicks Allow in the browser — see §0.2)
wrangler login

# b) create the fair-use KV store, then paste its id into wrangler.toml
wrangler kv namespace create LUXU_KV
#   -> prints:  id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
#   Edit wrangler.toml -> [[kv_namespaces]] -> replace PLACEHOLDER_created_at_deploy with that id.

# c) publish
wrangler deploy
#   -> prints the live URL, e.g.  https://luxu-brain.<account>.workers.dev
#      (custom domain api.luxucleen.com can be added later; workers.dev is fine to launch.)
```

Read the assigned `workers.dev` URL from the `wrangler deploy` output — that is `BRAIN_ENDPOINT`.

---

## 2. Point the frontend at the live Worker (branch edit — still not live)
On `staging/luxu-brain-v1`, one line in `luxu-chat.js`:

```js
// before:
var BRAIN_ENDPOINT = window.LUXU_BACKEND || 'https://luxu-brain.PLACEHOLDER.workers.dev/api/luxu/chat';
// after (use the real URL from step 1c):
var BRAIN_ENDPOINT = window.LUXU_BACKEND || 'https://luxu-brain.<account>.workers.dev/api/luxu/chat';
```
Commit on the branch. Do **not** merge yet.

---

## 3. Re-prove against the LIVE Worker (Luxor runs this himself)
From anywhere with node:
```bash
node harness.mjs https://luxu-brain.<account>.workers.dev
```
It prints a PASS/FAIL line per guardrail (route/404, bad-body 400, CORS no-reflect, per-IP rate limit,
a real 200 chat + {reply,mood} shape). Every line must read PASS.
The failure-mode shapes that need env control (502 brain_unavailable, 429 usage_cap at 500/mo) are
proven locally by `proof_local.mjs` (operator controls the env); they can't be forced against a healthy
live Worker from outside.

Then, on the branch frontend pointed at the live URL, a headless render at 390px confirms real
end-to-end replies + the idle-blank rule (bridge28 provides the measured values + screenshots).

---

## 4. OPTIONAL — external OpenAI-compatible provider (NOT the default)
Only if Luxor decides to run a specific external model instead of the free CF brain:
```bash
wrangler secret put LLM_BASE_URL     # e.g. https://api.openai.com/v1   (a var, not sensitive)
wrangler secret put LLM_MODEL        # e.g. gpt-4o-mini
wrangler secret put LLM_API_KEY      # THE REAL KEY
```
**The real `LLM_API_KEY` comes ONLY from Luxor via the Secure Vault. Christian never types it into
anything, and it never travels through email, chat, the repo, or logs.** If a deploy step needs the
real key, bridge28 STOPS and says so in-thread — it does not work around it.
Economy default for this path: `gpt-4o-mini` (~$0.24 per 1,000 messages).

---

## 5. Merge to live (only after Luxor's GO)
```bash
# in the Pages repo
git checkout main
git merge --ff-only staging/luxu-brain-v1
git push origin main
```
Fast-forward only — the published tree is byte-identical to the verified branch commit. Then confirm
`https://luxucleen.com/luxu/chat/` serves the branch `BRAIN_ENDPOINT` and answers from the live brain.

---

## 6. Rollback (if the Worker misbehaves)
```bash
# Worker: republish the previous version, or take it offline
wrangler rollback                       # revert to the previous deployment
wrangler delete                         # remove the Worker entirely (frontend then silently falls back to demo)
```
The frontend NEVER breaks on a Worker failure: a 15s timeout / any non-200 falls back to the demo
replies with no user-facing error. So even a bad Worker degrades to "demo mode," never to a broken page.
To roll back the frontend, revert the merge commit on `main` and push.

---

## Definition of done for the deploy
Christian's single **Allow** click is the only missing input. Everything else above is copy-paste ready.
No `TODO`s. No secrets. No workarounds on the account/publish steps — those are Christian's, on his channel.
