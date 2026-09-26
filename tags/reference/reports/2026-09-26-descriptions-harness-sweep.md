# 2026-09-26 — Player descriptions, harness upgrade, full-game sweep

Three pieces of work, done in an order where each feeds the next: player-facing descriptions →
harness tools that use them → a card-by-card sweep of all 1851 cards with those tools. A fourth
followed your review: weaknesses are no longer tagged (§5). All of it is uncommitted for review. Build green, `yarn lint-tags` 0 errors / 0 warnings, compound ratchet
re-baselined.

The test applied throughout is the one the tags exist for: **a player holding a card should reach its
functional peers — sidegrades, replacements — through its tags and compounds, and a tag's members
should be what its description promises.** (Ward of Protection → Treachery Handling + Self Harm Horror.)

## 1. Descriptions (what the Tag Browser shows)

- **All 462 tag descriptions** written fresh for players (356 were empty; the rest were developer
  notes — tag ids, "split from…", some outdated). Style: one sentence, game terminology, icons as
  words, one real member as the example, no jargon. Written from each tag's JSDoc + rulings + actual
  members, then reviewed.
- **All 49 group descriptions** (7 empty, several stale — "rfg … not recoverable", "timing … forced")
  and the compound descriptions (bracket icons → words).
- **Dead keys found**: the 2026-09-05 audit had written its updated compound descriptions under
  `desc_tag_compound_*`, a key the reader never used — the browser still showed the older text. Moved
  to the live `desc_compound_*` keys last pass; now a lint check prevents it recurring.
- JSDoc drift the description writers caught and fixed: `cost-discard-card` (also discarding an
  asset you control), `clue-additional-this-location` (any discovery, not only investigations),
  `skill-commit-skill-double-icon` (2 or more), `testless-damage-engaged-enemy`, and a JSDoc for
  `chaos-reveal-before-effect`.

## 2. Harness

What a whole-corpus review needed and I had to improvise last session is now tooling
(`.claude/skills/tag-cards/SKILL.md` → "Reviewing tagged cards and bulk fixes"):

| tool | what it does |
|---|---|
| `yarn glossary` | `_tag-glossary.md`: one line per tag/compound (name, members, args, description) — ~110k chars vs the ~800k digest, small enough for an agent to hold whole |
| `yarn corpus` | `_corpus.tsv`: one card per line with tags + compounds — the grep target |
| `yarn roster <tag / c-compound>` | every member with text; for compounds, which member tag pulled each card in |
| `yarn suggest` | tags a card's most textually similar cards carry but it lacks — the "tagged before the mechanic had a tag" signal |
| `yarn apply-ops <ops.json> [--check]` | bulk card edits from plain tag objects; renders exact enum expressions, refuses unknown ids / args / enum values / duplicates / absent targets; re-assembles only touched packs |

- `script/lib.ts` gained the shared pieces: tag-definition parser (enum refs, JSDoc, argument types),
  expression renderer, TF-IDF (now shared with `find-precedent`). Verified: the renderer reproduces
  all 9,731 existing tag expressions byte-for-byte.
- New lint checks: **compound-dead-member** (a member / where-filter matching no card),
  **i18n** (missing or empty names/descriptions, dead message keys), **success-variant**
  (`skill-test-condition-successful` next to its attack/evade variant — the drift class the sweep kept
  finding), **unused-tags** (INFO).
- `seed-strings.ts` no longer carries its stale hand-written description dictionaries (they still
  described deleted compounds); it seeds empty keys and lint enforces filling them.
- The digest shows each tag's player description; the skill, `tagging-guide.md` and README state the
  purpose of the tags and the review workflow (including that subagents must return findings as JSON —
  they cannot write files).
- Bugs found in my own new tooling during the run, fixed: an empty `{}` interface body swallowed the
  next interface's fields; `apply-ops` didn't catch the same tag added by two ops in one batch
  (lint caught the resulting duplicate on Farsight).

## 3. Full-game sweep

18 reviewers, ~103 cards each, in release order (Revised Core first, so the oldest cards were judged
against every later tag), each with the glossary, the corpus, `yarn suggest` hints and reviewer notes.
They returned edits as JSON; every one went through `apply-ops --check` and was read against the card.

- **98 edits proposed, 94 applied**, plus **32 follow-ups** of mine (twins, the same class elsewhere) —
  **126 edits on 124 cards**, and compound fixes below. Six reviewers hit the usage limit mid-run and
  were re-run.
