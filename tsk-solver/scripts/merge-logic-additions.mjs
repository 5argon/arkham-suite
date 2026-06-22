#!/usr/bin/env node
/**
 * Re-applies the engine-required metadata that was hand-added to logic.json, idempotently.
 *
 * If you regenerate logic.json from your own source pipeline, these additions would be lost.
 * Run this after each regen to put them back (it overwrites only these fields; everything else,
 * including your new `availableInVersions` data, is untouched):
 *
 *   node scripts/merge-logic-additions.mjs [path/to/logic.json]
 *
 * Default path: src/data/new/logic.json. Safe to run repeatedly (idempotent).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2] ?? new URL('../src/data/new/logic.json', import.meta.url).pathname;
const logic = JSON.parse(readFileSync(path, 'utf8'));

// 1. Time track length.
logic.timeTrack = {
	boxes: 35,
	note: 'The global time track is 35 boxes. Printed Greek markers fire their status report when their box is filled; written markers (Θ/ψ/δ) are placed onto the track at runtime by statusMarker effects and fire when reached. ω is the final box and forces the finale.',
};

// 2. Printed-marker box positions (written markers Θ/ψ/δ intentionally have none).
const MARKER_BOX = { α: 7, β: 15, γ: 24, ε: 10, ζ: 20, ω: 35 };
for (const m of logic.timeMarkers ?? []) {
	if (MARKER_BOX[m.symbol] !== undefined) m.box = MARKER_BOX[m.symbol];
	else delete m.box;
}

// 3. Achievement detection rules (+ non-planning flags).
const DETECT = {
	'ach.cluedIn': { kind: 'visitFile', fileCode: '5-A', inSession: true },
	'ach.takeThatGhulat': { kind: 'visitFile', fileCode: '11-B', maxEntryTime: 10, inSession: true },
	'ach.whatsInAName': { kind: 'resolution', fileCode: '11-B', optionId: 'DH.R3' },
	'ach.porqueNoLosDos': { kind: 'version', fileCode: '28-I', optionId: 'DM.v2', inSession: true },
	'ach.lostAndFound': { kind: 'visitFile', fileCode: '21-F', inSession: true },
	'ach.towerDefense': { kind: 'version', fileCode: '38-N', optionId: 'DOW.v1', inSession: true },
	'ach.playWithYourFood': { kind: 'version', fileCode: '38-N', optionId: 'DOW.v2', inSession: true },
	'ach.destroyedChimera': { kind: 'resolution', fileCode: '33-K', optionId: 'OTI.R2', inSession: true },
	'ach.whoWatchesWatcher': { kind: 'resolution', fileCode: '16-D', optionId: 'SS.R2', inSession: true },
	'ach.underMyUmbrella': { kind: 'visitFile', fileCode: '46-Q', inSession: true },
	'ach.allHollow': { kind: 'visitFile', fileCode: '56-Y' },
	'ach.redLooksGood': { kind: 'finaleJudgment', judgmentId: 'COTK.judgment.join' },
	'ach.bloodyRedRevolution': { kind: 'finaleJudgment', judgmentId: 'COTK.judgment.overthrow' },
	'ach.powersCombined': { kind: 'tableFeat' },
	'ach.giftOfGab': { kind: 'tableFeat' },
	'ach.localCuisine': { kind: 'visitLocations', locationIds: ['marrakesh', 'havana', 'buenosAires', 'tokyo', 'kualaLumpur'] },
	'ach.speedDemon': { kind: 'timeCap', maxTime: 17 },
	'ach.trustNobody': { kind: 'chaos', token: 'elderThing', count: 4, inSession: true },
	'ach.trustEverybody': { kind: 'chaos', token: 'tablet', count: 4, inSession: true },
	'ach.hereIsYourBadge': { kind: 'epilogue', optionId: 'EP.permanent' },
	'ach.keyToMyHeart': { kind: 'allKeys' },
	'ach.lineInTheSand': { kind: 'tableFeat' },
	'ach.globalExpertise': { kind: 'difficulty', difficulty: 'expert' },
};
const PLANNING_FALSE = new Set(['ach.keyToMyHeart', 'ach.globalExpertise']);
for (const a of logic.achievements ?? []) {
	if (DETECT[a.id]) a.detect = DETECT[a.id];
	if (PLANNING_FALSE.has(a.id)) a.planning = false;
	else delete a.planning;
}

// 4. Schema docs for the added fields.
logic._schema ??= {};
logic._schema.timeMarkers =
	'Time-track markers. symbol is what\'s printed in the time box; id bridges to en.timeMarkers for a succinct label; reportOptionId points to the StatusReports option whose effects/fullText fire when reached (null for δ, which is a silent timer used by the Dr. Irawan deadline). box = the printed box on the 35-box track where this marker sits and fires (α7 ε10 β15 ζ20 γ24 ω35); markers WITHOUT a box (Θ/ψ/δ) are written onto the track at runtime by statusMarker effects and fire when that written box is reached. Flags: unlocksFinale (β makes Tunguska travellable), forcesFinale (ω sends you straight to the finale). See timeTrack for the track length.';
logic._schema.achievements =
	'id bridges to en.achievements for name/description. detect = the machine rule a planner uses to decide whether a plan earns the achievement; kinds: visitFile{fileCode,maxEntryTime?}, resolution{fileCode,optionId}, version{fileCode,optionId} (the scenario_version/finale-version option that fired), finaleJudgment{judgmentId}, timeCap{maxTime}, chaos{token,count}, epilogue{optionId}, visitLocations{locationIds}, allKeys, difficulty{difficulty}, tableFeat (pure in-play feat, no routing). inSession:true => routing only POSITIONS the player; the feat itself is unverifiable by the planner. planning:false => not a single-run planning goal (key collection / difficulty).';

writeFileSync(path, JSON.stringify(logic, null, 2) + '\n');
console.log(`Merged engine metadata into ${path}: timeTrack, ${Object.keys(MARKER_BOX).length} marker boxes, ${Object.keys(DETECT).length} achievement detect rules.`);
console.log('Wrote 2-space-indented JSON (matching the current file). Re-run your own formatter if your generator differs.');
