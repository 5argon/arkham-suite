import { describe, expect, it } from 'vitest';
import { distance, isNodeUnlocked, isPassable, lockableNodes } from '../src/graph/graph.js';
import { resetAll } from './helpers.js';

resetAll();

describe('graph', () => {
	it('the start (London) is always stoppable; a locked node (Tunguska) is not until unlocked', () => {
		const none = new Set<string>();
		expect(isNodeUnlocked('london', none)).toBe(true);
		expect(isNodeUnlocked('tunguska', none)).toBe(false);
		expect(isNodeUnlocked('tunguska', new Set(['tunguska']))).toBe(true);
		expect(lockableNodes().has('tunguska')).toBe(true);
		expect(lockableNodes().has('london')).toBe(false);
	});

	it('a locked node is PASSABLE for travel even when you cannot stop there', () => {
		const none = new Set<string>();
		// Tunguska is locked (can't stop) but still reachable — the cell can pass through it.
		expect(isNodeUnlocked('tunguska', none)).toBe(false);
		expect(isPassable('tunguska', none)).toBe(true);
		expect(Number.isFinite(distance(none, 'london', 'tunguska'))).toBe(true);
	});

	it('a secret node (Bermuda Triangle) blocks travel until it is revealed', () => {
		const none = new Set<string>();
		expect(isPassable('bermudaTriangle', none)).toBe(false);
		expect(distance(none, 'london', 'bermudaTriangle')).toBe(Infinity);
		expect(Number.isFinite(distance(new Set(['bermudaTriangle']), 'london', 'bermudaTriangle'))).toBe(true);
	});

	it('basic distances', () => {
		const none = new Set<string>();
		expect(Number.isFinite(distance(none, 'london', 'marrakesh'))).toBe(true);
		expect(distance(none, 'london', 'london')).toBe(0);
	});
});
