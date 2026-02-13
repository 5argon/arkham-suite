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

export const chapterTwoSmallCampaigns: Campaign[] = [Campaign.BrethrenOfAsh];

export enum StandaloneScenario {
  CurseOfTheRougarou = 'cotr',
  CarnevaleOfHorrors = 'coh',
  TheLabyrinthsOfLunacy = 'lol',
  GuardiansOfTheAbyss = 'guardians',
  MurderAtTheExcelsiorHotel = 'hotel',
  TheBlobThatAteEverything = 'blob',
  TheBlobThatAteEverythingElse = 'blbe',
  WarOfTheOuterGods = 'wog',
  MachinationsThroughTime = 'mtt',
  FortuneAndFolly = 'fof',
  TheMidwinterGala = 'tmg',
  FilmFatale = 'film_fatale',
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
};
