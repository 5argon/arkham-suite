/**
 * Planned-course renderer for the Scarlet Keys world map (a TS port of `route_render.js`).
 *
 * Reads node positions + the `routing` config from logic.json (via the package) and produces
 * drawable polylines (in 0..1 fractional map coordinates) for a route — quadratic-bezier legs over
 * the official adjacency, two-half wrap curves across the Pacific seam, and straight dashed lines
 * for Expedited-Ticket warp jumps.
 */

import { loadLogic, type XY } from '@5argon/arkham-tsk-solver';

const routing = () => loadLogic().routing;
const pos = (id: string): XY => loadLogic().locations[id]!.position;
const ekey = (a: string, b: string) => [a, b].sort().join('|');
const wrapOf = (a: string, b: string) => loadLogic().wrapEdges.find((w) => (w.west === a && w.east === b) || (w.west === b && w.east === a));

/** Direction-independent quadratic-bezier samples for a normal edge, oriented a → b. */
function legPoints(a: string, b: string): XY[] {
	const R = routing();
	const n = R.curve.samplesHint ?? 30;
	const [c0, c1] = [a, b].sort();
	const ov = R.edgeOverrides[ekey(a, b)] ?? {};
	const k = ov.k ?? R.curve.k;
	const sign = ov.sign ?? R.curve.sign;
	const p0 = pos(c0!);
	const p1 = pos(c1!);
	const dx = p1.x - p0.x;
	const dy = p1.y - p0.y;
	const len = Math.hypot(dx, dy) || 1e-6;
	const nx = -dy / len;
	const ny = dx / len;
	const cx = (p0.x + p1.x) / 2 + nx * k * len * sign;
	const cy = (p0.y + p1.y) / 2 + ny * k * len * sign;
	const pts: XY[] = [];
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		const m = 1 - t;
		pts.push({ x: m * m * p0.x + 2 * m * t * cx + t * t * p1.x, y: m * m * p0.y + 2 * m * t * cy + t * t * p1.y });
	}
	if (a !== c0) pts.reverse();
	return pts;
}

function wrapHalf(node: XY, seam: XY, n = 16): XY[] {
	const k = routing().wrap?.bowUpK ?? 0.12;
	const cx = (node.x + seam.x) / 2;
	const cy = (node.y + seam.y) / 2 - k * Math.abs(node.x - seam.x);
	const pts: XY[] = [];
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		const m = 1 - t;
		pts.push({ x: m * m * node.x + 2 * m * t * cx + t * t * seam.x, y: m * m * node.y + 2 * m * t * cy + t * t * seam.y });
	}
	return pts;
}

/** A single graph edge to draw (one hop). `order`/`arrow` are decoration hints carried to the output. */
export interface EdgeLeg {
	from: string;
	to: string;
	ticket?: boolean;
	/** 1-based visit order of the stop this edge's leg arrives at (drives the order gradient). */
	order?: number;
	/** Draw a direction arrowhead at this edge's end (set only on a leg's final hop). */
	arrow?: boolean;
}

export interface DrawnLeg {
	points: XY[];
	ticket: boolean;
	order: number;
	arrow: boolean;
}

/** Drawable polylines (fractional 0..1) for a route's edges. Wrap edges yield two polylines. */
export function drawnLegs(legs: EdgeLeg[]): DrawnLeg[] {
	const out: DrawnLeg[] = [];
	for (const leg of legs) {
		if (leg.from === leg.to) continue;
		const order = leg.order ?? 0;
		if (leg.ticket) {
			out.push({ points: [pos(leg.from), pos(leg.to)], ticket: true, order, arrow: leg.arrow ?? false });
			continue;
		}
		const w = wrapOf(leg.from, leg.to);
		if (w) {
			// A seam crossing draws as two half-curves; skip the arrowhead (its direction is ambiguous).
			out.push({ points: wrapHalf(pos(w.west), w.westSeam), ticket: false, order, arrow: false });
			out.push({ points: wrapHalf(pos(w.east), w.eastSeam), ticket: false, order, arrow: false });
		} else {
			out.push({ points: legPoints(leg.from, leg.to), ticket: false, order, arrow: leg.arrow ?? false });
		}
	}
	return out;
}

// --- order gradient ---------------------------------------------------------

const RAMP = {
	// progress 0 (earliest) → 1 (latest): deep amber → bright gold; tickets keep a pink hue.
	route: ['#d97706', '#fde047'],
	ticket: ['#9d174d', '#ff5ed6'],
} as const;

const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** Colour for a leg / stop at `progress` (0..1) of the travel order — later legs read brighter. */
export function routeColor(progress: number, ticket = false): string {
	const t = Math.max(0, Math.min(1, progress));
	const [a, b] = ticket ? RAMP.ticket : RAMP.route;
	const [r0, g0, b0] = hex(a);
	const [r1, g1, b1] = hex(b);
	const c = (x: number, y: number) => Math.round(x + (y - x) * t);
	return `rgb(${c(r0, r1)}, ${c(g0, g1)}, ${c(b0, b1)})`;
}
