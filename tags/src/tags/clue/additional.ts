import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeClueAdditional {
  ClueAdditionalThisLocation = "clue-additional-this-location",
  ClueAdditionalRevealedLocations = "clue-additional-revealed-locations",
}

interface TagClueAdditionalBase extends TagBase {
  /**
   * This non-optional field forces the use of explicit value of 1
   * when it says "an additional clue" in the card text.
   */
  value: DynamicValue;
}

export interface TagClueAdditionalThisLocation extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalThisLocation;
}

export interface TagClueAdditionalRevealedLocations extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalRevealedLocations;
}
