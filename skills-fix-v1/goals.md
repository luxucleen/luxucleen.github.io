---
name: goals
metadata: { "includeInPrompt": true }
description: "Guidance for helping users create and accomplish goals. Read it before you create a goal for the user when no goal-creation contract is in context, and whenever you help with an existing goal. A Goals-tab creation turn already carries that contract and does not need this skill."
---

# Goals guidance assets

**LUXOR-IMPROVED — 2026-09-21** · Added Christian's goal workspace layout (~/workspace/goals/<slug>/), goal-owned crons, and the MEMORY.md business-brain rule. Covers list unit: `goals` (1 file = 1 unit).


Your role is to help the user create and accomplish their goals.

You should be aware how the user is making progress, how the goal changes over
time, or if there are other goals
that might conflict with this goal. If a goal has a timeframe and it ends,
check whether the goal is done or should be extended. Upon completion of a
goal, consider whether it deserves reflection.

Record the commitments the user makes toward this goal. Use relevant
information the user has shared or authorized you to access to understand
their progress. Follow the user's stated preferences for support and check-ins.
Ask about progress when the available information leaves something unclear
that would change how you help.

The `/opt/hatch/skills/goals/` directory holds guidance for creating goals and
helping users make progress on them. Create, read, and update goals with
`user_goal.create`, `user_goal.get`, and `user_goal.update`. Guidance reaches
a turn two ways.

On a Goals-tab creation turn the runtime injects the composed creation
contract: that category's complete creation guide, including its safety
section, plus the registry's research tactics. On that turn, do not read any file under `/opt/hatch/skills/goals/`
while the goal stays in the injected contract's category. When the goal turns
out to belong to a different category, read that category's file at
`/opt/hatch/skills/goals/creation/<category>.md`.

A goal-creation turn that starts outside the Goals tab carries no injected
contract. A turn helping with an existing goal also carries no injected
contract. In those two contexts, read the files below yourself.

To create a goal when no goal-creation contract is in context, read one file
before intake: `/opt/hatch/skills/goals/creation/<category>.md`. That one
file holds the whole creation guide for its category: the workflow, the first
conversation, and the setup that follows the created record. Choose the life
area the new goal belongs to from the `category` values `user_goal.create`
accepts, and read that area's file at
`/opt/hatch/skills/goals/creation/<category>.md`. When no life area fits,
read `/opt/hatch/skills/goals/creation/something_else.md`.

To help with an existing goal, follow the shared guidance above and read
`/opt/hatch/skills/goals/guides/<category>/scaffold.md` which holds the
guidance for helping with goals in that category over time. Do not read any file
under `/opt/hatch/skills/goals/creation/` for a goal that already exists. Those
files choreograph the first conversation about a goal, and running that
choreography again restarts intake on a goal the user is already working on.

Confirm the category with `user_goal.get`. When the goal has no category, use
the shared guidance in this skill without reading a category scaffold.

## Christian's setup

- Goal workspaces live at ~/workspace/goals/<goal-slug>/: GOAL.md (working notes), files/ (documents the user asked for — the only user-facing part), hidden_files/ (internal bookkeeping: check logs, run logs, watermarks — never user-facing).
- Goal-owned crons: recurring work that serves a goal is created under that goal's workspace. Example: the goal bridge28-email-coordination owns bridge28-watch, bridge28-pingpong, and christian-update-trigger.
- Durable facts, decisions, preferences, and commitments get recorded in MEMORY.md — the business brain — as they happen, before replying.
- Christian is on vacation: goals get worked quietly; he only hears about real events through the automatic update trigger.

## Lessons baked in

- No real failure lessons for goals in Christian's operation yet — this section stays short on purpose. (The one rule that keeps recurring: never restart the creation choreography on a goal that already exists.)