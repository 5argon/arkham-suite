# Existing Tag Taxonomy Digest
# (auto-built by script/build-digest.ts; agents: DO NOT re-propose tags already here)
# Per tag: definition source, then MEMBERS (confirmed precedent — cite one when applying the tag),
# RULING lines (binding conventions from past reviews), and NOT-MEMBERS (adjudicated anti-examples).

## GENERAL RULINGS (apply everywhere)
- MYRIAD is intentionally untagged (deckbuilding keyword, like Permanent/Exceptional) — ruled 2026-07-16 during TDE wave 2.
- Tony Morgan's BOUNTY economy is intentionally untagged — investigator-specific, not useful for cross-deck search (ruled 2026-07-16). Bounty Contracts' 'Uses (6 bounties)' also gets no uses-starting-* tag.
- Bonded SET-ASIDE plumbing ('set it aside, out of play', return-to-set-aside instead of discard) is intentionally untagged — inherent bonded-card behavior; bonded-card + bonded-fetch carry the archetype (ruled 2026-07-16).
- A timing WINDOW id must stay neutral even when most members are Forced — timing-forced-leaves-play was renamed timing-when-leaves-play when Tetsuo Mori responded with a [reaction] (2026-07-16; same precedent as timing-when-take-damage).
- TimingQualifier conventions: 'at the end of <phase/round/turn>' forced triggers → AtIf; 'when your turn begins' → When; 'would reveal/would advance' pre-windows → Before.
- Level variants of the same card may LEGITIMATELY diverge — the higher-level card is intentionally better (Survival Instinct 01581 'disengage' vs 02235 'evade' is a real design difference, ruled 2026-07-03). Never force different-level variants to match; but DO check same-name twins for accidental divergence (values, missing halves) — that was a large bug class.
- Self-harm (cost-*-damage/horror-self) is only for VOLUNTARY player-ability cards (asset/event). Treacheries/weaknesses that force horror/damage on you (Doomed, Shell Shock, Nihilism) are NOT self-harm — a 'treachery hurts you' concept has intentionally no tag yet.
- A card playing itself from hand on a special trigger (Cryptic Writings) is play-from-hand, NOT recursion — recursion tags need a non-hand zone.
- Discovery vs investigation payoff: timing-after-discover-clue fires on clue DISCOVERY including testless; timing-after-successfully-investigate requires a successful investigate TEST by someone.

==== FILE: src/tags/action/activate.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeActionActivate {
  ActionActivateIgnoringCost = "action-activate-ignoring-cost",
  ActionActivateFromHand = "action-activate-from-hand",
}

interface TagActionActivateBase extends TagBase {}

/**
 * Resolve another card's [action]/[fast] ability without paying its cost
 * (Hand-Eye Coordination, Dirty Deeds, Flurry of Blows; also resolving a Fight
 * ability on a never-deployed weapon). A major action-compression/combo enabler.
 */
export interface TagActionActivateIgnoringCost extends TagActionActivateBase {
  type: TagTypeActionActivate.ActionActivateIgnoringCost;
}

/**
 * Activate an asset's printed [action] ability while it is still IN YOUR HAND
 * (the Anchor Chain / Hand Hook / Nautical Charts cycle).
 */
export interface TagActionActivateFromHand extends TagActionActivateBase {
  type: TagTypeActionActivate.ActionActivateFromHand;

  /** True when activating discards the card instead of exhausting it. */
  discardInstead?: boolean;
}

--- action-activate-ignoring-cost (22 members) ---
MEMBER: Knowledge is Power (05231) "Fast. Play only during your turn. | Choose a [[Tome]] or [[Spell]] asset you control, or reveal a [[Tome]] or [[Spell]] asset from your hand. Resolve an [action] or [fast…"
MEMBER: Abigail Foreman (06324) "[fast]: Attach a [[Tome]] asset in your play area to Abigail Foreman, or switch a [[Tome]] asset in your play area with an attached asset. The asset attached to her takes…"
MEMBER: Sword Cane (07029) "Playing Sword Cane does not provoke attacks of opportunity. | [reaction] After Sword Cane enters play: Immediately trigger its "[action]" ability without paying its cost.…"
…and 19 more: Quickdraw Holster (08089), Word of Woe (09012), Trigger Man (09076), Ad Hoc (10002), Task Force (10027), Hand-Eye Coordination (10030), Flurry of Blows (10037), …
RULING: Also covers RE-resolving an ability without paying its [action] cost (Abigail Foreman 06324 replaying a Tome ability — retagged off recursion-replay, whose members replay event CARDS, not abilities).

--- action-activate-from-hand (6 members) ---
MEMBER: Knowledge is Power (05231) "Fast. Play only during your turn. | Choose a [[Tome]] or [[Spell]] asset you control, or reveal a [[Tome]] or [[Spell]] asset from your hand. Resolve an [action] or [fast…"
MEMBER: True Magick (08070) "Uses (1 charge). Replenish this charge at the start of each round. | You may resolve abilities on [[Spell]] assets in your hand by revealing them from your hand. Treat Tr…"
MEMBER: Robert Castaigne (11062) "You get +1 [combat]. | [fast] Exhaust Robert Castaigne: <b>Fight.</b> Reveal a [[Firearm]] asset that takes up 1 or fewer hand slots from your hand. Resolve a <b>Fight</b…"
…and 3 more: Anchor Chain (11081), Hand Hook (11082), Nautical Charts (11084)

==== FILE: src/tags/action/additional.ts ====
import { BasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";

export enum TagTypeActionAdditional {
  ActionAdditional = "action-additional",
  ActionAdditionalAttack = "action-additional-attack",
  ActionTakeImmediate = "action-take-immediate",
}

interface TagActionAdditionalBase extends TagBase {}

export interface TagActionAdditional extends TagActionAdditionalBase {
  type: TagTypeActionAdditional.ActionAdditional;
  canOnlyBeUsedTo?: BasicAction;

  /**
   * Assume 1 action if not specified.
   */
  value?: number;

  /**
   * Who receives the additional action(s): "self" (default) or a chosen
   * "investigator" (e.g. Guidance, Lifeline). Omit for self.
   */
  target?: "self" | "investigator";
}

/**
 * An extra ATTACK within the resolution of a single card ("fight that enemy
 * again"), NOT a new game action — so distinct from ActionAdditional which
 * grants a usable action. A burst-damage archetype.
 */
export interface TagActionAdditionalAttack extends TagActionAdditionalBase {
  type: TagTypeActionAdditional.ActionAdditionalAttack;
}

/**
 * Take an action IMMEDIATELY, outside the normal action sequence ("take an
 * action as if it were your turn" / Haste's "take another action of that type
 * again") — Quick Thinking, Swift Reflexes, Haste, The Stars Are Right. NOT a
 * pool of extra actions for the turn (that's action-additional — Leo De Luca);
 * both roll into the Extra Actions compound (ruled 2026-07-17, TDE full review).
 */
export interface TagActionTakeImmediate extends TagActionAdditionalBase {
  type: TagTypeActionAdditional.ActionTakeImmediate;
  /**
   * Who takes the immediate action: "self" (default) or a chosen "investigator"
   * (The Stars Are Right).
   */
  target?: "self" | "investigator";
}

--- action-additional (39 members) ---
MEMBER: Police Badge (01527) "You get +1 [willpower]. | [free] While an investigator at your location is taking his or her turn, discard Police Badge: That investigator may take 2 additional actions t…"
MEMBER: Leo De Luca (01548) "You may take an additional action during your turn."
MEMBER: Leo De Luca (01554) "You may take an additional action during your turn."
…and 36 more: .41 Derringer (01688), Ace in the Hole (02266), Guidance (03265), .41 Derringer (03234), Finn Edwards (04003), Father Mateo (04004), Borrowed Time (04308), …

--- action-additional-attack (5 members) ---
MEMBER: One-Two Punch (60117) "<b>Fight.</b> You get +1 [combat] for this attack. If you succeed, you may fight that enemy again. You get +2 [combat] and deal +1 damage for that attack."
MEMBER: One-Two Punch (60132) "<b>Fight.</b> You automatically succeed and deal +1 damage for this attack. You may fight again. You get +3 [combat] and deal +2 damage for that attack."
MEMBER: Butterfly Swords (08025) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. After this attack, you may exhaust Butterfly Swords to fight again, adding your [agility] to your skill value…"
…and 2 more: Butterfly Swords (08030), Flurry of Blows (10037)

--- action-take-immediate (11 members) ---
MEMBER: Quick Thinking (02229) "If this skill test is successful by 2 or more, after it resolves, you may immediately take an action as if it were your turn (this action does not count toward the number…"
MEMBER: Swift Reflexes (05156) "Fast. Play during any investigator's turn, except during an action. | Immediately take an action as if it were your turn. This action does not count toward the number of …"
MEMBER: The Stars Are Right (06028) "Bonded (Stargazing). | <b>Revelation</b> - Remove The Stars Are Right from the game. Choose an investigator. That investigator draws 1 card, gains 1 resource, and may tak…"
…and 8 more: Haste (06239), Eon Chart (08100), Carson Sinclair (09001), Grappling Hook (09009), Honed Instinct (09061), At a Crossroads (09109), Blood of Thoth (11065), …
RULING: 'Take an action as if it were your turn' / Haste's repeat = an IMMEDIATE out-of-sequence action (Quick Thinking, Swift Reflexes, Haste, The Stars Are Right), distinct from action-additional (a bigger action pool — Leo De Luca). Both are Extra Actions compound members (ruled 2026-07-17).

==== FILE: src/tags/action/bold.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeActionBold {
  ActionBoldFight = "action-bold-fight",
  ActionBoldEngage = "action-bold-engage",
  ActionBoldEvade = "action-bold-evade",
  ActionBoldInvestigate = "action-bold-investigate",
  ActionBoldMove = "action-bold-move",
  ActionBoldParley = "action-bold-parley",
  ActionBoldResign = "action-bold-resign",
}

interface TagActionBoldBase extends TagBase {}

export interface TagActionBoldFight extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldFight;
}

export interface TagActionBoldEngage extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldEngage;
}

export interface TagActionBoldEvade extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldEvade;
}

export interface TagActionBoldInvestigate extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldInvestigate;
}

export interface TagActionBoldMove extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldMove;
}

export interface TagActionBoldParley extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldParley;
}

export interface TagActionBoldResign extends TagActionBoldBase {
  type: TagTypeActionBold.ActionBoldResign;
}

--- action-bold-fight (204 members) ---
MEMBER: Roland's .38 Special (01506) "Roland Banks deck only. | Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack (if there are 1 or more clues on your location, you ge…"
MEMBER: .45 Automatic (01516) "Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack. This attack deals +1 damage."
MEMBER: Machete (01520) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. If the attacked enemy is the only enemy engaged with you, this attack deals +1 damage."
…and 201 more: Shotgun (01529), Switchblade (01544), .41 Derringer (01547), Backstab (01551), Shrivelling (01560), Baseball Bat (01574), Knife (01586), …

--- action-bold-engage (3 members) ---
MEMBER: "Get over here!" (60114) "<b>Engage.</b> <b>Fight.</b> Choose a non-[[Elite]] enemy at your location or a connecting location. Move that enemy to your location, engage it, and attack it."
MEMBER: "Get over here!" (60123) "Fast. Play during any [free] window. | <b>Engage. Fight.</b> Choose a non-[[Elite]] enemy up to 2 locations away. Move that enemy to your location, engage it, and attack …"
MEMBER: Righteous Hunt (07109) "<b>Engage.</b> Choose an enemy up to 2 locations away. Move (one location at a time) to that enemy's location, engage it, and add [bless] tokens to the chaos bag equal to…"

--- action-bold-evade (66 members) ---
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Cunning Distraction (01578) "<b>Evade.</b> Automatically evade all enemies at your location."
…and 63 more: Bind Monster (02031), Bait and Switch (02034), Fire Extinguisher (02114), Strange Solution (02264), Stealth (03028), Suggestion (03268), Handcuffs (04265), …

--- action-bold-investigate (102 members) ---
MEMBER: Burglary (01545) "[action] Exhaust Burglary: <b>Investigate.</b> If you succeed, instead of discovering clues, gain 3 resources."
MEMBER: Flashlight (01587) "Uses (3 supplies). | [action] Spend 1 supply: <b>Investigate.</b> Your location gets -2 shroud for this investigation."
MEMBER: Seeking Answers (01685) "<b>Investigate.</b> If you succeed, instead of discovering a clue at your location, discover 2 total clues from among your location and connecting locations."
…and 99 more: Lockpicks (01687), Rite of Seeking (01689), Duke (02014), Seeking Answers (02023), Rite of Seeking (02028), Rite of Seeking (02233), Deciphered Reality (02303), …

--- action-bold-move (10 members) ---
MEMBER: Shortcut (03232) "Fast. Play only during your turn. | Attach to your location. Attached location gains: | "[free] Exhaust Shortcut: <b>Move</b> <i>(to a connecting location)</i>. Any inves…"
MEMBER: Astral Travel (03034) "<b>Move.</b> Move to any revealed location and reveal a random token from the chaos bag. If you reveal a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbo…"
MEMBER: Astral Travel (60413) "<b>Move.</b> Move to any revealed location and reveal a random token from the chaos bag. If you reveal a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbo…"
…and 7 more: The Truth Beckons (07154), Scout Ahead (08047), Eon Chart (08098), Sled Dog (08127), Bound for the Horizon (11102), Physical Fitness (60164), Physical Fitness (60174)

--- action-bold-parley (38 members) ---
MEMBER: Persuasion (04105) "<b>Parley.</b> Choose a non-weakness [[Humanoid]] enemy at your location and test [intellect] (3). This test gets +X difficulty, where X is that enemy's horror value. If …"
MEMBER: Interrogate (05020) "<b>Parley.</b> Choose a [[Humanoid]] enemy at your location and test [combat] (3). This test gets +X difficulty, where X is the chosen enemy's damage value. If you succee…"
MEMBER: Motivational Speech (09028) "<b>Parley.</b> Choose an investigator at your location. That investigator may play an [[Ally]] asset from their hand, reducing its cost by 3."
…and 35 more: Existential Riddle (09052), Power Word (09081), String of Curses (09088), Beguile (10010), Hold Up (10026), Eyes of Valusia (10035), Confound (10057), …

--- action-bold-resign (1 member) ---
MEMBER: "I'm outta here!" (02151) "Play only if there is a scenario card with a 'resign' ability in play. | <b>Resign.</b> You get the hell out of here."

==== FILE: src/tags/action/lose.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeActionLose {
  ActionLoseAction = "action-lose",
  ActionEndTurn = "action-end-turn",
}

interface TagActionLoseBase extends TagBase {}

export interface TagActionLoseAction extends TagActionLoseBase {
  type: TagTypeActionLose.ActionLoseAction;
}

/** End your turn as a drawback/tradeoff for a powerful effect (distinct from losing a single action). */
export interface TagActionEndTurn extends TagActionLoseBase {
  type: TagTypeActionLose.ActionEndTurn;
}

--- action-lose (10 members) ---
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Rite of Seeking (01689) "Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. You get +2 [willpower] for this test. If you succee…"
…and 7 more: Rite of Seeking (02028), Rite of Seeking (02233), Geared Up (08019), Brand of Cthugha (08090), Brand of Cthugha (08092), At a Crossroads (09109), Rite of Seeking (51007)

--- action-end-turn (10 members) ---
MEMBER: Rite of Seeking (01689) "Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. You get +2 [willpower] for this test. If you succee…"
MEMBER: Rite of Seeking (02028) "Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. If you succeed, discover 1 additional clue at this …"
MEMBER: Rite of Seeking (02233) "Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. You get +2 [willpower] for this test. If successful…"
…and 7 more: Cheat Death (03310), Coup de Grâce (04269), Pay Day (04233), "Let God sort them out..." (06160), Calculated Risk (09070), Flurry of Blows (10037), Rite of Seeking (51007)

==== FILE: src/tags/aoo/main.ts ====
import { TestingBasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";

export enum TagTypeAoo {
  AooNoProvoke = "aoo-no-provoke",
}

interface TagAooBase extends TagBase {}

/**
 * This action does not provoke attacks of opportunity. The optional `action`
 * distinguishes blanket protection (e.g. engage actions do not provoke) from a
 * single ability's protection.
 */
export interface TagAooNoProvoke extends TagAooBase {
  type: TagTypeAoo.AooNoProvoke;
  action?: TestingBasicAction;
}

--- aoo-no-provoke (43 members) ---
MEMBER: Cat Burglar (01555) "You get +1 [agility]. | [action] Exhaust Cat Burglar: Disengage from each enemy engaged with you and move to a connecting location. This action does not provoke attacks o…"
MEMBER: Sefina Rousseau (03003) "<b>Forced</b> - When you would draw your opening hand: Draw 13 cards, instead. Choose up to 5 events to place beneath this card and keep 8 cards as your opening hand. Dis…"
MEMBER: Trench Knife (03147) "Engage actions you perform do not provoke attacks of opportunity. | [action]: <b>Fight.</b> You get +X [combat] for this attack. X is the number of enemies engaged with y…"
…and 40 more: "I'll see you in hell!" (03189), Mano a Mano (03229), Archaic Glyphs (03193), Lupara (03309), Lantern (03036), Jake Williams (04008), Scene of the Crime (04103), …

==== FILE: src/tags/attach/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeAttach {
  AttachAsset = "attach-asset",
  AttachEnemy = "attach-enemy",
  AttachInvestigator = "attach-investigator",
  AttachLocation = "attach-location",
}

interface TagAttachBase extends TagBase {}

export interface TagAttachAsset extends TagAttachBase {
  type: TagTypeAttach.AttachAsset;
}

export interface TagAttachEnemy extends TagAttachBase {
  type: TagTypeAttach.AttachEnemy;
}

/** Attaches to an investigator (Delay the Inevitable) — rides with that investigator rather than a zone. */
export interface TagAttachInvestigator extends TagAttachBase {
  type: TagTypeAttach.AttachInvestigator;
}

export interface TagAttachLocation extends TagAttachBase {
  type: TagTypeAttach.AttachLocation;
}

--- attach-asset (25 members) ---
MEMBER: Trusted (04019) "Fast. Play only during your turn. | Attach to an [[Ally]] asset you control. | Attached asset gets +1 health and +1 sanity."
MEMBER: Reliable (04020) "Fast. Play only during your turn. | Attach to an [[Item]] asset you control. | While resolving a triggered ability on attached asset, you get +1 to each of your skills."
MEMBER: Custom Ammunition (04193) "Fast. Play only during your turn. | Attach to a [[Firearm]] asset controlled by an investigator at your location. Place 2 ammo on that asset. Limit 1 per asset. | Attacks…"
…and 22 more: Dr. Elli Horowitz (04021), Well-Maintained (05152), Telescopic Sight (05230), Abigail Foreman (06324), Enchant Weapon (07261), Jury-Rig (08074), Quickdraw Holster (08089), …
RULING: The card ATTACHES to something. HOSTING attachments is not attaching — Dayana Esperence receives Spells but attaches nothing (removed; no 'receives-attachment' tag exists, deliberately).

--- attach-enemy (18 members) ---
MEMBER: Bind Monster (02031) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed and the enemy is non‑[[Elite]], evade it and attach Bind Monster to it. | [reacti…"
MEMBER: Snare Trap (03199) "Attach to your location. Limit 1 per location. | <b>Forced</b> - After a non-[[Elite]] enemy enters attached location: Exhaust that enemy, disengage it from all investiga…"
MEMBER: Handcuffs (04265) "[action] If Handcuffs is not attached to an enemy: <b>Evade.</b> Use only on a [[Humanoid]] enemy. This evasion attempt uses [combat] instead of [agility]. If you succeed…"
…and 15 more: On the Hunt (08028), Fend Off (08082), Bolas (09025), Grievous Wound (09027), Handcuffs (09035), Existential Riddle (09052), Power Word (09081), …

--- attach-investigator (2 members) ---
MEMBER: Delay the Inevitable (05021) "Fast. Play only during your turn. Attach to an investigator at your location, under his or her control. | [reaction] When you are dealt damage and/or horror: Discard Dela…"
MEMBER: Spectral Shield (11071) "Fast. Play only during your turn. Attach to a player card with health and/or sanity at your location. | <b>Forced</b> - When attached card takes 1 or more damage/horror: …"

--- attach-location (24 members) ---
MEMBER: Barricade (01538) "Attach to your location. | Non-[[Elite]] enemies cannot move into attached location. | <b>Forced</b> - When an investigator leaves attached location: Discard Barricade."
MEMBER: Lure (02156) "Attach to your location. | During the enemy phase, each enemy that moves does so along the shortest path toward the attached location, instead of to where it would normal…"
MEMBER: Ambush (03148) "Attach to your location. | If there are no investigators at attached location, discard Ambush. | <b>Forced</b> - After an enemy spawns at attached location: Deal 2 damage…"
…and 21 more: Shortcut (03232), Hiding Spot (03038), Snare Trap (03199), The Skeleton Key (04270), Lure (05323), Open Gate (06029), Under Surveillance (07157), …

==== FILE: src/tags/auto/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeAuto {
  AutoEvade = "auto-evade",
  AutoSuccess = "auto-success",
}

interface TagAutoBase extends TagBase {}

export interface TagAutoEvade extends TagAutoBase {
  type: TagTypeAuto.AutoEvade;
}

export interface TagAutoSuccess extends TagAutoBase {
  type: TagTypeAuto.AutoSuccess;
}

--- auto-evade (39 members) ---
MEMBER: Stray Cat (01576) "[free] Discard Stray Cat: Automatically evade a non-[[Elite]] enemy at your location."
MEMBER: Cunning Distraction (01578) "<b>Evade.</b> Automatically evade all enemies at your location."
MEMBER: Archaic Glyphs (03193) "Researched. Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> If you succeed, you may automatically evade an engaged enemy. This action does not provoke at…"
…and 36 more: Cheap Shot (03194), Persuasion (04105), Stunning Blow (04112), Disc of Itzamna (60207), Cheap Shot (60312), Cheap Shot (60323), Tennessee Sour Mash (05191), …

--- auto-success (17 members) ---
MEMBER: Stroke of Luck (02271) "Commit only to a skill test you are performing. | After revealing chaos tokens for this test, you may choose to exile Stroke of Luck. If you do, this test is automaticall…"
MEMBER: Father Mateo (04004) "[reaction] When an investigator reveals an [auto_fail] chaos token: Cancel that token and treat it as an [elder_sign] token, instead. (Limit once per game.) | [elder_sign…"
MEMBER: One-Two Punch (60132) "<b>Fight.</b> You automatically succeed and deal +1 damage for this attack. You may fight again. You get +3 [combat] and deal +2 damage for that attack."
…and 14 more: Preston Fairmont (05003), Hope (06031), Zeal (06032), Augur (06033), Three Aces (06199), Beloved (07036), Paradoxical Covenant (07120), …

==== FILE: src/tags/bonded/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeBonded {
  BondedCard = "bonded-card",
  BondedFetch = "bonded-fetch",
}

interface TagBondedBase extends TagBase {}

/**
 * This card is BONDED: it starts set aside, out of play, and returns to set-aside
 * instead of the discard/deck (Soothing Melody, Blood-Rite, Wish Eater, Essence of
 * the Dream). Was `deck-bonded` — regrouped 2026-07-16 because bonded cards live
 * OUTSIDE the deck; the deck- prefix was a lie.
 */
export interface TagBondedCard extends TagBondedBase {
  type: TagTypeBonded.BondedCard;
}

/**
 * Fetch a card from your SET-ASIDE bonded pool (Gate Box, Hallowed Mirror, Occult
 * Lexicon, Dream Diary, Empty Vessel's swap). Was `deck-search-bonded` — this is
 * not a deck search (and is deliberately NOT a member of the Search compound), so
 * it carries no range.
 */
export interface TagBondedFetch extends TagBondedBase {
  type: TagTypeBonded.BondedFetch;
}

--- bonded-card (27 members) ---
MEMBER: Soothing Melody (05314) "Bonded (Hallowed Mirror). | Heal 2 damage or 2 horror (or any combination thereof) from among investigators and/or [[Ally]] assets at your location. Draw 1 card."
MEMBER: Blood-Rite (05317) "Bonded (Occult Lexicon). | Draw 2 cards. Discard up to 2 cards from your hand. For each card thusly discarded, you may either gain 1 resource, or spend 1 resource to deal…"
MEMBER: Bloodlust (06019) "Bonded (The Hungering Blade). | <b>Revelation</b> - Remove 2 offerings from The Hungering Blade to attach Bloodlust to it. If you cannot, take 1 horror and shuffle Bloodl…"
…and 24 more: Pendant of the Queen (06022), Guardian of the Crystallizer (06025), The Stars Are Right (06028), Hope (06031), Zeal (06032), Augur (06033), Essence of the Dream (06113), …
RULING: The bonded card itself, living set aside outside the deck (Soothing Melody 05314, Blood-Rite 05317, Wish Eater). The OWNER side that fetches bonded cards = bonded-fetch. Both were deck-* prefixed until 2026-07-16 — regrouped because bonded cards are NOT deck contents (Guardian review).

--- bonded-fetch (35 members) ---
MEMBER: Hallowed Mirror (05313) "Limit 1 per deck. | <b>Forced</b> - After Hallowed Mirror enter play: Search your bonded cards for 3 copies of Soothing Melody. Add 1 to your hand and shuffle the other 2…"
MEMBER: Occult Lexicon (05316) "Limit 1 per deck. | <b>Forced</b> - After Occult Lexicon enters play: Search your bonded cards for 3 copies of Blood-Rite. Add 1 to your hand and shuffle the other 2 into…"
MEMBER: Gate Box (06013) "Luke Robinson deck only. Uses (3 charges). | [fast] Exhaust Gate Box and spend 1 charge: Disengage from each enemy engaged with you, search your bonded cards for Dream-Ga…"
…and 32 more: Detached from Reality (06014), The Hungering Blade (06018), Segment of Onyx (06021), Crystallizer of Dreams (06024), Stargazing (06027), Miss Doyle (06030), Dream Diary (06112), …
RULING: Fetch from the SET-ASIDE bonded pool (Gate Box, Dream Diary, Empty Vessel). NOT a deck search: no range arg, and deliberately NOT a Search-compound member (ruled 2026-07-16).

==== FILE: src/tags/buff/asset-stats.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeBuffAssetStats {
  BuffAssetHealth = "buff-asset-health",
  BuffAssetSanity = "buff-asset-sanity",
}

interface TagBuffAssetStatsBase extends TagBase {
  value: number;
}

/**
 * Raises the max health (durability) of your assets
 * (e.g. "each asset you control with health gets +1 health").
 * Distinct from heal, which restores but does not raise the maximum.
 */
export interface TagBuffAssetHealth extends TagBuffAssetStatsBase {
  type: TagTypeBuffAssetStats.BuffAssetHealth;
}

/**
 * Sanity counterpart of BuffAssetHealth: raises the max sanity of your assets.
 */
export interface TagBuffAssetSanity extends TagBuffAssetStatsBase {
  type: TagTypeBuffAssetStats.BuffAssetSanity;
}

--- buff-asset-health (2 members) ---
MEMBER: Trusted (04019) "Fast. Play only during your turn. | Attach to an [[Ally]] asset you control. | Attached asset gets +1 health and +1 sanity."
MEMBER: The Star • XVII (54001) "Each asset you control with health gets +1 health. | Each asset you control with sanity gets +1 sanity. | [reaction] When the game begins, if The Star • XVII is in your o…"

--- buff-asset-sanity (2 members) ---
MEMBER: Trusted (04019) "Fast. Play only during your turn. | Attach to an [[Ally]] asset you control. | Attached asset gets +1 health and +1 sanity."
MEMBER: The Star • XVII (54001) "Each asset you control with health gets +1 health. | Each asset you control with sanity gets +1 sanity. | [reaction] When the game begins, if The Star • XVII is in your o…"

==== FILE: src/tags/buff/cannot.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeBuffCannot {
  CannotAttackYou = "buff-cannot-attack-you",
  CannotEngageYou = "buff-cannot-engage-you",
}

interface TagBuffCannotBase extends TagBase {}

export interface TagBuffCannotAttackYou extends TagBuffCannotBase {
  type: TagTypeBuffCannot.CannotAttackYou;
}

/** "Enemies cannot engage you" — the evasion-lock buff (Stealth). A lingering benefit ON YOU, the sibling of buff-cannot-attack-you (not a debuff on a specific enemy). */
export interface TagBuffCannotEngageYou extends TagBuffCannotBase {
  type: TagTypeBuffCannot.CannotEngageYou;
}

--- buff-cannot-attack-you (2 members) ---
MEMBER: On the Lam (01510) ""Skids" O'Toole deck only. | Fast. Play after your turn begins. | Until the end of the round, non-[[Elite]] enemies cannot attack you."
MEMBER: Bend Blood (60483) "<b>Fight</b> ([willpower]). You get +3 [willpower] and deal +1 damage for this attack. If you succeed, deal 1 damage to each other enemy at your location. Each enemy deal…"
RULING: 'Enemies cannot attack YOU' is a BUFF on you, not an enemy debuff (same for buff-cannot-engage-you — moved out of the enemy group for this reason).

--- buff-cannot-engage-you (7 members) ---
MEMBER: Stealth (03028) "[action] Exhaust Stealth: <b>Evade.</b> The chosen enemy gets -2 evade for this evasion attempt. If you successfully evade the enemy, disengage with it but do not exhaust…"
MEMBER: Ethereal Form (06164) "<b>Evade.</b> Add your [willpower] value to your skill value for this evasion attempt. If you succeed, disengage from each other enemy engaged with you, and for the remai…"
MEMBER: In the Shadows (07010) "Trish Scarborough deck only. | Fast. Play after your turn begins. | Disengage from each enemy engaged with you. Until the end of the round, enemies cannot engage you and …"
…and 4 more: Scout Ahead (08047), Ethereal Form (10100), Cowl of Sekhmet (11109), Stealth (52005)

==== FILE: src/tags/buff/investigator-stats.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeBuffInvestigatorStats {
  BuffInvestigatorHealth = "buff-investigator-health",
  BuffInvestigatorSanity = "buff-investigator-sanity",
}

interface TagBuffInvestigatorStatsBase extends TagBase {
  value: number;
}

/**
 * Raises the investigator's own maximum health ("You get +1 health" — Five of
 * Pentacles). The investigator counterpart of BuffAssetHealth; distinct from
 * soak (assets absorbing in your place) and heal (restoring, not raising).
 */
export interface TagBuffInvestigatorHealth extends TagBuffInvestigatorStatsBase {
  type: TagTypeBuffInvestigatorStats.BuffInvestigatorHealth;
}

/**
 * Sanity counterpart of BuffInvestigatorHealth: raises the investigator's own
 * maximum sanity (Five of Pentacles, Hawk-Eye Folding Camera).
 */
export interface TagBuffInvestigatorSanity extends TagBuffInvestigatorStatsBase {
  type: TagTypeBuffInvestigatorStats.BuffInvestigatorSanity;
}

--- buff-investigator-health (3 members) ---
MEMBER: Five of Pentacles (05039) "You get +1 health and +1 sanity. | [reaction] When the game begins, if Five of Pentacles is in your opening hand: Put it into play."
MEMBER: The Black Fan (08057) "Exceptional. | While you have... | - ...10+ resources, you get +1 health and +1 sanity. | - ...15+ resources, you may take one additional action during your turn. | - ...…"
MEMBER: The Black Fan (60379) "Exceptional. | While you have... | - ...10+ resources, you get +1 health and +1 sanity. | - ...15+ resources, you may take one additional action during your turn. | - ...…"
RULING: Investigator counterpart of buff-asset-* (Five of Pentacles 05039, Hawk-Eye Camera 05154 sanity).

--- buff-investigator-sanity (5 members) ---
MEMBER: Five of Pentacles (05039) "You get +1 health and +1 sanity. | [reaction] When the game begins, if Five of Pentacles is in your opening hand: Put it into play."
MEMBER: Hawk-Eye Folding Camera (05154) "[reaction] After the last clue is discovered from your location: Place 1 resource <i>(from the token pool)</i> on this card, as evidence. (Limit once per game at each loc…"
MEMBER: The Black Fan (08057) "Exceptional. | While you have... | - ...10+ resources, you get +1 health and +1 sanity. | - ...15+ resources, you may take one additional action during your turn. | - ...…"
…and 2 more: Dissection Tools (09043), The Black Fan (60379)

==== FILE: src/tags/buff/stats-replace.ts ====
import { TagBase } from "../../base.js";
import { SkillType } from "../../kohaku.js";

export enum TagTypeBuffStatsReplace {
  BuffStatsReplace = "buff-stats-replace",
}

interface TagBuffStatsReplaceBase extends TagBase {
  /**
   * The stat that replaces another stat.
   */
  from: SkillType;
  /**
   * The stat that is replaced.
   */
  to: SkillType;
}

export interface TagBuffStatsReplace extends TagBuffStatsReplaceBase {
  type: TagTypeBuffStatsReplace.BuffStatsReplace;
}

--- buff-stats-replace (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

==== FILE: src/tags/campaign/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeCampaign {
  DeckSwapBetweenGames = "campaign-deck-swap-between-games",
}

interface TagCampaignBase extends TagBase {}

/** A between-games / campaign benefit: swap or upgrade deck cards in between scenarios (Adaptable, Arcane Research, Down the Rabbit Hole). */
export interface TagDeckSwapBetweenGames extends TagCampaignBase {
  type: TagTypeCampaign.DeckSwapBetweenGames;
}

--- campaign-deck-swap-between-games (4 members) ---
MEMBER: Adaptable (02110) "Permanent. | In between each game of a campaign, you may swap up to two level 0 cards out of your deck in exchange for an equal number of level 0 cards. (You must still f…"
MEMBER: Down the Rabbit Hole (08059) "Permanent. Limit 1 per deck. Purchase at deck creation. | After each scenario of a campaign, reduce the experience cost of the first 2 cards you upgrade before the next s…"
MEMBER: The Raven Quill (09042) "Customizable. When you purchase The Raven Quill, name a [[Tome]] or [[Spell]] asset and record that name on its upgrade sheet. | Attach to a named asset you control. | [r…"
…and 1 more: Pelt Shipment (10109)
RULING: Between-scenario deckbuilding swaps (Adaptable). Future members: Arcane Research, Down the Rabbit Hole.

==== FILE: src/tags/cancel/main.ts ====
import { TagBase } from "../../base.js";
import { SkillType } from "../../kohaku.js";

export enum TagTypeCancel {
  CancelAttack = "cancel-attack",
  CancelChaos = "cancel-chaos",
  CancelDamage = "cancel-damage",
  CancelEncounterDraw = "cancel-encounter-draw",
  CancelEncounterEffect = "cancel-encounter-effect",
  CancelHorror = "cancel-horror",
  CancelRevelation = "cancel-revelation",
  CancelLoseAction = "cancel-lose-action",
  CancelLoseResource = "cancel-lose-resource",
  CancelDiscardFromHand = "cancel-discard-from-hand",
  CancelFailedTestEffects = "cancel-failed-test-effects",
  CancelWeaknessDraw = "cancel-weakness-draw",
  CancelUseInstead = "cancel-use-instead",
}

interface TagCancelBase extends TagBase {}

export interface TagCancelAttack extends TagCancelBase {
  type: TagTypeCancel.CancelAttack;
}

export interface TagCancelChaos extends TagCancelBase {
  type: TagTypeCancel.CancelChaos;
}

export interface TagCancelDamage extends TagCancelBase {
  type: TagTypeCancel.CancelDamage;
}

export interface TagCancelEncounterDraw extends TagCancelBase {
  type: TagTypeCancel.CancelEncounterDraw;
}

export interface TagCancelEncounterEffect extends TagCancelBase {
  type: TagTypeCancel.CancelEncounterEffect;
}

export interface TagCancelHorror extends TagCancelBase {
  type: TagTypeCancel.CancelHorror;
}

export interface TagCancelRevelation extends TagCancelBase {
  type: TagTypeCancel.CancelRevelation;
}

/** Ignore/cancel the "lose actions" aspect of an incoming effect (e.g. Deny Existence). */
export interface TagCancelLoseAction extends TagCancelBase {
  type: TagTypeCancel.CancelLoseAction;
}

/** Ignore/cancel the "lose resources" aspect of an incoming effect (e.g. Deny Existence). */
export interface TagCancelLoseResource extends TagCancelBase {
  type: TagTypeCancel.CancelLoseResource;
}

/** Ignore/cancel a forced hand-discard aspect of an incoming effect (e.g. Deny Existence). */
export interface TagCancelDiscardFromHand extends TagCancelBase {
  type: TagTypeCancel.CancelDiscardFromHand;
}

/** Cancel all effects/consequences of a (failed) skill test (e.g. Neither Rain nor Snow). */
export interface TagCancelFailedTestEffects extends TagCancelBase {
  type: TagTypeCancel.CancelFailedTestEffects;
}

/** Cancel/suppress a drawn weakness's effects (e.g. Ikiaq). */
export interface TagCancelWeaknessDraw extends TagCancelBase {
  type: TagTypeCancel.CancelWeaknessDraw;
}

/**
 * Ignore a FORCED stat substitution — "anytime a card effect requires you to use
 * [willpower] instead of [combat], you may ignore that aspect" (Empower Self).
 * The inverse of stats-mod-use-instead. `stat` = the stat being protected
 * (the one the substitution would have replaced).
 */
export interface TagCancelUseInstead extends TagCancelBase {
  type: TagTypeCancel.CancelUseInstead;
  stat?: SkillType;
}

--- cancel-attack (19 members) ---
MEMBER: Dodge (01523) "Fast. Play when an enemy attacks an investigator at your location. | Cancel that attack."
MEMBER: Hypnotic Gaze (02153) "Fast. Play when an enemy attacks an investigator at your location. | Cancel that attack. Then, reveal a random token from the chaos bag. If it has a [skull], [cultist], […"
MEMBER: Narrow Escape (03267) "Fast. Play when an enemy makes an attack of opportunity against you. | Cancel that attack. You get +2 skill value for the next skill test you perform this turn."
…and 16 more: Suggestion (03268), Infighting (03314), Dodge (60113), Hypnotic Gaze (60414), Hypnotic Gaze (60423), Hand of Fate (07020), Obfuscation (07027), …

--- cancel-chaos (24 members) ---
MEMBER: Eucatastrophe (01692) "Fast. Play when you reveal a chaos token that would reduce your skill value to 0 during a skill test (including the [auto_fail] token). | Cancel that token and treat it a…"
MEMBER: Father Mateo (04004) "[reaction] When an investigator reveals an [auto_fail] chaos token: Cancel that token and treat it as an [elder_sign] token, instead. (Limit once per game.) | [elder_sign…"
MEMBER: Counterspell (04110) "Fast. Play when a [skull], [cultist], [tablet], or [elder_thing] chaos token is revealed during a skill test at your location. | Cancel that chaos token. <i>(Do not revea…"
…and 21 more: Jacqueline Fine (60401), Eldritch Inspiration (60420), Eldritch Inspiration (05033), Eucatastrophe (05324), Wish Eater (06277), Nightmare Bauble (06330), False Covenant (07116), …

--- cancel-damage (15 members) ---
MEMBER: "I've had worse…" (01684) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 5 damage and/or horror just dealt to you. Then, gain that many resources."
MEMBER: "I've had worse…" (02261) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 5 damage and/or horror just dealt to you. Then, gain that many resources."
MEMBER: Armor of Ardennes (03305) "[reaction] When damage is assigned to Armor of Ardennes, exhaust Armor of Ardennes: Cancel 1 of that damage."
…and 12 more: Devil's Luck (03157), Perseverance (04111), Flesh Ward (60106), Delay the Inevitable (05021), Deny Existence (05032), Deny Existence (05280), "I've had worse…" (05315), …

--- cancel-encounter-draw (1 member) ---
MEMBER: Dr. William T. Maleson (02302) "[reaction] When you draw an encounter card from the encounter deck, exhaust Dr. William T. Maleson and place 1 of your clues on your location: Cancel the drawing of that …"
RULING: Cancels the DRAWING of an encounter card itself (Dr. Maleson). Cancelling a drawn card's EFFECTS → cancel-encounter-effect (Ward of Protection 02307, Dark Insight 05014). REPLACING the draw with something else ('Instead, search…' — On the Hunt 03263) is not a cancel at all. Discarding an in-play treachery → discard-treachery-in-play.

--- cancel-encounter-effect (7 members) ---
MEMBER: Ward of Protection (02307) "Fast. Play when you draw a non-weakness encounter card. | Cancel all of that card's effects and discard it. Then, take 1 horror."
MEMBER: Dark Insight (05014) "Diana Stanley deck only. | Fast. Play when an investigator at your location draws an encounter card or a weakness. | Cancel all of that card's effects and shuffle it back…"
MEMBER: Foresight (08064) "Fast. Play when an investigator at your location would draw a card from their deck or from the encounter deck. | Name a card. If the drawn card is the named card, that in…"
…and 4 more: Dr. William T. Maleson (09054), Ravenous Myconid (10059), Psychic Sensitivity (11015), Nine of Rods (54009)

--- cancel-horror (15 members) ---
MEMBER: "I've had worse…" (01684) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 5 damage and/or horror just dealt to you. Then, gain that many resources."
MEMBER: "I've had worse…" (02261) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 5 damage and/or horror just dealt to you. Then, gain that many resources."
MEMBER: Devil's Luck (03157) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 10 damage and/or horror just dealt to you. Exile Devil's Luck."
…and 12 more: Perseverance (04111), Flesh Ward (60106), Delay the Inevitable (05021), Deny Existence (05032), Deny Existence (05280), "I've had worse…" (05315), "Get behind me!" (08021), …

--- cancel-revelation (22 members) ---
MEMBER: Ward of Protection (01565) "Fast. Play when you draw a non-weakness treachery card. | Cancel that card's revelation effect. Then, take 1 horror."
MEMBER: Ward of Protection (02307) "Fast. Play when you draw a non-weakness encounter card. | Cancel all of that card's effects and discard it. Then, take 1 horror."
MEMBER: Forewarned (03150) "Fast. Play when you draw a non-weakness treachery card. | Place 1 of your clues on your location. Then, cancel that card's revelation effect."
…and 19 more: Ward of Protection (03270), A Test of Will (03156), A Test of Will (60513), A Test of Will (60523), Dark Insight (05014), "Fool me once..." (06156), Ward of Radiance (07031), …

--- cancel-lose-action (2 members) ---
MEMBER: Deny Existence (05032) "Fast. Play when an encounter card or an enemy attack would cause you to do one of the following (choose one): Discard cards from hand, lose resources, lose actions, take …"
MEMBER: Deny Existence (05280) "Fast. Play when an encounter card or enemy attack would cause you to do one of the following (choose one): Discard cards from hand, lose resources, lose actions, take dam…"

--- cancel-lose-resource (2 members) ---
MEMBER: Deny Existence (05032) "Fast. Play when an encounter card or an enemy attack would cause you to do one of the following (choose one): Discard cards from hand, lose resources, lose actions, take …"
MEMBER: Deny Existence (05280) "Fast. Play when an encounter card or enemy attack would cause you to do one of the following (choose one): Discard cards from hand, lose resources, lose actions, take dam…"

--- cancel-discard-from-hand (2 members) ---
MEMBER: Deny Existence (05032) "Fast. Play when an encounter card or an enemy attack would cause you to do one of the following (choose one): Discard cards from hand, lose resources, lose actions, take …"
MEMBER: Deny Existence (05280) "Fast. Play when an encounter card or enemy attack would cause you to do one of the following (choose one): Discard cards from hand, lose resources, lose actions, take dam…"

--- cancel-failed-test-effects (1 member) ---
MEMBER: Neither Rain nor Snow (60502) "Stella Clark deck only. | If this skill test fails, cancel all effects of the failed test."

--- cancel-weakness-draw (4 members) ---
MEMBER: All In (04309) "Max 1 committed per skill test. | If this test is successful, draw 1 card for each point you succeeded by, to a maximum of 5. Shuffle each weakness drawn by this effect b…"
MEMBER: Dark Insight (05014) "Diana Stanley deck only. | Fast. Play when an investigator at your location draws an encounter card or a weakness. | Cancel all of that card's effects and shuffle it back…"
MEMBER: Ikiaq (07267) "You get +1 [willpower] and +1 [intellect]. You get -1 [willpower] and -1 [intellect] for each weakness beneath Ikiaq. | [reaction] When an investigator at your location d…"
…and 1 more: Foresight (08064)

--- cancel-use-instead (3 members) ---
MEMBER: Empower Self (06241) "Myriad. Limit 1 Empower Self <i>(Stamina)</i> per deck. | Up to 3 Empower Self cards take up a single arcane slot. | Anytime a card effect requires you to use [willpower]…"
MEMBER: Empower Self (06242) "Myriad. Limit 1 Empower Self <i>(Alacrity)</i> per deck. | Up to 3 Empower Self cards take up a single arcane slot. | Anytime a card effect requires you to use [willpower…"
MEMBER: Empower Self (06243) "Myriad. Limit 1 Empower Self <i>(Acuity)</i> per deck. | Up to 3 Empower Self cards take up a single arcane slot. | Anytime a card effect requires you to use [willpower] …"
RULING: Ignore a forced 'use X instead of Y' substitution (Empower Self trio); stat arg = the protected stat. The inverse of stats-mod-use-instead.

==== FILE: src/tags/chaos/bag.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeChaosBag {
  ChaosBagAddBless = "chaos-bag-add-bless",
  ChaosBagAddCurse = "chaos-bag-add-curse",
  ChaosBagRemoveBless = "chaos-bag-remove-bless",
  ChaosBagRemoveCurse = "chaos-bag-remove-curse",
  ChaosBagReplace = "chaos-bag-replace",
}

interface TagChaosBagBase extends TagBase {
  value: DynamicValue;
}

export interface TagChaosBagAddBless extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagAddBless;
}

export interface TagChaosBagAddCurse extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagAddCurse;
}

export interface TagChaosBagRemoveBless extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagRemoveBless;
}

export interface TagChaosBagRemoveCurse extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagRemoveCurse;
}

export interface TagChaosBagReplace extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagReplace;
  from: "bless" | "curse";
  to: "bless" | "curse";
}

--- chaos-bag-add-bless (26 members) ---
MEMBER: Sister Mary (07001) "During setup, add 2 [bless] tokens to the chaos bag. | [reaction] When the round ends: Add 1 [bless] token to the chaos bag. | [elder_sign] effect: +1. If you succeed, ad…"
MEMBER: Sister Mary (07001) "During setup, add 2 [bless] tokens to the chaos bag. | [reaction] When the round ends: Add 1 [bless] token to the chaos bag. | [elder_sign] effect: +1. If you succeed, ad…"
MEMBER: Guardian Angel (07006) "Sister Mary deck only. | Guardian Angel may be assigned damage dealt to other investigators at your location and connecting locations. | [reaction] When any amount of dam…"
…and 23 more: Book of Psalms (07017), Blessed Blade (07018), Hand of Fate (07020), Token of Faith (07033), Keep Faith (07034), Predestined (07035), Tempt Fate (07037), …

--- chaos-bag-add-curse (24 members) ---
MEMBER: Cryptic Grimoire (07022) "[action]: Add 1 [curse] token to the chaos bag. | [action] If there are 10 [curse] tokens in the chaos bag, discard Cryptic Grimoire: Record in your Campaign Log that "yo…"
MEMBER: Deep Knowledge (07023) "As an additional cost to play Deep Knowledge, add 2 [curse] tokens to the chaos bag. | Investigators at your location draw a combined total of 3 cards <i>(you decide how …"
MEMBER: Faustian Bargain (07028) "As an additional cost to play Faustian Bargain, add 2 [curse] tokens to the chaos bag. | Investigators at your location gain a total of 5 resources, distributed as you wi…"
…and 21 more: Promise of Power (07032), Tempt Fate (07037), Accursed Follower (07038), Dread Curse (07039), Stirring Up Trouble (07112), Priest of Two Faiths (07156), Ríastrad (07193), …

--- chaos-bag-remove-bless (5 members) ---
MEMBER: A Watchful Peace (07269) "As an additional cost to play A Watchful Peace, search the chaos bag and/or cards in play for a total of 5 [bless] tokens and return them to the token pool. | Fast. Play …"
MEMBER: Hallow (07301) "As an additional cost to play Hallow, return a total of 10 [bless] tokens to the token pool from the chaos bag or sealed on cards in play. | Remove 1 doom from any card i…"
MEMBER: Rite of Equilibrium (07308) "Either (choose one): | - Add X [curse] tokens to the chaos bag to add X [bless] tokens to the chaos bag. | - Remove X [curse] and X [bless] tokens from the chaos bag to h…"
…and 2 more: Kōhaku Narukami (10012), The Key of Solomon (10104)

--- chaos-bag-remove-curse (8 members) ---
MEMBER: Predestined (07035) "Max 1 committed per skill test. | You may commit Predestined to any type of test. | If this test fails, either add 2 [bless] tokens to the chaos bag or remove 2 [curse] t…"
MEMBER: False Covenant (07116) "Permanent. Limit 1 [[Covenant]] per deck. | [reaction] When an investigator at your location reveals a [curse] token during a skill test, exhaust False Covenant: Cancel t…"
MEMBER: Curse of Aeons (07195) "[reaction] When a second [curse] token is revealed during a single skill test at your location, exhaust Curse of Aeons: Cancel that token and treat it as if it were a [sk…"
…and 5 more: Harmony Restored (07230), Rite of Equilibrium (07308), Kōhaku Narukami (10012), Purified (10029), The Key of Solomon (10104)

--- chaos-bag-replace (4 members) ---
MEMBER: Crisis of Faith (07007) "<b>Revelation</b> - For each [bless] token in the chaos bag, you must either replace it with a [curse] token or take 1 horror."
MEMBER: Cryptic Grimoire (07022) "[action]: Add 1 [curse] token to the chaos bag. | [action] If there are 10 [curse] tokens in the chaos bag, discard Cryptic Grimoire: Record in your Campaign Log that "yo…"
MEMBER: Tides of Fate (07030) "Fast. Play during any [fast] window, or at the start of the round. | Replace all [curse] tokens in the chaos bag with an equal number of [bless] tokens. At the end of the…"
…and 1 more: Tides of Fate (07030)

==== FILE: src/tags/chaos/downside.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeChaosDownside {
  ChaosDownsideDamage = "chaos-downside-damage",
  ChaosDownsideHorror = "chaos-downside-horror",
  ChaosDownsideResource = "chaos-downside-resource",
  ChaosDownsideAction = "chaos-downside-action",
  ChaosDownsideDiscard = "chaos-downside-discard",
}

interface TagChaosDownsideBase extends TagBase {
  value: number;
}

export interface TagChaosDownsideDamage extends TagChaosDownsideBase {
  type: TagTypeChaosDownside.ChaosDownsideDamage;
}

export interface TagChaosDownsideHorror extends TagChaosDownsideBase {
  type: TagTypeChaosDownside.ChaosDownsideHorror;
}

export interface TagChaosDownsideResource extends TagChaosDownsideBase {
  type: TagTypeChaosDownside.ChaosDownsideResource;
}

/**
 * Lose action(s) when a bad symbol is revealed during this card's own test — the
 * non-horror sibling of chaos-downside-horror/damage (Blinding Light's "lose 1 action").
 * `value` is the number of actions lost; OMIT it for "lose all remaining actions" (Rite of
 * Seeking). Lets the Chaos Token Downside archetype cover action-loss penalties.
 */
export interface TagChaosDownsideAction extends TagBase {
  type: TagTypeChaosDownside.ChaosDownsideAction;
  value?: number;
}

/**
 * A DISCARD penalty when a bad symbol is revealed for this card (during its test, or a
 * manual reveal it forces) — this card breaks (Baseball Bat), you discard a card from hand
 * (Mists of R'lyeh), or you discard a controlled asset (Astral Travel, Recharge). A flag;
 * the specific discard is carried by the card's other tags. Chaos-triggered.
 */
export interface TagChaosDownsideDiscard extends TagBase {
  type: TagTypeChaosDownside.ChaosDownsideDiscard;
}

--- chaos-downside-damage (13 members) ---
MEMBER: Alchemical Transmutation (03032) "Uses (3 charges). | [action] Exhaust Alchemical Transmutation, spend 1 charge: Test [willpower] (1). For each point you succeed by, gain 1 resource (to a maximum of 3). I…"
MEMBER: Astral Travel (03034) "<b>Move.</b> Move to any revealed location and reveal a random token from the chaos bag. If you reveal a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbo…"
MEMBER: Storm of Spirits (03153) "<b>Fight.</b> This attack uses [willpower] instead of [combat]. If you succeed, instead of its standard damage, this attack deals 2 damage to each enemy at the attacked e…"
…and 10 more: Azure Flame (60407), Astral Travel (60413), Azure Flame (60425), Azure Flame (60430), The Black Cat (06285), Cosmic Flame (60459), Cosmic Flame (12059), …
RULING: Needs a CONCRETE loss on a bad symbol (lose actions, take horror, break the card, lose resources). A 'nothing happens' gamble (Henry Wan) stays out — chaos-reveal-manual already covers the reveal mechanic.
RULING: chaos-downside-action value is OPTIONAL ('lose all remaining actions' = no value). chaos-downside-discard covers self-break, hand-discard, and controlled-asset-discard shapes.
RULING: Manual-reveal gambles WITH a real loss (Astral Travel, Recharge) DO carry their downside tag.
RULING: Heuristics beat agents here: an agent sweep once found ZERO of these; a word-heuristic found 8. Trust the lint flag.

--- chaos-downside-horror (13 members) ---
MEMBER: Shrivelling (01560) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Shrivelling (02154) "Uses (4 charges). | [action] Spend one charge: <b>Fight.</b> This attack uses [willpower] instead of [combat]. You get +2 [willpower] and deal +1 damage for this attack. …"
…and 10 more: Shrivelling (02306), Clairvoyance (60408), Clairvoyance (60426), Clairvoyance (60431), The Black Cat (06285), Second Sight (60460), Second Sight (60481), …
RULING: Needs a CONCRETE loss on a bad symbol (lose actions, take horror, break the card, lose resources). A 'nothing happens' gamble (Henry Wan) stays out — chaos-reveal-manual already covers the reveal mechanic.
RULING: chaos-downside-action value is OPTIONAL ('lose all remaining actions' = no value). chaos-downside-discard covers self-break, hand-discard, and controlled-asset-discard shapes.
RULING: Manual-reveal gambles WITH a real loss (Astral Travel, Recharge) DO carry their downside tag.
RULING: Heuristics beat agents here: an agent sweep once found ZERO of these; a word-heuristic found 8. Trust the lint flag.

--- chaos-downside-resource (3 members) ---
MEMBER: Ineffable Truth (60409) "Uses (3 charges). | [action] Spend 1 charge: <b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the evaded enemy. …"
MEMBER: Ineffable Truth (60427) "Uses (3 charges). | [action] Spend 1 charge: <b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. You get +2 [willpower] for this evasion attempt. If…"
MEMBER: Ineffable Truth (60432) "Uses (3 charges). | [action] Spend 1 charge: <b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. You get +3 [willpower] for this evasion attempt. If…"
RULING: Needs a CONCRETE loss on a bad symbol (lose actions, take horror, break the card, lose resources). A 'nothing happens' gamble (Henry Wan) stays out — chaos-reveal-manual already covers the reveal mechanic.
RULING: chaos-downside-action value is OPTIONAL ('lose all remaining actions' = no value). chaos-downside-discard covers self-break, hand-discard, and controlled-asset-discard shapes.
RULING: Manual-reveal gambles WITH a real loss (Astral Travel, Recharge) DO carry their downside tag.
RULING: Heuristics beat agents here: an agent sweep once found ZERO of these; a word-heuristic found 8. Trust the lint flag.

--- chaos-downside-action (8 members) ---
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Rite of Seeking (01689) "Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. You get +2 [willpower] for this test. If you succee…"
…and 5 more: Rite of Seeking (02028), Rite of Seeking (02233), Shadowmeld (60461), Shadowmeld (60482), Rite of Seeking (51007)
RULING: Needs a CONCRETE loss on a bad symbol (lose actions, take horror, break the card, lose resources). A 'nothing happens' gamble (Henry Wan) stays out — chaos-reveal-manual already covers the reveal mechanic.
RULING: chaos-downside-action value is OPTIONAL ('lose all remaining actions' = no value). chaos-downside-discard covers self-break, hand-discard, and controlled-asset-discard shapes.
RULING: Manual-reveal gambles WITH a real loss (Astral Travel, Recharge) DO carry their downside tag.
RULING: Heuristics beat agents here: an agent sweep once found ZERO of these; a word-heuristic found 8. Trust the lint flag.

--- chaos-downside-discard (16 members) ---
MEMBER: Baseball Bat (01574) "[action]: <b>Fight.</b> You get +2 [combat] for this attack. This attack deals +1 damage. If a [skull] or [auto_fail] symbol is revealed during this attack, discard Baseb…"
MEMBER: Astral Travel (03034) "<b>Move.</b> Move to any revealed location and reveal a random token from the chaos bag. If you reveal a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbo…"
MEMBER: Recharge (03197) "Choose a [[Spell]] or [[Relic]] asset controlled by an investigator at your location and reveal a random chaos token from the chaos bag. If you reveal a [skull], [cultist…"
…and 13 more: Mists of R'lyeh (04029), Mists of R'lyeh (04271), Astral Travel (60413), Cosmic Flame (60459), Second Sight (60460), Shadowmeld (60461), Second Sight (60481), …
RULING: Needs a CONCRETE loss on a bad symbol (lose actions, take horror, break the card, lose resources). A 'nothing happens' gamble (Henry Wan) stays out — chaos-reveal-manual already covers the reveal mechanic.
RULING: chaos-downside-action value is OPTIONAL ('lose all remaining actions' = no value). chaos-downside-discard covers self-break, hand-discard, and controlled-asset-discard shapes.
RULING: Manual-reveal gambles WITH a real loss (Astral Travel, Recharge) DO carry their downside tag.
RULING: Heuristics beat agents here: an agent sweep once found ZERO of these; a word-heuristic found 8. Trust the lint flag.

==== FILE: src/tags/chaos/effect.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeChaosEffect {
  ChaosEffectDoNotReveal = "chaos-do-not-reveal",
  ChaosEffectIgnoreEffect = "chaos-ignore-effect",
  ChaosEffectIgnoreModifier = "chaos-ignore-modifier",
  ChaosEffectModifier = "chaos-modifier",
  ChaosEffectResolveChoose = "chaos-resolve-choose",
  ChaosEffectRevealBeforeEffect = "chaos-reveal-before-effect",
  ChaosEffectTreatAsElderSign = "chaos-treat-as-elder-sign",
  ChaosEffectTreatTokenAs = "chaos-treat-token-as",
  ChaosEffectResolveAdditional = "chaos-resolve-additional",
}

interface TagChaosEffectBase extends TagBase {}

export interface TagChaosEffectDoNotReveal extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectDoNotReveal;
}

export interface TagChaosEffectIgnoreEffect extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectIgnoreEffect;
}

export interface TagChaosEffectIgnoreModifier extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectIgnoreModifier;
}

export interface TagChaosEffectModifier extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectModifier;
  treatAs?: number;
}

export interface TagChaosEffectResolveChoose extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectResolveChoose;
}

export interface TagChaosEffectRevealBeforeEffect extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectRevealBeforeEffect;
}

export interface TagChaosEffectTreatAsElderSign extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectTreatAsElderSign;
}

export interface TagChaosEffectTreatTokenAs extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectTreatTokenAs;
  to: "bless" | "curse" | "skull" | "elder-sign" | "auto-fail";
}

export interface TagChaosEffectResolveAdditional extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectResolveAdditional;
}

--- chaos-do-not-reveal (4 members) ---
MEMBER: Will to Survive (01585) "Fast. Play only during your turn. | Until the end of your turn, do not reveal chaos tokens for any skill tests you perform."
MEMBER: Seal of the Elder Sign (03312) "Do not reveal chaos tokens from the chaos bag for this test. Treat the chaos token revealed for this test as an [elder_sign]. | When this test ends, remove Seal of the El…"
MEMBER: Pnakotic Manuscripts (04307) "Uses (3 secrets). | [reaction] When an investigator at your location would perform a skill test during a revelation effect, spend 1 secret: Do not reveal chaos tokens for…"
…and 1 more: Will to Survive (60512)

--- chaos-ignore-effect (7 members) ---
MEMBER: Defiance (02190) "Before revealing chaos tokens for this test, choose one of the following symbols: ([skull], [cultist], [tablet], or [elder_thing]). Ignore the effects of the chosen symbo…"
MEMBER: Lucky Dice (02230) "Exceptional. | [reaction] When you reveal a non-[auto_fail] chaos token, spend 2 resources: Ignore that chaos token and reveal another one to resolve. If that token has a…"
MEMBER: Defiance (04198) "Ignore the effects of all [skull], [cultist], [tablet], and [elder_thing] symbols during this test (including their modifiers)."
…and 4 more: Defiance (60418), The Black Cat (06285), Ancient Covenant (07122), Lucky Dice (07307)

--- chaos-ignore-modifier (6 members) ---
MEMBER: Defiance (02190) "Before revealing chaos tokens for this test, choose one of the following symbols: ([skull], [cultist], [tablet], or [elder_thing]). Ignore the effects of the chosen symbo…"
MEMBER: Defiance (04198) "Ignore the effects of all [skull], [cultist], [tablet], and [elder_thing] symbols during this test (including their modifiers)."
MEMBER: Defiance (60418) "Before revealing chaos tokens for this test, choose one of the following symbols: ([skull], [cultist], [tablet], or [elder_thing]). Ignore the effects of the chosen symbo…"
…and 3 more: The Black Cat (06285), Sacred Covenant (07110), Dawn Star (10131)

--- chaos-modifier (6 members) ---
MEMBER: Sure Gamble (01556) "Fast. Play after you reveal a chaos token with a negative modifier. | Switch that token's "-" to a "+"."
MEMBER: Blasphemous Covenant (07113) "Permanent. Limit 1 [[Covenant]] per deck. | [reaction] When an investigator at your location reveals a [curse] token during a skill test, exhaust Blasphemous Covenant: Tr…"
MEMBER: Skeptic (07115) "During this skill test, treat the modifier of each [bless] and each [curse] token as +1 instead of its normal modifier."
…and 3 more: Snipe (08087), "Hit me!" (08112), Accursed (10095)

--- chaos-resolve-choose (14 members) ---
MEMBER: Grotesque Statue (01571) "Uses (4 charges). If Grotesque Statue has no charges, discard it. | [reaction] When you would reveal a chaos token, spend 1 charge: Reveal 2 chaos tokens instead of 1. Ch…"
MEMBER: "Eat lead!" (03304) "Fast. Play when you activate the <b>Fight</b> ability on a [[Firearm]] asset. | You may spend X additional ammo tokens from that asset. When you reveal chaos tokens for t…"
MEMBER: Olive McBride (04197) "[reaction] When you would reveal a chaos token, exhaust Olive McBride: Reveal 3 chaos tokens instead of 1. Choose 2 of those tokens to resolve, and ignore the other."
…and 11 more: Dark Prophecy (04032), Against All Odds (04202), Dark Prophecy (60417), Grotesque Statue (60421), Olive McBride (10097), Dial of Ancients (11048), Breath of the Sleeper (11066), …

--- chaos-reveal-before-effect (7 members) ---
MEMBER: Defiance (02190) "Before revealing chaos tokens for this test, choose one of the following symbols: ([skull], [cultist], [tablet], or [elder_thing]). Ignore the effects of the chosen symbo…"
MEMBER: Scrying Mirror (60406) "Uses (4 secrets). | [reaction] After a skill test at your location begins, exhaust Scrying Mirror and spend 1 secret: Perform the "reveal chaos token" step of the test no…"
MEMBER: Defiance (60418) "Before revealing chaos tokens for this test, choose one of the following symbols: ([skull], [cultist], [tablet], or [elder_thing]). Ignore the effects of the chosen symbo…"
…and 4 more: Blessed Blade (07018), Guided by Faith (10025), Blessed Blade (10034), Eyes of the Dreamer (11067)

--- chaos-treat-as-elder-sign (5 members) ---
MEMBER: Eucatastrophe (01692) "Fast. Play when you reveal a chaos token that would reduce your skill value to 0 during a skill test (including the [auto_fail] token). | Cancel that token and treat it a…"
MEMBER: Seal of the Elder Sign (03312) "Do not reveal chaos tokens from the chaos bag for this test. Treat the chaos token revealed for this test as an [elder_sign]. | When this test ends, remove Seal of the El…"
MEMBER: Eucatastrophe (05324) "Fast. Play when you reveal a chaos token that would reduce your skill value to 0 during a skill test (including the [auto_fail] token). | Cancel that token and treat it a…"
…and 2 more: Blessing of Isis (07190), Twilight Diadem (10134)

--- chaos-treat-token-as (4 members) ---
MEMBER: Father Mateo (04004) "[reaction] When an investigator reveals an [auto_fail] chaos token: Cancel that token and treat it as an [elder_sign] token, instead. (Limit once per game.) | [elder_sign…"
MEMBER: Curse of Aeons (07195) "[reaction] When a second [curse] token is revealed during a single skill test at your location, exhaust Curse of Aeons: Cancel that token and treat it as if it were a [sk…"
MEMBER: "Lucky" Penny (07224) "Exceptional. | <b>Forced</b> - When you reveal a [bless] or [curse] token during a skill test you are performing: Flip a coin. On a heads, treat that token as a [bless] t…"
…and 1 more: "Lucky" Penny (07224)

--- chaos-resolve-additional (2 members) ---
MEMBER: Eldritch Inspiration (60420) "Fast. Play when you would resolve an effect on a [mystic] card that triggers "when," "if," or "after" a chaos token is revealed. | Either cancel that effect, or resolve i…"
MEMBER: Eldritch Inspiration (05033) "Fast. Play when you would resolve an effect on a [mystic] card that triggers "when," "if," or "after" a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbol…"

==== FILE: src/tags/chaos/payoff.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeChaosPayoff {
  ChaosSymbolPayoff = "chaos-symbol-payoff",
}

interface TagChaosPayoffBase extends TagBase {}

/** A BONUS gained when a specific chaos symbol is revealed (Song of the Dead's "+2 damage if [skull]"). The positive counterpart of chaos-downside-* / the elder-sign payoff. */
export interface TagChaosSymbolPayoff extends TagChaosPayoffBase {
  type: TagTypeChaosPayoff.ChaosSymbolPayoff;
}

--- chaos-symbol-payoff (29 members) ---
MEMBER: Song of the Dead (02112) "Uses (5 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat]. You get +1 [willpower] for this attack. If a [skull] symbol i…"
MEMBER: .35 Winchester (06195) "Uses (5 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +2 [combat] for this attack. If a +1, 0, or [elder_sign] chaos token is revealed during this attack, this at…"
MEMBER: Wish Eater (06277) "Bonded (Empty Vessel). | [reaction] When you reveal a [skull], [cultist], [tablet], or [elder_thing] chaos token during a skill test, spend 1 charge: Cancel that token. H…"
…and 26 more: The Black Cat (06285), Blessed Blade (07018), Token of Faith (07033), Armageddon (07117), Eye of Chaos (07118), Shroud of Shadows (07119), Paradoxical Covenant (07120), …
RULING: BONUS on revealing a symbol token (Song of the Dead) — the positive counterpart of chaos-downside; Shrivelling/Blinding Light-style penalties are chaos-downside instead.

==== FILE: src/tags/chaos/predict.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeChaosPredict {
  ChaosPredict = "chaos-predict",
}

interface TagChaosPredictBase extends TagBase {}

export interface TagChaosPredict extends TagChaosPredictBase {
  type: TagTypeChaosPredict.ChaosPredict;
}

--- chaos-predict (3 members) ---
MEMBER: Recall the Future (04158) "[reaction] When a skill test you are performing begins, if Recall the Future is ready, name a chaos token: If the named chaos token is revealed during this skill test, ex…"
MEMBER: Crystal Pendulum (60411) "You get +1 [willpower]. | [reaction] After a skill test at your location begins, exhaust Crystal Pendulum: Name a number. If this test succeeds by that number or fails by…"
MEMBER: Prescient (60419) "Max 1 committed per skill test. | After you commit Prescient to a skill test, name "even," "odd," or "symbol." After this test ends, if a chaos token of the named type wa…"

==== FILE: src/tags/chaos/reveal.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeChaosReveal {
  ChaosRevealTokenAutoFail = "chaos-reveal-token-auto-fail",
  ChaosRevealTokenBless = "chaos-reveal-token-bless",
  ChaosRevealTokenCultist = "chaos-reveal-token-cultist",
  ChaosRevealTokenCurse = "chaos-reveal-token-curse",
  ChaosRevealTokenElderSign = "chaos-reveal-token-elder-sign",
  ChaosRevealTokenElderThing = "chaos-reveal-token-elder-thing",
  ChaosRevealTokenSkull = "chaos-reveal-token-skull",
  ChaosRevealTokenTablet = "chaos-reveal-token-tablet",
  ChaosRevealMore = "chaos-reveal-more",
  ChaosRevealManual = "chaos-reveal-manual",
  ChaosRevealAnotherInstead = "chaos-reveal-another-instead",
  ChaosRevealSealedInstead = "chaos-reveal-sealed-instead",
}

interface TagChaosRevealBase extends TagBase {}

export interface TagChaosRevealTokenAutoFail extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenAutoFail;
}

export interface TagChaosRevealTokenBless extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenBless;
}

export interface TagChaosRevealTokenCultist extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenCultist;
}

export interface TagChaosRevealTokenCurse extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenCurse;
}

export interface TagChaosRevealTokenElderSign extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenElderSign;
}

export interface TagChaosRevealTokenElderThing extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenElderThing;
}

export interface TagChaosRevealTokenSkull extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenSkull;
}

export interface TagChaosRevealTokenTablet extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenTablet;
}

export interface TagChaosRevealMore extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealMore;
}

export interface TagChaosRevealManual extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealManual;
}

export interface TagChaosRevealAnotherInstead extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealAnotherInstead;
}

export interface TagChaosRevealSealedInstead extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealSealedInstead;
}

--- chaos-reveal-token-auto-fail (57 members) ---
MEMBER: Shrivelling (01560) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder…"
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
…and 54 more: Baseball Bat (01574), Rite of Seeking (01689), Rite of Seeking (02028), Hypnotic Gaze (02153), Shrivelling (02154), Lucky Dice (02230), Rite of Seeking (02233), …

--- chaos-reveal-token-bless (26 members) ---
MEMBER: Blessed Blade (07018) "[action] If Blessed Blade is ready: <b>Fight.</b> You get +1 [combat] for this attack. If a [bless] or [elder_sign] token is revealed during this attack, this attack deal…"
MEMBER: Ward of Radiance (07031) "Fast. Play when an investigator at your location draws a non-weakness treachery card. | Reveal 5 random chaos tokens from the chaos bag. If a [bless] or [elder_sign] toke…"
MEMBER: Beloved (07036) "If a [bless] token is revealed during this test, you may remove Beloved from the game to replace that token's effects with the following: "You automatically succeed. <i>(…"
…and 23 more: Sacred Covenant (07110), Skeptic (07115), Paradoxical Covenant (07120), Ancient Covenant (07122), Butterfly Effect (07160), Manipulate Destiny (07162), Blessing of Isis (07190), …

--- chaos-reveal-token-cultist (56 members) ---
MEMBER: Shrivelling (01560) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder…"
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
…and 53 more: Rite of Seeking (01689), Rite of Seeking (02028), Ritual Candles (02029), Hypnotic Gaze (02153), Shrivelling (02154), Defiance (02190), Rite of Seeking (02233), …

--- chaos-reveal-token-curse (39 members) ---
MEMBER: Token of Faith (07033) "[reaction] After a skill test ends in which 1 or more [curse] or [auto_fail] tokens were revealed, exhaust Token of Faith: Add that many [bless] tokens to the chaos bag."
MEMBER: Blasphemous Covenant (07113) "Permanent. Limit 1 [[Covenant]] per deck. | [reaction] When an investigator at your location reveals a [curse] token during a skill test, exhaust Blasphemous Covenant: Tr…"
MEMBER: Skeptic (07115) "During this skill test, treat the modifier of each [bless] and each [curse] token as +1 instead of its normal modifier."
…and 36 more: False Covenant (07116), Armageddon (07117), Eye of Chaos (07118), Shroud of Shadows (07119), Paradoxical Covenant (07120), Gaze of Ouraxsh (07155), Butterfly Effect (07160), …

--- chaos-reveal-token-elder-sign (22 members) ---
MEMBER: Dark Future (60403) "<b>Revelation</b> - Put Dark Future into play in your threat area. | You cannot cancel or ignore [elder_sign], [skull], [cultist], [tablet], [elder_thing], and [auto_fail…"
MEMBER: Azure Flame (60407) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If an [elder_sign], "+1," or "0" token is…"
MEMBER: Clairvoyance (60408) "Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. If you succeed, discover 1 additional clue at this …"
…and 19 more: Ineffable Truth (60409), Azure Flame (60425), Clairvoyance (60426), Ineffable Truth (60427), Azure Flame (60430), Clairvoyance (60431), Ineffable Truth (60432), …

--- chaos-reveal-token-elder-thing (55 members) ---
MEMBER: Shrivelling (01560) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder…"
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
…and 52 more: Rite of Seeking (01689), Rite of Seeking (02028), Ritual Candles (02029), Hypnotic Gaze (02153), Shrivelling (02154), Defiance (02190), Rite of Seeking (02233), …

--- chaos-reveal-token-skull (64 members) ---
MEMBER: Shrivelling (01560) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder…"
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
…and 61 more: Baseball Bat (01574), Rite of Seeking (01689), Jim's Trumpet (02012), Rite of Seeking (02028), Ritual Candles (02029), Song of the Dead (02112), Hypnotic Gaze (02153), …

--- chaos-reveal-token-tablet (56 members) ---
MEMBER: Shrivelling (01560) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder…"
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
…and 53 more: Rite of Seeking (01689), Rite of Seeking (02028), Ritual Candles (02029), Hypnotic Gaze (02153), Shrivelling (02154), Defiance (02190), Rite of Seeking (02233), …

--- chaos-reveal-more (20 members) ---
MEMBER: Grotesque Statue (01571) "Uses (4 charges). If Grotesque Statue has no charges, discard it. | [reaction] When you would reveal a chaos token, spend 1 charge: Reveal 2 chaos tokens instead of 1. Ch…"
MEMBER: "Eat lead!" (03304) "Fast. Play when you activate the <b>Fight</b> ability on a [[Firearm]] asset. | You may spend X additional ammo tokens from that asset. When you reveal chaos tokens for t…"
MEMBER: Olive McBride (04197) "[reaction] When you would reveal a chaos token, exhaust Olive McBride: Reveal 3 chaos tokens instead of 1. Choose 2 of those tokens to resolve, and ignore the other."
…and 17 more: Dark Prophecy (04032), Against All Odds (04202), Jacqueline Fine (60401), Dark Prophecy (60417), Grotesque Statue (60421), "Hit me!" (08112), Ectoplasmic Horror (09127), …

--- chaos-reveal-manual (22 members) ---
MEMBER: Hypnotic Gaze (02153) "Fast. Play when an enemy attacks an investigator at your location. | Cancel that attack. Then, reveal a random token from the chaos bag. If it has a [skull], [cultist], […"
MEMBER: Astral Travel (03034) "<b>Move.</b> Move to any revealed location and reveal a random token from the chaos bag. If you reveal a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbo…"
MEMBER: Recharge (03197) "Choose a [[Spell]] or [[Relic]] asset controlled by an investigator at your location and reveal a random chaos token from the chaos bag. If you reveal a [skull], [cultist…"
…and 19 more: Premonition (04199), Dark Future (60403), Astral Travel (60413), Hypnotic Gaze (60414), Parallel Fates (60415), Voice of Ra (60416), Hypnotic Gaze (60423), …
RULING: Reveal-and-hope gambles (Hypnotic Gaze, Astral Travel, Recharge, Voice of Ra). This is NOT token control — it was dropped from the Chaos Token Control compound.
RULING: A manual reveal is NOT a skill-test step: do not pair with timing-skill-st3-reveal-chaos-token unless the card ALSO interacts with in-test reveals (Premonition substitutes into real reveal windows and keeps it; the pure gambles were stripped 2026-07-13).

--- chaos-reveal-another-instead (16 members) ---
MEMBER: Lucky Dice (02230) "Exceptional. | [reaction] When you reveal a non-[auto_fail] chaos token, spend 2 resources: Ignore that chaos token and reveal another one to resolve. If that token has a…"
MEMBER: False Covenant (07116) "Permanent. Limit 1 [[Covenant]] per deck. | [reaction] When an investigator at your location reveals a [curse] token during a skill test, exhaust False Covenant: Cancel t…"
MEMBER: Third Time's a Charm (07161) "Fast. Play when a skill test at your location begins. | Twice during this test, when an investigator reveals a chaos token, they may cancel it, return it to the chaos bag…"
…and 13 more: Lucky Dice (07307), Nkosi Mabati (08091), Heavy Furs (08126), Custom Modifications (09023), Analysis (09049), Book of Living Myths (10013), Strong-Armed (10031), …

--- chaos-reveal-sealed-instead (6 members) ---
MEMBER: The Codex of Ages (04013) "Father Mateo deck only. Seal ([elder_sign]). | You get +1 [willpower] while there is a token sealed here. | [reaction] When you would reveal a chaos token from the chaos …"
MEMBER: Premonition (04199) "Fast. Play during any [free] player window. | Put Premonition into play, reveal a random chaos token from the chaos bag, and seal it on Premonition. | <b>Forced</b> - Whe…"
MEMBER: Favor of the Moon (07271) "Fast. Seal (up to 3 [curse]). If there are no tokens sealed on Favor of the Moon, discard it. | [reaction] When you would reveal a chaos token from the chaos bag, exhaust…"
…and 3 more: Favor of the Sun (07272), Ocula Obscura (11009), Premonition (12064)

==== FILE: src/tags/chaos/seal.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeChaosSeal {
  ChaosSealToken0 = "chaos-seal-token-0",
  ChaosSealTokenAny = "chaos-seal-token-any",
  ChaosSealTokenAutoFail = "chaos-seal-token-auto-fail",
  ChaosSealTokenCultist = "chaos-seal-token-cultist",
  ChaosSealTokenElderSign = "chaos-seal-token-elder-sign",
  ChaosSealTokenElderThing = "chaos-seal-token-elder-thing",
  ChaosSealTokenSkull = "chaos-seal-token-skull",
  ChaosSealTokenTablet = "chaos-seal-token-tablet",
  ChaosSealTokenBless = "chaos-seal-token-bless",
  ChaosSealTokenCurse = "chaos-seal-token-curse",
  ChaosSealRevealed = "chaos-seal-revealed",
}

interface TagChaosSealBase extends TagBase {}

export interface TagChaosSealToken0 extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealToken0;
}

export interface TagChaosSealTokenAny extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenAny;
}

export interface TagChaosSealTokenAutoFail extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenAutoFail;
}

export interface TagChaosSealTokenCultist extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenCultist;
}

export interface TagChaosSealTokenElderSign extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenElderSign;
}

export interface TagChaosSealTokenElderThing extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenElderThing;
}

export interface TagChaosSealTokenSkull extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenSkull;
}

export interface TagChaosSealTokenTablet extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenTablet;
}

export interface TagChaosSealTokenBless extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenBless;
}

export interface TagChaosSealTokenCurse extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenCurse;
}

export interface TagChaosSealRevealed extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealRevealed;
}

--- chaos-seal-token-0 (3 members) ---
MEMBER: Shards of the Void (04310) "Seal (0). Uses (3 charges). | [action] Spend 1 charge or release a chaos token sealed here: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 da…"
MEMBER: Misdirection (11043) "Limit 1 per investigator. Seal (+1 or 0). You may resolve this keyword again after you discover the last clue at your location. | [reaction] When an enemy attacks an inve…"
MEMBER: Obscure (11060) "Limit 1 per investigator. | Seal (0). You may resolve this keyword again after you reveal a location or put a new location into play. | [reaction] When you engage an enem…"

--- chaos-seal-token-any (2 members) ---
MEMBER: Protective Incantation (04031) "Group limit 2 copies of Protective Incantation in play. | Seal (any except [auto_fail]). | <b>Forced</b> - At the end of your turn: You must either spend 1 resource or di…"
MEMBER: Unrelenting (07196) "Max 1 committed per test. | After you commit Unrelenting to a skill test, search the chaos bag for up to 3 non-[auto_fail] chaos tokens of your choice, and seal them on U…"

--- chaos-seal-token-auto-fail (1 member) ---
MEMBER: Seal of the Seventh Sign (04311) "Seal ([auto_fail]). Uses (7 charges). If Seal of the Seventh Sign has no charges, or if it leaves play, remove it from the game. | <b>Forced</b> - After a [skull], [culti…"

--- chaos-seal-token-cultist (3 members) ---
MEMBER: The Chthonian Stone (04030) "Seal ([skull], [cultist], [tablet], or [elder_thing]). | <b>Forced</b> - After you reveal an [auto_fail] symbol during a skill test: Return The Chthonian Stone to your ha…"
MEMBER: Sign of Xelotaph (11070) "Myriad. Seal ([skull], [cultist], [tablet], or [elder_thing]). Uses (3 charges). | <b>Forced</b> - When your turn begins: You must spend 1 charge or discard Sign of Xelot…"
MEMBER: The Chthonian Stone (53008) "Seal ([skull], [cultist], [tablet], or [elder_thing]). Uses (3 charges). If The Chthonian Stone has no charges, return it to your hand. | <b>Forced</b> - After you reveal…"

--- chaos-seal-token-elder-sign (5 members) ---
MEMBER: The Codex of Ages (04013) "Father Mateo deck only. Seal ([elder_sign]). | You get +1 [willpower] while there is a token sealed here. | [reaction] When you would reveal a chaos token from the chaos …"
MEMBER: Serpents of Yig (04014) "<b>Prey</b> - Father Mateo only. | Hunter. | <b>Revelation</b> - Search the chaos bag for the [elder_sign] chaos token and seal it on Serpents of Yig."
MEMBER: Crystalline Elder Sign (04235) "Seal (+1 or [elder_sign]). | You get +1 [willpower], +1 [intellect], +1 [combat], and +1 [agility]."
…and 2 more: Day of Reckoning (07040), Bulwark (11028)

--- chaos-seal-token-elder-thing (3 members) ---
MEMBER: The Chthonian Stone (04030) "Seal ([skull], [cultist], [tablet], or [elder_thing]). | <b>Forced</b> - After you reveal an [auto_fail] symbol during a skill test: Return The Chthonian Stone to your ha…"
MEMBER: Sign of Xelotaph (11070) "Myriad. Seal ([skull], [cultist], [tablet], or [elder_thing]). Uses (3 charges). | <b>Forced</b> - When your turn begins: You must spend 1 charge or discard Sign of Xelot…"
MEMBER: The Chthonian Stone (53008) "Seal ([skull], [cultist], [tablet], or [elder_thing]). Uses (3 charges). If The Chthonian Stone has no charges, return it to your hand. | <b>Forced</b> - After you reveal…"

--- chaos-seal-token-skull (3 members) ---
MEMBER: The Chthonian Stone (04030) "Seal ([skull], [cultist], [tablet], or [elder_thing]). | <b>Forced</b> - After you reveal an [auto_fail] symbol during a skill test: Return The Chthonian Stone to your ha…"
MEMBER: Sign of Xelotaph (11070) "Myriad. Seal ([skull], [cultist], [tablet], or [elder_thing]). Uses (3 charges). | <b>Forced</b> - When your turn begins: You must spend 1 charge or discard Sign of Xelot…"
MEMBER: The Chthonian Stone (53008) "Seal ([skull], [cultist], [tablet], or [elder_thing]). Uses (3 charges). If The Chthonian Stone has no charges, return it to your hand. | <b>Forced</b> - After you reveal…"

--- chaos-seal-token-tablet (3 members) ---
MEMBER: The Chthonian Stone (04030) "Seal ([skull], [cultist], [tablet], or [elder_thing]). | <b>Forced</b> - After you reveal an [auto_fail] symbol during a skill test: Return The Chthonian Stone to your ha…"
MEMBER: Sign of Xelotaph (11070) "Myriad. Seal ([skull], [cultist], [tablet], or [elder_thing]). Uses (3 charges). | <b>Forced</b> - When your turn begins: You must spend 1 charge or discard Sign of Xelot…"
MEMBER: The Chthonian Stone (53008) "Seal ([skull], [cultist], [tablet], or [elder_thing]). Uses (3 charges). If The Chthonian Stone has no charges, return it to your hand. | <b>Forced</b> - After you reveal…"

--- chaos-seal-token-bless (6 members) ---
MEMBER: Rite of Sanctification (07019) "Seal (up to 5 [bless]). If Rite of Sanctification has no tokens sealed on it, discard it. | [reaction] When an investigator at your location plays a card, exhaust Rite of…"
MEMBER: Radiant Smite (07153) "<b>Fight.</b> You may use [willpower] instead of [combat] for this attack. When you initiate this attack, search the chaos bag for up to 3 [bless] tokens, and seal them h…"
MEMBER: Shield of Faith (07221) "Seal (up to 5 [bless]). If Shield of Faith has no tokens sealed on it, discard it. | [reaction] When an enemy attacks an investigator at your location, exhaust Shield of …"
…and 3 more: Nephthys (07262), Favor of the Sun (07272), Holy Spear (07302)

--- chaos-seal-token-curse (3 members) ---
MEMBER: Dark Ritual (07026) "Seal (up to 5 [curse]). | <b>Forced</b> - At the end of the mythos phase: You must either spend 1 resource or discard Dark Ritual."
MEMBER: Flute of the Outer Gods (07268) "Exceptional. Seal (up to X [curse]). | [action] Exhaust Flute of the Outer Gods and release 1 [curse] token sealed on it: Choose a non-[[Elite]] enemy at your location. E…"
MEMBER: Favor of the Moon (07271) "Fast. Seal (up to 3 [curse]). If there are no tokens sealed on Favor of the Moon, discard it. | [reaction] When you would reveal a chaos token from the chaos bag, exhaust…"

--- chaos-seal-revealed (5 members) ---
MEMBER: Premonition (04199) "Fast. Play during any [free] player window. | Put Premonition into play, reveal a random chaos token from the chaos bag, and seal it on Premonition. | <b>Forced</b> - Whe…"
MEMBER: Shards of the Void (04310) "Seal (0). Uses (3 charges). | [action] Spend 1 charge or release a chaos token sealed here: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 da…"
MEMBER: Ocula Obscura (11009) "Agatha Crane deck only. | [reaction] After you succeed at a skill test, if no tokens are sealed here and you did not release a token from Ocula Obscura during this skill …"
…and 2 more: Dial of Ancients (11046), Premonition (12064)

==== FILE: src/tags/chaos/token-pool.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeChaosTokenPool {
  ChaosRecycleToken = "chaos-recycle-token",
  ChaosSpendSealed = "chaos-spend-sealed",
  ChaosBagCountCondition = "chaos-bag-count-condition",
}

interface TagChaosTokenPoolBase extends TagBase {}

/**
 * Keeps a revealed bless/curse token IN the chaos bag ("return that token to the
 * chaos bag after this test ends") instead of letting it return to the token
 * pool — the bless/curse CONSERVATION mechanic of the Innsmouth cycle (Book of
 * Psalms's covenant family, Blessed Blade, Tempt Fate shapes).
 * (Created autonomously 2026-07-17 from the TIC noFit pile — review welcome.)
 */
export interface TagChaosRecycleToken extends TagChaosTokenPoolBase {
  type: TagTypeChaosTokenPool.ChaosRecycleToken;
}

/**
 * Spends or releases SEALED chaos tokens as a cost or consumes them in an
 * effect ("release a chaos token sealed on it:", "returning 3 sealed [bless]
 * tokens to the token pool"). The seal side is chaos-seal-*; this is using the
 * sealed pool as a resource. (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagChaosSpendSealed extends TagChaosTokenPoolBase {
  type: TagTypeChaosTokenPool.ChaosSpendSealed;
}

/**
 * Gates or scales on the NUMBER of bless/curse tokens currently in the chaos
 * bag ("if there are 10 [curse] tokens in the chaos bag", "X = the number of
 * [bless] tokens in the bag"). (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagChaosBagCountCondition extends TagChaosTokenPoolBase {
  type: TagTypeChaosTokenPool.ChaosBagCountCondition;
}

--- chaos-recycle-token (6 members) ---
MEMBER: Beloved (07036) "If a [bless] token is revealed during this test, you may remove Beloved from the game to replace that token's effects with the following: "You automatically succeed. <i>(…"
MEMBER: Sacred Covenant (07110) "Permanent. Limit 1 [[Covenant]] per deck. | [reaction] After an investigator at any location performs the "reveal chaos token" step of a skill test, exhaust Sacred Covena…"
MEMBER: Blasphemous Covenant (07113) "Permanent. Limit 1 [[Covenant]] per deck. | [reaction] When an investigator at your location reveals a [curse] token during a skill test, exhaust Blasphemous Covenant: Tr…"
…and 3 more: Blessing of Isis (07190), Hallow (07301), Twilight Diadem (10134)
RULING: AUTONOMOUS TAG (2026-07-17, TIC ingestion — REVIEW WELCOME): revealed bless/curse returns to the BAG instead of the token pool (the Innsmouth conservation mechanic; 5 TIC members).

--- chaos-spend-sealed (7 members) ---
MEMBER: Rite of Sanctification (07019) "Seal (up to 5 [bless]). If Rite of Sanctification has no tokens sealed on it, discard it. | [reaction] When an investigator at your location plays a card, exhaust Rite of…"
MEMBER: Radiant Smite (07153) "<b>Fight.</b> You may use [willpower] instead of [combat] for this attack. When you initiate this attack, search the chaos bag for up to 3 [bless] tokens, and seal them h…"
MEMBER: Nephthys (07262) "You get +1 [willpower]. | [reaction] When 1 or more [bless] tokens would be removed from the chaos bag during a skill test: Seal them on Nephthys, instead. | [fast] Exhau…"
…and 4 more: Hallow (07301), Ocula Obscura (11009), Misdirection (11043), Obscure (11060)
RULING: AUTONOMOUS TAG (2026-07-17, TIC ingestion — REVIEW WELCOME): sealed tokens used as a RESOURCE — released/spent as costs or consumed by effects (4 TIC members).

--- chaos-bag-count-condition (5 members) ---
MEMBER: Cryptic Grimoire (07022) "[action]: Add 1 [curse] token to the chaos bag. | [action] If there are 10 [curse] tokens in the chaos bag, discard Cryptic Grimoire: Record in your Campaign Log that "yo…"
MEMBER: Harmony Restored (07230) "Search the chaos bag for X [curse] tokens and return them to the token pool. X is the number of [bless] tokens in the chaos bag. Gain 1 resource for each [curse] token re…"
MEMBER: The Stygian Eye (07263) "Fast. Play only during your turn. | Reduce the cost to play The Stygian Eye by 1 for each [curse] token in the chaos bag. | Until the end of the round, you get +3 to each…"
…and 2 more: Book of Living Myths (10013), The Key of Solomon (10104)
RULING: AUTONOMOUS TAG (2026-07-17, TIC ingestion — REVIEW WELCOME): gates/scales on the number of bless/curse in the bag (Favor family, 3 TIC members).

==== FILE: src/tags/clue/additional.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeClueAdditional {
  ClueAdditionalThisLocation = "clue-additional-this-location",
  ClueAdditionalAdjacentLocations = "clue-additional-adjacent-locations",
  ClueAdditionalRevealedLocations = "clue-additional-revealed-locations",
}

interface TagClueAdditionalBase extends TagBase {
  /**
   * This non-optional field forces the use of explicit value of 1
   * when it says "an additional clue" in the card text.
   */
  value: DynamicValue;
}

export interface TagClueAdditionalThisLocation extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalThisLocation;
}

export interface TagClueAdditionalAdjacentLocations extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalAdjacentLocations;
}

export interface TagClueAdditionalRevealedLocations extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalRevealedLocations;
}

--- clue-additional-this-location (55 members) ---
MEMBER: Deduction (01539) "If this skill test is successful while investigating a location, discover 1 additional clue at that location."
MEMBER: Rite of Seeking (01689) "Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. You get +2 [willpower] for this test. If you succee…"
MEMBER: Rite of Seeking (02028) "Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. If you succeed, discover 1 additional clue at this …"
…and 52 more: Deduction (02150), Deduction (02150), Rite of Seeking (02233), Archaic Glyphs (03192), Newspaper (03313), Ancient Stone (04022), Winging It (04272), …

--- clue-additional-adjacent-locations (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- clue-additional-revealed-locations (1 member) ---
MEMBER: Deciphered Reality (02303) "<b>Investigate.</b> The difficulty of this skill test is equal to the highest shroud value among revealed locations in play. If you succeed, discover 1 clue from each rev…"

==== FILE: src/tags/clue/discover.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeClueDiscover {
  ClueDiscoverAnyLocation = "clue-discover-any-location",
  ClueDiscoverConnectingLocation = "clue-discover-connecting-location",
  ClueDiscoverYourLocation = "clue-discover-your-location",
}

interface TagClueDiscoverBase extends TagBase {
  value: DynamicValue;
}

export interface TagClueDiscoverAnyLocation extends TagClueDiscoverBase {
  type: TagTypeClueDiscover.ClueDiscoverAnyLocation;
}

export interface TagClueDiscoverConnectingLocation extends TagClueDiscoverBase {
  type: TagTypeClueDiscover.ClueDiscoverConnectingLocation;
}

export interface TagClueDiscoverYourLocation extends TagClueDiscoverBase {
  type: TagTypeClueDiscover.ClueDiscoverYourLocation;
}

--- clue-discover-any-location (10 members) ---
MEMBER: The Necronomicon (60233) "Uses (6 secrets). Limit 1 per deck. | [free] Spend 1 secret: You get +2 skill value for this skill test. | [free] Spend 2 secrets: Draw 2 cards. | [free] Spend 3 secrets:…"
MEMBER: Interrogate (05020) "<b>Parley.</b> Choose a [[Humanoid]] enemy at your location and test [combat] (3). This test gets +X difficulty, where X is the chosen enemy's damage value. If you succee…"
MEMBER: Connect the Dots (05025) "Fast. Play after you discover the last clue at your location. | Discover 2 clues at a location with a lower printed shroud value than your location."
…and 7 more: Pendant of the Queen (06022), On the Trail (08084), Damning Testimony (09059), Shed a Light (09108), Nature of the Beast (09111), Working a Hunch (11045), Will of the Cosmos (12066)

--- clue-discover-connecting-location (17 members) ---
MEMBER: Seeking Answers (01685) "<b>Investigate.</b> If you succeed, instead of discovering a clue at your location, discover 2 total clues from among your location and connecting locations."
MEMBER: Seeking Answers (02023) "<b>Investigate.</b> If you succeed, instead of discovering a clue at your location, discover a clue at a connecting location."
MEMBER: Grete Wagner (60128) "You get +1 [combat] and +1 [intellect]. | [reaction] After you defeat an enemy, exhaust Grete Wagner and deal 1 damage to her: Discover 1 clue at your location or a conne…"
…and 14 more: Seeking Answers (60227), "Look what I found!" (60524), Intel Report (05111), Eye of Chaos (07118), Eye of Chaos (07227), On the Trail (08085), Professor William Webb (08104), …

--- clue-discover-your-location (75 members) ---
MEMBER: Evidence! (01522) "Fast. Play after you defeat an enemy. | Discover 1 clue at your location."
MEMBER: Working a Hunch (01537) "Fast. Play only during your turn. | Discover 1 clue at your location."
MEMBER: Drawn to the Flame (01564) "Draw the top card of the encounter deck. Then, discover 2 clues at your location."
…and 72 more: "Look what I found!" (01579), Seeking Answers (01685), Art Student (02149), Gravedigger's Shovel (03037), Finn Edwards (04003), Scene of the Crime (04103), Scene of the Crime (04103), …

==== FILE: src/tags/clue/place.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeCluePlace {
  CluePlaceYourLocation = "clue-place-your-location",
}

interface TagCluePlaceBase extends TagBase {
  value: number;
}

/**
 * PLACE a clue (from the token bank) on a location, distinct from DISCOVERING a
 * clue (ClueDiscover*) and from ClueAdditional (extra clues during an
 * investigation). Placing seeds a clue to be collected / fuels "when a clue is
 * placed" tech.
 */
export interface TagCluePlaceYourLocation extends TagCluePlaceBase {
  type: TagTypeCluePlace.CluePlaceYourLocation;
}

--- clue-place-your-location (4 members) ---
MEMBER: Forewarned (03150) "Fast. Play when you draw a non-weakness treachery card. | Place 1 of your clues on your location. Then, cancel that card's revelation effect."
MEMBER: Bizarre Diagnosis (09046) "Place 1 of your clues on your location. Then, heal 3 damage from an investigator or [[Ally]] asset at your location."
MEMBER: Captivating Discovery (09047) "Search the top 6 cards of your deck. You may place up to 3 of your clues on your location. For each clue placed in this way, choose and add 2 of the searched cards to you…"
…and 1 more: Lethal Curiosity (60254)
RULING: BENEFICIAL placement from the token bank onto a location. Placing one of your OWN clues as a reaction COST is cost-reaction-spend-clue — Dr. Maleson 02302 is the canonical (and once-reversed) case; final ruling: Maleson = cost-reaction-spend-clue.

==== FILE: src/tags/commit/main.ts ====
import { TagBase } from "../../base.js";
import { TestingBasicAction } from "../../kohaku.js";

export enum TagTypeCommit {
  CommitOtherInvestigator = "commit-other-investigator",
  CommitFromNonHand = "commit-from-non-hand",
  CommitFetch = "commit-fetch",
  CommitMax = "commit-max",
  CommitBenefitsPerformer = "commit-benefits-performer",
  CommitDuringBasicAction = "commit-during-basic-action",
  CommitDuringAttack = "commit-during-attack",
  CommitDuringEvade = "commit-during-evade",
  CommitCountCondition = "commit-count-condition",
}

interface TagCommitBase extends TagBase {}

/**
 * The card's beneficial effect targets "the [evading/investigating/performing] investigator"
 * — whoever performs the committed test, which may be another player. This is what makes a
 * skill a true SUPPORT card (Eureka!, Take Heart: the search/draw/resources go to the
 * performer). The general, effect-agnostic counterpart of move-investigator-performer;
 * contrast effects worded for "you"/the owner (Guts), which are NOT support. Feeds Support.
 */
export interface TagCommitBenefitsPerformer extends TagCommitBase {
  type: TagTypeCommit.CommitBenefitsPerformer;
}

/**
 * Commit a card to another investigator's skill test, possibly at range
 * (e.g. Carson-style remote support).
 */
export interface TagCommitOtherInvestigator extends TagCommitBase {
  type: TagTypeCommit.CommitOtherInvestigator;
  range?: "your-location" | "connecting" | "any";
}

/** Commit a card from somewhere other than your hand. */
export interface TagCommitFromNonHand extends TagCommitBase {
  type: TagTypeCommit.CommitFromNonHand;
  source?: "deck-top" | "discard" | "attached";
}

/** Dig out and force-commit a skill card. */
export interface TagCommitFetch extends TagCommitBase {
  type: TagTypeCommit.CommitFetch;
  source?: "own-deck" | "investigator-discard";
}

/** A cap on the maximum number of cards committed (per skill test). */
export interface TagCommitMax extends TagCommitBase {
  type: TagTypeCommit.CommitMax;
  value?: number;
}

/**
 * The skill's bonus is gated on being committed during a BASIC action's test —
 * "While X is committed during a basic <fight/evade/investigate> action, it gains …"
 * (the Dream-Eaters trio: Brute Force, Sharp Vision, Expeditious Retreat).
 * NOTE: cards that react to PERFORMING basic actions in general (Close the Circle,
 * EotE) are a different mechanic — give them their own tag when that pack lands.
 */
export interface TagCommitDuringBasicAction extends TagCommitBase {
  type: TagTypeCommit.CommitDuringBasicAction;
  action?: TestingBasicAction;
}

/**
 * Commit restricted to (or bonus gated on) a test made during an ATTACK — any
 * attack, including ability-granted ones, unlike commit-during-basic-action
 * (Daring: "Commit only to a skill test during an attack or evasion attempt").
 * Marks the skill as attack support.
 */
export interface TagCommitDuringAttack extends TagCommitBase {
  type: TagTypeCommit.CommitDuringAttack;
}

/**
 * Commit restricted to (or bonus gated on) a test made during an EVASION
 * attempt — any evade, not just the basic action (Daring). Marks the skill as
 * evasion support.
 */
export interface TagCommitDuringEvade extends TagCommitBase {
  type: TagTypeCommit.CommitDuringEvade;
}

/**
 * Gates or scales on the NUMBER of cards/skills committed to the test ("if you
 * committed 1 or more skills to this skill test") — the Innsmouth Silas/Amanda
 * skills-matter archetype. (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagCommitCountCondition extends TagCommitBase {
  type: TagTypeCommit.CommitCountCondition;
}

--- commit-other-investigator (9 members) ---
MEMBER: Leadership (02260) "While Leadership is committed to a skill test being performed by another investigator, Leadership gains [willpower] [wild]."
MEMBER: Analytical Mind (03010) "Minh Thi Phan deck only. | You may commit 1 card to each skill test performed by an investigator at another location. | [reaction] After you commit exactly 1 card to a sk…"
MEMBER: Self-Sacrifice (06157) "Commit only to a skill test (of any type) being performed by another investigator at your location. | If this test fails, you must resolve all effects from the failed tes…"
…and 6 more: Leadership (06235), Livre d'Eibon (08005), "As you wish" (09002), Fighting Lessons (09030), Bestow Resolve (09032), Contemplative (11088)

--- commit-from-non-hand (18 members) ---
MEMBER: Daredevil (60318) "After you commit Daredevil to a skill test, discard cards from the top of your deck until you discard a [rogue] skill you can commit to this test. Commit it. Shuffle each…"
MEMBER: Copycat (60330) "After you commit Copycat to a skill test, search the discard pile of another investigator for a skill you can commit to this test, and commit it. After this test ends, pl…"
MEMBER: Twilight Blade (05013) "Diana Stanley deck only. | [action]: <b>Fight.</b> You may use [willpower] instead of [combat] for this attack. | You may play or commit events and skills beneath Diana S…"
…and 15 more: Mandy Thompson (06002), Crystallizer of Dreams (06024), Practice Makes Perfect (06197), Daredevil (06240), Surprising Find (06278), Amanda Sharpe (07002), Silas Marsh (07005), …

--- commit-fetch (5 members) ---
MEMBER: Daredevil (60318) "After you commit Daredevil to a skill test, discard cards from the top of your deck until you discard a [rogue] skill you can commit to this test. Commit it. Shuffle each…"
MEMBER: Copycat (60330) "After you commit Copycat to a skill test, search the discard pile of another investigator for a skill you can commit to this test, and commit it. After this test ends, pl…"
MEMBER: Practice Makes Perfect (06197) "Fast. Play during a skill test at your location. | Search the top 9 cards of your deck for a [[Practiced]] skill and commit it to this skill test, if able. Shuffle the re…"
…and 2 more: Daredevil (06240), Guided by the Unseen (07223)

--- commit-max (51 members) ---
MEMBER: Guts (01589) "Max 1 committed per skill test. | If this test is successful, draw 1 card."
MEMBER: Perception (01590) "Max 1 committed per skill test. | If this test is successful, draw 1 card."
MEMBER: Overpower (01591) "Max 1 committed per skill test. | If this test is successful, draw 1 card."
…and 48 more: Manual Dexterity (01592), Unexpected Courage (01593), Double or Nothing (02026), Say Your Prayers (03116), Desperate Search (03117), Reckless Assault (03118), Run For Your Life (03119), …

--- commit-benefits-performer (14 members) ---
MEMBER: Eureka! (03231) "If this skill test is successful, the investigator performing this test searches the top 3 cards of his or her deck for a card, draws it, and shuffles his or her deck."
MEMBER: Take Heart (04201) "Max 1 committed per skill test. | You may commit Take Heart to any type of test. | If this test fails, the performing investigator draws 2 cards and gains 2 resources."
MEMBER: Take Heart (60519) "Max 1 committed per skill test. | You may commit Take Heart to any type of test. | If this test fails, the performing investigator draws 2 cards and gains 2 resources."
…and 11 more: Grisly Totem (05194), Self-Sacrifice (06157), Leadership (06235), Butterfly Effect (07160), "As you wish" (09002), Mesmeric Influence (10096), Contemplative (11088), …
RULING: Non-move effects that benefit the PERFORMING investigator, who may be another player (Eureka!, Take Heart) → rolls into Support. Moves of the performer are location-move-investigator-performer instead.

--- commit-during-basic-action (6 members) ---
MEMBER: Brute Force (06166) "Max 1 committed per skill test. | While Brute Force is committed during a basic fight action, it gains [combat][combat] and the text: "If this test is successful by 2 or …"
MEMBER: Sharp Vision (06204) "Max 1 committed per skill test. | While Sharp Vision is committed during a basic investigate action, it gains [intellect] [intellect] and the text: "If this test is succe…"
MEMBER: Expeditious Retreat (06246) "Max 1 committed per skill test. | While Expeditious Retreat is committed during a basic evade action, it gains [agility][agility] and the text: "If this test is successfu…"
…and 3 more: Well-Dressed (10130), Know the Scene (60354), Know the Scene (60354)
RULING: Committed-skill bonus gated on a BASIC action's test (Brute Force fight, Sharp Vision investigate, Expeditious Retreat evade). Cards reacting to PERFORMING basic actions in general (Close the Circle, EotE) are a DIFFERENT mechanic — new tag when that pack lands (ruled 2026-07-16).

--- commit-during-attack (6 members) ---
MEMBER: Daring (06111) "Commit only to a skill test during an attack or evasion attempt against an enemy. That enemy gains retaliate and alert for the duration of this skill test. After this tes…"
MEMBER: Fighting Lessons (09030) "Commit only to a skill test during an attack or evasion attempt. | You can commit this skill to an investigator's test at any location."
MEMBER: Strong-Armed (10031) "While Strong-Armed is committed to an attack using a [[Melee]] or [[Ranged]] asset, this attack deals +1 damage. After revealing chaos token(s) for this skill test, you m…"
…and 3 more: Long Shot (10116), Know the Exit (60352), Adapt and Overcome (60167)
RULING: Commit restricted to / gated on ATTACK tests — any attack, not just the basic Fight action (Daring; contrast commit-during-basic-action). Marks a skill as attack support; commit-during-evade is the evasion twin (Daring carries both).

--- commit-during-evade (5 members) ---
MEMBER: Daring (06111) "Commit only to a skill test during an attack or evasion attempt against an enemy. That enemy gains retaliate and alert for the duration of this skill test. After this tes…"
MEMBER: Fighting Lessons (09030) "Commit only to a skill test during an attack or evasion attempt. | You can commit this skill to an investigator's test at any location."
MEMBER: Long Shot (10116) "You may commit Long Shot to a fight or evasion test against an enemy at your location or a connecting location. | If this test is successful, deal 1 damage to that enemy."
…and 2 more: Know the Exit (60352), Adapt and Overcome (60167)

--- commit-count-condition (3 members) ---
MEMBER: Sea Change Harpoon (07014) "Silas Marsh deck only. | [action]: <b>Fight.</b> You get +1 [combat] for this attack. If you committed 1 or more skills to this skill test, this attack deals +1 damage. W…"
MEMBER: Silas's Net (07015) "Silas Marsh deck only. | [action]: <b>Evade.</b> You get +1 [agility] for this evasion attempt. If you succeed and you committed 1 or more skills to this skill test, you …"
MEMBER: Siren Call (07016) "<b>Revelation</b> - Put Siren Call into play in your threat area. | As an additional cost to commit 1 or more cards to a skill test, you must pay 1 resource for each matc…"
RULING: AUTONOMOUS TAG (2026-07-17, TIC ingestion — REVIEW WELCOME): gates/scales on committed-card count — the Silas/Amanda skills-matter archetype (3 TIC members).

==== FILE: src/tags/condition/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeCondition {
  ConditionResource = "condition-resource",
  ConditionSanity = "condition-sanity",
  ConditionHandSize = "condition-hand-size",
  ConditionEngagedAlone = "condition-engaged-alone",
  ConditionClueHeld = "condition-clue-held",
  ConditionCopies = "condition-copies",
}

interface TagConditionBase extends TagBase {
  /** Whether the threshold is an at-least (`min`) or at-most (`max`) gate. */
  comparison: "min" | "max";
  /** The threshold the investigator's current self-state is compared against. */
  value: number;
}

/** Gates or scales on the investigator's current resource count. */
export interface TagConditionResource extends TagConditionBase {
  type: TagTypeCondition.ConditionResource;
}

/** Gates or scales on the investigator's current remaining sanity. */
export interface TagConditionSanity extends TagConditionBase {
  type: TagTypeCondition.ConditionSanity;
}

/** Gates or scales on the number of cards in the investigator's hand. */
export interface TagConditionHandSize extends TagConditionBase {
  type: TagTypeCondition.ConditionHandSize;
}

/**
 * Gates on a lone engagement — the relevant enemy is the ONLY enemy engaged with you
 * (e.g. Machete's "+1 damage if it is the only enemy engaged with you"). A flag, not a
 * numeric threshold, so it does not carry a comparison/value.
 */
export interface TagConditionEngagedAlone extends TagBase {
  type: TagTypeCondition.ConditionEngagedAlone;
}

/**
 * Cares about the number of clues the INVESTIGATOR personally holds — GATES on a threshold
 * (Newspaper: bonus if you control 2+ clues → comparison/value set) or SCALES with the
 * count (Search for the Truth: draw cards equal to clues on you → no threshold, args omitted).
 */
export interface TagConditionClueHeld extends TagBase {
  type: TagTypeCondition.ConditionClueHeld;
  /** Comparison for a threshold gate; omit when the effect simply scales with the count. */
  comparison?: "min" | "max";
  /** Threshold value for a gate; omit when scaling. */
  value?: number;
}

/**
 * Cares about MULTIPLE COPIES of a card — the Dream-Eaters "copies matter"
 * family. Usually copies of ITSELF (`of` omitted): Segment of Onyx (3 in play →
 * assemble), Three Aces (3 committed), Fortuitous Discovery (X = copies in
 * discard), Dream-Enhancing Serum / Mind's Eye / Spiritual Resolve / Easy Mark
 * (hand copies). `of: "chosen"` = copies of another card you pick (Lucid
 * Dreaming fetches a duplicate). `zone` = where the copies are counted.
 */
export interface TagConditionCopies extends TagBase {
  type: TagTypeCondition.ConditionCopies;
  zone?: "in-play" | "hand" | "discard" | "committed";
  of?: "self" | "chosen";
}

--- condition-resource (13 members) ---
MEMBER: Fire Axe (02032) "[action]: <b>Fight.</b> If you have no resources in your resource pool, this attack deals +1 damage. | [free] During an attack using Fire Axe, spend 1 resource: You get +…"
MEMBER: Dark Horse (02234) "Limit 1 per investigator. | During the upkeep phase, you may choose to not gain resources. | While you have no resources in your resource pool, you get +1 [willpower], +1…"
MEMBER: Dario El-Amin (03151) "While you have 10 or more resources, you get +1 [willpower] and +1 [intellect]. | [action] If there are no enemies at your location, exhaust Dario El-Amin: Gain 2 resourc…"
…and 10 more: Madame Labranche (03198), Cunning (05030), Nothing Left to Lose (06284), Mariner's Compass (07121), The Black Fan (08057), Unscrupulous Loan (08113), Fire Axe (10120), …
RULING: Compound note: Big Money membership is where-filtered to {comparison:"min"} — a 'max 0' (empty pool) condition is the OPPOSITE of big (Madame Labranche lesson; same for condition-hand-size / Big Hand).

--- condition-sanity (8 members) ---
MEMBER: Anatomical Diagrams (03108) "Fast. Play during any investigator's turn. Play only if you have 5 or more remaining sanity. | Choose a non-[[Elite]] enemy at your location. Until the end of the active …"
MEMBER: Say Your Prayers (03116) "Max 1 committed per skill test. | Commit to a skill test only if you have 3 or fewer remaining sanity."
MEMBER: Desperate Search (03117) "Max 1 committed per skill test. | Commit to a skill test only if you have 3 or fewer remaining sanity."
…and 5 more: Reckless Assault (03118), Run For Your Life (03119), Meat Cleaver (05114), Meat Cleaver (12077), Meat Cleaver (12085)

--- condition-hand-size (11 members) ---
MEMBER: Higher Education (02187) "Permanent. | While you have 5 or more cards in your hand, Higher Education gains: | "[free] Spend 1 resource: You get +2 [willpower] for this skill test. | [free] Spend 1…"
MEMBER: Madame Labranche (03198) "[free] If you have no cards in your hand, exhaust Madame Labranche: Draw 1 card. | [free] If you have no resources, exhaust Madame Labranche: Gain 1 resource."
MEMBER: Celaeno Fragments (60206) "While you have... | - ...5 or more cards in hand, you get +1 [intellect]. | - ...10 or more cards in hand, you get +1 [willpower]. | - ...15 or more cards in hand, you ge…"
…and 8 more: Forbidden Tome (60210), Higher Education (60211), Cryptic Writings (60224), Farsight (60231), Curiosity (05026), Dream Diary (06238), Nothing Left to Lose (06284), …

--- condition-engaged-alone (2 members) ---
MEMBER: Machete (01520) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. If the attacked enemy is the only enemy engaged with you, this attack deals +1 damage."
MEMBER: Machete (12020) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. If the attacked enemy is the only enemy engaged with you, this attack deals +1 damage."

--- condition-clue-held (11 members) ---
MEMBER: Search for the Truth (02008) "Rex Murphy deck only. | Draw X cards, where X is the number of clues on Rex Murphy (to a maximum of 5)."
MEMBER: "I've got a plan!" (02107) "<b>Fight.</b> This attack uses [intellect]. You deal +1 damage for this attack for each clue you have (max +3 damage)."
MEMBER: Newspaper (02155) "You get +2 [intellect] while investigating if you have no clues."
…and 8 more: Logical Reasoning (03191), Newspaper (03313), "I've got a plan!" (60225), Caustic Reaction (60261), Unflappable (60262), Caustic Reaction (60273), Through the Cracks (12037), …

--- condition-copies (11 members) ---
MEMBER: Segment of Onyx (06021) "Myriad. Fast. | [fast] If you have 3 copies of Segment of Onyx in play: Set them aside, out of play. Search your bonded cards for Pendant of the Queen and put it into pla…"
MEMBER: Easy Mark (06026) "Myriad. | Gain 2 resources and draw 1 card. | [reaction] After you play Easy Mark: Play another Easy Mark from your hand, at no cost."
MEMBER: Fortuitous Discovery (06034) "Myriad. | X is the number of other copies of Fortuitous Discovery in your discard pile. | <b>Investigate.</b> You get +X [intellect] for this investigation. If you succee…"
…and 8 more: Dream-Enhancing Serum (06159), Three Aces (06199), Lucid Dreaming (06205), Spiritual Resolve (06323), Mind's Eye (06328), Sled Dog (08127), Sign of Xelotaph (11070), …
RULING: Renamed from condition-own-copies (2026-07-17): also covers fetching duplicates of a CHOSEN card (Lucid Dreaming, of:'chosen'). zone = where copies are counted. All members roll into the Copies Matter compound. Myriad itself stays untagged — this tag is for copies-referencing EFFECTS.

==== FILE: src/tags/control/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeControl {
  ControlYourCard = "control-your-card",
  ControlTransferAsset = "control-transfer-asset",
}

interface TagControlBase extends TagBase {}

/** The effect targets an asset or investigator YOU CONTROL (ownership scope, distinct from location scope) — e.g. Moonlight Ritual removing doom from an asset/investigator you control. */
export interface TagControlYourCard extends TagControlBase {
  type: TagTypeControl.ControlYourCard;
}

/**
 * Control of an ASSET moves between investigators — giving (Teamwork, Solemn Vow
 * played under another's control) or taking (Kleptomania). Resource transfers are
 * gain-resource-move-investigator; this is the asset-control half.
 */
export interface TagControlTransferAsset extends TagControlBase {
  type: TagTypeControl.ControlTransferAsset;
}

--- control-your-card (4 members) ---
MEMBER: Moonlight Ritual (02267) "Remove all doom from 1 card you control."
MEMBER: Swift Reload (06161) "Fast. Play only during your turn. | Choose a [[Firearm]] asset you control with fewer ammo tokens than its uses (X) value. Place ammo on that asset until it has ammo equa…"
MEMBER: Sin-Eater (09094) "Permanent. Exceptional. | [fast] Exhaust Sin-Eater: Move 1 doom from an asset you control to Sin-Eater. Then, either ready that asset or place 1 charge on it. | [action]:…"
…and 1 more: Unflappable (60271)
RULING: Targets an asset/investigator YOU CONTROL as scope (Moonlight Ritual).

--- control-transfer-asset (7 members) ---
MEMBER: Teamwork (02018) "Investigators at your location may give or trade any number of [[Item]] assets, [[Ally]] assets, or resources among one another."
MEMBER: Solemn Vow (06020) "Myriad. Fast. | Play Solemn Vow under the control of another investigator at your location. | [fast] If the owner of Solemn Vow is at your location, exhaust Solemn Vow: M…"
MEMBER: Kleptomania (06036) "Multiplayer only. | <b>Revelation</b> - Put Kleptomania into play in your play area. | [action]: Take control of an [[Item]] asset or 2 resources from another investigato…"
…and 4 more: Enchanted Armor (07189), Shrewd Dealings (08017), Talisman of Protection (08116), Pitchfork (10110)
RULING: Asset control moving between investigators: give (Teamwork 02018, Solemn Vow 06020 played under another's control) or take (Kleptomania 06036). Resource transfers = gain-resource-move-investigator (both on Teamwork/Kleptomania). Moving DAMAGE/HORROR between player cards (Solemn Vow's second ability, Tommy Muldoon) still has NO tag.

==== FILE: src/tags/cost/action.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeCostAction {
  CostActionDiscardFromHand = "cost-action-discard-from-hand",
  CostActionDiscardSelf = "cost-action-discard-self",
  CostActionExhaustSelf = "cost-action-exhaust-self",
  CostActionMultiple = "cost-action-multiple",
  CostActionSpendResource = "cost-action-spend-resource",
  CostActionSpendSecret = "cost-action-spend-secret",
  CostActionSpendCharge = "cost-action-spend-charge",
  CostActionSpendAmmo = "cost-action-spend-ammo",
  CostActionSpendSupply = "cost-action-spend-supply",
}

interface TagCostActionBase extends TagBase {}

export interface TagCostActionDiscardFromHand extends TagCostActionBase {
  type: TagTypeCostAction.CostActionDiscardFromHand;
}

export interface TagCostActionDiscardSelf extends TagCostActionBase {
  type: TagTypeCostAction.CostActionDiscardSelf;
}

export interface TagCostActionExhaustSelf extends TagCostActionBase {
  type: TagTypeCostAction.CostActionExhaustSelf;
}

export interface TagCostActionMultiple extends TagCostActionBase {
  type: TagTypeCostAction.CostActionMultiple;
}

export interface TagCostActionSpendResource extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendResource;
  /** Where the spent resources live: pool (omit, default), the card's own uses ("card"), or pool-or-card ("either"). */
  source?: "card" | "either";
}

/**
 * An [action]-activated ability that spends a secret (parallel to
 * CostActionSpendResource and CostFreeSpendSecret).
 */
export interface TagCostActionSpendSecret extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendSecret;
}

/** [action] ability whose cost is spending a CHARGE use-token from this card's own pool. Ammo firearms use cost-action-spend-ammo instead. */
export interface TagCostActionSpendCharge extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendCharge;
}

/** [action] ability whose cost is spending an AMMO use-token from this card's own pool (every 'spend 1 ammo: Fight' firearm). */
export interface TagCostActionSpendAmmo extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendAmmo;
}

/** [action] ability whose cost is spending a supply use-token from this card's pool. */
export interface TagCostActionSpendSupply extends TagCostActionBase {
  type: TagTypeCostAction.CostActionSpendSupply;
}

--- cost-action-discard-from-hand (4 members) ---
MEMBER: Archaic Glyphs (03025) "[action] Discard a card with at least 1 [intellect] skill icon from your hand: Place 1 resource on Archaic Glyphs from the token pool, as a secret. | <b>Forced</b> - Afte…"
MEMBER: Robert Castaigne (11051) "You get +1 [combat]. | [action] Discard a [[Firearm]] asset that takes up 1 or fewer hand slots from your hand and exhaust Robert Castaigne: Resolve a <b>Fight</b> abilit…"
MEMBER: Down and Out (11126) "<b>Revelation</b> - Put Down and Out into play in your threat area. | <b>Forced</b> - When your turn ends, if you did not take either a draw or resource action this round…"
…and 1 more: Called to Guinée (60453)

--- cost-action-discard-self (17 members) ---
MEMBER: Knife (01586) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. | [action] Discard Knife: <b>Fight.</b> You get +2 [combat] for this attack. This attack deals +1 damage."
MEMBER: Lantern (03036) "[action]: <b>Investigate.</b> Your location gets -1 shroud for this investigation. | [action] Discard Lantern: Deal 1 damage to an enemy at your location. This action doe…"
MEMBER: Gravedigger's Shovel (03037) "[action]: <b>Fight.</b> You get +2 [combat] for this attack. | [action] Discard Gravedigger's Shovel: Discover 1 clue at your location."
…and 14 more: Tennessee Sour Mash (05117), Tennessee Sour Mash (05190), Tennessee Sour Mash (05191), Investments (05233), Hope (06031), Zeal (06032), Augur (06033), …

--- cost-action-exhaust-self (90 members) ---
MEMBER: Old Book of Lore (01531) "[action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of his or her deck for a card, draws it, and shuffl…"
MEMBER: Encyclopedia (01542) "[action] Exhaust Encyclopedia: Choose an investigator at your location. That investigator gets +2 to a skill of your choice until the end of the phase."
MEMBER: Burglary (01545) "[action] Exhaust Burglary: <b>Investigate.</b> If you succeed, instead of discovering clues, gain 3 resources."
…and 87 more: Cat Burglar (01555), Scrying (01561), Book of Shadows (01570), Old Book of Lore (01686), Lockpicks (01687), Duke (02014), Stealth (03028), …

--- cost-action-multiple (32 members) ---
MEMBER: Kukri (02036) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. If you succeed, you may spend 1 additional action to deal +1 damage for this attack."
MEMBER: Chicago Typewriter (02304) "Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You may spend any number of additional actions when you perform this attack. You get +2 [combat] for this attack for…"
MEMBER: Drawing the Sign (03041) "<b>Revelation</b> - Put Drawing the Sign into play in your threat area. | Your maximum hand size is reduced by 5. | [action] [action]: Discard Drawing the Sign."
…and 29 more: Self-Destructive (60104), Obsessive (60204), Forbidden Tome (60229), Forbidden Tome (60230), Nihilism (60404), Called by the Mists (60503), Atychiphobia (60504), …
RULING: Skip on boring weaknesses — investigators and basic/story weaknesses get few or no tags; only genuine player-facing effects.

--- cost-action-spend-resource (8 members) ---
MEMBER: Book of Shadows (03154) "[action] Exhaust Book of Shadows and spend 1 resource: Add 1 charge to a [[Spell]] asset you control."
MEMBER: Research Notes (09045) "[reaction] After a player card ability places 1 or more of your clues on your location: Place that many resources on Research Notes, as evidence. | [action]: Test [intell…"
MEMBER: Microscope (10042) "[reaction] After an enemy at your location is successfully evaded or defeated, exhaust Microscope: Place 1 resource on Microscope, as evidence. | [action] [action]: <b>In…"
…and 5 more: Microscope (10058), Bianca "Die Katz" (10063), Luger P08 (11050), Mob Connections (11059), Down and Out (11126)

--- cost-action-spend-secret (24 members) ---
MEMBER: Old Book of Lore (01686) "Uses (2 secrets). | [action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of their deck for a card, draws…"
MEMBER: In the Know (03027) "Uses (3 secrets). | [action] Spend 1 secret: <b>Investigate.</b> Investigate any revealed location in play as if you were at that location."
MEMBER: Feed the Mind (04267) "Uses (3 secrets). | [action] Exhaust Feed the Mind and spend 1 secret: Test [intellect] (0). For each point you succeed by, draw 1 card. Then, take 1 horror for each card…"
…and 21 more: Pnakotic Manuscripts (04307), Encyclopedia (60208), Feed the Mind (60209), Forbidden Tome (60210), Esoteric Atlas (60222), Scroll of Secrets (05116), Scroll of Secrets (05188), …

--- cost-action-spend-charge (62 members) ---
MEMBER: Shrivelling (01560) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder…"
MEMBER: Scrying (01561) "Uses (3 charges). | [action] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck or the encounter deck. Return them to the top of that …"
MEMBER: Rite of Seeking (01689) "Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. You get +2 [willpower] for this test. If you succee…"
…and 59 more: Rite of Seeking (02028), Clarity of Mind (02030), Song of the Dead (02112), Shrivelling (02154), Rite of Seeking (02233), Shrivelling (02306), Archaic Glyphs (03192), …
RULING: Charges (spells/charged relics) ONLY since the 2026-07-03 split. A firearm spending AMMO is cost-action-spend-ammo — 28 guns were once embarrassingly tagged as spending charges. Match the printed use-token type: ammo/charge/supply/secret/resource are all distinct tags.

--- cost-action-spend-ammo (52 members) ---
MEMBER: Roland's .38 Special (01506) "Roland Banks deck only. | Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack (if there are 1 or more clues on your location, you ge…"
MEMBER: .45 Automatic (01516) "Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack. This attack deals +1 damage."
MEMBER: Shotgun (01529) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] for this attack. Instead of its standard damage, this attack deals 1 damage for each point you s…"
…and 49 more: .41 Derringer (01547), .41 Derringer (01688), Jenny's Twin .45s (02010), Springfield M1903 (02226), Lightning Gun (02301), Chicago Typewriter (02304), .32 Colt (03020), …

--- cost-action-spend-supply (23 members) ---
MEMBER: First Aid (01519) "Uses (3 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage or horror from an investigator at your location."
MEMBER: Flashlight (01587) "Uses (3 supplies). | [action] Spend 1 supply: <b>Investigate.</b> Your location gets -2 shroud for this investigation."
MEMBER: First Aid (01683) "Uses (4 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage and 1 horror from an investigator or [[Ally]] asset in your location…"
…and 20 more: Liquid Courage (02024), Strange Solution (02262), Strange Solution (02263), Strange Solution (02264), First Aid (03230), Kerosene (04304), Thermos (04274), …

==== FILE: src/tags/cost/discount.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeCostDiscount {
  CostDiscount = "cost-discount",
  CostDiscountSelf = "cost-discount-self",
}

interface TagCostDiscountBase extends TagBase {
  /**
   * The amount of discount. Use "dynamic" for a variable (X) amount.
   */
  amount: DynamicValue;
}

/**
 * Discounts the cost of playing OTHER cards (Fence, Chuck Fergus, Ever Vigilant,
 * Robes of Endless Night) — the Economy-compound sense. A card discounting only
 * ITSELF is cost-discount-self.
 */
export interface TagCostDiscount extends TagCostDiscountBase {
  type: TagTypeCostDiscount.CostDiscount;
}

/**
 * Reduces its OWN cost conditionally, usually offsetting a huge printed cost
 * (Extensive Research's 10). NOT economy — it supports no other card (ruled
 * 2026-07-17, TDE full review: "you have been tricked").
 */
export interface TagCostDiscountSelf extends TagCostDiscountBase {
  type: TagTypeCostDiscount.CostDiscountSelf;
}

--- cost-discount (41 members) ---
MEMBER: Old Book of Lore (01686) "Uses (2 secrets). | [action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of their deck for a card, draws…"
MEMBER: Improvisation (03018) "Lola Hayes deck only. | Fast. Play only during your turn. | Switch your role. Until the end of your turn, reduce the resource cost of the next card you play of your role …"
MEMBER: Ever Vigilant (03023) "One at a time, play up to 3 assets from your hand, reducing the resource cost of each by 1."
…and 38 more: Charles Ross, Esq. (03149), Uncage the Soul (03033), Calling in Favors (03158), Leo Anderson (04001), Fence (04108), On Your Own (04236), Library Docent (60220), …
RULING: Discounts OTHER cards (Fence, Chuck Fergus, Ever Vigilant) — the Economy sense. A card reducing only its OWN cost (Extensive Research offsetting its printed 10) is cost-discount-self and NOT economy ('you have been tricked' — ruled 2026-07-17).

--- cost-discount-self (6 members) ---
MEMBER: Extensive Research (60216) "Reduce the cost to play Extensive Research by 1 for each other card in your hand. | Discover 2 clues at your location."
MEMBER: Extensive Research (06198) "Reduce the cost to play Extensive Research by 1 for each other card in your hand. | Discover 2 clues at your location."
MEMBER: The Stygian Eye (07263) "Fast. Play only during your turn. | Reduce the cost to play The Stygian Eye by 1 for each [curse] token in the chaos bag. | Until the end of the round, you get +3 to each…"
…and 3 more: Join the Caravan (08036), Pay Your Due (09126), Quick Shot (11031)

==== FILE: src/tags/cost/free.ts ====
import { TagBase } from "../../base.js";

/**
 * Costs of a FREE TRIGGERED ABILITY — the [free] icon (historically printed as
 * [fast]; same thing). The cost is whatever appears before the colon, e.g.
 * "[free] Discard X: ..." → CostFreeDiscardSelf.
 *
 * NOTE: do NOT confuse the [free] icon with the "Fast." KEYWORD on an event/asset/
 * skill (which lets the card be played without spending an action). That keyword is
 * a play-timing property, not a triggered-ability cost, and is obvious from the text.
 */
export enum TagTypeCostFree {
  CostFreeDamageSelf = "cost-free-damage-self",
  CostFreeDiscardSelf = "cost-free-discard-self",
  CostFreeExhaustSelf = "cost-free-exhaust-self",
  CostFreeSpendCharge = "cost-free-spend-charge",
  CostFreeSpendResource = "cost-free-spend-resource",
  CostFreeSpendSecret = "cost-free-spend-secret",
  CostFreeSpendSupply = "cost-free-spend-supply",
  CostFreeHorrorSelf = "cost-free-horror-self",
  CostFreeSpendClue = "cost-free-spend-clue",
  CostFreeSpendOffering = "cost-free-spend-offering",
  CostFreeSpendDurability = "cost-free-spend-durability",
}

interface TagCostFreeBase extends TagBase {}

export interface TagCostFreeDamageSelf extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeDamageSelf;
}

export interface TagCostFreeDiscardSelf extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeDiscardSelf;
}

export interface TagCostFreeExhaustSelf extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeExhaustSelf;
}

export interface TagCostFreeSpendCharge extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendCharge;
}

export interface TagCostFreeSpendResource extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendResource;
  /** Where the spent resources live: pool (omit, default), the card's own uses ("card"), or pool-or-card ("either" — the Physical Training family). */
  source?: "card" | "either";
}

export interface TagCostFreeSpendSecret extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendSecret;
}

/** Spend a supply use-token as the cost of a [free] triggered ability. */
export interface TagCostFreeSpendSupply extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendSupply;
}

/** Take horror on yourself as the cost of a [free] triggered ability (the horror twin of cost-free-damage-self). */
export interface TagCostFreeHorrorSelf extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeHorrorSelf;
}

/** Spend/place one of your OWN clues as the cost of a [free] triggered ability (pay with progress). */
export interface TagCostFreeSpendClue extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendClue;
}

/** Spend an offering use-token as the cost of a [free]/[fast] ability (Jacob Morrison — the offering counterpart of the other spend costs). */
export interface TagCostFreeSpendOffering extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendOffering;
}

export interface TagCostFreeSpendDurability extends TagCostFreeBase {
  type: TagTypeCostFree.CostFreeSpendDurability;
}

--- cost-free-damage-self (6 members) ---
MEMBER: Smoking Pipe (02116) "Uses (3 supplies). | [free] Spend 1 supply, exhaust Smoking Pipe, and take 1 damage: Heal 1 horror."
MEMBER: Sophie (03009) "Mark Harrigan deck only. | Sophie cannot leave play. | [free] Take 1 direct damage: You get +2 to your skill value for this skill test. | <b>Forced</b> - If Mark Harrigan…"
MEMBER: Spirit of Humanity (07229) "[fast] Exhaust Spirit of Humanity and take 1 damage and 1 horror: Add 2 [bless] tokens to the chaos bag. | [fast] Exhaust Spirit of Humanity and add 2 [curse] tokens to t…"
…and 3 more: Grand-Mère's Charm (60452), Offering Bowl (60456), Dendromorphosis (53012)

--- cost-free-discard-self (9 members) ---
MEMBER: Beat Cop (01518) "You get +1 [combat]. | [free] Discard Beat Cop: Deal 1 damage to an enemy at your location."
MEMBER: Police Badge (01527) "You get +1 [willpower]. | [free] While an investigator at your location is taking his or her turn, discard Police Badge: That investigator may take 2 additional actions t…"
MEMBER: Stray Cat (01576) "[free] Discard Stray Cat: Automatically evade a non-[[Elite]] enemy at your location."
…and 6 more: Relentless (60109), Mysterious Raven (60509), Ice Pick (08107), Ample Supplies (11089), Custom Grip (60162), Jumpsuit (12075)

--- cost-free-exhaust-self (104 members) ---
MEMBER: Beat Cop (01528) "You get +1 [combat]. | [free] Exhaust Beat Cop and deal 1 damage to it: Deal 1 damage to an enemy at your location."
MEMBER: Forbidden Knowledge (01558) "Uses (4 secrets). If Forbidden Knowledge has no secrets, discard it. | [free] Exhaust Forbidden Knowledge and take 1 horror: Move 1 secret from Forbidden Knowledge to you…"
MEMBER: Arcane Initiate (01563) "<b>Forced</b> - After Arcane Initiate enters play: Place 1 doom on it. | [free] Exhaust Arcane Initiate: Search the top 3 cards of your deck for a [[Spell]] card and draw…"
…and 101 more: Scrying (01690), Pathfinder (02108), Smoking Pipe (02116), Painkillers (02117), Alyssa Graham (02232), Spirit-Speaker (03014), Charles Ross, Esq. (03149), …

--- cost-free-spend-charge (11 members) ---
MEMBER: Scrying (01690) "Uses (3 charges). | [free] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck, or the encounter deck. Return them to the top of that d…"
MEMBER: Arcane Insight (03266) "Uses (3 charges). | [free] While an investigator is taking his or her turn, spend 1 charge: Your location gets -2 shroud until the end of this turn. (Limit once per turn.…"
MEMBER: Scrying (03236) "Uses (3 charges). | [free] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck, or the encounter deck. Return them to the top of that d…"
…and 8 more: Gate Box (06013), Pendant of the Queen (06022), Close the Circle (08062), Bangle of Jinxes (08075), Bestow Resolve (09032), Ofuda (10022), Dial of Ancients (11048), …

--- cost-free-spend-resource (66 members) ---
MEMBER: Physical Training (01517) "[free] Spend 1 resource: You get +1 [willpower] for this skill test. | [free] Spend 1 resource: You get +1 [combat] for this skill test."
MEMBER: Hyperawareness (01534) "[free] Spend 1 resource: You get +1 [intellect] for this skill test. | [free] Spend 1 resource: You get +1 [agility] for this skill test."
MEMBER: Hard Knocks (01549) "[free] Spend 1 resource: You get +1 [combat] for this skill test. | [free] Spend 1 resource: You get +1 [agility] for this skill test."
…and 63 more: Arcane Studies (01562), Dig Deep (01577), Fire Axe (02032), Keen Eye (02185), Higher Education (02187), Streetwise (02189), Scrapper (02193), …

--- cost-free-spend-secret (11 members) ---
MEMBER: Forbidden Knowledge (01558) "Uses (4 secrets). If Forbidden Knowledge has no secrets, discard it. | [free] Exhaust Forbidden Knowledge and take 1 horror: Move 1 secret from Forbidden Knowledge to you…"
MEMBER: The Necronomicon (60233) "Uses (6 secrets). Limit 1 per deck. | [free] Spend 1 secret: You get +2 skill value for this skill test. | [free] Spend 2 secrets: Draw 2 cards. | [free] Spend 3 secrets:…"
MEMBER: Mr. "Rook" (05153) "Uses (3 secrets). | [fast] Exhaust Mr. "Rook" and spend 1 secret: Search the top 3, 6, or 9 cards of your deck for any card and draw it. If at least 1 weakness is among t…"
…and 8 more: Cryptographic Cipher (07021), Guided by the Unseen (07223), Ariadne's Twine (07304), Eon Chart (08098), Eon Chart (08100), Orphic Theory (09051), Occult Records (60256), …

--- cost-free-spend-supply (9 members) ---
MEMBER: Smoking Pipe (02116) "Uses (3 supplies). | [free] Spend 1 supply, exhaust Smoking Pipe, and take 1 damage: Heal 1 horror."
MEMBER: Painkillers (02117) "Uses (3 supplies). | [free] Spend 1 supply, exhaust Painkillers, and take 1 horror: Heal 1 damage."
MEMBER: Venturer (04018) "Uses (3 supplies). | [free] Spend 1 supply and exhaust Venturer: Place 1 supply or ammo on an asset controlled by an investigator at your location."
…and 6 more: Tennessee Sour Mash (05117), Tennessee Sour Mash (05190), Tennessee Sour Mash (05191), Matchbox (10108), Extra Rations (60570), Canteen (60573)

--- cost-free-horror-self (6 members) ---
MEMBER: Forbidden Knowledge (01558) "Uses (4 secrets). If Forbidden Knowledge has no secrets, discard it. | [free] Exhaust Forbidden Knowledge and take 1 horror: Move 1 secret from Forbidden Knowledge to you…"
MEMBER: Painkillers (02117) "Uses (3 supplies). | [free] Spend 1 supply, exhaust Painkillers, and take 1 horror: Heal 1 damage."
MEMBER: Mysterious Raven (60509) "[fast] Discard Mysterious Raven and take 1 horror: Discover 1 clue at your location."
…and 3 more: Spirit of Humanity (07229), Forbidden Sutra (11103), Isabelle Barnes (12013)

--- cost-free-spend-clue (1 member) ---
MEMBER: Quick Study (04154) "[free] Place 1 of your clues on your location and exhaust Quick Study: You get +3 skill value for this skill test."

--- cost-free-spend-offering (9 members) ---
MEMBER: Shrine of the Moirai (07310) "Attach to your location. Uses (3 offerings). | Attached location gains: "[fast] Draw the top card of the encounter deck, exhaust Shrine of the Moirai, and spend 1 offerin…"
MEMBER: Soul Sanctification (09123) "Permanent. Exceptional. | For every point of damage and/or horror you heal in excess of an investigator's current damage/horror, place 1 resource on Soul Sanctification, …"
MEMBER: Wolf Mask (10023) "Limit 1 [[Mask]] per investigator. | Uses (2 offerings). Replenish 1 of these offerings after you engage an enemy. | [fast] Spend 1 offering: You get +2 [combat] or +2 [a…"
…and 6 more: Mouse Mask (10043), Fox Mask (10067), Cat Mask (10084), Sparrow Mask (10111), Blood of Thoth (11065), Offering Bowl (60456)
RULING: AUTONOMOUS TAG (2026-07-17): systematic extension of the closed spend-cost family for offering tokens (Jacob Morrison).

--- cost-free-spend-durability (1 member) ---
MEMBER: Jury-Rig (08074) "Uses (3 durability). | Attach to an [[Item]] asset controlled by an investigator at your location. | [fast] During a skill test on attached asset, spend 1 durability: You…"

==== FILE: src/tags/cost/other.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeCostOther {
  CostDamageSelf = "cost-damage-self",
  CostHorrorSelf = "cost-horror-self",
  CostDiscardCard = "cost-discard-card",
  CostAddDoomSelf = "cost-add-doom-self",
  CostAlternatePayment = "cost-alternate-payment",
  CostPlaySpendAction = "cost-play-spend-action",
}

interface TagCostOtherBase extends TagBase {}

export interface TagCostDamageSelf extends TagCostOtherBase {
  type: TagTypeCostOther.CostDamageSelf;
}

/**
 * Take horror on yourself as a flat cost of the card's effect, NOT tied to a [free]/
 * [reaction] triggered-ability icon — e.g. Ward of Protection ("Cancel … you take 1
 * horror"). The horror twin of cost-damage-self; feeds the Self-Harm (horror) archetype.
 */
export interface TagCostHorrorSelf extends TagCostOtherBase {
  type: TagTypeCostOther.CostHorrorSelf;
}

export interface TagCostDiscardCard extends TagCostOtherBase {
  type: TagTypeCostOther.CostDiscardCard;
}

/**
 * "Power at the price of doom": place doom on a card you control as an
 * activation cost. Distinct from the generic DoomAdd (to the agenda).
 */
export interface TagCostAddDoomSelf extends TagCostOtherBase {
  type: TagTypeCostOther.CostAddDoomSelf;
  value: number;
}

/**
 * Resources ON this card may be spent to pay for cards of given traits — the
 * EOTE savings-wallet family (Prophetic, Sleuth, Bruiser, Crafty, Antiquary,
 * Schoffner's Catalogue). `traits` = which cards the wallet pays for.
 * (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagCostAlternatePayment extends TagCostOtherBase {
  type: TagTypeCostOther.CostAlternatePayment;
  traits?: string[];
}

/**
 * "Double" (FHV keyword): as an ADDITIONAL COST TO PLAY this card, spend an
 * action — a play cost, not an ability cost (11 FHV members). Distinct from the
 * cost-*-spend families (which are triggered-ability costs before a colon).
 * (Created autonomously 2026-07-17, FHV ingestion — REVIEW WELCOME.)
 */
export interface TagCostPlaySpendAction extends TagCostOtherBase {
  type: TagTypeCostOther.CostPlaySpendAction;
}

--- cost-damage-self (4 members) ---
MEMBER: Blood Eclipse (04266) "As an additional cost to play Blood Eclipse, take up to 3 damage. | <b>Fight.</b> This attack uses [willpower] instead of [combat]. You get +1 [willpower] and deal +1 dam…"
MEMBER: Bonesaw (09005) "Vincent Lee deck only. | [action]: <b>Fight.</b> You get +2 [combat] for this attack. If this attack is successful, you may take 1 damage to deal +1 damage for this attac…"
MEMBER: Favor of Baalshandor (60463) "As an additional cost to play Favor of Baalshandor, take 1 damage. | Play a [[Spell]] or [[Ritual]] asset from your hand, reducing its cost by 3. Playing this card does n…"
…and 1 more: Blood Eclipse (53001)

--- cost-horror-self (14 members) ---
MEMBER: Ward of Protection (01565) "Fast. Play when you draw a non-weakness treachery card. | Cancel that card's revelation effect. Then, take 1 horror."
MEMBER: Scrying (01690) "Uses (3 charges). | [free] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck, or the encounter deck. Return them to the top of that d…"
MEMBER: Ward of Protection (02307) "Fast. Play when you draw a non-weakness encounter card. | Cancel all of that card's effects and discard it. Then, take 1 horror."
…and 11 more: Ward of Protection (03270), Scrying (03236), Feed the Mind (04267), Meat Cleaver (05114), Dreamer's Chronicle (60255), Scroll of the Pharaohs (60279), Scroll of the Pharaohs (60280), …

--- cost-discard-card (28 members) ---
MEMBER: Sacrifice (04234) "Discard a [mystic] asset you control. Then, draw 3 cards or gain 3 resources, or any combination thereof."
MEMBER: Cornered (04160) "[free] Discard 1 card from your hand: You get +2 skill value for this skill test. (Limit once per test.)"
MEMBER: Occult Invocation (60217) "As an additional cost to play Occult Invocation, discard up to 2 cards from your hand. | <b>Fight.</b> This attack uses [intellect] instead of [combat]. You get +1 [intel…"
…and 25 more: Act of Desperation (05037), Knowledge is Power (05231), Blood-Rite (05317), Patrice's Violin (06016), Spiritual Resolve (06323), Joey "The Rat" Vigil (06326), Mind's Eye (06328), …

--- cost-add-doom-self (16 members) ---
MEMBER: Blood Pact (02191) "Permanent. | [free] Add 1 doom to Blood Pact: You get +3 [willpower] for this skill test. (Limit once per test.) | [free] Add 1 doom to Blood Pact: You get +3 [combat] fo…"
MEMBER: Alyssa Graham (02232) "You get +1 [intellect]. | [free] Exhaust Alyssa Graham: Look at the top card of either the encounter deck or any player deck. You may then add 1 doom to Alyssa Graham to …"
MEMBER: David Renfield (03112) "While David Renfield has at least 1 doom on him, you get +1 [willpower]. | [fast] Exhaust David Renfield: You may place 1 doom on David Renfield. Gain 1 resource for each…"
…and 13 more: De Vermis Mysteriis (05235), Blood Pact (07158), Abyssal Tome (07159), Word of Woe (09012), Ceremonial Sickle (09082), Dowsing Rod (09083), Hallowed Chalice (09084), …

--- cost-alternate-payment (9 members) ---
MEMBER: Schoffner's Catalogue (08072) "Uses (5 secrets). If Schoffner's Catalogue has no secrets, discard it. | You may spend secrets on Schoffner's Catalogue as resources to pay for [[Item]] assets played by …"
MEMBER: Prophetic (08120) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Prophetic may be spent to pay for [[Fortune]], [[Spell]], or [[Spirit]] cards. | …"
MEMBER: Sleuth (08121) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Sleuth may be spent to pay for [[Charm]], [[Tactic]], or [[Tome]] cards. | [fast]…"
…and 6 more: Bruiser (08122), Crafty (08123), Antiquary (08124), Mortar and Pestle (11037), Archibald MacVeigh (11117), Same Old Thing (60561)
RULING: AUTONOMOUS TAG (2026-07-17, EOTE ingestion — REVIEW WELCOME): card-local resources pay for trait-X cards (the EOTE wallet family: Prophetic/Sleuth/Bruiser/Crafty/Antiquary/Schoffner's; traits arg lists what it pays for). trait-support-* enum extended with Fortune/Charm/Armor/Tool/Creature for these; Favor/Ritual/Tactic-wallet halves use existing members where available.

--- cost-play-spend-action (11 members) ---
MEMBER: Task Force (10027) "As an additional cost to play Task Force, spend an action. One at a time, in any order, choose an investigator at your location to... | - ...resolve an [action] ability o…"
MEMBER: Flurry of Blows (10037) "Play only if you control a [[Melee]] asset. As an additional cost to play Flurry of Blows, spend an action. | <b>Fight.</b> Choose a [[Melee]] asset you control and take …"
MEMBER: Testing Sprint (10047) "As an additional cost to play Testing Sprint, spend an action. | <b>Investigate.</b> One at a time, investigate your location and each connecting location once each in as…"
…and 8 more: Thorough Inquiry (10048), Bank Job (10069), Dirty Deeds (10080), Antediluvian Hymn (10093), Ethereal Weaving (10103), Elaborate Distraction (10112), Wrong Place, Right Time (10115), …
RULING: AUTONOMOUS TAG (2026-07-17, FHV ingestion — REVIEW WELCOME): the 'Double' keyword — spend an action as an additional cost to PLAY (11 FHV members). A play cost, distinct from the icon-scoped ability spend-cost families.

==== FILE: src/tags/cost/reaction.ts ====
import { TagBase } from "../../base.js";
import type { TimingQualifier } from "../../type.js";

export enum TagTypeCostReaction {
  CostReactionDamageSelf = "cost-reaction-damage-self",
  CostReactionDiscardSelf = "cost-reaction-discard-self",
  CostReactionExhaustSelf = "cost-reaction-exhaust-self",
  CostReactionHorrorSelf = "cost-reaction-horror-self",
  CostReactionSpendCharge = "cost-reaction-spend-charge",
  CostReactionSpendResource = "cost-reaction-spend-resource",
  CostReactionSpendClue = "cost-reaction-spend-clue",
  CostReactionSpendSecret = "cost-reaction-spend-secret",
  CostReactionSpendSupply = "cost-reaction-spend-supply",
  CostReactionSpendEvidence = "cost-reaction-spend-evidence",
}

interface TagCostReactionBase extends TagBase {
}

export interface TagCostReactionDamageSelf extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionDamageSelf;
}

export interface TagCostReactionDiscardSelf extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionDiscardSelf;
}

export interface TagCostReactionExhaustSelf extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionExhaustSelf;
}

/**
 * Take horror on the INVESTIGATOR (you, or freely assignable like Forbidden Knowledge) as
 * a [reaction] cost. NOT horror placed on THIS card itself — that is soak (soak-sanity),
 * e.g. Aquinnah taking the redirected horror onto its own sanity, which is a tank, not
 * self-harm. The same "self = investigator, not this card" rule applies to *-damage-self.
 */
export interface TagCostReactionHorrorSelf extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionHorrorSelf;
}

export interface TagCostReactionSpendCharge extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendCharge;
}

export interface TagCostReactionSpendResource extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendResource;
  /**
   * Where the spent resources live: your POOL (omit — the default: Zoey's Cross,
   * Lucky Dice) or resource-USES on the card itself ("card" — Gregory Gry's
   * Uses (9 resources)). "either" for pool-or-card costs.
   */
  source?: "card" | "either";
}

/** Spend/place one of your OWN clues (pay with progress) as a reaction cost. Distinct from clue-place (a beneficial placement). */
export interface TagCostReactionSpendClue extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendClue;
}

/** Spend a secret use-token as the cost of a [reaction] triggered ability. */
export interface TagCostReactionSpendSecret extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendSecret;
}

export interface TagCostReactionSpendSupply extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendSupply;
}

export interface TagCostReactionSpendEvidence extends TagCostReactionBase {
  type: TagTypeCostReaction.CostReactionSpendEvidence;
}

--- cost-reaction-damage-self (3 members) ---
MEMBER: Purifying Corruption (07273) "[reaction] When you draw a non-weakness treachery, take 1 damage and 1 horror: Cancel that card's revelation effect and place 1 resource on this card, as corruption. If t…"
MEMBER: Sacrificial Doll (60458) "While you have 3 or fewer remaining health, Sacrificial Doll does not take up a hand slot. | [reaction] After you reveal a non-[auto_fail] chaos token during a skill test…"
MEMBER: Ritual Dagger (60475) "[action]: <b>Fight</b> ([combat]). Add your [willpower] to your [combat] for this attack. | [reaction] After you play a [[Spell]] event, take 1 damage and exhaust Ritual …"

--- cost-reaction-discard-self (15 members) ---
MEMBER: Disc of Itzamna (01541) "[reaction] When a non-[[Elite]] enemy spawns at your location, discard Disc of Itzamna: Discard that enemy."
MEMBER: St. Hubert's Key (03269) "You get +1 [willpower], +1 [intellect], and -2 sanity. | [reaction] When you would be defeated by horror, discard St. Hubert's Key: Immediately heal 2 horror."
MEMBER: The Codex of Ages (04013) "Father Mateo deck only. Seal ([elder_sign]). | You get +1 [willpower] while there is a token sealed here. | [reaction] When you would reveal a chaos token from the chaos …"
…and 12 more: Disc of Itzamna (60207), Delay the Inevitable (05021), "Fool me once..." (06156), Talisman of Protection (08116), Hunter's Mark (11026), Uncanny Specimen (11039), Sacred Oath (11121), …

--- cost-reaction-exhaust-self (167 members) ---
MEMBER: Pickpocketing (01546) "[reaction] After you evade an enemy, exhaust Pickpocketing: Draw 1 card."
MEMBER: Scavenging (01573) "[reaction] After you successfully investigate by 2 or more, exhaust Scavenging: Choose an [[Item]] card in your discard pile and add it to your hand."
MEMBER: Rabbit's Foot (01575) "[reaction] After you fail a skill test, exhaust Rabbit's Foot: Draw 1 card."
…and 164 more: Aquinnah (01582), Aquinnah (01691), Zoey's Cross (02006), Jim's Trumpet (02012), Jewel of Aureolus (02269), Dr. William T. Maleson (02302), Aquinnah (02308), …
RULING: Includes a DEFERRED/CONDITIONAL self-exhaust written inside the [reaction] effect, not only exhaust-before-the-colon: Recall the Future 04158 exhausts only if its named token is revealed, and still carries this cost tag — the exhaust gates the ability either way.

--- cost-reaction-horror-self (2 members) ---
MEMBER: Purifying Corruption (07273) "[reaction] When you draw a non-weakness treachery, take 1 damage and 1 horror: Cancel that card's revelation effect and place 1 resource on this card, as corruption. If t…"
MEMBER: Meat Cleaver (12085) "[action]: <b>Fight</b> ([combat]). You get +2 [combat] for this attack (+3 [combat] instead if you have 3 or fewer remaining sanity). If this attack defeats an enemy, you…"

--- cost-reaction-spend-charge (7 members) ---
MEMBER: Grotesque Statue (01571) "Uses (4 charges). If Grotesque Statue has no charges, discard it. | [reaction] When you would reveal a chaos token, spend 1 charge: Reveal 2 chaos tokens instead of 1. Ch…"
MEMBER: Suggestion (03268) "Uses (3 charges). | [action] Exhaust Suggestion: <b>Evade.</b> Add your [willpower] value to your skill value for this evasion attempt. If you do not succeed by at least …"
MEMBER: Flesh Ward (60106) "Uses (4 charges). | [reaction] When you are dealt damage and/or horror from an enemy attack, exhaust Flesh Ward and spend 1 charge: Cancel 1 damage or horror just dealt f…"
…and 4 more: Grotesque Statue (60421), Wish Eater (06277), Obfuscation (07027), Mask of Silenus (12068)

--- cost-reaction-spend-resource (8 members) ---
MEMBER: Zoey's Cross (02006) "Zoey Samaras deck only. | [reaction] After an enemy becomes engaged with you, exhaust Zoey's Cross and spend 1 resource: Deal 1 damage to that enemy."
MEMBER: Lucky Dice (02230) "Exceptional. | [reaction] When you reveal a non-[auto_fail] chaos token, spend 2 resources: Ignore that chaos token and reveal another one to resolve. If that token has a…"
MEMBER: Intel Report (05111) "Discover 1 clue at your location. | [reaction] When you play Intel Report, increase its cost by 2: Change "Discover 1 clue" to "Discover 2 clues." | [reaction] When you p…"
…and 5 more: Decoy (05234), Small Favor (05277), Gregory Gry (06162), Counterespionage (08049), Underworld Market (09077)
RULING: Default = pool resources. When the resources are USES printed on the card (Gregory Gry's Uses (9 resources)), set source:'card'; pool-or-card costs (Physical Training family, on the cost-free twin) may use source:'either'.

--- cost-reaction-spend-clue (2 members) ---
MEMBER: Dr. William T. Maleson (02302) "[reaction] When you draw an encounter card from the encounter deck, exhaust Dr. William T. Maleson and place 1 of your clues on your location: Cancel the drawing of that …"
MEMBER: Dr. William T. Maleson (09054) "[reaction] When any investigator draws an encounter card from the encounter deck, exhaust Dr. William T. Maleson and place 1 of your clues on your location: That investig…"
RULING: Includes 'place 1 of your clues on your location' as a reaction cost (Dr. William T. Maleson 02302) — you lose the clue; where it goes doesn't change that it's a cost.

--- cost-reaction-spend-secret (12 members) ---
MEMBER: Ancient Stone (04230) "Researched. Uses (X secrets). X is the number in parentheses next to "you have identified the stone." | [reaction] When you draw any number of cards, spend that many secr…"
MEMBER: Ancient Stone (04231) "Researched. Uses (X secrets). X is the number in parentheses next to "you have identified the stone." | [reaction] When you draw any number of cards, spend that many secr…"
MEMBER: Pnakotic Manuscripts (04307) "Uses (3 secrets). | [reaction] When an investigator at your location would perform a skill test during a revelation effect, spend 1 secret: Do not reveal chaos tokens for…"
…and 9 more: Scrying Mirror (60406), Grimm's Fairy Tales (60506), Mind's Eye (06328), Cryptic Grimoire (07191), Cryptic Grimoire (07192), Professor William Webb (08104), Professor William Webb (08106), …

--- cost-reaction-spend-supply (6 members) ---
MEMBER: Bandages (08073) "Uses (3 supplies). If Bandages has no supplies, discard it. | [reaction] After an investigator or [[Ally]] asset at your location takes 1 or more damage, spend 1 supply: …"
MEMBER: Surgical Kit (09056) "Uses (4 supplies). | [reaction] When one of your card effects heals damage from an investigator, spend 1 supply: Either that effect heals 1 additional damage, or you draw…"
MEMBER: Flashlight (09122) "Uses (4 supplies). | [reaction] When you perform a skill test while investigating or attempting to evade, spend 1 supply: This test gets -2 difficulty. | <b>Card design b…"
…and 3 more: Hunter's Instinct (60574), Bandages (12073), Hunter's Instinct (12074)

--- cost-reaction-spend-evidence (2 members) ---
MEMBER: Michael Leigh (08086) "You get +1 [intellect] and +1 [combat]. | [reaction] After you successfully investigate: Place 1 resource <i>(from the token pool)</i> on Michael Leigh, as evidence (to a…"
MEMBER: Oculus Mortuum (11038) "Uses (0 evidence). | [reaction] After you seal, cancel, or ignore a chaos token, exhaust Oculus Mortuum: Place 1 evidence on it. | [reaction] When an enemy attacks an inv…"

==== FILE: src/tags/customizable/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeCustomizable {
  Customizable = "customizable",
}

/**
 * The card is CUSTOMIZABLE — it ships with an upgrade sheet whose checkboxes are
 * marked with experience to unlock added abilities (the Scarlet Keys system:
 * Runic Axe, Damning Testimony, Pocket Multi Tool, …). Only the printed BASE
 * text is tagged mechanically; this tag marks the card as belonging to the
 * upgradeable class so a deckbuilder can browse them.
 * (Created autonomously 2026-07-17 from the TSK ingestion — REVIEW WELCOME: this
 * is a meta-designation like Myriad; keep it if a browsable "upgradeable" class
 * is wanted, drop it if designations should stay untagged.)
 */
export interface TagCustomizable extends TagBase {
  type: TagTypeCustomizable.Customizable;
}

--- customizable (17 members) ---
MEMBER: Hunter's Armor (09021) "Customizable."
MEMBER: Runic Axe (09022) "Customizable. Uses (4 charges). Replenish 1 of these charges at the start of each round. | [action]: <b>Fight.</b> You get +1 [combat] for this attack. Before this attack…"
MEMBER: Custom Modifications (09023) "Customizable. | Attach to a [[Firearm]] asset you control. Limit 1 per asset. | [reaction] When you reveal a non-[auto_fail] chaos token attacking with attached asset, ex…"
…and 14 more: Alchemical Distillation (09040), Empirical Hypothesis (09041), The Raven Quill (09042), Damning Testimony (09059), Friends in Low Places (09060), Honed Instinct (09061), Living Ink (09079), …
RULING: AUTONOMOUS TAG (2026-07-17, TSK ingestion — REVIEW WELCOME): marks the 17 Scarlet Keys customizable cards (upgrade-sheet system). Only base text tagged mechanically. Meta-designation like Myriad — keep for a browsable upgradeable class, or drop. OPEN for user: doom RELOCATION (move doom from card to a live destination — agenda/other card, not removal) is a ~4-card TSK cluster (Deafening Silence 09014, Sin-Eater 09094, Amina 09011, Handcuffs 09035) with ambiguous split vs the 22 corpus-wide 'move doom' cards mostly covered by doom-remove; left untagged pending your call.

==== FILE: src/tags/damage/main.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeDamage {
  DamagePlus = "damage-plus",
  DamageInsteadRange = "damage-instead-range",
  DamageInsteadFailRange = "damage-instead-fail-range",
  DamageToInvestigator = "damage-to-investigator",
  DamageRedirectAttack = "damage-redirect-attack",
  DamageSpread = "damage-spread",
}

interface TagDamageBase extends TagBase {}

export interface TagDamagePlus extends TagDamageBase {
  type: TagTypeDamage.DamagePlus;
  value: DynamicValue;
}

export interface TagDamageInsteadRange extends TagDamageBase {
  type: TagTypeDamage.DamageInsteadRange;
  from: number;
  to: number;
}

export interface TagDamageInsteadFailRange extends TagDamageBase {
  type: TagTypeDamage.DamageInsteadFailRange;
  from: number;
  to: number;
}

export interface TagDamageToInvestigator extends TagDamageBase {
  type: TagTypeDamage.DamageToInvestigator;
  value: DynamicValue;
}

/**
 * Redirect an attacking enemy's damage onto a DIFFERENT enemy
 * ("deal this attack's damage to a different enemy"). The "turn attacks on
 * enemies" control archetype. Distinct from DamageInsteadRange (margin-based
 * redirection of your own attack).
 */
export interface TagDamageRedirectAttack extends TagDamageBase {
  type: TagTypeDamage.DamageRedirectAttack;
}

/**
 * Assign/spread damage among MULTIPLE enemies at once (Flamethrower: "assign up
 * to 4 damage among enemies engaged with you"). A group-clear archetype. `value`
 * is the total spreadable amount (-1 for X).
 */
export interface TagDamageSpread extends TagDamageBase {
  type: TagTypeDamage.DamageSpread;
  value: DynamicValue;
}

--- damage-plus (182 members) ---
MEMBER: Roland's .38 Special (01506) "Roland Banks deck only. | Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack (if there are 1 or more clues on your location, you ge…"
MEMBER: .45 Automatic (01516) "Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack. This attack deals +1 damage."
MEMBER: Machete (01520) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. If the attacked enemy is the only enemy engaged with you, this attack deals +1 damage."
…and 179 more: Vicious Blow (01525), Switchblade (01544), .41 Derringer (01547), Backstab (01551), Shrivelling (01560), Baseball Bat (01574), Knife (01586), …

--- damage-instead-range (3 members) ---
MEMBER: Shotgun (01529) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] for this attack. Instead of its standard damage, this attack deals 1 damage for each point you s…"
MEMBER: Sawed-Off Shotgun (06327) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> Instead of its standard damage, this attack deals 1 damage for each point you succeed by (to a minimum of 1, to a ma…"
MEMBER: Old Shotgun (08088) "Uses (0 ammo). While playing an event, treat Old Shotgun's uses value as 2. | [action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] for this attack. Instead of its sta…"

--- damage-instead-fail-range (4 members) ---
MEMBER: Shotgun (01529) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] for this attack. Instead of its standard damage, this attack deals 1 damage for each point you s…"
MEMBER: Sawed-Off Shotgun (06327) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> Instead of its standard damage, this attack deals 1 damage for each point you succeed by (to a minimum of 1, to a ma…"
MEMBER: Old Shotgun (08088) "Uses (0 ammo). While playing an event, treat Old Shotgun's uses value as 2. | [action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] for this attack. Instead of its sta…"
…and 1 more: Winchester Model 12 (12029)

--- damage-to-investigator (28 members) ---
MEMBER: Dynamite Blast (01524) "Choose either your location or a connecting location. Deal 3 damage to each enemy and to each investigator at the chosen location."
MEMBER: Medical Texts (01535) "[action] Choose an investigator at your location and test [intellect] (2). If you succeed, heal 1 damage from that investigator. If you fail, deal 1 damage to that invest…"
MEMBER: Storm of Spirits (03153) "<b>Fight.</b> This attack uses [willpower] instead of [combat]. If you succeed, instead of its standard damage, this attack deals 2 damage to each enemy at the attacked e…"
…and 25 more: Calvin Wright (04005), Voice of the Messenger (04016), Dark Pact (04038), The Price of Failure (04039), Self-Destructive (60104), Dynamite Blast (60129), Thrice-Damned Curiosity (60203), …

--- damage-redirect-attack (7 members) ---
MEMBER: Aquinnah (01582) "[reaction] When an enemy attacks you, exhaust Aquinnah and deal 1 horror to her: Deal that enemy's damage to another enemy at your location, instead. (You still take horr…"
MEMBER: Aquinnah (01691) "[reaction] When an enemy attacks you, exhaust Aquinnah and deal 1 horror to her: Deal that enemy's damage to any enemy at your location, instead. (You still take horror d…"
MEMBER: Oops! (02113) "Fast. Play after you fail a skill test by 2 or less while attacking an enemy engaged with you. | Deal this attack's damage to a different enemy at your location."
…and 4 more: Aquinnah (02308), Oops! (60518), .45 Thompson (05187), Oops! (51009)

--- damage-spread (3 members) ---
MEMBER: Flamethrower (04305) "Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> The enemy chosen for this attack must be the enemy engaged with you with the highest fight. You get +4 [combat] for …"
MEMBER: Gaze of Ouraxsh (07155) "Reveal 7 random chaos tokens from the chaos bag. Deal a total of 1 damage plus 1 additional damage for each [curse] or [auto_fail] token revealed, divided as you choose a…"
MEMBER: Gatling Gun (11064) "Uses (12 ammo). | [action] Spend 1-6 ammo: <b>Fight.</b> You get +X [combat] for this attack. The difficulty for this attack is equal to the combined fight values of all …"

==== FILE: src/tags/deck/discard.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeDeckDiscard {
  DeckDiscardCardChoose = "deck-discard-card-choose",
  DeckDiscardCardRandom = "deck-discard-card-random",
  DeckDiscardDeck = "deck-discard-deck",
  DeckDiscardSelf = "deck-discard-self",
  DeckDiscardTreachery = "deck-discard-treachery",
  DeckDiscardEncounter = "deck-discard-encounter",
}

interface TagDeckDiscardBase extends TagBase {}

/**
 * Discard a card of your CHOICE from your HAND (Mists of R'lyeh's symbol penalty).
 * Despite the deck- prefix (its group folder), this is a HAND discard — milling
 * the player deck is deck-discard-deck.
 */
export interface TagDeckDiscardCardChoose extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardCardChoose;
}

/**
 * Discard a RANDOM card from your HAND (Obsessive, Liquid Courage's failed test).
 * Despite the deck- prefix (its group folder), this is a HAND discard — milling
 * the player deck is deck-discard-deck.
 */
export interface TagDeckDiscardCardRandom extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardCardRandom;
}

/**
 * Discard from the top of the PLAYER deck — mill (Crisis of Identity, Daredevil,
 * Scroll of Secrets' bottom-card discard).
 */
export interface TagDeckDiscardDeck extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardDeck;
}

export interface TagDeckDiscardSelf extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardSelf;
}

export interface TagDeckDiscardTreachery extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardTreachery;
}

/**
 * Proactively discard/thin the top of the ENCOUNTER deck (Split the Angle).
 * DeckDiscardDeck/Self target the player deck; this targets the encounter deck.
 */
export interface TagDeckDiscardEncounter extends TagDeckDiscardBase {
  type: TagTypeDeckDiscard.DeckDiscardEncounter;
}

--- deck-discard-card-choose (10 members) ---
MEMBER: Mists of R'lyeh (04029) "Uses (4 charges). | [action] Spend 1 charge: <b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, after evading the chosen enemy, you…"
MEMBER: Mists of R'lyeh (04271) "Uses (5 charges). | [action] Spend 1 charge: <b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. You get +3 [willpower] for this evasion attempt. If…"
MEMBER: Scroll of Prophecies (06116) "Uses (4 secrets). | [action] Spend 1 secret: Choose an investigator at your location. That investigator draws 3 cards, then discards 1 card from their hand."
…and 7 more: Forced Learning (08031), Divination (08101), Divination (08103), Eldritch Initiation (09086), Marie Lambeau (60451), Amnesia (12097), Mists of R'lyeh (53007)
RULING: NAME TRAP: despite the deck- prefix (the group folder), deck-discard-card-choose/-random mean discarding from your HAND (choose vs random — Mists of R'lyeh / Obsessive, Liquid Courage). Milling the player deck is deck-discard-deck. (An earlier ruling here had this backwards and cost a calibration miss — corrected 2026-07-13.)

--- deck-discard-card-random (5 members) ---
MEMBER: Liquid Courage (02024) "Uses (4 supplies). | [action] Spend 1 supply: Choose an investigator at your location to heal 1 horror. Then, that investigator tests [willpower] (2). If the test succeed…"
MEMBER: Obsessive (60204) "<b>Revelation</b> - Put Obsessive into play in your threat area. | <b>Forced</b> - When your turn begins: Discard 1 non-weakness card at random from your hand. | [action]…"
MEMBER: Liquid Courage (60320) "Uses (4 supplies). | [action] Spend 1 supply: Choose an investigator at your location to heal 1 horror. Then, that investigator tests [willpower] (2). If the test succeed…"
…and 2 more: At a Crossroads (09109), Occult Records (60256)
RULING: NAME TRAP: despite the deck- prefix (the group folder), deck-discard-card-choose/-random mean discarding from your HAND (choose vs random — Mists of R'lyeh / Obsessive, Liquid Courage). Milling the player deck is deck-discard-deck. (An earlier ruling here had this backwards and cost a calibration miss — corrected 2026-07-13.)

--- deck-discard-deck (9 members) ---
MEMBER: Crisis of Identity (03019) "<b>Revelation</b> - Discard all cards you control of your current role. Then, discard the top card of your deck. Switch your role to the class of the discarded card (if t…"
MEMBER: Key of Ys (03315) "You get +1 to each of your skills for each horror on Key of Ys. | <b>Forced</b> - When any amount of horror would be placed on you: Place 1 of that horror on Key of Ys. |…"
MEMBER: Yaotl (04035) "[free] Exhaust Yaotl: During this skill test, you get a bonus to each skill equal to the number of matching skill icons on the top card of your discard pile (not counting…"
…and 6 more: Daredevil (60318), Scroll of Secrets (05116), Scroll of Secrets (05188), Scroll of Secrets (05189), Written in the Stars (08034), Short Supply (08071)

--- deck-discard-self (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- deck-discard-treachery (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- deck-discard-encounter (6 members) ---
MEMBER: Scroll of Secrets (05116) "Uses (3 secrets). | [action] Exhaust Scroll of Secrets and spend 1 secret: Look at the bottom card of any investigator's deck or the encounter deck. Then, either discard …"
MEMBER: Scroll of Secrets (05188) "Uses (3 secrets). | [action] Exhaust Scroll of Secrets and spend 1 secret: Look at the bottom 3 cards of any investigator's deck or the encounter deck. You may discard 1 …"
MEMBER: Scroll of Secrets (05189) "Uses (4 secrets). | [action] Exhaust Scroll of Secrets and spend 1 secret: Look at the top or bottom card of any investigator's deck or the encounter deck. Then, either d…"
…and 3 more: Nature of the Beast (09111), Gloria Goldberg (11014), Scroll of the Pharaohs (60279)

==== FILE: src/tags/deck/draw.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeDeckDraw {
  DeckDrawYou = "deck-draw-you",
  DeckDrawInvestigator = "deck-draw-investigator",
  DeckDrawReplaceSelf = "deck-draw-replace-self",
  DeckDrawFillHand = "deck-draw-fill-hand",
  DeckDrawEncounter = "deck-draw-encounter",
}

interface TagDeckDrawBase extends TagBase {
  value: DynamicValue;
}

export interface TagDeckDrawYou extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawYou;
}

/**
 * This means it is possible to make other investigators draw cards
 * as well as yourself.
 */
export interface TagDeckDrawInvestigator extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawInvestigator;
}

export interface TagDeckDrawReplaceSelf extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawReplaceSelf;
}

/**
 * Draw cards until you reach your maximum hand size (variable bulk draw). The
 * base "value" is dynamic here, so set it to "dynamic".
 */
export interface TagDeckDrawFillHand extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawFillHand;
}

/** Voluntarily draw/resolve a card from the ENCOUNTER deck (Drawn to the Flame, Delve Too Deep) — a self-inflicted encounter, usually for a payoff. */
export interface TagDeckDrawEncounter extends TagDeckDrawBase {
  type: TagTypeDeckDraw.DeckDrawEncounter;
}

--- deck-draw-you (170 members) ---
MEMBER: Heirloom of Hyperborea (01512) "Agnes Baker deck only. | [reaction] After you play a [[Spell]] card: Draw 1 card."
MEMBER: Pickpocketing (01546) "[reaction] After you evade an enemy, exhaust Pickpocketing: Draw 1 card."
MEMBER: Arcane Initiate (01563) "<b>Forced</b> - After Arcane Initiate enters play: Place 1 doom on it. | [free] Exhaust Arcane Initiate: Search the top 3 cards of your deck for a [[Spell]] card and draw…"
…and 167 more: Rabbit's Foot (01575), Lucky! (01584), Guts (01589), Perception (01590), Overpower (01591), Manual Dexterity (01592), Emergency Cache (01693), …
RULING: In-game card draw only. Opening-hand manipulation (Sefina's 13-card reveal) is NOT draw.
RULING: Conditional-upgrade draw ('draw 1, or 2 instead') → both values (see skill-test-condition rulings).
NOT A MEMBER: Sefina Rousseau (03003) — opening-hand setup, not in-game draw
NOT A MEMBER: Scroll of Secrets (05189) — looks at + takes specific cards — a search, not a draw → use deck-search-you

--- deck-draw-investigator (37 members) ---
MEMBER: Old Book of Lore (01531) "[action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of his or her deck for a card, draws it, and shuffl…"
MEMBER: Cryptic Research (01543) "Fast. Play only during your turn. | Choose an investigator at your location. That investigator draws 3 cards."
MEMBER: Old Book of Lore (01686) "Uses (2 secrets). | [action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of their deck for a card, draws…"
…and 34 more: Stand Together (02148), No Stone Unturned (03026), Eureka! (03231), No Stone Unturned (03307), Take Heart (04201), Harvey Walters (60201), Vault of Knowledge (60202), …
RULING: In-game card draw only. Opening-hand manipulation (Sefina's 13-card reveal) is NOT draw.
RULING: Conditional-upgrade draw ('draw 1, or 2 instead') → both values (see skill-test-condition rulings).
NOT A MEMBER: Sefina Rousseau (03003) — opening-hand setup, not in-game draw
NOT A MEMBER: Scroll of Secrets (05189) — looks at + takes specific cards — a search, not a draw → use deck-search-you

--- deck-draw-replace-self (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)
RULING: In-game card draw only. Opening-hand manipulation (Sefina's 13-card reveal) is NOT draw.
RULING: Conditional-upgrade draw ('draw 1, or 2 instead') → both values (see skill-test-condition rulings).
NOT A MEMBER: Sefina Rousseau (03003) — opening-hand setup, not in-game draw
NOT A MEMBER: Scroll of Secrets (05189) — looks at + takes specific cards — a search, not a draw → use deck-search-you

--- deck-draw-fill-hand (2 members) ---
MEMBER: Glimpse the Unthinkable (05318) "Shuffle any number of non-weakness cards from your hand into your deck. Draw cards until you reach your maximum hand-size. Remove Glimpse the Unthinkable from the game."
MEMBER: Patrice Hathaway (06005) "Your maximum hand size is reduced by 3. | During each upkeep phase, instead of drawing 1 card, discard all non-weakness cards in your hand and draw until you have 5 cards…"
RULING: In-game card draw only. Opening-hand manipulation (Sefina's 13-card reveal) is NOT draw.
RULING: Conditional-upgrade draw ('draw 1, or 2 instead') → both values (see skill-test-condition rulings).
NOT A MEMBER: Sefina Rousseau (03003) — opening-hand setup, not in-game draw
NOT A MEMBER: Scroll of Secrets (05189) — looks at + takes specific cards — a search, not a draw → use deck-search-you

--- deck-draw-encounter (13 members) ---
MEMBER: Drawn to the Flame (01564) "Draw the top card of the encounter deck. Then, discover 2 clues at your location."
MEMBER: Delve Too Deep (02111) "In player order, each investigator draws 1 card from the top of the encounter deck. Then, add Delve Too Deep to the victory display."
MEMBER: Dr. William T. Maleson (02302) "[reaction] When you draw an encounter card from the encounter deck, exhaust Dr. William T. Maleson and place 1 of your clues on your location: Cancel the drawing of that …"
…and 10 more: Purifying Corruption (07273), Shrine of the Moirai (07310), Counterespionage (08049), Dr. William T. Maleson (09054), Nature of the Beast (09111), Deliverance (11079), Unaware (60356), …
RULING: In-game card draw only. Opening-hand manipulation (Sefina's 13-card reveal) is NOT draw.
RULING: Conditional-upgrade draw ('draw 1, or 2 instead') → both values (see skill-test-condition rulings).
NOT A MEMBER: Sefina Rousseau (03003) — opening-hand setup, not in-game draw
NOT A MEMBER: Scroll of Secrets (05189) — looks at + takes specific cards — a search, not a draw → use deck-search-you

==== FILE: src/tags/deck/look.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeDeckLook {
  DeckLookYou = "deck-look-you",
  DeckLookEncounter = "deck-look-encounter",
  DeckLookInvestigator = "deck-look-investigator",
  DeckLookBottom = "deck-look-place-bottom",
}

interface TagDeckLookBase extends TagBase {
  /** Number of cards looked at ("dynamic" for a variable amount). */
  value: DynamicValue;
  /** Whether the looked-at cards may be reordered (vs. only looked at). */
  reorder: boolean;
}

/**
 * Look at the top N cards of a player deck and optionally reorder them, WITHOUT
 * pulling a specific card out. DeckSearch implies extracting a target; this is
 * the non-search "look at" effect (e.g. Gloria Goldberg cares about these).
 */
export interface TagDeckLookYou extends TagDeckLookBase {
  type: TagTypeDeckLook.DeckLookYou;
}

/** Look at / reorder the top of the encounter deck (encounter-deck "look at"). */
export interface TagDeckLookEncounter extends TagDeckLookBase {
  type: TagTypeDeckLook.DeckLookEncounter;
}

/** Look at / reorder the top N cards of ANOTHER investigator's deck (multiplayer deck smoothing). */
export interface TagDeckLookInvestigator extends TagDeckLookBase {
  type: TagTypeDeckLook.DeckLookInvestigator;
}

/** Move a looked-at card to the BOTTOM of the deck — draw-smoothing distinct from reorder-on-top. Accompanies a deck-look-* tag. */
export interface TagDeckLookBottom extends TagBase {
  type: TagTypeDeckLook.DeckLookBottom;
}

--- deck-look-you (13 members) ---
MEMBER: Scrying (01561) "Uses (3 charges). | [action] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck or the encounter deck. Return them to the top of that …"
MEMBER: Scrying (01690) "Uses (3 charges). | [free] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck, or the encounter deck. Return them to the top of that d…"
MEMBER: Alyssa Graham (02232) "You get +1 [intellect]. | [free] Exhaust Alyssa Graham: Look at the top card of either the encounter deck or any player deck. You may then add 1 doom to Alyssa Graham to …"
…and 10 more: Scrying (03236), Scroll of Secrets (05116), Scroll of Secrets (05188), Scroll of Secrets (05189), Black Market (08055), Parallel Fates (08066), Astronomical Atlas (08067), …

--- deck-look-encounter (15 members) ---
MEMBER: Scrying (01561) "Uses (3 charges). | [action] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck or the encounter deck. Return them to the top of that …"
MEMBER: Scrying (01690) "Uses (3 charges). | [free] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck, or the encounter deck. Return them to the top of that d…"
MEMBER: Alyssa Graham (02232) "You get +1 [intellect]. | [free] Exhaust Alyssa Graham: Look at the top card of either the encounter deck or any player deck. You may then add 1 doom to Alyssa Graham to …"
…and 12 more: Scrying (03236), Parallel Fates (60415), Scroll of Secrets (05116), Scroll of Secrets (05188), Scroll of Secrets (05189), First Watch (06110), Parallel Fates (08066), …

--- deck-look-investigator (10 members) ---
MEMBER: Scrying (01561) "Uses (3 charges). | [action] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck or the encounter deck. Return them to the top of that …"
MEMBER: Scrying (01690) "Uses (3 charges). | [free] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck, or the encounter deck. Return them to the top of that d…"
MEMBER: Alyssa Graham (02232) "You get +1 [intellect]. | [free] Exhaust Alyssa Graham: Look at the top card of either the encounter deck or any player deck. You may then add 1 doom to Alyssa Graham to …"
…and 7 more: Scrying (03236), Scroll of Secrets (05116), Scroll of Secrets (05188), Scroll of Secrets (05189), Black Market (08055), Parallel Fates (08066), Psychoanalysis (60264)

--- deck-look-place-bottom (6 members) ---
MEMBER: Alyssa Graham (02232) "You get +1 [intellect]. | [free] Exhaust Alyssa Graham: Look at the top card of either the encounter deck or any player deck. You may then add 1 doom to Alyssa Graham to …"
MEMBER: Scroll of Secrets (05116) "Uses (3 secrets). | [action] Exhaust Scroll of Secrets and spend 1 secret: Look at the bottom card of any investigator's deck or the encounter deck. Then, either discard …"
MEMBER: Scroll of Secrets (05188) "Uses (3 secrets). | [action] Exhaust Scroll of Secrets and spend 1 secret: Look at the bottom 3 cards of any investigator's deck or the encounter deck. You may discard 1 …"
…and 3 more: Scroll of Secrets (05189), Antediluvian Hymn (10093), Unbridled Knowledge (12043)
RULING: Means 'MOVE a looked-at card to the bottom of the deck' (Alyssa Graham, Scroll of Secrets) — it never meant 'look at the bottom'. Renamed from deck-look-bottom for exactly this trap.

==== FILE: src/tags/deck/misc.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeDeckMisc {
  DeckRestriction = "deck-restriction",
}

interface TagDeckMiscBase extends TagBase {}

export interface TagDeckRestriction extends TagDeckMiscBase {
  type: TagTypeDeckMisc.DeckRestriction;
}

--- deck-restriction (108 members) ---
MEMBER: Roland's .38 Special (01506) "Roland Banks deck only. | Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack (if there are 1 or more clues on your location, you ge…"
MEMBER: Daisy's Tote Bag (01508) "Daisy Walker deck only. | You have 2 additional hand slots, which can only be used to hold [[Tome]] assets."
MEMBER: On the Lam (01510) ""Skids" O'Toole deck only. | Fast. Play after your turn begins. | Until the end of the round, non-[[Elite]] enemies cannot attack you."
…and 105 more: Heirloom of Hyperborea (01512), Wendy's Amulet (01514), Zoey's Cross (02006), Search for the Truth (02008), Jenny's Twin .45s (02010), Jim's Trumpet (02012), Duke (02014), …
RULING: Signature '<Investigator> deck only.' cards — 23 were once missing it; the scaffold/lint should catch the 'deck only' line.

==== FILE: src/tags/deck/search.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeDeckSearch {
  DeckSearchDiscard = "deck-search-discard",
  DeckSearchEncounter = "deck-search-encounter",
  DeckSearchYou = "deck-search-you",
  DeckSearchInvestigator = "deck-search-investigator",
  DeckSearchReaction = "deck-search-reaction",
}

interface TagDeckSearchBase extends TagBase {
  range:
    | "all"
    | {
        type: "top";
        cards: DynamicValue;
      }
    | {
        type: "bottom";
        cards: DynamicValue;
      };
}

export interface TagDeckSearchDiscard extends TagDeckSearchBase {
  type: TagTypeDeckSearch.DeckSearchDiscard;
}

export interface TagDeckSearchEncounter extends TagDeckSearchBase {
  type: TagTypeDeckSearch.DeckSearchEncounter;
}

export interface TagDeckSearchYou extends TagDeckSearchBase {
  type: TagTypeDeckSearch.DeckSearchYou;
}

/**
 * This means it is possible to search other investigators' decks
 * as well as your own.
 */
export interface TagDeckSearchInvestigator extends TagDeckSearchBase {
  type: TagTypeDeckSearch.DeckSearchInvestigator;
}

/**
 * The card REACTS to being among the cards you searched — "[reaction] When you
 * search your deck and X is among the searched cards" (the Dream-Eaters Research
 * archetype: Occult Evidence, Astounding Revelation, Surprising Find). No range:
 * this is the found card's own trigger, not a search effect. (No TagDeckSearchBase —
 * its required `range` belongs to searches, not to being found.)
 */
export interface TagDeckSearchReaction extends TagBase {
  type: TagTypeDeckSearch.DeckSearchReaction;
}

--- deck-search-discard (5 members) ---
MEMBER: Smuggled Goods (04010) "Finn Edwards deck only. | Play only if there are no ready enemies at your location. | Search either your discard pile or the top 9 cards of your deck for an [[Illicit]] c…"
MEMBER: Randall Cho (60102) "Nathaniel Cho deck only. | [reaction] After Randall Cho enters play: Heal 3 damage or search your deck and discard pile for a [[Weapon]] asset, play it <i>(paying its cos…"
MEMBER: Copycat (60330) "After you commit Copycat to a skill test, search the discard pile of another investigator for a skill you can commit to this test, and commit it. After this test ends, pl…"
…and 2 more: The Council's Coffer (05196), Tetsuo Mori (06155)
RULING: Searching your DECK (or discard, via deck-search-discard). Searching the COLLECTION/outside the game is not a deck search (Dark Pact fetching its Price is collection-search — untagged).
RULING: 'Search' is a MECHANICAL term (looking through hidden cards) — apply deck-search-* ONLY when the text literally searches. Choosing a card from the OPEN discard pile ('Choose a card in your discard pile' — Scrounge for Supplies, A Chance Encounter, Resourceful) is NOT a search; discard-pile-to-* carries it (ruled 2026-07-17, full-TDE review; 4 cards stripped).

--- deck-search-encounter (7 members) ---
MEMBER: On the Hunt (03263) "Fast. Play when you would draw an encounter card during the mythos phase. | Instead, search the top 9 cards of the encounter deck for an enemy, spawn it engaged with you …"
MEMBER: Otherworld Codex (06158) "Uses (3 secrets). | [action] Exhaust Otherworld Codex and spend 1 secret: Search the top 9 cards of the encounter deck and choose a non-[[Elite]] card among them. Discard…"
MEMBER: On the Hunt (08028) "Fast. Play when you would draw an encounter card during the mythos phase. | Instead, search the encounter deck for an enemy, spawn it engaged with you <i>(instead of its …"
…and 4 more: Kicking the Hornet's Nest (09068), "Where's the party?" (11053), Stalk Prey (60567), Paint the Town Red (12051)
RULING: Searching your DECK (or discard, via deck-search-discard). Searching the COLLECTION/outside the game is not a deck search (Dark Pact fetching its Price is collection-search — untagged).
RULING: 'Search' is a MECHANICAL term (looking through hidden cards) — apply deck-search-* ONLY when the text literally searches. Choosing a card from the OPEN discard pile ('Choose a card in your discard pile' — Scrounge for Supplies, A Chance Encounter, Resourceful) is NOT a search; discard-pile-to-* carries it (ruled 2026-07-17, full-TDE review; 4 cards stripped).

--- deck-search-you (42 members) ---
MEMBER: Research Librarian (01532) "[reaction] After Research Librarian enters play: Search your deck for a [[Tome]] asset and add it to your hand. Shuffle your deck."
MEMBER: Arcane Initiate (01563) "<b>Forced</b> - After Arcane Initiate enters play: Place 1 doom on it. | [free] Exhaust Arcane Initiate: Search the top 3 cards of your deck for a [[Spell]] card and draw…"
MEMBER: Prepared for the Worst (02184) "Search the top 9 cards of your deck for a [[Weapon]] asset and add it to your hand. Shuffle your deck."
…and 39 more: Stick to the Plan (03264), Arcane Initiate (03271), Calling in Favors (03158), Leo Anderson (04001), Smuggled Goods (04010), Dr. Elli Horowitz (04021), Backpack (04037), …
RULING: Searching your DECK (or discard, via deck-search-discard). Searching the COLLECTION/outside the game is not a deck search (Dark Pact fetching its Price is collection-search — untagged).
RULING: 'Search' is a MECHANICAL term (looking through hidden cards) — apply deck-search-* ONLY when the text literally searches. Choosing a card from the OPEN discard pile ('Choose a card in your discard pile' — Scrounge for Supplies, A Chance Encounter, Resourceful) is NOT a search; discard-pile-to-* carries it (ruled 2026-07-17, full-TDE review; 4 cards stripped).

--- deck-search-investigator (16 members) ---
MEMBER: Old Book of Lore (01531) "[action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of his or her deck for a card, draws it, and shuffl…"
MEMBER: Old Book of Lore (01686) "Uses (2 secrets). | [action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of their deck for a card, draws…"
MEMBER: Flare (02115) "Either (choose one): | - <b>Fight.</b> You get +3 [combat] and deal +2 damage for this attack. Exile Flare. | - Search the top 9 cards of any investigator's deck for an […"
…and 13 more: No Stone Unturned (03026), Eureka! (03231), No Stone Unturned (03307), Scroll of Secrets (05116), Scroll of Secrets (05188), Scroll of Secrets (05189), The Council's Coffer (05196), …
RULING: Searching your DECK (or discard, via deck-search-discard). Searching the COLLECTION/outside the game is not a deck search (Dark Pact fetching its Price is collection-search — untagged).
RULING: 'Search' is a MECHANICAL term (looking through hidden cards) — apply deck-search-* ONLY when the text literally searches. Choosing a card from the OPEN discard pile ('Choose a card in your discard pile' — Scrounge for Supplies, A Chance Encounter, Resourceful) is NOT a search; discard-pile-to-* carries it (ruled 2026-07-17, full-TDE review; 4 cards stripped).

--- deck-search-reaction (3 members) ---
MEMBER: Occult Evidence (06008) "Mandy Thompson deck only. | Shuffle Occult Evidence into your deck. | [reaction] When you search your deck and Occult Evidence is among the searched cards, reveal it: Dra…"
MEMBER: Astounding Revelation (06023) "Myriad. | Astounding Revelation cannot be played. | [reaction] When you search your deck and Astounding Revelation is among the searched cards, discard it: Either gain 2 …"
MEMBER: Surprising Find (06278) "Myriad. | [reaction] When you search your deck and Surprising Find is among the searched cards: Put it into play in your play area. You must commit it to the next eligibl…"
RULING: Searching your DECK (or discard, via deck-search-discard). Searching the COLLECTION/outside the game is not a deck search (Dark Pact fetching its Price is collection-search — untagged).
RULING: 'Search' is a MECHANICAL term (looking through hidden cards) — apply deck-search-* ONLY when the text literally searches. Choosing a card from the OPEN discard pile ('Choose a card in your discard pile' — Scrounge for Supplies, A Chance Encounter, Resourceful) is NOT a search; discard-pile-to-* carries it (ruled 2026-07-17, full-TDE review; 4 cards stripped).
RULING: The FOUND card's own trigger ('when you search your deck and X is among the searched cards' — TDE Research archetype: Occult Evidence 06008, Astounding Revelation 06023, Surprising Find 06278). The searcher-side window is timing-when-search-deck (Mandy). Mandy's search-widening effect ('search 3 additional cards or resolve 1 additional target') deliberately has NO tag yet.

==== FILE: src/tags/deck/shuffle.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeDeckShuffle {
  DeckShuffleEncounter = "deck-shuffle-encounter",
  DeckShufflePlayer = "deck-shuffle-player",
}

interface TagDeckShuffleBase extends TagBase {}

export interface TagDeckShuffleEncounter extends TagDeckShuffleBase {
  type: TagTypeDeckShuffle.DeckShuffleEncounter;
}

export interface TagDeckShufflePlayer extends TagDeckShuffleBase {
  type: TagTypeDeckShuffle.DeckShufflePlayer;
}

--- deck-shuffle-encounter (17 members) ---
MEMBER: Close Call (01583) "Fast. Play after a non-weakness, non-[[Elite]] enemy at your location is evaded. | Shuffle that enemy into the encounter deck."
MEMBER: Dr. William T. Maleson (02302) "[reaction] When you draw an encounter card from the encounter deck, exhaust Dr. William T. Maleson and place 1 of your clues on your location: Cancel the drawing of that …"
MEMBER: On the Hunt (03263) "Fast. Play when you would draw an encounter card during the mythos phase. | Instead, search the top 9 cards of the encounter deck for an enemy, spawn it engaged with you …"
…and 14 more: Persuasion (04105), Parallel Fates (60415), Dark Insight (05014), Stargazing (06027), Otherworld Codex (06158), On the Hunt (08028), Parallel Fates (08066), …

--- deck-shuffle-player (113 members) ---
MEMBER: Old Book of Lore (01531) "[action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of his or her deck for a card, draws it, and shuffl…"
MEMBER: Research Librarian (01532) "[reaction] After Research Librarian enters play: Search your deck for a [[Tome]] asset and add it to your hand. Shuffle your deck."
MEMBER: Arcane Initiate (01563) "<b>Forced</b> - After Arcane Initiate enters play: Place 1 doom on it. | [free] Exhaust Arcane Initiate: Search the top 3 cards of your deck for a [[Spell]] card and draw…"
…and 110 more: Old Book of Lore (01686), Flare (02115), Prepared for the Worst (02184), Stars of Hyades (03013), Stick to the Plan (03264), No Stone Unturned (03026), Eureka! (03231), …

==== FILE: src/tags/defeat/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeDefeat {
  DefeatSelf = "defeat-self",
}

interface TagDefeatBase extends TagBase {}

/** The card DEFEATS your own investigator ("You are defeated") as a deliberate effect/sacrifice — "I'll see you in hell!", Ghastly Revelation, Ultimate Sacrifice. Not "if you would be defeated" prevention (Cheat Death). */
export interface TagDefeatSelf extends TagDefeatBase {
  type: TagTypeDefeat.DefeatSelf;
}

--- defeat-self (3 members) ---
MEMBER: "I'll see you in hell!" (03189) "Each non-[[Elite]] enemy engaged with you is defeated. You are defeated and suffer 1 physical trauma. This action does not provoke attacks of opportunity."
MEMBER: Ghastly Revelation (05275) "Discover 3 clues at your location. Give any number of your clues to another investigator, or place any number of your clues on any location. You are defeated and suffer 1…"
MEMBER: Ultimate Sacrifice (60480) "Fast. Play when the investigation phase ends. | Repeat the investigation phase. At the end of that phase, you are defeated and suffer 1 physical trauma. Max once per game…"
RULING: The card defeats YOUR OWN investigator as an effect/cost ('I'll see you in hell!', Ghastly Revelation).

==== FILE: src/tags/discard-pile/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeDiscardPile {
  DiscardPileToHand = "discard-pile-to-hand",
  DiscardPileToTopDeck = "discard-pile-to-top-deck",
  DiscardPileToBottomDeck = "discard-pile-to-bottom-deck",
  DiscardPileToDeck = "discard-pile-to-deck",
}

interface TagDiscardPileBase extends TagBase {}

export interface TagDiscardPileToHand extends TagDiscardPileBase {
  type: TagTypeDiscardPile.DiscardPileToHand;
}

export interface TagDiscardPileToTopDeck extends TagDiscardPileBase {
  type: TagTypeDiscardPile.DiscardPileToTopDeck;
}

export interface TagDiscardPileToBottomDeck extends TagDiscardPileBase {
  type: TagTypeDiscardPile.DiscardPileToBottomDeck;
}

export interface TagDiscardPileToDeck extends TagDiscardPileBase {
  type: TagTypeDiscardPile.DiscardPileToDeck;
}

--- discard-pile-to-hand (22 members) ---
MEMBER: Scavenging (01573) "[reaction] After you successfully investigate by 2 or more, exhaust Scavenging: Choose an [[Item]] card in your discard pile and add it to your hand."
MEMBER: William Yorick (03005) "[reaction] After you defeat an enemy: Play an asset from your discard pile <i>(paying its cost)</i>. (Limit once per round.) | [elder_sign] effect: +2. If this test is su…"
MEMBER: Resourceful (03039) "If this skill test is successful, choose a [survivor] card not named Resourceful in your discard pile. Add the chosen card to your hand."
…and 19 more: True Survivor (03273), Nathaniel Cho (60101), Prescient (60419), Well-Maintained (05152), Tetsuo Mori (06155), Scrounge for Supplies (06165), A Glimmer of Hope (06245), …

--- discard-pile-to-top-deck (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- discard-pile-to-bottom-deck (4 members) ---
MEMBER: Copycat (60330) "After you commit Copycat to a skill test, search the discard pile of another investigator for a skill you can commit to this test, and commit it. After this test ends, pl…"
MEMBER: Joe Diamond (05002) "<b>Forced</b> - When the investigation phase begins: Reveal the top card of your hunch deck. Until the end of the phase, you may play that card as if it were in your hand…"
MEMBER: Detective's Colt 1911s (05009) "Joe Diamond deck only. Uses (4 ammo). | Up to 2 [[Tool]] assets you control do not take up hand slots. | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] and deal…"
…and 1 more: Gift of Nodens (11094)

--- discard-pile-to-deck (8 members) ---
MEMBER: Quantum Flux (03196) "Shuffle your discard pile into your deck and draw 1 card. Remove Quantum Flux from the game."
MEMBER: Patrice Hathaway (06005) "Your maximum hand size is reduced by 3. | During each upkeep phase, instead of drawing 1 card, discard all non-weakness cards in your hand and draw until you have 5 cards…"
MEMBER: Word of Woe (09012) "Amina Zidane deck only. | Fast. Play only during your turn. | Place 1 doom on an asset you control to resolve an [action] ability on it, ignoring all costs <i>(including …"
…and 5 more: Word of Weal (09013), Pushed to the Limit (10113), Quick-Witted (11042), Respite (60577), Isabelle Barnes (12013)

==== FILE: src/tags/discard/from-play.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeDiscardFromPlay {
  DiscardFromPlaySelf = "discard-from-play-self",
  DiscardFromPlaySelfNoUses = "discard-from-play-self-no-uses",
  DiscardTreacheryInPlay = "discard-treachery-in-play",
}

interface TagDiscardFromPlayBase extends TagBase {}

export interface TagDiscardFromPlaySelf extends TagDiscardFromPlayBase {
  type: TagTypeDiscardFromPlay.DiscardFromPlaySelf;
}

export interface TagDiscardFromPlaySelfNoUses extends TagDiscardFromPlayBase {
  type: TagTypeDiscardFromPlay.DiscardFromPlaySelfNoUses;
}

/** Discard/remove a treachery that is ALREADY in play (ongoing/attached) — e.g. discarding your threat-area cards (Cheat Death) or a treachery from play (Alter Fate). Removal, NOT a cancel. */
export interface TagDiscardTreacheryInPlay extends TagDiscardFromPlayBase {
  type: TagTypeDiscardFromPlay.DiscardTreacheryInPlay;
}

--- discard-from-play-self (86 members) ---
MEMBER: Police Badge (01527) "You get +1 [willpower]. | [free] While an investigator at your location is taking his or her turn, discard Police Badge: That investigator may take 2 additional actions t…"
MEMBER: Barricade (01538) "Attach to your location. | Non-[[Elite]] enemies cannot move into attached location. | <b>Forced</b> - When an investigator leaves attached location: Discard Barricade."
MEMBER: Baseball Bat (01574) "[action]: <b>Fight.</b> You get +2 [combat] for this attack. This attack deals +1 damage. If a [skull] or [auto_fail] symbol is revealed during this attack, discard Baseb…"
…and 83 more: Strange Solution (02021), Hired Muscle (02027), Bind Monster (02031), Lure (02156), The Red-Gloved Man (02310), The King in Yellow (03011), Ambush (03148), …

--- discard-from-play-self-no-uses (33 members) ---
MEMBER: First Aid (01519) "Uses (3 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage or horror from an investigator at your location."
MEMBER: Forbidden Knowledge (01558) "Uses (4 secrets). If Forbidden Knowledge has no secrets, discard it. | [free] Exhaust Forbidden Knowledge and take 1 horror: Move 1 secret from Forbidden Knowledge to you…"
MEMBER: Grotesque Statue (01571) "Uses (4 charges). If Grotesque Statue has no charges, discard it. | [reaction] When you would reveal a chaos token, spend 1 charge: Reveal 2 chaos tokens instead of 1. Ch…"
…and 30 more: First Aid (01683), Lockpicks (01687), First Aid (03230), Lockpicks (03031), Kerosene (04304), Try and Try Again (04159), Grotesque Statue (60421), …

--- discard-treachery-in-play (6 members) ---
MEMBER: Logical Reasoning (03191) "Play only if you have at least 1 clue. | Choose an investigator at your location. That investigator either heals 2 horror or discards a [[Terror]] card from his or her th…"
MEMBER: Cheat Death (03310) "Fast. Play when you would be defeated. | Disengage from each enemy engaged with you, discard all cards in your threat area, heal 2 horror and 2 damage, and move to any re…"
MEMBER: Alter Fate (04313) "Fast. Play during any [free] player window. | Choose and discard from play a non-weakness treachery that is not attached to an [[Elite]] enemy."
…and 3 more: Augur of Elokoss (12070), Logical Reasoning (52003), Alter Fate (53009)

==== FILE: src/tags/doom/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeDoom {
  DoomAdd = "doom-add",
  DoomCheck = "doom-check",
  DoomRemove = "doom-remove",
  DoomPreventAdvance = "doom-prevent-advance",
}

interface TagDoomBase extends TagBase {}

export interface TagDoomAdd extends TagDoomBase {
  type: TagTypeDoom.DoomAdd;
}

export interface TagDoomCheck extends TagDoomBase {
  type: TagTypeDoom.DoomCheck;
}

export interface TagDoomRemove extends TagDoomBase {
  type: TagTypeDoom.DoomRemove;
}

/**
 * Prevent the agenda from advancing when it reaches its doom threshold
 * ("the agenda cannot advance by reaching its doom threshold") — a stall effect.
 */
export interface TagDoomPreventAdvance extends TagDoomBase {
  type: TagTypeDoom.DoomPreventAdvance;
}

--- doom-add (11 members) ---
MEMBER: Arcane Initiate (01563) "<b>Forced</b> - After Arcane Initiate enters play: Place 1 doom on it. | [free] Exhaust Arcane Initiate: Search the top 3 cards of your deck for a [[Spell]] card and draw…"
MEMBER: Arcane Initiate (03271) "<b>Forced</b> - After Arcane Initiate enters play: Place 1 doom or 2 horror on it. | [free] Exhaust Arcane Initiate: Search the top 3 cards of your deck for a [[Spell]] c…"
MEMBER: The Price of Failure (04039) "<b>Revelation</b> - Take 2 damage and 2 horror. Place 1 doom on the current agenda (this effect can cause the current agenda to advance). Remove The Price of Failure from…"
…and 8 more: Marie Lambeau (05006), Baron Samedi (05019), Tony's Quarry (06012), Amina Zidane (09011), Ghastly Possession (09090), Fickle Fortune (09118), Arcane Initiate (60455), …

--- doom-check (5 members) ---
MEMBER: David Renfield (03112) "While David Renfield has at least 1 doom on him, you get +1 [willpower]. | [fast] Exhaust David Renfield: You may place 1 doom on David Renfield. Gain 1 resource for each…"
MEMBER: Marie Lambeau (05006) "While you have 1 or more doom among cards you control, you may take an additional action during your turn, which can only be used to play [[Spell]] cards or activate [[Sp…"
MEMBER: Baron Samedi (05019) "<b>Revelation</b> - Put Baron Samedi into play. He cannot leave play while he has less than 3 doom on him. | <b>Forced</b> - When any amount of damage is placed on an inv…"
…and 2 more: Prophesy (05034), Abyssal Tome (07159)

--- doom-remove (20 members) ---
MEMBER: Moonlight Ritual (02267) "Remove all doom from 1 card you control."
MEMBER: Marie Lambeau (05006) "While you have 1 or more doom among cards you control, you may take an additional action during your turn, which can only be used to play [[Spell]] cards or activate [[Sp…"
MEMBER: Fortune or Fate (05237) "Fast. Play when doom would be placed on any scenario card. | Max 1 per game. | Cancel 1 doom just placed on that card. Exile Fortune or Fate."
…and 17 more: Hallow (07301), Burn After Reading (08076), Handcuffs (09035), Ceremonial Sickle (09082), Dowsing Rod (09083), Hallowed Chalice (09084), Onyx Pentacle (09085), …

--- doom-prevent-advance (1 member) ---
MEMBER: Mystifying Song (05018) "Marie Lambeau deck only. | Fast. Play when the agenda would advance by reaching its doom threshold. | Until the end of the phase, the agenda cannot advance by reaching it…"

==== FILE: src/tags/duration/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeDuration {
  DurationEnemyPhase = "duration-enemy-phase",
  DurationNext = "duration-next",
  DurationNextSkillTestThisPhase = "duration-next-skill-test-this-phase",
  DurationNextSkillTestThisTurn = "duration-next-skill-test-this-turn",
  DurationUntilEndPhase = "duration-until-end-phase",
  DurationUntilEndRound = "duration-until-end-round",
  DurationUntilEndTurn = "duration-until-end-turn",
}

interface TagDurationBase extends TagBase {}

export interface TagDurationEnemyPhase extends TagDurationBase {
  type: TagTypeDuration.DurationEnemyPhase;
}

export interface TagDurationNext extends TagDurationBase {
  type: TagTypeDuration.DurationNext;
}

export interface TagDurationNextSkillTestThisPhase extends TagDurationBase {
  type: TagTypeDuration.DurationNextSkillTestThisPhase;
}

export interface TagDurationNextSkillTestThisTurn extends TagDurationBase {
  type: TagTypeDuration.DurationNextSkillTestThisTurn;
}

export interface TagDurationUntilEndPhase extends TagDurationBase {
  type: TagTypeDuration.DurationUntilEndPhase;
}

export interface TagDurationUntilEndRound extends TagDurationBase {
  type: TagTypeDuration.DurationUntilEndRound;
}

export interface TagDurationUntilEndTurn extends TagDurationBase {
  type: TagTypeDuration.DurationUntilEndTurn;
}

--- duration-enemy-phase (2 members) ---
MEMBER: Lure (02156) "Attach to your location. | During the enemy phase, each enemy that moves does so along the shortest path toward the attached location, instead of to where it would normal…"
MEMBER: Lure (05323) "Attach to your location or to a connecting location. | During the enemy phase, each enemy that moves does so along the shortest path toward the attached location, instead…"

--- duration-next (3 members) ---
MEMBER: The Red Clock (08053) "Exceptional. Uses (0 charges). | <b>Forced</b> - After your turn begins: Either place 1 charge here, or take all charges here, as resources. Then, if it has exactly... | …"
MEMBER: The Red Clock (08058) "Exceptional. Uses (0 charges). | <b>Forced</b> - After your turn begins: You may take all charges here, as resources. Place 1 charge here. If it has exactly... | - 1 char…"
MEMBER: The Red Clock (60384) "Exceptional. Uses (0 charges). | <b>Forced</b> - After your turn begins: You may take all charges here, as resources. Place 1 charge here. If it has exactly... | - 1 char…"

--- duration-next-skill-test-this-phase (2 members) ---
MEMBER: Fieldwork (03024) "[reaction] After you move to a location, if that location has at least 1 clue on it, exhaust Fieldwork: You get +2 skill value for the next skill test you perform this ph…"
MEMBER: Momentum (06115) "If this skill test is successful, reduce the difficulty of the next skill test you perform this phase by X, where X is the amount this skill test succeeded by (to a maxim…"

--- duration-next-skill-test-this-turn (4 members) ---
MEMBER: Narrow Escape (03267) "Fast. Play when an enemy makes an attack of opportunity against you. | Cancel that attack. You get +2 skill value for the next skill test you perform this turn."
MEMBER: Will to Survive (60512) "Fast. Play only during your turn. | Do not reveal chaos tokens for the next skill test you perform this turn."
MEMBER: Snipe (08087) "During the next fight action you perform this turn using a [[Ranged]] or [[Firearm]] asset, treat each [skull], [cultist], [tablet], [elder_thing], or [auto_fail] token y…"
…and 1 more: Iron Sights (60163)

--- duration-until-end-phase (13 members) ---
MEMBER: Encyclopedia (01542) "[action] Exhaust Encyclopedia: Choose an investigator at your location. That investigator gets +2 to a skill of your choice until the end of the phase."
MEMBER: Mind Wipe (01568) "Fast. Play after a phase begins. | Choose a non-[[Elite]] enemy at your location. Treat the chosen enemy's printed text box as if it were blank (except for [[Traits]]) un…"
MEMBER: Keen Eye (02185) "Permanent. | [free] Spend 2 resources: You get +1 [intellect] until the end of the phase. | [free] Spend 2 resources: You get +1 [combat] until the end of the phase."
…and 10 more: Expose Weakness (02228), Infighting (03314), Expose Weakness (04195), Encyclopedia (60208), Joe Diamond (05002), Mystifying Song (05018), Keen Eye (07152), …

--- duration-until-end-round (19 members) ---
MEMBER: On the Lam (01510) ""Skids" O'Toole deck only. | Fast. Play after your turn begins. | Until the end of the round, non-[[Elite]] enemies cannot attack you."
MEMBER: Mind over Matter (01536) "Fast. Play only during your turn. | Until the end of the round, you may use your [intellect] in place of your [combat] and [agility]."
MEMBER: Fight or Flight (03155) "Fast. Play only during your turn. | Until the end of the round, you get +X [combat] and +X [agility], where X is the amount of horror on you."
…and 16 more: Mind over Matter (60226), Grit Your Teeth (60515), Lure (05323), Ethereal Form (06164), In the Shadows (07010), Showmanship (07012), The Stygian Eye (07263), …

--- duration-until-end-turn (16 members) ---
MEMBER: Will to Survive (01585) "Fast. Play only during your turn. | Until the end of your turn, do not reveal chaos tokens for any skill tests you perform."
MEMBER: Improvisation (03018) "Lola Hayes deck only. | Fast. Play only during your turn. | Switch your role. Until the end of your turn, reduce the resource cost of the next card you play of your role …"
MEMBER: Anatomical Diagrams (03108) "Fast. Play during any investigator's turn. Play only if you have 5 or more remaining sanity. | Choose a non-[[Elite]] enemy at your location. Until the end of the active …"
…and 13 more: Arcane Insight (03266), Stealth (03028), Vantage Point (04306), "I'm done runnin'!" (05016), Wither (05157), Trial by Fire (05281), Wither (05321), …

==== FILE: src/tags/encounter/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeEncounter {
  EncounterRevealChoose = "encounter-reveal-choose",
  EncounterOffload = "encounter-offload",
}

interface TagEncounterBase extends TagBase {}

/**
 * Draw/reveal more encounter cards and choose which to resolve, discarding the
 * rest — a soft-cancel / encounter-filter distinct from cancelling the draw.
 */
export interface TagEncounterRevealChoose extends TagEncounterBase {
  type: TagTypeEncounter.EncounterRevealChoose;
}

/**
 * A DIFFERENT investigator resolves an encounter card you would have — pushing
 * yours away ("You handle this one!") or choosing recipients for a batch (First
 * Watch's distribution). The opposite direction, taking another's card onto
 * yourself, is tank-redirect-encounter (a card can carry both — First Watch).
 */
export interface TagEncounterOffload extends TagEncounterBase {
  type: TagTypeEncounter.EncounterOffload;
}

--- encounter-reveal-choose (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- encounter-offload (2 members) ---
MEMBER: "You handle this one!" (04028) "Fast. Play after you draw a non-peril encounter card, but before resolving that card's effects. | Choose another investigator. That investigator is considered to have dra…"
MEMBER: First Watch (06110) "Fast. Play when the "draw encounter cards" step of the mythos phase would begin. | Instead of resolving that step, look at the top X cards of the encounter deck, where X …"
RULING: Another investigator resolves an encounter card you would have ('You handle this one!' 04028 — whose main feature was untagged until this review; First Watch's distribution). Taking another's card onto YOURSELF is tank-redirect-encounter ('Let me handle this!'; First Watch carries both directions).

==== FILE: src/tags/enemy/debuff.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeEnemyDebuff {
  EnemyDoesNotReady = "enemy-does-not-ready",
  EnemyCannotMoveIntoLocation = "enemy-cannot-move-into-location",
  EnemyCannotAttack = "enemy-cannot-attack",
  EnemyCannotMove = "enemy-cannot-move",
  EnemyExhaust = "enemy-exhaust",
}

interface TagEnemyDebuffBase extends TagBase {}

export interface TagEnemyDoesNotReady extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyDoesNotReady;
}

export interface TagEnemyCannotMoveIntoLocation extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyCannotMoveIntoLocation;
}

/** "Attached enemy cannot attack" — a recurring lock-down. */
export interface TagEnemyCannotAttack extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyCannotAttack;
}

/**
 * "Attached enemy cannot move" — distinct from EnemyCannotMoveIntoLocation
 * (about a location).
 */
export interface TagEnemyCannotMove extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyCannotMove;
}

/** Force an enemy to exhaust (tempo/lockdown). */
export interface TagEnemyExhaust extends TagEnemyDebuffBase {
  type: TagTypeEnemyDebuff.EnemyExhaust;
}

--- enemy-does-not-ready (19 members) ---
MEMBER: Bind Monster (02031) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed and the enemy is non‑[[Elite]], evade it and attach Bind Monster to it. | [reacti…"
MEMBER: Snare Trap (03199) "Attach to your location. Limit 1 per location. | <b>Forced</b> - After a non-[[Elite]] enemy enters attached location: Exhaust that enemy, disengage it from all investiga…"
MEMBER: Handcuffs (04265) "[action] If Handcuffs is not attached to an enemy: <b>Evade.</b> Use only on a [[Humanoid]] enemy. This evasion attempt uses [combat] instead of [agility]. If you succeed…"
…and 16 more: Slip Away (04232), Slip Away (60314), Slip Away (60324), Banish (05113), Under Surveillance (07157), Fend Off (08082), Handcuffs (09035), …

--- enemy-cannot-move-into-location (2 members) ---
MEMBER: Barricade (01538) "Attach to your location. | Non-[[Elite]] enemies cannot move into attached location. | <b>Forced</b> - When an investigator leaves attached location: Discard Barricade."
MEMBER: Barricade (50004) "Attach to your location. | Non-[[Elite]] enemies cannot move into or spawn at attached location. Each time a non-[[Elite]] enemy would spawn at attached location, spawn i…"

--- enemy-cannot-attack (1 member) ---
MEMBER: Abyssal Rot (10086) "Bonded (Rod of Carnamagos). | Attached enemy cannot attack. | <b>Forced</b> - When attached enemy leaves play: Set Abyssal Rot aside, out of play."

--- enemy-cannot-move (2 members) ---
MEMBER: Transmogrify (10050) "<b>Evade.</b> You may use [intellect] instead of [agility] for this evasion attempt. If you succeed and the enemy is non-[[Elite]], attach Transmogrify to it. | Attached …"
MEMBER: Virescent Rot (10090) "Bonded (Rod of Carnamagos). | Attached enemy cannot move. | <b>Forced</b> - When attached enemy leaves play: Set Virescent Rot aside, out of play."

--- enemy-exhaust (7 members) ---
MEMBER: Snare Trap (03199) "Attach to your location. Limit 1 per location. | <b>Forced</b> - After a non-[[Elite]] enemy enters attached location: Exhaust that enemy, disengage it from all investiga…"
MEMBER: Bolas (09025) "<b>Evade.</b> Attempt to evade using [combat] instead of [agility]. If you succeed and the enemy is non-[[Elite]], attach Bolas to it. | Attached enemy gets -1 evade valu…"
MEMBER: Power Word (09081) "Customizable. Fast. Play only during your turn. | Attach to a non-[[Elite]] enemy at your location. | [action] If attached enemy is at your location: <b>Parley.</b> Give …"
…and 4 more: Aetheric Current (10006), Stall for Time (10114), "Where's the party?" (11053), Dimensional Vortex (11124)

==== FILE: src/tags/enemy/elite.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeEnemyElite {
  EnemyEliteNonEliteOnly = "enemy-elite-noneliteonly",
  EnemyEliteReducedEffect = "enemy-elite-reducedeffect",
}

interface TagEnemyEliteBase extends TagBase {}

export interface TagEnemyEliteNonEliteOnly extends TagEnemyEliteBase {
  type: TagTypeEnemyElite.EnemyEliteNonEliteOnly;
}

export interface TagEnemyEliteReducedEffect extends TagEnemyEliteBase {
  type: TagTypeEnemyElite.EnemyEliteReducedEffect;
}

--- enemy-elite-noneliteonly (104 members) ---
MEMBER: On the Lam (01510) ""Skids" O'Toole deck only. | Fast. Play after your turn begins. | Until the end of the round, non-[[Elite]] enemies cannot attack you."
MEMBER: Barricade (01538) "Attach to your location. | Non-[[Elite]] enemies cannot move into attached location. | <b>Forced</b> - When an investigator leaves attached location: Discard Barricade."
MEMBER: Disc of Itzamna (01541) "[reaction] When a non-[[Elite]] enemy spawns at your location, discard Disc of Itzamna: Discard that enemy."
…and 101 more: Mind Wipe (01568), Stray Cat (01576), Close Call (01583), Bind Monster (02031), Bait and Switch (02034), Monster Slayer (02300), Bury Them Deep (03016), …
RULING: The Monster Slayer shape: effect only works 'against a NON-Elite enemy'. Do not confuse with enemy-elite-reducedeffect (the Persuasion 'if Elite, <lesser effect> instead' shape) — Tennessee Sour Mash 05191 had wrongly copied Persuasion's pair.

--- enemy-elite-reducedeffect (5 members) ---
MEMBER: Persuasion (04105) "<b>Parley.</b> Choose a non-weakness [[Humanoid]] enemy at your location and test [intellect] (3). This test gets +X difficulty, where X is that enemy's horror value. If …"
MEMBER: Exploit Weakness (09105) "Fast. Play before revealing a chaos token during an attack or evasion attempt you are performing, and only if the difficulty of this test is currently 0. | This test auto…"
MEMBER: Intimidation (11056) "<b>Parley.</b> Choose an enemy at your location and test [combat] (X), where X is the chosen enemy's remaining health. If you succeed, shuffle that enemy into the encount…"
…and 2 more: Whispers of Doom (11072), Name Your Price (11105)

==== FILE: src/tags/enemy/engage.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeEnemyEngage {
  EnemyEngageEffect = "enemy-engage-effect",
  EnemyEngageEnemy = "enemy-engage",
  EnemyEngageNone = "enemy-engage-none",
  EnemyEngageNotWithYou = "enemy-engage-not-with-you",
  EnemyEngageRelated = "enemy-engage-related",
  EnemyEngageWithAnother = "enemy-engage-with-another",
  EnemyEngageWithYou = "enemy-engage-with-you",
  EnemyEngageTargetEngaged = "enemy-engage-target-engaged",
  EnemyEngageDisengage = "enemy-engage-disengage",
  EnemyEngageEvadeMultiple = "enemy-evade-multiple",
  EnemyEngageWithYouMultiple = "enemy-engage-with-you-multiple",
}

interface TagEnemyEngageBase extends TagBase {}

/**
 * The card ENGAGES enemies as an effect — it causes one or more enemies to become engaged
 * (with you or another investigator) through an ability, not the [Engage] basic action.
 * The base "you engage them" effect; the with-you / with-you-multiple / with-another tags
 * qualify WHO and HOW MANY. (Taunt, Get over here!, Heroic Rescue, On the Hunt, …)
 */
export interface TagEnemyEngageEffect extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageEffect;
}

export interface TagEnemyEngageEnemy extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageEnemy;
}

export interface TagEnemyEngageNone extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageNone;
}

export interface TagEnemyEngageNotWithYou extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageNotWithYou;
}

export interface TagEnemyEngageRelated extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageRelated;
}

export interface TagEnemyEngageWithAnother extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageWithAnother;
}

/**
 * FORCE an enemy to become engaged with you (Taunt, Heroic Rescue, On the Hunt,
 * "Get over here!") — the tank pull. Feeds Engagement. For effects that merely
 * TARGET an enemy already engaged with you, use engage-target-engaged instead.
 */
export interface TagEnemyEngageWithYou extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageWithYou;
}

/**
 * Targets or conditions on "an enemy engaged with you" (Flamethrower, Mano a Mano,
 * Oops!) — a targeting scope, not an engage effect. Split from engage-with-you so
 * the Engagement compound only collects genuine force-engages.
 */
export interface TagEnemyEngageTargetEngaged extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageTargetEngaged;
}

/**
 * Forcibly disengage an enemy from investigators, or you disengage from each
 * engaged enemy — the core of the evasion/escape package. "withoutExhaust"
 * flags the Stealth variant (disengaged but kept ready).
 */
export interface TagEnemyEngageDisengage extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageDisengage;
  withoutExhaust?: boolean;
  /** True when you disengage from EVERY enemy engaged with you at once (Elusive, Cat Burglar) — a mass getaway. */
  fromAll?: boolean;
}

/** Evade ALL/each enemy engaged with you (or at your location) at once — mass evade, the evade analog of testless-damage-your-location-multiple. */
export interface TagEnemyEngageEvadeMultiple extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageEvadeMultiple;
}

/** Engage MULTIPLE / any number of enemies at your location at once (mass-engage / tank pull). */
export interface TagEnemyEngageWithYouMultiple extends TagEnemyEngageBase {
  type: TagTypeEnemyEngage.EnemyEngageWithYouMultiple;
}

--- enemy-engage-effect (23 members) ---
MEMBER: Taunt (02017) "Fast. Play only during your turn. | Engage any number of enemies at your location."
MEMBER: Taunt (02019) "Fast. Play only during your turn. | Engage any number of enemies at your location. Draw 1 card for each enemy engaged in this way."
MEMBER: Heroic Rescue (03106) "Fast. Play when a non-[[Elite]] enemy would attack another investigator at your location. | Engage that enemy and resolve its attack against you instead. Then, deal it 1 …"
…and 20 more: On the Hunt (03263), "Get over here!" (60114), "Get over here!" (60123), Taunt (60130), "I'm done runnin'!" (05016), Spectral Razor (06201), Heroic Rescue (06234), …
RULING: The card CAUSES engagement as an effect (Taunt, 'Get over here!', Heroic Rescue, On the Hunt — the 9 force-engagers). NOT for conditions on an already-engaged enemy, and NOT the basic [Engage] action.
NOT A MEMBER: Blackjack (02016) — conditions on an enemy engaged with ANOTHER investigator; causes no engagement → use enemy-engage-with-another

--- enemy-engage (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- enemy-engage-none (2 members) ---
MEMBER: Pathfinder (02108) "[free]During your turn, if you are not engaged with any enemies, exhaust Pathfinder: Move to a connecting location."
MEMBER: Telescopic Sight (05230) "Fast. Attach to a [[Firearm]] asset you control that takes up two hand slots. Attached asset cannot be used to attack enemies engaged with you. | [reaction] When you perf…"

--- enemy-engage-not-with-you (5 members) ---
MEMBER: Springfield M1903 (02226) "Uses (3 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] and deal +2 damage for this attack. Cannot be used to attack enemies engaged with you."
MEMBER: Sneak Attack (03152) "Deal 2 damage to an enemy not engaged with you at your location."
MEMBER: Finn's Trusty .38 (04011) "Finn Edwards deck only. Fast. Uses (3 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +2 [combat] for this attack. If the attacked enemy is not engaged with you, yo…"
…and 2 more: Marksmanship (04104), Eavesdrop (04027)

--- enemy-engage-related (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- enemy-engage-with-another (3 members) ---
MEMBER: Blackjack (02016) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. If you perform this attack against an enemy engaged with another investigator and you fail, you deal no damag…"
MEMBER: Blackjack (51002) "[action]: <b>Fight.</b> You get +2 [combat] for this attack. If you perform this attack against an enemy engaged with another investigator, you deal +1 damage for this at…"
MEMBER: Oops! (51009) "Fast. Play after you fail a skill test by 3 or less while attacking an enemy. | Deal this attack's damage to any enemy at your location. If the attacked enemy is engaged …"

--- enemy-engage-with-you (22 members) ---
MEMBER: Taunt (02017) "Fast. Play only during your turn. | Engage any number of enemies at your location."
MEMBER: Taunt (02019) "Fast. Play only during your turn. | Engage any number of enemies at your location. Draw 1 card for each enemy engaged in this way."
MEMBER: Heroic Rescue (03106) "Fast. Play when a non-[[Elite]] enemy would attack another investigator at your location. | Engage that enemy and resolve its attack against you instead. Then, deal it 1 …"
…and 19 more: On the Hunt (03263), "Get over here!" (60114), "Get over here!" (60123), Taunt (60130), Spectral Razor (06201), Heroic Rescue (06234), Righteous Hunt (07109), …
RULING: FORCE an enemy to engage you, only (Taunt, Heroic Rescue, On the Hunt). Targeting/conditions on an enemy ALREADY engaged with you → enemy-engage-target-engaged (the 2026-07-03 split).

--- enemy-engage-target-engaged (14 members) ---
MEMBER: Oops! (02113) "Fast. Play after you fail a skill test by 2 or less while attacking an enemy engaged with you. | Deal this attack's damage to a different enemy at your location."
MEMBER: Fire Extinguisher (02114) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. | [action] Exile Fire Extinguisher: <b>Evade.</b> You get +3 [agility] for this test. If you are successful, …"
MEMBER: Trench Knife (03147) "Engage actions you perform do not provoke attacks of opportunity. | [action]: <b>Fight.</b> You get +X [combat] for this attack. X is the number of enemies engaged with y…"
…and 11 more: "I'll see you in hell!" (03189), Mano a Mano (03229), "Not without a fight!" (03272), Flamethrower (04305), Mano a Mano (60125), The Necronomicon (60233), Oops! (60518), …
RULING: Targets or conditions on an enemy engaged with you (Oops! 02113/60518, Fire Extinguisher 02114, Flamethrower 04305, Mano a Mano, Necronomicon 60233, Trench Knife).

--- enemy-engage-disengage (23 members) ---
MEMBER: Elusive (01550) "Fast. Play only during your turn. | Disengage from each enemy engaged with you and move to a revealed location with no enemies."
MEMBER: Cat Burglar (01555) "You get +1 [agility]. | [action] Exhaust Cat Burglar: Disengage from each enemy engaged with you and move to a connecting location. This action does not provoke attacks o…"
MEMBER: Survival Instinct (01581) "If this skill test is successful during an evasion attempt, the evading investigator may immediately disengage from each other enemy engaged with him or her, and may move…"
…and 20 more: Stealth (03028), Cheat Death (03310), Snare Trap (03199), Gate Box (06013), Detached from Reality (06014), Ethereal Form (06164), In the Shadows (07010), …

--- enemy-evade-multiple (7 members) ---
MEMBER: Cunning Distraction (01578) "<b>Evade.</b> Automatically evade all enemies at your location."
MEMBER: Fire Extinguisher (02114) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. | [action] Exile Fire Extinguisher: <b>Evade.</b> You get +3 [agility] for this test. If you are successful, …"
MEMBER: Survival Instinct (02235) "If this test is successful during an evasion attempt, the evading investigator may immediately evade each other enemy engaged with him or her, and may move to a connectin…"
…and 4 more: Impromptu Barrier (04312), Decoy (05234), Fire Extinguisher (08080), Elaborate Distraction (10112)

--- enemy-engage-with-you-multiple (4 members) ---
MEMBER: Taunt (02017) "Fast. Play only during your turn. | Engage any number of enemies at your location."
MEMBER: Taunt (02019) "Fast. Play only during your turn. | Engage any number of enemies at your location. Draw 1 card for each enemy engaged in this way."
MEMBER: Taunt (60130) "Fast. Play during any [fast] window. | Engage any number of enemies at your location. For each enemy engaged this way, deal it 1 damage and draw 1 card."
…and 1 more: "I'm done runnin'!" (05016)

==== FILE: src/tags/enemy/mitigation.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeEnemyMitigation {
  EnemyMitigationDiscard = "enemy-mitigation-discard",
  EnemyMitigationDefeat = "enemy-mitigation-defeat",
  EnemyMitigationBackToEncounterDeck = "enemy-mitigation-back-to-encounter-deck",
  EnemyDefeatOnAttackSuccess = "enemy-defeat-on-attack-success",
}

interface TagEnemyMitigationBase extends TagBase {}

export interface TagEnemyMitigationDiscard extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationDiscard;
}

export interface TagEnemyMitigationDefeat extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationDefeat;
}

export interface TagEnemyMitigationBackToEncounterDeck extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationBackToEncounterDeck;
}

/** Defeat an enemy as the payoff of a SUCCESSFUL attack/skill test (a combat finisher: 'if this attack defeats the enemy...'). Not testless removal. */
export interface TagEnemyDefeatOnAttackSuccess extends TagBase {
  type: TagTypeEnemyMitigation.EnemyDefeatOnAttackSuccess;
}

--- enemy-mitigation-discard (5 members) ---
MEMBER: Disc of Itzamna (01541) "[reaction] When a non-[[Elite]] enemy spawns at your location, discard Disc of Itzamna: Discard that enemy."
MEMBER: Otherworld Codex (06158) "Uses (3 secrets). | [action] Exhaust Otherworld Codex and spend 1 secret: Search the top 9 cards of the encounter deck and choose a non-[[Elite]] card among them. Discard…"
MEMBER: Fire Extinguisher (08080) "[action]: <b>Fight.</b> You get +1 [combat] and deal +1 damage for this attack. | [action] Discard Fire Extinguisher: <b>Evade.</b> Automatically evade all enemies engage…"
…and 2 more: Kymani Jones (09008), Exploit Weakness (09105)

--- enemy-mitigation-defeat (5 members) ---
MEMBER: "I'll see you in hell!" (03189) "Each non-[[Elite]] enemy engaged with you is defeated. You are defeated and suffer 1 physical trauma. This action does not provoke attacks of opportunity."
MEMBER: Waylay (03237) "Choose an exhausted non-[[Elite]] enemy at your location and test [agility] (X), where X is that enemy's evade value. If you succeed, defeat that enemy."
MEMBER: String of Curses (09088) "<b>Parley.</b> Choose a non-[[Elite]] enemy at your location and either (choose one): | - Automatically evade that enemy and place 1 doom on it. It cannot take damage for…"
…and 2 more: Ravenous Myconid (10060), Whispers of Doom (11072)

--- enemy-mitigation-back-to-encounter-deck (8 members) ---
MEMBER: Close Call (01583) "Fast. Play after a non-weakness, non-[[Elite]] enemy at your location is evaded. | Shuffle that enemy into the encounter deck."
MEMBER: Persuasion (04105) "<b>Parley.</b> Choose a non-weakness [[Humanoid]] enemy at your location and test [intellect] (3). This test gets +X difficulty, where X is that enemy's horror value. If …"
MEMBER: Dumb Luck (04034) "Fast. Play after you fail a skill test by 2 or less during an evasion attempt against a non-[[Elite]] enemy. | Place that enemy on top of the encounter deck."
…and 5 more: Dumb Luck (60514), Dumb Luck (60525), Aetheric Current (10007), Intimidation (11056), Hypnotize (60274)

--- enemy-defeat-on-attack-success (1 member) ---
MEMBER: Monster Slayer (02300) "<b>Fight.</b> If this attack succeeds against a non-[[Elite]] enemy, defeat that enemy."

==== FILE: src/tags/enemy/restriction.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeEnemyRestriction {
  EnemyTraitRestriction = "enemy-trait-restriction",
  EnemyNonWeakness = "enemy-nonweakness",
  EnemyTargetExhausted = "enemy-target-exhausted",
  EnemyBlankText = "enemy-blank-text",
  EnemyIgnoreKeyword = "enemy-ignore-keyword",
}

/**
 * The effect/trigger is limited to enemies of a specified printed TRAIT (Monster,
 * Humanoid, …). "Trait" means the card's printed trait line ONLY — "Weakness"
 * (enemy-nonweakness) and Elite / non-Elite (enemy/elite.ts) are card-classification
 * carve-outs, not traits, and carry their own tags.
 */
export interface TagEnemyTraitRestriction extends TagBase {
  type: TagTypeEnemyRestriction.EnemyTraitRestriction;
  /** Required enemy trait, e.g. "Monster". */
  trait: string;
}

/**
 * The effect/trigger is limited to NON-WEAKNESS enemies. "Weakness" is a card
 * designation, not a printed trait, so it is kept out of enemy-trait-restriction.
 */
export interface TagEnemyNonWeakness extends TagBase {
  type: TagTypeEnemyRestriction.EnemyNonWeakness;
}

/**
 * The effect only works on (or gains a bonus against) an EXHAUSTED enemy — the prey-on-
 * exhausted / evade-then-kill affinity (Sneak Attack). Pairs with cards that exhaust or
 * evade enemies.
 */
export interface TagEnemyTargetExhausted extends TagBase {
  type: TagTypeEnemyRestriction.EnemyTargetExhausted;
}

/** Blank an enemy's TEXT BOX (loses all abilities/keywords; traits remain) — e.g. Mind Wipe. The hard version of ignoring a single keyword. */
export interface TagEnemyBlankText extends TagBase {
  type: TagTypeEnemyRestriction.EnemyBlankText;
}

/** Ignore a single enemy keyword (Retaliate, Aloof, Elusive, Hunter, …) without blanking the whole card — e.g. .45 Automatic (2) ignoring Retaliate. */
export interface TagEnemyIgnoreKeyword extends TagBase {
  type: TagTypeEnemyRestriction.EnemyIgnoreKeyword;
  /** The ignored keyword, e.g. "Retaliate". */
  keyword: string;
}

--- enemy-trait-restriction (9 members) ---
MEMBER: "If it bleeds..." (02225) "Fast. Play after you defeat a [[Monster]] enemy. | Each investigator at your location heals horror equal to that enemy's horror value."
MEMBER: Handcuffs (04265) "[action] If Handcuffs is not attached to an enemy: <b>Evade.</b> Use only on a [[Humanoid]] enemy. This evasion attempt uses [combat] instead of [agility]. If you succeed…"
MEMBER: Custom Ammunition (04193) "Fast. Play only during your turn. | Attach to a [[Firearm]] asset controlled by an investigator at your location. Place 2 ammo on that asset. Limit 1 per asset. | Attacks…"
…and 6 more: Persuasion (04105), Interrogate (05020), Handcuffs (09035), Oculus Mortuum (11038), Field Dressing (60571), Field Dressing (60571)
RULING: REQUIRES a real printed trait (Monster, Humanoid, …). 'Weakness' and 'Elite' are card classifications, NOT traits: non-weakness → enemy-nonweakness; Elite conditions → enemy-elite-* tags. Never emit this tag with no trait arg.

--- enemy-nonweakness (3 members) ---
MEMBER: Close Call (01583) "Fast. Play after a non-weakness, non-[[Elite]] enemy at your location is evaded. | Shuffle that enemy into the encounter deck."
MEMBER: Persuasion (04105) "<b>Parley.</b> Choose a non-weakness [[Humanoid]] enemy at your location and test [intellect] (3). This test gets +X difficulty, where X is that enemy's horror value. If …"
MEMBER: Whispers of Doom (11072) "<b>Parley.</b> Choose a non-weakness enemy at your location and test [willpower] (3). This test gets +X difficulty, where X is that enemy's horror value. If you succeed, …"
RULING: 'non-weakness enemy' conditions (Close Call 01583, Persuasion 04105).

--- enemy-target-exhausted (12 members) ---
MEMBER: Sneak Attack (01552) "Deal 2 damage to an exhausted enemy at your location."
MEMBER: Waylay (03237) "Choose an exhausted non-[[Elite]] enemy at your location and test [agility] (X), where X is that enemy's evade value. If you succeed, defeat that enemy."
MEMBER: Finn Edwards (04003) "You may take an additional action during your turn, which can only be used to evade. | [elder_sign] effect: +1 for each exhausted enemy in play. If you succeed by 2 or mo…"
…and 9 more: Delilah O'Rourke (06281), .25 Automatic (07025), .25 Automatic (07305), Kymani Jones (09008), Dirty Fighting (09073), Clean Sneak (09078), A Sudden Fall (60367), …

--- enemy-blank-text (2 members) ---
MEMBER: Mind Wipe (01568) "Fast. Play after a phase begins. | Choose a non-[[Elite]] enemy at your location. Treat the chosen enemy's printed text box as if it were blank (except for [[Traits]]) un…"
MEMBER: Mind Wipe (50008) "Fast. Play after a phase begins. | Choose a non-[[Elite]] enemy in your location. Until the end of the phase, reduce the chosen enemy's damage and horror values by 1, and…"

--- enemy-ignore-keyword (19 members) ---
MEMBER: .45 Automatic (03190) "Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +2 [combat] for this attack. This attack deals +1 damage. Ignore the retaliate keyword for this attack."
MEMBER: Marksmanship (04104) "Fast. Play when you activate the <b>Fight</b> ability on a [[Firearm]] or [[Ranged]] asset. | This attack can target an enemy at a connecting location. Ignore the aloof a…"
MEMBER: Marksmanship (04104) "Fast. Play when you activate the <b>Fight</b> ability on a [[Firearm]] or [[Ranged]] asset. | This attack can target an enemy at a connecting location. Ignore the aloof a…"
…and 16 more: Telescopic Sight (05230), Telescopic Sight (05230), Enchanted Bow (08118), Enchanted Bow (08118), Dirty Fighting (09073), Ofuda (10022), Ofuda (10022), …

==== FILE: src/tags/enemy/value.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeEnemyValue {
  EnemyValueDamage = "enemy-value-damage",
  EnemyValueEvade = "enemy-value-evade",
  EnemyValueEvadeReduction = "enemy-value-evade-reduction",
  EnemyValueFight = "enemy-value-fight",
  EnemyValueFightReduction = "enemy-value-fight-reduction",
  EnemyValueHealthReduction = "enemy-value-health-reduction",
  EnemyValueHorror = "enemy-value-horror",
  EnemyValueRemainingHealth = "enemy-value-remaining-health",
  EnemyValueHealth = "enemy-value-health",
}

interface TagEnemyValueBase extends TagBase {}

export interface TagEnemyValueDamage extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueDamage;
}

export interface TagEnemyValueEvade extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueEvade;
}

export interface TagEnemyValueEvadeReduction extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueEvadeReduction;
}

export interface TagEnemyValueFight extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueFight;
}

export interface TagEnemyValueFightReduction extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueFightReduction;
}

/** Reduces an enemy's printed health ("attacked enemy gets -1 health" — Wither (4)). */
export interface TagEnemyValueHealthReduction extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueHealthReduction;
}

export interface TagEnemyValueHorror extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueHorror;
}

/**
 * Cares about damage already ON an enemy / its remaining health — a finisher
 * gate (Garrote Wire: "exactly 1 remaining health" → comparison "exact",
 * value 1) or a scaling payoff (Followed: +1 [intellect] per damage on the
 * chosen enemy → args omitted).
 */
export interface TagEnemyValueRemainingHealth extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueRemainingHealth;
  comparison?: "exact" | "min" | "max";
  value?: number;
}

/** References an enemy's PRINTED health as a value (Ancestral Token: bless = health; Blackmail File: difficulty = health) — the health member of the enemy-value family, parallel to fight/evade/horror/damage. */
export interface TagEnemyValueHealth extends TagEnemyValueBase {
  type: TagTypeEnemyValue.EnemyValueHealth;
}

--- enemy-value-damage (13 members) ---
MEMBER: Aquinnah (01582) "[reaction] When an enemy attacks you, exhaust Aquinnah and deal 1 horror to her: Deal that enemy's damage to another enemy at your location, instead. (You still take horr…"
MEMBER: Aquinnah (01691) "[reaction] When an enemy attacks you, exhaust Aquinnah and deal 1 horror to her: Deal that enemy's damage to any enemy at your location, instead. (You still take horror d…"
MEMBER: Hypnotic Gaze (02153) "Fast. Play when an enemy attacks an investigator at your location. | Cancel that attack. Then, reveal a random token from the chaos bag. If it has a [skull], [cultist], […"
…and 10 more: Aquinnah (02308), Hypnotic Gaze (60414), Hypnotic Gaze (60423), Interrogate (05020), Hand of Fate (07020), Flute of the Outer Gods (07268), Stir the Pot (10073), …

--- enemy-value-evade (5 members) ---
MEMBER: Waylay (03237) "Choose an exhausted non-[[Elite]] enemy at your location and test [agility] (X), where X is that enemy's evade value. If you succeed, defeat that enemy."
MEMBER: Eavesdrop (04027) "Choose an unengaged enemy at your location. Test [intellect] (X), where X is the evade value of the chosen enemy. If you succeed, discover 2 clues at your location."
MEMBER: Sharpshooter (60327) "[reaction] When you use a fight ability on a [[Firearm]] asset, exhaust Sharpshooter: Choose one, or both - | - This attack uses [agility] instead of [combat]. All modifi…"
…and 2 more: Delilah O'Rourke (06281), Confound (10057)

--- enemy-value-evade-reduction (9 members) ---
MEMBER: Anatomical Diagrams (03108) "Fast. Play during any investigator's turn. Play only if you have 5 or more remaining sanity. | Choose a non-[[Elite]] enemy at your location. Until the end of the active …"
MEMBER: Stealth (03028) "[action] Exhaust Stealth: <b>Evade.</b> The chosen enemy gets -2 evade for this evasion attempt. If you successfully evade the enemy, disengage with it but do not exhaust…"
MEMBER: Impromptu Barrier (04312) "You may play Impromptu Barrier from your discard pile. If you do, shuffle it into your deck after resolving its effects. | <b>Evade.</b> The chosen enemy gets -1 evade fo…"
…and 6 more: Wither (05157), Wither (05321), Bolas (09025), Makeshift Trap (09100), Putrescent Rot (10088), Stealth (52005)

--- enemy-value-fight (3 members) ---
MEMBER: Expose Weakness (02228) "Fast. Play during any [free] player window. | Choose an enemy at your location. Test [intellect] (X), where X is that enemy's fight value. For each point you succeed by, …"
MEMBER: Expose Weakness (04195) "Fast. Play during any [free] player window. | Choose an enemy at your location. Test [intellect] (X), where X is that enemy's fight value. If you succeed, treat that enem…"
MEMBER: Drain Essence (10094) "<b>Parley.</b> Choose an enemy at your location and test [willpower] (X), where X is the chosen enemy's fight value. If you succeed, move 1 damage from your investigator …"

--- enemy-value-fight-reduction (9 members) ---
MEMBER: Expose Weakness (02228) "Fast. Play during any [free] player window. | Choose an enemy at your location. Test [intellect] (X), where X is that enemy's fight value. For each point you succeed by, …"
MEMBER: Anatomical Diagrams (03108) "Fast. Play during any investigator's turn. Play only if you have 5 or more remaining sanity. | Choose a non-[[Elite]] enemy at your location. Until the end of the active …"
MEMBER: Expose Weakness (04195) "Fast. Play during any [free] player window. | Choose an enemy at your location. Test [intellect] (X), where X is that enemy's fight value. If you succeed, treat that enem…"
…and 6 more: Improvised Weapon (04033), Wither (05157), Wither (05321), Makeshift Trap (09100), Putrescent Rot (10088), Improvised Weapon (11092)

--- enemy-value-health-reduction (1 member) ---
MEMBER: Wither (05321) "[action]: <b>Fight.</b> This attack uses [willpower] instead of [combat]. You get +2 [willpower] for this attack. If a [skull], [cultist], [tablet], or [elder_thing] symb…"
RULING: Reduces an enemy's printed health (Wither(4) 05321).

--- enemy-value-horror (11 members) ---
MEMBER: "If it bleeds..." (02225) "Fast. Play after you defeat a [[Monster]] enemy. | Each investigator at your location heals horror equal to that enemy's horror value."
MEMBER: Persuasion (04105) "<b>Parley.</b> Choose a non-weakness [[Humanoid]] enemy at your location and test [intellect] (3). This test gets +X difficulty, where X is that enemy's horror value. If …"
MEMBER: Hypnotic Gaze (60423) "Fast. Play when an enemy attacks an investigator at your location. | Cancel that attack. Then, reveal a random token from the chaos bag. If it has a [skull], [cultist], […"
…and 8 more: Hand of Fate (07020), Righteous Hunt (07109), Stir the Pot (10073), Stir the Pot (10083), "Where's the party?" (11053), Whispers of Doom (11072), De-Escalate (60265), …

--- enemy-value-remaining-health (8 members) ---
MEMBER: Followed (06114) "<b>Investigate.</b> Choose an enemy at your location. You get +1 [intellect] for this investigation for each damage on the chosen enemy (to a maximum of +5 [intellect]). …"
MEMBER: Garrote Wire (06280) "[fast] During your turn, exhaust Garrote Wire: <b>Fight.</b> You get +2 [combat] for this attack. Use only on an enemy with exactly 1 remaining health."
MEMBER: Kymani Jones (09008) "[fast]: Engage an exhausted enemy at your location. | [reaction] When you attempt to evade an exhausted non-[[Elite]] enemy: Add your [intellect] to your skill value for …"
…and 5 more: Kicking the Hornet's Nest (09068), Ravenous Myconid (10060), Intimidation (11056), Hypnotize (60274), "Make 'em sing" (60160)
RULING: Damage already ON an enemy / remaining health: finisher gates (Garrote Wire, comparison exact 1) and scaling payoffs (Followed, args omitted). Not enemy-value-health-reduction (which shrinks printed health — Wither(4)).

--- enemy-value-health (6 members) ---
MEMBER: Ancestral Token (10019) "[reaction] After you defeat an enemy, exhaust Ancestral Token: Add [bless] tokens to the chaos bag equal to that enemy's printed health (max 5)."
MEMBER: Blackmail File (10064) "[action] Choose a non-[[Elite]] enemy at your location: <b>Parley.</b> Test [willpower] (X), where X is that enemy's printed health value. If you succeed, that enemy dise…"
MEMBER: Aember Rot (10087) "Bonded (Rod of Carnamagos). | <b>Forced</b> - When attached enemy is defeated: Gain resources equal to its printed health (to a maximum of 5). | <b>Forced</b> - When atta…"
…and 3 more: Autopsy Report (60276), Bounty (60161), Paint the Town Red (12051)
RULING: AUTONOMOUS TAG (2026-07-17, FHV): completes the enemy-value family (fight/evade/horror/damage → +health) — references an enemy's PRINTED health as a value (Ancestral Token, Blackmail File). Distinct from enemy-value-remaining-health (current damage) and enemy-value-health-reduction (shrinks it).

==== FILE: src/tags/exile/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeExile {
  ExileSelf = "exile-self",
}

interface TagExileBase extends TagBase {}

/**
 * Exile: this card is removed from your deck/collection when used (a campaign
 * deckbuilding mechanic with XP-repurchase implications). Distinct from
 * discard-from-play (recoverable) and remove-from-game (scenario-only).
 */
export interface TagExileSelf extends TagExileBase {
  type: TagTypeExile.ExileSelf;
}

--- exile-self (15 members) ---
MEMBER: Fire Extinguisher (02114) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. | [action] Exile Fire Extinguisher: <b>Evade.</b> You get +3 [agility] for this test. If you are successful, …"
MEMBER: Flare (02115) "Either (choose one): | - <b>Fight.</b> You get +3 [combat] and deal +2 damage for this attack. Exile Flare. | - Search the top 9 cards of any investigator's deck for an […"
MEMBER: Stroke of Luck (02271) "Commit only to a skill test you are performing. | After revealing chaos tokens for this test, you may choose to exile Stroke of Luck. If you do, this test is automaticall…"
…and 12 more: A Test of Will (03156), Devil's Luck (03157), Cherished Keepsake (60520), Leather Coat (60521), A Test of Will (60523), The Council's Coffer (05196), Guiding Spirit (05236), …

==== FILE: src/tags/gain/keyword.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeGainKeyword {
  GainKeywordAloof = "gain-aloof",
  GainKeywordRetaliate = "gain-retaliate",
  GainKeywordAlert = "gain-alert",
  GainKeywordFastOther = "gain-fast-other",
}

interface TagGainKeywordBase extends TagBase {}

export interface TagGainKeywordAloof extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordAloof;
}

export interface TagGainKeywordRetaliate extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordRetaliate;
}

/**
 * An enemy gains ALERT (attacks on evade attempts) — Daring's enable-the-payoff
 * twin of gain-retaliate. Future member: String Along (TDC).
 */
export interface TagGainKeywordAlert extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordAlert;
}

/**
 * Grant the FAST keyword to ANOTHER card you play (Daisy's Tote Bag, Directive,
 * Chuck Fergus, Fence). Distinct from cost/fast tags that describe a card that
 * IS fast; this grants fast to other cards — a tempo/action-compression enabler.
 */
export interface TagGainKeywordFastOther extends TagGainKeywordBase {
  type: TagTypeGainKeyword.GainKeywordFastOther;
}

--- gain-aloof (4 members) ---
MEMBER: Hiding Spot (03038) "Fast. Attach Hiding Spot to any location. | Each non-[[Elite]] enemy at attached location gains aloof. | <b>Forced</b> - At the end of the enemy phase, if a ready enemy i…"
MEMBER: Existential Riddle (09052) "<b>Parley.</b> Choose a non-[[Elite]] enemy at your location and test [willpower] or [intellect] (8). This test gets -1 difficulty for each other card in your hand. If yo…"
MEMBER: Blackmail File (10064) "[action] Choose a non-[[Elite]] enemy at your location: <b>Parley.</b> Test [willpower] (X), where X is that enemy's printed health value. If you succeed, that enemy dise…"
…and 1 more: Pay Your Dues (60365)

--- gain-retaliate (2 members) ---
MEMBER: Knuckleduster (03110) "[action]: <b>Fight.</b> This attack deals +1 damage. The attacked enemy gains retaliate for this attack."
MEMBER: Daring (06111) "Commit only to a skill test during an attack or evasion attempt against an enemy. That enemy gains retaliate and alert for the duration of this skill test. After this tes…"

--- gain-alert (2 members) ---
MEMBER: Daring (06111) "Commit only to a skill test during an attack or evasion attempt against an enemy. That enemy gains retaliate and alert for the duration of this skill test. After this tes…"
MEMBER: String Along (11052) "[reaction] When you attempt to evade an enemy, exhaust String Along: For this evasion attempt, you get +1 skill value and that enemy gains alert. If you succeed, draw 1 c…"
RULING: An enemy gains ALERT (Daring 06111, paired with gain-retaliate like Knuckleduster). Future member: String Along (TDC) — per user 2026-07-16.

--- gain-fast-other (4 members) ---
MEMBER: Fence (04108) "[reaction] When you play an [[Illicit]] card during your turn, exhaust Fence: The [[Illicit]] card gains fast. If it was already fast, reduce its cost by 1 instead."
MEMBER: Chuck Fergus (60332) "[reaction] When you play a [[Tactic]] or [[Trick]] event, exhaust Chuck Fergus: Choose two - | - That event gains fast. | - That event costs 2 fewer resources to play. | …"
MEMBER: Cryptic Grimoire (07191) "Researched. | [reaction] After you resolve 1 or more [curse] tokens during a skill test: Place that many secrets on Cryptic Grimoire. | [reaction] When you play an [[Insi…"
…and 1 more: Chuck Fergus (09072)

==== FILE: src/tags/gain/resource.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeGainResource {
  GainResourceYou = "gain-resource-you",
  GainResourceInvestigator = "gain-resource-investigator",
  GainResourceMoveInvestigator = "gain-resource-move-investigator",
}

interface TagGainResourceBase extends TagBase {
  value: DynamicValue;
}

export interface TagGainResourceYou extends TagGainResourceBase {
  type: TagTypeGainResource.GainResourceYou;
}

export interface TagGainResourceInvestigator extends TagGainResourceBase {
  type: TagTypeGainResource.GainResourceInvestigator;
}

/**
 * Move resources between investigators' pools (sharing/loan/trade), distinct from
 * gaining new resources. No value: the amount is contextual, so it extends TagBase
 * directly rather than the value-bearing base. Kept in the `gain` group (resource
 * economy) with the `gain-` prefix per the one-folder-one-prefix rule.
 */
export interface TagGainResourceMoveInvestigator extends TagBase {
  type: TagTypeGainResource.GainResourceMoveInvestigator;
}

--- gain-resource-you (124 members) ---
MEMBER: Dr. Milan Christopher (01533) "You get +1 [intellect]. | [reaction] After you successfully investigate: Gain 1 resource."
MEMBER: Burglary (01545) "[action] Exhaust Burglary: <b>Investigate.</b> If you succeed, instead of discovering clues, gain 3 resources."
MEMBER: Hot Streak (01557) "Gain 10 resources."
…and 121 more: Forbidden Knowledge (01558), Emergency Cache (01588), "I've had worse…" (01684), Emergency Cache (01693), Stand Together (02148), Lone Wolf (02188), Emergency Cache (02194), …
RULING: Variable amounts use value:"dynamic" (the old dynamic?:boolean flag is retired). Conditional-upgrade gains tag both values (Cryptic Writings 3 AND 4).

--- gain-resource-investigator (17 members) ---
MEMBER: Stand Together (02148) "Choose another investigator at your location. Both you and that investigator draw 2 cards and gain 2 resources."
MEMBER: Take Heart (04201) "Max 1 committed per skill test. | You may commit Take Heart to any type of test. | If this test fails, the performing investigator draws 2 cards and gains 2 resources."
MEMBER: Stand Together (60118) "Choose another investigator at your location. Both you and that investigator gain 2 resources."
…and 14 more: Take Heart (60519), Carolyn Fern (05001), Crack the Case (05110), Patrice's Violin (06016), The Stars Are Right (06028), Leadership (06235), Faustian Bargain (07028), …
RULING: Variable amounts use value:"dynamic" (the old dynamic?:boolean flag is retired). Conditional-upgrade gains tag both values (Cryptic Writings 3 AND 4).

--- gain-resource-move-investigator (4 members) ---
MEMBER: Teamwork (02018) "Investigators at your location may give or trade any number of [[Item]] assets, [[Ally]] assets, or resources among one another."
MEMBER: Kleptomania (06036) "Multiplayer only. | <b>Revelation</b> - Put Kleptomania into play in your play area. | [action]: Take control of an [[Item]] asset or 2 resources from another investigato…"
MEMBER: "I'll Pay You Back!" (10072) "Fast. Play only during your turn. | Choose another investigator at your location. Move all resources from that investigator's resource pool to your resource pool. At the …"
…and 1 more: "You've had worse..." (11063)
RULING: Variable amounts use value:"dynamic" (the old dynamic?:boolean flag is retired). Conditional-upgrade gains tag both values (Cryptic Writings 3 AND 4).

==== FILE: src/tags/hand-size/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeHandSize {
  HandSizeMaxIncrease = "hand-size-max-increase",
  HandSizeDependent = "hand-size-dependent",
}

interface TagHandSizeBase extends TagBase {}

/**
 * Increases the maximum hand size (e.g. "your maximum hand size is increased by 2").
 */
export interface TagHandSizeMaxIncrease extends TagHandSizeBase {
  type: TagTypeHandSize.HandSizeMaxIncrease;
  value: number;
}

/**
 * Effect scales with / is gated by the number of cards in your hand
 * (e.g. "while you have 5 or more cards in your hand").
 */
export interface TagHandSizeDependent extends TagHandSizeBase {
  type: TagTypeHandSize.HandSizeDependent;
}

--- hand-size-max-increase (8 members) ---
MEMBER: Laboratory Assistant (02020) "Your maximum hand size is increased by 2. | [reaction] After Laboratory Assistant enters play: Draw 2 cards."
MEMBER: Drawing the Sign (03041) "<b>Revelation</b> - Put Drawing the Sign into play in your threat area. | Your maximum hand size is reduced by 5. | [action] [action]: Discard Drawing the Sign."
MEMBER: Vault of Knowledge (60202) "Harvey Walters deck only. | Your maximum hand size is increased by 2. | [reaction] After you successfully investigate, exhaust Vault of Knowledge and choose an investigat…"
…and 5 more: Arcane Enlightenment (60205), Laboratory Assistant (60212), Patrice Hathaway (06005), Pelt Shipment (10109), Laboratory Assistant (12032)

--- hand-size-dependent (16 members) ---
MEMBER: Higher Education (02187) "Permanent. | While you have 5 or more cards in your hand, Higher Education gains: | "[free] Spend 1 resource: You get +2 [willpower] for this skill test. | [free] Spend 1…"
MEMBER: Feed the Mind (04267) "Uses (3 secrets). | [action] Exhaust Feed the Mind and spend 1 secret: Test [intellect] (0). For each point you succeed by, draw 1 card. Then, take 1 horror for each card…"
MEMBER: Last Chance (04036) "Commit only to a skill test with no other cards committed to it. Other cards cannot be committed to this skill test. | Last Chance loses [wild] for each card in your hand…"
…and 13 more: Thrice-Damned Curiosity (60203), Celaeno Fragments (60206), Forbidden Tome (60210), Higher Education (60211), Extensive Research (60216), Cryptic Writings (60224), Forbidden Tome (60229), …

==== FILE: src/tags/heal/main.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeHeal {
  HealDamageYou = "heal-damage-you",
  HealDamageInvestigator = "heal-damage-investigator",
  HealDamageAlly = "heal-damage-ally",
  HealDamageSelf = "heal-damage-self",
  HealHorrorYou = "heal-horror-you",
  HealHorrorInvestigator = "heal-horror-investigator",
  HealHorrorAlly = "heal-horror-ally",
  HealHorrorSelf = "heal-horror-self",
  HealRemovesWeakness = "heal-removes-weakness",
}

interface TagHealBase extends TagBase {
  value: DynamicValue;
}

export interface TagHealDamageYou extends TagHealBase {
  type: TagTypeHeal.HealDamageYou;
}

export interface TagHealDamageInvestigator extends TagHealBase {
  type: TagTypeHeal.HealDamageInvestigator;
}

export interface TagHealDamageAlly extends TagHealBase {
  type: TagTypeHeal.HealDamageAlly;
}

/**
 * The card/asset bearing this ability heals damage from ITSELF (a self-cleaning
 * sponge). Distinct from HealDamageYou (the controlling investigator) and
 * HealDamageAlly (any ally asset) — this is selfish self-maintenance, NOT support.
 */
export interface TagHealDamageSelf extends TagHealBase {
  type: TagTypeHeal.HealDamageSelf;
}

export interface TagHealHorrorYou extends TagHealBase {
  type: TagTypeHeal.HealHorrorYou;
}

export interface TagHealHorrorInvestigator extends TagHealBase {
  type: TagTypeHeal.HealHorrorInvestigator;
}

export interface TagHealHorrorAlly extends TagHealBase {
  type: TagTypeHeal.HealHorrorAlly;
}

/**
 * The card/asset bearing this ability heals horror from ITSELF (a self-cleaning
 * horror sponge, e.g. Peter Sylvestre). Distinct from HealHorrorYou (the
 * investigator) and HealHorrorAlly (any ally asset) — selfish, NOT support.
 */
export interface TagHealHorrorSelf extends TagHealBase {
  type: TagTypeHeal.HealHorrorSelf;
}

/**
 * This weakness in your threat area can be HEALED away as if it were a point of
 * damage/horror (the EOTE injury family: Leg Injury, Panic, Stupor, Internal
 * Injury). (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagHealRemovesWeakness extends TagBase {
  type: TagTypeHeal.HealRemovesWeakness;
}

--- heal-damage-you (21 members) ---
MEMBER: Painkillers (02117) "Uses (3 supplies). | [free] Spend 1 supply, exhaust Painkillers, and take 1 horror: Heal 1 damage."
MEMBER: Cheat Death (03310) "Fast. Play when you would be defeated. | Disengage from each enemy engaged with you, discard all cards in your threat area, heal 2 horror and 2 damage, and move to any re…"
MEMBER: Calvin Wright (04005) "You get +1 [willpower] and +1 [intellect] for each horror on you. | You get +1 [combat] and +1 [agility] for each damage on you. | [elder_sign] effect: +0. You may either…"
…and 18 more: Second Wind (04149), Second Wind (04149), Randall Cho (60102), Stella Clark (60501), Deny Existence (05280), Wish Eater (06277), Spirit of Humanity (07229), …

--- heal-damage-investigator (38 members) ---
MEMBER: First Aid (01519) "Uses (3 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage or horror from an investigator at your location."
MEMBER: Medical Texts (01535) "[action] Choose an investigator at your location and test [intellect] (2). If you succeed, heal 1 damage from that investigator. If you fail, deal 1 damage to that invest…"
MEMBER: First Aid (01683) "Uses (4 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage and 1 horror from an investigator or [[Ally]] asset in your location…"
…and 35 more: Emergency Aid (02105), Strange Solution (02262), First Aid (03230), Thermos (04274), Thermos (04274), Soothing Melody (05314), Healing Words (06163), …

--- heal-damage-ally (21 members) ---
MEMBER: First Aid (01683) "Uses (4 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage and 1 horror from an investigator or [[Ally]] asset in your location…"
MEMBER: Emergency Aid (02105) "Choose an investigator at your location. Heal 2 damage from that investigator or from an [[Ally]] asset he or she controls."
MEMBER: Inspiring Presence (03228) "If this skill test is successful, ready an [[Ally]] asset at your location and heal 1 damage or 1 horror from it."
…and 18 more: First Aid (03230), Lonnie Ritter (60309), Soothing Melody (05314), Manipulate Destiny (07162), Bandages (08073), Medical Student (08083), Call for Backup (08129), …

--- heal-damage-self (9 members) ---
MEMBER: Jessica Hyde (06118) "You get +1 [combat]. | Jessica Hyde enters play with 2 damage on her. | [reaction] After your turn ends: Heal 1 damage from Jessica Hyde."
MEMBER: The Black Cat (06285) "Anytime you reveal a [tablet], [elder_thing], or [elder_sign] symbol during a skill test, you may choose to use the following effects instead of that symbol's normal effe…"
MEMBER: Spiritual Resolve (06323) "Myriad. | [fast] Discard a copy of Spiritual Resolve from your hand: Heal all damage and horror from this copy of Spiritual Resolve."
…and 6 more: Precious Memento (08114), Precious Memento (08115), Girish Kadakia (09038), Ravenous Myconid (10061), Sound Support (11112), Aleksey Saburov (12072)

--- heal-horror-you (34 members) ---
MEMBER: Fearless (01567) "If this skill test is successful, heal 1 horror."
MEMBER: Smoking Pipe (02116) "Uses (3 supplies). | [free] Spend 1 supply, exhaust Smoking Pipe, and take 1 damage: Heal 1 horror."
MEMBER: Fearless (02268) "If this skill test is successful, heal 1 horror (2 horror instead if it succeeds by 2 or more)."
…and 31 more: Fearless (02268), Moment of Respite (02273), Cheat Death (03310), St. Hubert's Key (03269), Calvin Wright (04005), Stella Clark (60501), Meat Cleaver (05114), …

--- heal-horror-investigator (40 members) ---
MEMBER: First Aid (01519) "Uses (3 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage or horror from an investigator at your location."
MEMBER: First Aid (01683) "Uses (4 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage and 1 horror from an investigator or [[Ally]] asset in your location…"
MEMBER: Jim's Trumpet (02012) "Jim Culver deck only. | [reaction] When a [skull] token is revealed during a skill test, exhaust Jim's Trumpet: Heal 1 horror from an investigator at your location or a c…"
…and 37 more: Liquid Courage (02024), Clarity of Mind (02030), "If it bleeds..." (02225), First Aid (03230), Logical Reasoning (03191), Kerosene (04304), Ancient Stone (04231), …

--- heal-horror-ally (17 members) ---
MEMBER: First Aid (01683) "Uses (4 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage and 1 horror from an investigator or [[Ally]] asset in your location…"
MEMBER: Inspiring Presence (03228) "If this skill test is successful, ready an [[Ally]] asset at your location and heal 1 damage or 1 horror from it."
MEMBER: First Aid (03230) "Uses (4 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage and 1 horror from an investigator or [[Ally]] asset in your location…"
…and 14 more: Kerosene (04304), Ancient Stone (04231), Carolyn Fern (05001), Soothing Melody (05314), Rite of Equilibrium (07308), Medical Student (08083), Call for Backup (08129), …

--- heal-horror-self (11 members) ---
MEMBER: Peter Sylvestre (02033) "You get +1 [agility]. | [reaction] After your turn ends: Heal 1 horror from Peter Sylvestre."
MEMBER: Peter Sylvestre (02035) "You get +1 [agility] and +1 [willpower]. | [reaction] After your turn ends: Heal 1 horror from Peter Sylvestre."
MEMBER: Lonnie Ritter (60309) "You get +1 [combat]. | [fast] Exhaust Lonnie Ritter and spend 1 resource: Choose an [[Item]] asset controlled by an investigator at your location. Heal 1 damage from that…"
…and 8 more: The Black Cat (06285), Spiritual Resolve (06323), Precious Memento (08114), Precious Memento (08115), Girish Kadakia (09038), Ravenous Myconid (10061), Sound Support (11112), …

--- heal-removes-weakness (4 members) ---
MEMBER: Arm Injury (08130) "<b>Revelation</b> - Put Arm Injury into play in your threat area. | Arm Injury can be healed as if it were a single point of damage on you <i>(if it is healed, discard it…"
MEMBER: Leg Injury (08131) "<b>Revelation</b> - Put Leg Injury into play in your threat area. | Leg Injury can be healed as if it were a single point of damage on you <i>(if it is healed, discard it…"
MEMBER: Panic (08132) "<b>Revelation</b> - Put Panic into play in your threat area. | Panic can be healed as if it were a single point of horror on you <i>(if it is healed, discard it)</i>. | <…"
…and 1 more: Stupor (08133)
RULING: AUTONOMOUS TAG (2026-07-17, EOTE ingestion — REVIEW WELCOME): the injury/panic weakness family healable as damage/horror (4 members). Their action-type-lockout clauses stay untagged per the behavior-restriction convention (Promise, Self-Centered).

==== FILE: src/tags/limit/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeLimit {
  LimitInPlay = "limit-in-play",
}

interface TagLimitBase extends TagBase {
  /** The trait that is limited, e.g. "Composure" or "Trap". */
  trait: string;
  /** How many are allowed. */
  count: number;
  /** Scope of the limit: across all play ("in-play") or per location ("location"). */
  per?: "in-play" | "location";
}

/** "Limit N [[Trait]] in play" / "Limit N [[Trait]] per location" — a deckbuilding/board cap on how many of a trait may exist (Composure cards = Limit 1 in play; Trap cards = Limit 1 per location). */
export interface TagLimitInPlay extends TagLimitBase {
  type: TagTypeLimit.LimitInPlay;
}

--- limit-in-play (14 members) ---
MEMBER: Combat Training (03107) "Fast. Limit 1 [[Composure]] in play. | Non-direct horror must be assigned to Combat Training before it can be assigned to your investigator card. | [free] Spend 1 resourc…"
MEMBER: Scientific Theory (03109) "Fast. Limit 1 [[Composure]] in play. | Non-direct horror must be assigned to Scientific Theory before it can be assigned to your investigator card. | [free] Spend 1 resou…"
MEMBER: Moxie (03111) "Fast. Limit 1 [[Composure]] in play. | Non-direct horror must be assigned to Moxie before it can be assigned to your investigator card. | [free] Spend 1 resource: You get…"
…and 11 more: Grounded (03113), Plucky (03115), Combat Training (08027), Scientific Theory (08040), Moxie (08056), Grounded (08069), Plucky (08081), …
RULING: 'Limit 1 <trait/copy> in play' style restrictions, with trait/count/per args (the 5 Composure cards).

==== FILE: src/tags/location/connecting.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeLocationConnecting {
  LocationConnectingEnemy = "location-connecting-enemy",
  LocationConnectingInvestigator = "location-connecting-investigator",
  LocationCreateConnection = "location-create-connection",
}

interface TagLocationConnectingBase extends TagBase {}

/** An enemy located AT a connecting location — a TARGETING SCOPE (attack/evade/choose it there), NOT "move an enemy TO a connecting location" (that is a move-* displacement). */
export interface TagLocationConnectingEnemy extends TagLocationConnectingBase {
  type: TagTypeLocationConnecting.LocationConnectingEnemy;
}

/** An investigator located AT a connecting location — a TARGETING SCOPE (affect them there), NOT "move to a connecting location" (that is a move-investigator-* effect). */
export interface TagLocationConnectingInvestigator extends TagLocationConnectingBase {
  type: TagTypeLocationConnecting.LocationConnectingInvestigator;
}

/**
 * CREATES a connection between locations that wouldn't otherwise exist (Open
 * Gate pairs: "investigators may move between any two locations with an
 * attached Open Gate as if connected"). A Mobility-compound member.
 */
export interface TagLocationCreateConnection extends TagLocationConnectingBase {
  type: TagTypeLocationConnecting.LocationCreateConnection;
}

--- location-connecting-enemy (22 members) ---
MEMBER: Caught Red-Handed (04012) "<b>Revelation</b> - Ready each enemy at your location or a connecting location. Each hunter enemy at a connecting location moves 1 location toward you. If no enemies move…"
MEMBER: Marksmanship (04104) "Fast. Play when you activate the <b>Fight</b> ability on a [[Firearm]] or [[Ranged]] asset. | This attack can target an enemy at a connecting location. Ignore the aloof a…"
MEMBER: "Get over here!" (60114) "<b>Engage.</b> <b>Fight.</b> Choose a non-[[Elite]] enemy at your location or a connecting location. Move that enemy to your location, engage it, and attack it."
…and 19 more: "Get over here!" (60123), Telescopic Sight (05230), Decoy (05234), Bait and Switch (05282), Righteous Hunt (07109), On the Trail (08085), Gené Beauregard (08099), …
RULING: An investigator/enemy located AT a connecting location — a targeting SCOPE only (Jim's Trumpet; 'Get over here!', Telescopic Sight, Decoy, Marksmanship). MOVING TO a connecting location is a normal location-move-* effect, never this tag (Shortcut, Pathfinder, Think on Your Feet were all stripped).

--- location-connecting-investigator (5 members) ---
MEMBER: Jim's Trumpet (02012) "Jim Culver deck only. | [reaction] When a [skull] token is revealed during a skill test, exhaust Jim's Trumpet: Heal 1 horror from an investigator at your location or a c…"
MEMBER: Heroic Rescue (06234) "Fast. Play when a non-[[Elite]] enemy would attack another investigator at your location or a connecting location. | Move to that location if you are not already there. E…"
MEMBER: Guardian Angel (07006) "Sister Mary deck only. | Guardian Angel may be assigned damage dealt to other investigators at your location and connecting locations. | [reaction] When any amount of dam…"
…and 2 more: "You've had worse..." (11054), "You've had worse..." (11063)
RULING: An investigator/enemy located AT a connecting location — a targeting SCOPE only (Jim's Trumpet; 'Get over here!', Telescopic Sight, Decoy, Marksmanship). MOVING TO a connecting location is a normal location-move-* effect, never this tag (Shortcut, Pathfinder, Think on Your Feet were all stripped).

--- location-create-connection (1 member) ---
MEMBER: Open Gate (06029) "Myriad. Fast. | Play only during your turn. | Attach to your location. Group limit 3 in play. | Investigators may move between any two locations with an attached Open Gat…"
RULING: Creates map connections (Open Gate pairs) — a Mobility compound member (ruled 2026-07-17: Open Gate's main function was untagged).

==== FILE: src/tags/location/move.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeLocationMove {
  LocationMoveClue = "location-move-clue",
  LocationMoveDamage = "location-move-damage",
  LocationMoveEnemyControl = "location-move-enemy-control",
  LocationMoveEnemyDisplace = "location-move-enemy-displace",
  LocationMoveEnemyToYou = "location-move-enemy-to-you",
  LocationMoveInvestigatorAny = "location-move-investigator-any",
  LocationMoveInvestigatorSelf = "location-move-investigator-self",
  LocationMoveInvestigatorPerformer = "location-move-investigator-performer",
}

interface TagLocationMoveBase extends TagBase {}

export interface TagLocationMoveClue extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveClue;
}

export interface TagLocationMoveDamage extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveDamage;
}

export interface TagLocationMoveEnemyControl extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveEnemyControl;
}

export interface TagLocationMoveEnemyDisplace extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveEnemyDisplace;
}

export interface TagLocationMoveEnemyToYou extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveEnemyToYou;
}

export interface TagLocationMoveInvestigatorAny extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveInvestigatorAny;
}

export interface TagLocationMoveInvestigatorSelf extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveInvestigatorSelf;
}

/**
 * The PERFORMING investigator moves — for a skill card whose effect applies to whoever
 * performs the test it is committed to (text: "the evading/investigating/performing
 * investigator"), which may be another player at your location. This is what makes such a
 * skill a true SUPPORT card; contrast move-investigator-self (the owner only — e.g. Guts,
 * not support). See the Support compound.
 */
export interface TagLocationMoveInvestigatorPerformer extends TagLocationMoveBase {
  type: TagTypeLocationMove.LocationMoveInvestigatorPerformer;
}

--- location-move-clue (5 members) ---
MEMBER: Vantage Point (04306) "Fast. Play after a location enters play or is revealed during an investigator's turn. | Until the end of the active investigator's turn, that location gets -1 shroud. You…"
MEMBER: Unsolved Case (05010) "Place 1 of your clues on the location with the highest shroud. Remove Unsolved Case from the game. | <b>Forced</b> - If Unsolved Case would be shuffled into your hunch de…"
MEMBER: Ghastly Revelation (05275) "Discover 3 clues at your location. Give any number of your clues to another investigator, or place any number of your clues on any location. You are defeated and suffer 1…"
…and 2 more: Gené Beauregard (08099), Aetheric Current (10006)

--- location-move-damage (4 members) ---
MEMBER: The Home Front (03007) "Mark Harrigan deck only. | If this skill test is successful during an attack, move 1 damage from Mark Harrigan to the attacked enemy."
MEMBER: Forbidden Tome (60229) "Researched. | [action] [action] [action] [action] Exhaust Forbidden Tome: Move 1 damage from a player card at your location to an enemy at your location. Reduce this abil…"
MEMBER: Stouthearted (10017) "Hank Samson deck only. | Fast. Play when you engage a non-[[Elite]] enemy. | Move up to 2 damage and/or horror from Hank Samson to that enemy, as damage."
…and 1 more: Drain Essence (10094)

--- location-move-enemy-control (4 members) ---
MEMBER: Lure (02156) "Attach to your location. | During the enemy phase, each enemy that moves does so along the shortest path toward the attached location, instead of to where it would normal…"
MEMBER: Banish (05113) "<b>Evade.</b> Use only on a non-[[Elite]] enemy. This evasion attempt uses [willpower] instead of [agility]. If you succeed, move the enemy just evaded to any location in…"
MEMBER: Lure (05323) "Attach to your location or to a connecting location. | During the enemy phase, each enemy that moves does so along the shortest path toward the attached location, instead…"
…and 1 more: Aetheric Current (10006)

--- location-move-enemy-displace (15 members) ---
MEMBER: Bait and Switch (02034) "<b>Evade.</b> If you succeed, if the enemy is non-[[Elite]], evade the enemy and move it to a connecting location."
MEMBER: Warning Shot (05229) "As an additional cost to play Warning Shot, spend 1 ammo from a [[Firearm]] asset you control. | Move all non-[[Elite]] enemies at your location to a connecting location.…"
MEMBER: Bait and Switch (05282) "Either (choose one): | - <b>Evade.</b> If you succeed and the enemy is non-[[Elite]], evade the enemy and move it to a connecting location. | - <b>Evade.</b> Use only on …"
…and 12 more: Shroud of Shadows (07119), Shroud of Shadows (07228), Flute of the Outer Gods (07268), Cyclopean Hammer (08093), Gené Beauregard (08099), Ethereal Slip (08108), Ethereal Slip (08110), …

--- location-move-enemy-to-you (5 members) ---
MEMBER: Caught Red-Handed (04012) "<b>Revelation</b> - Ready each enemy at your location or a connecting location. Each hunter enemy at a connecting location moves 1 location toward you. If no enemies move…"
MEMBER: "Get over here!" (60114) "<b>Engage.</b> <b>Fight.</b> Choose a non-[[Elite]] enemy at your location or a connecting location. Move that enemy to your location, engage it, and attack it."
MEMBER: "Get over here!" (60123) "Fast. Play during any [free] window. | <b>Engage. Fight.</b> Choose a non-[[Elite]] enemy up to 2 locations away. Move that enemy to your location, engage it, and attack …"
…and 2 more: Gené Beauregard (08099), Spiritual Charm (60466)

--- location-move-investigator-any (8 members) ---
MEMBER: Shortcut (02022) "Fast. Play only during your turn. | Choose an investigator at your location. Move that investigator to a connecting location."
MEMBER: Shortcut (03232) "Fast. Play only during your turn. | Attach to your location. Attached location gains: | "[free] Exhaust Shortcut: <b>Move</b> <i>(to a connecting location)</i>. Any inves…"
MEMBER: Archive of Conduits (08041) "Researched. Uses (4 leylines). Limit 1 per deck. | [fast]: Move 1 leyline from this asset to a non-[[Elite]] enemy. | [action]: Choose an investigator, and an enemy with …"
…and 5 more: Archive of Conduits (08042), Archive of Conduits (08043), Prophesiae Profana (08045), Task Force (10027), Misdirection (11043)

--- location-move-investigator-self (69 members) ---
MEMBER: Elusive (01550) "Fast. Play only during your turn. | Disengage from each enemy engaged with you and move to a revealed location with no enemies."
MEMBER: Cat Burglar (01555) "You get +1 [agility]. | [action] Exhaust Cat Burglar: Disengage from each enemy engaged with you and move to a connecting location. This action does not provoke attacks o…"
MEMBER: Duke (02014) ""Ashcan" Pete deck only. | [action] Exhaust Duke: <b>Fight.</b> You attack with a base [combat] skill of 4. This attack deals +1 damage. | [action] Exhaust Duke: <b>Inves…"
…and 66 more: Think on Your Feet (02025), Pathfinder (02108), Cheat Death (03310), Astral Travel (03034), Ursula Downs (04002), Mists of R'lyeh (04029), Mists of R'lyeh (04271), …

--- location-move-investigator-performer (4 members) ---
MEMBER: Survival Instinct (01581) "If this skill test is successful during an evasion attempt, the evading investigator may immediately disengage from each other enemy engaged with him or her, and may move…"
MEMBER: Survival Instinct (02235) "If this test is successful during an evasion attempt, the evading investigator may immediately evade each other enemy engaged with him or her, and may move to a connectin…"
MEMBER: Out of Sight (12053) "Max 1 committed per skill test. | If this test is successful by 2 or more, the performing investigator may disengage from each enemy and move to a revealed connecting loc…"
…and 1 more: Out of Sight (12057)

==== FILE: src/tags/location/property.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeLocationProperty {
  LocationClueExist = "location-clue-exist",
  LocationClueZero = "location-clue-zero",
  LocationEnemyZero = "location-enemy-zero",
  LocationIgnoreEffects = "location-ignore-effects",
}

interface TagLocationPropertyBase extends TagBase {}

export interface TagLocationPropertyClueExist extends TagLocationPropertyBase {
  type: TagTypeLocationProperty.LocationClueExist;
}

export interface TagLocationPropertyClueZero extends TagLocationPropertyBase {
  type: TagTypeLocationProperty.LocationClueZero;
}

export interface TagLocationPropertyEnemyZero extends TagLocationPropertyBase {
  type: TagTypeLocationProperty.LocationEnemyZero;
}

/**
 * Ignore effects/keywords on your location while acting there (Read the Signs:
 * "ignore any effect or keyword on your location which would trigger during
 * this investigation"). Future member: Mesmeric Influence (FHV). The location
 * counterpart of enemy-ignore-keyword.
 */
export interface TagLocationIgnoreEffects extends TagLocationPropertyBase {
  type: TagTypeLocationProperty.LocationIgnoreEffects;
}

--- location-clue-exist (9 members) ---
MEMBER: Roland's .38 Special (01506) "Roland Banks deck only. | Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack (if there are 1 or more clues on your location, you ge…"
MEMBER: Preposterous Sketches (02186) "Play only if there is a clue on your location. | Draw 3 cards."
MEMBER: Inquiring Mind (02227) "Commit to a skill test only if there is a clue at your location."
…and 6 more: Fieldwork (03024), Truth from Fiction (04152), Preposterous Sketches (60218), Preposterous Sketches (60263), Preposterous Sketches (51003), Truth from Fiction (53003)

--- location-clue-zero (6 members) ---
MEMBER: Magnifying Glass (01540) "Fast. | You get +1 [intellect] while investigating. | [free] If there are no clues on your location: Return Magnifying Glass to your hand."
MEMBER: Connect the Dots (05025) "Fast. Play after you discover the last clue at your location. | Discover 2 clues at a location with a lower printed shroud value than your location."
MEMBER: Crack the Case (05110) "Fast. Play after an investigator discovers the last remaining clue at your location. | Investigators at that location gain a total of X resources, distributed as you wish…"
…and 3 more: Dowsing Rod (09083), Clean Sweep (60364), Magnifying Glass (60270)

--- location-enemy-zero (5 members) ---
MEMBER: Moment of Respite (02273) "Play only if there are no enemies at your location. | Heal 3 horror and draw 1 card."
MEMBER: Dario El-Amin (03151) "While you have 10 or more resources, you get +1 [willpower] and +1 [intellect]. | [action] If there are no enemies at your location, exhaust Dario El-Amin: Gain 2 resourc…"
MEMBER: Cheat Death (03310) "Fast. Play when you would be defeated. | Disengage from each enemy engaged with you, discard all cards in your threat area, heal 2 horror and 2 damage, and move to any re…"
…and 2 more: Smuggled Goods (04010), Respite (60577)

--- location-ignore-effects (3 members) ---
MEMBER: Read the Signs (06117) "<b>Investigate.</b> Add your [willpower] value to your skill value for this investigation. You may ignore any effect or keyword on your location which would trigger durin…"
MEMBER: Mesmeric Influence (10096) "While this card is committed to a skill test, the performing investigator may ignore all keyword or location effects that would trigger during this test."
MEMBER: Read the Signs (10101) "<b>Investigate.</b> Add your [willpower] value to your skill value for this investigation. You may ignore any effect or keyword on your location which would trigger durin…"
RULING: Ignore your location's effects/keywords during an action (Read the Signs). Future member: Mesmeric Influence (FHV) — per user 2026-07-17.

==== FILE: src/tags/location/shroud.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeLocationShroud {
  LocationShroudDependent = "location-shroud-dependent",
  LocationShroudMinus1 = "location-shroud-minus-1",
  LocationShroudMinus2 = "location-shroud-minus-2",
  LocationShroudReduction = "location-shroud-reduction",
}

interface TagLocationShroudBase extends TagBase {}

export interface TagLocationShroudDependent extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudDependent;
}

export interface TagLocationShroudMinus1 extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudMinus1;
}

export interface TagLocationShroudMinus2 extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudMinus2;
}

export interface TagLocationShroudReduction extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudReduction;
}

--- location-shroud-dependent (6 members) ---
MEMBER: Deciphered Reality (02303) "<b>Investigate.</b> The difficulty of this skill test is equal to the highest shroud value among revealed locations in play. If you succeed, discover 1 clue from each rev…"
MEMBER: Lola Santiago (04196) "You get +1 [intellect] and +1 [agility]. | [free] Exhaust Lola Santiago and spend X resources: Discover 1 clue at your location. X is the shroud value of your location."
MEMBER: Connect the Dots (05025) "Fast. Play after you discover the last clue at your location. | Discover 2 clues at a location with a lower printed shroud value than your location."
…and 3 more: Crack the Case (05110), Dream Diary (06236), Alton O'Connell (11033)

--- location-shroud-minus-1 (8 members) ---
MEMBER: Lantern (03036) "[action]: <b>Investigate.</b> Your location gets -1 shroud for this investigation. | [action] Discard Lantern: Deal 1 damage to an enemy at your location. This action doe…"
MEMBER: Vantage Point (04306) "Fast. Play after a location enters play or is revealed during an investigator's turn. | Until the end of the active investigator's turn, that location gets -1 shroud. You…"
MEMBER: Winging It (04272) "You may play Winging It from your discard pile. If you do, shuffle it into your deck after resolving its effects. | <b>Investigate.</b> Your location gets -1 shroud for t…"
…and 5 more: Matchbox (10108), Old Compass (60558), Old Compass (12083), Hand-Crank Flashlight (12088), Lantern (52009)

--- location-shroud-minus-2 (6 members) ---
MEMBER: Flashlight (01587) "Uses (3 supplies). | [action] Spend 1 supply: <b>Investigate.</b> Your location gets -2 shroud for this investigation."
MEMBER: Arcane Insight (03266) "Uses (3 charges). | [free] While an investigator is taking his or her turn, spend 1 charge: Your location gets -2 shroud until the end of this turn. (Limit once per turn.…"
MEMBER: Old Keyring (60507) "Uses (2 keys). If there are no keys on Old Keyring, discard it. | [action]: <b>Investigate.</b> Your location gets -2 shroud for this investigation. If you succeed, remov…"
…and 3 more: Cryptographic Cipher (07021), Old Keyring (09117), Old Compass (12083)

--- location-shroud-reduction (3 members) ---
MEMBER: Otherworldly Compass (04194) "[action] Exhaust Otherworldly Compass: <b>Investigate.</b> Your location gets -X shroud for this investigation. X is the number of revealed locations connected to your lo…"
MEMBER: The Skeleton Key (04270) "Exceptional. Fast. | [action]: If the Skeleton Key is in your play area, attach it to your location. If it is already attached to your location, detach it and return it t…"
MEMBER: Breach the Door (09026) "Test [combat] (1). If you succeed, attach Breach the Door to your location with 1 resource on it for each point you succeeded by, as leads. | Reduce attached location's s…"

==== FILE: src/tags/location/your.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeLocationYour {
  LocationYourEnemy = "location-your-enemy",
  LocationYourInvestigator = "location-your-investigator",
  LocationYourAlly = "location-your-ally",
  LocationYourClue = "location-your-clue",
}

interface TagLocationYourBase extends TagBase {}

export interface TagLocationYourEnemy extends TagLocationYourBase {
  type: TagTypeLocationYour.LocationYourEnemy;
}

/**
 * Often a multiplayer support card.
 */
export interface TagLocationYourInvestigator extends TagLocationYourBase {
  type: TagTypeLocationYour.LocationYourInvestigator;
}

/**
 * "LocationYour" is "Your Location" inversed. It doesn't mean "your ally".
 * It means any ally at your location.
 */
export interface TagLocationYourAlly extends TagLocationYourBase {
  type: TagTypeLocationYour.LocationYourAlly;
}

export interface TagLocationYourClue extends TagLocationYourBase {
  type: TagTypeLocationYour.LocationYourClue;
}

--- location-your-enemy (118 members) ---
MEMBER: Beat Cop (01518) "You get +1 [combat]. | [free] Discard Beat Cop: Deal 1 damage to an enemy at your location."
MEMBER: Beat Cop (01528) "You get +1 [combat]. | [free] Exhaust Beat Cop and deal 1 damage to it: Deal 1 damage to an enemy at your location."
MEMBER: Sneak Attack (01552) "Deal 2 damage to an exhausted enemy at your location."
…and 115 more: Mind Wipe (01568), Stray Cat (01576), Cunning Distraction (01578), Aquinnah (01582), Close Call (01583), Aquinnah (01691), Taunt (02017), …
RULING: A pure targeting SCOPE, beneficial or harmful: Dark Pact 04038 'deal 2 damage to an investigator at your location' carries location-your-investigator despite being a weakness's self-inflicted harm. Don't drop scope tags because the effect is negative.

--- location-your-investigator (194 members) ---
MEMBER: First Aid (01519) "Uses (3 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage or horror from an investigator at your location."
MEMBER: Dodge (01523) "Fast. Play when an enemy attacks an investigator at your location. | Cancel that attack."
MEMBER: Extra Ammunition (01526) "Place 3 ammo tokens on a [[Firearm]] asset controlled by an investigator at your location."
…and 191 more: Police Badge (01527), Old Book of Lore (01531), Medical Texts (01535), Encyclopedia (01542), Cryptic Research (01543), First Aid (01683), Old Book of Lore (01686), …
RULING: A pure targeting SCOPE, beneficial or harmful: Dark Pact 04038 'deal 2 damage to an investigator at your location' carries location-your-investigator despite being a weakness's self-inflicted harm. Don't drop scope tags because the effect is negative.

--- location-your-ally (32 members) ---
MEMBER: First Aid (01683) "Uses (4 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage and 1 horror from an investigator or [[Ally]] asset in your location…"
MEMBER: Emergency Aid (02105) "Choose an investigator at your location. Heal 2 damage from that investigator or from an [[Ally]] asset he or she controls."
MEMBER: Inspiring Presence (03228) "If this skill test is successful, ready an [[Ally]] asset at your location and heal 1 damage or 1 horror from it."
…and 29 more: First Aid (03230), Kerosene (04304), Ancient Stone (04231), Decorated Skull (04026), Carolyn Fern (05001), Soothing Melody (05314), Manipulate Destiny (07162), …
RULING: A pure targeting SCOPE, beneficial or harmful: Dark Pact 04038 'deal 2 damage to an investigator at your location' carries location-your-investigator despite being a weakness's self-inflicted harm. Don't drop scope tags because the effect is negative.

--- location-your-clue (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)
RULING: A pure targeting SCOPE, beneficial or harmful: Dark Pact 04038 'deal 2 damage to an investigator at your location' carries location-your-investigator despite being a weakness's self-inflicted harm. Don't drop scope tags because the effect is negative.

==== FILE: src/tags/multiclass/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeMulticlass {
  MulticlassClassCount = "multiclass-class-count",
}

interface TagMulticlassBase extends TagBase {}

/**
 * An effect that scales with the number of different classes among cards you
 * control (the five-color / rainbow payoff). `reward` records what scales.
 */
export interface TagMulticlassClassCount extends TagMulticlassBase {
  type: TagTypeMulticlass.MulticlassClassCount;
  reward?:
    | "combat"
    | "damage"
    | "resource"
    | "wild-icon"
    | "cost-reduction"
    | "charge"
    | "effect";
}

--- multiclass-class-count (7 members) ---
MEMBER: Gang Up (08022) "<b>Fight.</b> For each different class among cards you control, you get +1 [combat] and deal +1 damage for this attack."
MEMBER: Gang Up (08022) "<b>Fight.</b> For each different class among cards you control, you get +1 [combat] and deal +1 damage for this attack."
MEMBER: Join the Caravan (08036) "Fast. Play only during your turn. Reduce the cost of this card by 1 for each different class among cards you control. | Move to any revealed location."
…and 4 more: Cheat the System (08050), Close the Circle (08062), Strength in Numbers (08077), Call for Backup (08129)

==== FILE: src/tags/phase/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypePhase {
  PhaseSkip = "phase-skip",
  PhaseRepeat = "phase-repeat",
}

interface TagPhaseBase extends TagBase {}

/** Skip an entire phase (The Gold Pocket Watch, Deliverance skipping the mythos phase). */
export interface TagPhaseSkip extends TagPhaseBase {
  type: TagTypePhase.PhaseSkip;
}

/** Repeat an entire phase (The Gold Pocket Watch, Ultimate Sacrifice repeating the investigation phase). */
export interface TagPhaseRepeat extends TagPhaseBase {
  type: TagTypePhase.PhaseRepeat;
}

--- phase-skip (3 members) ---
MEMBER: The Gold Pocket Watch (02305) "Exceptional. | [reaction] When a phase begins, remove The Gold Pocket Watch from the game: Skip this phase. | [reaction] After a phase ends, remove The Gold Pocket Watch …"
MEMBER: A Watchful Peace (07269) "As an additional cost to play A Watchful Peace, search the chaos bag and/or cards in play for a total of 5 [bless] tokens and return them to the token pool. | Fast. Play …"
MEMBER: Deliverance (11079) "Fast. Play when the "draw encounter cards" step of the mythos phase would begin. | You draw each encounter card that would normally be drawn this mythos phase. Cards draw…"
RULING: Phase-manipulation EFFECTS (skip/repeat a phase) — Gold Pocket Watch. Future members: Deliverance, Ultimate Sacrifice. Distinct from timing-phase-* which are timing POINTS.

--- phase-repeat (2 members) ---
MEMBER: The Gold Pocket Watch (02305) "Exceptional. | [reaction] When a phase begins, remove The Gold Pocket Watch from the game: Skip this phase. | [reaction] After a phase ends, remove The Gold Pocket Watch …"
MEMBER: Ultimate Sacrifice (60480) "Fast. Play when the investigation phase ends. | Repeat the investigation phase. At the end of that phase, you are defeated and suffer 1 physical trauma. Max once per game…"

==== FILE: src/tags/play-area/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypePlayArea {
  PlayAreaToHand = "play-area-to-hand",
  PlayAreaToDeck = "play-area-to-deck",
  PlayAreaIntoPlayFromHand = "play-area-into-play-from-hand",
  PlayAreaIntoPlayFromDeck = "play-area-into-play-from-deck",
  PlayAreaIntoPlayFromDiscard = "play-area-into-play-from-discard",
  PlayAreaPlayFromOtherZone = "play-area-play-from-other-zone",
  PlayAreaFromInvestigator = "play-area-from-investigator",
  PlayAreaPlayIgnoringCost = "play-area-play-ignoring-cost",
}

interface TagPlayAreaBase extends TagBase {}

export interface TagPlayAreaToHand extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaToHand;
}

export interface TagPlayAreaToDeck extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaToDeck;
}

/** Put a card directly INTO play from hand, bypassing the normal play action/cost. */
export interface TagPlayAreaIntoPlayFromHand extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaIntoPlayFromHand;
}

/** Tutor a card directly into play from your deck. */
export interface TagPlayAreaIntoPlayFromDeck extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaIntoPlayFromDeck;
}

/** Put a card (or a copy) directly into play from a discard pile. */
export interface TagPlayAreaIntoPlayFromDiscard extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaIntoPlayFromDiscard;
}

/**
 * Play a card (paying its cost) from a zone other than your own hand, or let
 * another investigator play it. Distinct from the into-play "cheat" members
 * (which bypass the play action) and from recursion (return-to-hand-first).
 */
export interface TagPlayAreaPlayFromOtherZone extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaPlayFromOtherZone;
  zone: "discard" | "top-deck" | "other-hand" | "attached" | "set-aside";
}

/**
 * Put into play / use a card belonging to ANOTHER investigator — found in their deck
 * (Flare searches any investigator's deck for an Ally) or discard (A Chance Encounter plays
 * an Ally from any player's discard). The cross-deck "borrow a teammate's card" signal;
 * distinct from `deck-search-investigator` (which is helping a teammate dig their OWN deck).
 */
export interface TagPlayAreaFromInvestigator extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaFromInvestigator;
}

/**
 * Play a card WITHOUT paying its resource cost ("its resource cost is considered
 * paid" — Shining Trapezohedron). An Economy-compound member: mechanically distinct
 * from cost-discount (which reduces the price), this waives it. Ability-activation
 * cost waivers are action-activate-ignoring-cost instead.
 */
export interface TagPlayAreaPlayIgnoringCost extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaPlayIgnoringCost;
}

--- play-area-to-hand (21 members) ---
MEMBER: Magnifying Glass (01540) "Fast. | You get +1 [intellect] while investigating. | [free] If there are no clues on your location: Return Magnifying Glass to your hand."
MEMBER: Spirit-Speaker (03014) "Akachi Onyele deck only. | [free] Exhaust Spirit-Speaker: Choose an asset you control with "uses (charges)." Either return that asset to your hand, or move all charges fr…"
MEMBER: Sleight of Hand (03029) "Fast. Play only during your turn. | Put an [[Item]] asset into play from your hand. At the end of your turn, if that asset is still in play, return it to your hand."
…and 18 more: Calling in Favors (03158), The Chthonian Stone (04030), Library Docent (60220), Dexter Drake (07004), Sea Change Harpoon (07014), Silas's Net (07015), Lucky Dice (07307), …

--- play-area-to-deck (4 members) ---
MEMBER: Wendy's Amulet (01514) "Wendy Adams deck only. | You may play the topmost event in your discard pile as if it were in your hand. | <b>Forced</b> - After you play an event or discard an event fro…"
MEMBER: Glimpse the Void (11010) "<b>Revelation</b> - Put Glimpse the Void into play in your threat area. | The first time you reveal 1 or more chaos tokens during each skill test, you must reveal 1 addit…"
MEMBER: Library Pass (11118) "[[Miskatonic]], [[Scholar]] deck only. Permanent. Limit 1 per deck. | [fast] During your turn, if there is no asset attached to Library Pass, exhaust Library Pass: Attach…"
…and 1 more: Mirror Form (60465)

--- play-area-into-play-from-hand (55 members) ---
MEMBER: Old Book of Lore (01686) "Uses (2 secrets). | [action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of their deck for a card, draws…"
MEMBER: Joey "The Rat" Vigil (02265) "[free] Spend 1 resource: Choose an [[Item]] asset from your hand and play it (paying its cost)."
MEMBER: Ever Vigilant (03023) "One at a time, play up to 3 assets from your hand, reducing the resource cost of each by 1."
…and 52 more: Sleight of Hand (03029), Uncage the Soul (03033), Leo Anderson (04001), Unearth the Ancients (04024), Cryptic Writings (60215), Library Docent (60220), Cryptic Writings (60224), …
RULING: For cards ENTERING PLAY out-of-band (assets cheated in — Ever Vigilant, Sleight of Hand). EVENTS just PLAY — 'play another Easy Mark at no cost' is play-area-play-ignoring-cost, not into-play (events are never 'put into play'). A self-committing skill's 'put it into play' bookkeeping (Surprising Find) is also NOT this tag (ruled 2026-07-17).

--- play-area-into-play-from-deck (9 members) ---
MEMBER: Flare (02115) "Either (choose one): | - <b>Fight.</b> You get +3 [combat] and deal +2 damage for this attack. Exile Flare. | - Search the top 9 cards of any investigator's deck for an […"
MEMBER: Calling in Favors (03158) "Choose an [[Ally]] asset you control and return it to your hand. Then, search the top 9 cards of your deck for an [[Ally]] asset and play it, reducing its cost by X. X is…"
MEMBER: Dr. Elli Horowitz (04021) "[reaction] After Dr. Elli Horowitz enters play: Search the top 9 cards of your deck for a [[Relic]] asset and attach it to her. Shuffle your deck. | Each [[Relic]] asset …"
…and 6 more: The Council's Coffer (05196), Anna Kaslow (05283), Prepared for the Worst (09036), Dirty Deeds (10080), Eldritch Brand (11080), "For my next trick..." (12011)
RULING: For cards ENTERING PLAY out-of-band (assets cheated in — Ever Vigilant, Sleight of Hand). EVENTS just PLAY — 'play another Easy Mark at no cost' is play-area-play-ignoring-cost, not into-play (events are never 'put into play'). A self-committing skill's 'put it into play' bookkeeping (Surprising Find) is also NOT this tag (ruled 2026-07-17).

--- play-area-into-play-from-discard (6 members) ---
MEMBER: A Chance Encounter (02270) "Choose an [[Ally]] asset in any player's discard pile. Put that asset into play under your control. At the end of the round, if that asset is still in play, discard it."
MEMBER: A Chance Encounter (03238) "Choose an [[Ally]] asset with printed resource cost X in any player's discard pile. Put that asset into play under your control."
MEMBER: The Council's Coffer (05196) "Uses (1 [per_investigator] locks). If there are no locks on The Council's Coffer, each investigator searches his or her deck or discard pile for any card and immediately …"
…and 3 more: Hope (06031), Zeal (06032), Augur (06033)
RULING: For cards ENTERING PLAY out-of-band (assets cheated in — Ever Vigilant, Sleight of Hand). EVENTS just PLAY — 'play another Easy Mark at no cost' is play-area-play-ignoring-cost, not into-play (events are never 'put into play'). A self-committing skill's 'put it into play' bookkeeping (Surprising Find) is also NOT this tag (ruled 2026-07-17).

--- play-area-play-from-other-zone (27 members) ---
MEMBER: William Yorick (03005) "[reaction] After you defeat an enemy: Play an asset from your discard pile <i>(paying its cost)</i>. (Limit once per round.) | [elder_sign] effect: +2. If this test is su…"
MEMBER: Stick to the Plan (03264) "Permanent. Exceptional. | [reaction] Before you draw your opening hand: Search your deck for up to 3 different [[Tactic]] and/or [[Supply]] events, and attach them facedo…"
MEMBER: Eidetic Memory (03306) "Play Eidetic Memory as an exact copy of an [[Insight]] event in any investigator's discard pile <i>(including its resource cost)</i>. Remove that event from the game. Rem…"
…and 24 more: Improvised Weapon (04033), Winging It (04272), Impromptu Barrier (04312), Backpack (04037), Randall Cho (60102), Joe Diamond (05002), Twilight Blade (05013), …

--- play-area-from-investigator (8 members) ---
MEMBER: Flare (02115) "Either (choose one): | - <b>Fight.</b> You get +3 [combat] and deal +2 damage for this attack. Exile Flare. | - Search the top 9 cards of any investigator's deck for an […"
MEMBER: A Chance Encounter (02270) "Choose an [[Ally]] asset in any player's discard pile. Put that asset into play under your control. At the end of the round, if that asset is still in play, discard it."
MEMBER: Eidetic Memory (03306) "Play Eidetic Memory as an exact copy of an [[Insight]] event in any investigator's discard pile <i>(including its resource cost)</i>. Remove that event from the game. Rem…"
…and 5 more: A Chance Encounter (03238), Copycat (60330), "You owe me one!" (05319), Untimely Transaction (08051), Black Market (08055)

--- play-area-play-ignoring-cost (5 members) ---
MEMBER: Easy Mark (06026) "Myriad. | Gain 2 resources and draw 1 card. | [reaction] After you play Easy Mark: Play another Easy Mark from your hand, at no cost."
MEMBER: Shining Trapezohedron (06329) "[reaction] When you would pay the cost of a [[Spell]] card, exhaust Shining Trapezohedron: Instead, test [willpower] (X), where X is the card's resource cost. If you succ…"
MEMBER: Tristan Botley (07194) "[reaction] After your turn begins: Choose two skills. Until the start of your next turn, you get +1 to each of those skills. | [reaction] After any skill test ends in whi…"
…and 2 more: Motivational Speech (11116), Memories of Another Life (11125)
RULING: Play a card WITHOUT paying its resource cost ('its resource cost is considered paid' — Shining Trapezohedron 06329). Mechanically distinct from cost-discount (user ruling 2026-07-16) but an Economy compound member. Ability-cost waivers → action-activate-ignoring-cost.

==== FILE: src/tags/ready/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeReady {
  ReadySelf = "ready-self",
  ReadyAsset = "ready-asset",
  ReadyAlly = "ready-ally",
}

interface TagReadyBase extends TagBase {}

/** Ready (unexhaust) this card. */
export interface TagReadySelf extends TagReadyBase {
  type: TagTypeReady.ReadySelf;
}

/** Ready another asset. */
export interface TagReadyAsset extends TagReadyBase {
  type: TagTypeReady.ReadyAsset;
}

/** Ready an ally asset. */
export interface TagReadyAlly extends TagReadyBase {
  type: TagTypeReady.ReadyAlly;
}

--- ready-self (12 members) ---
MEMBER: Mauser C96 (60306) "Uses (5 ammo). | [action] Exhaust Mauser C96 and spend 1 ammo: <b>Fight.</b> You get +1 [combat] and deal +1 damage for this attack. If you succeed by 2 or more, either r…"
MEMBER: Mauser C96 (60321) "Uses (5 ammo). | [action] Exhaust Mauser C96 and spend 1 ammo: <b>Fight.</b> You get +2 [combat] and deal +1 damage for this attack. If you succeed by 2 or more, either r…"
MEMBER: Beretta M1918 (60331) "Uses (4 ammo). | [action] Exhaust Beretta M1918 and spend 1 ammo: <b>Fight.</b> You get +4 [combat] and deal +1 damage for this attack. If you succeed by 2 or more, eithe…"
…and 9 more: Eye of the Djinn (07225), Jacob Morrison (07309), Ceremonial Sickle (09096), Dowsing Rod (09097), Onyx Pentacle (09098), Mariner's Compass (10122), Luger P08 (11050), …

--- ready-asset (4 members) ---
MEMBER: Galvanize (60121) "Fast. Play only during your turn. | Ready a [guardian] asset you control. You may take an additional action during your turn, which can only be used to fight."
MEMBER: Sin-Eater (09094) "Permanent. Exceptional. | [fast] Exhaust Sin-Eater: Move 1 doom from an asset you control to Sin-Eater. Then, either ready that asset or place 1 charge on it. | [action]:…"
MEMBER: Fine Tuning (10054) "Attach to a [[Tool]] or [[Science]] asset you control. Limit 1 per asset. | [reaction] After attached asset exhausts, exhaust Fine Tuning: Ready attached asset."
…and 1 more: Bulwark (11028)

--- ready-ally (4 members) ---
MEMBER: Inspiring Presence (03228) "If this skill test is successful, ready an [[Ally]] asset at your location and heal 1 damage or 1 horror from it."
MEMBER: Charlie Kane (09018) "You have 3 additional ally slots. | [fast] During a skill test you are performing, exhaust an [[Ally]] asset you control: For this test, you get +1 skill value, plus an a…"
MEMBER: Bonnie Walsh (09019) "Charlie Kane deck only. | [reaction] After you exhaust Bonnie Walsh: Ready another [[Ally]] asset you control. (Limit once per round.)"
…and 1 more: Inspiring Presence (11029)

==== FILE: src/tags/recursion/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeRecursion {
  RecursionAsset = "recursion-asset",
  RecursionEvent = "recursion-event",
  RecursionSkill = "recursion-skill",
  RecursionPlayFromDiscard = "recursion-play-from-discard",
  RecursionSelfToHand = "recursion-self-to-hand",
  RecursionReplay = "recursion-replay",
}

interface TagRecursionBase extends TagBase {}

export interface TagRecursionAsset extends TagRecursionBase {
  type: TagTypeRecursion.RecursionAsset;
}

export interface TagRecursionEvent extends TagRecursionBase {
  type: TagTypeRecursion.RecursionEvent;
}

export interface TagRecursionSkill extends TagRecursionBase {
  type: TagTypeRecursion.RecursionSkill;
}

/**
 * Play/resolve a card DIRECTLY from the discard pile (not first returned to
 * hand). The graveyard-value archetype.
 */
export interface TagRecursionPlayFromDiscard extends TagRecursionBase {
  type: TagTypeRecursion.RecursionPlayFromDiscard;
}

/**
 * A card returns ITSELF to hand instead of being discarded (often gated on
 * succeed-by), enabling repeated reuse.
 */
export interface TagRecursionSelfToHand extends TagRecursionBase {
  type: TagTypeRecursion.RecursionSelfToHand;
}

/**
 * Replay an event in place / resolve an ability an extra time ("play that event
 * again as if it were in your hand"). Distinct from RecursionEvent (returns
 * from discard).
 */
export interface TagRecursionReplay extends TagRecursionBase {
  type: TagTypeRecursion.RecursionReplay;
}

--- recursion-asset (7 members) ---
MEMBER: William Yorick (03005) "[reaction] After you defeat an enemy: Play an asset from your discard pile <i>(paying its cost)</i>. (Limit once per round.) | [elder_sign] effect: +2. If this test is su…"
MEMBER: Well-Maintained (05152) "Fast. Play only during your turn. | Attach to an [[Item]] asset you control. Limit 1 per asset. | [reaction] After attached asset is discarded: Return it to its owner's h…"
MEMBER: Zeal (06032) "Bonded (Miss Doyle). Fast. | <b>Forced</b> - After Zeal enters play: Discard Hope and Augur. | [action] If Zeal is ready, exhaust or discard her: <b>Fight.</b> Fight with…"
…and 4 more: Scavenging (06332), Protecting the Anirniq (08102), Salvage (09116), Mob Connections (11059)
RULING: Recursion = playing/retrieving from a non-hand zone (discard, deck, exile). A card played normally from HAND — even on a special trigger like 'when you draw it' (Cryptic Writings) — is not recursion.

--- recursion-event (3 members) ---
MEMBER: The Painted World (03012) "Sefina Rousseau deck only. | Cannot be placed beneath Sefina Rousseau. | Play The Painted World as an exact copy of a non-exceptional event that is beneath Sefina Roussea…"
MEMBER: Nathaniel Cho (60101) "[reaction] When you deal damage to an enemy by an event or a fight ability on an event: Deal 1 additional damage. (Limit once per phase.) | [elder_sign] effect: +1. If th…"
MEMBER: The Book of War (11020) "Uses (3 secrets). | [reaction] After you play a [[Tactic]] event, spend 1 secret and exhaust The Book of War: When your turn ends, return that event to your hand."
RULING: Recursion = playing/retrieving from a non-hand zone (discard, deck, exile). A card played normally from HAND — even on a special trigger like 'when you draw it' (Cryptic Writings) — is not recursion.

--- recursion-skill (17 members) ---
MEMBER: Try and Try Again (02309) "[reaction] After a skill test is failed, if a skill card you own is committed to that test, exhaust Try and Try Again: Return that skill card to your hand."
MEMBER: Minh Thi Phan (03002) "[reaction] After an investigator at your location commits a card to a skill test: That card gains a [wild] icon until the end of the test. (Limit once for each investigat…"
MEMBER: True Survivor (03273) "Return 3 [[Innate]] skills from your discard pile to your hand."
…and 14 more: Try and Try Again (04159), Winifred Habbamock (60301), Grisly Totem (05195), Practice Makes Perfect (06197), Amanda Sharpe (07002), Silas Marsh (07005), Sea Change Harpoon (07014), …
RULING: Recursion = playing/retrieving from a non-hand zone (discard, deck, exile). A card played normally from HAND — even on a special trigger like 'when you draw it' (Cryptic Writings) — is not recursion.

--- recursion-play-from-discard (16 members) ---
MEMBER: Wendy's Amulet (01514) "Wendy Adams deck only. | You may play the topmost event in your discard pile as if it were in your hand. | <b>Forced</b> - After you play an event or discard an event fro…"
MEMBER: Eidetic Memory (03306) "Play Eidetic Memory as an exact copy of an [[Insight]] event in any investigator's discard pile <i>(including its resource cost)</i>. Remove that event from the game. Rem…"
MEMBER: Improvised Weapon (04033) "You may play Improvised Weapon from your discard pile. If you do, shuffle it into your deck after resolving its effects. | <b>Fight.</b> The attacked enemy gets -1 fight …"
…and 13 more: Winging It (04272), Impromptu Barrier (04312), De Vermis Mysteriis (05235), Moonstone (06203), A Glimmer of Hope (06245), Uncage the Soul (09095), Improvised Shield (09103), …
RULING: Recursion = playing/retrieving from a non-hand zone (discard, deck, exile). A card played normally from HAND — even on a special trigger like 'when you draw it' (Cryptic Writings) — is not recursion.

--- recursion-self-to-hand (22 members) ---
MEMBER: Opportunist (01553) "Commit only to a skill test you are performing. | If you succeed by 3 or more, return Opportunist to your hand after this test instead of discarding it."
MEMBER: Opportunist (02231) "Commit only to a skill test you are performing. | If you succeed by 2 or more, return Opportunist to your hand after this test instead of discarding it."
MEMBER: Arrogance (60303) "You must commit Arrogance to each eligible skill test you perform. | This skill's icons subtract from your skill value instead of adding to it. | If this test succeeds, r…"
…and 19 more: Reckless (60304), Opportunist (60319), Cheap Shot (60323), Slip Away (60324), Pilfer (60328), Backstab (60329), Unexpected Courage (60526), …
RULING: Recursion = playing/retrieving from a non-hand zone (discard, deck, exile). A card played normally from HAND — even on a special trigger like 'when you draw it' (Cryptic Writings) — is not recursion.

--- recursion-replay (2 members) ---
MEMBER: Dayana Esperence (05279) "Uses (3 secrets). | [fast]: Attach a non-weakness [[Spell]] event from your hand to Dayana Esperence. Limit 1 event attached to her. | The attached event may be played as…"
MEMBER: Double, Double (05320) "Exceptional. | [reaction] After you play an event, exhaust Double, Double: Play that event again as if it were in your hand."
RULING: Recursion = playing/retrieving from a non-hand zone (discard, deck, exile). A card played normally from HAND — even on a special trigger like 'when you draw it' (Cryptic Writings) — is not recursion.

==== FILE: src/tags/remote/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeRemote {
  RemoteInvestigate = "remote-investigate",
  RemoteMove = "remote-move",
  RemotePlayEvent = "remote-play-event",
}

interface TagRemoteBase extends TagBase {}

/** Investigate a location other than your own ("as if you were there"). */
export interface TagRemoteInvestigate extends TagRemoteBase {
  type: TagTypeRemote.RemoteInvestigate;
}

/** Move to any revealed location, not just a connecting one (teleport-style). */
export interface TagRemoteMove extends TagRemoteBase {
  type: TagTypeRemote.RemoteMove;
}

/**
 * Play an EVENT as if you were at another location (Luke Robinson's "as if you
 * were at a connecting location"). Becomes common from Chapter 2 (Miguel de la
 * Cruz) — the event-play member of the remote family.
 */
export interface TagRemotePlayEvent extends TagRemoteBase {
  type: TagTypeRemote.RemotePlayEvent;
}

--- remote-investigate (7 members) ---
MEMBER: In the Know (03027) "Uses (3 secrets). | [action] Spend 1 secret: <b>Investigate.</b> Investigate any revealed location in play as if you were at that location."
MEMBER: Sixth Sense (05158) "[action]: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. If a [skull], [cultist], [tablet], or [elder_thing] symbol is revealed during this tes…"
MEMBER: Sixth Sense (05322) "[action]: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. You get +2 [willpower] for this investigation. If a [skull], [cultist], [tablet], or […"
…and 4 more: Trish Scarborough (07003), Pocket Telescope (08097), Glassing (60563), Local Map (12033)

--- remote-move (15 members) ---
MEMBER: Elusive (01550) "Fast. Play only during your turn. | Disengage from each enemy engaged with you and move to a revealed location with no enemies."
MEMBER: Cheat Death (03310) "Fast. Play when you would be defeated. | Disengage from each enemy engaged with you, discard all cards in your threat area, heal 2 horror and 2 damage, and move to any re…"
MEMBER: Astral Travel (03034) "<b>Move.</b> Move to any revealed location and reveal a random token from the chaos bag. If you reveal a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbo…"
…and 12 more: Esoteric Atlas (60222), Astral Travel (60413), Esoteric Atlas (05232), Gate Box (06013), Pendant of the Queen (06022), Fang of Tyr'thrha (08029), Join the Caravan (08036), …

--- remote-play-event (2 members) ---
MEMBER: Luke Robinson (06004) "You begin the game with Gate Box in play. | You may play one event each turn as if you were at a connecting location and engaged with each enemy at that location. | [elde…"
MEMBER: Miguel's Knapsack (60552) "Miguel de la Cruz deck only. | [reaction] When you play an event, exhaust Miguel's Knapsack: Either play that event at a connecting location as if you were at that locati…"
RULING: Play an event as if at another location (Luke Robinson 06004). Becomes common in Chapter 2 (Miguel de la Cruz) — per user 2026-07-16.

==== FILE: src/tags/rfg/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeRfg {
  RfgSelf = "rfg-self",
}

interface TagRfgBase extends TagBase {}

/**
 * Remove from the game as a self-effect/cost: gone for the rest of the scenario
 * and NOT repurchasable (distinct from exile, which is a campaign/deckbuilding cost).
 */
export interface TagRfgSelf extends TagRfgBase {
  type: TagTypeRfg.RfgSelf;
}

--- rfg-self (24 members) ---
MEMBER: Lucky Dice (02230) "Exceptional. | [reaction] When you reveal a non-[auto_fail] chaos token, spend 2 resources: Ignore that chaos token and reveal another one to resolve. If that token has a…"
MEMBER: The Gold Pocket Watch (02305) "Exceptional. | [reaction] When a phase begins, remove The Gold Pocket Watch from the game: Skip this phase. | [reaction] After a phase ends, remove The Gold Pocket Watch …"
MEMBER: The Painted World (03012) "Sefina Rousseau deck only. | Cannot be placed beneath Sefina Rousseau. | Play The Painted World as an exact copy of a non-exceptional event that is beneath Sefina Roussea…"
…and 21 more: Eidetic Memory (03306), Cheat Death (03310), Quantum Flux (03196), Seal of the Elder Sign (03312), Seal of the Seventh Sign (04311), Unsolved Case (05010), Lodge "Debts" (05012), …

==== FILE: src/tags/skill-commit/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeSkillCommit {
  SkillCommitGainIcon = "skill-commit-gain-icon",
  SkillCommitDoubleIcon = "skill-commit-skill-double-icon",
  SkillCommitWildIcon = "skill-commit-nonskill-lv0-wild-icon",
  SkillCommitTwoEffectiveIcons = "skill-commit-nonskill-lv0-two-effective-icons",
  SkillCommitNoIcons = "skill-commit-no-commit-icons",
}

interface TagSkillCommitBase extends TagBase {}

/**
 * A committed card GAINS extra skill icons (often [wild]), frequently scaling
 * off a variable (charges spent, enemies engaged), or a support asset adds an
 * icon to an already-committed card. Distinct from skill-value margin tags and
 * from boost (which raise the investigator's value, not committed icons).
 */
export interface TagSkillCommitGainIcon extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitGainIcon;
}

/** A skill card that commits 2 matching icons (Overpower, Perception, Manual Dexterity, Guts, Unexpected Courage) — the strong basic-skill group. Stat-derived from printed icons. */
export interface TagSkillCommitDoubleIcon extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitDoubleIcon;
}

/**
 * A NON-SKILL, LEVEL-0 card that carries a WILD commit icon — genuinely special, since
 * a level-0 asset/event you'd usually rather play instead doubles as a flexible commit.
 * (Wild icons on higher-level cards are common and unremarkable, so they are NOT tagged.)
 * Stat-derived from printed icons + level + type.
 */
export interface TagSkillCommitWildIcon extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitWildIcon;
}

/**
 * A NON-SKILL, LEVEL-0 card with TWO effective commit icons (a wild counts as one) — a
 * level-0 asset/event that can stand in for a neutral skill card when committed. E.g.
 * "Look what I found!" (intellect + intellect), Cunning Distraction (willpower + wild).
 * Stat-derived from printed icons + level + type.
 */
export interface TagSkillCommitTwoEffectiveIcons extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitTwoEffectiveIcons;
}

/**
 * An EVENT with NO printed commit icons at all — rare and notable, since you can never
 * commit it to a skill test (its only use is to play it). Stat-derived from printed icons
 * + type. (Most assets lack icons and are unremarkable, so this is scoped to events.)
 */
export interface TagSkillCommitNoIcons extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitNoIcons;
}

--- skill-commit-gain-icon (48 members) ---
MEMBER: Leadership (02260) "While Leadership is committed to a skill test being performed by another investigator, Leadership gains [willpower] [wild]."
MEMBER: Minh Thi Phan (03002) "[reaction] After an investigator at your location commits a card to a skill test: That card gains a [wild] icon until the end of the test. (Limit once for each investigat…"
MEMBER: Torrent of Power (03235) "As an additional cost to commit Torrent of Power to a skill test, spend up to 3 charges from among assets you control. | For each charge spent in this way, Torrent of Pow…"
…and 45 more: "Not without a fight!" (03272), Steadfast (05022), Curiosity (05026), Cunning (05030), Prophesy (05034), Able Bodied (05038), Grisly Totem (05119), …

--- skill-commit-skill-double-icon (57 members) ---
MEMBER: Guts (01589) "Max 1 committed per skill test. | If this test is successful, draw 1 card."
MEMBER: Perception (01590) "Max 1 committed per skill test. | If this test is successful, draw 1 card."
MEMBER: Overpower (01591) "Max 1 committed per skill test. | If this test is successful, draw 1 card."
…and 54 more: Manual Dexterity (01592), Unexpected Courage (01593), Deduction (02150), Rise to the Occasion (02192), Inquiring Mind (02227), Survival Instinct (02235), Fearless (02268), …

--- skill-commit-nonskill-lv0-wild-icon (43 members) ---
MEMBER: Ward of Protection (01565) "Fast. Play when you draw a non-weakness treachery card. | Cancel that card's revelation effect. Then, take 1 horror."
MEMBER: Rabbit's Foot (01575) "[reaction] After you fail a skill test, exhaust Rabbit's Foot: Draw 1 card."
MEMBER: Cunning Distraction (01578) "<b>Evade.</b> Automatically evade all enemies at your location."
…and 40 more: Teamwork (02018), Strange Solution (02021), No Stone Unturned (03026), Guidance (03265), Daring Maneuver (03030), Quantum Flux (03196), Live and Learn (04200), …
RULING: STAT-DERIVED: cardType ∈ {asset,event} AND level === 0 EXACTLY AND icons include wild. A card with UNDEFINED level (Search for the Truth) is NOT level 0.

--- skill-commit-nonskill-lv0-two-effective-icons (53 members) ---
MEMBER: Evidence! (01522) "Fast. Play after you defeat an enemy. | Discover 1 clue at your location."
MEMBER: Working a Hunch (01537) "Fast. Play only during your turn. | Discover 1 clue at your location."
MEMBER: Cunning Distraction (01578) "<b>Evade.</b> Automatically evade all enemies at your location."
…and 50 more: "Look what I found!" (01579), Oops! (02113), "I'm outta here!" (02151), "I'll see you in hell!" (03189), Logical Reasoning (03191), Narrow Escape (03267), Uncage the Soul (03033), …
RULING: STAT-DERIVED: cardType ∈ {asset,event} AND level === 0 AND max(count of ONE skill's icons) + wild ≥ 2. Two DIFFERENT icons (willpower+combat) do NOT qualify (Taunt, Physical Training were over-tagged by the old icons.length rule). Use rederive-icons-scoped.ts — derive-stat-tags-all.ts still has the old buggy rules.

--- skill-commit-no-commit-icons (52 members) ---
MEMBER: Cryptic Research (01543) "Fast. Play only during your turn. | Choose an investigator at your location. That investigator draws 3 cards."
MEMBER: Sure Gamble (01556) "Fast. Play after you reveal a chaos token with a negative modifier. | Switch that token's "-" to a "+"."
MEMBER: Lucky! (01580) "Fast. Play when you would fail a skill test. | Get +2 to your skill value for that test."
…and 49 more: Lucky! (01584), Emergency Cache (01588), Emergency Cache (01693), Delve Too Deep (02111), Emergency Cache (02194), Ace in the Hole (02266), Time Warp (03311), …

==== FILE: src/tags/skill-test-condition/main.ts ====
import { TagBase } from "../../base.js";

// Conditions related to skill test results
export enum TagTypeSkillTestCondition {
  SkillTestConditionSuccessful = "skill-test-condition-successful",
  SkillTestConditionFail = "skill-test-condition-fail",
  SkillTestConditionSuccessfulDuringAnAttack = "skill-test-condition-successful-during-an-attack",
  SkillTestConditionSuccessfulDuringAnEvade = "skill-test-condition-successful-during-an-evade",
}

interface TagSkillTestConditionBase extends TagBase {}

export interface TagSkillTestConditionSuccessful extends TagSkillTestConditionBase {
  type: TagTypeSkillTestCondition.SkillTestConditionSuccessful;
}

export interface TagSkillTestConditionFail extends TagSkillTestConditionBase {
  type: TagTypeSkillTestCondition.SkillTestConditionFail;
}

export interface TagSkillTestConditionSuccessfulDuringAnAttack extends TagSkillTestConditionBase {
  type: TagTypeSkillTestCondition.SkillTestConditionSuccessfulDuringAnAttack;
}

/** Fires on a successful test performed during an EVADE — the symmetric sibling of skill-test-condition-successful-during-an-attack. */
export interface TagSkillTestConditionSuccessfulDuringAnEvade extends TagSkillTestConditionBase {
  type: TagTypeSkillTestCondition.SkillTestConditionSuccessfulDuringAnEvade;
}

--- skill-test-condition-successful (198 members) ---
MEMBER: Medical Texts (01535) "[action] Choose an investigator at your location and test [intellect] (2). If you succeed, heal 1 damage from that investigator. If you fail, deal 1 damage to that invest…"
MEMBER: Deduction (01539) "If this skill test is successful while investigating a location, discover 1 additional clue at that location."
MEMBER: Burglary (01545) "[action] Exhaust Burglary: <b>Investigate.</b> If you succeed, instead of discovering clues, gain 3 resources."
…and 195 more: Blinding Light (01566), Fearless (01567), Blinding Light (01569), Survival Instinct (01581), Guts (01589), Perception (01590), Overpower (01591), …
RULING: Skill cards do not use timing tags; their 'if this test succeeds/fails' effects use these tags.
RULING: Conditional-upgrade values tag BOTH numbers: 'draw 1 (2 instead if you succeed by 2+)' → deck-draw-you value:1 AND value:2 (Perception 60228, Guts 60424, Overpower 60126, Manual Dexterity 60325 all fixed to match Deduction/Fearless/Vicious Blow).

--- skill-test-condition-fail (40 members) ---
MEMBER: Medical Texts (01535) "[action] Choose an investigator at your location and test [intellect] (2). If you succeed, heal 1 damage from that investigator. If you fail, deal 1 damage to that invest…"
MEMBER: Liquid Courage (02024) "Uses (4 supplies). | [action] Spend 1 supply: Choose an investigator at your location to heal 1 horror. Then, that investigator tests [willpower] (2). If the test succeed…"
MEMBER: Bind Monster (02031) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed and the enemy is non‑[[Elite]], evade it and attach Bind Monster to it. | [reacti…"
…and 37 more: Take Heart (04201), Reckless (60304), Liquid Courage (60320), Neither Rain nor Snow (60502), .18 Derringer (60505), Take Heart (60519), .18 Derringer (60522), …
RULING: Skill cards do not use timing tags; their 'if this test succeeds/fails' effects use these tags.
RULING: Conditional-upgrade values tag BOTH numbers: 'draw 1 (2 instead if you succeed by 2+)' → deck-draw-you value:1 AND value:2 (Perception 60228, Guts 60424, Overpower 60126, Manual Dexterity 60325 all fixed to match Deduction/Fearless/Vicious Blow).

--- skill-test-condition-successful-during-an-attack (39 members) ---
MEMBER: Vicious Blow (01525) "If this skill test is successful during an attack, that attack deals +1 damage."
MEMBER: Kukri (02036) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. If you succeed, you may spend 1 additional action to deal +1 damage for this attack."
MEMBER: Vicious Blow (02299) "If this skill test is successful during an attack, that attack deals +1 damage (+2 damage instead if it succeeds by 2 or more)."
…and 36 more: Monster Slayer (02300), The Home Front (03007), Storm of Spirits (03153), Marksmanship (04104), Flamethrower (04305), Stunning Blow (04112), Nathaniel Cho (60101), …
RULING: Skill cards do not use timing tags; their 'if this test succeeds/fails' effects use these tags.
RULING: Conditional-upgrade values tag BOTH numbers: 'draw 1 (2 instead if you succeed by 2+)' → deck-draw-you value:1 AND value:2 (Perception 60228, Guts 60424, Overpower 60126, Manual Dexterity 60325 all fixed to match Deduction/Fearless/Vicious Blow).

--- skill-test-condition-successful-during-an-evade (32 members) ---
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Survival Instinct (01581) "If this skill test is successful during an evasion attempt, the evading investigator may immediately disengage from each other enemy engaged with him or her, and may move…"
…and 29 more: Bait and Switch (02034), Fire Extinguisher (02114), Survival Instinct (02235), Hatchet Man (04155), Mists of R'lyeh (04029), Mists of R'lyeh (04271), Ineffable Truth (60409), …
RULING: Skill cards do not use timing tags; their 'if this test succeeds/fails' effects use these tags.
RULING: Conditional-upgrade values tag BOTH numbers: 'draw 1 (2 instead if you succeed by 2+)' → deck-draw-you value:1 AND value:2 (Perception 60228, Guts 60424, Overpower 60126, Manual Dexterity 60325 all fixed to match Deduction/Fearless/Vicious Blow).

==== FILE: src/tags/skill-value/main.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeSkillValue {
  SkillValueSucceedByDynamic = "skill-value-succeed-by-dynamic",
  SkillValueSucceedByOrMore = "skill-value-succeed-by-or-more",
  SkillValueFailByOrLess = "skill-value-fail-by-or-less",
  SkillValueFailByOrMore = "skill-value-fail-by-or-more",
  SkillValueFailByDynamic = "skill-value-fail-by-dynamic",
  SkillValueSucceedByExactly = "skill-value-succeed-by-exactly",
  SkillValueFailByExactly = "skill-value-fail-by-exactly",
}

interface TagSkillValueBase extends TagBase {}

export interface TagSkillValueSucceedByDynamic extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueSucceedByDynamic;
}

export interface TagSkillValueSucceedByOrMore extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueSucceedByOrMore;
  amount: DynamicValue;
}

export interface TagSkillValueFailByOrLess extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByOrLess;
  amount: DynamicValue;
}

export interface TagSkillValueFailByOrMore extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByOrMore;
  amount: DynamicValue;
}

export interface TagSkillValueFailByDynamic extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByDynamic;
}

export interface TagSkillValueSucceedByExactly extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueSucceedByExactly;
  amount: DynamicValue;
}

export interface TagSkillValueFailByExactly extends TagSkillValueBase {
  type: TagTypeSkillValue.SkillValueFailByExactly;
  amount: DynamicValue;
}

--- skill-value-succeed-by-dynamic (25 members) ---
MEMBER: Archaic Glyphs (03192) "Researched. Uses (3 charges). | [action] Spend 1 charge: <b>Investigate.</b> For every 2 points you succeed by, discover 1 additional clue at your location."
MEMBER: Alchemical Transmutation (03032) "Uses (3 charges). | [action] Exhaust Alchemical Transmutation, spend 1 charge: Test [willpower] (1). For each point you succeed by, gain 1 resource (to a maximum of 3). I…"
MEMBER: Feed the Mind (04267) "Uses (3 secrets). | [action] Exhaust Feed the Mind and spend 1 secret: Test [intellect] (0). For each point you succeed by, draw 1 card. Then, take 1 horror for each card…"
…and 22 more: All In (04309), Impromptu Barrier (04312), Feed the Mind (60209), Winifred Habbamock (60301), Nimble (60317), Lucky Cigarette Case (60326), .45 Thompson (05187), …
RULING: Margin-only riders ('succeed by N or more', 'fail by N or less') get skill-value-* ONLY — never skill-test-condition-successful/fail alongside. The margin already implies the result.

--- skill-value-succeed-by-or-more (86 members) ---
MEMBER: Switchblade (01544) "Fast. | [action]: <b>Fight.</b> If you succeed by 2 or more, this attack deals +1 damage."
MEMBER: .41 Derringer (01547) "Uses (3 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +2 [combat] for this attack. If you succeed by 2 or more, this attack deals +1 damage."
MEMBER: Opportunist (01553) "Commit only to a skill test you are performing. | If you succeed by 3 or more, return Opportunist to your hand after this test instead of discarding it."
…and 83 more: Scavenging (01573), Lockpicks (01687), .41 Derringer (01688), .41 Derringer (01688), Deduction (02150), Switchblade (02152), Quick Thinking (02229), …
RULING: Margin-only riders ('succeed by N or more', 'fail by N or less') get skill-value-* ONLY — never skill-test-condition-successful/fail alongside. The margin already implies the result.

--- skill-value-fail-by-or-less (11 members) ---
MEMBER: "Look what I found!" (01579) "Fast. Play after you fail a skill test by 2 or less while investigating. | Discover 2 clues in your location."
MEMBER: Oops! (02113) "Fast. Play after you fail a skill test by 2 or less while attacking an enemy engaged with you. | Deal this attack's damage to a different enemy at your location."
MEMBER: Dumb Luck (04034) "Fast. Play after you fail a skill test by 2 or less during an evasion attempt against a non-[[Elite]] enemy. | Place that enemy on top of the encounter deck."
…and 8 more: Dumb Luck (60514), "Look what I found!" (60517), Oops! (60518), "Look what I found!" (60524), Dumb Luck (60525), Lab Coat (09050), "Look what I found!" (12078), …
RULING: Margin-only riders ('succeed by N or more', 'fail by N or less') get skill-value-* ONLY — never skill-test-condition-successful/fail alongside. The margin already implies the result.

--- skill-value-fail-by-or-more (2 members) ---
MEMBER: Precious Memento (08115) "Limit 1 Precious Memento <i>(From a Future Life)</i> per deck. | [reaction] After you fail a skill test by 2 or more, exhaust Precious Memento: Heal 1 horror from it. | […"
MEMBER: Empirical Hypothesis (09041) "Customizable. Limit 1 per investigator. | <b>Forced</b> - At the start of the round: Choose one of the following criteria for this round | - You fail a test by 2 or more.…"
RULING: Margin-only riders ('succeed by N or more', 'fail by N or less') get skill-value-* ONLY — never skill-test-condition-successful/fail alongside. The margin already implies the result.

--- skill-value-fail-by-dynamic (3 members) ---
MEMBER: Esoteric Method (10055) "After this skill test ends, add 1 [curse] token to the chaos bag for each point the performing investigator either succeeded or failed by."
MEMBER: Lethal Curiosity (60254) "<b>Revelation</b> - Test [willpower] (4). For each point you fail by, you must either take 1 damage or place 1 of your clues on your location."
MEMBER: Rabbit's Foot (50010) "[reaction] After you fail a skill test, exhaust Rabbit's Foot: Search the top X cards of your deck for a card, draw it, and shuffle the remaining cards into your deck. X …"
RULING: Margin-only riders ('succeed by N or more', 'fail by N or less') get skill-value-* ONLY — never skill-test-condition-successful/fail alongside. The margin already implies the result.

--- skill-value-succeed-by-exactly (27 members) ---
MEMBER: Crystal Pendulum (60411) "You get +1 [willpower]. | [reaction] After a skill test at your location begins, exhaust Crystal Pendulum: Name a number. If this test succeeds by that number or fails by…"
MEMBER: Brand of Cthugha (08090) "Uses (6 charges). | [action]: <b>Fight.</b> For this attack, you may use [willpower] instead of [combat], and you get +1 skill value. If you succeed, spend 1 or 2 charges…"
MEMBER: Brand of Cthugha (08092) "Uses (9 charges). | [action]: <b>Fight.</b> For this attack, you may use [willpower] instead of [combat], and you get +2 skill value. If you succeed, spend 1, 2, or 3 cha…"
…and 24 more: Divination (08101), Divination (08103), Blur (08109), Blur (08111), Earthly Serenity (08117), Earthly Serenity (08119), Katana (10021), …
RULING: Margin-only riders ('succeed by N or more', 'fail by N or less') get skill-value-* ONLY — never skill-test-condition-successful/fail alongside. The margin already implies the result.

--- skill-value-fail-by-exactly (2 members) ---
MEMBER: Crystal Pendulum (60411) "You get +1 [willpower]. | [reaction] After a skill test at your location begins, exhaust Crystal Pendulum: Name a number. If this test succeeds by that number or fails by…"
MEMBER: Chemistry Set (10040) "[action] Exhaust Chemistry Set: <b>Investigate.</b> If you... | - ...fail by exactly 2, discard Chemistry Set. | - ...succeed by exactly 0, gain 2 resources. | - ...succe…"
RULING: Margin-only riders ('succeed by N or more', 'fail by N or less') get skill-value-* ONLY — never skill-test-condition-successful/fail alongside. The margin already implies the result.

==== FILE: src/tags/skill-value/source.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeSkillValueSource {
  SkillValueFromResource = "skill-value-from-resource",
}

interface TagSkillValueSourceBase extends TagBase {
  /**
   * The denominator: skill value gains +1 for every `per` resources held
   * (e.g. "+1 skill value for every 5 resources" => per = 5).
   */
  per: number;
}

/**
 * Skill value scales off the resources you HOLD (not spend), e.g.
 * "+1 skill value for every 5 resources" or base value "equal to half your
 * resources". Distinct from StatsModPumpResource (per resource SPENT) and from
 * flat boosts.
 */
export interface TagSkillValueFromResource extends TagSkillValueSourceBase {
  type: TagTypeSkillValueSource.SkillValueFromResource;
}

--- skill-value-from-resource (5 members) ---
MEMBER: Well Connected (05028) "Limit 1 per investigator. | [fast] Exhaust Well Connected: You get +1 skill value for this skill test for every 5 resources you have."
MEMBER: Money Talks (05029) "Fast. Play when you initiate a skill test. | Instead of the skill type indicated for this test ([willpower], [intellect], [combat], or [agility]), this is a resource skil…"
MEMBER: Money Talks (08054) "Fast. Play when an investigator at any location initiates a skill test. | Instead of the skill type indicated for this test ([willpower], [intellect], [combat], or [agili…"
…and 2 more: Well Connected (60381), Well Connected (54006)
RULING: Margin-only riders ('succeed by N or more', 'fail by N or less') get skill-value-* ONLY — never skill-test-condition-successful/fail alongside. The margin already implies the result.

==== FILE: src/tags/slot/additional.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeSlotAdditional {
  SlotAdditional = "slot-additional",
  SlotAdditionalAccessory = "slot-additional-accessory",
  SlotAdditionalAlly = "slot-additional-ally",
  SlotAdditionalArcane = "slot-additional-arcane",
  SlotAdditionalHand = "slot-additional-hand",
  SlotAdditionalTarot = "slot-additional-tarot",
}

interface TagSlotAdditionalBase extends TagBase {
  /**
   * Some extra-slot cards lock the slot to a trait ("2 additional hand slots,
   * only for Tome assets" — Daisy's Tote Bag). The trait is an optional filter
   * on top of the searchable "extra slot".
   */
  restrictedToTrait?: string;
}

export interface TagSlotAdditional extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditional;
}

export interface TagSlotAdditionalAccessory extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalAccessory;
}

export interface TagSlotAdditionalAlly extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalAlly;
}

export interface TagSlotAdditionalArcane extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalArcane;
}

export interface TagSlotAdditionalHand extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalHand;
}

export interface TagSlotAdditionalTarot extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalTarot;
}

--- slot-additional (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- slot-additional-accessory (6 members) ---
MEMBER: Relic Hunter (01695) "Permanent. | You have 1 additional accessory slot."
MEMBER: Relic Hunter (02157) "Permanent. | You have 1 additional accessory slot."
MEMBER: Hidden Pocket (09065) "Fast. Play only during your turn. | Attach to a [[Clothing]] or [[Armor]] asset you control. | Attached asset gains: "You have 1 additional hand or accessory slot (your c…"
…and 3 more: Occult Reliquary (10132), Occult Reliquary (10132), Relic Hunter (12096)

--- slot-additional-ally (7 members) ---
MEMBER: Charisma (01694) "Permanent. | You have 1 additional ally slot."
MEMBER: Charisma (02158) "Permanent. | You have 1 additional ally slot."
MEMBER: Mitch Brown (04006) "Leo Anderson deck only. | You have 2 additional ally slots, which can only be used to hold non-unique allies."
…and 4 more: Miskatonic Archaeology Funding (60232), Rod of Animalism (08128), Charlie Kane (09018), Charisma (12095)

--- slot-additional-arcane (12 members) ---
MEMBER: Book of Shadows (01570) "You have 1 additional arcane slot. | [action] Exhaust Book of Shadows: Add 1 charge to a [[Spell]] asset you control."
MEMBER: Familiar Spirit (60410) "You have 1 additional arcane slot, which can only be used to hold a [[Spell]] asset."
MEMBER: Sign Magick (05112) "Fast. | You have 1 additional arcane slot, which can only be used to hold a [[Spell]] or [[Ritual]] asset."
…and 9 more: Sign Magick (05112), Dragon Pole (08060), Binder's Jar (09089), Occult Reliquary (10132), Occult Reliquary (10132), Arcane Experience (60478), The Hierophant • V (54007), …

--- slot-additional-hand (15 members) ---
MEMBER: Daisy's Tote Bag (01508) "Daisy Walker deck only. | You have 2 additional hand slots, which can only be used to hold [[Tome]] assets."
MEMBER: Bandolier (02147) "You have 1 additional hand slot, which can only be used to hold a [[Weapon]] asset."
MEMBER: Arcane Enlightenment (60205) "Your maximum hand size is increased by 1. | You have 1 additional hand slot, which can only be used to hold a [[Tome]] asset."
…and 12 more: Detective's Colt 1911s (05009), Hidden Pocket (09065), Astral Mirror (09091), Dr. Charles West III (10041), Occult Reliquary (10132), Occult Reliquary (10132), "Viola" Case (11012), …

--- slot-additional-tarot (2 members) ---
MEMBER: Anna Kaslow (05283) "You have 2 additional tarot slots. | [reaction] When the game begins, if Anna Kaslow is in your opening hand: Put her into play. | [reaction] After Anna Kaslow enters pla…"
MEMBER: Moon Pendant (54012) "You have 1 additional tarot slot. | Each non-weakness [[Tarot]] asset in your hand or committed to a skill test gains [wild] [wild]. | [reaction] When the game begins, if…"

==== FILE: src/tags/slot/convert.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeSlotConvert {
  SlotConvert = "slot-convert",
}

interface TagSlotConvertBase extends TagBase {}

/**
 * Let one slot type substitute for another ("arcane slots can hold
 * accessory-slot cards, and vice versa" — The Hierophant). Distinct from the
 * additive SlotAdditional.
 */
export interface TagSlotConvert extends TagSlotConvertBase {
  type: TagTypeSlotConvert.SlotConvert;
  from: string;
  to: string;
}

--- slot-convert (1 member) ---
MEMBER: The Hierophant • V (54007) "You have 1 additional arcane slot. | Your arcane slots can be used to hold cards that take up accessory slots, and vice versa. | [reaction] When the game begins, if The H…"

==== FILE: src/tags/slot/ignore.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeSlotIgnore {
  SlotIgnore = "slot-ignore",
}

/**
 * A card takes up NO slot that it normally would — Abigail Foreman's attached
 * Tome "takes up no hand slots". Future member: Trigger Man (TSK). Distinct
 * from slot-additional-* (granting an extra slot), slot-convert (changing a
 * slot's type), and slot-share (copies sharing one slot); all four are the
 * Slot Tech compound.
 */
export interface TagSlotIgnore extends TagBase {
  type: TagTypeSlotIgnore.SlotIgnore;
  /** Which slot type is ignored (e.g. "hand"). */
  slot?: string;
  /** Trait restriction on the card that gets to ignore its slot (e.g. "Tome"). */
  restrictedToTrait?: string;
}

--- slot-ignore (7 members) ---
MEMBER: Dr. Elli Horowitz (04021) "[reaction] After Dr. Elli Horowitz enters play: Search the top 9 cards of your deck for a [[Relic]] asset and attach it to her. Shuffle your deck. | Each [[Relic]] asset …"
MEMBER: Abigail Foreman (06324) "[fast]: Attach a [[Tome]] asset in your play area to Abigail Foreman, or switch a [[Tome]] asset in your play area with an attached asset. The asset attached to her takes…"
MEMBER: Quickdraw Holster (08089) "[fast]: Choose a [[Firearm]] asset taking up only 1 hand slot in your play area. Attach it to Quickdraw Holster, or switch it with the attached asset. The attached asset …"
…and 4 more: Tool Belt (09120), Library Pass (11099), Library Pass (11118), Sacrificial Doll (60458)
RULING: A card occupies NO slot it normally would (Abigail Foreman's attached Tome). Future member: Trigger Man (TSK). Rolls into Slot Tech with slot-convert/slot-share; it is NOT slot-additional (Abigail grants no slot — mistagged in wave 1, caught by user review).

==== FILE: src/tags/slot/share.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeSlotShare {
  SlotShare = "slot-share",
}

/**
 * Multiple copies of this card occupy a SINGLE slot together ("Up to 3 Empower
 * Self cards take up a single arcane slot"). Distinct from slot-additional-*
 * (granting an extra slot) and slot-convert (changing a slot's type).
 * `copies` = how many can share one slot.
 */
export interface TagSlotShare extends TagBase {
  type: TagTypeSlotShare.SlotShare;
  copies?: number;
}

--- slot-share (8 members) ---
MEMBER: Empower Self (06241) "Myriad. Limit 1 Empower Self <i>(Stamina)</i> per deck. | Up to 3 Empower Self cards take up a single arcane slot. | Anytime a card effect requires you to use [willpower]…"
MEMBER: Empower Self (06242) "Myriad. Limit 1 Empower Self <i>(Alacrity)</i> per deck. | Up to 3 Empower Self cards take up a single arcane slot. | Anytime a card effect requires you to use [willpower…"
MEMBER: Empower Self (06243) "Myriad. Limit 1 Empower Self <i>(Acuity)</i> per deck. | Up to 3 Empower Self cards take up a single arcane slot. | Anytime a card effect requires you to use [willpower] …"
…and 5 more: Sled Dog (08127), Uncanny Specimen (11039), Sacred Oath (11121), Sacred Oath (11122), Sacred Oath (11123)
RULING: Copies sharing ONE slot (Empower Self trio, copies:3). Not slot-additional (extra slot) and not slot-convert (type change).

==== FILE: src/tags/soak/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeSoak {
  SoakHealth = "soak-health",
  SoakSanity = "soak-sanity",
}

interface TagSoakBase extends TagBase {
  /** The printed health/sanity that can absorb hits — only tagged at 2 or more. */
  value: number;
}

/**
 * An asset (usually an Ally) with 2+ printed HEALTH: it can soak a point of damage without
 * being defeated, AND remains a valid target for damage-healing. Stat-derived (from the
 * printed health, not the text box). The "2+" threshold is what makes it meaningfully
 * survivable — it can take a 1-damage hit and still be healed back up. Covers both dedicated
 * soak items (Bulletproof Vest) and allies whose body is a side benefit (Guard Dog, Leo).
 */
export interface TagSoakHealth extends TagSoakBase {
  type: TagTypeSoak.SoakHealth;
}

/**
 * An asset (usually an Ally) with 2+ printed SANITY: it can soak a point of horror without
 * being defeated, AND remains a valid target for horror-healing. Stat-derived (from the
 * printed sanity, not the text box). E.g. Elder Sign Amulet (4), Peter Sylvestre (2).
 */
export interface TagSoakSanity extends TagSoakBase {
  type: TagTypeSoak.SoakSanity;
}

--- soak-health (113 members) ---
MEMBER: Beat Cop (01518) "You get +1 [combat]. | [free] Discard Beat Cop: Deal 1 damage to an enemy at your location."
MEMBER: Guard Dog (01521) "[reaction] When an enemy attack deals damage to Guard Dog: Deal 1 damage to the attacking enemy."
MEMBER: Beat Cop (01528) "You get +1 [combat]. | [free] Exhaust Beat Cop and deal 1 damage to it: Deal 1 damage to an enemy at your location."
…and 110 more: Leo De Luca (01548), Leo De Luca (01554), Cat Burglar (01555), Leather Coat (01572), Bulletproof Vest (01594), Duke (02014), Hired Muscle (02027), …
RULING: STAT-DERIVED: printed health ≥ 2 → soak-health value:<health>; sanity ≥ 2 → soak-sanity value:<sanity>.
RULING: 'Deal/place X damage/horror to IT/THIS/HER' (onto the asset itself) is SOAK routing, NOT a self-harm cost — never double-tag with cost-*-damage/horror-self (Aquinnah 01582/01691, Grete Wagner 60107/60128, Beat Cop(2) 01528).

--- soak-sanity (124 members) ---
MEMBER: Beat Cop (01518) "You get +1 [combat]. | [free] Discard Beat Cop: Deal 1 damage to an enemy at your location."
MEMBER: Beat Cop (01528) "You get +1 [combat]. | [free] Exhaust Beat Cop and deal 1 damage to it: Deal 1 damage to an enemy at your location."
MEMBER: Dr. Milan Christopher (01533) "You get +1 [intellect]. | [reaction] After you successfully investigate: Gain 1 resource."
…and 121 more: Leo De Luca (01548), Leo De Luca (01554), Cat Burglar (01555), Holy Rosary (01559), Arcane Initiate (01563), Aquinnah (01582), Elder Sign Amulet (01595), …
RULING: STAT-DERIVED: printed health ≥ 2 → soak-health value:<health>; sanity ≥ 2 → soak-sanity value:<sanity>.
RULING: 'Deal/place X damage/horror to IT/THIS/HER' (onto the asset itself) is SOAK routing, NOT a self-harm cost — never double-tag with cost-*-damage/horror-self (Aquinnah 01582/01691, Grete Wagner 60107/60128, Beat Cop(2) 01528).

==== FILE: src/tags/stats-mod/add-stat.ts ====
import { TagBase } from "../../base.js";
import { SkillType, TestingBasicAction } from "../../kohaku.js";

export enum TagTypeStatsModAddStat {
  StatsModAddStat = "stats-mod-add-stat",
}

interface TagStatsModAddStatBase extends TagBase {
  /**
   * The donor stat whose value is ADDED on top of the test's normal skill
   * value (e.g. "add your [agility] to your skill value for this attack").
   */
  from: SkillType;
  /**
   * Which action this addition applies to, when restricted to one.
   */
  action?: TestingBasicAction;
}

/**
 * ADDS a second stat's value on top of the test's normal skill value for one
 * action. Distinct from BuffStatsReplace (a swap) and from additive boosts
 * (a flat +N).
 */
export interface TagStatsModAddStat extends TagStatsModAddStatBase {
  type: TagTypeStatsModAddStat.StatsModAddStat;
}

--- stats-mod-add-stat (44 members) ---
MEMBER: Lockpicks (01687) "Uses (3 supplies). If Lockpicks has no supplies, discard it. | [action] Exhaust Lockpicks: <b>Investigate.</b> Add your [agility] value to your skill value for this inves…"
MEMBER: Cheap Shot (03194) "<b>Fight.</b> Add your [agility] value to your skill value for this attack. If you succeed by 2 or more, automatically evade the attacked enemy."
MEMBER: Lockpicks (03031) "Uses (3 supplies). If Lockpicks has no supplies, discard it. | [action] Exhaust Lockpicks: <b>Investigate.</b> Add your [agility] value to your skill value for this inves…"
…and 41 more: Suggestion (03268), Slip Away (04232), Timeworn Brand (04276), Mind over Matter (60226), Mind over Matter (60226), Lockpicks (60305), Cheap Shot (60312), …

==== FILE: src/tags/stats-mod/boost-in-test.ts ====
import { TestingBasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";
import { BoostValue } from "../../type.js";

export enum TagTypeStatsModBoostInTest {
  StatsModBoostInTestCombat = "stats-mod-boost-in-test-combat",
  StatsModBoostInTestAgility = "stats-mod-boost-in-test-agility",
  StatsModBoostInTestIntellect = "stats-mod-boost-in-test-intellect",
  StatsModBoostInTestWillpower = "stats-mod-boost-in-test-willpower",
  StatsModBoostInTestAny = "stats-mod-boost-in-test-any",
}

interface TagStatsModBoostInTestsBase extends TagBase {
  value: BoostValue;
  action?: TestingBasicAction;
}

export interface TagStatsModBoostInTestCombat extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat;
}

export interface TagStatsModBoostInTestAgility extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestAgility;
}

export interface TagStatsModBoostInTestIntellect extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestIntellect;
}

export interface TagStatsModBoostInTestWillpower extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestWillpower;
}

export interface TagStatsModBoostInTestAny extends TagStatsModBoostInTestsBase {
  type: TagTypeStatsModBoostInTest.StatsModBoostInTestAny;
}

--- stats-mod-boost-in-test-combat (145 members) ---
MEMBER: Roland's .38 Special (01506) "Roland Banks deck only. | Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack (if there are 1 or more clues on your location, you ge…"
MEMBER: Roland's .38 Special (01506) "Roland Banks deck only. | Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack (if there are 1 or more clues on your location, you ge…"
MEMBER: .45 Automatic (01516) "Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack. This attack deals +1 damage."
…and 142 more: Physical Training (01517), Machete (01520), Shotgun (01529), .41 Derringer (01547), Hard Knocks (01549), Baseball Bat (01574), Knife (01586), …
RULING: Additive base + conditional bonus with EQUAL increments ('+1; +1 more if …' / 'spend a charge to empower') = ONE tag at the CEILING value plus the condition/cost tags — never two identical tags (Enchanted Blade 05118 = value:2).
RULING: 'N, or M instead if …' REPLACEMENT = two tags with the DIFFERENT values (value:1 AND value:2 — Deduction, Fearless, Vicious Blow shape).

--- stats-mod-boost-in-test-agility (42 members) ---
MEMBER: Hyperawareness (01534) "[free] Spend 1 resource: You get +1 [intellect] for this skill test. | [free] Spend 1 resource: You get +1 [agility] for this skill test."
MEMBER: Hard Knocks (01549) "[free] Spend 1 resource: You get +1 [combat] for this skill test. | [free] Spend 1 resource: You get +1 [agility] for this skill test."
MEMBER: Dig Deep (01577) "[free] Spend 1 resource: You get +1 [willpower] for this skill test. | [free] Spend 1 resource: You get +1 [agility] for this skill test."
…and 39 more: Fire Extinguisher (02114), Streetwise (02189), Scrapper (02193), Combat Training (03107), Moxie (03111), Ornate Bow (04204), Streetwise (60311), …
RULING: Additive base + conditional bonus with EQUAL increments ('+1; +1 more if …' / 'spend a charge to empower') = ONE tag at the CEILING value plus the condition/cost tags — never two identical tags (Enchanted Blade 05118 = value:2).
RULING: 'N, or M instead if …' REPLACEMENT = two tags with the DIFFERENT values (value:1 AND value:2 — Deduction, Fearless, Vicious Blow shape).

--- stats-mod-boost-in-test-intellect (49 members) ---
MEMBER: Hyperawareness (01534) "[free] Spend 1 resource: You get +1 [intellect] for this skill test. | [free] Spend 1 resource: You get +1 [agility] for this skill test."
MEMBER: Arcane Studies (01562) "[free] Spend 1 resource: You get +1 [willpower] for this skill test. | [free] Spend 1 resource: You get +1 [intellect] for this skill test."
MEMBER: Higher Education (02187) "Permanent. | While you have 5 or more cards in your hand, Higher Education gains: | "[free] Spend 1 resource: You get +2 [willpower] for this skill test. | [free] Spend 1…"
…and 46 more: Streetwise (02189), Scientific Theory (03109), Plucky (03115), Higher Education (60211), Occult Invocation (60217), "I've got a plan!" (60225), Streetwise (60311), …
RULING: Additive base + conditional bonus with EQUAL increments ('+1; +1 more if …' / 'spend a charge to empower') = ONE tag at the CEILING value plus the condition/cost tags — never two identical tags (Enchanted Blade 05118 = value:2).
RULING: 'N, or M instead if …' REPLACEMENT = two tags with the DIFFERENT values (value:1 AND value:2 — Deduction, Fearless, Vicious Blow shape).

--- stats-mod-boost-in-test-willpower (58 members) ---
MEMBER: Physical Training (01517) "[free] Spend 1 resource: You get +1 [willpower] for this skill test. | [free] Spend 1 resource: You get +1 [combat] for this skill test."
MEMBER: Arcane Studies (01562) "[free] Spend 1 resource: You get +1 [willpower] for this skill test. | [free] Spend 1 resource: You get +1 [intellect] for this skill test."
MEMBER: Dig Deep (01577) "[free] Spend 1 resource: You get +1 [willpower] for this skill test. | [free] Spend 1 resource: You get +1 [agility] for this skill test."
…and 55 more: Rite of Seeking (01689), Song of the Dead (02112), Shrivelling (02154), Higher Education (02187), Blood Pact (02191), Rite of Seeking (02233), Shrivelling (02306), …
RULING: Additive base + conditional bonus with EQUAL increments ('+1; +1 more if …' / 'spend a charge to empower') = ONE tag at the CEILING value plus the condition/cost tags — never two identical tags (Enchanted Blade 05118 = value:2).
RULING: 'N, or M instead if …' REPLACEMENT = two tags with the DIFFERENT values (value:1 AND value:2 — Deduction, Fearless, Vicious Blow shape).

--- stats-mod-boost-in-test-any (81 members) ---
MEMBER: Lucky! (01580) "Fast. Play when you would fail a skill test. | Get +2 to your skill value for that test."
MEMBER: Lucky! (01584) "Fast. Play when you would fail a skill test. | Get +2 to your skill value for that test. Draw 1 card."
MEMBER: Ritual Candles (02029) "[reaction] After a [skull], [cultist], [tablet], or [elder_thing] symbol is revealed during a test you are performing: You get +1 skill value for this test."
…and 78 more: Sophie (03009), Daring Maneuver (03030), Spirit Athame (03035), Grounded (03113), Well Prepared (04151), Quick Study (04154), High Roller (04156), …
RULING: Additive base + conditional bonus with EQUAL increments ('+1; +1 more if …' / 'spend a charge to empower') = ONE tag at the CEILING value plus the condition/cost tags — never two identical tags (Enchanted Blade 05118 = value:2).
RULING: 'N, or M instead if …' REPLACEMENT = two tags with the DIFFERENT values (value:1 AND value:2 — Deduction, Fearless, Vicious Blow shape).

==== FILE: src/tags/stats-mod/boost-lasting.ts ====
import { TestingBasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";
import { BoostValue } from "../../type.js";

export enum TagTypeStatsModBoostLasting {
  StatsModBoostLastingCombat = "stats-mod-boost-lasting-combat",
  StatsModBoostLastingAgility = "stats-mod-boost-lasting-agility",
  StatsModBoostLastingIntellect = "stats-mod-boost-lasting-intellect",
  StatsModBoostLastingWillpower = "stats-mod-boost-lasting-willpower",
  StatsModBoostLastingAny = "stats-mod-boost-lasting-any",
}

/**
 * A boost that LINGERS on the investigator across multiple tests for a duration — it adds
 * to the skill and stays there (pair with a `duration-*` tag). Distinct from a single-test
 * boost (`stats-mod-boost-in-test-*`, gone after one test) and from an always-on printed
 * boost (`stats-mod-boost-passive-*`). Example: Encyclopedia — "choose a skill; it gets +2
 * until the end of the phase."
 */
interface TagStatsModBoostLastingBase extends TagBase {
  value: BoostValue;
  action?: TestingBasicAction;
}

export interface TagStatsModBoostLastingCombat extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingCombat;
}

export interface TagStatsModBoostLastingAgility extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingAgility;
}

export interface TagStatsModBoostLastingIntellect extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingIntellect;
}

export interface TagStatsModBoostLastingWillpower extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingWillpower;
}

export interface TagStatsModBoostLastingAny extends TagStatsModBoostLastingBase {
  type: TagTypeStatsModBoostLasting.StatsModBoostLastingAny;
}

--- stats-mod-boost-lasting-combat (3 members) ---
MEMBER: Keen Eye (02185) "Permanent. | [free] Spend 2 resources: You get +1 [intellect] until the end of the phase. | [free] Spend 2 resources: You get +1 [combat] until the end of the phase."
MEMBER: Fight or Flight (03155) "Fast. Play only during your turn. | Until the end of the round, you get +X [combat] and +X [agility], where X is the amount of horror on you."
MEMBER: Keen Eye (07152) "[fast] Spend 2 resources: You get +1 [intellect] until the end of the phase. | [fast] Spend 2 resources: You get +1 [combat] until the end of the phase."

--- stats-mod-boost-lasting-agility (1 member) ---
MEMBER: Fight or Flight (03155) "Fast. Play only during your turn. | Until the end of the round, you get +X [combat] and +X [agility], where X is the amount of horror on you."

--- stats-mod-boost-lasting-intellect (2 members) ---
MEMBER: Keen Eye (02185) "Permanent. | [free] Spend 2 resources: You get +1 [intellect] until the end of the phase. | [free] Spend 2 resources: You get +1 [combat] until the end of the phase."
MEMBER: Keen Eye (07152) "[fast] Spend 2 resources: You get +1 [intellect] until the end of the phase. | [fast] Spend 2 resources: You get +1 [combat] until the end of the phase."

--- stats-mod-boost-lasting-willpower (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- stats-mod-boost-lasting-any (19 members) ---
MEMBER: Encyclopedia (01542) "[action] Exhaust Encyclopedia: Choose an investigator at your location. That investigator gets +2 to a skill of your choice until the end of the phase."
MEMBER: "Let me handle this!" (03022) "Fast. Play after another investigator draws a non-peril encounter card, but before resolving that card's effects. | You are considered to have drawn that encounter card, …"
MEMBER: Fieldwork (03024) "[reaction] After you move to a location, if that location has at least 1 clue on it, exhaust Fieldwork: You get +2 skill value for the next skill test you perform this ph…"
…and 16 more: Narrow Escape (03267), Encyclopedia (60208), Grit Your Teeth (60515), Ace of Rods (05040), Showmanship (07012), Tristan Botley (07194), The Stygian Eye (07263), …

==== FILE: src/tags/stats-mod/boost-passive.ts ====
import { TestingBasicAction } from "../../kohaku.js";
import { TagBase } from "../../base.js";
import { BoostValue } from "../../type.js";

export enum TagTypeStatsModBoostPassive {
  StatsModBoostPassiveCombat = "stats-mod-boost-passive-combat",
  StatsModBoostPassiveAgility = "stats-mod-boost-passive-agility",
  StatsModBoostPassiveIntellect = "stats-mod-boost-passive-intellect",
  StatsModBoostPassiveWillpower = "stats-mod-boost-passive-willpower",
  StatsModBoostPassiveAny = "stats-mod-boost-passive-any",
}

interface TagStatsModBoostPassivesBase extends TagBase {
  value: BoostValue;
  action?: TestingBasicAction;
}

export interface TagStatsModBoostPassiveCombat extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat;
}

export interface TagStatsModBoostPassiveAgility extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility;
}

export interface TagStatsModBoostPassiveIntellect extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveIntellect;
}

export interface TagStatsModBoostPassiveWillpower extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveWillpower;
}

export interface TagStatsModBoostPassiveAny extends TagStatsModBoostPassivesBase {
  type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny;
}

--- stats-mod-boost-passive-combat (27 members) ---
MEMBER: Beat Cop (01518) "You get +1 [combat]. | [free] Discard Beat Cop: Deal 1 damage to an enemy at your location."
MEMBER: Beat Cop (01528) "You get +1 [combat]. | [free] Exhaust Beat Cop and deal 1 damage to it: Deal 1 damage to an enemy at your location."
MEMBER: Hired Muscle (02027) "You get +1 [combat]. | <b>Forced</b> - At the end of the upkeep phase: You must either pay 1 resource or discard Hired Muscle."
…and 24 more: Dark Horse (02234), Calvin Wright (04005), Intrepid (04192), Crystalline Elder Sign (04235), Boxing Gloves (60105), Grete Wagner (60107), Boxing Gloves (60127), …
RULING: Passive = genuinely always-on while in play. A boost that EXPIRES (asset discards at end of round, 'until end of turn') is lasting/duration, not passive (Intrepid was mistagged passive).

--- stats-mod-boost-passive-agility (25 members) ---
MEMBER: Cat Burglar (01555) "You get +1 [agility]. | [action] Exhaust Cat Burglar: Disengage from each enemy engaged with you and move to a connecting location. This action does not provoke attacks o…"
MEMBER: Peter Sylvestre (02033) "You get +1 [agility]. | [reaction] After your turn ends: Heal 1 horror from Peter Sylvestre."
MEMBER: Peter Sylvestre (02035) "You get +1 [agility] and +1 [willpower]. | [reaction] After your turn ends: Heal 1 horror from Peter Sylvestre."
…and 22 more: Dark Horse (02234), Calvin Wright (04005), Intrepid (04192), Tooth of Eztli (04023), Lola Santiago (04196), Crystalline Elder Sign (04235), Trench Coat (04203), …
RULING: Passive = genuinely always-on while in play. A boost that EXPIRES (asset discards at end of round, 'until end of turn') is lasting/duration, not passive (Intrepid was mistagged passive).

--- stats-mod-boost-passive-intellect (41 members) ---
MEMBER: Magnifying Glass (01530) "Fast. | You get +1 [intellect] while investigating."
MEMBER: Dr. Milan Christopher (01533) "You get +1 [intellect]. | [reaction] After you successfully investigate: Gain 1 resource."
MEMBER: Magnifying Glass (01540) "Fast. | You get +1 [intellect] while investigating. | [free] If there are no clues on your location: Return Magnifying Glass to your hand."
…and 38 more: Newspaper (02155), Alyssa Graham (02232), Dark Horse (02234), Dario El-Amin (03151), St. Hubert's Key (03269), Newspaper (03313), Calvin Wright (04005), …
RULING: Passive = genuinely always-on while in play. A boost that EXPIRES (asset discards at end of round, 'until end of turn') is lasting/duration, not passive (Intrepid was mistagged passive).

--- stats-mod-boost-passive-willpower (35 members) ---
MEMBER: Police Badge (01527) "You get +1 [willpower]. | [free] While an investigator at your location is taking his or her turn, discard Police Badge: That investigator may take 2 additional actions t…"
MEMBER: Holy Rosary (01559) "You get +1 [willpower]."
MEMBER: Peter Sylvestre (02035) "You get +1 [agility] and +1 [willpower]. | [reaction] After your turn ends: Heal 1 horror from Peter Sylvestre."
…and 32 more: Brother Xavier (02106), Dark Horse (02234), Dario El-Amin (03151), David Renfield (03112), St. Hubert's Key (03269), The Codex of Ages (04013), Calvin Wright (04005), …
RULING: Passive = genuinely always-on while in play. A boost that EXPIRES (asset discards at end of round, 'until end of turn') is lasting/duration, not passive (Intrepid was mistagged passive).

--- stats-mod-boost-passive-any (13 members) ---
MEMBER: Key of Ys (03315) "You get +1 to each of your skills for each horror on Key of Ys. | <b>Forced</b> - When any amount of horror would be placed on you: Place 1 of that horror on Key of Ys. |…"
MEMBER: Reliable (04020) "Fast. Play only during your turn. | Attach to an [[Item]] asset you control. | While resolving a triggered ability on attached asset, you get +1 to each of your skills."
MEMBER: The Black Fan (08057) "Exceptional. | While you have... | - ...10+ resources, you get +1 health and +1 sanity. | - ...15+ resources, you may take one additional action during your turn. | - ...…"
…and 10 more: Grounded (08069), Martyr's Vambrace (09037), Dirty Fighting (09073), Elle Rubash (09092), Wilson Richards (10001), Good Weather (11091), Forbidden Sutra (11103), …
RULING: Passive = genuinely always-on while in play. A boost that EXPIRES (asset discards at end of round, 'until end of turn') is lasting/duration, not passive (Intrepid was mistagged passive).

==== FILE: src/tags/stats-mod/pump.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeStatsModPump {
  StatsModPumpResource = "stats-mod-pump-resource",
  StatsModPumpCharge = "stats-mod-pump-charge",
}

interface TagStatsModPumpBase extends TagBase {
  valuePerPump: number;
}

/**
 * Pump means the more you spend the more you get the stats mod.
 */
export interface TagStatsModPumpResource extends TagStatsModPumpBase {
  type: TagTypeStatsModPump.StatsModPumpResource;
}

export interface TagStatsModPumpCharge extends TagStatsModPumpBase {
  type: TagTypeStatsModPump.StatsModPumpCharge;
}

--- stats-mod-pump-resource (55 members) ---
MEMBER: Physical Training (01517) "[free] Spend 1 resource: You get +1 [willpower] for this skill test. | [free] Spend 1 resource: You get +1 [combat] for this skill test."
MEMBER: Hyperawareness (01534) "[free] Spend 1 resource: You get +1 [intellect] for this skill test. | [free] Spend 1 resource: You get +1 [agility] for this skill test."
MEMBER: Hard Knocks (01549) "[free] Spend 1 resource: You get +1 [combat] for this skill test. | [free] Spend 1 resource: You get +1 [agility] for this skill test."
…and 52 more: Arcane Studies (01562), Dig Deep (01577), Fire Axe (02032), Higher Education (02187), Streetwise (02189), Scrapper (02193), Combat Training (03107), …
RULING: A REPEATABLE spend-resource boost (Streetwise, Higher Education, Dig Deep) = stats-mod-pump-resource PLUS the boost tag with value:"dynamic". valuePerPump = the boost of ONE activation (Fire Axe 1res→+2 ⇒ 2; Streetwise 2res→+3 ⇒ 3).
RULING: EXHAUST-gated boosts are NOT repeatable — no pump tag; keep the flat boost value (High Roller 04156 stays value:2).

--- stats-mod-pump-charge (4 members) ---
MEMBER: M1918 BAR (04229) "Uses (8 ammo). | [action] Spend 1-5 ammo: <b>Fight.</b> You get +X [combat] for this attack. Instead of its standard damage, this attack deals X damage. X is the amount o…"
MEMBER: Enchanted Blade (05193) "Uses (4 charges). | [action]: <b>Fight.</b> You get +2 [combat] for this attack. As an additional cost to use this ability, you may spend up to 2 charges to empower the b…"
MEMBER: Blade of Yoth (10036) "Bonded (Eyes of Valusia). | [action] Spend 1-3 charges: <b>Fight.</b> For this attack, you may use [willpower] instead of [combat]. You get +2 skill value and deal +1 dam…"
…and 1 more: Gatling Gun (11064)
RULING: A REPEATABLE spend-resource boost (Streetwise, Higher Education, Dig Deep) = stats-mod-pump-resource PLUS the boost tag with value:"dynamic". valuePerPump = the boost of ONE activation (Fire Axe 1res→+2 ⇒ 2; Streetwise 2res→+3 ⇒ 3).
RULING: EXHAUST-gated boosts are NOT repeatable — no pump tag; keep the flat boost value (High Roller 04156 stays value:2).

==== FILE: src/tags/stats-mod/set-base.ts ====
import { TagBase } from "../../base.js";
import { TestingBasicAction } from "../../kohaku.js";

export enum TagTypeStatsModSetBase {
  StatsModSetBase = "stats-mod-set-base",
}

interface TagStatsModSetBaseBase extends TagBase {
  value: number;
  /** Which basic action the base value applies to (Fight/Investigate/…). */
  action?: TestingBasicAction;
}

/**
 * Sets / overrides the BASE value of a skill to a fixed number
 * (e.g. "attack with a base [combat] skill of 6").
 * Distinct from additive boosts (boost-in-test / boost-passive) and from
 * BuffStatsReplace (a stat-for-stat swap).
 */
export interface TagStatsModSetBase extends TagStatsModSetBaseBase {
  type: TagTypeStatsModSetBase.StatsModSetBase;
}

--- stats-mod-set-base (15 members) ---
MEMBER: Duke (02014) ""Ashcan" Pete deck only. | [action] Exhaust Duke: <b>Fight.</b> You attack with a base [combat] skill of 4. This attack deals +1 damage. | [action] Exhaust Duke: <b>Inves…"
MEMBER: Duke (02014) ""Ashcan" Pete deck only. | [action] Exhaust Duke: <b>Fight.</b> You attack with a base [combat] skill of 4. This attack deals +1 damage. | [action] Exhaust Duke: <b>Inves…"
MEMBER: Strange Solution (02263) "Researched. Uses (3 supplies). | [action] Spend 1 supply: <b>Fight.</b> Attack with a base [combat] skill of 6. This attack deals +2 damage."
…and 12 more: Strange Solution (02264), The Red-Gloved Man (02310), Trial by Fire (05281), Hope (06031), Zeal (06032), Augur (06033), Summoned Hound (06282), …
RULING: Use the optional action arg to discriminate multiple base-set abilities on one card (Duke: combat-4 for Fight vs intellect-4 for Investigate must differ by action, not be two identical tags).

==== FILE: src/tags/stats-mod/use-instead.ts ====
import { TagBase } from "../../base.js";
import { SkillType, TestingBasicAction } from "../../kohaku.js";

export enum TagTypeStatsModUseInstead {
  StatsModUseInstead = "stats-mod-use-instead",
}

interface TagStatsModUseInsteadBase extends TagBase {
  /**
   * The stat that is used for the test.
   */
  use: SkillType;
  /**
   * The stat that would normally be used, now replaced.
   */
  instead: SkillType;
  /**
   * Which action's test this per-test substitution applies to, when
   * restricted to one.
   */
  action?: TestingBasicAction;
}

/**
 * Per-action, per-test stat substitution (e.g. "this attack uses [agility]
 * instead of [combat]"). Distinct from BuffStatsReplace, which is a PASSIVE
 * card-wide from->to replacement; these are action-scoped one-shot overrides.
 */
export interface TagStatsModUseInstead extends TagStatsModUseInsteadBase {
  type: TagTypeStatsModUseInstead.StatsModUseInstead;
}

--- stats-mod-use-instead (123 members) ---
MEMBER: Mind over Matter (01536) "Fast. Play only during your turn. | Until the end of the round, you may use your [intellect] in place of your [combat] and [agility]."
MEMBER: Mind over Matter (01536) "Fast. Play only during your turn. | Until the end of the round, you may use your [intellect] in place of your [combat] and [agility]."
MEMBER: Backstab (01551) "<b>Fight.</b> This attack uses [agility] instead of [combat]. This attack deals +2 damage."
…and 120 more: Shrivelling (01560), Blinding Light (01566), Blinding Light (01569), Rite of Seeking (01689), Rite of Seeking (02028), Bind Monster (02031), "I've got a plan!" (02107), …

==== FILE: src/tags/tank/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeTank {
  TankRedirectAttack = "tank-redirect-attack",
  TankRedirectEncounter = "tank-redirect-encounter",
  TankRedirectDamageHorror = "tank-redirect-damage-horror",
  TankMoveDamageHorror = "tank-move-damage-horror",
}

interface TagTankBase extends TagBase {}

/** Resolve an enemy attack against you instead of another investigator. */
export interface TagTankRedirectAttack extends TagTankBase {
  type: TagTypeTank.TankRedirectAttack;
}

/** Take another investigator's encounter card instead of them. */
export interface TagTankRedirectEncounter extends TagTankBase {
  type: TagTypeTank.TankRedirectEncounter;
}

/** Accept damage/horror dealt to others (e.g. at your location) onto yourself. */
export interface TagTankRedirectDamageHorror extends TagTankBase {
  type: TagTypeTank.TankRedirectDamageHorror;
}

/**
 * Relocate EXISTING damage/horror tokens between player cards — not incoming
 * damage (that's tank-redirect-*) and not removal (that's heal-*).
 * scope "cross-investigator" = tokens move between two investigators' cards
 * (Solemn Vow — the owner soaks the controller's tokens; future members: Devil
 * (FHV), Lucky Charm (Core 2026)); scope "self" = shuffling within your own
 * board (Tommy Muldoon's elder sign). Only the cross-investigator scope is
 * protective (ProtectorTank/Support compounds filter on it).
 */
export interface TagTankMoveDamageHorror extends TagTankBase {
  type: TagTypeTank.TankMoveDamageHorror;
  scope?: "cross-investigator" | "self";
}

--- tank-redirect-attack (3 members) ---
MEMBER: Heroic Rescue (03106) "Fast. Play when a non-[[Elite]] enemy would attack another investigator at your location. | Engage that enemy and resolve its attack against you instead. Then, deal it 1 …"
MEMBER: Heroic Rescue (06234) "Fast. Play when a non-[[Elite]] enemy would attack another investigator at your location or a connecting location. | Move to that location if you are not already there. E…"
MEMBER: "Get behind me!" (08021) "Fast. Play during any [fast] window. | Until the end of the phase, whenever an enemy would attack another investigator at your location, it attacks you instead, then enga…"

--- tank-redirect-encounter (3 members) ---
MEMBER: "Let me handle this!" (03022) "Fast. Play after another investigator draws a non-peril encounter card, but before resolving that card's effects. | You are considered to have drawn that encounter card, …"
MEMBER: First Watch (06110) "Fast. Play when the "draw encounter cards" step of the mythos phase would begin. | Instead of resolving that step, look at the top X cards of the encounter deck, where X …"
MEMBER: Martyr's Vambrace (09037) "You get +1 skill value while resolving revelation abilities on encounter cards. | [reaction] After another investigator at your location draws a non-peril encounter card,…"

--- tank-redirect-damage-horror (14 members) ---
MEMBER: Brother Xavier (02106) "You get +1 [willpower]. | Brother Xavier may be assigned damage and/or horror dealt to other investigators at your location. | [reaction] When Brother Xavier is defeated:…"
MEMBER: True Grit (03021) "True Grit may be assigned damage dealt to other investigators at your location."
MEMBER: Something Worth Fighting For (05109) "Something Worth Fighting For may be assigned horror dealt to other investigators at your location."
…and 11 more: Agency Backup (05274), Tetsuo Mori (06155), Guardian Angel (07006), Obsidian Bracelet (09024), Girish Kadakia (09038), Hank Samson (10015), Sound Support (11112), …
RULING: Composure-style SELF-soak routing text ('…before it can be assigned to your investigator', card soaks its controller's damage) is NOT tanking — tank tags mean protecting OTHERS (removed from 03107/03109/03111/03115/05236).

--- tank-move-damage-horror (6 members) ---
MEMBER: Tommy Muldoon (06001) "[reaction] When an asset you control is defeated: Gain X resources, where X is the total amount of damage and horror on that asset. Shuffle that asset into your deck. | […"
MEMBER: Solemn Vow (06020) "Myriad. Fast. | Play Solemn Vow under the control of another investigator at your location. | [fast] If the owner of Solemn Vow is at your location, exhaust Solemn Vow: M…"
MEMBER: Ravenous Myconid (10061) "Researched. Limit 1 per deck. | [fast]: Search your bonded cards for Uncanny Growth and add it to your hand. (Limit once per round.) | [fast] Remove all growth from Raven…"
…and 3 more: Wrong Place, Right Time (10115), "Devil" (10119), Lucky Charm (12061)
RULING: Relocating EXISTING damage/horror between player cards. scope 'cross-investigator' (Solemn Vow — protective, joins ProtectorTank/Support via where-filter; future members: Devil (FHV), Lucky Charm (Core 2026)) vs scope 'self' (Tommy Muldoon's elder sign — own-board bookkeeping, joins neither). Not tank-redirect-* (incoming damage) and not heal-* (removal). Ruled 2026-07-16 after the Guardian review caught Solemn Vow with its main benefit untagged.

==== FILE: src/tags/test-difficulty/main.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";
import { TestingBasicAction } from "../../kohaku.js";

export enum TagTypeTestDifficulty {
  TestDifficultyReduce = "test-difficulty-reduce",
}

interface TagTestDifficultyBase extends TagBase {
  /** Amount the difficulty (target number) is reduced by. "dynamic" for a dynamic amount. */
  value: DynamicValue;
  /** Restrict to a specific action's tests (e.g. Fine Clothes = parley only). Omit = any test. */
  action?: TestingBasicAction;
}

/**
 * Reduce the difficulty (target number) of a skill test directly, rather than
 * boosting your own skill value or reducing a location's shroud.
 */
export interface TagTestDifficultyReduce extends TagTestDifficultyBase {
  type: TagTypeTestDifficulty.TestDifficultyReduce;
}

--- test-difficulty-reduce (9 members) ---
MEMBER: Fine Clothes (02272) "Reduce the difficulty of skill tests you perform during 'parley' actions by 2."
MEMBER: Quick Learner (60530) "Permanent. | During or before your first action of each of your turns, each skill test you perform gets +1 difficulty. | During or after your third action of each of your…"
MEMBER: Momentum (06115) "If this skill test is successful, reduce the difficulty of the next skill test you perform this phase by X, where X is the amount this skill test succeeded by (to a maxim…"
…and 6 more: Darrell Simmons (09015), Map the Area (09048), Existential Riddle (09052), Gumption (09112), Flashlight (09122), Flashlight (09122)
RULING: Optional action arg scopes the reduction (Fine Clothes = {action:"parley"}).

==== FILE: src/tags/test/initiate.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeTestInitiate {
  TestInitiateAgility = "test-initiate-agility",
  TestInitiateCombat = "test-initiate-combat",
  TestInitiateIntellect = "test-initiate-intellect",
  TestInitiateWillpower = "test-initiate-willpower",
}

interface TagTestInitiateBase extends TagBase {
  difficulty: DynamicValue;
}

export interface TagTestInitiateAgility extends TagTestInitiateBase {
  type: TagTypeTestInitiate.TestInitiateAgility;
}

export interface TagTestInitiateCombat extends TagTestInitiateBase {
  type: TagTypeTestInitiate.TestInitiateCombat;
}

export interface TagTestInitiateIntellect extends TagTestInitiateBase {
  type: TagTypeTestInitiate.TestInitiateIntellect;
}

export interface TagTestInitiateWillpower extends TagTestInitiateBase {
  type: TagTypeTestInitiate.TestInitiateWillpower;
}

--- test-initiate-agility (7 members) ---
MEMBER: Waylay (03237) "Choose an exhausted non-[[Elite]] enemy at your location and test [agility] (X), where X is that enemy's evade value. If you succeed, defeat that enemy."
MEMBER: Track Shoes (05036) "Limit 1 [[Footwear]] per investigator. | You get +1 [agility]. | [reaction] After you move, but before enemies at your new location engage you, exhaust Track Shoes: Test …"
MEMBER: The Council's Coffer (05196) "Uses (1 [per_investigator] locks). If there are no locks on The Council's Coffer, each investigator searches his or her deck or discard pile for any card and immediately …"
…and 4 more: Dodge (08026), Grift (10071), Vamp (10074), Vamp (10081)

--- test-initiate-combat (7 members) ---
MEMBER: Interrogate (05020) "<b>Parley.</b> Choose a [[Humanoid]] enemy at your location and test [combat] (3). This test gets +X difficulty, where X is the chosen enemy's damage value. If you succee…"
MEMBER: The Council's Coffer (05196) "Uses (1 [per_investigator] locks). If there are no locks on The Council's Coffer, each investigator searches his or her deck or discard pile for any card and immediately …"
MEMBER: Breach the Door (09026) "Test [combat] (1). If you succeed, attach Breach the Door to your location with 1 resource on it for each point you succeeded by, as leads. | Reduce attached location's s…"
…and 4 more: Vamp (10074), Vamp (10081), Intimidation (11056), "Make 'em sing" (60160)

--- test-initiate-intellect (25 members) ---
MEMBER: Medical Texts (01535) "[action] Choose an investigator at your location and test [intellect] (2). If you succeed, heal 1 damage from that investigator. If you fail, deal 1 damage to that invest…"
MEMBER: Strange Solution (02021) "[action] Test [intellect] (4). If you succeed, discard Strange Solution and draw 2 cards. Record in your Campaign Log that "you have identified the solution.""
MEMBER: Expose Weakness (02228) "Fast. Play during any [free] player window. | Choose an enemy at your location. Test [intellect] (X), where X is that enemy's fight value. For each point you succeed by, …"
…and 22 more: Persuasion (04105), Feed the Mind (04267), Expose Weakness (04195), Eavesdrop (04027), Feed the Mind (60209), Hypnotic Therapy (05007), The Council's Coffer (05196), …

--- test-initiate-willpower (20 members) ---
MEMBER: Liquid Courage (02024) "Uses (4 supplies). | [action] Spend 1 supply: Choose an investigator at your location to heal 1 horror. Then, that investigator tests [willpower] (2). If the test succeed…"
MEMBER: Bind Monster (02031) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed and the enemy is non‑[[Elite]], evade it and attach Bind Monster to it. | [reacti…"
MEMBER: Alchemical Transmutation (03032) "Uses (3 charges). | [action] Exhaust Alchemical Transmutation, spend 1 charge: Test [willpower] (1). For each point you succeed by, gain 1 resource (to a maximum of 3). I…"
…and 17 more: Liquid Courage (60320), A Test of Will (60513), A Test of Will (60523), The Council's Coffer (05196), Shining Trapezohedron (06329), Earthly Serenity (08117), Earthly Serenity (08119), …

==== FILE: src/tags/test/misc.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeTestMisc {
  TestYouPerform = "test-you-perform",
}

interface TagTestMiscBase extends TagBase {}

export interface TagTestYouPerform extends TagTestMiscBase {
  type: TagTypeTestMisc.TestYouPerform;
}

--- test-you-perform (38 members) ---
MEMBER: Opportunist (01553) "Commit only to a skill test you are performing. | If you succeed by 3 or more, return Opportunist to your hand after this test instead of discarding it."
MEMBER: Ritual Candles (02029) "[reaction] After a [skull], [cultist], [tablet], or [elder_thing] symbol is revealed during a test you are performing: You get +1 skill value for this test."
MEMBER: Rise to the Occasion (02192) "Commit only to a skill test you are performing, and only if the difficulty of that test is at least 2 higher than your base skill value."
…and 35 more: Opportunist (02231), Stroke of Luck (02271), "Watch this!" (03233), Take the Initiative (04150), Recall the Future (04158), Against All Odds (04202), Anything You Can Do, Better (60302), …

==== FILE: src/tags/test/repeat.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeTestRepeat {
  TestRepeatFailed = "test-repeat-failed",
}

interface TagTestRepeatBase extends TagBase {}

/**
 * Re-attempt/repeat a failed skill test ("attempt that test again") — a distinct
 * second-chance effect, part of the fail-forward archetype. Not a new test
 * (initiate.ts) nor a margin effect (skill-value/result).
 */
export interface TagTestRepeatFailed extends TagTestRepeatBase {
  type: TagTypeTestRepeat.TestRepeatFailed;
}

--- test-repeat-failed (6 members) ---
MEMBER: Live and Learn (04200) "Fast. Play after a skill test you failed ends <i>(after resolving all effects from the failed test)</i>. | Attempt that test again. You get +2 skill value for this test."
MEMBER: Live and Learn (60516) "Fast. Play after a skill test you failed ends <i>(after resolving all effects from the failed test)</i>. | Attempt that test again. You get +2 skill value for this test."
MEMBER: Token of Faith (10126) "[reaction] After a skill test ends in which 1 or more [curse] or [auto_fail] tokens were revealed, exhaust Token of Faith: Add that many [bless] tokens to the chaos bag. …"
…and 3 more: Daniel Jameson (60555), Old Compass (60558), Old Compass (12083)

==== FILE: src/tags/test/result.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeTestResult {
  TestSucceedBy = "test-succeed-by",
  TestFailBy = "test-fail-by",
}

interface TagTestResultBase extends TagBase {
  /**
   * The margin by which the test succeeds or fails.
   * Use -1 or a special value for variable amounts.
   * Use 0 for "succeed by 0" or exact success.
   */
  amount: DynamicValue;
}

export interface TagTestSucceedBy extends TagTestResultBase {
  type: TagTypeTestResult.TestSucceedBy;
}

export interface TagTestFailBy extends TagTestResultBase {
  type: TagTypeTestResult.TestFailBy;
}

--- test-succeed-by (5 members) ---
MEMBER: Shotgun (01529) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] for this attack. Instead of its standard damage, this attack deals 1 damage for each point you s…"
MEMBER: Expose Weakness (02228) "Fast. Play during any [free] player window. | Choose an enemy at your location. Test [intellect] (X), where X is that enemy's fight value. For each point you succeed by, …"
MEMBER: Sawed-Off Shotgun (06327) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> Instead of its standard damage, this attack deals 1 damage for each point you succeed by (to a minimum of 1, to a ma…"
…and 2 more: Old Shotgun (08088), Winchester Model 12 (12029)

--- test-fail-by (6 members) ---
MEMBER: Shotgun (01529) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] for this attack. Instead of its standard damage, this attack deals 1 damage for each point you s…"
MEMBER: Grimm's Fairy Tales (60506) "Uses (4 secrets). | [reaction] After an investigator at your location fails a skill test by 2 or more, exhaust Grimm's Fairy Tales and spend 1 secret: Heal 1 horror from …"
MEMBER: Sawed-Off Shotgun (06327) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> Instead of its standard damage, this attack deals 1 damage for each point you succeed by (to a minimum of 1, to a ma…"
…and 3 more: Old Shotgun (08088), Precious Memento (08114), Winchester Model 12 (12029)

==== FILE: src/tags/testless/main.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeTestless {
  TestlessDamageYourLocation = "testless-damage-your-location",
  TestlessDamageYourLocationMultiple = "testless-damage-your-location-multiple",
  TestlessDamageConnectingLocation = "testless-damage-connecting-location",
  TestlessDamageAttackingEnemy = "testless-damage-attacking-enemy",
  TestlessClue = "testless-clue",
  TestlessEvade = "testless-evade",
  TestlessDamageEvadedEnemy = "testless-damage-evaded-enemy",
  TestlessDamageEngagedEnemy = "testless-damage-engaged-enemy",
}

interface TagTestlessBase extends TagBase {}

interface TagTestlessWithValueBase extends TagTestlessBase {
  value: DynamicValue;
}

export interface TagTestlessDamageYourLocation extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageYourLocation;
}

export interface TagTestlessDamageYourLocationMultiple extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageYourLocationMultiple;
}

export interface TagTestlessDamageConnectingLocation extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageConnectingLocation;
}

export interface TagTestlessDamageAttackingEnemy extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageAttackingEnemy;
}

export interface TagTestlessClue extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessClue;
}

export interface TagTestlessEvade extends TagTestlessBase {
  type: TagTypeTestless.TestlessEvade;
}

/** Deal damage with no test to the enemy you just EVADED (only that enemy, not any at your location) — e.g. Blinding Light. */
export interface TagTestlessDamageEvadedEnemy extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageEvadedEnemy;
}

/** Deal testless damage to ONLY the single enemy that just became engaged with you (not all enemies at your location). */
export interface TagTestlessDamageEngagedEnemy extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageEngagedEnemy;
}

--- testless-damage-your-location (48 members) ---
MEMBER: Beat Cop (01518) "You get +1 [combat]. | [free] Discard Beat Cop: Deal 1 damage to an enemy at your location."
MEMBER: Beat Cop (01528) "You get +1 [combat]. | [free] Exhaust Beat Cop and deal 1 damage to it: Deal 1 damage to an enemy at your location."
MEMBER: Sneak Attack (01552) "Deal 2 damage to an exhausted enemy at your location."
…and 45 more: Brother Xavier (02106), Ambush (03148), Sneak Attack (03152), Lantern (03036), Ancient Stone (04230), Coup de Grâce (04269), Disc of Itzamna (60207), …
RULING: attacking-enemy vs engaged-enemy: when the card responds to an ATTACK and damages that attacker, it is testless-damage-attacking-enemy even if the card also engages the enemy first (Heroic Rescue 03106 — 'resolve its attack against you instead. Then, deal it 1 damage'; also Hypnotic Gaze). engaged-enemy is for damaging an enemy engaged with you OUTSIDE an attack context (Taunt(3) 60130).

--- testless-damage-your-location-multiple (13 members) ---
MEMBER: Dynamite Blast (01524) "Choose either your location or a connecting location. Deal 3 damage to each enemy and to each investigator at the chosen location."
MEMBER: Storm of Spirits (03153) "<b>Fight.</b> This attack uses [willpower] instead of [combat]. If you succeed, instead of its standard damage, this attack deals 2 damage to each enemy at the attacked e…"
MEMBER: Dynamite Blast (60129) "Fast. Play during any [fast] window. | Choose either your location or a connecting location. Deal 3 damage to each enemy and investigator at the chosen location."
…and 10 more: Mk 1 Grenades (05273), Gaze of Ouraxsh (07155), Stir the Pot (10073), Stir the Pot (10083), Elaborate Distraction (10112), "Devil" (10119), Bend Blood (60483), …
RULING: attacking-enemy vs engaged-enemy: when the card responds to an ATTACK and damages that attacker, it is testless-damage-attacking-enemy even if the card also engages the enemy first (Heroic Rescue 03106 — 'resolve its attack against you instead. Then, deal it 1 damage'; also Hypnotic Gaze). engaged-enemy is for damaging an enemy engaged with you OUTSIDE an attack context (Taunt(3) 60130).

--- testless-damage-connecting-location (8 members) ---
MEMBER: Dynamite Blast (01524) "Choose either your location or a connecting location. Deal 3 damage to each enemy and to each investigator at the chosen location."
MEMBER: Dynamite Blast (60129) "Fast. Play during any [fast] window. | Choose either your location or a connecting location. Deal 3 damage to each enemy and investigator at the chosen location."
MEMBER: Small Favor (05277) "Deal 1 damage to a non-[[Elite]] enemy at your location. | [reaction] When you play Small Favor, increase its cost by 2: Change "Deal 1 damage" to "Deal 2 damage." | [rea…"
…and 5 more: Servant of Brass (10107), Elaborate Distraction (10112), Long Shot (10116), Guerrilla Tactics (60576), Dynamite Blast (50002)
RULING: attacking-enemy vs engaged-enemy: when the card responds to an ATTACK and damages that attacker, it is testless-damage-attacking-enemy even if the card also engages the enemy first (Heroic Rescue 03106 — 'resolve its attack against you instead. Then, deal it 1 damage'; also Hypnotic Gaze). engaged-enemy is for damaging an enemy engaged with you OUTSIDE an attack context (Taunt(3) 60130).

--- testless-damage-attacking-enemy (11 members) ---
MEMBER: Guard Dog (01521) "[reaction] When an enemy attack deals damage to Guard Dog: Deal 1 damage to the attacking enemy."
MEMBER: Hypnotic Gaze (02153) "Fast. Play when an enemy attacks an investigator at your location. | Cancel that attack. Then, reveal a random token from the chaos bag. If it has a [skull], [cultist], […"
MEMBER: Heroic Rescue (03106) "Fast. Play when a non-[[Elite]] enemy would attack another investigator at your location. | Engage that enemy and resolve its attack against you instead. Then, deal it 1 …"
…and 8 more: Hypnotic Gaze (60414), Hypnotic Gaze (60423), Heroic Rescue (06234), Daniela Reyes (08001), Dodge (08026), Guard Dog (09034), Oculus Mortuum (11038), …
RULING: attacking-enemy vs engaged-enemy: when the card responds to an ATTACK and damages that attacker, it is testless-damage-attacking-enemy even if the card also engages the enemy first (Heroic Rescue 03106 — 'resolve its attack against you instead. Then, deal it 1 damage'; also Hypnotic Gaze). engaged-enemy is for damaging an enemy engaged with you OUTSIDE an attack context (Taunt(3) 60130).

--- testless-clue (43 members) ---
MEMBER: Evidence! (01522) "Fast. Play after you defeat an enemy. | Discover 1 clue at your location."
MEMBER: Working a Hunch (01537) "Fast. Play only during your turn. | Discover 1 clue at your location."
MEMBER: Drawn to the Flame (01564) "Draw the top card of the encounter deck. Then, discover 2 clues at your location."
…and 40 more: "Look what I found!" (01579), Scene of the Crime (04103), Lola Santiago (04196), Lesson Learned (60124), Extensive Research (60216), Mysterious Raven (60509), "Look what I found!" (60517), …
RULING: PAIRS WITH clue-discover-* when the discovery is test-free — the discover tag says where, testless-clue says how. Don't drop one for the other.

--- testless-evade (18 members) ---
MEMBER: Stray Cat (01576) "[free] Discard Stray Cat: Automatically evade a non-[[Elite]] enemy at your location."
MEMBER: Cunning Distraction (01578) "<b>Evade.</b> Automatically evade all enemies at your location."
MEMBER: Fire Extinguisher (02114) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. | [action] Exile Fire Extinguisher: <b>Evade.</b> You get +3 [agility] for this test. If you are successful, …"
…and 15 more: Survival Instinct (02235), Impromptu Barrier (04312), Disc of Itzamna (60207), Decoy (05234), Pendant of the Queen (06022), Expeditious Retreat (06246), Trish Scarborough (07003), …

--- testless-damage-evaded-enemy (11 members) ---
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Blinding Light (01569) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
MEMBER: Ineffable Truth (60409) "Uses (3 charges). | [action] Spend 1 charge: <b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the evaded enemy. …"
…and 8 more: Ineffable Truth (60427), Ineffable Truth (60432), Rita Young (05005), "I'm done runnin'!" (05016), Exploit Weakness (09105), Dial of Ancients (11047), Bum's Rush (11055), …
RULING: attacking-enemy vs engaged-enemy: when the card responds to an ATTACK and damages that attacker, it is testless-damage-attacking-enemy even if the card also engages the enemy first (Heroic Rescue 03106 — 'resolve its attack against you instead. Then, deal it 1 damage'; also Hypnotic Gaze). engaged-enemy is for damaging an enemy engaged with you OUTSIDE an attack context (Taunt(3) 60130).

--- testless-damage-engaged-enemy (7 members) ---
MEMBER: Zoey's Cross (02006) "Zoey Samaras deck only. | [reaction] After an enemy becomes engaged with you, exhaust Zoey's Cross and spend 1 resource: Deal 1 damage to that enemy."
MEMBER: Mano a Mano (03229) "Play only as your first action. | Deal 1 damage to an enemy engaged with you. This action does not provoke attacks of opportunity."
MEMBER: Mano a Mano (60125) "Play only as your first action. | Deal 2 damage to an enemy engaged with you. This action does not provoke attacks of opportunity."
…and 4 more: Taunt (60130), The Necronomicon (60233), Explosive Ward (09087), Sword Cane (11074)
RULING: attacking-enemy vs engaged-enemy: when the card responds to an ATTACK and damages that attacker, it is testless-damage-attacking-enemy even if the card also engages the enemy first (Heroic Rescue 03106 — 'resolve its attack against you instead. Then, deal it 1 damage'; also Hypnotic Gaze). engaged-enemy is for damaging an enemy engaged with you OUTSIDE an attack context (Taunt(3) 60130).

==== FILE: src/tags/timing/after.ts ====
import { TagBase } from "../../base.js";

// Timing triggers that occur after specific game events
export enum TagTypeTimingAfter {
  TimingAfterEnemyAttacks = "timing-after-enemy-attacks",
  TimingAfterEnemyDealDamageSelf = "timing-after-enemy-deal-damage-self",
  TimingAfterEnemyDealDamageYou = "timing-after-enemy-deal-damage-you",
  TimingAfterEnemyDealDamageInvestigator = "timing-after-enemy-deal-damage-investigator",
  TimingAfterEntersPlay = "timing-after-enters-play",
  TimingAfterSuccessfullyInvestigate = "timing-after-successfully-investigate",
  TimingAfterFailSkillTest = "timing-after-fail-skill-test",
  TimingAfterEngageEnemy = "timing-after-engage-enemy",
  TimingAfterEvadeEnemy = "timing-after-evade-enemy",
  TimingAfterPlayCardOfTrait = "timing-after-play-card-of-trait",
  TimingAfterHealHorror = "timing-after-heal-horror",
  TimingAfterDiscoverClue = "timing-after-discover-clue",
  TimingAfterDrawCard = "timing-after-draw-card",
}

interface TagTimingAfterBase extends TagBase {}

export interface TagTimingAfterEnemyAttacks extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEnemyAttacks;
}

export interface TagTimingAfterEnemyDealDamageSelf extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEnemyDealDamageSelf;
}

export interface TagTimingAfterEnemyDealDamageYou extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEnemyDealDamageYou;
}

export interface TagTimingAfterEnemyDealDamageInvestigator extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEnemyDealDamageInvestigator;
}

export interface TagTimingAfterEntersPlay extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEntersPlay;
}

export interface TagTimingAfterSuccessfullyInvestigate extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterSuccessfullyInvestigate;
}

/**
 * The "after you fail a skill test" reaction/play window — the defining Survivor
 * fail-forward trigger. Distinct from SkillTestConditionFail (a result-gate).
 */
export interface TagTimingAfterFailSkillTest extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterFailSkillTest;
}

/** "After you engage an enemy" trigger (e.g. Zoey's Cross). */
export interface TagTimingAfterEngageEnemy extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEngageEnemy;
}

/** Reaction/play window after an enemy is evaded (you evade, or an enemy at your location is evaded) — the evade counterpart to timing-after-engage-enemy. */
export interface TagTimingAfterEvadeEnemy extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterEvadeEnemy;
}

/**
 * Reaction/forced trigger firing 'after you play a card of trait X' (Heirloom of
 * Hyperborea) or of card type Y (Wendy's Amulet, Double Double: "after you play an
 * event"). Give at least one of `trait` / `cardType`. Distinct from trait-support-X
 * (synergy, not a timing window).
 */
export interface TagTimingAfterPlayCardOfTrait extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterPlayCardOfTrait;
  /** The played card's trait, e.g. "Spell", "Item", "Tactic". */
  trait?: string;
  /** The played card's type, when the trigger keys on type instead of trait. */
  cardType?: "event" | "asset" | "skill";
}

/**
 * Reaction window "after a card effect heals horror" (Carolyn Fern, Hypnotic
 * Therapy) — the heal-payoff trigger, distinct from the heal effect itself
 * (TagTypeHeal, which these cards reward rather than perform).
 */
export interface TagTimingAfterHealHorror extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterHealHorror;
}

/**
 * Reaction window "after you discover a clue" (Alice Luxley, Hawk-Eye Folding
 * Camera). Fires on clue DISCOVERY by any means, including testless — distinct
 * from timing-after-successfully-investigate, which keys on the investigate test.
 */
export interface TagTimingAfterDiscoverClue extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterDiscoverClue;
}

/**
 * Reaction window "after you draw a card" (conditions may narrow WHICH card —
 * Dream-Enhancing Serum fires on drawing a duplicate). NOT for a card reacting
 * to drawing ITSELF (Cryptic Writings — a play-from-hand trigger) and NOT for
 * encounter draws ("You handle this one!").
 */
export interface TagTimingAfterDrawCard extends TagTimingAfterBase {
  type: TagTypeTimingAfter.TimingAfterDrawCard;
}

--- timing-after-enemy-attacks (8 members) ---
MEMBER: Counterpunch (60112) "Fast. Play after an enemy attacks you, even if that attack was canceled. | <b>Fight.</b> This attack targets the attacking enemy."
MEMBER: Daniela Reyes (08001) "[reaction] After an enemy attacks you (except an attack of opportunity you provoked), even if that attack was canceled: Either deal 1 damage to that enemy, or automatical…"
MEMBER: Bangle of Jinxes (08075) "Uses (1 charge). | [fast] Spend 1 charge: You get +2 skill value for this test. (Limit once per test.) | [reaction] After an enemy attacks you: Place 1 charge on Bangle o…"
…and 5 more: Blood Will Have Blood (08079), Service Revolver (60158), Restrained (60165), Daniela Reyes (12001), Lesson Learned (12022)

--- timing-after-enemy-deal-damage-self (2 members) ---
MEMBER: Guard Dog (01521) "[reaction] When an enemy attack deals damage to Guard Dog: Deal 1 damage to the attacking enemy."
MEMBER: Guard Dog (09034) "[fast] Exhaust Guard Dog: Engage an enemy at your location. That enemy attacks you. | [reaction] When an enemy attack deals damage and/or horror to Guard Dog: Deal 1 dama…"

--- timing-after-enemy-deal-damage-you (3 members) ---
MEMBER: Survival Knife (04017) "[action]: <b>Fight.</b> You get +1 [combat] for this attack. | [reaction] After an enemy attack deals damage to you during the enemy phase, exhaust Survival Knife: <b>Fig…"
MEMBER: Flesh Ward (60106) "Uses (4 charges). | [reaction] When you are dealt damage and/or horror from an enemy attack, exhaust Flesh Ward and spend 1 charge: Cancel 1 damage or horror just dealt f…"
MEMBER: Lesson Learned (60124) "Fast. Play after you take damage from an enemy attack. | Discover 2 clues at your location."

--- timing-after-enemy-deal-damage-investigator (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-after-enters-play (39 members) ---
MEMBER: Research Librarian (01532) "[reaction] After Research Librarian enters play: Search your deck for a [[Tome]] asset and add it to your hand. Shuffle your deck."
MEMBER: Arcane Initiate (01563) "<b>Forced</b> - After Arcane Initiate enters play: Place 1 doom on it. | [free] Exhaust Arcane Initiate: Search the top 3 cards of your deck for a [[Spell]] card and draw…"
MEMBER: Laboratory Assistant (02020) "Your maximum hand size is increased by 2. | [reaction] After Laboratory Assistant enters play: Draw 2 cards."
…and 36 more: Art Student (02149), The Red-Gloved Man (02310), Arcane Initiate (03271), Dr. Elli Horowitz (04021), Backpack (04037), Randall Cho (60102), Laboratory Assistant (60212), …

--- timing-after-successfully-investigate (12 members) ---
MEMBER: Dr. Milan Christopher (01533) "You get +1 [intellect]. | [reaction] After you successfully investigate: Gain 1 resource."
MEMBER: Scavenging (01573) "[reaction] After you successfully investigate by 2 or more, exhaust Scavenging: Choose an [[Item]] card in your discard pile and add it to your hand."
MEMBER: Vault of Knowledge (60202) "Harvey Walters deck only. | Your maximum hand size is increased by 2. | [reaction] After you successfully investigate, exhaust Vault of Knowledge and choose an investigat…"
…and 9 more: Scavenging (06332), Archive of Conduits (08033), Michael Leigh (08086), Professor William Webb (08104), Professor William Webb (08106), "I'll take that!" (09067), Dr. Charles West III (10041), …
RULING: PERSISTENT reaction firing after ANY investigation (Dr. Milan Christopher, Scavenging, Vault of Knowledge). A card's own 'Investigate. If you succeed, …' uses skill-test-condition-successful, NOT this tag (Deduction, Pilfer, Winging It, Seeking Answers, Clairvoyance were all de-tagged).

--- timing-after-fail-skill-test (31 members) ---
MEMBER: Rabbit's Foot (01575) "[reaction] After you fail a skill test, exhaust Rabbit's Foot: Draw 1 card."
MEMBER: "Look what I found!" (01579) "Fast. Play after you fail a skill test by 2 or less while investigating. | Discover 2 clues in your location."
MEMBER: Oops! (02113) "Fast. Play after you fail a skill test by 2 or less while attacking an enemy engaged with you. | Deal this attack's damage to a different enemy at your location."
…and 28 more: Try and Try Again (02309), Dumb Luck (04034), Live and Learn (04200), Try and Try Again (04159), Stella Clark (60501), Atychiphobia (60504), Grimm's Fairy Tales (60506), …

--- timing-after-engage-enemy (6 members) ---
MEMBER: Zoey's Cross (02006) "Zoey Samaras deck only. | [reaction] After an enemy becomes engaged with you, exhaust Zoey's Cross and spend 1 resource: Deal 1 damage to that enemy."
MEMBER: Stouthearted (10017) "Hank Samson deck only. | Fast. Play when you engage a non-[[Elite]] enemy. | Move up to 2 damage and/or horror from Hank Samson to that enemy, as damage."
MEMBER: Bewitching (10079) "Permanent. Exceptional. | [reaction] Before you draw your opening hand: Search your deck for up to 3 different [[Trick]] cards, and attach them facedown to Bewitching. Sh…"
…and 3 more: Obscure (11060), Hunter's Instinct (60574), Hunter's Instinct (12074)

--- timing-after-evade-enemy (19 members) ---
MEMBER: Pickpocketing (01546) "[reaction] After you evade an enemy, exhaust Pickpocketing: Draw 1 card."
MEMBER: Close Call (01583) "Fast. Play after a non-weakness, non-[[Elite]] enemy at your location is evaded. | Shuffle that enemy into the encounter deck."
MEMBER: Pickpocketing (03195) "Fast. | [reaction] After you evade an enemy, exhaust Pickpocketing: Draw 1 card or gain 1 resource. If you succeeded by 2 or more, do both instead."
…and 16 more: Rita Young (05005), "I'm done runnin'!" (05016), Belly of the Beast (05160), .25 Automatic (07305), "I'll take that!" (09067), Dirty Fighting (09073), Microscope (10042), …

--- timing-after-play-card-of-trait (23 members) ---
MEMBER: Heirloom of Hyperborea (01512) "Agnes Baker deck only. | [reaction] After you play a [[Spell]] card: Draw 1 card."
MEMBER: Wendy's Amulet (01514) "Wendy Adams deck only. | You may play the topmost event in your discard pile as if it were in your hand. | <b>Forced</b> - After you play an event or discard an event fro…"
MEMBER: Fence (04108) "[reaction] When you play an [[Illicit]] card during your turn, exhaust Fence: The [[Illicit]] card gains fast. If it was already fast, reduce its cost by 1 instead."
…and 20 more: On Your Own (04236), Chuck Fergus (60332), Chuck Fergus (60332), Robes of Endless Night (60412), Robes of Endless Night (60422), Double, Double (05320), Crystallizer of Dreams (06024), …
RULING: trait is OPTIONAL; optional cardType ("event"|"asset"|"skill") covers 'after you play an event' (Wendy's Amulet 01514 {cardType:"event"}, Double Double 05320).

--- timing-after-heal-horror (5 members) ---
MEMBER: Carolyn Fern (05001) "[reaction] After one of your card effects heals horror from an investigator or [[Ally]] asset: The healed card's controller gains 1 resource. | [elder_sign] effect: +1. Y…"
MEMBER: Hypnotic Therapy (05007) "Carolyn Fern deck only. | [action] Exhaust Hypnotic Therapy: Test [intellect] (2). If you succeed, heal 1 horror from an investigator at your location. Then, that investi…"
MEMBER: Carolyn Fern (60251) "[reaction] After you heal 1 or more horror from an investigator or [[Ally]] asset: Discover 1 clue at your location. (Limit once per round.) | [elder_sign] effect: +1. He…"
…and 2 more: Experimental Psychology (60252), Private Practice (60257)
RULING: The heal-payoff archetype window (Carolyn Fern 05001, Hypnotic Therapy 05007).

--- timing-after-discover-clue (12 members) ---
MEMBER: Connect the Dots (05025) "Fast. Play after you discover the last clue at your location. | Discover 2 clues at a location with a lower printed shroud value than your location."
MEMBER: Crack the Case (05110) "Fast. Play after an investigator discovers the last remaining clue at your location. | Investigators at that location gain a total of X resources, distributed as you wish…"
MEMBER: Alice Luxley (05151) "You get +1 [intellect]. | [reaction] After you discover a clue, exhaust Alice Luxley: Deal 1 damage to an enemy at your location."
…and 9 more: Hawk-Eye Folding Camera (05154), Trish Scarborough (07003), Hiking Boots (08035), Darrell's Kodak (09016), Dreams of the Flood (11006), Alice Luxley (11027), Mortar and Pestle (11037), …
RULING: Fires on clue DISCOVERY including testless discovery (Alice Luxley 05151, Hawk-Eye Camera 05154) — broader than timing-after-successfully-investigate.

--- timing-after-draw-card (1 member) ---
MEMBER: Dream-Enhancing Serum (06159) "Only the first copy of each card in your hand counts toward your maximum hand size. | [reaction] After you draw a copy of a card that is already in your hand, reveal both…"
RULING: Generic 'after you draw a card' reaction windows (Dream-Enhancing Serum's duplicate trigger). NOT for drawing ITSELF (Cryptic Writings = play-from-hand trigger) and NOT encounter draws ('You handle this one!' = encounter-offload).

==== FILE: src/tags/timing/during.ts ====
import { TagBase } from "../../base.js";

// Timing triggers that occur during specific periods
export enum TagTypeTimingDuring {
  TimingDuringYourTurn = "timing-during-your-turn",
}

interface TagTimingDuringBase extends TagBase {}

export interface TagTimingDuringYourTurn extends TagTimingDuringBase {
  type: TagTypeTimingDuring.TimingDuringYourTurn;
}

--- timing-during-your-turn (80 members) ---
MEMBER: Mind over Matter (01536) "Fast. Play only during your turn. | Until the end of the round, you may use your [intellect] in place of your [combat] and [agility]."
MEMBER: Working a Hunch (01537) "Fast. Play only during your turn. | Discover 1 clue at your location."
MEMBER: Cryptic Research (01543) "Fast. Play only during your turn. | Choose an investigator at your location. That investigator draws 3 cards."
…and 77 more: Elusive (01550), Will to Survive (01585), Taunt (02017), Taunt (02019), Shortcut (02022), Pathfinder (02108), Ace in the Hole (02266), …

==== FILE: src/tags/timing/forced.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeTimingForced {
  TimingForcedEntersLocation = "timing-forced-enters-location",
  // id neutralized 2026-07-16 (Tetsuo Mori responds with a [reaction], not Forced):
  // a timing WINDOW is neutral — same precedent as timing-when-take-damage/-horror below.
  TimingForcedLeavesPlay = "timing-when-leaves-play",
  TimingForcedSpawnYourLocation = "timing-forced-spawn-your-location",
  TimingForcedWhenTakeDamage = "timing-when-take-damage",
  TimingForcedWhenTakeHorror = "timing-when-take-horror",
}

interface TagTimingForcedBase extends TagBase {}

export interface TagTimingForcedEntersLocation extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedEntersLocation;
}

export interface TagTimingForcedLeavesPlay extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedLeavesPlay;
}

export interface TagTimingForcedSpawnYourLocation extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedSpawnYourLocation;
}

export interface TagTimingForcedWhenTakeDamage extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedWhenTakeDamage;
}

export interface TagTimingForcedWhenTakeHorror extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedWhenTakeHorror;
}

--- timing-forced-enters-location (12 members) ---
MEMBER: Snare Trap (03199) "Attach to your location. Limit 1 per location. | <b>Forced</b> - After a non-[[Elite]] enemy enters attached location: Exhaust that enemy, disengage it from all investiga…"
MEMBER: Under Surveillance (07157) "Attach to your location. Limit 1 per location. | <b>Forced</b> - After a non-[[Elite]] enemy enters attached location, discard Under Surveillance: Automatically evade tha…"
MEMBER: Doppelgänger (11058) "Myriad. Fast. Play only during your turn. | Attach to your location. Limit 1 per location. | [reaction] After an enemy enters or leaves attached location, return Doppelgä…"
…and 9 more: Decoy Trap (60562), Glassing (60563), Hidden Shelter (60565), Lie in Wait (60566), Rope Trap (60578), Makeshift Bomb (60581), Gather Intel (12036), …

--- timing-when-leaves-play (22 members) ---
MEMBER: Brother Xavier (02106) "You get +1 [willpower]. | Brother Xavier may be assigned damage and/or horror dealt to other investigators at your location. | [reaction] When Brother Xavier is defeated:…"
MEMBER: Key of Ys (03315) "You get +1 to each of your skills for each horror on Key of Ys. | <b>Forced</b> - When any amount of horror would be placed on you: Place 1 of that horror on Key of Ys. |…"
MEMBER: Cherished Keepsake (60520) "<b>Forced</b> - When Cherished Keepsake is defeated by horror: Exile it."
…and 19 more: Leather Coat (60521), Guiding Spirit (05236), Hallowed Mirror (05313), Occult Lexicon (05316), Miss Doyle (06030), Tetsuo Mori (06155), Nightmare Bauble (06330), …

--- timing-forced-spawn-your-location (1 member) ---
MEMBER: Ambush (03148) "Attach to your location. | If there are no investigators at attached location, discard Ambush. | <b>Forced</b> - After an enemy spawns at attached location: Deal 2 damage…"

--- timing-when-take-damage (26 members) ---
MEMBER: "I've had worse…" (01684) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 5 damage and/or horror just dealt to you. Then, gain that many resources."
MEMBER: "I've had worse…" (02261) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 5 damage and/or horror just dealt to you. Then, gain that many resources."
MEMBER: Mark Harrigan (03001) "You begin the game with Sophie <i>(In Loving Memory)</i> in play. | [reaction] After damage is placed on a card you control: Draw 1 card. (Limit once per phase.) | [elder…"
…and 23 more: Sophie (03009), Armor of Ardennes (03305), Devil's Luck (03157), Miskatonic Archaeology Funding (60232), Baron Samedi (05019), Delay the Inevitable (05021), Deny Existence (05280), …
RULING: A timing WINDOW is neutral — never bake 'forced' into it just because one member responds with a Forced ability (Sophie). How the card responds (Fast event / [reaction] / Forced) is a separate axis.

--- timing-when-take-horror (18 members) ---
MEMBER: "I've had worse…" (01684) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 5 damage and/or horror just dealt to you. Then, gain that many resources."
MEMBER: "I've had worse…" (02261) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 5 damage and/or horror just dealt to you. Then, gain that many resources."
MEMBER: Devil's Luck (03157) "Fast. Play when you are dealt damage and/or horror. | Cancel up to 10 damage and/or horror just dealt to you. Exile Devil's Luck."
…and 15 more: Key of Ys (03315), Miskatonic Archaeology Funding (60232), Delay the Inevitable (05021), Deny Existence (05280), "I've had worse…" (05315), Narcolepsy (06037), Enchanted Armor (07189), …

==== FILE: src/tags/timing/game.ts ====
import { TagBase } from "../../base.js";

// Game-level timing points
export enum TagTypeTimingGame {
  TimingGameDrawOpeningHands = "timing-game-draw-opening-hands",
  TimingGameBegins = "timing-game-begins",
  TimingGameEnds = "timing-game-ends",
}

interface TagTimingGameBase extends TagBase {}

export interface TagTimingGameDrawOpeningHands extends TagTimingGameBase {
  type: TagTypeTimingGame.TimingGameDrawOpeningHands;
}

export interface TagTimingGameBegins extends TagTimingGameBase {
  type: TagTypeTimingGame.TimingGameBegins;
}

export interface TagTimingGameEnds extends TagTimingGameBase {
  type: TagTypeTimingGame.TimingGameEnds;
}

--- timing-game-draw-opening-hands (9 members) ---
MEMBER: Sefina Rousseau (03003) "<b>Forced</b> - When you would draw your opening hand: Draw 13 cards, instead. Choose up to 5 events to place beneath this card and keep 8 cards as your opening hand. Dis…"
MEMBER: Lola Hayes (03006) "<b>Forced</b> - After you draw your opening hand: Choose a role ([survivor], [guardian], [seeker], [rogue], [mystic], or Neutral). | You can only play, commit, or trigger…"
MEMBER: Stick to the Plan (03264) "Permanent. Exceptional. | [reaction] Before you draw your opening hand: Search your deck for up to 3 different [[Tactic]] and/or [[Supply]] events, and attach them facedo…"
…and 6 more: Studious (05276), Ancestral Knowledge (07303), Underworld Market (09077), Bewitching (10079), Eldritch Brand (11080), Studious (12042)

--- timing-game-begins (22 members) ---
MEMBER: Mark Harrigan (03001) "You begin the game with Sophie <i>(In Loving Memory)</i> in play. | [reaction] After damage is placed on a card you control: Draw 1 card. (Limit once per phase.) | [elder…"
MEMBER: Ace of Swords (05023) "You get +1 [combat]. | [reaction] When the game begins, if Ace of Swords is in your opening hand: Put it into play."
MEMBER: Death • XIII (05027) "You get +1 [intellect]. | [reaction] When the game begins, if Death • XIII is in your opening hand: Put it into play."
…and 19 more: The Moon • XVIII (05031), Four of Cups (05035), Five of Pentacles (05039), Ace of Rods (05040), Another Day, Another Dollar (05278), Anna Kaslow (05283), Luke Robinson (06004), …

--- timing-game-ends (10 members) ---
MEMBER: Angered Spirits (03015) "<b>Revelation</b> - Put Angered Spirits into play in your threat area. | [free] Exhaust a [[Spell]] asset: Move 1 charge from that asset to Angered Spirits. | <b>Forced</…"
MEMBER: Dark Pact (04038) "Campaign Mode only. | Deal 2 damage to an investigator at your location. | <b>Forced</b> - When the game ends or you are eliminated, if Dark Pact is still in your hand: R…"
MEMBER: Unsolved Case (05010) "Place 1 of your clues on the location with the highest shroud. Remove Unsolved Case from the game. | <b>Forced</b> - If Unsolved Case would be shuffled into your hunch de…"
…and 7 more: Lodge "Debts" (05012), Unscrupulous Loan (08113), Embezzled Treasure (09063), Unbroken Web (60253), In Harm's Way (12003), Dead Ends (12006), Unspeakable Oath (52012)

==== FILE: src/tags/timing/phase-sequence.ts ====
import { TagBase } from "../../base.js";
import type { TimingQualifier } from "../../type.js";

// Framework event timing for the four main phases and their steps
export enum TagTypeTimingPhaseSequence {
  // I. Mythos phase
  // 1.1 Mythos phase begins
  PhaseMythosBegins = "timing-phase-mythos-begins",
  // 1.2 Place 1 doom on current agenda
  PhaseMythosPlaceDoom = "timing-phase-mythos-place-doom",
  // 1.3 Check doom threshold (agenda may advance)
  PhaseMythosCheckDoom = "timing-phase-mythos-check-doom",
  // 1.4 Each investigator draws 1 encounter card
  PhaseMythosDrawEncounter = "timing-phase-mythos-draw-encounter",
  // 1.5 Mythos phase ends
  PhaseMythosEnds = "timing-phase-mythos-ends",
  
  // II. Investigation phase
  // 2.1 Investigation phase begins
  PhaseInvestigationBegins = "timing-phase-investigation-begins",
  // 2.2 Next investigator's turn begins
  PhaseInvestigationTurnBegins = "timing-phase-investigation-turn-begins",
  // 2.2.1 Investigator takes an action
  PhaseInvestigationTakeAction = "timing-phase-investigation-take-action",
  // 2.2.2 Investigator's turn ends
  PhaseInvestigationTurnEnds = "timing-phase-investigation-turn-ends",
  // 2.3 Investigation phase ends
  PhaseInvestigationEnds = "timing-phase-investigation-ends",
  
  // III. Enemy phase
  // 3.1 Enemy phase begins
  PhaseEnemyBegins = "timing-phase-enemy-begins",
  // 3.2 Hunter enemies move
  PhaseEnemyHunterMove = "timing-phase-enemy-hunter-move",
  // 3.3 Next investigator resolves engaged enemy attacks
  PhaseEnemyAttacks = "timing-phase-enemy-attacks",
  // 3.4 Enemy phase ends
  PhaseEnemyEnds = "timing-phase-enemy-ends",
  
  // IV. Upkeep phase
  // 4.1 Upkeep phase begins
  PhaseUpkeepBegins = "timing-phase-upkeep-begins",
  // 4.2 Reset actions
  PhaseUpkeepResetActions = "timing-phase-upkeep-reset-actions",
  // 4.3 Ready exhausted cards
  PhaseUpkeepReadyCards = "timing-phase-upkeep-ready-cards",
  // 4.4 Each investigator draws 1 card and gains 1 resource
  PhaseUpkeepDrawResource = "timing-phase-upkeep-draw-resource",
  // 4.5 Each investigator checks hand size
  PhaseUpkeepCheckHandSize = "timing-phase-upkeep-check-hand-size",
  // 4.6 Upkeep phase ends (also formalizes end of round)
  PhaseUpkeepEnds = "timing-phase-upkeep-ends",
}

interface TagTimingPhaseSequenceBase extends TagBase {
  timing: TimingQualifier;
}

// I. Mythos phase

// 1.1 Mythos phase begins.
// This step formalizes the beginning of the mythos phase.
// As this is the first framework event of the round, it also formalizes the beginning of a new game round.
export interface TagTimingPhaseMythosBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosBegins;
}

// 1.2 Place 1 doom on the current agenda.
// Take 1 doom from the token pool, and place it on the current agenda card.
export interface TagTimingPhaseMythosPlaceDoom extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosPlaceDoom;
}

// 1.3 Check doom threshold.
// Compare the total number of doom in play with the doom threshold of the current agenda.
// If the value of doom in play equals or exceeds the doom threshold, the agenda deck advances.
export interface TagTimingPhaseMythosCheckDoom extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosCheckDoom;
}

// 1.4 Each investigator draws 1 encounter card.
// In player order, each investigator draws the top card of the encounter deck,
// resolves any revelation abilities, and follows instructions based on card type.
export interface TagTimingPhaseMythosDrawEncounter extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosDrawEncounter;
}

// 1.5 Mythos phase ends.
// This step formalizes the end of the mythos phase.
export interface TagTimingPhaseMythosEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosEnds;
}

// II. Investigation phase

// 2.1 Investigation phase begins.
// This step formalizes the beginning of the investigation phase.
export interface TagTimingPhaseInvestigationBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationBegins;
}

// 2.2 Next investigator's turn begins.
// The investigators may take their turns in any order.
// The investigator taking his or her turn is known as the "active investigator."
export interface TagTimingPhaseInvestigationTurnBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationTurnBegins;
}

// 2.2.1 Investigator takes an action, if able.
// During his or her turn, an investigator is permitted to take three actions.
// Actions include: investigate, move, draw, resource, play card, activate ability, fight, engage, evade.
export interface TagTimingPhaseInvestigationTakeAction extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationTakeAction;
}

// 2.2.2 Investigator's turn ends.
// Flip the active investigator's mini card to its colorless side.
export interface TagTimingPhaseInvestigationTurnEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationTurnEnds;
}

// 2.3 Investigation phase ends.
// This step formalizes the end of the investigation phase.
export interface TagTimingPhaseInvestigationEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationEnds;
}

// III. Enemy phase

// 3.1 Enemy phase begins.
// This step formalizes the beginning of the enemy phase.
export interface TagTimingPhaseEnemyBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseEnemyBegins;
}

// 3.2 Hunter enemies move.
// Resolve the hunter keyword for each ready, unengaged enemy that has the hunter keyword.
export interface TagTimingPhaseEnemyHunterMove extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseEnemyHunterMove;
}

// 3.3 Next investigator resolves engaged enemy attacks.
// Resolve engaged enemy attacks in player order.
// Each ready, engaged enemy makes an attack against the investigator to which it is engaged.
export interface TagTimingPhaseEnemyAttacks extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseEnemyAttacks;
}

// 3.4 Enemy phase ends.
// This step formalizes the end of the enemy phase.
export interface TagTimingPhaseEnemyEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseEnemyEnds;
}

// IV. Upkeep phase

// 4.1 Upkeep phase begins.
// This step formalizes the beginning of the upkeep phase.
export interface TagTimingPhaseUpkeepBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepBegins;
}

// 4.2 Reset actions.
// Flip each investigator's mini card back to its colored side.
export interface TagTimingPhaseUpkeepResetActions extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepResetActions;
}

// 4.3 Ready exhausted cards.
// Simultaneously ready each exhausted card.
export interface TagTimingPhaseUpkeepReadyCards extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepReadyCards;
}

// 4.4 Each investigator draws 1 card and gains 1 resource.
// In player order, each investigator draws 1 card, then each gains 1 resource.
export interface TagTimingPhaseUpkeepDrawResource extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepDrawResource;
}

// 4.5 Each investigator checks hand size.
// In player order, each investigator with more than 8 cards in hand discards down to 8.
export interface TagTimingPhaseUpkeepCheckHandSize extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepCheckHandSize;
}

// 4.6 Upkeep phase ends.
// This step formalizes the end of the upkeep phase.
// As the upkeep phase is the final phase in the round, this also formalizes the end of the round.
export interface TagTimingPhaseUpkeepEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepEnds;
}

--- timing-phase-mythos-begins (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-phase-mythos-place-doom (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-phase-mythos-check-doom (1 member) ---
MEMBER: Mystifying Song (05018) "Marie Lambeau deck only. | Fast. Play when the agenda would advance by reaching its doom threshold. | Until the end of the phase, the agenda cannot advance by reaching it…"

--- timing-phase-mythos-draw-encounter (5 members) ---
MEMBER: On the Hunt (03263) "Fast. Play when you would draw an encounter card during the mythos phase. | Instead, search the top 9 cards of the encounter deck for an enemy, spawn it engaged with you …"
MEMBER: First Watch (06110) "Fast. Play when the "draw encounter cards" step of the mythos phase would begin. | Instead of resolving that step, look at the top X cards of the encounter deck, where X …"
MEMBER: A Watchful Peace (07269) "As an additional cost to play A Watchful Peace, search the chaos bag and/or cards in play for a total of 5 [bless] tokens and return them to the token pool. | Fast. Play …"
…and 2 more: On the Hunt (08028), Deliverance (11079)

--- timing-phase-mythos-ends (3 members) ---
MEMBER: The Red-Gloved Man (02310) "Fast. | [reaction] After The Red-Gloved Man enters play: Choose two of your skills. While The Red-Gloved Man is in play, raise the base value of each of those skills to 6…"
MEMBER: Delay the Inevitable (05021) "Fast. Play only during your turn. Attach to an investigator at your location, under his or her control. | [reaction] When you are dealt damage and/or horror: Discard Dela…"
MEMBER: Dark Ritual (07026) "Seal (up to 5 [curse]). | <b>Forced</b> - At the end of the mythos phase: You must either spend 1 resource or discard Dark Ritual."

--- timing-phase-investigation-begins (6 members) ---
MEMBER: Joe Diamond (05002) "<b>Forced</b> - When the investigation phase begins: Reveal the top card of your hunch deck. Until the end of the phase, you may play that card as if it were in your hand…"
MEMBER: Amanda Sharpe (07002) "<b>Forced</b> - At the start of the investigation phase: Draw 1 card. Discard the card beneath Amanda Sharpe. Choose a card from your hand and place it beneath her. | <b>…"
MEMBER: Black Market (08055) "Fast. Play at the start of the investigation phase. | One at a time, reveal cards from the top of any investigator deck(s) until exactly 5 cards have been revealed. Set t…"
…and 3 more: Good Weather (11091), Good Weather (11091), Dimensional Vortex (11124)

--- timing-phase-investigation-turn-begins (24 members) ---
MEMBER: On the Lam (01510) ""Skids" O'Toole deck only. | Fast. Play after your turn begins. | Until the end of the round, non-[[Elite]] enemies cannot attack you."
MEMBER: Lone Wolf (02188) "Limit 1 per investigator. | [reaction] When your turn begins, if there are no other investigators at your location: Gain 1 resource."
MEMBER: Leo Anderson (04001) "[reaction] After your turn begins: Play an [[Ally]] asset, reducing its cost by 1. | [elder_sign] effect: +2. Search the top 3 cards of your deck for an [[Ally]] asset an…"
…and 21 more: Borrowed Time (04308), Obsessive (60204), Family Inheritance (05011), Dream Diary (06236), Dream Diary (06237), Dream Diary (06238), In the Shadows (07010), …

--- timing-phase-investigation-take-action (3 members) ---
MEMBER: Haste (06239) "Limit 1 per investigator. | [reaction] After you perform the same type of action twice in a row, exhaust Haste: Take another action of that type again <i>(types include a…"
MEMBER: Leg Injury (08131) "<b>Revelation</b> - Put Leg Injury into play in your threat area. | Leg Injury can be healed as if it were a single point of damage on you <i>(if it is healed, discard it…"
MEMBER: Captivating Performance (11108) "[[Dreamer]], [[Performer]], [[Sorcerer]] deck only. | Limit 1 per investigator. | [reaction] After you perform 3 different types of actions in a row, exhaust Captivating …"

--- timing-phase-investigation-turn-ends (10 members) ---
MEMBER: Peter Sylvestre (02033) "You get +1 [agility]. | [reaction] After your turn ends: Heal 1 horror from Peter Sylvestre."
MEMBER: Peter Sylvestre (02035) "You get +1 [agility] and +1 [willpower]. | [reaction] After your turn ends: Heal 1 horror from Peter Sylvestre."
MEMBER: Dark Future (60403) "<b>Revelation</b> - Put Dark Future into play in your threat area. | You cannot cancel or ignore [elder_sign], [skull], [cultist], [tablet], [elder_thing], and [auto_fail…"
…and 7 more: Jessica Hyde (06118), Monterey Jack (08007), Agatha Crane (11007), Agatha Crane (11008), Library Pass (11099), Library Pass (11118), Frenzied (11129)

--- timing-phase-investigation-ends (1 member) ---
MEMBER: Ultimate Sacrifice (60480) "Fast. Play when the investigation phase ends. | Repeat the investigation phase. At the end of that phase, you are defeated and suffer 1 physical trauma. Max once per game…"

--- timing-phase-enemy-begins (1 member) ---
MEMBER: Infighting (03314) "Fast. Play after the enemy phase begins. | Cancel all attacks made by non-[[Elite]] enemies against you this phase."

--- timing-phase-enemy-hunter-move (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-phase-enemy-attacks (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-phase-enemy-ends (1 member) ---
MEMBER: Hiding Spot (03038) "Fast. Attach Hiding Spot to any location. | Each non-[[Elite]] enemy at attached location gains aloof. | <b>Forced</b> - At the end of the enemy phase, if a ready enemy i…"

--- timing-phase-upkeep-begins (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-phase-upkeep-reset-actions (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-phase-upkeep-ready-cards (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-phase-upkeep-draw-resource (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-phase-upkeep-check-hand-size (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)

--- timing-phase-upkeep-ends (14 members) ---
MEMBER: Hired Muscle (02027) "You get +1 [combat]. | <b>Forced</b> - At the end of the upkeep phase: You must either pay 1 resource or discard Hired Muscle."
MEMBER: Lure (02156) "Attach to your location. | During the enemy phase, each enemy that moves does so along the shortest path toward the attached location, instead of to where it would normal…"
MEMBER: Intrepid (04192) "If this skill test is successful, add Intrepid to your play area as an asset with the text: | "You get +1 [intellect], +1 [combat], and +1 [agility]. | <b>Forced</b> - At…"
…and 11 more: Colt Vest Pocket (04268), Lure (05323), Sister Mary (07001), Tides of Fate (07030), Priest of Two Faiths (07156), Grievous Wound (09027), Scarlet Rot (10089), …

==== FILE: src/tags/timing/skill.ts ====
import { TagBase } from "../../base.js";
import type { TimingQualifier } from "../../type.js";

export enum TagTypeTimingSkill {
  // ST.1 Determine skill type of test. Skill test of that type begins.
  TimingSkillSt1DetermineSkillType = "timing-skill-st1-determine-skill-type",
  
  // ST.2 Commit cards from hand to skill test.
  TimingSkillSt2CommitCards = "timing-skill-st2-commit-cards",
  
  // ST.3 Reveal chaos token.
  TimingSkillSt3RevealChaosToken = "timing-skill-st3-reveal-chaos-token",
  
  // ST.4 Apply chaos symbol effect(s).
  TimingSkillSt4ApplyChaosEffect = "timing-skill-st4-apply-chaos-effect",
  
  // ST.5 Determine investigator's modified skill value.
  TimingSkillSt5DetermineSkillValue = "timing-skill-st5-determine-skill-value",
  
  // ST.6 Determine success/failure of skill test.
  TimingSkillSt6DetermineResult = "timing-skill-st6-determine-result",
  
  // ST.7 Apply skill test results.
  TimingSkillSt7ApplyResults = "timing-skill-st7-apply-results",
  
  // ST.8 Skill test ends.
  TimingSkillSt8TestEnds = "timing-skill-st8-test-ends",
}

interface TagTimingSkillBase extends TagBase {
  timing: TimingQualifier;
}

// ST.1 Determine skill type of test. Skill test of that type begins.
// This step formalizes the beginning of a skill test. There are four types of skill tests:
// willpower tests, intellect tests, combat tests, and agility tests.
export interface TagTimingSkillSt1DetermineSkillType extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt1DetermineSkillType;
}

// ST.2 Commit cards from hand to skill test.
// The investigator performing the skill test may commit any number of cards with an appropriate
// skill icon from their hand. Each other investigator at the same location may commit one card.
export interface TagTimingSkillSt2CommitCards extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt2CommitCards;
}

// ST.3 Reveal chaos token.
// The investigator performing the skill test reveals one chaos token at random from the chaos bag.
export interface TagTimingSkillSt3RevealChaosToken extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt3RevealChaosToken;
}

// ST.4 Apply chaos symbol effect(s).
// Apply any effects initiated by the symbol on the revealed chaos token.
export interface TagTimingSkillSt4ApplyChaosEffect extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt4ApplyChaosEffect;
}

// ST.5 Determine investigator's modified skill value.
// Start with the base skill and apply all active modifiers, including committed icons,
// effects of chaos tokens revealed, and all active card abilities.
export interface TagTimingSkillSt5DetermineSkillValue extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt5DetermineSkillValue;
}

// ST.6 Determine success/failure of skill test.
// Compare the investigator's modified skill value to the difficulty of the skill test.
export interface TagTimingSkillSt6DetermineResult extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt6DetermineResult;
}

// ST.7 Apply skill test results.
// The card ability or game rule that initiated the test indicates the consequences
// of success and/or failure. Resolve the appropriate consequences at this time.
export interface TagTimingSkillSt7ApplyResults extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt7ApplyResults;
}

// ST.8 Skill test ends.
// This step formalizes the end of this skill test. Discard all cards that were committed
// to this skill test, and return all revealed chaos tokens to the chaos bag.
export interface TagTimingSkillSt8TestEnds extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt8TestEnds;
}

--- timing-skill-st1-determine-skill-type (14 members) ---
MEMBER: Recall the Future (04158) "[reaction] When a skill test you are performing begins, if Recall the Future is ready, name a chaos token: If the named chaos token is revealed during this skill test, ex…"
MEMBER: Scrying Mirror (60406) "Uses (4 secrets). | [reaction] After a skill test at your location begins, exhaust Scrying Mirror and spend 1 secret: Perform the "reveal chaos token" step of the test no…"
MEMBER: Crystal Pendulum (60411) "You get +1 [willpower]. | [reaction] After a skill test at your location begins, exhaust Crystal Pendulum: Name a number. If this test succeeds by that number or fails by…"
…and 11 more: Called by the Mists (60503), Money Talks (05029), Drawing Thin (05159), Gregory Gry (06162), Mind's Eye (06328), Amanda Sharpe (07002), Obscure Studies (07008), …

--- timing-skill-st2-commit-cards (4 members) ---
MEMBER: Grisly Totem (05119) "[reaction] After you commit a card to a skill test, exhaust Grisly Totem: That card gains another instance of one of its skill icons of your choice."
MEMBER: Grisly Totem (05194) "[reaction] After you commit a card to a skill test, exhaust Grisly Totem: That card gains another instance of one of its skill icons of your choice. If that skill test is…"
MEMBER: Grisly Totem (05195) "[reaction] After you commit a card to a skill test, exhaust Grisly Totem: That card gains another instance of one of its skill icons of your choice. If that skill test fa…"
…and 1 more: Gift of Nodens (11094)

--- timing-skill-st3-reveal-chaos-token (149 members) ---
MEMBER: Sure Gamble (01556) "Fast. Play after you reveal a chaos token with a negative modifier. | Switch that token's "-" to a "+"."
MEMBER: Shrivelling (01560) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder…"
MEMBER: Blinding Light (01566) "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elde…"
…and 146 more: Blinding Light (01569), Grotesque Statue (01571), Baseball Bat (01574), Will to Survive (01585), Rite of Seeking (01689), Eucatastrophe (01692), Jim's Trumpet (02012), …
RULING: ST.3 of a SKILL TEST ('the investigator performing the skill test reveals one chaos token'). A card that manually reveals tokens outside a test (chaos-reveal-manual gambles) does NOT get this timing tag (ruled 2026-07-13; 7 cards stripped).

--- timing-skill-st4-apply-chaos-effect (4 members) ---
MEMBER: Defiance (04198) "Ignore the effects of all [skull], [cultist], [tablet], and [elder_thing] symbols during this test (including their modifiers)."
MEMBER: Ancient Covenant (07122) "Permanent. Limit 1 [[Covenant]] per deck. | [reaction] When an investigator at your location resolves a [bless] token during a skill test, exhaust Ancient Covenant: Do no…"
MEMBER: Cryptic Grimoire (07191) "Researched. | [reaction] After you resolve 1 or more [curse] tokens during a skill test: Place that many secrets on Cryptic Grimoire. | [reaction] When you play an [[Insi…"
…and 1 more: Cryptic Grimoire (07192)

--- timing-skill-st5-determine-skill-value (6 members) ---
MEMBER: Yaotl (04035) "[free] Exhaust Yaotl: During this skill test, you get a bonus to each skill equal to the number of matching skill icons on the top card of your discard pile (not counting…"
MEMBER: Cornered (04160) "[free] Discard 1 card from your hand: You get +2 skill value for this skill test. (Limit once per test.)"
MEMBER: Ice Pick (08107) "Fast. | [fast] During a skill test while fighting or investigating, exhaust Ice Pick: You get +1 skill value for this test. If you succeed, you may discard Ice Pick to ha…"
…and 3 more: Girish Kadakia (09038), Police Dog (60156), Police Dog (60170)

--- timing-skill-st6-determine-result (14 members) ---
MEMBER: Lucky! (01580) "Fast. Play when you would fail a skill test. | Get +2 to your skill value for that test."
MEMBER: Lucky! (01584) "Fast. Play when you would fail a skill test. | Get +2 to your skill value for that test. Draw 1 card."
MEMBER: Daring Maneuver (03030) "Fast. Play when you would succeed at a skill test. | You get +2 skill value for this test."
…and 11 more: Daring Maneuver (60313), Daring Maneuver (60322), Granny Orne (60508), Granny Orne (60527), Lucky! (60528), Jacob Morrison (07309), Lab Coat (09050), …

--- timing-skill-st7-apply-results (25 members) ---
MEMBER: Rabbit's Foot (01575) "[reaction] After you fail a skill test, exhaust Rabbit's Foot: Draw 1 card."
MEMBER: "Look what I found!" (01579) "Fast. Play after you fail a skill test by 2 or less while investigating. | Discover 2 clues in your location."
MEMBER: Survival Instinct (01581) "If this skill test is successful during an evasion attempt, the evading investigator may immediately disengage from each other enemy engaged with him or her, and may move…"
…and 22 more: Oops! (02113), Lucky Cigarette Case (04107), Dumb Luck (04034), Lucky Cigarette Case (60308), Lucky Cigarette Case (60326), Rabbit's Foot (60510), Dumb Luck (60514), …

--- timing-skill-st8-test-ends (31 members) ---
MEMBER: Seal of the Elder Sign (03312) "Do not reveal chaos tokens from the chaos bag for this test. Treat the chaos token revealed for this test as an [elder_sign]. | When this test ends, remove Seal of the El…"
MEMBER: Ursula Downs (04002) "[reaction] After you move to a location: Take an investigate action. (Limit once per round.) | [elder_sign] effect: +1. After this test ends, you may move to a connecting…"
MEMBER: Father Mateo (04004) "[reaction] When an investigator reveals an [auto_fail] chaos token: Cancel that token and treat it as an [elder_sign] token, instead. (Limit once per game.) | [elder_sign…"
…and 28 more: Live and Learn (04200), Prescient (60419), Live and Learn (60516), Patrice Hathaway (06005), Daring (06111), Practice Makes Perfect (06197), Silas Marsh (07005), …
RULING: 'After this test ends' riders get this window with timing:after — even on a SKILL card (Prescient 60419). The 'skill cards use skill-test-condition-*, not timing tags' convention covers success/fail conditions only; an explicit step-boundary reference like 'after this test ends' is still this timing tag.

==== FILE: src/tags/timing/when.ts ====
import { TagBase } from "../../base.js";

// Consolidated timing triggers from fast/free/reaction
// No longer distinguishes between fast action, free triggered ability, or reaction
export enum TagTypeTimingWhen {
  TimingWhenEnemyAttacks = "timing-when-enemy-attacks",
  TimingWhenDefeatEnemy = "timing-when-defeat-enemy",
  TimingWhenEnemySpawnsYourLocation = "timing-when-enemy-spawns-your-location",
  TimingWhenWouldFailTest = "timing-when-would-fail-test",
  TimingWhenSearchDeck = "timing-when-search-deck",
}

interface TagTimingWhenBase extends TagBase {}

export interface TagTimingWhenEnemyAttacks extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenEnemyAttacks;
}

export interface TagTimingWhenDefeatEnemy extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenDefeatEnemy;
}

export interface TagTimingWhenEnemySpawnsYourLocation extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenEnemySpawnsYourLocation;
}

/** Reactive window at the moment a test WOULD fail (modified value known, failure not yet locked) — lets a last-second boost flip it (Lucky!). Distinct from timing-after-fail-skill-test. */
export interface TagTimingWhenWouldFailTest extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenWouldFailTest;
}

/**
 * Window at the moment an investigator WOULD search a deck (their own or the
 * encounter deck) — Mandy Thompson's signature search-enhancement window.
 * Distinct from deck-search-reaction (a card reacting to being FOUND).
 */
export interface TagTimingWhenSearchDeck extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenSearchDeck;
}

--- timing-when-enemy-attacks (27 members) ---
MEMBER: Dodge (01523) "Fast. Play when an enemy attacks an investigator at your location. | Cancel that attack."
MEMBER: Aquinnah (01582) "[reaction] When an enemy attacks you, exhaust Aquinnah and deal 1 horror to her: Deal that enemy's damage to another enemy at your location, instead. (You still take horr…"
MEMBER: Aquinnah (01691) "[reaction] When an enemy attacks you, exhaust Aquinnah and deal 1 horror to her: Deal that enemy's damage to any enemy at your location, instead. (You still take horror d…"
…and 24 more: Hypnotic Gaze (02153), Aquinnah (02308), Heroic Rescue (03106), Narrow Escape (03267), Suggestion (03268), Dodge (60113), Counterpunch (60122), …

--- timing-when-defeat-enemy (25 members) ---
MEMBER: Evidence! (01522) "Fast. Play after you defeat an enemy. | Discover 1 clue at your location."
MEMBER: "If it bleeds..." (02225) "Fast. Play after you defeat a [[Monster]] enemy. | Each investigator at your location heals horror equal to that enemy's horror value."
MEMBER: William Yorick (03005) "[reaction] After you defeat an enemy: Play an asset from your discard pile <i>(paying its cost)</i>. (Limit once per round.) | [elder_sign] effect: +2. If this test is su…"
…and 22 more: Bury Them Deep (03016), Decorated Skull (04026), Boxing Gloves (60105), Grete Wagner (60107), Glory (60115), Evidence! (60120), Boxing Gloves (60127), …
RULING: A PERSISTENT 'when/after you defeat an enemy' window only. A rider on the card's OWN attack ('Fight. If this attack defeats…') does NOT get this tag — the card's own success is skill-test-condition-successful territory (Meat Cleaver, Timeworn Brand, Coup de Grâce, Enchanted Blade(3), Detective's Colt 05009 all stripped).

--- timing-when-enemy-spawns-your-location (4 members) ---
MEMBER: Disc of Itzamna (01541) "[reaction] When a non-[[Elite]] enemy spawns at your location, discard Disc of Itzamna: Discard that enemy."
MEMBER: Think on Your Feet (02025) "Fast. Play when an enemy would spawn at your location. | Immediately move to a connecting location. (The enemy still spawns at your previous location.)"
MEMBER: Disc of Itzamna (60207) "[reaction] When a non-[[Elite]] enemy spawns at your location, discard Disc of Itzamna: Automatically evade that enemy or deal it 2 damage."
…and 1 more: Fend Off (08082)

--- timing-when-would-fail-test (9 members) ---
MEMBER: Lucky! (01580) "Fast. Play when you would fail a skill test. | Get +2 to your skill value for that test."
MEMBER: Lucky! (01584) "Fast. Play when you would fail a skill test. | Get +2 to your skill value for that test. Draw 1 card."
MEMBER: Granny Orne (60508) "You get +1 [willpower]. | [reaction] When an investigator at your location would fail a skill test, exhaust Granny Orne: That investigator fails by either 1 less or 1 mor…"
…and 6 more: Granny Orne (60527), Lucky! (60528), Jacob Morrison (07309), Lab Coat (09050), Evanescent Ascension (10039), Scrape By (12082)

--- timing-when-search-deck (1 member) ---
MEMBER: Mandy Thompson (06002) "[reaction] When an investigator at your location would search their deck or the encounter deck: They may either search 3 additional cards or resolve 1 additional target o…"

==== FILE: src/tags/trait/support.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeTraitSupport {
  TraitSupportTome = "trait-support-tome",
  TraitSupportFirearm = "trait-support-firearm",
  TraitSupportMelee = "trait-support-melee",
  TraitSupportRanged = "trait-support-ranged",
  TraitSupportSpell = "trait-support-spell",
  TraitSupportInsight = "trait-support-insight",
  TraitSupportTactic = "trait-support-tactic",
  TraitSupportRelic = "trait-support-relic",
  TraitSupportSpirit = "trait-support-spirit",
  TraitSupportPracticed = "trait-support-practiced",
  TraitSupportInnate = "trait-support-innate",
  TraitSupportIllicit = "trait-support-illicit",
  TraitSupportSupply = "trait-support-supply",
  TraitSupportWeapon = "trait-support-weapon",
  TraitSupportScience = "trait-support-science",
  TraitSupportAlly = "trait-support-ally",
  TraitSupportTrick = "trait-support-trick",
  TraitSupportItem = "trait-support-item",
  TraitSupportFortune = "trait-support-fortune",
  TraitSupportCharm = "trait-support-charm",
  TraitSupportArmor = "trait-support-armor",
  TraitSupportTool = "trait-support-tool",
  TraitSupportCreature = "trait-support-creature",
}

interface TagTraitSupportBase extends TagBase {}

export interface TagTraitSupportTome extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportTome;
}

export interface TagTraitSupportFirearm extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportFirearm;
}

export interface TagTraitSupportMelee extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportMelee;
}

export interface TagTraitSupportRanged extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportRanged;
}

export interface TagTraitSupportSpell extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportSpell;
}

export interface TagTraitSupportInsight extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportInsight;
}

export interface TagTraitSupportTactic extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportTactic;
}

export interface TagTraitSupportRelic extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportRelic;
}

export interface TagTraitSupportSpirit extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportSpirit;
}

export interface TagTraitSupportPracticed extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportPracticed;
}

export interface TagTraitSupportInnate extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportInnate;
}

export interface TagTraitSupportIllicit extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportIllicit;
}

export interface TagTraitSupportSupply extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportSupply;
}

export interface TagTraitSupportWeapon extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportWeapon;
}

export interface TagTraitSupportScience extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportScience;
}

export interface TagTraitSupportAlly extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportAlly;
}

export interface TagTraitSupportTrick extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportTrick;
}

export interface TagTraitSupportItem extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportItem;
}

export interface TagTraitSupportFortune extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportFortune;
}

export interface TagTraitSupportCharm extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportCharm;
}

export interface TagTraitSupportArmor extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportArmor;
}

export interface TagTraitSupportTool extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportTool;
}

export interface TagTraitSupportCreature extends TagTraitSupportBase {
  type: TagTypeTraitSupport.TraitSupportCreature;
}

--- trait-support-tome (14 members) ---
MEMBER: Research Librarian (01532) "[reaction] After Research Librarian enters play: Search your deck for a [[Tome]] asset and add it to your hand. Shuffle your deck."
MEMBER: Whitton Greene (60213) "While you control a [[Tome]] or [[Relic]] asset, you get +1 [intellect]. | [reaction] After you reveal a location or put a new location into play, exhaust Whitton Greene:…"
MEMBER: Library Docent (60220) "[reaction] After Library Docent enters play, return a [[Tome]] asset you control to its owner's hand: Play a different [[Tome]] asset (by title) from your hand, reducing …"
…and 11 more: Whitton Greene (60223), Knowledge is Power (05231), Abigail Foreman (06324), Sleuth (08121), The Raven Quill (09042), "Throw the Book at Them!" (10049), Library Pass (11099), …
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-firearm (28 members) ---
MEMBER: Extra Ammunition (01526) "Place 3 ammo tokens on a [[Firearm]] asset controlled by an investigator at your location."
MEMBER: "Eat lead!" (03304) "Fast. Play when you activate the <b>Fight</b> ability on a [[Firearm]] asset. | You may spend X additional ammo tokens from that asset. When you reveal chaos tokens for t…"
MEMBER: Marksmanship (04104) "Fast. Play when you activate the <b>Fight</b> ability on a [[Firearm]] or [[Ranged]] asset. | This attack can target an enemy at a connecting location. Ignore the aloof a…"
…and 25 more: Custom Ammunition (04193), Sharpshooter (60327), Warning Shot (05229), Telescopic Sight (05230), Swift Reload (06161), Snipe (08087), Quickdraw Holster (08089), …
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-melee (3 members) ---
MEMBER: Bruiser (08122) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Bruiser may be spent to pay for [[Armor]], [[Firearm]], or [[Melee]] cards. | [fa…"
MEMBER: Strong-Armed (10031) "While Strong-Armed is committed to an attack using a [[Melee]] or [[Ranged]] asset, this attack deals +1 damage. After revealing chaos token(s) for this skill test, you m…"
MEMBER: Flurry of Blows (10037) "Play only if you control a [[Melee]] asset. As an additional cost to play Flurry of Blows, spend an action. | <b>Fight.</b> Choose a [[Melee]] asset you control and take …"
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-ranged (4 members) ---
MEMBER: Marksmanship (04104) "Fast. Play when you activate the <b>Fight</b> ability on a [[Firearm]] or [[Ranged]] asset. | This attack can target an enemy at a connecting location. Ignore the aloof a…"
MEMBER: Snipe (08087) "During the next fight action you perform this turn using a [[Ranged]] or [[Firearm]] asset, treat each [skull], [cultist], [tablet], [elder_thing], or [auto_fail] token y…"
MEMBER: Strong-Armed (10031) "While Strong-Armed is committed to an attack using a [[Melee]] or [[Ranged]] asset, this attack deals +1 damage. After revealing chaos token(s) for this skill test, you m…"
…and 1 more: Crack Shot (11057)
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-spell (43 members) ---
MEMBER: Heirloom of Hyperborea (01512) "Agnes Baker deck only. | [reaction] After you play a [[Spell]] card: Draw 1 card."
MEMBER: Arcane Initiate (01563) "<b>Forced</b> - After Arcane Initiate enters play: Place 1 doom on it. | [free] Exhaust Arcane Initiate: Search the top 3 cards of your deck for a [[Spell]] card and draw…"
MEMBER: Book of Shadows (01570) "You have 1 additional arcane slot. | [action] Exhaust Book of Shadows: Add 1 charge to a [[Spell]] asset you control."
…and 40 more: Uncage the Soul (03033), Spirit Athame (03035), Grounded (03113), Book of Shadows (03154), Recharge (03197), Arcane Initiate (03271), Arcane Research (04109), …
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-insight (10 members) ---
MEMBER: Eidetic Memory (03306) "Play Eidetic Memory as an exact copy of an [[Insight]] event in any investigator's discard pile <i>(including its resource cost)</i>. Remove that event from the game. Rem…"
MEMBER: Joe Diamond (05002) "<b>Forced</b> - When the investigation phase begins: Reveal the top card of your hunch deck. Until the end of the phase, you may play that card as if it were in your hand…"
MEMBER: Detective's Colt 1911s (05009) "Joe Diamond deck only. Uses (4 ammo). | Up to 2 [[Tool]] assets you control do not take up hand slots. | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] and deal…"
…and 7 more: De Vermis Mysteriis (05235), Cryptic Grimoire (07191), Crafty (08123), Agatha Crane (11007), Agatha Crane (11008), Archibald MacVeigh (11117), Establish Motive (60268)
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-tactic (5 members) ---
MEMBER: Stick to the Plan (03264) "Permanent. Exceptional. | [reaction] Before you draw your opening hand: Search your deck for up to 3 different [[Tactic]] and/or [[Supply]] events, and attach them facedo…"
MEMBER: Chuck Fergus (60332) "[reaction] When you play a [[Tactic]] or [[Trick]] event, exhaust Chuck Fergus: Choose two - | - That event gains fast. | - That event costs 2 fewer resources to play. | …"
MEMBER: Sleuth (08121) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Sleuth may be spent to pay for [[Charm]], [[Tactic]], or [[Tome]] cards. | [fast]…"
…and 2 more: Chuck Fergus (09072), The Book of War (11020)
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-relic (8 members) ---
MEMBER: Recharge (03197) "Choose a [[Spell]] or [[Relic]] asset controlled by an investigator at your location and reveal a random chaos token from the chaos bag. If you reveal a [skull], [cultist…"
MEMBER: Dr. Elli Horowitz (04021) "[reaction] After Dr. Elli Horowitz enters play: Search the top 9 cards of your deck for a [[Relic]] asset and attach it to her. Shuffle your deck. | Each [[Relic]] asset …"
MEMBER: Unearth the Ancients (04024) "<b>Investigate.</b> Choose a [seeker] asset in your hand. The difficulty of this skill test is equal to the chosen asset's printed cost. If you succeed, instead of discov…"
…and 5 more: Whitton Greene (60213), Whitton Greene (60223), Recharge (60429), Unearth the Ancients (08039), Antiquary (08124)
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-spirit (3 members) ---
MEMBER: Boxing Gloves (60105) "You get +1 [combat] while fighting. | [reaction] After you defeat an enemy, exhaust Boxing Gloves: Search the top 6 cards of your deck for a [[Spirit]] event and add it t…"
MEMBER: Boxing Gloves (60127) "You get +2 [combat] while fighting. | [reaction] After you defeat an enemy, exhaust Boxing Gloves: Search the top 9 cards of your deck for a [[Spirit]] event and add it t…"
MEMBER: Prophetic (08120) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Prophetic may be spent to pay for [[Fortune]], [[Spell]], or [[Spirit]] cards. | …"
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-practiced (1 member) ---
MEMBER: Practice Makes Perfect (06197) "Fast. Play during a skill test at your location. | Search the top 9 cards of your deck for a [[Practiced]] skill and commit it to this skill test, if able. Shuffle the re…"
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-innate (1 member) ---
MEMBER: True Survivor (03273) "Return 3 [[Innate]] skills from your discard pile to your hand."
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-illicit (6 members) ---
MEMBER: Smuggled Goods (04010) "Finn Edwards deck only. | Play only if there are no ready enemies at your location. | Search either your discard pile or the top 9 cards of your deck for an [[Illicit]] c…"
MEMBER: Fence (04108) "[reaction] When you play an [[Illicit]] card during your turn, exhaust Fence: The [[Illicit]] card gains fast. If it was already fast, reduce its cost by 1 instead."
MEMBER: Trigger Man (09076) "[reaction] After Trigger Man enters play: Attach an [[Illicit]] asset from your hand to Trigger Man <i>(it is considered to be in play and under your control)</i>. | [fas…"
…and 3 more: Underworld Market (09077), Dirty Deeds (10080), Mob Connections (11059)
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-supply (3 members) ---
MEMBER: Stick to the Plan (03264) "Permanent. Exceptional. | [reaction] Before you draw your opening hand: Search your deck for up to 3 different [[Tactic]] and/or [[Supply]] events, and attach them facedo…"
MEMBER: Backpack (04037) "[reaction] After Backpack enters play: Search the top 6 cards of your deck for up to 3 non-weakness [[Item]] or [[Supply]] cards, and attach them facedown to Backpack. Sh…"
MEMBER: Backpack (53011) "[reaction] After Backpack enters play: Search the top 12 cards of your deck for up to 3 non-weakness [[Item]] or [[Supply]] cards, and attach them facedown to Backpack. S…"
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-weapon (10 members) ---
MEMBER: Prepared for the Worst (02184) "Search the top 9 cards of your deck for a [[Weapon]] asset and add it to your hand. Shuffle your deck."
MEMBER: Randall Cho (60102) "Nathaniel Cho deck only. | [reaction] After Randall Cho enters play: Heal 3 damage or search your deck and discard pile for a [[Weapon]] asset, play it <i>(paying its cos…"
MEMBER: Enchant Weapon (07261) "Attach to a [[Weapon]] asset controlled by an investigator at your location. Limit 1 per asset. | Attached asset gains the [[Relic]] trait and takes up an arcane slot in …"
…and 7 more: Prepared for the Worst (09036), Ad Hoc (10002), Hand-Eye Coordination (10030), False Surrender (10070), Pushed to the Limit (10113), Right Tool for the Job (12023), Jumpsuit (12075)
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-science (1 member) ---
MEMBER: Fine Tuning (10054) "Attach to a [[Tool]] or [[Science]] asset you control. Limit 1 per asset. | [reaction] After attached asset exhausts, exhaust Fine Tuning: Ready attached asset."
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-ally (12 members) ---
MEMBER: Teamwork (02018) "Investigators at your location may give or trade any number of [[Item]] assets, [[Ally]] assets, or resources among one another."
MEMBER: Flare (02115) "Either (choose one): | - <b>Fight.</b> You get +3 [combat] and deal +2 damage for this attack. Exile Flare. | - Search the top 9 cards of any investigator's deck for an […"
MEMBER: A Chance Encounter (02270) "Choose an [[Ally]] asset in any player's discard pile. Put that asset into play under your control. At the end of the round, if that asset is still in play, discard it."
…and 9 more: A Chance Encounter (03238), Calling in Favors (03158), Leo Anderson (04001), Mitch Brown (04006), Trusted (04019), Protecting the Anirniq (08102), Motivational Speech (09028), …
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-trick (5 members) ---
MEMBER: Chuck Fergus (60332) "[reaction] When you play a [[Tactic]] or [[Trick]] event, exhaust Chuck Fergus: Choose two - | - That event gains fast. | - That event costs 2 fewer resources to play. | …"
MEMBER: Crafty (08123) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Crafty may be spent to pay for [[Insight]], [[Tool]], or [[Trick]] cards. | [fast…"
MEMBER: Chuck Fergus (09072) "[reaction] When you play a [[Tactic]] or [[Trick]] event, exhaust Chuck Fergus: Choose one - | - That event gains fast. | - That event costs 2 fewer resources to play. | …"
…and 2 more: Bewitching (10079), Miguel de la Cruz (60551)
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-item (25 members) ---
MEMBER: Scavenging (01573) "[reaction] After you successfully investigate by 2 or more, exhaust Scavenging: Choose an [[Item]] card in your discard pile and add it to your hand."
MEMBER: Teamwork (02018) "Investigators at your location may give or trade any number of [[Item]] assets, [[Ally]] assets, or resources among one another."
MEMBER: Joey "The Rat" Vigil (02265) "[free] Spend 1 resource: Choose an [[Item]] asset from your hand and play it (paying its cost)."
…and 22 more: Charles Ross, Esq. (03149), Sleight of Hand (03029), Reliable (04020), Backpack (04037), Lonnie Ritter (60309), Well-Maintained (05152), Tetsuo Mori (06155), …
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-fortune (1 member) ---
MEMBER: Prophetic (08120) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Prophetic may be spent to pay for [[Fortune]], [[Spell]], or [[Spirit]] cards. | …"
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-charm (2 members) ---
MEMBER: Sleuth (08121) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Sleuth may be spent to pay for [[Charm]], [[Tactic]], or [[Tome]] cards. | [fast]…"
MEMBER: Mirror Form (60465) "Fast. Play only during your turn. | Choose a [[Spell]] or [[Charm]] asset in your hand and put it into play under your control. When the round ends, shuffle that asset in…"
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-armor (1 member) ---
MEMBER: Bruiser (08122) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Bruiser may be spent to pay for [[Armor]], [[Firearm]], or [[Melee]] cards. | [fa…"
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-tool (11 members) ---
MEMBER: Crafty (08123) "Uses (2 resources). Replenish these resources at the start of each round. | Resources on Crafty may be spent to pay for [[Insight]], [[Tool]], or [[Trick]] cards. | [fast…"
MEMBER: Tool Belt (09120) "Each attached asset takes up no slots and its text box is treated as if it were blank (except for [[Traits]]). | [fast] Exhaust Tool Belt: Choose one - attach a [[Tool]] …"
MEMBER: Wilson Richards (10001) "Reduce the resource cost of the first [[Tool]] asset you play each round by 1. | You get +1 skill value during skill tests on [[Tool]] assets. | [elder_sign] effect: +0. …"
…and 8 more: Ad Hoc (10002), Tinker (10028), Hand-Eye Coordination (10030), Fine Tuning (10054), Pushed to the Limit (10113), Nose to the Grindstone (11111), Right Tool for the Job (12023), …
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

--- trait-support-creature (0 members) ---
MEMBER: (none yet — a first application needs extra scrutiny or a noFit flag)
RULING: Only when the card MECHANICALLY supports trait X: boosts/refills/cares about OTHER cards of that trait. Merely HAVING the trait is not support.
RULING: A trait-restricted extra slot does NOT also get trait-support-X — the AdditionalSlot compound already arg-matches the slot (Bandolier, Arcane Enlightenment stripped).

==== FILE: src/tags/uses/accumulate.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeUsesAccumulate {
  UsesAccumulate = "uses-accumulate",
}

interface TagUsesAccumulateBase extends TagBase {}

/**
 * A self-growing counter: place resources from the token pool onto THIS card as
 * a renamed token (evidence/leads/offering) that starts empty and accrues via
 * reactions, later spent. Distinct from UsesStarting (printed pool) and
 * UsesSupport (place/move of an existing type). "tokenName" = the renamed token.
 */
export interface TagUsesAccumulate extends TagUsesAccumulateBase {
  type: TagTypeUsesAccumulate.UsesAccumulate;
  tokenName?: "evidence" | "lead" | "offering" | "charge" | "generic";
}

--- uses-accumulate (28 members) ---
MEMBER: Archaic Glyphs (03025) "[action] Discard a card with at least 1 [intellect] skill icon from your hand: Place 1 resource on Archaic Glyphs from the token pool, as a secret. | <b>Forced</b> - Afte…"
MEMBER: Decorated Skull (04026) "Uses (0 charges). | [reaction] After an investigator, [[Ally]] asset, or enemy at your location is defeated: Place 1 resource <i>(from the token bank)</i> on Decorated Sk…"
MEMBER: Borrowed Time (04308) "Exceptional. | [action]: Place 1 resource on Borrowed Time, as a click (to a maximum of 3 clicks on Borrowed Time). Does not provoke attacks of opportunity. | <b>Forced</…"
…and 25 more: Relentless (60109), Hawk-Eye Folding Camera (05154), Investments (05233), The Hungering Blade (06018), Cryptic Grimoire (07191), Purifying Corruption (07273), The Red Clock (08053), …
RULING: Grow a counter on the card from empty. Card-local tokens are NOT your resource pool — this tag was dropped from the Big Money compound for exactly that confusion.

==== FILE: src/tags/uses/marker.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeUsesMarker {
  UsesBoardMarker = "uses-board-marker",
}

/**
 * Moves its use-tokens onto BOARD entities (locations, enemies, investigators)
 * as markers, later consumed for remote effects — the EOTE leyline/gate family
 * (Archive of Conduits' four gates, Occult Reliquary). Distinct from
 * uses-support (tokens onto other PLAYER cards) and uses-self-place.
 * (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagUsesBoardMarker extends TagBase {
  type: TagTypeUsesMarker.UsesBoardMarker;
}

--- uses-board-marker (6 members) ---
MEMBER: Archive of Conduits (08033) "Limit 1 per deck. As an additional cost to play this asset, place 1 resource on 4 different locations, as leylines. | [reaction] After you successfully investigate a loca…"
MEMBER: Archive of Conduits (08041) "Researched. Uses (4 leylines). Limit 1 per deck. | [fast]: Move 1 leyline from this asset to a non-[[Elite]] enemy. | [action]: Choose an investigator, and an enemy with …"
MEMBER: Archive of Conduits (08042) "Researched. Uses (4 leylines). Limit 1 per deck. | [fast]: Move 1 leyline from this asset to a revealed location. | [action]: Choose an investigator and a revealed locati…"
…and 3 more: Archive of Conduits (08043), Archive of Conduits (08044), Darrell's Kodak (09016)
RULING: AUTONOMOUS TAG (2026-07-17, EOTE ingestion — REVIEW WELCOME): use-tokens moved onto BOARD entities as markers for remote effects (Archive of Conduits gates, Occult Reliquary; 5 members).

==== FILE: src/tags/uses/replenish.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeUsesReplenish {
  UsesReplenish = "uses-replenish",
}

interface TagUsesReplenishBase extends TagBase {}

/**
 * Refilling a limited-use pool (charges/offerings/ammo/secrets), either
 * automatically each round or on a trigger ("replenish this charge the first
 * time a bless token is revealed"). "useType" = which pool is refilled,
 * "conditional" = triggered vs. automatic.
 */
export interface TagUsesReplenish extends TagUsesReplenishBase {
  type: TagTypeUsesReplenish.UsesReplenish;
  useType?: string;
  conditional?: boolean;
}

--- uses-replenish (23 members) ---
MEMBER: Physical Training (60131) "Uses (2 resources). Replenish these resources at the start of each round. | [free] Spend 1 resource from your resource pool or from Physical Training: You get +1 [willpow…"
MEMBER: Arcane Studies (60428) "Uses (2 resources). Replenish these resources at the start of each round. | [fast] Spend 1 resource from your resource pool or from Arcane Studies: You get +1 [willpower]…"
MEMBER: Hyperawareness (07264) "Uses (2 resources). Replenish these resources at the start of each round. | [fast] Spend 1 resource from your resource pool or from Hyperawareness: You get +1 [intellect]…"
…and 20 more: Hard Knocks (07266), Dig Deep (07270), True Magick (08070), Prophetic (08120), Sleuth (08121), Bruiser (08122), Crafty (08123), …
RULING: REQUIRES an explicit cap: either 'Replenish … at the start of each round' (Physical Training / Arcane Studies style) or a printed 'Limit N' line (Ornate Bow 04204). A weapon that merely places a use back on itself with NO written cap is uses-self-place, not replenish.
NOT A MEMBER: .18 Derringer (60505/60522) — self-refund on a miss, no written cap → use uses-self-place
NOT A MEMBER: Chainsaw (60529) — self-refund on a miss, no written cap → use uses-self-place

==== FILE: src/tags/uses/self-place.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeUsesSelfPlace {
  UsesSelfPlace = "uses-self-place",
}

interface TagUsesSelfPlaceBase extends TagBase {
  /** Which use-token pool is placed onto this card ("ammo"/"supply"/"charge"). */
  useType?: string;
  /** True when the placement is triggered (e.g. "on a failed attack, place 1 ammo"); false for a manual action. */
  conditional?: boolean;
}

/**
 * Places a use-token onto THIS card itself (a self-refund) — e.g. .18 Derringer /
 * Chainsaw refunding ammo/supply on a miss, or Ornate Bow's "nock another arrow".
 * Distinct from uses-support (places tokens on OTHER cards) and uses-replenish
 * (auto/triggered refill of a capped pool at round start).
 */
export interface TagUsesSelfPlace extends TagUsesSelfPlaceBase {
  type: TagTypeUsesSelfPlace.UsesSelfPlace;
}

--- uses-self-place (19 members) ---
MEMBER: Ornate Bow (04204) "Uses (1 ammo). Limit 1 ammo on Ornate Bow. | [action] Spend 1 ammo: <b>Fight.</b> This attack uses [agility] instead of [combat]. You get +2 [agility] and deal +2 damage …"
MEMBER: .18 Derringer (60505) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +2 [combat] and deal +1 damage for this attack. If you fail, place 1 ammo on .18 Derringer."
MEMBER: .18 Derringer (60522) "Uses (3 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +2 [combat] and deal +1 damage for this attack. If you fail, place 1 ammo on .18 Derringer and the next time…"
…and 16 more: Chainsaw (60529), Becky (06006), Empty Vessel (06276), Mind's Eye (06328), Armageddon (07117), Eye of Chaos (07118), Shroud of Shadows (07119), …
RULING: The card places a use-token on ITSELF (.18 Derringer, Chainsaw, Ornate Bow). Distinct from uses-support (places on OTHER cards) and uses-replenish (capped auto/triggered refill). An 'on fail' condition is carried by the card's skill-test-condition-fail, not by this tag.

==== FILE: src/tags/uses/starting.ts ====
import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeUsesStarting {
  UsesStartingAmmo = "uses-starting-ammo",
  UsesStartingCharge = "uses-starting-charge",
  UsesStartingSupply = "uses-starting-supply",
  UsesStartingSecret = "uses-starting-secret",
  UsesStartingEvidence = "uses-starting-evidence",
  UsesStartingOffering = "uses-starting-offering",
  UsesStartingResource = "uses-starting-resource",
  UsesStartingInspiration = "uses-starting-inspiration",
  UsesStartingTry = "uses-starting-try",
  UsesStartingKey = "uses-starting-key",
  UsesStartingLock = "uses-starting-lock",
  UsesStartingLeyline = "uses-starting-leyline",
  UsesStartingDurability = "uses-starting-durability",
}

interface TagUsesStartingBase extends TagBase {
    value: DynamicValue;
    /** True when the printed amount is per investigator ("Uses (1 [per_investigator] locks)"). */
    perInvestigator?: boolean;
}

export interface TagUsesStartingAmmo extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingAmmo;
}

export interface TagUsesStartingCharge extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingCharge;
}

export interface TagUsesStartingSupply extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingSupply;
}

export interface TagUsesStartingSecret extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingSecret;
}

export interface TagUsesStartingEvidence extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingEvidence;
}

/** Printed use-token type "offering" (Masks sub-theme). */
export interface TagUsesStartingOffering extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingOffering;
}

/**
 * Printed "Uses (N resources)" as a use-pool stored on the card, distinct from
 * gaining resources to your pool.
 */
export interface TagUsesStartingResource extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingResource;
}

/** New printed use-token type "inspiration" (tdc). */
export interface TagUsesStartingInspiration extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingInspiration;
}

/** Printed use-token type "try" (Try and Try Again). */
export interface TagUsesStartingTry extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingTry;
}

/** Printed use-token type "key" (Old Keyring). */
export interface TagUsesStartingKey extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingKey;
}

/** Printed use-token type "lock" (The Council's Coffer). */
export interface TagUsesStartingLock extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingLock;
}

/** Printed use-token type "leyline" (the EOTE gate family — Archive of Conduits). */
export interface TagUsesStartingLeyline extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingLeyline;
}

/** Printed use-token type "durability" (EOTE tools). */
export interface TagUsesStartingDurability extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingDurability;
}

--- uses-starting-ammo (53 members) ---
MEMBER: Roland's .38 Special (01506) "Roland Banks deck only. | Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack (if there are 1 or more clues on your location, you ge…"
MEMBER: .45 Automatic (01516) "Uses (4 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack. This attack deals +1 damage."
MEMBER: Shotgun (01529) "Uses (2 ammo). | [action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] for this attack. Instead of its standard damage, this attack deals 1 damage for each point you s…"
…and 50 more: .41 Derringer (01547), .41 Derringer (01688), Jenny's Twin .45s (02010), Springfield M1903 (02226), Lightning Gun (02301), Chicago Typewriter (02304), .32 Colt (03020), …
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-charge (94 members) ---
MEMBER: Shrivelling (01560) "Uses (4 charges). | [action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder…"
MEMBER: Scrying (01561) "Uses (3 charges). | [action] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck or the encounter deck. Return them to the top of that …"
MEMBER: Grotesque Statue (01571) "Uses (4 charges). If Grotesque Statue has no charges, discard it. | [reaction] When you would reveal a chaos token, spend 1 charge: Reveal 2 chaos tokens instead of 1. Ch…"
…and 91 more: Rite of Seeking (01689), Scrying (01690), Rite of Seeking (02028), Clarity of Mind (02030), Song of the Dead (02112), Shrivelling (02154), Rite of Seeking (02233), …
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-supply (46 members) ---
MEMBER: First Aid (01519) "Uses (3 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage or horror from an investigator at your location."
MEMBER: Flashlight (01587) "Uses (3 supplies). | [action] Spend 1 supply: <b>Investigate.</b> Your location gets -2 shroud for this investigation."
MEMBER: First Aid (01683) "Uses (4 supplies). If First Aid has no supplies, discard it. | [action] Spend 1 supply: Heal 1 damage and 1 horror from an investigator or [[Ally]] asset in your location…"
…and 43 more: Lockpicks (01687), Liquid Courage (02024), Smoking Pipe (02116), Painkillers (02117), Strange Solution (02262), Strange Solution (02263), Strange Solution (02264), …
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-secret (48 members) ---
MEMBER: Forbidden Knowledge (01558) "Uses (4 secrets). If Forbidden Knowledge has no secrets, discard it. | [free] Exhaust Forbidden Knowledge and take 1 horror: Move 1 secret from Forbidden Knowledge to you…"
MEMBER: Old Book of Lore (01686) "Uses (2 secrets). | [action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of their deck for a card, draws…"
MEMBER: In the Know (03027) "Uses (3 secrets). | [action] Spend 1 secret: <b>Investigate.</b> Investigate any revealed location in play as if you were at that location."
…and 45 more: Feed the Mind (04267), Ancient Stone (04230), Ancient Stone (04231), Pnakotic Manuscripts (04307), Encyclopedia (60208), Feed the Mind (60209), Forbidden Tome (60210), …
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-evidence (1 member) ---
MEMBER: Damning Testimony (09059) "Customizable. Uses (3 evidence). | [action] Exhaust Damning Testimony and choose an enemy at any location: <b>Investigate</b> <i>(your location)</i>. If you succeed, you …"
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-offering (8 members) ---
MEMBER: Shrine of the Moirai (07310) "Attach to your location. Uses (3 offerings). | Attached location gains: "[fast] Draw the top card of the encounter deck, exhaust Shrine of the Moirai, and spend 1 offerin…"
MEMBER: Wolf Mask (10023) "Limit 1 [[Mask]] per investigator. | Uses (2 offerings). Replenish 1 of these offerings after you engage an enemy. | [fast] Spend 1 offering: You get +2 [combat] or +2 [a…"
MEMBER: Mouse Mask (10043) "Limit 1 [[Mask]] per investigator. | Uses (2 offerings). Replenish 1 of these offerings after you reveal a location or put a new location into play. | [fast] Spend 1 offe…"
…and 5 more: Fox Mask (10067), Cat Mask (10084), Speak to the Dead (10091), Sparrow Mask (10111), Offering Bowl (60456)
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-resource (13 members) ---
MEMBER: Physical Training (60131) "Uses (2 resources). Replenish these resources at the start of each round. | [free] Spend 1 resource from your resource pool or from Physical Training: You get +1 [willpow…"
MEMBER: Arcane Studies (60428) "Uses (2 resources). Replenish these resources at the start of each round. | [fast] Spend 1 resource from your resource pool or from Arcane Studies: You get +1 [willpower]…"
MEMBER: Gregory Gry (06162) "Uses (9 resources). | [reaction] When you initiate a skill test, spend up to 3 resources from Gregory Gry: If this test succeeds by at least that amount, gain that many r…"
…and 10 more: Hyperawareness (07264), Hard Knocks (07266), Dig Deep (07270), Prophetic (08120), Sleuth (08121), Bruiser (08122), Crafty (08123), …
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-inspiration (2 members) ---
MEMBER: Book of Verse (11005) "Lucius Galloway deck only. | Uses (1 inspiration). Replenish this inspiration the first time you discover a clue each round. | [reaction] After revealing chaos tokens dur…"
MEMBER: Artistic Inspiration (11034) "Limit 1 per investigator. Uses (1 inspiration). | [fast] Exhaust Artistic Inspiration and discard 1 card from your hand: Replenish 1 inspiration on this card. | [reaction…"
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-try (1 member) ---
MEMBER: Try and Try Again (04159) "Uses (3 tries). If Try and Try Again has no tries, discard it.<br/>[reaction] After a skill test is failed, if a skill card you own is committed to that test, exhaust Try…"
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-key (2 members) ---
MEMBER: Old Keyring (60507) "Uses (2 keys). If there are no keys on Old Keyring, discard it. | [action]: <b>Investigate.</b> Your location gets -2 shroud for this investigation. If you succeed, remov…"
MEMBER: Old Keyring (09117) "Uses (3 keys). If there are no keys on Old Keyring, discard it. | [action]: <b>Investigate.</b> Your location gets -2 shroud for this investigation. If you succeed, remov…"
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-lock (1 member) ---
MEMBER: The Council's Coffer (05196) "Uses (1 [per_investigator] locks). If there are no locks on The Council's Coffer, each investigator searches his or her deck or discard pile for any card and immediately …"
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-leyline (4 members) ---
MEMBER: Archive of Conduits (08041) "Researched. Uses (4 leylines). Limit 1 per deck. | [fast]: Move 1 leyline from this asset to a non-[[Elite]] enemy. | [action]: Choose an investigator, and an enemy with …"
MEMBER: Archive of Conduits (08042) "Researched. Uses (4 leylines). Limit 1 per deck. | [fast]: Move 1 leyline from this asset to a revealed location. | [action]: Choose an investigator and a revealed locati…"
MEMBER: Archive of Conduits (08043) "Researched. Uses (4 leylines). Limit 1 per deck. | [fast]: Move 1 leyline from this asset to a non-[[Elite]] enemy. | [action]: Choose an investigator engaged with an ene…"
…and 1 more: Archive of Conduits (08044)
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

--- uses-starting-durability (1 member) ---
MEMBER: Jury-Rig (08074) "Uses (3 durability). | Attach to an [[Item]] asset controlled by an investigator at your location. | [fast] During a skill test on attached asset, spend 1 durability: You…"
RULING: Printed starting pool ('Uses (X …)') only. Investigators have no printed use pool — never tag one from an ability that merely interacts with charges.
RULING: Newer kinds exist: try / key / lock; optional perInvestigator flag for 'X per investigator' pools.
NOT A MEMBER: Akachi Onyele (03004) — investigator; no printed Uses pool

==== FILE: src/tags/uses/support.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeUsesSupport {
  UsesSupportAmmo = "uses-support-ammo",
  UsesSupportCharge = "uses-support-charge",
  UsesSupportSupply = "uses-support-supply",
  UsesSupportSecret = "uses-support-secret",
  UsesSupportEvidence = "uses-support-evidence",
}

interface TagUsesSupportBase extends TagBase {
  supportType: "place" | "move"
  /**
   * True when the placement is gated on a trigger/condition (Luke Robinson's
   * elder sign) rather than a plain play/action effect (Extra Ammunition) —
   * mirrors the `conditional` flag on uses-self-place (Empty Vessel).
   */
  conditional?: boolean
}

export interface TagUsesSupportAmmo extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportAmmo;
}

export interface TagUsesSupportCharge extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportCharge;
}

export interface TagUsesSupportSupply extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportSupply;
}

export interface TagUsesSupportSecret extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportSecret;
}

export interface TagUsesSupportEvidence extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportEvidence;
}

--- uses-support-ammo (11 members) ---
MEMBER: Extra Ammunition (01526) "Place 3 ammo tokens on a [[Firearm]] asset controlled by an investigator at your location."
MEMBER: Contraband (02109) "Choose an asset controlled by an investigator at your location. Double the number of ammo or supply tokens on that asset."
MEMBER: Venturer (04018) "Uses (3 supplies). | [free] Spend 1 supply and exhaust Venturer: Place 1 supply or ammo on an asset controlled by an investigator at your location."
…and 8 more: Custom Ammunition (04193), Swift Reload (06161), One in the Chamber (09029), Michael McGlen (11011), Locked and Loaded (11030), Tommy Muldoon (60151), Stock Ammo Reload (60175), …
RULING: conditional: true when the placement is gated on a trigger/symbol (Luke Robinson's elder sign, Twila's reaction) rather than a plain play/action effect (Extra Ammunition, Recharge) — mirrors uses-self-place's flag (Empty Vessel). Ruled 2026-07-16 for Luke/Empty Vessel consistency.

--- uses-support-charge (17 members) ---
MEMBER: Book of Shadows (01570) "You have 1 additional arcane slot. | [action] Exhaust Book of Shadows: Add 1 charge to a [[Spell]] asset you control."
MEMBER: Akachi Onyele (03004) "Your assets with "uses (charges)" enter play with 1 additional charge on them. | [elder_sign] effect: +1. Add 1 charge to an asset with "uses (charges)" you control."
MEMBER: Book of Shadows (03154) "[action] Exhaust Book of Shadows and spend 1 resource: Add 1 charge to a [[Spell]] asset you control."
…and 14 more: Recharge (03197), Enraptured (04157), Recharge (60429), Luke Robinson (06004), Twila Katherine Price (06244), Eldritch Sophist (07111), Winds of Power (08063), …
RULING: conditional: true when the placement is gated on a trigger/symbol (Luke Robinson's elder sign, Twila's reaction) rather than a plain play/action effect (Extra Ammunition, Recharge) — mirrors uses-self-place's flag (Empty Vessel). Ruled 2026-07-16 for Luke/Empty Vessel consistency.

--- uses-support-supply (5 members) ---
MEMBER: Contraband (02109) "Choose an asset controlled by an investigator at your location. Double the number of ammo or supply tokens on that asset."
MEMBER: Emergency Cache (03239) "Gain 4 resources or place 4 supply tokens among assets controlled by investigators at your location, or any combination thereof."
MEMBER: Venturer (04018) "Uses (3 supplies). | [free] Spend 1 supply and exhaust Venturer: Place 1 supply or ammo on an asset controlled by an investigator at your location."
…and 2 more: Nose to the Grindstone (11111), Contraband (51005)
RULING: conditional: true when the placement is gated on a trigger/symbol (Luke Robinson's elder sign, Twila's reaction) rather than a plain play/action effect (Extra Ammunition, Recharge) — mirrors uses-self-place's flag (Empty Vessel). Ruled 2026-07-16 for Luke/Empty Vessel consistency.

--- uses-support-secret (11 members) ---
MEMBER: Truth from Fiction (04152) "Play only if there is a clue on your location.<br/>Place 2 secrets on an asset you control."
MEMBER: Enraptured (04157) "If this skill test is successful during an investigation, place 1 charge or secret on an asset you control."
MEMBER: Astounding Revelation (06023) "Myriad. | Astounding Revelation cannot be played. | [reaction] When you search your deck and Astounding Revelation is among the searched cards, discard it: Either gain 2 …"
…and 8 more: Eldritch Sophist (07111), Ariadne's Twine (07304), Call the Beyond (10099), Correlate All Its Contents (11040), Enraptured (11077), Literary Analysis (60269), Eldritch Whispers (60471), …
RULING: conditional: true when the placement is gated on a trigger/symbol (Luke Robinson's elder sign, Twila's reaction) rather than a plain play/action effect (Extra Ammunition, Recharge) — mirrors uses-self-place's flag (Empty Vessel). Ruled 2026-07-16 for Luke/Empty Vessel consistency.

--- uses-support-evidence (1 member) ---
MEMBER: Darrell Simmons (09015) "You begin the game with Darrell's Kodak in play. | [fast] During a skill test at your location, spend 1 evidence from an asset you control: Reduce the difficulty of this …"
RULING: conditional: true when the placement is gated on a trigger/symbol (Luke Robinson's elder sign, Twila's reaction) rather than a plain play/action effect (Extra Ammunition, Recharge) — mirrors uses-self-place's flag (Empty Vessel). Ruled 2026-07-16 for Luke/Empty Vessel consistency.

==== FILE: src/tags/victory/main.ts ====
import { TagBase } from "../../base.js";

export enum TagTypeVictory {
  VictoryDisplaySelf = "victory-display-self",
  VictoryDisplayAddEncounter = "victory-display-add-encounter",
}

/**
 * The card adds ITSELF to the victory display, banking victory points as a permanent
 * scoring payoff (Delve Too Deep). Distinct from exile-self / rfg-self / discard-from-play.
 */
export interface TagVictoryDisplaySelf extends TagBase {
  type: TagTypeVictory.VictoryDisplaySelf;
}

/**
 * Banks an ENCOUNTER card into the victory display (The Eye of Truth adding the
 * tested treachery). Future member: Blood of K'n-yan (TDC). Distinct from
 * victory-display-self (the card banking itself).
 */
export interface TagVictoryDisplayAddEncounter extends TagBase {
  type: TagTypeVictory.VictoryDisplayAddEncounter;
}

--- victory-display-self (4 members) ---
MEMBER: Delve Too Deep (02111) "In player order, each investigator draws 1 card from the top of the encounter deck. Then, add Delve Too Deep to the victory display."
MEMBER: Bury Them Deep (03016) "William Yorick deck only. | Fast. Play after a non-[[Elite]] enemy at your location is defeated. | Add that enemy <i>(and this card)</i> to the victory display."
MEMBER: "Let God sort them out..." (06160) "Play only during one of your turns in which you defeated enemies with a total of 6 or more health. | Add "Let God sort them out..." to the victory display and immediately…"
…and 1 more: Bianca "Die Katz" (10063)

--- victory-display-add-encounter (2 members) ---
MEMBER: The Eye of Truth (06325) "If this skill test is on a treachery and the test is successful, add that treachery to the victory display and attach The Eye of Truth to it. | While attached, The Eye of…"
MEMBER: Blood of K'n-yan (11114) "[[Clairvoyant]], [[Hunter]], [[Sorcerer]] deck only. | <b>Fight.</b> You may use your [willpower] instead of your [combat] for this attack. For each empty hand slot you h…"
RULING: Bank an ENCOUNTER card into the victory display (The Eye of Truth 06325). Future member: Blood of K'n-yan (TDC) — per user 2026-07-16.

==== FILE: src/compound-tags/compound-tags.ts ====
import { CompoundTagBase } from "../base.js";
import { TagTypeClueAdditional } from "../tags/clue/additional.js";
import { TagTypeLocationShroud } from "../tags/location/shroud.js";
import { TagTypeTestDifficulty } from "../tags/test-difficulty/main.js";
import { TagTypeTestless } from "../tags/testless/index.js";
import { TagTypeClueDiscover } from "../tags/clue/discover.js";
import { TagTypeCostFree, TagTypeCostReaction } from "../tags/cost/index.js";
import { TagTypeLocationYour } from "../tags/location/your.js";
import { TagTypeDiscardFromPlay } from "../tags/discard/from-play.js";
import { TagTypeTimingWhen } from "../tags/timing/when.js";
import { TagTypeTimingAfter } from "../tags/timing/after.js";
import { TagTypeCancel } from "../tags/cancel/main.js";
import { TagTypeSkillValue } from "../tags/skill-value/main.js";
import { TagTypeDeckDraw } from "../tags/deck/draw.js";
import { TagTypeDeckSearch } from "../tags/deck/search.js";
import { TagTypeHeal } from "../tags/heal/main.js";
import { TagTypeEnemyDebuff } from "../tags/enemy/debuff.js";
import { TagTypeExile } from "../tags/exile/main.js";
import { TagTypePlayArea } from "../tags/play-area/main.js";
import { TagTypeDeckLook } from "../tags/deck/look.js";
import { TagTypeActionBold } from "../tags/action/bold.js";
import { TagTypeChaosReveal } from "../tags/chaos/reveal.js";
import { TagTypeChaosEffect } from "../tags/chaos/effect.js";
import { TagTypeChaosPredict } from "../tags/chaos/predict.js";
import { TagTypeChaosSeal } from "../tags/chaos/seal.js";
import { TagTypeChaosBag } from "../tags/chaos/bag.js";
import { TagTypeGainResource } from "../tags/gain/resource.js";
import { TagTypeSkillValueSource } from "../tags/skill-value/source.js";
import { TagTypeUsesAccumulate } from "../tags/uses/accumulate.js";
import { TagTypeCondition } from "../tags/condition/main.js";
import { TagTypeAuto } from "../tags/auto/main.js";
import { TagTypeEnemyEngage } from "../tags/enemy/engage.js";
import { TagTypeEnemyValue } from "../tags/enemy/value.js";
import { TagTypeAoo } from "../tags/aoo/main.js";
import { TagTypeLocationMove } from "../tags/location/move.js";
import { TagTypeTank } from "../tags/tank/main.js";
import { TagTypeReady } from "../tags/ready/main.js";
import { TagTypeTestRepeat } from "../tags/test/repeat.js";
import { TagTypeSkillTestCondition } from "../tags/skill-test-condition/main.js";
import { TagTypeRecursion } from "../tags/recursion/main.js";
import { TagTypeDiscardPile } from "../tags/discard-pile/main.js";
import { TagTypeActionActivate } from "../tags/action/activate.js";
import { TagTypeActionAdditional } from "../tags/action/additional.js";
import { TagTypeMulticlass } from "../tags/multiclass/main.js";
import { TagTypeSoak } from "../tags/soak/main.js";
import { TagTypeEncounter } from "../tags/encounter/main.js";
import { TagTypeCommit } from "../tags/commit/main.js";
import { TagTypeTraitSupport } from "../tags/trait/support.js";
import { TagTypeSlotAdditional } from "../tags/slot/additional.js";
import { TagTypeSlotConvert } from "../tags/slot/convert.js";
import { TagTypeSlotIgnore } from "../tags/slot/ignore.js";
import { TagTypeSlotShare } from "../tags/slot/share.js";
import { TagTypeVictory } from "../tags/victory/main.js";
import { TagTypeLocationConnecting } from "../tags/location/connecting.js";
import { TagTypeStatsModBoostPassive } from "../tags/stats-mod/boost-passive.js";
import { TagTypeStatsModUseInstead } from "../tags/stats-mod/use-instead.js";
import { TagTypeStatsModAddStat } from "../tags/stats-mod/add-stat.js";
import { TagTypeEnemyMitigation } from "../tags/enemy/mitigation.js";
import { TagTypeBuffCannot } from "../tags/buff/cannot.js";
import { TagTypeDamage } from "../tags/damage/main.js";
import { TagTypeCostDiscount } from "../tags/cost/index.js";
import { TagTypeLocationProperty } from "../tags/location/property.js";
import { TagTypeCluePlace } from "../tags/clue/place.js";
import { TagTypeChaosDownside } from "../tags/chaos/downside.js";
import { TagTypeDoom } from "../tags/doom/main.js";
import { TagTypeDeckDiscard } from "../tags/deck/discard.js";
import { TagTypeDeckShuffle } from "../tags/deck/shuffle.js";
import { TagTypeEnemyRestriction } from "../tags/enemy/restriction.js";
import { TagTypeCostAction, TagTypeCostOther } from "../tags/cost/index.js";
import { TagTypeStatsModBoostInTest } from "../tags/stats-mod/boost-in-test.js";
import { TagTypeStatsModBoostLasting } from "../tags/stats-mod/boost-lasting.js";
import { TagTypeHandSize } from "../tags/hand-size/index.js";
import { TagTypeSkillCommit } from "../tags/skill-commit/index.js";

export enum CompoundTagType {
  Thorns = "c-thorns",
  DiscardSelf = "c-discard-self",
  Support = "c-support",
  ClueTech = "c-clue-tech",
  ShroudReduction = "c-shroud-reduction",
  DifficultyReduction = "c-difficulty-reduction",
  SpendResource = "c-spend-resource",
  AttackMitigation = "c-attack-mitigation",
  SucceedBy = "c-succeed-by",
  FailBy = "c-fail-by",
  Investigate = "c-investigate",
  EnemyFieldControl = "c-enemy-field-control",
  ExilePackage = "c-exile-package",
  IntoPlayCheat = "c-into-play-cheat",
  BoldAction = "c-bold-action",
  ChaosTokenControl = "c-chaos-token-control",
  BlessCurseBag = "c-bless-curse-bag",
  BigMoney = "c-big-money",
  EvasionPackage = "c-evasion-package",
  ProtectorTank = "c-protector-tank",
  FailForward = "c-fail-forward",
  DiscardPileValue = "c-discard-pile-value",
  ActionCompression = "c-action-compression",
  MulticlassPayoff = "c-multiclass-payoff",
  HealthSafety = "c-health-safety",
  SanitySafety = "c-sanity-safety",
  TomeSupport = "c-tome-support",
  SpellSupport = "c-spell-support",
  RelicSupport = "c-relic-support",
  WeaponSupport = "c-weapon-support",
  AllySupport = "c-ally-support",
  Healing = "c-healing",
  AllyHealing = "c-ally-healing",
  PassiveBoost = "c-passive-boost",
  Cancel = "c-cancel",
  EnemyMitigation = "c-enemy-mitigation",
  AreaDamage = "c-area-damage",
  EfficientDamage = "c-efficient-damage",
  Search = "c-search",
  Economy = "c-economy",
  ClueOnLocation = "c-clue-on-location",
  OffStatCombat = "c-off-stat-combat",
  OffStatInvestigation = "c-off-stat-investigation",
  ExtraActions = "c-extra-actions",
  ActionChargeCost = "c-action-uses-cost",
  RemoteClue = "c-remote-clue",
  SelfHarmCost = "c-self-harm-cost",
  MultiEnemy = "c-multi-enemy",
  Getaway = "c-getaway",
  CombatBoost = "c-combat-boost",
  AgilityBoost = "c-agility-boost",
  IntellectBoost = "c-intellect-boost",
  Draw = "c-draw",
  BigHand = "c-big-hand",
  Commit = "c-commit",
  TreacheryHandling = "c-treachery-handling",
  EncounterDeck = "c-encounter-deck",
  ChaosTokenDownside = "c-chaos-token-downside",
  DoomAdding = "c-doom-adding",
  SelfHarmDamage = "c-self-harm-damage",
  SelfHarmHorror = "c-self-harm-horror",
  HealDamage = "c-heal-damage",
  HealHorror = "c-heal-horror",
  ConditionalPassiveBoost = "c-conditional-passive-boost",
  Exhausts = "c-exhausts",
  ReturnToHand = "c-return-to-hand",
  PlayerDeckLook = "c-player-deck-look",
  KeywordSuppression = "c-keyword-suppression",
  AdditionalSlot = "c-additional-slot",
  EfficientClue = "c-efficient-clue",
  EvadePayoff = "c-evade-payoff",
  EnemyNerf = "c-enemy-nerf",
  FailurePrevention = "c-failure-prevention",
  Engagement = "c-engagement",
  Mobility = "c-mobility",
  CrossDeck = "c-cross-deck",
  SlotTech = "c-slot-tech",
  VictoryDisplay = "c-victory-display",
  CopiesMatter = "c-copies-matter",
}

export const compoundTagEnemyFieldControl: CompoundTagBase = {
  type: CompoundTagType.EnemyFieldControl,
  tags: [TagTypeEnemyDebuff.EnemyCannotMoveIntoLocation],
};

export const compoundTagSucceedBy: CompoundTagBase = {
  type: CompoundTagType.SucceedBy,
  tags: [
    TagTypeSkillValue.SkillValueSucceedByDynamic,
    TagTypeSkillValue.SkillValueSucceedByOrMore,
    TagTypeSkillValue.SkillValueSucceedByExactly,
  ],
};

export const compoundTagFailBy: CompoundTagBase = {
  type: CompoundTagType.FailBy,
  tags: [
    TagTypeSkillValue.SkillValueFailByDynamic,
    TagTypeSkillValue.SkillValueFailByOrLess,
    TagTypeSkillValue.SkillValueFailByExactly,
  ],
};

export const compoundTagAttackMitigation: CompoundTagBase = {
  type: CompoundTagType.AttackMitigation,
  tags: [TagTypeCancel.CancelAttack],
};

export const compoundTagThorns: CompoundTagBase = {
  type: CompoundTagType.Thorns,
  tags: [
    TagTypeTimingAfter.TimingAfterEnemyDealDamageSelf,
    TagTypeTimingAfter.TimingAfterEnemyAttacks,
  ],
};

/**
 * Self-discard: the card DELIBERATELY discards itself from play as an act/cost (an
 * ability, not running out of uses) — Beat Cop's "Discard Beat Cop: …". Distinct from
 * discard-from-play-self-no-uses (a consumable depleting), which is NOT self-discard.
 */
export const compoundTagDiscardSelf: CompoundTagBase = {
  type: CompoundTagType.DiscardSelf,
  tags: [
    TagTypeCostFree.CostFreeDiscardSelf,
    TagTypeCostReaction.CostReactionDiscardSelf,
    TagTypeCostAction.CostActionDiscardSelf,
    TagTypeDiscardFromPlay.DiscardFromPlaySelf,
  ],
};

/**
 * Investigate payoff: a PERSISTENT trigger that rewards you AFTER any successful
 * investigation — fires off investigations you make with OTHER cards, not its own action
 * (Dr. Milan Christopher, Scavenging, Vault of Knowledge: "[reaction] After you
 * successfully investigate: …"). Deliberately narrow:
 *   - NOT a passive boost while investigating (Magnifying Glass, Newspaper) — that is just
 *     a conditional/passive boost.
 *   - NOT a card whose OWN investigate has a success rider (Rite of Seeking, Winging It,
 *     Pilfer, Clairvoyance) — that is skill-test-condition-successful + Efficient Clue,
 *     because the effect is tied to that one investigation.
 */
export const compoundTagInvestigate: CompoundTagBase = {
  type: CompoundTagType.Investigate,
  tags: [TagTypeTimingAfter.TimingAfterSuccessfullyInvestigate],
};

/**
 * Any tags that suggests you can help out other investigators
 * are collected in this compound tag.
 */
export const compoundTagSupport: CompoundTagBase = {
  type: CompoundTagType.Support,
  tags: [
    TagTypeDeckDraw.DeckDrawInvestigator,
    TagTypeDeckSearch.DeckSearchInvestigator,
    TagTypeDeckLook.DeckLookInvestigator,
    TagTypeHeal.HealDamageInvestigator,
    TagTypeHeal.HealHorrorInvestigator,
    TagTypeHeal.HealDamageAlly,
    TagTypeHeal.HealHorrorAlly,
    // A committed skill whose effect benefits the PERFORMING investigator (may be another
    // player) is true support — Survival Instinct moves the evading investigator;
    // Eureka!/Take Heart give the performer cards/resources (commit-benefits-performer).
    TagTypeLocationMove.LocationMoveInvestigatorPerformer,
    TagTypeCommit.CommitBenefitsPerformer,
    // Protecting others IS support (ruled 2026-07-16, Guardian review — Heroic
    // Rescue): the tank family joins, cross-investigator scope only for moves.
    TagTypeTank.TankRedirectAttack,
    TagTypeTank.TankRedirectEncounter,
    TagTypeTank.TankRedirectDamageHorror,
    { type: TagTypeTank.TankMoveDamageHorror, where: { scope: "cross-investigator" } },
  ],
};

/**
 * Compound tag for clue-finding technology: discovering clues while bypassing or easing
 * the normal investigate test — discover-without-investigating, shroud reduction, or
 * testless clues. NOTE: discovering EXTRA clues on a *successful* investigation is not
 * clue-tech (it still requires investigating); those live in the Investigate compound.
 */
export const compoundTagClueTech: CompoundTagBase = {
  type: CompoundTagType.ClueTech,
  tags: [
    TagTypeLocationShroud.LocationShroudMinus1,
    TagTypeLocationShroud.LocationShroudMinus2,
    TagTypeLocationShroud.LocationShroudReduction,
    TagTypeTestless.TestlessClue,
    TagTypeClueDiscover.ClueDiscoverAnyLocation,
    TagTypeClueDiscover.ClueDiscoverConnectingLocation,
    TagTypeClueDiscover.ClueDiscoverYourLocation,
  ],
};

/**
 * Compound tag for shroud reduction.
 * Groups all tags that reduce shroud value.
 */
export const compoundTagShroudReduction: CompoundTagBase = {
  type: CompoundTagType.ShroudReduction,
  tags: [
    TagTypeLocationShroud.LocationShroudMinus1,
    TagTypeLocationShroud.LocationShroudMinus2,
    TagTypeLocationShroud.LocationShroudReduction,
  ],
};

/**
 * Compound tag for difficulty reduction — every way to lower the effective difficulty
 * (target number) of a test: a direct cut (test-difficulty-reduce) or reducing a
 * location's shroud (which is the difficulty of an investigation). The target-lowering
 * counterpart to boosting your own skill value. Broader than Shroud Reduction, which is
 * only the location-shroud subset.
 */
export const compoundTagDifficultyReduction: CompoundTagBase = {
  type: CompoundTagType.DifficultyReduction,
  tags: [
    TagTypeTestDifficulty.TestDifficultyReduce,
    TagTypeLocationShroud.LocationShroudMinus1,
    TagTypeLocationShroud.LocationShroudMinus2,
    TagTypeLocationShroud.LocationShroudReduction,
  ],
};

/**
 * Compound tag for spending resources.
 * Groups all tags that involve spending resources as a cost.
 */
export const compoundTagSpendResource: CompoundTagBase = {
  type: CompoundTagType.SpendResource,
  tags: [
    TagTypeCostFree.CostFreeSpendResource,
    TagTypeCostReaction.CostReactionSpendResource,
  ],
};

/**
 * Exile package: cards that exile themselves (one powerful use, then removed from
 * your collection) — a campaign/deckbuilding sub-theme introduced in the Dunwich cycle.
 */
export const compoundTagExilePackage: CompoundTagBase = {
  type: CompoundTagType.ExilePackage,
  tags: [TagTypeExile.ExileSelf],
};

/**
 * Into-play "cheat": putting cards directly into play from hand/deck/discard,
 * bypassing the normal play action / sometimes the cost. A tempo / recursion enabler.
 */
export const compoundTagIntoPlayCheat: CompoundTagBase = {
  type: CompoundTagType.IntoPlayCheat,
  tags: [
    TagTypePlayArea.PlayAreaIntoPlayFromHand,
    TagTypePlayArea.PlayAreaIntoPlayFromDeck,
    TagTypePlayArea.PlayAreaIntoPlayFromDiscard,
    TagTypePlayArea.PlayAreaPlayFromOtherZone,
  ],
};


/**
 * Bold action: any card that bundles a basic action (Fight/Evade/Investigate/Parley/
 * Resign) into its own ability, regardless of which action. The example case from
 * base.ts's doc comment — searchable as one archetype via this compound.
 */
export const compoundTagBoldAction: CompoundTagBase = {
  type: CompoundTagType.BoldAction,
  tags: [
    TagTypeActionBold.ActionBoldFight,
    TagTypeActionBold.ActionBoldEvade,
    TagTypeActionBold.ActionBoldInvestigate,
    TagTypeActionBold.ActionBoldParley,
    TagTypeActionBold.ActionBoldResign,
  ],
};

/**
 * Chaos-token control: reveal more / ignore / cancel / predict / treat-as / seal —
 * the whole "play with the chaos bag draw" archetype.
 */
export const compoundTagChaosTokenControl: CompoundTagBase = {
  type: CompoundTagType.ChaosTokenControl,
  tags: [
    TagTypeChaosReveal.ChaosRevealMore,
    TagTypeChaosReveal.ChaosRevealAnotherInstead,
    TagTypeChaosReveal.ChaosRevealSealedInstead,
    TagTypeChaosEffect.ChaosEffectResolveChoose,
    TagTypeChaosEffect.ChaosEffectIgnoreEffect,
    TagTypeChaosEffect.ChaosEffectIgnoreModifier,
    TagTypeChaosEffect.ChaosEffectDoNotReveal,
    TagTypeChaosEffect.ChaosEffectTreatAsElderSign,
    TagTypeChaosEffect.ChaosEffectTreatTokenAs,
    TagTypeChaosEffect.ChaosEffectResolveAdditional,
    TagTypeChaosPredict.ChaosPredict,
    TagTypeCancel.CancelChaos,
    TagTypeChaosSeal.ChaosSealRevealed,
    TagTypeChaosSeal.ChaosSealTokenAny,
  ],
};

/** Bless/curse bag: adding, removing, replacing, sealing, or paying off bless/curse tokens. */
export const compoundTagBlessCurseBag: CompoundTagBase = {
  type: CompoundTagType.BlessCurseBag,
  tags: [
    TagTypeChaosBag.ChaosBagAddBless,
    TagTypeChaosBag.ChaosBagAddCurse,
    TagTypeChaosBag.ChaosBagRemoveBless,
    TagTypeChaosBag.ChaosBagRemoveCurse,
    TagTypeChaosBag.ChaosBagReplace,
    TagTypeChaosSeal.ChaosSealTokenBless,
    TagTypeChaosSeal.ChaosSealTokenCurse,
    TagTypeChaosReveal.ChaosRevealTokenBless,
    TagTypeChaosReveal.ChaosRevealTokenCurse,
  ],
};

/**
 * Big money: caring about HAVING a large resource pool — converting resources into power
 * or scaling with how many you hold. NOTE: merely generating resources is Economy, not
 * Big Money.
 */
export const compoundTagBigMoney: CompoundTagBase = {
  type: CompoundTagType.BigMoney,
  tags: [
    TagTypeSkillValueSource.SkillValueFromResource,
    { type: TagTypeCondition.ConditionResource, where: { comparison: "min" } },
  ],
};

/** Evasion package: the EVADE mechanic — auto/testless evade, mass evade, making evade easier, and after-evade payoffs. (Disengaging-and-fleeing without evading is Getaway, not evasion.) */
export const compoundTagEvasionPackage: CompoundTagBase = {
  type: CompoundTagType.EvasionPackage,
  tags: [
    TagTypeAuto.AutoEvade,
    TagTypeTestless.TestlessEvade,
    TagTypeEnemyEngage.EnemyEngageEvadeMultiple,
    TagTypeEnemyValue.EnemyValueEvadeReduction,
    TagTypeTimingAfter.TimingAfterEvadeEnemy,
  ],
};

/** Protector/tank: take hits for the team — redirect attacks/encounter cards, ready an ally. */
export const compoundTagProtectorTank: CompoundTagBase = {
  type: CompoundTagType.ProtectorTank,
  tags: [
    TagTypeTank.TankRedirectAttack,
    TagTypeTank.TankRedirectEncounter,
    TagTypeTank.TankRedirectDamageHorror,
    // only the cross-investigator scope protects others; scope "self" (Tommy) is out
    { type: TagTypeTank.TankMoveDamageHorror, where: { scope: "cross-investigator" } },
  ],
};

/**
 * Fail-forward: turning a failed test into upside or softening it — after-fail payoffs,
 * retries, fail-by margins, or canceling a failed test's effects. NOTE: a plain "on
 * failure, something bad happens" branch (SkillTestConditionFail) is NOT fail-forward.
 */
export const compoundTagFailForward: CompoundTagBase = {
  type: CompoundTagType.FailForward,
  tags: [
    TagTypeTimingAfter.TimingAfterFailSkillTest,
    TagTypeTestRepeat.TestRepeatFailed,
    TagTypeCancel.CancelFailedTestEffects,
    TagTypeSkillValue.SkillValueFailByOrLess,
    TagTypeSkillValue.SkillValueFailByExactly,
    TagTypeSkillValue.SkillValueFailByDynamic,
  ],
};

/** Discard-pile value: replaying / recurring cards from the discard pile. */
export const compoundTagDiscardPileValue: CompoundTagBase = {
  type: CompoundTagType.DiscardPileValue,
  tags: [
    TagTypeRecursion.RecursionPlayFromDiscard,
    TagTypeRecursion.RecursionEvent,
    TagTypeRecursion.RecursionSkill,
    TagTypeDiscardPile.DiscardPileToHand,
    TagTypeDiscardPile.DiscardPileToDeck,
  ],
};

/**
 * Action compression: doing MORE PER ACTION — cheaper/free activations, an extra attack
 * inside one action, or readying to act again. NOTE: simply gaining extra actions is not
 * compression (you still do one thing per action); that is Extra Actions.
 */
export const compoundTagActionCompression: CompoundTagBase = {
  type: CompoundTagType.ActionCompression,
  tags: [
    TagTypeActionActivate.ActionActivateIgnoringCost,
    TagTypeActionActivate.ActionActivateFromHand,
    TagTypeActionAdditional.ActionAdditionalAttack,
    TagTypeReady.ReadySelf,
    TagTypeReady.ReadyAsset,
  ],
};

/** Multiclass payoff: rewards scaling with how many classes you have access to. */
export const compoundTagMulticlassPayoff: CompoundTagBase = {
  type: CompoundTagType.MulticlassPayoff,
  tags: [TagTypeMulticlass.MulticlassClassCount],
};

/**
 * Health safety: cards whose point is protecting your HEALTH — extra effective health
 * capacity (e.g. Bulletproof Vest) plus damage healing.
 */
export const compoundTagHealthSafety: CompoundTagBase = {
  type: CompoundTagType.HealthSafety,
  tags: [
    TagTypeSoak.SoakHealth,
    TagTypeHeal.HealDamageYou,
    TagTypeHeal.HealDamageInvestigator,
    TagTypeHeal.HealDamageAlly,
    TagTypeHeal.HealDamageSelf,
  ],
};

/**
 * Sanity safety: cards whose point is protecting your SANITY — extra effective sanity
 * capacity (e.g. Elder Sign Amulet) plus horror healing (e.g. Peter Sylvestre).
 */
export const compoundTagSanitySafety: CompoundTagBase = {
  type: CompoundTagType.SanitySafety,
  tags: [
    TagTypeSoak.SoakSanity,
    TagTypeHeal.HealHorrorYou,
    TagTypeHeal.HealHorrorInvestigator,
    TagTypeHeal.HealHorrorAlly,
    TagTypeHeal.HealHorrorSelf,
  ],
};

// ---------------------------------------------------------------------------
// Trait- and uses-based "support" archetypes. These demonstrate per-member
// argument conditioning: a generic argument-bearing tag (e.g. an extra slot
// restricted to a trait, or an accumulating token) is included ONLY when its
// argument matches, via `{ type, where }` members.
// ---------------------------------------------------------------------------

/** Cards that have something to do with the Tome trait (support + Tome-only slots). */
export const compoundTagTomeSupport: CompoundTagBase = {
  type: CompoundTagType.TomeSupport,
  tags: [
    TagTypeTraitSupport.TraitSupportTome,
    { type: TagTypeSlotAdditional.SlotAdditionalHand, where: { restrictedToTrait: "Tome" } },
    { type: TagTypeSlotAdditional.SlotAdditionalArcane, where: { restrictedToTrait: "Tome" } },
  ],
};

/** Spell trait support (incl. Spell-only arcane slots). */
export const compoundTagSpellSupport: CompoundTagBase = {
  type: CompoundTagType.SpellSupport,
  tags: [
    TagTypeTraitSupport.TraitSupportSpell,
    { type: TagTypeSlotAdditional.SlotAdditionalArcane, where: { restrictedToTrait: "Spell" } },
  ],
};

/** Relic trait support. */
export const compoundTagRelicSupport: CompoundTagBase = {
  type: CompoundTagType.RelicSupport,
  tags: [
    TagTypeTraitSupport.TraitSupportRelic,
    { type: TagTypeSlotAdditional.SlotAdditionalAccessory, where: { restrictedToTrait: "Relic" } },
  ],
};

/**
 * Weapon trait support (incl. Weapon-only slots). Firearm / Melee / Ranged are DISTINCT
 * traits with their own support compounds — a card that boosts Firearms is not "Weapon
 * support" unless it actually references the Weapon trait.
 */
export const compoundTagWeaponSupport: CompoundTagBase = {
  type: CompoundTagType.WeaponSupport,
  tags: [
    TagTypeTraitSupport.TraitSupportWeapon,
    { type: TagTypeSlotAdditional.SlotAdditionalHand, where: { restrictedToTrait: "Weapon" } },
  ],
};





/** Ally trait support (incl. Ally-only ally slots). */
export const compoundTagAllySupport: CompoundTagBase = {
  type: CompoundTagType.AllySupport,
  tags: [
    TagTypeTraitSupport.TraitSupportAlly,
    { type: TagTypeSlotAdditional.SlotAdditionalAlly, where: { restrictedToTrait: "Ally" } },
  ],
};



// NOTE: there are intentionally no per-uses "support" compounds (ammo/secret/charge/
// supply). A card that ENTERS PLAY with a use type (UsesStarting*) is not "support";
// and the actual support concept is already a single tag (UsesSupport*), so a compound
// would be redundant. Use the UsesSupport* tags directly.

/** Healing: restores damage or horror — on yourself, another investigator, an ally/asset, or this card. */
export const compoundTagHealing: CompoundTagBase = {
  type: CompoundTagType.Healing,
  tags: [
    TagTypeHeal.HealDamageYou,
    TagTypeHeal.HealDamageInvestigator,
    TagTypeHeal.HealDamageAlly,
    TagTypeHeal.HealDamageSelf,
    TagTypeHeal.HealHorrorYou,
    TagTypeHeal.HealHorrorInvestigator,
    TagTypeHeal.HealHorrorAlly,
    TagTypeHeal.HealHorrorSelf,
  ],
};

/** Ally Healing: heals an ally/asset (damage or horror) — the keep-your-allies-alive package (First Aid, Emergency Aid, Inspiring Presence). */
export const compoundTagAllyHealing: CompoundTagBase = {
  type: CompoundTagType.AllyHealing,
  tags: [
    TagTypeHeal.HealDamageAlly,
    TagTypeHeal.HealHorrorAlly,
  ],
};

/** Passive boost: an always-on (or condition-gated) skill boost while the card is in play — no per-test commitment. */
export const compoundTagPassiveBoost: CompoundTagBase = {
  type: CompoundTagType.PassiveBoost,
  tags: [
    TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveIntellect,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveWillpower,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAny,
  ],
};

/** Cancel: negates an incoming attack, damage, horror, draw, test result, weakness, or other effect (Diana Stanley payoff). */
export const compoundTagCancel: CompoundTagBase = {
  type: CompoundTagType.Cancel,
  tags: [
    TagTypeCancel.CancelAttack,
    TagTypeCancel.CancelChaos,
    TagTypeCancel.CancelDamage,
    TagTypeCancel.CancelEncounterDraw,
    TagTypeCancel.CancelEncounterEffect,
    TagTypeCancel.CancelHorror,
    TagTypeCancel.CancelRevelation,
    TagTypeCancel.CancelLoseAction,
    TagTypeCancel.CancelLoseResource,
    TagTypeCancel.CancelDiscardFromHand,
    TagTypeCancel.CancelFailedTestEffects,
    TagTypeCancel.CancelWeaknessDraw,
  ],
};

/** Enemy mitigation: neutralize an enemy WITHOUT a standard fight/evade test — discard, defeat, shuffle back, or stop it attacking. */
export const compoundTagEnemyMitigation: CompoundTagBase = {
  type: CompoundTagType.EnemyMitigation,
  tags: [
    TagTypeEnemyMitigation.EnemyMitigationDiscard,
    TagTypeEnemyMitigation.EnemyMitigationDefeat,
    TagTypeEnemyMitigation.EnemyMitigationBackToEncounterDeck,
    TagTypeBuffCannot.CannotAttackYou,
    TagTypeEnemyDebuff.EnemyCannotAttack,
    TagTypeBuffCannot.CannotEngageYou,
    TagTypeEnemyDebuff.EnemyExhaust,
  ],
};

/** Area damage: hits MULTIPLE enemies at once — all enemies at a location, a connecting location, or damage spread among them. */
export const compoundTagAreaDamage: CompoundTagBase = {
  type: CompoundTagType.AreaDamage,
  tags: [
    TagTypeTestless.TestlessDamageYourLocationMultiple,
    TagTypeTestless.TestlessDamageConnectingLocation,
    TagTypeDamage.DamageSpread,
  ],
};

/** Efficient damage: more damage per action — bonus damage, an extra attack, testless damage, or redirecting an attack's damage onto an enemy (action-compressed offense — Beat Cop, Aquinnah). */
export const compoundTagEfficientDamage: CompoundTagBase = {
  type: CompoundTagType.EfficientDamage,
  tags: [
    TagTypeDamage.DamagePlus,
    TagTypeDamage.DamageRedirectAttack,
    TagTypeActionAdditional.ActionAdditionalAttack,
    TagTypeTestless.TestlessDamageYourLocation,
    TagTypeTestless.TestlessDamageAttackingEnemy,
    TagTypeTestless.TestlessDamageEngagedEnemy,
  ],
};

/**
 * Efficient clue: more clues per action — extra/additional clues from your own action, or
 * testless clue discovery (the clue twin of Efficient Damage). Rite of Seeking,
 * "Look what I found!". Distinct from Investigate Payoff (rewarded for investigating
 * generally) — this is the card's OWN action netting extra clues.
 */
export const compoundTagEfficientClue: CompoundTagBase = {
  type: CompoundTagType.EfficientClue,
  tags: [
    TagTypeClueAdditional.ClueAdditionalThisLocation,
    TagTypeClueAdditional.ClueAdditionalAdjacentLocations,
    TagTypeClueAdditional.ClueAdditionalRevealedLocations,
  ],
};

/**
 * Remote clue: gather clues from a location OTHER than your own — investigate / discover at
 * a connecting, adjacent, revealed, or any location (Seeking Answers grabs clues from a
 * connecting location). Distinct from Efficient Clue (volume) — this is about REACH.
 */
export const compoundTagRemoteClue: CompoundTagBase = {
  type: CompoundTagType.RemoteClue,
  tags: [
    TagTypeClueDiscover.ClueDiscoverConnectingLocation,
    TagTypeClueDiscover.ClueDiscoverAnyLocation,
    TagTypeClueAdditional.ClueAdditionalAdjacentLocations,
    TagTypeClueAdditional.ClueAdditionalRevealedLocations,
  ],
};

/** Search: dig through a deck (yours, another investigator's, the discard, encounter, or bonded) for a specific card. */
export const compoundTagSearch: CompoundTagBase = {
  type: CompoundTagType.Search,
  tags: [
    TagTypeDeckSearch.DeckSearchYou,
    TagTypeDeckSearch.DeckSearchInvestigator,
    TagTypeDeckSearch.DeckSearchDiscard,
    TagTypeDeckSearch.DeckSearchEncounter,
    // bonded-fetch is deliberately NOT here: fetching from the set-aside bonded
    // pool is not a deck search (ruled 2026-07-16, Guardian review).
  ],
};

/** Economy: generate resources, share them, discount costs, or put cards into play skipping their normal cost. */
export const compoundTagEconomy: CompoundTagBase = {
  type: CompoundTagType.Economy,
  tags: [
    TagTypeGainResource.GainResourceYou,
    TagTypeGainResource.GainResourceInvestigator,
    TagTypeGainResource.GainResourceMoveInvestigator,
    TagTypeCostDiscount.CostDiscount,
    TagTypePlayArea.PlayAreaIntoPlayFromHand,
    TagTypePlayArea.PlayAreaIntoPlayFromDeck,
    TagTypePlayArea.PlayAreaIntoPlayFromDiscard,
    TagTypePlayArea.PlayAreaPlayIgnoringCost,
  ],
};

/** Clue-on-location: cares about whether clues are ON a location — keyed to clue presence/absence, or dropping clues to set it up. */
export const compoundTagClueOnLocation: CompoundTagBase = {
  type: CompoundTagType.ClueOnLocation,
  tags: [
    TagTypeLocationProperty.LocationClueExist,
    TagTypeLocationProperty.LocationClueZero,
    TagTypeCluePlace.CluePlaceYourLocation,
  ],
};

/** Off-stat combat: fight with a non-[combat] stat, or evade with a non-[agility] stat (Mind over Matter, Mystic willpower-fighters). */
export const compoundTagOffStatCombat: CompoundTagBase = {
  type: CompoundTagType.OffStatCombat,
  tags: [
    { type: TagTypeStatsModUseInstead.StatsModUseInstead, where: { instead: "combat" } },
    { type: TagTypeStatsModUseInstead.StatsModUseInstead, where: { instead: "agility" } },
  ],
};

/** Off-stat investigation: investigate with a non-[intellect] stat — use another stat instead (Rite of Seeking → willpower) or ADD one on top (Lockpicks → agility). */
export const compoundTagOffStatInvestigation: CompoundTagBase = {
  type: CompoundTagType.OffStatInvestigation,
  tags: [
    { type: TagTypeStatsModUseInstead.StatsModUseInstead, where: { instead: "intellect" } },
    { type: TagTypeStatsModAddStat.StatsModAddStat, where: { action: "investigate" } },
  ],
};

/** Extra actions: grants additional actions for the turn — MORE actions, not more per action (distinct from action compression). */
export const compoundTagExtraActions: CompoundTagBase = {
  type: CompoundTagType.ExtraActions,
  tags: [
    TagTypeActionAdditional.ActionAdditional,
    // immediate out-of-sequence actions (Quick Thinking, Haste) are still extra actions
    TagTypeActionAdditional.ActionTakeImmediate,
  ],
};


/** Action uses-count cost: an [action] ability gated on spending a printed use-token — any uses-count type (charge/ammo, supply, or secret) — the 'Uses (N): [action] spend 1' weapon/tool/spell engine. */
export const compoundTagActionChargeCost: CompoundTagBase = {
  type: CompoundTagType.ActionChargeCost,
  tags: [
    TagTypeCostAction.CostActionSpendCharge,
    TagTypeCostAction.CostActionSpendAmmo,
    TagTypeCostAction.CostActionSpendSupply,
    TagTypeCostAction.CostActionSpendSecret,
  ],
};

/** Self-harm cost: pay with your own health/sanity to activate — power at the price of your body/mind. */
export const compoundTagSelfHarmCost: CompoundTagBase = {
  type: CompoundTagType.SelfHarmCost,
  tags: [
    TagTypeCostFree.CostFreeHorrorSelf,
    TagTypeCostFree.CostFreeDamageSelf,
    TagTypeCostReaction.CostReactionHorrorSelf,
    TagTypeCostReaction.CostReactionDamageSelf,
    TagTypeCostOther.CostDamageSelf,
    TagTypeCostOther.CostHorrorSelf,
  ],
};

/** Multi-enemy: deals with MULTIPLE enemies at once — area damage, mass evade, mass disengage, or mass engage (Dynamite Blast, Elusive, Cat Burglar). */
export const compoundTagMultiEnemy: CompoundTagBase = {
  type: CompoundTagType.MultiEnemy,
  tags: [
    TagTypeTestless.TestlessDamageYourLocationMultiple,
    TagTypeTestless.TestlessDamageConnectingLocation,
    TagTypeDamage.DamageSpread,
    TagTypeEnemyEngage.EnemyEngageEvadeMultiple,
    TagTypeEnemyEngage.EnemyEngageWithYouMultiple,
    { type: TagTypeEnemyEngage.EnemyEngageDisengage, where: { fromAll: true } },
  ],
};

/**
 * Getaway: ESCAPE combat by disengaging and fleeing without provoking (Elusive, Cat
 * Burglar) — NOT the evade mechanic, and NOT mere repositioning (Duke/Pathfinder move but
 * do not escape; those are Mobility). Keyed on disengaging, not on moving.
 */
export const compoundTagGetaway: CompoundTagBase = {
  type: CompoundTagType.Getaway,
  tags: [
    TagTypeEnemyEngage.EnemyEngageDisengage,
  ],
};

/**
 * Mobility: the card MOVES you (or the performing investigator) — repositioning / movement
 * compression (move and act in one action: Duke moves to investigate; Pathfinder grants an
 * extra move). A card may be both Mobility and Getaway (Elusive moves AND disengages); Duke
 * is Mobility only (it does not escape anything).
 */
export const compoundTagMobility: CompoundTagBase = {
  type: CompoundTagType.Mobility,
  tags: [
    TagTypeLocationMove.LocationMoveInvestigatorSelf,
    TagTypeLocationMove.LocationMoveInvestigatorPerformer,
    TagTypeLocationMove.LocationMoveInvestigatorAny,
    // creating map connections is mobility enablement (Open Gate)
    TagTypeLocationConnecting.LocationCreateConnection,
  ],
};

/** Slot Tech: slot juggling — converting a slot's type, copies sharing one slot, or a card ignoring its slot entirely (Abigail Foreman; Trigger Man). Granting EXTRA slots is the AdditionalSlot compound. */
export const compoundTagSlotTech: CompoundTagBase = {
  type: CompoundTagType.SlotTech,
  tags: [
    TagTypeSlotConvert.SlotConvert,
    TagTypeSlotShare.SlotShare,
    TagTypeSlotIgnore.SlotIgnore,
  ],
};

/** Victory Display: banks victory points — adding itself (Delve Too Deep) or encounter cards (The Eye of Truth; Blood of K'n-yan) to the victory display. */
export const compoundTagVictoryDisplay: CompoundTagBase = {
  type: CompoundTagType.VictoryDisplay,
  tags: [
    TagTypeVictory.VictoryDisplaySelf,
    TagTypeVictory.VictoryDisplayAddEncounter,
  ],
};

/** Copies Matter: cares about multiple copies of a card — assembling, committing, discarding, or fetching duplicates (the Dream-Eaters Myriad-adjacent family). */
export const compoundTagCopiesMatter: CompoundTagBase = {
  type: CompoundTagType.CopiesMatter,
  tags: [TagTypeCondition.ConditionCopies],
};

/** Combat Boost: makes you better at FIGHTING — any [combat] (or any-skill) boost, in-test / passive / lasting. */
export const compoundTagCombatBoost: CompoundTagBase = {
  type: CompoundTagType.CombatBoost,
  tags: [
    TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat,
    TagTypeStatsModBoostLasting.StatsModBoostLastingCombat,
    TagTypeStatsModBoostInTest.StatsModBoostInTestAny,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAny,
    TagTypeStatsModBoostLasting.StatsModBoostLastingAny,
  ],
};

/** Agility Boost: makes you better at EVADING — any [agility] (or any-skill) boost, in-test / passive / lasting. */
export const compoundTagAgilityBoost: CompoundTagBase = {
  type: CompoundTagType.AgilityBoost,
  tags: [
    TagTypeStatsModBoostInTest.StatsModBoostInTestAgility,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility,
    TagTypeStatsModBoostLasting.StatsModBoostLastingAgility,
    TagTypeStatsModBoostInTest.StatsModBoostInTestAny,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAny,
    TagTypeStatsModBoostLasting.StatsModBoostLastingAny,
  ],
};

/** Intellect Boost: makes you better at INVESTIGATING — any [intellect] (or any-skill) boost, in-test / passive / lasting. */
export const compoundTagIntellectBoost: CompoundTagBase = {
  type: CompoundTagType.IntellectBoost,
  tags: [
    TagTypeStatsModBoostInTest.StatsModBoostInTestIntellect,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveIntellect,
    TagTypeStatsModBoostLasting.StatsModBoostLastingIntellect,
    TagTypeStatsModBoostInTest.StatsModBoostInTestAny,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAny,
    TagTypeStatsModBoostLasting.StatsModBoostLastingAny,
  ],
};

/** Card draw: refilling your hand — draw cards for yourself or another investigator (the Harvey Walters engine). */
export const compoundTagDraw: CompoundTagBase = {
  type: CompoundTagType.Draw,
  tags: [
    TagTypeDeckDraw.DeckDrawYou,
    TagTypeDeckDraw.DeckDrawInvestigator,
    TagTypeDeckDraw.DeckDrawReplaceSelf,
    TagTypeDeckDraw.DeckDrawFillHand,
  ],
};

/** Big hand: cares about how many cards are in your hand — scaling with, or raising, your hand size (Harvey Walters). */
export const compoundTagBigHand: CompoundTagBase = {
  type: CompoundTagType.BigHand,
  tags: [
    { type: TagTypeCondition.ConditionHandSize, where: { comparison: "min" } },
    TagTypeHandSize.HandSizeDependent,
    TagTypeHandSize.HandSizeMaxIncrease,
  ],
};

/** Commit: the committing-skill-cards archetype — commit to others, from outside hand, fetch, or add icons (Winifred Habbamock). */
export const compoundTagCommit: CompoundTagBase = {
  type: CompoundTagType.Commit,
  tags: [
    TagTypeCommit.CommitOtherInvestigator,
    TagTypeCommit.CommitFromNonHand,
    TagTypeCommit.CommitFetch,
    TagTypeSkillCommit.SkillCommitGainIcon,
  ],
};

/** Treachery handling: cancel, discard, or otherwise answer treacheries / encounter effects — a major Mystic & Survivor defensive archetype. */
export const compoundTagTreacheryHandling: CompoundTagBase = {
  type: CompoundTagType.TreacheryHandling,
  tags: [
    TagTypeCancel.CancelRevelation,
    TagTypeDiscardFromPlay.DiscardTreacheryInPlay,
    TagTypeCancel.CancelEncounterEffect,
    TagTypeCancel.CancelEncounterDraw,
    TagTypeDeckDiscard.DeckDiscardTreachery,
  ],
};

/** Encounter deck: interacting with the ENCOUNTER deck — voluntarily drawing, looking, searching, discarding, shuffling, or choosing a revealed card. */
export const compoundTagEncounterDeck: CompoundTagBase = {
  type: CompoundTagType.EncounterDeck,
  tags: [
    TagTypeDeckDraw.DeckDrawEncounter,
    TagTypeDeckLook.DeckLookEncounter,
    TagTypeDeckSearch.DeckSearchEncounter,
    TagTypeDeckDiscard.DeckDiscardEncounter,
    TagTypeDeckShuffle.DeckShuffleEncounter,
    TagTypeEncounter.EncounterRevealChoose,
  ],
};

/** Chaos-token downside: the card suffers when a bad symbol is revealed (the risk side of spell weapons — Shrivelling, Blinding Light). */
export const compoundTagChaosTokenDownside: CompoundTagBase = {
  type: CompoundTagType.ChaosTokenDownside,
  tags: [
    TagTypeChaosDownside.ChaosDownsideDamage,
    TagTypeChaosDownside.ChaosDownsideHorror,
    TagTypeChaosDownside.ChaosDownsideResource,
    TagTypeChaosDownside.ChaosDownsideAction,
    TagTypeChaosDownside.ChaosDownsideDiscard,
  ],
};

/** Doom adding: puts doom into play (power at the price of advancing the agenda) — a big Mystic archetype. */
export const compoundTagDoomAdding: CompoundTagBase = {
  type: CompoundTagType.DoomAdding,
  tags: [TagTypeDoom.DoomAdd, TagTypeCostOther.CostAddDoomSelf],
};

/** Self-harm (damage): you take your own DAMAGE — to activate an ability, or as a card's chaos-token risk. */
export const compoundTagSelfHarmDamage: CompoundTagBase = {
  type: CompoundTagType.SelfHarmDamage,
  tags: [
    TagTypeCostFree.CostFreeDamageSelf,
    TagTypeCostReaction.CostReactionDamageSelf,
    TagTypeCostOther.CostDamageSelf,
    TagTypeChaosDownside.ChaosDownsideDamage,
  ],
};

/** Self-harm (horror): you take your own HORROR — to activate an ability, a flat cost (Ward of Protection), or a card's chaos-token risk (Shrivelling). */
export const compoundTagSelfHarmHorror: CompoundTagBase = {
  type: CompoundTagType.SelfHarmHorror,
  tags: [
    TagTypeCostFree.CostFreeHorrorSelf,
    TagTypeCostReaction.CostReactionHorrorSelf,
    TagTypeCostOther.CostHorrorSelf,
    TagTypeChaosDownside.ChaosDownsideHorror,
  ],
};

/** Heal (damage): removes DAMAGE — from you, another investigator, an ally/asset, or this card (Vincent Lee cares). */
export const compoundTagHealDamage: CompoundTagBase = {
  type: CompoundTagType.HealDamage,
  tags: [
    TagTypeHeal.HealDamageYou,
    TagTypeHeal.HealDamageInvestigator,
    TagTypeHeal.HealDamageAlly,
    TagTypeHeal.HealDamageSelf,
  ],
};

/** Heal (horror): removes HORROR — from you, another investigator, an ally/asset, or this card (Carolyn Fern cares). */
export const compoundTagHealHorror: CompoundTagBase = {
  type: CompoundTagType.HealHorror,
  tags: [
    TagTypeHeal.HealHorrorYou,
    TagTypeHeal.HealHorrorInvestigator,
    TagTypeHeal.HealHorrorAlly,
    TagTypeHeal.HealHorrorSelf,
  ],
};

/** Conditional passive boost: an always-on boost that only applies to a specific action (Magnifying Glass — +1 [int] only when investigating). */
export const compoundTagConditionalPassiveBoost: CompoundTagBase = {
  type: CompoundTagType.ConditionalPassiveBoost,
  tags: [
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat, where: { action: "fight" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility, where: { action: "evade" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveIntellect, where: { action: "investigate" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny, where: { action: "fight" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny, where: { action: "evade" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny, where: { action: "investigate" } },
  ],
};

/** Exhaust to activate: an ability that exhausts the card as its cost (action / reaction / free). */
export const compoundTagExhausts: CompoundTagBase = {
  type: CompoundTagType.Exhausts,
  tags: [
    TagTypeCostAction.CostActionExhaustSelf,
    TagTypeCostReaction.CostReactionExhaustSelf,
    TagTypeCostFree.CostFreeExhaustSelf,
  ],
};

/** Return to hand: the card returns itself from PLAY to your hand (reusable, never hits the discard) — Opportunist, Try and Try Again. */
export const compoundTagReturnToHand: CompoundTagBase = {
  type: CompoundTagType.ReturnToHand,
  tags: [TagTypeRecursion.RecursionSelfToHand],
};

/** Player-deck look: look at / reorder the top of a player deck — yours or an ally's. */
export const compoundTagPlayerDeckLook: CompoundTagBase = {
  type: CompoundTagType.PlayerDeckLook,
  tags: [TagTypeDeckLook.DeckLookYou, TagTypeDeckLook.DeckLookInvestigator],
};

/** Keyword suppression: turn off an enemy's abilities — blank its text, or ignore one keyword (Retaliate/Aloof/Elusive). Mind Wipe, .45 Automatic (2). */
export const compoundTagKeywordSuppression: CompoundTagBase = {
  type: CompoundTagType.KeywordSuppression,
  tags: [
    TagTypeEnemyRestriction.EnemyBlankText,
    TagTypeEnemyRestriction.EnemyIgnoreKeyword,
  ],
};

/** Evade payoff: rewarded for evading GENERALLY — a passive evade boost, or a trigger after you evade (Pickpocketing). The evade twin of Investigate Payoff; distinct from the evasion package (cards that DO the evading). */
export const compoundTagEvadePayoff: CompoundTagBase = {
  type: CompoundTagType.EvadePayoff,
  tags: [
    TagTypeTimingAfter.TimingAfterEvadeEnemy,
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility, where: { action: "evade" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny, where: { action: "evade" } },
  ],
};

/** Additional slot: grants an EXTRA play slot (arcane / hand / ally / accessory / tarot / generic), letting you field more permanents than normal. Book of Shadows, Charisma. */
export const compoundTagAdditionalSlot: CompoundTagBase = {
  type: CompoundTagType.AdditionalSlot,
  tags: [
    TagTypeSlotAdditional.SlotAdditional,
    TagTypeSlotAdditional.SlotAdditionalAccessory,
    TagTypeSlotAdditional.SlotAdditionalAlly,
    TagTypeSlotAdditional.SlotAdditionalArcane,
    TagTypeSlotAdditional.SlotAdditionalHand,
    TagTypeSlotAdditional.SlotAdditionalTarot,
  ],
};

/** Enemy nerf: applies a lingering NEGATIVE modifier to an enemy (the inverse of a buff) — it cannot attack/move/engage, doesn't ready, is forced to exhaust, or has its text blanked. Mind Wipe. */
export const compoundTagEnemyNerf: CompoundTagBase = {
  type: CompoundTagType.EnemyNerf,
  tags: [
    TagTypeEnemyDebuff.EnemyDoesNotReady,
    TagTypeEnemyDebuff.EnemyCannotMoveIntoLocation,
    TagTypeEnemyDebuff.EnemyCannotAttack,
    TagTypeEnemyDebuff.EnemyCannotMove,
    TagTypeEnemyDebuff.EnemyExhaust,
    TagTypeEnemyRestriction.EnemyBlankText,
  ],
};

/**
 * Failure prevention: react WHEN YOU WOULD FAIL a test to change the outcome — boost the
 * skill value at the last moment to snatch success, or otherwise avert the failure. A
 * "clutch save" archetype distinct from Fail Forward (which benefits FROM failing): Lucky!.
 */
export const compoundTagFailurePrevention: CompoundTagBase = {
  type: CompoundTagType.FailurePrevention,
  tags: [TagTypeTimingWhen.TimingWhenWouldFailTest],
};

/**
 * Engagement: the card revolves around enemy ENGAGEMENT — pulling enemies to you (Taunt),
 * triggering off engaging (Zoey's Cross), or caring about being engaged with exactly one
 * enemy (Machete). The aggro/tank "I'll hold the line" cluster.
 */
export const compoundTagEngagement: CompoundTagBase = {
  type: CompoundTagType.Engagement,
  tags: [
    TagTypeEnemyEngage.EnemyEngageWithYou,
    TagTypeEnemyEngage.EnemyEngageWithYouMultiple,
    TagTypeTimingAfter.TimingAfterEngageEnemy,
    TagTypeCondition.ConditionEngagedAlone,
  ],
};

/**
 * Cross-deck: USE a card or resource belonging to ANOTHER investigator — play a teammate's
 * card from their deck/discard (Flare, A Chance Encounter) or move resources between
 * investigators (Teamwork). NOT `deck-search-investigator`, which is helping a teammate
 * search their OWN deck (Old Book of Lore, No Stone Unturned = support, not cross-deck).
 */
export const compoundTagCrossDeck: CompoundTagBase = {
  type: CompoundTagType.CrossDeck,
  tags: [
    TagTypePlayArea.PlayAreaFromInvestigator,
    TagTypeGainResource.GainResourceMoveInvestigator,
  ],
};

export const compoundTags: CompoundTagBase[] = [
  compoundTagThorns,
  compoundTagDiscardSelf,
  compoundTagSupport,
  compoundTagClueTech,
  compoundTagShroudReduction,
  compoundTagDifficultyReduction,
  compoundTagSpendResource,
  compoundTagAttackMitigation,
  compoundTagSucceedBy,
  compoundTagFailBy,
  compoundTagInvestigate,
  compoundTagEnemyFieldControl,
  compoundTagExilePackage,
  compoundTagIntoPlayCheat,
  compoundTagBoldAction,
  compoundTagChaosTokenControl,
  compoundTagBlessCurseBag,
  compoundTagBigMoney,
  compoundTagEvasionPackage,
  compoundTagProtectorTank,
  compoundTagFailForward,
  compoundTagDiscardPileValue,
  compoundTagActionCompression,
  compoundTagMulticlassPayoff,
  compoundTagHealthSafety,
  compoundTagSanitySafety,
  compoundTagTomeSupport,
  compoundTagSpellSupport,
  compoundTagRelicSupport,
  compoundTagWeaponSupport,
  compoundTagAllySupport,
  compoundTagHealing,
  compoundTagAllyHealing,
  compoundTagPassiveBoost,
  compoundTagCancel,
  compoundTagEnemyMitigation,
  compoundTagAreaDamage,
  compoundTagEfficientDamage,
  compoundTagSearch,
  compoundTagEconomy,
  compoundTagClueOnLocation,
  compoundTagOffStatCombat,
  compoundTagExtraActions,
  compoundTagActionChargeCost,
  compoundTagSelfHarmCost,
  compoundTagMultiEnemy,
  compoundTagGetaway,
  compoundTagCombatBoost,
  compoundTagAgilityBoost,
  compoundTagIntellectBoost,
  compoundTagDraw,
  compoundTagBigHand,
  compoundTagCommit,
  compoundTagTreacheryHandling,
  compoundTagEncounterDeck,
  compoundTagChaosTokenDownside,
  compoundTagDoomAdding,
  compoundTagSelfHarmDamage,
  compoundTagSelfHarmHorror,
  compoundTagHealDamage,
  compoundTagHealHorror,
  compoundTagConditionalPassiveBoost,
  compoundTagExhausts,
  compoundTagReturnToHand,
  compoundTagPlayerDeckLook,
  compoundTagKeywordSuppression,
  compoundTagEvadePayoff,
  compoundTagAdditionalSlot,
  compoundTagEnemyNerf,
  compoundTagEfficientClue,
  compoundTagOffStatInvestigation,
  compoundTagRemoteClue,
  compoundTagMobility,
  compoundTagFailurePrevention,
  compoundTagEngagement,
  compoundTagCrossDeck,
  compoundTagSlotTech,
  compoundTagVictoryDisplay,
  compoundTagCopiesMatter,
];

## EVALUATED COMPOUND MEMBERSHIPS (who actually rolls into each archetype right now)
# When your base tags land a card in one of these, the card JOINS the list — check it belongs.
c-action-compression (46): One-Two Punch (60117), Galvanize (60121), One-Two Punch (60132), Mauser C96 (60306), Mauser C96 (60321), Beretta M1918 (60331), Knowledge is Power (05231), Abigail Foreman (06324), Sword Cane (07029), Eye of the Djinn (07225), Jacob Morrison (07309), Butterfly Swords (08025), Butterfly Swords (08030), True Magick (08070), Quickdraw Holster (08089), Word of Woe (09012), Trigger Man (09076), Sin-Eater (09094), Ceremonial Sickle (09096), Dowsing Rod (09097), Onyx Pentacle (09098), Ad Hoc (10002), Task Force (10027), Hand-Eye Coordination (10030), Flurry of Blows (10037), "Throw the Book at Them!" (10049), Fine Tuning (10054), Dirty Deeds (10080), Call the Beyond (10099), Pushed to the Limit (10113), Mariner's Compass (10122), Remington Model 1858 (11022), Bulwark (11028), Remington Model 1858 (11032), Luger P08 (11050), Robert Castaigne (11051), Robert Castaigne (11062), Sword Cane (11074), Spiritual Echo (11075), Anchor Chain (11081), Hand Hook (11082), Nautical Charts (11084), Motivational Speech (11116), Well Connected (60381), Well Connected (54006), Sign Magick (54008)
c-action-uses-cost (161): Roland's .38 Special (01506), .45 Automatic (01516), First Aid (01519), Shotgun (01529), .41 Derringer (01547), Shrivelling (01560), Scrying (01561), Flashlight (01587), First Aid (01683), Old Book of Lore (01686), .41 Derringer (01688), Rite of Seeking (01689), Jenny's Twin .45s (02010), Liquid Courage (02024), Rite of Seeking (02028), Clarity of Mind (02030), Song of the Dead (02112), Shrivelling (02154), Springfield M1903 (02226), Rite of Seeking (02233), Strange Solution (02262), Strange Solution (02263), Strange Solution (02264), Lightning Gun (02301), Chicago Typewriter (02304), Shrivelling (02306), .32 Colt (03020), .45 Automatic (03190), First Aid (03230), In the Know (03027), Archaic Glyphs (03192), Archaic Glyphs (03193), .41 Derringer (03234), Lupara (03309), Alchemical Transmutation (03032), Finn's Trusty .38 (04011), Kerosene (04304), M1918 BAR (04229), Flamethrower (04305), Feed the Mind (04267), Pnakotic Manuscripts (04307), Decorated Skull (04026), Colt Vest Pocket (04268), Mists of R'lyeh (04029), Shards of the Void (04310), Mists of R'lyeh (04271), Old Hunting Rifle (04273), Thermos (04274), Ornate Bow (04204), Encyclopedia (60208), Feed the Mind (60209), Forbidden Tome (60210), Esoteric Atlas (60222), Mauser C96 (60306), Liquid Courage (60320), Mauser C96 (60321), Beretta M1918 (60331), Azure Flame (60407), Clairvoyance (60408), Ineffable Truth (60409), Azure Flame (60425), Clairvoyance (60426), Ineffable Truth (60427), Azure Flame (60430), Clairvoyance (60431), Ineffable Truth (60432), .18 Derringer (60505), .18 Derringer (60522), Chainsaw (60529), Detective's Colt 1911s (05009), Fingerprint Kit (05024), .45 Thompson (05115), Scroll of Secrets (05116), Enchanted Blade (05118), .45 Thompson (05186), .45 Thompson (05187), Scroll of Secrets (05188), Scroll of Secrets (05189), Enchanted Blade (05192), Enchanted Blade (05193), Esoteric Atlas (05232), Mk 1 Grenades (05273), Becky (06006), Tony's .38 Long Colt (06011), Scroll of Prophecies (06116), Otherworld Codex (06158), Healing Words (06163), .35 Winchester (06195), Old Book of Lore (06279), Sawed-Off Shotgun (06327), Book of Psalms (07017), Cryptographic Cipher (07021), .25 Automatic (07025), Armageddon (07117), Eye of Chaos (07118), Shroud of Shadows (07119), Armageddon (07226), Eye of Chaos (07227), Shroud of Shadows (07228), .25 Automatic (07305), Healing Words (08068), Old Shotgun (08088), Brand of Cthugha (08090), Brand of Cthugha (08092), Divination (08101), Divination (08103), Blur (08109), Blur (08111), Earthly Serenity (08117), Enchanted Bow (08118), Earthly Serenity (08119), Runic Axe (09022), Alchemical Distillation (09040), Grim Memoir (09044), Fingerprint Kit (09057), Disguise (09062), Thieves' Kit (09064), Thieves' Kit (09075), Blade of Yoth (10036), British Bull Dog (10065), British Bull Dog (10077), Remington Model 1858 (11022), Remington Model 1858 (11032), Forensic Kit (11036), Gatling Gun (11064), Breath of the Sleeper (11066), Dreamer's Chronicle (60255), Scroll of the Pharaohs (60259), Scroll of the Pharaohs (60279), Scroll of the Pharaohs (60280), Scroll of the Pharaohs (60281), Cosmic Flame (60459), Second Sight (60460), Shadowmeld (60461), Second Sight (60481), Shadowmeld (60482), Winchester Model 52 (60575), Becky (60152), M1911 (60155), Service Revolver (60158), M1911 (60171), Thompson Submachine Gun (60182), Isabelle's Twin .45s (12014), M1911 (12019), Winchester Model 12 (12029), Fingerprint Kit (12031), Local Map (12033), M1903 Hammerless (12045), Thieves' Kit (12049), Cosmic Flame (12059), Second Sight (12062), Cosmic Flame (12071), Strange Solution (51004), Rite of Seeking (51007), Clarity of Mind (51008), .32 Colt (52001), Archaic Glyphs (52004), Alchemical Transmutation (52007), Decorated Skull (53005), Colt Vest Pocket (53006), Mists of R'lyeh (53007)
c-additional-slot (33): Daisy's Tote Bag (01508), Book of Shadows (01570), Charisma (01694), Relic Hunter (01695), Bandolier (02147), Relic Hunter (02157), Charisma (02158), Mitch Brown (04006), Arcane Enlightenment (60205), Miskatonic Archaeology Funding (60232), Familiar Spirit (60410), Detective's Colt 1911s (05009), Sign Magick (05112), Anna Kaslow (05283), Dragon Pole (08060), Rod of Animalism (08128), Charlie Kane (09018), Hidden Pocket (09065), Binder's Jar (09089), Astral Mirror (09091), Dr. Charles West III (10041), Occult Reliquary (10132), "Viola" Case (11012), Scientific Studies Grant (11044), University Archivist (60260), Arcane Experience (60478), Protective Vest (60181), Charisma (12095), Relic Hunter (12096), Bandolier (51001), The Hierophant • V (54007), Sign Magick (54008), Moon Pendant (54012)
c-agility-boost (173): Hyperawareness (01534), Encyclopedia (01542), Hard Knocks (01549), Cat Burglar (01555), Dig Deep (01577), Lucky! (01580), Lucky! (01584), Ritual Candles (02029), Peter Sylvestre (02033), Peter Sylvestre (02035), Fire Extinguisher (02114), Streetwise (02189), Scrapper (02193), Dark Horse (02234), Sophie (03009), "Let me handle this!" (03022), Combat Training (03107), Fieldwork (03024), Daring Maneuver (03030), Narrow Escape (03267), Moxie (03111), Spirit Athame (03035), Grounded (03113), Fight or Flight (03155), Key of Ys (03315), Calvin Wright (04005), Intrepid (04192), Reliable (04020), Well Prepared (04151), Tooth of Eztli (04023), Quick Study (04154), High Roller (04156), Lola Santiago (04196), Recall the Future (04158), Crystalline Elder Sign (04235), Live and Learn (04200), Yaotl (04035), Cornered (04160), Trench Coat (04203), Ornate Bow (04204), Encyclopedia (60208), The Necronomicon (60233), Streetwise (60311), Daring Maneuver (60313), Daring Maneuver (60322), Chuck Fergus (60332), Ritual Candles (60405), Scrapper (60511), Grit Your Teeth (60515), Live and Learn (60516), Granny Orne (60527), Lucky! (60528), The Moon • XVIII (05031), Track Shoes (05036), Ace of Rods (05040), Moonstone (06203), Empower Self (06242), Delilah O'Rourke (06281), Showmanship (07012), Silas's Net (07015), Radiant Smite (07153), Abyssal Tome (07159), Tristan Botley (07194), The Stygian Eye (07263), Hyperawareness (07264), Geas (07265), Hard Knocks (07266), Dig Deep (07270), Jacob Morrison (07309), Combat Training (08027), Hiking Boots (08035), Prophesiae Profana (08045), The Red Clock (08053), Moxie (08056), The Black Fan (08057), The Red Clock (08058), Grounded (08069), Jury-Rig (08074), Bangle of Jinxes (08075), Brand of Cthugha (08090), Brand of Cthugha (08092), Gené Beauregard (08099), Divination (08101), Divination (08103), Ice Pick (08105), Ice Pick (08107), Blur (08109), Blur (08111), Enchanted Bow (08118), Prophetic (08120), Sleuth (08121), Bruiser (08122), Crafty (08123), Antiquary (08124), Charlie Kane (09018), One in the Chamber (09029), Martyr's Vambrace (09037), Girish Kadakia (09038), Dissection Tools (09043), Guidance (09053), Disguise (09062), Chuck Fergus (09072), Dirty Fighting (09073), Thieves' Kit (09075), Ceremonial Sickle (09082), Onyx Pentacle (09085), Elle Rubash (09092), Ceremonial Sickle (09096), Dowsing Rod (09097), Onyx Pentacle (09098), Pocket Multi Tool (09099), Making Preparations (09106), Soul Sanctification (09123), Wilson Richards (10001), Wolf Mask (10023), Cleaning Kit (10033), Eyes of Valusia (10035), Blade of Yoth (10036), Prismatic Spectacles (10056), Fox Mask (10067), British Bull Dog (10077), Ethereal Weaving (10103), Sparrow Mask (10111), Survival Technique (10123), Dark Horse (10127), Book of Verse (11005), Alton O'Connell (11033), Artistic Inspiration (11034), Forensic Kit (11036), String Along (11052), Sword Cane (11074), Anchor Chain (11081), "Catch!" (11086), Good Weather (11091), Forbidden Sutra (11103), Walter Fitzpatrick (11104), Nose to the Grindstone (11111), Blood of K'n-yan (11114), Center Stage (60357), Extravagant Ring (60360), Quick Exit (60366), The Black Fan (60379), Silver Tongue (60380), The Red Clock (60384), Experimental Psychology (60252), Unflappable (60262), Unflappable (60271), Daniel Jameson (60555), Pocketknife (60559), Decoy Trap (60562), Glassing (60563), Guerrilla Tactics (60564), Lie in Wait (60566), Guerrilla Tactics (60576), Levelheaded (60579), Longbow (60580), Police Dog (60156), Iron Sights (60163), Police Dog (60170), Extended Barrel (60172), On the Beat (60173), Endurance (60178), Isabelle's Twin .45s (12014), Endurance (12017), Through the Cracks (12037), Through the Cracks (12041), Olivier Bishop (12046), Silver Tongue (12047), Levelheaded (12076), Hyperawareness (50003), Hard Knocks (50005), Dig Deep (50009), Knight of Swords (54005)
c-ally-healing (29): First Aid (01683), Emergency Aid (02105), Inspiring Presence (03228), First Aid (03230), Kerosene (04304), Ancient Stone (04231), Lonnie Ritter (60309), Carolyn Fern (05001), Soothing Melody (05314), Manipulate Destiny (07162), Rite of Equilibrium (07308), Bandages (08073), Medical Student (08083), Call for Backup (08129), Vincent Lee (09004), Bizarre Diagnosis (09046), Surgical Kit (09056), Absolution (10024), The Key of Solomon (10104), Inspiring Presence (11029), Short Rest (11096), Experimental Psychology (60252), Psychology Student (60258), Unflappable (60271), Consume Life (60462), Infuse Life (60464), Extra Rations (60570), Field Dressing (60571), Bandages (12073)
c-ally-support (12): Teamwork (02018), Flare (02115), A Chance Encounter (02270), A Chance Encounter (03238), Calling in Favors (03158), Leo Anderson (04001), Mitch Brown (04006), Trusted (04019), Protecting the Anirniq (08102), Motivational Speech (09028), Hit and Run (09066), Motivational Speech (11116)
c-area-damage (19): Dynamite Blast (01524), Storm of Spirits (03153), Flamethrower (04305), Dynamite Blast (60129), Mk 1 Grenades (05273), Small Favor (05277), Gaze of Ouraxsh (07155), Stir the Pot (10073), Stir the Pot (10083), Servant of Brass (10107), Elaborate Distraction (10112), Long Shot (10116), "Devil" (10119), Gatling Gun (11064), Bend Blood (60483), Guerrilla Tactics (60576), Makeshift Bomb (60581), Dynamite Blast (50002), Storm of Spirits (52008)
c-attack-mitigation (19): Dodge (01523), Hypnotic Gaze (02153), Narrow Escape (03267), Suggestion (03268), Infighting (03314), Dodge (60113), Hypnotic Gaze (60414), Hypnotic Gaze (60423), Hand of Fate (07020), Obfuscation (07027), Shield of Faith (07221), Dodge (08026), Quick Getaway (09069), Binder's Jar (09089), Bulwark (11028), Misdirection (11043), Trench Armor (11113), Blood Ward (60472), Counterattack (12026)
c-big-hand (25): Laboratory Assistant (02020), Higher Education (02187), Drawing the Sign (03041), Feed the Mind (04267), Last Chance (04036), Vault of Knowledge (60202), Thrice-Damned Curiosity (60203), Arcane Enlightenment (60205), Celaeno Fragments (60206), Forbidden Tome (60210), Higher Education (60211), Laboratory Assistant (60212), Extensive Research (60216), Cryptic Writings (60224), Forbidden Tome (60229), Forbidden Tome (60230), Farsight (60231), Curiosity (05026), Patrice Hathaway (06005), Extensive Research (06198), Dream Diary (06238), Pelt Shipment (10109), Last Chance (11093), Laboratory Assistant (12032), The World • XXI (54003)
c-big-money (9): Dario El-Amin (03151), Well Connected (05028), Money Talks (05029), Cunning (05030), Money Talks (08054), The Black Fan (08057), The Black Fan (60379), Well Connected (60381), Well Connected (54006)
c-bless-curse-bag (99): Sister Mary (07001), Guardian Angel (07006), Crisis of Faith (07007), Book of Psalms (07017), Blessed Blade (07018), Rite of Sanctification (07019), Hand of Fate (07020), Cryptic Grimoire (07022), Deep Knowledge (07023), Dark Ritual (07026), Faustian Bargain (07028), Tides of Fate (07030), Ward of Radiance (07031), Promise of Power (07032), Token of Faith (07033), Keep Faith (07034), Predestined (07035), Beloved (07036), Tempt Fate (07037), Accursed Follower (07038), Dread Curse (07039), Sacred Covenant (07110), Stirring Up Trouble (07112), Blasphemous Covenant (07113), Skeptic (07115), False Covenant (07116), Armageddon (07117), Eye of Chaos (07118), Shroud of Shadows (07119), Paradoxical Covenant (07120), Ancient Covenant (07122), Radiant Smite (07153), Gaze of Ouraxsh (07155), Priest of Two Faiths (07156), Butterfly Effect (07160), Manipulate Destiny (07162), Blessing of Isis (07190), Cryptic Grimoire (07191), Cryptic Grimoire (07192), Ríastrad (07193), Tristan Botley (07194), Curse of Aeons (07195), Signum Crucis (07197), Holy Rosary (07220), Shield of Faith (07221), Fey (07222), "Lucky" Penny (07224), Eye of the Djinn (07225), Armageddon (07226), Eye of Chaos (07227), Shroud of Shadows (07228), Spirit of Humanity (07229), Harmony Restored (07230), Nephthys (07262), Geas (07265), Flute of the Outer Gods (07268), A Watchful Peace (07269), Favor of the Moon (07271), Favor of the Sun (07272), Hallow (07301), Holy Spear (07302), Justify the Means (07306), Lucky Dice (07307), Rite of Equilibrium (07308), Jacob Morrison (07309), Kōhaku Narukami (10012), Ancestral Token (10019), Absolution (10024), Guided by Faith (10025), Purified (10029), Blessed Blade (10034), Miracle Wish (10038), Control Variable (10046), Gabriel Carillo (10052), Esoteric Method (10055), Prismatic Spectacles (10056), Scrimshaw Charm (10068), Diabolical Luck (10075), Rod of Carnamagos (10085), Speak to the Dead (10091), Wicked Athame (10092), Antediluvian Hymn (10093), Accursed (10095), Rod of Carnamagos (10098), Call the Beyond (10099), Read the Signs (10101), Spectral Razor (10102), The Key of Solomon (10104), Seal of the Elders (10105), Keeper of the Key (10106), Servant of Brass (10107), Keep Faith (10124), Providential (10125), Token of Faith (10126), Dawn Star (10131), Broken Diadem (10133), Twilight Diadem (10134), Eldritch Whispers (60471), Augur of Elokoss (12070)
c-bold-action (399): Roland's .38 Special (01506), .45 Automatic (01516), Machete (01520), Shotgun (01529), Switchblade (01544), Burglary (01545), .41 Derringer (01547), Backstab (01551), Shrivelling (01560), Blinding Light (01566), Blinding Light (01569), Baseball Bat (01574), Cunning Distraction (01578), Knife (01586), Flashlight (01587), Seeking Answers (01685), Lockpicks (01687), .41 Derringer (01688), Rite of Seeking (01689), Jenny's Twin .45s (02010), Duke (02014), Blackjack (02016), Seeking Answers (02023), Rite of Seeking (02028), Bind Monster (02031), Fire Axe (02032), Bait and Switch (02034), Kukri (02036), "I've got a plan!" (02107), Song of the Dead (02112), Fire Extinguisher (02114), Flare (02115), "I'm outta here!" (02151), Switchblade (02152), Shrivelling (02154), Springfield M1903 (02226), Rite of Seeking (02233), Strange Solution (02263), Strange Solution (02264), Monster Slayer (02300), Lightning Gun (02301), Deciphered Reality (02303), Chicago Typewriter (02304), Shrivelling (02306), .32 Colt (03020), Trench Knife (03147), .45 Automatic (03190), In the Know (03027), Archaic Glyphs (03192), Archaic Glyphs (03193), Stealth (03028), Knuckleduster (03110), Cheap Shot (03194), Lockpicks (03031), .41 Derringer (03234), Lupara (03309), Suggestion (03268), Storm of Spirits (03153), Spirit Athame (03035), Lantern (03036), Gravedigger's Shovel (03037), Ursula Downs (04002), Finn's Trusty .38 (04011), Survival Knife (04017), Handcuffs (04265), Blood Eclipse (04266), M1918 BAR (04229), Flamethrower (04305), Unearth the Ancients (04024), Persuasion (04105), Ancient Stone (04022), Otherworldly Compass (04194), Colt Vest Pocket (04268), Slip Away (04232), Mists of R'lyeh (04029), Shards of the Void (04310), Mists of R'lyeh (04271), Improvised Weapon (04033), Winging It (04272), Impromptu Barrier (04312), Old Hunting Rifle (04273), Ornate Bow (04204), Timeworn Brand (04276), Clean Them Out (60111), Counterpunch (60112), "Get over here!" (60114), Monster Slayer (60116), One-Two Punch (60117), Counterpunch (60122), "Get over here!" (60123), One-Two Punch (60132), Burning the Midnight Oil (60214), Occult Invocation (60217), "I've got a plan!" (60225), Seeking Answers (60227), Lockpicks (60305), Mauser C96 (60306), Switchblade (60307), Cheap Shot (60312), Slip Away (60314), Pilfer (60315), Sneak By (60316), Mauser C96 (60321), Cheap Shot (60323), Slip Away (60324), Pilfer (60328), Backstab (60329), Beretta M1918 (60331), Azure Flame (60407), Clairvoyance (60408), Ineffable Truth (60409), Azure Flame (60425), Clairvoyance (60426), Ineffable Truth (60427), Azure Flame (60430), Clairvoyance (60431), Ineffable Truth (60432), .18 Derringer (60505), Old Keyring (60507), .18 Derringer (60522), Chainsaw (60529), Detective's Colt 1911s (05009), Twilight Blade (05013), Interrogate (05020), Fingerprint Kit (05024), Act of Desperation (05037), Banish (05113), Meat Cleaver (05114), .45 Thompson (05115), Tennessee Sour Mash (05117), Enchanted Blade (05118), Wither (05157), Sixth Sense (05158), .45 Thompson (05186), .45 Thompson (05187), Tennessee Sour Mash (05190), Tennessee Sour Mash (05191), Enchanted Blade (05192), Enchanted Blade (05193), Decoy (05234), Mk 1 Grenades (05273), Bait and Switch (05282), Wither (05321), Sixth Sense (05322), Becky (06006), Tony's .38 Long Colt (06011), The Hungering Blade (06018), Hope (06031), Zeal (06032), Augur (06033), Fortuitous Discovery (06034), Followed (06114), Read the Signs (06117), Ethereal Form (06164), .35 Winchester (06195), Burglary (06200), Spectral Razor (06201), Garrote Wire (06280), Summoned Hound (06282), Sawed-Off Shotgun (06327), Sea Change Harpoon (07014), Silas's Net (07015), Blessed Blade (07018), Cryptographic Cipher (07021), .25 Automatic (07025), Sword Cane (07029), Breaking and Entering (07114), Armageddon (07117), Eye of Chaos (07118), Shroud of Shadows (07119), Mariner's Compass (07121), Radiant Smite (07153), Abyssal Tome (07159), Ríastrad (07193), Armageddon (07226), Eye of Chaos (07227), Shroud of Shadows (07228), Holy Spear (07302), .25 Automatic (07305), Mechanic's Wrench (08002), Trusty Bullwhip (08008), Buried Secrets (08009), Toe to Toe (08020), Gang Up (08022), Sweeping Kick (08023), Butterfly Swords (08025), Fang of Tyr'thrha (08029), Butterfly Swords (08030), Unearth the Ancients (08039), Archive of Conduits (08042), Dragon Pole (08060), Fire Extinguisher (08080), Old Shotgun (08088), Brand of Cthugha (08090), Brand of Cthugha (08092), Cyclopean Hammer (08093), Sledgehammer (08094), Sledgehammer (08096), Pocket Telescope (08097), Eon Chart (08098), Divination (08101), Divination (08103), Blur (08109), Blur (08111), Enchanted Bow (08118), Sled Dog (08127), Bonesaw (09005), Runic Axe (09022), Bolas (09025), Motivational Speech (09028), Handcuffs (09035), Grim Memoir (09044), Map the Area (09048), Existential Riddle (09052), Fingerprint Kit (09057), Damning Testimony (09059), Disguise (09062), Thieves' Kit (09064), Quick Getaway (09069), Breaking and Entering (09074), Thieves' Kit (09075), Power Word (09081), Ceremonial Sickle (09082), Dowsing Rod (09083), Onyx Pentacle (09085), String of Curses (09088), Ceremonial Sickle (09096), Dowsing Rod (09097), Onyx Pentacle (09098), Baseball Bat (09113), Old Keyring (09117), Aetheric Current (10006), Aetheric Current (10007), Beguile (10010), Katana (10021), Guided by Faith (10025), Hold Up (10026), Blessed Blade (10034), Eyes of Valusia (10035), Blade of Yoth (10036), Flurry of Blows (10037), Chemistry Set (10040), Microscope (10042), Uncanny Growth (10045), Testing Sprint (10047), "Throw the Book at Them!" (10049), Transmogrify (10050), Prismatic Spectacles (10056), Confound (10057), Microscope (10058), Bianca "Die Katz" (10062), Bianca "Die Katz" (10063), Blackmail File (10064), British Bull Dog (10065), Fake Credentials (10066), False Surrender (10070), Grift (10071), Stir the Pot (10073), Vamp (10074), British Bull Dog (10077), Vamp (10081), Fake Credentials (10082), Stir the Pot (10083), Speak to the Dead (10091), Wicked Athame (10092), Drain Essence (10094), Ethereal Form (10100), Read the Signs (10101), Spectral Razor (10102), Pitchfork (10110), Stall for Time (10114), Hatchet (10117), Fire Axe (10120), Mariner's Compass (10122), Crowbar (11021), Remington Model 1858 (11022), Remington Model 1858 (11032), Forensic Kit (11036), Correlate All Its Contents (11040), Dial of Ancients (11047), Dial of Ancients (11048), Luger P08 (11050), "Where's the party?" (11053), Bum's Rush (11055), Intimidation (11056), Doppelgänger (11058), Obscure (11060), Robert Castaigne (11062), Gatling Gun (11064), Breath of the Sleeper (11066), Eyes of the Dreamer (11067), Whispers of Doom (11072), Sword Cane (11074), Anchor Chain (11081), Hand Hook (11082), Nautical Charts (11084), "Catch!" (11086), Unconventional Method (11087), Improvised Weapon (11092), Name Your Price (11105), Blood of K'n-yan (11114), Storm Ruler (11115), Motivational Speech (11116), Mauser Tankgewehr M1918 (11119), Morbid Curiosity (11127), Disruptive Poltergeist (11128), Frenzied (11129), Fame (60358), The Grapevine (60359), Lockpicks (60361), Polished Cane (60363), Clean Sweep (60364), Pay Your Dues (60365), Quick Exit (60366), A Sudden Fall (60367), Lockpicks (60372), The Grapevine (60374), Clean Sweep (60376), Quick Exit (60377), A Sudden Fall (60378), Dreamer's Chronicle (60255), Caustic Reaction (60261), Unflappable (60262), De-Escalate (60265), Insidious Truths (60266), Unflappable (60271), Caustic Reaction (60273), Hypnotize (60274), Autopsy Report (60276), Scroll of the Pharaohs (60280), Scroll of the Pharaohs (60281), Commune with the Cosmos (60282), Cosmic Flame (60459), Second Sight (60460), Shadowmeld (60461), Consume Life (60462), Spiritual Charm (60466), Dread Curse of Azathoth (60474), Ritual Dagger (60475), Second Sight (60481), Shadowmeld (60482), Bend Blood (60483), Old Compass (60558), Pocketknife (60559), Decoy Trap (60562), Glassing (60563), Guerrilla Tactics (60564), Lie in Wait (60566), Winchester Model 52 (60575), Guerrilla Tactics (60576), Longbow (60580), Becky (60152), M1911 (60155), Service Revolver (60158), "Make 'em sing" (60160), Stakeout (60166), M1911 (60171), Stakeout (60179), Thompson Submachine Gun (60182), Daniela Reyes (12001), Daniela's Wrench (12002), Isabelle's Twin .45s (12014), M1911 (12019), Machete (12020), Sledgehammer (12028), Winchester Model 12 (12029), Fingerprint Kit (12031), Local Map (12033), Through the Cracks (12037), Through the Cracks (12041), M1903 Hammerless (12045), Thieves' Kit (12049), Breaking and Entering (12050), Paint the Town Red (12051), Decisive Strike (12055), Cosmic Flame (12059), Second Sight (12062), Augur of Elokoss (12070), Cosmic Flame (12071), Meat Cleaver (12077), "Shove off!" (12079), Old Compass (12083), Meat Cleaver (12085), Broken Bottle (12086), Hand-Crank Flashlight (12088), Blackjack (51002), Rite of Seeking (51007), .32 Colt (52001), Archaic Glyphs (52004), Stealth (52005), Suggestion (52006), Storm of Spirits (52008), Lantern (52009), Gravedigger's Shovel (52010), Unspeakable Oath (52013), Blood Eclipse (53001), Survival Knife (53002), Colt Vest Pocket (53006), Mists of R'lyeh (53007)
c-cancel (86): Dodge (01523), Ward of Protection (01565), "I've had worse…" (01684), Eucatastrophe (01692), Hypnotic Gaze (02153), "I've had worse…" (02261), Dr. William T. Maleson (02302), Ward of Protection (02307), Armor of Ardennes (03305), Forewarned (03150), Narrow Escape (03267), Suggestion (03268), Ward of Protection (03270), A Test of Will (03156), Devil's Luck (03157), Infighting (03314), Father Mateo (04004), All In (04309), Counterspell (04110), Perseverance (04111), Flesh Ward (60106), Dodge (60113), Jacqueline Fine (60401), Hypnotic Gaze (60414), Eldritch Inspiration (60420), Hypnotic Gaze (60423), Neither Rain nor Snow (60502), A Test of Will (60513), A Test of Will (60523), Dark Insight (05014), Delay the Inevitable (05021), Deny Existence (05032), Eldritch Inspiration (05033), Deny Existence (05280), "I've had worse…" (05315), Eucatastrophe (05324), "Fool me once..." (06156), Wish Eater (06277), Nightmare Bauble (06330), Hand of Fate (07020), Obfuscation (07027), Ward of Radiance (07031), False Covenant (07116), Third Time's a Charm (07161), Blessing of Isis (07190), Curse of Aeons (07195), Shield of Faith (07221), Ikiaq (07267), Purifying Corruption (07273), "Get behind me!" (08021), Dodge (08026), Counterespionage (08049), Foresight (08064), Protective Gear (08095), Talisman of Protection (08116), Heavy Furs (08126), Custom Modifications (09023), Analysis (09049), Dr. William T. Maleson (09054), Quick Getaway (09069), Binder's Jar (09089), Idol of Xanatos (09102), Strong-Armed (10031), Ravenous Myconid (10059), Agatha Crane (11007), Agatha Crane (11008), Psychic Sensitivity (11015), Bulwark (11028), Uncanny Specimen (11039), Correlate All Its Contents (11040), Misdirection (11043), Dial of Ancients (11047), "You've had worse..." (11054), "You've had worse..." (11063), Spectral Shield (11071), Dreams of the Clay (11100), Trench Armor (11113), Sacred Oath (11121), Sacred Oath (11122), Sacred Oath (11123), Contingency (60383), Sacrificial Doll (60458), Blood Ward (60472), Counterattack (12026), Ward of Protection (12065), Nine of Rods (54009)
c-chaos-token-control (72): Grotesque Statue (01571), Will to Survive (01585), Eucatastrophe (01692), Defiance (02190), Lucky Dice (02230), "Eat lead!" (03304), Seal of the Elder Sign (03312), Father Mateo (04004), The Codex of Ages (04013), Pnakotic Manuscripts (04307), Olive McBride (04197), Dark Prophecy (04032), Premonition (04199), Protective Incantation (04031), Recall the Future (04158), Counterspell (04110), Defiance (04198), Shards of the Void (04310), Against All Odds (04202), Jacqueline Fine (60401), Crystal Pendulum (60411), Dark Prophecy (60417), Defiance (60418), Prescient (60419), Eldritch Inspiration (60420), Grotesque Statue (60421), Will to Survive (60512), Eldritch Inspiration (05033), Eucatastrophe (05324), Wish Eater (06277), The Black Cat (06285), Nightmare Bauble (06330), Sacred Covenant (07110), False Covenant (07116), Ancient Covenant (07122), Third Time's a Charm (07161), Blessing of Isis (07190), Curse of Aeons (07195), Unrelenting (07196), "Lucky" Penny (07224), Favor of the Moon (07271), Favor of the Sun (07272), Lucky Dice (07307), Nkosi Mabati (08091), "Hit me!" (08112), Heavy Furs (08126), Custom Modifications (09023), Analysis (09049), Ectoplasmic Horror (09127), Book of Living Myths (10013), Strong-Armed (10031), Olive McBride (10097), Dawn Star (10131), Twilight Diadem (10134), Agatha Crane (11007), Agatha Crane (11008), Ocula Obscura (11009), Glimpse the Void (11010), Uncanny Specimen (11039), Correlate All Its Contents (11040), Dial of Ancients (11046), Dial of Ancients (11047), Dial of Ancients (11048), Breath of the Sleeper (11066), Eyes of the Dreamer (11067), Katarina Sojka (11069), Forbidden Sutra (11103), Contingency (60383), Sacrificial Doll (60458), Premonition (12064), Mask of Silenus (12068), "Eat lead!" (52002)
c-chaos-token-downside (41): Shrivelling (01560), Blinding Light (01566), Blinding Light (01569), Baseball Bat (01574), Rite of Seeking (01689), Rite of Seeking (02028), Shrivelling (02154), Rite of Seeking (02233), Shrivelling (02306), Alchemical Transmutation (03032), Astral Travel (03034), Storm of Spirits (03153), Recharge (03197), Mists of R'lyeh (04029), Mists of R'lyeh (04271), Azure Flame (60407), Clairvoyance (60408), Ineffable Truth (60409), Astral Travel (60413), Azure Flame (60425), Clairvoyance (60426), Ineffable Truth (60427), Azure Flame (60430), Clairvoyance (60431), Ineffable Truth (60432), The Black Cat (06285), Cosmic Flame (60459), Second Sight (60460), Shadowmeld (60461), Second Sight (60481), Shadowmeld (60482), Rope Trap (60578), Cosmic Flame (12059), Second Sight (12062), Mask of Silenus (12068), Cosmic Flame (12071), Scrape By (12082), Rite of Seeking (51007), Alchemical Transmutation (52007), Storm of Spirits (52008), Mists of R'lyeh (53007)
c-clue-on-location (19): Roland's .38 Special (01506), Magnifying Glass (01540), Preposterous Sketches (02186), Inquiring Mind (02227), Fieldwork (03024), Forewarned (03150), Truth from Fiction (04152), Preposterous Sketches (60218), Connect the Dots (05025), Crack the Case (05110), Bizarre Diagnosis (09046), Captivating Discovery (09047), Dowsing Rod (09083), Clean Sweep (60364), Lethal Curiosity (60254), Preposterous Sketches (60263), Magnifying Glass (60270), Preposterous Sketches (51003), Truth from Fiction (53003)
c-clue-tech (101): Evidence! (01522), Working a Hunch (01537), Drawn to the Flame (01564), "Look what I found!" (01579), Flashlight (01587), Seeking Answers (01685), Seeking Answers (02023), Art Student (02149), Arcane Insight (03266), Lantern (03036), Gravedigger's Shovel (03037), Finn Edwards (04003), Scene of the Crime (04103), Vantage Point (04306), True Understanding (04153), Otherworldly Compass (04194), Eavesdrop (04027), The Skeleton Key (04270), Lola Santiago (04196), Winging It (04272), Grete Wagner (60107), Evidence! (60120), Lesson Learned (60124), Grete Wagner (60128), Extensive Research (60216), Seeking Answers (60227), Forbidden Tome (60230), The Necronomicon (60233), Old Keyring (60507), Mysterious Raven (60509), "Look what I found!" (60517), "Look what I found!" (60524), Interrogate (05020), Connect the Dots (05025), Intel Report (05111), Belly of the Beast (05160), Agency Backup (05274), Ghastly Revelation (05275), Occult Evidence (06008), Pendant of the Queen (06022), Extensive Research (06198), Cryptographic Cipher (07021), Stirring Up Trouble (07112), Eye of Chaos (07118), Under Surveillance (07157), Eye of Chaos (07227), Burn After Reading (08076), On the Trail (08084), On the Trail (08085), Divination (08101), Professor William Webb (08104), Professor William Webb (08106), Call for Backup (08129), Breach the Door (09026), Field Agent (09033), Research Notes (09045), Damning Testimony (09059), Kicking the Hornet's Nest (09068), Clean Sneak (09078), String of Curses (09088), Shed a Light (09108), Nature of the Beast (09111), Old Keyring (09117), Task Force (10027), Control Variable (10046), Transmogrify (10050), Confound (10057), Fake Credentials (10066), Vamp (10074), Snitch (10078), Vamp (10081), Fake Credentials (10082), Keeper of the Key (10106), Matchbox (10108), Lucius Galloway (11004), Alton O'Connell (11033), Oculus Mortuum (11038), Working a Hunch (11045), Antikythera (11049), Contemplative (11088), True Awakening (11106), On Their Heels (11120), Pay Your Dues (60365), Right Under Their Noses (60368), Right Under Their Noses (60382), Carolyn Fern (60251), Second Sight (60481), Old Compass (60558), Stalk Prey (60567), Rookie Cop (60157), "Make 'em sing" (60160), Detective Sherman (60177), Lesson Learned (12022), Scene of the Crime (12024), Working a Hunch (12038), Will of the Cosmos (12066), "Look what I found!" (12078), Old Compass (12083), Hand-Crank Flashlight (12088), Lantern (52009), Gravedigger's Shovel (52010)
c-combat-boost (269): Roland's .38 Special (01506), .45 Automatic (01516), Physical Training (01517), Beat Cop (01518), Machete (01520), Beat Cop (01528), Shotgun (01529), Encyclopedia (01542), .41 Derringer (01547), Hard Knocks (01549), Baseball Bat (01574), Lucky! (01580), Lucky! (01584), Knife (01586), .41 Derringer (01688), Jenny's Twin .45s (02010), Blackjack (02016), Hired Muscle (02027), Ritual Candles (02029), Fire Axe (02032), Kukri (02036), Fire Extinguisher (02114), Flare (02115), Switchblade (02152), Keen Eye (02185), Blood Pact (02191), Scrapper (02193), Springfield M1903 (02226), Dark Horse (02234), Lightning Gun (02301), Chicago Typewriter (02304), Sophie (03009), Trench Knife (03147), "Let me handle this!" (03022), Combat Training (03107), .45 Automatic (03190), Fieldwork (03024), Scientific Theory (03109), Daring Maneuver (03030), Narrow Escape (03267), .41 Derringer (03234), Lupara (03309), Spirit Athame (03035), Grounded (03113), Gravedigger's Shovel (03037), Fight or Flight (03155), Key of Ys (03315), Finn's Trusty .38 (04011), Calvin Wright (04005), Survival Knife (04017), Intrepid (04192), Reliable (04020), Well Prepared (04151), Flamethrower (04305), Quick Study (04154), Colt Vest Pocket (04268), High Roller (04156), Recall the Future (04158), Crystalline Elder Sign (04235), Live and Learn (04200), Yaotl (04035), Cornered (04160), Old Hunting Rifle (04273), Timeworn Brand (04276), Boxing Gloves (60105), Grete Wagner (60107), Physical Training (60108), One-Two Punch (60117), Counterpunch (60122), Boxing Gloves (60127), Grete Wagner (60128), Physical Training (60131), One-Two Punch (60132), Encyclopedia (60208), The Necronomicon (60233), Mauser C96 (60306), Lonnie Ritter (60309), Daring Maneuver (60313), Mauser C96 (60321), Daring Maneuver (60322), Beretta M1918 (60331), Chuck Fergus (60332), Ritual Candles (60405), .18 Derringer (60505), Scrapper (60511), Grit Your Teeth (60515), Live and Learn (60516), .18 Derringer (60522), Granny Orne (60527), Lucky! (60528), Chainsaw (60529), Detective's Colt 1911s (05009), Ace of Swords (05023), Act of Desperation (05037), Ace of Rods (05040), Meat Cleaver (05114), .45 Thompson (05115), Tennessee Sour Mash (05117), Enchanted Blade (05118), .45 Thompson (05186), .45 Thompson (05187), Tennessee Sour Mash (05190), Tennessee Sour Mash (05191), Enchanted Blade (05192), Enchanted Blade (05193), Mk 1 Grenades (05273), Becky (06006), Tony's .38 Long Colt (06011), The Hungering Blade (06018), Jessica Hyde (06118), .35 Winchester (06195), Empower Self (06241), Garrote Wire (06280), Delilah O'Rourke (06281), Showmanship (07012), Sea Change Harpoon (07014), Blessed Blade (07018), .25 Automatic (07025), Keen Eye (07152), Radiant Smite (07153), Blood Pact (07158), Abyssal Tome (07159), Ríastrad (07193), Tristan Botley (07194), The Stygian Eye (07263), Geas (07265), Hard Knocks (07266), Holy Spear (07302), .25 Automatic (07305), Jacob Morrison (07309), Mechanic's Wrench (08002), Gang Up (08022), Butterfly Swords (08025), Combat Training (08027), Butterfly Swords (08030), Scientific Theory (08040), The Red Clock (08053), The Black Fan (08057), The Red Clock (08058), Dragon Pole (08060), Grounded (08069), Jury-Rig (08074), Bangle of Jinxes (08075), Fire Extinguisher (08080), Michael Leigh (08086), Old Shotgun (08088), Brand of Cthugha (08090), Brand of Cthugha (08092), Sledgehammer (08094), Sledgehammer (08096), Divination (08101), Divination (08103), Ice Pick (08105), Ice Pick (08107), Blur (08109), Blur (08111), Enchanted Bow (08118), Prophetic (08120), Sleuth (08121), Bruiser (08122), Crafty (08123), Antiquary (08124), Sled Dog (08127), Bonesaw (09005), Charlie Kane (09018), Runic Axe (09022), One in the Chamber (09029), Martyr's Vambrace (09037), Girish Kadakia (09038), Dissection Tools (09043), Guidance (09053), Chuck Fergus (09072), Dirty Fighting (09073), Thieves' Kit (09075), Ceremonial Sickle (09082), Onyx Pentacle (09085), Elle Rubash (09092), Ceremonial Sickle (09096), Dowsing Rod (09097), Onyx Pentacle (09098), Pocket Multi Tool (09099), Making Preparations (09106), Baseball Bat (09113), Soul Sanctification (09123), Wilson Richards (10001), Katana (10021), Wolf Mask (10023), Cleaning Kit (10033), Blessed Blade (10034), Eyes of Valusia (10035), Blade of Yoth (10036), "Throw the Book at Them!" (10049), Prismatic Spectacles (10056), British Bull Dog (10077), Cat Mask (10084), Wicked Athame (10092), Ethereal Weaving (10103), Pitchfork (10110), Fire Axe (10120), Survival Technique (10123), Dark Horse (10127), Book of Verse (11005), Crowbar (11021), Remington Model 1858 (11022), Hunter's Mark (11026), Remington Model 1858 (11032), Artistic Inspiration (11034), Forensic Kit (11036), Luger P08 (11050), Robert Castaigne (11051), String Along (11052), Robert Castaigne (11062), Sword Cane (11074), Hand Hook (11082), Good Weather (11091), Forbidden Sutra (11103), Walter Fitzpatrick (11104), Dakota Garofalo (11110), Nose to the Grindstone (11111), Blood of K'n-yan (11114), Mauser Tankgewehr M1918 (11119), Center Stage (60357), Extravagant Ring (60360), A Sudden Fall (60367), The Black Fan (60379), The Red Clock (60384), Experimental Psychology (60252), Insidious Truths (60266), Spiritual Intuition (60476), Daniel Jameson (60555), Pocketknife (60559), Decoy Trap (60562), Glassing (60563), Guerrilla Tactics (60564), Lie in Wait (60566), Winchester Model 52 (60575), Guerrilla Tactics (60576), Becky (60152), M1911 (60155), Police Dog (60156), Service Revolver (60158), Iron Sights (60163), Police Dog (60170), M1911 (60171), Extended Barrel (60172), On the Beat (60173), Detective Sherman (60177), Endurance (60178), Thompson Submachine Gun (60182), Daniela's Wrench (12002), Isabelle's Twin .45s (12014), Endurance (12017), Logan Hastings (12018), M1911 (12019), Machete (12020), Sledgehammer (12028), Winchester Model 12 (12029), Decisive Strike (12055), Spiritual Intuition (12063), Meat Cleaver (12077), Meat Cleaver (12085), Broken Bottle (12086), Physical Training (50001), Hard Knocks (50005), Blackjack (51002), Gravedigger's Shovel (52010), Survival Knife (53002), Colt Vest Pocket (53006), Knight of Swords (54005)
c-commit (71): Leadership (02260), Minh Thi Phan (03002), Analytical Mind (03010), Torrent of Power (03235), "Not without a fight!" (03272), Daredevil (60318), Copycat (60330), Twilight Blade (05013), Steadfast (05022), Curiosity (05026), Cunning (05030), Prophesy (05034), Able Bodied (05038), Grisly Totem (05119), Grisly Totem (05194), Grisly Totem (05195), Mandy Thompson (06002), Crystallizer of Dreams (06024), Self-Sacrifice (06157), Brute Force (06166), Practice Makes Perfect (06197), Sharp Vision (06204), Leadership (06235), Dream Diary (06236), Dream Diary (06237), Dream Diary (06238), Daredevil (06240), Expeditious Retreat (06246), Surprising Find (06278), Amanda Sharpe (07002), Silas Marsh (07005), Plan of Action (07024), Guided by the Unseen (07223), Livre d'Eibon (08005), Defensive Stance (08024), Written in the Stars (08034), Survey the Area (08037), Savant (08052), Occult Theory (08065), Astronomical Atlas (08067), Strength in Numbers (08077), Dauntless Spirit (08078), "As you wish" (09002), Fighting Lessons (09030), Helping Hand (09031), Bestow Resolve (09032), Calculated Risk (09070), Ghastly Possession (09090), Grizzled (09101), Well-Funded (10051), Diabolical Luck (10075), Persistence (10118), Well-Dressed (10130), George Barnaby (11017), Hardboiled (11025), Quick-Witted (11042), Contemplative (11088), Gift of Nodens (11094), Double Down (11107), Know the Exit (60352), Know the Line (60353), Know the Scene (60354), Easy Street (60369), Dreamer's Chronicle (60255), Torrent of Power (60469), Rough (60572), Armed to the Teeth (60168), Indomitable (60180), Isabelle Barnes (12013), Rise to the Occasion (51010), Moon Pendant (54012)
c-conditional-passive-boost (11): Magnifying Glass (01530), Magnifying Glass (01540), Newspaper (02155), Newspaper (03313), Trench Coat (04203), Boxing Gloves (60105), Boxing Gloves (60127), Hunter's Mark (11026), Magnifying Glass (60270), Extended Barrel (60172), Magnifying Glass (12034)
c-copies-matter (11): Segment of Onyx (06021), Easy Mark (06026), Fortuitous Discovery (06034), Dream-Enhancing Serum (06159), Three Aces (06199), Lucid Dreaming (06205), Spiritual Resolve (06323), Mind's Eye (06328), Sled Dog (08127), Sign of Xelotaph (11070), Short Rest (11096)
c-cross-deck (12): Teamwork (02018), Flare (02115), A Chance Encounter (02270), Eidetic Memory (03306), A Chance Encounter (03238), Copycat (60330), "You owe me one!" (05319), Kleptomania (06036), Untimely Transaction (08051), Black Market (08055), "I'll Pay You Back!" (10072), "You've had worse..." (11063)
c-difficulty-reduction (24): Flashlight (01587), Fine Clothes (02272), Arcane Insight (03266), Lantern (03036), Vantage Point (04306), Otherworldly Compass (04194), The Skeleton Key (04270), Winging It (04272), Old Keyring (60507), Quick Learner (60530), Momentum (06115), Cryptographic Cipher (07021), Darrell Simmons (09015), Breach the Door (09026), Map the Area (09048), Existential Riddle (09052), Gumption (09112), Old Keyring (09117), Flashlight (09122), Matchbox (10108), Old Compass (60558), Old Compass (12083), Hand-Crank Flashlight (12088), Lantern (52009)
c-discard-pile-value (60): Wendy's Amulet (01514), Scavenging (01573), Try and Try Again (02309), Minh Thi Phan (03002), The Painted World (03012), William Yorick (03005), Eidetic Memory (03306), Quantum Flux (03196), Resourceful (03039), True Survivor (03273), Improvised Weapon (04033), Winging It (04272), Impromptu Barrier (04312), Try and Try Again (04159), Nathaniel Cho (60101), Winifred Habbamock (60301), Prescient (60419), Well-Maintained (05152), Grisly Totem (05195), De Vermis Mysteriis (05235), Patrice Hathaway (06005), Tetsuo Mori (06155), Scrounge for Supplies (06165), Practice Makes Perfect (06197), Moonstone (06203), A Glimmer of Hope (06245), Scavenging (06332), Amanda Sharpe (07002), Silas Marsh (07005), Sea Change Harpoon (07014), Silas's Net (07015), Butterfly Effect (07160), Shrine of the Moirai (07310), Astronomical Atlas (08067), Protecting the Anirniq (08102), Professor William Webb (08104), Professor William Webb (08106), Word of Woe (09012), Word of Weal (09013), Uncage the Soul (09095), Improvised Shield (09103), Speak to the Dead (10091), Pushed to the Limit (10113), Persistence (10118), Eldritch Tongue (10128), Agatha Crane (11007), Agatha Crane (11008), The Book of War (11020), Quick-Witted (11042), Profane Idol (11085), A Glimmer of Hope (11090), Improvised Weapon (11092), Do-or-Die (60568), On the Brink (60569), Hunter's Instinct (60574), Respite (60577), Isabelle Barnes (12013), Hunter's Instinct (12074), Jumpsuit (12075), On the Brink (12084)
c-discard-self (120): Beat Cop (01518), Police Badge (01527), Barricade (01538), Disc of Itzamna (01541), Baseball Bat (01574), Stray Cat (01576), Knife (01586), Strange Solution (02021), Hired Muscle (02027), Bind Monster (02031), Lure (02156), The Red-Gloved Man (02310), The King in Yellow (03011), Ambush (03148), Archaic Glyphs (03025), St. Hubert's Key (03269), Lantern (03036), Gravedigger's Shovel (03037), Hiding Spot (03038), Snare Trap (03199), Drawing the Sign (03041), The Codex of Ages (04013), Intrepid (04192), Ancient Stone (04022), Colt Vest Pocket (04268), Treasure Hunter (04025), Premonition (04199), Protective Incantation (04031), Self-Destructive (60104), Relentless (60109), Obsessive (60204), Disc of Itzamna (60207), Forbidden Tome (60210), Lockpicks (60305), Nihilism (60404), Called by the Mists (60503), Atychiphobia (60504), Mysterious Raven (60509), Rational Thought (05008), Baron Samedi (05019), Delay the Inevitable (05021), The 13th Vision (05041), Tennessee Sour Mash (05117), Tennessee Sour Mash (05190), Tennessee Sour Mash (05191), Investments (05233), Lure (05323), Hope (06031), Zeal (06032), Augur (06033), Self-Centered (06035), Narcolepsy (06037), "Fool me once..." (06156), Siren Call (07016), Cryptic Grimoire (07022), Dark Ritual (07026), Priest of Two Faiths (07156), Under Surveillance (07157), Enchanted Armor (07189), Geas (07265), The Harbinger (08006), Buried Secrets (08009), Archive of Conduits (08033), Fire Extinguisher (08080), Ice Pick (08107), Talisman of Protection (08116), Arm Injury (08130), Panic (08132), Baseball Bat (09113), Hasty Repairs (10003), Beguile (10010), Chemistry Set (10040), Fake Credentials (10066), Hatchet (10117), Maimed Hand (10135), Back Injury (10136), The Silver Moth (10137), Vow of Drzytelech (10138), "I'll do it myself" (11003), Hunter's Mark (11026), Uncanny Specimen (11039), Sign of Xelotaph (11070), Spectral Shield (11071), Ample Supplies (11089), Good Weather (11091), Sacred Oath (11121), Sacred Oath (11122), Sacred Oath (11123), Down and Out (11126), Morbid Curiosity (11127), Disruptive Poltergeist (11128), Frenzied (11129), Unaware (60356), Lockpicks (60361), Unbroken Web (60253), Called to Guinée (60453), Hemophobia (60454), Decoy Trap (60562), Glassing (60563), Hidden Shelter (60565), Lie in Wait (60566), Winchester Model 52 (60575), Makeshift Bomb (60581), Overconfident (60154), Custom Grip (60162), Restrained (60165), In Harm's Way (12003), The Necronomicon (12012), Premonition (12064), Jumpsuit (12075), Broken Bottle (12086), Hand-Crank Flashlight (12088), Pursued (12102), Syndicate Obligations (12103), Wounded (12104), Barricade (50004), Lantern (52009), Gravedigger's Shovel (52010), Colt Vest Pocket (53006), Knight of Swords (54005)
c-doom-adding (27): Arcane Initiate (01563), Blood Pact (02191), Alyssa Graham (02232), David Renfield (03112), Arcane Initiate (03271), The Price of Failure (04039), Marie Lambeau (05006), Baron Samedi (05019), De Vermis Mysteriis (05235), Tony's Quarry (06012), Blood Pact (07158), Abyssal Tome (07159), Amina Zidane (09011), Word of Woe (09012), Ceremonial Sickle (09082), Dowsing Rod (09083), Hallowed Chalice (09084), Onyx Pentacle (09085), Ghastly Possession (09090), Ceremonial Sickle (09096), Dowsing Rod (09097), Onyx Pentacle (09098), Fickle Fortune (09118), Arcane Initiate (60455), Dread Curse of Azathoth (60474), Will of the Cosmos (12066), The Nameless Lurker (12099)
c-draw (198): Heirloom of Hyperborea (01512), Old Book of Lore (01531), Cryptic Research (01543), Pickpocketing (01546), Arcane Initiate (01563), Rabbit's Foot (01575), Lucky! (01584), Guts (01589), Perception (01590), Overpower (01591), Manual Dexterity (01592), Old Book of Lore (01686), Emergency Cache (01693), Search for the Truth (02008), Taunt (02019), Laboratory Assistant (02020), Strange Solution (02021), Stand Together (02148), Preposterous Sketches (02186), Emergency Cache (02194), Jewel of Aureolus (02269), Moment of Respite (02273), Mark Harrigan (03001), Analytical Mind (03010), Improvisation (03018), No Stone Unturned (03026), Eureka! (03231), No Stone Unturned (03307), Pickpocketing (03195), Quantum Flux (03196), Arcane Initiate (03271), Madame Labranche (03198), Leo Anderson (04001), Jake Williams (04008), Smuggled Goods (04010), Father Mateo (04004), Second Wind (04149), Tooth of Eztli (04023), Unearth the Ancients (04024), Feed the Mind (04267), Expose Weakness (04195), Decorated Skull (04026), Lucky Cigarette Case (04107), Coup de Grâce (04269), All In (04309), Sacrifice (04234), Take Heart (04201), Timeworn Brand (04276), Glory (60115), Overpower (60126), Taunt (60130), Harvey Walters (60201), Vault of Knowledge (60202), Feed the Mind (60209), Forbidden Tome (60210), Laboratory Assistant (60212), Whitton Greene (60213), Preposterous Sketches (60218), Glimpse the Unthinkable (60221), Whitton Greene (60223), Mind over Matter (60226), Perception (60228), The Necronomicon (60233), Winifred Habbamock (60301), Lucky Cigarette Case (60308), Liquid Courage (60320), Daring Maneuver (60322), Manual Dexterity (60325), Lucky Cigarette Case (60326), Jacqueline Fine (60401), Crystal Pendulum (60411), Guts (60424), Rabbit's Foot (60510), Take Heart (60519), Lucky! (60528), Diana Stanley (05004), Hypnotic Therapy (05007), Mr. "Rook" (05153), Henry Wan (05155), Drawing Thin (05159), Enchanted Blade (05192), Grisly Totem (05194), Knowledge is Power (05231), Studious (05276), Deny Existence (05280), Soothing Melody (05314), Blood-Rite (05317), Glimpse the Unthinkable (05318), "You owe me one!" (05319), Mandy Thompson (06002), Patrice Hathaway (06005), Patrice's Violin (06016), Easy Mark (06026), The Stars Are Right (06028), Daring (06111), Scroll of Prophecies (06116), Self-Sacrifice (06157), Dream-Enhancing Serum (06159), Three Aces (06199), Word of Command (06202), Lucid Dreaming (06205), Surprising Find (06278), Old Book of Lore (06279), Nothing Left to Lose (06284), Amanda Sharpe (07002), Dexter Drake (07004), Deep Knowledge (07023), Plan of Action (07024), Tempt Fate (07037), Cryptic Grimoire (07192), Unrelenting (07196), "Lucky" Penny (07224), Ancestral Knowledge (07303), Monterey Jack (08007), Forced Learning (08031), Jeremiah Kirby (08032), Unearth the Ancients (08039), Archive of Conduits (08044), Counterespionage (08049), Untimely Transaction (08051), Money Talks (08054), Parallel Fates (08066), Blood Will Have Blood (08079), Protecting the Anirniq (08102), Carson Sinclair (09001), "As you wish" (09002), Alchemical Distillation (09040), Empirical Hypothesis (09041), Grim Memoir (09044), Surgical Kit (09056), Friends in Low Places (09060), Clean Sneak (09078), Eldritch Initiation (09086), End of the Road (09104), Predator or Prey (09107), At a Crossroads (09109), Katja Eastbank (09114), Heed the Dream (09115), Aetheric Current (10006), Aetheric Current (10007), Second Wind (10032), Chemistry Set (10040), Thorough Inquiry (10048), Gabriel Carillo (10052), Bewitching (10079), Wrong Place, Right Time (10115), Marion Tavares (11001), Book of Verse (11005), Agatha Crane (11007), Agatha Crane (11008), Psychic Sensitivity (11015), George Barnaby (11017), Ready for Anything (11024), Uncanny Specimen (11039), Cosmic Revelation (11041), Antikythera (11049), String Along (11052), "Where's the party?" (11053), Robert Castaigne (11062), Improvised Weapon (11092), Last Chance (11093), True Awakening (11106), The Grapevine (60374), Scroll of the Pharaohs (60259), Preposterous Sketches (60263), Psychoanalysis (60264), Establish Motive (60268), Psychoanalysis (60278), Marie Lambeau (60451), Arcane Initiate (60455), Jim Culver (60479), Miguel's Knapsack (60552), Rabbit's Foot (60560), Hidden Shelter (60565), Stalk Prey (60567), Respite (60577), Joe Diamond (12004), Detective's Intuition (12005), Covert Ops (12008), Laboratory Assistant (12032), Gather Intel (12036), Mysterious Grimoire (12040), Studious (12042), Unbridled Knowledge (12043), Lucky Cigarette Case (12044), Jim Culver (12060), On the Brink (12084), Guts (12090), Manual Dexterity (12091), Overpower (12092), Perception (12093), Rabbit's Foot (50010), Preposterous Sketches (51003), Strange Solution (51004), Contraband (51005), Through the Gates (51011), Decorated Skull (53005), The World • XXI (54003)
c-economy (224): Dr. Milan Christopher (01533), Burglary (01545), Hot Streak (01557), Forbidden Knowledge (01558), Emergency Cache (01588), "I've had worse…" (01684), Old Book of Lore (01686), Emergency Cache (01693), Teamwork (02018), Flare (02115), Stand Together (02148), Lone Wolf (02188), Emergency Cache (02194), "I've had worse…" (02261), Joey "The Rat" Vigil (02265), Jewel of Aureolus (02269), A Chance Encounter (02270), Spirit-Speaker (03014), Improvisation (03018), Ever Vigilant (03023), Archaic Glyphs (03025), Charles Ross, Esq. (03149), Dario El-Amin (03151), Sleight of Hand (03029), "Watch this!" (03233), Pickpocketing (03195), Alchemical Transmutation (03032), David Renfield (03112), Uncage the Soul (03033), Madame Labranche (03198), A Chance Encounter (03238), Calling in Favors (03158), Emergency Cache (03239), Leo Anderson (04001), Father Mateo (04004), Dr. Elli Horowitz (04021), Unearth the Ancients (04024), Decorated Skull (04026), "You handle this one!" (04028), Fence (04108), Pay Day (04233), High Roller (04156), Sacrifice (04234), Take Heart (04201), On Your Own (04236), Relentless (60109), Clean Them Out (60111), Stand Together (60118), Burning the Midnight Oil (60214), Cryptic Writings (60215), Library Docent (60220), Cryptic Writings (60224), Farsight (60231), Mauser C96 (60306), Sneak By (60316), Mauser C96 (60321), Chuck Fergus (60332), Robes of Endless Night (60412), Voice of Ra (60416), Robes of Endless Night (60422), Take Heart (60519), Carolyn Fern (05001), Joe Diamond (05002), Diana Stanley (05004), Family Inheritance (05011), Ace of Swords (05023), Death • XIII (05027), The Moon • XVIII (05031), Four of Cups (05035), Act of Desperation (05037), Five of Pentacles (05039), Ace of Rods (05040), Crack the Case (05110), Henry Wan (05155), Drawing Thin (05159), .45 Thompson (05186), The Council's Coffer (05196), Investments (05233), De Vermis Mysteriis (05235), Another Day, Another Dollar (05278), Deny Existence (05280), Anna Kaslow (05283), "I've had worse…" (05315), Blood-Rite (05317), Tommy Muldoon (06001), Bounty Contracts (06010), Tony's .38 Long Colt (06011), Patrice's Violin (06016), Astounding Revelation (06023), Easy Mark (06026), The Stars Are Right (06028), Hope (06031), Zeal (06032), Augur (06033), Kleptomania (06036), Gregory Gry (06162), Three Aces (06199), Burglary (06200), Leadership (06235), Old Book of Lore (06279), Nothing Left to Lose (06284), Joey "The Rat" Vigil (06326), Shining Trapezohedron (06329), Dexter Drake (07004), Rite of Sanctification (07019), Faustian Bargain (07028), Cryptic Grimoire (07191), Tristan Botley (07194), Harmony Restored (07230), Favor of the Moon (07271), Ariadne's Twine (07304), Norman Withers (08004), Monterey Jack (08007), Shrewd Dealings (08017), Geared Up (08019), On the Hunt (08028), Archive of Conduits (08033), Unearth the Ancients (08039), 21 or Bust (08048), Cheat the System (08050), Untimely Transaction (08051), The Red Clock (08053), The Red Clock (08058), Winds of Power (08063), Foresight (08064), Unscrupulous Loan (08113), Rod of Animalism (08128), Amina Zidane (09011), Motivational Speech (09028), Prepared for the Worst (09036), Ever Vigilant (09039), Alchemical Distillation (09040), Thieves' Kit (09064), Hit and Run (09066), "I'll take that!" (09067), Kicking the Hornet's Nest (09068), Stylish Coat (09071), Chuck Fergus (09072), Thieves' Kit (09075), Trigger Man (09076), Clean Sneak (09078), String of Curses (09088), Uncage the Soul (09095), End of the Road (09104), Salvage (09116), Wilson Richards (10001), Hold Up (10026), Chemistry Set (10040), Ravenous Myconid (10044), Bianca "Die Katz" (10062), British Bull Dog (10065), Scrimshaw Charm (10068), Bank Job (10069), False Surrender (10070), Grift (10071), "I'll Pay You Back!" (10072), British Bull Dog (10077), Dirty Deeds (10080), Aember Rot (10087), Ethereal Weaving (10103), The Key of Solomon (10104), Hunting Jacket (10121), Michael McGlen (11011), Primed for Action (11023), Quick Shot (11031), Cosmic Revelation (11041), Antikythera (11049), "Watch this!" (11061), "You've had worse..." (11063), Eldritch Brand (11080), Lawrence Carlisle (11083), Ample Supplies (11089), Short Rest (11096), Walter Fitzpatrick (11104), Nose to the Grindstone (11111), Motivational Speech (11116), Memories of Another Life (11125), André Patel (60351), Fame (60358), Marcus Sengstacke (60362), Out the Door (60370), "Watch this!" (60371), Out the Door (60373), Marcus Sengstacke (60375), The Red Clock (60384), Private Practice (60257), Offering Bowl (60456), Favor of Baalshandor (60463), Mirror Form (60465), Spiritual Charm (60466), Ceremonial Robes (60470), Jim Culver (60479), Pocketknife (60559), Hidden Shelter (60565), Tommy Muldoon (60151), Bounty (60161), Custom Grip (60162), Joe Diamond (12004), Detective's Intuition (12005), Dexter Drake (12010), "For my next trick..." (12011), Logan Hastings (12018), Dorothy Simmons (12030), Sticky Fingers (12048), Thieves' Kit (12049), Paint the Town Red (12051), Prestidigitation (12052), Sticky Fingers (12054), Decisive Strike (12055), Another Day, Another Dollar (12056), Emergency Cache (12089), Hot Streak (50006), Strange Solution (51004), Archaic Glyphs (52004), Alchemical Transmutation (52007), Decorated Skull (53005), On Your Own (53010), The Star • XVII (54001), The World • XXI (54003), Knight of Swords (54005), The Hierophant • V (54007), Nine of Rods (54009), The Fool • 0 (54011), Moon Pendant (54012)
c-efficient-clue (54): Deduction (01539), Rite of Seeking (01689), Rite of Seeking (02028), Deduction (02150), Rite of Seeking (02233), Deciphered Reality (02303), Archaic Glyphs (03192), Newspaper (03313), Ancient Stone (04022), Winging It (04272), Deduction (60219), Pilfer (60315), Pilfer (60328), Clairvoyance (60408), Clairvoyance (60426), Clairvoyance (60431), Fingerprint Kit (05024), Fortuitous Discovery (06034), Followed (06114), Read the Signs (06117), Sharp Vision (06204), Trish Scarborough (07003), Eye of Chaos (07118), Mariner's Compass (07121), Eye of Chaos (07227), Divination (08103), Ice Pick (08107), Fingerprint Kit (09057), Shed a Light (09108), Old Keyring (09117), Guided by Faith (10025), Chemistry Set (10040), Microscope (10042), Prismatic Spectacles (10056), Microscope (10058), Read the Signs (10101), Mariner's Compass (10122), Eyes of the Dreamer (11067), Nautical Charts (11084), Unconventional Method (11087), Dreamer's Chronicle (60255), Deduction (60267), Deduction (60275), Scroll of the Pharaohs (60281), Commune with the Cosmos (60282), Second Sight (60460), Second Sight (60481), Glassing (60563), Stakeout (60179), Fingerprint Kit (12031), Deduction (12039), Second Sight (12062), Augur of Elokoss (12070), Rite of Seeking (51007)
c-efficient-damage (235): Roland's .38 Special (01506), .45 Automatic (01516), Beat Cop (01518), Machete (01520), Guard Dog (01521), Vicious Blow (01525), Beat Cop (01528), Switchblade (01544), .41 Derringer (01547), Backstab (01551), Sneak Attack (01552), Shrivelling (01560), Baseball Bat (01574), Aquinnah (01582), Knife (01586), .41 Derringer (01688), Aquinnah (01691), Zoey's Cross (02006), Jenny's Twin .45s (02010), Duke (02014), Fire Axe (02032), Kukri (02036), Brother Xavier (02106), "I've got a plan!" (02107), Song of the Dead (02112), Oops! (02113), Flare (02115), Switchblade (02152), Hypnotic Gaze (02153), Shrivelling (02154), Springfield M1903 (02226), Strange Solution (02263), Vicious Blow (02299), Lightning Gun (02301), Chicago Typewriter (02304), Shrivelling (02306), Aquinnah (02308), .32 Colt (03020), Heroic Rescue (03106), Ambush (03148), Mano a Mano (03229), .45 Automatic (03190), Knuckleduster (03110), .41 Derringer (03234), Sneak Attack (03152), Lupara (03309), Lantern (03036), Finn's Trusty .38 (04011), Survival Knife (04017), Marksmanship (04104), Custom Ammunition (04193), Blood Eclipse (04266), Ancient Stone (04230), Colt Vest Pocket (04268), Coup de Grâce (04269), Hatchet Man (04155), Shards of the Void (04310), Improvised Weapon (04033), Old Hunting Rifle (04273), Ornate Bow (04204), Timeworn Brand (04276), Nathaniel Cho (60101), Monster Slayer (60116), One-Two Punch (60117), Vicious Blow (60119), Counterpunch (60122), Mano a Mano (60125), Taunt (60130), One-Two Punch (60132), Disc of Itzamna (60207), Occult Invocation (60217), "I've got a plan!" (60225), The Necronomicon (60233), Mauser C96 (60306), Switchblade (60307), Mauser C96 (60321), Backstab (60329), Beretta M1918 (60331), Azure Flame (60407), Hypnotic Gaze (60414), Hypnotic Gaze (60423), Azure Flame (60425), Azure Flame (60430), .18 Derringer (60505), Oops! (60518), .18 Derringer (60522), Chainsaw (60529), Detective's Colt 1911s (05009), Act of Desperation (05037), Meat Cleaver (05114), .45 Thompson (05115), Enchanted Blade (05118), Alice Luxley (05151), .45 Thompson (05186), .45 Thompson (05187), Tennessee Sour Mash (05190), Enchanted Blade (05192), Enchanted Blade (05193), Agency Backup (05274), Small Favor (05277), Blood-Rite (05317), Becky (06006), Tony's .38 Long Colt (06011), The Hungering Blade (06018), Bloodlust (06019), Brute Force (06166), .35 Winchester (06195), Spectral Razor (06201), Heroic Rescue (06234), Delilah O'Rourke (06281), Sea Change Harpoon (07014), Blessed Blade (07018), .25 Automatic (07025), Armageddon (07117), Radiant Smite (07153), Abyssal Tome (07159), Manipulate Destiny (07162), Ríastrad (07193), Armageddon (07226), Enchant Weapon (07261), Nephthys (07262), Flute of the Outer Gods (07268), Holy Spear (07302), .25 Automatic (07305), Daniela Reyes (08001), Mechanic's Wrench (08002), Trusty Bullwhip (08008), Toe to Toe (08020), Gang Up (08022), Sweeping Kick (08023), Butterfly Swords (08025), Dodge (08026), Fang of Tyr'thrha (08029), Butterfly Swords (08030), Dragon Pole (08060), Fire Extinguisher (08080), Michael Leigh (08086), Cyclopean Hammer (08093), Sledgehammer (08094), Sledgehammer (08096), Ice Pick (08107), Enchanted Bow (08118), Call for Backup (08129), Bonesaw (09005), Runic Axe (09022), Guard Dog (09034), Clean Sneak (09078), Ceremonial Sickle (09082), Explosive Ward (09087), Ceremonial Sickle (09096), Baseball Bat (09113), Katana (10021), Strong-Armed (10031), Blessed Blade (10034), Blade of Yoth (10036), Flurry of Blows (10037), Dr. Charles West III (10041), British Bull Dog (10065), Vamp (10074), British Bull Dog (10077), Vamp (10081), Spectral Razor (10102), Servant of Brass (10107), Pitchfork (10110), Long Shot (10116), Hatchet (10117), Fire Axe (10120), Dawn Star (10131), Remington Model 1858 (11022), Hunter's Mark (11026), Alice Luxley (11027), Quick Shot (11031), Remington Model 1858 (11032), Oculus Mortuum (11038), Intimidation (11056), Breath of the Sleeper (11066), Whispers of Doom (11072), Sword Cane (11074), Hand Hook (11082), Improvised Weapon (11092), Name Your Price (11105), Blood of K'n-yan (11114), Storm Ruler (11115), Mauser Tankgewehr M1918 (11119), On Their Heels (11120), A Sudden Fall (60367), A Sudden Fall (60378), Caustic Reaction (60261), Insidious Truths (60266), Caustic Reaction (60273), Scroll of the Pharaohs (60280), Cosmic Flame (60459), Consume Life (60462), Retribution (60473), Dread Curse of Azathoth (60474), Blood Curse (60477), Bend Blood (60483), Lie in Wait (60566), Winchester Model 52 (60575), Guerrilla Tactics (60576), Rope Trap (60578), Longbow (60580), Becky (60152), M1911 (60155), Service Revolver (60158), Vicious Blow (60169), M1911 (60171), Vicious Blow (60176), Thompson Submachine Gun (60182), Daniela Reyes (12001), Daniela's Wrench (12002), Isabelle's Twin .45s (12014), Bodyguard (12016), M1911 (12019), Machete (12020), Vicious Blow (12025), Counterattack (12026), Bodyguard (12027), Sledgehammer (12028), Winchester Model 12 (12029), M1903 Hammerless (12045), Decisive Strike (12055), Cloak of Resonance (12058), Cosmic Flame (12059), Cosmic Flame (12071), Meat Cleaver (12077), Meat Cleaver (12085), Broken Bottle (12086), Blackjack (51002), Oops! (51009), .32 Colt (52001), Lantern (52009), Blood Eclipse (53001), Survival Knife (53002), Colt Vest Pocket (53006)
c-encounter-deck (38): Scrying (01561), Drawn to the Flame (01564), Close Call (01583), Scrying (01690), Delve Too Deep (02111), Alyssa Graham (02232), Dr. William T. Maleson (02302), On the Hunt (03263), Scrying (03236), Persuasion (04105), Parallel Fates (60415), Dark Insight (05014), Scroll of Secrets (05116), Scroll of Secrets (05188), Scroll of Secrets (05189), Stargazing (06027), First Watch (06110), Otherworld Codex (06158), Purifying Corruption (07273), Shrine of the Moirai (07310), On the Hunt (08028), Counterespionage (08049), Parallel Fates (08066), Dr. William T. Maleson (09054), Kicking the Hornet's Nest (09068), Nature of the Beast (09111), Aetheric Current (10007), Antediluvian Hymn (10093), Gloria Goldberg (11014), "Where's the party?" (11053), Intimidation (11056), Deliverance (11079), Unaware (60356), Hypnotize (60274), Scroll of the Pharaohs (60279), Stalk Prey (60567), Paint the Town Red (12051), Nine of Rods (54009)
c-enemy-field-control (2): Barricade (01538), Barricade (50004)
c-enemy-mitigation (35): On the Lam (01510), Disc of Itzamna (01541), Close Call (01583), "I'll see you in hell!" (03189), Stealth (03028), Waylay (03237), Snare Trap (03199), Persuasion (04105), Dumb Luck (04034), Dumb Luck (60514), Dumb Luck (60525), Otherworld Codex (06158), Ethereal Form (06164), In the Shadows (07010), Scout Ahead (08047), Fire Extinguisher (08080), Kymani Jones (09008), Bolas (09025), Power Word (09081), String of Curses (09088), Exploit Weakness (09105), Aetheric Current (10006), Aetheric Current (10007), Ravenous Myconid (10060), Abyssal Rot (10086), Ethereal Form (10100), Stall for Time (10114), "Where's the party?" (11053), Intimidation (11056), Whispers of Doom (11072), Cowl of Sekhmet (11109), Dimensional Vortex (11124), Hypnotize (60274), Bend Blood (60483), Stealth (52005)
c-enemy-nerf (31): Barricade (01538), Mind Wipe (01568), Bind Monster (02031), Snare Trap (03199), Handcuffs (04265), Slip Away (04232), Slip Away (60314), Slip Away (60324), Banish (05113), Under Surveillance (07157), Fend Off (08082), Bolas (09025), Handcuffs (09035), Disguise (09062), Power Word (09081), Aetheric Current (10006), Transmogrify (10050), Confound (10057), Abyssal Rot (10086), Virescent Rot (10090), Stall for Time (10114), "Where's the party?" (11053), Anchor Chain (11081), "Catch!" (11086), Dimensional Vortex (11124), Quick Exit (60366), Quick Exit (60377), Restrained (60165), Slippery (12080), Barricade (50004), Mind Wipe (50008)
c-engagement (31): Machete (01520), Zoey's Cross (02006), Taunt (02017), Taunt (02019), Heroic Rescue (03106), On the Hunt (03263), "Get over here!" (60114), "Get over here!" (60123), Taunt (60130), "I'm done runnin'!" (05016), Spectral Razor (06201), Heroic Rescue (06234), Righteous Hunt (07109), "Get behind me!" (08021), On the Hunt (08028), Kymani Jones (09008), Guard Dog (09034), Kicking the Hornet's Nest (09068), Stouthearted (10017), Bewitching (10079), Spectral Razor (10102), "Where's the party?" (11053), Obscure (11060), Dakota Garofalo (11110), The Grapevine (60359), The Grapevine (60374), Spiritual Charm (60466), Hunter's Instinct (60574), Daniela's Wrench (12002), Machete (12020), Hunter's Instinct (12074)
c-evade-payoff (20): Pickpocketing (01546), Close Call (01583), Pickpocketing (03195), Trench Coat (04203), Rita Young (05005), "I'm done runnin'!" (05016), Belly of the Beast (05160), .25 Automatic (07305), "I'll take that!" (09067), Dirty Fighting (09073), Microscope (10042), Transmogrify (10050), Microscope (10058), Lucius Galloway (11004), Dial of Ancients (11035), Right Under Their Noses (60368), Right Under Their Noses (60382), Covert Ops (12008), Sticky Fingers (12048), Sticky Fingers (12054)
c-evasion-package (69): Pickpocketing (01546), Stray Cat (01576), Cunning Distraction (01578), Close Call (01583), Fire Extinguisher (02114), Survival Instinct (02235), Anatomical Diagrams (03108), Archaic Glyphs (03193), Stealth (03028), Cheap Shot (03194), Pickpocketing (03195), Persuasion (04105), Impromptu Barrier (04312), Stunning Blow (04112), Disc of Itzamna (60207), Cheap Shot (60312), Cheap Shot (60323), Rita Young (05005), "I'm done runnin'!" (05016), Wither (05157), Belly of the Beast (05160), Tennessee Sour Mash (05191), Decoy (05234), Wither (05321), Pendant of the Queen (06022), Expeditious Retreat (06246), Trish Scarborough (07003), Silas's Net (07015), Breaking and Entering (07114), Under Surveillance (07157), .25 Automatic (07305), Daniela Reyes (08001), Trusty Bullwhip (08008), Sweeping Kick (08023), Archive of Conduits (08043), Fire Extinguisher (08080), Fend Off (08082), Bolas (09025), Existential Riddle (09052), "I'll take that!" (09067), Dirty Fighting (09073), Breaking and Entering (09074), String of Curses (09088), Makeshift Trap (09100), Exploit Weakness (09105), Alessandra Zorzi (10009), Microscope (10042), "Throw the Book at Them!" (10049), Transmogrify (10050), Confound (10057), Microscope (10058), Vamp (10074), Lightfooted (10076), Vamp (10081), Putrescent Rot (10088), Elaborate Distraction (10112), Lucius Galloway (11004), Dial of Ancients (11035), Polished Cane (60363), Right Under Their Noses (60368), Right Under Their Noses (60382), Winchester Model 52 (60575), "Make 'em sing" (60160), Restrained (60165), Covert Ops (12008), Sticky Fingers (12048), Breaking and Entering (12050), Sticky Fingers (12054), Stealth (52005)
c-exhausts (355): Beat Cop (01528), Old Book of Lore (01531), Encyclopedia (01542), Burglary (01545), Pickpocketing (01546), Cat Burglar (01555), Forbidden Knowledge (01558), Scrying (01561), Arcane Initiate (01563), Book of Shadows (01570), Scavenging (01573), Rabbit's Foot (01575), Aquinnah (01582), Old Book of Lore (01686), Lockpicks (01687), Scrying (01690), Aquinnah (01691), Zoey's Cross (02006), Jim's Trumpet (02012), Duke (02014), Pathfinder (02108), Smoking Pipe (02116), Painkillers (02117), Alyssa Graham (02232), Jewel of Aureolus (02269), Dr. William T. Maleson (02302), Aquinnah (02308), Try and Try Again (02309), Analytical Mind (03010), Spirit-Speaker (03014), Armor of Ardennes (03305), Fieldwork (03024), Charles Ross, Esq. (03149), Shortcut (03232), Stealth (03028), Dario El-Amin (03151), Lockpicks (03031), Pickpocketing (03195), Suggestion (03268), Alchemical Transmutation (03032), David Renfield (03112), Spirit Athame (03035), Book of Shadows (03154), Scrying (03236), Arcane Initiate (03271), Madame Labranche (03198), Jake Williams (04008), Survival Knife (04017), Venturer (04018), Kerosene (04304), Well Prepared (04151), Tooth of Eztli (04023), Quick Study (04154), Otherworldly Compass (04194), Feed the Mind (04267), Lucky Cigarette Case (04107), Fence (04108), High Roller (04156), Lola Santiago (04196), Olive McBride (04197), Recall the Future (04158), Yaotl (04035), Try and Try Again (04159), On Your Own (04236), Thermos (04274), Timeworn Brand (04276), Boxing Gloves (60105), Flesh Ward (60106), Grete Wagner (60107), Relentless (60109), Safeguard (60110), Boxing Gloves (60127), Grete Wagner (60128), Vault of Knowledge (60202), Encyclopedia (60208), Feed the Mind (60209), Forbidden Tome (60210), Whitton Greene (60213), Whitton Greene (60223), Forbidden Tome (60229), Forbidden Tome (60230), Farsight (60231), Lockpicks (60305), Mauser C96 (60306), Lucky Cigarette Case (60308), Lonnie Ritter (60309), Mauser C96 (60321), Lucky Cigarette Case (60326), Sharpshooter (60327), Beretta M1918 (60331), Chuck Fergus (60332), Arbiter of Fates (60402), Scrying Mirror (60406), Crystal Pendulum (60411), Robes of Endless Night (60412), Robes of Endless Night (60422), Grimm's Fairy Tales (60506), Granny Orne (60508), Rabbit's Foot (60510), Granny Orne (60527), Hypnotic Therapy (05007), Baron Samedi (05019), Fingerprint Kit (05024), Well Connected (05028), Track Shoes (05036), Scroll of Secrets (05116), Tennessee Sour Mash (05117), Grisly Totem (05119), Alice Luxley (05151), Mr. "Rook" (05153), Henry Wan (05155), Drawing Thin (05159), Scroll of Secrets (05188), Scroll of Secrets (05189), Tennessee Sour Mash (05190), Tennessee Sour Mash (05191), Grisly Totem (05194), Grisly Totem (05195), Telescopic Sight (05230), Esoteric Atlas (05232), Investments (05233), De Vermis Mysteriis (05235), Agency Backup (05274), Double, Double (05320), Gate Box (06013), Patrice's Violin (06016), Solemn Vow (06020), Pendant of the Queen (06022), Hope (06031), Zeal (06032), Augur (06033), Otherworld Codex (06158), Dream-Enhancing Serum (06159), Safeguard (06196), Burglary (06200), Haste (06239), Empower Self (06241), Empower Self (06242), Empower Self (06243), Twila Katherine Price (06244), Old Book of Lore (06279), Garrote Wire (06280), Delilah O'Rourke (06281), Summoned Hound (06282), Abigail Foreman (06324), Shining Trapezohedron (06329), Scavenging (06332), Blessed Blade (07018), Rite of Sanctification (07019), Cryptographic Cipher (07021), Sword Cane (07029), Token of Faith (07033), Sacred Covenant (07110), Eldritch Sophist (07111), Blasphemous Covenant (07113), False Covenant (07116), Paradoxical Covenant (07120), Mariner's Compass (07121), Ancient Covenant (07122), Abyssal Tome (07159), Blessing of Isis (07190), Curse of Aeons (07195), Holy Rosary (07220), Shield of Faith (07221), Eye of the Djinn (07225), Spirit of Humanity (07229), Enchant Weapon (07261), Nephthys (07262), Ikiaq (07267), Flute of the Outer Gods (07268), Favor of the Moon (07271), Favor of the Sun (07272), Ancestral Knowledge (07303), Ariadne's Twine (07304), Jacob Morrison (07309), Shrine of the Moirai (07310), Mechanic's Wrench (08002), Livre d'Eibon (08005), Trusty Bullwhip (08008), Butterfly Swords (08030), Archive of Conduits (08033), Hiking Boots (08035), Close the Circle (08062), Astronomical Atlas (08067), Michael Leigh (08086), Quickdraw Holster (08089), Nkosi Mabati (08091), Pocket Telescope (08097), Eon Chart (08098), Gené Beauregard (08099), Eon Chart (08100), Professor William Webb (08104), Ice Pick (08105), Professor William Webb (08106), Ice Pick (08107), Precious Memento (08114), Precious Memento (08115), Enchanted Bow (08118), Sled Dog (08127), Grappling Hook (09009), Darrell's Kodak (09016), Custom Modifications (09023), Field Agent (09033), Guard Dog (09034), Martyr's Vambrace (09037), Girish Kadakia (09038), Lab Coat (09050), Dr. William T. Maleson (09054), Press Pass (09055), Fingerprint Kit (09057), Damning Testimony (09059), Embezzled Treasure (09063), Stylish Coat (09071), Chuck Fergus (09072), Dirty Fighting (09073), Trigger Man (09076), Ceremonial Sickle (09082), Hallowed Chalice (09084), Onyx Pentacle (09085), Elle Rubash (09092), Sin-Eater (09094), Ceremonial Sickle (09096), Dowsing Rod (09097), Onyx Pentacle (09098), Pocket Multi Tool (09099), Idol of Xanatos (09102), Katja Eastbank (09114), Hyperphysical Shotcaster (09119), Tool Belt (09120), Ad Hoc (10002), Book of Living Myths (10013), Ancestral Token (10019), Katana (10021), Cleaning Kit (10033), Blessed Blade (10034), Evanescent Ascension (10039), Chemistry Set (10040), Dr. Charles West III (10041), Microscope (10042), Steady-Handed (10053), Fine Tuning (10054), Bianca "Die Katz" (10062), Fake Credentials (10066), Scrimshaw Charm (10068), Bewitching (10079), Rod of Carnamagos (10085), Olive McBride (10097), Rod of Carnamagos (10098), The Key of Solomon (10104), Matchbox (10108), Hunting Jacket (10121), Mariner's Compass (10122), Survival Technique (10123), Token of Faith (10126), Twilight Diadem (10134), The Book of War (11020), Crowbar (11021), Alice Luxley (11027), Bulwark (11028), Alton O'Connell (11033), Artistic Inspiration (11034), Mortar and Pestle (11037), Oculus Mortuum (11038), Misdirection (11043), Dial of Ancients (11046), Dial of Ancients (11048), Antikythera (11049), Luger P08 (11050), Robert Castaigne (11051), String Along (11052), Mob Connections (11059), Obscure (11060), Robert Castaigne (11062), Blood of Thoth (11065), Katarina Sojka (11069), Sword Cane (11074), Lost Arcana (11078), Anchor Chain (11081), Hand Hook (11082), Lawrence Carlisle (11083), Nautical Charts (11084), Ample Supplies (11089), Bound for the Horizon (11102), Walter Fitzpatrick (11104), Captivating Performance (11108), Cowl of Sekhmet (11109), Dakota Garofalo (11110), Nose to the Grindstone (11111), Storm Ruler (11115), Library Pass (11118), Mauser Tankgewehr M1918 (11119), On Their Heels (11120), Center Stage (60357), The Grapevine (60359), Extravagant Ring (60360), Lockpicks (60361), Lockpicks (60372), The Grapevine (60374), Well Connected (60381), Experimental Psychology (60252), Occult Records (60256), Private Practice (60257), Scroll of the Pharaohs (60259), Autopsy Report (60276), Grand-Mère's Charm (60452), Arcane Initiate (60455), Offering Bowl (60456), Sacrificial Doll (60458), Ritual Dagger (60475), Jim Culver (60479), Miguel's Knapsack (60552), Daniel Jameson (60555), Hunting Dog (60556), Loner (60557), Rabbit's Foot (60560), Decoy Trap (60562), Glassing (60563), Lie in Wait (60566), Extra Rations (60570), Canteen (60573), Hunter's Instinct (60574), Rope Trap (60578), Becky (60152), Police Dog (60156), Iron Sights (60163), Police Dog (60170), Detective Sherman (60177), Daniela's Wrench (12002), Covert Ops (12008), Isabelle's Twin .45s (12014), Logan Hastings (12018), Sledgehammer (12028), Dorothy Simmons (12030), Fingerprint Kit (12031), Mysterious Grimoire (12040), Lucky Cigarette Case (12044), Olivier Bishop (12046), Sticky Fingers (12048), Sticky Fingers (12054), Cloak of Resonance (12058), Jim Culver (12060), Lucky Charm (12061), Hunter's Instinct (12074), Rabbit's Foot (50010), Strange Solution (51004), Stealth (52005), Suggestion (52006), Alchemical Transmutation (52007), Survival Knife (53002), On Your Own (53010), The World • XXI (54003), Well Connected (54006), Sign Magick (54008), Nine of Rods (54009), The Fool • 0 (54011)
c-exile-package (15): Fire Extinguisher (02114), Flare (02115), Stroke of Luck (02271), A Test of Will (03156), Devil's Luck (03157), Cherished Keepsake (60520), Leather Coat (60521), A Test of Will (60523), The Council's Coffer (05196), Guiding Spirit (05236), Fortune or Fate (05237), Burn After Reading (08076), Fire Extinguisher (08080), Unscrupulous Loan (08113), Lifeline (09110)
c-extra-actions (49): Police Badge (01527), Leo De Luca (01548), Leo De Luca (01554), .41 Derringer (01688), Quick Thinking (02229), Ace in the Hole (02266), Guidance (03265), .41 Derringer (03234), Finn Edwards (04003), Father Mateo (04004), Borrowed Time (04308), Galvanize (60121), Stella Clark (60501), Marie Lambeau (05006), Ace of Rods (05040), Swift Reflexes (05156), Deny Existence (05280), Tony Morgan (06003), The Stars Are Right (06028), Haste (06239), Riot Whistle (07108), Eye of the Djinn (07225), Bob Jenkins (08016), The Red Clock (08053), The Black Fan (08057), The Red Clock (08058), Eon Chart (08100), Blur (08109), Blur (08111), Carson Sinclair (09001), Grappling Hook (09009), Guidance (09053), Press Pass (09055), Honed Instinct (09061), Astral Mirror (09091), End of the Road (09104), At a Crossroads (09109), Lifeline (09110), Alessandra Zorzi (10009), Kōhaku Narukami (10012), Bide Your Time (10129), Antikythera (11049), Blood of Thoth (11065), Captivating Performance (11108), André Patel (60351), The Black Fan (60379), The Red Clock (60384), Miguel de la Cruz (60551), Trish Scarborough (12007)
c-fail-by (16): "Look what I found!" (01579), Oops! (02113), Dumb Luck (04034), Crystal Pendulum (60411), Dumb Luck (60514), "Look what I found!" (60517), Oops! (60518), "Look what I found!" (60524), Dumb Luck (60525), Lab Coat (09050), Chemistry Set (10040), Esoteric Method (10055), Lethal Curiosity (60254), "Look what I found!" (12078), Rabbit's Foot (50010), Oops! (51009)
c-fail-forward (40): Rabbit's Foot (01575), "Look what I found!" (01579), Oops! (02113), Try and Try Again (02309), Dumb Luck (04034), Live and Learn (04200), Try and Try Again (04159), Crystal Pendulum (60411), Stella Clark (60501), Neither Rain nor Snow (60502), Atychiphobia (60504), Grimm's Fairy Tales (60506), Rabbit's Foot (60510), Dumb Luck (60514), Grit Your Teeth (60515), Live and Learn (60516), "Look what I found!" (60517), Oops! (60518), "Look what I found!" (60524), Dumb Luck (60525), Precious Memento (08114), Precious Memento (08115), Lab Coat (09050), Chemistry Set (10040), Esoteric Method (10055), British Bull Dog (10065), British Bull Dog (10077), Token of Faith (10126), Dial of Ancients (11046), Weight of the World (60355), Unaware (60356), Lethal Curiosity (60254), Daniel Jameson (60555), Old Compass (60558), Rabbit's Foot (60560), Overconfident (60154), "Look what I found!" (12078), Old Compass (12083), Rabbit's Foot (50010), Oops! (51009)
c-failure-prevention (9): Lucky! (01580), Lucky! (01584), Granny Orne (60508), Granny Orne (60527), Lucky! (60528), Jacob Morrison (07309), Lab Coat (09050), Evanescent Ascension (10039), Scrape By (12082)
c-getaway (23): Elusive (01550), Cat Burglar (01555), Survival Instinct (01581), Stealth (03028), Cheat Death (03310), Snare Trap (03199), Gate Box (06013), Detached from Reality (06014), Ethereal Form (06164), In the Shadows (07010), Archive of Conduits (08043), Predator or Prey (09107), Blackmail File (10064), Stir the Pot (10073), Stir the Pot (10083), Ethereal Form (10100), Pay Your Dues (60365), Trish Scarborough (12007), Through the Cracks (12037), Through the Cracks (12041), Out of Sight (12053), Out of Sight (12057), Stealth (52005)
c-heal-damage (64): First Aid (01519), Medical Texts (01535), First Aid (01683), Emergency Aid (02105), Painkillers (02117), Strange Solution (02262), Inspiring Presence (03228), First Aid (03230), Cheat Death (03310), Calvin Wright (04005), Second Wind (04149), Thermos (04274), Randall Cho (60102), Lonnie Ritter (60309), Stella Clark (60501), Deny Existence (05280), Soothing Melody (05314), Jessica Hyde (06118), Healing Words (06163), Wish Eater (06277), The Black Cat (06285), Spiritual Resolve (06323), Manipulate Destiny (07162), Spirit of Humanity (07229), Purifying Corruption (07273), Medical Texts (08038), Archive of Conduits (08044), Meditative Trance (08061), Healing Words (08068), Bandages (08073), Medical Student (08083), Precious Memento (08114), Precious Memento (08115), Earthly Serenity (08117), Earthly Serenity (08119), Call for Backup (08129), Vincent Lee (09004), Bonesaw (09005), Girish Kadakia (09038), Bizarre Diagnosis (09046), Surgical Kit (09056), Hallowed Chalice (09084), Fickle Fortune (09118), Hank Samson (10015), Second Wind (10032), Ravenous Myconid (10061), The Key of Solomon (10104), Inspiring Presence (11029), Short Rest (11096), True Awakening (11106), Sound Support (11112), Marie Lambeau (60451), Consume Life (60462), Infuse Life (60464), Cosmic Guidance (60468), Blood Ward (60472), Hidden Shelter (60565), Extra Rations (60570), Field Dressing (60571), Physical Fitness (60164), Physical Fitness (60174), Detective's Intuition (12005), Aleksey Saburov (12072), Bandages (12073)
c-heal-horror (82): First Aid (01519), Fearless (01567), First Aid (01683), Jim's Trumpet (02012), Liquid Courage (02024), Clarity of Mind (02030), Peter Sylvestre (02033), Peter Sylvestre (02035), Smoking Pipe (02116), "If it bleeds..." (02225), Fearless (02268), Moment of Respite (02273), Inspiring Presence (03228), First Aid (03230), Logical Reasoning (03191), Cheat Death (03310), St. Hubert's Key (03269), Calvin Wright (04005), Kerosene (04304), Ancient Stone (04231), Thermos (04274), Lonnie Ritter (60309), Liquid Courage (60320), Stella Clark (60501), Grimm's Fairy Tales (60506), Carolyn Fern (05001), Hypnotic Therapy (05007), Meat Cleaver (05114), Enchanted Blade (05192), Deny Existence (05280), Soothing Melody (05314), Wish Eater (06277), The Black Cat (06285), Spiritual Resolve (06323), Book of Psalms (07017), Spirit of Humanity (07229), Purifying Corruption (07273), Rite of Equilibrium (07308), Archive of Conduits (08044), Meditative Trance (08061), Medical Student (08083), Precious Memento (08114), Precious Memento (08115), Earthly Serenity (08117), Earthly Serenity (08119), Call for Backup (08129), Girish Kadakia (09038), Surgical Kit (09056), Hallowed Chalice (09084), Fickle Fortune (09118), Hank Samson (10015), Absolution (10024), Steady-Handed (10053), Ravenous Myconid (10061), The Key of Solomon (10104), Ready for Anything (11024), Inspiring Presence (11029), Forensic Kit (11036), Short Rest (11096), True Awakening (11106), Sound Support (11112), Carolyn Fern (60251), Experimental Psychology (60252), Occult Records (60256), Psychology Student (60258), Unflappable (60262), Psychoanalysis (60264), De-Escalate (60265), Unflappable (60271), Psychoanalysis (60278), Hidden Shelter (60565), Canteen (60573), Stakeout (60166), Stakeout (60179), Detective's Intuition (12005), Isabelle Barnes (12013), Fearless (12069), Aleksey Saburov (12072), Meat Cleaver (12077), Meat Cleaver (12085), Clarity of Mind (51008), Logical Reasoning (52003)
c-healing (108): First Aid (01519), Medical Texts (01535), Fearless (01567), First Aid (01683), Jim's Trumpet (02012), Liquid Courage (02024), Clarity of Mind (02030), Peter Sylvestre (02033), Peter Sylvestre (02035), Emergency Aid (02105), Smoking Pipe (02116), Painkillers (02117), "If it bleeds..." (02225), Strange Solution (02262), Fearless (02268), Moment of Respite (02273), Inspiring Presence (03228), First Aid (03230), Logical Reasoning (03191), Cheat Death (03310), St. Hubert's Key (03269), Calvin Wright (04005), Second Wind (04149), Kerosene (04304), Ancient Stone (04231), Thermos (04274), Randall Cho (60102), Lonnie Ritter (60309), Liquid Courage (60320), Stella Clark (60501), Grimm's Fairy Tales (60506), Carolyn Fern (05001), Hypnotic Therapy (05007), Meat Cleaver (05114), Enchanted Blade (05192), Deny Existence (05280), Soothing Melody (05314), Jessica Hyde (06118), Healing Words (06163), Wish Eater (06277), The Black Cat (06285), Spiritual Resolve (06323), Book of Psalms (07017), Manipulate Destiny (07162), Spirit of Humanity (07229), Purifying Corruption (07273), Rite of Equilibrium (07308), Medical Texts (08038), Archive of Conduits (08044), Meditative Trance (08061), Healing Words (08068), Bandages (08073), Medical Student (08083), Precious Memento (08114), Precious Memento (08115), Earthly Serenity (08117), Earthly Serenity (08119), Call for Backup (08129), Vincent Lee (09004), Bonesaw (09005), Girish Kadakia (09038), Bizarre Diagnosis (09046), Surgical Kit (09056), Hallowed Chalice (09084), Fickle Fortune (09118), Hank Samson (10015), Absolution (10024), Second Wind (10032), Steady-Handed (10053), Ravenous Myconid (10061), The Key of Solomon (10104), Ready for Anything (11024), Inspiring Presence (11029), Forensic Kit (11036), Short Rest (11096), True Awakening (11106), Sound Support (11112), Carolyn Fern (60251), Experimental Psychology (60252), Occult Records (60256), Psychology Student (60258), Unflappable (60262), Psychoanalysis (60264), De-Escalate (60265), Unflappable (60271), Psychoanalysis (60278), Marie Lambeau (60451), Consume Life (60462), Infuse Life (60464), Cosmic Guidance (60468), Blood Ward (60472), Hidden Shelter (60565), Extra Rations (60570), Field Dressing (60571), Canteen (60573), Physical Fitness (60164), Stakeout (60166), Physical Fitness (60174), Stakeout (60179), Detective's Intuition (12005), Isabelle Barnes (12013), Fearless (12069), Aleksey Saburov (12072), Bandages (12073), Meat Cleaver (12077), Meat Cleaver (12085), Clarity of Mind (51008), Logical Reasoning (52003)
c-health-safety (167): Beat Cop (01518), First Aid (01519), Guard Dog (01521), Beat Cop (01528), Medical Texts (01535), Leo De Luca (01548), Leo De Luca (01554), Cat Burglar (01555), Leather Coat (01572), Bulletproof Vest (01594), First Aid (01683), Duke (02014), Hired Muscle (02027), Emergency Aid (02105), Brother Xavier (02106), Painkillers (02117), Strange Solution (02262), Joey "The Rat" Vigil (02265), Dr. William T. Maleson (02302), The Red-Gloved Man (02310), True Grit (03021), Inspiring Presence (03228), First Aid (03230), Armor of Ardennes (03305), Dario El-Amin (03151), Cheat Death (03310), David Renfield (03112), Madame Labranche (03198), Mitch Brown (04006), Jake Williams (04008), Calvin Wright (04005), Until the End of Time (04015), Venturer (04018), Second Wind (04149), Treasure Hunter (04025), Lola Santiago (04196), Yaotl (04035), Trench Coat (04203), Thermos (04274), Randall Cho (60102), Grete Wagner (60107), Grete Wagner (60128), Whitton Greene (60213), Whitton Greene (60223), Lonnie Ritter (60309), Leather Jacket (60310), Chuck Fergus (60332), Robes of Endless Night (60412), Robes of Endless Night (60422), Stella Clark (60501), Leather Coat (60521), Alice Luxley (05151), Mr. "Rook" (05153), Agency Backup (05274), Dayana Esperence (05279), Deny Existence (05280), Soothing Melody (05314), Miss Doyle (06030), Jessica Hyde (06118), Tetsuo Mori (06155), Healing Words (06163), Wish Eater (06277), Delilah O'Rourke (06281), Summoned Hound (06282), The Black Cat (06285), Spiritual Resolve (06323), Joey "The Rat" Vigil (06326), Guardian Angel (07006), Priest of Two Faiths (07156), Manipulate Destiny (07162), Tristan Botley (07194), Spirit of Humanity (07229), Nephthys (07262), Ikiaq (07267), Purifying Corruption (07273), Jacob Morrison (07309), Combat Training (08027), Jeremiah Kirby (08032), Medical Texts (08038), Archive of Conduits (08044), Moxie (08056), Meditative Trance (08061), Healing Words (08068), Grounded (08069), Bandages (08073), Medical Student (08083), Michael Leigh (08086), Nkosi Mabati (08091), Protective Gear (08095), Gené Beauregard (08099), Precious Memento (08114), Precious Memento (08115), Earthly Serenity (08117), Earthly Serenity (08119), Heavy Furs (08126), Sled Dog (08127), Call for Backup (08129), Vincent Lee (09004), Bonesaw (09005), Wounded Bystander (09007), Bonnie Walsh (09019), Hunter's Armor (09021), Obsidian Bracelet (09024), Field Agent (09033), Guard Dog (09034), Martyr's Vambrace (09037), Girish Kadakia (09038), Bizarre Diagnosis (09046), Dr. William T. Maleson (09054), Surgical Kit (09056), Chuck Fergus (09072), Trigger Man (09076), Hallowed Chalice (09084), Improvised Shield (09103), Katja Eastbank (09114), Fickle Fortune (09118), Hank Samson (10015), Second Wind (10032), Gabriel Carillo (10052), Ravenous Myconid (10061), Bianca "Die Katz" (10062), The Key of Solomon (10104), Servant of Brass (10107), "Devil" (10119), Hunting Jacket (10121), Alice Luxley (11027), Inspiring Presence (11029), Alton O'Connell (11033), Robert Castaigne (11051), Robert Castaigne (11062), Eye of Ghatanothoa (11073), Short Rest (11096), Walter Fitzpatrick (11104), True Awakening (11106), Dakota Garofalo (11110), Sound Support (11112), Trench Armor (11113), Archibald MacVeigh (11117), Marie Lambeau (60451), Grand-Mère's Charm (60452), Bloodstone (60457), Consume Life (60462), Infuse Life (60464), Cosmic Guidance (60468), Blood Ward (60472), Jim Culver (60479), Miguel's Knapsack (60552), Daniel Jameson (60555), Hidden Shelter (60565), Extra Rations (60570), Field Dressing (60571), Rookie Cop (60157), Protective Vest (60159), Physical Fitness (60164), Physical Fitness (60174), Detective Sherman (60177), Protective Vest (60181), Detective's Intuition (12005), Bodyguard (12016), Logan Hastings (12018), Resilience (12021), Bodyguard (12027), Olivier Bishop (12046), Jim Culver (12060), Aleksey Saburov (12072), Bandages (12073), Jumpsuit (12075)
c-intellect-boost (198): Magnifying Glass (01530), Dr. Milan Christopher (01533), Hyperawareness (01534), Magnifying Glass (01540), Encyclopedia (01542), Arcane Studies (01562), Lucky! (01580), Lucky! (01584), Ritual Candles (02029), Newspaper (02155), Keen Eye (02185), Higher Education (02187), Streetwise (02189), Alyssa Graham (02232), Dark Horse (02234), Sophie (03009), "Let me handle this!" (03022), Fieldwork (03024), Scientific Theory (03109), Dario El-Amin (03151), Daring Maneuver (03030), Narrow Escape (03267), St. Hubert's Key (03269), Spirit Athame (03035), Grounded (03113), Plucky (03115), Newspaper (03313), Key of Ys (03315), Calvin Wright (04005), Intrepid (04192), Reliable (04020), Well Prepared (04151), Quick Study (04154), Treasure Hunter (04025), High Roller (04156), Lola Santiago (04196), Recall the Future (04158), Crystalline Elder Sign (04235), Live and Learn (04200), Yaotl (04035), Cornered (04160), Hemispheric Map (04275), Grete Wagner (60128), Celaeno Fragments (60206), Encyclopedia (60208), Higher Education (60211), Whitton Greene (60213), Occult Invocation (60217), Whitton Greene (60223), "I've got a plan!" (60225), The Necronomicon (60233), Streetwise (60311), Daring Maneuver (60313), Daring Maneuver (60322), Chuck Fergus (60332), Ritual Candles (60405), Arcane Studies (60428), Grit Your Teeth (60515), Live and Learn (60516), Granny Orne (60527), Lucky! (60528), Fingerprint Kit (05024), Death • XIII (05027), Ace of Rods (05040), Alice Luxley (05151), Hawk-Eye Folding Camera (05154), Guiding Spirit (05236), Fortuitous Discovery (06034), Followed (06114), Empower Self (06243), Showmanship (07012), Mariner's Compass (07121), Keen Eye (07152), Radiant Smite (07153), Abyssal Tome (07159), Tristan Botley (07194), The Stygian Eye (07263), Hyperawareness (07264), Geas (07265), Ikiaq (07267), Jacob Morrison (07309), Jeremiah Kirby (08032), Scientific Theory (08040), Prophesiae Profana (08045), The Red Clock (08053), The Black Fan (08057), The Red Clock (08058), Grounded (08069), Jury-Rig (08074), Bangle of Jinxes (08075), Plucky (08081), Michael Leigh (08086), Brand of Cthugha (08090), Brand of Cthugha (08092), Gené Beauregard (08099), Divination (08101), Divination (08103), Ice Pick (08105), Ice Pick (08107), Blur (08109), Blur (08111), Enchanted Bow (08118), Prophetic (08120), Sleuth (08121), Bruiser (08122), Crafty (08123), Antiquary (08124), Charlie Kane (09018), One in the Chamber (09029), Field Agent (09033), Martyr's Vambrace (09037), Girish Kadakia (09038), Grim Memoir (09044), Guidance (09053), Fingerprint Kit (09057), Chuck Fergus (09072), Dirty Fighting (09073), Thieves' Kit (09075), Ceremonial Sickle (09082), Dowsing Rod (09083), Onyx Pentacle (09085), Elle Rubash (09092), Ceremonial Sickle (09096), Dowsing Rod (09097), Onyx Pentacle (09098), Pocket Multi Tool (09099), Making Preparations (09106), Soul Sanctification (09123), Wilson Richards (10001), Cleaning Kit (10033), Eyes of Valusia (10035), Blade of Yoth (10036), Microscope (10042), Mouse Mask (10043), Gabriel Carillo (10052), Prismatic Spectacles (10056), Microscope (10058), Fox Mask (10067), British Bull Dog (10077), Ethereal Weaving (10103), Mariner's Compass (10122), Survival Technique (10123), Dark Horse (10127), Book of Verse (11005), Alice Luxley (11027), Artistic Inspiration (11034), Forensic Kit (11036), String Along (11052), Sword Cane (11074), Lawrence Carlisle (11083), Nautical Charts (11084), Unconventional Method (11087), Good Weather (11091), Forbidden Sutra (11103), Walter Fitzpatrick (11104), Nose to the Grindstone (11111), Blood of K'n-yan (11114), Archibald MacVeigh (11117), Center Stage (60357), Extravagant Ring (60360), Clean Sweep (60364), The Black Fan (60379), Silver Tongue (60380), The Red Clock (60384), Experimental Psychology (60252), Caustic Reaction (60261), Magnifying Glass (60270), Caustic Reaction (60273), Hypnotize (60274), Autopsy Report (60276), Sharp Rhetoric (60277), Scroll of the Pharaohs (60280), Scroll of the Pharaohs (60281), Commune with the Cosmos (60282), Daniel Jameson (60555), Pocketknife (60559), Decoy Trap (60562), Glassing (60563), Guerrilla Tactics (60564), Lie in Wait (60566), Guerrilla Tactics (60576), Police Dog (60156), Iron Sights (60163), Stakeout (60166), Police Dog (60170), Extended Barrel (60172), On the Beat (60173), Stakeout (60179), Dorothy Simmons (12030), Fingerprint Kit (12031), Local Map (12033), Magnifying Glass (12034), Sharp Rhetoric (12035), Silver Tongue (12047), Hand-Crank Flashlight (12088), Hyperawareness (50003), Arcane Studies (50007), Knight of Swords (54005)
c-into-play-cheat (94): Old Book of Lore (01686), Flare (02115), Joey "The Rat" Vigil (02265), A Chance Encounter (02270), William Yorick (03005), Ever Vigilant (03023), Stick to the Plan (03264), Eidetic Memory (03306), Sleight of Hand (03029), Uncage the Soul (03033), A Chance Encounter (03238), Calling in Favors (03158), Leo Anderson (04001), Dr. Elli Horowitz (04021), Unearth the Ancients (04024), Improvised Weapon (04033), Winging It (04272), Impromptu Barrier (04312), Backpack (04037), Randall Cho (60102), Cryptic Writings (60215), Library Docent (60220), Cryptic Writings (60224), Farsight (60231), Joe Diamond (05002), Twilight Blade (05013), Ace of Swords (05023), Death • XIII (05027), The Moon • XVIII (05031), Four of Cups (05035), Five of Pentacles (05039), Ace of Rods (05040), The Council's Coffer (05196), De Vermis Mysteriis (05235), Dayana Esperence (05279), Anna Kaslow (05283), "You owe me one!" (05319), Tony's .38 Long Colt (06011), Hope (06031), Zeal (06032), Augur (06033), Old Book of Lore (06279), Joey "The Rat" Vigil (06326), Scavenging (06332), Dexter Drake (07004), Norman Withers (08004), Bob Jenkins (08016), Geared Up (08019), Unearth the Ancients (08039), Untimely Transaction (08051), Black Market (08055), Winds of Power (08063), Foresight (08064), Motivational Speech (09028), Prepared for the Worst (09036), Ever Vigilant (09039), Hit and Run (09066), "I'll take that!" (09067), Trigger Man (09076), Uncage the Soul (09095), Improvised Shield (09103), Salvage (09116), Hold Up (10026), British Bull Dog (10065), False Surrender (10070), British Bull Dog (10077), Dirty Deeds (10080), Eldritch Tongue (10128), Agatha Crane (11007), Agatha Crane (11008), Primed for Action (11023), Quick Shot (11031), Cosmic Revelation (11041), Eldritch Brand (11080), Profane Idol (11085), Improvised Weapon (11092), Short Rest (11096), Motivational Speech (11116), Favor of Baalshandor (60463), Mirror Form (60465), Tommy Muldoon (60151), Custom Grip (60162), Dexter Drake (12010), "For my next trick..." (12011), Prestidigitation (12052), Archaic Glyphs (52004), Backpack (53011), The Star • XVII (54001), The World • XXI (54003), Knight of Swords (54005), The Hierophant • V (54007), Nine of Rods (54009), The Fool • 0 (54011), Moon Pendant (54012)
c-investigate (12): Dr. Milan Christopher (01533), Scavenging (01573), Vault of Knowledge (60202), Scavenging (06332), Archive of Conduits (08033), Michael Leigh (08086), Professor William Webb (08104), Professor William Webb (08106), "I'll take that!" (09067), Dr. Charles West III (10041), Joe Diamond (12004), Dorothy Simmons (12030)
c-keyword-suppression (13): Mind Wipe (01568), .45 Automatic (03190), Marksmanship (04104), Telescopic Sight (05230), Enchanted Bow (08118), Dirty Fighting (09073), Ofuda (10022), British Bull Dog (10077), Longbow (60580), Becky (60152), Adapt and Overcome (60167), M1911 (60171), Mind Wipe (50008)
c-mobility (82): Elusive (01550), Cat Burglar (01555), Survival Instinct (01581), Duke (02014), Shortcut (02022), Think on Your Feet (02025), Pathfinder (02108), Survival Instinct (02235), Shortcut (03232), Cheat Death (03310), Astral Travel (03034), Ursula Downs (04002), Mists of R'lyeh (04029), Mists of R'lyeh (04271), Safeguard (60110), Esoteric Atlas (60222), Forbidden Tome (60230), Nimble (60317), Astral Travel (60413), Rita Young (05005), Track Shoes (05036), Esoteric Atlas (05232), Bait and Switch (05282), Gate Box (06013), Detached from Reality (06014), Pendant of the Queen (06022), Open Gate (06029), Safeguard (06196), Heroic Rescue (06234), Righteous Hunt (07109), Shroud of Shadows (07119), The Truth Beckons (07154), Shroud of Shadows (07228), Fang of Tyr'thrha (08029), Hiking Boots (08035), Join the Caravan (08036), Archive of Conduits (08041), Archive of Conduits (08042), Archive of Conduits (08043), Prophesiae Profana (08045), Scout Ahead (08047), The Red Clock (08053), The Red Clock (08058), On the Trail (08084), On the Trail (08085), Ethereal Slip (08108), Ethereal Slip (08110), Sled Dog (08127), Call for Backup (08129), Dowsing Rod (09083), Dowsing Rod (09097), Predator or Prey (09107), Task Force (10027), Stir the Pot (10073), Stir the Pot (10083), Misdirection (11043), Doppelgänger (11058), Bound for the Horizon (11102), Dakota Garofalo (11110), The Grapevine (60359), Clean Sweep (60364), The Grapevine (60374), Clean Sweep (60376), The Red Clock (60384), Shadowmeld (60461), Shadowmeld (60482), Hunting Dog (60556), Loner (60557), Decoy Trap (60562), Stalk Prey (60567), Physical Fitness (60164), Trish Scarborough (12007), Covert Ops (12008), Local Map (12033), Through the Cracks (12037), Through the Cracks (12041), Olivier Bishop (12046), Out of Sight (12053), Out of Sight (12057), Think on Your Feet (51006), Ancient Stone (53004), Mists of R'lyeh (53007)
c-multi-enemy (44): Dynamite Blast (01524), Elusive (01550), Cat Burglar (01555), Cunning Distraction (01578), Survival Instinct (01581), Taunt (02017), Taunt (02019), Fire Extinguisher (02114), Survival Instinct (02235), Cheat Death (03310), Storm of Spirits (03153), Flamethrower (04305), Impromptu Barrier (04312), Dynamite Blast (60129), Taunt (60130), "I'm done runnin'!" (05016), Decoy (05234), Mk 1 Grenades (05273), Small Favor (05277), Gate Box (06013), Detached from Reality (06014), Ethereal Form (06164), In the Shadows (07010), Gaze of Ouraxsh (07155), Fire Extinguisher (08080), Predator or Prey (09107), Stir the Pot (10073), Stir the Pot (10083), Ethereal Form (10100), Servant of Brass (10107), Elaborate Distraction (10112), Long Shot (10116), "Devil" (10119), Gatling Gun (11064), Bend Blood (60483), Guerrilla Tactics (60576), Makeshift Bomb (60581), Trish Scarborough (12007), Through the Cracks (12037), Through the Cracks (12041), Out of Sight (12053), Out of Sight (12057), Dynamite Blast (50002), Storm of Spirits (52008)
c-multiclass-payoff (6): Gang Up (08022), Join the Caravan (08036), Cheat the System (08050), Close the Circle (08062), Strength in Numbers (08077), Call for Backup (08129)
c-off-stat-combat (84): Mind over Matter (01536), Backstab (01551), Shrivelling (01560), Blinding Light (01566), Blinding Light (01569), Bind Monster (02031), "I've got a plan!" (02107), Song of the Dead (02112), Shrivelling (02154), Shrivelling (02306), Storm of Spirits (03153), Handcuffs (04265), Blood Eclipse (04266), Mists of R'lyeh (04029), Shards of the Void (04310), Mists of R'lyeh (04271), Ornate Bow (04204), Occult Invocation (60217), "I've got a plan!" (60225), Sharpshooter (60327), Backstab (60329), Azure Flame (60407), Ineffable Truth (60409), Azure Flame (60425), Ineffable Truth (60427), Azure Flame (60430), Ineffable Truth (60432), Twilight Blade (05013), Banish (05113), Wither (05157), Wither (05321), Mind's Eye (06328), Sword Cane (07029), Armageddon (07117), Shroud of Shadows (07119), Radiant Smite (07153), Abyssal Tome (07159), Armageddon (07226), Shroud of Shadows (07228), Trusty Bullwhip (08008), Close the Circle (08062), Brand of Cthugha (08090), Brand of Cthugha (08092), Blur (08109), Blur (08111), Enchanted Bow (08118), Bolas (09025), Handcuffs (09035), Ceremonial Sickle (09082), Onyx Pentacle (09085), Ceremonial Sickle (09096), Onyx Pentacle (09098), Aetheric Current (10006), Aetheric Current (10007), Katana (10021), Blade of Yoth (10036), Transmogrify (10050), British Bull Dog (10065), False Surrender (10070), British Bull Dog (10077), Breath of the Sleeper (11066), Sword Cane (11074), Blood of K'n-yan (11114), A Sudden Fall (60378), Caustic Reaction (60261), Caustic Reaction (60273), Scroll of the Pharaohs (60280), Cosmic Flame (60459), Shadowmeld (60461), Consume Life (60462), Dread Curse of Azathoth (60474), Shadowmeld (60482), Bend Blood (60483), Pocketknife (60559), Decoy Trap (60562), Lie in Wait (60566), Longbow (60580), Isabelle's Twin .45s (12014), M1903 Hammerless (12045), Cosmic Flame (12059), Cosmic Flame (12071), Storm of Spirits (52008), Blood Eclipse (53001), Mists of R'lyeh (53007)
c-off-stat-investigation (44): Lockpicks (01687), Rite of Seeking (01689), Rite of Seeking (02028), Rite of Seeking (02233), Lockpicks (03031), Lockpicks (60305), Pilfer (60315), Pilfer (60328), Clairvoyance (60408), Clairvoyance (60426), Clairvoyance (60431), Sixth Sense (05158), Sixth Sense (05322), Read the Signs (06117), Mind's Eye (06328), Breaking and Entering (07114), Eye of Chaos (07118), Eye of Chaos (07227), Close the Circle (08062), Divination (08101), Divination (08103), Grappling Hook (09009), Map the Area (09048), Thieves' Kit (09064), Breaking and Entering (09074), Thieves' Kit (09075), Dowsing Rod (09083), Dowsing Rod (09097), Guided by Faith (10025), Read the Signs (10101), Crowbar (11021), Forensic Kit (11036), Eyes of the Dreamer (11067), Lockpicks (60361), Lockpicks (60372), Clean Sweep (60376), Second Sight (60460), Second Sight (60481), Glassing (60563), Thieves' Kit (12049), Breaking and Entering (12050), Second Sight (12062), Augur of Elokoss (12070), Rite of Seeking (51007)
c-passive-boost (101): Beat Cop (01518), Police Badge (01527), Beat Cop (01528), Magnifying Glass (01530), Dr. Milan Christopher (01533), Magnifying Glass (01540), Cat Burglar (01555), Holy Rosary (01559), Hired Muscle (02027), Peter Sylvestre (02033), Peter Sylvestre (02035), Brother Xavier (02106), Newspaper (02155), Alyssa Graham (02232), Dark Horse (02234), Dario El-Amin (03151), David Renfield (03112), St. Hubert's Key (03269), Newspaper (03313), Key of Ys (03315), The Codex of Ages (04013), Calvin Wright (04005), Intrepid (04192), Reliable (04020), Tooth of Eztli (04023), Treasure Hunter (04025), Lola Santiago (04196), Crystalline Elder Sign (04235), Trench Coat (04203), Hemispheric Map (04275), Boxing Gloves (60105), Grete Wagner (60107), Boxing Gloves (60127), Grete Wagner (60128), Celaeno Fragments (60206), Whitton Greene (60213), Whitton Greene (60223), Lonnie Ritter (60309), Crystal Pendulum (60411), Granny Orne (60508), Granny Orne (60527), Diana Stanley (05004), Ace of Swords (05023), Death • XIII (05027), The Moon • XVIII (05031), Four of Cups (05035), Track Shoes (05036), Alice Luxley (05151), Hawk-Eye Folding Camera (05154), Guiding Spirit (05236), Jessica Hyde (06118), Moonstone (06203), Delilah O'Rourke (06281), Holy Rosary (07220), Nephthys (07262), Geas (07265), Ikiaq (07267), Combat Training (08027), Jeremiah Kirby (08032), Hiking Boots (08035), Scientific Theory (08040), Prophesiae Profana (08045), Moxie (08056), The Black Fan (08057), Grounded (08069), Plucky (08081), Michael Leigh (08086), Gené Beauregard (08099), Field Agent (09033), Martyr's Vambrace (09037), Dissection Tools (09043), Dirty Fighting (09073), Elle Rubash (09092), Wilson Richards (10001), Gabriel Carillo (10052), Dark Horse (10127), Hunter's Mark (11026), Alice Luxley (11027), Alton O'Connell (11033), Robert Castaigne (11051), Robert Castaigne (11062), Eye of Ghatanothoa (11073), Lawrence Carlisle (11083), Good Weather (11091), Forbidden Sutra (11103), Walter Fitzpatrick (11104), Dakota Garofalo (11110), Archibald MacVeigh (11117), The Black Fan (60379), Magnifying Glass (60270), Bloodstone (60457), Jim Culver (60479), Daniel Jameson (60555), Extended Barrel (60172), Detective Sherman (60177), Logan Hastings (12018), Dorothy Simmons (12030), Magnifying Glass (12034), Olivier Bishop (12046), Jim Culver (12060), Bandolier (51001)
c-player-deck-look (12): Scrying (01561), Scrying (01690), Alyssa Graham (02232), Scrying (03236), Scroll of Secrets (05116), Scroll of Secrets (05188), Scroll of Secrets (05189), Black Market (08055), Parallel Fates (08066), Astronomical Atlas (08067), Psychoanalysis (60264), Unbridled Knowledge (12043)
c-protector-tank (24): Brother Xavier (02106), True Grit (03021), "Let me handle this!" (03022), Heroic Rescue (03106), Something Worth Fighting For (05109), Agency Backup (05274), Solemn Vow (06020), First Watch (06110), Tetsuo Mori (06155), Heroic Rescue (06234), Guardian Angel (07006), "Get behind me!" (08021), Obsidian Bracelet (09024), Martyr's Vambrace (09037), Girish Kadakia (09038), Hank Samson (10015), Ravenous Myconid (10061), "Devil" (10119), Sound Support (11112), Rookie Cop (60157), Detective Sherman (60177), Bodyguard (12016), Bodyguard (12027), Lucky Charm (12061)
c-relic-support (8): Recharge (03197), Dr. Elli Horowitz (04021), Unearth the Ancients (04024), Whitton Greene (60213), Whitton Greene (60223), Recharge (60429), Unearth the Ancients (08039), Antiquary (08124)
c-remote-clue (28): Seeking Answers (01685), Seeking Answers (02023), Deciphered Reality (02303), Grete Wagner (60128), Seeking Answers (60227), The Necronomicon (60233), "Look what I found!" (60524), Interrogate (05020), Connect the Dots (05025), Intel Report (05111), Pendant of the Queen (06022), Eye of Chaos (07118), Eye of Chaos (07227), On the Trail (08084), On the Trail (08085), Professor William Webb (08104), Professor William Webb (08106), Damning Testimony (09059), Shed a Light (09108), Nature of the Beast (09111), Snitch (10078), Fake Credentials (10082), Keeper of the Key (10106), Working a Hunch (11045), Right Under Their Noses (60368), Right Under Their Noses (60382), Second Sight (60481), Will of the Cosmos (12066)
c-return-to-hand (22): Opportunist (01553), Opportunist (02231), Arrogance (60303), Reckless (60304), Opportunist (60319), Cheap Shot (60323), Slip Away (60324), Pilfer (60328), Backstab (60329), Unexpected Courage (60526), A Glimmer of Hope (06245), Fey (07222), Breaking and Entering (09074), Uncanny Growth (10045), Ethereal Form (10100), Read the Signs (10101), Spectral Razor (10102), Stall for Time (10114), Determined (11002), Spiritual Echo (11075), A Glimmer of Hope (11090), "Shove off!" (12079)
c-sanity-safety (195): Beat Cop (01518), First Aid (01519), Beat Cop (01528), Dr. Milan Christopher (01533), Leo De Luca (01548), Leo De Luca (01554), Cat Burglar (01555), Holy Rosary (01559), Arcane Initiate (01563), Fearless (01567), Aquinnah (01582), Elder Sign Amulet (01595), First Aid (01683), Aquinnah (01691), Jim's Trumpet (02012), Duke (02014), Laboratory Assistant (02020), Liquid Courage (02024), Clarity of Mind (02030), Peter Sylvestre (02033), Peter Sylvestre (02035), Brother Xavier (02106), Smoking Pipe (02116), Art Student (02149), "If it bleeds..." (02225), Alyssa Graham (02232), Joey "The Rat" Vigil (02265), Fearless (02268), Moment of Respite (02273), Dr. William T. Maleson (02302), Aquinnah (02308), The Red-Gloved Man (02310), Inspiring Presence (03228), First Aid (03230), Charles Ross, Esq. (03149), Logical Reasoning (03191), Dario El-Amin (03151), Cheat Death (03310), St. Hubert's Key (03269), Arcane Initiate (03271), Cherished Keepsake (03114), Madame Labranche (03198), Key of Ys (03315), Mitch Brown (04006), Jake Williams (04008), Calvin Wright (04005), Until the End of Time (04015), Venturer (04018), Kerosene (04304), Dr. Elli Horowitz (04021), Ancient Stone (04231), Treasure Hunter (04025), Lola Santiago (04196), Olive McBride (04197), Yaotl (04035), Thermos (04274), Randall Cho (60102), Grete Wagner (60107), Grete Wagner (60128), Laboratory Assistant (60212), Whitton Greene (60213), Library Docent (60220), Whitton Greene (60223), Lonnie Ritter (60309), Liquid Courage (60320), Chuck Fergus (60332), Stella Clark (60501), Grimm's Fairy Tales (60506), Granny Orne (60508), Cherished Keepsake (60520), Granny Orne (60527), Carolyn Fern (05001), Hypnotic Therapy (05007), Something Worth Fighting For (05109), Meat Cleaver (05114), Alice Luxley (05151), Mr. "Rook" (05153), Henry Wan (05155), Enchanted Blade (05192), Guiding Spirit (05236), Agency Backup (05274), Deny Existence (05280), Soothing Melody (05314), Miss Doyle (06030), Tetsuo Mori (06155), Gregory Gry (06162), Twila Katherine Price (06244), Wish Eater (06277), Delilah O'Rourke (06281), The Black Cat (06285), Spiritual Resolve (06323), Abigail Foreman (06324), Joey "The Rat" Vigil (06326), Book of Psalms (07017), Eldritch Sophist (07111), Priest of Two Faiths (07156), Tristan Botley (07194), Holy Rosary (07220), Spirit of Humanity (07229), Nephthys (07262), Ikiaq (07267), Purifying Corruption (07273), Rite of Equilibrium (07308), Jacob Morrison (07309), Scientific Theory (08040), Archive of Conduits (08044), Meditative Trance (08061), Grounded (08069), Plucky (08081), Medical Student (08083), Michael Leigh (08086), Nkosi Mabati (08091), Protective Gear (08095), Gené Beauregard (08099), Professor William Webb (08104), Professor William Webb (08106), Precious Memento (08114), Precious Memento (08115), Earthly Serenity (08117), Earthly Serenity (08119), Sled Dog (08127), Call for Backup (08129), Bonnie Walsh (09019), Hunter's Armor (09021), Obsidian Bracelet (09024), Field Agent (09033), Guard Dog (09034), Martyr's Vambrace (09037), Girish Kadakia (09038), Dr. William T. Maleson (09054), Surgical Kit (09056), Chuck Fergus (09072), Hallowed Chalice (09084), Elle Rubash (09092), Katja Eastbank (09114), Fickle Fortune (09118), Hank Samson (10015), Ancestral Token (10019), Absolution (10024), Dr. Charles West III (10041), Steady-Handed (10053), Ravenous Myconid (10061), Olive McBride (10097), The Key of Solomon (10104), Keeper of the Key (10106), Hunting Jacket (10121), Ready for Anything (11024), Alice Luxley (11027), Inspiring Presence (11029), Forensic Kit (11036), Robert Castaigne (11051), Robert Castaigne (11062), Katarina Sojka (11069), Profane Idol (11085), Short Rest (11096), Walter Fitzpatrick (11104), True Awakening (11106), Cowl of Sekhmet (11109), Dakota Garofalo (11110), Sound Support (11112), Archibald MacVeigh (11117), Marcus Sengstacke (60362), Marcus Sengstacke (60375), Carolyn Fern (60251), Experimental Psychology (60252), Occult Records (60256), Psychology Student (60258), Unflappable (60262), Psychoanalysis (60264), De-Escalate (60265), Unflappable (60271), Psychoanalysis (60278), Arcane Initiate (60455), Jim Culver (60479), Daniel Jameson (60555), Hidden Shelter (60565), Canteen (60573), Rookie Cop (60157), Stakeout (60166), Detective Sherman (60177), Stakeout (60179), Detective's Intuition (12005), Isabelle Barnes (12013), Resilience (12021), Bodyguard (12027), Laboratory Assistant (12032), Cloak of Resonance (12058), Jim Culver (12060), Lucky Charm (12061), Fearless (12069), Aleksey Saburov (12072), Meat Cleaver (12077), Meat Cleaver (12085), Clarity of Mind (51008), Logical Reasoning (52003)
c-search (61): Old Book of Lore (01531), Research Librarian (01532), Arcane Initiate (01563), Old Book of Lore (01686), Flare (02115), Prepared for the Worst (02184), On the Hunt (03263), Stick to the Plan (03264), No Stone Unturned (03026), Eureka! (03231), No Stone Unturned (03307), Arcane Initiate (03271), Calling in Favors (03158), Leo Anderson (04001), Smuggled Goods (04010), Dr. Elli Horowitz (04021), Backpack (04037), Randall Cho (60102), Boxing Gloves (60105), Boxing Gloves (60127), Whitton Greene (60213), Whitton Greene (60223), Lucky Cigarette Case (60326), Copycat (60330), Scroll of Secrets (05116), Mr. "Rook" (05153), Scroll of Secrets (05188), Scroll of Secrets (05189), The Council's Coffer (05196), Anna Kaslow (05283), Mandy Thompson (06002), Tetsuo Mori (06155), Otherworld Codex (06158), Practice Makes Perfect (06197), Word of Command (06202), Lucid Dreaming (06205), Old Book of Lore (06279), Guided by the Unseen (07223), On the Hunt (08028), Prepared for the Worst (09036), Captivating Discovery (09047), Kicking the Hornet's Nest (09068), Bewitching (10079), Dirty Deeds (10080), Marion Tavares (11001), "Viola" Case (11012), "Where's the party?" (11053), Eldritch Brand (11080), University Archivist (60260), Establish Motive (60268), Psychoanalysis (60278), Arcane Initiate (60455), Stalk Prey (60567), Protective Vest (60159), Protective Vest (60181), "For my next trick..." (12011), Right Tool for the Job (12023), Mysterious Grimoire (12040), Paint the Town Red (12051), Rabbit's Foot (50010), Backpack (53011)
c-self-harm-cost (33): Forbidden Knowledge (01558), Ward of Protection (01565), Scrying (01690), Smoking Pipe (02116), Painkillers (02117), Ward of Protection (02307), Sophie (03009), Ward of Protection (03270), Scrying (03236), Blood Eclipse (04266), Feed the Mind (04267), Mysterious Raven (60509), Meat Cleaver (05114), Spirit of Humanity (07229), Purifying Corruption (07273), Bonesaw (09005), Forbidden Sutra (11103), Dreamer's Chronicle (60255), Scroll of the Pharaohs (60279), Scroll of the Pharaohs (60280), Scroll of the Pharaohs (60281), Commune with the Cosmos (60282), Grand-Mère's Charm (60452), Offering Bowl (60456), Sacrificial Doll (60458), Favor of Baalshandor (60463), Ritual Dagger (60475), Isabelle Barnes (12013), Ward of Protection (12065), Meat Cleaver (12077), Meat Cleaver (12085), Blood Eclipse (53001), Dendromorphosis (53012)
c-self-harm-damage (26): Smoking Pipe (02116), Sophie (03009), Alchemical Transmutation (03032), Astral Travel (03034), Storm of Spirits (03153), Blood Eclipse (04266), Azure Flame (60407), Astral Travel (60413), Azure Flame (60425), Azure Flame (60430), The Black Cat (06285), Spirit of Humanity (07229), Purifying Corruption (07273), Bonesaw (09005), Grand-Mère's Charm (60452), Offering Bowl (60456), Sacrificial Doll (60458), Cosmic Flame (60459), Favor of Baalshandor (60463), Ritual Dagger (60475), Cosmic Flame (12059), Cosmic Flame (12071), Alchemical Transmutation (52007), Storm of Spirits (52008), Blood Eclipse (53001), Dendromorphosis (53012)
c-self-harm-horror (35): Forbidden Knowledge (01558), Shrivelling (01560), Ward of Protection (01565), Blinding Light (01569), Scrying (01690), Painkillers (02117), Shrivelling (02154), Shrivelling (02306), Ward of Protection (02307), Ward of Protection (03270), Scrying (03236), Feed the Mind (04267), Clairvoyance (60408), Clairvoyance (60426), Clairvoyance (60431), Mysterious Raven (60509), Meat Cleaver (05114), The Black Cat (06285), Spirit of Humanity (07229), Purifying Corruption (07273), Forbidden Sutra (11103), Dreamer's Chronicle (60255), Scroll of the Pharaohs (60279), Scroll of the Pharaohs (60280), Scroll of the Pharaohs (60281), Commune with the Cosmos (60282), Second Sight (60460), Second Sight (60481), Isabelle Barnes (12013), Second Sight (12062), Ward of Protection (12065), Mask of Silenus (12068), Meat Cleaver (12077), Scrape By (12082), Meat Cleaver (12085)
c-shroud-reduction (16): Flashlight (01587), Arcane Insight (03266), Lantern (03036), Vantage Point (04306), Otherworldly Compass (04194), The Skeleton Key (04270), Winging It (04272), Old Keyring (60507), Cryptographic Cipher (07021), Breach the Door (09026), Old Keyring (09117), Matchbox (10108), Old Compass (60558), Old Compass (12083), Hand-Crank Flashlight (12088), Lantern (52009)
c-slot-tech (16): Dr. Elli Horowitz (04021), Empower Self (06241), Empower Self (06242), Empower Self (06243), Abigail Foreman (06324), Quickdraw Holster (08089), Sled Dog (08127), Tool Belt (09120), Uncanny Specimen (11039), Library Pass (11099), Library Pass (11118), Sacred Oath (11121), Sacred Oath (11122), Sacred Oath (11123), Sacrificial Doll (60458), The Hierophant • V (54007)
c-spell-support (43): Heirloom of Hyperborea (01512), Arcane Initiate (01563), Book of Shadows (01570), Uncage the Soul (03033), Spirit Athame (03035), Grounded (03113), Book of Shadows (03154), Recharge (03197), Arcane Initiate (03271), Arcane Research (04109), Familiar Spirit (60410), Robes of Endless Night (60412), Prescient (60419), Robes of Endless Night (60422), Recharge (60429), Marie Lambeau (05006), Sign Magick (05112), Knowledge is Power (05231), De Vermis Mysteriis (05235), Dayana Esperence (05279), Word of Command (06202), Twila Katherine Price (06244), Shining Trapezohedron (06329), Grounded (08069), True Magick (08070), Prophetic (08120), The Raven Quill (09042), Uncage the Soul (09095), Speak to the Dead (10091), Ethereal Weaving (10103), Agatha Crane (11007), Agatha Crane (11008), Mortar and Pestle (11037), Spiritual Echo (11075), Eldritch Brand (11080), Forbidden Sutra (11103), Arcane Initiate (60455), Favor of Baalshandor (60463), Mirror Form (60465), Ceremonial Robes (60470), Ritual Dagger (60475), "For my next trick..." (12011), Sign Magick (54008)
c-spend-resource (74): Physical Training (01517), Hyperawareness (01534), Hard Knocks (01549), Arcane Studies (01562), Dig Deep (01577), Zoey's Cross (02006), Fire Axe (02032), Keen Eye (02185), Higher Education (02187), Streetwise (02189), Scrapper (02193), Lucky Dice (02230), Joey "The Rat" Vigil (02265), Combat Training (03107), Scientific Theory (03109), Moxie (03111), Grounded (03113), Plucky (03115), High Roller (04156), Lola Santiago (04196), Physical Training (60108), Physical Training (60131), Higher Education (60211), Lonnie Ritter (60309), Streetwise (60311), Arcane Studies (60428), Scrapper (60511), Intel Report (05111), Decoy (05234), Small Favor (05277), Gregory Gry (06162), Delilah O'Rourke (06281), Joey "The Rat" Vigil (06326), Mariner's Compass (07121), Keen Eye (07152), Hyperawareness (07264), Hard Knocks (07266), Dig Deep (07270), Ariadne's Twine (07304), Combat Training (08027), Scientific Theory (08040), Counterespionage (08049), Moxie (08056), Grounded (08069), Plucky (08081), Prophetic (08120), Sleuth (08121), Bruiser (08122), Crafty (08123), Antiquary (08124), Trigger Man (09076), Underworld Market (09077), Fire Axe (10120), Mariner's Compass (10122), Alton O'Connell (11033), Library Pass (11099), Silver Tongue (60380), Well Connected (60381), Sharp Rhetoric (60277), Spiritual Intuition (60476), Levelheaded (60579), Endurance (60178), Endurance (12017), Sharp Rhetoric (12035), Silver Tongue (12047), Spiritual Intuition (12063), Levelheaded (12076), Physical Training (50001), Hyperawareness (50003), Hard Knocks (50005), Arcane Studies (50007), Dig Deep (50009), .32 Colt (52001), Well Connected (54006)
c-succeed-by (119): Switchblade (01544), .41 Derringer (01547), Opportunist (01553), Scavenging (01573), Lockpicks (01687), .41 Derringer (01688), Deduction (02150), Switchblade (02152), Quick Thinking (02229), Opportunist (02231), Fearless (02268), Vicious Blow (02299), Archaic Glyphs (03192), Cheap Shot (03194), "Watch this!" (03233), Lockpicks (03031), Pickpocketing (03195), .41 Derringer (03234), Suggestion (03268), Alchemical Transmutation (03032), Finn Edwards (04003), Feed the Mind (04267), Lucky Cigarette Case (04107), Slip Away (04232), All In (04309), Impromptu Barrier (04312), Overpower (60126), Feed the Mind (60209), Perception (60228), Winifred Habbamock (60301), Lockpicks (60305), Mauser C96 (60306), Switchblade (60307), Lucky Cigarette Case (60308), Cheap Shot (60312), Slip Away (60314), Nimble (60317), Opportunist (60319), Mauser C96 (60321), Cheap Shot (60323), Slip Away (60324), Manual Dexterity (60325), Lucky Cigarette Case (60326), Pilfer (60328), Backstab (60329), Beretta M1918 (60331), Crystal Pendulum (60411), Guts (60424), Belly of the Beast (05160), .45 Thompson (05187), Dream Diary (06112), Momentum (06115), Gregory Gry (06162), Brute Force (06166), Burglary (06200), Sharp Vision (06204), Expeditious Retreat (06246), Scavenging (06332), Breaking and Entering (07114), Medical Texts (08038), Brand of Cthugha (08090), Brand of Cthugha (08092), Cyclopean Hammer (08093), Divination (08101), Divination (08103), Blur (08109), Blur (08111), Precious Memento (08114), Precious Memento (08115), Earthly Serenity (08117), Earthly Serenity (08119), Kymani Jones (09008), Breach the Door (09026), Empirical Hypothesis (09041), Grim Memoir (09044), Research Notes (09045), Gray's Anatomy (09058), Honed Instinct (09061), "I'll take that!" (09067), Breaking and Entering (09074), Thieves' Kit (09075), Onyx Pentacle (09085), Onyx Pentacle (09098), Katana (10021), Hold Up (10026), Purified (10029), Chemistry Set (10040), Dr. Charles West III (10041), Uncanny Growth (10045), Steady-Handed (10053), Esoteric Method (10055), Grift (10071), Stir the Pot (10073), Lucius Galloway (11004), Book of Verse (11005), Alton O'Connell (11033), Correlate All Its Contents (11040), Antikythera (11049), Bum's Rush (11055), "Watch this!" (11061), André Patel (60351), Lockpicks (60361), Polished Cane (60363), Quick Exit (60366), Right Under Their Noses (60368), "Watch this!" (60371), Lockpicks (60372), Right Under Their Noses (60382), Deduction (60275), Vicious Blow (60176), Dorothy Simmons (12030), Lucky Cigarette Case (12044), Breaking and Entering (12050), Out of Sight (12053), Out of Sight (12057), Fearless (12069), Archaic Glyphs (52004), Suggestion (52006), Alchemical Transmutation (52007)
c-support (136): First Aid (01519), Old Book of Lore (01531), Medical Texts (01535), Cryptic Research (01543), Scrying (01561), Survival Instinct (01581), First Aid (01683), Old Book of Lore (01686), Scrying (01690), Jim's Trumpet (02012), Liquid Courage (02024), Clarity of Mind (02030), Emergency Aid (02105), Brother Xavier (02106), Flare (02115), Stand Together (02148), "If it bleeds..." (02225), Alyssa Graham (02232), Survival Instinct (02235), Strange Solution (02262), True Grit (03021), "Let me handle this!" (03022), Heroic Rescue (03106), Inspiring Presence (03228), First Aid (03230), No Stone Unturned (03026), Logical Reasoning (03191), Eureka! (03231), No Stone Unturned (03307), Scrying (03236), Kerosene (04304), Ancient Stone (04231), Take Heart (04201), Thermos (04274), Harvey Walters (60201), Vault of Knowledge (60202), Lonnie Ritter (60309), Liquid Courage (60320), Grimm's Fairy Tales (60506), Take Heart (60519), Lucky! (60528), Carolyn Fern (05001), Hypnotic Therapy (05007), Something Worth Fighting For (05109), Scroll of Secrets (05116), Scroll of Secrets (05188), Scroll of Secrets (05189), Grisly Totem (05194), The Council's Coffer (05196), Agency Backup (05274), Soothing Melody (05314), "You owe me one!" (05319), Patrice's Violin (06016), Solemn Vow (06020), The Stars Are Right (06028), First Watch (06110), Scroll of Prophecies (06116), Tetsuo Mori (06155), Self-Sacrifice (06157), Healing Words (06163), Heroic Rescue (06234), Leadership (06235), Old Book of Lore (06279), Guardian Angel (07006), Book of Psalms (07017), Deep Knowledge (07023), Butterfly Effect (07160), Manipulate Destiny (07162), Guided by the Unseen (07223), Rite of Equilibrium (07308), "Get behind me!" (08021), Medical Texts (08038), Archive of Conduits (08044), Black Market (08055), Parallel Fates (08066), Healing Words (08068), Bandages (08073), Medical Student (08083), Protecting the Anirniq (08102), Earthly Serenity (08117), Earthly Serenity (08119), Call for Backup (08129), "As you wish" (09002), Vincent Lee (09004), Bonesaw (09005), Obsidian Bracelet (09024), Prepared for the Worst (09036), Martyr's Vambrace (09037), Girish Kadakia (09038), Alchemical Distillation (09040), Bizarre Diagnosis (09046), Surgical Kit (09056), Hallowed Chalice (09084), At a Crossroads (09109), Heed the Dream (09115), Fickle Fortune (09118), Hank Samson (10015), Absolution (10024), Thorough Inquiry (10048), Ravenous Myconid (10061), Mesmeric Influence (10096), The Key of Solomon (10104), "Devil" (10119), Inspiring Presence (11029), Cosmic Revelation (11041), Contemplative (11088), Short Rest (11096), Sound Support (11112), Out the Door (60370), Out the Door (60373), Carolyn Fern (60251), Experimental Psychology (60252), Occult Records (60256), Psychology Student (60258), Psychoanalysis (60264), Establish Motive (60268), Unflappable (60271), Psychoanalysis (60278), Consume Life (60462), Infuse Life (60464), Cosmic Guidance (60468), Blood Ward (60472), Hidden Shelter (60565), Extra Rations (60570), Field Dressing (60571), Rookie Cop (60157), Detective Sherman (60177), Bodyguard (12016), Bodyguard (12027), Out of Sight (12053), Out of Sight (12057), Lucky Charm (12061), Bandages (12073), Strange Solution (51004), Clarity of Mind (51008), Logical Reasoning (52003)
c-thorns (10): Guard Dog (01521), Counterpunch (60112), Daniela Reyes (08001), Bangle of Jinxes (08075), Blood Will Have Blood (08079), Guard Dog (09034), Service Revolver (60158), Restrained (60165), Daniela Reyes (12001), Lesson Learned (12022)
c-tome-support (16): Daisy's Tote Bag (01508), Research Librarian (01532), Arcane Enlightenment (60205), Whitton Greene (60213), Library Docent (60220), Whitton Greene (60223), Knowledge is Power (05231), Abigail Foreman (06324), Sleuth (08121), The Raven Quill (09042), "Throw the Book at Them!" (10049), Library Pass (11099), Library Pass (11118), University Archivist (60260), Literary Analysis (60269), Typewriter (60272)
c-treachery-handling (30): Ward of Protection (01565), Dr. William T. Maleson (02302), Ward of Protection (02307), Logical Reasoning (03191), Forewarned (03150), Cheat Death (03310), Ward of Protection (03270), A Test of Will (03156), Alter Fate (04313), A Test of Will (60513), A Test of Will (60523), Dark Insight (05014), "Fool me once..." (06156), Ward of Radiance (07031), Purifying Corruption (07273), Counterespionage (08049), Foresight (08064), Protective Gear (08095), Dr. William T. Maleson (09054), Ravenous Myconid (10059), Psychic Sensitivity (11015), Dreams of the Clay (11100), Sacred Oath (11121), Sacred Oath (11122), Sacred Oath (11123), Ward of Protection (12065), Augur of Elokoss (12070), Logical Reasoning (52003), Alter Fate (53009), Nine of Rods (54009)
c-victory-display (6): Delve Too Deep (02111), Bury Them Deep (03016), "Let God sort them out..." (06160), The Eye of Truth (06325), Bianca "Die Katz" (10063), Blood of K'n-yan (11114)
c-weapon-support (12): Bandolier (02147), Prepared for the Worst (02184), Randall Cho (60102), Enchant Weapon (07261), Prepared for the Worst (09036), Ad Hoc (10002), Hand-Eye Coordination (10030), False Surrender (10070), Pushed to the Limit (10113), Right Tool for the Job (12023), Jumpsuit (12075), Bandolier (51001)
