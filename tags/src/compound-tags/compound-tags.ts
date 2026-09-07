import { CompoundTagBase } from "../base.js";
import {
  TagTypeActionActivate,
  TagTypeActionAdditional,
  TagTypeActionBold,
  TagTypeAoo,
  TagTypeAuto,
  TagTypeBuffCannot,
  TagTypeCancel,
  TagTypeChaosBag,
  TagTypeChaosDownside,
  TagTypeChaosEffect,
  TagTypeChaosPredict,
  TagTypeChaosReveal,
  TagTypeChaosSeal,
  TagTypeClueAdditional,
  TagTypeClueDiscover,
  TagTypeCluePlace,
  TagTypeCommit,
  TagTypeCondition,
  TagTypeCostAction,
  TagTypeCostDiscount,
  TagTypeCostFree,
  TagTypeCostOther,
  TagTypeCostReaction,
  TagTypeDamage,
  TagTypeDeckDiscard,
  TagTypeDeckDraw,
  TagTypeDeckLook,
  TagTypeDeckSearch,
  TagTypeDeckShuffle,
  TagTypeDiscardFromPlay,
  TagTypeDiscardPile,
  TagTypeDoom,
  TagTypeEncounter,
  TagTypeEnemyDebuff,
  TagTypeEnemyEngage,
  TagTypeEnemyMitigation,
  TagTypeEnemyRestriction,
  TagTypeEnemyValue,
  TagTypeExile,
  TagTypeGainResource,
  TagTypeHandSize,
  TagTypeHeal,
  TagTypeLocationConnecting,
  TagTypeLocationMove,
  TagTypeLocationProperty,
  TagTypeLocationShroud,
  TagTypeLocationYour,
  TagTypeMulticlass,
  TagTypePlayArea,
  TagTypeReady,
  TagTypeRecursion,
  TagTypeSkillCommit,
  TagTypeSkillTestCondition,
  TagTypeSkillValue,
  TagTypeSkillValueSource,
  TagTypeSlotAdditional,
  TagTypeSlotConvert,
  TagTypeSlotIgnore,
  TagTypeSlotShare,
  TagTypeSoak,
  TagTypeStatsModAddStat,
  TagTypeStatsModBoostInTest,
  TagTypeStatsModBoostLasting,
  TagTypeStatsModBoostPassive,
  TagTypeStatsModUseInstead,
  TagTypeTank,
  TagTypeTestDifficulty,
  TagTypeTestRepeat,
  TagTypeTestless,
  TagTypeTimingAfter,
  TagTypeTimingWhen,
  TagTypeTraitSupport,
  TagTypeUsesAccumulate,
  TagTypeVictory,
} from "../tags/index.js";

export enum CompoundTagType {
  Thorns = "c-thorns",
  DiscardSelf = "c-discard-self",
  Support = "c-support",
  ClueTech = "c-clue-tech",
  DifficultyReduction = "c-difficulty-reduction",
  SpendResource = "c-spend-resource",
  AttackMitigation = "c-attack-mitigation",
  SucceedBy = "c-succeed-by",
  FailBy = "c-fail-by",
  Investigate = "c-investigate",
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
  HealthSafety = "c-health-safety",
  SanitySafety = "c-sanity-safety",
  TomeSupport = "c-tome-support",
  SpellSupport = "c-spell-support",
  RelicSupport = "c-relic-support",
  WeaponSupport = "c-weapon-support",
  AllySupport = "c-ally-support",
  AllyHealing = "c-ally-healing",
  PassiveBoost = "c-passive-boost",
  Cancel = "c-cancel",
  EnemyMitigation = "c-enemy-mitigation",
  AreaDamage = "c-area-damage",
  EfficientDamage = "c-efficient-damage",
  TestlessDamage = "c-testless-damage",
  Search = "c-search",
  Economy = "c-economy",
  ClueOnLocation = "c-clue-on-location",
  OffStatCombat = "c-off-stat-combat",
  OffStatInvestigation = "c-off-stat-investigation",
  ExtraActions = "c-extra-actions",
  ActionUsesCost = "c-action-uses-cost",
  RemoteClue = "c-remote-clue",
  MultiEnemy = "c-multi-enemy",
  CombatBoost = "c-combat-boost",
  AgilityBoost = "c-agility-boost",
  IntellectBoost = "c-intellect-boost",
  WillpowerBoost = "c-willpower-boost",
  SkillValueBoost = "c-skill-value-boost",
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
  PlayerDeckLook = "c-player-deck-look",
  KeywordSuppression = "c-keyword-suppression",
  AdditionalSlot = "c-additional-slot",
  EfficientClue = "c-efficient-clue",
  EvadePayoff = "c-evade-payoff",
  EnemyNerf = "c-enemy-nerf",
  Engagement = "c-engagement",
  Mobility = "c-mobility",
  CrossDeck = "c-cross-deck",
  SlotTech = "c-slot-tech",
  VictoryDisplay = "c-victory-display",
}

