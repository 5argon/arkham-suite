/**
 * Typed accessor over the per-campaign log data (inlined in `./generated`).
 * The library consumes kohaku's `Campaign`/`Scenario` symbols so callers share
 * one source of truth for which campaign / which scenario.
 */
import type { Campaign, Scenario } from '@5argon/arkham-kohaku';
import type {
  CampaignLogDb,
  CampaignLogEn,
  LogEntryDef,
  EnEntry,
  AchievementDef,
  AchievementInference,
  EnAchievement,
  LogValidator,
  ResolutionEffect,
  SpecialInteractionDef,
  EnSpecialInteraction,
} from './types.js';
import { DB, EN } from './generated.js';

/**
 * kohaku `Campaign` codes that differ from the ArkhamCards reference code used
 * for the data filenames. Lets callers pass a kohaku `Campaign` value directly.
 */
const CODE_ALIASES: Record<string, string> = {
  eote: 'eoe', // Edge of the Earth
  tsk: 'tskc', // The Scarlet Keys
};
const resolveCode = (code: string): string => CODE_ALIASES[code] ?? code;

export interface CampaignLog {
  db: CampaignLogDb;
  en: CampaignLogEn;
}

/** Returns the db+en pair for a campaign (kohaku `Campaign` or code), or undefined. */
export function getCampaignLog(campaign: Campaign | string): CampaignLog | undefined {
  const code = resolveCode(campaign);
  const db = DB[code];
  const en = EN[code];
  if (!db || !en) return undefined;
  return { db, en };
}

/** Campaign codes that have generated log data. */
export function availableCampaignLogCodes(): string[] {
  return Object.keys(DB).filter((code) => code in EN);
}

/**
 * Playable scenarios (ArkhamCards type `'story'`) in campaign order. Use this for
 * per-scenario features that don't apply to interludes/epilogues — e.g. the XP
 * highscore. Falls back to the distinct entry scenarios when `scenarioMeta` is
 * absent (older generated data).
 */
