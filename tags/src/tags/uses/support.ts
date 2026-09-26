import { TagBase } from "../../base.js";

export enum TagTypeUsesSupport {
  UsesSupportAmmo = "uses-support-ammo",
  UsesSupportCharge = "uses-support-charge",
  UsesSupportSupply = "uses-support-supply",
  UsesSupportSecret = "uses-support-secret",
  UsesSupportEvidence = "uses-support-evidence",
}

interface TagUsesSupportBase extends TagBase {
  /**
   * How this card fuels OTHER assets' uses: "place" new tokens on them (Extra Ammunition),
   * "move" tokens onto them from elsewhere (Eldritch Sophist), or "pool" — the tokens stay on
   * THIS card and may be spent as if they were on your other assets (Typewriter, Cleaning Kit,
   * Lost Arcana).
   */
  supportType: "place" | "move" | "pool"
  /**
   * True when the placement is gated on a trigger/condition (Luke Robinson's
   * elder sign) rather than a plain play/action effect (Extra Ammunition) —
   * mirrors the `conditional` flag on uses-self-place (Empty Vessel).
   */
  conditional?: boolean
}

export interface TagUsesSupportAmmo extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportAmmo;
}

export interface TagUsesSupportCharge extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportCharge;
}

export interface TagUsesSupportSupply extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportSupply;
}

export interface TagUsesSupportSecret extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportSecret;
}

export interface TagUsesSupportEvidence extends TagUsesSupportBase {
  type: TagTypeUsesSupport.UsesSupportEvidence;
}
