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
	/** Epilogue branch: permanent_position (trust >= deception) or dismantled. */
	epilogue: 'permanent_position' | 'dismantled';
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

export function predictTrial(flags: ReadonlySet<FlagId>, trust: number, deception: number): TrialPrediction {
	const votes = votesFor(flags);
	const yea = votes.filter((x) => x.vote === 'yea').length;
	const nay = votes.filter((x) => x.vote === 'nay').length;
	const silent = votes.filter((x) => x.vote === 'silent').length;
	const epilogue = trust >= deception ? 'permanent_position' : 'dismantled';
	const by = new Map(votes.map((x) => [x.member, x.vote]));
	const votedNay = (member: string) => by.get(member) === 'nay';

	const finish = (trial: number): TrialPrediction => ({ trial, branch: `trial_${trial}`, yea, nay, silent, epilogue });

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
