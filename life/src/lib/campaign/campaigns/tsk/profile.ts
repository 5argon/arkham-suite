/** The Scarlet Keys aggregate: routes, the Coterie vote, the chaos bag, the Keys and per-scenario tallies. */
import { achievementsFor, getCampaignLog, isCleared } from '@5argon/arkham-campaign-data';
import { playEarned } from '../../achievements/achievement-aggregate';
import { countNotes, tallyNotes, tallyPlays, type Play } from '../../records/play';
import { bumpCount, bumpTally, emptyTally, ensureTally, mergeTally, recentFirst, type Tally } from '../../utils/tally';
import { defineCampaignBuilder } from '../define';
import {
	bagActDetected,
	bagOverflowXp,
	congressJudgment,
	congressVersionForJudgment,
	crossedOff,
	keyObtainedFromScenario,
	tallyEntryPresent,
	TSK_BAG_ACTS,
	TSK_CELL_DECEPTION,
	TSK_FOUNDATION_TRUST,
	TSK_KEY_SCENARIOS
} from './rules';
import { coterieAllyMembers, coterieEnemyMembers, coterieVoteRows, scenarioVersionFromLogs } from './solver';

/** The achievements the Successful Routes widget finds a route for, in display order. */
export const TSK_ROUTE_ACHIEVEMENTS = [
	'red_looks_good',
	'bloody_red',
	'speed_demon',
	'trust_nobody',
	'trust_everybody',
	'badge'
] as const;

/** A scenario stop on a route with the tier played. */
export interface RouteStep {
	scenarioId: string;
	level?: string;
	version?: string;
	/** Congress of the Keys: the finale version its trial judgment led to. */
	finaleVersion?: string;
}

/** The scenarios one campaign played, in order. */
export interface TskRoute {
	steps: RouteStep[];
	/** Time passed at the end (the `time` counter); null if unrecorded. */
	time: number | null;
	finishDate: number | null;
}

export interface TskRouteHighlights {
	/** The most recent winning route of each length, shortest first. */
	byLength: { length: number; route: TskRoute }[];
	/** Winning routes with the most / least time passed. */
	mostTime: TskRoute | null;
	leastTime: TskRoute | null;
	/** The most recent winning route that earned each of {@link TSK_ROUTE_ACHIEVEMENTS}. */
	achievements: { id: string; route: TskRoute | null }[];
}

/** One run's final Tablet / Elder Thing count and the XP it earned by adding to a full side. */
export interface TskBagRun {
	tablet: number;
	elderThing: number;
	bonusXp: number;
	route: TskRoute | null;
}

/** The trial with the biggest count in a category; a tie goes to the most recent play. */
export interface TskVoteHigh {
	count: number;
	route: TskRoute | null;
}

/** A Scarlet Key: plays where the cell obtained it vs where the subject's own investigator bore it,
 *  and the latest bearer on each side. */
export interface TskKeyStat {
	id: string;
	obtained: Tally;
	borne: Tally;
	obtainedBearer: string | null;
	borneBearer: string | null;
}

/** The best Dead Heat run at a player count, ranked by `score`. */
export interface DeadHeatBestRun {
	players: number;
	/** Civilians in play: players + 1 at each of the 5 locations. */
	civilians: number;
	rescued: number;
	slain: number;
	/** rescued − slain, or rescued − 2 × slain. */
	score: number;
}

export interface TskErasedCard {
	code: string;
	finishDate: number | null;
}

