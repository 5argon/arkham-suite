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
  /**
   * Ordered scenarios that carry log entries, each with its ArkhamCards `type`
   * (`'story'` = a playable scenario; `'interlude'`/`'epilogue'` = narrative
   * breaks). Lets the app list playable scenarios in campaign order and skip
   * interludes — e.g. the per-scenario XP highscore only applies to `'story'`.
   * Ids match `entry.scenario` (post-curation remap).
   */
  scenarioMeta?: ScenarioMeta[];
  /**
   * The per-difficulty starting chaos bag, as `difficulty -> { tokenCode: count }`
   * (token codes match kohaku's `chaosTokenCode`). Lets the app seed the chaos-bag
   * editor to the campaign's starting tokens and scope special tokens (e.g. EotE's
   * `frost`) to the campaigns that actually use them. Absent when not derivable.
   */
  startingChaosBag?: Record<string, Record<string, number>>;
  sections: LogSectionDef[];
  entries: LogEntryDef[];
  achievements: AchievementDef[];
  /**
   * Conditional flavor moments gated on a play's roster — a specific investigator,
   * an investigator with a given trait, or one of a given class/faction triggers a
   * bonus paragraph or a setup role (e.g. PtC's Lola starting backstage, the
   * Dream-Eaters' class dreams, TFA's expedition leader). Fully derivable from the
   * roster + which scenarios a play reached, so a profile can light up the ones a
   * player has triggered. Absent for campaigns with none. The display strings live
   * in `-en.specialInteractions`. */
  specialInteractions?: SpecialInteractionDef[];
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
  /** EotE seal glyphs placed/recovered — a fixed 5-seal image toggle grid. */
  | 'seals'
  /** Calendar / time-passed tracking. */
  | 'calendar'
  /** A visual header/divider, not a data section. */
  | 'header';

export interface ScenarioMeta {
  /** Scenario id (matches `entry.scenario`). */
  id: string;
  /** ArkhamCards scenario type: `'story'` (playable), `'interlude'`, `'epilogue'`, … */
  type: string;
  /**
   * The resolutions a player can be sent to DIRECTLY at this scenario's end, in
   * book order — the "first choice" set: `no_resolution` (or its
   * `_resigned`/`_defeated`/`_act_N` flavours) plus the non-hidden `R#`. Excludes
   * sub-resolutions reached only from within another (ArkhamCards `hidden`) and
   * the auto `investigator_defeat`. Absent for scenarios with no resolutions
   * (interludes). Lets the app offer a "which ending did you reach?" picker and
   * track resolution coverage.
   */
  resolutions?: string[];
  /**
   * Curated per-scenario "Extra" choices the campaign log never records — e.g.
   * PtC Dim Carcosa's "Hastur version" (which Act 2 you faced). The player picks
   * one option in the editor's Extra tab; the English labels live in
   * `-en.scenarioChoices`, keyed by `"<scenario>.<choiceId>"`.
   */
  choices?: ScenarioChoice[];
  /**
   * Fan-made scenario: ArkhamCards tags it with a `custom` block (creator +
   * download link) rather than shipping it as an FFG product. Used to keep
   * community side-stories out of the official standalone catalogue.
   */
  fanMade?: boolean;
  /**
   * Per-resolution consequences a first-choice resolution inflicts when reached
   * — currently the death/madness trauma the ArkhamCards app applies
   * automatically (killed / driven insane). Keyed by resolution id (a subset of
   * {@link resolutions}; resolutions with no such effect are absent). Derived
   * deterministically by `extract.mjs` from the ArkhamCards resolution→step
   * graph, so it stays correct on every regen (no curation). Lets the app tally
   * "endings that killed vs drove insane the party" across a player's recorded
   * resolutions ({@link ScenarioChoice}/reserved `__resolution`).
   */
  resolutionEffects?: Record<string, ResolutionEffect>;
}

/**
 * What reaching one resolution does to the investigators / the scenario,
 * beyond the win/loss recorded in the campaign log. Currently scopes to the
 * dramatic trauma the ArkhamCards app auto-applies at resolutions: investigators
 * killed and/or driven insane.
 */
