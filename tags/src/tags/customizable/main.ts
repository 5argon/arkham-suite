import { TagBase } from "../../base.js";

export enum TagTypeCustomizable {
  Customizable = "customizable",
}

/**
 * The card is CUSTOMIZABLE — it ships with an upgrade sheet whose checkboxes are
 * marked with experience to unlock added abilities (the Scarlet Keys system:
 * Runic Axe, Damning Testimony, Pocket Multi Tool, …). Only the printed BASE
 * text is tagged mechanically; this tag marks the card as belonging to the
 * upgradeable class so a deckbuilder can browse them.
 * (Created autonomously 2026-07-17 from the TSK ingestion — REVIEW WELCOME: this
 * is a meta-designation like Myriad; keep it if a browsable "upgradeable" class
 * is wanted, drop it if designations should stay untagged.)
 */
export interface TagCustomizable extends TagBase {
  type: TagTypeCustomizable.Customizable;
}
