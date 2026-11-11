import {
	Campaign as CampaignEnum,
	type Card,
	CardClass,
	CardType,
	card as cardUtils,
	environment,
	type Product,
	productChapterTwoInvestigatorExpansions,
	productCoreSetsChapterTwo,
	productDeckbuildingExpansions,
	productInvestigatorDeck,
	service,
	sorter,
	strings
} from '@5argon/arkham-kohaku';
import type {
	CardTextHtml,
	CardThumb,
	EnvironmentDisplay,
	ReviewCountsData,
	ReviewMedium,
	ReviewPerson,
	ReviewRowData,
	TemporaryCard,
	WrittenReviewPart
} from '@5argon/arkham-life-ui';
import {
	markdownToTrustedHtml,
	splitTimingDiagrams,
	timingDirectiveProblems
} from '@5argon/arkham-life-ui/markdown';
import { u as stringUtils } from '@5argon/arkham-string';
import { parse as parseYaml } from 'yaml';

import { createCardResolver, getAllCards } from '$lib/card-data';
import { siteOrigin, siteUrl } from '$lib/const';
import * as m from '$lib/paraglide/messages.js';
import {
	previewSeasonProductHref,
	reviewCardHref,
	reviewerHref,
	reviewProductHref
} from '$lib/review/paths';
import { recentListLimit } from '$lib/review/recent';
import { allContributors, contributor, toCore2026Code } from '$lib/starter-content';
import {
	environmentPointDetail,
	environmentPointTitle,
	environmentTalkingPool
} from '$lib/tool/environment-choices';
import { productToExploreRoute } from '$lib/utility/product';
import { isRewardCard, rewardCards, rewardRoute } from '$lib/utility/reward';

import { cardTextHtml, firstPrintingOf, hasCardText, hoverTextOf } from './card-text';
import { expandRuleDirectives, ruleDirectiveProblems } from './rules';
import {
	buildQlProblems,
	type BuildQlTopic,
	buildQlTopics,
	cardUsers,
	type CardUsers,
	slimCard
} from './card-users';

/**
 * Everything said about a card, only loaded on the server so no browser downloads it all: each page
 * gets only what it shows.
 *
 * Hand-written reviews live in a folder per card. Sources, which are videos and articles made
 * elsewhere, can talk about any number of cards, so each lists its cards.
 */

/**
 * Someone is credited as a contributor by slug, or as a guest who appears just this once.
 */
interface CreditJson {
	by?: string;
	guest?: {
		name: string;
		url?: string;
		avatarCardCode?: string;
		avatarUrl?: string;
	};
}

interface WrittenReview extends CreditJson {
	/**
	 * Who wrote it and the point in time it speaks about, like `5argon-evergreen`, unique among what's
	 * said about the card. The page links to it as `#id`, and the card is already in the link.
	 */
	id: string;
	/**
	 * The name of its file without `.md`. It can be anything, and only says which file a problem is in.
	 */
	fileName: string;
	/**
	 * When it came out, which is what orders the latest.
	 */
	date: string;
	/**
	 * When it was last changed, shown beside `date` on the review itself.
	 */
	updated?: string;
	/**
	 * The point in time it speaks about: an id of the Current environment.
	 */
	environment: string;
	/**
	 * Where it was first published, if it wasn't here.
	 */
	originalUrl?: string;
	/**
	 * The markdown after the front matter, in the same format as a deck guide.
	 */
	body: string;
}

type MediaJson =
	| { youtube: string }
	| { twitch: string }
	/**
	 * Lives on another site. `as` tells what's there when it isn't something to read.
	 */
	| { url: string; as?: 'video' | 'audio' }
	/**
	 * Can't be linked to, so it's only credited.
	 */
	| { discord: true };

interface KnownCardJson {
	code: string;
	/**
	 * For a video, where it starts talking about the card, like `12:34`.
	 */
	start?: string;
	/**
	 * For an article, the text to jump to.
	 */
	text?: string;
}

/**
 * A card just revealed in a preview, before it's in the card data. All there is to go on is what's
 * stated here, and once the card data has it a test asks to use its code instead.
 */
interface TemporaryCardJson {
	name: string;
	type: CardType;
	class: CardClass | CardClass[];
	level?: number;
}

type SourceCardJson = KnownCardJson | TemporaryCardJson;

export interface SourceJson extends CreditJson {
	title: string;
	date: string;
	/**
	 * Defaults to the point of the Current environment on `date`, which is Evergreen for anything older
	 * than that since those products released almost altogether.
	 */
	environment?: string;
	/**
	 * Language code, when it isn't in English.
	 */
	language?: string;
	official?: boolean;
	humor?: boolean;
	media: MediaJson;
	cards: SourceCardJson[];
	/**
	 * Campaigns it speaks about, listed on their pages. `cards` can be empty with this.
	 */
	campaigns?: CampaignEnum[];
}

interface PreviewSeasonJson {
	title: string;
	order: number;
	groups: {
		title: string;
		/**
		 * Which products' preview seasons it's part of.
		 */
		products: Product[];
		sources: SourceJson[];
	}[];
}

