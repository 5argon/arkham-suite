/**
 * Finale Trial prediction (README §7), implemented from the campaign guide's Trial-1
 * voting rules (guide §"The Trial 1 — The Vote"). Each Coterie member votes yea
 * (dispose of the cell), nay (keep it safe), abstains, or is eerily silent; the tally
 * plus a couple of override checks decides the Trial branch and epilogue.
 */

import type { FlagId } from '../types.js';

type Vote = 'yea' | 'nay' | 'abstain' | 'silent';

export interface TrialPrediction {
	/** Trial branch number (2..7). */
	trial: number;
	/** Stable key, e.g. `trial_4`. */
	branch: string;
	yea: number;
	nay: number;
	silent: number;
	/** Epilogue: joining the Coterie (Trial 4) → agreed_to_work_together (Epilogue 2); otherwise
	 *  Trust ≥ Deception → permanent_position (Epilogue 4) or dismantled (Epilogue 5). */
	epilogue: 'agreed_to_work_together' | 'permanent_position' | 'dismantled';
}

interface MemberVote {
	member: string;
	vote: Vote;
}

/**
 * The per-member vote vector (guide §"The Trial 1"). Returning labeled votes — rather than a
 * bare list — keeps the yea/nay/silent tally and the overthrow/join override checks reading from
 * a single source of truth, and is robust to the variable number of co-voters (Beast, Razin
 * Farhi, the Sanguine Watcher only vote in certain branches).
 */
function votesFor(flags: ReadonlySet<FlagId>): MemberVote[] {
	const has = (f: string) => flags.has(f);
	const v: MemberVote[] = [];
	const vote = (member: string, value: Vote) => v.push({ member, vote: value });

	// Claret Knight & Beast
	if (has('the_cell_aided_the_knight')) {
		vote('claret_knight', 'nay');
		vote('beast', 'abstain');
	} else if (has('the_cell_failed_to_fend_off_the_beast')) {
		vote('claret_knight', 'abstain');
		vote('beast', 'yea');
	} else if (has('havent_seen_the_last_of_the_claret_knight')) {
		vote('claret_knight', 'yea');
		vote('beast', 'yea');
	} else if (has('the_dogs_are_at_war')) {
		vote('claret_knight', 'abstain');
		vote('beast', 'abstain');
	} else {
		vote('claret_knight', 'nay');
		vote('beast', 'yea');
	}

	// Ece
	if (has('ece_trusts_the_cell')) vote('ece', 'nay');
	else if (has('ece_does_not_trust_the_cell')) vote('ece', 'abstain');
	else vote('ece', 'nay');

	// Amaranth (& Razin Farhi — a separate voter only when the lovers are reunited)
	if (has('the_lovers_are_reunited')) {
		vote('amaranth', 'yea');
		vote('razin_farhi', 'yea');
	} else if (has('havent_seen_the_last_of_amaranth')) vote('amaranth', 'yea');
	else if (has('amaranth_has_left_the_coterie')) vote('amaranth', 'abstain');
	else vote('amaranth', 'yea');

	// Thorne
	if (has('the_cell_made_a_deal_with_thorne')) vote('thorne', 'nay');
	else if (has('havent_seen_the_last_of_thorne')) vote('thorne', 'yea');
	else if (has('thorne_disappeared')) vote('thorne', 'silent');
	else vote('thorne', 'abstain');

	// Aliki
	if (has('aliki_is_on_your_side')) vote('aliki', 'nay');
	else if (has('havent_seen_the_last_of_aliki')) vote('aliki', 'silent');
	else vote('aliki', 'yea');

	// Red-Gloved Man — always silent
	vote('red_gloved_man', 'silent');

	// Desi
	if (has('desi_is_in_your_debt')) vote('desi', 'nay');
	else if (has('havent_seen_the_last_of_desi')) vote('desi', 'silent');
	else vote('desi', 'yea');

	// La Chica Roja & Sanguine Watcher
	if (has('havent_seen_the_last_of_the_sanguine_watcher')) {
		vote('la_chica_roja', 'nay');
		vote('sanguine_watcher', 'yea');
	} else if (has('the_sanguine_watchers_torment_continues')) {
		vote('la_chica_roja', 'nay');
		vote('sanguine_watcher', 'abstain');
	} else if (has('havent_seen_the_last_of_la_chica_roja')) {
		vote('la_chica_roja', 'abstain');
		vote('sanguine_watcher', 'yea');
	} else {
		vote('la_chica_roja', 'abstain');
		vote('sanguine_watcher', 'abstain');
	}

	// Abarran
	if (has('the_cell_meddled_in_abarrans_affairs')) vote('abarran', 'yea');
	else vote('abarran', 'abstain');

	// Tzu San Niang
	if (has('tzu_san_niang_is_under_your_sway')) vote('tzu_san_niang', 'abstain');
	else vote('tzu_san_niang', 'yea'); // has_you_under_her_sway / havent_seen / default

	// Tuwile Masai
	if (has('tuwile_masai_is_on_your_side')) vote('tuwile_masai', 'nay');
	else vote('tuwile_masai', 'yea');

	return v;
}

