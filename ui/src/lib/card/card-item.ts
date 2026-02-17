import { PluralResolver } from '../mf2/compile.js';
import {
	type Card,
	sorter,
	type SortingType,
	Product,
	CardClass,
	groupByType,
	type GroupingType,
	GroupingKey,
	type CardItemWrapper,
	type DecodedMeta,
	type CardResolver,
	card as cardUtil
} from '@5argon/arkham-kohaku';
import * as m from '../paraglide/messages.js';
import { m as asm, u } from '@5argon/arkham-string';
import type { CardLabelProp } from './CardLabel.svelte';

/**
 * What UI allow you to select.
 * Re-export from Kohaku for UI convenience.
 */
export type Grouping = GroupingType;

/**
 * Settings for grouping and sorting cards.
 */
export interface GroupingSortingSettings {
	grouping: Grouping[];
	sortingOrder: SortingType[];
}

/**
 * Compare two GroupingSortingSettings for equality.
 */
export function areGroupingSortingSettingsEqual(
	a: GroupingSortingSettings,
	b: GroupingSortingSettings
): boolean {
	if (a.grouping.length !== b.grouping.length) return false;
	if (!a.grouping.every((g, i) => g === b.grouping[i])) return false;
	if (a.sortingOrder.length !== b.sortingOrder.length) return false;
	return a.sortingOrder.every((sort, i) => sort === b.sortingOrder[i]);
}

/**
 * Apply grouping and sorting settings to card items.
 */
export function applyGroupingSorting(
	cards: CardItem[],
	settings: GroupingSortingSettings
): RecursivelyGroupedCardItem[] {
	if (settings.grouping.length === 0) {
		// No grouping, just one group with empty name
		return [
			{
				name: '',
				items: sortCardItems(cards, settings.sortingOrder)
			}
		];
	}

	const grouped = recursivelyGroupCardItems(cards, settings.grouping);
	return grouped.map((group) => sortRecursivelyGroupedCards(group, settings.sortingOrder));
}

/**
 * Convert a GroupingKey from Kohaku to a localized label string.
 * For dynamic grouping, also pass the dynamicValue to determine the label.
 */
function groupingKeyToLabel(key: GroupingKey, dynamicValue?: Product | CardClass): string {
	switch (key) {
		// Default grouping
		case GroupingKey.Asset:
			return m.card_type_asset();
		case GroupingKey.Event:
			return m.card_type_event();
		case GroupingKey.Skill:
			return m.card_type_skill();
		case GroupingKey.PermanentWeakness:
			return m.card_permanent_asset_weakness();

		// Slot grouping
		case GroupingKey.SlotAlly:
			return asm.playerSlotRequirementAllySlot();
		case GroupingKey.SlotAccessory:
			return asm.playerSlotRequirementAccessorySlot();
		case GroupingKey.SlotArcane:
			return asm.playerSlotRequirement1ArcaneSlot();
		case GroupingKey.SlotArcaneX2:
			return asm.playerSlotRequirement2ArcaneSlots();
		case GroupingKey.SlotBody:
			return asm.playerSlotRequirementBodySlot();
		case GroupingKey.SlotHand:
			return asm.playerSlotRequirement1HandSlot();
		case GroupingKey.SlotHandX2:
			return asm.playerSlotRequirement2HandSlots();
		case GroupingKey.SlotTarot:
			return asm.playerSlotRequirementTarotSlot();
		case GroupingKey.SlotNone:
			return 'No Slot';
		case GroupingKey.SlotMultiple:
			return 'Multiple Slots';

		// Cost grouping
		case GroupingKey.Cost0:
			return m.card_cost_x({ cost: '0' });
		case GroupingKey.Cost1:
			return m.card_cost_x({ cost: '1' });
		case GroupingKey.Cost2:
			return m.card_cost_x({ cost: '2' });
		case GroupingKey.Cost3:
			return m.card_cost_x({ cost: '3' });
		case GroupingKey.Cost4:
			return m.card_cost_x({ cost: '4' });
		case GroupingKey.Cost5:
			return m.card_cost_x({ cost: '5' });
		case GroupingKey.Cost6Plus:
			return m.card_cost_x({ cost: '6+' });
		case GroupingKey.CostX:
			return m.card_cost_x({ cost: 'X' });
		case GroupingKey.CostNone:
			return m.card_no_cost();

		// Level grouping
		case GroupingKey.LevelNone:
			return m.form_group_label_no_level();
		case GroupingKey.Level0:
			return m.form_group_label_level_0();
		case GroupingKey.Level1:
			return m.form_group_label_level_1();
		case GroupingKey.Level2:
			return m.form_group_label_level_2();
		case GroupingKey.Level3:
			return m.form_group_label_level_3();
		case GroupingKey.Level4:
			return m.form_group_label_level_4();
		case GroupingKey.Level5:
			return m.form_group_label_level_5();
		case GroupingKey.Level1To5:
			return m.form_group_label_level_1_to_5();

		// Commit power grouping
		case GroupingKey.CommitPower0:
			return m.form_group_label_0_icons();
		case GroupingKey.CommitPower1:
			return m.form_group_label_1_icon();
		case GroupingKey.CommitPower2:
			return m.form_group_label_2_icons();
		case GroupingKey.CommitPower3:
			return m.form_group_label_3_icons();
		case GroupingKey.CommitPower4Plus:
			return m.form_group_label_4_plus_icons();

		// Dynamic grouping - requires dynamicValue
		case GroupingKey.Set:
			if (dynamicValue && typeof dynamicValue === 'string') {
				return u.productName(dynamicValue as Product);
			}
			return 'Unknown Set';
		case GroupingKey.Class:
			if (dynamicValue && typeof dynamicValue === 'string') {
				return u.cardClass(dynamicValue as CardClass);
			}
			return 'Unknown Class';

		default:
			return 'Unknown';
	}
}

