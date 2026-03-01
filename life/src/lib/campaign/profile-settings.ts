/**
 * profile-settings.ts — the per-user layout document for the hierarchical profile
 * composer (v3, ROW-based).
 *
 * The profile is a hierarchy of pages ("panes"); each pane holds an ordered list
 * of ROWS. A row is either a single FULL-width slot, or a 2-up SPLIT (left/right)
 * that renders side-by-side at lg+ and stacks on mobile. Each slot holds one
 * widget (or is empty = a "select widget" placeholder in the editor). Which
 * widgets a pane may contain is declared by the catalogue in `./profile-widgets`;
 * a widget flagged `fullWidth` may live ONLY in a full row, never in a split slot.
 *
 * v3 has NO layout migration: any older/garbage doc resets to a fresh default
 * layout, while the user's GLOBALS (owned products, tracked tiers, archive
 * display, hide-untracked) are preserved. There is also no auto-append of newly
 * shipped catalogue widgets — in a positioned-row model new widgets are added by
 * the user via the picker.
 *
 * Scope model: a global `ownedProducts` + `trackedTiers` default drives every
 * widget's "blanks"; a widget may override via its `scope`.
 */

import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { CardClass, Product } from '@5argon/arkham-kohaku';
import {
	WIDGET_BY_ID,
	bespokeWidgetsForCampaign,
	campaignDetailWidgetIds,
	isFullWidth,
} from './profile-widgets';

const PRODUCT_VALUES = new Set<string>(Object.values(Product));

export type DifficultyTier = 'easy' | 'standard' | 'hard' | 'expert';

export const ALL_TIERS: readonly DifficultyTier[] = ['easy', 'standard', 'hard', 'expert'];

export type CampaignGroup = 'chapterOne' | 'chapterOneReturnTo' | 'chapterTwo';
export const ALL_CAMPAIGN_GROUPS: readonly CampaignGroup[] = ['chapterOne', 'chapterOneReturnTo', 'chapterTwo'];

/** Pages in the profile hierarchy; each holds its own ordered row list. The
 *  `cards*` panes are inner pages under the cards page, one per card taxonomy
 *  (core set, asset, event, skill, keyword, level) alongside "By Class". */
export type PaneId =
	| 'home'
	| 'campaignsHome'
	| 'campaignDetail'
	| 'cardsHome'
	| 'cardClassDetail'
	| 'cardsCore'
	| 'cardsAsset'
	| 'cardsEvent'
	| 'cardsSkill'
	| 'cardsKeywords'
	| 'cardsLevels'
	| 'investigatorsHome'
	| 'investigatorClassDetail';

export const ALL_PANES: readonly PaneId[] = [
	'home',
	'campaignsHome',
	'campaignDetail',
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
];

/** Panes whose row layout is stored ONCE and reused everywhere it appears. The
 *  campaign-detail page is deliberately excluded — each campaign now owns its own
 *  full layout (see `ProfileSettings.campaigns`), not a single shared one. */
export type SharedPaneId = Exclude<PaneId, 'campaignDetail'>;
export const SHARED_PANES: readonly SharedPaneId[] = [
	'home',
	'campaignsHome',
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
];

/** Per-widget override of the global ownership / tier scope. */
export interface WidgetScope {
	/** kohaku Products this widget restricts to (omit = inherit global). */
	products?: Product[];
	/** Card classes this widget restricts to (e.g. only Guardian). */
	classes?: CardClass[];
	/** Difficulty tiers this widget treats as "tracked". */
	tiers?: DifficultyTier[];
}

/** A single placed widget. (In v3 "not placed in any row" replaces the old
 *  `visible` flag — a widget is shown iff it occupies a slot somewhere.) */
export interface WidgetSlot {
	id: string;
	/** Widget-specific config (which campaigns, columns, show earn-counts, …). */
	config?: Record<string, unknown>;
	/** Per-widget scope override; null/omitted = inherit the global scope. */
	scope?: WidgetScope | null;
}

/** Either side of a split row, or a full row's single slot — `null` = empty. */
export type SplitSide = 'left' | 'right';

