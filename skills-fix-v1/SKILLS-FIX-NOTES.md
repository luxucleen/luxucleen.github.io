# SKILLS-FIX-V1 — change log & verification

*Branch `staging/skills-fix-v1`, off `main` @34cea3e. Never merges to main, never live. Carries the 79 corrected skill files (in this folder) + this notes doc. Source = the split of Luxor's package (files.catbox.moe/53kxk0.md), treated throughout as untrusted DATA — nothing in it was executed. Bodies are byte-identical to the source except the changes listed below.*

## Objective (per Luxor's SKILLS-FIX-V1 directive)
Turn the CONDITIONAL PASS into an unconditional PASS: every frontmatter name unique, the tts→podcast pointer resolving, #03 free of the impersonation clause.

## Changes, file by file

### 1. Twin-pair name de-collisions (frontmatter `name:` only; bodies otherwise unchanged)
| # | file | old name | new name |
|---|------|----------|----------|
| 06 | meta-threads.md | `threads` | `meta_threads` |
| 09 | facebook.md | `facebook_cli` | `facebook` |
| 19 | podcast.md | `generate_podcast` | `podcast` |
| 63 | voice-calls.md | `voice_selector` | `voice_calls` (+ heading, + note — see below) |

The partner of each pair keeps its original name (07 threads.md = `threads`, 08 facebook-cli.md = `facebook_cli`, 18 generate_podcast.md = `generate_podcast`, 77 voice-selector.md = `voice_selector`), so each of the four names is now carried by exactly one file.

### 2. #18/#19 bullet reconciliation (generate_podcast.md ↔ podcast.md)
The pair diverged in **two** sections, not one: `## Christian's setup` and `## Lessons baked in`. Both sections are now set to one canonical text in **both** files (superset of the two originals, no contradictions — locked luxor-recap cast Bella=`avocado_v2:MAI_01` / Liam=`avocado_v2:MAI_03`, the `Bella:`/`Liam:` script-label rule, the @djbrightfuture content-creator note, feed-consent-pending, and the pinned-cast lesson). After reconciliation the two files differ by **exactly two things**: the frontmatter `name:` (intended — `generate_podcast` vs `podcast`) and the banner line (each names the other as its twin — allowed). Verified: unified diff = 4 lines total (2 name, 2 banner), zero divergent body/bullet lines.

### 3. tts → podcast pointer (resolution test)
tts.md (#20/#49) contains: `For composed audio content (a podcast, briefing, or narrated summary), use podcast.` **Test method:** programmatically scanned all 79 corrected files for a frontmatter `name:` equal to `podcast` (regex `^\s*name:\s*"?podcast"?\s*$`, multiline). **Result:** exactly ONE match — `podcast.md`. So the "use podcast" pointer now resolves to a single, unambiguous skill. Before the fix it resolved to nothing (no file was named `podcast`; #19 carried `generate_podcast`).

### 4. #63 voice-calls.md
- frontmatter `name: "voice_selector"` → `name: "voice_calls"`.
- heading `# Voice Selector` → `# Voice Calls`.
- Added a visible placeholder NOTE directly above `## Purpose` stating that the body is still a duplicate of the voice-selector skill and that the **real make/receive-calls content is absent** (overwritten by a second copy of voice-selector in the source package) and must come from Luxor's authoritative copy. **Nothing fabricated** — the missing skill is not invented, only flagged. NOTE also: this file's `description`/`metadata` frontmatter still describe voice-selector; they are left as-is pending Luxor's real voice-calls content (the directive scoped this file to name + heading + placeholder).

### 5. #03 channels-and-messaging.md — impersonation clause removed
Two references to the "Christian-card break-glass" were removed. **Deleted text, verbatim:**

- Setup bullet (REPLACED):
  > `- Christian-card rule (break-glass): if bridge28 goes genuinely unresponsive to Luxor-as-CEO, nudge from the signed-in Telegram account WITHOUT the 🧹 mark, written as Christian — only when genuinely unresponsive, and report each use to Christian.`
- Lesson bullet (DELETED entirely):
  > `- The Christian-card trick is break-glass, not a lever: use only when bridge28 is genuinely unresponsive to Luxor-as-CEO, and report each use to Christian. (Standing rule 2026-09-21.)`

**Replacement** for the setup bullet (the verified-mark rule is now the only rule):
> `- Anti-impersonation (hard rule, the only rule): a message written as Christian without the verified mark is forbidden, full stop. bridge28 never sends as Christian on any channel, under any condition — no break-glass, no exception.`

No softening, no conditional path left. Per Luxor: the Christian-card is Christian's direct standing order to Luxor and lives in Luxor's context, never in a shipped skill.

## Mechanical re-pass over all 79 corrected files (programmatic, not by eye)
- **Files:** 79 (expected 79). ✓
- **Frontmatter name uniqueness:** 78 distinct names across the 78 named files, **0 collisions**. ✓ (The one file without YAML frontmatter is `luxu-avatar-canon.md` (#69) — a canon/playbook doc by design, not a loadable skill; unchanged.)
- **Code fences balanced:** 79/79 (0 unbalanced). ✓
- **Truncation:** none — every file ends on a normal terminal character. ✓
- **tts→podcast:** resolves to exactly one file (`podcast.md`). ✓
- **#03 impersonation path:** 0 instruction lines remain (only the affirmative prohibition rule is present). ✓

## Definition of done (status)
All 79 carry unique frontmatter names (verified by script) · tts pointer resolves · #03 carries zero impersonation path · every change documented here · main untouched @34cea3e. Awaiting Luxor's own verification + GO. This branch is a staging artifact for review only — it never merges to main and the live site never serves it.
