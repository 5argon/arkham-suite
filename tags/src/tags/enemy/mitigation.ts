import { TagBase } from "../../base.js";

export enum TagTypeEnemyMitigation {
  EnemyMitigationDiscard = "enemy-mitigation-discard",
  EnemyMitigationDefeat = "enemy-mitigation-defeat",
  EnemyMitigationBackToEncounterDeck = "enemy-mitigation-back-to-encounter-deck",
}

interface TagEnemyMitigationBase extends TagBase {}

export interface TagEnemyMitigationDiscard extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationDiscard;
}

/**
 * DEFEAT an enemy outright, regardless of its remaining health — testless ("I'll see you in
 * hell!"), after a special test (Waylay, Whispers of Doom), or as the payoff of a successful
 * attack (Monster Slayer).
 */
export interface TagEnemyMitigationDefeat extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationDefeat;
}

export interface TagEnemyMitigationBackToEncounterDeck extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationBackToEncounterDeck;
}