- Recurring classes:
  - **chaos-symbol-payoff** on symbol-keyed rewards the 09-06 sweep missed — reaction payoffs (Jim's
    Trumpet ×2, Ritual Candles ×2, Jewel of Aureolus, Jim Culver 90049, Diabolical Luck) and manual
    reveals (Rod of Carnamagos ×2, Speak to the Dead, Gaze of Ouraxsh, Manipulate Destiny, Ward of
    Radiance, Absolution).
  - **One success clause, two variant tags** (Survival Instinct ×2, Bait and Switch, Silas's Net, Ice
    Pick) and own-Evade/Fight riders on the plain tag (Shadowmeld ×2, String Along, Bend Blood, Decoy
    Trap, Unspeakable Oath) → now lint-guarded.
  - **Deferred self-exhausts** inside action abilities (Old Compass ×2, Pocketknife, Polished Cane,
    Local Map, Empirical Hypothesis).
  - **Early cards missing later tags**: Scavenging and Prof. Webb ×2 → `recursion-asset`; Tommy Muldoon
    → `play-area-to-deck`; Eucatastrophe ×2 → reveal-auto-fail; Empty Vessel / Dial of Ancients →
    `uses-accumulate`; Gray's Anatomy's heal/damage amplification; Friends in Low Places is a search,
    not a draw.
  - **Action-free plays** — `gain-fast-other` widened from "gains fast" to any play of another card
    without an action: Joey "The Rat" Vigil ×2, Dexter Drake ×2, Custom Grip, Farsight, Marion Tavares,
    Leading Lady ×5 (joining Fence, Directive, Daisy's Tote Bag).
  - **"Any investigator anywhere" scope** now carries `location-your-investigator` so teammate-help
    cards are findable (Ward of Protection (2), Psychic Sensitivity, Money Talks (2), Sacred Covenant,
    Ravenous Myconid, "Let me handle this!").
  - ~~Treachery-weakness light convention filled in~~ (Final Rhapsody ×2, Stars of Hyades, Frenzied,
    Disruptive Poltergeist, Maimed Hand, Back Injury, The Silver Moth, Vow of Drzytelech, Dark Future,
    Wounded Bystander, Selfless to a Fault). Superseded: weaknesses are now untagged (§5).
- **Compound fixes**: `location-move-damage` → Testless Damage + Health Safety (Drain Essence, The
  Home Front, Stouthearted, Forbidden Tome); `damage-instead-range` → Efficient Damage (the Shotguns);
  `encounter-offload` → Treachery Handling; `gain-aloof` → Enemy Nerf. auto-evade vs testless-evade got
  a written boundary (three reviewers independently flagged them as looking identical).
- **Correction after review**: Typewriter and Cleaning Kit ×2 were first tagged
  `uses-support-*{supportType:"move"}` for "may be spent as if they were on <other assets>" — wrong, the
  tokens stay on the card. `supportType` gained `"pool"` for these shared pools; Typewriter, Cleaning
  Kit ×2, Lost Arcana (previously missed) and Ariadne's Twine's first clause carry it, and a new
  `shared-pool` lint check ties that wording to the tag (the 09-05 report's open "spend as if on
  another asset" item is now closed).
- Rejected / held: Ariadne's Twine spend-tag removal (converting uses into resources counts as
  spending them — ruled); Fake Credentials (below). The two weakness strips became moot (§5).

## 4. Needs your call

**Weakness tagging (G9 in the 09-25 report)** — resolved by your ruling; see §5.

**Margin penalties.** The 09-26 ruling untagged "if you succeed by 0, lose X" penalties, but Lockpicks
×5 and Suggestion ×2 deliberately carry `skill-value-succeed-by-or-more{2}` for "if you do not succeed by
at least 2, lose a use", and Fake Credentials has the same wording untagged. Keep them (they define a
margin André players target) or strip them — either way one ruling.

