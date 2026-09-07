import { TagBase } from "../../base.js";

export enum TagTypeChaosEffect {
  ChaosEffectDoNotReveal = "chaos-do-not-reveal",
  ChaosEffectIgnoreEffect = "chaos-ignore-effect",
  ChaosEffectIgnoreModifier = "chaos-ignore-modifier",
  ChaosEffectModifier = "chaos-modifier",
  ChaosEffectResolveChoose = "chaos-resolve-choose",
  ChaosEffectRevealBeforeEffect = "chaos-reveal-before-effect",
  ChaosEffectTreatAsElderSign = "chaos-treat-as-elder-sign",
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

export interface TagChaosEffectIgnoreModifier extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectIgnoreModifier;
}

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

export interface TagChaosEffectTreatAsElderSign extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectTreatAsElderSign;
}

export interface TagChaosEffectTreatTokenAs extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectTreatTokenAs;
  to: "bless" | "curse" | "skull" | "elder-sign" | "auto-fail" | "cultist" | "tablet" | "elder-thing";
}

export interface TagChaosEffectResolveAdditional extends TagChaosEffectBase {
  type: TagTypeChaosEffect.ChaosEffectResolveAdditional;
}
