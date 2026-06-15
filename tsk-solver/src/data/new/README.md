# The Scarlet Keys — Campaign Planner Data

A data package for building a planner/simulator for the Arkham Horror: The Card Game
campaign *The Scarlet Keys*. It models every player choice, its consequences, the world
map, the travel graph, and the finale logic.

## Files

| File | What it is |
|------|------------|
| `logic.json` | All **language-independent** data: choice structure, effects, conditions, the finale vote table, the map graph (node positions, adjacency, wrap edges), time markers, side stories, and rendering parameters. |
| `en.json` | All **display strings** (English) plus lookup maps. Translate this file to add a language. |
| `scarlet_keys_map.webp` | The blank world map, 5100×3300 (lossless dimensions, WEBP q90). All node positions are fractions of this image. |
| `route_render.js` | Reference renderer for drawing a planned course (curves, arrows, the expedited-ticket warp). |

## Core idea: two files, bridged by IDs

`logic.json` holds *behaviour*; `en.json` holds *text*. They share stable, English-neutral
IDs (e.g. `SS.R2`, `log.laChicaOnYourSide`, `weepingLady`, `yborCity`, `ach.whatsInAName`).
Nothing in `logic.json` is language-bound, so:

- **To render text:** look it up by ID in the locale file.
- **To add a language:** copy `en.json` to e.g. `fr.json`, set `"locale":"fr"`, and translate
  the *values* only. Never touch `logic.json`, so behaviour can't diverge between languages.

```js
import logic from "./logic.json";
import en    from "./en.json";

// Example: a resolution option's display text + machine effects
const opt   = en.files["16-D"].decisions["SS.resolution"].options["SS.R2"]; // {dropdownText, fullText, condition}
const fx    = logic.files                                                    // → find SS.R2 in logic for its effects[]
```

---

## `logic.json`

Top-level keys: `files`, `locations`, `wrapEdges`, `timeMarkers`, `sideStories`, `routing`,
`mapImage`, `campaignLog`, `achievements`, `epilogueTally`, plus `_schema` (inline docs).

### `files` — the choices (29 entries: 26 lettered scenarios/interludes A–Z + Foundation, Epilogue, Status Reports)

```
files[] → { fileCode, mapCode, kind, keyAtStakeId?, decisions[] }
  decisions[] → { decisionId, decisionType, selectable, options[] }
    options[] → { id, selectable, effects[], conditionLogic, voteTable? }
```

- `decisionType`: `pre_scenario` · `interlude_directive` · `scenario_interlude` ·
  `resolution` · `conditional_outcome` · `scenario_version` · `time_scaling` · `vote_outcome`.
- `selectable: true` = the player actively picks this (render a dropdown).
  `selectable: false` = the game/state decides it automatically (just display the matching
  option); use `conditionLogic` to pick which one fires.

Display text for any decision/option lives in `en.json` at
`en.files[fileCode].decisions[decisionId]` (`label`, `prompt`) and
`...options[optionId]` (`dropdownText`, `fullText`, `condition` prose).

### `effects[]` — machine-readable consequences

Apply these to your campaign state; `fullText` is the human-readable version of the same.
Effect types (see `logic._schema.effects` / `en.legend.effects` for full notes):

| type | shape |
|------|-------|
| `record` / `crossOff` | `{type, entryId}` — set/clear a campaign-log entry (see `campaignLog`) |
| `tally` | `{type, entryId, delta}` |
| `key` | `{type, keyId, bearer}` — set a Key's bearer (`bearer` is a character ID, or the literal `"investigator"` = the player's chosen investigator) |
| `token` | `{type, token:'tablet'|'elderThing'|'cultist', delta}` |
| `trust` / `deception` | `{type}` — shorthand: trust = −1 elderThing +1 tablet (or +1 XP each if four tablets); deception is the mirror |
| `time` | `{type, delta}` |
| `xp` | `{type, scope:'each'|'lead', amount | victoryDisplay:true | variable+amountRef}` |
| `trauma` | `{type, scope, physical, mental}` or `{scope, amount, kind:'physicalOrMental'}` |
| `storyAsset` | `{type, asset, action:'add'|'remove', deckFree}` |
| `statusMarker` | `{type, symbol, offsetFromNow}` — write a Greek marker N spots ahead on the time track |
| `unlock` | `{type, locationIds[], fileCode}` |
| `card` | `{type, card, action, scope, weakness}` |
| `chaosTokenAdjust` | `{type, delta, choose}` |
| `campaign` | `{type, result:'win'|'lose'}` |
| `note` | `{type, textRef}` — free-form; text is in `en.effectText[textRef]` |

`variable` xp and `note` carry a `*Ref` whose text lives in `en.effectText`.

### `conditionLogic` — when an auto-resolved branch fires

Structured predicate (prose version is `en…options[id].condition`). Predicates include
`recorded`/`notRecorded` (a `log.*` id), `time {lt,lte,gt,gte,min,max}`,
`timeSinceMarker {symbol,…}`, `timeMarkerReached`, `countRecorded {anyOf[],gte/…}`,
`tally`/`tallyCompare`, `visited`/`notVisited` (fileCode), `voteTally`, `votedNay[]`,
`eerilySilentCount`, `noResolution`, `allDefeated`, `atOtherCity`, `random`,
`scenarioState` (an enum your scenario screen sets), and combinators `all`/`any`/`not`.
See `logic._schema.conditionLogic`.

### Finale (`59-Z`)

- `COTK.memberVotes` options carry a **`voteTable`**: ordered rows `{when:<conditionLogic>, votes:{characterId:'yea'|'nay'|'abstain'|'silent'}}`. First matching row wins.
- Tally per `_schema.voteTally` (tie = yea), then pick the judgment via `COTK.judgment.*`
  conditionLogic in the priority order given by `_schema.judgmentOrder`. The judgment sets
  the finale version (`COTK.version`).
