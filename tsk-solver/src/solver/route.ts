/**
 * Map-route projection of a simulated plan.
 *
 * `simulatePlan` records *where* the cell stops; this turns that stop sequence into the actual
 * **hop-by-hop** course on the world map. Each leg between two consecutive stops is expanded to the
 * shortest node path on the subgraph that was unlocked *at that point in the plan* (the same path
 * the travel cost was billed against), so the drawn course threads through the real intermediate
 * locations instead of cutting a straight line to the destination.
 *
 * It also classifies every node the course touches — a **stop** (the cell plays a file or burns time
 * there) versus a **pass-through** (merely transited) — and stamps each stop with its 1-based visit
 * order, so the renderer can number stops and shade legs by travel order. Pure; geometry (curves,
 * pixels) is the renderer's job.
 */

import { metadata } from '../data/load.js';
import { shortestPath } from '../graph/graph.js';
import { initialState } from '../graph/state.js';
import type { NodeId } from '../types.js';
import type { PlanTrajectory, SimStep } from './simulate.js';

/** One leg of the course: the hop-by-hop trip from one stop to the next. */
export interface RouteLeg {
	/** 1-based visit order of the stop this leg arrives at (drives the order gradient). */
	order: number;
	/** Departure stop. */
	from: NodeId;
	/** Arrival stop. */
	to: NodeId;
	/** Reached via a 0-time Expedited Ticket warp (drawn as a straight jump, not along edges). */
	ticket: boolean;
	/** Inclusive node sequence `[from, …through, to]`. `[from, to]` for a ticket / unreachable leg. */
	hops: NodeId[];
}

/** One stop on the course (the cell acts here, or deliberately burns time). */
export interface RouteStop {
	node: NodeId;
	/** 1-based visit order (its step index + 1). A revisited node appears once per visit. */
	order: number;
	/** A "do nothing here" stop (no file played). */
	travelOnly: boolean;
	kind: SimStep['kind'];
}

/** A plan's course projected onto the map: ordered legs + the nodes it stops at / passes through. */
export interface MapRoute {
	legs: RouteLeg[];
	stops: RouteStop[];
	/** Nodes the course transits but never stops at (intermediate hops only). */
	passThrough: NodeId[];
	/** Total stops — gradient normalization denominator. */
	stopCount: number;
}

/**
 * Project a trajectory onto the map as a hop-by-hop course.
 * `untilStep` (picker mode) draws the course only through the first N steps.
 */
export function mapRoute(trajectory: PlanTrajectory, untilStep?: number): MapRoute {
	const start = metadata().startLocation;
	const steps = untilStep === undefined ? trajectory.steps : trajectory.steps.slice(0, untilStep);

	const legs: RouteLeg[] = [];
	const stops: RouteStop[] = [];
	let prev: NodeId = start;
	// Travel for step i is billed against the subgraph unlocked *before* it — i.e. the previous
	// step's resulting state (the initial state before the very first step).
	let prevUnlocked = initialState().unlocked;

	steps.forEach((s, i) => {
		const order = i + 1;
		stops.push({ node: s.location, order, travelOnly: s.travelOnly, kind: s.kind });
		if (s.location !== prev) {
			const ticket = !!s.usedTicket;
			let hops: NodeId[];
			if (ticket) {
				hops = [prev, s.location];
			} else {
				const path = shortestPath(prevUnlocked, prev, s.location);
				// Unreachable now (a flagged illegal step) — fall back to a direct segment.
				hops = path.length > 0 ? path : [prev, s.location];
			}
			legs.push({ order, from: prev, to: s.location, ticket, hops });
		}
		prev = s.location;
		prevUnlocked = s.stateAfter.unlocked;
	});

	const stopNodes = new Set<NodeId>(stops.map((st) => st.node));
	const through = new Set<NodeId>();
	for (const leg of legs) {
		for (const n of leg.hops.slice(1, -1)) {
			if (n !== start && !stopNodes.has(n)) through.add(n);
		}
	}

	return { legs, stops, passThrough: [...through], stopCount: stops.length };
}
