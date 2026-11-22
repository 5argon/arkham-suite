<!-- @component One scenario's Standalone Mode page: its name and where it comes from, then its widget rows. -->
<script lang="ts">
	import { page } from '$app/state';
	import { EncounterSetIcon } from '@5argon/arkham-life-ui';
	import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';
	import { defaultStandaloneLayout } from '$lib/campaign/profile/profile-widgets';
	import { standaloneKey } from '$lib/campaign/standalones/define';
	import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { getProfileContext } from '$lib/components/profile/_framework/profile-context';
	import { ProfilePane } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	const ctx = getProfileContext();

	// /standalones/pack/[scenario] or /standalones/campaign/[campaign]/[scenario]
	const params = $derived(page.params as { scenario?: string; campaign?: string });
	const stat = $derived<StandaloneArchiveStat | null>(
		(ctx.payload?.standalones ?? []).find(
			(s) =>
				s.scenario === params.scenario &&
				(params.campaign ? s.catalogueCode === params.campaign : s.source === 'pack')
		) ?? null
	);
	const key = $derived(stat ? standaloneKey(stat.catalogueCode, stat.scenario) : null);
	const iconSet = $derived(stat ? scenarioRepresentativeSet(stat.scenario) : null);
</script>

<ProfilePane
	title={stat ? m.standalones_detail_title({ name: stat.name }) : m.standalones_detail_title_fallback()}
	unknown={stat ? null : m.standalones_detail_unknown()}
>
	{#snippet children(data)}
		{#if stat && key}
			<div class="mt-4 flex items-center gap-3">
				{#if iconSet}
					<span class="text-primary-600 dark:text-primary-300 text-3xl"
						><EncounterSetIcon encounterSet={iconSet} /></span
					>
				{/if}
				<div>
					<h1 class="text-xl font-bold text-black dark:text-white">{stat.name}</h1>
					<p class="text-primary-500 dark:text-primary-400 text-sm">
						{stat.source === 'pack' ? m.standalones_source_pack() : m.standalones_source_campaign()}
					</p>
				</div>
			</div>
			<ProfileWidgets
				rows={data.settings.standalones?.[key] ?? defaultStandaloneLayout(key)}
				payload={data}
				standalone={key}
			/>
		{/if}
	{/snippet}
</ProfilePane>
