import { browser } from '$app/environment';
import type { Product } from '@5argon/arkham-kohaku';

import { getFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '$lib/storage';

export const STARTER_TEAM_MAX = 4;

/**
 * One starter deck in the cart, addressed the way the pages are.
 */
export interface StarterTeamMember {
	author: string;
	series: string;
	slug: string;
}

interface StoredTeam {
	members: StarterTeamMember[];
	/**
	 * Investigator Deck product codes the user ticked on the listing;
	 * undefined until they touch the filter.
	 */
	products?: string[];
}

function sameMember(a: StarterTeamMember, b: StarterTeamMember): boolean {
	return a.author === b.author && a.series === b.series && a.slug === b.slug;
}

/**
 * The persistent "shopping cart" of starter decks, kept in this browser and
 * shared by every /starter page. Mutations persist immediately.
 */
export class StarterTeamCart {
	members = $state<StarterTeamMember[]>([]);
	products = $state<Product[] | undefined>(undefined);

	constructor() {
		if (!browser) return;
		const stored = getFromStorage<StoredTeam | null>(STORAGE_KEYS.STARTER_TEAM, null);
		if (stored !== null && Array.isArray(stored.members)) {
			this.members = stored.members.slice(0, STARTER_TEAM_MAX);
			this.products = stored.products as Product[] | undefined;
		}
	}

	get isFull(): boolean {
		return this.members.length >= STARTER_TEAM_MAX;
	}

	has(member: StarterTeamMember): boolean {
		return this.members.some((m) => sameMember(m, member));
	}

	/**
	 * Whether another deck in the team already plays this investigator (a
	 * team cannot field the same investigator twice).
	 */
	hasInvestigator(
		code: string,
		resolve: (member: StarterTeamMember) => string | undefined
	): boolean {
		return this.members.some((m) => resolve(m) === code);
	}

	add(member: StarterTeamMember): void {
		if (this.isFull || this.has(member)) return;
		this.members = [...this.members, member];
		this.persist();
	}

	remove(member: StarterTeamMember): void {
		this.members = this.members.filter((m) => !sameMember(m, member));
		this.persist();
	}

	clear(): void {
		this.members = [];
		this.persist();
	}

	setProducts(products: Product[]): void {
		this.products = [...products];
		this.persist();
	}

	private persist(): void {
		if (!browser) return;
		if (this.members.length === 0 && this.products === undefined) {
			removeFromStorage(STORAGE_KEYS.STARTER_TEAM);
			return;
		}
		const stored: StoredTeam = {
			members: $state.snapshot(this.members),
			products: this.products === undefined ? undefined : [...this.products]
		};
		saveToStorage(STORAGE_KEYS.STARTER_TEAM, stored);
	}
}

export const starterTeam = new StarterTeamCart();
