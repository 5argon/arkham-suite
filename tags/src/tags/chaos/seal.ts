import { TagBase } from "../../base.js";

export enum TagTypeChaosSeal {
  ChaosSealToken0 = "chaos-seal-token-0",
  ChaosSealTokenPlus1 = "chaos-seal-token-plus-1",
  ChaosSealTokenAny = "chaos-seal-token-any",
  ChaosSealTokenAutoFail = "chaos-seal-token-auto-fail",
  ChaosSealTokenCultist = "chaos-seal-token-cultist",
  ChaosSealTokenElderSign = "chaos-seal-token-elder-sign",
  ChaosSealTokenElderThing = "chaos-seal-token-elder-thing",
  ChaosSealTokenSkull = "chaos-seal-token-skull",
  ChaosSealTokenTablet = "chaos-seal-token-tablet",
  ChaosSealTokenBless = "chaos-seal-token-bless",
  ChaosSealTokenCurse = "chaos-seal-token-curse",
  ChaosSealRevealed = "chaos-seal-revealed",
}

interface TagChaosSealBase extends TagBase {}

export interface TagChaosSealToken0 extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealToken0;
}

/** Seal a "+1" token (Misdirection "Seal (+1 or 0)", Bulwark, Crystalline Elder Sign). */
export interface TagChaosSealTokenPlus1 extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenPlus1;
}

/** Seal token(s) of your CHOICE, searched out of the bag (Protective Incantation, Unrelenting). */
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

export interface TagChaosSealTokenBless extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenBless;
}

export interface TagChaosSealTokenCurse extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealTokenCurse;
}

/**
 * Seal a token that was REVEALED — during a test (Dial of Ancients) or drawn at random from
 * the bag (both Premonitions) — rather than one searched out by choice (chaos-seal-token-any).
 */
export interface TagChaosSealRevealed extends TagChaosSealBase {
  type: TagTypeChaosSeal.ChaosSealRevealed;
}
