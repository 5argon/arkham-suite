import { describe, expect, it } from 'vitest';
import { loadDatabase, validateIntegrity } from '../src/data/load.js';

describe('data integrity (§9)', () => {
	it('loads without throwing', () => {
		expect(() => loadDatabase()).not.toThrow();
	});

	it('passes all integrity checks (no problems)', () => {
		const db = loadDatabase();
		expect(validateIntegrity(db)).toEqual([]);
	});

	it('has the expected campaign metadata', () => {
		const db = loadDatabase();
		expect(db.campaign_metadata.start_node).toBe('london');
		expect(db.campaign_metadata.finale_node).toBe('tunguska');
		expect(db.locations.length).toBe(db.campaign_metadata.location_count);
	});

	it('graph is symmetric', () => {
		const db = loadDatabase();
		const adj = new Map(db.locations.map((l) => [l.id, new Set(l.connections)]));
		for (const loc of db.locations) {
			for (const t of loc.connections) {
				expect(adj.get(t)?.has(loc.id), `${loc.id}<->${t}`).toBe(true);
			}
		}
	});

	it('detects injected corruption (orphan lock + bad edge)', () => {
		const db = loadDatabase();
		const broken = structuredClone(db);
		broken.locations[0]!.connections = [...broken.locations[0]!.connections, 'atlantis'];
		broken.locations[1]!.unlock_condition = 'code_never_written';
		const problems = validateIntegrity(broken);
		expect(problems.some((p) => p.includes('atlantis'))).toBe(true);
		expect(problems.some((p) => p.includes('orphan lock'))).toBe(true);
	});
});
