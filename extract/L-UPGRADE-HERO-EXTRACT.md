# L-UPGRADE — Phase 1: Hero-circle extraction (byte-honest map)

*Extraction material for Luxor's Phase-2 build. Source = the LIVE luxucleen.com homepage
(`luxucleen/luxucleen.github.io` @ `main` `34cea3e`). Read from the repo source, not a rendered
scrape, so it is byte-exact. Branch: `staging/luxu-hero-extract` — never merges to main, never live.*

Companion files (verbatim slices, nothing edited):
- `extract/hero-circle.html` — the full hero section (`<section class="id">`, index.html:222-240).
- `extract/hero-circle.css` — every rule that touches the circle, sliced by line range from `hub.css`.

## 0. Where it lives / what loads it
- Homepage `index.html` loads exactly **one** stylesheet: `<link rel="stylesheet" href="/hub.css">`
  (line 21) — confirmed the only `stylesheet` link in the file. `site.css` is NOT loaded on the home
  page (inner pages use it).
- `<body class="hub">` (line 142). **Every hero rule is scoped to `body.hub`.**
- The inline `<style>` block (index.html:90-139) styles `.b28` and the member-home `.mh-*` — it contains
  **no** `.id`/`.ring` rules. The hero circle is 100% in `hub.css`.
- **No JavaScript touches the hero.** `lux-orb.js`, `lux-inbox.js`, `luxu-chat.js` do not select
  `.id`/`.ring` (the single `.ring` string match in the tree is inside an unrelated code comment). The
  circle is pure static HTML + CSS — safe to rebuild without worrying about JS injection into it.

## 1. The DOM (index.html:222-223)
```html
<section class="id">
  <div class="ring"><span>L</span></div>
  ...
```
- `.id` = the hero identity block (circle + H1 + tagline + meta + pills + trust strip).
- `.ring` = the **outer ring** (the target).
- `.ring span` = the **inner disc + the "L" glyph** (a TEXT glyph, not an image/SVG).

## 2. Visual layers, element by element

### Layer A — `.ring` (the spinning gradient rim)  [hub.css:50-52]
- Size **104 × 104 px** · `border-radius:50%` · `margin:0 auto 16px` (centered, 16px gap below).
- `padding:3px` ← **this is what makes the visible ring band.** The 3px gap around the opaque inner
  disc is the only place the conic gradient shows. Change this = change ring thickness.
- `position:relative`.
- **Conic ring:** `background:conic-gradient(from 0deg, var(--green), var(--gold), #38c8ff, var(--green))`
  - Stops (implicit even spacing, loop closed): `#2ec27e` (green, 0°/0%) → `#f2c14e` (gold, ~120°/33%)
    → `#38c8ff` (cyan, ~240°/66%) → `#2ec27e` (green, 360°/100%). Start angle **0deg**.
- **Shadows:** `box-shadow:0 0 0 7px rgba(46,194,126,.08)` = a 7px soft **green halo ring** at 8% alpha;
  `,0 22px 50px rgba(0,0,0,.55)` = drop shadow (offset-y 22px, blur 50px, black 55%).
- **Animation:** `spin 14s linear infinite` — rotates the conic rim clockwise, 14s/revolution.

### Layer B — `.ring span` (the inner disc + the "L")  [hub.css:53-54]
- `display:grid; place-items:center; width:100%; height:100%; border-radius:50%`.
- **Disc fill:** `background:#16181d` — **identical to the `body.hub` base background** (§4), so the disc
  reads as a hole and only the 3px rim shows. (Light theme: `#f4f6fb`, hub.css:158.)
- **Glyph:** `font-size:46px; font-weight:900; color:#fff; letter-spacing:-1px`. (Light: `color:#111621`.)
- **Animation:** `spin 14s linear infinite reverse` — counter-rotates at the same 14s so the **L stays
  visually upright** while the rim turns. Because the disc is a flat color, its own rotation is invisible.
  Net effect: **spinning gradient rim, static L.**

### Layer C — `.id` wrapper (entrance only)  [hub.css:49]
- `text-align:center; padding:30px 0 6px`.
- `animation:rise .6s cubic-bezier(.2,.7,.2,1) both` — fade + 14px slide-up on load.

## 3. Animations (names · keyframes · duration · timing)  [hub.css:146-147, 33]
- `@keyframes spin { to { transform:rotate(360deg) } }` — used by `.ring` (fwd) & `.ring span` (reverse). **14s linear infinite.**
- `@keyframes rise { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }` — `.id`, **0.6s cubic-bezier(.2,.7,.2,1) both.**
- `@keyframes luxhorbs { 0% / 50% / 100% translate3d+scale+rotate }` — the **background** orb field (behind the ring, §4), **34s ease-in-out infinite alternate.**

