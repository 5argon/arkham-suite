/**
 * Side-story Extra choices ArkhamCards records somewhere other than a choose-one step.
 * See lib/extras.mjs for the context each function receives.
 *
 * Input shapes in a guide's `guide_inputs`:
 * - `count`: `payload.count`.
 * - `decision`: `payload.decision`, a boolean. ArkhamCards saves a choose-one with a single choice
 *   this way, so its choice id stands for true.
 * - `string_choices`: `payload.choices`, `{ <id>: [<choice id>, …] }`: a checklist (`checked`), a
 *   card choice (`in_play`) or a per-investigator pick (keyed by investigator code).
 * - `choice`: `payload.choice`, the index of the picked choice.
 */

/** The last answer given at a step (or any of several steps). */
function last(inputs, ...steps) {
	return inputs.filter((i) => steps.includes(i.step)).at(-1);
}

/** A counter's value. */
function count(inputs, step) {
	const answer = last(inputs, step);
	return answer?.type === 'count' ? String(answer.payload?.count ?? 0) : undefined;
}

/** A single-choice prompt: `yes` (or the choice's own id) when answered true, `no` otherwise. */
function decision(inputs, step, yes = 'yes') {
	const answer = last(inputs, step);
	if (!answer) return undefined;
	if (answer.type === 'decision') return answer.payload?.decision ? yes : 'no';
	return answer.payload?.choice === 0 ? yes : 'no';
}

/** The keys of a `string_choices` answer whose list holds `value`, mapped and comma-joined. */
function keysWith(inputs, step, value, map = (k) => k) {
	const answer = last(inputs, step);
	if (answer?.type !== 'string_choices') return undefined;
	return Object.entries(answer.payload?.choices ?? {})
		.filter(([, list]) => list.includes(value))
		.map(([k]) => map(k))
		.join(',');
}

/** Every choice id of a per-investigator `string_choices` answer, without `none`, comma-joined. */
function picks(inputs, step) {
	const answer = last(inputs, step);
	if (answer?.type !== 'string_choices') return undefined;
	return Object.values(answer.payload?.choices ?? {})
		.flat()
		.filter((id) => id && id !== 'none')
		.join(',');
}

/** The choice id picked at a step: its exact step, not any step offering the same ids. */
function pickedAt(steps, inputs, pickedChoiceId, ...stepIds) {
	for (const id of stepIds.toReversed()) {
		const step = steps.get(id);
		const answer = last(inputs, id);
		if (step && answer) return pickedChoiceId(step, answer);
	}
	return undefined;
}

const hidden = (replay, id) => (replay.log.sections?.hidden?.entries ?? []).find((e) => e.id === id);

const FILM_PROPS = { telescope: '72005', staff: '72006', cape: '72007' };
const MTT_ASSETS = { tesla: '87014', graves: '87023', beam_machine: '87032' };
const MEOWLATHOTEP = {
	foul_stench: { foul_stench: 'slobbertown', bacon: 'snoutside' },
	bacon: { foul_stench: 'beasttown', bacon: 'tailside' }
};

