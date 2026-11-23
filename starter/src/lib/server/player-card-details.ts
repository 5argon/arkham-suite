import { type Card, card as cardUtils, type Product } from '@5argon/arkham-kohaku';
import type { CardTextHtml } from '@5argon/arkham-life-ui';

import { getAllCards } from '$lib/card-data';
import { rewardCards } from '$lib/utility/reward';

import { cardTextHtml, hasCardText } from './card-text';
import { chapterOneReviewLinkOf } from './chapter-one-reviews';
import { type ReviewLink, reviewLinkOf } from './reviews';

/**
 * What's shown beside a player card's magnified picture.
 */
export interface PlayerCardDetail {
	text?: CardTextHtml;
	review?: ReviewLink;
}

const allCards = getAllCards();

/**
 * The player cards of a product as the player cards page lists them, or every Reward card.
 */
function playerCardsOf(product: Product | undefined): Card[] {
	if (product === undefined) return rewardCards(allCards);
	return allCards.filter(
		(card) => cardUtils.playerCardsNonCampaignFilter(card) && card.product === product
	);
}

/**
 * The text and review page of every card on a player cards page, and no other card, so each page
 * carries only its own.
 */
export function playerCardDetails(product: Product | undefined): Record<string, PlayerCardDetail> {
	const details: Record<string, PlayerCardDetail> = {};
	for (const { code } of playerCardsOf(product)) {
		details[code] = {
			text: hasCardText(code) ? cardTextHtml(code) : undefined,
			// The current page of a card before its older one from Chapter 1.
			review: reviewLinkOf(code) ?? chapterOneReviewLinkOf(code)
		};
	}
	return details;
}
