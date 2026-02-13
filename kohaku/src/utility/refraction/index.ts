import { Boon, boonCampaignModeOnly } from '../../type/game/boon.js';
import { Ultimatum, ultimatumCampaignModeOnly } from '../../type/game/ultimatum.js';
import { Refraction, refractions, RefractionDetails } from '../../type/game/refraction.js';

/**
 * Check if a Boon can only be used in campaign mode.
 */
export function isBoonCampaignModeOnly(boon: Boon): boolean {
  return boonCampaignModeOnly.includes(boon);
}

/**
 * Check if an Ultimatum can only be used in campaign mode.
 */
export function isUltimatumCampaignModeOnly(ultimatum: Ultimatum): boolean {
  return ultimatumCampaignModeOnly.includes(ultimatum);
}

/**
 * Get detailed information about a Refraction.
 */
export function getRefractionDetail(refraction: Refraction): RefractionDetails | undefined {
  return refractions.find((r) => r.refraction === refraction);
}
