/**
 * Conversion and transformation functions for Kohaku internal types.
 */

import { Campaign, StandaloneScenario, campaignToProductMap } from '../../type/game/campaign.js';
import { Product } from '../../type/game/product.js';
import {
  EncounterSet,
  productEncounterSetsMap,
  campaignEncounterSetsMap,
  standaloneEncounterSetsMap,
} from '../../type/game/encounter-set.js';
import { CardClass } from '../../type/game/card-class.js';

// Campaign conversions

export function productToCampaign(product: Product): Campaign {
  switch (product) {
    case Product.CoreSet:
    case Product.RevisedCoreSet:
      return Campaign.NightOfTheZealot;
    case Product.TheDunwichLegacyCampaignExpansion:
    case Product.TheDunwichLegacyInvestigatorExpansion:
      return Campaign.TheDunwichLegacy;
    case Product.ThePathToCarcosaCampaignExpansion:
    case Product.ThePathToCarcosaInvestigatorExpansion:
      return Campaign.ThePathToCarcosa;
    case Product.TheForgottenAgeCampaignExpansion:
    case Product.TheForgottenAgeInvestigatorExpansion:
      return Campaign.TheForgottenAge;
    case Product.TheCircleUndoneCampaignExpansion:
    case Product.TheCircleUndoneInvestigatorExpansion:
      return Campaign.TheCircleUndone;
    case Product.TheDreamEatersCampaignExpansion:
    case Product.TheDreamEatersInvestigatorExpansion:
      return Campaign.TheDreamQuest; // Default to Dream Quest for Dream Eaters
    case Product.TheInnsmouthConspiracyCampaignExpansion:
    case Product.TheInnsmouthConspiracyInvestigatorExpansion:
      return Campaign.TheInnsmouthConspiracy;
    case Product.EdgeOfTheEarthCampaignExpansion:
    case Product.EdgeOfTheEarthInvestigatorExpansion:
      return Campaign.EdgeOfTheEarth;
    case Product.TheScarletKeysCampaignExpansion:
    case Product.TheScarletKeysInvestigatorExpansion:
      return Campaign.TheScarletKeys;
    case Product.TheFeastOfHemlockValeCampaignExpansion:
    case Product.TheFeastOfHemlockValeInvestigatorExpansion:
      return Campaign.TheFeastOfHemlockVale;
    case Product.TheDrownedCityCampaignExpansion:
    case Product.TheDrownedCityInvestigatorExpansion:
      return Campaign.TheDrownedCity;
    case Product.ReturnToTheNightOfTheZealot:
      return Campaign.ReturnToNightOfTheZealot;
    case Product.ReturnToTheDunwichLegacy:
      return Campaign.ReturnToTheDunwichLegacy;
    case Product.ReturnToThePathToCarcosa:
      return Campaign.ReturnToThePathToCarcosa;
    case Product.ReturnToTheForgottenAge:
      return Campaign.ReturnToTheForgottenAge;
    case Product.ReturnToTheCircleUndone:
      return Campaign.ReturnToTheCircleUndone;
    case Product.CoreSet2026:
      return Campaign.BrethrenOfAsh;
    default:
      throw new Error('Product does not map to a campaign: ' + product);
  }
}

export function campaignToProduct(campaign: Campaign): Product {
  const product = campaignToProductMap[campaign];
  if (!product) {
    throw new Error('Campaign does not map to a product: ' + campaign);
  }
  return product;
}

// Encounter set conversions

export function productToEncounterSets(product: Product): EncounterSet[] {
  return productEncounterSetsMap[product] || [];
}

export function campaignToEncounterSets(campaign: Campaign): EncounterSet[] {
  return campaignEncounterSetsMap[campaign] || [];
}

export function standaloneScenarioToEncounterSets(scenario: StandaloneScenario): EncounterSet[] {
  return standaloneEncounterSetsMap[scenario] || [];
}

// Card class conversions

export function investigatorStarterDeckToCardClass(starterDeck: Product): CardClass {
  switch (starterDeck) {
    case Product.NathanielCho:
      return CardClass.Guardian;
    case Product.HarveyWalters:
      return CardClass.Seeker;
    case Product.WinifredHabbamock:
      return CardClass.Rogue;
    case Product.JacquelineFine:
      return CardClass.Mystic;
    case Product.StellaClark:
      return CardClass.Survivor;
    default:
      throw new Error(`Unknown investigator starter deck product: ${starterDeck}`);
  }
}

// Product conversions

export function coreToRcoreProduct(product: Product): Product {
  switch (product) {
    case Product.CoreSet:
      return Product.RevisedCoreSet;
    case Product.RevisedCoreSet:
      return Product.CoreSet;
    default:
      return product;
  }
}

export function getConsolidatedProductAbbreviation(
  product: Product,
  includeInvestigatorAndCampaign: boolean
): string {
  let result: string;
  if (includeInvestigatorAndCampaign) {
    switch (product) {
      case Product.TheDunwichLegacyInvestigatorExpansion:
      case Product.TheDunwichLegacyCampaignExpansion:
        result = 'dwl';
        break;
      case Product.ThePathToCarcosaInvestigatorExpansion:
      case Product.ThePathToCarcosaCampaignExpansion:
        result = 'ptc';
        break;
      case Product.TheForgottenAgeInvestigatorExpansion:
      case Product.TheForgottenAgeCampaignExpansion:
        result = 'tfa';
        break;
      case Product.TheCircleUndoneInvestigatorExpansion:
      case Product.TheCircleUndoneCampaignExpansion:
        result = 'tcu';
        break;
      case Product.TheDreamEatersInvestigatorExpansion:
      case Product.TheDreamEatersCampaignExpansion:
        result = 'tde';
        break;
      case Product.TheInnsmouthConspiracyInvestigatorExpansion:
      case Product.TheInnsmouthConspiracyCampaignExpansion:
        result = 'tic';
        break;
      case Product.EdgeOfTheEarthInvestigatorExpansion:
      case Product.EdgeOfTheEarthCampaignExpansion:
        result = 'eote';
        break;
      case Product.TheScarletKeysInvestigatorExpansion:
      case Product.TheScarletKeysCampaignExpansion:
        result = 'tsk';
        break;
      case Product.TheFeastOfHemlockValeInvestigatorExpansion:
      case Product.TheFeastOfHemlockValeCampaignExpansion:
        result = 'fhv';
        break;
      case Product.TheDrownedCityInvestigatorExpansion:
      case Product.TheDrownedCityCampaignExpansion:
        result = 'tdc';
        break;
      default:
        result = product;
    }
  } else {
    result = product;
  }
  return result.replace(/_/g, '-');
}
