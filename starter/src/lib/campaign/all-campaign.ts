import type { Campaign } from '$lib/core/campaign';

import { returnToTheDunwichLegacyCampaign, theDunwichLegacyCampaign } from './dwl/campaign';
import { edgeOfTheEarthCampaign } from './eote/campaign';
import { nightOfTheZealotCampaign, returnToTheNightOfTheZealotCampaign } from './notz/campaign';
import { returnToThePathToCarcosaCampaign, thePathToCarcosaCampaign } from './ptc/campaign';
import { returnToTheCircleUndoneCampaign, theCircleUndoneCampaign } from './tcu/campaign';
import { theDreamQuestCampaign, theWebOfDreamsCampaign } from './tde/campaign';
import { returnToTheForgottenAgeCampaign, theForgottenAgeCampaign } from './tfa/campaign';
import { theInnsmouthConspiracyCampaign } from './tic/campaign';
import { theScarletKeysCampaign } from './tsk/campaign';

/**
 * Order of this array reflects in the UI.
 */
export const allCampaigns: Campaign[] = [
	nightOfTheZealotCampaign,
	theDunwichLegacyCampaign,
	thePathToCarcosaCampaign,
	theForgottenAgeCampaign,
	theCircleUndoneCampaign,
	theDreamQuestCampaign,
	theWebOfDreamsCampaign,
	theInnsmouthConspiracyCampaign,
	edgeOfTheEarthCampaign,
	theScarletKeysCampaign,

	returnToTheNightOfTheZealotCampaign,
	returnToTheDunwichLegacyCampaign,
	returnToThePathToCarcosaCampaign,
	returnToTheForgottenAgeCampaign,
	returnToTheCircleUndoneCampaign
];
