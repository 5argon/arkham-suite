import { CardResolver, deck as deckUtils, linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards, loadAllTabooLists } from '../../card-data';
import { starterDeck } from '../../starter-content';
import {
	allResolved,
	applyResolutions,
	buildOverlapGroups,
	groupResolved,
	overlapsToHtml,
	overlapsToText,
	replacementCandidates
} from './resolve-overlaps';

const allCards = getAllCards();
const resolver = new CardResolver(allCards, null);
const labels = {
	overlaps: 'Overlaps',
	usedAvailable: (u: number, a: number) => `Used ${u} / ${a} Available`,
	noChange: '(No Change)'
};

function combo() {
	const entries = [
		starterDeck('hungry-colquhoun', 'ch2-core-only', 'trish-scarborough-i-spy-a-seeker')!,
		starterDeck('hungry-colquhoun', 'ch2-core-only', 'dexter-drake-the-prestige')!
	];
	const decks = entries.map((e) =>
		linkedAhdbDeckToDeck({ deck: e.primary }, resolver, loadAllTabooLists())
	);
	return { entries, decks, overlaps: deckUtils.findDeckOverlaps(decks) };
}

describe('resolve overlaps', () => {
	it('expands overlaps into one row per copy and tracks resolution', () => {
		const c = combo();
		const groups = buildOverlapGroups(c);
		expect(groups.length).toBeGreaterThan(0);
		const group = groups[0];
		expect(group.rows.length).toBe(group.total);
		expect(groupResolved(group)).toBe(false);
		const needed = group.total - group.available;
		const candidates = replacementCandidates(group.rows[0].investigator, allCards);
		const replacement = candidates.find((card) => card.code !== group.card.code)!;
		for (let i = 0; i < needed; i++) group.rows[i].replacement = replacement;
		expect(groupResolved(group)).toBe(true);
		expect(allResolved(groups)).toBe(groups.every(groupResolved));
	});

	it('applies replacements to the deck JSON in the same zone', () => {
		const c = combo();
		const groups = buildOverlapGroups(c);
		const group = groups[0];
		const row = group.rows[0];
		const replacement = replacementCandidates(row.investigator, allCards).find(
			(card) => card.code !== group.card.code && card.code !== '01000'
		)!;
		row.replacement = replacement;
		const before = c.entries.map((e) => e.primary);
		const after = applyResolutions(before, groups);
		const deck = after.find((d) => String(d.id) === String(row.deckId))!;
		const original = before.find((d) => String(d.id) === String(row.deckId))!;
		const slots = deck.slots!;
		const originalSlots = original.slots!;
		expect(slots[group.card.code] ?? 0).toBe((originalSlots[group.card.code] ?? 0) - 1);
		expect(slots[replacement.code]).toBe((originalSlots[replacement.code] ?? 0) + 1);
		expect(originalSlots[group.card.code]).toBeDefined();
	});

	it('exports ArkhamDB HTML and plain text', () => {
		const c = combo();
		const groups = buildOverlapGroups(c);
		const html = overlapsToHtml(groups, () => 'Core Set (2026)', labels);
		expect(html.startsWith('<table><thead>')).toBe(true);
		expect(html).toContain('<th colspan="5">Overlaps</th>');
		expect(html).toContain('(No Change)');
		expect(html.endsWith('</table>')).toBe(true);
		const text = overlapsToText(groups, () => 'Core Set (2026)', labels);
		expect(text.startsWith('**Overlaps**')).toBe(true);
		expect(text).toContain('- ');
	});
});
