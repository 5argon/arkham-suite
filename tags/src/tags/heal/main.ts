import { TagBase } from "../../base.js";

export enum TagTypeHeal {
  HealDamageYou = "heal-damage-you",
  HealDamageInvestigator = "heal-damage-investigator",
  HealDamageAlly = "heal-damage-ally",
  HealHorrorYou = "heal-horror-you",
  HealHorrorInvestigator = "heal-horror-investigator",
  HealHorrorAlly = "heal-horror-ally",
}

interface TagHealBase extends TagBase {
  value: number;
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

export interface TagHealHorrorYou extends TagHealBase {
  type: TagTypeHeal.HealHorrorYou;
}

export interface TagHealHorrorInvestigator extends TagHealBase {
  type: TagTypeHeal.HealHorrorInvestigator;
}

export interface TagHealHorrorAlly extends TagHealBase {
  type: TagTypeHeal.HealHorrorAlly;
}
