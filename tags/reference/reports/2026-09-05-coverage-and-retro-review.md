# 2026-09-05 — full-coverage pass and retro review

Handoff for the session that closed the player-card coverage gap and reviewed everything the
2026-07-17 autonomous bulk run had produced. Companion to
`2026-07-03-tcu-and-verification-sweep.md`. All work is uncommitted for review.

## Outcome

| | before | after |
|---|---|---|
| tagged cards | 1749 | 1851 |
| used tag ids / defined | 455 / 478 | 463 / 473 |
| compounds | 79 | 72 (10 removed, 3 split out — section 6) |
| lint | 0 err / 0 warn | 0 err / 0 warn, ratchet re-baselined |

## 1. Coverage — every player card in the card dump is now tagged

Duplicate-aware diff of `cards-json/pack/**` against the corpus found 109 untagged player cards; 103
were taggable (the rest are a story reference card and hidden promo duplicates of tagged investigators):

- **`parallel.ts` (51)** — the 13 parallel investigator packs: investigators, Advanced/Replacement
  signatures, Roland's five Directives, Lola's five Leading Ladies, Wendy's Tidal Memento, Jim's The
  Beyond. Regulation clauses stay untagged (behavior-restriction convention).
- **`promo.ts` (18)** — novella replacement signatures (Molly Maxwell, Ruth Westmacott, Green Man
  Medallion, Split the Angle, Nautical Prowess, Mysteries Remain, Foolishness, …) plus promo Marie
  Lambeau, Mystifying Song and Baron Samedi (tags copied from their text-identical Circle Undone
  prints). The six hidden promo investigator duplicates (Jenny, Roland, Norman, Silas, Dexter,
  Gloria) are not separate cards and were skipped.
- **`blbe.ts` (4)** — Subject 5U-21, Ravenous, Regurgitation, Reality Acid (89005 is a story
  reference card, excluded).
- **`rcore.ts` +16 / `dwl.ts` +13** — the Core and Dunwich investigators, signature weaknesses and
  basic weaknesses, under the convention every later cycle already followed (Revised Core codes
  015xx/016xx, mirroring the rest of rcore.ts).

Three widenings were needed: `buff-investigator-health/-sanity` take `DynamicValue` (parallel
Daisy), `chaos-treat-token-as` accepts cultist/tablet/elder-thing (parallel Necronomicon), and
`trait-support-talent` exists (parallel Jenny).

## 2. Taxonomy changes

New tags (all recorded in `rulings.json`, flagged AUTONOMOUS / REVIEW WELCOME):

- `doom-move` — resolves the OPEN doom-relocation cluster (Deafening Silence, Amina, Sin-Eater).
- `test-difficulty-increase {value}` — the deferred Drawing Thin one-off grew to 8 members.
- `test-difficulty-condition` — gates on the difficulty itself (Rise to the Occasion ×2, Signum
  Crucis, Exploit Weakness, Shed a Light, Called by the Mists, Old Keyring).
- `timing-after-seal-cancel-ignore-token` — resolves the OPEN TDC trigger (Agatha ×2, Oculus).
- `cost-reaction-spend-ammo` — the [reaction] member the ammo family was missing.
- `play-area-play-from-other-zone` gained zone `"deck"` (search, then play paying its cost).

Removed (defined but used by no card after 1851 cards; the nine framework `timing-phase-*` points
and `stats-mod-boost-lasting-willpower` were kept as systematic slots): `buff-stats-replace` (whole
file), `clue-additional-adjacent-locations`, `deck-discard-self`, `deck-discard-treachery`,
`deck-draw-replace-self`, `discard-pile-to-top-deck`, `encounter-reveal-choose`, `enemy-engage`,
`enemy-engage-related`, `location-your-clue`, bare `slot-additional`,
`timing-after-enemy-deal-damage-investigator`, `trait-support-creature`.

## 3. Retro review of the never-reviewed packs (962 cards)

tic, eote, tsk, fhv, tdc, the five investigator decks, Core 2026 and the five Return-to sets were
read card by card. ~100 fixes, applied in seven batches; the recurring classes (each then swept
corpus-wide):

- **Play ≠ into play** — 27 cards tagged `play-area-into-play-from-hand/-deck` whose text says
  "play … paying/reducing its cost" (Old Book of Lore, Joey, Leo Anderson, Dexter ×2, Tommy,
  Prestidigitation, Ever Vigilant, Motivational Speech ×2, Hold Up, Cosmic Revelation, …). Searches
  that play the card now use `play-from-other-zone{zone:"deck"}`.
- **Testless clue pairing** — 15 test-free discoveries lacked `testless-clue` (Evidence! 60120,
  Art Student, both Grete Wagners, Lucius Galloway, Lesson Learned, Carolyn 60251, …).
