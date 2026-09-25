import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeClueAdditional {
  ClueAdditionalThisLocation = "clue-additional-this-location",
  ClueAdditionalOtherLocation = "clue-additional-other-location",
}

interface TagClueAdditionalBase extends TagBase {
  /**
   * This non-optional field forces the use of explicit value of 1
   * when it says "an additional clue" in the card text.
   */
  value: DynamicValue;
}

/**
 * Part of a SUCCESSFUL investigation's result: discover MORE clues at the investigated
 * location than the normal one (Rite of Seeking, Divination's clue per charge spent).
 * A standalone discovery effect is clue-discover-* instead.
 */
export interface TagClueAdditionalThisLocation extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalThisLocation;
}

/**
 * Part of a SUCCESSFUL investigation's result: discover clues at a location OTHER than
 * the investigated one — Deciphered Reality (each revealed location), Seeking Answers
 * (a connecting location), Damning Testimony (the chosen enemy's location). The reach
 * twin of clue-additional-this-location; a standalone discovery effect is clue-discover-*.
 */
export interface TagClueAdditionalOtherLocation extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalOtherLocation;
  /**
   * True when the remote clue REPLACES the normal clue at your location ("instead of
   * discovering a clue at your location" — Seeking Answers, Professor William Webb), so
   * the investigation nets no extra clue; false when it is on top of it.
   */
  instead: boolean;
}