const registry: CompoundTagBase[] = [];
/** Register a compound so `compoundTags` lists it in definition order. */
function defineCompound(def: CompoundTagBase): CompoundTagBase {
  registry.push(def);
  return def;
}

export const compoundTagSucceedBy = defineCompound({
  type: CompoundTagType.SucceedBy,
  tags: [
    TagTypeSkillValue.SkillValueSucceedByDynamic,
    TagTypeSkillValue.SkillValueSucceedByOrMore,
    TagTypeSkillValue.SkillValueSucceedByExactly,
  ],
});

export const compoundTagFailBy = defineCompound({
  type: CompoundTagType.FailBy,
  tags: [
    TagTypeSkillValue.SkillValueFailByDynamic,
    TagTypeSkillValue.SkillValueFailByOrLess,
    TagTypeSkillValue.SkillValueFailByExactly,
  ],
});

export const compoundTagAttackMitigation = defineCompound({
  type: CompoundTagType.AttackMitigation,
  tags: [
    TagTypeCancel.CancelAttack,
    TagTypeBuffCannot.CannotAttackYou,
    TagTypeEnemyDebuff.EnemyCannotAttack,
    TagTypeDamage.DamageRedirectAttack,
  ],
});

export const compoundTagThorns = defineCompound({
  type: CompoundTagType.Thorns,
  tags: [
    TagTypeTimingAfter.TimingAfterEnemyDealDamageSelf,
    TagTypeTimingAfter.TimingAfterEnemyAttacks,
  ],
});

/**
 * Self-discard: the card DELIBERATELY discards itself from play as an act/cost (an
 * ability, not running out of uses) — Beat Cop's "Discard Beat Cop: …". Distinct from
 * discard-from-play-self-no-uses (a consumable depleting), which is NOT self-discard.
 */
export const compoundTagDiscardSelf = defineCompound({
  type: CompoundTagType.DiscardSelf,
  tags: [
    TagTypeCostFree.CostFreeDiscardSelf,
    TagTypeCostReaction.CostReactionDiscardSelf,
    TagTypeCostAction.CostActionDiscardSelf,
  ],
});

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
export const compoundTagInvestigate = defineCompound({
  type: CompoundTagType.Investigate,
  tags: [
    TagTypeTimingAfter.TimingAfterSuccessfullyInvestigate,
    TagTypeTimingAfter.TimingAfterDiscoverClue,
  ],
});

/**
 * Any tags that suggests you can help out other investigators
 * are collected in this compound tag.
 */
export const compoundTagSupport = defineCompound({
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
    // Protecting others IS support: the tank family joins, cross-investigator scope only for moves.
    TagTypeTank.TankRedirectAttack,
    TagTypeTank.TankRedirectEncounter,
    TagTypeTank.TankRedirectDamageHorror,
    { type: TagTypeTank.TankMoveDamageHorror, where: { scope: "cross-investigator" } },
  ],
});

/**
 * Compound tag for clue-finding technology: discovering clues while bypassing or easing
 * the normal investigate test — discover-without-investigating, shroud reduction, or
 * testless clues. NOTE: discovering EXTRA clues on a *successful* investigation is not
 * clue-tech (it still requires investigating); those live in the Investigate compound.
 */
export const compoundTagClueTech = defineCompound({
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
});

/**
 * Compound tag for difficulty reduction — every way to lower the effective difficulty
 * (target number) of a test: a direct cut (test-difficulty-reduce) or reducing a
 * location's shroud (which is the difficulty of an investigation). The target-lowering
 * counterpart to boosting your own skill value. Broader than Shroud Reduction, which is
 * only the location-shroud subset.
 */
export const compoundTagDifficultyReduction = defineCompound({
  type: CompoundTagType.DifficultyReduction,
  tags: [
    TagTypeTestDifficulty.TestDifficultyReduce,
    TagTypeLocationShroud.LocationShroudMinus1,
    TagTypeLocationShroud.LocationShroudMinus2,
    TagTypeLocationShroud.LocationShroudReduction,
  ],
});

/**
 * Compound tag for spending resources.
 * Groups all tags that involve spending resources as a cost.
 */
export const compoundTagSpendResource = defineCompound({
  type: CompoundTagType.SpendResource,
  tags: [
    TagTypeCostFree.CostFreeSpendResource,
    TagTypeCostReaction.CostReactionSpendResource,
  ],
});

/**
 * Into-play "cheat": putting cards directly into play from hand/deck/discard,
 * bypassing the normal play action / sometimes the cost. A tempo / recursion enabler.
 */
export const compoundTagIntoPlayCheat = defineCompound({
  type: CompoundTagType.IntoPlayCheat,
  tags: [
    TagTypePlayArea.PlayAreaIntoPlayFromHand,
    TagTypePlayArea.PlayAreaIntoPlayFromDeck,
    TagTypePlayArea.PlayAreaIntoPlayFromDiscard,
    TagTypePlayArea.PlayAreaPlayIgnoringCost,
  ],
});

/**
 * Bold action: any card that bundles a basic action (Fight/Evade/Investigate/Parley/
 * Resign) into its own ability, regardless of which action.
 */
