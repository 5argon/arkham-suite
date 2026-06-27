/**
 * hydrate-compiled-profile.ts — the inverse of `stripCompiledProfile`.
 *
 * `stripCompiledProfile` (compiled-profile.ts) drops every re-derivable English
 * string from a `LocalProfilePayload` to keep `.ahlifepro` lean. The live profile
 * widgets read those strings straight off the payload (`family.name`,
 * `achievement.title`, `ending.text`, …), so before a LOADED compiled profile can
 * render, the dropped strings must be re-resolved from the SAME ambient sources the
 * builders used (`@5argon/arkham-campaign-data` + `@5argon/arkham-kohaku`). This is
 * a pure structural walk: every key/id/number the stripper kept is still present, so
 * we only fill the English leaves back in, in place.
 *
 * To avoid drift, the fiddly resolution is shared with the builders, not re-derived:
 * `cleanText` (achievement text), `cleanEndingText` + the DWL synthetic-ending
 * constants (clear-status), `scenarioDisplayName` / `deslugScenario` (extra-imports),
 * and `choiceLabel` (scenario-extras). The strip→hydrate round-trip is guarded by a
 * unit test (hydrate-compiled-profile.test.ts).
 */

import {
	achievementsFor,
	getCampaignLog,
	playableScenarios,
	standaloneScenarios,
	type CampaignLog,
	type EnAchievement,
} from '@5argon/arkham-campaign-data';
import {
	chapterOneCampaigns,
	chapterOneReturnToCampaigns,
	chapterTwoSmallCampaigns,
} from '@5argon/arkham-kohaku';
import {
	cleanEndingText,
	DWL_WIN_LOST_FOREVER_KEY,
	DWL_WIN_LOST_FOREVER_TEXT,
} from '$lib/campaign/outcomes/clear-status';
import { scenarioDisplayName } from '$lib/campaign/stats/extra-imports';
import { customAchievementText } from '$lib/campaign/achievements/custom-achievements';
import { choiceLabel } from '$lib/campaign/stats/scenario-extras';
import type { CompiledProfileFile } from './compiled-profile';
import { cleanText, type LocalProfilePayload } from './profile-local';

/**
 * family code → display name, built by scanning the official campaign lists in the
 * SAME order `buildFullClearGrid` does and taking the first name per family. Each
 * campaign (Return-to included) is its own family keyed by its own code, so the name
 * resolves directly from its log. Memoized (pure, process-stable). */
let familyNameCache: Map<string, string> | null = null;
function familyNameMap(): Map<string, string> {
	if (familyNameCache) return familyNameCache;
	const m = new Map<string, string>();
	for (const code of [...chapterOneCampaigns, ...chapterOneReturnToCampaigns, ...chapterTwoSmallCampaigns]) {
		const log = getCampaignLog(code);
		if (!log) continue;
		const family = log.db.code;
		if (!m.has(family)) m.set(family, log.db.name);
	}
	familyNameCache = m;
	return m;
}

/** A family's display name — chapter-list name first (clear-grid parity), then the
 *  family's own log, then the raw code. Matches every builder's `name` resolution. */
function familyName(family: string): string {
	return familyNameMap().get(family) ?? getCampaignLog(family)?.db.name ?? family;
}

/** The campaign log for this family — the candidate log(s) to search for entry text /
 *  section labels. Each family is its own code (Return-to is a separate family), so this
 *  is just the family's own log. */
function logsForFamily(family: string): CampaignLog[] {
	const base = getCampaignLog(family);
	return base ? [base] : [];
}

/** Resolve an ending / branch entry key to its cleaned text, searching the family's
 *  logs base-first (mirrors `buildEndings` / `buildCoverage`). */
function familyEntryText(family: string, key: string): string {
	if (key === DWL_WIN_LOST_FOREVER_KEY) return DWL_WIN_LOST_FOREVER_TEXT;
	for (const log of logsForFamily(family)) {
		const t = log.en.entries?.[key]?.text;
		if (t != null) return cleanEndingText(t);
	}
	return cleanEndingText(key);
}

/** Resolve a coverage branch (keyed by the SPECIFIC campaign code, like `buildCoverage`). */
function codeEntryText(code: string, key: string): string {
	return cleanEndingText(getCampaignLog(code)?.en.entries?.[key]?.text ?? key);
}

/** Achievement id → its English (title / text / item labels) for a family. */
function achievementEn(family: string): Map<string, EnAchievement> {
	const map = new Map<string, EnAchievement>();
	const log = getCampaignLog(family);
	if (log) for (const a of achievementsFor(log)) map.set(a.def.id, a.en);
	return map;
}

