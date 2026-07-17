import { TagBase } from "../../base.js";

export enum TagTypeChaosTokenPool {
  ChaosRecycleToken = "chaos-recycle-token",
  ChaosSpendSealed = "chaos-spend-sealed",
  ChaosBagCountCondition = "chaos-bag-count-condition",
}

interface TagChaosTokenPoolBase extends TagBase {}

/**
 * Keeps a revealed bless/curse token IN the chaos bag ("return that token to the
 * chaos bag after this test ends") instead of letting it return to the token
 * pool — the bless/curse CONSERVATION mechanic of the Innsmouth cycle (Book of
 * Psalms's covenant family, Blessed Blade, Tempt Fate shapes).
 * (Created autonomously 2026-07-17 from the TIC noFit pile — review welcome.)
 */
export interface TagChaosRecycleToken extends TagChaosTokenPoolBase {
  type: TagTypeChaosTokenPool.ChaosRecycleToken;
}

/**
 * Spends or releases SEALED chaos tokens as a cost or consumes them in an
 * effect ("release a chaos token sealed on it:", "returning 3 sealed [bless]
 * tokens to the token pool"). The seal side is chaos-seal-*; this is using the
 * sealed pool as a resource. (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagChaosSpendSealed extends TagChaosTokenPoolBase {
  type: TagTypeChaosTokenPool.ChaosSpendSealed;
}

/**
 * Gates or scales on the NUMBER of bless/curse tokens currently in the chaos
 * bag ("if there are 10 [curse] tokens in the chaos bag", "X = the number of
 * [bless] tokens in the bag"). (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagChaosBagCountCondition extends TagChaosTokenPoolBase {
  type: TagTypeChaosTokenPool.ChaosBagCountCondition;
}
