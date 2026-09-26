/**
 * The inverse of `stripCompiledProfile`: re-resolves every dropped English string from
 * campaign-data, using the same helpers the builders used so the text matches exactly.
 */
import {
	achievementsFor,
	getCampaignLog,
	standaloneScenarios,
	type EnAchievement
} from '@5argon/arkham-campaign-data';
import {
	DWL_WIN_LOST_FOREVER_KEY,
	DWL_WIN_LOST_FOREVER_TEXT
} from '$lib/campaign/outcomes/clear-status';
import { cleanEntryText } from '$lib/campaign/utils/entry-text';
import { customAchievementText } from '$lib/campaign/achievements/custom-achievements';
import { resolveProfileSettings } from '$lib/campaign/profile/profile-settings';
import { familyScenarioMeta, familyScenarioNames } from '$lib/campaign/records/campaign-family';
import { choiceLabel } from '$lib/campaign/stats/scenario-extras';
import { scenarioDisplayName } from '$lib/campaign/stats/extra-imports';
import type { ProfilePayload } from '$lib/profile/profile-types';
import type { CompiledProfileFile } from './compiled-profile';
import { cleanText } from './profile-local';

function familyName(family: string): string {
	return getCampaignLog(family)?.db.name ?? family;
}

function entryText(code: string, key: string): string {
	if (key === DWL_WIN_LOST_FOREVER_KEY) return DWL_WIN_LOST_FOREVER_TEXT;
	return cleanEntryText(getCampaignLog(code)?.en.entries?.[key]?.text ?? key);
}

function achievementEn(family: string): Map<string, EnAchievement> {
	const log = getCampaignLog(family);
	return new Map(log ? achievementsFor(log).map((a) => [a.def.id, a.en]) : []);
}

function sectionTitle(family: string, sectionId: string): string {
	return getCampaignLog(family)?.en.sections?.[sectionId] ?? sectionId;
}

function itemLabel(family: string, sectionId: string, id: string): string {
	const log = getCampaignLog(family);
	return log?.en.items?.[id] ?? log?.en.entries?.[`${sectionId}.${id}`]?.text ?? id;
}

function withFamilyName<T extends { family: string }>(rows: T[]): (T & { name: string })[] {
	return rows.map((r) => ({ ...r, name: familyName(r.family) }));
}

export function hydrateCompiledProfile(file: CompiledProfileFile): ProfilePayload {
	const p = file.profile;
	const standaloneNames = new Map(standaloneScenarios().map((s) => [s.scenario, s.name]));

	return {
		...p,
		settings: resolveProfileSettings(p.settings),
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
							items: a.items?.map((it) => ({ ...it, label: e?.items?.[it.id] ?? it.id }))
						};
					})
				};
			}),
			custom: p.achievements.custom.map((c) => {
				const t = customAchievementText(c.id);
				return { ...c, title: t?.title ?? c.id, description: t?.description ?? '' };
			}),
			coverage: p.achievements.coverage.map((cov) => ({
				...cov,
				campaignName: familyName(cov.campaignCode),
				groups: cov.groups.map((g) => ({
					...g,
					branches: g.branches.map((b) => ({ ...b, text: entryText(cov.campaignCode, b.key) }))
				}))
			}))
		},
		clearGrid: withFamilyName(p.clearGrid),
		soloClearGrid: withFamilyName(p.soloClearGrid),
		trueSoloClearGrid: withFamilyName(p.trueSoloClearGrid),
		winLossRecord: withFamilyName(p.winLossRecord),
		endings: p.endings.map((e) => ({
			...e,
			name: familyName(e.family),
			endings: e.endings.map((x) => ({ ...x, text: entryText(e.family, x.key) }))
		})),
		collections: p.collections.map((c) => ({
			...c,
			name: familyName(c.family),
			collections: c.collections.map((col) => ({
				...col,
				title: sectionTitle(c.family, col.sectionId),
				items: col.items.map((it) => ({ ...it, label: itemLabel(c.family, col.sectionId, it.id) }))
			}))
		})),
		scenarios: p.scenarios.map((c) => {
			const baseLog = getCampaignLog(c.family);
			// Names and order span the merged Return-to catalogue, as the builder resolved them.
			const names = familyScenarioNames(c.family, true);
			const orderIndex = new Map(
				familyScenarioMeta(c.family, true)
					.filter((m) => m.type === 'story')
					.map((m, i) => [m.id, i] as const)
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
				name: standaloneNames.get(sa.scenario) ?? sa.scenario
			}))
		})),
		standalones: p.standalones.map((s) => ({
			...s,
			name: getCampaignLog(s.catalogueCode)?.en.scenarioNames?.[s.scenario] ?? s.scenario
		}))
	};
}
