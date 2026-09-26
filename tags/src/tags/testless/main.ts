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
  TestlessMoveEnemy = "testless-move-enemy",
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

/**
 * An enemy is evaded without any evasion attempt against IT — Stray Cat, or the extra enemies
 * Survival Instinct / Fire Extinguisher evade after one successful test. An auto-evade that
 * follows the card's own test of that same enemy is auto-evade only.
 */
export interface TagTestlessEvade extends TagTestlessBase {
  type: TagTypeTestless.TestlessEvade;
}

/** Deal damage with no test to the enemy you just EVADED (only that enemy, not any at your location) — e.g. Blinding Light. */
export interface TagTestlessDamageEvadedEnemy extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageEvadedEnemy;
}

/** Deal testless damage to an enemy ENGAGED with you outside an attack — the one that just engaged you (Zoey's Cross) or ones you engage (Taunt (3), Mano a Mano) — not every enemy at your location (testless-damage-your-location-multiple). */
export interface TagTestlessDamageEngagedEnemy extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageEngagedEnemy;
}

/** Move an enemy AWAY from you with no test (Warning Shot, Pete's Guitar, Flute of the Outer Gods) — the testless half of enemy displacement. */
export interface TagTestlessMoveEnemy extends TagTestlessBase {
  type: TagTypeTestless.TestlessMoveEnemy;
}
