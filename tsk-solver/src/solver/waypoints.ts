/**
 * Constraint → requirements expansion (README §3.1, §4.2).
 *
 * Each input constraint expands into one or more `Requirement`s — a node (or set of
 * candidate nodes) plus a match predicate describing what the chosen stop option must
 * yield. Locked required nodes additionally pull in their unlock prerequisites
 * transitively, so the search and the time-floor see the full mandatory waypoint set.
 */

import { alliesById, getScenario, keysById, loadDatabase } from '../data/load.js';
import { flagProducers, stopOptions, type StopOption } from '../graph/model.js';
import type {
	AchievementId,
	AllyId,
	Constraint,
	FlagId,
	KeyId,
	LocalizedString,
	NodeId,
	ResId,
} from '../types.js';
import { getLocation } from '../data/load.js';

export type RequirementMatch =
	| { type: 'visit_node' }
	| { type: 'prologue' }
	| { type: 'finale' }
	| { type: 'key_investigator'; key: KeyId }
	| { type: 'key_any'; key: KeyId }
	| { type: 'resolution'; resolution: ResId }
	| { type: 'version'; version: string }
	| { type: 'ally'; ally: AllyId }
	| { type: 'flag'; flag: FlagId }
	| { type: 'asset'; asset: string }
	| { type: 'achievement'; achievement: AchievementId };

export interface Requirement {
	id: string;
	/** Candidate nodes; satisfying any one (with a matching option) satisfies it. */
	nodes: NodeId[];
	match: RequirementMatch;
	/** Index of the originating input constraint (for `satisfies`). -1 for structural. */
	constraintIndex: number;
	/** When true, the recipe must name the exact resolution (resolutionRequired). */
	specificResolution: boolean;
	reason?: LocalizedString;
}

/** A condition a route must NOT satisfy (from a negated constraint). */
export type NegativeCheck =
	| { kind: 'node'; node: NodeId }
	| { kind: 'key'; key: KeyId; investigatorOnly: boolean }
	| { kind: 'ally'; ally: AllyId }
	| { kind: 'resolution'; node: NodeId; resolution: ResId }
	| { kind: 'version'; node: NodeId; version: string }
	| { kind: 'flag'; flag: FlagId };

export interface ExpandedConstraints {
	requirements: Requirement[];
	timeCap?: number;
	scenarioCap?: number;
	forbiddenNodes: Set<NodeId>;
	negativeChecks: NegativeCheck[];
	desiredEnding?: string;
	difficultyExpert: boolean;
	logicalConflict?: { conflict: string; a: string; b: string };
	/** Nodes the search may stop at to satisfy mandatory goals + unlock prerequisites. */
	relevantNodes: Set<NodeId>;
}

const reason = (id: string, params: Record<string, string | number> = {}): LocalizedString => ({ id, params });

/** Candidate nodes (and whether investigator-bearer is possible) for obtaining a key. */
function keyCandidateNodes(key: KeyId, investigatorOnly: boolean): NodeId[] {
	const nodes = new Set<NodeId>();
	for (const loc of loadDatabase().locations) {
		for (const opt of stopOptions(loc.id)) {
			const grantsToInvestigator = opt.grantsKey === key; // interlude grants always to investigator
			const resKeyMatch = opt.key === key && !opt.noResolution;
			if (grantsToInvestigator || resKeyMatch) {
				if (investigatorOnly) {
					if (grantsToInvestigator || opt.bearer === 'investigator' || opt.bearer === 'conditional') {
						nodes.add(loc.id);
					}
				} else {
					nodes.add(loc.id);
				}
			}
		}
	}
	return [...nodes].sort();
}

/** Map an ally to its recruitment node candidates. */
function allyCandidateNodes(ally: AllyId): NodeId[] {
	const nodes = new Set<NodeId>();
	for (const loc of loadDatabase().locations) {
		for (const opt of stopOptions(loc.id)) {
			if (opt.grantsAllies.includes(ally)) nodes.add(loc.id);
		}
	}
	return [...nodes].sort();
}

/**
 * Add the unlock prerequisites for a (possibly locked) node as flag requirements,
 * recursively, marking producer nodes relevant. Status-report-only producers (e.g.
 * Beta -> 59-Z) are time-based and contribute no node requirement.
 */