export interface ResolutionEffect {
  /**
   * The trauma this resolution inflicts, one entry per distinct ArkhamCards
   * `trauma` target (most resolutions have exactly one). A single resolution can
   * both kill and madden (different targets), hence a list.
   */
  trauma: ResolutionTrauma[];
  /**
   * The scenario `result` this resolution sets, when it sets one: `'win'`,
   * `'lose'`, or `'mixed'` (a branch that can be either). Absent when it sets no
   * result — a mid-campaign casualty ending where an investigator dies but the
   * campaign continues (e.g. NOTZ The Midnight Masks R3). Lets the app separate
   * a plain TPK loss from a pyrrhic win (win + killed/insane) or a casualty.
   */
  result?: 'win' | 'lose' | 'mixed';
}

/** One death/madness trauma a resolution inflicts (see {@link ResolutionEffect}). */
export interface ResolutionTrauma {
  /** Investigators in scope are killed. */
  killed?: boolean;
  /** Investigators in scope are driven insane. */
  insane?: boolean;
  /**
   * Who suffers it, verbatim from the ArkhamCards `trauma` effect:
   * `'all'` (the whole party — the only target fully derivable per-investigator),
   * `'lead_investigator'`, `'not_resigned'`, `'defeated'`, `'resigned'`, … For
   * non-`'all'` targets a per-investigator tally needs in-scenario state the log
   * doesn't capture, so they count only toward the per-ending tally.
   */
  target: string;
  /**
   * The trauma is gated behind a choice made WITHIN the resolution (so reaching
   * the resolution does not guarantee it). The recorded `__resolution` can't
   * distinguish the branch, so a tally should treat this ending as "could kill /
   * madden", not "did".
   */
  conditional?: boolean;
}

/** A per-scenario manual choice (see {@link ScenarioMeta.choices}). */
export interface ScenarioChoice {
  /** Language-neutral choice id, e.g. `hastur_version`. */
  id: string;
  /** Language-neutral option ids in display order, e.g. `['I', 'II', 'III']`. */
  options: string[];
  /**
   * How the editor renders the picker. `dropdown` (default) for a plain select;
   * `radio` for a short mutually-exclusive set the player should see at a glance
   * (e.g. TSK Dealings in the Dark's "Act 2 Setup", labelled by the revealed
   * chaos tokens); `counter` for a numeric value (e.g. TSK Sanguine Shadows'
   * "Targets" tally) — `options` is empty and the value is bounded by
   * {@link min}/{@link max}.
   */
  control?: 'dropdown' | 'radio' | 'counter';
  /** For `counter` control: inclusive lower bound (default 0). */
  min?: number;
  /** For `counter` control: inclusive upper bound. */
  max?: number;
}

