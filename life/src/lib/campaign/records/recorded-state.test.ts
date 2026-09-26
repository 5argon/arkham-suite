import { describe, expect, it } from 'vitest';
import type { CampaignLog } from '@5argon/arkham-campaign-data';
import {
	CROSSED_MARK,
	RESERVED,
	entriesInSection,
	chaosBagEntries,
	hydrate,
	isInterconnected,
	makeEntry,
	manualTickKey,
	partnerArgs,
	readPartner,
	recordedLogKeys,
	replaceSection,
	toRecordedState,
	toSavePayload,
	withInterconnected,
	type LocalLog,
} from './recorded-state';
import type { CampaignLogEntry } from '$lib/database/document';

// Minimal fake log: only `db.sections` (type classification) is read by the codec.
const LOG = {
	db: {
		sections: [
			{ id: 'campaign_notes', type: 'notes' },
			{ id: 'yigs_fury', type: 'count' },
			{ id: 'supplies', type: 'supplies' },
			{ id: 'task_progress', type: 'investigatorCount' },
			{ id: 'expedition_team', type: 'partner' },
		],
	},
} as unknown as CampaignLog;

describe('hydrate', () => {
	it('adds a unique client id and round-trips through toSavePayload', () => {
		const stored: CampaignLogEntry[] = [
			{ key: 'campaign_notes.accepted_fate', section: 'campaign_notes', args: [] },
			{ key: 'yigs_fury', section: 'yigs_fury', args: [{ type: 'number', value: '25' }] },
		];
		const out = hydrate(stored);
		expect(new Set(out.map((l) => l.clientId)).size).toBe(2);
		expect(toSavePayload(out)).toEqual(stored);
	});
});

describe('toSavePayload', () => {
	it('drops clientId and PRESERVES entry order (order implies play sequence)', () => {
		const logs: LocalLog[] = [
			makeEntry('yigs_fury', 'yigs_fury', [{ type: 'number', value: '3' }]),
			makeEntry('campaign_notes', 'campaign_notes.b'),
			makeEntry('campaign_notes', 'campaign_notes.a'),
		];
		const payload = toSavePayload(logs);
		expect(payload.map((p) => p.key)).toEqual([
			'yigs_fury',
			'campaign_notes.b',
			'campaign_notes.a',
		]);
		expect(payload[0]).not.toHaveProperty('clientId');
	});
});

describe('toRecordedState', () => {
	it('classifies entries by section type into the right RecordedCampaignState buckets', () => {
		const logs: LocalLog[] = [
			makeEntry('campaign_notes', 'campaign_notes.accepted_fate'),
			makeEntry('campaign_notes', 'campaign_notes.paths_known', [{ type: 'number', value: '6' }]),
			makeEntry('yigs_fury', 'yigs_fury', [{ type: 'number', value: '25' }]),
			makeEntry('supplies', 'supplies.provisions'),
			makeEntry('supplies', 'supplies.medicine'),
			makeEntry(RESERVED.chaosBag, 'tablet', [{ type: 'number', value: '2' }]),
			makeEntry(RESERVED.ultimatums, 'some_ultimatum'),
			makeEntry('expedition_team', 'expedition_team.kensler', [
				{ type: 'string', value: 'resolute' },
			]),
		];
		const state = toRecordedState(LOG, logs, { difficulty: 'expert' });

		expect(state.recordedLogs?.has('campaign_notes.accepted_fate')).toBe(true);
		expect(state.logCounts?.['campaign_notes.paths_known']).toBe(6);
		expect(state.logCounts?.['yigs_fury']).toBe(25);
		expect([...(state.recordedSectionItems?.supplies ?? [])].sort()).toEqual(['medicine', 'provisions']);
		expect(state.finalChaosBag?.['tablet']).toBe(2);
		expect(state.ultimatums).toEqual(['some_ultimatum']);
		expect(state.partnerStatuses?.expedition_team?.kensler?.has('resolute')).toBe(true);
		expect(state.difficulty).toBe('expert');
	});

	it('flags crossed-off notes entries in crossedLogs while keeping them in recordedLogs', () => {
		const logs: LocalLog[] = [
			makeEntry('campaign_notes', 'campaign_notes.kept'),
			makeEntry('campaign_notes', 'campaign_notes.spent', [{ type: 'string', value: CROSSED_MARK }]),
		];
		const state = toRecordedState(LOG, logs);
		// Both stay present (recordedLogs is a superset)…
		expect(state.recordedLogs?.has('campaign_notes.kept')).toBe(true);
		expect(state.recordedLogs?.has('campaign_notes.spent')).toBe(true);
		// …but only the crossed-off one is flagged crossed.
		expect(state.crossedLogs?.has('campaign_notes.spent')).toBe(true);
		expect(state.crossedLogs?.has('campaign_notes.kept')).toBe(false);
	});

	it('omits crossedLogs entirely when nothing is crossed off', () => {
		const state = toRecordedState(LOG, [makeEntry('campaign_notes', 'campaign_notes.kept')]);
		expect(state.crossedLogs).toBeUndefined();
	});

	it('reads a legacy standalone-log entry under its real entry key', () => {
		const key = 'fortune_and_folly_part_1::campaign_notes.cell_meddled_in_abarrans_affairs';
		const state = toRecordedState(LOG, [makeEntry(RESERVED.standaloneLog, key)]);
		expect(state.recordedLogs?.has('campaign_notes.cell_meddled_in_abarrans_affairs')).toBe(true);
		expect(state.recordedLogs?.has(key)).toBe(false);
	});

	it('takes the max for a per-investigator counter section', () => {
		const logs: LocalLog[] = [
			makeEntry('task_progress', 'task_progress.01001', [{ type: 'number', value: '3' }]),
			makeEntry('task_progress', 'task_progress.02002', [{ type: 'number', value: '6' }]),
		];
		const state = toRecordedState(LOG, logs);
		expect(state.logCounts?.['task_progress']).toBe(6);
	});
});

