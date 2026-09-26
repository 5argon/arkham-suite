import { getCampaignLog, type CampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import { filterFamilyRecords } from '../records/campaign-family';
import { readPlay, type Play } from '../records/play';

export interface BuildOptions {
	/** Fold the family's Return-to box into it (the `mergeReturnToStats` setting). */
	mergeReturnTo?: boolean;
}

/** The fields every per-campaign blob carries. */
export interface CampaignBlobBase {
	family: string;
	plays: number;
}

export type CampaignBuilder<T extends CampaignBlobBase> = (
	records: CampaignRecord[],
	opts?: BuildOptions
) => T | null;

/** A per-campaign aggregate over the family's plays; null when the subject has none. */
export function defineCampaignBuilder<T extends CampaignBlobBase>(
	family: string,
	build: (plays: Play[], log: CampaignLog) => Omit<T, keyof CampaignBlobBase>
): CampaignBuilder<T> {
	return (records, { mergeReturnTo = true } = {}) => {
		const log = getCampaignLog(family);
		if (!log) return null;
		const recs = filterFamilyRecords(records, family, mergeReturnTo);
		if (!recs.length) return null;
		return { family, plays: recs.length, ...build(recs.map(readPlay), log) } as T;
	};
}