export const compoundTagBoldAction = defineCompound({
  type: CompoundTagType.BoldAction,
  tags: [
    TagTypeActionBold.ActionBoldFight,
    TagTypeActionBold.ActionBoldEvade,
    TagTypeActionBold.ActionBoldInvestigate,
    TagTypeActionBold.ActionBoldParley,
    TagTypeActionBold.ActionBoldResign,
  ],
});

/**
 * Chaos-token control: reveal more / ignore / cancel / predict / treat-as / seal —
 * the whole "play with the chaos bag draw" archetype.
 */
export const compoundTagChaosTokenControl = defineCompound({
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
});

/** Bless/curse bag: adding, removing, replacing, sealing, or paying off bless/curse tokens. */
export const compoundTagBlessCurseBag = defineCompound({
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
});

/**
 * Big money: caring about HAVING a large resource pool — converting resources into power
 * or scaling with how many you hold. NOTE: merely generating resources is Economy, not
 * Big Money.
 */
export const compoundTagBigMoney = defineCompound({
  type: CompoundTagType.BigMoney,
  tags: [
    TagTypeSkillValueSource.SkillValueFromResource,
    { type: TagTypeCondition.ConditionResource, where: { comparison: "min" } },
  ],
});

/** Evasion package: the EVADE mechanic — auto/testless evade, mass evade, making evade easier, and after-evade payoffs. Disengaging (Elusive, Stealth) counts: fleeing is the point of evasion. */
export const compoundTagEvasionPackage = defineCompound({
  type: CompoundTagType.EvasionPackage,
  tags: [
    TagTypeAuto.AutoEvade,
    TagTypeTestless.TestlessEvade,
    TagTypeEnemyEngage.EnemyEngageEvadeMultiple,
    TagTypeEnemyValue.EnemyValueEvadeReduction,
    TagTypeTimingAfter.TimingAfterEvadeEnemy,
    TagTypeEnemyEngage.EnemyEngageDisengage,
  ],
});

/** Protector/tank: take hits for the team — redirect attacks/encounter cards, ready an ally. */
export const compoundTagProtectorTank = defineCompound({
  type: CompoundTagType.ProtectorTank,
  tags: [
    TagTypeTank.TankRedirectAttack,
    TagTypeTank.TankRedirectEncounter,
    TagTypeTank.TankRedirectDamageHorror,
    // only the cross-investigator scope protects others; scope "self" (Tommy) is out
    { type: TagTypeTank.TankMoveDamageHorror, where: { scope: "cross-investigator" } },
  ],
});

/**
 * Fail-forward: turning a failed test into upside or softening it — after-fail payoffs,
 * retries, fail-by margins, or canceling a failed test's effects. NOTE: a plain "on
 * failure, something bad happens" branch (SkillTestConditionFail) is NOT fail-forward.
 */
export const compoundTagFailForward = defineCompound({
  type: CompoundTagType.FailForward,
  tags: [
    TagTypeTimingAfter.TimingAfterFailSkillTest,
    TagTypeTestRepeat.TestRepeatFailed,
    TagTypeCancel.CancelFailedTestEffects,
    TagTypeSkillValue.SkillValueFailByOrLess,
    TagTypeSkillValue.SkillValueFailByExactly,
    TagTypeSkillValue.SkillValueFailByDynamic,
  ],
});

/** Discard-pile value: replaying / recurring cards from the discard pile. */
export const compoundTagDiscardPileValue = defineCompound({
  type: CompoundTagType.DiscardPileValue,
  tags: [
    TagTypeRecursion.RecursionPlayFromDiscard,
    TagTypeRecursion.RecursionEvent,
    TagTypeRecursion.RecursionSkill,
    TagTypeDiscardPile.DiscardPileToHand,
    TagTypeDiscardPile.DiscardPileToDeck,
  ],
});

/**
 * Action compression: doing MORE PER ACTION — cheaper/free activations, an extra attack
 * inside one action, or readying to act again. NOTE: simply gaining extra actions is not
 * compression (you still do one thing per action); that is Extra Actions.
 */
export const compoundTagActionCompression = defineCompound({
  type: CompoundTagType.ActionCompression,
  tags: [
    TagTypeActionActivate.ActionActivateIgnoringCost,
    TagTypeActionActivate.ActionActivateFromHand,
    TagTypeActionAdditional.ActionAdditionalAttack,
    TagTypeReady.ReadySelf,
    TagTypeReady.ReadyAsset,
  ],
});

/**
 * Health safety: cards whose point is protecting your HEALTH — extra effective health
 * capacity (e.g. Bulletproof Vest) plus damage healing.
 */
export const compoundTagHealthSafety = defineCompound({
  type: CompoundTagType.HealthSafety,
  tags: [
    TagTypeSoak.SoakHealth,
    TagTypeHeal.HealDamageYou,
    TagTypeHeal.HealDamageInvestigator,
    TagTypeHeal.HealDamageAlly,
    TagTypeHeal.HealDamageSelf,
  ],
});

