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

## ⚠️ The cardinal rule — read the text, judge by the DEFINITION

Almost every tagging mistake this project has made came from one failure mode: **pattern-matching
on words instead of reading what the card actually does, then trusting a tag's NAME instead of its
definition.** Do not do this.

1. **Read the whole card text and work out the actual mechanic** before you tag anything. A word
   appearing in the text (`bottom`, `cancel`, `charge`, `connecting`, `discard`, `weakness`) is
   **not** a reason to apply a tag whose name contains that word.
2. **Every tag is judged by its doc comment in the digest, not its name.** Many tag names are
   actively misleading. If a tag *looks* like it fits, open its definition and confirm the mechanic
   matches. When a tag's definition doesn't fit any effect on the card, the tag is wrong — omit it.

The digest carries three defenses against this failure mode — use all three:
- **MEMBER lines** under every tag: the confirmed cards that carry it, with the text that earned it.
- **RULING lines**: binding convention rulings from past reviews (also editable in
  `reference/rulings.json`, keyed by tag id — see "Rulings file" below).
- **NOT A MEMBER lines**: adjudicated anti-examples with the tag to use instead.

## ⚠️ The second cardinal rule — cite a precedent, or flag it

For **every tag you apply**, you must be able to point at one existing member card whose text
earned the tag the same way (the digest's MEMBER lines, or
`node script/find-precedent.ts <code | text…>` which prints the most similar confirmed cards with
their tags, plus all same-named level variants). If **no precedent exists**, do not get creative:
either the tag's definition unambiguously fits (a genuine first member — note it as such), or the
effect goes on the **noFit list** for the user to adjudicate. New packs may only *extend* existing
patterns; they never silently invent them. The noFit list is where genuinely-new mechanics (and
proposals for new tags) belong.

## Calibrate before tagging a new pack

Before touching the new pack, blind-tag ~15 randomly sampled cards from the CONFIRMED corpus
(pick codes from `json/export/cards.json`, hide their tags, tag from text alone) and diff your
answers against the truth. Every miss is a convention you were about to misapply across the whole
pack — re-read that tag's digest entry and rulings before proceeding. Report the calibration result
to the user first.

