<!--
@component
DWL bespoke widget — "The Missing Persons". The three kidnapped scholars (Warren
Rice, Francis Morgan, Henry Armitage), each lit whenever their fate was decided at
their own scenario, with the badge = times that fate was settled and a hover that
splits it into rescued vs left kidnapped. Re-captures on the Essex County Express
are NOT counted here — they live in the Essex widget. Portraits are the Ally story
cards. Built on LitTileGrid.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { DWL_PERSONS, type CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import { times } from '$lib/profile/plural';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { dwl }: { dwl: CampaignDwl | null } = $props();

	const NAME: Record<string, () => string> = {
		warren_rice: m.campaign_dwl_person_warren_rice,
		francis_morgan: m.campaign_dwl_person_francis_morgan,
		henry_armitage: m.campaign_dwl_person_henry_armitage
	};

	// Each play settles a scholar's fate at their own scenario: rescued, or left kidnapped.
	// (A rescued scholar re-taken on the Essex County Express is a separate event — the Essex
	// widget — so the kidnapped count here is the INITIAL "never rescued" fate only.)
	const tile = (id: string, code: string): LitTile => {
		const t = dwl?.persons[id] ?? { rescued: 0, kidnapped: 0, snatchedAgain: 0 };
		const leftKidnapped = Math.max(0, t.kidnapped - t.snatchedAgain);
		const parts: string[] = [];
		if (t.rescued > 0) parts.push(m.campaign_dwl_persons_rescued({ times: times(t.rescued) }));
		if (leftKidnapped > 0)
			parts.push(m.campaign_dwl_persons_kidnapped({ times: times(leftKidnapped) }));
		return {
			id,
			image: getCardImagePath(code, 'square'),
			label: (NAME[id] ?? (() => id))(),
			count: t.rescued + leftKidnapped,
			detail: parts.length ? parts.join(' · ') : m.campaign_dwl_persons_empty_tile()
		};
	};

	const tiles = $derived<LitTile[]>(dwl ? DWL_PERSONS.map((p) => tile(p.id, p.code)) : []);
	const hasData = $derived(tiles.some((t) => t.count > 0));
</script>

{#if hasData}
	<LitTileGrid {tiles} colsClass="grid-cols-3" />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_dwl_persons_empty()}</p>
{/if}
