/**
 * These are based on revised/repackaged product line.
 */
export enum Product {
  RandomBasicWeakness = 'random_basic_weakness',

  CoreSet = 'core',
  RevisedCoreSet = 'rcore',

  TheDunwichLegacyCampaignExpansion = 'dwlc',
  TheDunwichLegacyInvestigatorExpansion = 'dwlp',
  ThePathToCarcosaCampaignExpansion = 'ptcc',
  ThePathToCarcosaInvestigatorExpansion = 'ptcp',
  TheForgottenAgeCampaignExpansion = 'tfac',
  TheForgottenAgeInvestigatorExpansion = 'tfap',
  TheCircleUndoneCampaignExpansion = 'tcuc',
  TheCircleUndoneInvestigatorExpansion = 'tcup',
  TheDreamEatersCampaignExpansion = 'tdec',
  TheDreamEatersInvestigatorExpansion = 'tdep',
  TheInnsmouthConspiracyCampaignExpansion = 'ticc',
  TheInnsmouthConspiracyInvestigatorExpansion = 'ticp',
  EdgeOfTheEarthCampaignExpansion = 'eoec',
  EdgeOfTheEarthInvestigatorExpansion = 'eoep',
  TheScarletKeysCampaignExpansion = 'tskc',
  TheScarletKeysInvestigatorExpansion = 'tskp',
  TheFeastOfHemlockValeCampaignExpansion = 'fhvc',
  TheFeastOfHemlockValeInvestigatorExpansion = 'fhvp',
  TheDrownedCityCampaignExpansion = 'tdcc',
  TheDrownedCityInvestigatorExpansion = 'tdcp',

  ReturnToTheNightOfTheZealot = 'rtnotz',
  ReturnToTheDunwichLegacy = 'rtdwl',
  ReturnToThePathToCarcosa = 'rtptc',
  ReturnToTheForgottenAge = 'rttfa',
  ReturnToTheCircleUndone = 'rttcu',

  NathanielCho = 'nat',
  HarveyWalters = 'har',
  WinifredHabbamock = 'win',
  JacquelineFine = 'jac',
  StellaClark = 'ste',

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

  ParallelInvestigators = 'parallel',
  Promotional = 'promo',

  CoreSet2026 = 'core_2026',
}

export const productMainline: Product[] = [
  Product.CoreSet,
  Product.RevisedCoreSet,
  Product.TheDunwichLegacyCampaignExpansion,
  Product.TheDunwichLegacyInvestigatorExpansion,
  Product.ThePathToCarcosaCampaignExpansion,
  Product.ThePathToCarcosaInvestigatorExpansion,
  Product.TheForgottenAgeCampaignExpansion,
  Product.TheForgottenAgeInvestigatorExpansion,
  Product.TheCircleUndoneCampaignExpansion,
  Product.TheCircleUndoneInvestigatorExpansion,
  Product.TheDreamEatersCampaignExpansion,
  Product.TheDreamEatersInvestigatorExpansion,
  Product.TheInnsmouthConspiracyCampaignExpansion,
  Product.TheInnsmouthConspiracyInvestigatorExpansion,
  Product.EdgeOfTheEarthCampaignExpansion,
  Product.EdgeOfTheEarthInvestigatorExpansion,
  Product.TheScarletKeysCampaignExpansion,
  Product.TheScarletKeysInvestigatorExpansion,
  Product.TheFeastOfHemlockValeCampaignExpansion,
  Product.TheFeastOfHemlockValeInvestigatorExpansion,
  Product.TheDrownedCityCampaignExpansion,
  Product.TheDrownedCityInvestigatorExpansion,
  Product.CoreSet2026,
];

export const productCoreSets: Product[] = [
  Product.CoreSet,
  Product.RevisedCoreSet,
  Product.CoreSet2026,
];

export const productCoreSetsNoOldCore: Product[] = [
  Product.RevisedCoreSet,
  Product.CoreSet2026,
];