export interface CampaignTsk {
	family: string;
	plays: number;
	/** Plays recording each Foundation Trust / Cell Deception entry, keyed by note id. */
	foundationTrustTally: Record<string, number>;
	cellDeceptionTally: Record<string, number>;
	/** The highest tallies, and the biggest lead of one side over the other, among runs that reached
	 *  the epilogue. */
	foundationTrustMax: number | null;
	cellDeceptionMax: number | null;
	maxTrustMargin: number | null;
	maxDeceptionMargin: number | null;
	epilogue: { permanent: number; dismantled: number };
	/** Plays making each chaos-bag swap, keyed by `BagAct.id`. */
	bagActCounts: Record<string, number>;
	/** Final-bag extremes: the most Tablet, the most Elder Thing, the fewest combined. */
	mostTabletRun: TskBagRun | null;
	mostElderThingRun: TskBagRun | null;
	leastCombinedRun: TskBagRun | null;
	/** Member → the vote they ended on → plays, among runs that reached the Congress. */
	voteTransitions: Record<string, Record<string, number>>;
	/** Members who fought the final battle alongside the cell (voted Nay) / against it. */
	finaleAllies: Record<string, Tally>;
	finaleEnemies: Record<string, Tally>;
	/** The biggest strictly positive Yea − Nay and Nay − Yea leads, and the most Eerily Silent. */
	voteHighs: { yeaOverNay: TskVoteHigh | null; nayOverYea: TskVoteHigh | null; silent: TskVoteHigh | null };
	/** Plays reaching each Congress judgment. */
	judgments: Record<string, Tally>;
	routeHighlights: TskRouteHighlights;
	/** Scenario → version or level id → the most recent route through the scenario on it. */
	variantRoutes: Record<string, Record<string, TskRoute>>;
	/** Scenario → the version its most recent run recorded. */
	recentVersion: Record<string, string>;
	/** Every Scarlet Key, in log-sheet order. */
	keys: TskKeyStat[];
	/** Key scenario → plays that took its Key, and plays whose resolution tells. */
	keyObtained: Record<string, { obtained: Tally; determinable: number }>;
	/** Tuwile Masai trusts the cell at Nairobi, or flees to Bermuda where he can be won back. */
	baleEngine: { obtained: Tally; nairobi: number; bermuda: number; fled: number; lost: number };
	/** Dr. Irawan: met in Perth, chased to New Guinea, won at Manokwari or vanished. */
	ruinousChime: { obtained: Tally; met: number; newGuinea: number; vanished: number };
	/** Delivery and architecture complete when their note is crossed off. */
	sideQuests: {
		delivery: { delivered: Tally; pickedUp: number };
		architecture: { completed: Tally; noticed: number };
		quidProQuo: { amaranth: number; desi: number };
		ruses: { wrongLeadsTotal: number; wrongLeadsMax: number };
	};
	/** The secret path to Without a Trace. */
	deadAndGone: { whistle: number; refusedWhistle: number; quinnVanished: number; offMission: number; enteredWaT: Tally };
	/** Sanguine Shadows' secret boss; `confronted` is both outcomes together. */
	sanguineWatcher: { tookDown: Tally; tormentContinues: Tally; confronted: Tally };
	/** Targets kept at Sanguine Shadows → runs and the most recent route. */
	sanguineTargets: Record<number, { runs: Tally; route: TskRoute | null }>;
	shadesOfSuffering: { tzuUnderYourSway: Tally; tzuHasYouUnderHerSway: Tally };
	/** `cellHollowed` counts only runs that never reached a Congress judgment. */
	withoutATrace: { knowsTrueNature: Tally; alikiOnYourSide: Tally; notSeenAliki: Tally; cellHollowed: Tally };
	dealings: { workedWithEce: number; deceivedEce: number; refusedEce: number };
	/** `deal` / `refused` are the Extra `raw_deal` choice. */
	onThinIce: { deal: number; refused: number; thorneDisappeared: number; neverHappened: number };
	/** Civilians from the Extra counters; the comparisons count plays that recorded both. */
	deadHeat: {
		rescuedOverSlain: number;
		rescuedOverDoubleSlain: number;
		slainOverRescued: number;
		slainOverDoubleRescued: number;
		mostRescued: number | null;
		leastSlain: number | null;
		loversReunited: number;
		bestByNet: DeadHeatBestRun[];
		bestByDouble: DeadHeatBestRun[];
	};
	/** The 10 most recent unique cards erased from existence (Dancing Mad / On Thin Ice). */
	erasedFromExistence: TskErasedCard[];
}

interface Run {
	p: Play;
	route: TskRoute | null;
	date: number;
	won: boolean;
	judgment: string | null;
	achievements: string[];
}

