<!--
@component
Autosave history for one campaign: the invisible snapshots taken when leaving the
editor (a global 20-slot ring — see snapshots.ts). Presentational; the page loads
the list on open and handles restore.
-->
<script lang="ts">
	import { Modal, Button, FaIconType } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import type { SnapshotMeta } from '$lib/database/snapshots';

	interface Props {
		isOpen: boolean;
		snapshots: SnapshotMeta[];
		onRestore: (id: string) => void;
		onClose: () => void;
	}
	let { isOpen, snapshots, onRestore, onClose }: Props = $props();

	function fmt(ms: number): string {
		return new Date(ms).toLocaleString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<Modal {isOpen} {onClose} title={m.archive_history_title()} maxWidth="sm">
	<div class="py-2">
		<p class="text-primary-500 dark:text-primary-400 mb-3 text-xs">{m.archive_history_help()}</p>
		{#if snapshots.length === 0}
			<p class="text-primary-500 dark:text-primary-400 text-sm">{m.archive_history_empty()}</p>
		{:else}
			<div class="flex flex-col gap-2">
				{#each snapshots as s (s.id)}
					<div
						class="bg-primary-100 dark:bg-primary-800 flex items-center justify-between gap-3 rounded p-2"
					>
						<span class="text-sm text-black dark:text-white">{fmt(s.takenAt)}</span>
						<Button
							label={m.archive_history_restore()}
							icon={FaIconType.Reset}
							onClick={() => onRestore(s.id)}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Modal>
