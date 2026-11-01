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
 * Products that stay in print and never rotate out of the Current environment, as defined by
 * https://www.fantasyflightgames.com/a-look-at-things-to-come/
 */
export const productEvergreen: Product[] = [Product.CoreSet2026, ...productInvestigatorDeck];

/**
 * Chapter Two products that contain only player cards for deckbuilding.
 */
export const productDeckbuildingExpansions: Product[] = [Product.PowerOfTheDreamlands];

/**
 * Investigator expansions released after Core Set 2026.
 */
export const productChapterTwoInvestigatorExpansions: Product[] = [];

export const productChapterTwoScenarioPacks: Product[] = [Product.TracesToNowhere];

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
  Product.FilmFatale,
  Product.TracesToNowhere,
];

export const productOther: Product[] = [Product.ParallelInvestigators, Product.Promotional];

/**
 * Every product of Chapter Two. Only these can ever be in the Current environment.
 */
export const productChapterTwo: Product[] = [
  ...productCoreSetsChapterTwo,
  ...productInvestigatorDeck,
  ...productChapterTwoInvestigatorExpansions,
  ...productDeckbuildingExpansions,
  ...productChapterTwoCampaignExpansions,
  ...productChapterTwoScenarioPacks,
];

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
  ...productChapterTwoInvestigatorExpansions,
  ...productDeckbuildingExpansions,
  ...productStandalone,
  ...productChapterOneCampaignExpansions,
  ...productChapterTwoCampaignExpansions,
  ...productOther,
];

/**
 * Not something released on one date you could buy.
 */
type UndatedProduct =
  | Product.RandomBasicWeakness
  | Product.ParallelInvestigators
  | Product.Promotional;

/**
 * Calendar day in `YYYY-MM-DD` of each product, from ArkhamDB's `available` so repackaged products
 * have the repackaged date. Products ArkhamDB does not list yet are noted individually. Adding a
 * new `Product` fails compilation here until it has a date.
 */
export const productReleaseDate: Record<Exclude<Product, UndatedProduct>, string> = {
  [Product.CoreSet]: '2016-11-10',
  [Product.RevisedCoreSet]: '2020-10-01',

  [Product.TheDunwichLegacyCampaignExpansion]: '2024-01-12',
  [Product.TheDunwichLegacyInvestigatorExpansion]: '2024-01-12',
  [Product.ThePathToCarcosaCampaignExpansion]: '2024-01-25',
  [Product.ThePathToCarcosaInvestigatorExpansion]: '2024-01-25',
  [Product.TheForgottenAgeCampaignExpansion]: '2024-05-10',
  [Product.TheForgottenAgeInvestigatorExpansion]: '2024-05-10',
  [Product.TheCircleUndoneCampaignExpansion]: '2024-01-31',
  [Product.TheCircleUndoneInvestigatorExpansion]: '2024-01-31',
  [Product.TheDreamEatersCampaignExpansion]: '2024-09-27',
  [Product.TheDreamEatersInvestigatorExpansion]: '2024-09-27',
  [Product.TheInnsmouthConspiracyCampaignExpansion]: '2024-10-02',
  [Product.TheInnsmouthConspiracyInvestigatorExpansion]: '2024-10-02',
  [Product.EdgeOfTheEarthCampaignExpansion]: '2021-11-12',
  [Product.EdgeOfTheEarthInvestigatorExpansion]: '2021-09-10',
  [Product.TheScarletKeysCampaignExpansion]: '2022-11-18',
  [Product.TheScarletKeysInvestigatorExpansion]: '2022-09-30',
  [Product.TheFeastOfHemlockValeCampaignExpansion]: '2024-02-24',
  [Product.TheFeastOfHemlockValeInvestigatorExpansion]: '2024-02-16',
  [Product.TheDrownedCityCampaignExpansion]: '2025-03-31',
  [Product.TheDrownedCityInvestigatorExpansion]: '2025-02-07',

  [Product.ReturnToTheNightOfTheZealot]: '2018-06-28',
  [Product.ReturnToTheDunwichLegacy]: '2019-01-10',
  [Product.ReturnToThePathToCarcosa]: '2019-09-06',
  [Product.ReturnToTheForgottenAge]: '2020-08-07',
  [Product.ReturnToTheCircleUndone]: '2021-06-24',

  [Product.NathanielCho]: '2020-08-28',
  [Product.HarveyWalters]: '2020-08-28',
  [Product.WinifredHabbamock]: '2020-08-28',
  [Product.JacquelineFine]: '2020-08-28',
  [Product.StellaClark]: '2020-08-28',

  [Product.CurseOfTheRougarou]: '2016-11-17',
  [Product.CarnevaleOfHorrors]: '2016-12-08',
  [Product.TheLabyrinthsOfLunacy]: '2018-06-07',
  [Product.GuardiansOfTheAbyss]: '2018-12-06',
  [Product.MurderAtTheExcelsiorHotel]: '2019-10-25',
  [Product.TheBlobThatAteEverything]: '2020-07-03',
  [Product.TheBlobThatAteEverythingElse]: '2023-08-01',
  [Product.WarOfTheOuterGods]: '2020-07-03',
  [Product.MachinationsThroughTime]: '2022-02-04',
  [Product.FortuneAndFolly]: '2023-04-01',
  [Product.TheMidwinterGala]: '2024-08-23',
  [Product.FilmFatale]: '2025-08-15',
  /**
   * Not on ArkhamDB yet, from hallofarkham.com/arkham-horror-lcg-release-dates-us
   */
  [Product.TracesToNowhere]: '2026-10-16',

  [Product.CoreSet2026]: '2026-03-20',

  [Product.ChildrenOfBlood]: '2026-08-14',

  /**
   * Not on ArkhamDB yet, announced date from the Asmodee store listing.
   */
  [Product.PowerOfTheDreamlands]: '2027-02-19',

  [Product.TommyMuldoon]: '2026-04-17',
  [Product.CarolynFern]: '2026-04-17',
  [Product.AndrePatel]: '2026-04-17',
  [Product.MarieLambeau]: '2026-04-17',
  [Product.MiguelDeLaCruz]: '2026-04-17',
};
