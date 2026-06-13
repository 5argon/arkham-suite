import { TagBase } from "../../base.js";

export enum TagTypeTank {
  TankRedirectAttack = "tank-redirect-attack",
  TankRedirectEncounter = "tank-redirect-encounter",
  TankRedirectDamageHorror = "tank-redirect-damage-horror",
}

interface TagTankBase extends TagBase {}

/** Resolve an enemy attack against you instead of another investigator. */
export interface TagTankRedirectAttack extends TagTankBase {
  type: TagTypeTank.TankRedirectAttack;
}

/** Take another investigator's encounter card instead of them. */
export interface TagTankRedirectEncounter extends TagTankBase {
  type: TagTypeTank.TankRedirectEncounter;
}

/** Accept damage/horror dealt to others (e.g. at your location) onto yourself. */
export interface TagTankRedirectDamageHorror extends TagTankBase {
  type: TagTypeTank.TankRedirectDamageHorror;
}
