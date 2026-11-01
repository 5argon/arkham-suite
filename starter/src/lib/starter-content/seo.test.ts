import type { AhdbDeck } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import {
	allContributors,
	allStarterDecks,
	publishedVersion,
	starterAuthors,
	starterSeriesOf
} from './index';
import {
	introPlainText,
	contributorJsonLd,
	starterDeckDescription,
	starterDeckJsonLd,
	starterSitemapPaths
} from './seo';

describe('introPlainText', () => {
	it('keeps card link text and names game icons', () => {
		expect(
			introPlainText(
				'Here [Joe](/card/12004) investigates at an effective 7 <span class="icon-intellect"></span>.'
			)
		).toBe('Here Joe investigates at an effective 7 intellect.');
	});

	it('drops formatting but keeps struck-through words', () => {
		expect(
			introPlainText(
				'*Then* a <s><strong style="color:rgb(239, 163, 69);">Seeker</strong></s>... <strong><ins>Rogue</ins></strong>! '
			)
		).toBe('Then a Seeker... Rogue!');
	});
});

describe('starter deck meta', () => {
	it('leaves no markup in any deck description', () => {
		for (const entry of allStarterDecks()) {
			expect(starterDeckDescription(entry), entry.slug).not.toMatch(/[<>*]|\]\(/);
		}
	});

	it('shows no guide image from a retired host', () => {
		for (const entry of allStarterDecks()) {
			for (const version of entry.versions) {
				expect(version.deck.description_md, entry.slug).not.toContain(
					'images-cdn.fantasyflightgames'
				);
			}
		}
	});

	it('finds the published version at any breakpoint', () => {
		const lv0 = { id: 1 } as AhdbDeck;
		const lv5 = { id: 'unlisted' } as AhdbDeck;
		expect(publishedVersion([lv0, lv5], 1, 'test')).toBe(lv0);
		expect(() => publishedVersion([lv0, lv5], 2, 'test')).toThrow('not published');
	});

	it('takes every banner from the deck guide', () => {
		for (const entry of allStarterDecks()) {
			if (entry.bannerUrl === undefined) continue;
			expect(entry.primary.description_md, entry.slug).toContain(entry.bannerUrl);
			expect(JSON.parse(entry.primary.meta ?? '{}').banner_url, entry.slug).toBe(entry.bannerUrl);
		}
	});

	it('credits the author in structured data', () => {
		const entry = allStarterDecks()[0];
		const [work] = starterDeckJsonLd(entry)['@graph'];
		expect(work).toMatchObject({ author: { name: entry.series.author.name } });
	});

	it('links an author profile to their ArkhamDB page', () => {
		const author = allContributors().find((a) => a.arkhamdbUrl !== undefined);
		expect(author).toBeDefined();
		const [profile] = contributorJsonLd(author!)['@graph'];
		expect(profile).toMatchObject({ mainEntity: { sameAs: [author!.arkhamdbUrl] } });
	});

	it('counts only contributors with a series as starter authors', () => {
		for (const person of allContributors()) {
			expect(starterAuthors().includes(person), person.slug).toBe(
				starterSeriesOf(person.slug).length > 0
			);
		}
	});

	it('lists every author and deck in the sitemap once', () => {
		const paths = starterSitemapPaths();
		expect(new Set(paths).size).toBe(paths.length);
		expect(paths).toHaveLength(1 + starterAuthors().length + allStarterDecks().length);
	});
});
