import { TagBase } from "../../base.js";

export enum TagTypeDefeat {
  DefeatSelf = "defeat-self",
}

interface TagDefeatBase extends TagBase {}

/** The card DEFEATS your own investigator ("You are defeated") as a deliberate effect/sacrifice — "I'll see you in hell!", Ghastly Revelation, Ultimate Sacrifice. Not "if you would be defeated" prevention (Cheat Death). */
export interface TagDefeatSelf extends TagDefeatBase {
  type: TagTypeDefeat.DefeatSelf;
}
