import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
import type { Stat } from '$lib/components/profile/_primitives';
import * as m from '$lib/paraglide/messages.js';
import type { HeaderCard } from '../ScenarioInfo.svelte';

/** Story cards shown beside the TFA passports. */
export const TFA_CARD = {
	ichtaca: { code: '04147', objectTop: true },
	alejandro: { code: '04051', objectTop: true },
	harbinger: { code: '04062', tone: 'danger', objectTop: true },
	yig: { code: '04296', tone: 'danger', objectTop: true },
	relic: { code: '04061', objectTop: true }
} satisfies Record<string, HeaderCard>;

export const TFA_POISONED_CODE = '04102';

/** Poisoned gained in these scenarios (an Extra input). */
export function poisonedStat(tfa: CampaignTfa | null, ...scenarios: string[]): Stat {
	return {
		value: scenarios.reduce((n, s) => n + (tfa?.poison.byScenario[s] ?? 0), 0),
		label: m.campaign_tfa_poisoned_gained()
	};
}

export const depthsAgendaLabel = (agenda: number) =>
	agenda === 0
		? m.campaign_tfa_vengeance_agenda_special()
		: m.campaign_tfa_vengeance_agenda({ n: agenda });

/** Plays per Depths of Yoth starting agenda. */
export const depthsAgendaStats = (tfa: CampaignTfa | null): Stat[] =>
	(tfa?.vengeance.depthsAgenda ?? []).map((a) => ({
		value: a.plays,
		label: depthsAgendaLabel(a.agenda)
	}));
