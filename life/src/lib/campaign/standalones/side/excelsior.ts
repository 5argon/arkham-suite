/** Murder at the Excelsior Hotel: which of the ten True Culprits each play uncovered and solved, and Sergeant Monroe. */
import { tallyPlays, type Play } from '../../records/play';
import { emptyTally, bumpTally, type Tally } from '../../utils/tally';
import { defineStandalonePage } from '../define';
import { pickedCards, type StandaloneRules } from '../rules';

const S = 'murder_at_the_excelsior_hotel';

/**
 * The True Culprit v. I–X: which two [[Lead]] assets the players control picks the version.
 * `agenda` is its agenda card, `boss` the enemy behind it.
 */
export const MEH_CULPRITS = [
	{ id: 'I', leads: ['84028', '84040'], agenda: '84043', boss: '84041' },
	{ id: 'II', leads: ['84028', '84037'], agenda: '84044', boss: '84029' },
	{ id: 'III', leads: ['84028', '84031'], agenda: '84045', boss: '84032' },
	{ id: 'IV', leads: ['84028', '84034'], agenda: '84046', boss: '84029' },
	{ id: 'V', leads: ['84040', '84037'], agenda: '84047', boss: '84041' },
	{ id: 'VI', leads: ['84040', '84031'], agenda: '84048', boss: '84032' },
	{ id: 'VII', leads: ['84040', '84034'], agenda: '84049', boss: '84035' },
	{ id: 'VIII', leads: ['84037', '84031'], agenda: '84050', boss: '84038' },
	{ id: 'IX', leads: ['84037', '84034'], agenda: '84051', boss: '84038' },
	{ id: 'X', leads: ['84031', '84034'], agenda: '84052', boss: '84035' }
] as const;

export type MehCulpritId = (typeof MEH_CULPRITS)[number]['id'];

export const MEH_MONROE_CODE = '84008';

function culpritOf(p: Play): MehCulpritId | null {
	const leads = pickedCards(p, S, 'choose_lead_assets');
	if (leads.length !== 2) return null;
	return MEH_CULPRITS.find((c) => c.leads.every((l) => leads.includes(l)))?.id ?? null;
}

const solved = (p: Play) => p.resolution(S) === 'R1' || p.has('meh_excelsior_is_quiet_for_now');
const believed = (p: Play) => p.choice(S, 'check_police_on_your_side') === 'yes';

export const MEH_RULES: StandaloneRules = {
	scenario: S,
	prefix: 'meh',
	endings: [
		{
			id: 'quiet',
			kind: 'win',
			resolutions: ['R1'],
			notes: ['meh_excelsior_is_quiet_for_now'],
			code: '84010'
		},
		{ id: 'woke', kind: 'loss', resolutions: ['R2'], code: '84014' },
		{
			id: 'another_victim',
			kind: 'loss',
			resolutions: ['no_resolution_defeated'],
			notes: ['meh_excelsior_claims_another_victim']
		},
		{ id: 'arrested', kind: 'loss', resolutions: ['R3'], code: '84009' },
		{
			id: 'fled',
			kind: 'loss',
			resolutions: ['no_resolution'],
			notes: ['meh_fled_scene_of_the_crime']
		}
	],
	cards: [{ code: MEH_MONROE_CODE, earned: (p) => solved(p) && believed(p) }]
};

export const buildExcelsior = defineStandalonePage(MEH_RULES, (plays) => {
	const culprits = {} as Record<MehCulpritId, { plays: Tally; solved: Tally }>;
	for (const c of MEH_CULPRITS) culprits[c.id] = { plays: emptyTally(), solved: emptyTally() };
	for (const p of plays) {
		const id = culpritOf(p);
		if (!id) continue;
		bumpTally(culprits[id].plays, p.tier);
		if (solved(p)) bumpTally(culprits[id].solved, p.tier);
	}
	const told = (p: Play) => p.choice(S, 'choose_inspector_monroe') === 'tell_truth';
	const lied = (p: Play) => p.choice(S, 'choose_inspector_monroe') === 'lie';
	return {
		culprits,
		monroe: {
			truthBelieved: tallyPlays(plays, (p) => told(p) && believed(p)),
			truthDoubted: tallyPlays(
				plays,
				(p) => told(p) && p.choice(S, 'check_police_on_your_side') === 'no'
			),
			lieBelieved: tallyPlays(plays, (p) => lied(p) && believed(p)),
			lieDoubted: tallyPlays(
				plays,
				(p) => lied(p) && p.choice(S, 'check_police_on_your_side') === 'no'
			)
		}
	};
});
