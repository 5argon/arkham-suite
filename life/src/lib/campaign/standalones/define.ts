/** Per-standalone aggregates: the bespoke numbers of one standalone scenario's page. */
import type { CampaignRecord } from '../records/campaign-record';
import { readPlay, type Play } from '../records/play';

/** A standalone page's key: the catalogue it loads from (`side` for a Scenario Pack) and the scenario. */
export function standaloneKey(catalogue: string, scenario: string): string {
	return `${catalogue}.${scenario}`;
}

/** One standalone play handed to the builders: its page key and its record. */
export interface StandalonePlayRecord {
	key: string;
	rec: CampaignRecord;
}

export interface StandaloneBlobBase {
	key: string;
	plays: number;
}

export type StandaloneBuilder<T extends StandaloneBlobBase> = (
	records: readonly StandalonePlayRecord[]
) => T | null;

/** An aggregate over one standalone page's plays; null when the subject has none. */
export function defineStandaloneBuilder<T extends StandaloneBlobBase>(
	catalogue: string,
	scenario: string,
	build: (plays: Play[]) => Omit<T, keyof StandaloneBlobBase>
): StandaloneBuilder<T> {
	const key = standaloneKey(catalogue, scenario);
	return (records) => {
		const plays = records.filter((r) => r.key === key).map((r) => readPlay(r.rec));
		if (!plays.length) return null;
		return { key, plays: plays.length, ...build(plays) } as T;
	};
}
