# Cross-pack Taxonomy Proposal

Synthesized from 18 per-pack discovery reports (see `discovery-reports.json`). Status is computed from the live taxonomy each time this file is rebuilt (`node script/build-proposal.ts`): **✅ implemented** ids exist in `src/tags` (or landed under a renamed successor), **✖ dropped** were removed as never used by a card. Items marked **⏳ proposed** are recorded here and implemented as their packs are tagged — this is how the taxonomy resumes from prior thinking.

## Summary

- New tag files: 17 (5 implemented)
- New members in existing files: 58 (6 implemented)
- Argument additions: 4 (1 implemented)
- New compound tags: 12 (3 implemented)
- Rejected proposals: 26

## New tag files

### `stats-mod/set-base.ts` — `TagTypeStatsModSetBase` — ✅ implemented
Base fields: value: number

- `StatsModSetBase` = `"stats-mod-set-base"`

_Sets/overrides the BASE value of a skill to a fixed number (e.g. 'base combat skill of 6', 'set base value of each skill to 5'). Distinct from additive boosts (boost-in-test/passive) and from BuffStatsReplace (stat-for-stat swap). 'value' carries the fixed base; the skill it applies to is usually all-skills or context-dependent, so kept as a single tag rather than per-skill variants. Consolidates dwl base-stat override (Duke, Strange Solution, Red-Gloved Man), rt Trial by Fire, tcu Trial by Fire, tic Eye of the Djinn._

Packs: dwl, rt, tcu, tic

### `stats-mod/add-stat.ts` — `TagTypeStatsModAddStat` — ✅ implemented
Base fields: from: SkillType, action: TestingBasicAction

- `StatsModAddStat` = `"stats-mod-add-stat"`

_ADDS a second stat's value on top of the test's normal skill value for one action ('Add your [agility] to your skill value for this attack'). Distinct from BuffStatsReplace (swap) and boost (flat +N). 'from' = donor stat; 'action' optional = which action it applies to. The single biggest cross-pack gap, flagged in source as '// stat_add_*_for_* - Need tag type'._

Packs: eote, har, ptc, rt, tde, tfa, win

### `stats-mod/use-instead.ts` — `TagTypeStatsModUseInstead` — ✅ implemented
Base fields: use: SkillType, instead: SkillType, action: TestingBasicAction

- `StatsModUseInstead` = `"stats-mod-use-instead"`

_Per-action, per-test stat substitution ('This attack uses [agility] instead of [combat]'). Distinct from BuffStatsReplace, which the digest documents as a PASSIVE card-wide from->to replacement (Mr. Rook style). These are action-scoped one-shot overrides on events/weapons. 'use'/'instead' = the two stats; 'action' = which action's test. Consolidates win Pilfer/Backstab/Sharpshooter, tfa Mists/Ornate Bow/Blood Eclipse/Handcuffs, tde Empower Self/Mind's Eye. NOTE: implementer may instead choose to add an optional 'action?' arg to BuffStatsReplace; kept separate here because the per-test scope is the searchable distinction._

Packs: tfa, win, tde

### `chaos/bag.ts` — `TagTypeChaosBag` — ✅ implemented
Base fields: value: number

- `ChaosBagAddBless` = `"chaos-bag-add-bless"`
- `ChaosBagAddCurse` = `"chaos-bag-add-curse"`
- `ChaosBagRemoveBless` = `"chaos-bag-remove-bless"`
- `ChaosBagRemoveCurse` = `"chaos-bag-remove-curse"`
- `ChaosBagReplace` = `"chaos-bag-replace"` (+ from: "bless" | "curse", to: "bless" | "curse")

_THE defining gap of the bless/curse cycle. Existing chaos tags only model reacting to REVEALED tokens; nothing expresses ADDING / REMOVING-RETURNING / REPLACING bless/curse tokens in the bag. 'value' = count (-1 for X/variable). Replace variant carries from/to. The old regex wrongly collapsed 'add bless' into 'chaos_reveal_token_bless'. Consolidates fhv ChaosBagAdd/Remove Bless/Curse, tic ChaosBagAdd/Remove/Replace, par ChaosBlessCurseAdd/Remove._

Packs: fhv, tic, par

### `exile/main.ts` — `TagTypeExile` — ✅ implemented
Base fields: —

- `ExileSelf` = `"exile-self"`

