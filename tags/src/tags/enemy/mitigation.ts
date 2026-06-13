import { TagBase } from "../../base.js";

export enum TagTypeEnemyMitigation {
  EnemyMitigationDiscard = "enemy-mitigation-discard",
  EnemyMitigationDefeat = "enemy-mitigation-defeat",
  EnemyMitigationBackToEncounterDeck = "enemy-mitigation-back-to-encounter-deck",
  EnemyDefeatOnAttackSuccess = "enemy-defeat-on-attack-success",
}

interface TagEnemyMitigationBase extends TagBase {}

export interface TagEnemyMitigationDiscard extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationDiscard;
}

export interface TagEnemyMitigationDefeat extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationDefeat;
}

export interface TagEnemyMitigationBackToEncounterDeck extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationBackToEncounterDeck;
}

/** Defeat an enemy as the payoff of a SUCCESSFUL attack/skill test (a combat finisher: 'if this attack defeats the enemy...'). Not testless removal. */
export interface TagEnemyDefeatOnAttackSuccess extends TagBase {
  type: TagTypeEnemyMitigation.EnemyDefeatOnAttackSuccess;
}
