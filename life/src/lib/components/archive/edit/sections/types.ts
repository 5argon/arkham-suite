import type { CampaignLog, LogSectionDef } from '@5argon/arkham-campaign-data';
import type { LocalLog } from '$lib/campaign/records/recorded-state';
import type { InvestigatorRef } from '$lib/campaign/utils/investigators';

/** What every log-section recorder receives; it owns its section's slice of the editor logs. */
export interface SectionProps {
	log: CampaignLog;
	section: LogSectionDef;
	/** This section's entries. */
	entries: LocalLog[];
	/** Replaces this section's entries. */
	onChange: (next: LocalLog[]) => void;
}

/** A section with per-investigator rows, from the campaign's decks. */
export interface RosterSectionProps extends SectionProps {
	investigators: InvestigatorRef[];
}
