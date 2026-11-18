<!-- @component The Vanishing of Elina Harper: the rescue, and the suspects and hideouts accused. -->
<script lang="ts">
	import { TIC_HIDEOUTS, TIC_SUSPECTS, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import { logText } from '$lib/campaign/records/campaign-log-source';
	import type { Tally } from '$lib/campaign/utils/tally';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { tallyTile } from './tic-tiles';

	let { blob: tic, ctx }: CampaignWidgetProps<CampaignTic> = $props();

	const HARPER = '07083';
	const h = $derived(tic?.harper);
	const accusedTile = (id: string, code: string, section: string, t: Tally | undefined) =>
		tallyTile(
			{ id, code, label: logText('tic', `${section}.${id}`) },
			t,
			m.campaign_tic_harper_not_accused,
			(times) => m.campaign_tic_harper_accused({ times })
		);
	const suspects = $derived(
		TIC_SUSPECTS.map((s) => accusedTile(s.id, s.code, 'possible_suspects', h?.suspect[s.id]))
	);
	const hideouts = $derived(
		TIC_HIDEOUTS.map((x) => accusedTile(x.id, x.code, 'possible_hideouts', h?.hideout[x.id]))
	);
	const accused = $derived([...suspects, ...hideouts].some((t) => t.count > 0));
</script>

<ScenarioInfo {ctx} headerCards={[{ code: HARPER, objectTop: true }]}>
	{#snippet stats()}
		<StatNumbers
			empty={accused ? undefined : m.campaign_tic_harper_empty()}
			rows={[
				[
					{ tally: h?.missionSucceeded, label: m.campaign_tic_harper_succeeded() },
					{ tally: h?.missionFailed, label: m.campaign_tic_harper_failed() }
				]
			]}
		/>
	{/snippet}
	{#snippet children()}
		{#if accused}
			<div class="space-y-3">
				<div>
					<SectionLabel variant="heading" align="center">{m.campaign_tic_harper_suspect_heading()}</SectionLabel>
					<LitTileGrid tiles={suspects} colsClass="grid-cols-3 @3xl:grid-cols-6" objectTop />
				</div>
				<div>
					<SectionLabel variant="heading" align="center">{m.campaign_tic_harper_hideout_heading()}</SectionLabel>
					<LitTileGrid tiles={hideouts} colsClass="grid-cols-3 @3xl:grid-cols-6" objectTop />
				</div>
			</div>
		{/if}
	{/snippet}
</ScenarioInfo>
