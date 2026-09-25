import { TagBase } from "../../base.js";

export enum TagTypePhase {
  PhaseSkip = "phase-skip",
  PhaseRepeat = "phase-repeat",
}

interface TagPhaseBase extends TagBase {}

/** Skip a phase or a phase STEP (The Gold Pocket Watch; A Watchful Peace and Deliverance skip the mythos "draw encounter cards" step). */
export interface TagPhaseSkip extends TagPhaseBase {
  type: TagTypePhase.PhaseSkip;
}

/** Repeat an entire phase (The Gold Pocket Watch, Ultimate Sacrifice repeating the investigation phase). */
export interface TagPhaseRepeat extends TagPhaseBase {
  type: TagTypePhase.PhaseRepeat;
}
