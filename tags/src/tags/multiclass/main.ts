import { TagBase } from "../../base.js";

export enum TagTypeMulticlass {
  MulticlassClassCount = "multiclass-class-count",
}

interface TagMulticlassBase extends TagBase {}

/**
 * An effect that scales with the number of different classes among cards you
 * control (the five-color / rainbow payoff). `reward` records what scales.
 */
export interface TagMulticlassClassCount extends TagMulticlassBase {
  type: TagTypeMulticlass.MulticlassClassCount;
  reward?:
    | "combat"
    | "damage"
    | "resource"
    | "wild-icon"
    | "cost-reduction"
    | "charge"
    | "effect";
}
