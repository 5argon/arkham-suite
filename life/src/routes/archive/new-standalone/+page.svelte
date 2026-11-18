<script lang="ts">
	import { goto } from '$app/navigation';
	import { BackButton, MarginFull, PageLead } from '@5argon/arkham-life-ui';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import StandaloneSelector, {
		type StandaloneSelection,
	} from '$lib/components/archive/StandaloneSelector.svelte';

	let submitting = $state(false);

	async function handleSelect(selection: StandaloneSelection) {
		submitting = true;
		await ensureDatabaseLoaded();
		const created = databaseStore.createStandalone(selection);
		goto(created ? `/archive/edit?id=${created.id}&created=1` : '/new');
	}
</script>

<svelte:head>
	<title>New Standalone Archive</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label="Back" onClick="/archive" />
	</div>

	<PageLead
		title="New Standalone Archive"
		description="Record a single scenario played as a one-off — a dedicated Scenario Pack, or a campaign scenario played in Standalone Mode."
	/>

	{#if submitting}
		<p class="text-primary-500 dark:text-primary-400 text-sm">…</p>
	{:else}
		<StandaloneSelector onSelect={handleSelect} />
	{/if}
</MarginFull>
