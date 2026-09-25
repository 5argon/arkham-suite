import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeLocationShroud {
  LocationShroudDependent = "location-shroud-dependent",
  LocationShroudReduction = "location-shroud-reduction",
}

interface TagLocationShroudBase extends TagBase {}

export interface TagLocationShroudDependent extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudDependent;
}

/**
 * LOWER a location's shroud (Flashlight -2, Lantern -1, Otherworldly Compass -X, The Skeleton
 * Key setting it to 1). `value` is the reduction; "dynamic" when it varies or is a set value.
 */
export interface TagLocationShroudReduction extends TagLocationShroudBase {
  type: TagTypeLocationShroud.LocationShroudReduction;
  value: DynamicValue;
}
