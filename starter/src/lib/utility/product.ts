import { Product } from '@5argon/arkham-kohaku';

export function productToExploreRoute(product: Product): string {
	let url: string;
	switch (product) {
		case Product.TheDunwichLegacyInvestigatorExpansion:
			url = 'dwl';
			break;
		case Product.ThePathToCarcosaInvestigatorExpansion:
			url = 'ptc';
			break;
		case Product.TheForgottenAgeInvestigatorExpansion:
			url = 'tfa';
			break;
		case Product.TheCircleUndoneInvestigatorExpansion:
			url = 'tcu';
			break;
		case Product.TheDreamEatersInvestigatorExpansion:
			url = 'tde';
			break;
		case Product.TheInnsmouthConspiracyInvestigatorExpansion:
			url = 'tic';
			break;
		case Product.EdgeOfTheEarthInvestigatorExpansion:
			url = 'eote';
			break;
		case Product.TheScarletKeysInvestigatorExpansion:
			url = 'tsk';
			break;
		case Product.TheFeastOfHemlockValeInvestigatorExpansion:
			url = 'fhv';
			break;
		case Product.TheDrownedCityInvestigatorExpansion:
			url = 'tdc';
			break;
		default:
			url = product;
			break;
	}
	const urlNoUnderscore = url.replace(/_/g, '-');
	return urlNoUnderscore;
}
