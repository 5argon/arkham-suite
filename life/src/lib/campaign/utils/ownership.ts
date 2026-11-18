/** Product ownership: what a player owns decides which campaigns and cards count on their profile.
 *  `null` owned products means everything is owned. */
import { campaignsForProducts, type Product } from '@5argon/arkham-kohaku';

/** The campaign codes the owned products provide; null when everything is owned. */
export function ownedCampaignCodes(ownedProducts: Product[] | null): Set<string> | null {
	if (ownedProducts === null) return null;
	return new Set<string>(campaignsForProducts(ownedProducts));
}

export function isCampaignOwned(campaignCode: string, ownedProducts: Product[] | null): boolean {
	const owned = ownedCampaignCodes(ownedProducts);
	return owned === null || owned.has(campaignCode);
}

export function isCardOwned(cardProduct: Product | undefined, ownedProducts: Product[] | null): boolean {
	if (ownedProducts === null) return true;
	return cardProduct !== undefined && ownedProducts.includes(cardProduct);
}