/**
 * Sanity safety: cards whose point is protecting your SANITY — extra effective sanity
 * capacity (e.g. Elder Sign Amulet) plus horror healing (e.g. Peter Sylvestre).
 */
export const compoundTagSanitySafety = defineCompound({
  type: CompoundTagType.SanitySafety,
  tags: [
    TagTypeSoak.SoakSanity,
    TagTypeHeal.HealHorrorYou,
    TagTypeHeal.HealHorrorInvestigator,
    TagTypeHeal.HealHorrorAlly,
    TagTypeHeal.HealHorrorSelf,
  ],
});

// Trait "support" archetypes: an argument-bearing tag (e.g. an extra slot restricted to a
// trait) joins ONLY when its argument matches, via `{ type, where }` members.

/** Cards that have something to do with the Tome trait (support + Tome-only slots). */
export const compoundTagTomeSupport = defineCompound({
  type: CompoundTagType.TomeSupport,
  tags: [
    TagTypeTraitSupport.TraitSupportTome,
    { type: TagTypeSlotAdditional.SlotAdditionalHand, where: { restrictedToTrait: "Tome" } },
  ],
});

/** Spell trait support (incl. Spell-only arcane slots). */
export const compoundTagSpellSupport = defineCompound({
  type: CompoundTagType.SpellSupport,
  tags: [
    TagTypeTraitSupport.TraitSupportSpell,
    { type: TagTypeSlotAdditional.SlotAdditionalArcane, where: { restrictedToTrait: "Spell" } },
  ],
});

/** Relic trait support. */
export const compoundTagRelicSupport = defineCompound({
  type: CompoundTagType.RelicSupport,
  tags: [
    TagTypeTraitSupport.TraitSupportRelic,
  ],
});

/**
 * Weapon trait support (incl. Weapon-only slots). Firearm / Melee / Ranged are DISTINCT
 * traits with their own support compounds — a card that boosts Firearms is not "Weapon
 * support" unless it actually references the Weapon trait.
 */
export const compoundTagWeaponSupport = defineCompound({
  type: CompoundTagType.WeaponSupport,
  tags: [
    TagTypeTraitSupport.TraitSupportWeapon,
    { type: TagTypeSlotAdditional.SlotAdditionalHand, where: { restrictedToTrait: "Weapon" } },
  ],
});

/** Ally trait support (incl. Ally-only ally slots). */
export const compoundTagAllySupport = defineCompound({
  type: CompoundTagType.AllySupport,
  tags: [
    TagTypeTraitSupport.TraitSupportAlly,
  ],
});

/** Ally Healing: heals an ally/asset (damage or horror) — the keep-your-allies-alive package (First Aid, Emergency Aid, Inspiring Presence). */
export const compoundTagAllyHealing = defineCompound({
  type: CompoundTagType.AllyHealing,
  tags: [
    TagTypeHeal.HealDamageAlly,
    TagTypeHeal.HealHorrorAlly,
  ],
});

/** Passive boost: an always-on (or condition-gated) skill boost while the card is in play — no per-test commitment. */
export const compoundTagPassiveBoost = defineCompound({
  type: CompoundTagType.PassiveBoost,
  tags: [
    TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveIntellect,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveWillpower,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAny,
  ],
});

/** Cancel: negates an incoming attack, damage, horror, draw, test result, weakness, or other effect (Diana Stanley payoff). */
export const compoundTagCancel = defineCompound({
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
});

/** Enemy mitigation: neutralize an enemy WITHOUT a standard fight/evade test — discard, defeat, shuffle back, or stop it attacking. */
export const compoundTagEnemyMitigation = defineCompound({
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
});

/** Area damage: hits MULTIPLE enemies at once — all enemies at a location, a connecting location, or damage spread among them. */
export const compoundTagAreaDamage = defineCompound({
  type: CompoundTagType.AreaDamage,
  tags: [
    TagTypeTestless.TestlessDamageYourLocationMultiple,
    TagTypeTestless.TestlessDamageConnectingLocation,
    TagTypeDamage.DamageSpread,
  ],
});

/** Efficient damage: more damage per action — bonus damage, an extra attack, testless damage, or redirecting an attack's damage onto an enemy (action-compressed offense — Beat Cop, Aquinnah). */
export const compoundTagEfficientDamage = defineCompound({
  type: CompoundTagType.EfficientDamage,
  tags: [
    TagTypeDamage.DamagePlus,
    TagTypeDamage.DamageRedirectAttack,
    TagTypeDamage.DamageRedirectOwnAttack,
    TagTypeActionAdditional.ActionAdditionalAttack,
  ],
});

/**
 * Testless damage: deals damage WITHOUT a skill test — to enemies at your location, at a
 * connecting location, the attacking or engaged enemy, or spread among several (Beat Cop,
 * Dynamite Blast, Guard Dog). Split out of Efficient Damage, which is now the +damage /
 * extra-attack family.
 */
