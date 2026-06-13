import { TagBase } from "../../base.js";

export enum TagTypeUsesReplenish {
  UsesReplenish = "uses-replenish",
}

interface TagUsesReplenishBase extends TagBase {}

/**
 * Refilling a limited-use pool (charges/offerings/ammo/secrets), either
 * automatically each round or on a trigger ("replenish this charge the first
 * time a bless token is revealed"). "useType" = which pool is refilled,
 * "conditional" = triggered vs. automatic.
 */
export interface TagUsesReplenish extends TagUsesReplenishBase {
  type: TagTypeUsesReplenish.UsesReplenish;
  useType?: string;
  conditional?: boolean;
}
