import { GlobalSettings_PipStyle } from '$lib/proto/generated/global_settings';
import { wrapPips, wrapSmall } from '$lib/tool/script/export/ahdb-syntax';

export function makePipsStyle(
	p: number,
	ps: GlobalSettings_PipStyle,
	shouldSmall: boolean,
	ignoreSmall: boolean
): string {
	let pips: string;
	switch (ps) {
		case GlobalSettings_PipStyle.PipsReal:
			pips = wrapPips(makePips(p));
			break;
		case GlobalSettings_PipStyle.Pips:
			pips = makePips(p);
			break;
		case GlobalSettings_PipStyle.Number:
			pips = makePips(p);
			break;
		default:
			pips = '';
			break;
	}
	if (pips.length > 0 && shouldSmall && !ignoreSmall) {
		pips = wrapSmall(pips);
	}
	return pips;
}

export function makePips(p: number): string {
	const pipCharacter = '•';
	const newPips: string[] = [];
	if (p !== null) {
		for (let i = 0; i < p; i++) {
			newPips.push(pipCharacter);
		}
	}
	return newPips.join('');
}

export function makeParentheses(p: number): string {
	return `(${p})`;
}
