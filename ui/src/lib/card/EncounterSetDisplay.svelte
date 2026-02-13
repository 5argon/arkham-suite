<script lang="ts" module>
	export type  EncounterSetFlag = "core" | "return-to" | "scenario";
</script>

<script lang="ts">
	import type { EncounterSet } from '@5argon/arkham-kohaku';
	import { EncounterSetIcon } from '@5argon/arkham-icon';
	import { u } from '@5argon/arkham-string';
	import clsx from 'clsx';

	interface Prop {
		encounterSet: EncounterSet;
		/** Optional: Show the encounter set name as text below the icon */
		showName?: boolean;
		/** Optional: Show a count badge on the icon */
		count?: number;
		flag?: EncounterSetFlag;
	}

	const { encounterSet, showName = false, count, flag }: Prop = $props();

	// Get the translated name for the encounter set
	const name = $derived(u.encounterSetName(encounterSet));

	// Map EncounterSetFlag to Tailwind color classes
	function getColorClasses(flag?: EncounterSetFlag): string {
		switch (flag) {
			case 'core':
				return 'text-survivor-800 dark:text-survivor-200';
			case 'return-to':
				return 'text-rogue-800 dark:text-rogue-200';
			case 'scenario':
				return 'text-guardian-800 dark:text-guardian-200';
			default:
				return 'text-neutral-800 dark:text-primary-200';
		}
	}
</script>

<div class="encounter-set-display-wrapper">
	<div
		class={clsx(
			'relative inline-flex h-8 w-8 items-center justify-center text-[1.5rem]',
			getColorClasses(flag)
		)}
	>
		<EncounterSetIcon {encounterSet} />
		{#if count !== undefined}
			<span class={clsx('absolute bottom-0 text-[0.6rem] font-bold', getColorClasses(flag))}>
				{count}
			</span>
		{/if}
	</div>

	{#if showName}
		<div class="encounter-set-name text-neutral-900 dark:text-neutral-100">{name}</div>
	{/if}
</div>

<style>
	.encounter-set-display-wrapper {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.encounter-set-name {
		font-size: 0.75rem;
		text-align: center;
		max-width: 100px;
	}
</style>
