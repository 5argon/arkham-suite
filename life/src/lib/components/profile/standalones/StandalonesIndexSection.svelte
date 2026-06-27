<!--
@component
The `/standalones` profile index — a player's first-class Standalone-Mode plays,
aggregated per scenario (from `payload.standalones`). Grouped into Scenario Packs vs
From Campaign; each links to its detail page. A separate dimension from campaigns.
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import { BorderedContainer, EncounterSetIcon, SectionSeparator } from '@5argon/arkham-life-ui';
	import { LOCAL_PROFILE_KEY, type LocalProfileContext } from '$lib/database/profile-local';
	import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
	import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';

	const ctx = getContext<LocalProfileContext>(LOCAL_PROFILE_KEY);
	const data = $derived(ctx.payload);
	const base = $derived(ctx.base);

	const all = $derived<StandaloneArchiveStat[]>(data?.standalones ?? []);
	const packs = $derived(all.filter((s) => s.source === 'pack'));
	const fromCampaign = $derived(all.filter((s) => s.source === 'campaign'));

	function href(s: StandaloneArchiveStat): string {
		return s.source === 'pack'
			? `${base}/standalones/pack/${s.scenario}`
			: `${base}/standalones/campaign/${s.catalogueCode}/${s.scenario}`;
	}
</script>

<svelte:head><title>Standalones</title></svelte:head>

{#snippet card(s: StandaloneArchiveStat)}
	{@const iconSet = scenarioRepresentativeSet(s.scenario)}
	<a href={href(s)} class="block">
		<BorderedContainer>
			<div class="flex items-center justify-between gap-3 p-3 transition hover:opacity-80">
				<div class="flex min-w-0 items-center gap-2">
					{#if iconSet}
						<span class="text-primary-600 dark:text-primary-300 shrink-0 text-lg leading-none">
							<EncounterSetIcon encounterSet={iconSet} />
						</span>
					{/if}
					<div class="min-w-0">
							<span class="block truncate font-medium text-black dark:text-white">{s.name}</span>
							<span class="text-primary-500 dark:text-primary-400 text-xs">
								{s.plays} play{s.plays === 1 ? '' : 's'}
								{#if !s.unwinnable} · {s.won}W / {s.lost}L{/if}
								{#if s.bestWinTier} · best win T{s.bestWinTier}{/if}
							</span>
						</div>
					</div>
					<span class="text-primary-500 dark:text-primary-400 shrink-0 text-xs">→</span>
				</div>
		</BorderedContainer>
	</a>
{/snippet}

{#if data}
	{#if all.length === 0}
		<div class="mt-6">
			<p class="text-primary-500 text-sm">
				No standalone-mode plays recorded yet. Create one from the archive with “New Standalone
				Archive”.
			</p>
		</div>
	{:else}
		{#if packs.length}
			<div class="mt-6">
				<SectionSeparator title={`Scenario Packs (${packs.length})`} />
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each packs as s (s.scenario)}{@render card(s)}{/each}
				</div>
			</div>
		{/if}
		{#if fromCampaign.length}
			<div class="mt-6">
				<SectionSeparator title={`From Campaign (${fromCampaign.length})`} />
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each fromCampaign as s (`${s.catalogueCode}.${s.scenario}`)}{@render card(s)}{/each}
				</div>
			</div>
		{/if}
	{/if}
{/if}
