/**
 * The user's profile settings: global scope switches plus a row layout per profile page. A row is
 * one full-width slot or a left/right split; `fullWidth` widgets only fit full rows. Anything
 * unreadable resets the layouts to the defaults while keeping the global switches.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { Product } from '@5argon/arkham-kohaku';
import { WIDGET_BY_ID, campaignDetailWidgetIds, isFullWidth } from './profile-widgets';
import { full, split } from './widget-def';

const PRODUCT_VALUES = new Set<string>(Object.values(Product));

export type DifficultyTier = 'easy' | 'standard' | 'hard' | 'expert';
export const ALL_TIERS: readonly DifficultyTier[] = ['easy', 'standard', 'hard', 'expert'];

export type CampaignGroup = 'chapterOne' | 'chapterOneReturnTo' | 'chapterTwo';
export const ALL_CAMPAIGN_GROUPS: readonly CampaignGroup[] = [
	'chapterOne',
	'chapterOneReturnTo',
	'chapterTwo'
];

export type ArchiveVisibility = 'visible' | 'hidden';

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

/** Panes with one stored layout. Each campaign's detail page has its own instead. */
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

export interface WidgetSlot {
	id: string;
	/** Widget-specific options (item count, hide toggles, …). */
	config?: Record<string, unknown>;
}

export type SplitSide = 'left' | 'right';

/** A null slot is an empty placeholder in the editor. */
export type ProfileRow =
	| { kind: 'full'; slot: WidgetSlot | null }
	| { kind: 'split'; left: WidgetSlot | null; right: WidgetSlot | null };

export interface ProfileSettings {
	v: 4;
	/** `null` = owns everything. */
	ownedProducts: Product[] | null;
	/** Tiers whose plays count; `[]` = all tiers. */
	trackedTiers: DifficultyTier[];
	trackedCampaignGroups: CampaignGroup[];
	/** Hide unearned achievements that need an untracked difficulty. */
	hideUntrackedDifficultyAchievements: boolean;
	/** What an archive's `displayInProfile: 'default'` resolves to. */
	defaultArchiveDisplayInProfile: ArchiveVisibility;
	panes: Record<SharedPaneId, ProfileRow[]>;
	/** Campaign detail layouts by campaign slug; a missing slug uses its default layout. */
	campaigns: Record<string, ProfileRow[]>;
	/** Hide everything that needs data beyond the campaign log. */
	logOnly?: boolean;
	/** Log-only mode for one campaign, by slug. */
	campaignLogOnly?: Record<string, boolean>;
	/** Hide the deck-derived Cards and Investigators categories. */
	campaignCategoriesOnly?: boolean;
	/** Also count each Return-to box's plays toward its original campaign. */
	mergeReturnToStats?: boolean;
	/** While merging, drop the separate Return-to campaign pages. */
	hideReturnToCampaigns?: boolean;
}

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
	campaignCategoriesOnly: false,
	mergeReturnToStats: true,
	hideReturnToCampaigns: false
};

type Globals = Omit<ProfileSettings, 'v' | 'panes' | 'campaigns'>;

function fresh(globals: Partial<Globals> = {}): ProfileSettings {
	return {
		...structuredClone(DEFAULT_PROFILE_SETTINGS),
		...globals,
		panes: freshDefaultPanes(),
		campaigns: {}
	};
}

function pickValid<T extends string>(raw: unknown, allowed: readonly T[], fallback: T[]): T[] {
	return Array.isArray(raw) ? raw.filter((x): x is T => allowed.includes(x)) : [...fallback];
}

function normalizeOwned(raw: unknown): Product[] | null {
	if (!Array.isArray(raw)) return null;
	return raw.filter((x): x is Product => typeof x === 'string' && PRODUCT_VALUES.has(x));
}

function normalizeCampaignLogOnly(raw: unknown): Record<string, boolean> {
	const out: Record<string, boolean> = {};
	if (!raw || typeof raw !== 'object') return out;
	for (const [slug, on] of Object.entries(raw as Record<string, unknown>)) {
		if (on === true && getCampaignLog(slug)) out[slug] = true;
	}
	return out;
}

function normalizeSlot(
	raw: unknown,
	seen: Set<string>,
	allowFullWidth: boolean,
	allows: (id: string) => boolean
): WidgetSlot | null {
	if (!raw || typeof raw !== 'object') return null;
	const { id, config } = raw as WidgetSlot;
	if (typeof id !== 'string' || !allows(id) || seen.has(id)) return null;
	if (!allowFullWidth && isFullWidth(id)) return null;
	seen.add(id);
	return config ? { id, config } : { id };
}

function normalizeRows(raw: unknown, allows: (id: string) => boolean): ProfileRow[] {
	if (!Array.isArray(raw)) return [];
	const seen = new Set<string>();
	const out: ProfileRow[] = [];
	for (const r of raw) {
		if (!r || typeof r !== 'object') continue;
		if (r.kind === 'full') {
			const slot = normalizeSlot(r.slot, seen, true, allows);
			if (slot) out.push({ kind: 'full', slot });
		} else if (r.kind === 'split') {
			const left = normalizeSlot(r.left, seen, false, allows);
			const right = normalizeSlot(r.right, seen, false, allows);
			if (left || right) out.push({ kind: 'split', left, right });
		}
	}
	return out;
}

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

/** Parse and validate stored settings (a JSON string or an object). */
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
	const p = parsed as Partial<ProfileSettings>;

	const globals: Globals = {
		ownedProducts: normalizeOwned(p.ownedProducts),
		trackedTiers: pickValid(p.trackedTiers, ALL_TIERS, DEFAULT_PROFILE_SETTINGS.trackedTiers),
		trackedCampaignGroups: pickValid(p.trackedCampaignGroups, ALL_CAMPAIGN_GROUPS, [
			...ALL_CAMPAIGN_GROUPS
		]),
		hideUntrackedDifficultyAchievements: p.hideUntrackedDifficultyAchievements !== false,
		defaultArchiveDisplayInProfile:
			p.defaultArchiveDisplayInProfile === 'hidden' ? 'hidden' : 'visible',
		logOnly: p.logOnly === true,
		campaignLogOnly: normalizeCampaignLogOnly(p.campaignLogOnly),
		campaignCategoriesOnly: p.campaignCategoriesOnly === true,
		mergeReturnToStats: p.mergeReturnToStats !== false,
		hideReturnToCampaigns: p.hideReturnToCampaigns === true
	};
	if (p.v !== 4) return fresh(globals);

	const panes = Object.fromEntries(
		SHARED_PANES.map((pane) => [
			pane,
			normalizeRows(p.panes?.[pane], (id) => {
				const def = WIDGET_BY_ID[id];
				return !!def && !def.campaign && def.panes.includes(pane);
			})
		])
	) as Record<SharedPaneId, ProfileRow[]>;

	return { v: 4, ...globals, panes, campaigns: normalizeCampaigns(p.campaigns) };
}
