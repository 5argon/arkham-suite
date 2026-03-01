/**
 * route-quality.ts — life-local annotations marking certain route/branch outcomes
 * as harder/"better" or easier, surfaced as badges on the Paths Explored block.
 * Unlike win/loss `outcome` (clear-status), routes are derived from logs, so for
 * open campaigns like TSK the win-quality lives on the epilogue branch entries,
 * not a single win resolution. Keyed by campaign-data code, then composite key.
 */
export type RouteQuality = 'better' | 'easier';

const ROUTE_QUALITY: Record<string, Record<string, RouteQuality>> = {
  // TSK: the Congress epilogue records the cell's fate — work together / a
  // permanent position are the harder "better" routes; dismantled is the easier.
  tskc: {
    'campaign_notes.work_together': 'better',
    'campaign_notes.cell_was_given_a_permanent_position': 'better',
    'campaign_notes.cell_was_dismantled': 'easier',
  },
};

/** Route-quality for a branch entry, or undefined if ungraded. */
export function routeQuality(code: string, key: string): RouteQuality | undefined {
  return ROUTE_QUALITY[code]?.[key];
}