function expandUnlockPrereqs(
	node: NodeId,
	out: Requirement[],
	relevant: Set<NodeId>,
	seen: Set<string>,
): void {
	const loc = getLocation(node);
	if (loc.status !== 'locked' || !loc.unlock_condition) return;
	addFlagPrereq(loc.unlock_condition, out, relevant, seen);
}

function addFlagPrereq(flag: FlagId, out: Requirement[], relevant: Set<NodeId>, seen: Set<string>): void {
	if (seen.has(`flag:${flag}`)) return;
	seen.add(`flag:${flag}`);

	const producers = flagProducers().get(flag) ?? [];
	const nodeProducers = producers.filter((p) => !p.optionId.startsWith('status:'));
	if (nodeProducers.length === 0) {
		// Time-based / status-report producer only (e.g. code_59Z_written via Beta@15).
		return;
	}
	// Deterministic pick set: all node-producers become candidate nodes for this flag.
	const candidateNodes = [...new Set(nodeProducers.map((p) => p.node))].sort();
	for (const n of candidateNodes) relevant.add(n);

	out.push({
		id: `unlock:${flag}`,
		nodes: candidateNodes,
		match: { type: 'flag', flag },
		constraintIndex: -1,
		specificResolution: false,
	});

	// Recurse into each producer's own prerequisites + node lock.
	for (const p of nodeProducers) {
		expandUnlockPrereqs(p.node, out, relevant, seen);
		for (const pre of p.prereqFlags) addFlagPrereq(pre, out, relevant, seen);
	}
}

function markRelevantWithPrereqs(nodes: NodeId[], out: Requirement[], relevant: Set<NodeId>, seen: Set<string>): void {
	for (const n of nodes) {
		relevant.add(n);
		expandUnlockPrereqs(n, out, relevant, seen);
	}
}

/** Logical-impossibility pairs (README §4.3). Keyed by goal tokens present in requirements. */
const LOGICAL_MUTEX: { a: string; b: string; conflict: string }[] = [
	{
		a: 'goal:aliki_is_on_your_side:blow',
		b: 'goal:recruit:agent_ari_quinn',
		conflict: 'aliki_on_side(blow whistle) vs recruit_agent_quinn(dispose whistle)',
	},
];