const writtenFiles = import.meta.glob<string>('../starter-content/review/card/*/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});
const sourceFiles = import.meta.glob<SourceJson[]>('../starter-content/review/source/*.json', {
	eager: true,
	import: 'default'
});
const seasonFiles = import.meta.glob<PreviewSeasonJson>(
	'../starter-content/review/preview/*.json',
	{
		eager: true,
		import: 'default'
	}
);

/**
 * Products with cards a review can talk about: what can be in the Current environment.
 */
export const reviewProducts: readonly Product[] = [
	...productCoreSetsChapterTwo,
	...productInvestigatorDeck,
	...productDeckbuildingExpansions,
	...productChapterTwoInvestigatorExpansions
];

const allCards = getAllCards();
const cardByCode = new Map(allCards.map((card) => [card.code, card]));
const slimOf = (card: Card | undefined) => card && slimCard(card);
/**
 * Cards of the review products, and every Reward card wherever it's from.
 */
const reviewableCards = allCards.filter(
	(card) =>
		(cardUtils.playerCardsNonCampaignFilter(card) && reviewProducts.includes(card.product)) ||
		isRewardCard(card)
);
const reviewableCodes = new Set(reviewableCards.map((card) => card.code));
const knownPoints = environment.currentEnvironmentVersions('9999-12-31');

function thumb(card: Card): CardThumb {
	return { code: card.code, name: card.name, cardClass: card.cardClass };
}

export function dateLabel(date: string): string {
	return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(
		new Date(date)
	);
}

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

function startSeconds(start: string): number {
	return start.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

const people = new Map<string, ReviewPerson>();

export function personOf(credit: CreditJson): ReviewPerson {
	if (credit.by !== undefined) {
		const known = people.get(credit.by);
		if (known !== undefined) return known;
		const person = contributor(credit.by);
		if (person === undefined) throw new Error(`Review credits unknown contributor: ${credit.by}`);
		const result: ReviewPerson = {
			name: person.name,
			href: reviewerHref(person.slug),
			avatarCard: person.avatarCard && thumb(person.avatarCard),
			avatarUrl: person.avatarUrl
		};
		people.set(credit.by, result);
		return result;
	}
	const guest = credit.guest!;
	const avatarCard = guest.avatarCardCode && cardByCode.get(guest.avatarCardCode);
	return {
		name: guest.name,
		href: guest.url,
		avatarCard: avatarCard ? thumb(avatarCard) : undefined,
		avatarUrl: guest.avatarUrl
	};
}

function reviewProductPageHref(product: Product): string | undefined {
	return reviewProducts.includes(product) &&
		reviewableCards.some((card) => card.product === product)
		? reviewProductHref(productToExploreRoute(product))
		: undefined;
}

const displays = new Map<string, EnvironmentDisplay>();

function environmentDisplay(id: string): EnvironmentDisplay {
	const known = displays.get(id);
	if (known !== undefined) return known;
	const point =
		knownPoints.find((p) => p.id === id) ??
		knownPoints.find((p) => p.id === environment.currentEnvironmentEvergreenId)!;
	const full = environmentPointDetail(point, reviewableCards, reviewProductPageHref);
	const detail = { ...full, roster: full.roster.map(slimCard) };
	const display: EnvironmentDisplay =
		point.id === environment.currentEnvironmentEvergreenId
			? {
					label: m.review_environment_evergreen(),
					description: m.common_evergreen_products(),
					detail
				}
			: {
					slots: environment
						.rotatingExpansionSlots(point.products)
						.map((product) => product && strings.getConsolidatedProductAbbreviation(product)),
					description: environmentPointTitle(point),
					detail: { ...detail, since: dateLabel(point.date) }
				};
	displays.set(id, display);
	return display;
}

function sourceEnvironmentId(source: SourceJson): string {
	return (
		source.environment ??
		environment.currentEnvironmentVersions(source.date).at(-1)?.id ??
		environment.currentEnvironmentEvergreenId
	);
}

export function mediumOf(media: MediaJson): ReviewMedium {
	if ('youtube' in media || 'twitch' in media) return 'video';
	if ('url' in media) return media.as ?? 'text';
	return 'text';
}

function twitchTime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return `${h}h${m}m${seconds % 60}s`;
}

/**
 * Where it is on its own site, opening right at the card when it's known where that is.
 */
export function sourceUrl(
	media: MediaJson,
	on?: Pick<KnownCardJson, 'start' | 'text'>
): string | undefined {
	const seconds = on?.start === undefined ? undefined : startSeconds(on.start);
	if ('youtube' in media) {
		const url = `https://www.youtube.com/watch?v=${media.youtube}`;
		return seconds === undefined ? url : `${url}&t=${seconds}s`;
	}
	if ('twitch' in media) {
		const url = `https://www.twitch.tv/videos/${media.twitch}`;
		return seconds === undefined ? url : `${url}?t=${twitchTime(seconds)}`;
	}
	if ('url' in media) {
		return on?.text === undefined ? media.url : textFragmentUrl(media.url, on.text);
	}
	return undefined;
}

/**
 * Jumps to that text once the page opens, or just opens the page where a browser can't.
 */
export function textFragmentUrl(url: string, text: string): string {
	return `${url}#:~:text=${encodeURIComponent(text).replaceAll('-', '%2D')}`;
}

export function sourceId(media: MediaJson, title: string): string {
	if ('youtube' in media) return `yt-${media.youtube}`;
	if ('twitch' in media) return `tw-${media.twitch}`;
	const url = 'url' in media ? media.url : title;
	const last =
		url
			.replace(/[?#].*$/, '')
			.replace(/\/+$/, '')
			.split('/')
			.pop() ?? url;
	return last.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export interface CardSubsection {
	/**
	 * The card it's about, whichever printing the heading linked.
	 */
	code: string;
	/**
	 * Where it is in the page of the review.
	 */
	anchor: string;
	/**
	 * What its heading says, when that's more than the name of the card.
	 */
	title?: string;
}

/**
 * What's said about a card, with what it takes to show it.
 */
export interface ReviewEntry extends ReviewRowData {
	/**
	 * A hand-written review, ready to show.
	 */
	parts?: WrittenReviewPart[];
	/**
	 * The parts of a hand-written review about one card each.
	 */
	subsections?: CardSubsection[];
	/**
	 * When it came out, for putting the newest first.
	 */
	date?: string;
	/**
	 * When the point in time it speaks about began, for putting the newest first.
	 */
	environmentDate?: string;
}

function isOnlyAboutCampaigns(source: SourceJson): boolean {
	return (source.campaigns?.length ?? 0) > 0 && source.cards.length === 0;
}

function sourceEntry(
	source: SourceJson,
	on: KnownCardJson | undefined,
	preview: boolean
): ReviewEntry {
	return {
		id: sourceId(source.media, source.title),
		medium: mediumOf(source.media),
		person: personOf(source),
		title: source.title,
		// A campaign plays the same whichever player cards are out.
		environment: isOnlyAboutCampaigns(source)
			? undefined
			: environmentDisplay(sourceEnvironmentId(source)),
		date: source.date,
		dateLabel: dateLabel(source.date),
		preview: preview || undefined,
		official: source.official,
		humor: source.humor,
		languageLabel: source.language && languageNames.of(source.language),
		startLabel: on?.start,
		externalHref: sourceUrl(source.media, on)
	};
}

function plainTextOf(html: string): string {
	return html
		.replace(/<[^>]+>/g, '')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&amp;', '&')
		.trim();
}

/**
 * Finds the parts of a review about a card, which are headings of any level with a link to that card
 * anywhere in them. Each heading comes out as the cards it links, to show instead of what the
 * markdown looked like, and any other words in it as plain text.
 */
export function compileCardSubsections(
	html: string,
	reviewId: string,
	cardHref: (code: string) => string | undefined = () => undefined
): { parts: WrittenReviewPart[]; subsections: CardSubsection[] } {
	const parts: WrittenReviewPart[] = [];
	const subsections: CardSubsection[] = [];
	const cardLink = /<(span|a) class="card-link[^"]*" data-card-code="(\w+)"[^>]*>.*?<\/\1>/gs;
	const addText = (text: string) => {
		for (const segment of splitTimingDiagrams(text)) {
			parts.push(
				segment.kind === 'html'
					? { kind: 'text', html: belowPageHeadings(segment.html) }
					: { kind: 'timing', timing: segment.timing }
			);
		}
	};
	let end = 0;
	// The page has its own title and sections, so what's written starts below those.
	const level = (written: number) => Math.max(written, 3) as 3 | 4 | 5 | 6;
	const belowPageHeadings = (text: string) => text.replace(/<(\/?)h[12]>/g, '<$1h3>');
	for (const heading of html.matchAll(/<h([1-6])>(.*?)<\/h\1>/gs)) {
		const inner = heading[2];
		const codes = [
			...new Set([...inner.matchAll(cardLink)].map((link) => toCore2026Code(link[2])))
		].filter((code) => cardByCode.has(code));
		if (codes.length === 0) continue;
		addText(html.slice(end, heading.index));
		end = heading.index + heading[0].length;
		const anchor = `${reviewId}-${codes[0]}`;
		const hasWords = /[\p{L}\p{N}]/u.test(plainTextOf(inner.replace(cardLink, '')));
		const title = hasWords ? plainTextOf(inner) : undefined;
		const hrefs = Object.fromEntries(
			codes.flatMap((code) => {
				const href = cardHref(code);
				return href === undefined ? [] : [[code, href]];
			})
		);
		parts.push({
			kind: 'cards',
			anchor,
			level: level(Number(heading[1])),
			codes,
			...(Object.keys(hrefs).length > 0 && { hrefs }),
			title
		});
		for (const code of codes) subsections.push({ code, anchor, title });
	}
	addText(html.slice(end));
	return { parts, subsections };
}

/**
 * Compiled once per review, since the lists and checks ask for the same review many times.
 */
const writtenEntries = new WeakMap<WrittenReview, ReviewEntry>();

function writtenEntry(review: WrittenReview): ReviewEntry {
	let entry = writtenEntries.get(review);
	if (entry === undefined) {
		entry = compileWrittenEntry(review);
		writtenEntries.set(review, entry);
	}
	return entry;
}

function compileWrittenEntry(review: WrittenReview): ReviewEntry {
	// A card mentioned goes to its own review page, except the card under review, which is already here.
	const cardHref = (code: string) => {
		const page = toCore2026Code(code);
		return reviewableCodes.has(code) && page !== reviewedCode.get(review)
			? reviewCardHref(page)
			: undefined;
	};
	return {
		id: review.id,
		medium: 'text',
		person: personOf(review),
		environment: environmentDisplay(review.environment),
		date: review.date,
		dateLabel: dateLabel(review.date),
		updatedLabel: review.updated === undefined ? undefined : dateLabel(review.updated),
		environmentDate: knownPoints.find((p) => p.id === review.environment)?.date,
		originalUrl: review.originalUrl,
		...compileCardSubsections(
			markdownToTrustedHtml(expandRuleDirectives(review.body), createCardResolver(), { cardHref }),
			review.id,
			cardHref
		)
	};
}

/**
 * Reads a review's file, which starts with its details as YAML front matter. Its id comes from who
 * wrote it and the point in time it speaks about, so the file can be named anything.
 */
export function parseWrittenReview(fileName: string, file: string): WrittenReview {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(file);
	const details: Partial<WrittenReview> = match === null ? {} : parseYaml(match[1]);
	const author =
		details.by ??
		details.guest?.name
			?.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	const id =
		author !== undefined && details.environment !== undefined
			? `${author}-${details.environment}`
			: fileName;
	return {
		...details,
		id,
		fileName,
		body: match === null ? file : file.slice(match[0].length)
	} as WrittenReview;
}

const writtenReviews = new Map<string, WrittenReview[]>();
/**
 * The card each written review is about.
 */
const reviewedCode = new Map<WrittenReview, string>();
for (const [path, file] of Object.entries(writtenFiles)) {
	const [code, name] = path.split('/').slice(-2);
	const reviews = writtenReviews.get(code) ?? [];
	const review = parseWrittenReview(name.replace(/\.md$/, ''), file);
	reviews.push(review);
	reviewedCode.set(review, code);
	writtenReviews.set(code, reviews);
}

function writtenByCard(): [code: string, reviews: WrittenReview[]][] {
	return [...writtenReviews];
}

const seasons = Object.values(seasonFiles).sort((a, b) => a.order - b.order);
const sources = Object.values(sourceFiles)
	.flat()
	.sort((a, b) => b.date.localeCompare(a.date));
const previews = seasons.flatMap((season) => season.groups.flatMap((group) => group.sources));

/**
 * Newest first: what's written here by the point in time it speaks about and then by when it came out,
 * everything else by when it came out.
 */
export function compareEntries(a: ReviewEntry, b: ReviewEntry): number {
	return (
		(b.environmentDate ?? '').localeCompare(a.environmentDate ?? '') ||
		(b.date ?? '').localeCompare(a.date ?? '')
	);
}

function knownCards(source: SourceJson): KnownCardJson[] {
	return source.cards.filter((on): on is KnownCardJson => 'code' in on);
}

const entriesByCard = new Map<string, ReviewEntry[]>();

function entriesOfCard(code: string): ReviewEntry[] {
	let entries = entriesByCard.get(code);
	if (entries === undefined) {
		entries = [];
		entriesByCard.set(code, entries);
	}
	return entries;
}

for (const [code, reviews] of writtenByCard()) {
	for (const review of reviews) entriesOfCard(code).push(writtenEntry(review));
}
for (const source of sources) {
	for (const on of knownCards(source)) entriesOfCard(on.code).push(sourceEntry(source, on, false));
}
// Official posts recap many cards at once, so they stay on the timeline of preview season.
for (const source of previews) {
	if (source.official) continue;
	for (const on of knownCards(source)) entriesOfCard(on.code).push(sourceEntry(source, on, true));
}
for (const entries of entriesByCard.values()) {
	entries.sort(compareEntries);
}

/**
 * What a list needs of an entry, without what it takes to show it.
 */
function slimEntry(entry: ReviewEntry): ReviewRowData {
	const leaveOut = [
		'parts',
		'subsections',
		'date',
		'updatedLabel',
		'environmentDate',
		'originalUrl'
	];
	// Fields left unset still cost their name on the page, hundreds of times on a reviewer's.
	return Object.fromEntries(
		Object.entries(entry).filter(([key, value]) => value !== undefined && !leaveOut.includes(key))
	) as ReviewRowData;
}

/**
 * A part of a review of another card that speaks about this card, usually an investigator.
 */
export interface CardInsightRow {
	entry: ReviewRowData;
	/**
	 * The card it's a review of.
	 */
	card: Card;
	/**
	 * Goes right to it.
	 */
	href: string;
}

const insightsByCard = new Map<string, { sort: ReviewEntry; row: CardInsightRow }[]>();

function addInsight(about: string, sort: ReviewEntry, code: string, href: string, title?: string) {
	const card = cardByCode.get(code);
	if (card === undefined) return;
	const insights = insightsByCard.get(about) ?? [];
	// The row leads with the card, so this is the only thing saying whose it is.
	const entry = { ...slimEntry(sort), title: title ?? sort.person.name };
	insights.push({ sort, row: { entry, card: slimCard(card), href } });
	insightsByCard.set(about, insights);
}

for (const [code, entries] of entriesByCard) {
	for (const entry of entries) {
		for (const { code: about, anchor, title } of entry.subsections ?? []) {
			if (about !== code) addInsight(about, entry, code, reviewCardHref(code, anchor), title);
		}
	}
}
for (const insights of insightsByCard.values()) {
	insights.sort((a, b) => compareEntries(a.sort, b.sort));
}

function insightsAbout(code: string): CardInsightRow[] {
	return (insightsByCard.get(code) ?? []).map(({ row }) => row);
}

function countsOf(code: string): ReviewCountsData {
	const entries = entriesByCard.get(code) ?? [];
	const written = entries.filter((entry) => entry.parts !== undefined).length;
	return {
		written,
		external: entries.length - written
	};
}

/**
 * What speaks about a campaign, newest first.
 */
export function campaignReviews(campaign: CampaignEnum): ReviewRowData[] {
	return sources
		.filter((source) => source.campaigns?.includes(campaign))
		.map((source) => ({
			...slimEntry(sourceEntry(source, undefined, false)),
			environment: undefined
		}));
}

/**
 * Products that have cards to show, with how much there is to see in each.
 */
export function reviewProductSummaries(): { product: Product; counts: ReviewCountsData }[] {
	return reviewProducts.flatMap((product) => {
		const cards = reviewableCards.filter((card) => card.product === product);
		if (cards.length === 0) return [];
		return [{ product, counts: totalCountsOf(cards) }];
	});
}

function totalCountsOf(cards: Card[]): ReviewCountsData {
	const counts: ReviewCountsData = { written: 0, external: 0 };
	for (const card of cards) {
		const own = countsOf(toCore2026Code(card.code));
		counts.written += own.written;
		counts.external += own.external;
	}
	return counts;
}

export interface RewardReviewSummary {
	counts: ReviewCountsData;
}

/**
 * How much there is to see over every Reward card, absent while there are none.
 */
export function rewardReviewSummary(): RewardReviewSummary | undefined {
	const cards = rewardCards(reviewableCards);
	if (cards.length === 0) return undefined;
	return { counts: totalCountsOf(cards) };
}

export interface ReviewProductCard {
	card: Card;
	/**
	 * Its page: a reprint shares the page of the card it reprints.
	 */
	code: string;
	counts: ReviewCountsData;
}

export function reviewProductCards(product: Product): ReviewProductCard[] {
	return reviewableCards
		.filter((card) => card.product === product)
		.sort((a, b) => sorter('position', a, b))
		.map(reviewProductCard);
}

/**
 * Every Reward card, in the order their products came out.
 */
export function rewardReviewCards(): ReviewProductCard[] {
	return rewardCards(reviewableCards).map(reviewProductCard);
}

function reviewProductCard(card: Card): ReviewProductCard {
	const code = toCore2026Code(card.code);
	return { card, code, counts: countsOf(code) };
}

/**
 * Cards with a page: one for each card, reprints sharing the one they reprint.
 */
export function reviewCardCodes(): string[] {
	return [...new Set(reviewableCards.map((card) => toCore2026Code(card.code)))];
}

function cardsMentionedIn(entries: ReviewEntry[]): Record<string, Card> {
	const mentioned: Record<string, Card> = {};
	for (const part of entries.flatMap((entry) => entry.parts ?? [])) {
		const codes =
			part.kind === 'cards'
				? part.codes
				: part.kind === 'text'
					? [...part.html.matchAll(/data-card-code="(\w+)"/g)].map((match) => match[1])
					: [];
		for (const code of codes) {
			const card = cardByCode.get(code);
			if (card !== undefined) mentioned[code] = slimCard(card);
		}
	}
	return mentioned;
}

/**
 * How a page shows up in search results.
 */
export interface ReviewCardSeo {
	title: string;
	description: string;
	image: string;
	jsonLd: object;
}

export interface ReviewCardPage {
	seo: ReviewCardSeo;
	card: Card;
	text: CardTextHtml;
	entries: ReviewEntry[];
	/**
	 * Cards the reviews link to, so hovering one needs no card data in the browser.
	 */
	mentioned: Record<string, Card>;
	/**
	 * The text of each card the reviews link to that has any, shown when hovering it.
	 */
	mentionedText: Record<string, CardTextHtml>;
	/**
	 * What reviews of other cards say with this card in mind.
	 */
	insights: CardInsightRow[];
	/**
	 * Which investigators of the latest point can take it. Not for investigators and weaknesses.
	 */
	users?: CardUsers;
	/**
	 * arkham.build searches made for this card, for each investigator who can take it.
	 */
	buildQl: BuildQlTopic[];
	arkhamBuildUrl: string;
	arkhamdbReviewsUrl: string;
}

/**
 * The name of a card, with what tells it apart from the other versions of it.
 */
function distinctCardName(card: Card): string {
	const others = reviewableCards.filter(
		(other) => other.name === card.name && toCore2026Code(other.code) !== card.code
	);
	const level = card.xp && others.length > 0 ? ` (${card.xp})` : '';
	const needsSubname =
		card.subname !== undefined && others.some((other) => (other.xp ?? 0) === (card.xp ?? 0));
	return `${card.name}${level}${needsSubname ? `: ${card.subname}` : ''}`;
}

/**
 * The same wording on every page, so nothing here depends on who reviewed the card.
 */
function reviewCardSeo(card: Card, entries: ReviewEntry[]): ReviewCardSeo {
	const name = distinctCardName(card);
	const title = m.review_card_seo_title({ name });
	const product = productsOfPage.get(card.code)?.[0] ?? card.product;
	// A Reward card from a campaign or scenario has no product page, only the Reward one.
	const ownProduct = reviewProducts.includes(product);
	const url = siteOrigin + reviewCardHref(card.code);
	const image = siteUrl(
		ownProduct ? `image/product/${product}.webp` : 'image/resource/review.webp'
	);
	const breadcrumb = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ name: m.review_title(), path: '/review' },
			ownProduct
				? {
						name: stringUtils.productName(product),
						path: reviewProductHref(productToExploreRoute(product))
					}
				: { name: m.common_reward_cards(), path: reviewProductHref(rewardRoute) },
			{ name: card.name, path: reviewCardHref(card.code) }
		].map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: siteOrigin + item.path
		}))
	};
	const articles = entries
		.filter((entry) => entry.parts !== undefined)
		.map((entry) => ({
			'@type': 'Article',
			headline: title,
			url: `${url}#${entry.id}`,
			datePublished: entry.date,
			image,
			author: { '@type': 'Person', name: entry.person.name }
		}));
	return {
		title,
		description: m.review_card_seo_description({ name }),
		image,
		jsonLd: { '@context': 'https://schema.org', '@graph': [breadcrumb, ...articles] }
	};
}

