import { TagBase } from "../../base.js";

export enum TagTypeStatsModPump {
  StatsModPumpResource = "stats-mod-pump-resource",
  StatsModPumpCharge = "stats-mod-pump-charge",
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
