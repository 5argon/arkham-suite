/** Every standalone page with bespoke numbers, by page key (see `standaloneKey`). */
import type { StandalonePlayRecord } from './define';
import { buildTtn } from './ttn';

const BUILDERS = {
	'side.ttn': buildTtn
} as const;

export type StandaloneBespokeKey = keyof typeof BUILDERS;

export type StandaloneBlobs = {
	[K in StandaloneBespokeKey]?: NonNullable<ReturnType<(typeof BUILDERS)[K]>>;
};

/** Each bespoke standalone page's aggregate over the subject's standalone plays. */
export function buildStandaloneBespoke(records: readonly StandalonePlayRecord[]): StandaloneBlobs {
	const out: Record<string, unknown> = {};
	for (const [key, build] of Object.entries(BUILDERS)) {
		const blob = build(records);
		if (blob) out[key] = blob;
	}
	return out as StandaloneBlobs;
}