export const choices = {
	/** Asked in Part II (`ask_completed_tasks`), which merges into the Fortune and Folly entry. */
	'fortune_and_folly_part_1.completed_tasks': ({ inputs }) => count(inputs, 'ask_completed_tasks'),
	/** Part I's prompt; a skipped Part I may not replay, so the hidden flag backs it up. */
	'fortune_and_folly_part_1.ask_skip_part_1': ({ inputs, replay }) =>
		decision(inputs, 'ask_skip_part_1', 'skip') ??
		(hidden(replay, 'fof_skip_part_1') ? 'skip' : hidden(replay, 'fof_play_part_1') ? 'no' : undefined),
	'fortune_and_folly_part_1.ask_isamara_in_play': ({ inputs }) => decision(inputs, 'ask_isamara_in_play'),

	'ttn.ask_control_aziza': ({ inputs }) => decision(inputs, 'ask_control_aziza'),

	/** Told the truth: believed when all three checks hold. Lied: when both hold. */
	'murder_at_the_excelsior_hotel.check_police_on_your_side': ({ inputs, steps, pickedChoiceId, replay }) => {
		const yes = (step) => last(inputs, step)?.payload?.decision === true;
		const how = pickedAt(steps, inputs, pickedChoiceId, 'choose_inspector_monroe');
		if (how === 'tell_truth')
			return yes('ask_did_not_cover_evidence') && yes('ask_have_clues') && yes('ask_no_innocents_killed') ? 'yes' : 'no';
		if (how === 'lie') return yes('ask_cleared_evidence') && yes('ask_no_innocents_killed') ? 'yes' : 'no';
		if (hidden(replay, 'meh_police_are_on_your_side')) return 'yes';
		if (hidden(replay, 'meh_police_dont_believe_you')) return 'no';
		return undefined;
	},
	'murder_at_the_excelsior_hotel.choose_lead_assets': ({ inputs }) =>
		keysWith(inputs, 'choose_lead_assets', 'in_play'),

	'blob_that_ate_everything.earn_assets': ({ inputs }) => keysWith(inputs, 'earn_assets', 'in_play'),
	'blob_that_ate_everything_else.earn_assets': ({ inputs }) => keysWith(inputs, 'earn_assets', 'in_play'),

	'film_fatale.ask_which_props': ({ inputs }) => {
		const answer = last(inputs, 'ask_which_props');
		if (answer?.type !== 'string_choices') return undefined;
		return Object.entries(answer.payload?.choices ?? {})
			.filter(([, list]) => list.length)
			.map(([k]) => FILM_PROPS[k])
			.filter(Boolean)
			.join(',');
	},
	'film_fatale.ask_made_their_call_time': ({ inputs }) =>
		decision(inputs, 'ask_made_their_call_time', 'cheat'),
	'film_fatale.ask_andre_patel': ({ inputs }) => decision(inputs, 'ask_andre_patel'),

	'the_midwinter_gala.choose_one_guest': ({ inputs }) => picks(inputs, 'choose_one_guest'),
	/** Entered as a final score, or tallied in the app into a hidden count. */
	'the_midwinter_gala.score': ({ inputs, replay }) => {
		const typed = count(inputs, 'ask_final_score');
		if (typed !== undefined) return typed;
		const tally = hidden(replay, 'tmg_score_tally');
		const n = tally?.count ?? tally?.number;
		return typeof n === 'number' ? String(n) : undefined;
	},

	'carnevale_of_horrors.choose_masks': ({ inputs }) => picks(inputs, 'choose_masks'),

	'read_or_die.ask_daisy_tomes': ({ inputs }) => count(inputs, 'ask_daisy_tomes'),
	'read_or_die.daisy_bad_swap': ({ inputs, steps, pickedChoiceId }) =>
		pickedAt(steps, inputs, pickedChoiceId, 'daisy_bad_swap'),
	'all_or_nothing.skids_bad_swap': ({ inputs, steps, pickedChoiceId }) =>
		pickedAt(steps, inputs, pickedChoiceId, 'skids_bad_swap'),
	'bad_blood.ask_agnes_memories': ({ inputs }) => count(inputs, 'ask_agnes_memories'),
	'bad_blood.agnes_bad_swap': ({ inputs, steps, pickedChoiceId }) =>
		pickedAt(steps, inputs, pickedChoiceId, 'agnes_bad_swap'),
	'by_the_book.ask_mr_grey': ({ inputs }) => decision(inputs, 'ask_mr_grey'),
	'red_tide_rising.ask_victory_cards': ({ inputs }) => count(inputs, 'ask_victory_cards'),
	'red_tide_rising.wendy_bad_swap': ({ inputs, steps, pickedChoiceId }) =>
		pickedAt(steps, inputs, pickedChoiceId, 'wendy_bad_swap', 'wendy_bad_swap_small'),
	'laid_to_rest.jim_bad_swap': ({ inputs, steps, pickedChoiceId }) =>
		pickedAt(steps, inputs, pickedChoiceId, 'jim_bad_swap'),
	'relics_of_the_past.earn_jack_xp': ({ inputs }) => count(inputs, 'earn_jack_xp'),

	'enthralling_encore.choose_reward_card': ({ inputs }) => keysWith(inputs, 'choose_reward', 'card'),
	'enthralling_encore.choose_punishment_card': ({ inputs }) =>
		keysWith(inputs, 'choose_punishment', 'card'),

	/** Two prompts that reuse the ids foul_stench and bacon; the pair names the district. */
	'meddling_of_meowlathotep.start_location': ({ inputs, steps, pickedChoiceId }) => {
		const scent = pickedAt(steps, inputs, pickedChoiceId, 'choose_scent_to_follow');
		if (!scent) return undefined;
		const next = pickedAt(
			steps,
			inputs,
			pickedChoiceId,
			scent === 'foul_stench' ? 'choose_confront_cat' : 'choose_food'
		);
		return next ? MEOWLATHOTEP[scent]?.[next] : undefined;
	},

	'machinations_through_time.ask_assets_in_play': ({ inputs }) =>
		keysWith(inputs, 'ask_assets_in_play', 'checked', (k) => MTT_ASSETS[k] ?? k)
};
