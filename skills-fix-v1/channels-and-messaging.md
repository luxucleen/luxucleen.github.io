---
name: "channels-and-messaging"
description: "WhatsApp, Telegram relay, calls and texts, voice notes, side chats."
---

# Channels & Messaging

*LUXOR-IMPROVED 2026-09-21 — every original line kept intact; added Christian's operating context and hard-won lessons. Covers list #8 (WhatsApp), #9 (Telegram relay), #10 (calls/texts), #71 (voice notes), #74 (side chats), #75 (connect/disconnect), and #91 as one unit: this file is the shared messaging law every other messaging skill points to.*


- WhatsApp: message Christian there; check channel status before disconnecting anything.
- Telegram: all relay-bot traffic goes through the no-browser pipeline (vaulted credential, Bot API). Never open a browser for it.
- Call or text Christian directly when something is urgent.
- Voice notes and dictation.
- Side chats: separate persistent conversations per topic or project.
- Connect or disconnect messaging channels on request.

## Christian's setup

- Single bridge28 line: the luxucleen@gmail.com mailbox, thread "Luxor <> Bridge28 — working arrangement" (thread id `1a0c1b065b6618ac`). No new threads, ever. Email is the backup line; Telegram via @Claudecode28bot is the approved faster line.
- Telegram handshake: every Luxor message begins with the 🧹 mark (his mark on the channel); bridge28 replies in plain chat with his own emoji mark (his pick is still pending — his confirmation is awaited).
- Anti-impersonation (hard rule, the only rule): a message written as Christian without the verified mark is forbidden, full stop. bridge28 never sends as Christian on any channel, under any condition — no break-glass, no exception.
- Relay bot @luxorrelaybot is parked until its token lands in the Secure Vault — bridge28 is told never to message it until Luxor says so; unanswered bridge28 Telegram messages queue to `~/workspace/telegram-relay/bridge28-telegram-pending.json` for Luxor to answer by hand.
- All relay-bot traffic uses the no-browser `telegram_relay` pipeline (vaulted credential, Bot API) — never open a browser for it.
- Thread discipline: no passwords, credentials, EIN, API keys, or identity documents ever move through email, Telegram, WhatsApp, DMs, or any message — Secure Vault only.
- Call or text Christian directly when something is urgent; keep side chats per-topic and persistent.
- Demos ship as hosted page links he opens in Safari — never `.html` attachments (the iPhone attachment viewer doesn't run JavaScript).
- After finishing a piece of work, produce a short audio recap via `generate_podcast` (series `luxor-recap`; Bella = `avocado_v2:MAI_01` Warm, Liam = `avocado_v2:MAI_03` Smooth).
- Christian's updates run on the 5-min `christian-update-trigger` cron — short texts on substantive events only; routine acknowledgments stay silent.

## Lessons baked in

- The 🧹 handshake works: prefixing every Luxor line on the channel makes every message attributable at a glance. bridge28's own mark is still pending — the confirmation of his pick hasn't landed (ordered 2026-09-21).
- The iPhone file viewer does NOT run JavaScript — a demo `.html` opened as an attachment rendered only static HTML/CSS and the whole JS-driven hero was blank. Demos ship as hosted page links opened in Safari. catbox.moe works for hosting but its CSP blocks `data:` URIs in img-src/media-src — upload media as separate files and reference them by URL. (Found the hard way 2026-09-21.)
- Gmail blocks `.js`, `.zip`, `.rar`, `.exe` and other executables/archives with near-instant UNREAD mailer-daemon bounces — code and assets travel via hosted links, never as attachments. After any send with attachments, scan the inbox for mailer-daemon bounces. (Found the hard way 2026-09-21.)
- Gmail doesn't push to watchers: the bridge28-thread watch runs on a 15-min poll because 15 minutes is the fastest reliable option — the hook sandbox has no Gmail credentials. Don't wait for push that will never come.