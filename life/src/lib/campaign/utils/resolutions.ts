/** Labels for campaign-data resolution ids (`R1`, `no_resolution`, `no_resolution_<tail>`). */
import * as m from '$lib/paraglide/messages.js';

/** Human label for a resolution id, e.g. `R1` → "Resolution 1". */
export function resolutionLabel(id: string): string {
	const rn = /^R(\d+)$/.exec(id);
	if (rn) return m.shared_resolution_n({ n: rn[1] });
	if (id === 'no_resolution') return m.shared_resolution_none();
	if (id.startsWith('no_resolution_')) {
		const tail = id.slice('no_resolution_'.length).replace(/_/g, ' ');
		return m.shared_resolution_none_tail({ tail });
	}
	return id;
}

/** Compact label for a resolution chip, e.g. `R1` → "R1", `no_resolution` → "No". */
export function resolutionShort(id: string): string {
	if (/^R\d+$/.test(id)) return id;
	if (id === 'no_resolution') return m.shared_resolution_short_none();
	if (id.startsWith('no_resolution_'))
		return m.shared_resolution_short_none_tail({ tail: id.slice('no_resolution_'.length) });
	return id;
}
