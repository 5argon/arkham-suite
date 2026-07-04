import { Tag } from "./tag-interface-union.js";

export interface TaggedCard {
  code: string;
  name: string;
  text: string;
  /**
   * Stat metadata (NOT tags) carried alongside the text so tag authors can judge
   * icon/level/type-aware tags (e.g. a non-skill level-0 wild icon, or a card with
   * two effective commit icons). Populated from the resolved card database by the
   * ingress/enrich scripts; optional so older files still type-check.
   */
  /** Card level (XP), e.g. 0–5. Undefined for unleveled cards (e.g. weaknesses). */
  level?: number;
  /** Card type code: "asset" | "event" | "skill" | "investigator" | … */
  cardType?: string;
  /** Printed commit/skill icons, one entry per icon, e.g. ["willpower","wild"]. */
  icons?: string[];
  tags: Tag[];
}

export type DynamicValue = number | "dynamic";
export type BoostValue = DynamicValue;

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
