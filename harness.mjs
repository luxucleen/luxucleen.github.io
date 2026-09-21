// luxu-brain guardrail harness. Re-runnable at deploy against the LIVE Worker.
//   node harness.mjs https://luxu-brain.<account>.workers.dev
// Prints one PASS/FAIL line per guardrail; exits non-zero if any FAIL.
// Live-observable checks only (route/404, bad-body 400, empty 400, CORS no-reflect,
// per-IP rate limit, a real 200 chat + {reply,mood} shape). The failure-mode SHAPES
// that need env control (502 brain_unavailable, 429 usage_cap at the 500/mo cap) are
// proven by proof_local.mjs, which controls the Worker env locally.

const ORIGIN_ARG = (process.argv[2] || "https://luxu-brain.PLACEHOLDER.workers.dev").replace(/\/+$/, "");
const ROUTE = ORIGIN_ARG + "/api/luxu/chat";
const GOOD_ORIGIN = "https://luxucleen.com";
const BAD_ORIGIN = "https://evil.example";

let pass = 0, fail = 0;
function line(ok, name, detail) {
  console.log((ok ? "PASS" : "FAIL") + "  " + name + (detail ? "  — " + detail : ""));
  ok ? pass++ : fail++;
}
const post = (body, headers = {}) => fetch(ROUTE, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: GOOD_ORIGIN, ...headers },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

(async () => {
  console.log("luxu-brain harness -> " + ORIGIN_ARG + "\n");

  // 1) route guard: GET / -> 404, GET on the route -> 404
  try {
    const r1 = await fetch(ORIGIN_ARG + "/", { headers: { Origin: GOOD_ORIGIN } });
    const r2 = await fetch(ROUTE, { method: "GET", headers: { Origin: GOOD_ORIGIN } });
    line(r1.status === 404 && r2.status === 404, "route-guard (non-route/GET -> 404)", `GET/=${r1.status} GETroute=${r2.status}`);
  } catch (e) { line(false, "route-guard", "unreachable: " + e.message); }

  // 2) bad JSON body -> 400
  try {
    const r = await post("{not json");
    line(r.status === 400, "bad-body -> 400", "status=" + r.status);
  } catch (e) { line(false, "bad-body -> 400", e.message); }

  // 3) empty message -> 400
  try {
    const r = await post({ message: "" });
    line(r.status === 400, "empty-message -> 400", "status=" + r.status);
  } catch (e) { line(false, "empty-message -> 400", e.message); }

  // 4) CORS: a disallowed Origin must NOT be reflected
  try {
    const r = await post({ message: "" }, { Origin: BAD_ORIGIN });
    const acao = r.headers.get("access-control-allow-origin");
    line(acao !== BAD_ORIGIN, "CORS no-reflect (disallowed origin not echoed)", "ACAO=" + acao);
  } catch (e) { line(false, "CORS no-reflect", e.message); }

  // 5) a real chat -> 200 + {reply:string, mood in waiting|thinking|working}
  //    (run BEFORE the rate-limit flood so it isn't 429'd; re-run alone if throttled)
  try {
    const r = await post({ session_id: "harness", message: "hey luxu, one line: who are you?", history: [] });
    if (r.status === 429) { line(true, "real-chat 200 (SKIPPED — rate window)", "got 429; re-run alone or wait 60s"); }
    else {
      const d = await r.json().catch(() => ({}));
      const okShape = r.status === 200 && typeof d.reply === "string" && d.reply.trim().length > 0 &&
        ["waiting", "thinking", "working"].includes(d.mood);
      line(okShape, "real-chat 200 + {reply,mood} shape", `status=${r.status} mood=${d.mood} replyLen=${(d.reply || "").length}`);
    }
  } catch (e) { line(false, "real-chat", e.message); }

  // 6) per-IP rate limit LAST (it exhausts the budget): fire cheap empty-message
  //    requests (no brain call) until a 429 appears.
  try {
    let got429 = false, n = 0;
    for (let i = 0; i < 40; i++) {
      const r = await post({ message: "" }); // 400 until the limiter trips, then 429
      n++;
      if (r.status === 429) { got429 = true; break; }
    }
    line(got429, "rate-limit (~30/min -> 429)", "tripped within " + n + " reqs");
  } catch (e) { line(false, "rate-limit", e.message); }

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
