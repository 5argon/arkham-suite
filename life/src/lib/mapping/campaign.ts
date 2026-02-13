import { Campaign, strings } from '@5argon/arkham-kohaku';

export function campaignBoxImageUrl(campaign: Campaign): string {
	const abbreviation = strings.campaignAbbreviation(campaign);
	return `/image/expansion/campaign/${abbreviation}.webp`;
}

export function campaignColor(campaign: Campaign): string {
	switch (campaign) {
		case Campaign.NightOfTheZealot:
			return '#091832';
		case Campaign.TheDunwichLegacy:
			return '#02130a';
		case Campaign.ThePathToCarcosa:
			return '#100424';
		case Campaign.TheForgottenAge:
			return '#1c060f';
		case Campaign.TheCircleUndone:
			return '#000000';
		case Campaign.TheDreamQuest:
			return '#0b0816';
		case Campaign.TheWebOfDreams:
			return '#0b0816';
		case Campaign.TheInnsmouthConspiracy:
			return '#041815';
		case Campaign.EdgeOfTheEarth:
			return '#072029';
		case Campaign.TheScarletKeys:
			return '#210606';
		case Campaign.TheFeastOfHemlockVale:
			return '#3e2a08';
		case Campaign.TheDrownedCity:
			return '#151d06';
		case Campaign.ReturnToNightOfTheZealot:
			return '#091832';
		case Campaign.ReturnToTheDunwichLegacy:
			return '#02130a';
		case Campaign.ReturnToThePathToCarcosa:
			return '#100424';
		case Campaign.ReturnToTheForgottenAge:
			return '#1c060f';
		case Campaign.ReturnToTheCircleUndone:
			return '#000000';
		default:
			throw new Error('Unknown campaign:' + campaign);
	}
}
