/** The Blob That Ate Everything (and Everything Else): contained or devoured, and the Mi-Go Incursion rewards brought home. */
import type { Play } from '../../records/play';
import { defineStandalonePage } from '../define';
import { pickedCards, type EndingRule, type StandaloneRules } from '../rules';

const BLOB = 'blob_that_ate_everything';
const BLOB_ELSE = 'blob_that_ate_everything_else';

/** Each Mi-Go Incursion mission's story asset, in play at the end to keep. */
const MISSIONS = [
	{ from: '85021', code: '85029' },
	{ from: '85022', code: '85030' },
	{ from: '85023', code: '85031' },
	{ from: '85024', code: '85032' }
];
const MISSIONS_ELSE = [
	...MISSIONS,
	{ from: '89011', code: '89019' },
	{ from: '89014', code: '89020' },
	{ from: '89017', code: '89021' }
];

/** Resolution 1 and no resolution end the whole campaign when played inside one. */
const endings = (notes: boolean): EndingRule[] => [
	{
		id: 'contained',
		kind: 'win',
		resolutions: ['R2'],
		notes: notes ? ['blob_contained'] : undefined,
		code: '85043'
	},
	{
		id: 'devoured',
		kind: 'loss',
		resolutions: ['R1'],
		notes: notes ? ['blob_devoured_universe'] : undefined,
		code: '85038'
	},
	{ id: 'defeated', kind: 'loss', resolutions: ['no_resolution'] }
];

const rewards = (scenario: string, missions: typeof MISSIONS) =>
	missions.map((m) => ({
		...m,
		earned: (p: Play) => pickedCards(p, scenario, 'earn_assets').includes(m.code)
	}));

export const BLOB_RULES: StandaloneRules = {
	scenario: BLOB,
	prefix: 'blob',
	endings: endings(true),
	cards: rewards(BLOB, MISSIONS)
};

/** The sequel's log entries belong to the first Blob in campaign-data, so only its resolution tells. */
export const BLOB_ELSE_RULES: StandaloneRules = {
	scenario: BLOB_ELSE,
	prefix: 'blob',
	endings: endings(false),
	cards: rewards(BLOB_ELSE, MISSIONS_ELSE)
};

export const buildBlob = defineStandalonePage(BLOB_RULES);
export const buildBlobElse = defineStandalonePage(BLOB_ELSE_RULES);
