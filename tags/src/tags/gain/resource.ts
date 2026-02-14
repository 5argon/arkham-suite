import { TagBase } from "../../base.js";

export enum TagTypeGainResource {
  GainResourceYou = "gain-resource-you",
  GainResourceInvestigator = "gain-resource-investigator",
}

interface TagGainResourceBase extends TagBase {
  value: number;
}

export interface TagGainResourceYou extends TagGainResourceBase {
  type: TagTypeGainResource.GainResourceYou;
}

export interface TagGainResourceInvestigator extends TagGainResourceBase {
  type: TagTypeGainResource.GainResourceInvestigator;
}
