import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import type { StandaloneEntry } from './recorded-state';

/** One recorded play as the profile aggregates see it: the campaign-data projection of its log plus
 *  the Extra-tab inputs and the few deck/roster facts the builders need. */
export interface CampaignRecord {
	campaignCode: string;
	recorded: RecordedCampaignState;
	/** Manual achievement ticks: `def.id` and `def.id::itemId`. */
	manual: ReadonlySet<string>;
	/** Extra: per-scenario earned XP / victory display. */
	scenarioXp?: Record<string, number>;
	/** Extra: `"scenario.choiceId"` → chosen value. */
	scenarioChoices?: Record<string, string>;
	/** Extra: scenario id → resolution reached. */
	scenarioResolutions?: Record<string, string>;
	/** Extra: scenario ids marked skipped. */
	scenarioSkipped?: string[];
	/** `#name#` card-choice picks from the raw log args: composite entry key → chosen item id. */
	nameChoices?: Record<string, string>;
	/** Scenarios in the order their log entries were recorded (the play route). */
	route?: string[];
	/** Extra: TSK solver tier picks, `"<scenarioId>.<level|version>"` → option id. */
	scenarioTiers?: Record<string, string>;
	/** Scarlet Key item id → the non-NPC investigator codes that bore it. */
	scarletKeyBearers?: Record<string, string[]>;
	/** Card codes erased from existence (TSK), in log order. */
	erasedCards?: string[];
	/** Investigator codes possessed at the end of Dim Carcosa. */
	possessedInvestigators?: string[];
	/** Investigator codes the profile subject played in this campaign (from its decks). */
	subjectInvestigators?: string[];
	/** Every subject deck used only core-set cards with a non-parallel investigator. */
	coreOnly?: boolean;
	finishDate?: number | null;
	playerCount?: number | null;
	/** A 1-player play where one person piloted several decks. */
	multiHanded?: boolean;
	/** Extra: standalone scenarios played inside this campaign. */
	standalones?: StandaloneEntry[];
	/** The database campaign id; joins deck-derived data at payload assembly. */
	campaignId?: string;
	/** TDE interconnected play: composite keys transcribed from the sibling campaign's log. */
	linked?: ReadonlySet<string>;
}
