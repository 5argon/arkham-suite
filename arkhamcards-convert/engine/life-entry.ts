// The parts of arkham.life the converter writes records with, so the output follows life's own
// document operations and log codec. Resolved inside life/src/lib by build.mjs.
export {
	DATABASE_FORMAT_VERSION,
	addPlayer,
	createCampaign,
	createEmptyDatabase,
	createPlayGroup,
	rebakeManaged,
	setCampaignLinkedLogs,
	setCampaignLogs,
	setManualAchievement,
	toPlainDocument,
	updateCampaignGeneral
} from '$lib/database/document';
export {
	CROSSED_MARK,
	RESERVED,
	chaosBagEntries,
	makeEntry,
	partnerArgs,
	standalonesToEntries,
	toRecordedState,
	toSavePayload,
	withInterconnected
} from '$lib/campaign/records/recorded-state';
export { investigatorFromAhdbDeck } from '$lib/components/archive/edit/deck-records';
export { linkedTopicsFor } from '$lib/campaign/campaigns/tde-shared';
export { getCampaignLog } from '@5argon/arkham-campaign-data';
