# hero-mirage asset slot

`hero-mirage.webp` goes here — the living loop that plays inside the frosted-glass orb.

Constraints (locked by the Phase-2 directive + extract §6.9):
- **Animated WEBP only. Never `<video>`.**
- **Local file only** — no CDN, no remote URL. The homepage's stance is "no request leaves this page."
- Square, ≥ 208×208 px (2× the 104px orb) so it stays sharp; it is clipped to a circle and sits *behind*
  the frost, so fine detail is softened — motion + color read more than sharpness.
- The composition is already wired: `hero-orb.css` points `.orb-mirage` at `assets/hero-mirage.webp`.
  Drop the file in and it appears under the glass; nothing else changes.

The video-asset design decision is Luxor's. Until the file lands, `hero-orb.css` runs a pure-CSS aurora
placeholder so the orb is alive for review (see L-UPGRADE-PHASE2-NOTES.md → "Honest placeholder").
