import { TagBase } from "../../base.js";

export enum TagTypePhase {
  PhaseSkip = "phase-skip",
  PhaseRepeat = "phase-repeat",
}

interface TagPhaseBase extends TagBase {}

/** Skip an entire phase (The Gold Pocket Watch, Deliverance skipping the mythos phase). */
export interface TagPhaseSkip extends TagPhaseBase {
  type: TagTypePhase.PhaseSkip;
}

/** Repeat an entire phase (The Gold Pocket Watch, Ultimate Sacrifice repeating the investigation phase). */
export interface TagPhaseRepeat extends TagPhaseBase {
  type: TagTypePhase.PhaseRepeat;
}
