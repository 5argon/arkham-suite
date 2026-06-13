import { TagBase } from "../../base.js";

export enum TagTypeSkillCommit {
  SkillCommitGainIcon = "skill-commit-gain-icon",
  SkillCommitDoubleIcon = "skill-double-icon",
  SkillCommitWildIcon = "nonskill-lv0-wild-icon",
  SkillCommitTwoEffectiveIcons = "nonskill-lv0-two-effective-icons",
  SkillCommitNoIcons = "no-commit-icons",
}

interface TagSkillCommitBase extends TagBase {}

/**
 * A committed card GAINS extra skill icons (often [wild]), frequently scaling
 * off a variable (charges spent, enemies engaged), or a support asset adds an
 * icon to an already-committed card. Distinct from skill-value margin tags and
 * from boost (which raise the investigator's value, not committed icons).
 */
export interface TagSkillCommitGainIcon extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitGainIcon;
}

/** A skill card that commits 2 matching icons (Overpower, Perception, Manual Dexterity, Guts, Unexpected Courage) — the strong basic-skill group. Stat-derived from printed icons. */
export interface TagSkillCommitDoubleIcon extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitDoubleIcon;
}

/**
 * A NON-SKILL, LEVEL-0 card that carries a WILD commit icon — genuinely special, since
 * a level-0 asset/event you'd usually rather play instead doubles as a flexible commit.
 * (Wild icons on higher-level cards are common and unremarkable, so they are NOT tagged.)
 * Stat-derived from printed icons + level + type.
 */
export interface TagSkillCommitWildIcon extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitWildIcon;
}

/**
 * A NON-SKILL, LEVEL-0 card with TWO effective commit icons (a wild counts as one) — a
 * level-0 asset/event that can stand in for a neutral skill card when committed. E.g.
 * "Look what I found!" (intellect + intellect), Cunning Distraction (willpower + wild).
 * Stat-derived from printed icons + level + type.
 */
export interface TagSkillCommitTwoEffectiveIcons extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitTwoEffectiveIcons;
}

/**
 * An EVENT with NO printed commit icons at all — rare and notable, since you can never
 * commit it to a skill test (its only use is to play it). Stat-derived from printed icons
 * + type. (Most assets lack icons and are unremarkable, so this is scoped to events.)
 */
export interface TagSkillCommitNoIcons extends TagSkillCommitBase {
  type: TagTypeSkillCommit.SkillCommitNoIcons;
}
