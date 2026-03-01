/**
 * achievement-aggregate.ts — pure cross-campaign aggregation over the player's
 * recorded campaigns. Lifetime totals: an achievement is earned if earned in ANY
 * play; a Return-to `shared` achievement (which campaign-data injects into the
 * base campaign under the same `family` + id) thus counts toward the base family.
 * Union states power life-local custom achievements (lifetime tallies, coverage).
 */
import {
	achievementsFor,
	evaluateAchievement,
	getCampaignLog,
	isCleared,
	type AchievementDef,
	type CampaignLog,
	type EnAchievement,
	type RecordedCampaignState,
} from '@5argon/arkham-campaign-data';
import type { StandaloneEntry } from './recorded-state';
import { tskTrustAchievements } from './tsk-profile';

/** One recorded campaign: its kohaku code + the derived state + manual tick keys. */
export interface CampaignRecord {
	campaignCode: string;
	recorded: RecordedCampaignState;
	/** Manual tick keys: `def.id` and `def.id::itemId`. */
	manual: ReadonlySet<string>;
	/** Extra Imports: per-scenario earned XP (reserved `__xp` section). */
	scenarioXp?: Record<string, number>;
	/** Extra Imports: per-scenario choices (key `"scenario.choiceId"` → value). */
	scenarioChoices?: Record<string, string>;
	/** Extra Imports: per-scenario resolution reached (scenario id → resolution id). */
	scenarioResolutions?: Record<string, string>;
	/** Extra Imports: scenario ids manually marked SKIPPED (e.g. EotE Ice and Death II/III). */
	scenarioSkipped?: string[];
	/** Cards-CHOICE `#name#` picks (composite entry key → chosen item id), e.g. EotE
	 *  "killed in the plane crash" → the expedition member. Read from raw log args. */
	nameChoices?: Record<string, string>;
	/** Scenarios played in entry order (the travel "route") — TSK Routings. */
	route?: string[];
	/** Per-scenario TSK-solver tier picks: `"<scenarioId>.<level|version>"` → option id. */
	scenarioTiers?: Record<string, string>;
	/** Per Scarlet Key item id → non-NPC bearer investigator codes (TSK Scarlet Keys widgets). */
	scarletKeyBearers?: Record<string, string[]>;
	/** Card codes erased from existence (TSK Dancing Mad / On Thin Ice), in log order. A
	 *  campaign-level log fact (not investigator-specific) — feeds the Erased From Existence widget. */
	erasedCards?: string[];
	/** Investigator codes the profile SUBJECT ran in this campaign — splits a Key BORNE by
	 *  your own investigator from one merely OBTAINED by the cell (a teammate bears it). */
	subjectInvestigators?: string[];
	/** Recorded finish date (ms epoch), for "most recent" ordering. null when unset. */
	finishDate?: number | null;
	/** Resolved player count for the play (`auto` resolved from participants); null when unknown.
	 *  Used by player-count-keyed widgets (e.g. Dead Heat's per-player-count civilian tables). */
	playerCount?: number | null;
	/** A 1-player play where one human piloted several decks. With `playerCount === 1` this
	 *  splits the solo clear grids: true solo (`!multiHanded`) vs solo X-handed (`multiHanded`). */
	multiHanded?: boolean;
	/** Extra Imports: standalone scenarios played inside this campaign (reserved `__standalone`). */
	standalones?: StandaloneEntry[];
	/**
	 * The doc campaign id this record came from. Used as the join key to attribute
	 * a play's `all`-target trauma to its deck investigators at assembly time
	 * (deck data the logs segment must not depend on). Absent in unit-test records.
	 */
	campaignId?: string;
}

export interface EarnedAchievement {
	def: AchievementDef;
	en: EnAchievement;
	family: string;
	earned: boolean;
}

