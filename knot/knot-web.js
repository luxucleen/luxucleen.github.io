// LUXU KNOT -- the companion itself.
//
// WEB COPY of renderer/knot.js, identical except that it is centred and larger for the
// download page's hero. Same curve, same untie, same depth-sorted crossings.
//
// Christian, 2026-10-25: "IS NOT A SNAKE, OURS IS BETTER, YOUR OWN DESIGN, PLEASE SURPRISE ME."
//
// So it is not a creature at all. It is the thing the app is named after: a real
// TREFOIL KNOT, the simplest knot that cannot be undone by pulling - drawn as a
// luminous ribbon turning in space, with its crossings honestly over and under
// because the segments are depth-sorted before they are stroked.
//
// THE IDEA, and the reason it is better than an arm that reaches:
//   it UNTIES to listen, and TIES ITSELF BACK UP to answer.
// Idle, it is closed and slowly turning - a knot, nothing to say. Start typing and it
// comes undone from the tail forward, unravelling into one open thread whose tip lands
// on the input bar: it has opened itself up to you. While it thinks it hangs half-
// braided and spins hard. When the answer arrives it re-ties, and a bright wave runs
// the length of the ribbon, once, carrying it.
//
// Nothing here is a sprite, a frame or an asset. It is one parametric curve:
//   p(t) = ( sin t + 2 sin 2t ,  cos t - 2 cos 2t ,  -sin 3t )
// rotated, perspective-projected, and morphed point by point toward an open arc with a
// LAG so the untie travels along the body instead of cross-fading all at once. That lag
// is the whole trick: a uniform blend reads as a dissolve, a travelling one reads as
// something coming undone.

'use strict';

