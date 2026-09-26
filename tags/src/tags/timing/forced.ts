import { TagBase } from "../../base.js";

export enum TagTypeTimingForced {
  // A timing WINDOW is neutral (Tetsuo Mori responds with a [reaction], not Forced), so the
  // ids carry `timing-when-` like timing-when-take-damage/-horror.
  TimingForcedEntersLocation = "timing-when-enemy-enters-location",
  TimingForcedLeavesPlay = "timing-when-leaves-play",
  TimingForcedWhenTakeDamage = "timing-when-take-damage",
  TimingForcedWhenTakeHorror = "timing-when-take-horror",
}

interface TagTimingForcedBase extends TagBase {}

/**
 * Window: an enemy ENTERS a location (moves into or spawns at it) — the Trap cycle's attached
 * location (Snare Trap, Decoy Trap), your location (Gather Intel). An enemy
 * spawning specifically is timing-when-enemy-spawns-your-location.
 */
export interface TagTimingForcedEntersLocation extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedEntersLocation;
}

export interface TagTimingForcedLeavesPlay extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedLeavesPlay;
}

/**
 * Window: damage is dealt to / placed on you or one of your cards (Armor of Ardennes,
 * "I've had worse…", Guard Dog). `source: "enemy-attack"` when only an enemy attack's damage
 * counts (Guard Dog, Flesh Ward, Survival Knife, Lesson Learned).
 */
export interface TagTimingForcedWhenTakeDamage extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedWhenTakeDamage;
  source?: "enemy-attack";
}

/** The horror twin of timing-when-take-damage, with the same `source` narrowing. */
export interface TagTimingForcedWhenTakeHorror extends TagTimingForcedBase {
  type: TagTypeTimingForced.TimingForcedWhenTakeHorror;
  source?: "enemy-attack";
}
