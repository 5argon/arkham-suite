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

export interface TagEnemyMitigationDefeat extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationDefeat;
}

export interface TagEnemyMitigationBackToEncounterDeck extends TagEnemyMitigationBase {
  type: TagTypeEnemyMitigation.EnemyMitigationBackToEncounterDeck;
}
