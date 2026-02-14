import { TagBase } from "../../base.js";

// Game-level timing points
export enum TagTypeTimingGame {
  TimingGameDrawOpeningHands = "timing-game-draw-opening-hands",
  TimingGameBegins = "timing-game-begins",
  TimingGameEnds = "timing-game-ends",
}

interface TagTimingGameBase extends TagBase {}

export interface TagTimingGameDrawOpeningHands extends TagTimingGameBase {
  type: TagTypeTimingGame.TimingGameDrawOpeningHands;
}

export interface TagTimingGameBegins extends TagTimingGameBase {
  type: TagTypeTimingGame.TimingGameBegins;
}

export interface TagTimingGameEnds extends TagTimingGameBase {
  type: TagTypeTimingGame.TimingGameEnds;
}