export const compoundTagTestlessDamage = defineCompound({
  type: CompoundTagType.TestlessDamage,
  tags: [
    TagTypeTestless.TestlessDamageYourLocation,
    TagTypeTestless.TestlessDamageYourLocationMultiple,
    TagTypeTestless.TestlessDamageConnectingLocation,
    TagTypeTestless.TestlessDamageAttackingEnemy,
    TagTypeTestless.TestlessDamageEngagedEnemy,
    TagTypeTestless.TestlessDamageEvadedEnemy,
    TagTypeDamage.DamageSpread,
  ],
});

/**
 * Efficient clue: more clues per action — extra/additional clues from your own action, or
 * testless clue discovery (the clue twin of Efficient Damage). Rite of Seeking,
 * "Look what I found!". Distinct from Investigate Payoff (rewarded for investigating
 * generally) — this is the card's OWN action netting extra clues.
 */
export const compoundTagEfficientClue = defineCompound({
  type: CompoundTagType.EfficientClue,
  tags: [
    TagTypeClueAdditional.ClueAdditionalThisLocation,
    TagTypeClueAdditional.ClueAdditionalRevealedLocations,
  ],
});

/**
 * Remote clue: gather clues from a location OTHER than your own — investigate / discover at
 * a connecting, adjacent, revealed, or any location (Seeking Answers grabs clues from a
 * connecting location). Distinct from Efficient Clue (volume) — this is about REACH.
 */
export const compoundTagRemoteClue = defineCompound({
  type: CompoundTagType.RemoteClue,
  tags: [
    TagTypeClueDiscover.ClueDiscoverConnectingLocation,
    TagTypeClueDiscover.ClueDiscoverAnyLocation,
    TagTypeClueAdditional.ClueAdditionalRevealedLocations,
  ],
});

/** Search: dig through a deck (yours, another investigator's, the discard, encounter, or bonded) for a specific card. */
export const compoundTagSearch = defineCompound({
  type: CompoundTagType.Search,
  tags: [
    TagTypeDeckSearch.DeckSearchYou,
    TagTypeDeckSearch.DeckSearchInvestigator,
    TagTypeDeckSearch.DeckSearchDiscard,
    TagTypeDeckSearch.DeckSearchEncounter,
    // bonded-fetch is deliberately NOT here: fetching from the set-aside bonded pool is not a
    // deck search.
  ],
});

/** Economy: generate resources, share them, discount costs, or put cards into play skipping their normal cost. */
export const compoundTagEconomy = defineCompound({
  type: CompoundTagType.Economy,
  tags: [
    TagTypeGainResource.GainResourceYou,
    TagTypeGainResource.GainResourceInvestigator,
    TagTypeGainResource.GainResourceMoveInvestigator,
    TagTypeCostDiscount.CostDiscount,
    TagTypePlayArea.PlayAreaPlayIgnoringCost,
  ],
});

/** Clue-on-location: cares about whether clues are ON a location — keyed to clue presence/absence, or dropping clues to set it up. */
export const compoundTagClueOnLocation = defineCompound({
  type: CompoundTagType.ClueOnLocation,
  tags: [
    TagTypeLocationProperty.LocationClueExist,
    TagTypeLocationProperty.LocationClueZero,
    TagTypeCluePlace.CluePlaceYourLocation,
  ],
});

/** Off-stat combat: fight with a non-[combat] stat, or evade with a non-[agility] stat (Mind over Matter, Mystic willpower-fighters). */
export const compoundTagOffStatCombat = defineCompound({
  type: CompoundTagType.OffStatCombat,
  tags: [
    { type: TagTypeStatsModUseInstead.StatsModUseInstead, where: { instead: "combat" } },
    { type: TagTypeStatsModUseInstead.StatsModUseInstead, where: { instead: "agility" } },
  ],
});

/** Off-stat investigation: investigate with a non-[intellect] stat — use another stat instead (Rite of Seeking → willpower) or ADD one on top (Lockpicks → agility). */
export const compoundTagOffStatInvestigation = defineCompound({
  type: CompoundTagType.OffStatInvestigation,
  tags: [
    { type: TagTypeStatsModUseInstead.StatsModUseInstead, where: { instead: "intellect" } },
    { type: TagTypeStatsModAddStat.StatsModAddStat, where: { action: "investigate" } },
  ],
});

/** Extra actions: grants additional actions for the turn — MORE actions, not more per action (distinct from action compression). */
export const compoundTagExtraActions = defineCompound({
  type: CompoundTagType.ExtraActions,
  tags: [
    TagTypeActionAdditional.ActionAdditional,
    // immediate out-of-sequence actions (Quick Thinking, Haste) are still extra actions
    TagTypeActionAdditional.ActionTakeImmediate,
  ],
});

/** Action uses-count cost: an [action] ability gated on spending a printed use-token — any uses-count type (charge/ammo, supply, or secret) — the 'Uses (N): [action] spend 1' weapon/tool/spell engine. */
export const compoundTagActionUsesCost = defineCompound({
  type: CompoundTagType.ActionUsesCost,
  tags: [
    TagTypeCostAction.CostActionSpendCharge,
    TagTypeCostAction.CostActionSpendAmmo,
    TagTypeCostAction.CostActionSpendSupply,
    TagTypeCostAction.CostActionSpendSecret,
  ],
});

