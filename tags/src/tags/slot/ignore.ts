import { TagBase } from "../../base.js";

export enum TagTypeSlotIgnore {
  SlotIgnore = "slot-ignore",
}

/**
 * A card takes up NO slot that it normally would — Abigail Foreman's attached
 * Tome "takes up no hand slots". Future member: Trigger Man (TSK). Distinct
 * from slot-additional-* (granting an extra slot), slot-convert (changing a
 * slot's type), and slot-share (copies sharing one slot); all four are the
 * Slot Tech compound.
 */
export interface TagSlotIgnore extends TagBase {
  type: TagTypeSlotIgnore.SlotIgnore;
  /** Which slot type is ignored (e.g. "hand"). */
  slot?: string;
  /** Trait restriction on the card that gets to ignore its slot (e.g. "Tome"). */
  restrictedToTrait?: string;
}
