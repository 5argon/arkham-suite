import { TagBase } from "../../base.js";

export enum TagTypePlayArea {
  PlayAreaToHand = "play-area-to-hand",
  PlayAreaToDeck = "play-area-to-deck",
  PlayAreaIntoPlayFromHand = "play-area-into-play-from-hand",
  PlayAreaIntoPlayFromDeck = "play-area-into-play-from-deck",
  PlayAreaIntoPlayFromDiscard = "play-area-into-play-from-discard",
  PlayAreaPlayFromOtherZone = "play-area-play-from-other-zone",
  PlayAreaFromInvestigator = "play-area-from-investigator",
}

interface TagPlayAreaBase extends TagBase {}

export interface TagPlayAreaToHand extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaToHand;
}

export interface TagPlayAreaToDeck extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaToDeck;
}

/** Put a card directly INTO play from hand, bypassing the normal play action/cost. */
export interface TagPlayAreaIntoPlayFromHand extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaIntoPlayFromHand;
}

/** Tutor a card directly into play from your deck. */
export interface TagPlayAreaIntoPlayFromDeck extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaIntoPlayFromDeck;
}

/** Put a card (or a copy) directly into play from a discard pile. */
export interface TagPlayAreaIntoPlayFromDiscard extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaIntoPlayFromDiscard;
}

/**
 * Play a card (paying its cost) from a zone other than your own hand, or let
 * another investigator play it. Distinct from the into-play "cheat" members
 * (which bypass the play action) and from recursion (return-to-hand-first).
 */
export interface TagPlayAreaPlayFromOtherZone extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaPlayFromOtherZone;
  zone: "discard" | "top-deck" | "other-hand" | "attached" | "set-aside";
}

/**
 * Put into play / use a card belonging to ANOTHER investigator — found in their deck
 * (Flare searches any investigator's deck for an Ally) or discard (A Chance Encounter plays
 * an Ally from any player's discard). The cross-deck "borrow a teammate's card" signal;
 * distinct from `deck-search-investigator` (which is helping a teammate dig their OWN deck).
 */
export interface TagPlayAreaFromInvestigator extends TagPlayAreaBase {
  type: TagTypePlayArea.PlayAreaFromInvestigator;
}
