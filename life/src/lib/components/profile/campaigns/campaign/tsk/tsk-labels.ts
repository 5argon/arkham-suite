import type { BagAct, TallyEntry } from '$lib/campaign/campaigns/tsk/rules';
import { logText, scenarioName } from '$lib/campaign/records/campaign-log-source';
import * as m from '$lib/paraglide/messages.js';

const TSK = 'tskc';

/** An epilogue tally entry: its campaign-log note. */
export function tskTallyLabel(e: TallyEntry): string {
	const entry = logText(TSK, e.id);
	return e.crossoff ? m.campaign_tsk_tally_crossed_off({ entry }) : entry;
}

const BAG_ACT_ACTION: Record<string, () => string> = {
	rr_offer: m.campaign_tsk_bagact_rr_offer,
	foundation_tell: m.campaign_tsk_bagact_foundation_tell,
	bolivar_all: m.campaign_tsk_bagact_bolivar_all,
	dealings_work: m.campaign_tsk_bagact_dealings_work,
	deadgone_tell: m.campaign_tsk_bagact_deadgone_tell,
	onthinice_deal: m.campaign_tsk_bagact_onthinice_deal,
	dogs_aid: m.campaign_tsk_bagact_dogs_aid,
	whistle_accept: m.campaign_tsk_bagact_whistle_accept,
	rr_own: m.campaign_tsk_bagact_rr_own,
	foundation_hide: m.campaign_tsk_bagact_foundation_hide,
	bolivar_nada: m.campaign_tsk_bagact_bolivar_nada,
	dealings_deceive: m.campaign_tsk_bagact_dealings_deceive,
	deadgone_keep: m.campaign_tsk_bagact_deadgone_keep,
	onthinice_refuse: m.campaign_tsk_bagact_onthinice_refuse,
	dogs_sirry: m.campaign_tsk_bagact_dogs_sirry,
	whistle_refuse: m.campaign_tsk_bagact_whistle_refuse
};

/** A chaos-bag act: "<scenario> — <what the cell did>". */
export function tskBagActLabel(act: BagAct): string {
	const scenario = scenarioName(TSK, act.scenario);
	const action = BAG_ACT_ACTION[act.id]?.();
	return action ? `${scenario} — ${action}` : scenario;
}

/** The conditions of the two `lifeInfer` Trust achievements, for the achievement gear modal. */
export function tskTrustAchievementConditions(id: string): string[] {
	if (id === 'trust_everybody')
		return [m.campaign_tsk_trust_cond_won(), m.campaign_tsk_trust_cond_tablet4(), m.campaign_tsk_trust_cond_no_secrecy()];
	if (id === 'trust_nobody')
		return [m.campaign_tsk_trust_cond_won(), m.campaign_tsk_trust_cond_elder4(), m.campaign_tsk_trust_cond_no_trust()];
	return [];
}
