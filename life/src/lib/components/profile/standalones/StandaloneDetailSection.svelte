<!--
@component
The `/standalones/.../[scenario]` detail — one scenario's lifetime Standalone-Mode
record: plays, win/loss, resolution coverage, best score (VP + Experience earned),
and the XP-RANGE of decks used to challenge it. Reads `payload.standalones`.
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { BorderedContainer, SectionSeparator } from '@5argon/arkham-life-ui';
	import { LOCAL_PROFILE_KEY, type LocalProfileContext } from '$lib/database/profile-local';
	import { resolutionLabel } from '$lib/campaign/utils/resolutions';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import { XP_TIERS } from '$lib/campaign/utils/deck-experience';
	import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';

	const ctx = getContext<LocalProfileContext>(LOCAL_PROFILE_KEY);
	const data = $derived(ctx.payload);

	// Route: /standalones/pack/[scenario] OR /standalones/campaign/[campaign]/[scenario].
	const scenario = $derived((page.params as { scenario?: string }).scenario ?? '');
	const campaign = $derived((page.params as { campaign?: string }).campaign);

	const stat = $derived<StandaloneArchiveStat | null>(
		(data?.standalones ?? []).find(
			(s) => s.scenario === scenario && (campaign ? s.catalogueCode === campaign : s.source === 'pack')
		) ?? null
	);

	const tierRows = $derived(
		stat
			? XP_TIERS.map((t) => ({ tier: t.tier, label: t.label, plays: stat.xpTierPlays[t.tier] ?? 0 })).filter(
					(r) => r.plays > 0
				)
			: []
	);
</script>

<svelte:head><title>{stat?.name ?? 'Standalone'}</title></svelte:head>

{#if data}
	{#if !stat}
		<div class="mt-6">
			<p class="text-primary-500 text-sm">No standalone play recorded for this scenario.</p>
		</div>
	{:else}
		<div class="mt-4">
			<h1 class="text-xl font-bold text-black dark:text-white">{stat.name}</h1>
			<p class="text-primary-500 dark:text-primary-400 text-sm">
				{stat.source === 'pack' ? 'Scenario Pack' : 'From Campaign'} ·
				{stat.plays} play{stat.plays === 1 ? '' : 's'}
			</p>
		</div>

		<!-- Headline stats -->
		<div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
			<BorderedContainer>
				<div class="p-3 text-center">
					<div class="text-2xl font-bold text-black dark:text-white">{stat.plays}</div>
					<div class="text-primary-500 text-xs">Plays</div>
				</div>
			</BorderedContainer>
			{#if stat.unwinnable}
				<BorderedContainer>
					<div class="p-3 text-center">
						<div class="text-sm font-semibold text-amber-600 dark:text-amber-400">Unwinnable</div>
						<div class="text-primary-500 text-xs">Survive as long as you can</div>
					</div>
				</BorderedContainer>
			{:else}
				<BorderedContainer>
					<div class="p-3 text-center">
						<div class="text-2xl font-bold text-green-600 dark:text-green-400">{stat.won}</div>
						<div class="text-primary-500 text-xs">Won</div>
					</div>
				</BorderedContainer>
				<BorderedContainer>
					<div class="p-3 text-center">
						<div class="text-2xl font-bold text-red-600 dark:text-red-400">{stat.lost}</div>
						<div class="text-primary-500 text-xs">Lost</div>
					</div>
				</BorderedContainer>
			{/if}
			<BorderedContainer>
				<div class="p-3 text-center">
					<div class="text-2xl font-bold text-black dark:text-white">
						{#if stat.victoryDisplay}
							{stat.bestVictoryDisplay ?? '—'}
						{:else}
							{stat.bestEarnedXp ?? stat.bestVictoryDisplay ?? '—'}
						{/if}
					</div>
					<div class="text-primary-500 text-xs">
						Best {stat.victoryDisplay ? 'victory display' : 'experience'}
					</div>
				</div>
			</BorderedContainer>
		</div>

		{#if stat.victoryDisplay && stat.bestEarnedXp != null}
			<p class="text-primary-500 mt-2 text-xs">Best experience earned: {stat.bestEarnedXp}</p>
		{/if}

		<!-- Resolution coverage -->
		{#if stat.resolutions.length}
			<div class="mt-6">
				<SectionSeparator title={`Resolutions reached (${stat.visited.length} / ${stat.resolutions.length})`} />
				<div class="flex flex-col gap-1">
					{#each stat.resolutions as r (r)}
						{@const t = stat.tallies[r]}
						<div class="flex items-center justify-between gap-3 text-sm">
							<span class={t ? 'text-black dark:text-white' : 'text-primary-400'}>
								{resolutionLabel(r)}
							</span>
							<span class="text-primary-500 tabular-nums text-xs">
								{#if t}
									{t.total}× ({Object.entries(t.byTier)
										.map(([tier, n]) => `${difficultyLabel(tier)} ${n}`)
										.join(', ')})
								{:else}
									—
								{/if}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- XP-range of decks used -->
		<div class="mt-6">
			<SectionSeparator title="Deck XP range used" />
			{#if tierRows.length === 0}
				<p class="text-primary-500 text-sm">No decks recorded.</p>
			{:else}
				<div class="flex flex-col gap-1">
					{#each tierRows as row (row.tier)}
						<div class="flex items-center justify-between gap-3 text-sm">
							<span class="text-black dark:text-white">
								{row.label}
								{#if stat.bestWinTier === row.tier}
									<span class="text-green-600 dark:text-green-400">· best win</span>
								{/if}
							</span>
							<span class="text-primary-500 tabular-nums text-xs">
								{row.plays} play{row.plays === 1 ? '' : 's'}
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/if}
