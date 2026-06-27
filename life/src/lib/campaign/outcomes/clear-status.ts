/**
 * clear-status.ts — derive campaign clear-status from the win/loss `outcome`
 * tags that campaign-data stamps on resolution entries (see `outcomeSignals` /
 * `isCleared`). One recorded play:
 *   - **cleared**   — recorded a `win`-tagged entry (incl. dark/pyrrhic wins).
 *   - **special**   — recorded a rival-faction / "funny" ending (TCU Lodge/Coven
 *                     victory): neither a clear nor a plain loss.
 *   - **attempted** — recorded a `loss`-tagged entry, no win.
 *   - null          — no terminal resolution recorded yet (in progress / unknown).
 *
 * Plays are grouped by `familyOf` (each Return-to is its own family) into a
 * per-family × per-difficulty grid for the home/profile clear grid. Pure +
 * serializable-friendly (returns plain arrays/records).
 */
import {
  getCampaignLog,
  isCleared,
  outcomeSignals,
  type CampaignLog,
  type RecordedCampaignState,
} from '@5argon/arkham-campaign-data';
import {
  campaignToProductMap,
  chapterOneCampaigns,
  chapterOneReturnToCampaigns,
  chapterTwoSmallCampaigns,
  type Campaign,
  type Product,
} from '@5argon/arkham-kohaku';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import type { CampaignGroup } from '../profile/profile-settings';
import { familyOf, baseFamilyOf, baseFamilyOfCode } from '../records/campaign-family';

/** Per-play campaign outcome, strongest first. */
export type ClearState = 'cleared' | 'special' | 'attempted';

const RANK: Record<ClearState, number> = { cleared: 3, special: 2, attempted: 1 };

/**
 * The clear-state a single recorded play reached, or null if no resolution recorded.
 * `scenarioChoices` (the play's Extra-tab picks) lets a campaign recover a verdict its
 * log can't express: DWL's "Lost in Time and Space" Resolution 2 is a silent "win… lost
 * forever" reached only via the no-resolution ending on **Act 4** (Acts 1-3 log the R4
 * loss), so the `final_act` choice is the only signal that it was a win.
 */
export function playClearState(
  log: CampaignLog,
  recorded: RecordedCampaignState,
  scenarioChoices?: Record<string, string>,
): ClearState | null {
  const logs = recorded.recordedLogs;
  if (!logs) return null;
  if (isCleared(log, recorded) === true) return 'cleared';
  const sig = outcomeSignals(log);
  if (sig.special.some((k) => logs.has(k))) return 'special';
  if (sig.loss.some((k) => logs.has(k))) return 'attempted';
  if (
    baseFamilyOf(log) === 'dwl' &&
    scenarioChoices?.['lost_in_time_and_space.final_act'] === 'act_4'
  )
    return 'cleared';
  return null;
}

export interface CampaignClear {
  /** Campaign family = its own code (Return-to is its own family). */
  family: string;
  /** Campaign display name. */
  name: string;
  /** Strongest clear-state recorded per difficulty tier (absent tier = no play). */
  byTier: Partial<Record<string, ClearState>>;
  /** Total recorded plays across the family. */
  plays: number;
}

/**
 * Pivot recorded plays into a per-family × per-difficulty clear grid. For each
 * family/tier the strongest state across all plays wins (cleared > special >
 * attempted). The home grid then renders rows = families, columns = tracked
 * difficulty tiers, flagging "unfinished" only where the player wants.
 */