- **Reaction-window ammo** — Service Revolver, Thompson SMG, Isabelle's Twin .45s spent ammo inside
  a [reaction] but carried the [action] cost tag; the two follow-up shots also gained
  `action-additional-attack`.
- **Pump rate** — Sharp Rhetoric ×2 and Levelheaded ×2 carried a second `valuePerPump:2`.
- **Level-variant drift** — Psychoanalysis L3 (search → look), Physical Fitness L2 (missing move),
  Eye of Chaos L0 (testless clue), Cryptic Grimoire L4 (accumulate → self-place), Divination L4
  (additional → discover), Precious Memento (test-fail-by → skill-value-fail-by), Eon Chart L1.
- **Masks** — five of six FHV Masks lacked `limit-in-play{Mask}`.
- **Sealed-token spends** — Shards of the Void, Shield of Faith, Flute of the Outer Gods, Bulwark.
- **Difficulty increases** — Persuasion, Interrogate, Whispers of Doom.
- One-offs: Retribution's tank redirect, Lethal Curiosity's misread clue placement, Sacrificial
  Doll's auto-fail exclusion, Favor of Baalshandor's discounted play, Kicking the Hornet's Nest
  (printed health), Miguel's play-only action, Dead Ends' search reaction, Soul Link's horror
  cost, Meat Cleaver L0's reaction horror, Through the Gates' fake draw, Tinker's slot ignore,
  Beguile/Testing Sprint remote investigates, Living Ink's boost, Spiritual Echo (to-hand).

## 4. Text drift and stale artifacts

- 24 cards' text no longer matched the current dump (mostly Core 2026 rewordings); texts were
  updated. Mechanical consequences: Guts/Manual Dexterity/Overpower/Perception 12090–12093 now say
  the performing investigator draws (→ `deck-draw-investigator` + `commit-benefits-performer`);
  Premonition 12064 now seals a random token (→ `chaos-seal-token-any`, `before` window).
- `json/untagged/*.json` are now generated FROM the typed pack files by the new
  `yarn sync-worklists` (round-trip verified on tde and the hand-merged rcore), so they can no
  longer drift; the skill and README say so.
- `taxonomy-proposal.md` is rebuilt with live status (`build-proposal.ts` checks `src/tags`): 89
  implemented, 2 dropped, 3 still open (see below).
- Lint allowlist: two entries for the parallel cards (Roland's .38 Special both-values, Jim Culver's
  charge placement).

## 5. Still open (user calls)

- **Fedora 12087** has no text in any dump; it carries no tags. Verify the card.
- **"Spend as if on another asset"** (Cleaning Kit ×2, Lost Arcana, Typewriter, Ariadne's Twine's
  scope) has no tag; only the wallet family (`cost-alternate-payment`) covers paying card COSTS.
- **Investigator-specific token pools** (renown/rumor on André, arrow on Longbow, shell on Mauser
  Tankgewehr, time on Makeshift Trap, aether on Hyperphysical Shotcaster) are untagged under the
  Bounty ruling; say the word and they become `uses-starting-*` members.
- **Luger P08** spends ammo in a [fast] ability; no `cost-free-spend-ammo` exists.
- `customizable` is kept (17 members) although Myriad/Permanent are untagged — drop it if you
  prefer the deckbuilding-keyword rule to win.
- Still-proposed from the 2026-06 synthesis: `resource-move-investigator` (exists as
  `gain-resource-move-investigator`), `deck-top-control` compound, and the `treachery hurts you`
  concept the general ruling intentionally leaves untagged.
- Singleton/two-member tags were reviewed and left: the identical-member pairs
  (Mystifying Song, Jury-Rig, Trusted/The Star, Deny Existence) are distinct concepts that happen
  to co-occur. The single-tag compounds were dealt with in section 6.

## 6. Compound roster audit (same day, after coverage was complete)

Every compound's evaluated roster was dumped grouped by the member tag that pulled each card
in, and read in full (79 compounds, 5599 memberships). Three kinds of finding:

**Cards that did not belong** — always traced to one over-broad member tag, fixed at the
definition (or by splitting the base tag):

- Encounter Deck via `deck-shuffle-encounter`: Persuasion, Hypnotize, Intimidation, Close
  Call, Aetheric Current, Dark Insight, Stargazing only shuffle the deck after removing an
  enemy → member dropped.
