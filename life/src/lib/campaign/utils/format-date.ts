/**
 * format-date.ts — the one place a campaign play's date is formatted for the widgets.
 *
 * A play's finish date is stored as ms-since-epoch (`CampaignRecord.finishDate`), `null` when the
 * play has no recorded date. `formatFinishDate` renders it as a short, locale-aware "MMM D, YYYY"
 * (the format shared by the Archive list and Core Set views), and an em dash when unrecorded — so
 * every per-play timestamp across the campaign widgets reads identically. The companion
 * `FinishDate.svelte` is the component wrapper; precompute builders pass `rec.finishDate ?? null`.
 */
export function formatFinishDate(ms: number | null | undefined): string {
	if (ms == null) return '—';
	return new Date(ms).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}
