import { TagBase } from "../../base.js";

export enum TagTypeUsesStarting {
  UsesStartingAmmo = "uses-starting-ammo",
  UsesStartingCharge = "uses-starting-charge",
  UsesStartingSupply = "uses-starting-supply",
  UsesStartingSecret = "uses-starting-secret",
  UsesStartingEvidence = "uses-starting-evidence",
}

interface TagUsesStartingBase extends TagBase {
    value: number;
}

export interface TagUsesStartingAmmo extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingAmmo;
}

export interface TagUsesStartingCharge extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingCharge;
}

export interface TagUsesStartingSupply extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingSupply;
}

export interface TagUsesStartingSecret extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingSecret;
}

export interface TagUsesStartingEvidence extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingEvidence;
}
