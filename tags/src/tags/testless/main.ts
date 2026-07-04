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
