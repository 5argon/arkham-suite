import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { PaneId, ProfileRow } from './profile-settings';

/** An option the layout editor offers for a placed widget, stored in the slot's `config`. */
export type WidgetConfigOption =
	| { kind: 'toggle'; key: string; label: () => string }
	| { kind: 'count'; fallback: number; choices: number[] };

export interface WidgetDef {
	id: string;
	label: () => string;
	/** Label on a class page, e.g. "Guardian Permanent Cards". */
	classLabel?: (a: { cls: string }) => string;
	/** A per-class variant's fixed class (the `_guardian` in `favoriteCard_guardian`). */
	variantClass?: string;
	/** Panes the picker offers it on. */
	panes: PaneId[];
	primaryPane: PaneId;
	/** Campaign slug of a campaign-specific widget. */
	campaign?: string;
	/** The scenario a passport widget covers; its encounter icon joins the frame title. */
	scenario?: string;
	/** Only fits a full-width row. */
	fullWidth?: boolean;
	/** In the picker but not placed by the default layouts. */
	defaultHidden?: boolean;
	/** Tab art, a static path. */
	image?: string;
	/** In-app doc (under src/lib/docs) explaining the widget, opened from its frame. */
	noteDoc?: string;
	/** Needs data beyond the campaign log: `full` shows a placeholder in log-only mode, `partial`
	 *  hides some sections and gains an "Ignore non-log data" toggle. */
	nonLog?: 'full' | 'partial';
	config?: WidgetConfigOption[];
}

export const full = (id: string): ProfileRow => ({ kind: 'full', slot: { id } });

export const split = (left: string | null, right: string | null): ProfileRow => ({
	kind: 'split',
	left: left ? { id: left } : null,
	right: right ? { id: right } : null
});

export type CampaignWidgetInput = Omit<WidgetDef, 'label' | 'panes' | 'primaryPane' | 'campaign'> & {
	/** Defaults to the scenario's campaign-data name. */
	label?: () => string;
};

export interface CampaignWidgetModule {
	slug: string;
	widgets: WidgetDef[];
	/** The campaign page's default layout; fresh rows on every call. */
	layout: () => ProfileRow[];
}

/** A campaign's own widgets (offered only on its detail page) and its default page layout. */
export function campaignWidgets(
	slug: string,
	widgets: CampaignWidgetInput[],
	layout: () => ProfileRow[]
): CampaignWidgetModule {
	const scenarioName = (id: string | undefined) =>
		(id && getCampaignLog(slug)?.en.scenarioNames?.[id]) || id || '';
	return {
		slug,
		layout,
		widgets: widgets.map((w) => ({
			...w,
			label: w.label ?? (() => scenarioName(w.scenario)),
			panes: ['campaignDetail'],
			primaryPane: 'campaignDetail',
			campaign: slug
		}))
	};
}
