import {
	type AhdbDeck,
	type Card,
	CardClass,
	card as cardUtils,
	type Deck,
	deck as deckUtils,
	Product,
	productInvestigatorDeck
} from '@5argon/arkham-kohaku';

/**
 * One copy of an overlapping card in one deck, and the card chosen to take
 * its place (null = keep it).
 */
export interface OverlapRow {
	key: string;
	deckId: string | number;
	investigator: Card;
	card: Card;
	replacement: Card | null;
}

export interface OverlapGroup {
	card: Card;
	/**
	 * Copies the team wants versus copies the pool holds.
	 */
	total: number;
	available: number;
	rows: OverlapRow[];
}

/**
 * Expands a combination's overlaps into one row per copy, so each copy can
 * get its own replacement.
 */
export function buildOverlapGroups(combo: {
	decks: Deck[];
	overlaps: deckUtils.DeckOverlapInfo[];
}): OverlapGroup[] {
	return combo.overlaps.map((overlap) => {
		const rows: OverlapRow[] = [];
		for (const [deckId, quantity] of overlap.deckQuantities) {
			const deck = combo.decks.find((d) => String(d.id) === String(deckId));
			if (deck === undefined) continue;
			for (let i = 0; i < quantity; i++) {
				rows.push({
					key: `${overlap.cardCode}|${deckId}|${i}`,
					deckId,
					investigator: deck.investigator,
					card: overlap.card,
					replacement: null
				});
			}
		}
		return { card: overlap.card, total: overlap.totalQuantity, available: overlap.cardLimit, rows };
	});
}

/**
 * Copies still claimed after the chosen replacements.
 */
export function keptCopies(group: OverlapGroup): number {
	return group.rows.filter((row) => row.replacement === null).length;
}

export function groupResolved(group: OverlapGroup): boolean {
	return keptCopies(group) <= group.available;
}

export function allResolved(groups: OverlapGroup[]): boolean {
	return groups.length > 0 && groups.every(groupResolved);
}

/**
 * Cards an investigator may pick as a replacement: any player card they can
 * legally put in a deck.
 */
export function replacementCandidates(investigator: Card, allCards: Card[]): Card[] {
	// Evergreen printings (Core Set 2026 and its Investigator Decks) come
	// first, so the suggested copy is the one a starter player owns.
	const evergreen = new Set<Product>([Product.CoreSet2026, ...productInvestigatorDeck]);
	return allCards
		.filter(
			(card) =>
				cardUtils.deckbuildingPlayerCardsFilter(card) && cardUtils.canUse(investigator, {}, card)
		)
		.sort((a, b) => Number(evergreen.has(b.product)) - Number(evergreen.has(a.product)));
}

/**
 * Applies the chosen replacements to ArkhamDB-shaped decks: each replaced
 * copy leaves the zone it was in (main deck first, then side deck) and the
 * replacement enters that same zone.
 */
export function applyResolutions(decks: AhdbDeck[], groups: OverlapGroup[]): AhdbDeck[] {
	const result = decks.map((deck) => ({
		...deck,
		slots: { ...(deck.slots ?? {}) },
		sideSlots: { ...(deck.sideSlots ?? {}) }
	}));
	for (const group of groups) {
		for (const row of group.rows) {
			if (row.replacement === null) continue;
			const deck = result.find((d) => String(d.id) === String(row.deckId));
			if (deck === undefined) continue;
			const zone = (deck.slots[row.card.code] ?? 0) > 0 ? deck.slots : deck.sideSlots;
			const left = (zone[row.card.code] ?? 0) - 1;
			if (left > 0) zone[row.card.code] = left;
			else delete zone[row.card.code];
			zone[row.replacement.code] = (zone[row.replacement.code] ?? 0) + 1;
		}
	}
	return result;
}

function classOf(card: Card): CardClass {
	return card.cardClass?.class1 ?? CardClass.Neutral;
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * ArkhamDB deck-description markup for a card: class icon + colored name.
 */
function htmlCard(card: Card, strong = false): string {
	const cls = classOf(card);
	const name = escapeHtml(card.name);
	const colored = cls === CardClass.Neutral ? name : `<span class="fg-${cls}">${name}</span>`;
	const body = strong ? `<strong>${colored}</strong>` : colored;
	return cls === CardClass.Neutral ? body : `<span class="icon-${cls}"></span> ${body}`;
}

function printing(card: Card, productName: (card: Card) => string): string {
	return `(${productName(card)} #${card.position})`;
}

/**
 * The overlaps and their resolutions as a table for an ArkhamDB deck
 * description.
 */
export function overlapsToHtml(
	groups: OverlapGroup[],
	productName: (card: Card) => string,
	labels: {
		overlaps: string;
		usedAvailable: (used: number, available: number) => string;
		noChange: string;
	}
): string {
	const lines: string[] = [
		'<table><thead>',
		`<tr><th colspan="5">${escapeHtml(labels.overlaps)}</th></tr>`
	];
	for (const group of groups) {
		lines.push('  <tr>');
		lines.push(
			`    <th colspan="3">${htmlCard(group.card)} <span class="small">${escapeHtml(printing(group.card, productName))}</span></th>`
		);
		lines.push(
			`    <th colspan="2">${escapeHtml(labels.usedAvailable(group.total, group.available))}</th>`
		);
		lines.push('  </tr></thead>', '<tbody>');
		for (const row of group.rows) {
			const investigator = `<strong>${htmlCard(row.investigator).replace(/^<span class="icon-[a-z]+"><\/span> /, '')}</strong>`;
			const change =
				row.replacement === null
					? `    <td></td>\n    <td>${escapeHtml(labels.noChange)}</td>`
					: `    <td>→</td>\n    <td>${htmlCard(row.replacement, true)} <span class="small">${escapeHtml(printing(row.replacement, productName))}</span></td>`;
			lines.push(
				'  <tr>',
				'    <td>•</td>',
				`    <td>${investigator}</td>`,
				`    <td>${htmlCard(row.card)}</td>`,
				change,
				'  </tr>'
			);
		}
		lines.push('</tbody>');
		lines.push('<thead>');
	}
	// Drop the dangling thead opener after the last group.
	lines.pop();
	lines.push('</table>');
	return lines.join('\n');
}

/**
 * The same as markdown-friendly plain text.
 */
export function overlapsToText(
	groups: OverlapGroup[],
	productName: (card: Card) => string,
	labels: {
		overlaps: string;
		usedAvailable: (used: number, available: number) => string;
		noChange: string;
	}
): string {
	const lines: string[] = [`**${labels.overlaps}**`, ''];
	for (const group of groups) {
		lines.push(
			`**${group.card.name}** ${printing(group.card, productName)} — ${labels.usedAvailable(group.total, group.available)}`
		);
		for (const row of group.rows) {
			lines.push(
				row.replacement === null
					? `- ${row.investigator.name}: ${row.card.name} ${labels.noChange}`
					: `- ${row.investigator.name}: ${row.card.name} → **${row.replacement.name}** ${printing(row.replacement, productName)}`
			);
		}
		lines.push('');
	}
	return lines.join('\n').trimEnd() + '\n';
}
