import { Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import {
	chapterOneCardCodes,
	chapterOneCardPage,
	chapterOneProblems,
	chapterOneProductCards,
	chapterOneReviewProducts
} from './chapter-one-reviews';
import { reviewerSummaries, reviewsBy, reviewSitemapPaths } from './reviews';

describe('Chapter 1 reviews', () => {
	it('has nothing wrong with it', () => {
		expect(chapterOneProblems()).toEqual([]);
	});

	it('puts a review of a whole product on each of its cards', () => {
		const cards = chapterOneProductCards(Product.TheScarletKeysInvestigatorExpansion);
		expect(cards.length).toBeGreaterThan(100);
		for (const { card, counts } of cards) {
			const titles = chapterOneCardPage(card.code)?.entries.map((entry) => entry.title);
			expect(titles, card.name).toContain('Investigator Expansion Review: Scarlet Keys');
			expect(counts.written).toBe(0);
		}
	});

	it('puts a review of one class on the cards of that class only', () => {
		const titlesOf = (code: string) =>
			chapterOneCardPage(code)?.entries.map((entry) => entry.title) ?? [];
		const guardian = 'I check out ALL the GUARDIAN Player Cards from THE FEAST OF HEMLOCK VALE';
		expect(titlesOf('10015').some((title) => title?.startsWith(guardian))).toBe(false);
		const tally = chapterOneProductCards(Product.TheFeastOfHemlockValeInvestigatorExpansion).filter(
			({ card }) => titlesOf(card.code).some((title) => title?.startsWith(guardian))
		);
		expect(tally.length).toBeGreaterThan(10);
		for (const { card } of tally) {
			expect(Object.values(card.cardClass ?? {}), card.name).toContain('guardian');
		}
	});

	it('shows no time point, since these came before there were any', () => {
		for (const code of chapterOneCardCodes()) {
			for (const entry of chapterOneCardPage(code)?.entries ?? []) {
				expect(entry.environment).toBeUndefined();
			}
		}
	});

	it('stays hidden: not on profiles, not on the reviewers list, not in the sitemap', () => {
		for (const { slug } of reviewerSummaries()) {
			for (const { entry } of reviewsBy(slug)) {
				expect(entry.title, slug).not.toBe('Investigator Expansion Review: Scarlet Keys');
			}
		}
		expect(reviewSitemapPaths().some((path) => path.includes('chapter-one'))).toBe(false);
		expect(chapterOneReviewProducts()).toContain(Product.TheScarletKeysInvestigatorExpansion);
	});
});