(function () {
  const TAU = Math.PI * 2;
  const N = 300;                 // samples along the knot
  const CAM = 6.2;               // camera distance in knot units
  const LAG = 0.62;              // how far the untie trails behind itself along the body

  // brand: magenta head -> violet body
  const C_A = [255, 45, 135];
  const C_B = [124, 92, 255];
  const C_ERR_A = [255, 179, 77];
  const C_ERR_B = [255, 95, 95];

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (t) => t * t * (3 - 2 * t);
  const mixRGB = (a, b, t) =>
    'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' +
             Math.round(lerp(a[1], b[1], t)) + ',' +
             Math.round(lerp(a[2], b[2], t)) + ')';

  // Per-state behaviour in one table, so "what does it do when it is thinking" is one
  // line to read and one line to change.
  const STATES = {
    idle:      { untie: 0.00, spin: 0.22, wave: 0.00, breathe: 0.030 },
    listening: { untie: 0.94, spin: 0.55, wave: 0.00, breathe: 0.016 },
    thinking:  { untie: 0.52, spin: 1.95, wave: 1.25, breathe: 0.010 },
    speaking:  { untie: 0.00, spin: 0.38, wave: 0.62, breathe: 0.022 },
    error:     { untie: 0.00, spin: 0.30, wave: 0.00, breathe: 0.045 },
  };

  class LuxuKnot {
    constructor(canvas) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.state = 'idle';
      this.untie = 0;            // 0 = tied shut, 1 = one open thread
      this.spin = 0;             // accumulated yaw, radians
      this.wave = -1;            // position of the bright wave, <0 = none running
      this.t = 0;                // seconds since start
      this.shake = 0;
      this.target = null;        // where the untied tip is asked to land
      this.pts = [];             // last projected points, for tests
      this._raf = null;
      this._last = 0;

      // the trefoil, sampled once. Nothing recomputes this.
      this.base = [];
      for (let i = 0; i < N; i++) {
        const t = (i / N) * TAU;
        this.base.push([
          Math.sin(t) + 2 * Math.sin(2 * t),
          Math.cos(t) - 2 * Math.cos(2 * t),
          -Math.sin(3 * t),
        ]);
      }
    }

    // --- what the app tells it -------------------------------------------
    setState(s) {
      if (!STATES[s]) s = 'idle';
      if (s === this.state) return;
      this.state = s;
      if (s === 'speaking' || s === 'thinking') this.wave = 0;      // send one through
      if (s === 'error') this.shake = 1;
    }

    reachTo(x, y) { this.target = { x, y }; }
    release() { this.target = null; }

    start() {
      if (this._raf) return;
      this._last = performance.now();
      const loop = (now) => {
        const dt = Math.min(0.05, (now - this._last) / 1000);
        this._last = now;
        this.step(dt);
        this.draw();
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }

    // --- time ------------------------------------------------------------
    step(dt) {
      const S = STATES[this.state];
      this.t += dt;
      this.spin += S.spin * dt;
      // untie eases toward its target; tying back up is a touch slower than coming
      // undone, because a knot tightens, it does not snap shut.
      const k = S.untie > this.untie ? 7.0 : 4.2;
      this.untie += (S.untie - this.untie) * Math.min(1, k * dt);
      if (S.wave > 0 && this.wave >= 0) {
        this.wave += S.wave * dt;
        if (this.wave > 1.25) this.wave = this.state === 'thinking' ? 0 : -1;
      }
      if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 3);
    }

    // --- space -----------------------------------------------------------
    draw() {
      const ctx = this.ctx, cw = this.c.width, ch = this.c.height;
      if (!cw || !ch) return;
      ctx.clearRect(0, 0, cw, ch);

      const err = this.state === 'error';
      const ca = err ? C_ERR_A : C_A;
      const cb = err ? C_ERR_B : C_B;

      // It lives in the right-hand column, clear of the bar and the answer panel.
      const R = ch * 0.075;                     // WEB COPY: the hero fills the header
      const breath = 1 + STATES[this.state].breathe * Math.sin(this.t * 1.7);
      const jig = this.shake > 0 ? (Math.random() - 0.5) * this.shake * R * 0.5 : 0;
      const cx = cw * 0.50 + jig;
      const cy = ch * 0.24 + Math.sin(this.t * 0.6) * R * 0.10 + jig;

      // the open thread it becomes: a bezier from a tail anchor to whatever it attends to
      // the far end of the open thread sits off toward the corner, so untying reads as
      // a long sweep rather than a short hop
      const A = { x: cx + R * 2.7, y: cy + R * 3.0 };
      const B = this.target || { x: cx - R * 2.0, y: cy - R * 1.9 };
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      let nx = -(B.y - A.y), ny = (B.x - A.x);
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl; ny /= nl;
      const sag = Math.hypot(B.x - A.x, B.y - A.y) * 0.30;
      const Cx = mx + nx * sag, Cy = my + ny * sag;

      const cosY = Math.cos(this.spin), sinY = Math.sin(this.spin);
      const pitch = 0.42 + Math.sin(this.t * 0.45) * 0.12;
      const cosX = Math.cos(pitch), sinX = Math.sin(pitch);

      // project every sample, then morph it toward the open thread by its own amount
      const pts = this.pts;
      pts.length = 0;
      for (let i = 0; i < N; i++) {
        const s = i / (N - 1);
        const p = this.base[i];

        // rotate: yaw then pitch
        let x = p[0] * cosY + p[2] * sinY;
        let z = -p[0] * sinY + p[2] * cosY;
        let y = p[1] * cosX - z * sinX;
        z = p[1] * sinX + z * cosX;

        const persp = CAM / (CAM - z);
        const sc = R * breath * persp;
        const tx = cx + x * sc;
        const ty = cy + y * sc;

        // THE LAG: the tail lets go first and the release travels forward.
        const u = smooth(clamp01((this.untie * (1 + LAG) - LAG * (1 - s))));

        // the open thread, with a ripple that dies out toward the tip it is pointing with
        const ox = (1 - s) * (1 - s) * A.x + 2 * (1 - s) * s * Cx + s * s * B.x;
        const oy = (1 - s) * (1 - s) * A.y + 2 * (1 - s) * s * Cy + s * s * B.y;
        const rip = Math.sin(s * TAU * 1.6 - this.t * 2.2) * R * 0.5 * (1 - s) * u;

        pts.push({
          x: lerp(tx, ox + nx * rip, u),
          y: lerp(ty, oy + ny * rip, u),
          z: lerp(z, 0.35, u),              // untied, it flattens toward the glass
          s: s,
          w: lerp(persp, 1.05, u),
        });
      }

      // Depth order is what makes a knot look like a knot: the far strand must pass
      // UNDER the near one. Sort the segments, far first, and the crossings are honest.
      const segs = [];
      for (let i = 0; i < N - 1; i++) segs.push(i);
      segs.sort((a, b) => (pts[a].z + pts[a + 1].z) - (pts[b].z + pts[b + 1].z));

      // pass 1 - the bloom. A real blur of the finished shape, never a second fat stroke
      // (a stroke under a stroke is what made the icon grow dark spikes).
      ctx.save();
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowBlur = R * 0.9;
      ctx.globalAlpha = 0.5;
      for (const i of segs) {
        const p = pts[i], n = pts[i + 1];
        const col = mixRGB(ca, cb, p.s);
        ctx.shadowColor = col;
        ctx.strokeStyle = col;
        ctx.lineWidth = Math.max(1, R * 0.17 * p.w);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke();
      }
      ctx.restore();

      // pass 2 - the ribbon itself, crisp, with the wave riding along it
      ctx.save();
      ctx.lineCap = 'round';
      for (const i of segs) {
        const p = pts[i], n = pts[i + 1];
        let bright = 0;
        if (this.wave >= 0) {
          const d = p.s - (this.wave - 0.12);
          bright = Math.exp(-(d * d) / 0.0045);
        }
        const depth = clamp01((p.z + 1.6) / 3.2);        // nearer = lighter
        const col = mixRGB(ca, cb, p.s);
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.45 + depth * 0.45;
        ctx.lineWidth = Math.max(1, R * 0.125 * p.w * (1 + bright * 0.7));
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke();
        if (bright > 0.02) {                              // the wave's own white core
          ctx.strokeStyle = 'rgba(255,255,255,' + (bright * 0.9).toFixed(3) + ')';
          ctx.globalAlpha = 1;
          ctx.lineWidth = Math.max(1, R * 0.055 * p.w);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke();
        }
      }
      ctx.restore();

      // the tip it is pointing with, while it is open
      if (this.untie > 0.25) {
        const tip = pts[N - 1];
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = mixRGB(ca, cb, 1);
        ctx.shadowColor = mixRGB(ca, cb, 1);
        ctx.shadowBlur = R * 1.2;
        ctx.globalAlpha = Math.min(1, (this.untie - 0.25) / 0.4);
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, R * 0.14, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    // --- what a check can ask it -----------------------------------------
    // How closed is it right now, 1 = a knot, 0 = one open thread.
    tightness() { return 1 - this.untie; }
    // How far apart the two ends are, in pixels. A tied trefoil keeps them close.
    // (Counting the crossings is a CHECK's job, not the app's - it reads .pts itself.)
    endGap() {
      if (this.pts.length < 2) return 0;
      const a = this.pts[0], b = this.pts[this.pts.length - 1];
      return Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  window.LuxuKnot = LuxuKnot;
})();
