import {
	entryLabel,
	itemLabel,
	loadCampaignLog
} from '$lib/campaign/records/campaign-log-source';
import type { LitTile } from '$lib/components/profile/_primitives';
import { times } from '$lib/profile/plural';

const log = loadCampaignLog('eoe');

/** A team member's name as printed on the campaign log (shorter than the card name). */
export const teamLabel = (id: string) => (log ? itemLabel(log, id) : id);

/** A log entry's printed text in one section. */
export const entryText = (section: string) => (id: string) =>
	log ? entryLabel(log, `${section}.${id}`) : id;

/** One card tile per entry, lit by its count; `label` defaults to the card name. */
export function litTiles(
	cards: readonly { id: string; code: string }[],
	counts: Record<string, number> | undefined,
	detail: (count: number) => string,
	label?: (id: string) => string
): LitTile[] {
	return cards.map(({ id, code }) => {
		const count = counts?.[id] ?? 0;
		return { id, code, label: label?.(id), count, detail: detail(count) };
	});
}

/** A tile detail: `some` with "once / twice / N times" when lit, else `none`. */
export function timesDetail(
	some: (inputs: { times: string }) => string,
	none: () => string
): (count: number) => string {
	return (count) => (count ? some({ times: times(count) }) : none());
}
