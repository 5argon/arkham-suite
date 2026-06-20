/**
 * Per-campaign data for the campaign-log recording page.
 *
 * Each official campaign is described by TWO files in this directory:
 *
 *   `<code>-db.json`  — language-neutral logic/structure (CampaignLogDb)
 *   `<code>-en.json`  — English display text, localizable (CampaignLogEn)
 *
 * The two are linked by a stable, language-neutral key. For log entries the key
 * is the composite `"<section>.<id>"`, mirroring ArkhamCards' (section, id)
 * addressing — so a future ArkhamCards integration can ingest a player's log
 * automatically. For sections/achievements the key is the bare `id`.
 *
 * Source of truth: the ArkhamCards `arkham-cards-data` reference under
 * `life/references/arkham-cards-data-master`. The `_tools/extract.mjs` script
 * deterministically captures every `campaign_log*` effect into a draft; the
 * spoiler spans and special-section structure are then curated on top.
 */

export interface CampaignLogDb {
  /** Our campaign code (matches kohaku `Campaign` where applicable). */
  code: string;
  /** English campaign name (also in -en; kept here for convenience). */
  name: string;
  kind: 'campaign' | 'return' | 'standalone';
  /** For return campaigns: the base campaign id whose log is inherited. */
  originalId?: string;
  /** ArkhamCards campaign data version, when present. */
  version?: number;
  /** Ordered scenario ids — used to group entries and scope spoilers. */
  scenarios: string[];
  sections: LogSectionDef[];
  entries: LogEntryDef[];
  achievements: AchievementDef[];
  /** Consistency rules over recorded entries, for the UI to warn on. */
  validators?: LogValidator[];
}

/**
 * A consistency rule the recording UI can check. Currently the story-branch
 * case: a set of entries that are alternate outcomes of one decision, so at most
 * one may be recorded. Be careful to scope each rule to a SINGLE decision point —
 * e.g. a character can be kidnapped at one juncture and rescued at another, which
 * are different decisions, not a conflict.
 */
export interface LogValidator {
  /** At most one of `entries` may be recorded together. */
  type: 'mutuallyExclusive';
  /** Composite `"<section>.<id>"` keys that conflict. */
  entries: string[];
  /** The scenario the decision belongs to (context for the warning). */
  scenario?: string;
}

export type SectionType =
  /** A list of checkable note entries (the common case). */
  | 'notes'
  /** A single numeric counter for the whole section. */
  | 'count'
  /** Records a free list of cards (e.g. "Sacrificed to Yog-Sothoth"). */
  | 'cards'
  /** A per-investigator numeric counter. */
  | 'investigatorCount'
  /** A per-investigator checklist. */
  | 'investigatorChecklist'
  /** A plain checklist (no narrative entries). */
  | 'checklist'
  /** Partner/ally roster with per-partner status (eoe expedition, tdc). */
  | 'partner'
  /** Per-NPC relationship level (fhv). */
  | 'relationship'
  /** Supply purchasing (tfa). */
  | 'supplies'
  /** Scarlet Keys with bearer (tskc). */
  | 'scarletKeys'
  /** Alien glyph tracking (tdc). */
  | 'glyphs'
  /** Calendar / time-passed tracking. */
  | 'calendar'
  /** A visual header/divider, not a data section. */
  | 'header';

export interface LogSectionDef {
  id: string;
  type: SectionType;
  /** App-internal section (ArkhamCards hidden bookkeeping); hide from the UI. */
  hidden?: boolean;
  /** Player may add free-form entries (e.g. "Sacrificed to Yog-Sothoth"). */
  freeform?: boolean;
  /**
   * For special sections, the structured roster the UI renders (partners,
   * keys, supplies, glyphs, relationship NPCs…). Item ids are language-neutral;
   * their labels live in `-en.items`. Per-item structured state (partner stats,
   * supply cost…) rides on each item.
   */
  items?: SectionItem[];
  // --- special-section state schema (type-specific; drives a bespoke editor) ---
  /** `partner`: the trackable status vocabulary (alive/resolute/mia/eliminated…). */
  statuses?: string[];
  /** `scarletKeys`: each key tracks which investigator/place bears it. */
  trackBearer?: boolean;
  /** `supplies`/`investigatorCount`: tracked separately per investigator. */
  perInvestigator?: boolean;
  /** `relationship`/`count`/`investigatorCount`: counter bounds. */
  min?: number;
  max?: number;
}

