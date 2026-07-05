import { TagBase } from "../../base.js";

export enum TagTypeLimit {
  LimitInPlay = "limit-in-play",
}

interface TagLimitBase extends TagBase {
  /** The trait that is limited, e.g. "Composure" or "Trap". */
  trait: string;
  /** How many are allowed. */
  count: number;
  /** Scope of the limit: across all play ("in-play") or per location ("location"). */
  per?: "in-play" | "location";
}

/** "Limit N [[Trait]] in play" / "Limit N [[Trait]] per location" — a deckbuilding/board cap on how many of a trait may exist (Composure cards = Limit 1 in play; Trap cards = Limit 1 per location). */
export interface TagLimitInPlay extends TagLimitBase {
  type: TagTypeLimit.LimitInPlay;
}
