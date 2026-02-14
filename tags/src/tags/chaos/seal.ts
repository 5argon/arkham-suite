import { TagBase } from "../../base.js";

export enum TagTypeChaosSeal {
  ChaosSealToken0 = "chaos-seal-token-0",
  ChaosSealTokenAny = "chaos-seal-token-any",
  ChaosSealTokenAutoFail = "chaos-seal-token-auto-fail",
  ChaosSealTokenCultist = "chaos-seal-token-cultist",
  ChaosSealTokenElderSign = "chaos-seal-token-elder-sign",
  ChaosSealTokenElderThing = "chaos-seal-token-elder-thing",
  ChaosSealTokenSkull = "chaos-seal-token-skull",
  ChaosSealTokenTablet = "chaos-seal-token-tablet",
}

interface TagChaosSealBase extends TagBase {}

export interface TagChaosSealToken0 extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealToken0;
}

export interface TagChaosSealTokenAny extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenAny;
}

export interface TagChaosSealTokenAutoFail extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenAutoFail;
}

export interface TagChaosSealTokenCultist extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenCultist;
}

export interface TagChaosSealTokenElderSign extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenElderSign;
}

export interface TagChaosSealTokenElderThing extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenElderThing;
}

export interface TagChaosSealTokenSkull extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenSkull;
}

export interface TagChaosSealTokenTablet extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenTablet;
}
