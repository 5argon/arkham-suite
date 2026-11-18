import * as m from '$lib/paraglide/messages.js';
import type { StandaloneRecord } from '$lib/database/document';
import type { StandaloneVerdictFilter } from '$lib/database/standalone-list';

export function standaloneSourceLabel(source: StandaloneRecord['source']): string {
	return source === 'pack' ? m.archive_source_pack() : m.archive_source_campaign();
}

export function standaloneVerdictLabel(verdict: StandaloneVerdictFilter): string {
	if (verdict === 'won') return m.archive_verdict_won();
	if (verdict === 'lost') return m.archive_verdict_lost();
	return m.archive_verdict_unknown();
}
