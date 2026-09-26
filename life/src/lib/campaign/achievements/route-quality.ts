/**
 * Harder ("better") or easier route badges on branch-coverage entries, by campaign-data code and
 * log key. Open campaigns like TSK grade the win on an epilogue branch, not a single resolution.
 */
export type RouteQuality = 'better' | 'easier';

const ROUTE_QUALITY: Record<string, Record<string, RouteQuality>> = {
	tskc: {
		'campaign_notes.work_together': 'better',
		'campaign_notes.cell_was_given_a_permanent_position': 'better',
		'campaign_notes.cell_was_dismantled': 'easier'
	}
};

export function routeQuality(code: string, key: string): RouteQuality | undefined {
	return ROUTE_QUALITY[code]?.[key];
}
