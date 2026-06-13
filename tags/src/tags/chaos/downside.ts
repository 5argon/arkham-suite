import { TagBase } from "../../base.js";

export enum TagTypeChaosDownside {
  ChaosDownsideDamage = "chaos-downside-damage",
  ChaosDownsideHorror = "chaos-downside-horror",
  ChaosDownsideResource = "chaos-downside-resource",
  ChaosDownsideAction = "chaos-downside-action",
  ChaosDownsideDiscard = "chaos-downside-discard",
}

interface TagChaosDownsideBase extends TagBase {
  value: number;
}

export interface TagChaosDownsideDamage extends TagChaosDownsideBase {
  type: TagTypeChaosDownside.ChaosDownsideDamage;
}

export interface TagChaosDownsideHorror extends TagChaosDownsideBase {
  type: TagTypeChaosDownside.ChaosDownsideHorror;
}

export interface TagChaosDownsideResource extends TagChaosDownsideBase {
  type: TagTypeChaosDownside.ChaosDownsideResource;
}

/**
 * Lose action(s) when a bad symbol is revealed during this card's own test — the
 * non-horror sibling of chaos-downside-horror/damage (Blinding Light's "lose 1 action").
 * `value` is the number of actions lost; OMIT it for "lose all remaining actions" (Rite of
 * Seeking). Lets the Chaos Token Downside archetype cover action-loss penalties.
 */
export interface TagChaosDownsideAction extends TagBase {
  type: TagTypeChaosDownside.ChaosDownsideAction;
  value?: number;
}

/**
 * A DISCARD penalty when a bad symbol is revealed for this card (during its test, or a
 * manual reveal it forces) — this card breaks (Baseball Bat), you discard a card from hand
 * (Mists of R'lyeh), or you discard a controlled asset (Astral Travel, Recharge). A flag;
 * the specific discard is carried by the card's other tags. Chaos-triggered.
 */
export interface TagChaosDownsideDiscard extends TagBase {
  type: TagTypeChaosDownside.ChaosDownsideDiscard;
}