export const cardCountResolver = new PluralResolver((count) => {
	return {
		zero: m.basic_no_card(),
		one: m.basic_card_count_singular({ cardCount: count }),
		other: m.basic_card_count_plural({ cardCount: count })
	};
});

/**
 * Unit of card in the UI.
 */
export interface CardItem {
	card: Card;
	quantity: number;

	/**
	 * Attach a customizable ID to differentiate
	 * 2 items of the same card and same quantity.
	 *
	 * Allows the item to animate to different place even if
	 * they are actually new DOM element.
	 */
	id?: string;

	/**
	 * How many of this card should be displayed as greyed out (not selected/available).
	 * - For components showing separated copies (e.g., CardScanFullSmall): Grey out individual copies
	 * - For components showing quantity as text (e.g., CardLine): Only grey out when greyedOutQuantity >= quantity
	 */
	greyedOutQuantity?: number;

	/**
	 * Optional color for the quantity number, using CardClass colors.
	 */
	quantityColor?: CardClass;

	/**
	 * Owner card (typically an investigator card) associated with this card.
	 */
	owner?: Card;

	/**
	 * Labels to display as colored tags alongside the card.
	 */
	labels?: CardLabelProp[];
	
	/**
	 * Metadata for displaying deckbuilding choices (faction/option selection).
	 * When present, DeckbuildingChoiceDisplay component can be used to render these choices.
	 */
	metaDisplay?: DecodedMeta;
}

/**
 * Generate a unique key for a CardItem to be used in Svelte {#each} blocks.
 * This key accounts for card code, quantity, greyed-out state, custom ID, and metadata display.
 *
 * @param item - The CardItem to generate a key for
 * @param includeQuantity - Whether to include quantity in the key (useful for scan display where multiple copies are shown)
 * @returns A unique string key
 */
export function getCardItemKey(item: CardItem, includeQuantity: boolean = false): string {
	const parts: string[] = [];

	// Use custom ID if provided, otherwise use card code
	parts.push(item.id || item.card.code);

	// Include quantity if requested
	if (includeQuantity) {
		parts.push(item.quantity.toString());
	}

	// Include greyed-out state
	const isGreyed = item.greyedOutQuantity !== undefined && item.greyedOutQuantity >= item.quantity;
	parts.push(isGreyed ? 'greyed' : 'normal');

	// Include metaDisplay properties to differentiate same card with different metadata
	if (item.metaDisplay) {
		if (item.metaDisplay.faction1) {
			parts.push(`f1-${item.metaDisplay.faction1}`);
		}
		if (item.metaDisplay.faction2) {
			parts.push(`f2-${item.metaDisplay.faction2}`);
		}
		if (item.metaDisplay.factionSelected) {
			parts.push(`fs-${item.metaDisplay.factionSelected}`);
		}
		if (item.metaDisplay.optionSelected) {
			parts.push(`opt-${item.metaDisplay.optionSelected}`);
		}
	}

	return parts.join('-');
}

export interface RecursivelyGroupedCardItem {
	name: string;
	items: RecursivelyGroupedCardItem[] | CardItem[];
	preferSide?: 'left' | 'right';
	/**
	 * If this group represents a Product (Set grouping), this contains the Product enum value
	 * so that a ProductIcon can be rendered.
	 */
	product?: Product;
}

