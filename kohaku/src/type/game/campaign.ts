import { Product } from './product.js';

/**
 * This means there is no "The Dream-Eaters" campaign, because that is a Campaign Expansion
 * that comes with two campaigns: "The Dream-Quest" and "The Web of Dreams".
 */
export enum Campaign {
  NightOfTheZealot = 'notz',
  TheDunwichLegacy = 'dwl',
  ThePathToCarcosa = 'ptc',
  TheForgottenAge = 'tfa',
  TheCircleUndone = 'tcu',
  TheDreamQuest = 'tdea',
  TheWebOfDreams = 'tdeb',
  TheInnsmouthConspiracy = 'tic',
  EdgeOfTheEarth = 'eote',
  TheScarletKeys = 'tsk',
  TheFeastOfHemlockVale = 'fhv',
  TheDrownedCity = 'tdc',

  ReturnToNightOfTheZealot = 'rtnotz',
  ReturnToTheDunwichLegacy = 'rtdwl',
  ReturnToThePathToCarcosa = 'rtptc',
  ReturnToTheForgottenAge = 'rttfa',
  ReturnToTheCircleUndone = 'rttcu',

  BrethrenOfAsh = 'boa',
  ChildrenOfBlood = 'cob',
}

export const chapterOneCampaigns: Campaign[] = [
  Campaign.NightOfTheZealot,
  Campaign.TheDunwichLegacy,
  Campaign.ThePathToCarcosa,
  Campaign.TheForgottenAge,
  Campaign.TheCircleUndone,
  Campaign.TheDreamQuest,
  Campaign.TheWebOfDreams,
  Campaign.TheInnsmouthConspiracy,
  Campaign.EdgeOfTheEarth,
  Campaign.TheScarletKeys,
  Campaign.TheFeastOfHemlockVale,
  Campaign.TheDrownedCity,
];

export const chapterOneReturnToCampaigns: Campaign[] = [
  Campaign.ReturnToNightOfTheZealot,
  Campaign.ReturnToTheDunwichLegacy,
  Campaign.ReturnToThePathToCarcosa,
  Campaign.ReturnToTheForgottenAge,
  Campaign.ReturnToTheCircleUndone,
];

/**
 * The campaign each Return To campaign revisits.
 */
export const returnToCampaignOriginal: Partial<Record<Campaign, Campaign>> = {
  [Campaign.ReturnToNightOfTheZealot]: Campaign.NightOfTheZealot,
  [Campaign.ReturnToTheDunwichLegacy]: Campaign.TheDunwichLegacy,
  [Campaign.ReturnToThePathToCarcosa]: Campaign.ThePathToCarcosa,
  [Campaign.ReturnToTheForgottenAge]: Campaign.TheForgottenAge,
  [Campaign.ReturnToTheCircleUndone]: Campaign.TheCircleUndone,
};

export const chapterTwoSmallCampaigns: Campaign[] = [
  Campaign.BrethrenOfAsh,
  Campaign.ChildrenOfBlood,
];

/**
 * An individual official standalone scenario (the FFG "Side Scenarios" / Scenario Packs), one
 * member PER SCENARIO: Guardians of the Abyss provides two. Enum VALUES are the campaign-data
 * `side` catalogue scenario ids verbatim, so kohaku ↔ campaign-data join on identity.
 */
export enum StandaloneScenario {
  CurseOfTheRougarou = 'curse_of_the_rougarou',
  CarnevaleOfHorrors = 'carnevale_of_horrors',
  TheLabyrinthsOfLunacy = 'in_the_labyrinths_of_lunacy',
  // Guardians of the Abyss — two scenarios in one product.
  GuardiansEternalSlumber = 'the_eternal_slumber',
  GuardiansNightsUsurper = 'the_nights_usurper',
  MurderAtTheExcelsiorHotel = 'murder_at_the_excelsior_hotel',
  TheBlobThatAteEverything = 'blob_that_ate_everything',
  TheBlobThatAteEverythingElse = 'blob_that_ate_everything_else',
  WarOfTheOuterGods = 'war_of_the_outer_gods',
  MachinationsThroughTime = 'machinations_through_time',
  // Fortune and Folly — one scenario, two parts (canonical id = the `side` story entry).
  FortuneAndFolly = 'fortune_and_folly_part_1',
  TheMidwinterGala = 'the_midwinter_gala',
  FilmFatale = 'film_fatale',
  TracesToNowhere = 'traces_to_nowhere_pack',
}