/** A layout row. ONE full-width slot, OR a 2-up split (left/right). Each slot is
 *  independently nullable so the editor can show an empty "select widget"
 *  placeholder. `fullWidth` widgets are illegal in a split (enforced by the
 *  picker and defensively by the resolver). */
export type ProfileRow =
	| { kind: 'full'; slot: WidgetSlot | null }
	| { kind: 'split'; left: WidgetSlot | null; right: WidgetSlot | null };

export interface ProfileSettings {
	v: 4;
	/** Owned kohaku Products; `null` = own everything (the global default). */
	ownedProducts: Product[] | null;
	/** Difficulty tiers that count for "blanks"; `[]` = all tiers. */
	trackedTiers: DifficultyTier[];
	/** Campaign groups shown in the clear grid and similar aggregate widgets. */
	trackedCampaignGroups: CampaignGroup[];
	/** Hide *unearned* achievements gated to a difficulty the player doesn't track. */
	hideUntrackedDifficultyAchievements: boolean;
	/** What an archive's `displayInProfile: 'default'` resolves to — whether such
	 *  archives show their existence (calendar / campaigns-played) on the profile. */
	defaultArchiveDisplayInProfile: 'visible' | 'hidden';
	/** Ordered ROWS per SHARED (non-campaign) pane. */
	panes: Record<SharedPaneId, ProfileRow[]>;
	/**
	 * Per-campaign FULL detail-page layouts, keyed by campaign slug (kohaku
	 * Campaign value, e.g. 'tsk'). Each holds that campaign's complete row list —
	 * shared campaign-detail widgets AND that campaign's own widgets, interleaved
	 * however the user arranged them. There is NO shared campaign layout. An absent
	 * slug falls back to `defaultCampaignLayout(slug)`.
	 */
	campaigns: Record<string, ProfileRow[]>;
	/**
	 * Accessibility — "Log-only mode": hide widgets/sections that need data BEYOND the
	 * campaign log (Extra-tab inputs or imported decks). The global master switch (also
	 * the debug toggle). Per-widget `config.ignoreNonLog` and per-campaign
	 * `campaignLogOnly` compose with it (any one true → that widget is log-only).
	 */
	logOnly?: boolean;
	/** Per-campaign "Log-only mode" overrides, keyed by campaign slug (e.g. 'tsk'). */
	campaignLogOnly?: Record<string, boolean>;
	/**
	 * Hide the Cards & Investigators top-level categories (entirely deck-derived) — a
	 * profile with no imported decks then shows only campaign-related content.
	 */
	campaignCategoriesOnly?: boolean;
}

// ── Fresh defaults (hand-authored row layouts; no catalogue derivation) ───────

const full = (id: string): ProfileRow => ({ kind: 'full', slot: { id } });
const split = (left: string | null, right: string | null): ProfileRow => ({
	kind: 'split',
	left: left ? { id: left } : null,
	right: right ? { id: right } : null
});

/**
 * The fresh default layout for every SHARED pane (the campaign-detail page is not
 * shared — see `defaultCampaignLayout`). Demonstrates a mix of full-width and
 * split rows: `fullWidth` widgets (card grids, clear grid, achievement wall) get
 * their own full row; reflow-friendly small widgets are paired into split rows.
 * Default-hidden per-class variants are NOT placed (opt-in via the picker).
 * Returns fresh objects on every call.
 */
export function freshDefaultPanes(): Record<SharedPaneId, ProfileRow[]> {
	return {
		home: [
			full('clearGrid'),
			split('campaignsPlayed', 'calendar'),
			full('favoriteCard'),
			split('standaloneUsage', null)
		],
		campaignsHome: [
			full('clearGrid'),
			split('campaignsPlayed', 'winLossRecord'),
			full('allAchievements'),
			split('calendar', null)
		],
		// Outer cards page: just the usage overview + favorites. The taxonomy-specific
		// widgets now default onto their inner pages below (still addable here).
		cardsHome: [full('cardInsights'), full('favoriteCard')],
		cardClassDetail: [
			full('cardInsights'),
			full('favoriteCard'),
			full('permanentCards'),
			full('exceptionalCards'),
			full('level5Cards'),
			full('skillCards'),
			full('researchedCards'),
			full('customizableCards'),
			full('specialistCards')
		],
		// Inner card-taxonomy pages (one per card type / keyword / level).
		cardsCore: [
			full('cardHistory'),
			full('cardHistory2026'),
			full('cardHistoryOnce'),
			full('cardHistoryOnce2026'),
			full('coreNeutralL0'),
			full('charismaRelic')
		],
		cardsAsset: [],
		cardsEvent: [],
		cardsSkill: [
			full('skillCards'),
			full('desperateCards'),
			full('innateCards'),
			full('coreNeutralSkillUpgrades'),
			full('viciousBlowDeduction'),
			full('coreSetNeutralSkills')
		],
		cardsKeywords: [
			full('permanentCards'),
			full('exceptionalCards'),
			full('researchedCards'),
			full('customizableCards')
		],
		cardsLevels: [full('level5Cards')],
		investigatorsHome: [full('deckStats'), full('investigatorInsights')],
		investigatorClassDetail: [full('deckStats'), full('investigatorInsights')]
	};
}

