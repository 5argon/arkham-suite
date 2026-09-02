import { Tag } from "./tag-interface-union.js";

/**
 * A card with its tags. `level` / `cardType` / `icons` are stat metadata (not tags) carried
 * alongside the text so tag authors can judge icon/level/type-aware tags; the ingress scripts
 * fill them from the resolved card database.
 */
export interface TaggedCard {
  code: string;
  name: string;
  text: string;
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

export enum TimingQualifier {
  Before = "before",
  When = "when",
  AtIf= "at/if",
  After = "after",
}
