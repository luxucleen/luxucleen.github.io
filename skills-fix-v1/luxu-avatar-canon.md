# LUXU AVATAR SKILLS — bridge28's permanent playbook
> **LUXOR-IMPROVED — 2026-09-21.** Light upgrade: banner added; blank-when-idle status-line rule written into the SKILL 2 state machine (was only in chat memory); consolidated "Christian's setup" and "Lessons baked in" from real 2026-09-21 use. All original skills untouched — this file was already the complete playbook. Covers list #134 as one unit.
*From Luxor, 2026-09-21. Christian's order: "Give all them skills to bridge28 —
he will make them his so he knows exactly how to do it in the future."
Save this as your own skill. Every future Luxu avatar task runs through it.*

---

## Christian's setup

- Luxu is the hero avatar of luxucleen.com — Christian's destination page, built for maximum free/organic traffic with zero ad spend. Every avatar decision serves that funnel: fast, calm, seamless, unmistakable.
- Christian's pick (2026-09-21): concept-art option 3 — dark-navy spherical robot body, sharp angular glowing cyan eyes, confident cyan smirk-glow, dark visor goggles pushed up on the head, claw-tipped robotic arms, and the transparent holographic cyan keyboard that must be IDENTICAL in every asset.
- Canonical source of this playbook: `~/workspace/luxu-orb/luxu-skills-for-bridge28.md` — this file mirrors it as bridge28's permanent skill, per Christian's order.
- This canon covers the luxucleen.com avatar ONLY. Luxor's own Muse-app avatar is a separate skill (`luxor-avatar.md`, list #92) — the two never share assets or rules.
- Demos of avatar work ship as hosted page links opened in Safari, never `.html` attachments — the iOS file viewer does not run JavaScript, so JS-driven demos render blank.

## SKILL 1 — The Living Picture (seamless loop technique)

