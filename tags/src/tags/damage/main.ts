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
 * is the total spreadable amount ("dynamic" for X).
 */
export interface TagDamageSpread extends TagDamageBase {
  type: TagTypeDamage.DamageSpread;
  value: DynamicValue;
}
