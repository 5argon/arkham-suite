import { TagBase } from "../../base.js";

export enum TagTypeEnemyRestriction {
  EnemyTraitRestriction = "enemy-trait-restriction",
  EnemyTargetExhausted = "enemy-target-exhausted",
  EnemyBlankText = "enemy-blank-text",
  EnemyIgnoreKeyword = "enemy-ignore-keyword",
}

/**
 * The effect/trigger is limited to enemies of a specified TRAIT (Monster, Humanoid, …)
 * and/or to NON-WEAKNESS enemies. The only other enemy-classification carve-out today is
 * Elite / non-Elite (see enemy/elite.ts).
 */
export interface TagEnemyTraitRestriction extends TagBase {
  type: TagTypeEnemyRestriction.EnemyTraitRestriction;
  /** Required enemy trait, e.g. "Monster". Omit when the only restriction is non-weakness. */
  trait?: string;
  /** True when the effect only applies to non-weakness enemies. */
  nonWeakness?: boolean;
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
