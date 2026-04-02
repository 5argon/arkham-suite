<!--
@component
Full-screen modal with a spinner and message, used while waiting for an async operation.
Cannot be dismissed by the user – it closes when the parent sets `isOpen` to false.
-->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';

	interface Props {
		isOpen: boolean;
		message: string;
	}

	const { isOpen, message }: Props = $props();
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black/60"
		transition:fade={{ duration: 200 }}
		role="status"
		aria-live="polite"
	>
		<div class="flex flex-col items-center gap-4">
			<span class="animate-spin text-3xl text-white">
				<FaIcon icon={FaIconType.Loading} />
			</span>
			<p class="text-lg font-medium text-white">{message}</p>
		</div>
	</div>
{/if}
