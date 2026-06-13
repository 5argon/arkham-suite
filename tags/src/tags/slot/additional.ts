import { TagBase } from "../../base.js";

export enum TagTypeSlotAdditional {
  SlotAdditional = "slot-additional",
  SlotAdditionalAccessory = "slot-additional-accessory",
  SlotAdditionalAlly = "slot-additional-ally",
  SlotAdditionalArcane = "slot-additional-arcane",
  SlotAdditionalHand = "slot-additional-hand",
  SlotAdditionalTarot = "slot-additional-tarot",
}

interface TagSlotAdditionalBase extends TagBase {
  /**
   * Some extra-slot cards lock the slot to a trait ("2 additional hand slots,
   * only for Tome assets" — Daisy's Tote Bag). The trait is an optional filter
   * on top of the searchable "extra slot".
   */
  restrictedToTrait?: string;
}

export interface TagSlotAdditional extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditional;
}

export interface TagSlotAdditionalAccessory extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalAccessory;
}

export interface TagSlotAdditionalAlly extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalAlly;
}

export interface TagSlotAdditionalArcane extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalArcane;
}

export interface TagSlotAdditionalHand extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalHand;
}

export interface TagSlotAdditionalTarot extends TagSlotAdditionalBase {
  type: TagTypeSlotAdditional.SlotAdditionalTarot;
}
