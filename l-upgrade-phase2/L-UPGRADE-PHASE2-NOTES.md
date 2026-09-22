# L-UPGRADE — Phase 2: Frosted-glass orb hero (STAGED)

*Branch `staging/l-upgrade-phase2`, off `main @ 34cea3e`, clean history. Never merges to main,
never live, until Luxor's per-item GO. Self-contained so it verifies staged the same way Phase 1 did.*

## What this package is
The luxucleen.com hero "L" circle, rebuilt as a **frosted-glass orb** with a **living-loop mirage
inside the glass** — while keeping the "L" mark, the spinning conic ring, and Luxu canon. Built from
the Phase-1 extraction alone (`extract/L-UPGRADE-HERO-EXTRACT.md` + the two verbatim slices) so I could
start before your full Phase-2 directive draft lands.

## Files
| file | what it is |
|---|---|
| `hero-orb.html` | drop-in replacement for `index.html:222-240` (`<section class="id">`). ONLY the `.ring` block changes vs live; H1/tagline/meta/pills/trust-strip are byte-identical. |
| `hero-orb.css` | the orb: conic rim + glass + mirage + L, both themes, reduced-motion, ≤420px scale. Load after `hub.css` (or fold into `hub.css:49-58` + the `:158` light block). |
| `hero-orb.js` | OPTIONAL. Freezes the loop under reduced-motion + when the tab is hidden. Hero works with zero JS. |
| `preview.html` | self-contained BEFORE/AFTER. Open it; toggle dark/light + reduced-motion. This is the before/after snapshot. |
| `assets/hero-mirage.webp` | **asset slot — empty by design.** The real motivational-mirage animated-WEBP is your video-asset call. See "Awaiting your directive" below. |

## Before / after
- **BEFORE (`main @34cea3e`):** `<div class="ring"><span>L</span></div>` — a spinning conic rim (green→gold→cyan→green, 14s) around an opaque disc (`#16181d`, = page bg) with the "L" counter-rotating to stay upright. Pure CSS, no JS, no image.
- **AFTER:** the box stops spinning; the **conic rim moves to `.ring::before`** and spins alone; an inner **`.orb`** (non-spinning, `overflow:hidden`) holds three layers — (1) `.orb-mirage` the living loop, (2) `.orb-frost` the `backdrop-filter` glass over it, (3) `.orb-glyph` the "L" on top, crisp. Same 104px size, same rim palette, same 14s cadence.

## How every §6 constraint from the extract is honored
1. **L + conic rim survive** — L is 46px/900/-1px upright (`.orb-glyph`); rim palette + 14s spin unchanged (`.ring::before`). ✔
2. **Rim = `padding:3px` + opaque child would occlude glass** — solved by moving the conic to `::before` and insetting `.orb` by `--orb-rim:3px`; the 3px band shows through, the glass lives *inside* the orb, not fighting the rim. ✔
3. **Disc = page bg was deliberate; mirage breaks that seam on purpose; both themes redefined** — `.orb` seam kept as fallback; light theme fully re-specced (`#f4f6fb` seam, brighter frost, dark glyph). ✔
4. **Counter-rotation was load-bearing** — removed the dependency entirely: the box no longer spins, so the mirage + L never inherit rotation. No counter-spin needed. ✔
5. **Clip the loop to the circle** — `.orb{overflow:hidden;border-radius:50%}`. ✔
6. **Shadows** — kept the 7px green halo + 22px/50px drop; added glass inner-shadow/highlight. ✔
7. **Reduced-motion must also pause the loop** — `@media (prefers-reduced-motion:reduce)` stops rim + mirage; `hero-orb.js` reinforces it. ✔
8. **Responsive 104→92 / glyph 46→40 at ≤420px** — `--orb-size` + glyph rule in the `max-width:420px` block. ✔
9. **Zero-external-request stance** — the mirage asset is **local only** (`assets/hero-mirage.webp`); no CDN, no remote fetch. Placeholder is pure CSS. ✔
10. **Performance** — one `backdrop-filter`, one blurred aurora, the existing 34s field + the 14s rim. `isolation:isolate` scopes the blur; JS pauses the loop when hidden. Watch on low-end mobile once the real webp is in. ⚠ measure with the real asset.

## Honest placeholder (not a fabrication)
The mirage you see today is a **CSS aurora** (`.orb-mirage::after`, an 18s drifting gradient) so the orb
is genuinely alive for review. It is **not** a stand-in "motivational video" I invented. `never <video>`
is honored — the real living loop is an **animated WEBP** that drops into `assets/hero-mirage.webp`; the
frost layer sits over whatever fills that slot, so the composition is already correct and won't move when
the asset arrives.

## Awaiting your Phase-2 directive draft (the two open decisions, both yours)
1. **The mirage asset itself** — the motivational-video-as-animated-WEBP. Your video-asset design call
   (you reserved it, I did not decide it). Drop it at `assets/hero-mirage.webp`; nothing else changes.
2. **Exact frost/params** — `--orb-frost-blur` (7px) and `--orb-frost-sat` (1.25) are sensible starting
   values; if your draft specs different frost strength, orb border, or halo, they are single-variable edits.

## Untouched on purpose
- The **blank-when-idle status line** — not part of the hero circle; this package does not touch it (per your directive).
- **Keyboard / Luxu canon** — "Chat with Luxu" and every Luxu string in the hero read exactly as live; nothing renamed.
- **`main`** — still `@34cea3e`. Nothing merged, nothing served.

## Verify it staged (same as Phase 1)
Fetch `staging/l-upgrade-phase2`, open `l-upgrade-phase2/preview.html` in any browser (no server, no
external request), toggle the two buttons. The drop-in is `hero-orb.html` + `hero-orb.css` (+ optional `hero-orb.js`).

## DEPLOY-FOLD checklist (added per Luxor's 21:39 verify — records so nobody guesses at deploy time)
When Phase 2 is folded into `main` (only on Luxor's per-item GO **and** the real mirage asset landing —
never on the honest placeholder), two things must be done by hand, not assumed:

1. **The mirage asset path is CSS-relative.** `hero-orb.css` references `url("assets/hero-mirage.webp")`.
   When these rules are folded into `hub.css` on `main`, that resolves against the page root to
   **`/assets/hero-mirage.webp`** — so the real animated-WEBP must land at **`assets/hero-mirage.webp` ON
   MAIN**, NOT inside the `l-upgrade-phase2/` staging folder. (Animated WEBP only, local only, never `<video>`.)

2. **Old `.ring` rules are REPLACED, not stacked.** `hub.css` currently drives the hero with the original
   box-spin + `.ring span` counter-rotation. Those exact old rules must be **removed** when the orb override
   rules go in — if both live in `hub.css` at once, two animation sources fight (the box would spin AND the
   rim would spin). Remove the old `.ring` box `animation` + the `.ring span` reverse-`animation` (the
   counter-rotation that kept the "L" upright); the orb override retires that dependency by spinning the rim
   alone via `.ring::before`.

Neither change is a rebuild — both are one-time fold-time edits. Recorded here so the fold is mechanical.
