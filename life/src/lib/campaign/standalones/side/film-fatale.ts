/** Film Fatale: which of the three films each play shot and wrapped, André Patel, and the call time. */
import { tallyPlays, type Play } from '../../records/play';
import type { Tally } from '../../utils/tally';
import { defineStandalonePage } from '../define';
import { pickedCards, type StandaloneRules } from '../rules';

const S = 'film_fatale';

/** Each film, its prop (the one not in the victory display at Take Two) and the resolution that wraps it. */
export const FILMS = [
	{ id: 'cosmic', prop: '72005', wrapped: 'R2', boss: '72032' },
	{ id: 'island', prop: '72006', wrapped: 'R3', boss: '72044' },
	{ id: 'contessa', prop: '72007', wrapped: 'R4', boss: '72055' }
] as const;

export type FilmId = (typeof FILMS)[number]['id'];

export const ANDRE_PATEL_CODE = '72024';

/** The film a play shot: its resolution names it, else the prop missing from the victory display. */
function filmOf(p: Play): FilmId | null {
	const r = p.resolution(S);
	if (r === 'R1' || r === 'R2') return 'cosmic';
	if (r === 'R3') return 'island';
	if (r === 'R4') return 'contessa';
	const props = pickedCards(p, S, 'ask_which_props');
	if (props.length !== 2) return null;
	return FILMS.find((f) => !props.includes(f.prop))?.id ?? null;
}

export const FILM_RULES: StandaloneRules = {
	scenario: S,
	prefix: 'film',
	endings: [
		{ id: 'cosmic', kind: 'win', resolutions: ['R2'], code: '72032' },
		{ id: 'island', kind: 'win', resolutions: ['R3'], code: '72044' },
		{ id: 'contessa', kind: 'win', resolutions: ['R4'], code: '72055' },
		{ id: 'cosmic_failed', kind: 'loss', resolutions: ['R1'], code: '72032b' },
		{ id: 'defeated', kind: 'loss', resolutions: ['no_resolution'], code: '72022' }
	],
	cards: [
		{
			code: ANDRE_PATEL_CODE,
			earned: (p) => p.choice(S, 'ask_andre_patel') === 'yes' && p.resolution(S) !== 'R1'
		}
	]
};

export const buildFilmFatale = defineStandalonePage(FILM_RULES, (plays) => {
	const films = {} as Record<FilmId, { shot: Tally; wrapped: Tally }>;
	for (const f of FILMS)
		films[f.id] = {
			shot: tallyPlays(plays, (p) => filmOf(p) === f.id),
			wrapped: tallyPlays(plays, (p) => p.resolution(S) === f.wrapped)
		};
	return {
		films,
		callTime: tallyPlays(plays, (p) => p.choice(S, 'ask_made_their_call_time') === 'cheat')
	};
});
