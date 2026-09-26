import {
	coreCantripCards,
	coreNeutralL0Cards,
	coreNeutralSkillUpgradeCards,
	desperateCards,
	innateCards,
	spotlightCopies,
	type InsightRowDef,
	type SpotlightCard
} from '$lib/campaign/utils/card-filters';
import * as m from '$lib/paraglide/messages.js';

export interface SpotlightWidget {
	spotlights: () => SpotlightCard[];
	rows: (spotlights: SpotlightCard[]) => InsightRowDef[];
	cols?: number;
}

const named = (spotlights: SpotlightCard[], name: string) => spotlights.find((s) => s.name === name);

const used = (s: SpotlightCard | undefined, name: string): InsightRowDef => ({
	label: () => m.cards_insight_used({ name }),
	pred: (d) => spotlightCopies(d, s) >= 1
});

const usedEach = (spotlights: SpotlightCard[]): InsightRowDef[] =>
	spotlights.map((s) => used(s, s.name));

const cantrips = (min: number, label: () => string): InsightRowDef => ({
	label,
	// Distinct cantrips held at once in one deck version, not collected across its upgrades.
	pred: (d) => d.cantripMax >= min
});

/** The spotlight widgets whose rows are conditions over the decks' footprints; every deck can take
 *  these neutral cards, so each row is a share of all decks. */
export const SPOTLIGHT_WIDGETS: Record<string, SpotlightWidget> = {
	coreNeutralL0: {
		spotlights: coreNeutralL0Cards,
		cols: 5,
		rows: (sp) => {
			const notUsed = (name: string): InsightRowDef => ({
				label: () => m.cards_insight_not_used({ name }),
				pred: (d) => spotlightCopies(d, named(sp, name)) === 0
			});
			return [
				used(named(sp, 'Knife'), 'Knife'),
				notUsed('Flashlight'),
				notUsed('Emergency Cache'),
				used(named(sp, 'Unexpected Courage'), 'Unexpected Courage'),
				cantrips(3, m.cards_core_l0_cantrips)
			];
		}
	},
	desperateCards: { spotlights: desperateCards, rows: usedEach },
	innateCards: { spotlights: innateCards, rows: usedEach },
	coreNeutralSkillUpgrades: { spotlights: coreNeutralSkillUpgradeCards, rows: usedEach },
	coreSetNeutralSkills: {
		spotlights: coreCantripCards,
		rows: () => [cantrips(3, m.cards_skill_three_different), cantrips(4, m.cards_skill_all_four)]
	}
};
