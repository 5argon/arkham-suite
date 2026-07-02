---
name: campaign-widget
description: >-
  Use when creating or editing a campaign profile widget in arkham.life (files under
  life/src/lib/components/profile/campaigns/campaign/**, or their precompute in
  life/src/lib/campaign/**). Gives the catalogue of shared widget primitives, which to reach for in
  each situation, the precompute→render data flow, and the conventions that keep widgets consistent.
  The golden rule: do not hand-roll tables, tooltips, tile walls, icon rows, labels, thumbnails, or
  stat blocks — there is a shared component for almost everything.
---

# Building a campaign profile widget

A widget is a small Svelte component under
`life/src/lib/components/profile/campaigns/campaign/<campaign>/` that renders one slice of a
player's record. It reads **precomputed aggregates** (never raw logs) and renders them with
**shared primitives**. Two principles drive everything:

1. **Compute in the precompute, render in the UI.** Meaningful numbers/derivations belong in the
   campaign aggregate (`life/src/lib/campaign/**`), serialized into the `.ahlifepro` contract — not
   computed hot in the component. The component should mostly read fields and pick a primitive.
2. **Don't hand-roll.** Before writing a `<table>`, a hover tooltip, a grid of card images, a
   `<p class="text-primary-500 …">` label, a big-number block, or an `<img>` of a card — check the
   catalogue below. There is almost certainly a primitive. Hand-rolling is how the look drifts.

## Primitive catalogue — what to grab in what situation

All under `$lib/components/profile/_primitives/` unless noted.

| You need to show… | Use | Notes |
|---|---|---|
| The widget's outer card/frame | `WidgetFrame` | Bordered card + header tab. Usually applied by the framework, not the widget itself. |
| A per-scenario "passport" (header art, plays, Succeed/Failed, resolutions, achievements) | `ScenarioInfo` (campaigns/campaign/) | Per-campaign wrappers: `TskScenarioInfo`, `PtcScenarioInfo`. Inject bespoke bits via its `headerArt` / `stats` / `children` snippets. |
| A tabular breakdown | `WidgetTable` | Pass `columns` + a `row` snippet. Never write raw `<table>`/`<thead>`. |
| A per-version / per-tier table (Succeed/Failed/Plays/Resolutions/XP) | `VersionBreakdown` | Backed by `ScenarioStat.versions`; register the axis in `version-stats.ts` `VERSION_AXES`. Supports multi-axis (version + tier). |
| A list of cards, each with a trailing value | `CardLineList` | Trailing is a snippet → a ×count, a date, **or a card image** (e.g. the investigator who drew a weakness, as a `CardStrip`). `PtcCardCountList` is the count-trailing convenience wrapper. |
| Big number(s) + caption | `StatNumbers` | Rows of `{value,label}` or `{heading,stats}` groups; optional per-difficulty hover via `byTier`. Group heading renders a `SectionLabel`. |
| One inline number with a per-difficulty hover | `CountWithBreakdown` | The shared "value + difficulty breakdown tooltip". |
| A wall of square card tiles, lit by play-count | `LitTileGrid` | flex/grid, optional name, count corner/below, `fit` cover/contain (diagrams), `objectTop`, `markup`. Tiles are a uniform `w-20`. |
| A horizontal, equal-width, non-wrapping icon sequence with sublabels + per-cell hover | `IconTrack` | tint/dim per cell; icon + sublabel are caller snippets. Used by `RoutingTrack` (TSK route), `PtcTokenChain`, `PtcDcChain`. |
| A scenario's encounter-set icon (with lettered fallback) | `ScenarioSetIcon` | The icon cell inside icon tracks. |
| A single bordered square card thumbnail | `CardThumb` | `tone` primary/danger border, `objectTop`, `size`. For passport header art + no-scenario key widgets. |
| A small section heading / table caption | `SectionLabel` | `variant` heading (sm semibold) vs label (xs muted); `align` left/center. Replaces every hand-rolled `<p class="text-primary-500 … text-xs font-medium">`. |
| "Which endings?" resolution chips | `ResolutionChips` | ids / visited / tallies / verdicts. |
| A win/loss outcome face icon | `OutcomeFace` | better-win / win / special / loss, with a naming hover. |
| A "● lit / ○ greyed" story-fork outcome list | `OutcomeList` | Items are `{ label, hit, count?, note? }`; ●=hit ○=miss, optional ×count + muted trailing note. Used by FHV scenario passports + TDC dive-site passports. |
| Chaos-token glyph(s) | `ColoredChaosToken`, `TokenCoinRow` | Single token vs a labelled coin row with ×count. |
| The "hidden in log-only mode" placeholder | `NonLogPlaceholder` | Pair with the widget's `nonLog` classification. |

From `@5argon/arkham-life-ui` (the shared UI package): `getCardImagePath(code, 'square')`,
`CardLine`, `CardStrip`, `EncounterSetIcon`, `HoverTooltip`, `parseArkhamMarkup`, `FaIcon`. Prefer a
profile primitive over these raw building blocks when one fits.

## Hover tooltips

Don't hand-roll the `tipVisible/tipRef/tipText + showTip/hideTip + HoverTooltip` boilerplate per
widget. If the hovers live inside a primitive (`LitTileGrid`, `IconTrack`, `StatNumbers`,
`CountWithBreakdown`), it already provides one shared tooltip. Only hand-roll a `HoverTooltip` for a
genuinely bespoke trigger that no primitive covers (a few table widgets still do — that's the
remaining duplication, not the pattern to copy).

## Data flow

- **Read the unified `scenarios` record** (`CampaignScenarios` → `ScenarioStat[]`) for per-scenario
  data: `plays`, `playsByTier`, `resolutions`/`visited`, `versions`, `choices`, `xp`. Per-campaign
  blobs (`tsk`, `ptc`, `eoe`, `dwl`) carry the bespoke aggregates.
- **Serialize numbers, strip re-derivable English.** Add meaningful derived stats as named fields at
  the precompute step (`.ahlifepro` is a public contract); the component reads them.
- **Bump versions freely** (`COMPILED_PROFILE_VERSION` / `CACHE_VERSION`) when the precompute shape
  changes — solo dev, no other clients to strand. Render-only changes need no bump.

## Writing the precompute (the campaign builder)

Each campaign's aggregate is built by `build<Campaign>(records)` in
`life/src/lib/campaign/campaigns/<campaign>.ts`. Reach for the shared builder tooling instead of
open-coding it — the same "don't hand-roll" rule applies here as to the UI:

- **Filter records to the family** with `filterFamilyRecords(records, X_FAMILY)`
  (`records/campaign-family.ts`). Never inline `records.filter(r => … (originalId ?? code) === …)` —
  that drifts from `baseFamilyOf` and was a recurring foot-gun.
- **Count / per-difficulty tallies** use `utils/tally.ts`: `emptyTally()` (a fresh `{ total, byTier }`),
  `bumpTally(t, difficulty)` (total + per-tier), `ensureTally(map, key)` (get-or-create), and
  `mergeTally(a, b)`. Plain code→count maps use `bumpCount(map, key)` and `bumpSet(map, codeSet)`.
  Don't re-declare local `bump` / `bumpDiff` / `mergeTally` closures that duplicate these.
- **Scope per-investigator data to the viewed subject** by intersecting recorded investigator codes
  with `rec.subjectInvestigators` (a single-player profile then shows only its own; a play-group
  profile, whose `subjectInvestigators` spans every member, merges them). Keep unattributed entries.
- **Reward wording is per-scenario** — `utils/scenario-reward.ts` (`isVictoryDisplay`, `rewardUnit`,
  `rewardHighscoreLabel`, …) picks "Victory Points / VP" vs "Experience / XP" from
  `scenarioMeta.victoryDisplay`. A curated `scenarioMeta.maxXp` of 0 means no highscore is kept.

## Conventions (enforced or expected)

- **nonLog classification**: every widget declares `nonLog` (`'full' | 'partial' | 'none'`) in
  `profile-widgets.ts`; a guard test enforces that fully-non-log widgets aren't passed `logOnly`.
  Full-non-log widgets render `NonLogPlaceholder` in log-only mode.
- **Exact scenario names / achievement tags** match the kohaku scenario enum (return-to → `return_to_*`).
- **No journal comments** in code — comments describe the code AS-IS. No history narration
  ("now…/previously…/used to…/replaced the old…/changed from…"), no before/after framing; lean on
  self-descriptive names and drop comments that merely restate the code. Version-ledger blocks
  (sequential `N→M:` change logs) are the only exception.
- **Leave work uncommitted for review**; commit only when asked.

## When you extract a new primitive

If you find the same markup hand-rolled ≥2–3 times (a tile wall, an icon row, a label, a table, a
thumbnail), extract it into `_primitives/`, migrate the copies, keep public props stable so existing
callers are untouched, run `cd life && yarn check`, and **add a row to the catalogue above** so the
next widget reaches for it instead of re-rolling.

## Before finishing

- `cd life && yarn check` is green (0 errors).
- If you added/changed paraglide messages: `cd life && yarn paraglide-compile`.
- No raw `<table>`, hand-rolled tooltip, ad-hoc card `<img>`, or `<p class="text-primary-500 …">`
  label that a primitive already covers.
- The widget reads precomputed fields; no heavy derivation in the component.
