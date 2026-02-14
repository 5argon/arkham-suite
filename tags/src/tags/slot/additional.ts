import { TagBase } from "../../base.js";

export enum TagTypeSlotAdditional {
  SlotAdditional = "slot-additional",
  SlotAdditionalAccessory = "slot-additional-accessory",
  SlotAdditionalAlly = "slot-additional-ally",
  SlotAdditionalArcane = "slot-additional-arcane",
  SlotAdditionalHand = "slot-additional-hand",
}

interface TagSlotAdditionalBase extends TagBase {}

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
