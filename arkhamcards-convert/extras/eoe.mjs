/**
 * Edge of the Earth Extra choices ArkhamCards records somewhere other than a choose-one step.
 * See lib/extras.mjs for the context each function receives.
 */

const ROMAN = { 1: 'I', 2: 'II', 3: 'III' };

export const choices = {
	/** The version ArkhamCards set up is a hidden log entry, `city_of_the_elder_things_v<N>`. */
	'city_of_the_elder_things.city_version': ({ replay }) => {
		const hidden = replay.log.sections?.hidden?.entries ?? [];
		const entry = hidden.find((e) => /^city_of_the_elder_things_v\d$/.test(e.id));
		return entry ? ROMAN[entry.id.at(-1)] : undefined;
	}
};
