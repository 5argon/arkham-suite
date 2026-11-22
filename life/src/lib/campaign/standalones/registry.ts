/** Every standalone page with numbers of its own, by page key (see `standaloneKey`). */
import type { StandalonePlayRecord } from './define';
import { buildCarnevale, buildRougarou } from './side/bayou-and-carnevale';
import { buildBlob, buildBlobElse } from './side/blob';
import { CHALLENGES, buildChallenge, buildEncore, buildMeowlathotep } from './side/challenges';
import { buildLabyrinths, buildMachinations, buildOuterGods } from './side/epic-multiplayer';
import { buildExcelsior } from './side/excelsior';
import { buildFilmFatale } from './side/film-fatale';
import { buildFortuneAndFolly } from './side/fortune-and-folly';
import { buildEternalSlumber, buildNightsUsurper } from './side/guardians-of-the-abyss';
import { buildMidwinterGala } from './side/midwinter-gala';
import { buildTtn } from './ttn';

const challenge = Object.fromEntries(
	CHALLENGES.map((c) => [`side.${c.scenario}`, buildChallenge(c)])
) as {
	[
		K in
			| 'side.read_or_die'
			| 'side.all_or_nothing'
			| 'side.bad_blood'
			| 'side.by_the_book'
			| 'side.red_tide_rising'
			| 'side.laid_to_rest'
			| 'side.relics_of_the_past'
	]: ReturnType<typeof buildChallenge>;
};

const BUILDERS = {
	'side.ttn': buildTtn,
	'side.the_midwinter_gala': buildMidwinterGala,
	'side.curse_of_the_rougarou': buildRougarou,
	'side.carnevale_of_horrors': buildCarnevale,
	'side.the_eternal_slumber': buildEternalSlumber,
	'side.the_nights_usurper': buildNightsUsurper,
	'side.murder_at_the_excelsior_hotel': buildExcelsior,
	'side.blob_that_ate_everything': buildBlob,
	'side.blob_that_ate_everything_else': buildBlobElse,
	'side.film_fatale': buildFilmFatale,
	'side.fortune_and_folly_part_1': buildFortuneAndFolly,
	'side.in_the_labyrinths_of_lunacy': buildLabyrinths,
	'side.war_of_the_outer_gods': buildOuterGods,
	'side.meddling_of_meowlathotep': buildMeowlathotep,
	'side.machinations_through_time': buildMachinations,
	'side.enthralling_encore': buildEncore,
	...challenge
} as const;

export type StandaloneBespokeKey = keyof typeof BUILDERS;

export type StandaloneBlobs = {
	[K in StandaloneBespokeKey]?: NonNullable<ReturnType<(typeof BUILDERS)[K]>>;
};

/** Each bespoke standalone page's aggregate over the subject's standalone plays. */
export function buildStandaloneBespoke(records: readonly StandalonePlayRecord[]): StandaloneBlobs {
	const out: Record<string, unknown> = {};
	for (const [key, build] of Object.entries(BUILDERS)) {
		const blob = build(records);
		if (blob) out[key] = blob;
	}
	return out as StandaloneBlobs;
}
