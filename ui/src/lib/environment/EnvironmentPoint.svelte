<!--
@component
The point in time something speaks about. A point of the Current environment shows its rotating
expansion slots, the deckbuilding ones then the investigator ones, each filled with an abbreviation.
Anything else is just named. A point with details opens them when pressed, sitting above the link of
a row it's in. The details load on the first press, since they name every product in every
language and most visitors never open them.
-->
<script lang="ts">
	import clsx from 'clsx';
	import { tick } from 'svelte';

	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import type EnvironmentDetailModalComponent from './EnvironmentDetailModal.svelte';
	import type { EnvironmentDisplay, EnvironmentSubject } from './environment.js';

	interface Prop {
		environment: EnvironmentDisplay;
		/**
		 * What is based on this point, which the details name.
		 */
		subject?: EnvironmentSubject;
	}
	const { environment, subject = 'review' }: Prop = $props();
	const half = $derived((environment.slots?.length ?? 0) / 2);
	const pointClass =
		'text-primary-800 dark:text-primary-200 inline-flex items-center gap-1 text-xs whitespace-nowrap';
	let detailOpen = $state(false);
	let DetailModal = $state.raw<typeof EnvironmentDetailModalComponent | null>(null);

	async function openDetail() {
		if (DetailModal === null) {
			DetailModal = (await import('./EnvironmentDetailModal.svelte')).default;
			// Mounted closed first, so it opens the way it always does.
			await tick();
		}
		detailOpen = true;
	}
</script>

{#snippet point()}
	<FaIcon icon={FaIconType.Clock} />
	{#if environment.slots}
		<span class="inline-flex">
			{#each environment.slots as slot, i (i)}
				<span
					class={clsx(
						'-ml-px inline-flex h-4 w-8 items-center justify-center border text-[0.6rem] leading-none font-semibold uppercase first:ml-0',
						'border-primary-500 dark:border-primary-400',
						i === half && 'ml-1',
						slot === null
							? 'bg-primary-200/40 dark:bg-primary-900/40'
							: 'bg-primary-600 dark:bg-primary-300 dark:text-primary-950 text-white'
					)}
				>
					{slot ?? ''}
				</span>
			{/each}
		</span>
	{:else}
		{environment.label}
	{/if}
{/snippet}

{#if environment.detail}
	<button
		class={clsx(
			pointClass,
			'relative z-10 cursor-pointer hover:brightness-75 dark:hover:brightness-125'
		)}
		onclick={openDetail}
		title={environment.description}
		type="button"
	>
		{@render point()}
	</button>
	{#if DetailModal}
		<DetailModal
			detail={environment.detail}
			isOpen={detailOpen}
			onClose={() => (detailOpen = false)}
			name={environment.description}
			{subject}
		/>
	{/if}
{:else}
	<span class={pointClass} title={environment.description}>
		{@render point()}
	</span>
{/if}
