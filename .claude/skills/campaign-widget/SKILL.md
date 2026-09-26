---
name: campaign-widget
description: >-
  Use when creating or editing a campaign profile widget in arkham.life (files under
  life/src/lib/components/profile/campaigns/campaign/**, or their precompute in
  life/src/lib/campaign/**). Covers the precompute → registry → render flow, the shared widget
  primitives, and the conventions that keep widgets consistent. The golden rule: do not hand-roll
  tables, tooltips, tile walls, stat blocks, labels, thumbnails or empty states — there is a shared
  component for almost everything.
---

# Building a campaign profile widget

A widget renders one slice of a player's record on a profile page. It reads a **precomputed
aggregate** (never raw logs) and draws it with **shared primitives**.

1. **Compute in the precompute, render in the UI.** Meaningful numbers belong in the campaign's
   aggregate (serialized into the `.ahlifepro` compiled profile, a public contract), not computed in
   the component. A component mostly reads fields and picks a primitive.
2. **Don't hand-roll.** Before writing a `<table>`, a hover tooltip, a grid of card images, a muted
   label, a big-number block or an empty-state line, check the catalogue below.

## Where things live

| Piece | File |
|---|---|
| The campaign's aggregate (the "blob") | `life/src/lib/campaign/campaigns/<campaign>.ts`, built with `defineCampaignBuilder` |
| Builder registry (blob key = campaign-data family code, e.g. `tskc`, `eoe`) | `life/src/lib/campaign/campaigns/registry.ts` |
| Widget definitions + the campaign page's default layout | `life/src/lib/campaign/profile/widgets/<slug>.ts` (`campaignWidgets(slug, [...], () => [...rows])`), listed in `profile-widgets.ts` |
| Widget components | `life/src/lib/components/profile/campaigns/campaign/<slug>/*.svelte` |
| Widget id → component | `life/src/lib/components/profile/campaigns/campaign/<slug>/index.ts` (`campaignRenderers(family, {...})`), spread into `_framework/widget-renderers.ts` |
| Strings | `life/messages/profile/campaigns/campaign/<slug>/en.json`, keys `campaign_<slug>_…` (the folder must be in `life/project.inlang/settings.json`) |

`slug` is the kohaku `Campaign` value used in URLs (`tsk`, `eote`); `family` is the campaign-data
code (`tskc`, `eoe`). They differ only for those two.

## The precompute

```ts
export const buildDwl = defineCampaignBuilder<CampaignDwl>('dwl', (plays) => ({
	silas: countNotes(plays, { killed: 'killed_silas_bishop', restored: 'restored_silas_bishop' }),
	sacrificed: tallyPlays(plays, (p) => p.items('sacrificed').has('02217')),
	approach: plays.filter((p) => p.choice('the_miskatonic_museum', 'approach') === 'broke_in').length
}));
```

- Group records by family with `recordsByFamily(records, merge)` (`records/campaign-family.ts`)
  in cross-campaign aggregates; a per-campaign builder gets its plays from `defineCampaignBuilder`.
- `defineCampaignBuilder(family, build)` filters the records to the family (folding its Return-to
  box in when the setting asks), hands `build` one `Play` per record, adds `family` + `plays`, and
  returns null when there are none. Declare the blob's interface (`CampaignDwl`) — it is the
  public contract — and register the builder in `registry.ts`.
- `Play` (`records/play.ts`): `has(key)` (a bare id means `campaign_notes.<id>`), `count(key)`,
  `items(section)`, `resolution(scenario)`, `choice(scenario, id)` (both fall back to the
  `return_to_` scenario id), `tier`, and `rec` for anything else.
- `countNotes` / `tallyNotes` (a spec of `field → note id`), `tallyPlays` (a predicate), and from
  `utils/tally.ts`: `Tally`, `emptyTally`, `bumpTally`, `ensureTally`, `mergeTally`, `bumpCount`,
  `extentOf` (min/max), `recentFirst`.
- Emit what the widget displays: ordered arrays instead of maps the widget must sort, derived
  totals as named fields, `Tally` (not a bare count) wherever a per-difficulty hover makes sense.
- Scope per-investigator data to the viewed subject with `rec.subjectInvestigators`.
- Reward wording is per scenario: `utils/scenario-reward.ts` (`isVictoryDisplay`, `rewardUnit`, …).
- Names come from campaign-data, not Paraglide: `scenarioName(code, id)`, `logText(code, key)`,
  `itemLabel`, `sectionTitle` in `records/campaign-log-source.ts`; card names from `cardByCode`.
- Bump `COMPILED_PROFILE_VERSION` (with a line in `compiled-profile-versions.md`) and
  `CACHE_VERSION` when a blob's shape changes. Solo developer: bump freely.

## The widget

```svelte
<!-- @component The Miskatonic Museum: the Necronomicon's fate and how the museum was entered. -->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: dwl, ctx }: CampaignWidgetProps<CampaignDwl> = $props();
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			logOnly={ctx.logOnly}
			empty={m.campaign_dwl_miskatonic_empty()}
			rows={[
				{ heading: m.campaign_dwl_nec_heading(), stats: [{ value: dwl?.necronomicon.took, label: m.campaign_dwl_took() }] },
				{ heading: m.campaign_dwl_approach_heading(), nonLog: true, stats: [...] }
			]}
		/>
	{/snippet}
</ScenarioInfo>
```

- Every campaign widget takes `{ blob, ctx }` (`CampaignWidgetProps<Blob>`). `ctx` holds the page's
  `family`, the catalogue's `scenario`, the family's `scenarios` and `achievements`, `logOnly`, and
  the slot's `config`. A widget that needs a fixed extra prop (which villager, which metric) is
  registered with `withProps(Component, { villager: 'rachel' })`; one that reads other payload data
  (e.g. `cardUsage`) is a plain `widget(Component, (c) => ({ … }))` entry merged into the map.
- Per-slot options shown in the layout editor are declared on the definition (`config: [{ kind:
  'toggle', key, label }]` or `{ kind: 'count', … }`) and arrive in `ctx.config`. A definition with a
  `scenario` and no `label` is titled with the campaign-data scenario name.
- A passport widget passes `{ctx}` to `ScenarioInfo`; the scenario comes from the catalogue entry's
  `scenario`, so the same component can serve several scenarios.
- The `@component` comment is one line saying what the widget shows. No "built on …", no caller
  lists, no restating props. Game-rule explanations that a player needs go in a note doc
  (`noteDoc` on the widget definition, under `life/src/lib/docs/widget/<slug>/`).

## Primitive catalogue

Import primitives from `$lib/components/profile/_primitives` (a barrel).

| You need… | Use | Notes |
|---|---|---|
| A per-scenario passport | `ScenarioInfo` (campaigns/campaign/) | `ctx`, `empty` (replaces `stats`), `headerCards` (card or portrait thumbs), `showPlays`, snippets `stats` / `children` / `headerMeta` / `cornerExtra`. Plays, Succeed/Failed, resolutions, reward highscore and the scenario's achievements come for free. |
| A per-version table | `ScenarioVersionTable` (campaigns/campaign/) | Register the version axis in `stats/version-stats.ts` `VERSION_AXES`; pass `label(version)`. Log-only safety and VP/XP wording are derived. `VersionBreakdown` is the raw table under it. |
| Big numbers with captions | `StatNumbers` | Rows of `Stat[]` or `{ heading, stats, nonLog?, keepEmpty? }`. A stat takes `value` or `tally` (hovers to its per-difficulty breakdown). All-zero groups hide themselves; `empty` shows when nothing is left; `logOnly` hides `nonLog` groups. |
| One number in a table cell with a difficulty hover | `CountWithBreakdown` | `tally` or `value` + `byTier`. |
| A table | `WidgetTable` | `columns` + a `row` snippet. Never a raw `<table>`. |
| A first cell with a scenario icon and name | `ScenarioNameCell` (campaigns/campaign/) | |
| Card rows with a trailing value | `CardLineList` | Trailing snippet: a count, a date, or a `CardStrip`. |
| A wall of square tiles lit by count | `LitTileGrid` | A tile takes a card `code` (art + default label) or an `image`; hover `detail` via `tallyDetail` from `utils/difficulty.ts`. |
| A single card or portrait thumbnail | `CardThumb` | `code` or `src`; alt/title default to the card name. |
| Full card scans with a count pill | `CardScanWall` | `items {card, count}[]`, `cols`, `dimUnused`, `badge` snippet. |
| A link tile to a sub-page | `NavTile` | |
| An equal-width icon sequence with sublabels | `IconTrack` | Powers `RoutingTrack`, `PtcTokenChain`, the two-sided chains. |
| A scenario's encounter icon | `ScenarioSetIcon` | |
| A muted sub-heading / caption | `SectionLabel` | `variant` heading \| label, `align`. |
| A footnote under the content | `WidgetNote` | |
| "Nothing recorded yet" | `WidgetEmpty` (or the `empty` props above) | |
| Resolution chips | `ResolutionChips` (campaigns/campaign/) | |
| ●/○ story-fork outcomes | `OutcomeList` | |
| A win/loss face | `OutcomeFace` | |
| Chaos tokens | `ColoredChaosToken`, `TokenCoinRow` | |
| Two-sided spines (PtC Doubt/Conviction, TCU Lodge/Coven) | `SignatureRunsTable`, `TwoSidedChain`, `TwoSidedSourceTable` (campaigns/campaign/) | |
| A tooltip no primitive covers | `HoverTipState` + `HoverTip` | `tip.show(title, detail \| detail[], e)`, `onmouseleave={tip.hide}`, then `<HoverTip {tip} />` once. |
| The log-only placeholder | `NonLogPlaceholder` | Rendered by the framework for `nonLog: 'full'` widgets. |

From `@5argon/arkham-life-ui`: `CardLine`, `CardStrip`, `EncounterSetIcon`, `FaIcon`,
`parseArkhamMarkup`. Prefer a profile primitive when one fits.

## Log-only mode

Every widget definition declares `nonLog` when it needs data beyond the campaign log (Extra-tab
inputs or decks): `'full'` makes the framework render a placeholder in log-only mode; `'partial'`
means the widget hides its non-log parts when `ctx.logOnly` (e.g. `nonLog` stat groups). Audited
campaigns are listed in `profile-widgets.test.ts`.

## Conventions

- `{#each}` blocks are keyed.
- No `$effect` watchers for derived state; seed `$state` and do work in handlers.
- Comments describe the code as it is and only say what the code cannot: a game rule, a data quirk,
  why a value is scoped a certain way. No history ("now", "previously", "no longer"), no restating
  names, no lists of callers.
- Extra-tab choice labels mirror the ArkhamCards wording verbatim.
- Leave work uncommitted for review.

## Before finishing

- `cd life && yarn paraglide-compile` if messages changed, then `yarn check` is at 0 errors.
- `node ../node_modules/.bin/vitest run` passes.
- The widget reads precomputed fields; no raw `<table>`, hand-rolled tooltip, ad-hoc card `<img>`,
  hand-rolled label or empty state.
