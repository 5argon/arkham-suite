import { TagBase } from "../../base.js";

export enum TagTypeBuffAssetStats {
  BuffAssetHealth = "buff-asset-health",
  BuffAssetSanity = "buff-asset-sanity",
}

interface TagBuffAssetStatsBase extends TagBase {
  value: number;
}

/**
 * Raises the max health (durability) of your assets
 * (e.g. "each asset you control with health gets +1 health").
 * Distinct from heal, which restores but does not raise the maximum.
 */
export interface TagBuffAssetHealth extends TagBuffAssetStatsBase {
  type: TagTypeBuffAssetStats.BuffAssetHealth;
}

/**
 * Sanity counterpart of BuffAssetHealth: raises the max sanity of your assets.
 */
export interface TagBuffAssetSanity extends TagBuffAssetStatsBase {
  type: TagTypeBuffAssetStats.BuffAssetSanity;
}
