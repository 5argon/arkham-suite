/** The widget catalogue: the shared widgets plus every campaign's own. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { PaneId, ProfileRow } from './profile-settings';
import {
	full,
	type CampaignWidgetModule,
	type StandaloneWidgetModule,
	type WidgetDef
} from './widget-def';
import { SHARED_WIDGETS } from './widgets/shared';
import boa from './widgets/boa';
import cob from './widgets/cob';
import dwl from './widgets/dwl';
import eote from './widgets/eote';
import fhv from './widgets/fhv';
import notz from './widgets/notz';
import ptc from './widgets/ptc';
import tcu from './widgets/tcu';
import tdc from './widgets/tdc';
import tdea from './widgets/tdea';
import tdeb from './widgets/tdeb';
import tfa from './widgets/tfa';
import tic from './widgets/tic';
import tsk from './widgets/tsk';
import { parseStandaloneKey, standaloneLayout, standaloneWidgetFits } from './widgets/standalone/layout';
import side from './widgets/standalone/side';
import ttn from './widgets/standalone/ttn';

export type { WidgetDef } from './widget-def';

const CAMPAIGN_MODULES: CampaignWidgetModule[] = [
	notz,
	dwl,
	ptc,
	tfa,
	tcu,
	tdea,
	tdeb,
	tic,
	eote,
	tsk,
	fhv,
	tdc,
	boa,
	cob
];

const STANDALONE_MODULES: StandaloneWidgetModule[] = [ttn, ...side];

export const WIDGET_CATALOGUE: WidgetDef[] = [
	...SHARED_WIDGETS,
	...CAMPAIGN_MODULES.flatMap((c) => c.widgets),
	...STANDALONE_MODULES.flatMap((s) => s.widgets)
];

export const WIDGET_BY_ID: Record<string, WidgetDef> = Object.fromEntries(
	WIDGET_CATALOGUE.map((w) => [w.id, w])
);

export function widgetLabel(id: string): string {
	return WIDGET_BY_ID[id]?.label() ?? id;
}

export function isFullWidth(id: string): boolean {
	return !!WIDGET_BY_ID[id]?.fullWidth;
}

const DECK_CATEGORY_PANES = new Set<PaneId>([
	'cardsHome',
	'cardClassDetail',
	'cardsCore',
	'cardsAsset',
	'cardsEvent',
	'cardsSkill',
	'cardsKeywords',
	'cardsLevels',
	'investigatorsHome',
	'investigatorClassDetail'
]);

/** Belongs to the deck-derived Cards / Investigators categories, which "campaign categories only"
 *  hides wherever the widget is placed. */
export function isDeckCategoryWidget(id: string): boolean {
	const pane = WIDGET_BY_ID[id]?.primaryPane;
	return !!pane && DECK_CATEGORY_PANES.has(pane);
}

export function sharedWidgetsForPane(pane: PaneId): WidgetDef[] {
	return WIDGET_CATALOGUE.filter((w) => !w.campaign && !w.standalone && w.panes.includes(pane));
}

export function bespokeWidgetsForCampaign(slug: string): WidgetDef[] {
	return CAMPAIGN_MODULES.find((c) => c.slug === slug)?.widgets ?? [];
}

function hasSpecialInteractions(slug: string): boolean {
	return Boolean(getCampaignLog(slug)?.db.specialInteractions?.some((s) => !s.optional));
}

/** Every widget a campaign's detail page may hold: the applicable shared ones and its own. */
export function campaignDetailWidgetIds(slug: string): string[] {
	const shared = sharedWidgetsForPane('campaignDetail').filter(
		(w) => w.id !== 'specialInteractions' || hasSpecialInteractions(slug)
	);
	return [...shared, ...bespokeWidgetsForCampaign(slug)].map((w) => w.id);
}

export function defaultCampaignLayout(slug: string): ProfileRow[] {
	const mod = CAMPAIGN_MODULES.find((c) => c.slug === slug);
	if (mod) return mod.layout();
	return [full('overview'), full('scenarioXp'), full('resolutionCoverage'), full('achievements')];
}

export function isStandaloneKey(key: string): boolean {
	return parseStandaloneKey(key) != null;
}

export function bespokeWidgetsForStandalone(key: string): WidgetDef[] {
	return STANDALONE_MODULES.find((s) => s.key === key)?.widgets ?? [];
}

/** Every widget a standalone page may hold: the applicable shared ones and its own. */
export function standaloneDetailWidgetIds(key: string): string[] {
	const shared = sharedWidgetsForPane('standaloneDetail').filter((w) =>
		standaloneWidgetFits(w.id, key)
	);
	return [...shared, ...bespokeWidgetsForStandalone(key)].map((w) => w.id);
}

export function defaultStandaloneLayout(key: string): ProfileRow[] {
	return STANDALONE_MODULES.find((s) => s.key === key)?.layout() ?? standaloneLayout(key);
}

export { parseStandaloneKey };
