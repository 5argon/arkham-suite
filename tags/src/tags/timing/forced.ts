import { TagBase } from "../../base.js";

export enum TagTypeTimingForced {
  TimingForcedEntersLocation = "timing-forced-enters-location",
  TimingForcedLeavesPlay = "timing-forced-leaves-play",
  TimingForcedSpawnYourLocation = "timing-forced-spawn-your-location",
  TimingForcedWhenTakeDamage = "timing-forced-when-take-damage",
  TimingForcedWhenTakeHorror = "timing-forced-when-take-horror",
}

interface TagTimingForcedBase extends TagBase {}

export interface TagTimingForcedEntersLocation extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedEntersLocation;
}

export interface TagTimingForcedLeavesPlay extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedLeavesPlay;
}

export interface TagTimingForcedSpawnYourLocation extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedSpawnYourLocation;
}

export interface TagTimingForcedWhenTakeDamage extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedWhenTakeDamage;
}

export interface TagTimingForcedWhenTakeHorror extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedWhenTakeHorror;
}
