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

export interface RouteLeg {
	from: string;
	to: string;
	ticket?: boolean;
}

export interface DrawnLeg {
	points: XY[];
	ticket: boolean;
}

/** Drawable polylines (fractional 0..1) for a route's legs. Wrap legs yield two polylines. */
export function drawnLegs(legs: RouteLeg[]): DrawnLeg[] {
	const out: DrawnLeg[] = [];
	for (const leg of legs) {
		if (leg.from === leg.to) continue;
		if (leg.ticket) {
			out.push({ points: [pos(leg.from), pos(leg.to)], ticket: true });
			continue;
		}
		const w = wrapOf(leg.from, leg.to);
		if (w) {
			const westHalf = wrapHalf(pos(w.west), w.westSeam);
			const eastHalf = wrapHalf(pos(w.east), w.eastSeam);
			out.push({ points: westHalf, ticket: false });
			out.push({ points: eastHalf, ticket: false });
		} else {
			out.push({ points: legPoints(leg.from, leg.to), ticket: false });
		}
	}
	return out;
}
