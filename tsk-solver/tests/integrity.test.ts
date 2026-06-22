import { describe, expect, it } from 'vitest';
import { loadEn, loadLogic, validateIntegrity } from '../src/data/load.js';
import { resetAll } from './helpers.js';

resetAll();

describe('data integrity', () => {
	it('logic.json + en.json pass structural validation', () => {
		expect(validateIntegrity(loadLogic(), loadEn())).toEqual([]);
	});

	it('every effect log/key/character/note ref resolves to en text', () => {
		const E = loadEn();
		for (const f of loadLogic().files) {
			for (const d of f.decisions) {
				for (const o of d.options) {
					for (const e of o.effects) {
						if (e.type === 'record' || e.type === 'crossOff' || e.type === 'tally') expect(E.campaignLog[e.entryId], e.entryId).toBeTypeOf('string');
						if (e.type === 'key') {
							expect(E.keys[e.keyId], e.keyId).toBeTypeOf('string');
							if (e.bearer !== 'investigator') expect(E.characters[e.bearer], e.bearer).toBeTypeOf('string');
						}
						if (e.type === 'note') expect(E.effectText[e.textRef], e.textRef).toBeTypeOf('string');
					}
				}
			}
		}
	});

	it('pre-printed markers carry a box; written markers do not; track is 35 boxes', () => {
		const printed = new Set(['α', 'β', 'γ', 'ε', 'ζ', 'ω']);
		for (const m of loadLogic().timeMarkers) {
			if (printed.has(m.symbol)) expect(m.box, m.symbol).toBeGreaterThan(0);
			else expect(m.box, m.symbol).toBeUndefined();
		}
		expect(loadLogic().timeTrack.boxes).toBe(35);
	});

	it('every achievement carries a detect rule', () => {
		for (const a of loadLogic().achievements) expect(a.detect?.kind, a.id).toBeTypeOf('string');
	});
});
