/**
 * notes.ts — campaign-log note keys. Recorded log entries live under `campaign_notes.<id>`; these
 * helpers build that key and check membership from a bare id, so builders share one spelling of the
 * prefix instead of each re-declaring it.
 */
export const NOTE_PREFIX = 'campaign_notes.';

/** The full recorded-log key for a bare campaign-note id. */
export function noteKey(id: string): string {
	return NOTE_PREFIX + id;
}

/** A membership checker over a recorded-log set, keyed by bare note id — `has('found_x')`. */
export function noteReader(logs: ReadonlySet<string>): (id: string) => boolean {
	return (id) => logs.has(noteKey(id));
}
