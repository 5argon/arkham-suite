import { TagBase } from "../../base.js";

export enum TagTypeChaosPayoff {
  ChaosSymbolPayoff = "chaos-symbol-payoff",
}

interface TagChaosPayoffBase extends TagBase {}

/** A BONUS gained when a specific chaos symbol is revealed (Song of the Dead's "+2 damage if [skull]"). The positive counterpart of chaos-downside-* / the elder-sign payoff. */
export interface TagChaosSymbolPayoff extends TagChaosPayoffBase {
  type: TagTypeChaosPayoff.ChaosSymbolPayoff;
}