_Exile (a keyword introduced in dwl: removes the card from your deck/collection on use, with XP-repurchase implications). A deliberate deckbuilding/campaign mechanic distinct from discard-from-play (recoverable) and from remove-from-game (scenario-only). Its own cross-cutting category like 'testless'. Consolidates dwl (Fire Extinguisher, Flare, Stroke of Luck), ptc (A Test of Will, Devil's Luck), ste (Cherished Keepsake, Leather Coat, A Test of Will)._

Packs: dwl, ptc, ste

### `rfg/main.ts` — `TagTypeRfg` — ✅ implemented
Base fields: —

- `RfgSelf` = `"rfg-self"`

_'Remove from the game' as a self-effect/cost (gone for the scenario, NOT repurchasable; distinct from exile). Recurs across packs: dwl Lucky Dice / Gold Pocket Watch, ptc Quantum Flux / The Painted World / Seal of the Elder Sign / Cheat Death. Players filter for one-shot non-recurring cards via this._

Packs: dwl, ptc

### `ready/main.ts` — `TagTypeReady` — ✅ implemented
Base fields: —

- `ReadySelf` = `"ready-self"`
- `ReadyAsset` = `"ready-asset"`
- `ReadyAlly` = `"ready-ally"`

_Readying your own / another in-play asset or ally (refunding exhaust for re-use). The taxonomy had NO player-side ready tag (only EnemyDoesNotReady and the upkeep timing point). Split self vs other-asset vs ally because they map to different searches (weapon ready-on-success tempo vs ally support). Consolidates nat Galvanize, tdc Bulwark/Inspiring Presence/Luger, win Mauser/Beretta._

Packs: nat, tdc, win

### `aoo/main.ts` — `TagTypeAoo` — ✅ implemented
Base fields: —

- `AooNoProvoke` = `"aoo-no-provoke"` (+ action: TestingBasicAction)

_'This action does not provoke attacks of opportunity' / 'Engage actions do not provoke AoO'. Extremely common, distinctly searchable safety clause with no home. Optional 'action' arg distinguishes blanket protection (Trench Knife on engage) from a single ability's protection. Consolidates nat Mano a Mano, ptc (Lantern, Trench Knife, Mano a Mano, Archaic Glyphs), rt Dynamite Blast/Lantern, tde Followed._

Packs: nat, ptc, rt, tde

### `soak/main.ts` — `TagTypeSoak` — ✅ implemented
Base fields: —

- `SoakDamage` = `"soak-damage"` (+ value: number)
- `SoakHorror` = `"soak-horror"` (+ value: number)

_An asset that absorbs damage/horror as an HP/sanity buffer (Composure suite, True Grit, Key of Ys, Cherished Keepsake). A foundational asset role with no tag. 'value' = printed soak amount (optional/omit when conditional). Core of the protector/tank archetype. Consolidates ptc SoakDamage/SoakHorror._

Packs: ptc

### `tank/main.ts` — `TagTypeTank` — ✅ implemented
Base fields: —

- `TankRedirectAttack` = `"tank-redirect-attack"`
- `TankRedirectEncounter` = `"tank-redirect-encounter"`
- `TankRedirectDamageHorror` = `"tank-redirect-damage-horror"`

_Taking harm meant for another investigator: resolving an enemy attack against you instead, taking another player's encounter card, or accepting damage/horror dealt to others at your location. Distinct from soak (absorbs your own) and cancel. The signature protector/guardian archetype. Consolidates ptc Heroic Rescue/'Let me handle this!'/True Grit, tsk Obsidian Bracelet/Girish, tfa Until the End of Time, par Heirloom (damage-assignment)._

Packs: ptc, tsk, tfa

### `hand-size/main.ts` — `TagTypeHandSize` — ✅ implemented
Base fields: —

- `HandSizeMaxIncrease` = `"hand-size-max-increase"` (+ value: number)
- `HandSizeDependent` = `"hand-size-dependent"`

_The Harvey Walters big-hand engine: increasing maximum hand size, and effects that scale with / are gated by the number of cards in hand. Only PhaseUpkeepCheckHandSize (a timing point) existed. Consolidates dwl Laboratory Assistant, har Vault of Knowledge/Arcane Enlightenment/Laboratory Assistant (increase) + Higher Education/Celaeno Fragments/Extensive Research/Farsight/Forbidden Tome (dependent)._

Packs: dwl, har

### `deck/look.ts` — `TagTypeDeckLook` — ✅ implemented
Base fields: value: number, reorder: boolean

- `DeckLookYou` = `"deck-look-you"`
- `DeckLookEncounter` = `"deck-look-encounter"`

_Looking at the top N cards of a player deck or the encounter deck and optionally reordering them, WITHOUT pulling a specific card out (scry / divination / encounter-smoothing). DeckSearch implies extracting a target; this is non-search peek/reorder. Source flags it: '// look_at_encounter / order_encounter - Need tag type'. 'value' = count (-1 variable), 'reorder' = may reorder vs only look. Consolidates dwl Alyssa Graham, eote Parallel Fates/Astronomical Atlas, jac Parallel Fates._

Packs: dwl, eote, jac

### `commit/main.ts` — `TagTypeCommit` — ✅ implemented
Base fields: —

- `CommitOtherInvestigator` = `"commit-other-investigator"` (+ range: "your-location" | "connecting" | "any")
- `CommitFromNonHand` = `"commit-from-non-hand"` (+ source: "deck-top" | "discard" | "attached")
- `CommitFetch` = `"commit-fetch"` (+ source: "own-deck" | "investigator-discard")
- `CommitMax` = `"commit-max"` (+ value: number)

_Commit mechanics beyond the default (commit-from-hand-to-your-own-test is intentionally untagged). CommitOtherInvestigator = commit to someone else's test, possibly remote (Carson support). CommitFromNonHand = commit from deck-top/discard/attached (Norman Withers / fortune-teller engines). CommitFetch = dig and force-commit a skill (Daredevil/Copycat). CommitMax = 'Max N committed per skill test' (Guts family), flagged in source as '// max_1_commit - Need tag type'. Consolidates tsk, eote, win, jac, dwl(no)._

Packs: tsk, eote, win, jac

### `skill-commit/main.ts` — `TagTypeSkillCommit` — ✅ implemented
Base fields: —

- `SkillCommitGainIcon` = `"skill-commit-gain-icon"`

_A committed card GAINS extra skill icons (often [wild]), frequently scaling off a variable (charges spent, enemies engaged), or a support asset adds an icon to an already-committed card. Distinct from skill-value margin tags and from boost (which raise the investigator's value, not committed icons). Consolidates ptc Torrent of Power/'Not without a fight!', tcu Grisly Totem, tdc Confidence/Storm Ruler._

Packs: ptc, tcu, tdc

### `condition/main.ts` — `TagTypeCondition` — ✅ implemented
Base fields: comparison: "min" | "max", value: number

- `ConditionResource` = `"condition-resource"`
- `ConditionSanity` = `"condition-sanity"`
- `ConditionHandSize` = `"condition-hand-size"`

_Cards that gate or scale on the investigator's own current self-state crossing a threshold: resources (big-money payoffs / 'while you have 10+ resources'), remaining sanity (low-sanity Survivor/Mystic payoffs), and cards in hand (overlaps but complements hand-size-dependent). 'comparison' = at-least/at-most, 'value' = threshold. NOTE: hand-size threshold also covered by HandSizeDependent; ConditionHandSize records the explicit numeric threshold cases. Consolidates ptc Anatomical Diagrams/Say Your Prayers/Dario, eote The Black Fan/Money Talks resource thresholds, tcu Steadfast/Cunning/Able Bodied threshold skills, har hand-size payoffs._

Packs: ptc, eote, tcu, har

### `remote/main.ts` — `TagTypeRemote` — ✅ implemented
Base fields: —

- `RemoteInvestigate` = `"remote-investigate"`
- `RemoteMove` = `"remote-move"`

_Acting at a location other than your own ('as if you were there'): investigating any revealed location, or moving to any revealed location (non-adjacent teleport-style travel). Distinct from location/move (connecting-location movement) and clue tags. Consolidates ptc In the Know (remote investigate) + Astral Travel/Cheat Death (remote move), tdc Spiritual Echo/Doppelganger. Remote-commit folded into commit/main CommitOtherInvestigator._

Packs: ptc, tdc

### `test-difficulty/main.ts` — `TagTypeTestDifficulty` — ✅ implemented
Base fields: value: number

- `TestDifficultyReduce` = `"test-difficulty-reduce"`

_Reducing the DIFFICULTY (target number) of a skill test directly, rather than boosting your own skill value or reducing a location's shroud. Mechanically distinct from stats-mod boosts and LocationShroud. 'value' = amount (-1 dynamic). Consolidates etc Ruth Westmacott, tde Momentum._

Packs: etc, tde

## New members in existing files

- ✅ implemented — `TagTypePlayArea.PlayAreaIntoPlayFromHand` = `"play-area-into-play-from-hand"` _(play-area/main.ts; packs: dwl, ptc, rt, har)_
  - Put a card directly INTO play from hand, bypassing the normal play action/cost (Sleight of Hand, Joey 'The Rat', Archaic Glyphs, Library Docent). play-area only modeled leaving play (to-hand/to-deck); this is the inverse cheat-into-play. Consolidates dwl Joey, ptc Sleight of Hand, rt Archaic Glyphs, har Library Docent.
- ✅ implemented — `TagTypePlayArea.PlayAreaIntoPlayFromDeck` = `"play-area-into-play-from-deck"` _(play-area/main.ts; packs: dwl, nat)_
  - Tutor a card directly into play from your deck/discard (Flare, Randall Cho). DeckSearch covers the fetch; the into-play destination is the searchable novelty. Consolidates dwl Flare, nat Randall Cho.
- ✅ implemented — `TagTypePlayArea.PlayAreaIntoPlayFromDiscard` = `"play-area-into-play-from-discard"` _(play-area/main.ts; packs: dwl, ptc)_
  - Put a card (or a copy) directly into play from a discard pile (A Chance Encounter, Eidetic Memory). Distinct from discard-pile-to-hand. Consolidates dwl A Chance Encounter, ptc A Chance Encounter/Eidetic Memory.
- ✅ implemented — `TagTypePlayArea.PlayAreaPlayFromOtherZone` = `"play-area-play-from-other-zone"` (+ zone: "discard" | "top-deck" | "other-hand" | "attached" | "set-aside") _(play-area/main.ts; packs: eote, tcu, har)_
  - Play a card (paying its cost) from a zone other than your own hand, or let another investigator play it: from your discard, deck-top, another player's hand, beneath/attached to a card, or set-aside. Distinct from into-play 'cheat' (which bypasses the play action) and from recursion (return-to-hand-first). Consolidates eote Untimely Transaction/Black Market/True Magick, tcu 'You owe me one!'/Twilight Blade/Dayana, har Farsight, tsk(no).
- ✅ implemented — `TagTypeRecursion.RecursionPlayFromDiscard` = `"recursion-play-from-discard"` _(recursion/main.ts; packs: fhv, tdc, ptc, eote, tsk)_
  - Play/resolve a card DIRECTLY from the discard pile (not first returned to hand). RecursionAsset/Event/Skill return to hand; DiscardPile* move to hand/deck; neither expresses playable-from-discard. A strong cross-pack graveyard-value archetype. Consolidates fhv (Pushed to the Limit, Eldritch Tongue, Persistence), tdc (Profane Idol, Improvised Weapon, A Glimmer of Hope), ptc, rt, nat, eote, tsk.
- ✅ implemented — `TagTypeRecursion.RecursionSelfToHand` = `"recursion-self-to-hand"` _(recursion/main.ts; packs: win, fhv, tfa)_
  - A card returns ITSELF to hand instead of being discarded (often gated on succeed-by), enabling repeated reuse. Existing recursion tags describe pulling OTHER cards. The signature Rogue reusable-event/skill engine. Consolidates win (Cheap Shot, Backstab, Pilfer, Slip Away, Opportunist), fhv, tfa self-replay.
- ✅ implemented — `TagTypeRecursion.RecursionReplay` = `"recursion-replay"` _(recursion/main.ts; packs: tcu)_
  - Replay an event in place / resolve an ability an extra time ('Play that event again as if it were in your hand'). Distinct from RecursionEvent (returns from discard). Consolidates tcu Double Double/Dayana/Knowledge is Power.
- ✅ implemented as `bonded-fetch` — `TagTypeDeckSearch.DeckSearchBonded` = `"deck-search-bonded"` _(deck/search.ts; packs: rt, tcu, tde)_
  - Search your BONDED cards (set aside, out of play) for a specific card — the defining engine of the bonded archetype (Miss Doyle, Gate Box, Hallowed Mirror, Occult Lexicon). The existing DeckSearch range (deck/discard/encounter, top/bottom/all) cannot express the set-aside bonded zone. Added as a sibling member; the base 'range' field can be 'all'. Consolidates rt, tcu, tde.
- ✅ implemented — `TagTypeDeckDraw.DeckDrawFillHand` = `"deck-draw-fill-hand"` _(deck/draw.ts; packs: tcu)_
  - Draw cards until you reach your maximum hand size (variable bulk draw). The DeckDraw base requires a fixed numeric 'value'; fill-to-cap is dynamic. Implement as a member whose 'value' is set to -1 (dynamic) per the base field. Consolidates tcu Glimpse the Unthinkable.
- ✅ implemented — `TagTypeDeckDiscard.DeckDiscardEncounter` = `"deck-discard-encounter"` _(deck/discard.ts; packs: etc)_
  - Proactively discard/thin the top of the ENCOUNTER deck (Split the Angle). DeckDiscardDeck/Self target the player deck; DeckSearchEncounter is look-at-top. A control archetype. Consolidates etc Split the Angle.
- ✅ implemented — `TagTypeChaosSeal.ChaosSealTokenBless` = `"chaos-seal-token-bless"` _(chaos/seal.ts; packs: etc, par, tic)_
  - The ChaosSeal enum has 0/any/auto-fail/cultist/elder-sign/elder-thing/skull/tablet but NOT bless — despite bless being the namesake of the cycle. Multiple cards search the bag and seal bless (Codex of Ages, Radiant Smite, Holy Spear, Rite of Sanctification, Nephthys). Mirrors the reveal-side ChaosRevealTokenBless. Consolidates etc, par, tic.
- ✅ implemented — `TagTypeChaosSeal.ChaosSealTokenCurse` = `"chaos-seal-token-curse"` _(chaos/seal.ts; packs: par, tic)_
  - Curse counterpart of ChaosSealTokenBless, also missing (Dark Ritual, Flute of the Outer Gods, Favor of the Moon). Consolidates par, tic.
- ✅ implemented — `TagTypeChaosSeal.ChaosSealRevealed` = `"chaos-seal-revealed"` _(chaos/seal.ts; packs: tdc)_
  - Dynamically seal a token that was REVEALED during a skill test (permanently thinning the bag mid-test), distinct from the static Seal keyword that pre-specifies a token type at enter-play. Consolidates tdc Ocula Obscura/Dial of Ancients.
- ✅ implemented — `TagTypeChaosReveal.ChaosRevealSealedInstead` = `"chaos-reveal-sealed-instead"` _(chaos/reveal.ts; packs: etc, par, tic)_
  - Resolve/release a pre-SEALED token in place of the random bag draw ('resolve a token sealed here instead'). Distinct from ChaosRevealAnotherInstead (reveal another random token) and ChaosRevealManual. The core of the sealed-token bag-control engine (Codex of Ages, Favor of the Sun/Moon, Tidal Memento, Flute of the Outer Gods). Consolidates etc, par, tic.
- ✅ implemented — `TagTypeChaosEffect.ChaosEffectTreatTokenAs` = `"chaos-treat-token-as"` (+ to: "bless" | "curse" | "skull" | "elder-sign" | "auto-fail") _(chaos/effect.ts; packs: tic, fhv)_
  - Generalizes the existing ChaosEffectTreatAsElderSign: convert a revealed token into a different token type for the test ('treat it as a [skull]/[bless]/[curse] instead'). 'to' = target type. Consolidates tic ('Lucky' Penny, Blessing of Isis, Curse of Aeons), fhv. (ChaosEffectTreatAsElderSign retained for the elder-sign case; new tag covers the others.)
- ✅ implemented — `TagTypeChaosEffect.ChaosEffectResolveAdditional` = `"chaos-resolve-additional"` _(chaos/effect.ts; packs: jac, tcu)_
  - Resolve a chaos-token-triggered effect an ADDITIONAL time (double it). The cancel half is covered by CancelChaos; effect-doubling has no tag. Consolidates jac Eldritch Inspiration, tcu Eldritch Inspiration.
- ✅ implemented — `TagTypeChaosPredict.ChaosPredict` = `"chaos-predict"` _(chaos/predict.ts; packs: jac, eote, tfa)_
  - Name/predict a token type, parity, or test margin, then get a payoff if a matching token was revealed (Crystal Pendulum, Prescient, Recall the Future, Foresight). A distinct fortune-teller archetype not expressible by any reveal/skill-value tag. New small file chaos/predict.ts.
- ✅ implemented — `TagTypeChaosDownside.ChaosDownsideDamage` = `"chaos-downside-damage"` (+ value: number) _(chaos/downside.ts; packs: jac)_
  - A built-in conditional self-PENALTY (damage/horror/resource-loss) triggered by a bad chaos token during the card's own effect (NOT a cost paid to activate). Source flags it: '// Take horror when revealing chaos tokens - Need new tag type'. The classic risky-Mystic-spell drawback. damage/horror/resource variants. Consolidates jac (Azure Flame damage, Clairvoyance horror, Ineffable Truth resource, Astral Travel). New file chaos/downside.ts.
- ✅ implemented — `TagTypeChaosDownside.ChaosDownsideHorror` = `"chaos-downside-horror"` (+ value: number) _(chaos/downside.ts; packs: jac)_
  - Horror variant of chaos self-downside (Clairvoyance).
- ✅ implemented — `TagTypeChaosDownside.ChaosDownsideResource` = `"chaos-downside-resource"` (+ value: number) _(chaos/downside.ts; packs: jac)_
  - Resource-loss variant of chaos self-downside (Ineffable Truth).
- ✅ implemented as `enemy-engage-disengage` — `TagTypeEnemyEngage.EnemyEngageDisengage` = `"engage-disengage"` (+ withoutExhaust: boolean) _(enemy/engage.ts; packs: par, ptc, fhv, tde)_
  - Forcibly disengage an enemy from investigators, or you disengage from each engaged enemy — the core of the evasion/escape package. enemy/engage only covered engage states. Source flags it: '// disengage - Need tag type' on Elusive/Cat Burglar. 'withoutExhaust' flags the Stealth variant (disengaged but kept ready). Consolidates par On the Lam, ptc Stealth/Snare Trap/Cheat Death, fhv Blackmail File, tde Gate Box/Ethereal Form.
- ✅ implemented — `TagTypeEnemyDebuff.EnemyCannotAttack` = `"enemy-cannot-attack"` _(enemy/debuff.ts; packs: fhv)_
  - 'Attached enemy cannot attack' — a recurring lock-down (Rot attachments, handler cards). Sibling of the existing EnemyDoesNotReady/EnemyCannotMoveIntoLocation. Consolidates fhv Abyssal Rot.
- ✅ implemented — `TagTypeEnemyDebuff.EnemyCannotMove` = `"enemy-cannot-move"` _(enemy/debuff.ts; packs: fhv)_
  - 'Attached enemy cannot move' — distinct from EnemyCannotMoveIntoLocation (about a location). Consolidates fhv Virescent Rot/Transmogrify.
- ✅ implemented as `buff-cannot-engage-you` — `TagTypeEnemyDebuff.EnemyCannotEngage` = `"enemy-cannot-engage"` _(enemy/debuff.ts; packs: ptc)_
  - 'That enemy cannot engage you' — evasion-lock (Stealth). Sibling debuff. Consolidates ptc Stealth.
- ✅ implemented — `TagTypeEnemyDebuff.EnemyExhaust` = `"enemy-exhaust"` _(enemy/debuff.ts; packs: ptc, tsk)_
  - Force an enemy to exhaust (tempo/lockdown). Snare Trap, Mind Wipe-style. Consolidates ptc Snare Trap, tsk attach-lockdown cluster.
- ✅ implemented — `TagTypeUsesStarting.UsesStartingOffering` = `"uses-starting-offering"` _(uses/starting.ts; packs: fhv)_
  - New printed use-token type 'offering' (Masks sub-theme), absent from the enum (ammo/charge/supply/secret/evidence). The base 'value' field carries the count. Consolidates fhv Wolf Mask/Speak to the Dead.
- ✅ implemented — `TagTypeUsesStarting.UsesStartingResource` = `"uses-starting-resource"` _(uses/starting.ts; packs: fhv, jac)_
  - Printed 'Uses (N resources)' as a use-pool stored on the card, distinct from gaining resources to your pool. Consolidates fhv Bianca, jac Arcane Studies.
- ✅ implemented — `TagTypeUsesStarting.UsesStartingInspiration` = `"uses-starting-inspiration"` _(uses/starting.ts; packs: tdc)_
  - New printed use-token type 'inspiration' (tdc), absent from the enum. (Sibling future types 'shell'/'leads' may be added the same way if they recur.) Consolidates tdc Book of Verse/Artistic Inspiration.
- ✅ implemented — `TagTypeUsesReplenish.UsesReplenish` = `"uses-replenish"` (+ useType: string, conditional: boolean) _(uses/replenish.ts; packs: fhv, jac)_
  - Refilling a limited-use pool (charges/offerings/ammo/secrets), either automatically each round or on a trigger ('Replenish this charge the first time a bless token is revealed'). NO replenish tag existed despite the regex hint 'uses_replenish'. 'useType' = which pool, 'conditional' = triggered vs automatic. This is its own new file uses/replenish.ts. Consolidates fhv Ofuda/Masks/Wicked Athame/Call the Beyond, jac Arcane Studies.
- ✅ implemented — `TagTypeUsesAccumulate.UsesAccumulate` = `"uses-accumulate"` (+ tokenName: "evidence" | "lead" | "offering" | "charge" | "generic") _(uses/accumulate.ts; packs: tsk, tcu)_
  - A self-growing counter: place resources from the token pool onto THIS card as a renamed token (evidence/leads/offering) that starts empty and accrues via reactions, later spent. Distinct from UsesStarting (printed pool) and UsesSupport (place/move of an existing type). A signature TSK economy engine; also the resource-bank pattern (tcu Investments/Family Inheritance, relates to big-money). New file uses/accumulate.ts. Consolidates tsk Darrell's Kodak/Dissection Tools/Research Notes/Soul Sanctification, tcu Investments/Family Inheritance.
- ⏳ proposed — `TagTypeGainResource.ResourceMoveInvestigator` = `"resource-move-investigator"` _(gain/resource.ts; packs: fhv, dwl)_
  - MOVE resources between investigators' pools (sharing/loan/trade), distinct from gaining new resources. Multiplayer big-money support. Note this is a no-value member, so it carries 'value' from the base = use -1/0 where the base requires it (implementer may relax the base 'value' to optional, OR place this in a new gain/transfer.ts file). Consolidates fhv 'I'll Pay You Back!'/Bank Job/Grift, dwl Teamwork (transfer asset/resource).
- ✅ implemented — `TagTypeCostAction.CostActionSpendSecret` = `"cost-action-spend-secret"` _(cost/action.ts; packs: har)_
  - Parallel to the existing CostActionSpendResource and to CostFreeSpendSecret: an [action]-activated ability that spends a secret (Encyclopedia, Feed the Mind, Forbidden Tome). Consolidates har.
- ✅ implemented — `TagTypeCostOther.CostAddDoomSelf` = `"cost-add-doom-self"` (+ value: number) _(cost/other.ts; packs: tic, tsk)_
  - 'Power at the price of doom': place doom on a card you control as an activation cost (Blood Pact, Abyssal Tome, Ceremonial Sickle/Dowsing Rod/Onyx Pentacle). Distinct from generic DoomAdd (to agenda). A deckbuilding hazard players filter on; also the self-doom mystic engine. Consolidates tic, tsk.
- ✅ implemented — `TagTypeCancel.CancelLoseAction` = `"cancel-lose-action"` _(cancel/main.ts; packs: tcu)_
  - Ignore/cancel the 'lose actions' aspect of an incoming encounter/attack effect (Deny Existence). No cancel variant covered action-loss. Part of the modular aspect-ignore archetype. Consolidates tcu.
- ✅ implemented — `TagTypeCancel.CancelLoseResource` = `"cancel-lose-resource"` _(cancel/main.ts; packs: tcu)_
  - Ignore/cancel the 'lose resources' aspect of an incoming effect (Deny Existence). Consolidates tcu.
- ✅ implemented — `TagTypeCancel.CancelDiscardFromHand` = `"cancel-discard-from-hand"` _(cancel/main.ts; packs: tcu)_
  - Ignore/cancel a forced hand-discard aspect of an incoming effect (Deny Existence). Completes the modular ignore set alongside the existing CancelDamage/CancelHorror. Consolidates tcu.
- ✅ implemented as `discard-treachery-in-play` — `TagTypeCancel.CancelTreacheryInPlay` = `"cancel-treachery-in-play"` _(cancel/main.ts; packs: rt)_
  - Discard/remove a treachery that is ALREADY in play (ongoing/attached), distinct from the existing on-draw cancels (CancelRevelation/CancelEncounterDraw/CancelEncounterEffect). Consolidates rt Alter Fate.
- ✅ implemented — `TagTypeCancel.CancelFailedTestEffects` = `"cancel-failed-test-effects"` _(cancel/main.ts; packs: ste)_
  - Cancel all effects/consequences of a (failed) skill test (Neither Rain nor Snow) — a Survivor fail-mitigation effect not covered by any cancel variant. Part of the fail-forward package. Consolidates ste.
- ✅ implemented — `TagTypeCancel.CancelWeaknessDraw` = `"cancel-weakness-draw"` _(cancel/main.ts; packs: tic)_
  - Cancel/suppress a drawn weakness's effects (Ikiaq). Distinct from the encounter-card cancels; targets the player weakness mechanic. Consolidates tic.
- ✅ implemented — `TagTypeActionAdditional.ActionAdditionalAttack` = `"action-additional-attack"` _(action/additional.ts; packs: nat)_
  - An extra ATTACK within the resolution of a single card ('fight that enemy again' / 'fight again'), NOT a new game action — so not expressible by ActionAdditional (which grants a usable action). A burst-damage archetype. Placed in action/additional.ts as a sibling member. Consolidates nat One-Two Punch.
- ✅ implemented — `TagTypeActionActivate.ActionActivateIgnoringCost` = `"action-activate-ignoring-cost"` _(action/main.ts; packs: fhv, tdc, tcu)_
  - Resolve another card's [action]/[fast] ability without paying its cost (Hand-Eye Coordination, Dirty Deeds, Flurry of Blows; also resolving a Fight ability on a discarded/revealed weapon never deployed — Robert Castaigne). A major action-compression/combo enabler. NEW file action/activate.ts (a new enum TagTypeActionActivate). Consolidates fhv (Hand-Eye/Dirty Deeds/Flurry), tdc (Robert Castaigne/Remington), tcu (Knowledge is Power/Dayana).
- ✅ implemented — `TagTypeActionActivate.ActionActivateFromHand` = `"action-activate-from-hand"` (+ discardInstead: boolean) _(action/main.ts; packs: tdc)_
  - Activate an asset's printed [action] ability while it is still IN YOUR HAND (discarding it instead of exhausting) — the Anchor Chain / Hand Hook / Nautical Charts cycle. Same new action/activate.ts file. Consolidates tdc.
- ✅ implemented — `TagTypeActionLose.ActionEndTurn` = `"action-end-turn"` _(action/lose.ts; packs: dwl, tfa)_
  - End your turn as a drawback/tradeoff for a powerful effect (Ace in the Hole, Pay Day, Coup de Grace). Distinct from ActionLoseAction (losing a single action). Placed in the existing action/lose.ts. Consolidates dwl Ace in the Hole, tfa Pay Day/Coup de Grace.
- ✅ implemented — `TagTypeGainKeyword.GainKeywordFastOther` = `"gain-fast-other"` _(gain/keyword.ts; packs: par)_
  - Grant the FAST keyword to ANOTHER card you play (Daisy's Tote Bag, Directive, Chuck Fergus, Fence). cost/fast tags describe a card that IS fast; this grants fast to other cards — a tempo/action-compression enabler. Placed in the existing gain/keyword.ts (alongside Aloof/Retaliate). Consolidates par.
- ✅ implemented — `TagTypeDamage.DamageRedirectAttack` = `"damage-redirect-attack"` _(damage/main.ts; packs: dwl, ste)_
  - Redirect an attacking enemy's damage onto a DIFFERENT enemy ('Deal this attack's damage to a different enemy'). Distinct from DamageInsteadRange (your-attack-misses margin redirection). The 'turn attacks on enemies' control archetype. Consolidates dwl Oops!/Aquinnah, ste Oops!.
- ✅ implemented — `TagTypeDamage.DamageSpread` = `"damage-spread"` (+ value: number) _(damage/main.ts; packs: tfa)_
  - Assign/spread damage among MULTIPLE enemies at once (Flamethrower: 'assign up to 4 damage among enemies engaged with you'). Distinct from DamagePlus (flat bonus to one target). A group-clear archetype. 'value' = total spreadable (-1 for X). Consolidates tfa Flamethrower.
- ✅ implemented — `TagTypeSlotAdditional.SlotAdditionalTarot` = `"slot-additional-tarot"` _(slot/additional.ts; packs: rt, tcu)_
  - Adds the Tarot slot variant to the existing per-slot enum (Accessory/Ally/Arcane/Hand). Moon Pendant, Anna Kaslow. Consolidates rt, tcu.
- ✅ implemented — `TagTypeSlotConvert.SlotConvert` = `"slot-convert"` (+ from: string, to: string) _(slot/convert.ts; packs: rt)_
  - Let one slot type substitute for another ('arcane slots can hold accessory-slot cards, and vice versa' — The Hierophant). Distinct from additive SlotAdditional. New file slot/convert.ts. Consolidates rt.
- ✅ implemented — `TagTypeBuffAssetStats.BuffAssetHealth` = `"buff-asset-health"` (+ value: number) _(buff/asset-stats.ts; packs: rt)_
  - Raise the max health/sanity (durability) of your assets ('Each asset you control with health gets +1 health' — The Star). stats-mod tags cover skill values only; heal restores but does not raise max. New file buff/asset-stats.ts with health+sanity siblings. Consolidates rt The Star.
- ✅ implemented — `TagTypeBuffAssetStats.BuffAssetSanity` = `"buff-asset-sanity"` (+ value: number) _(buff/asset-stats.ts; packs: rt)_
  - Sanity counterpart of BuffAssetHealth (The Star). Consolidates rt.
- ✅ implemented — `TagTypeSkillValueSource.SkillValueFromResource` = `"skill-value-from-resource"` (+ per: number) _(skill-value/source.ts; packs: eote, tcu, rt)_
  - Skill value scales off the resources you HOLD (not spend): '+1 skill value for every 5 resources' / base value 'equal to half your resources'. Distinct from StatsModPumpResource (per resource SPENT) and from flat boosts. The big-money skill-scaling payoff. 'per' = denominator. New file skill-value/source.ts. Consolidates eote Money Talks, tcu Well Connected/Money Talks, rt Well Connected (flagged).
- ✅ implemented — `TagTypeMulticlass.MulticlassClassCount` = `"multiclass-class-count"` (+ reward: "combat" | "damage" | "resource" | "wild-icon" | "cost-reduction" | "charge" | "effect") _(multiclass/main.ts; packs: eote)_
  - Effects that scale with the number of DIFFERENT classes among cards you control — the eote five-color/rainbow payoff (Gang Up, Strength in Numbers, Close the Circle, Cheat the System, Call for Backup, Join the Caravan). The unifying searchable hook for the whole multiclass sub-theme. 'reward' = what scales. New file multiclass/main.ts. Folds in GainResourceDynamicClassCount as reward='resource'. Consolidates eote.
- ✖ dropped (never used by a card) — `TagTypeEncounter.EncounterRevealChoose` = `"encounter-reveal-choose"` _(encounter/main.ts; packs: tsk, etc)_
  - Draw/reveal MORE encounter cards and choose which to resolve, discarding the rest — a soft-cancel / encounter-filter distinct from CancelEncounterDraw (full removal). New file encounter/main.ts. Consolidates tsk Dr. Maleson/Nature of the Beast, etc Dr. Maleson (adjacent).
- ✅ implemented — `TagTypeDoom.DoomPreventAdvance` = `"doom-prevent-advance"` _(doom/main.ts; packs: etc, tcu)_
  - Prevent the agenda from advancing when it reaches its doom threshold ('the agenda cannot advance by reaching its doom threshold') — a stall/buy-a-turn effect not covered by DoomAdd/Check/Remove. Placed in the existing doom/main.ts. Consolidates etc Mystifying Song, tcu Mystifying Song (flagged).
- ✅ implemented — `TagTypeCluePlace.CluePlaceYourLocation` = `"clue-place-your-location"` (+ value: number) _(clue/place.ts; packs: etc)_
  - PLACE a clue (from the token bank) on a location, distinct from DISCOVERING a clue (ClueDiscover*) and from ClueAdditional (extra clues during an investigation). Placing seeds a clue to be collected / fuels 'when a clue is placed' tech. New file clue/place.ts. Consolidates etc Mysteries Remain.
- ✅ implemented — `TagTypeTimingAfter.TimingAfterFailSkillTest` = `"timing-after-fail-skill-test"` _(timing/after.ts; packs: ste)_
  - The 'after you fail a skill test' reaction/play window — the defining Survivor fail-forward trigger. Distinct from SkillTestConditionFail (a result-gate) and from existing timing/after triggers. Placed in timing/after.ts. Consolidates ste Rabbit's Foot/Grit Your Teeth/Live and Learn/Take Heart.
- ✅ implemented — `TagTypeTimingAfter.TimingAfterEngageEnemy` = `"timing-after-engage-enemy"` _(timing/after.ts; packs: par)_
  - 'After you engage an enemy' trigger (Zoey's Cross), the search hook for engage-synergy builds. Consistent with existing selective timing-after triggers. Consolidates par.
- ✅ implemented — `TagTypeTestRepeat.TestRepeatFailed` = `"test-repeat-failed"` _(test/repeat.ts; packs: ste)_
  - Re-attempt/repeat a failed skill test ('Attempt that test again') — a distinct second-chance effect not in initiate.ts (new test) or skill-value/result (margins). New file test/repeat.ts. Part of fail-forward. Consolidates ste Live and Learn.

## Argument additions to existing tags

- ✅ implemented — `TagTypeActionAdditional.ActionAdditional` gains `target: "self" | "investigator"`
  - Many cards grant an additional action to ANOTHER chosen investigator (Guidance, Lifeline, End of the Road), not just yourself. ActionAdditional already models extra-action grants (the dwl/fhv 'gain N actions' and deferred 'next turn' cases also fold in here via its 'value' field); adding an optional 'target' lets the existing tag distinguish self vs chosen-investigator grants. Confirms ActionAdditionalGain (dwl), ActionExtraNextTurn (fhv), and the tsk extra-action cluster are NOT new tags.
- ✅ implemented — `TagTypeSlotAdditional.SlotAdditional` gains `restrictedToTrait: string`
  - Several extra-slot cards lock the slot to a trait ('2 additional hand slots, only for Tome assets' — Daisy's Tote Bag; 'ally slots only for Creature assets' — Rod of Animalism; Bandolier weapon-only). Per the rubric, the broad searchable thing is the extra slot; the trait is an optional filter. Add 'restrictedToTrait?' to the SlotAdditional base rather than minting per-trait variants. Confirms SlotAdditionalCreatureAlly (eote) is NOT a new tag.
- ✅ implemented — `TagTypeGainResource.GainResourceYou` gains `dynamic: boolean`
  - Some resource gains are a DYNAMIC amount rather than a fixed 'value' ('gain resources equal to that enemy's printed health' — Jenny's Twin .45s; 'gain 1 per different class' — Cheat the System; 'twice that many' — Watch this!). The searchable thing ('gain resources') is already the tag; only the dynamic source is new. Add an optional 'dynamic' flag (and let 'value' be -1) on the GainResource base rather than minting GainResourceDynamicClassCount. The class-count payoff is also captured by MulticlassClassCount reward='resource'.
- ✅ implemented — `TagTypeChaosEffect.ChaosEffectModifier` gains `treatAs: number`
  - 'Treat the modifier of each [curse] token as 0' / 'as +1' (Accursed, Dawn Star, Skeptic, Blasphemous Covenant). This is a specific modifier-override that sits between the existing ChaosEffectModifier and ChaosEffectIgnoreModifier; an optional 'treatAs' numeric on ChaosEffectModifier captures it without a near-duplicate tag. Confirms ChaosEffectTreatModifierAsZero (fhv) is NOT a separate tag.

## New compound tags

- ✅ implemented — `chaos-token-control` (`ChaosTokenControl`) → `TagTypeChaosReveal.ChaosRevealMore`, `TagTypeChaosReveal.ChaosRevealAnotherInstead`, `TagTypeChaosReveal.ChaosRevealManual`, `TagTypeChaosReveal.ChaosRevealSealedInstead`, `TagTypeChaosEffect.ChaosEffectResolveChoose`, `TagTypeChaosEffect.ChaosEffectIgnoreEffect`, `TagTypeChaosEffect.ChaosEffectIgnoreModifier`, `TagTypeChaosEffect.ChaosEffectDoNotReveal`, `TagTypeChaosEffect.ChaosEffectTreatAsElderSign`, `TagTypeChaosEffect.ChaosEffectTreatTokenAs`, `TagTypeChaosEffect.ChaosEffectResolveAdditional`, `TagTypeChaosPredict.ChaosPredict`, `TagTypeCancel.CancelChaos`, `TagTypeChaosSeal.ChaosSealRevealed`, `TagTypeChaosSeal.ChaosSealTokenAny`
  - The flagship cross-pack archetype the rubric explicitly names (reveal-more / ignore / cancel / seal / check-what-is-revealed / treat-as / predict). Proposed independently by 7 packs (etc, jac, rt, tcu, tdc, tfa, tic). Groups the granular chaos reveal/effect/seal/predict primitives plus cancel-chaos into one searchable 'bag tech' package, regardless of bless/curse flavor.
- ✅ implemented — `bless-curse-bag` (`BlessCurseBag`) → `TagTypeChaosBag.ChaosBagAddBless`, `TagTypeChaosBag.ChaosBagAddCurse`, `TagTypeChaosBag.ChaosBagRemoveBless`, `TagTypeChaosBag.ChaosBagRemoveCurse`, `TagTypeChaosBag.ChaosBagReplace`, `TagTypeChaosSeal.ChaosSealTokenBless`, `TagTypeChaosSeal.ChaosSealTokenCurse`, `TagTypeChaosReveal.ChaosRevealTokenBless`, `TagTypeChaosReveal.ChaosRevealTokenCurse`
  - The bless/curse token-economy build-around: adding, removing/returning, replacing, sealing, and reacting to bless/curse tokens. Proposed by fhv, par, tic. Distinct from generic chaos-token-control (which is bless/curse-agnostic). Players building a Blessed or Cursed deck search this whole subsystem as one unit.
- ✅ implemented — `big-money` (`BigMoney`) → `TagTypeGainResource.GainResourceYou`, `TagTypeGainResource.GainResourceInvestigator`, `TagTypeGainResource.ResourceMoveInvestigator`, `TagTypeSkillValueSource.SkillValueFromResource`, `TagTypeUsesAccumulate.UsesAccumulate`, `TagTypeCondition.ConditionResource`
  - The recurring 'big money' resource-economy archetype the rubric calls out: generate/move/bank resources, scale skill value off a high pool, and pay off resource thresholds. Proposed by eote, fhv, nat, ptc, rt, tcu, tfa. Groups the resource generation/movement/banking tags with the resource-as-skill and resource-threshold payoffs.
- ✅ implemented — `evasion-package` (`EvasionPackage`) → `TagTypeAuto.AutoEvade`, `TagTypeTestless.TestlessEvade`, `TagTypeEnemyEngage.EnemyEngageDisengage`, `TagTypeEnemyDebuff.EnemyCannotEngage`, `TagTypeEnemyDebuff.EnemyExhaust`, `TagTypeEnemyValue.EnemyValueEvadeReduction`, `TagTypeAoo.AooNoProvoke`, `TagTypeLocationMove.LocationMoveInvestigatorSelf`
  - The evasion/escape toolkit players deckbuild as one unit: auto/testless evade, forced disengage, cannot-engage debuff, enemy exhaust, evade reduction, no-AoO maneuvering, and self-relocation to break melee. Proposed by par, ptc, rt. Existing AutoEvade/TestlessEvade are joined by the new disengage/debuff/aoo tags.
- ✅ implemented — `protector-tank` (`ProtectorTank`) → `TagTypeSoak.SoakDamage`, `TagTypeSoak.SoakHorror`, `TagTypeTank.TankRedirectAttack`, `TagTypeTank.TankRedirectEncounter`, `TagTypeTank.TankRedirectDamageHorror`, `TagTypeReady.ReadyAlly`
  - The Guardian/defender 'take the hit for the team' package: soak damage/horror, redirect attacks/encounter cards/damage onto yourself. Proposed by ptc; reinforced by tsk/tfa redirect cards. Groups the new soak and tank tags.
- ✅ implemented — `fail-forward` (`FailForward`) → `TagTypeTimingAfter.TimingAfterFailSkillTest`, `TagTypeTestRepeat.TestRepeatFailed`, `TagTypeCancel.CancelFailedTestEffects`, `TagTypeSkillValue.SkillValueFailByOrLess`, `TagTypeSkillValue.SkillValueFailByExactly`, `TagTypeSkillValue.SkillValueFailByDynamic`, `TagTypeSkillTestCondition.SkillTestConditionFail`
  - The Survivor 'benefit when you fail a skill test' identity: trigger off, reward, mitigate, or re-attempt a failed test. Proposed by ste. Broader than the existing fail-by compound (margins only); adds the fail-timing trigger, re-test, and cancel-fail-effects.
- ⏳ proposed — `exile-package` (`ExilePackage`) → `TagTypeExile.ExileSelf`
  - The exile (one powerful use, then removed from collection / repurchase with XP) deckbuilding sub-theme. Introduced in dwl and recurring (ptc, ste). A deckbuilder finds all 'one-shot, then gone' cards via this. (Campaign XP-repurchase support such as ste Deja Vu is rejected as a standalone tag but conceptually anchors here.)
- ✅ implemented — `into-play-cheat` (`IntoPlayCheat`) → `TagTypePlayArea.PlayAreaIntoPlayFromHand`, `TagTypePlayArea.PlayAreaIntoPlayFromDeck`, `TagTypePlayArea.PlayAreaIntoPlayFromDiscard`, `TagTypePlayArea.PlayAreaPlayFromOtherZone`
  - Putting cards directly into play from hand/deck/discard (bypassing the play action / sometimes cost), or playing from a non-hand zone. A tempo/recursion enabler family. Proposed by dwl, eote, nat, ptc, rt. Groups the new play-area into-play members.
- ✅ implemented — `discard-pile-value` (`DiscardPileValue`) → `TagTypeRecursion.RecursionPlayFromDiscard`, `TagTypeRecursion.RecursionSelfToHand`, `TagTypeRecursion.RecursionReplay`, `TagTypeRecursion.RecursionEvent`, `TagTypeRecursion.RecursionSkill`, `TagTypeDiscardPile.DiscardPileToHand`, `TagTypeDiscardPile.DiscardPileToDeck`
  - The graveyard/flashback value archetype: play directly from discard, return cards (or themselves) from discard, replay events. Proposed by fhv, tdc, win. Groups existing and new recursion/discard-pile tags.
- ⏳ proposed — `deck-top-control` (`DeckTopControl`) → `TagTypeDeckLook.DeckLookYou`, `TagTypeDeckLook.DeckLookEncounter`, `TagTypeCommit.CommitFromNonHand`, `TagTypeEncounter.EncounterRevealChoose`, `TagTypeChaosPredict.ChaosPredict`
  - The divination/foresight 'control what you draw' archetype: scry player/encounter decks, commit from deck-top, choose among revealed encounter cards, predict draws. Proposed by dwl, eote, jac. Mirrors the existing clue-tech compound.
- ✅ implemented — `action-compression` (`ActionCompression`) → `TagTypeActionActivate.ActionActivateIgnoringCost`, `TagTypeActionActivate.ActionActivateFromHand`, `TagTypeActionAdditional.ActionAdditional`, `TagTypeActionAdditional.ActionAdditionalAttack`, `TagTypeReady.ReadySelf`, `TagTypeReady.ReadyAsset`
  - The tempo/combo 'do more per action' archetype: resolve abilities without paying their cost, activate from hand, gain extra actions/attacks, ready assets to act again. Proposed by fhv, nat, tdc, tde, tsk. Groups the new activate/ready tags with ActionAdditional.
- ⏳ proposed — `multiclass-payoff` (`MulticlassPayoff`) → `TagTypeMulticlass.MulticlassClassCount`
  - The eote five-color/rainbow build-around: cards rewarding many different classes among cards you control. A single-pack-anchored but distinctive archetype worth naming for future packs. Proposed by eote.

> Note: implemented compounds reference only members that exist today (`into-play-cheat` and `deck-top-control` will gain more members — commit-from-deck-top, encounter reveal choice, chaos predict, play-from-other-zone — as those tags land).

## Rejected proposals

- **ActionAdditionalGain (grant N extra actions this turn) as a new tag** — Covered by existing TagActionAdditional via its optional 'value' field; confirmed by eote/tcu/tdc/tsk coverage notes. Added a 'target' arg instead (see argumentAdditions). _(dwl)_
- **ActionExtraNextTurn (extra actions on a future turn)** — Folds into TagActionAdditional (Bide Your Time is still 'gain additional actions'); the deferred-turn nuance is too thin to mint a tag. _(fhv)_
- **AttachEnemyParley** — Redundant with existing TagAttachEnemy (the generic attach-to-enemy is the searchable unit); the pack author flagged it for dropping. _(fhv)_
- **BondedSwap (swap a card with its bonded partner moving tokens)** — Niche transform mechanic on a handful of bespoke cards; the bonded archetype is already served by DeckSearchBonded. Below the cross-pack threshold. _(fhv)_
- **ChaosEffectTreatModifierAsZero** — Equivalent to / folded into an optional 'treatAs' arg on the existing ChaosEffectModifier (see argumentAdditions); not a distinct tag. _(fhv)_
- **ChaosRevealReturnAndRedraw (cancel a revealed token, return it, reveal new)** — Adequately expressed by CancelChaos + ChaosRevealAnotherInstead (verified in tdc/tsk notes for Uncanny Specimen/Custom Modifications); no new tag needed. _(fhv)_
- **GainResourceDynamicClassCount** — Folded into MulticlassClassCount (reward='resource') and the GainResource 'dynamic' arg; the resource gain itself is already the searchable tag. _(eote)_
- **GainResourceBank as its own gain tag** — Modeled as UsesAccumulate (place renamed tokens on a card, later spend) — the same banking mechanic; avoids a near-duplicate. Grouped under big-money. _(tcu)_
- **UsesRechargeAsset (add charges to an in-play asset)** — Expressible via the existing UsesSupport* tags (supportType:'place') which already model placing charges/secrets onto another asset (verified in tdc/ptc notes). _(jac)_
- **ChaosPredict split into per-kind (symbol/parity/number/margin) variants** — Consolidated into a single ChaosPredict tag; the prediction kind is a low-value filter, not separate searches. _(jac)_
- **DownsideSelf in a new 'downside' folder** — Kept the concept but placed it under chaos/downside.ts (ChaosDownsideDamage/Horror/Resource) since every instance is a chaos-token-triggered penalty; a generic 'downside' category would be too broad. _(jac)_
- **CommitMaxPerTest in a separate 'commit' restriction tag set** — Kept the concept as CommitMax in the consolidated commit/main.ts rather than a standalone file. _(jac)_
- **Riot Whistle ActionAdditional canOnlyBeUsedTo:'engage'** — Requires adding 'engage' to kohaku's BasicAction enum (confirmed it currently lacks it: fight/investigate/evade/move/parley/resign/play/draw/resource). Out of scope for this taxonomy delta; the additional-action itself is already tagged. _(tic)_
- **CostAddChaosTokenToPlay as a separate cost tag** — Modeled as ChaosBagAddCurse/AddBless (the 'additional cost: add tokens' is the same bag-manipulation effect); avoids splitting one mechanic across cost/ and chaos/. _(tic)_
- **WeaknessCancelDraw kept generic 'deck' category** — Implemented instead as CancelWeaknessDraw under the existing cancel/main.ts to sit with the other cancel variants. _(tic)_
- **EvadeAdditional (evade an additional enemy)** — Single-card (Impromptu Barrier); below threshold and adequately surfaced via the evasion package. No archetype yet. _(tfa)_
- **RecursionSelfFromDiscard with shuffleBack arg as distinct from RecursionSelfToHand** — Consolidated: play-from-discard is RecursionPlayFromDiscard; return-to-hand is RecursionSelfToHand. The shuffle-back rider is obvious-from-text. _(tfa)_
- **DeckSearchCollection (search your whole collection)** — Very rare (Memories of Another Life, Transfiguration); a campaign/deckbuilding edge case below the cross-pack threshold. Can be a future DeckSearch member if it recurs. _(tdc)_
- **ResolveFightOnRevealedAsset as its own tag** — Folded into ActionActivateIgnoringCost (resolving an ability on a card without paying its cost) — Robert Castaigne/Remington are the same 'free activation' mechanic. _(tdc)_
- **New use-token types 'shell' and 'leads' as enum members now** — Deferred: each appears on ~1 card (Mauser Tankgewehr / On Their Heels). Add to uses/starting.ts only if they recur; 'inspiration' is added now as it appears on multiple cards. _(tdc)_
- **CampaignExperience.ExperienceRepurchaseDiscount** — A between-scenario XP/campaign-log effect, not an in-play game effect; the taxonomy intentionally omits campaign-layer mechanics (cf. Green Man Medallion, Charon's Obol, Arcane Research). Conceptually supports exile-package but not tagged. _(ste)_
- **Granny Orne / Quick Learner bidirectional skill-value & difficulty modifiers** — ~2 cards with a niche +1/-1 knob that doesn't fit boost (named +X) cleanly; below threshold pending more examples. _(ste)_
- **doom-engine-self as a compound** — Adequately expressed by existing DoomAdd + DoomRemove plus the new CostAddDoomSelf; a dedicated compound for one pack's self-doom engine is premature. _(tsk)_
- **TestCommitOtherInvestigator as a standalone 'test' tag** — Kept the concept but placed under the consolidated commit/main.ts as CommitOtherInvestigator (with range arg). _(tsk)_
- **Enemy-blank / disable-text-box (Mind Wipe)** — Single-card; 'treat enemy text box as blank' has no cross-pack support. Below threshold. _(rt)_
- **Sharpshooter 'use enemy evade instead of fight value' enemy-stat substitution** — Single-card; partially expressible via EnemyValueEvade/Fight presence. Below threshold for a dedicated substitution tag. _(win)_