function routeOf(p: Play, judgment: string | null): TskRoute | null {
	const { rec } = p;
	const logs = rec.recorded.recordedLogs ?? new Set<string>();
	const tiers = rec.scenarioTiers ?? {};
	const finale = judgment ? congressVersionForJudgment(judgment) : null;
	const steps = (rec.route ?? []).map(
		(scenarioId): RouteStep => ({
			scenarioId,
			level: tiers[`${scenarioId}.level`],
			version: tiers[`${scenarioId}.version`] || scenarioVersionFromLogs(scenarioId, logs) || undefined,
			finaleVersion: scenarioId === 'congress_of_the_keys' && finale ? finale : undefined
		})
	);
	if (!steps.length) return null;
	return { steps, time: rec.recorded.logCounts?.['time'] ?? null, finishDate: rec.finishDate ?? null };
}

/** Newest first; ties keep play order. */
const byRecent = (runs: Run[]) => [...runs].sort((a, b) => b.date - a.date);

function routeHighlights(runs: Run[]): TskRouteHighlights {
	const won = byRecent(runs.filter((r) => r.won && r.route));
	const byLength = new Map<number, TskRoute>();
	for (const r of won) if (!byLength.has(r.route!.steps.length)) byLength.set(r.route!.steps.length, r.route!);
	const timed = won.map((r) => r.route!).filter((r) => r.time !== null);
	const pick = (better: (a: number, b: number) => boolean) =>
		timed.length ? timed.reduce((best, r) => (better(r.time!, best.time!) ? r : best)) : null;
	return {
		byLength: [...byLength].sort((a, b) => a[0] - b[0]).map(([length, route]) => ({ length, route })),
		mostTime: pick((a, b) => a > b),
		leastTime: pick((a, b) => a < b),
		achievements: TSK_ROUTE_ACHIEVEMENTS.map((id) => ({
			id,
			route: won.find((r) => r.achievements.includes(id))?.route ?? null
		}))
	};
}

function variantRoutes(runs: Run[]) {
	const routes: Record<string, Record<string, TskRoute>> = {};
	const recentVersion: Record<string, string> = {};
	for (const { route } of byRecent(runs)) {
		if (!route) continue;
		for (const s of route.steps) {
			for (const variant of [s.version, s.level]) if (variant) (routes[s.scenarioId] ??= {})[variant] ??= route;
			if (s.version) recentVersion[s.scenarioId] ??= s.version;
		}
	}
	return { variantRoutes: routes, recentVersion };
}

function epilogueTally(plays: Play[]) {
	const foundationTrustTally: Record<string, number> = {};
	const cellDeceptionTally: Record<string, number> = {};
	let foundationTrustMax: number | null = null;
	let cellDeceptionMax: number | null = null;
	let maxTrustMargin: number | null = null;
	let maxDeceptionMargin: number | null = null;
	const epilogue = countNotes(plays, {
		permanent: 'cell_was_given_a_permanent_position',
		dismantled: 'cell_was_dismantled'
	});
	for (const p of plays) {
		const ft = TSK_FOUNDATION_TRUST.filter((e) => tallyEntryPresent(p, e));
		const cd = TSK_CELL_DECEPTION.filter((e) => tallyEntryPresent(p, e));
		for (const e of ft) bumpCount(foundationTrustTally, e.id);
		for (const e of cd) bumpCount(cellDeceptionTally, e.id);
		if (!p.has('cell_was_given_a_permanent_position') && !p.has('cell_was_dismantled')) continue;
		foundationTrustMax = Math.max(foundationTrustMax ?? 0, ft.length);
		cellDeceptionMax = Math.max(cellDeceptionMax ?? 0, cd.length);
		maxTrustMargin = Math.max(maxTrustMargin ?? -Infinity, ft.length - cd.length);
		maxDeceptionMargin = Math.max(maxDeceptionMargin ?? -Infinity, cd.length - ft.length);
	}
	return {
		foundationTrustTally,
		cellDeceptionTally,
		foundationTrustMax,
		cellDeceptionMax,
		maxTrustMargin,
		maxDeceptionMargin,
		epilogue
	};
}