/** The shared base of a campaign-detail layout — the rows every campaign starts
 *  with, before its own campaign-specific widgets are baked in. */
function baseCampaignRows(): ProfileRow[] {
	return [
		full('scenarioXp'),
		full('resolutionCoverage'),
		full('achievements')
	];
}

/**
 * Edge of the Earth has a dozen bespoke widgets, so it gets a hand-curated layout
 * rather than the generic "every bespoke widget on its own full row": the small
 * stat widgets are paired into split rows, the wide ones (City matrix, the image
 * banners, the memory walls) keep full rows.
 */
function eoteCampaignLayout(): ProfileRow[] {
	return [
		split('overview', 'eoeFrost'),
		split('scenarioXp', 'resolutionCoverage'),
		full('eoeCrash'),
		split('eoeIceDeath', 'eoeCamped'),
		split('eoeRescued', 'eoeDemons'),
		full('eoeSupplies'),
		full('eoeMementos'),
		full('eoeMemories'),
		full('eoeCity'),
		split('eoeFatalMirage', 'eoeMiasma'),
		full('eoeSurvivors'),
		full('achievements')
	];
}

/**
 * The Scarlet Keys also has many bespoke widgets, so it gets a hand-curated
 * layout: the small stat widgets are paired into split rows (overview vs special
 * interactions, the keys wall vs bearer, erased vs side quests, etc.), the per-
 * scenario walls and the token balance keep full rows.
 */
function tskCampaignLayout(): ProfileRow[] {
	return [
		split('overview', 'specialInteractions'),
		split('scenarioXp', 'resolutionCoverage'),
		split('tskErased', 'tskSideQuests'),
		split('tskKeysObtained', 'tskKeysBearer'),
		split('tskTrustDeception', 'tskRoutes'),
		full('tskTokenBalance'),
		full('tskScenario_riddles_and_rain'),
		full('tskScenario_dead_heat'),
		full('tskScenario_sanguine_shadows'),
		full('tskScenario_dealings_in_the_dark'),
		full('tskScenario_dancing_mad'),
		full('tskScenario_on_thin_ice'),
		full('tskScenario_dogs_of_war'),
		full('tskScenario_shades_of_suffering'),
		full('tskScenario_without_a_trace'),
		full('tskScenario_congress_of_the_keys'),
		split('tskBaleEngine', 'tskRuinousChime'),
		full('tskTrial')
	];
}

/** A campaign's DEFAULT detail-page layout: an Overview, then that campaign's own
 *  widgets baked in (e.g. EotE's City of the Elder Things), then the shared base
 *  rows. Used when the user hasn't customized this campaign's page — every
 *  campaign gets its own copy (there is no single shared campaign layout).
 *  Edge of the Earth (`eote`) and The Scarlet Keys (`tsk`) have bespoke,
 *  hand-paired layouts. */
export function defaultCampaignLayout(slug: string): ProfileRow[] {
	if (slug === 'eote') return eoteCampaignLayout();
	if (slug === 'tsk') return tskCampaignLayout();
	return [
		full('overview'),
		...bespokeWidgetsForCampaign(slug).map((w) => full(w.id)),
		...baseCampaignRows()
	];
}

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
	v: 4,
	ownedProducts: null,
	trackedTiers: ['standard', 'hard'],
	trackedCampaignGroups: [...ALL_CAMPAIGN_GROUPS],
	hideUntrackedDifficultyAchievements: true,
	defaultArchiveDisplayInProfile: 'visible',
	panes: freshDefaultPanes(),
	campaigns: {},
	logOnly: false,
	campaignLogOnly: {},
	campaignCategoriesOnly: false
};