export function expandConstraints(constraints: Constraint[]): ExpandedConstraints {
	const requirements: Requirement[] = [];
	const relevantNodes = new Set<NodeId>();
	const forbiddenNodes = new Set<NodeId>();
	const negativeChecks: NegativeCheck[] = [];
	const seen = new Set<string>();
	const goalTokens = new Set<string>();
	let timeCap: number | undefined;
	let scenarioCap: number | undefined;
	let desiredEnding: string | undefined;
	let difficultyExpert = false;
	const meta = loadDatabase().campaign_metadata;

	// Structural requirements: prologue first, finale last.
	const prologueLoc = getScenario('riddles_and_rain')?.location ?? meta.start_node;
	requirements.push({
		id: 'structural:prologue',
		nodes: [prologueLoc],
		match: { type: 'prologue' },
		constraintIndex: -1,
		specificResolution: false,
	});
	relevantNodes.add(prologueLoc);
	requirements.push({
		id: 'structural:finale',
		nodes: [meta.finale_node],
		match: { type: 'finale' },
		constraintIndex: -1,
		specificResolution: false,
	});
	relevantNodes.add(meta.finale_node);

	constraints.forEach((constraint, index) => {
		if (constraint.negate) {
			expandNegation(constraint, forbiddenNodes, negativeChecks);
			return;
		}
		switch (constraint.kind) {
			case 'finale_outcome':
				// The finale terminal already enforces a WIN; nothing extra.
				break;
			case 'visit_scenario': {
				const loc = getScenario(constraint.scenario)?.location;
				const node = loc ?? scenarioLocation(constraint.scenario);
				if (node) {
					requirements.push({
						id: `visit_scenario:${constraint.scenario}`,
						nodes: [node],
						match: { type: 'visit_node' },
						constraintIndex: index,
						specificResolution: false,
						reason: reason('reason_visit_scenario', { scenario: constraint.scenario }),
					});
					markRelevantWithPrereqs([node], requirements, relevantNodes, seen);
				}
				break;
			}
			case 'scenario_resolution': {
				const node = scenarioLocation(constraint.scenario);
				if (node) {
					requirements.push({
						id: `scenario_resolution:${constraint.scenario}:${constraint.resolution}`,
						nodes: [node],
						match: { type: 'resolution', resolution: constraint.resolution },
						constraintIndex: index,
						specificResolution: true,
						reason: reason('reason_resolution_required', {
							scenario: constraint.scenario,
							resolution: constraint.resolution,
						}),
					});
					markRelevantWithPrereqs([node], requirements, relevantNodes, seen);
				}
				break;
			}
			case 'scenario_version': {
				const node = scenarioLocation(constraint.scenario);
				// The finale (Congress) "version" is determined by the Trial outcome, not a stop choice,
				// so route for the corresponding Trial branch (best-effort) rather than a version match.
				const finaleScenario = loadDatabase().scenarios[constraint.scenario]?.role === 'finale';
				if (finaleScenario) {
					const trial = loadDatabase().scenarios[constraint.scenario]?.versions?.[constraint.version]?.trial;
					if (trial !== undefined) desiredEnding = `trial_${trial}`;
				} else if (node) {
					requirements.push({
						id: `scenario_version:${constraint.scenario}:${constraint.version}`,
						nodes: [node],
						match: { type: 'version', version: constraint.version },
						constraintIndex: index,
						specificResolution: true,
						reason: reason('reason_version_required', {
							scenario: constraint.scenario,
							version: constraint.version,
						}),
					});
					markRelevantWithPrereqs([node], requirements, relevantNodes, seen);
				}
				break;
			}
			case 'get_key': {
				const investigatorOnly = constraint.bearer === 'investigator';
				const nodes = keyCandidateNodes(constraint.key, investigatorOnly);
				if (nodes.length > 0) {
					requirements.push({
						id: `get_key:${constraint.key}`,
						nodes,
						match: investigatorOnly
							? { type: 'key_investigator', key: constraint.key }
							: { type: 'key_any', key: constraint.key },
						constraintIndex: index,
						specificResolution: investigatorOnly,
						reason: reason('reason_get_key', { key: constraint.key }),
					});
					markRelevantWithPrereqs(nodes, requirements, relevantNodes, seen);
				}
				break;
			}
			case 'recruit_ally': {
				goalTokens.add(`goal:recruit:${constraint.ally}`);
				const nodes = allyCandidateNodes(constraint.ally);
				if (nodes.length > 0) {
					requirements.push({
						id: `recruit_ally:${constraint.ally}`,
						nodes,
						match: { type: 'ally', ally: constraint.ally },
						constraintIndex: index,
						specificResolution: false,
						reason: reason('reason_recruit_ally', { ally: constraint.ally }),
					});
					markRelevantWithPrereqs(nodes, requirements, relevantNodes, seen);
					// Pull in the recruitment narrative chain's prerequisite waypoints, if any.
					expandRecruitChain(constraint.ally, index, requirements, relevantNodes, seen);
				}
				break;
			}
			case 'narrative_chain': {
				expandNarrativeChain(constraint.id, index, requirements, relevantNodes, seen, goalTokens);
				break;
			}
			case 'visit_node': {
				requirements.push({
					id: `visit_node:${constraint.node}`,
					nodes: [constraint.node],
					match: { type: 'visit_node' },
					constraintIndex: index,
					specificResolution: false,
					reason: reason('reason_visit_node', { node: constraint.node }),
				});
				markRelevantWithPrereqs([constraint.node], requirements, relevantNodes, seen);
				break;
			}
			case 'play_side_story': {
				const node = sideStoryProductNode(constraint.sideStory);
				if (node) {
					requirements.push({
						id: `play_side_story:${constraint.sideStory}`,
						nodes: [node],
						match: { type: 'resolution', resolution: constraint.sideStory },
						constraintIndex: index,
						specificResolution: true,
						reason: reason('reason_visit_node', { node }),
					});
					markRelevantWithPrereqs([node], requirements, relevantNodes, seen);
				}
				break;
			}
			case 'avoid_scenario': {
				const node = scenarioLocation(constraint.scenario);
				if (node) forbiddenNodes.add(node);
				break;
			}
			case 'reach_ending':
				desiredEnding = constraint.trial;
				break;
			case 'chaos_mix':
			case 'chaos_overflow_xp':
			case 'chaos_balanced':
				// Trust/Deception goals don't pin specific stops, but they need the route to engage
				// enough decision scenarios — make those candidates (post-filtered for feasibility).
				for (const n of ['buenos_aires', 'istanbul', 'anchorage', 'alexandria', 'kathmandu']) {
					relevantNodes.add(n);
				}
				break;
			case 'achievement':
				expandAchievement(constraint.id, index, requirements, relevantNodes, seen, {
					setTimeCap: (cap) => {
						timeCap = timeCap === undefined ? cap : Math.min(timeCap, cap);
					},
					setExpert: () => {
						difficultyExpert = true;
					},
					setDesiredEnding: (e) => {
						desiredEnding = e;
					},
				});
				break;
		}
	});

	// Logical impossibility detection.
	let logicalConflict: ExpandedConstraints['logicalConflict'];
	for (const m of LOGICAL_MUTEX) {
		if (goalTokens.has(m.a) && goalTokens.has(m.b)) {
			logicalConflict = { conflict: m.conflict, a: m.a, b: m.b };
		}
	}

	return {
		requirements,
		timeCap,
		scenarioCap,
		forbiddenNodes,
		negativeChecks,
		desiredEnding,
		difficultyExpert,
		logicalConflict,
		relevantNodes,
	};
}