/** Multi-enemy: deals with MULTIPLE enemies at once — area damage, mass evade, mass disengage, or mass engage (Dynamite Blast, Elusive, Cat Burglar). */
export const compoundTagMultiEnemy = defineCompound({
  type: CompoundTagType.MultiEnemy,
  tags: [
    TagTypeTestless.TestlessDamageYourLocationMultiple,
    TagTypeTestless.TestlessDamageConnectingLocation,
    TagTypeDamage.DamageSpread,
    TagTypeEnemyEngage.EnemyEngageEvadeMultiple,
    TagTypeEnemyEngage.EnemyEngageWithYouMultiple,
    { type: TagTypeEnemyEngage.EnemyEngageDisengage, where: { fromAll: true } },
  ],
});

/**
 * Mobility: the card MOVES you (or the performing investigator) — repositioning / movement
 * compression (move and act in one action: Duke moves to investigate; Pathfinder grants an
 * extra move). A card may be both Mobility and Evasion Package (Elusive moves AND disengages);
 * Duke is Mobility only (it does not escape anything).
 */
export const compoundTagMobility = defineCompound({
  type: CompoundTagType.Mobility,
  tags: [
    TagTypeLocationMove.LocationMoveInvestigatorSelf,
    TagTypeLocationMove.LocationMoveInvestigatorPerformer,
    TagTypeLocationMove.LocationMoveInvestigatorAny,
    // creating map connections is mobility enablement (Open Gate)
    TagTypeLocationConnecting.LocationCreateConnection,
  ],
});

/** Slot Tech: slot juggling — converting a slot's type, copies sharing one slot, or a card ignoring its slot entirely (Abigail Foreman; Trigger Man). Granting EXTRA slots is the AdditionalSlot compound. */
export const compoundTagSlotTech = defineCompound({
  type: CompoundTagType.SlotTech,
  tags: [
    TagTypeSlotConvert.SlotConvert,
    TagTypeSlotShare.SlotShare,
    TagTypeSlotIgnore.SlotIgnore,
  ],
});

/** Victory Display: banks victory points — adding itself (Delve Too Deep) or encounter cards (The Eye of Truth; Blood of K'n-yan) to the victory display. */
export const compoundTagVictoryDisplay = defineCompound({
  type: CompoundTagType.VictoryDisplay,
  tags: [
    TagTypeVictory.VictoryDisplaySelf,
    TagTypeVictory.VictoryDisplayAddEncounter,
  ],
});

/** Combat Boost: makes you better at FIGHTING — any [combat] (or any-skill) boost, in-test / passive / lasting. */
export const compoundTagCombatBoost = defineCompound({
  type: CompoundTagType.CombatBoost,
  tags: [
    TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat,
    TagTypeStatsModBoostLasting.StatsModBoostLastingCombat,
  ],
});

/** Agility Boost: makes you better at EVADING — any [agility] (or any-skill) boost, in-test / passive / lasting. */
export const compoundTagAgilityBoost = defineCompound({
  type: CompoundTagType.AgilityBoost,
  tags: [
    TagTypeStatsModBoostInTest.StatsModBoostInTestAgility,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility,
    TagTypeStatsModBoostLasting.StatsModBoostLastingAgility,
  ],
});

/** Intellect Boost: makes you better at INVESTIGATING — any [intellect] (or any-skill) boost, in-test / passive / lasting. */
export const compoundTagIntellectBoost = defineCompound({
  type: CompoundTagType.IntellectBoost,
  tags: [
    TagTypeStatsModBoostInTest.StatsModBoostInTestIntellect,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveIntellect,
    TagTypeStatsModBoostLasting.StatsModBoostLastingIntellect,
  ],
});

/** Willpower boost: raises willpower — in a test, passively, or for a duration. The fourth stat compound. */
export const compoundTagWillpowerBoost = defineCompound({
  type: CompoundTagType.WillpowerBoost,
  tags: [
    TagTypeStatsModBoostInTest.StatsModBoostInTestWillpower,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveWillpower,
    TagTypeStatsModBoostLasting.StatsModBoostLastingWillpower,
  ],
});

/**
 * Skill-value boost: "+N skill value" / "+N to each of your skills" — stat-agnostic boosts
 * (Lucky!, the EOTE wallets, Well Prepared). Split out of the four per-stat compounds so
 * Combat/Agility/Intellect/Willpower Boost list only cards that name that stat.
 */
export const compoundTagSkillValueBoost = defineCompound({
  type: CompoundTagType.SkillValueBoost,
  tags: [
    TagTypeStatsModBoostInTest.StatsModBoostInTestAny,
    TagTypeStatsModBoostPassive.StatsModBoostPassiveAny,
    TagTypeStatsModBoostLasting.StatsModBoostLastingAny,
  ],
});

