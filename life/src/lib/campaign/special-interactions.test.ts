import { describe, it, expect } from 'vitest';
import { buildSpecialInteractions, resolveSpecialInteractions, type CardLookup } from './special-interactions';
import type { CampaignRecord } from './achievement-aggregate';

const lookup: CardLookup = (code) => {
	if (code === '03006') return { factions: ['rogue'], traits: ['Performer'] };
	if (code === '01001') return { factions: ['guardian'], traits: ['Agency'] };
	return undefined;
};

function rec(partial: Partial<CampaignRecord>): CampaignRecord {
	return { campaignCode: 'ptc', recorded: { recordedLogs: new Set() }, manual: new Set(), ...partial } as CampaignRecord;
}

describe('special interactions builder', () => {
	it('lights Lola when she played PtC (roster + prologue reached)', () => {
		const records = [rec({ campaignCode: 'ptc', campaignId: 'c1', route: ['curtain_call'], recorded: { recordedLogs: new Set(['x']) } })];
		const partial = buildSpecialInteractions(records);
		const resolved = resolveSpecialInteractions(partial, { c1: ['03006'] }, lookup);
		const ptc = resolved.find((r) => r.family === 'ptc')!;
		const lola = ptc.interactions.find((i) => i.id === 'check_lola_hayes')!;
		expect(lola.triggered).toBe(true);
		expect(lola.triggeredBy).toEqual(['03006']);
	});

	it('does NOT light Lola when she was not in the roster', () => {
		const records = [rec({ campaignCode: 'ptc', campaignId: 'c1', route: ['curtain_call'] })];
		const resolved = resolveSpecialInteractions(buildSpecialInteractions(records), { c1: ['01001'] }, lookup);
		const lola = resolved.find((r) => r.family === 'ptc')!.interactions.find((i) => i.id === 'check_lola_hayes')!;
		expect(lola.triggered).toBe(false);
	});

	it('lights a log-recorded TCU moment from the recorded log (no roster needed)', () => {
		const records = [rec({ campaignCode: 'tcu', campaignId: 'c2', recorded: { recordedLogs: new Set(['campaign_notes.arrested_anette']) } })];
		const resolved = resolveSpecialInteractions(buildSpecialInteractions(records), {}, lookup);
		const ua = resolved.find((r) => r.family === 'tcu')!.interactions.find((i) => i.id === 'under_arrest')!;
		expect(ua.triggered).toBe(true); // log-proven, no roster needed
	});

	it('skips optional (Tier D) dreams entirely', () => {
		const records = [rec({ campaignCode: 'tdea', campaignId: 'c3', route: ['beyond_the_gates_of_sleep'] })];
		const resolved = resolveSpecialInteractions(buildSpecialInteractions(records), { c3: ['03006'] }, lookup);
		const tdea = resolved.find((r) => r.family === 'tdea');
		expect(tdea?.interactions.some((i) => i.id === 'guardian')).toBe(false);
	});
});

describe('family presence', () => {
	it('emits a tskc family with all 6 (non-optional) interactions for a TSK play', () => {
		const r = rec({
			campaignCode: 'tsk',
			campaignId: 'c9',
			route: ['sanguine_shadows', 'dancing_mad', 'on_thin_ice', 'dogs_of_war', 'shades_of_suffering', 'whistle_on_the_wind'],
			recorded: { recordedLogs: new Set(['x']) },
		});
		const resolved = resolveSpecialInteractions(buildSpecialInteractions([r]), { c9: ['09999'] }, () => ({
			factions: ['rogue'],
			traits: ['Criminal'],
		}));
		expect(resolved.find((x) => x.family === 'tskc')?.interactions.length).toBe(6);
	});
});

describe('via credit (recency + cap)', () => {
	it('shows the 5 most-recent distinct investigators who satisfied a trait gate', () => {
		// 6 TSK plays of a Criminal-gated scenario, each a different Criminal, finish
		// dates ascending → p6 newest. Expect the 5 newest, newest first (p1 dropped).
		const crimLookup: CardLookup = () => ({ factions: ['rogue'], traits: ['Criminal'] });
		const route = ['sanguine_shadows'];
		const recs = [1, 2, 3, 4, 5, 6].map((n) =>
			rec({ campaignCode: 'tsk', campaignId: `p${n}`, finishDate: n * 100, route, recorded: { recordedLogs: new Set(['x']) } }),
		);
		const inv = { p1: ['11'], p2: ['22'], p3: ['33'], p4: ['44'], p5: ['55'], p6: ['66'] };
		const resolved = resolveSpecialInteractions(buildSpecialInteractions(recs), inv, crimLookup);
		const crim = resolved.find((r) => r.family === 'tskc')!.interactions.find((i) => i.id === 'check_criminal_trait')!;
		expect(crim.triggered).toBe(true);
		expect(crim.triggeredBy).toEqual(['66', '55', '44', '33', '22']); // newest first, capped at 5
	});
});
