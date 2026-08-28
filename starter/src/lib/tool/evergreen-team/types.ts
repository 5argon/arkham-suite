import type { Card, CardClass, CardCode, Product } from '@5argon/arkham-kohaku';

/**
 * The two mutually exclusive core box choices of the Evergreen environment.
 */
export type EvergreenCore = Product.RevisedCoreSet | Product.CoreSet2026;

export type EvergreenZone = 'main' | 'side';

/**
 * Choices made on the setup page. Frozen once the user proceeds to planning;
 * only "Start Over" can change them.
 */
export interface EvergreenSetup {
	core: EvergreenCore;
	/**
	 * Subset of the 5 prebuilt deck products matching the chosen core
	 * (Investigator Starter Decks for Revised Core, Investigator Decks for Core Set 2026).
	 */
	deckProducts: Product[];
	/**
	 * Advanced: any other products whose cards join the shared pool. Their
	 * investigators are never added to the roster - the team stays Evergreen.
	 */
	extraProducts: Product[];
	/**
	 * 1 to 4 investigators, no duplicates. Order = player order.
	 */
	investigators: CardCode[];
}

/**
 * One player's draft. Signature cards, signature weaknesses, and the random
 * basic weakness placeholder are NOT stored here; they are fixed items derived
 * from the investigator's deck requirements.
 */
export interface EvergreenDeckState {
	investigator: CardCode;
	/**
	 * Level 0 cards only, keyed by canonical pool code.
	 */
	main: Record<CardCode, number>;
	/**
	 * Level 1+ cards, keyed by canonical pool code.
	 */
	side: Record<CardCode, number>;
}

/**
 * How much one pickup carries: a single copy, the maximum allowed copies, or
 * a sweep of every card sharing the grabbed card's class (scoped to its
 * product section, or to all products when mergeProducts is on).
 */
export type EvergreenPickMode = 'one' | 'max' | 'class';

/**
 * A view filter over one basic aspect beginners think in terms of; it hides
 * non-matching stacks on both sides without touching any counts.
 */
export type EvergreenFocus = 'none' | 'hand' | 'ally' | 'skill';

export interface EvergreenState {
	setup: EvergreenSetup;
	/**
	 * Parallel to setup.investigators.
	 */
	decks: EvergreenDeckState[];
	pickMode: EvergreenPickMode;
	/**
	 * Collection view: group by class across all products instead of per
	 * product; also widens the class pick mode's sweep to all products.
	 */
	mergeProducts: boolean;
	/**
	 * Session preference: pickups ignore how many copies are left in the
	 * collection, so overlaps can be introduced on purpose (never persisted).
	 */
	unlimited: boolean;
	info: TeamInfo;
}

/**
 * One stack on the collection side: one physical printing, exactly like the
 * real cards. Reprints of the same card in different products stay separate
 * stacks in their own product sections.
 */
export interface PoolEntry {
	card: Card;
	/**
	 * Copies of this printing in its box.
	 */
	total: number;
	/**
	 * Printings of the same card share a title key; the per-deck copy limit
	 * counts across all of them (Arkham's by-title rule, per level).
	 */
	titleKey: string;
}

/**
 * One line of an investigator's beginner-friendly deckbuilding access summary,
 * e.g. { cardClass: Guardian, min: 0, max: 5 }.
 */
export interface AccessLine {
	cardClass: CardClass;
	min: number;
	max: number;
}

/**
 * Team-level metadata shown in the team banner, editable in the team builder;
 * pre-built teams supply their own. Length limits: see TEAM_INFO_LIMITS.
 */
export interface TeamInfo {
	name: string;
	author: string;
	description: string;
}

/**
 * Per-deck name and description, parallel to EvergreenState.decks; used for
 * exports and the full deck modal.
 */
export interface DeckMeta {
	name: string;
	description: string;
}
