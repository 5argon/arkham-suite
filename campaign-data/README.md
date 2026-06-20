# @5argon/arkham-campaign-data

Per-campaign Arkham Horror LCG **campaign-log data** — the searchable log-entry
dropdown, **achievements** (with inference rules, scenario ties, and shared
families), story-branch **validators**, and the quirky **special sections** —
shipped as committed JSON plus a typed API. Ingested from the ArkhamCards
`arkham-cards-data` reference. Consumes `@5argon/arkham-kohaku` for the
`Campaign` / `Scenario` symbols so every package shares one source of truth.

## Public API

```ts
import { getCampaignLog, achievementsForScenario } from '@5argon/arkham-campaign-data';
import { Campaign, Scenario } from '@5argon/arkham-kohaku';

const log = getCampaignLog(Campaign.ThePathToCarcosa);
achievementsForScenario(log!, Scenario.EchoesOfThePast); // -> [{ def, en }]  "For Prying Eyes"
```

Exports (see `src/index.ts`): `getCampaignLog`, `availableCampaignLogCodes`,
`sectionEntries`, `spoilerSegments`, `achievementsFor`, `achievementsForScenario`,
`evaluateAchievement`, `evaluateInference`, `findValidatorConflicts`, and all types.

**Live consumer:** `starter`'s `/campaign` page Scenario tab renders
"Achievements you can earn here" beneath each scenario's setup card
(`ScenarioAchievements.svelte`) — proof the data + TS symbols are adequate.

## Layout

| path | what |
| --- | --- |
| `data/<code>-{db,en}.json` | committed data artifacts (source of truth) |
| `src/types.ts`, `src/campaign-log.ts` | the typed API |
| `src/generated.ts` | data inlined for portable bundling (built by `tools/generate.mjs`) |
| `curation/` | hand/agent-authored curation + `*-review.md` for the human |
| `tools/` | the build pipeline (below) |
| `references/` | vendored ArkhamCards data (gitignored, build-time only) |

## Rebuilding

```
yarn workspace @5argon/arkham-campaign-data regen   # extract -> apply -> validate -> generate.ts
yarn workspace @5argon/arkham-campaign-data build   # tsc -> dist
```
`regen` re-derives everything from `references/` + `curation/`. `generate.mjs`
inlines the JSON into `src/generated.ts`. **Never hand-edit the `data/` JSON or
`src/generated.ts`** — edit `curation/` and re-run.

## Files

For each official campaign `<code>` there are two committed files:

| file            | content                                                         |
| --------------- | --------------------------------------------------------------- |
| `<code>-db.json` | language-neutral logic/structure (`CampaignLogDb`)             |
| `<code>-en.json` | English display text, localizable (`CampaignLogEn`)           |

Types live in [`src/types.ts`](./src/types.ts). The two files
are linked by a **stable, language-neutral key**:

- **log entries** → composite `"<section>.<id>"` (mirrors ArkhamCards'
  `(section, id)` addressing, so a future ArkhamCards integration can ingest a
  player's log automatically).
- **sections / achievements / items** → the bare `id`.

## Source of truth & build pipeline

Generated from the ArkhamCards `arkham-cards-data` reference in
`references/arkham-cards-data-master` (campaign logic) and
`references/pack` (card-code → name). The final files are **built**, not
hand-edited:

```
references/…  --extract.mjs-->  <code>-{db,en}.draft.json   (complete, no spoilers)
                                          +
                                curation/<code>.json        (spoilers + exotic sections)
                                          |
                                     apply.mjs
                                          v
                                <code>-{db,en}.json           (final, validated)
```

- `node tools/extract.mjs --all` — re-extract drafts from the reference.
  Deterministic; captures **every** `campaign_log*` effect, resolves card codes
  to names, groups card-marker entries into their section's `items`. Never holds
  curation, so it is always safe to re-run.
- `curation/<code>.json` — the only hand-authored input: spoiler spans and any
  exotic-section structure. See [`curation/dwl.json`](./curation/dwl.json) for
  the worked example.
- `node tools/apply.mjs --all` — merges drafts + curation → final files,
  validating that every spoiler span is a real substring.
- `node tools/validate.mjs --all` — checks db/en consistency, key linkage,
  spoiler validity, achievement parity, and completeness vs the draft.

`*.draft.json` files are intermediate and git-ignored; commit the finals and the
curation.

## Curation file format

```jsonc
{
  "code": "dwl",
  "spoilers": {
    "campaign_notes.took_necronomicon": ["the Necronomicon"]
  },
  "sections": {                       // optional: structure/override exotic sections
    "expedition_team": {
      "type": "partner",
      "items": [{ "id": "professor", "code": "09001", "label": "Prof. …" }]
    },
    "sacrificed": { "freeform": true } // section accepts free additions
  },
  "drop": ["hidden.some_bookkeeping_id"] // optional: remove non-recordable noise
}
```

`label` on a section item is moved into `-en`'s `items` map; everything else
stays language-neutral in `-db`.

## Special sections (per-campaign quirks)

Most sections are `notes` (a checklist of recordable entries). The rest are
campaign-specific quirks that warrant a bespoke editor, and each carries its own
**state schema** in `-db` (labels in `-en.items`):

| type | extra `-db` fields | example |
| --- | --- | --- |
| `partner` | item `health`/`sanity`/`resoluteHealth`/`resoluteSanity`; section `statuses` | eoe expedition team |
| `supplies` | `perInvestigator`; item `cost`/`repeatable` | tfa supplies |
| `scarletKeys` | `trackBearer` | tskc keys |
| `relationship` | `min`/`max` (level cap) | fhv residents |
| `count` / `investigatorCount` | `perInvestigator`, `min`/`max` | yigs_fury, time |
| `glyphs` | item roster (letter is player-decoded state) | tdc glyphs |

These are extracted from the reference (`tools/special-sections` workflow →
`write-sections.mjs`) into curation `sections` overrides. Inference can read them:
`partnerStatus` checks a partner's status (e.g. eoe `there_and_back_again` =
each survivor `alive`), `chaosToken` checks the final bag, `sectionCount`/
`sectionHas` read cards/keys sections. It's fine for a shape to be unique to one
campaign — these are the quirks that make each campaign distinct.

