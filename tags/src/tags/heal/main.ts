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