function chaosBag(runs: Run[]) {
	type Candidate = { run: TskBagRun; date: number; score: number };
	// Higher score wins, then more bonus XP, then the more recent play.
	const beats = (c: Candidate, cur: Candidate | null) =>
		!cur ||
		c.score > cur.score ||
		(c.score === cur.score && (c.run.bonusXp > cur.run.bonusXp || (c.run.bonusXp === cur.run.bonusXp && c.date >= cur.date)));
	const bagActCounts: Record<string, number> = {};
	let mostTablet: Candidate | null = null;
	let mostElder: Candidate | null = null;
	let leastCombined: Candidate | null = null;
	for (const { p, route, date } of runs) {
		const { recorded, scenarioChoices } = p.rec;
		const acts = TSK_BAG_ACTS.filter((a) =>
			bagActDetected(a, recorded.recordedLogs ?? new Set<string>(), recorded.crossedLogs, scenarioChoices)
		);
		for (const a of acts) bumpCount(bagActCounts, a.id);
		const bag = recorded.finalChaosBag;
		if (!bag || (bag['tablet'] === undefined && bag['elder_thing'] === undefined)) continue;
		const run: TskBagRun = {
			tablet: bag['tablet'] ?? 0,
			elderThing: bag['elder_thing'] ?? 0,
			bonusXp: bagOverflowXp(acts, p.rec.route ?? []),
			route
		};
		const tablet = { run, date, score: run.tablet };
		const elder = { run, date, score: run.elderThing };
		const least = { run, date, score: -(run.tablet + run.elderThing) };
		if (beats(tablet, mostTablet)) mostTablet = tablet;
		if (beats(elder, mostElder)) mostElder = elder;
		if (beats(least, leastCombined)) leastCombined = least;
	}
	return {
		bagActCounts,
		mostTabletRun: mostTablet?.run ?? null,
		mostElderThingRun: mostElder?.run ?? null,
		leastCombinedRun: leastCombined?.run ?? null
	};
}

/** Desi's vote needs the Congress Extra: the card flipped at the Trial shows the real Desi or an
 *  impostor. In his debt without that input is left uncounted. */
function desiVote(p: Play): string | undefined {
	const identity = p.choice('congress_of_the_keys', 'desi_identity');
	if (p.has('have_not_seen_the_last_of_desi') || identity === 'impostor') return 'silent';
	if (p.has('desi_is_in_your_debt')) return identity === 'real' ? 'nay' : undefined;
	return 'yea';
}

function coterieVote(runs: Run[]) {
	const members = new Map<string, { defaultVote: string; transitions: { toVote: string; keys: string[] }[] }>();
	for (const r of coterieVoteRows()) {
		const e = members.get(r.member) ?? { defaultVote: r.defaultVote, transitions: [] };
		if (!r.isDefault) e.transitions.push({ toVote: r.toVote, keys: r.triggerNoteKeys });
		members.set(r.member, e);
	}
	const allyIds = new Set(coterieAllyMembers().map((a) => a.member));
	const enemyIds = new Set(coterieEnemyMembers().map((a) => a.member));
	const voteTransitions: Record<string, Record<string, number>> = {};
	const finaleAllies: Record<string, Tally> = {};
	const finaleEnemies: Record<string, Tally> = {};
	const judgments: Record<string, Tally> = {};
	type High = TskVoteHigh & { date: number };
	const highs: Record<'yeaOverNay' | 'nayOverYea' | 'silent', High | null> = { yeaOverNay: null, nayOverYea: null, silent: null };
	const consider = (key: keyof typeof highs, count: number, route: TskRoute | null, date: number) => {
		const cur = highs[key];
		if (count > 0 && (!cur || count > cur.count || (count === cur.count && date >= cur.date)))
			highs[key] = { count, route, date };
	};

	for (const { p, route, date, judgment } of runs) {
		if (!judgment) continue;
		bumpTally(ensureTally(judgments, judgment), p.tier);
		const votes = { yea: 0, nay: 0, silent: 0 };
		for (const [member, info] of members) {
			const vote =
				member === 'desi'
					? desiVote(p)
					: (info.transitions.find((t) => t.keys.some((k) => p.has(k)))?.toVote ?? info.defaultVote);
			// Razin Farhi's `absent` default: he votes only when a transition fires.
			if (!vote || vote === 'absent') continue;
			bumpCount((voteTransitions[member] ??= {}), vote);
			if (vote === 'yea') votes.yea += 1;
			if (vote === 'nay') votes.nay += 1;
			if (vote === 'silent') votes.silent += 1;
			if (vote === 'yea' && enemyIds.has(member)) bumpTally(ensureTally(finaleEnemies, member), p.tier);
			if (vote === 'nay' && allyIds.has(member)) bumpTally(ensureTally(finaleAllies, member), p.tier);
		}
		if (enemyIds.has('redGlovedMan')) bumpTally(ensureTally(finaleEnemies, 'redGlovedMan'), p.tier);
		// Abstain counts for neither side, lowering both leads.
		consider('yeaOverNay', votes.yea - votes.nay, route, date);
		consider('nayOverYea', votes.nay - votes.yea, route, date);
		consider('silent', votes.silent, route, date);
	}
	const strip = (h: High | null): TskVoteHigh | null => (h ? { count: h.count, route: h.route } : null);
	return {
		voteTransitions,
		finaleAllies,
		finaleEnemies,
		judgments,
		voteHighs: { yeaOverNay: strip(highs.yeaOverNay), nayOverYea: strip(highs.nayOverYea), silent: strip(highs.silent) }
	};
}