- `epilogueTally` lists which `log.*` entries feed Foundation-Trust vs Cell-Deception for the
  epilogue outcome.

### `locations` (36) — map nodes + travel graph

```json
"yborCity": {
  "fileCodes": ["52-U"],
  "position": { "x": 0.206, "y": 0.335 },   // fractions of the map image
  "markerType": "scenario",                  // scenario | locked | sideStory | secret
  "positionConfidence": "detected",          // detected | verified | approx
  "connections": ["arkham","bermuda","bermudaTriangle","havana","newOrleans","sanJuan"]
}
```

- `position` × image size = pixel coordinates. Use for placing markers and hover hit-testing.
- `markerType` → marker style (suggested colors: scenario=blue star, locked=red dot,
  sideStory=green ring, secret=purple).
- `connections` = the official adjacency (71 undirected edges, 1 time each). A planner should
  restrict routes to these.
- Display name: `en.locations[id]`. To show a node's page code(s)/scenario name(s), follow
  `connections`/`fileCodes` and read `en.files[fileCode].title`.

### `wrapEdges` (3) — Pacific seam crossings

```json
{ "west":"sanFrancisco", "east":"tokyo",
  "westSeam":{"x":0.0,"y":0.2633}, "eastSeam":{"x":1.0,"y":0.2633} }
```

Don't draw these straight across the map. Draw two halves: `west → westSeam` (off the left
edge, x=0) and `east → eastSeam` (off the right edge, x=1), both bowing upward (see `routing.wrap`).

### `routing` — how to draw the planned course

- `curve`: `{ type:"quadratic", k:0.15, sign:1 }`. A leg between two nodes is a quadratic
  bezier; the control point = chord midpoint pushed perpendicular by `k · chordLength · sign`.
  **The control point is computed, never stored.** Direction-independent (endpoints taken in
  sorted order), so an edge always bows the same way.
- `edgeOverrides`: per-edge tweaks keyed by the two location IDs **sorted and joined with `|`**
  (e.g. `"istanbul|rome": {"sign":-1}`, `"bombay|cairo": {"sign":-1,"k":0.95}`). `sign` flips the
  bow side; `k` overrides the depth.
- `wrap`: `{ bowUpK:0.12 }` — wrap halves bow upward by `bowUpK · |node.x − seam.x|`.
- `warp`: expedited-ticket leg — `timeCost:0`, draw dashed with the warp glyph (it skips the
  printed route).

### `timeMarkers` (9) — the time track

`{ symbol, id, hasReport, reportOptionId, unlocksFinale?, forcesFinale?, timerOnly? }`.
Short label per marker is in `en.timeMarkers[id]`; the full report is the linked
`StatusReports` option in `en`. `δ` is a silent timer (no report).

### `sideStories` (5) — standalone scenarios at green nodes

```json
{ "id":"fortuneAndFolly", "locationId":"monteCarlo",
  "grantsKeyId":"wellspringOfFortune", "bearer":"investigator",
  "products":[ {"id":"fortuneAndFolly","timeCost":3} ] }
```

`timeCost` = the side story's normal XP cost, spent as **time** in this campaign. Product
display names are in `en.sideStoryProducts`. (Fortune and Folly is how the 11th Key, The
Wellspring of Fortune, enters the campaign.)

### `campaignLog` (81) / `achievements` (23)

`logic` holds the IDs (and a `type:"tally"` flag for tally entries); the text/name/description
is in `en.campaignLog` and `en.achievements`. `record`/`crossOff` effects reference these IDs.

### `mapImage`

`{ file, width:5100, height:3300 }` — the reference image and its size. All `position`/`seam`
values are fractions of these dimensions.

---

## `en.json`

Same `files` tree but values are strings (`title`, `location`, `note`, decision `label`/`prompt`,
option `dropdownText`/`fullText`/`condition`). Plus lookup maps:
`keys`, `characters`, `locations`, `timeMarkers`, `campaignLog`, `achievements`,
`sideStoryProducts`, and `effectText` (for `note`/variable-xp refs). `legend` documents the
effect/marker vocabulary for humans.

---

## Rendering the map & planned course

```js
import { coursePolylines } from "./route_render.js";

// 1. Place nodes:
for (const [id, loc] of Object.entries(logic.locations)) {
  const px = loc.position.x * mapW, py = loc.position.y * mapH;
  // draw marker by loc.markerType; tooltip = en.locations[id]
}

// 2. Draw a planned course (ordered array of location IDs the player visits):
const polylines = coursePolylines(route, mapW, mapH); // array of {x,y}[] in pixels
// stroke each polyline; put an arrowhead at the end of each (direction = route order).
// wrap legs return two polylines (off one edge, onto the other).
// expedited-ticket legs: render dashed + warp glyph instead (logic.routing.warp).
```

`route_render.js` exports `legPoints(a,b)`, `wrapLegPoints(a,b)`, `coursePolylines(route,w,h)`,
and `ekey(a,b)`. It reads `k`, `sign`, `edgeOverrides`, and `wrap.bowUpK` straight from
`logic.json`, so any tuning there flows through automatically.

## Notes

- A `bearer` of `"investigator"` is a sentinel (player's choice), not a character ID.
- The Bermuda Triangle (`56-Y`) is the secret scenario; it has no printed map marker
  (`markerType:"secret"`, position approximate).
- Marker/curve styling is cosmetic — none of it affects adjacency, time, or effects.
- Source: choice/consequence data summarized from the official FFG campaign guide; map
  coordinates verified against the FFG world-map sheet; adjacency from the ArkhamCards
  campaign data.
