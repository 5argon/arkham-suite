import type { CardResolver } from '@5argon/arkham-kohaku';
import type { CardLineNote } from '@5argon/arkham-life-ui';

import * as m from '$lib/paraglide/messages.js';
import type { DeckCardMatch } from '$lib/tool/starter/filter';

/**
 * Picked card matches as card lines, noting when an upgrade arrives.
 */
export function cardMatchNotes(matches: DeckCardMatch[], resolver: CardResolver): CardLineNote[] {
	return matches.map((match) => ({
		card: resolver.resolve(match.code),
		quantity: match.quantity,
		note:
			match.addedAtXp.length === 0
				? undefined
				: m.starter_decks_match_added_at({ xp: match.addedAtXp.join(', ') })
	}));
}
