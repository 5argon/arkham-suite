import type { SortingType } from '@5argon/arkham-kohaku';
import type { Grouping, GroupingSortingSettings } from '../card/card-item.js';

const MAX_ITEMS = 3;
const GROUP_PARAM = 'group';
const SORT_PARAM = 'sort';

const VALID_GROUPINGS: readonly Grouping[] = [
	'default',
	'set',
	'cost',
	'slot',
	'level',
	'level-grouped',
	'class',
	'commit-power',
	'none'
] as const;

const VALID_SORTINGS: readonly SortingType[] = [
	'position',
	'name',
	'class',
	'level',
	'type',
	'slot',
	'set',
	'cost',
	'commit-power',
	'type-special'
] as const;

const VALID_GROUPING_SET = new Set<string>(VALID_GROUPINGS);
const VALID_SORTING_SET = new Set<string>(VALID_SORTINGS);

function decodeList<T extends string>(raw: string | null, validSet: Set<string>): T[] {
	if (!raw) return [];
	const seen = new Set<string>();
	const result: T[] = [];
	for (const part of raw.split(',')) {
		const v = part.trim();
		if (!v) continue;
		if (seen.has(v)) continue;
		if (!validSet.has(v)) continue;
		seen.add(v);
		result.push(v as T);
		if (result.length >= MAX_ITEMS) break;
	}
	return result;
}

function encodeList<T extends string>(values: readonly T[], validSet: Set<string>): string {
	const seen = new Set<string>();
	const cleaned: T[] = [];
	for (const v of values) {
		if (!validSet.has(v)) continue;
		if (seen.has(v)) continue;
		seen.add(v);
		cleaned.push(v);
		if (cleaned.length >= MAX_ITEMS) break;
	}
	return cleaned.join(',');
}

export function searchParamsToSettings(sp: URLSearchParams): GroupingSortingSettings {
	return {
		grouping: decodeList<Grouping>(sp.get(GROUP_PARAM), VALID_GROUPING_SET),
		sortingOrder: decodeList<SortingType>(sp.get(SORT_PARAM), VALID_SORTING_SET)
	};
}

export function settingsToSearchParams(
	settings: GroupingSortingSettings,
	base?: URLSearchParams
): URLSearchParams {
	const out = new URLSearchParams(base);
	const groupValue = encodeList(settings.grouping, VALID_GROUPING_SET);
	const sortValue = encodeList(settings.sortingOrder, VALID_SORTING_SET);

	if (groupValue.length > 0) {
		out.set(GROUP_PARAM, groupValue);
	} else {
		out.delete(GROUP_PARAM);
	}
	if (sortValue.length > 0) {
		out.set(SORT_PARAM, sortValue);
	} else {
		out.delete(SORT_PARAM);
	}
	return out;
}

export function settingsToQueryString(settings: GroupingSortingSettings): string {
	return settingsToSearchParams(settings).toString();
}

/**
 * Build a full URL for the given settings layered onto the current location.
 * Pulled out of Svelte component context so we can construct a plain URL
 * (Svelte's `prefer-svelte-reactivity` lint rule disallows `new URL()` inside .svelte files).
 */
export function buildUrlForSettings(
	settings: GroupingSortingSettings,
	current: { pathname: string; search: string; hash: string; origin: string }
): URL {
	const next = settingsToSearchParams(settings, new URLSearchParams(current.search));
	const qs = next.toString();
	return new URL(`${current.pathname}${qs ? `?${qs}` : ''}${current.hash}`, current.origin);
}
