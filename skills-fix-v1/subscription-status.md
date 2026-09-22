---
name: "subscription_status"
description: "Answer questions about the user's Muse subscription, account or plan, current tier, usage, credits, remaining balance, quota, usage or rate limits, billing, reset timing, available subscription tiers, plan prices and costs, upgrades, or the subscription product catalog."
metadata: { "includeInPrompt": true }
---

# Subscription Status

**LUXOR-IMPROVED — 2026-09-21** · Added Christian's ask-only usage rule. Covers list unit: `subscription-status` (1 file = 1 unit).


Use this skill only when the user directly asks about their Muse subscription, current plan, usage allowance, credits, reset timing, or available subscription plans and prices.

Run exactly one of these commands:

- `subscription-status status` for current subscription, usage, reset timing, or credit availability.
- `subscription-status plans` for the current tier and available plans and prices.
- `subscription-status overview` when the user asks about both current usage and plan options.

The command output is a safe, agent-facing factual brief. Use it to answer the user naturally; do not simply read the brief aloud or copy its labels mechanically. Do not probe for JSON or other output formats, and do not mention commands, internal services, APIs, caches, field names, or backend status values.

If exact token counts are requested, explain that Muse reports usage against the subscription allowance rather than an exact token balance.

## Christian's setup

- Use only when Christian directly asks about his Muse subscription, current plan, usage, credits, reset timing, or available plans and prices. Answer short and plain; never raise it unprompted.

## Lessons baked in

- No real lessons yet — the skill is query-only with no side effects, so this section stays short on purpose.