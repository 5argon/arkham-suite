import { TagBase } from "../../base.js";

export enum TagTypeSoak {
  SoakHealth = "soak-health",
  SoakSanity = "soak-sanity",
}

interface TagSoakBase extends TagBase {
  /** The printed health/sanity that can absorb hits — only tagged at 2 or more. */
  value: number;
}

/**
 * An asset (usually an Ally) with 2+ printed HEALTH: it can soak a point of damage without
 * being defeated, AND remains a valid target for damage-healing. Stat-derived (from the
 * printed health, not the text box). The "2+" threshold is what makes it meaningfully
 * survivable — it can take a 1-damage hit and still be healed back up. Covers both dedicated
 * soak items (Bulletproof Vest) and allies whose body is a side benefit (Guard Dog, Leo).
 */
export interface TagSoakHealth extends TagSoakBase {
  type: TagTypeSoak.SoakHealth;
}

/**
 * An asset (usually an Ally) with 2+ printed SANITY: it can soak a point of horror without
 * being defeated, AND remains a valid target for horror-healing. Stat-derived (from the
 * printed sanity, not the text box). E.g. Elder Sign Amulet (4), Peter Sylvestre (2).
 */
export interface TagSoakSanity extends TagSoakBase {
  type: TagTypeSoak.SoakSanity;
}