function scarletKeys(plays: Play[], keyIds: string[]) {
	const keys: TskKeyStat[] = keyIds.map((id) => ({
		id,
		obtained: emptyTally(),
		borne: emptyTally(),
		obtainedBearer: null,
		borneBearer: null
	}));
	const byId = new Map(keys.map((k) => [k.id, k]));
	const obtainedDate: Record<string, number> = {};
	const borneDate: Record<string, number> = {};
	for (const p of plays) {
		const date = p.rec.finishDate ?? 0;
		const own = new Set(p.rec.subjectInvestigators ?? []);
		for (const [keyId, bearers] of Object.entries(p.rec.scarletKeyBearers ?? {})) {
			const k = byId.get(keyId);
			if (!k) continue;
			bumpTally(k.obtained, p.tier);
			if (date >= (obtainedDate[keyId] ?? -Infinity)) {
				obtainedDate[keyId] = date;
				k.obtainedBearer = bearers[bearers.length - 1] ?? null;
			}
			const mine = bearers.find((c) => own.has(c));
			if (!mine) continue;
			bumpTally(k.borne, p.tier);
			if (date >= (borneDate[keyId] ?? -Infinity)) {
				borneDate[keyId] = date;
				k.borneBearer = mine;
			}
		}
	}

	const keyObtained: CampaignTsk['keyObtained'] = {};
	for (const p of plays) {
		for (const { scenarioId } of TSK_KEY_SCENARIOS) {
			const got = keyObtainedFromScenario(p, scenarioId);
			if (got === null) continue;
			const k = (keyObtained[scenarioId] ??= { obtained: emptyTally(), determinable: 0 });
			k.determinable += 1;
			if (got) bumpTally(k.obtained, p.tier);
		}
	}
	return { keys, keyObtained };
}

function sanguineTargets(runs: Run[]) {
	const out: CampaignTsk['sanguineTargets'] = {};
	const latest: Record<number, number> = {};
	for (const { p, route, date } of runs) {
		// Recruiting La Chica Roja needs all six targets kept, and players stop counting once on that path.
		const raw = p.choice('sanguine_shadows', 'targets');
		const count = p.has('chica_roja_is_on_your_side') ? 6 : raw !== undefined && raw !== '' ? Number(raw) : NaN;
		if (!Number.isInteger(count)) continue;
		const e = (out[count] ??= { runs: emptyTally(), route: null });
		bumpTally(e.runs, p.tier);
		if (date >= (latest[count] ?? -Infinity)) {
			latest[count] = date;
			e.route = route;
		}
	}
	return out;
}