Real examples that were mistagged by word-matching (all fixed — learn the shape, don't repeat it):

| Card text | Wrong (word-matched) | Right (by definition) |
|---|---|---|
| "…place the looked-at card on the **bottom**" (looks at the *top*) | ~~look at the bottom~~ | `deck-look-place-bottom` = *move* a looked card to the bottom |
| gun: "spend 1 ammo: Fight" | ~~`cost-action-spend-charge`~~ | `cost-action-spend-ammo` (charge ≠ ammo) |
| "Cancel all of that card's **effects**" | ~~`cancel-encounter-draw`~~ | `cancel-encounter-effect` (the draw isn't cancelled) |
| On the Hunt: "**Instead**, search the top 9…" (no "cancel" in the box) | ~~`cancel-encounter-draw`~~ | it *replaces* the draw — a search, not a cancel |
| "discard all cards in your threat area" | ~~`cancel-treachery-in-play`~~ | `discard-treachery-in-play` (removal, not a cancel) |
| Maleson: "place 1 of **your** clues on your location:" (a reaction cost) | ~~`clue-place-your-location`~~ (that's *beneficial* placement) | `cost-reaction-spend-clue` |
| "Move that investigator **to** a connecting location" | ~~`connecting-location-investigator`~~ | just a `move-investigator-*`; the connecting tag is only for an investigator/enemy located **at** a connecting location |
| Blackjack: conditions on "an enemy engaged with **another** investigator" | ~~`engage-effect`~~ (causes no engagement) | `engage-with-another` (a targeting scope) |
| Intrepid: asset that discards at end of round | ~~`stats-mod-boost-passive`~~ | a boost that *expires* is lasting/duration, not passive |

## Know the game rules and keywords first

You cannot tag correctly from the English of the text box alone — you must know what those words
MEAN under the Arkham Horror LCG rules. The full rules reference ships in this package at
**`rules.html`**; read the relevant part whenever a tag's meaning hinges on a rules concept.

- **Ability types.** A **Forced** ability (bold "Forced") is *mandatory* and auto-initiates on its
  timing point. A **Triggered** ability is prefaced by an icon, and there are exactly three:
  **[action]**, **[free]**, and **[reaction]**. A **Constant** ability is always-on. **Fast** is a
  separate *keyword* — an event/ability playable during a player window without spending an action.
  Consequence: a *timing window* (e.g. "when you would take damage") is neutral; how a card responds
  to it — a Fast event (Devil's Luck), a **[reaction]** (Armor of Ardennes), or a **Forced** ability
  (Sophie) — is a **separate axis**. Never bake "forced" into a window tag just because one member is
  Forced (`timing-when-take-damage`, not `timing-forced-when-take-damage`).
- **Keywords** (Aloof, Retaliate, Hunter, Elusive, Massive, Peril, Bonded, Exceptional, Permanent,
  Myriad, Composure, Trap, Seal, Bless/Curse, …) each have a precise rules meaning — check the
  glossary before tagging an effect that references one.
- **Card designations are not traits.** "Weakness" and "Elite" are card classifications, not traits;
  a **trait** is only what's printed in the trait line (Monster, Humanoid, Tome, Spell, …).
- **Phase/step structure** (mythos → investigation → enemy → upkeep; skill-test steps ST1–ST8) is
  what the timing tags reference.

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

0. **Calibrate** (see above) — blind-tag a confirmed sample, diff, report.
1. **Read the taxonomy digest** `reference/_taxonomy-digest.md` in full. It is large; rely on it
   for the exact enum references, each tag's doc comment (the *meaning*), its argument shape, its
   confirmed MEMBERS, and its RULING / NOT-A-MEMBER lines. Run `yarn build && yarn digest` first
   if it looks stale (members come from the built corpus).
2. **Read the worklist** `json/untagged/<pack>.json`.
3. For **every** card: read its text, run `node script/find-precedent.ts <code>` (same-named
   variants + most similar confirmed cards with their tags), then fill its `tags` array with
   **TS object-literal expression strings** using the EXACT enum references from the digest —
   citing a precedent (or noFit-flagging) per the second cardinal rule. Examples:
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
6. **Lint**: `yarn lint-tags` (optionally `--pack <pack>`) — deterministic checks encoding every
   past fix-class (duplicate tags, ammo-vs-charge, replenish caps, margin riders, stat-derived
   icon tags, same-text twin drift, …) plus the **compound ratchet** (which cards joined/left each
   archetype vs `reference/compound-membership.json`). Adjudicate every ERROR/WARN: fix the card,
   or — only when genuinely legit — add an entry with a `note` to `reference/lint-allow.json`.
   When the compound joins/leaves are all confirmed, re-run `node script/lint-tags.ts --snapshot`.
7. **Tag-major review**: for each tag the new pack uses, re-read its full member list in the
   fresh digest (`yarn digest`) — old and new members side by side is where convention drift
   shows. Then verify against the JSON export (below).

## What a tag IS — and what it ISN'T

- A tag **IS** a concrete mechanical thing the card *does*: an effect, a cost (before the colon), a
  condition/restriction, or a timing window. If two cards do the same mechanical thing, they share
  the tag regardless of wording.
- A tag is **NOT** a keyword or word that appears in the text, **NOT** a consequence you infer that
  the card doesn't actually state, and **NOT** a compound archetype (you never write those — see
  Compound tags).
- Prefer the tag that matches the **specific sense**. If a concept has variants (target *at* a
  location vs *move to* it; a *cost* vs a *benefit*; *ammo* vs *charge*; the *drawing* vs the
  *effects* of an encounter card), the wrong variant is a real bug even if it's "close".

## Tag groups (categories) — what each family represents

A tag's **group is its top-level folder** under `src/tags/` (e.g. `heal`, `cancel`, `buff`). The
group is a promise about what kind of thing the tag is. Pick the group by **what the card does**,
not the noun in the text. Groups that have caused confusion (some were regrouped this project):

- **`cancel`** — NEGATE or PREVENT something from happening (an attack, a draw, an effect, a
  revelation). It is **not** "get rid of something already in play" — discarding/removing an in-play
  treachery is `discard` (`discard-treachery-in-play`), not cancel.
- **`buff`** — a lingering beneficial **status on YOU** (e.g. `buff-cannot-attack-you`,
  `buff-cannot-engage-you`, stat replacements). "Enemies cannot attack/engage **you**" is a buff on
  you, **not** an enemy debuff.
- **`enemy`** — interacting with a specific enemy: engage (`engage-effect` = you cause engagement;
  `engage-with-you/-another` = who; `engage-target-engaged` = conditions on an already-engaged
  enemy), debuff, mitigation, its values (`enemy-value-*`), restrictions (`enemy-trait-restriction`
  = a printed TRAIT only; `enemy-nonweakness`, `enemy-elite` are separate — "Weakness"/"Elite" are
  NOT traits).
- **`uses`** — use-token pools: `uses-starting` (printed pool), `uses-replenish` (auto/triggered
  refill of a **capped** pool, "replenish at the start of each round"), `uses-support` (place/move
  tokens on **OTHER** cards, e.g. Extra Ammunition), `uses-self-place` (place a token on **itself**,
  e.g. .18 Derringer/Chainsaw refunding on a miss), `uses-accumulate` (grow a counter from empty).
- **`location`** — movement, connections, shroud, clues, your-location scope. `connecting-location-*`
  means an enemy/investigator located **at a connecting location** (a targeting scope) — **not** a
  move destination (moving *to* connecting is a normal `move-investigator-*` effect).
- **`cost`** — what you pay before the colon of an `[action]`/`[free]`/`[reaction]` ability; the icon
  picks the family, and the **use-token type matters**: `-spend-ammo` (firearms), `-spend-charge`
  (spells/charges), `-spend-supply`, `-spend-secret`, `-spend-resource`, `-spend-clue`.

## Tag naming convention — group-prefixed, but a FLAT namespace

- **Every tag id is `<group>-<meaning>`**, where `<group>` is exactly its folder under `src/tags/`:
  `enemy-elite-noneliteonly`, `location-connecting-enemy`, `location-move-investigator-self`,
  `timing-phase-mythos-draw-encounter`, `clue-discover-your-location`, `heal-damage-ally`. The
  English display name mirrors it as **`Group/Meaning`** ("Enemy/Elite Noneliteonly",
  "Heal/Damage Ally", "Timing/When Take Damage").
- **This is a FLAT namespace, not a hierarchy.** The group prefix (and the slash) is purely a
  findability/clustering convention so same-group tags sort and browse together — the browser also
  shows the group in its own column. `enemy-elite-noneliteonly` is NOT a child of any `enemy` tag;
  tags have no parent/child relationships. Read the slash as "grouped by name", never as nesting.
- **When you add a tag**, its id MUST start with its group folder and its display name is
  `Group/Meaning`. If a concept needs a new group, that's a new folder under `src/tags/` (+ its
  `index.ts` barrel), and the tag is `<newgroup>-<meaning>`. Never introduce an id that doesn't lead
  with its group (that's what made `elite-noneliteonly`/`connecting-location-enemy` unfindable).

## Compound tags — derived, never written by hand

- **You never put a `c-*` compound tag on a card.** A card belongs to a compound iff it carries the
  compound's member base tags (some members are arg-filtered with a `where`, e.g. Big Money's
  `condition-resource` only counts `{comparison:"min"}`). Compounds live in
  `src/compound-tags/compound-tags.ts`.
- **The base-tag blind spot:** when you tag a card you see its base tags but NOT which compounds they
  roll into. A perfectly reasonable base-tag combo can silently land a card in the wrong archetype.
  Always check compound membership in the JSON after tagging.
- **False positives come from an over-broad member tag.** Real fixes we made (the pattern to watch):
  Chaos Token Control dropped `chaos-reveal-manual` (reveal-and-hope gambles control nothing);
  Support dropped `your-location-investigator` (looking at your location ≠ supporting others);
  BigMoney dropped `uses-accumulate` (card-local tokens ≠ your resource pool); Getaway dropped
  `aoo-no-provoke`; Economy dropped `play-from-other-zone`; ProtectorTank dropped `ready-ally`
  (readying an ally isn't tanking). If a compound's card list contains a card that clearly isn't that
  archetype, find the one member tag dragging it in.
- **⚠️ Editing a compound's member list re-evaluates EVERY card that carries those tags — not just
  the card you were looking at.** Whenever you add, remove, or `where`-condition a member tag, dump
  the compound's full card list from the JSON **before and after** and confirm every card that JOINS
  or LEAVES is correct. Removing a member can wrongly drop legitimate cards; adding one (or a `where`)
  can wrongly pull others in, or silently drop cards whose args don't match the filter. Do this for
  BOTH compounds when a base tag is renamed/moved (it may be a member of several).

## Verify against the JSON export — not in your head

After tagging: `yarn build && yarn export-json`, then query **`json/export/cards.json`**. Each card
there lists its base tags AND its **evaluated compound memberships** (the `c-*` entries) — the only
place the compound evaluation is visible. Reason from this file, don't simulate compounds mentally.

Cheap high-value checks (write a tiny node script over the JSON):
- List every card in a compound, and confirm they all belong.
- Find identical adjacent tags on a card (a duplicate is a bug — see below).
- Find a `value:N` that disagrees with a sibling card of the same family.
- Confirm a base tag's member list is exactly the cards you expect.

## Tagging rules (apply consistently)

- Tag the actual mechanical **effects, conditions, costs, timings, and restrictions**. A unique
  condition ("exhausted enemy", "non-[[Elite]]", a "[[Monster]]" requirement) almost always has a
  dedicated tag — find and use it.
- **Stat-derived soak**: printed **health ≥ 2** → `{ type: TagTypeSoak.SoakHealth, value: <health> }`;
  **sanity ≥ 2** → `{ type: TagTypeSoak.SoakSanity, value: <sanity> }`.
- **`trait-support-X`** only when the card *mechanically supports* trait X (grants a trait-restricted
  slot, refills that trait's uses, boosts/cares about that trait's cards) — NOT merely because the
  card *has* the trait in its type line.
- **Cost tags — match the use-token**: `[action]` spending **ammo** → `CostActionSpendAmmo`; **charge**
  → `CostActionSpendCharge`; **supply** → `CostActionSpendSupply`; etc. The `cost-free-*` /
  `cost-reaction-*` spend tags are only for the `[free]` / `[reaction]` icon.
- **Variable amounts use `"dynamic"`**, never a numeric sentinel. `value`, `amount`, `difficulty`,
  and a search range's `cards` are all `number | "dynamic"`.
- **Never emit two identical tags** — they're indistinguishable and get deduped, so they carry no
  extra information. Instead:
  - additive base + conditional bonus with **equal** increments (base +1, empowered/conditional +1)
    → a **single** tag at the **ceiling** (`value:2`) plus the condition tag (Enchanted Blade,
    Lupara, Beretta, Liquid Courage);
  - "**N or M instead**" (replacement) → two tags with the **different** values (`value:1` AND
    `value:2` — Deduction, Fearless, Vicious Blow);
  - two **separate** abilities doing the same thing → one tag suffices.
- **Discriminator args**: when the same effect applies to different stats/actions, use the arg to
  distinguish (boosts and `stats-mod-set-base` take `action`; Duke's base-combat-4 and
  base-intellect-4 must differ by `action`, not be two identical tags).
- **Arguments**: numbers as numbers; `BasicAction.{Fight,Evade,Investigate,Move,Parley}` for `action`;
  `SkillType.{Combat,Agility,Intellect,Willpower}` for skill args; `TimingQualifier.{Before,When,AtIf,
  After}` for `timing`; trait strings like `"Spell"`/`"Monster"`. Match every interface's required
  args exactly.
- **Investigators and basic/story weaknesses** usually get few or no tags — tag only genuine
  player-facing effects; don't tag a boring weakness just because it has a cost (e.g. skip
  `cost-action-multiple` on uninteresting weaknesses).

## Rulings file — where adjudicated judgment lives

`reference/rulings.json` is the durable, by-tag home of every convention ruling and anti-example.
The digest builder inlines each entry under its tag
and **validates every key** (exact tag id, a `prefix-*` key, or `_general`), so a stale key after a
rename fails the digest build. **Whenever the user makes a new ruling during review — or you
establish one — append it here immediately**, then `yarn digest`. Cross-check
`reference/lint-allow.json` too: if a ruling makes a lint warn class conditionally legit, the
allowlist entry's `note` should say why.

## Notes

- The taxonomy lives in `src/tags/**` + `src/compound-tags/compound-tags.ts`; the digest is generated
  from them + the built corpus + `reference/rulings.json` (`yarn digest`). This skill *points at*
  that taxonomy — it does not duplicate it. If you add a new tag file/folder, add its `index.ts`
  barrel and re-run `yarn sync-unions`, then `yarn build && node script/seed-strings.ts &&
  yarn build-strings`.
- Cards are tagged with **base tags only**; compound archetypes are derived, so you never tag a
  compound directly. The digest's tail lists every compound's EVALUATED member roster; the lint
  ratchet reports joins/leaves.
- For a large pack, tagging in chunks is fine; the assembler accepts the whole worklist at once.
- Tooling quick reference: `yarn digest` (regenerate the digest), `yarn precedent <code|text>`
  (find precedent), `yarn lint-tags [--pack <p>] [--snapshot]` (fix-class checks + compound
  ratchet), `yarn build` (typecheck + JSON export).
