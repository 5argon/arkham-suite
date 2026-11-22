/** Which shared widgets a standalone page can hold, and its default rows built from them. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { rewardFor } from '../../../rewards/reward-defs';
import { STANDALONE_RULES } from '../../../standalones/rules-registry';
import { CHALLENGES } from '../../../standalones/side/challenges';
import type { ProfileRow } from '../../profile-settings';
import { full, split } from '../../widget-def';

/** A standalone page key's catalogue and scenario, when campaign-data knows both. */
export function parseStandaloneKey(key: string): { catalogue: string; scenario: string } | null {
	const dot = key.indexOf('.');
	if (dot < 1) return null;
	const catalogue = key.slice(0, dot);
	const scenario = key.slice(dot + 1);
	const known = getCampaignLog(catalogue)?.db.scenarioMeta?.some((m) => m.id === scenario);
	return known ? { catalogue, scenario } : null;
}

export function challengeFor(key: string) {
	const parsed = parseStandaloneKey(key);
	return parsed?.catalogue === 'side'
		? (CHALLENGES.find((c) => c.scenario === parsed.scenario) ?? null)
		: null;
}

/** Whether a shared standalone widget has anything to show on this page. */
export function standaloneWidgetFits(id: string, key: string): boolean {
	switch (id) {
		case 'standaloneReward': {
			const parsed = parseStandaloneKey(key);
			const code = parsed && getCampaignLog(parsed.catalogue)?.db.code;
			return !!parsed && !!code && rewardFor(code, parsed.scenario) != null;
		}
		case 'standaloneEndings':
			return !!STANDALONE_RULES[key]?.endings?.length;
		case 'standaloneCards':
			return !!STANDALONE_RULES[key]?.cards?.length;
		case 'challengeAdvanced':
			return challengeFor(key) != null;
		case 'challengeScore':
			return !!challengeFor(key)?.score;
		default:
			return true;
	}
}

const SHARED_HALVES = [
	'standaloneOverview',
	'standaloneEndings',
	'standaloneReward',
	'challengeAdvanced',
	'challengeScore',
	'standaloneCards'
];

/** Half-width widgets two to a row; an odd one out gets the row to itself. */
function pairRows(ids: string[]): ProfileRow[] {
	const rows: ProfileRow[] = [];
	for (let i = 0; i < ids.length; i += 2)
		rows.push(i + 1 < ids.length ? split(ids[i], ids[i + 1]) : full(ids[i]));
	return rows;
}

/** A standalone page's default rows: its full-width widgets, then the shared and its own half-width ones in pairs, then every play. */
export function standaloneLayout(
	key: string,
	own: { lead?: string[]; halves?: string[] } = {}
): ProfileRow[] {
	const halves = [
		...SHARED_HALVES.filter((id) => standaloneWidgetFits(id, key)),
		...(own.halves ?? []),
		'standaloneSources',
		'standaloneDeckXp'
	];
	return [...(own.lead ?? []).map(full), ...pairRows(halves), full('standalonePlays')];
}
