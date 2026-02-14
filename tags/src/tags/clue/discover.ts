import { TagBase } from "../../base.js";

export enum TagTypeClueDiscover {
  ClueDiscoverAnyLocation = "discover-clue-any-location",
  ClueDiscoverConnectingLocation = "discover-clue-connecting-location",
  ClueDiscoverYourLocation = "discover-clue-your-location",
}

interface TagClueDiscoverBase extends TagBase {
  value: number;
}

export interface TagClueDiscoverAnyLocation extends TagClueDiscoverBase {
  type: TagTypeClueDiscover.ClueDiscoverAnyLocation;
}

export interface TagClueDiscoverConnectingLocation extends TagClueDiscoverBase {
  type: TagTypeClueDiscover.ClueDiscoverConnectingLocation;
}

export interface TagClueDiscoverYourLocation extends TagClueDiscoverBase {
  type: TagTypeClueDiscover.ClueDiscoverYourLocation;
}