export function playableScenarios(log: CampaignLog): string[] {
  const meta = log.db.scenarioMeta;
  if (meta && meta.length) return meta.filter((s) => s.type === 'story').map((s) => s.id);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of log.db.entries) {
    const s = e.scenario;
    if (!s || s.startsWith('$') || s === 'campaign' || s === 'hidden' || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

/** The campaign-data code whose `scenarioMeta` is the canonical standalone catalogue. */
const STANDALONE_CATALOG_CODE = 'side';

export interface StandaloneScenario {
  /** campaign-data code that owns the catalogue entry (currently always `'side'`). */
  code: string;
  /** Scenario id (e.g. `'carnevale_of_horrors'`). */
  scenario: string;
  /** Display name (ArkhamCards `scenario_name`); a de-slugged id is the fallback. */
  name: string;
  /** First-choice resolutions in book order (empty when the scenario records none). */
  resolutions: string[];
}

function deslugScenario(id: string): string {
  return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * The catalogue of OFFICIAL standalone scenarios a player can record as having
 * been played *inside* a campaign — the FFG "Side Scenarios" collection (Carnevale
 * of Horrors, Guardians of the Abyss' two scenarios, The Labyrinths of Lunacy, …)
 * in book order. Fan-made community side-stories (ArkhamCards `custom`, flagged
 * `fanMade`) are excluded. Each carries its possible first-choice resolutions, so
 * the editor can offer the same resolution picker a regular scenario gets.
 */
export function standaloneScenarios(): StandaloneScenario[] {
  const log = getCampaignLog(STANDALONE_CATALOG_CODE);
  if (!log) return [];
  return (log.db.scenarioMeta ?? [])
    .filter((m) => m.type === 'story' && !m.fanMade)
    .map((m) => ({
      code: STANDALONE_CATALOG_CODE,
      scenario: m.id,
      name: log.en.scenarioNames?.[m.id] ?? deslugScenario(m.id),
      resolutions: m.resolutions ?? [],
    }));
}

export interface ResolvedLogEntry {
  /** Composite key `"<section>.<id>"`. */
  key: string;
  def: LogEntryDef;
  en: EnEntry;
}

/**
 * The recordable entries for a section, resolved with their English text —
 * the rows a player searches in the campaign-log dropdown. Hidden/bookkeeping
 * entries are excluded.
 */
export function sectionEntries(log: CampaignLog, sectionId: string): ResolvedLogEntry[] {
  const out: ResolvedLogEntry[] = [];
  for (const def of log.db.entries) {
    if (def.section !== sectionId || def.hidden) continue;
    const key = `${def.section}.${def.id}`;
    const en = log.en.entries[key];
    if (!en) continue;
    out.push({ key, def, en });
  }
  return out;
}

/**
 * Returns the validators that are violated by the recorded set — i.e. a
 * `mutuallyExclusive` rule with two or more of its entries recorded together.
 * The UI can warn with each conflict's entry texts.
 */
export function findValidatorConflicts(
  log: CampaignLog,
  recordedKeys: ReadonlySet<string>
): LogValidator[] {
  return (log.db.validators ?? []).filter(
    (v) => v.entries.filter((e) => recordedKeys.has(e)).length >= 2
  );
}

// ---------------------------------------------------------------------------
// Achievements

export interface ResolvedAchievement {
  def: AchievementDef;
  en: EnAchievement;
}

/** A campaign's achievements (including any inherited shared ones), resolved with text. */
export function achievementsFor(log: CampaignLog): ResolvedAchievement[] {
  return log.db.achievements
    .map((def) => ({ def, en: log.en.achievements[def.id] }))
    .filter((a): a is ResolvedAchievement => Boolean(a.en));
}

/**
 * Achievements tied to one specific scenario — e.g. to surface "achievements you
 * can earn here" alongside a scenario's setup reference. Campaign-wide
 * achievements (no `scenario`) are excluded.
 */
export function achievementsForScenario(
  log: CampaignLog,
  scenario: Scenario | string
): ResolvedAchievement[] {
  return achievementsFor(log).filter((a) => a.def.scenario === scenario);
}

// ---------------------------------------------------------------------------
// Special interactions (roster-gated flavor moments)

export interface ResolvedSpecialInteraction {
  def: SpecialInteractionDef;
  en: EnSpecialInteraction;
}

/** A campaign's special interactions, resolved with their English title + blurb. */
export function specialInteractionsFor(log: CampaignLog): ResolvedSpecialInteraction[] {
  return (log.db.specialInteractions ?? [])
    .map((def) => ({ def, en: log.en.specialInteractions?.[def.id] }))
    .filter((s): s is ResolvedSpecialInteraction => Boolean(s.en));
}

/** Special interactions that occur in one specific scenario. */
export function specialInteractionsForScenario(
  log: CampaignLog,
  scenario: Scenario | string
): ResolvedSpecialInteraction[] {
  return specialInteractionsFor(log).filter((s) => s.def.scenario === scenario);
}

/** A played investigator resolved to the fields a {@link SpecialInteractionMatch} needs. */
export interface RosterInvestigator {
  /** Investigator card code (e.g. `'03006'`). */
  code: string;
  /** The investigator's class(es), lowercased (e.g. `['rogue']`, `['guardian','mystic']`). */
  factions: readonly string[];
  /** The investigator's traits (e.g. `['Drifter','Wayfarer']`); compared case-insensitively. */
  traits: readonly string[];
}

/**
 * Whether a special interaction's `match` fires for the given roster, and which
 * investigators satisfied it. Centralizes the match semantics in the package; the
 * caller adds the "scenario was reached" gate to decide whether it actually
 * triggered. `investigators` holds every qualifying code (so a `scope:'each'`
 * caller can tally per-investigator); `matched` is true when at least one did.
 */
export function evaluateSpecialInteractionMatch(
  def: SpecialInteractionDef,
  roster: readonly RosterInvestigator[]
): { matched: boolean; investigators: string[] } {
  const m = def.match;
  const ci = (xs: readonly string[]) => xs.map((x) => x.toLowerCase());
  const excluded = def.exclude ? new Set(def.exclude) : null;
  const investigators: string[] = [];
  for (const inv of roster) {
    if (excluded && excluded.has(inv.code)) continue;
    let ok = false;
    if (m.kind === 'code') ok = m.codes.includes(inv.code);
    else if (m.kind === 'trait') {
      const want = new Set(ci(m.traits));
      ok = ci(inv.traits).some((t) => want.has(t));
    } else {
      const want = new Set(ci(m.factions));
      ok = ci(inv.factions).some((f) => want.has(f));
    }
    if (ok) investigators.push(inv.code);
  }
  return { matched: investigators.length > 0, investigators };
}

/** The recorded campaign state an inference rule is evaluated against. */
export interface RecordedCampaignState {
  /** Difficulty code, e.g. `'expert'`. */
  difficulty?: string;
  /** Active ultimatum ids. */
  ultimatums?: readonly string[];
  /** Composite `"section.id"` keys that are recorded (checked). */
  recordedLogs?: ReadonlySet<string>;
  /**
   * Composite `"section.id"` keys that are recorded but CROSSED OFF — a subset of
   * `recordedLogs`. Lets inference tell "still held" from "spent / lost" for
   * cross-off-able entries (e.g. an EotE supply carried to the Summit vs left
   * behind). Read by a `log` rule with an explicit `crossed` flag.
   */
  crossedLogs?: ReadonlySet<string>;
  /** Count values, keyed by `"section.id"` entry key or by section id. */
  logCounts?: Readonly<Record<string, number>>;
  /** Recorded items per section: section id -> set of recorded item ids/codes. */
  recordedSectionItems?: Readonly<Record<string, ReadonlySet<string>>>;
  /** Final chaos-bag composition: token code -> count. */
  finalChaosBag?: Readonly<Record<string, number>>;
  /** Partner statuses: section id -> partner id -> set of statuses (e.g. `alive`). */
  partnerStatuses?: Readonly<Record<string, Readonly<Record<string, ReadonlySet<string>>>>>;
  /** Recorded per-scenario "Extra" choice values, keyed by `"scenario.choiceId"`. */
  scenarioChoiceValues?: Readonly<Record<string, string>>;
}

/**
 * Evaluates whether an inference rule is satisfied by the recorded state — i.e.
 * whether the achievement should be auto-marked as earned. Returns `undefined`
 * when the relevant state hasn't been recorded yet (so the UI can show
 * "pending" rather than a hard false).
 */
export function evaluateInference(
  infer: AchievementInference,
  state: RecordedCampaignState
): boolean | undefined {
  switch (infer.type) {
    case 'difficulty': {
      if (state.difficulty === undefined) return undefined;
      const opts = Array.isArray(infer.is) ? infer.is : [infer.is];
      return opts.includes(state.difficulty);
    }
    case 'ultimatums': {
      if (state.ultimatums === undefined) return undefined;
      const n = state.ultimatums.length;
      return (infer.min === undefined || n >= infer.min) && (infer.max === undefined || n <= infer.max);
    }
    case 'log': {
      if (!state.recordedLogs) return undefined;
      const present = state.recordedLogs.has(infer.key);
      if (infer.crossed === undefined) return present;
      const crossed = state.crossedLogs?.has(infer.key) ?? false;
      return present && (infer.crossed ? crossed : !crossed);
    }
    case 'logAbsent':
      if (!state.recordedLogs) return undefined;
      return !state.recordedLogs.has(infer.key);
    case 'logCount': {
      const v = state.logCounts?.[infer.key];
      if (v === undefined) return undefined;
      return (infer.min === undefined || v >= infer.min) && (infer.max === undefined || v <= infer.max);
    }
    case 'sectionHas': {
      const set = state.recordedSectionItems?.[infer.section];
      if (!set) return undefined;
      return set.has(infer.item);
    }
    case 'sectionCount': {
      const set = state.recordedSectionItems?.[infer.section];
      if (!set) return undefined;
      const n = set.size;
      return (infer.min === undefined || n >= infer.min) && (infer.max === undefined || n <= infer.max);
    }
    case 'chaosToken': {
      const n = state.finalChaosBag?.[infer.token];
      if (n === undefined) return undefined;
      return (infer.min === undefined || n >= infer.min) && (infer.max === undefined || n <= infer.max);
    }
    case 'scenarioChoice': {
      const raw = state.scenarioChoiceValues?.[`${infer.scenario}.${infer.choice}`];
      if (raw === undefined || raw === '') return undefined;
      if (infer.is !== undefined) {
        const opts = Array.isArray(infer.is) ? infer.is : [infer.is];
        return opts.includes(raw);
      }
      const v = Number(raw);
      if (!Number.isFinite(v)) return undefined;
      return (infer.min === undefined || v >= infer.min) && (infer.max === undefined || v <= infer.max);
    }
    case 'partnerStatus': {
      const section = state.partnerStatuses?.[infer.section];
      if (!section) return undefined;
      const has = section[infer.partner]?.has(infer.status) ?? false;
      return infer.absent ? !has : has;
    }
    case 'allOf': {
      const rs = infer.of.map((s) => evaluateInference(s, state));
      if (rs.some((r) => r === false)) return false;
      if (rs.some((r) => r === undefined)) return undefined;
      return true;
    }
    case 'anyOf': {
      const rs = infer.of.map((s) => evaluateInference(s, state));
      if (rs.some((r) => r === true)) return true;
      if (rs.some((r) => r === undefined)) return undefined;
      return false;
    }
  }
}

export interface AchievementProgress {
  /** `true`/`false` when fully auto-determined; `undefined` when manual input is still needed. */
  earned: boolean | undefined;
  /** For `list` achievements: per-item state (`undefined` = manual / not yet recorded). */
  items?: Record<string, boolean | undefined>;
}

/**
 * Evaluates an achievement against recorded state. For `list` achievements with
 * per-item links (`itemInfer`), returns each item's auto-state and an overall
 * `earned` that is `true` only when every item is satisfied (and `undefined`
 * while any item is manual/pending). Binary/count achievements use `infer`.
 */
export function evaluateAchievement(
  def: AchievementDef,
  state: RecordedCampaignState
): AchievementProgress {
  // A `list` with a top-level `infer` (no per-item links) is earned as a whole
  // from an aggregate rule (e.g. obligations: task_progress >= 5); its items are
  // shown for reference but not individually auto-checked. Otherwise a list with
  // items uses per-item evaluation.
  if (def.itemInfer || (def.type === 'list' && def.items && !def.infer)) {
    const items: Record<string, boolean | undefined> = {};
    for (const id of def.items ?? []) {
      const rule = def.itemInfer?.[id];
      items[id] = rule ? evaluateInference(rule, state) : undefined; // no link => manual
    }
    const states = Object.values(items);
    const earned = states.length && states.every((s) => s === true)
      ? true
      : states.some((s) => s === undefined)
        ? undefined
        : false;
    return { earned, items };
  }
  if (def.infer) return { earned: evaluateInference(def.infer, state) };
  return { earned: undefined }; // manual
}

/**
 * Does an inference rule (recursively) depend on recorded data that ISN'T in the campaign log —
 * a per-scenario `scenarioChoice` Extra, the active `ultimatums`, or the `difficulty` played (none of
 * which the log records; arkham.life knows them from the rest of the campaign record). Such rules are
 * undecidable from the log alone → "extra" scope.
 */
function inferUsesExtras(rule: AchievementInference | undefined): boolean {
  if (!rule) return false;
  if (rule.type === 'scenarioChoice' || rule.type === 'ultimatums' || rule.type === 'difficulty') return true;
  if (rule.type === 'allOf' || rule.type === 'anyOf') return rule.of.some(inferUsesExtras);
  return false;
}

/**
 * How an achievement can be auto-derived — the gears/pencil distinction:
 *  - `'log'`    — from the campaign log alone, so ANY consumer can infer it ("gears" everywhere);
 *  - `'extra'`  — auto-derivable, but only by a consumer that holds the per-scenario "Extra" inputs
 *                 (its `infer`/`itemInfer` references a `scenarioChoice`, or it carries `lifeInfer`).
 *                 Log-only consumers (e.g. the arkham-starter planner) MUST treat it as manual/pencil;
 *                 Extra-aware consumers (arkham.life) show it as gears and auto-check it;
 *  - `'manual'` — no inference at all; always a manual tick.
 */
export function achievementInferScope(def: AchievementDef): 'log' | 'extra' | 'manual' {
  const hasInfer = Boolean(def.infer || def.itemInfer);
  if (!hasInfer && !def.lifeInfer) return 'manual';
  if (def.lifeInfer || inferUsesExtras(def.infer) || Object.values(def.itemInfer ?? {}).some(inferUsesExtras)) return 'extra';
  return 'log';
}

const numRange = (min?: number, max?: number): string =>
  min !== undefined && max !== undefined ? (min === max ? `${min}` : `${min}–${max}`) : min !== undefined ? `${min}+` : max !== undefined ? `≤${max}` : 'any';

/** One human-readable line for an inference rule, resolving log keys / scenarios to their display text. */
function describeRule(rule: AchievementInference, log: CampaignLog): string {
  const noteText = (key: string) => log.en.entries?.[key]?.text ?? key.replace(/^campaign_notes\./, '');
  const itemName = (id: string) => log.en.items?.[id] ?? id.replace(/_/g, ' ');
  switch (rule.type) {
    case 'difficulty':
      return `Played on ${[rule.is].flat().join(' / ')}`;
    case 'ultimatums':
      return `${numRange(rule.min, rule.max)} ultimatums active`;
    case 'log':
      return `“${noteText(rule.key)}”${rule.crossed === true ? ' (crossed off)' : rule.crossed === false ? ' (still held)' : ''}`;
    case 'logAbsent':
      return `“${noteText(rule.key)}” not recorded`;
    case 'logCount':
      return `${rule.key}: ${numRange(rule.min, rule.max)}`;
    case 'sectionHas':
      return `“${itemName(rule.item)}” recorded`;
    case 'sectionCount':
      return `${numRange(rule.min, rule.max)} recorded in ${rule.section.replace(/_/g, ' ')}`;
    case 'chaosToken':
      return `${numRange(rule.min, rule.max)} ${rule.token.replace(/_/g, ' ')} in the final chaos bag`;
    case 'scenarioChoice': {
      const sc = log.en.scenarioChoices?.[`${rule.scenario}.${rule.choice}`];
      const scen = log.en.scenarioNames?.[rule.scenario] ?? rule.scenario;
      const label = sc?.label ?? rule.choice;
      const val = rule.is !== undefined ? [rule.is].flat().map((v) => sc?.options?.[v] ?? v).join(' / ') : numRange(rule.min, rule.max);
      return `(Extra) ${scen} — ${label}: ${val}`;
    }
    case 'partnerStatus':
      return `${rule.partner} ${rule.absent ? 'is NOT' : 'is'} ${rule.status}`;
    case 'allOf':
      return `All of: ${rule.of.map((r) => describeRule(r, log)).join(', ')}`;
    case 'anyOf':
      return `Any of the following: ${rule.of.map((r) => describeRule(r, log)).join(', ')}`;
  }
}

/**
 * Human-readable lines describing what an achievement auto-checks (for a "why is this a gear?" modal).
 * `allOf` is flattened into one line per condition. Empty for a purely manual achievement, or for a
 * `lifeInfer` one with no expressible rule (the consumer can fall back to the achievement's own text).
 */
export function describeAchievementInference(def: AchievementDef, log: CampaignLog): string[] {
  if (def.infer) return def.infer.type === 'allOf' ? def.infer.of.map((r) => describeRule(r, log)) : [describeRule(def.infer, log)];
  if (def.itemInfer) return Object.values(def.itemInfer).map((r) => describeRule(r, log));
  return [];
}

/**
 * For a *manually* checked achievement, tests its `requires` prerequisite against
 * recorded state:
 *   `'ok'`      — no prerequisite, or it is satisfied.
 *   `'warn'`    — the prerequisite is evaluable but unmet (expected log missing):
 *                 the player likely hasn't actually earned this; surface a warning.
 *   `'unknown'` — the prerequisite's data isn't recorded (e.g. a cross-campaign
 *                 rule outside 8-part linked mode): stay silent.
 * Independent of `infer`/`evaluateAchievement` — call it when the player ticks a
 * manual achievement.
 */
export function checkPrerequisite(
  def: AchievementDef,
  state: RecordedCampaignState
): 'ok' | 'warn' | 'unknown' {
  if (!def.requires) return 'ok';
  const r = evaluateInference(def.requires, state);
  return r === false ? 'warn' : r === undefined ? 'unknown' : 'ok';
}

// ---------------------------------------------------------------------------
// Outcome / clear-status

/**
 * The composite entry keys that declare the campaign won vs lost (curated
 * `outcome` tags). Empty arrays when a campaign hasn't been outcome-tagged yet.
 */
export function outcomeSignals(log: CampaignLog): {
  win: string[];
  loss: string[];
  special: string[];
  /** Subset of `win` tagged as a superior / "better" ending. */
  bestWin: string[];
} {
  const win: string[] = [];
  const loss: string[] = [];
  const special: string[] = [];
  const bestWin: string[] = [];
  for (const def of log.db.entries) {
    const key = `${def.section}.${def.id}`;
    if (def.outcome === 'win') {
      win.push(key);
      if (def.outcomeQuality === 'best') bestWin.push(key);
    } else if (def.outcome === 'loss') loss.push(key);
    else if (def.outcome === 'special') special.push(key);
  }
  return { win, loss, special, bestWin };
}

/** One scenario's resolution-trauma effect, paired with its scenario id. */
export interface ScenarioResolutionEffect {
  /** Scenario id (matches `entry.scenario` / `scenarioMeta.id`). */
  scenario: string;
  /** Resolution id (a first-choice resolution of that scenario). */
  resolution: string;
  effect: ResolutionEffect;
}

/**
 * Every (scenario, resolution) in this campaign whose resolution kills and/or
 * drives the party insane — flattened from `scenarioMeta[].resolutionEffects`.
 * Lets a profile join the player's recorded resolutions (reserved `__resolution`)
 * against the trauma each ending inflicts to tally deaths vs insanities. Empty
 * when the campaign's data predates resolution-effect extraction.
 */
export function resolutionTraumaEffects(log: CampaignLog): ScenarioResolutionEffect[] {
  const out: ScenarioResolutionEffect[] = [];
  for (const sm of log.db.scenarioMeta ?? []) {
    if (!sm.resolutionEffects) continue;
    for (const [resolution, effect] of Object.entries(sm.resolutionEffects)) {
      out.push({ scenario: sm.id, resolution, effect });
    }
  }
  return out;
}

/**
 * Whether a recorded play *cleared* the campaign: it recorded at least one entry
 * tagged `outcome:'win'`. Stylish/pyrrhic wins count (they are tagged `'win'`).
 * Returns `undefined` only when no log state is present at all (so the UI can
 * show "in progress"); `false` means recorded-but-not-won (attempted/lost).
 */
export function isCleared(log: CampaignLog, state: RecordedCampaignState): boolean | undefined {
  if (!state.recordedLogs) return undefined;
  const { win } = outcomeSignals(log);
  return win.some((key) => state.recordedLogs!.has(key));
}

/**
 * Splits an entry's text into ordered segments marked as spoiler or not, so the
 * UI can blur the spoiler segments. Spans are matched left-to-right.
 */
export function spoilerSegments(en: EnEntry): { text: string; spoiler: boolean }[] {
  const spans = en.spoiler ?? [];
  if (!spans.length) return [{ text: en.text, spoiler: false }];
  const segments: { text: string; spoiler: boolean }[] = [];
  let rest = en.text;
  // Repeatedly find the earliest occurrence of any span.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let bestIdx = -1;
    let bestSpan = '';
    for (const span of spans) {
      const i = rest.indexOf(span);
      if (i !== -1 && (bestIdx === -1 || i < bestIdx)) {
        bestIdx = i;
        bestSpan = span;
      }
    }
    if (bestIdx === -1) {
      if (rest) segments.push({ text: rest, spoiler: false });
      break;
    }
    if (bestIdx > 0) segments.push({ text: rest.slice(0, bestIdx), spoiler: false });
    segments.push({ text: bestSpan, spoiler: true });
    rest = rest.slice(bestIdx + bestSpan.length);
  }
  return segments;
}
