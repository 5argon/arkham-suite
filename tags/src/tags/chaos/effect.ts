import { TagBase } from "../../base.js";

export enum TagTypeChaosEffect {
  ChaosEffectDoNotReveal = "chaos-do-not-reveal",
  ChaosEffectIgnoreEffect = "chaos-ignore-effect",
  ChaosEffectIgnoreModifier = "chaos-ignore-modifier",
  ChaosEffectModifier = "chaos-modifier",
  ChaosEffectResolveChoose = "chaos-resolve-choose",
  ChaosEffectRevealBeforeEffect = "chaos-reveal-before-effect",
  ChaosEffectTreatTokenAs = "chaos-treat-token-as",
  ChaosEffectResolveAdditional = "chaos-resolve-additional",
}

interface TagChaosEffectBase extends TagBase {}

export interface TagChaosEffectDoNotReveal extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectDoNotReveal;
}

export interface TagChaosEffectIgnoreEffect extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectIgnoreEffect;
}

/**
 * A revealed token's MODIFIER stops counting — "ignore the modifier" (Dawn Star, Defiance)
 * or, equivalently, "treat its modifier as 0" (Accursed, Jim Culver, Snipe).
 */
export interface TagChaosEffectIgnoreModifier extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectIgnoreModifier;
}

/**
 * CHANGE a revealed token's modifier to something else — flip its sign (Sure Gamble,
 * "Hit me!") or set it to a value (`treatAs`: Skeptic's +1). Setting it to 0 is
 * chaos-ignore-modifier instead.
 */
export interface TagChaosEffectModifier extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectModifier;
  treatAs?: number;
}

export interface TagChaosEffectResolveChoose extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectResolveChoose;
}

export interface TagChaosEffectRevealBeforeEffect extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectRevealBeforeEffect;
}

/**
 * Treat a revealed token as a DIFFERENT token (`to`) — Eucatastrophe and Father Mateo
 * turn it into an [elder_sign]; The Necronomicon turns [elder_sign] into [auto_fail].
 */
export interface TagChaosEffectTreatTokenAs extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectTreatTokenAs;
  to: "bless" | "curse" | "skull" | "elder-sign" | "auto-fail" | "cultist" | "tablet" | "elder-thing";
}

export interface TagChaosEffectResolveAdditional extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectResolveAdditional;
}
