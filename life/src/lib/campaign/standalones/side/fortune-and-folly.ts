/** Fortune and Folly: the heist's completed tasks against the rewards they unlock, the stakeout, and how the night ended. */
import { choiceNumber, tallyPlays, tallyValues, type Play } from '../../records/play';
import type { Tally } from '../../utils/tally';
import { defineStandalonePage } from '../define';
import type { StandaloneRules } from '../rules';

const S = 'fortune_and_folly_part_1';

export const FOF_ISAMARA_CODE = '88044';
export const FOF_DECK_OF_POSSIBILITIES_CODE = '88043';
/** Completed tasks that earn Isamara Ordoñez (when she is in play) and the Deck of Possibilities. */
export const FOF_ISAMARA_TASKS = 5;
export const FOF_DECK_TASKS = 6;

/** Part I's tasks, recorded at the checkpoint when the heist is played later. */
export const FOF_STAKEOUT_TASKS = [
	'found_a_vent',
	'impersonated_a_high_roller',
	'convinced_isamara',
	'obtained_an_uniform',
	'stole_keys',
	'cleaned_out_the_house'
] as const;

const skipped = (p: Play) =>
	p.choice(S, 'ask_skip_part_1') === 'skip' || p.has('hidden.fof_skip_part_1');

/** The tasks Part II's rewards count: skipping the stakeout adds 2. */
export function fofTasks(p: Play): number | undefined {
	const n = choiceNumber(p, S, 'completed_tasks');
	return n == null ? undefined : n + (skipped(p) ? 2 : 0);
}

export const FOF_RULES: StandaloneRules = {
	scenario: S,
	prefix: 'fof',
	endings: [
		{ id: 'wellspring', kind: 'win', resolutions: ['R1'], code: '88045' },
		{ id: 'empty_handed', kind: 'loss', resolutions: ['R2'], code: '88047a' },
		{ id: 'left_behind', kind: 'loss', resolutions: ['R3'], code: '88034b' },
		{ id: 'defeated', kind: 'loss', resolutions: ['no_resolution'] }
	],
	cards: [
		{
			code: FOF_ISAMARA_CODE,
			earned: (p) =>
				(fofTasks(p) ?? 0) >= FOF_ISAMARA_TASKS && p.choice(S, 'ask_isamara_in_play') === 'yes'
		},
		{ code: FOF_DECK_OF_POSSIBILITIES_CODE, earned: (p) => (fofTasks(p) ?? 0) >= FOF_DECK_TASKS }
	]
};

export const buildFortuneAndFolly = defineStandalonePage(FOF_RULES, (plays) => {
	const stakeout = {} as Record<(typeof FOF_STAKEOUT_TASKS)[number], Tally>;
	for (const t of FOF_STAKEOUT_TASKS)
		stakeout[t] = tallyPlays(plays, (p) => p.has(`fof_${t}`) || p.has(`hidden.fof_${t}`));
	return {
		/** Plays per completed-task count, with the stakeout's 2 added when it was skipped. */
		tasks: tallyValues(plays, fofTasks),
		skippedStakeout: tallyPlays(plays, skipped),
		stakeout,
		needTimeToRest: tallyPlays(
			plays,
			(p) => p.has('fof_need_time_to_rest') || p.has('hidden.fof_need_time_to_rest')
		)
	};
});
