/**
 * Finale prediction.
 *
 * From the table the cell brings to the Congress (recorded logs + board state), reconstruct the
 * Coterie vote exactly as the data models it: each `COTK.memberVotes` option carries an ordered
 * `voteTable` whose first matching row sets that member's vote. The tally (tie = yea) picks the
 * judgment via `COTK.judgment.*` in the data's `judgmentOrder`; the judgment fixes the finale
 * version and feeds the epilogue (`epilogueTally` + the recorded outcome).
 *
 * `finaleInsights` exposes the full reasoning behind that prediction (every member's vote and why,
 * the overthrow/join eligibility checks, and the Foundation-Trust / Cell-Deception tally lists) for
 * a UI that explains the ending instead of just naming it.
 */

import { computeDeception, computeTrust } from '../graph/state.js';
import { evalCondition, type FinaleContext } from '../graph/conditions.js';
import { getFile, loadLogic, metadata } from '../data/load.js';
import type { CampaignState, CharacterId, Condition, LogId, OptionId, Vote } from '../types.js';

export interface MemberVote {
	member: CharacterId;
	vote: Vote;
}

/** A member's vote plus why they cast it — for explaining the table, not just tallying it. */
export interface MemberVoteDetail extends MemberVote {
	/** The member voted their baseline (the `default` vote-table row matched — no log changed it). */
	isDefault: boolean;
	/** A flavour flag on the matched row (e.g. a coin flip, or a vote the cell was forced into). */
	note?: string;
	/** The campaign-log entry that set this non-default vote (best-effort; the first `recorded` in the row's condition). */
	viaLog?: LogId;
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

/** One of the two "you may…" finale paths the cell can choose when eligible. */
export type CoterieAttempt = 'overthrow' | 'join' | 'asset';

/** Whether the cell may pursue an `overthrow` / `join` ending, and which mandatory voters are missing. */
export interface CoteriePathCheck {
	/** `COTK.judgment.overthrow` | `COTK.judgment.join`. */
	judgment: OptionId;
	/** Members who must ALL vote nay for this path to open. */
	requiredNay: CharacterId[];
	/** Required members currently voting nay. */
	metNay: CharacterId[];
	/** Required members NOT voting nay (the ones blocking this path). */
	missingNay: CharacterId[];
	/** Nays strictly outnumber yeas overall (a tie is not a nay-win). */
	nayWins: boolean;
	/** `nayWins` AND every required member voted nay — the player may choose this path. */
	eligible: boolean;
}

/** One Foundation-Trust / Cell-Deception tally entry and whether the plan recorded it. */
export interface EpilogueCheck {
	log: LogId;
	met: boolean;
}

export interface FinaleInsights {
	prediction: FinalePrediction;
	/** Every Coterie member's predicted vote, with the reason it isn't their default. */
	members: MemberVoteDetail[];
	overthrow: CoteriePathCheck;
	join: CoteriePathCheck;
	/** The Foundation-Trust tally list (`trust` = count of `met`). */
	foundationTrust: EpilogueCheck[];
	/** The Cell-Deception tally list (`deception` = count of `met`). */
	cellDeception: EpilogueCheck[];
	/** The choices the player may make at the table when overthrow and/or join is open (plus `asset` = decline). Empty when the judgment is forced. */
	attemptOptions: CoterieAttempt[];
	/** The attempt the prediction used (read from the plan's assertions), if any. */
	attempt?: CoterieAttempt;
}

const DEFAULT_JUDGMENT_ORDER: OptionId[] = [
	'COTK.judgment.spared',
	'COTK.judgment.destroyed',
	'COTK.judgment.overthrow',
	'COTK.judgment.join',
	'COTK.judgment.asset',
	'COTK.judgment.liability',
];

const OVERTHROW: OptionId = 'COTK.judgment.overthrow';
const JOIN: OptionId = 'COTK.judgment.join';

/** Plan assertion prefix carrying the player's "you may overthrow/join" choice (e.g. `finaleAttempt:join`). */
export const COTERIE_ATTEMPT_PREFIX = 'finaleAttempt:';

/** Build the plan assertion string for a finale attempt choice. */
export function coterieAttemptAssertion(a: CoterieAttempt): string {
	return COTERIE_ATTEMPT_PREFIX + a;
}

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

/** The player's finale attempt, read from the plan's asserted board states. */
function readAttempt(state: CampaignState): CoterieAttempt | undefined {
	for (const b of state.boardStates) {
		if (!b.startsWith(COTERIE_ATTEMPT_PREFIX)) continue;
		const v = b.slice(COTERIE_ATTEMPT_PREFIX.length);
		if (v === 'overthrow' || v === 'join' || v === 'asset') return v;
	}
	return undefined;
}

/**
 * Judgment priority adjusted for the player's "you may" choice. `asset` drops the overthrow/join
 * options entirely (the cell declines, staying an asset); `join` promotes join above overthrow; the
 * default keeps the data order (overthrow before join, the game's automatic preference).
 */
function orderForAttempt(base: OptionId[], attempt: CoterieAttempt | undefined): OptionId[] {
	if (attempt === 'asset') return base.filter((j) => j !== OVERTHROW && j !== JOIN);
	if (attempt === 'join') {
		const out: OptionId[] = [];
		for (const j of base) {
			if (j === JOIN) continue; // inserted right before overthrow below
			if (j === OVERTHROW) {
				out.push(JOIN, OVERTHROW);
				continue;
			}
			out.push(j);
		}
		return out;
	}
	return base;
}

/** First `recorded` log referenced anywhere in a condition tree (for "this vote came from <log>"). */
function firstLog(c: Condition | null | undefined): LogId | undefined {
	if (!c) return undefined;
	if (c.recorded) return c.recorded;
	for (const arr of [c.all, c.any]) if (arr) for (const x of arr) {
		const l = firstLog(x);
		if (l) return l;
	}
	if (c.not) return firstLog(c.not);
	return undefined;
}

/** Resolve every member's vote (the first matching `voteTable` row wins; later options overwrite). */
function computeVotes(state: CampaignState): { details: MemberVoteDetail[]; fin: FinaleContext } {
	const finale = getFile(metadata().finaleFile);
	const memberVotes = finale?.decisions.find((d) => d.decisionId === 'COTK.memberVotes');
	const map = new Map<CharacterId, MemberVoteDetail>();
	for (const opt of memberVotes?.options ?? []) {
		const row = (opt.voteTable ?? []).find((r) => evalCondition(r.when, state));
		if (!row) continue;
		const isDefault = row.when?.default === true;
		const viaLog = isDefault ? undefined : firstLog(row.when);
		for (const [member, vote] of Object.entries(row.votes)) map.set(member, { member, vote, isDefault, note: row.note, viaLog });
	}
	const details = [...map.values()];
	const nay = details.filter((d) => d.vote === 'nay').length;
	const yea = details.filter((d) => d.vote === 'yea').length;
	const silent = details.filter((d) => d.vote === 'silent').length;
	const fin: FinaleContext = { votedNay: new Set(details.filter((d) => d.vote === 'nay').map((d) => d.member)), nayWins: nay > yea, silentCount: silent };
	return { details, fin };
}

/** Predict the finale from the state the cell brings to the Congress. */
export function predictFinale(state: CampaignState): FinalePrediction {
	const { details, fin } = computeVotes(state);
	const votes: MemberVote[] = details.map(({ member, vote }) => ({ member, vote }));
	const count = (v: Vote) => details.filter((x) => x.vote === v).length;
	const yea = count('yea');
	const nay = count('nay');
	const abstain = count('abstain');
	const silent = count('silent');
	const nayWins = fin.nayWins;

	// Judgment: first option in the (attempt-adjusted) priority order whose condition holds.
	const finale = getFile(metadata().finaleFile);
	const judgmentDecision = finale?.decisions.find((d) => d.decisionId === 'COTK.judgment');
	let judgment: OptionId = 'COTK.judgment.liability';
	for (const jid of orderForAttempt(judgmentOrder(), readAttempt(state))) {
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

/** The members a judgment option requires to all vote nay (its `votedNay` clause), if any. */
function requiredNayFor(judgmentId: OptionId): CharacterId[] {
	const finale = getFile(metadata().finaleFile);
	const o = finale?.decisions.find((d) => d.decisionId === 'COTK.judgment')?.options.find((x) => x.id === judgmentId);
	const clauses = o?.conditionLogic?.all ?? (o?.conditionLogic?.votedNay ? [o.conditionLogic] : []);
	return clauses.map((c) => c.votedNay).find((v): v is CharacterId[] => Array.isArray(v)) ?? [];
}

/** One way a member's vote can move off their default, and what causes it. */
export interface VoteTransition {
	/** The vote the member casts when this transition's trigger is met. */
	toVote: Vote;
	/** Recorded campaign-log entries (any one) that produce this vote. */
	triggerLogs: LogId[];
	/** Non-log triggers (board outcomes like `desiReal`) that also produce it, when any. */
	boardStates?: string[];
	/** A flavour flag on the producing row (coin flip, forced vote). */
	note?: string;
}

/** A Coterie member's baseline vote and every way the campaign can change it. */
export interface CoterieMemberVotes {
	member: CharacterId;
	/** The baseline vote (the `default` vote-table row); `absent` when the member only votes under a condition. */
	defaultVote: Vote | 'absent';
	/** Distinct non-default votes the member can reach, each with its triggers. */
	transitions: VoteTransition[];
}

function collectInto(c: Condition | null | undefined, logs: Set<LogId>, board: Set<string>): void {
	if (!c) return;
	if (c.recorded) logs.add(c.recorded);
	if (c.scenarioState) board.add(c.scenarioState);
	for (const arr of [c.all, c.any]) if (arr) for (const x of arr) collectInto(x, logs, board);
	if (c.not) collectInto(c.not, logs, board);
}

/**
 * The complete Coterie vote reference, derived from the finale `voteTable` so it never drifts: for
 * every member, their default vote plus each way the campaign can move it (the recorded logs — and
 * any board outcomes — that trigger it). Independent of any plan; a consumer counts how often a
 * transition's `triggerLogs` appear across recorded campaigns to tally "times the vote was changed".
 */
export function coterieVoteGuide(): CoterieMemberVotes[] {
	const finale = getFile(metadata().finaleFile);
	const memberVotes = finale?.decisions.find((d) => d.decisionId === 'COTK.memberVotes');
	const order: CharacterId[] = [];
	const defaults = new Map<CharacterId, Vote>();
	const trans = new Map<CharacterId, Map<Vote, { logs: Set<LogId>; board: Set<string>; note?: string }>>();

	for (const opt of memberVotes?.options ?? []) {
		for (const row of opt.voteTable ?? []) {
			const isDefault = row.when?.default === true;
			const logs = new Set<LogId>();
			const board = new Set<string>();
			if (!isDefault) collectInto(row.when, logs, board);
			for (const [member, vote] of Object.entries(row.votes) as [CharacterId, Vote][]) {
				if (!order.includes(member)) order.push(member);
				if (isDefault) {
					defaults.set(member, vote);
					continue;
				}
				const mt = trans.get(member) ?? new Map();
				const cur = mt.get(vote) ?? { logs: new Set<LogId>(), board: new Set<string>() };
				for (const l of logs) cur.logs.add(l);
				for (const b of board) cur.board.add(b);
				if (row.note && !cur.note) cur.note = row.note;
				mt.set(vote, cur);
				trans.set(member, mt);
			}
		}
	}

	return order.map((member) => {
		const defaultVote: Vote | 'absent' = defaults.get(member) ?? 'absent';
		const transitions: VoteTransition[] = [];
		for (const [toVote, info] of trans.get(member) ?? new Map()) {
			if (toVote === defaultVote) continue; // an alternative row that lands on the baseline isn't a change
			transitions.push({
				toVote,
				triggerLogs: [...info.logs],
				...(info.board.size ? { boardStates: [...info.board] } : {}),
				...(info.note ? { note: info.note } : {}),
			});
		}
		return { member, defaultVote, transitions };
	});
}

/** Full reasoning behind the finale prediction — votes + paths + epilogue tally lists. */
export function finaleInsights(state: CampaignState): FinaleInsights {
	const prediction = predictFinale(state);
	const { details, fin } = computeVotes(state);
	const nayVoters = new Set(details.filter((d) => d.vote === 'nay').map((d) => d.member));

	const pathCheck = (judgment: OptionId): CoteriePathCheck => {
		const requiredNay = requiredNayFor(judgment);
		const metNay = requiredNay.filter((m) => nayVoters.has(m));
		const missingNay = requiredNay.filter((m) => !nayVoters.has(m));
		return { judgment, requiredNay, metNay, missingNay, nayWins: fin.nayWins, eligible: fin.nayWins && missingNay.length === 0 };
	};
	const overthrow = pathCheck(OVERTHROW);
	const join = pathCheck(JOIN);

	const tally = loadLogic().epilogueTally;
	const foundationTrust: EpilogueCheck[] = tally.foundationTrust.map((log) => ({ log, met: state.recorded.has(log) }));
	const cellDeception: EpilogueCheck[] = tally.cellDeception.map((log) => ({ log, met: state.recorded.has(log) }));

	const attemptOptions: CoterieAttempt[] = [];
	if (overthrow.eligible) attemptOptions.push('overthrow');
	if (join.eligible) attemptOptions.push('join');
	if (attemptOptions.length) attemptOptions.push('asset');

	return { prediction, members: details, overthrow, join, foundationTrust, cellDeception, attemptOptions, attempt: readAttempt(state) };
}
