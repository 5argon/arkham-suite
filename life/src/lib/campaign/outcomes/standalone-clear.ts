/** Standalone Mode rule: reaching a numbered resolution wins (or at least survives) unless it says
 *  otherwise; ending without being directed to one loses. A scenario's curated resolution outcomes
 *  say otherwise where they exist (a neutral one is neither). Scenarios flagged
 *  `standaloneUnwinnable` have neither. */
export type StandaloneVerdict = 'won' | 'lost';

/** Null when no resolution was recorded, or the resolution is neutral. */
export function standaloneVerdict(
	resolution: string | undefined | null,
	outcomes?: Record<string, 'win' | 'loss' | 'neutral'>
): StandaloneVerdict | null {
	if (!resolution) return null;
	const curated = outcomes?.[resolution];
	if (curated) return curated === 'win' ? 'won' : curated === 'loss' ? 'lost' : null;
	return /^r\d+/i.test(resolution) ? 'won' : 'lost';
}
