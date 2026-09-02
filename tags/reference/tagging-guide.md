# Tagging Guide — how to tag a pack & resume from prior thinking

This package tags Arkham Horror LCG **player cards** by the game effects in their text box, as
type-safe TypeScript objects (see the top-level `README.md` for the data model). This guide is the
durable process + accumulated reasoning so that **adding a new card pack later resumes from
everything decided so far** rather than starting cold.

## The persistent knowledge (what makes resumption possible)

1. **The taxonomy itself** — `src/tags/**` + `src/compound-tags/compound-tags.ts`. The source of
   truth. Every archetype we discover becomes permanent, searchable vocabulary. It only grows.
2. **`reference/_taxonomy-digest.md`** — a regenerated concatenation of the *current* taxonomy
   (`yarn digest`). This is what you hand an agent so it knows what already exists and proposes
   only what is still missing.
3. **`reference/rules.md`** — the official Rules Reference (glossary) for terminology.
4. **`reference/discovery-reports.json`** — the per-pack gap reports from the first global pass.
5. **`reference/taxonomy-proposal.md`** + **`reference/_taxonomy-delta.json`** — the consolidated
   cross-pack delta: what was implemented (✅) and what is still proposed (⏳) for packs not yet tagged.

## Pipeline (per pack or batch)

1. **Discover** (read-only): for each pack, an agent reads the pack's cards
   (`json/input/<pack>.json` — `{code,name,text,…}`, where `text` is authoritative), plus
   `reference/_taxonomy-digest.md` and
   `reference/rules.md`. It proposes taxonomy GAPS (new tags / arguments / compound tags) with
   rationale + example codes. The first global run is saved in `discovery-reports.json`.
2. **Synthesize**: consolidate proposals across packs — dedupe, decide tag-vs-argument-vs-compound,
   place into folders. Output is `_taxonomy-delta.json` + `taxonomy-proposal.md`. (Human reviews.)
3. **Implement** the agreed delta in `src/tags/**` (+ `compound-tags.ts`), then `yarn sync-unions`
   and `yarn build` (green = the discriminated unions validate every tag).
4. **Tag** (Stage B): an agent emits each card's tags as TS object literals using the now-complete
   taxonomy; `script/assemble-tagged-cards.ts` turns that structured output into
   `src/tagged-cards/<pack>.ts` (it derives the imports, so agents can't get them wrong). Register
   the pack in `src/tagged-cards/index.ts` (one import + one spread).
5. **Verify**: `yarn build` (types), card-count reconciliation vs the pack's card list, unique codes
   across `allTaggedCards`, `yarn export-json`, and spot-check in the starter Tag Browser.

### To add a NEW pack (e.g. a future expansion)
`yarn digest` → run step 1 on just the new pack with the *current* digest → step 2 (most concepts
will already exist; only genuinely new mechanics surface) → steps 3–5. The digest guarantees the new
pass "thinks" with the full accumulated taxonomy.

## Judgment rubric

- **Argument vs new tag** — add an argument to an existing tag when the broad aspect is the
  searchable thing and the specific is just a filter (value / action / target). Make a new tag only
  when the specific effect is itself what a player searches for and nothing existing fits.
- **Compound vs tag** — a compound tag groups several DISTINCT base tags under a broader archetype
  players search together. Cards are NEVER tagged with a compound tag directly.
- **Consolidate / split** — merge near-duplicate proposals into one; split only for genuinely
  different aspects. Respect the deliberate structure (draw/search under `deck`; `testless` separate;
  no `deal` category; obvious-from-text things are intentionally untagged).

## Naming convention

Use **in-game terminology**, not jargon. e.g. the "look at the top N cards" mechanic is `deck-look-*`
(an investigator like Gloria Goldberg literally searches for "look at" effects), **not** "scry".
Tag names follow `TagType<Folder><File><Variant>`; enum string values are kebab-case.

## Archetypes catalog (the cross-pack themes, as compound tags)

Compound tags ARE the archetype layer. Implemented: `thorns`, `discard-self`, `support`, `clue-tech`,
`shroud-reduction`, `spend-resource`, `attack-mitigation`, `succeed-by`, `fail-by`, `investigate`,
`enemy-field-control`, `exile-package`, `into-play-cheat`, `deck-top-control`. Proposed (see
`taxonomy-proposal.md`): chaos-token control, card-search, draw economy, resource "big money",
evasion package, action economy, big-hand (Harvey), and more — these are implemented as their packs
are tagged, and existing compounds gain members over time.
