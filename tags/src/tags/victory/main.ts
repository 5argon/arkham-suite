import { TagBase } from "../../base.js";

export enum TagTypeVictory {
  VictoryDisplaySelf = "victory-display-self",
}

/**
 * The card adds ITSELF to the victory display, banking victory points as a permanent
 * scoring payoff (Delve Too Deep). Distinct from exile-self / rfg-self / discard-from-play.
 */
export interface TagVictoryDisplaySelf extends TagBase {
  type: TagTypeVictory.VictoryDisplaySelf;
}
