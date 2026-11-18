import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'tdc',
	[
		{ id: 'tdcGlyphWall', label: m.framework_label_tdc_glyph_wall, fullWidth: true },
		{ id: 'tdcFold', label: m.framework_label_tdc_fold },
		{ id: 'tdcArtifacts', label: m.framework_label_tdc_artifacts },
		{ id: 'tdcTasks', label: m.framework_label_tdc_tasks, nonLog: 'partial' },
		{ id: 'tdcOneLastJob', scenario: 'one_last_job' },
		{ id: 'tdcWesternWall', scenario: 'the_western_wall' },
		{ id: 'tdcDrownedQuarter', scenario: 'the_drowned_quarter' },
		{ id: 'tdcApiary', scenario: 'the_apiary' },
		{ id: 'tdcGrandVault', scenario: 'the_grand_vault' },
		{ id: 'tdcCourtOfAncients', scenario: 'court_of_the_ancients' },
		{ id: 'tdcObsidianCanyons', scenario: 'obsidian_canyons' },
		{ id: 'tdcSepulchre', scenario: 'sepulchre_of_the_sleeper', noteDoc: 'widget/tdc/sepulchre' },
		{ id: 'tdcDoom', scenario: 'the_doom_of_arkham', fullWidth: true }
	],
	() => [
		split('overview', 'tdcFold'),
		split('scenarioXp', 'resolutionCoverage'),
		full('tdcGlyphWall'),
		split('tdcArtifacts', 'tdcTasks'),
		split('tdcOneLastJob', 'tdcWesternWall'),
		split('tdcDrownedQuarter', 'tdcApiary'),
		split('tdcGrandVault', 'tdcCourtOfAncients'),
		split('tdcObsidianCanyons', 'tdcSepulchre'),
		full('tdcDoom'),
		full('achievements')
	]
);
