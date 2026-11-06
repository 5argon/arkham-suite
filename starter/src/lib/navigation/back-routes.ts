import type { RouteId } from '$app/types';

import * as m from '$lib/paraglide/messages.js';

/**
 * What a page's loaded data can offer for naming it, for pages named after what they show.
 *
 * This file is part of every page through the root layout, so it must not import kohaku or the
 * string package. A page needing those to know its name works it out in its load as `backName`.
 */
export interface BackLabelData {
	author?: { name: string };
	backName?: string;
	entry?: { primary: { name: string } };
	team?: { name: string };
}

interface BackRoute {
	/**
	 * How a back button leading to this page reads. Written by hand for each page, since this site
	 * assumes a beginner who relies on this button to find their way back.
	 */
	label: (data: BackLabelData) => string;
	/**
	 * Where its back button leads when they did not arrive from another page. Only home has none.
	 * Must be a page whose label needs no data.
	 */
	parent: RouteId | null;
}

/**
 * Every page of the site. The test next to this file fails when a page is missing.
 */
export const backRoutes = {
	'/': { label: () => m.common_back_to_home(), parent: null },
	'/about': { label: () => m.common_back_to_about(), parent: '/' },
	'/campaign': { label: () => m.common_back_to_campaign(), parent: '/' },
	'/campaign/[campaignCode]': {
		label: ({ backName }) => m.common_back_to({ name: backName! }),
		parent: '/campaign'
	},
	'/deck/view': { label: () => m.common_back_to_deck_viewer(), parent: '/' },
	'/deck/view/[id]': { label: () => m.common_back_to_the_deck(), parent: '/deck/view' },
	'/decklist/view/[id]': { label: () => m.common_back_to_the_deck(), parent: '/deck/view' },
	'/decklist/view/[id]/[name]': { label: () => m.common_back_to_the_deck(), parent: '/deck/view' },
	'/share/[id]': { label: () => m.common_back_to_the_deck(), parent: '/deck/view' },
	'/divider': { label: () => m.common_back_to_divider(), parent: '/' },
	'/divider/cut': { label: () => m.common_back_to_divider_cut(), parent: '/divider' },
	'/divider/download': { label: () => m.common_back_to_divider_download(), parent: '/divider' },
	'/divider/print': { label: () => m.common_back_to_divider_print(), parent: '/divider' },
	'/eote': { label: () => m.common_back_to_eote(), parent: '/' },
	'/errata': { label: () => m.common_back_to_errata(), parent: '/' },
	'/player': { label: () => m.common_back_to_player(), parent: '/' },
	'/player/[packCode]': {
		label: ({ backName }) => m.common_back_to({ name: backName! }),
		parent: '/player'
	},
	'/player/env': { label: () => m.common_back_to_environments(), parent: '/player' },
	'/player/env/[slug]': {
		label: ({ backName }) => m.common_back_to({ name: backName! }),
		parent: '/player/env'
	},
	'/precon': { label: () => m.common_back_to_precon(), parent: '/' },
	'/precon/[name]': { label: () => m.common_back_to_the_precon(), parent: '/precon' },
	'/proxy': { label: () => m.common_back_to_proxy(), parent: '/' },
	'/review': { label: () => m.common_back_to_reviews(), parent: '/' },
	'/review/[packCode]': {
		label: ({ backName }) => m.common_back_to({ name: backName! }),
		parent: '/review'
	},
	'/review/card/[code]': {
		label: ({ backName }) => m.common_back_to({ name: backName! }),
		parent: '/review'
	},
	'/review/chapter-one/[packCode]': {
		label: ({ backName }) => m.common_back_to({ name: backName! }),
		parent: '/player'
	},
	'/review/chapter-one/card/[code]': {
		label: ({ backName }) => m.common_back_to({ name: backName! }),
		parent: '/player'
	},
	'/review/reviewers': { label: () => m.common_back_to_reviewers(), parent: '/review' },
	'/review/reviewers/[author]': {
		label: ({ author }) => m.common_back_to({ name: author!.name }),
		parent: '/review/reviewers'
	},
	'/review/preview-season': {
		label: () => m.common_back_to_preview_season(),
		parent: '/review'
	},
	'/review/preview-season/[packCode]': {
		label: ({ backName }) => m.common_back_to({ name: backName! }),
		parent: '/review/preview-season'
	},
	'/starter': { label: () => m.common_back_to_starter(), parent: '/' },
	'/starter/authors': { label: () => m.common_back_to_starter_authors(), parent: '/starter' },
	'/member/[author]': {
		label: ({ author }) => m.common_back_to({ name: author!.name }),
		parent: '/starter'
	},
	'/starter/[author]/[series]/[deck]': {
		label: ({ entry }) => m.common_back_to({ name: entry!.primary.name }),
		parent: '/starter'
	},
	'/supply': { label: () => m.common_back_to_supply(), parent: '/' },
	'/team': { label: () => m.common_back_to_team(), parent: '/' },
	'/team/[slug]': {
		label: ({ team }) => m.common_back_to({ name: team!.name }),
		parent: '/team'
	},
	'/tool/assembler': { label: () => m.common_back_to_assembler(), parent: '/' },
	'/tool/campaign-overlaps': { label: () => m.common_back_to_campaign_overlaps(), parent: '/' },
	'/tool/card': { label: () => m.common_back_to_card_table(), parent: '/' },
	'/tool/gather': { label: () => m.common_back_to_gather(), parent: '/' },
	'/tool/limited': { label: () => m.common_back_to_limited(), parent: '/' },
	'/tool/team-builder': { label: () => m.common_back_to_team_builder(), parent: '/' },
	'/tool/team-builder/view': {
		label: () => m.common_back_to_shared_team(),
		parent: '/tool/team-builder'
	},
	'/tool/thumbnails': { label: () => m.common_back_to_thumbnails(), parent: '/' },
	'/tool/tsk': { label: () => m.common_back_to_tsk_planner(), parent: '/' },
	'/tool/tsk/view': { label: () => m.common_back_to_tsk_shared_plan(), parent: '/tool/tsk' },
	'/tool/upgrade': { label: () => m.common_back_to_upgrade(), parent: '/' },
	'/tool/who': { label: () => m.common_back_to_who(), parent: '/' },
	'/tsk-document': { label: () => m.common_back_to_tsk_document(), parent: '/' },
	'/tsk-map': { label: () => m.common_back_to_tsk_map(), parent: '/' },
	'/ultimatums-and-boons': { label: () => m.common_back_to_ultimatums(), parent: '/' },
	'/utility-mini': { label: () => m.common_back_to_utility_mini(), parent: '/' }
} satisfies Partial<Record<RouteId, BackRoute>> as Partial<Record<string, BackRoute>>;
