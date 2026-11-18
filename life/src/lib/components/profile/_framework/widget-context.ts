import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';

/** What a campaign widget knows about the slot it renders in. */
export interface WidgetContext {
	/** The campaign page's family, e.g. `tskc`. */
	family: string | null;
	/** The catalogue's scenario for a passport widget. */
	scenario: string | null;
	/** The family's per-scenario records. */
	scenarios: CampaignScenarios | null;
	/** The family's achievements with their earned state. */
	achievements: ProfileFamilyAchievement[];
	/** Hide everything that needs data beyond the campaign log. */
	logOnly: boolean;
	/** The slot's widget options. */
	config: Record<string, unknown>;
}

/** The props every campaign widget receives: its campaign's aggregate and the slot context. */
export interface CampaignWidgetProps<B> {
	blob: B | null;
	ctx: WidgetContext;
}