function deadHeat(plays: Play[]): CampaignTsk['deadHeat'] {
	const counter = (p: Play, id: string) => {
		const raw = p.choice('dead_heat', id);
		return raw && Number.isFinite(Number(raw)) ? Number(raw) : null;
	};
	const rescuedAll: number[] = [];
	const slainAll: number[] = [];
	const both: { rescued: number; slain: number; players: number | null }[] = [];
	for (const p of plays) {
		const rescued = counter(p, 'rescued_civilians');
		const slain = counter(p, 'slain_civilians');
		if (rescued !== null) rescuedAll.push(rescued);
		if (slain !== null) slainAll.push(slain);
		if (rescued !== null && slain !== null) both.push({ rescued, slain, players: p.rec.playerCount ?? null });
	}
	// Per player count, the highest score; a tie goes to more rescued, then to the earlier play.
	const best = (score: (r: { rescued: number; slain: number }) => number): DeadHeatBestRun[] => {
		const byPlayers = new Map<number, DeadHeatBestRun>();
		for (const r of both) {
			if (!r.players || r.players <= 0) continue;
			const cur = byPlayers.get(r.players);
			const s = score(r);
			if (!cur || s > cur.score || (s === cur.score && r.rescued > cur.rescued))
				byPlayers.set(r.players, { players: r.players, civilians: (r.players + 1) * 5, rescued: r.rescued, slain: r.slain, score: s });
		}
		return [...byPlayers.values()].sort((a, b) => a.players - b.players);
	};
	const count = (pred: (r: { rescued: number; slain: number }) => boolean) => both.filter(pred).length;
	return {
		rescuedOverSlain: count((r) => r.rescued > r.slain),
		rescuedOverDoubleSlain: count((r) => r.rescued > 2 * r.slain),
		slainOverRescued: count((r) => r.slain > r.rescued),
		slainOverDoubleRescued: count((r) => r.slain > 2 * r.rescued),
		mostRescued: rescuedAll.length ? Math.max(...rescuedAll) : null,
		leastSlain: slainAll.length ? Math.min(...slainAll) : null,
		loversReunited: plays.filter((p) => p.has('lovers_are_reunited')).length,
		bestByNet: best((r) => r.rescued - r.slain),
		bestByDouble: best((r) => r.rescued - 2 * r.slain)
	};
}

function erasedFromExistence(plays: Play[]): TskErasedCard[] {
	const latest: Record<string, number | null> = {};
	for (const p of plays) {
		const date = p.rec.finishDate ?? null;
		for (const code of p.rec.erasedCards ?? [])
			if (!(code in latest) || (date ?? 0) >= (latest[code] ?? 0)) latest[code] = date;
	}
	return recentFirst(
		Object.entries(latest).map(([code, finishDate]) => ({ code, finishDate })),
		10
	);
}

