/**
 * Lifetime official achievements (earned in any play) and the union state custom achievements
 * measure. A Return-to `shared` achievement, which campaign-data injects into the base campaign
 * under the same family and id, counts toward the base family.
 */
import {
	achievementsFor,
	evaluateAchievement,
	getCampaignLog,
	isCleared,
	type AchievementDef,
	type CampaignLog,
	type EnAchievement,
	type RecordedCampaignState
} from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import { manualTickKey } from '../records/recorded-state';
import { tskTrustAchievements } from '../campaigns/tsk/rules';
import { achievementFamilyOf } from '../records/campaign-family';

/** One sub-item of a `list` achievement (e.g. each survivor in "There and Back Again"). */
export interface ProfileAchievementItem {
	id: string;
	label: string;
	earned: boolean;
}
export interface ProfileFamilyAchievement {
	id: string;
	title: string;
	text: string;
	earned: boolean;
	inferred: boolean;
	/** Plays that earned it. */
	earnCount: number;
	earnedTiers: string[];
	/** `list` achievements only. */
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

/** Whether one play earned the achievement, inferred or ticked. TSK's two "Trust …" achievements
 *  (`lifeInfer`) need Extra inputs and a rule campaign-data can't express, so they are computed here. */
export function playEarned(
	def: AchievementDef,
	rec: CampaignRecord,
	log: CampaignLog,
	progress?: ReturnType<typeof evaluateAchievement>
): boolean {
	const base = isInferred(def)
		? (progress ?? evaluateAchievement(def, rec.recorded)).earned === true || rec.manual.has(def.id)
		: rec.manual.has(def.id);
	if (base) return true;
	if (def.lifeInfer && (def.id === 'trust_nobody' || def.id === 'trust_everybody')) {
		return tskTrustAchievements({
			recordedLogs: rec.recorded.recordedLogs ?? new Set<string>(),
			crossedLogs: rec.recorded.crossedLogs,
			scenarioChoices: rec.scenarioChoices,
			finalChaosBag: rec.recorded.finalChaosBag,
			won: isCleared(log, rec.recorded) === true
		})[def.id];
	}
	return false;
}

export interface AchievementTierStats {
	def: AchievementDef;
	en: EnAchievement;
	family: string;
	earned: boolean;
	/** Plays that earned it. */
	earnCount: number;
	earnedTiers: string[];
	/** `list` achievements only: each item, earned in any play (inferred or ticked). */
	items?: Record<string, boolean>;
}

/** Lifetime state per (family, achievement), grouped by family. */
export function aggregateOfficialTiered(
	records: CampaignRecord[]
): Map<string, AchievementTierStats[]> {
	const byKey = new Map<string, AchievementTierStats & { _tiers: Set<string> }>();
	for (const rec of records) {
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		const tier = rec.recorded.difficulty ?? 'standard';
		for (const a of achievementsFor(log)) {
			const family = achievementFamilyOf(log, a.def.family);
			const isList = a.def.type === 'list' && Array.isArray(a.def.items);
			const progress =
				isInferred(a.def) || isList ? evaluateAchievement(a.def, rec.recorded) : undefined;
			const earned = playEarned(a.def, rec, log, progress);
			const key = `${family}::${a.def.id}`;
			let e = byKey.get(key);
			if (!e) {
				e = {
					def: a.def,
					en: a.en,
					family,
					earned: false,
					earnCount: 0,
					earnedTiers: [],
					_tiers: new Set()
				};
				if (isList) e.items = {};
				byKey.set(key, e);
			}
			if (e.items && a.def.items) {
				for (const itemId of a.def.items) {
					const auto = progress?.items?.[itemId] === true;
					const manual = rec.manual.has(manualTickKey(a.def.id, itemId));
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

/** Several plays' recorded states merged: sets unioned, counts summed. */
export interface AggregateState extends RecordedCampaignState {
	recordedLogs: Set<string>;
	logCounts: Record<string, number>;
	recordedSectionItems: Record<string, Set<string>>;
	finalChaosBag: Record<string, number>;
}

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
		for (const [t, n] of Object.entries(s.finalChaosBag ?? {}))
			finalChaosBag[t] = (finalChaosBag[t] ?? 0) + n;
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

/** Distinct recorded log keys in a section. */
export function countLogsWithPrefix(state: AggregateState, sectionId: string): number {
	const prefix = sectionId + '.';
	let n = 0;
	for (const k of state.recordedLogs) if (k.startsWith(prefix)) n++;
	return n;
}
