/* hero-orb.js — OPTIONAL progressive enhancement for the Phase-2 glass orb.
   The hero is 100% functional with ZERO JavaScript (extract §0: no JS touches the hero today,
   and this keeps that true — the page renders and animates via CSS alone if this file never loads).
   This only FREEZES the living loop when it shouldn't run: under prefers-reduced-motion, and when
   the tab is hidden (battery / GPU — extract §6.10). No external requests, no DOM injection. */
(function () {
  "use strict";
  var mirage = document.querySelector('.id .ring .orb-mirage');
  if (!mirage) return;                              // hero not present -> do nothing
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  function apply() {
    // freeze the placeholder aurora (CSS pauses .orb-mirage.is-still::after); a real webp,
    // being a static-when-paused raster, is unaffected but the class is harmless on it too.
    mirage.classList.toggle('is-still', rm.matches || document.hidden);
  }
  document.addEventListener('visibilitychange', apply);
  if (rm.addEventListener) rm.addEventListener('change', apply);
  else if (rm.addListener) rm.addListener(apply);   // Safari < 14 fallback
  apply();
})();
