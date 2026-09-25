import { TagBase } from "../../base.js";

export enum TagTypeChaosPredict {
  ChaosPredict = "chaos-predict",
}

interface TagChaosPredictBase extends TagBase {}

/**
 * Know a chaos token's outcome before it matters — name a token, number, or parity before the
 * test (Recall the Future, Crystal Pendulum, Prescient), or reveal it before committing cards
 * (Scrying Mirror).
 */
export interface TagChaosPredict extends TagChaosPredictBase {
  type: TagTypeChaosPredict.ChaosPredict;
}
