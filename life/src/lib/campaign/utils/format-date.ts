/** A play's finish date (ms since epoch) as a locale-aware "MMM D, YYYY"; an em dash when unrecorded. */
export function formatFinishDate(ms: number | null | undefined): string {
	if (ms == null) return '—';
	return new Date(ms).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}