export function noMoreGroup(items: RecursivelyGroupedCardItem | CardItem): items is CardItem {
	return 'card' in items;
}

export function isRecursivelyGroupedCardItemArray(
	items: RecursivelyGroupedCardItem[] | CardItem[]
): items is RecursivelyGroupedCardItem[] {
	if (items.length === 0) return true;
	return 'name' in items[0] && 'items' in items[0];
}

export interface GroupedCardItem {
	name: string;
	items: CardItem[];
	preferSide?: 'left' | 'right';
	/**
	 * If this group represents a Product (Set grouping), this contains the Product enum value
	 * so that a ProductIcon can be rendered.
	 */
	product?: Product;
}

export function countCards(cards: CardItem[] | undefined): number {
	return cards?.reduce((acc, item) => acc + (item.quantity ?? 1), 0) ?? 0;
}

export function countRecursivelyGroupedCards(
	groupedCards: RecursivelyGroupedCardItem | CardItem
): number {
	if (noMoreGroup(groupedCards)) {
		return groupedCards.quantity;
	}
	return groupedCards.items.reduce((acc, item) => {
		return acc + countRecursivelyGroupedCards(item);
	}, 0);
}

export function sortCardItems(cardItems: CardItem[], sortingOrder: SortingType[]): CardItem[] {
	const clone = [...cardItems];
	clone.sort((a, b) => {
		for (const order of sortingOrder) {
			// Sort in order, only use the next order if the previous one is equal.
			const result = sorter(order, a.card, b.card);
			if (result !== 0) {
				return result;
			}
		}
		return 0;
	});
	return clone;
}

export function recursivelyGroupCardItems(
	cardItems: CardItem[],
	groupings: Grouping[]
): RecursivelyGroupedCardItem[] {
	if (groupings.length === 0) {
		return [
			{
				name: '',
				items: cardItems
			}
		];
	}
	const [currentGrouping, ...remainingGroupings] = groupings;
	const groupedItems = groupCardItems(cardItems, currentGrouping);
	return groupedItems.map<RecursivelyGroupedCardItem>((group) => ({
		name: group.name,
		items:
			remainingGroupings.length > 0
				? recursivelyGroupCardItems(group.items, remainingGroupings)
				: group.items,
		product: group.product
	}));
}

/**
 * Group the cards by the given grouping using Kohaku's grouping logic
 * and translating the resulting keys to localized labels.
 */
export function groupCardItems(cardItems: CardItem[], grouping: Grouping): GroupedCardItem[] {
	const wrappers: CardItemWrapper<CardItem>[] = cardItems.map((item) => ({
		item,
		card: item.card
	}));
	const groupedResults = groupByType(wrappers, grouping);
	return groupedResults.map((result) => {
		const grouped: GroupedCardItem = {
			name: groupingKeyToLabel(result.groupingKey, result.dynamicValue),
			items: result.items,
			preferSide: result.preferSide
		};

		// Add product data for Set grouping so ProductIcon can be rendered
		if (result.groupingKey === GroupingKey.Set && result.dynamicValue) {
			grouped.product = result.dynamicValue as Product;
		}

		return grouped;
	});
}

export function sortRecursivelyGroupedCards(
	groupedCards: RecursivelyGroupedCardItem,
	sortingOrder: SortingType[]
): RecursivelyGroupedCardItem {
	function isArrayOfCardItems(
		items: RecursivelyGroupedCardItem[] | CardItem[]
	): items is CardItem[] {
		return items.every(noMoreGroup);
	}
	return {
		...groupedCards,
		items: isArrayOfCardItems(groupedCards.items)
			? sortCardItems(groupedCards.items, sortingOrder)
			: groupedCards.items.map((group) => sortRecursivelyGroupedCards(group, sortingOrder))
	};
}

/**
 * Arrange topmost level grouping into two columns such that length
 * are as equal as possible.
 */