// Serializable view types (shared with the profile components).
/** One sub-item of a `list` achievement (e.g. each survivor in "There and Back Again"). */
export interface ProfileAchievementItem {
	id: string;
	label: string;
	/** Earned in at least one play (OR across plays). */
	earned: boolean;
}
export interface ProfileFamilyAchievement {
	id: string;
	title: string;
	text: string;
	earned: boolean;
	inferred: boolean;
	/** How many plays earned it (for "×N" badges). */
	earnCount: number;
	/** Sorted difficulty tiers it was earned at (e.g. `['hard','standard']`). */
	earnedTiers: string[];
	/** For `list` achievements: each item with its lifetime earned state, in order. */
	items?: ProfileAchievementItem[];
}
export interface ProfileFamily {
	family: string;
	name: string;
	earned: number;
	total: number;
	achievements: ProfileFamilyAchievement[];
}

function isInferred(def: AchievementDef): boolean {
	return Boolean(def.infer || def.itemInfer);
}

/**
 * Earned for ONE play. arkham.life can auto-check both `infer` (log + scenarioChoice rules) and
 * `lifeInfer` achievements, since it holds the per-scenario Extra inputs. The two `lifeInfer` TSK
 * "Trust …" achievements have no expressible rule, so we compute them here.
 */
function playEarned(def: AchievementDef, rec: CampaignRecord, log: CampaignLog, progress?: ReturnType<typeof evaluateAchievement>): boolean {
	const base = isInferred(def) ? (progress ?? evaluateAchievement(def, rec.recorded)).earned === true || rec.manual.has(def.id) : rec.manual.has(def.id);
	if (base) return true;
	if (def.lifeInfer && (def.id === 'trust_nobody' || def.id === 'trust_everybody')) {
		return tskTrustAchievements({
			recordedLogs: rec.recorded.recordedLogs ?? new Set<string>(),
			crossedLogs: rec.recorded.crossedLogs,
			scenarioChoices: rec.scenarioChoices,
			finalChaosBag: rec.recorded.finalChaosBag,
			won: isCleared(log, rec.recorded) === true,
		})[def.id];
	}
	return false;
}

/**
 * Lifetime earned status per `(family, achievementId)`, ORed across every play.
 * Grouped by family (base campaign code).
 */
export function aggregateOfficial(records: CampaignRecord[]): Map<string, EarnedAchievement[]> {
	const byKey = new Map<string, EarnedAchievement>();
	for (const rec of records) {
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		for (const a of achievementsFor(log)) {
			const family = a.def.family ?? log.db.code;
			const earned = playEarned(a.def, rec, log);
			const key = `${family}::${a.def.id}`;
			const existing = byKey.get(key);
			if (existing) existing.earned = existing.earned || earned;
			else byKey.set(key, { def: a.def, en: a.en, family, earned });
		}
	}
	const byFamily = new Map<string, EarnedAchievement[]>();
	for (const e of byKey.values()) {
		const arr = byFamily.get(e.family);
		if (arr) arr.push(e);
		else byFamily.set(e.family, [e]);
	}
	return byFamily;
}

/** Per-(family, achievement) earned status enriched with difficulty-tier detail. */
export interface AchievementTierStats {
	def: AchievementDef;
	en: EnAchievement;
	family: string;
	/** Earned in at least one play (OR across plays). */
	earned: boolean;
	/** How many plays earned it (for "✦×N" badges / signature ranking). */
	earnCount: number;
	/** Sorted difficulty tiers it was earned at (e.g. `['hard','standard']`). */
	earnedTiers: string[];
	/**
	 * For `list` achievements: per-item earned state, ORed across plays (an item
	 * is earned if it was earned in any play, auto-inferred or manually ticked).
	 * Present (possibly all-false) only for list achievements; absent otherwise.
	 */
	items?: Record<string, boolean>;
}

/**
 * Like {@link aggregateOfficial}, but records per achievement the set of
 * difficulty tiers it was earned at and how many plays earned it — powering
 * per-tier completion (Standard 100% / Hard 0%), "re-earn on Hard" goals, and
 * earn-count badges. Inferred achievements are evaluated from recorded state;
 * manual ones from the play's manual ticks; each carries the play's difficulty.
 */
