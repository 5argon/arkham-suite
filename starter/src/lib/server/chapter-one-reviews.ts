import {
	type Card,
	CardClass,
	card as cardUtils,
	type Product,
	productChapterOneInvestigatorExpansions,
	productCoreSetsChapterOne,
	productInvestigatorStarterDeck,
	service
} from '@5argon/arkham-kohaku';
import type { CardTextHtml, ReviewCountsData, ReviewRowData } from '@5argon/arkham-life-ui';

import { backLinkOf, getAllCards } from '$lib/card-data';
import { productToExploreRoute } from '$lib/utility/product';

import { cardTextHtml, firstPrintingOf } from './card-text';
import {
	dateLabel,
	mediumOf,
	personOf,
	reviewerSummaries,
	sourceId,
	type SourceJson,
	sourceUrl
} from './reviews';

/**
 * Which cards something about a whole product speaks about. It's on each of them, because a card is
 * what a review belongs to.
 */
type CoversJson = 'all' | 'investigators' | CardClass[];

interface ChapterOneCardJson {
	code: string;
	start?: string;
	/**
	 * The words to jump to on the page.
	 */
	text?: string;
}

interface ChapterOneJson extends Omit<SourceJson, 'date' | 'cards'> {
	/**
	 * Can be left out when it can't be found anymore.
	 */
	date?: string;
	/**
	 * Marks something shown before its product came out.
	 */
	preview?: boolean;
	cards?: ChapterOneCardJson[];
	covers?: CoversJson;
}

const files = import.meta.glob<ChapterOneJson[]>('../starter-content/review/chapter-one/*.json', {
	eager: true,
	import: 'default'
});

const chapterOneProducts: readonly Product[] = [
	...productCoreSetsChapterOne,
	...productChapterOneInvestigatorExpansions,
	...productInvestigatorStarterDeck
];

const allCards = getAllCards();
const cardByCode = new Map(allCards.map((card) => [card.code, card]));

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

function sourcesOf(product: Product): ChapterOneJson[] {
	return (
		files[`../starter-content/review/chapter-one/${productToExploreRoute(product)}.json`] ?? []
	);
}

function playerCardsOf(product: Product): Card[] {
	return allCards.filter(
		(card) => card.product === product && cardUtils.playerCardsNonCampaignFilter(card)
	);
}

function isInvestigator(card: Card): boolean {
	return cardUtils.deckbuildingInvestigatorCardsFilter(card);
}

function covered(product: Product, covers: CoversJson): Card[] {
	const cards = playerCardsOf(product);
	if (covers === 'all') return cards;
	if (covers === 'investigators') return cards.filter(isInvestigator);
	return cards.filter(
		(card) =>
			!isInvestigator(card) &&
			card.restrictions === undefined &&
			card.cardClass !== undefined &&
			Object.values(card.cardClass).some((slot) => covers.includes(slot))
	);
}

function entryOf(source: ChapterOneJson, on: ChapterOneCardJson): ReviewRowData {
	return {
		id: sourceId(source.media, source.title),
		medium: mediumOf(source.media),
		person: personOf(source),
		title: source.title,
		dateLabel: source.date && dateLabel(source.date),
		preview: source.preview,
		official: source.official,
		humor: source.humor,
		languageLabel: source.language && languageNames.of(source.language),
		startLabel: on.start,
		externalHref: sourceUrl(source.media, on)
	};
}

interface CardEntry {
	date: string;
	entry: ReviewRowData;
}

const entriesByCard = new Map<string, CardEntry[]>();
for (const product of chapterOneProducts) {
	for (const source of sourcesOf(product)) {
		const cards: ChapterOneCardJson[] = [
			...(source.cards ?? []),
			...(source.covers === undefined
				? []
				: covered(product, source.covers).map(({ code }) => ({ code })))
		];
		const seen = new Set<string>();
		for (const on of cards) {
			const { code } = on;
			if (seen.has(code)) continue;
			seen.add(code);
			const entries = entriesByCard.get(code) ?? [];
			entries.push({ date: source.date ?? '', entry: entryOf(source, on) });
			entriesByCard.set(code, entries);
		}
	}
}
for (const entries of entriesByCard.values()) {
	entries.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Products with something to see, which are the only ones to lead here.
 */
export function chapterOneReviewProducts(): Product[] {
	return chapterOneProducts.filter((product) =>
		playerCardsOf(product).some(({ code }) => entriesByCard.has(code))
	);
}

export interface ChapterOneProductCard {
	card: Card;
	counts: ReviewCountsData;
}

export function chapterOneProductCards(product: Product): ChapterOneProductCard[] {
	return playerCardsOf(product)
		.filter(({ code }) => entriesByCard.has(code))
		.map((card) => ({
			card,
			counts: { written: 0, external: entriesByCard.get(card.code)!.length }
		}));
}

export function chapterOneCardCodes(): string[] {
	return [...entriesByCard.keys()];
}

export interface ChapterOneCardPage {
	card: Card;
	text: CardTextHtml;
	entries: ReviewRowData[];
	arkhamBuildUrl: string;
	arkhamdbReviewsUrl: string;
}

export function chapterOneCardPage(code: string): ChapterOneCardPage | undefined {
	const card = cardByCode.get(code);
	const entries = entriesByCard.get(code);
	if (card === undefined || entries === undefined) return undefined;
	return {
		card: { ...card, backImageCode: card.backImageCode ?? backLinkOf(code) },
		text: cardTextHtml(code),
		entries: entries.map(({ entry }) => entry),
		arkhamBuildUrl: service.createArkhamBuildCardBrowserUrl(code),
		arkhamdbReviewsUrl: service.createArkhamDbCardReviewsBrowserUrl(firstPrintingOf(code))
	};
}

/**
 * Anything wrong with what's written in the files, for a test to name.
 */
export function chapterOneProblems(): string[] {
	const problems: string[] = [];
	const routes = new Set(chapterOneProducts.map(productToExploreRoute));
	for (const path of Object.keys(files)) {
		const route = path.split('/').at(-1)!.replace('.json', '');
		if (!routes.has(route)) problems.push(`${route}.json isn't a Chapter 1 product`);
	}
	const reviewers = new Set(reviewerSummaries().map(({ slug }) => slug));
	for (const product of chapterOneProducts) {
		for (const source of sourcesOf(product)) {
			const where = `${productToExploreRoute(product)}: "${source.title}"`;
			if (source.by !== undefined && !reviewers.has(source.by)) {
				problems.push(`${where}: ${source.by} has no reviewer page to lead to`);
			}
			if ((source.cards ?? []).length === 0 && source.covers === undefined) {
				problems.push(`${where}: it doesn't say which cards it speaks about`);
			}
			if (source.covers !== undefined && covered(product, source.covers).length === 0) {
				problems.push(`${where}: no card is covered by ${JSON.stringify(source.covers)}`);
			}
			if ('url' in source.media && source.media.url.includes('fantasyflightgames.com/en/news')) {
				if (!source.media.url.startsWith('https://web.archive.org/')) {
					problems.push(`${where}: that FFG address is gone, use the Wayback Machine`);
				}
			}
			for (const { code } of source.cards ?? []) {
				const card = cardByCode.get(code);
				if (card === undefined) problems.push(`${where}: unknown card ${code}`);
				else if (card.product !== product) {
					problems.push(`${where}: ${card.name} (${code}) is in ${card.product}`);
				}
			}
		}
	}
	return problems;
}
