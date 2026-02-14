import { CompoundTagBase } from "../base.js";
import { TagTypeClueAdditional } from "../tags/clue/additional.js";
import { TagTypeLocationShroud } from "../tags/location/shroud.js";
import { TagTypeTestless } from "../tags/testless/index.js";
import { TagTypeClueDiscover } from "../tags/clue/discover.js";
import {
  TagTypeCostFast,
  TagTypeCostFree,
  TagTypeCostReaction,
} from "../tags/cost/index.js";
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

export enum CompoundTagType {
  Thorns = "thorns",
  DiscardSelf = "discard-self",
  Support = "support",
  ClueTech = "clue-tech",
  ShroudReduction = "shroud-reduction",
  SpendResource = "spend-resource",
  AttackMitigation = "attack-mitigation",
  SucceedBy = "succeed-by",
  FailBy = "fail-by",
  Investigate = "investigate",
  EnemyFieldControl = "enemy-field-control",
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

export const compoundTagDiscardSelf: CompoundTagBase = {
  type: CompoundTagType.DiscardSelf,
  tags: [
    TagTypeCostFree.CostFreeDiscardSelf,
    TagTypeCostFast.CostFastDiscardSelf,
    TagTypeDiscardFromPlay.DiscardFromPlaySelf,
  ],
};

/**
 * Provide support for those who performs the investigate action.
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
    TagTypeHeal.HealDamageInvestigator,
    TagTypeHeal.HealHorrorInvestigator,
    TagTypeHeal.HealDamageAlly,
    TagTypeHeal.HealHorrorAlly,
  ],
};

/**
 * Compound tag for clue-finding technology.
 * Groups tags related to discovering clues in various ways.
 */
export const compoundTagClueTech: CompoundTagBase = {
  type: CompoundTagType.ClueTech,
  tags: [
    TagTypeClueAdditional.ClueAdditionalAdjacentLocations,
    TagTypeClueAdditional.ClueAdditionalRevealedLocations,
    TagTypeClueAdditional.ClueAdditionalThisLocation,
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
];
