import { describe, expect, it } from 'vitest';
import { fromDateInput, toDateInput } from './date-input';

describe('date input helpers', () => {
	it('round-trips a calendar date through local midnight', () => {
		const ms = fromDateInput('2023-01-26')!;
		expect(new Date(ms).getHours()).toBe(0);
		expect(new Date(ms).getDate()).toBe(26);
		expect(toDateInput(ms)).toBe('2023-01-26');
	});

	it('shows the local date of any time of day', () => {
		expect(toDateInput(new Date(2026, 8, 26, 0, 30).getTime())).toBe('2026-09-26');
		expect(toDateInput(new Date(2026, 8, 26, 23, 59).getTime())).toBe('2026-09-26');
	});

	it('treats blank as no date', () => {
		expect(toDateInput(null)).toBe('');
		expect(fromDateInput('')).toBeNull();
	});
});
