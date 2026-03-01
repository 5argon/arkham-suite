/**
 * Shared prop shape for the per-scenario TSK widgets. Each scenario has its OWN
 * concrete component (TskOnThinIce, TskDogsOfWar, …) so it can grow bespoke
 * content, but they all forward this same bundle into the common
 * `TskScenarioInfo` passport — this type just spares the repetition.
 */
import type { ProfileFamilyAchievement } from '$lib/campaign/achievement-aggregate';
import type { CampaignScenarioXp } from '$lib/campaign/extra-imports';
import type { CampaignResolutionCoverage } from '$lib/campaign/resolution-coverage';
import type { CampaignTsk } from '$lib/campaign/tsk-profile';

export interface TskScenarioWidgetProps {
	family: string | null;
	scenarioXp: CampaignScenarioXp[];
	coverage: CampaignResolutionCoverage | null;
	tsk: CampaignTsk | null;
	/** The campaign family's official achievements (with earned state) — the passport filters
	 *  these to the ones tagged with its scenario and shows them as a row. */
	achievements: ProfileFamilyAchievement[];
	/** Hide the per-version / per-tier breakdown table (widget config option). */
	hideVariants?: boolean;
	/** Hide the scenario-achievements row (widget config option). */
	hideAchievements?: boolean;
	/** "Log-only mode": hide the passport's non-log record overlay (plays / outcome / Key /
	 *  resolutions-reached chips / per-variant table) and the wrapper's Extra-derived stats. */
	logOnly?: boolean;
}
