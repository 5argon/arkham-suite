import * as m from '$lib/paraglide/messages.js';

/** Friendly repeat-count phrasing for widget tooltips: "once" / "twice" / "N times". */
export function times(n: number): string {
	return m.shared_count_times({ count: n });
}
