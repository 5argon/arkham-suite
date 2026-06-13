import { TagBase } from "../../base.js";

export enum TagTypeChaosPredict {
  ChaosPredict = "chaos-predict",
}

interface TagChaosPredictBase extends TagBase {}

export interface TagChaosPredict extends TagChaosPredictBase {
  type: TagTypeChaosPredict.ChaosPredict;
}
