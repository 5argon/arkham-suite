import { fhvVillagerName } from '$lib/campaign/campaigns/fhv';
import { portraitUrl } from '$lib/campaign/records/campaign-log-source';
import { tallyDetail } from '$lib/campaign/utils/difficulty';
import type { Tally } from '$lib/campaign/utils/tally';
import type { LitTile } from '$lib/components/profile/_primitives';

/** Portrait tiles for villagers, lit by `tallyOf`; `lit` and `none` word the hover. */
export function fhvVillagerTiles(
	ids: string[],
	tallyOf: (id: string) => Tally | undefined,
	lit: (name: string, times: string) => string,
	none: (name: string) => string
): LitTile[] {
	return ids.map((id) => {
		const t = tallyOf(id);
		const name = fhvVillagerName(id);
		return {
			id,
			image: portraitUrl('fhv', id),
			label: name,
			count: t?.total ?? 0,
			detail: tallyDetail(
				t,
				() => none(name),
				(times) => lit(name, times)
			)
		};
	});
}