export function reviewCardPage(code: string): ReviewCardPage | undefined {
	const card = cardByCode.get(code);
	if (card === undefined || !reviewableCodes.has(code) || toCore2026Code(code) !== code) {
		return undefined;
	}
	const entries = entriesByCard.get(code) ?? [];
	const mentioned = cardsMentionedIn(entries);
	return {
		seo: reviewCardSeo(card, entries),
		card: slimCard(card),
		text: cardTextHtml(code),
		entries,
		mentioned,
		mentionedText: hoverTextOf(mentioned),
		insights: insightsAbout(code),
		users: cardUsers(card),
		buildQl: buildQlTopics(card),
		arkhamBuildUrl: service.createArkhamBuildCardBrowserUrl(code),
		arkhamdbReviewsUrl: service.createArkhamDbCardReviewsBrowserUrl(firstPrintingOf(code))
	};
}

/**
 * One line of a card a preview showed: the card, or what's known of it before it's in the card data.
 */
export type PreviewCardLine =
	{ card: Card; temporary?: undefined } | { card?: undefined; temporary: TemporaryCard };

export interface PreviewSeasonRow {
	entry: ReviewRowData;
	cards: PreviewCardLine[];
}

const previewGroups = seasons.flatMap((season) => season.groups);

/**
 * Products with a preview season, with how many previews each had. Goes by what's listed rather than
 * by card data, which a product in its preview season doesn't have yet.
 */
