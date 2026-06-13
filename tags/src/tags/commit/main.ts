import { TagBase } from "../../base.js";

export enum TagTypeCommit {
  CommitOtherInvestigator = "commit-other-investigator",
  CommitFromNonHand = "commit-from-non-hand",
  CommitFetch = "commit-fetch",
  CommitMax = "commit-max",
  CommitBenefitsPerformer = "commit-benefits-performer",
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
