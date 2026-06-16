import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { Campaign as KohakuCampaign } from '@5argon/arkham-kohaku';
import type { Campaign } from '$lib/core/campaign';

export const load: PageServerLoad = async ({ params }) => {
	const campaignCode = params.campaignCode;

	const urlToKohakuCampaign: Record<string, KohakuCampaign> = {
		notz: KohakuCampaign.NightOfTheZealot,
		dwl: KohakuCampaign.TheDunwichLegacy,
		ptc: KohakuCampaign.ThePathToCarcosa,
		tfa: KohakuCampaign.TheForgottenAge,
		tcu: KohakuCampaign.TheCircleUndone,
		tdea: KohakuCampaign.TheDreamQuest,
		tdeb: KohakuCampaign.TheWebOfDreams,
		tic: KohakuCampaign.TheInnsmouthConspiracy,
		eote: KohakuCampaign.EdgeOfTheEarth,
		tsk: KohakuCampaign.TheScarletKeys,
		fhv: KohakuCampaign.TheFeastOfHemlockVale,
		tdc: KohakuCampaign.TheDrownedCity,
		rtnotz: KohakuCampaign.ReturnToNightOfTheZealot,
		rtdwl: KohakuCampaign.ReturnToTheDunwichLegacy,
		rtptc: KohakuCampaign.ReturnToThePathToCarcosa,
		rttfa: KohakuCampaign.ReturnToTheForgottenAge,
		rttcu: KohakuCampaign.ReturnToTheCircleUndone
	};

	const kohakuCampaign = urlToKohakuCampaign[campaignCode];
	if (!kohakuCampaign) {
		throw error(404, 'KohakuCampaign not found');
	}

	// Use dynamic imports for code splitting - each campaign becomes its own chunk
	let campaignData: Campaign;
	switch (kohakuCampaign) {
		case KohakuCampaign.NightOfTheZealot: {
			const { nightOfTheZealotCampaign } = await import('$lib/campaign/notz/campaign');
			campaignData = nightOfTheZealotCampaign;
			break;
		}
		case KohakuCampaign.TheDunwichLegacy: {
			const { theDunwichLegacyCampaign } = await import('$lib/campaign/dwl/campaign');
			campaignData = theDunwichLegacyCampaign;
			break;
		}
		case KohakuCampaign.ThePathToCarcosa: {
			const { thePathToCarcosaCampaign } = await import('$lib/campaign/ptc/campaign');
			campaignData = thePathToCarcosaCampaign;
			break;
		}
		case KohakuCampaign.TheForgottenAge: {
			const { theForgottenAgeCampaign } = await import('$lib/campaign/tfa/campaign');
			campaignData = theForgottenAgeCampaign;
			break;
		}
		case KohakuCampaign.TheCircleUndone: {
			const { theCircleUndoneCampaign } = await import('$lib/campaign/tcu/campaign');
			campaignData = theCircleUndoneCampaign;
			break;
		}
		case KohakuCampaign.TheDreamQuest: {
			const { theDreamQuestCampaign } = await import('$lib/campaign/tde/campaign');
			campaignData = theDreamQuestCampaign;
			break;
		}
		case KohakuCampaign.TheWebOfDreams: {
			const { theWebOfDreamsCampaign } = await import('$lib/campaign/tde/campaign');
			campaignData = theWebOfDreamsCampaign;
			break;
		}
		case KohakuCampaign.TheInnsmouthConspiracy: {
			const { theInnsmouthConspiracyCampaign } = await import('$lib/campaign/tic/campaign');
			campaignData = theInnsmouthConspiracyCampaign;
			break;
		}
		case KohakuCampaign.EdgeOfTheEarth: {
			const { edgeOfTheEarthCampaign } = await import('$lib/campaign/eote/campaign');
			campaignData = edgeOfTheEarthCampaign;
			break;
		}
		case KohakuCampaign.TheScarletKeys: {
			const { theScarletKeysCampaign } = await import('$lib/campaign/tsk/campaign');
			campaignData = theScarletKeysCampaign;
			break;
		}
		case KohakuCampaign.TheFeastOfHemlockVale: {
			const { theFeastOfHemlockValeCampaign } = await import('$lib/campaign/fhv/campaign');
			campaignData = theFeastOfHemlockValeCampaign;
			break;
		}
		case KohakuCampaign.TheDrownedCity: {
			const { theDrownedCityCampaign } = await import('$lib/campaign/tdc/campaign');
			campaignData = theDrownedCityCampaign;
			break;
		}
		case KohakuCampaign.ReturnToNightOfTheZealot: {
			const { returnToTheNightOfTheZealotCampaign } = await import('$lib/campaign/notz/campaign');
			campaignData = returnToTheNightOfTheZealotCampaign;
			break;
		}
		case KohakuCampaign.ReturnToTheDunwichLegacy: {
			const { returnToTheDunwichLegacyCampaign } = await import('$lib/campaign/dwl/campaign');
			campaignData = returnToTheDunwichLegacyCampaign;
			break;
		}
		case KohakuCampaign.ReturnToThePathToCarcosa: {
			const { returnToThePathToCarcosaCampaign } = await import('$lib/campaign/ptc/campaign');
			campaignData = returnToThePathToCarcosaCampaign;
			break;
		}
		case KohakuCampaign.ReturnToTheForgottenAge: {
			const { returnToTheForgottenAgeCampaign } = await import('$lib/campaign/tfa/campaign');
			campaignData = returnToTheForgottenAgeCampaign;
			break;
		}
		case KohakuCampaign.ReturnToTheCircleUndone: {
			const { returnToTheCircleUndoneCampaign } = await import('$lib/campaign/tcu/campaign');
			campaignData = returnToTheCircleUndoneCampaign;
			break;
		}
		default:
			throw error(501, 'Campaign data not yet implemented');
	}

	return {
		kohakuCampaign: kohakuCampaign,
		campaignData: campaignData
	};
};