export function previewSeasonSummaries(): { product: Product; counts: ReviewCountsData }[] {
	return reviewProducts.flatMap((product) => {
		const external = previewGroups
			.filter((group) => group.products.includes(product))
			.reduce((sum, group) => sum + group.sources.length, 0);
		return external === 0 ? [] : [{ product, counts: { written: 0, external } }];
	});
}

function temporaryCard(on: TemporaryCardJson): TemporaryCard {
	const [class1, class2, class3] = Array.isArray(on.class) ? on.class : [on.class];
	return {
		name: on.name,
		cardType: on.type,
		cardClass: { class1, class2, class3 },
		xp: on.level
	};
}

/**
 * A product's preview season as it happened, whether or not it's known yet which cards a preview
 * showed.
 */
export function previewSeasonGroups(product: Product) {
	return previewGroups
		.filter((group) => group.products.includes(product))
		.map((group) => ({
			title: group.title,
			rows: group.sources.map((source): PreviewSeasonRow => ({
				entry: sourceEntry(source, undefined, true),
				cards: source.cards.flatMap((on): PreviewCardLine[] => {
					if (!('code' in on)) return [{ temporary: temporaryCard(on) }];
					const card = cardByCode.get(on.code);
					return card ? [{ card }] : [];
				})
			}))
		}));
}

