import { TagBase } from "../../base.js";

export enum TagTypeVictory {
  VictoryDisplaySelf = "victory-display-self",
  VictoryDisplayAddEncounter = "victory-display-add-encounter",
}

/**
 * The card adds ITSELF to the victory display, banking victory points as a permanent
 * scoring payoff (Delve Too Deep). Distinct from exile-self / rfg-self / discard-from-play.
 */
export interface TagVictoryDisplaySelf extends TagBase {
  type: TagTypeVictory.VictoryDisplaySelf;
}

/**
 * Banks an ENCOUNTER card into the victory display (The Eye of Truth adding the
 * tested treachery). Future member: Blood of K'n-yan (TDC). Distinct from
 * victory-display-self (the card banking itself).
 */
export interface TagVictoryDisplayAddEncounter extends TagBase {
  type: TagTypeVictory.VictoryDisplayAddEncounter;
}
