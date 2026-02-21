import { Boon, Ultimatum, Refraction, refractions, chapterOneCampaigns, chapterOneReturnToCampaigns, chapterTwoSmallCampaigns } from '@5argon/arkham-kohaku';
import type { PageLoad } from './$types';

export const prerender = false;

// Create a combined campaign order list for sorting
const campaignReleaseOrder = [...chapterOneCampaigns, ...chapterOneReturnToCampaigns, ...chapterTwoSmallCampaigns];

export const load: PageLoad = ({ url }) => {
	const ultimatums = Object.values(Ultimatum);
	const boons = Object.values(Boon);
	// Sort refractions by campaign release order
	const refractionsEnum = Object.values(Refraction).sort((a, b) => {
		const detailsA = refractions.find(r => r.refraction === a);
		const detailsB = refractions.find(r => r.refraction === b);
		if (!detailsA?.campaign) return 1;
		if (!detailsB?.campaign) return -1;
		const indexA = campaignReleaseOrder.indexOf(detailsA.campaign);
		const indexB = campaignReleaseOrder.indexOf(detailsB.campaign);
		return indexA - indexB;
	});
	
	const itemParam = url.searchParams.get('i');
	
	if (!itemParam) {
		return {
			initialTab: 'ultimatums' as const,
			initialIndex: 0
		};
	}
	
	// Check if it's an ultimatum
	const ultimatumIndex = ultimatums.indexOf(itemParam as Ultimatum);
	if (ultimatumIndex !== -1) {
		return {
			initialTab: 'ultimatums' as const,
			initialIndex: ultimatumIndex
		};
	}
	
	// Check if it's a boon
	const boonIndex = boons.indexOf(itemParam as Boon);
	if (boonIndex !== -1) {
		return {
			initialTab: 'boons' as const,
			initialIndex: boonIndex
		};
	}
	
	// Check if it's a refraction
	const refractionIndex = refractionsEnum.indexOf(itemParam as Refraction);
	if (refractionIndex !== -1) {
		return {
			initialTab: 'refractions' as const,
			initialIndex: refractionIndex
		};
	}
	
	// Default fallback
	return {
		initialTab: 'ultimatums' as const,
		initialIndex: 0
	};
};
