<!--
@component
Body for a per-page "customize widgets" route. Loads the database, renders the
single-pane widget editor for `pane` (+ optional `campaign` for a campaign detail
page), and saves into the database document. The Back button returns to the page
being customized (the current path minus the trailing `/customize`).
-->
<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { BackButton, BorderedContainer, Button, HelpParagraph, MarginFull, SmallPageLead, getToastContext } from '@5argon/arkham-life-ui';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { resolveProfileSettings, type PaneId } from '$lib/campaign/profile-settings';
	import PaneWidgetEditor from '$lib/components/profile/_framework/PaneWidgetEditor.svelte';

	let { pane, campaign = null, title }: { pane: PaneId; campaign?: string | null; title: string } = $props();

	// Idempotent: resolves the store's loading status on a direct visit.
	onMount(() => void ensureDatabaseLoaded());

	const initialSettings = $derived(resolveProfileSettings(databaseStore.doc?.profileSettings));
	const backHref = $derived(page.url.pathname.replace(/\/customize\/?$/, ''));

	const toast = getToastContext();
	let editor = $state<{ currentPayload(): string }>();
	function save() {
		if (!editor) return;
		databaseStore.setProfileSettings(editor.currentPayload());
		toast.success(m.framework_toast_layout_saved());
	}
</script>

<svelte:head><title>{m.framework_head_customize_title({ title })}</title></svelte:head>

<MarginFull>
	<div class="mb-4 flex items-center justify-between gap-3">
		<BackButton label={m.framework_back()} onClick={backHref} />
		{#if databaseStore.doc}
			<Button highlighted label={m.framework_save_layout()} onClick={save} />
		{/if}
	</div>
	<SmallPageLead title={m.framework_customize_title({ title })} description={m.framework_customize_description()} />

	{#if databaseStore.status === 'loading'}
		<div class="text-primary-400 flex items-center justify-center gap-2 py-16 text-sm">
			<span class="border-primary-300 dark:border-primary-600 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
			{m.framework_loading()}
		</div>
	{:else if !databaseStore.doc}
		<BorderedContainer>
			<div class="p-8"><HelpParagraph>{m.framework_no_database()}</HelpParagraph></div>
		</BorderedContainer>
	{:else}
		{#key `${pane}:${campaign ?? ''}`}
			<PaneWidgetEditor bind:this={editor} {initialSettings} {pane} {campaign} />
		{/key}
	{/if}
</MarginFull>
