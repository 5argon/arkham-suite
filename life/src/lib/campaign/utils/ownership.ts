/**
 * ownership.ts — the product-ownership cascade. A player's owned kohaku
 * `Product`s determine which campaigns (and cards/classes) count toward their
 * profile; un-owning a product removes its content from every "blank".
 * `null` owned-products means "own everything" (the global default).
 */
import { campaignsForProducts, type Product } from '@5argon/arkham-kohaku';

/**
 * The kohaku Campaign codes provided by the owned products, or `null` when the
 * player owns everything (so callers skip filtering entirely).
 */
export function ownedCampaignCodes(ownedProducts: Product[] | null): Set<string> | null {
	if (ownedProducts === null) return null; // own everything
	return new Set<string>(campaignsForProducts(ownedProducts));
}

/** Whether a campaign code is owned (true when `ownedProducts` is null = all owned). */
export function isCampaignOwned(campaignCode: string, ownedProducts: Product[] | null): boolean {
	const owned = ownedCampaignCodes(ownedProducts);
	return owned === null || owned.has(campaignCode);
}

/** Whether a card (by its kohaku `Product`) is owned. */
export function isCardOwned(cardProduct: Product | undefined, ownedProducts: Product[] | null): boolean {
	if (ownedProducts === null) return true;
	return cardProduct !== undefined && ownedProducts.includes(cardProduct);
}
