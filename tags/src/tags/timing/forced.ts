import { TagBase } from "../../base.js";

export enum TagTypeTimingForced {
  TimingForcedEntersLocation = "timing-forced-enters-location",
  // id neutralized 2026-07-16 (Tetsuo Mori responds with a [reaction], not Forced):
  // a timing WINDOW is neutral — same precedent as timing-when-take-damage/-horror below.
  TimingForcedLeavesPlay = "timing-when-leaves-play",
  TimingForcedSpawnYourLocation = "timing-forced-spawn-your-location",
  TimingForcedWhenTakeDamage = "timing-when-take-damage",
  TimingForcedWhenTakeHorror = "timing-when-take-horror",
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
