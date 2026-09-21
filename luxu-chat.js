/* ==========================================================================
   LUXU CHAT — /luxu/chat — behavior
   --------------------------------------------------------------------------
   bridge28: set the real backend endpoint below. The page already talks to
   the same backend style as the Bridge28 widget (fetch POST, JSON).
   Expected contract:
     POST { message: string, history: [{role:'user'|'luxu', text:string}] }
     -> { reply: string }
   If the endpoint is unreachable, the page falls back to built-in demo
   replies so the chat NEVER looks broken.
   Demo override for previews: set window.LUXU_DEMO = true before this file
   loads, and/or window.LUXU_AVATAR_WAITING_IMG to swap the living picture.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- config (bridge28: edit here) ---------------------- */
  var BACKEND_URL = window.LUXU_BACKEND || '/api/luxu/chat'; // <-- real endpoint
  var AVATAR_STILL_IMG = (window.LUXU_POSES && window.LUXU_POSES.idle) ||
    '/assets/luxu-avatar/luxu-pose-idle.webp'; // calm still picture (header + mini)
  var DEMO_MODE = window.LUXU_DEMO === true;
  var STORE_KEY = 'luxu-chat-history-v1';
  var MAX_STORE = 100;

  /* ---------------- dom ------------------------------------------------ */
  var messagesEl = document.getElementById('lcMessages');
  var form = document.getElementById('lcForm');
  var input = document.getElementById('lcInput');
  var sendBtn = document.getElementById('lcSend');
  var newBtn = document.getElementById('lcNew');
  var chipsEl = document.getElementById('lcChips');
  if (!messagesEl || !form) return;

  /* ---------------- history -------------------------------------------- */
  var history = [];
  try { history = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { history = []; }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-MAX_STORE))); } catch (e) {}
  }

  function scrollDown() {
    requestAnimationFrame(function () {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function bubble(text, who) {
    var row = document.createElement('div');
    row.className = 'lc-row ' + who;
    if (who === 'ai') {
      var img = document.createElement('img');
      img.className = 'lc-mini';
      img.alt = '';
      // bridge28: the mini uses the calm idle pose (never the video file)
      img.src = AVATAR_STILL_IMG;
      img.onerror = function () { img.remove(); };
      if (img.src) row.appendChild(img);
    }
    var b = document.createElement('div');
    b.className = 'lc-bubble';
    b.textContent = text;
    row.appendChild(b);
    messagesEl.appendChild(row);
    scrollDown();
    return row;
  }

  function showTyping() {
    var row = document.createElement('div');
    row.className = 'lc-row ai';
    row.id = 'lcTypingRow';
    var b = document.createElement('div');
    b.className = 'lc-bubble lc-typing';
    b.innerHTML = '<span></span><span></span><span></span>';
    row.appendChild(b);
    messagesEl.appendChild(row);
    scrollDown();
  }
  function hideTyping() {
    var t = document.getElementById('lcTypingRow');
    if (t) t.remove();
  }

  function welcome() {
    var w = document.createElement('div');
    w.className = 'lc-welcome';
    w.innerHTML =
      '<img class="av-waiting" src="' + AVATAR_WAITING_IMG + '" alt="Luxu standing by">' +
      '<div class="lc-namepill">Luxu</div>' +
      '<div class="lc-live" id="lcHeroStatus"></div>' +
      '<h2>Yo — I\'m Luxu.</h2>' +
      '<p>Your Luxucleen assistant. Ask me about selling your house, trading tools, ' +
      'taxes, or making money — or just talk. I\'m here all day, every day.</p>';
    messagesEl.appendChild(w);
    bubble('What are we handling first?', 'ai');
  }

  /* ---------------- demo replies (fallback only) ------------------------ */
  var DEMO_REPLIES = [
    'Say less — I got you. Tell me a little more so I point you the right way.',
    'Easy. Here is the move: start with what you want most — cash for your house, trading income, or tax help — and I will lay out the exact steps.',
    'On it. While I pull that together — anything else you want handled today?',
    'Done deal. That is exactly the kind of thing Luxucleen exists for.',
    'Good question. Short answer: yes, we can help with that. Long answer: tap one of the chips above and I will walk you through it.'
  ];
  var DEMO_WORK_REPLIES = [
    'That was a big one — I went full work mode on it. Here is the breakdown: tell me which part you want first and I will go deeper.',
    'Whew. Okay, I dug into that properly. Give me a direction — house, trading, taxes, money — and I will lay out the exact play.'
  ];
  var demoIdx = 0;
  function demoReply(longTask) {
    if (longTask) {
      var r = DEMO_WORK_REPLIES[demoIdx % DEMO_WORK_REPLIES.length];
      demoIdx++;
      return r;
    }
    var q = DEMO_REPLIES[demoIdx % DEMO_REPLIES.length];
    demoIdx++;
    return q;
  }

  /* ---------------- send flow ------------------------------------------- */
  var busy = false;
  function setBusy(b) {
    busy = b;
    sendBtn.disabled = b;
    input.disabled = b;
  }

  function askBackend(message) {
    return fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        history: history.slice(-20).map(function (h) { return { role: h.who, text: h.text }; })
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('bad status ' + res.status);
      return res.json();
    }).then(function (data) {
      if (!data || typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('empty reply');
      return data.reply.trim();
    });
  }

  function send(text) {
    var msg = (text || '').trim();
    if (!msg || busy) return;
    setBusy(true);
    hideWelcomeChips();
    bubble(msg, 'user');
    history.push({ who: 'user', text: msg });
    save();
    input.value = '';
    // Christian's exact behavior: waiting while you type -> thinking on enter ->
    // calm typing, or HARD strong typing when it is a long task.
    setAvatarState('thinking');
    showTyping();
    var longTask = msg.length > 80;
    var typeTimer = setTimeout(function () {
      setAvatarState(longTask ? 'typing-hard' : 'typing-calm');
    }, 1200);
    var slowTimer = setTimeout(function () { setAvatarState('typing-hard'); }, 6000);
    var delay = 900 + Math.random() * 900;
    if (longTask) delay += 2600; // let the hard-work video breathe
    setTimeout(function () {
      var done = function (reply) {
        clearTimeout(typeTimer);
        clearTimeout(slowTimer);
        hideTyping();
        bubble(reply, 'ai');
        history.push({ who: 'luxu', text: reply });
        save();
        setAvatarState('waiting');
        setBusy(false);
        input.focus({ preventScroll: true });
      };
      if (DEMO_MODE) { done(demoReply(longTask)); return; }
      askBackend(msg).then(done, function () { done(demoReply(longTask)); });
    }, delay);
  }

  function hideWelcomeChips() {
    // keep chips always visible — they are the forever-chat invitations
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    send(input.value);
  });
  input.addEventListener('input', function () {
    sendBtn.disabled = busy || !input.value.trim();
    if (!busy) setAvatarState('waiting'); // while you type, he waits/vibes
  });
  chipsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-q]');
    if (b) send(b.getAttribute('data-q'));
  });
  document.getElementById('lcPlus').addEventListener('click', function () {
    bubble('Attachments are coming soon — for now, just tell me what you need in words.', 'ai');
  });
  newBtn.addEventListener('click', function () {
    if (!history.length) return;
    if (confirm('Start a fresh chat? Your history on this device will be cleared.')) {
      history = [];
      save();
      messagesEl.innerHTML = '';
      welcome();
      input.focus();
    }
  });

  /* ---------------- avatar: living states -----------------------------------
     Christian's exact direction — a LOOP, not a video:
       waiting     = user is typing / idle -> LIVING PICTURE (animated webp in an
                     <img> tag — looks still, moves in a seamless loop, alive
                     for real, like Luxor's own avatar). Just Luxu standing there.
       thinking    = just pressed enter, reading  -> thinking pose
       typing-calm = normal task                  -> calm typing video
       typing-hard = LONG task only               -> working-hard video
     The waiting hero is NEVER a <video> element. The task states use a hidden
     video layer that only appears for typing-calm / typing-hard.
     Public API: window.LuxuAvatar.setState('waiting'|'thinking'|
       'typing-calm'|'typing-hard'). Aliases: idle->waiting, working->typing-hard.
     Preview overrides: window.LUXU_AVATAR_WAITING_IMG = 'data:...',
       window.LUXU_AVATAR_VIDEOS = {...},
       window.LUXU_POSE_BASE = '', window.LUXU_POSES = {idle: 'data:...'} */
  var AVATAR_WAITING_IMG = window.LUXU_AVATAR_WAITING_IMG ||
    '/assets/luxu-avatar/luxu-standing-waiting.webp';
  var AVATAR_VIDEOS = window.LUXU_AVATAR_VIDEOS || {
    'typing-calm': '/assets/luxu-avatar/luxu-calm-typing-web.mp4',
    'typing-hard': '/assets/luxu-avatar/luxu-working-hard-web.mp4'
  };
  var STATE_ALIAS = { idle: 'waiting', working: 'typing-hard' };
  var POSE_BASE = (window.LUXU_POSE_BASE !== undefined) ? window.LUXU_POSE_BASE : '/assets/luxu-avatar/';
  var POSE_OVERRIDE = window.LUXU_POSES || {};
  var AVATAR_STATUS = {
    waiting: '',                       // Luxor amendment 2026-09-21: BLANK when idle
    thinking: 'thinking\u2026',
    'typing-calm': 'typing\u2026',
    'typing-hard': 'working hard\u2026'
  };
  var avatarState = 'waiting';
  // the hero status line is injected with the welcome hero; the header keeps
  // its own static #lcStatus — keep both in sync.
  function setStatusText(t) {
    var h = document.getElementById('lcStatus');
    if (h) h.textContent = t;
    var hero = document.getElementById('lcHeroStatus');
    if (hero) hero.textContent = t;
  }

  function avatarBoxes() {
    // living slots only — [data-still] slots (the header) stay a calm picture
    return document.querySelectorAll('[data-avatar]:not([data-still])');
  }

  function applyAvatarState() {
    // waiting = living picture only. thinking = pose. typing-* = task video.
    var isThinking = (avatarState === 'thinking');
    var isTask = !isThinking && !!AVATAR_VIDEOS[avatarState];
    var boxes = avatarBoxes();
    for (var i = 0; i < boxes.length; i++) {
      (function (box) {
        box.classList.toggle('state-thinking', isThinking);
        box.classList.toggle('task-live', isTask);
        var v = box.querySelector('video.av-task');
        if (v) {
          if (isTask) {
            var want = AVATAR_VIDEOS[avatarState];
            if (want && v.getAttribute('src') !== want) {
              v.setAttribute('src', want);
              try { v.load(); } catch (e) {}
            }
            try { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {}
          } else {
            try { v.pause(); } catch (e) {}
            v.removeAttribute('src');
          }
        }
        // living picture visible only while waiting AND decoded
        var wimg = box.querySelector('img.av-waiting');
        box.classList.toggle('img-live',
          avatarState === 'waiting' && !!wimg && box.dataset.imgReady === '1');
      })(boxes[i]);
    }
  }

  function setAvatarState(s) {
    s = STATE_ALIAS[s] || s;
    if (s !== 'thinking' && s !== 'waiting' && !AVATAR_VIDEOS[s]) s = 'waiting';
    if (s === avatarState) { applyAvatarState(); return; }
    avatarState = s;
    setStatusText(AVATAR_STATUS[s] || AVATAR_STATUS.waiting);
    applyAvatarState();
  }
  window.LuxuAvatar = {
    setState: setAvatarState,
    getState: function () { return avatarState; }
  };

  (function initAvatars() {
    var POSES = ['idle', 'thinking', 'working'];
    function finish(box) {
      if (!box || box.dataset.finished) return;
      box.dataset.finished = '1';
      // Christian's call: the header orb is JUST the picture — calm, still.
      // All the living states play on the big hero avatar.
      if (box.hasAttribute('data-still')) {
        var still = document.createElement('img');
        still.className = 'av-still';
        still.src = POSE_OVERRIDE.idle || (POSE_BASE + 'luxu-pose-idle.webp');
        still.alt = 'Luxu';
        still.draggable = false;
        still.onerror = function () { still.remove(); }; // base orb CSS carries it
        box.appendChild(still);
        return;
      }
      // living-picture layer (the loop — an <img>, never a <video>)
      var waitingImg = box.querySelector('img.av-waiting');
      if (!waitingImg) {
        waitingImg = document.createElement('img');
        waitingImg.className = 'av-waiting';
        waitingImg.alt = 'Luxu standing by';
        waitingImg.draggable = false;
        box.insertBefore(waitingImg, box.firstChild);
      }
      if (!waitingImg.getAttribute('src')) waitingImg.src = AVATAR_WAITING_IMG;
      var markReady = function () { box.dataset.imgReady = '1'; applyAvatarState(); };
      waitingImg.addEventListener('load', markReady);
      waitingImg.addEventListener('error', function () { waitingImg.remove(); applyAvatarState(); });
      if (waitingImg.complete && waitingImg.naturalWidth > 0) markReady();
      // layer 1 (under the picture): pure-CSS pulsing orb — always moving
      var orb = document.createElement('div');
      orb.className = 'av-orb';
      orb.setAttribute('aria-hidden', 'true');
      box.insertBefore(orb, box.firstChild);
      // layer 2: pose crossfade while the picture loads
      var fb = document.createElement('div');
      fb.className = 'av-fallback';
      fb.setAttribute('aria-hidden', 'true');
      POSES.forEach(function (pn) {
        var im = document.createElement('img');
        im.className = 'av-pose' + (pn === 'thinking' ? ' think-pose' : '');
        im.alt = '';
        im.draggable = false;
        im.src = POSE_OVERRIDE[pn] || (POSE_BASE + 'luxu-pose-' + pn + '.webp');
        im.onerror = function () { im.remove(); };
        fb.appendChild(im);
      });
      box.insertBefore(fb, waitingImg);
      // layer 3: task video — hidden unless typing-calm / typing-hard
      var video = document.createElement('video');
      video.className = 'av-task';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('aria-hidden', 'true');
      box.appendChild(video);
      applyAvatarState();
    }
    document.querySelectorAll('[data-avatar]').forEach(finish);
    // the welcome hero living picture is injected at boot — catch it when it lands
    if (window.MutationObserver) {
      new MutationObserver(function () {
        var w = messagesEl.querySelector('.lc-welcome img.av-waiting');
        if (w && !w.dataset.wrapped) {
          w.dataset.wrapped = '1';
          var wrap = document.createElement('div');
          wrap.className = 'lc-avatar';
          wrap.setAttribute('data-avatar', '');
          w.parentNode.insertBefore(wrap, w);
          wrap.appendChild(w);
          finish(wrap);
        }
      }).observe(messagesEl, { childList: true, subtree: true });
    }
  })();

  /* ---------------- boot ------------------------------------------------- */
  if (history.length) {
    history.forEach(function (h) { bubble(h.text, h.who === 'user' ? 'user' : 'ai'); });
    bubble('Welcome back — pick up right where you left off.', 'ai');
  } else {
    welcome();
  }
  setStatusText(AVATAR_STATUS[avatarState] || '');  // Luxor amendment: idle status starts BLANK
  sendBtn.disabled = true;
})();
