import { TagBase } from "../../base.js";

export enum TagTypeSlotShare {
  SlotShare = "slot-share",
}

/**
 * Multiple copies of this card occupy a SINGLE slot together ("Up to 3 Empower
 * Self cards take up a single arcane slot"). Distinct from slot-additional-*
 * (granting an extra slot) and slot-convert (changing a slot's type).
 * `copies` = how many can share one slot.
 */
export interface TagSlotShare extends TagBase {
  type: TagTypeSlotShare.SlotShare;
  copies?: number;
}
