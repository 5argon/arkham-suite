<!-- @component The Black Cat: where the companion ended up across both campaigns, and the messages it carried. -->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import { logText } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CardThumb,
		OutcomeList,
		SectionLabel,
		StatNumbers,
		WidgetEmpty,
		type Stat
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { BLACK_CAT_CODE } from './tde-cards';

	let { blob }: CampaignWidgetProps<CampaignTdea | CampaignTdeb> = $props();

	const c = $derived(blob?.shared.blackCat);
	const rows = $derived<Stat[][]>([
		[
			{ value: c?.withDreamQuest, label: m.campaign_tde_cat_with_dream_quest() },
			{ value: c?.withWebOfDreams, label: m.campaign_tde_cat_with_web_of_dreams() },
			...(c?.unresolved ? [{ value: c.unresolved, label: m.campaign_tde_cat_unresolved() }] : [])
		],
		[
			{ value: c?.abandoned, label: m.campaign_tde_cat_abandoned() },
			{ value: c?.distrustful, label: m.campaign_tde_cat_distrustful() },
			{ value: c?.onYourOwn, label: m.campaign_tde_cat_on_your_own() }
		],
		[
			{ value: c?.hadHunch, label: m.campaign_tde_cat_hunch() },
			{ value: c?.searched, label: m.campaign_tde_cat_searched() }
		]
	]);
	const trail = $derived(
		(c?.trail ?? []).map((t) => ({ label: logText(t.family, t.note), hit: true, count: t.plays }))
	);
	const hasData = $derived(trail.length > 0 || rows.some((r) => r.some((s) => s.value)));
</script>

{#if hasData}
	<div class="@container">
		<div class="flex flex-col items-center gap-4 @md:flex-row @md:items-start @md:gap-6">
			<CardThumb code={BLACK_CAT_CODE} size="h-24 w-24" objectTop />
			<div class="flex-1 space-y-4">
				<StatNumbers {rows} />
				{#if trail.length}
					<div>
						<SectionLabel variant="heading" align="center"
							>{m.campaign_tde_cat_trail_heading()}</SectionLabel
						>
						<OutcomeList items={trail} />
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tde_cat_empty()}</WidgetEmpty>
{/if}
