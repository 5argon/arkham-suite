import { describe, expect, it } from 'vitest';
import {
	WIDGET_CATALOGUE,
	campaignDetailWidgetIds,
	defaultCampaignLayout,
	isFullWidth
} from './profile-widgets';

/** The Log-only classification of every audited campaign widget. Adding a widget to an audited
 *  campaign fails this until its classification is decided here. */
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

describe('catalogue and renderers', () => {
	it('every catalogue widget has a renderer', async () => {
		const { UNRENDERED_WIDGETS } = await import(
			'../../components/profile/_framework/widget-renderers'
		);
		expect(UNRENDERED_WIDGETS).toEqual([]);
	}, 60_000);

	it('every campaign default layout is valid and places all of its widgets', () => {
		const slugs = [...new Set(WIDGET_CATALOGUE.flatMap((w) => (w.campaign ? [w.campaign] : [])))];
		for (const slug of slugs) {
			const allowed = new Set(campaignDetailWidgetIds(slug));
			const ids: string[] = [];
			for (const row of defaultCampaignLayout(slug)) {
				if (row.kind === 'full') {
					if (row.slot) ids.push(row.slot.id);
					continue;
				}
				for (const slot of [row.left, row.right]) {
					if (!slot) continue;
					expect(isFullWidth(slot.id), `${slug}: ${slot.id} is full-width in a split`).toBe(false);
					ids.push(slot.id);
				}
			}
			for (const id of ids) expect(allowed.has(id), `${slug}: ${id} is not allowed`).toBe(true);
			expect(new Set(ids).size, `${slug}: duplicate widgets`).toBe(ids.length);
			for (const w of WIDGET_CATALOGUE.filter((w) => w.campaign === slug)) {
				expect(ids, `${slug}: ${w.id} is not placed`).toContain(w.id);
			}
		}
	});
});
