import { Campaign } from '../../type/index.js';
import { Product } from '../../type/game/product.js';

/**
 * Returns abbreviation of the campaign which are mostly community-agreed.
 */
export function campaignAbbreviation(campaign: Campaign): string {
  return campaign;
}

/**
 * Get the consolidated product abbreviation, converting core to rcore if needed.
 */
export function getConsolidatedProductAbbreviation(product: Product): string {
  if (product === Product.CoreSet) {
    return Product.RevisedCoreSet;
  }
  return product;
}
