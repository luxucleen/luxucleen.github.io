/* Luxucleen sitewide radio -- ONE ambient live stream that AUTO-RESUMES on every page.
   ----------------------------------------------------------------------------------
   Root fix (2026-10-02): the old inline block only ever called arm() on boot, i.e. it
   waited for a fresh click on THIS page before playing. It NEVER attempted playback on
   load, so the music died on every navigation ("doesn't stay played when I open another
   page"). Now, on each page load, if the listener hasn't turned it off, we attempt to
   resume immediately. The browser's autoplay policy permits this once the visitor has
   engaged with the origin (after their first tap), so the stream follows them across the
   whole site. A brand-new visitor's very first load is blocked by the browser (an
   unavoidable rule) -> we arm a one-time resume on the first tap/scroll/key.
   Loaded once per page as <script defer src="/lux-radio.js"></script>. The /radio page
   has its own full-volume player and does NOT load this (no double audio). */
(function () {
  try {
    if (window.__luxRadio) return;                 // guard: never init twice
    var STREAM = "https://ice1.somafm.com/beatblender-128-mp3";
    var BASE = 0.08, DUCK = 0.015;                 // ambient under the voice agent; duck lower when it talks

    var a = new Audio();
    a.src = STREAM;
    a.preload = "none";                            // no connection until we actually play
    a.volume = BASE;
    a.setAttribute("playsinline", "");             // iOS: play inline, don't hijack fullscreen

    // source of truth: "off" means the listener muted it; anything else = wants it on
    var on = true;
    try { if (localStorage.getItem("lux_radio") === "off") on = false; } catch (e) {}

    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Background radio on or off");
    btn.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:2147483000;width:46px;height:46px;border-radius:50%;border:0;cursor:pointer;font-size:20px;line-height:46px;text-align:center;background:#0f5aa8;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.3);opacity:.9";
    function icon() { btn.textContent = on ? (a.paused ? "♪" : "🔊") : "🔇"; }

    // ---- gesture fallback: only used when the browser BLOCKS an autoplay attempt ----
    var armed = false;
    function arm() {
      if (armed) return; armed = true;
      var go = function () {
        document.removeEventListener("click", go);
        document.removeEventListener("touchstart", go);
        document.removeEventListener("keydown", go);
        document.removeEventListener("scroll", go);
        armed = false;
        tryStart();
      };
      document.addEventListener("click", go, { once: true });
      document.addEventListener("touchstart", go, { once: true });
      document.addEventListener("keydown", go, { once: true });
      document.addEventListener("scroll", go, { once: true, passive: true });
    }

    function tryStart() {
      if (!on) { icon(); return; }
      try {
        a.muted = false; a.volume = BASE;
        var p = a.play();
        if (p && p.then) {
          p.then(function () { armed = false; icon(); })
           .catch(function () { arm(); icon(); });  // blocked (e.g. first-ever visit) -> wait for a gesture
        }
      } catch (e) { arm(); }
      icon();
    }
    function stop() { try { a.pause(); } catch (e) {} icon(); }

    btn.addEventListener("click", function () {
      on = !on;
      try { localStorage.setItem("lux_radio", on ? "on" : "off"); } catch (e) {}
      if (on) tryStart(); else stop();
      icon();
    });

    a.addEventListener("playing", icon);
    a.addEventListener("pause", icon);

    // keep the live stream alive: reconnect if the feed stalls or errors (but never spin)
    a.addEventListener("stalled", function () {
      if (on && !a.paused) { try { a.load(); a.play().catch(function () {}); } catch (e) {} }
    });
    a.addEventListener("error", function () {
      if (on) setTimeout(function () { try { a.load(); if (on) a.play().catch(function () {}); } catch (e) {} }, 1500);
    });

    // ---- agent ducking hooks: lux-orb.js pauses/ducks the music while Luxu listens or talks ----
    window.luxDuck = function (d) { try { a.volume = (typeof d === "number") ? d : (d ? DUCK : BASE); } catch (e) {} };
    window.luxRadioHold = function () {
      try {
        if (typeof window.__lxHold !== "number") window.__lxHold = 0;
        if (window.__lxHold === 0) { window.__lxWasOn = (on && !a.paused); try { a.pause(); } catch (e) {} }
        window.__lxHold++;
      } catch (e) {}
    };
    window.luxRadioRelease = function () {
      try {
        if (typeof window.__lxHold !== "number") window.__lxHold = 0;
        if (window.__lxHold > 0) window.__lxHold--;
        if (window.__lxHold === 0 && window.__lxWasOn && on) { window.__lxWasOn = false; tryStart(); }
      } catch (e) {}
    };
    window.luxRadioStart = function () { if (on && a.paused) tryStart(); };
    window.luxFadeIn = function () {
      try {
        if (!on) return;
        a.volume = 0; tryStart();
        var t = 0, iv = setInterval(function () {
          t += 0.05; var v = Math.min(BASE, BASE * (t / 4));
          try { a.volume = v; } catch (e) {}
          if (t >= 4) { try { a.volume = BASE; } catch (e) {} clearInterval(iv); }
        }, 50);
      } catch (e) {}
    };

    // ---- music control surface: the /radio page's ♪ button and any caller use this API ----
    window.luxMusic = {
      playing: function () { return on && !a.paused; },
      play: function () { on = true; try { localStorage.setItem("lux_radio", "on"); } catch (e) {} tryStart(); },
      pause: function () { on = false; try { localStorage.setItem("lux_radio", "off"); } catch (e) {} stop(); },
      toggle: function () { if (on && !a.paused) this.pause(); else this.play(); },
      el: function () { return a; }
    };

    // MediaSession = lock-screen / headset controls (better than before)
    try {
      if ("mediaSession" in navigator && window.MediaMetadata) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: "Luxucleen Radio", artist: "shape the sound, live", album: "luxucleen.com"
        });
        navigator.mediaSession.setActionHandler("play", function () { window.luxMusic.play(); });
        navigator.mediaSession.setActionHandler("pause", function () { window.luxMusic.pause(); });
      }
    } catch (e) {}

    // resume when the tab is shown again, or when restored from the back/forward cache
    document.addEventListener("visibilitychange", function () { if (!document.hidden && on && a.paused) tryStart(); });
    window.addEventListener("pageshow", function () { if (on && a.paused) tryStart(); });

    function boot() {
      document.body.appendChild(btn);
      icon();
      if (on) tryStart();          // THE FIX: attempt resume on EVERY load (old code never did)
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();

    window.__luxRadio = window.luxMusic;
  } catch (e) {}
})();