export interface LogSectionDef {
  id: string;
  type: SectionType;
  /** App-internal section (ArkhamCards hidden bookkeeping); hide from the UI. */
  hidden?: boolean;
  /**
   * Render as its own top-level (major) section rather than nesting under the
   * preceding `header` divider. For campaign-wide rosters/trackers the source
   * lists after a scenario header — e.g. EotE's "Expedition Team" partner roster,
   * which trails the "The Heart of Madness" header but is not part of it.
   */
  major?: boolean;
  /**
   * For a `cards` section, restricts which cards the picker offers — mirroring
   * the ArkhamCards `card_choice` query the extractor cannot ingest (it lives on
   * the surrounding `input`, not the `campaign_log_cards` effect). A card is
   * offered if its trait set intersects `traits` OR its code is in `codes`. When
   * absent the picker offers the whole card pool. (e.g. dwl's "Sacrificed to
   * Yog-Sothoth" → `{ traits: ['Ally'] }`.)
   */
  cardFilter?: { traits?: string[]; codes?: string[] };
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
  /**
   * A campaign-resolution entry that declares how the campaign ENDED. Stamped
   * from curation (`outcomes`) so clear-status is derivable without per-campaign
   * code: a play whose `recordedLogs` contains any `outcome:'win'` entry cleared
   * the campaign. Tagged by MECHANICAL outcome — stylish "win…?" / pyrrhic
   * resolutions are `'win'`. `'special'` marks a rival-faction-triumphs / "funny"
   * ending (e.g. TCU's Silver Twilight Lodge or Coven victory in Union and
   * Disillusion): NOT a clear and NOT a plain loss — excluded from clear% but
   * surfaced as its own rare-ending cell.
   */
  outcome?: 'win' | 'loss' | 'special';
  /**
   * For a `win` outcome: a superior / harder "better" ending vs a standard win
   * (e.g. NOTZ `umordhoth_repelled`, TCU `azathoth_slumbers`). Lets the app show
   * "best ending reached" and rank wins. Standard wins leave this unset.
   */
  outcomeQuality?: 'best';
  /** App-internal bookkeeping entry (hidden section); excluded from the dropdown. */
  hidden?: boolean;
  /**
   * This entry can be recorded MORE THAN ONCE — its identity is the card + number it
   * carries, not the entry itself (e.g. Fortune and Folly's "Stashed: #name# (#X#)" and
   * "Alarm level: #name# (#X#)"). The recording UI keeps it selectable after it is added
   * instead of removing it from the dropdown. Set via curation `entryOverrides`.
   */
  repeatable?: boolean;
  /**
   * For a `cards`/choice entry, restricts the cards the `#name#` picker offers — by card
   * type (`types`, e.g. `['asset']` or `['investigator']`), trait, or explicit code. When
   * absent the picker offers its default pool. Set via curation `entryOverrides`.
   */
  cardFilter?: { types?: string[]; traits?: string[]; codes?: string[] };
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
   * A THIRD kind between `infer` (auto) and manual: auto-derivable, but ONLY by a consumer that has
   * the player's per-scenario "Extra" inputs (arkham.life), not from the campaign log alone. Its
   * derivation can't be expressed as an {@link AchievementInference} rule (it spans optional-scenario
   * Extra choices with negation), so the consuming app computes it. Log-only consumers (e.g. the
   * arkham-starter planner) MUST treat it as manual/pencil — only `infer` means "log-derivable".
   * Example: TSK's "Trust Nobody / Everybody" (4 of a token AND never removing it — the "never
   * removing" half needs the Extra-recorded acts of trust/secrecy).
   */
  lifeInfer?: boolean;
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
  /**
   * A campaign-log entry was recorded (checked). For a cross-off-able entry
   * (`crossOut`), the optional `crossed` flag further constrains its state:
   *   omitted → recorded, crossed or not (the historical meaning);
   *   `false` → recorded and NOT crossed off — still "held" (e.g. an EotE
   *             supply carried all the way to the Summit);
   *   `true`  → recorded and crossed off (spent / lost).
   */
  | { type: 'log'; key: string; crossed?: boolean }
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
  /**
   * A per-scenario "Extra" choice value (the recorded `scenarioMeta[].choices`
   * input). For a `counter` choice the recorded value is compared to `min`/`max`
   * (e.g. Dead Heat "not a single civilian slain" = `slain_civilians` max 0); for a
   * dropdown/radio choice pass `is` to match the selected option id(s). Undefined
   * (not recorded) leaves the achievement indeterminate.
   */
  | { type: 'scenarioChoice'; scenario: string; choice: string; min?: number; max?: number; is?: string | string[] }
  /**
   * A partner in a `partner` section has the given status (e.g. `resolute`).
   * With `absent: true` the rule inverts — satisfied when the partner does NOT
   * have the status (e.g. EotE "there and back again" = each member's name was
   * never crossed off, i.e. `status:'name_crossed', absent:true`).
   */
  | { type: 'partnerStatus'; section: string; partner: string; status: string; absent?: boolean }
  /** All sub-rules hold. */
  | { type: 'allOf'; of: AchievementInference[] }
  /** Any sub-rule holds. */
  | { type: 'anyOf'; of: AchievementInference[] };

// ---------------------------------------------------------------------------
// Special interactions (roster-gated flavor moments)

/**
 * A conditional flavor moment a campaign triggers when the party's roster meets a
 * condition (see {@link CampaignLogDb.specialInteractions}). The logic lives here;
 * the title + our-own-words "why" blurb live in `-en.specialInteractions`. The
 * gating condition is rendered by the consumer from {@link match} + the scenario
 * name + card data (so investigator/trait/class names stay localizable and are not
 * duplicated as English here).
 */
