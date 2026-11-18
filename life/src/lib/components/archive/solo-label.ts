import * as m from '$lib/paraglide/messages.js';
import type { SoloType } from '$lib/database/document';

/** "True Solo", "Solo X-Handed", or "Solo (Multi-Handed)" before hands are numbered. */
export function soloLabel(soloType: SoloType | null, hands: number): string | null {
	if (soloType === 'true-solo') return m.archive_filter_solo_true();
	if (soloType === 'multi-handed')
		return hands >= 2 ? m.archive_solo_x_handed({ hands }) : m.archive_filter_solo_multi();
	return null;
}
