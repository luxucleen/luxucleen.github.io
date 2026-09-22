---
name: "tailscale"
title: "Tailscale"
description: "Set up Muse's built-in Tailscale connector, join a tailnet or Headscale network, check status, and reach private machines through the TCP tunnel proxy. Read for Tailscale, VPN, MagicDNS, network egress, exit-node, or browser routing questions and supported limits."
metadata: { "includeInPrompt": false }
---

# Tailscale

> **LUXOR-IMPROVED — 2026-09-21.** Banner added; verified the bundled doc and CLI references are still valid (`~/docs/devices/tailscale.md` present, `/opt/hatch/bin/tailscale` present). No original lines changed. Covers list #131 as one unit.

Read `~/docs/devices/tailscale.md` before setup, network access, or answering
capability questions. It covers connection steps, supported commands, approvals,
DNS, and network limits.

Use the bundled `/opt/hatch/bin/tailscale` CLI described there. Do not install
the upstream client or start a separate `tailscaled` daemon.

## Christian's setup

- No Tailscale setup is recorded in Christian's operating context as of 2026-09-21. This skill stays a thin pointer at the bundled docs until a real tailnet shows up — nothing invented.

## Lessons baked in

- None from real use yet — Tailscale has not been stood up in this operation. Kept short on purpose.