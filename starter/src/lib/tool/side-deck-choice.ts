import type { AhdbDeck } from '@5argon/arkham-kohaku';

/**
 * What a downloaded deck keeps of its side deck: all of it, all but the 0 XP cards (on a higher
 * version, the ones its upgrades took out, which other tools would count as overlaps), or none of
 * it, for playing that version on its own without upgrading further.
 */
export type SideDeckChoice = 'keep' | 'noZeroXp' | 'none';

export function hasSideDeck(deck: AhdbDeck): boolean {
	return Object.values(deck.sideSlots ?? {}).some((quantity) => quantity > 0);
}

/**
 * @param xpOf The card's level, undefined for one without, which counts as 0.
 */
export function withSideDeckChoice(
	deck: AhdbDeck,
	choice: SideDeckChoice,
	xpOf: (code: string) => number | undefined
): AhdbDeck {
	if (choice === 'keep') return deck;
	const sideSlots =
		choice === 'none'
			? {}
			: Object.fromEntries(
					Object.entries(deck.sideSlots ?? {}).filter(([code]) => (xpOf(code) ?? 0) > 0)
				);
	return { ...deck, sideSlots };
}
