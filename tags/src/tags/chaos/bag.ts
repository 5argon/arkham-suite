import { TagBase } from "../../base.js";

export enum TagTypeChaosBag {
  ChaosBagAddBless = "chaos-bag-add-bless",
  ChaosBagAddCurse = "chaos-bag-add-curse",
  ChaosBagRemoveBless = "chaos-bag-remove-bless",
  ChaosBagRemoveCurse = "chaos-bag-remove-curse",
  ChaosBagReplace = "chaos-bag-replace",
}

interface TagChaosBagBase extends TagBase {
  value: number;
}

export interface TagChaosBagAddBless extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagAddBless;
}

export interface TagChaosBagAddCurse extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagAddCurse;
}

export interface TagChaosBagRemoveBless extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagRemoveBless;
}

export interface TagChaosBagRemoveCurse extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagRemoveCurse;
}

export interface TagChaosBagReplace extends TagChaosBagBase {
  type: TagTypeChaosBag.ChaosBagReplace;
  from: "bless" | "curse";
  to: "bless" | "curse";
}
