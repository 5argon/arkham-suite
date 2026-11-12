/**
 * A date as readers see it, like "Nov 11, 2026".
 */
export function dateLabel(date: string): string {
	return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(
		new Date(date)
	);
}
