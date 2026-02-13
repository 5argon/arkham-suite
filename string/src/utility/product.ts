import { CardClass, Product } from '@5argon/arkham-kohaku';
import {
  campaignNameReturnToTheCircleUndone,
  campaignNameReturnToTheDunwichLegacy,
  campaignNameReturnToTheForgottenAge,
  campaignNameReturnToTheNightOfTheZealot,
  campaignNameReturnToThePathToCarcosa,
  campaignNameTheCircleUndone,
  campaignNameTheDreamEaters,
  campaignNameTheDrownedCity,
  campaignNameTheDunwichLegacy,
  campaignNameTheFeastOfHemlockVale,
  campaignNameTheForgottenAge,
  campaignNameTheInnsmouthConspiracy,
  campaignNameThePathToCarcosa,
  campaignNameTheScarletKeys,
  campaignNameEdgeOfTheEarth,
  investigatorStarterDecksHarveyWalters,
  investigatorStarterDecksJacquelineFine,
  investigatorStarterDecksNathanielCho,
  investigatorStarterDecksStellaClark,
  investigatorStarterDecksWinifredHabbamock,
  playerCategoryParallelInvestigator,
  playerCategoryPromotional,
  productTypeCampaignExpansion,
  productCoreCoreSet,
  productTypeInvestigatorExpansion,
  productCoreRevisedCoreSet,
  standaloneScenarioNameCarnevaleOfHorrors,
  standaloneScenarioNameCurseOfTheRougarou,
  standaloneScenarioNameFortuneAndFolly,
  standaloneScenarioNameGuardiansOfTheAbyss,
  standaloneScenarioNameMachinationsThroughTime,
  standaloneScenarioNameMurderAtTheExcelsiorHotel,
  standaloneScenarioNameTheBlobThatAteEverything,
  standaloneScenarioNameTheLabyrinthsOfLunacy,
  standaloneScenarioNameTheMidwinterGala,
  standaloneScenarioNameWarOfTheOuterGods,
  standaloneScenarioNameTheBlobThatAteEverythingELSE,
  productCoreCoreSet2026,
  standaloneScenarioNameFilmFatale,
  gameTermsRandomBasicWeakness,
} from '../paraglide/messages.js';

