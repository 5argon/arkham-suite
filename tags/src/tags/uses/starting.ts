import { TagBase } from "../../base.js";

export enum TagTypeUsesStarting {
  UsesStartingAmmo = "uses-starting-ammo",
  UsesStartingCharge = "uses-starting-charge",
  UsesStartingSupply = "uses-starting-supply",
  UsesStartingSecret = "uses-starting-secret",
  UsesStartingEvidence = "uses-starting-evidence",
  UsesStartingOffering = "uses-starting-offering",
  UsesStartingResource = "uses-starting-resource",
  UsesStartingInspiration = "uses-starting-inspiration",
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

/** Printed use-token type "offering" (Masks sub-theme). */
export interface TagUsesStartingOffering extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingOffering;
}

/**
 * Printed "Uses (N resources)" as a use-pool stored on the card, distinct from
 * gaining resources to your pool.
 */
export interface TagUsesStartingResource extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingResource;
}

/** New printed use-token type "inspiration" (tdc). */
export interface TagUsesStartingInspiration extends TagUsesStartingBase {
  type: TagTypeUsesStarting.UsesStartingInspiration;
}
