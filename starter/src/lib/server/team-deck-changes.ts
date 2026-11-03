import {
	type AhdbDeck,
	type Card,
	type CardCode,
	CardType,
	deck as deckUtils,
	linkedAhdbDeckToDeck,
	Product
} from '@5argon/arkham-kohaku';

import { createCardResolver, getAllCards, loadAllTabooLists } from '$lib/card-data';
import type { DeckChange } from '$lib/tool/starter/deck-changes';

/**
 * Where a guide wants its table of what was replaced.
 */
export const OVERLAP_TABLE_MARKER = '{{overlap-table}}';

export interface OverlapTableMember {
	source: AhdbDeck;
	changes: readonly DeckChange[];
}

const icon = (cardClass: string) => `<span class="icon-${cardClass}"></span>`;
const classOf = (card: Card): string => card.cardClass?.class1 ?? 'neutral';

function printingLabel(card: Card): string {
	const owner =
		card.product === Product.CoreSet2026
			? 'Core Set 2026'
			: getAllCards().find(
					(c) => c.product === card.product && c.cardType === CardType.Investigator
				)?.name;
	return `<span class="small">(${owner} #${card.position})</span>`;
}

function plainName(card: Card): string {
	const cardClass = classOf(card);
	return cardClass === 'neutral'
		? card.name
		: `${icon(cardClass)} <span class="fg-${cardClass}">${card.name}</span>`;
}

function strongName(card: Card): string {
	const cardClass = classOf(card);
	const name =
		cardClass === 'neutral'
			? `<strong>${card.name}</strong>`
			: `${icon(cardClass)} <strong><span class="fg-${cardClass}">${card.name}</span></strong>`;
	return `${name} ${printingLabel(card)}`;
}

function row(investigator: Card, from: Card, to: Card | null): string {
	return `  <tr>
    <td>•</td>
    <td><strong><span class="fg-${classOf(investigator)}">${investigator.name}</span></strong></td>
    <td>${plainName(from)}</td>
    <td>${to === null ? '' : '→'}</td>
    <td>${to === null ? '(No Change)' : strongName(to)}</td>
  </tr>`;
}

/**
 * Every copy of the cards the source decks overlap on or the changes replace,
 * and what each became. Empty when there is nothing to show.
 */
export function overlapTable(members: readonly OverlapTableMember[]): string {
	const resolver = createCardResolver();
	const tabooLists = loadAllTabooLists();
	const decks = members.map(({ source }) =>
		linkedAhdbDeckToDeck({ deck: source }, resolver, tabooLists)
	);
	const investigators = members.map(({ source }) => resolver.resolve(source.investigator_code));
	const mainChanges = members.map(({ changes }) => changes.filter((change) => !change.side));

	const codes = new Set(deckUtils.findDeckOverlaps(decks).map((overlap) => overlap.cardCode));
	for (const changes of mainChanges) {
		for (const { remove } of changes) if (remove !== undefined) codes.add(remove);
	}
	const blocks = [...codes]
		.map((code) => resolver.resolve(code))
		.sort(
			(a, b) =>
				Number(classOf(a) !== 'neutral') - Number(classOf(b) !== 'neutral') ||
				a.code.localeCompare(b.code)
		)
		.map((card) => {
			const replaced: string[] = [];
			const kept: string[] = [];
			members.forEach(({ source }, i) => {
				let left = source.slots?.[card.code] ?? 0;
				for (const change of mainChanges[i]) {
					if (change.remove !== card.code) continue;
					left -= change.copies;
					const to = change.add === undefined ? null : resolver.resolve(change.add);
					for (let copy = 0; copy < change.copies; copy++) {
						replaced.push(row(investigators[i], card, to));
					}
				}
				for (let copy = 0; copy < left; copy++) kept.push(row(investigators[i], card, null));
			});
			const used = members.reduce((sum, { source }) => sum + (source.slots?.[card.code] ?? 0), 0);
			return `<thead>
  <tr>
    <th colspan="3">${plainName(card)} ${printingLabel(card)}</th>
    <th colspan="2">Used ${used} / ${card.quantity} Available</th>
  </tr></thead>
<tbody>
${[...replaced, ...kept].join('\n')}
</tbody>`;
		});
	return blocks.length === 0 ? '' : `<table>${blocks.join('\n')}\n</table>`;
}
