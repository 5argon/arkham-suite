import { TagBase } from "../../base.js";

export enum TagTypeChaosReveal {
  ChaosRevealTokenAutoFail = "chaos-reveal-token-auto-fail",
  ChaosRevealTokenBless = "chaos-reveal-token-bless",
  ChaosRevealTokenCultist = "chaos-reveal-token-cultist",
  ChaosRevealTokenCurse = "chaos-reveal-token-curse",
  ChaosRevealTokenElderSign = "chaos-reveal-token-elder-sign",
  ChaosRevealTokenElderThing = "chaos-reveal-token-elder-thing",
  ChaosRevealTokenSkull = "chaos-reveal-token-skull",
  ChaosRevealTokenTablet = "chaos-reveal-token-tablet",
  ChaosRevealMore = "chaos-reveal-more",
  ChaosRevealManual = "chaos-reveal-manual",
  ChaosRevealAnotherInstead = "chaos-reveal-another-instead",
}

interface TagChaosRevealBase extends TagBase {}

export interface TagChaosRevealTokenAutoFail extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenAutoFail;
}

export interface TagChaosRevealTokenBless extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenBless;
}

export interface TagChaosRevealTokenCultist extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenCultist;
}

export interface TagChaosRevealTokenCurse extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenCurse;
}

export interface TagChaosRevealTokenElderSign extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenElderSign;
}

export interface TagChaosRevealTokenElderThing extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenElderThing;
}

export interface TagChaosRevealTokenSkull extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenSkull;
}

export interface TagChaosRevealTokenTablet extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealTokenTablet;
}

export interface TagChaosRevealMore extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealMore;
}

export interface TagChaosRevealManual extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealManual;
}

export interface TagChaosRevealAnotherInstead extends TagChaosRevealBase {
  type: TagTypeChaosReveal.ChaosRevealAnotherInstead;
}
