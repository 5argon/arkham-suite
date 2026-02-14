import { Tag } from "./tag-interface-union.js";

export interface TaggedCard {
  code: string;
  name: string;
  text: string;
  tags: Tag[];

  /**
   * For tags that technically applies to the card, but are not the main aspect of the card.
   * When finding matching cards, the search can offer to hide all matches that only match on secondary tags.
   */
  secondaryTags?: Tag[];
}

export type BoostValue = number | "dynamic";

export enum HealTarget {
  Self = "self",
  Investigator = "investigator",
  Ally = "ally",
}

export enum TimingQualifier {
  Before = "before",
  When = "when",
  AtIf= "at/if",
  After = "after",
}