/**
 * These products was once Mythos Pack or Deluxe Expansion but have been repackaged as Investigator Expansions.
 * Sorting of cards in the repackaged box is different from the original products, while
 * they maintain the original card numbering.
 */
export const productRepackaged: Product[] = [
  Product.TheDunwichLegacyInvestigatorExpansion,
  Product.ThePathToCarcosaInvestigatorExpansion,
  Product.TheForgottenAgeInvestigatorExpansion,
  Product.TheCircleUndoneInvestigatorExpansion,
  Product.TheDreamEatersInvestigatorExpansion,
  Product.TheInnsmouthConspiracyInvestigatorExpansion,
];

export const productChapterOneInvestigatorExpansions: Product[] = [
  Product.TheDunwichLegacyInvestigatorExpansion,
  Product.ThePathToCarcosaInvestigatorExpansion,
  Product.TheForgottenAgeInvestigatorExpansion,
  Product.TheCircleUndoneInvestigatorExpansion,
  Product.TheDreamEatersInvestigatorExpansion,
  Product.TheInnsmouthConspiracyInvestigatorExpansion,
  Product.EdgeOfTheEarthInvestigatorExpansion,
  Product.TheScarletKeysInvestigatorExpansion,
  Product.TheFeastOfHemlockValeInvestigatorExpansion,
  Product.TheDrownedCityInvestigatorExpansion,
];

export const productChapterOneCampaignExpansions: Product[] = [
  Product.TheDunwichLegacyCampaignExpansion,
  Product.ThePathToCarcosaCampaignExpansion,
  Product.TheForgottenAgeCampaignExpansion,
  Product.TheCircleUndoneCampaignExpansion,
  Product.TheDreamEatersCampaignExpansion,
  Product.TheInnsmouthConspiracyCampaignExpansion,
  Product.EdgeOfTheEarthCampaignExpansion,
  Product.TheScarletKeysCampaignExpansion,
  Product.TheFeastOfHemlockValeCampaignExpansion,
  Product.TheDrownedCityCampaignExpansion,
];

export const productChapterOneExpansions: Product[] = [
  ...productChapterOneInvestigatorExpansions,
  ...productChapterOneCampaignExpansions,
];

export const productReturnTo: Product[] = [
  Product.ReturnToTheNightOfTheZealot,
  Product.ReturnToTheDunwichLegacy,
  Product.ReturnToThePathToCarcosa,
  Product.ReturnToTheForgottenAge,
  Product.ReturnToTheCircleUndone,
];

/**
 * Refers to only the old 5 investigator starter decks,
 * those after Core Set 2026 are called "Investigator Deck" with
 * no "Starter".
 */
export const productInvestigatorStarterDeck: Product[] = [
  Product.NathanielCho,
  Product.HarveyWalters,
  Product.WinifredHabbamock,
  Product.JacquelineFine,
  Product.StellaClark,
];

/**
 * Also includes the new Investigator Starter Decks,
 * as well as those after Core Set 2026.
 */
export const productInvestigatorDeck: Product[] = [
  Product.NathanielCho,
  Product.HarveyWalters,
  Product.WinifredHabbamock,
  Product.JacquelineFine,
  Product.StellaClark,
];

export const productStandalone: Product[] = [
  Product.CurseOfTheRougarou,
  Product.CarnevaleOfHorrors,
  Product.TheLabyrinthsOfLunacy,
  Product.GuardiansOfTheAbyss,
  Product.MurderAtTheExcelsiorHotel,
  Product.TheBlobThatAteEverything,
  Product.TheBlobThatAteEverythingElse,
  Product.WarOfTheOuterGods,
  Product.MachinationsThroughTime,
  Product.FortuneAndFolly,
  Product.TheMidwinterGala,
];

export const productOther: Product[] = [Product.ParallelInvestigators, Product.Promotional];

export const productOrdering: Product[] = [
  ...productMainline,
  ...productReturnTo,
  ...productInvestigatorStarterDeck,
  ...productStandalone,
  ...productOther,
];
