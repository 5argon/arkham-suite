import { TDC_GLYPH_IDS } from '$lib/campaign/campaigns/tdc';
import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import * as m from '$lib/paraglide/messages.js';
import TdcArtifacts from './TdcArtifacts.svelte';
import TdcDoom from './TdcDoom.svelte';
import TdcFold from './TdcFold.svelte';
import TdcGlyphWall from './TdcGlyphWall.svelte';
import TdcScenario from './TdcScenario.svelte';
import TdcSepulchre from './TdcSepulchre.svelte';
import TdcTasks from './TdcTasks.svelte';

export default campaignRenderers('tdc', {
	tdcGlyphWall: {
		component: TdcGlyphWall,
		title: (c, tdc) =>
			tdc
				? m.framework_title_tdc_glyph_wall_count({
						collected: tdc.glyphs.everCollected,
						total: TDC_GLYPH_IDS.length
					})
				: c.def.label()
	},
	tdcFold: TdcFold,
	tdcArtifacts: TdcArtifacts,
	tdcTasks: TdcTasks,
	tdcOneLastJob: TdcScenario,
	tdcWesternWall: TdcScenario,
	tdcDrownedQuarter: TdcScenario,
	tdcApiary: TdcScenario,
	tdcGrandVault: TdcScenario,
	tdcCourtOfAncients: TdcScenario,
	tdcObsidianCanyons: TdcScenario,
	tdcSepulchre: TdcSepulchre,
	tdcDoom: TdcDoom
});