/** Card draw: refilling your hand — draw cards for yourself or another investigator (the Harvey Walters engine). */
export const compoundTagDraw = defineCompound({
  type: CompoundTagType.Draw,
  tags: [
    TagTypeDeckDraw.DeckDrawYou,
    TagTypeDeckDraw.DeckDrawInvestigator,
    TagTypeDeckDraw.DeckDrawFillHand,
  ],
});

/** Big hand: cares about how many cards are in your hand — scaling with, or raising, your hand size (Harvey Walters). */
export const compoundTagBigHand = defineCompound({
  type: CompoundTagType.BigHand,
  tags: [
    { type: TagTypeCondition.ConditionHandSize, where: { comparison: "min" } },
    TagTypeHandSize.HandSizeDependent,
    TagTypeHandSize.HandSizeMaxIncrease,
  ],
});

/** Commit: the committing-skill-cards archetype — commit to others, from outside hand, fetch, or add icons (Winifred Habbamock). */
export const compoundTagCommit = defineCompound({
  type: CompoundTagType.Commit,
  tags: [
    TagTypeCommit.CommitOtherInvestigator,
    TagTypeCommit.CommitFromNonHand,
    TagTypeCommit.CommitFetch,
    TagTypeSkillCommit.SkillCommitGainIcon,
  ],
});

/** Treachery handling: cancel, discard, or otherwise answer treacheries / encounter effects — a major Mystic & Survivor defensive archetype. */
export const compoundTagTreacheryHandling = defineCompound({
  type: CompoundTagType.TreacheryHandling,
  tags: [
    TagTypeCancel.CancelRevelation,
    TagTypeDiscardFromPlay.DiscardTreacheryInPlay,
    TagTypeCancel.CancelEncounterEffect,
    TagTypeCancel.CancelEncounterDraw,
  ],
});

/** Encounter deck: interacting with the ENCOUNTER deck — voluntarily drawing, looking, searching, discarding, shuffling, or choosing a revealed card. */
export const compoundTagEncounterDeck = defineCompound({
  type: CompoundTagType.EncounterDeck,
  tags: [
    TagTypeDeckDraw.DeckDrawEncounter,
    TagTypeDeckLook.DeckLookEncounter,
    TagTypeDeckSearch.DeckSearchEncounter,
    TagTypeDeckDiscard.DeckDiscardEncounter,
  ],
});

/** Chaos-token downside: the card suffers when a bad symbol is revealed (the risk side of spell weapons — Shrivelling, Blinding Light). */
export const compoundTagChaosTokenDownside = defineCompound({
  type: CompoundTagType.ChaosTokenDownside,
  tags: [
    TagTypeChaosDownside.ChaosDownsideDamage,
    TagTypeChaosDownside.ChaosDownsideHorror,
    TagTypeChaosDownside.ChaosDownsideResource,
    TagTypeChaosDownside.ChaosDownsideAction,
    TagTypeChaosDownside.ChaosDownsideDiscard,
  ],
});

/** Doom adding: puts doom into play (power at the price of advancing the agenda) — a big Mystic archetype. */
export const compoundTagDoomAdding = defineCompound({
  type: CompoundTagType.DoomAdding,
  tags: [
    { type: TagTypeDoom.DoomAdd, where: { target: "own-card" } },
    TagTypeCostOther.CostAddDoomSelf,
  ],
});

/** Self-harm (damage): you take your own DAMAGE — to activate an ability, or as a card's chaos-token risk. */
export const compoundTagSelfHarmDamage = defineCompound({
  type: CompoundTagType.SelfHarmDamage,
  tags: [
    TagTypeCostFree.CostFreeDamageSelf,
    TagTypeCostReaction.CostReactionDamageSelf,
    TagTypeCostOther.CostDamageSelf,
    TagTypeChaosDownside.ChaosDownsideDamage,
  ],
});

/** Self-harm (horror): you take your own HORROR — to activate an ability, a flat cost (Ward of Protection), or a card's chaos-token risk (Shrivelling). */
export const compoundTagSelfHarmHorror = defineCompound({
  type: CompoundTagType.SelfHarmHorror,
  tags: [
    TagTypeCostFree.CostFreeHorrorSelf,
    TagTypeCostReaction.CostReactionHorrorSelf,
    TagTypeCostOther.CostHorrorSelf,
    TagTypeChaosDownside.ChaosDownsideHorror,
  ],
});

/** Heal (damage): removes DAMAGE — from you, another investigator, an ally/asset, or this card (Vincent Lee cares). */
export const compoundTagHealDamage = defineCompound({
  type: CompoundTagType.HealDamage,
  tags: [
    TagTypeHeal.HealDamageYou,
    TagTypeHeal.HealDamageInvestigator,
    TagTypeHeal.HealDamageAlly,
    TagTypeHeal.HealDamageSelf,
  ],
});

/** Heal (horror): removes HORROR — from you, another investigator, an ally/asset, or this card (Carolyn Fern cares). */
export const compoundTagHealHorror = defineCompound({
  type: CompoundTagType.HealHorror,
  tags: [
    TagTypeHeal.HealHorrorYou,
    TagTypeHeal.HealHorrorInvestigator,
    TagTypeHeal.HealHorrorAlly,
    TagTypeHeal.HealHorrorSelf,
  ],
});

