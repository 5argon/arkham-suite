import { describe, expect, it } from 'vitest';
import { evalCondition } from '../src/graph/conditions.js';
import { resetAll, stateWith } from './helpers.js';

resetAll();

describe('evalCondition', () => {
	it('null is unconditional', () => {
		expect(evalCondition(null, stateWith())).toBe(true);
	});

	it('recorded / notRecorded', () => {
		expect(evalCondition({ recorded: 'log.knowPassphrase' }, stateWith(['log.knowPassphrase']))).toBe(true);
		expect(evalCondition({ recorded: 'log.knowPassphrase' }, stateWith())).toBe(false);
		expect(evalCondition({ notRecorded: 'log.deliveringIntel' }, stateWith())).toBe(true);
	});

	it('time bounds (lt/lte/gte/min/max)', () => {
		expect(evalCondition({ time: { gte: 20 } }, stateWith([], [], { timePassed: 20 }))).toBe(true);
		expect(evalCondition({ time: { lt: 20 } }, stateWith([], [], { timePassed: 20 }))).toBe(false);
		expect(evalCondition({ time: { min: 11, max: 14 } }, stateWith([], [], { timePassed: 12 }))).toBe(true);
		expect(evalCondition({ time: { min: 11, max: 14 } }, stateWith([], [], { timePassed: 15 }))).toBe(false);
	});

	it('timeMarkerReached: printed box vs written marker', () => {
		// β is printed at box 15.
		expect(evalCondition({ timeMarkerReached: 'β' }, stateWith([], [], { timePassed: 15 }))).toBe(true);
		expect(evalCondition({ timeMarkerReached: 'β' }, stateWith([], [], { timePassed: 14 }))).toBe(false);
		// Θ is written at runtime — unreached until the marker exists and the clock catches up.
		expect(evalCondition({ timeMarkerReached: 'Θ' }, stateWith([], [], { timePassed: 30 }))).toBe(false);
		expect(evalCondition({ timeMarkerReached: 'Θ' }, stateWith([], [], { timePassed: 12, markers: new Map([['Θ', 10]]) }))).toBe(true);
	});

	it('countRecorded threshold', () => {
		const c = { countRecorded: { anyOf: ['log.a', 'log.b', 'log.c'], gte: 2 } };
		expect(evalCondition(c, stateWith(['log.a']))).toBe(false);
		expect(evalCondition(c, stateWith(['log.a', 'log.c']))).toBe(true);
	});

	it('tallyCompare', () => {
		const s = stateWith([], [], { tallies: new Map([['log.foundationTrust', 3], ['log.cellDeception', 1]]) });
		expect(evalCondition({ tallyCompare: { left: 'log.foundationTrust', op: 'gte', right: 'log.cellDeception' } }, s)).toBe(true);
		expect(evalCondition({ tallyCompare: { left: 'log.cellDeception', op: 'gt', right: 'log.foundationTrust' } }, s)).toBe(false);
	});

	it('scenarioState reads board assertions; random is treated as not-yet-true', () => {
		expect(evalCondition({ scenarioState: 'desiReal' }, stateWith([], ['desiReal']))).toBe(true);
		expect(evalCondition({ scenarioState: 'desiReal' }, stateWith())).toBe(false);
		expect(evalCondition({ random: true }, stateWith())).toBe(false);
	});

	it('combinators all/any/not + the Safehouse gate', () => {
		const gate = { all: [{ recorded: 'log.knowPassphrase' }, { timeMarkerReached: 'Θ' }] };
		expect(evalCondition(gate, stateWith(['log.knowPassphrase'], [], { timePassed: 12, markers: new Map([['Θ', 10]]) }))).toBe(true);
		expect(evalCondition(gate, stateWith(['log.knowPassphrase'], [], { timePassed: 8, markers: new Map([['Θ', 10]]) }))).toBe(false);
		expect(evalCondition({ any: [{ recorded: 'log.x' }, { recorded: 'log.y' }] }, stateWith(['log.y']))).toBe(true);
		expect(evalCondition({ not: { recorded: 'log.x' } }, stateWith())).toBe(true);
	});
});
