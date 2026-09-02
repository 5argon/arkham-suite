import { TagBase } from "../../base.js";

// Timing windows, regardless of whether the ability is a fast action, a free triggered
// ability, or a reaction.
export enum TagTypeTimingWhen {
  TimingWhenEnemyAttacks = "timing-when-enemy-attacks",
  TimingWhenDefeatEnemy = "timing-when-defeat-enemy",
  TimingWhenEnemySpawnsYourLocation = "timing-when-enemy-spawns-your-location",
  TimingWhenWouldFailTest = "timing-when-would-fail-test",
  TimingWhenSearchDeck = "timing-when-search-deck",
}

interface TagTimingWhenBase extends TagBase {}

export interface TagTimingWhenEnemyAttacks extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenEnemyAttacks;
}

export interface TagTimingWhenDefeatEnemy extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenDefeatEnemy;
}

export interface TagTimingWhenEnemySpawnsYourLocation extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenEnemySpawnsYourLocation;
}

/** Reactive window at the moment a test WOULD fail (modified value known, failure not yet locked) — lets a last-second boost flip it (Lucky!). Distinct from timing-after-fail-skill-test. */
export interface TagTimingWhenWouldFailTest extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenWouldFailTest;
}

/**
 * Window at the moment an investigator WOULD search a deck (their own or the
 * encounter deck) — Mandy Thompson's signature search-enhancement window.
 * Distinct from deck-search-reaction (a card reacting to being FOUND).
 */
export interface TagTimingWhenSearchDeck extends TagTimingWhenBase {
  type: TagTypeTimingWhen.TimingWhenSearchDeck;
}