export function buildClearGrid(records: CampaignRecord[]): CampaignClear[] {
  const byFamily = new Map<string, CampaignClear>();
  for (const rec of records) {
    const log = getCampaignLog(rec.campaignCode);
    if (!log) continue;
    const family = familyOf(log);
    let entry = byFamily.get(family);
    if (!entry) {
      const baseLog = getCampaignLog(family) ?? log;
      entry = { family, name: baseLog.db.name, byTier: {}, plays: 0 };
      byFamily.set(family, entry);
    }
    entry.plays += 1;
    const state = playClearState(log, rec.recorded, rec.scenarioChoices);
    if (!state) continue;
    const tier = rec.recorded.difficulty ?? 'standard';
    const prev = entry.byTier[tier];
    if (!prev || RANK[state] > RANK[prev]) entry.byTier[tier] = state;
  }
  return [...byFamily.values()];
}

export interface ClearGridRow extends CampaignClear {
  /** kohaku Product that provides this box (for ownership scoping). */
  product: Product;
  /** Whether the player owns the product (false rows render muted / hidden). */
  owned: boolean;
}

const campaignGroupMap = new Map<Campaign, CampaignGroup>([
  ...chapterOneCampaigns.map((c): [Campaign, CampaignGroup] => [c, 'chapterOne']),
  ...chapterOneReturnToCampaigns.map((c): [Campaign, CampaignGroup] => [c, 'chapterOneReturnTo']),
  ...chapterTwoSmallCampaigns.map((c): [Campaign, CampaignGroup] => [c, 'chapterTwo']),
]);

/** The campaign group a campaign code belongs to (chapter 1 / its return-to / chapter 2),
 *  or `null` for ungrouped campaigns (standalones, anything outside the three chapters). */
export function campaignGroupOf(campaignCode: string): CampaignGroup | null {
  return campaignGroupMap.get(campaignCode as Campaign) ?? null;
}

/**
 * Every official campaign box as a grid row (unplayed → empty `byTier`), overlaid
 * with the player's recorded clear-states and flagged by product ownership. Covers
 * Chapter One, Return-to, and Chapter Two; filtered to `trackedGroups`.
 * `ownedProducts === null` means own everything.
 */
export function buildFullClearGrid(
  records: CampaignRecord[],
  ownedProducts: Product[] | null,
  trackedGroups: CampaignGroup[],
): ClearGridRow[] {
  const tracked = new Set(trackedGroups);
  const played = new Map(buildClearGrid(records).map((c) => [c.family, c]));
  const seen = new Set<string>();
  const rows: ClearGridRow[] = [];
  for (const campaign of [...chapterOneCampaigns, ...chapterOneReturnToCampaigns, ...chapterTwoSmallCampaigns]) {
    const group = campaignGroupMap.get(campaign as Campaign);
    if (!group || !tracked.has(group)) continue;
    const log = getCampaignLog(campaign);
    if (!log) continue;
    const family = familyOf(log);
    if (seen.has(family)) continue;
    seen.add(family);
    const product = campaignToProductMap[campaign as Campaign];
    const owned = ownedProducts === null || ownedProducts.includes(product);
    const base = played.get(family) ?? { family, name: log.db.name, byTier: {}, plays: 0 };
    rows.push({ ...base, product, owned });
  }
  return rows;
}

export interface WinLossTierRecord {
  plays: number;
  wins: number;
  losses: number;
  special: number;
}
export interface WinLossRecord {
  family: string;
  name: string;
  plays: number;
  /** Cleared (win) plays. */
  wins: number;
  /** Recorded-but-lost plays. */
  losses: number;
  /** Rival-faction / special-ending plays. */
  special: number;
  /** Plays with no terminal resolution recorded yet. */
  inProgress: number;
  /** Per difficulty tier breakdown. */
  byTier: Record<string, WinLossTierRecord>;
}

/**
 * Per-family win/loss record: total plays and win / loss / special / in-progress
 * counts, both overall and per difficulty tier — the data behind the "Win/Loss
 * Record" widget (e.g. *TFA: 4 plays — 3 W / 1 L · 2× Hard*).
 */
