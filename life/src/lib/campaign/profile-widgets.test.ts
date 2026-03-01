import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { WIDGET_CATALOGUE } from './profile-widgets';

/**
 * Guard rails that keep the "Log-only mode" non-log filtering COMPLETE as widgets are added.
 *
 * The filtering has an implicit contract a new campaign widget must satisfy: (1) declare `nonLog`
 * in the catalogue, and — if `partial` — (2) accept `logOnly` and gate its non-log sections, and
 * (3) be passed `logOnly` by the renderer. The failure mode is silent (an unfillable "hole" just
 * stays for log-only players), so these tests turn "easy to forget" into "CI won't let you forget".
 *
 * `EXPECTED_NONLOG` is the explicit manifest: every EotE / TSK campaign widget, with its audited
 * classification (`'none'` = no non-log dependence). Adding a campaign widget fails the first test
 * until it's listed here — which forces a conscious decision and puts it in front of a reviewer.
 *
 * SCOPE: only the campaigns audited in this pass. Other campaigns (tdc / ptc / tcu / tfa) are not
 * yet classified — audit them when they get the Log-only pass, then add them below.
 */
const EXPECTED_NONLOG: Record<string, 'full' | 'partial' | 'none'> = {
	// ── Edge of the Earth ──
	eoeCity: 'full', // City of the Elder Things — version/plays/resolutions/VP, all Extra
	eoeFatalMirage: 'full', // resolution-scoped, Extra
	eoeMementos: 'full', // deck: cardUsage-derived ("the log-only build leaves it 0")
	eoeIceDeath: 'partial', // skips (scenarioSkipped) + shelter (manual Extra) hide; defeated/fled/escaped are log
	eoeCrash: 'none',
	eoeDemons: 'none',
	eoeSurvivors: 'none',
	eoeRescued: 'none',
	eoeSupplies: 'none',
	eoeCamped: 'none',
	eoeFrost: 'none',
	eoeMiasma: 'none',
	eoeMemories: 'none',
	// ── The Scarlet Keys ──
	tskKeysObtained: 'full', // scarletKeyBearers (Extra)
	tskKeysBearer: 'full', // scarletKeyBearers (Extra)
	tskRoutes: 'full', // every row is a rec.route (Extra) track — nothing log to keep
	tskErased: 'full', // erasedCards (Extra)
	tskTrial: 'partial', // vote transitions are log (keep); the route-bearing "highs" table is Extra (gate)
	tskTrustDeception: 'none', // "fully inferred from the campaign log"
	tskTokenBalance: 'none', // finalChaosBag is recorded state; act table is MIXED (not gated)
	tskBaleEngine: 'none',
	tskRuinousChime: 'none',
	tskSideQuests: 'none',
	tskScenario_riddles_and_rain: 'partial', // passport: outcome/Key/variant table/chips are Extra
	tskScenario_dead_heat: 'partial',
	tskScenario_sanguine_shadows: 'partial',
	tskScenario_dealings_in_the_dark: 'partial',
	tskScenario_dancing_mad: 'partial',
	tskScenario_on_thin_ice: 'partial',
	tskScenario_dogs_of_war: 'partial',
	tskScenario_shades_of_suffering: 'partial',
	tskScenario_without_a_trace: 'partial',
	tskScenario_congress_of_the_keys: 'partial'
};

const auditedCampaignWidgets = WIDGET_CATALOGUE.filter(
	(w) => w.campaign === 'eote' || w.campaign === 'tsk'
);

describe('Log-only: every audited campaign widget is classified', () => {
	it('the EotE/TSK campaign-widget set matches the expected manifest', () => {
		const ids = auditedCampaignWidgets.map((w) => w.id).sort();
		expect(ids).toEqual(Object.keys(EXPECTED_NONLOG).sort());
	});

	it('each catalogue `nonLog` tag matches its expected classification', () => {
		for (const w of auditedCampaignWidgets) {
			expect(w.nonLog ?? 'none', `nonLog for ${w.id}`).toBe(EXPECTED_NONLOG[w.id]);
		}
	});
});

describe('Log-only: the renderer wires `logOnly` to partial widgets only', () => {
	// Split the ProfileWidgets `{#if widget.id === '…'}` switch into per-id blocks: each block runs
	// from its own id marker to the next, so it contains exactly that widget's component invocation.
	const src = readFileSync(
		new URL('../components/profile/_framework/ProfileWidgets.svelte', import.meta.url),
		'utf8'
	);
	const blocks = new Map<string, string>();
	for (const part of src.split("widget.id === '").slice(1)) {
		const id = part.slice(0, part.indexOf("'"));
		if (!blocks.has(id)) blocks.set(id, part);
	}

	it('every audited campaign widget has a render branch', () => {
		for (const id of Object.keys(EXPECTED_NONLOG)) {
			expect(blocks.has(id), `${id} must have a render branch in ProfileWidgets`).toBe(true);
		}
	});

	it('partial widgets are passed a `logOnly` prop', () => {
		for (const [id, kind] of Object.entries(EXPECTED_NONLOG)) {
			if (kind !== 'partial') continue;
			expect(blocks.get(id)?.includes('logOnly={'), `${id} must be passed logOnly`).toBe(true);
		}
	});

	it('full widgets are NOT passed `logOnly` (they render the placeholder centrally)', () => {
		for (const [id, kind] of Object.entries(EXPECTED_NONLOG)) {
			if (kind !== 'full') continue;
			expect(blocks.get(id)?.includes('logOnly={'), `${id} must not be passed logOnly`).toBe(false);
		}
	});
});
