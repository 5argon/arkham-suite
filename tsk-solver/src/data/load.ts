/**
 * Typed loader + integrity validation for the shipped campaign database.
 *
 * The JSON is the single source of truth (README §9). On first load we validate
 * structural integrity and throw `DatabaseIntegrityError` (fail-fast) if the data
 * is malformed. All accessors return immutable views derived once and memoized.
 */

import rawDatabase from './tsk_database.json' with { type: 'json' };
import type {
	FlagId,
	NodeId,
	RawAlly,
	RawDatabase,
	RawInterlude,
	RawKey,
	RawLocation,
	RawScenario,
	RawSideStory,
} from '../types.js';

const db = rawDatabase as unknown as RawDatabase;

export class DatabaseIntegrityError extends Error {
	readonly problems: string[];
	constructor(problems: string[]) {
		super(`tsk_database.json failed integrity validation:\n - ${problems.join('\n - ')}`);
		this.name = 'DatabaseIntegrityError';
		this.problems = problems;
	}
}

/** Split a `_or_` compound node reference (e.g. `rio_de_janiero_or_perth`) into parts. */
export function splitNodeRef(ref: NodeId): NodeId[] {
	return ref.split('_or_');
}

/**
 * Run all §9 integrity checks. Returns a (possibly empty) list of human-readable
 * problems. Pure: does not throw.
 */
export function validateIntegrity(data: RawDatabase): string[] {
	const problems: string[] = [];
	const locationIds = new Set(data.locations.map((l) => l.id));
	const scenarioIds = new Set(Object.keys(data.scenarios));
	const interludeIds = new Set(Object.keys(data.interludes));
	const sideStoryIds = new Set(data.side_stories.map((s) => s.id));
	const keyIds = new Set(data.keys.map((k) => k.id));

	// 1. Connection targets exist; graph is symmetric.
	const adjacency = new Map<NodeId, Set<NodeId>>();
	for (const loc of data.locations) {
		adjacency.set(loc.id, new Set(loc.connections));
	}
	for (const loc of data.locations) {
		for (const target of loc.connections) {
			if (!locationIds.has(target)) {
				problems.push(`location "${loc.id}" connects to unknown node "${target}"`);
				continue;
			}
			const back = adjacency.get(target);
			if (!back || !back.has(loc.id)) {
				problems.push(`asymmetric edge: "${loc.id}" -> "${target}" has no reverse edge`);
			}
		}
	}

	// 2. Every scenario_id on a node exists in scenarios or interludes.
	for (const loc of data.locations) {
		if (loc.scenario_id === null) continue;
		if (
			!scenarioIds.has(loc.scenario_id) &&
			!interludeIds.has(loc.scenario_id) &&
			!sideStoryIds.has(loc.scenario_id)
		) {
			problems.push(
				`location "${loc.id}" references scenario_id "${loc.scenario_id}" not found in scenarios, interludes, or side_stories`,
			);
		}
	}

	// 3. Every unlock_condition is produced by some outcome's `unlocks` or status report `sets`.
	const producedFlags = new Set<FlagId>();
	for (const report of Object.values(data.status_reports)) {
		if (report.sets) producedFlags.add(report.sets);
	}
	for (const interlude of Object.values(data.interludes)) {
		for (const outcome of interlude.outcomes ?? []) {
			if (outcome.unlocks) producedFlags.add(outcome.unlocks);
		}
	}
	for (const chain of Object.values(data.narrative_chains)) {
		for (const wp of chain.waypoints) {
			if (wp.sets) {
				// `sets` strings may be compound ("code_45P_written + delta"); record each token.
				for (const token of wp.sets.split('+').map((s) => s.trim())) {
					if (token) producedFlags.add(token);
				}
			}
		}
	}
	for (const loc of data.locations) {
		const conds: { field: string; value?: FlagId }[] = [
			{ field: 'unlock_condition', value: loc.unlock_condition },
			{ field: 'revisit_unlock', value: loc.revisit_unlock },
		];
		for (const { field, value } of conds) {
			if (value && !producedFlags.has(value)) {
				problems.push(
					`location "${loc.id}".${field} = "${value}" is an orphan lock (no outcome/status report produces it)`,
				);
			}
		}
	}

	// 4. Every key referenced in resolutions / interlude grants exists in keys.
	for (const [sid, scenario] of Object.entries(data.scenarios)) {
		for (const res of scenario.resolutions) {
			if (res.key && !keyIds.has(res.key)) {
				problems.push(`scenario "${sid}" resolution "${res.id}" references unknown key "${res.key}"`);
			}
		}
	}
	for (const [iid, interlude] of Object.entries(data.interludes)) {
		for (const outcome of interlude.outcomes ?? []) {
			if (outcome.grants_key && !keyIds.has(outcome.grants_key)) {
				problems.push(
					`interlude "${iid}" outcome "${outcome.id}" grants unknown key "${outcome.grants_key}"`,
				);
			}
		}
	}

	// 5. Every narrative_chain waypoint references a real node.
	for (const [cid, chain] of Object.entries(data.narrative_chains)) {
		for (const wp of chain.waypoints) {
			for (const part of splitNodeRef(wp.node)) {
				if (!locationIds.has(part)) {
					problems.push(`narrative_chain "${cid}" waypoint references unknown node "${part}"`);
				}
			}
		}
	}

	// 6. Ally recruit nodes reference real nodes.
	for (const ally of data.allies) {
		for (const recruit of ally.recruit_via) {
			for (const part of splitNodeRef(recruit.node)) {
				if (!locationIds.has(part)) {
					problems.push(`ally "${ally.id}" recruits at unknown node "${part}"`);
				}
			}
		}
	}

	// 7. Metadata sanity: start and finale nodes exist.
	if (!locationIds.has(data.campaign_metadata.start_node)) {
		problems.push(`campaign_metadata.start_node "${data.campaign_metadata.start_node}" not found`);
	}
	if (!locationIds.has(data.campaign_metadata.finale_node)) {
		problems.push(`campaign_metadata.finale_node "${data.campaign_metadata.finale_node}" not found`);
	}

	return problems;
}