export interface TrialPlan {
	/** Flags the route must set (routed via their producers) to steer the Coterie vote to this branch. */
	required: FlagId[];
	/** Flags the route must NOT set (would trigger an override, break the coalition, or flip the tally). */
	forbidden: FlagId[];
}

/**
 * Routing plan for a requested Trial outcome (guide §"The Trial 1"; derbk "Scarlet Politics").
 *
 * Without this, `reach_ending` was a pure post-filter: the search never engineered the multi-member
 * nay votes a branch needs, so Trial 3/4/5 routes were rarely (if ever) found. Each plan turns a
 * branch into real routing: `required` flags become mandatory waypoints (routed via their producers),
 * `forbidden` flags become negative checks that prune branch-breaking options during the search.
 *
 * Coalitions (nays must also win the tally, so each plan adds reliable extra nays). Every required
 * flag is produced at an *unlocked* scenario reachable without the deep whistle/Without-a-Trace
 * chain, so the routes stay findable within the search budget:
 *  - Trial 3 (overthrow): La Chica Roja + Ece + Desi vote nay (+ Tuwile Masai for the tally).
 *  - Trial 4 (join): Thorne + Tuwile Masai + Claret Knight vote nay (+ Desi for the tally).
 *  - Trial 5 (asset): nays win, but neither the overthrow nor the join coalition completes.
 *  - Trial 6: the cell uncovers the Coterie's true nature (override).
 *  - Trial 7: 3+ members fall eerily silent (Red-Gloved Man + Thorne + Desi) (override).
 *
 * Verified by exhaustive simulation: predictTrial(required) === branch for every plan, and for
 * Trials 3–7 the branch is stable under *any* combination of additional routable flags (the
 * forbidden set blocks every swing). The post-hoc predictTrial filter in solve.ts remains the final
 * guarantee. Returns null for branches with no engineering plan.
 */
export function trialPlan(branch: string): TrialPlan | null {
	return TRIAL_PLANS[branch] ?? null;
}

/**
 * Trial branches that funnel into the same *physical* finale version (guide; catalog TRIALS):
 * v.I = liability(2), v.II = overthrow/join/asset(3/4/5), v.III = knows-truth/destroyed(6/7). A
 * finale `scenario_version` constraint accepts any branch in its group, not just one.
 */
const FINALE_GROUPS: readonly (readonly string[])[] = [
	['trial_2'],
	['trial_3', 'trial_4', 'trial_5'],
	['trial_6', 'trial_7'],
];

/** The set of Trial branches producing the same finale as `branch` (including itself). */
export function finaleBranchGroup(branch: string): string[] {
	return [...(FINALE_GROUPS.find((g) => g.includes(branch)) ?? [branch])];
}

/** Every Trial branch the campaign can end on (trial_2 … trial_7). */
export const ALL_FINALE_BRANCHES: readonly string[] = FINALE_GROUPS.flat();

const KNOWS_TRUTH = 'the_cell_knows_the_true_nature_of_the_coterie';
// Abarran has no routable producer today, so adding his "yea" flag is impossible — but listing it in
// the nay-coalition forbidden sets is free insurance against a future data edit introducing one.
const ABARRAN_YEA = 'the_cell_meddled_in_abarrans_affairs';