export interface SectionItem {
  id: string;
  /** Optional referenced card code (for partners/keys backed by a card). */
  code?: string;
  // partner (`partner` section)
  health?: number;
  sanity?: number;
  resoluteHealth?: number;
  resoluteSanity?: number;
  // supply (`supplies` section)
  cost?: number;
  repeatable?: boolean;
  /** Section-specific extra fields. */
  [k: string]: unknown;
}

export type EntryKind =
  /** Boolean checkbox note — the common case. */
  | 'note'
  /** Numeric value recorded against the entry. */
  | 'count'
  /** A list of cards recorded against the entry. */
  | 'cards'
  /** A per-investigator numeric value. */
  | 'investigatorCount'
  /** Free text. */
  | 'text'
  /** A task with progress (eoe/tdc). */
  | 'task';

export interface LogEntryDef {
  /** ArkhamCards entry id. Combined with `section` forms the en key. */
  id: string;
  section: string;
  kind: EntryKind;
  /** Source scenario id (grouping + spoiler scope). */
  scenario: string;
  /**
   * The input the recording UI must prompt for when this entry is chosen.
   * Absent for plain boolean notes.
   */
  param?: EntryParam;
  /** This entry can be crossed out / removed (a state reversal exists). */
  crossOut?: boolean;
  /** ArkhamCards drew this with a circled bullet. */
  decorate?: 'circle';
  /** App-internal bookkeeping entry (hidden section); excluded from the dropdown. */
  hidden?: boolean;
}

export interface EntryParam {
  type: 'count' | 'cards' | 'investigatorCount' | 'text';
  /** For `count`: optional bounds. */
  min?: number;
  max?: number;
  /** For `cards`: how the cards are chosen. */
  cards?: {
    /** `fixed` = pick among `codes`; `choice` = any player/encounter card. */
    mode: 'fixed' | 'choice';
    codes?: string[];
  };
}

export interface AchievementDef {
  id: string;
  type: 'binary' | 'count' | 'list';
  /** For `list`: ordered item ids (labels in -en). */
  items?: string[];
  /**
   * For `list` achievements: per-item inference, keyed by item id. Each item is
   * auto-checked when its rule is satisfied (usually a `log` of the entry it
   * represents); the whole achievement is earned when every item is satisfied.
   * Items absent from this map are checked manually. Used instead of a top-level
   * `infer`. Because each item carries its own link, version differences resolve
   * cleanly: the base campaign keeps only the items whose link exists there, so a
   * Return-to superset (e.g. 10 mementos) injects as the base subset (8) while the
   * per-item earned-state stays synchronized by item id.
   */
  itemInfer?: Record<string, AchievementInference>;
  /** For `count`: the goal/target value when fixed. */
  max?: number;
  /**
   * The family this achievement's earned-state aggregates under — the base
   * campaign code (e.g. `dwl` for both `dwl` and `rtdwl`). Earned-state should
   * be keyed by `(family, id)` so earning it in any family member counts once.
   */
  family?: string;
  /**
   * Also earnable in the base campaign of the family (Return-to achievements
   * that describe base-scenario feats). Set from the human review. When true,
   * the achievement is injected into the base campaign's data too.
   */
  shared?: boolean;
  /** Provenance: the campaign code this shared achievement was inherited from. */
  from?: string;
  /**
   * Auto-derivable from recorded campaign data. When present and satisfied, the
   * achievement is marked earned automatically; the UI greys out the manual
   * toggle and explains it is inferred from the recorded log.
   */
  infer?: AchievementInference;
  /**
   * A prerequisite for a *manually* tracked achievement: the recorded log state
   * the player must have if they legitimately earned it. Unlike `infer`, this
   * never auto-marks the achievement — the player still ticks it by hand. When
   * they do, the UI evaluates `requires`; if it resolves to `false` (the relevant
   * log is recorded but the prerequisite is unmet/absent), warn that an expected
   * prerequisite is missing. If it resolves to `undefined` (the data isn't
   * recorded at all — e.g. a cross-campaign rule outside 8-part linked mode),
   * stay silent. For feats that can't be fully inferred but have a known,
   * checkable precondition (e.g. "use the Clasp of Black Onyx" → `took_onyx_clasp`).
   */
  requires?: AchievementInference;
  /**
   * The kohaku `Scenario` code this achievement is earned in, when it is tied to
   * one specific scenario (most "manual" feats are, e.g. "Add the Hidden Library
   * to the victory display in Echoes of the Past" → `echoes_of_the_past`). Lets
   * the UI filter achievements for the scenario being played and offer a
   * per-scenario check shortcut. Omitted for campaign-wide achievements
   * (e.g. "Win the campaign on Expert").
   */
  scenario?: string;
}