let validated: RawDatabase | null = null;

/** Load the validated database, throwing `DatabaseIntegrityError` on malformed data. */
export function loadDatabase(): RawDatabase {
	if (validated) return validated;
	const problems = validateIntegrity(db);
	if (problems.length > 0) {
		throw new DatabaseIntegrityError(problems);
	}
	validated = db;
	return db;
}

// --- Memoized derived accessors --------------------------------------------

let _locationsById: Map<NodeId, RawLocation> | null = null;
export function locationsById(): ReadonlyMap<NodeId, RawLocation> {
	if (!_locationsById) {
		_locationsById = new Map(loadDatabase().locations.map((l) => [l.id, l]));
	}
	return _locationsById;
}

export function getLocation(id: NodeId): RawLocation {
	const loc = locationsById().get(id);
	if (!loc) throw new Error(`Unknown location: ${id}`);
	return loc;
}

let _keysById: Map<string, RawKey> | null = null;
export function keysById(): ReadonlyMap<string, RawKey> {
	if (!_keysById) {
		_keysById = new Map(loadDatabase().keys.map((k) => [k.id, k]));
	}
	return _keysById;
}

let _alliesById: Map<string, RawAlly> | null = null;
export function alliesById(): ReadonlyMap<string, RawAlly> {
	if (!_alliesById) {
		_alliesById = new Map(loadDatabase().allies.map((a) => [a.id, a]));
	}
	return _alliesById;
}

export function getScenario(id: string): RawScenario | undefined {
	return loadDatabase().scenarios[id];
}

export function getInterlude(id: string): RawInterlude | undefined {
	return loadDatabase().interludes[id];
}

let _sideStoriesByNode: Map<NodeId, RawSideStory> | null = null;
export function sideStoryForNode(node: NodeId): RawSideStory | undefined {
	if (!_sideStoriesByNode) {
		_sideStoriesByNode = new Map(loadDatabase().side_stories.map((s) => [s.node, s]));
	}
	return _sideStoriesByNode.get(node);
}

/** The scenario/interlude id that "plays" at a node, or undefined for pure connectors. */
export function nodeScenarioId(id: NodeId): string | null {
	return getLocation(id).scenario_id;
}
