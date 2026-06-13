import { TagBase } from "../../base.js";

export enum TagTypeCluePlace {
  CluePlaceYourLocation = "clue-place-your-location",
}

interface TagCluePlaceBase extends TagBase {
  value: number;
}

/**
 * PLACE a clue (from the token bank) on a location, distinct from DISCOVERING a
 * clue (ClueDiscover*) and from ClueAdditional (extra clues during an
 * investigation). Placing seeds a clue to be collected / fuels "when a clue is
 * placed" tech.
 */
export interface TagCluePlaceYourLocation extends TagCluePlaceBase {
  type: TagTypeCluePlace.CluePlaceYourLocation;
}
