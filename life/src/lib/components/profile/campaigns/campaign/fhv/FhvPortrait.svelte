<!--
@component
FHV villager portrait — a rounded square crop of a resident's campaign-log portrait
(`static/image/campaign/portrait/fhv/<id>.png`), with an initials fallback if the image
is missing. Shared by the roster spine, the dance, the finale, the per-villager widgets,
and the scenario passports so the portrait markup lives in one place. `dim` greys it out
(a resident you never engaged); `size` sets the box (a Tailwind w/h pair).
-->
<script lang="ts">
	import { portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import { fhvVillagerName } from '$lib/campaign/campaigns/fhv';

	let {
		villager,
		size = 'h-12 w-10',
		dim = false
	}: {
		villager: string;
		/** Tailwind height+width classes for the portrait box. */
		size?: string;
		/** Grey out (a resident never engaged). */
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
