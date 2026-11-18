/**
 * A read-only view over one recorded play for the per-campaign builders, so every builder reads
 * notes, counts, section items and Extra inputs the same way.
 */
import type { Tally } from '../utils/tally';
import { bumpTally, emptyTally } from '../utils/tally';
import type { CampaignRecord } from './campaign-record';

const NOTE_PREFIX = 'campaign_notes.';
const RETURN_TO_PREFIX = 'return_to_';

/** A bare note id means `campaign_notes.<id>`; anything with a dot is already a full log key. */
export function noteKey(id: string): string {
	return id.includes('.') ? id : NOTE_PREFIX + id;
}

export interface Play {
	readonly rec: CampaignRecord;
	/** The play's difficulty tier. */
	readonly tier: string;
	/** A full `"section.id"` log key (or a bare note id) was recorded. */
	has(key: string): boolean;
	/** The numeric argument recorded on a log key, or a count section's value. */
	count(key: string): number | undefined;
	/** The item ids recorded in a cards / supplies / keys / checklist section. */
	items(section: string): ReadonlySet<string>;
	/** Extra: the resolution reached. Return-to plays record it under the `return_to_` scenario id. */
	resolution(scenario: string): string | undefined;
	/** Extra: a scenario choice value, with the same Return-to fallback as {@link resolution}. */
	choice(scenario: string, choiceId: string): string | undefined;
}

const NO_ITEMS: ReadonlySet<string> = new Set();

export function readPlay(rec: CampaignRecord): Play {
	const logs = rec.recorded.recordedLogs ?? NO_ITEMS;
	const counts = rec.recorded.logCounts ?? {};
	const resolutions = rec.scenarioResolutions ?? {};
	const choices = rec.scenarioChoices ?? {};
	return {
		rec,
		tier: rec.recorded.difficulty ?? 'standard',
		has: (key) => logs.has(noteKey(key)),
		count: (key) => counts[noteKey(key)] ?? counts[key],
		items: (section) => rec.recorded.recordedSectionItems?.[section] ?? NO_ITEMS,
		resolution: (scenario) => resolutions[scenario] ?? resolutions[RETURN_TO_PREFIX + scenario],
		choice: (scenario, choiceId) =>
			choices[`${scenario}.${choiceId}`] ?? choices[`${RETURN_TO_PREFIX}${scenario}.${choiceId}`]
	};
}

/** How many plays recorded each note: `{ killed: 'killed_silas_bishop' }` → `{ killed: 2 }`. */
export function countNotes<K extends string>(
	plays: readonly Play[],
	spec: Record<K, string>
): Record<K, number> {
	const out = {} as Record<K, number>;
	for (const field of Object.keys(spec) as K[])
		out[field] = plays.filter((p) => p.has(spec[field])).length;
	return out;
}

/** {@link countNotes} with a per-difficulty breakdown. */
export function tallyNotes<K extends string>(
	plays: readonly Play[],
	spec: Record<K, string>
): Record<K, Tally> {
	const out = {} as Record<K, Tally>;
	for (const field of Object.keys(spec) as K[]) {
		const t = (out[field] = emptyTally());
		for (const p of plays) if (p.has(spec[field])) bumpTally(t, p.tier);
	}
	return out;
}

/** Plays matching `pred`, as a per-difficulty tally. */
export function tallyPlays(plays: readonly Play[], pred: (p: Play) => boolean): Tally {
	const t = emptyTally();
	for (const p of plays) if (pred(p)) bumpTally(t, p.tier);
	return t;
}