export function buildWinLossRecord(records: CampaignRecord[]): WinLossRecord[] {
  const byFamily = new Map<string, WinLossRecord>();
  for (const rec of records) {
    const log = getCampaignLog(rec.campaignCode);
    if (!log) continue;
    const family = familyOf(log);
    let e = byFamily.get(family);
    if (!e) {
      const baseLog = getCampaignLog(family) ?? log;
      e = { family, name: baseLog.db.name, plays: 0, wins: 0, losses: 0, special: 0, inProgress: 0, byTier: {} };
      byFamily.set(family, e);
    }
    e.plays += 1;
    const tier = rec.recorded.difficulty ?? 'standard';
    const t = (e.byTier[tier] ??= { plays: 0, wins: 0, losses: 0, special: 0 });
    t.plays += 1;
    const state = playClearState(log, rec.recorded, rec.scenarioChoices);
    if (state === 'cleared') (e.wins += 1), (t.wins += 1);
    else if (state === 'attempted') (e.losses += 1), (t.losses += 1);
    else if (state === 'special') (e.special += 1), (t.special += 1);
    else e.inProgress += 1;
  }
  return [...byFamily.values()];
}

/** DWL's synthetic R2 "win… lost forever" ending key + its (non-log-derivable) text.
 *  Exported so the compiled-profile hydrator reproduces this ending's text identically. */
export const DWL_WIN_LOST_FOREVER_KEY = 'dwl_win_lost_forever';
export const DWL_WIN_LOST_FOREVER_TEXT =
  'the investigators win the campaign, but are never seen again.';

export type EndingKind = 'best' | 'win' | 'special' | 'loss';
export interface Ending {
  key: string;
  text: string;
  kind: EndingKind;
  /** Whether the player has ever recorded this ending. */
  reached: boolean;
  /** How many recorded plays reached this ending. */
  count: number;
  /** Times reached per difficulty tier (e.g. `{ standard: 2, hard: 1 }`). */
  byTier: Record<string, number>;
  /** Derived from an Extra-tab input rather than the log (e.g. DWL's Act-4 R2 win) —
   *  hidden in Log-only mode, where the player only has the log. */
  nonLog?: boolean;
}
export interface CampaignEndings {
  family: string;
  name: string;
  endings: Ending[];
  reachedCount: number;
  /** Whether a `best` (superior) win ending has been reached. */
  bestReached: boolean;
}

/** Strip markup from an ending / coverage-branch entry (also drops `[token]` glyphs,
 *  unlike the achievement cleaner). Exported so the compiled-profile hydrator re-resolves
 *  ending & coverage text identically to the builders. */
export function cleanEndingText(t: string): string {
  return t
    .replace(/<\/?[ib]>/g, '')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[[a-z_]+\]/g, '')
    .replace(/#name#/g, 'them')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The display text for an ending / outcome LOG KEY (e.g. `campaign_notes.carcosa_merged` →
 *  "The realm of Carcosa merged with our own…"). The single source of outcome wording — shared
 *  by the endings list, the Campaign Overview faces, and any per-play outcome face — so they
 *  never drift. Falls back to the key when the entry has no text. */
export function endingText(log: CampaignLog, key: string): string {
  return cleanEndingText(log.en.entries[key]?.text ?? key);
}

/**
 * Per-family ending collection: every win / better-win / special / loss ending
 * the campaign offers, and which the player has reached across plays. Powers the
 * "better wins" highlight and "losses I haven't hit" coverage in one block.
 * Includes endings from any Return-to variant the player has recorded.
 */