/**
 * The products a card's page covers: its own, and those of whatever reprints it.
 */
const productsOfPage = new Map<string, Product[]>();
for (const card of reviewableCards) {
	const code = toCore2026Code(card.code);
	const products = productsOfPage.get(code) ?? [];
	if (!products.includes(card.product)) products.push(card.product);
	productsOfPage.set(code, products);
}

const rewardPageCodes = new Set(
	reviewableCards.filter(isRewardCard).map((card) => toCore2026Code(card.code))
);

/**
 * Past this many cards, a recent review only says how many it covers.
 */
const recentCardLineLimit = 4;

export interface RecentReviewCard {
	code: string;
	products: Product[];
	/**
	 * Shown whichever environment is picked, like the Reward cards tile.
	 */
	reward: boolean;
	/**
	 * Only for what covers few enough cards to list them.
	 */
	card?: Card;
}

export interface RecentReviewRow {
	key: string;
	entry: ReviewRowData;
	/**
	 * Goes to the card's page, for a review written for this site.
	 */
	href?: string;
	cards: RecentReviewCard[];
}

/**
 * What a list of recent reviews is about: a product, or every Reward card.
 */
export type RecentReviewScope = Product | typeof rewardRoute;

function recentCards(codes: string[], scope: RecentReviewScope | undefined): RecentReviewCard[] {
	const inScope = codes.filter(
		(code) =>
			scope === undefined ||
			(scope === rewardRoute
				? rewardPageCodes.has(code)
				: productsOfPage.get(code)?.includes(scope))
	);
	return inScope.map((code) => ({
		code,
		products: productsOfPage.get(code) ?? [],
		reward: rewardPageCodes.has(code),
		card: inScope.length <= recentCardLineLimit ? slimOf(cardByCode.get(code)) : undefined
	}));
}

