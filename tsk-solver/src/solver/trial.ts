/**
 * Finale prediction.
 *
 * From the table the cell brings to the Congress (recorded logs + board state), reconstruct the
 * Coterie vote exactly as the data models it: each `COTK.memberVotes` option carries an ordered
 * `voteTable` whose first matching row sets that member's vote. The tally (tie = yea) picks the
 * judgment via `COTK.judgment.*` in the data's `judgmentOrder`; the judgment fixes the finale
 * version and feeds the epilogue (`epilogueTally` + the recorded outcome).
 */

import { computeDeception, computeTrust } from '../graph/state.js';
import { evalCondition, type FinaleContext } from '../graph/conditions.js';
import { getFile, loadLogic, metadata } from '../data/load.js';
import type { CampaignState, CharacterId, LogId, OptionId, Vote } from '../types.js';

export interface MemberVote {
	member: CharacterId;
	vote: Vote;
}

export interface FinalePrediction {
	votes: MemberVote[];
	yea: number;
	nay: number;
	abstain: number;
	silent: number;
	/** Nays strictly outnumber yeas (a tie counts as yea — the cell is disposed of). */
	nayWins: boolean;
	/** Winning judgment option id, e.g. `COTK.judgment.overthrow`. */
	judgment: OptionId;
	/** The campaign-log entry the judgment records (drives the version + epilogue). */
	judgmentLog?: LogId;
	/** Finale version played, e.g. `COTK.v2`. */
	version: OptionId;
	/** Epilogue outcome option id: `EP.joined` | `EP.permanent` | `EP.dismantled`. */
	epilogue: OptionId;
	/** Foundation-Trust / Cell-Deception tallies compared at the epilogue. */
	trust: number;
	deception: number;
}

const DEFAULT_JUDGMENT_ORDER: OptionId[] = [
	'COTK.judgment.spared',
	'COTK.judgment.destroyed',
	'COTK.judgment.overthrow',
	'COTK.judgment.join',
	'COTK.judgment.asset',
	'COTK.judgment.liability',
];

/**
 * The judgment → finale-version map. The data's `COTK.version` conditions key on the recorded
 * outcome, but `asset` and `spared` record the same log (`log.coterieSpared`) while mapping to
 * different versions, so we resolve the version from the (unambiguous) judgment instead.
 */
const JUDGMENT_TO_VERSION: Record<string, OptionId> = {
	'COTK.judgment.liability': 'COTK.v1',
	'COTK.judgment.asset': 'COTK.v2',
	'COTK.judgment.overthrow': 'COTK.v2',
	'COTK.judgment.join': 'COTK.v2',
	'COTK.judgment.spared': 'COTK.v3',
	'COTK.judgment.destroyed': 'COTK.v3',
};

function judgmentOrder(): OptionId[] {
	const schema = loadLogic()._schema as { judgmentOrder?: OptionId[] } | undefined;
	return schema?.judgmentOrder ?? DEFAULT_JUDGMENT_ORDER;
}

/** Predict the finale from the state the cell brings to the Congress. */
export function predictFinale(state: CampaignState): FinalePrediction {
	const finale = getFile(metadata().finaleFile);
	const memberVotes = finale?.decisions.find((d) => d.decisionId === 'COTK.memberVotes');

	const voteMap = new Map<CharacterId, Vote>();
	for (const opt of memberVotes?.options ?? []) {
		const row = (opt.voteTable ?? []).find((r) => evalCondition(r.when, state));
		if (row) for (const [member, vote] of Object.entries(row.votes)) voteMap.set(member, vote);
	}
	const votes: MemberVote[] = [...voteMap].map(([member, vote]) => ({ member, vote }));
	const count = (v: Vote) => votes.filter((x) => x.vote === v).length;
	const yea = count('yea');
	const nay = count('nay');
	const abstain = count('abstain');
	const silent = count('silent');
	const nayWins = nay > yea;
	const fin: FinaleContext = { votedNay: new Set(votes.filter((v) => v.vote === 'nay').map((v) => v.member)), nayWins, silentCount: silent };

	// Judgment: first option in the data's priority order whose condition holds.
	const judgmentDecision = finale?.decisions.find((d) => d.decisionId === 'COTK.judgment');
	let judgment: OptionId = 'COTK.judgment.liability';
	for (const jid of judgmentOrder()) {
		const o = judgmentDecision?.options.find((x) => x.id === jid);
		if (o && evalCondition(o.conditionLogic, state, fin)) {
			judgment = jid;
			break;
		}
	}
	const judgmentRecord = judgmentDecision?.options.find((o) => o.id === judgment)?.effects.find((e) => e.type === 'record');
	const judgmentLog = judgmentRecord && 'entryId' in judgmentRecord ? judgmentRecord.entryId : undefined;
	const version = JUDGMENT_TO_VERSION[judgment] ?? 'COTK.v1';

	// Epilogue: trust/deception tallies (+ the recorded outcome) decide which EP option fires.
	const trust = computeTrust(state.recorded);
	const deception = computeDeception(state.recorded);
	const recorded = new Set(state.recorded);
	if (judgmentLog) recorded.add(judgmentLog);
	const tallies = new Map(state.tallies);
	tallies.set('log.foundationTrust', trust);
	tallies.set('log.cellDeception', deception);
	const epState: CampaignState = { ...state, recorded, tallies };
	const epDecision = getFile('Epilogue')?.decisions[0];
	const epilogue = epDecision?.options.find((o) => evalCondition(o.conditionLogic, epState, fin))?.id ?? epDecision?.options[0]?.id ?? 'EP.dismantled';

	return { votes, yea, nay, abstain, silent, nayWins, judgment, judgmentLog, version, epilogue, trust, deception };
}
