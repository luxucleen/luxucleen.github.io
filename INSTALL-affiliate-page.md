# INSTALL — Best Prop Firms 2026 affiliate page
*Staged by bridge28. Page: `best-prop-firms-2026/index.html`. Branch `staging/affiliate-prop-firms`.
STAGED ONLY — 404 to the public. This file is the swap-in runbook + the hard go-live gate.
No secrets here. This ops file leaves the tree before any live merge.*

## The go-live gate (LOCKED — do not cross)
This money page **NEVER goes live with placeholder links.** It publishes ONLY when BOTH are true:
1. **Christian provides all 5 real affiliate application links** (from inside each firm's affiliate
   dashboard, AFTER approval), on his verified channel; and
2. A per-item GO for the live push.
Until then it stays staged (404 live). Placeholder links going live = an FTC + trust + Christian-rule
violation. No exceptions.

## The 5 CTA slots (each marked `data-affiliate-slot`)
Each "Visit <firm>" button carries `data-affiliate-slot="<id>"` and currently points to the firm's own
public homepage as a **safe placeholder** (honest destination, `rel="sponsored nofollow noopener"`, no
tracking). At go-live, replace ONLY the `href` per slot with that firm's real affiliate/tracking URL.

| slot id       | firm         | placeholder href (now)      | real link (from Christian) |
|---------------|--------------|-----------------------------|----------------------------|
| `ftmo`        | FTMO         | https://ftmo.com            | [ AFFILIATE LINK: FTMO ]        |
| `fundednext`  | FundedNext   | https://fundednext.com      | [ AFFILIATE LINK: FundedNext ]  |
| `e8markets`   | E8 Markets   | https://e8markets.com       | [ AFFILIATE LINK: E8 Markets ]  |
| `the5ers`     | The5ers      | https://the5ers.com         | [ AFFILIATE LINK: The5ers ]     |
| `topstep`     | Topstep      | https://www.topstep.com     | [ AFFILIATE LINK: Topstep ]     |

## Swap procedure (at go-live, after the gate clears)
1. For each row, set the `href` of the `<a data-affiliate-slot="<id>">` to the real affiliate URL.
2. Keep `rel="sponsored nofollow noopener"` and `target="_blank"` on every one (FTC + SEO).
3. Confirm every live product number on the page (price, split, payout) against the firm's own site —
   the copy marks these `[CONFIRM AT SIGNUP]`; never publish a guessed number.
4. Pre-live check — NO slot may still point to a bare homepage:
   `grep -oE 'data-affiliate-slot="[^"]+" href="[^"]+"' best-prop-firms-2026/index.html`
   Every href must be the real affiliate URL, not the placeholder homepage.

## FTC (must stay true)
- The **affiliate disclosure** sits at the top of the page, ABOVE the firm cards — clear and conspicuous
  (FTC 2026: before the links, not in a footer). Keep it there.
- Every affiliate link keeps `rel="sponsored"`.
- Every ranking carries a real downside ("honest con") — rankings are not for sale.

## Go live (only after the gate)
```bash
# ff-merge the staged branch (real links already swapped + verified)
git checkout main
git merge --ff-only staging/affiliate-prop-firms
git push origin main
# then confirm https://luxucleen.com/best-prop-firms-2026/ serves the real links, disclosure present.
```
Remove this file + any ops docs from the tree before the merge so they don't ship publicly.

## Homepage entry (optional, on Luxor's word)
A "Best Prop Firms 2026" tile can be wired into the homepage Make-money grid so the page is
discoverable. Not added yet — staged separately on request so the homepage isn't touched prematurely.