**New tags the sweep found missing** (concepts with several cards and no home — each is a replacement
path players currently can't follow):

| concept | cards |
|---|---|
| heal-DAMAGE payoff window (twin of `timing-after-heal-horror`) | Vincent Lee, Surgical Kit |
| defeat save ("when you would be defeated") | Cheat Death, St. Hubert's Key (+ Perseverance, Talisman of Protection) |
| boost ANOTHER investigator's test / team-wide buff | Police Dog ×2, Encyclopedia, Girish Kadakia, Hunter's Mark, Making Preparations, Eyes of Valusia |
| payoff for placing your clues | Research Notes, Press Pass |
| payoff for discarding from hand | Lawrence Carlisle, Ample Supplies, George Barnaby |
| scales with damage / horror ON you | Agnes Baker, Calvin Wright, Fight or Flight, Mark Harrigan, Rough, Providential |
| better at treachery / scenario tests | Tooth of Eztli, Tennessee Sour Mash ×3, Levelheaded ×2, Know the Line, Dreams of the Clay |
| "deals X damage instead" attacks | M1918 BAR, Sled Dog, Brand of Cthugha ×2 (no damage tag at all) |
| payoff for cancelling / ignoring anything | Diana Stanley |
| lower an enemy's damage / horror value | Mind Wipe |
| deal horror to an investigator (twin of `damage-to-investigator`) | Scroll of the Pharaohs (the weaknesses that did it are now untagged) |
| offering costs / support (cost-action-, cost-reaction-spend-offering, uses-support-offering) | Speak to the Dead, Twilight Diadem, Wicked Athame |
| reveal-until tutors (no "search" wording) | Molly Maxwell, Daredevil |
| multi-play for one action | Ever Vigilant ×2, Geared Up, Ethereal Weaving |
| one-offs | Double or Nothing (resolve success twice), Time Warp (undo), Spiritual Echo (remote activate), Katja Eastbank (card storage), Versatile / Underworld Support (deckbuilding), Embezzled Treasure (cross-scenario resources), Self-Sacrifice (absorb a teammate's failure) |

**Smaller structural questions**:
- `enemy-engage-effect` and `enemy-engage-with-you` have nearly identical rosters.
- `commit-during-basic-action` holds non-basic parley cards (Well-Dressed, Know the Scene) — widen to
  `commit-during-action{action}`?
- Riot Whistle's "only to engage" needs `Engage` in kohaku's `BasicAction`.
- Enchanted Armor's printed health/sanity is "-3" in the card data, so its soak tags are never derived
  and it's in no safety compound.
- Flare reaches Support via `deck-search-investigator` although it borrows a teammate's ally.
- The FHV Masks tag their replenish trigger inconsistently (Wolf / Sparrow yes, Fox / Mouse / Cat no).
- `stats-mod-set-base` can't take a dynamic value (Obscure).

## 5. Weaknesses untagged (your ruling, 2026-09-26)

You suspected that weaknesses (signature, bonded, basic) spawn tags of their own. Partly true:

- **One tag existed only for them**: `heal-removes-weakness` (the EOTE injury family, 6 names, no
  player card). It is deleted.
- **More often they took over player tags**, mostly through the old "light convention" for treachery
  weaknesses:

  | tag | weakness names / all names before the strip |
  |---|---|
  | `cost-action-multiple` | 30 / 38 (the "[action][action]: discard this" way out) |
  | `discard-from-play-self` | 50 / 87 |
  | `damage-to-investigator` | 23 / 33 |
  | `timing-game-ends` | 12 / 17 |
  | `timing-phase-investigation-turn-ends` | 8 / 15 |
  | `doom-add` | 7 / 14 |

  A player browsing `cost-action-multiple` for Sledgehammer's peers mostly found weakness chores.
- They also leaked into **19 compounds** (44 memberships): Bold Action ×10, Chaos Token Control ×6,
  Fail Forward ×4, Search, Spend Resource, Seal, Doom Adding, Health Safety and others.

**What changed**

- All **173 weaknesses** (107 signature/bonded, 66 basic; 111 treacheries, 30 enemies, 18 assets,
  9 events, 5 skills) now have `tags: []`. 132 of them carried tags (324 entries), and 41 were already
  empty. The 44 compound memberships that left are all weaknesses; nothing joined.
- **Weakness is now data, not memory.** Pack entries carry `subtype: "weakness" | "basicweakness"`,
  taken from the card database's `subtype_code`. The field is on `TaggedCard`, `RawCard` and
  `HydratedCard` and in the exported `cards.json`, so the Tag Browser could hide or label them.
  - 15 of the newest weaknesses (the weakness pairs of the tom, car, and, mar and mig decks, core2026's Pursued,
    Amnesia, Overzealous, Paranoia and The Necronomicon 12012) are missing from `ui`'s `cards.json`,
    so their `subtype` was added to `json/input/*.json` from campaign-data's pack references.
  - A reprint without its own subtype inherits one through `duplicateOf`.
- **Lint `weakness-tagged`** (ERROR) enforces the rule. Weaknesses are skipped by the stat-derived
  checks (Dark Memory's no-icons tag, Dream Parasite's double icon) and every other per-card check.
  Three allowlist entries for Dark Future / Nihilism are removed.
- `yarn corpus`, `yarn suggest` and `find-precedent` leave weaknesses out as peers. A weakness queried
  in `find-precedent` prints "leave its tags empty".
- `assemble-tagged-cards` writes an empty card as `tags: [],`.
- **Rulings.** A new `_general` ruling states the policy and the evidence above. The light-convention
  sentence is gone. Rulings, JSDoc and descriptions that used weaknesses as examples now point at
  player cards: `doom-add` targets (Fickle Fortune; Whispers of Doom, String of Curses), `doom-move`,
  `control-transfer-asset` (Pitchfork), `location-your-*` (Medical Texts), `deck-discard-*`,
  `hand-size-*`, `test-difficulty-*`, `chaos-treat-token-as`, `cost-action-multiple`, and
  `timing-game-ends` (Green Man Medallion).
- The tag-cards skill, `tagging-guide.md` and the README state the rule. Player cards that deal with
  weaknesses (`cancel-weakness-draw`, `enemy-nonweakness`) are tagged as before.
- **Doom Adding widened (your call):** the 09-25 report held String of Curses → Doom Adding on G9.
  The `own-card` filter only existed to keep weakness doom out, so Doom Adding now takes every
  `doom-add` target. String of Curses and Whispers of Doom (doom on an enemy) and Fickle Fortune
  (doom on the agenda for a heal) joined.
