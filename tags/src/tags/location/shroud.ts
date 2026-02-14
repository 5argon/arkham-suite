import { TagBase } from "../../base.js";

export enum TagTypeLocationShroud {
  LocationShroudDependent = "shroud-dependent",
  LocationShroudMinus1 = "shroud-minus-1",
  LocationShroudMinus2 = "shroud-minus-2",
  LocationShroudReduction = "shroud-reduction",
}

interface TagLocationShroudBase extends TagBase {}

export interface TagLocationShroudDependent extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudDependent;
}

export interface TagLocationShroudMinus1 extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudMinus1;
}

export interface TagLocationShroudMinus2 extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudMinus2;
}

export interface TagLocationShroudReduction extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudReduction;
}