function fresh(globals?: Partial<ProfileSettings>): ProfileSettings {
	return {
		v: 4,
		ownedProducts: globals?.ownedProducts ?? null,
		trackedTiers: globals?.trackedTiers ?? [...DEFAULT_PROFILE_SETTINGS.trackedTiers],
		trackedCampaignGroups: globals?.trackedCampaignGroups ?? [...ALL_CAMPAIGN_GROUPS],
		hideUntrackedDifficultyAchievements: globals?.hideUntrackedDifficultyAchievements ?? true,
		defaultArchiveDisplayInProfile: globals?.defaultArchiveDisplayInProfile ?? 'visible',
		panes: freshDefaultPanes(),
		campaigns: {},
		logOnly: globals?.logOnly ?? false,
		campaignLogOnly: globals?.campaignLogOnly ?? {},
		campaignCategoriesOnly: globals?.campaignCategoriesOnly ?? false
	};
}

// ── Normalizers ──────────────────────────────────────────────────────────────

/** Normalize the account-wide archive-visibility default (only 'hidden' opts out). */
function normalizeArchiveDisplay(raw: unknown): 'visible' | 'hidden' {
	return raw === 'hidden' ? 'hidden' : 'visible';
}

function normalizeTiers(raw: unknown): DifficultyTier[] {
	return Array.isArray(raw)
		? (raw.filter((t) =>
				(ALL_TIERS as readonly string[]).includes(t as string)
			) as DifficultyTier[])
		: [...DEFAULT_PROFILE_SETTINGS.trackedTiers];
}

function normalizeCampaignGroups(raw: unknown): CampaignGroup[] {
	return Array.isArray(raw)
		? (raw.filter((g) =>
				(ALL_CAMPAIGN_GROUPS as readonly string[]).includes(g as string)
			) as CampaignGroup[])
		: [...ALL_CAMPAIGN_GROUPS];
}

function normalizeOwned(raw: unknown): Product[] | null {
	if (raw === null || raw === undefined) return null;
	return Array.isArray(raw)
		? raw.filter((x): x is Product => typeof x === 'string' && PRODUCT_VALUES.has(x))
		: null;
}

/** Normalize the per-campaign Log-only overrides: keep only known campaign slugs with a
 *  `true` value (false / missing = not log-only, so omitted). */
function normalizeCampaignLogOnly(raw: unknown): Record<string, boolean> {
	const out: Record<string, boolean> = {};
	if (!raw || typeof raw !== 'object') return out;
	for (const [slug, on] of Object.entries(raw as Record<string, unknown>)) {
		if (on === true && getCampaignLog(slug)) out[slug] = true;
	}
	return out;
}

/** True if `id` is a real (shared) catalogue widget allowed in `pane`. */
function catalogueAllows(id: string, pane: PaneId): boolean {
	const def = WIDGET_BY_ID[id];
	return !!def && !def.perCampaignExtra && def.panes.includes(pane);
}

/**
 * Normalize one stored slot: drop it (→ null) when the id is unknown / not
 * allowed (`allows`), already placed in this pane (`seen`), or `fullWidth` while
 * `allowFullWidth` is false (a split slot). Otherwise keep id + config + scope.
 */
function normalizeSlot(
	raw: unknown,
	seen: Set<string>,
	allowFullWidth: boolean,
	allows: (id: string) => boolean
): WidgetSlot | null {
	if (!raw || typeof raw !== 'object') return null;
	const id = (raw as WidgetSlot).id;
	if (typeof id !== 'string' || !allows(id) || seen.has(id)) return null;
	if (!allowFullWidth && isFullWidth(id)) return null;
	seen.add(id);
	return { id, config: (raw as WidgetSlot).config, scope: (raw as WidgetSlot).scope ?? null };
}

