import { type Card, CardType } from '@5argon/arkham-kohaku';
import type { CardTextHtml } from '@5argon/arkham-life-ui';

import { getAllCards } from '$lib/card-data';
import { parseArkhamDbCardText } from '$lib/utility/arkham-markup';

import cardTextData from './data/card-text.json';

/**
 * Card text for the server only: too big to send whole, so pages get what they mention.
 */
const cardText: Record<string, Record<string, string> | undefined> = cardTextData;
const cardByCode = new Map(getAllCards().map((card) => [card.code, card]));

export function hasCardText(code: string): boolean {
	return cardText[code] !== undefined;
}

/**
 * What's said about a reprint elsewhere is usually on its first printing.
 */
export function firstPrintingOf(code: string): string {
	return cardText[code]?.original ?? code;
}

export function cardTextHtml(code: string): CardTextHtml {
	const text = cardText[code] ?? {};
	const html = (field: string) => text[field] && parseArkhamDbCardText(text[field]);
	const hasBack = text.back_text !== undefined || text.back_flavor !== undefined;
	return {
		front: {
			traits: text.traits,
			text: html('text'),
			flavor: html('flavor'),
			customization: html('customization_text')
		},
		back: hasBack ? { text: html('back_text'), flavor: html('back_flavor') } : undefined
	};
}

/**
 * The text shown when hovering a card link: only cards with text data, without flavor. An
 * investigator keeps just its front.
 */
export function hoverTextOf(cards: Record<string, Card>): Record<string, CardTextHtml> {
	const texts: Record<string, CardTextHtml> = {};
	for (const [code, card] of Object.entries(cards)) {
		if (cardText[code] === undefined) continue;
		const text = cardTextHtml(code);
		if (text.front.text === undefined && text.back?.text === undefined) continue;
		const front = {
			traits: text.front.traits,
			text: text.front.text,
			customization: text.front.customization
		};
		texts[code] =
			card.cardType === CardType.Investigator || text.back?.text === undefined
				? { front }
				: { front, back: { text: text.back.text } };
	}
	return texts;
}

/**
 * Hover text for every card a piece of ArkhamDB markdown links to, like `[Name](/card/12345)`,
 * which is what the markdown renderer turns into a card link.
 */
export function hoverTextLinkedIn(
	...markdowns: (string | undefined)[]
): Record<string, CardTextHtml> {
	const cards: Record<string, Card> = {};
	for (const markdown of markdowns) {
		for (const [, code] of (markdown ?? '').matchAll(/\]\(\/card\/(\d+)\)/g)) {
			const card = cardByCode.get(code);
			if (card !== undefined) cards[code] = card;
		}
	}
	return hoverTextOf(cards);
}
