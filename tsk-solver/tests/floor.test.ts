import { beforeEach, describe, expect, it } from 'vitest';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches } from '../src/graph/model.js';
import { expandConstraints } from '../src/solver/waypoints.js';
import { scenarioCountFloor, timeFloor } from '../src/solver/timefloor.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
});

describe('time floor (admissible lower bound)', () => {
	it('Understand Aliki forces a globe-spanning route well over 17 travel', () => {
		const exp = expandConstraints([{ kind: 'narrative_chain', id: 'understand_aliki' }]);
		const tf = timeFloor(exp);
		// Travel alone (full-graph, precedence-respecting) is the back-and-forth London<->Sydney/
		// Kathmandu<->London<->Rome<->Bermuda Triangle<->Tunguska chain.
		expect(tf.travel).toBeGreaterThanOrEqual(20);
		expect(tf.floor).toBeGreaterThan(17);
		// breakdown sums to floor (unless the unlock-floor dominates).
		const sum = tf.breakdown
			.filter((b) => b.label !== 'finale_unlock')
			.reduce((s, b) => s + b.value, 0);
		expect(sum).toBe(tf.travel + tf.stopTime);
	});

	it('Speed Demon (<=17) + Understand Aliki is provably impossible', () => {
		const exp = expandConstraints([
			{ kind: 'narrative_chain', id: 'understand_aliki' },
			{ kind: 'achievement', id: 'speed_demon' },
		]);
		expect(exp.timeCap).toBe(17);
		const tf = timeFloor(exp);
		expect(tf.floor).toBeGreaterThan(exp.timeCap!);
	});

	it('six scenario-keys need at least six scenarios', () => {
		const exp = expandConstraints([
			{ kind: 'get_key', key: 'the_eye_of_ravens' },
			{ kind: 'get_key', key: 'the_last_blossom' },
			{ kind: 'get_key', key: 'the_light_of_pharos' },
			{ kind: 'get_key', key: 'the_sable_glass' },
			{ kind: 'get_key', key: 'the_weeping_lady' },
			{ kind: 'get_key', key: 'the_twisted_antiprism' },
		]);
		const sc = scenarioCountFloor(exp);
		expect(sc.count).toBe(6);
	});
});