export function productName(product: Product, removeExpansionSuffix?: boolean): string {
  switch (product) {
    case Product.RandomBasicWeakness:
      return gameTermsRandomBasicWeakness();

    case Product.CoreSet:
      return productCoreCoreSet();
    case Product.RevisedCoreSet:
      return productCoreRevisedCoreSet();

    case Product.TheDunwichLegacyCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameTheDunwichLegacy()
        : campaignNameTheDunwichLegacy() + ' ' + productTypeCampaignExpansion();
    case Product.TheDunwichLegacyInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameTheDunwichLegacy()
        : campaignNameTheDunwichLegacy() + ' ' + productTypeInvestigatorExpansion();
    case Product.ThePathToCarcosaCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameThePathToCarcosa()
        : campaignNameThePathToCarcosa() + ' ' + productTypeCampaignExpansion();
    case Product.ThePathToCarcosaInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameThePathToCarcosa()
        : campaignNameThePathToCarcosa() + ' ' + productTypeInvestigatorExpansion();
    case Product.TheForgottenAgeCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameTheForgottenAge()
        : campaignNameTheForgottenAge() + ' ' + productTypeCampaignExpansion();
    case Product.TheForgottenAgeInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameTheForgottenAge()
        : campaignNameTheForgottenAge() + ' ' + productTypeInvestigatorExpansion();
    case Product.TheCircleUndoneCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameTheCircleUndone()
        : campaignNameTheCircleUndone() + ' ' + productTypeCampaignExpansion();
    case Product.TheCircleUndoneInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameTheCircleUndone()
        : campaignNameTheCircleUndone() + ' ' + productTypeInvestigatorExpansion();
    case Product.TheDreamEatersCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameTheDreamEaters()
        : campaignNameTheDreamEaters() + ' ' + productTypeCampaignExpansion();
    case Product.TheDreamEatersInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameTheDreamEaters()
        : campaignNameTheDreamEaters() + ' ' + productTypeInvestigatorExpansion();
    case Product.TheInnsmouthConspiracyCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameTheInnsmouthConspiracy()
        : campaignNameTheInnsmouthConspiracy() + ' ' + productTypeCampaignExpansion();
    case Product.TheInnsmouthConspiracyInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameTheInnsmouthConspiracy()
        : campaignNameTheInnsmouthConspiracy() + ' ' + productTypeInvestigatorExpansion();
    case Product.EdgeOfTheEarthCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameEdgeOfTheEarth()
        : campaignNameEdgeOfTheEarth() + ' ' + productTypeCampaignExpansion();
    case Product.EdgeOfTheEarthInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameEdgeOfTheEarth()
        : campaignNameEdgeOfTheEarth() + ' ' + productTypeInvestigatorExpansion();
    case Product.TheScarletKeysCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameTheScarletKeys()
        : campaignNameTheScarletKeys() + ' ' + productTypeCampaignExpansion();
    case Product.TheScarletKeysInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameTheScarletKeys()
        : campaignNameTheScarletKeys() + ' ' + productTypeInvestigatorExpansion();
    case Product.TheFeastOfHemlockValeCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameTheFeastOfHemlockVale()
        : campaignNameTheFeastOfHemlockVale() + ' ' + productTypeCampaignExpansion();
    case Product.TheFeastOfHemlockValeInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameTheFeastOfHemlockVale()
        : campaignNameTheFeastOfHemlockVale() + ' ' + productTypeInvestigatorExpansion();
    case Product.TheDrownedCityCampaignExpansion:
      return removeExpansionSuffix
        ? campaignNameTheDrownedCity()
        : campaignNameTheDrownedCity() + ' ' + productTypeCampaignExpansion();
    case Product.TheDrownedCityInvestigatorExpansion:
      return removeExpansionSuffix
        ? campaignNameTheDrownedCity()
        : campaignNameTheDrownedCity() + ' ' + productTypeInvestigatorExpansion();

    case Product.ReturnToTheNightOfTheZealot:
      return campaignNameReturnToTheNightOfTheZealot();
    case Product.ReturnToTheDunwichLegacy:
      return campaignNameReturnToTheDunwichLegacy();
    case Product.ReturnToThePathToCarcosa:
      return campaignNameReturnToThePathToCarcosa();
    case Product.ReturnToTheForgottenAge:
      return campaignNameReturnToTheForgottenAge();
    case Product.ReturnToTheCircleUndone:
      return campaignNameReturnToTheCircleUndone();

    case Product.NathanielCho:
      return investigatorStarterDecksNathanielCho();
    case Product.HarveyWalters:
      return investigatorStarterDecksHarveyWalters();
    case Product.WinifredHabbamock:
      return investigatorStarterDecksWinifredHabbamock();
    case Product.JacquelineFine:
      return investigatorStarterDecksJacquelineFine();
    case Product.StellaClark:
      return investigatorStarterDecksStellaClark();

    case Product.CurseOfTheRougarou:
      return standaloneScenarioNameCurseOfTheRougarou();
    case Product.CarnevaleOfHorrors:
      return standaloneScenarioNameCarnevaleOfHorrors();
    case Product.TheLabyrinthsOfLunacy:
      return standaloneScenarioNameTheLabyrinthsOfLunacy();
    case Product.GuardiansOfTheAbyss:
      return standaloneScenarioNameGuardiansOfTheAbyss();
    case Product.MurderAtTheExcelsiorHotel:
      return standaloneScenarioNameMurderAtTheExcelsiorHotel();
    case Product.TheBlobThatAteEverything:
      return standaloneScenarioNameTheBlobThatAteEverything();
    case Product.TheBlobThatAteEverythingElse:
      return standaloneScenarioNameTheBlobThatAteEverythingELSE();
    case Product.WarOfTheOuterGods:
      return standaloneScenarioNameWarOfTheOuterGods();
    case Product.MachinationsThroughTime:
      return standaloneScenarioNameMachinationsThroughTime();
    case Product.FortuneAndFolly:
      return standaloneScenarioNameFortuneAndFolly();
    case Product.TheMidwinterGala:
      return standaloneScenarioNameTheMidwinterGala();
    case Product.FilmFatale:
      return standaloneScenarioNameFilmFatale();

    case Product.ParallelInvestigators:
      return playerCategoryParallelInvestigator();
    case Product.Promotional:
      return playerCategoryPromotional();

    case Product.CoreSet2026:
      return productCoreCoreSet2026();

    default:
      return assertUnreachable(product);
  }
}

function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}
