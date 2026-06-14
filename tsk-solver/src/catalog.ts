/**
 * UI catalog helpers: selectable options for building constraints, and friendly display
 * labels for raw ids. Keeps consuming UIs thin — they never need to read the JSON directly.
 */

import { loadDatabase } from './data/load.js';
import type { NodeId } from './types.js';

export interface CatalogEntry {
	id: string;
	label: string;
	note?: string;
}

export interface SolverCatalog {
	achievements: CatalogEntry[];
	keys: CatalogEntry[];
	scenarios: CatalogEntry[];
	/** Scenarios that have selectable versions — INCLUDING the finale (its versions = the endings). */
	versionedScenarios: CatalogEntry[];
	narrativeChains: CatalogEntry[];
	allies: CatalogEntry[];
	/** One entry per standalone product (label = product name, id = the green node it routes to). */
	sideStories: CatalogEntry[];
	nodes: CatalogEntry[];
	/** scenarioId -> selectable resolutions (label = id, note = description). */
	resolutions: Record<string, CatalogEntry[]>;
	/** scenarioId -> selectable versions (label = human label). */
	versions: Record<string, CatalogEntry[]>;
	/** Finale Trial outcomes (the vote results that funnel into the three finale versions). */
	trials: CatalogEntry[];
}

/** The Trial-1 vote outcomes (guide §"Trial Outcomes"; see derbk "Scarlet Politics"). */
const TRIALS: CatalogEntry[] = [
	{ id: 'trial_2', label: 'Deemed a liability — escape the Coterie', note: 'Finale v.I' },
	{ id: 'trial_3', label: 'Overthrow the Red Coterie', note: 'Finale v.II (Trial 8)' },
	{ id: 'trial_4', label: 'Join the Red Coterie', note: 'Finale v.II (Trial 8)' },
	{ id: 'trial_5', label: 'Spared as an asset', note: 'Finale v.II (Trial 8)' },
	{ id: 'trial_6', label: 'They learn you know the truth — spared', note: 'Finale v.III' },
	{ id: 'trial_7', label: 'The Red Coterie is destroyed from within', note: 'Finale v.III' },
];

let _catalog: SolverCatalog | null = null;

export function catalog(): SolverCatalog {
	if (_catalog) return _catalog;
	const db = loadDatabase();
	const titleize = (id: string) => id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

	const scenarios: CatalogEntry[] = Object.entries(db.scenarios)
		.filter(([, s]) => s.role !== 'finale')
		.map(([id, s]) => ({ id, label: s.name }))
		.sort((a, b) => a.label.localeCompare(b.label));

	const versions: Record<string, CatalogEntry[]> = {};
	const resolutions: Record<string, CatalogEntry[]> = {};
	for (const [id, s] of Object.entries(db.scenarios)) {
		if (s.versions) {
			versions[id] = Object.entries(s.versions)
				.map(([vid, v]) => ({ id: vid, label: v.label ?? v.note ?? vid }))
				.sort((a, b) => a.id.localeCompare(b.id));
		}
		// Selectable resolutions: real outcomes (skip explicit campaign-loss dead ends).
		resolutions[id] = s.resolutions
			.filter((r) => r.outcome !== 'LOSE_CAMPAIGN')
			.map((r) => ({ id: r.id, label: r.id, note: r.desc ?? r.note }));
	}

	// One dropdown entry per standalone product (id = product id for `play_side_story`).
	const sideStories: CatalogEntry[] = [];
	for (const s of db.side_stories) {
		for (const product of s.products) {
			sideStories.push({
				id: product.id,
				label: product.name,
				note: `Played at ${getLocationName(s.node)} — costs ${product.xp_cost} time${s.grants_key ? '; awards a Key' : ''}`,
			});
		}
	}
	sideStories.sort((a, b) => a.label.localeCompare(b.label));

	// Scenarios with versions, finale included (the finale's "versions" are the three endings,
	// reached via the Trial groups v.I=2 / v.II=3·4·5 / v.III=6·7).
	const versionedScenarios: CatalogEntry[] = Object.entries(db.scenarios)
		.filter(([id]) => (versions[id]?.length ?? 0) > 0)
		.map(([id, s]) => ({ id, label: s.name }))
		.sort((a, b) => a.label.localeCompare(b.label));

	_catalog = {
		achievements: db.achievements
			.filter((a) => a.planning !== false)
			.map((a) => ({ id: a.id, label: a.label ?? titleize(a.id), note: a.requires }))
			.sort((a, b) => a.label.localeCompare(b.label)),
		keys: db.keys.map((k) => ({ id: k.id, label: titleize(k.id), note: k.character })).sort((a, b) => a.label.localeCompare(b.label)),
		scenarios,
		versionedScenarios,
		narrativeChains: Object.entries(db.narrative_chains)
			.map(([id, c]) => ({ id, label: c.label }))
			.sort((a, b) => a.label.localeCompare(b.label)),
		allies: db.allies
			.filter((a) => a.deck_asset)
			.map((a) => ({ id: a.id, label: a.name }))
			.sort((a, b) => a.label.localeCompare(b.label)),
		sideStories,
		nodes: db.locations.map((l) => ({ id: l.id, label: l.name })).sort((a, b) => a.label.localeCompare(b.label)),
		resolutions,
		versions,
		trials: TRIALS,
	};
	return _catalog;
}

function getLocationName(node: NodeId): string {
	return loadDatabase().locations.find((l) => l.id === node)?.name ?? node;
}

/** Friendly display label for any raw id (location, key, scenario, ally, or marker symbol). */
export function labelFor(id: string): string {
	const db = loadDatabase();
	const loc = db.locations.find((l) => l.id === id);
	if (loc) return loc.name;
	if (db.scenarios[id]) return db.scenarios[id]!.name;
	if (db.interludes[id]) return db.interludes[id]!.name;
	const ally = db.allies.find((a) => a.id === id);
	if (ally) return ally.name;
	const key = db.keys.find((k) => k.id === id);
	if (key) return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	const ach = db.achievements.find((a) => a.id === id);
	if (ach?.label) return ach.label;
	return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