export const buildTsk = defineCampaignBuilder<CampaignTsk>('tskc', (plays, log) => {
	const routeAchievements = achievementsFor(log)
		.map((a) => a.def)
		.filter((d) => (TSK_ROUTE_ACHIEVEMENTS as readonly string[]).includes(d.id));
	const runs = plays.map((p): Run => {
		const recLog = getCampaignLog(p.rec.campaignCode);
		const judgment = congressJudgment(p);
		return {
			p,
			route: routeOf(p, judgment),
			date: p.rec.finishDate ?? 0,
			won: recLog ? isCleared(recLog, p.rec.recorded) === true : false,
			judgment,
			achievements: recLog ? routeAchievements.filter((d) => playEarned(d, p.rec, recLog)).map((d) => d.id) : []
		};
	});
	const count = (pred: (p: Play) => boolean) => plays.filter(pred).length;
	const keyIds = (log.db.sections.find((s) => s.id === 'keys')?.items ?? []).map((it) => it.id);
	const watcher = tallyNotes(plays, {
		tookDown: 'have_not_seen_the_last_of_the_sanguine_watcher',
		tormentContinues: 'sanguine_watchers_torment_continues'
	});
	const tuwileJoined = (p: Play) => p.has('tuwile_masai_is_on_your_side');
	const tuwileFled = (p: Play) => p.has('tuwile_masai_fled_to_bermuda');
	const wrongLeads = plays.map((p) => p.rec.recorded.logCounts?.['wrong_leads'] ?? 0);
	const rawDeal = (value: string) => count((p) => p.choice('on_thin_ice', 'raw_deal') === value);

	return {
		...epilogueTally(plays),
		...chaosBag(runs),
		...coterieVote(runs),
		routeHighlights: routeHighlights(runs),
		...variantRoutes(runs),
		...scarletKeys(plays, keyIds),
		baleEngine: {
			obtained: tallyPlays(plays, tuwileJoined),
			nairobi: count((p) => tuwileJoined(p) && !tuwileFled(p)),
			bermuda: count((p) => tuwileJoined(p) && tuwileFled(p)),
			fled: count(tuwileFled),
			lost: count((p) => tuwileFled(p) && !tuwileJoined(p))
		},
		ruinousChime: {
			obtained: tallyPlays(plays, (p) => p.has('dr_irawan_joined_the_cell')),
			...countNotes(plays, {
				met: 'cell_met_dr_irawan',
				newGuinea: 'dr_irawan_traveled_to_new_guinea',
				vanished: 'dr_irawan_vanished_from_existence'
			})
		},
		sideQuests: {
			delivery: {
				delivered: tallyPlays(plays, (p) => crossedOff(p, 'cell_is_delivering_foundation_intel')),
				pickedUp: count((p) => p.has('cell_is_delivering_foundation_intel'))
			},
			architecture: {
				completed: tallyPlays(plays, (p) => crossedOff(p, 'cell_appreciated_the_architecture')),
				noticed: count((p) => p.has('cell_appreciated_the_architecture'))
			},
			quidProQuo: countNotes(plays, { amaranth: 'cell_knows_amaranths_real_name', desi: 'cell_knows_desis_past' }),
			ruses: {
				wrongLeadsTotal: wrongLeads.reduce((a, b) => a + b, 0),
				wrongLeadsMax: Math.max(0, ...wrongLeads)
			}
		},
		deadAndGone: {
			...countNotes(plays, {
				whistle: 'cell_possesses_a_mysterious_whistle',
				refusedWhistle: 'cell_refused_alikis_offer',
				quinnVanished: 'agent_quinn_vanished_from_existence',
				offMission: 'cell_is_off_mission'
			}),
			enteredWaT: tallyPlays(plays, (p) => p.has('cell_blew_the_whistle') || p.has('cell_threw_away_the_whistle'))
		},
		sanguineWatcher: { ...watcher, confronted: mergeTally(watcher.tookDown, watcher.tormentContinues) },
		sanguineTargets: sanguineTargets(runs),
		shadesOfSuffering: tallyNotes(plays, {
			tzuUnderYourSway: 'tzu_san_niang_is_under_your_sway',
			tzuHasYouUnderHerSway: 'tzu_san_niang_has_you_under_her_sway'
		}),
		withoutATrace: {
			// Without a Trace is played before the Congress, which checks these notes but never records them.
			...tallyNotes(plays, {
				knowsTrueNature: 'cell_knows_the_true_nature_of_the_coterie',
				alikiOnYourSide: 'aliki_is_on_your_side',
				notSeenAliki: 'have_not_seen_the_last_of_aliki_zoni_uperetria'
			}),
			// The Congress can hollow the cell too; a Without a Trace hollowing ends the run before any judgment.
			cellHollowed: tallyPlays(plays, (p) => congressJudgment(p) === null && p.has('cell_was_hollowed'))
		},
		dealings: countNotes(plays, {
			workedWithEce: 'cell_is_working_with_ece',
			deceivedEce: 'cell_is_deceiving_ece',
			refusedEce: 'cell_refused_eces_offer'
		}),
		onThinIce: {
			deal: rawDeal('accept'),
			refused: rawDeal('reject'),
			...countNotes(plays, {
				thorneDisappeared: 'thorne_disappeared',
				neverHappened: 'nothing_of_note_in_anchorage'
			})
		},
		deadHeat: deadHeat(plays),
		erasedFromExistence: erasedFromExistence(plays)
	};
});
