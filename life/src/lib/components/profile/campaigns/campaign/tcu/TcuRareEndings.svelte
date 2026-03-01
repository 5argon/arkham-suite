<!--
@component
TCU bespoke widget — the rare rival-faction endings of Union & Disillusion
(the Silver Twilight Lodge wins; in Return-to, the Coven wins). These are the
"special" endings: have you ever triggered them?
-->
<script lang="ts">
	import type { CampaignEndings } from '$lib/campaign/clear-status';
	import { capitalizeFirst } from '$lib/campaign/entry-text';
	import * as m from '$lib/paraglide/messages.js';

	let { endings }: { endings: CampaignEndings[] } = $props();

	const special = $derived(endings.flatMap((e) => e.endings).filter((e) => e.kind === 'special'));
</script>

{#if special.length}
	<div class="space-y-1.5">
		{#each special as e (e.key)}
			<div
				class="flex items-center gap-2 rounded border p-2 text-sm
					{e.reached
					? 'border-purple-300 dark:border-purple-700'
					: 'border-primary-200 dark:border-primary-700'}"
			>
				<span class={e.reached ? 'text-purple-500' : 'text-primary-400'}>{e.reached ? '◆' : '○'}</span>
				<span class={e.reached ? 'text-black dark:text-white' : 'text-primary-500'}>{capitalizeFirst(e.text)}</span>
				<span class="ml-auto shrink-0 text-xs {e.reached ? 'text-purple-500' : 'text-primary-400'}">
					{e.reached ? m.campaign_tcu_rare_endings_triggered() : m.campaign_tcu_rare_endings_never_seen()}
				</span>
			</div>
		{/each}
	</div>
{/if}