- Discard Self via `discard-from-play-self`: 45+ weaknesses ("[action][action]: discard
  this") and expiring plumbing (Barricade, Intrepid, Enchanted Armor) → member dropped; the
  compound is now the discard-as-a-cost archetype (Beat Cop, Knife, Stray Cat).
- Doom Adding via `doom-add`: Dark Memory, Silver Twilight Acolyte, The Price of Failure,
  Fickle Fortune, To Fight the Black Wind place doom on the AGENDA → `doom-add` gained
  `target` (own-card / agenda / enemy) and the compound keeps own-card only.
- Into-Play Cheat via `play-area-play-from-other-zone`: Norman, Joe Diamond, Backpack,
  Stick to the Plan, Black Market pay full cost → member moved out; `play-ignoring-cost`
  moved in.
- Economy via the `play-area-into-play-*` trio: the tarot cards, Sleight of Hand, Hit and
  Run are not resource effects → members dropped.
- Big Hand via `hand-size-max-increase` with negative values: Drawing the Sign, Patrice,
  Pelt Shipment → new `hand-size-max-decrease`.
- Attack Mitigation would have inherited Oops! through `damage-redirect-attack` → the tag
  was split into `damage-redirect-attack` (Aquinnah: an enemy's attack) and
  `damage-redirect-own-attack` (Oops!, .45 Thompson (5)).

**Compounds that were aliases or strict subsets — removed (10):** enemy-field-control
(2 cards, ⊂ Enemy Nerf), shroud-reduction (⊂ Difficulty Reduction), self-harm-cost (union
of the damage/horror pair), healing (union of Heal Damage + Heal Horror), and the
single-tag aliases exile-package, multiclass-payoff, copies-matter, return-to-hand,
failure-prevention, getaway (its `enemy-engage-disengage` now sits in Evasion Package).
Two that were single-tag were widened instead: Attack Mitigation (+ cannot-attack-you,
enemy-cannot-attack, damage-redirect-attack) and Investigate Payoff (+ after-discover-clue).

**Compounds too wide — split (3 new):** the four stat boosts shared the 119 stat-agnostic
`*-any` cards, so Agility/Intellect/Combat Boost overlapped at Jaccard 0.4–0.5 → Skill Value
Boost holds the `any` family and Willpower Boost completes the set; Testless Damage (direct
damage without a test, 60 cards) was split out of Efficient Damage, which is now the
+damage / extra-attack / redirect family. Bold Action (406) and Exhausts (366) are wide by
design and were left.

Result: 72 compounds, 463 used tag ids, lint 0 err / 0 warn, ratchet re-baselined. Dead
where-filters on Tome/Relic/Ally Support were also removed.

## 7. Adversarial review of the whole game (2026-09-05/06)

31 hostile reviewer agents each re-read one ~60-card chunk against the digest, reporting only
findings they could defend with a card quote and a definition clause plus a precedent card. 323
findings came back; 9 chunks also got a skeptic pass (44 findings judged: 40 upheld, 3 refuted, 1
unsure), after which the skeptic stage was stopped as not worth its cost and the remainder was
adjudicated by hand. Result: 366 edits across ~300 cards, one new tag (`stats-mod-pump-ammo`), 13
new rulings, lint 0 err / 0 warn, ratchet re-baselined; build 464 used tag ids, 72 compounds.

Recurring classes (each swept corpus-wide, ruling recorded under the tag):

- **Own-Fight/Evade success riders** use `-during-an-attack` / `-during-an-evade` (16 cards
  aligned; the redundant plain tag dropped from Blinding Light ×2 and Fire Extinguisher).
- **Pre-reveal windows** "When you would reveal a chaos token" → `timing: Before` (Codex of
  Ages, Olive McBride ×2, Premonition, Katarina Sojka).
- **Scope tags**: "skill test at your location" → `location-your-investigator` (7 cards); "enemy
  at your location" beside testless damage → `location-your-enemy` (4 cards).
- **Cost discard ≠ self-discard**: `discard-from-play-self` removed where the only discard is
  an ability cost (6 cards); Decoy Trap / Glassing moved to `cost-reaction-discard-self`.
- **"Last clue" triggers** → `location-clue-zero` (6 cards); **Footwear** → `limit-in-play`.
- **reducedeffect vs noneliteonly**: Spectral Razor ×2 / Drain Essence's "(+2 instead if
  non-Elite)" still works on Elites.
- **chaos-symbol-payoff** on every symbol-keyed bonus (17 cards), **deferred self-exhaust
  riders** (6 cards), **"After this test ends"** → st8{after} (5 cards), **ammo pumps** (BAR,
  Gatling Gun were `pump-charge`), **twin drift** (Eon Chart (4) bold actions, Microscope (0),
  Deny Existence (0), Council's Coffer play≠into-play, Studious ×2 draw, Keen Eye ×2 pump, …).

Refuted (kept as-is): Blackjack fail-condition, Roland's per-clue elder sign, Showmanship
enters-play, Lure L1 duration (the L2 tag was the outlier), Failed Experiment fail-by (weakness),
Jenny's Twin .45s defeat window and Momentum's success condition (both rejected by lint rules).
Reviewer inputs, findings and verdicts: scratchpad `adv/` (chunk-*.txt, findings.json,
triage*.txt, ops-final.json); the workflow script is under the session's workflows dir.
