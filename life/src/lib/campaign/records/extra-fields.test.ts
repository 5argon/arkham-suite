import { describe, expect, it } from 'vitest';
import {
	clearExtras,
	decodeCardPairs,
	encodeCardPairs,
	hasExtras,
	readExtras,
	setExtra,
	withBearerLists,
} from './extra-fields';
import {
	RESERVED,
	makeEntry,
	scenarioChoicesFromLogs,
	scenarioResolutionsFromLogs,
	scenarioSkippedFromLogs,
	scenarioTiersFromLogs,
	scenarioXpFromLogs,
	type LocalLog,
} from './recorded-state';

const note = makeEntry('campaign_notes', 'campaign_notes.x');

function filled(): LocalLog[] {
	let logs: LocalLog[] = [note];
	logs = setExtra(logs, 'dead_heat', 'xp', '4');
	logs = setExtra(logs, 'dead_heat', 'earnedXp', '6');
	logs = setExtra(logs, 'dead_heat', 'resolution', 'R2');
	logs = setExtra(logs, 'dead_heat', 'skipped', '1');
	logs = setExtra(logs, 'dead_heat', 'choice.civilians_slain', '3');
	logs = setExtra(logs, 'dead_heat', 'tier.level', 'DH.t.1');
	logs = setExtra(logs, 'riddles_and_rain', 'xp', '2');
	return logs;
}

describe('extra fields', () => {
	it('writes each field to its reserved section, readable by the profile readers', () => {
		const logs = filled();
		expect(scenarioXpFromLogs(logs)).toEqual({ dead_heat: 4, riddles_and_rain: 2 });
		expect(scenarioResolutionsFromLogs(logs)).toEqual({ dead_heat: 'R2' });
		expect(scenarioSkippedFromLogs(logs)).toEqual(['dead_heat']);
		expect(scenarioChoicesFromLogs(logs)).toEqual({ 'dead_heat.civilians_slain': '3' });
		expect(scenarioTiersFromLogs(logs)).toEqual({ 'dead_heat.level': 'DH.t.1' });
		expect(logs.find((l) => l.section === RESERVED.standaloneEarnedXp)?.args).toEqual([
			{ type: 'number', value: '6' },
		]);
	});

	it('reads one scenario back by field', () => {
		expect(readExtras(filled(), 'dead_heat')).toEqual({
			xp: '4',
			earnedXp: '6',
			resolution: 'R2',
			skipped: '1',
			'choice.civilians_slain': '3',
			'tier.level': 'DH.t.1',
		});
		expect(readExtras(filled(), 'on_thin_ice')).toEqual({});
	});

	it('replaces a value and clears it with null or blank', () => {
		let logs = setExtra(filled(), 'dead_heat', 'xp', ' 7 ');
		expect(readExtras(logs, 'dead_heat').xp).toBe('7');
		logs = setExtra(logs, 'dead_heat', 'xp', 'abc');
		expect(readExtras(logs, 'dead_heat').xp).toBe('0');
		logs = setExtra(logs, 'dead_heat', 'xp', '');
		expect(readExtras(logs, 'dead_heat').xp).toBeUndefined();
		logs = setExtra(logs, 'dead_heat', 'skipped', null);
		expect(readExtras(logs, 'dead_heat').skipped).toBeUndefined();
	});

	it('clears every field of one scenario, including the standalone earned XP', () => {
		const onlyEarned = setExtra([note], 'carnevale_of_horrors', 'earnedXp', '5');
		expect(hasExtras(onlyEarned, 'carnevale_of_horrors')).toBe(true);
		expect(clearExtras(onlyEarned, 'carnevale_of_horrors')).toEqual([note]);

		const cleared = clearExtras(filled(), 'dead_heat');
		expect(hasExtras(cleared, 'dead_heat')).toBe(false);
		expect(readExtras(cleared, 'riddles_and_rain')).toEqual({ xp: '2' });
		expect(cleared).toContain(note);
	});
});

describe('bearer lists', () => {
	it('folds an _investigator companion into its cards choice', () => {
		const choices = [
			{ id: 'randomized_weakness', control: 'cards' },
			{ id: 'randomized_weakness_investigator', control: 'cards' },
			{ id: 'hastur_version', control: 'dropdown' },
		];
		expect(withBearerLists(choices).map((c) => [c.choice.id, c.bearers?.id])).toEqual([
			['randomized_weakness', 'randomized_weakness_investigator'],
			['hastur_version', undefined],
		]);
	});

	it('round-trips the index-paired lists', () => {
		const pairs = decodeCardPairs('01096,01097', '01001,01002');
		expect([...pairs]).toEqual([
			['01001', '01096'],
			['01002', '01097'],
		]);
		expect(encodeCardPairs(pairs)).toEqual({ cards: '01096,01097', investigators: '01001,01002' });
		expect(decodeCardPairs('', '01001').size).toBe(0);
	});
});
