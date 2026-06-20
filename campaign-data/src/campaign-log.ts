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

/** The recorded campaign state an inference rule is evaluated against. */
export interface RecordedCampaignState {
  /** Difficulty code, e.g. `'expert'`. */
  difficulty?: string;
  /** Active ultimatum ids. */
  ultimatums?: readonly string[];
  /** Composite `"section.id"` keys that are recorded (checked). */
  recordedLogs?: ReadonlySet<string>;
  /** Count values, keyed by `"section.id"` entry key or by section id. */
  logCounts?: Readonly<Record<string, number>>;
  /** Recorded items per section: section id -> set of recorded item ids/codes. */
  recordedSectionItems?: Readonly<Record<string, ReadonlySet<string>>>;
  /** Final chaos-bag composition: token code -> count. */
  finalChaosBag?: Readonly<Record<string, number>>;
  /** Partner statuses: section id -> partner id -> set of statuses (e.g. `alive`). */
  partnerStatuses?: Readonly<Record<string, Readonly<Record<string, ReadonlySet<string>>>>>;
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
    case 'log':
      if (!state.recordedLogs) return undefined;
      return state.recordedLogs.has(infer.key);
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
    case 'partnerStatus': {
      const section = state.partnerStatuses?.[infer.section];
      if (!section) return undefined;
      return section[infer.partner]?.has(infer.status) ?? false;
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