export function aggregateOfficialTiered(records: CampaignRecord[]): Map<string, AchievementTierStats[]> {
	const byKey = new Map<string, AchievementTierStats & { _tiers: Set<string> }>();
	for (const rec of records) {
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		const tier = rec.recorded.difficulty ?? 'standard'; // match clear-status bucketing
		for (const a of achievementsFor(log)) {
			const family = a.def.family ?? log.db.code;
			const isList = a.def.type === 'list' && Array.isArray(a.def.items);
			// Evaluate once when the result is needed (inferred whole, or a list's items).
			const progress = isInferred(a.def) || isList ? evaluateAchievement(a.def, rec.recorded) : undefined;
			const earned = playEarned(a.def, rec, log, progress);
			const key = `${family}::${a.def.id}`;
			let e = byKey.get(key);
			if (!e) {
				e = { def: a.def, en: a.en, family, earned: false, earnCount: 0, earnedTiers: [], _tiers: new Set() };
				if (isList) e.items = {};
				byKey.set(key, e);
			}
			// List achievements: OR each item's earned state (auto via itemInfer, or manual tick).
			if (e.items && a.def.items) {
				for (const itemId of a.def.items) {
					const auto = progress?.items?.[itemId] === true;
					const manual = rec.manual.has(`${a.def.id}::${itemId}`);
					e.items[itemId] = (e.items[itemId] ?? false) || auto || manual;
				}
			}
			if (earned) {
				e.earned = true;
				e.earnCount += 1;
				e._tiers.add(tier);
			}
		}
	}
	const byFamily = new Map<string, AchievementTierStats[]>();
	for (const e of byKey.values()) {
		const { _tiers, ...stats } = e;
		stats.earnedTiers = [..._tiers].sort();
		const arr = byFamily.get(stats.family);
		if (arr) arr.push(stats);
		else byFamily.set(stats.family, [stats]);
	}
	return byFamily;
}

/** A merged (lifetime) projection: union sets, summed counts. */
export interface AggregateState extends RecordedCampaignState {
	recordedLogs: Set<string>;
	logCounts: Record<string, number>;
	recordedSectionItems: Record<string, Set<string>>;
	finalChaosBag: Record<string, number>;
}

/** Merge several recorded states into one lifetime projection. */
export function buildUnionState(records: CampaignRecord[]): AggregateState {
	const recordedLogs = new Set<string>();
	const logCounts: Record<string, number> = {};
	const recordedSectionItems: Record<string, Set<string>> = {};
	const finalChaosBag: Record<string, number> = {};
	const partnerStatuses: Record<string, Record<string, Set<string>>> = {};

	for (const rec of records) {
		const s = rec.recorded;
		for (const k of s.recordedLogs ?? []) recordedLogs.add(k);
		for (const [k, n] of Object.entries(s.logCounts ?? {})) logCounts[k] = (logCounts[k] ?? 0) + n;
		for (const [sec, set] of Object.entries(s.recordedSectionItems ?? {})) {
			const target = (recordedSectionItems[sec] ??= new Set<string>());
			for (const id of set) target.add(id);
		}
		for (const [t, n] of Object.entries(s.finalChaosBag ?? {})) finalChaosBag[t] = (finalChaosBag[t] ?? 0) + n;
		for (const [sec, partners] of Object.entries(s.partnerStatuses ?? {})) {
			const tp = (partnerStatuses[sec] ??= {});
			for (const [pid, statuses] of Object.entries(partners)) {
				const ts = (tp[pid] ??= new Set<string>());
				for (const st of statuses) ts.add(st);
			}
		}
	}
	return { recordedLogs, logCounts, recordedSectionItems, finalChaosBag, partnerStatuses };
}

/** Count recorded log keys under a `"<section>."` prefix (lifetime tally helper). */
export function countLogsWithPrefix(state: AggregateState, sectionId: string): number {
	const prefix = sectionId + '.';
	let n = 0;
	for (const k of state.recordedLogs) if (k.startsWith(prefix)) n++;
	return n;
}

/** Records belonging to a given family (base + its Return-to box). */
export function recordsForFamily(records: CampaignRecord[], family: string): CampaignRecord[] {
	return records.filter((r) => {
		const log = getCampaignLog(r.campaignCode);
		return log ? (log.db.code === family || (log.db.originalId ?? '') === family) : false;
	});
}
