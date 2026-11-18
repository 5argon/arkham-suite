<!-- @component Campaign plays by year from their finish (or start) dates, newest first, with each play's outcome. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { campaignDisplayName } from '$lib/campaign/profile/profile-slugs';
	import type { CalendarEntry } from '$lib/profile/profile-types';
	import { CappedList, SectionLabel } from '$lib/components/profile/_primitives';
	import CampaignBadge from '$lib/components/campaign/CampaignBadge.svelte';
	import { campaignPaletteStyle } from '$lib/components/campaign/campaign-identity';

	let { calendar }: { calendar: CalendarEntry[] } = $props();

	const monthDay = (e: CalendarEntry): string =>
		e.date ? new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

	/** Newest first; undated plays last. */
	const sorted = $derived(
		[...calendar].sort((a, b) => (b.date ?? -Infinity) - (a.date ?? -Infinity))
	);

	function byYear(entries: CalendarEntry[]): [string, CalendarEntry[]][] {
		const groups = new Map<string, CalendarEntry[]>();
		for (const e of entries) {
			const y = e.date ? String(new Date(e.date).getFullYear()) : m.home_calendar_undated();
			groups.set(y, [...(groups.get(y) ?? []), e]);
		}
		return [...groups.entries()];
	}

	const stateMeta: Record<string, { label: string; cls: string }> = {
		cleared: { label: m.home_calendar_state_win(), cls: 'text-secondary-600 dark:text-secondary-400' },
		attempted: { label: m.home_calendar_state_loss(), cls: 'text-amber-600 dark:text-amber-400' },
		special: { label: m.home_calendar_state_special(), cls: 'text-purple-500' }
	};
</script>

{#snippet timeline(entries: CalendarEntry[])}
	<div class="space-y-4">
		{#each byYear(entries) as [year, plays] (year)}
			<div>
				<SectionLabel variant="heading">{year}</SectionLabel>
				<div
					class="border-primary-200 dark:border-primary-700 divide-primary-100 dark:divide-primary-800 divide-y rounded border"
				>
					{#each plays as e (e.campaignId)}
						{@const meta = e.state ? stateMeta[e.state] : null}
						{@const style = campaignPaletteStyle(e.campaignCode)}
						<!-- One line when wide; when narrow the title takes the first line and the date,
						     campaign and result share the second. -->
						<div class="@container" {style}>
							<div
								class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 px-3 py-2 text-sm @md:flex-nowrap"
							>
								<div
									class="flex min-w-0 basis-full items-center gap-2.5 @md:order-2 @md:basis-auto"
								>
									<CampaignBadge campaignCode={e.campaignCode} size="sm" />
									<span class="min-w-0 text-black @md:truncate dark:text-white">{e.title}</span>
								</div>
								<span
									class="text-primary-400 shrink-0 pl-8.5 tabular-nums @md:order-1 @md:w-12 @md:pl-0"
									>{monthDay(e)}</span
								>
								<span
									class="min-w-0 flex-1 basis-0 truncate text-xs font-semibold @md:order-3 @md:flex-initial @md:basis-auto {style
										? 'text-(--campaign-text-light) dark:text-(--campaign-text-dark)'
										: 'text-primary-400'}"
								>
									{campaignDisplayName(e.campaignCode)}
								</span>
								{#if meta}
									<span class="ml-auto shrink-0 font-semibold @md:order-4 {meta.cls}"
										>{meta.label}</span
									>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/snippet}

{#if sorted.length}
	<CappedList items={sorted} modalTitle={m.framework_label_calendar()} list={timeline} />
{/if}
