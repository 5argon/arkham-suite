import { TagBase } from "../../base.js";

export enum TagTypeUsesSelfPlace {
  UsesSelfPlace = "uses-self-place",
}

interface TagUsesSelfPlaceBase extends TagBase {
  /** Which use-token pool is placed onto this card ("ammo"/"supply"/"charge"). */
  useType?: string;
  /** True when the placement is triggered (e.g. "on a failed attack, place 1 ammo"); false for a manual action. */
  conditional?: boolean;
}

/**
 * Places a use-token onto THIS card itself (a self-refund) — e.g. .18 Derringer /
 * Chainsaw refunding ammo/supply on a miss, or Ornate Bow's "nock another arrow".
 * Distinct from uses-support (places tokens on OTHER cards) and uses-replenish
 * (auto/triggered refill of a capped pool at round start).
 */
export interface TagUsesSelfPlace extends TagUsesSelfPlaceBase {
  type: TagTypeUsesSelfPlace.UsesSelfPlace;
}
