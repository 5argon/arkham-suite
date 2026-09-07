import { TagBase } from "../../base.js";

export enum TagTypeStatsModPump {
  StatsModPumpResource = "stats-mod-pump-resource",
  StatsModPumpCharge = "stats-mod-pump-charge",
  StatsModPumpAmmo = "stats-mod-pump-ammo",
}

interface TagStatsModPumpBase extends TagBase {
  valuePerPump: number;
}

/**
 * Pump means the more you spend the more you get the stats mod.
 */
export interface TagStatsModPumpResource extends TagStatsModPumpBase {
  type: TagTypeStatsModPump.StatsModPumpResource;
}

export interface TagStatsModPumpCharge extends TagStatsModPumpBase {
  type: TagTypeStatsModPump.StatsModPumpCharge;
}

/**
 * The pump spends AMMO ("Spend 1-5 ammo: Fight. You get +X [combat]" — M1918 BAR,
 * Gatling Gun). Ammo ≠ charge, as in the cost-*-spend families.
 */
export interface TagStatsModPumpAmmo extends TagStatsModPumpBase {
  type: TagTypeStatsModPump.StatsModPumpAmmo;
}