/**
 * Which standalone scenarios each standalone {@link Product} provides, in book
 * order. Most packs provide one scenario; Guardians of the Abyss provides two.
 */
export const productToStandaloneScenarios: Partial<Record<Product, StandaloneScenario[]>> = {
  [Product.CurseOfTheRougarou]: [StandaloneScenario.CurseOfTheRougarou],
  [Product.CarnevaleOfHorrors]: [StandaloneScenario.CarnevaleOfHorrors],
  [Product.TheLabyrinthsOfLunacy]: [StandaloneScenario.TheLabyrinthsOfLunacy],
  [Product.GuardiansOfTheAbyss]: [
    StandaloneScenario.GuardiansEternalSlumber,
    StandaloneScenario.GuardiansNightsUsurper,
  ],
  [Product.MurderAtTheExcelsiorHotel]: [StandaloneScenario.MurderAtTheExcelsiorHotel],
  [Product.TheBlobThatAteEverything]: [StandaloneScenario.TheBlobThatAteEverything],
  [Product.TheBlobThatAteEverythingElse]: [StandaloneScenario.TheBlobThatAteEverythingElse],
  [Product.WarOfTheOuterGods]: [StandaloneScenario.WarOfTheOuterGods],
  [Product.MachinationsThroughTime]: [StandaloneScenario.MachinationsThroughTime],
  [Product.FortuneAndFolly]: [StandaloneScenario.FortuneAndFolly],
  [Product.TheMidwinterGala]: [StandaloneScenario.TheMidwinterGala],
  [Product.FilmFatale]: [StandaloneScenario.FilmFatale],
};

/** Standalone scenarios a {@link Product} provides (empty for non-standalone products). */
export function productStandaloneScenarios(product: Product): StandaloneScenario[] {
  return productToStandaloneScenarios[product] ?? [];
}

/**
 * Constant mapping from Campaign to its Campaign Expansion Product.
 * Each campaign comes from one campaign expansion product.
 * For campaigns that split (like Dream Eaters), both campaigns come from the same product.
 */
export const campaignToProductMap: Record<Campaign, Product> = {
  [Campaign.NightOfTheZealot]: Product.RevisedCoreSet,
  [Campaign.TheDunwichLegacy]: Product.TheDunwichLegacyCampaignExpansion,
  [Campaign.ThePathToCarcosa]: Product.ThePathToCarcosaCampaignExpansion,
  [Campaign.TheForgottenAge]: Product.TheForgottenAgeCampaignExpansion,
  [Campaign.TheCircleUndone]: Product.TheCircleUndoneCampaignExpansion,
  [Campaign.TheDreamQuest]: Product.TheDreamEatersCampaignExpansion,
  [Campaign.TheWebOfDreams]: Product.TheDreamEatersCampaignExpansion,
  [Campaign.TheInnsmouthConspiracy]: Product.TheInnsmouthConspiracyCampaignExpansion,
  [Campaign.EdgeOfTheEarth]: Product.EdgeOfTheEarthCampaignExpansion,
  [Campaign.TheScarletKeys]: Product.TheScarletKeysCampaignExpansion,
  [Campaign.TheFeastOfHemlockVale]: Product.TheFeastOfHemlockValeCampaignExpansion,
  [Campaign.TheDrownedCity]: Product.TheDrownedCityCampaignExpansion,
  [Campaign.ReturnToNightOfTheZealot]: Product.ReturnToTheNightOfTheZealot,
  [Campaign.ReturnToTheDunwichLegacy]: Product.ReturnToTheDunwichLegacy,
  [Campaign.ReturnToThePathToCarcosa]: Product.ReturnToThePathToCarcosa,
  [Campaign.ReturnToTheForgottenAge]: Product.ReturnToTheForgottenAge,
  [Campaign.ReturnToTheCircleUndone]: Product.ReturnToTheCircleUndone,
  [Campaign.BrethrenOfAsh]: Product.CoreSet2026,
  [Campaign.ChildrenOfBlood]: Product.ChildrenOfBlood,
};

/** Every {@link Campaign} provided by any product in `products` (deduped). */
export function campaignsForProducts(products: Iterable<Product>): Campaign[] {
  const owned = new Set(products);
  return (Object.entries(campaignToProductMap) as [Campaign, Product][])
    .filter(([, p]) => owned.has(p))
    .map(([campaign]) => campaign);
}