const TRIAL_PLANS: Record<string, TrialPlan> = {
	// Deemed a liability — the low-engagement default outcome. Only guard against the two overrides
	// (knowing the truth / eerie silence); forcing more would wrongly block an otherwise-valid route.
	trial_2: {
		required: [],
		forbidden: [KNOWS_TRUTH, 'thorne_disappeared', 'havent_seen_the_last_of_aliki', 'havent_seen_the_last_of_desi'],
	},
	trial_3: {
		required: ['the_sanguine_watchers_torment_continues', 'desi_is_in_your_debt', 'tuwile_masai_is_on_your_side'],
		forbidden: [
			'ece_does_not_trust_the_cell',
			'havent_seen_the_last_of_the_claret_knight',
			'havent_seen_the_last_of_the_sanguine_watcher',
			'havent_seen_the_last_of_thorne',
			'the_cell_failed_to_fend_off_the_beast',
			'the_lovers_are_reunited',
			'thorne_disappeared',
			ABARRAN_YEA,
			KNOWS_TRUTH,
		],
	},
	trial_4: {
		required: ['the_cell_made_a_deal_with_thorne', 'tuwile_masai_is_on_your_side', 'desi_is_in_your_debt'],
		forbidden: [
			'ece_does_not_trust_the_cell',
			'havent_seen_the_last_of_la_chica_roja',
			'havent_seen_the_last_of_the_claret_knight',
			'havent_seen_the_last_of_the_sanguine_watcher',
			'the_cell_failed_to_fend_off_the_beast',
			'the_dogs_are_at_war',
			'the_lovers_are_reunited',
			// Block the overthrow coalition (checked before join in predictTrial).
			'the_sanguine_watchers_torment_continues',
			ABARRAN_YEA,
			KNOWS_TRUTH,
		],
	},
	trial_5: {
		required: ['the_cell_aided_the_knight', 'desi_is_in_your_debt', 'tuwile_masai_is_on_your_side'],
		forbidden: [
			'ece_does_not_trust_the_cell',
			'havent_seen_the_last_of_la_chica_roja',
			'havent_seen_the_last_of_the_sanguine_watcher',
			'havent_seen_the_last_of_thorne',
			'the_lovers_are_reunited',
			'thorne_disappeared',
			// Block the overthrow coalition (La Chica Roja nay) and the join coalition (Thorne nay).
			'the_sanguine_watchers_torment_continues',
			'the_cell_made_a_deal_with_thorne',
			ABARRAN_YEA,
			KNOWS_TRUTH,
		],
	},
	trial_6: { required: [KNOWS_TRUTH], forbidden: [] },
	trial_7: {
		required: ['thorne_disappeared', 'havent_seen_the_last_of_desi'],
		forbidden: ['the_cell_made_a_deal_with_thorne', 'havent_seen_the_last_of_thorne', 'desi_is_in_your_debt', KNOWS_TRUTH],
	},
};

export function predictTrial(flags: ReadonlySet<FlagId>, trust: number, deception: number): TrialPrediction {
	const votes = votesFor(flags);
	const yea = votes.filter((x) => x.vote === 'yea').length;
	const nay = votes.filter((x) => x.vote === 'nay').length;
	const silent = votes.filter((x) => x.vote === 'silent').length;
	const by = new Map(votes.map((x) => [x.member, x.vote]));
	const votedNay = (member: string) => by.get(member) === 'nay';

	// Epilogue: joining the Coterie (Trial 4) records "the cell joined the Coterie" → Epilogue 2 (the
	// Foundation and Coterie work together). Every other ending → Epilogue 3 → Trust ≥ Deception decides
	// permanent_position (Epilogue 4) vs dismantled (Epilogue 5).
	const finish = (trial: number): TrialPrediction => ({
		trial,
		branch: `trial_${trial}`,
		yea,
		nay,
		silent,
		epilogue: trial === 4 ? 'agreed_to_work_together' : trust >= deception ? 'permanent_position' : 'dismantled',
	});

	// Override checks (guide: after the first vote group).
	if (flags.has('the_cell_knows_the_true_nature_of_the_coterie')) return finish(6);
	if (silent >= 3) return finish(7);

	if (nay <= yea) return finish(2); // tie or yeas win => liability

	// Nays win. The branch keys only on which named members voted nay (no extra exclusions);
	// both checks read the same vote vector as the tally above.
	const nayOverthrow = votedNay('la_chica_roja') && votedNay('ece') && votedNay('desi');
	const nayJoin = votedNay('thorne') && votedNay('tuwile_masai') && votedNay('claret_knight');

	if (nayOverthrow) return finish(3);
	if (nayJoin) return finish(4);
	return finish(5);
}
