import { defineParams } from '@sveltejs/kit/params';
import { Campaign, strings } from '@5argon/arkham-kohaku';

const supportedCampaigns: Campaign[] = [
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
	Campaign.TheDrownedCity
];

function appleOrOrange(param: string): 'apple' | 'orange' | undefined {
	return param === 'apple' || param === 'orange' ? param : undefined;
}

export const params = defineParams({
	campaignCode: (param: string): string | undefined => {
		const supportedUrls = supportedCampaigns.map((c) => strings.campaignAbbreviation(c));
		return supportedUrls.includes(param) ? param : undefined;
	},
	cardId: appleOrOrange,
	investigatorId: appleOrOrange,
	standaloneCode: appleOrOrange
});
