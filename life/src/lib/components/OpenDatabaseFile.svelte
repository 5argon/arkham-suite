<!-- @component Picks an `.ahlifedb` (or its plain `.json`) and opens it as the database, then navigates to `then`. -->
<script lang="ts">
	import { goto } from '$app/navigation';

	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { databaseStore } from '$lib/database/database.svelte';
	import { readDataFile } from '$lib/database/file-format';
	import * as m from '$lib/paraglide/messages.js';

	import FilePickerButton from './FilePickerButton.svelte';

	interface Props {
		then: string;
		label?: string;
		/** Confirm before replacing a database that is already open. */
		confirmReplace?: boolean;
		disabled?: boolean;
	}

	const { then, label, confirmReplace = false, disabled = false }: Props = $props();

	let busy = $state(false);
	let error = $state<string | null>(null);

	async function open(file: File) {
		if (
			confirmReplace &&
			databaseStore.hasDatabase &&
			!confirm(m.database_open_replace_confirm())
		) {
			return;
		}
		error = null;
		busy = true;
		try {
			// A storage read still in flight must not land on top of the opened file.
			await ensureDatabaseLoaded();
			await databaseStore.importDocument(await readDataFile(file));
			goto(then);
		} catch (e) {
			error = e instanceof Error ? e.message : m.database_open_error();
			busy = false;
		}
	}
</script>

<FilePickerButton
	label={label ?? m.database_open_choose_file()}
	accept=".ahlifedb,.json,application/gzip,application/json"
	disabled={disabled || busy}
	onFile={open}
/>
{#if error}
	<div
		class="mt-3 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
	>
		{error}
	</div>
{/if}
