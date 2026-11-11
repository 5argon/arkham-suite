import {
	type Card,
	card as cardUtils,
	type Product,
	productReleaseDate,
	sorter
} from '@5argon/arkham-kohaku';

/**
 * Where every Reward card is shown together as if they were one product, under `/player` and
 * `/review`. No product uses this as its route.
 */
export const rewardRoute = 'reward';

/**
 * Art of the Reward cards, standing in for a product's box art.
 */
export const rewardImageUrl = '/image/resource/review.webp';

/**
 * The back face of a double-sided Reward card is its own hidden card, which is not listed.
 */
export function isRewardCard(card: Card): boolean {
	return (
		card.reward === true && card.hidden !== true && cardUtils.playerCardsNonCampaignFilter(card)
	);
}

function releaseDateOf(product: Product): string {
	return (productReleaseDate as Partial<Record<Product, string>>)[product] ?? '9999-12-31';
}

/**
 * Every Reward card, in the order their products came out.
 */
export function rewardCards(cards: readonly Card[]): Card[] {
	return cards
		.filter(isRewardCard)
		.sort(
			(a, b) =>
				releaseDateOf(a.product).localeCompare(releaseDateOf(b.product)) || sorter('position', a, b)
		);
}
