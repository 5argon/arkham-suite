import { TagBase } from "../../base.js";

export enum TagTypeDiscardFromPlay {
  DiscardFromPlaySelf = "discard-from-play-self",
  DiscardFromPlaySelfNoUses = "discard-from-play-self-no-uses",
  DiscardTreacheryInPlay = "discard-treachery-in-play",
}

interface TagDiscardFromPlayBase extends TagBase {}

export interface TagDiscardFromPlaySelf extends TagDiscardFromPlayBase {
  type: TagTypeDiscardFromPlay.DiscardFromPlaySelf;
}

export interface TagDiscardFromPlaySelfNoUses extends TagDiscardFromPlayBase {
  type: TagTypeDiscardFromPlay.DiscardFromPlaySelfNoUses;
}

/** Discard/remove a treachery that is ALREADY in play (ongoing/attached) — e.g. discarding your threat-area cards (Cheat Death) or a treachery from play (Alter Fate). Removal, NOT a cancel. */
export interface TagDiscardTreacheryInPlay extends TagDiscardFromPlayBase {
  type: TagTypeDiscardFromPlay.DiscardTreacheryInPlay;
}
