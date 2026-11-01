import { siteOrigin } from '$lib/const';
import * as m from '$lib/paraglide/messages.js';

import {
	allStarterDecks,
	type Contributor,
	contributorHref,
	type StarterDeckEntry,
	starterAuthors,
	starterDeckHref
} from './index';

/**
 * Plain text of an intro excerpt, for places that can't render markdown. Game
 * icons become their names ("6 or 7 intellect"), and struck-through text stays
 * because authors write it as a joke the following words depend on.
 */
export function introPlainText(introMd: string): string {
	return introMd
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/<span class="icon-([a-z]+)"><\/span>/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/\*+/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function starterDeckDescription(entry: StarterDeckEntry): string {
	return entry.introMd === undefined
		? m.starter_decks_deck_description({
				deck: entry.primary.name,
				author: entry.series.author.name
			})
		: introPlainText(entry.introMd);
}

function personJsonLd(person: Contributor) {
	return {
		'@type': 'Person',
		name: person.name,
		url: `${siteOrigin}${contributorHref(person)}`,
		...(person.profile === undefined ? {} : { description: person.profile }),
		...(person.arkhamdbUrl === undefined ? {} : { sameAs: [person.arkhamdbUrl] })
	};
}

function breadcrumbJsonLd(crumbs: { name: string; href: string }[]) {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: crumbs.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.name,
			item: `${siteOrigin}${crumb.href}`
		}))
	};
}

/**
 * Ties the contributor's name to their profile, so searching for them can
 * surface the page.
 */
export function contributorJsonLd(person: Contributor) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{ '@type': 'ProfilePage', mainEntity: personJsonLd(person) },
			breadcrumbJsonLd([
				{ name: m.starter_decks_title(), href: '/starter' },
				{ name: person.name, href: contributorHref(person) }
			])
		]
	};
}

/**
 * Ties the deck to its author and series, so searching for the author can
 * surface the deck.
 */
export function starterDeckJsonLd(entry: StarterDeckEntry) {
	const { author } = entry.series;
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CreativeWork',
				name: entry.primary.name,
				description: starterDeckDescription(entry),
				url: `${siteOrigin}${starterDeckHref(entry)}`,
				...(entry.bannerUrl === undefined ? {} : { image: entry.bannerUrl }),
				author: personJsonLd(author),
				isPartOf: {
					'@type': 'CreativeWorkSeries',
					name: entry.series.name,
					url: `${siteOrigin}${contributorHref(author)}#${entry.series.slug}`
				},
				about: { '@type': 'Game', name: 'Arkham Horror: The Card Game' }
			},
			breadcrumbJsonLd([
				{ name: m.starter_decks_title(), href: '/starter' },
				{ name: author.name, href: contributorHref(author) },
				{ name: entry.primary.name, href: starterDeckHref(entry) }
			])
		]
	};
}

/**
 * Crawlers can also reach these through /starter/authors, but /starter itself
 * only lists decks after a reader picks investigators.
 */
export function starterSitemapPaths(): string[] {
	return [
		'/starter',
		'/starter/authors',
		...starterAuthors().map(contributorHref),
		...allStarterDecks().map(starterDeckHref)
	];
}
