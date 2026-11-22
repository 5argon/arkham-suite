/** Each standalone page's shared rules (endings, cards earned), by page key. */
import type { StandaloneRules } from './rules';
import { CARNEVALE_RULES, ROUGAROU_RULES } from './side/bayou-and-carnevale';
import { BLOB_ELSE_RULES, BLOB_RULES } from './side/blob';
import { CHALLENGES, ENCORE_RULES, MOM_RULES, challengeRules } from './side/challenges';
import { LOL_RULES, MTT_RULES, WOG_RULES } from './side/epic-multiplayer';
import { MEH_RULES } from './side/excelsior';
import { FILM_RULES } from './side/film-fatale';
import { FOF_RULES } from './side/fortune-and-folly';
import { TES_RULES, TNU_RULES } from './side/guardians-of-the-abyss';
import { MWG_RULES } from './side/midwinter-gala';

const ALL: StandaloneRules[] = [
	MWG_RULES,
	ROUGAROU_RULES,
	CARNEVALE_RULES,
	TES_RULES,
	TNU_RULES,
	MEH_RULES,
	BLOB_RULES,
	BLOB_ELSE_RULES,
	FILM_RULES,
	FOF_RULES,
	LOL_RULES,
	WOG_RULES,
	MOM_RULES,
	MTT_RULES,
	ENCORE_RULES,
	...CHALLENGES.map(challengeRules)
];

export const STANDALONE_RULES: Readonly<Record<string, StandaloneRules>> = Object.fromEntries(
	ALL.map((r) => [`side.${r.scenario}`, r])
);
