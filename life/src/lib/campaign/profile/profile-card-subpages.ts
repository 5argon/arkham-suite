/**
 * profile-card-subpages.ts — the registry of inner pages under the cards page,
 * one per card taxonomy (core set, asset, event, skill, keyword, level), parallel
 * to the dynamic "By Class" page. Each maps a URL slug to its layout pane and a
 * localized display name; this is the single source of truth driving the cards
 * index nav grid, the shared section/customize components, and the route wrappers.
 *
 * Client-safe (no Svelte imports), mirroring `profile-widgets.ts`.
 */

import * as m from '$lib/paraglide/messages.js';
import type { SharedPaneId } from './profile-settings';

export type CardSubpageSlug = 'core' | 'asset' | 'event' | 'skill' | 'keywords' | 'levels';

export interface CardSubpage {
	/** URL segment under `/cards` (e.g. `core` → `/cards/core`). */
	slug: CardSubpageSlug;
	/** The (shared, stored) layout pane whose rows this page renders. */
	pane: SharedPaneId;
	/** Localized display name (nav tile + page/customize title). */
	name: () => string;
}

/** Ordered — drives the cards index "By type" nav grid. */
export const CARD_SUBPAGES: CardSubpage[] = [
	{ slug: 'core', pane: 'cardsCore', name: m.cards_core_name },
	{ slug: 'asset', pane: 'cardsAsset', name: m.cards_asset_name },
	{ slug: 'event', pane: 'cardsEvent', name: m.cards_event_name },
	{ slug: 'skill', pane: 'cardsSkill', name: m.cards_skill_name },
	{ slug: 'keywords', pane: 'cardsKeywords', name: m.cards_keywords_name },
	{ slug: 'levels', pane: 'cardsLevels', name: m.cards_levels_name },
];

export const CARD_SUBPAGE_BY_SLUG: Record<CardSubpageSlug, CardSubpage> = Object.fromEntries(
	CARD_SUBPAGES.map((s) => [s.slug, s]),
) as Record<CardSubpageSlug, CardSubpage>;

/** Resolve a URL slug to its sub-page, or null if it isn't a card-type page. */
export function resolveCardSubpageSlug(slug: string): CardSubpage | null {
	return CARD_SUBPAGE_BY_SLUG[slug as CardSubpageSlug] ?? null;
}
