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
    var VOICE = get("lux_orb_voice", "bella"); // Settings can switch Luxu to Liam
    var TEXT_ONLY = get("lux_text_only", "") === "1"; // Settings / the in-chat mute: show the words, never speak them

    var hist = []; try { hist = JSON.parse(get("lux_orb_hist", "[]")) || []; } catch (e) { hist = []; }
    function saveHist() { try { set("lux_orb_hist", JSON.stringify(hist.slice(-24))); } catch (e) {} }

    // ---------- who is this person? (per-browser signals — no backend, no IP needed) ----------
    // signed in = they made an account (sign-up consent stamp) or opened an encrypted vault.
    var SIGNED = false; try { SIGNED = !!(localStorage.getItem("lux_signup_agreed_v1") || localStorage.getItem("orbit_vault_v1")); } catch (e) {}
    var RETURNING = !!get("lux_returning", "");                // been here before (flag set on first visit)
    var VISITS = parseInt(get("lux_visits", "0"), 10) || 0;    // how many times they've come
    var PERSON = "";                                           // their OWN first name, once learned (never assumed)
    try { PERSON = ((get("lux_person", "") || "").match(/[\p{L}][\p{L} .'\-]{0,23}/u) || [""])[0].trim().split(/\s+/)[0] || ""; } catch (e) { PERSON = ""; }
    function todGreet() { var h = new Date().getHours(); return ES ? (h < 12 ? "Buenos dias" : (h < 19 ? "Buenas tardes" : "Buenas noches")) : (h < 12 ? "Good morning" : (h < 18 ? "Good afternoon" : "Good evening")); }
    function pageCtx() { var p = path.toLowerCase(); if (/jewel|joy/.test(p)) return "jewelry"; if (/we-buy|real-estate|surplus|casa|foreclos|inherit|hered/.test(p)) return "house"; if (/tax|impuesto/.test(p)) return "taxes"; if (/trad/.test(p)) return "trading"; if (/stack|launchpad|\/start|money|dinero/.test(p)) return "money"; return ""; }
    function greetedToday() { try { var d = new Date().toISOString().slice(0, 10); if (get("lux_greet_day", "") === d) return true; set("lux_greet_day", d); return false; } catch (e) { return false; } }
    function learnName(t) {   // if they tell us their name, remember it — greet them by it next time
      try {
        if (PERSON) return;
        var m = String(t || "").match(/(?:i'?m|i am|my name is|this is|soy|me llamo|mi nombre es)\s+([\p{L}][\p{L}.'\-]{1,23})/iu);
        var stop = /^(here|looking|not|just|interested|trying|from|on|in|a|an|the|sorry|good|fine|ok|okay|back|new|ready|done|sure|aqui|buscando|bien|listo|nuevo|de|un|una|el|la|bueno|solo)$/i;
        if (m && m[1] && !stop.test(m[1])) { var nm = m[1].charAt(0).toUpperCase() + m[1].slice(1); PERSON = nm; set("lux_person", nm); }
      } catch (e) {}
    }

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

    // ---------- greetings (rotating; {name}=assistant name, {tod}=time of day, {p}=their name or "") ----------
    // A brand-new visitor gets a warm welcome (no "you look new" labeling); a returning or signed-in
    // person is greeted by name and welcomed BACK — never told they're new. {p} stays empty until learned.
    var NEWG_EN = [
      "Welcome to Luxucleen. I'm {name} — tap me and I'll show you around.",
      "Hey, welcome. I'm {name}. Ask me anything about what we do.",
      "Welcome in. I'm {name}, your guide — tap me whenever you want a hand.",
      "Glad you're here. I'm {name}. Jewelry, your house, taxes, or trading — I'll point you to it.",
      "Welcome. I'm {name}. Tell me what you came for and I'll take you straight there."
    ];
    var NEWG_ES = [
      "Bienvenido a Luxucleen. Soy {name} — tocame y te muestro todo.",
      "Hola, bienvenido. Soy {name}. Preguntame lo que sea.",
      "Bienvenido. Soy {name}, tu guia — tocame cuando quieras ayuda.",
      "Que bueno que llegaste. Soy {name}. Joyeria, tu casa, impuestos o trading — te llevo.",
      "Bienvenido. Soy {name}. Dime que buscas y te llevo directo."
    ];
    var BACKG_EN = [   // signed-in / known member
      "{tod}{p}. Welcome back — want to pick up where you left off?",
      "{tod}{p}. Good to have you back. What are we doing today?",
      "Welcome back{p}. Tap me whenever you need a hand.",
      "{tod}{p}. Right where you left it — what's next?"
    ];
    var BACKG_ES = [
      "{tod}{p}. Que bueno verte de nuevo — seguimos donde lo dejaste?",
      "{tod}{p}. Me alegra tenerte de vuelta. Que hacemos hoy?",
      "Bienvenido de nuevo{p}. Tocame cuando necesites algo.",
      "{tod}{p}. Todo sigue donde lo dejaste — que sigue?"
    ];
    var SEENG_EN = [   // been here before, not signed in
      "{tod}. Good to see you again — where should we pick up?",
      "Welcome back. Need a hand with anything?",
      "{tod}. Back again — tap me and I'll help you find it."
    ];
    var SEENG_ES = [
      "{tod}. Que bueno verte otra vez — por donde seguimos?",
      "Bienvenido de nuevo. Te ayudo con algo?",
      "{tod}. De vuelta — tocame y te ayudo a encontrarlo."
    ];
    function fillG(s) { return s.replace(/\{name\}/g, NAME).replace(/\{tod\}/g, todGreet()).replace(/\{p\}/g, PERSON ? (", " + PERSON) : ""); }

    // ---------- styles (injected once) ----------
    var css = document.createElement("style");
    css.textContent = [
      ".luxorb-wrap{position:fixed;left:18px;bottom:18px;z-index:2147483040;font:14px/1.4 -apple-system,Segoe UI,Roboto,system-ui,sans-serif;-webkit-user-select:none;user-select:none}",
      ".luxorb{width:60px;height:60px;border-radius:50%;cursor:pointer;position:relative;border:0;padding:0;opacity:.9;background:radial-gradient(circle at 32% 30%,rgba(126,240,192,.92),rgba(46,166,255,.85) 46%,rgba(122,92,255,.8) 100%);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);box-shadow:0 6px 22px rgba(46,166,255,.4),0 0 18px rgba(126,240,192,.35);transition:transform .18s ease,box-shadow .3s ease,opacity .3s ease;animation:luxorbFloat 4.2s ease-in-out infinite,luxorbHue 8s ease-in-out infinite alternate}",
      ".luxorb:hover{transform:scale(1.06);opacity:1}",
      ".luxorb::before{content:'';position:absolute;inset:-3px;border-radius:50%;background:conic-gradient(from 0deg,rgba(126,240,192,0),rgba(126,240,192,.45) 20%,rgba(46,166,255,0) 45%,rgba(122,92,255,.4) 70%,rgba(126,240,192,0));opacity:.6;animation:luxorbSwirl 6s linear infinite;pointer-events:none}",
      ".luxorb::after{content:'';position:absolute;inset:8px;border-radius:50%;background:radial-gradient(circle at 60% 65%,rgba(255,255,255,.5),rgba(255,255,255,0) 60%);opacity:.7}",
      ".luxorb.live{animation:luxorbFloat 4.2s ease-in-out infinite,luxorbPulse 1.15s ease-in-out infinite}",
      ".luxorb.think{animation:luxorbFloat 4.2s ease-in-out infinite,luxorbSpin 1s linear infinite}",
      ".luxorb.talk{box-shadow:0 6px 22px rgba(126,92,255,.6),0 0 26px rgba(126,240,192,.7)}",
      "@keyframes luxorbFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.045)}}",
      "@keyframes luxorbSwirl{to{transform:rotate(360deg)}}",
      "@keyframes luxorbHue{0%{filter:hue-rotate(-8deg)}100%{filter:hue-rotate(14deg)}}",
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
      ".luxorb-bubble .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}",
      ".luxorb-bubble .chip{background:rgba(126,240,192,.12);border:1px solid rgba(126,240,192,.34);color:#eaf2ff;border-radius:999px;padding:6px 11px;font-size:12.5px;line-height:1;cursor:pointer;transition:background .15s,transform .1s}",
      ".luxorb-bubble .chip:hover{background:rgba(126,240,192,.22)}",
      ".luxorb-bubble .chip:active{transform:scale(.96)}",
      "@media (prefers-reduced-motion:reduce){.luxorb,.luxorb.live,.luxorb.think,.luxorb.flyby{animation:none}.luxorb::before{animation:none}}"
    ].join("");
    (document.head || document.documentElement).appendChild(css);

    // ---------- DOM ----------
    var wrap = document.createElement("div"); wrap.className = "luxorb-wrap";
    var orb = document.createElement("button"); orb.className = "luxorb"; orb.type = "button";
    orb.setAttribute("aria-label", ES ? "Asistente de voz Luxucleen" : "Luxucleen voice assistant");
    var bubble = document.createElement("div"); bubble.className = "luxorb-bubble";
    bubble.innerHTML =
      '<div class="who"></div><div class="msg"></div>' +
      '<div class="chips" aria-label="quick options"></div>' +
      '<div class="row"><input type="text" aria-label="message"><button class="snd" type="button" aria-label="send">↑</button></div>' +
      '<div class="bar"><small></small><a class="mute"></a><a class="rn"></a></div>';
    wrap.appendChild(bubble); wrap.appendChild(orb);
    var elWho = bubble.querySelector(".who"), elMsg = bubble.querySelector(".msg"),
        elIn = bubble.querySelector("input"), elSnd = bubble.querySelector(".snd"),
        elHint = bubble.querySelector(".bar small"), elRn = bubble.querySelector(".rn"),
        elMute = bubble.querySelector(".mute"), elChips = bubble.querySelector(".chips");
    elIn.placeholder = T.ph; elRn.textContent = ES ? "renombrar" : "rename";
    // one-tap voice mute, right inside the chat (Christian: "chats must have a section where I can turn this off")
    function paintMute() { elMute.textContent = TEXT_ONLY ? (ES ? "🔊 activar voz" : "🔊 voice on") : (ES ? "🔇 solo texto" : "🔇 text only"); }
    function stopSpeaking() { try { if (audio) audio.pause(); } catch (e) {} try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {} try { clearInterval(_ttsPump); } catch (e) {} orb.classList.remove("talk"); duck(false); }
    paintMute();
    elMute.addEventListener("click", function () { TEXT_ONLY = !TEXT_ONLY; set("lux_text_only", TEXT_ONLY ? "1" : "0"); paintMute(); if (TEXT_ONLY) stopSpeaking(); });

    function boot() {
      document.body.appendChild(wrap);
      restorePos();
      setHint(); // stay quiet on load; the greeting shows on first tap/wake
      try { if (!sessionStorage.getItem("lux_orb_flew")) { sessionStorage.setItem("lux_orb_flew", "1"); setTimeout(flyby, 500); } } catch (e) { setTimeout(flyby, 500); }
      if (PRO && get("lux_hands", "1") !== "0") startWake(); // hands-free auto-listen — Pro, unless turned off in Settings
      var greeted = false;
      try { // funnel: if they arrived from an ad via /start?want=X, greet them by intent
        var _in = get("lux_intent", ""), _at = parseInt(get("lux_intent_at", "0"), 10) || 0;
        if (_in && (Date.now() - _at) < 120000) {
          var G = ES ? { jewelry: "Aqui por joyeria con hielo? Te ayudo a elegir.", house: "Vas a vender tu casa? Te ayudo a empezar.", sell: "Vas a vender tu casa? Te ayudo a empezar.", trading: "Aqui por trading? Te muestro como funciona.", taxes: "Aqui por tus impuestos? Empecemos.", tax: "Aqui por tus impuestos? Empecemos.", money: "Listo para ganar dinero con nosotros? Te guio.", stack: "Listo para ganar dinero con nosotros? Te guio." }
                      : { jewelry: "Here for iced-out moissanite? I'll help you pick.", house: "Selling your house? I'll help you start.", sell: "Selling your house? I'll help you start.", trading: "Here for trading? I'll show you how it works.", taxes: "Here for your taxes? Let's get started.", tax: "Here for your taxes? Let's get started.", money: "Ready to make money with us? I'll guide you.", stack: "Ready to make money with us? I'll guide you." };
          var line = G[_in] || (ES ? "Estoy aqui para ayudarte. Toca y pregunta." : "I'm here to help. Tap me and ask.");
          greeted = true;
          setTimeout(function () { say(NAME, line, false); }, 1500);
        }
      } catch (e) {}
      // GREETING — knows who this is (per browser) and never labels a returning person "new".
      //   signed in -> warm "welcome back", by name if known, a soft spoken hello ONCE a day
      //   returning -> "good to see you again", TEXT only (comfortable; never announces you're new)
      //   brand new -> a warm welcome + a spoken hello (their real first time here)
      // The ad-funnel intent greeting above still wins when present.
      try {
        set("lux_visits", String(VISITS + 1));
        if (!RETURNING) set("lux_returning", String(Date.now()));
        if (!greeted) {
          var arr, speakIt;
          if (SIGNED) { arr = ES ? BACKG_ES : BACKG_EN; speakIt = !greetedToday(); }
          else if (RETURNING || VISITS > 0) { arr = ES ? SEENG_ES : SEENG_EN; speakIt = false; }
          else { arr = ES ? NEWG_ES : NEWG_EN; speakIt = true; }
          var g = fillG(arr[Math.floor(Math.random() * arr.length)]);
          setTimeout(function () {
            say(NAME, g, true); autohide(11000); renderChips(chipsFor(pageCtx()));
            if (speakIt && !TEXT_ONLY) { try { speakText(g); } catch (e2) {} }
          }, RETURNING ? 1200 : 1900);
        }
      } catch (e) {}
    }
    function flyby() { try { orb.classList.remove("flyby"); void orb.offsetWidth; orb.classList.add("flyby"); setTimeout(function () { orb.classList.remove("flyby"); }, 1650); } catch (e) {} }
    function wakeCenter(on) { try { if (on) { wrap.classList.add("center"); orb.classList.remove("live", "think", "talk"); orb.classList.add("wake"); } else { wrap.classList.remove("center"); orb.classList.remove("wake"); } } catch (e) {} }

    function setHint() { elHint.textContent = PRO ? T.hint : T.off; }

    // ---------- caption ----------
    var hideTimer = null;
    function show() { bubble.classList.add("show"); if (hideTimer) clearTimeout(hideTimer); }
    function autohide(ms) { if (hideTimer) clearTimeout(hideTimer); hideTimer = setTimeout(function () { bubble.classList.remove("show"); }, ms || 6500); }
    function say(who, msg, keep) { elWho.textContent = who; elMsg.textContent = msg; show(); if (!keep) autohide(); }

    // ---------- quick options (tappable; navigate = instant + reliable on a static site) ----------
    function chipsFor(ctx) {
      var H = ES ? {
        house: [["Vender mi casa", "/es/real-estate/", "house"], ["Oferta en efectivo", "/we-buy-houses/es/", "house"]],
        jewelry: [["Ver la joyeria", "/es/jewelry/", "jewelry"], ["Es real la moissanita?", "/es/guides/la-moissanita-es-real/", "jewelry"]],
        taxes: [["Mis impuestos", "/es/taxes/", "taxes"], ["IA vs TurboTax", "/es/guides/impuestos-con-ia-vs-turbotax/", "taxes"]],
        trading: [["Como funciona", "/es/trading/", "trading"]],
        money: [["Ganar dinero", "/es/stack/", "money"], ["Empezar", "/es/start/", "money"]],
        "": [["Vender mi casa", "/es/real-estate/", "house"], ["Joyeria", "/es/jewelry/", "jewelry"], ["Impuestos con IA", "/es/taxes/", "taxes"], ["Ganar dinero", "/es/stack/", "money"]]
      } : {
        house: [["Sell my house", "/real-estate/", "house"], ["Get a cash offer", "/we-buy-houses/", "house"]],
        jewelry: [["See the jewelry", "/jewelry/", "jewelry"], ["Is moissanite real?", "/guides/is-moissanite-real/", "jewelry"]],
        taxes: [["My taxes", "/taxes/", "taxes"], ["AI vs TurboTax", "/guides/ai-taxes-vs-turbotax/", "taxes"]],
        trading: [["How trading works", "/trading/", "trading"]],
        money: [["Make money with us", "/stack/", "money"], ["Get started", "/start/", "money"]],
        "": [["Sell my house", "/real-estate/", "house"], ["Jewelry", "/jewelry/", "jewelry"], ["AI taxes", "/taxes/", "taxes"], ["Make money", "/stack/", "money"]]
      };
      return (H[ctx] || H[""]).slice(0, 4);
    }
    function renderChips(list) {
      try {
        if (!elChips) return;
        elChips.innerHTML = "";
        if (!list || !list.length) { elChips.style.display = "none"; return; }
        elChips.style.display = "flex";
        list.forEach(function (c) {
          var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = c[0];
          b.addEventListener("click", function () {
            var go = c[1], intent = c[2] || "";
            if (go && /^\/[a-z0-9\/_\-]*$/i.test(go)) {
              try { if (intent) { set("lux_intent", intent); set("lux_intent_at", String(Date.now())); } } catch (e) {}
              try { location.href = go; } catch (e) {}
            } else { ask(c[0]); }
          });
          elChips.appendChild(b);
        });
      } catch (e) {}
    }

    // ---------- music: FULLY STOP while Luxu is listening OR talking, then resume ----------
    // Christian: "whenever the agents talk, or Luxu is listening, the music has to stop."
    // duck(0) / duck(true)  => HOLD  (pause the music)
    // duck(false)           => RELEASE (resume it)
    // One guard so listen -> think -> talk stays silent the WHOLE time, then the music
    // comes back exactly once. Real pause via luxRadioHold/Release; full-mute fallback for
    // any older page shell that doesn't have them yet.
    var musicHeld = false;
    function holdMusic() { if (musicHeld) return; musicHeld = true; try { if (window.luxRadioHold) window.luxRadioHold(); else if (window.luxDuck) window.luxDuck(0); } catch (e) {} }
    function releaseMusic() { if (!musicHeld) return; musicHeld = false; try { if (window.luxRadioRelease) window.luxRadioRelease(); else if (window.luxDuck) window.luxDuck(false); } catch (e) {} }
    function duck(on) { if (on === false) releaseMusic(); else holdMusic(); }

    // ---------- on-device voice unlock (phones block speak() unless it is armed inside a tap) ----------
    var VOICES = [], _ttsWarm = false;
    function loadVoices() { try { if (window.speechSynthesis) { var v = window.speechSynthesis.getVoices(); if (v && v.length) VOICES = v; } } catch (e) {} }
    try { if (window.speechSynthesis) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; } } catch (e) {}
    function warmTTS() { try { if (_ttsWarm || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return; _ttsWarm = true; loadVoices(); var w = new SpeechSynthesisUtterance(" "); w.volume = 0; try { window.speechSynthesis.cancel(); } catch (e) {} window.speechSynthesis.speak(w); } catch (e) {} }

    // ---------- talk to the worker ----------
    var busy = false;
    function ask(text) {
      text = (text || "").trim(); if (!text || busy) return;
      learnName(text); try { renderChips(null); } catch (e) {}
      busy = true; orb.classList.remove("live"); orb.classList.add("think");
      say(NAME, T.thinking, true);
      hist.push({ r: "u", t: text }); saveHist();
      fetch(API, {
        method: "POST", headers: { "Content-Type": "application/json" },
        // send more turns so the agent keeps the thread of the conversation = better context for people
        // (2026-09-19; was -10. saveHist keeps 24, so this is still bounded.)
        body: JSON.stringify({ mode: "talk", q: text, lang: LANG, name: NAME, mem: MEMID, history: hist.slice(-16), voice: TEXT_ONLY ? "off" : VOICE, text_only: TEXT_ONLY })
      }).then(function (r) { return r.json(); }).then(function (d) {
        orb.classList.remove("think");
        var ans = (d && d.answer) ? d.answer : T.err;
        lastAns = ans;   // remembered so the on-device voice can speak it if the cloud clip is blocked
        hist.push({ r: "a", t: ans }); saveHist();
        say(NAME, ans, true); autohide(9000);
        if (TEXT_ONLY) finishTalk();                       // voice off -> the words are on screen, stay silent
        else if (d && d.clips && d.clips.length) speak(d.clips);
        else if (d && d.audio) speak([{ audio: d.audio, type: d.audio_type }]);
        else speakText(ans);
        if (d && d.go && /^\/[a-z0-9\/_-]*$/i.test(d.go)) {
          var go = d.go; setTimeout(function () { try { location.href = go; } catch (e) {} }, 2600);
        }
        busy = false;
      }).catch(function () { orb.classList.remove("think"); say(NAME, T.err, false); busy = false; finishTalk(); });
    }

    // ---------- Aura playback ----------
    var audio = null, queue = [], qi = 0, lastAns = "", playedAny = false;
    function speak(clips) {
      queue = clips || []; qi = 0; playedAny = false; orb.classList.add("talk"); duck(true); next();
    }
    function next() {
      // if NO cloud clip actually played (radio muted / audio channel blocked on the phone), fall back to the
      // on-device voice so she is ALWAYS heard - even with the music muted. (Christian: mute was silencing agents.)
      if (qi >= queue.length) { if (!playedAny && lastAns) { var t = lastAns; lastAns = ""; return speakText(t); } return finishTalk(); }
      var c = queue[qi++]; if (!c || !c.audio) return next();
      try {
        audio = new Audio("data:" + (c.type || "audio/mpeg") + ";base64," + c.audio);
        audio.onended = next; audio.onerror = next;
        audio.onplay = function () { playedAny = true; };
        var p = audio.play(); if (p && p.catch) p.catch(function () { next(); });
      } catch (e) { next(); }
    }
    // pick the most NATURAL voice on the device (neural voices first), not a generic robotic one
    function _pickVoice() {
      try {
        var vs = (VOICES && VOICES.length) ? VOICES : (window.speechSynthesis.getVoices() || []), want = (LANG === "es") ? "es" : "en";
        var PREF = ["natural", "aria", "jenny", "michelle", "ava", "emma", "nicole", "bella", "google", "samantha", "victoria", "zira", "paulina", "monica", "female"];
        var best = null, bestScore = -1;
        for (var i = 0; i < vs.length; i++) {
          var v = vs[i], n = (v.name || "").toLowerCase(), lg = (v.lang || "").toLowerCase();
          if (lg.indexOf(want) !== 0) continue;
          var sc = 1;
          for (var j = 0; j < PREF.length; j++) { if (n.indexOf(PREF[j]) >= 0) { sc = 100 - j; break; } }
          if (n.indexOf("female") < 0 && /\bmale\b|daniel|david|alex|fred|jorge|diego/.test(n)) sc -= 60; // avoid male/robotic defaults
          if (sc > bestScore) { bestScore = sc; best = v; }
        }
        return best;
      } catch (e) { return null; }
    }
    // Split the WHOLE answer into short, sentence-sized pieces so the on-device voice says ALL of it.
    // (2026-09-19, Christian "people should get a better context": was slice(0,300) = the voice cut the
    // answer off mid-thought; browsers also silently drop an over-long single utterance, so we chunk +
    // queue instead — the same "deliver the whole thing, don't truncate" fix as the Telegram bridge.)
    function _ttsChunks(t) {
      t = String(t || "").replace(/\s+/g, " ").trim();
      if (!t) return [];
      var MAX = 200, out = [], buf = "";
      function wrap(s) { s = s.trim(); while (s.length > MAX) { var cut = s.lastIndexOf(" ", MAX); if (cut < 40) cut = MAX; out.push(s.slice(0, cut).trim()); s = s.slice(cut).trim(); } if (s) out.push(s); }
      var toks = t.match(/[^.!?\n]+[.!?]+|\S[^.!?\n]*$/g) || [t];   // sentence-ish tokens (no lookbehind = old-Safari safe)
      for (var i = 0; i < toks.length; i++) {
        var s = toks[i].trim(); if (!s) continue;
        if ((buf ? buf + " " + s : s).length <= MAX) { buf = buf ? buf + " " + s : s; }      // group short sentences
        else { if (buf) { out.push(buf); buf = ""; } if (s.length <= MAX) buf = s; else wrap(s); }  // flush, then wrap a long one
      }
      if (buf) out.push(buf);
      return out;
    }
    // Free on-device voice so she always talks back, even when the cloud voice is capped —
    // and now says the ENTIRE answer, chunk by chunk, not just the first 300 characters.
    var _ttsPump = null;
    function speakText(t) {
      try {
        if (!t || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return finishTalk();
        orb.classList.add("talk"); duck(true);
        var chunks = _ttsChunks(t);
        if (!chunks.length) return finishTalk();
        var best = _pickVoice();
        try { window.speechSynthesis.cancel(); } catch (e) {}
        try { clearInterval(_ttsPump); } catch (e) {}
        // Chrome silently pauses speech ~14s in; a gentle resume pump keeps a long, multi-chunk answer flowing.
        _ttsPump = setInterval(function () { try { if (window.speechSynthesis.speaking) window.speechSynthesis.resume(); } catch (e) {} }, 8000);
        var idx = 0, done = false;
        function stop() { if (done) return; done = true; try { clearInterval(_ttsPump); } catch (e) {} finishTalk(); }
        function sayNext() {
          if (idx >= chunks.length) return stop();
          var u = new SpeechSynthesisUtterance(chunks[idx++]);
          u.lang = (LANG === "es") ? "es-US" : "en-US";
          u.rate = 1.02; u.pitch = 1.06; // warmer, more alive than the flat default
          if (best) u.voice = best;
          u.onend = function () { sayNext(); };
          u.onerror = function () { sayNext(); }; // one bad chunk must not kill the rest of the answer
          try { window.speechSynthesis.speak(u); window.speechSynthesis.resume(); } catch (e) { sayNext(); }
        }
        sayNext();
      } catch (e) { finishTalk(); }
    }
    function finishTalk() {
      wakeCenter(false); orb.classList.remove("talk"); // return to the corner
      if (PRO && wakeOn) { duck(0); setTimeout(startListen, 350); } // reopening the mic -> music FULLY silent so she hears you
      else duck(false); // one-shot done -> music back
    }

    // ---------- speech recognition (wake-name + command) ----------
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var rec = null, wakeOn = false, mode = "idle"; // idle | wake | command
    // ---- optional "only my voice" pitch gate (Settings > calibrate; opt-in, fail-open) ----
    var ONLYME = get("lux_only_me", "") === "1", PROFILE = null;
    try { PROFILE = JSON.parse(get("lux_voice_profile", "null")); } catch (e) {}
    var pitchNow = -1, pmStream = null, pmCtx = null;
    function acorr(buf, sr) { var N = buf.length, rms = 0, i, j; for (i = 0; i < N; i++) rms += buf[i] * buf[i]; rms = Math.sqrt(rms / N); if (rms < 0.008) return -1; var c = new Float32Array(N); for (i = 0; i < N; i++) { for (j = 0; j < N - i; j++) c[i] += buf[j] * buf[j + i]; } var d = 0; while (d < N - 1 && c[d] > c[d + 1]) d++; var mv = -1, mp = -1; for (i = d; i < N; i++) { if (c[i] > mv) { mv = c[i]; mp = i; } } if (mp <= 0) return -1; var f = sr / mp; return (f > 60 && f < 500) ? f : -1; }
    function startPitchMon() { if (!ONLYME || !PROFILE || pmStream || !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return; try { navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then(function (st) { pmStream = st; var AC = window.AudioContext || window.webkitAudioContext; pmCtx = new AC(); var sn = pmCtx.createMediaStreamSource(st); var an = pmCtx.createAnalyser(); an.fftSize = 2048; sn.connect(an); var buf = new Float32Array(an.fftSize); (function loop() { if (!pmStream) return; try { an.getFloatTimeDomainData(buf); var f = acorr(buf, pmCtx.sampleRate); if (f > 0) pitchNow = f; } catch (e) {} setTimeout(loop, 120); })(); }).catch(function () { ONLYME = false; }); } catch (e) { ONLYME = false; } }
    function stopPitchMon() { try { if (pmStream) { pmStream.getTracks().forEach(function (t) { t.stop(); }); pmStream = null; } if (pmCtx) { pmCtx.close(); pmCtx = null; } } catch (e) {} }
    function pitchOk() { if (!ONLYME || !PROFILE) return true; if (pitchNow <= 0) return true; return pitchNow >= (PROFILE.lo - 25) && pitchNow <= (PROFILE.hi + 25); }
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
      wakeOn = true; duck(0); startPitchMon(); startListen(); // music FULLY silent while the mic is open so she hears you, not the song
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
        if (mode === "wake" && nameHit(txt)) { if (pitchOk()) { mode = "command"; cmdCapture(); } } // only-my-voice gate (fail-open)
      };
      rec.onerror = function () {};
      rec.onend = function () { if (wakeOn && mode === "wake") { setTimeout(startListen, 400); } };
      try { rec.start(); } catch (e) {}
    }
    function cmdCapture() {
      try { if (rec) { rec.onend = null; rec.abort(); } } catch (e) {}
      wakeCenter(true); duck(0); say(NAME, T.listening, true); // heard its name: mute music into the mic, fly to center, glow
      var r = newRec(false); var got = "", done = false;
      r.onresult = function (ev) { got = ""; for (var i = 0; i < ev.results.length; i++) got += ev.results[i][0].transcript; };
      r.onerror = function () {};
      r.onend = function () {
        if (done) return; done = true;
        var cmd = stripName(got);
        if (cmd) ask(cmd); else { wakeCenter(false); say(NAME, T.err, false); if (wakeOn) { duck(0); setTimeout(startListen, 500); } else duck(false); }
      };
      try { r.start(); } catch (e) { wakeCenter(false); duck(0); if (wakeOn) setTimeout(startListen, 500); }
      setTimeout(function () { try { r.stop(); } catch (e) {} }, 6000);
    }
    function stopWake() { wakeOn = false; duck(false); stopPitchMon(); try { if (rec) { rec.onend = null; rec.abort(); } } catch (e) {} orb.classList.remove("live"); } // music back to normal

    // tap the orb: Pro toggles hands-free; everyone gets one-shot listen (or type)
    orb.addEventListener("click", function (e) {
      if (dragMoved) { dragMoved = false; return; }
      show(); autohide(9000); warmTTS(); // arm the on-device voice inside this tap so she can speak after the reply loads
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
      say(NAME, T.listening, true); orb.classList.add("live"); duck(0); // mute music into the mic while capturing your words
      var r = newRec(false), got = "", done = false;
      r.onresult = function (ev) { got = ""; for (var i = 0; i < ev.results.length; i++) got += ev.results[i][0].transcript; };
      r.onerror = function () {};
      r.onend = function () { orb.classList.remove("live"); if (done) return; done = true; if (got.trim()) ask(got.trim()); else { duck(false); say(NAME, T.err, false); } };
      try { r.start(); } catch (e) {}
      setTimeout(function () { try { r.stop(); } catch (e) {} }, 6000);
    }

    // typed fallback
    function sendTyped() { warmTTS(); var v = elIn.value.trim(); if (v) { elIn.value = ""; ask(v); } }
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
    function down(x, y) { warmTTS(); dragging = true; dragMoved = false; sx = x; sy = y; var r = wrap.getBoundingClientRect(); ox = r.left; oy = innerHeight - r.bottom; } // arm the voice at the very start of the touch
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
    document.addEventListener("touchmove", function (e) { if (dragging) { var t = e.touches[0]; move(t.clientX, t.clientY); if (e.cancelable) e.preventDefault(); } }, { passive: false }); // drag the orb only - not the page behind it
    document.addEventListener("touchend", up);

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  } catch (e) { /* never break the page */ }
})();
