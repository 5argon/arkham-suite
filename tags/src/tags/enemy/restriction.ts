import { TagBase } from "../../base.js";

export enum TagTypeEnemyRestriction {
  EnemyTraitRestriction = "enemy-trait-restriction",
  EnemyNonWeakness = "enemy-nonweakness",
  EnemyTargetExhausted = "enemy-target-exhausted",
  EnemyBlankText = "enemy-blank-text",
  EnemyIgnoreKeyword = "enemy-ignore-keyword",
}

/**
 * The effect/trigger is limited to enemies of a specified printed TRAIT (Monster,
 * Humanoid, …). "Trait" means the card's printed trait line ONLY — "Weakness"
 * (enemy-nonweakness) and Elite / non-Elite (enemy/elite.ts) are card-classification
 * carve-outs, not traits, and carry their own tags.
 */
export interface TagEnemyTraitRestriction extends TagBase {
  type: TagTypeEnemyRestriction.EnemyTraitRestriction;
  /** Required enemy trait, e.g. "Monster". */
  trait: string;
}

/**
 * The effect/trigger is limited to NON-WEAKNESS enemies. "Weakness" is a card
 * designation, not a printed trait, so it is kept out of enemy-trait-restriction.
 */
export interface TagEnemyNonWeakness extends TagBase {
  type: TagTypeEnemyRestriction.EnemyNonWeakness;
}

/**
 * The effect only works on (or gains a bonus against) an EXHAUSTED enemy — the prey-on-
 * exhausted / evade-then-kill affinity (Sneak Attack). Pairs with cards that exhaust or
 * evade enemies.
 */
export interface TagEnemyTargetExhausted extends TagBase {
  type: TagTypeEnemyRestriction.EnemyTargetExhausted;
}

/** Blank an enemy's TEXT BOX (loses all abilities/keywords; traits remain) — e.g. Mind Wipe. The hard version of ignoring a single keyword. */
export interface TagEnemyBlankText extends TagBase {
  type: TagTypeEnemyRestriction.EnemyBlankText;
}

/** Ignore a single enemy keyword (Retaliate, Aloof, Elusive, Hunter, …) without blanking the whole card — e.g. .45 Automatic (2) ignoring Retaliate. */
export interface TagEnemyIgnoreKeyword extends TagBase {
  type: TagTypeEnemyRestriction.EnemyIgnoreKeyword;
  /** The ignored keyword, e.g. "Retaliate". */
  keyword: string;
}
