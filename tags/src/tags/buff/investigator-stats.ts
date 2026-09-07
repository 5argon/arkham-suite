import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeBuffInvestigatorStats {
  BuffInvestigatorHealth = "buff-investigator-health",
  BuffInvestigatorSanity = "buff-investigator-sanity",
}

interface TagBuffInvestigatorStatsBase extends TagBase {
  /** The amount raised; "dynamic" when it scales (parallel Daisy: +1 sanity per Tome). */
  value: DynamicValue;
}

/**
 * Raises the investigator's own maximum health ("You get +1 health" — Five of
 * Pentacles). The investigator counterpart of BuffAssetHealth; distinct from
 * soak (assets absorbing in your place) and heal (restoring, not raising).
 */
export interface TagBuffInvestigatorHealth extends TagBuffInvestigatorStatsBase {
  type: TagTypeBuffInvestigatorStats.BuffInvestigatorHealth;
}

/**
 * Sanity counterpart of BuffInvestigatorHealth: raises the investigator's own
 * maximum sanity (Five of Pentacles, Hawk-Eye Folding Camera).
 */
export interface TagBuffInvestigatorSanity extends TagBuffInvestigatorStatsBase {
  type: TagTypeBuffInvestigatorStats.BuffInvestigatorSanity;
}
