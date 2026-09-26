<!-- @component Poisoned: how often the subject's investigators gained it, and whom it struck most. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CardLineList,
		CardThumb,
		SectionLabel,
		StatNumbers,
		WidgetEmpty
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { TFA_POISONED_CODE } from './tfa-shared';

	let { blob: tfa }: CampaignWidgetProps<CampaignTfa> = $props();

	const p = $derived(tfa?.poison);
</script>

{#if p?.total}
	<div class="space-y-3">
		<div class="flex items-center gap-3">
			<CardThumb code={TFA_POISONED_CODE} tone="danger" objectTop />
			<div class="min-w-0 flex-1">
				<StatNumbers rows={[[{ value: p.total, label: m.campaign_tfa_poison_total() }]]} />
			</div>
		</div>
		<div>
			<SectionLabel>{m.campaign_tfa_poison_by_investigator()}</SectionLabel>
			<CardLineList items={p.byInvestigator} align="right">
				{#snippet trailing(v)}
					×{v.count}
				{/snippet}
			</CardLineList>
		</div>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tfa_poison_empty()}</WidgetEmpty>
{/if}
