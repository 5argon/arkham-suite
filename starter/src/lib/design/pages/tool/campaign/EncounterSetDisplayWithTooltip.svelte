<script lang="ts">
	import type { EncounterSet } from '@5argon/arkham-kohaku';
	import { EncounterSetDisplay, HoverTooltip } from '@5argon/arkham-life-ui';
	import { u } from '@5argon/arkham-string';

	interface Prop {
		encounterSet: EncounterSet;
		flag?: 'core' | 'return-to' | 'scenario';
	}

	const { encounterSet, flag }: Prop = $props();

	let hovered = $state(false);
	let referenceElement: HTMLDivElement | null = $state(null);
	const name = $derived(u.encounterSetName(encounterSet));
</script>

<div
	bind:this={referenceElement}
	onmouseenter={() => { hovered = true; }}
	onmouseleave={() => { hovered = false; }}
	role="none"
>
	<EncounterSetDisplay {encounterSet} {flag} />
</div>

<HoverTooltip visible={hovered} {referenceElement}>
	<span class="py-1 px-1 text-xs whitespace-nowrap line-clamp-none not-italic text-primary-900 dark:text-primary-100">{name}</span>
</HoverTooltip>