/**
 * Keeps what's among the latest of any product it covers, written here and elsewhere each counting by
 * themselves. Whichever products get picked later, what either list shows from them is in here: being
 * among the latest of them all means being among the latest of one.
 */
function amongLatestOfAnyProduct(rows: RecentReviewRow[]): RecentReviewRow[] {
	const seen = new Map<string, number>();
	return rows.filter((row) => {
		let keep = false;
		for (const product of new Set(row.cards.flatMap((card) => card.products))) {
			const key = `${row.href !== undefined}-${product}`;
			const count = seen.get(key) ?? 0;
			if (count < recentListLimit) keep = true;
			seen.set(key, count + 1);
		}
		return keep;
	});
}

/**
 * The latest written here and the latest elsewhere, which are listed apart.
 */
function latestOfEachKind(rows: RecentReviewRow[]): RecentReviewRow[] {
	const written = rows.filter((row) => row.href !== undefined).slice(0, recentListLimit);
	const external = rows.filter((row) => row.href === undefined).slice(0, recentListLimit);
	return rows.filter((row) => written.includes(row) || external.includes(row));
}

function writtenRows(
	scope: RecentReviewScope | undefined
): { date: string; row: RecentReviewRow }[] {
	const rows: { date: string; row: RecentReviewRow }[] = [];
	for (const [code, reviews] of writtenByCard()) {
		const cards = recentCards([code], scope);
		if (cards.length === 0) continue;
		for (const review of reviews) {
			rows.push({
				date: review.date,
				row: {
					key: `${code}-${review.id}`,
					entry: slimEntry(writtenEntry(review)),
					href: reviewCardHref(code, review.id),
					cards
				}
			});
		}
	}
	return rows;
}

/**
 * Every review written for this site, newest first.
 */
export function writtenReviewRows(): RecentReviewRow[] {
	return writtenRows(undefined)
		.sort((a, b) => b.date.localeCompare(a.date))
		.map(({ row }) => row);
}

/**
 * Everything said, newest first, written here or elsewhere, one row each however many cards it covers.
 * With a product or the Reward cards, only what speaks about those cards. Official posts stay on the
 * Preview Season pages.
 */
export function recentReviews(scope?: RecentReviewScope): RecentReviewRow[] {
	const rows = writtenRows(scope);
	const addSource = (source: SourceJson, preview: boolean) => {
		if (source.official) return;
		const known = knownCards(source);
		const cards = recentCards(
			known.map((on) => on.code),
			scope
		);
		if (cards.length === 0) return;
		rows.push({
			date: source.date,
			row: {
				key: `${source.date}-${sourceId(source.media, source.title)}`,
				// With one card it can open right where it talks about it.
				entry: slimEntry(sourceEntry(source, known.length === 1 ? known[0] : undefined, preview)),
				cards
			}
		});
	};
	for (const source of sources) addSource(source, false);
	for (const source of previews) addSource(source, true);
	const newest = rows.sort((a, b) => b.date.localeCompare(a.date)).map(({ row }) => row);
	return scope === undefined ? amongLatestOfAnyProduct(newest) : latestOfEachKind(newest);
}

export interface ContributorReviewRow {
	entry: ReviewRowData;
	/**
	 * Goes to the card's page, for a review written for this site.
	 */
	href?: string;
	/**
	 * The card it speaks about.
	 */
	card?: Card;
}

/**
 * Everything by one person, newest first, as lines for searching through.
 */
