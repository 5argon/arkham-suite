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