export interface SpecialInteractionDef {
  /** Language-neutral id, unique within the campaign (from the gating step id). */
  id: string;
  /** Scenario it occurs in (matches `entry.scenario` / `scenarioMeta.id`). */
  scenario: string;
  /** What triggers it: specific investigator(s), trait(s), or class/faction(s). */
  match: SpecialInteractionMatch;
  /**
   * `'any'` = party-wide ("if ANY chosen investigator has X") — one shared moment.
   * `'each'` = per-investigator ("EACH investigator with X does Y") — can fire for
   * several investigators independently (e.g. the Dream-Eaters' class dreams).
   */
  scope: 'any' | 'each';
  /**
   * Investigator card codes excluded from a trait/faction match — they have their
   * own bespoke version of the moment (e.g. TSK's "Drifter trait, excluding Wendy
   * Adams", who gets a dedicated scene). An investigator in this list never
   * satisfies the match even if their trait/class otherwise qualifies.
   */
  exclude?: string[];
  /**
   * When the moment is a setup ROLE rather than a flavor read, the role it assigns
   * (e.g. `'lead'`, `'pilot'`, `'backstage'`). Prose-only roles the source doesn't
   * branch on are curated in. Omitted for plain flavor reads.
   */
  role?: string;
  /**
   * The investigator may DECLINE the moment even when eligible — it sits behind a
   * player choice (e.g. the Dream-Eaters' dreams: matching the class only OFFERS
   * the dream, the player can skip it). Roster + scenario then proves it was
   * *possible*, not that it happened, so a profile shows it as "could have" unless
   * the player confirms via Extra input. Omitted (forced) for moments that always
   * fire when eligible (e.g. Lola starting backstage). Set by curation.
   */
  optional?: boolean;
  /**
   * When the moment records a campaign-log entry, the rule that proves it actually
   * triggered — reusing the achievement inference vocabulary (usually a single
   * `log` of the entry it writes, e.g. TCU's "Under Arrest"). A consumer that has
   * the recorded log evaluates this for a definitive lit/unlit, independent of the
   * roster. Absent for pure flavor reads, which derive from roster + scenario only.
   */
  infer?: AchievementInference;
  /** Provenance: `'extracted'` from a branch condition, or `'curated'` (prose-only). */
  source?: 'extracted' | 'curated';
}

/**
 * The roster predicate a {@link SpecialInteractionDef} fires on — match by a
 * specific investigator card code, by trait, or by class/faction. Within a kind
 * the listed values are OR'd (any one satisfies). Trait/faction values match
 * case-insensitively.
 */
export type SpecialInteractionMatch =
  | { kind: 'code'; codes: string[] }
  | { kind: 'trait'; traits: string[] }
  | { kind: 'faction'; factions: string[] };

export interface EnSpecialInteraction {
  /**
   * Our-own-words, ONE-LINE explanation of what happens when the condition is met
   * (e.g. "Winifred pilots the plane herself"). The widget leads with the gating
   * condition + scenario, so this is the only display string that matters.
   */
  text: string;
  /**
   * Optional short name for the moment (e.g. "Guardian Dream"). Auto-seeded by the
   * extractor for curation reference; the widget renders the condition instead, so
   * it is not required.
   */
  title?: string;
  /** Spoiler spans within `text` to blur until revealed (same convention as EnEntry). */
  spoiler?: string[];
}

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
  /** specialInteractionId -> title + "why" blurb (see {@link SpecialInteractionDef}). */
  specialInteractions?: Record<string, EnSpecialInteraction>;
  /**
   * Optional labels for special-section items (partner names, key names,
   * supply names, relationship NPC names…), keyed by item id.
   */
  items?: Record<string, string>;
  /**
   * Labels for {@link ScenarioMeta.choices}, keyed by `"<scenario>.<choiceId>"`.
   */
  scenarioChoices?: Record<string, EnScenarioChoice>;
  /**
   * Display name for each scenario, keyed by its {@link ScenarioMeta.id} (the
   * ArkhamCards `scenario_name`/`full_name`). Lets the UI label a scenario with
   * its real title — e.g. the standalone picker — instead of de-slugging the id.
   */
  scenarioNames?: Record<string, string>;
}

export interface EnScenarioChoice {
  label: string;
  /** Optional per-option labels keyed by option id (default: the option id itself). */
  options?: Record<string, string>;
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
