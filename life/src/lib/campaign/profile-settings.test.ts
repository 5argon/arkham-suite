import { describe, expect, it } from 'vitest';
import {
	DEFAULT_PROFILE_SETTINGS,
	SHARED_PANES,
	defaultCampaignLayout,
	freshDefaultPanes,
	isFullWidth,
	resolveProfileSettings,
	type ProfileRow
} from './profile-settings';
import { campaignDetailWidgetIds, sharedWidgetsForPane } from './profile-widgets';
import { isCampaignOwned, ownedCampaignCodes } from './ownership';
import { Product } from '@5argon/arkham-kohaku';

/** Flatten the placed widget ids of a row list (skipping empty slots). */
function placed(rows: ProfileRow[]): string[] {
	return rows.flatMap((r) =>
		r.kind === 'full'
			? r.slot
				? [r.slot.id]
				: []
			: [r.left?.id, r.right?.id].filter((x): x is string => !!x)
	);
}

describe('resolveProfileSettings (v4, per-campaign layouts)', () => {
	it('falls back to a fresh v4 layout on null / garbage', () => {
		expect(resolveProfileSettings(null).v).toBe(4);
		expect(resolveProfileSettings(null).trackedTiers).toEqual(['standard', 'hard']);
		expect(resolveProfileSettings(undefined).ownedProducts).toBeNull();
		expect(resolveProfileSettings('not json').panes).toEqual(freshDefaultPanes());
		expect(resolveProfileSettings('not json').campaigns).toEqual({});
	});

	it('the default shared panes mix split and full rows and exclude campaignDetail', () => {
		const panes = DEFAULT_PROFILE_SETTINGS.panes;
		expect(DEFAULT_PROFILE_SETTINGS.v).toBe(4);
		expect(panes.home[0]).toEqual({ kind: 'full', slot: { id: 'clearGrid' } });
		expect(panes.home.some((r) => r.kind === 'split')).toBe(true);
		// campaignDetail is no longer a shared, stored pane.
		expect((panes as Record<string, unknown>).campaignDetail).toBeUndefined();
		expect(SHARED_PANES).not.toContain('campaignDetail');
		// every split-slot widget across the shared panes is non-fullWidth.
		for (const pane of SHARED_PANES) {
			for (const r of panes[pane]) {
				if (r.kind === 'split') {
					for (const slot of [r.left, r.right]) if (slot) expect(isFullWidth(slot.id)).toBe(false);
				}
			}
		}
		expect(DEFAULT_PROFILE_SETTINGS.campaigns).toEqual({});
	});

	it('does NOT migrate an old (v1/v2/v3) doc but PRESERVES the globals', () => {
		const v3 = JSON.stringify({
			v: 3,
			ownedProducts: ['dwlc', 'rtnotz'],
			trackedTiers: ['hard'],
			hideUntrackedDifficultyAchievements: false,
			defaultArchiveDisplayInProfile: 'hidden',
			panes: { campaignDetail: [{ kind: 'full', slot: { id: 'achievements' } }] },
			campaignExtras: { eote: [{ kind: 'full', slot: { id: 'eoeCity' } }] }
		});
		const s = resolveProfileSettings(v3);
		expect(s.v).toBe(4);
		expect(s.ownedProducts).toEqual(['dwlc', 'rtnotz']);
		expect(s.trackedTiers).toEqual(['hard']);
		expect(s.hideUntrackedDifficultyAchievements).toBe(false);
		expect(s.defaultArchiveDisplayInProfile).toBe('hidden');
		// layout reset (no migration of old panes/campaignExtras)
		expect(s.panes).toEqual(freshDefaultPanes());
		expect(s.campaigns).toEqual({});
	});

	it('normalizes a v4 shared pane: drops unknown/not-allowed/duplicate ids, empty rows, unknown kinds', () => {
		const raw = JSON.stringify({
			v: 4,
			panes: {
				home: [
					{ kind: 'full', slot: { id: 'clearGrid' } },
					{ kind: 'split', left: { id: 'clearGrid' }, right: { id: 'campaignsPlayed' } }, // left dup → null
					{ kind: 'split', left: { id: 'endings' }, right: null }, // endings not allowed in home → empty → dropped
					{ kind: 'full', slot: { id: 'bogus' } } // unknown → dropped
				]
			}
		});
		const home = resolveProfileSettings(raw).panes.home;
		expect(home.length).toBe(2);
		expect(home[0]).toMatchObject({ kind: 'full', slot: { id: 'clearGrid' } });
		expect(home[1]).toMatchObject({ kind: 'split', left: null, right: { id: 'campaignsPlayed' } });
	});

	it('a per-campaign layout keeps shared + that campaign’s own widgets, drops foreign/unknown', () => {
		const raw = JSON.stringify({
			v: 4,
			panes: {},
			campaigns: {
				eote: [
					{ kind: 'full', slot: { id: 'overview' } }, // shared campaign-detail widget
					{ kind: 'full', slot: { id: 'eoeCity' } }, // eote-specific
					{ kind: 'full', slot: { id: 'tdcGlyphWall' } }, // TDC-specific → dropped here
					{ kind: 'split', left: { id: 'scenarioXp' }, right: { id: 'resolutionCoverage' } }
				],
				notarealslug: [{ kind: 'full', slot: { id: 'overview' } }]
			}
		});
		const s = resolveProfileSettings(raw);
		expect(placed(s.campaigns.eote)).toEqual(['overview', 'eoeCity', 'scenarioXp', 'resolutionCoverage']);
		expect(s.campaigns.notarealslug).toBeUndefined();
	});

	it('forces a fullWidth widget out of a split slot (shared pane)', () => {
		const raw = JSON.stringify({
			v: 4,
			panes: {
				campaignsHome: [
					{ kind: 'split', left: { id: 'achievements' }, right: { id: 'winLossRecord' } }
				]
			}
		});
		expect(resolveProfileSettings(raw).panes.campaignsHome[0]).toMatchObject({
			kind: 'split',
			left: null,
			right: { id: 'winLossRecord' }
		});
	});

	it('a campaign default layout bakes in that campaign’s own widgets', () => {
		const eote = placed(defaultCampaignLayout('eote'));
		expect(eote[0]).toBe('overview');
		expect(eote).toContain('eoeCity'); // EotE-specific widget baked into the default
		expect(eote).toContain('eoeMemories');
		expect(eote).toContain('resolutionCoverage'); // shared base row
		expect(eote).toContain('achievements');
		// a campaign with no bespoke widgets gets only the base layout.
		const notz = placed(defaultCampaignLayout('notz'));
		expect(notz).toContain('overview');
		expect(notz).not.toContain('eoeCity');
		expect(campaignDetailWidgetIds('eote')).toEqual(
			expect.arrayContaining(['overview', 'eoeCity'])
		);
		// shared campaign-detail widgets are offered for every campaign — except the
		// data-gated `specialInteractions`, which is only offered where a campaign has
		// derivable special interactions (NotZ has none; PtC has Lola).
		const sharedDetail = sharedWidgetsForPane('campaignDetail')
			.map((w) => w.id)
			.filter((id) => id !== 'specialInteractions');
		expect(campaignDetailWidgetIds('notz')).toEqual(expect.arrayContaining(sharedDetail));
		expect(campaignDetailWidgetIds('notz')).not.toContain('specialInteractions');
		expect(campaignDetailWidgetIds('ptc')).toContain('specialInteractions');
	});

	it('filters tracked tiers and normalizes ownedProducts', () => {
		const s = resolveProfileSettings(
			JSON.stringify({
				v: 4,
				panes: {},
				trackedTiers: ['hard', 'bogus'],
				ownedProducts: ['dwlc', 7, 'rtnotz']
			})
		);
		expect(s.trackedTiers).toEqual(['hard']);
		expect(s.ownedProducts).toEqual(['dwlc', 'rtnotz']);
	});

	it('default-hidden per-class variants are offered by the picker but not placed by default', () => {
		const cardsHomeOffered = sharedWidgetsForPane('cardsHome').map((w) => w.id);
		expect(cardsHomeOffered).toContain('favoriteCard_guardian');
		expect(placed(freshDefaultPanes().cardsHome)).not.toContain('favoriteCard_guardian');
	});

	it('card-taxonomy inner panes own their default widgets; the outer page is trimmed', () => {
		const panes = freshDefaultPanes();
		// New panes are shared (stored) panes.
		for (const p of ['cardsCore', 'cardsAsset', 'cardsEvent', 'cardsSkill', 'cardsKeywords', 'cardsLevels'] as const) {
			expect(SHARED_PANES).toContain(p);
		}
		// The outer cards page now leads with just the usage overview + favorites.
		expect(placed(panes.cardsHome)).toEqual(['cardInsights', 'favoriteCard']);
		// Each inner page defaults to its curated set; Asset/Event are empty scaffolds.
		expect(placed(panes.cardsCore)).toEqual([
			'cardHistory', 'cardHistory2026', 'cardHistoryOnce', 'cardHistoryOnce2026', 'coreNeutralL0', 'charismaRelic'
		]);
		expect(panes.cardsAsset).toEqual([]);
		expect(panes.cardsEvent).toEqual([]);
		expect(placed(panes.cardsSkill)).toEqual([
			'skillCards',
			'desperateCards',
			'innateCards',
			'coreNeutralSkillUpgrades',
			'viciousBlowDeduction',
			'coreSetNeutralSkills'
		]);
		expect(placed(panes.cardsKeywords)).toEqual([
			'permanentCards', 'exceptionalCards', 'researchedCards', 'customizableCards'
		]);
		expect(placed(panes.cardsLevels)).toEqual(['level5Cards']);
	});

	it('inner-page widgets stay offered on the outer page; specialist belongs to By Class', () => {
		// Keywords page offers exactly its keyword widgets (and not specialistCards).
		const keywordsOffered = sharedWidgetsForPane('cardsKeywords').map((w) => w.id);
		expect(keywordsOffered).toEqual(['permanentCards', 'exceptionalCards', 'researchedCards', 'customizableCards']);
		expect(keywordsOffered).not.toContain('specialistCards');
		// Moved widgets remain addable to the outer cards page even though they default elsewhere.
		const cardsHomeOffered = sharedWidgetsForPane('cardsHome').map((w) => w.id);
		for (const id of ['cardHistory', 'skillCards', 'permanentCards', 'level5Cards', 'specialistCards']) {
			expect(cardsHomeOffered).toContain(id);
		}
		// Specialist is offered on the class page but is not in the keyword/skill picker.
		expect(sharedWidgetsForPane('cardClassDetail').map((w) => w.id)).toContain('specialistCards');
		expect(sharedWidgetsForPane('cardsSkill').map((w) => w.id)).toEqual([
			'skillCards',
			'desperateCards',
			'innateCards',
			'coreNeutralSkillUpgrades',
			'viciousBlowDeduction',
			'coreSetNeutralSkills'
		]);
	});

	it('isFullWidth reflects the catalogue flag', () => {
		expect(isFullWidth('clearGrid')).toBe(true);
		expect(isFullWidth('overview')).toBe(false);
		expect(isFullWidth('resolutionCoverage')).toBe(false);
		expect(isFullWidth('calendar')).toBe(false);
		expect(isFullWidth('winLossRecord')).toBe(false);
		expect(isFullWidth('bogus')).toBe(false);
	});
});

describe('ownership cascade', () => {
	it('null owned = own everything', () => {
		expect(ownedCampaignCodes(null)).toBeNull();
		expect(isCampaignOwned('notz', null)).toBe(true);
	});

	it('persona: owns everything except Return to NotZ', () => {
		const owned = ['rcore', 'tdec', 'tcuc', 'rttcu'] as Product[];
		expect(isCampaignOwned('notz', owned)).toBe(true);
		expect(isCampaignOwned('tdea', owned)).toBe(true);
		expect(isCampaignOwned('tdeb', owned)).toBe(true);
		expect(isCampaignOwned('rtnotz', owned)).toBe(false);
		expect(isCampaignOwned('rttcu', owned)).toBe(true);
	});
});