## 4. Backdrop the ring sits over (what a glass orb would refract)  [hub.css:14-34]
- `body.hub` base: `background:#16181d` + three layered `radial-gradient`s (green top-center 30%α, gold
  top-right 12%α, blue bottom-left 10%α), `background-attachment:fixed`.
- `body.hub::before` [z-index:-1]: fixed vignette `radial-gradient(...transparent 60%, rgba(0,0,0,.55) 100%)`.
- `body.hub::after` [z-index:-1]: the **animated orb/glare field** — 4 radial-gradients (cyan/purple/green/gold,
  .13–.16α) + a conic sweep, `mix-blend-mode:screen`, `filter:blur(22px) saturate(1.18)`, `luxhorbs 34s`.
- **z-index stack (bottom→top):** `body.hub::after` / `::before` (both -1) < base bg < `.id`/`.ring`
  (auto, normal flow — no explicit z-index on the hero). Within the ring: `.ring` box < `.ring span` (on top, fills all but the 3px rim).

## 5. Dependencies / environment
- **Fonts:** NONE external. The "L" inherits `body.hub`'s stack: `ui-sans-serif, -apple-system,
  BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif`
  at weight **900**. ("Inter" is named but not `@font-face`d → resolves to a system face.)
- **Images / SVG:** NONE. Ring = pure CSS conic-gradient; glyph = the text character "L".
- **Color tokens** (`:root`, hub.css:9-12): `--green:#2ec27e` · `--gold:#f2c14e` · `--dim:#9aa4b4` ·
  `--ink:#eef2f8`. Hardcoded in the ring: cyan `#38c8ff`, disc `#16181d`.
- **Media queries that change the circle:**
  - `@media(max-width:420px)` (hub.css:148): `.ring` → **92 × 92 px**; `.ring span` font-size → **40px**.
  - `@media(prefers-reduced-motion:reduce)` (hub.css:149): `.id, .group, .ring, .ring span { animation:none }`
    → **rim stops, L static, no entrance.**
- **Dark/light:** theme is `:root[data-theme="light"]`-driven (default = dark `:root`). Light overrides
  that touch the hero: `.ring span` bg `#f4f6fb` / color `#111621` (hub.css:158); `.id h1` and `.id .tag`
  recolor (155/157). The conic rim itself is unchanged across themes.

## 6. CONSTRAINT INVENTORY — hard facts to design the glass orb around
1. **MUST survive:** the "L" glyph (upright, 46px/900/-1px) and the conic rim (green→gold→cyan→green, spinning 14s).
2. **The rim is made by `padding:3px` + an OPAQUE inner span.** A `backdrop-filter` glass added to `.ring`
   will be **occluded by the opaque `.ring span`** unless the span is made translucent. Decide where the
   frost/video layer lives — likely a NEW layer between `.ring` and `.ring span`, or the span becomes glass.
3. **The disc (#16181d dark / #f4f6fb light) is deliberately = page bg** so the ring looks like a floating
   rim. A video "mirage" replacing the disc intentionally breaks that seamlessness — that's the upgrade —
   but **both themes must be redefined** for the new look.
4. **Counter-rotation is load-bearing:** `.ring span`'s `spin ... reverse` exists only to keep the L
   upright while the rim turns. A video/mirage layer must **NOT** inherit that animation (it would spin the
   video). Put the L on its own non-rotating layer.
5. **Clipping:** a video must be clipped to the circle — `overflow:hidden; border-radius:50%` on the orb
   layer. `.id`/`.ring` have **no** `overflow` clip today.
6. **Shadows:** the 7px green halo + drop shadow — decide keep/restyle under glass.
7. **A11y contract:** `prefers-reduced-motion` currently kills ALL ring motion → the looping video **must
   also pause/hide** under reduced-motion, or it breaks the existing contract.
8. **Responsive:** ring 104→92px and glyph 46→40px at ≤420px → the orb + video must scale with the ring,
   not overflow it on iPhone-class widths.
9. **Zero-external-request stance:** `hub.css` header states "no scripts, no request leaves this page."
   A looping video is a new asset — **flag:** must it be inlined/local to preserve that security stance?
10. **Performance:** backdrop-filter + a looping video + the existing 34s blurred orb field + the 14s dual
    spin = real GPU cost; watch mobile battery/jank.

## 7. Sibling circles (NOT the target — but a glass redesign may want them to match)
- `.mh-ring` (member-home avatar, 74px, `radial-gradient(#dffcff→#2be8ff→#7c5cff→#0b0e14)` + glow) — inline style, index.html:123-124; also `<div class="mh-ring">L</div>` at line 198.
- `.b28:before` — the Bridge28 card's rotating conic sheen (inline style, index.html:95) — an aesthetic cousin of the ring's conic.
- `.ic.or` / `.ic.pf` etc. — small link-tile chips with radial/linear gradients.

*End of extraction. This document + the two verbatim files are complete enough to rebuild the hero circle
pixel-identical without a follow-up question. Nothing here is live or merged.*