/** Expand a negated constraint into forbidden nodes + post-search negative checks. */
function expandNegation(constraint: Constraint, forbidden: Set<NodeId>, checks: NegativeCheck[]): void {
	switch (constraint.kind) {
		case 'visit_scenario':
		case 'avoid_scenario': {
			const node = scenarioLocation(constraint.scenario);
			if (node) {
				forbidden.add(node);
				checks.push({ kind: 'node', node });
			}
			break;
		}
		case 'visit_node':
			forbidden.add(constraint.node);
			checks.push({ kind: 'node', node: constraint.node });
			break;
		case 'scenario_resolution': {
			const node = scenarioLocation(constraint.scenario);
			if (node) checks.push({ kind: 'resolution', node, resolution: constraint.resolution });
			break;
		}
		case 'scenario_version': {
			const node = scenarioLocation(constraint.scenario);
			if (node) checks.push({ kind: 'version', node, version: constraint.version });
			break;
		}
		case 'get_key':
			checks.push({ kind: 'key', key: constraint.key, investigatorOnly: constraint.bearer === 'investigator' });
			break;
		case 'recruit_ally':
			checks.push({ kind: 'ally', ally: constraint.ally });
			break;
		case 'play_side_story': {
			const node = sideStoryProductNode(constraint.sideStory);
			if (node) checks.push({ kind: 'resolution', node, resolution: constraint.sideStory });
			break;
		}
		case 'narrative_chain': {
			const chain = loadDatabase().narrative_chains[constraint.id];
			const terminal = chain?.waypoints[chain.waypoints.length - 1];
			const flag = terminal?.sets?.split('+')[0]?.trim();
			if (flag) checks.push({ kind: 'flag', flag: CHAIN_SETS_NORMALIZE[flag] ?? flag });
			// Also forbid the terminal node to prune early.
			for (const n of (terminal?.node ?? '').split('_or_')) if (n) forbidden.add(n);
			break;
		}
		default:
			// finale_outcome / reach_ending / achievement negation: no structural exclusion.
			break;
	}
}

/** The green node that hosts a given standalone product id. */
function sideStoryProductNode(productId: string): NodeId | undefined {
	for (const s of loadDatabase().side_stories) {
		if (s.products.some((p) => p.id === productId)) return s.node;
	}
	return undefined;
}

