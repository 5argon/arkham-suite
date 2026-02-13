import type { Card, CardResolver } from '@5argon/arkham-kohaku';
import { card as cardUtil } from '@5argon/arkham-kohaku';

/**
 * Find all cards linked to this card, including both standard bonded cards and
 * special UI-specific linked cards (like customizable card upgrade sheets).
 *
 * This is specific to the UI package and should not be in kohaku because it includes
 * non-standard relationships.
 *
 * @param card The card to find linked cards for
 * @param cardResolver Resolver to convert card codes to Card objects
 * @returns Array of linked Card objects
 */
export function findLinkedCardsSpecial(card: Card, cardResolver: CardResolver): Card[] {
	const linkedCards: Card[] = [];

	// Get standard bonded cards from kohaku
	const bondedCodes = cardUtil.findLinkedCards(card);
	for (const code of bondedCodes) {
		try {
			linkedCards.push(cardResolver.resolve(code));
		} catch {
			// Skip cards that can't be resolved
		}
	}

	// Check if card is customizable (contains "Customizable." in text)
	if (card.text && card.customizationOptions !== undefined) {
		// This "b" are not card backs, they are new cards
		// added manually to represent the upgrade sheets for customizable cards.
		const upgradedCode = card.code + 'b';
		const upgradedCard = cardResolver.resolve(upgradedCode);
		linkedCards.push(upgradedCard);
	}

	return linkedCards;
}
