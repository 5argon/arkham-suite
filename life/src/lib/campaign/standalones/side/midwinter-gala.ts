/** The Midwinter Gala: the score to beat, which faction invited you, and the guests you took home. */
import { choiceNumber, tallyPlays, tallyValues, type Play } from '../../records/play';
import type { Tally } from '../../utils/tally';
import { defineStandalonePage } from '../define';
import { pickedCards, type StandaloneRules } from '../rules';

const S = 'the_midwinter_gala';

/** Each faction with its leader, in ArkhamCards' order (Resolutions 2–6). */
export const MWG_FACTIONS = [
	{ id: 'foundation', leader: '71016', guests: ['71017', '71018', '71019'] },
	{ id: 'university', leader: '71022', guests: ['71023', '71024', '71025'] },
	{ id: 'syndicate', leader: '71028', guests: ['71029', '71030', '71031'] },
	{ id: 'lodge', leader: '71034', guests: ['71035', '71036', '71037'] },
	{ id: 'locals', leader: '71040', guests: ['71041', '71042', '71043'] }
] as const;

/** Bonus experience by score: under 10 none, then 1 more per 10 points up to 5 at 50. */
export function mwgBand(score: number): number {
	return Math.min(5, Math.floor(score / 10));
}

const score = (p: Play) => choiceNumber(p, S, 'score');

export const MWG_RULES: StandaloneRules = {
	scenario: S,
	prefix: 'mwg',
	endings: [
		{ id: 'jewel', kind: 'win', resolutions: ['R1'], code: '71052' },
		{ id: 'defeated', kind: 'loss', resolutions: ['no_resolution'], code: '71045b' }
	],
	cards: MWG_FACTIONS.flatMap((f) =>
		f.guests.map((code) => ({
			code,
			earned: (p: Play) => pickedCards(p, S, 'choose_one_guest').includes(code)
		}))
	)
};

export const buildMidwinterGala = defineStandalonePage(MWG_RULES, (plays) => {
	const factions = {} as Record<
		(typeof MWG_FACTIONS)[number]['id'],
		{ plays: Tally; escaped: Tally }
	>;
	for (const f of MWG_FACTIONS) {
		const chose = (p: Play) => p.choice(S, 'choose_faction') === f.id;
		factions[f.id] = {
			plays: tallyPlays(plays, chose),
			escaped: tallyPlays(plays, (p) => chose(p) && p.resolution(S) === 'R1')
		};
	}
	const scores = plays.map(score).filter((n): n is number => n != null);
	return {
		scores: tallyValues(plays, score),
		/** Plays per bonus-experience band (0–5). */
		bands: tallyValues(plays, (p) => {
			const n = score(p);
			return n == null ? undefined : mwgBand(n);
		}),
		bestScore: scores.length ? Math.max(...scores) : null,
		factions
	};
});
