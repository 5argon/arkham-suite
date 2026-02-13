import { Campaign } from '@5argon/arkham-kohaku';
import {
  campaignNameTheDunwichLegacy,
  campaignNameThePathToCarcosa,
  campaignNameTheForgottenAge,
  campaignNameTheCircleUndone,
  campaignNameTheInnsmouthConspiracy,
  campaignNameEdgeOfTheEarth,
  campaignNameTheScarletKeys,
  campaignNameTheFeastOfHemlockVale,
  campaignNameTheDrownedCity,
  campaignNameReturnToTheDunwichLegacy,
  campaignNameReturnToThePathToCarcosa,
  campaignNameReturnToTheForgottenAge,
  campaignNameReturnToTheCircleUndone,
  campaignNameNightOfTheZealot,
  campaignNameTheDreamEatersTheDreamQuest,
  campaignNameTheDreamEatersTheWebOfDreams,
  campaignNameReturnToTheNightOfTheZealot,
} from '../paraglide/messages.js';

export function campaignName(campaign: Campaign): string {
  switch (campaign) {
    case Campaign.NightOfTheZealot: {
      return campaignNameNightOfTheZealot();
    }
    case Campaign.TheDunwichLegacy: {
      return campaignNameTheDunwichLegacy();
    }
    case Campaign.ThePathToCarcosa: {
      return campaignNameThePathToCarcosa();
    }
    case Campaign.TheForgottenAge: {
      return campaignNameTheForgottenAge();
    }
    case Campaign.TheCircleUndone: {
      return campaignNameTheCircleUndone();
    }
    case Campaign.TheDreamQuest: {
      return campaignNameTheDreamEatersTheDreamQuest();
    }
    case Campaign.TheWebOfDreams: {
      return campaignNameTheDreamEatersTheWebOfDreams();
    }
    case Campaign.TheInnsmouthConspiracy: {
      return campaignNameTheInnsmouthConspiracy();
    }
    case Campaign.EdgeOfTheEarth: {
      return campaignNameEdgeOfTheEarth();
    }
    case Campaign.TheScarletKeys: {
      return campaignNameTheScarletKeys();
    }
    case Campaign.TheFeastOfHemlockVale: {
      return campaignNameTheFeastOfHemlockVale();
    }
    case Campaign.TheDrownedCity: {
      return campaignNameTheDrownedCity();
    }
    case Campaign.ReturnToNightOfTheZealot: {
      return campaignNameReturnToTheNightOfTheZealot();
    }
    case Campaign.ReturnToTheDunwichLegacy: {
      return campaignNameReturnToTheDunwichLegacy();
    }
    case Campaign.ReturnToThePathToCarcosa: {
      return campaignNameReturnToThePathToCarcosa();
    }
    case Campaign.ReturnToTheForgottenAge: {
      return campaignNameReturnToTheForgottenAge();
    }
    case Campaign.ReturnToTheCircleUndone: {
      return campaignNameReturnToTheCircleUndone();
    }
    default: {
      throw new Error('Unknown campaign');
    }
  }
}
