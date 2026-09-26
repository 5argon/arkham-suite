<!--
@component
A confirm / cancel question. Closing the modal counts as cancel.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button, FaIconType, Modal } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		isOpen: boolean;
		title: string;
		confirmLabel: string;
		/** A destructive action: red confirm button with a delete icon. */
		danger?: boolean;
		onConfirm: () => void;
		onCancel: () => void;
		children: Snippet;
	}
	let { isOpen, title, confirmLabel, danger = false, onConfirm, onCancel, children }: Props =
		$props();
</script>

<Modal {isOpen} onClose={onCancel} {title} maxWidth="sm">
	<div class="text-sm text-black dark:text-white">{@render children()}</div>
	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button label={m.archive_cancel()} onClick={onCancel} />
			<Button
				label={confirmLabel}
				icon={danger ? FaIconType.Delete : undefined}
				{danger}
				highlighted={!danger}
				onClick={onConfirm}
			/>
		</div>
	{/snippet}
</Modal>
