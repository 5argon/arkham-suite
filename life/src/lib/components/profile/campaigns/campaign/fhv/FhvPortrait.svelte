<!-- @component A villager's portrait from the campaign log sheet, with their initials when the image is missing. -->
<script lang="ts">
	import { fhvVillagerName } from '$lib/campaign/campaigns/fhv';
	import { portraitUrl } from '$lib/campaign/records/campaign-log-source';

	let {
		villager,
		size = 'h-12 w-10',
		dim = false
	}: {
		villager: string;
		/** Tailwind height and width classes. */
		size?: string;
		/** Greyed out, for a villager never engaged. */
		dim?: boolean;
	} = $props();

	let failed = $state(false);
	const name = $derived(fhvVillagerName(villager));
	const initials = $derived(
		name
			.split(/\s+/)
			.map((w) => w[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);
</script>

<div
	class="border-primary-200 dark:border-primary-700 relative shrink-0 overflow-hidden rounded border {size} {dim
		? 'opacity-40 grayscale'
		: ''}"
	title={name}
>
	{#if !failed}
		<img
			src={portraitUrl('fhv', villager)}
			alt={name}
			onerror={() => (failed = true)}
			class="h-full w-full object-cover object-top"
		/>
	{:else}
		<span
			class="text-primary-500 dark:text-primary-300 absolute inset-0 flex items-center justify-center text-xs font-semibold"
			>{initials}</span
		>
	{/if}
</div>
