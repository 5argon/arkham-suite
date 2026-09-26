import * as m from '$lib/paraglide/messages.js';

const PERSON_NAMES: Record<string, () => string> = {
	warren_rice: m.campaign_dwl_person_warren_rice,
	francis_morgan: m.campaign_dwl_person_francis_morgan,
	henry_armitage: m.campaign_dwl_person_henry_armitage
};

/** A kidnapped scholar's short name, for tile labels. */
export const dwlPersonName = (id: string) => PERSON_NAMES[id]?.() ?? id;
