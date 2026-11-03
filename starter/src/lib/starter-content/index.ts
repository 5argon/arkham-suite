import { type AhdbDeck, type Card, Product } from '@5argon/arkham-kohaku';
import type { BylineEntry } from '@5argon/arkham-life-ui';

import { getAllCards } from '../card-data';
import type { TeamDisplay } from '../tool/evergreen-team/team-display';
import type { DeckChange } from '../tool/starter/deck-changes';

/**
 * Someone credited on the site, shared by everything they make. One file per
 * person under contributor/, named by slug.
 */
export interface Contributor {
	slug: string;
	name: string;
	arkhamdbUserId?: number;
	arkhamdbUrl?: string;
	/**
	 * Card whose square art is the contributor's circular avatar.
	 */
	avatarCard?: Card;
	/**
	 * Their own words, plain text with bare URLs. Also the page's meta
	 * description.
	 */
	profile?: string;
}

interface ContributorJson {
	name: string;
	arkhamdbUserId?: number;
	arkhamdbUrl?: string;
	avatarCardCode?: string;
	profile?: string;
}

/**
 * Hand-curated starter deck library: one folder per author, one folder per
 * series inside it, and verbatim copies of each deck JSON under decks/. The
 * copies exist so the decks stay available even if the original listing goes
 * offline; pages always point readers back to the original.
 */

/**
 * One deck at one XP breakpoint (0, 9, 19, 29, 39...).
 */
export interface StarterDeckVersion {
	breakpoint: number;
	deck: AhdbDeck;
}

/**
 * One starter deck as the site presents it: the same build at one or more XP
 * breakpoints, plus an optional Upgrade Planner plan between them.
 */
export interface StarterDeckEntry {
	id: number;
	slug: string;
	/**
	 * Ascending by breakpoint. The lowest version carries the next one's
	 * upgrades as its side deck (what to gather), the rest are as published.
	 */
	versions: StarterDeckVersion[];
	/**
	 * The lowest version; what listings show.
	 */
	primary: AhdbDeck;
	/**
	 * Hand-picked excerpt of the deck's own description, as markdown.
	 */
	introMd?: string;
	/**
	 * Image representing the deck.
	 */
	bannerUrl?: string;
	/**
	 * Upgrade Planner share string (its ?i= parameter).
	 */
	upgradePlan?: string;
	series: StarterSeries;
}

export interface StarterSeries {
	slug: string;
	name: string;
	description: string;
	/**
	 * Card whose square art represents the series, in a rounded square.
	 */
	iconCard?: Card;
	author: Contributor;
	/**
	 * In the series' intended order.
	 */
	entries: StarterDeckEntry[];
}

interface SeriesJson {
	slug: string;
	/**
	 * Position among the author's series, ascending. Unique per author.
	 */
	order: number;
	name: string;
	description: string;
	iconCardCode?: string;
	decks: {
		/**
		 * Id of the version the author listed, one of `versions`.
		 */
		id: number;
		/**
		 * Hand-assigned URL slug, e.g. "hurting-for-clues".
		 */
		slug: string;
		/**
		 * Hand-picked excerpt of the deck's own description, surfaced as
		 * arkham.build's meta.intro_md so listings show what the deck is about.
		 */
		introMd?: string;
		/**
		 * Image representing the deck, surfaced as arkham.build's meta.banner_url
		 * and used as the page's share image.
		 */
		bannerUrl?: string;
		/**
		 * Files under decks/, ascending by breakpoint.
		 */
		versions: { breakpoint: number; file: string }[];
		upgradePlan?: string;
	}[];
}

const contributorFiles = import.meta.glob<ContributorJson>('./contributor/*.json', {
	eager: true,
	import: 'default'
});
const seriesFiles = import.meta.glob<SeriesJson>('./starter/*/*/series.json', {
	eager: true,
	import: 'default'
});
const deckFiles = import.meta.glob<AhdbDeck>('./starter/*/*/decks/*.json', {
	eager: true,
	import: 'default'
});
/**
 * Editable copies of the published guides, one per deck slug, for what an
 * archive can't change (like an image host retiring an address).
 */
