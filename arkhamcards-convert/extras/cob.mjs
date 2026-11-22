/**
 * Children of Blood Extra choices ArkhamCards records somewhere other than a choose-one step.
 * See lib/extras.mjs for the context each function receives.
 */

const BLOOD_BLIGHT = '13118';
/** The Blood Money resolutions that check for The Blood Blight. */
const CHECKED_IN = new Set(['R1', 'R2']);

export const choices = {
	/**
	 * ArkhamCards evaluates this `has_card` condition itself: an investigator holds The Blood Blight
	 * among their story assets, wherever in the campaign they earned it.
	 */
	'blood_money.check_chosen_of_zburamoarte': ({ acId, replay }) => {
		if (!CHECKED_IN.has(replay.log.scenarioData?.[acId]?.resolution)) return undefined;
		const assets = replay.scenarios.find((s) => s.id === acId)?.assetsAfter ?? {};
		return Object.values(assets).some((list) => list.includes(BLOOD_BLIGHT)) ? 'yes' : 'no';
	}
};
