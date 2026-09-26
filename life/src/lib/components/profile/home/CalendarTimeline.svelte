<!-- @component Campaign plays by year from their finish (or start) dates, with each play's outcome. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { campaignDisplayName } from '$lib/campaign/profile/profile-slugs';
	import type { CalendarEntry } from '$lib/profile/profile-types';
	import { SectionLabel } from '$lib/components/profile/_primitives';

	let { calendar }: { calendar: CalendarEntry[] } = $props();

	const monthDay = (e: CalendarEntry): string =>
		e.date ? new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

	const groups = $derived.by(() => {
		const byYear = new Map<string, CalendarEntry[]>();
		for (const e of calendar) {
			const y = e.date ? String(new Date(e.date).getFullYear()) : m.home_calendar_undated();
			byYear.set(y, [...(byYear.get(y) ?? []), e]);
		}
		return [...byYear.entries()];
	});

	const stateMeta: Record<string, { label: string; cls: string }> = {
		cleared: { label: m.home_calendar_state_win(), cls: 'text-secondary-600 dark:text-secondary-400' },
		attempted: { label: m.home_calendar_state_loss(), cls: 'text-amber-600 dark:text-amber-400' },
		special: { label: m.home_calendar_state_special(), cls: 'text-purple-500' }
	};
</script>

{#if calendar.length}
	<div class="space-y-4">
		{#each groups as [year, entries] (year)}
			<div>
				<SectionLabel variant="heading">{year}</SectionLabel>
				<div
					class="border-primary-200 dark:border-primary-700 divide-primary-100 dark:divide-primary-800 divide-y rounded border"
				>
					{#each entries as e (e.campaignId)}
						{@const meta = e.state ? stateMeta[e.state] : null}
						<div class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
							<div class="flex min-w-0 items-center gap-3">
								<span class="text-primary-400 w-12 shrink-0 tabular-nums">{monthDay(e)}</span>
								<span class="truncate text-black dark:text-white">{e.title}</span>
								<span class="text-primary-400 hidden truncate sm:inline">
									{campaignDisplayName(e.campaignCode)}
								</span>
							</div>
							{#if meta}<span class="shrink-0 font-semibold {meta.cls}">{meta.label}</span>{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