export function reviewsBy(slug: string): ContributorReviewRow[] {
	const rows: { date: string; row: ContributorReviewRow }[] = [];
	for (const [code, reviews] of writtenByCard()) {
		for (const review of reviews) {
			if (review.by !== slug) continue;
			rows.push({
				date: review.date,
				row: {
					entry: slimEntry(writtenEntry(review)),
					card: slimOf(cardByCode.get(code)),
					href: reviewCardHref(code, review.id)
				}
			});
		}
	}
	const addSource = (source: SourceJson, preview: boolean) => {
		if (source.by !== slug) return;
		const { date } = source;
		const known = knownCards(source);
		if (known.length === 0) {
			rows.push({ date, row: { entry: slimEntry(sourceEntry(source, undefined, preview)) } });
		}
		for (const on of known) {
			rows.push({
				date,
				row: {
					entry: slimEntry(sourceEntry(source, on, preview)),
					card: slimOf(cardByCode.get(on.code))
				}
			});
		}
	};
	for (const source of sources) addSource(source, false);
	for (const source of previews) addSource(source, true);
	return rows.sort((a, b) => b.date.localeCompare(a.date)).map(({ row }) => row);
}

/**
 * Pages worth a search engine's time: cards with something to see, and the people who said it.
 */
export interface ReviewerSummary {
	slug: string;
	person: ReviewPerson;
	/**
	 * How many reviews, however many cards each one speaks about.
	 */
	counts: ReviewCountsData;
}

/**
 * Everyone with a page of their reviews, whoever has the most first.
 */
export function reviewerSummaries(): ReviewerSummary[] {
	const summaries: ReviewerSummary[] = [];
	for (const { slug } of allContributors()) {
		const rows = reviewsBy(slug);
		if (rows.length === 0) continue;
		const count = (written: boolean) =>
			new Set(rows.filter((row) => written === (row.href !== undefined)).map((row) => row.entry.id))
				.size;
		summaries.push({
			slug,
			person: personOf({ by: slug }),
			counts: { written: count(true), external: count(false) }
		});
	}
	const total = ({ counts }: ReviewerSummary) => counts.written + counts.external;
	return summaries.sort(
		(a, b) => total(b) - total(a) || a.person.name.localeCompare(b.person.name)
	);
}

/**
 * When the newest review written here came out, for a page that has one. Only those change in a way
 * worth a search engine coming back for.
 */
export function reviewLastModified(path: string): string | undefined {
	const code = /^\/review\/card\/(\w+)$/.exec(path)?.[1];
	const written = (entriesByCard.get(code ?? '') ?? []).filter(
		(entry) => entry.parts !== undefined
	);
	return written
		.map((entry) => entry.date ?? '')
		.sort()
		.at(-1);
}

export function reviewSitemapPaths(): string[] {
	const withContent = reviewCardCodes().filter(
		(code) => entriesByCard.has(code) || insightsByCard.has(code)
	);
	return [
		'/review',
		'/review/preview-season',
		...previewSeasonSummaries().map(({ product }) =>
			previewSeasonProductHref(productToExploreRoute(product))
		),
		...withContent.map((code) => reviewCardHref(code)),
		'/review/reviewers',
		...reviewProductSummaries().map(({ product }) =>
			reviewProductHref(productToExploreRoute(product))
		),
		...(rewardReviewSummary() === undefined ? [] : [reviewProductHref(rewardRoute)]),
		...reviewerSummaries().map(({ slug }) => reviewerHref(slug))
	];
}

function creditProblems(credit: CreditJson, where: string): string[] {
	if ((credit.by === undefined) === (credit.guest === undefined)) {
		return [`${where}: credit either a contributor or a guest`];
	}
	if (credit.by !== undefined && contributor(credit.by) === undefined) {
		return [`${where}: unknown contributor ${credit.by}`];
	}
	if (credit.guest?.avatarCardCode && !cardByCode.has(credit.guest.avatarCardCode)) {
		return [`${where}: unknown avatar card ${credit.guest.avatarCardCode}`];
	}
	return [];
}

function subsectionProblems(review: WrittenReview, code: string, where: string): string[] {
	const problems: string[] = [];
	const seen = new Set<string>();
	const pool = environmentTalkingPool(review.environment);
	for (const { code: about } of writtenEntry(review).subsections ?? []) {
		// The card under review, or one with no page to be collected on, is only a heading.
		const card = cardByCode.get(about);
		if (about === code || card === undefined || !reviewableCodes.has(about)) continue;
		if (seen.has(about)) problems.push(`${where}: two headings link to ${card.name}`);
		seen.add(about);
		if (pool !== undefined && !pool.includes(card.product) && !isRewardCard(card)) {
			problems.push(`${where}: ${card.name} isn't out yet at environment ${review.environment}`);
		}
	}
	return problems;
}

/**
 * What's wrong with talking about this card at this point in time.
 */
function subjectProblems(code: string, environmentId: string | undefined, where: string): string[] {
	const problems: string[] = [];
	const card = cardByCode.get(code);
	if (card === undefined || !reviewableCodes.has(code)) {
		return [`${where}: ${code} isn't a card that can be reviewed`];
	}
	if (toCore2026Code(code) !== code) {
		problems.push(`${where}: ${code} is a reprint, use ${toCore2026Code(code)}`);
	}
	const pool = environmentId === undefined ? undefined : environmentTalkingPool(environmentId);
	if (environmentId !== undefined && pool === undefined) {
		problems.push(`${where}: unknown environment ${environmentId}`);
	}
	// "Reward cards may be used regardless of release date." (Grimoire 12.001)
	if (pool !== undefined && !pool.includes(card.product) && !isRewardCard(card)) {
		problems.push(`${where}: ${card.name} isn't out yet at environment ${environmentId}`);
	}
	return problems;
}

