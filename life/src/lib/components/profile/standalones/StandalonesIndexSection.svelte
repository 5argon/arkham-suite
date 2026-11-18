<!-- @component The Standalone Mode plays, one tile per scenario, split into Scenario Packs and campaign scenarios. -->
<script lang="ts">
	import { EncounterSetIcon, SectionSeparator } from '@5argon/arkham-life-ui';
	import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
	import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';
	import { NavTile, ProfilePane, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	const href = (base: string, s: StandaloneArchiveStat): string =>
		s.source === 'pack'
			? `${base}/standalones/pack/${s.scenario}`
			: `${base}/standalones/campaign/${s.catalogueCode}/${s.scenario}`;

	const detail = (s: StandaloneArchiveStat): string =>
		[
			m.campaigns_plays({ count: s.plays }),
			s.unwinnable ? '' : m.standalones_record({ won: s.won, lost: s.lost }),
			s.bestWinTier ? m.standalones_best_win_tier({ tier: s.bestWinTier }) : ''
		]
			.filter(Boolean)
			.join(' · ');
</script>

{#snippet group(title: string, stats: StandaloneArchiveStat[], base: string)}
	{#if stats.length}
		<div class="mt-6">
			<SectionSeparator {title} />
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{#each stats as s (`${s.catalogueCode}.${s.scenario}`)}
					{@const iconSet = scenarioRepresentativeSet(s.scenario)}
					<NavTile href={href(base, s)} label={s.name} detail={detail(s)}>
						{#snippet icon()}{#if iconSet}<EncounterSetIcon encounterSet={iconSet} />{/if}{/snippet}
					</NavTile>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<ProfilePane title={m.standalones_index_title()}>
	{#snippet children(data, base)}
		{@const all = data.standalones ?? []}
		{#if all.length === 0}
			<div class="mt-6"><WidgetEmpty>{m.standalones_index_empty()}</WidgetEmpty></div>
		{:else}
			{@const packs = all.filter((s) => s.source === 'pack')}
			{@const fromCampaign = all.filter((s) => s.source === 'campaign')}
			{@render group(m.standalones_index_packs({ count: packs.length }), packs, base)}
			{@render group(m.standalones_index_from_campaign({ count: fromCampaign.length }), fromCampaign, base)}
		{/if}
	{/snippet}
</ProfilePane>