export function buildEndings(records: CampaignRecord[]): CampaignEndings[] {
  const fam = new Map<
    string,
    {
      name: string;
      counts: Map<string, number>;
      byTier: Map<string, Record<string, number>>;
      codes: Set<string>;
    }
  >();
  for (const rec of records) {
    const log = getCampaignLog(rec.campaignCode);
    if (!log) continue;
    const family = familyOf(log);
    let info = fam.get(family);
    if (!info) {
      const baseLog = getCampaignLog(family) ?? log;
      info = {
        name: baseLog.db.name,
        counts: new Map<string, number>(),
        byTier: new Map<string, Record<string, number>>(),
        codes: new Set([family]),
      };
      fam.set(family, info);
    }
    info.codes.add(log.db.code);
    const tier = rec.recorded.difficulty ?? 'standard';
    // Count how many plays reached each ending (a play either recorded the key or
    // not) — overall and per difficulty tier.
    for (const k of rec.recorded.recordedLogs ?? []) {
      info.counts.set(k, (info.counts.get(k) ?? 0) + 1);
      const bt = info.byTier.get(k) ?? {};
      bt[tier] = (bt[tier] ?? 0) + 1;
      info.byTier.set(k, bt);
    }
    // DWL: the silent R2 "win… lost forever" (no-resolution + Act 4) writes no outcome
    // note — count it as a synthetic win ending from the Extra `final_act` choice.
    if (baseFamilyOf(log) === 'dwl' && rec.scenarioChoices?.['lost_in_time_and_space.final_act'] === 'act_4') {
      const ls = rec.recorded.recordedLogs;
      const finaleNote =
        !!ls &&
        (ls.has('campaign_notes.closed_tear') ||
          ls.has('campaign_notes.yog_sothoth_fled') ||
          ls.has('campaign_notes.yog_sothoth_became_one_with_reality') ||
          ls.has('campaign_notes.yog_sothoth_escaped'));
      if (!finaleNote) {
        info.counts.set(DWL_WIN_LOST_FOREVER_KEY, (info.counts.get(DWL_WIN_LOST_FOREVER_KEY) ?? 0) + 1);
        const bt = info.byTier.get(DWL_WIN_LOST_FOREVER_KEY) ?? {};
        bt[tier] = (bt[tier] ?? 0) + 1;
        info.byTier.set(DWL_WIN_LOST_FOREVER_KEY, bt);
      }
    }
  }

  const out: CampaignEndings[] = [];
  for (const [family, info] of fam) {
    const byKey = new Map<string, Ending>();
    for (const code of info.codes) {
      const log = getCampaignLog(code);
      if (!log) continue;
      const sig = outcomeSignals(log);
      const add = (key: string, kind: EndingKind) => {
        if (byKey.has(key)) return;
        const count = info.counts.get(key) ?? 0;
        byKey.set(key, {
          key,
          text: endingText(log, key),
          kind,
          reached: count > 0,
          count,
          byTier: info.byTier.get(key) ?? {},
        });
      };
      for (const k of sig.bestWin) add(k, 'best');
      for (const k of sig.win) add(k, 'win'); // bestWin already claimed above
      for (const k of sig.special) add(k, 'special');
      for (const k of sig.loss) add(k, 'loss');
    }
    // DWL: surface the synthetic R2 "win, lost forever" ending (counted above from the
    // Act-4 `final_act` choice) — it's the fifth DWL ending the log alone can't express.
    // Base-spanning: applies to both `dwl` and its Return-to `rtdwl`.
    if (baseFamilyOfCode(family) === 'dwl') {
      const count = info.counts.get(DWL_WIN_LOST_FOREVER_KEY) ?? 0;
      byKey.set(DWL_WIN_LOST_FOREVER_KEY, {
        key: DWL_WIN_LOST_FOREVER_KEY,
        text: DWL_WIN_LOST_FOREVER_TEXT,
        kind: 'win',
        reached: count > 0,
        count,
        byTier: info.byTier.get(DWL_WIN_LOST_FOREVER_KEY) ?? {},
        // Derived from the Extra-tab `final_act` choice — hidden in Log-only mode.
        nonLog: true,
      });
    }
    const endings = [...byKey.values()];
    if (!endings.length) continue;
    out.push({
      family,
      name: info.name,
      endings,
      reachedCount: endings.filter((e) => e.reached).length,
      bestReached: endings.some((e) => e.kind === 'best' && e.reached),
    });
  }
  return out;
}
