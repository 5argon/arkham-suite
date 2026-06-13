---
name: tag-cards
description: >-
  Tag Arkham Horror LCG player cards in this package (@5argon/arkham-tags) with the
  game-effect taxonomy. Use when a contributor adds a new pack/set of cards and wants them
  tagged consistently with everything decided so far. Produces a typed src/tagged-cards/<pack>.ts
  that passes `tsc -b`.
---

# Tag a pack of Arkham Horror LCG player cards

You tag player cards by the **game effects in their text box** (plus a couple of stat-derived
tags), using the single source of truth for the taxonomy: **`reference/_taxonomy-digest.md`**
(every tag type and compound tag, with doc comments and the exact `TagType*` enum references).
Never invent a tag — if no existing tag fits an effect, omit it.

## Inputs

A worklist at **`json/untagged/<pack>.json`**: an array of `{ code, name, text, tags: [] }`.
Create it first if needed:

```
node script/scaffold-untagged.ts <pack> [input.json]
```

`input.json` (default `json/input/<pack>.json`) is `[{ code, name, text }]` for the new cards.
Scaffolding also writes an untagged `src/tagged-cards/<pack>.ts` and registers `<pack>` in
`src/tagged-cards/index.ts`.

## Procedure

1. **Read the taxonomy digest** `reference/_taxonomy-digest.md` in full. It is large; rely on it
   for the exact enum references and each tag's argument shape. Run `yarn digest` first if it
   looks stale.
2. **Read the worklist** `json/untagged/<pack>.json`.
3. For **every** card, fill its `tags` array with **TS object-literal expression strings** using
   the EXACT enum references from the digest. Examples:
   - `"{ type: TagTypeActionBold.ActionBoldFight }"`
   - `"{ type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat, value: 1, action: BasicAction.Fight }"`
   - `"{ type: TagTypeHeal.HealHorrorInvestigator, value: 1 }"`
   - `"{ type: TagTypeDeckSearch.DeckSearchYou, range: { type: \"top\", cards: 3 } }"`
4. **Assemble** the typed file (imports are derived automatically from your expressions):
   ```
   node script/assemble-tagged-cards.ts json/untagged/<pack>.json src/tagged-cards/<pack>.ts
   ```
5. **Validate**: `yarn build` (`tsc -b`). Fix every error — a malformed discriminant or a missing/
   wrong argument means the expression doesn't match the digest. Re-assemble and rebuild until green.
6. Optionally `yarn export-json` and spot-check in the consumer UI.

## Tagging rules (apply consistently)

- Tag the actual mechanical **effects, conditions, costs, timings, and restrictions** in the text.
  A unique condition (e.g. "exhausted enemy", "non-[[Elite]]", a "[[Monster]]" requirement) almost
  always has a dedicated tag in the digest — find and use it.
- **Stat-derived soak**: an asset with printed **health ≥ 2** gets
  `{ type: TagTypeSoak.SoakHealth, value: <health> }`; **sanity ≥ 2** gets
  `{ type: TagTypeSoak.SoakSanity, value: <sanity> }`.
- **`trait-support-X`** only when the card *mechanically supports* trait X (grants a trait-restricted
  slot, refills that trait's uses, boosts/cares about that trait's cards) — **NOT** merely because the
  card *has* the trait in its type line.
- **Cost icons matter**: `[action]` ammo/charge spend → `CostActionSpendCharge`; `[action]` supply →
  `CostActionSpendSupply`; the `cost-free-*` / `cost-reaction-*` spend tags are only for the
  `[free]` / `[reaction]` icon.
- **Arguments**: numbers as numbers; `BasicAction.{Fight,Evade,Investigate,Move,Parley}` for an
  `action` arg; `SkillType.{Combat,Agility,Intellect,Willpower}` for skill args; `TimingQualifier.
  {Before,When,AtIf,After}` for a `timing` arg; trait strings like `"Spell"`/`"Monster"`. A boost
  `value` may be a number or `"dynamic"`. Match every interface's required args exactly.
- Investigators and basic weaknesses usually get few or no tags — tag only genuine player-facing
  effects.

## Notes

- The taxonomy lives in `src/tags/**` + `src/compound-tags/compound-tags.ts`; the digest is generated
  from them (`yarn digest`). This skill *points at* that taxonomy — it does not duplicate it.
- Cards are tagged with **base tags only**; compound archetypes are derived from them by the query
  layer, so you never tag a compound directly.
- For a large pack, tagging in chunks is fine; the assembler accepts the whole worklist at once.