describe('recordedLogKeys', () => {
	it('returns only real (non-reserved) composite keys for the validation gate', () => {
		const logs: LocalLog[] = [
			makeEntry('campaign_notes', 'campaign_notes.x'),
			makeEntry(RESERVED.chaosBag, 'tablet', [{ type: 'number', value: '1' }]),
		];
		expect([...recordedLogKeys(logs)]).toEqual(['campaign_notes.x']);
	});
});

describe('section slice helpers', () => {
	it('entriesInSection / replaceSection preserve other sections', () => {
		const a = makeEntry('campaign_notes', 'campaign_notes.a');
		const b = makeEntry('yigs_fury', 'yigs_fury', [{ type: 'number', value: '1' }]);
		const logs = [a, b];
		expect(entriesInSection(logs, 'campaign_notes')).toEqual([a]);
		const c = makeEntry('campaign_notes', 'campaign_notes.c');
		const next = replaceSection(logs, 'campaign_notes', [c]);
		expect(next.filter((l) => l.section === 'yigs_fury')).toEqual([b]);
		expect(next.filter((l) => l.section === 'campaign_notes')).toEqual([c]);
	});
});

describe('partner codec', () => {
	it('round-trips marks and omits an untouched member', () => {
		const marks = { nameCrossed: false, resolute: true, mia: true, miaCrossed: false, damage: 2, horror: 0 };
		const args = partnerArgs(marks)!;
		expect(args).toEqual([
			{ type: 'string', value: 'resolute' },
			{ type: 'string', value: 'mia' },
			{ type: 'number', value: '2' },
			{ type: 'number', value: '0' },
		]);
		expect(readPartner(args)).toEqual(marks);
		expect(partnerArgs(readPartner([]))).toBeNull();
	});

	it('exposes the flags as partner statuses', () => {
		const args = partnerArgs({ ...readPartner([]), nameCrossed: true })!;
		const state = toRecordedState(LOG, [makeEntry('expedition_team', 'expedition_team.dyer', args)]);
		expect(state.partnerStatuses?.expedition_team?.dyer?.has('name_crossed')).toBe(true);
	});
});

describe('editor helpers', () => {
	it('builds manual tick keys', () => {
		expect(manualTickKey('a')).toBe('a');
		expect(manualTickKey('a', null)).toBe('a');
		expect(manualTickKey('a', 'x')).toBe('a::x');
	});

	it('writes zero-count chaos-bag entries', () => {
		const state = toRecordedState(LOG, chaosBagEntries({ frost: 0, skull: 2 }));
		expect(state.finalChaosBag).toEqual({ frost: 0, skull: 2 });
	});

	it('swaps the TDE interconnected / half-campaign flags', () => {
		const on = withInterconnected([makeEntry('hidden', 'hidden.half_campaign')], true);
		expect(on.map((l) => l.key)).toEqual(['hidden.interconnected_campaign']);
		expect(isInterconnected(on)).toBe(true);
		const off = withInterconnected(on, false);
		expect(off.map((l) => l.key)).toEqual(['hidden.half_campaign']);
		expect(isInterconnected(off)).toBe(false);
	});
});
