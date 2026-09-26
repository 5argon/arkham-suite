<!-- @component A page's "customize widgets" screen: the layout editor for one pane, saved into the database. -->
<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { BackButton, BorderedContainer, Button, HelpParagraph, MarginFull, SmallPageLead, getToastContext } from '@5argon/arkham-life-ui';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { resolveProfileSettings, type PaneId } from '$lib/campaign/profile/profile-settings';
	import PaneWidgetEditor from '$lib/components/profile/_framework/PaneWidgetEditor.svelte';

	let { pane, campaign = null, title }: { pane: PaneId; campaign?: string | null; title: string } = $props();

	onMount(() => void ensureDatabaseLoaded());

	const initialSettings = $derived(resolveProfileSettings(databaseStore.doc?.profileSettings));
	const backHref = $derived(page.url.pathname.replace(/\/customize\/?$/, ''));
	// Only a `private` profile has a database to save into; these pages reset past the profile
	// layout, so the scope guard lives here.
	const isReadOnly = $derived((page.params as { scope?: string }).scope !== 'private');

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
		{#if databaseStore.doc && !isReadOnly}
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
	{:else if isReadOnly}
		<BorderedContainer>
			<div class="p-8"><HelpParagraph>{m.framework_customize_loaded_forbidden()}</HelpParagraph></div>
		</BorderedContainer>
	{:else}
		{#key `${pane}:${campaign ?? ''}`}
			<PaneWidgetEditor bind:this={editor} {initialSettings} {pane} {campaign} />
		{/key}
	{/if}
</MarginFull>
