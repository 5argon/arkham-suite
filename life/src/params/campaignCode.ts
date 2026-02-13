import type { ParamMatcher } from '@sveltejs/kit';
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

export const match = ((param: string): boolean => {
	const supportedUrls = supportedCampaigns.map((c) => strings.campaignAbbreviation(c));
	return supportedUrls.includes(param);
}) satisfies ParamMatcher;
