import { BasicAction, SkillType } from "../kohaku.js";
import { TagTypeActionBold } from "../tags/action/bold.js";
import {
  TagTypeBuffCannot,
  TagTypeBuffStatsReplace,
} from "../tags/buff/index.js";
import { TagTypeCancel } from "../tags/cancel/main.js";
import { TagTypeClueDiscover } from "../tags/clue/discover.js";
import { TagTypeCostFree } from "../tags/cost/free.js";
import { TagTypeDamage } from "../tags/damage/main.js";
import { TagTypeDeckDraw } from "../tags/deck/draw.js";
import { TagTypeDiscardPile } from "../tags/discard-pile/main.js";
import { TagTypeDiscardFromPlay } from "../tags/discard/from-play.js";
import { TagTypeEnemyElite } from "../tags/enemy/elite.js";
import { TagTypeEnemyEngage } from "../tags/enemy/engage.js";
import { TagTypeHeal } from "../tags/heal/main.js";
import { TagTypeLocationConnecting } from "../tags/location/connecting.js";
import { TagTypeLocationProperty } from "../tags/location/property.js";
import { TagTypeLocationYour } from "../tags/location/your.js";
import { TagTypeRecursion } from "../tags/recursion/main.js";
import { TagTypeSlotAdditional } from "../tags/slot/additional.js";
import { TagTypeStatsModBoostInTest } from "../tags/stats-mod/boost-in-test.js";
import { TagTypeStatsModBoostPassive } from "../tags/stats-mod/boost-passive.js";
import { TagTypeStatsModPump } from "../tags/stats-mod/pump.js";
import { TagTypeTestless } from "../tags/testless/main.js";
import { TagTypeDuration } from "../tags/duration/main.js";
import { TagTypeTimingWhen } from "../tags/timing/when.js";
import { TagTypeTimingAfter } from "../tags/timing/after.js";
import { TagTypeTraitSupport } from "../tags/trait/support.js";
import { TagTypeUsesStarting } from "../tags/uses/starting.js";
import { TaggedCard } from "../type.js";
import { TagTypeUsesSupport } from "../tags/uses/support.js";
import { TagTypeCostReaction } from "../tags/cost/reaction.js";
import { TagTypeTimingPhaseSequence } from "../tags/timing/phase-sequence.js";
import { TimingQualifier } from "../type.js";
import { TagTypeActionAdditional } from "../tags/action/additional.js";
import { TagTypeSkillTestCondition } from "../tags/skill-test-condition/main.js";
import { TagTypeSkillValue } from "../tags/skill-value/main.js";
import { TagTypeDeckSearch } from "../tags/deck/search.js";
import { TagTypeCostAction } from "../tags/cost/action.js";
import { TagTypeGainResource } from "../tags/gain/resource.js";
import { TagTypeTestInitiate } from "../tags/test/initiate.js";
import { TagTypeTimingDuring } from "../tags/timing/during.js";
import { TagTypeAttach } from "../tags/attach/main.js";
import { TagTypeEnemyDebuff } from "../tags/enemy/debuff.js";
import { TagTypeEnemyMitigation } from "../tags/enemy/mitigation.js";
import { TagTypeClueAdditional } from "../tags/clue/additional.js";
import { TagTypeCostDiscount } from "../tags/cost/discount.js";
import { TagTypeActionLose } from "../tags/action/lose.js";
import { TagTypeChaosReveal } from "../tags/chaos/reveal.js";
import { TagTypeChaosEffect } from "../tags/chaos/effect.js";
import { TagTypeAuto } from "../tags/auto/main.js";
import { TagTypeLocationMove } from "../tags/location/move.js";
import { TagTypeLocationShroud } from "../tags/location/shroud.js";
import { TagTypeEnemyValue } from "../tags/enemy/value.js";
import { TagTypeDeckShuffle } from "../tags/deck/shuffle.js";
import { TagTypeCostOther } from "../tags/cost/other.js";
import { TagTypeTimingForced } from "../tags/timing/forced.js";
import { TagTypeDoom } from "../tags/doom/main.js";
import { TagTypeTestResult } from "../tags/test/result.js";
import { TagTypeTestMisc } from "../tags/test/misc.js";
import { TagTypeDeckMisc } from "../tags/deck/misc.js";
import { TagTypePlayArea } from "../tags/play-area/main.js";

