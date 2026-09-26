/** Standalone Mode rule: reaching a numbered resolution wins (or at least survives) unless it says
 *  otherwise; ending without being directed to one loses. Scenarios flagged `standaloneUnwinnable`
 *  have neither. */
export type StandaloneVerdict = 'won' | 'lost';

/** Null when no resolution was recorded. */
export function standaloneVerdict(resolution: string | undefined | null): StandaloneVerdict | null {
	if (!resolution) return null;
	return /^r\d+/i.test(resolution) ? 'won' : 'lost';
}
