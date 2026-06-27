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
  /**
   * Provisional code from arkham.build: ArkhamDB has not assigned a pack code for this product yet.
   */
  TracesToNowhere = 'traces_to_nowhere_pack',

  ParallelInvestigators = 'parallel',
  Promotional = 'promo',

  CoreSet2026 = 'core_2026',

  ChildrenOfBlood = 'cob',

  /**
   * Provisional code: ArkhamDB has not assigned a pack code for this product yet.
   */
  PowerOfTheDreamlands = 'potd',

  TommyMuldoon = 'tom',
  CarolynFern = 'car',
  AndrePatel = 'and',
  MarieLambeau = 'mar',
  MiguelDeLaCruz = 'mig',
}

export const productCoreSetsChapterOne: Product[] = [Product.CoreSet, Product.RevisedCoreSet];

export const productCoreSetsChapterTwo: Product[] = [Product.CoreSet2026];

export const productCoreSets: Product[] = [
  Product.CoreSet,
  Product.RevisedCoreSet,
  Product.CoreSet2026,
];

export const productCoreSetsNoOldCore: Product[] = [Product.RevisedCoreSet, Product.CoreSet2026];

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

export const productChapterTwoCampaignExpansions: Product[] = [Product.ChildrenOfBlood];

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
 * The new investigator decks coming out after Core Set 2026.
 */
export const productInvestigatorDeck: Product[] = [
  Product.TommyMuldoon,
  Product.CarolynFern,
  Product.AndrePatel,
  Product.MarieLambeau,
  Product.MiguelDeLaCruz,
];

/**
 * Chapter Two products that contain only player cards for deckbuilding.
 */
export const productDeckbuildingExpansions: Product[] = [Product.PowerOfTheDreamlands];

/** Standalone "Scenario Pack" products released in the Chapter One era (all of them, so far). */
export const productStandaloneChapterOne: Product[] = [
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
  Product.FilmFatale,
  Product.TracesToNowhere,
];

/** Standalone "Scenario Pack" products released in the Chapter Two era (none yet). */
export const productStandaloneChapterTwo: Product[] = [];

export const productStandalone: Product[] = [
  ...productStandaloneChapterOne,
  ...productStandaloneChapterTwo,
];

export const productOther: Product[] = [Product.ParallelInvestigators, Product.Promotional];

export const productOrdering: Product[] = [
  ...productCoreSetsChapterOne,
  Product.ReturnToTheNightOfTheZealot,
  Product.TheDunwichLegacyInvestigatorExpansion,
  Product.ReturnToTheDunwichLegacy,
  Product.ThePathToCarcosaInvestigatorExpansion,
  Product.ReturnToThePathToCarcosa,
  Product.TheForgottenAgeInvestigatorExpansion,
  Product.ReturnToTheForgottenAge,
  Product.TheCircleUndoneInvestigatorExpansion,
  Product.ReturnToTheCircleUndone,
  Product.TheDreamEatersInvestigatorExpansion,
  Product.TheInnsmouthConspiracyInvestigatorExpansion,
  Product.EdgeOfTheEarthInvestigatorExpansion,
  Product.TheScarletKeysInvestigatorExpansion,
  Product.TheFeastOfHemlockValeInvestigatorExpansion,
  Product.TheDrownedCityInvestigatorExpansion,
  ...productInvestigatorStarterDeck,
  ...productCoreSetsChapterTwo,
  ...productInvestigatorDeck,
  ...productDeckbuildingExpansions,
  ...productStandalone,
  ...productChapterOneCampaignExpansions,
  ...productChapterTwoCampaignExpansions,
  ...productOther,
];
