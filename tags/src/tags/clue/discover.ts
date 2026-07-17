import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeClueDiscover {
  ClueDiscoverAnyLocation = "clue-discover-any-location",
  ClueDiscoverConnectingLocation = "clue-discover-connecting-location",
  ClueDiscoverYourLocation = "clue-discover-your-location",
}

interface TagClueDiscoverBase extends TagBase {
  value: DynamicValue;
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
