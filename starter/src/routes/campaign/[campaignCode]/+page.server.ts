import { u as stringUtils } from '@5argon/arkham-string';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { Campaign as KohakuCampaign } from '@5argon/arkham-kohaku';
import { loadCampaign } from '$lib/campaign/load-campaign';

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
		rttcu: KohakuCampaign.ReturnToTheCircleUndone,
		boa: KohakuCampaign.BrethrenOfAsh,
		cob: KohakuCampaign.ChildrenOfBlood
	};

	const kohakuCampaign = urlToKohakuCampaign[campaignCode];
	if (!kohakuCampaign) {
		throw error(404, 'KohakuCampaign not found');
	}

	const campaignData = await loadCampaign(kohakuCampaign);
	if (!campaignData) {
		throw error(501, 'Campaign data not yet implemented');
	}

	return {
		kohakuCampaign: kohakuCampaign,
		backName: stringUtils.campaignName(kohakuCampaign),
		campaignData: campaignData
	};
};