function scenarioLocation(scenario: string): NodeId | undefined {
	const s = getScenario(scenario);
	if (s) return s.location;
	// Some scenarios are keyed by node only; search locations for the scenario_id.
	for (const loc of loadDatabase().locations) {
		if (loc.scenario_id === scenario) return loc.id;
	}
	return undefined;
}

/** Normalize a narrative-chain `sets` shorthand token to the tracked flag it represents. */
const CHAIN_SETS_NORMALIZE: Record<string, FlagId> = {
	off_mission: 'the_cell_is_off_mission',
	cell_possesses_whistle: 'the_cell_possesses_a_mysterious_whistle',
	met_irawan: 'the_cell_met_dr_irawan',
};

/**
 * Decide how to match a chain waypoint: prefer the explicit outcome id (most precise),
 * otherwise the unlock/log flag from `sets`, otherwise just visiting the node.
 */
function chainWaypointMatch(wp: { node: NodeId; outcome: string; sets?: string }): {
	match: RequirementMatch;
	specificResolution: boolean;
} {
	// Parse an outcome id like RH2 / W2 / DG6 / RR1 / R1 / M2 / CS6 from the free-text outcome.
	const idMatch = /\b([A-Z]{1,3}\d+)\b/.exec(wp.outcome);
	if (idMatch) {
		const resId = idMatch[1]!;
		const firstNode = wp.node.split('_or_')[0]!;
		// Only treat as a resolution match if that option actually exists at the node.
		if (stopOptions(firstNode).some((o) => o.optionId === resId)) {
			return { match: { type: 'resolution', resolution: resId }, specificResolution: true };
		}
	}
	const setsTokens = (wp.sets ?? '').split('+').map((s) => s.trim()).filter(Boolean);
	const code = setsTokens.find((t) => /^code_.*_written$/.test(t));
	const raw = code ?? setsTokens.find((t) => t.includes('_') && t !== 'delta');
	if (raw) {
		const flag = CHAIN_SETS_NORMALIZE[raw] ?? raw;
		return { match: { type: 'flag', flag }, specificResolution: false };
	}
	return { match: { type: 'visit_node' }, specificResolution: false };
}

function expandNarrativeChain(
	chainId: string,
	index: number,
	out: Requirement[],
	relevant: Set<NodeId>,
	seen: Set<string>,
	goalTokens: Set<string>,
): void {
	const chain = loadDatabase().narrative_chains[chainId];
	if (!chain) return;
	chain.waypoints.forEach((wp, wpIndex) => {
		const nodes = wp.node.split('_or_');
		const { match, specificResolution } = chainWaypointMatch(wp);
		out.push({
			id: `chain:${chainId}:${wpIndex}`,
			nodes,
			match,
			constraintIndex: index,
			specificResolution,
			reason: reason('reason_chain_waypoint', { chain: chainId, node: nodes[0] ?? '' }),
		});
		markRelevantWithPrereqs(nodes, out, relevant, seen);
	});
	if (chainId === 'understand_aliki') {
		goalTokens.add('goal:aliki_is_on_your_side:blow');
	}
}

function expandRecruitChain(
	ally: AllyId,
	index: number,
	out: Requirement[],
	relevant: Set<NodeId>,
	seen: Set<string>,
): void {
	const chainByAlly: Record<string, string> = {
		dr_dewi_irawan: 'recruit_dr_irawan',
		inspector_flint: 'recruit_flint',
	};
	const chainId = chainByAlly[ally];
	if (!chainId) return;
	const chain = loadDatabase().narrative_chains[chainId];
	if (!chain) return;
	chain.waypoints.forEach((wp, wpIndex) => {
		// Skip the terminal waypoint that grants the ally (already added as the ally requirement).
		if (wp.grants && wp.grants.includes(ally)) return;
		const nodes = wp.node.split('_or_');
		const { match, specificResolution } = chainWaypointMatch(wp);
		out.push({
			id: `recruit_chain:${chainId}:${wpIndex}`,
			nodes,
			match,
			constraintIndex: index,
			specificResolution,
			reason: reason('reason_chain_waypoint', { chain: chainId, node: nodes[0] ?? '' }),
		});
		markRelevantWithPrereqs(nodes, out, relevant, seen);
	});
}

