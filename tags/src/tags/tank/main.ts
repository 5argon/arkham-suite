import { TagBase } from "../../base.js";

export enum TagTypeTank {
  TankRedirectAttack = "tank-redirect-attack",
  TankRedirectEncounter = "tank-redirect-encounter",
  TankRedirectDamageHorror = "tank-redirect-damage-horror",
  TankMoveDamageHorror = "tank-move-damage-horror",
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

/**
 * Relocate EXISTING damage/horror tokens between player cards — not incoming
 * damage (that's tank-redirect-*) and not removal (that's heal-*).
 * scope "cross-investigator" = tokens move between two investigators' cards
 * (Solemn Vow — the owner soaks the controller's tokens; future members: Devil
 * (FHV), Lucky Charm (Core 2026)); scope "self" = shuffling within your own
 * board (Tommy Muldoon's elder sign). Only the cross-investigator scope is
 * protective (ProtectorTank/Support compounds filter on it).
 */
export interface TagTankMoveDamageHorror extends TagTankBase {
  type: TagTypeTank.TankMoveDamageHorror;
  scope?: "cross-investigator" | "self";
}
