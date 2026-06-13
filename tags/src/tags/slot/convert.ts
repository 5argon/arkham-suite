import { TagBase } from "../../base.js";

export enum TagTypeSlotConvert {
  SlotConvert = "slot-convert",
}

interface TagSlotConvertBase extends TagBase {}

/**
 * Let one slot type substitute for another ("arcane slots can hold
 * accessory-slot cards, and vice versa" — The Hierophant). Distinct from the
 * additive SlotAdditional.
 */
export interface TagSlotConvert extends TagSlotConvertBase {
  type: TagTypeSlotConvert.SlotConvert;
  from: string;
  to: string;
}
