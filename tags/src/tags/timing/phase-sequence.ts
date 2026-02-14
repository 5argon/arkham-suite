import { TagBase } from "../../base.js";
import type { TimingQualifier } from "../../type.js";

// Framework event timing for the four main phases and their steps
export enum TagTypeTimingPhaseSequence {
  // I. Mythos phase
  // 1.1 Mythos phase begins
  PhaseMythosBegins = "phase-mythos-begins",
  // 1.2 Place 1 doom on current agenda
  PhaseMythosPlaceDoom = "phase-mythos-place-doom",
  // 1.3 Check doom threshold (agenda may advance)
  PhaseMythosCheckDoom = "phase-mythos-check-doom",
  // 1.4 Each investigator draws 1 encounter card
  PhaseMythosDrawEncounter = "phase-mythos-draw-encounter",
  // 1.5 Mythos phase ends
  PhaseMythosEnds = "phase-mythos-ends",
  
  // II. Investigation phase
  // 2.1 Investigation phase begins
  PhaseInvestigationBegins = "phase-investigation-begins",
  // 2.2 Next investigator's turn begins
  PhaseInvestigationTurnBegins = "phase-investigation-turn-begins",
  // 2.2.1 Investigator takes an action
  PhaseInvestigationTakeAction = "phase-investigation-take-action",
  // 2.2.2 Investigator's turn ends
  PhaseInvestigationTurnEnds = "phase-investigation-turn-ends",
  // 2.3 Investigation phase ends
  PhaseInvestigationEnds = "phase-investigation-ends",
  
  // III. Enemy phase
  // 3.1 Enemy phase begins
  PhaseEnemyBegins = "phase-enemy-begins",
  // 3.2 Hunter enemies move
  PhaseEnemyHunterMove = "phase-enemy-hunter-move",
  // 3.3 Next investigator resolves engaged enemy attacks
  PhaseEnemyAttacks = "phase-enemy-attacks",
  // 3.4 Enemy phase ends
  PhaseEnemyEnds = "phase-enemy-ends",
  
  // IV. Upkeep phase
  // 4.1 Upkeep phase begins
  PhaseUpkeepBegins = "phase-upkeep-begins",
  // 4.2 Reset actions
  PhaseUpkeepResetActions = "phase-upkeep-reset-actions",
  // 4.3 Ready exhausted cards
  PhaseUpkeepReadyCards = "phase-upkeep-ready-cards",
  // 4.4 Each investigator draws 1 card and gains 1 resource
  PhaseUpkeepDrawResource = "phase-upkeep-draw-resource",
  // 4.5 Each investigator checks hand size
  PhaseUpkeepCheckHandSize = "phase-upkeep-check-hand-size",
  // 4.6 Upkeep phase ends (also formalizes end of round)
  PhaseUpkeepEnds = "phase-upkeep-ends",
}

interface TagTimingPhaseSequenceBase extends TagBase {
  timing: TimingQualifier;
}

// I. Mythos phase

// 1.1 Mythos phase begins.
// This step formalizes the beginning of the mythos phase.
// As this is the first framework event of the round, it also formalizes the beginning of a new game round.
export interface TagTimingPhaseMythosBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosBegins;
}

// 1.2 Place 1 doom on the current agenda.
// Take 1 doom from the token pool, and place it on the current agenda card.
export interface TagTimingPhaseMythosPlaceDoom extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosPlaceDoom;
}

// 1.3 Check doom threshold.
// Compare the total number of doom in play with the doom threshold of the current agenda.
// If the value of doom in play equals or exceeds the doom threshold, the agenda deck advances.
export interface TagTimingPhaseMythosCheckDoom extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosCheckDoom;
}

// 1.4 Each investigator draws 1 encounter card.
// In player order, each investigator draws the top card of the encounter deck,
// resolves any revelation abilities, and follows instructions based on card type.
export interface TagTimingPhaseMythosDrawEncounter extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosDrawEncounter;
}

// 1.5 Mythos phase ends.
// This step formalizes the end of the mythos phase.
export interface TagTimingPhaseMythosEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseMythosEnds;
}

// II. Investigation phase

// 2.1 Investigation phase begins.
// This step formalizes the beginning of the investigation phase.
export interface TagTimingPhaseInvestigationBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationBegins;
}

// 2.2 Next investigator's turn begins.
// The investigators may take their turns in any order.
// The investigator taking his or her turn is known as the "active investigator."
export interface TagTimingPhaseInvestigationTurnBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationTurnBegins;
}

// 2.2.1 Investigator takes an action, if able.
// During his or her turn, an investigator is permitted to take three actions.
// Actions include: investigate, move, draw, resource, play card, activate ability, fight, engage, evade.
export interface TagTimingPhaseInvestigationTakeAction extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationTakeAction;
}

// 2.2.2 Investigator's turn ends.
// Flip the active investigator's mini card to its colorless side.
export interface TagTimingPhaseInvestigationTurnEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationTurnEnds;
}

// 2.3 Investigation phase ends.
// This step formalizes the end of the investigation phase.
export interface TagTimingPhaseInvestigationEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseInvestigationEnds;
}

// III. Enemy phase

// 3.1 Enemy phase begins.
// This step formalizes the beginning of the enemy phase.
export interface TagTimingPhaseEnemyBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseEnemyBegins;
}

// 3.2 Hunter enemies move.
// Resolve the hunter keyword for each ready, unengaged enemy that has the hunter keyword.
export interface TagTimingPhaseEnemyHunterMove extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseEnemyHunterMove;
}

// 3.3 Next investigator resolves engaged enemy attacks.
// Resolve engaged enemy attacks in player order.
// Each ready, engaged enemy makes an attack against the investigator to which it is engaged.
export interface TagTimingPhaseEnemyAttacks extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseEnemyAttacks;
}

// 3.4 Enemy phase ends.
// This step formalizes the end of the enemy phase.
export interface TagTimingPhaseEnemyEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseEnemyEnds;
}

// IV. Upkeep phase

// 4.1 Upkeep phase begins.
// This step formalizes the beginning of the upkeep phase.
export interface TagTimingPhaseUpkeepBegins extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepBegins;
}

// 4.2 Reset actions.
// Flip each investigator's mini card back to its colored side.
export interface TagTimingPhaseUpkeepResetActions extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepResetActions;
}

// 4.3 Ready exhausted cards.
// Simultaneously ready each exhausted card.
export interface TagTimingPhaseUpkeepReadyCards extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepReadyCards;
}

// 4.4 Each investigator draws 1 card and gains 1 resource.
// In player order, each investigator draws 1 card, then each gains 1 resource.
export interface TagTimingPhaseUpkeepDrawResource extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepDrawResource;
}

// 4.5 Each investigator checks hand size.
// In player order, each investigator with more than 8 cards in hand discards down to 8.
export interface TagTimingPhaseUpkeepCheckHandSize extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepCheckHandSize;
}

// 4.6 Upkeep phase ends.
// This step formalizes the end of the upkeep phase.
// As the upkeep phase is the final phase in the round, this also formalizes the end of the round.
export interface TagTimingPhaseUpkeepEnds extends TagTimingPhaseSequenceBase {
  type: TagTypeTimingPhaseSequence.PhaseUpkeepEnds;
}