function temporaryCardProblems(on: TemporaryCardJson, preview: boolean, where: string): string[] {
	const problems: string[] = [];
	if (!preview) problems.push(`${where}: only a preview can list a card not in the card data`);
	if (on.name.trim().length === 0) problems.push(`${where}: a card needs a name`);
	if (!Object.values(CardType).includes(on.type)) {
		problems.push(`${where}: ${on.name} has unknown type ${on.type}`);
	}
	const classes = Array.isArray(on.class) ? on.class : [on.class];
	const validClasses = classes.every((c) => Object.values(CardClass).includes(c));
	if (classes.length < 1 || classes.length > 3 || !validClasses) {
		problems.push(`${where}: ${on.name} has unknown class ${classes.join(', ')}`);
	}
	if (on.level !== undefined && (!Number.isInteger(on.level) || on.level < 0 || on.level > 5)) {
		problems.push(`${where}: ${on.name} has level ${on.level}, which should be 0 to 5`);
	}
	const known = reviewableCards.find(
		(card) =>
			card.name.toLowerCase() === on.name.trim().toLowerCase() && (card.xp ?? 0) === (on.level ?? 0)
	);
	if (known !== undefined) {
		problems.push(
			`${where}: ${on.name} is in the card data now, use its code ${toCore2026Code(known.code)}`
		);
	}
	return problems;
}

function dateProblems(date: string | undefined, where: string, sinceChapterTwo = true): string[] {
	if (date === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return [`${where}: date must look like 2026-01-31`];
	}
	return sinceChapterTwo && date < environment.chapterTwoAnnouncedDate
		? [`${where}: older than the Chapter 2 announcement`]
		: [];
}

/**
 * What's wrong with a source, written to be fixed by whoever just added it.
 */
export function sourceProblems(source: SourceJson, preview: boolean): string[] {
	const where = `"${source.title}"`;
	const problems = creditProblems(source, where);
	// Only Chapter 2 cards have to be newer than its announcement, a campaign's guide can be any age.
	const badDate = dateProblems(source.date, where, !isOnlyAboutCampaigns(source));
	if (badDate.length > 0) return [...problems, ...badDate];
	const environmentId = sourceEnvironmentId(source);
	if (!preview && source.cards.length === 0 && (source.campaigns?.length ?? 0) === 0) {
		problems.push(`${where}: say which cards or campaigns it speaks about`);
	}
	for (const campaign of source.campaigns ?? []) {
		if (!Object.values(CampaignEnum).includes(campaign)) {
			problems.push(`${where}: unknown campaign ${campaign}`);
		}
	}
	const seen = new Set<string>();
	for (const on of source.cards) {
		if (!('code' in on)) {
			problems.push(...temporaryCardProblems(on, preview, where));
			continue;
		}
		if (seen.has(on.code)) problems.push(`${where}: lists ${on.code} twice`);
		seen.add(on.code);
		problems.push(
			...subjectProblems(
				on.code,
				preview && source.environment === undefined ? undefined : environmentId,
				where
			)
		);
		if (on.start !== undefined) {
			if (!/^(\d+:)?\d{1,2}:\d{2}$/.test(on.start)) {
				problems.push(`${where}: start must look like 12:34, not ${on.start}`);
			}
			if (!('youtube' in source.media || 'twitch' in source.media)) {
				problems.push(`${where}: only a video can start partway through`);
			}
		}
		if (on.text !== undefined && !('url' in source.media)) {
			problems.push(`${where}: only an article has text to jump to`);
		}
	}
	return problems;
}

/**
 * Everything wrong with the content, for a test to fail on.
 */
export function reviewProblems(): string[] {
	const problems: string[] = [];
	for (const [code, reviews] of writtenByCard()) {
		const ids = new Set<string>();
		for (const review of reviews) {
			const where = `${code}/${review.fileName}.md`;
			if (ids.has(review.id)) {
				problems.push(
					`${where}: another review of this card is by the same person at the same point`
				);
			}
			ids.add(review.id);
			problems.push(...creditProblems(review, where));
			problems.push(...dateProblems(review.date, where));
			if (review.updated !== undefined) {
				const updatedProblems = dateProblems(review.updated, `${where} updated`);
				problems.push(...updatedProblems);
				if (updatedProblems.length === 0 && review.updated <= review.date) {
					problems.push(`${where}: updated must be after date`);
				}
			}
			if (review.originalUrl !== undefined && !/^https:\/\/\S+$/.test(review.originalUrl)) {
				problems.push(`${where}: originalUrl must be a full https address`);
			}
			if (typeof review.environment !== 'string' || review.environment.length === 0) {
				problems.push(`${where}: needs an environment`);
			}
			problems.push(...subjectProblems(code, review.environment, where));
			problems.push(...subsectionProblems(review, code, where));
			for (const match of review.body.matchAll(/\]\(\/card\/(\w+)\)/g)) {
				if (!cardByCode.has(match[1])) problems.push(`${where}: links to unknown card ${match[1]}`);
			}
			for (const problem of [
				...ruleDirectiveProblems(review.body),
				...timingDirectiveProblems(review.body)
			]) {
				problems.push(`${where}: ${problem}`);
			}
		}
	}
	problems.push(...buildQlProblems(new Set(reviewCardCodes())));
	for (const source of sources) problems.push(...sourceProblems(source, false));
	for (const source of previews) problems.push(...sourceProblems(source, true));
	for (const group of previewGroups) {
		for (const product of group.products) {
			if (!reviewProducts.includes(product)) {
				problems.push(`Preview group "${group.title}": unknown product ${product}`);
			}
		}
		if (group.products.length === 0) problems.push(`Preview group "${group.title}": no products`);
	}
	for (const [code, entries] of entriesByCard) {
		const ids = entries.map((entry) => entry.id);
		const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
		if (repeated.length > 0) problems.push(`${code}: repeats ${repeated.join(', ')}`);
	}
	return problems;
}

/**
 * Cards with a page that have no text to show, because the text file needs regenerating.
 */
export function cardsMissingText(): string[] {
	return reviewCardCodes().filter((code) => !hasCardText(code));
}
