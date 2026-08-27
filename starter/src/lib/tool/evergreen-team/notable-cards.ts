import { type Card, type CardCode, CardType, Slot } from '@5argon/arkham-kohaku';

import type { EvergreenDeckState, PoolEntry } from './types';

/**
 * Card titles worth a peek in a team banner, curated for the Evergreen pool
 * (Core Set 2026 and its five Investigator Decks). Edit this list freely; ally
 * assets qualify automatically and never need an entry here.
 */
export const NOTABLE_CARD_NAMES: readonly string[] = [
	'M1911',
	'Machete',
	'Lesson Learned',
	'Scene of the Crime',
	'Vicious Blow',
	'Fingerprint Kit',
	'Local Map',
	'Magnifying Glass',
	'Working a Hunch',
	'Deduction',
	'M1903 Hammerless',
	"Thieves' Kit",
	'Cosmic Flame',
	'Second Sight',
	'Ward of Protection',
	'Will of the Cosmos',
	'Meat Cleaver',
	'Look What I Found',
	'Broken Bottle',
	'Hand-Crank Flashlight',
	"Dreamer's Chronicle",
	'Scroll of the Pharaohs',
	'Caustic Reaction',
	'Unflappable',
	'Insidious Truths',
	'Lockpicks',
	'Polished Cane',
	'Clean Sweep',
	'Pay Your Dues',
	'Quick Exit',
	'A Sudden Fall',
	'Right Under Their Noses',
	'Shadowmeld',
	'Consume Life',
	'Spiritual Charm',
	'Old Compass',
	'Pocket Knife',
	'Decoy Trap',
	'Glassing',
	'Guerrilla Tactics',
	'Lie in Wait'
];

const notableNames = new Set(NOTABLE_CARD_NAMES);

export function isNotableCard(card: Card): boolean {
	const allyAsset = card.cardType === CardType.Asset && (card.slots ?? []).includes(Slot.Ally);
	return allyAsset || notableNames.has(card.name);
}

/**
 * Notable cards of a deck's main deck (level 0 only; the side deck never
 * shows), one entry per distinct card in card ID order.
 */
export function notableDeckCards(deck: EvergreenDeckState, pool: Map<CardCode, PoolEntry>): Card[] {
	return Object.keys(deck.main)
		.sort()
		.map((code) => pool.get(code)?.card)
		.filter((card): card is Card => card !== undefined && isNotableCard(card));
}
