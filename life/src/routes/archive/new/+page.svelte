<script lang="ts">
	import { goto } from '$app/navigation';
	import { BackButton, MarginFull, PageLead } from '@5argon/arkham-life-ui';
	import { u } from '@5argon/arkham-string';
	import type { Campaign } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import CampaignSelector from '$lib/components/archive/CampaignSelector.svelte';

	let selectedCampaign = $state<Campaign | null | undefined>(undefined);
	let submitting = $state(false);

	async function handleSelect(campaign: Campaign | null) {
		selectedCampaign = campaign;
		submitting = true;

		await ensureDatabaseLoaded();
		const campaignCode = campaign ?? '';
		const title = campaignCode ? u.campaignName(campaignCode as Campaign) : 'Unspecified Campaign';
		const created = databaseStore.createCampaign({ campaignCode, title });
		goto(created ? `/archive/edit?id=${created.id}&created=1` : '/new');
	}
</script>

<svelte:head>
	<title>{m.archive_new_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label={m.common_back()} onClick="/archive" />
	</div>

	<PageLead title={m.archive_new_title()} description={m.archive_new_description()} />

	{#if submitting}
		<p class="text-primary-500 dark:text-primary-400 text-sm">…</p>
	{:else}
		<CampaignSelector selected={selectedCampaign} onSelect={handleSelect} />
	{/if}
</MarginFull>