/**
 * Normalize a stored row list: discriminate by `kind` (unknown → dropped), keep
 * allowed/deduped slots (split slots reject `fullWidth`), and drop fully-empty
 * rows. A split with exactly one filled side is kept (placeholder + widget).
 */
function normalizeRows(raw: unknown, allows: (id: string) => boolean): ProfileRow[] {
	if (!Array.isArray(raw)) return [];
	const seen = new Set<string>();
	const out: ProfileRow[] = [];
	for (const r of raw) {
		if (!r || typeof r !== 'object') continue;
		const kind = (r as ProfileRow).kind;
		if (kind === 'full') {
			const slot = normalizeSlot((r as { slot?: unknown }).slot, seen, true, allows);
			if (slot) out.push({ kind: 'full', slot });
		} else if (kind === 'split') {
			const left = normalizeSlot((r as { left?: unknown }).left, seen, false, allows);
			const right = normalizeSlot((r as { right?: unknown }).right, seen, false, allows);
			if (left || right) out.push({ kind: 'split', left, right });
		}
	}
	return out;
}

/** Normalize per-campaign layouts: keep only known campaign slugs; each layout may
 *  hold the shared campaign-detail widgets AND that campaign's own widgets
 *  (interleaved, deduped, fullWidth kept out of split slots). Omit slugs whose
 *  rows are all empty (→ they fall back to `defaultCampaignLayout`). */
function normalizeCampaigns(raw: unknown): Record<string, ProfileRow[]> {
	const out: Record<string, ProfileRow[]> = {};
	if (!raw || typeof raw !== 'object') return out;
	for (const [slug, list] of Object.entries(raw as Record<string, unknown>)) {
		if (!getCampaignLog(slug)) continue;
		const allowed = new Set(campaignDetailWidgetIds(slug));
		const rows = normalizeRows(list, (id) => allowed.has(id));
		if (rows.length) out[slug] = rows;
	}
	return out;
}

/**
 * Parse + normalize raw persisted settings (a JSON string, an object, or null)
 * into a safe v4 `ProfileSettings`. Globals (owned products / tracked tiers /
 * archive display / hide-untracked) are ALWAYS preserved from the incoming doc;
 * any non-v4 doc gets a fresh default LAYOUT (no migration). A v4 doc has its
 * stored rows normalized in place (drop unknown/duplicate/not-allowed ids, force
 * fullWidth widgets out of split slots, drop empty rows; no auto-append).
 */
export function resolveProfileSettings(
	raw: string | null | undefined | ProfileSettings
): ProfileSettings {
	let parsed: unknown = raw;
	if (typeof raw === 'string') {
		try {
			parsed = JSON.parse(raw);
		} catch {
			return fresh();
		}
	}
	if (!parsed || typeof parsed !== 'object') return fresh();
	const p = parsed as Partial<ProfileSettings> & Record<string, unknown>;

	// Globals are read identically regardless of version, so they survive a reset.
	const globals = {
		ownedProducts: normalizeOwned(p.ownedProducts),
		trackedTiers: normalizeTiers(p.trackedTiers),
		trackedCampaignGroups: normalizeCampaignGroups(p.trackedCampaignGroups),
		hideUntrackedDifficultyAchievements: p.hideUntrackedDifficultyAchievements !== false,
		defaultArchiveDisplayInProfile: normalizeArchiveDisplay(p.defaultArchiveDisplayInProfile),
		logOnly: p.logOnly === true,
		campaignLogOnly: normalizeCampaignLogOnly(p.campaignLogOnly),
		campaignCategoriesOnly: p.campaignCategoriesOnly === true
	};

	// No layout migration: anything that isn't a v4 doc resets the layout only.
	if (p.v !== 4) return fresh(globals);

	const panes = Object.fromEntries(
		SHARED_PANES.map((pane) => [
			pane,
			normalizeRows((p.panes as Record<string, unknown>)?.[pane], (id) => catalogueAllows(id, pane))
		])
	) as Record<SharedPaneId, ProfileRow[]>;

	return {
		v: 4,
		...globals,
		panes,
		campaigns: normalizeCampaigns(p.campaigns)
	};
}

export { WIDGET_CATALOGUE, WIDGET_BY_ID, isFullWidth } from './profile-widgets';
