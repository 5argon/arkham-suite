import { TagBase } from "../../base.js";
import { SkillType } from "../../kohaku.js";

export enum TagTypeBuffStatsReplace {
  BuffStatsReplace = "buff-stats-replace",
}

interface TagBuffStatsReplaceBase extends TagBase {
  /**
   * The stat that replaces another stat.
   */
  from: SkillType;
  /**
   * The stat that is replaced.
   */
  to: SkillType;
}

export interface TagBuffStatsReplace extends TagBuffStatsReplaceBase {
  type: TagTypeBuffStatsReplace.BuffStatsReplace;
}
