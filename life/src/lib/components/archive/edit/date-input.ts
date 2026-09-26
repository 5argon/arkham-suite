/** A timestamp's local calendar date as a date input value (`YYYY-MM-DD`); '' for none. */
export function toDateInput(ms: number | null): string {
	if (ms == null) return '';
	const d = new Date(ms);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** A date input value as local midnight of that day; null when blank. */
export function fromDateInput(value: string): number | null {
	const [y, mo, d] = value.split('-').map(Number);
	return value && y && mo && d ? new Date(y, mo - 1, d).getTime() : null;
}
