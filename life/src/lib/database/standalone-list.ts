/** The Standalone Archive list: filter → sort → paginate. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';

import { standaloneVerdict, type StandaloneVerdict } from '$lib/campaign/outcomes/standalone-clear';
import { RESERVED, firstString } from '$lib/campaign/records/recorded-state';
import { DIFFICULTY_ORDER } from '$lib/campaign/utils/difficulty';

import type { DatabaseDocument, Difficulty, StandaloneRecord } from './document';
import { filterIn, paginate } from './repository';

export interface ListStandalone {
	id: string;
	title: string;
	scenario: string;
	scenarioName: string;
	source: StandaloneRecord['source'];
	difficulty: Difficulty;
	finishDate: number | null;
	/** null = no resolution recorded. */
	verdict: StandaloneVerdict | null;
	/** One per deck, so the same investigator can appear twice. */
	decks: { id: string; investigatorCode: string }[];
}

export type StandaloneVerdictFilter = StandaloneVerdict | 'unknown';

export type StandaloneSort = 'date' | 'name' | 'difficulty';

export interface StandaloneListParams {
	page: number;
	pageSize: number;
	name: string;
	sort: StandaloneSort;
	sources?: string[];
	difficulties?: string[];
	verdicts?: string[];
}

export interface StandaloneFilterOptions {
	sources: StandaloneRecord['source'][];
	difficulties: Difficulty[];
	verdicts: StandaloneVerdictFilter[];
}

export interface StandaloneListResult {
	items: ListStandalone[];
	totalCount: number;
	filteredIds: string[];
	filterOptions: StandaloneFilterOptions;
}

export const EMPTY_STANDALONE_LIST: StandaloneListResult = {
	items: [],
	totalCount: 0,
	filteredIds: [],
	filterOptions: { sources: [], difficulties: [], verdicts: [] }
};

function toListItem(s: StandaloneRecord): ListStandalone {
	const resolution = s.logs.find(
		(l) => l.section === RESERVED.scenarioResolution && l.key === s.scenario
	);
	return {
		id: s.id,
		title: s.title,
		scenario: s.scenario,
		scenarioName: getCampaignLog(s.campaignCode)?.en.scenarioNames?.[s.scenario] ?? s.scenario,
		source: s.source,
		difficulty: s.difficulty,
		finishDate: s.finishDate,
		verdict: standaloneVerdict(resolution && firstString(resolution.args)),
		decks: s.decks.map((d) => ({ id: d.id, investigatorCode: d.investigator.investigatorCode }))
	};
}

function buildFilterOptions(all: ListStandalone[]): StandaloneFilterOptions {
	const sources = new Set(all.map((s) => s.source));
	const difficulties = new Set(all.map((s) => s.difficulty));
	const verdicts = new Set(all.map((s) => s.verdict ?? 'unknown'));
	return {
		sources: [...sources].sort(),
		difficulties: DIFFICULTY_ORDER.filter((d) => difficulties.has(d)),
		verdicts: (['won', 'lost', 'unknown'] as const).filter((v) => verdicts.has(v))
	};
}

export function standaloneListData(
	doc: DatabaseDocument,
	params: StandaloneListParams
): StandaloneListResult {
	const all = doc.standalones
		.map(toListItem)
		.sort((a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0));
	let items = all;
	if (params.name) {
		const n = params.name.toLowerCase();
		items = items.filter(
			(s) => s.title.toLowerCase().includes(n) || s.scenarioName.toLowerCase().includes(n)
		);
	}
	items = filterIn(items, params.sources, (s) => s.source);
	items = filterIn(items, params.difficulties, (s) => s.difficulty);
	items = filterIn(items, params.verdicts, (s) => s.verdict ?? 'unknown');
	if (params.sort === 'name') items = [...items].sort((a, b) => a.title.localeCompare(b.title));
	else if (params.sort === 'difficulty')
		items = [...items].sort(
			(a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty)
		);
	return {
		items: paginate(items, params.page, params.pageSize),
		totalCount: items.length,
		filteredIds: items.map((s) => s.id),
		filterOptions: buildFilterOptions(all)
	};
}
