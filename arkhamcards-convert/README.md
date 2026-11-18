# arkhamcards-convert

Development converter: ArkhamCards campaigns → an arkham.life Database (`.ahlifedb`).

ArkhamCards stores a guided campaign as the answers given at each guide step, not as a campaign
log. The converter replays those answers through the ArkhamCards app's own guide engine (bundled
from a local clone), then writes each campaign with arkham.life's own document and log-codec
functions.

## Setup

1. A clone of the ArkhamCards app at `~/Documents/ArkhamCards` (or pass `--arkhamcards`). Its
   dependencies don't need installing.
2. An export from `life/scripts/arkhamcards-export.mjs` in `~/Documents/arkhamcards-exports`.
3. `node engine/build.mjs` bundles the engine (`engine/dist/engine.mjs`) and the life functions
   (`engine/dist/life.mjs`, `engine/dist/life-check.mjs`). Rebuild after updating the clone or
   changing life's document, codec or campaign-data.

## Commands

- `node convert.mjs` writes a new Database with every convertible campaign next to the export,
  plus a `.report.json`.
- `node convert.mjs --into <saved.ahlifedb> --campaign ptc` converts only PtC and replaces the log
  (campaign log and Extra tab) of the matching records in a Database saved from life. Every other
  edit made in life (participants, guests, decks, title, dates, ticks) is kept. Records match by id,
  which is the ArkhamCards campaign's uuid. The new file is written next to the one given, not over
  it.
- `node check.mjs <file>` opens a Database the way life does and builds every profile from it.
- `node replay.mjs [--campaign <code>]` writes each computed ArkhamCards log to `out/replay/` for
  inspection.

## What comes across

- **Campaign log**: in the entry shapes life's editor writes per campaign-data section type (see
  `lib/logs.mjs`). Entries campaign-data doesn't define, mostly ArkhamCards' hidden bookkeeping, and
  free-text notes are left out and reported.
- **Extra tab** (`lib/extras.mjs`): resolutions, Victory Display (Experience total for Experience
  scenarios), skipped scenarios, side stories, and per-scenario choices. A choice is answered from
  the choose-one step that offers its options. The report lists each choice's coverage: one
  answered in no campaign is one ArkhamCards never asks.
- **Per-campaign Extras**: `extras/<campaign-data code>.mjs` exports
  `choices: { '<scenario>.<choiceId>': (ctx) => value | undefined }` for choices ArkhamCards
  records elsewhere (`extras/eoe.mjs` reads City of the Elder Things' version from a hidden log
  entry). Add one when campaign-data gains Extras, then rerun that campaign with `--into`.
- **People** (`lib/people.mjs`): every deck the owner attached is the owner's, as hands of a
  multi-handed play. Each other ArkhamCards account that attached a deck or is a campaign's member
  is a roster player, and a participant where they played an investigator (a member who only
  watched isn't). An investigator whose deck was detached goes to the
  ArkhamDB owner its upgrade and save steps name; an ArkhamDB user with no deck attached anywhere is
  the member every campaign they played leaves over, or else a roster player named
  `ArkhamDB user <id>` to rename. An investigator with no such step goes to the player of the one
  investigator it replaced in a scenario, or else to the one member its campaign leaves over (the
  owner included), or else to the owner. Members are read from each campaign's `members` in
  the export. `convert-people.json` next to the export keeps everyone's life uids and names and the
  play groups to create, so runs agree.
- **Decks**: every version of each upgrade chain, from the copies ArkhamCards' server keeps.
- **Dates**: start is the earlier of the campaign's creation and its first answer; finish is its
  last answer. A campaign with a scenario still to play (an unread epilogue aside) is a draft
  without a finish date.
- **Achievements**: ArkhamCards' ticks as manual ticks.
