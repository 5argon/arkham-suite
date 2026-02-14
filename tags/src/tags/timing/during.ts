import { TagBase } from "../../base.js";

// Timing triggers that occur during specific periods
export enum TagTypeTimingDuring {
  TimingDuringYourTurn = "timing-during-your-turn",
}

interface TagTimingDuringBase extends TagBase {}

export interface TagTimingDuringYourTurn extends TagTimingDuringBase {
  type: TagTypeTimingDuring.TimingDuringYourTurn;
}
