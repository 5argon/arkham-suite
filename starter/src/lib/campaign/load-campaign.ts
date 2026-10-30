import { Campaign as KohakuCampaign } from '@5argon/arkham-kohaku';
import type { Campaign } from '$lib/core/campaign';

/**
 * Campaign reference data of a campaign, or `undefined` if it doesn't have one yet.
 * Each campaign is a dynamic import so it becomes its own chunk.
 */
export async function loadCampaign(kohakuCampaign: KohakuCampaign): Promise<Campaign | undefined> {
	switch (kohakuCampaign) {
		case KohakuCampaign.NightOfTheZealot: {
			const { nightOfTheZealotCampaign } = await import('$lib/campaign/notz/campaign');
			return nightOfTheZealotCampaign;
		}
		case KohakuCampaign.TheDunwichLegacy: {
			const { theDunwichLegacyCampaign } = await import('$lib/campaign/dwl/campaign');
			return theDunwichLegacyCampaign;
		}
		case KohakuCampaign.ThePathToCarcosa: {
			const { thePathToCarcosaCampaign } = await import('$lib/campaign/ptc/campaign');
			return thePathToCarcosaCampaign;
		}
		case KohakuCampaign.TheForgottenAge: {
			const { theForgottenAgeCampaign } = await import('$lib/campaign/tfa/campaign');
			return theForgottenAgeCampaign;
		}
		case KohakuCampaign.TheCircleUndone: {
			const { theCircleUndoneCampaign } = await import('$lib/campaign/tcu/campaign');
			return theCircleUndoneCampaign;
		}
		case KohakuCampaign.TheDreamQuest: {
			const { theDreamQuestCampaign } = await import('$lib/campaign/tde/campaign');
			return theDreamQuestCampaign;
		}
		case KohakuCampaign.TheWebOfDreams: {
			const { theWebOfDreamsCampaign } = await import('$lib/campaign/tde/campaign');
			return theWebOfDreamsCampaign;
		}
		case KohakuCampaign.TheInnsmouthConspiracy: {
			const { theInnsmouthConspiracyCampaign } = await import('$lib/campaign/tic/campaign');
			return theInnsmouthConspiracyCampaign;
		}
		case KohakuCampaign.EdgeOfTheEarth: {
			const { edgeOfTheEarthCampaign } = await import('$lib/campaign/eote/campaign');
			return edgeOfTheEarthCampaign;
		}
		case KohakuCampaign.TheScarletKeys: {
			const { theScarletKeysCampaign } = await import('$lib/campaign/tsk/campaign');
			return theScarletKeysCampaign;
		}
		case KohakuCampaign.TheFeastOfHemlockVale: {
			const { theFeastOfHemlockValeCampaign } = await import('$lib/campaign/fhv/campaign');
			return theFeastOfHemlockValeCampaign;
		}
		case KohakuCampaign.TheDrownedCity: {
			const { theDrownedCityCampaign } = await import('$lib/campaign/tdc/campaign');
			return theDrownedCityCampaign;
		}
		case KohakuCampaign.ReturnToNightOfTheZealot: {
			const { returnToTheNightOfTheZealotCampaign } = await import('$lib/campaign/notz/campaign');
			return returnToTheNightOfTheZealotCampaign;
		}
		case KohakuCampaign.ReturnToTheDunwichLegacy: {
			const { returnToTheDunwichLegacyCampaign } = await import('$lib/campaign/dwl/campaign');
			return returnToTheDunwichLegacyCampaign;
		}
		case KohakuCampaign.ReturnToThePathToCarcosa: {
			const { returnToThePathToCarcosaCampaign } = await import('$lib/campaign/ptc/campaign');
			return returnToThePathToCarcosaCampaign;
		}
		case KohakuCampaign.ReturnToTheForgottenAge: {
			const { returnToTheForgottenAgeCampaign } = await import('$lib/campaign/tfa/campaign');
			return returnToTheForgottenAgeCampaign;
		}
		case KohakuCampaign.ReturnToTheCircleUndone: {
			const { returnToTheCircleUndoneCampaign } = await import('$lib/campaign/tcu/campaign');
			return returnToTheCircleUndoneCampaign;
		}
		case KohakuCampaign.BrethrenOfAsh: {
			const { brethrenOfAshCampaign } = await import('$lib/campaign/boa/campaign');
			return brethrenOfAshCampaign;
		}
		case KohakuCampaign.ChildrenOfBlood: {
			const { childrenOfBloodCampaign } = await import('$lib/campaign/cob/campaign');
			return childrenOfBloodCampaign;
		}
		default:
			return undefined;
	}
}