/** A collection section's title, searching the family's logs base-first. */
function sectionTitle(family: string, sectionId: string): string {
	for (const log of logsForFamily(family)) {
		const t = log.en.sections?.[sectionId];
		if (t != null) return t;
	}
	return sectionId;
}

/** A collection item's label (en.items, or composite `section.id` entry text). */
function itemLabel(family: string, sectionId: string, id: string): string {
	for (const log of logsForFamily(family)) {
		const label = log.en.items?.[id] ?? log.en.entries?.[`${sectionId}.${id}`]?.text;
		if (label != null) return label;
	}
	return id;
}

/** scenario id → standalone display name (campaign-data `standaloneScenarios()`). */
function standaloneNames(): Map<string, string> {
	const m = new Map<string, string>();
	for (const s of standaloneScenarios()) m.set(s.scenario, s.name);
	return m;
}

/** Re-add each clear-grid row's re-derivable family name. */
function hydrateGrid<T extends { family: string }>(rows: T[]): (T & { name: string })[] {
	return rows.map((r) => ({ ...r, name: familyName(r.family) }));
}

/**
 * Reconstruct a render-ready `LocalProfilePayload` from a loaded compiled-profile file
 * by re-resolving every stripped English string. Tolerates older files (`v14`) that
 * predate `soloClearGrid` / `trueSoloClearGrid` (they hydrate to empty grids).
 */
export function hydrateCompiledProfile(file: CompiledProfileFile): LocalProfilePayload {
	const p = file.profile;
	const standalones = standaloneNames();

	return {
		// Pass-through: every non-English field the stripper kept verbatim.
		...p,

		achievements: {
			families: p.achievements.families.map((f) => {
				const en = achievementEn(f.family);
				return {
					...f,
					name: familyName(f.family),
					achievements: f.achievements.map((a) => {
						const e = en.get(a.id);
						return {
							...a,
							title: e?.title ?? a.id,
							text: e ? cleanText(e.text) : a.id,
							items: a.items?.map((it) => ({ ...it, label: e?.items?.[it.id] ?? it.id })),
						};
					}),
				};
			}),
			custom: p.achievements.custom.map((c) => {
				const t = customAchievementText(c.id);
				return { ...c, title: t?.title ?? c.id, description: t?.description ?? '' };
			}),
			coverage: p.achievements.coverage.map((cov) => ({
				...cov,
				campaignName: getCampaignLog(cov.campaignCode)?.db.name ?? cov.campaignCode,
				groups: cov.groups.map((g) => ({
					...g,
					branches: g.branches.map((b) => ({ ...b, text: codeEntryText(cov.campaignCode, b.key) })),
				})),
			})),
		},

		clearGrid: hydrateGrid(p.clearGrid),
		soloClearGrid: hydrateGrid(p.soloClearGrid ?? []),
		trueSoloClearGrid: hydrateGrid(p.trueSoloClearGrid ?? []),
		winLossRecord: hydrateGrid(p.winLossRecord),

		endings: p.endings.map((e) => ({
			...e,
			name: familyName(e.family),
			endings: e.endings.map((x) => ({ ...x, text: familyEntryText(e.family, x.key) })),
		})),

		collections: p.collections.map((c) => ({
			...c,
			name: familyName(c.family),
			collections: c.collections.map((col) => ({
				...col,
				title: sectionTitle(c.family, col.sectionId),
				items: col.items.map((it) => ({ ...it, label: itemLabel(c.family, col.sectionId, it.id) })),
			})),
		})),

		scenarios: p.scenarios.map((c) => {
			const baseLog = getCampaignLog(c.family);
			const names = baseLog?.en.scenarioNames ?? {};
			const orderIndex = new Map(
				(baseLog ? playableScenarios(baseLog) : []).map((id, i) => [id, i] as const)
			);
			return {
				...c,
				name: familyName(c.family),
				scenarios: c.scenarios.map((sc) => ({
					...sc,
					name: scenarioDisplayName(sc.scenario, names, orderIndex),
					choices: sc.choices?.map((ch) => ({
						...ch,
						label: baseLog ? choiceLabel(baseLog, sc.scenario, ch.id) : ch.id
					}))
				}))
			};
		}),

		standaloneUsage: p.standaloneUsage.map((s) => ({
			...s,
			name: familyName(s.family),
			standalones: s.standalones.map((sa) => ({
				...sa,
				name: standalones.get(sa.scenario) ?? sa.scenario,
			})),
		})),

		// First-class Standalone Archive aggregates — re-derive each scenario's display
		// name from its catalogue (side pack OR host campaign).
		standalones: p.standalones.map((s) => ({
			...s,
			name: getCampaignLog(s.catalogueCode)?.en.scenarioNames?.[s.scenario] ?? s.scenario,
		})),
	} as LocalProfilePayload;
}
