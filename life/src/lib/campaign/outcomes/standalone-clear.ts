/**
 * standalone-clear.ts — the Standalone Mode win/loss rule.
 *
 * "When playing a standalone scenario, if players reach a NUMBERED resolution they
 * have won (or at least survived) unless that resolution states otherwise. If the
 * scenario ends and players have not been directed to a numbered resolution, they
 * have lost." So a recorded resolution of `R1`/`R2`/… is a win; `no_resolution*`
 * (or none) is a loss. Scenarios flagged `standaloneUnwinnable` blur win/loss — the
 * caller treats those as neutral.
 */
export type StandaloneVerdict = 'won' | 'lost';

/** Win/loss for a recorded standalone resolution, or `null` when nothing is recorded. */
export function standaloneVerdict(resolution: string | undefined | null): StandaloneVerdict | null {
	if (!resolution) return null;
	return /^r\d+/i.test(resolution) ? 'won' : 'lost';
}
