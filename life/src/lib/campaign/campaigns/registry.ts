/** Every per-campaign builder, keyed by the family whose plays it aggregates. */
import type { CampaignRecord } from '../records/campaign-record';
import type { BuildOptions } from './define';
import { buildDwl } from './dwl';
import { buildEoe } from './eoe';
import { buildFhv } from './fhv';
import { buildNotz } from './notz';
import { buildPtc } from './ptc';
import { buildTcu } from './tcu';
import { buildTdc } from './tdc';
import { buildTdea } from './tdea';
import { buildTdeb } from './tdeb';
import { buildTfa } from './tfa';
import { buildTic } from './tic';
import { buildTsk } from './tsk/profile';

export const CAMPAIGN_BUILDERS = {
	notz: buildNotz,
	dwl: buildDwl,
	ptc: buildPtc,
	tfa: buildTfa,
	tcu: buildTcu,
	tdea: buildTdea,
	tdeb: buildTdeb,
	tic: buildTic,
	eoe: buildEoe,
	tskc: buildTsk,
	fhv: buildFhv,
	tdc: buildTdc
} satisfies Record<string, (records: CampaignRecord[], opts?: BuildOptions) => object | null>;

export type BespokeFamily = keyof typeof CAMPAIGN_BUILDERS;

/** Each family's aggregate; absent when the subject has no plays of it. */
export type BespokeBlobs = {
	[F in BespokeFamily]?: NonNullable<ReturnType<(typeof CAMPAIGN_BUILDERS)[F]>>;
};

export function buildBespoke(records: CampaignRecord[], opts: BuildOptions): BespokeBlobs {
	const out: Record<string, unknown> = {};
	for (const [family, build] of Object.entries(CAMPAIGN_BUILDERS)) {
		const blob = build(records, opts);
		if (blob) out[family] = blob;
	}
	return out as BespokeBlobs;
}
