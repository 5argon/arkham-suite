import { CompoundTagBase } from "../base.js";
import { TagTypeClueAdditional } from "../tags/clue/additional.js";
import { TagTypeLocationShroud } from "../tags/location/shroud.js";
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
    TagTypeLocationYour.LocationYourInvestigator,
    TagTypeLocationYour.LocationYourAlly,
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
    TagTypeChaosReveal.ChaosRevealManual,
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
    TagTypeUsesAccumulate.UsesAccumulate,
    TagTypeCondition.ConditionResource,
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
    TagTypeReady.ReadyAlly,
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
    TagTypeRecursion.RecursionReplay,
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
    TagTypeCancel.CancelTreacheryInPlay,
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
    TagTypeEnemyDebuff.EnemyCannotEngage,
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
    TagTypeClueDiscover.ClueDiscoverAnyLocation,
    TagTypeClueDiscover.ClueDiscoverConnectingLocation,
    TagTypeClueDiscover.ClueDiscoverYourLocation,
    TagTypeTestless.TestlessClue,
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
    TagTypeDeckSearch.DeckSearchBonded,
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
    TagTypePlayArea.PlayAreaPlayFromOtherZone,
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
  tags: [TagTypeActionAdditional.ActionAdditional],
};


/** Action uses-count cost: an [action] ability gated on spending a printed use-token — any uses-count type (charge/ammo, supply, or secret) — the 'Uses (N): [action] spend 1' weapon/tool/spell engine. */
export const compoundTagActionChargeCost: CompoundTagBase = {
  type: CompoundTagType.ActionChargeCost,
  tags: [
    TagTypeCostAction.CostActionSpendCharge,
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
    TagTypeAoo.AooNoProvoke,
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
  ],
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
    TagTypeCondition.ConditionHandSize,
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
    TagTypeCancel.CancelTreacheryInPlay,
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
    TagTypeEnemyDebuff.EnemyCannotEngage,
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
];