## Achievements: shared families & inference

Achievements were introduced with the newer campaign boxes and all the Return-to
boxes; the five oldest base campaigns (notz/dwl/ptc/tfa/tcu) have none natively.

**Shared (cross-family) achievements.** Return-to boxes add no new scenarios, so
most Return-to achievements describe *base-campaign* feats and should also count
for the base. Mark them in the RT curation:

```jsonc
"achievements": { "what_is_this_stuff": { "shared": true } }
```

`apply.mjs` then (a) stamps `shared` on the RT final and (b) injects the
achievement into the **base** campaign's final files. Every achievement also gets
a `family` (the base campaign code, e.g. `dwl` for both `dwl` and `rtdwl`).
Earned-state should be keyed by `(family, id)` so earning it in any family member
counts once and shows in both. See `tools/rt-achievements-csv.mjs` →
`curation/rt-achievements-review.csv` for the human review of which are shared.

**Inferred achievements.** Some achievements are auto-derivable from recorded
campaign data — the UI can grey out the manual toggle and explain it's inferred.
Add an `infer` rule in curation (`AchievementInference` in the types):

```jsonc
"achievements": {
  "dunwich_expertise":    { "infer": { "type": "difficulty", "is": "expert" } },
  "dwl_line_in_the_sand": { "infer": { "type": "ultimatums", "min": 3 } },
  "bane_of_yig":          { "infer": { "type": "logCount", "key": "yigs_fury", "min": 25 } },
  "insurance":            { "infer": { "type": "log", "key": "campaign_notes.house_burned" } }
}
```

`log`/`logAbsent` keys must be real `"<section>.<id>"` entry keys; `logCount` keys
are a count-section id. Evaluate at runtime with `evaluateInference` in
`campaign-log.ts`. `apply.mjs` and `validate.mjs` reject unknown keys.

**List achievements (per-item links).** A `list` achievement (e.g. "discover all
these mementos") uses `itemInfer` — a per-item map from item id to its log link —
instead of a top-level `infer`:

```jsonc
"member_these": {
  "itemInfer": {
    "mesmerizing_flute": { "type": "log", "key": "mementos.mesmerizing_flute" },
    "worn_crucifix":     { "type": "log", "key": "mementos.worn_crucific" }
  }
}
```

The per-item id is ArkhamCards' own (e.g. `worn_crucifix`); note it can differ
from the log entry id (`worn_crucific` — a source typo), so the link is stored,
never derived. Because each item self-describes, a Return-to **superset** injects
into the base as the **subset** whose links resolve there — base Circle Undone
gets 8 mementos, rttcu keeps 10, and per-item earned-state stays synchronized by
item id (key your storage off `(family, achievementId, itemId)`). Evaluate with
`evaluateAchievement` (returns per-item state + overall `earned`).

## Spoiler rule

Each entry's `text` is shown in the dropdown. `spoiler` is a list of substrings
to **blur until revealed**. The goal: someone browsing who hasn't finished the
campaign isn't shown major plot beats, yet a player transcribing their physical
log can still recognise each entry.

1. **Blur the plot-revealing part** — the specific noun/outcome the entry
   records (named bosses & twist NPCs, artifacts, faction reveals, endgame
   outcomes). E.g. `the investigators took custody of the Necronomicon.` →
   blur `the Necronomicon`.
2. **Keep it distinguishable** — leave enough of the sentence that the entry is
   still unique among its **siblings in the same section**. If blurring the noun
   would make two siblings collide, blur the differing outcome term instead, or
   blur less. E.g. the three professors who can be _kidnapped_ are told apart by
   name, so their names stay visible and only a deeper twist (Silas Bishop, the
   Experiment) is blurred.
3. **Don't over-blur** — front-loaded setup NPCs/places named in the intro or in
   a visible section title are not spoilers. Generic scaffolding (`the
   investigators were delayed…`) needs no spoiler at all.
4. Each span must be an **exact substring** of `text` (validated by `apply.mjs`).

See `curation/dwl.json` for the canonical demonstration of all four points.