interface AchievementHooks {
	setTimeCap: (cap: number) => void;
	setExpert: () => void;
	setDesiredEnding: (ending: string) => void;
}

/**
 * Expand an achievement into routing requirements using its `constraint` metadata
 * (README §"Achievements"). Skill-based achievements (`feat: 'in_session'`) still route
 * the player to the right scenario/version; the table feat is then up to play.
 */
function expandAchievement(
	id: AchievementId,
	index: number,
	out: Requirement[],
	relevant: Set<NodeId>,
	seen: Set<string>,
	hooks: AchievementHooks,
): void {
	const ach = loadDatabase().achievements.find((a) => a.id === id);
	if (!ach || ach.planning === false) return;
	const c = ach.constraint;
	if (!c) return;
	const addVisit = (node: NodeId, match: RequirementMatch, specific: boolean) => {
		out.push({
			id: `achievement:${id}:${node}`,
			nodes: [node],
			match,
			constraintIndex: index,
			specificResolution: specific,
			reason: reason('reason_achievement', { achievement: id, node }),
		});
		markRelevantWithPrereqs([node], out, relevant, seen);
	};

	switch (c.kind) {
		case 'time_cap':
			hooks.setTimeCap(c.max_time);
			break;
		case 'difficulty':
			if (c.difficulty === 'expert') hooks.setExpert();
			break;
		case 'scenario_resolution': {
			const node = scenarioLocation(c.scenario);
			if (node) addVisit(node, { type: 'resolution', resolution: c.resolution }, true);
			break;
		}
		case 'scenario_version': {
			const node = scenarioLocation(c.scenario);
			if (node) addVisit(node, { type: 'version', version: c.version }, true);
			break;
		}
		case 'visit_scenario': {
			const node = scenarioLocation(c.scenario);
			if (node) addVisit(node, { type: 'visit_node' }, false);
			break;
		}
		case 'visit_nodes':
			for (const node of c.nodes) addVisit(node, { type: 'visit_node' }, false);
			break;
		case 'finale_trial':
			hooks.setDesiredEnding(`trial_${c.trial}`);
			break;
		case 'epilogue':
			hooks.setDesiredEnding(c.epilogue);
			break;
		case 'all_keys':
			for (const key of keysById().keys()) {
				const nodes = keyCandidateNodes(key, false);
				if (nodes.length > 0) {
					out.push({
						id: `achievement:${id}:key:${key}`,
						nodes,
						match: { type: 'key_any', key },
						constraintIndex: index,
						specificResolution: false,
						reason: reason('reason_get_key', { key }),
					});
					markRelevantWithPrereqs(nodes, out, relevant, seen);
				}
			}
			break;
		case 'chaos':
		case 'none':
			// Best-effort / in-session: no routing requirement. Earnability is reported per recipe.
			break;
	}
}

/** Does a stop option satisfy a requirement match? */
export function optionMatches(option: StopOption, match: RequirementMatch): boolean {
	switch (match.type) {
		case 'visit_node':
			return true;
		case 'prologue':
			return option.isPrologue === true && !option.noResolution;
		case 'finale':
			return option.outcome === 'WIN_CAMPAIGN';
		case 'key_investigator':
			return (
				option.grantsKey === match.key ||
				(option.key === match.key && (option.bearer === 'investigator' || option.bearer === 'conditional') && !option.noResolution)
			);
		case 'key_any':
			return option.grantsKey === match.key || (option.key === match.key && !option.noResolution);
		case 'resolution':
			return option.optionId === match.resolution;
		case 'version':
			return option.version === match.version;
		case 'ally':
			return option.grantsAllies.includes(match.ally);
		case 'flag':
			// A "flag" requirement is also satisfied by an option that grants the matching
			// asset (e.g. mysterious_whistle), since unlock prerequisites can resolve to assets.
			return option.logs.includes(match.flag) || option.unlocks === match.flag || option.grantsAsset === match.flag;
		case 'asset':
			return option.grantsAsset === match.asset;
		case 'achievement':
			return option.achievement === match.achievement;
	}
}

export { allyCandidateNodes, keyCandidateNodes };
export const _isAlly = (id: string): boolean => alliesById().has(id);