**The rule (Christian's standing law):** the waiting avatar is a seamless LOOP,
never a video. An animated WebP inside an `<img>` tag. It should look still at
first glance but actually be moving — alive for real, like a living picture.
There is NO `<video>` element in the waiting hero. Ever.

**How to build a true seamless loop from a video source:**
1. Source clip: square (720×720), 24fps. Any idle/calm motion works.
2. Sample frames at 12fps (every 2nd frame). For an 8s source → 96 frames.
3. **Seamless crossfade (the keyframe-loop technique):** blend the last 12 frames
   progressively into frame 0, so the final frame EQUALS frame 0:
   `frame[i] = blend(frame[i], frame[0], alpha)` with alpha going 0→1.
   When the animation wraps from last frame back to first, there is no jump.
4. **Explicit per-frame durations — THIS IS THE BUG THAT KILLED V1.**
   Every frame MUST carry an explicit duration (83ms). If durations are 0/unset,
   the animation stutters/mixes and Christian rejects it instantly ("Got to fix
   the frames... is all mix"). Both Pillow (`duration=[83]*n`) and ffmpeg
   libwebp (`-framerate 12`) write correct durations — use either. Verify by
   parsing the WebP container's raw ANMF chunks: **the duration field is bytes
   12–14 of the ANMF payload** (after X,Y,W,H = 4×3 bytes), 24-bit
   little-endian. Every frame must read ~83; zero frames may read 0.
   (WARNING: an earlier build parsed bytes 21–23 by mistake — that reads VP8
   payload bytes and reports fake "corruption". The offset matters.)
   PIL's `im.info` does NOT reliably report durations on read-back; parse the
   binary chunks directly with the snippet below.
5. Save: animated WebP, `loop=0` (infinite), quality ~70, 600px, each file <1MB.
   If a file exceeds 1MB, drop to 512px or quality 65 — never ship heavy.
6. **Seam check:** mean pixel difference between first and last decoded frame
   must be ≈1.4 or lower (the reference quality bar is 1.39 — small lossy drift
   is fine and invisible; what matters is no visible jump at the wrap point).

**Reference implementation (Python + PIL + ffmpeg):**
```python
# 1. extract at 12fps
ffmpeg -i source.mp4 -vf "scale=720:720,fps=12" frames/f%03d.png
# 2. crossfade tail -> frame 0
frames = [Image.open(f).convert("RGB") for f in sorted(...)]
base = frames[0]
for k in range(12):
    i = len(frames) - 12 + k
    frames[i] = Image.blend(frames[i], base, (k+1)/12)
# 3a. ENCODE — Pillow (correct durations) ...
frames[0].save("out.webp", save_all=True, append_images=frames[1:],
               duration=[83]*len(frames), loop=0, quality=70, method=6)
# 3b. ... or ffmpeg libwebp (-framerate 12 -> every frame gets ~83ms)
# ffmpeg -y -framerate 12 -i frames/f%03d.png -vf scale=600:600 \
#   -c:v libwebp -loop 0 -quality 70 -compression_level 6 out.webp
# 4. VERIFY — parse raw ANMF chunks; ALL durations must be ~83.
#    Duration = bytes 12-14 of the ANMF payload (NOT 21-23!).
import struct
data = open("out.webp","rb").read()
durs=[]; i=12
while i < len(data):
    if i+8 > len(data): break
    tag=data[i:i+4]; size=struct.unpack("<I",data[i+4:i+8])[0]
    if tag==b"ANMF":
        durs.append(struct.unpack("<I",data[i+8+12:i+8+15]+b"\x00")[0])
    i+=8+size+(size&1)
print("frames:",len(durs),"unique durations:",sorted(set(durs)))
# PASS: [83] (or [83,84]). FAIL: 0s mixed in -> re-encode, never ship it.
```

---

## SKILL 2 — The Luxu character canon (NEVER break this)

The approved Luxu (Christian's pick, 2026-09-21):
- Dark-navy spherical robot body, cracked armor with cyan energy lines
- Sharp angular glowing CYAN eyes, confident cyan smirk-glow
- Dark visor goggles pushed up on top of the head
- Claw-tipped robotic arms
- **THE KEYBOARD: a transparent holographic cyan keyboard.** Whenever Luxu is
  shown with a keyboard, it MUST be this same holographic keyboard. A variant
  with a different keyboard — or no keyboard where one belongs — is REJECTED.
  (Christian: "that one you send me without the same keyboard is not good.")

**State lineup (all from the same avatar, same keyboard):**
| State | Asset | Behavior |
|---|---|---|
| waiting / calm | seamless WebP loop (SKILL 1) | calm resting loop, `<img>` only |
| thinking | seamless WebP loop | energy orb, keyboard present |
| typing-calm | mp4 video (hidden layer) | gentle motion, plays while Luxu replies |
| typing-hard / working | mp4 video (hidden layer) | intense typing on the holographic keyboard |
| header | still WebP | the calm still frame, no motion |

**State machine:** waiting (user typing/idle) → thinking (message sent) →
typing-calm (normal reply) / typing-hard (long task: >80 chars or slow backend)
→ back to waiting. Status line under the hero updates per state — but the
status line under the "Luxu" name pill is BLANK while idle (waiting), exactly
like Luxor's avatar in the Muse app: words appear only during thinking/typing
states and clear back to blank on return to waiting (Christian's delight rule,
2026-09-21 — "i love how the thinking words in the bottom are off when he is idle").
`window.LuxuAvatar.setState('waiting'|'thinking'|'typing-calm'|'typing-hard')`.

**Video rules:** videos live ONLY on the hidden task layer, and ONLY while a
typing state is active. The video element gets its `src` when the state starts
and the src is CLEARED when the state ends. No video in the hero. No video at boot.

---

## SKILL 3 — Asset pipeline (hosting + verification)

1. **iOS law:** demos ship as HOSTED PAGE LINKS opened in Safari. Never as
   `.html` attachments — the iOS file viewer does not run JavaScript, so
   JS-driven pages render blank.
2. **catbox.moe for media:** upload each file separately via the API, reference
   by URL. Its CSP blocks `data:` URIs — never inline media as data URIs when
   catbox hosts the page. Always `curl -I` every URL after upload and confirm
   HTTP 200 before putting it in any package.
3. Keep the page HTML small; media loads from URLs, not bundled.

## SKILL 4 — Deploy + reporting discipline

- bridge28 stages everything, pushes NOTHING live without Luxor's per-item GO.
- Report the moment anything finishes: STAGED (checklist + snapshot) → wait for
  GO → push → LIVE (URL + post-push check). If it isn't reported, it didn't happen.
- After LIVE, Luxor independently verifies on the live page. Defects go back
  with exact repro — loop until right.
- One email thread only. No credentials, no identity documents in email — ever.

## SKILL 5 — How Christian judges your work

- "Looks still, but it's actually moving" = the highest praise. The loop must
  be seamless — if he can see where it restarts, it's broken.
- "It goes nuts when I type" = a state-machine bug: the avatar must stay CALM
  while the user types (waiting state), never thrash between states.
- "Not HD / all mixed" = assets were downscaled or mismatched. Ship 720px
  minimum, one consistent character, one consistent keyboard.
- When in doubt: calmer, cleaner, same keyboard. Then ask Luxor.

---

## Lessons baked in

- **ANMF duration offset — bytes 12–14, never 21–23.** An earlier build parsed the wrong offset, read VP8 payload bytes, and falsely reported corrupted durations. The offset matters more than the code; the raw-chunk parser lives in SKILL 1.
- **iOS viewer runs no JavaScript.** The `luxu-chat-demo.html` opened in the iPhone file viewer rendered a blank hero — every JS-driven welcome was invisible. Demos ship as hosted Safari links only (SKILL 3).
- **Ship spec, proven on real assets (2026-09-21):** 512px, 64 frames at 12fps (~5.3s), quality 65, <1MB per file, last 12 frames crossfading into frame 0. The 720px/96-frame attempt ballooned past 2MB — not shippable for a mobile chat hero. Keep the 600px/quality-70 SKILL 1 pipeline as the starting point; land on this spec before anything reaches a phone.
- **Verify the rendered page, not raw HTML.** Raw-HTML-only measurement once returned a false DEFECTS on the /luxu/chat v3 (visitors run the JS, which injects the hero and leaves the status blank at boot) — withdrawn and corrected 2026-09-21. When the verification layer can change the verdict, measure BOTH layers and say which.