/** Conditional passive boost: an always-on boost that only applies to a specific action (Magnifying Glass — +1 [int] only when investigating). */
export const compoundTagConditionalPassiveBoost = defineCompound({
  type: CompoundTagType.ConditionalPassiveBoost,
  tags: [
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat, where: { action: "fight" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility, where: { action: "evade" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveIntellect, where: { action: "investigate" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny, where: { action: "fight" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny, where: { action: "evade" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny, where: { action: "investigate" } },
  ],
});

/** Exhaust to activate: an ability that exhausts the card as its cost (action / reaction / free). */
export const compoundTagExhausts = defineCompound({
  type: CompoundTagType.Exhausts,
  tags: [
    TagTypeCostAction.CostActionExhaustSelf,
    TagTypeCostReaction.CostReactionExhaustSelf,
    TagTypeCostFree.CostFreeExhaustSelf,
  ],
});

/** Player-deck look: look at / reorder the top of a player deck — yours or an ally's. */
export const compoundTagPlayerDeckLook = defineCompound({
  type: CompoundTagType.PlayerDeckLook,
  tags: [TagTypeDeckLook.DeckLookYou, TagTypeDeckLook.DeckLookInvestigator],
});

/** Keyword suppression: turn off an enemy's abilities — blank its text, or ignore one keyword (Retaliate/Aloof/Elusive). Mind Wipe, .45 Automatic (2). */
export const compoundTagKeywordSuppression = defineCompound({
  type: CompoundTagType.KeywordSuppression,
  tags: [
    TagTypeEnemyRestriction.EnemyBlankText,
    TagTypeEnemyRestriction.EnemyIgnoreKeyword,
  ],
});

/** Evade payoff: rewarded for evading GENERALLY — a passive evade boost, or a trigger after you evade (Pickpocketing). The evade twin of Investigate Payoff; distinct from the evasion package (cards that DO the evading). */
export const compoundTagEvadePayoff = defineCompound({
  type: CompoundTagType.EvadePayoff,
  tags: [
    TagTypeTimingAfter.TimingAfterEvadeEnemy,
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility, where: { action: "evade" } },
    { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny, where: { action: "evade" } },
  ],
});

/** Additional slot: grants an EXTRA play slot (arcane / hand / ally / accessory / tarot / generic), letting you field more permanents than normal. Book of Shadows, Charisma. */
export const compoundTagAdditionalSlot = defineCompound({
  type: CompoundTagType.AdditionalSlot,
  tags: [
    TagTypeSlotAdditional.SlotAdditionalAccessory,
    TagTypeSlotAdditional.SlotAdditionalAlly,
    TagTypeSlotAdditional.SlotAdditionalArcane,
    TagTypeSlotAdditional.SlotAdditionalHand,
    TagTypeSlotAdditional.SlotAdditionalTarot,
  ],
});

/** Enemy nerf: applies a lingering NEGATIVE modifier to an enemy (the inverse of a buff) — it cannot attack/move/engage, doesn't ready, is forced to exhaust, or has its text blanked. Mind Wipe. */
export const compoundTagEnemyNerf = defineCompound({
  type: CompoundTagType.EnemyNerf,
  tags: [
    TagTypeEnemyDebuff.EnemyDoesNotReady,
    TagTypeEnemyDebuff.EnemyCannotMoveIntoLocation,
    TagTypeEnemyDebuff.EnemyCannotAttack,
    TagTypeEnemyDebuff.EnemyCannotMove,
    TagTypeEnemyDebuff.EnemyExhaust,
    TagTypeEnemyRestriction.EnemyBlankText,
  ],
});

/**
 * Engagement: the card revolves around enemy ENGAGEMENT — pulling enemies to you (Taunt),
 * triggering off engaging (Zoey's Cross), or caring about being engaged with exactly one
 * enemy (Machete). The aggro/tank "I'll hold the line" cluster.
 */
export const compoundTagEngagement = defineCompound({
  type: CompoundTagType.Engagement,
  tags: [
    TagTypeEnemyEngage.EnemyEngageWithYou,
    TagTypeEnemyEngage.EnemyEngageWithYouMultiple,
    TagTypeTimingAfter.TimingAfterEngageEnemy,
    TagTypeCondition.ConditionEngagedAlone,
  ],
});

/**
 * Cross-deck: USE a card or resource belonging to ANOTHER investigator — play a teammate's
 * card from their deck/discard (Flare, A Chance Encounter) or move resources between
 * investigators (Teamwork). NOT `deck-search-investigator`, which is helping a teammate
 * search their OWN deck (Old Book of Lore, No Stone Unturned = support, not cross-deck).
 */
export const compoundTagCrossDeck = defineCompound({
  type: CompoundTagType.CrossDeck,
  tags: [
    TagTypePlayArea.PlayAreaFromInvestigator,
    TagTypeGainResource.GainResourceMoveInvestigator,
  ],
});

/** Every compound tag, in definition order. */
export const compoundTags: CompoundTagBase[] = registry;
