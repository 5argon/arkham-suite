import { TagBase } from "../../base.js";

export enum TagTypeDiscardFromPlay {
  DiscardFromPlaySelf = "discard-from-play-self",
  DiscardFromPlaySelfNoUses = "discard-from-play-self-no-uses",
}

interface TagDiscardFromPlayBase extends TagBase {}

export interface TagDiscardFromPlaySelf extends TagDiscardFromPlayBase {
  type: TagTypeDiscardFromPlay.DiscardFromPlaySelf;
}

export interface TagDiscardFromPlaySelfNoUses extends TagDiscardFromPlayBase {
  type: TagTypeDiscardFromPlay.DiscardFromPlaySelfNoUses;
}
