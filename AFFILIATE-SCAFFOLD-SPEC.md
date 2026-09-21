# Affiliate scaffold — placement / settings / variants (WITHOUT links)
*Everything that does NOT require Christian's 5 real affiliate links, so link-day is one clean swap. No links
invented, no copy drafted around placeholder URLs. Staged-only on staging/affiliate-prop-firms; no live push.
Ops file — removed from the tree before any live merge. Pairs with INSTALL-affiliate-page.md (the swap runbook).*

## What's already scaffolded (built, staged, 404 live — confirmed)
- **Page:** `best-prop-firms-2026/index.html` — 5 CTA slots each with `data-affiliate-slot` (ftmo, fundednext,
  e8markets, the5ers, topstep), all `rel="sponsored nofollow noopener" target="_blank"`, honest downside per firm.
- **FTC disclosure block:** present and ABOVE the firm cards (verified `disclosure_above_firms=true`).
- **Homepage tile:** in the #business Make-money grid → `/best-prop-firms-2026/` (`.ic.pf` cyan chip), staged.

## The 5 slots (swap map — real links drop in here on link-day)
| slot id (`data-affiliate-slot`) | firm | placeholder href now | link-day action |
|---|---|---|---|
| ftmo | FTMO | https://ftmo.com | replace href with the real affiliate URL |
| fundednext | FundedNext | https://fundednext.com | replace href with the real affiliate URL |
| e8markets | E8 Markets | https://e8markets.com | replace href with the real affiliate URL |
| the5ers | The5ers | https://the5ers.com | replace href with the real affiliate URL |
| topstep | Topstep | https://www.topstep.com | replace href with the real affiliate URL |
Nothing else changes on the page at swap time. (Full procedure + go-live gate: INSTALL-affiliate-page.md.)

## Reusable FTC disclosure block (canonical text — use verbatim wherever the page/tiles reference affiliates)
> **Affiliate disclosure:** some links on this page are affiliate links — if you sign up through them, we may
> earn a commission at no extra cost to you. Our rankings are not for sale: we list a real downside for every firm.
Short inline form (tiles/cards): "Some links are affiliate links." Placement rule (FTC): clear + conspicuous +
ABOVE the links, never footer-only.

## Tile / placement variants (specs — apply on link-day or on Luxor's word; none need links)
1. **Homepage tile (DONE):** #business grid, after Trading, `.ic.pf`, → /best-prop-firms-2026/.
2. **Trading-page cross-link (READY, not applied):** a link/tile on `/trading/` → /best-prop-firms-2026/
   ("Honest prop-firm comparison"), since prop firms are trading-adjacent. Not applied — touches a live page;
   apply with the same go-live gate.
3. **Spanish mirror (SPEC only):** `/es/best-prop-firms-2026/` mirroring the page + an /es homepage tile, IF/when
   Spanish coverage is wanted. Not built — flagged as a future variant.
4. **Luxu-chat awareness (SPEC):** once the deals page is live, Luxu's canon changes from "deals page is being
   finalized" to pointing at /best-prop-firms-2026/. Until then, Luxu MUST keep saying "being finalized" (it does).

## Settings / behavior spec
- **Open in new tab** (`target="_blank"`) + `rel="sponsored nofollow noopener"` on every affiliate link (SEO + safety).
- **No tracking/analytics** added around the links beyond what the site already runs (privacy).
- **Numbers:** any price/split/payout figure on the page stays `[CONFIRM AT SIGNUP]` until read from the firm's
  own site at publish (per WP1). No guessed numbers ship.

## THE GO-LIVE GATE (unchanged, restated)
This page + tile NEVER go live until: Christian provides all 5 real affiliate links (verified channel) AND
Luxor's per-item GO. Until then: staged, 404 to the public. Placeholders never ship as live affiliate links.

## Status
Scaffold is complete to the limit of what's possible without links: page ✓, disclosure ✓, tile ✓, slot map ✓,
variants spec'd ✓. The ONLY missing input is Christian's 5 real links — his lane. Nothing else to build here now.