const guideFiles = import.meta.glob<string>('./starter/*/*/guides/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

/**
 * Authors usually publish the experienced version and link the 0 XP build
 * separately. Beginners need both at once, so the lower version's side deck
 * becomes what to gather beyond its main deck: every extra copy the next
 * version adds (the upgrades to buy), plus whatever the next version keeps in
 * its own side deck for later (cards it does not already play at the lower
 * level).
 */
export function composeStarterDeck(lower: AhdbDeck, higher: AhdbDeck): AhdbDeck {
	const sideSlots: Record<string, number> = {};
	for (const [code, quantity] of Object.entries(higher.slots ?? {})) {
		const extra = quantity - (lower.slots?.[code] ?? 0);
		if (extra > 0) sideSlots[code] = extra;
	}
	for (const [code, quantity] of Object.entries(higher.sideSlots ?? {})) {
		if ((lower.slots?.[code] ?? 0) > 0) continue;
		sideSlots[code] = (sideSlots[code] ?? 0) + quantity;
	}
	return { ...lower, sideSlots, ignoreDeckLimitSlots: {} };
}

const allCards = getAllCards();
const cardByCode = new Map(allCards.map((c) => [c.code, c]));
const printingKey = (c: Card) => `${c.name}|${c.subname ?? ''}|${c.xp ?? 0}`;
const core2026ByPrinting = new Map(
	allCards.filter((c) => c.product === Product.CoreSet2026).map((c) => [printingKey(c), c.code])
);

/**
 * Authors sometimes pick an older printing of a card that the Core Set 2026
 * also contains (the original core's Guts, an expansion's Charisma...).
 * Starter decks are meant to be built from the 2026 products, so such codes
 * are swapped for the Core Set 2026 printing; anything else is left alone.
 */
export function toCore2026Code(code: string): string {
	const card = cardByCode.get(code);
	if (card === undefined || card.product === Product.CoreSet2026) return code;
	return core2026ByPrinting.get(printingKey(card)) ?? code;
}

function normalizeSlots(slots: Record<string, number> | null | undefined): Record<string, number> {
	const out: Record<string, number> = {};
	for (const [code, quantity] of Object.entries(slots ?? {})) {
		const next = toCore2026Code(code);
		out[next] = (out[next] ?? 0) + quantity;
	}
	return out;
}

function normalizeDeck(deck: AhdbDeck): AhdbDeck {
	return {
		...deck,
		investigator_code: toCore2026Code(deck.investigator_code),
		slots: normalizeSlots(deck.slots),
		sideSlots: normalizeSlots(deck.sideSlots),
		ignoreDeckLimitSlots: normalizeSlots(deck.ignoreDeckLimitSlots)
	};
}

/**
 * The higher version's side deck also lists what the lower version played
 * and this one dropped, so the path from one build to the next stays visible
 * (authors do this by hand inconsistently; here it is uniform).
 */
export function withRemovedCards(higher: AhdbDeck, lower: AhdbDeck): AhdbDeck {
	const sideSlots: Record<string, number> = { ...(higher.sideSlots ?? {}) };
	for (const [code, quantity] of Object.entries(lower.slots ?? {})) {
		const removed = quantity - (higher.slots?.[code] ?? 0);
		if (removed > 0) sideSlots[code] = Math.max(sideSlots[code] ?? 0, removed);
	}
	return { ...higher, sideSlots };
}

/**
 * The version the author actually listed, identified by the deck's id. It can
 * be any of them: some authors publish the highest build, others publish only
 * the 0 XP one. Lower builds saved elsewhere often have working titles like
 * "(0XP)", and readers should be sent to the published listing.
 */
export function publishedVersion(files: AhdbDeck[], id: number, owner: string): AhdbDeck {
	const published = files.find((deck) => deck.id === id);
	if (published === undefined) throw new Error(`Starter deck not published: ${owner}`);
	return published;
}

/**
 * The archived JSON stays verbatim; curated fields are merged into a copy's
 * meta under their arkham.build names.
 */
function withCuratedMeta(deck: AhdbDeck, introMd?: string, bannerUrl?: string): AhdbDeck {
	if (introMd === undefined && bannerUrl === undefined) return deck;
	let meta: Record<string, unknown>;
	try {
		meta = JSON.parse(deck.meta || '{}');
	} catch {
		meta = {};
	}
	return {
		...deck,
		meta: JSON.stringify({
			...meta,
			...(introMd === undefined ? {} : { intro_md: introMd }),
			...(bannerUrl === undefined ? {} : { banner_url: bannerUrl })
		})
	};
}

/**
 * Products the deck draws from, per arkham.build's meta.card_pool.
 */
export function deckCardPool(deck: AhdbDeck): string[] {
	try {
		const pool = JSON.parse(deck.meta || '{}').card_pool;
		return typeof pool === 'string' ? pool.split(',').map((p) => p.trim()) : [];
	} catch {
		return [];
	}
}

function iconCard(code: string | undefined, owner: string): Card | undefined {
	if (code === undefined) return undefined;
	const card = cardByCode.get(code);
	if (card === undefined) throw new Error(`Starter icon card missing: ${code} (${owner})`);
	return card;
}

const contributors: Contributor[] = Object.entries(contributorFiles).map(
	([path, { avatarCardCode, ...json }]) => ({
		...json,
		slug: path.replace(/^.*\/|\.json$/g, ''),
		avatarCard: iconCard(avatarCardCode, path)
	})
);
const seriesFilesInOrder = Object.entries(seriesFiles).sort(([, a], [, b]) => a.order - b.order);
const series: StarterSeries[] = seriesFilesInOrder.map(([path, json]) => {
	const authorSlug = path.replace(/^\.\/starter\//, '').split('/')[0];
	const author = contributor(authorSlug);
	if (author === undefined) throw new Error(`Starter series without contributor: ${path}`);
	const dir = path.replace(/series\.json$/, 'decks/');
	const guideDir = path.replace(/series\.json$/, 'guides/');
	const result: StarterSeries = {
		slug: json.slug,
		name: json.name,
		description: json.description,
		iconCard: iconCard(json.iconCardCode, path),
		author,
		entries: []
	};
	result.entries = json.decks.map((d) => {
		const sorted = [...d.versions].sort((a, b) => a.breakpoint - b.breakpoint);
		const files = sorted.map(({ file }) => {
			const deck = deckFiles[dir + file];
			if (deck === undefined) throw new Error(`Starter deck file missing: ${dir}${file}`);
			return normalizeDeck(deck);
		});
		const owner = `${path} ${d.slug}`;
		const published = publishedVersion(files, d.id, owner);
		const guide = guideFiles[`${guideDir}${d.slug}.md`];
		if (guide === undefined) throw new Error(`Starter deck guide missing: ${owner}`);
		// ArkhamDB has no notion of series, so authors append it to the deck
		// name ("Blood Money | Chapter 2 Starter Guide"); here the series is
		// shown on its own, so the suffix goes.
		const name = published.name.replace(/\s*\|[^|]*$/, '').trim();
		const decks = files.map((deck) => {
			const named = {
				...deck,
				id: published.id,
				name,
				description_md: guide
			};
			return withCuratedMeta(named, d.introMd, d.bannerUrl);
		});
		const versions = sorted.map(({ breakpoint }, i) => ({
			breakpoint,
			deck:
				decks.length === 1
					? decks[i]
					: i === 0
						? composeStarterDeck(decks[0], decks[1])
						: withRemovedCards(decks[i], decks[i - 1])
		}));
		return {
			id: d.id,
			slug: d.slug,
			versions,
			primary: versions[0].deck,
			introMd: d.introMd,
			bannerUrl: d.bannerUrl,
			upgradePlan: d.upgradePlan,
			series: result
		};
	});
	return result;
});

/**
 * A pre-built team: hosted starter decks with any changes applied, or tailor-made
 * decks, and a long-form guide in ArkhamDB markdown. Everything else (the Team
 * Builder state and link) derives from the decks.
 */
export interface PrebuiltTeam {
	slug: string;
	name: string;
	/**
	 * Display name of the deck author the team is assembled from.
	 */
	author: string;
	/**
	 * Slug of the contributor the team is listed under.
	 */
	authorSlug: string;
	description: string;
	/**
	 * Ways to browse the team by: which series it comes from, then its mix of
	 * Core Set and Investigator Deck investigators.
	 */
	tags: string[];
	/** Always in investigator card code order. */
	members: PrebuiltTeamMember[];
	/** A team is exclusive when at least one member is not based on a hosted starter deck. */
	exclusive: boolean;
	guideMd: string;
}

export interface PrebuiltTeamMember {
	deck: AhdbDeck;
	/** The hosted starter deck this build derives from, when it has one. */
	source?: PrebuiltTeamSource;
	/** What differs from the source. */
	changes?: DeckChange[];
}

/**
 * A team as listings use it: compiled at build time from the team's decks, with
 * only what searching for it and showing its banner need.
 */
export interface PrebuiltTeamSummary {
	slug: string;
	name: string;
	author: string;
	authorSlug: string;
	description: string;
	tags: string[];
	exclusive: boolean;
	/**
	 * Investigator Decks needed, for filtering by what the reader owns.
	 */
	deckProducts: Product[];
	/**
	 * What each member's cards are made from, parallel to the display's members:
	 * a hosted deck's author/series/slug with any changes, or the cards of a
	 * tailor-made deck. Enough to work out which member plays a card, without the
	 * decks themselves.
	 */
	members: PrebuiltTeamSummaryMember[];
	display: TeamDisplay;
}

export type PrebuiltTeamSummaryMember =
	{ source: string; changes?: DeckChange[] } | { deck: Pick<AhdbDeck, 'slots' | 'sideSlots'> };

/** The non-recursive subset of a starter entry needed for team attribution. */
export interface PrebuiltTeamSource {
	slug: string;
	primary: AhdbDeck;
	series: {
		slug: string;
		name: string;
		iconCard?: Card;
		author: Contributor;
	};
}

export function prebuiltTeamHref(team: PrebuiltTeam): string {
	return `/team/${team.slug}`;
}

export function contributorHref(person: Contributor): string {
	return `/starter/${person.slug}`;
}

export function starterSeriesHref(series: Pick<StarterSeries, 'slug' | 'author'>): string {
	return `/starter/${series.author.slug}/${series.slug}`;
}

/**
 * Author (with avatar) then series (with icon), as shown under a starter
 * deck's name. Without links when the whole banner is already one.
 */
export function starterByline(
	series: Pick<StarterSeries, 'slug' | 'name' | 'iconCard' | 'author'>,
	links = true
): BylineEntry[] {
	return [
		{
			label: series.author.name,
			href: links ? contributorHref(series.author) : undefined,
			iconCard: series.author.avatarCard
		},
		{
			label: series.name,
			href: links ? starterSeriesHref(series) : undefined,
			iconCard: series.iconCard,
			iconShape: 'rounded'
		}
	];
}

export function starterDeckHref(entry: {
	slug: string;
	series: { slug: string; author: { slug: string } };
}): string {
	return `/starter/${entry.series.author.slug}/${entry.series.slug}/${entry.slug}`;
}

/**
 * Every deck across authors and series, ordered by investigator card code
 * (which groups by product, then class) and then by deck id.
 */
export function allStarterDecks(): StarterDeckEntry[] {
	return sortByInvestigator(series.flatMap((s) => s.entries));
}

/**
 * Listing order everywhere: by investigator card code (which groups by
 * product, then class), then by deck id.
 */
export function sortByInvestigator(entries: StarterDeckEntry[]): StarterDeckEntry[] {
	return [...entries].sort(
		(a, b) => a.primary.investigator_code.localeCompare(b.primary.investigator_code) || a.id - b.id
	);
}

export function allContributors(): Contributor[] {
	return contributors;
}

export function contributor(slug: string): Contributor | undefined {
	return contributors.find((person) => person.slug === slug);
}

/**
 * Contributors with at least one starter deck series.
 */
export function starterAuthors(): Contributor[] {
	return contributors.filter((person) => starterSeriesOf(person.slug).length > 0);
}

export function starterSeriesOf(authorSlug: string): StarterSeries[] {
	return series.filter((s) => s.author.slug === authorSlug);
}

export function starterSeries(authorSlug: string, seriesSlug: string): StarterSeries | undefined {
	return series.find((s) => s.author.slug === authorSlug && s.slug === seriesSlug);
}

export function starterDeck(
	authorSlug: string,
	seriesSlug: string,
	deckSlug: string
): StarterDeckEntry | undefined {
	return starterSeries(authorSlug, seriesSlug)?.entries.find((e) => e.slug === deckSlug);
}

const starterDeckRef = /(?:^|\/starter\/)([\w-]+)\/([\w-]+)\/([\w-]+)\/?$/;

/**
 * The hosted deck behind a link to its page, or behind the id of an imported
 * copy (see {@link importedStarterDeck}).
 */
export function starterDeckFromRef(ref: string): StarterDeckEntry | undefined {
	const match = starterDeckRef.exec(ref.trim());
	return match === null ? undefined : starterDeck(match[1], match[2], match[3]);
}

/**
 * A hosted deck as tools import it: its 0 XP build (upgrades in the side
 * deck), with an "author/series/slug" id that leads back to the entry.
 */
export function importedStarterDeck(entry: StarterDeckEntry): { deck: AhdbDeck } {
	const id = `${entry.series.author.slug}/${entry.series.slug}/${entry.slug}`;
	return { deck: { ...entry.primary, id } };
}

export function arkhamdbDecklistUrl(deck: AhdbDeck): string {
	return `https://arkhamdb.com/decklist/view/${deck.id}`;
}
