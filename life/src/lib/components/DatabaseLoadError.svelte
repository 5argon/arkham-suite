<!-- @component Replaces every page when the stored database fails to load: save what is stored, then start over. -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		BorderedContainer,
		Button,
		FaIconType,
		HelpParagraph,
		PageLead
	} from '@5argon/arkham-life-ui';

	import { databaseStore } from '$lib/database/database.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let saved = $state(false);
	let busy = $state(false);

	async function save() {
		busy = true;
		try {
			saved = (await databaseStore.saveUnreadableCopy()) || saved;
		} finally {
			busy = false;
		}
	}

	async function startOver() {
		if (!confirm(m.database_load_error_start_over_confirm())) return;
		await databaseStore.discardUnreadable();
		goto('/new');
	}
</script>

<PageLead
	title={m.database_load_error_title()}
	description={m.database_load_error_body({ error: databaseStore.lastError ?? '' })}
/>

<BorderedContainer>
	<div class="flex max-w-lg flex-col gap-3 p-6">
		{#if databaseStore.hasUnreadableCopy}
			<HelpParagraph>{m.database_load_error_save_first()}</HelpParagraph>
			<div class="flex flex-wrap gap-2">
				<Button
					highlighted
					label={m.database_load_error_save()}
					icon={FaIconType.Export}
					disabled={busy}
					onClick={save}
				/>
				<Button
					danger
					label={m.database_load_error_start_over()}
					icon={FaIconType.Delete}
					disabled={!saved}
					onClick={startOver}
				/>
			</div>
			{#if saved}
				<p class="text-primary-500 dark:text-primary-400 text-sm">
					{m.database_load_error_saved()}
				</p>
			{/if}
		{:else}
			<HelpParagraph>{m.database_load_error_unavailable()}</HelpParagraph>
			<div>
				<Button
					highlighted
					label={m.database_load_error_reload()}
					onClick={() => location.reload()}
				/>
			</div>
		{/if}
	</div>
</BorderedContainer>