/**
 * A rule that derives an achievement's earned-state from recorded campaign data.
 * Log references use the composite `"<section>.<id>"` key (or a section id for
 * `logCount` count sections).
 */
export type AchievementInference =
  /** Played/won at this difficulty (e.g. `'expert'`). */
  | { type: 'difficulty'; is: string | string[] }
  /** Number of active ultimatums is within range. */
  | { type: 'ultimatums'; min?: number; max?: number }
  /** A campaign-log entry was recorded (checked). */
  | { type: 'log'; key: string }
  /** A campaign-log entry was NOT recorded. */
  | { type: 'logAbsent'; key: string }
  /** A count entry/section value is within range. */
  | { type: 'logCount'; key: string; min?: number; max?: number }
  /** A specific card/item is recorded in a `cards`/`scarletKeys`/list section. */
  | { type: 'sectionHas'; section: string; item: string }
  /** The number of recorded items in a section is within range. */
  | { type: 'sectionCount'; section: string; min?: number; max?: number }
  /** Count of a chaos-token type in the final chaos bag is within range. */
  | { type: 'chaosToken'; token: string; min?: number; max?: number }
  /** A partner in a `partner` section has the given status (e.g. `alive`). */
  | { type: 'partnerStatus'; section: string; partner: string; status: string }
  /** All sub-rules hold. */
  | { type: 'allOf'; of: AchievementInference[] }
  /** Any sub-rule holds. */
  | { type: 'anyOf'; of: AchievementInference[] };

// ---------------------------------------------------------------------------

export interface CampaignLogEn {
  code: string;
  name: string;
  /** sectionId -> title. */
  sections: Record<string, string>;
  /** `"<section>.<id>"` -> entry text. */
  entries: Record<string, EnEntry>;
  /** achievementId -> achievement text. */
  achievements: Record<string, EnAchievement>;
  /**
   * Optional labels for special-section items (partner names, key names,
   * supply names, relationship NPC names…), keyed by item id.
   */
  items?: Record<string, string>;
}

export interface EnEntry {
  /** Display text; may contain ArkhamDB markup like `[skull]` and `<i>…</i>`. */
  text: string;
  /**
   * Substrings of `text` to blur as spoilers until revealed. Hide the
   * spoiler-sensitive nouns only — leave enough surrounding text that the
   * entry stays distinguishable from its siblings in the dropdown.
   */
  spoiler?: string[];
}

export interface EnAchievement {
  title: string;
  text: string;
  /** For `list` achievements: itemId -> label. */
  items?: Record<string, string>;
}