const taggedCards: TaggedCard[] = [
  {
    code: "01006",
    name: "Roland's .38 Special",
    text: "Roland Banks deck only.\nUses (4 ammo).\n[action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack (if there are 1 or more clues on your location, you get +3 [combat], instead). This attack deals +1 damage.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingAmmo,
        value: 4,
      },
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: 1,
        action: BasicAction.Fight,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: 3,
        action: BasicAction.Fight,
      },
      {
        type: TagTypeLocationProperty.LocationClueExist,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
    ],
  },

  {
    code: "01008",
    name: "Daisy's Tote Bag",
    text: "Daisy Walker deck only.\nYou have 2 additional hand slots, which can only be used to hold [[Tome]] assets.",
    tags: [
      {
        type: TagTypeSlotAdditional.SlotAdditionalHand,
      },
      {
        type: TagTypeTraitSupport.TraitSupportTome,
      },
    ],
  },
  {
    code: "01010",
    name: "On the Lam",
    text: '"Skids" O\'Toole deck only.\nFast. Play after your turn begins.\nUntil the end of the round, non-[[Elite]] enemies cannot attack you.',
    tags: [
      {
        type: TagTypeTimingPhaseSequence.PhaseInvestigationTurnBegins,
        timing: TimingQualifier.After,
      },
      {
        type: TagTypeDuration.DurationUntilEndRound,
      },
      {
        type: TagTypeBuffCannot.CannotAttackYou,
      },
      {
        type: TagTypeEnemyElite.EnemyEliteNonEliteOnly,
      },
    ],
  },
  {
    code: "01012",
    name: "Heirloom of Hyperborea",
    text: "Agnes Baker deck only.\n[reaction] After you play a [[Spell]] card: Draw 1 card.",
    tags: [
      {
        type: TagTypeTraitSupport.TraitSupportSpell,
      },
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
    ],
  },
  {
    code: "01014",
    name: "Wendy's Amulet",
    text: "Wendy Adams deck only.\nYou may play the topmost event in your discard pile as if it were in your hand.\n<b>Forced</b> - After you play an event or discard an event from play: Place it on the bottom of your deck instead of in your discard pile.",
    tags: [
      {
        type: TagTypeRecursion.RecursionEvent,
      },
      {
        type: TagTypeDiscardPile.DiscardPileToBottomDeck,
      },
    ],
  },
  {
    code: "01516",
    name: ".45 Automatic",
    text: "Uses (4 ammo).\n[action] Spend 1 ammo: <b>Fight.</b> You get +1 [combat] for this attack. This attack deals +1 damage.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingAmmo,
        value: 4,
      },
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        action: BasicAction.Fight,
        value: 1,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
    ],
  },
  {
    code: "01517",
    name: "Physical Training",
    text: "[free] Spend 1 resource: You get +1 [willpower] for this skill test.\n[free] Spend 1 resource: You get +1 [combat] for this skill test.",
    tags: [
      {
        type: TagTypeCostFree.CostFreeSpendResource,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestWillpower,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModPump.StatsModPumpResource,
        valuePerPump: 1,
      },
    ],
  },
  {
    code: "01518",
    name: "Beat Cop",
    text: "You get +1 [combat].\n[free] Discard Beat Cop: Deal 1 damage to an enemy at your location.",
    tags: [
      {
        type: TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat,
        value: 1,
      },
      {
        type: TagTypeDiscardFromPlay.DiscardFromPlaySelf,
      },
      {
        type: TagTypeCostFree.CostFreeDiscardSelf,
      },
      {
        type: TagTypeTestless.TestlessDamageYourLocation,
        value: 1,
      },
      {
        type: TagTypeLocationYour.LocationYourEnemy,
      },
    ],
  },
  {
    code: "01519",
    name: "First Aid",
    text: "Uses (3 supplies). If First Aid has no supplies, discard it.\n[action] Spend 1 supply: Heal 1 damage or horror from an investigator at your location.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingSupply,
        value: 3,
      },
      {
        type: TagTypeDiscardFromPlay.DiscardFromPlaySelfNoUses,
      },
      {
        type: TagTypeHeal.HealDamageInvestigator,
        value: 1,
      },
      {
        type: TagTypeHeal.HealHorrorInvestigator,
        value: 1,
      },
    ],
  },
  {
    code: "01520",
    name: "Machete",
    text: "[action]: <b>Fight.</b> You get +1 [combat] for this attack. If the attacked enemy is the only enemy engaged with you, this attack deals +1 damage.",
    tags: [
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: 1,
        action: BasicAction.Fight,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
      {
        type: TagTypeEnemyEngage.EnemyEngageWithYou,
      },
    ],
  },
  {
    code: "01521",
    name: "Guard Dog",
    text: "[reaction] When an enemy attack deals damage to Guard Dog: Deal 1 damage to the attacking enemy.",
    tags: [
      {
        type: TagTypeTimingAfter.TimingAfterEnemyDealDamageSelf,
      },
      {
        type: TagTypeCostReaction.CostReactionDamageSelf,
      },
      {
        type: TagTypeTestless.TestlessDamageYourLocation,
        value: 1,
      },
    ],
  },
  {
    code: "01522",
    name: "Evidence!",
    text: "Fast. Play after you defeat an enemy.\nDiscover 1 clue at your location.",
    tags: [
      {
        type: TagTypeTimingWhen.TimingWhenDefeatEnemy,
      },
      {
        type: TagTypeClueDiscover.ClueDiscoverYourLocation,
        value: 1,
      },
      {
        type: TagTypeTestless.TestlessClue,
        value: 1,
      },
    ],
  },
  {
    code: "01523",
    name: "Dodge",
    text: "Fast. Play when an enemy attacks an investigator at your location.\nCancel that attack.",
    tags: [
      {
        type: TagTypeTimingWhen.TimingWhenEnemyAttacks,
      },
      {
        type: TagTypeLocationYour.LocationYourInvestigator,
      },
      {
        type: TagTypeCancel.CancelAttack,
      },
    ],
  },
  {
    code: "01524",
    name: "Dynamite Blast",
    text: "Choose either your location or a connecting location. Deal 3 damage to each enemy and to each investigator at the chosen location.",
    tags: [
      {
        type: TagTypeLocationConnecting.LocationConnectingEnemy,
      },
      {
        type: TagTypeLocationConnecting.LocationConnectingInvestigator,
      },
      {
        type: TagTypeTestless.TestlessDamageConnectingLocation,
        value: 3,
      },
    ],
  },
  {
    code: "01525",
    name: "Vicious Blow",
    text: "If this skill test is successful during an attack, that attack deals +1 damage.",
    tags: [
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessfulDuringAnAttack,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
    ],
  },
  {
    code: "01526",
    name: "Extra Ammunition",
    text: "Place 3 ammo tokens on a [[Firearm]] asset controlled by an investigator at your location.",
    tags: [
      {
        type: TagTypeLocationYour.LocationYourInvestigator,
      },
      {
        type: TagTypeUsesSupport.UsesSupportAmmo,
        supportType: "place",
      },
    ],
  },
  {
    code: "01527",
    name: "Police Badge",
    text: "You get +1 [willpower].\n[free] While an investigator at your location is taking his or her turn, discard Police Badge: That investigator may take 2 additional actions this turn.",
    tags: [
      {
        type: TagTypeStatsModBoostPassive.StatsModBoostPassiveWillpower,
        value: 1,
      },
      {
        type: TagTypeCostFree.CostFreeDiscardSelf,
      },
      {
        type: TagTypeTimingPhaseSequence.PhaseInvestigationTakeAction,
        timing: TimingQualifier.When,
      },
      {
        type: TagTypeActionAdditional.ActionAdditional,
        value: 2,
      },
    ],
  },
  {
    code: "01528",
    name: "Beat Cop",
    text: "You get +1 [combat].\n[free] Exhaust Beat Cop and deal 1 damage to it: Deal 1 damage to an enemy at your location.",
    tags: [
      {
        type: TagTypeStatsModBoostPassive.StatsModBoostPassiveCombat,
        value: 1,
      },
      {
        type: TagTypeCostFree.CostFreeDamageSelf,
      },
      {
        type: TagTypeCostFree.CostFreeExhaustSelf,
      },
      {
        type: TagTypeTestless.TestlessDamageYourLocation,
        value: 1,
      },
      {
        type: TagTypeLocationYour.LocationYourEnemy,
      },
    ],
  },
  {
    code: "01529",
    name: "Shotgun",
    text: "Uses (2 ammo).\n[action] Spend 1 ammo: <b>Fight.</b> You get +3 [combat] for this attack. Instead of its standard damage, this attack deals 1 damage for each point you succeed by (to a minimum of 1, to a maximum of 5). If you fail and would damage another investigator, this attack deals 1 damage for each point you fail by (to a minimum of 1, to a maximum of 5).",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingAmmo,
        value: 2,
      },
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: 3,
        action: BasicAction.Fight,
      },
      {
        type: TagTypeDamage.DamageToInvestigator,
        value: 1,
      },
      {
        type: TagTypeDamage.DamageInsteadRange,
        from: 1,
        to: 5,
      },
      {
        type: TagTypeDamage.DamageInsteadFailRange,
        from: 1,
        to: 5,
      },
      {
        type: TagTypeSkillValue.SkillValueSucceedByDynamic,
      },
      {
        type: TagTypeSkillValue.SkillValueFailByDynamic,
      },
    ],
  },
  {
    code: "01530",
    name: "Magnifying Glass",
    text: "Fast.\nYou get +1 [intellect] while investigating.",
    tags: [
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestIntellect,
        value: 1,
        action: BasicAction.Investigate,
      },
    ],
  },
  {
    code: "01531",
    name: "Old Book of Lore",
    text: "[action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of his or her deck for a card, draws it, and shuffles the remaining cards into his or her deck.",
    tags: [
      {
        type: TagTypeCostAction.CostActionExhaustSelf,
      },
      {
        type: TagTypeLocationYour.LocationYourInvestigator,
      },
      {
        type: TagTypeDeckSearch.DeckSearchInvestigator,
        range: {
          type: "top",
          cards: 3,
        },
      },
      {
        type: TagTypeDeckDraw.DeckDrawInvestigator,
        value: 1,
      },
    ],
  },
  {
    code: "01532",
    name: "Research Librarian",
    text: "[reaction] After Research Librarian enters play: Search your deck for a [[Tome]] asset and add it to your hand. Shuffle your deck.",
    tags: [
      {
        type: TagTypeTimingAfter.TimingAfterEntersPlay,
      },
      {
        type: TagTypeDeckSearch.DeckSearchYou,
        range: "all",
      },
      {
        type: TagTypeTraitSupport.TraitSupportTome,
      },
    ],
  },
  {
    code: "01533",
    name: "Dr. Milan Christopher",
    text: "You get +1 [intellect].\n[reaction] After you successfully investigate: Gain 1 resource.",
    tags: [
      {
        type: TagTypeStatsModBoostPassive.StatsModBoostPassiveIntellect,
        value: 1,
      },
      {
        type: TagTypeTimingAfter.TimingAfterSuccessfullyInvestigate,
      },
      {
        type: TagTypeGainResource.GainResourceYou,
        value: 1,
      },
    ],
  },
  {
    code: "01534",
    name: "Hyperawareness",
    text: "[free] Spend 1 resource: You get +1 [intellect] for this skill test.\n[free] Spend 1 resource: You get +1 [agility] for this skill test.",
    tags: [
      {
        type: TagTypeCostFree.CostFreeSpendResource,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestIntellect,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestAgility,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModPump.StatsModPumpResource,
        valuePerPump: 1,
      },
    ],
  },
  {
    code: "01535",
    name: "Medical Texts",
    text: "[action] Choose an investigator at your location and test [intellect] (2). If you succeed, heal 1 damage from that investigator. If you fail, deal 1 damage to that investigator.",
    tags: [
      {
        type: TagTypeLocationYour.LocationYourInvestigator,
      },
      {
        type: TagTypeTestInitiate.TestInitiateIntellect,
        difficulty: 2,
      },
      {
        type: TagTypeHeal.HealDamageYou,
        value: 1,
      },
      {
        type: TagTypeDamage.DamageToInvestigator,
        value: 1,
      },
    ],
  },
  {
    code: "01536",
    name: "Mind over Matter",
    text: "Fast. Play only during your turn.\nUntil the end of the round, you may use your [intellect] in place of your [combat] and [agility].",
    tags: [
      {
        type: TagTypeTimingDuring.TimingDuringYourTurn,
      },
      {
        type: TagTypeDuration.DurationUntilEndRound,
      },
      {
        type: TagTypeBuffStatsReplace.BuffStatsReplace,
        from: SkillType.Combat,
        to: SkillType.Intellect,
      },
      {
        type: TagTypeBuffStatsReplace.BuffStatsReplace,
        from: SkillType.Agility,
        to: SkillType.Intellect,
      },
    ],
  },
  {
    code: "01537",
    name: "Working a Hunch",
    text: "Fast. Play only during your turn.\nDiscover 1 clue at your location.",
    tags: [
      {
        type: TagTypeTimingDuring.TimingDuringYourTurn,
      },
      {
        type: TagTypeClueDiscover.ClueDiscoverYourLocation,
        value: 1,
      },
      {
        type: TagTypeTestless.TestlessClue,
        value: 1,
      },
    ],
  },
  {
    code: "01538",
    name: "Barricade",
    text: "Attach to your location.\nNon-[[Elite]] enemies cannot move into attached location.\n<b>Forced</b> - When an investigator leaves attached location: Discard Barricade.",
    tags: [
      {
        type: TagTypeAttach.AttachLocation,
      },
      {
        type: TagTypeEnemyElite.EnemyEliteNonEliteOnly,
      },
      {
        type: TagTypeEnemyDebuff.EnemyCannotMoveIntoLocation,
      },
    ],
  },
  {
    code: "01539",
    name: "Deduction",
    text: "If this skill test is successful while investigating a location, discover 1 additional clue at that location.",
    tags: [
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeClueAdditional.ClueAdditionalThisLocation,
        value: 1,
      },
    ],
  },
  {
    code: "01540",
    name: "Magnifying Glass",
    text: "Fast.\nYou get +1 [intellect] while investigating.\n[free] If there are no clues on your location: Return Magnifying Glass to your hand.",
    tags: [
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestIntellect,
        value: 1,
        action: BasicAction.Investigate,
      },
      {
        type: TagTypeRecursion.RecursionAsset,
      },
      {
        type: TagTypeLocationProperty.LocationClueZero,
      },
      {
        type: TagTypePlayArea.PlayAreaToHand,
      },
    ],
  },
  {
    code: "01541",
    name: "Disc of Itzamna",
    text: "[reaction] When a non-[[Elite]] enemy spawns at your location, discard Disc of Itzamna: Discard that enemy.",
    tags: [
      {
        type: TagTypeEnemyElite.EnemyEliteNonEliteOnly,
      },
      {
        type: TagTypeTimingWhen.TimingWhenEnemySpawnsYourLocation,
      },
      {
        type: TagTypeCostReaction.CostReactionDiscardSelf,
      },
      {
        type: TagTypeEnemyMitigation.EnemyMitigationDiscard,
      },
    ],
  },
  {
    code: "01542",
    name: "Encyclopedia",
    text: "[action] Exhaust Encyclopedia: Choose an investigator at your location. That investigator gets +2 to a skill of your choice until the end of the phase.",
    tags: [
      {
        type: TagTypeCostAction.CostActionExhaustSelf,
      },
      {
        type: TagTypeLocationYour.LocationYourInvestigator,
      },
      // Boost any skill +2 - Need new tag type, or use specific skill boost tags
      {
        type: TagTypeDuration.DurationUntilEndPhase,
      },
    ],
  },
  {
    code: "01543",
    name: "Cryptic Research",
    text: "Fast. Play only during your turn.\nChoose an investigator at your location. That investigator draws 3 cards.",
    tags: [
      {
        type: TagTypeTimingPhaseSequence.PhaseInvestigationTakeAction,
        timing: TimingQualifier.When,
      },
      {
        type: TagTypeLocationYour.LocationYourInvestigator,
      },
      {
        type: TagTypeDeckDraw.DeckDrawInvestigator,
        value: 3,
      },
    ],
  },
  {
    code: "01544",
    name: "Switchblade",
    text: "Fast.\n[action]: <b>Fight.</b> If you succeed by 2 or more, this attack deals +1 damage.",
    tags: [
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeTestResult.TestSucceedBy,
        amount: 2,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
    ],
  },
  {
    code: "01545",
    name: "Burglary",
    text: "[action] Exhaust Burglary: <b>Investigate.</b> If you succeed, instead of discovering clues, gain 3 resources.",
    tags: [
      {
        type: TagTypeCostAction.CostActionExhaustSelf,
      },
      // Initiate investigate - ActionBold already covers this
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeGainResource.GainResourceYou,
        value: 3,
      },
      // instead_of_clue - This is a complex mechanic that might need a new tag type
    ],
  },
  {
    code: "01546",
    name: "Pickpocketing",
    text: "[reaction] After you evade an enemy, exhaust Pickpocketing: Draw 1 card.",
    tags: [
      // After evading enemy - Need to find more specific timing tag
      {
        type: TagTypeCostReaction.CostReactionExhaustSelf,
      },
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
    ],
  },
  {
    code: "01547",
    name: ".41 Derringer",
    text: "Uses (3 ammo).\n[action] Spend 1 ammo: <b>Fight.</b> You get +2 [combat] for this attack. If you succeed by 2 or more, this attack deals +1 damage.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingAmmo,
        value: 3,
      },
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: 2,
        action: BasicAction.Fight,
      },
      {
        type: TagTypeTestResult.TestSucceedBy,
        amount: 2,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
    ],
  },
  {
    code: "01548",
    name: "Leo De Luca",
    text: "You may take an additional action during your turn.",
    tags: [
      {
        type: TagTypeActionAdditional.ActionAdditional,
        value: 1,
      },
    ],
  },
  {
    code: "01549",
    name: "Hard Knocks",
    text: "[free] Spend 1 resource: You get +1 [combat] for this skill test.\n[free] Spend 1 resource: You get +1 [agility] for this skill test.",
    tags: [
      {
        type: TagTypeCostFree.CostFreeSpendResource,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestAgility,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModPump.StatsModPumpResource,
        valuePerPump: 1,
      },
    ],
  },
  {
    code: "01550",
    name: "Elusive",
    text: "Fast. Play only during your turn.\nDisengage from each enemy engaged with you and move to a revealed location with no enemies.",
    tags: [
      {
        type: TagTypeTimingPhaseSequence.PhaseInvestigationTakeAction,
        timing: TimingQualifier.When,
      },
      {
        type: TagTypeEnemyEngage.EnemyEngageWithYou,
      },
      // disengage - Need to check if there's a disengage tag
      {
        type: TagTypeLocationMove.LocationMoveInvestigatorSelf,
      },
    ],
  },
  {
    code: "01551",
    name: "Backstab",
    text: "<b>Fight.</b> This attack uses [agility] instead of [combat]. This attack deals +2 damage.",
    tags: [
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeBuffStatsReplace.BuffStatsReplace,
        from: SkillType.Agility,
        to: SkillType.Combat,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 2,
      },
    ],
  },
  {
    code: "01552",
    name: "Sneak Attack",
    text: "Deal 2 damage to an exhausted enemy at your location.",
    tags: [
      {
        type: TagTypeTestless.TestlessDamageYourLocation,
        value: 2,
      },
      {
        type: TagTypeLocationYour.LocationYourEnemy,
      },
      // exhausted_enemy - Might need new tag type for exhausted enemy condition
    ],
  },
  {
    code: "01553",
    name: "Opportunist",
    text: "Commit only to a skill test you are performing.\nIf you succeed by 3 or more, return Opportunist to your hand after this test instead of discarding it.",
    tags: [
      {
        type: TagTypeTestMisc.TestYouPerform,
      },
      {
        type: TagTypeTestResult.TestSucceedBy,
        amount: 3,
      },
      // to_hand_from_commit - Might need new tag type
    ],
  },
  {
    code: "01554",
    name: "Leo De Luca",
    text: "You may take an additional action during your turn.",
    tags: [
      {
        type: TagTypeActionAdditional.ActionAdditional,
        value: 1,
      },
    ],
  },
  {
    code: "01555",
    name: "Cat Burglar",
    text: "You get +1 [agility].\n[action] Exhaust Cat Burglar: Disengage from each enemy engaged with you and move to a connecting location. This action does not provoke attacks of opportunity.",
    tags: [
      {
        type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAgility,
        value: 1,
      },
      {
        type: TagTypeCostAction.CostActionExhaustSelf,
      },
      {
        type: TagTypeEnemyEngage.EnemyEngageWithYou,
      },
      // disengage - Need tag type
      {
        type: TagTypeLocationMove.LocationMoveInvestigatorSelf,
      },
      // not_aoo - Need tag type
    ],
  },
  {
    code: "01556",
    name: "Sure Gamble",
    text: 'Fast. Play after you reveal a chaos token with a negative modifier.\nSwitch that token\'s "-" to a "+".',
    tags: [
      // After revealing chaos token - Need specific timing tag
      {
        type: TagTypeChaosEffect.ChaosEffectModifier,
      },
    ],
  },
  {
    code: "01557",
    name: "Hot Streak",
    text: "Gain 10 resources.",
    tags: [
      {
        type: TagTypeGainResource.GainResourceYou,
        value: 10,
      },
    ],
  },
  {
    code: "01558",
    name: "Forbidden Knowledge",
    text: "Uses (4 secrets). If Forbidden Knowledge has no secrets, discard it.\n[free] Exhaust Forbidden Knowledge and take 1 horror: Move 1 secret from Forbidden Knowledge to your resource pool, as a resource.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingSecret,
        value: 4,
      },
      {
        type: TagTypeDiscardFromPlay.DiscardFromPlaySelfNoUses,
      },
      {
        type: TagTypeCostFree.CostFreeExhaustSelf,
      },
      // Take horror as cost - Need new tag type
      {
        type: TagTypeUsesSupport.UsesSupportSecret,
        supportType: "move",
      },
    ],
  },
  {
    code: "01559",
    name: "Holy Rosary",
    text: "You get +1 [willpower].",
    tags: [
      {
        type: TagTypeStatsModBoostPassive.StatsModBoostPassiveWillpower,
        value: 1,
      },
    ],
  },
  {
    code: "01560",
    name: "Shrivelling",
    text: "Uses (4 charges).\n[action] Spend 1 charge: <b>Fight.</b> This attack uses [willpower] instead of [combat] and deals +1 damage. If a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbol is revealed during this check, take 1 horror.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingCharge,
        value: 4,
      },
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeBuffStatsReplace.BuffStatsReplace,
        from: SkillType.Willpower,
        to: SkillType.Combat,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenSkull,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenCultist,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenTablet,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenElderThing,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenAutoFail,
      },
      // Take horror when revealing chaos tokens - Need new tag type
    ],
  },
  {
    code: "01561",
    name: "Scrying",
    text: "Uses (3 charges).\n[action] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck or the encounter deck. Return them to the top of that deck in any order.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingCharge,
        value: 3,
      },
      {
        type: TagTypeCostAction.CostActionExhaustSelf,
      },
      // look_at_encounter - Need tag type
      // look_at_investigator - Need tag type
      // order_encounter - Need tag type
      // order_investigator - Need tag type
    ],
  },
  {
    code: "01562",
    name: "Arcane Studies",
    text: "[free] Spend 1 resource: You get +1 [willpower] for this skill test.\n[free] Spend 1 resource: You get +1 [intellect] for this skill test.",
    tags: [
      {
        type: TagTypeCostFree.CostFreeSpendResource,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestWillpower,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestIntellect,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModPump.StatsModPumpResource,
        valuePerPump: 1,
      },
    ],
  },
  {
    code: "01563",
    name: "Arcane Initiate",
    text: "<b>Forced</b> - After Arcane Initiate enters play: Place 1 doom on it.\n[free] Exhaust Arcane Initiate: Search the top 3 cards of your deck for a [[Spell]] card and draw it. Shuffle your deck.",
    tags: [
      {
        type: TagTypeTimingAfter.TimingAfterEntersPlay,
      },
      {
        type: TagTypeDoom.DoomAdd,
      },
      {
        type: TagTypeCostFree.CostFreeExhaustSelf,
      },
      {
        type: TagTypeDeckSearch.DeckSearchYou,
        range: {
          type: "top",
          cards: 3,
        },
      },
      {
        type: TagTypeTraitSupport.TraitSupportSpell,
      },
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
      {
        type: TagTypeDeckShuffle.DeckShufflePlayer,
      },
    ],
  },
  {
    code: "01564",
    name: "Drawn to the Flame",
    text: "Draw the top card of the encounter deck. Then, discover 2 clues at your location.",
    tags: [
      // encounter_draw - Need tag type
      {
        type: TagTypeClueDiscover.ClueDiscoverYourLocation,
        value: 2,
      },
      {
        type: TagTypeTestless.TestlessClue,
        value: 2,
      },
    ],
  },
  {
    code: "01565",
    name: "Ward of Protection",
    text: "Fast. Play when you draw a non-weakness treachery card.\nCancel that card's revelation effect. Then, take 1 horror.",
    tags: [
      // timing_fast_when_draw_treachery - Need tag type
      // cancel_revelation - Need tag type
      // Take horror - Need tag type
    ],
  },
  {
    code: "01566",
    name: "Blinding Light",
    text: "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 1 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbol is revealed during this evasion attempt, lose 1 action this turn.",
    tags: [
      {
        type: TagTypeActionBold.ActionBoldEvade,
      },
      {
        type: TagTypeBuffStatsReplace.BuffStatsReplace,
        from: SkillType.Willpower,
        to: SkillType.Agility,
      },
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenSkull,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenCultist,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenTablet,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenElderThing,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenAutoFail,
      },
      {
        type: TagTypeActionLose.ActionLoseAction,
      },
    ],
  },
  {
    code: "01567",
    name: "Fearless",
    text: "If this skill test is successful, heal 1 horror.",
    tags: [
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeHeal.HealHorrorYou,
        value: 1,
      },
    ],
  },
  {
    code: "01568",
    name: "Mind Wipe",
    text: "Fast. Play after a phase begins.\nChoose a non-[[Elite]] enemy at your location. Treat the chosen enemy's printed text box as if it were blank (except for [[Traits]]) until the end of the phase.",
    tags: [
      {
        type: TagTypeTimingPhaseSequence.PhaseInvestigationBegins,
        timing: TimingQualifier.After,
      },
      {
        type: TagTypeDuration.DurationUntilEndPhase,
      },
      {
        type: TagTypeEnemyElite.EnemyEliteNonEliteOnly,
      },
      {
        type: TagTypeLocationYour.LocationYourEnemy,
      },
      // blank text box - Need tag type
    ],
  },
  {
    code: "01569",
    name: "Blinding Light",
    text: "<b>Evade.</b> This evasion attempt uses [willpower] instead of [agility]. If you succeed, deal 2 damage to the enemy just evaded. If a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbol is revealed during this evasion attempt, lose 1 action this turn and take 1 horror.",
    tags: [
      {
        type: TagTypeActionBold.ActionBoldEvade,
      },
      {
        type: TagTypeBuffStatsReplace.BuffStatsReplace,
        from: SkillType.Willpower,
        to: SkillType.Agility,
      },
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 2,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenSkull,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenCultist,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenTablet,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenElderThing,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenAutoFail,
      },
      {
        type: TagTypeActionLose.ActionLoseAction,
      },
      // Take horror when revealing chaos tokens - Need new tag type
    ],
  },
  {
    code: "01570",
    name: "Book of Shadows",
    text: "You have 1 additional arcane slot.\n[action] Exhaust Book of Shadows: Add 1 charge to a [[Spell]] asset you control.",
    tags: [
      {
        type: TagTypeSlotAdditional.SlotAdditionalArcane,
      },
      {
        type: TagTypeCostAction.CostActionExhaustSelf,
      },
      {
        type: TagTypeTraitSupport.TraitSupportSpell,
      },
      {
        type: TagTypeUsesSupport.UsesSupportCharge,
        supportType: "place",
      },
    ],
  },
  {
    code: "01571",
    name: "Grotesque Statue",
    text: "Uses (4 charges). If Grotesque Statue has no charges, discard it.\n[reaction] When you would reveal a chaos token, spend 1 charge: Reveal 2 chaos tokens instead of 1. Choose 1 of those tokens to resolve, and ignore the other.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingCharge,
        value: 4,
      },
      {
        type: TagTypeDiscardFromPlay.DiscardFromPlaySelfNoUses,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealMore,
      },
      {
        type: TagTypeChaosEffect.ChaosEffectResolveChoose,
      },
      // timing_reaction_chaos_reveal_would - Need tag type
    ],
  },
  {
    code: "01572",
    name: "Leather Coat",
    text: "Health: 2. You get +1 soak.",
    tags: [
      // soak - Need tag type or might be implicit from Health/Sanity
    ],
  },
  {
    code: "01573",
    name: "Scavenging",
    text: "[reaction] After you successfully investigate by 2 or more, exhaust Scavenging: Choose an [[Item]] card in your discard pile and add it to your hand.",
    tags: [
      {
        type: TagTypeTimingAfter.TimingAfterSuccessfullyInvestigate,
      },
      {
        type: TagTypeCostReaction.CostReactionExhaustSelf,
      },
      {
        type: TagTypeTestResult.TestSucceedBy,
        amount: 2,
      },
      {
        type: TagTypeTraitSupport.TraitSupportItem,
      },
      // to_hand_from_discard - Need tag type
    ],
  },
  {
    code: "01574",
    name: "Baseball Bat",
    text: "[action]: <b>Fight.</b> You get +2 [combat] for this attack. This attack deals +1 damage. If a [skull] or [auto_fail] symbol is revealed during this attack, discard Baseball Bat after the attack resolves.",
    tags: [
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: 2,
        action: BasicAction.Fight,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenSkull,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenAutoFail,
      },
      {
        type: TagTypeDiscardFromPlay.DiscardFromPlaySelf,
      },
    ],
  },
  {
    code: "01575",
    name: "Rabbit's Foot",
    text: "[reaction] After you fail a skill test, exhaust Rabbit's Foot: Draw 1 card.",
    tags: [
      {
        type: TagTypeCostReaction.CostReactionExhaustSelf,
      },
      {
        type: TagTypeSkillTestCondition.SkillTestConditionFail,
      },
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
    ],
  },
  {
    code: "01576",
    name: "Stray Cat",
    text: "[free] Discard Stray Cat: Automatically evade a non-[[Elite]] enemy at your location.",
    tags: [
      {
        type: TagTypeCostFree.CostFreeDiscardSelf,
      },
      {
        type: TagTypeAuto.AutoEvade,
      },
      {
        type: TagTypeTestless.TestlessEvade,
      },
      {
        type: TagTypeEnemyElite.EnemyEliteNonEliteOnly,
      },
      {
        type: TagTypeLocationYour.LocationYourEnemy,
      },
    ],
  },
  {
    code: "01577",
    name: "Dig Deep",
    text: "[free] Spend 1 resource: You get +1 [willpower] for this skill test.\n[free] Spend 1 resource: You get +1 [agility] for this skill test.",
    tags: [
      {
        type: TagTypeCostFree.CostFreeSpendResource,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestWillpower,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestAgility,
        value: "dynamic",
      },
      {
        type: TagTypeStatsModPump.StatsModPumpResource,
        valuePerPump: 1,
      },
    ],
  },
  {
    code: "01578",
    name: "Cunning Distraction",
    text: "<b>Evade.</b> Automatically evade all enemies at your location.",
    tags: [
      {
        type: TagTypeActionBold.ActionBoldEvade,
      },
      {
        type: TagTypeAuto.AutoEvade,
      },
      {
        type: TagTypeTestless.TestlessEvade,
      },
      {
        type: TagTypeLocationYour.LocationYourEnemy,
      },
    ],
  },
  {
    code: "01579",
    name: '"Look what I found!"',
    text: "Fast. Play after you fail a skill test by 2 or less while investigating.\nDiscover 2 clues in your location.",
    tags: [
      {
        type: TagTypeSkillTestCondition.SkillTestConditionFail,
      },
      {
        type: TagTypeTestResult.TestFailBy,
        amount: 2,
      },
      {
        type: TagTypeClueDiscover.ClueDiscoverYourLocation,
        value: 2,
      },
      {
        type: TagTypeTestless.TestlessClue,
        value: 2,
      },
    ],
  },
  {
    code: "01580",
    name: "Lucky!",
    text: "Fast. Play when you would fail a skill test.\nGet +2 to your skill value for that test.",
    tags: [
      // timing_fast_would_fail - Need tag type
      // Boost any +2 - Need new tag type
    ],
  },
  {
    code: "01581",
    name: "Survival Instinct",
    text: "If this skill test is successful during an evasion attempt, the evading investigator may immediately disengage from each other enemy engaged with him or her, and may move to a connecting location.",
    tags: [
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      // disengage - Need tag type
      {
        type: TagTypeLocationMove.LocationMoveInvestigatorAny,
      },
    ],
  },
  {
    code: "01582",
    name: "Aquinnah",
    text: "[reaction] When an enemy attacks you, exhaust Aquinnah and deal 1 horror to her: Deal that enemy's damage to another enemy at your location, instead. (You still take horror dealt by the attack.)",
    tags: [
      {
        type: TagTypeTimingWhen.TimingWhenEnemyAttacks,
      },
      {
        type: TagTypeCostReaction.CostReactionExhaustSelf,
      },
      // Deal horror as cost - Need new tag type
      {
        type: TagTypeEnemyValue.EnemyValueDamage,
      },
      {
        type: TagTypeLocationYour.LocationYourEnemy,
      },
      // redirect_damage - Need tag type
    ],
  },
  {
    code: "01583",
    name: "Close Call",
    text: "Fast. Play after a non-weakness, non-[[Elite]] enemy at your location is evaded.\nShuffle that enemy into the encounter deck.",
    tags: [
      // After enemy evaded - Need specific timing tag
      {
        type: TagTypeEnemyElite.EnemyEliteNonEliteOnly,
      },
      {
        type: TagTypeLocationYour.LocationYourEnemy,
      },
      {
        type: TagTypeDeckShuffle.DeckShuffleEncounter,
      },
      // enemy_manage_shuffle - This might be a specific tag for shuffling enemy into encounter deck
    ],
  },
  {
    code: "01584",
    name: "Lucky!",
    text: "Fast. Play when you would fail a skill test.\nGet +2 to your skill value for that test. Draw 1 card.",
    tags: [
      // timing_fast_would_fail - Need tag type
      // Boost any +2 - Need new tag type
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
    ],
  },
  {
    code: "01585",
    name: "Will to Survive",
    text: "Fast. Play only during your turn.\nUntil the end of your turn, do not reveal chaos tokens for any skill tests you perform.",
    tags: [
      {
        type: TagTypeTimingPhaseSequence.PhaseInvestigationTakeAction,
        timing: TimingQualifier.When,
      },
      {
        type: TagTypeChaosEffect.ChaosEffectDoNotReveal,
      },
      {
        type: TagTypeDuration.DurationUntilEndTurn,
      },
    ],
  },
  {
    code: "01586",
    name: "Knife",
    text: "[action]: <b>Fight.</b> You get +1 [combat] for this attack.\n[action] Discard Knife: <b>Fight.</b> You get +2 [combat] for this attack. This attack deals +1 damage.",
    tags: [
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: 1,
        action: BasicAction.Fight,
      },
      {
        type: TagTypeCostAction.CostActionDiscardSelf,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: 2,
        action: BasicAction.Fight,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
    ],
  },
  {
    code: "01587",
    name: "Flashlight",
    text: "Uses (3 supplies).\n[action] Spend 1 supply: <b>Investigate.</b> Your location gets -2 shroud for this investigation.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingSupply,
        value: 3,
      },
      {
        type: TagTypeActionBold.ActionBoldInvestigate,
      },
      {
        type: TagTypeLocationShroud.LocationShroudMinus2,
      },
    ],
  },
  {
    code: "01588",
    name: "Emergency Cache",
    text: "Gain 3 resources.",
    tags: [
      {
        type: TagTypeGainResource.GainResourceYou,
        value: 3,
      },
    ],
  },
  {
    code: "01589",
    name: "Guts",
    text: "Max 1 committed per skill test.\nIf this test is successful, draw 1 card.",
    tags: [
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
      // max_1_commit - Need tag type
    ],
  },
  {
    code: "01590",
    name: "Perception",
    text: "Max 1 committed per skill test.\nIf this test is successful, draw 1 card.",
    tags: [
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
      // max_1_commit - Need tag type
    ],
  },
  {
    code: "01591",
    name: "Overpower",
    text: "Max 1 committed per skill test.\nIf this test is successful, draw 1 card.",
    tags: [
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
      // max_1_commit - Need tag type
    ],
  },
  {
    code: "01592",
    name: "Manual Dexterity",
    text: "Max 1 committed per skill test.\nIf this test is successful, draw 1 card.",
    tags: [
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
      // max_1_commit - Need tag type
    ],
  },
  {
    code: "01593",
    name: "Unexpected Courage",
    text: "Max 1 committed per skill test.",
    tags: [
      // max_1_commit - Need tag type
    ],
  },
  {
    code: "01594",
    name: "Bulletproof Vest",
    text: "Health: 2. You get +1 soak.",
    tags: [
      // soak - Need tag type or might be implicit from Health/Sanity
    ],
  },
  {
    code: "01595",
    name: "Elder Sign Amulet",
    text: "Sanity: 1. You get +1 soak.",
    tags: [
      // soak - Need tag type or might be implicit from Health/Sanity
    ],
  },
  {
    code: "01683",
    name: "First Aid",
    text: "Uses (4 supplies). If First Aid has no supplies, discard it.\n[action] Spend 1 supply: Heal 1 damage and 1 horror from an investigator or [[Ally]] asset in your location.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingSupply,
        value: 4,
      },
      {
        type: TagTypeDiscardFromPlay.DiscardFromPlaySelfNoUses,
      },
      {
        type: TagTypeHeal.HealDamageInvestigator,
        value: 1,
      },
      {
        type: TagTypeHeal.HealHorrorInvestigator,
        value: 1,
      },
      // heal_damage_ally - Need tag type
      // heal_horror_ally - Need tag type
      {
        type: TagTypeTraitSupport.TraitSupportAlly,
      },
      {
        type: TagTypeLocationYour.LocationYourInvestigator,
      },
    ],
  },
  {
    code: "01684",
    name: '"I\'ve had worse…"',
    text: "Fast. Play when you are dealt damage and/or horror.\nCancel up to 5 damage and/or horror just dealt to you. Then, gain that many resources.",
    tags: [
      // timing_fast_dealt_damage - Need tag type
      // timing_fast_dealt_horror - Need tag type
      // cancel_damage - Need tag type
      // cancel_horror - Need tag type
      {
        type: TagTypeGainResource.GainResourceYou,
        value: -1, // variable
      },
    ],
  },
  {
    code: "01685",
    name: "Seeking Answers",
    text: "<b>Investigate.</b> If you succeed, instead of discovering a clue at your location, discover 2 total clues from among your location and connecting locations.",
    tags: [
      // Initiate investigate - ActionBold already covers this
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeClueDiscover.ClueDiscoverYourLocation,
        value: 2,
      },
      {
        type: TagTypeClueDiscover.ClueDiscoverConnectingLocation,
        value: 2,
      },
    ],
  },
  {
    code: "01686",
    name: "Old Book of Lore",
    text: "Uses (2 secrets).\n[action] Exhaust Old Book of Lore: Choose an investigator at your location. That investigator searches the top 3 cards of their deck for a card, draws it, and shuffles their deck. Then, you may spend 1 secret to have that investigator immediately play that card, reducing its cost by 2.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingSecret,
        value: 2,
      },
      {
        type: TagTypeCostAction.CostActionExhaustSelf,
      },
      {
        type: TagTypeLocationYour.LocationYourInvestigator,
      },
      {
        type: TagTypeDeckSearch.DeckSearchInvestigator,
        range: {
          type: "top",
          cards: 3,
        },
      },
      {
        type: TagTypeDeckDraw.DeckDrawInvestigator,
        value: 1,
      },
      {
        type: TagTypeDeckShuffle.DeckShufflePlayer,
      },
      {
        type: TagTypeCostDiscount.CostDiscount,
        amount: 2,
      },
      // immediately_play - Need tag type
    ],
  },
  {
    code: "01687",
    name: "Lockpicks",
    text: "Uses (3 supplies). If Lockpicks has no supplies, discard it.\n[action] Exhaust Lockpicks: <b>Investigate.</b> Add your [agility] value to your skill value for this investigation. If you do not succeed by at least 2, remove 1 supply from Lockpicks.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingSupply,
        value: 3,
      },
      {
        type: TagTypeDiscardFromPlay.DiscardFromPlaySelfNoUses,
      },
      {
        type: TagTypeCostAction.CostActionExhaustSelf,
      },
      {
        type: TagTypeActionBold.ActionBoldInvestigate,
      },
      // stat_add_agility_for_investigate - Need tag type
      {
        type: TagTypeTestResult.TestSucceedBy,
        amount: 2,
      },
    ],
  },
  {
    code: "01688",
    name: ".41 Derringer",
    text: "Uses (3 ammo).\n[action] Spend 1 ammo: <b>Fight.</b> You get +2 [combat] for this attack. If you succeed by 1 or more, this attack deals +1 damage. Once per turn, if you succeed by 3 or more, you may take an additional action this turn.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingAmmo,
        value: 3,
      },
      {
        type: TagTypeActionBold.ActionBoldFight,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestCombat,
        value: 2,
        action: BasicAction.Fight,
      },
      {
        type: TagTypeTestResult.TestSucceedBy,
        amount: 1,
      },
      {
        type: TagTypeDamage.DamagePlus,
        value: 1,
      },
      {
        type: TagTypeTestResult.TestSucceedBy,
        amount: 3,
      },
      {
        type: TagTypeActionAdditional.ActionAdditional,
        value: 1,
      },
      // once_per_turn - Need tag type
    ],
  },
  {
    code: "01689",
    name: "Rite of Seeking",
    text: "Uses (3 charges).\n[action] Spend 1 charge: <b>Investigate.</b> Investigate using [willpower] instead of [intellect]. You get +2 [willpower] for this test. If you succeed you discover 1 additional clue at this location. If a [skull], [cultist], [tablet], [elder_thing], or [auto_fail] symbol is revealed during this test, after this test resolves lose all remaining actions and immediately end your turn.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingCharge,
        value: 3,
      },
      {
        type: TagTypeActionBold.ActionBoldInvestigate,
      },
      {
        type: TagTypeBuffStatsReplace.BuffStatsReplace,
        from: SkillType.Willpower,
        to: SkillType.Intellect,
      },
      {
        type: TagTypeStatsModBoostInTest.StatsModBoostInTestWillpower,
        value: 2,
        action: BasicAction.Investigate,
      },
      {
        type: TagTypeSkillTestCondition.SkillTestConditionSuccessful,
      },
      {
        type: TagTypeClueAdditional.ClueAdditionalThisLocation,
        value: 1,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenSkull,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenCultist,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenTablet,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenElderThing,
      },
      {
        type: TagTypeChaosReveal.ChaosRevealTokenAutoFail,
      },
      {
        type: TagTypeActionLose.ActionLoseAction,
      },
      // end_your_turn - Need tag type
    ],
  },
  {
    code: "01690",
    name: "Scrying",
    text: "Uses (3 charges).\n[free] Exhaust Scrying and spend 1 charge: Look at the top 3 cards of any investigator's deck, or the encounter deck. Return them to the top of that deck, in any order. If a [[Terror]] or [[Omen]] card is among the looked-at cards, take 1 horror.",
    tags: [
      {
        type: TagTypeUsesStarting.UsesStartingCharge,
        value: 3,
      },
      {
        type: TagTypeCostFree.CostFreeExhaustSelf,
      },
      // look_at_encounter - Need tag type
      // look_at_investigator - Need tag type
      // order_encounter - Need tag type
      // order_investigator - Need tag type
      // Take horror when revealing Terror/Omen - Need new tag type
    ],
  },
  {
    code: "01691",
    name: "Aquinnah",
    text: "[reaction] When an enemy attacks you, exhaust Aquinnah and deal 1 horror to her: Deal that enemy's damage to any enemy at your location, instead. (You still take horror dealt by the attack.)",
    tags: [
      {
        type: TagTypeTimingWhen.TimingWhenEnemyAttacks,
      },
      {
        type: TagTypeCostReaction.CostReactionExhaustSelf,
      },
      // Deal horror as cost - Need new tag type
      {
        type: TagTypeEnemyValue.EnemyValueDamage,
      },
      {
        type: TagTypeLocationYour.LocationYourEnemy,
      },
      // redirect_damage - Need tag type
    ],
  },
  {
    code: "01692",
    name: "Eucatastrophe",
    text: "Fast. Play when you reveal a chaos token that would reduce your skill value to 0 during a skill test (including the [auto_fail] token).\nCancel that token and treat it as an [elder_sign] token, instead.",
    tags: [
      // After revealing chaos token that would reduce skill to 0 - Need specific timing tag
      // cancel_chaos - Need tag type
      {
        type: TagTypeChaosEffect.ChaosEffectModifier,
      },
      {
        type: TagTypeChaosEffect.ChaosEffectTreatAsElderSign,
      },
    ],
  },
  {
    code: "01693",
    name: "Emergency Cache",
    text: "Gain 3 resources and draw 1 card.",
    tags: [
      {
        type: TagTypeGainResource.GainResourceYou,
        value: 3,
      },
      {
        type: TagTypeDeckDraw.DeckDrawYou,
        value: 1,
      },
    ],
  },
  {
    code: "01694",
    name: "Charisma",
    text: "Permanent.\nYou have 1 additional ally slot.",
    tags: [
      {
        type: TagTypeSlotAdditional.SlotAdditionalAlly,
      },
    ],
  },
  {
    code: "01695",
    name: "Relic Hunter",
    text: "Permanent.\nYou have 1 additional accessory slot.",
    tags: [
      {
        type: TagTypeSlotAdditional.SlotAdditionalAccessory,
      },
    ],
  },
];
export default taggedCards;
