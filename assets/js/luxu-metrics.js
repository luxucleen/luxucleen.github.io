/* luxu-metrics.js — Luxucleen lightweight visitor metrics
 *
 * Christian's order: "If luxu has it... make sure the video show u data."
 * This is the whole thing. No ad-tech, no cookies, no fingerprinting, no PII.
 * Measures: page views, Luxu chat opens/messages, top topics, click signals.
 * Event types sent: page_view, chat_open, chat_message, click, session_end. The receiver is
 * POST /api/metric in the luxucleen-ask Worker, which stores them as view / chat_open /
 * chat_msg / click for GET /api/summary (the Worker maps the names; keep both sides in step).
 * chat_open / chat_message are raised by the chat surfaces (luxu-chat.js, lux-orb.js) as the
 * DOM events luxu:open / luxu:message on document. Honors Do-Not-Track.
 * Never throws: if the beacon fails, the page keeps working.
 */
(function () {
  "use strict";
  if (navigator.doNotTrack === "1" || navigator.msDoNotTrack === "1") return;

  // Only the live site reports, and only a person's browser. A local checkout, a file:// preview,
  // a mirror, or any automated (headless / WebDriver) load of these pages used to post phantom
  // views and sessions into the real counts - measured 2026-10-26: 45 sessions in two days and
  // not one with a second event. The Worker enforces the same two rules on the Origin and
  // User-Agent headers and counts what it refuses; stopping it here saves the request entirely.
  var SITE_HOSTS = { "luxucleen.com": 1, "www.luxucleen.com": 1 };
  if (!SITE_HOSTS[String(location.hostname || "").toLowerCase()]) return;
  if (navigator.webdriver) return;

  // LANDED 2026-10-24 on Christian's Cloudflare login. This used to point at a
  // trycloudflare.com quick tunnel, and that hostname STOPPED RESOLVING - measured
  // http_code 000, DNS getaddrinfo failed - so every count for 29 days went nowhere.
  // Quick tunnels rot; this Worker does not. The receiver now lives in the permanent
  // luxucleen-ask Worker (KV namespace METRICS), which is CORS-allowed for this origin.
  // sendBeacon posts this as text/plain, so there is no preflight on the hot path.
  // NOTE: "/api/metric" same-origin is NOT usable yet - luxucleen.com is served by
  // GitHub Pages and its DNS records are grey-cloud, so the Worker's luxucleen.com/api/*
  // route never fires. Switch to "/api/metric" only once the apex is proxied.
  var ENDPOINT = "https://ai.luxucleen.com/api/metric";
  var session = Math.random().toString(36).slice(2, 12); // memory only, dies on unload
  var startTs = Date.now();

  // Client-side topic guesser — only sends matched keyword buckets, never message text.
  var TOPICS = {
    trading: ["signal", "trade", "forex", "xauusd", "gold", "mt4", "mt5", "grid", "ea", "mql", "lab"],
    realestate: ["house", "cash offer", "seller", "property", "deed", "mortgage", "rent", "listing"],
    money: ["grant", "benefit", "refund", "tax", "debt", "claim", "probate", "will", "estate"],
    luxu: ["luxu", "chat", "avatar", "voice", "habla", "help", "how"]
  };

  function guessTopics(text) {
    var found = [];
    try {
      var t = String(text || "").toLowerCase();
      for (var k in TOPICS) {
        for (var i = 0; i < TOPICS[k].length; i++) {
          if (t.indexOf(TOPICS[k][i]) !== -1) { found.push(k); break; }
        }
      }
    } catch (e) { /* keep going */ }
    return found;
  }

  function send(type, data) {
    try {
      var payload = {
        type: type,
        page: location.pathname,          // path only — no query strings, no PII
        session: session,
        ts: new Date().toISOString()
      };
      for (var k in data) payload[k] = data[k];
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, JSON.stringify(payload));
      } else if (window.fetch) {
        fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(function () {});
      }
    } catch (e) { /* metrics never break the page */ }
  }

  // 1. Page view — fires once per load.
  send("page_view", {
    ref: (document.referrer || "").split("/")[2] || "direct", // host only
    screen: window.innerWidth < 640 ? "mobile" : (window.innerWidth < 1024 ? "tablet" : "desktop")
  });

  // 2. Luxu chat events — open + message counts + topic buckets.
  var msgCount = 0;
  document.addEventListener("luxu:open", function () { send("chat_open", {}); });
  document.addEventListener("luxu:message", function (ev) {
    msgCount++;
    var topics = guessTopics(ev && ev.detail && ev.detail.text);
    send("chat_message", { n: msgCount, topics: topics });
  });

  // 3. Click signals — any element with data-metric="name" (affiliate CTAs,
  //    membership buttons, trading join door). Bridge28 adds the attributes.
  //    MEASURED 2026-10-26: not one page on the site carries data-metric, so this path alone
  //    had never counted a click. Without any markup, the clicks that matter to the business
  //    are still recognisable: a call/email/text intent, or a link that leaves the site.
  //    Same-site navigation is not a click signal. Only the signal name is sent, never the URL.
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var el = t.closest("[data-metric]");
    var signal = el ? el.getAttribute("data-metric") : "";
    if (!signal) {
      var a = t.closest("a[href]");
      var href = a ? (a.getAttribute("href") || "") : "";
      if (/^(tel|mailto|sms):/i.test(href)) signal = href.split(":")[0].toLowerCase();
      else if (a && /^https?:/i.test(a.href) && a.host && a.host !== location.host) signal = "out:" + a.host.replace(/^www\./, "");
    }
    if (signal) send("click", { signal: String(signal).slice(0, 64) });
  }, true);

  // 4. Time on page — sent on unload, bucketed.
  window.addEventListener("pagehide", function () {
    var s = Math.round((Date.now() - startTs) / 1000);
    var bucket = s < 10 ? "bounce" : (s < 60 ? "short" : (s < 300 ? "engaged" : "deep"));
    send("session_end", { seconds_bucket: bucket });
  });
})();