export function divideHalf(groupedCards: RecursivelyGroupedCardItem[]): {
	left: RecursivelyGroupedCardItem[];
	right: RecursivelyGroupedCardItem[];
} {
	const left: RecursivelyGroupedCardItem[] = [];
	const right: RecursivelyGroupedCardItem[] = [];
	function countRecursive(group: RecursivelyGroupedCardItem): number {
		return group.items.reduce((acc, item) => {
			if (noMoreGroup(item)) {
				return acc + 1;
			} else {
				return acc + countRecursive(item);
			}
		}, 0);
	}
	const totalCount = groupedCards.reduce((acc, group) => acc + countRecursive(group), 0);
	const halfCount = Math.ceil(totalCount / 2);

	// Ensure the first group take left side. The rest try to use available space. Order must be maintained.
	let doneWithLeftSide = false;
	let leftCount = 0;
	for (let i = 0; i < groupedCards.length; i++) {
		const group = groupedCards[i];
		const groupCount = countRecursive(group);
		if (group.preferSide !== undefined) {
			if (group.preferSide === 'left') {
				left.push(group);
				leftCount += groupCount;
				continue;
			} else if (group.preferSide === 'right') {
				right.push(group);
				continue;
			}
		}
		if (!doneWithLeftSide && (leftCount === 0 || leftCount + groupCount <= halfCount)) {
			left.push(group);
			leftCount += groupCount;
		} else {
			right.push(group);
			doneWithLeftSide = true;
		}
	}
	return { left, right };
}

export function sortGroupedCards(
	groupedCards: GroupedCardItem[],
	sortingOrder: SortingType[]
): GroupedCardItem[] {
	const clone = [...groupedCards];
	clone.forEach((group) => {
		group.items = sortCardItems(group.items, sortingOrder);
	});
	return clone;
}

// ===== Linked Cards Utility (from card-utility.ts) =====

/**
 * Find all cards linked to this card, including both standard bonded cards and
 * special UI-specific linked cards (like customizable card upgrade sheets).
 *
 * This is specific to the UI package and should not be in kohaku because it includes
 * non-standard relationships.
 *
 * @param card The card to find linked cards for
 * @param cardResolver Resolver to convert card codes to Card objects
 * @returns Array of linked Card objects
 */
export function findLinkedCardsSpecial(card: Card, cardResolver: CardResolver): Card[] {
	const linkedCards: Card[] = [];

	// Get standard bonded cards from kohaku
	const bondedCodes = cardUtil.findLinkedCards(card);
	for (const code of bondedCodes) {
		try {
			linkedCards.push(cardResolver.resolve(code));
		} catch {
			// Skip cards that can't be resolved
		}
	}

	// Check if card is customizable (contains "Customizable." in text)
	if (card.customizationOptions !== undefined) {
		// This "b" are not card backs, they are new cards
		// added manually to represent the upgrade sheets for customizable cards.
		const upgradedCode = card.code + 'b';
		const upgradedCard = cardResolver.resolve(upgradedCode);
		linkedCards.push(upgradedCard);
	}

	return linkedCards;
}

/**
 * Default grouping and sorting settings for deck displays.
 * These are shared across DeckDisplayList, DeckDisplayGrid, and DeckDisplay components.
 */

export const deckListMainGrouping: Grouping[] = ['default'];
export const deckListMainSorting: SortingType[] = ['class', 'slot', 'position'];

export const deckListSideGrouping: Grouping[] = ['level'];
export const deckListSideSorting: SortingType[] = ['class', 'position'];

export const deckListLinkedGrouping: Grouping[] = [];
export const deckListLinkedSorting: SortingType[] = ['class', 'set', 'position'];

// Extra deck uses same as main deck
export const deckListExtraGrouping: Grouping[] = deckListMainGrouping;
export const deckListExtraSorting: SortingType[] = deckListMainSorting;

// Grid View Settings

export const deckGridMainSorting: SortingType[] = ['type', 'name', 'level', 'position'];
export const deckGridSideSorting: SortingType[] = ['level', 'class', 'position'];

// Extra and linked use same as main deck
export const deckGridExtraSorting: SortingType[] = deckGridMainSorting;
export const deckGridLinkedSorting: SortingType[] = deckGridMainSorting;

// Advanced View Settings (FlexibleCardDisplay)

export const deckAdvancedCombinedSettings: GroupingSortingSettings = {
	grouping: ['set'],
	sortingOrder: ['class', 'position']
};

export const deckAdvancedMainSettings: GroupingSortingSettings = {
	grouping: deckListMainGrouping,
	sortingOrder: deckListMainSorting
};

export const deckAdvancedSideSettings: GroupingSortingSettings = {
	grouping: deckListSideGrouping,
	sortingOrder: deckListSideSorting
};

export const deckAdvancedLinkedSettings: GroupingSortingSettings = {
	grouping: deckListLinkedGrouping,
	sortingOrder: deckListLinkedSorting
};

export const deckAdvancedExtraSettings: GroupingSortingSettings = {
	grouping: ['default'],
	sortingOrder: []
};
