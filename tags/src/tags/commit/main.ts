import { TagBase } from "../../base.js";
import { TestingBasicAction } from "../../kohaku.js";

export enum TagTypeCommit {
  CommitOtherInvestigator = "commit-other-investigator",
  CommitFromNonHand = "commit-from-non-hand",
  CommitFetch = "commit-fetch",
  CommitMax = "commit-max",
  CommitBenefitsPerformer = "commit-benefits-performer",
  CommitDuringBasicAction = "commit-during-basic-action",
  CommitDuringAttack = "commit-during-attack",
  CommitDuringEvade = "commit-during-evade",
}

interface TagCommitBase extends TagBase {}

/**
 * The card's beneficial effect targets "the [evading/investigating/performing] investigator"
 * — whoever performs the committed test, which may be another player. This is what makes a
 * skill a true SUPPORT card (Eureka!, Take Heart: the search/draw/resources go to the
 * performer). The general, effect-agnostic counterpart of move-investigator-performer;
 * contrast effects worded for "you"/the owner (Guts), which are NOT support. Feeds Support.
 */
export interface TagCommitBenefitsPerformer extends TagCommitBase {
  type: TagTypeCommit.CommitBenefitsPerformer;
}

/**
 * Commit a card to another investigator's skill test, possibly at range
 * (e.g. Carson-style remote support).
 */
export interface TagCommitOtherInvestigator extends TagCommitBase {
  type: TagTypeCommit.CommitOtherInvestigator;
  range?: "your-location" | "connecting" | "any";
}

/** Commit a card from somewhere other than your hand. */
export interface TagCommitFromNonHand extends TagCommitBase {
  type: TagTypeCommit.CommitFromNonHand;
  source?: "deck-top" | "discard" | "attached";
}

/** Dig out and force-commit a skill card. */
export interface TagCommitFetch extends TagCommitBase {
  type: TagTypeCommit.CommitFetch;
  source?: "own-deck" | "investigator-discard";
}

/** A cap on the maximum number of cards committed (per skill test). */
export interface TagCommitMax extends TagCommitBase {
  type: TagTypeCommit.CommitMax;
  value?: number;
}

/**
 * The skill's bonus is gated on being committed during a BASIC action's test —
 * "While X is committed during a basic <fight/evade/investigate> action, it gains …"
 * (the Dream-Eaters trio: Brute Force, Sharp Vision, Expeditious Retreat).
 * NOTE: cards that react to PERFORMING basic actions in general (Close the Circle,
 * EotE) are a different mechanic — give them their own tag when that pack lands.
 */
export interface TagCommitDuringBasicAction extends TagCommitBase {
  type: TagTypeCommit.CommitDuringBasicAction;
  action?: TestingBasicAction;
}

/**
 * Commit restricted to (or bonus gated on) a test made during an ATTACK — any
 * attack, including ability-granted ones, unlike commit-during-basic-action
 * (Daring: "Commit only to a skill test during an attack or evasion attempt").
 * Marks the skill as attack support.
 */
export interface TagCommitDuringAttack extends TagCommitBase {
  type: TagTypeCommit.CommitDuringAttack;
}

/**
 * Commit restricted to (or bonus gated on) a test made during an EVASION
 * attempt — any evade, not just the basic action (Daring). Marks the skill as
 * evasion support.
 */
export interface TagCommitDuringEvade extends TagCommitBase {
  type: TagTypeCommit.CommitDuringEvade;
}
