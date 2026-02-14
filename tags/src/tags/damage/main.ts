import { TagBase } from "../../base.js";

export enum TagTypeDamage {
  DamagePlus = "damage-plus",
  DamageInsteadRange = "damage-instead-range",
  DamageInsteadFailRange = "damage-instead-fail-range",
  DamageToInvestigator = "damage-to-investigator",
}

interface TagDamageBase extends TagBase {}

export interface TagDamagePlus extends TagDamageBase {
  type: TagTypeDamage.DamagePlus;
  value: number;
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
  value: number;
}
