import { TagBase } from "../../base.js";

export enum TagTypeCluePlace {
  CluePlaceYourLocation = "clue-place-your-location",
}

interface TagCluePlaceBase extends TagBase {
  value: number;
}

/**
 * PLACE a clue on your location as an EFFECT — one of your own (Forewarned, Bizarre Diagnosis,
 * Analysis) or from the token bank (Mysteries Remain) — distinct from DISCOVERING a clue
 * (ClueDiscover*) and from ClueAdditional (extra clues during an investigation). Placing your
 * own clue as an ability COST is cost-*-spend-clue (Dr. Maleson).
 */
export interface TagCluePlaceYourLocation extends TagCluePlaceBase {
  type: TagTypeCluePlace.CluePlaceYourLocation;
}
