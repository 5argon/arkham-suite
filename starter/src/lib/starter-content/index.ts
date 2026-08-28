import { type AhdbDeck, type Card, Product } from '@5argon/arkham-kohaku';

import { getAllCards } from '../card-data';

/**
 * Hand-curated starter deck library: one folder per author, one folder per
 * series inside it, and verbatim copies of each deck JSON under decks/. The
 * copies exist so the decks stay available even if the original listing goes
 * offline; pages always point readers back to the original.
 */
export interface StarterAuthor {
	slug: string;
	name: string;
	arkhamdbUserId?: number;
	arkhamdbUrl?: string;
}

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
	 * Upgrade Planner share string (its ?i= parameter).
	 */
	upgradePlan?: string;
	series: StarterSeries;
}

export interface StarterSeries {
	slug: string;
	name: string;
	description: string;
	author: StarterAuthor;
	/**
	 * In the series' intended order.
	 */
	entries: StarterDeckEntry[];
}

interface SeriesJson {
	slug: string;
	name: string;
	description: string;
	decks: {
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
		 * Files under decks/, ascending by breakpoint.
		 */
		versions: { breakpoint: number; file: string }[];
		upgradePlan?: string;
	}[];
}

const authorFiles = import.meta.glob<StarterAuthor>('./starter/*/author.json', {
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
		sideSlots[code] = Math.max(sideSlots[code] ?? 0, quantity);
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
 * The archived JSON stays verbatim; the excerpt is merged into a copy's meta.
 */
function withIntro(deck: AhdbDeck, introMd: string): AhdbDeck {
	let meta: Record<string, unknown> = {};
	try {
		meta = JSON.parse(deck.meta || '{}');
	} catch {
		meta = {};
	}
	return { ...deck, meta: JSON.stringify({ ...meta, intro_md: introMd }) };
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

const authors: StarterAuthor[] = Object.values(authorFiles);
const series: StarterSeries[] = Object.entries(seriesFiles).map(([path, json]) => {
	const authorSlug = path.replace(/^\.\/starter\//, '').split('/')[0];
	const author = authors.find((a) => a.slug === authorSlug);
	if (author === undefined) throw new Error(`Starter series without author: ${path}`);
	const dir = path.replace(/series\.json$/, 'decks/');
	const result: StarterSeries = {
		slug: json.slug,
		name: json.name,
		description: json.description,
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
		// The published (highest) version names, describes, and identifies the
		// deck; the lower builds are often saved elsewhere under working titles
		// like "(0XP)", and readers should be sent to the published listing.
		const published = files[files.length - 1];
		// ArkhamDB has no notion of series, so authors append it to the deck
		// name ("Blood Money | Chapter 2 Starter Guide"); here the series is
		// shown on its own, so the suffix goes.
		const name = published.name.replace(/\s*\|[^|]*$/, '').trim();
		const decks = files.map((deck) => {
			const named = {
				...deck,
				id: published.id,
				name,
				description_md: published.description_md
			};
			return d.introMd === undefined ? named : withIntro(named, d.introMd);
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
			upgradePlan: d.upgradePlan,
			series: result
		};
	});
	return result;
});

/**
 * A pre-built team: standalone deck JSON (already overlap-resolved, the
 * single source of truth), the starter decks it was assembled from, and a
 * long-form guide in ArkhamDB markdown. Everything else (the Team Builder
 * state and link) derives from the deck JSON.
 */
export interface PrebuiltTeam {
	slug: string;
	name: string;
	/**
	 * Display name of the deck author the team is assembled from.
	 */
	author: string;
	/**
	 * Starter deck author slug the team is listed under.
	 */
	authorSlug: string;
	description: string;
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
}

/** The non-recursive subset of a starter entry needed for team attribution. */
export interface PrebuiltTeamSource {
	slug: string;
	primary: AhdbDeck;
	series: {
		slug: string;
		name: string;
		author: StarterAuthor;
	};
}

interface TeamSourceJson {
	author: string;
	series: string;
	slug: string;
}

interface TeamJson {
	slug: string;
	name: string;
	author: string;
	authorSlug: string;
	description: string;
	/**
	 * Files under decks/, explicitly paired with their optional hosted source.
	 * Omitting source makes the team Exclusive.
	 */
	decks: { file: string; source?: TeamSourceJson }[];
}

const teamFiles = import.meta.glob<TeamJson>('./team/*/team.json', {
	eager: true,
	import: 'default'
});
const teamDeckFiles = import.meta.glob<AhdbDeck>('./team/*/decks/*.json', {
	eager: true,
	import: 'default'
});
const teamGuideFiles = import.meta.glob<string>('./team/*/guide.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const teams: PrebuiltTeam[] = Object.entries(teamFiles).map(([path, json]) => {
	const dir = path.replace(/team\.json$/, '');
	const members = json.decks
		.map(({ file, source: sourceJson }) => {
			const rawDeck = teamDeckFiles[`${dir}decks/${file}`];
			if (rawDeck === undefined) {
				throw new Error(`Pre-built team deck missing: ${dir}decks/${file}`);
			}
			const deck = normalizeDeck(rawDeck);
			const sourceEntry =
				sourceJson === undefined
					? undefined
					: starterDeck(sourceJson.author, sourceJson.series, sourceJson.slug);
			if (sourceJson !== undefined && sourceEntry === undefined) {
				throw new Error(
					`Pre-built team source missing: ${sourceJson.author}/${sourceJson.series}/${sourceJson.slug}`
				);
			}
			if (
				sourceEntry !== undefined &&
				sourceEntry.primary.investigator_code !== deck.investigator_code
			) {
				throw new Error(
					`Pre-built team source investigator mismatch: ${dir}decks/${file} -> ${sourceEntry.series.author.slug}/${sourceEntry.series.slug}/${sourceEntry.slug}`
				);
			}
			const source: PrebuiltTeamSource | undefined =
				sourceEntry === undefined
					? undefined
					: {
							slug: sourceEntry.slug,
							primary: sourceEntry.primary,
							series: {
								slug: sourceEntry.series.slug,
								name: sourceEntry.series.name,
								author: sourceEntry.series.author
							}
						};
			return { deck, source };
		})
		.sort((a, b) => a.deck.investigator_code.localeCompare(b.deck.investigator_code));
	return {
		slug: json.slug,
		name: json.name,
		author: json.author,
		authorSlug: json.authorSlug,
		description: json.description,
		members,
		exclusive: members.some((member) => member.source === undefined),
		guideMd: teamGuideFiles[`${dir}guide.md`] ?? ''
	};
});

export function allPrebuiltTeams(): PrebuiltTeam[] {
	return teams;
}

export function prebuiltTeamsOf(authorSlug: string): PrebuiltTeam[] {
	return teams.filter((t) => t.authorSlug === authorSlug);
}

export function prebuiltTeam(slug: string): PrebuiltTeam | undefined {
	return teams.find((t) => t.slug === slug);
}

export function prebuiltTeamHref(team: PrebuiltTeam): string {
	return `/team/${team.slug}`;
}

export function starterAuthorHref(author: StarterAuthor): string {
	return `/starter/${author.slug}`;
}

export function starterSeriesHref(series: StarterSeries): string {
	return `/starter/${series.author.slug}/${series.slug}`;
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

export function allStarterAuthors(): StarterAuthor[] {
	return authors;
}

export function starterAuthor(slug: string): StarterAuthor | undefined {
	return authors.find((a) => a.slug === slug);
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

export function arkhamdbDecklistUrl(deck: AhdbDeck): string {
	return `https://arkhamdb.com/decklist/view/${deck.id}`;
}
