import { TagBase } from "../../base.js";

export enum TagTypeClueAdditional {
  ClueAdditionalThisLocation = "clue-additional-this-location",
  ClueAdditionalAdjacentLocations = "clue-additional-adjacent-locations",
  ClueAdditionalRevealedLocations = "clue-additional-revealed-locations",
}

interface TagClueAdditionalBase extends TagBase {
  /**
   * This non-optional field forces the use of explicit value of 1
   * when it says "an additional clue" in the card text.
   */
  value: number;
}

export interface TagClueAdditionalThisLocation extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalThisLocation;
}

export interface TagClueAdditionalAdjacentLocations extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalAdjacentLocations;
}

export interface TagClueAdditionalRevealedLocations extends TagClueAdditionalBase {
  type: TagTypeClueAdditional.ClueAdditionalRevealedLocations;
}
