<!--
@component
Error boundary wrapper for ArkhamIcon to handle rendering failures gracefully
-->
<script lang="ts">
	import { type ArkhamInlineIcon } from '@5argon/arkham-kohaku';
	import { ArkhamIcon } from '@5argon/arkham-icon';
	import { onMount } from 'svelte';

	interface Prop {
		icon: ArkhamInlineIcon;
	}

	const { icon }: Prop = $props();
	let error = $state<Error | null>(null);

	// Reset error when icon changes
	$effect(() => {
		icon;
		error = null;
	});
</script>

{#if error}
	<span class="inline-icon-error" title="Failed to load icon: {icon}">⚠️</span>
{:else}
	<ArkhamIcon {icon} />
{/if}
