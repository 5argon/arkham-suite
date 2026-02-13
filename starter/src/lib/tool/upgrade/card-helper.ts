import type { Card } from '@5argon/arkham-kohaku';
import { CardClass } from '@5argon/arkham-kohaku';

/**
 * Convert kohaku Card's ClassSlots to ExportCard format.
 */
export function convertCardClass(card: Card): {
	class1: CardClass;
	class2: CardClass | null;
	class3: CardClass | null;
} {
	if (!card.cardClass) {
		return { class1: CardClass.Neutral, class2: null, class3: null };
	}

	return {
		class1: card.cardClass.class1,
		class2: card.cardClass.class2 ?? null,
		class3: card.cardClass.class3 ?? null
	};
}

/**
 * Get a simplified product/expansion name from the card's product.
 */
export function getProductDisplayName(card: Card): string {
	// For now, just return the product code
	// This can be enhanced later with proper product name mappings
	return card.product.toString();
}
