import { TagBase } from "../../base.js";

export enum TagTypeStatsModPump {
  StatsModPumpResource = "stats-mod-pump-resource",
  StatsModPumpUses = "stats-mod-pump-uses",
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


/**
 * The pump spends USE tokens from the card — `useType` names the pool: ammo (M1918 BAR,
 * Gatling Gun), charge (Enchanted Blade, Blade of Yoth), secret (The Necronomicon), offering
 * (Soul Sanctification). Ammo ≠ charge, as in the cost-*-spend families.
 */
export interface TagStatsModPumpUses extends TagStatsModPumpBase {
  type: TagTypeStatsModPump.StatsModPumpUses;
  useType: string;
}
