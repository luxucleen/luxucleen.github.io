/*! lux-orb — Luxucleen floating voice concierge ("Jarvis").
    Wake-name (yours to rename), durable memory, funnel-aware, can navigate the site.
    Hands-free auto-listen is Pro-only; everyone can tap the orb to talk.
    Loads on every page; state persists across navigation (localStorage). No popup window. */
(function () {
  "use strict";
  try {
    if (window.__luxOrb) return; window.__luxOrb = true;

    var API = "https://ai.luxucleen.com/ask";
    var path = location.pathname || "/";
    var ES = path.indexOf("/es/") === 0 || path === "/es" || /\/es(\/|$)/.test(path);
    var LANG = ES ? "es" : "en";

    function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
    function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    var NAME = (get("lux_orb_name", "") || "Luxu").slice(0, 40);
    var EMAIL = get("lux_email", "");
    var PRO = get("lux_pro", "") === "1" || !!EMAIL;
    var ID = get("lux_orb_id", "");
    if (!ID) { ID = "o" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); set("lux_orb_id", ID); }
    var MEMID = EMAIL || ID; // Pro (signed-up) => durable, cross-device memory keyed by email

    var hist = []; try { hist = JSON.parse(get("lux_orb_hist", "[]")) || []; } catch (e) { hist = []; }
    function saveHist() { try { set("lux_orb_hist", JSON.stringify(hist.slice(-24))); } catch (e) {} }

    var T = ES ? {
      hint: 'Di "' + NAME + '"', listening: "Te escucho…", thinking: "Pensando…",
      hi: "Hola, soy " + NAME + ". Toca o di mi nombre.",
      pro: "La voz manos-libres es para miembros Pro. Toca el orbe para hablar.",
      err: "No te escuché bien. Toca e intenta otra vez.",
      nomic: "Tu navegador no permite el micrófono. Escribe abajo.",
      ph: "Escribe o toca para hablar…", rename: "¿Cómo me quieres llamar?", off: "Voz apagada"
    } : {
      hint: 'Say "' + NAME + '"', listening: "Listening…", thinking: "Thinking…",
      hi: "Hey, I'm " + NAME + ". Tap me or say my name.",
      pro: "Hands-free voice is for Pro members. Tap the orb to talk.",
      err: "I didn't catch that. Tap and try again.",
      nomic: "Your browser blocks the mic. Type below.",
      ph: "Type, or tap to talk…", rename: "What should you call me?", off: "Voice off"
    };

    // ---------- styles (injected once) ----------
    var css = document.createElement("style");
    css.textContent = [
      ".luxorb-wrap{position:fixed;left:18px;bottom:18px;z-index:2147483040;font:14px/1.4 -apple-system,Segoe UI,Roboto,system-ui,sans-serif;-webkit-user-select:none;user-select:none}",
      ".luxorb{width:60px;height:60px;border-radius:50%;cursor:pointer;position:relative;border:0;padding:0;background:radial-gradient(circle at 32% 30%,#7ef0c0,#2ea6ff 46%,#7a5cff 100%);box-shadow:0 6px 22px rgba(46,166,255,.45),0 0 0 rgba(126,240,192,.6);transition:transform .18s ease,box-shadow .3s ease;animation:luxorbFloat 4.2s ease-in-out infinite}",
      ".luxorb:hover{transform:scale(1.06)}",
      ".luxorb::after{content:'';position:absolute;inset:8px;border-radius:50%;background:radial-gradient(circle at 60% 65%,rgba(255,255,255,.5),rgba(255,255,255,0) 60%);opacity:.7}",
      ".luxorb.live{animation:luxorbFloat 4.2s ease-in-out infinite,luxorbPulse 1.15s ease-in-out infinite}",
      ".luxorb.think{animation:luxorbFloat 4.2s ease-in-out infinite,luxorbSpin 1s linear infinite}",
      ".luxorb.talk{box-shadow:0 6px 22px rgba(126,92,255,.6),0 0 26px rgba(126,240,192,.7)}",
      "@keyframes luxorbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}",
      "@keyframes luxorbPulse{0%,100%{box-shadow:0 6px 22px rgba(46,166,255,.45),0 0 0 0 rgba(126,240,192,.55)}50%{box-shadow:0 6px 22px rgba(46,166,255,.55),0 0 0 14px rgba(126,240,192,0)}}",
      "@keyframes luxorbSpin{to{transform:rotate(360deg)}}",
      "@keyframes luxFly{0%{transform:translate(0,0) scale(1)}18%{transform:translate(26vw,-46vh) scale(1.18)}52%{transform:translate(74vw,-26vh) scale(1.12)}80%{transform:translate(16vw,-30vh) scale(1.14)}100%{transform:translate(0,0) scale(1)}}",
      ".luxorb.flyby{animation:luxFly 1.5s cubic-bezier(.5,.05,.3,1) 1 !important}",
      ".luxorb-wrap{transition:transform .55s cubic-bezier(.3,.75,.2,1)}",
      ".luxorb-wrap.center{transform:translate(min(42vw,340px),-42vh)}",
      "@keyframes luxWake{0%,100%{transform:scale(1.45);box-shadow:0 0 30px 6px rgba(126,240,192,.65),0 0 60px 16px rgba(46,166,255,.42)}50%{transform:scale(1.62);box-shadow:0 0 46px 12px rgba(126,240,192,.92),0 0 86px 26px rgba(46,166,255,.62)}}",
      ".luxorb.wake{animation:luxWake 1.15s ease-in-out infinite !important}",
      ".luxorb-bubble{position:absolute;left:0;bottom:72px;max-width:min(78vw,340px);background:rgba(16,19,26,.92);color:#eaf2ff;border:1px solid rgba(126,240,192,.28);border-radius:14px;padding:10px 13px;box-shadow:0 10px 30px rgba(0,0,0,.4);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;transform:translateY(6px);transition:opacity .2s,transform .2s;pointer-events:none}",
      ".luxorb-bubble.show{opacity:1;transform:translateY(0);pointer-events:auto}",
      ".luxorb-bubble .who{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#7ef0c0;margin-bottom:3px}",
      ".luxorb-bubble .msg{font-size:14px;color:#eaf2ff}",
      ".luxorb-bubble .row{display:flex;gap:6px;margin-top:9px}",
      ".luxorb-bubble input{flex:1;min-width:0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);color:#eaf2ff;border-radius:9px;padding:7px 9px;font-size:13px;outline:none}",
      ".luxorb-bubble button.snd{background:#2ea6ff;color:#fff;border:0;border-radius:9px;padding:0 12px;font-size:15px;cursor:pointer}",
      ".luxorb-bubble .bar{display:flex;gap:9px;margin-top:8px;align-items:center;justify-content:space-between}",
      ".luxorb-bubble .bar small{color:#8fa3bd;font-size:11px}",
      ".luxorb-bubble .bar a{color:#7ef0c0;cursor:pointer;font-size:11px;text-decoration:none}",
      "@media (prefers-reduced-motion:reduce){.luxorb,.luxorb.live,.luxorb.think,.luxorb.flyby{animation:none}}"
    ].join("");
    (document.head || document.documentElement).appendChild(css);

    // ---------- DOM ----------
    var wrap = document.createElement("div"); wrap.className = "luxorb-wrap";
    var orb = document.createElement("button"); orb.className = "luxorb"; orb.type = "button";
    orb.setAttribute("aria-label", ES ? "Asistente de voz Luxucleen" : "Luxucleen voice assistant");
    var bubble = document.createElement("div"); bubble.className = "luxorb-bubble";
    bubble.innerHTML =
      '<div class="who"></div><div class="msg"></div>' +
      '<div class="row"><input type="text" aria-label="message"><button class="snd" type="button" aria-label="send">↑</button></div>' +
      '<div class="bar"><small></small><a class="rn"></a></div>';
    wrap.appendChild(bubble); wrap.appendChild(orb);
    var elWho = bubble.querySelector(".who"), elMsg = bubble.querySelector(".msg"),
        elIn = bubble.querySelector("input"), elSnd = bubble.querySelector(".snd"),
        elHint = bubble.querySelector(".bar small"), elRn = bubble.querySelector(".rn");
    elIn.placeholder = T.ph; elRn.textContent = ES ? "renombrar" : "rename";

    function boot() {
      document.body.appendChild(wrap);
      restorePos();
      setHint(); // stay quiet on load; the greeting shows on first tap/wake
      try { if (!sessionStorage.getItem("lux_orb_flew")) { sessionStorage.setItem("lux_orb_flew", "1"); setTimeout(flyby, 500); } } catch (e) { setTimeout(flyby, 500); }
      if (PRO) startWake(); // hands-free auto-listen — Pro only (music ducks low the whole time it's on)
    }
    function flyby() { try { orb.classList.remove("flyby"); void orb.offsetWidth; orb.classList.add("flyby"); setTimeout(function () { orb.classList.remove("flyby"); }, 1650); } catch (e) {} }
    function wakeCenter(on) { try { if (on) { wrap.classList.add("center"); orb.classList.remove("live", "think", "talk"); orb.classList.add("wake"); } else { wrap.classList.remove("center"); orb.classList.remove("wake"); } } catch (e) {} }

    function setHint() { elHint.textContent = PRO ? T.hint : T.off; }

    // ---------- caption ----------
    var hideTimer = null;
    function show() { bubble.classList.add("show"); if (hideTimer) clearTimeout(hideTimer); }
    function autohide(ms) { if (hideTimer) clearTimeout(hideTimer); hideTimer = setTimeout(function () { bubble.classList.remove("show"); }, ms || 6500); }
    function say(who, msg, keep) { elWho.textContent = who; elMsg.textContent = msg; show(); if (!keep) autohide(); }

    // ---------- radio duck ----------
    function duck(on) { try { if (window.luxDuck) window.luxDuck(on); } catch (e) {} }

    // ---------- talk to the worker ----------
    var busy = false;
    function ask(text) {
      text = (text || "").trim(); if (!text || busy) return;
      busy = true; orb.classList.remove("live"); orb.classList.add("think");
      say(NAME, T.thinking, true);
      hist.push({ r: "u", t: text }); saveHist();
      fetch(API, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "talk", q: text, lang: LANG, name: NAME, mem: MEMID, history: hist.slice(-10), voice: "bella" })
      }).then(function (r) { return r.json(); }).then(function (d) {
        orb.classList.remove("think");
        var ans = (d && d.answer) ? d.answer : T.err;
        hist.push({ r: "a", t: ans }); saveHist();
        say(NAME, ans, true); autohide(9000);
        if (d && d.clips && d.clips.length) speak(d.clips);
        else if (d && d.audio) speak([{ audio: d.audio, type: d.audio_type }]);
        else finishTalk();
        if (d && d.go && /^\/[a-z0-9\/_-]*$/i.test(d.go)) {
          var go = d.go; setTimeout(function () { try { location.href = go; } catch (e) {} }, 2600);
        }
        busy = false;
      }).catch(function () { orb.classList.remove("think"); say(NAME, T.err, false); busy = false; finishTalk(); });
    }

    // ---------- Aura playback ----------
    var audio = null, queue = [], qi = 0;
    function speak(clips) {
      queue = clips || []; qi = 0; orb.classList.add("talk"); duck(true); next();
    }
    function next() {
      if (qi >= queue.length) return finishTalk();
      var c = queue[qi++]; if (!c || !c.audio) return next();
      try {
        audio = new Audio("data:" + (c.type || "audio/mpeg") + ";base64," + c.audio);
        audio.onended = next; audio.onerror = next;
        var p = audio.play(); if (p && p.catch) p.catch(function () { next(); });
      } catch (e) { next(); }
    }
    function finishTalk() {
      wakeCenter(false); orb.classList.remove("talk"); // return to the corner
      if (PRO && wakeOn) { duck(true); setTimeout(startListen, 350); } // still listening -> keep music low
      else duck(false); // one-shot done -> music back
    }

    // ---------- speech recognition (wake-name + command) ----------
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var rec = null, wakeOn = false, mode = "idle"; // idle | wake | command
    function newRec(continuous) {
      var r = new SR(); r.lang = ES ? "es-ES" : "en-US";
      r.continuous = continuous; r.interimResults = true; r.maxAlternatives = 1; return r;
    }
    function nameHit(s) {
      s = (s || "").toLowerCase();
      var n = NAME.toLowerCase();
      if (s.indexOf(n) >= 0) return true;
      // a couple of forgiving variants so it triggers reliably
      return n === "luxu" && (s.indexOf("lux") >= 0 || s.indexOf("luxo") >= 0);
    }
    function stripName(s) {
      var n = NAME.toLowerCase(), l = (s || "").toLowerCase(), i = l.indexOf(n);
      return i >= 0 ? s.slice(i + n.length).replace(/^[,\.\s]+/, "").trim() : s.trim();
    }
    function startWake() {
      if (!SR) { setHint(); return; }
      wakeOn = true; duck(true); startListen(); // music drops low + pleasant so you can talk to Luxu anytime
    }
    function startListen() {
      if (!SR || !wakeOn) return;
      try { if (rec) { rec.onend = null; rec.abort(); } } catch (e) {}
      mode = "wake"; rec = newRec(true); orb.classList.add("live");
      var last = "";
      rec.onresult = function (ev) {
        var txt = "";
        for (var i = ev.resultIndex; i < ev.results.length; i++) txt += ev.results[i][0].transcript;
        last = txt;
        if (mode === "wake" && nameHit(txt)) { mode = "command"; cmdCapture(); }
      };
      rec.onerror = function () {};
      rec.onend = function () { if (wakeOn && mode === "wake") { setTimeout(startListen, 400); } };
      try { rec.start(); } catch (e) {}
    }
    function cmdCapture() {
      try { if (rec) { rec.onend = null; rec.abort(); } } catch (e) {}
      wakeCenter(true); say(NAME, T.listening, true); // heard its name: fly to the middle, glowing
      var r = newRec(false); var got = "", done = false;
      r.onresult = function (ev) { got = ""; for (var i = 0; i < ev.results.length; i++) got += ev.results[i][0].transcript; };
      r.onerror = function () {};
      r.onend = function () {
        if (done) return; done = true;
        var cmd = stripName(got);
        if (cmd) ask(cmd); else { wakeCenter(false); say(NAME, T.err, false); if (wakeOn) setTimeout(startListen, 500); }
      };
      try { r.start(); } catch (e) { wakeCenter(false); if (wakeOn) setTimeout(startListen, 500); }
      setTimeout(function () { try { r.stop(); } catch (e) {} }, 6000);
    }
    function stopWake() { wakeOn = false; duck(false); try { if (rec) { rec.onend = null; rec.abort(); } } catch (e) {} orb.classList.remove("live"); } // music back to normal

    // tap the orb: Pro toggles hands-free; everyone gets one-shot listen (or type)
    orb.addEventListener("click", function (e) {
      if (dragMoved) { dragMoved = false; return; }
      show(); autohide(9000);
      if (SR) {
        if (PRO) { // toggle hands-free
          if (wakeOn) { stopWake(); say(NAME, T.off, false); setHint(); }
          else { startWake(); flyby(); say(NAME, T.hi, false); setHint(); }
        } else { // free: one-shot listen
          oneShot();
        }
      } else { elIn.focus(); if (!PRO) say(NAME, T.nomic, false); }
    });
    function oneShot() {
      if (!SR) { elIn.focus(); return; }
      say(NAME, T.listening, true); orb.classList.add("live"); duck(true);
      var r = newRec(false), got = "", done = false;
      r.onresult = function (ev) { got = ""; for (var i = 0; i < ev.results.length; i++) got += ev.results[i][0].transcript; };
      r.onerror = function () {};
      r.onend = function () { orb.classList.remove("live"); if (done) return; done = true; if (got.trim()) ask(got.trim()); else { duck(false); say(NAME, T.err, false); } };
      try { r.start(); } catch (e) {}
      setTimeout(function () { try { r.stop(); } catch (e) {} }, 6000);
    }

    // typed fallback
    function sendTyped() { var v = elIn.value.trim(); if (v) { elIn.value = ""; ask(v); } }
    elSnd.addEventListener("click", sendTyped);
    elIn.addEventListener("keydown", function (e) { if (e.key === "Enter") sendTyped(); });

    // rename the assistant
    elRn.addEventListener("click", function () {
      var n = prompt(T.rename, NAME); if (n && n.trim()) { NAME = n.trim().slice(0, 40); set("lux_orb_name", NAME); location.reload(); }
    });

    // ---------- drag (remembers position) ----------
    var dragMoved = false, dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    function restorePos() {
      try {
        var p = JSON.parse(get("lux_orb_pos", "null"));
        if (p && typeof p.l === "number") { wrap.style.left = Math.max(4, Math.min(innerWidth - 64, p.l)) + "px"; wrap.style.right = "auto"; wrap.style.bottom = Math.max(4, Math.min(innerHeight - 64, p.b)) + "px"; }
      } catch (e) {}
    }
    function down(x, y) { dragging = true; dragMoved = false; sx = x; sy = y; var r = wrap.getBoundingClientRect(); ox = r.left; oy = innerHeight - r.bottom; }
    function move(x, y) {
      if (!dragging) return; var dx = x - sx, dy = y - sy;
      if (Math.abs(dx) + Math.abs(dy) > 5) dragMoved = true;
      var nl = Math.max(4, Math.min(innerWidth - 64, ox + dx)), nb = Math.max(4, Math.min(innerHeight - 64, oy - dy));
      wrap.style.left = nl + "px"; wrap.style.right = "auto"; wrap.style.bottom = nb + "px";
    }
    function up() { if (!dragging) return; dragging = false; try { var r = wrap.getBoundingClientRect(); set("lux_orb_pos", JSON.stringify({ l: r.left, b: innerHeight - r.bottom })); } catch (e) {} }
    orb.addEventListener("mousedown", function (e) { down(e.clientX, e.clientY); });
    document.addEventListener("mousemove", function (e) { move(e.clientX, e.clientY); });
    document.addEventListener("mouseup", up);
    orb.addEventListener("touchstart", function (e) { var t = e.touches[0]; down(t.clientX, t.clientY); }, { passive: true });
    document.addEventListener("touchmove", function (e) { if (dragging) { var t = e.touches[0]; move(t.clientX, t.clientY); } }, { passive: true });
    document.addEventListener("touchend", up);

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  } catch (e) { /* never break the page */ }
})();
