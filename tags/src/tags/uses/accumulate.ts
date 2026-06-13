import { TagBase } from "../../base.js";

export enum TagTypeUsesAccumulate {
  UsesAccumulate = "uses-accumulate",
}

interface TagUsesAccumulateBase extends TagBase {}

/**
 * A self-growing counter: place resources from the token pool onto THIS card as
 * a renamed token (evidence/leads/offering) that starts empty and accrues via
 * reactions, later spent. Distinct from UsesStarting (printed pool) and
 * UsesSupport (place/move of an existing type). "tokenName" = the renamed token.
 */
export interface TagUsesAccumulate extends TagUsesAccumulateBase {
  type: TagTypeUsesAccumulate.UsesAccumulate;
  tokenName?: "evidence" | "lead" | "offering" | "charge" | "generic";
}
