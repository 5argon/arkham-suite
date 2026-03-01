/**
 * extra-imports.ts — aggregation over the opt-in "Extra Imports" data that is
 * not reverse-engineerable from the campaign log (recorded in the editor's Extra
 * tab). Per-scenario earned XP → a lifetime highscore per scenario across plays,
 * plus per-scenario CHOICES (e.g. PtC Hastur version) with a played-vs-won split:
 * a choice value is "won" when the play that recorded it also cleared the
 * campaign (the choice AND-ed with the winning-outcome log).
 */
import { getCampaignLog, isCleared, playableScenarios } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from './achievement-aggregate';
import { choiceLabel } from './scenario-extras';

export interface ChoiceValueStat {
  value: string;
  /** Plays that recorded this choice value. */
  played: number;
  /** Of those, plays that also won the campaign (choice ∧ winning outcome). */
  won: number;
}
export interface ScenarioChoiceAgg {
  id: string;
  label: string;
  values: ChoiceValueStat[];
}
export interface ScenarioXpStat {
  scenario: string;
  /** Display name (campaign-data `scenarioNames`), de-slugged id as fallback. */
  name: string;
  best: number;
  total: number;
  plays: number;
  /** Best XP recorded per difficulty tier (e.g. `{ standard: 12, hard: 8 }`). */
  bestByTier: Record<string, number>;
  /** Plays recorded per difficulty tier (drives the per-difficulty "played" hover). */
  playsByTier: Record<string, number>;
  choices?: ScenarioChoiceAgg[];
}
export interface CampaignScenarioXp {
  family: string;
  name: string;
  scenarios: ScenarioXpStat[];
  totalBest: number;
}

interface XpAgg {
  best: number;
  total: number;
  plays: number;
  byTier: Record<string, number>;
  playsByTier: Record<string, number>;
}
interface ChoiceAgg {
  label: string;
  byValue: Map<string, { played: number; won: number }>;
}
interface FamilyAgg {
  name: string;
  /** Every playable scenario in campaign (typical play) order. */
  order: string[];
  /** Scenario id → display name (campaign-data `scenarioNames`). */
  names: Record<string, string>;
  /** Every scenario id the campaign currently knows (scenarioMeta) — the gate that
   *  keeps deprecated recorded keys (e.g. TSK's old location ids) from rendering. */
  known: Set<string>;
  xp: Map<string, XpAgg>;
  ch: Map<string, Map<string, ChoiceAgg>>;
}

/** De-slug a scenario id when campaign-data carries no display name. */
function deslugScenario(id: string): string {
  return id
    .replace(/^\d+[a-z]?_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Choices consumed by a dedicated widget (e.g. EotE `city_version` → the City of
 *  the Elder Things widget), so they don't also clutter the shared XP view. */
const WIDGET_CONSUMED_CHOICES = new Set(['city_version']);

export function buildScenarioXp(records: CampaignRecord[]): CampaignScenarioXp[] {
  const byFamily = new Map<string, FamilyAgg>();
  for (const rec of records) {
    const xp = rec.scenarioXp ?? {};
    const choices = rec.scenarioChoices ?? {};
    if (Object.keys(xp).length === 0 && Object.keys(choices).length === 0) continue;
    const log = getCampaignLog(rec.campaignCode);
    if (!log) continue;
    const family = log.db.originalId ?? log.db.code;
    let info = byFamily.get(family);
    if (!info) {
      const baseLog = getCampaignLog(family) ?? log;
      info = {
        name: baseLog.db.name,
        order: playableScenarios(baseLog),
        names: baseLog.en.scenarioNames ?? {},
        known: new Set((baseLog.db.scenarioMeta ?? []).map((m) => m.id)),
        xp: new Map(),
        ch: new Map(),
      };
      byFamily.set(family, info);
    }
    const tier = rec.recorded.difficulty ?? 'standard';
    for (const [scenario, val] of Object.entries(xp)) {
      let s = info.xp.get(scenario);
      if (!s) {
        s = { best: 0, total: 0, plays: 0, byTier: {}, playsByTier: {} };
        info.xp.set(scenario, s);
      }
      s.best = Math.max(s.best, val);
      s.total += val;
      s.plays += 1;
      s.byTier[tier] = Math.max(s.byTier[tier] ?? 0, val);
      s.playsByTier[tier] = (s.playsByTier[tier] ?? 0) + 1;
    }
    // A choice value is "won" iff this play cleared the campaign.
    const won = isCleared(log, rec.recorded) === true;
    for (const [key, value] of Object.entries(choices)) {
      const dot = key.indexOf('.');
      if (dot < 0) continue;
      const scenario = key.slice(0, dot);
      const choiceId = key.slice(dot + 1);
      if (WIDGET_CONSUMED_CHOICES.has(choiceId)) continue;
      let cm = info.ch.get(scenario);
      if (!cm) {
        cm = new Map();
        info.ch.set(scenario, cm);
      }
      let c = cm.get(choiceId);
      if (!c) {
        c = { label: choiceLabel(log, scenario, choiceId), byValue: new Map() };
        cm.set(choiceId, c);
      }
      let v = c.byValue.get(value);
      if (!v) {
        v = { played: 0, won: 0 };
        c.byValue.set(value, v);
      }
      v.played += 1;
      if (won) v.won += 1;
    }
  }

  const out: CampaignScenarioXp[] = [];
  for (const [family, info] of byFamily) {
    // Every playable scenario in campaign order, plus any recorded scenario the
    // campaign STILL knows (in scenarioMeta) appended after — so the widget shows the
    // full campaign at a glance. Recorded keys the campaign no longer knows (deprecated
    // artifacts, e.g. TSK's old location ids) are filtered out, not rendered as rows.
    const orderIndex = new Map(info.order.map((id, i) => [id, i]));
    const recorded = [...info.xp.keys(), ...info.ch.keys()].filter((id) => info.known.has(id));
    const ids = new Set<string>([...info.order, ...recorded]);
    const scenarios: ScenarioXpStat[] = [...ids]
      .sort(
        (a, b) =>
          (orderIndex.get(a) ?? Number.MAX_SAFE_INTEGER) - (orderIndex.get(b) ?? Number.MAX_SAFE_INTEGER),
      )
      .map((scenario) => {
        const x = info.xp.get(scenario) ?? { best: 0, total: 0, plays: 0, byTier: {}, playsByTier: {} };
        const cm = info.ch.get(scenario);
        const choices: ScenarioChoiceAgg[] | undefined = cm
          ? [...cm.entries()].map(([id, c]) => ({
              id,
              label: c.label,
              values: [...c.byValue.entries()]
                .map(([value, s]) => ({ value, ...s }))
                .sort((a, b) => a.value.localeCompare(b.value)),
            }))
          : undefined;
        // Disambiguate numbered repeats (e.g. fatal_mirage_2 → "Fatal Mirage 2")
        // that campaign-data collapses to one display name.
        const baseName = info.names[scenario] ?? deslugScenario(scenario);
        const rep = /^(.+)_(\d+)$/.exec(scenario);
        const name =
          rep && orderIndex.has(rep[1]) && !baseName.endsWith(rep[2])
            ? `${baseName} ${rep[2]}`
            : baseName;
        return {
          scenario,
          name,
          best: x.best,
          total: x.total,
          plays: x.plays,
          bestByTier: x.byTier,
          playsByTier: x.playsByTier,
          choices,
        };
      });
    out.push({ family, name: info.name, scenarios, totalBest: scenarios.reduce((n, s) => n + s.best, 0) });
  }
  return out;
}
